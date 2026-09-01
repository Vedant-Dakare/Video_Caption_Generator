"""
    GET  /api/languages        -> supported spoken/subtitle languages
    POST /api/upload           -> save an uploaded video (multipart)
    POST /api/process          -> start a background processing job
    GET  /api/status/<id>      -> poll job progress/results
    GET  /api/download/<file>  -> download an SRT or captioned video
    GET  /api/preview/<file>   -> stream a captioned video for in-browser preview

Processing runs in a background thread and the UI polls status, so long
Whisper/FFmpeg jobs don't block the request and don't time out the browser.
"""
import logging
import os
import threading
import urllib.parse

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import (
    AUDIO_DIR,
    CAPTION_DIR,
    FFMPEG_PATH,
    OUTPUT_DIR,
    SUPPORTED_LANGUAGES,
    VIDEO_DIR,
    WHISPER_MODEL,
)
from services.pipeline import run_job
from services.progress import job_store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

_CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
CORS(app, resources={r"/api/*": {"origins": _CORS_ORIGINS.split(",")}})

# Maximum upload size
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


def _allowed(filename):
    _, ext = os.path.splitext(filename or "")
    return ext.lower() in ALLOWED_EXTENSIONS


def _safe_filename(original_name):
    """Return a secure, URL-safe base name derived from the original upload."""
    name = os.path.basename(original_name or "")
    name = secure_filename(name)
    if not name:
        raise ValueError("Invalid filename.")
    root, ext = os.path.splitext(name)
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported video format.")
    return root, ext


def _serve_from(directory, filename, as_attachment, mimetype=None):
    if not filename or "\\" in filename or "/" in filename:
        return jsonify({"error": "Invalid filename."}), 400
    safe = secure_filename(filename)
    full = os.path.realpath(os.path.join(directory, safe))
    base = os.path.realpath(directory)
    if not full.startswith(base + os.sep):
        return jsonify({"error": "Invalid filename."}), 400
    if not os.path.isfile(full):
        return jsonify({"error": "File not found."}), 404
    return send_from_directory(
        directory, safe, as_attachment=as_attachment, mimetype=mimetype
    )


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "whisper_model": WHISPER_MODEL,
        "device": _device_name(),
        "ffmpeg": os.path.exists(FFMPEG_PATH) if os.path.exists(FFMPEG_PATH) else None,
        "ffmpeg_path": FFMPEG_PATH,
    })


def _device_name():
    try:
        import torch
        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        return "cpu"


@app.route("/api/languages", methods=["GET"])
def languages():
    return jsonify({"languages": SUPPORTED_LANGUAGES})


@app.route("/api/upload", methods=["POST"])
def upload():
    if "video" not in request.files:
        return jsonify({"error": "No video file was provided."}), 400

    file = request.files["video"]
    if not file or not file.filename:
        return jsonify({"error": "No video file was provided."}), 400

    try:
        root, ext = _safe_filename(file.filename)
    except ValueError as exc:
        return jsonify({
            "error": str(exc),
            "allowed": sorted(ALLOWED_EXTENSIONS),
        }), 400

    dest_path = os.path.join(VIDEO_DIR, root + ext)
    try:
        file.save(dest_path)
    except Exception:
        logger.exception("Failed to save uploaded file")
        return jsonify({"error": "Could not save the uploaded file."}), 500

    size = os.path.getsize(dest_path)
    return jsonify({
        "filename": root + ext,
        "name": root,
        "size": size,
        "size_mb": round(size / (1024 * 1024), 2),
    }), 201


@app.route("/api/process", methods=["POST"])
def process():
    data = request.get_json(silent=True) or {}
    video_filename = data.get("video_filename", "")
    languages = data.get("languages", [])
    burn = data.get("burn")
    source_language = data.get("source_language")

    if not video_filename or not _allowed(video_filename):
        return jsonify({"error": "A valid video filename is required."}), 400

    video_path = os.path.join(VIDEO_DIR, video_filename)
    if not os.path.isfile(video_path):
        return jsonify({"error": "Uploaded video not found. Please re-upload."}), 404

    valid_codes = {lang["code"] for lang in SUPPORTED_LANGUAGES}
    if not isinstance(languages, list) or not languages:
        return jsonify({"error": "Select at least one subtitle language."}), 400

    languages = [c for c in dict.fromkeys(languages) if c in valid_codes]
    if not languages:
        return jsonify({"error": "Select at least one supported subtitle language."}), 400

    if burn and burn not in languages:
        return jsonify({
            "error": "The burn-into-video language must be one of the "
                     "selected subtitle languages.",
        }), 400

    job_id = job_store.create_job(video_filename)
    request_payload = {
        "video_filename": video_filename,
        "source_language": source_language,
        "languages": languages,
        "burn": burn,
    }

    thread = threading.Thread(
        target=run_job, args=(job_id, request_payload), daemon=True
    )
    thread.start()

    return jsonify({"job_id": job_id}), 202


@app.route("/api/status/<job_id>", methods=["GET"])
def status(job_id):
    job = job_store.get(job_id)
    if job is None:
        return jsonify({"error": "Job not found."}), 404

    for code, lang in job.get("languages", {}).items():
        if lang.get("srt"):
            lang["srt_url"] = (
                request.url_root.rstrip("/") + "/api/download/" + urllib.parse.quote(lang["srt"])
            )
        else:
            lang["srt_url"] = None

    burn = job.get("burn") or {}
    if burn.get("video"):
        burn["video_url"] = (
            request.url_root.rstrip("/") + "/api/download/" + urllib.parse.quote(burn["video"])
        )
        burn["preview_url"] = (
            request.url_root.rstrip("/") + "/api/preview/" + urllib.parse.quote(burn["video"])
        )
    else:
        burn["video_url"] = None
        burn["preview_url"] = None
    job["burn"] = burn

    status_code = 200
    if job["status"] == "error":
        status_code = 200  # not found/404 reserved for missing job
    return jsonify(job), status_code


@app.route("/api/download/<path:filename>", methods=["GET"])
def download(filename):
    safe = urllib.parse.unquote(filename)
    _, ext = os.path.splitext(safe)
    if ext.lower() == ".srt":
        return _serve_from(
            CAPTION_DIR, safe, as_attachment=True, mimetype="application/x-subrip"
        )
    if ext.lower() == ".mp4":
        return _serve_from(OUTPUT_DIR, safe, as_attachment=True, mimetype="video/mp4")
    return jsonify({"error": "Unsupported download type."}), 400


@app.route("/api/preview/<path:filename>", methods=["GET"])
def preview(filename):
    safe = urllib.parse.unquote(filename)
    if not safe.lower().endswith(".mp4"):
        return jsonify({"error": "Only MP4 videos can be previewed."}), 400
    full = os.path.realpath(os.path.join(OUTPUT_DIR, safe))
    base = os.path.realpath(OUTPUT_DIR)
    if not full.startswith(base + os.sep) or not os.path.isfile(full):
        return jsonify({"error": "File not found."}), 404
    return send_file(full, mimetype="video/mp4", conditional=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug, threaded=True,
            use_reloader=False)
