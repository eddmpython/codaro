# 04 Web Learning

상태: 진행

## 목표

사용자가 검색 또는 Learn에서 canonical lesson으로 진입해 읽기, 코드 수정, 실행, 자동 strong check, 진행 저장과 Local 전환을 이해 가능한 한 흐름으로 수행하도록 남은 제품·사람 검수를 끝낸다.

## 작업 폴더

- [Learn Explorer](00-learn-explorer/)
- [Canonical Interactive Lesson](01-canonical-interactive-lesson/)

## 남은 조건

- Learn Explorer의 실제 검색 유입, keyboard, screen reader, 한국어 IME와 여섯 결과 경로 콘텐츠 검수를 끝낸다.
- Canonical Interactive Lesson의 keyboard, screen reader와 초보 대표 학습자 검수를 끝낸다.
- `/app/` 호환 경로의 정식 release archive, 두 release handoff와 소유 가능한 service worker tombstone 조건을 충족한다.
- 학습 archive와 브라우저 check 경계의 독립 보안 검수를 끝낸다.
- 하위 TODO와 공유 잔여 조건이 모두 사라지면 이 workstream과 상위 작업 지도 링크를 삭제한다.

## 구현 순서

1. Learn Explorer와 canonical lesson의 사람 검수를 수행하고 발견한 결함을 수정한다.
2. `/app/` 호환 release와 service worker migration을 release manifest 기준으로 검증한다.
3. archive import와 browser check 경계를 독립 보안 검수한다.
4. 각 종료 조건을 충족한 TODO와 설명을 즉시 삭제한다.

## 영향 파일

- `landing/src/pages/learn.jsx`
- `landing/src/pages/lesson.jsx`
- `editor/src/components/curriculum/`
- `editor/src/lib/browserCheckExecutor.ts`
- `editor/src/lib/browserLearningArchive.ts`
- `editor/src/lib/serviceWorkerMigration.ts`
- `editor/public/serviceWorkerLegacyCaches.json`
- `.github/workflows/pages.yml`

## 영향 함수·심볼

- `LearnPage`
- `LessonPage`
- `CurriculumSurface`
- `BrowserCheckExecutor`
- `exportBrowserLearningArchive`
- `importBrowserLearningArchive`
- service worker migration matcher와 receipt writer

## 테스트

- `uv run python -X utf8 tests/run.py gate landing-public`
- `uv run python -X utf8 tests/run.py gate web-learning`
- `uv run python -X utf8 tests/run.py gate learning-method`
- `uv run python -X utf8 tests/run.py gate product-experience-browser`
- 실제 검색 유입, keyboard, screen reader, 한국어 IME, 대표 학습자와 독립 보안 검수

## 롤백

- `/app/` compatibility와 소유 가능한 tombstone은 지정 release·telemetry 조건 전에는 제거하지 않는다.
- 학습 UI 수정이 canonical identity, draft, progress 또는 archive를 깨뜨리면 해당 수정만 되돌리고 TODO를 유지한다.
- 보안 검수 실패를 weak check나 데이터 누락으로 우회하지 않는다.

## 평가

### 개발자 관점

- Web 학습의 route, evidence, archive와 compatibility migration을 서로 다른 owner와 검증 경계로 유지한다.

### PM 관점

- 자동 browser 흐름만으로 실제 검색 사용자, 보조기술 사용자와 초보 학습자의 성공을 대신하지 않는다.
