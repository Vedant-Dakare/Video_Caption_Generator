import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Vite dev server proxies API calls to the Flask backend so the frontend
// always talks to the same-origin "/api". This avoids CORS issues in dev and
// means we can point VITE_PROXY_TARGET at the deployed backend too.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
