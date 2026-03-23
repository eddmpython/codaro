<script lang="ts">
  import { Circle, Square, FileCode, PlusSquare, X } from "lucide-svelte";
  import {
    getRecordingState,
    getGeneratedRecipe,
    startRecording,
    stopRecording,
  } from "../stores/automationStore.svelte";

  interface Props {
    onInsertRecipe?: (code: string) => void;
  }

  let { onInsertRecipe }: Props = $props();

  let recording = $derived(getRecordingState());
  let recipe = $derived(getGeneratedRecipe());
  let showRecipe = $state(false);

  async function handleToggle() {
    if (recording.active) {
      await stopRecording("Recorded Automation");
      showRecipe = true;
    } else {
      showRecipe = false;
      await startRecording();
    }
  }

  function handleInsert() {
    if (recipe && onInsertRecipe) {
      onInsertRecipe(recipe);
      showRecipe = false;
    }
  }

  function handleDismiss() {
    showRecipe = false;
  }
</script>

<div class="recording-controls">
  <div class="recording-header">
    <span class="section-label">Recording</span>
    <button
      class="record-btn"
      class:active={recording.active}
      type="button"
      onclick={() => void handleToggle()}
    >
      {#if recording.active}
        <Square class="h-3.5 w-3.5" />
        <span>Stop</span>
      {:else}
        <Circle class="h-3.5 w-3.5" />
        <span>Record</span>
      {/if}
    </button>
  </div>

  {#if recording.active}
    <div class="recording-status">
      <div class="rec-indicator"></div>
      <span>Recording in progress...</span>
    </div>
  {/if}

  {#if showRecipe && recipe}
    <div class="recipe-preview">
      <div class="recipe-header">
        <FileCode class="h-3.5 w-3.5" />
        <span>Generated Code</span>
        <div class="recipe-actions">
          {#if onInsertRecipe}
            <button
              type="button"
              class="recipe-action-btn insert"
              onclick={handleInsert}
              title="Insert into notebook"
            >
              <PlusSquare class="h-3 w-3" />
              <span>Insert</span>
            </button>
          {/if}
          <button
            type="button"
            class="recipe-action-btn dismiss"
            onclick={handleDismiss}
            title="Dismiss"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>
      <pre class="recipe-code">{recipe}</pre>
    </div>
  {/if}
</div>

<style>
  .recording-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .recording-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .record-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s;
  }

  .record-btn:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .record-btn.active {
    border-color: hsl(0 70% 50%);
    color: hsl(0 70% 50%);
  }

  .recording-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background: hsl(0 70% 50% / 0.06);
    color: hsl(0 70% 50%);
    font-size: 12px;
  }

  .rec-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: hsl(0 70% 50%);
    animation: blink 1s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .recipe-preview {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .recipe-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    font-size: 11px;
    font-weight: 500;
    color: var(--muted-foreground);
  }

  .recipe-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .recipe-action-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 10px;
    cursor: pointer;
    font-family: inherit;
  }

  .recipe-action-btn.insert {
    color: #4ade80;
    border-color: #166534;
  }

  .recipe-action-btn.insert:hover {
    background: #166534;
  }

  .recipe-action-btn.dismiss:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .recipe-code {
    padding: 8px 10px;
    margin: 0;
    font-size: 11px;
    font-family: var(--monospace-font, monospace);
    color: var(--foreground);
    overflow: auto;
    max-height: 200px;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
