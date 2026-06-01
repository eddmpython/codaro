from __future__ import annotations

from ..document.models import BlockConfig
from .executionPayload import KernelExecutionPayload, executeKernelBlock
from .session import KernelSession


async def executeDocumentCodeBlock(session: KernelSession, block: BlockConfig) -> KernelExecutionPayload:
    return await executeKernelBlock(session, block.content, blockId=block.id)
