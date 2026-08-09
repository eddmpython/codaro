# Learning Content Contracts

학습 콘텐츠 구현 계약을 보존하는 영구 SSOT다. TODO 상태를 표현하지 않으며, 472개 canonical lesson과 32개 path의 source integrity를 회귀 검증한다. 모든 path가 동급의 성취를 주장하지 않는다.

## 구성

- `identity-ledger/`: `category/contentId` identity 472개와 승인 메타데이터
- `content-ledger/`: source hash, outcome, runtime, strong check, owner와 저작 승인 472개
- `path-ledgers/`: taxonomy domain 32개의 canonical lesson 순서
- `artifacts/`: strong application check가 보존해야 하는 산출물 의미 계약
- `evidence/`: legacy alias 및 taxonomy 전이 승인, 직접 전수 검토 기록
- `featured-capstones.yml`: 대표 6경로의 route-backed capstone과 산출물 계약
- `owner-registry.yml`: 완료된 작업 패킷에서 승계한 안정적인 콘텐츠 owner id와 승인 row 수

`learnerEvidenceClaim: none`과 `pending-independent-evidence`는 M0 계약이 실제 사용자 효능을 주장하지 않는다는 뜻이다. E0-E3 사용자 연구는 `docs/skills/ops/product/learning-efficacy-operations.md`와 `docs/evidence/path-efficacy/`가 소유한다. Windows Local strong 졸업 판정은 `contracts/checkSandboxFeasibilityDecision.json`, `launcher-test`, `product-browser-webview2-fixed`가 소유한다.

catalog lesson은 참고 학습 자산이다. 최소 source integrity와 실제 check 표기를 지키되 assurance credit은 explicit promoted TaskFamily checkpoint에서만 발생한다. `golden`은 `resolvePathPromotionState`의 machine gate에서 파생하며 taxonomy나 ledger에 수동으로 저장하지 않는다. 현재 golden 경로는 `reportAutomationFoundation` 하나이며 나머지는 candidate 또는 catalog다.

## 갱신과 검증

```powershell
uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --write
uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
```

승인 메타데이터를 바꿀 때는 `applyLearningContentReview.py`의 검증된 입력 경로를 사용한다. 원장과 실제 curriculum source가 달라지면 `learning-content` gate가 실패해야 한다.
