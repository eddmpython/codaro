<script lang="ts">
  import { Cpu, HardDrive } from "lucide-svelte";

  interface Props {
    cpuPercent?: number;
    memoryPercent?: number;
  }

  let {
    cpuPercent = 0,
    memoryPercent = 0,
  }: Props = $props();

  function barColor(percent: number): string {
    if (percent > 80) return "bg-destructive-base";
    if (percent > 60) return "bg-warning-base";
    return "bg-success-base";
  }
</script>

{#if cpuPercent > 0 || memoryPercent > 0}
  <div
    class="inline-flex items-center gap-2 h-5 px-2 text-[11px] font-mono leading-none text-fg-muted"
    data-testid="footer-machine-stats"
  >
    <span class="inline-flex items-center gap-1.5" title="CPU {cpuPercent}%">
      <Cpu class="w-3 h-3" />
      <span class="inline-block w-12 h-1 rounded-full bg-surface-3 overflow-hidden">
        <span
          class="block h-full rounded-full transition-[width] duration-base ease-standard {barColor(cpuPercent)}"
          style="width: {cpuPercent}%"
        ></span>
      </span>
      <span class="w-7 text-right tabular-nums">{cpuPercent}%</span>
    </span>
    <span class="inline-flex items-center gap-1.5" title="Memory {memoryPercent}%">
      <HardDrive class="w-3 h-3" />
      <span class="inline-block w-12 h-1 rounded-full bg-surface-3 overflow-hidden">
        <span
          class="block h-full rounded-full transition-[width] duration-base ease-standard {barColor(memoryPercent)}"
          style="width: {memoryPercent}%"
        ></span>
      </span>
      <span class="w-7 text-right tabular-nums">{memoryPercent}%</span>
    </span>
  </div>
{/if}
