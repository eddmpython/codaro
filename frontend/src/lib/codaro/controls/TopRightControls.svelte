<script lang="ts">
  import { BookOpen, Code, FileText, Cog, ChevronDown } from "lucide-svelte";
  import AppConfigButton from "../dialogs/AppConfigButton.svelte";
  import NotebookMenuDropdown from "./NotebookMenuDropdown.svelte";
  import ShutdownButton from "../dialogs/ShutdownButton.svelte";
  import {
    getActiveMode,
    setActiveMode,
    getAllModes,
    getModeLabel,
    type AppMode,
  } from "../modes/modeStore.svelte";

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

  let modeMenuOpen = $state(false);

  const modeIcons: Record<AppMode, typeof Code> = {
    learning: BookOpen,
    notebook: Code,
    report: FileText,
    automation: Cog,
  };

  function selectMode(mode: AppMode) {
    setActiveMode(mode);
    modeMenuOpen = false;
  }
</script>

{#if connectionState !== "CLOSED"}
  <div class="absolute top-3 right-5 m-0 flex items-center gap-2 min-h-[28px] print:hidden pointer-events-auto z-30">
    <div class="mode-select-wrapper">
      <button
        class="mode-select-trigger"
        onclick={() => modeMenuOpen = !modeMenuOpen}
        aria-haspopup="listbox"
        aria-expanded={modeMenuOpen}
      >
        <svelte:component this={modeIcons[getActiveMode()]} size={14} />
        <span>{getModeLabel(getActiveMode())}</span>
        <ChevronDown size={12} />
      </button>
      {#if modeMenuOpen}
        <div class="mode-select-dropdown" role="listbox">
          {#each getAllModes() as mode}
            <button
              class="mode-select-option"
              class:active={getActiveMode() === mode}
              role="option"
              aria-selected={getActiveMode() === mode}
              onclick={() => selectMode(mode)}
            >
              <svelte:component this={modeIcons[mode]} size={14} />
              <span>{getModeLabel(mode)}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
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

<style>
  .mode-select-wrapper {
    position: relative;
  }

  .mode-select-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mode-select-trigger:hover {
    color: hsl(var(--foreground));
    border-color: hsl(var(--border));
    background: hsl(var(--muted));
  }

  .mode-select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 160px;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    box-shadow: 0 4px 16px hsl(0 0% 0% / 0.12);
    z-index: 50;
  }

  .mode-select-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s;
  }

  .mode-select-option:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  .mode-select-option.active {
    background: hsl(var(--accent) / 0.08);
    color: hsl(var(--accent));
  }
</style>
