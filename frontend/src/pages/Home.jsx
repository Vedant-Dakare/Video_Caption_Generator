import { useMemo } from "react";
import VideoUploader from "../components/VideoUploader.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import SubtitleOptions from "../components/SubtitleOptions.jsx";
import ProcessingStatus from "../components/ProcessingStatus.jsx";
import ResultCard from "../components/ResultCard.jsx";
import PreviewModal from "../components/PreviewModal.jsx";
import { Spinner, PlayIcon, AlertIcon } from "../components/icons.jsx";

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
    <main className="min-h-screen">
      {/* ================================================================ */}
      {/*  SCREEN 1 — CREATE PROJECT / UPLOAD                              */}
      {/* ================================================================ */}
      {showHero && (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="panel animate-fade-up overflow-hidden">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              {/* Left: identity + upload */}
              <div className="space-y-6 p-6 sm:space-y-8 sm:p-10">
                <div className="mac-dots" aria-hidden="true">
                  <span /><span /><span />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                    Lumina Captions · Whisper pipeline
                  </p>
                  <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl">
                    Create your first caption project
                  </h1>
                  <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Upload a video to transcribe, translate, and caption it in multiple
                    languages — with SRT files and a captioned video as output.
                  </p>
                </div>

                <VideoUploader
                  video={video}
                  onVideoChange={onVideoChange}
                  onUpload={onUploadFile}
                  uploadProgress={uploadProgress}
                />

                <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6">
                  {[
                    { k: "SRT", v: "timecoded output" },
                    { k: "MP4", v: "captioned video" },
                    { k: "LOCAL", v: "runs on device" },
                  ].map((f) => (
                    <div key={f.k} className="border-l-2 border-accent/50 pl-3">
                      <div className="font-mono text-sm font-semibold text-foreground">{f.k}</div>
                      <div className="text-xs text-muted-soft">{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: dark promo panel with a cropped slice of the painting */}
              <div className="panel-dark promo-panel relative flex flex-col justify-between overflow-hidden p-8 sm:p-10">
                <div className="relative z-10">
                  <h2 className="max-w-sm font-display text-2xl font-semibold leading-snug text-white">
                    Subtitles in every language, without leaving your desk.
                  </h2>
                </div>

                <div className="relative z-10 mt-8 overflow-hidden rounded-lg border border-white/15 bg-black/30">
                  <div className="relative flex aspect-video items-end justify-center">
                    <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground shadow-elevated">
                      <PlayIcon className="h-4 w-4" />
                    </div>
                    <div className="relative z-10 mb-4 max-w-[85%] rounded-md bg-black/60 px-3 py-1.5 text-center text-xs text-white">
                      &ldquo;...running locally, no upload required.&rdquo;
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border-t border-white/10 px-3 py-2.5" aria-hidden="true">
                    {[6, 10, 4, 14, 8, 16, 5, 11, 7, 13, 4, 9, 6, 12, 5].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-accent/70"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

                <p className="relative z-10 mt-6 max-w-sm text-sm leading-relaxed text-white/75">
                  Whisper-powered transcription and translation, running locally — drop a file on the left to get started.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] tracking-wide text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            MP4 · MOV · AVI · MKV · WEBM — MAX 500 MB
          </p>
        </div>
      )}

      {/* ================================================================ */}
      {/*  SCREEN 2 — CONFIGURE CAPTIONS                                   */}
      {/* ================================================================ */}
      {showConfigure && (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="panel animate-fade-up p-6 sm:p-10">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="mac-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <div className="flex min-h-[44px] items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1.5 font-mono text-[11px] font-medium text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  VIDEO READY
                </span>
                <button
                  type="button"
                  onClick={onReset}
                  className="min-h-[44px] px-2 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-accent"
                >
                  Change video
                </button>
              </div>
            </div>
            <div className="mb-10 space-y-3 border-b border-border pb-8">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                Lumina Captions · Step 2 of 4
              </p>
              <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-3xl">Configure captions</h2>
            </div>

            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
              {/* Left: video preview */}
              <div className="space-y-4">
                <VideoUploader
                  video={video}
                  onVideoChange={onVideoChange}
                  onUpload={onUploadFile}
                  uploadProgress={uploadProgress}
                />
                <div className="rounded-xl bg-muted/70 px-4 py-4">
                  <p className="mb-1.5 text-xs font-semibold text-foreground">About the source language</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    The transcript language below determines how speech is recognized.
                    Subtitles are then generated from the transcript.
                  </p>
                </div>
              </div>

              {/* Right: configuration */}
              <div className="space-y-12">
                <section className="space-y-3">
                  <label className="font-display text-lg font-semibold text-foreground">
                    Original language
                  </label>
                  <LanguageSelector
                    languages={languages}
                    value={spokenLang}
                    onChange={onSpokenChange}
                    disabled={generating}
                  />
                </section>

                <div className="border-t border-border pt-10">
                  <SubtitleOptions
                    languages={languages}
                    selected={selectedLangs}
                    onToggle={onToggleLang}
                    burn={burnLang}
                    onBurnChange={onBurnChange}
                    disabled={generating}
                  />
                </div>

                <div className="space-y-3 border-t border-border pt-10">
                  <p className="font-display text-lg font-semibold text-foreground">
                    Generate
                  </p>
                  <button
                    type="button"
                    className="btn-primary w-full py-3.5 text-base"
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
                  {!canGenerate && !generating && (
                    <p className="text-center text-xs text-muted-soft">{generateLabel}</p>
                  )}
                </div>

                {error && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3.5 text-sm">
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                    <span className="leading-relaxed text-foreground">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  LOADING — Language catalogue loading                            */}
      {/* ================================================================ */}
      {showHero && languagesLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border bg-background px-5 py-3.5 text-sm text-muted-foreground shadow-panel">
            <Spinner className="h-4 w-4 text-foreground" />
            Loading languages...
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  SCREEN 3 — PROCESSING                                           */}
      {/* ================================================================ */}
      {showProcessing && (
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="panel animate-fade-up space-y-6 p-6 sm:p-8">
            <div className="mac-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Rendering captions</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Whisper is working through your video. This usually takes a minute or two.
              </p>
            </div>
            <ProcessingStatus job={job} />
            <p className="rounded-xl bg-muted/70 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
              Keep this tab open — results appear here automatically when rendering finishes.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  ERROR                                                           */}
      {/* ================================================================ */}
      {showError && (
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="panel animate-fade-up space-y-4 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-coral/30 bg-coral/10">
              <AlertIcon className="h-6 w-6 text-coral" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Processing failed
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
              {error || "An unexpected error occurred while processing your video. Please check your file and try again."}
            </p>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <button type="button" className="btn-primary" onClick={onReset}>
                Try another video
              </button>
              <button type="button" className="btn-ghost" onClick={onHealthRetry}>
                Check connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  SCREEN 4 — RESULT                                               */}
      {/* ================================================================ */}
      {(showResult || showError) && job && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6">
          {!showError && (
            <div className="panel animate-fade-up p-6 sm:p-8">
              <ResultCard
                job={job}
                languages={languages}
                onReset={onReset}
                onOpenPreview={onOpenPreview}
              />
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/*  PREVIEW MODAL                                                   */}
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
