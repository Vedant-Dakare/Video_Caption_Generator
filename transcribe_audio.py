import whisper


def transcribe(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)

    print(f"Transcription: {result['text']}")

    return result


if __name__ == "__main__":
    audio_file_path = "audios/Impostor_Syndrome.wav"
    transcribe(audio_file_path)