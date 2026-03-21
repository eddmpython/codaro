<script lang="ts">
  import { FileCode2 } from "lucide-svelte";

  interface Props {
    connected?: boolean;
  }
  let { connected = false }: Props = $props();
</script>

<div
  class="flex items-center p-2 text-sm shadow-inset font-mono rounded h-full cursor-pointer hover:bg-(--sage-3)"
  data-testid="footer-lsp-status"
  title={connected ? "LSP: Connected" : "LSP: Disconnected"}
>
  <FileCode2 class="w-4 h-4 {connected ? 'text-(--grass-9)' : 'text-muted-foreground'}" />
</div>
