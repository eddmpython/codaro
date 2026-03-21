from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

import codaro.server as serverModule
from codaro.document import createEmptyDocument
from codaro.runtime import LocalEngine
from codaro.server import createServerApp
from codaro.system import packageOps


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
    assert "codaro:app" in content
    assert "value = 42" in content


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
    assert result["stateDelta"]["added"] == [
        {
            "name": "x",
            "typeName": "int",
            "repr": "10",
            "size": None,
        }
    ]
    assert [event["eventType"] for event in result["events"]] == ["started", "display", "stateDelta", "finished"]

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


def testKernelSessionFileApi(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    sessionId = client.post(
        "/api/kernel/create",
        json={"workingDirectory": str(tmp_path)},
    ).json()["sessionId"]

    writeResponse = client.post(
        f"/api/kernel/{sessionId}/fs/write",
        json={"path": "session-note.txt", "content": "hello session fs"},
    )
    assert writeResponse.status_code == 200

    readResponse = client.post(
        f"/api/kernel/{sessionId}/fs/read",
        json={"path": "session-note.txt"},
    )
    assert readResponse.status_code == 200
    assert readResponse.json()["content"] == "hello session fs"

    existsResponse = client.post(
        f"/api/kernel/{sessionId}/fs/exists",
        json={"path": "session-note.txt"},
    )
    assert existsResponse.status_code == 200
    assert existsResponse.json()["exists"] is True

    client.delete(f"/api/kernel/{sessionId}")


def testKernelSessionPackagesListUsesEngine(monkeypatch) -> None:
    async def fakeListPackages(self):
        del self
        return [packageOps.PackageInfo(name="SessionPkg", version="1.0.0")]

    monkeypatch.setattr(LocalEngine, "listPackages", fakeListPackages)
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    response = client.get(f"/api/kernel/{sessionId}/packages/list")

    assert response.status_code == 200
    assert response.json() == [{"name": "SessionPkg", "version": "1.0.0"}]

    client.delete(f"/api/kernel/{sessionId}")


def testFileSystemApi(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

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


def testFileSystemApiUsesWorkspaceEngine(monkeypatch, tmp_path: Path) -> None:
    async def fakeWriteFile(self, path: str, content: str, *, encoding: str = "utf-8", createDirectories: bool = True):
        del self, content, encoding, createDirectories
        return str(tmp_path / f"engine-{Path(path).name}")

    monkeypatch.setattr(LocalEngine, "writeFile", fakeWriteFile)
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.post(
        "/api/fs/write",
        json={"path": "delegated.txt", "content": "engine path"},
    )

    assert response.status_code == 200
    assert response.json()["path"] == str(tmp_path / "engine-delegated.txt")


def testPackagesListUsesWorkspaceEngine(monkeypatch) -> None:
    async def fakeListPackages(self):
        del self
        return [packageOps.PackageInfo(name="WorkspacePkg", version="9.9.9")]

    monkeypatch.setattr(LocalEngine, "listPackages", fakeListPackages)
    client = TestClient(createServerApp())

    response = client.get("/api/packages/list")

    assert response.status_code == 200
    assert response.json() == [{"name": "WorkspacePkg", "version": "9.9.9"}]


def testEnvironmentInfo() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/env/info")
    assert response.status_code == 200
    info = response.json()
    assert "pythonVersion" in info
    assert "platform" in info


def testStructuredErrorEnvelope() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/kernel/missing-session/variables")

    assert response.status_code == 404
    payload = response.json()
    assert payload["error"]["code"] == "session_not_found"
    assert payload["error"]["message"] == "Session not found."


def testValidationErrorEnvelope() -> None:
    client = TestClient(createServerApp())

    response = client.post("/api/document/save", json={})

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "validation_error"
    assert "Field required" in payload["error"]["message"]


def testRootDisablesEditorCache() -> None:
    client = TestClient(createServerApp())

    response = client.get("/")

    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store, no-cache, must-revalidate"


def testMissingEditorBuildFallbackResponse(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setattr(serverModule, "WEB_BUILD_ROOT", tmp_path)
    client = TestClient(serverModule.createServerApp())

    response = client.get("/")

    assert response.status_code == 200
    assert "Codaro editor build not found" in response.json()["detail"]


def testWorkspaceIndexClassifiesNotebookTypes(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    notebookDir = tmp_path / "notebooks"
    notebookDir.mkdir()
    (notebookDir / "demo.codaro.py").write_text("# codaro:app\nimport codaro\n", encoding="utf-8")
    (tmp_path / "scratch.py").write_text("# %% [code]\nvalue = 1\n", encoding="utf-8")
    (notebookDir / "demo.marimo.py").write_text("import marimo\napp = marimo.App()\n@app.cell\ndef _():\n    return\n", encoding="utf-8")
    (notebookDir / "demo.ipynb").write_text('{"cells":[],"metadata":{},"nbformat":4,"nbformat_minor":5}', encoding="utf-8")
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "server.py").write_text("print('notebook 아님')\n", encoding="utf-8")

    response = client.get("/api/workspace/index")

    assert response.status_code == 200
    payload = response.json()
    assert payload["workspaceRoot"] == str(tmp_path.resolve())
    assert len(payload["recentDocuments"]) == 3
    recentTypes = {entry["notebookType"] for entry in payload["recentDocuments"]}
    assert recentTypes <= {"codaro", "marimo", "jupyter"}
    assert payload["totalCodaroDocuments"] == 2
    assert payload["totalCompatibleDocuments"] == 2

    topDirectory = next(node for node in payload["codaroTree"] if node["name"] == "notebooks")
    fileTypes = {child["name"]: child["notebookType"] for child in topDirectory["children"]}
    assert fileTypes["demo.codaro.py"] == "codaro"
    compatibleNames = {entry["name"] for entry in payload["compatibleDocuments"]}
    assert {"demo.marimo.py", "demo.ipynb"} <= compatibleNames

    rootFileNames = {node["name"] for node in payload["codaroTree"] if not node["isDirectory"]}
    assert "scratch.py" in rootFileNames
    assert "server.py" not in rootFileNames


def testBootstrapIncludesWorkspaceRoot(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.get("/api/bootstrap")

    assert response.status_code == 200
    assert response.json()["workspaceRoot"] == str(tmp_path.resolve())


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


def testWorkspaceBoundaryBlocksOutsideFsPaths(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    outsidePath = tmp_path.parent / "outside.txt"

    response = client.post("/api/fs/write", json={"path": str(outsidePath), "content": "blocked"})

    assert response.status_code == 403
    payload = response.json()
    assert payload["error"]["code"] == "workspace_path_forbidden"


def testWorkspaceBoundaryBlocksMoveOutsideWorkspace(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    source = tmp_path / "inside.txt"
    source.write_text("hello", encoding="utf-8")
    outsidePath = tmp_path.parent / "outside.txt"

    response = client.post(
        "/api/fs/move",
        json={"source": str(source), "destination": str(outsidePath)},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "workspace_path_forbidden"
    assert source.exists()


def testDocumentMoveBlockRejectsZeroOffset(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "move_test.py"
    document = createEmptyDocument("MoveTest")
    client.post("/api/document/save", json={"path": str(path), "document": document.model_dump()})

    response = client.post(
        "/api/document/move-block",
        json={"path": str(path), "blockId": document.blocks[0].id, "offset": 0},
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "document_move_invalid_offset"


def testDocumentUpdateBlockRejectsEmptyUpdate(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "update_test.py"
    document = createEmptyDocument("UpdateTest")
    client.post("/api/document/save", json={"path": str(path), "document": document.model_dump()})

    response = client.post(
        "/api/document/update-block",
        json={"path": str(path), "blockId": document.blocks[0].id},
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "document_block_update_empty"


def testDocumentInsertBlockRejectsInvalidType(tmp_path: Path) -> None:
    client = TestClient(createServerApp())
    path = tmp_path / "insert_test.py"
    document = createEmptyDocument("InsertTest")
    client.post("/api/document/save", json={"path": str(path), "document": document.model_dump()})

    response = client.post(
        "/api/document/insert-block",
        json={
            "path": str(path),
            "anchorBlockId": document.blocks[0].id,
            "direction": "after",
            "type": "guide",
            "content": "",
        },
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def testKernelWebSocketExecuteAndVariables() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    with client.websocket_connect(f"/ws/kernel/{sessionId}") as websocket:
        initial = websocket.receive_json()
        assert initial == {"type": "status", "engineStatus": "ready"}

        websocket.send_json({
            "type": "execute",
            "requestId": "req-1",
            "blockId": "b1",
            "code": "value = 42\nvalue",
        })

        assert websocket.receive_json() == {"type": "status", "engineStatus": "busy"}
        messages = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message["type"] == "result":
                break

        eventMessages = [message for message in messages if message["type"] == "executionEvent"]
        result = messages[-1]
        assert result["type"] == "result"
        assert result["requestId"] == "req-1"
        assert result["blockId"] == "b1"
        assert result["status"] == "done"
        assert "42" in result["data"]
        assert result["stateDelta"]["added"] == [
            {
                "name": "value",
                "typeName": "int",
                "repr": "42",
                "size": None,
            }
        ]
        assert [message["eventType"] for message in eventMessages] == ["started", "display", "stateDelta", "finished"]
        assert eventMessages[1]["payload"] == {"outputType": "text", "data": "42"}
        assert websocket.receive_json() == {"type": "status", "engineStatus": "ready"}

        websocket.send_json({"type": "getVariables"})
        variables = websocket.receive_json()
        assert variables["type"] == "variables"
        assert any(variable["name"] == "value" for variable in variables["variables"])


def testKernelWebSocketReactiveAndReset() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    with client.websocket_connect(f"/ws/kernel/{sessionId}") as websocket:
        websocket.receive_json()
        websocket.send_json({
            "type": "executeReactive",
            "requestId": "req-reactive",
            "blockId": "b1",
            "blocks": [
                {"id": "b1", "type": "code", "content": "x = 1"},
                {"id": "b2", "type": "code", "content": "y = x + 2"},
            ],
        })

        assert websocket.receive_json() == {"type": "status", "engineStatus": "busy"}
        messages = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message["type"] == "reactiveComplete":
                break

        resultMessages = [message for message in messages if message["type"] == "result"]
        eventMessages = [message for message in messages if message["type"] == "executionEvent"]
        first = resultMessages[0]
        second = resultMessages[1]
        assert first["blockId"] == "b1"
        assert first["stateDelta"]["added"] == [
            {
                "name": "x",
                "typeName": "int",
                "repr": "1",
                "size": None,
            }
        ]
        assert second["blockId"] == "b2"
        assert second["stateDelta"]["added"] == [
            {
                "name": "y",
                "typeName": "int",
                "repr": "3",
                "size": None,
            }
        ]
        assert {(message["blockId"], message["eventType"]) for message in eventMessages} >= {
            ("b1", "started"),
            ("b1", "stateDelta"),
            ("b1", "finished"),
            ("b2", "started"),
            ("b2", "stateDelta"),
            ("b2", "finished"),
        }
        complete = messages[-1]
        assert complete == {
            "type": "reactiveComplete",
            "requestId": "req-reactive",
            "executionOrder": ["b1", "b2"],
        }
        assert websocket.receive_json() == {"type": "status", "engineStatus": "ready"}

        websocket.send_json({"type": "reset"})
        assert websocket.receive_json() == {"type": "status", "engineStatus": "ready"}


def testKernelWebSocketRejectsInvalidPayload() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    with client.websocket_connect(f"/ws/kernel/{sessionId}") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "execute", "requestId": "bad"})

        error = websocket.receive_json()
        assert error["type"] == "error"
        assert error["requestId"] == "bad"


def testKernelWebSocketRejectsUnknownMessageType() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    with client.websocket_connect(f"/ws/kernel/{sessionId}") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "mystery"})

        error = websocket.receive_json()
        assert error["type"] == "error"
        assert "Unsupported websocket message type" in error["message"]
