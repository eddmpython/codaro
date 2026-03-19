<script lang="ts">
  import { onMount } from "svelte";
  import { ExternalLink } from "lucide-svelte";
  import CellFrame from "./CellFrame.svelte";
  import EditPage from "../app/EditPage.svelte";
  import TopRightControls from "../controls/TopRightControls.svelte";
  import BottomRightControls from "../controls/BottomRightControls.svelte";
  import CommandPalette from "../controls/CommandPalette.svelte";
  import KeyboardShortcuts from "../controls/KeyboardShortcuts.svelte";
  import FindReplace from "../controls/FindReplace.svelte";
  import FileExplorerPanel from "../panels/FileExplorerPanel.svelte";
  import VariablesPanel from "../panels/VariablesPanel.svelte";
  import DependencyGraphPanel from "../panels/DependencyGraphPanel.svelte";
  import DocumentationPanel from "../panels/DocumentationPanel.svelte";
  import OutlinePanel from "../panels/OutlinePanel.svelte";
  import PackagesPanel from "../panels/PackagesPanel.svelte";
  import SnippetsPanel from "../panels/SnippetsPanel.svelte";
  import AIChatPanel from "../panels/AIChatPanel.svelte";
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
  import {
    getSelectedPanel,
    setSelectedPanel,
    getIsSidebarOpen
  } from "../stores/panels.svelte";
  import type {
    CodaroDocument,
    ContextHelpEntry,
    EngineExecutionResult,
    ReactiveBlockPayload,
    VariableInfo
  } from "../types";

  interface Props {
    initialPath?: string;
  }

  let { initialPath = "" }: Props = $props();

  let bootstrap: { workspaceRoot?: string; documentPath?: string | null } | null = $state(null);
  let documentState: CodaroDocument | null = $state(null);
  let activeBlockId = $state("");
  let currentPath = $state("");
  let engine: ExecutionEngine | null = $state(null);
  let engineName = $state("none");
  let engineStatus = $state("idle");
  let engineError = $state("");
  let variables: VariableInfo[] = $state([]);
  let duplicateDefinitions = $state(new Map<string, string[]>());
  let loading = $state(true);
  let pageError = $state("");
  let saveState = $state("idle");
  let dirty = $state(false);
  let helpContextPanel = $state("editor");
  let commandPaletteOpen = $state(false);
  let keyboardShortcutsOpen = $state(false);
  let findReplaceOpen = $state(false);

  const marimoVersion = "0.21.0";
  const marimoStaticBase = `${getBasePath()}/marimo`;

  const chromePanels = [
    { key: "files", label: "Files" },
    { key: "variables", label: "Variables" },
    { key: "dependencies", label: "Dependencies" },
    { key: "packages", label: "Packages" },
    { key: "outline", label: "Outline" },
    { key: "documentation", label: "Context Help" },
    { key: "snippets", label: "Snippets" },
    { key: "ai", label: "AI" }
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

  function handleWindowKeydown(event: KeyboardEvent): void {
    const isModKey = event.metaKey || event.ctrlKey;
    if (isModKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveDocument();
      return;
    }
    if (isModKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      commandPaletteOpen = !commandPaletteOpen;
      return;
    }
    if (isModKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      findReplaceOpen = !findReplaceOpen;
      return;
    }
    if (event.key === "F1") {
      event.preventDefault();
      setSelectedPanel("documentation");
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

  let documentBlocks = $derived(documentState?.blocks || []);
  let activeBlock = $derived(documentState?.blocks.find((block) => block.id === activeBlockId) || null);
  let documentLocation = $derived(currentPath || documentState?.title || "Untitled.py");
  let connectionState = $derived(engineStatus === "error" ? "CLOSED" : "OPEN");
  let shellError = $derived(engineStatus === "error" ? engineError : pageError);
  let issueCount = $derived(engineStatus === "error" ? 1 : 0);
  let warningCount = $derived(duplicateDefinitions.size);
  let contextHelpEntry = $derived(createContextHelpEntry({
    route: "editor",
    panelKey: helpContextPanel,
    blockType: activeBlock?.type || null,
    engineName,
    engineStatus,
    errorState: shellError
  }));
  let panelTitle = $derived(
    chromePanels.find((panel) => panel.key === getSelectedPanel())?.label || getSelectedPanel()
  );
  let saveButtonColor = $derived(dirty ? "yellow" : connectionState === "CLOSED" ? "gray" : "hint-green");

  let variableEntries = $derived(variables.map((v) => ({
    name: v.name,
    type: v.typeName || "",
    value: v.value || "",
    declaredBy: v.declaredBy || "",
    usedBy: v.usedBy || []
  })));

  let commandPaletteItems = $derived([
    { label: "Save", group: "Commands", shortcut: "Ctrl+S", handle: () => void saveDocument(), keywords: ["save"] },
    { label: "Run All", group: "Commands", shortcut: "Ctrl+Shift+Enter", handle: () => void runAll(), keywords: ["run", "execute"] },
    { label: "Export", group: "Commands", handle: () => void exportDocument(), keywords: ["export"] },
    { label: "Open App Mode", group: "Commands", handle: () => void launchApp(), keywords: ["app", "preview"] },
    { label: "New Code Cell", group: "Cell Actions", handle: () => addBlock("code"), keywords: ["add", "cell", "code"] },
    { label: "New Markdown Cell", group: "Cell Actions", handle: () => addBlock("markdown"), keywords: ["add", "cell", "markdown"] },
    { label: "Toggle Keyboard Shortcuts", group: "Commands", shortcut: "F1", handle: () => { keyboardShortcutsOpen = !keyboardShortcutsOpen; }, keywords: ["shortcuts", "help"] },
    { label: "Toggle Find & Replace", group: "Commands", shortcut: "Ctrl+F", handle: () => { findReplaceOpen = !findReplaceOpen; }, keywords: ["find", "replace", "search"] },
    { label: "Files Panel", group: "Panels", handle: () => setSelectedPanel("files"), keywords: ["files", "explorer"] },
    { label: "Variables Panel", group: "Panels", handle: () => setSelectedPanel("variables"), keywords: ["variables"] },
    { label: "Dependencies Panel", group: "Panels", handle: () => setSelectedPanel("dependencies"), keywords: ["dependencies", "graph"] },
    { label: "Context Help", group: "Panels", handle: () => setSelectedPanel("documentation"), keywords: ["help", "docs"] },
    { label: "Packages Panel", group: "Panels", handle: () => setSelectedPanel("packages"), keywords: ["packages", "pip"] },
    { label: "Outline Panel", group: "Panels", handle: () => setSelectedPanel("outline"), keywords: ["outline", "toc"] },
    { label: "Snippets Panel", group: "Panels", handle: () => setSelectedPanel("snippets"), keywords: ["snippets"] },
    { label: "AI Panel", group: "Panels", handle: () => setSelectedPanel("ai"), keywords: ["ai", "chat"] }
  ]);

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
      <EditPage
        {connectionState}
        {documentLocation}
        documentTitle={documentState.title || "untitled marimo notebook"}
        hasPath={!!currentPath}
        {shellError}
        {engineName}
        {engineStatus}
        errorCount={issueCount}
        {warningCount}
        {issueCount}
        {panelTitle}
        onExport={exportDocument}
      >
        {#snippet helperPanelContent()}
          {#if getSelectedPanel() === "files"}
            <FileExplorerPanel />
          {:else if getSelectedPanel() === "variables"}
            <VariablesPanel variables={variableEntries} />
          {:else if getSelectedPanel() === "dependencies"}
            <DependencyGraphPanel />
          {:else if getSelectedPanel() === "documentation"}
            <DocumentationPanel
              title="Context Help"
              content={contextHelpEntry.summary}
            />
          {:else if getSelectedPanel() === "outline"}
            <OutlinePanel />
          {:else if getSelectedPanel() === "packages"}
            <PackagesPanel />
          {:else if getSelectedPanel() === "snippets"}
            <SnippetsPanel />
          {:else if getSelectedPanel() === "ai"}
            <AIChatPanel />
          {/if}
        {/snippet}

        {#snippet floatingControls()}
          <TopRightControls {connectionState} />
          <BottomRightControls
            {connectionState}
            {engineStatus}
            {dirty}
            {saveButtonColor}
            onSave={saveDocument}
            onLaunchApp={launchApp}
            onRunAll={runAll}
            onOpenCommandPalette={() => { commandPaletteOpen = true; }}
            onOpenKeyboardShortcuts={() => { keyboardShortcutsOpen = true; }}
          />
        {/snippet}

        <div class="px-1 sm:px-16 md:px-20 xl:px-24 pb-24 sm:pb-12">
          <div class="m-auto pr-4 min-w-[400px] pb-24 sm:pb-12" style="max-width: var(--content-width, 776px)">
            <div data-testid="cell-column" class="flex flex-col gap-5">
              {#each documentBlocks as block (block.id)}
                <CellFrame
                  {block}
                  active={block.id === activeBlockId}
                  onSelect={() => (activeBlockId = block.id)}
                  onRun={() => void runBlock(block.id)}
                  onChange={(content) => updateBlockContent(block.id, content)}
                  onToggleType={() => void toggleBlockType(block.id)}
                  onDelete={() => void removeBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onAddBelow={() => addBlock("code", block.id)}
                />
              {/each}
            </div>
          </div>
        </div>
      </EditPage>
    </div>

    <div role="region" aria-label="Notifications (F8)" tabindex="-1" style="pointer-events: none;">
      <ol tabindex="-1" class="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:w-fit md:max-w-[420px]"></ol>
    </div>

    <div id="portal" data-testid="glide-portal" style="position: fixed; left: 0; top: 0; z-index: 9999">
      <CommandPalette
        open={commandPaletteOpen}
        items={commandPaletteItems}
        onClose={() => { commandPaletteOpen = false; }}
      />
      <KeyboardShortcuts
        open={keyboardShortcutsOpen}
        onClose={() => { keyboardShortcutsOpen = false; }}
      />
      <FindReplace
        open={findReplaceOpen}
        onClose={() => { findReplaceOpen = false; }}
      />
    </div>
  {/if}
</div>
