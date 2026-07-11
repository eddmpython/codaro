# 18. pyproc 레포 분리 - 웹 파이썬 런타임을 별도 SSOT로

상태: 실물 착수 완료 v0.1 (2026-07-11). 결정(사용자): 웹 파이썬 런타임 발명을 별도 레포로 빼서 dartlab/xlpod가 빠르게 가져다 쓰게 하고, 그 레포를 키우면 자동으로 SSOT가 된다.

레포: `github.com/eddmpython/pyproc` (초기 커밋 `4132302`, main 전용). 로컬 경로: `sideProject/pyproc/` (codaro 저장소 밖, 형제 폴더).

---

## 0. 한 줄

**codaro-anywhere에서 검증한 웹 파이썬 발명(런타임·복원 리액티브·프로세스 OS·능력 계약)을 codaro 저장소에서 떼어 `pyproc`라는 프레임워크 무관 ESM 라이브러리로 승격했다. codaro가 first consumer이고, dartlab/xlpod는 버전 태그로 점진 이관한다. "참조"가 아니라 "실제 import"로만 SSOT가 성립한다.**

## 1. 왜 별도 레포인가

- codaro 저장소 규칙(repository-structure·root-clean·Python/uv 게이트)은 제품용이라, 범용 JS 런타임 라이브러리를 담기엔 마찰이 크다. 능력 라우팅/발명 코드가 codaro의 `tests/_attempts`(git 미추적)에 갇혀 있으면 다른 제품이 못 가져간다.
- dartlab·xlpod가 같은 브라우저 파이썬 런타임을 필요로 한다. 각자 복붙하면 3벌이 갈라진다. 하나의 버전 태그된 패키지를 세 제품이 import하면 개선이 한 곳에 모인다.
- 레포를 독립시키면 그 자체 테스트/문서/릴리즈 라인을 가지고, 성장분이 자동으로 세 제품의 공통 기반이 된다. 이것이 사용자가 말한 "키우면 자동 SSOT".

## 2. 무엇을 옮겼나 (검증조각 -> 모듈 승격)

codaro `tests/_attempts`의 검증된 실험을 pyproc의 깨끗한 ESM 모듈로 정리:

| pyproc 모듈 | 출처(검증조각) | 내용 |
| --- | --- | --- |
| `src/runtime.js` | browserPy.js | Pyodide 래퍼 `boot`/`Runtime` + `MemoryCapability` 능력 계약(HEAPU8/스택/완전해시 캡슐화) |
| `src/reactive.js` | browserPy.js ReactiveController | 복원 기반 리액티브(완전 해시 체크포인트 체인 + 라이브-차분 복원 + 시간여행). 문서 [14-restore-based-reactive](13-restore-based-reactive.md) |
| `src/processOS.js` + `src/worker.js` | pyproc.js/pyprocWorker.js | 프로세스 OS 커널: 스냅샷-fork spawn + `map` 병렬. 문서 [18-pyproc-process-os](17-pyproc-process-os.md) |
| `src/syscallBridge.js` | 08-borrowed-syscall-bridge 로직 자리 | socket/subprocess/input을 빌려주는 능력 계약(스텁, 소비 제품이 엔드포인트 채움) |

능력 계약 패턴은 문서 [16-browserpy-module](15-browserpy-module.md)의 설계를 그대로 따른다. 소비자는 `HEAPU8`를 직접 만지지 않고 계약 메서드만 쓴다.

## 3. 레포 골격 (codaro/dartlab 급 세팅)

- **규칙 문서**: 로컬 규칙 SSOT + 진입 포인터. main 전용, 빌드 없는 ESM, camelCase, 능력 계약 경유, 소비 계약(버전 태그 고정).
- **훅**: codaro `.githooks` 이식(commit-msg=도구/기여자 흔적 차단, pre-commit=em dash 차단[스코프 `*.md`+`*.js`], pre-push/reference-transaction=main 전용). `.gitattributes`로 훅 LF 고정(CRLF면 sh 깨짐).
- **테스트**: `npm test` = Node 구조/린트 게이트(공개 표면 존재·타입, 능력 계약 메서드, em dash 0, worker 계약). 의존성 0. 21/21 PASS. 브라우저 실측은 `examples/`(basic·processOs) crossOriginIsolated 서버로.
- **공개 표면**: `index.js` + `exports`(`.`/`./runtime`/`./reactive`/`./syscall-bridge`/`./process-os`/`./worker`). 버전 `0.0.x` 라인.

## 4. 소비 경로 (codaro가 first consumer)

1. **소비 방식 = 커밋 SHA 핀.** codaro 에디터가 `editor/package.json`에 `"pyproc": "github:eddmpython/pyproc#<sha>"`로 커밋 SHA를 박아 npm으로 설치한다. 태그가 아니라 SHA로 핀한다(불변·재현 가능, 태그는 실제 릴리즈 전까지 만들지 않음). `files` 목록만 반입되므로 내부 규칙 문서·훅·테스트는 소비자에 실려 나가지 않는다.
2. **첫 증명 = codaro import 검증 완료(2026-07-11).** [browserPythonRuntime.ts](../../editor/src/lib/browserPythonRuntime.ts)가 pyproc의 `boot`/`PyProc` + 타입(`Runtime`/`BootOptions`/`PyProcBootInfo`)을 실제 import한다. 3단계 검증 green: (a) npm이 SHA 핀 git 의존성 해석(규칙 문서 미반입 확인), (b) codaro 실제 tsconfig(`moduleResolution: Bundler`, `allowJs: false`)로 `tsc -b` exit 0(타입까지 해석), (c) codaro 설치 Vite로 번들 시 `new Worker(new URL("./worker.js"))`가 워커 청크로 emit. 아직 UI 표면 배선 전(seam만 존재).
3. **dartlab/xlpod**: 같은 SHA 핀 방식으로 pyproc을 가져와 각자 표면(에디터/시트)을 얹는다. 제품 UI/도메인은 pyproc에 넣지 않는다.
4. **SSOT 성립 조건**: 세 제품이 실제로 import해야 SSOT다. 참조만으로는 아니다. codaro import 검증이 첫 증명(끝난 것은 plumbing, 다음은 PyodideEngine이 이 seam을 실제 실행 티어로 사용).

## 5. 경계 (pyproc에 넣지 않는 것)

- 제품 UI, 도메인 로직(커리큘럼·자동화·시트), capability router의 티어 배정 정책(제품별로 다름).
- 로컬 엔진/Actions 엔진(codaro `ExecutionEngine` 3티어는 codaro 소유). pyproc은 브라우저 티어의 런타임 프리미티브만 제공.
- Firefox/Safari 지원(스코프 밖: JSPI+SAB+crossOriginIsolated 필요, Chromium/Edge 전용).

## 6. 판정

- **실물 착수 완료**: 검증조각 4모듈 승격 + 규칙/훅/테스트 세팅 + 타입 선언(index.d.ts) + push. Node 게이트 29/29 green.
- **SSOT 링크 성립(검증됨)**: codaro가 pyproc을 커밋 SHA 핀으로 실제 소비, 3단계(npm 해석·tsc 타입·Vite 워커 emit) 검증 green. "참조"에서 "실제 import"로 넘어옴.
- **내부 규칙 문서는 로컬 전용**: 에이전트/개발 규칙 문서는 gitignore(codaro/dartlab 동급), 공개 레포·npm 패키지에 안 올린다.
- **다음**: PyodideEngine([14-architecture](14-architecture.md))이 seam(browserPythonRuntime)을 실제 실행 티어로 사용하도록 UI 표면 배선. 이후 dartlab/xlpod 이관. warm-fork/nogil 프론티어(문서 17)는 pyproc 레포에서 계속.
