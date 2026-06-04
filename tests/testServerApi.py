from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError

from codaro.api.spaRouter import createSpaRouter

import codaro.api.aiRouter as aiRouterModule
import codaro.ai.chatFlow as chatFlowModule
import codaro.ai.profileFlow as profileFlowModule
from codaro.api.kernelWebSocket import firstKernelWsValidationMessage, validateKernelWsMessage
from codaro.ai.conversation import ConversationManager
from codaro.ai.oauthToken import TokenRefreshError
from codaro.ai.profile import AiProfileManager
from codaro.ai.providerSpec import oauthSecretName
from codaro.ai.providers import oauthChatgptProvider as oauthProviderModule
from codaro.ai.secrets import SecretStore
import codaro.server as serverModule
import codaro.system.localDiagnostics as localDiagnosticsModule
from codaro.document import createEmptyDocument
from codaro.kernel.protocol import WsExecuteMessage
from codaro.runtime import LocalEngine
from codaro.server import createServerApp
from codaro.system import packageOps


def oauthChatProfile(tmp_path: Path) -> AiProfileManager:
    secretStore = SecretStore(path=tmp_path / "secrets.json")
    profileManager = AiProfileManager(path=tmp_path / "ai_profile.json", secretStore=secretStore)
    profileManager.update(provider="oauth-chatgpt", updatedBy="test")
    secretStore.setJson(
        oauthSecretName("oauth-chatgpt"),
        {
            "access_token": "expired-access-test",
            "refresh_token": "expired-refresh-test",
            "expires_at": 0,
        },
    )
    return profileManager


def sseJsonEvents(text: str) -> list[dict]:
    events: list[dict] = []
    for frame in text.strip().split("\n\n"):
        dataLines = [line[6:] for line in frame.splitlines() if line.startswith("data: ")]
        if dataLines:
            events.append(json.loads("\n".join(dataLines)))
    return events


def testLoadMissingDocument(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    path = tmp_path / "newDocument.py"

    response = client.post("/api/document/load", json={"path": str(path)})

    assert response.status_code == 200
    payload = response.json()
    assert payload["exists"] is False
    assert payload["document"]["title"] == "newDocument"


def testSaveDocument(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
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
            "shape": "",
            "dtype": "",
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


def testKernelRemoveCellEndpointClearsDefinitions() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    client.post(f"/api/kernel/{sessionId}/execute", json={"code": "x = 10", "blockId": "a"})
    removeResponse = client.post(f"/api/kernel/{sessionId}/remove-cell", json={"code": "", "blockId": "a"})
    assert removeResponse.status_code == 200
    assert removeResponse.json() == {"status": "removed"}

    # 삭제 후 x를 참조하면 NameError(zombie 없음).
    result = client.post(f"/api/kernel/{sessionId}/execute", json={"code": "x + 1", "blockId": "b"})
    assert result.json()["status"] == "error"
    assert "NameError" in f"{result.json()['data']} {result.json()['stderr']}"

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


def testPackagesInstallSkipsStandardLibraryModule() -> None:
    client = TestClient(createServerApp())

    response = client.post("/api/packages/install", json={"name": "io"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["package"] == "io"
    assert payload["success"] is True
    assert payload["skipped"] is True
    assert "standard library" in payload["message"]


def testPackageInstallCommandDropsStandardLibraryModules() -> None:
    client = TestClient(createServerApp())

    response = client.post("/api/packages/install-command", json={"names": ["io", "pandas", "zipfile"]})

    assert response.status_code == 200
    payload = response.json()
    assert payload["packages"] == ["pandas"]
    assert "pandas" in payload["command"]


def testSystemDiagnosticsEndpointSeparatesFailuresAndRedactsSecrets(monkeypatch, tmp_path: Path) -> None:
    class _ProfileManager:
        def serialize(self):
            return {
                "ready": False,
                "activeProvider": "custom",
                "defaultProvider": "custom",
                "providers": {"custom": {"baseUrl": None, "secretConfigured": False}},
                "catalog": [{"id": "custom", "authKind": "api_key"}],
            }

    monkeypatch.setenv("OPENAI_API_KEY", "sk-diagnosticenv123456")
    monkeypatch.setattr(localDiagnosticsModule, "getProfileManager", lambda: _ProfileManager())
    monkeypatch.setattr(localDiagnosticsModule.shutil, "which", lambda name: None if name == "uv" else "tool")

    def missingProjectPython():
        raise packageOps.PackageEnvironmentError(
            "package_environment_missing",
            "Project .venv missing with sk-diagnosticenv123456",
        )

    monkeypatch.setattr(localDiagnosticsModule.packageOps, "getProjectPythonPath", missingProjectPython)
    monkeypatch.setattr(serverModule, "WEB_BUILD_ROOT", tmp_path / "missing-web-build")
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.get("/api/system/diagnostics")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "needs-action"
    assert payload["categories"] == {"provider": 1, "runtime": 0, "package": 2, "frontend": 1}
    assert payload["nextActions"] == ["configure-base-url", "install-uv", "create-project-venv", "build-editor"]
    assert payload["readableActions"] == ["Base URL 입력", "uv 설치", ".venv 준비", "Editor 빌드"]
    assert "Provider 1, 패키지 2, Frontend 1" in payload["summaryText"]
    assert "다음: Base URL 입력, uv 설치, .venv 준비" in payload["summaryText"]
    encoded = json.dumps(payload, ensure_ascii=False)
    assert "sk-diagnosticenv123456" not in encoded
    assert any(item["code"] == "editor-build-missing" for item in payload["items"])
    assert any(item["code"] == "uv-missing" for item in payload["items"])


def testSystemDiagnosticsExportEndpointProvidesShareableRedactedPayload(monkeypatch, tmp_path: Path) -> None:
    class _ProfileManager:
        def serialize(self):
            return {
                "ready": False,
                "activeProvider": "openai",
                "defaultProvider": "openai",
                "providers": {
                    "openai": {
                        "secretConfigured": False,
                        "apiKey": "sk-exportdirect123456",
                        "authorization": "Bearer abc.def.ghi",
                    }
                },
                "catalog": [{"id": "openai", "authKind": "api_key"}],
            }

    monkeypatch.setenv("OPENAI_API_KEY", "sk-exportenv123456")
    monkeypatch.setattr(localDiagnosticsModule, "getProfileManager", lambda: _ProfileManager())
    monkeypatch.setattr(localDiagnosticsModule.shutil, "which", lambda name: None if name == "uv" else "tool")

    def missingProjectPython():
        raise packageOps.PackageEnvironmentError(
            "package_environment_missing",
            "Project .venv missing with sk-exportenv123456",
        )

    monkeypatch.setattr(localDiagnosticsModule.packageOps, "getProjectPythonPath", missingProjectPython)
    monkeypatch.setattr(serverModule, "WEB_BUILD_ROOT", tmp_path / "missing-web-build")
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.get("/api/system/diagnostics/export")

    assert response.status_code == 200
    payload = response.json()
    assert payload["kind"] == "codaro-local-diagnostic-export"
    assert payload["status"] == "needs-action"
    assert payload["summary"]["summaryText"] == payload["summaryText"]
    assert payload["readableActions"] == ["API 키 입력", "uv 설치", ".venv 준비", "Editor 빌드"]
    assert payload["context"]["provider"] == {
        "activeProvider": "openai",
        "ready": False,
        "authKind": "api_key",
        "secretConfigured": False,
    }
    assert payload["context"]["package"]["installer"] == "uv"
    assert payload["context"]["package"]["uvExecutableFound"] is False
    assert payload["context"]["package"]["projectEnvironmentReady"] is False
    assert payload["context"]["frontend"]["indexHtmlFound"] is False
    encoded = json.dumps(payload, ensure_ascii=False)
    assert "sk-exportenv123456" not in encoded
    assert "sk-exportdirect123456" not in encoded
    assert "abc.def.ghi" not in encoded


def testProviderValidateUsesProviderValidationDomain(monkeypatch) -> None:
    captured: dict[str, object] = {}

    class _ValidationResult:
        def payload(self):
            return {"valid": True, "model": "demo-model"}

    def fakeValidateProviderConnection(**kwargs):
        captured.update(kwargs)
        return _ValidationResult()

    monkeypatch.setattr(profileFlowModule, "validateProviderConnection", fakeValidateProviderConnection)
    client = TestClient(createServerApp())

    response = client.post("/api/ai/provider/validate?provider=custom&model=demo-model")

    assert response.status_code == 200
    assert response.json() == {"valid": True, "model": "demo-model"}
    assert captured["provider"] == "custom"
    assert captured["model"] == "demo-model"
    assert captured["probe"] == "availability"
    assert captured["profileManager"] is not None


def testProviderValidatePassesResponseProbe(monkeypatch) -> None:
    captured: dict[str, object] = {}

    class _ValidationResult:
        def payload(self):
            return {"valid": True, "model": "demo-model"}

    def fakeValidateProviderConnection(**kwargs):
        captured.update(kwargs)
        return _ValidationResult()

    monkeypatch.setattr(profileFlowModule, "validateProviderConnection", fakeValidateProviderConnection)
    client = TestClient(createServerApp())

    response = client.post("/api/ai/provider/validate?provider=custom&probe=response")

    assert response.status_code == 200
    assert captured["provider"] == "custom"
    assert captured["probe"] == "response"


def testAiChatReportsOauthRefreshExpiredAsReloginDiagnostic(monkeypatch, tmp_path: Path) -> None:
    profileManager = oauthChatProfile(tmp_path)
    conversationManager = ConversationManager()

    def failValidToken():
        raise TokenRefreshError("expired", "refresh_token expired. Re-login required.")

    monkeypatch.setattr(chatFlowModule, "getProfileManager", lambda: profileManager)
    monkeypatch.setattr(aiRouterModule, "getConversationManager", lambda: conversationManager)
    monkeypatch.setattr(oauthProviderModule.oauthToken, "getValidToken", failValidToken)
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.post(
        "/api/ai/chat",
        json={"message": "현재 provider 상태를 한 문장으로 확인해줘", "role": "teacher"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "oauth-chatgpt"
    assert payload["model"] == "gpt-5.4"
    assert payload["answer"] == "로그인 세션이 만료되었습니다. Provider 설정에서 다시 로그인하세요."
    assert "refresh_token" not in payload["answer"]
    workloop = payload["trace"]["workloop"][0]
    assert workloop["workLabel"] == "provider 오류"
    assert workloop["provider"] == "oauth-chatgpt"
    assert workloop["diagnosticCode"] == "provider_relogin_required"
    assert workloop["diagnosticAction"] == "relogin-provider"
    assert workloop["error"] == "로그인 세션이 만료되었습니다. Provider 설정에서 다시 로그인하세요."


def testAiChatStreamReportsOauthRefreshExpiredAsDiagnosticEvent(monkeypatch, tmp_path: Path) -> None:
    profileManager = oauthChatProfile(tmp_path)
    conversationManager = ConversationManager()

    def failValidToken():
        raise TokenRefreshError("expired", "refresh_token expired. Re-login required.")

    monkeypatch.setattr(chatFlowModule, "getProfileManager", lambda: profileManager)
    monkeypatch.setattr(aiRouterModule, "getConversationManager", lambda: conversationManager)
    monkeypatch.setattr(oauthProviderModule.oauthToken, "getValidToken", failValidToken)
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.post(
        "/api/ai/chat/stream",
        json={"message": "현재 provider 상태를 한 문장으로 확인해줘", "role": "teacher"},
    )

    assert response.status_code == 200
    events = sseJsonEvents(response.text)
    assert [event["type"] for event in events] == ["start", "error"]
    errorEvent = events[-1]
    assert errorEvent["error"] == "로그인 세션이 만료되었습니다. Provider 설정에서 다시 로그인하세요."
    assert errorEvent["diagnostic"]["code"] == "provider_relogin_required"
    assert errorEvent["diagnostic"]["action"] == "relogin-provider"
    assert errorEvent["diagnostic"]["provider"] == "oauth-chatgpt"
    workloop = errorEvent["trace"]["workloop"][0]
    assert workloop["provider"] == "oauth-chatgpt"
    assert workloop["diagnosticCode"] == "provider_relogin_required"
    assert workloop["diagnosticAction"] == "relogin-provider"
    assert "refresh_token" not in errorEvent["error"]


def testEnvironmentInfo() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/env/info")
    assert response.status_code == 200
    info = response.json()
    assert "pythonVersion" in info
    assert "platform" in info


def testSystemHealth() -> None:
    client = TestClient(createServerApp())

    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "python" in data
    assert "pid" in data
    assert "sessions" in data
    assert "conversations" in data
    assert "engine" in data
    assert data["sessions"]["active"] >= 0
    assert data["conversations"]["active"] >= 0


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
    (notebookDir / "demo.ipynb").write_text('{"cells":[],"metadata":{},"nbformat":4,"nbformat_minor":5}', encoding="utf-8")
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "server.py").write_text("print('notebook 아님')\n", encoding="utf-8")

    response = client.get("/api/workspace/index")

    assert response.status_code == 200
    payload = response.json()
    assert payload["workspaceRoot"] == str(tmp_path.resolve())
    assert len(payload["recentDocuments"]) == 3
    recentTypes = {entry["notebookType"] for entry in payload["recentDocuments"]}
    assert recentTypes <= {"codaro", "jupyter"}
    assert payload["totalCodaroDocuments"] == 2
    assert payload["totalCompatibleDocuments"] == 1

    topDirectory = next(node for node in payload["codaroTree"] if node["name"] == "notebooks")
    fileTypes = {child["name"]: child["notebookType"] for child in topDirectory["children"]}
    assert fileTypes["demo.codaro.py"] == "codaro"
    compatibleNames = {entry["name"] for entry in payload["compatibleDocuments"]}
    assert compatibleNames == {"demo.ipynb"}

    rootFileNames = {node["name"] for node in payload["codaroTree"] if not node["isDirectory"]}
    assert "scratch.py" in rootFileNames
    assert "server.py" not in rootFileNames


def testBootstrapIncludesWorkspaceRoot(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    response = client.get("/api/bootstrap")

    assert response.status_code == 200
    assert response.json()["workspaceRoot"] == str(tmp_path.resolve())


def testDocumentBlockOperations(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
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


def testDocumentRunBlockUsesKernelExecutionPayload(tmp_path: Path) -> None:
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
    path = tmp_path / "run_block.py"
    document = createEmptyDocument("RunBlock")
    document.blocks[0].content = "value = 3\nvalue + 4"
    client.post(
        "/api/document/save",
        json={"path": str(path), "document": document.model_dump()},
    )
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]

    response = client.post(
        "/api/document/run-block",
        json={
            "sessionId": sessionId,
            "path": str(path),
            "blockId": document.blocks[0].id,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    result = payload["result"]
    assert payload["blockId"] == document.blocks[0].id
    assert result["blockId"] == document.blocks[0].id
    assert result["status"] == "done"
    assert "7" in result["data"]
    assert [event["eventType"] for event in result["events"]] == ["started", "display", "stateDelta", "finished"]
    client.delete(f"/api/kernel/{sessionId}")


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
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
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
    client = TestClient(createServerApp(workspaceRoot=tmp_path))
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


def testKernelWebSocketMessageValidationOwnsProtocolParsing() -> None:
    parsed = validateKernelWsMessage({
        "type": "execute",
        "requestId": "req-1",
        "code": "value = 1",
    })

    assert isinstance(parsed, WsExecuteMessage)
    assert parsed.requestId == "req-1"

    with pytest.raises(ValueError, match="Unsupported websocket message type"):
        validateKernelWsMessage({"type": "mystery"})


def testKernelWebSocketValidationMessageUsesFirstError() -> None:
    with pytest.raises(ValidationError) as excInfo:
        validateKernelWsMessage({"type": "execute", "requestId": "req-1"})

    assert "Field required" in firstKernelWsValidationMessage(excInfo.value)


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
                "shape": "",
                "dtype": "",
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
                "shape": "",
                "dtype": "",
            }
        ]
        assert second["blockId"] == "b2"
        assert second["stateDelta"]["added"] == [
            {
                "name": "y",
                "typeName": "int",
                "repr": "3",
                "size": None,
                "shape": "",
                "dtype": "",
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
            "cycles": [],
            "multipleDefinitions": [],
            "crossCellMutations": [],
            "staleBlockIds": [],
            "dependents": {"b1": ["b2"]},
            "definedBy": {"x": ["b1"], "y": ["b2"]},
            "nodes": [
                {"blockId": "b1", "defines": ["x"], "uses": []},
                {"blockId": "b2", "defines": ["y"], "uses": ["x"]},
            ],
        }
        assert websocket.receive_json() == {"type": "status", "engineStatus": "ready"}

        websocket.send_json({"type": "reset"})
        assert websocket.receive_json() == {"type": "status", "engineStatus": "ready"}


def testKernelWebSocketSetUiValueRerunsDependentsOnly() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]
    widgetBlock = {
        "id": "w",
        "type": "code",
        "content": "from codaro.outputDescriptor import ui\nslider = ui.slider(0, 100)",
    }
    consumerBlock = {"id": "c", "type": "code", "content": "doubled = slider.value * 2\ndoubled"}

    def drainUntilReady(websocket) -> list[dict]:
        messages: list[dict] = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message.get("type") == "status" and message.get("engineStatus") == "ready":
                return messages

    with client.websocket_connect(f"/ws/kernel/{sessionId}") as websocket:
        websocket.receive_json()  # initial ready
        for requestId, block in (("rw", widgetBlock), ("rc", consumerBlock)):
            websocket.send_json({"type": "execute", "requestId": requestId, "blockId": block["id"], "code": block["content"]})
            consumerMessages = drainUntilReady(websocket)
        firstResult = next(m for m in consumerMessages if m["type"] == "result")
        assert "0" in str(firstResult["data"])  # slider.value=0 → doubled=0

        websocket.send_json({
            "type": "setUiValue",
            "requestId": "rs",
            "blockId": "w",
            "elementId": "w#0",
            "value": 50,
            "blocks": [widgetBlock, consumerBlock],
        })
        messages: list[dict] = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message.get("type") == "reactiveComplete":
                break
        complete = messages[-1]
        assert complete["executionOrder"] == ["c"]  # 위젯 셀 w는 재실행 제외
        results = [m for m in messages if m["type"] == "result"]
        assert any("100" in str(result["data"]) for result in results)  # 50 * 2


def testHttpSetUiValueRerunsDependentsOnly() -> None:
    client = TestClient(createServerApp())
    sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]
    widgetCode = "from codaro.outputDescriptor import ui\nslider = ui.slider(0, 100)"
    consumerCode = "doubled = slider.value * 2\ndoubled"
    client.post(f"/api/kernel/{sessionId}/execute", json={"code": widgetCode, "blockId": "w"})
    client.post(f"/api/kernel/{sessionId}/execute", json={"code": consumerCode, "blockId": "c"})

    response = client.post(
        f"/api/kernel/{sessionId}/set-ui-value",
        json={
            "blockId": "w",
            "elementId": "w#0",
            "value": 50,
            "blocks": [
                {"id": "w", "type": "code", "content": widgetCode},
                {"id": "c", "type": "code", "content": consumerCode},
            ],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["executionOrder"] == ["c"]  # 위젯 셀 w 제외
    assert any("100" in str(result["data"]) for result in body["results"])  # 50 * 2
    client.delete(f"/api/kernel/{sessionId}")


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


def spaClient(tmp_path: Path) -> TestClient:
    """Build a TestClient over the SPA router alone, against a fake web build.

    Isolated from the real editor build so the test is deterministic regardless
    of whether `editor/` has been built yet (the backend gate runs before the
    editor-build gate in CI).
    """
    buildRoot = tmp_path / "webBuild"
    (buildRoot / "_app").mkdir(parents=True)
    (buildRoot / "index.html").write_text(
        "<html><head></head><body>codaro</body></html>", encoding="utf-8"
    )
    (buildRoot / "_app" / "index-real.js").write_text("export const ok = 1;\n", encoding="utf-8")
    app = FastAPI()
    app.include_router(createSpaRouter(SimpleNamespace(webBuildRoot=buildRoot)))
    return TestClient(app)


def testSpaServesExistingAssetWithRealMime(tmp_path: Path) -> None:
    response = spaClient(tmp_path).get("/_app/index-real.js")

    assert response.status_code == 200
    assert "javascript" in response.headers["content-type"]
    assert "html" not in response.headers["content-type"]


def testSpaMissingAssetReturns404NotIndexHtml(tmp_path: Path) -> None:
    # A stale browser requesting a hashed asset that no longer exists must get a
    # clean 404 — never index.html, which the browser would reject on a MIME
    # mismatch (nosniff) and boot to a blank screen.
    response = spaClient(tmp_path).get("/_app/index-staleHash.js")

    assert response.status_code == 404
    assert "text/html" not in response.headers.get("content-type", "")


def testSpaMissingStylesheetReturns404(tmp_path: Path) -> None:
    response = spaClient(tmp_path).get("/_app/index-staleHash.css")

    assert response.status_code == 404
    assert "text/html" not in response.headers.get("content-type", "")


def testSpaClientRouteFallsBackToIndexHtml(tmp_path: Path) -> None:
    client = spaClient(tmp_path)

    root = client.get("/")
    assert root.status_code == 200
    assert "text/html" in root.headers["content-type"]

    # Extensionless paths are client routes → index.html, not 404.
    route = client.get("/curriculum")
    assert route.status_code == 200
    assert "text/html" in route.headers["content-type"]


def testHarvestCodeEndpointMaterializesTask(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
    import codaro.automation.taskRegistry as taskRegistryModule

    taskRegistryModule._registry = None
    app = createServerApp(workspaceRoot=tmp_path)
    client = TestClient(app)

    response = client.post("/api/tasks/from-code", json={"code": "x = 1\nprint(x)", "name": "Harvest Demo"})
    assert response.status_code == 200
    body = response.json()
    assert body["created"] is True
    assert (tmp_path / body["documentPath"]).exists()

    taskRegistryModule._registry = None


def testHarvestCodeGatedByUnmasteredOutcome(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
    import codaro.automation.taskRegistry as taskRegistryModule

    taskRegistryModule._registry = None
    app = createServerApp(workspaceRoot=tmp_path)
    client = TestClient(app)

    response = client.post(
        "/api/tasks/from-code",
        json={"code": "x = 1", "name": "Gated", "outcomeId": "python.never.mastered.xyz"},
    )
    assert response.status_code == 403

    taskRegistryModule._registry = None
