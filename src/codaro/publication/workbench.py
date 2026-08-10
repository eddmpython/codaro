from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import RLock, Thread
import time
from typing import Any, Callable, Literal
from uuid import uuid4

from ..document.models import CodaroDocument
from ..proof.archive import ProofArchive
from .adapters import (
    FolderDeploymentAdapter,
    SelfHostDeploymentAdapter,
    ZipDeploymentAdapter,
    deployPublication,
)
from .embedBuilder import (
    buildBlockEmbed,
    rollbackBlockEmbed,
    startBlockEmbedServer,
    verifyBlockEmbed,
)
from .localBuilder import (
    buildLocalPublication,
    rollbackLocalPublication,
    verifyLocalPublication,
)
from .serverBuilder import (
    buildServerPublication,
    rollbackServerPublication,
    verifyServerPublication,
)
from .staticBuilder import (
    buildStaticPublication,
    rollbackPublication,
    startPublicationServer,
    verifyPublication,
)


PublicationTarget = Literal["browser", "server", "local", "embed"]
DeploymentTarget = Literal["folder", "zip", "self-host"]


@dataclass(slots=True)
class PublicationJob:
    id: str
    action: str
    status: Literal["running", "completed", "failed"]
    createdAt: str
    completedAt: str | None = None
    result: dict[str, Any] = field(default_factory=dict)
    error: dict[str, Any] | None = None

    def payload(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class _ActiveServer:
    serverId: str
    target: PublicationTarget
    url: str
    stop: Callable[[], None]


class PublicationWorkbench:
    """Owns publication actions launched from the product UI.

    Builders remain the semantic owners. This class only gives their immutable
    results a bounded job and local server lifecycle for GUI and API callers.
    """

    def __init__(self, *, proofArchive: ProofArchive) -> None:
        self._proofArchive = proofArchive
        self._jobs: dict[str, PublicationJob] = {}
        self._servers: dict[str, _ActiveServer] = {}
        self._jobThreads: dict[str, Thread] = {}
        self._lock = RLock()

    def build(
        self,
        *,
        sourcePath: Path,
        outputPath: Path,
        target: PublicationTarget,
        entryBlockId: str | None = None,
        packageLock: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            if target == "embed":
                if not entryBlockId:
                    raise ValueError("embed build에는 entry block id가 필요합니다.")
                built = buildBlockEmbed(
                    sourcePath,
                    outputPath,
                    entryBlockId=entryBlockId,
                    packageLock=packageLock,
                    proofArchive=self._proofArchive,
                )
                return {
                    "target": target,
                    "outputPath": built.outputRoot.as_posix(),
                    "bundleHash": built.embedHash,
                    "bundleRoot": built.embedRoot.as_posix(),
                    "receiptId": built.manifest["manifestHash"],
                    "sourceRevisionHash": built.publication.manifest["sourceRevisionHash"],
                    "verificationStatus": built.manifest["proof"]["verificationStatus"],
                    "reused": built.reused,
                }
            if target == "server":
                built = buildServerPublication(
                    sourcePath,
                    outputPath,
                    packageLock=packageLock,
                    proofArchive=self._proofArchive,
                )
                return {
                    "target": target,
                    "outputPath": built.outputRoot.as_posix(),
                    "bundleHash": built.bundleHash,
                    "bundleRoot": built.bundleRoot.as_posix(),
                    "receiptId": built.manifest["manifestHash"],
                    "sourceRevisionHash": built.manifest["sourceRevisionHash"],
                    "verificationStatus": built.manifest["proof"]["verificationStatus"],
                    "reused": built.reused,
                }
            if target == "local":
                built = buildLocalPublication(
                    sourcePath,
                    outputPath,
                    packageLock=packageLock,
                    proofArchive=self._proofArchive,
                )
                runtime = built.manifest["runtime"]
                return {
                    "target": target,
                    "outputPath": built.outputRoot.as_posix(),
                    "bundleHash": built.bundleHash,
                    "bundleRoot": built.bundleRoot.as_posix(),
                    "receiptId": built.manifest["manifestHash"],
                    "policyHash": runtime["policyHash"],  # type: ignore[index]
                    "permissionScopes": runtime["permissionScopes"],  # type: ignore[index]
                    "sourceRevisionHash": built.manifest["sourceRevisionHash"],
                    "verificationStatus": built.manifest["proof"]["verificationStatus"],
                    "reused": built.reused,
                }
            built = buildStaticPublication(
                sourcePath,
                outputPath,
                packageLock=packageLock,
                proofArchive=self._proofArchive,
            )
            return {
                "target": target,
                "outputPath": built.outputRoot.as_posix(),
                "bundleHash": built.bundleHash,
                "bundleRoot": built.bundleRoot.as_posix(),
                "receiptId": built.manifest["manifestHash"],
                "sourceRevisionHash": built.manifest["sourceRevisionHash"],
                "verificationStatus": built.manifest["proof"]["verificationStatus"],
                "reused": built.reused,
            }

        return self._startJob("build", operation)

    def verify(self, *, outputPath: Path, target: PublicationTarget) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            if target == "embed":
                verified = verifyBlockEmbed(outputPath)
                return {
                    "target": target,
                    "bundleHash": verified.embedHash,
                    "bundleRoot": verified.embedRoot.as_posix(),
                    "receiptId": verified.manifest["manifestHash"],
                    "verificationStatus": verified.manifest["proof"]["verificationStatus"],
                }
            if target == "server":
                verified = verifyServerPublication(outputPath)
                return {
                    "target": target,
                    "bundleHash": verified.bundleHash,
                    "bundleRoot": verified.bundleRoot.as_posix(),
                    "receiptId": verified.manifest["manifestHash"],
                    "verificationStatus": verified.manifest["proof"]["verificationStatus"],
                }
            if target == "local":
                verified = verifyLocalPublication(outputPath)
                return {
                    "target": target,
                    "bundleHash": verified.bundleHash,
                    "bundleRoot": verified.bundleRoot.as_posix(),
                    "receiptId": verified.manifest["manifestHash"],
                    "policyHash": verified.manifest["runtime"]["policyHash"],  # type: ignore[index]
                    "verificationStatus": verified.manifest["proof"]["verificationStatus"],
                }
            verified = verifyPublication(outputPath)
            return {
                "target": target,
                "bundleHash": verified.bundleHash,
                "bundleRoot": verified.bundleRoot.as_posix(),
                "receiptId": verified.manifest["manifestHash"],
                "verificationStatus": verified.manifest["proof"]["verificationStatus"],
            }

        return self._startJob("verify", operation)

    def serve(
        self,
        *,
        outputPath: Path,
        target: PublicationTarget,
        approvedPolicyHash: str | None = None,
    ) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            serverId = str(uuid4())
            if target == "server":
                active = self._startPublishedServer(serverId, outputPath)
            elif target == "local":
                if not approvedPolicyHash:
                    raise ValueError("local publication 실행에는 policy hash 승인이 필요합니다.")
                active = self._startPublishedLocal(serverId, outputPath, approvedPolicyHash)
            else:
                server, url = (
                    startBlockEmbedServer(outputPath, port=0)
                    if target == "embed"
                    else startPublicationServer(outputPath, port=0)
                )
                thread = Thread(target=server.serve_forever, name=f"codaro-publication-{serverId}", daemon=True)
                thread.start()
                active = _ActiveServer(
                    serverId=serverId,
                    target=target,
                    url=url,
                    stop=lambda: _stopHttpServer(server, thread),
                )
            with self._lock:
                self._servers[serverId] = active
            return {
                "target": target,
                "serverId": serverId,
                "url": active.url,
                "receiptId": serverId,
            }

        return self._startJob("serve", operation)

    def stop(self, serverId: str) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            with self._lock:
                active = self._servers.pop(serverId, None)
            if active is None:
                raise ValueError("실행 중인 publication server를 찾을 수 없습니다.")
            active.stop()
            return {"serverId": serverId, "stopped": True, "receiptId": serverId}

        return self._startJob("stop", operation)

    def deploy(
        self,
        *,
        publicationPath: Path,
        outputPath: Path,
        target: DeploymentTarget,
    ) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            adapter = (
                ZipDeploymentAdapter(outputPath)
                if target == "zip"
                else SelfHostDeploymentAdapter(outputPath)
                if target == "self-host"
                else FolderDeploymentAdapter(outputPath)
            )
            outcome = deployPublication(publicationPath, adapter, proofArchive=self._proofArchive)
            return {
                "target": target,
                "versionId": outcome.versionId,
                "previousVersionId": outcome.previousVersionId,
                "artifactPath": outcome.artifactPath.as_posix(),
                "artifactHash": outcome.artifactHash,
                "receiptId": outcome.deploymentReceipt.receiptId,
                "verificationStatus": outcome.verificationStatus,
            }

        return self._startJob("deploy", operation)

    def rollback(
        self,
        *,
        outputPath: Path,
        target: Literal["browser", "server", "local", "embed", "folder", "zip", "self-host"],
        versionId: str,
    ) -> dict[str, Any]:
        def operation() -> dict[str, Any]:
            if target == "server":
                verified = rollbackServerPublication(outputPath, versionId)
                return {
                    "target": target,
                    "versionId": verified.bundleHash,
                    "receiptId": verified.manifest["manifestHash"],
                }
            if target == "local":
                verified = rollbackLocalPublication(outputPath, versionId)
                return {
                    "target": target,
                    "versionId": verified.bundleHash,
                    "receiptId": verified.manifest["manifestHash"],
                }
            if target == "browser":
                verified = rollbackPublication(outputPath, versionId)
                return {
                    "target": target,
                    "versionId": verified.bundleHash,
                    "receiptId": verified.manifest["manifestHash"],
                }
            if target == "embed":
                verified = rollbackBlockEmbed(outputPath, versionId)
                return {
                    "target": target,
                    "versionId": verified.embedHash,
                    "receiptId": verified.manifest["manifestHash"],
                }
            adapter = (
                ZipDeploymentAdapter(outputPath)
                if target == "zip"
                else SelfHostDeploymentAdapter(outputPath)
                if target == "self-host"
                else FolderDeploymentAdapter(outputPath)
            )
            probe = adapter.rollback(versionId)
            return {
                "target": target,
                "versionId": probe.versionId,
                "artifactHash": probe.artifactHash,
                "receiptId": probe.versionId,
            }

        return self._startJob("rollback", operation)

    def job(self, jobId: str) -> dict[str, Any] | None:
        with self._lock:
            job = self._jobs.get(jobId)
            return job.payload() if job is not None else None

    def close(self) -> None:
        with self._lock:
            jobThreads = list(self._jobThreads.values())
        for thread in jobThreads:
            thread.join(timeout=30)
        with self._lock:
            servers = list(self._servers.values())
            self._servers.clear()
        for active in servers:
            active.stop()

    def _startJob(self, action: str, operation: Callable[[], dict[str, Any]]) -> dict[str, Any]:
        job = PublicationJob(
            id=str(uuid4()),
            action=action,
            status="running",
            createdAt=_now(),
        )
        with self._lock:
            self._jobs[job.id] = job
            if len(self._jobs) > 100:
                oldest = next(iter(self._jobs))
                if oldest != job.id:
                    self._jobs.pop(oldest, None)
        thread = Thread(
            target=self._completeJob,
            args=(job, operation),
            name=f"codaro-publication-job-{job.id}",
            daemon=True,
        )
        with self._lock:
            self._jobThreads[job.id] = thread
        thread.start()
        return job.payload()

    def _completeJob(self, job: PublicationJob, operation: Callable[[], dict[str, Any]]) -> None:
        try:
            result = operation()
            with self._lock:
                job.result = result
                job.status = "completed"
        except Exception as exc:  # noqa: BLE001 - every background job must reach a terminal state
            diagnostics = getattr(exc, "diagnostics", [])
            with self._lock:
                job.status = "failed"
                job.error = {
                    "code": "publication_action_failed",
                    "message": str(exc),
                    "diagnostics": diagnostics if isinstance(diagnostics, list) else [],
                }
        finally:
            with self._lock:
                job.completedAt = _now()
                self._jobThreads.pop(job.id, None)

    def _startPublishedServer(self, serverId: str, outputPath: Path) -> _ActiveServer:
        import uvicorn

        from ..server import createPublishedServerApp, createServerEventLoop, resolveBindablePort

        port = resolveBindablePort("127.0.0.1", 8766)
        app = createPublishedServerApp(outputPath)
        config = uvicorn.Config(
            app,
            host="127.0.0.1",
            port=port,
            log_level="warning",
            loop=createServerEventLoop,
        )
        server = uvicorn.Server(config)
        thread = Thread(target=server.run, name=f"codaro-publication-{serverId}", daemon=True)
        thread.start()
        deadline = time.monotonic() + 10
        while not server.started and thread.is_alive() and time.monotonic() < deadline:
            time.sleep(0.02)
        if not server.started:
            server.should_exit = True
            thread.join(timeout=5)
            raise RuntimeError("server publication이 시작 시간 안에 준비되지 않았습니다.")
        return _ActiveServer(
            serverId=serverId,
            target="server",
            url=f"http://127.0.0.1:{port}/app",
            stop=lambda: _stopUvicornServer(server, thread),
        )

    def _startPublishedLocal(
        self,
        serverId: str,
        outputPath: Path,
        approvedPolicyHash: str,
    ) -> _ActiveServer:
        import uvicorn

        from ..server import createPublishedLocalApp, createServerEventLoop, resolveBindablePort

        port = resolveBindablePort("127.0.0.1", 8766)
        app = createPublishedLocalApp(outputPath, approvedPolicyHash=approvedPolicyHash)
        config = uvicorn.Config(
            app,
            host="127.0.0.1",
            port=port,
            log_level="warning",
            loop=createServerEventLoop,
        )
        server = uvicorn.Server(config)
        thread = Thread(target=server.run, name=f"codaro-publication-{serverId}", daemon=True)
        thread.start()
        deadline = time.monotonic() + 10
        while not server.started and thread.is_alive() and time.monotonic() < deadline:
            time.sleep(0.02)
        if not server.started:
            server.should_exit = True
            thread.join(timeout=5)
            raise RuntimeError("local publication이 시작 시간 안에 준비되지 않았습니다.")
        return _ActiveServer(
            serverId=serverId,
            target="local",
            url=f"http://127.0.0.1:{port}/app",
            stop=lambda: _stopUvicornServer(server, thread),
        )


def _now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def _stopHttpServer(server: ThreadingHTTPServer, thread: Thread) -> None:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)


def _stopUvicornServer(server: Any, thread: Thread) -> None:
    server.should_exit = True
    thread.join(timeout=10)
    if thread.is_alive():
        server.force_exit = True
        thread.join(timeout=5)
