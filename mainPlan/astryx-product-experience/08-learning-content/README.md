# 08 Learning Content

상태: 진행

## 목표

읽히지 않는 큰 카드 묶음을 학습 문서와 실행 Lab의 명확한 리듬으로 바꾸고, 472개 레슨을 `LessonRef`, outcome, 강검사, 전이 과제, 결과물 증거로 다시 검수한다. 대표 6경로를 먼저 출시 품질로 완성하되 자동 생성이나 일괄 치환으로 콘텐츠 품질을 가장하지 않는다.

## 현재 콘텐츠 감사

| 항목 | 현재 | 완료 기준 |
| --- | --- | --- |
| lesson identity | identity·registry·graph 472개가 일치하고 canonical key 중복과 category-scoped alias 충돌은 0이다. `meta.id != stem` 441행과 전역 중복 alias 5개를 exact migration ledger로 생성했지만 review는 pending이다 | `category/contentId` 472개가 유일하며 graph·URL·진도·archive와 일치하고 migration ledger가 승인됨 |
| explicit metadata | 대표 6경로가 선택하는 고유 49레슨의 outcome/prerequisite/time 49/49 | 이후 전체 472레슨 이관 |
| weak evidence | weak-only 0, weak check 4,313개는 formative feedback으로 잔존 | 필수 mission과 capstone의 단독 사용 0개 |
| deterministic practice | 1레슨, `outputExact` 9개 | 연습 feedback으로만 사용하고 completion·mastery와 분리 |
| strong CheckSpec | 467레슨, 총 1,413개 | 대표 경로 필수 mission 100% strong check와 실제 실행 evidence |
| mastery/transfer/retrieval assessment | 각각 467레슨, solution variant 1,400개 실행 실패 0 | 대표 경로의 세 단계 author review 100% |
| assessment claim/review | performance claim·명시적 scope 467레슨, independent assessment 승인 0/467 | 독립 reviewer evidence 승인 |
| learner `predict:` | active schema·tool·frontend·YAML 0개 | negative removal gate로 0개 유지 |
| media | YAML image block 5개·사용 파일 4개와 video block 1개가 있다. 별도로 공용 manifest의 8개 `generatedRaster` instructional asset을 `learningVisualAssets.ts`가 domain/category에 연결하고 학습 홈과 lesson overview에서 질문·판단 기준과 함께 자동 렌더한다 | 현재 surface integration과 별개로 대표 경로의 lesson anchor, 판단 정확성, 접근성을 사람이 검수하고 outcome proof를 승인 |
| misconception | 34개 전부 draft | 대표 경로의 실제 code/error/check failure pattern만 approved |

2026-07-22 `curriculum-top-tier-audit`는 현재 `scoreKind: audit-requirement-coverage`, `score: 9.69/10`, `curriculumQualityScore: null`, `topTierEligible: false`, `completionEligible: false`다. strong CheckSpec은 1,413개/467레슨, weak-only는 0, mastery·unseen transfer·delayed retrieval과 performance claim·명시적 scope는 각각 467/472이다. 유일한 실패 domain은 `assessment-claim-and-independent-review`이며 independent assessment 승인은 0/467이다. 이 감사 점수는 요구사항 항목 커버리지일 뿐 제품 품질 점수나 실제 학습 효과가 아니며 완료 근거로 사용할 수 없다.

`buildLearningLedgers.py --check`는 현재 identity 472행, registry 472행, content owner·outcome·source hash, 31개 path의 canonical reference를 source에서 다시 계산한다. taxonomy transition draft는 baseline `b5e9...def2`에서 target `03d4...f6a5`, graph 469에서 472, 신규 outcome·lesson 각 6개, 변경 path 7개를 exact diff로 고정했다. 변경 경로에는 대표 6경로의 명시적 project capstone과 `standardLibraryMastery`가 포함된다. `learning-content` gate는 identity, canonical content, path membership, featured metadata, scored check strength, retrieval/transfer 분리, featured path, featured capstone, 1,400개 solution 실행, assessment authoring의 열 report를 현재 `gitHead`로 다시 만든다. machine audit 통과와 사람 승인 완료를 분리하며 identity review 0/472, content review 0/472, taxonomy transition approval 0/7, independent assessment review 0/467이므로 마지막 completion verifier가 네 blocker를 기록하고 실패한다.

`featured-capstone-contracts` machine report는 대표 6경로를 6/6으로 검산했다. Python Foundation은 JSON file 2개, Data Reporting은 CSV table 2개, Data Visualization은 CSV table 2개와 실제 데이터 기반 PNG image 2개, File Automation·Office Automation·Web Monitoring은 각각 JSON table 3개를 만든다. 이 판정의 `learnerEvidenceClaim`은 `none`이고 Local 졸업 독립 증거가 필요한 세 경로는 모두 pending이다. machine artifact 생성은 path ledger 사람 review, 실제 learner evidence, 독립 assessment 승인을 대신하지 않는다.

Web behavior check는 Worker의 임시 fixture가 사라지기 전에 file·directory·table·image descriptor를 만들고 path, origin, kind, byteLength, SHA-256 contentHash와 유형별 의미 필드를 IndexedDB evidence event에 봉인한다. 최신 공식 63-case Chromium matrix는 Day 19의 created file descriptor와 archive transfer, Seaborn capstone의 CSV table 2개·PNG image 2개를 확인했다. Local strong check는 output과 variable expected 값을 학생 실행 frame에 넣지 않으며 같은 descriptor 합집합 계약을 쓴다. Local browser 회귀 state는 매 실행마다 별도 임시 저장소에 격리한다.

public catalog와 route generator는 472개 canonical `LessonRef`를 모두 공개 lesson route로 만들며 browser 310개, Local 162개 runtime capability를 표시한다. canonical `MasteryPolicy@1`은 `CreditGranted` event만 단계 상승에 사용하고 Python·TypeScript에서 같은 policy와 golden vector를 소비한다. canonical lesson binding의 `outcomeIds`/glob 처리와 retrieval fixture policy는 최신 공식 `product-experience-browser` 63/63에 포함돼 green이다. full learning archive v2는 document와 drafts, virtual FS/package bytes, evidence와 lineage를 Web과 Local 사이에서 materialize한다. 이 세 구현은 catalog 접근성, projection과 continuation 기반이며 472개 content review나 독립 assessment 승인을 대신하지 않는다.

도메인별 blocking 규모는 다음과 같다. 다음 content wave는 샘플 30개가 아니라 이 분포를 기준으로 owner packet, review fixture, authoring blueprint를 나눈다.

| 도메인 | 레슨 | weak-only | strong 보유 | mastery | transfer | retrieval |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| automation | 129 | 0 | 127 | 127 | 127 | 127 |
| basics | 100 | 0 | 100 | 100 | 100 | 100 |
| imageVision | 62 | 0 | 62 | 62 | 62 | 62 |
| dataAnalysis | 57 | 0 | 57 | 57 | 57 | 57 |
| mathStatsMl | 55 | 0 | 55 | 55 | 55 | 55 |
| visualization | 55 | 0 | 55 | 55 | 55 | 55 |
| aiIntegration | 11 | 0 | 11 | 11 | 11 | 11 |
| devLiteracy | 3 | 0 | 0 | 0 | 0 | 0 |

세부 track 기준선은 `basics/30days` 30/30, `basics/builtins` 35/35, `basics/advancedPython` 35/35, automation 127/129, imageVision 62/62, dataAnalysis 57/57, visualization 55/55, mathStatsMl 55/55, aiIntegration 11/11 strong assessment 저작과 solution 검산이다. automation의 2개와 devLiteracy 3개는 orientation/legacy-only 분류이며 weak-only가 아니다. 이 source coverage는 전체 browser evidence나 독립 승인 완료가 아니다.

## 학습자와 언어 계약

- 대상은 Python을 처음 배우거나 반복 업무를 자동화하려는 한국어 사용 성인이다. 전문 용어는 한국어 설명 뒤 실제 API·코드 식별자를 병기한다.
- 한 section은 하나의 outcome과 하나의 판단만 다룬다. 설명 문단은 70자 안팎의 읽기 폭을 사용하고 긴 용어, 코드, 표가 320px에서 잘려서는 안 된다.
- 예제 데이터와 결과물은 실제 업무 맥락을 가지며 개인정보, 특정 기업 자료, 권리 불명 자산을 쓰지 않는다.
- 시각·색각·운동·인지 접근성을 고려해 visual에는 alt 또는 인접 설명을 두고 색만으로 상태를 구분하지 않는다.
- starter code가 정답을 노출하지 않고, worked example과 retrieval/transfer task는 데이터 또는 제약이 달라야 한다.

## 레슨 구조

1. `overview`: 만들 결과물, target outcome, 예상 시간, runtime tier를 route 진입 즉시 표시한다.
2. `observe`: 핵심 단계와 이유가 연결된 worked example을 읽는다.
3. `modify/complete`: 한 요소 수정 또는 제한된 빈칸 완성으로 첫 실행을 만든다.
4. `build`: 같은 outcome을 독립 구현한다.
5. `feedback`: 실행 직후 오류 원인, 관련 개념, 다음 행동과 필요한 hint를 결과 아래 자동 갱신한다.
6. `strong check`: output, variable, file, table, image, behavior 가운데 outcome에 맞는 증거를 판정한다.
7. `transfer`: 새로운 입력, 파일, 제약, scale에 적용한다.
8. `completion`: 통과 evidence와 다음 outcome을 inline으로 연결한다.

예측 입력, 기억 자기평가, 별도 확인·제출 버튼은 두지 않는다. 다른 레슨으로 이동, 실행·중지, 다시 시도, 결과물 열기처럼 학습자의 명시적 의도가 필요한 control은 유지한다.

## 카드와 레이아웃 계약

- overview와 section 전체를 rounded card로 감싸지 않는다. overview는 unframed header band, 본문은 최대 읽기 폭의 문서 흐름이다.
- example code는 읽기 전용 block, practice는 편집 가능한 Lab으로 시각과 동작을 구분한다.
- note, tip, warning은 좌측 rail과 icon을 쓰고 box nesting을 금지한다. 비교, 표, anatomy만 정보 구조가 필요할 때 framed tool을 쓴다.
- result는 실행 전부터 공간을 예약하고 running, run success, check pass, check fail을 구분한다.
- desktop은 본문·Lab·TOC의 안정된 grid, tablet은 TOC 축소, mobile은 본문 뒤 full-width Lab과 sticky section selector를 사용한다.

## 강검사와 증거

- `CheckSpec`은 문자열 map이 아니라 type별 payload와 schema version을 가진다.
- `noError`와 `contains`는 보조 신호다. 필수 mission, retrieval, transfer, capstone의 completion을 단독으로 만들 수 없다.
- browser와 local은 같은 `CheckSpec`을 각 tier executor로 실행한다. 브라우저가 지원하지 못하면 false pass로 낮추지 않고 `localRequired`로 명시한다.
- Python output·variable 검사는 학생 코드와 expected code가 같은 mutable namespace를 공유하지 않게 격리한다.
- 현재 output, variable, behavior 실행기는 격리돼 있다. table은 CSV·JSON의 선언 columns와 실제 columns, rowCount를 검증하고 image는 PNG·JPEG·GIF header의 media type과 width·height를 검증한다. 대표 6경로는 taxonomy의 명시적 `capstoneLessonRef`로 실제 project lesson을 마지막에 배치하며 route-backed Web URL, mastery strong check, created artifact descriptor를 `evidence/featured-capstones.yml`과 전용 gate로 대조한다. 이는 실제 learner evidence를 주장하지 않으며 Local 자동화 3경로의 독립 증거는 pending이다.
- `ObservedRun -> CheckEngine -> EvidenceTransaction` 한 경로만 mastery를 갱신한다. 중복 run은 `00-product-contract`의 canonical `attemptFingerprint` 하나로 deduplicate한다.
- path capstone은 최소 두 종류의 evidence와 사용자가 열어 볼 수 있는 결과물을 만든다.

실제 lesson YAML의 `assessment`가 performance claim, fixture, positive·negative predicate, misconception case, support policy, mastery·near/far transfer·delayed retrieval variant, tier parity와 reviewer approval을 소유한다. 내용 없는 ID 생성이나 같은 과제 복제는 금지한다. track authoring tool을 쓸 때도 저자가 각 prompt·starter·solution·복수 case를 명시하고 모든 solution을 실행 검산하며, materialized YAML과 blueprint drift를 검사해야 한다. content ledger의 variant ID만으로는 authored assessment나 학습 evidence가 되지 않는다.

## 증분 출시선

W1~W5는 이제 source 생성 순서가 아니라 사람 승인과 공개 승격 순서다. R10 전에 467레슨 assessment와 472개 public route가 이미 구현됐지만 identity review 0/472, content review 0/472, taxonomy approval 0/7, independent assessment approval 0/467이므로 어떤 후속 wave도 출시된 상태가 아니다. 기존 source는 provisional로 유지하고, wave 종료는 author review·실행 증거·사람 검수와 completion transition으로만 판정한다.

| Wave | 범위 | 종료 조건 |
| --- | --- | --- |
| W0 | `fileOps/01_pathlib경로감각`, `fileOps/06_zip압축`, `watchSched/05_schedule간단스케줄` | Web run·자동 check·feedback·reload·archive와 Local dry-run·audit round trip |

최신 공식 `product-experience-browser` 63/63은 세 자동화 레슨 12개 base behavior와 9개 assessment variant, Day 1 mastery·전이·24시간 검색, Day 2·11·15·19·20·22·27·30의 다중 입력 mastery와 전이 자동 해제, canonical lesson binding, retrieval fixture, Day 19 archive artifact transfer를 실제 Chromium에서 통과했다. retrieval은 due 전 0개, source evidence가 24시간을 넘긴 뒤 1개, retrieval strong pass 뒤 다시 0개가 됐고 Day 19 transfer가 만든 `result.txt`의 Web artifact descriptor도 archive event에서 확인했다. Day 2~30의 87개 variant solution은 복수 입력과 fixture/예외/생성 파일 경로를 실행 검산했다. 18-case Local W0 선택군은 Web Day 1, Local Day 1, pathlib·zip·schedule 12개 base와 3개 assessment behavior의 오답·정답을 별도 native Python sandbox에서 판정하고 `local` strong event 16건을 SQLite에 저장하며 Web strong·legacy migration event를 합친 `mixed` set으로 왕복했다. Local fileOps/zip behavior event는 sandbox 산출물 descriptor를, schedule event는 pinned package asset descriptor를 payload hash에 봉인한다. document, drafts, 전체 virtual FS/package bytes와 automation draft까지 포함하는 full archive v2도 구현됐다. 다만 실제 설치본 Web-to-Local round trip, 경합 없는 cold package 준비와 Windows AppContainer, independent assessment review 0/467이 남아 있으므로 W0 종료 조건은 미충족이다.
| W1 | `pythonFoundation` | 실제 선택 레슨 Web 완주, required mission weak-only 0, 확인·reveal 마찰 0 |
| W2 | `dataReporting` | report capstone, unseen transfer, formative usability |
| W3 | `fileAutomation` | Web 가능한 outcome과 Local graduation을 같은 evidence archive로 연결 |
| W4 | 나머지 대표 3경로 | 경로별 사람 승인과 독립 공개 |
| W5 | remaining domain과 472 전체 | 전수 author review, strong 또는 보조 레슨 판정, domain별 렌더 fixture |

`packet _done`과 `path released`를 분리한다. 실패한 path만 beta 또는 비공개로 남기고 검증된 path를 막지 않는다. 대표 경로 결과를 나머지 domain의 사용성 증거로 복사하지 않는다.

## 작업 패킷

| 순서 | 패킷 | 범위 | 종료 조건 |
| --- | --- | --- | --- |
| 00 | [identity-integrity](00-identity-integrity/) | 472개 `LessonRef`와 canonical content owner·requirement | identity 누락 0, content 미소유 0, path 충돌 0 |
| 01 | [python-foundation](01-python-foundation/) | `pythonFoundation` | prerequisite closure와 ledger 전부 승인 |
| 02 | [data-reporting](02-data-reporting/) | `dataReporting` | Web 완주와 report capstone 강검사 |
| 03 | [data-visualization](03-data-visualization/) | `dataVisualization` | chart object·saved image 전이 검증 |
| 04 | [file-automation](04-file-automation/) | `fileAutomation` | Web 기초와 Local file capstone 연결 |
| 05 | [office-automation](05-office-automation/) | `officeAutomation` | workbook artifact와 Local handoff 검증 |
| 06 | [web-monitoring](06-web-monitoring/) | `webMonitoring` | browser evidence와 Local automation 검증 |
| 07 | [remaining-domains](07-remaining-domains/) | 나머지 domain | 472개 전체 ledger 승인 |

`00-identity-integrity/content-ledger/*.yml`이 472개 canonical lesson의 유일한 콘텐츠 요구사항 원장이다. 각 행은 `lessonRef`, disposition, 단일 `ownerPacket`, `eligiblePathIds`, 비어 있지 않은 outcomes, prerequisite, `reinforcesOutcomeIds`, `lessonContentHash`, canonical runtime tier, 계획 check/variant ID, 이후 실제 `assessmentHash`·approval evidence, artifact·visual decision, reviewer role, evidence commit 조건을 가진다. path `lesson-ledger.yml`은 실제 선택된 순서와 membership, canonical row reference만 소유하며 outcome·prerequisite·runtime·check·artifact·visual을 복제하지 않는다.

`eligiblePathIds`는 해당 lesson이 직접 목표 콘텐츠 후보가 되는 domain 목록이며 실제 path membership이 아니다. prerequisite closure로 다른 path에 선택될 수 있고, 후보여도 현재 composer에서 선택되지 않을 수 있다. 실제 선택 관계는 path ledger의 reverse index로만 계산한다. source owner와 canonical requirement는 하나뿐이고 path별 난이도 차이는 canonical lesson을 바꾸지 않고 별도 `taskVariantId`로 표현한다. 내용 없는 YAML ID 생성, 대량 문구 치환, 검산 없는 “나머지 batch migration”은 금지한다.

`outcomes`는 이 레슨의 strong check가 증명할 mastery target이고 `prerequisites`는 진입 전에 필요한 outcome이다. 두 집합의 교집합은 반드시 `reinforcesOutcomeIds`와 정확히 같아야 하며, 이는 새 개념 도입이 아니라 이미 배운 outcome을 더 독립적인 조건에서 강화한다는 뜻이다. scheduler는 prerequisite 충족 여부와 reinforcement credit을 별도로 보고하고 같은 evidence를 신규 습득과 복습으로 중복 계산하지 않는다.

현재 runtime graph는 `builtins.tempFiles`, `builtins.hashing`, `builtins.archives`와 세 레슨을 편입해 filesystem과 같은 472 key가 됐다. checked-in path ledger는 아직 2026-07-18 baseline graph 469와 `baselineTaxonomyHash`에서 계산한 membership 원장이므로 구현 완료를 원장 승인으로 오해하지 않는다. `evidence/taxonomy-transition.yml`은 `fromHash`, `toHash`, exact added outcome·lesson IDs, composer/source hash, add/drop/order diff와 reviewer 승인을 기록해야 한다. 그 승인 commit에서 31개 path header의 `taxonomySnapshotHash`와 summary `targetTaxonomyHash`를 새 hash로 함께 갱신한 뒤 membership을 재산출한다. 이전 hash를 동일하다고 가장하거나 승인 없이 baseline을 덮어쓰면 gate가 실패한다. canonical ledger의 `planned`는 해야 할 일이 명시된 상태이지 완료 증거가 아니며, author review·transition evidence commit이 채워져야 packet gate를 통과한다.

`buildLearningLedgers.py --write`는 `planComposer` output과 source metadata를 mainPlan ledger에만 기록하고 `curricula/`를 쓰지 않는다. path ledger header와 canonical summary에 `composerVersionHash`, `taxonomySnapshotHash` 또는 baseline/target taxonomy hash, `sourceSetHash`, schema version을 남긴다. `--check`는 재계산 결과와 byte-level diff, 승인된 taxonomy transition, canonical 472 ownership, outcome 공백 0, `reinforcesOutcomeIds=outcomes∩prerequisites`, path reverse membership, path 금지 field 0, source hash를 검사하며 불일치 시 non-zero다. 콘텐츠 문장, check answer, visual은 이 도구가 생성하지 않는다.

`docs/skills/ops/tools/buildLearningLedgers.py --write`와 `--check`는 현재 source에서 byte-identical ledger를 재생성·검사한다. 그러나 이 재현성은 ownership·범위와 source hash의 기계 증거일 뿐 reviewer 승인이나 completion evidence가 아니다. negative fixture, taxonomy transition 승인, packet별 content review가 함께 통과하기 전에는 W0 lesson edit, path `_done`, R10 closure evidence로 사용할 수 없다.

패킷 구현, 콘텐츠 검수, 테스트와 증거 commit이 끝나면 해당 폴더를 이 workstream의 `_done/`으로 이동한다. 8개 패킷이 모두 이동되기 전에는 `08-learning-content`를 initiative `_done/`으로 옮기지 않는다.

## 영향 파일

- `curricula/python/_taxonomy.yml`, graph source, `curricula/python/**/*.yaml`
- `src/codaro/curriculum/planComposer.py`, `cardContract.py`, `converter.py`, `checker.py`, `exerciseCheck.py`, `checkFlow.py`, `sectionContract.py`, `misconceptionCatalog.py`
- `editor/src/components/curriculum/curriculumHome.tsx`, `curriculumSurface.tsx`, `curriculumMarkdownBody.tsx`, `curriculumDependencyPanel.tsx`
- 신규 `editor/src/components/curriculum/learningLab.tsx`, `learningFeedback.tsx`
- `editor/src/lib/curriculumCompletion.ts`, `curriculumCheck.ts`
- `docs/skills/architecture/curriculum-card-contract.md`, `learning-yaml-contract.md`
- 각 패킷의 lesson ledger와 review evidence
- `00-identity-integrity/content-ledger/*.yml`
- 신규 `docs/skills/ops/tools/buildLearningLedgers.py`: mainPlan metadata ledger 전용 `--check/--write`, curricula source 수정 금지

## 영향 함수·심볼

- `composeMasterPlan`, `LessonRef`, `CurriculumHome`, `CurriculumView`, `LearningOverviewHeader`, `StructuredSectionLearningBody`
- 신규 `LearningLab`, `LearningFeedback`, `LearningResultState`, `ScaffoldMode`, `ArtifactDescriptor`, `RetrievalTaskVariant`
- `validateCardBlock`, `_convertBlock`, 신규 `recordLearningEvent`; `ProgressTracker.completeMission` writer 제거
- `checkNoError`, `checkContains`, `checkByOutput`, `checkByVariable`, 신규 artifact check dispatch
- `matchCodePattern`, `matchErrorPattern`

## 테스트

- 신규 `tests/curriculum/verifyLessonIdentityIntegrity.py`: 472개 canonical key, graph closure, alias 충돌 0건
- 신규 `tests/curriculum/verifyCanonicalContentLedger.py`: canonical 472행, unique owner, 비어 있지 않은 outcome, reinforcement 교집합 exact, exact work field, current source hash, unowned 0
- 신규 `tests/curriculum/verifyPathMembershipLedgers.py`: path reverse index가 실제 membership의 유일한 원장인지 확인하고 모든 row의 canonical ref, outcome/prerequisite/runtime/check/artifact/visual 복제 0, composer/taxonomy transition/source hash current 검증
- 신규 `tests/curriculum/verifyScoredCheckStrength.py`: 필수 mission의 weak-only check 0건
- 신규 `tests/curriculum/verifyFeaturedLearningPaths.py`: 6경로 prerequisite closure, 명시적 capstone 최종 배치, tier, artifact·visual decision coverage
- 신규 `tests/curriculum/verifyFeaturedCapstoneContracts.py`: route-backed Web URL, mastery strong check, created artifact descriptor와 Local graduation 상태 대조
- 신규 `tests/curriculum/verifyLearningMetadataCoverage.py`: 대표 경로 explicit metadata 100%
- 신규 `tests/curriculum/verifyRetrievalTaskTransfer.py`: 본문·retrieval·transfer의 데이터 또는 제약 차이
- 신규 `tests/curriculum/verifyStrongAssessmentSolutions.py`: authored mastery·transfer·retrieval solution을 fixture와 case로 전수 실행
- 신규 `tests/curriculum/testArtifactChecks.py`: 격리된 variable expected와 behavior file·directory·table·image descriptor, missing·malformed artifact false-pass 방지
- 수정 `tests/learning/verifyLearningSectionCardContract.py`, `verifyLearningCardPlaywright.py`
- 선행 산출물 소비 `tests/learning/verifyLearningFlowFriction.py`, `verifyLearningControlIntent.py` (생성 owner는 `02-learning-method`)
- 수정 `tests/curriculum/verifyCardContract.py`, `verifyCurriculumQualityMatrix.py`
- 실행: 신규 `uv run python -X utf8 tests/run.py gate learning-content` (aggregate gate 생성 owner는 이 workstream)
- 실행: `uv run python -X utf8 tests/run.py gate curriculum-quality-matrix`
- 실행: `uv run python -X utf8 tests/run.py gate curriculum-executability`
- 실행: `uv run python -X utf8 tests/run.py gate app-runtime`

## 롤백

- identity migration은 alias reader를 한 호환 release만 유지하고 새 형식만 쓴다. alias collision이나 진행 손실이 생기면 해당 category migration commit만 되돌린다.
- converter는 기존 block을 읽어 새 display kind로 normalize하되 renderer migration과 레슨 수정을 같은 commit에 섞지 않는다.
- `predict:` 제거와 레슨 개편은 한 레슨 또는 검수 가능한 작은 묶음으로 수행하고 원장 evidence가 없는 변경은 병합하지 않는다.
- 기존 completion은 `legacyCompleted`로 보존하되 새 strong evidence로 승격하지 않는다.
- media 누락에는 학습 판단을 보존하는 text fallback을 두며 decorative placeholder로 대체하지 않는다.

## 평가

### 개발자 관점

- 먼저 identity와 check engine을 고정해야 콘텐츠 수정이 URL·progress·mastery를 다시 흔들지 않는다.
- 472개 모두를 기계적으로 바꾸는 대신 경로별 prerequisite closure와 레슨별 evidence ledger가 변경 단위다.

### PM 관점

- 레슨 수와 카드 수는 품질 지표가 아니다. 사용자가 무엇을 만들고 왜 실패했고 무엇으로 통과했는지를 화면 안에서 이해해야 한다.
- 대표 6경로는 설치 없이 Web에서 끝나는 학습과 OS 기능이 필요한 Local capstone의 경계를 자연스럽게 보여야 한다.
