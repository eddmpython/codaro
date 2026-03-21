<script lang="ts">
  import { Power } from "lucide-svelte";

  interface Props {
    isWasm?: boolean;
    onShutdown?: () => void;
  }

  let {
    isWasm = false,
    onShutdown = () => {}
  }: Props = $props();

  let showConfirm = $state(false);

  function handleClick(): void {
    if (isWasm) {
      return;
    }
    showConfirm = true;
  }

  function confirmShutdown(): void {
    showConfirm = false;
    onShutdown();
  }

  function handleOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      showConfirm = false;
    }
  }

  function handleDialogKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      showConfirm = false;
    }
  }
</script>

{#if !isWasm}
  <button
    class="shutdownBtn"
    onclick={handleClick}
    aria-label="Shutdown"
    data-testid="shutdown-button"
  >
    <Power class="h-4 w-4" />
  </button>
{/if}

{#if showConfirm}
  <div class="overlay" role="presentation" onclick={handleOverlayClick}>
    <div class="confirmDialog" role="alertdialog" tabindex="-1" onkeydown={handleDialogKeydown}>
      <h4>Shutdown server?</h4>
      <p>This will stop the running kernel and close all connections.</p>
      <div class="confirmActions">
        <button class="cancelBtn" onclick={() => { showConfirm = false; }}>Cancel</button>
        <button class="dangerBtn" onclick={confirmShutdown}>Shutdown</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .shutdownBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .shutdownBtn:hover {
    background: hsl(0 84.2% 60.2% / 0.1);
    border-color: var(--destructive);
    color: var(--destructive);
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .confirmDialog {
    max-width: 360px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--background);
  }

  .confirmDialog h4 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .confirmDialog p {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--muted-foreground);
  }

  .confirmActions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .cancelBtn,
  .dangerBtn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }

  .cancelBtn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
  }

  .dangerBtn {
    border: none;
    background: var(--destructive, #b91c1c);
    color: white;
  }
</style>
