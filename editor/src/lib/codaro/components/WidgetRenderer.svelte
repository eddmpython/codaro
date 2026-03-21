<script lang="ts">
  interface Props {
    value?: Record<string, unknown>;
  }

  let { value = {} }: Props = $props();

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
    return Array.isArray(value.options) ? value.options.map((option) => String(option)) : [];
  }
</script>

<div class="widget">
  {#if label()}
    <div class="label">{label()}</div>
  {/if}

  {#if component() === "button"}
    <button class="control button" disabled>{label() || "Button"}</button>
  {:else if component() === "checkbox"}
    <label class="checkRow">
      <input type="checkbox" checked={boolValue()} disabled />
      <span>{label() || "Checkbox"}</span>
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
        disabled
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
      disabled
    />
  {:else if component() === "dropdown"}
    <select class="control" value={textValue()} disabled>
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
      readonly
    ></textarea>
  {:else if component() === "code_editor"}
    <pre class="code">{textValue()}</pre>
  {:else}
    <input
      class="control"
      type="text"
      value={textValue()}
      placeholder={String(value.placeholder || "")}
      readonly
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

  .textarea {
    resize: none;
    min-height: 112px;
  }

  .button {
    text-align: center;
    font-weight: 600;
  }

  .checkRow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--cd-text);
  }

  .sliderBlock {
    display: grid;
    gap: 8px;
  }

  .code {
    margin: 0;
    padding: 14px;
    overflow: auto;
    font: 12.5px/1.6 var(--cd-font-code);
  }
</style>
