import { Check, Spinner } from "./icons.jsx";

const STAGE_ORDER = [
  "Extracting Audio",
  "Detecting Language",
  "Transcribing",
  "Translating",
  "Generating Subtitles",
  "Burning Captions",
  "Finalizing",
];

const CHECKLIST = [
  { key: "uploaded", label: "Video uploaded", stage: "" },
  { key: "audio", label: "Audio extracted", stage: "Extracting Audio" },
  { key: "lang", label: "Language detected", stage: "Detecting Language" },
  { key: "transcribe", label: "Transcribing speech", stage: "Transcribing" },
  { key: "translate", label: "Translating subtitles", stage: "Translating" },
  { key: "srt", label: "Generating SRT files", stage: "Generating Subtitles" },
  { key: "burn", label: "Burning captions", stage: "Burning Captions" },
];

const STAGE_CODE = {
  "": "DONE",
  "Extracting Audio": "AUDIO",
  "Detecting Language": "LANG",
  Transcribing: "TRSC",
  Translating: "TRNS",
  "Generating Subtitles": "SRT",
  "Burning Captions": "BURN",
};

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

  return (
    <div className="panel animate-fade-up">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-warm-700/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="mono-label text-warm-500">RENDER QUEUE</span>
          <span className="h-3 w-px bg-warm-700" />
          <span className="mono-label text-accent">
            {job?.detected_language
              ? `SRC ${job.detected_language.toUpperCase()}`
              : "AUTO DETECT"}
          </span>
        </div>
        <span className="flex items-center gap-2 text-xs text-warm-400">
          <Spinner className="h-3 w-3" />
          {currentStage}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="h-1 w-full bg-warm-700">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{
            width: isComplete ? "100%" : `${((currentIndex + 1) / STAGE_ORDER.length) * 100}%`,
          }}
        />
      </div>

      {/* Stage list */}
      <div className="px-5 py-6">
        <ul className="space-y-0.5">
          {CHECKLIST.map((item) => {
            const state = getStageState(item.stage);
            return (
              <li
                key={item.key}
                className={`
                  flex items-center gap-4 px-2 py-2.5 rounded-sm transition-colors
                  ${state === "active" ? "bg-surface-2" : ""}
                `}
              >
                {/* Stage code */}
                <span
                  className={`
                    w-12 shrink-0 font-mono text-[10px] tracking-wide transition-colors
                    ${state === "done" ? "text-warm-500" : state === "active" ? "text-accent" : "text-warm-600"}
                  `}
                >
                  {STAGE_CODE[item.stage] || "STEP"}
                </span>

                {/* Status indicator */}
                <span
                  className={`
                    grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors
                    ${state === "done"
                      ? "border-mint/50 bg-mint/10 text-mint"
                      : state === "active"
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-warm-700 text-warm-600"}
                  `}
                >
                  {state === "done" && <Check className="h-2.5 w-2.5" />}
                  {state === "active" && (
                    <Spinner className="h-3 w-3" />
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    flex-1 text-sm transition-colors
                    ${state === "done" ? "text-warm-400 line-through decoration-warm-600"
                      : state === "active" ? "text-warm-100 font-medium"
                      : "text-warm-600"}
                  `}
                >
                  {item.label}
                </span>

                {/* Right side: message or status */}
                {state === "active" && (
                  <span className="mono-label text-accent truncate max-w-[160px]">
                    {job?.message || "WORKING"}
                  </span>
                )}
                {state === "done" && (
                  <span className="mono-label text-mint">OK</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Per-language status */}
      {Object.keys(job?.languages || {}).length > 0 && (
        <div className="border-t border-warm-700/60 px-5 py-4">
          <p className="mono-label mb-3 text-warm-400">LANGUAGE STATUS</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(job.languages).map(([code, l]) => (
              <span
                key={code}
                className={`
                  inline-flex items-center gap-1.5 rounded-sm px-2 py-1 mono-label
                  ${l.status === "ok"
                    ? "bg-mint/10 text-mint border border-mint/20"
                    : l.status === "error"
                    ? "bg-coral/10 text-coral-light border border-coral/20"
                    : "border border-warm-700 text-warm-500"}
                `}
              >
                {l.status === "ok" && <Check className="h-2.5 w-2.5" />}
                {l.status === "error" && <span className="h-1.5 w-1.5 rounded-full bg-coral" />}
                {l.status !== "ok" && l.status !== "error" && <Spinner className="h-2.5 w-2.5" />}
                {code.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
