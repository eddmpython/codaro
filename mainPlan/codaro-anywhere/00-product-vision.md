# 00. Product Vision - "WASM에게 로컬을 빌려주자"

상태: 비전 v0.1 (2026-07-10)
범위: 문제 정의, 기각 결정 3건과 코드 근거, 발명의 정확한 형태, 왜 Codaro만 만들 수 있는가, 성공/실패 기준.

---

## 1. 문제 정의

요구는 두 문장이다.

1. **완전 무료로 웹에서 돌아야 한다** - 카드 등록 없음, 서버 비용 0, 상시 접속.
2. **로컬급 파이썬이어야 한다** - 아무 패키지나 설치(①), 진짜 내 파일(②), OS 기능(③), 속도(④).

2026-07 조사 결론: 이 둘을 한 기술로 동시에 만족하는 것은 존재하지 않는다.

- 무료 조건을 만족하는 호스팅은 정적(GitHub Pages·Cloudflare Pages)뿐이다. 무료 서버 티어 중 생존자(HF Spaces·Render)는 방문자 전원이 커널 하나를 공유하는 구조가 되어, 임의 코드 실행이 기능인 제품에서는 격리 실격이다. Fly.io·Railway·Koyeb·Deta·Glitch의 무료 경로는 소멸했다.
- 정적에서 파이썬을 돌리는 유일한 기술(Pyodide/WASM)은 ①~④를 전부 만족하지 못한다: 네이티브 휠 불가, 가상 FS, threading/subprocess 불가, 3~5배 느림.

그러므로 답은 "한 기술"이 아니라 **컴퓨트가 살 수 있는 네 장소(브라우저 WASM · 내 컴퓨터 · 남의 무료 컴퓨트 · 빌드 타임)를 하나의 실행 모델로 엮는 것**이다.

## 2. 기각 결정 (재론 금지, 근거 박제)

### KILL-1. 전면 웹 전환
- 자동화 표면 전체가 상주 로컬 프로세스다: 스케줄러는 서버 이벤트 루프 상주 asyncio 잡(서버 기동 시 rehydrate, src/codaro/server.py:218-226), 터미널은 ConPTY/pty 실제 셸(src/codaro/api/terminalWebSocket.py:53-91), OS 감각계(pyautogui·mss·OCR·마이크)는 OS API 직결.
- 학습 검증의 99.7%(typed check 2,327개 중 noError 2,320개)가 살아있는 커널 세션을 요구한다(src/codaro/api/curriculumRouter.py:146-178).
- 커리큘럼 472개 중 326개가 서드파티 패키지 의존이고, xlwings(로컬 Excel COM)·pyautogui(진짜 데스크톱)·playwright 로컬 조작·torch급 네이티브 휠 트랙은 브라우저에서 원리적으로 불가.

### KILL-2. WASM Python 런타임 자체 개발 (Pyodide 대체)
- 규모: Pyodide는 2018년부터 커뮤니티가 8년째 만들고 있고, WebContainers는 전담 회사가 수년·대규모 투자로 만든 독점 기술이다. 진짜 난관은 런타임이 아니라 생태계(세상의 C/Rust 확장을 wasm32로 빌드하는 팜 유지)다.
- 정의상 천장: 완벽한 WASM 런타임도 Excel COM 조작, 마우스 제어, 탭 닫힌 뒤 스케줄러, 내 파일시스템 감시는 못 한다. 브라우저 샌드박스가 곧 웹 보안 모델이라 버전이 올라도 안 풀린다. 상한 약 85%, 안 되는 15%가 Codaro 정체성 핵심(개인 자동화 스튜디오).

### KILL-3. 무료 PaaS 공유 커널 서버
- 커널 1개를 다수 방문자가 공유하면 전역 변수·파일시스템·환경변수가 전부 공유된다. 한 사용자의 os.remove가 전원에게 미친다. 사용자별 컨테이너(JupyterHub 방식)는 무료 티어와 양립 불가. 무료 조건에서 안전한 격리는 브라우저 탭(각자 샌드박스)뿐이다.

## 3. 발명: 경계 계층 (capability router)

WebContainers의 발상은 "OS를 브라우저 안에 가상으로 만들자"였다. Codaro는 남들이 없는 것을 갖고 있다: **진짜 OS 위에 상주하는 로컬 엔진(트레이 런처)**. 그래서 발상을 뒤집는다.

> OS를 가상으로 만들지 말고, WASM의 능력 경계를 갈아끼울 수 있게 만들자.
> 브라우저 안 파이썬이 파일을 열면 - 기본은 가상 FS, 폴더 권한을 주면 진짜 내 폴더(File System Access API), 로컬 엔진이 연결돼 있으면 진짜 로컬 디스크.
> 프로세스가 필요하면 - 브라우저에선 불가지만, 로컬 엔진이 있으면 거기서 진짜로 뜬다.
> 네이티브 휠이 필요하면 - 그 셀만 로컬 또는 Actions로 라우팅된다.

이것이 세상에 없는 이유: WebContainers는 전부-브라우저, Jupyter/Colab은 전부-서버다. **능력 단위로 실행 위치를 라우팅하는 하이브리드 파이썬 노트북은 존재하지 않는다.**

## 4. 왜 Codaro만 만들 수 있나 (자산 목록, 조사로 실증)

| 자산 | 실체 | 왜 결정적인가 |
|---|---|---|
| AST 의존 분석 | src/codaro/document/analysis.py (import ast/re뿐) | 셀이 뭘 필요로 하는지(defines/uses)를 이미 정적으로 안다. 능력 판정은 이 분석의 확장이다. |
| 리액티브 그래프 | src/codaro/kernel/reactive.py (dataclass·집합 연산뿐) | stale 전파·실행 순서·순환 감지가 순수 Python. 라우터의 스케줄러가 된다. 문서가 처음부터 재실행 가능해 스테이트리스 티어(Actions)도 의미가 보존된다. |
| 스코프 격리 코어 | src/codaro/runtime/localWorker.py:210-220,252-270,436-463 | 격리가 프로세스가 아니라 dict 네임스페이스라 WASM으로 그대로 이식된다. |
| 엔진 스왑 구조 | src/codaro/runtime/executionEngine.py:75 (Protocol), src/codaro/kernel/session.py:21-25 | OS 의존이 LocalEngine 한 지점으로 수렴. PyodideEngine·ActionsEngine을 꽂으면 kernel 레이어(약 2,000줄)가 그대로 산다. |
| 출력 직렬화 | src/codaro/runtime/localWorker.py:597-703 (_normalizeResult) | stdout·PNG base64·DataFrame records가 이미 구조화 JSON. 어느 티어가 실행해도 같은 결과 포맷. |
| percent format | 모든 노트북이 `# %%` 달린 평범한 .py | Actions에서 `python file.py`로 변환 없이 돈다. |
| 상주 로컬 엔진 | 런처 트레이 상주(단일 인스턴스·부팅 자동시작) | "빌려줄 로컬"이 이미 켜져 있다. 경계 계층의 물리적 전제. |

## 5. 정체성·북극성 정합

- 실행 SSOT는 로컬 Python으로 불변이다. 브라우저·Actions는 보조 티어이고 tierUsed를 표면화한다. 이 구조는 local-first를 훼손하는 게 아니라 증명한다: "브라우저는 화면, 진실은 로컬."
- 북극성("실행 데모 -> 검증되는 졸업 자동화")과의 연결: 웹 티어는 설치 0초 진입점(실행 데모), 로컬 티어는 학습·자동화 본체, Actions 티어는 졸업 자동화의 무인 상주지(Harvest 레일의 물리적 완성).
- CLAUDE.md의 Pyodide 게이트(browser-only 우회를 커리큘럼 목표에서 제거)는 유지된다. 개정은 "로컬 SSOT 불변 + 보조 티어 허용"의 형태로만 한다([06 §7](06-scope-phasing-guardrails.md)). 개정 승인 전에는 Phase 1 이후 착수 금지.

## 6. 성공/실패 기준

**성공 (v1):**
1. 웹 표면(무료 정적)에서 순수 Python + Pyodide 패키지권(numpy·pandas·matplotlib) 셀이 즉시 실행되고, 같은 코드의 로컬 실행과 출력 JSON이 동등하다.
2. 로컬 엔진이 떠 있으면 웹 표면이 자동 감지·연결되고, 브라우저 불가 셀(네이티브 휠·파일·OS)이 로컬에서 실행된다. 사용자는 티어 전환을 배지로 인지한다.
3. 부트스트랩: 로컬 미보유 사용자가 "로컬 연결" 클릭 -> 포터블 번들 다운로드 -> 더블클릭 1회 -> 자동 연결까지 5분 이내.
4. 커리큘럼 472개 레슨 각각에 browserRunnable 판정이 빌드 타임에 붙고, 웹 표면이 정직하게 표시한다.

**실패로 간주 (중단 트리거):**
- 브라우저 티어와 로컬 티어의 실행 결과가 동등성 테스트에서 설명 불가능하게 갈리는 경우(일관성 원칙 붕괴).
- Phase 0 census에서 PNA/FSA/TURN 중 둘 이상이 설계 전제를 무너뜨리는 경우(예: PNA 정책 변경으로 localhost 연결 자체가 막히는 경우).
- 게이트 개정이 승인되지 않는 경우(웹 티어는 열람+로컬 브리지까지로 축소).
