import type { AccentColor, AutomationSection, SurfaceMode, ThemeMode } from "@/lib/surfaceModel";

export const CODARO_GUI_CONTRACT_VERSION = 1 as const;

export type GuiActionChannel = "product" | "control";

export type GuiArgumentDescriptor = {
  required?: boolean;
  type: "boolean" | "number" | "object" | "string";
  values?: readonly string[];
};

export type GuiActionDescriptor = {
  args: Record<string, GuiArgumentDescriptor>;
  available: boolean;
  channel: GuiActionChannel;
  description: string;
  id: string;
  unavailableReason: string | null;
};

export type GuiActionDefinition = Omit<GuiActionDescriptor, "available" | "unavailableReason"> & {
  available?: () => boolean;
  run: (args: Record<string, unknown>) => Promise<unknown> | unknown;
  unavailableReason?: () => string;
};

export type GuiActionError = {
  code: "conflict" | "invalidArguments" | "notFound" | "unavailable" | "unknownAction" | "unexpected";
  message: string;
};

export type GuiActionReceipt = {
  actionId: string;
  afterRevision: number;
  beforeRevision: number;
  completedAt: string;
  error: GuiActionError | null;
  ok: boolean;
  result: unknown;
  state: GuiStateSnapshot;
};

export type GuiCellResultSnapshot = {
  artifactCount: number;
  data: unknown;
  executionCount: number;
  status: string;
  stderr: string;
  stdout: string;
};

export type GuiCellSnapshot = {
  id: string;
  index: number;
  result: GuiCellResultSnapshot | null;
  role: string | null;
  running: boolean;
  selected: boolean;
  source: string;
  stale: boolean;
  status: string;
  type: string;
};

export type GuiTaskSnapshot = {
  enabled: boolean;
  id: string;
  lastRunStatus: string | null;
  name: string;
  safetyStatus: string;
};

export type GuiFocusSnapshot = {
  cellId: string | null;
  controlName: string;
  role: string;
  tagName: string;
};

export type GuiStateInput = {
  apiOnline: boolean;
  automation: {
    auditCount: number;
    eStopActive: boolean;
    schedulerJobCount: number;
    section: AutomationSection;
    tasks: GuiTaskSnapshot[];
  };
  chat: {
    loading: boolean;
    messageCount: number;
    prompt: string;
  };
  design: {
    accent: AccentColor;
    resolvedTheme: "dark" | "light";
    themeMode: ThemeMode;
  };
  layout: {
    keyboardHeight: number;
    keyboardOpen: boolean;
    notebookToolsOpen: boolean;
    sidebarOpen: boolean;
    terminalOpen: boolean;
  };
  learning: {
    category: string;
    contentId: string;
    documentId: string | null;
    referenceLoading: boolean;
    sectionId: string | null;
  };
  loadState: string;
  notebook: {
    cells: GuiCellSnapshot[];
    documentId: string;
    persistence: {
      mode: string;
      phase: string;
      ready: boolean;
    };
    reactive: boolean;
    running: boolean;
    selectedCellId: string | null;
    title: string;
  };
  notice: {
    detail: string;
    title: string;
    tone: string;
  };
  route: {
    documentId: string | null;
    lessonKey: string | null;
    pathId: string | null;
    sectionId: string | null;
    taskId: string | null;
  };
  runtimeTier: "local" | "web";
  surface: SurfaceMode;
};

export type GuiStateSnapshot = GuiStateInput & {
  contractVersion: typeof CODARO_GUI_CONTRACT_VERSION;
  focus: GuiFocusSnapshot;
  location: {
    hash: string;
    pathname: string;
    search: string;
  };
  ready: true;
  revision: number;
  viewport: {
    devicePixelRatio: number;
    height: number;
    visualHeight: number;
    visualWidth: number;
    width: number;
  };
};

export type GuiControlSnapshot = {
  cellId: string | null;
  controlId: string;
  disabled: boolean;
  focused: boolean;
  name: string;
  rect: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
  role: string;
  surface: SurfaceMode | null;
  tagName: string;
  value: string | null;
};

export type CodaroGuiControl = {
  readonly ready: true;
  readonly version: typeof CODARO_GUI_CONTRACT_VERSION;
  catalog: () => GuiActionDescriptor[];
  controls: () => GuiControlSnapshot[];
  getState: () => GuiStateSnapshot;
  invoke: (actionId: string, args?: Record<string, unknown>) => Promise<GuiActionReceipt>;
};

export type GuiControlContext = {
  actions: readonly GuiActionDefinition[];
  getState: () => GuiStateInput;
  revision: number;
};

const CONTROL_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "summary",
  "[role='button']",
  "[role='link']",
  "[contenteditable='true']",
].join(",");
const MAX_RESULT_TEXT = 16_000;
const MAX_RESULT_ITEMS = 50;
const controlRefs = new Map<string, HTMLElement>();
const elementControlIds = new WeakMap<HTMLElement, string>();
let nextControlId = 1;

export class GuiControlError extends Error {
  readonly code: GuiActionError["code"];

  constructor(code: GuiActionError["code"], message: string) {
    super(message);
    this.name = "GuiControlError";
    this.code = code;
  }
}

export function guiString(
  args: Record<string, unknown>,
  key: string,
  options: { allowEmpty?: boolean; values?: readonly string[] } = {},
): string {
  const value = args[key];
  if (typeof value !== "string" || (!options.allowEmpty && !value.trim())) {
    throw new GuiControlError("invalidArguments", `${key} must be a non-empty string`);
  }
  if (options.values && !options.values.includes(value)) {
    throw new GuiControlError("invalidArguments", `${key} must be one of: ${options.values.join(", ")}`);
  }
  return value;
}

export function guiOptionalString(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new GuiControlError("invalidArguments", `${key} must be a string`);
  }
  return value;
}

export function guiBoolean(args: Record<string, unknown>, key: string): boolean {
  const value = args[key];
  if (typeof value !== "boolean") {
    throw new GuiControlError("invalidArguments", `${key} must be a boolean`);
  }
  return value;
}

export function guiResultData(value: unknown): unknown {
  return boundedSerializable(value, 0, new WeakSet<object>());
}

export function createGuiControl(context: { current: GuiControlContext }): CodaroGuiControl {
  const getState = () => snapshotFromContext(context.current);
  const catalog = () => actionCatalog(context.current);
  return {
    ready: true,
    version: CODARO_GUI_CONTRACT_VERSION,
    catalog,
    controls: reflectGuiControls,
    getState,
    invoke: async (actionId, args = {}) => {
      const before = getState();
      const definition = context.current.actions.find((candidate) => candidate.id === actionId)
        ?? builtinControlActions().find((candidate) => candidate.id === actionId);
      if (!definition) {
        return failureReceipt(
          actionId,
          before,
          new GuiControlError("unknownAction", `unknown GUI action: ${actionId}`),
          getState(),
        );
      }
      if (!isPlainRecord(args)) {
        return failureReceipt(
          actionId,
          before,
          new GuiControlError("invalidArguments", "action arguments must be an object"),
          getState(),
        );
      }
      if (definition.available && !definition.available()) {
        return failureReceipt(
          actionId,
          before,
          new GuiControlError(
            "unavailable",
            definition.unavailableReason?.() ?? `GUI action is unavailable: ${actionId}`,
          ),
          getState(),
        );
      }
      try {
        const result = await definition.run(args);
        await settleGui();
        const after = getState();
        return {
          actionId,
          afterRevision: after.revision,
          beforeRevision: before.revision,
          completedAt: new Date().toISOString(),
          error: null,
          ok: true,
          result: guiResultData(result),
          state: after,
        };
      } catch (error) {
        await settleGui();
        return failureReceipt(actionId, before, error, getState());
      }
    },
  };
}

function actionCatalog(context: GuiControlContext): GuiActionDescriptor[] {
  return [...context.actions, ...builtinControlActions()]
    .map((definition) => {
      const available = definition.available?.() ?? true;
      return {
        args: definition.args,
        available,
        channel: definition.channel,
        description: definition.description,
        id: definition.id,
        unavailableReason: available ? null : definition.unavailableReason?.() ?? "unavailable",
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function snapshotFromContext(context: GuiControlContext): GuiStateSnapshot {
  const visualViewport = window.visualViewport;
  return cloneSerializable({
    ...context.getState(),
    contractVersion: CODARO_GUI_CONTRACT_VERSION,
    focus: readFocusSnapshot(),
    location: {
      hash: window.location.hash,
      pathname: window.location.pathname,
      search: window.location.search,
    },
    ready: true,
    revision: context.revision,
    viewport: {
      devicePixelRatio: window.devicePixelRatio,
      height: window.innerHeight,
      visualHeight: visualViewport?.height ?? window.innerHeight,
      visualWidth: visualViewport?.width ?? window.innerWidth,
      width: window.innerWidth,
    },
  });
}

function readFocusSnapshot(): GuiFocusSnapshot {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!active) return { cellId: null, controlName: "", role: "", tagName: "" };
  return {
    cellId: active.closest<HTMLElement>("[data-notebook-cell-id]")?.dataset.notebookCellId ?? null,
    controlName: accessibleName(active),
    role: semanticRole(active),
    tagName: active.tagName.toLowerCase(),
  };
}

function reflectGuiControls(): GuiControlSnapshot[] {
  cleanupControlRefs();
  const active = document.activeElement;
  return Array.from(document.querySelectorAll<HTMLElement>(CONTROL_SELECTOR))
    .filter(isVisibleControl)
    .slice(0, 500)
    .map((element) => {
      const controlId = controlIdFor(element);
      controlRefs.set(controlId, element);
      const rect = element.getBoundingClientRect();
      const surface = element.closest<HTMLElement>("[data-product-surface-view]")
        ?.dataset.productSurfaceView as SurfaceMode | undefined;
      return {
        cellId: element.closest<HTMLElement>("[data-notebook-cell-id]")?.dataset.notebookCellId ?? null,
        controlId,
        disabled: isDisabledControl(element),
        focused: element === active || element.contains(active),
        name: accessibleName(element),
        rect: {
          height: rounded(rect.height),
          left: rounded(rect.left),
          top: rounded(rect.top),
          width: rounded(rect.width),
        },
        role: semanticRole(element),
        surface: surface ?? null,
        tagName: element.tagName.toLowerCase(),
        value: readableControlValue(element),
      };
    });
}

function builtinControlActions(): GuiActionDefinition[] {
  return [
    {
      args: { controlId: { required: true, type: "string" } },
      channel: "control",
      description: "Focus a visible reflected control without changing product state.",
      id: "control.focus",
      run: (args) => {
        const element = requireControl(guiString(args, "controlId"));
        element.focus({ preventScroll: false });
        return { controlId: controlIdFor(element) };
      },
    },
    {
      args: { controlId: { required: true, type: "string" } },
      channel: "control",
      description: "Activate a visible reflected control through its real DOM event handler.",
      id: "control.activate",
      run: (args) => {
        const element = requireControl(guiString(args, "controlId"));
        if (isDisabledControl(element)) {
          throw new GuiControlError("unavailable", "control is disabled");
        }
        element.focus({ preventScroll: false });
        element.click();
        return { controlId: controlIdFor(element) };
      },
    },
    {
      args: {
        controlId: { required: true, type: "string" },
        value: { required: true, type: "string" },
      },
      channel: "control",
      description: "Set a native form control value and dispatch its real input and change handlers.",
      id: "control.setValue",
      run: (args) => {
        const element = requireControl(guiString(args, "controlId"));
        const value = guiString(args, "value", { allowEmpty: true });
        setNativeControlValue(element, value);
        return { controlId: controlIdFor(element), value };
      },
    },
  ];
}

function requireControl(controlId: string): HTMLElement {
  const element = controlRefs.get(controlId);
  if (!element || !element.isConnected || !isVisibleControl(element)) {
    throw new GuiControlError(
      "notFound",
      `control is missing or stale: ${controlId}; call controls() and use a current controlId`,
    );
  }
  return element;
}

function setNativeControlValue(element: HTMLElement, value: string): void {
  if (element instanceof HTMLInputElement) {
    if (element.type === "file") {
      throw new GuiControlError("unavailable", "file inputs require a trusted browser file chooser");
    }
    setPrototypeValue(HTMLInputElement.prototype, element, value);
  } else if (element instanceof HTMLTextAreaElement) {
    setPrototypeValue(HTMLTextAreaElement.prototype, element, value);
  } else if (element instanceof HTMLSelectElement) {
    setPrototypeValue(HTMLSelectElement.prototype, element, value);
  } else if (element.isContentEditable && !element.classList.contains("cm-content")) {
    element.textContent = value;
  } else {
    throw new GuiControlError(
      "unavailable",
      "control.setValue supports native form controls; use notebook.setCellSource or trusted input for CodeMirror",
    );
  }
  element.focus({ preventScroll: false });
  element.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function setPrototypeValue(prototype: object, element: HTMLElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (!setter) throw new GuiControlError("unexpected", "native value setter is unavailable");
  setter.call(element, value);
}

function controlIdFor(element: HTMLElement): string {
  const productId = element.dataset.guiControlId;
  if (productId) return `product:${productId}`;
  const existing = elementControlIds.get(element);
  if (existing) return existing;
  const next = `element:${String(nextControlId).padStart(5, "0")}`;
  nextControlId += 1;
  elementControlIds.set(element, next);
  return next;
}

function cleanupControlRefs(): void {
  for (const [controlId, element] of controlRefs) {
    if (!element.isConnected) controlRefs.delete(controlId);
  }
}

function isVisibleControl(element: HTMLElement): boolean {
  if (element.hidden || element.closest("[hidden]")) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.visibility !== "collapse";
}

function isDisabledControl(element: HTMLElement): boolean {
  return (
    ("disabled" in element && Boolean((element as HTMLButtonElement).disabled))
    || element.getAttribute("aria-disabled") === "true"
  );
}

function accessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return boundedText(ariaLabel, 240);
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const label = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
    if (label) return boundedText(label, 240);
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.labels?.length) {
      const label = Array.from(element.labels).map((item) => item.textContent?.trim() ?? "").filter(Boolean).join(" ");
      if (label) return boundedText(label, 240);
    }
    if (element.placeholder) return boundedText(element.placeholder, 240);
  }
  return boundedText(element.title || element.textContent?.trim() || "", 240);
}

function semanticRole(element: HTMLElement): string {
  const explicit = element.getAttribute("role");
  if (explicit) return explicit;
  if (element instanceof HTMLButtonElement) return "button";
  if (element instanceof HTMLAnchorElement) return "link";
  if (element instanceof HTMLSelectElement) return "combobox";
  if (element instanceof HTMLTextAreaElement) return "textbox";
  if (element instanceof HTMLInputElement) {
    if (["button", "reset", "submit"].includes(element.type)) return "button";
    if (element.type === "checkbox") return "checkbox";
    if (element.type === "radio") return "radio";
    return "textbox";
  }
  if (element.isContentEditable) return "textbox";
  return element.tagName.toLowerCase();
}

function readableControlValue(element: HTMLElement): string | null {
  if (element instanceof HTMLInputElement) {
    if (["password", "file"].includes(element.type)) return null;
    return boundedText(element.value, 1_000);
  }
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return boundedText(element.value, 1_000);
  }
  if (element.isContentEditable) return boundedText(element.textContent ?? "", 1_000);
  return null;
}

function failureReceipt(
  actionId: string,
  before: GuiStateSnapshot,
  error: unknown,
  after: GuiStateSnapshot,
): GuiActionReceipt {
  const guiError = error instanceof GuiControlError
    ? error
    : new GuiControlError("unexpected", error instanceof Error ? error.message : String(error));
  return {
    actionId,
    afterRevision: after.revision,
    beforeRevision: before.revision,
    completedAt: new Date().toISOString(),
    error: { code: guiError.code, message: guiError.message },
    ok: false,
    result: null,
    state: after,
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function settleGui(): Promise<void> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function cloneSerializable<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function boundedSerializable(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return boundedText(value, MAX_RESULT_TEXT);
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "undefined") return null;
  if (typeof value === "function" || typeof value === "symbol") return String(value);
  if (depth >= 5) return "[depth-limit]";
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  if (Array.isArray(value)) {
    return value.slice(0, MAX_RESULT_ITEMS).map((item) => boundedSerializable(item, depth + 1, seen));
  }
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value).slice(0, MAX_RESULT_ITEMS)) {
    if (/token|secret|password|api.?key|credential/i.test(key)) {
      output[key] = "[redacted]";
    } else {
      output[key] = boundedSerializable(item, depth + 1, seen);
    }
  }
  return output;
}

function boundedText(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}…`;
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}
