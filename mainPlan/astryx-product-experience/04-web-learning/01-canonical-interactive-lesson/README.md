# Canonical Interactive Lesson

상태: 진행

## 목표

대표 학습자가 canonical lesson에서 설명, 코드 수정, 실행, 자동 feedback과 다음 학습을 이해 가능한 한 흐름으로 수행하는지 screen reader와 초보 대표 학습자로 검수한 뒤 이 TODO를 삭제한다.

## 남은 조건

- screen reader에서 제목, 목표, section, 편집기, 출력, 자동 feedback과 진행 상태가 맥락 순서대로 전달되는지 검수한다.
- 초보 대표 학습자가 별도 시작·확인·해설 reveal 없이 첫 실습과 수정 방향을 이해하는지 검수한다.
- 검수 중 발견한 focus 유실, 중복 announcement, 설명과 실습의 단절을 수정한다.

## 구현 순서

1. 대표 browser lesson을 screen reader로 검수한다.
2. 초보 대표 학습자가 설명부터 첫 strong check까지 수행하게 한다.
3. 발견한 결함을 공용 curriculum renderer와 관련 lesson source에서 수정한다.
4. 관련 gate와 같은 사람 검수를 다시 통과한 뒤 이 packet과 parent index 링크를 삭제한다.

## 영향 파일

- `editor/src/components/curriculum/curriculumOverview.tsx`
- `editor/src/components/curriculum/curriculumSectionRenderer.tsx`
- `editor/src/components/curriculum/curriculumSurface.tsx`
- `editor/src/lib/runRouteState.ts`
- `landing/src/pages/lesson.jsx`
- `tests/surface/verifyProductExperiencePlaywright.py`

## 영향 함수·심볼

- `LearningOverviewHeader`
- `CurriculumSectionRenderer`
- `CurriculumSurface`
- `runRouteStateFromLocation`

## 테스트

- `uv run python -X utf8 tests/run.py gate web-learning`
- `uv run python -X utf8 tests/run.py gate learning-method`
- screen reader와 초보 대표 학습자의 사람 검수

## 롤백

- 접근성 수정이 route, draft, evidence 복원을 깨뜨리면 해당 수정만 되돌리고 TODO를 유지한다.
- 사람 검수 실패를 별도 시작·확인·다음 section reveal control 추가로 우회하지 않는다.

## 평가

### 개발자 관점

- 자동 browser flow는 screen reader 발화 순서와 실제 학습자의 이해를 대신하지 않는다.

### PM 관점

- 대표 학습자가 같은 맥락에서 첫 실습과 자동 feedback을 이해하지 못하면 이 TODO를 삭제하지 않는다.
