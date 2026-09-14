import { Check, DownloadIcon, PlayIcon, ResetIcon, AlertIcon, SubtitleIcon } from "./icons.jsx";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="mono-label">04 / OUTPUT</p>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Deliverables</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-[11px] font-semibold text-foreground">
            <Check className="h-3 w-3 text-mint" />
            COMPLETE
          </span>
          <button type="button" className="btn-sm min-h-[36px]" onClick={onReset}>
            <ResetIcon className="h-4 w-4" />
            New Video
          </button>
        </div>
      </div>

      {/* ==== FINAL VIDEO ==== */}
      {hasBurnVideo && (
        <figure className="overflow-hidden rounded-xl border border-border bg-background shadow-subtle">
          <figcaption className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/50 px-4 py-2.5">
            <span className="mono-label">RENDER 01 — FINAL VIDEO</span>
            <span className="rounded-full bg-foreground px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-background">
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

          <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 font-mono text-[11px] font-medium text-foreground">
                LANG: {langName(burnLangCode)}
              </span>
              {burn.video && (
                <span className="truncate font-mono text-[11px] text-muted-soft">{burn.video}</span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="btn-ghost min-h-[44px] !px-4 text-sm"
                onClick={() => onOpenPreview(burn.preview_url)}
              >
                <PlayIcon className="h-4 w-4" />
                Preview
              </button>
              <a href={burn.video_url} download className="btn-primary min-h-[44px] !px-4 text-sm">
                <DownloadIcon className="h-4 w-4" />
                Download video
              </a>
            </div>
          </div>
        </figure>
      )}

      {/* ==== CAPTION FILES ==== */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-2.5">
          <span className="mono-label">SRT</span>
          <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">Caption files</h3>
          {subtitleEntries.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">({subtitleEntries.length})</span>
          )}
        </div>

        {subtitleEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-10 text-center">
            <SubtitleIcon className="h-6 w-6 text-muted-soft" />
            <p className="mono-label">NO SUBTITLE FILES GENERATED</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border shadow-subtle">
            <div className="hidden items-center gap-4 border-b border-border/70 bg-muted/50 px-4 py-2.5 sm:flex" aria-hidden="true">
              <span className="w-12 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground">CODE</span>
              <span className="flex-1 text-xs font-semibold text-muted-foreground">LANGUAGE</span>
              <span className="hidden w-32 font-mono text-[10px] text-muted-foreground lg:block">FILE</span>
              <span className="w-28 text-right text-xs font-semibold text-muted-foreground">ACTION</span>
            </div>

            <ul className="divide-y divide-border/70 bg-background">
              {subtitleEntries.map(({ code, srt_url, srt }, idx) => (
                <li
                  key={code}
                  className="flex min-h-[56px] animate-fade-up items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:gap-4"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="w-12 shrink-0 font-mono text-xs font-bold text-foreground">{code.toUpperCase()}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-foreground">
                    <span aria-hidden="true">{LANG_FLAGS[code] || "🌐"}</span>
                    <span className="truncate">{langName(code)}</span>
                  </span>
                  <span className="hidden w-32 truncate font-mono text-[11px] text-muted-soft lg:block">{srt}</span>
                  <span className="w-28 shrink-0 text-right">
                    <a
                      href={srt_url}
                      download={srt}
                      className="btn-sm min-h-[40px] w-full"
                      aria-label={`Download ${langName(code)} subtitle file`}
                    >
                      <DownloadIcon className="h-4 w-4" />
                      SRT
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {failedLanguages.length > 0 && (
          <div className="rounded-xl border border-coral/25 bg-coral/[0.06] p-4 text-sm" role="alert">
            <div className="mb-2 flex items-center gap-2">
              <AlertIcon className="h-4 w-4 text-coral" />
              <p className="text-sm font-semibold text-foreground">Some translations failed</p>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {failedLanguages.map(({ code, error }) => (
                <li key={code} className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">{code.toUpperCase()}</span>
                  {" — "}
                  <span>{error || "Translation service unavailable."}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-xs text-muted-soft">
              The subtitle files above remain available for download.
            </p>
          </div>
        )}
      </section>

      {!hasBurnVideo && (burnFailed || !burn?.video) && (
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-center text-sm text-muted-foreground">
          {burnFailed
            ? `Captioned video failed: ${burn.error}`
            : "No captioned video was generated — SRT files above are unaffected."}
        </div>
      )}
    </div>
  );
}
