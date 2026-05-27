import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { MobileChat } from "./routes/mobileChat";
import "./index.css";

const isMobileChatRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/m/chat");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isMobileChatRoute ? <MobileChat /> : <App />}</StrictMode>,
);
