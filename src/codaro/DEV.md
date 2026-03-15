# Codaro Backend DEV

## 목적

`src/codaro/`는 Codaro의 Python 런타임과 로컬 서버를 담당한다.
현재 구현은 `문서 로드/저장`, `코드 실행`, `파일 시스템`, `패키지 관리`, `프론트 정적 서빙`을 하나의 FastAPI 앱으로 묶는다.

## 현재 계층

- `document/`
  - 문서 모델
  - codaro/marimo/ipynb 파서와 writer
  - 문서 서비스
- `kernel/`
  - Python 실행 세션
  - 세션 관리자
  - REST/WebSocket 프로토콜 모델
- `system/`
  - 파일 시스템 CRUD
  - 패키지 설치/삭제/조회
- `runtime/`
  - 엔진 인터페이스
  - LocalEngine placeholder
- `server.py`
  - FastAPI 앱
  - API 라우트
  - SPA 서빙
- `cli.py`
  - `codaro edit`
  - `codaro run`
  - `codaro export`

## 주요 흐름

### 문서 편집

1. 프론트가 `/api/document/load`로 문서를 읽는다
2. 편집 중 변경은 현재 프론트 메모리 상태에서 우선 처리한다
3. 저장 시 `/api/document/save`로 Codaro native `.py`로 직렬화한다
4. 내보내기는 `/api/document/export`에서 marimo/ipynb writer를 사용한다

### 코드 실행

1. 편집기는 먼저 서버 커널 세션을 생성한다
2. WebSocket `/ws/kernel/{sessionId}`로 실행 요청을 보낸다
3. `KernelSession`이 단일 스레드 실행기로 Python 코드를 돌린다
4. stdout, stderr, 마지막 표현식 값, 변수 목록을 응답으로 돌려준다
5. 서버 커널 실패 시 프론트는 Pyodide worker로 폴백한다

### 앱 모드

1. `codaro run path.py`가 서버를 app 모드로 띄운다
2. `/app?path=...`가 같은 문서를 읽는다
3. 현재 App 모드는 Pyodide worker로 전체 코드 블록을 순서 실행한다
4. `hideCode`를 기준으로 결과 중심 화면을 보여준다

## 설계상 중요한 점

- 문서 포맷은 외부 호환보다 Codaro canonical 모델이 우선이다
- 편집기 UI는 엔진 구현 세부사항을 직접 알면 안 된다
- GUI에서 가능한 조작은 장기적으로 API로도 노출되어야 한다
- 장기 목표상 AI가 편집기를 조작할 수 있어야 하므로 문서/실행/file API는 계속 확장될 예정이다

## 현재 기술 부채

- `server.py`에 라우트와 조립 책임이 많이 몰려 있다
- 문서 블록 조작 API와 프론트 로컬 상태 조작이 이중화되어 있다
- App 모드는 아직 서버 커널이 아니라 Pyodide 전용 실행 경로다
- `system/packageOps.py`는 `uv` 실패 시 `pip`로 폴백한다
  - 프로젝트 원칙과 어긋나는 부분이라 후속 정리가 필요하다
- `runtime/`은 아직 실제 프론트/백엔드 공통 엔진 계층으로 쓰이지 않는다

## 다음 정리 방향

- `server.py`를 `document`, `kernel`, `system`, `app` 라우터로 분리
- block 조작을 서버 API 우선으로 재정리
- 서버 커널과 Pyodide의 capability 표면 통일
- AI 편집 조작을 위한 문서 API 확장
