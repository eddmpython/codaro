<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";

  const meta = findTool("text-diff");

  let left = $state("");
  let right = $state("");

  /** @type {{ kind: "same" | "add" | "del"; line: string; aIndex: number | null; bIndex: number | null }[]} */
  let diff = $state([]);
  let stats = $state({ added: 0, removed: 0, same: 0 });

  $effect(() => {
    const a = left;
    const b = right;
    if (!a && !b) {
      diff = [];
      stats = { added: 0, removed: 0, same: 0 };
      return;
    }
    let cancelled = false;
    (async () => {
      const { diffLines, diffStats } = await import("$lib/tools/textOps.js");
      const d = diffLines(a, b);
      if (cancelled) return;
      diff = d;
      stats = diffStats(d);
    })();
    return () => {
      cancelled = true;
    };
  });

  function swap() {
    const tmp = left;
    left = right;
    right = tmp;
  }

  function loadSample() {
    left = "Codaro\ntools index\nsearch + chips\nv1\n";
    right = "Codaro\ntools index\nsearch + chips + filter\nregistry-driven\nv2\n";
  }

  function clearAll() {
    left = "";
    right = "";
  }
</script>

<svelte:head>
  <title>Text diff — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Compare two texts side-by-side. Highlights changes."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/text-diff" />
</svelte:head>

<ToolShell
  title="Text diff"
  description="Compare two texts line by line. Additions, removals, and unchanged lines are color-coded."
>
  <div class="inputRow">
    <TextAreaInput
      value={left}
      onChange={(v) => (left = v)}
      label="Left (original)"
      placeholder="Paste original text here…"
      minRows={8}
      maxRows={14}
    />
    <TextAreaInput
      value={right}
      onChange={(v) => (right = v)}
      label="Right (changed)"
      placeholder="Paste changed text here…"
      minRows={8}
      maxRows={14}
    />
  </div>

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={swap}>Swap sides</button>
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!left && !right}>Clear</button>
  </div>

  {#if diff.length > 0}
    <div class="statsRow">
      <span class="statBadge added">+{stats.added}</span>
      <span class="statBadge removed">−{stats.removed}</span>
      <span class="statBadge same">={stats.same}</span>
    </div>

    <div class="diffPanel">
      {#each diff as row}
        <div class="diffRow {row.kind}">
          <span class="lineCol left">{row.aIndex ?? ""}</span>
          <span class="lineCol right">{row.bIndex ?? ""}</span>
          <span class="sign" aria-hidden="true">{row.kind === "add" ? "+" : row.kind === "del" ? "−" : " "}</span>
          <code>{row.line}</code>
        </div>
      {/each}
    </div>
  {:else}
    <div class="emptyHint">Paste text on both sides to see the diff.</div>
  {/if}
</ToolShell>

<style>
  .inputRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
  }

  .quickActions {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .statsRow {
    display: inline-flex;
    gap: 8px;
  }

  .statBadge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-family: "Fira Mono", ui-monospace, monospace;
    font-weight: 600;
  }

  .statBadge.added {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
  }

  .statBadge.removed {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }

  .statBadge.same {
    background: var(--surface-muted);
    color: var(--text-soft);
  }

  .diffPanel {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    overflow-x: auto;
    max-height: 600px;
    overflow-y: auto;
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.85rem;
    line-height: 1.55;
  }

  .diffRow {
    display: grid;
    grid-template-columns: 50px 50px 24px 1fr;
    align-items: baseline;
    gap: 6px;
    padding: 0 14px;
  }

  .diffRow.add {
    background: rgba(34, 197, 94, 0.08);
    color: #86efac;
  }

  .diffRow.del {
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
  }

  .diffRow.same {
    color: var(--text-muted);
  }

  .lineCol {
    color: var(--text-soft);
    text-align: right;
    user-select: none;
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
  }

  .sign {
    text-align: center;
    user-select: none;
  }

  .diffRow code {
    white-space: pre;
    overflow-wrap: anywhere;
    background: transparent;
    padding: 0;
    font-family: inherit;
  }

  .emptyHint {
    padding: 22px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-soft);
    text-align: center;
  }
</style>
