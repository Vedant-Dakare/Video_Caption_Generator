import { useMemo } from "react";
import VideoUploader from "../components/VideoUploader.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import SubtitleOptions from "../components/SubtitleOptions.jsx";
import ProcessingStatus from "../components/ProcessingStatus.jsx";
import ResultCard from "../components/ResultCard.jsx";
import PreviewModal from "../components/PreviewModal.jsx";
import { Spinner, WandIcon } from "../components/icons.jsx";

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Gradient orbs */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent-500/[0.07] blur-[120px]" />
      <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-accent-600/[0.05] blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent-400/[0.03] blur-[80px]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Horizontal lines — film/timeline inspired */}
      <div className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="absolute left-0 right-0 top-2/3 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </div>
  );
}

function StepIndicator({ number, label, active, completed }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`
          grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold font-mono
          transition-all duration-300
          ${completed
            ? "bg-mint/15 text-mint border border-mint/20"
            : active
            ? "bg-accent-500/15 text-accent-400 border border-accent-500/20"
            : "bg-white/[0.04] text-slate-600 border border-white/[0.06]"
          }
        `}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`text-sm transition-colors duration-300 ${
          active ? "text-white font-medium" : completed ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function Home(props) {
  const {
    phase,
    languages,
    languagesLoading,
    video,
    uploadProgress,
    spokenLang,
    selectedLangs,
    burnLang,
    generating,
    job,
    error,
    preview,
    onVideoChange,
    onUploadFile,
    onSpokenChange,
    onToggleLang,
    onBurnChange,
    onGenerate,
    onReset,
    onOpenPreview,
    onClosePreview,
    onHealthRetry,
  } = props;

  const canGenerate =
    phase === "configure" &&
    !generating &&
    video &&
    video.filename &&
    selectedLangs.length > 0;

  const generateLabel = useMemo(() => {
    if (!video) return "Upload a video first";
    if (!video.filename) return "Uploading…";
    if (selectedLangs.length === 0) return "Select at least one language";
    if (burnLang) {
      const name = languages.find((l) => l.code === burnLang)?.name || burnLang.toUpperCase();
      return `Generate & burn ${name}`;
    }
    return "Generate Captions";
  }, [video, selectedLangs, burnLang, languages]);

  const showHero = phase === "empty";
  const showConfigure = phase === "configure";
  const showProcessing = phase === "processing";
  const showResult = phase === "result";
  const showError = phase === "error";

  return (
    <main className="relative">
      {/* ================================================================ */}
      {/*  HERO — Cinematic landing when no video is selected              */}
      {/* ================================================================ */}
      {showHero && (
        <section className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-5 py-16 sm:py-24">
          <HeroBackground />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/[0.08] px-4 py-1.5 text-xs font-medium text-accent-300 animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse-slow" />
              Powered by Whisper AI
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-white text-balance animate-fade-up animate-delay-75">
              Every video speaks.{" "}
              <span className="text-gradient">We translate.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-lg text-base sm:text-lg text-slate-400 leading-relaxed animate-fade-up animate-delay-150">
              Transcribe, translate, and caption your videos with AI.
              <br className="hidden sm:block" />
              Locally. Privately. For free.
            </p>

            {/* Upload zone */}
            <div className="mt-10 sm:mt-12 animate-fade-up animate-delay-300 max-w-xl mx-auto">
              <VideoUploader
                video={video}
                onVideoChange={onVideoChange}
                onUpload={onUploadFile}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* Format hint */}
            <p className="mt-5 text-xs text-slate-600 animate-fade-up animate-delay-500">
              MP4 · MOV · MKV · WEBM · AVI — up to 500 MB
            </p>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/*  CONFIGURE — Video selected, configure subtitles                 */}
      {/* ================================================================ */}
      {showConfigure && (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:py-12 animate-fade-up">
          {/* Compact progress steps */}
          <div className="mb-8 flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            <StepIndicator number={1} label="Upload" completed />
            <div className="h-px w-8 bg-white/[0.08] hidden sm:block" />
            <StepIndicator number={2} label="Configure" active />
            <div className="h-px w-8 bg-white/[0.08] hidden sm:block" />
            <StepIndicator number={3} label="Generate" />
          </div>

          {/* Two-column layout */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* Left: Video preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="step-number">1</span>
                <h2 className="section-title">Your Video</h2>
              </div>
              <VideoUploader
                video={video}
                onVideoChange={onVideoChange}
                onUpload={onUploadFile}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* Right: Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="step-number">2</span>
                <h2 className="section-title">Configure Subtitles</h2>
              </div>

              <div className="card p-5 sm:p-6 space-y-6">
                <LanguageSelector
                  languages={languages}
                  value={spokenLang}
                  onChange={onSpokenChange}
                  disabled={generating}
                />

                <div className="divider" />

                <SubtitleOptions
                  languages={languages}
                  selected={selectedLangs}
                  onToggle={onToggleLang}
                  burn={burnLang}
                  onBurnChange={onBurnChange}
                  disabled={generating}
                />

                <div className="divider" />

                {/* Generate CTA */}
                <button
                  type="button"
                  className="btn-primary w-full text-base"
                  disabled={!canGenerate}
                  onClick={onGenerate}
                >
                  {generating ? (
                    <>
                      <Spinner className="h-4 w-4" /> Processing…
                    </>
                  ) : (
                    <>
                      <WandIcon className="h-4 w-4" />
                      {generateLabel}
                    </>
                  )}
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="rounded-2xl border border-coral/15 bg-coral/[0.04] p-4 animate-fade-up">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-coral/10 text-coral">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-coral mb-1">Something went wrong</p>
                      <p className="text-xs text-slate-400">{error}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-sm text-coral hover:text-coral hover:bg-coral/10 hover:border-coral/20 shrink-0"
                      onClick={onHealthRetry}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/*  LOADING — Language catalogue loading                             */}
      {/* ================================================================ */}
      {showHero && languagesLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-surface-2 px-6 py-4 text-sm text-slate-400">
            <Spinner className="h-4 w-4" />
            Loading languages…
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  PROCESSING — Cinematic processing visualization                  */}
      {/* ================================================================ */}
      {showProcessing && (
        <section className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
          <ProcessingStatus job={job} />
        </section>
      )}

      {/* ================================================================ */}
      {/*  ERROR — Global error state                                       */}
      {/* ================================================================ */}
      {showError && (
        <section className="mx-auto max-w-2xl px-5 py-8 sm:py-12 animate-fade-up">
          <div className="card p-6 sm:p-8 text-center">
            <div className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-coral/10 text-coral mb-4">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Processing failed
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              {error || "An unexpected error occurred while processing your video."}
            </p>
            <button type="button" className="btn-ghost" onClick={onReset}>
              Try again
            </button>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/*  RESULTS — Generated outputs                                      */}
      {/* ================================================================ */}
      {(showResult || showError) && job && (
        <section className="mx-auto max-w-3xl px-5 pb-16">
          {!showError && (
            <ResultCard
              job={job}
              languages={languages}
              onReset={onReset}
              onOpenPreview={onOpenPreview}
            />
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/*  PREVIEW MODAL                                                    */}
      {/* ================================================================ */}
      {preview && (
        <PreviewModal
          src={preview.src}
          title={preview.title}
          onClose={onClosePreview}
        />
      )}
    </main>
  );
}
