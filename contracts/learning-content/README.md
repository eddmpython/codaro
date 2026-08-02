# Learning Content Contracts

완료된 `08-learning-content`의 학습 콘텐츠 구현 계약을 보존하는 영구 SSOT다. TODO 상태를 표현하지 않으며, 472개 canonical lesson과 31개 path의 M0 machine readiness를 회귀 검증한다.

## 구성

- `identity-ledger/`: `category/contentId` identity 472개와 승인 메타데이터
- `content-ledger/`: source hash, outcome, runtime, strong check, owner와 저작 승인 472개
- `path-ledgers/`: taxonomy domain 31개의 canonical lesson 순서
- `evidence/`: legacy alias 및 taxonomy 전이 승인, 직접 전수 검토 기록
- `featured-capstones.yml`: 대표 6경로의 route-backed capstone과 산출물 계약
- `owner-registry.yml`: 완료된 작업 패킷에서 승계한 안정적인 콘텐츠 owner id와 승인 row 수

`learnerEvidenceClaim: none`과 `pending-independent-evidence`는 M0 계약이 실제 사용자 효능이나 Local 졸업을 주장하지 않는다는 뜻이다. E0-E3 사용자 연구는 `docs/skills/ops/product/learning-efficacy-operations.md`와 `docs/evidence/path-efficacy/`가, Windows Local 졸업 판정은 `contracts/checkSandboxFeasibilityDecision.json`과 `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/09-learning-quality-revalidation/`이 소유한다.

## 갱신과 검증

```powershell
uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --write
uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
```

승인 메타데이터를 바꿀 때는 `applyLearningContentReview.py`의 검증된 입력 경로를 사용한다. 원장과 실제 curriculum source가 달라지면 `learning-content` gate가 실패해야 한다.
