import { Check, DownloadIcon, PlayIcon, SparkleIcon, ResetIcon, AlertIcon } from "./icons.jsx";

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

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Success banner */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-mint/15">
              <Check className="h-5 w-5 text-mint" />
              <div className="absolute inset-0 rounded-2xl bg-mint/10 blur-lg" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Your video is ready
              </h2>
              <p className="text-sm text-slate-400">
                {job?.detected_language
                  ? `Spoken language: ${job.detected_language.toUpperCase()}`
                  : "Captions generated successfully."}
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost" onClick={onReset}>
            <ResetIcon className="h-4 w-4" />
            Process another video
          </button>
        </div>
      </div>

      {/* Captioned Video — HERO of results */}
      {hasBurnVideo && (
        <div className="card overflow-hidden animate-fade-up animate-delay-75">
          {/* Video header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <SparkleIcon className="h-4 w-4 text-accent-400" />
              <h3 className="font-display text-sm font-semibold text-white">
                Captioned Video
              </h3>
            </div>
            {burn.video && (
              <span className="text-xs text-slate-500 font-mono">{burn.video}</span>
            )}
          </div>

          {/* Video player */}
          <div className="relative bg-black/80">
            <video
              src={burn.preview_url}
              controls
              playsInline
              className="aspect-video w-full object-contain"
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-surface-2/30">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {burn.video && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400 border border-accent-500/15">
                  <span className="h-1 w-1 rounded-full bg-accent-400" />
                  {langName(burn.video?.replace(/_captioned\.mp4$/, "").split("_").pop() || "en")} subtitles burned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href={burn.video_url} download className="btn-primary text-sm">
                <DownloadIcon className="h-4 w-4" />
                Download Video
              </a>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => onOpenPreview(burn.preview_url)}
              >
                <PlayIcon className="h-4 w-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Subtitles */}
      <div className="card p-5 sm:p-6 animate-fade-up animate-delay-150">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold text-white mb-1">
            Generated Subtitles
          </h3>
          <p className="text-xs text-slate-500">
            Download the SRT files for each language.
          </p>
        </div>

        {subtitleEntries.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No subtitle files were generated.
          </p>
        ) : (
          <div className="space-y-2">
            {subtitleEntries.map(({ code, srt_url, srt }, idx) => (
              <div
                key={code}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08]"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-sm">
                    {LANG_FLAGS[code] || "🌐"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{langName(code)}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{srt}</p>
                  </div>
                </div>
                <a
                  href={srt_url}
                  download={srt}
                  className="btn-sm shrink-0"
                  aria-label={`Download ${langName(code)} subtitle file`}
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  SRT
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Failed languages */}
        {failedLanguages.length > 0 && (
          <div className="mt-4 rounded-2xl border border-coral/15 bg-coral/[0.04] p-4 animate-fade-up">
            <div className="flex items-center gap-2 mb-2">
              <AlertIcon className="h-4 w-4 text-coral" />
              <p className="text-sm font-medium text-coral">
                Some translations failed
              </p>
            </div>
            <ul className="space-y-1.5 ml-6">
              {failedLanguages.map(({ code, error }) => (
                <li key={code} className="flex items-start gap-2 text-xs text-coral/80">
                  <span className="font-semibold font-mono">{code.toUpperCase()}</span>
                  <span className="text-slate-500">—</span>
                  <span>{error || "Translation service unavailable."}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500 ml-6">
              The successfully generated subtitles above remain available.
            </p>
          </div>
        )}

        {/* No burn requested */}
        {!hasBurnVideo && (burnFailed || !burn?.video) && (
          <div className="mt-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-slate-500">
            {burnFailed
              ? `Captioned video: ${burn.error}`
              : "No captioned video was requested."}
          </div>
        )}
      </div>
    </div>
  );
}
