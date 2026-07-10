# 06. Scope · Phasing · Guardrails

상태: 실행 계획 v0.1 (2026-07-10)
범위: phase 분해와 게이트, 기계 가드레일, 테스트 매트릭스, 롤백, 개발자+PM 이중 평가, CLAUDE.md 게이트 개정안. 착수는 본 문서 게이트가 우선한다(README).

---

## 1. Phase 분해 (의존 순서, 각 phase는 독립 가치)

### Phase 0 - census (코드 0, 문서만)
구현 전 외부 사실을 실측으로 박는다. 항목:
1. Pyodide 현행: 버전·코어/패키지권 로드 실측(크기·초기화 시간), mountNativeFS API 형태·쓰기 성능([02 §3](02-entry-and-bootstrap.md)).
2. PNA 정책 현행: Chromium Private Network Access의 localhost preflight 요구 사항과 헤더 스펙([02 §4](02-entry-and-bootstrap.md)).
3. TURN·시그널링 무료 조건([03 §4](03-remote-access-p2p.md)) - 불충족 시 P2P는 동일 네트워크 v1로 축소.
4. 커리큘럼 472개 능력 판정 시범: 판정기 프로토타입을 YAML snippet/solution에 돌려 browserRunnable 분포 실측(조사 추정치 검증).
5. CLAUDE.md 게이트 개정안 문안 확정(§7) - 사용자 승인이 Phase 1의 하드 게이트.
- 게이트: census 결과가 progress-ledger에 기록되고, 설계 전제를 깨는 항목이 있으면 해당 문서 개정 후 재평가.

### Phase 1 - PyodideEngine 코어 (백엔드/워커, UI 최소)
- Web Worker Pyodide 로더 + 세션 수명주기 + Worker.terminate 인터럽트.
- localWorker 순수 코어(cellScope·registry·AST 수확)와 reactive/analysis 탑재(wheel 서브셋 로드 방식 1차, [01 §5 메모](01-tier-architecture.md)).
- 출력 직렬화 = _normalizeResult 포맷 동일성.
- 게이트: 동등성 테스트 - 순수 파이썬 + pandas/numpy/matplotlib 대표 레슨 집합에서 Pyodide 출력 == Local 출력. **게이트 개정 승인 없으면 이 phase 착수 금지.**

### Phase 2 - 웹 표면 배선 + 배포
- capability router(v1 능력 3종) + tierUsed 배지 + browserRunnable 레슨 라벨(빌드 타임).
- 에디터 정적 빌드 변형(base 파라미터화·SW 경로 정리) -> Cloudflare Pages 배포(_headers 포함).
- FSA 폴더 마운트(Chromium) + 비지원 브라우저 동선.
- 게이트: 웹 표면에서 browserRunnable 레슨 엔드투엔드(열람 -> 실행 -> 결과) + 라우팅 판정 스냅샷 + K5(가짜 실행 경로 제거 확인).

### Phase 3 - 로컬 브리지 + 부트스트랩
- LNA 권한 프롬프트 대응(HTTPS 필수·targetAddressSpace·거부 시 안내 UI) + CORS 오리진 배선, health 프로브 자동 감지, 페어링 승인(웹 오리진 최초 1회), 터미널 WS 하드코딩 수정(147+ WS도 LNA 게이트).
- 포터블 번들(임베디드 CPython) 빌드 파이프라인 + 코드 서명(선결) + "로컬 연결" 동선.
- 게이트: 신규 PC 실측 - 웹 표면 첫 방문에서 로컬급 승격까지 5분 이내, 승인 없는 오리진 연결 거부.

### Phase 4 - WebRTC 개인 클라우드
- DataChannel 프록시 + 시그널링 워커(또는 수동 QR 폴백) + 기기 페어링·스코프·감사 로그·E-Stop 연동.
- 게이트: 외부 네트워크 실측(폰) + 보안 시나리오(코드 탈취·미승인 기기·만료) 전 항목 거부 확인.

### Phase 5 - ActionsEngine + 자동화 승격
- 사용자 리포 프로비저닝 + workflow 생성·dispatch·회수 + "클라우드로 승격" 레일 + 쿼터/공개성 경고.
- 게이트: 대표 태스크 1개가 사용자 리포에서 스케줄 실행되고 리포트·실패 알림이 도달. 중앙 팜 부재(K4) 코드 검증.

중단해도 앞 phase는 산다: P1=엔진 자산, P2=무료 웹 표면, P3=하이브리드 제품, P4=모바일 경로, P5=무인 자동화.

## 2. 가드레일 (기계 강제)

| # | 가드 | 무엇 | 어디 |
|---|---|---|---|
| G1 | 게이트 개정 선행 | 개정 문안 승인 기록이 progress-ledger에 없으면 Phase 1+ PR 차단 | 리뷰 체크리스트 + ledger 확인 |
| G2 | 학습 SSOT 로컬 | 웹 티어 실행이 숙달/검증 기록을 쓰는 경로 차단 | 서버측 기록 API가 티어 출처 검사 + 테스트 |
| G3 | 라우팅 단일 소유 | 표면 컴포넌트의 티어 직접 분기 금지(라우터 모듈만) | 프론트 계약 테스트(기존 testProductSurfaceContract 패턴 확장) |
| G4 | 결과 포맷 동일 | 티어별 출력이 _normalizeResult 스키마와 불일치 시 실패 | 스키마 검증 테스트 |
| G5 | 가짜 실행 금지 | localRuntime.ts 시뮬레이션 경로가 실행 버튼에 배선되면 실패 | 프론트 테스트 + K5 |
| G6 | 원격 기본 닫힘 | 페어링 미승인 상태에서 열리는 API 0 | 보안 시나리오 테스트(P4 게이트) |
| G7 | 문서 위생 | mainPlan 포함 저장소 md에 em dash 문자 금지 | 기존 .githooks/pre-commit |

## 3. 테스트 매트릭스

| 영역 | 도구 | 핵심 |
|---|---|---|
| 능력 판정기 | pytest | AST 판정 정확도(레슨 코퍼스 라벨과 대조), 동적 import 보수 판정 |
| 티어 동등성 | pytest + 브라우저 하네스 | 대표 레슨 출력 JSON 동등(허용 오차 규칙 포함) |
| 라우터 배정 | vitest | 우선순위 규칙(로컬>브라우저>안내) 스냅샷, G3 |
| 인터럽트 | 브라우저 하네스 | 무한루프 셀 terminate -> 세션 재기동 -> 후속 실행 정상 |
| FSA 마운트 | 수동+자동 혼합 | 진짜 폴더 read/write, 권한 재승인, 마운트 밖 경계 |
| 로컬 브리지 | pytest + 실측 | PNA preflight, 오리진 allowlist, 페어링 승인/거부 |
| P2P 보안 | 시나리오 테스트 | §Phase 4 게이트 전 항목 |
| Actions 왕복 | 실리포 통합 | dispatch->회수, 실패 로그 표면화, 쿼터 경고 |
| 회귀 | tests/run.py preflight | 기존 로컬 제품 무회귀(LocalEngine 무수정 원칙) |

## 4. 롤백

- P1: 엔진은 Protocol 뒤 신규 구현체 - 라우터 미배선이면 제품 무영향. revert 1 commit.
- P2: 웹 표면은 별도 배포(CF Pages) - 배포 내리면 기존 제품 무영향. landing 불변(K10).
- P3: PNA/CORS 미들웨어 토글 오프 = 웹 오리진 연결 전면 차단, 로컬 제품은 종전과 동일. 포터블 번들은 배포 중단으로 회수.
- P4: 시그널링 제거 + 트레이 토글 오프 = 기능 소멸, 무영향.
- P5: 워크플로 생성 중단. 이미 승격된 사용자 리포는 사용자 소유라 그대로 동작(우리 인프라 아님) - 안내 문서만 남긴다.
- 핵심 안전판: LocalEngine과 기존 로컬 제품 경로를 수정하지 않는 것이 전 phase의 전제라, 어떤 롤백도 "이 기획 이전의 Codaro"로 안전 착지한다.

## 5. 이중 평가 (착수 전)

### 5.1 전문 개발자 관점
- 가장 큰 기술 리스크는 Pyodide 위에서 src/codaro 서브셋을 그대로 도는가(wheel 로드 방식)다. Phase 1 첫 주에 스파이크로 검증하고, 실패 시 TS 재구현 논의 전 재평가를 강제했다(01 §5 메모).
- 두 번째 리스크는 동등성 정의다. 부동소수·경로·랜덤 시드의 허용 규칙을 테스트 자산으로 먼저 박는다(G4).
- LocalEngine 무수정 원칙이 회귀 위험을 구조적으로 줄인다. 신규 코드는 전부 추가 경로다.
- 우려: 능력 판정의 위양성(브라우저 가능인데 local 판정)은 UX 저하로 그치지만, 위음성(불가인데 브라우저 배정)은 실행 실패로 보인다 - 판정기는 위음성 최소화를 우선하고 실패 시 배지에 사유+로컬 안내로 착지시킨다.

### 5.2 PM 관점
- 사용자 약속이 명확하다: "설치 없이 바로 해본다(웹) -> 파일까지 진짜로 해본다(FSA) -> 전부 하려면 5분(포터블) -> 어디서나 내 PC로(P2P) -> 꺼도 돈다(Actions)". 각 phase가 약속 하나씩을 배달한다.
- 정체성 리스크가 관리된다: 실행 SSOT 로컬 불변(G2)·가짜 실행 금지(G5)·기각 재론 방지(05)가 문서+기계로 박혀 있다.
- 최대 미지수는 게이트 개정(사용자 승인)과 census 외부 사실이라, 코드 착수 전 Phase 0에 몰아 둔 구조가 낭비를 막는다.
- 커리큘럼 커버리지의 정직한 표시는(browserRunnable 라벨) 마케팅 표면이 아니라 신뢰 표면이다 - 못 도는 걸 도는 척하지 않는 것이 이 제품의 차별점과 일치한다.

## 6. 영향 요약 (v1 전체)

- 신설: editor/src/lib/execution/(router·pyodideEngine·worker), src/codaro/document/capability.py, 웹 표면 빌드 변형 + CF Pages 배포 워크플로, 포터블 번들 파이프라인(launcher 트리), 시그널링 워커(P4), Actions 템플릿(P5).
- 수정: src/codaro/server.py(CORS 오리진), editor/src/lib/api.ts(라우터 경유 + LNA 거부 감지), editor/src/components/terminal/terminalPanel.tsx(WS base), launcher/PACKAGING.md(포터블 형태).
- 불변: src/codaro/kernel/*, src/codaro/runtime/localEngine.py·localWorker.py(코어의 이식 원본으로만 참조), landing/, curricula/ 데이터.

## 7. CLAUDE.md 게이트 개정안 (사용자 승인 대기)

현행: "Pyodide/micropip/browser-only 우회와 marimo 관련 내용/표면/흐름은 기본 커리큘럼 목표에서 제거하고, 로컬 Python에서 자연스럽게 배우고 업무에 가져갈 수 있는 흐름으로 고친다."

개정안(요지): 커리큘럼의 학습 SSOT와 숙달/검증 기준 실행은 로컬 Python으로 불변. 단, 실행 보조 티어로서의 브라우저 WASM(PyodideEngine)과 GitHub Actions는 허용한다. 보조 티어는 tierUsed를 표면화하고, 숙달/검증 기록을 쓰지 못하며(G2), 커리큘럼 본문이 browser-only API나 micropip 사용법을 가르치지 않는다는 조건을 유지한다.

- 이 문안의 승인 기록이 progress-ledger에 남기 전까지 Phase 1 이후 착수 금지(G1).
