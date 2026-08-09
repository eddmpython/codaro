---
id: learning-efficacy-operations
title: 학습 효과 검증 운영
description: Gate learning-path efficacy claims by stage, current content hash, participant evidence, and research operations.
category: ops
section: product
order: 95
purpose: 경로별 학습 효과 claim이 사람 근거와 연구 운영 계약보다 앞서 승격되지 않게 한다.
whenToUse: 학습 경로 beta·featured 상태, formative study, learning signal, confirmatory effect 검증을 판단할 때.
---

# Learning Efficacy Operations

학습 경로의 machine publication과 사람 학습 효과는 별도 축이다. `pathPromotion.py`와 `machinePublication.py`는 current content와 capability contract로 `golden | candidate | unavailable`을 파생한다. `efficacyStage.py`는 사람 근거만 판정한다. 여러 경로의 평균이나 전체 참가자 수로 실패한 한 경로를 승격하지 않는다.

| 단계 | 최소 근거 | 허용 claim |
| --- | --- | --- |
| M0 | 경로 구조, assurance·transfer·retrieval, application artifact, solution과 mutation 실행, 저작 무결성 | `machineVerified`, machine golden 허용 |
| E0 | curriculum owner와 learning QA 승인, 현재 content hash | `contentApproved` |
| E1 | 대표 사용자 8명 이상, usability report | `usable` |
| E2 | 초보자 20명 이상, pre/post/unseen transfer, 완전한 연구 운영 계약 | `learningSignal` |
| E3 | arm당 60명 이상, powered active/waitlist, effect report | `effectVerified` |

E2부터 `researchOwner`, `privacyOwner`, 모집 채널, 양수 예산 상한, 일정, consent, withdrawal route, encrypted raw store, access roster, 정확히 90일인 deletion job, preregistration URL·hash가 모두 필요하다. consent, withdrawal 동작, deletion job, secret·사용자 path redaction은 각각 SHA-256 receipt를 남긴다. owner 두 역할은 서로 달라야 하며 운영 계약에 secret, email, 사용자 filesystem path가 들어가면 실패한다. 하나라도 없으면 모집과 분석을 시작하지 않는다. content hash가 달라지면 이전 근거는 stale이며, E2는 인과효과 표현을 허용하지 않는다.

`PathPromotionState`의 `publicationState: golden`은 제품 내부 실행, 평가, version compatibility와 결과물 계보가 닫혔다는 뜻이다. 사람 학습 효과를 뜻하지 않으며 허용 claim은 `machineVerified`를 넘지 않는다. E0부터 E3는 별도 efficacy 축에 남고, `effectVerified`는 current-content E3에서만 허용한다. 기본 진입의 `검증된 기본 경로`는 machine golden을 읽을 수 있지만 사람 효과가 검증됐다고 표현하지 않는다.

`src/codaro/releaseResearch.py`의 `CompatibilityMilestone`과 `verifyCompatibilityRelease`는 C0부터 목표 milestone까지 증거를 누적 검증한다. C1은 frozen `/app/`과 current `/run/` tree 분리, 하위 service worker scope, direct/deep reload, cold online Python, output collision 0을 요구한다. C2는 서로 다른 stable release 두 개, query·hash·back/forward, workflow 소유 cache와 두 tombstone path, exact release marker unregister를 요구한다. C3 telemetry threshold policy는 관측 전에 canonical hash로 봉인돼야 하고, 28일 이상 관측과 봉인된 표본·legacy request rate threshold를 만족한 뒤에만 asset retirement를 허용한다.

검증:

```powershell
uv run pytest -q tests/product/testLearningEfficacyStage.py tests/product/testReleaseResearchCompatibility.py tests/product/testReleaseResearchOperations.py
uv run python -X utf8 tests/product/verifyReleaseResearchOperations.py
uv run python -X utf8 tests/run.py gate path-promotion-readiness
```
