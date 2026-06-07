"""학습 카드 블록 계약 SSOT.

커리큘럼 YAML의 `sections[].blocks[]`는 `converter.py`가 `displayKind`로 바꿔 프론트
(`curriculumMarkdownBody.tsx`)가 렌더한다. 그 매핑이 그동안 converter 상수와 프론트
디스패치에 암묵으로 흩어져 있어, `type` 오타가 조용히 prose로 fallback되는 사고가 났다
(예: converter `localWorkbench` ↔ 프론트 `localRunner` 드리프트).

이 모듈이 블록 type → displayKind/role/필수키의 **단일 SSOT**다.
- `converter.py`의 분기 로직은 이 레지스트리를 따른다(문서 미러: docs/skills/architecture/curriculum-card-contract.md).
- `tests/curriculum/verifyCardContract.py`가 전 커리큘럼을 walk하며 `validateCardBlock`로 type 오타·필수키
  누락을 머신 게이트로 차단한다.

강제 수위는 의도적으로 경량이다(allowlist + 필수키만). 선택/미지 키는 검사하지 않아 작성
유연성과 converter의 관용적 패스스루를 보존한다. full pydantic 강검증은 하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CardSpec:
    """한 블록 type의 계약.

    requiredKeys: OR-그룹의 튜플. 각 그룹은 "그 중 하나 이상의 키가 비어있지 않게 있어야 함".
    모든 그룹이 충족돼야 통과. 빈 튜플이면 type allowlist 검사만 한다.
    aliases: 같은 렌더로 흡수되는 별칭 type(드리프트 정리용). allowlist에 함께 등록된다.
    """

    displayKind: str
    role: str
    requiredKeys: tuple[tuple[str, ...], ...] = ()
    aliases: tuple[str, ...] = ()


# 블록 type → 계약. converter.py `_convertBlock`의 분기와 1:1로 맞춘다.
CARD_REGISTRY: dict[str, CardSpec] = {
    # 제목/헤더
    "mainHeader": CardSpec("title", "title"),
    "sectionHeader": CardSpec("title", "title"),
    "sectionTitle": CardSpec("title", "title"),
    # 히어로(배너)
    "hero": CardSpec("hero", "visual"),
    "localWorkbench": CardSpec("hero", "visual", aliases=("localRunner",)),
    "tiobeIndex": CardSpec("hero", "visual"),
    # 카드 그리드
    "featureCards": CardSpec("cardGrid", "visual", (("cards", "items"),)),
    "choiceCards": CardSpec("cardGrid", "visual", (("cards", "items"),)),
    "threeColumnCards": CardSpec("cardGrid", "visual", (("cards", "items"),)),
    "resourceCards": CardSpec("resource", "explanation", (("cards", "items", "resources"),)),
    "stepCard": CardSpec("practice", "exercise", (("cards", "items", "steps"),)),
    "practiceCard": CardSpec("practice", "exercise", (("cards", "items"),)),
    # 비교
    "compare": CardSpec("comparison", "visual", (("cards", "left", "right", "items"),)),
    "fullWidthComparison": CardSpec("comparison", "visual", (("cards", "left", "right", "items"),)),
    # 표
    "table": CardSpec("table", "visual", (("rows", "items", "data", "headers"),)),
    # 미디어
    "image": CardSpec("media", "visual", (("src", "url", "href", "imageUrl"),)),
    "video": CardSpec("media", "visual", (("src", "url", "href", "videoUrl", "items", "videos"),)),
    "youtube": CardSpec("media", "visual", (("youtube", "youtubeId", "videoId", "src", "url", "items", "videos"),)),
    "videoCarousel": CardSpec("media", "visual", (("items", "videos"),)),
    "pdf": CardSpec("media", "visual", (("src", "url", "href"),)),
    "MIME": CardSpec("media", "visual"),
    # 링크
    "link": CardSpec("resource", "explanation", (("url", "href", "items", "links"),)),
    "links": CardSpec("resource", "explanation", (("items", "links"),)),
    "linkButtons": CardSpec("resource", "explanation", (("items", "links", "buttons"),)),
    # 콜아웃
    "tip": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "tipCard": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "note": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "info": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "warning": CardSpec("callout", "check", (("content", "title", "description", "items"),)),
    "codeDescription": CardSpec("callout", "explanation", (("content", "code", "description"),)),
    # 의미 콜아웃(callout displayKind 재사용, 톤만 다름)
    "danger": CardSpec("callout", "check", (("content", "title", "description", "items"),)),
    "success": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "example": CardSpec("callout", "explanation", (("content", "title", "description", "items"),)),
    "summary": CardSpec("callout", "explanation", (("content", "title", "description", "items", "points"),)),
    # 퀴즈
    "quiz": CardSpec("quiz", "check", (("question", "title"),)),
    # 구조/텍스트
    "expansion": CardSpec("practice", "exercise"),
    "code": CardSpec("code", "snippet"),
    "list": CardSpec("prose", "learning", (("items",),)),
    "centerText": CardSpec("centerText", "learning"),
    "text": CardSpec("prose", "learning"),
    # === 교육 표현 카드 ===
    # 수평 설명카드 — 개념↔비유/예시 좌우 병치(듀얼코딩·공간 인접)
    "conceptRow": CardSpec("conceptRow", "visual", (("rows",),)),
    # 권장/지양 규범 대조(대조학습)
    "doDont": CardSpec("doDont", "check", (("do", "dont", "items"),)),
    # 용어 정의(term→뜻→예시, 앵커링)
    "definition": CardSpec("definition", "explanation", (("items", "term", "rows"),)),
    # 오개념 교정(착각↔사실, Codaro 진단 철학)
    "misconception": CardSpec("misconception", "check", (("items", "myth", "wrong"),)),
    # 단계 타임라인(순서·인과 세그멘팅)
    "timeline": CardSpec("timeline", "visual", (("items", "steps", "events"),)),
    # 지표 강조(큰 숫자 현저성)
    "stat": CardSpec("stat", "visual", (("items", "stats", "value"),)),
    # Before/After 코드 비교(대조학습 코드판)
    "codeCompare": CardSpec("codeCompare", "visual", (("before", "after", "items"),)),
    # 한 줄 명령/코드/경로를 토큰별 라벨로 분해(세그멘팅·시그널링)
    "anatomy": CardSpec("anatomy", "visual", (("parts", "items", "tokens"),)),
    # 터미널 세션 재현(프롬프트+명령+출력, worked example)
    "terminal": CardSpec("terminal", "visual", (("lines", "commands", "content"),)),
    # 코드 라인별 거터 주석(worked example + self-explanation)
    "annotatedCode": CardSpec("annotatedCode", "visual", (("lines", "code", "items"),), aliases=("codeWalkthrough",)),
}

# allowlist = canonical type + alias. type 오타는 여기에 없으므로 게이트가 잡는다.
ALLOWED_TYPES: frozenset[str] = frozenset(
    {name for name in CARD_REGISTRY}
    | {alias for spec in CARD_REGISTRY.values() for alias in spec.aliases}
)

# converter `_convertBlock`에서 type 없는 블록의 기본값.
DEFAULT_BLOCK_TYPE = "text"


def specForType(blockType: str) -> CardSpec | None:
    """canonical 또는 alias type의 CardSpec을 돌려준다. 미지 type이면 None."""
    spec = CARD_REGISTRY.get(blockType)
    if spec is not None:
        return spec
    for canonical, candidate in CARD_REGISTRY.items():
        if blockType in candidate.aliases:
            return candidate
    return None


def _hasKey(block: dict[str, Any], key: str) -> bool:
    if key not in block:
        return False
    value = block[key]
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return bool(value)
    return True


def validateCardBlock(block: dict[str, Any], *, location: str = "") -> list[str]:
    """블록 한 개를 계약과 대조해 위반 메시지를 돌려준다(없으면 빈 리스트).

    (a) type이 레지스트리(별칭 포함)에 없으면 에러 — 조용한 prose fallback 차단.
    (b) 필수키 그룹 중 하나도 충족 못 하면 에러.
    선택/미지 키는 검사하지 않는다(패스스루 유연성 보존).
    """
    if not isinstance(block, dict):
        return [f"{location}: block is not a mapping"]
    rawType = block.get("type")
    blockType = rawType.strip() if isinstance(rawType, str) else ""
    if not blockType:
        blockType = DEFAULT_BLOCK_TYPE
    spec = specForType(blockType)
    if spec is None:
        return [f"{location}: unknown block type '{blockType}' (card contract registry에 없음 — type 오타 또는 신규 카드 미등록)"]
    issues: list[str] = []
    for group in spec.requiredKeys:
        if not any(_hasKey(block, key) for key in group):
            issues.append(f"{location}: block '{blockType}' missing required key (one of: {', '.join(group)})")
    return issues


def iterCardBlocks(sections: Any) -> Any:
    """sections[].blocks[]와 그 중첩(expansion의 blocks)을 순회해 (block, path)를 yield.

    `blocks` 키 아래의 dict만 블록으로 본다 → `check: {type: noError}` 같은 비-블록 dict는
    건드리지 않는다(오탐 방지).
    """
    if not isinstance(sections, list):
        return
    for sectionIndex, section in enumerate(sections):
        if not isinstance(section, dict):
            continue
        sectionId = section.get("id") or f"section-{sectionIndex + 1}"
        yield from _iterBlockList(section.get("blocks"), f"{sectionId}.blocks")


def _iterBlockList(blocks: Any, path: str) -> Any:
    if not isinstance(blocks, list):
        return
    for index, block in enumerate(blocks):
        if not isinstance(block, dict):
            continue
        blockPath = f"{path}[{index}]"
        yield block, blockPath
        yield from _iterBlockList(block.get("blocks"), f"{blockPath}.blocks")
