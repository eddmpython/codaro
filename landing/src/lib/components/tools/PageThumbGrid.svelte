<script>
  import { onDestroy, untrack } from "svelte";

  /**
   * @typedef {Object} PageEntry
   * @property {number} pageIndex
   * @property {0 | 90 | 180 | 270} rotation
   *
   * @typedef {Object} Props
   * @property {import('pdfjs-dist').PDFDocumentProxy | null} doc
   * @property {PageEntry[]} entries
   * @property {Set<number>} selected
   * @property {(next: PageEntry[]) => void} onreorder
   * @property {(slot: number, mode: "single" | "toggle" | "range") => void} onselect
   * @property {number} [scale]
   */

  /** @type {Props} */
  let { doc, entries, selected, onreorder, onselect, scale = 0.32 } = $props();

  /** @type {Map<number, HTMLCanvasElement>} */
  const canvasByPage = new Map();
  /** @type {Map<number, { cancel: () => void }>} */
  const renderTasksByPage = new Map();
  /** @type {Set<number>} */
  let renderedPages = $state(new Set());

  /** @type {IntersectionObserver | null} */
  let observer = null;

  let draggingSlot = $state(/** @type {number | null} */ (null));
  let dropPosition = $state(/** @type {number | null} */ (null));
  let dropAfter = $state(false);

  $effect(() => {
    if (!doc) return;
    untrack(() => setupObserver());
  });

  function setupObserver() {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (intersected) => {
        for (const entry of intersected) {
          if (entry.isIntersecting) {
            const target = /** @type {HTMLElement} */ (entry.target);
            const pageStr = target.dataset.page;
            if (pageStr === undefined) continue;
            const page = Number.parseInt(pageStr, 10);
            void renderPage(page);
          }
        }
      },
      { rootMargin: "300px" }
    );
  }

  /** @param {number} pageIndex */
  async function renderPage(pageIndex) {
    if (!doc) return;
    if (renderedPages.has(pageIndex)) return;
    const canvas = canvasByPage.get(pageIndex);
    if (!canvas) return;
    if (renderTasksByPage.has(pageIndex)) return;
    try {
      const { renderPageThumb } = await import("$lib/tools/pdfReorder.js");
      const task = await renderPageThumb(doc, pageIndex + 1, canvas, scale);
      renderTasksByPage.set(pageIndex, task);
      renderedPages = new Set([...renderedPages, pageIndex]);
    } catch (err) {
      if (err && typeof err === "object" && "name" in err && err.name === "RenderingCancelledException") return;
      console.warn(`Thumbnail render failed for page ${pageIndex + 1}`, err);
    }
  }

  /**
   * @param {Element} node
   * @param {number} pageIndex
   */
  function observeCard(node, pageIndex) {
    if (!(node instanceof HTMLElement)) return;
    const canvas = node.querySelector("canvas");
    if (canvas instanceof HTMLCanvasElement) canvasByPage.set(pageIndex, canvas);
    observer?.observe(node);
    return {
      destroy() {
        observer?.unobserve(node);
        canvasByPage.delete(pageIndex);
        renderTasksByPage.get(pageIndex)?.cancel?.();
        renderTasksByPage.delete(pageIndex);
      },
    };
  }

  onDestroy(() => {
    observer?.disconnect();
    for (const t of renderTasksByPage.values()) t.cancel?.();
    renderTasksByPage.clear();
    canvasByPage.clear();
  });

  /** @param {DragEvent} e @param {number} slot */
  function onDragStart(e, slot) {
    draggingSlot = slot;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(slot));
    }
  }

  /** @param {DragEvent} e @param {number} slot */
  function onDragOver(e, slot) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const target = /** @type {HTMLElement | null} */ (e.currentTarget);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    dropAfter = x > rect.width / 2;
    dropPosition = slot;
  }

  function onDragLeave() {
    /* let onDragOver in another card update; clear in onDragEnd */
  }

  /** @param {DragEvent} e */
  function onDrop(e) {
    e.preventDefault();
    if (draggingSlot === null || dropPosition === null) {
      reset();
      return;
    }
    let target = dropAfter ? dropPosition + 1 : dropPosition;
    const moving = entries[draggingSlot];
    const next = entries.slice();
    next.splice(draggingSlot, 1);
    if (target > draggingSlot) target -= 1;
    next.splice(target, 0, moving);
    onreorder(next);
    reset();
  }

  function reset() {
    draggingSlot = null;
    dropPosition = null;
    dropAfter = false;
  }

  /** @param {MouseEvent} e @param {number} slot */
  function onSelectClick(e, slot) {
    e.stopPropagation();
    if (e.shiftKey) onselect(slot, "range");
    else if (e.metaKey || e.ctrlKey) onselect(slot, "toggle");
    else onselect(slot, "toggle");
  }

  /** @param {KeyboardEvent} e @param {number} slot */
  function onSelectKey(e, slot) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onselect(slot, "toggle");
    }
  }
</script>

<div class="thumbGrid" role="list" aria-label="PDF pages">
  {#each entries as entry, slot (slot + "-" + entry.pageIndex)}
    {@const isSelected = selected.has(slot)}
    {@const isDragging = draggingSlot === slot}
    {@const showLineBefore = dropPosition === slot && !dropAfter && draggingSlot !== slot}
    {@const showLineAfter = dropPosition === slot && dropAfter && draggingSlot !== slot}
    <div class="slotWrap">
      {#if showLineBefore}<span class="dropLine before" aria-hidden="true"></span>{/if}
      <div
        class="thumbCard"
        class:dragging={isDragging}
        class:selected={isSelected}
        role="listitem"
        data-page={entry.pageIndex}
        draggable="true"
        ondragstart={(/** @type {DragEvent} */ e) => onDragStart(e, slot)}
        ondragover={(/** @type {DragEvent} */ e) => onDragOver(e, slot)}
        ondragleave={onDragLeave}
        ondrop={(/** @type {DragEvent} */ e) => onDrop(e)}
        ondragend={reset}
        use:observeCard={entry.pageIndex}
      >
        <button
          type="button"
          class="selectChip"
          class:on={isSelected}
          aria-label={isSelected ? "Deselect page" : "Select page"}
          aria-pressed={isSelected}
          onclick={(/** @type {MouseEvent} */ e) => onSelectClick(e, slot)}
          onkeydown={(/** @type {KeyboardEvent} */ e) => onSelectKey(e, slot)}
        >
          {#if isSelected}✓{/if}
        </button>
        {#if entry.rotation !== 0}
          <span class="rotationBadge" aria-label="Rotated {entry.rotation} degrees">{entry.rotation}°</span>
        {/if}
        <div class="thumbCanvasWrap">
          <div class="canvasInner" style="transform: rotate({entry.rotation}deg);">
            <canvas></canvas>
            {#if !renderedPages.has(entry.pageIndex)}
              <div class="placeholder" aria-hidden="true"></div>
            {/if}
          </div>
        </div>
        <div class="thumbCaption">
          <span class="slot">#{slot + 1}</span>
          <span class="origin">p{entry.pageIndex + 1}</span>
        </div>
      </div>
      {#if showLineAfter}<span class="dropLine after" aria-hidden="true"></span>{/if}
    </div>
  {/each}
</div>

<style>
  .thumbGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  .slotWrap {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
  }

  .thumbCard {
    position: relative;
    width: 100%;
    display: grid;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    cursor: grab;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  }

  .thumbCard:hover {
    border-color: var(--border-strong);
  }

  .thumbCard.dragging {
    opacity: 0.35;
  }

  .thumbCard.selected {
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 1px var(--brand-accent), 0 4px 14px rgba(249, 115, 22, 0.15);
  }

  .selectChip {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 22px;
    height: 22px;
    padding: 0;
    border-radius: 999px;
    border: 1.5px solid var(--border-strong);
    background: rgba(15, 15, 17, 0.7);
    backdrop-filter: blur(6px);
    color: var(--primary-foreground);
    font-size: 0.78rem;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.15s ease;
    z-index: 2;
  }

  .selectChip:hover,
  .thumbCard:hover .selectChip {
    border-color: var(--brand-accent);
    color: var(--brand-accent);
  }

  .selectChip.on {
    background: var(--brand-accent);
    border-color: var(--brand-accent);
    color: var(--primary-foreground);
  }

  .selectChip.on:hover {
    color: var(--primary-foreground);
  }

  .rotationBadge {
    position: absolute;
    top: 6px;
    right: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(15, 15, 17, 0.78);
    backdrop-filter: blur(6px);
    color: var(--brand-accent);
    font-size: 0.72rem;
    font-weight: 600;
    z-index: 2;
    pointer-events: none;
  }

  .thumbCanvasWrap {
    position: relative;
    display: grid;
    place-items: center;
    background: var(--card);
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 0.707;
  }

  .canvasInner {
    transition: transform 0.25s ease;
    transform-origin: center;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .canvasInner canvas {
    max-width: 100%;
    max-height: 100%;
    height: auto;
    display: block;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .thumbCaption {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--text-soft);
  }

  .slot {
    color: var(--brand-accent);
    font-weight: 600;
  }

  .dropLine {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: 3px;
    background: var(--brand-accent);
    border-radius: 999px;
    pointer-events: none;
    box-shadow: 0 0 12px rgba(251, 146, 60, 0.6);
    animation: dropLineIn 0.12s ease-out;
  }

  .dropLine.before {
    left: -8px;
  }

  .dropLine.after {
    right: -8px;
  }

  @keyframes dropLineIn {
    from { opacity: 0; transform: scaleY(0.4); }
    to { opacity: 1; transform: scaleY(1); }
  }
</style>
