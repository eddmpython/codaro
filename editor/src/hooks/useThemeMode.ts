import { useCodaroDesign } from "@/lib/codaroDesign";

export function useThemeMode() {
  const { cycleThemeMode, resolvedTheme, themeMode } = useCodaroDesign();

  return {
    resolvedTheme,
    themeMode,
    toggleThemeMode: cycleThemeMode,
  };
}
