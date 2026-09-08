type PythonAssetManifest = {
    packageRoot?: string;
    files?: Array<{ path: string; url: string; integrity: string; roles?: string[] }>;
};

export async function loadPythonAssets(manifestUrl: string, resolveAsset: (value: string) => string) {
    const response = await fetch(manifestUrl, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(`Python 실행 자산 목록을 가져오지 못했습니다: ${response.status}`);
    const manifest = await response.json() as PythonAssetManifest;
    const files = manifest.files ?? [];
    const pythonIndexUrl = resolveAsset(manifest.packageRoot ?? "vendor/pyodide/");
    const engineScript = files.find((file) => file.roles?.includes("engineScript"));
    const coreFiles: Record<string, string> = {};
    for (const file of files) {
        const url = resolveAsset(file.url);
        coreFiles[file.path] = file.integrity;
        coreFiles[url] = file.integrity;
        coreFiles[new URL(url).pathname] = file.integrity;
    }
    return {
        indexURL: pythonIndexUrl.endsWith("/") ? pythonIndexUrl : `${pythonIndexUrl}/`,
        coreIntegrity: { files: coreFiles, required: true },
        ...(engineScript ? { engineScriptIntegrity: engineScript.integrity } : {}),
    };
}
