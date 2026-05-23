<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import SegmentedControl from "$lib/components/tools/SegmentedControl.svelte";
  import CopyButton from "$lib/components/tools/CopyButton.svelte";
  import DownloadButton from "$lib/components/tools/DownloadButton.svelte";

  const meta = findTool("uuid");

  let version = $state(/** @type {"v4" | "v7"} */ ("v4"));
  let count = $state(10);
  /** @type {string[]} */
  let ids = $state([]);

  /** @param {string} v */
  function setVersion(v) {
    version = /** @type {"v4" | "v7"} */ (v);
  }

  async function generate() {
    const safeCount = Math.max(1, Math.min(10000, Math.floor(Number(count) || 1)));
    const { uuidV4, uuidV7 } = await import("$lib/tools/uuid.js");
    const fn = version === "v4" ? uuidV4 : uuidV7;
    /** @type {string[]} */
    const arr = [];
    for (let i = 0; i < safeCount; i++) arr.push(fn());
    ids = arr;
  }

  $effect(() => {
    void version;
    void count;
    generate();
  });

  let joined = $derived(ids.join("\n"));
  let downloadBlob = $derived.by(() => {
    if (!joined) return null;
    return new Blob([joined], { type: "text/plain;charset=utf-8" });
  });
</script>

<svelte:head>
  <title>UUID generator — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Generate UUID v4 or v7."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/uuid" />
</svelte:head>

<ToolShell
  title="UUID generator"
  description="Generate UUID v4 (random) or v7 (time-sortable). v7 is best for database primary keys when insertion order should match creation time."
>
  <div class="optionRow">
    <LabeledField label="Version" hint={version === "v4" ? "Random — no time signal." : "Time-ordered — sorts by creation time."}>
      <SegmentedControl
        options={[
          { value: "v4", label: "v4 (random)" },
          { value: "v7", label: "v7 (time-ordered)" },
        ]}
        value={version}
        onChange={setVersion}
        ariaLabel="UUID version"
      />
    </LabeledField>

    <LabeledField label="Count" hint="1 — 10 000">
      <input
        type="number"
        class="numInput"
        bind:value={count}
        min="1"
        max="10000"
      />
    </LabeledField>

    <div class="actionsCol">
      <button class="primaryButton" type="button" onclick={generate}>Regenerate</button>
    </div>
  </div>

  <div class="resultHead">
    <p class="resultMeta">{ids.length.toLocaleString()} UUID{ids.length === 1 ? "" : "s"}</p>
    <div class="rightActions">
      <CopyButton value={joined} label="Copy all" />
      {#if downloadBlob}
        <DownloadButton blob={downloadBlob} filename="uuids.txt" label="Download .txt" />
      {/if}
    </div>
  </div>

  <CodeBlock value={joined} language={version} showLineNumbers={ids.length <= 200} />
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

  .numInput {
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    font-family: "Fira Mono", ui-monospace, monospace;
    width: 120px;
  }

  .numInput:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .actionsCol {
    display: flex;
    align-items: end;
  }

  .resultHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .rightActions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .resultMeta {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.85rem;
  }
</style>
