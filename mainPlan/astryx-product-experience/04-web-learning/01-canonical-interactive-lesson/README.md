# Canonical Interactive Lesson

상태: 진행

## 목표

`/learn/lesson/<category>/<contentId>`가 SEO 문서와 실행 학습실을 함께 소유하는 유일한 레슨 URL이 된다.

## 범위

- canonical HTML에 제목, direction, outcome, 첫 worked example, exercise prompt SSR
- 같은 URL에서 editor shell hydrate
- pathname에서 `LessonRef`와 path, section 복원
- code 수정 후 Run 한 번으로 output, check, hint, evidence, 다음 section 자동 갱신
- `/run/`은 자유 노트북 전용으로 분리
- Local 전용 레슨은 같은 문서를 읽되 capability와 전환 이유를 즉시 표시

## 종료 조건

- Home, Learn, 검색에서 레슨 진입 클릭 1회
- 별도 레슨 실행, 확인, 해설 보기, 다음 section 열기 command 0개
- direct URL과 reload에서 같은 lesson, section, draft 복원
- canonical, JSON-LD, 실제 semantic body 검증 통과
- Pages direct reload와 cold load smoke 통과

## 현재 증거

- 472개 canonical route가 semantic SSR 문서와 같은 URL의 interactive editor를 함께 제공한다.
- pathname에서 `LessonRef`를 복원하고 code, output, 자동 검증, hint, evidence, 다음 학습을 같은 surface에 연결했다.
- `web-learning`, `learning-method`, hydration, SEO, public claim과 Light/Dark canonical lesson Chromium case가 통과했다.
- Pages `main@3a18dd97`의 Day 1 canonical URL을 direct cold load해 H1 `헬로월드`, `codaro-runtime-tier=web`, `codaro-lesson-runtime-tier=browser`와 편집 가능한 학습실이 같은 URL에서 복원됨을 확인했다.
- 실제 배포 화면에서 instructional image, 학습 목표, 첫 editable exercise와 자동 기록 안내가 별도 reveal command 없이 노출됨을 확인했다.

## 남은 조건

- keyboard, screen reader와 대표 학습자의 사람 학습성 검수

## 영향 파일

- `landing/scripts/prerenderReact.js`: 472개 lesson의 semantic SSR body와 같은 URL의 interactive editor shell 생성
- `landing/src/pages/lesson.jsx`: public lesson metadata와 non-JavaScript 읽기 surface
- `landing/src/lib/curriculumLessons.js`, `landing/src/lib/generated/curriculum.js`: canonical `LessonRef`와 lesson payload
- `editor/src/lib/runRouteState.ts`: pathname에서 lesson identity와 path·section·runtime tier 복원
- `editor/src/App.tsx`, `editor/src/components/app/currentLearningSurface.tsx`: canonical lesson URL에서 학습 surface hydrate
- `editor/src/components/curriculum/curriculumSurface.tsx`, `editor/src/components/curriculum/curriculumSectionRenderer.tsx`: 목표, 예제, editable exercise, output, 자동 verification
- `tests/learning/verifyWebLearningRoutes.py`, `tests/surface/verifyLandingSeo.py`, `tests/surface/verifyLandingHydration.py`: route·SEO·hydration 계약

## 영향 함수·심볼

- `renderInteractiveLessonShell`, `lessonInitialDocumentHtml`, `lessonInitialDocumentCss`
- `renderShell`, `writeRoute`, `techArticleJsonLd`
- `lessonKeyFromRef`, `lessonRefFromKey`, `runRouteStateFromLocation`, `runRoutePathname`
- `App`, `CurrentLearningSurface`, `CurriculumSurface`, `CurriculumSectionRenderer`

## 테스트

- `uv run python -X utf8 tests/learning/verifyWebLearningRoutes.py`: 472 canonical route, lazy payload, sitemap, search identity 일치
- `uv run python -X utf8 tests/run.py gate landing-public`: canonical, JSON-LD, semantic body, hydration과 direct cold load 대표 case
- `uv run python -X utf8 tests/run.py gate web-learning`: code 수정, Run, output, automatic check와 reload resume
- `uv run python -X utf8 tests/run.py gate learning-method`: 실행 뒤 별도 check·hint reveal·다음 section open command 0개
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`: Web lesson mobile과 public lesson desktop의 금지 control·image proof
- keyboard, screen reader와 대표 학습자의 이해·전이 검수는 아직 사람 증거가 없다.

## 롤백

- interactive hydration에 회귀가 있으면 editor shell 결합만 되돌리고 canonical URL, semantic SSR body, sitemap은 유지한다.
- route parser rollback에서도 `LessonRef={category, contentId}`와 기존 public link를 다른 identity로 바꾸지 않는다.
- `/run/`은 자유 Notebook 역할을 유지하며 canonical lesson 실패를 `/run/` redirect로 숨기지 않는다.
- progress·draft 복원 실패 시 저장 데이터를 삭제하지 않고 reader 변경을 되돌린다.

## 평가

### 개발자 관점

- SEO 문서와 실행 학습실이 동일한 canonical URL과 `LessonRef`를 사용하며 route·hydration machine contract는 green이다.
- representative Chromium만 검증됐고 keyboard, screen reader, 사람 학습성 검수는 남아 있어 완료 자격이 없다.

### PM 관점

- 검색이나 Learn에서 한 번 진입하면 설명, 수정, 실행, 출력, 자동 검증을 같은 맥락에서 수행한다.
- 472개 route 생성 성공은 472개 lesson의 사람 품질 승인이 아니므로 상태는 `진행`으로 유지한다.

완료 전에는 `_done`으로 이동하지 않는다.
