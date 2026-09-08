import { hoverTooltip } from "@codemirror/view";
import { analyzeEditorCode } from "@/lib/editorIntelligence/service";
import type { NotebookIntelligence } from "./editorIntelligenceContext";

export function codeIntelligenceExtension(blockId: string, controller: () => NotebookIntelligence | null) {
    return hoverTooltip(async (view, position) => {
        const intelligence = controller();
        if (!intelligence) return null;
        const word = view.state.wordAt(position);
        if (!word) return null;
        const document = intelligence.snapshot();
        const name = view.state.sliceDoc(word.from, word.to);
        const execution = intelligence.result(blockId);
        const variable = execution?.variables.find((item) => item.name === name);
        let description = "";
        try {
            const response = await analyzeEditorCode(document, blockId, position, "hover");
            description = (response.items ?? []).map((item) => [item.description, item.documentation].filter(Boolean).join("\n")).join("\n\n");
        } catch (error) {
            description = error instanceof Error ? error.message : String(error);
        }
        if (intelligence.snapshot().version !== document.version || (!description && !variable)) return null;
        return {
            pos: word.from,
            end: word.to,
            above: true,
            create: () => {
                const dom = window.document.createElement("div");
                dom.className = "max-h-72 max-w-lg overflow-auto whitespace-pre-wrap rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-md";
                dom.textContent = description;
                if (variable) {
                    const result = window.document.createElement("p");
                    result.className = "mt-2 border-t border-border pt-2";
                    const modified = execution?.sourceCode !== document.cells.find((cell) => cell.id === blockId)?.source;
                    result.textContent = `이 셀의 마지막 실행${modified ? " (코드 수정 후 실행 전)" : ""}\n${variable.name}: ${variable.typeName}\n${variable.repr}${variable.shape ? "\n크기: " + variable.shape : ""}`;
                    dom.append(result);
                }
                return { dom };
            },
        };
    }, { hoverTime: 500 });
}
