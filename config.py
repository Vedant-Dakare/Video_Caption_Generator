"""Central configuration for the Video Caption Generator backend.

Keeps all paths, supported languages and defaults in one place so the Flask
app and services do not scatter magic values around the codebase.
"""
import os
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

VIDEO_DIR = os.path.join(BASE_DIR, "videos")      # uploaded source videos
AUDIO_DIR = os.path.join(BASE_DIR, "audios")      # extracted audio (wav)
CAPTION_DIR = os.path.join(BASE_DIR, "captions")  # generated .srt files
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")    # captioned videos

for _dir in (VIDEO_DIR, AUDIO_DIR, CAPTION_DIR, OUTPUT_DIR):
    os.makedirs(_dir, exist_ok=True)

DEFAULT_FFMPEG_PATH = "ffmpeg"


def _resolve_ffmpeg():
    env_path = os.environ.get("FFMPEG_PATH")
    if env_path:
        return env_path
    found = shutil.which("ffmpeg")
    return found or DEFAULT_FFMPEG_PATH


FFMPEG_PATH = _resolve_ffmpeg()

WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "base")

try:
    import torch
except Exception:  # pragma: no cover - runtime environment may not have ML deps
    torch = None

DEVICE = "cuda" if torch is not None and torch.cuda.is_available() else "cpu"

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English"},
    {"code": "hi", "name": "Hindi"},
    {"code": "mr", "name": "Marathi"},
    {"code": "es", "name": "Spanish"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "ja", "name": "Japanese"},
    {"code": "ko", "name": "Korean"},
    {"code": "zh", "name": "Chinese"},
    {"code": "it", "name": "Italian"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "ru", "name": "Russian"},
    {"code": "ta", "name": "Tamil"},
    {"code": "te", "name": "Telugu"},
    {"code": "bn", "name": "Bengali"},
    {"code": "gu", "name": "Gujarati"},
    {"code": "kn", "name": "Kannada"},
    {"code": "ml", "name": "Malayalam"},
    {"code": "pa", "name": "Punjabi"},
    {"code": "ur", "name": "Urdu"},
]

MYMEMORY_LANG_PAIR = {
    "zh": "zh-CN",  # MyMemory uses regional variants for some languages
}
