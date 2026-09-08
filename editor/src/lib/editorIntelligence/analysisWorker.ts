import { loadPyodide } from "pyodide";
import { bootRuntime } from "pyproc/runtime";
import source from "../../../../src/codaro/document/codeIntelligence.py?raw";
import { loadPythonAssets } from "../pythonAssets";

async function createAnalyzer() {
    const base = new URL(import.meta.env.BASE_URL, self.location.origin);
    const options = await loadPythonAssets(new URL("pyodide-assets.json", base).href, (value) => new URL(value, base).href);
    const { engineScriptIntegrity: _, ...workerOptions } = options;
    const runtime = await bootRuntime({ ...workerOptions, loadPyodide: (config: unknown) => loadPyodide(config as Parameters<typeof loadPyodide>[0]) });
    await runtime.loadPackages(["jedi"]);
    runtime.run([
        "import json as _analysisJson, sys as _analysisSys, types as _analysisTypes",
        "_analysisModule = _analysisTypes.ModuleType('_codaroCodeIntelligence')",
        "_analysisSys.modules['_codaroCodeIntelligence'] = _analysisModule",
        `exec(${JSON.stringify(source)}, _analysisModule.__dict__)`,
    ].join("\n"));
    return runtime;
}

let analyzer: ReturnType<typeof createAnalyzer> | null = null;
self.onmessage = async (event: MessageEvent<{ id: number; request: unknown }>) => {
    const { id, request } = event.data;
    let ready = false;
    try {
        analyzer ??= createAnalyzer();
        const runtime = await analyzer;
        ready = true;
        const result = runtime.run(`_analysisJson.dumps(_analysisModule.analyzeCode(_analysisJson.loads(${JSON.stringify(JSON.stringify(request))})), ensure_ascii=False)`);
        self.postMessage({ id, result: JSON.parse(String(result)) });
    } catch (error) {
        self.postMessage({ id, error: error instanceof Error ? error.message : String(error), fatal: !ready });
    }
};
