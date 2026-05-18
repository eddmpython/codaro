---
id: ai-integration
title: AI 통합 원칙
description: Optional teacher integration rules that keep assistance transparent and inspectable.
category: identity
section: concepts
order: 106
purpose: AI 없이도 모든 학습이 동작. AI가 붙으면 편집기 API를 tool_use로 호출해 가르친다. Provider 교체 가능.
whenToUse: AI Provider 추가/교체, 새 tool_use 추가, AI 교사 시스템 프롬프트 정의할 때.
---

# AI 통합 원칙

- **AI 없이도 모든 학습이 완전히 동작**한다. AI는 선택적 확장이다.
- AI가 붙으면 편집기의 기존 API를 **도구(tool_use)로 사용**해서 가르친다.
  - `insert-block`: 설명/예시/힌트 셀 삽입
  - `execute-reactive`: 학생 코드 실행 후 결과 검증
  - `GET variables`: 변수 상태 확인
  - `update-block`: 피드백 추가
  - `fs/write`, `packages/install`: 교육 환경 자동 설정
- AI는 `GET /api/curriculum/learning-spec`에서 학습 사상을 읽고 동일한 철학으로 가르친다.
- 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다.
- AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음.

## YAML 우선 학습 절차

AI가 학습 흐름을 만들 때 기본값은 `editor/`의 **채팅에서 커리큘럼을 생성**하는 것이다. 사용자가 "pandas 3일 과정 만들어줘"처럼 말하면 아래 절차를 따른다.

1. **읽기** — `read-cells`, `get-blocks`, `get-variables`로 현재 에디터 상태와 실행 상태를 확인한다.
2. **YAML 작성** — `meta`, `intro`, `sections`, `blocks` 구조의 curriculum YAML을 먼저 만든다. 커리큘럼 파일이 없어도 이 YAML이 임시 학습 명세가 된다.
3. **커리큘럼 전개** — `write-curriculum-yaml`을 호출해 YAML을 `yamlToDocument` 변환기로 보내고, 결과 document를 커리큘럼 학습 셀로 로드한다.
4. **셀 단위 수정** — 추가 설명, 빈칸, 예측, 체크 셀은 `write-cell`로 한 셀씩 삽입/수정/삭제한다.
5. **셀 단위 호출** — 실행과 검증은 `cell-call`을 기본으로 한다. 하위 호환이 필요할 때만 `execute-reactive`, `check-exercise`를 직접 쓴다.
6. **진행 기록** — 주제 단위 완료, 반복 실패, 숙련도 변화는 `track-achievement`로 남긴다.

이 절차의 핵심은 "YAML이 커리큘럼 SSOT, 셀이 실행/학습 단위, tool call이 셀별 조작 로그"라는 구조다. AI 응답 텍스트가 커리큘럼이 아니라, YAML과 셀 단위 조작이 실제 학습 상태를 만든다.

여기서 `editor/`는 제품 표면 폴더명이다. 사용자에게 보이는 표면은 채팅, 에디터, 커리큘럼, 자동화이며, 내부 실행/학습 단위는 notebook과 cell이다.

## Tool action 계약

- `curriculum`: `write-curriculum-yaml` — YAML 학습 명세를 runnable cells로 materialize.
- `read`: `read-cells`, `get-blocks`, `get-variables` — 현재 셀/런타임/화면 상태 읽기.
- `write`: `write-cell`, `insert-block`, `update-block`, `delete-block`, 학습 생성 툴 — 노트북과 제품 상태 변경.
- `cell-call`: `cell-call`, `execute-reactive`, `check-exercise` — 특정 셀 실행/검증.
- `progress`: `track-achievement` — 학습 완료/숙련도 기록.

## DartLab 참고 구조

DartLab의 tool UI는 tool lifecycle을 `start → result/error`로 분리하고, tool call id에 refs/artifacts/workloop UI를 연결한다. Codaro도 tool lifecycle은 참고한다. 단, Codaro의 기본 artifact는 일반 파일이 아니라 **커리큘럼 학습 셀과 YAML curriculum spec**이다.

따라서 Codaro는 최종 답변보다 cell id, 실행 결과, 변환된 YAML document, 적용 대기 중인 diff를 더 중요하게 다룬다. 사용자는 "AI가 뭐라고 말했는지"보다 "어떤 셀이 만들어졌고 어떤 셀이 실행/검증됐는지"를 먼저 확인할 수 있어야 한다. tool action 로그는 기본 학습 패널이 아니라 필요한 때 열어보는 세부 기록이다.

## 관련

- [[learning-three-pillars]] — 학습 사상 SSOT
- [[ai-sensory-system]] — AI에게 눈/귀/손을 주는 별도 축
- [[ai-transparency]] — AI 실제 본 데이터 노출 원칙
