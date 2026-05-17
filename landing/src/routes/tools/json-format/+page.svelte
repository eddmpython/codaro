<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import SegmentedControl from "$lib/components/tools/SegmentedControl.svelte";

  const meta = findTool("json-format");

  let input = $state("");
  let mode = $state(/** @type {"pretty" | "minify"} */ ("pretty"));
  /** @type {number | string} */
  let indent = $state(2);
  let sortKeys = $state(false);

  /** @param {string} v */
  function setIndent(v) {
    indent = v === "tab" ? "\t" : Number.parseInt(v, 10);
  }

  /** @param {string} v */
  function setMode(v) {
    mode = /** @type {"pretty" | "minify"} */ (v);
  }

  /**
   * @param {unknown} value
   * @returns {unknown}
   */
  function sortDeep(value) {
    if (Array.isArray(value)) return value.map(sortDeep);
    if (value && typeof value === "object") {
      const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
      /** @type {Record<string, unknown>} */
      const out = {};
      for (const [k, v] of entries) out[k] = sortDeep(v);
      return out;
    }
    return value;
  }

  let result = $derived.by(() => {
    if (!input.trim()) return { ok: true, output: "", error: null, lineNo: null, colNo: null };
    try {
      const parsed = JSON.parse(input);
      const transformed = sortKeys ? sortDeep(parsed) : parsed;
      const output = mode === "pretty"
        ? JSON.stringify(transformed, null, indent)
        : JSON.stringify(transformed);
      return { ok: true, output, error: null, lineNo: null, colNo: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const positionMatch = message.match(/position (\d+)/);
      let lineNo = null;
      let colNo = null;
      if (positionMatch) {
        const pos = Number.parseInt(positionMatch[1], 10);
        const before = input.slice(0, pos);
        const newlines = before.split(/\n/);
        lineNo = newlines.length;
        colNo = newlines[newlines.length - 1].length + 1;
      }
      return { ok: false, output: "", error: message, lineNo, colNo };
    }
  });

  function loadSample() {
    input = '{"name":"Codaro","tools":[{"id":1,"slug":"json-format"},{"id":2,"slug":"csv-to-json"}],"created":"2026-05"}';
  }

  function clearAll() {
    input = "";
  }
</script>

<svelte:head>
  <title>JSON formatter — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Pretty-print, minify, and validate JSON in your browser."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/json-format" />
</svelte:head>

<ToolShell
  title="JSON formatter"
  description="Pretty-print, minify, validate, and (optionally) deep-sort keys. Errors point to the line and column."
>
  <div class="optionRow">
    <LabeledField label="Mode">
      <SegmentedControl
        options={[
          { value: "pretty", label: "Pretty" },
          { value: "minify", label: "Minify" },
        ]}
        value={mode}
        onChange={setMode}
        ariaLabel="Format mode"
      />
    </LabeledField>

    {#if mode === "pretty"}
      <LabeledField label="Indent">
        <SegmentedControl
          options={[
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
            { value: "tab", label: "Tab" },
          ]}
          value={typeof indent === "string" ? "tab" : String(indent)}
          onChange={setIndent}
          ariaLabel="Indent size"
        />
      </LabeledField>
    {/if}

    <LabeledField label="Sort keys">
      <SegmentedControl
        options={[
          { value: "no", label: "Keep order" },
          { value: "yes", label: "Sort A→Z" },
        ]}
        value={sortKeys ? "yes" : "no"}
        onChange={(v) => (sortKeys = v === "yes")}
        ariaLabel="Sort keys"
      />
    </LabeledField>
  </div>

  <TextAreaInput
    value={input}
    onChange={(v) => (input = v)}
    label="JSON input"
    placeholder={'{ "key": "value" }'}
    minRows={8}
    maxRows={20}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!input}>Clear</button>
  </div>

  {#if result.error}
    <div class="errorBox">
      <strong>Invalid JSON</strong>
      <span>{result.error}</span>
      {#if result.lineNo}
        <span class="position">Line {result.lineNo}, column {result.colNo}</span>
      {/if}
    </div>
  {:else if input.trim() && !result.error}
    <div class="validBadge">
      <span aria-hidden="true">✓</span> Valid JSON
    </div>
  {/if}

  <CodeBlock
    value={result.output}
    label={mode === "pretty" ? "Formatted output" : "Minified output"}
    language="json"
    showLineNumbers={mode === "pretty"}
    emptyHint="Paste JSON above to see the formatted result."
  />
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

  .quickActions {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .errorBox {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border: 1px solid #ef4444;
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
    border-radius: var(--radius-sm);
    font-size: 0.92rem;
  }

  .position {
    color: #fca5a5;
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.85rem;
  }

  .validBadge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.1);
    color: #86efac;
    font-size: 0.85rem;
    font-weight: 500;
    width: fit-content;
    border: 1px solid rgba(34, 197, 94, 0.25);
  }
</style>
