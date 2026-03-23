<script lang="ts">
  import {
    Plug,
    CheckCircle2,
    XCircle,
    Settings2,
    Play,
    Loader2,
    Mail,
    Webhook,
    MessageSquare,
  } from "lucide-svelte";
  import {
    listIntegrations,
    testIntegration,
    configureIntegration,
    type IntegrationInfo,
  } from "../automationApi";

  let integrations = $state<IntegrationInfo[]>([]);
  let loading = $state(true);
  let selectedId = $state<string | null>(null);
  let testResults = $state<Record<string, { success: boolean; message: string }>>({});
  let testing = $state<string | null>(null);
  let configuring = $state<string | null>(null);
  let configValues = $state<Record<string, string>>({});

  const iconMap: Record<string, typeof Plug> = {
    slack: MessageSquare,
    mail: Mail,
    webhook: Webhook,
  };

  async function load(): Promise<void> {
    loading = true;
    try {
      const result = await listIntegrations();
      integrations = result.integrations;
    } catch {
      integrations = [];
    }
    loading = false;
  }

  async function handleTest(id: string): Promise<void> {
    testing = id;
    try {
      const result = await testIntegration(id);
      testResults = { ...testResults, [id]: result };
    } catch (err) {
      testResults = { ...testResults, [id]: { success: false, message: String(err) } };
    }
    testing = null;
  }

  async function handleConfigure(id: string): Promise<void> {
    try {
      const config: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(configValues)) {
        if (value) config[key] = value;
      }
      await configureIntegration(id, config);
      configuring = null;
      configValues = {};
    } catch {
      /* handled by UI */
    }
  }

  function toggleConfig(id: string): void {
    if (configuring === id) {
      configuring = null;
      configValues = {};
    } else {
      configuring = id;
      configValues = {};
    }
  }

  $effect(() => {
    load();
  });
</script>

<div class="integrationPanel">
  <div class="header">
    <Plug class="h-4 w-4" />
    <span>Integrations</span>
  </div>

  {#if loading}
    <div class="centered"><Loader2 class="h-5 w-5 animate-spin" /></div>
  {:else if integrations.length === 0}
    <div class="empty">No integrations available</div>
  {:else}
    <div class="list">
      {#each integrations as integration (integration.id)}
        {@const Icon = iconMap[integration.icon] || Plug}
        {@const testResult = testResults[integration.id]}
        <div class="item" class:selected={selectedId === integration.id}>
          <button
            class="itemHeader"
            onclick={() =>
              (selectedId = selectedId === integration.id ? null : integration.id)}
          >
            <Icon class="h-4 w-4" />
            <div class="itemInfo">
              <span class="itemName">{integration.name}</span>
              <span class="itemCategory">{integration.category}</span>
            </div>
            {#if testResult}
              {#if testResult.success}
                <CheckCircle2 class="h-4 w-4" style="color: var(--grass-9)" />
              {:else}
                <XCircle class="h-4 w-4" style="color: var(--red-9)" />
              {/if}
            {/if}
          </button>

          {#if selectedId === integration.id}
            <div class="itemDetail">
              <p class="desc">{integration.description}</p>
              <div class="actions">
                <button
                  class="actionBtn"
                  onclick={() => handleTest(integration.id)}
                  disabled={testing === integration.id}
                >
                  {#if testing === integration.id}
                    <Loader2 class="h-3 w-3 animate-spin" />
                  {:else}
                    <Play class="h-3 w-3" />
                  {/if}
                  Test
                </button>
                <button
                  class="actionBtn"
                  onclick={() => toggleConfig(integration.id)}
                >
                  <Settings2 class="h-3 w-3" />
                  Configure
                </button>
              </div>

              {#if testResult}
                <div class="testResult" class:ok={testResult.success}>
                  {testResult.message}
                </div>
              {/if}

              {#if configuring === integration.id}
                <div class="configForm">
                  {#each Object.entries(integration.configSchema?.properties ?? {}) as [key, schema]}
                    <label class="configField">
                      <span>{key}</span>
                      <input
                        type={key.toLowerCase().includes("password") ? "password" : "text"}
                        placeholder={typeof schema === "object" && schema !== null ? String((schema as Record<string, unknown>).description ?? key) : key}
                        value={configValues[key] ?? ""}
                        oninput={(e) => (configValues[key] = (e.target as HTMLInputElement).value)}
                      />
                    </label>
                  {/each}
                  <button
                    class="saveBtn"
                    onclick={() => handleConfigure(integration.id)}
                  >
                    Save
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .integrationPanel {
    display: grid;
    gap: 12px;
    font-size: 13px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .centered,
  .empty {
    padding: 24px;
    text-align: center;
    color: var(--muted-foreground);
  }

  .list {
    display: grid;
    gap: 6px;
  }

  .item {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .item.selected {
    border-color: var(--ring);
  }

  .itemHeader {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    color: var(--foreground);
    cursor: pointer;
    text-align: left;
  }

  .itemHeader:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .itemInfo {
    flex: 1;
    display: grid;
    gap: 2px;
  }

  .itemName {
    font-weight: 500;
  }

  .itemCategory {
    font-size: 11px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .itemDetail {
    padding: 0 12px 12px;
    display: grid;
    gap: 10px;
  }

  .desc {
    margin: 0;
    color: var(--muted-foreground);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .actionBtn,
  .saveBtn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--card);
    color: var(--foreground);
    font-size: 12px;
    cursor: pointer;
  }

  .actionBtn:hover,
  .saveBtn:hover {
    border-color: var(--ring);
  }

  .testResult {
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 12px;
    background: rgba(229, 72, 77, 0.1);
    color: var(--red-11);
  }

  .testResult.ok {
    background: rgba(70, 167, 88, 0.1);
    color: var(--grass-11);
  }

  .configForm {
    display: grid;
    gap: 8px;
  }

  .configField {
    display: grid;
    gap: 4px;
  }

  .configField span {
    font-size: 11px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .configField input {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--background);
    color: var(--foreground);
    font-size: 13px;
  }

  .configField input:focus {
    outline: none;
    border-color: var(--accent, #168afd);
  }

  .saveBtn {
    justify-self: start;
    background: var(--accent, #168afd);
    color: #fff;
    border-color: transparent;
    font-weight: 500;
  }
</style>
