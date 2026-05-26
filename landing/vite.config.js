import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/codaro/",
  publicDir: "static",
  plugins: [react()],
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
});
