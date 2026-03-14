from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from codaro.document import createEmptyDocument
from codaro.server import createServerApp


def testLoadMissingDocument(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "newDocument.py"

    response = client.post("/api/document/load", json={"path": str(path)})

    assert response.status_code == 200
    payload = response.json()
    assert payload["exists"] is False
    assert payload["document"]["title"] == "newDocument"


def testSaveDocument(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "saved.py"
    document = createEmptyDocument("Saved")
    document.blocks[0].content = "value = 42"

    response = client.post(
        "/api/document/save",
        json={"path": str(path), "document": document.model_dump()},
    )

    assert response.status_code == 200
    assert path.exists()
    content = path.read_text(encoding="utf-8")
    assert 'app = codaro.App(title="Saved")' in content or "app = codaro.App(title='Saved')" in content
