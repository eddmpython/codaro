import { useCallback, useEffect, useState } from "react";

import {
  type AppLocale,
  detectBrowserLocale,
  nextLocale,
  setActiveLocale,
} from "@/lib/localeCopy";

const storageKey = "codaro.displayLocale";

export function useLocaleState() {
  const [locale, setLocaleState] = useState<AppLocale>(() => storedLocale() ?? detectBrowserLocale());

  useEffect(() => {
    setActiveLocale(locale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    try {
      window.localStorage.setItem(storageKey, locale);
    } catch {
      // localStorage may be unavailable in restricted webviews.
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => nextLocale(current));
  }, []);

  return {
    locale,
    setLocale,
    toggleLocale,
  };
}

function storedLocale(): AppLocale | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === "ko" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}
