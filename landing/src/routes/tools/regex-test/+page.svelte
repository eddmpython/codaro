<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";

  const meta = findTool("regex-test");

  let pattern = $state("");
  let flags = $state("g");
  let text = $state("");

  /** @type {{ matches: { match: string; index: number; groups: string[] }[]; error: string | null }} */
  let result = $state({ matches: [], error: null });

  /** @param {string} flag */
  function toggleFlag(flag) {
    if (flags.includes(flag)) flags = flags.replace(flag, "");
    else flags += flag;
  }

  $effect(() => {
    const p = pattern;
    const f = flags;
    const t = text;
    if (!p || !t) {
      result = { matches: [], error: null };
      return;
    }
    try {
      const re = new RegExp(p, f);
      /** @type {{ match: string; index: number; groups: string[] }[]} */
      const matches = [];
      if (f.includes("g")) {
        let m;
        while ((m = re.exec(t)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === re.lastIndex) re.lastIndex++;
          if (matches.length >= 1000) break;
        }
      } else {
        const m = re.exec(t);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      result = { matches, error: null };
    } catch (err) {
      result = { matches: [], error: err instanceof Error ? err.message : String(err) };
    }
  });

  function loadSample() {
    pattern = "(\\w+)@(\\w+\\.\\w+)";
    flags = "g";
    text = "Contact alice@example.com or support@codaro.dev for help.\nNot a match: alice at example dot com.";
  }

  function clearAll() {
    pattern = "";
    text = "";
  }

  /** @param {string} t @param {{ match: string; index: number; groups: string[] }[]} matches */
  function highlightMatches(t, matches) {
    if (!matches.length) return [{ kind: "text", value: t }];
    /** @type {{ kind: "text" | "match"; value: string; idx?: number }[]} */
    const parts = [];
    let cursor = 0;
    matches.forEach((m, i) => {
      if (m.index > cursor) parts.push({ kind: "text", value: t.slice(cursor, m.index) });
      parts.push({ kind: "match", value: m.match, idx: i + 1 });
      cursor = m.index + m.match.length;
    });
    if (cursor < t.length) parts.push({ kind: "text", value: t.slice(cursor) });
    return parts;
  }

  let highlighted = $derived(highlightMatches(text, result.matches));
</script>

<svelte:head>
  <title>Regex tester — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Live regex testing with capture groups."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/regex-test" />
</svelte:head>

<ToolShell
  title="Regex tester"
  description="Test regular expressions live. See all matches, capture groups, and toggle flags. Up to 1000 matches displayed."
>
  <div class="patternBox">
    <span class="slash">/</span>
    <input class="patternInput mono" bind:value={pattern} placeholder="pattern" spellcheck="false" autocomplete="off" />
    <span class="slash">/</span>
    <div class="flagChips" role="group" aria-label="Regex flags">
      {#each [
        { f: "g", title: "global" },
        { f: "i", title: "ignore case" },
        { f: "m", title: "multiline ^/$ per line" },
        { f: "s", title: "dotAll" },
        { f: "u", title: "unicode" },
        { f: "y", title: "sticky" },
      ] as opt}
        <button
          type="button"
          class="flagChip"
          class:active={flags.includes(opt.f)}
          onclick={() => toggleFlag(opt.f)}
          title={opt.title}
        >
          {opt.f}
        </button>
      {/each}
    </div>
  </div>

  <TextAreaInput
    value={text}
    onChange={(v) => (text = v)}
    label="Test string"
    placeholder="Paste text to match against…"
    minRows={6}
    maxRows={14}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!pattern && !text}>Clear</button>
  </div>

  {#if result.error}
    <p class="errorBox">Regex error: {result.error}</p>
  {:else if pattern && text && result.matches.length === 0}
    <p class="emptyHint">No matches.</p>
  {:else if result.matches.length > 0}
    <p class="resultMeta">{result.matches.length.toLocaleString()} match{result.matches.length === 1 ? "" : "es"}</p>

    <div class="highlightView">
      {#each highlighted as part}
        {#if part.kind === "match"}
          <mark>{part.value}</mark>
        {:else}
          <span>{part.value}</span>
        {/if}
      {/each}
    </div>

    <details class="matchTable">
      <summary>Match table ({result.matches.length})</summary>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Match</th>
            <th>Index</th>
            <th>Groups</th>
          </tr>
        </thead>
        <tbody>
          {#each result.matches as m, i}
            <tr>
              <td>{i + 1}</td>
              <td><code>{m.match}</code></td>
              <td>{m.index}</td>
              <td><code class="groups">{m.groups.length ? JSON.stringify(m.groups) : "—"}</code></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>
  {/if}
</ToolShell>

<style>
  .patternBox {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .slash {
    color: var(--text-soft);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 1.1rem;
  }

  .patternInput {
    flex: 1;
    min-width: 200px;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
  }

  .patternInput.mono {
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.95rem;
  }

  .patternInput:focus {
    outline: none;
    border-color: var(--brand-accent);
  }

  .flagChips {
    display: inline-flex;
    gap: 4px;
  }

  .flagChip {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text-muted);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .flagChip.active {
    background: var(--brand-accent);
    color: var(--primary-foreground);
    border-color: var(--brand-accent);
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

  .emptyHint {
    margin: 0;
    color: var(--text-soft);
    padding: 12px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    text-align: center;
  }

  .highlightView {
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .highlightView mark {
    background: var(--brand-accent);
    color: var(--primary-foreground);
    padding: 0 3px;
    border-radius: 4px;
  }

  .matchTable {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    padding: 12px 14px;
  }

  .matchTable summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .matchTable table {
    width: 100%;
    margin-top: 12px;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .matchTable th,
  .matchTable td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  .matchTable th {
    color: var(--text-soft);
    font-weight: 500;
  }

  .matchTable code {
    font-family: "Fira Mono", ui-monospace, monospace;
    background: var(--surface-muted);
    padding: 1px 6px;
    border-radius: 4px;
  }

  .matchTable .groups {
    background: transparent;
    padding: 0;
    color: var(--text-soft);
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
