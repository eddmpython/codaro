<script>
  import CopyButton from "./CopyButton.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} value
   * @property {string} [label]
   * @property {string} [language]
   * @property {boolean} [showLineNumbers]
   * @property {string} [emptyHint]
   * @property {number} [maxHeight]
   */

  /** @type {Props} */
  let { value, label, language, showLineNumbers = false, emptyHint, maxHeight = 480 } = $props();

  let lines = $derived(value === "" ? [] : value.split(/\r\n|\r|\n/));
  let charCount = $derived(value.length);
</script>

<div class="codeWrap">
  {#if label || language}
    <div class="labelRow">
      <div class="leftLabel">
        {#if label}<span class="label">{label}</span>{/if}
        {#if language}<span class="lang">{language}</span>{/if}
      </div>
      <div class="rightActions">
        {#if value}
          <span class="meta">{lines.length} line{lines.length === 1 ? "" : "s"} · {charCount.toLocaleString()} char</span>
          <CopyButton {value} variant="ghost" />
        {/if}
      </div>
    </div>
  {/if}

  {#if value === ""}
    {#if emptyHint}<div class="emptyHint">{emptyHint}</div>{/if}
  {:else}
    <pre class="codeArea" style="max-height: {maxHeight}px;">
{#if showLineNumbers}<div class="lineNumbers" aria-hidden="true">{#each lines as _, i}<span class="lineNum">{i + 1}</span>{/each}</div>{/if}<code class="code">{value}</code>
    </pre>
  {/if}
</div>

<style>
  .codeWrap {
    display: grid;
    gap: 8px;
  }

  .labelRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .leftLabel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .lang {
    font-size: 0.72rem;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 2px 8px;
    border-radius: 6px;
    font-family: "Fira Mono", ui-monospace, monospace;
  }

  .rightActions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .meta {
    font-size: 0.78rem;
    color: var(--text-soft);
  }

  .emptyHint {
    padding: 18px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-soft);
    font-size: 0.88rem;
    text-align: center;
  }

  .codeArea {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    margin: 0;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    overflow: auto;
    font-family: "Fira Mono", ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--text);
  }

  .lineNumbers {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: var(--text-soft);
    user-select: none;
    border-right: 1px solid var(--border);
    padding-right: 10px;
    font-variant-numeric: tabular-nums;
  }

  .lineNum {
    line-height: inherit;
  }

  .code {
    white-space: pre;
    font-family: inherit;
  }
</style>
