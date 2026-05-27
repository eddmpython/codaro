import { useCallback, useEffect, useState } from "react";
import type { ThemeMode } from "@/lib/surfaceModel";
import { usePrefersDark } from "@/hooks/usePrefersDark";

const themeStorageKey = "codaro-theme";

export function useThemeMode() {
  const prefersDark = usePrefersDark();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(themeStorageKey);
    if (stored === "light" || stored === "dark") return stored;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(themeStorageKey);
    if (stored === "light" || stored === "dark") return;
    setThemeMode(prefersDark ? "dark" : "light");
  }, [prefersDark]);

  useEffect(() => {
    window.document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem(themeStorageKey, themeMode);
  }, [themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return {
    themeMode,
    toggleThemeMode,
  };
}
