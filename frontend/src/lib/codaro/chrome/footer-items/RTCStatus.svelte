<script lang="ts">
  import { Users } from "lucide-svelte";

  interface Props {
    connectedUsers?: number;
    enabled?: boolean;
  }

  let {
    connectedUsers = 0,
    enabled = false
  }: Props = $props();
</script>

{#if enabled}
  <div
    class="flex items-center gap-1 p-2 text-xs font-mono text-muted-foreground"
    data-testid="footer-rtc-status"
  >
    <Users class="h-3.5 w-3.5" />
    <span>{connectedUsers}</span>
  </div>
{/if}
