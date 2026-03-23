<script lang="ts">
  import { OctagonX, ShieldCheck } from "lucide-svelte";
  import {
    getEStopState,
    activateEStop,
    deactivateEStop,
  } from "../stores/automationStore.svelte";

  let eStop = $derived(getEStopState());

  async function handleToggle() {
    if (eStop.active) {
      await deactivateEStop();
    } else {
      await activateEStop("Manual trigger via dashboard");
    }
  }
</script>

<button
  class="estop-btn"
  class:active={eStop.active}
  type="button"
  onclick={handleToggle}
  title={eStop.active ? "Clear Emergency Stop" : "Emergency Stop"}
>
  {#if eStop.active}
    <ShieldCheck class="h-5 w-5" />
    <span class="estop-label">Clear E-Stop</span>
  {:else}
    <OctagonX class="h-5 w-5" />
    <span class="estop-label">E-Stop</span>
  {/if}
</button>

{#if eStop.active && eStop.reason}
  <div class="estop-reason">{eStop.reason}</div>
{/if}

<style>
  .estop-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 2px solid hsl(0 70% 50%);
    border-radius: 8px;
    background: hsl(0 70% 50% / 0.08);
    color: hsl(0 70% 50%);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
    justify-content: center;
  }

  .estop-btn:hover {
    background: hsl(0 70% 50% / 0.15);
  }

  .estop-btn.active {
    border-color: hsl(142 71% 45%);
    background: hsl(142 71% 45% / 0.08);
    color: hsl(142 71% 45%);
    animation: pulse-border 2s ease-in-out infinite;
  }

  .estop-btn.active:hover {
    background: hsl(142 71% 45% / 0.15);
  }

  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 hsl(0 70% 50% / 0); }
    50% { box-shadow: 0 0 0 4px hsl(0 70% 50% / 0.15); }
  }

  .estop-reason {
    font-size: 11px;
    color: hsl(0 65% 48%);
    padding: 4px 8px;
    background: hsl(0 70% 50% / 0.06);
    border-radius: 4px;
    text-align: center;
  }
</style>
