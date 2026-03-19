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
</script>

{#if cpuPercent > 0 || memoryPercent > 0}
  <div
    class="flex items-center gap-2 p-2 text-xs font-mono text-muted-foreground"
    data-testid="footer-machine-stats"
  >
    <span class="flex items-center gap-1">
      <Cpu class="h-3 w-3" />
      {cpuPercent}%
    </span>
    <span class="flex items-center gap-1">
      <HardDrive class="h-3 w-3" />
      {memoryPercent}%
    </span>
  </div>
{/if}
