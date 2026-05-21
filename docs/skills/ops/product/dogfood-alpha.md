---
id: dogfood-alpha
title: Dogfood Alpha 기준
description: Local alpha readiness standard for the first Codaro user flow.
category: ops
section: product
order: 331
purpose: 잘 만들어진 제품 품질 판단 전에 provider 연결부터 학습 생성, 셀 실행, 실패 복구까지 실제 사용 흐름을 증거로 확인한다.
whenToUse: local alpha, dogfood, provider 연결, 학습 생성, 셀 실행, 실패 복구, 제품 품질 판단을 다룰 때.
---

# Dogfood Alpha 기준

Codaro의 다음 기준은 기능을 더 붙였는지가 아니라 첫 사용자가 한 사이클을 끝까지 완주할 수 있는가다. 이 문서는 dogfood alpha 판단의 SSOT다. 잘 만들어진 제품 품질 판단은 이 기준과 gate 결과가 나온 뒤에만 하며, 판단은 감이 아니라 증거 기반으로 남긴다.

## 첫 사용자 플로우

아래 9단계는 audit에서 빠지면 안 된다.

1. 첫 실행: 사용자가 Codaro를 처음 실행하고 provider 연결 전 상태를 본다.
2. provider 연결: Provider 설정에서 `oauth-chatgpt` 또는 `openai`를 연결하고, 연결 전에는 fallback 안내만 보며 연결 후에는 실제 provider 응답을 쓴다.
3. 질문: 사용자가 "pandas 기초를 실습형으로 배우고 싶다" 같은 학습 요청을 보낸다.
4. clarification: 요청이 모호하면 provider 호출 전에 1-3개의 핵심 질문으로 멈춘다.
5. YAML 생성: 답변 후 structured learning YAML을 만들고 `write-curriculum-yaml`을 통과한다.
6. 학습카드 렌더링: YAML이 섹션 단위 학습카드로 열리고 overview diagram, 스니펫, 실습 셀, 결과/검증 영역이 보인다.
7. 실습 셀 입력: 학습자는 "클릭해서 직접 입력" 단계를 거치지 않고 바로 보이는 코드 editor에 입력한다.
8. 셀 실행: 실행 전 `packages-check`, 필요 시 `packages-install`, 이후 `cell-call` 순서로 실행한다.
9. 피드백과 실패 복구: 실행 결과와 검증/피드백을 보고, 실패하면 원인과 다음 행동을 사용자 문장으로 확인한다.

## 실패 복구 표면

실패 메시지는 raw error가 아니라 다음 계열로 분류한다.

- Provider/OAuth: 다시 로그인 필요, 권한 문제, 네트워크 문제, 호환성 점검, API 키 필요, Base URL 필요.
- 런타임: engine worker crash, 패키지 설치 지연, 셀 실행 실패, 검증 실패.
- 정책: provider가 `packages-check` 없이 `cell-call`을 요청하면 tool policy violation으로 차단하고 workloop에 남긴다.
- live provider: credential이 없으면 `live credential missing`으로 명확히 보고한다. skip으로 숨기지 않는다.

## 증거 기준

목표 완료 선언 전에는 아래 증거를 남긴다.

- `uv run python -X utf8 tests/run.py gate dogfood-alpha-audit`
- `uv run python -X utf8 tests/run.py gate product-quality-audit`
- `uv run python -X utf8 tests/run.py gate backend`
- `uv run python -X utf8 tests/run.py gate editor-build`
- `uv run python -X utf8 tests/run.py gate provider-settings-browser`
- `uv run python -X utf8 tests/run.py gate ai-live-smoke`
- `uv run python -X utf8 tests/run.py gate learning-card-contract`
- `uv run python -X utf8 tests/run.py gate learning-card-browser`
- `uv run python -X utf8 tests/run.py gate assistant-workloop-contract`
- `uv run python -X utf8 tests/run.py gate docs`
- `uv run python -X utf8 tests/run.py gate landing-build`

`ai-live-smoke`는 opt-in live gate다. credential/token/API key를 저장소에 남기지 않는다. credential이 없는 환경에서는 그 사실을 결과로 남기고, 실제 제품 품질 판단에는 credential이 있는 환경에서 다시 실행한 결과를 붙인다.

`provider-settings-browser`와 `learning-card-browser` 같은 브라우저 gate는 제품 표면 증거다. 로컬 구현이 통과해도 브라우저 gate가 실패하면 사용자가 완주할 수 있다고 말하지 않는다.

`dogfood-alpha-audit`는 `output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json`에 `gitHead`, `startedAt`, `completedAt`, `durationMs`, `status`, `summary`, `requirementFailures`를 남긴다. `quality-cycle`은 이 report의 fresh 여부와 `payloadGitHead`/`gitHeadMatches`를 대조해야 하며, report가 없거나 현재 커밋과 다르면 “첫 사용자 완주 경로가 검증됐다”고 말하지 않는다.

## 운영

- 별도 브랜치를 만들지 않고 main에서 로컬 작업한다.
- 변경은 논리 단위 커밋으로 남긴다.
- 한 사이클이 끝나면 main에 푸시한다.
- tmp 디렉터리는 검증 도구가 반드시 필요할 때만 쓰고, 불필요하게 만들지 않는다.
- 권한 질문으로 작업 흐름을 끊지 않는다. 권한이 있는 환경에서는 바로 실행하고, 실패하면 실패 원인을 결과로 남긴다.
- docs/skills가 dogfood alpha 운영 기준의 SSOT다. CLAUDE.md와 AGENTS.md는 포인터 역할만 한다.

## 관련 gate

`dogfood-alpha-audit`는 문서와 코드에 9단계 완주 경로, provider/OAuth 복구, live provider smoke, 학습카드 완주 UX, workloop/trace, 제품 품질 판단 gate가 연결되어 있는지 확인한다.

`learning-goal-audit`는 최종 묶음 gate다. `dogfood-alpha-audit`, `product-quality-audit`, 명시 요구사항 audit, readiness, backend, landing build를 한 번에 묶어 "부분 gate는 통과했지만 제품 품질 증거가 빠진" 상태를 막는다.
