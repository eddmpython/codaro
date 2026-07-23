# 00 Product Contract

상태: 진행

## 목표

디자인을 바꾸기 전에 웹 Run과 로컬의 제품 약속, capability, 학습 증거 상태를 코드 계약으로 고정한다. 웹을 다운로드 유도용 미리보기로 취급하지 않으며, 지원 가능한 학습은 웹에서 끝낼 수 있게 한다.

계획 자체의 current-code 정합성과 실행 가능성은 [PRD improvement loop](01-prd-improvement-loop/)가 목표 점수 없이 평가한다. 같은 scope hash의 raw report와 fact audit가 있고 plan-internal P0·P1이 닫히기 전에는 이 workstream을 `_done`으로 이동하지 않는다.

## 현재 구현 상태

- `contracts/learningEvent.schema.json`, `contracts/masteryPolicy.v1.json`, `contracts/runRouteState.schema.json`, `contracts/learningArchive.schema.json`이 공용 계약 source다.
- Python `MasteryPolicy`와 TypeScript `MasteryPolicy`가 같은 generated policy와 golden vector를 소비한다. `outcomeMastery`는 이 reducer를 호출하며 legacy completion/access weight와 0.6/0.4 blend는 mastery writer에서 제거됐다.
- `RunRouteState@1`이 Web과 Local의 surface, `LessonRef`, section, document, task, runtime tier를 정규화하고 URL, history, session storage를 연결한다. 기본 제품 surface는 `curriculum`이다.
- learning archive v2는 document, drafts, virtual FS와 package 실제 bytes, evidence, lineage, automation draft를 content-addressed blob으로 묶는다. Web materialization과 Local immutable object/atomic `HEAD` import가 구현됐고 automation draft는 명시적 실행 전까지 disabled·unscheduled다.

이는 계약과 구현이 착수됐다는 뜻이다. R10 독립 평가, 사람 assessment 승인, 실제 배포와 downgrade release matrix가 없으므로 이 workstream은 `진행`이며 `_done`이 아니다.

## 제품 capability

| 기능 | Web Run | Local | 표면 규칙 |
| --- | --- | --- | --- |
| 공개 레슨 탐색과 읽기 | 완전 지원 | 완전 지원 | 같은 lesson ID와 문서 사용 |
| 브라우저 호환 Python 실행 | 완전 지원 | 완전 지원 | 결과에 `tierUsed` 표시 |
| 강한 레슨 채점과 진행 저장 | browser-supported `CheckSpec`은 완전 지원, 그 밖은 `localRequired` | 완전 지원 | 약한 check로 강등하지 않고 채점 증거에 runtime tier 저장 |
| 프로젝트 파일과 폴더 | 사용자 승인 범위 또는 브라우저 저장소 | 실제 파일 시스템 | capability를 숨기지 않고 설명 |
| 패키지 | 브라우저 지원 목록 | `uv`와 로컬 환경 | 레슨 선언 package는 Run에서 자동 준비, 임의 package 선택만 명시적 command |
| 터미널과 외부 프로세스 | 미지원 | 지원 | disabled 장식 대신 Local 전환 행동 제공 |
| 상주 스케줄, 웹훅, GUI 자동화 | 미지원 | 지원 | Local의 핵심 가치로 전면 배치 |
| 진행 이어하기 | 브라우저 저장소, 내보내기 가능 | 로컬 저장소 | 같은 schema와 merge 규칙 사용 |

`browser-supported`는 lesson label이 아니라 check sandbox feasibility, package/runtime capability와 browser matrix를 통과한 `CheckSpec` 단위 판정이다. 지원되는 레슨은 Web에서 읽기·수정·실행·strong check·진도 저장까지 끝나며 다운로드 확인을 요구하지 않는다. 미지원 check를 `noError`로 바꾸지 않고 정확한 이유와 Local handoff를 제공한다. 현재 Python core 공급망은 network-first이므로 첫 Run에 network가 필요하고 offline 학습을 출시 약속으로 쓰지 않는다.

## Lesson identity 계약

저장과 API의 유일한 lesson identity는 `LessonRef={category, contentId}`다. 문자열 표현은 `lessonKey="<category>/<contentId>"`이며 `contentId`는 YAML file stem이다.

- `meta.id`는 기존 import·표시 metadata로만 읽고 URL, progress, evidence, graph key로 사용하지 않는다.
- public canonical은 `/learn/lesson/<category>/<contentId>`다. 한 lesson이 여러 domain에 속해도 canonical은 하나다.
- `path=<domainId>`는 추천 경로와 breadcrumb를 복원하는 navigation context이며 identity가 아니다.
- Landing generator, `StudyLoader`, outcome graph, Run handoff, progress store가 같은 `lessonKey`를 사용한다.
- 착수 전 `meta.id` 중복 5쌍과 graph 누락 3개를 고치고 filesystem, loader registry, outcome graph, generated route가 모두 472개인지 검증한다.
- graph에서 누락된 파일은 `curricula/python/basics/builtins/33_tempfile.yaml`, `curricula/python/basics/builtins/34_hashlib.yaml`, `curricula/python/basics/builtins/35_zipfile.yaml`이다.
- 중복 legacy `meta.id`는 `31`: `curricula/python/basics/advancedPython/31_컨텍스트매니저.yaml`·`curricula/python/basics/builtins/31_subprocess.yaml`, `32`: `curricula/python/basics/advancedPython/32_제너레이터심화.yaml`·`curricula/python/basics/builtins/32_contextlib.yaml`, `33`: `curricula/python/basics/advancedPython/33_async와코루틴.yaml`·`curricula/python/basics/builtins/33_tempfile.yaml`, `34`: `curricula/python/basics/advancedPython/34_match와패턴매칭.yaml`·`curricula/python/basics/builtins/34_hashlib.yaml`, `35`: `curricula/python/basics/advancedPython/35_동시성.yaml`·`curricula/python/basics/builtins/35_zipfile.yaml`이다. 모두 전체 category와 file stem이 있는 `LessonRef`로만 해석한다.

## URL과 history 계약

- Landing primary action은 `/learn`으로 들어가 목표를 고르게 한다. `/run/`은 header와 lesson의 실제 workspace action으로 제공한다.
- `/run/`에 durable state가 없으면 `surface=curriculum`으로 시작하고, 진행 evidence가 있으면 마지막 미완료 lesson을, 없으면 Learn home을 보여 준다. `chat`은 beta utility이며 기본 진입점이 아니다.
- `RunRouteState`는 `surface`, `pathId`, `lessonKey`, `sectionId`, `documentId`, `taskId`를 가진다.
- surface, lesson, document, task처럼 사용자가 목적지를 바꾸는 이동은 `pushState`로 남긴다. 같은 목적지의 section progress 동기화는 `replaceState`를 쓴다.
- 선택 cell, drawer, tooltip, scroll offset 같은 일시 UI는 URL에 넣지 않는다. `popstate`는 durable state를 복원하고 복원한 section heading으로 focus를 돌린다.
- `/app/` redirect는 query와 legacy hash를 `RunRouteState`로 변환해 보존한다. service worker scope와 cache는 `/run/` 기준으로 새 version을 쓰고 이전 `/app/` cache는 activation에서 제거한다.
- 공개 lesson route는 SEO와 읽기 표면, `/run/`은 실행 가능한 workbench를 소유한다. 같은 lesson body와 `LessonRef`를 쓰되 route 역할을 섞지 않는다.

## 학습 상태 계약

다음 상태를 한 개의 `completed` boolean으로 합치지 않는다.

1. `notStarted`: 레슨을 열지 않음
2. `viewed`: 레슨을 열고 시작 지점이 기록됨
3. `attempted`: 학습자 코드 실행 이력이 있음
4. `runSucceeded`: 현재 제출이 예외 없이 실행됨
5. `checkPassed`: 해당 미션의 의미 검증이 통과함
6. `lessonCompleted`: 모든 필수 미션의 `checkPassed` 증거가 있음
7. `mastered`: outcome별 복습 또는 capstone 증거가 유효함
8. `graduated`: 경로의 필수 outcome과 runtime requirement를 모두 만족함

`runSucceeded`만으로 `lessonCompleted`를 쓰는 현재 동작은 제거한다. Web Run에서 통과한 증거는 유효하지만 `tierUsed=browser`를 보존한다. 로컬 전용 outcome이 포함된 경로는 웹에서 가능한 부분까지 완료한 뒤 `Local에서 마무리` 상태가 되며, 거짓 졸업을 기록하지 않는다.

학습자가 code를 실행한 뒤 별도 검증, 완료, 기억 여부 확인을 다시 눌러 상태를 바꾸게 하지 않는다. code 실행 pipeline이 strong check까지 자동 수행하고 evidence에서 상태를 파생하며, 필요한 hint와 다음 학습은 현재 맥락에 자동으로 제공한다.

## Evidence와 mastery SSOT

세 번째 mastery 체계를 만들지 않는다.

- Python domain의 `LearningEvent`와 append-only `LearningEvidenceStore`가 새 학습 기록의 canonical writer로 구현돼 있다. 실제 활성 배포 전에 [downgrade-safe migration packet](01-prd-improvement-loop/04-evidence-migration/)의 C0 compatibility release를 먼저 배포한다.
- Web IndexedDB와 Local SQLite는 같은 event schema를 구현하는 storage adapter다. merge는 `eventId` set union이며 같은 ID의 payload hash가 다르면 자동 덮어쓰지 않고 conflict로 격리한다.
- `MasteryPolicy.reduce(events)`는 evidence에서 mastery view를 만드는 유일한 pure reducer다. `outcomeMastery`와 `learnerStateBridge`는 이 projection을 소비하고 별도 weight를 계산하지 않는다.
- `outcomeMastery.COMPLETED_CONTRIB`, `ACCESSED_CONTRIB`, `FAST_TRACK_MASTERY_BOOST`와 `learnerStateBridge`의 0.6/0.4 blend는 제거됐다. viewed, run success, weak check는 mastery를 올리지 않는다.
- C0 cutover 전에는 기존 `ProgressTracker`의 `~/.codaro/progress.json`과 `LearnerStateStore`의 `~/.codaro/learnerState.db` writer를 유지하면서 canonical store reader·writer와 `cutoverMarker`를 이해한다. C1 import가 backup, row count, source hash를 검증하고 marker를 atomic commit한 뒤 C0와 C1 모두 canonical store만 쓴다. validated legacy record는 `legacyValidated` evidence로 한 번 변환하되 새 졸업 근거로 쓰지 않고 첫 retrieval strong check 뒤 canonical evidence로 대체한다.
- dual write는 하지 않는다. store header의 `schemaVersion`, `dataEpoch`, `minimumReaderVersion`, `cutoverEventId`를 launcher rollback manifest와 대조하고, marker를 이해하지 못하는 binary로 downgrade하지 않는다. C0 -> C1 -> C0 -> C1 왕복에서 새 event가 보존된 뒤에만 legacy writer와 bridge를 제거한다.

store의 append 단위는 `LearningEvent` discriminated union이다.

| kind | 기록 시점 | credit |
| --- | --- | --- |
| `RunObserved` | 성공·실패를 포함한 모든 실행 종료. source, stdout/stderr, exception, artifact manifest 포함 | 없음 |
| `CheckEvaluated` | weak/strong 각 check의 pass/fail과 error class, target, recommended hint level 결정 | 없음 |
| `SupportProvided` | 실제로 제공한 hint level과 answer reveal 여부 | 없음 |
| `CreditGranted` | required strong check가 통과하고 variant·hint·dedup policy를 만족 | `MasteryPolicy` 입력 |
| `MigrationImported` | 검증된 legacy record 이관 | legacy 표시만, 새 mastery 없음 |
| `EvidenceTombstoned` | corruption, user reset, privacy deletion 요청의 논리 취소 | 참조 credit을 reducer에서 제외 |

실패 run도 `RunObserved`와 `CheckEvaluated`로 저장하므로 attempted 상태, 오류 맥락, hint escalation을 재방문 때 복원한다. transaction 실패 시 event 일부를 쓰지 않는다.

cross-device reset은 wall-clock cutoff를 쓰지 않는다. 모든 event는 global `learningEpoch`, 적용되는 path·lesson의 `epochRefByScope`, `deviceId`, monotonic `deviceSequence`, Lamport counter를 가진다. `EvidenceTombstoned`는 `scope=global | path:<pathId> | lesson:<LessonRef>`, `parentEpoch`, `newEpoch=SHA256(scope,parentEpoch,eventId)`, 이전 epoch의 `frontierByDevice={deviceId:maxSequence}`, 명시적 revoked credit event ID를 기록한다. tombstone total order는 `(lamport, deviceId, deviceSequence, eventId)` 오름차순이다. 같은 scope·parent의 concurrent sibling 중 total order 최대 하나만 canonical child가 되고 loser branch와 그 descendant는 conflict로 격리한다. 다음 canonical reset은 직전 canonical child를 `parentEpoch`로 참조해야 하며 noncanonical parent의 tombstone은 자동 승격하지 않는다. global reset은 모든 scope의 ancestor를 바꾸고, path reset은 그 path와 하위 lesson만, lesson reset은 해당 lesson만 바꾼다. projection은 event에 적용되는 global·path·lesson epoch가 모두 현재 canonical chain의 leaf일 때만 credit을 인정하므로 unrelated progress는 유지되고 이전 epoch에서 늦게 도착한 event는 격리된다. offline device의 stale event는 자동 부활시키지 않고 code artifact만 사용자 선택으로 가져올 수 있다. 개인정보 삭제 요청은 export 선택 뒤 storage adapter가 tombstoned payload를 물리 삭제하고 deletion receipt의 count와 hash만 남긴다.

canonical hash는 string을 Unicode NFC·LF로 normalize한 뒤 RFC 8785 JSON Canonicalization Scheme bytes의 SHA-256을 쓴다. NaN과 Infinity는 schema error, `-0`은 `0`, exponent와 integer/float 표현은 JCS number serialization을 따른다. counter overflow를 피하려고 `lamport`, `deviceSequence`, `frontierByDevice` 값은 JSON number가 아니라 `^(0|[1-9][0-9]*)$` decimal string으로 저장하고 Python `int`와 TypeScript `BigInt`로 비교한다. timestamp와 local absolute path는 lesson content hash 입력에서 제외하고 artifact bytes, normalized relative path, schema version은 포함한다. Python/TypeScript golden vector가 같은 hash와 total order를 증명한다.

모든 `LearningEvent` envelope는 `schemaVersion`, `eventId`, `kind`, `occurredAt`, `payloadHash`, `learningEpoch`, `epochRefByScope`, `deviceId`, decimal-string `deviceSequence`, decimal-string `lamport`를 가진다. 실행 pipeline event는 같은 `RunContext`를 참조한다. revision 용어는 아래 이름만 사용하며 `contentHash`, `lessonRevision`, `checkerVersion` 별칭을 만들지 않는다.

- run context identity: `attemptId`, `runId`, `lessonRef`, `sectionId`, `outcomeIds`, `taskVariantId`
- revision: `lessonContentHash`, `sourceCodeHash`, `checkSpecId`, `checkSpecVersion`, `checkEngineVersion`, `masteryPolicyVersion`, `fixtureHash`
- runtime: `tierUsed`, `runtimeId`, `runtimeVersion`, `packageSetHash`
- `RunObserved` payload: `startedAt`, `completedAt`, `runStatus`, stdout/stderr, exception, `artifactDescriptors[]`
- `CheckEvaluated` payload: `runEventId`, check target, strength, pass/fail, comparator result, `errorClass`, recommended hint
- `SupportProvided` payload: `runEventId`, `hintLevel`, `answerReveal`, support ID
- `CreditGranted` payload: `runEventId`, `checkEventIds[]`, `supportEventIds[]`, `attemptFingerprint`, `creditSlices[]`. slice는 unique `outcomeId`, `creditMode=acquisition|reinforcement|transfer|retrieval|capstone`, 관찰된 pre-attempt mastery state를 가진다. reducer는 이 state를 신뢰하지 않고 causal prefix에서 재계산하며 불일치 event를 invalid evidence로 격리한다.

`attemptFingerprint`는 `lessonRef`, `sectionId`, `taskVariantId`, `sourceCodeHash`, `checkSpecId`, `checkSpecVersion`, `fixtureHash`, `runtimeId`, `runtimeVersion`을 canonical JSON으로 직렬화한 SHA-256이다. 같은 fingerprint의 pass evidence는 store와 import에서 한 번만 credit으로 계산한다. 서로 다른 retrieval이나 transfer credit은 새 `taskVariantId`와 `fixtureHash`가 있어야 한다.

## MasteryPolicy 판정표

`MasteryPolicy@1`은 outcome마다 다음 순서형 상태와 score를 동일하게 파생한다. 단순 합산 weight를 구현자가 다시 정하지 않는다.

| 상태 | score | 필요한 canonical evidence |
| --- | ---: | --- |
| `unproven` | 0.00 | strong pass 없음 |
| `practicing` | 0.25 | guided mission strong pass. hint level 제한 없음 |
| `independent` | 0.60 | unseen independent build 1개 strong pass, `hintLevel<=1`, answer reveal 없음 |
| `transfer` | 0.80 | `independent`와 다른 variant·fixture의 near 또는 far transfer 1개 strong pass, `maxHintUsed=0` |
| `mastered` | 1.00 | `transfer` 뒤 7~14일 delayed retrieval 1개 strong pass, `maxHintUsed=0`, 총 3개 이상의 distinct `taskVariantId` |
| `reviewDue` | 직전 score 보존 | due를 넘겼거나 최신 delayed/retrieval strong check가 실패함 |

- capstone은 독립 구현과 transfer 조건을 동시에 만족할 수 있지만 delayed retrieval을 대신하지 못한다. 두 조건으로 쓰려면 서로 다른 check target과 두 종류 이상의 artifact evidence가 있어야 한다.
- `hintLevel=1`은 개념 단서만 허용한다. 부분 정답, target output, solution reveal이 포함된 `hintLevel>=2`는 practicing만 만들고 independent 이상 credit을 주지 않는다. 실패 target, observed/expected 차이와 error class는 hint가 아니라 hint 0 deterministic feedback이며 첫 실패 직후 자동 제공한다. 같은 misconception의 서로 다른 meaningful fail 2회에는 hint 1, 3회에는 hint 2를 자동 제공하고, 정답 공개만 학습자의 명시적 command로 남긴다.
- failure와 lapse는 과거 evidence를 삭제하지 않는다. 최신 due state만 `reviewDue`로 바꾸며 재통과 뒤 원래 단계와 새 due를 복원한다.
- `MasteryPolicy`의 입력 정렬은 decimal counter를 쓰는 `(lamport,deviceId,deviceSequence,eventId)` total order이며 `occurredAt`은 표시용이다. delayed eligibility와 due interval은 이전 canonical credit의 `evidenceTime`과 append receipt로 계산한다. clock 역행·비정상 jump는 `clockAnomaly`를 기록하고 delayed credit을 보류한 뒤 새 retrieval을 배정한다. import만으로 시간 경과가 생기지 않는다. 동일 event vector는 Python과 TypeScript에서 byte-identical state JSON을 만들어야 한다.
- Python `src/codaro/curriculum/masteryPolicy.py`가 reference implementation이고 `editor/src/lib/masteryPolicy.ts`는 같은 versioned `mastery-policy-v1.json`과 golden vector를 실행한다. 어느 한쪽도 자체 threshold를 갖지 않는다.

`ReadinessPolicy@1`은 화면 접근을 막는 gate가 아니라 추천과 scaffold 입력이다. 일반 prerequisite는 `independent` 이상, `reinforcesOutcomeIds`는 `practicing` 이상이면 `recommendedReady=true`다. 미충족 사용자의 레슨·코드 실행은 막지 않고 필요한 foundation과 scaffold를 inline으로 먼저 제공한다.

strong pass 하나는 `(eventId,outcomeId)`당 slice 하나만 만든다. check target의 mode 우선순위는 `retrieval > transfer > capstone > reinforcement > acquisition`이다. capstone이 독립·전이를 함께 증명하려면 위 조건대로 서로 다른 check target과 별도 `CreditGranted` event를 쓴다. mode가 앞의 세 가지가 아니고 outcome이 `reinforcesOutcomeIds`이며 causal pre-state가 `practicing` 이상이면 `reinforcement`, 아니면 `acquisition`이다. 같은 event를 acquisition과 reinforcement로 두 번 계산하지 않는다. reinforcement slice는 `practicing`에서 unseen independent hint 0~1 pass일 때만 `independent`로 올릴 수 있고, 이미 `independent` 이상인 non-due reinforcement pass는 evidence를 남기되 stage·due interval을 올리지 않는다. meaningful strong fail은 기존 lapse 규칙을 적용한다.

## 사용자 흐름

- 첫 방문: Landing `웹에서 시작` -> Learn 목표 선택 -> 추천 경로 -> 첫 레슨 -> Run에서 코드 수정 -> 강한 검증 -> 다음 레슨
- 재방문: Learn `이어하기` -> 마지막 미완료 미션 -> 이전 실행과 진행 복원
- 로컬 전환: 웹에서 로컬 전용 outcome 진입 -> 작업 이유와 얻는 capability 확인 -> Local 설치 -> 진행 가져오기 -> 자동화 실행
- 로컬 직접 진입: Local 홈 -> 최근 학습 또는 최근 자동화 -> 같은 정보 구조와 상태 언어 사용

## 금지 범위

- 예측 카드와 예측 입력을 학습 필수 단계로 다시 넣지 않는다.
- 웹에서 불가능한 자동화를 실행 가능한 것처럼 보이지 않는다.
- 웹에서 가능한 레슨에 다운로드 modal을 먼저 띄우지 않는다.
- 실행 성공, 레슨 완료, 숙달, 졸업을 같은 배지나 색으로 표시하지 않는다.
- 과제방을 이 이니셔티브의 진입 구조로 사용하지 않는다.
- 랜딩과 제품에 별도 제품명, 별도 색 체계, 별도 내비게이션 어휘를 만들지 않는다.
- control의 모양을 금지하지 않는다. 목표 선택, 실행/중지, route 이동, 도구 열기, 다시 시도처럼 학습자가 실제로 결정하는 action에는 적절한 button·toggle·menu를 사용한다.
- 시스템이 이미 아는 check 결과, progress, 적절한 hint, 이어지는 section을 보기 위해 같은 맥락에서 추가 클릭을 요구하지 않는다. 자기평가 클릭만으로 mastery를 변경하지 않는다.

## 구현 순서

1. `LessonRef`와 472-way identity audit를 먼저 고정한다.
2. `RunRouteState`와 `/learn`, `/run/`, `/app/` ownership을 고정한다.
3. `RuntimeTier`, `LearningEvent`, `CheckResult`, `MasteryPolicy` schema를 정의한다.
4. editor의 `apiOnline` boolean을 제품 capability와 분리한다. 브라우저 런타임이 준비됐지만 로컬 API가 없는 상태를 `offline` 오류로 부르지 않는다.
5. 기존 progress와 learner state를 read-only로 읽어 evidence로 이관하는 one-shot adapter를 만든다.
6. 웹 IndexedDB와 Local SQLite adapter가 같은 `LearningEvidenceStore` contract를 구현하게 한다.
7. Python/TypeScript `MasteryPolicy` conformance vector를 통과시킨 뒤 UI projection을 연결한다.
8. UI copy와 badge가 `tierUsed`, `checkPassed`, `localRequired`를 구분하게 한다.

## 영향 파일

- 신규 `editor/src/lib/runtimeCapability.ts`
- 신규 `editor/src/lib/learningEvent.ts`
- 신규 `editor/src/lib/learningProgressStore.ts`
- 신규 `editor/src/lib/masteryPolicy.ts`
- 신규 `editor/src/lib/runRouteState.ts`
- `editor/src/hooks/useSurfaceRoute.ts`
- `editor/src/lib/surfaceModel.ts`
- `editor/src/lib/appBootstrap.ts`
- `editor/src/lib/connectionStatus.ts`
- `editor/src/lib/curriculumCompletion.ts`
- `editor/src/lib/curriculumProgress.ts`
- `editor/src/lib/api.ts`
- `editor/src/types.ts`
- `src/codaro/curriculum/progress.py`
- `src/codaro/curriculum/progressFlow.py`
- `src/codaro/curriculum/outcomeMastery.py`
- `src/codaro/curriculum/learnerState.py`
- `src/codaro/curriculum/learnerStateBridge.py`
- `src/codaro/curriculum/masterySignal.py`
- 신규 `src/codaro/curriculum/learningEvent.py`
- 신규 `src/codaro/curriculum/learningEvidenceStore.py`
- 신규 `src/codaro/curriculum/masteryPolicy.py`
- 신규 `src/codaro/curriculum/mastery-policy-v1.json`
- `src/codaro/api/requestModels.py`
- `src/codaro/api/curriculumRouter.py`
- `docs/skills/architecture/curriculum-os.md`
- `docs/skills/architecture/learning-yaml-contract.md`

## 영향 함수·심볼

- 신규 `RuntimeTier`, `SurfaceCapability`, `resolveSurfaceCapability`
- 신규 `LessonRef`, `LearningEvent`, `RunContext`, `LearningEvidenceStore`, `MasteryPolicy`, `resolveLearningCompletion`
- 신규 `RunRouteState`, `parseRunRoute`, `serializeRunRoute`, `useRunRoute`
- 수정 `DEFAULT_SURFACE`, `useSurfaceRoute`, `useProductSurfaceSelection`
- `recordLessonMissionComplete`를 `recordLearningEvent`로 대체
- `loadCurriculumProgress`
- `ProgressTracker.completeMission` writer를 제거하고 legacy progress를 읽는 migration facade로 제한
- `updateCurriculumProgress`
- `CurriculumProgressRequest`
- `curriculumRouter.updateProgress`

## 테스트

- 신규 `tests/curriculum/testLearningEvent.py`: 상태 전이, browser/local tier, 로컬 전용 졸업 차단
- 신규 `tests/curriculum/testLearningEventLifecycle.py`: failed run/check 복원, atomic credit, equal-Lamport concurrent global/path/lesson reset의 모든 merge permutation, sibling winner·noncanonical descendant 격리, stale offline replay, unrelated scope 보존, privacy deletion receipt
- 신규 `tests/curriculum/testCanonicalLearningHashes.py`: Python/TypeScript Unicode·newline·decimal·artifact hash vector 동일성
- 신규 `tests/curriculum/verifyLessonIdentity.py`: filesystem=registry=graph=generated route=472와 `LessonRef` 유일성
- 신규 `tests/curriculum/testLearningEvidenceUniquenessAndReplay.py`: duplicate import와 repeated run credit 차단
- 신규 `tests/curriculum/testCanonicalMasteryPolicy.py`: 단일 reducer, readiness threshold, `(eventId,outcomeId)`별 acquisition/reinforcement slice dedup과 viewed/run/weak evidence 무기여
- 신규 `tests/curriculum/testMasteryPolicyConformance.py`: Python/TypeScript golden vector로 readiness, reinforcement, causal pre-state 재계산·recorded pre-state 불일치 invalid 격리, exact mode priority, dedup, ordering, hint, lapse, delayed 상태 동일성
- 신규 `tests/curriculum/verifyLegacyMasterySourcesRemoved.py`: compatibility release 뒤 legacy writer와 bridge 0건
- 신규 `tests/surface/testLearningProgressStoreContract.py`: Web storage와 API adapter 계약
- 신규 `tests/surface/testRunRouteState.py`: parse/serialize, back/forward, `/app/` query/hash 보존
- 수정 `tests/curriculum/testCurriculum.py`: 기존 progress payload migration
- 수정 `tests/curriculum/testCurriculumProgressFlow.py`: `runSucceeded` 단독 완료 금지
- 수정 `tests/surface/verifyOnboardingPlaywright.py`: 웹 Run을 서버 offline 오류로 표시하지 않음
- 실행: `uv run python -X utf8 tests/run.py gate backend`
- 실행: `uv run python -X utf8 tests/run.py gate app-runtime`

## 롤백

- 기존 `completedMissions`, `completedAt`, learner state row를 migration backup에 보존하고 한 compatibility release 동안 read-only로 읽는다. 새 write는 evidence store 한 곳에만 한다.
- Web storage schema에 `schemaVersion`을 넣고 읽기 실패 시 기존 키를 보존한 채 새 빈 저장소를 만들지 않는다.
- capability 계산이 실패하면 `browserBasic`으로 과장 강등하지 않고 `unknown` 상태와 재시도 행동을 표시한다.

## 평가

### 개발자 관점

- 디자인 컴포넌트가 `apiOnline` 조건문을 직접 소유하지 않고 capability selector만 읽어야 웹과 로컬 UI가 갈라지지 않는다.
- progress migration과 runtime tier가 가장 큰 데이터 위험이다. UI migration보다 먼저 테스트로 잠근다.

### PM 관점

- 웹 사용자가 실제로 완료 가능한 범위를 명확히 얻고, 로컬 전환은 필요한 순간에만 등장한다.
- 제품이 무엇을 할 수 없는지 정직하게 말하면서도 웹 경험을 열등하게 보이게 만들지 않는 것이 합격 기준이다.
