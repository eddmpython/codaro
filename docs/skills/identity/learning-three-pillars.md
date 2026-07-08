---
id: learning-three-pillars
title: 학습 시스템 3기둥
description: Notebook, curriculum, and learning philosophy pillars for Codaro education.
category: identity
section: concepts
order: 105
purpose: 노트북 기능 + 뼈대 커리큘럼(YAML 130+ 레슨) + 학습 사상(코드로 정의된 교육 철학) 세 기둥 위에 학습이 동작.
whenToUse: 새 레슨 추가, 학습 UX 디자인, AI 교사 행동 설계, 진행 추적 모델 변경할 때.
---

# 학습 시스템 3기둥

- **기둥 1: 노트북 기능** - 학습의 실행 환경. 셀 편집/실행/리액티브/병합.
- **기둥 2: 뼈대 커리큘럼** - `curricula/`의 YAML 기반 130+ 레슨. 카테고리/레슨/미션/진행 추적.
  - 정적 레슨뿐 아니라 AI가 채팅에서 만든 임시 curriculum YAML도 같은 변환기(`yamlToDocument`)를 통과해 커리큘럼 학습 셀이 된다.
  - 사용자가 커리큘럼을 먼저 고르지 않아도, AI가 목표를 해석하고 기존 레슨을 추천·조합한 뒤, 실제 gap에만 YAML 명세를 만들고 `write-curriculum-yaml`로 현재 학습 셀을 전개한다.
- **기둥 3: 학습 사상** - 코드로 정의된 교육 철학. AI도 사람도 이 사상을 따른다.
  - 최소 설명, 최대 실행
  - 빈칸부터 시작 (빈 셀이 아니라 거의 완성된 코드에서 빈칸 채우기)
  - 예측 → 검증 (먼저 예측하게 하고 실행으로 확인)
  - 오류는 학습 (일부러 버그가 있는 코드를 주고 고치게 한다)
  - 점진적 빌드 (한 셀에 한 개념, 쌓아가며 완성)
  - 수정 실험 ("이 값을 바꿔보세요")
  - 3단계 힌트 (개념 → 구조 → 정답, 바로 답을 주지 않는다)
  - 즉시 피드백 (맞았는지 1초 안에)
  - 반복 변주 (같은 개념을 다른 상황에서)
  - 실제 맥락 (추상적 예제가 아니라 현실 상황)

## 커리큘럼 품질 기준

Codaro 커리큘럼의 목표는 "잘 만들어진 커리큘럼"이다. 단순히 금지 문구를 지우거나 YAML 형식만 맞추는 작업은 완료가 아니다.

- YAML은 `meta.id`, `meta.category`, `tags`를 가진 학습 자산으로 분류하고, 제품 사이드바는 카테고리 트리로 커리큘럼에 진입하게 한다. 분류는 탐색을 돕는 조건이지 품질 개선을 대신하지 않는다.
- 학습자는 실행 전에 결과를 예측하고, 로컬 Python으로 실행하고, 오류를 고치고, `assert`나 명시적 비교로 검증한 뒤, 값을 바꾸는 실험까지 해야 한다.
- 예제는 장난감 문법 확인에 머물지 않고 업무 리포트, 운영 점검, 데이터 검증, 자동화, 분석 파이프라인처럼 실제로 다시 쓸 수 있는 맥락을 가져야 한다.
- 다양한 학습 주제를 기본 의존성에 모두 넣어 제품을 무겁게 만들지 않는다. 학습 주제별 패키지는 각 레슨의 `meta.packages`에 선언하고, 필요할 때 uv preflight로 준비한다.
- 각 트랙의 소개 레슨은 "이 과정으로 무엇을 할 수 있는가", "어떤 패키지가 언제 준비되는가", "첫 실행은 어떻게 검증되는가", "끝나면 어떤 산출물을 만들 수 있는가"를 보여줘야 한다.
- 과거 Pyodide 제약 때문에 생긴 우회, 브라우저 전용 설치 흐름, marimo 관련 내용/표면/흐름은 기본 커리큘럼의 학습 목표가 아니다. 로컬 Python 커널에서 자연스럽게 배우고 실행하는 흐름으로 고친다.
- 좋은 커리큘럼인지 판단할 때는 "제약 문구가 없어졌는가"보다 "초보자가 개념을 익히고, 중급자가 실무 패턴으로 가져갈 수 있는가"를 우선한다.
- 전수조사는 약한 레슨을 찾는 데서 끝내지 않고, 예측 → 실행 → 오류 수정 → 검증 → 실무 변주가 빠진 레슨을 우선 보강한다.

## 제품 학습 흐름

학습의 진입은 두 가지다.

- **채팅에서 시작** - 사용자가 목표를 말하면 AI가 기존 레슨을 먼저 추천·조합하고, 실제 gap이 있을 때만 curriculum YAML을 만들어 학습 셀로 전개한다.
- **커리큘럼에서 바로 시작** - `curricula/`의 기본 레슨을 선택해 AI 없이도 바로 학습한다.

```text
사용자 목표
→ `resolve-learning-goal`
→ `search-curricula`
→ `compose-master-plan`
→ gap이 있을 때만 compact curriculum YAML 작성
→ `write-curriculum-yaml`
→ `yamlToDocument`
→ 현재 학습 셀
→ `read-cells` / `write-cell` / `cell-call`
→ progress 기록
```

AI가 없을 때는 `curricula/`의 reference curriculum YAML을 같은 변환기로 열어 학습한다. AI가 있을 때는 같은 YAML/셀 구조 위에서 개인화, 추가 설명, 답 검증, 보충 셀 생성이 붙는다.

## 학습 셀 모델

물리 셀 타입은 적게 유지한다. 기본은 `markdown`과 `code`이며, 다음 의미는 셀 메타데이터로 표현한다.

- `role`: title, explanation, learning, snippet, exercise, check, visual, automation, skill
- `displayKind`: title, hero, prose, callout, cardGrid, comparison, table, media, resource, practice, quiz, centerText
- `executionKind`: python, browser, os, mouse, image, task, skill
- `payload`: YAML 원본 의미를 보존하는 구조화 데이터

이 구조를 쓰면 AI는 같은 셀 모델을 읽고 수정하면서도, 화면은 타이틀셀/설명셀/학습셀/스니펫셀/실행셀/시각화셀처럼 다양하게 표현할 수 있다.

커리큘럼 표면은 YAML의 `type`을 버리지 않는다. `text/content`는 읽기 카드, `featureCards/choiceCards/resourceCards`는 카드 그리드, `compare/fullWidthComparison`은 비교 카드, `stepCard/practiceCard/expansion`은 실습 카드, `table`은 표 셀, `image/video/youtube/pdf`는 미디어 셀, `quiz/warning/tip/note`는 검증/힌트 셀로 렌더링한다.

즉 셀의 물리 타입을 계속 늘리는 방식이 아니라, YAML 의미를 `sourceType`과 `payload`에 보존하고 커리큘럼 렌더러가 학습용 카드로 해석한다. 이 구조 때문에 AI도 같은 셀을 읽고 설명, 힌트, 답 확인, 셀 수정 요청을 셀 단위로 처리할 수 있다.

## 관련

- [[ai-integration]] - AI가 같은 사상으로 가르친다
- [[multi-editor-modes]] - 대화, 현재 학습, 노트북, 자동화 제품 표면
- [[curriculum-registry]] - 기본 curriculum YAML의 제품 자산 경계
- [[curriculum-authoring]] - 커리큘럼 작성 절차와 lazy uv 의존성 기준
