# 04 Python 편집기 보강

상태: 진행

## 목표

웹과 Local에서 같은 Python 문서를 이해하고 탐색·수정하는 편집기를 제공한다. 정적 코드 분석,
마지막 실행 정보, 선택 영역 수정, 별도 실행 환경의 수정 검증과 실행 이력을 한 문서 버전에 연결한다.
학습의 직접 입력과 직접 실행 원칙은 `docs/skills/architecture/learning-experience.md`를 따른다.

## 구현 순서

1. 문서·셀·파일 좌표와 버전 계약을 만들고 Python 분석 owner를 웹과 Local에서 공유한다.
   자동완성, 정의 이동, 참조 찾기, 이름 변경, 함수 인자, 문법 진단을 실제 Python 분석기로 연결한다.
   한글과 비 BMP 문자, 여러 셀과 파일, 변경 중인 문서의 오래된 응답을 검증한다.
2. 노트북의 CodeMirror 확장을 별도 모듈로 연결하고 마지막 실행 정보의 신선도를 표시한다.
   분석은 학습 코드를 실행하지 않으며 학습에서는 정답 생성 도움을 노출하지 않는다.
3. 선택한 코드의 수정 요청과 원본 버전에 묶인 수정 제안, 변경 비교, 부분 적용, 되돌리기를 연결한다.
   provider 선택과 호출은 기존 provider owner를 사용하고 문서 변경은 하나의 transaction으로 처리한다.
4. 게시된 pyproc 설치본의 공개 API로 실행, 상태 복제, checkpoint, restore를 검증하고 제품 adapter에
   연결한다. 기존 브라우저 실행, 패키지, publication, 학습 evidence와 공개 정적 배포를 보존한다.
5. 개발 모드에서 수정안을 복제 환경에서 실행해 원본 상태와 분리하고 결과·검사·실행 이력을 표시한다.
   화면 검증은 pyproc 공개 제어 API와 기존 GUI 계약으로 연결한다. 외부 효과는 자동 복원으로 주장하지 않는다.
6. 웹·Local 실제 입력, 탐색, 수정, 실행 및 부정 경로를 검증하고 배포를 확인한 뒤 이 작업 폴더와 링크를 삭제한다.

## 영향 파일

- `src/codaro/document/`, `editor/src/lib/editorIntelligence/`: Python 분석, 문서 좌표, 버전, 수정 계약.
- `src/codaro/api/`, `editor/src/lib/api/`: Local 분석과 수정 요청 transport.
- `src/codaro/ai/`: 기존 provider를 사용하는 선택 영역 수정과 검증 context.
- `editor/src/components/notebook/`, `editor/src/hooks/`: CodeMirror 확장, 탐색 결과, 수정 비교와 적용 UI.
- `editor/src/lib/browserPythonRuntime.ts`, `src/codaro/runtime/`, `editor/scripts/`: 실행 adapter와 자산 배포.
- `editor/package.json`, `editor/package-lock.json`, `pyproject.toml`, `uv.lock`: 검증한 정확 의존성.
- `docs/skills/architecture/`, `tests/editor/`, `tests/surface/`: 영구 계약과 실제 제품 검증.

## 영향 함수·심볼

- `CodeCellEditor`, `DocumentBlock`, `NotebookPanel`: 입력·선택·문서 변경 및 탐색 연결.
- `fetchCodeCompletions`, `staticCompletions`, `completeCode`: 코드 분석과 provider 제안 경계.
- `executeBrowserBlock`, `runBrowserNotebook`, `runNotebookBlock`: 실행과 결과 버전 연결.
- `codaroGui`: 편집·실행·화면 관찰의 기존 공개 제어 계약.

## 테스트

- `uv run python -X utf8 -m pytest -q tests/editor`: Python 분석, 변경 위치와 충돌, 요청 경계의 회귀.
- `npm --prefix editor run check`와 production build: 공유 source 및 편집기 확장 검증.
- 설치된 pyproc 공개 API로 웹·Local의 정의 이동, 이름 변경, 한글 입력, 선택 수정, 충돌 거부,
  부분 적용·undo, 원본 상태를 보존한 수정 검증, checkpoint 복원, 앱 화면을 실제 조작한다.
- `testDirectPractice.mjs`, `testLearningNavigation.mjs`와 학습 evidence 검사로 빈 입력·직접 실행을 보존한다.
- 기존 문서·아키텍처·runtime·publication gate와 최종 `preflight`를 실행한다.

## 롤백

분석, 문서 수정, runtime adapter는 각 소유 모듈과 소비자를 같은 commit으로 묶는다. 되돌릴 때는
해당 commit을 revert하고 같은 검증을 실행한다. 문서와 사용자 draft를 삭제하거나 외부 효과를
재실행하지 않는다. 의존성 변경은 lock과 자산 생성기를 함께 되돌린다.

## 현재 검증 기록

2026-09-08 구현 검증에서 편집기 Python 테스트 26개, 아키텍처·편집기 테스트 98개와 TypeScript
검사가 통과했다. 실제 웹·Local의 이름 변경·되돌리기, 웹의 정의·참조·문법 진단, 고정 provider를
사용한 Local 수정 비교·부분 적용·되돌리기·오래된 제안 거부가 통과했다. 정적 서버의 service worker
환경에서 기준 실행, 복제 검사, 원본 변수 보존과 무한 반복 실행 중지가 통과했다.

전체 Python 검사는 1991개 통과, 8개 건너뜀, 7개 실패였다. 실패는 모두 시각 자산의 capture source
hash가 구현과 달라진 결과다. 20개 제품 화면의 실제 동작과 캡처는 통과했고 12개 화면이 기존 정본과
달랐다. 시각 자산 정본은 구현 commit을 기준으로 다시 캡처·갱신하는 기존 절차를 따른다.

구현 commit `4f32acb8` 기준으로 20개 자산을 다시 캡처·갱신했고 자산 commit `f504e65a`에
정본과 미러를 기록했다. 자산 테스트 30개와 하위 검사 92개가 통과하여 앞선 실패 7개를 해결했다.
문서·생성 계약 gate와 학습 빈 입력·직접 실행·Enter·Tab·4칸·고정 목차 검사도 통과했다.

실행 파일 상태 계약은 [pyproc 파일 복제·복원 재현](pyprocFileCheckpoint.md)에서 실패했으므로
전체 실행 기능과 배포 완료로 판정하지 않는다.

[운영자 결정 대기] 실제 모델 요청은 설정된 OAuth provider의 로그인 필요 응답으로 중단됐다.
Local 설정에서 모델 로그인을 마치거나 사용할 다른 provider를 지정해야 실제 모델 검증을 수행할
수 있다. 고정 provider 화면 검증은 실제 모델 성공 근거가 아니다.

## 평가

- 개발자: 의미 분석을 문자열 검색으로 대체하지 않는다. 셀·파일 좌표와 문서 버전, 실행 정보의
  신선도, 취소, 자원 해제, provider 실패를 명시적으로 다루고 분석이 사용자 코드를 실행하지 않게 한다.
- 제품: 사용자는 편집기 안에서 코드를 탐색하고 고치고 검증한다. 새 기능을 내부 진단 목록으로
  노출하지 않으며 키보드와 실제 문서의 변경 결과로 성공을 판정한다.
