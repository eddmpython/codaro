# 05 Python Foundations Assessment

상태: 진행

## 목표

Python 30 Days를 읽고 실행하는 카드 모음에서, 각 레슨이 `mastery -> transfer -> 24h retrieval`로 이어지는 실제 학습 경로로 바뀌게 한다. mastery는 기본 레슨 끝에 보이고, 전이는 mastery strong evidence 저장 직후, 검색은 최소 24시간 뒤 별도 확인 클릭 없이 자동 제공한다.

## 현재 구현

Day 1은 출력 mastery, 새로운 보고 상태 전이, 24시간 출력 검색을 가진다. Day 2~30은 변수·컬렉션·제어 흐름·함수·파일·예외·클래스·제너레이터·알고리즘·캡스톤에 대해 서로 다른 행동 과제 87개를 가진다. 각 과제는 한 예시 출력만 비교하지 않고 함수 본문을 여러 격리 입력으로 다시 호출하며, Day 19는 fixture 파일과 생성 경로, Day 20은 예상 예외, Day 30은 두 CSV fixture와 서로 다른 JSON 산출 경로까지 검증한다. 저자 solution은 materialize 전에 전 사례를 실행 검산했다.

Day 2·11·15·19·20·22·27·30 대표 progression, Seaborn semantic artifact capstone과 pathlib·zip·schedule base·assessment Web·Local 흐름, canonical lesson binding, retrieval fixture와 Day 19 archive artifact transfer를 포함한 공식 63-case Chromium 행렬은 63/63으로 통과했다. 이 통합 green은 사람 대상 학습성이나 모든 Day의 개별 브라우저 증거를 대신하지 않는다.

현재 전체 machine audit는 strong 467/472, strong spec 1,413, weak-only 0, mastery/transfer/retrieval 각각 467/472다. Python Foundations 100레슨에는 세 단계 assessment source가 저작됐지만 대표 browser progression과 전체 source coverage는 동일한 증거가 아니다. independent assessment 승인 0/467, 사람 학습성 검수와 독립 R10 조건이 남아 있으므로 이 패킷은 `_done`이 아니다. 다음 범위는 사람 검수와 독립 평가다.

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
- `CODARO_PRODUCT_CASE=web-day2-progression-desktop uv run --with playwright python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
- `uv run python -X utf8 tests/curriculum/verifyCurriculumTopTierAudit.py`는 전체 이관 전까지 의도적으로 실패해야 한다.

## 롤백

특정 과제가 잘못된 개념이나 반환 계약을 검사하면 해당 레슨의 세 variant만 제거하고 이전 weak check를 strong으로 승격하지 않는다. 자동 queue 결함이면 이미 저장된 append-only evidence는 보존하고 candidate materializer만 비활성화한다.

## 평가

### 개발자 관점

fixture hash, check ID, solution 실행 결과, TypeScript/Python materializer가 같은 계약을 해석해야 한다. 하드코딩한 한 입력이 아니라 적어도 두 개의 독립 case로 검증하고, 전이와 검색은 mastery와 다른 문제를 사용한다.

### PM 관점

성공 지표는 카드 열람이나 확인 클릭이 아니라 예시 없이 완성한 mastery, 새 조건 전이, 시간이 지난 검색의 실제 strong evidence다. Day 1~30 전수 저자 검수와 브라우저 표본이 끝나기 전에는 Python Foundations 완료나 공개 품질을 주장하지 않는다.

## 완료 처리

Day 1~30의 세 평가 단계 source, solution 실행 검산과 최신 63/63 브라우저 표본은 확보됐다. independent assessment 승인, 사람 학습성 검수, 독립 R10과 실제 Local WebView2 artifact parity가 현재 범위를 승인할 때만 `_done`으로 이동한다.
