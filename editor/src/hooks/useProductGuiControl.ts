import { isExecutableBlock } from "@/lib/cellModel";
import {
  guiBoolean,
  GuiControlError,
  guiOptionalString,
  guiResultData,
  guiString,
  type GuiActionDefinition,
} from "@/lib/guiControl";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";
import type { ResultMap } from "@/lib/assistantContext";
import type { RunRouteState } from "@/lib/runRouteState";
import {
  ACCENT_COLORS,
  SURFACE_MODES,
  type AccentColor,
  type AutomationSection,
  type SurfaceMode,
  type ThemeMode,
} from "@/lib/surfaceModel";
import type { ViewportInsets } from "@/hooks/useViewportInsets";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  EStopStatus,
  SchedulerStatus,
  TaskDefinition,
  TaskListPayload,
} from "@/types";

import { useGuiControl } from "@/hooks/useGuiControl";

type UseProductGuiControlOptions = {
  accentColor: AccentColor;
  addNotebookCell: (
    type: "code" | "markdown",
    referenceBlockId?: string,
    placement?: "before" | "after",
  ) => void;
  apiOnline: boolean;
  askAssistant: () => Promise<unknown> | unknown;
  assistantLoading: boolean;
  auditCount: number;
  automationSection: AutomationSection;
  cleanupCellDefinitions: (blockId: string) => void;
  curriculumDocument: CodaroDocument | null;
  deleteNotebookCell: (blockId: string) => void;
  document: CodaroDocument;
  drafts: Record<string, string>;
  duplicateNotebookCell: (blockId: string) => void;
  eStop: EStopStatus;
  loadState: string;
  messages: readonly unknown[];
  moveNotebookCell: (blockId: string, direction: "up" | "down") => void;
  notebookPersistence: NotebookPersistenceState;
  notebookRunning: boolean;
  notebookToolsOpen: boolean;
  notice: AppNotice;
  prompt: string;
  reactiveEnabled: boolean;
  referenceLoading: boolean;
  refreshAutomation: () => Promise<void>;
  renameNotebookDocument: (title: string) => void;
  resolvedTheme: "dark" | "light";
  results: ResultMap;
  runBlock: (block: BlockConfig, sourceOverride?: string) => Promise<void>;
  runNotebook: () => Promise<void>;
  runRouteState: RunRouteState;
  runTask: (task: TaskDefinition) => Promise<void>;
  runningBlockId: string | null;
  scheduler: SchedulerStatus;
  selectAccentColor: (accent: AccentColor) => void;
  selectAutomationSection: (section: AutomationSection) => void;
  selectBlock: (blockId: string) => void;
  selectCurriculumLesson: (category: string, contentId: string) => void;
  selectCurriculumRouteBlock: (blockId: string) => void;
  selectedBlockId: string;
  selectedCategory: string;
  selectedContentId: string;
  selectedCurriculumBlockId: string;
  selectSurface: (surface: SurfaceMode) => void;
  setNotebookToolsOpen: (open: boolean) => void;
  setPrompt: (prompt: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  sidebarOpen: boolean;
  staleBlockIds: string[];
  surface: SurfaceMode;
  tasks: TaskListPayload;
  terminalOpen: boolean;
  themeMode: ThemeMode;
  toggleEStop: () => Promise<void>;
  toggleReactive: () => void;
  toggleTask: (task: TaskDefinition) => Promise<void>;
  updateDraft: (blockId: string, value: string) => void;
  viewportInsets: ViewportInsets;
};

export function useProductGuiControl(options: UseProductGuiControlOptions): void {
  const actions: GuiActionDefinition[] = [
    {
      args: { surface: { required: true, type: "string", values: SURFACE_MODES } },
      channel: "product",
      description: "Open a product surface through the real product navigation callback.",
      id: "surface.open",
      run: (args) => {
        const surface = guiString(args, "surface", { values: SURFACE_MODES }) as SurfaceMode;
        options.selectSurface(surface);
        return { surface };
      },
    },
    {
      args: { mode: { required: true, type: "string", values: ["system", "light", "dark"] } },
      channel: "product",
      description: "Set the product theme preference through the design runtime.",
      id: "design.setTheme",
      run: (args) => {
        const mode = guiString(args, "mode", { values: ["system", "light", "dark"] }) as ThemeMode;
        options.setThemeMode(mode);
        return { mode };
      },
    },
    {
      args: { accent: { required: true, type: "string", values: ACCENT_COLORS } },
      channel: "product",
      description: "Set the product accent through the design runtime.",
      id: "design.setAccent",
      run: (args) => {
        const accent = guiString(args, "accent", { values: ACCENT_COLORS }) as AccentColor;
        options.selectAccentColor(accent);
        return { accent };
      },
    },
    layoutAction("layout.setSidebar", "Open or close the product sidebar.", options.setSidebarOpen),
    {
      args: { open: { required: true, type: "boolean" } },
      channel: "product",
      description: "Open or close the terminal through the same layout state used by the UI.",
      id: "layout.setTerminal",
      run: (args) => {
        const open = guiBoolean(args, "open");
        if (open && options.surface === "curriculum") {
          throw new GuiControlError("unavailable", "the terminal is unavailable on the learning surface");
        }
        options.setTerminalOpen(open);
        return { open };
      },
    },
    {
      args: { open: { required: true, type: "boolean" } },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Open or close notebook tools through the real editor layout state.",
      id: "layout.setNotebookTools",
      run: (args) => {
        const open = guiBoolean(args, "open");
        options.setNotebookToolsOpen(open);
        return { open };
      },
      unavailableReason: () => "notebook tools require the editor surface",
    },
    {
      args: { title: { required: true, type: "string" } },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Rename the notebook through the document owner.",
      id: "notebook.rename",
      run: (args) => {
        const title = guiString(args, "title");
        options.renameNotebookDocument(title);
        return { title };
      },
      unavailableReason: () => "renaming the notebook requires the editor surface",
    },
    notebookCellAction(options, {
      description: "Select a notebook cell through the document selection state.",
      id: "notebook.selectCell",
      run: (cellId) => options.selectBlock(cellId),
    }),
    {
      args: {
        cellId: { required: true, type: "string" },
        source: { required: true, type: "string" },
      },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Update a notebook cell source through the document draft owner.",
      id: "notebook.setCellSource",
      run: (args) => {
        const cellId = guiString(args, "cellId");
        requireNotebookBlock(options.document, cellId);
        const source = guiString(args, "source", { allowEmpty: true });
        options.updateDraft(cellId, source);
        options.selectBlock(cellId);
        return { cellId, lineCount: source.split("\n").length, sourceLength: source.length };
      },
      unavailableReason: () => "notebook source editing requires the editor surface",
    },
    {
      args: {
        placement: { type: "string", values: ["before", "after"] },
        referenceCellId: { type: "string" },
        type: { required: true, type: "string", values: ["code", "markdown"] },
      },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Add a notebook cell through the document owner.",
      id: "notebook.addCell",
      run: (args) => {
        const type = guiString(args, "type", { values: ["code", "markdown"] }) as "code" | "markdown";
        const referenceCellId = guiOptionalString(args, "referenceCellId");
        if (referenceCellId) requireNotebookBlock(options.document, referenceCellId);
        const placement = (guiOptionalString(args, "placement") ?? "after") as "before" | "after";
        if (!(["before", "after"] as const).includes(placement)) {
          throw new GuiControlError("invalidArguments", "placement must be before or after");
        }
        options.addNotebookCell(type, referenceCellId, placement);
        return { placement, referenceCellId: referenceCellId ?? null, type };
      },
      unavailableReason: () => "adding notebook cells requires the editor surface",
    },
    notebookCellAction(options, {
      description: "Delete a notebook cell through the document and runtime owners.",
      id: "notebook.deleteCell",
      run: (cellId) => {
        options.cleanupCellDefinitions(cellId);
        options.deleteNotebookCell(cellId);
      },
    }),
    notebookCellAction(options, {
      description: "Duplicate a notebook cell through the document owner.",
      id: "notebook.duplicateCell",
      run: options.duplicateNotebookCell,
    }),
    {
      args: {
        cellId: { required: true, type: "string" },
        direction: { required: true, type: "string", values: ["up", "down"] },
      },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Move a notebook cell through the document owner.",
      id: "notebook.moveCell",
      run: (args) => {
        const cellId = guiString(args, "cellId");
        requireNotebookBlock(options.document, cellId);
        const direction = guiString(args, "direction", { values: ["up", "down"] }) as "up" | "down";
        options.moveNotebookCell(cellId, direction);
        return { cellId, direction };
      },
      unavailableReason: () => "moving notebook cells requires the editor surface",
    },
    {
      args: { cellId: { required: true, type: "string" } },
      available: () => options.surface === "editor" && !options.notebookRunning && !options.runningBlockId,
      channel: "product",
      description: "Run a notebook cell through the real runtime path and await its result.",
      id: "notebook.runCell",
      run: async (args) => {
        const cellId = guiString(args, "cellId");
        const block = requireNotebookBlock(options.document, cellId);
        if (!isExecutableBlock(block)) {
          throw new GuiControlError("unavailable", `cell is not executable: ${cellId}`);
        }
        await options.runBlock(block, options.drafts[cellId] ?? block.content);
        return { cellId };
      },
      unavailableReason: () => "cell execution requires an idle editor surface",
    },
    {
      args: {},
      available: () => options.surface === "editor" && !options.notebookRunning && !options.runningBlockId,
      channel: "product",
      description: "Run the notebook through the real runtime path and await completion.",
      id: "notebook.runAll",
      run: async () => {
        await options.runNotebook();
        return { documentId: options.document.id };
      },
      unavailableReason: () => "notebook execution requires an idle editor surface",
    },
    {
      args: { enabled: { required: true, type: "boolean" } },
      available: () => options.surface === "editor",
      channel: "product",
      description: "Set reactive notebook execution without toggling an already matching state.",
      id: "notebook.setReactive",
      run: (args) => {
        const enabled = guiBoolean(args, "enabled");
        if (enabled !== options.reactiveEnabled) options.toggleReactive();
        return { enabled };
      },
      unavailableReason: () => "reactive execution requires the editor surface",
    },
    {
      args: {
        category: { required: true, type: "string" },
        contentId: { required: true, type: "string" },
      },
      channel: "product",
      description: "Open a lesson through the curriculum selection and route owners.",
      id: "learning.openLesson",
      run: (args) => {
        const category = guiString(args, "category");
        const contentId = guiString(args, "contentId");
        options.selectCurriculumLesson(category, contentId);
        return { category, contentId };
      },
    },
    {
      args: { sectionId: { required: true, type: "string" } },
      available: () => options.surface === "curriculum" && Boolean(options.curriculumDocument),
      channel: "product",
      description: "Select and route to a learning section through the curriculum owner.",
      id: "learning.selectSection",
      run: (args) => {
        const sectionId = guiString(args, "sectionId");
        if (!options.curriculumDocument?.blocks.some((block) => block.id === sectionId)) {
          throw new GuiControlError("notFound", `learning section not found: ${sectionId}`);
        }
        options.selectCurriculumRouteBlock(sectionId);
        return { sectionId };
      },
      unavailableReason: () => "learning section selection requires a loaded lesson",
    },
    {
      args: {
        section: {
          required: true,
          type: "string",
          values: ["codaro", "custom", "tasks", "browserUse", "computerUse"],
        },
      },
      channel: "product",
      description: "Open an automation section through the product navigation owner.",
      id: "automation.openSection",
      run: (args) => {
        const section = guiString(args, "section", {
          values: ["codaro", "custom", "tasks", "browserUse", "computerUse"],
        }) as AutomationSection;
        options.selectAutomationSection(section);
        return { section };
      },
    },
    {
      args: {},
      channel: "product",
      description: "Refresh the automation snapshot through its real state owner.",
      id: "automation.refresh",
      run: async () => {
        await options.refreshAutomation();
        return { refreshed: true };
      },
    },
    {
      args: { active: { required: true, type: "boolean" } },
      channel: "product",
      description: "Set the emergency stop without toggling an already matching state.",
      id: "automation.setEmergencyStop",
      run: async (args) => {
        const active = guiBoolean(args, "active");
        if (active !== options.eStop.active) await options.toggleEStop();
        return { active };
      },
    },
    automationTaskAction(options, {
      description: "Run an automation task through the real safety and runtime path.",
      id: "automation.runTask",
      run: options.runTask,
    }),
    {
      args: {
        enabled: { required: true, type: "boolean" },
        taskId: { required: true, type: "string" },
      },
      available: () => Boolean(options.tasks.tasks.length),
      channel: "product",
      description: "Set task enabled state through the real task owner.",
      id: "automation.setTaskEnabled",
      run: async (args) => {
        const taskId = guiString(args, "taskId");
        const enabled = guiBoolean(args, "enabled");
        const task = requireAutomationTask(options.tasks, taskId);
        if (task.enabled !== enabled) await options.toggleTask(task);
        return { enabled, taskId };
      },
      unavailableReason: () => "no automation task is available",
    },
    {
      args: { prompt: { required: true, type: "string" } },
      channel: "product",
      description: "Set the chat composer through its real controlled state.",
      id: "chat.setPrompt",
      run: (args) => {
        const prompt = guiString(args, "prompt", { allowEmpty: true });
        options.setPrompt(prompt);
        return { length: prompt.length };
      },
    },
    {
      args: {},
      available: () => options.surface === "chat" && Boolean(options.prompt.trim()) && !options.assistantLoading,
      channel: "product",
      description: "Submit the current chat prompt through the real assistant turn path.",
      id: "chat.submit",
      run: async () => {
        await options.askAssistant();
        return { submitted: true };
      },
      unavailableReason: () => "chat submit requires a non-empty idle chat composer",
    },
  ];

  useGuiControl({
    actions,
    getState: () => productGuiState(options),
  });
}

function productGuiState(options: UseProductGuiControlOptions) {
  return {
    apiOnline: options.apiOnline,
    automation: {
      auditCount: options.auditCount,
      eStopActive: options.eStop.active,
      schedulerJobCount: options.scheduler.jobCount,
      section: options.automationSection,
      tasks: options.tasks.tasks.map((task) => ({
        enabled: task.enabled,
        id: task.id,
        lastRunStatus: task.lastRun?.status ?? null,
        name: task.name,
        safetyStatus: task.safety.status,
      })),
    },
    chat: {
      loading: options.assistantLoading,
      messageCount: options.messages.length,
      prompt: options.prompt,
    },
    design: {
      accent: options.accentColor,
      resolvedTheme: options.resolvedTheme,
      themeMode: options.themeMode,
    },
    layout: {
      keyboardHeight: options.viewportInsets.keyboardHeight,
      keyboardOpen: options.viewportInsets.isKeyboardOpen,
      notebookToolsOpen: options.notebookToolsOpen,
      sidebarOpen: options.sidebarOpen,
      terminalOpen: options.terminalOpen,
    },
    learning: {
      category: options.selectedCategory,
      contentId: options.selectedContentId,
      documentId: options.curriculumDocument?.id ?? null,
      referenceLoading: options.referenceLoading,
      sectionId: options.selectedCurriculumBlockId || null,
    },
    loadState: options.loadState,
    notebook: {
      cells: options.document.blocks.map((block, index) => {
        const result = options.surface === "editor" ? options.results[block.id] : undefined;
        const running = options.surface === "editor" && options.runningBlockId === block.id;
        const stale = options.surface === "editor" && options.staleBlockIds.includes(block.id);
        return {
          id: block.id,
          index: index + 1,
          result: result
            ? {
                artifactCount: result.artifacts?.length ?? 0,
                data: guiResultData(result.data),
                executionCount: result.executionCount,
                status: result.status,
                stderr: result.stderr,
                stdout: result.stdout,
              }
            : null,
          role: block.role ?? null,
          running,
          selected: options.selectedBlockId === block.id,
          source: options.drafts[block.id] ?? block.content,
          stale,
          status: running ? "running" : stale ? "stale" : result?.status ?? "idle",
          type: block.type,
        };
      }),
      documentId: options.document.id,
      persistence: {
        mode: options.notebookPersistence.mode,
        phase: options.notebookPersistence.phase,
        ready: options.notebookPersistence.ready,
      },
      reactive: options.reactiveEnabled,
      running: options.surface === "editor"
        && (options.notebookRunning || Boolean(options.runningBlockId)),
      selectedCellId: options.selectedBlockId || null,
      title: options.document.title,
    },
    notice: {
      detail: options.notice.detail,
      title: options.notice.title,
      tone: options.notice.tone,
    },
    route: {
      documentId: options.runRouteState.documentId,
      lessonKey: options.runRouteState.lessonKey,
      pathId: options.runRouteState.pathId,
      sectionId: options.runRouteState.sectionId,
      taskId: options.runRouteState.taskId,
    },
    runtimeTier: options.runRouteState.runtimeTier,
    surface: options.surface,
  };
}

function layoutAction(
  id: string,
  description: string,
  setOpen: (open: boolean) => void,
): GuiActionDefinition {
  return {
    args: { open: { required: true, type: "boolean" } },
    channel: "product",
    description,
    id,
    run: (args) => {
      const open = guiBoolean(args, "open");
      setOpen(open);
      return { open };
    },
  };
}

function notebookCellAction(
  options: UseProductGuiControlOptions,
  definition: {
    description: string;
    id: string;
    run: (cellId: string) => void;
  },
): GuiActionDefinition {
  return {
    args: { cellId: { required: true, type: "string" } },
    available: () => options.surface === "editor",
    channel: "product",
    description: definition.description,
    id: definition.id,
    run: (args) => {
      const cellId = guiString(args, "cellId");
      requireNotebookBlock(options.document, cellId);
      definition.run(cellId);
      return { cellId };
    },
    unavailableReason: () => `${definition.id} requires the editor surface`,
  };
}

function automationTaskAction(
  options: UseProductGuiControlOptions,
  definition: {
    description: string;
    id: string;
    run: (task: TaskDefinition) => Promise<void>;
  },
): GuiActionDefinition {
  return {
    args: { taskId: { required: true, type: "string" } },
    available: () => Boolean(options.tasks.tasks.length),
    channel: "product",
    description: definition.description,
    id: definition.id,
    run: async (args) => {
      const taskId = guiString(args, "taskId");
      await definition.run(requireAutomationTask(options.tasks, taskId));
      return { taskId };
    },
    unavailableReason: () => "no automation task is available",
  };
}

function requireNotebookBlock(document: CodaroDocument, blockId: string): BlockConfig {
  const block = document.blocks.find((candidate) => candidate.id === blockId);
  if (!block) throw new GuiControlError("notFound", `notebook cell not found: ${blockId}`);
  return block;
}

function requireAutomationTask(tasks: TaskListPayload, taskId: string): TaskDefinition {
  const task = tasks.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new GuiControlError("notFound", `automation task not found: ${taskId}`);
  return task;
}
