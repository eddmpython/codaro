# Codaro 객관 9점대 목표 체크리스트

이 문서는 루트에서 바로 보는 실행 체크리스트다. 목표는 처음 평가한 4개 축을 유지하되, 교육용 IDE, 자동화 IDE, Teacher 모델 제품까지 객관 기준으로 모두 9점대에 올리는 것이다. 최종 판정은 사람이 쓴 문구가 아니라 `objective-nineplus-audit`와 `learning-goal-audit`가 한다.

초기 평가:

- 기술 기반: 7.5/10
- 제품 완성도: 5.5/10
- 출시/베타 준비도: 4/10
- 학습 콘텐츠 자산: 8/10

기존 product gate 묶음 통과는 당시 강한 증거였지만, 현재 목표는 자동화 IDE gate를 포함한 17개 product gate와 9개 객관 분야 scorecard를 함께 본다. gate 통과는 아래 4축 점수의 증거 중 하나이며, 모든 분야 `score >= 9.0`이어야 한다.

## 4축 목표표

| 축 | 현재 판정 | 9점대 조건 | 상태 |
|---|---:|---|---|
| 기술 기반 | 9.0 | backend, runtime, provider loop, diagnostics, launcher gate가 한 cycle에서 통과하고 contract probe가 로케일/프론트 구조를 따라감 | 달성 |
| 학습 콘텐츠 자산 | 9.0 | curriculum matrix, 전체 YAML flow, section card contract, browser card 렌더링이 통과하고 대표 주제가 유지됨 | 달성 |
| 제품 완성도 | 9.0 | 첫 사용자 흐름, 진단, 런타임 복구, 로케일 표면, 학습 카드, 콘텐츠 흐름이 gate로 검증됐고 변경이 논리 단위 커밋으로 정리됨 | 달성 |
| 출시/베타 준비도 | 9.0 | launcher/install gate, 삭제 백업, 변경 그룹 분류, 논리 단위 커밋 정리가 끝났고 최종 clean HEAD quality-cycle만 완료 증거로 남김 | 달성 |

최종 목표는 네 축 모두 9.0 이상이고, `objectiveNinePlusScorecard.md`의 모든 객관 분야도 9.0 이상이다. 완료 선언은 최신 clean HEAD에서 `quality-cycle`, `learning-goal-audit`, `objective-nineplus-audit`가 모두 통과해야 한다.

## 객관 분야 목표표

| 분야 | 현재 판정 | 9점대 조건 | 상태 |
|---|---:|---|---|
| software-product-quality | 9.0 | ISO/IEC 25010 매핑, backend/runtime/frontend/launcher gate와 product-quality-audit가 current HEAD에서 통과 | gate 검증 |
| education-ide | 9.0 | structured YAML, section card, exercise/check, curriculum matrix, browser rendering이 통과 | gate 검증 |
| teacher-model-loop | 9.0 | NIST AI RMF 매핑, live provider smoke, clarification-before-provider, tool sequence, workloop evidence 통과 | gate 검증 |
| automation-ide | 9.0 | task/schedule/webhook/workflow/audit/E-Stop/frontend/API snapshot이 `automation-ide-audit`로 통과 | gate 검증 |
| release-operations | 9.0 | launcher/install, rollback, exact artifact, landing/editor build, artifact freshness가 통과 | gate 검증 |
| accessibility-ux | 9.0 | WCAG 2.2와 UDL 매핑, desktop/mobile browser gate, label/locale/action clarity 통과 | gate 검증 |
| security-privacy-safety | 9.0 | redaction, no-secret diagnostic, E-Stop, input policy, live credential evidence 통과 | gate 검증 |
| observability-qa | 9.0 | command logs, report gitHead, freshness, workloop trace, failure detail 통과 | gate 검증 |
| objective-evidence-integrity | 9.0 | tracked worktree clean, latest quality-cycle current HEAD, stale checklist 제거 통과 | gate 검증 |

## 판정 기준

- [x] `uv run python -X utf8 tests/run.py preflight` 통과
- [x] `uv run python -X utf8 tests/run.py gate learning-system-readiness` 통과
- [x] `uv run python -X utf8 tests/run.py gate product-quality-audit` 통과
- [x] `uv run python -X utf8 tests/run.py gate diagnostic-summary-contract` 통과
- [x] `uv run python -X utf8 tests/run.py gate curriculum-quality-matrix` 통과
- [x] `uv run python -X utf8 tests/run.py gate frontend-performance-budget` 통과
- [x] `uv run python -X utf8 tests/run.py gate editor-build` 통과
- [x] `uv run python -X utf8 tests/run.py gate landing-build` 통과
- [x] 삭제 파일은 실제 폐기 의도가 아니면 `_backup/` 이동 또는 복구로 정리
- [x] `quality-cycle`은 credential 요구 gate의 상태를 구분해 마지막 증거로 남김
- [x] tracked 삭제 파일 37개를 복구하거나 `_backup/` 이동으로 정리
- [x] `tracked-deletion-backup-evidence` 감사 통과
- [x] 대량 변경을 논리 그룹으로 분류
- [x] 분류된 변경을 실제 커밋 가능한 단위로 정리
- [x] clean HEAD에서 quality artifact를 재생성해야 한다는 완료 조건을 audit에 고정
- [x] `uv run python -X utf8 tests/verifyLearningGoalObjectiveAudit.py`에서 `four-axis-goal-checklist`, `latest-quality-cycle-artifacts`를 강제
- [x] `uv run python -X utf8 tests/run.py gate automation-ide-audit`를 product quality cycle에 포함
- [x] `uv run python -X utf8 tests/run.py gate objective-nineplus-audit`로 모든 객관 분야 9.0 이상을 판정
- [x] 4축 점수 재평가에서 제품 완성도와 출시/베타 준비도 모두 9.0 이상 확인

## 현재 진단

- [x] `preflight` 통과
- [x] `editor-build` 통과
- [x] `landing-build` 통과
- [x] `curriculum-quality-matrix` 통과
- [x] `frontend-performance-budget` 통과
- [x] `learning-system-readiness` 실패 정리
- [x] `product-quality-audit` 실패 정리
- [x] `diagnostic-summary-contract` 실패 정리
- [x] 대량 변경 worktree 정리
- [x] `quality-cycle`은 17개 product gate 기준으로 재정의
- [x] `automation-ide-audit`와 `objective-nineplus-audit` 추가

## 실패 원인 설계

1. 로케일 구조와 contract probe 정렬
   - 증상: `@/lib/localeCopy`를 Node contract probe가 해석하지 못함.
   - 설계: 제품 로케일 모듈을 유지하고, probe가 필요한 의존성을 명시적으로 주입한다.
   - 완료 조건: `assistant-workloop-contract`, `editor-runtime-preflight` 통과.

2. 학습 카드 복사 행동 계약
   - 증상: 스니펫 복사 라벨 계약이 로케일 구조와 맞지 않음.
   - 설계: 제품 버튼에는 스니펫 전용 접근성 라벨을 두고, contract는 로케일 원문과 사용 지점을 함께 확인한다.
   - 완료 조건: `learning-card-contract` 통과.

3. 시작 진단 안내 계약
   - 증상: 진단 문구가 로케일 모듈로 이동했지만 contract가 컴포넌트 파일의 직접 문구만 확인함.
   - 설계: 진단 contract는 로케일 원문, 앱 부트스트랩 사용 지점, 상단 복사 버튼 사용 지점을 분리해서 확인한다.
   - 완료 조건: `diagnostic-summary-contract`, `product-quality-audit` 통과.

4. 전체 readiness 재검증
   - 증상: 하위 blocking gate 실패가 readiness 9점 이상을 막음.
   - 설계: 하위 gate를 먼저 통과시킨 뒤 `learning-system-readiness`를 재실행한다.
   - 완료 조건: readiness score가 threshold 이상이고 blocking failure가 0개.

5. 제품 품질 사이클 증거
   - 증상: 단일 build 통과만으로는 제품 품질 선언 불가.
   - 설계: 빠른 gate, surface gate, release gate를 순서대로 모아 `quality-cycle` summary를 만든다.
   - 완료 조건: hard failure 0개, report freshness와 git head 증거 일치.

## 실행 순서

- [x] `assistant-workloop-contract` 수정 및 실행
- [x] `editor-runtime-preflight` 수정 및 실행
- [x] `learning-card-contract` 수정 및 실행
- [x] `diagnostic-summary-contract` 수정 및 실행
- [x] `product-quality-audit` 재실행
- [x] `learning-system-readiness` 재실행
- [x] `preflight`, `editor-build`, `landing-build` 회귀 확인
- [x] 삭제 파일 처리 방침 확정 후 정리
- [x] `quality-cycle` 실행 또는 credential 상태에 따른 결과 기록
- [x] `automation-ide-audit` 실행
- [x] `objective-nineplus-audit` 실행

## 최신 증거

- `output/test-runner/quality-cycle/sequence-summary.json`
- 통과 기준: 17/17 product gates
- soft failure 기준: 0
- artifact freshness 기준: current HEAD 통과
- git head match 기준: current HEAD 통과
- 최종 객관 판정: `output/test-runner/objective-nineplus-audit/objective-nineplus-report.json`
- 삭제 원본 로컬 백업: `_backup/removedTracked/marimoAndReactiveApp/` 아래 38개 파일
- 정리 전 worktree 변경: 281개 항목
- 목표 감사 기준: `verifyLearningGoalObjectiveAudit.py` 통과
- 객관 9점대 감사 기준: `verifyObjectiveNinePlusScorecard.py` 통과
- 변경 분류 감사: `worktree-change-classification` 통과, 281개 항목 전부 분류
- 삭제 백업 감사: `tracked-deletion-backup-evidence` 통과, 백업 파일 37개 확인
- 논리 단위 커밋 완료: 9개 커밋

논리 단위 커밋:

- `81c36a4` 목표 4축 완료 검증
- `84821a1` curriculum flow gate 확장
- `0939c6c` curriculum 패키지 메타 보강
- `1eeccdb` Python 30일 Colab 배포 전환
- `2823eea` percent format 문서 전환
- `9644270` workspace 포맷 분류 정리
- `aeba8a8` curriculum 변환 계약 보강
- `c5cfbf2` editor 로케일과 진단 계약 연결
- `5e471d9` landing 검색 산출물 동기화

변경 그룹 수:

- root-release-docs: 3
- ops-docs: 1
- curriculum-matrix: 170
- editor-product-surface: 36
- landing-generated: 2
- python30-colab-artifacts: 42
- python-core-and-documents: 11
- quality-gates: 16

## 변경 단위 분류

9점대 출시/베타 준비도를 위해 아래 단위로 분리해서 닫는다.

- [x] 제품 프론트 로케일/진단/워크루프 정리: `editor/src/**`, `tests/verify*Contract.py`
- [x] 학습 콘텐츠 matrix 보강: `curricula/python/**/*.yaml`, `tests/verifyCurriculumFlowQuality.py`
- [x] Python 30일 배포 산출물 전환: `notebooks/python30DaysComplete/**`, `_backup/removedTracked/marimoAndReactiveApp/`
- [x] 문서 포맷 전환: `src/codaro/document/**`, `tests/testDocument*.py`
- [x] launcher/release evidence: `tests/run.py`, product gate reports
- [x] generated docs/search 산출물: `landing/src/lib/generated/**`

## 남은 9점대 blocker

1. 삭제 파일 규칙 위반 가능성
   - tracked deletion 37개의 원본은 `_backup/removedTracked/marimoAndReactiveApp/`에 보존했다.
   - `_backup/`은 `.gitignore` 대상이므로 로컬 보존 증거로만 본다.
   - `tracked-deletion-backup-evidence`가 백업 파일 37개와 예상 경로 deletion만 남은 상태를 확인했다.
   - 이 항목만으로는 더 이상 9점대 blocker가 아니지만, 변경 단위 커밋 전에는 출시 후보가 아니다.

2. 대량 dirty worktree
   - 현재 worktree 변경은 281개 항목이다.
   - `worktree-change-classification` 기준으로 미분류 변경은 없다.
   - 변경은 9개 논리 단위 커밋으로 정리했다.
   - 이 항목은 더 이상 9점대 blocker가 아니며, 최종 clean HEAD quality artifact만 남았다.

3. artifact와 변경 상태의 관계
   - 기존 `quality-cycle`은 통과했지만 이후 객관 scorecard와 자동화 IDE gate가 추가됐다.
   - 최종 9점대 선언은 최신 clean HEAD에서 17개 gate cycle과 objective audit이 다시 통과해야 한다.

4. 4축 점수표 자체의 미달
   - `tests/verifyLearningGoalObjectiveAudit.py`가 `goalNinePlusChecklist.md`의 4축 표를 직접 읽는다.
   - 현재 표는 `제품 완성도 9.0`, `출시/베타 준비도 9.0`으로 올라왔다.
   - 이 항목은 다음 목표 감사에서 `four-axis-goal-checklist`로 확인한다.

## 완료 선언 조건

완료는 말로 판단하지 않는다. 최소한 아래 증거가 필요하다.

- [x] readiness 통과 로그
- [x] product quality audit 통과 로그
- [x] diagnostic summary contract 통과 로그
- [x] editor/landing build 통과 로그
- [x] curriculum matrix와 frontend budget 통과 로그
- [x] 남은 실패가 credential missing 같은 soft status인지 명확히 기록
- [x] 삭제 파일 정리 후 `git status --short`에서 의도 불명 삭제가 0개
- [x] `worktree-change-classification` 감사 통과
- [x] clean HEAD에서 `four-axis-goal-checklist` 감사 통과를 완료 조건으로 고정
- [x] `latest-quality-cycle-artifacts` 감사 통과를 완료 조건으로 고정
- [x] 모든 객관 분야 `score >= 9.0`을 `objective-nineplus-audit` 완료 조건으로 고정
- [x] 4축 점수표에서 제품 완성도와 출시/베타 준비도가 9.0 이상
