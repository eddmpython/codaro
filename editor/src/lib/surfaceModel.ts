import { getActiveLocale } from "@/lib/localeCopy";
import type { AccentId, CodaroThemeMode } from "@/styles/generated/codaroTheme";

export type SurfaceMode = "home" | "chat" | "editor" | "curriculum" | "automation" | "share";
export type ThemeMode = CodaroThemeMode;
export type AccentColor = AccentId;
export const ACCENT_COLORS: readonly AccentColor[] = ["plum", "blue", "teal"];
export type AutomationSection = "codaro" | "custom" | "tasks" | "browserUse" | "computerUse";

// 라이브 에이전트 실행 뷰로 라우팅되는 서브라인(기존 3-섹션 스크롤 페이지와 분리).
export const LIVE_AUTOMATION_SECTIONS: readonly AutomationSection[] = ["browserUse", "computerUse"];

export function isLiveAutomationSection(section: AutomationSection): boolean {
  return LIVE_AUTOMATION_SECTIONS.includes(section);
}
export type ProductSurfaceFlowRole = "entry" | "learning" | "notebook" | "secondLoop" | "support";

export type ProductSurfaceNavItem = {
  value: SurfaceMode;
  labelKey: string;
  flowRole: ProductSurfaceFlowRole;
  beta: boolean;
  visibleInSidebar: boolean;
  runtimeVisibility: "all" | "local";
};

export type ProductSidebarFlowItem = ProductSurfaceNavItem & {
  flowStep: number;
};

export const PRODUCT_SURFACE_NAV: readonly ProductSurfaceNavItem[] = [
  { value: "home", labelKey: "nav.home", flowRole: "entry", beta: false, visibleInSidebar: true, runtimeVisibility: "local" },
  { value: "curriculum", labelKey: "nav.curriculum", flowRole: "learning", beta: false, visibleInSidebar: true, runtimeVisibility: "all" },
  { value: "editor", labelKey: "nav.editor", flowRole: "notebook", beta: true, visibleInSidebar: true, runtimeVisibility: "all" },
  { value: "automation", labelKey: "nav.automation", flowRole: "secondLoop", beta: true, visibleInSidebar: true, runtimeVisibility: "all" },
  { value: "chat", labelKey: "nav.chat", flowRole: "support", beta: true, visibleInSidebar: true, runtimeVisibility: "all" },
  { value: "share", labelKey: "nav.share", flowRole: "support", beta: true, visibleInSidebar: false, runtimeVisibility: "all" },
];

export const DEFAULT_SURFACE: SurfaceMode = "curriculum";

export const SURFACE_MODES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV.map((item) => item.value);

export const PRODUCT_SIDEBAR_NAV: readonly ProductSurfaceNavItem[] = PRODUCT_SURFACE_NAV
  .filter((item) => item.visibleInSidebar);

export function productSidebarFlowItems(runtimeTier: "local" | "web"): readonly ProductSidebarFlowItem[] {
  return PRODUCT_SIDEBAR_NAV
    .filter((item) => item.runtimeVisibility === "all" || runtimeTier === "local")
    .map((item, index) => ({ ...item, flowStep: index + 1 }));
}

export const PRODUCT_SIDEBAR_FLOW_ITEMS: readonly ProductSidebarFlowItem[] = productSidebarFlowItems("web");

export const SIDEBAR_SURFACES: readonly SurfaceMode[] = PRODUCT_SIDEBAR_NAV.map((item) => item.value);

export const HIDDEN_SURFACES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV
  .filter((item) => !item.visibleInSidebar)
  .map((item) => item.value);

export function isHiddenSurface(surface: SurfaceMode): boolean {
  return HIDDEN_SURFACES.includes(surface);
}

export function isSurfaceMode(value: string): value is SurfaceMode {
  return SURFACE_MODES.includes(value as SurfaceMode);
}

export function surfaceNavItem(surface: SurfaceMode): ProductSurfaceNavItem {
  const item = PRODUCT_SURFACE_NAV.find((candidate) => candidate.value === surface);
  if (!item) {
    throw new Error(`Unknown surface mode: ${surface}`);
  }
  return item;
}

export function surfaceFlowRole(surface: SurfaceMode): ProductSurfaceFlowRole {
  return surfaceNavItem(surface).flowRole;
}

export function surfaceTitle(surface: SurfaceMode) {
  const en = getActiveLocale() === "en";
  if (surface === "home") return en ? "Local Home" : "로컬 홈";
  if (surface === "editor") return en ? "Notebook" : "노트북";
  if (surface === "curriculum") return en ? "Current Learning" : "현재 학습";
  if (surface === "automation") return en ? "Automation" : "자동화";
  if (surface === "share") return en ? "Share Packs" : "공유 팩";
  return en ? "Chat" : "대화";
}
