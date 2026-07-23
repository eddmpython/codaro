const viteBase = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL
  : "/codaro/";

export const basePath = viteBase === "/" ? "" : viteBase.replace(/\/$/, "");

export const brand = {
  name: "Codaro",
  tagline: "Learn Python in the browser. Automate real work locally.",
  description:
    "Codaro teaches Python in the browser with executable, strongly checked lessons, then extends the same work into local files, packages, schedules, and automation.",
  siteUrl: "https://eddmpython.github.io/codaro",
  basePath: "/codaro",
  repoUrl: "https://github.com/eddmpython/codaro",
  releaseUrl: "https://github.com/eddmpython/codaro/releases/latest",
  launcherDownloadUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe",
  launcherChecksumUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/Codaro.exe.sha256",
  launcherSbomUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/codaro.spdx.json",
  releaseManifestUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/release-manifest.json",
  pythonRuntimeUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/python-runtime-win-x64.zip",
  pythonRuntimeChecksumUrl:
    "https://github.com/eddmpython/codaro/releases/latest/download/python-runtime-win-x64.zip.sha256",
  get mascotUrl() { return `${basePath}/brand/codaro-character.png`; },
  get avatarHeroUrl() { return `${basePath}/brand/avatar-hero.png`; },
  get avatarFaceUrl() { return `${basePath}/brand/avatar-face.png`; },
  get avatarSmallUrl() { return `${basePath}/brand/avatar-small.png`; },
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
    return pathWithoutBase === "/" ? `${this.siteUrl}/` : `${this.siteUrl}${pathWithoutBase}`;
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
        description: "Find Codaro lessons, documentation, and writing from one place.",
        href: `${basePath}/search`,
      },
    ];
  },
};
