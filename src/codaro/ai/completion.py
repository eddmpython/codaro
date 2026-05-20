from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from .factory import createProvider
from .types import LLMConfig


@dataclass(frozen=True)
class CodeCompletionResult:
    completions: list[str]
    provider: str
    model: str | None

    def payload(self) -> dict[str, Any]:
        return {
            "completions": self.completions,
            "provider": self.provider,
            "model": self.model,
        }


def emptyCompletionResult() -> CodeCompletionResult:
    return CodeCompletionResult(completions=[], provider="", model="")


def completeCode(
    *,
    profileManager: Any,
    prefix: str,
    suffix: str = "",
    context: dict[str, Any] | None = None,
    providerOverride: str | None = None,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> CodeCompletionResult:
    if not prefix.strip():
        return emptyCompletionResult()

    resolved = profileManager.resolve(provider=providerOverride, role="copilot")
    config = LLMConfig(
        provider=resolved["provider"],
        model=resolved.get("model"),
        apiKey=resolved.get("apiKey"),
        baseUrl=resolved.get("baseUrl"),
        temperature=0,
        maxTokens=120,
    )
    provider = providerFactory(config)
    response = provider.complete(buildCompletionMessages(prefix=prefix, suffix=suffix, context=context))
    completion = completionTextFromAnswer(response.answer)
    return CodeCompletionResult(
        completions=[completion] if completion else [],
        provider=response.provider,
        model=response.model,
    )


def buildCompletionMessages(
    *,
    prefix: str,
    suffix: str = "",
    context: dict[str, Any] | None = None,
) -> list[dict[str, str]]:
    systemPrompt = (
        "You are a Python code completion engine.\n"
        "Given a code prefix and optional suffix, return ONLY the code that should be inserted at the cursor.\n"
        "Do NOT include the prefix or suffix in your response.\n"
        "Do NOT include any explanation, markdown, or code fences.\n"
        "Return exactly the completion text, nothing else.\n"
        "If no completion is appropriate, return an empty string."
    )
    contextText = completionContextText(context)
    if contextText:
        systemPrompt += f"\n\n{contextText}"

    return [
        {"role": "system", "content": systemPrompt},
        {
            "role": "user",
            "content": f"Complete this Python code:\n```\n{prefix}█{suffix}\n```\nReturn only the text that replaces █.",
        },
    ]


def completionContextText(context: dict[str, Any] | None) -> str:
    if not isinstance(context, dict):
        return ""
    parts: list[str] = []
    variables = context.get("variables")
    if isinstance(variables, list) and variables:
        varLines = [
            f"  {item.get('name')}: {item.get('type')}"
            for item in variables[:20]
            if isinstance(item, dict) and item.get("name")
        ]
        if varLines:
            parts.append("Available variables:\n" + "\n".join(varLines))

    blocks = context.get("blocks")
    if isinstance(blocks, list) and blocks:
        blockLines = [
            f"  [{item.get('type')}] {str(item.get('content', ''))[:100]}"
            for item in blocks[:10]
            if isinstance(item, dict)
        ]
        if blockLines:
            parts.append("Other cells:\n" + "\n".join(blockLines))

    return "\n\n".join(parts)


def completionTextFromAnswer(answer: str) -> str:
    completion = answer.strip()
    if not completion.startswith("```"):
        return completion

    lines = completion.split("\n")
    if len(lines) <= 2:
        return ""
    return "\n".join(lines[1:-1]).strip()
