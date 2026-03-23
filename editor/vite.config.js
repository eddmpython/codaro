import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

function vendorChunkName(id) {
  if (!id.includes("node_modules")) {
    return undefined;
  }
  if (id.includes("lucide-svelte")) {
    return "vendor-lucide";
  }
  if (id.includes("@codemirror") || id.includes("@lezer")) {
    return "vendor-editor";
  }
  if (id.includes("@xyflow")) {
    return "vendor-xyflow";
  }
  if (id.includes("marked") || id.includes("dompurify")) {
    return "vendor-content";
  }
  if (id.includes("bits-ui")) {
    return "vendor-ui";
  }
  return "vendor";
}

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          return vendorChunkName(id);
        }
      }
    }
  }
});
