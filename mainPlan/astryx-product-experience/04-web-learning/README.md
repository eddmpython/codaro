# 04 Web Learning

상태: 진행

## 작업 폴더

- [Learn Explorer](00-learn-explorer/)
- [Canonical Interactive Lesson](01-canonical-interactive-lesson/)

Learn 목록 개선과 실행 레슨 통합은 별도 완료 단위다. 두 작업이 각각 증거를 남기기 전에는 이 workstream을 `_done`으로 이동하지 않는다.

현재 source는 472개 canonical 공개 lesson route를 semantic 문서와 interactive editor shell로 prerender하고 sitemap, 검색 index, JSON-LD와 route별 lazy lesson module에 연결한다. public explorer는 browser 310개, Local 162개를 capability 그대로 표시하며 이어하기, 검색과 여섯 outcome path에서 canonical lesson으로 한 번에 진입한다. 같은 URL에서 `LessonRef`와 section을 복원하고 코드 수정, 실행, output, check, feedback, 필요한 hint, evidence와 다음 학습을 추가 확인 command 없이 갱신한다. 정적 Web은 backend API probe나 code-completion POST 없이 source에 저작된 strong CheckSpec 1,413개/467레슨을 fresh pyproc Worker 경계로 평가한다. mastery·transfer·24시간 retrieval variant는 각각 467레슨에 있으며 대표 Chromium evidence는 Day 1·2·11·15·19·20·22·27·30과 pathlib·zip·schedule W0에 한정해 별도로 보존한다. 정확한 결과는 raw source/output을 저장하지 않고 hash와 check/fixture ID를 IndexedDB v3 append-only event로 저장한다. 기존 `codaro-web-progress-v1`은 metadata backup과 non-credit `MigrationImported` event로 cutover transaction 안에서 보존한다. full learning archive v2는 document, drafts, virtual FS와 file·directory·table·image bytes, package bytes, evidence, lineage, disabled·unscheduled automation draft를 content-addressed blob으로 내보내고 Web과 Local에서 같은 bytes로 materialize한다. Local import는 전체 검증과 evidence merge 뒤 immutable object와 `HEAD`를 원자 교체하고 실패하면 이전 `HEAD`를 복원한다. 공식 `web-learning`, `learning-method`, Light/Dark 대표 Chromium matrix와 route·SEO·hydration은 green이다. independent assessment 승인 0/467, Windows AppContainer, 전수 browser·사람 학습성 검수와 push된 commit의 실제 배포 smoke가 남아 있으므로 상태는 `진행`이고 `_done`이 아니다.

## 목표

설치 없이 Learn에서 목표를 선택하고, canonical lesson에서 코드를 수정하고 실행하면 자동 강한 검증과 진행 저장이 이어지며, 다음 방문에 그대로 학습할 수 있게 한다. 472개 카드 나열을 outcome-first curriculum product로 바꾼다.

## Learn 정보 구조

- 상단: `이어하기`, 진행 중인 경로, 마지막 미완료 미션
- 목표 선택: taxonomy의 대표 6 domain을 outcome image와 함께 제공
- 추천 경로: 예상 시간, web/local compatibility, 완성 결과, prerequisite
- 전체 탐색: 검색, domain, 난이도, runtime, estimated time filter
- lesson card: 제목, 한 줄 outcome, 시간, 진행, runtime만 표시한다. emoji와 tag pile을 primary hierarchy로 쓰지 않는다.
- 개별 lesson URL: `/learn/lesson/<category>/<contentId>/?path=<domainId>`의 SSR 제목, description, breadcrumb, instructional image와 interactive editor

### Learn layout blueprint

- desktop 1280px 이상: 12-column grid에서 3-column goal/filter rail과 9-column catalog를 쓴다. 상단 resume band는 전체 폭이며 마지막 학습, 남은 시간, 바로 이어질 outcome을 한 줄 hierarchy로 보여 준다.
- tablet 768~1279px: resume band 아래 goal path를 horizontal selector로 바꾸고 filter는 persistent toolbar로 둔다. catalog는 2-column이다.
- mobile 320~767px: resume와 현재 경로를 먼저, goal은 가로 scroll 없는 1-column list, lesson은 1-column compact row로 둔다. filter는 Astryx `Layer` side sheet이며 적용 즉시 결과와 개수를 갱신한다.
- empty/loading/error는 catalog 영역 높이를 안정적으로 유지하고, skeleton이 실제 제목·메타 구조와 같은 track을 사용한다.

### Lesson layout blueprint

- desktop: product rail과 읽기 폭 안에 overview, instructional image, worked example, editable exercise, output과 verification을 같은 scroll context로 둔다.
- tablet: 문서 8-column과 접히지 않는 compact TOC 4-column을 사용한다. Lab은 본문 폭을 유지한다.
- mobile: breadcrumb, overview, 본문, Lab, feedback 순서의 단일 column이다. section selector만 sticky이며 virtual keyboard와 safe area 위에서 본문을 가리지 않는다.
- 공개 Lesson은 읽기만 해도 핵심 개념과 worked example이 보이고, 같은 URL에서 코드를 수정·실행하며 section과 draft를 복원한다.

## 대표 공개 경로

`curricula/python/_taxonomy.yml`의 기존 domain graph를 SSOT로 사용한다.

| domain ID | 사용자 목표 | 기본 tier |
| --- | --- | --- |
| `pythonFoundation` | Python 기초 완주 | Web Run |
| `dataReporting` | 데이터 분석 보고서 | Web Run |
| `dataVisualization` | 데이터 시각화 | Web Run |
| `fileAutomation` | 파일·폴더 자동화 | Web 시작, Local 졸업 |
| `officeAutomation` | 엑셀·문서 자동화 | Web 시작, Local 졸업 |
| `webMonitoring` | 웹 자동화·모니터링 | Web 시작, Local 졸업 |

각 경로는 `targetOutcomes`의 prerequisite closure를 기존 plan composer로 계산한다. UI용 별도 커리큘럼 목록을 손으로 복제하지 않는다.

## Canonical interactive lesson

- lesson page는 overview와 첫 worked example을 별도 reveal 없이 보여 주고 같은 pathname에서 `RunRouteState`와 `LessonRef`를 복원해 interactive editor를 연다.
- `/run/`은 첫 paint에 runnable starter cell이 보이는 자유 Notebook이며 canonical curriculum lesson의 우회 URL로 쓰지 않는다.
- browser runtime boot는 첫 실행 action에서 lazy하게 시작하며 boot, package, run, check 상태를 분리해 보여 준다.
- browser Python provider는 기존 `pyproc` 하나만 사용한다. 학습 실행 singleton은 `ObservedRun`을 만들고 strong check는 feasibility를 통과한 fresh pyproc worker 또는 명시적 `localRequired`만 사용한다. 제품 코드에 별도 direct Pyodide boot를 추가하지 않는다.
- 현재 pyproc wrapper는 same-origin SRI manifest로 배포하지만 Python core는 version-pinned CDN을 기본값으로 쓰며 검증된 offline core cache는 아직 없다. 첫 Web 실행은 network가 필요하고 runtime fetch는 자동으로 진행한다. 설치·다운로드 확인 button은 만들지 않으며 offline 학습을 public claim하지 않는다.
- progress는 IndexedDB 기반 Web store에 즉시 저장하고 full learning archive로 export/import한다.
- Local 연결 시 `eventId` 기준으로 merge한다. 단순 최신 timestamp 덮어쓰기를 쓰지 않는다.
- run 결과가 돌아오면 check, feedback, 필요한 hint와 이어지는 학습이 같은 surface에서 자동 갱신된다. 이미 계산한 결과나 준비된 내용을 보기 위한 별도 check, complete, remember, reveal 클릭은 요구하지 않는다.
- 목표 선택, run/stop, route 이동, artifact 열기, 다시 시도, Local 전환처럼 사용자의 의도를 실행하는 control은 명확하게 제공한다.

interaction budget은 lesson 진입 -> overview·첫 section 0회, Run 1회, 결과 -> check·feedback·필요한 hint·progress·다음 section 0회, 수정 뒤 Retry 1회다. 정답 공개, Local 전환, artifact 열기와 route 이동만 명시적 선택으로 남긴다. 이미 보이는 첫 section으로 이동만 하는 `학습 시작` control은 만들지 않는다.

## Browser strong check

- browser execution은 `ObservedRun`을 만들고 `BrowserCheckExecutor`가 `02-learning-method`의 structured `CheckSpec`을 실행한다.
- Local `CheckEngine`과 browser executor는 같은 fixture와 expected `CheckResult[]` conformance suite를 통과한다.
- output/variable/artifact snapshot은 runtime bridge의 structured clone 가능한 값만 받는다. Python object repr 문자열을 semantic evidence로 쓰지 않는다.
- property/behavior check는 fresh browser session과 고정 fixture에서 제출 source를 실행한다. notebook의 mutable global state에 의존하면 실패한다.
- package나 filesystem capability가 없는 check는 `localRequired`로 끝내고 `noError`로 강등하지 않는다.
- check 통과 뒤 `EvidenceTransaction`이 IndexedDB에 append될 때만 progress UI를 갱신한다. 저장 실패 시 화면만 완료 상태로 만들지 않는다.

## Web to Local archive

Web에서 Local로 가져가는 `kind=codaro.learning-archive`, `schemaVersion=2` archive는 document, drafts, virtual FS, package set, append-only evidence events, lineage와 automation draft를 포함한다. archive의 실제 payload는 SHA-256 content-addressed blob이며 manifest descriptor는 blob hash와 byte length를 다시 계산한다.

- Web export는 현재 curriculum document와 drafts, browser evidence와 이미 import한 virtual FS/package/automation payload를 한 archive로 만든다. import한 full archive는 lesson별 IndexedDB에 저장하고 workspace draft 변경을 자동 보존하며 reload에서 document와 drafts를 복원한다.
- Web·Local 모두 archive lesson identity와 UI 적용 가능성을 side effect 전에 검증한다. same-lesson reference fetch는 request revision으로 취소해 import한 draft를 뒤늦게 덮어쓰지 않는다.
- Local API는 같은 archive를 `CODARO_HOME/learningArchives`의 immutable object로 commit하고 마지막에만 `HEAD`를 교체한다. evidence merge가 실패하면 새 object를 current로 만들지 않고 이전 `HEAD`를 복원하며 current archive를 다음 lesson load에서 다시 materialize한다.
- imported automation recipe는 source bytes와 lineage를 보존하되 항상 `enabled=false`, `schedule=null`인 draft다. import 자체가 side effect나 예약 실행을 만들지 않는다.
- legacy `codaro.learning-evidence-archive` event import는 기존 데이터 호환 경로로만 유지하며 새 full archive의 대체물이 아니다.

- import는 `eventId` set union과 payload hash conflict 격리를 사용한다.
- Local 전용 absolute path나 secret은 Web archive에 넣지 않는다.
- archive artifact hash가 evidence descriptor와 다르면 해당 capstone credit을 가져오지 않는다.
- import 실패 시 기존 Local store를 transaction rollback하고 Web archive를 수정하지 않는다.

## 정적 생성과 SEO

- `generateCurriculum.js`가 `LessonRef`, taxonomy domain, lesson metadata, runtime tier, estimated time, outcome, visual asset ID를 생성한다. `meta.id`를 route identity로 쓰지 않는다.
- lesson 본문은 route별 lazy module 또는 JSON으로 분리해 472개 전체를 entry chunk에 넣지 않는다.
- `prerenderReact.js`가 모든 공개 lesson route를 생성하고 `postbuild.js`가 sitemap에 넣는다.
- canonical은 `/learn/lesson/<category>/<contentId>`이며 domain은 `path` navigation context다. Run query URL은 검색 대상이 아니다.

## `/app/` to `/run/` 배포 단계

| 단계 | 배포 | 종료 조건 |
| --- | --- | --- |
| C0 freeze | 현재 deployed `/codaro/app/` asset tree, response content type, C0 commit과 cache manifest를 immutable compatibility archive로 고정 | archive URL·SHA-256, source commit, deployed URL crawl이 일치 |
| C1 dual serve | current editor는 `CODARO_WEB_BASE=codaro/run`, `CODARO_WEB_OUT=../landing/static/run`으로 build하고 C0 archive를 hash 검증 뒤 `landing/static/app`에 복원 | fresh checkout composition, 실제 deployed `/codaro/run/` direct/deep reload·cold online Python smoke와 두 tree manifest hash |
| C2 compatibility | 다음 stable release의 `/codaro/app/index.html`은 query와 hash를 `RunRouteState`로 변환하고 exact legacy registration/cache cleanup client를 실행 | 두 release archive, owned old cache 삭제, controlled handoff, exact registration `unregister()` report |
| C3 retire | C2 뒤 28일 telemetry threshold를 만족할 때 실행 asset을 제거하고 redirect·tombstone 유지 | `/app/` 실행 asset request 0, bookmark migration report 승인 |

현재 source Pages workflow는 `npm ci` 뒤 editor를 `/codaro/run/`과 `/codaro/app/` 두 base로 각각 build하고 Landing을 조립한다. 다만 `/app/` tree는 아직 C0 immutable archive나 C2 redirect가 아니라 current editor의 두 번째 build다. 실제 GitHub Pages에는 이 source가 반영되지 않아 `/run/`과 canonical lesson route가 404다. C0 archive 고정, compatibility handoff와 deployed URL smoke가 끝나기 전에는 C1/C2를 통과로 쓰지 않는다.

새 public `serviceWorker.js`는 origin-root absolute asset URL을 직접 쓰지 않는다. build가 site base `/codaro`를 포함한 asset manifest와 cache version을 주입하고 `/codaro/run/manifest.json`, `/codaro/run/serviceWorker.js`, scope `/codaro/run/`만 새 registration으로 사용한다. registration URL과 scope는 `new URL("./serviceWorker.js", document.baseURI)`와 explicit relative scope에서 만들며 Local origin-root build와 Pages subpath build를 같은 literal로 묶지 않는다.

shell service worker 합격은 HTML, hashed editor asset, same-origin pyproc wrapper graph의 site-base 정합성까지다. cross-origin Python core의 offline 가용성을 암시하지 않는다. warm-offline은 pyproc `coreIntegrity`와 `coreCacheDir` 또는 동등한 versioned cache가 exact core completeness와 변조 거부를 증명한 별도 capability가 생길 때만 release matrix에 추가한다. 그 전에는 cold/warm offline failure가 shell 회귀와 섞이지 않도록 `unsupported`로 기록한다.

current source의 `editor/index.html`은 `%BASE_URL%`로 worker URL과 scope를 만들므로 새 `/run/`과 `/app/` build가 origin root worker를 등록하지 않는다. 다만 이미 배포된 legacy registration의 exact cache migration client, release manifest와 tombstone asset은 아직 구현되지 않았다. GitHub Pages project workflow는 origin root에 tombstone을 배포할 권한이 없으므로 배포 가능하다고 주장하지 않는다. 향후 `/app` compatibility page는 `navigator.serviceWorker.getRegistrations()` 결과 중 active/waiting/installing `scriptURL`이 release manifest의 exact legacy URL set에 있고 scope·cache marker·request set hash가 모두 일치하는 registration만 대상으로 삼는다. 알려진 Pages legacy URL은 same-origin `/serviceWorker.js`, `/codaro/serviceWorker.js`, `/codaro/app/serviceWorker.js`를 release별 manifest로 구분하고, Local origin의 registration은 Pages migration report에 섞지 않는다. 다른 root app registration은 scope만 보고 해제하지 않는다. 계획된 `serviceWorkerLegacyCaches.json`은 지원하는 과거 release별 exact cache name과 cached request set hash를 기록한다. request set은 same-origin GET만 허용하고 각 key를 JCS object `{method:"GET",url:new URL(request.url).href}`로 만든다. URL serializer가 scheme/host case·default port·percent encoding을 정규화하며 query order는 보존하고 fragment와 headers는 제외한다. exact tuple을 deduplicate하고 `(method,url)` Unicode code point 순으로 정렬한 JCS array의 SHA-256을 쓴다. compatibility client는 exact `codaro-shell-v2`, `codaro-runtime-v2` 또는 manifest에서 name과 request set hash가 모두 맞는 cache만 삭제한다. `workbox-*`, `codaro-*-*` wildcard 삭제는 금지하고 non-GET·cross-origin·hash mismatch cache는 orphan report만 남긴다. client acknowledgement와 새 `/codaro/run/` registration 확인 뒤 대상 registration을 `unregister()`한다. offline·timeout이면 old data를 보존하고 다음 online visit에 재시도한다.

workflow가 소유할 수 있는 `/codaro/serviceWorker.js`와 `/codaro/app/serviceWorker.js` tombstone은 해당 URL이 release manifest에 있을 때 최소 두 stable release 동안 유지한다. 소유할 수 없는 origin-root URL은 compatibility client unregister와 telemetry만 사용한다. 28일 연속 `/app` sampled session 10,000건 이상에서 legacy-controlled client 비율이 0.1% 미만이고 unregister 실패율이 0.01% 미만일 때만 소유한 tombstone을 제거한다. 표본이나 개인정보 동의 기반 telemetry가 없으면 tombstone을 유지한다. 안전한 tombstone 유지 자체는 initiative 완료를 막지 않으며 C3 asset 삭제는 별도 후속 packet으로 추적한다. 이 상수와 marker는 `serviceWorkerMigration.ts`와 migration fixture가 함께 소유한다.

## 구현 순서

1. `verifyLessonIdentity`로 472-way identity를 green으로 만든다.
2. curriculum generator를 goal/path/`LessonRef` metadata schema로 확장한다.
3. `LearnPage`를 이어하기, goal path, filterable catalog 구조로 교체한다.
4. `LessonPage`와 canonical route prerender를 추가한다.
5. C0 archive를 고정한 뒤 `/codaro/run/` editor build와 legacy `/codaro/app/` compatibility, service worker scope/cache migration을 Pages workflow에 배선한다.
6. Run route handoff와 browser evidence store를 연결한다.
7. `BrowserCheckExecutor`와 Local parity fixture를 연결한다.
8. full learning archive v2의 document, drafts, virtual FS, package bytes, evidence, lineage, disabled automation draft Web export/materialize와 Local atomic import/rollback을 연결했다. 실제 deployed Web-to-Local round trip과 보안 검수를 남긴다.
9. sitemap, OG, analytics event를 갱신한다.

## 영향 파일

- `landing/src/pages/learn.jsx`
- 신규 `landing/src/pages/lesson.jsx`
- 신규 `landing/src/components/learningPathCard.jsx`
- 신규 `landing/src/components/lessonCatalog.jsx`
- `landing/scripts/generateCurriculum.js`
- `landing/scripts/prerenderReact.js`
- `landing/scripts/postbuild.js`
- `landing/src/lib/generated/curriculum.js`
- `landing/src/App.jsx`
- `landing/src/lib/brand.js`
- `editor/src/main.tsx`
- `editor/src/App.tsx`
- `editor/src/lib/browserPythonRuntime.ts`
- `editor/scripts/generatePyprocAssets.mjs`
- `editor/src/lib/curriculaRegistry.ts`
- 신규 `editor/src/lib/runLaunchIntent.ts`
- 신규 `editor/src/lib/browserLearningProgressStore.ts`
- 선행 산출물 소비·확장 `editor/src/lib/browserCheckExecutor.ts` (생성 owner는 `02-learning-method`)
- 신규 `editor/src/lib/browserLearningArchive.ts`
- 신규 `contracts/learningArchive.schema.json`
- 신규 `editor/src/lib/lessonRef.ts`
- `editor/src/hooks/useSurfaceRoute.ts`
- `editor/src/lib/curriculumCheck.ts`, `editor/src/lib/notebookRuntime.ts`
- `editor/src/hooks/useNotebookRuntimeState.ts`
- `editor/src/types.ts`
- `editor/src/lib/surfaceModel.ts`
- `editor/vite.config.ts`
- `editor/public/manifest.json`
- `editor/public/serviceWorker.js`
- 신규 `editor/public/serviceWorkerTombstone.js`: workflow가 소유하는 site-base legacy URL용 최소 두 stable release 배포 template
- 신규 `editor/src/lib/serviceWorkerMigration.ts`, `editor/public/serviceWorkerLegacyCaches.json`
- 신규 Pages `/codaro/app/index.html` compatibility artifact와 C0 archive manifest
- `editor/index.html`
- `.github/workflows/pages.yml`

## 영향 함수·심볼

- `LearnPage`
- 신규 `LessonPage`, `LearningPathCard`, `LessonCatalog`
- `walkYaml`, `domainOf`, 신규 `buildLearningPaths`, `lessonRoute`
- `renderShell`, `writeRoute`, `collectionJsonLd`
- 신규 `readRunLaunchIntent`, `applyRunLaunchIntent`, `BrowserLearningProgressStore`
- 신규 `LessonRef`, `lessonKeyOf`, `BrowserCheckExecutor`, `exportBrowserLearningArchive`, `importBrowserLearningArchive`
- `browserPythonRuntime`, `runNotebookBlock`, `runBrowserNotebook`
- `App`, `CurrentLearningSurface`
- `runNotebookBlock`, `runBrowserNotebook`

## 테스트

- 신규 `tests/learning/testGeneratedLearningCatalog.py`: 472 lesson, featured domain, outcome/runtime/visual metadata
- 신규 `tests/learning/verifyWebLearningRoutes.py`: 472 canonical `LessonRef` route, path context, sitemap, lazy content
- 선행 산출물 소비 `tests/curriculum/verifyLessonIdentity.py` (생성 owner는 `00-product-contract`): filesystem=registry=graph=generated routes=472
- 신규 `tests/learning/verifyWebLearningPlaywright.py`: Landing -> Learn -> lesson -> Run -> edit -> run -> automatic check -> reload resume
- 선행 산출물 소비 `tests/learning/verifyLearningFlowFriction.py` (생성 owner는 `02-learning-method`): run 뒤 check, feedback, hint, 다음 section까지 추가 클릭 0회이며 모든 control이 실제 command, navigation, choice에 연결됨
- 신규 `tests/learning/testBrowserLearningProgressStore.py`: version, merge, export/import
- 신규 `tests/learning/testLearningEventMerge.py`: event ID union, payload hash conflict, transaction rollback
- 현재 `tests/curriculum/testLearningEvidenceArchive.py`: Python validator, SQLite insert/skip/conflict, tamper rollback, Local HTTP import/export
- 선행 산출물 소비 `tests/learning/verifyBrowserLocalCheckParityPlaywright.py` (생성 owner는 `02-learning-method`): isolated parity와 localRequired
- 구현 `tests/learning/testLearningArchive.py`: document/draft/virtual FS/package/evidence/automation bytes materialization, tamper rejection, Local atomic import와 rollback
- green `tests/surface/verifyProductExperiencePlaywright.py`: Web·Local import 뒤 draft reload와 full archive payload 보존을 포함한 공식 63/63. 사람 승인·실제 WebView2·배포 smoke를 대신하는 완료 증거로 쓰지 않음
- 현재 `tests/surface/verifyProductExperiencePlaywright.py`: Web evidence export, duplicate import, tamper rejection, conflict isolation, Local import/re-export/reload
- 신규 `tests/surface/verifyRunBaseMigration.py`: fresh checkout의 C0 archive `/app/` + current `/run/` 조립, query/hash 보존, site-base asset·SW scope, exact owned cache만 제거하고 foreign `workbox-*` 보존, two-release·telemetry threshold
- 수정 `tests/surface/verifyPyprocAssetsPlaywright.py`: `/run/` base wrapper graph, SRI, package pin과 core provenance
- 수정 `tests/surface/verifyPyprocRuntimeFsPlaywright.py`: browser persistence, cold online first run, unsupported offline claim
- 수정 `tests/surface/verifyLandingDocsBundleSplit.py`: curriculum data가 entry/docs chunk를 비대하게 만들지 않음
- 실행: `uv run python -X utf8 tests/run.py gate landing-build`
- 실행: `uv run python -X utf8 tests/run.py gate editor-build`

## 롤백

- C1 `/app/`은 hash가 고정된 C0 archive로 유지하고 C2부터 compatibility page로 전환한다. current build를 같은 경로에 alias해 보존을 가장하지 않는다.
- `/app/` compatibility와 workflow가 소유하는 site-base tombstone은 최소 두 stable release와 지정 telemetry threshold를 모두 통과한 뒤에만 제거를 검토한다.
- Web progress migration 실패 시 기존 IndexedDB object store를 삭제하지 않고 새 version transaction을 abort한다.
- lesson prerender 실패가 전체 site를 silently 누락시키지 않도록 expected route count 불일치를 build failure로 처리한다.
- Run handoff가 실패해도 Learn lesson 본문과 Local open action은 유지한다.

## 평가

### 개발자 관점

- 가장 큰 위험은 472 lesson payload와 browser progress다. route별 lazy data와 schema-versioned adapter로 격리한다.
- pyproc 기반 실행은 이미 있으므로 새 runner를 만들지 않고 handoff, check, persistence를 완성한다.

### PM 관점

- 웹 학습의 합격 기준은 카탈로그가 보이는 것이 아니라 첫 사용자가 3분 안에 코드를 바꾸고 검증 결과를 얻는 것이다.
- 검색 유입 사용자는 개별 lesson에서 곧바로 Run을 시작할 수 있어야 하며 홈페이지로 되돌아가게 하면 안 된다.
