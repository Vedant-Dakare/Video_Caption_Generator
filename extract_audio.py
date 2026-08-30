from moviepy.editor import VideoFileClip
import os

def extract_audio_from_video(video_path, output_audio_path):
    try:
        video = VideoFileClip(video_path)
        audio = video.audio
        if audio:
            audio.write_audiofile(output_audio_path)
            print(f"Audio extracted and saved to {output_audio_path}")
        else:
            print("No audio track found in the video.")
    except Exception as e:
        print(f"An error occurred while extracting audio: {e}")

if __name__ == "__main__":
    video_path = "videos/Impostor_Syndrome.mp4"
    audio_output_path = "audios/Impostor_Syndrome.wav"

    os.makedirs(os.path.dirname(audio_output_path),exist_ok=True)

    extract_audio_from_video(video_path, audio_output_path)