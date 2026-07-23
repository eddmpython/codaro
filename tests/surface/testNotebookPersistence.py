from __future__ import annotations

import os
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[2]
ESBUILD = ROOT / "editor" / "node_modules" / ".bin" / (
    "esbuild.cmd" if os.name == "nt" else "esbuild"
)


def testBrowserNotebookRoundTripAndCorruptionFallback(tmp_path: Path) -> None:
    entry = tmp_path / "notebookPersistenceEntry.ts"
    bundle = tmp_path / "notebookPersistenceEntry.mjs"
    modulePath = (ROOT / "editor/src/lib/notebookPersistence.ts").as_posix()
    runtimeApiModulePath = (ROOT / "editor/src/lib/api/runtimeApi.ts").as_posix()
    entry.write_text(
        f"""
import {{
  browserNotebookStorageKey,
  loadBrowserNotebookDocument,
  resolveNotebookSaveCompletion,
  saveBrowserNotebookDocument,
}} from {modulePath!r};
import {{
  DOCUMENT_SAVE_KEEPALIVE_MAX_BYTES,
  documentSaveSupportsKeepalive,
  runtimeApi,
}} from {runtimeApiModulePath!r};

const values = new Map();
const storage = {{
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
}};
const document = {{
  id: "notebook-1",
  title: "분석.py",
  blocks: [{{ id: "cell-1", type: "code", content: "print('saved')" }}],
  metadata: {{ sourceFormat: "codaro", tags: ["notebook"] }},
  runtime: {{ defaultEngine: "local", reactiveMode: "hybrid", packages: [] }},
}};

saveBrowserNotebookDocument(storage, document);
const loaded = loadBrowserNotebookDocument(storage);
if (loaded.error) throw new Error(loaded.error);
if (loaded.document?.blocks[0]?.content !== "print('saved')") {{
  throw new Error("browser notebook content did not round-trip");
}}
if (resolveNotebookSaveCompletion({{
  currentEpoch: 2,
  latestSignature: "new",
  pendingSignature: null,
  snapshotEpoch: 1,
  snapshotSignature: "old",
}}) !== "ignore") {{
  throw new Error("previous document completion was not ignored");
}}
if (resolveNotebookSaveCompletion({{
  currentEpoch: 2,
  latestSignature: "newer",
  pendingSignature: "newer",
  snapshotEpoch: 2,
  snapshotSignature: "old",
}}) !== "pending") {{
  throw new Error("newer pending edits were reported as settled");
}}
if (resolveNotebookSaveCompletion({{
  currentEpoch: 2,
  latestSignature: "saved",
  pendingSignature: null,
  snapshotEpoch: 2,
  snapshotSignature: "saved",
}}) !== "settled") {{
  throw new Error("current saved snapshot did not settle");
}}

values.set(browserNotebookStorageKey, "{{broken");
const corrupted = loadBrowserNotebookDocument(storage);
if (corrupted.document !== null || !corrupted.error) {{
  throw new Error("corrupted browser payload did not fail closed");
}}

const saveOptions = {{
  keepalive: true,
  saveDocumentId: document.id,
  saveRevision: 1,
  saveSessionId: "session-1",
}};
if (!documentSaveSupportsKeepalive("small.py", document, saveOptions)) {{
  throw new Error("small document was rejected from keepalive");
}}
const largeDocument = {{
  ...document,
  blocks: [{{
    ...document.blocks[0],
    content: "가".repeat(DOCUMENT_SAVE_KEEPALIVE_MAX_BYTES),
  }}],
}};
if (documentSaveSupportsKeepalive("large.py", largeDocument, saveOptions)) {{
  throw new Error("large document exceeded the keepalive body contract");
}}

const observedKeepalive = [];
globalThis.fetch = async (_input, init) => {{
  observedKeepalive.push(Boolean(init?.keepalive));
  return new Response(
    JSON.stringify({{ accepted: true, path: "saved.py", saveRevision: 1 }}),
    {{ status: 200, headers: {{ "Content-Type": "application/json" }} }},
  );
}};
await runtimeApi.saveDocument("large.py", largeDocument, saveOptions);
await runtimeApi.saveDocument("small.py", document, saveOptions);
if (observedKeepalive.length !== 2) {{
  throw new Error("save API requests were not observed");
}}
if (observedKeepalive[0] !== false) {{
  throw new Error("large document used fetch keepalive");
}}
if (observedKeepalive[1] !== true) {{
  throw new Error("small document did not use fetch keepalive");
}}
""",
        encoding="utf-8",
    )
    subprocess.run(
        [
            str(ESBUILD),
            str(entry),
            "--bundle",
            "--platform=node",
            "--format=esm",
            f"--outfile={bundle}",
            f"--tsconfig={ROOT / 'editor/tsconfig.json'}",
            '--define:import.meta.env={"VITE_CODARO_API_BASE":""}',
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    subprocess.run(
        ["node", str(bundle)],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )


def testNotebookAutosaveOwnsPersistenceAndHonestStatusContract() -> None:
    hook = (ROOT / "editor/src/hooks/useNotebookDocumentState.ts").read_text(encoding="utf-8")
    persistence = (ROOT / "editor/src/lib/notebookPersistence.ts").read_text(encoding="utf-8")
    bootstrap = (ROOT / "editor/src/lib/appBootstrap.ts").read_text(encoding="utf-8")
    commandBar = (ROOT / "editor/src/components/notebook/notebookCommandBar.tsx").read_text(encoding="utf-8")

    assert 'from "@/lib/api"' not in hook
    assert "materializeDrafts(document, drafts)" in hook
    assert "NOTEBOOK_AUTOSAVE_DELAY_MS = 700" in hook
    assert "NotebookLocalPathBinding" in hook
    assert "localPathBindingRef.current.documentId === document.id" in hook
    assert "path: null" in hook
    assert "enqueueRegularSave(snapshot)" in hook
    assert "documentSaveSupportsKeepalive" in hook
    assert 'window.addEventListener("beforeunload", handleBeforeUnload)' in hook
    assert 'window.addEventListener("pagehide", handlePageHide)' in hook
    assert "prepareLoadedDocument(nextDocument)" in hook
    assert "persistNotebookDocument" in hook
    assert "resolveNotebookSaveCompletion" in hook
    assert "flushForPageTransition" in hook
    assert 'window.document.addEventListener("visibilitychange", handleVisibilityChange)' in hook
    assert "mountedRef.current = false" in hook
    assert "pendingRef.current = snapshot" in hook
    assert 'phase: completion === "pending" ? "pending" : "error"' in hook
    assert "replacementBlock" in hook
    assert "remainingBlocks.length" in hook

    assert "codaroApi.saveDocument(localPath?.trim() || null, document" in persistence
    assert "saveRevision: revision" in persistence
    assert "saveSessionId" in persistence
    assert "saveBrowserNotebookDocument(window.localStorage, document)" in persistence
    assert "documentPath: loadedDocument.path" in bootstrap
    assert "path: null" in bootstrap

    assert '"저장 실패"' in commandBar
    assert '"저장 중"' in commandBar
    assert '"저장 대기"' in commandBar
    assert '"파일 저장됨"' in commandBar
    assert '"브라우저 저장됨"' in commandBar
    assert "세션 자동 반영" not in commandBar
