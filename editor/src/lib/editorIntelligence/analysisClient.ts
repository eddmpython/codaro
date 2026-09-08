let worker: Worker | null = null;
let sequence = 0;
let consumers = 0;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> }>();

function closeAnalyzer(error: Error) {
    worker?.terminate();
    worker = null;
    for (const item of pending.values()) {
        clearTimeout(item.timeout);
        item.reject(error);
    }
    pending.clear();
}

export function retainCodeAnalyzer() {
    consumers += 1;
    let released = false;
    return () => {
        if (released) return;
        released = true;
        consumers -= 1;
        if (consumers === 0) closeAnalyzer(new Error("편집기를 닫아 코드 분석을 취소했습니다."));
    };
}

export function analyzeWorkerCode(request: unknown): Promise<unknown> {
    if (!worker) {
        worker = new Worker(new URL("./analysisWorker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<{ id: number; result?: unknown; error?: string; fatal?: boolean }>) => {
            if (event.data.fatal) {
                closeAnalyzer(new Error(event.data.error || "Python 코드 분석기를 준비하지 못했습니다. 다시 요청하세요."));
                return;
            }
            const item = pending.get(event.data.id);
            if (!item) return;
            pending.delete(event.data.id);
            clearTimeout(item.timeout);
            if (event.data.error) item.reject(new Error(event.data.error));
            else item.resolve(event.data.result);
        };
        worker.onerror = () => closeAnalyzer(new Error("Python 코드 분석기가 종료되었습니다. 다시 요청하세요."));
    }
    if (pending.size >= 32) return Promise.reject(new Error("앞선 코드 분석이 끝난 뒤 다시 시도하세요."));
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => closeAnalyzer(new Error("Python 코드 분석 시간이 초과되었습니다. 다시 요청하세요.")), 120_000);
        pending.set(id, { resolve, reject, timeout });
        worker!.postMessage({ id, request });
    });
}

if (typeof window !== "undefined") window.addEventListener("pagehide", () => closeAnalyzer(new Error("페이지를 닫아 코드 분석을 취소했습니다.")));
