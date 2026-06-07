"""라인별 제품 기본 안전 정책.

- 컴퓨터유즈: OS 입력은 blast radius 가 무한대에 가깝고 데스크톱 grounding 정확도가 낮아
  **무인 클릭을 금지**한다. 기본 = step-approval + confirm-each-click + critical forbidden + rate-limit.
- 브라우저유즈: 탭/프로세스로 자연 격리되고 navigation allow/deny 로 도메인 경계가 명확해
  데스크톱보다 자율을 더 줄 수 있다. 다만 기본은 보수적으로 step-approval + critical forbidden.
"""

from __future__ import annotations

from .safetyGate import ExecMode, SafetyPolicy

# 운영 InputGuard rate-limit 과 정합(10/s, 200/min).
_DEFAULT_PER_SECOND = 10.0
_DEFAULT_PER_MINUTE = 200.0


def browserUseDefaultPolicy(**overrides) -> SafetyPolicy:
    base = {
        "mode": ExecMode.STEP_APPROVAL,
        "criticalForbidden": True,
        "maxActionsPerSecond": _DEFAULT_PER_SECOND,
        "maxActionsPerMinute": _DEFAULT_PER_MINUTE,
    }
    base.update(overrides)
    return SafetyPolicy(**base)


def computerUseDefaultPolicy(**overrides) -> SafetyPolicy:
    base = {
        "mode": ExecMode.STEP_APPROVAL,
        "confirmEachClick": True,  # 무인 클릭 금지 — grounding 불확실성에 대한 안전 응답
        "criticalForbidden": True,
        "maxActionsPerSecond": _DEFAULT_PER_SECOND,
        "maxActionsPerMinute": _DEFAULT_PER_MINUTE,
    }
    base.update(overrides)
    return SafetyPolicy(**base)
