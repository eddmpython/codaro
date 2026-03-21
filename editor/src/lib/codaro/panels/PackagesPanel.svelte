<script lang="ts">
  import { Search, Download, Trash2, RefreshCw } from "lucide-svelte";

  interface PackageEntry {
    name: string;
    version: string;
    status: "installed" | "pending" | "error";
  }

  interface Props {
    packages?: PackageEntry[];
    onInstall?: (name: string) => void;
    onUninstall?: (name: string) => void;
    onRefresh?: () => void;
  }

  let {
    packages = [],
    onInstall = () => {},
    onUninstall = () => {},
    onRefresh = () => {}
  }: Props = $props();

  let installQuery = $state("");
  let searchQuery = $state("");

  let filtered = $derived(
    packages.filter((pkg) => {
      if (!searchQuery) {
        return true;
      }
      return pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  function handleInstall(): void {
    if (installQuery.trim()) {
      onInstall(installQuery.trim());
      installQuery = "";
    }
  }
</script>

<div class="packages-panel" data-testid="packages-panel">
  <div class="installForm">
    <input
      bind:value={installQuery}
      class="installInput"
      placeholder="Package name to install..."
      onkeydown={(e) => { if (e.key === "Enter") handleInstall(); }}
    />
    <button
      class="installBtn"
      onclick={handleInstall}
      disabled={!installQuery.trim()}
      aria-label="Install package"
    >
      <Download class="h-3.5 w-3.5" />
    </button>
  </div>

  <div class="searchWrap">
    <Search class="h-3.5 w-3.5 text-muted-foreground" />
    <input
      bind:value={searchQuery}
      class="searchInput"
      placeholder="Filter installed..."
    />
    <button class="toolBtn" onclick={onRefresh} aria-label="Refresh">
      <RefreshCw class="h-3.5 w-3.5" />
    </button>
  </div>

  <div class="packageList">
    {#if filtered.length === 0}
      <p class="empty text-muted-foreground text-sm p-4">
        {searchQuery ? "No matching packages." : "No packages installed."}
      </p>
    {:else}
      {#each filtered as pkg}
        <div class="packageRow">
          <div class="pkgInfo">
            <span class="pkgName">{pkg.name}</span>
            <span class="pkgVersion">{pkg.version}</span>
          </div>
          <div class="pkgActions">
            {#if pkg.status === "pending"}
              <span class="pkgStatus pending">installing...</span>
            {:else if pkg.status === "error"}
              <span class="pkgStatus error">error</span>
            {/if}
            <button
              class="toolBtn"
              onclick={() => onUninstall(pkg.name)}
              aria-label="Uninstall {pkg.name}"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .packages-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .installForm {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--border);
  }

  .installInput {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    outline: none;
    color: var(--foreground);
  }

  .installInput:focus {
    border-color: var(--ring);
  }

  .installBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
  }

  .installBtn:hover {
    background: var(--accent);
  }

  .installBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .searchWrap {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }

  .searchInput {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 12px;
    outline: none;
    color: var(--foreground);
  }

  .toolBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .toolBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .packageList {
    flex: 1;
    overflow-y: auto;
  }

  .packageRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }

  .packageRow:hover {
    background: var(--accent);
  }

  .pkgInfo {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .pkgName {
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    color: var(--foreground);
  }

  .pkgVersion {
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .pkgActions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pkgStatus {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pkgStatus.pending {
    color: var(--yellow-11, #b45309);
  }

  .pkgStatus.error {
    color: var(--red-11, #b91c1c);
  }
</style>
