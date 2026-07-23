import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import { CodaroThemeProvider } from "./components/codaroThemeProvider.jsx";
import { designSurfaceForPath, getBrowserPath } from "./lib/publicRouting.js";
import "./styles/layers.css";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
import "./styles/generated/fonts.css";
import "./styles/generated/codaroTheme.css";
import "./styles.css";
import "./styles/homeAstryx.css";
import "./styles/learnExplorer.css";
import "./styles/publicShell.css";
import "./styles/lessonAstryx.css";

const root = document.getElementById("root");
const routeData = readRouteData();
const initialPath = getBrowserPath();
const hasPrerenderedMarkup = root.hasChildNodes();
const initialSearch = hasPrerenderedMarkup ? "" : window.location.search;
const application = (
  <React.StrictMode>
    <CodaroThemeProvider initialSurface={designSurfaceForPath(initialPath)}>
      <App initialPath={initialPath} initialRouteData={routeData} initialSearch={initialSearch} />
    </CodaroThemeProvider>
  </React.StrictMode>
);

if (hasPrerenderedMarkup) hydrateRoot(root, application);
else createRoot(root).render(application);

function readRouteData() {
  const element = document.getElementById("codaro-route-data");
  if (!element?.textContent) return null;
  try {
    return JSON.parse(element.textContent);
  } catch {
    return null;
  }
}
