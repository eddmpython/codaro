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
| 제품 표면 | `docs/skills/architecture/frontend-product-surface.md` | 채팅, 에디터, 커리큘럼, 자동화의 의미와 UX 경계 |
| 표면 라우팅 | `editor/src/lib/surfaceModel.ts` | 프론트 surface enum과 표시 이름 |
| 표면 route state | `editor/src/hooks/useSurfaceRoute.ts` | URL hash와 surface state 동기화 |
| 표면 조립 | `editor/src/components/app/mainSurface.tsx` | surface별 화면 조립 |

## Cell Schema

| 기준 | 파일 | 역할 |
|---|---|---|
| 프론트 셀 스키마 | `editor/src/lib/cellSchema.ts` | `blockTypes`, `cellRoles`, `executionKinds`, `cellDisplayKinds` |
| 백엔드 셀 스키마 | `src/codaro/document/cellSchema.py` | 같은 셀 어휘의 Python 기준 |
| 문서 모델 | `src/codaro/document/models.py` | 실제 document/block 저장 모델 |
| 프론트 문서 조작 | `editor/src/lib/documentModel.ts` | draft 생성, block 병합, payload 정규화 |
| 셀 해석 | `editor/src/lib/cellModel.ts` | 셀 라벨, 분류, 셀별 요청 prompt |

## Teacher Loop

| 기준 | 파일 | 역할 |
|---|---|---|
| loop 절차 문서 | `docs/skills/architecture/teacher-tool-loop.md` | 요청 분류, cell map, dependency preflight, tool lifecycle 원칙 |
| turn session | `src/codaro/ai/teacher/turnSession.py` | conversation, provider, messages, tools를 한 turn 실행 단위로 준비 |
| orchestrator | `src/codaro/ai/teacher/teacherOrchestrator.py` | context, policy, trace, tool payload를 묶는 진입점 |
| provider loop | `src/codaro/ai/teacher/providerLoop.py` | provider tool call과 turn 완료 payload를 conversation, policy, executor, trace에 반영 |
| provider stream | `src/codaro/ai/teacher/providerStream.py` | streaming token과 tool lifecycle event를 생성하되 완료 payload는 provider loop 기준을 공유 |
| context builder | `src/codaro/ai/teacher/contextBuilder.py` | provider에 들어가는 context text 구성 |
| tool policy | `src/codaro/ai/teacher/toolPolicy.py` | packages-check 선행, 실행 전 preflight 같은 강제 규칙 |
| trace model | `src/codaro/ai/teacher/traceModel.py` | turn/tool lifecycle, tool sequence, summary 추적 |
| skill registry | `src/codaro/ai/teacher/skillRegistry.py` | provider가 따라야 할 작업별 skill 목록과 required tool 계약 |
| eval harness | `src/codaro/ai/teacher/evalHarness.py` | response trace payload와 tool sequence golden case |

## Tool System

| 기준 | 파일 | 역할 |
|---|---|---|
| tool 진입점 | `src/codaro/ai/tools.py` | 기본 tool 목록, 등록 순서, 하위 호환 export |
| tool 정의 모듈 | `src/codaro/ai/toolDefinitions/` | 제품 경계별 기본 tool 이름, description, parameter schema |
| tool 계약 검증 | `src/codaro/ai/toolContract.py` | 기본 tool 정의, manifest metadata, handler 연결성 검증 |
| registry | `src/codaro/ai/toolRegistry.py` | `ToolDef`와 register/get/schema 변환 |
| manifest | `src/codaro/ai/toolManifest.py` | tool별 category, lane, target, risk 단일 메타데이터와 표시 그룹 |
| dispatch | `src/codaro/ai/toolExecutor.py` | session/document 공통 접근과 handler dispatch |
| workbench handlers | `src/codaro/ai/toolHandlers/workbench.py` | 셀 읽기/쓰기, curriculum YAML 전개 |
| runtime handlers | `src/codaro/ai/toolHandlers/runtime.py` | 실행, 변수, 패키지, 검증 |
| learning handlers | `src/codaro/ai/toolHandlers/learning.py` | 학습 카드, 퀴즈, 노트북 생성 |
| automation handlers | `src/codaro/ai/toolHandlers/automation.py` | 화면 인식, 입력, 녹화, 자동화 실행, 알림 |

## Transport Boundary

| 기준 | 파일 | 역할 |
|---|---|---|
| provider HTTP/SSE | `src/codaro/api/aiRouter.py` | request parsing, provider 호출, SSE 전송만 담당 |
| frontend API | `editor/src/lib/api.ts` | 제품 표면에서 server와 통신하는 유일한 통로 |

## Frontend State Boundary

| 기준 | 파일 | 역할 |
|---|---|---|
| assistant context | `editor/src/lib/assistantContext.ts` | provider 요청에 들어가는 document/cell/dependency/tool context |
| assistant message state | `editor/src/lib/assistantConversationState.ts` | stream event와 response를 assistant message state로 변환 |
| assistant provider turn | `editor/src/lib/assistantProviderTurn.ts` | provider stream 호출과 stream event를 message state에 연결 |
| assistant response plan | `editor/src/lib/assistantResponsePlan.ts` | provider 응답과 tool 결과를 에디터 적용, pending blocks, 나만의 커리큘럼 저장 계획으로 변환 |
| assistant turn state hook | `editor/src/hooks/useAssistantTurnState.ts` | 대화 prompt/message/conversation 상태와 provider/local turn 실행 UI 상태 |
| pending changes | `editor/src/lib/pendingChanges.ts` | 생성된 셀 대기분을 노트북/커리큘럼에 적용하거나 버리는 정책 |
| pending changes state hook | `editor/src/hooks/usePendingChangesState.ts` | 생성된 셀 대기분 상태와 적용/버리기 UI handler |
| local fallback | `editor/src/lib/localFallback.ts` | provider 미연결 시 기본 안내, 로컬 커리큘럼 초안, 로컬 실행 결과 |
| app bootstrap | `editor/src/lib/appBootstrap.ts` | 앱 시작 시 health, bootstrap, 기본 커리큘럼, provider profile, session 초기 상태 |
| app bootstrap effect hook | `editor/src/hooks/useAppBootstrapEffect.ts` | 앱 시작 결과를 surface state, provider, curriculum, automation state에 적용 |
| notebook document state hook | `editor/src/hooks/useNotebookDocumentState.ts` | 편집기 document, draft, 선택 셀, 셀 추가/적용 상태 |
| provider connection | `editor/src/lib/providerConnection.ts` | provider 선택, OAuth polling, API key 저장, 연결 notice 결정 |
| provider connection state | `editor/src/hooks/useProviderConnection.ts` | provider profile, 설정 sheet, 연결 중 상태와 UI handler |
| notebook runtime | `editor/src/lib/notebookRuntime.ts` | 세션 생성, 셀 실행, reactive 노트북 실행, 로컬 실행 결과 결정 |
| notebook runtime state hook | `editor/src/hooks/useNotebookRuntimeState.ts` | 세션, 변수, 실행 결과, 셀/노트북 실행 UI 상태 |
| workloop state | `editor/src/lib/workLoop.ts` | tool_start/tool_results와 trace metadata를 UI step으로 변환 |
| custom curricula | `editor/src/lib/customCurricula.ts` | 나만의 커리큘럼 저장/로드/선택 상태 적용 |
| custom curricula state hook | `editor/src/hooks/useCustomCurriculaState.ts` | 나만의 커리큘럼 저장소 persistence와 선택 상태 |
| curriculum selection | `editor/src/lib/curriculumSelection.ts` | 기본 커리큘럼 fallback, 콘텐츠/레슨 로딩, 선택 상태 |
| curriculum library state hook | `editor/src/hooks/useCurriculumLibraryState.ts` | 커리큘럼 목록/레슨 로딩과 현재 학습 셀 선택 상태 |
| automation state | `editor/src/lib/automationState.ts` | 자동화/태스크 상태 |
| automation state hook | `editor/src/hooks/useAutomationState.ts` | 자동화 snapshot refresh, 긴급 정지, 태스크 실행 UI 상태 |
| theme state hook | `editor/src/hooks/useThemeMode.ts` | theme local storage와 document class 동기화 |

## 원칙

- router는 판단하지 않는다. 판단 재료는 domain/provider loop 계층에서 만든다.
- UI 컴포넌트는 context를 직접 조립하지 않는다. `editor/src/lib/*`를 통한다.
- tool을 추가할 때는 `tools.py`의 schema, `toolManifest.py`의 노출 메타데이터, `toolHandlers/*`의 실행 위치를 같이 본다.
- 셀 어휘를 늘릴 때는 프론트/백엔드 셀 스키마와 문서 모델 영향까지 같이 본다.
- provider 응답 품질은 평가 harness로 판단한다. 감으로 좋고 나쁨을 말하지 않는다.
