<script lang="ts">
  export let dataframe: {
    columns: string[];
    rows: Record<string, unknown>[];
    index: string[];
    totalRows: number;
    truncated: boolean;
    typeName: string;
  } | null = null;

  function cellValue(value: unknown): string {
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
</script>

{#if dataframe}
  <div class="frameMeta">
    <span>{dataframe.typeName}</span>
    <span>{dataframe.totalRows} rows</span>
    <span>{dataframe.columns.length} columns</span>
    {#if dataframe.truncated}
      <span>preview</span>
    {/if}
  </div>

  <div class="tableWrap">
    <table>
      <thead>
        <tr>
          {#if dataframe.index.length > 0}
            <th class="indexCell">#</th>
          {/if}
          {#each dataframe.columns as column}
            <th>{column}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each dataframe.rows as row, rowIndex}
          <tr>
            {#if dataframe.index.length > 0}
              <td class="indexCell">{dataframe.index[rowIndex] || rowIndex}</td>
            {/if}
            {#each dataframe.columns as column}
              <td>{cellValue(row[column])}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .frameMeta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--cd-text-muted);
    font: 11px/1.4 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .tableWrap {
    overflow: auto;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--cd-border);
    text-align: left;
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    background: var(--cd-surface);
    color: var(--cd-text);
  }

  td {
    color: var(--cd-text-muted);
    white-space: nowrap;
  }

  .indexCell {
    width: 1%;
    color: var(--cd-text-soft);
    font-family: var(--cd-font-code);
  }
</style>
