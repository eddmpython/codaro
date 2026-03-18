<script lang="ts">
  import { onMount } from "svelte";
  import {
    Bot,
    Box,
    ChevronDown,
    CircleX,
    Command,
    ExternalLink,
    FileText,
    FolderTree,
    KeyRound,
    LayoutTemplate,
    MessageCircleQuestionMark,
    Network,
    NotebookPen,
    PowerOff,
    Save,
    ScrollText,
    SquareDashedBottomCode,
    Sparkles,
    TriangleAlert,
    Unlink,
    Variable,
    X,
    Zap
  } from "lucide-svelte";
  import CellFrame from "./CellFrame.svelte";
  import { getBasePath } from "../basePath";
  import {
    addBlock as insertBlock,
    applyExecutionResult,
    createDefaultDocument,
    duplicateBlock as cloneBlock,
    moveBlock as reorderBlock,
    removeBlock as deleteBlock,
    updateBlockContent as replaceBlockContent,
    updateBlockType as replaceBlockType,
    withUpdatedTimestamp
  } from "../documentAdapter";
  import { detectMultipleDefinitions } from "../dataflow";
  import { exportDocumentAtPath, getBootstrap, loadDocumentAtPath, saveDocumentAtPath } from "../api";
  import { createContextHelpEntry, openPublicDoc } from "../contextHelp";
  import { PyodideEngine } from "../engines/pyodideEngine";
  import type { ExecutionEngine } from "../engines/executionEngine";
  import { ServerKernelEngine } from "../engines/serverKernelEngine";
  import type {
    CodaroDocument,
    ContextHelpEntry,
    EngineExecutionResult,
    ReactiveBlockPayload,
    VariableInfo
  } from "../types";

  export let initialPath = "";

  let bootstrap: { workspaceRoot?: string; documentPath?: string | null } | null = null;
  let documentState: CodaroDocument | null = null;
  let activeBlockId = "";
  let currentPath = "";
  let engine: ExecutionEngine | null = null;
  let engineName = "none";
  let engineStatus = "idle";
  let engineError = "";
  let variables: VariableInfo[] = [];
  let duplicateDefinitions = new Map<string, string[]>();
  let loading = true;
  let pageError = "";
  let saveState = "idle";
  let dirty = false;
  let selectedPanel = "";
  let helpContextPanel = "editor";
  let contextHelpEntry: ContextHelpEntry;
  const marimoVersion = "0.21.0";
  const marimoStaticBase = `${getBasePath()}/marimo`;
  const filenameInputClass =
    "placeholder:text-foreground-muted flex rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 filename w-full px-4 py-1 my-1 h-9 font-mono text-foreground/60";
  const floatingButtonClass =
    "flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm mo-button rounded px-3 py-2";
  const sidebarButtonClass = "flex items-center p-2 text-sm mx-px shadow-inset font-mono rounded hover:bg-(--sage-3)";
  const chromePanels = [
    { key: "files", label: "Files", icon: FolderTree },
    { key: "variables", label: "Variables", icon: Variable },
    { key: "packages", label: "Packages", icon: Box },
    { key: "ai", label: "AI", icon: Bot },
    { key: "outline", label: "Outline", icon: ScrollText },
    { key: "help", label: "Context Help", icon: MessageCircleQuestionMark },
    { key: "dependencies", label: "Dependencies", icon: Network }
  ];
  const developerTabs = [
    { key: "errors", label: "Errors", icon: CircleX },
    { key: "scratchpad", label: "Scratchpad", icon: NotebookPen },
    { key: "tracing", label: "Tracing", icon: Network },
    { key: "secrets", label: "Secrets", icon: KeyRound },
    { key: "logs", label: "Logs", icon: FileText },
    { key: "snippets", label: "Snippets", icon: SquareDashedBottomCode }
  ];

  function blockPayloads(document: CodaroDocument | null = documentState): ReactiveBlockPayload[] {
    return document?.blocks.map((block) => ({
      id: block.id,
      type: block.type === "markdown" ? "markdown" : "code",
      content: block.content
    })) || [];
  }

  function refreshWarnings(): void {
    duplicateDefinitions = detectMultipleDefinitions(blockPayloads());
  }

  function togglePanel(panelKey: string): void {
    if (panelKey !== "help") {
      helpContextPanel = panelKey;
    }
    selectedPanel = selectedPanel === panelKey ? "" : panelKey;
  }

  function openHelpPanel(): void {
    selectedPanel = "help";
  }

  function handleWindowKeydown(event: KeyboardEvent): void {
    const isModKey = event.metaKey || event.ctrlKey;
    if (isModKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveDocument();
      return;
    }
    if (event.key === "F1") {
      event.preventDefault();
      openHelpPanel();
    }
  }

  async function createEngine(): Promise<void> {
    engine?.destroy();
    engine = null;
    engineName = "none";
    engineStatus = "loading";
    engineError = "";
    variables = [];

    try {
      const serverEngine = new ServerKernelEngine();
      await serverEngine.initialize();
      engine = serverEngine;
      engineName = serverEngine.name;
      engineStatus = "ready";
      return;
    } catch (serverError) {
      try {
        const pyodideEngine = new PyodideEngine();
        await pyodideEngine.initialize();
        engine = pyodideEngine;
        engineName = pyodideEngine.name;
        engineStatus = "ready";
        engineError = serverError instanceof Error ? serverError.message : String(serverError);
      } catch (fallbackError) {
        engine = null;
        engineName = "none";
        engineStatus = "error";
        engineError = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      }
    }
  }

  async function initialize(): Promise<void> {
    loading = true;
    pageError = "";

    try {
      bootstrap = await getBootstrap();
      currentPath = initialPath || bootstrap.documentPath || "";
      await createEngine();
      if (currentPath) {
        await openDocument(currentPath, false);
      } else {
        startNewDocument(false);
      }
    } catch (error) {
      pageError = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  async function openDocument(path: string, recreateEngine = true): Promise<void> {
    if (!path) {
      return;
    }
    loading = true;
    pageError = "";

    try {
      if (recreateEngine) {
        await createEngine();
      }
      const payload = await loadDocumentAtPath(path);
      documentState = payload.document;
      currentPath = payload.path;
      activeBlockId = payload.document.blocks[0]?.id || "";
      dirty = !payload.exists;
      saveState = dirty ? "dirty" : "idle";
      refreshWarnings();
      variables = engine ? await engine.getVariables().catch(() => []) : [];
    } catch (error) {
      pageError = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  function startNewDocument(recreateEngine = true): void {
    documentState = createDefaultDocument("Untitled");
    currentPath = "";
    activeBlockId = documentState.blocks[0]?.id || "";
    dirty = true;
    saveState = "dirty";
    pageError = "";
    refreshWarnings();
    if (recreateEngine) {
      void createEngine();
    }
  }

  function markDirty(nextDocument: CodaroDocument): void {
    documentState = withUpdatedTimestamp(nextDocument);
    dirty = true;
    saveState = "dirty";
    refreshWarnings();
  }

  function updateBlockContent(blockId: string, content: string): void {
    if (!documentState) {
      return;
    }
    markDirty(replaceBlockContent(documentState, blockId, content));
  }

  function addBlock(type: "code" | "markdown", anchorBlockId?: string): void {
    if (!documentState) {
      startNewDocument();
      return;
    }
    const nextDocument = insertBlock(documentState, type, anchorBlockId || activeBlockId || null, "after");
    activeBlockId = nextDocument.blocks.find((block) => !documentState?.blocks.some((entry) => entry.id === block.id))?.id || activeBlockId;
    markDirty(nextDocument);
  }

  async function removeBlock(blockId: string): Promise<void> {
    if (!documentState) {
      return;
    }
    await engine?.removeDefinitions?.(blockId).catch(() => {});
    const nextDocument = deleteBlock(documentState, blockId);
    activeBlockId = nextDocument.blocks[0]?.id || "";
    markDirty(nextDocument);
  }

  async function toggleBlockType(blockId: string): Promise<void> {
    if (!documentState) {
      return;
    }
    const currentBlock = documentState.blocks.find((block) => block.id === blockId);
    if (!currentBlock) {
      return;
    }
    const nextType = currentBlock.type === "code" ? "markdown" : "code";
    if (currentBlock.type === "code") {
      await engine?.removeDefinitions?.(blockId).catch(() => {});
    }
    markDirty(replaceBlockType(documentState, blockId, nextType));
  }

  function moveBlock(blockId: string, offset: number): void {
    if (!documentState) {
      return;
    }
    markDirty(reorderBlock(documentState, blockId, offset));
  }

  function duplicateBlock(blockId: string): void {
    if (!documentState) {
      return;
    }
    markDirty(cloneBlock(documentState, blockId));
  }

  function setRunning(blockId: string): void {
    if (!documentState) {
      return;
    }
    documentState = {
      ...documentState,
      blocks: documentState.blocks.map((block) => {
        if (block.id !== blockId) {
          return block;
        }
        return {
          ...block,
          execution: {
            ...block.execution,
            status: "running"
          }
        };
      })
    };
  }

  function applyError(blockId: string, message: string): void {
    if (!documentState) {
      return;
    }
    const currentBlock = documentState.blocks.find((block) => block.id === blockId);
    const failure: EngineExecutionResult = {
      type: "error",
      blockId,
      data: "",
      stdout: "",
      stderr: message,
      variables,
      executionCount: (currentBlock?.execution.executionCount || 0) + 1,
      status: "error"
    };
    documentState = applyExecutionResult(documentState, blockId, failure);
  }

  async function runBlock(blockId: string): Promise<void> {
    if (!engine || !documentState) {
      return;
    }
    const block = documentState.blocks.find((entry) => entry.id === blockId);
    if (!block || block.type !== "code") {
      return;
    }
    if ((duplicateDefinitions.get(blockId) || []).length > 0) {
      applyError(blockId, `Duplicate definitions: ${duplicateDefinitions.get(blockId)?.join(", ")}`);
      return;
    }

    engineStatus = "running";
    engineError = "";
    setRunning(blockId);

    try {
      const reactiveResult = await engine.executeReactive(blockId, blockPayloads());
      let nextDocument = documentState;
      for (const result of reactiveResult.results) {
        if (!result.blockId) {
          continue;
        }
        nextDocument = applyExecutionResult(nextDocument, result.blockId, result);
      }
      documentState = nextDocument;
      const lastResult = reactiveResult.results[reactiveResult.results.length - 1];
      variables = lastResult?.variables || await engine.getVariables();
      engineStatus = "ready";
    } catch (error) {
      engineStatus = "error";
      engineError = error instanceof Error ? error.message : String(error);
      applyError(blockId, engineError);
    }
  }

  async function runAll(): Promise<void> {
    if (!documentState) {
      return;
    }
    await createEngine();
    if (!engine) {
      return;
    }

    engineStatus = "running";
    engineError = "";
    let nextDocument = documentState;

    for (const block of documentState.blocks.filter((entry) => entry.type === "code")) {
      setRunning(block.id);
      try {
        const result = await engine.execute(block.content, block.id);
        nextDocument = applyExecutionResult(nextDocument, block.id, result);
        documentState = nextDocument;
        variables = result.variables;
        if (result.status === "error") {
          engineStatus = "error";
          engineError = result.stderr || "Execution failed.";
          return;
        }
      } catch (error) {
        engineStatus = "error";
        engineError = error instanceof Error ? error.message : String(error);
        applyError(block.id, engineError);
        return;
      }
    }

    engineStatus = "ready";
  }

  async function saveDocument(): Promise<void> {
    if (!documentState) {
      return;
    }
    const suggestedPath = bootstrap?.workspaceRoot
      ? `${bootstrap.workspaceRoot}\\untitled.py`
      : "untitled.py";
    const targetPath = currentPath || window.prompt("Save notebook path", suggestedPath) || "";
    if (!targetPath) {
      return;
    }

    saveState = "saving";
    const stampedDocument = withUpdatedTimestamp(documentState);
    documentState = stampedDocument;

    try {
      const payload = await saveDocumentAtPath(targetPath, stampedDocument);
      currentPath = payload.path;
      dirty = false;
      saveState = "saved";
      setTimeout(() => {
        if (saveState === "saved") {
          saveState = "idle";
        }
      }, 1200);
    } catch (error) {
      saveState = "idle";
      pageError = error instanceof Error ? error.message : String(error);
    }
  }

  async function exportDocument(): Promise<void> {
    if (!documentState) {
      return;
    }
    if (!currentPath) {
      await saveDocument();
      if (!currentPath) {
        return;
      }
    }

    const format = window.prompt("Export format: percent | marimo | ipynb", "ipynb") || "";
    if (!format) {
      return;
    }

    const extension = format === "ipynb" ? ".ipynb" : ".py";
    const suggestedOutputPath = currentPath.replace(/\.[^.]+$/, extension);
    const outputPath = window.prompt("Export output path", suggestedOutputPath) || "";
    if (!outputPath) {
      return;
    }

    try {
      await exportDocumentAtPath(currentPath, format, outputPath);
    } catch (error) {
      pageError = error instanceof Error ? error.message : String(error);
    }
  }

  async function launchApp(): Promise<void> {
    if (!documentState) {
      return;
    }
    if (!currentPath) {
      await saveDocument();
      if (!currentPath) {
        return;
      }
    }
    const url = new URL(`${window.location.origin}${getBasePath()}/app`);
    url.searchParams.set("path", currentPath);
    window.open(url.toString(), "_blank", "noopener");
  }

  $: documentBlocks = documentState?.blocks || [];
  $: activeBlock = documentState?.blocks.find((block) => block.id === activeBlockId) || null;
  $: documentLocation = currentPath || documentState?.title || "Untitled.py";
  $: connectionState = engineStatus === "error" ? "CLOSED" : "OPEN";
  $: shellError = engineStatus === "error" ? engineError : pageError;
  $: contextHelpEntry = createContextHelpEntry({
    route: "editor",
    panelKey: helpContextPanel,
    blockType: activeBlock?.type || null,
    engineName,
    engineStatus,
    errorState: shellError
  });
  $: panelTitle = chromePanels.find((panel) => panel.key === selectedPanel)?.label || selectedPanel;
  $: helperPanelSize = selectedPanel ? "30.0" : "0.0";
  $: saveButtonColor = dirty ? "yellow" : connectionState === "CLOSED" ? "gray" : "hint-green";

  onMount(() => {
    void initialize();
    window.addEventListener("keydown", handleWindowKeydown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeydown);
      engine?.destroy();
    };
  });
</script>

<svelte:head>
  <link rel="icon" href={`${marimoStaticBase}/favicon.ico`} />
  <link rel="preload" href={`${marimoStaticBase}/assets/gradient-yHQUC_QB.png`} as="image" />
  <link rel="preload" href={`${marimoStaticBase}/assets/noise-60BoTA8O.png`} as="image" />
  <link rel="preload" href={`${marimoStaticBase}/assets/Lora-VariableFont_wght-B2ootaw-.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${marimoStaticBase}/assets/PTSans-Regular-CxL0S8W7.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${marimoStaticBase}/assets/PTSans-Bold-D9fedIX3.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${marimoStaticBase}/assets/FiraMono-Regular-BTCkDNvf.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${marimoStaticBase}/assets/FiraMono-Medium-DU3aDxX5.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${marimoStaticBase}/assets/FiraMono-Bold-CLVRCuM9.ttf`} as="font" crossorigin="anonymous" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="a marimo app" />
  <link rel="apple-touch-icon" href={`${marimoStaticBase}/apple-touch-icon.png`} />
  <link rel="manifest" href={`${marimoStaticBase}/manifest.json`} />

  <script data-marimo="true">
    function __resizeIframe(obj) {
      const scrollbarHeight = 20;
      function setHeight() {
        if (!obj.contentWindow?.document?.documentElement) {
          return;
        }
        const element = obj.contentWindow.document.documentElement;
        if (element.scrollHeight === element.clientHeight) {
          return;
        }
        const hasHorizontalScrollbar = element.scrollWidth > element.clientWidth;
        const newHeight = element.scrollHeight + (hasHorizontalScrollbar ? scrollbarHeight : 0);
        if (obj.style.height !== `${newHeight}px`) {
          obj.style.height = `${newHeight}px`;
        }
      }
      setHeight();
      const resizeObserver = new ResizeObserver(() => {
        setHeight();
      });
      if (obj.contentWindow?.document?.body) {
        resizeObserver.observe(obj.contentWindow.document.body);
      }
    }
  </script>

  <marimo-filename hidden>{documentLocation}</marimo-filename>
  <marimo-version data-version={marimoVersion} hidden></marimo-version>
  <marimo-user-config data-config={"{}"} hidden></marimo-user-config>
  <marimo-server-token data-token="" hidden></marimo-server-token>
  <title>{documentLocation}</title>
</svelte:head>

<div id="root" class="light light-theme" data-theme="light">
  {#if loading}
    <div class="screenState">Loading workspace…</div>
  {:else if pageError && !documentState}
    <div class="screenState">{pageError}</div>
  {:else if documentState}
    <div class="contents" style="--marimo-code-editor-font-size: 0.875rem;">
      <div class="flex flex-col flex-1 overflow-hidden absolute inset-0 print:relative">
        <div
          class=""
          data-panel-group=""
          data-panel-group-direction="horizontal"
          data-panel-group-id="codaro-horizontal-shell"
          style="display: flex; flex-direction: row; height: 100%; overflow: hidden; width: 100%;"
        >
          <div class="h-full pt-4 pb-1 px-1 flex flex-col items-start text-muted-foreground text-md select-none text-sm z-50 dark:bg-background print:hidden hide-on-fullscreen">
            <template></template>
            <span data-focus-scope-start="true" hidden=""></span>
            <div
              data-state="closed"
              class="flex flex-col gap-0"
              aria-label="Sidebar panels"
              role="listbox"
              tabindex="0"
              data-layout="stack"
              data-orientation="vertical"
            >
              {#each chromePanels as panel}
                <div class="active:cursor-grabbing data-[dragging]:opacity-60 outline-none" role="option" aria-selected="false" tabindex="-1" data-key={panel.key}>
                  <button type="button" class={sidebarButtonClass} data-state={selectedPanel === panel.key ? "open" : "closed"} on:click={() => togglePanel(panel.key)}>
                    <svelte:component this={panel.icon} class="h-5 w-5" />
                  </button>
                </div>
              {/each}
            </div>
            <span data-focus-scope-end="true" hidden=""></span>
            <button
              class={sidebarButtonClass}
              data-state="closed"
              type="button"
              aria-label="Open public docs"
              on:click={() => openPublicDoc("/docs")}
            >
              <ExternalLink class="h-5 w-5" />
            </button>
            <div class="flex-1"></div>
            <div class="flex flex-col-reverse gap-px overflow-hidden" data-state="closed"></div>
          </div>

          <div
            data-testid="helper"
            class="dark:bg-(--slate-1) print:hidden hide-on-fullscreen"
            id="app-chrome-sidebar"
            data-panel-group-id="codaro-horizontal-shell"
            data-panel=""
            data-panel-collapsible="true"
            data-panel-id="app-chrome-sidebar"
            data-panel-size={helperPanelSize}
            style={`flex: ${selectedPanel ? "30" : "0"} 1 0px; overflow: hidden;`}
          >
            <span class="flex flex-row h-full">
              <div class="flex flex-col h-full flex-1 overflow-hidden mr-[-4px]">
                <div class="p-3 border-b flex justify-between items-center">
                  <span class="text-sm text-(--slate-11) uppercase tracking-wide font-semibold flex-1">{panelTitle}</span>
                  <button
                    type="button"
                    class="disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background opacity-80 hover:opacity-100 active:opacity-100 h-7 px-2 rounded-md text-xs m-0"
                    data-testid="close-helper-pane"
                    on:click={() => (selectedPanel = "")}
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div class="flex-1 overflow-auto px-3 py-2">
                  {#if selectedPanel === "variables"}
                    <div class="flex flex-col gap-2 text-xs font-mono">
                      {#if variables.length === 0}
                        <span class="text-muted-foreground">No variables</span>
                      {:else}
                        {#each variables as variable}
                          <div class="rounded border border-border px-2 py-1">
                            <div>{variable.name}</div>
                            <div class="text-muted-foreground">{variable.typeName}</div>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {:else if selectedPanel === "help"}
                    <div class="flex flex-col gap-4 text-sm">
                      <div class="rounded-lg border border-border bg-background/70 p-3">
                        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{contextHelpEntry.when}</div>
                        <p class="mt-3 text-sm leading-6 text-(--slate-11)">{contextHelpEntry.summary}</p>
                      </div>

                      <div class="rounded-lg border border-border bg-background/70 p-3">
                        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Focused actions</div>
                        <div class="mt-3 flex flex-col gap-2">
                          {#each contextHelpEntry.actions as action}
                            <div class="rounded-md border border-border/70 px-3 py-2">
                              <div class="flex items-center justify-between gap-3">
                                <span class="text-sm font-medium text-(--slate-12)">{action.label}</span>
                                {#if action.shortcut}
                                  <span class="rounded bg-(--slate-3) px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{action.shortcut}</span>
                                {/if}
                              </div>
                              <p class="mt-1 text-xs leading-5 text-muted-foreground">{action.description}</p>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div class="rounded-lg border border-border bg-background/70 p-3">
                        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public docs</div>
                        <div class="mt-3 flex flex-col gap-2">
                          {#each contextHelpEntry.docLinks as docLink}
                            <a
                              class="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-sm text-(--slate-12) hover:bg-(--slate-2)"
                              href={docLink.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span>{docLink.label}</span>
                              <ExternalLink class="h-4 w-4 text-muted-foreground" />
                            </a>
                          {/each}
                        </div>
                      </div>
                    </div>
                  {:else if selectedPanel}
                    <div class="flex flex-col gap-2">
                      <div class="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{panelTitle}</div>
                      <div class="text-xs leading-5 text-muted-foreground">
                        This panel stays inside the editor surface. Open Context Help for task-focused guidance or use the public docs button for long-form documentation.
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
              <div
                class="border-border print:hidden z-10 resize-handle-collapsed vertical"
                role="separator"
                data-panel-group-direction="horizontal"
                data-panel-group-id="codaro-horizontal-shell"
                data-resize-handle=""
                data-panel-resize-handle-enabled="false"
                data-panel-resize-handle-id="codaro-horizontal-helper"
                data-resize-handle-state="inactive"
                aria-controls="app-chrome-sidebar"
                aria-valuemax="75"
                aria-valuemin="10"
                aria-valuenow={selectedPanel ? "30" : "0"}
                style="touch-action: none; user-select: none;"
              ></div>
            </span>
          </div>

          <div
            class=""
            id="app-chrome-body"
            data-panel-group-id="codaro-horizontal-shell"
            data-panel=""
            data-panel-id="app-chrome-body"
            data-panel-size="100.0"
            style="flex: 100 1 0px; overflow: hidden;"
          >
            <div
              class=""
              data-panel-group=""
              data-panel-group-direction="vertical"
              data-panel-group-id="codaro-vertical-shell"
              style="display: flex; flex-direction: column; height: 100%; overflow: hidden; width: 100%;"
            >
              <div
                class="relative h-full"
                id="app"
                data-panel-group-id="codaro-vertical-shell"
                data-panel=""
                data-panel-id="app"
                data-panel-size="100.0"
                style="flex: 100 1 0px; overflow: hidden;"
              >
                <div class="noise"></div>
                <div class="disconnected-gradient"></div>

                {#if connectionState === "CLOSED"}
                  <div class="z-50 top-4 left-4 absolute">
                    <div class="print:hidden pointer-events-auto hover:cursor-pointer" data-state="closed">
                      <Unlink class="w-[25px] h-[25px] text-(--red-11)" />
                    </div>
                  </div>
                {/if}

                <div
                  id="App"
                  data-config-width="compact"
                  data-connection-state={connectionState}
                  class={`mathjax_ignore bg-background w-full h-full text-textColor flex flex-col overflow-y-auto overflow-x-hidden print:height-fit ${connectionState === "CLOSED" ? "disconnected" : ""}`}
                >
                  <div class="pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0">
                    <div class="flex items-center justify-center container">
                      <div
                        tabindex="-1"
                        class="flex h-full w-full flex-col overflow-hidden rounded-md text-popover-foreground bg-transparent group filename-input"
                        id="filename-input"
                        cmdk-root=""
                      >
                        <label
                          cmdk-label=""
                          for="codaro-filename-input"
                          id="codaro-filename-label"
                          style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"
                        ></label>
                        <div
                          class="max-h-[300px] overflow-y-auto overflow-x-hidden"
                          cmdk-list=""
                          role="listbox"
                          tabindex="-1"
                          aria-label="Suggestions"
                          id="codaro-filename-list"
                          style="--cmdk-list-height: 40px;"
                        >
                          <div cmdk-list-sizer="">
                            <div>
                              <div class="flex items-center border-b border-none justify-center px-1" cmdk-input-wrapper="">
                                <input
                                  class={filenameInputClass}
                                  data-testid="dir-completion-input"
                                  tabindex="-1"
                                  spellcheck="false"
                                  placeholder={documentState.title || "Untitled.py"}
                                  autocomplete="off"
                                  cmdk-input=""
                                  autocorrect="off"
                                  aria-autocomplete="list"
                                  role="combobox"
                                  aria-expanded="true"
                                  aria-controls="codaro-filename-list"
                                  aria-labelledby="codaro-filename-label"
                                  id="codaro-filename-input"
                                  type="text"
                                  readonly
                                  value={documentLocation}
                                  style="max-width: 1000px;"
                                />
                              </div>
                              <div class="marimo" style="display: contents;"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {#if shellError}
                      <div class="font-mono text-center text-base text-(--red-11)">
                        <p>{shellError}</p>
                      </div>
                    {/if}
                  </div>

                  <div class="container flex flex-col gap-3 pb-24">
                    <section class="flex flex-col gap-3">
                      {#each documentBlocks as block (block.id)}
                        <CellFrame
                          {block}
                          active={block.id === activeBlockId}
                          onSelect={() => (activeBlockId = block.id)}
                          onRun={() => void runBlock(block.id)}
                          onChange={(content) => updateBlockContent(block.id, content)}
                          onToggleType={() => void toggleBlockType(block.id)}
                        />
                      {/each}
                    </section>

                  </div>
                </div>

                <div class="absolute bottom-5 right-5 flex flex-col gap-2 items-center print:hidden pointer-events-auto z-30">
                  <button class={`${floatingButtonClass} ${saveButtonColor} rectangle`} id="save-button" aria-label="Save" data-state="closed" on:click={saveDocument}>
                    <Save size={18} strokeWidth={1.5} />
                  </button>
                  <button class={`${floatingButtonClass} hint-green`} data-testid="hide-code-button" id="preview-button" data-state="closed" on:click={launchApp}>
                    <LayoutTemplate size={18} strokeWidth={1.5} />
                  </button>
                  <button class={`${floatingButtonClass} hint-green`} data-testid="command-palette-button" data-state="closed" on:click={runAll}>
                    <Command size={18} strokeWidth={1.5} />
                  </button>
                  <div></div>
                  <div class="flex flex-col gap-2 items-center"></div>
                </div>
              </div>

              <div
                data-testid="panel"
                class="dark:bg-(--slate-1) print:hidden hide-on-fullscreen"
                id="app-chrome-panel"
                data-panel-group-id="codaro-vertical-shell"
                data-panel=""
                data-panel-collapsible="true"
                data-panel-id="app-chrome-panel"
                data-panel-size="0.0"
                style="flex: 0 1 0px; overflow: hidden;"
              >
                <div
                  class="border-border print:hidden z-20 resize-handle-collapsed horizontal"
                  role="separator"
                  data-panel-group-direction="vertical"
                  data-panel-group-id="codaro-vertical-shell"
                  data-resize-handle=""
                  data-panel-resize-handle-enabled="false"
                  data-panel-resize-handle-id="codaro-vertical-panel"
                  data-resize-handle-state="inactive"
                  aria-controls="app"
                  aria-valuemax="90"
                  aria-valuemin="25"
                  aria-valuenow="100"
                  style="touch-action: none; user-select: none;"
                ></div>
                <div class="flex flex-col h-full">
                  <div class="flex items-center justify-between border-b px-2 h-8 bg-background shrink-0">
                    <template></template>
                    <div
                      data-state="closed"
                      class="flex flex-row gap-1"
                      aria-label="Developer panel tabs"
                      role="listbox"
                      tabindex="0"
                      data-layout="stack"
                      data-orientation="vertical"
                    >
                      {#each developerTabs as tab}
                        <div class="active:cursor-grabbing data-[dragging]:opacity-60 outline-none" role="option" aria-selected="false" tabindex="-1" data-key={tab.key}>
                          <div class="text-sm flex gap-2 px-2 pt-1 pb-0.5 items-center leading-none rounded-sm cursor-pointer hover:bg-muted/50">
                            <svelte:component this={tab.icon} class="w-4 h-4" />
                            {tab.label}
                          </div>
                        </div>
                      {/each}
                    </div>
                    <div class="border-l border-border h-4 mx-1"></div>
                    <button type="button" class="p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="backend-status" data-state="closed">
                      <PowerOff class={`w-4 h-4 ${engineStatus === "error" ? "text-red-500" : "text-emerald-500"}`} />
                      <span>{engineStatus === "error" ? "Kernel" : engineName}</span>
                    </button>
                    <div class="flex-1"></div>
                    <button
                      type="button"
                      class="disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background opacity-80 hover:opacity-100 active:opacity-100 h-7 px-2 rounded-md text-xs"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="flex-1 overflow-hidden"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="h-10 py-1 gap-1 bg-background flex items-center text-muted-foreground text-md pl-2 pr-1 border-t border-border select-none print:hidden text-sm z-50 hide-on-fullscreen overflow-x-auto overflow-y-hidden scrollbar-thin">
          <div class="flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded hover:bg-(--sage-3) h-full" data-testid="footer-panel" data-state="closed">
            <div class="flex items-center gap-1 h-full">
              <CircleX class="w-4 h-4 text-destructive" />
              <span>{engineStatus === "error" ? 1 : 0}</span>
              <TriangleAlert class="w-4 h-4 ml-1" />
              <span>{duplicateDefinitions.size}</span>
            </div>
          </div>

          <button class="h-full flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded hover:bg-(--sage-3)" data-testid="footer-runtime-settings" data-state="closed" on:click={exportDocument}>
            <div class="flex items-center gap-1">
              <Zap size={16} class="text-amber-500" />
              <ChevronDown size={14} />
            </div>
          </button>

          <div class="mx-auto"></div>

          <div class="flex items-center shrink-0 min-w-0">
            <div class="flex gap-2 items-center px-1"></div>

            <div class="h-full flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded hover:bg-(--sage-3)" data-testid="footer-ai-disabled" data-state="closed">
              <Sparkles class="h-4 w-4 opacity-60" />
            </div>
          </div>
        </footer>
      </div>
    </div>

    <div role="region" aria-label="Notifications (F8)" tabindex="-1" style="pointer-events: none;">
      <ol tabindex="-1" class="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:w-fit md:max-w-[420px]"></ol>
    </div>
    <div id="portal" data-testid="glide-portal" style="position: fixed; left: 0; top: 0; z-index: 9999"></div>
  {/if}
</div>
