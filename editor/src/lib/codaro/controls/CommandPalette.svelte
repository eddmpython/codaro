<script lang="ts">
  import { Search } from "lucide-svelte";

  interface CommandItem {
    label: string;
    group: string;
    shortcut?: string;
    disabled?: boolean;
    keywords?: string[];
    handle: () => void;
  }

  interface Props {
    open?: boolean;
    items?: CommandItem[];
    onClose?: () => void;
  }

  let {
    open = false,
    items = [],
    onClose = () => {}
  }: Props = $props();

  let query = $state("");
  let selectedIndex = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();

  function smartMatch(text: string, search: string): boolean {
    if (!search) {
      return true;
    }
    const lower = text.toLowerCase();
    const terms = search.toLowerCase().split(/\s+/);
    return terms.every((term) => lower.includes(term));
  }

  let filtered = $derived(
    items.filter((item) => {
      if (!query) {
        return true;
      }
      const searchable = [item.label, ...(item.keywords || [])].join(" ");
      return smartMatch(searchable, query);
    })
  );

  let groups = $derived(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const group = item.group || "Commands";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(item);
    }
    return map;
  });

  let flatItems = $derived(filtered.filter((item) => !item.disabled));

  $effect(() => {
    if (open && inputEl) {
      requestAnimationFrame(() => inputEl?.focus());
    }
    if (open) {
      query = "";
      selectedIndex = 0;
    }
  });

  $effect(() => {
    if (selectedIndex >= flatItems.length) {
      selectedIndex = Math.max(0, flatItems.length - 1);
    }
  });

  function handleKeydown(e: KeyboardEvent): void {
    if (!flatItems.length) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % flatItems.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + flatItems.length) % flatItems.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[selectedIndex];
      if (item) {
        onClose();
        requestAnimationFrame(() => item.handle());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  function selectItem(item: CommandItem): void {
    onClose();
    requestAnimationFrame(() => item.handle());
  }

  function handleItemKeydown(e: KeyboardEvent, item: CommandItem): void {
    if (item.disabled) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectItem(item);
    }
  }

  function handleBackdropClick(): void {
    onClose();
  }

  function handleGlobalKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (open) {
        onClose();
      }
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if open}
  <div class="commandOverlay" role="presentation" onclick={handleBackdropClick}>
    <div
      class="commandDialog overflow-hidden p-0 shadow-2xl"
      role="dialog"
      aria-label="Command palette"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={handleKeydown}
    >
      <div class="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          bind:this={inputEl}
          bind:value={query}
          class="placeholder:text-foreground-muted flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Type to search..."
          cmdk-input=""
        />
      </div>

      <div class="max-h-[300px] overflow-y-auto overflow-x-hidden" cmdk-list="">
        {#if filtered.length === 0}
          <div class="py-6 text-center text-sm" cmdk-empty="">No results found.</div>
        {:else}
          {#each [...groups().entries()] as [groupName, groupItems]}
            <div class="overflow-hidden p-1 text-foreground" cmdk-group="">
              <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground" cmdk-group-heading="">
                {groupName}
              </div>
              {#each groupItems as item}
                {@const itemIndex = flatItems.indexOf(item)}
                <div
                  class="relative flex cursor-default select-none items-center rounded-sm px-2 py-3 text-sm outline-hidden"
                  class:bg-accent={itemIndex === selectedIndex}
                  class:text-accent-foreground={itemIndex === selectedIndex}
                  class:opacity-50={item.disabled}
                  class:pointer-events-none={item.disabled}
                  cmdk-item=""
                  data-disabled={item.disabled || false}
                  role="option"
                  aria-selected={itemIndex === selectedIndex}
                  tabindex={item.disabled ? -1 : itemIndex === selectedIndex ? 0 : -1}
                  onclick={() => !item.disabled && selectItem(item)}
                  onkeydown={(e) => handleItemKeydown(e, item)}
                  onmouseenter={() => { if (!item.disabled) selectedIndex = itemIndex; }}
                >
                  <span>{item.label}</span>
                  {#if item.shortcut}
                    <span class="ml-auto text-xs tracking-widest text-muted-foreground">
                      {item.shortcut}
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .commandOverlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 20vh;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .commandDialog {
    width: 100%;
    max-width: 500px;
    border-radius: 0.75rem;
    border: 1px solid var(--border, hsl(240 5.9% 90%));
    background: var(--popover, hsl(0 0% 100%));
    color: var(--popover-foreground, hsl(240 10% 3.9%));
  }
</style>
