import { FilmIcon } from "./icons.jsx";

export default function Navbar({ status }) {
  return (
    <header className="sticky top-0 z-40 border-b border-warm-700/60 bg-surface-0/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 border border-accent/20">
            <FilmIcon className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold tracking-tight text-warm-100">
              Lumina
            </span>
            <span className="font-display text-base font-medium text-accent">
              Captions
            </span>
          </div>
        </a>

        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-md border border-warm-700 px-2.5 py-1 text-[11px] font-medium text-warm-300">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                status === "online"
                  ? "bg-mint"
                  : status === "offline"
                  ? "bg-coral"
                  : "bg-warm-400 animate-pulse"
              }`}
            />
            {status === "online"
              ? "Connected"
              : status === "offline"
              ? "Offline"
              : "Checking"}
          </span>
          <a
            href="https://github.com/openai/whisper"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-warm-700 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-warm-400 hover:bg-surface-3 hover:text-warm-200 transition-all"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="hidden sm:inline">Whisper</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
