# 01 Day 1 Evidence Loop

상태: 진행

## 목표

Day 1에서 숙달, 처음 보는 전이, 24시간 지연 검색을 하나의 Web evidence 흐름으로 실제 실행하고 별도 확인 클릭 없이 자동 제공·판정·저장한다.

Day 1의 mastery, unseen transfer, 24시간 delayed retrieval을 하나의 Web evidence 흐름으로 검증한다. 전이는 mastery strong evidence가 저장되기 전에는 렌더하지 않고, retrieval은 원천 strong evidence가 due가 되기 전에는 렌더하지 않는다. 둘 다 조건이 충족되면 자동으로 나타나며 별도 확인·펼치기 버튼을 만들지 않는다.

Day 2·11·15·19·20·22·27·30 progression, Seaborn semantic artifact capstone, pathlib·zip·schedule base·assessment Web·Local flow, Local 자동 evidence append와 Day 19 archive transfer를 포함한 공식 63-case Chromium 매트릭스는 63/63으로 통과했다. 남은 종료 조건은 current commit report 봉인, Day 1 사람 학습성 검수, independent assessment 승인과 독립 평가 입력 연결이다. 따라서 `_done`이 아니다.

## 영향 파일

- `curricula/python/basics/30days/day01_헬로월드.yaml`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/components/curriculum/curriculumSurface.tsx`
- `editor/src/lib/webLearningEvidence.ts`
- `tests/surface/verifyProductExperiencePlaywright.py`

## 영향 함수·심볼

- `registryAssessmentBlocks`, `blocksFromLearningSections`
- `dueAssessmentBlocks`, `readLearningEvidenceEvents`, `sectionStrongCheckId`
- `appendWebStrongCheckEvidenceTransaction`, `listWebStrongCheckEvidence`

## 테스트

- `npm run check --prefix editor`
- `npm run build --prefix editor`
- `uv run python -X utf8 tests/learning/verifyLearningSectionCardContract.py`
- `uv run --with playwright python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`

## 롤백

검색 due 판정에 결함이 있으면 retrieval variant를 base lesson에 즉시 노출하지 않고 queue를 비활성화한다. 이미 저장된 evidence event는 삭제하지 않는다.

## 평가

### 개발자 관점

source section strong check ID와 event 시각을 결정적으로 대조하고, 완료한 retrieval check ID는 재노출하지 않는다.

### PM 관점

학습자는 복습 버튼을 눌러 상태를 신고하지 않는다. 시간이 되면 실제 문제가 자동으로 나타나고 수행 결과만 증거가 된다.
