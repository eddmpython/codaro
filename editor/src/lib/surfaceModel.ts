import { getActiveLocale } from "@/lib/localeCopy";

export type SurfaceMode = "chat" | "editor" | "curriculum" | "automation" | "share";
export type ThemeMode = "dark" | "light";
export type AutomationSection = "codaro" | "custom" | "tasks";

export function surfaceTitle(surface: SurfaceMode) {
  const en = getActiveLocale() === "en";
  if (surface === "editor") return en ? "Editor" : "에디터";
  if (surface === "curriculum") return en ? "Curriculum" : "커리큘럼";
  if (surface === "automation") return en ? "Automation" : "자동화";
  if (surface === "share") return en ? "Share Packs" : "공유 팩";
  return en ? "Chat" : "채팅";
}
