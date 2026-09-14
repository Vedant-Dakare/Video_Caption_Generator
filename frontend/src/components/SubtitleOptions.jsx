import { useMemo, useState } from "react";
import { Check, CloseIcon, ChevronIcon, AlertIcon } from "./icons.jsx";

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
    <div className="space-y-12">
      {/* ================= SUBTITLE LANGUAGES ================= */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Subtitle languages
          </h3>
          <span className="shrink-0 text-xs font-medium text-muted-soft">
            {selected.length} selected
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Select the languages you want subtitles for. Each generates a separate SRT file.
        </p>

        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages..."
            aria-label="Search languages"
            className="input-search"
          />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-background">
          {filtered.length === 0 ? (
            <p className="mono-label px-4 py-8 text-center">
              NO MATCH FOR &ldquo;{query}&rdquo;
            </p>
          ) : (
            <>
              <ul
                role="group"
                aria-label="Subtitle languages"
                className="lang-list max-h-80 divide-y divide-border/60 overflow-y-auto"
              >
                {filtered.map((l) => {
                  const active = selectedSet.has(l.code);
                  return (
                    <li key={l.code}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(l.code)}
                        className={`
                          flex min-h-[52px] w-full items-center gap-2.5 px-4 py-3 text-left transition-colors duration-150
                          ${active
                            ? "bg-accent/[0.07] shadow-[inset_3px_0_0_0_#D4A853] hover:bg-accent/[0.11]"
                            : "hover:bg-muted/60"}
                          ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
                        `}
                        aria-pressed={active}
                      >
                        <span className={`w-9 shrink-0 font-mono text-xs font-semibold ${active ? "text-foreground" : "text-muted-soft"}`}>
                          {l.code.toUpperCase()}
                        </span>
                        <span className="shrink-0 text-[15px]" aria-hidden="true">
                          {LANG_FLAGS[l.code] || "🌐"}
                        </span>
                        <span className={`min-w-0 flex-1 truncate text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {l.name}
                        </span>
                        {active && (
                          <Check className="h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
              />
            </>
          )}
        </div>

        {selected.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
            <div className="flex flex-wrap gap-2">
              {selected.map((code) => {
                const l = languages.find((x) => x.code === code);
                if (!l) return null;
                const isLast = isLocked;
                return (
                  <span
                    key={code}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-background py-1.5 pl-3 pr-1.5 text-[13px] font-medium text-foreground shadow-subtle"
                  >
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground">{code.toUpperCase()}</span>
                    <span>{l.name}</span>
                    <button
                      type="button"
                      disabled={disabled || isLast}
                      onClick={() => onToggle(code)}
                      aria-label={`Remove ${l.name}`}
                      title={isLast ? "At least one language is required" : `Remove ${l.name}`}
                      className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${isLast ? "cursor-not-allowed opacity-30" : "text-muted-soft hover:bg-muted hover:text-coral"}`}
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
            {isLocked && (
              <p className="px-1 pt-2 text-xs text-muted-soft">
                At least one subtitle language is required.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ================= BURN INTO VIDEO ================= */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Burn into video
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose one of your subtitle languages to render directly into the video frames.
          This creates a single output file with baked-in captions — independent of the
          subtitle files above.
        </p>

        <div className="relative">
          <button
            type="button"
            disabled={disabled || burnOptions.length === 0}
            onClick={() => setBurnOpen(!burnOpen)}
            className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5 text-left text-sm shadow-subtle transition-all duration-200 hover:-translate-y-px hover:border-foreground/25 hover:shadow-elevated focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            aria-expanded={burnOpen}
            aria-haspopup="listbox"
          >
            <span className={burnLangObj ? "font-medium text-foreground" : "text-muted-soft"}>
              {burnLangObj
                ? `${LANG_FLAGS[burnLangObj.code] || "🌐"}  ${burnLangObj.name}`
                : "Keep subtitles separate"}
            </span>
            <ChevronIcon className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${burnOpen ? "rotate-180" : ""}`} />
          </button>

          {burnOpen && (
            <ul
              role="listbox"
              aria-label="Burn-in language"
              className="absolute z-20 mt-2 max-h-72 w-full animate-scale-in overflow-y-auto rounded-xl border border-border bg-background p-1.5 shadow-panel"
            >
              <li role="option" aria-selected={!burn}>
                <button
                  type="button"
                  className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
                  onClick={() => { onBurnChange(null); setBurnOpen(false); }}
                >
                  Keep subtitles separate
                  {!burn && <Check className="h-4 w-4 text-mint" />}
                </button>
              </li>
              {burnOptions.map((l) => (
                <li key={l.code} role="option" aria-selected={burn === l.code}>
                  <button
                    type="button"
                    className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => { onBurnChange(l.code); setBurnOpen(false); }}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-8 font-mono text-xs font-semibold text-muted-soft">{l.code.toUpperCase()}</span>
                      <span aria-hidden="true">{LANG_FLAGS[l.code] || "🌐"}</span>
                      <span className="text-foreground">{l.name}</span>
                    </span>
                    {burn === l.code && <Check className="h-4 w-4 text-mint" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {burnLangObj && (
          <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/[0.08] px-3.5 py-3">
            <AlertIcon className="mt-[2px] h-4 w-4 shrink-0 text-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{burnLangObj.name}</span> subtitles
              will be permanently rendered into the video. This produces a single output file.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
