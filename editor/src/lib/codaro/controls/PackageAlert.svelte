<script lang="ts">
  import {
    PackageX,
    X,
    DownloadCloud,
    ChevronDown,
    ChevronRight,
    Box,
    Circle,
    Loader2,
    Check,
    XCircle
  } from "lucide-svelte";

  interface PackageInfo {
    name: string;
    status?: "queued" | "installing" | "installed" | "failed";
  }

  interface Props {
    packages?: PackageInfo[];
    alertType?: "missing" | "installing" | "installed";
    visible?: boolean;
    onDismiss?: () => void;
    onInstall?: (packages: string[]) => void;
  }

  let {
    packages = [],
    alertType = "missing",
    visible = false,
    onDismiss,
    onInstall
  }: Props = $props();

  let logsExpanded = $state(false);

  let bannerClass = $derived(
    alertType === "missing"
      ? "bg-destructive/10 border border-destructive/30"
      : alertType === "installed"
        ? "bg-accent/10 border border-accent/30"
        : "bg-primary/10 border border-primary/30"
  );

  function handleInstall(): void {
    onInstall?.(packages.map((p) => p.name));
  }
</script>

{#if visible}
  <div
    class="flex flex-col gap-4 mb-5 fixed top-5 left-12 min-w-[400px] z-200 opacity-95 max-w-[600px] pointer-events-none"
  >
    <div
      class="rounded py-3 px-5 overflow-auto max-h-[80vh] animate-in slide-in-from-left scrollbar-thin pointer-events-auto {bannerClass}"
    >
      {#if alertType === "missing"}
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <PackageX class="h-5 w-5 text-destructive" />
            <span class="font-bold text-lg">Missing packages</span>
          </div>
          {#if onDismiss}
            <button
              data-testid="remove-banner-button"
              class="p-1 rounded hover:bg-destructive/20 text-muted-foreground"
              onclick={onDismiss}
              aria-label="Dismiss"
            >
              <X class="h-4 w-4" />
            </button>
          {/if}
        </div>
        <p class="text-sm mt-2">The following packages were not found:</p>
        <ul class="list-disc ml-2 mt-1">
          {#each packages as pkg}
            <li class="flex items-center gap-2 font-mono text-sm py-0.5">
              <Box class="h-3.5 w-3.5 text-muted-foreground" />
              {pkg.name}
            </li>
          {/each}
        </ul>
        <div class="flex mt-3">
          <button
            data-testid="install-packages-button"
            class="ml-auto inline-flex items-center gap-2 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            onclick={handleInstall}
          >
            <DownloadCloud class="h-4 w-4" />
            Install
          </button>
        </div>
      {:else if alertType === "installing"}
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <DownloadCloud class="h-5 w-5 text-primary" />
            <span class="font-bold text-lg">Installing packages</span>
          </div>
          {#if onDismiss}
            <button
              data-testid="remove-banner-button"
              class="p-1 rounded hover:bg-primary/20 text-muted-foreground"
              onclick={onDismiss}
              aria-label="Dismiss"
            >
              <X class="h-4 w-4" />
            </button>
          {/if}
        </div>
        <ul class="mt-2">
          {#each packages as pkg}
            <li class="flex items-center gap-2 font-mono text-sm py-0.5">
              {#if pkg.status === "queued"}
                <Circle class="h-3.5 w-3.5 text-muted-foreground" />
              {:else if pkg.status === "installing"}
                <Loader2 class="h-3.5 w-3.5 text-primary animate-spin" />
              {:else if pkg.status === "installed"}
                <Check class="h-3.5 w-3.5 text-accent" />
              {:else if pkg.status === "failed"}
                <XCircle class="h-3.5 w-3.5 text-destructive" />
              {:else}
                <Circle class="h-3.5 w-3.5 text-muted-foreground" />
              {/if}
              {pkg.name}
            </li>
          {/each}
        </ul>
        <button
          class="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground"
          onclick={() => (logsExpanded = !logsExpanded)}
        >
          {#if logsExpanded}
            <ChevronDown class="h-3.5 w-3.5" />
          {:else}
            <ChevronRight class="h-3.5 w-3.5" />
          {/if}
          Logs
        </button>
        {#if logsExpanded}
          <pre
            class="mt-1 p-2 rounded bg-black/10 text-xs font-mono max-h-40 overflow-auto scrollbar-thin"
          ></pre>
        {/if}
      {:else if alertType === "installed"}
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <Check class="h-5 w-5 text-accent" />
            <span class="font-bold text-lg">Packages installed</span>
          </div>
          {#if onDismiss}
            <button
              data-testid="remove-banner-button"
              class="p-1 rounded hover:bg-accent/20 text-muted-foreground"
              onclick={onDismiss}
              aria-label="Dismiss"
            >
              <X class="h-4 w-4" />
            </button>
          {/if}
        </div>
        <p class="text-sm mt-2">All packages were installed successfully.</p>
      {/if}
    </div>
  </div>
{/if}
