import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const apiProxyTarget = process.env.CODARO_DEV_API_PROXY?.replace(/\/$/, "");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: [dirname, path.resolve(dirname, "..")],
    },
    proxy: apiProxyTarget
      ? {
          "/api": {
            changeOrigin: true,
            target: apiProxyTarget,
          },
        }
      : undefined,
  },
  build: {
    assetsDir: "_app",
    emptyOutDir: true,
    outDir: "../src/codaro/webBuild",
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
