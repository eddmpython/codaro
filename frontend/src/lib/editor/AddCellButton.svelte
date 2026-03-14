<script>
  export let onAdd = () => {};
  export let compact = false;

  let showMenu = false;

  function handleAdd(type) {
    onAdd(type);
    showMenu = false;
  }
</script>

<div class:compact class="addCellContainer">
  <div class="addLine"></div>
  <button class="addButton" onclick={() => (showMenu = !showMenu)} aria-label="Add cell">
    +
  </button>
  <div class="addLine"></div>

  {#if showMenu}
    <div class="addMenu">
      <button class="menuItem" onclick={() => handleAdd("code")}>
        <span class="menuIcon">&lt;/&gt;</span>
        Code
      </button>
      <button class="menuItem" onclick={() => handleAdd("markdown")}>
        <span class="menuIcon">M</span>
        Markdown
      </button>
    </div>
  {/if}
</div>

<style>
  .addCellContainer {
    position: relative;
    display: flex;
    align-items: center;
    padding: 2px 0;
    margin-left: 36px;
  }

  .addLine {
    flex: 1;
    height: 1px;
    background: var(--nb-border);
    opacity: 0;
    transition: opacity var(--nb-transition);
  }

  .addButton {
    width: 22px;
    height: 22px;
    margin: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    color: var(--nb-text-muted);
    cursor: pointer;
    font-size: 13px;
    opacity: 0;
    transition: all var(--nb-transition);
  }

  .addCellContainer:hover .addLine {
    opacity: 0.6;
  }

  .addCellContainer:hover .addButton,
  .addCellContainer:has(.addMenu) .addButton {
    opacity: 1;
  }

  .addButton:hover {
    border-color: var(--nb-accent);
    color: var(--nb-accent);
    background: var(--nb-accent-soft);
  }

  .addCellContainer.compact {
    padding: 4px 0 0;
  }

  .addCellContainer.compact .addButton {
    opacity: 0.5;
  }

  .addCellContainer.compact .addLine {
    opacity: 0.3;
  }

  .addMenu {
    position: absolute;
    top: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    padding: 4px;
    border-radius: var(--nb-radius-md);
    border: 1px solid var(--nb-glass-border);
    background: var(--nb-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: var(--nb-shadow-lg);
    z-index: 20;
    animation: menuPopIn 0.1s ease-out;
  }

  @keyframes menuPopIn {
    from {
      opacity: 0;
      transform: translateX(-50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  }

  .menuItem {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border: 0;
    border-radius: var(--nb-radius-sm);
    background: transparent;
    color: var(--nb-text-secondary);
    cursor: pointer;
    white-space: nowrap;
    font-size: 12px;
    transition: all var(--nb-transition-fast);
  }

  .menuItem:hover {
    background: var(--nb-accent-hover);
    color: var(--nb-text);
  }

  .menuIcon {
    color: var(--nb-text-muted);
    font-family: var(--nb-font-code);
    font-size: 11px;
    font-weight: 600;
  }
</style>
