import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const apiProxyTarget = process.env.CODARO_DEV_API_PROXY?.replace(/\/$/, "");

function manualChunks(id: string) {
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("@codemirror") || id.includes("@lezer")) return "codemirror";
  if (id.includes("@radix-ui")) return "radix";
  if (id.includes("lucide-react")) return "icons";
  if (id.includes("yaml")) return "yaml";
  return "vendor";
}

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
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
