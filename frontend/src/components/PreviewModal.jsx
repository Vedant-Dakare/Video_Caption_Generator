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
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video preview"
    >
      <div
        className="relative w-full max-w-5xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -top-12 right-0 z-10 grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-px hover:bg-white/20 sm:-right-12 sm:top-0"
          onClick={onClose}
          aria-label="Close preview"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
          <span className="truncate font-mono text-xs text-white/90">{title}</span>
          <span className="shrink-0 font-mono text-[11px] tracking-wide text-white/60">PREVIEW</span>
        </div>

        <figure className="overflow-hidden rounded-xl border border-white/15 bg-black shadow-panel">
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
