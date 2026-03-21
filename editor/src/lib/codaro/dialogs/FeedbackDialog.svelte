<script lang="ts">
  import { X } from "lucide-svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();
  let dialogEl: HTMLDivElement | undefined = $state();
  const surveyUrl = "https://github.com/eddmpython/codaro/issues";
  const communityUrl = "https://github.com/eddmpython/codaro";

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      onClose();
    }
  }

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => dialogEl?.focus());
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
      aria-label="Send Feedback"
      tabindex="-1"
    >
      <h2 class="text-lg font-semibold">Send Feedback</h2>
      <div class="prose dark:prose-invert text-sm text-muted-foreground mt-2">
        <p>We'd love to hear from you! Here's how you can share your feedback:</p>
        <ul class="list-disc ml-8 my-2">
          <li class="my-0">
            <a href={surveyUrl} target="_blank" rel="noopener noreferrer" class="underline text-primary">Take our two-minute survey</a>
          </li>
          <li class="my-0">
            <a
              href="https://github.com/eddmpython/codaro/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="underline text-primary"
            >File a GitHub issue</a>
          </li>
          <li class="my-0">
            <a href={communityUrl} target="_blank" rel="noopener noreferrer" class="underline text-primary">Join our Discord</a>
          </li>
        </ul>
      </div>
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
