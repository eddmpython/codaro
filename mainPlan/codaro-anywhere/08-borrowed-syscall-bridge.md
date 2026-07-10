# 08. Borrowed Syscall Bridge - "WASM에게 로컬을 빌려주자"의 실제 구현

상태: 발명 + 실측 v0.1 (2026-07-10). 이 문서의 모든 PASS/FAIL은 tests/_attempts/webPythonProbe.html로 headless(playwright, Chrome, Pyodide 314.0.2, crossOriginIsolated=true) 실측한 결과다.
범위: 브라우저 파이썬에서 안 되던 OS 능력(소켓·프로세스·병렬)을 로컬 자원으로 라우팅하는 계층의 발명과 증거. capability router([01](01-tier-architecture.md))의 syscall 레벨 기층.

---

## 1. 한 줄 발명

**JSPI(WebAssembly 스택 스위칭) 위에 syscall 브리지를 얹으면, 브라우저 안 CPython이 로컬의 소켓·프로세스를 빌려 쓴다. 수정 없는 표준 라이브러리(http.client·urllib·smtplib·subprocess)가 그대로 돈다.**

열쇠는 JSPI다. 블로킹처럼 생긴 파이썬 코드가 UI를 얼리지 않고 JS Promise를 기다린다(`pyodide.ffi.run_sync(promise)` 실측 성공). 이 위에서 안 되던 syscall을 로컬 자원으로 라우팅한다.

## 2. 실측 점수판 (전부 headless PASS/FAIL)

| 능력 | 순정 Pyodide 314 | 발명 적용 후 | 증거 |
|---|---|---|---|
| pandas/numpy/polars/duckdb/opencv | PASS | - | import + 연산 실측 |
| File System Access(진짜 폴더) | PASS | - | mountNativeFS write + openpyxl xlsx |
| threading.Thread.start | **FAIL** (pthread-stubs, "can't start new thread") | 여전히 FAIL | sys.thread_info 확인 |
| 병렬 계산 | FAIL | **PASS** - Worker 풀 4개 speedup 3.81배 | 별도 WASM 힙 = 별도 GIL |
| concurrent.futures 투명 에뮬 | FAIL | **PASS** - cloudpickle로 클로저/람다 워커 왕복, 로컬 결과 일치 | ProcessPoolExecutor 대체 가능 |
| socket 블로킹 recv | FAIL (Emscripten TimeoutError) | **PASS** - BridgedSocket | - |
| http.client / urllib.urlopen | FAIL | **PASS** - example.com status 200 | 수정 없는 표준 라이브러리 |
| smtplib | FAIL | **PASS** - 로컬 SMTP에 ehlo 250 + 메일 전송 | aiosmtpd 서버 로그 확인 |
| subprocess.run(python -c/스크립트) | FAIL (Errno 138) | **PASS** - stdout 'child ok', rc 7, 격리 | 자식 Pyodide 워커 |
| TLS in-Python(ssl.wrap_socket) | FAIL | **FAIL** (negative fd, OpenSSL은 진짜 fd 필요) | 원리적 한계 |
| https/smtps | FAIL | **PASS** - 로컬 프록시 TLS 종단으로 status 200 | 프록시가 TLS, 브라우저는 평문 |

## 3. 메커니즘 (구성요소 3개)

### 3.1 JSPI syncify (기층)
- `WebAssembly.Suspending` 존재 확인. `run_sync(promise)`가 파이썬 스택을 suspend하고 Promise resolve 시 값과 함께 재개. UI 스레드에서 얼지 않음(Atomics.wait 불필요).
- 이것이 "블로킹 파이썬 API"를 브라우저에서 성립시키는 핵심. 없으면 소켓/subprocess 동기 시맨틱 불가.

### 3.2 BridgedSocket (네트워크 빌리기)
- Emscripten 내장 소켓은 블로킹 recv를 못 펌프해서 버린다. 대신 `socket.create_connection`을 몽키패치해 BridgedSocket을 주입.
- BridgedSocket = JS WebSocket -> 로컬 WS<->TCP 프록시(`CONNECT host:port` 프로토콜) -> 진짜 TCP. recv는 run_sync로 블로킹.
- 프록시가 TLS를 종단(`CONNECT-TLS`)하면 https/smtps도 성립. 브라우저 안 ssl 모듈은 fd가 없어 못 쓰므로 이 방식이 유일한 정공법.
- socket의 표준 속성(family/type/proto/makefile/recv_into 등)을 갖춰야 http.client·smtplib가 무수정 동작.

### 3.3 자식 Pyodide 워커 (프로세스 빌리기)
- `subprocess.run`을 몽키패치. argv[0]이 파이썬이면 `-c` 코드/스크립트를 자식 Pyodide 워커로 run_sync 라우팅해 동기 CompletedProcess 반환.
- 자식은 독립 인터프리터(부모 전역 안 보임 = 프로세스 격리 시맨틱 보존). mountNativeFS 핸들을 자식과 공유하면 스크립트가 진짜 파일을 읽는다.
- 비파이썬 프로세스(git/ffmpeg)는 로컬 엔진 있으면 라우팅, 없으면 명확한 에러(현재의 크립틱 실패 대체).

## 3.4 브라우저 지원 범위 (실측, 결정적)
- **Chrome/Edge 전용.** Firefox 150 실측: JSPI 미지원(WebAssembly.Suspending 없음), run_sync 실패, File System Access 미지원. 즉 브리지(소켓·subprocess)도 진짜 파일도 Firefox에서 불가.
- Chromium 대조: JSPI·run_sync·FSA 전부 PASS.
- 귀결: 웹 티어 고급 기능(브리지+진짜 파일)은 Chromium 계열 한정. Firefox/Safari는 기본 Pyodide(pandas 등 계산)까지만, 나머지는 로컬 티어로 안내([02 §2](02-entry-and-bootstrap.md)와 일치).

## 4. 정체성 정합

- 이것이 "WASM에게 로컬을 빌려주자"([00](00-product-vision.md))의 **문자 그대로의 구현**이다. 브라우저는 화면, 소켓·프로세스의 진실은 로컬 프록시/엔진.
- 실행 SSOT 로컬 불변 원칙과 정합: 브리지가 빌리는 자원(TCP·프로세스)의 주체는 상주 로컬 엔진이다. 로컬 엔진이 없으면 브리지도 없다(우아한 강등, [06 G2](06-scope-phasing-guardrails.md)).
- tierUsed 표면화: 소켓/subprocess가 브리지로 갔음을 배지로 보인다. 브라우저 단독 실행과 로컬 빌림을 숨기지 않는다.

## 5. 원리적 한계 (발명으로도 안 뚫림 = 로컬 티어 전속)

- 진짜 threading(같은 힙 공유메모리 스레드): pthread 미빌드. Worker 풀은 별도 힙이라 공유 전역/락 시맨틱이 다르다. `threading` 자체를 쓰는 레슨은 로컬 전속.
- xlwings(Excel COM), pyautogui(데스크톱), playwright(브라우저 조작), torch(네이티브 휠). 프록시로도 못 빌림 - 호스트 자원 자체가 브라우저에 없음.

## 6. 리스크와 다음 검증 (Phase 1 편입 전)

- **보안(최우선)**: 로컬 프록시가 브라우저에 임의 TCP를 빌려주면 내부망 스캔·SSRF 위험. 프록시는 대상 allowlist + 웹 오리진 페어링([03 §3](03-remote-access-p2p.md)) 필수. LNA 프롬프트와의 상호작용 확인.
- **누가 프록시를 제공하나**: 로컬 엔진이 있으면 엔진이 프록시. 로컬 엔진이 아예 없는 순수 브라우저 배포에서는 소켓/subprocess가 여전히 불가(강등). 즉 이 발명의 실익은 "로컬 엔진 연결 상태에서 브라우저 UI로 매끄럽게" 구간. 로컬 완전 부재 시엔 파일/pandas권까지만.
- JSPI 브라우저 범위: Chrome 실측 성공. Firefox/Safari 지원은 검증 항목.
- 자식 워커 메모리(N MB x 워커), 부팅 지연(프리부팅으로 은닉), run_sync 중첩 안전성.

## 7. 실험 위치

- `tests/_attempts/webPythonProbe.html`(능력 프로브 + 3 브리지), `webPythonLab.html`(2경로 비교), `webPythonLabServe.py`(COOP/COEP 서버). git 미추적 로컬 실험(평면 파일). 서버 실행: `uv run python -X utf8 tests/_attempts/webPythonLabServe.py`.
- 프록시/에코/SMTP 하네스는 세션 scratchpad(wsTcpProxy.py 등). 제품 편입 시 로컬 엔진(src/codaro)으로 승격.
