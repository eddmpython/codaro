from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..ai.chatFlow import (
    CHAT_FLOW_ERRORS,
    ChatFlowConversationNotFound,
    buildCodeCompletionPayload,
    chatFlowErrorPayload,
    runChatTurnPayload,
    streamChatTurnSseFrames,
)
from ..ai.conversation import (
    ConversationNotFound,
    conversationListPayload,
    createConversationPayload,
    deleteConversationPayload,
    getConversationManager,
)
from ..ai.oauthFlow import getOAuthLoginFlow
from ..ai.profileFlow import (
    ProfileFlowError,
    buildProviderCatalogPayload,
    buildProviderModelsPayload,
    buildProviderProfilePayload,
    buildProviderToolsPayload,
    streamProviderProfileEvents,
    updateProviderProfilePayload,
    updateProviderSecretPayload,
    validateProviderConnectionPayload,
)

logger = logging.getLogger(__name__)


class AiProfileUpdateRequest(BaseModel):
    provider: str | None = None
    model: str | None = None
    role: str | None = None
    baseUrl: str | None = None
    temperature: float | None = None
    maxTokens: int | None = None
    systemPrompt: str | None = None


class AiSecretUpdateRequest(BaseModel):
    provider: str
    apiKey: str | None = None
    clear: bool = False


def _providerUnavailable(exc: Exception) -> HTTPException:
    detail = chatFlowErrorPayload(exc)
    logger.info("provider unavailable: %s", detail.get("message"))
    return HTTPException(status_code=503, detail=detail)


def createAiRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/ai/providers")
    def apiAiProviders():
        return buildProviderCatalogPayload()

    @router.get("/api/ai/profile")
    def apiAiProfile():
        return buildProviderProfilePayload()

    @router.get("/api/ai/tools")
    def apiAiTools():
        return buildProviderToolsPayload()

    @router.put("/api/ai/profile")
    def apiAiProfileUpdate(req: AiProfileUpdateRequest):
        try:
            return updateProviderProfilePayload(
                provider=req.provider,
                model=req.model,
                role=req.role,
                baseUrl=req.baseUrl,
                temperature=req.temperature,
                maxTokens=req.maxTokens,
                systemPrompt=req.systemPrompt,
            )
        except ProfileFlowError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/api/ai/profile/secrets")
    def apiAiProfileSecret(req: AiSecretUpdateRequest):
        try:
            return updateProviderSecretPayload(
                provider=req.provider,
                apiKey=req.apiKey,
                clear=req.clear,
            )
        except ProfileFlowError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/api/ai/provider/validate")
    def apiValidateProvider(
        provider: str = Query(...),
        model: str | None = Query(None),
        probe: str = Query("availability"),
    ):
        return validateProviderConnectionPayload(
            provider=provider,
            model=model,
            probe=probe,
        )

    @router.get("/api/ai/models/{provider}")
    def apiModels(provider: str):
        return buildProviderModelsPayload(provider)

    @router.get("/api/ai/profile/events")
    async def apiAiProfileEvents(request: Request):
        from starlette.responses import StreamingResponse

        return StreamingResponse(
            streamProviderProfileEvents(
                isDisconnected=request.is_disconnected,
            ),
            media_type="text/event-stream",
        )

    @router.get("/api/oauth/authorize")
    def apiOauthAuthorize():
        return getOAuthLoginFlow().authorize()

    @router.get("/api/oauth/status")
    def apiOauthStatus():
        return getOAuthLoginFlow().status()

    @router.post("/api/oauth/logout")
    def apiOauthLogout():
        return getOAuthLoginFlow().logout()

    @router.post("/api/ai/conversations")
    def apiCreateConversation(
        role: str = Query("copilot"),
        systemPrompt: str | None = Query(None),
    ):
        return createConversationPayload(
            getConversationManager(),
            role=role,
            systemPrompt=systemPrompt,
        )

    @router.get("/api/ai/conversations")
    def apiListConversations():
        return conversationListPayload(getConversationManager())

    @router.delete("/api/ai/conversations/{conversationId}")
    def apiDeleteConversation(conversationId: str):
        try:
            return deleteConversationPayload(getConversationManager(), conversationId)
        except ConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc

    @router.post("/api/ai/chat")
    async def apiChat(request: Request):
        body = await request.json()
        convManager = getConversationManager()

        try:
            return await runChatTurnPayload(
                payload=body,
                convManager=convManager,
                sessionManager=state.sessionManager,
                documentPath=state.documentPath,
                workspaceRoot=state.workspaceRoot,
            )
        except ChatFlowConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except CHAT_FLOW_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

    @router.post("/api/ai/chat/stream")
    async def apiChatStream(request: Request):
        from starlette.responses import StreamingResponse

        body = await request.json()
        convManager = getConversationManager()
        try:
            frames = streamChatTurnSseFrames(
                payload=body,
                convManager=convManager,
                sessionManager=state.sessionManager,
                documentPath=state.documentPath,
                workspaceRoot=state.workspaceRoot,
            )
        except ChatFlowConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except CHAT_FLOW_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

        return StreamingResponse(frames, media_type="text/event-stream")

    @router.post("/api/ai/complete")
    async def apiComplete(request: Request):
        body = await request.json()
        return buildCodeCompletionPayload(body)

    return router
