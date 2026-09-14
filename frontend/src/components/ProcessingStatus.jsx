import { Check, Spinner } from "./icons.jsx";

const STAGE_ORDER = [
  "Extracting Audio",
  "Transcribing",
  "Translating",
  "Generating Subtitles",
  "Burning Captions",
  "Completed",
];

const STAGE_CODE = {
  "": "DONE",
  "Extracting Audio": "AUDIO",
  Transcribing: "TRSC",
  Translating: "TRNS",
  "Generating Subtitles": "SRT",
  "Burning Captions": "BURN",
};

const CHECKLIST = [
  { key: "uploaded", label: "Video uploaded", stage: "" },
  { key: "audio", label: "Audio extracted", stage: "Extracting Audio" },
  { key: "lang", label: "Language detected", stage: "Detecting Language" },
  { key: "transcribe", label: "Transcribing speech", stage: "Transcribing" },
  { key: "translate", label: "Translating subtitles", stage: "Translating" },
  { key: "srt", label: "Generating SRT files", stage: "Generating Subtitles" },
  { key: "burn", label: "Burning captions", stage: "Burning Captions" },
];

export default function ProcessingStatus({ job }) {
  const currentStage = job?.stage || "Queued";
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const isComplete = job?.status === "completed";

  const getStageState = (stage) => {
    if (isComplete) return "done";
    if (!stage) return "done";
    if (currentIndex === -1) return "pending";
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (stageIndex < currentIndex) return "done";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  const progressPct = isComplete
    ? 100
    : currentIndex === -1
      ? 4
      : Math.round(((currentIndex + 1) / STAGE_ORDER.length) * 100);

  return (
    <div className="overflow-hidden rounded-xl bg-transparent" aria-live="polite">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-1 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="mono-label shrink-0">RENDER QUEUE</span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {job?.detected_language
              ? `SRC ${job.detected_language.toUpperCase()}`
              : "AUTO DETECT"}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-foreground">
          {!isComplete && <Spinner className="h-4 w-4 text-foreground" />}
          {isComplete ? "Done" : currentStage}
        </span>
      </div>

      <div className="pt-4">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Processing progress">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent via-accent to-[#B88A2E] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
          {!isComplete && (
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden="true" />
          )}
        </div>
        <p className="mt-1.5 text-right font-mono text-[11px] text-muted-soft">{progressPct}%</p>
      </div>

      <ul className="space-y-1 py-2">
        {CHECKLIST.map((item) => {
          const state = getStageState(item.stage);
          return (
            <li
              key={item.key}
              className={`
                flex min-h-[44px] items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-300
                ${state === "active" ? "bg-accent/[0.12] shadow-subtle" : ""}
                ${state === "pending" ? "opacity-55" : ""}
              `}
            >
              <span
                className={`
                  w-11 shrink-0 font-mono text-[10px] font-semibold tracking-wide
                  ${state === "active" ? "text-foreground" : "text-muted-soft"}
                `}
              >
                {STAGE_CODE[item.stage] || "DONE"}
              </span>

              <span
                aria-hidden="true"
                className={`
                  grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-200
                  ${state === "done"
                    ? "border-mint/40 bg-mint/15 text-mint"
                    : state === "active"
                      ? "border-accent/50 bg-background text-foreground shadow-subtle"
                      : "border-border bg-transparent text-muted-soft"}
                `}
              >
                {state === "done" && <Check className="h-3 w-3" />}
                {state === "active" && <Spinner className="h-3.5 w-3.5" />}
              </span>

              <span
                className={`
                  flex-1 text-sm
                  ${state === "done" ? "text-muted-soft"
                    : state === "active" ? "font-medium text-foreground"
                    : "text-muted-soft"}
                `}
              >
                {item.label}
              </span>

              {state === "active" && (
                <span className="hidden max-w-[160px] truncate font-mono text-[10px] tracking-wide text-foreground/70 sm:inline">
                  {(job?.message || "WORKING").toUpperCase()}
                </span>
              )}
              {state === "done" && (
                <span className="font-mono text-[10px] font-semibold text-mint">OK</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
