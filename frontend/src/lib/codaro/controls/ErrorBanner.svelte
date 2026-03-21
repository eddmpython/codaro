<script lang="ts">
  import { AlertTriangle, X, ChevronDown, ChevronRight } from "lucide-svelte";

  interface Props {
    title?: string;
    message: string;
    kind?: "error" | "warning" | "info";
    dismissible?: boolean;
    expandable?: boolean;
    details?: string;
    onDismiss?: () => void;
  }

  let {
    title = "",
    message,
    kind = "error",
    dismissible = true,
    expandable = false,
    details = "",
    onDismiss,
  }: Props = $props();

  let expanded = $state(false);

  let rootClass = $derived(
    "rounded-md border px-4 py-3 text-sm " +
      (kind === "error"
        ? "bg-destructive/10 border-destructive/30 text-destructive"
        : kind === "warning"
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700"
          : "bg-primary/10 border-primary/30 text-primary"),
  );
</script>

<div class={rootClass} role="alert">
  <div class="flex items-start gap-2">
    <AlertTriangle class="h-4 w-4 mt-0.5 shrink-0" />

    <div class="flex-1 min-w-0">
      {#if title}
        <div class="font-semibold">{title}</div>
      {/if}
      <div class="text-sm">{message}</div>
    </div>

    {#if expandable && details}
      <button
        class="shrink-0 p-0.5 hover:bg-current/10 rounded"
        aria-label={expanded ? "Collapse details" : "Expand details"}
        onclick={() => (expanded = !expanded)}
      >
        {#if expanded}
          <ChevronDown class="h-4 w-4" />
        {:else}
          <ChevronRight class="h-4 w-4" />
        {/if}
      </button>
    {/if}

    {#if dismissible}
      <button
        class="shrink-0 p-0.5 hover:bg-current/10 rounded"
        aria-label="Dismiss"
        onclick={onDismiss}
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>

  {#if expanded && details}
    <div class="mt-2 pt-2 border-t border-current/20">
      <pre class="text-xs font-mono whitespace-pre-wrap max-h-48 overflow-auto">{details}</pre>
    </div>
  {/if}
</div>
