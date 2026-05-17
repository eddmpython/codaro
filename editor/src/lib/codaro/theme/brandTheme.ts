export { palette, semantic, radius, motion, typography, zIndex } from "$lib/theme/tokens";

export const colors = {
  accent:           "var(--state-accent-base)",
  accentForeground: "var(--state-accent-fg)",
  accentSoft:       "var(--state-accent-soft)",
  accentMuted:      "var(--state-accent-border)",
  accentRing:       "var(--state-accent-ring)",

  background:      "var(--surface-base)",
  foreground:      "var(--text-primary)",
  surface:         "var(--surface-1)",
  surfaceHover:    "var(--surface-2)",
  border:          "var(--border)",
  muted:           "var(--surface-2)",
  mutedForeground: "var(--text-secondary)",

  glassBg:          "var(--surface-overlay)",
  glassStroke:      "var(--border-subtle)",
  glassBgLight:     "var(--surface-overlay)",
  glassStrokeLight: "var(--border-subtle)",

  destructive: "var(--state-destructive-base)",
  success:     "var(--state-success-base)",
  warning:     "var(--state-warning-base)",
  info:        "var(--state-info-base)",
} as const;

export const shadow = {
  glass: "var(--elevation-glass)",
  card:  "var(--elevation-md)",
  glow:  "0 0 12px var(--state-accent-soft)",
  input: "var(--elevation-sm)",
} as const;

export const blur = {
  glass: "blur(20px) saturate(1.4)",
  heavy: "blur(28px) saturate(1.5)",
} as const;
