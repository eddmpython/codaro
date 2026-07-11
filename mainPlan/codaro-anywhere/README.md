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
12. [11-beyond-local-directions.md](11-beyond-local-directions.md) - **로컬 초월 방향 검토**: WebGPU 수치가속(numpy 86배 약점 뒤집기, 실PC 필요-headless 검증불가) + 실행환경=값(makeMemorySnapshot 공식+HEAPU8 검증) + 영속 상태서버(sqlite+IndexedDB 재시작 생존 PASS). 3축 초월, 무인데몬만 원리적 상한.
13. [12-serverless-web-terminal.md](12-serverless-web-terminal.md) - **서버 없는 웹 터미널 발명 + 엔드투엔드 실측**: 셸=파이썬 프로그램(Pyodide), 명령/pip/python 진짜 실행, **JSPI로 input()이 진짜 블록/재개(실시간 대화형 PASS)**. 토론 1위 pysh=실측본, 2위 codash 하이브리드(진짜 OS 명령만 로컬 라우팅).
18. [17-pyproc-process-os.md](17-pyproc-process-os.md) - **대혁신 실물: PyProc 브라우저 파이썬 프로세스 OS**. 검증조각(스냅샷fork·워커풀·SAB IPC·복원)을 하나의 프로세스 커널로 융합. 실측: 4워커 진짜 병렬 map 2.67배·정확, multiprocessing.Pool API. 전문가 4렌즈 만장일치 대혁신. 다음 돌파=nogil+pthread 커스텀빌드(제로카피+공유스레드).

19. [18-pyproc-repo-extraction.md](18-pyproc-repo-extraction.md) - **레포 분리 실물 착수**: 웹 파이썬 발명(런타임·복원 리액티브·프로세스 OS·능력 계약)을 codaro 밖 별도 레포 `github.com/eddmpython/pyproc`(초기 커밋 `4132302`, main 전용)로 승격. codaro `tests/_attempts` 검증조각 4모듈을 프레임워크 무관 ESM으로 정리, codaro/dartlab 급 규칙 문서·훅·의존성0 게이트(21/21 PASS). codaro가 first consumer, "참조"가 아니라 "실제 import"로만 SSOT 성립. 다음=PyodideEngine이 pyproc을 실제 import.

20. [19-web-service-build.md](19-web-service-build.md) - **웹 서비스 완성 구현 계획(착수)**: React+astryx(@astryxdesign/core 0.1.4, StyleX 기반) 디자인 시스템으로 랜딩·학습 웹 재구축 + pyproc 위 codaro FastAPI 브라우저 서빙(SW+ASGI) + GitHub Pages 갈아엎기. P0 실증 완료: astryx가 landing Vite에서 빌드 통과(95모듈). doc 14(아키텍처) 구현 계획, P0~P6 phasing.

17. [16-real-runtime-transformation.md](16-real-runtime-transformation.md) - **진짜 런타임 탈바꿈(발명+실측)**: 힙 스냅샷을 fork 프리미티브로 승격 -> 단일 인터프리터가 프로세스 OS로. 실측: bare 스냅샷 fork 15.4배 빠름(184ms vs cold 2839ms)·독립 프로세스. warm fork(재임포트0)는 hiwire 경계가 막음(프론티어=emval shadow). 토론 랭킹 통합 예정.

16. [15-browserpy-module.md](15-browserpy-module.md) - **모듈화(설계+참조구현+소비자 PASS)**: 발명들을 프레임워크 무관 ESM 모듈로. 교차 관심사(HEAPU8·스택·몽키패치)를 능력 계약(MemoryCapability 등) 뒤 캡슐화. 소비자가 깨끗한 API만으로 복원 리액티브 사용(HEAPU8 직접접근 0) 실측 PASS. codaro/dartlab/xlpod 공통 소비.

15. [14-architecture.md](14-architecture.md) - **전체 아키텍처 종합**: ExecutionEngine Protocol 뒤 3티어(Local/Pyodide/Actions) + capability router + 브라우저 표면(노트북/서버/터미널/커리큘럼). OS 의존이 엔진 한 지점 수렴 -> 나머지 무수정 재사용. 발명들이 PyodideEngine 내부로 모임. 기존 5층의 확장(개편 아님).

14. [13-restore-based-reactive.md](13-restore-based-reactive.md) - **제대로 된 발명 + 돌파(조합 아닌 새 메커니즘)**: WASM엔 없는 dirty-page 추적을 실행경계 해시 diff로 재구성, page-diff 체크포인트 체인을 리액티브 그래프에 결합해 재실행 없이 복원. **돌파(토론->실측->수정)**: 미리성장 천장(WASM 성장 제거) + 완전해시(델타 완전) 두 수정으로 pandas 워크로드도 sound. **리액티브 편집 9.1배(콜드 ~165배) 빠름, 정확, 크래시 0, 시간여행 정확.** Pyodide 공식 스냅샷이 금지한 mid-session 복원을 뚫음. 남은 개선=천장 자동조정·델타복원·emval shadow.

---

## 한계 표기 원칙 (전 문서 관통)

1. **새 발명 최소화.** PyodideEngine의 심장은 localWorker의 기존 순수 Python 코어를 옮기는 것이고, 라우터의 판정은 이미 있는 AST 분석(document/analysis.py)의 확장이다. 신설은 경계 계층(능력 라우팅)과 부트스트랩뿐.
2. **티어는 조용히 바뀌지 않는다.** 어느 티어가 실행했는지(tierUsed)를 셀 결과에 표면화한다. 브라우저 실행 결과와 로컬 실행 결과가 다를 수 있는 지점(가상 FS·패키지 부재)은 숨기지 않고 배지로 보인다.
3. **"완전 무료"의 조건을 명시한다.** 무료는 정적 호스팅 + 사용자 소유 컴퓨트(자기 PC·자기 GitHub 리포)의 조합이다. 우리가 서버 비용을 대신 내는 구조는 없다.
4. **브라우저 티어의 상한을 정직하게.** 네이티브 휠(torch·polars 등)·데스크톱 조작(xlwings·pyautogui)·상주 스케줄은 브라우저에서 영원히 불가하다. 이 한계는 기술 부채가 아니라 웹 보안 모델이다.
5. **Actions 티어의 상한도 정직하게.** 레이턴시 30~120초(셀 REPL 불가), 러너에 Excel·데스크톱 없음, 비공개 리포 월 2,000분. "느리지만 뭐든 되는 배치 폴백"으로만 포지셔닝한다.
6. **외부 사실은 검증 전 확정하지 않는다.** TURN 무료 한도, mountNativeFS 지원 범위, PNA 정책 세부는 Phase 0 census 항목이다(2026-07 조사값은 각 문서에 조사 시점과 함께 기록).
