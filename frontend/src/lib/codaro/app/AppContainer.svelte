<script lang="ts">
  import type { Snippet } from "svelte";
  import { Unlink } from "lucide-svelte";

  interface Props {
    connectionState: string;
    children: Snippet;
  }

  let { connectionState, children }: Props = $props();

  let isDisconnected = $derived(connectionState === "CLOSED");
</script>

<div
  class="relative h-full"
  id="app"
  data-panel-group-id="marimo:chrome:v1:l1"
  data-panel=""
  data-panel-id="app"
>
  {#if isDisconnected}
    <div class="z-50 top-4 left-4 absolute">
      <div class="print:hidden pointer-events-auto hover:cursor-pointer" data-state="closed">
        <Unlink class="w-[25px] h-[25px] text-(--red-11)" />
      </div>
    </div>
  {/if}

  <div class="noise"></div>
  <div class="disconnected-gradient"></div>

  <div
    id="App"
    data-config-width="compact"
    data-connection-state={connectionState}
    class="mathjax_ignore bg-background w-full h-full text-textColor flex flex-col overflow-y-auto overflow-x-hidden print:height-fit {isDisconnected ? 'disconnected' : ''}"
  >
    {@render children()}
  </div>
</div>
