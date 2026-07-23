# 01 Instructional Assets

상태: 진행

현재 8개 학습 domain의 `generatedRaster` 자산이 learning question, decision, lesson context와 함께 공용 manifest에 등록됐다. `learningVisualAssets.ts`의 8-domain/category mapping과 `LearningDomainVisual`을 통해 `CurriculumHome`은 8개 domain visual band를, `CurriculumOverview`는 현재 lesson에 맞는 visual, 질문, 판단 기준을 별도 reveal 클릭 없이 자동 렌더한다. `visual-assets` gate는 green이지만 이는 asset과 현재 surface integration의 기계 계약만 증명한다. lesson anchor author review, 사람 자산 승인, outcome proof와 접근성 눈검수가 남아 있어 `_done`이 아니다.

## 목표

대표 6경로의 결과와 어려운 개념을 이해시키는 시각 자산을 만든다. 이미지 수가 아니라 학습자가 더 정확한 판단을 하는지가 기준이다.

## 구현 순서

1. `pythonFoundation`, `dataReporting`, `dataVisualization`, `fileAutomation`, `officeAutomation`, `webMonitoring`의 path outcome과 오개념 위험을 검토한다.
2. 각 path cover와 최종 outcome proof를 실제 artifact에서 만든다.
3. relation, sequence, shape, state, before/after 판단이 필요한 section만 instructional visual 대상으로 승인한다.
4. `learningQuestion`, `decisionShown`, lesson anchor와 alt/caption을 작성한다.
5. 320px, 400% zoom, light/dark와 긴 한국어 caption을 검수한다.

## 영향 파일

- 잔여 계획 `assets/brand/visuals/outcomes/`
- 신규 `assets/brand/visuals/learning/`
- 잔여 author review 대상 `curricula/python/**/*.yaml`
- `editor/src/lib/learningVisualAssets.ts`
- `editor/src/components/curriculum/learningDomainVisual.tsx`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumOverview.tsx`
- 잔여 lesson-specific anchor 통합 `editor/src/components/curriculum/curriculumMarkdownBody.tsx`
- `src/codaro/curriculum/cardContract.py`

## 영향 함수·심볼

- `resolveVisualAsset`
- `learningVisualDomainForCategory`, `learningVisualDomainById`, `LearningDomainVisual`
- 잔여 lesson-specific `CurriculumMarkdownBody` media branch
- `validateCardBlock`

## 테스트

- 잔여 계획 `tests/assets/verifyInstructionalVisualPurpose.py`
- 수정 `tests/curriculum/verifyCardContract.py`
- 구현 `tests/surface/testProductSurfaceContract.py`
- 구현 `tests/surface/verifyProductExperiencePlaywright.py`
- 잔여 계획 `tests/learning/verifyInstructionalVisualPlaywright.py`

## 롤백

- visual이 의미를 잘못 전달하면 text fallback을 유지하고 해당 asset reference만 제거한다.
- quota를 맞추기 위한 장식 대체 이미지를 넣지 않는다.

## 평가

### 개발자 관점

- lesson anchor와 manifest ID를 양방향 검사해 orphan을 막아야 한다.

### PM 관점

- 사용자가 이미지를 보고 무엇을 판단해야 하는지 한 문장으로 말할 수 있어야 한다.
