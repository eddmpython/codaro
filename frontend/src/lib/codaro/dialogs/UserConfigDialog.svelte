<script lang="ts">
  import { Edit, Monitor, Layers, Cpu, Brain, FolderCog2, FlaskConical, X } from "lucide-svelte";
  import {
    getUserConfig,
    setUserConfig,
    getRuntimeConfig,
    setRuntimeConfig
  } from "../stores/config.svelte";

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
  let theme = $state<"light" | "dark" | "system">("system");
  let fontSize = $state(14);
  let cellOutputPosition = $state<"above" | "below">("below");

  let packageManager = $state("pip");

  let autoInstantiate = $state(true);
  let onCellChange = $state<"autorun" | "lazy">("autorun");
  let autoReload = $state<"off" | "lazy" | "autorun">("off");

  let chatModel = $state("");
  let editModel = $state("");
  let completionEnabled = $state(false);

  $effect(() => {
    const currentUser = uc;
    const currentRuntime = rc;

    autosave = currentUser.editor.autosave;
    formatOnSave = currentUser.editor.formatOnSave;
    lineLength = currentUser.editor.lineLength;
    autocomplete = currentUser.editor.autocomplete;
    keymap = currentUser.editor.keymap;

    displayWidth = currentUser.display.width;
    theme = currentUser.display.theme;
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
            <label class="text-sm font-medium" for="theme-select">Theme</label>
            <select
              id="theme-select"
              data-testid="theme-select"
              class={selectClass}
              bind:value={theme}
              oninput={syncDisplay}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
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
          <h3 class="font-semibold text-lg mb-4">AI</h3>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chat-model-input">Chat model</label>
            <input
              id="chat-model-input"
              class={inputClass}
              bind:value={chatModel}
              oninput={syncAi}
              placeholder="gpt-4o"
            />
          </div>

          <div class="flex flex-col gap-1 mt-2">
            <label class="text-sm font-medium" for="edit-model-input">Edit model</label>
            <input
              id="edit-model-input"
              class={inputClass}
              bind:value={editModel}
              oninput={syncAi}
              placeholder="gpt-4o"
            />
          </div>

          <label class="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              class={checkboxClass}
              bind:checked={completionEnabled}
              oninput={syncAi}
            />
            Completion enabled
          </label>

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
