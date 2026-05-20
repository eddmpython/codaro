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

from ..ai.profile import AiProfileManager, getProfileManager
from ..ai.providers.oauthChatgptProvider import ChatGPTOAuthError
from ..ai.providerSpec import (
    buildProviderCatalog,
    getProviderSpec,
    normalizeProvider,
    publicProviderIds,
)
from ..ai.teacher import (
    TeacherConversationNotFound,
    TeacherOrchestrator,
    prepareTeacherTurn,
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
        from ..ai.factory import createProvider
        from ..ai.types import LLMConfig

        normalized = normalizeProvider(provider) or provider
        manager = getProfileManager()
        resolved = manager.resolve(provider=normalized)
        config = LLMConfig(
            provider=normalized,
            model=model or resolved.get("model"),
            apiKey=resolved.get("apiKey"),
            baseUrl=resolved.get("baseUrl"),
        )
        try:
            prov = createProvider(config)
            available = prov.checkAvailable()
            return {"valid": available, "model": prov.resolvedModel}
        except _HANDLED_ERRORS as exc:
            return {"valid": False, "error": str(exc)}

    @router.get("/api/ai/models/{provider}")
    def apiModels(provider: str):
        from ..ai.factory import createProvider
        from ..ai.types import LLMConfig

        normalized = normalizeProvider(provider) or provider

        if normalized == "oauth-chatgpt":
            from ..ai.providers.oauthChatgptProvider import AVAILABLE_MODELS

            return {"models": AVAILABLE_MODELS}

        if normalized == "ollama":
            try:
                config = LLMConfig(provider="ollama")
                prov = createProvider(config)
                installed = prov.getInstalledModels()
                return {"models": installed}
            except _HANDLED_ERRORS as exc:
                logger.info("ollama models unavailable: %s", exc)
                return {"models": []}

        if normalized == "openai":
            models = _fetchOpenaiModels()
            if models:
                return {"models": models}
            return {
                "models": [
                    "o3",
                    "gpt-4.1",
                    "gpt-4.1-mini",
                    "gpt-4.1-nano",
                    "o4-mini",
                    "gpt-4o",
                    "gpt-4o-mini",
                ]
            }

        return {"models": []}

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
        orchestrator = TeacherOrchestrator.fromContext(context)
        message = orchestrator.injectContext(message)

        convManager = _getConversationManager()
        try:
            turn = prepareTeacherTurn(
                convManager=convManager,
                profileManager=getProfileManager(),
                conversationId=conversationId,
                message=message,
                providerOverride=providerOverride,
                roleOverride=roleOverride,
            )
        except TeacherConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except _HANDLED_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

        executor = _createToolExecutor(state, sessionId)
        try:
            return await runTeacherChatLoop(
                provider=turn.provider,
                convManager=convManager,
                conversationId=turn.conversationId,
                messages=turn.messages,
                tools=turn.tools,
                executor=executor,
                orchestrator=orchestrator,
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
        orchestrator = TeacherOrchestrator.fromContext(context)
        message = orchestrator.injectContext(message)

        convManager = _getConversationManager()
        try:
            turn = prepareTeacherTurn(
                convManager=convManager,
                profileManager=getProfileManager(),
                conversationId=conversationId,
                message=message,
                providerOverride=providerOverride,
                roleOverride=roleOverride,
            )
        except TeacherConversationNotFound as exc:
            raise HTTPException(status_code=404, detail="Conversation not found") from exc
        except _HANDLED_ERRORS as exc:
            raise _providerUnavailable(exc) from exc

        async def _streamGenerate():
            async for event in runTeacherChatStream(
                provider=turn.provider,
                convManager=convManager,
                conversationId=turn.conversationId,
                messages=turn.messages,
                tools=turn.tools,
                executor=_createToolExecutor(state, sessionId),
                orchestrator=orchestrator,
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

        return StreamingResponse(_streamGenerate(), media_type="text/event-stream")

    @router.post("/api/ai/complete")
    async def apiComplete(request: Request):
        body = await request.json()
        prefix = body.get("prefix", "")
        suffix = body.get("suffix", "")
        blockId = body.get("blockId", "")
        providerOverride = body.get("provider")
        context = body.get("context")

        if not prefix.strip():
            return {"completions": [], "provider": "", "model": ""}

        from ..ai.factory import createProvider
        from ..ai.types import LLMConfig

        profileManager = getProfileManager()
        resolved = profileManager.resolve(provider=providerOverride, role="copilot")

        config = LLMConfig(
            provider=resolved["provider"],
            model=resolved.get("model"),
            apiKey=resolved.get("apiKey"),
            baseUrl=resolved.get("baseUrl"),
            temperature=0,
            maxTokens=120,
        )

        contextParts: list[str] = []
        if context:
            if context.get("variables"):
                varLines = [f"  {v['name']}: {v['type']}" for v in context["variables"][:20]]
                contextParts.append("Available variables:\n" + "\n".join(varLines))
            if context.get("blocks"):
                blockLines = [f"  [{b['type']}] {b.get('content', '')[:100]}" for b in context["blocks"][:10]]
                contextParts.append("Other cells:\n" + "\n".join(blockLines))

        systemPrompt = (
            "You are a Python code completion engine.\n"
            "Given a code prefix and optional suffix, return ONLY the code that should be inserted at the cursor.\n"
            "Do NOT include the prefix or suffix in your response.\n"
            "Do NOT include any explanation, markdown, or code fences.\n"
            "Return exactly the completion text, nothing else.\n"
            "If no completion is appropriate, return an empty string."
        )
        if contextParts:
            systemPrompt += "\n\n" + "\n\n".join(contextParts)

        userMessage = f"Complete this Python code:\n```\n{prefix}█{suffix}\n```\nReturn only the text that replaces █."

        messages = [
            {"role": "system", "content": systemPrompt},
            {"role": "user", "content": userMessage},
        ]

        try:
            provider = createProvider(config)
            response = provider.complete(messages)
            completion = response.answer.strip()
            if completion.startswith("```"):
                lines = completion.split("\n")
                if len(lines) > 2:
                    completion = "\n".join(lines[1:-1]).strip()
                else:
                    completion = ""
            completions = [completion] if completion else []
            return {
                "completions": completions,
                "provider": response.provider,
                "model": response.model,
            }
        except _HANDLED_ERRORS as exc:
            logger.info("completion failed: %s", exc)
            return {"completions": [], "provider": "", "model": ""}

    return router


def _createToolExecutor(state: Any, sessionId: str | None = None):
    from ..ai.toolExecutor import ToolExecutor
    from ..document.service import loadDocument, saveDocument

    docPath = state.documentPath

    def documentGetter():
        if docPath is None:
            return None
        try:
            return loadDocument(str(docPath))
        except (FileNotFoundError, OSError):
            return None

    def documentSetter(doc):
        if docPath is not None:
            saveDocument(str(docPath), doc)

    executor = ToolExecutor(
        sessionManager=state.sessionManager,
        documentGetter=documentGetter if docPath else None,
        documentSetter=documentSetter if docPath else None,
        workspaceRoot=str(state.workspaceRoot),
    )
    if sessionId:
        executor.setActiveSession(sessionId)
    return executor


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


def _fetchOpenaiModels() -> list[str]:
    manager = getProfileManager()
    resolved = manager.resolve(provider="openai")
    apiKey = resolved.get("apiKey")
    if not apiKey:
        import os

        apiKey = os.environ.get("OPENAI_API_KEY")
    if not apiKey:
        return []
    try:
        from openai import OpenAI

        client = OpenAI(api_key=apiKey)
        raw = client.models.list()
        chatPrefixes = ("gpt-5", "gpt-4", "gpt-3.5", "o1", "o3", "o4")
        exclude = (
            "realtime", "audio", "search", "instruct", "embedding",
            "tts", "whisper", "dall-e", "davinci", "babbage", "transcribe",
        )
        models = []
        for model in raw:
            mid = model.id
            if any(mid.startswith(prefix) for prefix in chatPrefixes):
                if not any(excluded in mid for excluded in exclude):
                    models.append(mid)
        priority = [
            "gpt-5.4", "gpt-5.3", "gpt-5.2", "gpt-5.1", "gpt-5",
            "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
            "gpt-4o", "gpt-4o-mini",
            "o4-mini", "o3", "o3-mini", "o1", "o1-mini",
        ]

        def sortKey(name: str):
            for idx, prefix in enumerate(priority):
                if name == prefix or name.startswith(prefix + "-"):
                    return (idx, name)
            return (100, name)

        models.sort(key=sortKey)
        return models
    except (ImportError, OSError, RuntimeError, ValueError) as exc:
        logger.info("openai models fetch failed: %s", exc)
        return []
