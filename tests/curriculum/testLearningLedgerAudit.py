from __future__ import annotations

from learningLedgerAudit import requiresStrongAssessment


def testStructuredPracticeRequiresStrongAssessment() -> None:
    payload = {
        "sections": [
            {
                "structuredPrimary": True,
                "exercise": {
                    "prompt": "상태를 판독하세요.",
                    "starterCode": "def classify_state(lines):\n    pass",
                    "solution": "def classify_state(lines):\n    return 'clean'",
                },
            },
        ],
    }

    assert requiresStrongAssessment(payload) is True


def testReadOnlyOrientationDoesNotRequireStrongAssessment() -> None:
    payload = {
        "sections": [
            {
                "id": "orientation",
                "title": "도구 소개",
                "blocks": [{"type": "text", "content": "도구의 역할을 읽습니다."}],
            },
        ],
    }

    assert requiresStrongAssessment(payload) is False
