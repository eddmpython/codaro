import { useCodaroDesign } from "@/lib/codaroDesign";

export function useThemeMode() {
  const { cycleThemeMode, resolvedTheme, setThemeMode, themeMode } = useCodaroDesign();

  return {
    resolvedTheme,
    setThemeMode,
    themeMode,
    toggleThemeMode: cycleThemeMode,
  };
}
