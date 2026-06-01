import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/codaro/",
  publicDir: "static",
  plugins: [react()],
  build: {
    outDir: "build",
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 350,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("node_modules/marked") || id.includes("node_modules/gray-matter") || id.includes("node_modules/yaml")) {
            return "vendor-markdown";
          }
          if (id.includes("node_modules/pdf-lib") || id.includes("node_modules/pdfjs-dist") || id.includes("node_modules/fflate")) {
            return "vendor-pdf";
          }
          if (id.includes("src/lib/generated/docsNav") || id.includes("src/lib/generated/posts")) {
            return "data-content";
          }
          if (id.includes("src/lib/generated/searchIndex")) {
            return "data-search";
          }
          if (id.includes("src/lib/tools/")) {
            return "tools";
          }
          return undefined;
        },
      },
    },
  },
});
