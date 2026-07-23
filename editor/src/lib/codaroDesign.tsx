import { Theme } from "@astryxdesign/core/theme";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { codaroTheme } from "@/styles/generated/codaro.js";
import {
  normalizeAccentId,
  resolveDensity,
  type AccentId,
  type CodaroThemeMode,
  type DesignRuntimeState,
  type DesignSurface,
} from "@/styles/generated/codaroTheme";

const themeStorageKey = "codaro-theme";
const accentStorageKey = "codaro-accent";
const themeModes: readonly CodaroThemeMode[] = ["system", "light", "dark"];

type CodaroDesignContextValue = DesignRuntimeState & {
  cycleThemeMode: () => void;
  selectAccentId: (accentId: AccentId) => void;
  setDesignSurface: (surface: DesignSurface) => void;
  setThemeMode: (mode: CodaroThemeMode) => void;
};

const CodaroDesignContext = createContext<CodaroDesignContextValue | null>(null);

function readThemeMode(): CodaroThemeMode {
  const stored = window.localStorage.getItem(themeStorageKey);
  return themeModes.includes(stored as CodaroThemeMode) ? (stored as CodaroThemeMode) : "system";
}

function readMediaQuery(query: string): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => readMediaQuery(query));
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function CodaroThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<CodaroThemeMode>(readThemeMode);
  const [accentId, setAccentId] = useState<AccentId>(() =>
    normalizeAccentId(window.localStorage.getItem(accentStorageKey)),
  );
  const [designSurface, setDesignSurface] = useState<DesignSurface>("chat");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const resolvedTheme = themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
  const densityMode = resolveDensity(designSurface);

  const setThemeMode = useCallback((mode: CodaroThemeMode) => {
    setThemeModeState(mode);
    if (mode === "system") window.localStorage.removeItem(themeStorageKey);
    else window.localStorage.setItem(themeStorageKey, mode);
  }, []);

  const cycleThemeMode = useCallback(() => {
    const nextIndex = (themeModes.indexOf(themeMode) + 1) % themeModes.length;
    setThemeMode(themeModes[nextIndex]);
  }, [setThemeMode, themeMode]);

  const selectAccentId = useCallback((nextAccent: AccentId) => {
    const normalized = normalizeAccentId(nextAccent);
    setAccentId(normalized);
    window.localStorage.setItem(accentStorageKey, normalized);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = accentId;
    root.dataset.density = densityMode;
    root.dataset.resolvedTheme = resolvedTheme;
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [accentId, densityMode, resolvedTheme]);

  const value = useMemo<CodaroDesignContextValue>(
    () => ({
      accentId,
      cycleThemeMode,
      densityMode,
      reducedMotion,
      resolvedTheme,
      selectAccentId,
      setDesignSurface,
      setThemeMode,
      themeMode,
    }),
    [accentId, cycleThemeMode, densityMode, reducedMotion, resolvedTheme, selectAccentId, setThemeMode, themeMode],
  );

  return (
    <CodaroDesignContext.Provider value={value}>
      <Theme mode={themeMode} theme={codaroTheme}>
        <div
          data-accent={accentId}
          data-astryx-theme="codaro"
          data-density={densityMode}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      </Theme>
    </CodaroDesignContext.Provider>
  );
}

export function useCodaroDesign(): CodaroDesignContextValue {
  const context = useContext(CodaroDesignContext);
  if (!context) throw new Error("useCodaroDesign must be used inside CodaroThemeProvider");
  return context;
}
