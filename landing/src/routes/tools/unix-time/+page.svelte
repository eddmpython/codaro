<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import KeyValueOutput from "$lib/components/tools/KeyValueOutput.svelte";
  import CopyButton from "$lib/components/tools/CopyButton.svelte";

  const meta = findTool("unix-time");

  let timestampInput = $state("");
  let isoInput = $state("");
  let now = $state(/** @type {Date} */ (new Date()));
  /** @type {ReturnType<typeof setInterval> | null} */
  let nowTimer = null;

  $effect(() => {
    nowTimer = setInterval(() => {
      now = new Date();
    }, 1000);
    return () => {
      if (nowTimer) clearInterval(nowTimer);
    };
  });

  /** @param {Date} d */
  function dateRows(d) {
    const utcOffset = -d.getTimezoneOffset();
    const sign = utcOffset >= 0 ? "+" : "-";
    const offHours = String(Math.floor(Math.abs(utcOffset) / 60)).padStart(2, "0");
    const offMin = String(Math.abs(utcOffset) % 60).padStart(2, "0");
    return [
      { key: "Unix seconds", value: String(Math.floor(d.getTime() / 1000)), mono: true },
      { key: "Unix milliseconds", value: String(d.getTime()), mono: true },
      { key: "ISO 8601 (UTC)", value: d.toISOString(), mono: true },
      { key: "Local string", value: d.toString() },
      { key: "Local offset", value: `UTC${sign}${offHours}:${offMin}`, mono: true },
      { key: "Day of week", value: d.toLocaleDateString(undefined, { weekday: "long" }) },
    ];
  }

  let parsedFromTimestamp = $derived.by(() => {
    const s = timestampInput.trim();
    if (!s) return null;
    const num = Number(s);
    if (Number.isNaN(num)) return { error: "Not a number." };
    let ms;
    if (s.length >= 13) ms = num;
    else ms = num * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { error: "Out of range." };
    return { date: d };
  });

  let parsedFromIso = $derived.by(() => {
    const s = isoInput.trim();
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return { error: "Could not parse this date." };
    return { date: d };
  });

  function useNow() {
    timestampInput = String(Math.floor(Date.now() / 1000));
    isoInput = "";
  }

  function clearAll() {
    timestampInput = "";
    isoInput = "";
  }
</script>

<svelte:head>
  <title>Unix timestamp — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Convert between Unix timestamps and ISO dates."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/unix-time" />
</svelte:head>

<ToolShell
  title="Unix timestamp"
  description="Convert between Unix timestamps and ISO 8601 dates. Auto-detects seconds vs milliseconds. Shows local timezone offset."
>
  <section class="nowCard">
    <div class="nowHead">
      <span class="nowLabel">Right now</span>
      <CopyButton value={() => String(Math.floor(now.getTime() / 1000))} label="Copy seconds" />
    </div>
    <div class="nowMain">
      <span class="nowSeconds mono">{Math.floor(now.getTime() / 1000)}</span>
      <span class="nowIso mono">{now.toISOString()}</span>
    </div>
    <button class="ghostButton" type="button" onclick={useNow}>Use as input</button>
  </section>

  <div class="splitRow">
    <div class="halfCard">
      <LabeledField
        label="Unix timestamp → date"
        hint="Auto-detects seconds (10 digits) vs milliseconds (13 digits)."
      >
        <input
          class="textInput mono"
          type="text"
          bind:value={timestampInput}
          placeholder="1735689600"
          spellcheck="false"
          autocomplete="off"
        />
      </LabeledField>
      {#if parsedFromTimestamp}
        {#if "error" in parsedFromTimestamp}
          <p class="errorInline">{parsedFromTimestamp.error}</p>
        {:else}
          <KeyValueOutput pairs={dateRows(parsedFromTimestamp.date)} />
        {/if}
      {/if}
    </div>

    <div class="halfCard">
      <LabeledField
        label="ISO date → timestamp"
        hint="Accepts ISO 8601, RFC 2822, or any string Date can parse."
      >
        <input
          class="textInput mono"
          type="text"
          bind:value={isoInput}
          placeholder="2025-01-04T08:00:00Z"
          spellcheck="false"
          autocomplete="off"
        />
      </LabeledField>
      {#if parsedFromIso}
        {#if "error" in parsedFromIso}
          <p class="errorInline">{parsedFromIso.error}</p>
        {:else}
          <KeyValueOutput pairs={dateRows(parsedFromIso.date)} />
        {/if}
      {/if}
    </div>
  </div>

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!timestampInput && !isoInput}>Clear</button>
  </div>
</ToolShell>

<style>
  .nowCard {
    display: grid;
    gap: 10px;
    padding: 16px 18px;
    border: 1px solid var(--brand-accent);
    background: var(--accent-soft);
    border-radius: var(--radius-sm);
  }

  .nowHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nowLabel {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--brand-accent);
    font-weight: 600;
  }

  .nowMain {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .nowSeconds {
    font-size: 1.4rem;
    color: var(--text);
    font-weight: 600;
  }

  .nowIso {
    color: var(--text-muted);
  }

  .mono {
    font-family: "Fira Mono", ui-monospace, monospace;
  }

  .splitRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 14px;
  }

  .halfCard {
    display: grid;
    gap: 10px;
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
    font-size: 0.95rem;
  }

  .textInput:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .errorInline {
    margin: 0;
    padding: 8px 10px;
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.08);
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .quickActions {
    display: inline-flex;
    gap: 8px;
  }
</style>
