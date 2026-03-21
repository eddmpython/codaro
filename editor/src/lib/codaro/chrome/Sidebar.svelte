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

  function handlePanelClick(key: SidebarPanel) {
    setSelectedPanel(key);
  }
</script>

<nav class="sidebar" aria-label="Sidebar navigation">
  <div class="sidebar-panels" role="listbox" tabindex="0">
    {#each sidebarPanels as panel (panel.key)}
      {@const selected = getSelectedPanel() === panel.key}
      <div class="sidebar-item-wrap" role="option" aria-selected={selected}>
        {#if selected}
          <div class="active-indicator"></div>
        {/if}
        <button
          type="button"
          class="sidebar-btn"
          class:active={selected}
          onclick={() => handlePanelClick(panel.key)}
          title={panel.label}
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

  <div class="sidebar-actions">
    <button
      class="sidebar-btn"
      type="button"
      title="Documentation"
      onclick={() => openPublicDoc("/docs")}
    >
      <ExternalLink class="h-5 w-5" />
    </button>

    <button
      class="sidebar-btn"
      type="button"
      title="Send feedback"
      onclick={() => onFeedback?.()}
    >
      <MessageSquareHeart class="h-5 w-5" />
    </button>
  </div>

  <div class="sidebar-spacer"></div>

  {#if queuedOrRunningCount > 0}
    <div class="running-indicators">
      {#each Array(queuedOrRunningCount) as _}
        <div class="running-bar"></div>
      {/each}
    </div>
  {/if}
</nav>

<style>
  .sidebar {
    height: 100%;
    padding: 12px 4px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--background);
    color: var(--muted-foreground);
    user-select: none;
    z-index: 50;
  }

  .sidebar-panels {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-item-wrap {
    position: relative;
    outline: none;
  }

  .active-indicator {
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    border-radius: 0 2px 2px 0;
    background: var(--accent);
    animation: indicatorIn 0.15s ease-out;
  }

  @keyframes indicatorIn {
    from { height: 0; opacity: 0; }
    to { height: 16px; opacity: 1; }
  }

  .sidebar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: all 0.1s;
    font-family: var(--monospace-font, monospace);
    font-size: 0.875rem;
  }

  .sidebar-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    color: var(--foreground);
  }

  .sidebar-btn.active {
    background: color-mix(in srgb, var(--foreground) 10%, transparent);
    color: var(--foreground);
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  }

  .sidebar-spacer {
    flex: 1;
  }

  .running-indicators {
    display: flex;
    flex-direction: column-reverse;
    gap: 1px;
    overflow: hidden;
    padding-bottom: 4px;
  }

  .running-bar {
    flex-shrink: 0;
    height: 3px;
    width: 8px;
    background: var(--grass-9, hsl(142 71% 45%));
    border-radius: 1px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      z-index: 50;
      left: 0;
      top: 0;
      bottom: 0;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
    }
  }

  @media print {
    .sidebar {
      display: none;
    }
  }
</style>
