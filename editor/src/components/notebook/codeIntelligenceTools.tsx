import { useEffect, useRef, useState, type RefObject } from "react";
import type { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeEditorCode, type AnalysisOperation, type AnalysisResponse } from "@/lib/editorIntelligence/service";
import { useNotebookIntelligence } from "./editorIntelligenceContext";
import { InlineRepair } from "./inlineRepair";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { EditorLocation } from "@/lib/editorIntelligence/document";

export const codeIntelligenceActions = [
    { action: "definition", label: "정의로 이동", key: "F12" },
    { action: "references", label: "사용한 곳 찾기", key: "Shift-F12" },
    { action: "rename", label: "이름 바꾸기", key: "F2" },
    { action: "signature", label: "함수 사용법", key: "Mod-Shift-Space" },
    { action: "hover", label: "설명 보기", key: null },
    { action: "diagnostics", label: "문법 검사", key: null },
    { action: "repair", label: "코드 수정 요청", key: null },
] as const;
export type CodeIntelligenceAction = typeof codeIntelligenceActions[number]["action"];
export type CodeIntelligenceCommand = { action: CodeIntelligenceAction; sequence: number };

export function CodeIntelligenceTools({ blockId, viewRef, selected, command }: {
    blockId: string;
    viewRef: RefObject<EditorView | null>;
    selected: boolean;
    command: CodeIntelligenceCommand | null;
}) {
    const intelligence = useNotebookIntelligence();
    const [analysis, setResponse] = useState<AnalysisResponse | null>(null);
    const version = intelligence?.snapshot().version;
    const response = analysis?.version === version ? analysis : null;
    const [operation, setOperation] = useState<CodeIntelligenceAction | null>(null);
    const [newName, setNewName] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const requestSequence = useRef(0);
    const restoreFocus = useRef(true);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const navigation = useRef<{ location: EditorLocation; version: string } | null>(null);
    const close = (focusEditor = true) => {
        restoreFocus.current = focusEditor;
        requestSequence.current += 1;
        setOperation(null);
        setResponse(null);
        setMessage("");
        setBusy(false);
    };
    useEffect(() => { if (!selected) close(false); }, [selected]);
    useEffect(() => {
        requestSequence.current += 1;
        setResponse(null);
        setMessage("");
        setBusy(false);
    }, [version]);
    useEffect(() => () => { requestSequence.current += 1; }, []);
    const navigate = (location: EditorLocation, version: string) => {
        if (dialogRef.current) {
            navigation.current = { location, version };
            close(false);
        } else {
            intelligence?.navigate(location, version);
            close(false);
        }
    };
    const request = async (next: Exclude<AnalysisOperation, "complete">) => {
        const view = viewRef.current;
        if (!view || !intelligence || !view.state.doc.toString().trim()) return;
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
            if (next === "definition" && result.locations?.length === 1) {
                navigate(result.locations[0], result.version);
            }
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
        close();
        if (command.action === "rename" || command.action === "repair") {
            setOperation(command.action);
            setNewName("");
        } else void request(command.action);
    }, [command]);
    if (!intelligence || !selected || !operation) return null;
    return (
        <Dialog.Root open onOpenChange={(open) => { if (!open) close(); }}>
        <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/55 backdrop-blur-sm" />
        <Dialog.Content ref={dialogRef} aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-lg [&_button]:h-auto [&_button]:min-h-9 [&_button]:whitespace-normal [&_button]:py-1"
            data-code-intelligence={blockId}
            onCloseAutoFocus={(event) => {
                event.preventDefault();
                const target = navigation.current;
                navigation.current = null;
                if (target) {
                    try { intelligence.navigate(target.location, target.version); }
                    catch (error) {
                        setOperation("definition");
                        setMessage(error instanceof Error ? error.message : String(error));
                    }
                } else if (restoreFocus.current) viewRef.current?.focus();
            }}>
            <div className="flex items-center gap-2">
                <Dialog.Title className="font-medium">{codeIntelligenceActions.find((item) => item.action === operation)?.label}</Dialog.Title>
                {busy ? <span role="status">코드 분석 중</span> : null}
                <Dialog.Close asChild><Button className="ml-auto shrink-0" variant="ghost" size="icon" aria-label="코드 도구 닫기"><X className="size-4" /></Button></Dialog.Close>
            </div>
            {operation === "rename" ? (
                <div className="flex flex-wrap items-center gap-2 py-2">
                    <Input autoFocus aria-label="새 Python 이름" placeholder="새 이름" className="max-w-56" value={newName} onChange={(event) => setNewName(event.target.value)} />
                    <Button size="sm" disabled={busy || !newName.trim()} onClick={() => void request("rename")}>변경 확인</Button>
                    {response?.edits?.length ? <Button size="sm" onClick={() => {
                        try {
                            intelligence.apply(response.version, response.edits!);
                            setResponse(null);
                            setMessage("이름을 변경했습니다. Ctrl+Z로 되돌릴 수 있습니다.");
                        } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
                    }}>{response.edits.length}곳 적용</Button> : null}
                </div>
            ) : null}
            {message ? <p role="status" className="py-2 text-muted-foreground">{message}</p> : null}
            {response?.locations?.map((location, index) => <button key={index} type="button" className="block py-1 text-left underline" onClick={() => {
                try { navigate(location, response.version); }
                catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
            }}>{location.path}:{location.line} {location.name}</button>)}
            {response?.signatures?.map((signature, index) => <pre key={index} className="overflow-x-auto py-2">{signature.label}</pre>)}
            {response?.items?.map((item, index) => <p key={index} className="whitespace-pre-wrap py-2">{item.description}{"\n"}{item.documentation}</p>)}
            {response?.diagnostics?.map((diagnostic, index) => <p key={index} className="py-1 text-destructive">{diagnostic.line}줄: {diagnostic.message}</p>)}
            {response?.edits?.map((edit, index) => <p key={index} className="py-1">{edit.path}:{edit.line} {edit.name} → {edit.text}</p>)}
            {operation === "repair" ? <InlineRepair blockId={blockId} viewRef={viewRef} /> : null}
        </Dialog.Content>
        </Dialog.Portal>
        </Dialog.Root>
    );
}
