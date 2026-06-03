import { getActiveLocale } from "@/lib/localeCopy";

export type SurfaceMode = "chat" | "editor" | "curriculum" | "automation" | "share";
export type ThemeMode = "dark" | "light";
export type AutomationSection = "codaro" | "custom" | "tasks";
export type ProductSurfaceFlowRole = "entry" | "learning" | "notebook" | "secondLoop" | "support";

export type ProductSurfaceNavItem = {
  value: SurfaceMode;
  labelKey: string;
  flowRole: ProductSurfaceFlowRole;
  beta: boolean;
  visibleInSidebar: boolean;
};

export type ProductSidebarFlowItem = ProductSurfaceNavItem & {
  flowStep: number;
};

export const PRODUCT_SURFACE_NAV: readonly ProductSurfaceNavItem[] = [
  { value: "chat", labelKey: "nav.chat", flowRole: "entry", beta: true, visibleInSidebar: true },
  { value: "curriculum", labelKey: "nav.curriculum", flowRole: "learning", beta: false, visibleInSidebar: true },
  { value: "editor", labelKey: "nav.editor", flowRole: "notebook", beta: true, visibleInSidebar: true },
  { value: "automation", labelKey: "nav.automation", flowRole: "secondLoop", beta: true, visibleInSidebar: true },
  { value: "share", labelKey: "nav.share", flowRole: "support", beta: true, visibleInSidebar: false },
];

export const DEFAULT_SURFACE: SurfaceMode = "chat";

export const SURFACE_MODES: readonly SurfaceMode[] = PRODUCT_SURFACE_NAV.map((item) => item.value);

export const PRODUCT_SIDEBAR_NAV: readonly ProductSurfaceNavItem[] = PRODUCT_SURFACE_NAV
  .filter((item) => item.visibleInSidebar);

export const PRODUCT_SIDEBAR_FLOW_ITEMS: readonly ProductSidebarFlowItem[] = PRODUCT_SIDEBAR_NAV.map((item, index) => ({
  ...item,
  flowStep: index + 1,
}));

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
  if (surface === "editor") return en ? "Notebook" : "노트북";
  if (surface === "curriculum") return en ? "Current Learning" : "현재 학습";
  if (surface === "automation") return en ? "Automation" : "자동화";
  if (surface === "share") return en ? "Share Packs" : "공유 팩";
  return en ? "Chat" : "대화";
}
