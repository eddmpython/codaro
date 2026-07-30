# 09 Learning Quality Revalidation

상태: 진행

## 목표

부분 테스트의 성공을 제품 전체 통과로 부르지 않는다. 현재 저장소의 실제 수치를 기준선으로 다시 고정하고, 학습자가 다운로드 없이 Web에서 숙달 과제, 처음 보는 전이 과제, 시간이 지난 검색 과제를 별도 확인 클릭 없이 수행하게 한다. W0 Local 동등성과 독립 평가는 공개·완료 판정을 막지만, 명시적으로 저작하고 실행 검산한 경로별 품질 개선은 멈추지 않는다.

## 현재 판정

2026-07-28 `curriculum-top-tier-audit`는 실패다. 요구사항 커버리지 점수는 품질 점수가 아니며 `score: 9.69/10`, `curriculumQualityScore: null`, `topTierEligible: false`, `completionEligible: false`다. 472레슨 중 strong `CheckSpec` 레슨은 468개, strong spec은 1,419개, weak-only 레슨은 0이다. mastery·unseen transfer·delayed retrieval author 계약과 performance claim·명시적 claim scope는 각각 468레슨이며 independent assessment 승인은 0/468이다. 유일한 실패 requirement는 독립 평가 승인이다.

Day 1 Web vertical slice에서는 mastery strong evidence 뒤 전이 과제가 자동 제공되고, 검색 과제는 유효한 원천 증거로부터 24시간 뒤 자동 제공된다. 현재 468레슨의 1,402개 solution variant는 1,400개 behavior와 2개 output 검증으로 실행됐고 실패는 0이다. 공식 `product-experience-browser` 83/83과 `local-studio-browser` 28/28은 Day 2·11·15·19·20·22·27·30의 오답→수정→격리 검증→근거 저장→전이 자동 해제, Seaborn semantic artifact capstone, pathlib·zip·schedule base·assessment, canonical `MasteryPolicy@1`, durable `RunRouteState@1`, full learning archive v2, Day 19 artifact transfer와 lessonRef 기반 시각 자료 배선을 포함해 green이다. Git 첫 사이클의 4개 실행 Lab과 첫 status 판독 Web strong check도 별도 브라우저 검증에서 통과했다. 최신 browser log의 `ConnectionReset`, `Proactor`, `Win10054`도 모두 0이다. 설치형 네이티브 WebView2 9/9도 current source commit에서 통과했다. 다만 identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/468, 수동 접근성 0/6, 사용자 연구 0/12, 제품 디자인·접근성 독립 검토 0/2와 독립 R10 raw report가 없으므로 완료는 아니다.

대표 6경로는 `path-promotion-readiness`에서 경로 구조, mastery·transfer·retrieval, capstone artifact, solution 실행, 저작 무결성의 M0 기계 준비 6/6을 통과했다. 이 결과는 효능 증거가 아니다. 현재 R10 round는 준비되지 않았고 사람 효능 근거도 없으므로 공개 승격은 0/6, provisional은 6/6이다. E0-E3 표본·독립성·연구 운영 조건은 `08-learning-content`, `10-quality-release`와 release gate가 계속 소유한다.

## 작업 패킷

| 순서 | packet | 종료 조건 |
| --- | --- | --- |
| 01 | [day1-evidence-loop](01-day1-evidence-loop/) | acquisition·unseen transfer·24h retrieval이 Web에서 자동 판정·저장·재방문을 통과 |
| 02 | [w0-local-parity](02-w0-local-parity/) | Local strong check와 artifact archive가 같은 event 계약으로 동작 |
| 05 | [python-foundations-assessment](05-python-foundations-assessment/) | Day 1~30 mastery·transfer·retrieval이 저작 검수·실행 검산·브라우저 표본을 통과 |

## 루프

1. machine audit를 실행하고 실패 수치를 그대로 기준선에 기록한다.
2. 가장 작은 실제 학습 여정 하나를 구현한다. ID나 빈 배열만 추가한 계약은 증거가 아니다.
3. 오답, 수정, 강한 판정, 증거 저장, reload, Web·Local 이관을 실제 브라우저와 저장소에서 검증한다.
4. 감사와 원장을 다시 생성한다. 실패가 남으면 상태를 `진행`으로 유지한다.
5. current commit 증거를 독립 평가에 제출한다. 작성자가 점수나 결론을 지정하지 않는다.
6. P0·P1이 재현되지 않고 패킷 종료 조건이 모두 충족된 경우에만 해당 폴더를 TODO를 삭제한다.

## 완료 금지 조건

- `strong-evidence-transfer-and-retrieval` domain이 실패한다.
- Local-native Python provisional sandbox는 Day 1과 W0 filesystem·zip·schedule base·assessment solution을 판정한다. launcher AppContainer broker는 실행별 ACL receipt v2, 공유 DACL mutex, 회수 실패 보존과 startup stale GC를 구현했고 현재 Windows 11 직접 OS 경계 test와 동시 cold `schedule` package snapshot 검사가 통과한다. 목표 Windows 10 설치본 conformance가 없어 `practice` 피드백만 제공하고 Local strong event는 0건이다. Web behavior도 `localRequired`로 strong event 0을 유지한다. Web strong·legacy migration 2건의 archive를 Local이 가져오고 재내보내도 Web runtime identity와 exact event set이 보존된다.
- schedule package asset descriptor와 document, drafts, 전체 virtual FS/package bytes는 full learning archive v2에 봉인된다. 현재 Windows 11 설치형 wheel·launcher·WebView2에서 Web-origin archive의 Local import, reload, re-export와 disabled automation adoption은 green이다. 다만 실제 공개 Web export에서 시작해 Local을 거쳐 Web에 재수입하는 round trip과 독립 보안 검수가 없다.
- 독립 R10 원본 report와 fact audit가 없다.
- 472개 확장이 내용 없는 자동 ID, 동일 문제 복제, weak check의 strong 재분류 방식이다.

## 테스트

- `uv run python -X utf8 tests/curriculum/verifyCurriculumTopTierAudit.py`
- `uv run python -X utf8 tests/learning/verifyLearningSectionCardContract.py`
- `uv run python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
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

## TODO 삭제 조건

각 하위 packet은 자체 증거가 모두 green일 때만 해당 TODO를 삭제한다. 남은 하위 TODO가 모두 삭제되고 독립 R10이 현재 commit을 승인하기 전에는 이 packet도, 상위 PRD loop도 완료가 아니다.
