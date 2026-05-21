---
id: product-quality
title: 제품 품질 기준
description: Product quality proof contract for Codaro.
category: ops
section: product
order: 322
purpose: Codaro가 잘 만들어진 로컬 제품인지 판단하기 위한 제품 내구성, 설치, runtime, provider, 학습, 운영 gate를 한곳에 고정한다.
whenToUse: 제품 품질 판단, 설치/실행/복구, provider 반복 사용, runtime recovery, frontend performance 판단을 다룰 때.
---

# 제품 품질 기준

Codaro의 목표는 출시 딱지를 붙이는 것이 아니라 실제로 잘 만들어진 로컬 제품이 되는 것이다. 이 문서의 기준 id는 `product-quality`다. 파일 경로의 `service-candidate` 이름은 기존 문서 링크를 유지하기 위한 legacy path일 뿐이다. 실제 사용자가 설치/실행/연결/질문/학습/셀 실행/오류 복구를 반복해도 상태가 꼬이지 않고, 실패가 생겨도 다음 행동을 알 수 있는지가 기준이다.

`dogfood-alpha`가 첫 완주 경로를 고정한다면, 이 문서는 반복 사용 내구성과 잘 만들어진 제품 품질 판단 gate를 고정한다. 완료 선언은 감으로 하지 않는다. 아래 gate와 audit payload가 증거다.

## 판단 원칙

- 덕지덕지 기능 추가보다 기존 경계 정리를 우선한다.
- provider state, pending clarification, tool result, runtime result, frontend state를 중복 SSOT로 만들지 않는다.
- OAuth token, API key, secret은 저장소, gate output, diagnostic summary에 남기지 않는다.
- 임시 우회나 문자열만 맞추는 green test는 실패로 본다.
- `CLAUDE.md`와 `AGENTS.md`는 포인터다. 제품/운영 SSOT는 `docs/skills`에 둔다.
- 별도 브랜치 없이 main에서 논리 단위 커밋 후 푸시한다.

## 반복 사용 내구성

한 번 성공한 경로가 아니라 여러 턴, 여러 레슨, 여러 셀 실행을 기준으로 본다.

- provider 연결 후 여러 질문을 보내도 stale provider status가 섞이지 않는다.
- 모호한 요청에서 생긴 pending clarification은 이어지는 답변에서 한 번만 소비되고, 새 요청에서는 비워진다.
- 실패한 tool result가 다음 요청의 성공 경로에 섞이지 않는다.
- provider/model/latency/error/tool sequence/workloop trace가 turn 단위로 남는다.
- provider 오류는 `다시 로그인 필요`, `네트워크 문제`, `권한 문제`, `OAuth 호환성 점검`, `API 키 필요`, `Base URL 필요`로 구분한다.

## 설치/실행/런처

첫 실행 전에 사용자가 환경을 추측하게 만들지 않는다.

- launcher doctor는 active release, last-known-good, crash state, rollback marker, Python/runtime hint를 보여준다.
- backend는 health check를 통과한 뒤에만 사용 가능 상태가 된다.
- health timeout은 raw stack이 아니라 `HEALTH_TIMEOUT`과 다음 행동으로 표시한다.
- update/apply는 staged release를 health probe로 검증한 뒤 active release를 바꾼다.
- package artifact는 manifest exact wheel, sha256, launcher-managed bundle 기준을 따른다.

## Runtime 복구

runtime failure는 한 덩어리 오류가 아니다.

- engine worker crash는 worker 재시작 메시지로 구분한다.
- kernel/session failure와 cell execution failure를 구분한다.
- package install delay/failure는 `packages-check → packages-install → cell-call` 순서 안에서 보여준다.
- 설치 결과는 `installer: uv`, `environment: project .venv`, `durationMs`, `skipped`를 보존한다.
- 학습 화면의 라이브러리 패널은 설치 중인 패키지와 `N/M` 진행 단계를 보여준다. 설치가 오래 걸릴 때도 사용자는 어떤 패키지가 `uv`로 준비 중인지 알아야 한다.
- 셀 근처에는 “왜 실패했는지 / 무엇을 고쳐야 하는지 / 다시 실행 가능한지”가 보여야 한다.

## Provider/Teacher Loop

scripted provider만 통과하는 상태는 제품 품질 기준을 만족하지 못한다.

- `ai-live-smoke`는 실제 provider credential이 있는 환경에서 짧은 일반 질문, teacher 질문, clarification gate, YAML tool loop, cell-call loop를 확인하고 `output/test-runner/ai-live-smoke/live-smoke-report.json`에 provider/model, latency, diagnostic action, tool sequence, workloop readable samples, tuning signal, `gitHead`, `startedAt`, `completedAt`, `durationMs`를 남긴다.
- 모호한 학습 요청은 provider 호출 전에 clarification gate에서 멈춘다.
- 구체적인 학습 요청은 structured YAML 생성과 tool loop로 이어진다.
- 실제 provider가 tool call을 하지 않으면 실패 이유와 prompt/tool schema 개선 포인트를 남긴다.
- trace에는 provider, model, latency, error, tool sequence가 남는다.
- live gate 실패 payload에는 `diagnostic.code`와 `diagnostic.action`이 남아야 한다. credential missing, 다시 로그인, 네트워크 문제, 권한 문제, OAuth 호환성 점검, API 키 필요, Base URL 필요를 같은 provider diagnostic 계약으로 구분한다.

## 학습 품질 Matrix

한 가지 pandas 데모만 통과하면 충분하지 않다. 최소 대표 주제를 matrix로 확인한다.

- Python 기초
- 파일 처리
- 데이터 분석
- 시각화
- 웹 자동화

각 주제는 structured YAML 계약을 지키고, 섹션 하나당 카드 하나 원칙을 유지한다. 섹션은 `title`, `subtitle`, `goal`, `why`, `explanation`, `tips`, `snippet`, `exercise`, `result`, `check` 흐름을 가진다.

## 온보딩/첫 화면

첫 화면은 사용자가 무엇을 먼저 해야 하는지 보여야 한다.

- provider 연결 전에는 fallback 안내와 Provider 연결 행동이 보인다.
- provider 연결 전에는 실제 provider 응답을 쓰는 것처럼 보이면 안 된다.
- provider 연결 후에는 실제 응답 사용 상태가 분명해야 한다.
- 기본 curriculum, AI 생성 curriculum, 나만의 curriculum의 차이를 자연스럽게 구분한다.
- 첫 레슨 생성부터 실행까지 UI가 한 흐름으로 이어진다.

## Frontend 성능

제품 표면 기준으로 검증한다. landing page만 빠른 상태는 충분하지 않다.

- editor build의 큰 bundle 경고는 baseline 없이 방치하지 않는다.
- Monaco/CodeMirror, provider/settings, learning surface, 일반 vendor를 한 chunk에 몰아넣지 않는다. React와 일반 vendor를 억지로 나눠 순환 chunk를 만들지 않는다.
- 기본 커리큘럼 YAML 원문은 bootstrap bundle에 싣지 않는다. 목록은 경량 registry로 만들고, 레슨 YAML은 선택한 레슨을 열 때 lazy loading한다.
- 공개 문서 surface도 generated docs 본문 HTML을 nav chunk에 싣지 않는다. 문서 목록은 metadata만 들고, 본문은 `docsPages/page*.js`로 분리해 slug route에서 필요한 문서만 로딩한다.
- `frontend-performance-budget`는 chunk count, 가장 큰 JS chunk, entry JS chunk, 전체 JS/CSS 크기, curriculum lazy loading 계약을 확인한다.
- 현재 제품 품질 budget은 가장 큰 JS chunk 400KB 이하, entry JS chunk 300KB 이하, 전체 JS 7.5MB 이하, CSS 160KB 이하로 둔다.
- desktop/mobile에서 텍스트, 버튼, 카드, TOC, popover가 겹치지 않아야 한다.
- `landing-build`는 `docs/skills` 핵심 SSOT 문구가 generated docs에 반영된 상태인지도 확인한다.

## Diagnostic

문제가 생겼을 때 사용자는 raw JSON을 먼저 보지 않아야 한다.

- local diagnostic summary는 provider failure, runtime failure, package failure, frontend failure를 분리한다.
- summary payload는 `provider`, `runtime`, `package`, `frontend` category count와 다음 action을 가진다.
- summary payload는 운영자가 바로 읽을 수 있는 `summaryText`와 사용자 조치 문구인 `readableActions`도 가져야 한다.
- `/api/system/diagnostics`는 provider 연결 상태, uv/project `.venv`, runtime status, editor build 산출물을 같은 summary payload로 반환한다.
- 부트스트랩은 `/api/system/diagnostics`를 읽어 시작 진단 안내를 제품 상단 상태로 보여준다. 사용자는 Provider 연결 필요, uv 설치 필요, `.venv` 준비 필요, Editor 빌드 필요를 첫 화면에서 사람 문장으로 본다.
- raw JSON은 확장 진단으로만 본다.
- token/API key/secret은 diagnostic summary와 로그에 남기지 않는다.
- 문제 재현에는 provider/model/latency/error/tool sequence/workloop trace가 충분해야 한다.
- gate 실행은 `tests/run.py`가 repo-local `output/test-runner/<gate>/` 아래로 실행 작업공간을 격리하고, uv/pytest cache는 비활성화하며, pytest basetemp, cargo target, scratch env를 고정해 사용자 홈 권한이나 기존 build lock과 충돌하지 않게 한다.
- 브라우저 gate 직접 실행도 repo-local `output/test-runner/<verifier>/scratch/playwright` 아래에서 Playwright daemon/session 파일을 만든다. OS temp에 임의 디렉터리를 만들지 않고, 외부 Playwright session env가 남아 있어도 wrapper가 repo-local workspace로 덮어쓴다.

## Gate

제품 품질 판단은 아래 gate 조합으로 한다. 수동으로 일부만 골라 실행하지 말고 같은 순서를 고정한 `quality-cycle`을 우선 사용한다. runner는 `output/test-runner/quality-cycle/sequence-summary.json`에 현재 `gitHead`, `startedAt`/`completedAt`, gate별 duration, return code, `softFailureCount`, artifact freshness를 남겨 어떤 커밋에서 어떤 증거가 나온 것인지 확인할 수 있게 한다. `ai-live-smoke` credential missing exit code 2는 `softFailure: true`로 남기고 다음 gate를 계속 실행한다. 실제 provider 실패 exit code 1은 hard failure로 처리해 quality-cycle을 중단한다.

```bash
uv run python -X utf8 tests/run.py quality-cycle
uv run python -X utf8 tests/run.py gate docs
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate learning-system-readiness
uv run python -X utf8 tests/run.py gate dogfood-alpha-audit
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/run.py gate diagnostic-summary-contract
uv run python -X utf8 tests/run.py gate ai-live-smoke
uv run python -X utf8 tests/run.py gate provider-settings-browser
uv run python -X utf8 tests/run.py gate install-launcher-smoke
uv run python -X utf8 tests/run.py gate runtime-recovery-contract
uv run python -X utf8 tests/run.py gate runtime-recovery-browser
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate onboarding-browser
uv run python -X utf8 tests/run.py gate frontend-performance-budget
uv run python -X utf8 tests/run.py gate landing-build
uv run python -X utf8 tests/run.py gate launcher-test
```

`diagnostic-summary-contract`는 local diagnostic summary의 category/action/redaction 계약을 고정한다. `editor-build`와 `launcher-check`는 집중 확인 gate로 유지한다. `quality-cycle`에서는 editor build 증거를 `learning-system-readiness`의 `learning-card-contract` probe와 `frontend-performance-budget`로 보고, launcher check 증거를 `install-launcher-smoke`와 `launcher-test`로 본다. `teacher-eval`, `teacher-e2e`, `assistant-workloop-contract`, `editor-runtime-preflight`, `learning-card-contract`, `learning-card-browser`는 `learning-system-readiness`의 blocking probe로 실행된다.

## 완료 판단

목표 완료 선언은 “잘 만들어졌다”는 품질 판단을 증명해야 한다. `quality-cycle`, `product-quality-audit`, 개별 gate 결과가 있어야 하며, live provider credential이 없는 환경에서는 `ai-live-smoke`의 `live credential missing`과 quality-cycle `softFailureCount`를 증거로 남기되, 실제 provider 품질 판단은 credential이 있는 환경에서 다시 실행한 결과를 붙인다. `service-readiness-audit`는 이전 자동화를 위한 호환 alias일 뿐 완료 기준의 이름으로 쓰지 않는다.
