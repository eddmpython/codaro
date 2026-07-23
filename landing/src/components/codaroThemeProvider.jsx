import { Theme } from "@astryxdesign/core/theme";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useBrowserLayoutEffect } from "../lib/useBrowserLayoutEffect.js";
import { codaroTheme } from "../styles/generated/codaro.js";
import { resolveDensity, themeCanvasColors } from "../styles/generated/codaroTheme.ts";

const themeStorageKey = "codaro-theme";
const darkMediaQuery = "(prefers-color-scheme: dark)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const themeModes = ["system", "light", "dark"];
const CodaroThemeContext = createContext(null);

function readStoredTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    return themeModes.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function storeThemeMode(mode) {
  try {
    if (mode === "system") window.localStorage.removeItem(themeStorageKey);
    else window.localStorage.setItem(themeStorageKey, mode);
  } catch {
    // The selected mode still applies for this session when storage is unavailable.
  }
}

function useMediaQuery(query) {
  const [state, setState] = useState({ matches: false, ready: false });

  useBrowserLayoutEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia(query);
    const onChange = (event) => setState({ matches: event.matches, ready: true });
    setState({ matches: media.matches, ready: true });
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return state;
}

export function CodaroThemeProvider({ children, initialSurface = "landing" }) {
  const [themeMode, setThemeModeState] = useState("system");
  const [designSurface, setDesignSurface] = useState(initialSurface);
  const darkPreference = useMediaQuery(darkMediaQuery);
  const reducedMotionPreference = useMediaQuery(reducedMotionQuery);
  const prefersDark = darkPreference.matches;
  const reducedMotion = reducedMotionPreference.matches;
  const resolvedTheme = themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
  const densityMode = resolveDensity(designSurface);

  useBrowserLayoutEffect(() => {
    const storedTheme = readStoredTheme();
    setThemeModeState((currentTheme) => (
      currentTheme === storedTheme ? currentTheme : storedTheme
    ));
  }, []);

  const setThemeMode = useCallback((nextMode) => {
    const normalized = themeModes.includes(nextMode) ? nextMode : "system";
    setThemeModeState(normalized);
    storeThemeMode(normalized);
  }, []);

  const cycleThemeMode = useCallback(() => {
    setThemeMode(themeModes[(themeModes.indexOf(themeMode) + 1) % themeModes.length]);
  }, [setThemeMode, themeMode]);

  useBrowserLayoutEffect(() => {
    const root = document.documentElement;
    const canvasColor = themeCanvasColors[resolvedTheme];
    root.dataset.density = densityMode;
    root.dataset.accent = "plum";
    if (themeMode !== "system" || darkPreference.ready) {
      root.dataset.theme = resolvedTheme;
      root.dataset.resolvedTheme = resolvedTheme;
      root.classList.toggle("dark", resolvedTheme === "dark");
      root.style.colorScheme = resolvedTheme;
      root.style.backgroundColor = canvasColor;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      themeColor?.setAttribute("content", canvasColor);
    }
  }, [darkPreference.ready, densityMode, resolvedTheme, themeMode]);

  const value = useMemo(
    () => ({
      accentId: "plum",
      cycleThemeMode,
      densityMode,
      reducedMotion,
      resolvedTheme,
      setDesignSurface,
      setThemeMode,
      themeMode,
    }),
    [cycleThemeMode, densityMode, reducedMotion, resolvedTheme, setThemeMode, themeMode],
  );

  return (
    <CodaroThemeContext.Provider value={value}>
      <Theme mode={themeMode} theme={codaroTheme}>
        <div
          data-accent="plum"
          data-density={densityMode}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      </Theme>
    </CodaroThemeContext.Provider>
  );
}

export function useCodaroTheme() {
  const context = useContext(CodaroThemeContext);
  if (!context) throw new Error("useCodaroTheme must be used inside CodaroThemeProvider");
  return context;
}
