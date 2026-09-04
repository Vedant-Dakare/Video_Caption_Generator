import { ChevronIcon } from "./icons.jsx";

export default function LanguageSelector({ languages, value, onChange, disabled }) {
  const detectedLabel = value?.detected ? value.detected : null;

  return (
    <div>
      <div className="relative">
        <select
          className="input-select pr-10 bg-surface-2 border-warm-700"
          value={value?.code || "auto"}
          disabled={disabled}
          onChange={(e) =>
            onChange(
              e.target.value === "auto"
                ? { code: "auto" }
                : { code: e.target.value }
            )
          }
        >
          <option value="auto">Auto Detect</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" />
      </div>

      <div className="mt-2.5 flex items-center gap-2" aria-live="polite">
        {detectedLabel ? (
          <span className="inline-flex items-center gap-2 rounded-sm border border-mint/30 bg-mint/10 px-2.5 py-1 mono-label text-mint">
            DETECTED: {detectedLabel.toUpperCase()}
          </span>
        ) : value?.code === "auto" ? (
          <span className="mono-label text-warm-400">
            LANGUAGE WILL BE DETECTED FROM AUDIO
          </span>
        ) : (
          <span className="mono-label text-warm-400">
            TRANSCRIPT IN SELECTED LANGUAGE
          </span>
        )}
      </div>
    </div>
  );
}
