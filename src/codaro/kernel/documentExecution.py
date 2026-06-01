from __future__ import annotations

from typing import Any

from ..document.blockOperations import getDocumentCodeBlock
from ..document.models import BlockConfig, CodaroDocument
from .executionPayload import KernelExecutionPayload, KernelReactivePayload, executeKernelBlock, executeKernelReactive
from .session import KernelSession


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
