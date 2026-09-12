import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000,
});

export function uploadVideo(file, onProgress) {
  const form = new FormData();
  form.append("video", file);

  return api
    .post("/upload", form, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    })
    .then((r) => r.data);
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

export function buildUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    API_URL.endsWith("/api") &&
    normalizedPath.startsWith("/api/")
  ) {
    return `${API_URL.slice(0, -4)}${normalizedPath}`;
  }

  return `${API_URL}${normalizedPath}`;
}