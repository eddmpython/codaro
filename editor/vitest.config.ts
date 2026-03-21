import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      $lib: new URL("./src/lib", import.meta.url).pathname,
    },
  },
});
