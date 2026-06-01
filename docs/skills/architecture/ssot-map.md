---
id: ssot-map
title: SSOT Map
description: Single source of truth map for Codaro schema, provider loop, tool policy, and product surface boundaries.
category: architecture
section: reference
order: 200
purpose: 새 세션이 들어와도 어떤 파일이 기준인지 즉시 판단하게 한다.
whenToUse: 셀 스키마, provider loop, tool 정책, trace, 평가 harness, 프론트 상태 경계를 바꿀 때.
---

# SSOT Map

Codaro에서 기준 파일은 아래 순서로 본다. 같은 의미의 규칙을 여러 파일에 복사하지 않는다.

## Product Surface

| 기준 | 파일 | 역할 |
|---|---|---|
| repository structure | `docs/skills/architecture/repository-structure.md` | 루트 tree, 로컬/generated root, 새 파일 placement 규칙 |
| dogfood alpha | `docs/skills/ops/product/dogfood-alpha.md` | 첫 사용자 provider 연결, 질문, 학습 생성, 셀 실행, 실패 복구 기준 |
| product quality | `docs/skills/ops/product/service-candidate.md` | `product-quality` 기준 id와 legacy path를 함께 가진 잘 만들어진 로컬 제품 품질 판단 기준 |
| diagnostic summary and diagnostic export | `src/codaro/system/diagnosticSummary.py` | provider/runtime/package/frontend failure 분리와 secret redaction summary/export payload 기준 |
| local diagnostic collection | `src/codaro/system/localDiagnostics.py` | provider/runtime/package/frontend 로컬 상태를 `DiagnosticItem`으로 수집하고 export context를 조립하는 기준 |
| system health flow | `src/codaro/system/healthFlow.py` | process/session/conversation/runtime health payload의 system 경계 |
| server state | `src/codaro/system/serverState.py` | process/session/curriculum/runtime 공유 상태와 생성 factory의 system 경계 |
| 제품 표면 | `docs/skills/architecture/frontend-product-surface.md` | 대화, 현재 학습, 노트북, 자동화의 의미와 UX 경계 |
| 표면 라우팅 | `editor/src/lib/surfaceModel.ts` | 프론트 surface enum, `대화 → 현재 학습 → 노트북 → 자동화` 사이드바 순서, 표시 이름 key, 노출 여부 |
| 대화 요청 범위 | `editor/src/lib/teacherScope.ts` | 학습/셀/자동화 요청 분류와 자동화 작성 요청의 노트북 pending 경로 |
| 표면 route state | `editor/src/hooks/useSurfaceRoute.ts` | URL hash와 surface state 동기화 |
| 표면 조립 | `editor/src/components/app/mainSurface.tsx` | surface별 화면 조립 |
| 제품 사이드바 shell | `editor/src/components/app/productSidebar.tsx` | provider/theme/locale/search/utility와 표면별 sidebar tree를 조립하는 shell |
| 제품 flow nav | `editor/src/components/app/productFlowNav.tsx` | `PRODUCT_SIDEBAR_NAV`를 렌더링하는 `대화 → 현재 학습 → 노트북 → 자동화` flow nav |
| 학습 sidebar tree | `editor/src/components/app/curriculumSidebarTree.tsx` | Codaro 커리큘럼, 나만의 커리큘럼, lesson tree, 삭제 dialog |
| 자동화 sidebar tree | `editor/src/components/app/automationSidebarTree.tsx` | 자동화 표면 내부의 Codaro/나만의 자동화/task 하위 탐색 |

## Cell Schema

| 기준 | 파일 | 역할 |
|---|---|---|
| 프론트 셀 스키마 | `editor/src/lib/cellSchema.ts` | `blockTypes`, `cellRoles`, `executionKinds`, `cellDisplayKinds` |
| 백엔드 셀 스키마 | `src/codaro/document/cellSchema.py` | 같은 셀 어휘의 Python 기준 |
| 문서 모델 | `src/codaro/document/models.py` | 실제 document/block 저장 모델 |
| 문서 블록 조작 | `src/codaro/document/blockOperations.py` | 블록 삽입/삭제/이동/수정과 실행 대상 코드 블록 검증 기준 |
| 노트북 생성 | `src/codaro/document/notebookGeneration.py` | tool이 생성하거나 분리한 노트북 document와 저장 payload를 조립하는 document 경계 |
| 프론트 문서 조작 | `editor/src/lib/documentModel.ts` | draft 생성, block 병합, payload 정규화 |
| 셀 해석 | `editor/src/lib/cellModel.ts` | 셀 라벨, 분류, 셀별 요청 prompt |

## Curriculum System

| 기준 | 파일 | 역할 |
|---|---|---|
| curriculum authoring | `docs/skills/architecture/curriculum-authoring.md` | lazy uv 의존성, 소개 레슨, 레슨 작성 절차, 품질 점검 기준 |
| learning YAML contract | `docs/skills/architecture/learning-yaml-contract.md` | 구조화 YAML 계약, 섹션 단위 학습카드, materialize 규칙의 SSOT |
| curriculum authoring proposal flow | `src/codaro/curriculum/authoringProposalFlow.py` | predict prompt/variation 보강 제안 payload와 section contract 해석 경계 |
| curriculum catalog flow | `src/codaro/curriculum/catalogFlow.py` | taxonomy와 learning spec의 읽기 전용 API payload 경계 |
| curriculum content cache | `src/codaro/curriculum/contentCache.py` | YAML lesson 변환 캐시, content response payload, 방어적 복사 기준 |
| curriculum content flow | `src/codaro/curriculum/contentFlow.py` | 카테고리/콘텐츠 목록, lesson content loading, 접근 기록 payload 경계 |
| curriculum goal discovery flow | `src/codaro/curriculum/goalDiscoveryFlow.py` | 학습 목표 해석, 기존 레슨 검색/inspect, 갭 보강 draft payload 경계 |
| curriculum progress flow | `src/codaro/curriculum/progressFlow.py` | 진행 요약, 접근/미션 완료 update payload 경계 |
| curriculum planning flow | `src/codaro/curriculum/planningFlow.py` | master plan 입력 검증, 계획 합성 호출, 도메인별 gap payload 조립 기준 |
| curriculum check flow | `src/codaro/curriculum/checkFlow.py` | 학습 셀 제출 후 실행 검증, 예측 diff, misconception, 디버깅 ref payload 조립 |
| learner progress flow | `src/codaro/curriculum/learnerProgressFlow.py` | outcome 검증 토글, learner snapshot/outcome payload 조립 기준 |
| curriculum analytics flow | `src/codaro/curriculum/analyticsFlow.py` | mastery, unified mastery, analytics snapshot refresh, 30일 summary payload 기준 |
| curriculum quality flow | `src/codaro/curriculum/qualityFlow.py` | 강의 품질 리포트, 검증 제안, 실측 레슨 시간 payload 조립 기준 |
| curriculum review flow | `src/codaro/curriculum/reviewFlow.py` | 복습 큐 payload와 복습 결과 기록의 lesson key 경계 기준 |
| exercise check dispatch | `src/codaro/curriculum/exerciseCheck.py` | curriculum API와 tool의 check type별 실행 분기, check response payload 기준 |
| check primitives | `src/codaro/curriculum/checker.py` | output, variable, contains, noError 채점 구현 |

## Share Pack System

| 기준 | 파일 | 역할 |
|---|---|---|
| pack service | `src/codaro/share/packService.py` | 공유 팩 inspect/install/load/export와 pack storage 기준 |
| pack flow | `src/codaro/share/packFlow.py` | 공유 팩 HTTP payload와 error code를 조립하는 share domain 경계 |
| pack automation task | `src/codaro/share/automationTask.py` | 설치된 공유 팩 recipe를 자동화 task로 등록하는 domain 경계 |

## Automation System

| 기준 | 파일 | 역할 |
|---|---|---|
| automation task flow | `src/codaro/automation/taskFlow.py` | task 조회/실행/스케줄/webhook/E-Stop payload와 scheduler 접점의 domain 경계 |
| automation plan flow | `src/codaro/automation/planFlow.py` | plan 실행/status/pause/resume payload와 `AutomationLoop` 보관의 domain 경계 |
| automation workflow flow | `src/codaro/automation/workflowFlow.py` | workflow 조회/생성/삭제/실행/run 조회 payload와 `WorkflowEngine` 접점의 domain 경계 |
| automation input policy flow | `src/codaro/automation/inputPolicyFlow.py` | input guard 정책 조회/수정 payload와 screen region 변환의 domain 경계 |
| automation recording flow | `src/codaro/automation/recordingFlow.py` | recording start/status/stop과 recipe 생성 payload의 domain 경계 |
| automation notification flow | `src/codaro/automation/notificationFlow.py` | 외부 channel 등록/삭제/조회와 notification 전송 payload의 domain 경계 |
| automation voice flow | `src/codaro/automation/voiceFlow.py` | voice listen/speak/command payload와 Whisper/TTS/CommandParser 접점의 domain 경계 |
| automation monitoring flow | `src/codaro/automation/monitoringFlow.py` | resource usage와 audit log payload의 domain 경계 |
| automation integration flow | `src/codaro/automation/integrationFlow.py` | 외부 integration 조회/configure/test/execute payload와 registry 접점의 domain 경계 |

## Teacher Loop

| 기준 | 파일 | 역할 |
|---|---|---|
| loop 절차 문서 | `docs/skills/architecture/teacher-tool-loop.md` | 요청 분류, cell map, dependency preflight, tool lifecycle 원칙 |
| automation authoring loop | `docs/skills/architecture/automation-authoring-loop.md` | 자동화 요청을 recipe, automation 셀, dry-run, task 등록으로 전개하는 기준 |
| conversation state | `src/codaro/ai/conversation.py` | conversation 저장소 singleton, system prompt, 생성/목록/삭제 payload 기준 |
| turn session | `src/codaro/ai/teacher/turnSession.py` | conversation, provider, messages, tools를 한 turn 실행 단위로 준비 |
| turn runtime | `src/codaro/ai/teacher/turnRuntime.py` | context 주입, request payload, turn session, tool executor를 provider 실행 단위로 조립 |
| orchestrator | `src/codaro/ai/teacher/teacherOrchestrator.py` | context, policy, trace, tool payload를 묶는 진입점 |
| provider loop | `src/codaro/ai/teacher/providerLoop.py` | teacher/provider loop에서 provider tool call과 turn 완료 payload를 conversation, policy, executor, trace에 반영 |
| provider stream | `src/codaro/ai/teacher/providerStream.py` | streaming token과 tool lifecycle event를 생성하되 완료 payload는 provider loop 기준을 공유 |
| provider stream events | `src/codaro/ai/teacher/streamEvents.py` | streaming start/delta/tool/done/error event payload 기준 |
| context builder | `src/codaro/ai/teacher/contextBuilder.py` | provider에 들어가는 context text 구성 |
| tool policy | `src/codaro/ai/teacher/toolPolicy.py` | packages-check 선행, 실행 전 preflight, policy violation payload 같은 강제 규칙 |
| trace model | `src/codaro/ai/teacher/traceModel.py` | turn/tool lifecycle, tool sequence, summary 추적 |
| turn execution | `src/codaro/ai/teacher/turnExecution.py` | 준비된 runtime turn을 loop/stream 실행으로 넘기는 router 경계 |
| skill registry | `src/codaro/ai/teacher/skillRegistry.py` | provider가 따라야 할 작업별 skill 목록과 required tool 계약 |
| eval harness | `src/codaro/ai/teacher/evalHarness.py` | response trace payload, tool sequence golden case, batch report 기준 |
| completion runtime | `src/codaro/ai/completion.py` | editor code completion request payload, prompt, context 축약, provider 호출 기준 |
| provider profile mutation | `src/codaro/ai/profileMutation.py` | provider profile update와 secret 저장 정책 |
| provider profile events | `src/codaro/ai/profileEvents.py` | provider profile change SSE frame과 fingerprint polling 기준 |
| provider oauth flow | `src/codaro/ai/oauthFlow.py` | OAuth authorize/status/logout와 callback state/html 응답 기준 |
| provider models | `src/codaro/ai/providerModels.py` | provider별 모델 목록 조회와 fallback 기준 |
| provider validation | `src/codaro/ai/providerValidation.py` | provider 연결 검증 config와 availability probe 기준 |
| live provider ops | `docs/skills/architecture/live-provider-ops.md` | 실제 provider/OAuth/live smoke gate, token lifecycle, credential 보안 기준 |

## Runtime System

| 기준 | 파일 | 역할 |
|---|---|---|
| kernel 실행 payload | `src/codaro/kernel/executionPayload.py` | 실행 결과를 HTTP, websocket, tool payload로 변환하는 기준 |
| document block execution | `src/codaro/kernel/documentExecution.py` | 검증된 document code block을 kernel 실행 payload로 넘기는 document/runtime 접점 |
| kernel UI event flow | `src/codaro/kernel/uiEventFlow.py` | widget callback 호출 결과를 `UiEventResponse`와 reactive trigger로 변환하는 기준 |
| kernel session | `src/codaro/kernel/session.py` | runtime engine을 kernel protocol로 변환하는 session 경계 |
| reactive 실행 | `src/codaro/kernel/reactive.py` | block 의존 그래프와 reactive 실행 순서 |
| runtime engine | `src/codaro/runtime/executionEngine.py` | 교체 가능한 실행 capability 인터페이스 |
| local engine | `src/codaro/runtime/localEngine.py` | 로컬 기본 실행 engine 구현 |

## Extension System

| 기준 | 파일 | 역할 |
|---|---|---|
| extension flow | `src/codaro/extensions/extensionFlow.py` | extension 조회/등록/삭제/capability 조회 payload와 registry 접점의 extension 경계 |
| extension registry | `src/codaro/extensions/registry.py` | extension 보관, capability 조회, hook 보관 기준 |

## Tool System

| 기준 | 파일 | 역할 |
|---|---|---|
| tool 진입점 | `src/codaro/ai/tools.py` | 기본 tool 목록, 등록 순서, 하위 호환 export |
| tool 정의 모듈 | `src/codaro/ai/toolDefinitions/` | 제품 경계별 기본 tool 이름, description, parameter schema |
| tool 계약 검증 | `src/codaro/ai/toolContract.py` | 기본 tool 정의, manifest metadata, handler 연결성 검증 |
| registry | `src/codaro/ai/toolRegistry.py` | `ToolDef`와 register/get/schema 변환 |
| manifest | `src/codaro/ai/toolManifest.py` | tool별 category, lane, target, risk 단일 메타데이터와 표시 그룹 |
| dispatch | `src/codaro/ai/toolExecutor.py` | session/document 공통 접근과 handler dispatch |
| workbench handlers | `src/codaro/ai/toolHandlers/workbench.py` | 셀 읽기/쓰기, curriculum YAML 전개. 현재 문서 셀 변경은 document block operations에 위임 |
| curriculum OS tool handlers | `src/codaro/ai/toolHandlers/curriculumOs.py` | teacher curriculum tool 요청을 curriculum flow/cache 경계로 위임하는 접점 |
| runtime handlers | `src/codaro/ai/toolHandlers/runtime.py` | 실행, 변수, 패키지, 검증 |
| learning handlers | `src/codaro/ai/toolHandlers/learning.py` | 학습 카드, 퀴즈, 노트북 생성 |
| automation handlers | `src/codaro/ai/toolHandlers/automation.py` | 화면 인식, 입력, 녹화, 자동화 recipe 작성, task 등록, 자동화 실행, 알림 |
| automation recipe authoring | `src/codaro/automation/recipeAuthoring.py` | percent-format recipe draft, dry-run body, task authoring input validation |

## Transport Boundary

| 기준 | 파일 | 역할 |
|---|---|---|
| provider HTTP/SSE | `src/codaro/api/aiRouter.py` | request parsing, provider 호출, SSE 전송만 담당 |
| kernel websocket transport | `src/codaro/api/kernelWebSocket.py` | websocket message validation, 실행 event 전송, session status payload 기준 |
| server state compatibility | `src/codaro/api/appState.py` | legacy import 호환용 재수출만 담당. 내부 router는 `system/serverState.py`를 직접 본다 |
| frontend API | `editor/src/lib/api.ts` | 제품 표면에서 server와 통신하는 유일한 통로 |

## Frontend State Boundary

| 기준 | 파일 | 역할 |
|---|---|---|
| assistant context | `editor/src/lib/assistantContext.ts` | provider 요청에 들어가는 document/cell/dependency/tool context |
| assistant state types | `editor/src/lib/assistantTypes.ts` | assistant message, work step, trace UI state 타입 기준 |
| assistant turn request | `editor/src/lib/assistantTurnRequest.ts` | provider turn request payload와 context materialization 기준 |
| assistant stream protocol | `editor/src/lib/assistantStream.ts` | provider SSE event parsing, done/error response 누적 기준 |
| assistant message state | `editor/src/lib/assistantConversationState.ts` | stream event와 response를 assistant message state로 변환 |
| assistant provider turn | `editor/src/lib/assistantProviderTurn.ts` | provider stream 호출과 stream event를 message state에 연결 |
| mobile chat turn | `editor/src/lib/mobileChatTurn.ts` | 모바일 채팅 route의 teacher chat API 호출 경계 |
| assistant response plan | `editor/src/lib/assistantResponsePlan.ts` | provider 응답과 tool 결과를 에디터 적용, pending blocks, 나만의 커리큘럼 저장/표면 전환 계획으로 변환하되 직접 저장하지 않는다 |
| assistant local turn | `editor/src/lib/assistantLocalTurn.ts` | provider 미연결 시 local fallback 저장, notice, pending reset 결정 |
| assistant turn state hook | `editor/src/hooks/useAssistantTurnState.ts` | 대화 prompt/message/conversation 상태와 provider/local turn 실행 UI 상태 |
| pending changes | `editor/src/lib/pendingChanges.ts` | 생성된 셀 대기분을 노트북/커리큘럼에 적용하거나 버리는 정책 |
| pending changes state hook | `editor/src/hooks/usePendingChangesState.ts` | 생성된 셀 대기분 상태와 적용/버리기 UI handler |
| local fallback | `editor/src/lib/localFallback.ts` | provider 미연결 시 기본 안내, 로컬 커리큘럼/자동화 초안 |
| app bootstrap | `editor/src/lib/appBootstrap.ts` | 앱 시작 시 health, bootstrap, 기본 커리큘럼, provider profile, session 초기 상태 |
| app bootstrap effect hook | `editor/src/hooks/useAppBootstrapEffect.ts` | 앱 시작 결과를 surface state, provider, curriculum, automation state에 적용 |
| notebook document state hook | `editor/src/hooks/useNotebookDocumentState.ts` | 편집기 document, draft, 선택 셀, 셀 추가/적용 상태 |
| provider connection | `editor/src/lib/providerConnection.ts` | provider 선택, OAuth polling, API key 저장, 연결 notice 결정 |
| provider profile display | `editor/src/lib/providerProfile.ts` | provider 표시 이름과 ready 판정의 프론트 상태 경계 |
| provider connection state | `editor/src/hooks/useProviderConnection.ts` | provider profile, 설정 sheet, 연결 중 상태와 UI handler |
| system diagnostics export | `editor/src/lib/systemDiagnostics.ts` | 앱 조립부의 진단 export API 호출 경계 |
| local runtime | `editor/src/lib/localRuntime.ts` | provider/server 미연결 시 셀 실행 결과와 출력/변수 추론 |
| notebook runtime | `editor/src/lib/notebookRuntime.ts` | 세션 생성, 셀 실행, reactive 노트북 실행, runtime package preflight 결정 |
| notebook runtime state hook | `editor/src/hooks/useNotebookRuntimeState.ts` | 세션, 변수, 실행 결과, 셀/노트북 실행 UI 상태 |
| code completion | `editor/src/lib/codeCompletion.ts` | 노트북 코드 자동완성 API 호출과 completion context payload 경계 |
| widget UI events | `editor/src/lib/widgetUiEvents.ts` | 위젯 callback을 kernel ui-event API와 reactive trigger 이벤트로 연결하는 경계 |
| workloop state | `editor/src/lib/workLoop.ts` | tool_start/tool_results와 response trace summary를 UI state, group label, payload text로 변환 |
| custom curricula | `editor/src/lib/customCurricula.ts` | 나만의 커리큘럼 저장/로드/선택 상태 적용 |
| custom curricula state hook | `editor/src/hooks/useCustomCurriculaState.ts` | 나만의 커리큘럼 저장소 persistence와 선택 상태 |
| curriculum progress | `editor/src/lib/curriculumProgress.ts` | 현재 학습 진행률 조회 API 경계 |
| curriculum selection | `editor/src/lib/curriculumSelection.ts` | 기본 커리큘럼 fallback, 콘텐츠/레슨 로딩, 선택 상태 |
| curriculum package preparation | `editor/src/lib/curriculumPackagePreparation.ts` | 현재 학습 dependency panel의 패키지 조회/설치 API 경계 |
| share pack operations | `editor/src/lib/sharePackOperations.ts` | 숨겨진 공유 팩 표면의 pack 조회/검사/설치/자동화 task API 경계 |
| curriculum library state hook | `editor/src/hooks/useCurriculumLibraryState.ts` | 커리큘럼 목록/레슨 로딩과 현재 학습 셀 선택 상태 |
| curriculum navigation state hook | `editor/src/hooks/useCurriculumNavigationState.ts` | 기본/나만의 커리큘럼 선택과 사이드바 검색/목록 상태 |
| automation state | `editor/src/lib/automationState.ts` | 자동화/태스크 상태 |
| automation state hook | `editor/src/hooks/useAutomationState.ts` | 자동화 snapshot refresh, 긴급 정지, 태스크 실행 UI 상태 |
| theme state hook | `editor/src/hooks/useThemeMode.ts` | theme local storage와 document class 동기화 |

## 원칙

- router는 판단하지 않는다. 판단 재료는 domain/provider loop 계층에서 만든다.
- UI 컴포넌트는 context를 직접 조립하지 않는다. `editor/src/lib/*`를 통한다.
- tool을 추가할 때는 `tools.py`의 schema, `toolManifest.py`의 노출 메타데이터, `toolHandlers/*`의 실행 위치를 같이 본다.
- 셀 어휘를 늘릴 때는 프론트/백엔드 셀 스키마와 문서 모델 영향까지 같이 본다.
- provider 응답 품질은 평가 harness로 판단한다. 감으로 좋고 나쁨을 말하지 않는다.
