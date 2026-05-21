---
id: live-provider-ops
title: Live Provider Ops
description: 실제 provider, OAuth, live smoke 검증, credential 보안 경계를 정의한다.
category: architecture
section: ai
order: 209
purpose: scripted provider 평가를 넘어 실제 provider 연결과 실패 처리를 제품 경로에서 검증하게 한다.
whenToUse: OAuth, OpenAI/Ollama/custom provider, live smoke gate, provider 실패 UX, credential 보안 경계를 바꿀 때.
---

# Live Provider Ops

Codaro의 기본 gate는 deterministic scripted provider를 사용한다. 실제 provider는 네트워크, 계정, 토큰, 외부 endpoint 영향을 받으므로 CI 기본 경로에 넣지 않는다. 대신 사람이 명시적으로 실행하는 opt-in live gate로 제품 경로를 검증한다.

## Provider 범위

| Provider | 인증 | 용도 | 실패 경계 |
|---|---|---|---|
| `oauth-chatgpt` | ChatGPT OAuth token | 구독 기반 실제 응답과 native tool loop 확인 | token 없음, 만료, refresh 실패, endpoint/header/SSE 변경 |
| `openai` | API key 또는 `OPENAI_API_KEY` | OpenAI API key 기반 실제 응답 확인 | key 없음, 권한/과금/모델 오류, 네트워크 |
| `ollama` | 로컬 서버 | 오프라인/로컬 모델 smoke | 서버 미실행, 모델 미설치 |
| `custom` | OpenAI-compatible base URL + key | 사내/로컬 호환 endpoint | base URL/key 없음, schema 비호환 |

실제 token과 API key는 저장소에 남기지 않는다. gate output도 token 값을 출력하지 않는다.

`oauth-chatgpt`는 현재 tool call event는 native function call로 받을 수 있지만, Codaro가 쓰는 experimental endpoint는 `previous_response_id` 기반 tool-result continuation을 지원하지 않는다. 따라서 tool 결과는 `[tool_result id=...]` user text bridge로 되돌려 보내고, `packages-check` 같은 lifecycle 결과에는 `codaroToolPolicy.nextRequiredTool`과 사람이 읽을 수 있는 instruction을 함께 넣는다. 이렇게 해야 실제 provider가 `packages-check`를 반복 호출하지 않고 `packages-install` 또는 `cell-call`로 넘어간다. 이 경계는 `tests/testAiProvider.py`, `tests/testTeacherArchitecture.py`, `ai-live-smoke`가 같이 고정한다.

## OAuth 흐름

1. Provider 설정에서 OAuth login을 시작한다.
2. `/api/oauth/authorize`가 auth URL과 state를 만들고 callback server를 연다.
3. Browser login 후 `/auth/callback`에서 state를 검증한다.
4. code exchange가 성공하면 token을 secret store에 저장하고 active provider를 `oauth-chatgpt`로 갱신한다.
5. 질문 turn은 `prepareTeacherRuntimeTurn` → provider → tool loop → trace/workloop 순서로 실행된다.

`tests/testAiProvider.py`는 callback 성공 후 같은 profile/secret store로 teacher 질문을 준비해 `oauth-chatgpt` provider config가 생성되고 응답 payload가 반환되는 경로를 검증한다. live credential을 쓰는 외부 smoke와 별개로, OAuth login → callback → token 저장 → profile active provider 갱신 → 질문 준비/응답 경로의 제품 내부 연결은 이 테스트가 담당한다.

실패는 raw exception으로 끝내지 않는다.

- token 없음: `live credential missing` 또는 provider 로그인 필요.
- state mismatch: 보안 검증 실패로 표시.
- OAuth consent 거부: 권한 문제로 표시.
- refresh 만료/재사용/폐기: 다시 로그인 필요.
- network timeout/connection: 네트워크 문제.
- endpoint/header/SSE 변경: OAuth provider compatibility 점검 필요.

HTTP/stream/UI 경계에는 `code`, `message`, `action`, `provider`, `detail`, `recoverable`을 가진 진단 payload를 넘긴다. 기본 화면은 `message`만 보여주고, raw detail은 trace나 확장 진단에서만 본다. editor는 `connect-provider`, `relogin-provider`, `restart-login`, `configure-api-key`, `configure-base-url`, `check-permission`, `check-network`, `check-provider`, `check-provider-compatibility`, `retry-later` action을 구분해 설정 열기/재로그인/키 입력/base URL 입력/권한 확인/네트워크 점검/provider 상태 확인/호환성 점검/나중에 재시도로 안내한다.

질문 실행 중 발생하는 token refresh 실패도 callback 실패와 같은 기준으로 분류한다. refresh token이 만료/재사용/폐기되면 `relogin-provider`, refresh 요청이나 refresh 후 재시도 요청이 네트워크에서 실패하면 `check-network`, OAuth client/header/endpoint/SSE 변화가 의심되면 `check-provider-compatibility`를 남긴다. 이 구분은 provider 설정 UI뿐 아니라 chat/stream error와 workloop trace에서도 유지되어야 한다.

Chat/stream error 경계는 문자열 추측보다 `diagnostic.action`을 우선한다. `connect-provider`, `relogin-provider`, `restart-login`, `configure-api-key`, `configure-base-url`은 사용자를 Provider 설정으로 보낼 수 있지만, `check-network`나 `check-provider-compatibility`는 OAuth라는 단어가 있어도 로그인 필요로 바꾸지 않는다. `turn-error` workloop에는 provider, diagnostic code, diagnostic action을 함께 남겨 나중에 실제 질문 실패를 재현할 수 있어야 한다.

제품 질문 경로도 같은 계약을 따른다. `/api/ai/chat`은 provider 오류를 raw exception으로 올리지 않고 사용자 메시지와 trace/workloop로 반환한다. `/api/ai/chat/stream`은 `error` SSE event에 같은 `diagnostic` payload를 싣는다. OAuth refresh 만료는 두 경로 모두 `provider_relogin_required` + `relogin-provider`로 보여야 하며, 사용자에게 보이는 answer/error에는 `refresh_token` 같은 raw detail을 넣지 않는다.

Provider 설정의 검증은 `probe=availability`와 `probe=response`를 구분한다. 목록/상태 확인은 availability probe로 충분하지만, 로그인/저장/선택 직후와 사용자가 누르는 “응답 검증”은 response probe를 써서 짧은 실제 응답까지 확인한다. `openai`는 저장된 key 또는 `OPENAI_API_KEY`, `custom`은 base URL과 key, `ollama`는 로컬 서버와 모델 응답, `oauth-chatgpt`는 저장 token과 live endpoint 응답을 기준으로 실패 메시지를 갈라야 한다.

Provider 설정 UI는 검증 결과를 일회성 toast로만 처리하지 않는다. 로그인/저장/선택/응답 검증에서 나온 마지막 `ProviderValidationSnapshot`을 provider별로 보존하고 카드 안에 표시한다. OAuth login을 시작하면 callback/status polling 동안 카드가 “브라우저 로그인 대기” 상태로 바뀌어 사용자가 열린 로그인 탭을 완료해야 한다는 점을 보여준다. 연결 전에는 “기본 안내 모드”로 실제 응답을 쓰지 않는다는 점을 보여주고, 검증 통과 후에는 “실제 응답 사용 중” 또는 “응답 검증 완료”를 표시한다. 실패 시에는 `diagnostic.action`을 사람이 이해할 수 있는 조치로 바꾼다. 예: `connect-provider`/`relogin-provider`는 다시 로그인, `restart-login`은 로그인 다시 시작, `configure-api-key`는 API 키 입력, `configure-base-url`은 Base URL 입력, `check-permission`은 권한 문제, `check-network`는 네트워크 문제, `check-provider`는 provider 상태 확인, `check-provider-compatibility`는 OAuth 호환성 점검, `retry-later`는 잠시 후 재시도다. raw detail은 기본 UI에 노출하지 않는다. assistant/chat 경계도 diagnostic action을 우선한다. `OAuth`라는 단어가 들어 있더라도 action이 `check-provider-compatibility`, `check-permission`, `check-network`면 로그인 필요로 오분류하지 않는다.

`provider-settings-browser` gate는 실제 editor surface를 브라우저로 열고 stub provider API를 붙여 이 UI 계약을 확인한다. 검증 범위는 연결 전 fallback 표시, OAuth authorize/status polling의 pending 상태, state mismatch 실패, 권한 거부 실패, OAuth login 성공 후 실제 응답 상태, 저장된 provider 선택 후 실제 응답 상태, OAuth 호환성 실패, 네트워크 실패, base URL 실패 안내, 데스크톱/모바일 overflow 방지다. stub을 쓰므로 실제 token/API key는 필요하지 않으며 저장소에 남지 않는다.

## Live Smoke Gate

명령:

```bash
uv run python -X utf8 tests/run.py gate ai-live-smoke
```

환경 선택:

```bash
set CODARO_AI_LIVE_PROVIDER=oauth-chatgpt
set CODARO_AI_LIVE_MODEL=gpt-5.4
```

`CODARO_AI_LIVE_PROVIDER`가 없으면 현재 profile의 default provider를 쓴다. credential이 없으면 gate는 `live credential missing`을 JSON으로 출력하고 실패 코드로 끝난다. 이것은 skip이 아니다. live credential이 없다는 사실을 명확히 보고하는 상태다.

여러 provider를 한 번에 확인할 때는 matrix 환경을 명시한다.

```bash
set CODARO_AI_LIVE_PROVIDERS=oauth-chatgpt,openai,ollama,custom
uv run python -X utf8 tests/run.py gate ai-live-smoke
```

`CODARO_AI_LIVE_PROVIDERS=all`은 공개 provider 전체를 뜻한다. matrix 모드는 provider별 결과를 `providers[]`에 남기고 `summary.passed`, `summary.failed`, `summary.credentialMissing`를 함께 출력한다.

- 전체 통과: exit `0`, status `passed`.
- provider 실행 실패: exit `1`, status `failed`.
- 하나라도 credential이 없고 실행 실패는 없을 때: exit `2`, status `live credential missing` 또는 `partial credential missing`.

matrix에서 missing credential은 silent skip이 아니다. 사용자가 여러 provider를 명시했으면 어떤 provider가 준비되지 않았는지 보고서에 남겨야 한다.

현재 live smoke는 다음을 확인한다.

- provider availability.
- 짧은 일반 질문 응답.
- teacher system prompt를 통과한 질문 응답.
- 모호한 학습 요청이 provider 호출 전에 deterministic clarification gate에서 멈추는지.
- 구체적 학습 요청이 실제 provider 응답에서 `write-curriculum-yaml` tool call로 이어지고, provider가 보낸 YAML이 실제 materializer에서 섹션/스니펫/실습 셀과 `contractGapCount=0`으로 변환되는지.
- 실행 요청이 실제 provider 응답에서 `packages-check` 이후 `cell-call` tool call로 이어지는지.
- 응답 payload에 provider/model, case latency, tool sequence, workloop count, executor call summary가 남는지.
- `oauth-chatgpt` text bridge가 unsupported `previous_response_id`를 보내지 않고, `codaroToolPolicy` 힌트로 다음 tool을 명확히 전달하는지.

실행 결과는 stdout만 믿지 않는다. gate는 성공, 실패, credential missing, matrix partial 상태 모두 `output/test-runner/ai-live-smoke/live-smoke-report.json`에 같은 payload를 남긴다. 이 파일에는 provider/model, case별 latency, diagnostic action, tool sequence, tuning signal을 넣되 token/API key 값은 넣지 않는다.

## 평가 기준

Live 응답은 deterministic하지 않으므로 exact text를 비교하지 않는다. 아래 구조와 행동을 본다.

- answer가 비어 있지 않다.
- teacher 답변이 과도하게 장황하지 않다.
- ambiguous learning request는 provider를 호출하지 않는다.
- concrete learning request는 답변만으로 끝나지 않고 `write-curriculum-yaml`을 호출하며, 그 YAML은 structured section card 계약을 통과해야 한다.
- executable cell request는 `packages-check → cell-call` exact sequence만 사용하고 policy violation 없이 executor까지 전달한다.
- OAuth ChatGPT의 실행 요청은 `[tool_result id=...]` bridge와 `codaroToolPolicy.nextRequiredTool=cell-call` 힌트를 거쳐도 같은 exact sequence를 만족해야 한다.
- tool loop가 실패하면 “prompt/tool schema tuning required” 같은 문자열만 남기지 않는다. live smoke payload의 `signals`에 `failureReason`, `tuningRequired`, `expectedTools`, `observedTools`, `answerPreview`, `tuningHints`를 남겨 prompt, tool schema, parser 중 어디를 조정할지 판단할 수 있어야 한다.
- provider/model/latency/error가 live smoke report에 남는다.

## 운영 원칙

- `ai-live-smoke`는 CI required gate가 아니다.
- live credential이 없는 환경에서 기본 CI와 preflight를 깨지 않는다.
- provider endpoint가 변할 수 있는 `oauth-chatgpt`는 experimental live provider로 취급한다.
- live gate 실패는 scripted provider gate 실패와 의미가 다르다. 제품 구조가 깨졌는지, credential/네트워크 문제인지, 외부 provider behavior 변화인지 구분해서 본다.
- `ai-live-smoke`의 credential missing과 provider exception은 `liveCredentialDiagnostic`/`liveProviderExceptionDiagnostic`을 거쳐 기존 provider diagnostic 계약으로 남긴다. payload에는 `diagnostic.code`, `diagnostic.action`, 사용자 메시지, recoverable 여부가 들어가야 하며, case `signals`에는 `diagnosticCode`와 `diagnosticAction`을 남긴다. 운영자는 raw exception 문자열보다 이 action을 먼저 보고 다시 로그인, API 키 입력, Base URL 입력, 네트워크 점검, OAuth 호환성 점검을 구분한다.
- 실제 계정으로 tool loop를 돌릴 때도 gate executor는 side effect를 최소화한다. package install과 cell execution은 live smoke에서는 simulated result로 막고, provider의 tool call 의도와 trace 품질을 먼저 본다.

## 관련 파일

- `tests/verifyAiLiveSmoke.py`
- `tests/verifyProviderSettingsPlaywright.py`
- `src/codaro/ai/providers/oauthChatgptProvider.py`
- `src/codaro/ai/oauthFlow.py`
- `src/codaro/ai/oauthToken.py`
- `src/codaro/ai/providerValidation.py`
- `src/codaro/ai/teacher/providerLoop.py`
- `tests/testAiProvider.py`
- `editor/src/lib/providerConnection.ts`
- `editor/src/components/assistant/providerSettingsSheet.tsx`
- `tests/testProviderSettingsContract.py`
