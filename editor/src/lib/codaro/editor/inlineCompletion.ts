import {
  EditorView,
  Decoration,
  type DecorationSet,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { StateField, StateEffect, type Extension } from "@codemirror/state";
import { requestCompletion, type ChatContext } from "../ai/aiApi";

const setGhostText = StateEffect.define<string | null>();

class GhostTextWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-ghost-text";
    span.textContent = this.text;
    return span;
  }

  eq(other: GhostTextWidget): boolean {
    return this.text === other.text;
  }
}

const ghostTextField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setGhostText)) {
        if (effect.value === null) {
          return Decoration.none;
        }
        const pos = tr.state.selection.main.head;
        const widget = Decoration.widget({
          widget: new GhostTextWidget(effect.value),
          side: 1,
        });
        return Decoration.set([widget.range(pos)]);
      }
    }
    if (tr.docChanged || tr.selection) {
      return Decoration.none;
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const ghostTextTheme = EditorView.theme({
  ".cm-ghost-text": {
    color: "var(--codaro-text-muted, #666)",
    opacity: "0.45",
    fontStyle: "italic",
    pointerEvents: "none",
    userSelect: "none",
  },
});

interface CompletionState {
  timer: ReturnType<typeof setTimeout> | null;
  abortController: AbortController | null;
  lastPrefix: string;
}

export function inlineCompletionExtension(
  contextProvider?: () => ChatContext | null,
): Extension {
  const state: CompletionState = {
    timer: null,
    abortController: null,
    lastPrefix: "",
  };

  const debounceMs = 400;
  const minPrefixLength = 8;

  function clearPending(): void {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (state.abortController) {
      state.abortController.abort();
      state.abortController = null;
    }
  }

  function scheduleCompletion(view: EditorView): void {
    clearPending();

    const doc = view.state.doc.toString();
    const pos = view.state.selection.main.head;
    const prefix = doc.slice(0, pos);
    const suffix = doc.slice(pos);

    if (prefix.length < minPrefixLength) return;

    const trimmed = prefix.trimEnd();
    if (trimmed === state.lastPrefix) return;

    const lastLine = prefix.split("\n").pop() || "";
    if (!lastLine.trim()) return;

    state.timer = setTimeout(async () => {
      state.lastPrefix = trimmed;
      const controller = new AbortController();
      state.abortController = controller;

      try {
        const context = contextProvider?.() ?? undefined;
        const response = await requestCompletion({
          prefix: prefix.slice(-300),
          suffix: suffix.slice(0, 150),
          context: context,
        });

        if (controller.signal.aborted) return;

        const completion = response.completions[0];
        if (completion) {
          view.dispatch({
            effects: setGhostText.of(completion),
          });
        }
      } catch {
        // silently ignore completion failures
      }
    }, debounceMs);
  }

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      scheduleCompletion(update.view);
    }
  });

  const completionKeymap = keymap.of([
    {
      key: "Tab",
      run: (view) => {
        const ghostDecos = view.state.field(ghostTextField);
        let ghostText: string | null = null;

        const cursor = ghostDecos.iter();
        if (cursor.value) {
          const widget = cursor.value.spec.widget;
          if (widget instanceof GhostTextWidget) {
            ghostText = widget.text;
          }
        }

        if (!ghostText) return false;

        const pos = view.state.selection.main.head;
        view.dispatch({
          changes: { from: pos, insert: ghostText },
          selection: { anchor: pos + ghostText.length },
          effects: setGhostText.of(null),
        });
        state.lastPrefix = "";
        return true;
      },
    },
    {
      key: "Escape",
      run: (view) => {
        const ghostDecos = view.state.field(ghostTextField);
        const cursor = ghostDecos.iter();
        if (!cursor.value) return false;

        clearPending();
        view.dispatch({
          effects: setGhostText.of(null),
        });
        state.lastPrefix = "";
        return true;
      },
    },
  ]);

  return [ghostTextField, ghostTextTheme, updateListener, completionKeymap];
}
