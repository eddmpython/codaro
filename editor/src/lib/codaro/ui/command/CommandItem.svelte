<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    value?: string;
    onSelect?: () => void;
    disabled?: boolean;
    shortcut?: string;
    children: Snippet;
  };

  let {
    class: className,
    value,
    onSelect,
    disabled,
    shortcut,
    children,
  }: Props = $props();
</script>

<CommandPrimitive.Item
  {value}
  {onSelect}
  {disabled}
  class={cn(
    "relative flex h-9 cursor-pointer items-center gap-3 px-3 py-1.5 text-[13px] text-fg-secondary rounded-md select-none outline-none",
    "transition-colors duration-quick ease-standard",
    "data-[selected=true]:bg-surface-1 data-[selected=true]:text-fg data-[selected=true]:ring-1 data-[selected=true]:ring-border-subtle",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
    className,
  )}
>
  <span class="flex-1 min-w-0 truncate">{@render children()}</span>
  {#if shortcut}
    <span class="ml-auto text-[10.5px] font-mono text-fg-muted tracking-wider">{shortcut}</span>
  {/if}
</CommandPrimitive.Item>
