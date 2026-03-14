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


def testKernelCreateAndExecute() -> None:
    client = TestClient(createServerApp())

    createResponse = client.post("/api/kernel/create", json={})
    assert createResponse.status_code == 200
    sessionId = createResponse.json()["sessionId"]

    execResponse = client.post(
        f"/api/kernel/{sessionId}/execute",
        json={"code": "x = 10\nx * 2"},
    )
    assert execResponse.status_code == 200
    result = execResponse.json()
    assert result["status"] == "done"
    assert "20" in result["data"]

    varsResponse = client.get(f"/api/kernel/{sessionId}/variables")
    assert varsResponse.status_code == 200
    varNames = [v["name"] for v in varsResponse.json()]
    assert "x" in varNames

    client.delete(f"/api/kernel/{sessionId}")


def testKernelStatePersistence() -> None:
    client = TestClient(createServerApp())

    createResponse = client.post("/api/kernel/create", json={})
    sessionId = createResponse.json()["sessionId"]

    client.post(f"/api/kernel/{sessionId}/execute", json={"code": "total = 0"})
    client.post(f"/api/kernel/{sessionId}/execute", json={"code": "total += 5"})
    result = client.post(f"/api/kernel/{sessionId}/execute", json={"code": "total"})

    assert "5" in result.json()["data"]

    client.delete(f"/api/kernel/{sessionId}")


def testKernelReset() -> None:
    client = TestClient(createServerApp())

    createResponse = client.post("/api/kernel/create", json={})
    sessionId = createResponse.json()["sessionId"]

    client.post(f"/api/kernel/{sessionId}/execute", json={"code": "val = 99"})
    client.post(f"/api/kernel/{sessionId}/reset")
    result = client.post(f"/api/kernel/{sessionId}/execute", json={"code": "val"})

    assert result.json()["status"] == "error"

    client.delete(f"/api/kernel/{sessionId}")


def testFileSystemApi(tmp_path: Path) -> None:
    client = TestClient(createServerApp())

    writeResponse = client.post(
        "/api/fs/write",
        json={"path": str(tmp_path / "test.txt"), "content": "hello fs"},
    )
    assert writeResponse.status_code == 200

    readResponse = client.post(
        "/api/fs/read",
        json={"path": str(tmp_path / "test.txt")},
    )
    assert readResponse.status_code == 200
    assert readResponse.json()["content"] == "hello fs"

    listResponse = client.post(
        "/api/fs/list",
        json={"path": str(tmp_path)},
    )
    assert listResponse.status_code == 200
    names = [e["name"] for e in listResponse.json()["entries"]]
    assert "test.txt" in names


def testPackagesList() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/packages/list")
    assert response.status_code == 200
    packages = response.json()
    assert len(packages) > 0


def testEnvironmentInfo() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/env/info")
    assert response.status_code == 200
    info = response.json()
    assert "pythonVersion" in info
    assert "platform" in info


def testDocumentBlockOperations(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "ops_test.py"
    document = createEmptyDocument("OpsTest")
    document.blocks[0].content = "original = True"
    client.post(
        "/api/document/save",
        json={"path": str(path), "document": document.model_dump()},
    )

    insertResponse = client.post(
        "/api/document/insert-block",
        json={
            "path": str(path),
            "anchorBlockId": document.blocks[0].id,
            "direction": "after",
            "type": "code",
            "content": "inserted = True",
        },
    )
    assert insertResponse.status_code == 200
    newBlockId = insertResponse.json()["blockId"]

    updateResponse = client.post(
        "/api/document/update-block",
        json={
            "path": str(path),
            "blockId": newBlockId,
            "content": "updated = True",
        },
    )
    assert updateResponse.status_code == 200
    assert updateResponse.json()["block"]["content"] == "updated = True"

    removeResponse = client.post(
        "/api/document/remove-block",
        json={"path": str(path), "blockId": newBlockId},
    )
    assert removeResponse.status_code == 200
    remainingIds = [b["id"] for b in removeResponse.json()["document"]["blocks"]]
    assert newBlockId not in remainingIds
