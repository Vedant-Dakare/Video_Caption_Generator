"""Domain errors shared across the backend services."""


class BackendError(Exception):
    """Base class for expected, user-facing backend failures."""


class AudioExtractionError(BackendError):
    """Raised when audio cannot be extracted from the uploaded video."""


class TranscriptionError(BackendError):
    """Raised when Whisper fails to transcribe the audio."""


class SubtitleError(BackendError):
    """Raised when an SRT file cannot be generated."""


class BurnError(BackendError):
    """Raised when FFmpeg fails to burn captions into the video."""
