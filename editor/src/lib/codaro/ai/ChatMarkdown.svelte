<script lang="ts">
  import { marked } from "marked";

  interface Props {
    content: string;
  }

  let { content }: Props = $props();

  let rendered = $derived.by(() => {
    if (!content) return "";
    try {
      return String(marked.parse(content, { async: false, gfm: true, breaks: true }));
    } catch {
      return content;
    }
  });

  function handleCopy(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const pre = btn.closest(".code-block-wrap")?.querySelector("pre code");
    if (pre) {
      navigator.clipboard.writeText(pre.textContent ?? "");
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy"; }, 1500);
    }
  }
</script>

<div class="chat-markdown">
  {@html rendered}
</div>

<style>
  .chat-markdown {
    font-size: 0.94rem;
    line-height: 1.7;
    word-break: break-word;
  }

  .chat-markdown :global(p) {
    margin: 0 0 0.75em;
  }

  .chat-markdown :global(p:last-child) {
    margin-bottom: 0;
  }

  .chat-markdown :global(h1),
  .chat-markdown :global(h2),
  .chat-markdown :global(h3),
  .chat-markdown :global(h4) {
    margin: 1em 0 0.5em;
    font-weight: 600;
    line-height: 1.3;
  }

  .chat-markdown :global(h1) { font-size: 1.25em; }
  .chat-markdown :global(h2) { font-size: 1.15em; }
  .chat-markdown :global(h3) { font-size: 1.05em; }

  .chat-markdown :global(ul),
  .chat-markdown :global(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  .chat-markdown :global(li) {
    margin: 0.25em 0;
  }

  .chat-markdown :global(code) {
    font-family: "Fira Mono", monospace;
    font-size: 0.88em;
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .chat-markdown :global(pre) {
    margin: 0.75em 0;
    padding: 14px 16px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    overflow-x: auto;
    position: relative;
  }

  .chat-markdown :global(pre code) {
    padding: 0;
    background: none;
    font-size: 0.85em;
    line-height: 1.6;
  }

  .chat-markdown :global(blockquote) {
    margin: 0.75em 0;
    padding: 0.5em 1em;
    border-left: 3px solid var(--accent);
    color: color-mix(in srgb, var(--foreground) 70%, transparent);
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
    border-radius: 0 6px 6px 0;
  }

  .chat-markdown :global(table) {
    border-collapse: collapse;
    margin: 0.75em 0;
    width: 100%;
    font-size: 0.88em;
  }

  .chat-markdown :global(th),
  .chat-markdown :global(td) {
    padding: 8px 12px;
    border: 1px solid var(--border);
    text-align: left;
  }

  .chat-markdown :global(th) {
    font-weight: 600;
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .chat-markdown :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1em 0;
  }

  .chat-markdown :global(a) {
    color: var(--accent);
    text-decoration: none;
  }

  .chat-markdown :global(a:hover) {
    text-decoration: underline;
  }

  .chat-markdown :global(strong) {
    font-weight: 600;
  }

  .chat-markdown :global(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.5em 0;
  }
</style>
