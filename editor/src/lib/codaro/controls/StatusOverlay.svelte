<script lang="ts">
  import { Hourglass, Unlink, Lock } from "lucide-svelte";

  interface Props {
    engineStatus: string;
    connectionState: string;
    kioskMode?: boolean;
    onJumpToRunning?: () => void;
  }

  let {
    engineStatus,
    connectionState,
    kioskMode = false,
    onJumpToRunning,
  }: Props = $props();

  type ActiveStatus = "disconnected" | "running" | "kiosk" | "idle";

  let activeStatus: ActiveStatus = $derived.by(() => {
    if (connectionState === "CLOSED" || connectionState === "disconnected") {
      return "disconnected";
    }
    if (engineStatus === "running") {
      return "running";
    }
    if (kioskMode) {
      return "kiosk";
    }
    return "idle";
  });

  const baseClass =
    "flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-sm transition-colors";
</script>

{#if activeStatus !== "idle"}
  <div class="absolute top-3 left-3 z-30 print:hidden">
    {#if activeStatus === "disconnected"}
      <div class="{baseClass} text-destructive">
        <Unlink class="h-4 w-4 text-destructive" />
        <span>Disconnected</span>
      </div>
    {:else if activeStatus === "running"}
      <button
        class="{baseClass} text-muted-foreground cursor-pointer hover:text-foreground"
        onclick={onJumpToRunning}
      >
        <Hourglass class="h-4 w-4 animate-pulse text-primary" />
        <span>Running...</span>
      </button>
    {:else if activeStatus === "kiosk"}
      <div class="{baseClass} text-blue-500">
        <Lock class="h-4 w-4 text-blue-500" />
        <span>Kiosk</span>
      </div>
    {/if}
  </div>
{/if}
