<script lang="ts">
  import { onMount } from "svelte";
  import { ExternalLink } from "lucide-svelte";
  import CellFrame from "./CellFrame.svelte";
  import VirtualCellList from "./VirtualCellList.svelte";
  import EditPage from "../app/EditPage.svelte";
  import TopRightControls from "../controls/TopRightControls.svelte";
  import BottomRightControls from "../controls/BottomRightControls.svelte";
  import CommandPalette from "../controls/CommandPalette.svelte";
  import KeyboardShortcuts from "../controls/KeyboardShortcuts.svelte";
  import FindReplace from "../controls/FindReplace.svelte";
  import StatusOverlay from "../controls/StatusOverlay.svelte";
  import ErrorBanner from "../controls/ErrorBanner.svelte";
  import PackageAlert from "../controls/PackageAlert.svelte";
  import PendingAICellsBar from "../controls/PendingAICellsBar.svelte";
  import DisconnectedOverlay from "../controls/DisconnectedOverlay.svelte";
  import FeedbackDialog from "../dialogs/FeedbackDialog.svelte";
  import ShareStaticDialog from "../dialogs/ShareStaticDialog.svelte";
  import LazyPanel from "./LazyPanel.svelte";
  import { getBasePath } from "../basePath";
  import { getKioskMode, getUserConfig } from "../stores/config.svelte";
  import { setActiveSurface } from "../stores/surface.svelte";
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
  import {
    getSelectedPanel,
    setSelectedPanel,
    getIsSidebarOpen
  } from "../stores/panels.svelte";
  import { getActiveMode, getActiveModeConfig } from "../modes/modeStore.svelte";
  import { getActiveLesson } from "../stores/curriculum.svelte";
  import { onDocumentMutation, processToolCalls, type DocumentMutation } from "../ai/cellBridge.svelte";
  import { addPendingDiff, getPendingDiffCount, acceptAllDiffs, rejectAllDiffs } from "../stores/diffStore.svelte";
  import { sendErrorFix, sendMessageStreaming } from "../ai/aiStore.svelte";
  import {
    getEngine,
    getEngineName,
    getEngineStatus,
    setEngineStatus,
    getEngineError,
    setEngineError,
    getVariables as getEngineVariables,
    setVariables as setEngineVariables,
    createEngine,
    destroyEngine,
    interruptEngine
  } from "../stores/engineStore.svelte";
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
  let duplicateDefinitions = $state(new Map<string, string[]>());

  let engine = $derived(getEngine());
  let engineName = $derived(getEngineName());
  let engineStatus = $derived(getEngineStatus());
  let engineError = $derived(getEngineError());
  let variables = $derived(getEngineVariables());
  let loading = $state(true);
  let pageError = $state("");
  let saveState = $state("idle");
  let dirty = $state(false);
  let helpContextPanel = $state("editor");
  let commandPaletteOpen = $state(false);
  let keyboardShortcutsOpen = $state(false);
  let findReplaceOpen = $state(false);
  let feedbackDialogOpen = $state(false);
  let shareStaticDialogOpen = $state(false);
  let pendingAICells: string[] = $state([]);
  let pendingAIIndex: number | null = $state(null);

  const codaroVersion = "0.1.0";
  const staticBase = `${getBasePath()}/assets`;
  const loadAutomationMode = () => import("../modes/AutomationMode.svelte");

  let modeConfig = $derived(getActiveModeConfig());
  let activeMode = $derived(getActiveMode());

  const chromePanels = [
    { key: "files", label: "Files" },
    { key: "variables", label: "Variables" },
    { key: "dependencies", label: "Dependencies" },
    { key: "packages", label: "Packages" },
    { key: "outline", label: "Outline" },
    { key: "documentation", label: "Context Help" },
    { key: "snippets", label: "Snippets" },
    { key: "ai", label: "AI" },
    { key: "curriculum", label: "Curriculum" }
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
    if (isModKey && event.shiftKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      keyboardShortcutsOpen = !keyboardShortcutsOpen;
      return;
    }
    if (isModKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      const current = getIsSidebarOpen();
      if (current) {
        setSelectedPanel("");
      } else {
        setSelectedPanel("files");
      }
      return;
    }
    if (isModKey && event.key.toLowerCase() === "i") {
      event.preventDefault();
      void interruptExecution();
      return;
    }
    if (isModKey && event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      void runAll();
      return;
    }
    if (event.key === "F1") {
      event.preventDefault();
      setSelectedPanel("documentation");
      return;
    }
    if (isModKey && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      setActiveSurface("chat");
      return;
    }
  }

  async function initEngine(): Promise<void> {
    await createEngine();
  }

  async function initialize(): Promise<void> {
    loading = true;
    pageError = "";

    try {
      bootstrap = await getBootstrap();
      currentPath = initialPath || bootstrap.documentPath || "";
      await initEngine();
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
        await initEngine();
      }
      const payload = await loadDocumentAtPath(path);
      documentState = payload.document;
      currentPath = payload.path;
      activeBlockId = payload.document.blocks[0]?.id || "";
      dirty = !payload.exists;
      saveState = dirty ? "dirty" : "idle";
      refreshWarnings();
      setEngineVariables(engine ? await engine.getVariables().catch(() => []) : []);
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
      void initEngine();
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

  function addBlock(type: "code" | "markdown", anchorBlockId?: string, direction: "before" | "after" = "after"): void {
    if (!documentState) {
      startNewDocument();
      return;
    }
    const nextDocument = insertBlock(documentState, type, anchorBlockId || activeBlockId || null, direction);
    activeBlockId = nextDocument.blocks.find((block) => !documentState?.blocks.some((entry) => entry.id === block.id))?.id || activeBlockId;
    markDirty(nextDocument);
  }

  function addBlockAbove(anchorBlockId?: string): void {
    addBlock("code", anchorBlockId, "before");
  }

  async function runBlockAndNewBelow(blockId: string): Promise<void> {
    await runBlock(blockId);
    addBlock("code", blockId, "after");
  }

  async function interruptExecution(): Promise<void> {
    await interruptEngine();
  }

  function sendBlockToTop(blockId: string): void {
    if (!documentState) {
      return;
    }
    const idx = documentState.blocks.findIndex((b) => b.id === blockId);
    if (idx <= 0) {
      return;
    }
    for (let i = 0; i < idx; i++) {
      moveBlock(blockId, -1);
    }
  }

  function sendBlockToBottom(blockId: string): void {
    if (!documentState) {
      return;
    }
    const idx = documentState.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0 || idx >= documentState.blocks.length - 1) {
      return;
    }
    for (let i = idx; i < documentState.blocks.length - 1; i++) {
      moveBlock(blockId, 1);
    }
  }

  function clearBlockOutput(blockId: string): void {
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
            lastOutput: null,
            status: "idle"
          }
        };
      })
    };
  }

  function focusCellUp(blockId: string): void {
    if (!documentState) {
      return;
    }
    const idx = documentState.blocks.findIndex((b) => b.id === blockId);
    if (idx > 0) {
      activeBlockId = documentState.blocks[idx - 1].id;
      const el = document.querySelector(`#cell-${activeBlockId} .cm-content`);
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }
  }

  function focusCellDown(blockId: string): void {
    if (!documentState) {
      return;
    }
    const idx = documentState.blocks.findIndex((b) => b.id === blockId);
    if (idx < documentState.blocks.length - 1) {
      activeBlockId = documentState.blocks[idx + 1].id;
      const el = document.querySelector(`#cell-${activeBlockId} .cm-content`);
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }
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

    setEngineStatus("running");
    setEngineError("");
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
      setEngineVariables(lastResult?.variables || await engine.getVariables());
      setEngineStatus("ready");
    } catch (error) {
      setEngineStatus("error");
      const msg = error instanceof Error ? error.message : String(error);
      setEngineError(msg);
      applyError(blockId, msg);
    }
  }

  async function runAll(): Promise<void> {
    if (!documentState) {
      return;
    }
    await initEngine();
    if (!engine) {
      return;
    }

    setEngineStatus("running");
    setEngineError("");
    let nextDocument = documentState;

    for (const block of documentState.blocks.filter((entry) => entry.type === "code")) {
      setRunning(block.id);
      try {
        const result = await engine.execute(block.content, block.id);
        nextDocument = applyExecutionResult(nextDocument, block.id, result);
        documentState = nextDocument;
        setEngineVariables(result.variables);
        if (result.status === "error") {
          setEngineStatus("error");
          setEngineError(result.stderr || "Execution failed.");
          return;
        }
      } catch (error) {
        setEngineStatus("error");
        const msg = error instanceof Error ? error.message : String(error);
        setEngineError(msg);
        applyError(block.id, msg);
        return;
      }
    }

    setEngineStatus("ready");
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

    const format = window.prompt("Export format: percent | reactive-app | ipynb", "ipynb") || "";
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
  let queuedOrRunningCount = $derived(
    documentState?.blocks.filter((b) => b.execution.status === "running" || b.execution.status === "queued").length || 0
  );

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
    { label: "AI Panel", group: "Panels", handle: () => setSelectedPanel("ai"), keywords: ["ai", "chat"] },
    { label: "Curriculum Panel", group: "Panels", handle: () => setSelectedPanel("curriculum"), keywords: ["curriculum", "learn", "study"] }
  ]);

  const shortcutEntries = [
    { action: "cell.run", name: "Run cell", key: "Ctrl+Enter", group: "Running Cells" },
    { action: "cell.runAndNewBelow", name: "Run and create below", key: "Shift+Enter", group: "Running Cells" },
    { action: "global.runAll", name: "Run all cells", key: "Ctrl+Shift+Enter", group: "Running Cells" },
    { action: "global.interrupt", name: "Interrupt", key: "Ctrl+I", group: "Running Cells" },
    { action: "cell.createAbove", name: "Create cell above", key: "Ctrl+Shift+A", group: "Cell Actions" },
    { action: "cell.createBelow", name: "Create cell below", key: "Ctrl+Shift+B", group: "Cell Actions" },
    { action: "cell.delete", name: "Delete cell", key: "Ctrl+Shift+Delete", group: "Cell Actions" },
    { action: "cell.moveUp", name: "Move cell up", key: "Alt+Shift+ArrowUp", group: "Cell Actions" },
    { action: "cell.moveDown", name: "Move cell down", key: "Alt+Shift+ArrowDown", group: "Cell Actions" },
    { action: "cell.toggleMarkdown", name: "Toggle markdown", key: "Ctrl+Shift+M", group: "Cell Actions" },
    { action: "cell.hideCode", name: "Hide code", key: "Ctrl+Shift+H", group: "Cell Actions" },
    { action: "global.save", name: "Save", key: "Ctrl+S", group: "Navigation" },
    { action: "global.commandPalette", name: "Command palette", key: "Ctrl+K", group: "Navigation" },
    { action: "global.findReplace", name: "Find & replace", key: "Ctrl+F", group: "Navigation" },
    { action: "global.toggleSidebar", name: "Toggle sidebar", key: "Ctrl+B", group: "Navigation" },
    { action: "global.shortcuts", name: "Keyboard shortcuts", key: "Ctrl+Shift+H", group: "Navigation" },
    { action: "global.contextHelp", name: "Context help", key: "F1", group: "Navigation" },
    { action: "editor.indent", name: "Indent", key: "Tab", group: "Editing" },
    { action: "editor.dedent", name: "Dedent", key: "Shift+Tab", group: "Editing" },
    { action: "editor.undo", name: "Undo", key: "Ctrl+Z", group: "Editing" },
    { action: "editor.redo", name: "Redo", key: "Ctrl+Y", group: "Editing" },
    { action: "surface.chat", name: "Switch to Chat", key: "Ctrl+Shift+C", group: "Navigation" }
  ];

  function handleCurriculumLessonLoad(): void {
    const lesson = getActiveLesson();
    if (lesson?.document) {
      documentState = lesson.document;
      activeBlockId = lesson.document.blocks[0]?.id || "";
      dirty = false;
      saveState = "idle";
      refreshWarnings();
    }
  }

  let effectiveTheme = "dark";

  function handleMutation(mutation: DocumentMutation): void {
    if (!documentState) return;

    switch (mutation.type) {
      case "insert": {
        const blockId = mutation.blockId;
        if (blockId && !documentState.blocks.some(b => b.id === blockId)) {
          pendingAICells = [...pendingAICells, blockId];
        }
        break;
      }

      case "update": {
        const targetBlock = documentState.blocks.find(b => b.id === mutation.blockId);
        if (targetBlock && mutation.content !== undefined) {
          addPendingDiff({
            blockId: mutation.blockId,
            originalContent: targetBlock.content,
            proposedContent: mutation.content,
            toolCallId: mutation.toolCallId,
            timestamp: mutation.timestamp,
          });
          pendingAICells = [...pendingAICells, mutation.blockId];
        }
        break;
      }

      case "delete": {
        pendingAICells = [...pendingAICells, mutation.blockId];
        break;
      }

      case "execute":
        break;
    }
  }

  function handleFixWithAI(blockId: string, code: string, errorText: string): void {
    void sendErrorFix(blockId, code, errorText);
  }

  const smartActionPrompts: Record<string, string> = {
    "explain": 'Explain what this code does in a clear, concise markdown block. Use insert-block with blockType "markdown" to add the explanation right after the code block.',
    "document": 'Add a docstring and type hints to this code. Use update-block to replace the code with the documented version.',
    "optimize": 'Optimize this code for performance and readability. Use update-block to apply the improved version. Explain what you changed.',
    "add-tests": 'Generate unit tests for this code using pytest. Use insert-block with blockType "code" to add the test code after the original block.',
  };

  function handleInsertRecipe(code: string): void {
    if (!documentState) return;
    addBlock("code");
    const newBlock = documentState.blocks[documentState.blocks.length - 1];
    if (newBlock) {
      updateBlockContent(newBlock.id, code);
    }
  }

  function handleSmartAction(blockId: string, code: string, action: string): void {
    const prompt = smartActionPrompts[action];
    if (!prompt) return;
    const message = `${prompt}\n\nBlock ID: "${blockId}"\nCode:\n\`\`\`python\n${code}\n\`\`\``;
    void sendMessageStreaming(message);
  }

  function handleAcceptDiff(blockId: string, newContent: string): void {
    updateBlockContent(blockId, newContent);
    pendingAICells = pendingAICells.filter(id => id !== blockId);
  }

  function handleAcceptAllPending(): void {
    const accepted = acceptAllDiffs();
    for (const diff of accepted) {
      updateBlockContent(diff.blockId, diff.proposedContent);
    }
    pendingAICells = [];
    pendingAIIndex = null;
  }

  function handleRejectAllPending(): void {
    rejectAllDiffs();
    pendingAICells = [];
    pendingAIIndex = null;
  }

  onMount(() => {
    void initialize();
    window.addEventListener("keydown", handleWindowKeydown);
    const unsubMutations = onDocumentMutation(handleMutation);

    return () => {
      window.removeEventListener("keydown", handleWindowKeydown);
      unsubMutations();
      destroyEngine();
    };
  });
</script>

<svelte:head>
  <link rel="icon" href={`${staticBase}/favicon.ico`} />
  <link rel="preload" href={`${staticBase}/gradient-yHQUC_QB.png`} as="image" />
  <link rel="preload" href={`${staticBase}/noise-60BoTA8O.png`} as="image" />
  <link rel="preload" href={`${staticBase}/Lora-VariableFont_wght-B2ootaw-.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${staticBase}/PTSans-Regular-CxL0S8W7.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${staticBase}/PTSans-Bold-D9fedIX3.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${staticBase}/FiraMono-Regular-BTCkDNvf.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${staticBase}/FiraMono-Medium-DU3aDxX5.ttf`} as="font" crossorigin="anonymous" />
  <link rel="preload" href={`${staticBase}/FiraMono-Bold-CLVRCuM9.ttf`} as="font" crossorigin="anonymous" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="a Codaro notebook" />
  <link rel="apple-touch-icon" href={`${staticBase}/apple-touch-icon.png`} />
  <link rel="manifest" href={`${staticBase}/manifest.json`} />

  <script data-codaro="true">
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

  <codaro-filename hidden>{documentLocation}</codaro-filename>
  <codaro-version data-version={codaroVersion} hidden></codaro-version>
  <codaro-user-config data-config={"{}"} hidden></codaro-user-config>
  <codaro-server-token data-token="" hidden></codaro-server-token>
  <title>{documentLocation}</title>
</svelte:head>

<div id="root" class="{effectiveTheme} {effectiveTheme}-theme" data-theme={effectiveTheme}>
  {#if loading}
    <div class="screenState">Loading workspace…</div>
  {:else if pageError && !documentState}
    <div class="screenState">{pageError}</div>
  {:else if documentState}
    <div class="contents" style="--codaro-code-editor-font-size: 0.875rem;">
      <EditPage
        {connectionState}
        {documentLocation}
        documentTitle={documentState.title || "untitled notebook"}
        hasPath={!!currentPath}
        {shellError}
        {engineName}
        {engineStatus}
        errorCount={issueCount}
        {warningCount}
        {issueCount}
        {queuedOrRunningCount}
        {panelTitle}
        onExport={exportDocument}
        onFeedback={() => { feedbackDialogOpen = true; }}
      >
        {#snippet helperPanelContent()}
          {#if getSelectedPanel() === "files"}
            <LazyPanel loader={() => import("../panels/FileExplorerPanel.svelte")} />
          {:else if getSelectedPanel() === "variables"}
            <LazyPanel loader={() => import("../panels/VariablesPanel.svelte")} props={{ variables: variableEntries }} />
          {:else if getSelectedPanel() === "dependencies"}
            <LazyPanel loader={() => import("../panels/DependencyGraphPanel.svelte")} />
          {:else if getSelectedPanel() === "documentation"}
            <LazyPanel loader={() => import("../panels/DocumentationPanel.svelte")} props={{ title: "Context Help", content: contextHelpEntry.summary }} />
          {:else if getSelectedPanel() === "outline"}
            <LazyPanel loader={() => import("../panels/OutlinePanel.svelte")} />
          {:else if getSelectedPanel() === "packages"}
            <LazyPanel loader={() => import("../panels/PackagesPanel.svelte")} />
          {:else if getSelectedPanel() === "snippets"}
            <LazyPanel loader={() => import("../panels/SnippetsPanel.svelte")} />
          {:else if getSelectedPanel() === "ai"}
            <LazyPanel loader={() => import("../panels/AIChatPanel.svelte")} />
          {:else if getSelectedPanel() === "curriculum"}
            <LazyPanel loader={() => import("../panels/CurriculumPanel.svelte")} props={{ onLoadLesson: handleCurriculumLessonLoad }} />
          {/if}
        {/snippet}

        {#snippet floatingControls()}
          <StatusOverlay
            {engineStatus}
            {connectionState}
            kioskMode={getKioskMode()}
            onJumpToRunning={() => {
              const runningBlock = documentState?.blocks.find((b) => b.execution.status === "running");
              if (runningBlock) {
                activeBlockId = runningBlock.id;
                document.querySelector(`#cell-${runningBlock.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />
          <TopRightControls
            {connectionState}
            onExport={exportDocument}
            onShareStatic={() => { shareStaticDialogOpen = true; }}
          />
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

        {#if activeMode === "automation"}
          <LazyPanel
            loader={loadAutomationMode}
            props={{ documentPath: currentPath, onInsertRecipe: handleInsertRecipe }}
          />
        {:else}
          <div class="px-1 sm:px-16 md:px-20 xl:px-24 pb-24 sm:pb-12">
            <div class="m-auto pr-4 min-w-[400px] pb-24 sm:pb-12" style="max-width: var(--content-width, 776px)">
              <div data-testid="cell-column">
                <VirtualCellList blockIds={documentBlocks.map((b) => b.id)}>
                  {#snippet children({ blockId })}
                    {@const block = documentBlocks.find((b) => b.id === blockId)}
                    {#if block}
                      <CellFrame
                        {block}
                        active={block.id === activeBlockId}
                        reportMode={!modeConfig.showCodeCells}
                        onSelect={() => (activeBlockId = block.id)}
                        onRun={() => void runBlock(block.id)}
                        onChange={(content) => updateBlockContent(block.id, content)}
                        onToggleType={() => void toggleBlockType(block.id)}
                        onDelete={() => void removeBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, -1)}
                        onMoveDown={() => moveBlock(block.id, 1)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onAddBelow={() => addBlock("code", block.id)}
                        onAddAbove={() => addBlockAbove(block.id)}
                        onRunAndNewBelow={() => void runBlockAndNewBelow(block.id)}
                        onRunAll={runAll}
                        onFocusUp={() => focusCellUp(block.id)}
                        onFocusDown={() => focusCellDown(block.id)}
                        onHideCode={() => {}}
                        onClearOutput={() => clearBlockOutput(block.id)}
                        onSendToTop={() => sendBlockToTop(block.id)}
                        onSendToBottom={() => sendBlockToBottom(block.id)}
                        onFixWithAI={handleFixWithAI}
                        onAcceptDiff={handleAcceptDiff}
                        onSmartAction={handleSmartAction}
                      />
                    {/if}
                  {/snippet}
                </VirtualCellList>
              </div>
            </div>
          </div>
        {/if}
      </EditPage>
    </div>

    <div role="region" aria-label="Notifications (F8)" tabindex="-1" style="pointer-events: none;">
      <ol tabindex="-1" class="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:w-fit md:max-w-[420px]"></ol>
    </div>

    {#if connectionState === "CLOSED" && engineStatus === "error"}
      <DisconnectedOverlay reason={engineError || "Connection lost"} />
    {/if}

    <PendingAICellsBar
      pendingCount={pendingAICells.length}
      currentIndex={pendingAIIndex}
      onNavigate={(dir) => {
        if (pendingAICells.length === 0) return;
        if (pendingAIIndex === null) { pendingAIIndex = 0; return; }
        pendingAIIndex = dir === "up"
          ? (pendingAIIndex - 1 + pendingAICells.length) % pendingAICells.length
          : (pendingAIIndex + 1) % pendingAICells.length;
      }}
      onAcceptAll={handleAcceptAllPending}
      onRejectAll={handleRejectAllPending}
    />

    <div id="portal" data-testid="glide-portal" style="position: fixed; left: 0; top: 0; z-index: 9999">
      <CommandPalette
        open={commandPaletteOpen}
        items={commandPaletteItems}
        onClose={() => { commandPaletteOpen = false; }}
      />
      <KeyboardShortcuts
        open={keyboardShortcutsOpen}
        shortcuts={shortcutEntries}
        onClose={() => { keyboardShortcutsOpen = false; }}
      />
      <FindReplace
        open={findReplaceOpen}
        onClose={() => { findReplaceOpen = false; }}
      />
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => { feedbackDialogOpen = false; }}
      />
      <ShareStaticDialog
        open={shareStaticDialogOpen}
        onClose={() => { shareStaticDialogOpen = false; }}
      />
    </div>
  {/if}
</div>
