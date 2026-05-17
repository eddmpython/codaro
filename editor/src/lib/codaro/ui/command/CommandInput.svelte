<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import { Search } from "lucide-svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    placeholder?: string;
    value?: string;
  };

  let {
    class: className,
    placeholder = "Type a command or search...",
    value = $bindable(""),
  }: Props = $props();
</script>

<div class="flex items-center gap-2 border-b border-border-subtle px-3 h-12" cmdk-input-wrapper="">
  <Search class="h-4 w-4 text-fg-muted shrink-0" />
  <CommandPrimitive.Input
    bind:value
    {placeholder}
    class={cn(
      "flex h-12 w-full bg-transparent py-2 text-[14px] text-fg outline-none placeholder:text-fg-muted",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
  />
  <kbd class="pointer-events-none hidden sm:inline-flex h-5 px-1.5 items-center gap-1 rounded border border-border-subtle bg-surface-1 font-mono text-[10px] text-fg-muted">
    ⌘K
  </kbd>
</div>
