<script lang="ts">
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { Play } from "lucide-svelte";
  import OutputRenderer from "./OutputRenderer.svelte";
  import { getBootstrap, loadDocumentAtPath } from "../api";
  import { PyodideEngine } from "../engines/pyodideEngine";
  import type { ExecutionEngine } from "../engines/executionEngine";
  import { ServerKernelEngine } from "../engines/serverKernelEngine";
  import type { CodaroDocument, EngineExecutionResult } from "../types";

  interface Props {
    initialPath?: string;
  }

  let { initialPath = "" }: Props = $props();

  let bootstrap: { documentPath?: string | null } | null = $state(null);
  let documentState: CodaroDocument | null = $state(null);
  let currentPath = $state("");
  let engine: ExecutionEngine | null = $state(null);
  let engineName = $state("none");
  let engineStatus = $state("idle");
  let engineError = $state("");
  let outputs = $state(new Map<string, EngineExecutionResult>());
  let loading = $state(true);

  function renderMarkdown(content: string): string {
    return String(marked.parse(content || ""));
  }

  function shouldRenderCode(blockId: string): boolean {
    if (!documentState) {
      return false;
    }
    if (!documentState.app.entryBlockIds || documentState.app.entryBlockIds.length === 0) {
      return true;
    }
    return documentState.app.entryBlockIds.includes(blockId);
  }

  async function createEngine(): Promise<void> {
    engine?.destroy();
    engine = null;
    engineName = "none";
    engineStatus = "loading";
    engineError = "";

    try {
      const serverEngine = new ServerKernelEngine();
      await serverEngine.initialize();
      engine = serverEngine;
      engineName = "server";
      engineStatus = "ready";
    } catch {
      try {
        const pyodideEngine = new PyodideEngine();
        await pyodideEngine.initialize();
        engine = pyodideEngine;
        engineName = "pyodide";
        engineStatus = "ready";
      } catch (error) {
        engineStatus = "error";
        engineError = error instanceof Error ? error.message : String(error);
      }
    }
  }

  async function runDocument(): Promise<void> {
    if (!documentState) {
      return;
    }
    await createEngine();
    if (!engine) {
      return;
    }

    const nextOutputs = new Map<string, EngineExecutionResult>();
    engineStatus = "running";
    engineError = "";

    for (const block of documentState.blocks.filter((entry) => entry.type === "code")) {
      try {
        const result = await engine.execute(block.content, block.id);
        nextOutputs.set(block.id, result);
        if (result.status === "error") {
          engineStatus = "error";
          engineError = result.stderr || "Execution failed.";
          outputs = nextOutputs;
          return;
        }
      } catch (error) {
        engineStatus = "error";
        engineError = error instanceof Error ? error.message : String(error);
        outputs = nextOutputs;
        return;
      }
    }

    outputs = nextOutputs;
    engineStatus = "ready";
  }

  async function initialize(): Promise<void> {
    loading = true;
    try {
      bootstrap = await getBootstrap();
      currentPath = initialPath || bootstrap.documentPath || "";
      if (!currentPath) {
        engineStatus = "error";
        engineError = "No document path provided.";
        return;
      }
      const payload = await loadDocumentAtPath(currentPath);
      documentState = payload.document;
      await runDocument();
    } catch (error) {
      engineStatus = "error";
      engineError = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void initialize();
    return () => {
      engine?.destroy();
    };
  });
</script>

<div class="appShell">
  <header class="appHead">
    <div>
      <p class="eyebrow">App mode</p>
      <h1>{documentState?.app.title || documentState?.title || "Codaro"}</h1>
      <p class="pathText">{currentPath || "No document"}</p>
    </div>
    <div class="actions">
      <button onclick={() => void runDocument()} disabled={!documentState || engineStatus === "running"}>
        <Play size={14} />
        <span>Run again</span>
      </button>
      <span class="status">{engineName}</span>
      <span class="status">{engineStatus}</span>
    </div>
  </header>

  <main class="appContent">
    {#if loading}
      <div class="screenState">Loading app…</div>
    {:else if engineError && !documentState}
      <div class="screenState">{engineError}</div>
    {:else if documentState}
      {#if engineError}
        <div class="errorBanner">{engineError}</div>
      {/if}

      {#each documentState.blocks as block (block.id)}
        {#if block.type === "markdown"}
          <section class="card prose">{@html renderMarkdown(block.content)}</section>
        {:else if shouldRenderCode(block.id)}
          <section class="card">
            {#if !documentState.app.hideCode}
              <pre class="codeBlock">{block.content}</pre>
            {/if}
            {#if outputs.has(block.id)}
              <OutputRenderer result={outputs.get(block.id)} />
            {/if}
          </section>
        {/if}
      {/each}
    {/if}
  </main>
</div>

<style>
  .appShell {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(24, 24, 27, 0.05), transparent 28%),
      var(--cd-bg);
    color: var(--cd-text);
  }

  .appHead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    padding: 24px 20px 12px;
    max-width: 1080px;
    margin: 0 auto;
  }

  .eyebrow,
  .pathText,
  .status {
    color: var(--cd-text-muted);
  }

  .eyebrow {
    margin: 0 0 8px;
    font: 11px/1.4 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 0.98;
    letter-spacing: -0.06em;
  }

  .pathText {
    margin: 10px 0 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-pill);
    background: var(--cd-card);
    color: var(--cd-text);
    cursor: pointer;
  }

  .status {
    padding: 8px 10px;
    border-radius: var(--cd-radius-pill);
    background: var(--cd-surface);
    font: 11px/1.4 var(--cd-font-code);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .appContent {
    max-width: 980px;
    margin: 0 auto;
    padding: 16px 20px 96px;
    display: grid;
    gap: 16px;
  }

  .card,
  .errorBanner {
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-lg);
    background: var(--cd-card);
    box-shadow: var(--cd-shadow);
  }

  .card {
    overflow: hidden;
  }

  .prose {
    padding: 20px;
  }

  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3) {
    margin: 0 0 10px;
    letter-spacing: -0.04em;
  }

  .prose :global(p),
  .prose :global(ul),
  .prose :global(ol) {
    color: var(--cd-text-muted);
  }

  .codeBlock {
    margin: 0;
    padding: 18px 20px;
    border-bottom: 1px solid var(--cd-border);
    background: var(--cd-code-bg);
    overflow-x: auto;
    font: 13px/1.6 var(--cd-font-code);
  }

  .errorBanner {
    padding: 12px 14px;
    color: var(--cd-error);
    background: rgba(185, 28, 28, 0.06);
  }
</style>
