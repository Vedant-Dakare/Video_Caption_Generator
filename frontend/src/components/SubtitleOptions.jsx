import { useMemo, useState } from "react";
import { Check, ChevronIcon, GlobeIcon } from "./icons.jsx";

const LANG_FLAGS = {
  en: "🇬🇧", hi: "🇮🇳", mr: "🇮🇳", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪",
  ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", it: "🇮🇹", pt: "🇧🇷", ru: "🇷🇺",
  ta: "🇮🇳", te: "🇮🇳", bn: "🇧🇩", gu: "🇮🇳", kn: "🇮🇳", ml: "🇮🇳",
  pa: "🇮🇳", ur: "🇵🇰",
};

export default function SubtitleOptions({
  languages,
  selected,
  onToggle,
  burn,
  onBurnChange,
  disabled,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const burnOptions = useMemo(
    () => languages.filter((l) => selected.includes(l.code)),
    [languages, selected]
  );

  return (
    <div className="space-y-6">
      {/* ---- Subtitle Languages ---- */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label id="subtitle-langs-label" className="label">
            Subtitle Languages
          </label>
          {selected.length > 0 && (
            <span className="text-xs text-accent-400 font-mono font-medium">
              {selected.length} selected
            </span>
          )}
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Each language generates a separate subtitle file.
        </p>
        <div
          role="group"
          aria-labelledby="subtitle-langs-label"
          className="stagger-children flex flex-wrap gap-2"
        >
          {languages.map((l) => {
            const active = selected.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(l.code)}
                className={`
                  lang-chip
                  ${active ? "lang-chip-active" : "lang-chip-inactive"}
                  ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                `}
                aria-pressed={active}
                aria-label={`${active ? "Remove" : "Add"} ${l.name} subtitle`}
              >
                {active ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-accent-500 text-[10px] text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-md border border-white/[0.15] bg-transparent" />
                )}
                <span>{LANG_FLAGS[l.code] || "🌐"} {l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Burn into Video ---- */}
      {burnOptions.length > 0 && (
        <div className="pt-1">
          <label className="label mb-2.5" htmlFor="burn-language">
            Burn into Video
          </label>
          <p className="mb-3 text-xs text-slate-500">
            Only one language can be burned into the final video output.
          </p>
          <div className="relative">
            <select
              id="burn-language"
              className="input-select pr-10"
              value={burn || ""}
              disabled={disabled}
              onChange={(e) => onBurnChange(e.target.value || null)}
            >
              <option value="">Don't burn subtitles</option>
              {burnOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  {LANG_FLAGS[l.code] || "🌐"} {l.name}
                </option>
              ))}
            </select>
            <ChevronIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          {burn && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <GlobeIcon className="h-3 w-3" />
              {languages.find((l) => l.code === burn)?.name} subtitles will be
              permanently rendered into the video.
            </p>
          )}
        </div>
      )}

      {/* ---- Advanced Options ---- */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          aria-expanded={showAdvanced}
        >
          <ChevronIcon
            className={`h-3 w-3 transition-transform duration-200 ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
          Advanced options
        </button>
        {showAdvanced && (
          <div className="mt-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 animate-fade-up">
            <p className="text-xs text-slate-500">
              Subtitle styling options (position, font size, colors) are
              controlled by the backend configuration. Additional styling
              options may be available in future updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
