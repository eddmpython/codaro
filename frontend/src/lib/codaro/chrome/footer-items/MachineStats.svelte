<script lang="ts">
  import { Cpu, HardDrive } from "lucide-svelte";

  interface Props {
    cpuPercent?: number;
    memoryPercent?: number;
  }

  let {
    cpuPercent = 0,
    memoryPercent = 0
  }: Props = $props();

  function barColor(percent: number): string {
    if (percent > 80) return "bg-destructive";
    if (percent > 60) return "bg-amber-500";
    return "bg-green-500";
  }
</script>

{#if cpuPercent > 0 || memoryPercent > 0}
  <div
    class="flex items-center gap-3 p-2 text-xs font-mono text-muted-foreground"
    data-testid="footer-machine-stats"
  >
    <span class="flex items-center gap-1" title="CPU {cpuPercent}%">
      <Cpu class="w-3 h-3" />
      <span class="inline-block w-12 h-1.5 rounded-full bg-(--gray-4) overflow-hidden">
        <span class="block h-full rounded-full {barColor(cpuPercent)}" style="width: {cpuPercent}%"></span>
      </span>
      <span class="w-8 text-right">{cpuPercent}%</span>
    </span>
    <span class="flex items-center gap-1" title="Memory {memoryPercent}%">
      <HardDrive class="w-3 h-3" />
      <span class="inline-block w-12 h-1.5 rounded-full bg-(--gray-4) overflow-hidden">
        <span class="block h-full rounded-full {barColor(memoryPercent)}" style="width: {memoryPercent}%"></span>
      </span>
      <span class="w-8 text-right">{memoryPercent}%</span>
    </span>
  </div>
{/if}
