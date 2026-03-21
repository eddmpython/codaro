export const colors = {
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  accentSoft: "color-mix(in srgb, var(--accent) 12%, transparent)",
  accentMuted: "color-mix(in srgb, var(--accent) 25%, transparent)",
  accentRing: "color-mix(in srgb, var(--accent) 40%, transparent)",

  background: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--card)",
  surfaceHover: "var(--sage-3)",
  border: "var(--border)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",

  glassBg: "rgba(24, 24, 27, 0.7)",
  glassStroke: "rgba(255, 255, 255, 0.06)",
  glassBgLight: "rgba(250, 250, 250, 0.8)",
  glassStrokeLight: "rgba(0, 0, 0, 0.06)",

  destructive: "var(--destructive)",
  success: "var(--grass-9)",
  warning: "var(--yellow-9)",
  info: "var(--blue-9)",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadow = {
  glass: "0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
  card: "0 2px 8px rgba(0, 0, 0, 0.15)",
  glow: "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)",
  input: "0 1px 2px rgba(0, 0, 0, 0.05)",
} as const;

export const blur = {
  glass: "blur(12px)",
  heavy: "blur(24px)",
} as const;

export const typography = {
  mono: "'Fira Mono', monospace",
  sans: "'PT Sans', system-ui, sans-serif",
  heading: "'Lora', serif",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
} as const;
