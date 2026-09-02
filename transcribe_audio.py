try:
    import whisper
except Exception as exc:  # pragma: no cover - dependency is installed in the app env
    whisper = None
    _WHISPER_IMPORT_ERROR = exc
else:
    _WHISPER_IMPORT_ERROR = None


def transcribe(audio_path):
    if whisper is None:
        raise RuntimeError(
            "Whisper is not installed in this environment. Activate myenv and run: "
            "python -m pip install -r requirements.txt"
        ) from _WHISPER_IMPORT_ERROR

    model = whisper.load_model("base")
    result = model.transcribe(audio_path)

    print(f"Transcription: {result['text']}")

    return result


if __name__ == "__main__":
    audio_file_path = "audios/Impostor_Syndrome.wav"
    transcribe(audio_file_path)