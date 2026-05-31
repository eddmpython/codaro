const viteBase = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL
  : "/codaro/";

export const basePath = viteBase === "/" ? "" : viteBase.replace(/\/$/, "");

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
    "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe",
  launcherChecksumUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe.sha256",
  launcherSbomUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.spdx.json",
  releaseManifestUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/release-manifest.json",
  pythonRuntimeUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/python-runtime-win-x64.zip",
  pythonRuntimeChecksumUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/python-runtime-win-x64.zip.sha256",
  get mascotUrl() { return `${basePath}/brand/codaro-character.png`; },
  get faviconUrl() { return `${basePath}/favicon.png`; },
  appPath(path = "/") {
    const resolvedPath = path || "/";
    const withoutBase = resolvedPath.startsWith(this.basePath)
      ? resolvedPath.slice(this.basePath.length) || "/"
      : resolvedPath;
    return `${basePath}${withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`}`;
  },
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
        href: `${basePath}/docs`,
      },
      {
        title: "GitHub",
        description: "Source code, issues, releases, and project history.",
        href: "https://github.com/eddmpython/codaro",
      },
      {
        title: "Writing",
        description: "Runtime, learning workflow, and automation notes inside docs.",
        href: `${basePath}/docs/blog`,
      },
      {
        title: "Search",
        description: "Find Codaro documentation and writing from one place.",
        href: `${basePath}/search`,
      },
    ];
  },
};
