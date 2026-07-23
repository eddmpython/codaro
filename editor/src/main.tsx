import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AppErrorBoundary } from "./components/app/appErrorBoundary";
import { CodaroThemeProvider } from "./lib/codaroDesign";
import { MobileChat } from "./routes/mobileChat";
import "./styles/layers.css";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/theme-neutral/theme.css";
import "./styles/generated/fonts.css";
import "./styles/generated/codaroTheme.css";
import "./index.css";

const isMobileChatRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/m/chat");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CodaroThemeProvider>
      <AppErrorBoundary>{isMobileChatRoute ? <MobileChat /> : <App />}</AppErrorBoundary>
    </CodaroThemeProvider>
  </StrictMode>,
);
