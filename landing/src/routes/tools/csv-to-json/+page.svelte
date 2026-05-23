<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import SegmentedControl from "$lib/components/tools/SegmentedControl.svelte";

  const meta = findTool("csv-to-json");

  let csv = $state("");
  let delimiter = $state(",");
  let firstRowIsHeader = $state(true);
  let outputForm = $state(/** @type {"objects" | "rows"} */ ("objects"));
  let pretty = $state(true);

  /** @param {string} v */
  function setOutputForm(v) {
    outputForm = /** @type {"objects" | "rows"} */ (v);
  }

  /** @type {{ ok: boolean, json: string, count: number, error: string | null }} */
  let display = $state({ ok: true, json: "", count: 0, error: null });

  $effect(() => {
    const text = csv;
    const sep = delimiter || ",";
    const header = firstRowIsHeader;
    const form = outputForm;
    const pp = pretty;

    if (!text.trim()) {
      display = { ok: true, json: "", count: 0, error: null };
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { csvToObjects, parseCsv } = await import("$lib/tools/csvJson.js");
        let json = "";
        let count = 0;
        if (form === "objects") {
          const parsed = csvToObjects(text, { delimiter: sep, firstRowIsHeader: header });
          json = JSON.stringify(parsed.records, null, pp ? 2 : 0);
          count = Array.isArray(parsed.records) ? parsed.records.length : 0;
        } else {
          const rows = parseCsv(text, sep);
          json = JSON.stringify(rows, null, pp ? 2 : 0);
          count = rows.length;
        }
        if (!cancelled) display = { ok: true, json, count, error: null };
      } catch (err) {
        if (!cancelled)
          display = { ok: false, json: "", count: 0, error: err instanceof Error ? err.message : String(err) };
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  function loadSample() {
    csv = `id,name,email,signed_up\n1,Alice,alice@example.com,2025-01-04\n2,Bob,bob@example.com,2025-02-15\n3,"Carol, Jr.",carol@example.com,2025-03-01`;
  }

  function clearAll() {
    csv = "";
  }
</script>

<svelte:head>
  <title>{meta?.title ?? "CSV → JSON"} — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Convert CSV to JSON in your browser."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/csv-to-json" />
</svelte:head>

<ToolShell
  title="CSV → JSON"
  description="Paste CSV — get JSON. Handles quoted fields, custom delimiter, and configurable header behavior. Live conversion as you type."
>
  <div class="optionRow">
    <LabeledField label="Delimiter" hint="Common: , ; tab |">
      <input class="textInput delimInput" bind:value={delimiter} maxlength="3" placeholder="," />
    </LabeledField>

    <LabeledField label="Header row">
      <SegmentedControl
        options={[
          { value: "header", label: "First row = header" },
          { value: "noheader", label: "No header" },
        ]}
        value={firstRowIsHeader ? "header" : "noheader"}
        onChange={(v) => (firstRowIsHeader = v === "header")}
        ariaLabel="Header row mode"
      />
    </LabeledField>

    <LabeledField label="Output shape">
      <SegmentedControl
        options={[
          { value: "objects", label: "Array of objects" },
          { value: "rows", label: "Array of arrays" },
        ]}
        value={outputForm}
        onChange={setOutputForm}
        ariaLabel="Output shape"
      />
    </LabeledField>

    <LabeledField label="Pretty print">
      <SegmentedControl
        options={[
          { value: "pretty", label: "Indented" },
          { value: "compact", label: "Compact" },
        ]}
        value={pretty ? "pretty" : "compact"}
        onChange={(v) => (pretty = v === "pretty")}
        ariaLabel="Pretty print"
      />
    </LabeledField>
  </div>

  <TextAreaInput
    value={csv}
    onChange={(v) => (csv = v)}
    label="CSV input"
    placeholder="id,name,email&#10;1,Alice,alice@example.com&#10;2,Bob,bob@example.com"
    minRows={8}
    maxRows={20}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!csv}>Clear</button>
  </div>

  {#if display.error}
    <p class="errorBox">{display.error}</p>
  {/if}

  <CodeBlock
    value={display.json}
    label="JSON output"
    language="json"
    emptyHint="Paste CSV above to see the JSON result."
  />

  {#if display.json}
    <p class="resultMeta">{display.count.toLocaleString()} record{display.count === 1 ? "" : "s"}</p>
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
