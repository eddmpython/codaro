export type SidebarPanel =
  | "files"
  | "variables"
  | "dependencies"
  | "documentation"
  | "outline"
  | "packages"
  | "snippets"
  | "ai"
  | "";

export type DeveloperTab =
  | "errors"
  | "scratchpad"
  | "tracing"
  | "secrets"
  | "logs"
  | "terminal"
  | "cache";

let selectedPanel = $state<SidebarPanel>("");
let isSidebarOpen = $state(false);
let isDeveloperPanelOpen = $state(false);
let selectedDeveloperTab = $state<DeveloperTab>("errors");
let isContextPanelPinned = $state(false);

export function getSelectedPanel() {
  return selectedPanel;
}

export function setSelectedPanel(panel: SidebarPanel) {
  if (panel === selectedPanel) {
    selectedPanel = "";
    isSidebarOpen = false;
  } else {
    selectedPanel = panel;
    isSidebarOpen = true;
  }
}

export function getIsSidebarOpen() {
  return isSidebarOpen;
}

export function setIsSidebarOpen(open: boolean) {
  isSidebarOpen = open;
}

export function getIsDeveloperPanelOpen() {
  return isDeveloperPanelOpen;
}

export function setIsDeveloperPanelOpen(open: boolean) {
  isDeveloperPanelOpen = open;
}

export function toggleDeveloperPanel() {
  isDeveloperPanelOpen = !isDeveloperPanelOpen;
}

export function getSelectedDeveloperTab() {
  return selectedDeveloperTab;
}

export function setSelectedDeveloperTab(tab: DeveloperTab) {
  selectedDeveloperTab = tab;
}

export function getIsContextPanelPinned() {
  return isContextPanelPinned;
}

export function setIsContextPanelPinned(pinned: boolean) {
  isContextPanelPinned = pinned;
}
