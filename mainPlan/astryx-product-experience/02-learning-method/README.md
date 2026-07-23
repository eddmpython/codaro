# 02 Learning Method

상태: 진행

현재 machine audit 기준 strong CheckSpec은 1,413개/467레슨이며 mastery·transfer·24시간 retrieval은 각각 467레슨에 저작되어 있다. 1,400개 solution variant의 실행 실패는 0이고, 467레슨 모두 portable-concept performance claim과 Web/Local tier parity를 명시한다. 이 가운데 Python Foundations와 W0 behavior 경로는 Day 1 output·unseen transfer·delayed retrieval, Day 2~30 다중 입력 behavior, pathlib·zip·schedule base와 assessment behavior를 포함한다. Day 19는 실제 fixture 파일과 생성 경로를, Day 20은 정상 반환과 예상 예외를, Day 30은 두 CSV fixture와 서로 다른 JSON 산출 경로를 함께 검사한다. Run 직후 별도 확인 버튼 없이 Web은 main 커널과 분리된 새 pyproc Worker, Local은 별도 native Python sandbox에서 학생 코드를 fixture와 함께 재실행한다. Local sandbox는 fixture 경계, 네트워크·하위 프로세스 차단과 timeout을 적용하고 실제 tier를 sealed event identity에 남긴다. behavior pass는 file·directory와 table·image descriptor를 SHA-256 contentHash와 의미 필드까지 event payload hash에 봉인한다. table은 format, columns, rowCount를, image는 실제 header의 media type, width, height를 기록한다. schedule check는 pinned package asset descriptor의 name, version, `check-packages/` URL, SHA-256 integrity도 event payload hash에 봉인한다. mastery만 base lesson에 보이고 transfer는 mastery evidence 직후, retrieval은 source evidence가 24시간을 지난 뒤 자동 제공된다. 학습 홈은 전체량 카드 대신 만들 결과와 다음 outcome을 바로 보여 주는 열린 goal map으로 바뀌었고, core lesson의 classroom panel과 확인 전용 control은 제거됐다. 오류 뒤 targeted feedback과 필요한 hint는 결과 바로 아래 자동 렌더되며 mobile lesson navigation은 이동과 동시에 닫힌다. Python·TypeScript `MasteryPolicy@1`은 같은 generated policy와 golden vector를 소비하고 legacy completion/access weight와 0.6/0.4 blend를 mastery projection에서 제거했다. full learning archive v2는 document, drafts, virtual FS와 package bytes, evidence, lineage, disabled automation draft를 Web과 Local 사이에서 materialize한다. 공식 `learning-method`와 최신 `product-experience-browser` 63/63은 canonical lesson binding, retrieval fixture, Day 19 archive artifact transfer를 포함해 green이다. source에 strong spec이 있다는 사실은 모든 레슨의 browser evidence를 뜻하지 않는다. independent assessment 승인 0/467, Windows AppContainer, 472레슨 전수 browser evidence와 사람 학습성 검수가 남아 있으므로 상태는 `진행`이고 `_done`이 아니다.

## 목표

Codaro의 학습 방식을 카드 형식이 아니라 증거 기반 학습 루프로 다시 정의한다. 읽는 양, 실행 횟수, 대화량이 아니라 학습자가 도움을 줄여 가며 코드를 만들고, 오류를 고치고, 새 조건에 전이하고, 실제 결과물을 남긴 증거로 진도를 판단한다.

## 최상위 원칙: 불필요한 확인 클릭 0회

학습자는 코드를 읽고, 직접 수정하고, 실제로 실행한다. 제품은 그 실행과 결과를 관찰해 자동으로 검증하고 다음 학습 상태를 갱신한다.

- 버튼 자체를 금지하지 않는다. 목표 선택, code 실행/중지, route 이동, 도구 열기, 다시 시도, 결과물 열기, Local 전환처럼 사용자의 명시적 의도가 필요한 action에는 적절한 control을 제공한다.
- lesson route에 들어오면 overview와 첫 학습 단위가 바로 준비된다. 같은 화면의 내용을 펼치기 위한 별도 `학습 시작` 클릭을 요구하지 않는다.
- code를 실행하면 `검증`, `완료`, `제출`을 한 번 더 누르지 않아도 strong check와 progress가 자동 갱신된다.
- `기억남`, `가물`, confidence 선택처럼 자기평가만으로 mastery나 review를 바꾸지 않는다.
- 오류와 시도 횟수로 필요한 도움을 판단할 수 있으면 적절한 hint를 결과 아래에 자동 제공한다. 이미 필요하다고 판단한 도움을 `다음 힌트 보기` 뒤에 숨기지 않는다.
- strong check 뒤 이어지는 section은 같은 흐름에 열어 둔다. 단, 다른 lesson이나 경로로 이동하는 실제 navigation은 사용자가 선택한다.
- multiple choice, true/false, badge 수집을 학습 증거로 쓰지 않는다.
- code 실행이 끝나면 strong check가 같은 pipeline에서 자동 실행된다.
- check 결과에 따라 feedback과 다음 section이 inline으로 갱신되며 modal 확인을 요구하지 않는다.
- 각 control은 command, navigation, 명시적 choice 중 하나로 설명할 수 있어야 한다. 시스템이 이미 결정한 상태를 확인하기만 하는 클릭은 제거한다.
- 파괴적인 Local 자동화의 안전 확인은 학습 확인과 다른 문제이므로 유지할 수 있다.

## 현재 학습을 방해하는 것

| 문제 | 현재 증거 | 교정 |
| --- | --- | --- |
| 실행 성공과 완료 혼동 | staged Surface와 canonical reducer는 run success, strong credit, mastery를 분리함 | 전체 browser/local writer가 `ObservedRun -> CheckEngine -> EvidenceTransaction`만 쓰는지 release gate로 계속 검증 |
| 예측 체계 잔존 | active backend/frontend 계약과 YAML `predict:` 0건 | 제거 상태를 negative gate로 고정하고 code/error/check evidence만 유지 |
| 자기평가 복습 | `기억남`, `가물` mastery writer 제거 | retrieval code 실행 결과로 review state를 자동 갱신하는 pipeline 유지 |
| 시작과 hint reveal UI | core lesson의 reveal-only 시작·hint control 제거 | route 진입과 실행 evidence에 따른 continuous flow를 browser gate로 유지. 실제 lesson navigation은 보존 |
| 부정적인 약점 표면 | draft misconception·반복 횟수의 학습자 표면 제거 | 승인된 진단과 실행 가능한 다음 연습이 함께 있을 때만 행동 중심으로 표시 |
| provider가 학습 공간 상시 점유 | lesson 오른쪽에 360px TeacherPanel | 기본 닫힘, 질문 시 contextual drawer |
| 과제방과 학습 결합 | active classroom backend/frontend와 check side effect 제거, 기존 데이터용 local-owner archive migration만 유지 | core 학습 루프에 classroom import와 panel이 다시 들어오지 않도록 negative gate 유지 |
| 전체량 중심 진도 | 472개 전체 완료율과 category card grid | 선택한 목표의 다음 outcome과 결과물 중심 |
| 약한 품질 점수 | 현재 감사 기준 weak-only 0·strong CheckSpec 1,413개/467레슨·숙달/전이/검색 각 467레슨·independent assessment 승인 0/467 | `curriculum-top-tier-audit`를 `audit-requirement-coverage`로 명시하고 source coverage와 실제 실행 evidence·독립 review를 분리한 release gate로 유지 |

## Codaro 고유 학습 개념

### 1. Evidence Loop

`읽기 → 직접 수정 → 실행 → 오류 수정 → 자동 강한 검증 → 증거 저장`을 한 section의 닫힌 루프로 만든다. 저장하는 것은 page view가 아니라 code hash, runtime tier, check type/result, hint level, error class, artifact descriptor다. 학습자는 별도 check나 완료 action을 하지 않는다.

### 2. Scaffold Ladder

한 개념을 다음 다섯 단계로 점진적으로 독립 수행하게 한다.

1. `observe`: 실행 가능한 worked example과 각 단계의 이유를 본다.
2. `modify`: 한 입력, 조건, 함수 인자를 바꾸고 결과를 확인한다.
3. `complete`: 핵심 줄 일부가 비어 있는 코드를 완성한다.
4. `build`: 같은 outcome을 빈 starter에서 구현한다.
5. `transfer`: 새로운 데이터, 파일, 제약, scale에 적용한다.

첫 시도 strong check를 hint 없이 통과하면 중간 단계를 줄일 수 있다. 실패가 반복되면 전체 정답을 노출하지 않고 한 단계 전 scaffolding으로 돌아간다.

### 3. Error Lab

오류를 실패 배지로 끝내지 않는다. `detectErrorClass`, code/error misconception trigger, debugging reference를 사용해 다음 세 문장을 제공한다.

- 무엇이 일어났는가
- 왜 이 코드에서 일어났는가
- 다음에 무엇을 한 줄 바꿔야 하는가

초보자에게는 발견 가능한 syntax/API 오류부터 제시하고, 복잡한 semantic 오류는 충분한 worked example 뒤에만 사용한다.

### 4. Retrieval Sprint

복습 예정 lesson을 다시 읽게 하지 않는다. 이어하기 흐름에 2분에서 5분 길이의 작은 code task를 자연스럽게 배치하고, 실행 결과를 자동 채점한 뒤 필요한 설명만 보여 준다. self-rating UI는 만들지 않는다.

복습 상태는 lesson이 아니라 outcome 단위다. 각 outcome은 최소 3개의 `RetrievalTaskVariant`를 가지며 같은 variant와 fixture를 반복 실행한 결과는 새 credit이 아니다. unseen variant를 우선하고 모든 variant가 사용된 뒤에만 간격을 두고 재사용한다.

### 5. Outcome Map

472개 전체 목록 대신 선택한 goal의 prerequisite graph에서 현재 outcome, 다음 outcome, Local에서 마칠 outcome만 보여 준다. 이미 strong evidence가 충분한 outcome은 건너뛸 수 있지만, 단순 lesson view나 `noError`는 skip 근거가 아니다.

경로 계산 SSOT는 outcome graph 기반 `planComposer.composeMasterPlan`이다. category 완료 개수를 세는 `learningPathFlow.recommendLearningPath`는 새 Outcome Map의 추천 근거로 사용하지 않고 migration 뒤 제거한다.

### 6. Artifact Graduation

대표 경로의 마지막은 quiz가 아니라 실제 결과물이다. 데이터 경로는 report와 chart, 파일 경로는 정리된 directory와 manifest, Local 경로는 실행 가능한 task와 audit record를 남긴다. capstone은 최소 두 종류의 evidence를 검증한다.

### 7. Web to Local Continuation

Web에서 만든 notebook, evidence, path position을 Local로 가져와 실제 파일과 상주 자동화로 확장한다. 다운로드는 학습 차단이 아니라 이미 만든 결과물을 더 강한 환경에서 운영하는 전환이다.

## 결정 규칙

- section의 기본 순서는 `observe/modify` 또는 `complete/build` 중 학습자의 evidence에 맞는 가장 짧은 경로다. 같은 lesson 안에서는 별도 시작/완료 reveal 없이 continuous flow로 열고, 다른 route로의 이동은 사용자의 선택으로 남긴다.
- 첫 의미 있는 실패는 실행 결과와 관련 line을 보여 준다.
- 두 번째 의미 있는 실패는 misconception correction의 첫 hint를 보여 준다.
- 세 번째 의미 있는 실패는 worked step 하나를 복원하고 다시 실행하게 한다.
- `meaningfulAttempt`는 normalized AST 또는 syntax-error token stream이 이전 attempt와 달라야 한다. 공백·주석 변경과 같은 source 재실행은 hint level이나 attempt credit을 올리지 않는다.
- AST 변화는 failing `checkResult.target`의 backward dataflow slice를 건드리거나 normalized output·artifact descriptor·check vector를 바꿔야 meaningful하다. 사용되지 않는 node, 변수명만 변경, dead code는 hint escalation을 만들지 않는다.
- strong check는 code 실행 뒤 자동으로 돌며, 통과 전에는 다음 필수 outcome을 완료로 기록하지 않는다.
- 승인되지 않은 misconception catalog는 author audit에만 쓰고 학습자 UI나 mastery에 반영하지 않는다.
- teacher provider는 deterministic feedback 뒤 사용자가 요청할 때만 연다. provider 연결 여부가 lesson 실행과 검증을 막지 않는다.
- streak, leaderboard, 벌점, 연속 학습 압박을 도입하지 않는다.
- UI 형태가 아니라 action 의미를 감사한다. button, toggle, checkbox, segmented control은 실제 command나 choice에 쓸 수 있지만, 학습 evidence 없이 mastery를 바꾸거나 자동 제공할 내용을 숨기는 용도로 쓰지 않는다.

## 실행과 강한 검증 계약

강한 검증은 `ObservedRun -> CheckEngine -> EvidenceTransaction` 한 pipeline이다.

1. `ObservedRun`은 source hash, stdout/stderr, exception, serializable variable snapshot, artifact manifest, runtime/package version을 수집한다.
2. `CheckSpec`은 `outputExact`, `variablePredicate`, `property`, `behavior`, `fileArtifact`, `tableArtifact`, `imageArtifact`처럼 구조화된 payload를 가진다. `Record<string,string>`에 JSON을 숨기지 않는다.
3. property와 behavior check는 제출 source를 clean namespace와 고정 fixture에서 실행한다. student code와 expected code를 같은 mutable session에서 순서대로 실행하지 않는다.
4. `BrowserCheckExecutor`와 `LocalCheckExecutor`는 같은 `CheckSpec` conformance fixture와 expected result를 통과해야 한다.
5. browser에서 지원하지 않는 check는 약한 check로 대체하지 않고 `localRequired`를 반환한다.
6. 모든 run과 pass/fail check event는 `EvidenceTransaction`이 원자적으로 append한다. required strong check가 통과한 경우에만 별도 `CreditGranted` event를 같은 transaction에 추가한다.

`noError`와 `contains`는 weak evidence다. 설명용 practice feedback에는 쓸 수 있지만 completion, mastery, retrieval, transfer credit을 만들지 않는다. `checkByOutput`도 isolation과 fixture가 없는 상태에서는 strong으로 분류하지 않는다.

`CheckSpec@1`은 다음 discriminated union이다. 모든 variant는 `id`, `version`, `kind`, `strength`, `timeoutMs`, `fixtureId`, `fixtureHash`를 공통으로 가진다.

| kind | payload | completion strength |
| --- | --- | --- |
| `noError` | 허용 exception class | weak only |
| `contains` | target stream, normalized tokens, diagnostic message | weak only |
| `output` | callable entry, JSON-safe args, expected value, comparator, absolute/relative tolerance | strong |
| `variable` | variable path, expected type/value/shape, comparator, tolerance | strong |
| `file` | relative path glob, media type, size range, content/schema/hash assertions | strong |
| `table` | artifact 또는 variable path, columns, dtypes, row predicates, aggregate assertions | strong |
| `image` | artifact path 또는 canvas ID, dimensions, channel, property assertions, perceptual tolerance | strong |
| `behavior` | entry point, input cases, expected result/exception/property, max calls | strong |

lesson YAML의 `assessment`는 `outcomeClaims`, `performanceClaim`, fixture, positive·negative predicate, misconception case, support policy, acquisition·near/far transfer·delayed retrieval variant, tier parity와 reviewer approval을 직접 소유한다. content ledger는 `assessmentHash`와 approval evidence만 참조한다. 현재 467레슨에 source 계약과 실행 검산이 있지만 이것을 [learning vertical slice](../00-product-contract/01-prd-improvement-loop/03-learning-vertical-slice/)의 사람 검수나 독립 승인으로 대체하지 않는다. 내용 없는 ID 생성과 동일 문제 복제는 완료 근거가 아니다.

아래 `CheckSandboxPolicy@1`은 후보 설계다. [sandbox feasibility packet](../00-product-contract/01-prd-improvement-loop/05-check-sandbox-feasibility/)이 browser 3-engine과 Win10 probe, 보안 negative fixture, boot·cleanup p95를 통과한 뒤에만 확정한다. 실패 시 일반 subprocess로 약화하지 않고 지원 check subset과 `localRequired` 경계를 다시 결정한다.

`CheckSandboxPolicy@1` 후보는 다음과 같다.

- browser runtime provider는 현재 editor가 이미 고정한 `pyproc` 하나뿐이다. 학습자 셀은 `browserPythonRuntime.ts`의 long-lived singleton에서 실행해 `ObservedRun`만 만들고, strong property·behavior check는 같은 mutable namespace를 절대 재사용하지 않는다. `BrowserCheckExecutor`는 제출 source, 직렬화 fixture, artifact descriptor만 새 check sandbox에 넘기며 expected code나 expected artifact를 학습자 singleton에 주입하지 않는다. sandbox 후보는 pyproc의 공개 `boot`·`Runtime`·`EngineContract` 뒤에서 fresh isolated worker를 만드는 adapter다. 제품 코드가 Pyodide를 직접 import·boot하거나 별도 package/install state를 만들지 않는다. 현재 pyproc 공개 API로 opaque frame 내부 worker boot가 불가능하면 pyproc에 versioned isolated-worker entry를 먼저 추가해 pin을 갱신하거나, 해당 check를 `localRequired`로 분류한다. 두 번째 browser Python engine은 fallback이 아니다.
- browser transport 후보는 opaque-origin `<iframe sandbox="allow-scripts">`, generated CSP bootstrap, 전용 `MessagePort`다. host는 SRI 검증한 pyproc module graph와 engine 설정을 전달하되, opaque origin에서 module graph·worker·WASM을 실제로 부팅할 수 있는지는 feasibility packet이 결정한다. `check-sandbox.html`은 외부 import가 없는 최소 inline bootstrap 하나만 가지며 `buildCheckSandbox.mjs`가 그 exact bytes의 SHA-256을 CSP `default-src 'none'; connect-src 'none'; worker-src blob:; script-src 'sha256-<generated>' blob: 'wasm-unsafe-eval'`과 `checkSandboxBootstrapHash.ts`에 함께 생성한다. Local의 동적 `127.0.0.1:<port>`를 지원하려고 host는 runtime `location.origin`의 base64url과 256-bit nonce를 iframe URL fragment에 넣고 같은 값을 최초 message에 보낸다. fragment는 HTTP request·referrer에 보내지 않으며 bootstrap hash를 바꾸지 않는다. 최초 `window.message`에서만 `event.source===parent`, `event.origin===fragment hostOrigin`, fragment/message nonce 일치, schema version을 검사한 뒤 port를 한 번 bind한다. fragment 제거는 `history.replaceState`를 try/catch하고 opaque-origin `SecurityError`면 실패를 허용하되 parsed origin·nonce 변수와 raw fragment buffer를 즉시 null/zeroize하며 console·telemetry에 쓰지 않는다. iframe은 run 종료 때 폐기한다. `MessagePort` 후속 message에는 origin이 없으므로 origin을 주장하지 않고 frame nonce, monotonic decimal request sequence, unique request ID, payload schema를 검사해 replay·out-of-order를 거부한다. bootstrap은 blob Worker만 만들며 hash mismatch·추가 script·`unsafe-inline`은 build gate가 거부한다. `allow-same-origin`, form, popup, download, top navigation, storage access를 주지 않고 host는 versioned RPC와 1MB output만 받는다. fresh namespace, WASM linear memory maximum 256MB, virtual FS 32MB, wall timeout 8초를 넘기면 iframe과 worker를 함께 폐기한다.
- local Windows release tier: launcher broker가 사용자 home과 실제 project handle을 상속하지 않은 AppContainer를 만들고 network capability 0, low-integrity ACL이 있는 per-run temp/fixture directory만 쓰기 가능하게 부여한다. managed runtime은 실제 `LauncherPaths.runtime_store_dir(version)`과 승인된 immutable package snapshot을 사용한다. install manifest와 tree hash를 검증한 뒤 AppContainer SID에 directory/file inherit `READ|EXECUTE` ACE만 추가하고 write/delete/owner 변경은 허용하지 않는다. `runtimeAclReceipt`는 atomic replace+fsync로 `LauncherPaths.state_dir()/check-sandbox/runtime-acl/<runtimeTreeHash>.json`에, per-run Job/temp ACL receipt는 `.../runs/<runId>.json`에 기록한다. launcher startup은 receipt 전부를 reconcile해 installed manifest와 tree/SDDL hash가 맞는 shared runtime ACE는 유지하고, 제거된 version의 ACE·receipt와 active broker/Job이 없는 per-run temp ACE·directory는 회수한다. hash mismatch는 실행을 차단하고 repair 대상으로 보고한다. runtime update는 기존 directory를 제자리 수정하지 않고 새 version directory를 만들며, GC는 active Job Object가 0일 때 ACL을 회수하고 directory를 삭제한다. child는 `python -I -B`와 `sys.dont_write_bytecode=True`로 boot해 stdlib·allowlisted package는 import하되 runtime과 package tree에는 쓰지 못한다. restricted token과 Job Object의 active process limit 1, kill-on-close, CPU 10초, memory 512MB, output 1MB를 강제한다. launcher의 `check_broker.rs`가 `\\.\\pipe\\codaro-check-<runId>` named pipe와 current-user SID·AppContainer SID 전용 ACL을 만들고 256-bit per-launch secret, request nonce, HMAC-SHA256 handshake, 1MB framed message limit을 적용한다. Python `checkSandboxBrokerClient.py`는 `contracts/checkSandboxBroker.schema.json` request/response만 보내며 raw subprocess를 시작하지 않는다. secret과 pipe handle은 backend에만 전달하고 AppContainer child environment·student code에는 상속하지 않는다. launcher가 pipe, Job Object, runtime ACL receipt, temp ACL의 생성·timeout·teardown을 끝까지 소유한다. Linux/macOS는 동등한 OS sandbox가 구현되기 전 strong local completion을 `unsupported`로 반환하며 일반 subprocess로 강등하지 않는다.
- Local capstone의 허용 network·command는 sandbox 내부 직접 권한이 아니라 host broker의 versioned RPC allowlist로만 제공한다. fixture endpoint ID, command ID, argument schema, byte limit, audit event가 `CheckSpec`에 없으면 broker가 거부한다.
- 양쪽 모두 UTC clock, locale, random seed, environment allowlist를 fixture가 주입하고 run마다 cwd·module cache·environment를 reset한다.
- 허용 오차는 `CheckSpec`에 숫자로 기록한다. nondeterministic retry, expected code와 학생 코드의 namespace 공유, 실제 외부 사이트와 사용자 파일 접근은 금지한다.

## Outcome retrieval scheduler

`OutcomeReviewState`는 `outcomeId`, `stage`, `dueAt`, `lastVariantId`, `recentVariantIds`, `intervalDays`, `lapseCount`, `lastEvidenceId`를 가진다. 기존 `src/codaro/curriculum/reviewScheduler.py`의 lesson row는 migration 때 outcome별 canonical evidence를 가진 항목만 변환하고 나머지는 즉시 due로 둔다.

| 사건 | 다음 stage | due interval |
| --- | --- | --- |
| independent 첫 통과 | `independent` | 1일 |
| pre-state `practicing` reinforcement의 unseen independent hint 0~1 pass | `independent` | 1일 |
| pre-state `independent` 이상인 non-due reinforcement pass | 현재 stage 유지 | 기존 due 유지, practice evidence만 기록 |
| due retrieval hint 0 pass, transfer 전 | `independent` 유지 | 1 -> 3일, 이후 transfer task 우선 |
| unseen near/far transfer hint 0 pass | `transfer` | 7일 delayed retrieval |
| 7일 이상 delayed retrieval hint 0 pass | `mastered` | 14 -> 30 -> 60일 |
| mastered spaced retrieval hint 0 pass | `mastered` | 다음 interval |
| hint 1 strong pass | 현재 stage 유지 | 현재 interval 반복 |
| hint 2 이상 또는 answer reveal | credit 없음 | 1일 |
| meaningful attempt의 strong fail | `reviewDue`, `lapseCount+1` | 1일 |
| 같은 `attemptFingerprint` replay 또는 meaningless edit | 상태 변화·credit 없음 | 기존 due 유지 |
| due 미수행 | `reviewDue` | score 보존, queue 최우선 |

queue는 overdue duration, 낮은 mastery state, lapse count 순으로 정렬하고 하루 최대 12개 outcome을 제공한다. 최근 3개 `taskVariantId`를 제외한 unseen variant를 우선하며 pool이 소진되면 fixture를 바꾼 새 variant 없이는 credit을 주지 않는다. Local 전용 outcome은 Web queue에서 false completion으로 바꾸지 않고 Local handoff로 표시한다.

`occurredAt`은 queue 표시용이며 delayed credit 기준이 아니다. scheduler는 canonical `evidenceTime`과 append receipt 사이 elapsed를 사용하고 `clockAnomaly`가 있으면 mastered 승격을 보류한다. offline import는 원 origin time chain을 보존하며 import 시각으로 due를 당기지 않는다.

readiness는 `00-product-contract`의 `ReadinessPolicy@1`만 사용한다. path prerequisite 중 reinforcement가 아닌 outcome은 `independent`, `reinforcesOutcomeIds`는 `practicing` 이상을 권장 기준으로 보되 route나 run을 잠그지 않는다. credit mode 우선순위는 `retrieval > transfer > capstone > reinforcement > acquisition`이고 pre-state는 causal prefix에서 reducer가 재계산한다. reducer는 `(eventId,outcomeId)` unique key로 한 번만 stage를 계산한다.

## evidence 계약

`LearningEvent`의 저장 schema와 migration은 `00-product-contract`를 따른다. 학습 방법은 그 event의 `mode`와 credit 규칙만 소유한다.

- `mode`: observe, modify, complete, build, transfer, retrieve, debug, capstone
- `observe`, `viewed`, `runSucceeded`, weak check는 이력만 남기고 mastery credit은 0이다.
- required isolated strong check, unseen transfer, due retrieval, capstone artifact만 mastery reducer 입력이 된다.
- 같은 `attemptFingerprint`의 replay는 한 번만 계산하며 canonical hash와 revision 필드는 `00-product-contract`만 정의한다.

mastery 상태와 score는 `00-product-contract`의 versioned `MasteryPolicy` 판정표만 사용한다. observe와 run success는 학습 이력에는 남지만 mastery를 올리지 않는다.

## 연구 기준

- [Test-enhanced learning](https://pubmed.ncbi.nlm.nih.gov/16507066/): 재읽기 대신 실제 회상 수행을 review의 중심으로 둔다.
- [From Example Study to Problem Solving](https://www.tandfonline.com/doi/abs/10.1080/00220970209599510): worked example에서 독립 문제 해결로 scaffolding을 부드럽게 줄인다.
- [The Power of Feedback](https://journals.sagepub.com/doi/full/10.3102/003465430298487): 정오 표시보다 현재 목표, 현재 수행, 다음 행동이 연결된 feedback을 제공한다.
- [Learning programming from erroneous worked examples](https://www.sciencedirect.com/science/article/pii/S0959475221000566): 초보자 Error Lab은 발견 가능한 오류부터 시작하고 너무 어려운 semantic 오류를 무작정 던지지 않는다.
- [The effects of interleaved practice](https://onlinelibrary.wiley.com/doi/10.1002/acp.1598): 기초 acquisition 뒤 Retrieval Sprint에서 관련 outcome을 섞어 문제 유형 선택 연습을 시킨다.

## 영향 파일

- 선행 산출물 소비 `contracts/learningEvent.schema.json`, `contracts/masteryPolicy.schema.json` (생성 owner는 `00-product-contract`); 신규 `contracts/checkSpec.schema.json`
- 신규 `docs/skills/ops/tools/genLearningContracts.py`: Python·TypeScript generated type과 conformance vector 생성
- 신규 `docs/skills/architecture/learning-experience.md`
- 선행 산출물 소비 `editor/src/lib/learningEvent.ts` (생성 owner는 `00-product-contract`)
- 신규 `editor/src/lib/learningMode.ts`
- 신규 `editor/src/lib/observedRun.ts`
- 신규 `editor/src/lib/checkSpec.ts`
- 신규 `editor/src/lib/browserCheckExecutor.ts`
- 신규 `editor/src/lib/checkSandboxFrame.ts`, generated `editor/src/lib/checkSandboxBootstrapHash.ts`, `editor/public/check-sandbox.html`, `editor/scripts/buildCheckSandbox.mjs`
- 신규 `editor/src/lib/outcomeReviewState.ts`
- 신규 `editor/src/components/curriculum/scaffoldLadder.tsx`
- 신규 `editor/src/components/curriculum/errorLab.tsx`
- 신규 `editor/src/components/curriculum/retrievalSprint.tsx`
- 신규 `editor/src/components/curriculum/outcomeMap.tsx`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumSurface.tsx`
- 제거 `editor/src/components/curriculum/checkResultPanel.tsx`: 미사용 legacy prediction·misconception·hint reveal panel을 core 학습 경로에서 삭제
- `editor/src/components/app/currentLearningSurface.tsx`
- `editor/src/components/assistant/teacherPanel.tsx`
- `editor/src/lib/curriculumCheck.ts`, `editor/src/lib/notebookRuntime.ts`
- `editor/src/hooks/useNotebookRuntimeState.ts`
- `editor/src/types.ts`, `editor/src/lib/curriculaRegistry.ts`
- `src/codaro/api/requestModels.py`, `src/codaro/api/curriculumRouter.py`
- `src/codaro/curriculum/checker.py`
- 신규 `src/codaro/curriculum/checkSpec.py`
- 신규 `src/codaro/curriculum/checkEngine.py`
- 신규 `src/codaro/curriculum/localCheckExecutor.py`
- 신규 `src/codaro/curriculum/checkSandboxBrokerClient.py`, `contracts/checkSandboxBroker.schema.json`
- `launcher/codaro-launcher/src/webview.rs`, 신규 `launcher/codaro-launcher/src/check_sandbox.rs`, `launcher/codaro-launcher/src/check_broker.rs`
- `src/codaro/curriculum/misconceptionCatalog.py`
- `src/codaro/curriculum/reviewScheduler.py`
- `src/codaro/curriculum/outcomeCredit.py`
- `src/codaro/curriculum/outcomeMastery.py`
- `src/codaro/curriculum/learningPathFlow.py`
- `src/codaro/curriculum/planComposer.py`

## 영향 함수·심볼

- 신규 `LearningMode`, `LearningEvent`, `resolveScaffoldStep`, `nextFeedbackAction`
- 신규 `ObservedRun`, `CheckSpec`, `CheckEngine`, `BrowserCheckExecutor`, `LocalCheckExecutor`, `CheckSandboxBrokerClient`, `EvidenceTransaction`
- 신규 `RetrievalTaskVariant`, `meaningfulAttempt`, `selectUnseenVariant`
- 신규 `ScaffoldLadder`, `ErrorLab`, `RetrievalSprint`, `OutcomeMap`
- 감사 `data-learning-overview-start`, `data-curriculum-home-journey-next`: 동일 화면 reveal이면 제거하고 실제 route navigation이면 의미와 destination을 명확히 유지
- 수정 `LearningOverviewHeader`, `CurriculumSectionCard`: 중복 reveal 제거, 필요한 도움 자동 제공, 실제 navigation/command control 유지
- `detectErrorClass`, `debuggingPatternRef`
- `matchCodePattern`, `matchErrorPattern`, `matchOutcomes`
- `initState`, `updateOnSuccess`, `updateOnLapse`
- `hintWeight`, `shouldAutoValidate`, `recommendLearningPath`
- `composeMasterPlan`을 Outcome Map 경로 SSOT로 사용하고 `recommendLearningPath`의 category-count 추천을 제거

## 테스트

- 신규 `tests/learning/testLearningMode.py`: evidence에 따른 scaffold 전이와 정답 조기 노출 금지
- 신규 `tests/learning/testRetrievalSprint.py`: self-rating UI가 없고 code 실행 뒤 strong check가 review를 자동 갱신
- 신규 `tests/learning/testRetrievalVariantScheduler.py`: unseen variant 우선, duplicate variant credit 금지, outcome due state
- 신규 `tests/learning/testOutcomeReviewStateMigration.py`: lesson row에서 outcome due state 이관과 interval 전이
- 신규 `tests/learning/testReinforcementCredit.py`: readiness 경계, causal pre-state 재계산, recorded pre-state 불일치 invalid 격리, `retrieval > transfer > capstone > reinforcement > acquisition` exact priority, acquisition fallback, `(eventId,outcomeId)` reinforcement slice dedup, practicing 승격, independent 이상 non-due 무승격, failure lapse
- 신규 `tests/learning/testMeaningfulAttempt.py`: 동일/공백/주석 재실행은 hint escalation 없음
- 신규 `tests/curriculum/testCheckerIsolation.py`: student/expected mutable namespace 분리와 fixture 재현성
- 신규 `tests/curriculum/testCheckerStrengthClassification.py`: `noError`·`contains` weak 고정과 structured strong type
- 신규 `tests/curriculum/testCheckSandboxPolicy.py`: bootstrap hash/CSP mismatch, production origin과 random loopback port의 fragment origin/nonce, replaceState success/SecurityError zeroize, initial source/origin과 port nonce/sequence replay, browser fetch/XHR/WebSocket/importScripts/sendBeacon/storage/top-navigation 차단, Windows managed runtime `python -I -B` boot·stdlib/approved package import·runtime write/delete 거부·ACL receipt/startup orphan reconciliation/GC, pipe ACL/HMAC replay/socket/absolute-path/child-process/handle escape 차단, timeout, broker crash, memory/output cap, reset
- 신규 `tests/curriculum/testObservedRunEvidenceTransaction.py`: pass/fail event atomic append와 strong pass 전 credit 금지
- 신규 `tests/learning/verifyBrowserLocalCheckParityPlaywright.py`: 같은 spec/fixture/result와 unsupported localRequired
- 신규 `tests/learning/verifyLearningFlowFriction.py`: run 뒤 check, feedback, hint, 같은 lesson의 다음 section까지 추가 클릭 0회
- 신규 `tests/learning/verifyLearningControlIntent.py`: 모든 학습 control이 command, navigation, 명시적 choice에 연결되고 자기평가만으로 mastery를 변경하지 않음
- 신규 `tests/learning/testApprovedMisconceptionPolicy.py`: draft catalog의 제품 진단 차단
- 신규 `tests/learning/verifyLearningMethodPlaywright.py`: modify, fail, targeted feedback, retry, transfer, retrieval flow
- 수정 `tests/learning/verifyLearningCardPlaywright.py`: TeacherPanel 기본 닫힘과 학습 폭 확보
- 실행: `uv run python -X utf8 tests/run.py gate app-runtime`
- 실행: 신규 `uv run python -X utf8 tests/run.py gate learning-method`

## 롤백

- 새 evidence migration과 단일 writer는 `00-product-contract`를 따른다. legacy 저장소에 새 기록을 dual-write하지 않는다.
- scaffold UI는 section contract의 새 mode가 없을 때 기존 structured section을 읽을 수 있어야 한다.
- review migration은 기존 due date를 보존하며 self-rating event는 legacy history로만 유지한다. 새 self-rating control은 만들지 않는다.
- provider와 misconception을 끊어도 deterministic checker와 error reference가 항상 기본 feedback을 제공한다.

## 평가

### 개발자 관점

- 기존 checker, outcome credit, review scheduler의 이름을 재사용해 결함을 숨기지 않는다. isolated check engine과 단일 mastery policy로 대체하고 legacy writer는 compatibility release 뒤 제거한다.
- 가장 큰 위험은 많은 adaptive rule이다. 모든 전이는 작은 pure function과 evidence event로 결정적으로 테스트한다.

### PM 관점

- 차별점은 대화형 설명이 아니라 학습자가 실제로 독립 수행 단계까지 올라가고 결과물을 남기는 과정이다.
- 사용자는 472개 숫자보다 지금 할 한 가지, 왜 막혔는지, 무엇을 완성했는지를 명확히 봐야 한다.
