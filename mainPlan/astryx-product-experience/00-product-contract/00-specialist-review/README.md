# 00 Specialist Review

상태: 차단

이 문서의 R8 100점은 같은 평가자가 목표 점수와 이전 지적을 알고 반복 채점한 자기수렴 결과다. 실제 `plan-quality` gate와 재현 가능한 round report가 없는 상태에서 독립 절대평가처럼 사용한 판정은 무효다. 현재 baseline은 기존 점수를 보지 않은 [R9 PRD 재평가](../01-prd-improvement-loop/01-r9-baseline/)이며, 이후 평가 계약은 [PRD improvement loop](../01-prd-improvement-loop/)가 소유한다.

주의: 아래 `역사 목표`, `역사 수렴 게이트`, R1~R8 기록은 2026-07-18 당시 사용한 프로토콜 원문이다. 현재 실행 규칙이 아니며, 새 평가나 완료 판정에 재사용하지 않는다.

## 역사 목표 (무효 프로토콜)

`astryx-product-experience`가 방향 선언에 머물지 않고 현재 코드와 배포 구조에 맞는 자기충족 계획인지 독립 전문가가 적대 평가하고, 모든 분야가 90점 이상으로 수렴할 때까지 계획 수정과 재평가를 반복한다.

평가자의 주장만 계획에 복사하지 않는다. root 작업자가 실제 파일, 심볼, 데이터 수치, gate registry를 다시 확인한 사실만 반영한다.

## 역사 수렴 게이트 (무효 프로토콜)

- 학습·교육제품, UX·디자인시스템, 기술 아키텍처의 총점이 각각 90점 이상이다.
- P0와 P1 미해결 항목이 0개다.
- 경로, 심볼, 수치, package version, gate 이름을 현재 worktree에서 다시 확인한다.
- 평가 뒤 계획을 수정하고 동일한 평가자가 같은 rubric으로 재평가한다.
- 평균 점수로 낮은 분야를 숨기지 않는다. 세 총점 중 하나라도 90점 미만이면 계획 품질 gate는 실패다.
- 계획 점수는 구현 완료 점수가 아니다. 이 gate 통과 뒤에도 workstream 구현과 `_done` 증거가 별도로 필요하다.

## R1 독립 평가

평가일: 2026-07-18

| 분야 | 점수 | 핵심 판정 |
| --- | ---: | --- |
| 학습·교육제품 | 64/100 | 새 evidence가 기존 두 mastery 체계 중 무엇을 대체하는지 없고 browser strong check와 학습효과 gate가 빠짐 |
| UX·디자인시스템 | 71/100 | Astryx 방향은 맞지만 route ownership, layout blueprint, component/state matrix, asset provenance가 부족함 |
| 기술 아키텍처 | 57/100 | lesson identity, browser check adapter, surface SSOT, 실제 경로와 gate 이름이 현재 코드와 충돌함 |
| 평균 | 64/100 | 구현 착수 불가. P0·P1 해소 후 R2 필요 |

## R1 사실 확인

| 사실 | 현재 증거 | 계획 조치 |
| --- | --- | --- |
| lesson source | YAML 472개, outcome graph 469개 | filesystem, registry, graph, generated route가 모두 472인지 gate로 강제 |
| lesson identity | `meta.id != file stem` 441개, 중복 `meta.id` 5개 | `LessonRef={category,contentId}`를 저장 identity로 고정하고 `meta.id`를 identity에서 제외 |
| graph 누락 | `builtins/33_tempfile`, `34_hashlib`, `35_zipfile` | identity repair packet에서 taxonomy와 graph 등록 |
| learner prediction | 30파일, 332블록 | 계획 수치 갱신 후 migration 완료 시 0건 gate |
| mastery | `ProgressTracker` JSON과 `LearnerStateStore` SQLite 병존, bridge 0.6/0.4 blend | append-only evidence ledger와 단일 pure mastery reducer로 통합 |
| browser check | browser는 실행만, `curriculumCheck.ts`는 backend API만 호출 | `ObservedRun -> CheckEngine -> EvidenceTransaction`과 browser/local adapter 신설 |
| checker isolation | output check가 student와 expected code를 같은 mutable session에서 실행 | clean namespace와 fixture hash 기반 격리 실행 |
| route state | `DEFAULT_SURFACE=chat`, hash `replaceState` | learning default, canonical Run route state, push/pop/redirect 보존 계약 |
| invalid gate | `automation`, `curriculum`, `architecture` 미등록 | 실제 gate 또는 명시한 신규 aggregate로 교체 |
| stale plan path | CSS, surface route, automation surface, runtime recovery 경로 오류 | 현재 파일 경로로 전수 정정 |

## R1 감점 해소 원장

| ID | 심각도 | 조치 | owner | R2 증거 |
| --- | --- | --- | --- | --- |
| L1 | P0 | 단일 `LearningEvidenceStore`와 `MasteryPolicy`, legacy migration·삭제 조건 | 00, 02 | mastery·replay·legacy removal tests |
| L2 | P0 | browser/local 공용 `CheckSpec`, `ObservedRun`, isolated executor, parity fixture | 02, 04 | browser/local parity report |
| L3 | P0 | revision·variant·attempt·runtime·checker·fixture·artifact hash를 evidence에 추가 | 00, 02 | uniqueness/replay tests |
| L4 | P0 | independent pre/post, delayed retrieval, unseen transfer efficacy pilot | 10 | current content hash가 있는 efficacy report |
| L5 | P0 | 대표 6경로와 나머지 domain을 nested packet과 lesson ledger로 분해 | 08 | 모든 packet 내부 `_done` 증거 |
| U1 | P0 | `/run/` route/history ownership과 beta surface 정책 확정 | 00, 03, 04 | route round-trip·back/forward tests |
| U2 | P0 | Landing, Learn, Run, Local layout blueprint와 breakpoint별 scroll/focus owner | 03~07 | viewport matrix screenshots와 DOM assertions |
| U3 | P0 | Astryx token mapping, primitive/domain component, 상태·density matrix | 01 | component matrix contract |
| U4 | P0 | learning control을 label이 아니라 command/navigation/choice/progress mutation으로 감사 | 02, 09 | control intent test |
| A1 | P0 | `LessonRef={category,contentId}`와 public route identity 통일 | 00, 04, 08 | 472-way identity gate |
| A2 | P1 | 학습 방법론을 Web 학습보다 먼저 수행하고 final media를 Web·Local 뒤 캡처 | root, 06 | dependency graph audit |
| A3 | P1 | `/app/` to `/run/`, service worker, classroom data, package migration 표 | 04, 09 | compatibility·purge·rollback tests |
| A4 | P1 | 잘못된 파일·심볼·gate 이름을 current worktree와 일치 | all | plan fact audit 0건 |

## R2 재평가

평가일: 2026-07-18. 같은 평가자가 같은 rubric으로 수행했고 세 분야 모두 90점 gate를 통과하지 못했다.

| 분야 | R1 | R2 | 잔여 P0 | 잔여 P1 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| 학습·교육제품 | 64 | 84 | 0 | 6 | mastery 판정표, scheduler, sandbox, 실제 ledger, efficacy protocol 보강 필요 |
| UX·디자인시스템 | 71 | 89 | 0 | 5 | Local route, density/accent, section focus, video/browser, gate membership 보강 필요 |
| 기술 아키텍처 | 57 | 78 | 2 | 8 | 실패 event, LessonRef 모순과 migration·dependency·gate 실체 보강 필요 |
| 평균 | 64 | 84 | 2 | 19 | 구현 착수 불가, R3 필요 |

R2 점수는 개선 뒤에도 덮어쓰지 않는다. P0는 `LearningEvent` union으로 failed run/check를 저장하고 `CreditGranted`만 mastery를 올리게 했으며, `contentId=file stem`, `meta.id=legacy`로 identity를 통일해 해소했다.

## R3 보강 원장

| ID | R2 잔여 | 반영 위치 | R3 증거 |
| --- | --- | --- | --- |
| L6 | versioned mastery 판정과 Web parity 없음 | 00, 02 | 상태·hint·lapse 표와 Python/TS golden vector |
| L7 | outcome review 간격과 sandbox 미결정 | 02 | scheduler 전이표와 `CheckSpec@1`, `CheckSandboxPolicy@1` |
| L8 | 실제 ledger·remaining domain packet 없음 | 08 | category별 472행, 6 featured와 25 domain ledger |
| L9 | efficacy 표본·비교·privacy 부족 | 10 | preregistered active/waitlist protocol과 path-level gate |
| U5 | Local/public nav와 density/accent 미결정 | 01, 03, 07 | surface matrix, runtime state, public nav order |
| U6 | section·video·browser·test membership 부족 | 06, 09, 10 | non-click heading, video fields, engine matrix, gate table |
| A5 | failed event·hash·tombstone 모순 | 00, 02 | event union, canonical hash, reset/deletion lifecycle |
| A6 | check call chain·archive·SW·classroom migration 부족 | 02, 04, 05, 09 | 실제 files, shared contract, tombstone SW, JSON/JSONL export |
| A7 | dependency·package·Gate runner 불일치 | root, 06, 09, 10 | ledger-before-asset, exact versions, actual `Gate`/CI membership |

## R3 재평가

평가일: 2026-07-18. 점수 평균은 90을 넘었지만 P0·P1이 남아 gate는 실패했다.

| 분야 | R2 | R3 | 잔여 P0 | 잔여 P1 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| 학습·교육제품 | 84 | 91 | 0 | 2 | 334개 canonical lesson 콘텐츠 owner 누락과 path requirement 충돌 |
| UX·디자인시스템 | 89 | 94 | 0 | 1 | 동일 472 content ownership 누락 |
| 기술 아키텍처 | 78 | 86 | 1 | 7 | content owner P0와 ledger·SW·runner·surface·tombstone·CI 세부 |
| 평균 | 84 | 90 | 1 | 10 | 구현 착수 불가, R4 필요 |

## R4 보강 원장

| ID | R3 잔여 | 반영 위치 | R4 증거 |
| --- | --- | --- | --- |
| L10 | path ledger unique 138, 334 lesson 미소유 | 08 canonical content ledger | category별 472 unique content row, owner 29 packet, unowned 0 |
| L11 | path별 runtime/check/visual 충돌 | 08 path membership ledger | path row는 canonical ref만 소유, conflict field 0 |
| L12 | ITT 표본과 scheduler stage 모호 | 02, 10 | randomized hard floor·missing policy, transfer/delayed stage 표 |
| A8 | ledger 재현 hash·verifier 부족 | 08 | composer/taxonomy/source hash와 metadata-only check tool |
| A9 | root SW·runner symbol·surface literal 오류 | 03, 04, 10 | exact legacy script filter, `GATE_ARTIFACTS`, current flow role union |
| A10 | reset causality·browser CI·completion evidence 부족 | 00, 10, mainPlan root | epoch/frontier, engine/OS jobs, evidence schema·writer·verifier |
| A11 | classroom·StyleX·hash edge case | 00, 01, 09 | JCS, exact 0.19.0, classroom pseudonym/redaction |

## R4 재평가

동일 평가자가 canonical 472 content ledger와 R4 보강 원장을 재검증한다. 각 90점 이상, P0·P1 0건이 아니면 다음 round로 넘어간다.

| 분야 | R3 | R4 | 잔여 P0 | 잔여 P1 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 91 | 96 | 0 | 2 |
| UX·디자인시스템 | 94 | 98 | 0 | 0 |
| 기술 아키텍처 | 86 | 90 | 0 | 5 |
| 평균 | 90 | 95 | 0 | 7 |

R4는 점수 기준은 넘었지만 P1 7건으로 탈락했다. UX의 유일한 P2도 다음 round 보강 범위에 포함한다.

## R5 보강 원장

| ID | R4 잔여 | 반영 위치 | R5 증거 |
| --- | --- | --- | --- |
| L13 | canonical/path membership 의미 충돌 | 08 ledger·README | canonical은 `eligiblePathIds`, 실제 membership은 path reverse index 한 곳만 소유 |
| L14 | outcome 공백 26행과 path outcome 복제 | 08 content/path ledger | canonical outcome 472/472, path outcome·prerequisite field 0 |
| U5 | 대표 6 packet의 canonical owner 범위 미기재 | 08/01~06 README | owner 66·12·22·20·25·11행과 `_done` 조건 직접 명시 |
| A12 | concurrent·scoped reset 결정성 부족 | 00 | total order, scope epoch chain, parent epoch, decimal counter vector |
| A13 | Win10·WebView2·Chromium latest-1 runner 모호 | 10 | exact self-hosted labels, OS build, runtime lock, interactive preflight |
| A14 | classroom archive/export/purge 실행 계약 부족 | 09 | local-owner CLI, JSON/JSONL schema/hash/redaction, exact-hash purge ledger |
| A15 | browser/local sandbox 집행 수단 부족 | 02 | opaque-origin CSP worker와 Windows AppContainer·Job Object·broker RPC |
| A16 | composer key, SW threshold, completion two-phase 모호 | 04, 08, 10, mainPlan root | exact key·marker·threshold와 implementation/transition commit 검증 |

## R5 재평가

동일 평가자가 R4 잔여와 신규 회귀를 다시 감사한다. 세 분야 각각 90점 이상, P0·P1 0건일 때만 계획 품질 gate를 통과한다.

| 분야 | R4 | R5 | 잔여 P0 | 잔여 P1 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 96 | 99 | 0 | 0 |
| UX·디자인시스템 | 98 | 100 | 0 | 0 |
| 기술 아키텍처 | 90 | 91 | 0 | 6 |
| 평균 | 95 | 97 | 0 | 6 |

R5도 기술 P1 6건 때문에 탈락했다. 학습 P2 1건은 R6 보강에 포함한다.

## R6 보강 원장

| ID | R5 잔여 | 반영 위치 | R6 증거 |
| --- | --- | --- | --- |
| L15 | outcome/prerequisite 교집합 245행의 강화 의미 암묵적 | 08 content ledger | `reinforcesOutcomeIds=outcomes∩prerequisites`, 245행 exact |
| A17 | planned outcome 추가와 동일 taxonomy hash 모순 | 08 | baseline/target hash와 exact transition report, 31 header 갱신 |
| A18 | opaque iframe bootstrap이 CSP에 차단 | 02 | generated inline bootstrap hash와 CSP/build gate |
| A19 | Rust broker와 Python executor transport 누락 | 02 | named pipe ACL·HMAC schema, broker client, lifecycle owner |
| A20 | current Playwright가 floating | 10 | Python 1.61.0 exact pin, driver/browser/executable lock과 verifier |
| A21 | classroom archive self-hash·partial purge | 09 | detached ZIP hash, prepared/quarantine/completed crash recovery |
| A22 | generic `workbox-*` cache 오삭제 | 04 | exact legacy cache name+request hash manifest, wildcard 삭제 금지 |
| A23 | SW 표·reset test·transition ledger schema | 00, 04, 10, mainPlan root | two-release 표, permutation test, unique transition row/merge rejection |

## R6 재평가

동일 평가자가 R5 잔여와 신규 회귀를 감사한다. 각 90점 이상, P0·P1 0건일 때만 계획 품질 gate를 통과한다.

| 분야 | R5 | R6 | 잔여 P0 | 잔여 P1 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 99 | 98 | 0 | 1 |
| UX·디자인시스템 | 100 | 100 | 0 | 0 |
| 기술 아키텍처 | 91 | 97 | 0 | 2 |
| 평균 | 97 | 98 | 0 | 3 |

R6는 학습 P1 1건과 기술 P1 2건으로 탈락했다.

## R7 보강 원장

| ID | R6 잔여 | 반영 위치 | R7 증거 |
| --- | --- | --- | --- |
| L16 | reinforcement 저장·readiness·scheduler 미연결 | 00, 02 | `ReadinessPolicy@1`, credit slice mode/dedup, pass/fail 전이와 conformance test |
| A24 | AppContainer의 managed runtime RX 계약 누락 | 02 | runtime store·package snapshot RX ACL, receipt, `python -I -B`, write 거부·GC test |
| A25 | `plan-quality-r3`가 오래된 round 고정 | root, 10 | versionless `plan-quality`, latest numeric round 3행·severity·대기 parser |
| A26 | port origin·transition hash·cache request hash encoding | 02, 04, mainPlan root, 10 | initial origin/후속 nonce sequence, JCS transition ID, normalized request tuple JCS |

## R7 재평가

동일 평가자가 최신 worktree의 R6 잔여와 회귀를 감사한다. 각 90점 이상, P0·P1 0건, `대기` 0일 때 계획 품질 gate를 통과한다.

| 분야 | R6 | R7 | 잔여 P0 | 잔여 P1 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 98 | 98 | 0 | 1 |
| UX·디자인시스템 | 100 | 100 | 0 | 0 |
| 기술 아키텍처 | 97 | 99 | 0 | 0 |

R7은 학습 P1 1건 때문에 탈락했다. 학습 P2 1건과 기술 P2 3건도 R8 보강 범위에 포함한다.

## R8 보강 원장

| ID | R7 잔여 | 반영 위치 | R8 증거 |
| --- | --- | --- | --- |
| L17 | reinforcement conformance vector와 causal pre-state·mode priority 회귀 명세 누락 | 00, 02 | Python 단위 회귀와 Python/TypeScript golden vector에 readiness, invalid 격리, exact priority, dedup 명시 |
| L18 | envelope `eventId`와 dedup의 `creditEventId` 명칭 불일치 | 00, 02 | `(eventId,outcomeId)` unique key로 통일 |
| A27 | iframe fragment 제거 실패 시 비밀정보 잔류 가능 | 02 | `replaceState` 실패 fallback과 nonce/origin buffer null·zeroize |
| A28 | runtime ACL receipt의 영속 경로와 재시작 조정 누락 | 02 | `LauncherPaths.state_dir()` receipt와 startup reconciliation |
| A29 | classroom purge 동시 실행 차단 불명확 | 09 | purge 전체 구간의 exclusive OS lock |

## R8 재평가

동일 평가자가 최신 worktree의 R7 잔여와 회귀를 감사한다. 각 90점 이상, P0·P1 0건, `대기` 0일 때 계획 품질 gate를 통과한다.

| 분야 | R7 | R8 | 잔여 P0 | 잔여 P1 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 98 | 100 | 0 | 0 |
| UX·디자인시스템 | 100 | 100 | 0 | 0 |
| 기술 아키텍처 | 99 | 100 | 0 | 0 |

R8 표는 당시 평가 응답을 보존한 역사 기록이다. 그러나 목표 점수를 아는 동일 평가자 반복, rubric·원본 report 부재, 미등록 `plan-quality` gate 때문에 현재 계획 품질 판정으로는 무효다. 이 점수를 initiative root나 구현 착수 근거로 사용하지 않는다.

## R9 블라인드 기준선

평가일: 2026-07-18. 세 신규 평가자는 R8 점수와 이 문서 본문을 읽지 않고 현재 plan과 실제 코드·registry·runner만 대조했다. 목표 점수는 주지 않았으며 결과는 수정 없이 기록한다.

| 분야 | R9 | P0 | P1 | P2 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| 학습·교육제품 | 65 | 2 | 3 | 2 | 실제 assessment blueprint, Web tier 증거, 증분 출시선이 없음 |
| UX·디자인시스템 | 78 | 1 | 3 | 3 | 렌더 증거 0, Local viewport 모순, root contract·AT 운영 공백 |
| 기술 아키텍처 | 64 | 1 | 6 | 2 | downgrade 구멍, completion 순서 모순, sandbox·gate feasibility 부재 |
| 평균 | 69 | 4 | 12 | 7 | 구현 착수 완성본이 아니며 PRD remediation 필요 |

R9 severity에는 분야 간 중복이 있다. 숫자를 합쳐 결함 수를 부풀리지 않고 [R9 baseline](../01-prd-improvement-loop/01-r9-baseline/)의 canonical finding ID로 중복을 제거한다.

## 영향 파일

- `mainPlan/astryx-product-experience/README.md`
- `mainPlan/astryx-product-experience/00-product-contract/README.md`
- `mainPlan/astryx-product-experience/01-design-foundation/README.md`
- `mainPlan/astryx-product-experience/02-learning-method/README.md`
- `mainPlan/astryx-product-experience/03-product-shell/README.md`
- `mainPlan/astryx-product-experience/04-web-learning/README.md`
- `mainPlan/astryx-product-experience/05-local-studio/README.md`
- `mainPlan/astryx-product-experience/06-visual-assets/README.md`
- `mainPlan/astryx-product-experience/07-landing-experience/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/README.md`
- `mainPlan/astryx-product-experience/09-repository-simplification/README.md`
- `mainPlan/astryx-product-experience/10-quality-release/README.md`

## 영향 함수·심볼

- 계획 단계 신규 `LessonRef`, `LearningEvent`, `LearningEvidenceStore`, `MasteryPolicy`
- 계획 단계 신규 `ObservedRun`, `CheckSpec`, `CheckEngine`, `EvidenceTransaction`
- 계획 단계 신규 `RunRouteState`, `parseRunRoute`, `serializeRunRoute`, `useRunRoute`
- plan fact audit의 path, symbol, gate registry

## 테스트

- 문서 내부 링크와 필수 section 검사
- plan에 적은 기존 path와 symbol의 current worktree 대조
- `tests/run.py` 기존 gate 이름 대조와 신규 gate의 owner·등록 위치 검사
- `uv run python -X utf8 tests/run.py gate docs`
- `git diff --check`

## 롤백

- 평가 점수는 삭제하거나 상향 덮어쓰지 않고 round별로 보존한다.
- 평가자가 제안한 변경이 실코드와 충돌하면 점수를 유지하고 충돌 사실을 원장에 남긴다.
- 계획 수정으로 범위가 달라지면 이전 round의 rubric과 점수를 보존하고 새 round에서만 재채점한다.

## 평가

### 개발자 관점

- 실코드 대조 없는 높은 점수는 구현 재조사를 숨길 뿐이다. 모든 P0는 파일, 심볼, schema, test로 닫아야 한다.
- R2에서 신규 P0가 나오면 점수와 무관하게 다시 계획을 고친다.

### PM 관점

- 세 분야 중 최저점이 제품 실패 가능성을 대표한다. 평균 90점만으로 통과시키지 않는다.
- 계획 품질과 실제 제품 품질을 분리해, plan gate 통과를 제품 완료처럼 말하지 않는다.
