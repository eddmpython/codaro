<script lang="ts">
  import { DropdownMenu as DropdownPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    onSelect?: () => void;
    disabled?: boolean;
    inset?: boolean;
    children: Snippet;
    shortcut?: string;
  };

  let {
    class: className,
    onSelect,
    disabled,
    inset = false,
    shortcut,
    children,
  }: Props = $props();
</script>

<DropdownPrimitive.Item
  onSelect={onSelect}
  {disabled}
  class={cn(
    "relative flex items-center gap-2 px-2 py-1.5 text-[13px] text-fg rounded-sm cursor-pointer select-none outline-none",
    "transition-colors duration-quick",
    "data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    inset && "pl-8",
    className,
  )}
>
  <span class="flex-1 min-w-0">{@render children()}</span>
  {#if shortcut}
    <span class="ml-auto text-[10.5px] font-mono text-fg-muted tracking-wider">{shortcut}</span>
  {/if}
</DropdownPrimitive.Item>
