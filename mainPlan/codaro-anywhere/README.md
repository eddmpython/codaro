# Codaro Anywhere - 경계 계층(capability router) PRD Index

상태: 비전 + 상세 설계 v0.1 (2026-07-10, 웹 방향 토론 결정 + 코드베이스 전수 조사 dossier 기반)
범위: "완전 무료로 웹에서 로컬급 파이썬"이라는 요구를, 실행을 웹으로 옮기지 않고 **실행 위치를 능력 단위로 라우팅하는 경계 계층**으로 푼다. 브라우저 WASM(즉시성) · 내 로컬 엔진(완전성) · GitHub Actions(무인성) 3티어를 기존 `ExecutionEngine` Protocol 뒤에 세우고, 리액티브 AST 분석이 셀마다 실행지를 배정한다.

구현 착수 기준은 [06-scope-phasing-guardrails.md](06-scope-phasing-guardrails.md)의 phase 게이트가 우선한다. 비전과 구현이 충돌하면 06의 phase·가드·롤백을 따른다.

---

## 한 줄 결정

**Codaro Anywhere는 "웹에서도 도는 Codaro"가 아니라, WASM Python의 능력 경계(파일·패키지·프로세스)를 갈아끼울 수 있게 만들어 브라우저가 내 로컬을 빌려 쓰게 하는 경계 계층이다. 실행 SSOT는 언제나 로컬 Python이고, 브라우저와 Actions는 리액티브 그래프가 셀 단위로 배정하는 보조 티어다.**

```text
web surface (Cloudflare Pages, 무료 정적)
  -> capability router (AST 의존 분석 = 셀별 요구 능력 판정)
    -> Tier ladder
         browser   PyodideEngine (Web Worker WASM CPython - 즉시성, 기초·pandas·시각화)
         local     LocalEngine (기존 엔진, 루프백/WebRTC - 완전성, 항상 우선)
         actions   ActionsEngine (사용자 소유 리포의 GitHub Actions - 무인성·네이티브 휠 폴백)
```

---

## 무엇을 만드나 (Section A)

1. **PyodideEngine** - `ExecutionEngine` Protocol([executionEngine.py:75](../../src/codaro/runtime/executionEngine.py))의 두 번째 구현. Web Worker에서 Pyodide를 돌리고, 기존 localWorker의 순수 Python 코어(cellScope dict 격리 + registry 주입 + AST 수확)와 `kernel/reactive.py`·`document/analysis.py`를 그대로 탑재한다. 조사 결론: 이 코어는 OS 의존이 없어 수정 없이 이식 가능하다.
2. **capability router** - 셀 코드의 AST에서 요구 능력(파일 I/O·패키지·프로세스/OS)을 정적 판정하고 티어를 배정한다. 로컬 연결 시 로컬 우선, 미연결 시 브라우저 가능 셀만 즉시 실행, 불가 셀은 "로컬 연결" 또는 "클라우드 실행" 배지.
3. **진입 부트스트랩** - Chromium/Edge File System Access API로 진짜 사용자 폴더를 웹 티어에 마운트. 로컬 티어는 임베디드 CPython 포터블 번들(10~15MB, 무설치·무관리자)로 "웹페이지가 자기 런타임을 데려오는" UX. localhost 연결은 LNA 사용자 권한 프롬프트 + CORS 배선(census로 PNA 폐기 확인).
4. **WebRTC 개인 클라우드** - 런처(상주 트레이)가 방 코드/QR을 발급하고, 외부 브라우저가 P2P 데이터채널로 내 로컬 엔진에 직결한다. "네 클라우드는 네 컴퓨터다."
5. **ActionsEngine** - 사용자 소유 리포의 GitHub Actions를 dispatch→poll 배치 런타임으로. 리액티브 문서는 정의상 처음부터 재실행 가능하므로 스테이트리스 VM이 치명상이 아니다. 자동화 태스크의 무료 클라우드 승격(Harvest 레일)을 겸한다.

## 무엇을 잠그나 (Section B)

6. **실행 SSOT = 로컬 불변.** 학습 검증·숙달 판정의 기준 실행은 로컬 Python이다. 브라우저 티어를 학습 SSOT로 승격하지 않는다(CLAUDE.md 게이트 개정은 "보조 티어 허용"까지만, [06 §7](06-scope-phasing-guardrails.md)).
7. **기각 3건 재론 금지** - 전면 웹 전환, WASM 런타임 자체 개발, 무료 PaaS 공유 커널([05](05-killlist-and-non-goals.md)).
8. **가짜 실행 금지** - 현행 print 정규식 시뮬레이션(editor/src/lib/localRuntime.ts)을 정식 표면으로 승격하지 않는다. 실행은 진짜 CPython(WASM 포함)만.

---

## 문서 지도

1. [00-product-vision.md](00-product-vision.md) - 문제 정의, 기각 3건과 근거, 발명("WASM에게 로컬을 빌려주자"), 왜 Codaro만 만들 수 있나, 성공/실패 기준.
2. [01-tier-architecture.md](01-tier-architecture.md) - 3티어 엔진 아키텍처, capability router 판정 규칙, 이식/재구현 경계(코드 근거), 인터럽트·일관성 설계.
3. [02-entry-and-bootstrap.md](02-entry-and-bootstrap.md) - 진입 UX, Chromium FSA 마운트, 임베디드 CPython 포터블 부트스트랩, PNA/CORS·호스팅(Cloudflare Pages) 배선.
4. [03-remote-access-p2p.md](03-remote-access-p2p.md) - WebRTC 개인 클라우드, 페어링·권한 스코프·E-Stop 보안 모델, TURN 검증 항목.
5. [04-actions-runtime.md](04-actions-runtime.md) - ActionsEngine 설계, 사용자 소유 리포 모델과 ToS 경계, 자동화 승격 레일, 해결/미해결 능력 표.
6. [05-killlist-and-non-goals.md](05-killlist-and-non-goals.md) - 안 하는 것(기각 3건·중앙 실행 팜·가짜 실행·과제방 유스케이스 보류 등).
7. [06-scope-phasing-guardrails.md](06-scope-phasing-guardrails.md) - Phase 0~5, 기계 가드레일, 테스트 매트릭스, 롤백, 개발자+PM 이중 평가, CLAUDE.md 게이트 개정안.
8. [07-progress-ledger.md](07-progress-ledger.md) - 결정 원장·세션 간 재개(NEXT).
9. [08-borrowed-syscall-bridge.md](08-borrowed-syscall-bridge.md) - **발명 + 실측**: JSPI 위 syscall 브리지로 소켓·프로세스를 로컬에서 빌려 http.client/urllib/smtplib/subprocess를 브라우저에서 살린 headless 검증 결과.
10. [09-non-pyodide-real-runtime.md](09-non-pyodide-real-runtime.md) - **비-Pyodide 탐색**: 파이썬이 "실제 로컬 서버처럼" 도는 브라우저 가상화. CheerpX 실측(진짜 CPython 3.7.3+스레드+UDS는 되나 netdev 부재로 서버 unreachable) + 토론 랭킹(v86+lwIP가 유일한 오픈소스 로컬 인바운드 경로).
11. [10-browser-as-server.md](10-browser-as-server.md) - **재프레임 + 엔드투엔드 실측(정말로 가능한 방향)**: "로컬 서버=소켓 아니라 WSGI 인터페이스". 진짜 Flask/FastAPI가 Pyodide에서 소켓 0으로 라우팅/sqlite/세션/pydantic검증, Service Worker가 페이지 fetch를 연결 -> 페이지가 표준 fetch로 브라우저 안 파이썬 서버 호출(GET/POST/201/422/상태유지 PASS). 속도: 서버 로직은 로컬급(numpy만 예외). VM보다 압도적 실현가능.
12. [11-beyond-local-directions.md](11-beyond-local-directions.md) - **로컬 초월 방향 검토**: WebGPU 수치가속(numpy 86배 약점 뒤집기, 실PC 필요-headless 검증불가) + 실행환경=값(makeMemorySnapshot 공식+HEAPU8 검증, 로컬이 원리적으로 못 함). 토론 랭킹 통합 예정.

---

## 한계 표기 원칙 (전 문서 관통)

1. **새 발명 최소화.** PyodideEngine의 심장은 localWorker의 기존 순수 Python 코어를 옮기는 것이고, 라우터의 판정은 이미 있는 AST 분석(document/analysis.py)의 확장이다. 신설은 경계 계층(능력 라우팅)과 부트스트랩뿐.
2. **티어는 조용히 바뀌지 않는다.** 어느 티어가 실행했는지(tierUsed)를 셀 결과에 표면화한다. 브라우저 실행 결과와 로컬 실행 결과가 다를 수 있는 지점(가상 FS·패키지 부재)은 숨기지 않고 배지로 보인다.
3. **"완전 무료"의 조건을 명시한다.** 무료는 정적 호스팅 + 사용자 소유 컴퓨트(자기 PC·자기 GitHub 리포)의 조합이다. 우리가 서버 비용을 대신 내는 구조는 없다.
4. **브라우저 티어의 상한을 정직하게.** 네이티브 휠(torch·polars 등)·데스크톱 조작(xlwings·pyautogui)·상주 스케줄은 브라우저에서 영원히 불가하다. 이 한계는 기술 부채가 아니라 웹 보안 모델이다.
5. **Actions 티어의 상한도 정직하게.** 레이턴시 30~120초(셀 REPL 불가), 러너에 Excel·데스크톱 없음, 비공개 리포 월 2,000분. "느리지만 뭐든 되는 배치 폴백"으로만 포지셔닝한다.
6. **외부 사실은 검증 전 확정하지 않는다.** TURN 무료 한도, mountNativeFS 지원 범위, PNA 정책 세부는 Phase 0 census 항목이다(2026-07 조사값은 각 문서에 조사 시점과 함께 기록).
