<script lang="ts">
  import { Play, Trash2 } from "lucide-svelte";

  interface Props {
    onExecute?: (code: string) => void;
    result?: string;
  }

  let {
    onExecute = () => {},
    result = ""
  }: Props = $props();

  let code = $state("");

  function handleRun(): void {
    if (code.trim()) {
      onExecute(code);
    }
  }
</script>

<div class="scratchpad-panel" data-testid="scratchpad-panel">
  <div class="toolbar">
    <button class="toolBtn" onclick={handleRun} disabled={!code.trim()} aria-label="Run">
      <Play class="h-3.5 w-3.5" />
      <span>Run</span>
    </button>
    <button class="toolBtn" onclick={() => { code = ""; }} aria-label="Clear">
      <Trash2 class="h-3.5 w-3.5" />
      <span>Clear</span>
    </button>
  </div>

  <div class="editorArea">
    <textarea
      bind:value={code}
      class="scratchInput"
      placeholder="Write scratch code here..."
      spellcheck="false"
      onkeydown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          handleRun();
        }
      }}
    ></textarea>
  </div>

  {#if result}
    <div class="resultArea">
      <pre class="resultOutput">{result}</pre>
    </div>
  {/if}
</div>

<style>
  .scratchpad-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }

  .toolBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    font-size: 12px;
    color: var(--foreground);
    cursor: pointer;
  }

  .toolBtn:hover {
    background: var(--accent);
  }

  .toolBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .editorArea {
    flex: 1;
    min-height: 80px;
  }

  .scratchInput {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 8px 12px;
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    line-height: 1.5;
    background: transparent;
    color: var(--foreground);
    outline: none;
  }

  .resultArea {
    border-top: 1px solid var(--border);
    max-height: 200px;
    overflow-y: auto;
  }

  .resultOutput {
    margin: 0;
    padding: 8px 12px;
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
