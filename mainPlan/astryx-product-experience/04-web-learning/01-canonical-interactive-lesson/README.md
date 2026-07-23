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

완료 전에는 `_done`으로 이동하지 않는다.
