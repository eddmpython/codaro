<script>
  /**
   * @typedef {Object} Pair
   * @property {string} key
   * @property {string | number | boolean | null} value
   * @property {string} [hint]
   * @property {boolean} [mono]
   * @property {boolean} [highlight]
   *
   * @typedef {Object} Props
   * @property {Pair[]} pairs
   * @property {string} [caption]
   */

  /** @type {Props} */
  let { pairs, caption } = $props();

  /** @param {Pair["value"]} v */
  function fmt(v) {
    if (v === null) return "null";
    if (v === undefined) return "—";
    return String(v);
  }
</script>

<dl class="kvList">
  {#if caption}<div class="caption">{caption}</div>{/if}
  {#each pairs as p}
    <div class="row" class:highlight={p.highlight}>
      <dt>
        <span class="key">{p.key}</span>
        {#if p.hint}<span class="hint">{p.hint}</span>{/if}
      </dt>
      <dd class:mono={p.mono ?? true}>{fmt(p.value)}</dd>
    </div>
  {/each}
</dl>

<style>
  .kvList {
    display: grid;
    gap: 0;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--surface);
  }

  .caption {
    grid-column: 1 / -1;
    padding: 8px 14px;
    background: var(--surface-muted);
    color: var(--text-soft);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 16px;
    padding: 10px 14px;
    border-top: 1px solid var(--border);
  }

  .row:first-child:not(.caption + .row) {
    border-top: none;
  }

  .row.highlight {
    background: var(--accent-soft);
  }

  dt {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.85rem;
    display: grid;
    gap: 2px;
  }

  .key {
    font-weight: 500;
  }

  .hint {
    font-size: 0.74rem;
    color: var(--text-soft);
  }

  dd {
    margin: 0;
    color: var(--text);
    font-size: 0.88rem;
    word-break: break-all;
  }

  dd.mono {
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.84rem;
  }

  @media (max-width: 600px) {
    .row {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }
</style>
