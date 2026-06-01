from __future__ import annotations

from .osCache import CurriculumOsCache
from .progress import ProgressTracker
from .reviewScheduler import ReviewState, daysOverdue


def buildCurriculumReviewsPayload(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
) -> dict[str, object]:
    graph = curriculumOs.graph()
    items: list[dict[str, object]] = []
    for review in progressTracker.listDueReviews():
        lesson = graph.byKey(review.lessonKey)
        items.append({
            "lessonKey": review.lessonKey,
            "title": lesson.title if lesson else review.lessonKey,
            "category": lesson.category if lesson else "",
            "contentId": lesson.contentId if lesson else "",
            "interval": review.interval,
            "ease": review.ease,
            "streak": review.streak,
            "lastResult": review.lastResult,
            "nextReviewAt": review.nextReviewAt,
            "daysOverdue": daysOverdue(review),
        })
    return {"reviews": items, "totalDue": len(items)}


def recordCurriculumReviewResult(
    *,
    progressTracker: ProgressTracker,
    category: str,
    contentId: str,
    success: bool,
) -> ReviewState:
    return progressTracker.recordReviewResult(f"{category}/{contentId}", success)
