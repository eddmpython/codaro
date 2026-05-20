from __future__ import annotations

import asyncio
import html as _html
import json
import logging
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..ai.completion import completeCode, emptyCompletionResult
from ..ai.profile import AiProfileManager, getProfileManager
from ..ai.providerModels import providerModelList
from ..ai.providerValidation import validateProviderConnection
from ..ai.providers.oauthChatgptProvider import ChatGPTOAuthError
from ..ai.providerSpec import (
    buildProviderCatalog,
    getProviderSpec,
    normalizeProvider,
)
from ..ai.teacher import (
    TeacherConversationNotFound,
    prepareTeacherRuntimeTurn,
    runTeacherChatLoop,
    runTeacherChatStream,
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

_oauthState: dict[str, Any] = {}


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
        manager = getProfileManager()
        provider = normalizeProvider(req.provider) or req.provider
        if provider and getProviderSpec(provider) is None:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        profile = manager.update(
            provider=provider,
            role=req.role,
            model=req.model,
            baseUrl=req.baseUrl,
            temperature=req.temperature,
            maxTokens=req.maxTokens,
            systemPrompt=req.systemPrompt,
            updatedBy="ui",
        )
        return manager.serialize() | {"revision": profile.revision}

    @router.post("/api/ai/profile/secrets")
    def apiAiProfileSecret(req: AiSecretUpdateRequest):
        provider = normalizeProvider(req.provider) or req.provider
        spec = getProviderSpec(provider)
        if spec is None:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        if spec.authKind != "api_key":
            raise HTTPException(status_code=400, detail=f"{provider} provider does not use API key secrets")

        manager = getProfileManager()
        if req.clear or not req.apiKey:
            profile = manager.clearApiKey(provider, updatedBy="ui")
        else:
            profile = manager.saveApiKey(provider, req.apiKey, updatedBy="ui")
        return manager.serialize() | {"revision": profile.revision}

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

        manager = getProfileManager()

        async def _generate():
            lastFingerprint = ""
            while True:
                if await request.is_disconnected():
                    break
                payload = manager.serialize()
                fingerprint = manager.fingerprint()
                if fingerprint != lastFingerprint:
                    lastFingerprint = fingerprint
                    yield f"event: profile_changed\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
                await asyncio.sleep(1.0)

        return StreamingResponse(_generate(), media_type="text/event-stream")

    @router.get("/api/oauth/authorize")
    def apiOauthAuthorize():
        from ..ai.oauthToken import OAUTH_REDIRECT_PORT, buildAuthUrl

        authUrl, verifier, oauthStateValue = buildAuthUrl()

        _oauthState["verifier"] = verifier
        _oauthState["state"] = oauthStateValue
        _oauthState["done"] = False
        _oauthState["error"] = None

        _startOauthCallbackServer(OAUTH_REDIRECT_PORT)

        return {"authUrl": authUrl, "state": oauthStateValue}

    @router.get("/api/oauth/status")
    def apiOauthStatus():
        if _oauthState.get("error"):
            return {"done": True, "error": _oauthState["error"]}
        if _oauthState.get("done"):
            return {"done": True, "error": None}
        return {"done": False}

    @router.post("/api/oauth/logout")
    def apiOauthLogout():
        from ..ai.oauthToken import revokeToken

        revokeToken()
        getProfileManager().update(provider="oauth-chatgpt", updatedBy="ui")
        return {"ok": True}

    @router.post("/api/ai/conversations")
    def apiCreateConversation(
        role: str = Query("copilot"),
        systemPrompt: str | None = Query(None),
    ):
        manager = _getConversationManager()
        conv = manager.create(role=role, systemPrompt=systemPrompt)
        return {"conversationId": conv.conversationId, "role": conv.role}

    @router.get("/api/ai/conversations")
    def apiListConversations():
        manager = _getConversationManager()
        return {"conversations": manager.listConversations()}

    @router.delete("/api/ai/conversations/{conversationId}")
    def apiDeleteConversation(conversationId: str):
        manager = _getConversationManager()
        deleted = manager.delete(conversationId)
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"ok": True}

    @router.post("/api/ai/chat")
    async def apiChat(request: Request):
        body = await request.json()
        conversationId = body.get("conversationId")
        message = body.get("message", "")
        sessionId = body.get("sessionId")
        providerOverride = body.get("provider")
        roleOverride = body.get("role")
        context = body.get("context")

        convManager = _getConversationManager()
        try:
            runtimeTurn = prepareTeacherRuntimeTurn(
                convManager=convManager,
                profileManager=getProfileManager(),
                sessionManager=state.sessionManager,
                documentPath=state.documentPath,
                workspaceRoot=state.workspaceRoot,
                conversationId=conversationId,
                message=message,
                context=context,
                sessionId=sessionId,
                providerOverride=providerOverride,
                roleOverride=roleOverride,
            )
        except TeacherConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except _HANDLED_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

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
        conversationId = body.get("conversationId")
        message = body.get("message", "")
        sessionId = body.get("sessionId")
        providerOverride = body.get("provider")
        roleOverride = body.get("role")
        context = body.get("context")

        convManager = _getConversationManager()
        try:
            runtimeTurn = prepareTeacherRuntimeTurn(
                convManager=convManager,
                profileManager=getProfileManager(),
                sessionManager=state.sessionManager,
                documentPath=state.documentPath,
                workspaceRoot=state.workspaceRoot,
                conversationId=conversationId,
                message=message,
                context=context,
                sessionId=sessionId,
                providerOverride=providerOverride,
                roleOverride=roleOverride,
            )
        except TeacherConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except _HANDLED_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

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
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

        return StreamingResponse(_streamGenerate(), media_type="text/event-stream")

    @router.post("/api/ai/complete")
    async def apiComplete(request: Request):
        body = await request.json()
        prefix = body.get("prefix", "")
        suffix = body.get("suffix", "")
        providerOverride = body.get("provider")
        context = body.get("context")

        if not prefix.strip():
            return emptyCompletionResult().payload()

        try:
            return completeCode(
                profileManager=getProfileManager(),
                prefix=prefix,
                suffix=suffix,
                context=context,
                providerOverride=providerOverride,
            ).payload()
        except _HANDLED_ERRORS as exc:
            logger.info("completion failed: %s", exc)
            return emptyCompletionResult().payload()

    return router


_conversationManager = None


def _getConversationManager():
    global _conversationManager
    if _conversationManager is None:
        from ..ai.conversation import ConversationManager
        _conversationManager = ConversationManager()
    return _conversationManager


def _startOauthCallbackServer(port: int):
    class CallbackHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path != "/auth/callback":
                self.send_response(404)
                self.end_headers()
                return

            params = parse_qs(parsed.query)
            code = params.get("code", [None])[0]
            callbackState = params.get("state", [None])[0]
            error = params.get("error", [None])[0]

            if error:
                _oauthState["error"] = error
                _oauthState["done"] = True
                self._respondHtml("Authentication Failed", f"Error: {error}")
                return

            if callbackState != _oauthState.get("state"):
                _oauthState["error"] = "state_mismatch"
                _oauthState["done"] = True
                self._respondHtml("Authentication Failed", "Security validation failed (state mismatch)")
                return

            if not code:
                _oauthState["error"] = "no_code"
                _oauthState["done"] = True
                self._respondHtml("Authentication Failed", "No authorization code received")
                return

            try:
                from codaro.ai.oauthToken import exchangeCode

                exchangeCode(code, _oauthState["verifier"])
                getProfileManager().update(provider="oauth-chatgpt", updatedBy="ui")
                _oauthState["done"] = True
                self._respondHtml("Authentication Successful", "Codaro authentication complete. You may close this window.")
            except Exception as exc:  # noqa: BLE001 — browser callback must not crash
                _oauthState["error"] = str(exc)
                _oauthState["done"] = True
                self._respondHtml("Authentication Failed", f"Token exchange failed: {exc}")

        def _respondHtml(self, title: str, message: str):
            safeTitle = _html.escape(title)
            safeMessage = _html.escape(message)
            markup = (
                "<!DOCTYPE html><html><head><meta charset='utf-8'>"
                f"<title>{safeTitle}</title>"
                "<style>body{font-family:system-ui;display:flex;align-items:center;"
                "justify-content:center;min-height:100vh;margin:0;background:#09090b;color:#e4e4e7}"
                "div{text-align:center;padding:2rem}"
                "h1{font-size:1.5rem;margin-bottom:1rem}"
                "</style></head><body>"
                f"<div><h1>{safeTitle}</h1><p>{safeMessage}</p></div>"
                "<script>setTimeout(()=>window.close(),3000)</script>"
                "</body></html>"
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(markup.encode("utf-8"))

        def log_message(self, fmt, *args):
            pass

    def _runServer():
        server = HTTPServer(("127.0.0.1", port), CallbackHandler)
        server.timeout = 120
        server.handle_request()
        server.server_close()

    thread = threading.Thread(target=_runServer, daemon=True)
    thread.start()
