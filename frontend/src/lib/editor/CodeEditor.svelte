<script>
  import { onDestroy, onMount } from "svelte";
  import { EditorState } from "@codemirror/state";
  import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
  import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
  import { python } from "@codemirror/lang-python";
  import { syntaxHighlighting, bracketMatching, HighlightStyle } from "@codemirror/language";
  import { tags } from "@lezer/highlight";

  export let value = "";
  export let readOnly = false;
  export let onChange = () => {};
  export let onRun = () => {};

  let host;
  let view;
  let observer;
  let currentTheme = "light";

  function detectTheme() {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  const darkEditorTheme = EditorView.theme({
    "&": {
      fontSize: "13.5px",
      backgroundColor: "transparent"
    },
    ".cm-content": {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      padding: "10px 0",
      caretColor: "#ff2d95",
      color: "#e4e4e7"
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#52525b",
      border: "none",
      minWidth: "36px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "11px"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.03)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "#a1a1aa"
    },
    "&.cm-focused": {
      outline: "none"
    },
    ".cm-cursor": {
      borderLeftColor: "#ff2d95",
      borderLeftWidth: "1.5px"
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(255, 45, 149, 0.15) !important"
    },
    ".cm-line": {
      padding: "0 12px 0 4px"
    },
    ".cm-matchingBracket": {
      backgroundColor: "rgba(255, 45, 149, 0.12)",
      color: "#ff2d95 !important"
    }
  });

  const darkSyntax = HighlightStyle.define([
    { tag: tags.keyword, color: "#c678dd", fontWeight: "500" },
    { tag: tags.string, color: "#98c379" },
    { tag: tags.number, color: "#d19a66" },
    { tag: tags.bool, color: "#d19a66" },
    { tag: tags.null, color: "#d19a66" },
    { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
    { tag: tags.function(tags.variableName), color: "#61afef" },
    { tag: tags.className, color: "#61afef" },
    { tag: tags.typeName, color: "#56b6c2" },
    { tag: tags.operator, color: "#56b6c2", fontWeight: "500" },
    { tag: tags.propertyName, color: "#e5c07b" },
    { tag: tags.definition(tags.variableName), color: "#e06c75" },
    { tag: tags.variableName, color: "#abb2bf" }
  ]);

  const lightEditorTheme = EditorView.theme({
    "&": {
      fontSize: "13.5px",
      backgroundColor: "transparent"
    },
    ".cm-content": {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      padding: "10px 0",
      caretColor: "#d6336c",
      color: "#1a1a2e"
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#c4c4cc",
      border: "none",
      minWidth: "36px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "11px"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(0, 0, 0, 0.02)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "#6b7280"
    },
    "&.cm-focused": {
      outline: "none"
    },
    ".cm-cursor": {
      borderLeftColor: "#d6336c",
      borderLeftWidth: "1.5px"
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(214, 51, 108, 0.1) !important"
    },
    ".cm-line": {
      padding: "0 12px 0 4px"
    },
    ".cm-matchingBracket": {
      backgroundColor: "rgba(214, 51, 108, 0.1)",
      color: "#d6336c !important"
    }
  });

  const lightSyntax = HighlightStyle.define([
    { tag: tags.keyword, color: "#7c3aed", fontWeight: "500" },
    { tag: tags.string, color: "#a11" },
    { tag: tags.number, color: "#164" },
    { tag: tags.bool, color: "#219" },
    { tag: tags.null, color: "#219" },
    { tag: tags.comment, color: "#a0a1a7", fontStyle: "italic" },
    { tag: tags.function(tags.variableName), color: "#00c" },
    { tag: tags.className, color: "#085" },
    { tag: tags.typeName, color: "#00f" },
    { tag: tags.operator, color: "#a2f", fontWeight: "500" },
    { tag: tags.propertyName, color: "#05a" },
    { tag: tags.definition(tags.variableName), color: "#e45649" },
    { tag: tags.variableName, color: "#383a42" }
  ]);

  function createState(doc) {
    const extensions = [
      lineNumbers(),
      history(),
      highlightActiveLine(),
      bracketMatching(),
      keymap.of([
        {
          key: "Shift-Enter",
          run: () => {
            onRun();
            return true;
          }
        },
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab
      ]),
      python(),
      EditorView.editable.of(!readOnly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      })
    ];

    if (currentTheme === "dark") {
      extensions.push(darkEditorTheme, syntaxHighlighting(darkSyntax));
    } else {
      extensions.push(lightEditorTheme, syntaxHighlighting(lightSyntax));
    }

    return EditorState.create({
      doc,
      extensions
    });
  }

  onMount(() => {
    currentTheme = detectTheme();
    view = new EditorView({
      state: createState(value),
      parent: host
    });

    observer = new MutationObserver(() => {
      const nextTheme = detectTheme();
      if (nextTheme === currentTheme || !view) return;
      currentTheme = nextTheme;
      const nextDoc = view.state.doc.toString();
      view.setState(createState(nextDoc));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      view?.destroy();
    };
  });

  onDestroy(() => {
    observer?.disconnect();
  });

  $: if (view && value !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value
      }
    });
  }
</script>

<div bind:this={host}></div>
