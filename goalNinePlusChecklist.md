# Codaro 4축 9점대 목표 체크리스트

이 문서는 루트에서 바로 보는 실행 체크리스트다. 목표는 처음 평가한 4개 축을 모두 9점대로 끌어올리는 것이다.

초기 평가:

- 기술 기반: 7.5/10
- 제품 완성도: 5.5/10
- 출시/베타 준비도: 4/10
- 학습 콘텐츠 자산: 8/10

`quality-cycle` 16/16 통과는 강한 증거지만, 그 자체가 4개 축 전부 9점대를 뜻하지 않는다. gate 통과는 아래 4축 점수의 증거 중 하나로만 본다.

## 4축 목표표

| 축 | 현재 판정 | 9점대 조건 | 상태 |
|---|---:|---|---|
| 기술 기반 | 9.0 | backend, runtime, provider loop, diagnostics, launcher gate가 한 cycle에서 통과하고 contract probe가 로케일/프론트 구조를 따라감 | 달성 |
| 학습 콘텐츠 자산 | 9.0 | curriculum matrix, 전체 YAML flow, section card contract, browser card 렌더링이 통과하고 대표 주제가 유지됨 | 달성 |
| 제품 완성도 | 8.8 | 첫 사용자 흐름은 gate로 검증됐고 삭제 원본과 변경 그룹 분류도 확인됐지만, 최종 polish 판정은 clean artifact 전까지 보류 | 미달 |
| 출시/베타 준비도 | 8.4 | launcher/install gate, 삭제 백업, 변경 그룹 분류는 통과했지만, 281개 worktree 변경이 남아 release 후보로 볼 수 없음 | 미달 |

최종 목표는 네 축 모두 9.0 이상이다. 현재는 기술 기반과 콘텐츠 자산은 9점대에 진입했고, 제품 완성도와 출시/베타 준비도는 worktree 정리와 최종 artifact 검증 전까지 9점대로 말하지 않는다.

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
- [ ] 분류된 변경을 실제 커밋 가능한 단위로 정리
- [ ] dirty worktree 상태에서 나온 quality artifact를 clean 또는 명시 변경 단위 상태에서 재생성
- [ ] `uv run python -X utf8 tests/verifyLearningGoalObjectiveAudit.py`에서 `four-axis-goal-checklist`, `latest-quality-cycle-artifacts` 모두 통과
- [ ] 4축 점수 재평가에서 제품 완성도와 출시/베타 준비도 모두 9.0 이상 확인

## 현재 진단

- [x] `preflight` 통과
- [x] `editor-build` 통과
- [x] `landing-build` 통과
- [x] `curriculum-quality-matrix` 통과
- [x] `frontend-performance-budget` 통과
- [x] `learning-system-readiness` 실패 정리
- [x] `product-quality-audit` 실패 정리
- [x] `diagnostic-summary-contract` 실패 정리
- [ ] 대량 변경 worktree 정리
- [x] `quality-cycle` 16/16 통과, `softFailureCount: 0`

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

## 최신 증거

- `output/test-runner/quality-cycle/sequence-summary.json`
- 통과: 16/16 gates
- soft failure: 0
- artifact freshness: 통과
- git head match: 통과
- 소요: 535937ms
- 삭제 원본 로컬 백업: `_backup/removedTracked/marimoAndReactiveApp/` 아래 38개 파일
- 현재 worktree 변경: 281개 항목
- 최신 목표 감사: `verifyLearningGoalObjectiveAudit.py` 실패
- 목표 감사 실패 항목: `four-axis-goal-checklist`, `latest-quality-cycle-artifacts`
- 변경 분류 감사: `worktree-change-classification` 통과, 281개 항목 전부 분류
- 삭제 백업 감사: `tracked-deletion-backup-evidence` 통과, 백업 파일 37개 확인

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

- [ ] 제품 프론트 로케일/진단/워크루프 정리: `editor/src/**`, `tests/verify*Contract.py`
- [ ] 학습 콘텐츠 matrix 보강: `curricula/python/**/*.yaml`, `tests/verifyCurriculumFlowQuality.py`
- [ ] Python 30일 배포 산출물 전환: `notebooks/python30DaysComplete/**`, `_backup/removedTracked/marimoAndReactiveApp/`
- [ ] 문서 포맷 전환: `src/codaro/document/**`, `tests/testDocument*.py`
- [ ] launcher/release evidence: `tests/run.py`, product gate reports
- [ ] generated docs/search 산출물: `landing/src/lib/generated/**`

## 남은 9점대 blocker

1. 삭제 파일 규칙 위반 가능성
   - tracked deletion 37개의 원본은 `_backup/removedTracked/marimoAndReactiveApp/`에 보존했다.
   - `_backup/`은 `.gitignore` 대상이므로 로컬 보존 증거로만 본다.
   - `tracked-deletion-backup-evidence`가 백업 파일 37개와 예상 경로 deletion만 남은 상태를 확인했다.
   - 이 항목만으로는 더 이상 9점대 blocker가 아니지만, 변경 단위 커밋 전에는 출시 후보가 아니다.

2. 대량 dirty worktree
   - 현재 worktree 변경은 281개 항목이다.
   - `worktree-change-classification` 기준으로 미분류 변경은 없다.
   - 커밋 가능한 논리 단위가 아니면 release 후보 판단을 할 수 없다.

3. artifact와 변경 상태의 관계
   - `quality-cycle`은 통과했지만 현재 worktree에는 많은 변경이 섞여 있다.
   - 최종 9점대 선언은 정리된 변경 단위에서 동일 cycle이 다시 통과해야 한다.

4. 4축 점수표 자체의 미달
   - `tests/verifyLearningGoalObjectiveAudit.py`가 `goalNinePlusChecklist.md`의 4축 표를 직접 읽는다.
   - 현재 `제품 완성도 8.8`, `출시/베타 준비도 8.4`와 `미달` 상태 때문에 `four-axis-goal-checklist`가 실패한다.
   - 이 실패가 사라져야 전부 9점대라고 말할 수 있다.

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
- [ ] `four-axis-goal-checklist` 감사 통과
- [ ] `latest-quality-cycle-artifacts` 감사 통과
- [ ] 4축 점수표에서 제품 완성도와 출시/베타 준비도가 9.0 이상
