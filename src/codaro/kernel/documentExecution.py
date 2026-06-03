from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from ..document.blockOperations import getDocumentCodeBlock
from ..document.models import BlockConfig, CodaroDocument
from .executionPayload import KernelExecutionPayload, KernelReactivePayload, executeKernelBlock, executeKernelReactive
from .manager import SessionManager
from .protocol import VariableInfo
from .session import KernelSession


@dataclass(frozen=True, slots=True)
class CaptureResult:
    """문서를 실행해 포착한 구조화된 실행 사실 — 도메인-무관.

    authoring(강한 체크 제안) · automation(리포트 산출물) · diagnostics(증거 차원)이
    공유하는 engine 층 산출물. 의미 부여는 각 도메인이, 사실 포착은 여기서.
    """
    stdout: str
    stderr: str
    status: str  # "ok" | "error"
    variables: list[VariableInfo] = field(default_factory=list)
    error: str = ""
    failedBlockId: str = ""


async def captureDocument(
    document: CodaroDocument,
    *,
    manager: SessionManager,
    onBlock: Callable[[BlockConfig], None] | None = None,
) -> CaptureResult:
    """문서의 코드 블록을 순서대로 실행해 stdout/stderr/variables/상태를 포착한다.

    `onBlock` 훅으로 도메인별 가드(예: automation eStop)를 주입한다 — engine은
    그 가드의 의미를 모른 채 블록 전마다 호출만 한다(도메인 결합 회피).
    사용자 코드 오류는 예외로 던지지 않고 status="error"로 보고한다(사실 포착).
    """
    session = manager.createSession()
    stdoutParts: list[str] = []
    stderrParts: list[str] = []
    status = "ok"
    error = ""
    failedBlockId = ""
    try:
        for block in document.blocks:
            if block.type != "code" or not block.content.strip():
                continue
            if onBlock is not None:
                onBlock(block)
            result = await session.execute(block.content, blockId=block.id)
            if result.stdout:
                stdoutParts.append(result.stdout)
            if result.stderr:
                stderrParts.append(result.stderr)
            if result.status == "error":
                status = "error"
                failedBlockId = block.id
                error = result.stderr or str(result.data or "")
                break
        variables = session.getVariables()
    finally:
        manager.destroySession(session.sessionId)

    return CaptureResult(
        stdout="\n".join(stdoutParts),
        stderr="\n".join(stderrParts),
        status=status,
        variables=list(variables),
        error=error,
        failedBlockId=failedBlockId,
    )


async def executeDocumentCodeBlock(session: KernelSession, block: BlockConfig) -> KernelExecutionPayload:
    return await executeKernelBlock(session, block.content, blockId=block.id)


def documentBlocksForReactiveExecution(document: CodaroDocument) -> list[dict[str, Any]]:
    return [
        {
            "id": block.id,
            "type": block.type,
            "content": block.content,
        }
        for block in document.blocks
    ]


async def executeDocumentReactiveBlock(
    session: KernelSession,
    document: CodaroDocument,
    *,
    blockId: str,
) -> KernelReactivePayload:
    getDocumentCodeBlock(document, blockId=blockId)
    return await executeKernelReactive(session, documentBlocksForReactiveExecution(document), blockId)
