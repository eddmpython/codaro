export type SurfaceMode = "chat" | "editor" | "curriculum" | "automation";
export type ThemeMode = "dark" | "light";

export function surfaceTitle(surface: SurfaceMode) {
  if (surface === "editor") return "에디터";
  if (surface === "curriculum") return "커리큘럼";
  if (surface === "automation") return "자동화";
  return "채팅";
}
