"""
    extract_audio_from_video  -> extract_audio.py
    transcribe                -> transcribe_audio.py
    convert_to_srt            -> generate_srt.py
    burn_captions             -> burn_caption.py
"""
import logging
import os

from config import (
    AUDIO_DIR,
    CAPTION_DIR,
    FFMPEG_PATH,
    OUTPUT_DIR,
    VIDEO_DIR,
    WHISPER_MODEL,
)

from extract_audio import extract_audio_from_video
from transcribe_audio import transcribe
from generate_srt import convert_to_srt
from burn_caption import burn_captions

from services import errors
from services.progress import job_store
from services.translator import get_translator

logger = logging.getLogger(__name__)

STAGES = (
    "Extracting Audio",
    "Detecting Language",
    "Transcribing",
    "Translating",
    "Generating Subtitles",
    "Burning Captions",
    "Finalizing",
)

MAX_SEGMENTS_FOR_TRANSLATION = 400 


def _user_message(exc):
    if isinstance(exc, errors.BackendError):
        return str(exc)
    return "Unexpected error while processing the video."


def _run_transcription(job_id, audio_path):
    job_store.set_stage(job_id, "Detecting Language",
                        "Detecting spoken language...")
    job_store.set_stage(job_id, "Transcribing",
                        "Transcribing audio with Whisper...")
    try:
        result = transcribe(audio_path)
    except Exception as exc:  
        logger.exception("Whisper transcription failed for %s", audio_path)
        raise errors.TranscriptionError(
            "Whisper could not transcribe the audio. "
            "Please try another video."
        ) from exc
    return result


def _same_language_srt(job_id, result, source_code, base_name):
    srt_content = convert_to_srt(result)
    srt_file = f"{base_name}_{source_code}.srt"
    srt_path = os.path.join(CAPTION_DIR, srt_file)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_content)
    job_store.set_language(
        job_id, source_code,
        status="ok", srt=srt_file, error=None,
    )
    return srt_file


def _translated_srt(job_id, result, target_code, source_code, base_name):
    translator = get_translator()
    original_segments = result["segments"][:MAX_SEGMENTS_FOR_TRANSLATION]

    translated_segments = []
    for i, seg in enumerate(original_segments):
        text = (seg.get("text") or "").strip()
        if text:
            translated = translator.translate(text, source_code, target_code)
        else:
            translated = ""
        translated_segments.append({**seg, "text": translated})
        if (i + 1) % 20 == 0:
            job_store.set_stage(
                job_id, "Translating",
                f"Translating to {target_code} ({i + 1}/{len(original_segments)})",
            )

    srt_content = convert_to_srt({"segments": translated_segments})
    srt_file = f"{base_name}_{target_code}.srt"
    srt_path = os.path.join(CAPTION_DIR, srt_file)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_content)
    return srt_file


def _generate_languages(job_id, result, source_code, target_codes, base_name):
    for code in target_codes:
        try:
            if code == source_code:
                job_store.set_stage(job_id, "Generating Subtitles",
                                    f"Creating {code} subtitles...")
                srt_file = _same_language_srt(job_id, result, source_code, base_name)
            else:
                job_store.set_stage(job_id, "Translating",
                                    f"Translating to {code}...")
                srt_file = _translated_srt(
                    job_id, result, code, source_code, base_name,
                )
                job_store.set_language(
                    job_id, code, status="ok", srt=srt_file, error=None,
                )
        except Exception as exc:  # translation failure must not kill the job
            logger.exception("Failed to generate %s subtitles", code)
            job_store.set_language(
                job_id, code,
                status="error", srt=None,
                error=_user_message(exc),
            )


def _run_burn(job_id, video_path, burn_code, base_name):
    lang = job_store.get(job_id)["languages"].get(burn_code)
    if not lang or lang.get("status") != "ok" or not lang.get("srt"):
        job_store.set_burn(
            job_id, status="error",
            error=f"Subtitles for '{burn_code}' were not generated, so "
                  "the video could not be captioned.",
        )
        return

    srt_path = os.path.join(CAPTION_DIR, lang["srt"])
    output_file = f"{base_name}_{burn_code}_captioned.mp4"
    output_path = os.path.join(OUTPUT_DIR, output_file)

    job_store.set_stage(job_id, "Burning Captions",
                        f"Burning {burn_code} captions into video...")
    try:
        burn_captions(video_path, srt_path, output_path, FFMPEG_PATH)
    except Exception as exc:
        logger.exception("FFmpeg burn failed")
        job_store.set_burn(
            job_id, status="error",
            error="Unable to generate the captioned video. "
                  "Please try again or use another video.",
        )
        return

    if not os.path.exists(output_path):
        job_store.set_burn(
            job_id, status="error",
            error="The captioned video was not produced by FFmpeg.",
        )
        return

    job_store.set_burn(job_id, status="ok", video=output_file, error=None)


def run_job(job_id, request):
    video_filename = request["video_filename"]
    base_name = os.path.splitext(video_filename)[0]
    video_path = os.path.join(VIDEO_DIR, video_filename)
    source_language = request.get("source_language")
    target_codes = request["languages"]
    burn_code = request.get("burn")

    try:
        job_store.set_stage(job_id, "Extracting Audio",
                            "Extracting audio from video...")
        audio_filename = f"{base_name}.wav"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        try:
            extract_audio_from_video(video_path, audio_path)
        except Exception as exc:
            logger.exception("Audio extraction failed")
            raise errors.AudioExtractionError(
                "Could not extract audio from this video."
            ) from exc

        if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
            raise errors.AudioExtractionError(
                "No usable audio track was found in the video."
            )

        result = _run_transcription(job_id, audio_path)

        source_code = (result.get("language") or "").lower()

        job_store.set(job_id, detected_language=source_code)
        logger.info("Detected spoken language: %s", source_code)

        #Generate one SRT per selected language.
        _generate_languages(job_id, result, source_code, target_codes, base_name)

        # Burn the single selected language into the video.
        if burn_code:
            _run_burn(job_id, video_path, burn_code, base_name)

        job_store.set_stage(job_id, "Finalizing", "Finalizing...")

        langs = job_store.get(job_id)["languages"]
        any_ok = any(v.get("status") == "ok" for v in langs.values())
        burn_ok = job_store.get(job_id)["burn"].get("status") == "ok"

        if not any_ok and not burn_ok:
            job_store.complete(job_id, status="error",
                               error="No subtitles or captioned video could "
                                     "be generated.")
        else:
            job_store.complete(job_id, status="completed")

    except errors.BackendError as exc:
        logger.exception("Job failed for %s", video_filename)
        job_store.complete(job_id, status="error", error=str(exc))
    except Exception as exc:  # unexpected error - do not lose the job
        logger.exception("Unexpected job failure")
        job_store.complete(job_id, status="error",
                           error=_user_message(exc))
