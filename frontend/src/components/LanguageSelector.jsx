import { ChevronIcon, Check } from "./icons.jsx";

export default function LanguageSelector({ languages, value, onChange, disabled }) {
  const detectedLabel = value?.detected ? value.detected : null;

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <select
          aria-label="Original spoken language"
          className="input-select cursor-pointer disabled:cursor-not-allowed"
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
        <ChevronIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        {detectedLabel ? (
          <span className="flex items-center gap-2 font-medium text-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-mint/15 text-mint">
              <Check className="h-3 w-3" />
            </span>
            <span className="font-mono text-[11px] tracking-wide">DETECTED: {detectedLabel.toUpperCase()}</span>
          </span>
        ) : value?.code === "auto" ? (
          <span className="font-mono text-[11px] tracking-wide">LANGUAGE WILL BE DETECTED FROM AUDIO</span>
        ) : (
          <span className="font-mono text-[11px] tracking-wide">TRANSCRIPT IN SELECTED LANGUAGE</span>
        )}
      </div>
    </div>
  );
}
