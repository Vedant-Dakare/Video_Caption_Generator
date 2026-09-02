import { useEffect, useRef, useState } from "react";
import { CloseIcon, UploadIcon, FileIcon } from "./icons.jsx";

const ACCEPTED = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
const ACCEPTED_EXT = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];
const FORMAT_LABELS = ["MP4", "MOV", "AVI", "MKV", "WEBM"];

function sizeLabel(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function validate(file) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXT.includes(ext)) {
    return `"${ext}" is not supported. Try ${FORMAT_LABELS.join(", ")}.`;
  }
  if (!ACCEPTED.includes(file.type) && file.type !== "") {
    return `"${file.type}" is not a supported video type.`;
  }
  if (file.size > 500 * 1024 * 1024) {
    return "File exceeds the 500 MB limit.";
  }
  return null;
}

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

  /* ---- Upload Zone (empty state) ---- */
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
            group relative flex cursor-pointer flex-col items-center justify-center
            gap-5 rounded-3xl border-2 border-dashed px-6 py-14 text-center
            transition-all duration-300 ease-out-expo
            ${dragOver
              ? "border-accent-400 bg-accent-500/[0.08] scale-[1.01] shadow-glow-sm"
              : "border-white/[0.08] bg-white/[0.015] hover:border-white/[0.15] hover:bg-white/[0.03]"
            }
          `}
        >
          {/* Ambient glow behind icon */}
          <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-3xl" />
          </div>

          {/* Upload icon */}
          <div className={`
            relative grid h-16 w-16 place-items-center rounded-2xl
            transition-all duration-300
            ${dragOver
              ? "bg-accent-500/20 text-accent-300 scale-110"
              : "bg-white/[0.05] text-slate-400 group-hover:bg-accent-500/10 group-hover:text-accent-400"
            }
          `}>
            <UploadIcon className="h-7 w-7" />
          </div>

          {/* Text */}
          <div className="relative">
            <p className="font-display text-lg font-semibold text-white">
              {dragOver ? "Release to upload" : "Drop your video here"}
            </p>
            <p className="mt-1.5 text-sm text-slate-400">
              or{" "}
              <span className="font-medium text-accent-400 underline underline-offset-2 decoration-accent-400/30 group-hover:decoration-accent-400/60 transition-colors">
                browse files
              </span>
            </p>
          </div>

          {/* Format badges */}
          <div className="relative flex flex-wrap items-center justify-center gap-1.5">
            {FORMAT_LABELS.map((f) => (
              <span
                key={f}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[10px] font-medium text-slate-500"
              >
                {f}
              </span>
            ))}
            <span className="mx-1 text-slate-600">·</span>
            <span className="text-[10px] text-slate-600">up to 500 MB</span>
          </div>

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

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral animate-fade-up">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  /* ---- Video Preview (file selected) ---- */
  return (
    <div className="animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-1">
        {/* Video */}
        <div className="relative bg-black/80">
          <video
            src={video.url}
            controls
            playsInline
            className="aspect-video w-full object-contain"
          />
          {/* Subtle film-frame top/bottom lines */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-surface-2/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
              <FileIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{video.name}</p>
              <p className="text-xs text-slate-500 font-mono">
                {sizeLabel(video.size)}
                {video.duration && ` · ${video.duration}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              aria-label="Remove video"
              className="btn-sm text-coral hover:text-coral hover:bg-coral/10 hover:border-coral/20"
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
        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="h-0.5 w-full bg-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-accent-400 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

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

      {error && (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral animate-fade-up">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
