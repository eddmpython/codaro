<script lang="ts">
  import { BookOpen, Notebook, FileText, Workflow } from "lucide-svelte";
  import {
    getActiveMode,
    setActiveMode,
    type AppMode,
  } from "$lib/codaro/modes/modeStore.svelte";

  type ModeSegment = {
    mode: AppMode;
    label: string;
    icon: typeof BookOpen;
  };

  const segments: ModeSegment[] = [
    { mode: "learning", label: "Learn", icon: BookOpen },
    { mode: "notebook", label: "Notebook", icon: Notebook },
    { mode: "report", label: "Report", icon: FileText },
    { mode: "automation", label: "Automation", icon: Workflow },
  ];

  const active = $derived(getActiveMode());
  const activeIndex = $derived(segments.findIndex((s) => s.mode === active));
  const segmentCount = segments.length;
</script>

<div
  role="tablist"
  aria-label="Editor mode"
  class="relative inline-flex h-9 items-center rounded-full bg-surface-2 ring-1 ring-border-subtle p-1 gap-0.5"
>
  <span
    aria-hidden="true"
    class="absolute top-1 bottom-1 rounded-full bg-accent-soft ring-1 ring-accent-border transition-[left,width] duration-base ease-spring"
    style:left="calc(0.25rem + (100% - 0.5rem) / {segmentCount} * {activeIndex})"
    style:width="calc((100% - 0.5rem) / {segmentCount})"
  ></span>

  {#each segments as seg (seg.mode)}
    {@const Icon = seg.icon}
    {@const selected = active === seg.mode}
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onclick={() => setActiveMode(seg.mode)}
      class="relative z-10 inline-flex items-center justify-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium transition-colors duration-quick ease-standard outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
        {selected ? 'text-accent-base' : 'text-fg-secondary hover:text-fg'}"
    >
      <Icon class="w-3.5 h-3.5" />
      <span>{seg.label}</span>
    </button>
  {/each}
</div>
