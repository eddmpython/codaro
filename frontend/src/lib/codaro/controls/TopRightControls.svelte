<script lang="ts">
  import { PowerOff, Settings } from "lucide-svelte";

  interface Props {
    connectionState: string;
  }

  let { connectionState }: Props = $props();

  const floatingButtonBase =
    "flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm mo-button";
  const floatingCircle = `${floatingButtonBase} rounded-full px-2 py-2`;
</script>

{#if connectionState !== "CLOSED"}
  <div class="absolute top-3 right-5 m-0 flex items-center gap-2 min-h-[28px] print:hidden pointer-events-auto z-30">
    <button
      class="{floatingCircle} gray"
      data-state="closed"
      aria-label="App config"
    >
      <Settings size={14} strokeWidth={1.5} />
    </button>
    <button
      class="{floatingCircle} gray"
      data-state="closed"
      aria-label="Shutdown"
    >
      <PowerOff size={14} strokeWidth={1.5} />
    </button>
  </div>
{/if}
