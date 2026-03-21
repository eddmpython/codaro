<script lang="ts">
  import type { Snippet } from "svelte";
  import PanelGroup from "./PanelGroup.svelte";
  import Sidebar from "./Sidebar.svelte";
  import HelperSidebar from "./HelperSidebar.svelte";
  import DeveloperPanel from "./DeveloperPanel.svelte";
  import Footer from "./Footer.svelte";
  import ChatBar from "../components/ChatBar.svelte";
  import ArtifactPanel from "../panels/ArtifactPanel.svelte";
  import Toast from "../primitives/Toast.svelte";
  import {
    getSelectedPanel,
    getIsSidebarOpen,
    getIsDeveloperPanelOpen
  } from "../stores/panels.svelte";
  import { getIsArtifactPanelOpen } from "../ai/aiStore.svelte";
  import { getActiveModeConfig } from "../modes/modeStore.svelte";

  interface Props {
    connectionState?: string;
    engineName?: string;
    engineStatus?: string;
    errorCount?: number;
    warningCount?: number;
    issueCount?: number;
    queuedOrRunningCount?: number;
    panelTitle?: string;
    helperPanelContent?: Snippet;
    onExport?: () => void;
    onFeedback?: () => void;
    children: Snippet;
  }

  let {
    connectionState = "OPEN",
    engineName = "none",
    engineStatus = "idle",
    errorCount = 0,
    warningCount = 0,
    issueCount = 0,
    queuedOrRunningCount = 0,
    panelTitle = "",
    helperPanelContent,
    onExport,
    onFeedback,
    children
  }: Props = $props();

  let isDeveloperOpen = $derived(getIsDeveloperPanelOpen());
  let artifactOpen = $derived(getIsArtifactPanelOpen());
  let modeConfig = $derived(getActiveModeConfig());
  let mainPanelFlex = $derived(isDeveloperOpen ? 75 : 100);
</script>

<div class="chrome-root">
  <PanelGroup id="codaro:chrome:v1:l2" direction="horizontal">
    <div class="chrome-sidebar">
      <Sidebar {errorCount} {queuedOrRunningCount} {onFeedback} />
    </div>

    <HelperSidebar {panelTitle}>
      {#if helperPanelContent}
        {@render helperPanelContent()}
      {/if}
    </HelperSidebar>

    <div
      id="app-chrome-body"
      data-panel-group-id="codaro:chrome:v1:l2"
      data-panel=""
      data-panel-id="app-chrome-body"
      data-panel-size="100.0"
      style="flex: 100 1 0px; overflow: hidden; display: flex;"
    >
      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <PanelGroup id="codaro:chrome:v1:l1" direction="vertical">
          <div
            data-panel-group-id="codaro:chrome:v1:l1"
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

      {#if artifactOpen}
        <ArtifactPanel />
      {/if}
    </div>
  </PanelGroup>

  <ChatBar />
  <Footer {connectionState} {engineStatus} {issueCount} {warningCount} {onExport} />
  <Toast />
</div>

<style>
  .chrome-root {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    position: absolute;
    inset: 0;
    background: var(--background);
  }

  .chrome-sidebar {
    display: block;
  }

  @media (max-width: 640px) {
    .chrome-sidebar {
      display: none;
    }
  }

  @media print {
    .chrome-root {
      position: relative;
    }
  }
</style>
