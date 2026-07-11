# 12. Serverless Web Terminal - 서버 없이 웹에서 도는 진짜 터미널

상태: 발명 + 엔드투엔드 실측 v0.1 (2026-07-11). 목표(사용자): 서버가 아니라 웹에서 도는 터미널 환경 발명. Codaro 터미널 표면(현재 로컬 서버 PTY/terminalWebSocket)의 서버리스 버전. 실측 = tests/_attempts/webTerminal.html(headless Chrome, Pyodide 314).

---

## 0. 한 줄
**셸을 파이썬 프로그램으로 구현하고 Pyodide(브라우저 안 진짜 CPython)에 태우면, 서버 없이 진짜 명령을 실행하는 터미널이 된다. 핵심 발명 = JSPI로 input()이 실제로 블록했다가 타이핑에 재개되는 진짜 대화형.**

## 1. 엔드투엔드 실측 (PASS)

| 명령 | 결과 |
|---|---|
| pwd / ls / cat data.txt / echo | 진짜 파일시스템/출력 |
| python -c "print(2**10)" | 1024 (진짜 Pyodide exec) |
| **pip install pyfiglet** | **진짜 micropip 설치 -> `python -c "import pyfiglet..."`가 ASCII 아트 출력** |
| python hello.py (input 있음) | **input()이 JSPI로 블록 -> 재개 -> "안녕, {name}!"** |
| **실시간 대화형** | 명령 발사 -> input() 블록(1.5초 후 대기 확인) -> 타이핑 "실시간유저" 도착 -> 재개 -> "안녕, 실시간유저!" **PASS** |

**서버 0, VM 0. 진짜 CPython 3.14가 명령을 실행하고, input()이 진짜 블록/재개한다.**

## 2. 메커니즘
- **셸 = 파이썬 프로그램**: dispatch(line)이 shlex 파싱 후 명령 라우팅(ls/cat/cd/pwd/mkdir/echo/env -> os 함수, python/python3 -> Pyodide exec, pip -> micropip). 종료코드/env/파이프/리다이렉트/글롭은 확장 여지(토론 pysh 설계).
- **대화형 input() = JSPI**: builtins.input을 몽키패치해 `run_sync(js._await_input_js())`. JSPI가 파이썬 스택을 suspend하고 이벤트루프에 제어를 돌려줌(UI 안 얼음, Atomics.wait 불필요). 타이핑이 Promise를 resolve하면 그 값으로 재개. 셸 프롬프트/스크립트 input()/REPL 다음 줄이 전부 같은 라인 리더 하나를 씀.
- **진짜 파일**: 기본 가상 FS(시연), 실사용은 File System Access mountNativeFS로 진짜 폴더(showDirectoryPicker는 메인 스레드, 핸들 postMessage로 워커 전달, syncfs로 디스크 반영 - [02 §3], [08] 검증).
- **Ctrl+C**: Worker.terminate 후 재기동(프로세스 kill 등가) 또는 SAB interruptBuffer.

## 3. 전문가 토론 랭킹 (1위가 실측한 것과 동일)
1. **pysh - 순수 파이썬 셸(Pyodide-in-Worker + JSPI 라인 REPL)**: 실측한 것. 파이프/리다이렉트/글롭/`&&`/`||`/`$?`/명령치환까지 파이썬으로. 서버 0.
2. **codash - 하이브리드 capability-router 셸**: 브라우저 셸 기본 + subprocess는 자식워커([08]) + 진짜 OS 바이너리(git/ffmpeg/docker)만 로컬 엔진 PTY 라우팅([01] 라우터). tierUsed 배지, 로컬 미연결 시 종료코드 127 + "로컬 연결" 강등. 기존 terminalWebSocket과 공존.
3. **wcoreutils - WASI 유틸 바이너리 백엔드**: ls/grep/sed/awk를 파이썬 재구현 대신 WASI(wasm32-wasip1) 진짜 바이너리로 실행, 파일시스템은 FSA/OPFS 연결. python은 Pyodide.

## 4. 정직한 한계
- 진짜 bash가 아니라 bash 문법을 파이썬으로 재현한 셸. 됨: 파이프/리다이렉트/글롭/논리연산/명령치환/env/python/pip. 안 됨(또는 로컬 라우팅): job control(`&` 백그라운드), 진짜 signal(SIGINT만 terminate로 흉내), threading(pthread 미빌드), 진짜 외부 바이너리(git/ffmpeg = codash의 로컬 티어 몫), subprocess(자식워커로).
- Chromium/Edge + JSPI + FSA 한정(Firefox/Safari는 계산권까지). run_sync 중첩(input 안에서 input) 안전성은 검증 항목. 대용량 폴더는 mountNativeFS 사본/syncfs 비용.

## 5. 판정
**서버 없는 웹 터미널은 실현된다 - 진짜 명령 실행 + 진짜 대화형까지 실측.** Codaro 터미널 표면의 서버리스 버전이 성립. 정공 편입 경로 = pysh(순수 브라우저) 기본 + codash(하이브리드)로 진짜 OS 명령은 로컬 엔진 라우팅. xterm.js UI 재사용. 실험: tests/_attempts/webTerminal.html(git 미추적).
