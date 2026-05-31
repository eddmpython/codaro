import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

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
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["favicon.png", "favicon.svg"],
      manifest: false,
      workbox: {
        // 재빌드 시 옛 SW/캐시가 남아 사라진 해시 청크를 요청하다 MIME 오류로 빈 화면이 되던 문제를 막는다.
        // 새 SW를 즉시 활성화(skipWaiting)하고 열린 탭을 장악(clientsClaim)하며 옛 precache를 정리한다.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/ws\//, /^\/_app\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/curriculum\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "codaro-curriculum",
              networkTimeoutSeconds: 4,
            },
          },
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
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
