<script lang="ts">
  import {
    CircleX,
    TriangleAlert
  } from "lucide-svelte";
  import {
    getIsDeveloperPanelOpen,
    toggleDeveloperPanel
  } from "../stores/panels.svelte";
  import BackendStatus from "./footer-items/BackendStatus.svelte";
  import RuntimeSettings from "./footer-items/RuntimeSettings.svelte";
  import CopilotStatus from "./footer-items/CopilotStatus.svelte";
  import AIStatus from "./footer-items/AIStatus.svelte";
  import MachineStats from "./footer-items/MachineStats.svelte";
  import RTCStatus from "./footer-items/RTCStatus.svelte";

  interface Props {
    issueCount?: number;
    warningCount?: number;
    connectionState?: string;
    engineStatus?: string;
    onExport?: () => void;
  }

  let {
    issueCount = 0,
    warningCount = 0,
    connectionState = "OPEN",
    engineStatus = "idle",
    onExport
  }: Props = $props();

  const itemBase = "flex items-center p-2 text-sm mx-px shadow-inset font-mono rounded";

  let devPanelOpen = $derived(getIsDeveloperPanelOpen());
</script>

<footer class="h-10 py-1 gap-1 bg-background flex items-center text-muted-foreground text-md pl-2 pr-1 border-t border-border select-none print:hidden text-sm z-50 hide-on-fullscreen overflow-x-auto overflow-y-hidden scrollbar-thin">
  <button
    class="{itemBase} {devPanelOpen ? 'bg-(--sage-4)' : 'hover:bg-(--sage-3)'} h-full"
    data-testid="footer-panel"
    data-state={devPanelOpen ? "open" : "closed"}
    onclick={toggleDeveloperPanel}
  >
    <div class="flex items-center gap-1 h-full">
      <CircleX class="w-4 h-4 {issueCount > 0 ? 'text-destructive' : ''}" />
      <span>{issueCount}</span>
      <TriangleAlert class="w-4 h-4 ml-1 {warningCount > 0 ? 'text-yellow-500' : ''}" />
      <span>{warningCount}</span>
    </div>
  </button>

  <RuntimeSettings onToggle={onExport} />
  <BackendStatus {connectionState} {engineStatus} />

  <div class="mx-auto"></div>

  <div class="flex items-center shrink-0 min-w-0">
    <MachineStats />
    <RTCStatus />
    <CopilotStatus />
    <AIStatus />
  </div>
</footer>
