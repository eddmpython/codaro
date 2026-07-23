# 00 Current Baseline

상태: 진행

## 목표

현재 교육과정의 강한 증거, weak-only, 전이, 검색 수치를 동일 source에서 재계산하고 계획 문구와 machine report의 모순을 0으로 만든다.

현재 기준선은 472레슨, strong spec 1,413개·467레슨, weak-only 0, mastery·transfer·retrieval 각각 467레슨이다. 1,400개 solution variant는 실행 실패 0이고 performance claim·명시적 claim scope는 467레슨이다. identity/content 승인은 각 0/472, taxonomy 승인은 0/7, independent assessment 승인은 0/467이다. `curriculum-top-tier-audit` 실패 report와 learning ledger hash가 같은 source 상태를 가리켜야 한다. 감사 점수 9.69는 요구사항 커버리지이며 품질 점수나 완료 근거가 아니다.

종료 조건은 report 재생성, ledger `--check`, PRD 수치 일치, 실패 domain 보존이다. 실패를 숨기거나 minimum score만 넘겨 green으로 바꾸면 종료하지 않는다.

## 영향 파일

- `tests/curriculum/verifyCurriculumTopTierAudit.py`
- `docs/skills/ops/tools/buildLearningLedgers.py`
- `mainPlan/astryx-product-experience/02-learning-method/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/README.md`

## 영향 함수·심볼

- `validAssessmentVariants`, audit `summary`, `actionableGaps`
- `lessonContentHash`, `sourceSetHash`

## 테스트

- `uv run python -X utf8 tests/curriculum/verifyCurriculumTopTierAudit.py`는 현재 미달을 non-zero로 보고해야 한다.
- `uv run python -X utf8 docs/skills/ops/tools/buildLearningLedgers.py --check`
- `uv run python -X utf8 tests/run.py gate plan-quality`

## 롤백

새 감사 규칙이 false positive면 이전 report를 삭제하지 않고 rule과 fixture를 함께 수정한다. 점수 상향이나 실패 항목 삭제로 롤백하지 않는다.

## 평가

### 개발자 관점

모든 수치는 파싱 가능한 report에서 나와야 하며 Markdown 수기 숫자는 report와 대조한다.

### PM 관점

`9.69`는 학습 품질 점수가 아니다. 사용자에게 의미 있는 현재 상태는 467/472 strong lesson, weak-only 0, identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/467이다.
