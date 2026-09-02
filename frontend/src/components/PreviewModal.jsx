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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8 backdrop-blur-md animate-fade-in"
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
          className="absolute -top-12 right-0 sm:top-0 sm:-right-12 z-10 grid h-10 w-10 place-items-center rounded-xl bg-white/[0.08] text-slate-400 transition-all duration-200 hover:bg-white/[0.15] hover:text-white backdrop-blur-sm border border-white/[0.06]"
          onClick={onClose}
          aria-label="Close preview"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="truncate text-sm font-medium text-slate-300">{title}</span>
        </div>

        {/* Video */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
