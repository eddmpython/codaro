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
from ..ai.providerSpec import (
    buildProviderCatalog,
    getProviderSpec,
    normalizeProvider,
    publicProviderIds,
)

logger = logging.getLogger(__name__)

_HANDLED_ERRORS = (
    AttributeError,
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


def createAiRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/ai/providers")
    def apiAiProviders():
        return {"catalog": buildProviderCatalog()}

    @router.get("/api/ai/profile")
    def apiAiProfile():
        return getProfileManager().serialize()

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
            except _HANDLED_ERRORS:
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
        from ..ai.conversation import ConversationManager

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
        if context:
            message = _injectContext(message, context)

        from ..ai.conversation import ConversationManager
        from ..ai.factory import createProvider
        from ..ai.toolExecutor import ToolExecutor
        from ..ai.tools import toolSchemas
        from ..ai.types import LLMConfig

        convManager = _getConversationManager()

        if not conversationId:
            role = roleOverride or "copilot"
            conv = convManager.create(role=role)
            conversationId = conv.conversationId
        else:
            conv = convManager.get(conversationId)
            if conv is None:
                raise HTTPException(status_code=404, detail="Conversation not found")

        convManager.addUserMessage(conversationId, message)

        profileManager = getProfileManager()
        role = conv.role if conv else "copilot"
        resolved = profileManager.resolve(provider=providerOverride, role=role)

        config = LLMConfig(
            provider=resolved["provider"],
            model=resolved.get("model"),
            apiKey=resolved.get("apiKey"),
            baseUrl=resolved.get("baseUrl"),
            temperature=resolved.get("temperature", 0.3),
            maxTokens=resolved.get("maxTokens", 4096),
        )

        provider = createProvider(config)
        messages = convManager.buildMessages(conversationId)
        tools = toolSchemas()

        executor = ToolExecutor(
            sessionManager=state.sessionManager,
            workspaceRoot=str(state.workspaceRoot),
        )
        if sessionId:
            executor.setActiveSession(sessionId)

        maxToolRounds = 10
        for _round in range(maxToolRounds):
            if provider.supportsNativeTools and tools:
                response = provider.completeWithTools(messages, tools)
            else:
                response = provider.complete(messages)
                convManager.addAssistantMessage(conversationId, response.answer)
                return {
                    "conversationId": conversationId,
                    "answer": response.answer,
                    "provider": response.provider,
                    "model": response.model,
                    "usage": response.usage,
                    "toolCalls": [],
                }

            if not response.toolCalls:
                convManager.addAssistantMessage(conversationId, response.answer)
                return {
                    "conversationId": conversationId,
                    "answer": response.answer,
                    "provider": response.provider,
                    "model": response.model,
                    "usage": response.usage,
                    "toolCalls": [],
                }

            toolCallsData = [
                {"id": tc.id, "type": "function", "function": {"name": tc.name, "arguments": json.dumps(tc.arguments, ensure_ascii=False)}}
                for tc in response.toolCalls
            ]
            convManager.addAssistantMessage(conversationId, response.answer or "", toolCalls=toolCallsData)
            messages.append({"role": "assistant", "content": response.answer or "", "tool_calls": toolCallsData})

            allToolResults = []
            for tc in response.toolCalls:
                result = await executor.execute(tc.name, tc.arguments)
                resultStr = json.dumps(result, ensure_ascii=False)
                convManager.addToolResult(conversationId, tc.id, resultStr)
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": resultStr})
                allToolResults.append({"toolCallId": tc.id, "name": tc.name, "result": result})

        finalResponse = provider.complete(messages)
        convManager.addAssistantMessage(conversationId, finalResponse.answer)
        return {
            "conversationId": conversationId,
            "answer": finalResponse.answer,
            "provider": finalResponse.provider,
            "model": finalResponse.model,
            "usage": finalResponse.usage,
            "toolCalls": [],
        }

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
        if context:
            message = _injectContext(message, context)

        from ..ai.factory import createProvider
        from ..ai.toolExecutor import ToolExecutor
        from ..ai.tools import toolSchemas
        from ..ai.types import LLMConfig

        convManager = _getConversationManager()

        if not conversationId:
            role = roleOverride or "copilot"
            conv = convManager.create(role=role)
            conversationId = conv.conversationId
        else:
            conv = convManager.get(conversationId)
            if conv is None:
                raise HTTPException(status_code=404, detail="Conversation not found")

        convManager.addUserMessage(conversationId, message)

        profileManager = getProfileManager()
        role = conv.role if conv else "copilot"
        resolved = profileManager.resolve(provider=providerOverride, role=role)

        config = LLMConfig(
            provider=resolved["provider"],
            model=resolved.get("model"),
            apiKey=resolved.get("apiKey"),
            baseUrl=resolved.get("baseUrl"),
            temperature=resolved.get("temperature", 0.3),
            maxTokens=resolved.get("maxTokens", 4096),
        )

        llmProvider = createProvider(config)
        msgs = convManager.buildMessages(conversationId)
        tools = toolSchemas()

        executor = ToolExecutor(
            sessionManager=state.sessionManager,
            workspaceRoot=str(state.workspaceRoot),
        )
        if sessionId:
            executor.setActiveSession(sessionId)

        async def _yieldTokenStream(messages):
            loop = asyncio.get_running_loop()
            queue: asyncio.Queue[str | None] = asyncio.Queue()

            def _runStream():
                try:
                    for token in llmProvider.stream(messages):
                        loop.call_soon_threadsafe(queue.put_nowait, token)
                finally:
                    loop.call_soon_threadsafe(queue.put_nowait, None)

            thread = threading.Thread(target=_runStream, daemon=True)
            thread.start()

            accumulated = ""
            while True:
                token = await queue.get()
                if token is None:
                    break
                accumulated += token
                yield f"data: {json.dumps({'type': 'token', 'content': accumulated}, ensure_ascii=False)}\n\n"

            convManager.addAssistantMessage(conversationId, accumulated)
            yield f"data: {json.dumps({'type': 'done', 'answer': accumulated, 'provider': llmProvider.config.provider, 'model': llmProvider.resolvedModel, 'usage': None, 'toolCalls': []}, ensure_ascii=False)}\n\n"
            thread.join(timeout=2)

        async def _streamGenerate():
            nonlocal msgs, conversationId
            yield f"data: {json.dumps({'type': 'start', 'conversationId': conversationId}, ensure_ascii=False)}\n\n"

            if not (llmProvider.supportsNativeTools and tools):
                async for chunk in _yieldTokenStream(msgs):
                    yield chunk
                return

            maxToolRounds = 10
            for _round in range(maxToolRounds):
                response = llmProvider.completeWithTools(msgs, tools)

                if not response.toolCalls:
                    convManager.addAssistantMessage(conversationId, response.answer)
                    yield f"data: {json.dumps({'type': 'token', 'content': response.answer}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'done', 'answer': response.answer, 'provider': response.provider, 'model': response.model, 'usage': response.usage, 'toolCalls': []}, ensure_ascii=False)}\n\n"
                    return

                toolCallsData = [
                    {"id": tc.id, "type": "function", "function": {"name": tc.name, "arguments": json.dumps(tc.arguments, ensure_ascii=False)}}
                    for tc in response.toolCalls
                ]
                convManager.addAssistantMessage(conversationId, response.answer or "", toolCalls=toolCallsData)
                msgs.append({"role": "assistant", "content": response.answer or "", "tool_calls": toolCallsData})

                if response.answer:
                    yield f"data: {json.dumps({'type': 'token', 'content': response.answer}, ensure_ascii=False)}\n\n"

                toolResults = []
                for tc in response.toolCalls:
                    result = await executor.execute(tc.name, tc.arguments)
                    resultStr = json.dumps(result, ensure_ascii=False)
                    convManager.addToolResult(conversationId, tc.id, resultStr)
                    msgs.append({"role": "tool", "tool_call_id": tc.id, "content": resultStr})
                    toolResults.append({"toolCallId": tc.id, "name": tc.name, "result": result})

                yield f"data: {json.dumps({'type': 'tool_results', 'toolCalls': toolResults}, ensure_ascii=False)}\n\n"

            async for chunk in _yieldTokenStream(msgs):
                yield chunk

        return StreamingResponse(_streamGenerate(), media_type="text/event-stream")

    return router


def _injectContext(message: str, context: dict[str, Any]) -> str:
    parts: list[str] = []
    if context.get("selectedCell"):
        cell = context["selectedCell"]
        parts.append(f"[Selected cell ({cell.get('type', 'code')})]\n```\n{cell.get('content', '')}\n```")
    if context.get("variables"):
        varLines = [f"  {v['name']}: {v['type']} = {v.get('repr', '?')}" for v in context["variables"][:20]]
        parts.append(f"[Variables]\n" + "\n".join(varLines))
    if context.get("blocks"):
        blockLines = [f"  [{b['type']}] {b['id']}: {b.get('content', '')[:80]}" for b in context["blocks"][:15]]
        parts.append(f"[Document blocks]\n" + "\n".join(blockLines))
    if context.get("fileName"):
        parts.append(f"[File: {context['fileName']}]")
    if not parts:
        return message
    contextStr = "\n\n".join(parts)
    return f"{message}\n\n---\nContext:\n{contextStr}"


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
            except Exception as exc:
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
    except (ImportError, OSError, RuntimeError, ValueError):
        return []
