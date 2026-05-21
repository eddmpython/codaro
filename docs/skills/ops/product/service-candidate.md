---
id: service-candidate
title: Service Candidate 기준
description: Private beta/service-ready candidate readiness contract for Codaro.
category: ops
section: product
order: 322
purpose: local dogfood alpha 이후 Codaro를 private beta 후보로 판단하기 위한 제품 내구성, 설치, runtime, provider, 학습, 운영 gate를 한곳에 고정한다.
whenToUse: private beta, service-ready candidate, 설치/실행/복구, provider 반복 사용, runtime recovery, frontend performance 판단을 다룰 때.
---

# Service Candidate 기준

Codaro의 service-ready candidate 기준은 새 기능 개수가 아니다. 실제 사용자가 설치/실행/연결/질문/학습/셀 실행/오류 복구를 반복해도 상태가 꼬이지 않고, 실패가 생겨도 다음 행동을 알 수 있는지가 기준이다.

`dogfood-alpha`가 첫 완주 경로를 고정한다면, 이 문서는 반복 사용 내구성과 private beta 판단 gate를 고정한다. 완료 선언은 감으로 하지 않는다. 아래 gate와 audit payload가 증거다.

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
- 셀 근처에는 “왜 실패했는지 / 무엇을 고쳐야 하는지 / 다시 실행 가능한지”가 보여야 한다.

## Provider/Teacher Loop

scripted provider만 통과하는 상태는 service-ready가 아니다.

- `ai-live-smoke`는 실제 provider credential이 있는 환경에서 짧은 일반 질문, teacher 질문, clarification gate, YAML tool loop, cell-call loop를 확인한다.
- 모호한 학습 요청은 provider 호출 전에 clarification gate에서 멈춘다.
- 구체적인 학습 요청은 structured YAML 생성과 tool loop로 이어진다.
- 실제 provider가 tool call을 하지 않으면 실패 이유와 prompt/tool schema 개선 포인트를 남긴다.
- trace에는 provider, model, latency, error, tool sequence가 남는다.

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
- Monaco/CodeMirror, provider/settings, learning surface, 일반 vendor를 한 chunk에 몰아넣지 않는다.
- `frontend-performance-budget`는 chunk count, 가장 큰 JS chunk, 전체 JS/CSS 크기를 확인한다.
- 현재 service candidate baseline은 가장 큰 JS chunk 6MB 이하, 전체 JS 7.5MB 이하, CSS 160KB 이하로 둔다. 이 baseline은 합격 선언이 아니라 lazy loading/code splitting으로 더 낮출 기준선이다.
- desktop/mobile에서 텍스트, 버튼, 카드, TOC, popover가 겹치지 않아야 한다.

## Diagnostic

문제가 생겼을 때 사용자는 raw JSON을 먼저 보지 않아야 한다.

- local diagnostic summary는 provider failure, runtime failure, package failure, frontend failure를 분리한다.
- raw JSON은 확장 진단으로만 본다.
- token/API key/secret은 diagnostic summary와 로그에 남기지 않는다.
- 문제 재현에는 provider/model/latency/error/tool sequence/workloop trace가 충분해야 한다.

## Gate

Service candidate 판단은 아래 gate 조합으로 한다.

```bash
uv run python -X utf8 tests/run.py gate service-readiness-audit
uv run python -X utf8 tests/run.py gate install-launcher-smoke
uv run python -X utf8 tests/run.py gate runtime-recovery-contract
uv run python -X utf8 tests/run.py gate runtime-recovery-browser
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate onboarding-browser
uv run python -X utf8 tests/run.py gate frontend-performance-budget
```

기존 `backend`, `editor-build`, `landing-build`, `launcher-check`, `launcher-test`, `provider-settings-browser`, `ai-live-smoke`, `learning-card-contract`, `learning-card-browser`, `assistant-workloop-contract`, `dogfood-alpha-audit`, `learning-system-readiness`, `learning-goal-audit`, `docs` gate도 유지한다.

## 완료 판단

목표 완료 선언은 `service-readiness-audit` 결과와 개별 gate 결과가 있어야 한다. live provider credential이 없는 환경에서는 `ai-live-smoke`의 `live credential missing`을 증거로 남기되, service-ready 판단은 credential이 있는 환경에서 다시 실행한 결과를 붙인다.
