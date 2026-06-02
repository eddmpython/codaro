import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const apiProxyTarget = process.env.CODARO_DEV_API_PROXY?.replace(/\/$/, "");

function manualChunks(id: string) {
  // 커리큘럼 표면은 엔트리에서 분리된 lazy 청크로 고정한다(성능 예산 게이트의 named chunk 계약).
  if (id.includes("/components/curriculum/curriculumSurface")) return "curriculumSurface";
  if (!id.includes("node_modules")) return undefined;
  if (id.includes("@codemirror") || id.includes("@lezer")) return "codemirror";
  if (id.includes("@radix-ui")) return "radix";
  if (id.includes("lucide-react")) return "icons";
  // 터미널 에뮬레이터(xterm)는 무거운 단일 라이브러리라 codemirror처럼 별도 청크로 분리한다.
  // React는 순환 chunk 방지를 위해 일반 vendor에 둔다(service-candidate.md 결정).
  if (id.includes("@xterm")) return "xterm";
  if (id.includes("yaml")) return "yaml";
  return "vendor";
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
