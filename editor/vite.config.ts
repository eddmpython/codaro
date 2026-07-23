import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const apiProxyTarget = process.env.CODARO_DEV_API_PROXY?.replace(/\/$/, "");

const codeSplitting = {
  groups: [
    {
      name: "yaml",
      test: /[\\/]node_modules[\\/].*[\\/]yaml[\\/]|[\\/]src[\\/]lib[\\/]curriculaRegistry\.ts$/,
      priority: 60,
    },
    {
      name: "curriculumMarkdown",
      test: /[\\/]components[\\/]curriculum[\\/]curriculumMarkdown[^\\/]*\.tsx?$/,
      priority: 55,
    },
    {
      name: "curriculumSurface",
      test: /[\\/]components[\\/]curriculum[\\/]curriculumSurface\.tsx$/,
      priority: 50,
    },
    {
      name: "codemirror",
      test: /@codemirror|@lezer/,
      priority: 40,
    },
    {
      name: "radix",
      test: /@radix-ui/,
      priority: 40,
    },
    {
      name: "icons",
      test: /lucide-react/,
      priority: 40,
    },
    {
      name: "xterm",
      test: /@xterm/,
      priority: 40,
    },
    {
      name: "vendor",
      test: /[\\/]node_modules[\\/]/,
      priority: 10,
    },
  ],
};

// 웹(Pages) 서빙용 빌드 변형: 같은 에디터를 /codaro/run/과 호환 /codaro/app/에 올릴 때 env로 덮는다.
// 로컬 제품 빌드(webBuild)는 기본값 그대로라 영향이 없다.
// base 값은 슬래시 없이 받는다(예: "codaro/run") - Git Bash(MSYS)가 선행 "/"를 윈도 경로로
// 변환해 망가뜨리므로 여기서 정규화한다.
const webBase = process.env.CODARO_WEB_BASE;
const webOutDir = process.env.CODARO_WEB_OUT;

export default defineConfig({
  base: webBase ? `/${webBase.replace(/^\/+|\/+$/g, "")}/` : "/",
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
    outDir: webOutDir || "../src/codaro/webBuild",
    rolldownOptions: {
      output: {
        codeSplitting,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
