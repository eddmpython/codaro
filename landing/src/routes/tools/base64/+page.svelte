<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import SegmentedControl from "$lib/components/tools/SegmentedControl.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const meta = findTool("base64");

  /** @typedef {"encode" | "decode"} Direction */
  /** @typedef {"text" | "file"} Mode */

  let direction = $state(/** @type {Direction} */ ("encode"));
  let mode = $state(/** @type {Mode} */ ("text"));
  let urlSafe = $state(false);
  let input = $state("");
  /** @type {File | null} */
  let file = $state(null);

  let result = $state("");
  /** @type {Blob | null} */
  let outputBlob = $state(null);
  let error = $state(/** @type {string | null} */ (null));

  /** @param {string} v */ function setDirection(v) { direction = /** @type {Direction} */ (v); }
  /** @param {string} v */ function setMode(v) { mode = /** @type {Mode} */ (v); }

  $effect(() => {
    const dir = direction;
    const m = mode;
    const url = urlSafe;
    const t = input;
    const f = file;

    if (dir === "encode" && m === "text") {
      if (!t) {
        result = "";
        outputBlob = null;
        error = null;
        return;
      }
      let cancelled = false;
      (async () => {
        try {
          const { encodeText } = await import("$lib/tools/base64.js");
          if (!cancelled) {
            result = encodeText(t, url);
            outputBlob = null;
            error = null;
          }
        } catch (err) {
          if (!cancelled) error = err instanceof Error ? err.message : String(err);
        }
      })();
      return () => { cancelled = true; };
    }
    if (dir === "encode" && m === "file") {
      if (!f) {
        result = "";
        outputBlob = null;
        return;
      }
      let cancelled = false;
      (async () => {
        try {
          const { encodeBytes } = await import("$lib/tools/base64.js");
          const buf = await f.arrayBuffer();
          if (!cancelled) {
            result = encodeBytes(new Uint8Array(buf), url);
            outputBlob = null;
            error = null;
          }
        } catch (err) {
          if (!cancelled) error = err instanceof Error ? err.message : String(err);
        }
      })();
      return () => { cancelled = true; };
    }
    if (dir === "decode") {
      if (!t) {
        result = "";
        outputBlob = null;
        error = null;
        return;
      }
      let cancelled = false;
      (async () => {
        try {
          const { decodeToText, decodeToBytes } = await import("$lib/tools/base64.js");
          const bytes = decodeToBytes(t);
          if (cancelled) return;
          if (m === "text") {
            result = decodeToText(t);
            outputBlob = null;
          } else {
            result = `${bytes.length.toLocaleString()} bytes decoded — download to view.`;
            outputBlob = new Blob([/** @type {BlobPart} */ (bytes)], { type: "application/octet-stream" });
          }
          error = null;
        } catch (err) {
          if (!cancelled) {
            error = err instanceof Error ? err.message : String(err);
            result = "";
            outputBlob = null;
          }
        }
      })();
      return () => { cancelled = true; };
    }
  });

  /** @param {File[]} added */
  function onFiles(added) {
    file = added[0] ?? null;
  }

  function loadSample() {
    if (direction === "encode") input = "Hello, Codaro! 한글도 됨.";
    else input = "SGVsbG8sIENvZGFybyEg7ZWc6riA64+EIOuQqC4=";
  }

  function clearAll() {
    input = "";
    file = null;
  }
</script>

<svelte:head>
  <title>Base64 — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Encode and decode Base64 in your browser."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/base64" />
</svelte:head>

<ToolShell
  title="Base64"
  description="Encode text or files to Base64, or decode Base64 back to text or bytes. Standard and URL-safe variants."
>
  <div class="optionRow">
    <LabeledField label="Direction">
      <SegmentedControl
        options={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
        value={direction}
        onChange={setDirection}
        ariaLabel="Direction"
      />
    </LabeledField>

    {#if direction === "encode"}
      <LabeledField label="Source">
        <SegmentedControl
          options={[
            { value: "text", label: "Text" },
            { value: "file", label: "File" },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel="Source type"
        />
      </LabeledField>
    {:else}
      <LabeledField label="Output as">
        <SegmentedControl
          options={[
            { value: "text", label: "Text (UTF-8)" },
            { value: "file", label: "Bytes (download)" },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel="Decoded output"
        />
      </LabeledField>
    {/if}

    {#if direction === "encode"}
      <label class="check">
        <input type="checkbox" bind:checked={urlSafe} />
        <span>URL-safe (no padding, - / _)</span>
      </label>
    {/if}
  </div>

  {#if (direction === "encode" && mode === "file") || (direction === "decode" && mode === "text") || direction === "encode" && mode === "text" || direction === "decode"}
    {#if direction === "encode" && mode === "file"}
      {#if !file}
        <FileDropzone accept="*/*" multiple={false} onfiles={onFiles} label="Drop a file to encode" />
      {:else}
        <div class="fileCard">
          <div>
            <div class="fileName">{file.name}</div>
            <div class="fileMeta">{(file.size / 1024).toLocaleString()} KB</div>
          </div>
          <button class="ghostButton" type="button" onclick={() => (file = null)}>Change file</button>
        </div>
      {/if}
    {:else}
      <TextAreaInput
        value={input}
        onChange={(v) => (input = v)}
        label={direction === "encode" ? "Plain text" : "Base64 input"}
        placeholder={direction === "encode" ? "Type or paste text…" : "Paste Base64…"}
        minRows={5}
        maxRows={14}
      />
      <div class="quickActions">
        <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
        <button class="ghostButton" type="button" onclick={clearAll} disabled={!input}>Clear</button>
      </div>
    {/if}
  {/if}

  {#if error}
    <p class="errorBox">{error}</p>
  {/if}

  {#if outputBlob}
    <DownloadButton blob={outputBlob} filename="decoded.bin" label="Download decoded bytes" />
  {/if}

  <CodeBlock value={result} label={direction === "encode" ? "Base64 output" : "Decoded text"} emptyHint="Provide input above to see the result." />
</ToolShell>

<style>
  .optionRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    align-items: end;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .check {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
    font-size: 0.88rem;
    cursor: pointer;
  }

  .check input {
    accent-color: var(--brand-accent);
  }

  .fileCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .fileName {
    font-weight: 500;
  }

  .fileMeta {
    color: var(--text-soft);
    font-size: 0.85rem;
    margin-top: 2px;
  }

  .quickActions {
    display: inline-flex;
    gap: 8px;
  }

  .errorBox {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid #ef4444;
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
  }
</style>
