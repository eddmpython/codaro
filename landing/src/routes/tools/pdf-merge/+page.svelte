<script>
  import { brand } from "$lib/brand";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";
  import FileList from "$lib/components/tools/FileList.svelte";
  import ProgressBar from "$lib/components/tools/ProgressBar.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const SIZE_WARN = 50 * 1024 * 1024;
  const SIZE_BLOCK = 200 * 1024 * 1024;

  /** @type {File[]} */
  let files = $state([]);
  let processing = $state(false);
  /** @type {Blob | null} */
  let result = $state(null);
  let error = $state(/** @type {string | null} */ (null));
  let activeIndex = $state(/** @type {number | undefined} */ (undefined));
  let processedFraction = $state(0);
  /** @type {Record<number, { progress?: string }>} */
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
    const filtered = added.filter((f) => /\.pdf$/i.test(f.name));
    files = [...files, ...filtered];
    result = null;
    error = null;
  }

  /** @param {File[]} next */
  function onReorder(next) {
    files = next;
    result = null;
  }

  /** @param {number} index */
  function onRemove(index) {
    files = files.filter((_, i) => i !== index);
    result = null;
  }

  function reset() {
    files = [];
    result = null;
    error = null;
    activeIndex = undefined;
    processedFraction = 0;
    meta = {};
  }

  async function process() {
    if (files.length < 2) {
      error = "Add at least 2 PDF files to merge.";
      return;
    }
    processing = true;
    error = null;
    result = null;
    activeIndex = undefined;
    processedFraction = 0;
    meta = {};
    try {
      const { mergePdfs } = await import("$lib/tools/pdfMerge.js");
      result = await mergePdfs(files, (p) => {
        activeIndex = p.current - 1;
        processedFraction = (p.current - 1) / p.total;
        const prevMeta = { ...meta };
        if (p.current > 1) prevMeta[p.current - 2] = { progress: "✓" };
        prevMeta[p.current - 1] = { progress: "Processing…" };
        meta = prevMeta;
      });
      const finalMeta = { ...meta };
      finalMeta[files.length - 1] = { progress: "✓" };
      meta = finalMeta;
      processedFraction = 1;
      activeIndex = undefined;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      activeIndex = undefined;
    } finally {
      processing = false;
    }
  }

  let canProcess = $derived(files.length >= 2 && !processing && !sizeBlocked);
  let progressLabel = $derived(
    processing && activeIndex !== undefined
      ? `Processing ${activeIndex + 1} of ${files.length}: ${files[activeIndex]?.name ?? ""}`
      : "Combining PDFs…"
  );
</script>

<svelte:head>
  <title>PDF merge — {brand.name}</title>
  <meta name="description" content="Combine PDF files into one — entirely in your browser. Drag to reorder, then export." />
  <link rel="canonical" href="{brand.siteUrl}/tools/pdf-merge" />
</svelte:head>

<ToolShell
  title="PDF merge"
  description="Combine several PDFs into a single document. Drag rows to set the final page order. Files stay on your device."
>
  {#if files.length === 0}
    <FileDropzone
      accept="application/pdf,.pdf"
      multiple
      onfiles={onFiles}
      label="Drop PDF files here, or click to select"
      hint="At least 2 files. Drag rows to reorder before merging."
    />
  {:else}
    <FileList
      {files}
      {meta}
      {activeIndex}
      accept="application/pdf,.pdf"
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
      <ProgressBar label={progressLabel} value={processedFraction} />
    {/if}

    <div class="actions">
      <button class="primaryButton" type="button" onclick={process} disabled={!canProcess}>
        {processing ? "Merging…" : "Merge PDFs"}
      </button>
      <button class="ghostButton" type="button" onclick={reset} disabled={processing}>
        Reset
      </button>
    </div>

    {#if result}
      <DownloadButton blob={result} filename="merged.pdf" label="Download merged.pdf" />
    {/if}
  {/if}
</ToolShell>

<style>
  .actions {
    display: inline-flex;
    gap: 10px;
    flex-wrap: wrap;
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
