from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..ai.completion import CodeCompletionRequest, completeCodeFromRequest, emptyCompletionResult
from ..ai.conversation import (
    ConversationNotFound,
    conversationListPayload,
    createConversationPayload,
    deleteConversationPayload,
    getConversationManager,
)
from ..ai.oauthFlow import getOAuthLoginFlow
from ..ai.profile import AiProfileManager, getProfileManager
from ..ai.profileEvents import streamProfileChangeEvents
from ..ai.providerModels import providerModelList
from ..ai.profileMutation import (
    ProfileMutationError,
    ProviderProfileUpdate,
    ProviderSecretUpdate,
    updateProviderProfile,
    updateProviderSecret,
)
from ..ai.providerValidation import validateProviderConnection
from ..ai.providers.oauthChatgptProvider import ChatGPTOAuthError
from ..ai.providerSpec import (
    buildProviderCatalog,
)
from ..ai.teacher import (
    TeacherConversationNotFound,
    TeacherRuntimeTurnRequest,
    prepareTeacherRuntimeTurnFromRequest,
    runTeacherChatLoop,
    runTeacherChatStream,
    teacherStreamSseFrame,
)

logger = logging.getLogger(__name__)

_HANDLED_ERRORS = (
    AttributeError,
    ChatGPTOAuthError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TypeError,
    ValueError,
)


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
    detail = str(exc) or "AI provider unavailable"
    logger.info("ai provider unavailable: %s", detail)
    return HTTPException(status_code=503, detail=detail)


def createAiRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/ai/providers")
    def apiAiProviders():
        return {"catalog": buildProviderCatalog()}

    @router.get("/api/ai/profile")
    def apiAiProfile():
        return getProfileManager().serialize()

    @router.get("/api/ai/tools")
    def apiAiTools():
        from ..ai.tools import toolManifest

        return toolManifest()

    @router.put("/api/ai/profile")
    def apiAiProfileUpdate(req: AiProfileUpdateRequest):
        try:
            return updateProviderProfile(
                getProfileManager(),
                ProviderProfileUpdate(
                    provider=req.provider,
                    model=req.model,
                    role=req.role,
                    baseUrl=req.baseUrl,
                    temperature=req.temperature,
                    maxTokens=req.maxTokens,
                    systemPrompt=req.systemPrompt,
                ),
            )
        except ProfileMutationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/api/ai/profile/secrets")
    def apiAiProfileSecret(req: AiSecretUpdateRequest):
        try:
            return updateProviderSecret(
                getProfileManager(),
                ProviderSecretUpdate(provider=req.provider, apiKey=req.apiKey, clear=req.clear),
            )
        except ProfileMutationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/api/ai/provider/validate")
    def apiValidateProvider(
        provider: str = Query(...),
        model: str | None = Query(None),
    ):
        return validateProviderConnection(
            provider=provider,
            model=model,
            profileManager=getProfileManager(),
        ).payload()

    @router.get("/api/ai/models/{provider}")
    def apiModels(provider: str):
        return {"models": providerModelList(provider, profileManager=getProfileManager())}

    @router.get("/api/ai/profile/events")
    async def apiAiProfileEvents(request: Request):
        from starlette.responses import StreamingResponse

        return StreamingResponse(
            streamProfileChangeEvents(
                manager=getProfileManager(),
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
        runtimeTurn = _prepareTeacherRuntimeTurnForHttp(
            body=body,
            convManager=convManager,
            state=state,
        )

        try:
            return await runTeacherChatLoop(
                provider=runtimeTurn.turn.provider,
                convManager=convManager,
                conversationId=runtimeTurn.turn.conversationId,
                messages=runtimeTurn.turn.messages,
                tools=runtimeTurn.turn.tools,
                executor=runtimeTurn.executor,
                orchestrator=runtimeTurn.orchestrator,
            )
        except _HANDLED_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

    @router.post("/api/ai/chat/stream")
    async def apiChatStream(request: Request):
        from starlette.responses import StreamingResponse

        body = await request.json()
        convManager = getConversationManager()
        runtimeTurn = _prepareTeacherRuntimeTurnForHttp(
            body=body,
            convManager=convManager,
            state=state,
        )

        async def _streamGenerate():
            async for event in runTeacherChatStream(
                provider=runtimeTurn.turn.provider,
                convManager=convManager,
                conversationId=runtimeTurn.turn.conversationId,
                messages=runtimeTurn.turn.messages,
                tools=runtimeTurn.turn.tools,
                executor=runtimeTurn.executor,
                orchestrator=runtimeTurn.orchestrator,
            ):
                yield teacherStreamSseFrame(event)

        return StreamingResponse(_streamGenerate(), media_type="text/event-stream")

    @router.post("/api/ai/complete")
    async def apiComplete(request: Request):
        body = await request.json()
        completionRequest = CodeCompletionRequest.fromPayload(body)

        try:
            return completeCodeFromRequest(
                profileManager=getProfileManager(),
                request=completionRequest,
            ).payload()
        except _HANDLED_ERRORS as exc:
            logger.info("completion failed: %s", exc)
            return emptyCompletionResult().payload()

    return router


def _prepareTeacherRuntimeTurnForHttp(*, body: dict[str, Any], convManager: Any, state: Any):
    try:
        return prepareTeacherRuntimeTurnFromRequest(
            convManager=convManager,
            profileManager=getProfileManager(),
            sessionManager=state.sessionManager,
            documentPath=state.documentPath,
            workspaceRoot=state.workspaceRoot,
            request=TeacherRuntimeTurnRequest.fromPayload(body),
        )
    except TeacherConversationNotFound as exc:
        raise HTTPException(status_code=404, detail="Conversation not found") from exc
    except _HANDLED_ERRORS as exc:
        raise _providerUnavailable(exc) from exc
