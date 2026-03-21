<script lang="ts">
  import AppConfigButton from "../dialogs/AppConfigButton.svelte";
  import NotebookMenuDropdown from "./NotebookMenuDropdown.svelte";
  import ShutdownButton from "../dialogs/ShutdownButton.svelte";

  interface Props {
    connectionState: string;
    onExport?: () => void;
    onNewNotebook?: () => void;
    onDuplicate?: () => void;
    onShareStatic?: () => void;
    onSettings?: () => void;
    version?: string;
  }

  let {
    connectionState,
    onExport,
    onNewNotebook,
    onDuplicate,
    onShareStatic,
    onSettings,
    version = "0.21.0"
  }: Props = $props();
</script>

{#if connectionState !== "CLOSED"}
  <div class="absolute top-3 right-5 m-0 flex items-center gap-2 min-h-[28px] print:hidden pointer-events-auto z-30">
    <NotebookMenuDropdown
      {onExport}
      {onNewNotebook}
      {onDuplicate}
      {onShareStatic}
      {onSettings}
      {version}
    />
    <AppConfigButton />
    <ShutdownButton {connectionState} />
  </div>
{/if}
