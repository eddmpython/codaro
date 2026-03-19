<script lang="ts">
  interface Props {
    output?: string;
    isConnected?: boolean;
    onSendCommand?: (command: string) => void;
  }

  let {
    output = "",
    isConnected = false,
    onSendCommand = () => {}
  }: Props = $props();

  let inputValue = $state("");
  let outputEl: HTMLPreElement | undefined = $state();

  $effect(() => {
    if (outputEl && output) {
      requestAnimationFrame(() => {
        outputEl?.scrollTo({ top: outputEl.scrollHeight });
      });
    }
  });

  function handleSubmit(): void {
    if (inputValue.trim()) {
      onSendCommand(inputValue);
      inputValue = "";
    }
  }
</script>

<div class="terminal-panel" data-testid="terminal-panel">
  <pre class="termOutput" bind:this={outputEl}>{output || (isConnected ? "Terminal connected.\n" : "Terminal not connected.\n")}</pre>
  <div class="termInput">
    <span class="prompt">$</span>
    <input
      bind:value={inputValue}
      class="cmdInput"
      placeholder={isConnected ? "Type a command..." : "Not connected"}
      disabled={!isConnected}
      onkeydown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
    />
  </div>
</div>

<style>
  .terminal-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
  }

  .termOutput {
    flex: 1;
    margin: 0;
    padding: 8px 10px;
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    line-height: 1.5;
    color: var(--foreground);
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .termInput {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-top: 1px solid var(--border);
  }

  .prompt {
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    color: var(--muted-foreground);
  }

  .cmdInput {
    flex: 1;
    border: none;
    background: transparent;
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    color: var(--foreground);
    outline: none;
  }

  .cmdInput:disabled {
    opacity: 0.5;
  }
</style>
