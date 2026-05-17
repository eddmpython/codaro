export const palette = {
  zinc: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    750: "#2E2E33",
    800: "#27272A",
    850: "#1F1F23",
    900: "#18181B",
    925: "#0E0E11",
    950: "#09090B",
  },
  sky: {
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
  },
  blue: {
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
  },
  violet: {
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  emerald: {
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
  },
  amber: {
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
  },
  rose: {
    300: "#FDA4AF",
    400: "#FB7185",
    500: "#F43F5E",
    600: "#E11D48",
  },
} as const;

export const semantic = {
  surface: {
    sunken: palette.zinc[950],
    base: palette.zinc[925],
    raised1: palette.zinc[900],
    raised2: palette.zinc[850],
    raised3: palette.zinc[800],
  },
  text: {
    primary: palette.zinc[100],
    secondary: palette.zinc[400],
    muted: palette.zinc[500],
    inverse: palette.zinc[900],
  },
  border: {
    subtle: "rgba(255,255,255,0.06)",
    base: palette.zinc[800],
    strong: palette.zinc[700],
  },
  state: {
    accent: palette.sky[500],
    success: palette.emerald[500],
    warning: palette.amber[500],
    destructive: palette.rose[500],
    info: palette.sky[400],
  },
  stripe: {
    idle: palette.zinc[700],
    stale: palette.amber[500],
    running: palette.sky[500],
    queued: palette.zinc[500],
    error: palette.rose[500],
    success: palette.emerald[500],
  },
  modeHue: {
    notebook: palette.blue[500],
    learning: palette.violet[500],
    app: palette.emerald[500],
  },
} as const;

export const radius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  pill: "9999px",
} as const;

export const motion = {
  duration: {
    instant: "80ms",
    quick: "140ms",
    base: "220ms",
    slow: "360ms",
  },
  easing: {
    standard: "cubic-bezier(.2, 0, 0, 1)",
    decel: "cubic-bezier(0, 0, 0, 1)",
    accel: "cubic-bezier(.3, 0, 1, 1)",
    spring: "cubic-bezier(.34, 1.56, .64, 1)",
  },
} as const;

export const typography = {
  mono: "'Fira Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  sans: "'PT Sans', system-ui, sans-serif",
  heading: "'Lora', serif",
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
} as const;

export type Palette = typeof palette;
export type Semantic = typeof semantic;
