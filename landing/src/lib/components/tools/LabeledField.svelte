<script>
  /**
   * @typedef {Object} Props
   * @property {string} label
   * @property {string} [hint]
   * @property {string} [error]
   * @property {import('svelte').Snippet} children
   */

  /** @type {Props} */
  let { label, hint, error, children } = $props();
</script>

<label class="labeledField">
  <span class="label">{label}</span>
  {@render children()}
  {#if error}
    <span class="error">{error}</span>
  {:else if hint}
    <span class="hint">{hint}</span>
  {/if}
</label>

<style>
  .labeledField {
    display: grid;
    gap: 6px;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .hint {
    font-size: 0.78rem;
    color: var(--text-soft);
  }

  .error {
    font-size: 0.78rem;
    color: #f87171;
  }
</style>
