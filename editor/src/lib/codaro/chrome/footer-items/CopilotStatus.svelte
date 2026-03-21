<script lang="ts">
  import { Github } from "lucide-svelte";

  interface Props {
    enabled?: boolean;
    onToggle?: () => void;
  }

  let {
    enabled = false,
    onToggle = () => {}
  }: Props = $props();
</script>

<button
  class="flex items-center gap-1 p-2 text-sm font-mono rounded hover:bg-(--sage-3)"
  data-testid="footer-copilot-status"
  onclick={onToggle}
  title={enabled ? "Copilot enabled" : "Copilot disabled"}
>
  <Github class="w-4 h-4 {enabled ? 'text-foreground' : 'opacity-40'}" />
</button>
