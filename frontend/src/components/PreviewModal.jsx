import { useEffect } from "react";
import { CloseIcon } from "./icons.jsx";

export default function PreviewModal({ src, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video preview"
    >
      <div
        className="relative w-full max-w-5xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute -top-12 right-0 sm:top-0 sm:-right-12 z-10 grid h-9 w-9 place-items-center rounded-sm bg-surface-1 text-warm-300 border border-warm-700 transition-all duration-200 hover:bg-surface-3 hover:text-warm-100"
          onClick={onClose}
          aria-label="Close preview"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* Title / timecode bar */}
        <div className="mb-2.5 flex items-center justify-between px-1">
          <span className="truncate text-xs font-mono text-warm-300">{title}</span>
          <span className="mono-label text-warm-500">PREVIEW</span>
        </div>

        {/* Video frame */}
        <figure className="overflow-hidden border border-warm-700 bg-black">
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full object-contain"
          />
        </figure>
      </div>
    </div>
  );
}
