export type AppMode = "learning" | "notebook" | "report" | "automation";

export interface ModeConfig {
  label: string;
  description: string;
  chatBarOpen: boolean;
  artifactPanelOpen: boolean;
  showCodeCells: boolean;
  showOutputCells: boolean;
  showGuideCells: boolean;
  showCurriculumSidebar: boolean;
  showTaskPanel: boolean;
  showDependencyGraph: boolean;
}

const modeConfigs: Record<AppMode, ModeConfig> = {
  learning: {
    label: "Learning",
    description: "AI-guided interactive learning with curriculum and exercises",
    chatBarOpen: true,
    artifactPanelOpen: false,
    showCodeCells: true,
    showOutputCells: true,
    showGuideCells: true,
    showCurriculumSidebar: true,
    showTaskPanel: false,
    showDependencyGraph: false,
  },
  notebook: {
    label: "Notebook",
    description: "Standard editor with optional AI copilot",
    chatBarOpen: false,
    artifactPanelOpen: false,
    showCodeCells: true,
    showOutputCells: true,
    showGuideCells: true,
    showCurriculumSidebar: false,
    showTaskPanel: false,
    showDependencyGraph: false,
  },
  report: {
    label: "Report",
    description: "Output-only view with code hidden",
    chatBarOpen: false,
    artifactPanelOpen: false,
    showCodeCells: false,
    showOutputCells: true,
    showGuideCells: false,
    showCurriculumSidebar: false,
    showTaskPanel: false,
    showDependencyGraph: false,
  },
  automation: {
    label: "Automation",
    description: "Task management and pipeline visualization",
    chatBarOpen: false,
    artifactPanelOpen: false,
    showCodeCells: true,
    showOutputCells: true,
    showGuideCells: false,
    showCurriculumSidebar: false,
    showTaskPanel: true,
    showDependencyGraph: true,
  },
};

let activeMode = $state<AppMode>("notebook");

export function getActiveMode(): AppMode {
  return activeMode;
}

export function setActiveMode(mode: AppMode) {
  activeMode = mode;
}

export function getActiveModeConfig(): ModeConfig {
  return modeConfigs[activeMode];
}

export function getModeConfig(mode: AppMode): ModeConfig {
  return modeConfigs[mode];
}

export function getAllModes(): AppMode[] {
  return ["learning", "notebook", "report", "automation"];
}

export function getModeLabel(mode: AppMode): string {
  return modeConfigs[mode].label;
}
