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
  - `resolve-learning-goal`, `search-curricula`, `compose-master-plan`: 목표를 도메인에 매핑하고 기존 레슨을 먼저 추천·조합
  - `write-curriculum-yaml`: structured YAML을 섹션 카드와 실행 셀로 전개
  - `read-cells`, `write-cell`, `cell-call`: 현재 셀 읽기, 단일 셀 수정, 단일 셀 실행/검증
  - `packages-check`, `packages-install`: 실행 전 라이브러리 확인과 uv 설치
  - `get-variables`: 변수 상태 확인
  - `create-guide`, `create-learning-card`, `create-quiz`, `create-notebook-exercise`: 기존/단일 실습 보조용
- AI는 `GET /api/curriculum/learning-spec`에서 학습 사상을 읽고 동일한 철학으로 가르친다.
- 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다.
- AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음.

## 추천·조합 우선 학습 절차

AI가 학습 흐름을 만들 때 기본값은 `editor/`의 **채팅에서 목표를 해석한 뒤 현재 학습으로 전개**하는 것이다. 사용자가 "pandas 3일 과정 만들어줘"처럼 말하면 아래 절차를 따른다.

1. **목표 해석** — `resolve-learning-goal`로 자연어 목표를 커리큘럼 도메인 후보에 매핑한다.
2. **기존 레슨 검색** — `search-curricula`로 이미 있는 레슨과 outcome을 먼저 찾는다.
3. **학습 경로 조합** — `compose-master-plan`으로 기존 레슨을 순서 있는 경로로 조합하고 gap을 확인한다.
4. **gap-only YAML 작성** — 기존 레슨이 덮지 못하는 실제 gap일 때만 `meta`, `intro`, `sections` 구조의 curriculum YAML을 만든다. 신규 레슨은 `intro.diagram.steps`, `intro.diagram.runtime`, `sections[].title/subtitle/goal/why/explanation/tips/snippet/exercise/check` 계약을 쓰고, `sections[].blocks[]`는 기존 curriculum 변환용이다.
5. **커리큘럼 전개** — gap YAML은 반드시 `write-curriculum-yaml`로 `yamlToDocument` 변환기에 보내고, 결과 document를 현재 학습 셀로 로드한다.
6. **라이브러리 확인** — 실행할 셀에 외부 패키지가 필요하면 `packages-check`를 먼저 호출하고, 누락된 항목만 `packages-install`로 uv 설치한다.
7. **셀 단위 수정** — 추가 설명, 빈칸, 예측, 체크 셀은 `write-cell`로 한 셀씩 삽입/수정/삭제한다.
8. **셀 단위 호출** — 실행과 검증은 `cell-call`을 기본으로 한다. 하위 호환이 필요할 때만 `execute-reactive`, `check-exercise`를 직접 쓴다.
9. **진행 기록** — 주제 단위 완료, 반복 실패, 숙련도 변화는 `track-achievement`로 남긴다.

이 절차의 핵심은 "기존 커리큘럼 추천·조합이 먼저이고, YAML은 gap을 채우는 SSOT이며, 셀이 실행/학습 단위, tool call이 셀별 조작 로그"라는 구조다. AI 응답 텍스트가 커리큘럼이 아니라, 추천 경로와 gap YAML, 셀 단위 조작이 실제 학습 상태를 만든다.

여기서 `editor/`는 제품 표면 폴더명이다. 사용자에게 보이는 표면은 대화, 현재 학습, 노트북, 자동화이며, 내부 실행/학습 단위는 notebook과 cell이다.

## Tool action 계약

- `curriculum`: `write-curriculum-yaml` — YAML 학습 명세를 runnable cells로 materialize.
- `read`: `read-cells`, `get-blocks`, `get-variables` — 현재 셀/런타임/화면 상태 읽기.
- `write`: `write-cell` — 섹션 카드 materialize 이후 필요한 단일 셀 수정.
- `legacy-write`: `insert-block`, `update-block`, `delete-block`, 학습 생성 보조 툴 — 기존 notebook 호환 또는 단일 실습 보조.
- `dependency`: `packages-check`, `packages-install` — 외부 라이브러리 확인과 uv 설치.
- `cell-call`: `cell-call`, `execute-reactive`, `check-exercise` — 특정 셀 실행/검증.
- `progress`: `track-achievement` — 학습 완료/숙련도 기록.

## DartLab 참고 구조

DartLab의 tool UI는 tool lifecycle을 `start → result/error`로 분리하고, tool call id에 refs/artifacts/workloop UI를 연결한다. Codaro도 tool lifecycle은 참고한다. 단, Codaro의 기본 artifact는 일반 파일이 아니라 **커리큘럼 학습 셀과 YAML curriculum spec**이다.

따라서 Codaro는 최종 답변보다 cell id, 실행 결과, 변환된 YAML document, 적용 대기 중인 diff를 더 중요하게 다룬다. 사용자는 "AI가 뭐라고 말했는지"보다 "어떤 셀이 만들어졌고 어떤 셀이 실행/검증됐는지"를 먼저 확인할 수 있어야 한다. tool action 로그는 기본 학습 패널이 아니라 필요한 때 열어보는 세부 기록이다.

## 관련

- [[learning-three-pillars]] — 학습 사상 SSOT
- [[ai-sensory-system]] — AI에게 눈/귀/손을 주는 별도 축
- [[ai-transparency]] — AI 실제 본 데이터 노출 원칙
