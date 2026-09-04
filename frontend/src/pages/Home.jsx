import { useMemo } from "react";
import VideoUploader from "../components/VideoUploader.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import SubtitleOptions from "../components/SubtitleOptions.jsx";
import ProcessingStatus from "../components/ProcessingStatus.jsx";
import ResultCard from "../components/ResultCard.jsx";
import PreviewModal from "../components/PreviewModal.jsx";
import { Spinner } from "../components/icons.jsx";
import { FilmIcon, SubtitleIcon, GlobeIcon, ScissorsIcon, LayersIcon } from "../components/icons.jsx";

function WorkflowRow() {
  const steps = [
    { icon: FilmIcon, label: "VIDEO" },
    { icon: ScissorsIcon, label: "AUDIO" },
    { icon: GlobeIcon, label: "TRANSCRIBE" },
    { icon: SubtitleIcon, label: "TRANSLATE" },
    { icon: LayersIcon, label: "RENDER" },
  ];
  return (
    <div className="hidden lg:flex items-center gap-2 mt-8">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-warm-700 rounded-md px-2.5 py-1.5 bg-surface-1">
            <s.icon className="h-3 w-3 text-warm-400" />
            <span className="font-mono text-[9px] tracking-wider text-warm-400">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <span className="h-px w-3 bg-warm-700" />
          )}
        </div>
      ))}
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
    if (!video.filename) return "Uploading...";
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
      {/*  HERO — Editorial composition: identity left, workspace right    */}
      {/* ================================================================ */}
      {showHero && (
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] items-center py-14 sm:py-20">
            {/* LEFT: Product identity */}
            <div className="space-y-7">
              <div className="flex items-center gap-2 animate-fade-up">
                <span className="mono-label text-accent">WHISPER / POST-PRODUCTION</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-warm-100 animate-fade-up animate-delay-75">
                Subtitle your video
                <br />
                <span className="text-accent">in every language.</span>
              </h1>

              <p className="text-base sm:text-lg text-warm-300 leading-relaxed max-w-md animate-fade-up animate-delay-150">
                An AI transcription pipeline for video that detects the spoken language,
                generates timecoded subtitles, translates them, and burns captions
                directly into the file.
              </p>

              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 animate-fade-up animate-delay-300">
                {[
                  { k: "SRT", v: "timecoded output" },
                  { k: "20", v: "languages" },
                  { k: "LOCAL", v: "runs on device" },
                ].map((f) => (
                  <div key={f.k} className="border-l border-warm-700 pl-3">
                    <div className="font-mono text-sm font-semibold text-warm-100">{f.k}</div>
                    <div className="text-xs text-warm-400">{f.v}</div>
                  </div>
                ))}
              </div>

              <WorkflowRow />
            </div>

            {/* RIGHT: Upload workspace */}
            <div className="animate-fade-up animate-delay-100">
              <VideoUploader
                video={video}
                onVideoChange={onVideoChange}
                onUpload={onUploadFile}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  CONFIGURE — Video selected, configure subtitles                 */}
      {/* ================================================================ */}
      {showConfigure && (
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16 animate-fade-up">
          {/* Phase header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-warm-700/60 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-accent">02 / CONFIGURE</span>
              <h2 className="font-display text-2xl font-bold text-warm-100">Configure captions</h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-2 text-warm-400">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                Video ready
              </span>
              <button
                type="button"
                onClick={onReset}
                className="text-warm-400 hover:text-warm-100 transition-colors mono-label underline underline-offset-4"
              >
                CHANGE VIDEO
              </button>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1fr_1.25fr]">
            {/* Left: Video preview / media */}
            <div className="space-y-4">
              <VideoUploader
                video={video}
                onVideoChange={onVideoChange}
                onUpload={onUploadFile}
                uploadProgress={uploadProgress}
              />

              {/* Capture preview note */}
              <div className="border border-warm-700 rounded-md px-4 py-3 bg-surface-1">
                <p className="mono-label mb-1">SOURCE</p>
                <p className="text-sm text-warm-200 leading-relaxed">
                  The transcript language below determines how speech is recognized.
                  Subtitles are then generated from the transcript.
                </p>
              </div>
            </div>

            {/* Right: Configuration */}
            <div className="space-y-6">
              {/* Spoken language */}
              <section className="border-b border-warm-700/60 pb-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-xs text-accent">STEP 01</span>
                  <label className="font-display text-base font-semibold text-warm-100">
                    Original language
                  </label>
                </div>
                <LanguageSelector
                  languages={languages}
                  value={spokenLang}
                  onChange={onSpokenChange}
                  disabled={generating}
                />
              </section>

              {/* Subtitle languages + burn */}
              <div>
                <SubtitleOptions
                  languages={languages}
                  selected={selectedLangs}
                  onToggle={onToggleLang}
                  burn={burnLang}
                  onBurnChange={onBurnChange}
                  disabled={generating}
                />
              </div>

              {/* Generate */}
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-mono text-xs text-accent">STEP 04</span>
                  <label className="font-display text-base font-semibold text-warm-100">
                    Generate
                  </label>
                </div>
                <button
                  type="button"
                  className="btn-primary w-full py-3 text-base"
                  disabled={!canGenerate}
                  onClick={onGenerate}
                >
                  {generating ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    generateLabel
                  )}
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-3 rounded-md border border-coral/30 bg-coral/[0.06] px-4 py-3 animate-fade-up">
                  <span className="text-coral-light mt-0.5">!</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-coral-light mb-0.5">Something went wrong</p>
                    <p className="text-xs text-warm-400">{error}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-sm text-coral-light hover:text-coral-light shrink-0"
                    onClick={onHealthRetry}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  LOADING — Language catalogue loading                             */}
      {/* ================================================================ */}
      {showHero && languagesLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/90">
          <div className="flex items-center gap-3 rounded-md border border-warm-700 bg-surface-2 px-5 py-3 text-sm text-warm-300">
            <Spinner className="h-4 w-4" />
            Loading languages...
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  PROCESSING                                                       */}
      {/* ================================================================ */}
      {showProcessing && (
        <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16 animate-fade-up">
          <ProcessingStatus job={job} />
        </div>
      )}

      {/* ================================================================ */}
      {/*  ERROR                                                            */}
      {/* ================================================================ */}
      {showError && (
        <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16 animate-fade-up">
          <div className="panel rounded-md p-8 sm:p-12 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-coral/40 bg-coral/10">
              <span className="text-lg font-semibold text-coral-light">!</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-warm-100 mb-3">
              Processing failed
            </h2>
            <p className="text-sm text-warm-300 mb-8 max-w-md mx-auto leading-relaxed">
              {error || "An unexpected error occurred while processing your video. Please check your file and try again."}
            </p>
            <button type="button" className="btn-primary" onClick={onReset}>
              Try another video
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  RESULT                                                           */}
      {/* ================================================================ */}
      {(showResult || showError) && job && (
        <div className="mx-auto max-w-3xl px-5 pb-16">
          {!showError && (
            <ResultCard
              job={job}
              languages={languages}
              onReset={onReset}
              onOpenPreview={onOpenPreview}
            />
          )}
        </div>
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
