<script>
  import { Blocks, Variable, Cpu, FileCog, Network } from "lucide-svelte";

  export let documentState;
  export let activeBlockId = null;
  export let variableNames = [];
  export let engineStatus = "idle";
  export let engineError = "";
  export let hasCycle = false;
  export let duplicateDefinitions = new Map();
  export let onSelectBlock = () => {};
  export let onToggleHideCode = () => {};

  const panels = [
    { id: "blocks", icon: Blocks, label: "Blocks" },
    { id: "variables", icon: Variable, label: "Variables" },
    { id: "runtime", icon: Cpu, label: "Runtime" },
    { id: "document", icon: FileCog, label: "Document" },
    { id: "graph", icon: Network, label: "Graph" }
  ];

  let sidebarOpen = true;
  let activePanel = "blocks";

  function handlePanelClick(panelId) {
    if (activePanel === panelId && sidebarOpen) {
      sidebarOpen = false;
      return;
    }
    activePanel = panelId;
    sidebarOpen = true;
  }

  function getBlockStatus(block) {
    if (duplicateDefinitions.has(block.id)) return "duplicate";
    return block.execution?.status || "idle";
  }

  function getBlockPreview(block) {
    const firstLine = (block.content || "").split("\n")[0]?.trim() || "";
    if (!firstLine) return block.type === "code" ? "(empty)" : "(empty)";
    return firstLine.length > 40 ? firstLine.slice(0, 40) + "..." : firstLine;
  }

  $: duplicateCount = duplicateDefinitions.size;
</script>

<div class="sidebar" class:open={sidebarOpen}>
  <div class="sidebarIcons">
    {#each panels as panel}
      <button
        class="iconButton"
        class:active={sidebarOpen && activePanel === panel.id}
        onclick={() => handlePanelClick(panel.id)}
        title={panel.label}
        aria-label={panel.label}
      >
        <panel.icon size={17} />
      </button>
    {/each}
  </div>

  {#if sidebarOpen}
    <div class="sidebarPanel">
      <div class="panelHeader">
        <span class="panelTitle">{panels.find((panel) => panel.id === activePanel)?.label}</span>
        <button class="panelClose" onclick={() => (sidebarOpen = false)} aria-label="Close panel">
          ×
        </button>
      </div>

      <div class="panelBody">
        {#if activePanel === "blocks"}
          <div class="panelSection">
            <div class="panelMeta">
              <strong>{documentState.blocks.length}</strong>
              <span>blocks</span>
            </div>
            {#each documentState.blocks as block, index}
              <button
                class="outlineItem"
                class:selected={block.id === activeBlockId}
                onclick={() => onSelectBlock(block.id)}
              >
                <div class="outlineContent">
                  <div class="outlineHeader">
                    <span class="outlineIndex">{index + 1}</span>
                    <span class="outlineType">{block.type}</span>
                  </div>
                  <div class="outlinePreview">{getBlockPreview(block)}</div>
                </div>
                <span class={`statusDot ${getBlockStatus(block)}`}></span>
              </button>
            {/each}
          </div>
        {:else if activePanel === "variables"}
          <div class="panelSection">
            {#if variableNames.length === 0}
              <p class="emptyText">실행 후 변수 목록이 여기에 표시됩니다.</p>
            {:else}
              <div class="varCount">
                <strong>{variableNames.length}</strong>
                <span>variables</span>
              </div>
              <div class="tagGrid">
                {#each variableNames as variableName}
                  <span class="tag">{variableName}</span>
                {/each}
              </div>
            {/if}
          </div>
        {:else if activePanel === "runtime"}
          <div class="panelSection">
            <div class="infoRow">
              <span>engine</span>
              <strong>{documentState.runtime.defaultEngine}</strong>
            </div>
            <div class="infoRow">
              <span>status</span>
              <strong class={engineStatus === "ready" ? "statusReady" : engineStatus === "error" ? "statusErr" : ""}>
                {engineStatus}
              </strong>
            </div>
            <div class="infoRow">
              <span>reactive</span>
              <strong>{documentState.runtime.reactiveMode}</strong>
            </div>
            {#if engineError}
              <div class="warningBox">{engineError}</div>
            {/if}
          </div>
        {:else if activePanel === "document"}
          <div class="panelSection">
            <div class="infoRow">
              <span>title</span>
              <strong>{documentState.title}</strong>
            </div>
            <div class="infoRow">
              <span>source</span>
              <strong>{documentState.metadata.sourceFormat}</strong>
            </div>
            <div class="infoRow">
              <span>app title</span>
              <strong>{documentState.app.title}</strong>
            </div>
            <label class="toggleRow">
              <input
                type="checkbox"
                checked={documentState.app.hideCode}
                onchange={onToggleHideCode}
              />
              <span>Hide code in app mode</span>
            </label>
          </div>
        {:else if activePanel === "graph"}
          <div class="panelSection">
            <div class="infoRow">
              <span>duplicate blocks</span>
              <strong>{duplicateCount}</strong>
            </div>
            <div class="infoRow">
              <span>cycle</span>
              <strong class={hasCycle ? "statusErr" : "statusReady"}>
                {hasCycle ? "detected" : "clean"}
              </strong>
            </div>
            <p class="emptyText">
              블록 의존 관계를 분석합니다. 중복 정의와 순환 참조는 실행 전에 감지됩니다.
            </p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    display: flex;
    z-index: 25;
  }

  .sidebarIcons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 42px;
    padding: 56px 4px 16px;
    background: var(--nb-bg);
    border-right: 1px solid var(--nb-border);
  }

  .iconButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: var(--nb-radius-sm);
    background: transparent;
    color: var(--nb-text-muted);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .iconButton:hover {
    background: var(--nb-surface);
    color: var(--nb-text-secondary);
  }

  .iconButton.active {
    background: var(--nb-accent-soft);
    color: var(--nb-accent);
  }

  .sidebarPanel {
    width: 272px;
    background: var(--nb-surface);
    border-right: 1px solid var(--nb-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.06);
    animation: panelSlide 0.15s ease-out;
  }

  @keyframes panelSlide {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .panelHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--nb-border);
  }

  .panelTitle {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--nb-text-muted);
  }

  .panelClose {
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: var(--nb-radius-sm);
    background: transparent;
    color: var(--nb-text-muted);
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--nb-transition-fast);
  }

  .panelClose:hover {
    background: var(--nb-card);
    color: var(--nb-text);
  }

  .panelBody {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .panelSection {
    display: grid;
    gap: 6px;
  }

  .panelMeta,
  .varCount,
  .infoRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-md);
    background: var(--nb-card);
    color: var(--nb-text-secondary);
    font-size: 12px;
  }

  .outlineItem {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-md);
    background: var(--nb-card);
    color: var(--nb-text-secondary);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .outlineItem:hover {
    border-color: var(--nb-border-strong);
    color: var(--nb-text);
  }

  .outlineItem.selected {
    border-color: var(--nb-accent);
    background: var(--nb-accent-soft);
    color: var(--nb-text);
  }

  .outlineContent {
    flex: 1;
    min-width: 0;
  }

  .outlineHeader {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
  }

  .outlineIndex {
    font-family: var(--nb-font-code);
    font-size: 10px;
    font-weight: 600;
    color: var(--nb-text-muted);
    min-width: 14px;
  }

  .outlineType {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .outlinePreview {
    font-size: 11px;
    font-family: var(--nb-font-code);
    color: var(--nb-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .statusDot {
    width: 8px;
    height: 8px;
    border-radius: var(--nb-radius-pill);
    background: var(--nb-border);
    flex: none;
    transition: background var(--nb-transition-fast);
  }

  .statusDot.done {
    background: var(--nb-success);
  }

  .statusDot.error,
  .statusDot.duplicate {
    background: var(--nb-error);
  }

  .statusDot.running {
    background: var(--nb-accent);
    animation: dotPulse 1.2s ease-in-out infinite;
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .statusReady {
    color: var(--nb-success);
  }

  .statusErr {
    color: var(--nb-error);
  }

  .tagGrid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    color: var(--nb-text-secondary);
    font-family: var(--nb-font-code);
    font-size: 11px;
    transition: all var(--nb-transition-fast);
  }

  .tag:hover {
    border-color: var(--nb-accent);
    color: var(--nb-accent);
  }

  .warningBox,
  .emptyText {
    margin: 0;
    padding: 10px;
    border-radius: var(--nb-radius-md);
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    color: var(--nb-text-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .warningBox {
    border-color: rgba(220, 38, 38, 0.2);
    background: var(--nb-error-soft);
    color: var(--nb-error);
  }

  .toggleRow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--nb-radius-md);
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    color: var(--nb-text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .toggleRow:hover {
    border-color: var(--nb-border-strong);
  }

  .toggleRow input[type="checkbox"] {
    accent-color: var(--nb-accent);
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
  }
</style>
