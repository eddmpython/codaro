<script>
  import { onMount } from "svelte";
  import AddCellButton from "./AddCellButton.svelte";
  import Cell from "./Cell.svelte";
  import CommandPalette from "./CommandPalette.svelte";
  import EditorSidebar from "./EditorSidebar.svelte";
  import EditorToolbar from "./EditorToolbar.svelte";
  import { detectCycle, detectMultipleDefinitions } from "./dataflow.js";
  import { ServerKernel } from "./serverKernel.js";
  import { WorkerClient } from "./workerClient.js";
  import { exportDocumentAtPath, loadDocumentAtPath, saveDocumentAtPath } from "./api.js";

  export let initialPath = "";

  let engine = null;
  let engineType = "none";
  let engineStatus = "idle";
  let engineError = "";
  let currentPath = initialPath || "";
  let documentState = createDefaultDocument();
  let activeBlockId = null;
  let variableNames = [];
  let duplicateDefinitions = new Map();
  let hasCycle = false;
  let widthMode = "medium";
  let saveState = "idle";
  let activeCellIndex = 0;
  let selectedBlockIds = [];
  let draggedBlockId = null;
  let dragTargetBlockId = null;
  let dragTargetPosition = "";
  let paletteOpen = false;
  let queuedBlockIds = new Set();
  let autoSaveTimer = null;
  let isDirty = false;

  $: activeCellIndex = activeBlockId
    ? Math.max(documentState.blocks.findIndex((block) => block.id === activeBlockId), 0) + 1
    : 0;
  $: selectedCount = selectedBlockIds.length;
  $: selectedSet = new Set(selectedBlockIds);
  $: paletteCommands = [
    { id: "newCode", title: "New code cell", description: "Add a code cell after the active cell", shortcut: "B", keywords: ["add code cell create"] },
    { id: "newMarkdown", title: "New markdown cell", description: "Add a markdown cell after the active cell", keywords: ["add markdown text"] },
    { id: "runActive", title: "Run active cell", description: "Execute the currently active cell", shortcut: "Ctrl+Enter", keywords: ["run execute cell"] },
    { id: "runAll", title: "Run all cells", description: "Execute every code cell", shortcut: "Ctrl+Shift+Enter", keywords: ["run all execute notebook"] },
    { id: "duplicateSelection", title: "Duplicate selected cells", description: "Duplicate the current selection", keywords: ["duplicate copy selection"] },
    { id: "deleteSelection", title: "Delete selected cells", description: "Remove the current selection", keywords: ["delete remove selection"] },
    { id: "selectAll", title: "Select all cells", description: "Multi-select every cell in the notebook", keywords: ["select all multi"] },
    { id: "convertToCode", title: "Convert selection to code", description: "Convert selected cells to code", keywords: ["convert code"] },
    { id: "convertToMarkdown", title: "Convert selection to markdown", description: "Convert selected cells to markdown", keywords: ["convert markdown"] },
    { id: "widthCompact", title: "Set compact width", description: "Switch notebook width to compact", keywords: ["width compact layout"] },
    { id: "widthMedium", title: "Set medium width", description: "Switch notebook width to medium", keywords: ["width medium layout"] },
    { id: "widthFull", title: "Set full width", description: "Switch notebook width to full", keywords: ["width full layout"] },
    { id: "togglePalette", title: "Close command palette", description: "Hide the command palette", keywords: ["palette close"] }
  ];

  function createDefaultDocument() {
    return {
      id: `doc-${crypto.randomUUID().slice(0, 8)}`,
      title: "Untitled",
      blocks: [
        createBlock("markdown", "# Codaro\n\n새 문서를 시작하세요."),
        createBlock("code", "message = 'hello codaro'\nprint(message)")
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceFormat: "codaro",
        tags: []
      },
      runtime: {
        defaultEngine: "pyodide",
        reactiveMode: "hybrid",
        packages: []
      },
      app: {
        title: "Untitled",
        layout: "notebook",
        hideCode: true,
        entryBlockIds: []
      }
    };
  }

  function createBlock(type, content = "") {
    return {
      id: `block-${crypto.randomUUID().slice(0, 8)}`,
      type,
      content,
      executionTime: null,
      collapsed: false,
      execution: {
        executionCount: 0,
        status: "idle",
        lastRunAt: null,
        lastOutput: null
      }
    };
  }

  async function bootEngine() {
    engineStatus = "loading";
    engineError = "";
    try {
      engine = new ServerKernel();
      await engine.initialize();
      engineType = "server";
      engineStatus = "ready";
    } catch {
      try {
        engine = new WorkerClient();
        await engine.initialize();
        engineType = "pyodide";
        engineStatus = "ready";
      } catch (fallbackError) {
        engineStatus = "error";
        engineError = String(fallbackError);
      }
    }
  }

  async function loadPath(path) {
    currentPath = path;
    const payload = await loadDocumentAtPath(path);
    documentState = payload.document;
    activeBlockId = documentState.blocks[0]?.id || null;
    selectedBlockIds = activeBlockId ? [activeBlockId] : [];
    refreshWarnings();
  }

  async function saveDocument() {
    let targetPath = currentPath;
    if (!targetPath) {
      targetPath = window.prompt(
        "저장할 파일 경로를 입력하세요",
        "C:/Users/MSI/OneDrive/Desktop/sideProject/codaro/examples/untitled.py"
      ) || "";
    }
    if (!targetPath) return;

    saveState = "saving";
    documentState = {
      ...documentState,
      app: { ...documentState.app, title: documentState.title },
      metadata: { ...documentState.metadata, updatedAt: new Date().toISOString() }
    };

    try {
      await saveDocumentAtPath(targetPath, documentState);
      currentPath = targetPath;
      saveState = "saved";
      setTimeout(() => {
        if (saveState === "saved") saveState = "idle";
      }, 1500);
    } catch (error) {
      saveState = "idle";
      window.alert(String(error));
    }
  }

  async function exportDocument(format) {
    if (!currentPath) {
      await saveDocument();
    }
    if (!currentPath) return;

    const suggested = format === "ipynb"
      ? currentPath.replace(/\.\w+$/, ".ipynb")
      : currentPath.replace(/\.\w+$/, format === "marimo" ? ".marimo.py" : ".py");
    const outputPath = window.prompt(`내보낼 ${format} 파일 경로`, suggested) || "";
    if (!outputPath) return;

    try {
      await exportDocumentAtPath(currentPath, format, outputPath);
    } catch (error) {
      window.alert(String(error));
    }
  }

  function refreshWarnings() {
    duplicateDefinitions = detectMultipleDefinitions(documentState.blocks);
    hasCycle = detectCycle(documentState.blocks);
  }

  function updateBlockContent(blockId, content) {
    documentState = {
      ...documentState,
      blocks: documentState.blocks.map((block) => (
        block.id === blockId ? { ...block, content } : block
      ))
    };
    refreshWarnings();
    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    isDirty = true;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      if (isDirty && currentPath) {
        isDirty = false;
        saveDocument();
      }
    }, 2000);
  }

  function updateTitle(title) {
    documentState = {
      ...documentState,
      title,
      app: { ...documentState.app, title }
    };
  }

  function addBlock(type, anchorId = null, direction = "after") {
    const nextBlock = createBlock(type, type === "markdown" ? "## 새 블록" : "");
    const blocks = [...documentState.blocks];
    if (!anchorId) {
      blocks.push(nextBlock);
    } else {
      const index = blocks.findIndex((block) => block.id === anchorId);
      const insertionIndex = direction === "before" ? index : index + 1;
      blocks.splice(Math.max(insertionIndex, 0), 0, nextBlock);
    }
    documentState = { ...documentState, blocks };
    activeBlockId = nextBlock.id;
    selectedBlockIds = [nextBlock.id];
    refreshWarnings();
  }

  function duplicateBlock(blockId) {
    const block = documentState.blocks.find((value) => value.id === blockId);
    if (!block) return null;
    const duplicate = {
      ...block,
      id: `block-${crypto.randomUUID().slice(0, 8)}`,
      executionTime: null,
      execution: { executionCount: 0, status: "idle", lastRunAt: null, lastOutput: null }
    };
    const blocks = [...documentState.blocks];
    const index = blocks.findIndex((value) => value.id === blockId);
    blocks.splice(index + 1, 0, duplicate);
    documentState = { ...documentState, blocks };
    activeBlockId = duplicate.id;
    selectedBlockIds = [duplicate.id];
    refreshWarnings();
    return duplicate.id;
  }

  function deleteBlock(blockId) {
    const nextBlocks = documentState.blocks.filter((block) => block.id !== blockId);
    documentState = { ...documentState, blocks: nextBlocks };
    if (activeBlockId === blockId) {
      activeBlockId = nextBlocks[0]?.id || null;
    }
    selectedBlockIds = selectedBlockIds.filter((value) => value !== blockId);
    refreshWarnings();
  }

  function moveBlock(blockId, offset) {
    const blocks = [...documentState.blocks];
    const index = blocks.findIndex((block) => block.id === blockId);
    const nextIndex = index + offset;
    if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) return;
    const [block] = blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, block);
    documentState = { ...documentState, blocks };
    refreshWarnings();
  }

  function changeBlockType(blockId, nextType) {
    documentState = {
      ...documentState,
      blocks: documentState.blocks.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          type: nextType,
          content: nextType === "markdown" && !block.content ? "## New markdown" : block.content
        };
      })
    };
    refreshWarnings();
  }

  function toggleSelectedBlock(blockId) {
    if (selectedSet.has(blockId)) {
      selectedBlockIds = selectedBlockIds.filter((value) => value !== blockId);
      if (activeBlockId === blockId) {
        activeBlockId = selectedBlockIds[0] || documentState.blocks.find((block) => block.id !== blockId)?.id || null;
      }
      return;
    }
    selectedBlockIds = [...selectedBlockIds, blockId];
    activeBlockId = blockId;
  }

  function selectRangeTo(blockId) {
    if (!activeBlockId) {
      selectedBlockIds = [blockId];
      activeBlockId = blockId;
      return;
    }
    const order = documentState.blocks.map((block) => block.id);
    const start = order.indexOf(activeBlockId);
    const end = order.indexOf(blockId);
    if (start < 0 || end < 0) {
      selectedBlockIds = [blockId];
      activeBlockId = blockId;
      return;
    }
    const [left, right] = start < end ? [start, end] : [end, start];
    selectedBlockIds = order.slice(left, right + 1);
  }

  function handleCellSelect(blockId, event) {
    if (event?.shiftKey) {
      selectRangeTo(blockId);
      return;
    }
    if (event?.metaKey || event?.ctrlKey) {
      toggleSelectedBlock(blockId);
      return;
    }
    activeBlockId = blockId;
    selectedBlockIds = [blockId];
  }

  function normalizeSelection() {
    if (selectedBlockIds.length > 0) return selectedBlockIds;
    if (activeBlockId) return [activeBlockId];
    return [];
  }

  function runSelectedBlocks() {
    const targets = normalizeSelection()
      .filter((blockId) => documentState.blocks.find((block) => block.id === blockId)?.type === "code");
    return (async () => {
      for (const blockId of targets) {
        await runBlock(blockId);
      }
    })();
  }

  function duplicateSelectedBlocks() {
    const targets = normalizeSelection();
    const sourceBlocks = documentState.blocks.filter((block) => targets.includes(block.id));
    const blocks = [...documentState.blocks];
    const duplicatedIds = [];

    for (const block of sourceBlocks) {
      const index = blocks.findIndex((entry) => entry.id === block.id);
      if (index < 0) continue;
      const duplicate = {
        ...block,
        id: `block-${crypto.randomUUID().slice(0, 8)}`,
        executionTime: null,
        execution: { executionCount: 0, status: "idle", lastRunAt: null, lastOutput: null }
      };
      blocks.splice(index + 1, 0, duplicate);
      duplicatedIds.push(duplicate.id);
    }

    documentState = { ...documentState, blocks };
    activeBlockId = duplicatedIds.at(-1) || activeBlockId;
    selectedBlockIds = duplicatedIds.length > 0 ? duplicatedIds : selectedBlockIds;
    refreshWarnings();
  }

  function deleteSelectedBlocks() {
    const targets = new Set(normalizeSelection());
    const nextBlocks = documentState.blocks.filter((block) => !targets.has(block.id));
    documentState = { ...documentState, blocks: nextBlocks };
    activeBlockId = nextBlocks[0]?.id || null;
    selectedBlockIds = activeBlockId ? [activeBlockId] : [];
    refreshWarnings();
  }

  function convertSelectedBlocks(nextType) {
    const targets = new Set(normalizeSelection());
    documentState = {
      ...documentState,
      blocks: documentState.blocks.map((block) => {
        if (!targets.has(block.id)) return block;
        return {
          ...block,
          type: nextType,
          content: nextType === "markdown" && !block.content ? "## New markdown" : block.content
        };
      })
    };
    refreshWarnings();
  }

  function selectAllBlocks() {
    selectedBlockIds = documentState.blocks.map((block) => block.id);
    activeBlockId = selectedBlockIds[0] || null;
  }

  function clearSelection() {
    selectedBlockIds = activeBlockId ? [activeBlockId] : [];
  }

  function moveDraggedBlock(targetBlockId, position = "after") {
    if (!draggedBlockId || draggedBlockId === targetBlockId) return;
    const blocks = [...documentState.blocks];
    const dragIndex = blocks.findIndex((block) => block.id === draggedBlockId);
    const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);
    if (dragIndex < 0 || targetIndex < 0) return;
    const [block] = blocks.splice(dragIndex, 1);
    const adjustedTargetIndex = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
    const insertionIndex = position === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
    blocks.splice(insertionIndex, 0, block);
    documentState = { ...documentState, blocks };
    activeBlockId = block.id;
    selectedBlockIds = [block.id];
    refreshWarnings();
  }

  function navigateCell(direction) {
    if (!activeBlockId) return;
    const currentIndex = documentState.blocks.findIndex((block) => block.id === activeBlockId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= documentState.blocks.length) return;
    const nextBlock = documentState.blocks[nextIndex];
    activeBlockId = nextBlock.id;
    selectedBlockIds = [nextBlock.id];
    scrollCellIntoView(nextBlock.id);
  }

  function splitCell(blockId, cursorOffset) {
    const block = documentState.blocks.find((b) => b.id === blockId);
    if (!block || block.type !== "code") return;

    const before = block.content.slice(0, cursorOffset).trimEnd();
    const after = block.content.slice(cursorOffset).trimStart();

    updateBlockContent(blockId, before);

    const newBlock = createBlock(block.type, after);
    const blocks = [...documentState.blocks];
    const index = blocks.findIndex((b) => b.id === blockId);
    blocks.splice(index + 1, 0, newBlock);
    documentState = { ...documentState, blocks };
    activeBlockId = newBlock.id;
    selectedBlockIds = [newBlock.id];
    refreshWarnings();
  }

  function mergeWithBelow(blockId) {
    const blocks = [...documentState.blocks];
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index < 0 || index >= blocks.length - 1) return;

    const current = blocks[index];
    const below = blocks[index + 1];
    if (current.type !== below.type) return;

    const merged = (current.content || "") + "\n" + (below.content || "");
    blocks[index] = { ...current, content: merged };
    blocks.splice(index + 1, 1);
    documentState = { ...documentState, blocks };
    refreshWarnings();
  }

  function scrollCellIntoView(blockId) {
    requestAnimationFrame(() => {
      const cellEl = document.querySelector(`[data-cell-id="${blockId}"]`);
      cellEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function executePaletteCommand(commandId) {
    if (commandId === "togglePalette") {
      paletteOpen = false;
      return;
    }
    if (commandId === "newCode") {
      addBlock("code", activeBlockId, "after");
    } else if (commandId === "newMarkdown") {
      addBlock("markdown", activeBlockId, "after");
    } else if (commandId === "runActive" && activeBlockId) {
      runBlock(activeBlockId);
    } else if (commandId === "runAll") {
      runAll();
    } else if (commandId === "duplicateSelection") {
      duplicateSelectedBlocks();
    } else if (commandId === "deleteSelection") {
      deleteSelectedBlocks();
    } else if (commandId === "selectAll") {
      selectAllBlocks();
    } else if (commandId === "convertToCode") {
      convertSelectedBlocks("code");
    } else if (commandId === "convertToMarkdown") {
      convertSelectedBlocks("markdown");
    } else if (commandId === "widthCompact") {
      widthMode = "compact";
    } else if (commandId === "widthMedium") {
      widthMode = "medium";
    } else if (commandId === "widthFull") {
      widthMode = "full";
    }
    paletteOpen = false;
  }

  async function runBlock(blockId) {
    if (!engine || engineStatus !== "ready") return;
    const block = documentState.blocks.find((value) => value.id === blockId);
    if (!block || block.type !== "code") return;

    refreshWarnings();
    if (duplicateDefinitions.has(blockId) || hasCycle) {
      updateExecution(blockId, {
        status: "error",
        lastOutput: duplicateDefinitions.has(blockId)
          ? `중복 정의가 감지되었습니다: ${duplicateDefinitions.get(blockId).join(", ")}`
          : "순환 참조가 감지되었습니다."
      });
      return;
    }

    if (engineType === "server" && engine.executeReactive) {
      await runBlockReactive(blockId);
      return;
    }

    engineStatus = "running";
    engineError = "";
    updateExecution(blockId, { status: "running" });
    const startedAt = performance.now();
    try {
      const result = await engine.executeBlock(block.content);
      variableNames = result.variables || [];
      updateExecution(blockId, {
        status: result.type === "error" ? "error" : "done",
        lastRunAt: new Date().toISOString(),
        executionCount: (block.execution?.executionCount || 0) + 1,
        lastOutput: composeOutput(result)
      });
      documentState = {
        ...documentState,
        blocks: documentState.blocks.map((entry) => (
          entry.id === blockId ? { ...entry, executionTime: performance.now() - startedAt } : entry
        ))
      };
      engineStatus = "ready";
    } catch (error) {
      engineStatus = "error";
      engineError = String(error);
      updateExecution(blockId, {
        status: "error",
        lastRunAt: new Date().toISOString(),
        executionCount: (block.execution?.executionCount || 0) + 1,
        lastOutput: String(error)
      });
    }
  }

  async function runBlockReactive(blockId) {
    const codeBlocks = documentState.blocks
      .filter((b) => b.type === "code")
      .map((b) => ({ id: b.id, type: b.type, content: b.content }));

    engineStatus = "running";
    engineError = "";
    updateExecution(blockId, { status: "running" });

    try {
      const { results, executionOrder } = await engine.executeReactive(blockId, codeBlocks);

      const queued = new Set(executionOrder);
      queued.delete(blockId);
      queuedBlockIds = queued;

      for (const result of results) {
        const bid = result.blockId;
        if (!bid) continue;
        queuedBlockIds.delete(bid);
        queuedBlockIds = queuedBlockIds;
        variableNames = result.variables || [];
        updateExecution(bid, {
          status: result.status === "error" ? "error" : "done",
          lastRunAt: new Date().toISOString(),
          lastOutput: composeOutput(result),
        });
      }

      queuedBlockIds = new Set();
      engineStatus = "ready";
    } catch (error) {
      queuedBlockIds = new Set();
      engineStatus = "error";
      engineError = String(error);
    }
  }

  function composeOutput(result) {
    const stdout = result.stdout || "";
    const stderr = result.stderr || "";
    const primary = result.data || "";
    if (result.type === "html") {
      return `__HTML__${stdout}${primary}`;
    }
    return `${stdout}${primary}${stderr}`.trim();
  }

  function updateExecution(blockId, patch) {
    documentState = {
      ...documentState,
      blocks: documentState.blocks.map((block) => (
        block.id === blockId
          ? {
              ...block,
              execution: {
                executionCount: block.execution?.executionCount || 0,
                status: block.execution?.status || "idle",
                lastRunAt: block.execution?.lastRunAt || null,
                lastOutput: block.execution?.lastOutput || null,
                ...block.execution,
                ...patch
              }
            }
          : block
      ))
    };
  }

  async function runAll() {
    for (const block of documentState.blocks.filter((value) => value.type === "code")) {
      await runBlock(block.id);
    }
  }

  function launchApp() {
    const path = currentPath || window.prompt("앱 모드로 열 파일 경로를 입력하세요", currentPath || "");
    if (!path) return;
    const url = new URL("/app", window.location.origin);
    url.searchParams.set("path", path);
    window.open(url.toString(), "_blank", "noopener");
  }

  function openExisting() {
    const path = window.prompt("열 파일 경로를 입력하세요", currentPath || "");
    if (!path) return;
    loadPath(path);
  }

  async function changePath(nextPath) {
    if (!nextPath) return;
    if (currentPath && nextPath === currentPath) return;
    currentPath = nextPath;
  }

  function toggleHideCode() {
    documentState = {
      ...documentState,
      app: {
        ...documentState.app,
        hideCode: !documentState.app.hideCode
      }
    };
  }

  function handleGlobalKeydown(event) {
    const target = event.target;
    const isEditableTarget = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target?.closest?.(".cm-editor");

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveDocument();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      paletteOpen = !paletteOpen;
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "=") {
      event.preventDefault();
      if (activeBlockId) mergeWithBelow(activeBlockId);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      runAll();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (selectedBlockIds.length > 1) {
        runSelectedBlocks();
        return;
      }
      if (activeBlockId) {
        runBlock(activeBlockId);
      }
      return;
    }

    if (isEditableTarget) return;

    if (event.key === "Escape") {
      clearSelection();
      paletteOpen = false;
      return;
    }

    if (event.key.toLowerCase() === "j") {
      event.preventDefault();
      navigateCell(1);
      return;
    }

    if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      navigateCell(-1);
      return;
    }

    if (event.key.toLowerCase() === "a" && activeBlockId) {
      event.preventDefault();
      addBlock("code", activeBlockId, "before");
      return;
    }

    if (event.key.toLowerCase() === "b" && activeBlockId) {
      event.preventDefault();
      addBlock("code", activeBlockId, "after");
      return;
    }
  }

  onMount(async () => {
    await bootEngine();
    if (initialPath) {
      await loadPath(initialPath);
    } else {
      refreshWarnings();
      activeBlockId = documentState.blocks[0]?.id || null;
      selectedBlockIds = activeBlockId ? [activeBlockId] : [];
    }

    document.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeydown);
      engine?.destroy();
    };
  });
</script>

<div class="notebookEditor">
  <EditorSidebar
    {documentState}
    {activeBlockId}
    {variableNames}
    {engineStatus}
    {engineError}
    {hasCycle}
    {duplicateDefinitions}
    onSelectBlock={(blockId) => {
      activeBlockId = blockId;
      selectedBlockIds = [blockId];
      scrollCellIntoView(blockId);
    }}
    onToggleHideCode={toggleHideCode}
  />

  <EditorToolbar
    {currentPath}
    {engineStatus}
    {widthMode}
    {saveState}
    onRunAll={runAll}
    onSave={saveDocument}
    onOpenExisting={openExisting}
    onLaunchApp={launchApp}
    onSetWidthMode={(mode) => (widthMode = mode)}
    onExportDocument={exportDocument}
    onRequestPathChange={changePath}
    onOpenPalette={() => (paletteOpen = true)}
  />

  <CommandPalette
    open={paletteOpen}
    commands={paletteCommands}
    onClose={() => (paletteOpen = false)}
    onExecute={executePaletteCommand}
  />

  <main class={`notebookContent width-${widthMode}`}>
    <section class="notebookHeader">
      <div class="headerMain">
        <div class="pill">Codaro</div>
        <input
          class="titleInput"
          bind:value={documentState.title}
          oninput={(event) => updateTitle(event.currentTarget.value)}
          placeholder="Untitled"
        />
      </div>
      <div class="headerMeta">
        <span>{documentState.blocks.length} cells</span>
        <span>{engineType === "server" ? "server" : engineType === "pyodide" ? "pyodide" : documentState.runtime.defaultEngine}</span>
        {#if variableNames.length > 0}
          <span>{variableNames.length} vars</span>
        {/if}
      </div>
    </section>

    {#if hasCycle}
      <div class="warningBanner">
        순환 참조가 감지되었습니다. 블록 의존 관계를 정리한 뒤 다시 실행하세요.
      </div>
    {/if}

    {#if selectedCount > 1}
      <section class="selectionBar">
        <div class="selectionInfo">{selectedCount} cells selected</div>
        <div class="selectionActions">
          <button class="selectionButton" onclick={runSelectedBlocks}>Run selected</button>
          <button class="selectionButton" onclick={duplicateSelectedBlocks}>Duplicate</button>
          <button class="selectionButton" onclick={() => convertSelectedBlocks("code")}>To code</button>
          <button class="selectionButton" onclick={() => convertSelectedBlocks("markdown")}>To markdown</button>
          <button class="selectionButton danger" onclick={deleteSelectedBlocks}>Delete</button>
        </div>
      </section>
    {/if}

    {#if documentState.blocks.length === 0}
      <section class="emptyState">
        <div class="emptyIcon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
            <line x1="14" y1="16" x2="34" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
            <line x1="14" y1="22" x2="28" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
            <line x1="14" y1="28" x2="31" y2="28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
            <circle cx="36" cy="36" r="10" fill="var(--nb-accent-soft)" stroke="var(--nb-accent)" stroke-width="1.5"/>
            <line x1="33" y1="36" x2="39" y2="36" stroke="var(--nb-accent)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="36" y1="33" x2="36" y2="39" stroke="var(--nb-accent)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="emptyTitle">Start building</p>
        <p class="emptySub">Add your first cell to begin</p>
        <div class="emptyActions">
          <button class="emptyButton" onclick={() => addBlock("code")}>+ Code</button>
          <button class="emptyButton" onclick={() => addBlock("markdown")}>+ Markdown</button>
        </div>
      </section>
    {/if}

    {#each documentState.blocks as block, index (block.id)}
      <AddCellButton onAdd={(type) => addBlock(type, block.id, "before")} />
      <Cell
        cell={block}
        cellIndex={index + 1}
        isActive={block.id === activeBlockId}
        isRunning={block.execution?.status === "running"}
        isQueued={queuedBlockIds.has(block.id)}
        isSelected={selectedSet.has(block.id)}
        isDragSource={draggedBlockId === block.id}
        dragTargetPosition={dragTargetBlockId === block.id ? dragTargetPosition : ""}
        multiDefVars={duplicateDefinitions.get(block.id) || []}
        onSelect={(event) => handleCellSelect(block.id, event)}
        onRun={() => runBlock(block.id)}
        onRunAndMove={() => runBlock(block.id)}
        onUpdateContent={(content) => updateBlockContent(block.id, content)}
        onRemove={() => deleteBlock(block.id)}
        onMove={(direction) => moveBlock(block.id, direction === "up" ? -1 : 1)}
        onChangeType={(nextType) => changeBlockType(block.id, nextType)}
        onAddAbove={() => addBlock("code", block.id, "before")}
        onAddBelow={() => addBlock("code", block.id, "after")}
        onDuplicate={() => duplicateBlock(block.id)}
        onSplit={(cursorOffset) => splitCell(block.id, cursorOffset)}
        onMerge={() => mergeWithBelow(block.id)}
        onToggleSelect={() => toggleSelectedBlock(block.id)}
        onDragStart={(event) => {
          draggedBlockId = block.id;
          dragTargetBlockId = null;
          dragTargetPosition = "";
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", block.id);
        }}
        onDragEnd={() => {
          draggedBlockId = null;
          dragTargetBlockId = null;
          dragTargetPosition = "";
        }}
        onDragOver={(event) => {
          dragTargetBlockId = block.id;
          const bounds = event.currentTarget.getBoundingClientRect();
          dragTargetPosition = event.clientY < bounds.top + (bounds.height / 2) ? "before" : "after";
        }}
        onDrop={() => {
          moveDraggedBlock(block.id, dragTargetPosition || "after");
          draggedBlockId = null;
          dragTargetBlockId = null;
          dragTargetPosition = "";
        }}
      />
    {/each}

    {#if documentState.blocks.length > 0}
      <AddCellButton compact={true} onAdd={(type) => addBlock(type)} />
    {/if}
  </main>
</div>

<style>
  .notebookEditor {
    min-height: 100vh;
    background: var(--nb-bg);
    color: var(--nb-text);
  }

  .notebookContent {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 72px 24px 120px;
    padding-left: 64px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: max-width var(--nb-transition);
  }

  .notebookContent.width-compact {
    max-width: 640px;
  }

  .notebookContent.width-medium {
    max-width: 800px;
  }

  .notebookContent.width-full {
    max-width: 1200px;
  }

  .notebookHeader {
    display: grid;
    gap: 8px;
    padding: 8px 0 12px;
    margin-left: 36px;
  }

  .headerMain {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .headerMeta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    color: var(--nb-text-muted);
    font-size: 12px;
  }

  .headerMeta span {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: var(--nb-radius-pill);
    border: 1px solid var(--nb-border);
    background: var(--nb-card);
    font-family: var(--nb-font-code);
    font-size: 11px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: var(--nb-radius-pill);
    background: var(--nb-accent-soft);
    color: var(--nb-accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .titleInput {
    width: min(560px, 100%);
    border: 0;
    background: transparent;
    color: var(--nb-text);
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    outline: none;
    padding: 0;
  }

  .titleInput::placeholder {
    color: var(--nb-text-muted);
  }

  .warningBanner {
    padding: 12px 16px;
    border-radius: var(--nb-radius-lg);
    border: 1px solid rgba(220, 38, 38, 0.2);
    background: var(--nb-error-soft);
    color: var(--nb-error);
    font-size: 13px;
    margin-left: 36px;
  }

  .selectionBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border: 1px solid var(--nb-accent);
    border-radius: var(--nb-radius-lg);
    background: var(--nb-accent-soft);
    margin-left: 36px;
  }

  .selectionInfo {
    color: var(--nb-accent);
    font-size: 13px;
    font-weight: 600;
  }

  .selectionActions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .selectionButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    color: var(--nb-text-secondary);
    cursor: pointer;
    font-size: 12px;
    transition: all var(--nb-transition-fast);
  }

  .selectionButton:hover {
    border-color: var(--nb-accent);
    color: var(--nb-accent);
  }

  .selectionButton.danger:hover {
    border-color: var(--nb-error);
    color: var(--nb-error);
  }

  .emptyState {
    text-align: center;
    padding: 100px 20px;
    color: var(--nb-text-muted);
    margin-left: 36px;
  }

  .emptyIcon {
    margin-bottom: 20px;
    color: var(--nb-text-muted);
  }

  .emptyTitle {
    font-size: 20px;
    font-weight: 700;
    color: var(--nb-text);
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }

  .emptySub {
    margin: 0 0 24px;
    font-size: 14px;
    color: var(--nb-text-muted);
  }

  .emptyActions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .emptyButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    color: var(--nb-text-secondary);
    cursor: pointer;
    font-size: 13px;
    transition: all var(--nb-transition-fast);
  }

  .emptyButton:hover {
    border-color: var(--nb-accent);
    color: var(--nb-accent);
    background: var(--nb-accent-soft);
  }

  @media (max-width: 768px) {
    .notebookContent {
      padding: 64px 12px 88px 12px;
    }

    .notebookHeader {
      margin-left: 28px;
    }

    .warningBanner,
    .selectionBar,
    .emptyState {
      margin-left: 28px;
    }
  }
</style>
