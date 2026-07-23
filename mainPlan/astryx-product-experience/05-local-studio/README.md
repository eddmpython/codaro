# 05 Local Studio

상태: 진행

## 목표

Local을 웹의 큰 버전이 아니라 실제 파일, 패키지, terminal, schedule, webhook, GUI automation을 다루는 강한 작업대로 만든다. 디자인은 Run과 같고 capability와 밀도만 확장한다.

착수 의존은 `00-product-contract`, `02-learning-method`, `03-product-shell`, `04-web-learning`이다. Local은 Web Run과 같은 Astryx learning surface와 token을 소비하고 automation active state는 neutral surface, accent rail과 명시적 상태 텍스트로 표현한다. Local 기본 route는 최근 학습·notebook resume, runtime status, automation operation strip과 주요 command를 한 흐름에 두는 Home이며 Automation은 task list, detail, run inspector 중심의 dense operational layout으로 교체됐다. behavior pass는 sandbox expectedPaths의 file·directory·table·image artifact descriptor를 evidence event에 봉인하고 schedule pass는 pinned package asset descriptor도 봉인한다. `contracts/learningArchive.schema.json`이 document, drafts, 전체 virtual FS와 package bytes, evidence, lineage, automation draft의 공용 source이며 Python·TypeScript validator/materializer가 같은 archive를 읽는다. `/api/curriculum/learning-archive/import`는 side effect 전 lesson identity를 검증하고 전체 archive·evidence merge 뒤 immutable object와 `HEAD`를 원자 교체하며, 실패 시 이전 `HEAD`를 복원한다. Local lesson load는 current `HEAD`의 document와 drafts를 다시 materialize한다. imported automation은 disabled·unscheduled draft라서 import만으로 실행되지 않는다. 공식 `local-studio-browser`는 900x640·1024x768·1440x900을 포함한 26/26으로 green이며 최신 log의 `ConnectionReset`, `Proactor`, `Win10054`는 모두 0이다. 다만 실제 WebView2, 설치본 Web-to-Local round trip, scheduler safety와 사람 시각 검수가 남아 있으므로 `_done`이 아니다.

## Local 홈

- 최근 학습과 최근 notebook을 한 줄 resume 영역으로 제공
- automation status, 오늘의 run, 실패, E-Stop을 operation strip으로 제공
- `새 자동화`, `파일 열기`, `학습 이어하기`를 명확한 command로 제공
- provider 연결은 제품 전체를 가리는 onboarding이 아니라 필요한 AI 기능의 설정 상태로 둔다.

## 자동화 표면

- 좌측 secondary nav: 내 task, workflow, schedule, integrations
- main: 선택한 task의 코드 또는 recipe, trigger, input, permission
- run inspector: 상태, 시작/종료, stdout/stderr, 생성 파일, audit event
- persistent safety: E-Stop, permission scope, destructive action confirmation
- empty/error/loading/paused/scheduled/running/succeeded/failed 상태를 모두 설계한다.
- 자동화 설명용 marketing card를 쓰지 않고 반복 작업을 빠르게 scan하고 실행하는 operational layout을 쓴다.

## Layout blueprint

| viewport | Local Home | Local Automation | scroll·focus owner |
| --- | --- | --- | --- |
| `>=1440` | resume strip 위, operation strip 아래, 최근 결과 unframed list | secondary nav 220px, task list 300px, detail min 560px, inspector 360px | detail scroll, inspector 독립 scroll. task 이동 시 detail heading focus |
| `1024~1439` | resume와 operation을 2행 band | secondary nav 64px, task list 280px, detail, inspector push drawer | detail primary scroll, drawer close 후 trigger focus |
| `900~1023` | single main column, operation strip horizontal scan | task list와 detail 2 pane, inspector bottom sheet | E-Stop sticky, sheet focus trap/return |

Local desktop의 실제 지원 minimum은 launcher와 같은 `900x640`이다. `<900` component fixture는 overflow 회귀를 찾는 개발 도구일 뿐 제품 지원 viewport가 아니다. Local gate는 simulated browser resize로 통과할 수 없고 실제 WebView2 900x640·1024x768·1440x900에서 Home, Notebook, Automation, inspector를 검증한다.

empty, loading, permissionRequired, paused, scheduled, running, succeeded, failed, cancelled, runtimeDisconnected를 fixture로 고정한다. 실패와 E-Stop은 색만으로 구분하지 않는다.

## 학습에서 자동화로

- Local에서 lesson 완료 후 `이 코드를 자동화로 만들기` action을 제공한다.
- 현재 notebook/document block을 automation draft로 넘기고 사용자 확인 전에는 schedule이나 side effect를 만들지 않는다.
- source lesson, evidence, generated task의 lineage를 저장한다.
- Web archive import는 `00-product-contract`의 full archive와 evidence transaction을 사용한다. artifact hash와 lineage가 맞는 document·recipe만 disabled automation draft의 source가 될 수 있다.

## 구현 순서

1. capability에 따라 Local 전용 nav와 command를 활성화한다.
2. Local home resume/operation strip을 만든다.
3. `AutomationView`를 dense operational layout으로 migration한다.
4. task detail, run inspector, audit, E-Stop 상태를 Astryx primitive로 교체한다.
5. notebook에서 automation draft로 이어지는 confirm flow를 만든다.
6. terminal, package, provider settings를 공용 dialog/sheet 패턴으로 옮긴다.
7. launcher webview chrome과 theme sync를 검증한다.

## 영향 파일

- 신규 `editor/src/components/app/localHomeSurface.tsx`
- 신규 `editor/src/components/automation/automationRunInspector.tsx`
- 신규 `editor/src/components/automation/automationOperationStrip.tsx`
- `editor/src/components/automation/automationSurface.tsx`
- `editor/src/components/app/mainSurface.tsx`
- `editor/src/components/app/productSideNav.tsx`
- `editor/src/components/app/notebookSurface.tsx`
- `editor/src/components/terminal/terminalPanel.tsx`
- `editor/src/components/assistant/providerSettingsSheet.tsx`
- `editor/src/hooks/useAutomationState.ts`
- `editor/src/lib/automationState.ts`
- `editor/src/lib/assistantArtifactRouting.ts`
- `editor/src/lib/browserLearningArchive.ts`, `editor/src/lib/learningArchive.ts`
- 선행 산출물 소비 `contracts/learningArchive.schema.json` (생성 owner는 `04-web-learning`)
- `src/codaro/curriculum/learningArchive.py`, `src/codaro/curriculum/learningArchiveFlow.py`
- `src/codaro/api/curriculumRouter.py`, `editor/src/lib/api/curriculumApi.ts`
- `launcher/codaro-launcher/src/main.rs`
- `launcher/codaro-launcher/src/webview.rs`

## 영향 함수·심볼

- 신규 `LocalHomeSurface`, `AutomationOperationStrip`, `AutomationRunInspector`
- `AutomationView`
- `MainSurface`
- `runAutomationTask`, `toggleAutomationStop`
- `buildAssistantArtifactApplication`, `pendingTargetForAssistantArtifacts`
- 신규 `buildAutomationDraftFromDocument`
- `importLearningArchive`, `materializeLearningArchive`, `importBrowserLearningArchive`
- launcher `main.rs::run_windowed`의 WebView2 생성과 theme/window state 처리, `webview.rs` system-browser fallback 소비

## 테스트

- 수정 `tests/automation/verifyAutomationIdeAudit.py`: operational states와 safety controls
- 신규 `tests/automation/verifyAutomationStudioPlaywright.py`: task select, run, failure, audit, E-Stop, mobile/narrow local window
- 수정 `tests/surface/testProductSurfaceContract.py`: assistant artifact routing 보존
- 수정 `tests/surface/verifyProviderSettingsPlaywright.py`: Astryx dialog와 focus
- 수정 `tests/runtime/verifyRuntimeRecoveryPlaywright.py`: local runtime failure recovery
- 구현 `tests/learning/testLearningArchive.py`: manifest/blob hash, full materialization, evidence transaction과 atomic `HEAD` rollback
- 실행: `uv run python -X utf8 tests/run.py gate automation-ide-audit`
- 실행: 신규 `uv run python -X utf8 tests/run.py gate local-studio-browser`
- 실행: `uv run python -X utf8 tests/run.py gate app-runtime`
- 실행: `uv run python -X utf8 tests/run.py gate launcher-check`

## 롤백

- API와 scheduler domain은 UI migration에서 바꾸지 않는다.
- automation draft handoff는 기존 notebook 저장과 분리하며 confirm 전 side effect가 없다.
- archive import는 temp transaction에서 전부 검증한 뒤 commit하며 기존 document/evidence/task를 부분 수정하지 않는다.
- launcher chrome 변경은 editor shell migration과 별도 커밋으로 둔다.
- E-Stop은 시각 migration 중에도 기존 backend state를 그대로 읽고 제어한다.

## 평가

### 개발자 관점

- Run과 Local component fork를 만들지 않고 capability selector로 command만 확장해야 장기 drift를 막는다.
- safety action과 runtime state는 Astryx 스타일보다 기존 backend truth가 우선한다.

### PM 관점

- Local을 설치할 이유가 첫 화면에서 분명해야 한다. 파일, schedule, audit, 상주 실행이 실제 작업 흐름으로 보여야 한다.
- 자동화 표면은 화려함보다 반복 사용의 속도, 상태 가시성, 안전성이 중요하다.
