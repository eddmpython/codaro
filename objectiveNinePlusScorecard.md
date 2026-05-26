# Codaro 객관 9점대 Scorecard

이 문서는 교육용 IDE, 자동화 IDE, Teacher 모델 제품을 객관 기준으로 평가하는 루트 scorecard다. 점수는 감상으로 쓰지 않는다. `tests/verifyObjectiveNinePlusScorecard.py`가 아래 분야를 같은 기준으로 계산하고, 한 분야라도 9.0 미만이면 목표 완료를 실패시킨다.

## 기준 출처

- ISO/IEC 25010:2023 product quality model: https://webstore.iec.ch/en/publication/90024
- W3C WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- NIST trustworthy system characteristics: https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/
- CAST UDL Guidelines 3.0: https://udlguidelines.cast.org/
- ACM/IEEE Software Engineering Code of Ethics: https://www.acm.org/code-of-ethics/software-engineering-code

## 점수 산식

- 각 분야는 source, docs, tests, gate artifact evidence를 여러 개 가진다.
- 분야 점수는 `통과 evidence 수 / 전체 evidence 수 * 10`으로 계산한다.
- 분야별 `minimumScore`는 9.0이다.
- 전체 완료 조건은 모든 분야 `score >= 9.0`, `requirementFailures: []`, 최신 `quality-cycle` current HEAD 일치, tracked worktree clean이다.
- 최신 실행 report는 `output/test-runner/objective-nineplus-audit/objective-nineplus-report.json`에 남긴다.

## 분야별 현재 목표

| 분야 | 객관 기준 매핑 | 최소 점수 | 완료 증거 |
|---|---|---:|---|
| software-product-quality | ISO/IEC 25010 product quality, lifecycle evaluation | 9.0 | `quality-cycle`, `product-quality-audit`, backend/runtime/frontend/launcher gates |
| education-ide | CAST UDL learner agency, engagement, representation, action/expression | 9.0 | structured YAML, section card, exercise/check, curriculum matrix, `curriculum-top-tier-audit`, `playwright-curriculum-runtime`, browser rendering |
| teacher-model-loop | NIST trustworthy characteristics: valid/reliable, transparent, explainable, safe | 9.0 | real provider smoke, clarification-before-provider, tool sequence, workloop evidence |
| automation-ide | task/workflow/schedule/webhook/audit/E-Stop 제품 경계 | 9.0 | `automation-ide-audit`, task runner E-Stop, audit trail, frontend automation surface |
| release-operations | ISO lifecycle acceptance/quality control, installer recovery | 9.0 | launcher doctor/state, rollback, exact artifact, landing/editor build, clean artifact freshness |
| accessibility-ux | WCAG perceivable/operable/understandable/robust + UDL options | 9.0 | desktop/mobile browser gates, labels, Korean locale, diagnostic/onboarding action clarity |
| security-privacy-safety | ACM privacy/safety, NIST secure/resilient/privacy-enhanced | 9.0 | diagnostic redaction, no secret export, E-Stop, provider diagnostic action, input policy |
| observability-qa | objective evidence, traceability, reproducible local gates | 9.0 | command logs, report gitHead, freshness, workloop trace, failure detail |
| objective-evidence-integrity | non-stale proof, no text-only completion | 9.0 | clean tracked worktree, latest quality-cycle, objective report, stale checklist 제거 |

## 현재 판정

최종 판정은 이 문서의 표가 아니라 verifier report가 한다. 사람이 읽는 현재 목표 상태는 다음과 같다.

- [x] 분야별 객관 기준을 외부 기준과 repo evidence로 매핑한다.
- [x] 자동화 IDE 제품성은 별도 gate로 검증한다.
- [x] 모든 분야 9.0 이상을 하나의 objective verifier가 계산한다.
- [x] 최신 `quality-cycle`과 current HEAD가 맞지 않으면 실패한다.
- [x] 루트 체크리스트의 오래된 실패 문구를 제거한다.

실행:

```bash
uv run python -X utf8 tests/run.py quality-cycle
uv run python -X utf8 tests/run.py gate curriculum-top-tier-audit
uv run python -X utf8 tests/run.py gate playwright-curriculum-runtime
uv run python -X utf8 tests/run.py gate objective-nineplus-audit
```
