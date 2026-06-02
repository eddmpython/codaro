from __future__ import annotations

"""학습 경로(초급→중급→실무→고급) 추천을 결정적으로 계산한다(provider 불필요).

학습자의 진행률과 카테고리별 전체 레슨 수만으로 "지금 어느 트랙이고 다음은
무엇인지"를 닫는 규칙 기반 baseline. LLM provider 없이도 학습 여정이 끊기지
않게 하는 게 목적이다.
"""


def _trackStat(
    categories: list[str],
    categoryTotals: dict[str, int],
    categoryProgress: dict[str, dict[str, int]],
) -> tuple[int, int, str | None]:
    """트랙의 (완료 레슨 수, 전체 레슨 수, 다음 카테고리)를 계산한다.

    nextCategory = 트랙 순서상 아직 다 못 끝낸 첫 카테고리(레슨이 실제로 있는).
    """
    total = 0
    completed = 0
    nextCategory: str | None = None
    for category in categories:
        categoryTotal = int(categoryTotals.get(category, 0) or 0)
        rawDone = int(categoryProgress.get(category, {}).get("completed", 0) or 0)
        categoryDone = min(rawDone, categoryTotal) if categoryTotal else 0
        total += categoryTotal
        completed += categoryDone
        if nextCategory is None and categoryTotal > 0 and categoryDone < categoryTotal:
            nextCategory = category
    return completed, total, nextCategory


def recommendLearningPath(
    *,
    learningPaths: dict[str, dict],
    categoryTotals: dict[str, int],
    categoryProgress: dict[str, dict[str, int]],
) -> dict:
    """학습 경로 추천을 계산한다.

    반환:
      {
        "tracks": [{track, description, completed, total, ratio, state}, ...],
        "recommended": {track, category, completed, total, description} | None,
      }

    - state: "done"(완주) / "active"(현재 진행 트랙) / "upcoming"(아직 이름).
    - active 는 레슨이 존재하는(total>0) 미완주 트랙 중 순서상 첫 번째 하나뿐.
    - recommended.category = active 트랙에서 다음에 풀 카테고리. 모두 완주면 None.
    """
    tracks: list[dict] = []
    recommended: dict | None = None
    activeFound = False

    for name, payload in learningPaths.items():
        categories = [c for c in payload.get("categories", []) if isinstance(c, str) and c]
        completed, total, nextCategory = _trackStat(categories, categoryTotals, categoryProgress)
        ratio = round(completed / total, 3) if total > 0 else 0.0
        isDone = total > 0 and completed >= total

        if isDone:
            state = "done"
        elif not activeFound and total > 0:
            state = "active"
            activeFound = True
            recommended = {
                "track": name,
                "category": nextCategory,
                "completed": completed,
                "total": total,
                "description": str(payload.get("description") or ""),
            }
        else:
            state = "upcoming"

        tracks.append({
            "track": name,
            "description": str(payload.get("description") or ""),
            "completed": completed,
            "total": total,
            "ratio": ratio,
            "state": state,
        })

    return {"tracks": tracks, "recommended": recommended}
