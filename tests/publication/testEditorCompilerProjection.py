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
