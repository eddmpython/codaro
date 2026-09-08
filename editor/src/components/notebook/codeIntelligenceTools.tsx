import { useEffect, useRef, useState, type RefObject } from "react";
import type { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeEditorCode, type AnalysisOperation, type AnalysisResponse } from "@/lib/editorIntelligence/service";
import { useNotebookIntelligence } from "./editorIntelligenceContext";
import { InlineRepair } from "./inlineRepair";

export function CodeIntelligenceTools({ blockId, viewRef, selected, command }: {
    blockId: string;
    viewRef: RefObject<EditorView | null>;
    selected: boolean;
    command: { action: AnalysisOperation; sequence: number } | null;
}) {
    const intelligence = useNotebookIntelligence();
    const [analysis, setResponse] = useState<AnalysisResponse | null>(null);
    const version = intelligence?.snapshot().version;
    const response = analysis?.version === version ? analysis : null;
    const [operation, setOperation] = useState<AnalysisOperation | null>(null);
    const [newName, setNewName] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const requestSequence = useRef(0);
    useEffect(() => {
        requestSequence.current += 1;
        setResponse(null);
        setMessage("");
        setBusy(false);
    }, [version]);
    useEffect(() => () => { requestSequence.current += 1; }, []);
    const request = async (next: AnalysisOperation) => {
        const view = viewRef.current;
        if (!view || !intelligence) return;
        const document = intelligence.snapshot();
        const sequence = ++requestSequence.current;
        setBusy(true);
        setMessage("");
        setOperation(next);
        setResponse(null);
        try {
            const result = await analyzeEditorCode(document, blockId, view.state.selection.main.head, next, newName);
            if (requestSequence.current !== sequence) return;
            if (intelligence.snapshot().version !== result.version) {
                setMessage("코드가 변경되었습니다. 최신 코드에서 다시 요청하세요.");
                return;
            }
            setResponse(result);
            if (next === "definition" && result.locations?.length === 1) intelligence.navigate(result.locations[0], result.version);
            if (next === "diagnostics" && !result.diagnostics?.length) setMessage("문법 오류가 없습니다.");
            if ((next === "references" || next === "definition") && !result.locations?.length) setMessage("현재 문서에서 찾지 못했습니다.");
        } catch (error) {
            if (requestSequence.current === sequence) setMessage(error instanceof Error ? error.message : String(error));
        } finally {
            if (requestSequence.current === sequence) setBusy(false);
        }
    };
    useEffect(() => {
        if (!command) return;
        if (command.action === "rename") {
            setOperation("rename");
            setResponse(null);
        } else void request(command.action);
    }, [command]);
    if (!intelligence || !selected) return null;
    return (
        <div className="border-t border-border px-2 py-1 text-xs [&_button]:h-auto [&_button]:min-h-8 [&_button]:whitespace-normal [&_button]:py-1" data-code-intelligence={blockId}>
            <div className="flex flex-wrap items-center gap-1">
                {([
                    ["definition", "정의"], ["references", "참조"], ["signature", "인자"],
                    ["hover", "문서"], ["diagnostics", "문법 검사"],
                ] as const).map(([action, label]) => (
                    <Button key={action} variant="ghost" size="sm" disabled={busy} onClick={() => void request(action)}>{label}</Button>
                ))}
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => { setOperation("rename"); setResponse(null); }}>이름 변경</Button>
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => setMessage(intelligence.undo() ? "문서 수정을 되돌렸습니다." : "되돌릴 문서 수정이 없거나 이후 코드가 변경되었습니다.")}>문서 수정 되돌리기</Button>
                {busy ? <span role="status">코드 분석 중</span> : null}
            </div>
            {operation === "rename" ? (
                <div className="flex flex-wrap items-center gap-2 py-2">
                    <Input aria-label="새 Python 이름" className="max-w-56" value={newName} onChange={(event) => setNewName(event.target.value)} />
                    <Button size="sm" disabled={busy || !newName.trim()} onClick={() => void request("rename")}>변경 확인</Button>
                    {response?.edits?.length ? <Button size="sm" onClick={() => {
                        try {
                            intelligence.apply(response.version, response.edits!);
                            setResponse(null);
                            setMessage("이름을 변경했습니다.");
                        } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
                    }}>{response.edits.length}곳 적용</Button> : null}
                </div>
            ) : null}
            {message ? <p role="status" className="py-2 text-muted-foreground">{message}</p> : null}
            {response?.locations?.map((location, index) => <button key={index} type="button" className="block py-1 text-left underline" onClick={() => {
                try { intelligence.navigate(location, response.version); }
                catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
            }}>{location.path}:{location.line} {location.name}</button>)}
            {response?.signatures?.map((signature, index) => <pre key={index} className="overflow-x-auto py-2">{signature.label}</pre>)}
            {response?.items?.map((item, index) => <p key={index} className="whitespace-pre-wrap py-2">{item.description}{"\n"}{item.documentation}</p>)}
            {response?.diagnostics?.map((diagnostic, index) => <p key={index} className="py-1 text-destructive">{diagnostic.line}줄: {diagnostic.message}</p>)}
            {response?.edits?.map((edit, index) => <p key={index} className="py-1">{edit.path}:{edit.line} {edit.name} → {edit.text}</p>)}
            <InlineRepair blockId={blockId} viewRef={viewRef} />
        </div>
    );
}
