import { base } from "$app/paths";

export const brand = {
  name: "Codaro",
  tagline: "Code. Learn. Automate. One runtime.",
  description:
    "A programmable studio where notebooks, guided learning, and automation share one document model.",
  siteUrl: "https://eddmpython.github.io/codaro",
  repoUrl: "https://github.com/eddmpython/codaro",
  get avatarUrl() { return `${base}/brand/avatar-full.png`; },
  get avatarSmallUrl() { return `${base}/brand/avatar-small.png`; },
  get avatarFaceUrl() { return `${base}/brand/avatar-face.png`; },
  get faviconUrl() { return `${base}/favicon.png`; },
  get poses() {
    return {
      hello: `${base}/brand/poses/hello.png`,
      coding: `${base}/brand/poses/coding.png`,
      working: `${base}/brand/poses/working.png`,
      success: `${base}/brand/poses/success.png`,
      thinking: `${base}/brand/poses/thinking.png`,
      search: `${base}/brand/poses/search.png`,
      building: `${base}/brand/poses/building.png`,
      reading: `${base}/brand/poses/reading.png`,
    };
  },
  get resources() {
    return [
      {
        title: "Documentation",
        description: "Installation, concepts, guides, and reference pages.",
        href: `${base}/docs`,
      },
      {
        title: "GitHub",
        description: "Source code, issues, releases, and project history.",
        href: "https://github.com/eddmpython/codaro",
      },
      {
        title: "Blog",
        description: "Build notes on runtime, learning workflows, and automation.",
        href: `${base}/blog`,
      },
      {
        title: "Search",
        description: "Find docs and blog posts from one place.",
        href: `${base}/search`,
      },
    ];
  },
};
