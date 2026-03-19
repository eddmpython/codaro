<script lang="ts">
  import {
    Command,
    Keyboard,
    LayoutTemplate,
    Play,
    Save,
    Square
  } from "lucide-svelte";

  interface Props {
    connectionState: string;
    engineStatus: string;
    dirty: boolean;
    saveButtonColor: string;
    onSave: () => void;
    onLaunchApp: () => void;
    onRunAll: () => void;
    onOpenCommandPalette?: () => void;
    onOpenKeyboardShortcuts?: () => void;
    onInterrupt?: () => void;
  }

  let {
    connectionState,
    engineStatus,
    dirty,
    saveButtonColor,
    onSave,
    onLaunchApp,
    onRunAll,
    onOpenCommandPalette = () => {},
    onOpenKeyboardShortcuts = () => {},
    onInterrupt = () => {}
  }: Props = $props();

  const floatingButtonBase =
    "flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm mo-button";
  const floatingCircle = `${floatingButtonBase} rounded-full px-2 py-2`;
  const floatingRect = `${floatingButtonBase} rounded px-3 py-2`;
</script>

<div class="absolute bottom-5 right-5 flex flex-col gap-2 items-center print:hidden pointer-events-auto z-30">
  <button
    class="{floatingRect} {saveButtonColor}"
    id="save-button"
    aria-label="Save"
    data-state="closed"
    onclick={onSave}
  >
    <Save size={18} strokeWidth={1.5} />
  </button>

  <button
    class="{floatingRect} hint-green"
    data-testid="hide-code-button"
    id="preview-button"
    data-state="closed"
    onclick={onLaunchApp}
  >
    <LayoutTemplate size={18} strokeWidth={1.5} />
  </button>

  <button
    class="{floatingRect} hint-green"
    data-testid="command-palette-button"
    data-state="closed"
    onclick={onOpenCommandPalette}
  >
    <Command size={18} strokeWidth={1.5} />
  </button>

  <button
    class="{floatingRect} hint-green"
    data-state="closed"
    aria-label="Keyboard shortcuts"
    onclick={onOpenKeyboardShortcuts}
  >
    <Keyboard size={18} strokeWidth={1.5} />
  </button>

  <div></div>

  {#if connectionState !== "CLOSED"}
    <div class="flex flex-col gap-2 items-center">
      <button
        class="{floatingCircle} {engineStatus === 'running' ? 'yellow' : 'disabled'} {engineStatus !== 'running' ? 'inactive-button active:shadow-xs-solid' : ''}"
        data-testid="interrupt-button"
        aria-label="Interrupt"
        onclick={onInterrupt}
      >
        <Square size={16} strokeWidth={1.5} />
      </button>

      <button
        class="{floatingCircle} {dirty ? 'yellow' : 'disabled'} {!dirty ? 'inactive-button' : ''}"
        data-testid="run-button"
        aria-label="Run"
        onclick={onRunAll}
      >
        <Play size={16} strokeWidth={1.5} />
      </button>
    </div>
  {/if}
</div>
