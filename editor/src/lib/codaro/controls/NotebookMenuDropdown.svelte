<script lang="ts">
  import { Menu, FileDown, FilePlus, Copy, Share2, Settings } from "lucide-svelte";

  interface MenuItem {
    label: string;
    icon?: any;
    shortcut?: string;
    action?: () => void;
    separator?: boolean;
    disabled?: boolean;
    submenu?: MenuItem[];
  }

  interface Props {
    onExport?: () => void;
    onNewNotebook?: () => void;
    onDuplicate?: () => void;
    onShareStatic?: () => void;
    onSettings?: () => void;
    version?: string;
  }

  let {
    onExport,
    onNewNotebook,
    onDuplicate,
    onShareStatic,
    onSettings,
    version = "0.21.0",
  }: Props = $props();

  let open = $state(false);
  let menuRef: HTMLDivElement | undefined = $state();

  const menuItems: MenuItem[] = $derived([
    { label: "New notebook", icon: FilePlus, action: onNewNotebook },
    { label: "Duplicate notebook", icon: Copy, action: onDuplicate },
    { separator: true, label: "" },
    {
      label: "Export",
      icon: FileDown,
      submenu: [
        { label: "Export as .py", action: onExport },
        { label: "Export as .ipynb", action: onExport },
      ],
    },
    { separator: true, label: "" },
    { label: "Share static notebook", icon: Share2, action: onShareStatic },
    { separator: true, label: "" },
    { label: "Settings", icon: Settings, action: onSettings },
  ]);

  let activeSubmenuLabel = $state<string | null>(null);

  function toggle() {
    open = !open;
    activeSubmenuLabel = null;
  }

  function handleItemClick(item: MenuItem) {
    if (item.disabled) return;
    if (item.submenu) {
      activeSubmenuLabel = activeSubmenuLabel === item.label ? null : item.label;
      return;
    }
    item.action?.();
    open = false;
    activeSubmenuLabel = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
      activeSubmenuLabel = null;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      open = false;
      activeSubmenuLabel = null;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="relative" bind:this={menuRef}>
  <button
    class="flex items-center justify-center rounded-full h-[27px] w-[27px] border border-foreground/10 shadow-xs-solid active:shadow-none mo-button hint-green"
    aria-label="Actions"
    title="Actions"
    onclick={toggle}
    data-testid="notebook-menu-dropdown-trigger"
  >
    <Menu size={14} strokeWidth={1.5} />
  </button>

  {#if open}
    <div
      class="absolute right-0 top-full mt-1 w-[240px] bg-background border rounded-md shadow-lg py-1 z-50"
      role="menu"
    >
      {#each menuItems as item}
        {#if item.separator}
          <div class="h-px bg-border my-1"></div>
        {:else}
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer w-full text-left"
            class:opacity-50={item.disabled}
            class:cursor-not-allowed={item.disabled}
            role="menuitem"
            data-testid="notebook-menu-dropdown-{item.label.toLowerCase().replace(/\s+/g, '-')}"
            onclick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {#if item.icon}
              <item.icon size={14} strokeWidth={1.5} class="shrink-0" />
            {/if}
            <span class="flex-1">{item.label}</span>
            {#if item.shortcut}
              <span class="text-xs text-muted-foreground">{item.shortcut}</span>
            {/if}
          </button>

          {#if item.submenu && activeSubmenuLabel === item.label}
            {#each item.submenu as sub}
              <button
                class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer w-full text-left pl-9"
                role="menuitem"
                data-testid="notebook-menu-dropdown-{sub.label.toLowerCase().replace(/\s+/g, '-')}"
                onclick={() => { sub.action?.(); open = false; activeSubmenuLabel = null; }}
              >
                <span class="flex-1">{sub.label}</span>
              </button>
            {/each}
          {/if}
        {/if}
      {/each}

      <div class="h-px bg-border my-1"></div>
      <div class="px-3 py-1.5 text-xs text-muted-foreground border-t">
        Codaro v{version}
      </div>
    </div>
  {/if}
</div>
