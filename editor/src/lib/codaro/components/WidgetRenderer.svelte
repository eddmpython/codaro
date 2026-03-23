<script lang="ts">
  interface Props {
    value?: Record<string, unknown>;
    interactive?: boolean;
    onchange?: (component: string, newValue: unknown) => void;
  }

  let { value = {}, interactive = false, onchange }: Props = $props();

  function component(): string {
    return typeof value.component === "string" ? value.component : "text";
  }

  function label(): string {
    return typeof value.label === "string" ? value.label : "";
  }

  function textValue(): string {
    if (typeof value.value === "string") {
      return value.value;
    }
    if (value.value == null) {
      return "";
    }
    return String(value.value);
  }

  function boolValue(): boolean {
    return Boolean(value.value);
  }

  function numberValue(): number {
    return typeof value.value === "number" ? value.value : Number(value.value || 0);
  }

  function options(): string[] {
    return Array.isArray(value.options)
      ? value.options.map((option) => String(option))
      : [];
  }

  function columns(): string[] {
    return Array.isArray(value.columns) ? (value.columns as string[]) : [];
  }

  function rows(): unknown[][] {
    return Array.isArray(value.rows) ? (value.rows as unknown[][]) : [];
  }

  function pageSize(): number {
    return typeof value.pageSize === "number" ? value.pageSize : 25;
  }

  function progressMax(): number {
    return typeof value.max === "number" ? value.max : 100;
  }

  function progressPercent(): number {
    const max = progressMax();
    if (max <= 0) return 0;
    return Math.min(100, (numberValue() / max) * 100);
  }

  let tablePage = $state(0);
  let pagedRows = $derived.by(() => {
    const all = rows();
    const size = pageSize();
    const start = tablePage * size;
    return all.slice(start, start + size);
  });
  let totalPages = $derived(Math.max(1, Math.ceil(rows().length / pageSize())));

  function emit(newVal: unknown): void {
    if (interactive && onchange) {
      onchange(component(), newVal);
    }
  }
</script>

<div class="widget">
  {#if label() && component() !== "button"}
    <div class="label">{label()}</div>
  {/if}

  {#if component() === "button"}
    <button
      class="control button"
      class:kind-neutral={value.kind === "neutral" || !value.kind}
      class:kind-primary={value.kind === "primary"}
      class:kind-danger={value.kind === "danger"}
      disabled={!interactive}
      onclick={() => emit(true)}
    >
      {label() || "Button"}
    </button>
  {:else if component() === "checkbox"}
    <label class="checkRow">
      <input
        type="checkbox"
        checked={boolValue()}
        disabled={!interactive}
        onchange={(e) => emit((e.target as HTMLInputElement).checked)}
      />
      <span>{label() || "Checkbox"}</span>
    </label>
  {:else if component() === "toggle"}
    <label class="toggleRow">
      <button
        class="toggleTrack"
        class:on={boolValue()}
        role="switch"
        aria-checked={boolValue()}
        aria-label={label() || "Toggle"}
        disabled={!interactive}
        onclick={() => emit(!boolValue())}
      >
        <span class="toggleThumb"></span>
      </button>
      {#if label()}
        <span>{label()}</span>
      {/if}
    </label>
  {:else if component() === "slider"}
    <div class="sliderBlock">
      <input
        class="control"
        type="range"
        min={String(value.min ?? 0)}
        max={String(value.max ?? 100)}
        step={String(value.step ?? 1)}
        value={String(numberValue())}
        disabled={!interactive}
        oninput={(e) => emit(Number((e.target as HTMLInputElement).value))}
      />
      <span class="meta">{textValue()}</span>
    </div>
  {:else if component() === "number"}
    <input
      class="control"
      type="number"
      min={String(value.min ?? "")}
      max={String(value.max ?? "")}
      step={String(value.step ?? "")}
      value={String(numberValue())}
      disabled={!interactive}
      oninput={(e) => emit(Number((e.target as HTMLInputElement).value))}
    />
  {:else if component() === "dropdown"}
    <select
      class="control"
      value={textValue()}
      disabled={!interactive}
      onchange={(e) => emit((e.target as HTMLSelectElement).value)}
    >
      {#each options() as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  {:else if component() === "textarea"}
    <textarea
      class="control textarea"
      rows={Number(value.rows || 5)}
      placeholder={String(value.placeholder || "")}
      value={textValue()}
      readonly={!interactive}
      oninput={(e) => emit((e.target as HTMLTextAreaElement).value)}
    ></textarea>
  {:else if component() === "code_editor"}
    <pre class="code">{textValue()}</pre>
  {:else if component() === "progress"}
    <div class="progressBlock">
      <div class="progressTrack">
        <div
          class="progressFill"
          style="width: {progressPercent()}%"
        ></div>
      </div>
      <span class="meta">{numberValue()} / {progressMax()}</span>
    </div>
  {:else if component() === "table"}
    <div class="tableWrapper">
      <table>
        <thead>
          <tr>
            {#each columns() as col}
              <th>{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pagedRows as row}
            <tr>
              {#each row as cell}
                <td>{cell ?? ""}</td>
              {/each}
            </tr>
          {/each}
          {#if pagedRows.length === 0}
            <tr>
              <td colspan={columns().length || 1} class="emptyRow">No data</td>
            </tr>
          {/if}
        </tbody>
      </table>
      {#if totalPages > 1}
        <div class="pagination">
          <button
            disabled={tablePage === 0}
            onclick={() => (tablePage = Math.max(0, tablePage - 1))}
          >
            Prev
          </button>
          <span class="meta">{tablePage + 1} / {totalPages}</span>
          <button
            disabled={tablePage >= totalPages - 1}
            onclick={() => (tablePage = Math.min(totalPages - 1, tablePage + 1))}
          >
            Next
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <input
      class="control"
      type="text"
      value={textValue()}
      placeholder={String(value.placeholder || "")}
      readonly={!interactive}
      oninput={(e) => emit((e.target as HTMLInputElement).value)}
    />
  {/if}
</div>

<style>
  .widget {
    display: grid;
    gap: 8px;
  }

  .label,
  .meta {
    color: var(--cd-text-muted);
    font-size: 12px;
  }

  .control,
  .button,
  .code {
    width: 100%;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
    background: var(--cd-card);
    color: var(--cd-text);
  }

  .control,
  .button {
    padding: 10px 12px;
  }

  .control:not(:disabled):focus {
    outline: none;
    border-color: var(--accent, #168afd);
    box-shadow: 0 0 0 2px rgba(22, 138, 253, 0.15);
  }

  .textarea {
    resize: none;
    min-height: 112px;
  }

  .button {
    text-align: center;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .button:not(:disabled):hover {
    border-color: var(--cd-border-strong);
    background: var(--cd-surface);
  }

  .kind-primary {
    background: var(--accent, #168afd);
    color: #fff;
    border-color: transparent;
  }

  .kind-primary:not(:disabled):hover {
    opacity: 0.9;
  }

  .kind-danger {
    background: var(--destructive, #e5484d);
    color: #fff;
    border-color: transparent;
  }

  .checkRow,
  .toggleRow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--cd-text);
    cursor: pointer;
  }

  .toggleTrack {
    position: relative;
    width: 40px;
    height: 22px;
    border-radius: 11px;
    border: none;
    background: var(--cd-border);
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
  }

  .toggleTrack.on {
    background: var(--accent, #168afd);
  }

  .toggleThumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }

  .toggleTrack.on .toggleThumb {
    transform: translateX(18px);
  }

  .sliderBlock {
    display: grid;
    gap: 8px;
  }

  .progressBlock {
    display: grid;
    gap: 6px;
  }

  .progressTrack {
    height: 8px;
    border-radius: 4px;
    background: var(--cd-border);
    overflow: hidden;
  }

  .progressFill {
    height: 100%;
    border-radius: 4px;
    background: var(--accent, #168afd);
    transition: width 0.3s ease;
  }

  .code {
    margin: 0;
    padding: 14px;
    overflow: auto;
    font: 12.5px/1.6 var(--cd-font-code);
  }

  .tableWrapper {
    overflow-x: auto;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  th,
  td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--cd-border);
    white-space: nowrap;
  }

  th {
    background: var(--cd-surface, var(--cd-card));
    font-weight: 600;
    color: var(--cd-text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    position: sticky;
    top: 0;
  }

  td {
    color: var(--cd-text);
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .emptyRow {
    text-align: center;
    color: var(--cd-text-muted);
    font-style: italic;
    padding: 24px;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
    border-top: 1px solid var(--cd-border);
  }

  .pagination button {
    padding: 4px 12px;
    border: 1px solid var(--cd-border);
    border-radius: var(--cd-radius-md);
    background: var(--cd-card);
    color: var(--cd-text-muted);
    cursor: pointer;
    font-size: 12px;
  }

  .pagination button:not(:disabled):hover {
    color: var(--cd-text);
    border-color: var(--cd-border-strong);
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
