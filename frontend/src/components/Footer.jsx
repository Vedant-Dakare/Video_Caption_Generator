export default function Footer() {
  return (
    <footer className="relative">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 bg-background/80 px-4 py-2 shadow-subtle backdrop-blur-sm">
            <span className="font-display text-xs font-semibold text-foreground">Lumina Captions</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <span className="text-xs text-muted-foreground">Powered by Whisper + FFmpeg</span>
          </div>
          <p className="inline-flex min-h-[40px] items-center rounded-full border border-white/20 bg-background/80 px-4 py-2 font-mono text-[11px] font-medium tracking-wide text-foreground shadow-subtle backdrop-blur-sm">
            RUNS LOCALLY · NO DATA COLLECTION
          </p>
        </div>
      </div>
    </footer>
  );
}
