import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const dev = process.env.NODE_ENV === "development";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
      strict: false,
    }),
    paths: {
      base: dev ? "" : "/codaro",
    },
    prerender: {
      handleHttpError: "warn",
    },
  },
};

export default config;
