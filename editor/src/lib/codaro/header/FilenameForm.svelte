<script lang="ts">
  interface Props {
    documentLocation: string;
    documentTitle?: string;
    hasPath: boolean;
  }

  let {
    documentLocation,
    documentTitle = "untitled notebook",
    hasPath
  }: Props = $props();

  const inputClass =
    "placeholder:text-foreground-muted flex rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 filename w-full px-4 py-1 my-1 h-9 font-mono text-foreground/60";
</script>

<div class="pt-4 sm:pt-12 pb-2 mb-4 print:hidden z-50 sticky left-0">
  <div class="flex items-center justify-center container">
    <div
      tabindex="-1"
      class="flex h-full w-full flex-col overflow-hidden rounded-md text-popover-foreground bg-transparent group filename-input"
      id="filename-input"
      data-testid="filename-input"
      cmdk-root=""
    >
      <label
        cmdk-label=""
        for="codaro-filename-input"
        id="codaro-filename-label"
        style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"
      ></label>
      <div
        class="max-h-[300px] overflow-y-auto overflow-x-hidden"
        cmdk-list=""
        role="listbox"
        tabindex="-1"
        aria-label="Suggestions"
        id="codaro-filename-list"
        style="--cmdk-list-height: 40px;"
      >
        <div cmdk-list-sizer="">
          <div>
            <div class="flex items-center border-b border-none justify-center px-1" cmdk-input-wrapper="">
              <input
                class="{inputClass} {hasPath ? 'filename' : 'missing-filename'}"
                data-testid="dir-completion-input"
                tabindex="-1"
                spellcheck="false"
                placeholder={documentTitle}
                autocomplete="off"
                cmdk-input=""
                autocorrect="off"
                aria-autocomplete="list"
                role="combobox"
                aria-expanded="true"
                aria-controls="codaro-filename-list"
                aria-labelledby="codaro-filename-label"
                id="codaro-filename-input"
                type="text"
                readonly
                value={documentLocation}
                style="max-width: 1000px;"
              />
            </div>
            <div class="codaro" style="display: contents;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
