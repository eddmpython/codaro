---
id: teacher-tool-loop
title: Teacher Tool Loop
description: Skill-guided loop for turning chat requests into curriculum cells, runtime checks, and dependency preparation.
category: architecture
section: teacher-engine
order: 208
purpose: 채팅 요청을 답변 텍스트가 아니라 커리큘럼 YAML, 셀 조작, 실행 검증, 라이브러리 준비로 전개하는 절차를 고정한다.
whenToUse: provider 응답 루프, tool call 표시, 셀 수정 절차, 패키지 준비 절차, 커리큘럼 생성 흐름을 바꿀 때.
---

# Teacher Tool Loop

Codaro의 채팅은 답변 창이 아니라 **skill-guided tool loop**의 입구다. 사용자가 학습이나 자동화를 요청하면 provider는 바로 긴 설명을 쓰지 않고, 아래 절차로 제품 상태를 바꾼다.

## 절차

1. **요청 분류**
   - 단순 질문이면 짧게 답한다.
   - 학습 요청이면 curriculum YAML을 먼저 만든다.
   - 셀 수정/답 확인이면 현재 cell map에서 대상 셀을 고른다.
   - 자동화 요청이면 자동화 셀/태스크 흐름으로 보낸다.

2. **Cell Map 확인**
   - 모든 셀은 `type`, `role`, `displayKind`, `executionKind`, `title`, `purpose`, `resultStatus`를 가진다.
   - 타이틀/설명 셀에는 실행 코드를 쓰지 않는다.
   - 스니펫 셀은 예제 표시용이다. 학생 입력은 별도 연습 입력 영역 또는 exercise 셀에 둔다.
   - exercise 셀은 학습자가 직접 수정/작성하는 공간이다.
   - check 셀은 답 확인, 실행 결과 검증, 변수 확인에 쓴다.
   - automation 셀은 OS, 브라우저, 마우스, 이미지, task 흐름에 쓴다.

3. **Dependency Preflight**
   - 외부 라이브러리가 필요한 흐름이면 실행 전에 `packages-check`를 호출한다.
   - `packages-check` 결과의 `missing`이 비어 있으면 바로 다음 단계로 간다.
   - 누락이 있으면 `packages-install`을 누락 패키지별로 호출한다.
   - 학습자에게는 패키지 설치 세부 로그보다 "필요한 도구를 준비 중"이라고 보여준다.

4. **Curriculum YAML 우선**
   - 학습 요청은 `meta`, `intro`, `sections`, `blocks` 구조의 YAML로 설계한다.
   - YAML을 만들면 반드시 `write-curriculum-yaml`로 materialize한다.
   - materialize 결과 document는 `나만의 커리큘럼`에 저장되어 커리큘럼 화면에서 열린다.

5. **Cell 단위 조작**
   - 읽기는 `read-cells`.
   - 수정/삽입/삭제는 `write-cell`.
   - 실행/검증은 `cell-call`.
   - 하위 호환이 필요할 때만 `execute-reactive`, `check-exercise`를 직접 쓴다.

6. **Workloop 표시**
   - 대화 표면은 tool lifecycle을 숨기지 않는다.
   - `tool_start`가 오면 "처리 중 · {작업명}"으로 표시한다.
   - `tool_results`가 오면 각 tool row를 done/error로 갱신한다.
   - raw payload는 기본 노출하지 않고, 필요할 때 `In`/`Out`으로 펼쳐 본다.

## 코드 경계

```
src/codaro/ai/
├── conversation.py   # 역할별 prompt와 conversation state
├── teacher/
│   ├── teacherOrchestrator.py
│   ├── contextBuilder.py
│   ├── toolPolicy.py
│   ├── traceModel.py
│   ├── skillRegistry.py
│   └── evalHarness.py
├── teacherLoop.py    # compatibility re-export
├── tools.py          # tool schema/manifest
└── toolExecutor.py   # 실제 tool handler

src/codaro/api/
└── aiRouter.py       # HTTP/SSE endpoint, provider 호출 경계
```

router가 셀 맥락 조립이나 tool payload 포맷을 직접 소유하면 금방 덕지덕지 붙는다. provider loop의 판단 재료와 workloop 표시 payload는 `teacher/` 패키지에서 관리한다.

## Tool Map

| 단계 | Tool | 역할 |
|---|---|---|
| 환경 확인 | `packages-check` | 필요한 Python 패키지 설치 여부 확인 |
| 환경 준비 | `packages-install` | 누락된 패키지만 설치 |
| YAML 전개 | `write-curriculum-yaml` | 커리큘럼 YAML을 학습 셀 document로 변환 |
| 셀 읽기 | `read-cells` | 현재 셀 구조와 내용을 확인 |
| 셀 수정 | `write-cell` | 셀 단위 삽입/수정/삭제 |
| 셀 호출 | `cell-call` | 실행 또는 검증 |
| 변수 확인 | `get-variables` | 런타임 변수 상태 확인 |

## 실패 기준

- 학습 요청을 긴 채팅 답변만으로 끝내면 실패다.
- YAML을 만들고도 커리큘럼 화면에 반영하지 않으면 실패다.
- 필요한 패키지를 확인하지 않고 실행 셀부터 만들면 실패다.
- 셀 역할을 보지 않고 설명 셀에 실행 코드를 쓰면 실패다.
- tool call을 raw JSON 로그처럼 항상 노출하면 실패다.

## 관련

- [[frontend-product-surface]]
- [[curriculum-registry]]
- [[ai-integration]]
