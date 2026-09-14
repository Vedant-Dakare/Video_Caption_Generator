import { FilmIcon } from "./icons.jsx";

export default function Navbar({ status }) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/15 via-black/5 to-transparent">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          className="flex min-h-[40px] items-center gap-2.5 rounded-full border border-white/20 bg-background/80 py-1.5 pl-1.5 pr-4 shadow-subtle backdrop-blur-sm transition-transform duration-200 hover:-translate-y-px"
          aria-label="Lumina Captions home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <FilmIcon className="h-4 w-4 text-background" />
          </span>
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="font-display text-base font-bold tracking-tight text-foreground">Lumina</span>
            <span className="font-display text-base font-medium text-muted-foreground">Captions</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className="hidden min-h-[40px] items-center gap-2 rounded-full border border-white/20 bg-background/80 px-3.5 py-2 font-mono text-[11px] font-medium leading-none tracking-wide text-foreground shadow-subtle backdrop-blur-sm sm:inline-flex"
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                status === "online"
                  ? "animate-pulse bg-mint shadow-[0_0_8px_2px_rgba(91,154,139,0.55)]"
                  : status === "offline"
                    ? "bg-coral"
                    : "bg-accent"
              }`}
            />
            {status === "online" ? "CONNECTED" : status === "offline" ? "OFFLINE" : "CHECKING"}
          </span>
          <a
            href="https://github.com/openai/whisper"
            target="_blank"
            rel="noreferrer"
            aria-label="Whisper on GitHub"
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-background/80 text-foreground shadow-subtle backdrop-blur-sm transition-transform duration-200 hover:-translate-y-px sm:px-3.5 sm:py-2 sm:text-xs sm:font-medium"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="hidden leading-none sm:inline">Whisper</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
