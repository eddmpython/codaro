import { base } from "$app/paths";

export const brand = {
  name: "Codaro",
  tagline: "Code, learning, and automation in one local studio.",
  description:
    "Codaro is a local-first programmable studio for learning Python, running notebook-style code, and turning repeatable work into desktop automation.",
  siteUrl: "https://eddmpython.github.io/codaro",
  basePath: "/codaro",
  repoUrl: "https://github.com/eddmpython/codaro",
  releaseUrl: "https://github.com/eddmpython/codaro/releases/latest",
  launcherDownloadUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/CodaroLauncher.exe",
  launcherChecksumUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/CodaroLauncher.exe.sha256",
  launcherSbomUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/CodaroLauncher.spdx.json",
  get mascotUrl() { return `${base}/brand/codaro-character.png`; },
  get faviconUrl() { return `${base}/favicon.png`; },
  toSiteUrl(path = "/") {
    const resolvedPath = path || "/";
    const pathWithoutBase = resolvedPath.startsWith(this.basePath)
      ? resolvedPath.slice(this.basePath.length) || "/"
      : resolvedPath;
    return pathWithoutBase === "/" ? this.siteUrl : `${this.siteUrl}${pathWithoutBase}`;
  },
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
