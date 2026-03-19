<script lang="ts">
  import { Zap, ChevronDown } from "lucide-svelte";

  interface Props {
    onToggle?: () => void;
    isAutorun?: boolean;
  }

  let {
    onToggle = () => {},
    isAutorun = true
  }: Props = $props();
</script>

<button
  class="flex items-center gap-1 p-2 text-sm font-mono rounded hover:bg-(--sage-3)"
  data-testid="footer-runtime-settings"
  data-state="closed"
  onclick={onToggle}
  title={isAutorun ? "Autorun enabled" : "Autorun disabled"}
>
  <Zap size={16} class={isAutorun ? "text-amber-500" : "text-muted-foreground"} />
  <ChevronDown size={14} />
</button>
