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
    onCreateMarkdown = () => {}
  }: Props = $props();

  let showDropdown = $state(false);

  function handleClick(): void {
    showDropdown = !showDropdown;
  }

  function createCode(): void {
    showDropdown = false;
    onCreateCode();
  }

  function createMarkdown(): void {
    showDropdown = false;
    onCreateMarkdown();
  }
</script>

<div class="createCellBtn" class:above={position === "above"}>
  <button
    class="plusBtn"
    onclick={handleClick}
    aria-label="Add cell {position}"
    data-testid="create-cell-button"
  >
    <Plus class="h-3 w-3" />
  </button>

  {#if showDropdown}
    <div class="dropdown" role="menu">
      <button class="dropItem" onclick={createCode} role="menuitem">
        Python
      </button>
      <button class="dropItem" onclick={createMarkdown} role="menuitem">
        Markdown
      </button>
    </div>
  {/if}
</div>

<style>
  .createCellBtn {
    position: absolute;
    left: -26px;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.15s;
  }

  :global(.marimo-cell:hover) .createCellBtn,
  .createCellBtn:focus-within {
    opacity: 1;
  }

  .createCellBtn.above {
    top: -8px;
  }

  .createCellBtn:not(.above) {
    bottom: -8px;
  }

  .plusBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--background);
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .plusBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    min-width: 100px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--popover);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .dropItem {
    display: block;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    background: transparent;
    font-size: 12px;
    color: var(--foreground);
    text-align: left;
    cursor: pointer;
  }

  .dropItem:hover {
    background: var(--accent);
  }
</style>
