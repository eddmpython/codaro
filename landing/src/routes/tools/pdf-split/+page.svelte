<script>
  import { brand } from "$lib/brand";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";
  import ProgressBar from "$lib/components/tools/ProgressBar.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const SIZE_BLOCK = 200 * 1024 * 1024;

  /** @type {File | null} */
  let file = $state(null);
  let pageCount = $state(0);
  let rangeExpr = $state("");
  let processing = $state(false);
  /** @type {Blob | null} */
  let result = $state(null);
  let error = $state(/** @type {string | null} */ (null));
  let parseError = $state(/** @type {string | null} */ (null));

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
    file = picked;
    pageCount = 0;
    try {
      const { getPageCount } = await import("$lib/tools/pdfMerge.js");
      pageCount = await getPageCount(picked);
      rangeExpr = pageCount > 1 ? `1-${Math.ceil(pageCount / 2)}, ${Math.ceil(pageCount / 2) + 1}-${pageCount}` : "1";
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      file = null;
    }
  }

  function reset() {
    file = null;
    result = null;
    error = null;
    parseError = null;
    rangeExpr = "";
    pageCount = 0;
  }

  async function process() {
    if (!file) return;
    processing = true;
    error = null;
    parseError = null;
    result = null;
    try {
      const { parseRangeExpr, splitByRanges } = await import("$lib/tools/pdfSplit.js");
      const parsed = parseRangeExpr(rangeExpr, pageCount);
      if (!parsed.ok || !parsed.groups) {
        parseError = parsed.error ?? "Invalid range";
        processing = false;
        return;
      }
      result = await splitByRanges(file, parsed.groups);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      processing = false;
    }
  }

  let canProcess = $derived(!!file && rangeExpr.trim() !== "" && !processing);
</script>

<svelte:head>
  <title>PDF split — {brand.name}</title>
  <meta name="description" content="Split a PDF into chunks by page ranges, then download as a zip — fully in your browser." />
  <link rel="canonical" href="{brand.siteUrl}/tools/pdf-split" />
</svelte:head>

<ToolShell
  title="PDF split"
  description="Split a PDF into multiple files by page ranges. Use a comma-separated expression like 1-3, 5, 7-9. The result is bundled as a zip."
>
  {#if !file}
    <FileDropzone
      accept="application/pdf,.pdf"
      multiple={false}
      onfiles={onFiles}
      label="Drop a PDF here, or click to select"
      hint="One file. We'll detect the page count automatically."
    />
    {#if error}
      <p class="errorBox">{error}</p>
    {/if}
  {:else}
    <div class="sourceCard">
      <div class="sourceInfo">
        <div class="sourceName">{file.name}</div>
        <div class="sourceMeta">
          {pageCount} page{pageCount === 1 ? "" : "s"} · {(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
      <button class="ghostButton" type="button" onclick={reset}>Change file</button>
    </div>

    <label class="rangeBlock">
      <span class="rangeLabel">Page ranges</span>
      <input
        type="text"
        class="rangeInput"
        bind:value={rangeExpr}
        placeholder="e.g. 1-3, 5, 7-{pageCount}"
        spellcheck="false"
        autocomplete="off"
      />
      <span class="rangeHelp">
        Comma-separated. Use single pages (5) or ranges (1-3). Each entry becomes its own PDF in the zip.
      </span>
    </label>

    {#if parseError}
      <p class="errorBox">{parseError}</p>
    {/if}

    {#if error}
      <p class="errorBox">{error}</p>
    {/if}

    {#if processing}
      <ProgressBar label="Splitting…" />
    {/if}

    <div class="actions">
      <button class="primaryButton" type="button" onclick={process} disabled={!canProcess}>
        {processing ? "Splitting…" : "Split & download zip"}
      </button>
      <button class="ghostButton" type="button" onclick={reset} disabled={processing}>
        Reset
      </button>
    </div>

    {#if result}
      <DownloadButton
        blob={result}
        filename="{file.name.replace(/\.pdf$/i, '')}__split.zip"
        label="Download zip"
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

  .rangeBlock {
    display: grid;
    gap: 6px;
  }

  .rangeLabel {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .rangeInput {
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.95rem;
  }

  .rangeInput:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .rangeHelp {
    color: var(--text-soft);
    font-size: 0.82rem;
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
