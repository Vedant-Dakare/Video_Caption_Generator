
import threading
import uuid
from datetime import datetime, timezone


class JobStore:

    def __init__(self):
        self._lock = threading.Lock()
        self._jobs = {}

    def create_job(self, video_filename):
        """Register a new job and return its id."""
        job_id = uuid.uuid4().hex[:16]
        now = datetime.now(timezone.utc).isoformat()
        with self._lock:
            self._jobs[job_id] = {
                "id": job_id,
                "video_filename": video_filename,
                "status": "queued",  # queued | processing | completed | error
                "stage": "Queued",
                "message": "Job queued.",
                "detected_language": None,
                "languages": {},     # code -> {"status", "srt", "error"}
                "burn": {},          # {"status", "video", "error"}
                "created_at": now,
                "error": None,
            }
        return job_id

    def get(self, job_id):
        with self._lock:
            job = self._jobs.get(job_id)
            return dict(job) if job else None

    def set(self, job_id, **updates):
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            job.update(updates)

    def set_stage(self, job_id, stage, message):
        self.set(job_id, stage=stage, message=message,
                 status="processing")

    def set_language(self, job_id, code, **fields):
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            langs = job.get("languages")
            if not isinstance(langs, dict):
                langs = {}
                job["languages"] = langs
            entry = langs.get(code)
            if not isinstance(entry, dict):
                entry = {}
                langs[code] = entry
            entry.update(fields)

    def set_burn(self, job_id, **fields):
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            burn = job.get("burn")
            if not isinstance(burn, dict):
                burn = {}
                job["burn"] = burn
            burn.update(fields)

    def complete(self, job_id, status="completed", error=None):
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            job["status"] = status
            if error is not None:
                job["error"] = error
            job.setdefault("completed_at", datetime.now(timezone.utc).isoformat())

    def prune(self, max_age_hours=6):
        import time
        cutoff = time.time() - max_age_hours * 3600
        with self._lock:
            for job_id, job in list(self._jobs.items()):
                if job["status"] in ("completed", "error"):
                    self._jobs.pop(job_id, None)


job_store = JobStore()
