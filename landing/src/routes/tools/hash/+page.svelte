<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import KeyValueOutput from "$lib/components/tools/KeyValueOutput.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import SegmentedControl from "$lib/components/tools/SegmentedControl.svelte";
  import FileDropzone from "$lib/components/tools/FileDropzone.svelte";

  const meta = findTool("hash");

  /** @typedef {"text" | "file"} Mode */

  let mode = $state(/** @type {Mode} */ ("text"));
  let text = $state("");
  /** @type {File | null} */
  let file = $state(null);

  /** @type {Record<string, string>} */
  let hashes = $state({});
  let computing = $state(false);
  let error = $state(/** @type {string | null} */ (null));

  /** @param {string} v */
  function setMode(v) {
    mode = /** @type {Mode} */ (v);
    hashes = {};
    error = null;
  }

  const algos = /** @type {const} */ (["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"]);

  $effect(() => {
    const m = mode;
    const t = text;
    const f = file;
    if (m === "text") {
      if (!t) {
        hashes = {};
        return;
      }
      let cancelled = false;
      computing = true;
      (async () => {
        try {
          const { hashText } = await import("$lib/tools/hash.js");
          /** @type {Record<string, string>} */
          const out = {};
          for (const algo of algos) {
            out[algo] = await hashText(t, algo);
          }
          if (!cancelled) {
            hashes = out;
            error = null;
          }
        } catch (err) {
          if (!cancelled) error = err instanceof Error ? err.message : String(err);
        } finally {
          if (!cancelled) computing = false;
        }
      })();
      return () => {
        cancelled = true;
      };
    } else {
      if (!f) {
        hashes = {};
        return;
      }
      let cancelled = false;
      computing = true;
      (async () => {
        try {
          const { hashBytes } = await import("$lib/tools/hash.js");
          const buf = await f.arrayBuffer();
          /** @type {Record<string, string>} */
          const out = {};
          for (const algo of algos) {
            out[algo] = await hashBytes(buf, algo);
          }
          if (!cancelled) {
            hashes = out;
            error = null;
          }
        } catch (err) {
          if (!cancelled) error = err instanceof Error ? err.message : String(err);
        } finally {
          if (!cancelled) computing = false;
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  });

  /** @param {File[]} added */
  function onFiles(added) {
    file = added[0] ?? null;
  }

  let pairs = $derived(
    algos
      .filter((a) => hashes[a])
      .map((a) => ({ key: a, value: hashes[a], mono: true }))
  );
</script>

<svelte:head>
  <title>Hash generator — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Generate SHA / MD5 hashes of text or files."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/hash" />
</svelte:head>

<ToolShell
  title="Hash generator"
  description="Compute SHA-1 / SHA-256 / SHA-384 / SHA-512 / MD5 of text or files. SHAs use Web Crypto; MD5 is in pure JS for non-security checksums."
>
  <LabeledField label="Input source">
    <SegmentedControl
      options={[
        { value: "text", label: "Text" },
        { value: "file", label: "File" },
      ]}
      value={mode}
      onChange={setMode}
      ariaLabel="Hash input source"
    />
  </LabeledField>

  {#if mode === "text"}
    <TextAreaInput
      value={text}
      onChange={(v) => (text = v)}
      label="Text input"
      placeholder="Type or paste text — hash updates as you type."
      minRows={5}
      maxRows={12}
    />
  {:else}
    {#if !file}
      <FileDropzone
        accept="*/*"
        multiple={false}
        onfiles={onFiles}
        label="Drop a file here, or click to select"
        hint="The file is read locally — never uploaded."
      />
    {:else}
      <div class="fileCard">
        <div>
          <div class="fileName">{file.name}</div>
          <div class="fileMeta">{(file.size / 1024).toLocaleString()} KB</div>
        </div>
        <button class="ghostButton" type="button" onclick={() => (file = null)}>Change file</button>
      </div>
    {/if}
  {/if}

  {#if error}
    <p class="errorBox">{error}</p>
  {/if}

  {#if computing && Object.keys(hashes).length === 0}
    <p class="hint">Computing hashes…</p>
  {/if}

  {#if Object.keys(hashes).length > 0}
    <KeyValueOutput {pairs} caption="Hashes" />
  {/if}
</ToolShell>

<style>
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

  .hint {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.88rem;
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
