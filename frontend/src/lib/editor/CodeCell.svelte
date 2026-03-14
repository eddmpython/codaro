<script>
  import CodeEditor from "./CodeEditor.svelte";

export let content = "";
export let onContentChange = () => {};
export let onRun = () => {};
export let onRunAndMove = () => {};
</script>

<div class="codeCell">
  <div class="editorWrapper">
    <CodeEditor
      value={content}
      onChange={onContentChange}
      onRun={onRunAndMove || onRun}
    />
  </div>
</div>

<style>
  .codeCell {
    position: relative;
    min-height: 36px;
  }

  .editorWrapper {
    min-height: 36px;
  }
</style>
