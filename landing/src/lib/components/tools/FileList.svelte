<script>
  /**
   * @typedef {Object} ItemMeta
   * @property {string} [error]
   * @property {string} [info]
   * @property {string} [progress]
   *
   * @typedef {Object} Props
   * @property {File[]} files
   * @property {(files: File[]) => void} onreorder
   * @property {(index: number) => void} onremove
   * @property {(files: File[]) => void} [onadd]
   * @property {string} [accept]
   * @property {Record<number, ItemMeta>} [meta]
   * @property {number} [activeIndex]
   */

  /** @type {Props} */
  let { files, onreorder, onremove, onadd, accept, meta = {}, activeIndex } = $props();

  let draggingIndex = $state(/** @type {number | null} */ (null));
  let dropPosition = $state(/** @type {number | null} */ (null));
  let dropAfter = $state(false);
  let listDragOver = $state(false);

  /** @param {number} bytes */
  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** @param {DragEvent} e @param {number} index */
  function onDragStart(e, index) {
    draggingIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
  }

  /** @param {DragEvent} e @param {number} index */
  function onRowDragOver(e, index) {
    if (draggingIndex === null) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const target = /** @type {HTMLElement | null} */ (e.currentTarget);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    dropAfter = y > rect.height / 2;
    dropPosition = index;
  }

  /** @param {DragEvent} e */
  function onRowDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIndex === null || dropPosition === null) {
      reset();
      return;
    }
    let target = dropAfter ? dropPosition + 1 : dropPosition;
    const next = files.slice();
    const [moved] = next.splice(draggingIndex, 1);
    if (target > draggingIndex) target -= 1;
    next.splice(target, 0, moved);
    onreorder(next);
    reset();
  }

  function reset() {
    draggingIndex = null;
    dropPosition = null;
    dropAfter = false;
    listDragOver = false;
  }

  /** @param {DragEvent} e */
  function onListDragOver(e) {
    if (draggingIndex !== null) return;
    if (!onadd) return;
    if (!e.dataTransfer || !Array.from(e.dataTransfer.items).some((it) => it.kind === "file")) return;
    e.preventDefault();
    listDragOver = true;
  }

  function onListDragLeave() {
    listDragOver = false;
  }

  /** @param {DragEvent} e */
  function onListDrop(e) {
    if (draggingIndex !== null) return;
    if (!onadd || !e.dataTransfer) return;
    e.preventDefault();
    listDragOver = false;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) onadd(dropped);
  }

  /** @param {number} index */
  function moveUp(index) {
    if (index <= 0) return;
    const next = files.slice();
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onreorder(next);
  }

  /** @param {number} index */
  function moveDown(index) {
    if (index >= files.length - 1) return;
    const next = files.slice();
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    onreorder(next);
  }
</script>

<ul
  class="fileList"
  class:listDropTarget={listDragOver}
  ondragover={onListDragOver}
  ondragleave={onListDragLeave}
  ondrop={onListDrop}
>
  {#each files as file, index (`${file.name}-${file.size}-${index}`)}
    {@const isDragging = draggingIndex === index}
    {@const showLineBefore = dropPosition === index && !dropAfter && draggingIndex !== index}
    {@const showLineAfter = dropPosition === index && dropAfter && draggingIndex !== index}
    {@const isActive = activeIndex === index}
    <li
      class="fileRow"
      class:dragging={isDragging}
      class:active={isActive}
      class:hasError={meta[index]?.error}
      draggable="true"
      ondragstart={(/** @type {DragEvent} */ e) => onDragStart(e, index)}
      ondragover={(/** @type {DragEvent} */ e) => onRowDragOver(e, index)}
      ondrop={(/** @type {DragEvent} */ e) => onRowDrop(e)}
      ondragend={reset}
    >
      {#if showLineBefore}<span class="dropLine before" aria-hidden="true"></span>{/if}
      {#if showLineAfter}<span class="dropLine after" aria-hidden="true"></span>{/if}
      <span class="grip" aria-hidden="true">⋮⋮</span>
      <div class="info">
        <div class="name" title={file.name}>{file.name}</div>
        <div class="meta">
          <span>{formatSize(file.size)}</span>
          {#if meta[index]?.info}
            <span class="infoNote">{meta[index]?.info}</span>
          {/if}
          {#if meta[index]?.progress}
            <span class="progressNote">{meta[index]?.progress}</span>
          {/if}
          {#if meta[index]?.error}
            <span class="errorNote">{meta[index]?.error}</span>
          {/if}
        </div>
      </div>
      <div class="actions">
        <button class="iconBtn" type="button" aria-label="Move up" onclick={() => moveUp(index)} disabled={index === 0}>↑</button>
        <button class="iconBtn" type="button" aria-label="Move down" onclick={() => moveDown(index)} disabled={index === files.length - 1}>↓</button>
        <button class="iconBtn" type="button" aria-label="Remove" onclick={() => onremove(index)}>✕</button>
      </div>
    </li>
  {/each}
  {#if onadd}
    <li class="addHint">
      <span aria-hidden="true">＋</span>
      Drop more {accept ? "matching" : ""} files anywhere on this list to add them
    </li>
  {/if}
</ul>

<style>
  .fileList {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
    border: 1px dashed transparent;
    border-radius: var(--radius);
    padding: 4px;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .fileList.listDropTarget {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .fileRow {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    transition: border-color 0.15s ease, opacity 0.15s ease;
  }

  .fileRow.dragging {
    opacity: 0.35;
  }

  .fileRow.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .fileRow.hasError {
    border-color: #ef4444;
  }

  .grip {
    cursor: grab;
    color: var(--text-soft);
    user-select: none;
    letter-spacing: -2px;
  }

  .info {
    min-width: 0;
  }

  .name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    font-size: 0.82rem;
    color: var(--text-soft);
    margin-top: 2px;
  }

  .infoNote {
    color: var(--accent);
  }

  .progressNote {
    color: var(--accent);
    font-weight: 500;
  }

  .errorNote {
    color: #ef4444;
  }

  .actions {
    display: inline-flex;
    gap: 4px;
  }

  .iconBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .iconBtn:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--border-strong);
    background: var(--surface-muted);
  }

  .iconBtn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .dropLine {
    position: absolute;
    left: 8px;
    right: 8px;
    height: 3px;
    background: var(--accent);
    border-radius: 999px;
    pointer-events: none;
    box-shadow: 0 0 12px rgba(251, 146, 60, 0.6);
    z-index: 1;
    animation: dropLineIn 0.12s ease-out;
  }

  .dropLine.before {
    top: -6px;
  }

  .dropLine.after {
    bottom: -6px;
  }

  @keyframes dropLineIn {
    from { opacity: 0; transform: scaleX(0.5); }
    to { opacity: 1; transform: scaleX(1); }
  }

  .addHint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    color: var(--text-soft);
    font-size: 0.85rem;
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
  }
</style>
