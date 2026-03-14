<script>
  import { marked } from "marked";

  export let content = "";
  export let isActive = false;
  export let isEditing = false;
  export let onContentChange = () => {};
  export let onStartEdit = () => {};
  export let onStopEdit = () => {};
  export let onShiftEnter = () => {};

  let textareaEl = null;

  $: renderedHtml = marked.parse(content || "*Empty markdown cell*");

  function handleKeydown(event) {
    if (event.key === "Escape") {
      onStopEdit();
    }
    if (event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      onStopEdit();
      onShiftEnter();
    }
  }

  function handleInput(event) {
    onContentChange(event.target.value);
    autoResize(event.target);
  }

  function autoResize(element) {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  $: if (isEditing && textareaEl) {
    textareaEl.focus();
    autoResize(textareaEl);
  }
</script>

<div class="markdownCell" class:active={isActive}>
  {#if isEditing}
    <textarea
      bind:this={textareaEl}
      value={content}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={onStopEdit}
      class="markdownEditor"
      placeholder="Enter markdown..."
    ></textarea>
  {:else}
    <div
      class="markdownPreview"
      ondblclick={onStartEdit}
      role="textbox"
      tabindex="0"
      onkeydown={(event) => event.key === "Enter" && onStartEdit()}
    >
      {@html renderedHtml}
    </div>
  {/if}
</div>

<style>
  .markdownCell {
    transition: border-color var(--nb-transition);
  }

  .markdownPreview {
    padding: 14px 18px;
    color: var(--nb-text);
    cursor: text;
    min-height: 32px;
    line-height: 1.7;
  }

  .markdownPreview :global(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--nb-text);
    letter-spacing: -0.02em;
  }

  .markdownPreview :global(h2) {
    font-size: 1.25rem;
    font-weight: 650;
    margin-bottom: 0.4rem;
    color: var(--nb-text);
    letter-spacing: -0.01em;
  }

  .markdownPreview :global(h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: var(--nb-text);
  }

  .markdownPreview :global(p) {
    margin-bottom: 0.5rem;
    color: var(--nb-text-secondary);
  }

  .markdownPreview :global(strong) {
    color: var(--nb-text);
    font-weight: 600;
  }

  .markdownPreview :global(em) {
    color: var(--nb-text-secondary);
  }

  .markdownPreview :global(code) {
    background: var(--nb-code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: var(--nb-font-code);
    font-size: 0.85rem;
    color: var(--nb-accent);
  }

  .markdownPreview :global(pre) {
    background: var(--nb-code-bg);
    border-radius: var(--nb-radius-sm);
    overflow-x: auto;
    margin: 8px 0;
  }

  .markdownPreview :global(pre code) {
    display: block;
    padding: 12px 14px;
    background: transparent;
    color: var(--nb-code-text);
    font-size: 13px;
    line-height: 1.5;
  }

  .markdownPreview :global(blockquote) {
    border-left: 3px solid var(--nb-accent);
    padding-left: 14px;
    color: var(--nb-text-secondary);
    margin: 8px 0;
    font-style: italic;
  }

  .markdownPreview :global(ul),
  .markdownPreview :global(ol) {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--nb-text-secondary);
  }

  .markdownPreview :global(li) {
    margin-bottom: 0.25rem;
  }

  .markdownPreview :global(a) {
    color: var(--nb-accent);
    text-decoration: none;
  }

  .markdownPreview :global(a:hover) {
    text-decoration: underline;
  }

  .markdownPreview :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 13px;
  }

  .markdownPreview :global(th),
  .markdownPreview :global(td) {
    border: 1px solid var(--nb-border);
    padding: 6px 12px;
    text-align: left;
  }

  .markdownPreview :global(th) {
    background: var(--nb-surface);
    font-weight: 600;
    color: var(--nb-text);
  }

  .markdownPreview :global(hr) {
    border: none;
    height: 1px;
    background: var(--nb-border);
    margin: 16px 0;
  }

  .markdownPreview :global(img) {
    max-width: 100%;
    border-radius: var(--nb-radius-sm);
  }

  .markdownEditor {
    width: 100%;
    min-height: 80px;
    padding: 14px 18px;
    background: var(--nb-surface);
    border: none;
    color: var(--nb-text);
    font-family: var(--nb-font-code);
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    outline: none;
  }
</style>
