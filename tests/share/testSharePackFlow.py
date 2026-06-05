from __future__ import annotations

from pathlib import Path

import pytest

from codaro.share.packFlow import SharePackFlow, SharePackFlowError


class PayloadObject:
    def __init__(self, payload: dict[str, object]) -> None:
        self._payload = payload

    def payload(self) -> dict[str, object]:
        return self._payload


class FakePackService:
    def __init__(self) -> None:
        self.storageRoot = Path("packs").resolve()
        self.installed = [PayloadObject({"id": "demo", "version": "1.0.0"})]
        self.uninstallResult = True

    def listInstalled(self) -> list[PayloadObject]:
        return list(self.installed)

    def inspect(self, source: str) -> PayloadObject:
        if source == "missing":
            raise FileNotFoundError(source)
        return PayloadObject({"source": source, "installable": True})

    def install(self, source: str) -> PayloadObject:
        if source == "bad":
            raise ValueError("bad pack")
        return PayloadObject({"id": "demo", "version": "1.0.0", "source": source})

    def uninstall(self, packId: str, version: str | None = None) -> bool:
        del packId, version
        return self.uninstallResult

    def exportArchive(self, sourceDir: Path, outputPath: Path) -> Path:
        del sourceDir
        return outputPath

    def loadCurriculumDocument(
        self,
        packId: str,
        contentPath: str,
        version: str | None = None,
    ) -> dict[str, object]:
        return {"packId": packId, "contentPath": contentPath, "version": version}

    def loadAutomationRecipe(
        self,
        packId: str,
        contentPath: str,
        version: str | None = None,
    ) -> dict[str, object]:
        return {"packId": packId, "contentPath": contentPath, "version": version}


def testSharePackFlowBuildsPackPayloads(tmp_path: Path) -> None:
    service = FakePackService()
    flow = SharePackFlow(workspaceRoot=tmp_path, service=service)

    assert flow.statusPayload() == {
        "enabled": True,
        "devOnlySurface": True,
        "storageRoot": str(service.storageRoot),
        "workspaceRoot": str(tmp_path),
    }
    assert flow.listPayload() == {
        "packs": [{"id": "demo", "version": "1.0.0"}],
        "total": 1,
    }
    assert flow.inspectPayload("pack.zip") == {"source": "pack.zip", "installable": True}
    assert flow.installPayload("pack.zip") == {
        "pack": {"id": "demo", "version": "1.0.0", "source": "pack.zip"},
    }
    assert flow.uninstallPayload("demo") == {"ok": True}
    assert flow.exportPayload("source", "out.zip") == {"outputPath": "out.zip"}
    assert flow.curriculumPayload("demo", "lesson.yaml") == {
        "packId": "demo",
        "contentPath": "lesson.yaml",
        "version": None,
    }
    assert flow.automationPayload("demo", "recipe.py", "1.0.0") == {
        "packId": "demo",
        "contentPath": "recipe.py",
        "version": "1.0.0",
    }


def testSharePackFlowMapsServiceErrors(tmp_path: Path) -> None:
    service = FakePackService()
    flow = SharePackFlow(workspaceRoot=tmp_path, service=service)

    with pytest.raises(SharePackFlowError) as inspectInfo:
        flow.inspectPayload("missing")
    with pytest.raises(SharePackFlowError) as installInfo:
        flow.installPayload("bad")

    service.uninstallResult = False
    with pytest.raises(SharePackFlowError) as uninstallInfo:
        flow.uninstallPayload("missing")

    assert inspectInfo.value.code == "share_pack_inspect_failed"
    assert installInfo.value.code == "share_pack_install_failed"
    assert uninstallInfo.value.statusCode == 404


def testSharePackFlowCreatesAutomationTask(monkeypatch, tmp_path: Path) -> None:
    captured: dict[str, object] = {}

    def fakeCreateSharePackAutomationTask(**kwargs):
        captured.update(kwargs)
        return {"id": "task-1", "name": kwargs["name"]}

    monkeypatch.setattr(
        "codaro.share.packFlow.createSharePackAutomationTask",
        fakeCreateSharePackAutomationTask,
    )
    service = FakePackService()
    flow = SharePackFlow(workspaceRoot=tmp_path, service=service)

    payload = flow.automationTaskPayload(
        packId="demo",
        contentPath="recipe.py",
        name="Run demo",
        description="Demo task",
        schedule="@daily",
        version="1.0.0",
    )

    assert payload == {"task": {"id": "task-1", "name": "Run demo"}}
    assert captured == {
        "contentPath": "recipe.py",
        "schedule": "@daily",
        "description": "Demo task",
        "name": "Run demo",
        "packId": "demo",
        "service": service,
        "version": "1.0.0",
    }
