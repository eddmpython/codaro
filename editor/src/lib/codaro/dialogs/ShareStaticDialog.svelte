<script lang="ts">
  import { Copy, X } from "lucide-svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  let slug = $state("");
  let randomHash = $state(Math.random().toString(36).slice(2, 6));
  let copied = $state(false);
  let dialogEl: HTMLDivElement | undefined = $state();
  let slugInput: HTMLInputElement | undefined = $state();

  let url = $derived(
    slug ? `https://static.codaro.dev/static/${slugify(slug)}-${randomHash}` : ""
  );

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function copyUrl(): void {
    if (url) {
      navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }

  function handleSubmit(e: Event): void {
    e.preventDefault();
    onClose();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      onClose();
    }
  }

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => slugInput?.focus());
    }
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="presentation"
    onkeydown={handleKeydown}
  >
    <div class="fixed inset-0 bg-black/50" role="presentation" onclick={onClose}></div>
    <div
      bind:this={dialogEl}
      class="relative bg-background rounded-lg border shadow-lg p-6 w-fit max-w-lg"
      role="dialog"
      aria-label="Share static notebook"
      tabindex="-1"
    >
      <form onsubmit={handleSubmit}>
        <h2 class="text-lg font-semibold">Share static notebook</h2>
        <p class="text-sm text-muted-foreground mt-1">
          Share your notebook as a static page. Anyone with the link can view it.
        </p>

        <div class="flex flex-col gap-6 py-4">
          <input
            bind:this={slugInput}
            data-testid="slug-input"
            bind:value={slug}
            placeholder="Notebook slug"
            required
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          />

          {#if url}
            <div class="font-semibold text-sm text-muted-foreground gap-2 flex flex-col">
              <span>Anyone will be able to access your notebook at this URL:</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="copy-static-notebook-url-button"
                  class="inline-flex items-center justify-center h-8 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                  onclick={copyUrl}
                >
                  <Copy class="h-3.5 w-3.5" />
                </button>
                <span class="text-primary text-sm break-all">{url}</span>
              </div>
              {#if copied}
                <span class="text-xs text-primary">Copied!</span>
              {/if}
            </div>
          {/if}
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button
            type="button"
            data-testid="cancel-share-static-notebook-button"
            class="inline-flex items-center justify-center h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
            onclick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="share-static-notebook-button"
            aria-label="Save"
            class="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
          >
            Create
          </button>
        </div>
      </form>

      <button
        class="absolute top-4 right-4 p-1 rounded hover:bg-accent text-muted-foreground"
        onclick={onClose}
        aria-label="Close"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
{/if}
