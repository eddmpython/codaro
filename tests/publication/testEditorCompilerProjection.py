from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def testEditorProjectsBackendCompilerWithoutDuplicatingTargetRules() -> None:
    api = (ROOT / "editor/src/lib/api/publicationApi.ts").read_text(encoding="utf-8")
    hook = (ROOT / "editor/src/hooks/useNotebookRuntimeState.ts").read_text(encoding="utf-8")
    adapter = (ROOT / "editor/src/lib/publicationCompiler.ts").read_text(encoding="utf-8")
    panel = (ROOT / "editor/src/components/notebook/notebookPanel.tsx").read_text(encoding="utf-8")
    diagnostics = (ROOT / "editor/src/lib/reactiveDiagnostics.ts").read_text(encoding="utf-8")

    assert '"/api/publication/inspect"' in api
    assert "inspectPublication(document, drafts, sourcePath)" in hook
    assert "codaroApi.inspectPublication(materializeDrafts(document, drafts), sourcePath)" in adapter
    assert "data-publication-target={publicationTarget}" in panel
    assert "diagnostic.blockId !== blockId" in diagnostics
    for forbidden in ("eval(", "subprocess.", "os.system", "browserSmoke"):
        assert forbidden not in hook
        assert forbidden not in diagnostics


def testStaticPublicationUsesOnlyItsHashedRuntimePackages() -> None:
    runtime = (ROOT / "editor/src/lib/notebookRuntime.ts").read_text(encoding="utf-8")
    inference = (ROOT / "editor/src/lib/packageInference.ts").read_text(encoding="utf-8")

    assert "if (staticPublicationManifestUrl())" in runtime
    assert "return Array.from(packages);" in runtime
    assert '"codaro"' in inference
    assert '"pyodide"' in inference
    assert '"js"' in inference


def testEditableEmbedRunsTheReactiveDependencyClosure() -> None:
    app = (ROOT / "editor/src/App.tsx").read_text(encoding="utf-8")
    hook = (ROOT / "editor/src/hooks/useNotebookRuntimeState.ts").read_text(encoding="utf-8")

    assert "appRuntimeActive = serverAppMode === true || blockEmbedFrame !== null" in app
    assert 'curriculumRuntimeActive = !appRuntimeActive && surface === "curriculum"' in app
    assert 'blockEmbedFrame?.mode === "editable" ? block.content : drafts[block.id] ?? block.content' in app
    assert 'reactiveCellExecution: surface === "editor" || blockEmbedFrame?.mode === "editable"' in app
    assert "if (reactiveCellExecution && reactiveEnabled && isKernelExecutableBlock(block))" in hook
