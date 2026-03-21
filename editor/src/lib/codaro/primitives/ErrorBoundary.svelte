<script lang="ts">
  import { AlertTriangle, RefreshCw } from "lucide-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let hasError = $state(false);
  let errorMessage = $state("");

  function handleError(event: ErrorEvent) {
    hasError = true;
    errorMessage = event.message || "An unexpected error occurred";
  }

  function handleReload() {
    hasError = false;
    errorMessage = "";
    window.location.reload();
  }

  function handleDismiss() {
    hasError = false;
    errorMessage = "";
  }
</script>

<svelte:window on:error={handleError} />

{#if hasError}
  <div class="error-boundary">
    <div class="error-card">
      <AlertTriangle class="h-8 w-8 text-destructive" />
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{errorMessage}</p>
      <div class="error-actions">
        <button class="error-btn primary" onclick={handleReload}>
          <RefreshCw class="h-4 w-4" />
          Reload
        </button>
        <button class="error-btn" onclick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
  }

  .error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--background);
    text-align: center;
    max-width: 400px;
  }

  .error-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .error-message {
    font-size: 0.85rem;
    color: var(--muted-foreground);
    margin: 0;
    max-width: 300px;
    word-break: break-word;
  }

  .error-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .error-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .error-btn:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .error-btn.primary {
    background: var(--accent);
    color: var(--accent-foreground);
    border-color: transparent;
  }

  .error-btn.primary:hover {
    opacity: 0.9;
  }
</style>
