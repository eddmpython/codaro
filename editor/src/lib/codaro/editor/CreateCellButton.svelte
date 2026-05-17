<script lang="ts">
  import { Plus } from "lucide-svelte";

  interface Props {
    position?: "above" | "below";
    onCreateCode?: () => void;
    onCreateMarkdown?: () => void;
  }

  let {
    position = "below",
    onCreateCode = () => {},
    onCreateMarkdown = () => {},
  }: Props = $props();

  let showDropdown = $state(false);

  function handleClick(e: MouseEvent): void {
    e.stopPropagation();
    showDropdown = !showDropdown;
  }

  function createCode(e: MouseEvent): void {
    e.stopPropagation();
    showDropdown = false;
    onCreateCode();
  }

  function createMarkdown(e: MouseEvent): void {
    e.stopPropagation();
    showDropdown = false;
    onCreateMarkdown();
  }

  function handleBackdropClick(): void {
    showDropdown = false;
  }
</script>

<div class="createCellBtn" class:above={position === "above"}>
  <div class="dashedLine" aria-hidden="true"></div>
  <button
    class="chip"
    type="button"
    onclick={handleClick}
    aria-label="Add cell {position}"
    aria-haspopup="menu"
    aria-expanded={showDropdown}
    data-testid="create-cell-button"
  >
    <Plus class="h-3 w-3" strokeWidth={2} />
    <span class="chipLabel">Cell</span>
  </button>

  {#if showDropdown}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="backdrop" onclick={handleBackdropClick}></div>
    <div class="dropdown" role="menu">
      <button type="button" class="dropItem" onclick={createCode} role="menuitem">
        <span class="dropItemLabel">Python</span>
        <span class="kbd">⌘J</span>
      </button>
      <button type="button" class="dropItem" onclick={createMarkdown} role="menuitem">
        <span class="dropItemLabel">Markdown</span>
        <span class="kbd">⌘M</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .createCellBtn {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 5;
    height: 18px;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--motion-quick) var(--ease-standard);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .createCellBtn.above {
    top: -10px;
  }

  .createCellBtn:not(.above) {
    bottom: -10px;
  }

  :global(.codaro-cell:hover) ~ .createCellBtn,
  :global(.codaro-cell:hover) .createCellBtn,
  .createCellBtn:hover,
  .createCellBtn:focus-within {
    opacity: 1;
    pointer-events: auto;
  }

  .dashedLine {
    position: absolute;
    inset: 50% 0 auto 0;
    height: 0;
    border-top: 1px dashed var(--border-strong);
    opacity: 0.5;
    pointer-events: none;
  }

  .chip {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 10px;
    border-radius: 9999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-secondary);
    font-size: 11px;
    font-family: var(--font-sans);
    cursor: pointer;
    pointer-events: auto;
    transition:
      background var(--motion-quick) var(--ease-standard),
      color var(--motion-quick) var(--ease-standard),
      border-color var(--motion-quick) var(--ease-standard),
      transform var(--motion-quick) var(--ease-standard);
  }

  .chip:hover {
    background: var(--surface-3);
    color: var(--text-primary);
    border-color: var(--state-accent-border);
    transform: scale(1.04);
  }

  .chip:focus-visible {
    outline: 2px solid var(--state-accent-ring);
    outline-offset: 2px;
  }

  .chipLabel {
    line-height: 1;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 6px;
    min-width: 140px;
    padding: 4px;
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    background: var(--surface-3);
    box-shadow: var(--elevation-md);
    z-index: 60;
    pointer-events: auto;
  }

  .dropItem {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    background: transparent;
    font-size: 12px;
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    transition: background var(--motion-quick) var(--ease-standard);
  }

  .dropItem:hover {
    background: var(--surface-2);
  }

  .dropItemLabel {
    font-family: var(--font-sans);
  }

  .kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }
</style>
