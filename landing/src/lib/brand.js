import { base } from "$app/paths";

export const brand = {
  name: "Codaro",
  tagline: "Code. Learn. Automate. One runtime.",
  description:
    "A programmable studio where notebooks, guided learning, and automation share one document model.",
  siteUrl: "https://eddmpython.github.io/codaro",
  repoUrl: "https://github.com/eddmpython/codaro",
  get mascotUrl() { return `${base}/brand/codaro-character.png`; },
  get faviconUrl() { return `${base}/favicon.png`; },
  get resources() {
    return [
      {
        title: "Documentation",
        description: "Installation, concepts, operating notes, and public writing.",
        href: `${base}/docs`,
      },
      {
        title: "GitHub",
        description: "Source code, issues, releases, and project history.",
        href: "https://github.com/eddmpython/codaro",
      },
      {
        title: "Writing",
        description: "Runtime, learning workflow, and automation notes inside docs.",
        href: `${base}/docs/blog`,
      },
      {
        title: "Search",
        description: "Find Codaro documentation and writing from one place.",
        href: `${base}/search`,
      },
    ];
  },
};
