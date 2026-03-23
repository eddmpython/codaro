<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    blockIds: string[];
    children: Snippet<[{ blockId: string; visible: boolean }]>;
    overscan?: number;
  }

  let { blockIds, children, overscan = 3 }: Props = $props();

  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let visibleSet = $state(new Set<string>());
  let heightCache = $state(new Map<string, number>());
  let observer: IntersectionObserver | null = null;

  const STORAGE_KEY = "codaro:cell-heights";
  const DEFAULT_HEIGHT = 120;

  function loadCachedHeights(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        heightCache = new Map(Object.entries(parsed));
      }
    } catch {
      heightCache = new Map();
    }
  }

  function saveCachedHeights(): void {
    try {
      const obj: Record<string, number> = {};
      for (const [k, v] of heightCache) {
        obj[k] = v;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      /* noop */
    }
  }

  function getHeight(blockId: string): number {
    return heightCache.get(blockId) ?? DEFAULT_HEIGHT;
  }

  function measureCell(blockId: string, el: HTMLElement): void {
    const h = el.getBoundingClientRect().height;
    if (h > 0 && h !== heightCache.get(blockId)) {
      heightCache.set(blockId, h);
      heightCache = new Map(heightCache);
    }
  }

  onMount(() => {
    loadCachedHeights();

    const rootMargin = `${overscan * DEFAULT_HEIGHT}px 0px`;
    observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const blockId = (entry.target as HTMLElement).dataset.virtualId;
          if (!blockId) continue;

          if (entry.isIntersecting) {
            if (!visibleSet.has(blockId)) {
              visibleSet.add(blockId);
              changed = true;
            }
          } else {
            if (visibleSet.has(blockId)) {
              measureCell(blockId, entry.target as HTMLElement);
              visibleSet.delete(blockId);
              changed = true;
            }
          }
        }
        if (changed) {
          visibleSet = new Set(visibleSet);
        }
      },
      { rootMargin, threshold: 0 }
    );

    return () => {
      observer?.disconnect();
      saveCachedHeights();
    };
  });

  function observeAction(node: HTMLElement) {
    observer?.observe(node);
    const blockId = node.dataset.virtualId;
    if (blockId) {
      visibleSet.add(blockId);
      visibleSet = new Set(visibleSet);
    }
    return {
      destroy() {
        observer?.unobserve(node);
      }
    };
  }
</script>

<div bind:this={containerEl} class="virtual-cell-list">
  {#each blockIds as blockId (blockId)}
    {@const isVisible = visibleSet.has(blockId)}
    <div
      data-virtual-id={blockId}
      use:observeAction
    >
      {#if isVisible}
        {@render children({ blockId, visible: true })}
      {:else}
        <div
          class="virtual-placeholder"
          style="height: {getHeight(blockId)}px;"
          aria-hidden="true"
        ></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .virtual-cell-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .virtual-placeholder {
    border-radius: 10px;
    background: color-mix(in srgb, var(--background) 95%, var(--border));
  }
</style>
