import { useEffect, useMemo, useState } from "react";
import { Footer, Header } from "./components/publicShell.jsx";
import { useCodaroTheme } from "./components/codaroThemeProvider.jsx";
import { brand, basePath } from "./lib/brand.js";
import { appPath, designSurfaceForPath, getBrowserPath, legacyRedirect } from "./lib/publicRouting.js";
import { buildBreadcrumbJsonLd } from "./lib/seo.js";
import { resolveRoute } from "./routes/resolvePublicRoute.jsx";

function updateMeta(meta) {
  if (typeof document === "undefined") return;
  const title = meta.title ? `${meta.title} - Codaro` : "Codaro - Python 학습과 개인 자동화 스튜디오";
  const description = meta.description || brand.description;
  const canonical = brand.toSiteUrl(meta.url || "/");
  const image = brand.toSiteUrl(meta.image || "/brand/codaro-character.png");
  const imageAlt = meta.imageAlt || `${meta.title || "Codaro"} - Codaro`;
  const twitterCard = /\.(?:png|jpe?g|webp)$/i.test(image) ? "summary_large_image" : "summary";
  document.documentElement.lang = "ko";
  document.title = title;
  setMeta("description", description);
  if (Array.isArray(meta.keywords) && meta.keywords.length) setMeta("keywords", meta.keywords.join(", "));
  else document.querySelector('meta[name="keywords"]')?.remove();
  setLink("canonical", canonical);
  setProperty("og:type", meta.type || "website");
  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:url", canonical);
  setProperty("og:image", image);
  setProperty("og:image:alt", imageAlt);
  setMeta("twitter:card", twitterCard);
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", image);
  setMeta("twitter:image:alt", imageAlt);
  updateJsonLd("codaro-route-jsonld", meta.jsonLd);
  updateJsonLd("codaro-breadcrumb-jsonld", buildBreadcrumbJsonLd(meta.url || "/", meta.title));
}

function updateJsonLd(id, value) {
  const existing = document.getElementById(id);
  if (!value) {
    existing?.remove();
    return;
  }
  const script = existing || document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
  if (!existing) document.head.appendChild(script);
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function App({ initialPath = null, initialRouteData = null, initialSearch = "" }) {
  const [path, setPath] = useState(() => initialPath || getBrowserPath());
  const [search, setSearch] = useState(initialSearch);
  const [routeData, setRouteData] = useState(initialRouteData);
  const { cycleThemeMode, resolvedTheme, setDesignSurface, themeMode } = useCodaroTheme();
  const route = useMemo(() => resolveRoute(path, routeData, search), [path, routeData, search]);

  useEffect(() => {
    const onPopState = () => {
      setRouteData(null);
      setPath(getBrowserPath());
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  useEffect(() => setDesignSurface(designSurfaceForPath(path)), [path, setDesignSurface]);

  useEffect(() => {
    updateMeta(route.meta);
  }, [route.meta]);

  useEffect(() => {
    const redirected = legacyRedirect(path);
    if (redirected) {
      window.location.replace(appPath(redirected));
    }
  }, [path]);

  function navigate(event, href) {
    if (!href.startsWith(basePath || "/")) return;
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    setRouteData(null);
    setPath(getBrowserPath());
    setSearch(new URL(href, window.location.origin).search);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className="appFrame">
      {route.hideChrome ? null : (
        <Header
          onNavigate={navigate}
          currentPath={path}
          themeMode={themeMode}
          resolvedTheme={resolvedTheme}
          onToggleTheme={cycleThemeMode}
        />
      )}
      <div className="publicRouteViewport" id="public-main" tabIndex={-1}>{route.element}</div>
      {route.hideChrome ? null : <Footer />}
    </div>
  );
}

export default App;
