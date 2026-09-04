import { useRef, useState } from "react";
import { UploadIcon, FileIcon, CloseIcon, PlayIcon } from "./icons.jsx";

const ACCEPTED = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
const ACCEPTED_EXT = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];
const FORMAT_LABELS = ["MP4", "MOV", "AVI", "MKV", "WEBM", "M4V"];

function sizeLabel(bytes) {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function extOf(name) {
  return (name?.slice(name.lastIndexOf(".")) || "").toUpperCase();
}

function validate(file) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXT.includes(ext)) {
    return `Format not supported. Accepted: ${FORMAT_LABELS.join(", ")}`;
  }
  if (!ACCEPTED.includes(file.type) && file.type !== "") {
    return `This video type isn't supported. Please try another format.`;
  }
  if (file.size > 500 * 1024 * 1024) {
    return "Video must be under 500 MB.";
  }
  return null;
}

const FRAME_TICKS = Array.from({ length: 24 });

export default function VideoUploader({ video, onVideoChange, onUpload, uploadProgress }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const dragCount = useRef(0);

  const handleFile = async (file) => {
    if (!file) return;
    const problem = validate(file);
    if (problem) {
      setError(problem);
      onVideoChange(null);
      return;
    }
    setError(null);
    const local = { name: file.name, size: file.size, url: URL.createObjectURL(file) };
    onVideoChange(local);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e?.response?.data?.error || "Upload failed. Is the backend running?");
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    dragCount.current++;
    setDragOver(true);
  };
  const onDragOver = (e) => { e.preventDefault(); };
  const onDragLeave = (e) => {
    e.preventDefault();
    dragCount.current--;
    if (dragCount.current === 0) setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    dragCount.current = 0;
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  };

  const uploading = uploadProgress !== null && uploadProgress < 100;

  /* ======================= EMPTY / DROP ZONE ======================= */
  if (!video) {
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a video file"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative cursor-pointer overflow-hidden
            border transition-all duration-300
            ${dragOver
              ? "border-accent/50 bg-surface-1"
              : "border-warm-700 border-dashed bg-surface-1 hover:border-warm-600 hover:bg-surface-2"
            }
          `}
        >
          {/* Top: timecode-style header */}
          <div className="flex items-center justify-between border-b border-warm-700/60 px-5 py-2.5">
            <span className="mono-label text-warm-400">SOURCE // NEW PROJECT</span>
            <span className="mono-label text-warm-500">00:00:00:00</span>
          </div>

          {/* Center body */}
          <div className="px-8 py-14 text-center">
            <div
              className={`mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-md border transition-all duration-300 ${
                dragOver
                  ? "border-accent/40 bg-accent/5 text-accent"
                  : "border-warm-700 bg-surface-2 text-warm-400"
              }`}
            >
              <UploadIcon className="h-5 w-5" />
            </div>

            <p className={`font-display text-lg font-semibold text-warm-100 mb-1.5 transition-colors ${dragOver ? "text-accent" : ""}`}>
              {dragOver ? "Release to drop" : "Drop a video here"}
            </p>
            <p className="text-sm text-warm-400 mb-6">
              or{" "}
              <span className="text-accent underline underline-offset-4 decoration-accent/40 font-medium">
                browse files
              </span>
            </p>

            {/* Format strip */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {FORMAT_LABELS.map((f) => (
                <span
                  key={f}
                  className={`rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide ${
                    dragOver
                      ? "border-accent/30 text-accent/80"
                      : "border-warm-700 text-warm-400"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mono-label mt-4 text-warm-500">MAX 500 MB</p>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className="mt-3 flex items-start gap-2.5 rounded-md border border-coral/30 bg-coral/[0.06] px-4 py-3 text-sm text-coral-light animate-fade-up">
            <span className="mt-0.5">!</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,.m4v,video/*"
          className="hidden"
          aria-hidden="true"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  /* ======================= FILE SELECTED / PREVIEW ======================= */
  const ext = extOf(video.name);

  return (
    <div className="animate-fade-up">
      {/* Media frame */}
      <figure className="relative border border-warm-700 bg-black overflow-hidden">
        {/* Top timecode bar */}
        <div className="flex items-center justify-between border-b border-warm-700/60 bg-surface-1 px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="h-3.5 w-3.5 text-warm-400 shrink-0" />
            <span className="truncate font-mono text-xs text-warm-200">{video.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="mono-label text-warm-500">{ext || "MEDIA"}</span>
          </div>
        </div>

        {/* Video player */}
        <div className="relative aspect-video bg-black">
          {video.url ? (
            <video
              src={video.url}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-warm-500">
              <PlayIcon className="h-8 w-8" />
            </div>
          )}
          {/* Frame markers overlay - subtle */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-3 items-end justify-between px-3 opacity-40" aria-hidden="true">
            {FRAME_TICKS.map((_, i) => (
              <span key={i} className="w-px bg-warm-100/20" style={{ height: i % 4 === 0 ? "100%" : "55%" }} />
            ))}
          </div>
        </div>

        {/* Bottom metadata strip */}
        <div className="border-t border-warm-700/60 bg-surface-1 px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-medium text-warm-200 truncate max-w-[180px] sm:max-w-none">
                  {video.name}
                </p>
              </div>
              <span className="mono-label text-warm-500">{sizeLabel(video.size)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-sm text-warm-300"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                aria-label="Remove video"
                className="p-1.5 rounded-sm border border-warm-700 text-warm-400 hover:bg-coral/10 hover:border-coral/30 hover:text-coral-light transition-all"
                onClick={() => {
                  onVideoChange(null);
                  setError(null);
                }}
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="mono-label text-warm-400">UPLOADING</span>
                <span className="mono-label text-accent">{uploadProgress}%</span>
              </div>
              <div className="h-1 w-full bg-warm-700">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </figure>

      {error && (
        <div className="mt-3 flex items-start gap-2.5 rounded-md border border-coral/30 bg-coral/[0.06] px-4 py-3 text-sm text-coral-light animate-fade-up">
          <span className="mt-0.5">!</span>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.avi,.mkv,.webm,.m4v,video/*"
        className="hidden"
        aria-hidden="true"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
