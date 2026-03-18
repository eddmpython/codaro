# Codaro

Codaro는 Python 중심의 interactive editor runtime이다.

현재 프로젝트는 세 개의 표면을 제공한다.
- `Edit`: 코드와 마크다운 블록을 작성, 실행, 저장하는 편집기
- `App`: 같은 문서를 코드 숨김 런타임으로 여는 앱 모드
- `Public`: docs, blog, search를 제공하는 GitHub Pages 표면

Codaro는 단순 노트북 클론이 아니라 아래 성격을 같이 가져가려 한다.
- 편집기
- 실행기
- 학습기
- 자동화 앱 빌더
- 다른 도메인 앱이 올라가는 범용 작업면

## 현재 구조

백엔드와 프론트는 아래 단위로 나뉜다.
- `src/codaro/api/`: FastAPI router 계층, 서버 상태, 요청 모델
- `src/codaro/document/`: Codaro native 문서 모델과 codaro/marimo/ipynb 변환
- `src/codaro/kernel/`: 서버 사이드 Python 실행 세션과 WebSocket 프로토콜
- `src/codaro/system/`: 파일 시스템과 패키지 관리 API
- `src/codaro/runtime/`: 엔진 인터페이스와 LocalEngine placeholder
- `src/codaro/server.py`: FastAPI 앱 조립과 SPA 서빙 진입점
- `src/codaro/cli.py`: `codaro edit`, `codaro run`, `codaro export`
- `src/codaro/appRuntime.py`: Codaro native `.py` 문서 런타임
- `frontend/`: SvelteKit 편집기와 앱 모드
- `landing/`: SvelteKit public site, docs, blog, search, GitHub Pages build
- `blog/`: public blog source (`category/post/index.md + assets/`)
- `frontend/static/brand/`: 실제 서비스에 쓰는 브랜드 자산
- `assets/brand/`: 브랜드 원본 자산과 작업본
- `content/studyPython/content/`: 학습 커리큘럼 YAML
- `tests/`: 문서, 커널, 시스템, 서버 테스트

## 설치 경로

현재는 두 경로를 구분한다.

- Product install
  - 장기적으로 `CodaroLauncher.exe`가 Python runtime, backend wheel, frontend asset, update를 자동 관리한다
  - 상세 설계는 `launcher/PRD.md`, `launcher/PACKAGING.md`
- Developer install
  - 지금 바로 개발 환경에서 쓰는 방식
  - `uv`와 frontend build를 직접 관리한다

## 실행

기본 실행:

```bash
uv run codaro
```

기본 진입은 편집기가 아니라 workspace home이다.
여기서 최근 노트북과 파일 트리를 보고 문서를 연다.

특정 문서 열기:

```bash
uv run codaro path.py
```

앱 모드:

```bash
uv run codaro app path.py
```

내보내기:

```bash
uv run codaro export path.py --format codaro
uv run codaro export path.py --format marimo
uv run codaro export path.py --format ipynb
```

기존 서브커맨드도 그대로 된다.

```bash
uv run codaro edit path.py
uv run codaro run path.py
```

## 개발

테스트:

```bash
uv run pytest tests/ -v
```

Python 컴파일 확인:

```bash
uv run python -X utf8 -m compileall src/codaro
```

프론트 개발:

```bash
cd frontend
npm install
npm run build
npm run build:watch
```

Public site 개발:

```bash
cd landing
npm install
npm run build
```

브랜드 자산 생성:

```bash
uv run --with pillow python -X utf8 scripts/buildBrandAssets.py
```

프론트 정적 빌드는 `src/codaro/webBuild/`로 들어간다.
source checkout에서 `uv run codaro`를 실행하기 전 프론트 빌드가 한 번은 있어야 한다.
런타임은 항상 같은 Python 서버이고, 빠른 프론트 반복은 `npm run build:watch`로 같은 `src/codaro/webBuild/`를 계속 갱신하는 방식으로 한다.

## 문서 위치

루트 README는 프로젝트 개요만 다룬다.
세부 구현 문서는 아래 파일을 본다.

- `src/codaro/DEV.md`
- `src/codaro/document/DEV.md`
- `src/codaro/kernel/DEV.md`
- `src/codaro/system/DEV.md`
- `src/codaro/runtime/DEV.md`
- `launcher/PRD.md`
- `launcher/PACKAGING.md`
- `frontend/DEV.md`
- `landing/DEV.md`

## 현재 상태

지금 구현된 핵심은 이렇다.
- Codaro native `.py` 문서 로드/저장
- marimo/ipynb import/export
- FastAPI 기반 로컬 편집기 서버
- 공통 에러 envelope 기반 API 응답
- 서버 커널 우선, Pyodide 폴백 실행 구조
- Edit/App 두 표면
- 파일 시스템과 패키지 관리 API

아직 후속 작업이 필요한 영역도 분명하다.
- 프론트 셀 계층 재정리
- block 중심 문서 모델 확장
- reactive dataflow 고도화
- LocalEngine 실제 구현
- AI가 편집기 조작을 API로 수행하는 구조 확장
