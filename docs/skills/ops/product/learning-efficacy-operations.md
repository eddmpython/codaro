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

학습 경로의 공개 상태는 `src/codaro/curriculum/efficacyStage.py`가 경로별로 판정한다. 여러 경로의 평균이나 전체 참가자 수로 실패한 한 경로를 승격하지 않는다.

| 단계 | 최소 근거 | 허용 claim |
| --- | --- | --- |
| E0 | curriculum owner와 learning QA 승인, 현재 content hash | `contentApproved` |
| E1 | 대표 사용자 8명 이상, usability report | `usable` |
| E2 | 초보자 20명 이상, pre/post/unseen transfer, 완전한 연구 운영 계약 | `learningSignal` |
| E3 | arm당 60명 이상, powered active/waitlist, effect report | `effectVerified` |

E2부터 `researchOwner`, `privacyOwner`, 모집 채널, 예산 상한, 일정, consent, withdrawal route, encrypted raw store, access roster, 90일 deletion job, preregistration URL·hash가 모두 필요하다. 하나라도 없으면 모집과 분석을 시작하지 않는다. content hash가 달라지면 이전 근거는 stale이며, E2는 인과효과 표현을 허용하지 않는다.

검증:

```powershell
uv run pytest -q tests/product/testLearningEfficacyStage.py
uv run python -X utf8 tests/product/verifyReleaseResearchOperations.py
```
