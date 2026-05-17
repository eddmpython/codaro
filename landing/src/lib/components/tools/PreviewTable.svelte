<script>
  /**
   * @typedef {Object} Props
   * @property {(string | number | boolean | null)[][]} rows
   * @property {number} [maxRows]
   * @property {number} [maxCols]
   * @property {string} [caption]
   */

  /** @type {Props} */
  let { rows, maxRows = 10, maxCols = 8, caption } = $props();

  let totalRows = $derived(rows.length);
  let totalCols = $derived(rows.reduce((m, r) => Math.max(m, r.length), 0));
  let visibleRows = $derived(rows.slice(0, maxRows));
  let visibleCols = $derived(Math.min(totalCols, maxCols));

  /** @param {unknown} v */
  function fmt(v) {
    if (v === null || v === undefined || v === "") return "";
    return String(v);
  }

  /** @param {number} c */
  function columnLabel(c) {
    let label = "";
    let n = c;
    while (true) {
      label = String.fromCharCode(65 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
      if (n < 0) break;
    }
    return label;
  }
</script>

<figure class="previewWrap">
  {#if caption}<figcaption>{caption}</figcaption>{/if}
  <div class="tableScroll">
    <table>
      <thead>
        <tr>
          <th class="rowNum" scope="col"></th>
          {#each Array.from({ length: visibleCols }, (_, c) => c) as c}
            <th scope="col">{columnLabel(c)}</th>
          {/each}
          {#if totalCols > visibleCols}<th class="more" scope="col">…</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each visibleRows as row, r}
          <tr>
            <td class="rowNum">{r + 1}</td>
            {#each Array.from({ length: visibleCols }, (_, c) => c) as c}
              <td>{fmt(row[c])}</td>
            {/each}
            {#if totalCols > visibleCols}<td class="more">…</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="metaLine">
    Showing first {visibleRows.length} of {totalRows} row{totalRows === 1 ? "" : "s"}
    {#if totalCols > visibleCols} · first {visibleCols} of {totalCols} column{totalCols === 1 ? "" : "s"}{/if}
  </div>
</figure>

<style>
  .previewWrap {
    margin: 0;
    display: grid;
    gap: 8px;
  }

  figcaption {
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .tableScroll {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  table {
    border-collapse: collapse;
    font-size: 0.85rem;
    width: 100%;
    min-width: 520px;
  }

  th,
  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    text-align: left;
    white-space: nowrap;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    background: var(--surface-muted);
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    position: sticky;
    top: 0;
  }

  td {
    color: var(--text);
  }

  tr:last-child td {
    border-bottom: none;
  }

  th:last-child,
  td:last-child {
    border-right: none;
  }

  .rowNum {
    color: var(--text-soft);
    background: var(--surface-muted);
    font-variant-numeric: tabular-nums;
    text-align: right;
    width: 56px;
    position: sticky;
    left: 0;
  }

  .more {
    color: var(--text-soft);
    text-align: center;
  }

  .metaLine {
    color: var(--text-soft);
    font-size: 0.78rem;
  }
</style>
