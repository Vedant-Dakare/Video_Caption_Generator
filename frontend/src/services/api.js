import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 300000, // uploads can be slow; processing is async via polling
});

export function uploadVideo(file, onProgress) {
  const form = new FormData();
  form.append("video", file);
  return api.post("/upload", form, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  }).then((r) => r.data);
}

export function processVideo(payload) {
  return api.post("/process", payload).then((r) => r.data);
}

export async function getJobStatus(jobId) {
  const r = await api.get(`/status/${jobId}`);
  return r.data;
}

export async function getLanguages() {
  const r = await api.get("/languages");
  return r.data.languages;
}

// A captioned video / SRT URL. In dev these are proxied through Vite too.
export function buildUrl(path) {
  if (!path) return null;
  return path;
}
