import { brand, basePath } from "./brand.js";

export function appPath(path = "/") {
  return brand.appPath(path);
}

export function stripBase(pathname) {
  if (!pathname || pathname === basePath) return "/";
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }
  return pathname || "/";
}

export function normalizePath(pathname) {
  const value = stripBase(pathname).replace(/\/index\.html$/, "");
  return value.length > 1 ? value.replace(/\/$/, "") : "/";
}

export function getBrowserPath() {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.pathname);
}

export function designSurfaceForPath(pathname) {
  if (pathname === "/learn") return "curriculum";
  if (pathname.startsWith("/learn/")) return "lesson";
  if (pathname.startsWith("/docs/blog")) return "blog";
  if (pathname.startsWith("/docs")) return "docs";
  return "landing";
}

export function runLessonHref({ category, contentId, pathId = null, runtimeTier = "web" }) {
  const params = new URLSearchParams({
    surface: "curriculum",
    category,
    lesson: contentId,
    runtime: runtimeTier === "local" ? "local" : "web",
  });
  if (pathId) params.set("path", pathId);
  return `${appPath("/run/")}?${params.toString()}#curriculum`;
}

export function legacyRedirect(path) {
  if (path === "/blog") return "/docs/blog";
  if (path.startsWith("/blog/category/")) return path.replace("/blog/category/", "/docs/blog/category/");
  if (path.startsWith("/blog/series/")) return path.replace("/blog/series/", "/docs/blog/series/");
  if (path === "/blog/codaro-public-launch-skeleton") return "/docs/blog/codaro-public-launch";
  if (path === "/docs/blog/codaro-public-launch-skeleton") return "/docs/blog/codaro-public-launch";
  if (path.startsWith("/blog/")) return path.replace("/blog/", "/docs/blog/");
  return null;
}
