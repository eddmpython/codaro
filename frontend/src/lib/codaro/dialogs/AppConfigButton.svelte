<script lang="ts">
  import { Settings } from "lucide-svelte";
  import AppConfigForm from "./AppConfigForm.svelte";
  import UserConfigDialog from "./UserConfigDialog.svelte";

  interface Props {
    showAppConfig?: boolean;
    disabled?: boolean;
  }
  let { showAppConfig = true, disabled = false }: Props = $props();

  let popoverOpen = $state(false);
  let userConfigOpen = $state(false);

  function togglePopover() {
    if (disabled) return;
    popoverOpen = !popoverOpen;
  }

  function openUserConfig() {
    popoverOpen = false;
    userConfigOpen = true;
  }
</script>

<div class="relative">
  <button
    class="flex items-center justify-center rounded-full h-[27px] w-[27px] border border-foreground/10 shadow-xs-solid active:shadow-none mo-button {disabled ? 'disabled' : 'hint-green'}"
    data-testid="app-config-button"
    aria-label="Config"
    onclick={togglePopover}
    {disabled}
  >
    <Settings size={14} strokeWidth={1.8} />
  </button>

  {#if popoverOpen && showAppConfig}
    <div
      class="absolute right-0 top-full mt-2 w-[650px] max-h-[80vh] overflow-auto bg-background border rounded-lg shadow-lg p-4 z-50"
      role="menu"
    >
      <AppConfigForm />

      <div class="h-px bg-border my-2"></div>

      <button
        class="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
        onclick={openUserConfig}
      >
        <Settings size={14} />
        User settings
      </button>
    </div>
  {/if}
</div>

<UserConfigDialog open={userConfigOpen} onClose={() => (userConfigOpen = false)} />
