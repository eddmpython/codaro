<script lang="ts">
  import { Braces } from "lucide-svelte";

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
  data-testid="footer-copilot"
  onclick={onToggle}
  title={enabled ? "Copilot enabled" : "Copilot disabled"}
>
  <Braces class="h-3.5 w-3.5 {enabled ? 'text-foreground' : 'opacity-40'}" />
</button>
