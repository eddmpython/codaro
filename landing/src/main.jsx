import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// astryx 디자인 시스템(레이어 CSS). styles.css는 unlayered라 기존 문서/블로그 표면은 그대로 유지되고,
// astryx 컴포넌트(홈)만 astryx 레이어 스타일을 받는다.
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
import "./styles/brandTokens.css";
import "./styles.css";
import "./styles/homeAstryx.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
