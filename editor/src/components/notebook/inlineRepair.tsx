import { useState, type RefObject } from "react";
import type { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyRepairChanges, requestEditorRepair, type RepairProposal } from "@/lib/editorIntelligence/repair";
import { useNotebookIntelligence } from "./editorIntelligenceContext";

export function InlineRepair({ blockId, viewRef }: { blockId: string; viewRef: RefObject<EditorView | null> }) {
    const intelligence = useNotebookIntelligence();
    const [instruction, setInstruction] = useState("");
    const [proposal, setProposal] = useState<RepairProposal | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const request = async () => {
        const view = viewRef.current;
        if (!view || !intelligence) return;
        const document = intelligence.snapshot();
        const selection = view.state.selection.main;
        setBusy(true);
        setProposal(null);
        setMessage("");
        try {
            const result = await requestEditorRepair(document, blockId, selection.empty ? 0 : selection.from, selection.empty ? view.state.doc.length : selection.to, instruction, intelligence.result(blockId));
            if (intelligence.snapshot().version !== result.version) throw new Error("요청 중 코드가 변경되었습니다. 최신 코드에서 다시 요청하세요.");
            setProposal(result);
            setSelected(result.changes.map((_, index) => index));
            if (!result.changes.length) setMessage("제안된 코드 변경이 없습니다.");
        } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
        finally { setBusy(false); }
    };
    return <details className="border-t border-border py-2" data-inline-repair={blockId}>
        <summary className="cursor-pointer">코드 수정 요청</summary>
        <p className="py-2 text-muted-foreground">선택한 코드를 수정합니다. 선택 영역이 없으면 이 셀 전체를 사용합니다.</p>
        <div className="flex gap-2">
            <Input aria-label="코드 수정 요청" value={instruction} maxLength={4000} onChange={(event) => setInstruction(event.target.value)} placeholder="어떻게 바꿀까요?" onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && instruction.trim() && !busy) void request(); }} />
            <Button size="sm" disabled={busy || !instruction.trim()} onClick={() => void request()}>{busy ? "요청 중" : "수정 제안"}</Button>
        </div>
        {message ? <p className="whitespace-pre-wrap py-2 text-muted-foreground" role="status">{message}</p> : null}
        {proposal ? <div className="space-y-2 py-2">
            <p>{proposal.explanation}</p>
            {proposal.changes.map((change, index) => <div key={index} className="rounded-md border border-border p-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={selected.includes(index)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, index] : current.filter((item) => item !== index))} />변경 {index + 1}</label>
                <div className="grid gap-2 pt-2 md:grid-cols-2">
                    <div><p className="text-muted-foreground">원본</p><pre className="overflow-auto whitespace-pre-wrap">{change.before || "(빈 영역)"}</pre></div>
                    <div><p className="text-muted-foreground">제안</p><pre className="overflow-auto whitespace-pre-wrap">{change.after || "(삭제)"}</pre></div>
                </div>
            </div>)}
            <Button size="sm" disabled={!selected.length} onClick={() => {
                try {
                    intelligence?.applyRepair(proposal, selected);
                    setProposal(null);
                    setMessage("선택한 변경을 적용했습니다. Ctrl+Z로 되돌릴 수 있습니다.");
                } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
            }}>선택한 {selected.length}개 적용</Button>
            <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>제안 닫기</Button>
            <Button size="sm" variant="outline" disabled={busy || !selected.length} onClick={async () => {
                if (!intelligence) return;
                setBusy(true);
                try {
                    const document = intelligence.snapshot();
                    const result = await intelligence.machine.verify(document, applyRepairChanges(document, proposal, selected));
                    setMessage(`${result.passed ? "수정안 실행 완료" : "수정안 실행 실패"}\n${result.error || result.output}`);
                } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
                finally { setBusy(false); }
            }}>복제 환경에서 수정안 실행</Button>
        </div> : null}
    </details>;
}
