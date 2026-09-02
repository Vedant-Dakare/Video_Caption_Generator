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

function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-5" aria-hidden="true">
      {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-accent-400 animate-waveform"
          style={{ animationDelay: `${delay}s`, height: "4px" }}
        />
      ))}
    </div>
  );
}

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
    <div className="card p-6 sm:p-8 animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-accent-500/15">
          <Spinner className="h-6 w-6 text-accent-400" />
          <div className="absolute inset-0 rounded-2xl bg-accent-500/10 blur-xl animate-pulse-glow" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Processing your video
          </h2>
          <p className="text-sm text-slate-400">
            {job?.detected_language
              ? `Spoken language detected: ${job.detected_language.toUpperCase()}`
              : "AI is analyzing your video…"}
          </p>
        </div>
        <div className="ml-auto">
          <WaveformBars />
        </div>
      </div>

      {/* Stage timeline */}
      <div className="relative ml-5 border-l border-white/[0.06] pl-8 space-y-0" aria-label="Processing steps">
        {CHECKLIST.map((item, idx) => {
          const state = getStageState(item.stage);
          return (
            <div
              key={item.key}
              className={`
                relative flex items-center gap-4 py-3.5
                transition-colors duration-300
                ${state === "active" ? "" : ""}
              `}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Status dot on the timeline line */}
              <div
                className={`
                  absolute -left-[calc(2rem+5px)] top-1/2 -translate-y-1/2
                  grid h-5 w-5 place-items-center rounded-full border-2
                  transition-all duration-300
                  ${state === "done"
                    ? "border-mint/40 bg-mint/15 text-mint"
                    : state === "active"
                    ? "border-accent-400 bg-accent-500/20 text-accent-400 shadow-glow-sm"
                    : "border-white/[0.08] bg-surface-2 text-slate-600"
                  }
                `}
              >
                {state === "done" && <Check className="h-2.5 w-2.5" />}
                {state === "active" && (
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse-slow" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-sm transition-colors duration-300
                  ${state === "done"
                    ? "text-slate-300"
                    : state === "active"
                    ? "text-white font-medium"
                    : "text-slate-600"
                  }
                `}
              >
                {item.label}
              </span>

              {/* Active stage message */}
              {state === "active" && (
                <span className="ml-auto flex items-center gap-2 text-xs text-accent-400 animate-fade-in">
                  <Spinner className="h-3 w-3" />
                  {job?.message || "Working…"}
                </span>
              )}

              {/* Done indicator */}
              {state === "done" && (
                <span className="ml-auto text-[10px] text-mint/60 font-mono uppercase tracking-wider animate-fade-in">
                  done
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-language status */}
      {Object.keys(job?.languages || {}).length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <p className="mb-3 label">Subtitle Progress</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(job.languages).map(([code, l]) => (
              <span
                key={code}
                className={`
                  inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium font-mono
                  transition-all duration-300
                  ${l.status === "ok"
                    ? "bg-mint/10 text-mint border border-mint/10"
                    : l.status === "error"
                    ? "bg-coral/10 text-coral border border-coral/10"
                    : "bg-white/[0.04] text-slate-500 border border-white/[0.06]"
                  }
                `}
              >
                {l.status === "ok" ? (
                  <Check className="h-3 w-3" />
                ) : l.status === "error" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
                {code.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
