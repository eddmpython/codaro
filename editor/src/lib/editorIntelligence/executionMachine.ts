import type { boot } from "pyproc-machine";
import type { EditorDocument } from "./document";

type Machine = Awaited<ReturnType<typeof boot>>;
type Process = {
    execute: (code: string) => Promise<unknown>;
    close: () => Promise<unknown>;
    signal: (signal: "terminate") => Promise<unknown>;
    session: { run: (code: string) => Promise<unknown> };
};
export type ExecutionCheckpoint = { blockId: string; label: string; output: string; error?: string; checkpoint: unknown; before: unknown };
export type MachineVerification = { passed: boolean; output: string; error?: string; version: string };

function outputText(receipt: unknown): string {
    if (!receipt || typeof receipt !== "object") return "";
    return String((receipt as { output?: unknown }).output ?? "");
}

export class EditorExecutionMachine {
    private machine: Machine | null = null;
    private process: Process | null = null;
    private busy = false;
    private closed = false;
    private generation = 0;
    private listeners = new Set<() => void>();
    private phase: "idle" | "preparing" | "running" | "checking" | "restoring" | "stopping" = "idle";
    revision = 0;
    private baseline: EditorDocument | null = null;
    private checkpoints: ExecutionCheckpoint[] = [];

    inspect() {
        return { busy: this.busy, phase: this.phase, version: this.baseline?.version, checkpoints: this.checkpoints.map(({ checkpoint: _, before: __, ...item }) => item) };
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    private notify() {
        this.revision += 1;
        for (const listener of this.listeners) listener();
    }

    private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
        if (this.closed) throw new Error("실행 환경이 닫혔습니다.");
        if (this.busy) throw new Error("앞선 실행이 끝난 뒤 다시 시도하세요.");
        this.busy = true;
        this.notify();
        try { return await operation(); }
        finally { this.busy = false; this.phase = "idle"; this.notify(); }
    }

    async run(document: EditorDocument) {
        return this.exclusive(async () => {
            this.phase = "preparing";
            this.notify();
            const generation = this.generation;
            if (!window.crossOriginIsolated) throw new Error("실행 환경을 준비하려면 페이지를 새로고침하세요. Chromium 또는 Edge가 필요합니다.");
            const url = new URL(`${import.meta.env.BASE_URL}vendor/pyprocMachine/index.js`, window.location.origin).href;
            const runtime = await import(/* @vite-ignore */ url) as typeof import("pyproc-machine");
            const environment = runtime.checkEnvironment();
            if (!environment.ok) throw new Error(environment.issues.map((issue) => issue.need).join(", "));
            const assets = await fetch(`${import.meta.env.BASE_URL}pyproc-machine-assets.json`);
            if (!assets.ok) throw new Error("실행 자산 목록을 가져오지 못했습니다.");
            if (this.machine) await this.machine.close();
            this.machine = null;
            this.baseline = null;
            this.checkpoints = [];
            const machine = await runtime.boot({ assetIntegrity: await assets.json() });
            if (this.closed || generation !== this.generation) { await machine.close(); throw new Error("실행을 중지했습니다."); }
            this.machine = machine;
            this.baseline = document;
            for (const [index, cell] of document.cells.entries()) {
                const before = await machine.history.checkpoint();
                let output = "";
                let error: string | undefined;
                this.phase = "running";
                this.notify();
                try { output = outputText(await machine.run.python(cell.source)); }
                catch (failure) { error = failure instanceof Error ? failure.message : String(failure); }
                if (generation !== this.generation) throw new Error("실행을 중지했습니다.");
                const checkpoint = await machine.history.checkpoint();
                this.checkpoints.push({ blockId: cell.id, label: `${index + 1}번 셀`, output, error, before, checkpoint });
                this.notify();
                if (error) break;
            }
            return this.inspect();
        });
    }

    async verify(document: EditorDocument, changes: Record<string, string>, checks = ""): Promise<MachineVerification> {
        return this.exclusive(async () => {
            this.phase = "checking";
            this.notify();
            const generation = this.generation;
            const machine = this.machine;
            if (!machine || this.baseline?.version !== document.version) throw new Error("현재 코드로 기준 실행을 먼저 하세요.");
            if (Object.keys(changes).some((id) => !document.cells.some((cell) => cell.id === id))) throw new Error("수정할 셀이 현재 문서에 없습니다.");
            const first = document.cells.findIndex((cell) => cell.id in changes);
            const checkpoint = first < 0 ? undefined : this.checkpoints[first]?.before;
            if (first >= 0 && !checkpoint) throw new Error("수정할 셀까지 기준 실행이 도달하지 못했습니다.");
            const spawned = (first < 0
                ? await machine.proc.clone()
                : await machine.proc.spawn(machine.manifest, { restore: checkpoint })) as { process: Process };
            if (this.closed || generation !== this.generation) { await spawned.process.close(); throw new Error("검사를 중지했습니다."); }
            this.process = spawned.process;
            let output = "";
            try {
                if (first >= 0) {
                    for (const cell of document.cells.slice(first)) output += outputText(await spawned.process.session.run(changes[cell.id] ?? cell.source)) + "\n";
                }
                if (checks.trim()) output += outputText(await spawned.process.session.run(checks));
                return { passed: true, output, version: document.version };
            } catch (failure) {
                const error = generation !== this.generation ? "검사를 중지했습니다." : failure instanceof Error ? failure.message : String(failure);
                return { passed: false, output, error, version: document.version };
            } finally {
                try { await spawned.process.close(); }
                finally { this.process = null; }
            }
        });
    }

    async restore(blockId: string, version: string) {
        return this.exclusive(async () => {
            this.phase = "restoring";
            this.notify();
            const checkpoint = this.checkpoints.find((item) => item.blockId === blockId);
            if (!this.machine || this.baseline?.version !== version || !checkpoint) throw new Error("현재 코드에 맞는 실행 이력이 없습니다.");
            await this.machine.history.restore(checkpoint.checkpoint);
        });
    }

    async stop() {
        this.generation += 1;
        this.phase = "stopping";
        this.notify();
        if (this.process) await this.process.signal("terminate");
        else if (this.machine) {
            const machine = this.machine;
            this.machine = null;
            this.baseline = null;
            this.checkpoints = [];
            await machine.close();
        }
        if (!this.busy) { this.phase = "idle"; this.notify(); }
    }

    async close() {
        this.closed = true;
        await this.stop();
        if (this.machine) { await this.machine.close(); this.machine = null; }
    }
}
