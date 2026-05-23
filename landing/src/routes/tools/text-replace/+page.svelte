<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";

  const meta = findTool("text-replace");

  let text = $state("");
  let pattern = $state("");
  let replacement = $state("");
  let regex = $state(false);
  let caseSensitive = $state(false);
  let wholeWord = $state(false);

  /** @type {{ output: string; count: number; error: string | null }} */
  let result = $state({ output: "", count: 0, error: null });

  $effect(() => {
    const t = text;
    const p = pattern;
    const r = replacement;
    const opts = { regex, caseSensitive, wholeWord, multiline: true };
    if (!t || !p) {
      result = { output: t, count: 0, error: null };
      return;
    }
    let cancelled = false;
    (async () => {
      const { findAndReplace } = await import("$lib/tools/textOps.js");
      const res = findAndReplace(t, p, r, opts);
      if (!cancelled) result = res;
    })();
    return () => {
      cancelled = true;
    };
  });

  function loadSample() {
    text = "Customer Alice ordered 3 items.\nCustomer Bob ordered 1 item.\nCustomer Carol ordered 5 items.";
    pattern = "Customer (\\w+)";
    replacement = "[$1]";
    regex = true;
  }

  function clearAll() {
    text = "";
    pattern = "";
    replacement = "";
  }
</script>

<svelte:head>
  <title>Find &amp; replace — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Bulk text find-and-replace with regex."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/text-replace" />
</svelte:head>

<ToolShell
  title="Find &amp; replace"
  description="Bulk text find-and-replace with regular expressions. Live preview, capture groups via $1 / $2, and case / whole-word options."
>
  <div class="patternRow">
    <LabeledField label="Find" hint={regex ? "Regex pattern. Capture groups → $1 $2 …" : "Plain text"}>
      <input class="textInput mono" bind:value={pattern} placeholder="search…" spellcheck="false" autocomplete="off" />
    </LabeledField>
    <LabeledField label="Replace with" hint={regex ? "Use $1 $2 to reference capture groups." : "Plain text"}>
      <input class="textInput mono" bind:value={replacement} placeholder="replacement…" spellcheck="false" autocomplete="off" />
    </LabeledField>
  </div>

  <div class="optionRow">
    <label class="check"><input type="checkbox" bind:checked={regex} /> <span>Regex</span></label>
    <label class="check"><input type="checkbox" bind:checked={caseSensitive} /> <span>Case sensitive</span></label>
    <label class="check"><input type="checkbox" bind:checked={wholeWord} disabled={regex} /> <span>Whole word</span></label>
  </div>

  <TextAreaInput
    value={text}
    onChange={(v) => (text = v)}
    label="Input text"
    placeholder="Paste text here…"
    minRows={6}
    maxRows={18}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!text && !pattern}>Clear</button>
  </div>

  {#if result.error}
    <p class="errorBox">Regex error: {result.error}</p>
  {/if}

  {#if pattern && !result.error}
    <p class="resultMeta">{result.count.toLocaleString()} replacement{result.count === 1 ? "" : "s"}</p>
  {/if}

  <CodeBlock value={result.output} label="Result" emptyHint="Type input and a search pattern to see the result." />
</ToolShell>

<style>
  .patternRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .textInput {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
  }

  .textInput.mono {
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.9rem;
  }

  .textInput:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .optionRow {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
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

  .quickActions {
    display: inline-flex;
    gap: 8px;
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
    font-size: 0.88rem;
  }
</style>
