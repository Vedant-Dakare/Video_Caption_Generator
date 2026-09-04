import { useMemo, useState } from "react";
import { Check, CloseIcon, ChevronIcon } from "./icons.jsx";

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
  const [query, setQuery] = useState("");
  const [burnOpen, setBurnOpen] = useState(false);

  const burnOptions = useMemo(
    () => languages.filter((l) => selected.includes(l.code)),
    [languages, selected]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [languages, query]);

  const burnLangObj = burnOptions.find((l) => l.code === burn) || null;
  const selectedSet = new Set(selected);
  const isLocked = selected.length === 1;

  return (
    <div className="space-y-8">
      {/* ================= SUBTITLE LANGUAGES ================= */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">STEP 02</span>
          <span className="font-display text-base font-semibold text-warm-100">
            Subtitle output
          </span>
        </div>
          {selected.length > 0 && (
            <span className="mono-label text-accent">
              {selected.length} SELECTED
            </span>
          )}
        </div>

        <p className="mb-1.5 text-sm text-warm-300 leading-relaxed">
          Select the languages you want subtitles for. Each generates a separate SRT file.
        </p>
        <p className="mb-4 text-xs text-warm-400 leading-relaxed">
          <span className="text-accent">English</span> is selected by default.{" "}
          <span className="text-warm-400">Additional languages may increase processing time.</span>
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages..."
            aria-label="Search languages"
            className="w-full rounded-md border border-warm-700 bg-surface-2 px-3.5 py-2 text-sm text-warm-100 placeholder:text-warm-500 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {/* Language list - compact rows */}
        <div
          role="group"
          aria-label="Subtitle languages"
          className="border border-warm-700 rounded-md overflow-hidden"
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-warm-500 mono-label">
              NO MATCH FOR &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((l) => {
              const active = selectedSet.has(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(l.code)}
                  className={`
                    flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left
                    border-b border-warm-700/50 last:border-b-0
                    transition-colors
                    ${active
                      ? "bg-accent/[0.07] hover:bg-accent/[0.1]"
                      : "bg-transparent hover:bg-surface-2"}
                    ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  aria-pressed={active}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`
                        font-mono text-xs w-7 transition-colors
                        ${active ? "text-accent" : "text-warm-400"}
                      `}
                    >
                      {l.code.toUpperCase()}
                    </span>
                    <span className={`text-sm ${active ? "text-warm-300" : "text-warm-500"}`}>
                      {LANG_FLAGS[l.code] || "🌐"}
                    </span>
                    <span
                      className={`text-sm transition-colors ${
                        active ? "text-warm-100 font-semibold" : "text-warm-300 font-normal"
                      }`}
                    >
                      {l.name}
                    </span>
                    {active && (
                      <span className="mono-label text-accent ml-1">SELECTED</span>
                    )}
                  </span>
                  <span
                    className={`
                      flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors
                      ${active
                        ? "border-accent bg-accent text-surface-0"
                        : "border-warm-600 bg-transparent"}
                    `}
                  >
                    {active && <Check className="h-2.5 w-2.5" />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Selected summary chips */}
        {selected.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {selected.map((code) => {
                const l = languages.find((x) => x.code === code);
                if (!l) return null;
                const isLast = isLocked;
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-accent/30 bg-accent/[0.08] px-2 py-1 mono-label text-accent"
                  >
                    <Check className="h-2.5 w-2.5" />
                    {code.toUpperCase()} · {l.name}
                    <button
                      type="button"
                      disabled={disabled || isLast}
                      onClick={() => onToggle(code)}
                      aria-label={`Remove ${l.name}`}
                      title={isLast ? "At least one language is required" : `Remove ${l.name}`}
                      className={`transition-colors ${isLast ? "opacity-30 cursor-not-allowed" : "text-accent/70 hover:text-accent"}`}
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            {isLocked && (
              <p className="mt-1.5 mono-label text-warm-500">
                AT LEAST ONE SUBTITLE LANGUAGE IS REQUIRED
              </p>
            )}
          </div>
        )}
      </section>

      {/* ================= BURN INTO VIDEO ================= */}
      <section className="border-t border-warm-700/60 pt-8">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-mono text-xs text-coral-light">STEP 03</span>
          <span className="font-display text-base font-semibold text-warm-100">
            Burn into video
          </span>
        </div>

        <p className="mb-4 text-sm text-warm-400 leading-relaxed">
          Choose one of your subtitle languages to render directly into the video frames.
          This creates a single output file with baked-in captions — independent of the
          subtitle files above.
        </p>

        <div className="relative">
          <button
            type="button"
            disabled={disabled || burnOptions.length === 0}
            onClick={() => setBurnOpen(!burnOpen)}
            className="w-full rounded-md border border-warm-700 bg-surface-2 px-3.5 py-2.5 text-left text-sm text-warm-100 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 flex items-center justify-between"
            aria-expanded={burnOpen}
            aria-haspopup="listbox"
          >
            <span className={burnLangObj ? "text-warm-100" : "text-warm-500"}>
              {burnLangObj
                ? `${LANG_FLAGS[burnLangObj.code] || "🌐"} ${burnLangObj.name}`
                : "Keep subtitles separate"}
            </span>
            <ChevronIcon className={`h-4 w-4 text-warm-400 transition-transform ${burnOpen ? "rotate-180" : ""}`} />
          </button>

          {burnOpen && (
            <ul
              role="listbox"
              className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-warm-700 bg-surface-2 shadow-elevated"
            >
              <li>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm text-warm-300 hover:bg-surface-3"
                  onClick={() => { onBurnChange(null); setBurnOpen(false); }}
                >
                  Keep subtitles separate
                  {!burn && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              </li>
              {burnOptions.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm text-warm-300 hover:bg-surface-3"
                    onClick={() => { onBurnChange(l.code); setBurnOpen(false); }}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-warm-400 w-7">{l.code.toUpperCase()}</span>
                      <span>{LANG_FLAGS[l.code] || "🌐"}</span>
                      <span>{l.name}</span>
                    </span>
                    {burn === l.code && <Check className="h-3.5 w-3.5 text-accent" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {burnLangObj && (
          <div className="mt-3 flex items-start gap-2.5 rounded-md border border-coral/30 bg-coral/[0.04] px-3.5 py-3">
            <span className="mt-0.5 text-coral-light">!</span>
            <p className="text-xs text-warm-300 leading-relaxed">
              <span className="font-semibold text-coral-light">{burnLangObj.name}</span> subtitles
              will be permanently rendered into the video. This produces a single output file.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
