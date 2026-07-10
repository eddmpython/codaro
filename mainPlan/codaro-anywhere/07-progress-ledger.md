# 07. Progress Ledger - 결정 원장과 재개 지점

상태: 살아있는 문서. 결정은 append-only, NEXT는 항상 최신으로.

---

## 결정 원장

### 2026-07-10 - 이니셔티브 성립
- 발단: "완전 무료로 웹에서, 로컬급 파이썬" 요구. 코드베이스 전수 조사(서버 API 170라우트·엔진 OS 의존·프론트 빌드·자동화 표면·커리큘럼 472레슨·정체성 문서) + 무료 호스팅 지형 조사(2026-07) 수행.
- 기각 확정: 전면 웹 전환(K1), WASM 런타임 자체 개발(K2), 무료 PaaS 공유 커널(K3). 근거는 [00 §2](00-product-vision.md).
- 방향 확정: 경계 계층(capability router) - "WASM에게 로컬을 빌려주자". 3티어 = 브라우저 WASM(즉시성) · 로컬 엔진(완전성, 항상 우선) · GitHub Actions(무인성).
- 진입 설계 채택(사용자 아이디어): Chromium/Edge File System Access로 웹 티어 진짜 파일 + 임베디드 CPython 포터블 번들로 "웹페이지가 자기 런타임을 데려오는" 부트스트랩.
- Actions 위치 재정의(사용자): cron 편의가 아니라 WASM 제약을 해결하는 제3 런타임. 사용자 소유 리포 모델 강제(K4).
- 과제방 보류(사용자, 폐기 검토 중): 관련 유스케이스(Actions 채점 등) 전부 본 PRD 범위 제외(H1).
- 커리큘럼 읽기 전용 뷰어는 후순위 보류(H2) - 본 이니셔티브가 우선.
- mainPlan 운영방침을 dartlab에서 차용하기로 결정, 본 트리 신설.

### 2026-07-10 - 게이트 개정 승인 (G1 해소)
- 사용자가 [06 §7](06-scope-phasing-guardrails.md) 개정안을 승인. CLAUDE.md 절대 게이트에 개정 문안 반영 완료(로컬 규칙 파일).
- 효력: Phase 1 이후 착수 가능. Phase 0 census 즉시 착수.

### 2026-07-10 - Phase 0 census 완료 (설계 개정 3건 반영)

웹 검증 에이전트 2건 + 판정기 프로토타입 실측. 상세 출처는 조사 보고 원문(세션 기록), 핵심만 박제:

**C1. Chromium localhost 정책 - 설계 변경 유발 (02 §4 개정 완료)**
- PNA(서버 preflight 헤더 opt-in)는 보류·폐기, **LNA(Local Network Access) 사용자 권한 프롬프트 모델로 대체 확정**. Chrome 142(2025-10)부터 fetch/XHR, **Chrome 147(2026-04)부터 WebSocket까지** enforcement. 권한은 loopback-network(127.0.0.1)와 local-network(사설 IP)로 분리(145+).
- 서버 측 Access-Control-Allow-Private-Network 헤더는 더 이상 스펙 아님. 필요한 것 = 일반 CORS + 페이지 HTTPS(secure context) + 필요 시 fetch targetAddressSpace 선언 + 권한 거부 감지 UI.
- Edge는 Chromium 동반(147 동일). Firefox도 자체 LNA 출하 진행(150+ 정책, 세부 상이). Safari는 LNA 없음(mixed content 동작 별도 확인 필요).

**A/B. Pyodide 기반 사실 (314.0.2, 2026-06-30 릴리즈, CPython 3.14)**
- mountNativeFS(path, FileSystemDirectoryHandle) 확인(Experimental). picker는 메인 스레드 전용이나 핸들은 postMessage로 Worker 전달 가능 - "메인에서 권한, Worker에서 마운트" 아키텍처 성립. syncfs 수동 필수, MEMFS 사본 기반(대용량 = 메모리 비용, Phase 1 벤치 항목). Chrome 122+ 영구 권한.
- 인터럽트: setInterruptBuffer + SharedArrayBuffer(COOP/COEP) 현행 유지. Cloudflare Pages _headers로 COOP/COEP 설정 유효(단 Pages Functions 응답에는 미적용).

**D. 패키지 커버리지 - 분포 급개선**
- Pyodide 314.0.2 배포판(354패키지)에 **polars 1.33.1·duckdb 1.5.1·opencv 4.11 신규 포함**(0.29 라인에는 없었음). pyarrow·altair·bokeh도 포함. seaborn/plotly/openpyxl/xlsxwriter는 micropip 순수 휠. torch/torchvision·streamlit은 불가 유지.
- 구조 변화: **Pyodide 314부터 서드파티가 wasm 휠(abi 2026_0)을 PyPI에 직접 게시 가능** - 브라우저 티어 커버리지가 시간이 갈수록 넓어지는 방향.
- 주의: 0.x 시절 패키지 목록 인용 금지, 반드시 314.x lock 기준(과거 조사의 "polars 없음"은 이 census로 무효).

**E. 판정기 프로토타입 분포 (473 파일 실측)**
- **browser 314 / browser-after-wheel 84 / localOnly 71 / partial 4, 미확인 0.** wheel 서브셋(Phase 1, codaro import 84건 해결) 후 **398/473 = 84%가 브라우저권**.
- 카테고리: dataAnalysis 57/57·visualization 55/55·mathStatsMl 55/55 전부 브라우저권, imageVision 48/62(opencv 포함 덕), basics 94/100, automation 73/128.
- localOnly 원인 상위: subprocess 12·playwright 11·xlwings 11·torch/torchvision 11·pyautogui 8·smtplib 5 - 전부 예상된 로컬 전속 능력(설계 전제 확인).

**F. TURN·시그널링·Actions·서명 (03/04 개정 반영)**
- TURN: Cloudflare 월 1,000GB 무료이나 **카드 등록 사실상 필요** → 카드 0장 v1 = STUN(무제한 무료) + Workers 무료 시그널링(카드 불필요, 일 10만 요청) + 수동/QR 폴백. TURN은 카드 등록 사용자 옵션으로 강등.
- Actions: 공개 리포 무제한·4vCPU/16GB, 비공개 월 2,000분·2vCPU/8GB. workflow_dispatch는 수초~1분 픽업(cron 지연과 별개), 잡당 6시간. fine-grained PAT 최소 권한 = **Actions write**(contents 아님). 60일 비활성 자동 꺼짐은 공개 리포만. ToS 원문 확보: "리포 프로젝트와 무관한 워크로드" 금지 명문 - 사용자 소유 리포 모델(K4)이 정확한 경계.
- 코드 서명: EV의 SmartScreen 즉시 평판 폐지(2024). Azure Artifact Signing(구 Trusted Signing)은 개인 가입이 미국/캐나다 한정 - 한국 개인 불가. 현실 = OV 인증서(연 $200대) + 평판 자연 축적. Phase 3 비용 확정.

## 미결 (블로킹 순)

1. 웹 표면 브랜드/도메인(CF Pages 프로젝트명) 결정 - Phase 2 전까지.
2. 코드 서명 OV 인증서 조달 - Phase 3 선결.
3. 잔여 소검증: FSA 대용량 벤치(Phase 1), WebRTC의 LNA 게이팅 여부·Firefox LNA 세부(Phase 4 전).

## NEXT (다음 세션 재개 지점)

- **Phase 1 착수 가능 상태.** 첫 작업 = wheel 서브셋 로드 스파이크: src/codaro의 kernel/document 순수 모듈 + localWorker 코어를 Pyodide 314에 올려 셀 실행·리액티브가 도는지 검증([01 §5 메모](01-tier-architecture.md)). 성공 기준 = 동등성 테스트 초안 통과.
