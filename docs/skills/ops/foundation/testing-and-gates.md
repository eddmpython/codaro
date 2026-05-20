---
id: testing-and-gates
title: 테스트 단위 + Gate 운영
description: Test gate policy for Codaro local verification and CI.
category: ops
section: foundation
order: 304
purpose: 테스트를 단순 통과 여부가 아니라 다음 변경이 제품 경계와 teacher 계약을 깨면 자동 fail 하는 운영 단위로 관리한다.
whenToUse: 테스트 추가, CI 변경, teacher/tool/eval 계약 변경, 릴리즈 전 검증 명령을 고를 때.
---

# 테스트 단위 + Gate 운영

테스트의 기준은 "지금 통과하는가"가 아니라 "다음 변경이 이 동작과 경계를 깨면 자동으로 fail 하는가"다. 새 테스트는 어떤 실패 표면을 막는지 분명해야 한다.

## 단위

- **Gate**: 사람이 실행하고 CI가 호출하는 이름 붙은 검증 단위. source of truth는 `tests/run.py`다.
- **Suite**: gate 안에서 실행되는 pytest, npm, cargo 같은 도구별 묶음.
- **Targeted test**: 특정 계약을 빠르게 확인하는 파일/케이스 단위. 예: `teacher-eval`.
- **Contract fixture**: tool sequence, trace payload, schema처럼 결과 모양을 고정하는 입력/출력 자료.

## 명령

```bash
uv run python -X utf8 tests/run.py list
uv run python -X utf8 tests/run.py preflight
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate teacher-eval
uv run python -X utf8 tests/run.py gate teacher-e2e
uv run python -X utf8 tests/run.py gate assistant-workloop-contract
uv run python -X utf8 tests/run.py gate editor-runtime-preflight
uv run python -X utf8 tests/run.py gate learning-system-readiness
uv run python -X utf8 tests/run.py gate learning-goal-audit
uv run python -X utf8 tests/run.py gate learning-card-contract
uv run python -X utf8 tests/run.py gate learning-card-browser
```

직접 `pytest tests/ -v`를 금지하지는 않는다. 다만 PR 전 확인, CI, 세션 종료 검증은 gate 이름으로 남긴다.

## Gate 목록

| Gate | Tier | 역할 |
| --- | --- | --- |
| `docs` | fast | 운영 문서 포인터, gate 정의, CI 연결 상태를 확인한다. |
| `backend` | fast | Python backend 전체 테스트를 실행한다. |
| `teacher-eval` | fast | teacher tool policy, trace, golden eval 계약을 빠르게 확인한다. |
| `teacher-e2e` | fast | scripted provider loop, provider error workloop, tool policy, 실제 curriculum YAML handler를 통과하는 golden e2e harness와 9점 기준 score를 실행한다. |
| `assistant-workloop-contract` | fast | assistant workloop/trace UI state가 작업 전 확인 질문, provider 오류, tool detail을 보존하는지 확인한다. |
| `editor-runtime-preflight` | fast | editor 직접 실행 경로가 패키지 확인, uv 설치, 셀 실행 순서를 지키는지 확인한다. |
| `learning-system-readiness` | fast | 학습 YAML, 섹션 카드, teacher loop, workloop, gate SSOT의 readiness score를 확인한다. |
| `learning-goal-audit` | surface | 목표 완료 전 docs, readiness, backend, landing build를 묶어 확인한다. |
| `learning-card-contract` | surface | structured section card marker 계약과 editor build를 확인한다. |
| `learning-card-browser` | surface | Playwright CLI로 lesson overview와 structured section card의 desktop/mobile 렌더링을 확인한다. |
| `editor-build` | surface | 제품 editor surface의 TypeScript/Vite build를 확인한다. |
| `landing-build` | surface | 문서/landing surface의 static build를 확인한다. |
| `launcher-check` | release | launcher Rust crate의 type/build 계약을 확인한다. |
| `launcher-test` | release | launcher Rust crate 테스트를 직렬 실행한다. |

`preflight`는 로컬 기본 확인이며 현재 `docs`와 `backend`를 실행한다. `backend`가 전체 pytest를 포함하므로 `teacher-eval`과 `teacher-e2e`는 빠른 집중 확인용으로 둔다.

## 추가 규칙

- 새 gate는 `tests/run.py`, 이 문서, CI 중 필요한 위치를 함께 갱신한다.
- 새 pytest 파일은 가능한 한 제품/도메인 경계를 드러내는 이름을 쓴다.
- teacher/tool 변경은 최소한 tool sequence, policy violation, workloop label/detail, structured YAML contract, provider loop result signal 중 변경 표면 하나를 고정한다.
- provider loop 변경은 가능한 한 실제 scripted provider run으로 `packages-check` → `packages-install` → `cell-call`의 정확한 순서와 결과 필드(`missing`, `success`, `passed`)를 함께 검증한다. 다음 provider 호출에 직전 `role: tool` 결과 메시지가 들어갔는지도 확인한다. golden case가 요구하는 exact sequence에 불필요한 tool call이 끼거나 provider가 tool result를 보지 못하면 실패해야 한다.
- editor runtime 실행 변경은 `editor-runtime-preflight`로 세션 패키지 확인, 누락 패키지 uv 설치, kernel 실행 순서가 지켜지는지 확인한다.
- provider loop, clarification, curriculum materializer를 함께 건드린 변경은 `teacher-e2e`로 실제 turn payload와 teacher golden e2e score를 확인한다.
- workloop/trace 표시 변경은 `assistant-workloop-contract`로 clarification 작업 기준, provider 오류 detail+error, packages-check/install/cell-call 표시 문장과 패키지 설치 result detail(`installer`, `environment`, `durationMs`, `skipped`)을 함께 확인한다.
- clarification gate 변경은 실제 provider 호출 없이 멈추는 golden provider run을 검증한다. `toolSequence`가 비어 있고, 질문 수 1-3개와 작업 기준 key, workloop label이 빠지면 실패해야 한다. 이어지는 `진행` 또는 짧은 조건 답변 턴은 `pendingClarification.assumptions`를 provider prompt의 `[Clarification plan]`으로 주입하고 한 번 소비하는지 확인한다. 반대로 `취소`, `새로`, `다른 주제` 같은 새 요청과 이미 구체적인 새 학습 요청에는 stale pending이 섞이지 않고 비워져야 한다.
- curriculum YAML/provider golden 변경은 실제 `write-curriculum-yaml` 핸들러를 통과한 document 변경을 검증한다. `loadedInEditor`, structured section card flow, document runtime packages, `intro.diagram.runtime` detail, `sectionCount`/`exerciseCellCount`/`contractGapCount` result signal이 빠지면 실패해야 한다. 신규 structured YAML의 `contractGapCount`가 0이 아니면 teacher golden은 실패해야 한다.
- 학습카드/YAML 변경은 backend materializer 테스트, `learning-card-contract`, 레이아웃 변경 시 `learning-card-browser`를 함께 확인한다. `learning-card-contract`는 섹션 카드 part, 직접 입력 editor, `student-practice` 입력 역할, 셀 도움 팝오버, 제목 중복 제거, 스니펫 복사 버튼, push TOC를 고정한다. `learning-card-browser`는 손으로 만든 fixture가 아니라 실제 `yamlToDocument` 산출물을 검증하고, 그 산출물의 렌더링 필드를 브라우저에 주입해야 한다. overview diagram은 YAML의 `intro.diagram.runtime` 문구가 화면의 runtime node로 렌더링되는지도 확인한다.
- 목표 완료를 말하기 전에는 `learning-system-readiness`가 최소 9점을 증명해야 한다. 이 gate는 완료 선언을 대체하지 않고, YAML 계약, 카드 UI, clarification, uv 패키지 정책, editor runtime preflight, provider 오류 workloop, frontend workloop, golden eval/e2e, 운영 SSOT 증거가 현재 저장소에 남아 있는지 확인한다. 또한 `teacher-eval`, `teacher-e2e`, `assistant-workloop-contract`, `editor-runtime-preflight`, `learning-card-contract`, `learning-card-browser`를 실제로 실행하는 blocking probe가 실패하면 점수와 무관하게 실패해야 한다.
- 목표를 닫기 전 최종 검증은 `learning-goal-audit`로 남긴다. 이 gate는 docs 정합성, 명시 요구사항 audit, `learning-system-readiness`, 전체 backend, landing build를 한 번에 실행해 "9점 readiness는 통과했지만 제품 빌드/문서가 따로 깨진" 상태를 막는다. 명시 요구사항 audit은 `score`, `maxScore`, `minimumScore`, `requiredScore`, `requirementFailures`를 남기며, `minimumScore` 이상이어도 `requirementFailures`가 하나라도 있으면 실패한다. teacher/provider loop 자체의 산출물은 `score`, `maxScore`, `minimumScore`를 포함해야 하며 `minimumScore`는 9.0이다.
- 기존 부채를 새 테스트로 한 번에 해결하지 못하면 별도 baseline 또는 명시적 TODO 문서로 분리한다.
- CI YAML은 세부 명령을 소유하지 않고 `tests/run.py gate <name>`만 호출한다.
