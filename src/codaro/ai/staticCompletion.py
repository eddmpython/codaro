"""로컬-우선 정적 자동완성.

jedi 정적 분석으로 커서 위치의 식별자 완성을 계산한다. 순수 Python·오프라인이라
provider(LLM) 설정 없이도 즉시 동작한다. provider가 있으면 `completion.py`가 LLM 완성을
우선하고, 없거나 비면 이 정적 완성으로 폴백한다.
"""
from __future__ import annotations

import logging

import jedi

logger = logging.getLogger(__name__)


def staticCompletions(prefix: str, suffix: str = "", *, limit: int = 8) -> list[str]:
    """커서 위치의 정적 완성 후보를 반환한다.

    각 후보는 *이미 입력된 접두사 뒤에 이어 붙일* 문자열(jedi Completion.complete)이다.
    프론트엔드는 `word.text + 후보`로 적용하므로 suffix 형태여야 한다.
    """
    if not prefix.strip():
        return []
    source = prefix + suffix
    lines = prefix.split("\n")
    line = len(lines)
    column = len(lines[-1])
    try:
        script = jedi.Script(code=source)
        completions = script.complete(line, column)
    except (ValueError, RecursionError) as exc:
        logger.debug("static completion skipped: %s", exc)
        return []

    results: list[str] = []
    for completion in completions:
        suffixText = completion.complete
        if not suffixText or suffixText in results:
            continue
        results.append(suffixText)
        if len(results) >= limit:
            break
    return results
