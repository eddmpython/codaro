<script lang="ts">
  import { Loader2, Unlink, Lock } from "lucide-svelte";

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

  const chipBase =
    "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium leading-none ring-1 backdrop-blur-md transition-colors duration-quick ease-standard";
</script>

{#if activeStatus !== "idle"}
  <div class="absolute top-3 left-3 z-30 print:hidden">
    {#if activeStatus === "disconnected"}
      <div class="{chipBase} bg-destructive-soft text-destructive-fg ring-destructive-border">
        <Unlink class="h-3.5 w-3.5" />
        <span>Disconnected</span>
      </div>
    {:else if activeStatus === "running"}
      <button
        type="button"
        class="{chipBase} bg-accent-soft text-accent-base ring-accent-border cursor-pointer hover:bg-accent-soft/80 outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        onclick={onJumpToRunning}
      >
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span>Running</span>
      </button>
    {:else if activeStatus === "kiosk"}
      <div class="{chipBase} bg-info-soft text-info-fg ring-info-border">
        <Lock class="h-3.5 w-3.5" />
        <span>Kiosk</span>
      </div>
    {/if}
  </div>
{/if}
