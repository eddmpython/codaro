<script>
  import { brand } from "$lib/brand";
  import { findTool } from "$lib/tools/registry.js";
  import ToolShell from "$lib/components/tools/ToolShell.svelte";
  import TextAreaInput from "$lib/components/tools/TextAreaInput.svelte";
  import CodeBlock from "$lib/components/tools/CodeBlock.svelte";
  import KeyValueOutput from "$lib/components/tools/KeyValueOutput.svelte";

  const meta = findTool("jwt-decode");

  let token = $state("");

  /** @type {{ ok: boolean; header: string; payload: string; signature: string; claims: { key: string; value: string; hint?: string }[]; alg: string; expired: boolean | null; error: string | null }} */
  let display = $state({
    ok: false,
    header: "",
    payload: "",
    signature: "",
    claims: [],
    alg: "—",
    expired: null,
    error: null,
  });

  $effect(() => {
    const t = token.trim();
    if (!t) {
      display = { ok: false, header: "", payload: "", signature: "", claims: [], alg: "—", expired: null, error: null };
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { decodeJwt, explainClaims } = await import("$lib/tools/jwtDecode.js");
        const decoded = decodeJwt(t);
        if (cancelled) return;
        const exp = typeof decoded.payload.exp === "number" ? decoded.payload.exp * 1000 : null;
        const expired = exp === null ? null : exp < Date.now();
        display = {
          ok: true,
          header: JSON.stringify(decoded.header, null, 2),
          payload: JSON.stringify(decoded.payload, null, 2),
          signature: decoded.signature,
          claims: explainClaims(decoded.payload),
          alg: typeof decoded.header.alg === "string" ? decoded.header.alg : "—",
          expired,
          error: null,
        };
      } catch (err) {
        if (!cancelled) {
          display = {
            ok: false,
            header: "",
            payload: "",
            signature: "",
            claims: [],
            alg: "—",
            expired: null,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  function loadSample() {
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNvZGFybyBVc2VyIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjk5OTk5OTk5OTl9.dGVzdF9zaWduYXR1cmU";
  }

  function clearAll() {
    token = "";
  }
</script>

<svelte:head>
  <title>JWT decoder — {brand.name}</title>
  <meta name="description" content={meta?.description ?? "Decode JWT tokens and inspect claims."} />
  <link rel="canonical" href="{brand.siteUrl}/tools/jwt-decode" />
</svelte:head>

<ToolShell
  title="JWT decoder"
  description="Decode the header and payload of a JWT. Inspect claims, algorithm, expiration. The signature is shown but never verified — that requires the secret or public key."
>
  <TextAreaInput
    value={token}
    onChange={(v) => (token = v)}
    label="JWT token"
    placeholder="eyJhbGciOi…"
    minRows={4}
    maxRows={10}
  />

  <div class="quickActions">
    <button class="ghostButton" type="button" onclick={loadSample}>Load sample</button>
    <button class="ghostButton" type="button" onclick={clearAll} disabled={!token}>Clear</button>
  </div>

  {#if display.error}
    <p class="errorBox">{display.error}</p>
  {/if}

  {#if display.ok}
    <div class="badgeRow">
      <span class="badge alg">alg: {display.alg}</span>
      {#if display.expired === true}
        <span class="badge expired">Expired</span>
      {:else if display.expired === false}
        <span class="badge valid">Active (exp not reached)</span>
      {/if}
      <span class="warn">⚠ Signature not verified</span>
    </div>

    <h3 class="sectionTitle">Header</h3>
    <CodeBlock value={display.header} language="json" />

    <h3 class="sectionTitle">Payload</h3>
    <CodeBlock value={display.payload} language="json" />

    {#if display.claims.length > 0}
      <h3 class="sectionTitle">Claims explained</h3>
      <KeyValueOutput pairs={display.claims} />
    {/if}

    <h3 class="sectionTitle">Signature (raw)</h3>
    <CodeBlock value={display.signature} />
  {/if}
</ToolShell>

<style>
  .quickActions {
    display: inline-flex;
    gap: 8px;
  }

  .badgeRow {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .badge.alg {
    background: var(--accent-soft);
    color: var(--brand-accent);
    font-family: "Fira Mono", ui-monospace, monospace;
  }

  .badge.expired {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }

  .badge.valid {
    background: rgba(34, 197, 94, 0.12);
    color: #86efac;
  }

  .warn {
    color: var(--text-soft);
    font-size: 0.8rem;
  }

  .sectionTitle {
    margin: 8px 0 0;
    font-size: 0.82rem;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
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
