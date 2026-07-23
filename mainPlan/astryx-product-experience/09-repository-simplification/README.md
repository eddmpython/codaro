# 09 Repository Simplification

상태: 진행

학습자 예측 계약·도구·332개 YAML block과 active classroom backend/frontend를 삭제했다. progress refresh는 독립 `curriculumProgressEvent.ts`가 소유한다. 기존 classroom 데이터는 local-owner archive migration으로 보존·검증·삭제할 수 있고 HTTP는 한 호환 release 동안 `410 Gone`만 반환한다. dead Landing source와 unused illustration을 제거했고 lifecycle generated-source policy, Landing/editor module boundary, 양쪽 exact package pin을 적용했다. `removed-learning-concepts`와 `repository-simplification` machine gate는 green이지만 선행 workstream의 독립 승인과 completion transition evidence가 없다. 따라서 machine 범위 구현 뒤에도 상태는 `진행`이며 `_done`으로 이동하지 않는다.

## 목표

새 학습 방식과 디자인 전환이 끝난 뒤 낡은 개념, 보류 기능, 죽은 fallback, 미사용 자산, 거대한 조립 파일, 진실을 가리지 못하는 품질 게이트를 저장소에서 제거한다. 백업 폴더나 legacy flag로 남기지 않고 git history를 복구 수단으로 쓴다.

## 이상 징후 감사

| 항목 | 현재 상태 | 판정 |
| --- | --- | --- |
| learner prediction | 계약·도구·test·curriculum 30파일의 `predict:` 332블록 제거, domain 고유 prediction 용어만 유지 | `removed-learning-concepts` green |
| classroom | active backend/frontend와 core side effect 제거, local-owner archive migration과 HTTP 410만 유지 | `removed-learning-concepts` green |
| weak quality gate | strong CheckSpec 1,413개/467레슨, weak-only 0, mastery·transfer·retrieval 각 467레슨, independent approval 0 | machine coverage와 독립 학습 검수를 분리하고 top-tier eligibility는 독립 승인에서 차단 |
| misconception status | catalog 34개가 전부 draft, reviewed/approved 0개 | 제품 진단에 사용 금지, 승인 경로 신설 |
| unused illustrations | `illustration.py` 21개와 legacy dynamic loader 제거 | `repository-simplification` green |
| dead landing source | 수기 home body, 미사용 nav/proof 배열, fake product frame HTML·CSS 제거 | `repository-simplification` green |
| generated drift | lifecycle manifest, predev/prebuild generator, clean command와 Landing/editor resolver ignore policy 구현 | `repository-simplification` green |
| monolith | Landing shell/route 7경계, editor type 7도메인, API 6client, curriculum surface 8경계와 markdown 5경계로 분리 | `repository-simplification` module boundary로 재결합 차단 |
| package drift | 두 앱을 React 19.2.7, TypeScript 6.0.3, lucide 1.25.0, yaml 2.9.0 exact pin으로 맞춤 | compatibility manifest와 두 lockfile 검증 green |

## 정리 0: 학습 흐름 마찰

학습 방식 전환의 첫 정리 작업으로 실제 수행 증거를 만들지 않는 중복 클릭을 제거한다. control 자체나 label을 일괄 삭제하지 않고 action의 의미와 destination을 감사한다.

| 현재 위치 | 제거 대상 | 대체 동작 |
| --- | --- | --- |
| `LearningOverviewHeader` | 같은 lesson 본문을 단순 scroll/reveal하는 `학습 시작` | lesson route 진입 즉시 overview와 첫 section 준비. 다른 route로 들어가는 시작 action은 유지 |
| `CurriculumHome` | `기억남`, `가물` review action | 새 retrieval code task 실행 뒤 review 자동 갱신 |
| 삭제된 legacy `CheckResultPanel` | `다음 힌트 보기`, prediction diff, draft misconception, 수동 hint reveal state | 현재 `CurriculumSectionCard`가 실패 결과와 필요한 다음 수정을 실행 직후 inline으로 제공 |
| `CurriculumHome` journey | 제거 대상 아님 | 실제 다음 lesson navigation이므로 유지하고 destination·route marker를 명확히 함 |
| section header `onSelectBlock` | 제거 | visible header는 비클릭 `<h2>`로 고정하고 실제 section 이동은 TOC·lesson anchor만 URL과 heading focus를 갱신 |

실행과 중지는 실제 명령이므로 유지한다. 목표 선택, route 이동, 파일과 결과물 열기, 다시 시도, 도구 설정도 직접 목적이 있는 interaction이므로 유지한다. button, toggle, checkbox, segmented control의 존재를 세지 않고 각 action이 command, navigation, choice인지 검사한다.

자동 check 뒤 result summary는 polite `aria-live`에서 한 번만 알리고 CodeMirror focus와 현재 scroll을 빼앗지 않는다. 사용자가 TOC나 lesson anchor로 이동했을 때만 대상 heading으로 focus를 옮긴다.

## 제거 1: prediction 체계

다음 제거를 완료했다.

- 삭제 `src/codaro/curriculum/predictionDiff.py`
- 삭제 `tests/learning/testPredictionDiff.py`
- 삭제 `tests/curriculum/verifyPredictContractStrict.py`
- 삭제 `tests/_predictStrictCategories.txt`
- 삭제 `docs/skills/ops/tools/backfillPredictPrompts.py`
- `LearningPredictContract`, `LearnerPredictionPayload`, frontend `PredictConfig`, prediction diff payload 제거
- `record-prediction-result`, `buildPredictPromptProposalPayload`, predict-output exercise tool 제거
- teacher prompt의 `PREDICT THEN VERIFY` 지시 제거
- `MisconceptionTrigger`의 `predictionMismatch`를 삭제하고 code/error/checkFailure trigger만 유지
- `recommendNextAction.reconcilePrediction`을 `explainUnexpectedResult` 또는 `advance`로 교체
- `docs/skills/identity/learning-three-pillars.md`, `src/codaro/curriculum/learningSpec.py`, `sectionContract.py`, `learnerState.py`, `masterySignal.py`, `curricula/_misconceptions/`의 prediction 계약과 예제를 제거

시계열 예측, model `predict()`처럼 Python 도메인 자체의 prediction 용어는 제거 대상이 아니다. 학습자에게 실행 전 답을 강제 입력시키는 계약만 제거한다.

## 제거 2: classroom 체계

과제방은 제품 결정상 보류됐으므로 active code에서 제거했다. 현재 `CODARO_HOME` audit 결과 assignment·event는 0건이며, 기존 저장소가 있는 설치를 위해 versioned JSON archive export와 안전한 purge를 구현했다.

- 삭제 `src/codaro/classroom/`
- 삭제 `src/codaro/api/classroomRouter.py`
- 삭제 `tests/classroom/`
- 삭제 `editor/src/components/classroom/`
- 삭제 `editor/src/hooks/useAssignmentRoomState.ts`
- 삭제 `editor/src/lib/classroomEvents.ts`, `classroomOperations.ts`, `classroomSession.ts`
- `ServerState.assignmentStore`, `createClassroomRouter` 등록, request/frontend types와 API client 제거
- `curriculumCheck`와 `curriculumCompletion`에서 assignment event side effect 제거
- `CurriculumView`에서 `AssignmentRoomPanel` 제거
- 신규 `src/codaro/migrations/classroomArchive.py`가 `assignments/*.json`과 `events/*.jsonl`을 각각 줄 단위로 읽어 `contracts/classroomArchive.schema.json`에 맞는 ZIP을 쓴다. export마다 UUIDv4 `archiveId`와 32-byte random pseudonym key를 만들고 key는 memory에서 HMAC 계산 뒤 폐기하며 archive에 쓰지 않는다. entry name/order·JSON serialization·ZIP timestamp는 manifest `createdAt` 기준으로 고정한다. manifest는 assignment/event count, invalid row count, source relative path·SHA-256, redaction count와 source aggregate hash를 가진다. 완성된 ZIP의 SHA-256은 자기참조를 피하려고 `<archive>.sha256` sidecar와 `CODARO_HOME/migrations/classroom.jsonl` ledger에만 기록한다. access token, provider credential, absolute user path, email, `joinCode`는 제거하고 `studentTag`, `displayName`, participant ID는 archive-scoped HMAC pseudonym으로 바꾼다. code·comment payload는 secret scanner와 path/email redaction 뒤에만 포함하며 v1은 raw attachment export를 지원하지 않는다.
- `src/codaro/cli.py`에 `codaro classroom audit`, `codaro classroom export --output <zip>`, `codaro classroom verify <zip>`, `codaro classroom purge --archive <zip> --confirm-hash <sha256> --reason user|expired`를 추가한다. CLI는 resolved storage root가 `CODARO_HOME/classroom` 아래이고 현재 OS user가 소유한 파일만 읽으며 symlink·reparse escape를 거부한다. export·purge는 loopback HTTP endpoint로 노출하지 않는다. 한 호환 release 동안 모든 classroom HTTP write/read endpoint는 `410 Gone`과 이 local-owner CLI 명령만 안내하고 tutor/participant token으로 archive를 내려주지 않는다.
- purge는 `verify`가 schema·source count·detached archive hash를 다시 통과하고 사용자가 exact archive hash를 입력한 경우 또는 `createdAt+90일` expiry인 경우만 실행한다. 시작부터 완료까지 current-user-only `CODARO_HOME/migrations/classroom.lock` handle을 Windows `LockFileEx` 또는 POSIX `flock(LOCK_EX|LOCK_NB)`로 잡고 두 번째 process는 실패시킨다. lock은 OS handle 수명이라 crash 때 자동 해제되며 단순 lock-file 존재 여부로 판정하지 않는다. classroom root 밖의 `CODARO_HOME/migrations/classroom.jsonl` row는 `transactionId`, `state=prepared|completed`, archive/source aggregate hash, redacted/invalid/source count, reason, requestedAt, completedAt를 가진다. 먼저 active root의 exact manifest와 `prepared` row를 append/fsync하고, same-volume `classroom` root를 `.classroom-purge-<transactionId>`로 atomic rename한 뒤 parent를 fsync한다. 삭제는 quarantine manifest의 exact relative files만 수행하며 모두 사라지고 parent fsync가 끝난 뒤에만 `completed` row를 append한다. crash 시 prepared+active root이면 hash 재검증 뒤 rename부터, prepared+quarantine이면 남은 파일 삭제부터 idempotent resume한다. partial delete를 completed로 기록하거나 이후 새로 생긴 classroom root를 함께 지우지 않는다. 사용자 데이터 ledger에는 실행 당시 git HEAD만 기록한다. 다음 release에서 router와 저장소를 제거한다.
- `CLAUDE.md`, `docs/skills/architecture/assignment-room.md`, `frontend-product-surface.md`, `ssot-map.md`, `docs/skills/ops/foundation/testing-and-gates.md`에서 active classroom SSOT와 gate를 제거한다.

다시 필요해지면 git history에서 별도 이니셔티브로 재검토한다. 현재 제품에는 dormant code와 hidden endpoint를 남기지 않는다.

## 제거 3: dead source와 asset

- `landing/scripts/prerenderReact.js.homeBody`와 그 내부 outdated download/prediction copy 삭제
- 사용되지 않는 `landing/src/App.jsx.navItems` 삭제
- 새 product media 전환 뒤 `HeroFrame`과 관련 fake editor CSS 삭제
- 21개 `illustration.py`는 manifest에 실제 등록된 output이 없으면 삭제한다. 등록할 가치가 있는 시각은 `06-visual-assets` source로 승격한다.
- prediction/classroom을 가리키는 generated docs는 source 수정 뒤 전부 재생성한다.

## 생성물 정리

`landing` clean checkout에서 `npm ci && npm run build`가 npm lifecycle의 prebuild·build·postbuild로 모든 generated module과 prerender를 한 번씩 만드는지 검증한다. 성공하면 다음을 git 추적에서 제외하고 generated allowlist를 `.gitignore`에 추가한다.

- `landing/src/lib/generated/docsPages/`
- `landing/src/lib/generated/docsNav.js`
- `landing/src/lib/generated/posts.js`
- `landing/src/lib/generated/searchIndex.js`
- `landing/src/lib/generated/curriculum.js`
- `landing/src/lib/generated/visualAssetManifest.js`
- `editor/src/lib/generated/visualAssetManifest.ts`

빌드 전에 import graph가 필요하거나 source package에 반드시 포함돼야 하는 generated metadata는 예외 목록과 이유를 `landing/scripts/generatedManifest.json`에 기록한다. 이유 없는 생성물은 커밋하지 않는다.

## 모듈 분해

- `landing/src/App.jsx`: router, public shell, docs, blog, search, tools route module로 분리
- `editor/src/types.ts`: curriculum, automation, provider, document, runtime type module로 분리
- `editor/src/lib/api.ts`: curriculum, automation, provider, system client로 분리
- `curriculumSurface.tsx`: lesson frame, section renderer, lab, result, TOC로 분리
- `curriculumMarkdownBody.tsx`: prose, data display, media, code learning renderer로 분리

조정 파일은 상태와 callback wiring만 소유한다. 단순 line count를 목표로 쪼개지 않고 변경 이유와 테스트 경계가 같은 코드를 한 모듈로 묶는다.

## 패키지 전환

| 영역 | 현재 | 전환 |
| --- | --- | --- |
| Astryx | landing만 `^0.1.4` | landing/editor 모두 정확히 `0.1.6` |
| StyleX | landing `0.18.3` | Astryx `0.1.6` peer 범위 안의 정확한 `0.19.0`으로 양쪽 고정 |
| React·React DOM | workspace별 `^19.2.1`·`^19.2.6` | 양쪽 정확히 `19.2.7` |
| TypeScript | editor `^5.9.3`, landing `^6.0.3` | 검증 범위를 줄이기 위해 양쪽 정확히 `6.0.3`; 7.x는 별도 upgrade |
| lucide-react | editor `^0.577.0`, landing `^1.16.0` | 양쪽 정확히 `1.25.0` |
| yaml | editor `^2.9.0`, landing `^2.8.3` | 양쪽 정확히 `2.9.0` |
| Tailwind/shadcn | editor domain component에 광범위 | Astryx primitive 전환 뒤 domain utility만 allowlist |

버전 변경, design primitive migration, dead dependency 제거를 별도 commit으로 나눠 회귀 원인을 구분한다. 두 앱은 독립 `package-lock.json`을 유지하고 각각 clean checkout에서 `npm ci`와 build를 수행한다. 단일 lockfile로 합치지 않으며 compatibility manifest가 target version과 두 lockfile resolution의 일치를 검사한다.

## gate 진실성

- `curriculum-top-tier-audit`는 `scoreKind: audit-requirement-coverage`, `curriculumQualityScore: null`, `completionEligible: false`를 남긴다. strong CheckSpec 1,413개와 1,400개 solution variant 실행 성공을 독립 학습 승인이나 실제 사용자 evidence로 부르지 않는다.
- 대표 경로 strong mission coverage, capstone evidence, retrieval task, approved misconception coverage를 필수 항목으로 바꾼다.
- 정보성 flag를 출력하고도 `passed=true`인 현재 weakness audit를 release blocking gate와 author report로 분리한다.
- report에 `gitHead`가 현재 HEAD와 다르면 UI와 완료 근거에서 stale로 표시한다.

## 영향 파일

- 위 삭제 목록 전체
- `src/codaro/server.py`
- `src/codaro/system/serverState.py`
- `src/codaro/api/__init__.py`
- `src/codaro/api/requestModels.py`
- `src/codaro/curriculum/checkFlow.py`
- `src/codaro/curriculum/misconceptionCatalog.py`
- `src/codaro/ai/conversation.py`
- `src/codaro/ai/toolDefinitions/diagnostics.py`
- `src/codaro/ai/toolHandlers/diagnostics.py`
- 신규 `src/codaro/migrations/classroomArchive.py`
- 신규 `contracts/classroomArchive.schema.json`, `contracts/classroomMigrationLedger.schema.json`
- `src/codaro/cli.py`
- `editor/src/types.ts`, `editor/src/lib/api.ts`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumSurface.tsx`
- 삭제 완료 `editor/src/components/curriculum/checkResultPanel.tsx`; 재도입은 `learning-method`와 section contract에서 차단
- `landing/src/App.jsx`, `landing/scripts/prerenderReact.js`
- `landing/src/lib/generated/`
- `tests/curriculum/auditCurriculumWeakness.py`
- `tests/curriculum/verifyCurriculumTopTierAudit.py`
- `tests/run.py`
- `CLAUDE.md`
- `docs/skills/architecture/assignment-room.md`
- `docs/skills/architecture/frontend-product-surface.md`
- `docs/skills/architecture/ssot-map.md`
- `docs/skills/ops/foundation/testing-and-gates.md`

## 영향 함수·심볼

- 제거 `comparePrediction`, `PredictionDiff`, `LearningPredictContract`
- 제거 `createClassroomRouter`, `AssignmentStore`, `AssignmentRoomPanel`
- 제거 `recordAssignmentCheckEvent`, `recordAssignmentMissionEvent`
- 신규 `auditClassroomArchive`, `exportClassroomArchive`, `verifyClassroomArchive`, `purgeClassroomArchive`, `_handleClassroomMigration`
- 제거 `homeBody`, `navItems`, `HeroFrame`
- 감사 `data-learning-overview-start`, `data-curriculum-home-journey-next`: reveal-only action은 제거하고 real navigation marker는 목적에 맞게 이름 변경
- 제거 self-rating 기반 mastery mutation과 필요 hint의 manual reveal action
- 수정 `LearningOverviewHeader`, `CurriculumHome`, `CurriculumSectionCard`; 미사용 `CheckResultPanel` 삭제
- 수정 `recommendNextAction`, `matchOutcomes`, `runExerciseCheck`
- 분리 `App`, `resolveRoute`, `CurriculumView`, `CurriculumMarkdownBody`, `codaroApi`

## 테스트

- 신규 `tests/learning/verifyRemovedLearningConcepts.py`: learner prediction schema/tool/gate/YAML 0건
- 선행 산출물 소비 후 회귀 확장 `tests/learning/verifyLearningFlowFriction.py` (생성 owner는 `02-learning-method`): label 일괄 금지가 아니라 run 이후 중복 click과 reveal-only handler 차단
- 선행 산출물 소비 후 회귀 확장 `tests/learning/verifyLearningControlIntent.py` (생성 owner는 `02-learning-method`): 모든 남은 control이 실제 command, navigation, choice를 수행함
- 신규 `tests/architecture/verifyClassroomRemoved.py`: classroom import, router, frontend bundle 0건
- 신규 `tests/migrations/testClassroomArchive.py`: JSON·JSONL count/hash, malformed row, pseudonym/redaction, symlink escape, 410 안내, exact-hash purge와 90일 expiry, concurrent purge lock rejection, rename/prepared/partial-delete/completed 각 crash point의 resume
- 신규 `tests/surface/verifyLandingDeadSourceRemoved.py`: `homeBody`, unused nav, fake frame 0건
- 신규 `tests/assets/verifyUnusedIllustrationsRemoved.py`: unreferenced executable visual source 0건
- 신규 `tests/surface/verifyGeneratedSourcePolicy.py`: clean build regeneration과 manifest 예외
- 수정 `tests/architecture/testTransportBoundary.py`: 제거된 prediction/classroom 경계 삭제
- 수정 `tests/product/verifyProductQualityAudit.py`: strong gate와 current gitHead 요구
- 실행: `uv run python -X utf8 tests/run.py gate architecture-boundary`
- 실행: `uv run python -X utf8 tests/run.py gate learning-content`
- 실행: `uv run python -X utf8 tests/run.py gate landing-build`

## 롤백

- prediction, classroom, generated source, module split을 각각 독립 커밋으로 삭제한다.
- 삭제한 보류 기능은 별도 backup 폴더에 복사하지 않는다. 필요한 경우 마지막 존재 커밋에서 복구한다.
- generated untrack은 clean checkout build와 Pages artifact 비교가 동일한 경우에만 진행한다.
- gate 재작성은 기존 report schema version을 올리고 이전 report reader에 명시적인 stale/legacy 처리를 둔다.

## 평가

### 개발자 관점

- 예측과 classroom은 core learning 호출에 side effect를 넣고 있어 CSS 부채보다 우선 제거 대상이다.
- 대규모 삭제를 migration과 동시에 하면 원인 추적이 어려우므로 새 evidence가 green인 뒤 참조가 0이 된 순서대로 삭제한다.

### PM 관점

- 사용자가 보지 않는 기능도 제품 속도와 품질 판단을 방해한다. 보류 기능을 계속 유지하는 비용을 지불하지 않는다.
- 10/10 audit보다 실제 strong check, retrieval, 결과물 전이가 더 중요한 품질 증거다.
