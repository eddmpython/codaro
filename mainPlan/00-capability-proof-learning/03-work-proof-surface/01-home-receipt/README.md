# 홈과 evidence receipt

상태: 대기

선행: `../00-capability-projection`

## 목표

홈 기본 진입을 golden claim으로 바꾸고 mixed family 상태, 다음 행동, inference boundary, 지원 노출, 결과물 계보를 사용자 문장으로 보여 준다.

## 영향 파일

- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumOverview.tsx`
- `editor/src/components/app/currentLearningSurface.tsx`
- `editor/src/components/curriculum/**`

## 영향 함수·심볼

- `CurriculumHome`
- `LearningArchiveMenu`
- `CurrentLearningSurface`
- `CapabilityReceipt`

## 테스트

golden 기본 카드, 2/4 mixed state, overdue, 빈 상태, receipt drawer, 좁은 화면, 키보드와 screen reader label을 browser에서 조작한다.

## 롤백

숫자 요약을 다시 보조 표면으로 올릴 수 있으나 raw canonical archive와 receipt를 삭제하지 않는다.

## 평가

최고 family 하나를 전체 claim으로 표시하는 경우 0, receipt 없는 stage 0, 내부 용어만 노출하는 주요 label 0을 요구한다.
