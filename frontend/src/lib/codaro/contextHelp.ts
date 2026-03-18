import type {
  ContextHelpAction,
  ContextHelpDocLink,
  ContextHelpEntry,
} from "./types";

export interface ContextHelpInput {
  route: "editor" | "app";
  panelKey: string;
  blockType: string | null;
  engineName: string;
  engineStatus: string;
  errorState: string;
}

const PUBLIC_SITE_URL = "https://eddmpython.github.io/codaro";

const panelDefinitions: Record<
  string,
  {
    title: string;
    summary: string;
    docLinks: { label: string; path: string }[];
  }
> = {
  editor: {
    title: "Editor surface",
    summary:
      "Codaro keeps the editor focused on execution, learning, and automation. Long-form docs belong to the public site.",
    docLinks: [
      { label: "First notebook", path: "/docs/getting-started/first-notebook" },
      { label: "What is Codaro", path: "/blog/what-is-codaro" },
    ],
  },
  files: {
    title: "Files tool",
    summary:
      "Use the helper rail to move through workspace files and notebook entry points. It is not a markdown article reader.",
    docLinks: [
      { label: "First notebook", path: "/docs/getting-started/first-notebook" },
      { label: "Local server", path: "/docs/guides/local-server" },
    ],
  },
  variables: {
    title: "Variables tool",
    summary:
      "This panel reflects the current runtime registry after execution. If a value looks stale, rerun the defining block and its reactive dependents.",
    docLinks: [
      { label: "Execution runtime", path: "/docs/concepts/execution-runtime" },
      { label: "Block model", path: "/docs/concepts/block-model" },
    ],
  },
  packages: {
    title: "Packages tool",
    summary:
      "Package installs belong to the runtime surface. The editor stays operational while deeper package guidance lives on the public site.",
    docLinks: [
      { label: "Installation", path: "/docs/getting-started/installation" },
      { label: "CLI reference", path: "/docs/reference/cli" },
    ],
  },
  ai: {
    title: "AI tool",
    summary:
      "AI extends the runtime through visible editor tools. Lessons and notebook execution must still work without any provider attached.",
    docLinks: [
      { label: "What is Codaro", path: "/blog/what-is-codaro" },
      { label: "Execution runtime", path: "/docs/concepts/execution-runtime" },
    ],
  },
  outline: {
    title: "Outline tool",
    summary:
      "Outline tracks structure inside the current notebook. It is separate from the public docs tree and only follows headings in the document you are editing.",
    docLinks: [
      { label: "First notebook", path: "/docs/getting-started/first-notebook" },
      { label: "Block model", path: "/docs/concepts/block-model" },
    ],
  },
  help: {
    title: "Context Help",
    summary:
      "The helper rail now carries compact, task-specific guidance. Full docs, blog posts, and search stay on the public landing site.",
    docLinks: [
      { label: "Public docs", path: "/docs" },
      { label: "Public search", path: "/search" },
    ],
  },
  dependencies: {
    title: "Dependencies tool",
    summary:
      "Reactive dependencies explain which blocks must rerun when state changes. Use this to understand stale outputs before you trust them.",
    docLinks: [
      { label: "Execution runtime", path: "/docs/concepts/execution-runtime" },
      { label: "Block model", path: "/docs/concepts/block-model" },
    ],
  },
};

function getPublicDocUrl(path: string): string {
  return `${PUBLIC_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function openPublicDoc(path: string): void {
  window.open(getPublicDocUrl(path), "_blank", "noopener,noreferrer");
}

function buildDocLinks(paths: { label: string; path: string }[]): ContextHelpDocLink[] {
  return paths.map((entry) => ({
    label: entry.label,
    href: getPublicDocUrl(entry.path),
  }));
}

function blockLabel(blockType: string | null): string {
  if (blockType === "code") {
    return "Code block";
  }
  if (blockType === "markdown") {
    return "Markdown block";
  }
  if (blockType) {
    return `${blockType} block`;
  }
  return "No block selected";
}

function blockSummary(blockType: string | null): string {
  if (blockType === "code") {
    return "The focused block can mutate runtime state, define variables, and trigger reactive reruns.";
  }
  if (blockType === "markdown") {
    return "The focused block explains or teaches without changing runtime state.";
  }
  if (blockType) {
    return "The focused block is part of the document surface but does not currently expose a specialized help profile.";
  }
  return "Select a block to get block-specific guidance.";
}

function runtimeLabel(input: ContextHelpInput): string {
  if (input.errorState) {
    return "Runtime error";
  }
  if (input.engineStatus === "running") {
    return "Runtime running";
  }
  if (input.engineStatus === "ready" && input.engineName === "server") {
    return "Server kernel ready";
  }
  if (input.engineStatus === "ready" && input.engineName === "pyodide") {
    return "Pyodide fallback ready";
  }
  if (input.engineStatus === "loading") {
    return "Runtime starting";
  }
  return `${input.engineName || "Runtime"} ${input.engineStatus}`;
}

function runtimeSummary(input: ContextHelpInput): string {
  if (input.errorState) {
    return "The runtime is reporting an error. Fix the failing code or reconnect the kernel before trusting outputs and variables.";
  }
  if (input.engineStatus === "running") {
    return "Execution is in flight. Wait for the active run to settle before comparing variables or outputs.";
  }
  if (input.engineStatus === "ready" && input.engineName === "server") {
    return "The server kernel is ready, so local files, packages, and automation capabilities are available.";
  }
  if (input.engineStatus === "ready" && input.engineName === "pyodide") {
    return "The browser fallback is ready. Notebook execution works, but local file and package automation are limited.";
  }
  if (input.engineStatus === "loading") {
    return "The runtime is still starting. Keep edits local until the engine settles.";
  }
  return "The runtime is present but not yet in a fully ready state.";
}

function buildActions(input: ContextHelpInput): ContextHelpAction[] {
  const actions: ContextHelpAction[] = [];

  if (input.errorState) {
    actions.push({
      label: "Recover runtime",
      description: "Fix the failing code, then rerun the focused block or reload the session.",
    });
  }

  if (input.blockType === "code") {
    actions.push({
      label: "Run focused block",
      description: "Execute the active code block and let reactive dependents follow.",
      shortcut: "Shift+Enter",
    });
  }

  actions.push({
    label: "Save notebook",
    description: "Persist the current percent-format document to the workspace.",
    shortcut: "Ctrl/Cmd+S",
  });
  actions.push({
    label: "Open Context Help",
    description: "Bring this compact help panel back without leaving the editor.",
    shortcut: "F1",
  });

  return actions;
}

export function createContextHelpEntry(input: ContextHelpInput): ContextHelpEntry {
  const panelDefinition = panelDefinitions[input.panelKey] || panelDefinitions.editor;
  const focusedBlock = blockLabel(input.blockType);
  const runtime = runtimeLabel(input);

  return {
    id: `${input.route}:${input.panelKey}:${input.blockType || "none"}:${input.engineStatus}:${input.errorState ? "error" : "ok"}`,
    title: panelDefinition.title,
    summary: `${panelDefinition.summary} ${blockSummary(input.blockType)} ${runtimeSummary(input)}`,
    when: `Focused block: ${focusedBlock}. Active tool: ${panelDefinition.title}. Runtime: ${runtime}.`,
    actions: buildActions(input),
    docLinks: buildDocLinks(panelDefinition.docLinks),
  };
}
