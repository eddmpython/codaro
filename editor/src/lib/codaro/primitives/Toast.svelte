<script lang="ts">
  import { X, CheckCircle2, AlertCircle, Info } from "lucide-svelte";
  import { getToasts, dismissToast } from "../stores/toast.svelte";

  let toasts = $derived(getToasts());

  const icons = {
    info: Info,
    success: CheckCircle2,
    error: AlertCircle,
  };
</script>

{#if toasts.length > 0}
  <div class="toast-container" aria-live="polite">
    {#each toasts as toast (toast.id)}
      <div class="toast-item {toast.type}">
        <svelte:component this={icons[toast.type]} class="h-4 w-4" />
        <span class="toast-message">{toast.message}</span>
        <button class="toast-close" onclick={() => dismissToast(toast.id)} aria-label="Dismiss">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 70;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 360px;
  }

  .toast-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--background);
    border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    font-size: 0.85rem;
    color: var(--foreground);
    animation: toastIn 0.2s ease-out;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .toast-item.success {
    border-color: hsl(142 71% 45% / 0.3);
    color: hsl(142 71% 45%);
  }

  .toast-item.error {
    border-color: hsl(0 84% 60% / 0.3);
    color: var(--destructive);
  }

  .toast-item.info {
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
    color: var(--accent);
  }

  .toast-message {
    flex: 1;
    color: var(--foreground);
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
    cursor: pointer;
  }

  .toast-close:hover {
    color: var(--foreground);
  }
</style>
