<script>
  /**
   * @typedef {Object} Option
   * @property {string} value
   * @property {string} label
   * @property {string} [hint]
   *
   * @typedef {Object} Props
   * @property {Option[]} options
   * @property {string} value
   * @property {(value: string) => void} onChange
   * @property {string} [ariaLabel]
   */

  /** @type {Props} */
  let { options, value, onChange, ariaLabel } = $props();
</script>

<div class="segmented" role="radiogroup" aria-label={ariaLabel}>
  {#each options as opt}
    <button
      type="button"
      class="seg"
      class:active={value === opt.value}
      role="radio"
      aria-checked={value === opt.value}
      onclick={() => onChange(opt.value)}
      title={opt.hint}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    width: fit-content;
  }

  .seg {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .seg:hover {
    color: var(--text);
  }

  .seg.active {
    background: var(--accent);
    color: white;
  }
</style>
