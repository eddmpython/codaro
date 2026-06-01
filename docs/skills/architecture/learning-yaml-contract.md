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

Codaro의 학습 YAML은 화면 조각 목록이 아니라 **학습 설계의 source of truth**다. YAML은 lesson SSOT다. 프론트는 YAML 의미를 추측하지 않고 contract payload를 읽어 렌더링한다.

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
      - label: DataFrame 입력 확인
        detail: sales 열과 행 값을 먼저 고정한다.
      - label: DataFrame 처리 실행
        detail: pandas 생성 코드를 실행해 중간 결과를 확인한다.
      - label: sales 결과 검증
        detail: 행/열 수와 요약값 기준으로 실행 결과를 비교한다.
      - label: DataFrame 재사용
        detail: 검증된 코드를 작은 리포트 자동화에 붙일 수 있게 정리한다.
    runtime:
      - label: pandas 환경
        detail: pandas 기준으로 로컬 Python 실행을 준비한다.
      - label: 검증
        detail: 실행 결과
sections:
  - id: dataframe-basics
    title: DataFrame 만들기
    structuredPrimary: true
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
      noError: DataFrame 생성 코드가 pandas import, 열 이름, 행 길이 조건을 만족해야 한다.
      resultCheck: frame 변수에 sales 열이 있고, 바꾼 행 값이 DataFrame 결과에 반영되어야 한다.
```

## 렌더링 원칙

- 레슨 상단은 `intro.direction`, `intro.benefits`, `intro.diagram`을 읽어 무엇을 공부하는지, 왜 유용한지, 전체 흐름을 보여준다.
- `intro.diagram.steps`는 제품 화면에서 레슨별 `실무 흐름`으로 렌더링한다. `목표/개념/스니펫/실행` 같은 고정 단계가 아니라 해당 YAML의 섹션 제목과 실제 작업 흐름을 반영해야 한다. `diagram.runtime`은 로컬 실행 환경과 완료 기준을 보존하는 데이터 계약이며, 화면은 필요한 경우에만 이를 보조 정보로 사용한다.
- 섹션 하나가 학습카드 하나다. 이 섹션 단위 학습카드 원칙 때문에 `sections[].blocks[]`의 작은 카드 반복을 기본 구조로 삼지 않는다.
- 섹션 카드는 `title → subtitle → goal → why → explanation → tips → snippet → exercise → result → check` 순서로 이어진다.
- 카드 내부 정보는 라벨, 구획선, 여백으로 구분한다. 카드 안에 또 카드가 덕지덕지 쌓이는 구조는 피한다.
- `sectionContract:*`로 materialize된 신규 섹션은 작은 block card를 반복 렌더링하지 않고, 하나의 섹션 카드 안에서 예제 스니펫, 직접 입력 실습, 실행 결과, 검증/피드백을 흐름형 band로 보여준다.
- 카드 헤더와 본문은 같은 제목을 반복하지 않는다. legacy list/prose block에서 첫 목록 항목이나 첫 markdown heading이 셀 제목과 같으면 렌더러가 한 번만 보이게 정리한다.
- `snippet` band는 코드임을 명확히 알 수 있는 박스와 `예제 스니펫` 라벨, 우측 상단 복사 버튼을 가진다.
- 섹션 헤더 번호는 타이틀/서브타이틀 묶음과 높이를 맞춘다. 셀 도움 요청 액션은 hover-only가 아니라 항상 보이는 control로 둔다.
- 셀 TOC는 push rail이다. overlay flyout으로 같은 아이콘 목록을 한 번 더 띄우지 않는다.
- structured 섹션의 `exercise` band는 클릭해야 열리는 preview가 아니라 바로 보이는 실제 입력 editor를 가진다. `learning-card-browser` gate는 이 editor가 desktop/mobile에서 보이고 starter code를 렌더링하는지 확인한다.
- 레슨 overview는 `data-learning-overview`, `data-learning-overview-blueprint`, `data-learning-overview-rail`, `data-learning-overview-part`, `data-learning-workflow-diagram`, `data-learning-workflow-step` marker를 가진다. `learning-card-browser` gate는 방향, 학습 효과, YAML 기반 실무 흐름 step이 desktop/mobile 화면에 보이는지 확인한다.
- structured section card는 브라우저 검증을 위해 `data-learning-section-card`, `data-learning-section-structured`, `data-learning-section-part` marker를 가진다. 검증 대상 part는 `overview`, `snippet`, `exercise`, `result`, `check`다.
- marker 계약과 editor build는 `uv run python -X utf8 tests/run.py gate learning-card-contract`로 확인한다. 실제 데스크톱/모바일 브라우저 렌더링은 `uv run python -X utf8 tests/run.py gate learning-card-browser`로 확인한다.
- `snippet`은 예제 스니펫 셀로, `exercise.starterCode`는 학습자가 직접 입력/수정하는 실습 셀로 materialize한다. 렌더러는 이 영역을 `직접 입력 실습` 흐름 안의 실제 에디터로 바로 보여주고, 중복 코드 라벨이나 작성자 배지를 붙이지 않으며 `data-learning-exercise-input-role="student-practice"`를 유지한다.
- `meta.packages`는 런타임 패키지 preflight의 1차 입력이다. 코드 import 추론은 보조 수단이다.

## 의존성 계약

- Codaro 기본 의존성은 제품 실행에 필요한 최소 패키지만 가진다. 학습 주제별 패키지는 `pyproject.toml`에 넣지 않고 레슨 YAML의 `meta.packages`에 선언한다.
- `meta.packages`는 해당 레슨을 열고 실행할 때 필요한 패키지 목록이다. 트랙 전체에서 언젠가 쓸 수 있는 패키지를 미리 모두 넣지 않는다.
- 외부 패키지가 필요한 레슨의 `intro.diagram.runtime`에는 uv 준비 흐름을 드러낸다. 예: `라이브러리 확인`, `uv로 누락 설치`, `셀 실행/검증`.
- 소개 레슨은 첫 실행 경험에서 import 확인과 작은 `assert` 검증을 포함해 "필요할 때 준비하고 바로 실행한다"는 감각을 만든다.
- 패키지 흐름은 항상 `packages-check → packages-install(필요할 때만) → cell-call`이다. 설치 성공 또는 이미 준비됨 결과가 없으면 실행으로 넘어가지 않는다.
- 레슨 본문에는 직접 `pip install` 안내를 쓰지 않는다. 설치는 제품 capability와 uv 경로가 맡는다.

## 호환 레이어

기존 curriculum은 `sections[].blocks[]`를 계속 허용한다. 다만 materializer는 legacy blocks를 읽더라도 `learningContract`와 `sectionContract` payload를 함께 만든다.
`structuredPrimary: true`가 붙은 섹션은 structured fields가 1차 학습 계약이고, `blocks`는 표, 영상, 링크, 추가 설명 같은 보조 자료다. 이 경우 materializer는 structured section card를 먼저 만들고, 남은 blocks를 뒤에 이어 붙여 원본 자료를 잃지 않는다.

새 YAML에서 `blocks`가 없고 structured section fields가 있으면 materializer가 설명, 스니펫, 실습, 검증 셀을 직접 생성한다.

새 structured section이 `subtitle`, `goal`, `why`, `explanation`, `tips`, `snippet`, `exercise.prompt`, `exercise.starterCode`, `check` 중 일부를 빠뜨리면 materializer는 이를 조용히 추측하지 않는다. `sectionContract.contractGaps`, `sectionContractGaps`, `contractGapCount`, `contractGaps`로 누락 필드를 보고한다. teacher가 생성하는 신규 YAML과 golden provider run은 `contractGapCount: 0`이어야 한다.
제품 섹션 카드는 내부 contract gap 경고 band를 기본 노출하지 않는다. 누락 필드는 teacher/tool 결과와 검증 리포트에서 다루고, 사용자 화면에는 `YAML 계약 보강 필요` 같은 작성자용 문구나 `data-learning-section-contract-gaps` 표식을 흘리지 않는다.

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
- golden provider run은 `contractGapCount` result signal을 확인하고, 새 structured YAML에 누락 필드가 남으면 실패해야 한다.
- `learning-card-contract` gate가 structured section marker와 editor build를 고정해야 한다.
- `learning-card-browser` gate가 실제 `yamlToDocument` materializer 산출물의 contract flow와 runtime package를 먼저 검증한 뒤, 같은 산출물의 렌더링 필드를 custom curriculum으로 주입해 Playwright CLI로 데스크톱과 모바일 structured section card 흐름과 실습 입력 셀/실행 결과/검증 구역 겹침 여부를 확인한다.
- `learning-card-browser` gate는 불완전한 structured section도 포함해 contract gap 경고가 desktop/mobile 제품 카드에 새지 않는지 확인한다.
- 패키지 흐름은 `packages-check → packages-install(필요할 때만) → cell-call` 순서를 지킨다.
- trace/workloop에는 `커리큘럼 YAML 전개`, `라이브러리 확인`, `uv 라이브러리 설치`, `셀 실행/검증` 같은 사용자가 읽을 수 있는 단계가 남는다.
- 커리큘럼 작성 절차는 [[curriculum-authoring]]을 따른다. 특히 새 트랙의 소개 레슨은 이 과정에서 무엇을 만들 수 있는지, 어떤 준비가 필요한지, 완료 후 어떤 산출물을 만들 수 있는지를 보여줘야 한다.
- 질문이 필요할 때만 1-3개 핵심 질문을 제안하고, 바로 생성하지 않고 현재 작업 기준이 trace/workloop에 남는다.

## 관련

- [[frontend-product-surface]]
- [[teacher-tool-loop]]
- [[curriculum-registry]]
- [[curriculum-authoring]]
