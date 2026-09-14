import { useRef, useState } from "react";
import { UploadIcon, FileIcon, CloseIcon, PlayIcon, AlertIcon } from "./icons.jsx";

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
      <div className="space-y-3">
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
            group relative cursor-pointer overflow-hidden rounded-xl
            border-2 border-dashed transition-all duration-300 ease-out-expo
            ${dragOver
              ? "scale-[1.01] border-accent bg-accent/[0.08] shadow-elevated"
              : "border-border bg-muted/50 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-background hover:shadow-elevated"
            }
          `}
        >
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-2.5">
            <span className="mono-label">SOURCE // NEW PROJECT</span>
            <span className="font-mono text-[11px] text-muted-soft">00:00:00:00</span>
          </div>

          <div className="px-6 py-10 text-center sm:py-12">
            <div
              className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border shadow-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-elevated ${
                dragOver
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              <UploadIcon className="h-5 w-5" />
            </div>

            <p className="mb-1.5 font-display text-lg font-semibold text-foreground">
              {dragOver ? "Release to drop" : "Drop a video here"}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              or{" "}
              <span className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4">
                browse files
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {FORMAT_LABELS.map((f) => (
                <span
                  key={f}
                  className={`rounded-md border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide transition-colors ${
                    dragOver
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mono-label mt-3 !text-muted-soft">MAX 500 MB</p>
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

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <span className="leading-relaxed text-foreground">{error}</span>
          </div>
        )}
      </div>
    );
  }

  /* ======================= FILE SELECTED / PREVIEW ======================= */
  const ext = extOf(video.name);

  return (
    <div className="animate-fade-up space-y-3">
      <figure className="overflow-hidden rounded-xl border border-border bg-background shadow-subtle">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/60 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs text-foreground">{video.name}</span>
          </div>
          <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            {ext?.replace(".", "") || "MEDIA"}
          </span>
        </div>

        <div className="relative aspect-video bg-black">
          {video.url ? (
            <video
              src={video.url}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/70">
              <PlayIcon className="h-8 w-8" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-3 items-end justify-between px-3 opacity-30" aria-hidden="true">
            {FRAME_TICKS.map((_, i) => (
              <span key={i} className="w-px bg-white/40" style={{ height: i % 4 === 0 ? "100%" : "55%" }} />
            ))}
          </div>
        </div>

        <div className="border-t border-border/70 bg-muted/40 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <p className="max-w-[180px] truncate text-xs font-medium text-muted-foreground sm:max-w-none">
                {video.name}
              </p>
              <span className="shrink-0 font-mono text-[11px] text-muted-soft">{sizeLabel(video.size)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-sm min-h-[40px] px-4"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                aria-label="Remove video"
                className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:border-coral/40 hover:bg-coral/10 hover:text-coral"
                onClick={() => {
                  onVideoChange(null);
                  setError(null);
                }}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="border-t border-border/70 px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="mono-label">UPLOADING</span>
              <span className="font-mono text-[11px] font-semibold text-foreground">{uploadProgress}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden="true" />
            </div>
          </div>
        )}
      </figure>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
          <span className="leading-relaxed text-foreground">{error}</span>
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
