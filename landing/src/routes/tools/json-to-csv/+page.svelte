<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const meta = findTool("json-to-csv");

  let json = $state("");
  let delimiter = $state(",");
  let columnOverride = $state("");

  /** @type {{ ok: boolean, csv: string, count: number, error: string | null }} */
  let display = $state({ ok: true, csv: "", count: 0, error: null });

  $effect(() => {
    const text = json;
    const sep = delimiter || ",";
    const cols = columnOverride.trim();
    if (!text.trim()) {
      display = { ok: true, csv: "", count: 0, error: null };
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { jsonToCsv } = await import("$lib/tools/csvJson.js");
        const data = JSON.parse(text);
        const columnList = cols ? cols.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
        const csv = jsonToCsv(data, { delimiter: sep, columns: columnList });
        const count = Array.isArray(data) ? data.length : 0;
        if (!cancelled) display = { ok: true, csv, count, error: null };
      } catch (err) {
        if (!cancelled)
          display = { ok: false, csv: "", count: 0, error: err instanceof Error ? err.message : String(err) };
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  function loadSample() {
    json = JSON.stringify(
      [
        { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
        { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
        { id: 3, name: 'Carol, Jr.', email: "carol@example.com", role: "user" },
      ],
      null,
      2
    );
  }

  function clearAll() {
    json = "";
  }

  let downloadBlob = $derived.by(() => {
    if (!display.csv) return null;
    return new Blob([display.csv], { type: "text/csv;charset=utf-8" });
  });
</script>

<svelte:head>
  <title>{meta?.title ?? "JSON → CSV"} — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Convert JSON arrays to CSV in your browser."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/json-to-csv" />
</svelte:head>

<ToolShell
  title="JSON → CSV"
  description="Paste an array of objects (or array of arrays) — get CSV. Auto-detects columns from the first object, or specify your own column order."
>
  <div class="optionRow">
    <LabeledField label="Delimiter" hint="Common: , ; tab |">
      <input class="textInput delimInput" bind:value={delimiter} maxlength="3" placeholder="," />
    </LabeledField>

    <LabeledField label="Column order (optional)" hint="Comma-separated. Empty = all keys.">
      <input
        class="textInput"
        bind:value={columnOverride}
        placeholder="id, name, email"
        spellcheck="false"
        autocomplete="off"
      />
    </LabeledField>
  </div>

  <TextAreaInput
    value={json}
    onChange={(v) => (json = v)}
    label="JSON input"
    placeholder={'[\n  { "id": 1, "name": "Alice" },\n  { "id": 2, "name": "Bob" }\n]'}
    minRows={8}
    maxRows={20}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!json}>Clear</button>
  </div>

  {#if display.error}
    <p class="errorBox">{display.error}</p>
  {/if}

  <CodeBlock
    value={display.csv}
    label="CSV output"
    language="csv"
    emptyHint="Paste an array of objects to see the CSV result."
  />

  {#if display.csv && downloadBlob}
    <div class="downloadRow">
      <p class="resultMeta">{display.count.toLocaleString()} record{display.count === 1 ? "" : "s"}</p>
      <DownloadButton blob={downloadBlob} filename="data.csv" label="Download data.csv" />
    </div>
  {/if}
</ToolShell>

<style>
  .optionRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .textInput {
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.88rem;
  }

  .textInput:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .delimInput {
    width: 80px;
  }

  .quickActions {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .downloadRow {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .resultMeta {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.85rem;
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
