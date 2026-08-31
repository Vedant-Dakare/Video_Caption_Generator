import subprocess
import os


def burn_captions(video_path, srt_path, output_path, ffmpeg_path):
    video_full = os.path.abspath(video_path)
    srt_full = os.path.abspath(srt_path)
    output_full = os.path.abspath(output_path)

    srt_filter_path = srt_full.replace("\\", "/").replace(":", "\\:")

    command = [
        ffmpeg_path,
        "-i", video_full,
        "-vf", f"subtitles='{srt_filter_path}'",
        "-c:a", "copy",
        "-y",
        output_full
    ]

    print("Running FFmpeg...")
    print("Video:", video_full)
    print("SRT:", srt_full)
    print("Output:", output_full)

    try:
        subprocess.run(command, check=True)
        print(f"Captions burned successfully into {output_full}")

    except subprocess.CalledProcessError as e:
        print(f"Error occurred while burning captions: {e}")


if __name__ == "__main__":

    ffmpeg_path = r"D:\Downloads\ffmpeg-2026-08-27-git-a6f573a1db-essentials_build\ffmpeg-2026-08-27-git-a6f573a1db-essentials_build\bin\ffmpeg.exe"

    video_file = "videos/Impostor_Syndrome.mp4"

    srt_file = "captions/Impostor_Syndrome.srt"

    output_file = "videos/Impostor_Syndrome_with_captions.mp4"

    burn_captions(
        video_file,
        srt_file,
        output_file,
        ffmpeg_path
    )