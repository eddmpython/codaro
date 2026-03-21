<script lang="ts">
  import { ChevronDown, Check, Cpu } from "lucide-svelte";
  import {
    getActiveProvider,
    getActiveModel,
    getAiProfile,
    getProviderList,
  } from "./aiStore.svelte";
  import { getModels, updateProfile } from "./aiApi";

  let isOpen = $state(false);
  let modelList = $state<string[]>([]);
  let loadingModels = $state(false);

  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());
  let profile = $derived(getAiProfile());
  let providers = $derived(getProviderList());

  async function fetchModels(providerId: string) {
    loadingModels = true;
    try {
      const data = await getModels(providerId);
      modelList = data.models;
    } catch {
      modelList = [];
    } finally {
      loadingModels = false;
    }
  }

  async function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen && provider) {
      await fetchModels(provider);
    }
  }

  async function selectModel(modelId: string) {
    try {
      await updateProfile({ model: modelId });
    } catch {
      /* ignore */
    }
    isOpen = false;
  }

  async function selectProvider(providerId: string) {
    try {
      await updateProfile({ provider: providerId });
      await fetchModels(providerId);
    } catch {
      /* ignore */
    }
  }
</script>

<div class="model-selector">
  <button class="selector-trigger" onclick={toggleDropdown}>
    <Cpu class="h-3.5 w-3.5" />
    <span class="selector-label">
      {#if model}
        {model}
      {:else}
        Select model
      {/if}
    </span>
    <ChevronDown class="h-3 w-3 chevron {isOpen ? 'rotated' : ''}" />
  </button>

  {#if isOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="selector-backdrop" onclick={() => { isOpen = false; }}></div>
    <div class="selector-dropdown">
      {#if providers.length > 1}
        <div class="dropdown-section">
          <span class="section-label">Provider</span>
          {#each providers as p}
            <button
              class="dropdown-item"
              class:active={provider === p.id}
              onclick={() => selectProvider(p.id)}
            >
              <span>{p.label}</span>
              {#if provider === p.id}
                <Check class="h-3.5 w-3.5" />
              {/if}
            </button>
          {/each}
        </div>
        <div class="dropdown-divider"></div>
      {/if}

      <div class="dropdown-section">
        <span class="section-label">Model</span>
        {#if loadingModels}
          <div class="dropdown-loading">Loading models...</div>
        {:else if modelList.length === 0}
          <div class="dropdown-empty">No models available</div>
        {:else}
          {#each modelList as m}
            <button
              class="dropdown-item"
              class:active={model === m}
              onclick={() => selectModel(m)}
            >
              <span>{m}</span>
              {#if model === m}
                <Check class="h-3.5 w-3.5" />
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .model-selector {
    position: relative;
  }

  .selector-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .selector-trigger:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .chevron {
    transition: transform 0.15s;
    opacity: 0.5;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .selector-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .selector-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 220px;
    max-height: 320px;
    overflow-y: auto;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 50;
    padding: 4px;
  }

  .dropdown-section {
    padding: 4px 0;
  }

  .section-label {
    display: block;
    padding: 6px 10px 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
  }

  .dropdown-divider {
    height: 1px;
    margin: 4px 8px;
    background: var(--border);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.82rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .dropdown-item:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .dropdown-item.active {
    color: var(--accent);
    font-weight: 500;
  }

  .dropdown-loading,
  .dropdown-empty {
    padding: 12px 10px;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
    text-align: center;
  }
</style>
