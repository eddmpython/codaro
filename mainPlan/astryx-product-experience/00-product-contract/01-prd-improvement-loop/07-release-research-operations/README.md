# 07 Release Research Operations

상태: 진행

2026-07-22 source와 machine composition 기준으로 Landing의 primary Web 학습·Run 링크는 `/codaro/run/`을 사용하고 Pages workflow는 `/run/` primary tree와 `/app/` compatibility tree를 각각 빌드한다. 두 tree는 base-bound pyproc asset manifest와 scope별 service-worker cache를 가지며 실제 이중 editor build와 Landing build를 통과했다. 학습 효과는 `E0`~`E3` 경로별 state machine이 현재 content hash, 역할, 표본, unseen measure, 연구 운영 필드를 검사하고 한 경로 실패를 aggregate로 숨기지 않는다. deployed C0 archive·C2 두 release·C3 telemetry와 실제 연구 owner·참가자 report가 없으므로 `completionEligible=false`이며 `_done`이 아니다.

## 목표

`/app/` 호환 종료와 학습효과 검증을 실행 가능한 release milestone으로 바꾼다. 720명 연구를 shell 공개의 단일 blocker로 두지 않고, 경로별 candidate·사용성·학습 신호·효과 검증 상태를 분리한다.

## compatibility release

| milestone | 동작 | 완료 증거 |
| --- | --- | --- |
| C0 | deployed `/codaro/app/` tree를 source commit·response type과 함께 immutable archive로 동결 | release asset URL·SHA-256, deployed crawl 일치 |
| C1 | current `/codaro/run/` build와 hash 검증한 C0 `/codaro/app/` archive를 fresh checkout에서 합성, 새 site-base SW scope 병행 | 실제 URL direct/deep reload와 cold online Python smoke, 두 tree manifest·cache hash, output collision 0 |
| C2 | 다음 stable release에서 `/codaro/app/` compatibility page, workflow 소유 site-base tombstone, query·hash 이동 | 두 release archive, redirect·back/forward·owned-cache·exact unregister report |
| C3 | C2 뒤 28일 telemetry threshold 충족 시 실행 asset retire | threshold report, 삭제 diff, 이전 URL smoke |

GitHub Pages project workflow는 origin root `/serviceWorker.js`를 소유하지 않는다. 새 worker는 `/codaro/run/` scope를 사용하고, origin-root legacy registration은 exact release marker를 확인한 compatibility client만 해제한다. telemetry가 없거나 threshold가 부족하면 workflow가 소유하는 `/codaro/serviceWorker.js`·`/codaro/app/serviceWorker.js` tombstone을 유지한다. 안전한 tombstone 유지 자체는 initiative 완료를 막지 않으며 C3 삭제는 후속 packet으로 남긴다.

현재 Web Python은 pyproc wrapper graph만 same-origin SRI로 배포하고 Python core는 version-pinned CDN에서 자동 fetch한다. C1은 설치 없는 network-first 학습을 보장하며 offline product claim을 하지 않는다. warm-offline을 release capability로 추가하려면 pyproc core integrity manifest의 completeness, versioned cache, 변조 거부와 실제 offline boot evidence를 별도 승인한다.

## 경로별 efficacy 단계

| 단계 | 최소 방법 | 허용 표현·상태 |
| --- | --- | --- |
| E0 construct review | curriculum owner·learning QA 2인 blueprint 검수 | `contentApproved` |
| E1 formative | 경로당 대표 사용자 8명 이상 | `usable`, beta 공개 |
| E2 learning signal | 경로당 초보자 20명 이상, unseen pre/post/transfer | `learningSignal`, 인과효과 표현 금지 |
| E3 confirmatory | 해당 경로 powered active/waitlist, hard floor 60명/arm | `effectVerified`, featured 승격 |

6경로 720명은 Web shell 공개 조건이 아니라 6개 모두를 효과 검증된 featured path로 홍보하는 조건이다. 한 경로가 실패해도 aggregate 평균으로 숨기지 않고 그 경로만 beta로 되돌린다.

research operations는 모집 전에 `researchOwner`, `privacyOwner`, 모집 채널, budget ceiling, 일정, consent·withdrawal UI, randomization service·seed, encrypted raw store, 접근 명단, 90일 deletion job, preregistration URL·hash를 고정한다. 이 값이 없는 E2·E3는 시작하지 않는다.

## 영향 파일

- `mainPlan/astryx-product-experience/04-web-learning/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/README.md`
- `mainPlan/astryx-product-experience/10-quality-release/README.md`
- `docs/skills/ops/product/learning-efficacy-operations.md`
- `src/codaro/curriculum/efficacyStage.py`
- `tests/product/testLearningEfficacyStage.py`
- `tests/product/verifyReleaseResearchOperations.py`
- `tests/product/fixtures/releaseResearch/missing-research-owner.yml`
- `.github/workflows/pages.yml`, `.github/workflows/ci.yml`

## 영향 함수·심볼

- 신규 `CompatibilityMilestone`, `PathReleaseState`, `EfficacyStage`
- 신규 `verifyCompatibilityRelease`, `verifyLearningEfficacyReport`
- 수정 `productReleaseAggregate`, `resolveFeaturedPathStatus`

## 테스트

- C0·C1·C2 archive로 `/codaro/app/` query·hash·back/forward·site-base SW scope·owned-cache round trip
- telemetry 없음·threshold 부족이면 C3 삭제를 거부하고 tombstone 유지
- E0~E3 상태가 evidence 없이 건너뛰지 못하고 content hash 변경 시 stale 처리
- consent withdrawal과 90일 deletion receipt, secret·path redaction
- 한 path 실패가 다른 path 또는 aggregate 평균에 숨겨지지 않음
- `uv run python -X utf8 tests/product/verifyReleaseResearchOperations.py`

## 롤백

- `/codaro/run/` 장애 시 C1 composition manifest와 C0 app archive로 되돌리되 `/codaro/app/` tombstone과 cache ownership을 섞지 않는다.
- E2·E3 실패는 product shell을 내리지 않고 해당 path 표시와 공개 상태만 낮춘다.
- 개인정보 operation 실패 시 연구 모집과 분석을 중단하고 raw store access를 잠근다.

## 평가

### 개발자 관점

- release milestone마다 실제 deployed URL, SW·manifest hash와 rollback archive가 있어야 한다.

### PM 관점

- 엄격한 효과 기준은 유지하되 아직 검증되지 않은 경로를 정직하게 beta로 제공하고, 제품 전체를 끝없는 모집에 묶지 않는다.
