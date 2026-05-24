<script>
  import { brand } from "$lib/brand";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";
  import FileList from "$lib/components/tools/FileList.svelte";
  import ProgressBar from "$lib/components/tools/ProgressBar.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";
  import PreviewTable from "$lib/components/tools/PreviewTable.svelte";

  const SIZE_WARN = 50 * 1024 * 1024;
  const SIZE_BLOCK = 200 * 1024 * 1024;

  /** @type {File[]} */
  let files = $state([]);
  let mode = $state(/** @type {"vertical" | "horizontal"} */ ("vertical"));
  let firstRowIsHeader = $state(true);
  let processing = $state(false);
  /** @type {(string | number | boolean | null)[][]} */
  let mergedRows = $state([]);
  /** @type {Blob | null} */
  let result = $state(null);
  let error = $state(/** @type {string | null} */ (null));
  /** @type {Record<number, { error?: string; info?: string }>} */
  let meta = $state({});

  let totalSize = $derived(files.reduce((acc, f) => acc + f.size, 0));
  let sizeWarning = $derived(
    totalSize >= SIZE_BLOCK
      ? `Total size ${(totalSize / 1024 / 1024).toFixed(0)} MB exceeds the 200 MB cap.`
      : totalSize >= SIZE_WARN
        ? `Total size ${(totalSize / 1024 / 1024).toFixed(0)} MB is large — processing may take a moment.`
        : null
  );
  let sizeBlocked = $derived(totalSize >= SIZE_BLOCK);

  /** @param {File[]} added */
  function onFiles(added) {
    const filtered = added.filter((f) => /\.xlsx?$/i.test(f.name) || /\.csv$/i.test(f.name));
    files = [...files, ...filtered];
    result = null;
    mergedRows = [];
    error = null;
  }

  /** @param {File[]} next */
  function onReorder(next) {
    files = next;
    result = null;
    mergedRows = [];
  }

  /** @param {number} index */
  function onRemove(index) {
    files = files.filter((_, i) => i !== index);
    result = null;
    mergedRows = [];
  }

  function reset() {
    files = [];
    result = null;
    mergedRows = [];
    error = null;
    meta = {};
  }

  async function process() {
    if (files.length < 2) {
      error = "Add at least 2 files to merge.";
      return;
    }
    processing = true;
    error = null;
    result = null;
    mergedRows = [];
    meta = {};
    try {
      const { readWorkbook, mergeVertical, mergeHorizontal, rowsToXlsxBlob } = await import(
        "$lib/tools/excelMerge.js"
      );
      const sheets = [];
      for (let i = 0; i < files.length; i++) {
        const sheet = await readWorkbook(files[i]);
        sheets.push(sheet);
        if (sheet.allSheetNames.length > 1) {
          meta = {
            ...meta,
            [i]: { info: `${sheet.allSheetNames.length} sheets — using "${sheet.firstSheetName}"` },
          };
        }
      }
      const merged = mode === "vertical"
        ? mergeVertical(sheets, firstRowIsHeader)
        : mergeHorizontal(sheets);
      mergedRows = merged;
      result = rowsToXlsxBlob(merged);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      processing = false;
    }
  }

  let canProcess = $derived(files.length >= 2 && !processing && !sizeBlocked);
  let resultColCount = $derived(mergedRows.reduce((m, r) => Math.max(m, r.length), 0));
</script>

<svelte:head>
  <title>Excel merge — {brand.name}</title>
  <meta name="description" content="Merge multiple Excel files vertically or horizontally — fully in your browser. No uploads." />
  <link rel="canonical" href="{brand.siteUrl}/tools/excel-merge" />
</svelte:head>

<ToolShell
  title="Excel merge"
  description="Combine multiple .xlsx (or .csv) files into one. Vertical merge stacks rows. Horizontal merge places sheets side-by-side. Values only — styles and formulas are not preserved."
>
  {#if files.length === 0}
    <FileDropzone
      accept=".xlsx,.xls,.csv"
      multiple
      onfiles={onFiles}
      label="Drop .xlsx files here, or click to select"
      hint="At least 2 files. The first sheet of each workbook is used."
    />
  {:else}
    <div class="optionRow">
      <fieldset class="modeGroup">
        <legend>Merge mode</legend>
        <label>
          <input type="radio" bind:group={mode} value="vertical" />
          <span>Vertical (stack rows)</span>
        </label>
        <label>
          <input type="radio" bind:group={mode} value="horizontal" />
          <span>Horizontal (side-by-side columns)</span>
        </label>
      </fieldset>

      {#if mode === "vertical"}
        <label class="checkboxLine">
          <input type="checkbox" bind:checked={firstRowIsHeader} />
          <span>First row is a header — keep only once</span>
        </label>
      {/if}
    </div>

    <FileList
      {files}
      {meta}
      accept=".xlsx,.xls,.csv"
      onreorder={onReorder}
      onremove={onRemove}
      onadd={onFiles}
    />

    {#if sizeWarning}
      <p class="sizeNote" class:blocked={sizeBlocked}>{sizeWarning}</p>
    {/if}

    {#if error}
      <p class="errorBox">{error}</p>
    {/if}

    {#if processing}
      <ProgressBar label={`Merging ${files.length} files…`} />
    {/if}

    <div class="actions">
      <button class="primaryButton" type="button" onclick={process} disabled={!canProcess}>
        {processing ? "Merging…" : "Merge files"}
      </button>
      <button class="ghostButton" type="button" onclick={reset} disabled={processing}>
        Reset
      </button>
    </div>

    {#if mergedRows.length > 0}
      <div class="resultPanel">
        <header class="resultHead">
          <div>
            <h2>Result preview</h2>
            <p class="resultStats">
              {mergedRows.length.toLocaleString()} row{mergedRows.length === 1 ? "" : "s"} ·
              {resultColCount} column{resultColCount === 1 ? "" : "s"}
            </p>
          </div>
          {#if result}
            <DownloadButton blob={result} filename="merged.xlsx" label="Download merged.xlsx" />
          {/if}
        </header>
        <PreviewTable rows={mergedRows} />
      </div>
    {/if}
  {/if}
</ToolShell>

<style>
  .optionRow {
    display: grid;
    gap: 12px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .modeGroup {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
  }

  .modeGroup legend {
    color: var(--text-soft);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-right: 8px;
  }

  .modeGroup label,
  .checkboxLine {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.92rem;
    color: var(--text-muted);
  }

  .modeGroup input,
  .checkboxLine input {
    accent-color: var(--brand-accent);
  }

  .actions {
    display: inline-flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .resultPanel {
    display: grid;
    gap: 14px;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
  }

  .resultHead {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .resultHead h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .resultStats {
    margin: 4px 0 0;
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  .sizeNote {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.88rem;
  }

  .sizeNote.blocked {
    color: #ef4444;
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
