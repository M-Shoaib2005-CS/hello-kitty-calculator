import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the build works inside Capacitor's file:// WebView.
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
