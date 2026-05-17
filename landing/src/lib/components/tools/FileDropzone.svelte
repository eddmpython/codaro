<script>
  /**
   * @typedef {Object} Props
   * @property {string} accept
   * @property {boolean} [multiple]
   * @property {(files: File[]) => void} onfiles
   * @property {string} [label]
   * @property {string} [hint]
   */

  /** @type {Props} */
  let { accept, multiple = true, onfiles, label, hint } = $props();

  let dragOver = $state(false);
  /** @type {HTMLInputElement | undefined} */
  let inputEl = $state(undefined);

  /** @param {DragEvent} e */
  function onDrop(e) {
    e.preventDefault();
    dragOver = false;
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      onfiles(files);
    }
  }

  /** @param {DragEvent} e */
  function onDragOver(e) {
    e.preventDefault();
    dragOver = true;
  }

  function onDragLeave() {
    dragOver = false;
  }

  /** @param {Event} e */
  function onChange(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const files = target.files ? Array.from(target.files) : [];
    if (files.length > 0) {
      onfiles(files);
    }
    if (target) target.value = "";
  }

  function openPicker() {
    inputEl?.click();
  }

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label={label || "Drop files here"}
  class="dropzone"
  class:active={dragOver}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  ondrop={onDrop}
  onclick={openPicker}
  onkeydown={onKey}
>
  <div class="icon" aria-hidden="true">⤓</div>
  <div class="label">{label || "Drop files here or click to select"}</div>
  {#if hint}
    <div class="hint">{hint}</div>
  {/if}
  <input
    bind:this={inputEl}
    type="file"
    {accept}
    {multiple}
    onchange={onChange}
    hidden
  />
</div>

<style>
  .dropzone {
    display: grid;
    place-items: center;
    gap: 8px;
    padding: 36px 20px;
    border: 1.5px dashed var(--border-strong);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--surface) 60%, transparent);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .dropzone:hover,
  .dropzone:focus-visible {
    border-color: var(--accent);
    background: var(--accent-soft);
    outline: none;
  }

  .dropzone.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: scale(1.005);
  }

  .icon {
    font-size: 1.6rem;
    color: var(--accent);
  }

  .label {
    font-weight: 500;
    color: var(--text);
  }

  .hint {
    color: var(--text-soft);
    font-size: 0.88rem;
  }
</style>
