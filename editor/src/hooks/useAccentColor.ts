import { useCallback, useEffect, useState } from "react";
import { ACCENT_COLORS, type AccentColor } from "@/lib/surfaceModel";

const accentStorageKey = "codaro-accent";

function isAccentColor(value: string | null): value is AccentColor {
  return Boolean(value) && ACCENT_COLORS.includes(value as AccentColor);
}

export function useAccentColor() {
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const stored = window.localStorage.getItem(accentStorageKey);
    return isAccentColor(stored) ? stored : "zinc";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (accentColor === "zinc") {
      delete root.dataset.accent;
    } else {
      root.dataset.accent = accentColor;
    }
    window.localStorage.setItem(accentStorageKey, accentColor);
  }, [accentColor]);

  const selectAccentColor = useCallback((value: AccentColor) => {
    setAccentColor(value);
  }, []);

  return {
    accentColor,
    selectAccentColor,
  };
}
