<script lang="ts">
  import {
    CircleX,
    Database,
    FileText,
    KeyRound,
    Network,
    NotebookPen,
    PowerOff,
    Terminal,
    X
  } from "lucide-svelte";
  import type { Component } from "svelte";
  import {
    getIsDeveloperPanelOpen,
    setIsDeveloperPanelOpen,
    getSelectedDeveloperTab,
    setSelectedDeveloperTab,
    type DeveloperTab
  } from "../stores/panels.svelte";
  import ErrorsPanel from "../panels/ErrorsPanel.svelte";
  import ScratchpadPanel from "../panels/ScratchpadPanel.svelte";
  import TracingPanel from "../panels/TracingPanel.svelte";
  import SecretsPanel from "../panels/SecretsPanel.svelte";
  import LogsPanel from "../panels/LogsPanel.svelte";
  import TerminalPanel from "../panels/TerminalPanel.svelte";
  import CachePanel from "../panels/CachePanel.svelte";

  interface TabDescriptor {
    key: DeveloperTab;
    label: string;
    icon: Component<{ class?: string }>;
  }

  const developerTabs: TabDescriptor[] = [
    { key: "errors", label: "Errors", icon: CircleX },
    { key: "scratchpad", label: "Scratchpad", icon: NotebookPen },
    { key: "tracing", label: "Tracing", icon: Network },
    { key: "secrets", label: "Secrets", icon: KeyRound },
    { key: "logs", label: "Logs", icon: FileText },
    { key: "terminal", label: "Terminal", icon: Terminal },
    { key: "cache", label: "Cache", icon: Database }
  ];

  interface Props {
    engineName?: string;
    engineStatus?: string;
    errorCount?: number;
  }

  let {
    engineName = "none",
    engineStatus = "idle",
    errorCount = 0
  }: Props = $props();

  let isOpen = $derived(getIsDeveloperPanelOpen());
  let selectedTab = $derived(getSelectedDeveloperTab());
  let panelSize = $derived(isOpen ? 25 : 0);

  function closePanel() {
    setIsDeveloperPanelOpen(false);
  }
</script>

<div
  class="border-border print:hidden z-20 resize-handle-collapsed horizontal"
  role="separator"
  data-panel-group-direction="vertical"
  data-panel-group-id="marimo:chrome:v1:l1"
  data-resize-handle=""
  data-panel-resize-handle-enabled={isOpen ? "true" : "false"}
  data-panel-resize-handle-id="developer-resize"
  data-resize-handle-state={isOpen ? "inactive" : "collapsed"}
  aria-controls="app"
  aria-valuemax="90"
  aria-valuemin="25"
  aria-valuenow={isOpen ? 75 : 100}
  style="touch-action: none; user-select: none;"
></div>

<div
  data-testid="panel"
  class="dark:bg-(--slate-1) print:hidden hide-on-fullscreen"
  id="app-chrome-panel"
  data-panel-group-id="marimo:chrome:v1:l1"
  data-panel=""
  data-panel-collapsible="true"
  data-panel-id="app-chrome-panel"
  data-panel-size={panelSize.toFixed(1)}
  style="flex: {panelSize} 1 0px; overflow: hidden;"
>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between border-b px-2 h-8 bg-background shrink-0">
      <div
        data-state="closed"
        class="flex flex-row gap-1"
        aria-label="Developer panel tabs"
        role="listbox"
        tabindex="0"
        data-layout="stack"
        data-orientation="vertical"
      >
        {#each developerTabs as tab (tab.key)}
          {@const isSelected = selectedTab === tab.key}
          <div class="active:cursor-grabbing data-[dragging]:opacity-60 outline-none" role="option" aria-selected={isSelected ? "true" : "false"} tabindex="-1" data-key={tab.key}>
            <button
              type="button"
              class="text-sm flex gap-2 px-2 pt-1 pb-0.5 items-center leading-none rounded-sm cursor-pointer {isSelected ? 'bg-muted' : 'hover:bg-muted/50'}"
              onclick={() => setSelectedDeveloperTab(tab.key)}
            >
              {#if tab.key === "errors"}
                <CircleX class="w-4 h-4 {errorCount > 0 ? 'text-destructive' : ''}" />
              {:else}
                {@const Icon = tab.icon}
                <Icon class="w-4 h-4" />
              {/if}
              {tab.label}
            </button>
          </div>
        {/each}
      </div>

      <div class="border-l border-border h-4 mx-1"></div>

      <button
        type="button"
        class="p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground"
        data-testid="backend-status"
        data-state="closed"
      >
        <PowerOff class="w-4 h-4 {engineStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}" />
        <span>{engineStatus === "error" ? "Kernel" : engineName}</span>
      </button>

      <div class="flex-1"></div>

      <button
        type="button"
        class="disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background opacity-80 hover:opacity-100 active:opacity-100 h-7 px-2 rounded-md text-xs"
        onclick={closePanel}
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      {#if selectedTab === "errors"}
        <ErrorsPanel />
      {:else if selectedTab === "scratchpad"}
        <ScratchpadPanel />
      {:else if selectedTab === "tracing"}
        <TracingPanel />
      {:else if selectedTab === "secrets"}
        <SecretsPanel />
      {:else if selectedTab === "logs"}
        <LogsPanel />
      {:else if selectedTab === "terminal"}
        <TerminalPanel />
      {:else if selectedTab === "cache"}
        <CachePanel />
      {/if}
    </div>
  </div>
</div>
