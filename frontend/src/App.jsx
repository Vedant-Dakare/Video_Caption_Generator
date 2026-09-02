import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import {
  uploadVideo,
  processVideo,
  getJobStatus,
  getLanguages,
} from "./services/api.js";

const DEFAULT_LANGS = ["en", "hi", "mr"];
const POLL_MS = 1500;

export default function App() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [video, setVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [spokenLang, setSpokenLang] = useState({ code: "auto" });
  const [selectedLangs, setSelectedLangs] = useState(DEFAULT_LANGS);
  const [burnLang, setBurnLang] = useState("en");

  const [phase, setPhase] = useState("empty");
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const pollingRef = useRef(null);
  const queuedVideo = useRef(null);

  // ------------------------------------------------------------------
  // Backend health check
  // ------------------------------------------------------------------
  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setBackendStatus("online");
        return true;
      }
      setBackendStatus("offline");
      return false;
    } catch {
      setBackendStatus("offline");
      return false;
    }
  }, []);

  useEffect(() => {
    getLanguages()
      .then((langs) => setLanguages(langs))
      .catch(() => {})
      .finally(() => setLanguagesLoading(false));
    checkBackend();
  }, [checkBackend]);

  // ------------------------------------------------------------------
  // Video lifecycle
  // ------------------------------------------------------------------
  const handleVideoChange = useCallback((v) => {
    setVideo(v);
    if (!v) {
      setPhase("empty");
      queuedVideo.current = null;
    } else {
      setPhase("configure");
    }
    setError(null);
  }, []);

  const handleUpload = useCallback(async (file) => {
    setUploadProgress(0);
    try {
      const res = await uploadVideo(file, (p) => setUploadProgress(p));
      setVideo((prev) => ({
        ...(prev || {}),
        filename: res.filename,
        name: res.filename,
        size: res.size,
        size_mb: res.size_mb,
      }));
      queuedVideo.current = res.filename;
      setUploadProgress(100);
      return res;
    } catch (e) {
      setUploadProgress(null);
      throw e;
    } finally {
      setUploadProgress(null);
    }
  }, []);

  // ------------------------------------------------------------------
  // Processing pipeline
  // ------------------------------------------------------------------
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    const filename = queuedVideo.current || video?.filename;
    if (!filename || selectedLangs.length === 0) return;

    setGenerating(true);
    setError(null);
    setJob(null);
    setPhase("processing");

    const payload = {
      video_filename: filename,
      source_language: spokenLang.code === "auto" ? null : spokenLang.code,
      languages: selectedLangs,
      burn: burnLang || null,
    };

    try {
      const { job_id } = await processVideo(payload);

      stopPolling();

      const pollJob = async () => {
        try {
          const snap = await getJobStatus(job_id);
          setJob(snap);
          if (snap.status === "completed" || snap.status === "error") {
            stopPolling();
            setGenerating(false);
            setPhase(snap.status === "completed" ? "result" : "error");
            if (snap.status === "error") {
              setError(snap.error || "Processing failed.");
            }
          }
        } catch {
          // transient poll error — keep trying
        }
      };

      pollingRef.current = setInterval(pollJob, POLL_MS);
      await pollJob();
    } catch (e) {
      setGenerating(false);
      setPhase("configure");
      setError(
        e?.response?.data?.error ||
          "Could not start processing. Is the backend running?"
      );
      stopPolling();
    }
  }, [video, selectedLangs, burnLang, spokenLang, stopPolling]);

  // ------------------------------------------------------------------
  // Language & burn handlers
  // ------------------------------------------------------------------
  const handleSpokenChange = useCallback((v) => {
    setSpokenLang(v);
    setJob((j) => {
      if (j) delete j.detected_language;
      return j;
    });
  }, []);

  const handleToggleLang = useCallback(
    (code) => {
      setSelectedLangs((prev) => {
        const next = prev.includes(code)
          ? prev.filter((c) => c !== code)
          : [...prev, code];
        if (burnLang && !next.includes(burnLang)) setBurnLang(null);
        return next;
      });
      setError(null);
    },
    [burnLang]
  );

  const handleBurnChange = useCallback((code) => {
    setBurnLang(code);
  }, []);

  // ------------------------------------------------------------------
  // Reset & preview
  // ------------------------------------------------------------------
  const handleReset = useCallback(() => {
    stopPolling();
    setJob(null);
    setError(null);
    setGenerating(false);
    setVideo(null);
    queuedVideo.current = null;
    setPreview(null);
    setPhase("empty");
  }, [stopPolling]);

  const handleOpenPreview = useCallback((src) => {
    setPreview({ src, title: queuedVideo.current || "Captioned Video" });
  }, []);

  // Cleanup polling on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return (
    <div className="min-h-screen">
      <Navbar status={backendStatus} />
      <Home
        phase={phase}
        languages={languages}
        languagesLoading={languagesLoading}
        video={video}
        uploadProgress={uploadProgress}
        spokenLang={spokenLang}
        selectedLangs={selectedLangs}
        burnLang={burnLang}
        generating={generating}
        job={job}
        error={error}
        preview={preview}
        onVideoChange={handleVideoChange}
        onUploadFile={handleUpload}
        onSpokenChange={handleSpokenChange}
        onToggleLang={handleToggleLang}
        onBurnChange={handleBurnChange}
        onGenerate={handleGenerate}
        onReset={handleReset}
        onOpenPreview={handleOpenPreview}
        onClosePreview={() => setPreview(null)}
        onHealthRetry={() => {
          setError(null);
          checkBackend();
        }}
      />
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-slate-600">
          Lumina Captions · Whisper transcription · FFmpeg rendering · Runs locally & free
        </p>
      </footer>
    </div>
  );
}
