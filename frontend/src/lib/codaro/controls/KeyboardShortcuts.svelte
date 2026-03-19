<script lang="ts">
  import { X } from "lucide-svelte";

  interface ShortcutEntry {
    action: string;
    name: string;
    key: string;
    group: string;
  }

  interface Props {
    open?: boolean;
    shortcuts?: ShortcutEntry[];
    onClose?: () => void;
  }

  let {
    open = false,
    shortcuts = [],
    onClose = () => {}
  }: Props = $props();

  let groups = $derived(() => {
    const map = new Map<string, ShortcutEntry[]>();
    for (const entry of shortcuts) {
      const group = entry.group || "Other";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(entry);
    }
    return map;
  });

  let groupNames = $derived([...groups().keys()]);
  let leftGroups = $derived(groupNames.filter((_, i) => i % 2 === 0));
  let rightGroups = $derived(groupNames.filter((_, i) => i % 2 === 1));

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  function handleBackdropClick(): void {
    onClose();
  }

  function renderKey(key: string): string {
    return key
      .replace("Cmd", "\u2318")
      .replace("Ctrl", "\u2303")
      .replace("Alt", "\u2325")
      .replace("Shift", "\u21E7")
      .replace("Enter", "\u21B5")
      .replace("Backspace", "\u232B")
      .replace("Delete", "\u2326")
      .replace("Escape", "Esc")
      .replace("ArrowUp", "\u2191")
      .replace("ArrowDown", "\u2193")
      .replace("ArrowLeft", "\u2190")
      .replace("ArrowRight", "\u2192");
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="shortcutsOverlay" role="presentation" onclick={handleBackdropClick}>
    <div
      class="shortcutsDialog"
      role="dialog"
      aria-label="Keyboard shortcuts"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="dialogHeader">
        <h2 class="text-lg font-semibold">Shortcuts</h2>
        <button class="closeBtn" onclick={onClose} aria-label="Close">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="flex flex-row gap-3">
        <div class="w-1/2">
          {#each leftGroups as group}
            <div class="mb-10 gap-2 flex flex-col">
              <h3 class="text-lg font-medium">{group}</h3>
              {#each groups().get(group) || [] as entry}
                <div class="grid grid-cols-[auto_2fr_3fr] gap-2 items-center">
                  <div class="w-3 h-3"></div>
                  <span class="justify-end text-xs font-mono tracking-widest text-muted-foreground text-right">
                    {renderKey(entry.key)}
                  </span>
                  <span class="text-sm">{entry.name.toLowerCase()}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>

        <div class="w-1/2">
          {#each rightGroups as group}
            <div class="mb-10 gap-2 flex flex-col">
              <h3 class="text-lg font-medium">{group}</h3>
              {#each groups().get(group) || [] as entry}
                <div class="grid grid-cols-[auto_2fr_3fr] gap-2 items-center">
                  <div class="w-3 h-3"></div>
                  <span class="justify-end text-xs font-mono tracking-widest text-muted-foreground text-right">
                    {renderKey(entry.key)}
                  </span>
                  <span class="text-sm">{entry.name.toLowerCase()}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .shortcutsOverlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .shortcutsDialog {
    width: 100%;
    max-width: 850px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    border-radius: 0.75rem;
    border: 1px solid var(--border, hsl(240 5.9% 90%));
    background: var(--background, hsl(0 0% 100%));
    color: var(--foreground, hsl(240 10% 3.9%));
  }

  .dialogHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .closeBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    color: var(--muted-foreground);
  }

  .closeBtn:hover {
    background: var(--accent, hsl(240 4.8% 95.9%));
  }
</style>
