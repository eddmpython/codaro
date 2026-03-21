<script lang="ts">
  import {
    Bot,
    Box,
    CircleX,
    ExternalLink,
    FolderTree,
    MessageCircleQuestionMark,
    MessageSquareHeart,
    Network,
    ScrollText,
    SquareDashedBottomCode,
    Variable
  } from "lucide-svelte";
  import type { Component } from "svelte";
  import {
    getSelectedPanel,
    setSelectedPanel,
    type SidebarPanel
  } from "../stores/panels.svelte";
  import { openPublicDoc } from "../contextHelp";

  interface PanelDescriptor {
    key: SidebarPanel;
    label: string;
    icon: Component<{ class?: string }>;
  }

  const sidebarPanels: PanelDescriptor[] = [
    { key: "files", label: "Files", icon: FolderTree },
    { key: "variables", label: "Variables", icon: Variable },
    { key: "dependencies", label: "Dependencies", icon: Network },
    { key: "packages", label: "Packages", icon: Box },
    { key: "outline", label: "Outline", icon: ScrollText },
    { key: "documentation", label: "Context Help", icon: MessageCircleQuestionMark },
    { key: "snippets", label: "Snippets", icon: SquareDashedBottomCode },
    { key: "ai", label: "AI", icon: Bot }
  ];

  interface Props {
    errorCount?: number;
    queuedOrRunningCount?: number;
    onFeedback?: () => void;
  }

  let { errorCount = 0, queuedOrRunningCount = 0, onFeedback }: Props = $props();

  const itemBase = "flex items-center p-2 text-sm mx-px shadow-inset font-mono rounded";

  function handlePanelClick(key: SidebarPanel) {
    setSelectedPanel(key);
  }
</script>

<div class="h-full pt-4 pb-1 px-1 flex flex-col items-start text-muted-foreground text-md select-none text-sm z-50 dark:bg-background print:hidden hide-on-fullscreen">
  <span data-focus-scope-start="true" hidden></span>
  <div
    data-state="closed"
    class="flex flex-col gap-0"
    aria-label="Sidebar panels"
    role="listbox"
    tabindex="0"
    data-layout="stack"
    data-orientation="vertical"
  >
    {#each sidebarPanels as panel (panel.key)}
      {@const selected = getSelectedPanel() === panel.key}
      <div class="active:cursor-grabbing data-[dragging]:opacity-60 outline-none" role="option" aria-selected="false" tabindex="-1" data-key={panel.key}>
        <button
          type="button"
          class="{itemBase} {selected ? 'bg-(--sage-4)' : 'hover:bg-(--sage-3)'}"
          data-state={selected ? "open" : "closed"}
          onclick={() => handlePanelClick(panel.key)}
        >
          {#if panel.key === "errors"}
            <CircleX class="h-5 w-5 {errorCount > 0 ? 'text-destructive' : ''}" />
          {:else}
            {@const Icon = panel.icon}
            <Icon class="h-5 w-5" />
          {/if}
        </button>
      </div>
    {/each}
  </div>
  <span data-focus-scope-end="true" hidden></span>

  <button
    class="{itemBase} hover:bg-(--sage-3)"
    data-state="closed"
    type="button"
    aria-label="Open public docs"
    onclick={() => openPublicDoc("/docs")}
  >
    <ExternalLink class="h-5 w-5" />
  </button>

  <button
    class="{itemBase} hover:bg-(--sage-3)"
    data-state="closed"
    type="button"
    aria-label="Send feedback"
    onclick={() => onFeedback?.()}
  >
    <MessageSquareHeart class="h-5 w-5" />
  </button>

  <div class="flex-1"></div>

  <div class="flex flex-col-reverse gap-px overflow-hidden" data-state="closed">
    {#each Array(queuedOrRunningCount) as _}
      <div class="shrink-0 h-1 w-2 bg-(--grass-6) border border-(--grass-7)"></div>
    {/each}
  </div>
</div>
