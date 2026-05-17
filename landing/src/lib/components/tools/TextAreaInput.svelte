<script>
  /**
   * @typedef {Object} Props
   * @property {string} value
   * @property {(value: string) => void} onChange
   * @property {string} [placeholder]
   * @property {string} [label]
   * @property {string} [hint]
   * @property {number} [minRows]
   * @property {number} [maxRows]
   * @property {"mono" | "default"} [font]
   * @property {boolean} [showCount]
   * @property {string} [ariaLabel]
   */

  /** @type {Props} */
  let {
    value,
    onChange,
    placeholder = "",
    label,
    hint,
    minRows = 6,
    maxRows = 24,
    font = "mono",
    showCount = true,
    ariaLabel,
  } = $props();

  let charCount = $derived(value.length);
  let lineCount = $derived(value === "" ? 0 : value.split(/\r\n|\r|\n/).length);

  /** @param {Event} e */
  function onInput(e) {
    const target = /** @type {HTMLTextAreaElement} */ (e.target);
    onChange(target.value);
  }
</script>

<div class="textAreaWrap">
  {#if label}
    <div class="labelRow">
      <span class="label">{label}</span>
      {#if showCount}
        <span class="count">
          {lineCount.toLocaleString()} line{lineCount === 1 ? "" : "s"} ·
          {charCount.toLocaleString()} char{charCount === 1 ? "" : "s"}
        </span>
      {/if}
    </div>
  {/if}
  <textarea
    class="field"
    class:mono={font === "mono"}
    style="min-height: {minRows * 1.45}em; max-height: {maxRows * 1.45}em;"
    {value}
    {placeholder}
    aria-label={ariaLabel ?? label ?? placeholder}
    spellcheck="false"
    oninput={onInput}
  ></textarea>
  {#if hint}<p class="hint">{hint}</p>{/if}
</div>

<style>
  .textAreaWrap {
    display: grid;
    gap: 6px;
  }

  .labelRow {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .count {
    font-size: 0.78rem;
    color: var(--text-soft);
    font-variant-numeric: tabular-nums;
  }

  .field {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    line-height: 1.45;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field.mono {
    font-family: "Fira Mono", ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 0.88rem;
  }

  .field:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .hint {
    margin: 0;
    font-size: 0.78rem;
    color: var(--text-soft);
  }
</style>
