---
id: automation-authoring-loop
title: Automation Authoring Loop
description: Provider-guided loop for turning chat automation requests into percent-format recipes, editor cells, checks, and registered tasks.
category: architecture
section: teacher-engine
order: 209
purpose: 자동화 요청을 YAML 학습 설계와 분리하되 같은 에디터/셀/태스크 경계에서 작성, 검증, 예약하게 한다.
whenToUse: 자동화 셀 작성, IDE 조작 코드 생성, task 등록, cell-call 검증, 자동화 Teacher tool 정책을 바꿀 때.
---

# Automation Authoring Loop

Codaro에서 YAML은 학습 커리큘럼의 source of truth다. 자동화는 YAML에 억지로 넣지 않고 percent-format Python recipe와 automation 셀을 source of truth로 둔다. 채팅 표면의 provider는 두 흐름을 구분해서 선택한다.

```text
학습 요청
→ write-curriculum-yaml
→ 커리큘럼 셀 카드
→ packages-check
→ cell-call

자동화 요청
→ read-cells
→ write-automation-recipe
→ write-cell 또는 생성된 automation 셀 확인
→ packages-check
→ cell-call
→ create-automation-task
```

## 기준 흐름

1. **현재 문서 확인**
   - `read-cells`로 현재 에디터 문서의 셀 구조를 본다.
   - 기존 automation 셀이 있으면 목적, 입력, 실행 경계를 먼저 확인한다.
   - 대상 셀이 불명확하면 새 automation 셀을 만든다.

2. **Recipe 작성**
   - `write-automation-recipe`가 percent-format `.py` 파일을 만든다.
   - 파일은 기본적으로 `automations/{slug}.py` 아래에 저장한다.
   - recipe는 `# %% [markdown]` 설명 셀과 `# %% [automation]` 실행 셀을 가진다.
   - 기본은 `DRY_RUN = True`다. 외부 입력, 클릭, 파일 쓰기, 알림 전송은 dry-run 검토 후 실행하도록 둔다.

3. **Editor 반영**
   - `write-automation-recipe`는 같은 내용을 automation 셀로 에디터에 올릴 수 있다.
   - 더 작은 수정을 해야 할 때만 `write-cell`로 셀을 갱신한다.
   - 셀 metadata는 `type=automation`, `role=automation`, `executionKind=python`, `displayKind=cell`, `sourceType=automationAuthoring`을 사용한다.

4. **Dependency Preflight**
   - recipe가 외부 패키지를 쓰면 실행 전에 `packages-check`를 호출한다.
   - 누락 패키지는 `packages-install`로 준비하고, 실패하면 `cell-call`로 넘어가지 않는다.
   - provider workloop에는 패키지 이름, uv 설치 경로, 실패 원인을 사람이 읽는 문장으로 남긴다.

5. **Cell 실행과 검증**
   - automation 셀은 `cell-call`로 실행하거나 check한다.
   - dry-run 결과가 기대와 다르면 recipe를 직접 실행하지 않고 `write-cell` 또는 `write-automation-recipe`로 다시 작성한다.
   - 화면 조작이 필요한 recipe는 `capture-screen`, `find-element`, `click-element`, `type-text`, `press-hotkey`, `wait-for`를 직접 실행하기보다 plan 또는 recipe 안에서 순서를 고정한다.

6. **Task 등록**
   - 검증된 파일만 `create-automation-task`로 task registry에 등록한다.
   - `documentPath`는 workspace 내부의 실제 파일이어야 한다.
   - schedule은 `@daily`, `@every_15m`, `@every_1h`처럼 scheduler가 해석할 수 있는 값만 허용한다.
   - 등록 후 자동화 표면의 task 목록, run button, schedule 상태, audit 로그에서 같은 task를 볼 수 있어야 한다.

## Tool Map

| 단계 | Tool | 역할 |
|---|---|---|
| 현재 문서 확인 | `read-cells` | 기존 셀과 automation 셀 찾기 |
| recipe 작성 | `write-automation-recipe` | percent-format 파일 작성과 automation 셀 반영 |
| 셀 세부 수정 | `write-cell` | 셀 단위 보정 |
| 의존성 확인 | `packages-check` | 필요한 Python 패키지 확인 |
| 의존성 준비 | `packages-install` | 누락 패키지 설치 |
| 실행/검증 | `cell-call` | automation 셀 dry-run 또는 check |
| task 등록 | `create-automation-task` | 검증된 recipe를 task registry에 등록 |

## 실패 기준

- 자동화 요청을 커리큘럼 YAML에만 넣고 실제 실행 가능한 recipe를 만들지 않으면 실패다.
- workspace 밖 파일을 task로 등록하면 실패다.
- dry-run 없이 외부 입력이나 클릭 실행부터 시도하면 실패다.
- 패키지 preflight 없이 외부 라이브러리 recipe를 실행하면 실패다.
- automation 셀을 만들고도 task registry와 연결하지 못하면 반복 실행 자동화로는 실패다.

## 관련

- [[teacher-tool-loop]]
- [[percent-format]]
- [[automation-tasks-reports]]
- [[ssot-map]]
