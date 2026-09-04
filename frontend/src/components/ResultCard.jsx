import { Check, DownloadIcon, PlayIcon, ResetIcon, AlertIcon } from "./icons.jsx";

const EMPTY = {};

const LANG_FLAGS = {
  en: "🇬🇧", hi: "🇮🇳", mr: "🇮🇳", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪",
  ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", it: "🇮🇹", pt: "🇧🇷", ru: "🇷🇺",
  ta: "🇮🇳", te: "🇮🇳", bn: "🇧🇩", gu: "🇮🇳", kn: "🇮🇳", ml: "🇮🇳",
  pa: "🇮🇳", ur: "🇵🇰",
};

export default function ResultCard({ job, languages, onReset, onOpenPreview }) {
  const langName = (code) =>
    languages.find((l) => l.code === code)?.name || code.toUpperCase();

  const subtitleEntries = Object.entries(job?.languages || EMPTY)
    .filter(([, l]) => l?.status === "ok" && l?.srt_url)
    .map(([code, l]) => ({ code, ...l }));

  const burn = job?.burn || EMPTY;
  const hasBurnVideo = burn?.status === "ok" && burn?.video_url;
  const burnFailed = burn?.status === "error";
  const failedLanguages = Object.entries(job?.languages || EMPTY)
    .filter(([, l]) => l?.status === "error")
    .map(([code, l]) => ({ code, ...l }));

  const burnLangCode =
    burn?.video?.replace(/_captioned\.mp4$/, "").split("_").pop() || "en";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-warm-700/60 pb-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">04 / OUTPUT</span>
          <h2 className="font-display text-2xl font-bold text-warm-100">Deliverables</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-sm border border-mint/30 bg-mint/[0.06] px-2.5 py-1 mono-label text-mint">
            <Check className="h-3 w-3" />
            COMPLETE
          </span>
          <button type="button" className="btn-sm text-warm-300" onClick={onReset}>
            <ResetIcon className="h-3.5 w-3.5" />
            New Video
          </button>
        </div>
      </div>

      {/* ==== FINAL VIDEO ==== */}
      {hasBurnVideo && (
        <figure className="border border-warm-700 bg-black overflow-hidden">
          <figcaption className="flex items-center justify-between border-b border-warm-700/60 bg-surface-1 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="mono-label text-warm-500">RENDER 01</span>
              <span className="mono-label text-warm-200">FINAL VIDEO</span>
            </div>
            <span className="mono-label text-accent">
              {burnLangCode.toUpperCase()} · CAPTIONED
            </span>
          </figcaption>

          <div className="relative aspect-video bg-black">
            <video
              src={burn.preview_url}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-warm-700/60 bg-surface-1 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="mono-label text-warm-400">
                LANG: {langName(burnLangCode)}
              </span>
              {burn.video && (
                <span className="mono-label text-warm-500 truncate max-w-[180px]">{burn.video}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => onOpenPreview(burn.preview_url)}
              >
                <PlayIcon className="h-4 w-4" />
                Preview
              </button>
              <a href={burn.video_url} download className="btn-primary text-sm">
                <DownloadIcon className="h-4 w-4" />
                Download video
              </a>
            </div>
          </div>
        </figure>
      )}

      {/* ==== CAPTION FILES ==== */}
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-mono text-xs text-accent">SRT</span>
          <h3 className="font-display text-lg font-semibold text-warm-100">Caption files</h3>
          {subtitleEntries.length > 0 && (
            <span className="mono-label text-warm-400">({subtitleEntries.length})</span>
          )}
        </div>

        {subtitleEntries.length === 0 ? (
          <p className="text-sm text-warm-500 py-6 text-center rounded-md border border-warm-700/50 bg-surface-1 mono-label">
            NO SUBTITLE FILES GENERATED
          </p>
        ) : (
          <div className="border border-warm-700 rounded-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-warm-700/60 bg-surface-1">
              <span className="w-9 mono-label text-warm-500">CODE</span>
              <span className="flex-1 mono-label text-warm-500">LANGUAGE</span>
              <span className="w-40 hidden sm:block mono-label text-warm-500">FILE</span>
              <span className="w-20 mono-label text-warm-500">FORMAT</span>
              <span className="w-24 text-right mono-label text-warm-500">ACTION</span>
            </div>

            {subtitleEntries.map(({ code, srt_url, srt }, idx) => (
              <div
                key={code}
                className="group flex items-center gap-4 px-4 py-3 border-b border-warm-700/50 last:border-b-0 transition-colors hover:bg-surface-2"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <span className="w-9 font-mono text-xs font-semibold text-accent">{code.toUpperCase()}</span>
                <span className="flex-1 text-sm font-medium text-warm-200 min-w-0">
                  <span className="mr-2">{LANG_FLAGS[code] || "🌐"}</span>
                  <span className="truncate">{langName(code)}</span>
                </span>
                <span className="hidden sm:block w-40 truncate font-mono text-[11px] text-warm-400">{srt}</span>
                <span className="w-20 mono-label text-warm-500">SRT</span>
                <span className="w-24 text-right">
                  <a
                    href={srt_url}
                    download={srt}
                    className="inline-flex items-center gap-1.5 btn-sm w-full justify-center"
                    aria-label={`Download ${langName(code)} subtitle file`}
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    Download
                  </a>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Failed languages */}
        {failedLanguages.length > 0 && (
          <div className="mt-6 rounded-md border border-coral/20 bg-coral/[0.04] p-5 animate-fade-up">
            <div className="flex items-center gap-2.5 mb-3">
              <AlertIcon className="h-4 w-4 text-coral" />
              <p className="text-sm font-semibold text-coral-light">
                Some translations failed
              </p>
            </div>
            <ul className="space-y-2 ml-1">
              {failedLanguages.map(({ code, error }) => (
                <li key={code} className="flex items-start gap-2 text-xs text-warm-300">
                  <span className="font-mono text-coral-light">{code.toUpperCase()}</span>
                  <span className="text-warm-500">—</span>
                  <span>{error || "Translation service unavailable."}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-warm-400 ml-1">
              The subtitle files above remain available for download.
            </p>
          </div>
        )}
      </section>

      {/* No burn requested */}
      {!hasBurnVideo && (burnFailed || !burn?.video) && (
        <div className="rounded-md border border-warm-700 bg-surface-1 px-4 py-3 text-sm text-warm-400">
          {burnFailed
            ? `Captioned video failed: ${burn.error}`
            : "No captioned video was generated."}
        </div>
      )}
    </div>
  );
}
