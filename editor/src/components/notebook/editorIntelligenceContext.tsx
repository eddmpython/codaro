import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { EditorView } from "@codemirror/view";
import { Annotation, Transaction } from "@codemirror/state";
import { applyEditorEdits, locateEditorRange, projectEditorDocument, type EditorDocument, type EditorEdit, type EditorLocation } from "@/lib/editorIntelligence/document";
import type { CodaroDocument, ExecutionResult } from "@/types";
import { applyRepairChanges, type RepairProposal } from "@/lib/editorIntelligence/repair";
import { EditorExecutionMachine } from "@/lib/editorIntelligence/executionMachine";
import { retainCodeAnalyzer } from "@/lib/editorIntelligence/analysisClient";

export type NotebookIntelligence = {
    snapshot: () => EditorDocument;
    apply: (version: string, edits: EditorEdit[]) => void;
    undo: () => boolean;
    applyRepair: (proposal: RepairProposal, selected: number[]) => void;
    machine: EditorExecutionMachine;
    navigate: (location: EditorLocation, version: string) => void;
    register: (blockId: string, view: EditorView | null) => void;
    result: (blockId: string) => ExecutionResult | undefined;
};

const intelligenceContext = createContext<NotebookIntelligence | null>(null);
export const documentEdit = Annotation.define<boolean>();

export function NotebookIntelligenceProvider(props: {
    document: CodaroDocument;
    drafts: Record<string, string>;
    results: Record<string, ExecutionResult>;
    onDraftUpdates: (updates: Record<string, string>) => void;
    onSelectBlock: (blockId: string) => void;
    children: ReactNode;
}) {
    const current = useRef(props);
    current.current = props;
    const views = useRef(new Map<string, EditorView>());
    const lifecycle = useRef(0);
    const controller = useMemo<NotebookIntelligence>(() => {
        const history: Array<{ version: string; before: Record<string, string> }> = [];
        const snapshot = () => projectEditorDocument(current.current.document.blocks
            .filter((block) => block.type === "code")
            .map((block) => ({ id: block.id, source: views.current.get(block.id)?.state.doc.toString() ?? current.current.drafts[block.id] ?? block.content })), [], "notebook.py", current.current.document.id);
        const update = (changes: Record<string, string>) => {
            for (const [blockId, source] of Object.entries(changes)) {
                const view = views.current.get(blockId);
                view?.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: source },
                    annotations: [documentEdit.of(true), Transaction.addToHistory.of(false)],
                });
            }
            current.current.onDraftUpdates(changes);
        };
        const commit = (original: EditorDocument, changes: Record<string, string>) => {
            const before = Object.fromEntries(original.cells.filter((cell) => cell.id in changes).map((cell) => [cell.id, cell.source]));
            update(changes);
            const after = projectEditorDocument(original.cells.map((cell) => ({ ...cell, source: changes[cell.id] ?? cell.source })), original.files, original.path, original.identity);
            history.push({ version: after.version, before });
            if (history.length > 50) history.shift();
        };
        return {
            machine: new EditorExecutionMachine(),
            snapshot,
            result: (blockId) => current.current.results[blockId],
            register: (blockId, view) => {
                if (view) views.current.set(blockId, view);
                else views.current.delete(blockId);
            },
            apply: (version, edits) => {
                const original = snapshot();
                const changes = applyEditorEdits(original, version, edits);
                commit(original, changes);
            },
            applyRepair: (proposal, selected) => {
                const original = snapshot();
                commit(original, applyRepairChanges(original, proposal, selected));
            },
            undo: () => {
                const previous = history.at(-1);
                if (!previous || snapshot().version !== previous.version) return false;
                update(previous.before);
                history.pop();
                return true;
            },
            navigate: (location, version) => {
                const document = snapshot();
                if (document.version !== version) throw new Error("분석 후 코드가 변경되었습니다. 최신 코드에서 다시 탐색하세요.");
                const range = locateEditorRange(document, location);
                if (!range) throw new Error("현재 노트북 밖의 정의입니다.");
                const view = views.current.get(range.blockId);
                if (!view) throw new Error("이동할 코드 편집기를 찾지 못했습니다.");
                current.current.onSelectBlock(range.blockId);
                view.dispatch({ selection: { anchor: range.from, head: range.to }, effects: EditorView.scrollIntoView(range.from, { y: "center" }) });
                view.focus();
            },
        };
    }, []);
    useEffect(() => {
        const generation = ++lifecycle.current;
        const releaseAnalyzer = retainCodeAnalyzer();
        return () => {
            queueMicrotask(() => {
                releaseAnalyzer();
                if (lifecycle.current !== generation) return;
                void controller.machine.close().catch((error) => console.error("실행 환경 종료 실패", error));
            });
        };
    }, [controller]);
    return <intelligenceContext.Provider value={controller}>{props.children}</intelligenceContext.Provider>;
}

export function useNotebookIntelligence() {
    return useContext(intelligenceContext);
}
