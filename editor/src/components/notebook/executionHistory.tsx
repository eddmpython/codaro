import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotebookIntelligence } from "./editorIntelligenceContext";

export function ExecutionHistory() {
    const intelligence = useNotebookIntelligence();
    const [checks, setChecks] = useState("");
    const [message, setMessage] = useState("");
    const machine = intelligence?.machine;
    useSyncExternalStore((listener) => machine?.subscribe(listener) ?? (() => {}), () => machine?.revision ?? 0);
    if (!intelligence || !machine) return null;
    const state = machine.inspect();
    const run = async (action: () => Promise<unknown>) => {
        setMessage("");
        const pending = action();
        try { await pending; }
        catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    };
    return <details className="border-b border-border px-3 py-2 text-xs" data-execution-history data-machine-phase={state.phase}>
        <summary className="cursor-pointer">실행 이력과 수정 검증</summary>
        <p className="py-2 text-muted-foreground">이 노트북을 별도 Python 환경에서 실행하고 셀마다 상태를 저장합니다. 수정안과 검사는 복제한 상태에서 실행합니다. 표준 라이브러리를 지원하며 파일은 이 환경 안에 보관합니다.</p>
        {state.version && state.version !== intelligence.snapshot().version ? <p className="pb-2 text-muted-foreground">기준 실행 뒤 코드가 바뀌었습니다. 최신 코드로 다시 기준 실행하세요.</p> : null}
        <div className="flex gap-2">
            <Button size="sm" data-machine-action="run" disabled={state.busy} onClick={() => void run(() => machine.run(intelligence.snapshot()))}>기준 실행</Button>
            <Button size="sm" data-machine-action="stop" variant="outline" disabled={!state.busy} onClick={() => void run(() => machine.stop())}>실행 중지</Button>
        </div>
        <div className="my-2 max-h-28 space-y-1 overflow-auto">
            {state.checkpoints.map((entry) => <div key={entry.blockId} className="rounded-md border border-border p-2">
                <div className="flex items-center justify-between"><span>{entry.label}: {entry.error ? "실행 오류" : "실행 완료"}</span><Button size="sm" variant="ghost" disabled={state.busy} onClick={() => void run(async () => { await machine.restore(entry.blockId, intelligence.snapshot().version); setMessage(`${entry.label} 실행 직후 상태로 복원했습니다.`); })}>상태 복원</Button></div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap">{entry.error || entry.output}</pre>
            </div>)}
        </div>
        <Textarea aria-label="복제 환경 검사 코드" value={checks} onChange={(event) => setChecks(event.target.value)} placeholder="assert result == expected" className="h-16 min-h-16 font-mono text-xs" />
        <Button size="sm" data-machine-action="verify" className="mt-2" disabled={state.busy || !checks.trim() || !state.version} onClick={() => void run(async () => {
            const result = await machine.verify(intelligence.snapshot(), {}, checks);
            setMessage(`${result.passed ? "검사 통과" : "검사 실패"}\n${result.error || result.output}`);
        })}>복제 상태에서 검사 실행</Button>
        {state.busy ? <p role="status" className="pt-2">{{ idle: "실행 준비 중", preparing: "실행 환경 준비 중", running: "코드 실행 중", checking: "복제 환경에서 검사 중", restoring: "실행 상태 복원 중", stopping: "실행 중지 중" }[state.phase]}</p> : null}
        {message ? <pre role="status" className="max-h-48 overflow-auto whitespace-pre-wrap py-2">{message}</pre> : null}
    </details>;
}
