<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { EditorState } from "@codemirror/state";
  import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
  import { python } from "@codemirror/lang-python";
  import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { lineNumbers, EditorView, highlightActiveLine, keymap } from "@codemirror/view";
  import { tags } from "@lezer/highlight";

  interface Props {
    value?: string;
    readOnly?: boolean;
    onChange?: (nextValue: string) => void;
    onRun?: () => void;
    onRunAndNewBelow?: () => void;
    onRunAll?: () => void;
    onCreateAbove?: () => void;
    onCreateBelow?: () => void;
    onDeleteCell?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onToggleType?: () => void;
    onFocusUp?: () => void;
    onFocusDown?: () => void;
    onHideCode?: () => void;
  }

  let {
    value = "",
    readOnly = false,
    onChange = () => {},
    onRun = () => {},
    onRunAndNewBelow = () => {},
    onRunAll = () => {},
    onCreateAbove = () => {},
    onCreateBelow = () => {},
    onDeleteCell = () => {},
    onMoveUp = () => {},
    onMoveDown = () => {},
    onToggleType = () => {},
    onFocusUp = () => {},
    onFocusDown = () => {},
    onHideCode = () => {}
  }: Props = $props();

  let host: HTMLDivElement | undefined = $state();
  let view: EditorView | null = $state(null);

  const editorTheme = EditorView.theme({
    ".cm-scroller": {
      fontFamily: "var(--monospace-font), ui-monospace, monospace",
      lineHeight: "1.55"
    },
    "&": {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: "var(--codaro-code-editor-font-size, var(--text-sm, 0.875rem))"
    },
    "&.cm-focused": {
      outline: "none"
    },
    ".cm-content": {
      padding: "4px 0",
      fontFamily: "var(--monospace-font), ui-monospace, monospace",
      fontSize: "var(--codaro-code-editor-font-size, 0.9rem)"
    },
    ".cm-line": {
      padding: "0 2px"
    },
    ".cm-gutters": {
      minWidth: "32px",
      border: "none",
      backgroundColor: "var(--color-background)",
      color: "var(--gray-10)",
      fontFamily: "var(--monospace-font), ui-monospace, monospace",
      fontSize: "var(--text-xs, 0.75rem)"
    },
    ".cm-gutterElement": {
      paddingLeft: "8px",
      paddingRight: "6px"
    },
    ".cm-activeLine": {
      backgroundColor: "#cceeff44"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--color-background)",
      color: "var(--foreground)"
    },
    ".cm-selectionBackground": {
      backgroundColor: "#d7d4f0 !important"
    },
    ".cm-cursor": {
      borderLeftColor: "#000000"
    },
    ".cm-matchingBracket": {
      backgroundColor: "var(--slate-3)",
      color: "var(--foreground)"
    }
  });

  const editorHighlight = HighlightStyle.define([
    { tag: tags.comment, color: "var(--cm-comment)" },
    { tag: tags.variableName, color: "#000000" },
    { tag: [tags.string, tags.special(tags.brace)], color: "#a11" },
    { tag: tags.number, color: "#164" },
    { tag: tags.bool, color: "#219" },
    { tag: tags.null, color: "#219" },
    { tag: tags.keyword, color: "#708", fontWeight: "500" },
    { tag: tags.className, color: "#00f" },
    { tag: tags.definition(tags.typeName), color: "#00f" },
    { tag: tags.typeName, color: "#085" },
    { tag: tags.angleBracket, color: "#000000" },
    { tag: tags.tagName, color: "#170" },
    { tag: tags.attributeName, color: "#00c" },
    { tag: tags.operator, color: "#a2f", fontWeight: "500" },
    { tag: tags.function(tags.variableName), color: "#00c" },
    { tag: tags.propertyName, color: "#05a" }
  ]);

  function createState(doc: string): EditorState {
    return EditorState.create({
      doc,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        highlightActiveLine(),
        python(),
        editorTheme,
        syntaxHighlighting(editorHighlight),
        EditorView.lineWrapping,
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        keymap.of([
          {
            key: "Ctrl-Enter",
            run: () => { onRun(); return true; }
          },
          {
            key: "Shift-Enter",
            run: () => { onRunAndNewBelow(); return true; }
          },
          {
            key: "Ctrl-Shift-Enter",
            run: () => { onRunAll(); return true; }
          },
          {
            key: "Ctrl-Shift-a",
            run: () => { onCreateAbove(); return true; }
          },
          {
            key: "Ctrl-Shift-b",
            run: () => { onCreateBelow(); return true; }
          },
          {
            key: "Ctrl-Shift-Delete",
            run: () => { onDeleteCell(); return true; }
          },
          {
            key: "Alt-Shift-ArrowUp",
            run: () => { onMoveUp(); return true; }
          },
          {
            key: "Alt-Shift-ArrowDown",
            run: () => { onMoveDown(); return true; }
          },
          {
            key: "Ctrl-Shift-m",
            run: () => { onToggleType(); return true; }
          },
          {
            key: "Ctrl-Shift-h",
            run: () => { onHideCode(); return true; }
          },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap
        ])
      ]
    });
  }

  onMount(() => {
    if (host) {
      view = new EditorView({
        state: createState(value),
        parent: host
      });
    }
  });

  onDestroy(() => {
    view?.destroy();
  });

  $effect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        }
      });
    }
  });
</script>

<div class="cm mathjax_ignore" data-testid="cell-editor" bind:this={host}></div>

<style>
  .cm {
  }
</style>
