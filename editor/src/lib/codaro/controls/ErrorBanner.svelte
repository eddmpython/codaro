<script lang="ts">
  import { AlertTriangle, AlertCircle, Info, X, ChevronDown, ChevronRight } from "lucide-svelte";

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

  const toneClass = $derived(
    kind === "error"
      ? "bg-destructive-soft border-destructive-border text-destructive-fg"
      : kind === "warning"
        ? "bg-warning-soft border-warning-border text-warning-fg"
        : "bg-info-soft border-info-border text-info-fg",
  );
</script>

<div
  class="relative rounded-md border px-4 py-3 text-[13px] flex flex-col gap-2 {toneClass}"
  role="alert"
>
  <div class="flex items-start gap-2.5">
    <span class="mt-0.5 shrink-0">
      {#if kind === "error"}
        <AlertTriangle class="h-4 w-4" />
      {:else if kind === "warning"}
        <AlertCircle class="h-4 w-4" />
      {:else}
        <Info class="h-4 w-4" />
      {/if}
    </span>

    <div class="flex-1 min-w-0 leading-relaxed">
      {#if title}
        <div class="font-semibold mb-0.5">{title}</div>
      {/if}
      <div>{message}</div>
    </div>

    {#if expandable && details}
      <button
        type="button"
        class="shrink-0 p-1 rounded hover:bg-current/10 transition-colors duration-quick outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
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
        type="button"
        class="shrink-0 p-1 rounded hover:bg-current/10 transition-colors duration-quick outline-none focus-visible:ring-2 focus-visible:ring-current"
        aria-label="Dismiss"
        onclick={onDismiss}
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>

  {#if expanded && details}
    <div class="pt-2 border-t border-current/20">
      <pre class="text-[11.5px] font-mono whitespace-pre-wrap max-h-48 overflow-auto opacity-90">{details}</pre>
    </div>
  {/if}
</div>
