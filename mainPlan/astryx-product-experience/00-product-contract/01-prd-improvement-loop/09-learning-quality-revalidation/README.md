# 09 Learning Quality Revalidation

상태: 진행

## 목표

부분 테스트의 성공을 제품 전체 통과로 부르지 않는다. 현재 저장소의 실제 수치를 기준선으로 다시 고정하고, 학습자가 다운로드 없이 Web에서 숙달 과제, 처음 보는 전이 과제, 시간이 지난 검색 과제를 별도 확인 클릭 없이 수행하게 한다. W0 Local 동등성과 독립 평가는 공개·완료 판정을 막지만, 명시적으로 저작하고 실행 검산한 경로별 품질 개선은 멈추지 않는다.

## 현재 판정

2026-07-22 `curriculum-top-tier-audit`는 실패다. 요구사항 커버리지 점수는 품질 점수가 아니며 `score: 9.69/10`, `curriculumQualityScore: null`, `topTierEligible: false`, `completionEligible: false`다. 472레슨 중 strong `CheckSpec` 레슨은 467개, strong spec은 1,413개, weak-only 레슨은 0이다. mastery·unseen transfer·delayed retrieval author 계약과 performance claim·명시적 claim scope는 각각 467레슨이며 independent assessment 승인은 0/467이다. 유일한 실패 requirement는 독립 평가 승인이다.

Day 1 Web vertical slice에서는 mastery strong evidence 뒤 전이 과제가 자동 제공되고, 검색 과제는 유효한 원천 증거로부터 24시간 뒤 자동 제공된다. 현재 467레슨의 1,400개 solution variant는 1,398개 behavior와 2개 output 검증으로 실행됐고 실패는 0이다. 공식 `product-experience-browser` 63/63과 `local-studio-browser` 26/26은 Day 2·11·15·19·20·22·27·30의 오답→수정→격리 검증→근거 저장→전이 자동 해제, Seaborn semantic artifact capstone, pathlib·zip·schedule base·assessment, canonical `MasteryPolicy@1`, durable `RunRouteState@1`, full learning archive v2와 Day 19 artifact transfer를 포함해 green이다. 최신 browser log의 `ConnectionReset`, `Proactor`, `Win10054`도 모두 0이다. 다만 identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/467, 실제 WebView2와 독립 R10 raw report가 없으므로 완료는 아니다.

## 작업 패킷

| 순서 | packet | 종료 조건 |
| --- | --- | --- |
| 00 | [current-baseline](00-current-baseline/) | 감사 수치와 실패 항목이 machine report·PRD에 동일하게 기록됨 |
| 01 | [day1-evidence-loop](01-day1-evidence-loop/) | acquisition·unseen transfer·24h retrieval이 Web에서 자동 판정·저장·재방문을 통과 |
| 02 | [w0-local-parity](02-w0-local-parity/) | Local strong check와 artifact archive가 같은 event 계약으로 동작 |
| 03 | [independent-r10-input](03-independent-r10-input/) | current commit의 원본 증거만 blind evaluator 입력 manifest에 봉인됨 |
| 04 | [post-r10-path-review-and-promotion](04-post-r10-path-expansion/) | R10 green 뒤 선행 구현된 대표 경로의 author review·효능 검증·공개 승격 순서가 승인됨 |
| 05 | [python-foundations-assessment](05-python-foundations-assessment/) | Day 1~30 mastery·transfer·retrieval이 저작 검수·실행 검산·브라우저 표본을 통과 |

## 루프

1. machine audit를 실행하고 실패 수치를 그대로 기준선에 기록한다.
2. 가장 작은 실제 학습 여정 하나를 구현한다. ID나 빈 배열만 추가한 계약은 증거가 아니다.
3. 오답, 수정, 강한 판정, 증거 저장, reload, Web·Local 이관을 실제 브라우저와 저장소에서 검증한다.
4. 감사와 원장을 다시 생성한다. 실패가 남으면 상태를 `진행`으로 유지한다.
5. current commit 증거를 독립 평가에 제출한다. 작성자가 점수나 결론을 지정하지 않는다.
6. P0·P1이 재현되지 않고 패킷 종료 조건이 모두 충족된 경우에만 해당 폴더를 `_done`으로 이동한다.

## 완료 금지 조건

- `strong-evidence-transfer-and-retrieval` domain이 실패한다.
- Local-native Python sandbox는 Day 1과 W0 filesystem·zip·schedule 12개 base 및 3개 assessment behavior, Local strong event 16건과 Web strong·legacy migration을 합친 mixed archive 18건을 통과했고 Local fileOps/zip artifact descriptor를 event payload hash에 봉인한다. 다만 경합 없는 cold package 준비와 Windows AppContainer conformance가 없다.
- schedule package asset descriptor와 document, drafts, 전체 virtual FS/package bytes는 full learning archive v2에 봉인된다. 다만 실제 설치본 Web-to-Local-to-Web round trip과 독립 보안 검수가 없다.
- 독립 R10 원본 report와 fact audit가 없다.
- 472개 확장이 내용 없는 자동 ID, 동일 문제 복제, weak check의 strong 재분류 방식이다.

## 테스트

- `uv run python -X utf8 tests/curriculum/verifyCurriculumTopTierAudit.py`
- `uv run python -X utf8 tests/learning/verifyLearningSectionCardContract.py`
- `uv run --with playwright python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
- `uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check`
- `uv run python -X utf8 tests/run.py gate plan-quality`
- `git diff --check`

## 영향 파일

- `curricula/python/**/*.yaml`: strong mastery·transfer·retrieval author 계약
- `editor/src/lib/curriculaRegistry.ts`, `editor/src/components/curriculum/curriculumSurface.tsx`: Web materializer와 자동 due queue
- `src/codaro/curriculum/`: Local executor·archive·evidence 경계
- `tests/curriculum/`, `tests/learning/`, `tests/surface/`: 감사와 실제 브라우저 증거
- `mainPlan/astryx-product-experience/`: current baseline과 독립 평가 입력

## 영향 함수·심볼

- `registryAssessmentBlocks`, `dueAssessmentBlocks`, `appendWebStrongCheckEvidenceTransaction`
- `LearningEvidenceArchiveStore`, `LearningSectionContract`, `yamlToDocument`
- `validAssessmentVariants`, `runBrowserMatrix`, `PrdEvaluationReport`

## 롤백

- variant 계약이 잘못되면 해당 레슨 variant와 materializer 변경을 함께 되돌리고 weak check로 자동 강등하지 않는다.
- archive schema 변경은 기존 event를 삭제하지 않고 새 reader의 downgrade-safe 검증을 먼저 둔다.
- 독립 평가가 이전 결함을 재현하면 점수를 덮어쓰지 않고 packet을 진행 또는 차단으로 되돌린다.

## 평가

### 개발자 관점

Python과 TypeScript materializer가 같은 YAML을 다르게 해석하지 않아야 하며 정적 계약과 실제 browser case를 함께 둔다. 한 레슨 성공을 472개 지원으로 확장하지 않는다.

### PM 관점

핵심 지표는 클릭 수나 레슨 열람 수가 아니라 오답 수정 뒤 강한 검증, 새 조건 전이, 시간이 지난 검색 수행이다. due 학습은 사용자가 펼치지 않아도 맥락 안에 자동 제공한다.

## 완료 처리

각 하위 packet은 자체 증거가 모두 green일 때만 이 폴더의 `_done/`으로 이동한다. 00~05가 모두 이동하고 독립 R10이 현재 commit을 승인하기 전에는 이 packet도, 상위 PRD loop도 완료가 아니다.
