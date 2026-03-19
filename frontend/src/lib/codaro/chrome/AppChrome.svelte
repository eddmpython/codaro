<script lang="ts">
  import type { Snippet } from "svelte";
  import PanelGroup from "./PanelGroup.svelte";
  import Sidebar from "./Sidebar.svelte";
  import HelperSidebar from "./HelperSidebar.svelte";
  import DeveloperPanel from "./DeveloperPanel.svelte";
  import Footer from "./Footer.svelte";
  import {
    getSelectedPanel,
    getIsSidebarOpen,
    getIsDeveloperPanelOpen
  } from "../stores/panels.svelte";

  interface Props {
    connectionState?: string;
    engineName?: string;
    engineStatus?: string;
    errorCount?: number;
    warningCount?: number;
    issueCount?: number;
    panelTitle?: string;
    helperPanelContent?: Snippet;
    onExport?: () => void;
    children: Snippet;
  }

  let {
    connectionState = "OPEN",
    engineName = "none",
    engineStatus = "idle",
    errorCount = 0,
    warningCount = 0,
    issueCount = 0,
    panelTitle = "",
    helperPanelContent,
    onExport,
    children
  }: Props = $props();

  let isDeveloperOpen = $derived(getIsDeveloperPanelOpen());
  let mainPanelFlex = $derived(isDeveloperOpen ? 75 : 100);
</script>

<div class="flex flex-col flex-1 overflow-hidden absolute inset-0 print:relative bg-background">
  <PanelGroup id="marimo:chrome:v1:l2" direction="horizontal">
    <Sidebar {errorCount} />

    <HelperSidebar {panelTitle}>
      {#if helperPanelContent}
        {@render helperPanelContent()}
      {/if}
    </HelperSidebar>

    <div
      id="app-chrome-body"
      data-panel-group-id="marimo:chrome:v1:l2"
      data-panel=""
      data-panel-id="app-chrome-body"
      data-panel-size="100.0"
      style="flex: 100 1 0px; overflow: hidden;"
    >
      <PanelGroup id="marimo:chrome:v1:l1" direction="vertical">
        <div
          data-panel-group-id="marimo:chrome:v1:l1"
          data-panel=""
          data-panel-id="app"
          data-panel-size={mainPanelFlex.toFixed(1)}
          style="flex: {mainPanelFlex} 1 0px; overflow: hidden;"
        >
          {@render children()}
        </div>

        <DeveloperPanel {engineName} {engineStatus} {errorCount} />
      </PanelGroup>
    </div>
  </PanelGroup>

  <Footer {connectionState} {engineStatus} {issueCount} {warningCount} {onExport} />
</div>
