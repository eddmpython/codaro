<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import LabeledField from "$lib/components/tools/LabeledField.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import CopyButton from "$lib/components/tools/CopyButton.svelte";

  const meta = findTool("utm-builder");

  let url = $state("");
  let source = $state("");
  let medium = $state("");
  let campaign = $state("");
  let term = $state("");
  let content = $state("");

  /** @type {{ ok: boolean; built: string; error: string | null }} */
  let result = $state({ ok: false, built: "", error: null });

  $effect(() => {
    const u = url.trim();
    if (!u) {
      result = { ok: false, built: "", error: null };
      return;
    }
    if (!source.trim() || !medium.trim() || !campaign.trim()) {
      result = { ok: false, built: "", error: "Source, medium, and campaign are required by Google Analytics standard." };
      return;
    }
    try {
      const parsed = new URL(u.includes("://") ? u : `https://${u}`);
      parsed.searchParams.set("utm_source", source.trim());
      parsed.searchParams.set("utm_medium", medium.trim());
      parsed.searchParams.set("utm_campaign", campaign.trim());
      if (term.trim()) parsed.searchParams.set("utm_term", term.trim());
      if (content.trim()) parsed.searchParams.set("utm_content", content.trim());
      result = { ok: true, built: parsed.toString(), error: null };
    } catch (err) {
      result = { ok: false, built: "", error: err instanceof Error ? err.message : "Invalid URL" };
    }
  });

  function loadSample() {
    url = "https://codaro.dev/landing";
    source = "newsletter";
    medium = "email";
    campaign = "spring_launch";
    content = "hero_cta";
  }

  function clearAll() {
    url = "";
    source = "";
    medium = "";
    campaign = "";
    term = "";
    content = "";
  }
</script>

<svelte:head>
  <title>UTM builder — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Build UTM campaign URLs."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/utm-builder" />
</svelte:head>

<ToolShell
  title="UTM builder"
  description="Add Google Analytics UTM parameters to a URL. Source, medium, and campaign are required. Term and content are optional."
>
  <div class="formGrid">
    <LabeledField label="Destination URL" hint="Including https://">
      <input class="textInput" type="url" bind:value={url} placeholder="https://example.com/landing" autocomplete="off" />
    </LabeledField>

    <div class="row">
      <LabeledField label="utm_source *" hint="Where the traffic comes from (e.g. google, newsletter)">
        <input class="textInput" bind:value={source} placeholder="newsletter" autocomplete="off" />
      </LabeledField>
      <LabeledField label="utm_medium *" hint="Marketing medium (e.g. cpc, email, social)">
        <input class="textInput" bind:value={medium} placeholder="email" autocomplete="off" />
      </LabeledField>
    </div>

    <LabeledField label="utm_campaign *" hint="Campaign name or product launch">
      <input class="textInput" bind:value={campaign} placeholder="spring_launch" autocomplete="off" />
    </LabeledField>

    <div class="row">
      <LabeledField label="utm_term" hint="Paid keywords">
        <input class="textInput" bind:value={term} placeholder="codaro+notebook" autocomplete="off" />
      </LabeledField>
      <LabeledField label="utm_content" hint="Differentiates ads / links pointing to the same URL">
        <input class="textInput" bind:value={content} placeholder="hero_cta" autocomplete="off" />
      </LabeledField>
    </div>
  </div>

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!url}>Clear</button>
  </div>

  {#if result.error}
    <p class="errorBox">{result.error}</p>
  {/if}

  {#if result.ok}
    <div class="resultRow">
      <CodeBlock value={result.built} label="Final URL" />
      <div class="copyRow">
        <CopyButton value={result.built} variant="primary" label="Copy URL" />
      </div>
    </div>
  {/if}
</ToolShell>

<style>
  .formGrid {
    display: grid;
    gap: 14px;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }

  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }

  .textInput {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    font-family: "Fira Mono", ui-monospace, monospace;
    font-size: 0.88rem;
  }

  .textInput:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .quickActions {
    display: inline-flex;
    gap: 8px;
  }

  .resultRow {
    display: grid;
    gap: 8px;
  }

  .copyRow {
    display: inline-flex;
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
