import { ChevronIcon } from "./icons.jsx";

export default function LanguageSelector({ languages, value, onChange, disabled }) {
  const detectedLabel = value?.detected ? value.detected : null;

  return (
    <div>
      <label className="label mb-2.5" htmlFor="spoken-language">
        Spoken Language
      </label>
      <div className="relative">
        <select
          id="spoken-language"
          className="input-select pr-10"
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
        <ChevronIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      {/* Status hint */}
      <div className="mt-2.5 flex items-center gap-2" aria-live="polite">
        {detectedLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-3 py-1 text-xs font-medium text-mint border border-mint/10">
            <span className="h-1 w-1 rounded-full bg-mint" />
            Detected: {detectedLabel.toUpperCase()}
          </span>
        ) : value?.code === "auto" ? (
          <span className="text-xs text-slate-500">
            Language will be detected automatically from the audio.
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            Transcript will be kept in the selected language.
          </span>
        )}
      </div>
    </div>
  );
}
