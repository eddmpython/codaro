<script lang="ts">
  import { Edit, Monitor, Layers, Cpu, Brain, FolderCog2, FlaskConical, X, Check, AlertCircle, Loader2, ExternalLink, Unplug, Wifi } from "lucide-svelte";
  import {
    getUserConfig,
    setUserConfig,
    getRuntimeConfig,
    setRuntimeConfig
  } from "../stores/config.svelte";
  import {
    getProviders,
    getProfile,
    updateProfile,
    saveSecret,
    clearSecret,
    validateProvider,
    getModels,
    oauthAuthorize,
    oauthStatus,
    oauthLogout,
  } from "../ai/aiApi";
  import type { AiProviderEntry, AiProfilePayload } from "../ai/aiApi";

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  let activeTab = $state("editor");

  let uc = $derived(getUserConfig());
  let rc = $derived(getRuntimeConfig());

  let autosave = $state(true);
  let formatOnSave = $state(true);
  let lineLength = $state(79);
  let autocomplete = $state(true);
  let keymap = $state<"default" | "vim" | "emacs">("default");

  let displayWidth = $state("normal");
  let theme = $state<"dark">("dark");
  let fontSize = $state(14);
  let cellOutputPosition = $state<"above" | "below">("below");

  let packageManager = $state("pip");

  let autoInstantiate = $state(true);
  let onCellChange = $state<"autorun" | "lazy">("autorun");
  let autoReload = $state<"off" | "lazy" | "autorun">("off");

  let chatModel = $state("");
  let editModel = $state("");
  let completionEnabled = $state(false);

  let aiProviders = $state<AiProviderEntry[]>([]);
  let aiProfile = $state<AiProfilePayload | null>(null);
  let aiSelectedProvider = $state("");
  let aiApiKeyInput = $state("");
  let aiModelList = $state<string[]>([]);
  let aiSelectedModel = $state("");
  let aiTemperature = $state(0.3);
  let aiMaxTokens = $state(4096);
  let aiLoading = $state(false);
  let aiValidating = $state(false);
  let aiValidationResult = $state<{ valid: boolean; error?: string } | null>(null);
  let aiOauthPolling = $state(false);
  let aiError = $state<string | null>(null);

  async function loadAiState() {
    try {
      const [providers, profile] = await Promise.all([getProviders(), getProfile()]);
      aiProviders = providers.catalog;
      aiProfile = profile;
      aiSelectedProvider = profile.activeProvider ?? profile.defaultProvider;
      aiSelectedModel = profile.activeModel ?? "";
      aiTemperature = profile.temperature;
      aiMaxTokens = profile.maxTokens;
      aiError = null;
      await loadModelsForProvider(aiSelectedProvider);
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to load AI settings";
    }
  }

  async function loadModelsForProvider(providerId: string) {
    try {
      const data = await getModels(providerId);
      aiModelList = data.models;
    } catch {
      aiModelList = [];
    }
  }

  async function handleProviderChange(providerId: string) {
    aiSelectedProvider = providerId;
    aiApiKeyInput = "";
    aiValidationResult = null;
    aiLoading = true;
    try {
      await updateProfile({ provider: providerId });
      await loadModelsForProvider(providerId);
      aiProfile = await getProfile();
      aiSelectedModel = aiProfile.activeModel ?? "";
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to switch provider";
    } finally {
      aiLoading = false;
    }
  }

  async function handleModelChange(modelId: string) {
    aiSelectedModel = modelId;
    try {
      await updateProfile({ model: modelId });
      aiProfile = await getProfile();
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to set model";
    }
  }

  async function handleSaveApiKey() {
    if (!aiApiKeyInput.trim()) return;
    aiLoading = true;
    try {
      await saveSecret(aiSelectedProvider, aiApiKeyInput.trim());
      aiApiKeyInput = "";
      aiProfile = await getProfile();
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to save API key";
    } finally {
      aiLoading = false;
    }
  }

  async function handleClearSecret() {
    aiLoading = true;
    try {
      if (getProviderSpec(aiSelectedProvider)?.authKind === "oauth") {
        await oauthLogout();
      } else {
        await clearSecret(aiSelectedProvider);
      }
      aiProfile = await getProfile();
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to clear credentials";
    } finally {
      aiLoading = false;
    }
  }

  function getProviderSpec(providerId: string): AiProviderEntry | undefined {
    return aiProviders.find(p => p.id === providerId);
  }

  function isSecretConfigured(providerId: string): boolean {
    return aiProfile?.providers?.[providerId]?.secretConfigured ?? false;
  }

  async function handleOauthLogin() {
    aiOauthPolling = true;
    aiError = null;
    try {
      const { authUrl } = await oauthAuthorize();
      window.open(authUrl, "_blank", "width=600,height=700");
      let attempts = 0;
      const maxAttempts = 120;
      const poll = async () => {
        if (!aiOauthPolling || attempts >= maxAttempts) {
          aiOauthPolling = false;
          return;
        }
        attempts++;
        const status = await oauthStatus();
        if (status.done) {
          aiOauthPolling = false;
          if (status.error) {
            aiError = status.error;
          } else {
            aiProfile = await getProfile();
          }
          return;
        }
        setTimeout(poll, 1000);
      };
      setTimeout(poll, 2000);
    } catch (e) {
      aiOauthPolling = false;
      aiError = e instanceof Error ? e.message : "OAuth failed";
    }
  }

  async function handleValidate() {
    aiValidating = true;
    aiValidationResult = null;
    try {
      aiValidationResult = await validateProvider(aiSelectedProvider, aiSelectedModel || undefined);
    } catch (e) {
      aiValidationResult = { valid: false, error: e instanceof Error ? e.message : "Validation failed" };
    } finally {
      aiValidating = false;
    }
  }

  async function handleAdvancedSave() {
    try {
      await updateProfile({ temperature: aiTemperature, maxTokens: aiMaxTokens });
    } catch (e) {
      aiError = e instanceof Error ? e.message : "Failed to save";
    }
  }

  $effect(() => {
    const currentUser = uc;
    const currentRuntime = rc;

    autosave = currentUser.editor.autosave;
    formatOnSave = currentUser.editor.formatOnSave;
    lineLength = currentUser.editor.lineLength;
    autocomplete = currentUser.editor.autocomplete;
    keymap = currentUser.editor.keymap;

    displayWidth = currentUser.display.width;
    theme = "dark";
    fontSize = currentUser.display.fontSize;
    cellOutputPosition = currentUser.display.cellOutputPosition;

    packageManager = currentUser.packageManager;

    autoInstantiate = currentRuntime.autoInstantiate;
    onCellChange = currentRuntime.onCellChange;
    autoReload = currentRuntime.autoReload;

    chatModel = currentUser.chatModel ?? "";
    editModel = currentUser.editModel ?? "";
    completionEnabled = currentUser.completionEnabled;
  });

  $effect(() => {
    if (activeTab === "ai" && open) {
      loadAiState();
    }
  });

  function syncEditor() {
    setUserConfig({
      editor: { autosave, formatOnSave, lineLength, autocomplete, keymap }
    });
  }

  function syncDisplay() {
    setUserConfig({
      display: { width: displayWidth, theme, fontSize, cellOutputPosition }
    });
  }

  function syncPackages() {
    setUserConfig({ packageManager });
  }

  function syncRuntime() {
    setRuntimeConfig({ autoInstantiate, onCellChange, autoReload });
  }

  function syncAi() {
    setUserConfig({
      chatModel: chatModel || null,
      editModel: editModel || null,
      completionEnabled
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  const tabs = [
    { id: "editor", label: "Editor", icon: Edit, color: "bg-blue-500/10 text-blue-600" },
    { id: "display", label: "Display", icon: Monitor, color: "bg-green-500/10 text-green-600" },
    { id: "packages", label: "Packages & Data", icon: Layers, color: "bg-red-500/10 text-red-600" },
    { id: "runtime", label: "Runtime", icon: Cpu, color: "bg-amber-500/10 text-amber-600" },
    { id: "ai", label: "AI", icon: Brain, color: "bg-purple-500/10 text-purple-600" },
    { id: "deps", label: "Optional Dependencies", icon: FolderCog2, color: "" },
    { id: "labs", label: "Labs", icon: FlaskConical, color: "bg-slate-500/10 text-slate-600" }
  ] as const;

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm";
  const selectClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm";
  const checkboxClass = "h-4 w-4 rounded border border-input accent-primary";
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-label="User settings"
    tabindex="-1"
    onkeydown={handleKeydown}
  >
    <div class="fixed inset-0 bg-black/50" role="presentation" onclick={onClose}></div>

    <div class="relative w-[90vw] h-[90vh] max-w-5xl bg-background rounded-lg border shadow-lg overflow-hidden flex">
      <div class="w-1/3 border-r flex flex-col p-4 gap-1 overflow-auto">
        {#each tabs as tab}
          <button
            class="w-full text-left p-2 rounded flex items-center gap-2 text-sm transition-colors
              {activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}"
            onclick={() => (activeTab = tab.id)}
          >
            <span class="flex items-center justify-center h-6 w-6 rounded {tab.color}">
              <tab.icon size={14} />
            </span>
            {tab.label}
          </button>
        {/each}

        <div class="mt-auto pt-4 border-t text-xs text-muted-foreground">
          <p>Codaro</p>
          <p class="mt-1 truncate">~/.codaro/config.toml</p>
        </div>
      </div>

      <div class="w-2/3 pl-6 gap-2 flex flex-col overflow-auto p-6">
        <button
          class="absolute top-3 right-3 p-1 rounded hover:bg-accent text-muted-foreground"
          onclick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {#if activeTab === "editor"}
          <h3 class="font-semibold text-lg mb-4">Editor</h3>

          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class={checkboxClass}
              bind:checked={autosave}
              oninput={syncEditor}
            />
            Autosave
          </label>

          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class={checkboxClass}
              bind:checked={formatOnSave}
              oninput={syncEditor}
            />
            Format on save
          </label>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="line-length-input">Line length</label>
            <input
              id="line-length-input"
              type="number"
              min="40"
              max="200"
              class={inputClass}
              bind:value={lineLength}
              oninput={syncEditor}
            />
          </div>

          <label class="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              class={checkboxClass}
              bind:checked={autocomplete}
              oninput={syncEditor}
            />
            Autocomplete
          </label>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="keymap-select">Keymap</label>
            <select
              id="keymap-select"
              data-testid="keymap-select"
              class={selectClass}
              bind:value={keymap}
              oninput={syncEditor}
            >
              <option value="default">Default</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>

        {:else if activeTab === "display"}
          <h3 class="font-semibold text-lg mb-4">Display</h3>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="display-width-select">Width</label>
            <select
              id="display-width-select"
              class={selectClass}
              bind:value={displayWidth}
              oninput={syncDisplay}
            >
              <option value="compact">Compact</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="code-editor-font-size-input">Font size</label>
            <input
              id="code-editor-font-size-input"
              data-testid="code-editor-font-size-input"
              type="number"
              min="8"
              max="32"
              class={inputClass}
              bind:value={fontSize}
              oninput={syncDisplay}
            />
          </div>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="cell-output-position-select">Cell output position</label>
            <select
              id="cell-output-position-select"
              class={selectClass}
              bind:value={cellOutputPosition}
              oninput={syncDisplay}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

        {:else if activeTab === "packages"}
          <h3 class="font-semibold text-lg mb-4">Packages & Data</h3>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="package-manager-select">Package manager</label>
            <select
              id="package-manager-select"
              data-testid="package-manager-select"
              class={selectClass}
              bind:value={packageManager}
              oninput={syncPackages}
            >
              <option value="pip">pip</option>
              <option value="uv">uv</option>
              <option value="conda">conda</option>
              <option value="poetry">poetry</option>
            </select>
          </div>

        {:else if activeTab === "runtime"}
          <h3 class="font-semibold text-lg mb-4">Runtime</h3>

          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class={checkboxClass}
              data-testid="auto-instantiate-checkbox"
              bind:checked={autoInstantiate}
              oninput={syncRuntime}
            />
            Auto instantiate
          </label>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="on-cell-change-select">On cell change</label>
            <select
              id="on-cell-change-select"
              data-testid="on-cell-change-select"
              class={selectClass}
              bind:value={onCellChange}
              oninput={syncRuntime}
            >
              <option value="lazy">Lazy</option>
              <option value="autorun">Autorun</option>
            </select>
          </div>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="auto-reload-select">Auto reload</label>
            <select
              id="auto-reload-select"
              class={selectClass}
              bind:value={autoReload}
              oninput={syncRuntime}
            >
              <option value="off">Off</option>
              <option value="lazy">Lazy</option>
              <option value="autorun">Autorun</option>
            </select>
          </div>

        {:else if activeTab === "ai"}
          <h3 class="font-semibold text-lg mb-4">AI Provider</h3>

          {#if aiError}
            <div class="flex items-center gap-2 p-3 rounded-md border border-red-500/30 bg-red-500/5 text-sm text-red-400 mb-3">
              <AlertCircle size={16} />
              <span>{aiError}</span>
              <button class="ml-auto text-red-400/60 hover:text-red-400" onclick={() => aiError = null}>
                <X size={14} />
              </button>
            </div>
          {/if}

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="ai-provider-select">Provider</label>
            <select
              id="ai-provider-select"
              class={selectClass}
              bind:value={aiSelectedProvider}
              onchange={() => handleProviderChange(aiSelectedProvider)}
            >
              {#each aiProviders as p}
                <option value={p.id}>{p.label}</option>
              {/each}
            </select>
            {#if getProviderSpec(aiSelectedProvider)?.description}
              <p class="text-xs text-muted-foreground mt-1">{getProviderSpec(aiSelectedProvider)?.description}</p>
            {/if}
          </div>

          {@const spec = getProviderSpec(aiSelectedProvider)}
          {@const secretOk = isSecretConfigured(aiSelectedProvider)}

          <div class="mt-4 p-4 rounded-lg border border-border bg-card">
            {#if spec?.authKind === "oauth"}
              {#if secretOk}
                <div class="flex items-center gap-2 text-sm">
                  <div class="h-2 w-2 rounded-full bg-green-500"></div>
                  <span class="font-medium text-green-400">Connected</span>
                </div>
                <button
                  class="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-accent/10 transition-colors"
                  onclick={handleClearSecret}
                  disabled={aiLoading}
                >
                  <Unplug size={14} />
                  Disconnect
                </button>
              {:else}
                <div class="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <div class="h-2 w-2 rounded-full bg-zinc-500"></div>
                  <span>Not connected</span>
                </div>
                <button
                  class="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                  onclick={handleOauthLogin}
                  disabled={aiOauthPolling}
                >
                  {#if aiOauthPolling}
                    <Loader2 size={16} class="animate-spin" />
                    Waiting for login...
                  {:else}
                    <ExternalLink size={16} />
                    Login with ChatGPT
                  {/if}
                </button>
              {/if}

            {:else if spec?.authKind === "api_key"}
              {#if secretOk}
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-sm">
                    <Check size={14} class="text-green-400" />
                    <span class="text-green-400 font-medium">API key configured</span>
                  </div>
                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onclick={handleClearSecret}
                    disabled={aiLoading}
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
              {:else}
                <label class="text-sm font-medium" for="ai-api-key-input">API Key</label>
                <div class="flex gap-2 mt-1">
                  <input
                    id="ai-api-key-input"
                    type="password"
                    class="{inputClass} flex-1"
                    bind:value={aiApiKeyInput}
                    placeholder="sk-..."
                  />
                  <button
                    class="px-4 py-1.5 rounded-md bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    onclick={handleSaveApiKey}
                    disabled={!aiApiKeyInput.trim() || aiLoading}
                  >
                    {#if aiLoading}
                      <Loader2 size={14} class="animate-spin" />
                    {:else}
                      Save
                    {/if}
                  </button>
                </div>
              {/if}

            {:else if spec?.authKind === "none"}
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi size={16} />
                <span>No authentication needed. Ollama runs locally.</span>
              </div>
              <button
                class="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-accent/10 transition-colors"
                onclick={handleValidate}
                disabled={aiValidating}
              >
                {#if aiValidating}
                  <Loader2 size={14} class="animate-spin" />
                {:else}
                  <Check size={14} />
                {/if}
                Test Connection
              </button>
              {#if aiValidationResult}
                <p class="mt-2 text-xs {aiValidationResult.valid ? 'text-green-400' : 'text-red-400'}">
                  {aiValidationResult.valid ? "Connected successfully" : aiValidationResult.error ?? "Connection failed"}
                </p>
              {/if}
            {/if}
          </div>

          {#if aiProfile?.ready}
            <div class="flex items-center gap-2 mt-3 p-2 rounded-md bg-green-500/5 border border-green-500/20">
              <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-xs font-medium text-green-400">AI ready</span>
            </div>
          {/if}

          <div class="flex flex-col gap-1 mt-4">
            <label class="text-sm font-medium" for="ai-model-select">Model</label>
            <select
              id="ai-model-select"
              class={selectClass}
              bind:value={aiSelectedModel}
              onchange={() => handleModelChange(aiSelectedModel)}
            >
              <option value="">Select model</option>
              {#each aiModelList as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
          </div>

          <details class="mt-4">
            <summary class="text-sm font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
              Advanced
            </summary>
            <div class="mt-3 flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium" for="ai-temperature-input">Temperature</label>
                <input
                  id="ai-temperature-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  class={inputClass}
                  bind:value={aiTemperature}
                  onchange={handleAdvancedSave}
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium" for="ai-max-tokens-input">Max tokens</label>
                <input
                  id="ai-max-tokens-input"
                  type="number"
                  min="256"
                  max="128000"
                  class={inputClass}
                  bind:value={aiMaxTokens}
                  onchange={handleAdvancedSave}
                />
              </div>
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  class={checkboxClass}
                  bind:checked={completionEnabled}
                  oninput={syncAi}
                />
                Completion enabled
              </label>
            </div>
          </details>

        {:else if activeTab === "deps"}
          <h3 class="font-semibold text-lg mb-4">Optional Dependencies</h3>
          <p class="text-sm text-muted-foreground">No optional dependencies configured.</p>

        {:else if activeTab === "labs"}
          <h3 class="font-semibold text-lg mb-4">Labs</h3>
          <p class="text-sm text-muted-foreground">Experimental features will appear here.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
