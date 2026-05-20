---
id: learning-yaml-contract
title: Learning YAML Contract
description: Structured YAML contract for Codaro curriculum lessons and section-card rendering.
category: architecture
section: curriculum
order: 207
purpose: 학습 YAML을 단순 렌더링 데이터가 아니라 레슨 설계 SSOT로 고정한다.
whenToUse: 커리큘럼 YAML 생성, write-curriculum-yaml materializer, 섹션 학습카드 UI, teacher eval case를 바꿀 때.
---

# Learning YAML Contract

Codaro의 학습 YAML은 화면 조각 목록이 아니라 **학습 설계의 source of truth**다. 프론트는 YAML 의미를 추측하지 않고 contract payload를 읽어 렌더링한다.

## 계약

신규 레슨과 teacher가 생성하는 YAML은 아래 구조를 우선한다.

```yaml
meta:
  title: 3단계 pandas 실습 레슨
  audience: 초급
  difficulty: easy
  packages:
    - pandas
intro:
  direction: DataFrame 생성, 확인, 수정 흐름을 한 번에 익힌다.
  benefits:
    - 표 데이터를 코드로 만들고 검증할 수 있다.
  diagram:
    steps:
      - label: 목표
        detail: 무슨 공부
      - label: 개념
        detail: 설명과 팁
      - label: 스니펫
        detail: 따라 칠 코드
      - label: 실행
        detail: 입력과 검증
sections:
  - id: dataframe-basics
    title: DataFrame 만들기
    subtitle: 행과 열의 감각
    goal: dict에서 DataFrame을 만드는 흐름을 익힌다.
    why: 엑셀 표 자동화의 첫 단계다.
    explanation: pandas.DataFrame은 열 이름과 값 목록으로 표를 만든다.
    tips:
      - 모든 열의 길이는 같아야 한다.
    snippet: |
      import pandas as pd
      frame = pd.DataFrame({"name": ["A"], "sales": [10]})
      frame
    exercise:
      prompt: sales 열을 가진 DataFrame을 직접 만드세요.
      starterCode: |
        import pandas as pd
        frame = ___
      solution: |
        import pandas as pd
        frame = pd.DataFrame({"sales": [10, 20]})
      hints:
        - dict의 key가 열 이름이다.
      check:
        variable: frame
    check:
      noError: 실행 오류가 없어야 한다.
```

## 렌더링 원칙

- 레슨 상단은 `intro.direction`, `intro.benefits`, `intro.diagram`을 읽어 무엇을 공부하는지, 왜 유용한지, 전체 흐름을 보여준다.
- 섹션 하나가 학습카드 하나다. `sections[].blocks[]`의 작은 카드 반복을 기본 구조로 삼지 않는다.
- 섹션 카드는 `title → subtitle → goal → why → explanation → tips → snippet → exercise → result → check` 순서로 이어진다.
- 카드 내부 정보는 라벨, 구획선, 여백으로 구분한다. 카드 안에 또 카드가 덕지덕지 쌓이는 구조는 피한다.
- `sectionContract:*`로 materialize된 신규 섹션은 작은 block card를 반복 렌더링하지 않고, 하나의 섹션 카드 안에서 예제 스니펫, 직접 입력 실습, 실행 결과, 검증/피드백을 흐름형 band로 보여준다.
- structured 섹션의 `exercise` band는 클릭해야 열리는 preview가 아니라 바로 보이는 실제 입력 editor를 가진다. `learning-card-browser` gate는 이 editor가 desktop/mobile에서 보이고 starter code를 렌더링하는지 확인한다.
- 레슨 overview는 `data-learning-overview`, `data-learning-overview-part`, `data-learning-flow-diagram`, `data-learning-flow-step` marker를 가진다. `learning-card-browser` gate는 방향, 학습 효과, 플로우 step이 실제 desktop/mobile 화면에 보이는지 확인한다.
- structured section card는 브라우저 검증을 위해 `data-learning-section-card`, `data-learning-section-structured`, `data-learning-section-part` marker를 가진다. 검증 대상 part는 `overview`, `snippet`, `exercise`, `result`, `check`다.
- marker 계약과 editor build는 `uv run python -X utf8 tests/run.py gate learning-card-contract`로 확인한다. 실제 데스크톱/모바일 브라우저 렌더링은 `uv run python -X utf8 tests/run.py gate learning-card-browser`로 확인한다.
- `snippet`은 예제 스니펫 셀로, `exercise.starterCode`는 학습자가 직접 입력/수정하는 실습 셀로 materialize한다.
- `meta.packages`는 런타임 패키지 preflight의 1차 입력이다. 코드 import 추론은 보조 수단이다.

## 호환 레이어

기존 curriculum은 `sections[].blocks[]`를 계속 허용한다. 다만 materializer는 legacy blocks를 읽더라도 `learningContract`와 `sectionContract` payload를 함께 만든다.

새 YAML에서 `blocks`가 없고 structured section fields가 있으면 materializer가 설명, 스니펫, 실습, 검증 셀을 직접 생성한다.

## 구현 경계

- Python SSOT 모델: `src/codaro/curriculum/sectionContract.py`
- Backend materializer: `src/codaro/curriculum/converter.py`
- Frontend registry mirror: `editor/src/lib/curriculaRegistry.ts`
- Section renderer: `editor/src/components/curriculum/curriculumSurface.tsx`
- Teacher tool contract: `src/codaro/ai/toolDefinitions/workbench.py`
- Eval harness: `src/codaro/ai/teacher/evalHarness.py`

프론트 상태, document model, runtime result, trace/workloop은 서로 직접 참조하지 않는다. YAML contract는 document payload로 들어가고, runtime result는 셀 실행 결과로만 붙는다.

## 평가 기준

teacher/provider loop의 golden case는 다음을 확인해야 한다.

- `write-curriculum-yaml` 결과 document에 `learningContract` 또는 `sectionContract`가 존재한다.
- 섹션 카드가 goal, why, explanation, tips를 contract에서 읽는다.
- golden provider run은 `section` 블록 뒤에 `sectionContract:explanation → sectionContract:snippet → sectionContract:exercise → sectionContract:check`가 같은 섹션 범위 안에서 materialize됐는지 확인한다.
- golden provider run은 가능한 한 실제 `write-curriculum-yaml` 핸들러를 통과해야 한다. synthetic trace만으로 통과시키지 않고, 결과 document가 에디터에 로드됐는지(`loadedInEditor`)와 `meta.packages`가 document runtime packages에 보존됐는지 확인한다.
- `learning-card-contract` gate가 structured section marker와 editor build를 고정해야 한다.
- `learning-card-browser` gate가 실제 `yamlToDocument` materializer 산출물의 contract flow와 runtime package를 먼저 검증한 뒤, 같은 산출물의 렌더링 필드를 custom curriculum으로 주입해 Playwright CLI로 데스크톱과 모바일 structured section card 흐름과 실습 입력 셀/실행 결과/검증 구역 겹침 여부를 확인한다.
- 패키지 흐름은 `packages-check → packages-install(필요할 때만) → cell-call` 순서를 지킨다.
- trace/workloop에는 `커리큘럼 YAML 전개`, `라이브러리 확인`, `uv 라이브러리 설치`, `셀 실행/검증` 같은 사용자가 읽을 수 있는 단계가 남는다.
- 질문이 필요할 때만 1-3개 핵심 질문을 제안하고, 기본값으로 진행한 경우 그 기본값이 남는다.

## 관련

- [[frontend-product-surface]]
- [[teacher-tool-loop]]
- [[curriculum-registry]]
