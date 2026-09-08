import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

const indentation = "    ";

export const codeIndentation = [
    indentUnit.of(indentation),
    EditorState.tabSize.of(indentation.length),
];
