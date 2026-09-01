try:
    import whisper
except Exception as exc:  # pragma: no cover - dependency is installed in the app env
    whisper = None
    _WHISPER_IMPORT_ERROR = exc
else:
    _WHISPER_IMPORT_ERROR = None

import srt
import os
from datetime import timedelta


def transcribe(audio_path):
    if whisper is None:
        raise RuntimeError(
            "Whisper is not installed in this environment. Activate myenv and run: "
            "python -m pip install -r requirements.txt"
        ) from _WHISPER_IMPORT_ERROR

    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    return result


def convert_to_srt(transcription_result):
    segments = transcription_result["segments"]
    subtitles = []

    for i, seg in enumerate(segments):
        subtitle = srt.Subtitle(
            index=i + 1,
            start=timedelta(seconds=seg["start"]),
            end=timedelta(seconds=seg["end"]),
            content=seg["text"].strip()
        )

        subtitles.append(subtitle)

    return srt.compose(subtitles)


if __name__ == "__main__":
    audio_file = "audios/Impostor_Syndrome.wav"

    result = transcribe(audio_file)

    srt_content = convert_to_srt(result)


    os.makedirs("captions", exist_ok=True)

    audio_name = os.path.splitext(os.path.basename(audio_file))[0]

    caption_file = os.path.join("captions", audio_name + ".srt")

    with open(caption_file, "w", encoding="utf-8") as f:
        f.write(srt_content)

    print(f"SRT file generated successfully: {caption_file}")