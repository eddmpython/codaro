<script lang="ts">
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import {
    getSelectedPanel,
    setSelectedPanel,
    getIsSidebarOpen
  } from "../stores/panels.svelte";

  interface Props {
    panelTitle?: string;
    children?: Snippet;
  }

  let { panelTitle = "", children }: Props = $props();

  let isOpen = $derived(getIsSidebarOpen());
  let panelSize = $derived(isOpen ? 30 : 0);

  function closePanel() {
    setSelectedPanel("");
  }
</script>

<div
  data-testid="helper"
  class="bg-background print:hidden hide-on-fullscreen {isOpen ? 'border-r border-l border-(--slate-7)' : ''}"
  id="app-chrome-sidebar"
  data-panel-group-id="marimo:chrome:v1:l2"
  data-panel=""
  data-panel-collapsible="true"
  data-panel-id="app-chrome-sidebar"
  data-panel-size={panelSize.toFixed(1)}
  style="flex: {panelSize} 1 0px; overflow: hidden;"
>
  <div class="flex flex-row h-full">
    <div class="flex flex-col h-full flex-1 overflow-hidden mr-[-4px]">
      <div class="p-3 border-b flex justify-between items-center">
        <span class="text-sm text-(--slate-11) uppercase tracking-wide font-semibold flex-1">
          {panelTitle}
        </span>
        <button
          type="button"
          class="disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background opacity-80 hover:opacity-100 active:opacity-100 h-7 px-2 rounded-md text-xs m-0"
          data-testid="close-helper-pane"
          onclick={closePanel}
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-auto px-3 py-2">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>

    <div
      class="border-border print:hidden z-10 resize-handle-collapsed vertical"
      role="separator"
      data-panel-group-direction="horizontal"
      data-panel-group-id="marimo:chrome:v1:l2"
      data-resize-handle=""
      data-panel-resize-handle-enabled="false"
      data-panel-resize-handle-id="helper-resize"
      data-resize-handle-state="inactive"
      aria-controls="app-chrome-sidebar"
      aria-valuemax="75"
      aria-valuemin="10"
      aria-valuenow={isOpen ? 30 : 0}
      style="touch-action: none; user-select: none;"
    ></div>
  </div>
</div>
