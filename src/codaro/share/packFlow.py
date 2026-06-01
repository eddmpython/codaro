from __future__ import annotations

from pathlib import Path

from .automationTask import createSharePackAutomationTask
from .packService import PackService


class SharePackFlowError(Exception):
    def __init__(self, statusCode: int, code: str, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.code = code
        self.message = message


class SharePackFlow:
    def __init__(
        self,
        *,
        workspaceRoot: Path,
        service: PackService | None = None,
    ) -> None:
        self.workspaceRoot = workspaceRoot
        self.service = service or PackService(workspaceRoot=workspaceRoot)

    def statusPayload(self) -> dict[str, object]:
        return {
            "enabled": True,
            "devOnlySurface": True,
            "storageRoot": str(self.service.storageRoot),
            "workspaceRoot": str(self.workspaceRoot),
        }

    def listPayload(self) -> dict[str, object]:
        records = [record.payload() for record in self.service.listInstalled()]
        return {"packs": records, "total": len(records)}

    def inspectPayload(self, source: str) -> dict[str, object]:
        try:
            return self.service.inspect(source).payload()
        except (FileNotFoundError, ValueError, RuntimeError) as error:
            raise SharePackFlowError(400, "share_pack_inspect_failed", str(error)) from error

    def installPayload(self, source: str) -> dict[str, object]:
        try:
            record = self.service.install(source)
        except (FileNotFoundError, ValueError, RuntimeError) as error:
            raise SharePackFlowError(400, "share_pack_install_failed", str(error)) from error
        return {"pack": record.payload()}

    def uninstallPayload(self, packId: str, version: str | None = None) -> dict[str, object]:
        try:
            removed = self.service.uninstall(packId, version)
        except ValueError as error:
            raise SharePackFlowError(400, "share_pack_uninstall_failed", str(error)) from error
        if not removed:
            raise SharePackFlowError(404, "share_pack_not_found", "Pack not found.")
        return {"ok": True}

    def exportPayload(self, sourceDir: str, outputPath: str) -> dict[str, object]:
        try:
            exportedPath = self.service.exportArchive(Path(sourceDir), Path(outputPath))
        except (FileNotFoundError, ValueError, OSError) as error:
            raise SharePackFlowError(400, "share_pack_export_failed", str(error)) from error
        return {"outputPath": str(exportedPath)}

    def curriculumPayload(
        self,
        packId: str,
        contentPath: str,
        version: str | None = None,
    ) -> dict[str, object]:
        try:
            return self.service.loadCurriculumDocument(packId, contentPath, version)
        except (FileNotFoundError, ValueError) as error:
            raise SharePackFlowError(404, "share_pack_curriculum_not_found", str(error)) from error

    def automationPayload(
        self,
        packId: str,
        contentPath: str,
        version: str | None = None,
    ) -> dict[str, object]:
        try:
            return self.service.loadAutomationRecipe(packId, contentPath, version)
        except (FileNotFoundError, ValueError) as error:
            raise SharePackFlowError(404, "share_pack_automation_not_found", str(error)) from error

    def automationTaskPayload(
        self,
        *,
        packId: str,
        contentPath: str,
        name: str = "",
        description: str = "",
        schedule: str | None = None,
        version: str | None = None,
    ) -> dict[str, object]:
        try:
            task = createSharePackAutomationTask(
                contentPath=contentPath,
                schedule=schedule,
                description=description,
                name=name,
                packId=packId,
                service=self.service,
                version=version,
            )
        except (FileNotFoundError, TypeError, ValueError) as error:
            raise SharePackFlowError(400, "share_pack_task_create_failed", str(error)) from error
        return {"task": task}
