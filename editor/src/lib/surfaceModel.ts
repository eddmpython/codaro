import { getActiveLocale } from "@/lib/localeCopy";

export type SurfaceMode = "chat" | "editor" | "curriculum" | "automation" | "share";
export type ThemeMode = "dark" | "light";
export type AutomationSection = "codaro" | "custom" | "tasks";

// 베타 확정 전까지 사이드바에서 임시로 감추는 표면. 확정되면 이 배열을 비우고 beta 배지로 노출한다.
// 코드/라우팅은 그대로 살아 있어 `#automation`, `#share` 해시로는 개발/검증 접근이 가능하다.
export const HIDDEN_SURFACES: readonly SurfaceMode[] = ["automation", "share"];

export function isHiddenSurface(surface: SurfaceMode): boolean {
  return HIDDEN_SURFACES.includes(surface);
}

export function surfaceTitle(surface: SurfaceMode) {
  const en = getActiveLocale() === "en";
  if (surface === "editor") return en ? "Editor" : "에디터";
  if (surface === "curriculum") return en ? "Curriculum" : "커리큘럼";
  if (surface === "automation") return en ? "Automation" : "자동화";
  if (surface === "share") return en ? "Share Packs" : "공유 팩";
  return en ? "Chat" : "채팅";
}
