import { Theme } from "@astryxdesign/core/theme";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { codaroTheme } from "../styles/generated/codaro.js";
import { resolveDensity, themeCanvasColors } from "../styles/generated/codaroTheme.ts";

const themeStorageKey = "codaro-theme";
const darkMediaQuery = "(prefers-color-scheme: dark)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const themeModes = ["system", "light", "dark"];
const CodaroThemeContext = createContext(null);
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function readStoredTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    return themeModes.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function readMediaQuery(query) {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
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
  const [matches, setMatches] = useState(() => readMediaQuery(query));

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function CodaroThemeProvider({ children, initialSurface = "landing" }) {
  const [themeMode, setThemeModeState] = useState(readStoredTheme);
  const [designSurface, setDesignSurface] = useState(initialSurface);
  const prefersDark = useMediaQuery(darkMediaQuery);
  const reducedMotion = useMediaQuery(reducedMotionQuery);
  const resolvedTheme = themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
  const densityMode = resolveDensity(designSurface);

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
    root.dataset.theme = resolvedTheme;
    root.dataset.resolvedTheme = resolvedTheme;
    root.dataset.density = densityMode;
    root.dataset.accent = "plum";
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    root.style.backgroundColor = canvasColor;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", canvasColor);
  }, [densityMode, resolvedTheme]);

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
