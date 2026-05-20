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

## OAuth 흐름

1. Provider 설정에서 OAuth login을 시작한다.
2. `/api/oauth/authorize`가 auth URL과 state를 만들고 callback server를 연다.
3. Browser login 후 `/auth/callback`에서 state를 검증한다.
4. code exchange가 성공하면 token을 secret store에 저장하고 active provider를 `oauth-chatgpt`로 갱신한다.
5. 질문 turn은 `prepareTeacherRuntimeTurn` → provider → tool loop → trace/workloop 순서로 실행된다.

실패는 raw exception으로 끝내지 않는다.

- token 없음: `live credential missing` 또는 provider 로그인 필요.
- state mismatch: 보안 검증 실패로 표시.
- refresh 만료/재사용/폐기: 다시 로그인 필요.
- network timeout/connection: 네트워크 문제.
- endpoint/header/SSE 변경: OAuth provider compatibility 점검 필요.

HTTP/stream/UI 경계에는 `code`, `message`, `action`, `provider`, `detail`, `recoverable`을 가진 진단 payload를 넘긴다. 기본 화면은 `message`만 보여주고, raw detail은 trace나 확장 진단에서만 본다. editor는 `connect-provider`, `relogin-provider`, `restart-login`, `configure-api-key`, `configure-base-url`, `check-network`, `check-provider-compatibility` action을 구분해 설정 열기/재로그인/키 입력/base URL 입력/네트워크 점검/호환성 점검으로 안내한다.

Provider 설정의 검증은 `probe=availability`와 `probe=response`를 구분한다. 목록/상태 확인은 availability probe로 충분하지만, 로그인/저장/선택 직후와 사용자가 누르는 “응답 검증”은 response probe를 써서 짧은 실제 응답까지 확인한다. `openai`는 저장된 key 또는 `OPENAI_API_KEY`, `custom`은 base URL과 key, `ollama`는 로컬 서버와 모델 응답, `oauth-chatgpt`는 저장 token과 live endpoint 응답을 기준으로 실패 메시지를 갈라야 한다.

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

## 평가 기준

Live 응답은 deterministic하지 않으므로 exact text를 비교하지 않는다. 아래 구조와 행동을 본다.

- answer가 비어 있지 않다.
- teacher 답변이 과도하게 장황하지 않다.
- ambiguous learning request는 provider를 호출하지 않는다.
- concrete learning request는 답변만으로 끝나지 않고 `write-curriculum-yaml`을 호출하며, 그 YAML은 structured section card 계약을 통과해야 한다.
- executable cell request는 `packages-check → cell-call` exact sequence만 사용하고 policy violation 없이 executor까지 전달한다.
- tool loop가 실패하면 “prompt/tool schema tuning required”처럼 다음 조정 지점을 남긴다.
- provider/model/latency/error가 live smoke report에 남는다.

## 운영 원칙

- `ai-live-smoke`는 CI required gate가 아니다.
- live credential이 없는 환경에서 기본 CI와 preflight를 깨지 않는다.
- provider endpoint가 변할 수 있는 `oauth-chatgpt`는 experimental live provider로 취급한다.
- live gate 실패는 scripted provider gate 실패와 의미가 다르다. 제품 구조가 깨졌는지, credential/네트워크 문제인지, 외부 provider behavior 변화인지 구분해서 본다.
- 실제 계정으로 tool loop를 돌릴 때도 gate executor는 side effect를 최소화한다. package install과 cell execution은 live smoke에서는 simulated result로 막고, provider의 tool call 의도와 trace 품질을 먼저 본다.

## 관련 파일

- `tests/verifyAiLiveSmoke.py`
- `src/codaro/ai/providers/oauthChatgptProvider.py`
- `src/codaro/ai/oauthFlow.py`
- `src/codaro/ai/oauthToken.py`
- `src/codaro/ai/providerValidation.py`
- `src/codaro/ai/teacher/providerLoop.py`
- `editor/src/lib/providerConnection.ts`
- `editor/src/components/assistant/providerSettingsSheet.tsx`
