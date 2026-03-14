<script>
  import {
    AlignCenter,
    AlignJustify,
    Command,
    Maximize,
    Moon,
    Play,
    Save,
    Sun,
    FolderOpen,
    Download,
    Rocket,
    FileCode2,
    FileJson2,
    SquarePen,
    Check
  } from "lucide-svelte";
  import { onMount, tick } from "svelte";

  export let currentPath = "";
  export let engineStatus = "idle";
  export let widthMode = "medium";
  export let saveState = "idle";
  export let onRunAll = () => {};
  export let onSave = () => {};
  export let onOpenExisting = () => {};
  export let onLaunchApp = () => {};
  export let onSetWidthMode = () => {};
  export let onExportDocument = () => {};
  export let onRequestPathChange = () => {};
  export let onOpenPalette = () => {};

  let showMenu = false;
  let isDark = false;
  let pathEditing = false;
  let pathDraft = "";

  onMount(() => {
    const storedTheme = localStorage.getItem("theme");
    isDark = storedTheme ? storedTheme === "dark" : false;
    applyTheme();
  });

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme();
  }

  async function startPathEdit() {
    pathDraft = currentPath;
    pathEditing = true;
    await tick();
    const input = document.querySelector(".filepathInput");
    input?.focus();
    input?.select();
  }

  async function commitPath() {
    pathEditing = false;
    if (pathDraft.trim() && pathDraft.trim() !== currentPath) {
      await onRequestPathChange(pathDraft.trim());
    }
  }

  function handlePathKeydown(event) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      return;
    }
    if (event.key === "Escape") {
      pathEditing = false;
      pathDraft = currentPath;
    }
  }

  function handleMenuOutclick(event) {
    if (showMenu && !event.target.closest(".dropdownMenu") && !event.target.closest(".menuTrigger")) {
      showMenu = false;
    }
  }
</script>

<svelte:window on:click={handleMenuOutclick} />

<div class="filenameBar">
  {#if pathEditing}
    <input
      class="filepathInput"
      bind:value={pathDraft}
      onblur={commitPath}
      onkeydown={handlePathKeydown}
    />
  {:else}
    <button class="filepathDisplay" onclick={startPathEdit} title="Edit document path">
      {currentPath || "Untitled document"}
      <SquarePen size={11} />
    </button>
  {/if}
</div>

<div class="floatingControls topRight">
  {#if engineStatus === "loading" || engineStatus === "running" || engineStatus === "error"}
    <div class={`statusBadge ${engineStatus}`}>
      <span class="statusDot"></span>
      {engineStatus === "loading" ? "Loading" : engineStatus === "running" ? "Running" : "Error"}
    </div>
  {/if}
  <button class="floatButton menuTrigger" onclick={() => (showMenu = !showMenu)} title="Menu" aria-label="Menu">
    <FileJson2 size={15} />
  </button>
  <button class="floatButton" onclick={onOpenPalette} title="Command palette (Ctrl+K)" aria-label="Command palette">
    <Command size={15} />
  </button>
  <button class="floatButton" onclick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
    {#if isDark}
      <Sun size={15} />
    {:else}
      <Moon size={15} />
    {/if}
  </button>

  {#if showMenu}
    <div class="dropdownMenu">
      <button class="dropdownItem" onclick={() => { showMenu = false; onOpenExisting(); }}>
        <FolderOpen size={14} />
        Open
      </button>
      <button class="dropdownItem" onclick={() => { showMenu = false; onSave(); }}>
        <Save size={14} />
        Save
      </button>
      <div class="dropdownDivider"></div>
      <button class="dropdownItem" onclick={() => { showMenu = false; onExportDocument("codaro"); }}>
        <FileCode2 size={14} />
        Export Codaro
      </button>
      <button class="dropdownItem" onclick={() => { showMenu = false; onExportDocument("marimo"); }}>
        <Download size={14} />
        Export marimo
      </button>
      <button class="dropdownItem" onclick={() => { showMenu = false; onExportDocument("ipynb"); }}>
        <Download size={14} />
        Export ipynb
      </button>
    </div>
  {/if}
</div>

<div class="floatingControls bottomLeft">
  <div class="widthToggle">
    <button
      class="widthButton"
      class:active={widthMode === "compact"}
      onclick={() => onSetWidthMode("compact")}
      title="Compact width"
      aria-label="Compact width"
    >
      <AlignCenter size={13} />
    </button>
    <button
      class="widthButton"
      class:active={widthMode === "medium"}
      onclick={() => onSetWidthMode("medium")}
      title="Medium width"
      aria-label="Medium width"
    >
      <AlignJustify size={13} />
    </button>
    <button
      class="widthButton"
      class:active={widthMode === "full"}
      onclick={() => onSetWidthMode("full")}
      title="Full width"
      aria-label="Full width"
    >
      <Maximize size={13} />
    </button>
  </div>
</div>

<div class="floatingControls bottomRight">
  <button class="floatButton" onclick={onRunAll} title="Run all (Ctrl+Shift+Enter)" aria-label="Run all">
    <Play size={15} />
  </button>
  <button
    class="floatButton"
    class:saved={saveState === "saved"}
    class:saving={saveState === "saving"}
    onclick={onSave}
    title="Save (Ctrl+S)"
    aria-label="Save"
  >
    {#if saveState === "saved"}
      <Check size={15} />
    {:else}
      <Save size={15} />
    {/if}
  </button>
  <button class="floatButton accent" onclick={onLaunchApp} title="Launch app" aria-label="Launch app">
    <Rocket size={15} />
  </button>
</div>

<style>
  .filenameBar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    padding: 14px 16px;
  }

  .filepathDisplay {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: min(70vw, 620px);
    border: 0;
    border-radius: var(--nb-radius-pill);
    background: transparent;
    color: var(--nb-text-muted);
    padding: 6px 12px;
    font-family: var(--nb-font-code);
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all var(--nb-transition-fast);
  }

  .filepathDisplay:hover {
    background: var(--nb-glass);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--nb-text);
  }

  .filepathInput {
    width: min(72vw, 680px);
    border: 1px solid var(--nb-accent);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    color: var(--nb-text);
    padding: 7px 14px;
    font-family: var(--nb-font-code);
    font-size: 12px;
    outline: none;
    box-shadow: 0 0 0 3px var(--nb-accent-soft);
  }

  .floatingControls {
    position: fixed;
    z-index: 30;
    display: flex;
    gap: 6px;
  }

  .topRight {
    top: 10px;
    right: 14px;
    align-items: center;
  }

  .bottomLeft {
    bottom: 14px;
    left: 14px;
  }

  .bottomRight {
    bottom: 14px;
    right: 14px;
  }

  .floatButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--nb-glass-border);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--nb-text-muted);
    cursor: pointer;
    box-shadow: var(--nb-shadow-float);
    transition: all var(--nb-transition-fast);
  }

  .floatButton:hover {
    color: var(--nb-text);
    border-color: var(--nb-accent);
    transform: translateY(-1px);
  }

  .floatButton.accent {
    background: var(--nb-accent);
    border-color: var(--nb-accent);
    color: white;
  }

  .floatButton.accent:hover {
    background: var(--nb-pink-bright);
    border-color: var(--nb-pink-bright);
    color: white;
  }

  .floatButton.saved {
    color: var(--nb-success);
    border-color: rgba(34, 197, 94, 0.3);
  }

  .floatButton.saving {
    color: var(--nb-accent);
    animation: savePulse 1s ease-in-out infinite;
  }

  @keyframes savePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .statusBadge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border-radius: var(--nb-radius-pill);
    background: var(--nb-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--nb-glass-border);
    color: var(--nb-text-secondary);
    font-size: 11px;
    font-weight: 600;
    box-shadow: var(--nb-shadow-float);
  }

  .statusDot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nb-text-muted);
  }

  .statusBadge.running .statusDot,
  .statusBadge.loading .statusDot {
    background: var(--nb-accent);
    animation: dotPulse 1.2s ease-in-out infinite;
  }

  .statusBadge.error .statusDot {
    background: var(--nb-error);
  }

  .statusBadge.running,
  .statusBadge.loading {
    color: var(--nb-accent);
    border-color: var(--nb-accent-soft);
  }

  .statusBadge.error {
    color: var(--nb-error);
    border-color: var(--nb-error-soft);
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .dropdownMenu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 6px;
    min-width: 200px;
    padding: 4px;
    border-radius: var(--nb-radius-lg);
    background: var(--nb-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--nb-glass-border);
    box-shadow: var(--nb-shadow-lg);
    animation: menuIn 0.12s ease-out;
  }

  @keyframes menuIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .dropdownItem {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 0;
    border-radius: var(--nb-radius-md);
    background: transparent;
    color: var(--nb-text-secondary);
    cursor: pointer;
    font-size: 13px;
    transition: all var(--nb-transition-fast);
  }

  .dropdownItem:hover {
    background: var(--nb-accent-hover);
    color: var(--nb-text);
  }

  .dropdownDivider {
    height: 1px;
    margin: 3px 8px;
    background: var(--nb-border);
  }

  .widthToggle {
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: var(--nb-radius-pill);
    border: 1px solid var(--nb-glass-border);
    background: var(--nb-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: var(--nb-shadow-float);
  }

  .widthButton {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--nb-radius-pill);
    background: transparent;
    color: var(--nb-text-muted);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .widthButton:hover {
    color: var(--nb-text);
  }

  .widthButton.active {
    background: var(--nb-accent-soft);
    color: var(--nb-accent);
  }

  @media (max-width: 768px) {
    .bottomLeft {
      display: none;
    }

    .filenameBar {
      left: 16px;
      right: 16px;
      transform: none;
      justify-content: flex-start;
      padding-left: 56px;
    }

    .filepathDisplay,
    .filepathInput {
      max-width: calc(100vw - 128px);
      width: calc(100vw - 128px);
    }
  }
</style>
