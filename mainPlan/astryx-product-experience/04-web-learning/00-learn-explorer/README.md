# Learn Explorer

상태: 진행

## 목표

실제 검색 유입과 보조기술 환경에서 학습자가 목표, 이어하기, 검색 결과와 Web·Local 범위를 이해하고 canonical lesson으로 바로 진입할 수 있는지 사람 기준으로 검수한 뒤 이 TODO를 삭제한다.

## 남은 조건

- 실제 검색 유입 URL에서 query와 filter 상태가 이해 가능한지 검수한다.
- screen reader에서 검색 입력, 결과 수, 결과 목록과 현재 filter 관계가 순서대로 전달되는지 검수한다.
- 한국어 IME 조합 중 query나 결과가 불안정하게 갱신되지 않는지 실제 입력기로 확인한다.
- 여섯 결과 경로의 이름, 결과물 설명, Web·Local 범위와 추천 레슨을 사람 콘텐츠 검수한다.

## 구현 순서

1. 대표 검색 유입과 filter deep link를 screen reader와 한국어 IME로 검수한다.
2. 여섯 결과 경로를 콘텐츠 owner가 검수한다.
3. 발견한 결함을 explorer와 공용 lesson metadata owner에서 수정한다.
4. 관련 browser gate와 사람 검수를 다시 통과한 뒤 이 packet과 parent index 링크를 삭제한다.

## 영향 파일

- `landing/src/pages/learn.jsx`
- `landing/src/styles/learnExplorer.css`
- `landing/src/lib/curriculumLessons.js`
- `landing/src/lib/generated/curriculum.js`
- `tests/surface/verifyLandingExperiencePlaywright.py`
- `tests/learning/verifyWebLearningRoutes.py`

## 영향 함수·심볼

- `LearnPage`
- `LessonRow`
- `pathDefinitions`
- `lessonHref`
- `interactiveLessonHref`

## 테스트

- `uv run python -X utf8 tests/run.py gate landing-public`
- `uv run python -X utf8 tests/run.py gate web-learning`
- `CODARO_PRODUCT_CASE=landing-public uv run python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
- 실제 검색 유입, screen reader, 한국어 IME와 경로별 콘텐츠 사람 검수

## 롤백

- 검색 접근성 수정이 query 공유나 reload 복원을 깨뜨리면 해당 수정만 되돌리고 TODO를 유지한다.
- 콘텐츠 수정에서도 canonical lesson identity와 Web·Local capability 사실을 바꾸지 않는다.

## 평가

### 개발자 관점

- 자동 composition event 검사는 실제 입력기와 보조기술의 event·announcement 순서를 대신하지 않는다.

### PM 관점

- 사용자가 검색 결과가 무엇인지, 어느 환경에서 수행할 수 있는지 이해하지 못하면 이 TODO를 삭제하지 않는다.
