# 05 Python Foundations Assessment

상태: 진행

## 목표

Python 30 Days를 읽고 실행하는 카드 모음에서, 각 레슨이 `mastery -> transfer -> 24h retrieval`로 이어지는 실제 학습 경로로 바뀌게 한다. mastery는 기본 레슨 끝에 보이고, 전이는 mastery strong evidence 저장 직후, 검색은 최소 24시간 뒤 별도 확인 클릭 없이 자동 제공한다.

## 남은 조건

- Day 1~30을 사람 학습성 기준으로 전수 검수한다.
- Python Foundations assessment를 독립 검수자가 승인한다.
- 실제 Local WebView2 artifact parity를 검수한다.
- 독립 R10이 현재 범위를 승인한 뒤 이 TODO와 parent index 링크를 삭제한다.

## 영향 파일

- `curricula/python/basics/30days/day01_헬로월드.yaml`
- `curricula/python/basics/30days/day02_*.yaml`~`day30_*.yaml`
- `docs/skills/ops/tools/upgradePython30DaysAssessments.py`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/components/curriculum/curriculumSurface.tsx`
- `src/codaro/curriculum/converter.py`
- `tests/curriculum/verifyCurriculumTopTierAudit.py`
- `tests/surface/verifyProductExperiencePlaywright.py`

## 영향 함수·심볼

- `registryAssessmentBlocks`, `dueAssessmentBlocks`
- `masteryVariants`, `transferVariants`, `retrievalVariants`
- `validAssessmentVariants`, `learningEvidenceProfile`
- `upgradePython30DaysAssessments.validate_blueprints`

## 테스트

- `uv run python -X utf8 docs/skills/ops/tools/upgradePython30DaysAssessments.py`
- `uv run pytest tests/curriculum/testCurriculumSectionContract.py -q`
- `uv run python -X utf8 tests/learning/verifyLearningSectionCardContract.py`
- `CODARO_PRODUCT_CASE=web-day2-progression-desktop uv run python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
- `uv run python -X utf8 tests/curriculum/verifyCurriculumTopTierAudit.py`는 전체 이관 전까지 의도적으로 실패해야 한다.

## 롤백

특정 과제가 잘못된 개념이나 반환 계약을 검사하면 해당 레슨의 세 variant만 제거하고 이전 weak check를 strong으로 승격하지 않는다. 자동 queue 결함이면 이미 저장된 append-only evidence는 보존하고 candidate materializer만 비활성화한다.

## 평가

### 개발자 관점

fixture hash, check ID, solution 실행 결과, TypeScript/Python materializer가 같은 계약을 해석해야 한다. 하드코딩한 한 입력이 아니라 적어도 두 개의 독립 case로 검증하고, 전이와 검색은 mastery와 다른 문제를 사용한다.

### PM 관점

성공 지표는 카드 열람이나 확인 클릭이 아니라 예시 없이 완성한 mastery, 새 조건 전이, 시간이 지난 검색의 실제 strong evidence다. Day 1~30 전수 저자 검수와 브라우저 표본이 끝나기 전에는 Python Foundations 완료나 공개 품질을 주장하지 않는다.
