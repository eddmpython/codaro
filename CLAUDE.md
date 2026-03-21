# Codaro 프로젝트 규칙

## 필수: 메모리 먼저 확인

- 작업 시작 전 Codaro 전용 메모리 경로가 있으면 먼저 읽는다.
- 예상 경로:
  - `C:\Users\MSI\.claude\projects\c--Users-MSI-OneDrive-Desktop-sideProject-codaro\memory\MEMORY.md`
- 현재 이 경로가 없으면 없는 상태로 진행하되, 새 규칙이 생기면 이 문서와 메모리를 함께 맞춘다.

## 언어

- 사용자와의 대화는 한국어로 답변한다.

## 진입점 규칙 동기화

- `AGENTS.md`와 `CLAUDE.md`의 공통 규칙은 항상 동일하게 유지한다.
- 한쪽을 수정하면 다른 쪽도 즉시 같은 의미로 반영한다.
- Codaro는 초기 단계이므로 상세 설계는 코드 옆 `DEV.md` 또는 기능 폴더의 `SPEC.md`에 둔다.

## Codaro 정체성

- Codaro는 단순 노트북 클론이 아니다.
- Codaro는 Python 중심의 `웹 + 모바일 + 로컬` 공통 편집기 런타임을 목표로 한다.
- 핵심 성격:
  - 편집기
  - 실행기
  - 학습기
  - 자동화 앱 빌더
  - 다른 도메인 앱이 올라가는 범용 작업면
- `eddmpython`의 notebook/eddmlab은 참고 구현일 뿐이며, Codaro의 source of truth는 Codaro 코드와 문서다.

## Codaro 확정 사상 (절대 흔들리지 않는 원칙)

### 1. 실행 모델: 투명 스코프 격리

- 사용자는 **그냥 Python을 쓴다**. 함수 래핑 없음, return 없음, 보일러플레이트 없음.
- 엔진이 내부에서 셀마다 격리된 네임스페이스로 실행한다.
- AST 분석으로 각 셀이 정의하는 변수(defines)와 사용하는 변수(uses)를 자동 추론한다.
- 셀 실행 시 해당 셀이 사용하는 변수만 레지스트리에서 주입한다.
- 셀이 삭제되면 그 셀이 정의한 변수도 레지스트리에서 사라진다.
- **Jupyter의 편리함 + marimo의 안전성**, 사용자에게 보이지 않는 곳에서.

### 2. 리액티브 실행

- 셀 하나를 실행하면, 그 셀의 변수에 의존하는 하위 셀이 **자동으로 재실행**된다.
- 의존 관계는 AST 분석 기반 (명시적 선언 불필요).
- 에러 발생 시 전파 중단.
- 실행 순서는 문서 순서를 따른다 (의존 관계 내에서).

### 3. 파일 포맷: Percent Format (.py)

- Codaro의 기본 저장 포맷은 Percent Format이다.
- `# %% [code]`, `# %% [markdown]` 주석이 셀 경계를 구분한다.
- 코드는 모듈 레벨 (들여쓰기 0칸). 함수로 감싸지 않는다.
- `python file.py`로 그대로 실행 가능하다.
- VS Code, Spyder, Jupytext가 동일한 `# %%` 포맷을 인식한다.
- marimo/ipynb 호환 import/export는 유지한다.

### 4. 실행 환경: Pyodide 기본, 로컬 확장

- **Pyodide(브라우저)가 기본 실행 플랫폼**이다. 모든 학습 콘텐츠가 Pyodide에서 동작한다.
- **로컬(서버 커널)은 Pyodide의 모든 것 + 추가 자동화**를 제공한다.
  - 실제 파일 I/O, 패키지 자동 설치, DB 연결, 무거운 ML, 로컬 AI(Ollama).
- 프론트엔드는 서버 커널 우선 → Pyodide 폴백으로 동작한다.
- 편집기 코드가 실행 엔진의 구현을 직접 알지 않는다.

### 5. 학습 시스템 3기둥

- **기둥 1: 노트북 기능** — 학습의 실행 환경. 셀 편집/실행/리액티브/분할/병합.
- **기둥 2: 뼈대 커리큘럼** — YAML 기반 130+ 레슨. 카테고리/레슨/미션/진행 추적.
- **기둥 3: 학습 사상** — 코드로 정의된 교육 철학. AI도 사람도 이 사상을 따른다.
  - 최소 설명, 최대 실행
  - 빈칸부터 시작 (빈 셀이 아니라 거의 완성된 코드에서 빈칸 채우기)
  - 예측 → 검증 (먼저 예측하게 하고 실행으로 확인)
  - 오류는 학습 (일부러 버그가 있는 코드를 주고 고치게 한다)
  - 점진적 빌드 (한 셀에 한 개념, 쌓아가며 완성)
  - 수정 실험 ("이 값을 바꿔보세요")
  - 3단계 힌트 (개념 → 구조 → 정답, 바로 답을 주지 않는다)
  - 즉시 피드백 (맞았는지 1초 안에)
  - 반복 변주 (같은 개념을 다른 상황에서)
  - 실제 맥락 (추상적 예제가 아니라 현실 상황)

### 6. AI 통합 원칙

- **AI 없이도 모든 학습이 완전히 동작**한다. AI는 선택적 확장이다.
- AI가 붙으면 편집기의 기존 API를 **도구(tool_use)로 사용**해서 가르친다.
  - `insert-block`: 설명/예시/힌트 셀 삽입
  - `execute-reactive`: 학생 코드 실행 후 결과 검증
  - `GET variables`: 변수 상태 확인
  - `update-block`: 피드백 추가
  - `fs/write`, `packages/install`: 교육 환경 자동 설정
- AI는 `GET /api/curriculum/learning-spec`에서 학습 사상을 읽고 동일한 철학으로 가르친다.
- 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다.
- AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음.

### 7. 마운팅과 통합

- `createServerApp()`은 독립 실행 가능하면서 동시에 다른 서버에 마운팅 가능하다.
- FastAPI: `app.mount("/codaro", createServerApp())`
- Django: ASGI 라우팅 분기
- Flask: WSGIMiddleware 래핑
- 프론트엔드는 `<meta name="codaro-base">` 태그에서 root_path를 자동 감지한다.
- GUI에서 되는 모든 것은 API로도 된다 (시스템적 수정 가능).

## 기본 기술 규칙

- 기본 런타임은 Python `3.12+`를 기준으로 한다.
- 패키지/가상환경/실행 관리는 반드시 `uv`를 사용한다.
- 테스트 기본 명령은 `uv run pytest tests/ -v`를 기준으로 한다.
- 임시 실행, 스크립트 검증, 단발성 확인은 `uv run python -X utf8 ...` 형태를 우선한다.
- `pip` 직접 사용은 금지한다.

## 아키텍처 방향

- 1차 목표는 `편집기 메커니즘`의 독립이다.
- 구조는 아래 5층을 기본으로 본다.
  - `document model`
  - `execution runtime`
  - `reactive dataflow`
  - `ui/widget bridge`
  - `workspace shell`
- UI가 실행기 구현 세부사항에 직접 묶이면 안 된다.
- 웹, 모바일, 로컬은 가능한 한 같은 문서 모델과 같은 실행 인터페이스를 공유해야 한다.

## 문서 모델 원칙

- Codaro는 장기적으로 `cell`보다 `block` 중심 모델로 간다.
- 최소 블록 후보:
  - `code`
  - `text`
  - `guide`
  - `widget`
  - `view`
  - `file`
- 노트북 포맷 호환은 중요하지만, 내부 모델은 marimo나 Jupyter에 종속되지 않는다.

## 실행 엔진 원칙

- 실행 엔진은 교체 가능한 인터페이스로 설계한다.
- 기본 후보:
  - `PyodideEngine`
  - `SandboxEngine`
  - `LocalEngine`
- 편집기는 `execute`, `interrupt`, `variables`, `files`, `packages`, `docs` 같은 capability를 호출하고, 개별 엔진 구현을 직접 알지 않아야 한다.

## 데이터흐름 원칙

- Codaro는 단순 코드 편집기가 아니라 상태를 가진 편집기다.
- 따라서 아래를 초기에 고려한다.
  - block dependency graph
  - variable lineage
  - rerun scope
  - side effect boundary
- "어느 블록을 다시 실행해야 하는가"를 계산할 수 있어야 한다.

## 위젯/뷰 브리지 원칙

- Python 코드가 UI descriptor를 만들고, 프론트가 이를 렌더링하는 구조를 기본으로 한다.
- 위젯은 부가 기능이 아니라 Codaro의 핵심 메커니즘이다.
- 즉, Codaro는 "코드가 인터페이스가 되는 편집기"를 지향한다.

## 참고 구현 사용 원칙

- 참고 경로:
  - `C:\Users\MSI\OneDrive\Desktop\sideProject\nicegui\eddmpython`
- 우선 참고할 영역:
  - `frontend/src/lib/features/notebook/`
  - `core/notebook/`
- 그대로 복제하지 않는다.
- 먼저 메커니즘을 해부하고, Codaro 목적에 맞는 계층으로 재설계한 뒤 가져온다.

## 개발 문서 원칙

- 공개 문서는 루트 `docs/`를 기준으로 둔다.
- 내부 개발 문서는 기능 폴더 옆 `DEV.md`, `SPEC.md`, `PRD.md`로 관리한다.
- 권장 경로:
  - `docs/`
  - `src/codaro/DEV.md`
  - 기능별 `SPEC.md`
- 아키텍처가 바뀌면 코드보다 늦지 않게 문서를 갱신한다.
- `_reference/` 아래 문서는 참고/실험 메모로만 두고 공식 source of truth로 쓰지 않는다.
- 현재 내부 문서 경로:
  - `src/codaro/DEV.md`
  - `src/codaro/document/DEV.md`
  - `src/codaro/kernel/DEV.md`
  - `src/codaro/system/DEV.md`
  - `src/codaro/runtime/DEV.md`
  - `launcher/PRD.md`
  - `launcher/PACKAGING.md`
  - `backend/PRD.md` (marimo 백엔드 1:1 분석 인덱스)
  - `backend/prd/*.md` (백엔드 분할 문서 01~12)
  - `frontend/DEV.md`
  - `landing/DEV.md`

## 현재 코드 레이아웃

- `src/codaro/api/` : FastAPI router 계층, 서버 상태, 요청 모델, bootstrap/document/kernel/system/curriculum/spa 조립
- `src/codaro/document/` : 문서 모델, percent/codaro/marimo/ipynb 파서와 writer, AST 의존 분석
- `src/codaro/kernel/` : 투명 스코프 격리 커널, 리액티브 실행, SessionManager, WebSocket
- `src/codaro/curriculum/` : YAML 콘텐츠 로더, 노트북 변환기, 진행 추적, 학습 사상, 연습 체커
- `src/codaro/system/` : 파일 시스템 CRUD (`fileOps`) 및 패키지 관리 (`packageOps`)
- `src/codaro/runtime/` : 실행 엔진 인터페이스, `LocalEngine`, child process worker, execution event stream
- `launcher/` : Rust launcher, embedded Python 배포, install/update/rollback PRD와 이후 구현 위치
- `src/codaro/server.py` : FastAPI 앱 조립기, middleware, 프론트 빌드 stale 감지, SPA 서빙 진입점
- `src/codaro/cli.py` : `codaro edit`, `codaro run`, `codaro export`
- `src/codaro/appRuntime.py` : native `.py` 문서에서 사용하는 `App`, `md`
- `study/python/` : Codaro 로컬 학습 커리큘럼 YAML
- `frontend/` : SvelteKit + Tailwind v4 편집기, shadcn 패턴 공용 UI, marimo 기준 notebook chrome, 학습 브라우저, 미션 체크 UI, 서버 커널 우선 + Pyodide 폴백
- `landing/` : SvelteKit static public site, docs/blog/search, GitHub Pages build
- `blog/` : public blog source (`category/post/index.md + assets/`)
- `backend/` : marimo 백엔드 1:1 분석 PRD (12개 분할 문서), `backend/PRD.md` 인덱스
- `tests/` : 커널, 리액티브, 시스템, 문서, 커리큘럼, 체커, 서버 API, 서버 런타임 테스트 (119개)

## 실행 환경 규칙

- PowerShell 메인 가상환경은 프로젝트 루트 `.venv`를 사용한다.
- WSL에서는 루트 `.venv`를 공유하지 않는다.
- WSL 전용 가상환경이 필요하면 `.venv-wsl`을 사용한다.

## 실행 인코딩 규칙

- Python 실행은 기본적으로 `uv run python -X utf8 ...` 형태를 사용한다.
- PowerShell에서 인코딩이 의심되면 실행 전에 아래를 적용한다.
  - `[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()`
- 파일 읽기/쓰기 명령은 가능한 한 UTF-8을 명시한다.
- 모든 텍스트 파일은 UTF-8을 기본으로 유지한다.

## 코드 품질 원칙

- 파일/폴더/함수/변수는 `camelCase`, 클래스는 `PascalCase`, 상수는 `UPPER_CASE`를 사용한다.
- 파일 삭제는 금지하고, 정리가 필요하면 `_backup/`으로 이동하는 방식을 우선한다.
- 인라인 주석은 넣지 않는다.
- bare except 금지
- `except Exception:` 남발 금지
- try-except를 구조 대용으로 쓰지 않는다.
- 사용자 입력 검증은 가능하면 early return으로 처리한다.
- 에러를 삼키지 않는다.
- 초기 단계일수록 "대충 동작"보다 "계층이 맞는가"를 우선한다.

## AI 투명성 원칙

- Codaro에 AI 기능을 붙일 때, 모델이 실제로 본 데이터는 UI에서 사용자에게 드러나야 한다.
- 시스템이 제공한 컨텍스트, 시스템 프롬프트, tool 호출과 결과는 숨기지 않는다.
- AI 표현을 바꾸려면 UI 임시 가공보다 원천 데이터 계층 개선을 우선한다.
- 소비자 계층은 원천 데이터를 읽기만 하고, 표시용 이름/정렬/단위를 임의로 재정의하지 않는다.

## 실험 규칙

- 실험은 반드시 `experiments/` 아래에서만 한다.
- 실험 먼저 진행하고, 로직이 굳기 전에는 패키지 코드로 바로 들어가지 않는다.
- 실험별 하위 폴더를 분리한다.
  - 예: `experiments/001_editorModel/`
- 각 실험 폴더에는 `STATUS.md`를 둔다.
- 파일명은 숫자 접두사를 붙인다.
  - 예: `001_blockModel.py`
- 실패한 실험도 지우지 말고 결론을 남긴다.

## 브랜딩 원칙

- Codaro는 "marimo 대체재"로 소개하지 않는다.
- 설명 기준:
  - programmable studio
  - interactive editor runtime
  - code, learning, automation
- 다른 앱이 올라가는 기반 레이어로 보이게 설계한다.

## Marimo 1:1 체크리스트

- 이 체크리스트는 `frontend`가 marimo와 **정말 1:1인지** 판정하는 기준이다.
- 세부 source branch, DOM 계약, class 계약, 상태 분기는 반드시 `frontend/PRD.md` 인덱스와 `frontend/prd/*.md` 분할 문서를 따른다.
- `frontend/PRD.md`는 상위 인덱스 게이트이고, 구현 상세 source of truth는 `frontend/prd/*.md`다.
- source of truth는 추측이 아니라 로컬 설치본 marimo 정적 자산이다.
  - `.venv/Lib/site-packages/marimo/_static/index.html`
  - `.venv/Lib/site-packages/marimo/_static/assets/*.js`
  - `.venv/Lib/site-packages/marimo/_static/assets/*.css`
- 하나라도 안 맞으면 "marimo-like", "near-marimo"로만 표현하고 `1:1`이라고 말하지 않는다.
- 항목을 체크할 때는 DOM 계층, class, id, data-testid, hover 위치, padding, asset preload, 실제 렌더 결과를 함께 본다.

### Root / Head

- [ ] `app.html`, route head, notebook head가 marimo `index.html`과 같은 역할 분리를 가진다.
- [ ] favicon, apple-touch-icon, manifest, preload image/font, theme-color, description이 marimo와 같은 종류와 순서로 들어간다.
- [ ] `marimo-filename`, `marimo-version`, `marimo-user-config`, `marimo-server-token` 태그가 같은 위치와 의미로 존재한다.
- [ ] `#root`, `#app`, `#App` 계층이 marimo 기준과 같은 책임으로 배치된다.

### Shell / Chrome

- [ ] 좌측 chrome, 중앙 notebook surface, 우측 helper panel, 하단 footer의 DOM 계층이 marimo와 1:1이다.
- [ ] floating action 버튼의 id, data-testid, 배치 순서가 marimo와 같다.
- [ ] helper panel open/close 구조, panel header, resize handle, footer status 위치가 marimo와 같다.
- [ ] notebook filename bar, top spacing, page frame width, fullscreen/print 관련 wrapper가 marimo와 같다.

### Cell Frame

- [ ] 각 셀 루트가 marimo와 같은 커스텀 태그, class, data-selected, focus/hover 구조를 가진다.
- [ ] selection ring, error ring, touched/focused 상태 표현이 marimo CSS 동작과 같다.
- [ ] code cell과 markdown cell의 내부 wrapper 수와 순서가 marimo와 같다.
- [ ] 셀 간 간격, 상하 패딩, 출력과 입력 사이 spacing이 marimo와 같다.

### Hover / Overlay Controls

- [ ] 마우스 hover 시 드러나는 버튼 그룹의 wrapper 위치값이 marimo와 같다.
- [ ] 언어 토글은 marimo처럼 editor 내부 overlay에서 렌더된다.
- [ ] `language-toggle-button`의 variant, size, class, opacity, padding이 marimo와 같다.
- [ ] run button, move, duplicate, delete, hide code, action dropdown의 위치와 등장 방식이 marimo와 같다.
- [ ] hover opacity transition과 focus-within 노출 방식이 marimo와 같다.

### Editor

- [ ] `cell-editor` 루트가 marimo와 같은 class와 DOM 계층을 가진다.
- [ ] editor top padding이 overlay 버튼을 포함한 실제 marimo 배치와 같다.
- [ ] hide code, markdown toggle, selection mode, keyboard focus 이동이 marimo와 같은 구조를 따른다.
- [ ] 에디터 외부 셸이 아니라 marimo와 같은 내부 wrapper에서 overlay와 editor가 결합된다.

### Markdown / Output

- [ ] markdown preview가 `mo-markdown-renderer`와 같은 DOM/CSS 체인을 사용한다.
- [ ] markdown edit/view 전환 구조와 상단 control 위치가 marimo와 같다.
- [ ] output wrapper, stdout, stderr, error, html, return 출력 class와 순서가 marimo와 같다.
- [ ] empty output일 때의 공간 사용과 non-empty output일 때 spacing이 marimo와 같다.

### Assets / Style Chain

- [ ] marimo CSS import 순서가 유지된다.
- [ ] marimo에서 쓰는 static asset은 같은 파일명과 같은 용도로 로드된다.
- [ ] 폰트, 배경 이미지, noise/gradient가 marimo와 같은 로드 경로와 역할을 가진다.
- [ ] Codaro 전용 스타일은 marimo와 동일하지 않은 부분을 만드는 대신, 필요한 최소 보정만 한다.

### Verification

- [ ] 코드 비교만 하지 않고 실제 브라우저 렌더를 marimo와 나란히 놓고 확인한다.
- [ ] hover 버튼 위치, sidebar width, footer height, cell padding을 실제 화면에서 다시 본다.
- [ ] 빌드가 성공하고 a11y 또는 Svelte 경고가 남지 않는다.
- [ ] 이 체크리스트가 전부 충족되기 전에는 완료 선언을 하지 않는다.

## 프론트/브랜드 확정 규칙

- Codaro 제품 UI 언어는 영어만 사용한다.
  - index, editor, app mode, docs, blog 모두 영어 기준이다.
- 모든 공용 컴포넌트 톤은 `zinc` 계열을 기본으로 한다.
- 공용 UI는 `shadcn-svelte` 패턴을 기본으로 사용한다.
- 기본 avatar와 favicon source는 `assets/brand/mascot/source/codaro-sheet-01.png`의 첫 번째 왼쪽 pose다.
- pose sheet source는 `assets/brand/mascot/source/codaro-sheet-01.png`, `assets/brand/mascot/source/codaro-sheet-02.png`다.
- 아바타는 항상 배경 제거 후 캐릭터만 사용한다.
- 브랜드 자산 경로 source of truth는 `frontend/src/lib/theme/appBrand.ts`다.
- 색상/반지름/그림자 source of truth는 `frontend/src/lib/theme/brandTheme.ts`다.
- GitHub Pages는 Svelte로 운영한다.
  - 문서와 블로그도 같은 Svelte 기반, 같은 브랜드 톤으로 운영한다.

## Git 및 릴리즈 원칙

- 커밋, 주석, 문서 어디에도 AI 생성 흔적 문구를 남기지 않는다.
- 커밋 메시지와 커밋 본문에도 `AI`, `GPT`, `Codex`, `Claude`, `Generated by`, `Co-Authored-By` 같은 흔적을 남기지 않는다.
- GitHub 원격 작업은 `gh` 사용을 허용한다.
- 기본 원격 저장소는 `https://github.com/eddmpython/codaro.git` 이다.
- 릴리즈 시 `CHANGELOG.md`에 변경 내용을 상세하게 기록한다.
- 배포는 GitHub Actions trusted publishing 기준을 유지한다.
- 버전 릴리즈는 `git tag vX.Y.Z && git push origin vX.Y.Z` 흐름을 기준으로 한다.

## 로컬 배포 bundle 원칙

- 최종 사용자 배포는 `CodaroLauncher.exe` 하나를 기준으로 한다.
- launcher는 embedded Python runtime과 manifest가 지정한 exact wheel 기반 curated bundle만 설치한다.
- launcher는 index에서 arbitrary latest package를 해석하거나 무제한 `pip install` 경로를 제품 기본으로 삼지 않는다.
- `codaro-excel` 같은 automation bundle은 Python package, helper runtime, capability probe, bootstrap을 launcher가 관리한다.
- 외부 앱과 드라이버 의존성은 별도 경계로 둔다.
  - 예: `xlwings` 기반 Excel app automation은 launcher가 Python 쪽 의존성과 bootstrap을 관리하지만, Microsoft Excel 자체는 사용자가 설치해야 한다.
- 세부 배포 설계의 source of truth는 `launcher/PRD.md`, `launcher/PACKAGING.md`다.

## 문서 유지보수 원칙

- 세션 시작 시 `CLAUDE.md`와 실제 코드 구조를 대조하고, 낡은 내용이 있으면 즉시 갱신한다.
- 파일/폴더 추가, 삭제, 이동이 있으면 관련 경로와 구조 설명을 함께 갱신한다.
- 삭제된 기능이나 파일에 대한 죽은 참조를 남기지 않는다.

## 세션 이어가기 원칙

- 세션이 끝나도 다음 세션이 채팅 없이 바로 이어갈 수 있게 현재 결정, 진행 상태, 다음 액션, 남은 검증을 반드시 저장소 문서에 남긴다.
- 중간 상태의 TODO, blocker, diff는 채팅이 아니라 관련 기능 문서의 체크리스트로 남긴다.
- 작업이 여러 세션에 걸리면 가장 가까운 `DEV.md`, `SPEC.md`, `PRD.md`에 최소한 `Current State`, `Next Action`, `Verification Left`를 갱신한다.
- 다음 세션은 먼저 프로젝트 메모리, 그다음 관련 기능 문서, 마지막으로 직전 수정 파일을 읽고 시작한다.
- 채팅 기록만 믿고 이어가지 않는다. 설계 결정과 남은 작업은 반드시 저장소 안 문서로 고정한다.
- 코드 변경이 있었는데 문서가 업데이트되지 않았다면 세션 종료 전에 문서를 먼저 맞춘다.
- marimo 1:1 작업은 `frontend/PRD.md` 인덱스와 `frontend/prd/*.md` 분할 문서를 함께 source of truth로 유지한다.
- `frontend/PRD.md`는 짧은 인덱스와 진입점으로 유지하고, 마지막으로 확인한 source branch 또는 asset, 완료한 UI 영역, 아직 미완료인 체크리스트 항목, 알려진 diff 또는 blocker, 다음 비교 포인트는 `frontend/prd/10-summary-acceptance-and-copy-plan.md`를 우선 갱신한다.

## 현재 우선순위

- 1. 학습 UI 고도화 (자동완성, 인라인 에러 피드백, 진행 표시)
- 2. AI Teacher Provider 인터페이스 + GPT/Ollama 연동
- 3. 앱 모드 런타임 품질 개선
- 4. 위젯/뷰 브리지 구현
- 5. 모바일 대응
