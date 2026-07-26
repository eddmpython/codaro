import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AppErrorBoundary } from "./components/app/appErrorBoundary";
import { CodaroThemeProvider } from "./lib/codaroDesign";
import "./styles/layers.css";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/theme-neutral/theme.css";
import "./styles/generated/fonts.css";
import "./styles/generated/codaroTheme.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CodaroThemeProvider>
      <AppErrorBoundary><App /></AppErrorBoundary>
    </CodaroThemeProvider>
  </StrictMode>,
);
