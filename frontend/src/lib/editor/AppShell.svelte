<script>
  import { onMount } from "svelte";
  import { loadDocumentAtPath } from "./api.js";
  import { renderMarkdown } from "./markdown.js";
  import { WorkerClient } from "./workerClient.js";

  export let initialPath = "";

  let documentState = null;
  let engineStatus = "idle";
  let engineError = "";
  let outputs = new Map();

  async function runAllBlocks() {
    if (!documentState) return;
    const nextOutputs = new Map();
    const engine = new WorkerClient();
    try {
      engineStatus = "loading";
      engineError = "";
      await engine.initialize();
      engineStatus = "ready";
      for (const block of documentState.blocks.filter((value) => value.type === "code")) {
        const result = await engine.executeBlock(block.content);
        nextOutputs.set(block.id, result);
      }
      outputs = nextOutputs;
    } catch (error) {
      engineStatus = "error";
      engineError = String(error);
    } finally {
      engine.destroy();
    }
  }

  onMount(async () => {
    if (!initialPath) return;
    try {
      const payload = await loadDocumentAtPath(initialPath);
      documentState = payload.document;
      await runAllBlocks();
    } catch (error) {
      engineStatus = "error";
      engineError = String(error);
    }
  });
</script>

<div class="appNotebook">
  <div class="appChrome">
    <div class="pill">Codaro App Mode</div>
    <div class="statusText">{engineStatus}</div>
  </div>

  <main class="appContent">
    {#if !documentState}
      <section class="emptyState">
        <h1>실행할 문서를 찾지 못했습니다.</h1>
        <p>`codaro run path.py` 또는 `/app?path=...` 형태로 진입하세요.</p>
        {#if engineError}
          <p class="errorText">{engineError}</p>
        {/if}
      </section>
    {:else}
      <header class="appHero">
        <h1>{documentState.app?.title || documentState.title}</h1>
        <p>{initialPath}</p>
      </header>

      {#each documentState.blocks as block}
        {#if block.type === "markdown"}
          <section class="appCard prose">{@html renderMarkdown(block.content)}</section>
        {:else if outputs.has(block.id)}
          <section class="appCard">
            {#if outputs.get(block.id).type === "html"}
              <div>{@html outputs.get(block.id).data}</div>
            {:else}
              <pre>{`${outputs.get(block.id).stdout || ""}${outputs.get(block.id).data || ""}${outputs.get(block.id).stderr || ""}`.trim()}</pre>
            {/if}
          </section>
        {/if}
      {/each}
    {/if}
  </main>
</div>

<style>
  .appNotebook {
    min-height: 100vh;
    background: var(--nb-bg);
    color: var(--nb-text);
  }

  .appChrome {
    position: fixed;
    top: 12px;
    right: 16px;
    left: 16px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--nb-accent-soft);
    color: var(--nb-accent);
    font-size: 12px;
    font-weight: 700;
  }

  .statusText {
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    color: var(--nb-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
  }

  .appContent {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 80px 16px 60px;
    display: grid;
    gap: 16px;
  }

  .emptyState,
  .appHero {
    display: grid;
    gap: 10px;
    padding: 20px;
    border-radius: 18px;
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 4rem);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: var(--nb-text-secondary);
  }

  .appCard {
    background: var(--nb-card);
    border: 1px solid var(--nb-border);
    border-radius: 18px;
    padding: 20px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: "Cascadia Code", "Fira Code", monospace;
  }

  .errorText {
    color: var(--nb-error);
  }
</style>
