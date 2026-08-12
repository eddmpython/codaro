from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def testMarkdownPreviewOwnsSafeTypedDiagramBoundary() -> None:
    panel = read("editor/src/components/notebook/notebookPanel.tsx")
    parser = read("editor/src/lib/markdownPreview.ts")
    diagram = read("editor/src/lib/mermaidDiagram.ts")
    diagramComponent = read("editor/src/components/notebook/mermaidDiagram.tsx")

    assert "<MarkdownPreview" in panel
    assert "dangerouslySetInnerHTML" not in panel
    assert 'kind: "mermaid"' in parser
    assert 'FORBID_TAGS: forbiddenMarkdownTags' in parser
    assert 'FORBID_ATTR: ["formaction", "srcdoc", "style"]' in parser
    assert 'USE_PROFILES: { html: true }' in parser
    assert 'import("mermaid")' in diagram
    assert 'securityLevel: "strict"' in diagram
    assert 'htmlLabels: false' in diagram
    assert 'startOnLoad: false' in diagram
    assert 'FORBID_TAGS: ["a", "foreignObject", "iframe", "image", "script"]' in diagram
    assert "MERMAID_DIAGRAM_BUDGET" in diagram
    assert "--color-accent" in diagram
    assert "--color-background-surface" in diagram
    assert "IntersectionObserver" in diagramComponent
    assert "data-markdown-diagram-text-alternative" in diagramComponent


def testDiagramAuthoringActionWritesEditableMarkdown() -> None:
    model = read("editor/src/lib/cellModel.ts")
    actions = read("editor/src/components/app/cellAiActions.tsx")
    conversation = read("src/codaro/ai/conversation.py")

    assert '"diagram"' in model
    assert 'submit("diagram")' in actions
    assert "다이어그램" in actions
    for required in (
        "read-cells",
        "write-cell",
        "Mermaid fence",
        "accTitle",
        "accDescr",
        "노드는 24개",
        "클릭 동작",
        "외부 리소스",
    ):
        assert required in model
    for required in ("Diagram authoring", "read-cells", "write-cell", "fenced Mermaid"):
        assert required in conversation


def testDiagramDependenciesAndLazyChunkArePinned() -> None:
    package = json.loads(read("editor/package.json"))
    dependencies = package["dependencies"]
    assert dependencies["dompurify"] == "^3.4.13"
    assert dependencies["marked"] == "^18.0.9"
    assert dependencies["mermaid"] == "^11.16.1"

    vite = read("editor/vite.config.ts")
    assert "modulePreload: false" in vite
    assert 'name: "vitePreload"' in vite
    assert 'name: "markdownRuntime"' in vite
    assert 'name: "diagramRuntime"' in vite
    assert "priority: 70" in vite
    assert 'name: "vendor"' in vite

    performance = read("tests/surface/verifyFrontendPerformanceBudget.py")
    assert "MAX_LAZY_DIAGRAM_RUNTIME_BYTES = 3_500_000" in performance
    assert 'startswith("diagramRuntime-")' in performance
    assert "len(lazyDiagramChunks) != 1" in performance
