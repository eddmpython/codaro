<script>
  import { brand } from "$lib/brand";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";
  import ProgressBar from "$lib/components/tools/ProgressBar.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";
  import PageThumbGrid from "$lib/components/tools/PageThumbGrid.svelte";

  /**
   * @typedef {Object} PageEntry
   * @property {number} pageIndex
   * @property {0 | 90 | 180 | 270} rotation
   */

  const SIZE_BLOCK = 200 * 1024 * 1024;

  /** @type {File | null} */
  let file = $state(null);
  /** @type {ArrayBuffer | null} */
  let pdfBuffer = $state(null);
  /** @type {import('pdfjs-dist').PDFDocumentProxy | null} */
  let pdfDoc = $state(null);
  /** @type {PageEntry[]} */
  let entries = $state([]);
  let pageCount = $state(0);
  /** @type {Set<number>} */
  let selected = $state(new Set());
  let lastSelectedSlot = $state(/** @type {number | null} */ (null));
  let loading = $state(false);
  let processing = $state(false);
  /** @type {Blob | null} */
  let result = $state(null);
  let error = $state(/** @type {string | null} */ (null));

  /** @param {File[]} added */
  async function onFiles(added) {
    const picked = added.find((f) => /\.pdf$/i.test(f.name));
    if (!picked) {
      error = "Please pick a .pdf file.";
      return;
    }
    if (picked.size >= SIZE_BLOCK) {
      error = `File is ${(picked.size / 1024 / 1024).toFixed(0)} MB — exceeds the 200 MB cap.`;
      return;
    }
    error = null;
    result = null;
    loading = true;
    file = picked;
    try {
      const { loadPdfForRender } = await import("$lib/tools/pdfReorder.js");
      const loaded = await loadPdfForRender(picked);
      pdfBuffer = loaded.buffer;
      pdfDoc = loaded.doc;
      pageCount = loaded.pageCount;
      entries = Array.from({ length: pageCount }, (_, i) => ({
        pageIndex: i,
        rotation: /** @type {0} */ (0),
      }));
      selected = new Set();
      lastSelectedSlot = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      file = null;
    } finally {
      loading = false;
    }
  }

  function reset() {
    file = null;
    pdfBuffer = null;
    pdfDoc = null;
    entries = [];
    pageCount = 0;
    selected = new Set();
    lastSelectedSlot = null;
    result = null;
    error = null;
  }

  /** @param {PageEntry[]} next */
  function onReorder(next) {
    const movedIndices = remapSelectionAfterReorder(entries, next, selected);
    entries = next;
    selected = movedIndices;
    result = null;
  }

  /**
   * @param {PageEntry[]} prev
   * @param {PageEntry[]} next
   * @param {Set<number>} prevSelected
   */
  function remapSelectionAfterReorder(prev, next, prevSelected) {
    const idToOldSlot = new Map();
    prev.forEach((e, i) => idToOldSlot.set(`${e.pageIndex}-${i}`, i));
    /** @type {Set<number>} */
    const result = new Set();
    next.forEach((e, newSlot) => {
      const oldSlotMatching = prev.findIndex((p, i) => p === e);
      if (oldSlotMatching >= 0 && prevSelected.has(oldSlotMatching)) {
        result.add(newSlot);
      }
    });
    return result;
  }

  /**
   * @param {number} slot
   * @param {"single" | "toggle" | "range"} mode
   */
  function onSelect(slot, mode) {
    const next = new Set(selected);
    if (mode === "range" && lastSelectedSlot !== null) {
      const start = Math.min(lastSelectedSlot, slot);
      const end = Math.max(lastSelectedSlot, slot);
      for (let i = start; i <= end; i++) next.add(i);
    } else if (mode === "toggle") {
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
    } else {
      next.clear();
      next.add(slot);
    }
    selected = next;
    lastSelectedSlot = slot;
  }

  function selectAll() {
    selected = new Set(entries.map((_, i) => i));
  }

  function clearSelection() {
    selected = new Set();
    lastSelectedSlot = null;
  }

  /** @param {-90 | 90 | 180} delta */
  function rotateSelected(delta) {
    if (selected.size === 0) return;
    const next = entries.map((e, i) => {
      if (!selected.has(i)) return e;
      const angle = ((e.rotation + delta) % 360 + 360) % 360;
      return { ...e, rotation: /** @type {0|90|180|270} */ (angle) };
    });
    entries = next;
    result = null;
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    entries = entries.filter((_, i) => !selected.has(i));
    selected = new Set();
    lastSelectedSlot = null;
    result = null;
  }

  function reverseAll() {
    entries = entries.slice().reverse();
    selected = new Set();
    lastSelectedSlot = null;
    result = null;
  }

  function restoreOriginal() {
    entries = Array.from({ length: pageCount }, (_, i) => ({
      pageIndex: i,
      rotation: /** @type {0} */ (0),
    }));
    selected = new Set();
    lastSelectedSlot = null;
    result = null;
  }

  async function process() {
    if (!pdfBuffer) return;
    if (entries.length === 0) {
      error = "All pages are removed. Restore some pages or reset.";
      return;
    }
    processing = true;
    error = null;
    result = null;
    try {
      const { exportPdfWithEntries } = await import("$lib/tools/pdfReorder.js");
      result = await exportPdfWithEntries(pdfBuffer, entries);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      processing = false;
    }
  }

  let isDirty = $derived(
    entries.length !== pageCount ||
    entries.some((e, i) => e.pageIndex !== i || e.rotation !== 0)
  );
  let removedCount = $derived(pageCount - entries.length);
  let hasSelection = $derived(selected.size > 0);
</script>

<svelte:head>
  <title>PDF page editor — {brand.name}</title>
  <meta name="description" content="Reorder, rotate, and remove PDF pages with a thumbnail grid. Drag to rearrange. Multi-select for batch rotate or delete. Runs entirely in your browser." />
  <link rel="canonical" href="{brand.siteUrl}/tools/pdf-reorder" />
</svelte:head>

<ToolShell
  title="PDF page editor"
  description="Reorder pages by dragging. Click the corner chip on any page to select. Shift-click to range-select. Then rotate, remove, or rearrange the selection. Export when done."
>
  {#if !file}
    <FileDropzone
      accept="application/pdf,.pdf"
      multiple={false}
      onfiles={onFiles}
      label="Drop a PDF here, or click to select"
      hint="One file. We'll show a draggable thumbnail grid you can edit."
    />
    {#if error}
      <p class="errorBox">{error}</p>
    {/if}
  {:else}
    <div class="sourceCard">
      <div class="sourceInfo">
        <div class="sourceName">{file.name}</div>
        <div class="sourceMeta">
          {pageCount} page{pageCount === 1 ? "" : "s"}
          · {(file.size / 1024 / 1024).toFixed(2)} MB
          {#if removedCount > 0}<span class="dirtyTag">· {removedCount} removed</span>{/if}
        </div>
      </div>
      <button class="ghostButton" type="button" onclick={reset}>Change file</button>
    </div>

    {#if loading}
      <ProgressBar label="Loading PDF…" />
    {:else if pdfDoc && entries.length > 0}
      <div class="editorToolbar" role="toolbar" aria-label="Page actions">
        <div class="selectionInfo">
          {#if hasSelection}
            <span class="badge">{selected.size} selected</span>
            <button class="toolBtn" type="button" onclick={clearSelection}>Clear</button>
          {:else}
            <span class="hintText">Click the corner chip to select pages</span>
          {/if}
        </div>
        <div class="batchActions">
          <button class="toolBtn" type="button" onclick={selectAll} disabled={entries.length === 0}>
            Select all
          </button>
          <span class="sep" aria-hidden="true"></span>
          <button class="toolBtn" type="button" onclick={() => rotateSelected(-90)} disabled={!hasSelection} title="Rotate left">
            ↺ 90°
          </button>
          <button class="toolBtn" type="button" onclick={() => rotateSelected(90)} disabled={!hasSelection} title="Rotate right">
            ↻ 90°
          </button>
          <button class="toolBtn" type="button" onclick={() => rotateSelected(180)} disabled={!hasSelection} title="Rotate 180°">
            ↻ 180°
          </button>
          <span class="sep" aria-hidden="true"></span>
          <button class="toolBtn destructive" type="button" onclick={deleteSelected} disabled={!hasSelection}>
            Remove
          </button>
          <span class="sep" aria-hidden="true"></span>
          <button class="toolBtn" type="button" onclick={reverseAll} disabled={entries.length < 2}>
            Reverse all
          </button>
          <button class="toolBtn" type="button" onclick={restoreOriginal} disabled={!isDirty}>
            Restore
          </button>
        </div>
      </div>

      <PageThumbGrid doc={pdfDoc} {entries} {selected} onreorder={onReorder} onselect={onSelect} />
    {:else if entries.length === 0}
      <div class="emptyEditor">
        <p>All pages removed.</p>
        <button class="ghostButton" type="button" onclick={restoreOriginal}>Restore all pages</button>
      </div>
    {/if}

    {#if error}
      <p class="errorBox">{error}</p>
    {/if}

    {#if processing}
      <ProgressBar label="Building edited PDF…" />
    {/if}

    <div class="actions">
      <button
        class="primaryButton"
        type="button"
        onclick={process}
        disabled={processing || entries.length === 0 || !isDirty}
      >
        {processing ? "Building…" : isDirty ? "Export edited PDF" : "No changes yet"}
      </button>
      <button class="ghostButton" type="button" onclick={reset} disabled={processing}>
        Reset
      </button>
    </div>

    {#if result}
      <DownloadButton
        blob={result}
        filename="{file.name.replace(/\.pdf$/i, '')}__edited.pdf"
        label="Download edited PDF"
      />
    {/if}
  {/if}
</ToolShell>

<style>
  .sourceCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .sourceName {
    font-weight: 500;
  }

  .sourceMeta {
    color: var(--text-soft);
    font-size: 0.85rem;
    margin-top: 2px;
  }

  .dirtyTag {
    color: var(--brand-accent);
    margin-left: 4px;
  }

  .editorToolbar {
    position: sticky;
    top: 8px;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--surface) 92%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .selectionInfo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .hintText {
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  .batchActions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .sep {
    width: 1px;
    height: 18px;
    background: var(--border);
    margin: 0 4px;
  }

  .toolBtn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.15s ease;
  }

  .toolBtn:hover:not(:disabled) {
    color: var(--text);
    background: var(--surface-muted);
    border-color: var(--border);
  }

  .toolBtn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .toolBtn.destructive:not(:disabled):hover {
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.08);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--brand-accent);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .emptyEditor {
    display: grid;
    gap: 12px;
    padding: 32px;
    place-items: center;
    border: 1.5px dashed var(--border-strong);
    border-radius: var(--radius);
    color: var(--text-muted);
  }

  .actions {
    display: inline-flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .errorBox {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid #ef4444;
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
    border-radius: var(--radius-sm);
    font-size: 0.92rem;
  }
</style>
