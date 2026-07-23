---
id: learning-three-pillars
title: 학습 시스템 3기둥
description: Notebook, curriculum, and learning philosophy pillars for Codaro education.
category: identity
section: concepts
order: 105
purpose: Web·Local 실행 표면 + canonical 커리큘럼 + 학습 사상 세 기둥 위에 다운로드 없는 학습과 자동화 확장이 동작.
whenToUse: 새 레슨 추가, 학습 UX 디자인, AI 교사 행동 설계, 진행 추적 모델 변경할 때.
---

# 학습 시스템 3기둥

- **기둥 1: 이어지는 실행 표면** - Web에서는 설치 없이 읽기·편집·실행·강검증·진도 저장을 제공하고, Local에서는 같은 문서를 파일·패키지·터미널·일정·자동화로 확장한다.
- **기둥 2: canonical 커리큘럼** - `curricula/`의 YAML 레슨을 하나의 공개 catalog, 경로, outcome, runtime tier, CheckSpec 계약으로 제공한다.
  - 정적 레슨뿐 아니라 AI가 채팅에서 만든 임시 curriculum YAML도 같은 변환기(`yamlToDocument`)를 통과해 커리큘럼 학습 셀이 된다.
  - 사용자가 커리큘럼을 먼저 고르지 않아도, AI가 목표를 해석하고 기존 레슨을 추천·조합한 뒤, 실제 gap에만 YAML 명세를 만들고 `write-curriculum-yaml`로 현재 학습 셀을 전개한다.
- **기둥 3: 학습 사상** - 코드로 정의된 교육 철학. AI도 사람도 이 사상을 따른다.
  - 목표와 쓰임을 먼저 밝히고, 완성된 입력·출력 예제를 즉시 보여준다.
  - 설명 뒤에는 편집 가능한 코드가 자연스럽게 이어진다. 학습자가 별도 펼치기·확인 버튼을 누르게 하지 않는다.
  - 실행 결과, 오류, 강검증, 다음 수정 지점은 실행 흐름 안에서 자동 갱신한다.
  - 빈 화면 대신 의미 있는 starter code를 주되, 단순 빈칸 맞히기보다 실제 값을 바꾸고 결과를 해석하게 한다.
  - 오류는 벌점이나 막힘이 아니라 원인, 위치, 수정 방향을 함께 읽는 증거다.
  - 한 번의 정답보다 다른 입력·실제 데이터·산출물로 전이하는 변주와 회고를 우선한다.
  - 파일, 표, 보고서, 이미지, 로그처럼 다시 확인 가능한 산출물을 만든다.

## 커리큘럼 품질 기준

Codaro 커리큘럼의 목표는 "잘 만들어진 커리큘럼"이다. 단순히 금지 문구를 지우거나 YAML 형식만 맞추는 작업은 완료가 아니다.

- YAML은 `meta.id`, `meta.category`, `tags`를 가진 학습 자산으로 분류하고, 제품 사이드바는 카테고리 트리로 커리큘럼에 진입하게 한다. 분류는 탐색을 돕는 조건이지 품질 개선을 대신하지 않는다.
- 공개 레슨은 목표, worked example, 설명, 편집 가능한 실습을 첫 읽기 흐름에 제공한다. 핵심 내용을 숨겼다가 버튼으로 공개하지 않는다.
- Web 지원 레슨은 학습자가 실행하면 결과·오류·강검증·진도가 자동으로 갱신되어야 한다. 별도의 답 확인 버튼을 완료 조건으로 두지 않는다.
- Local 필요 레슨은 실제 파일·패키지·터미널·일정·운영체제 capability가 필요한 이유를 처음부터 표시하고, Web 지원인 것처럼 약화해 제공하지 않는다.
- 예제는 장난감 문법 확인에 머물지 않고 업무 리포트, 운영 점검, 데이터 검증, 자동화, 분석 파이프라인처럼 실제로 다시 쓸 수 있는 맥락을 가져야 한다.
- 다양한 학습 주제를 기본 의존성에 모두 넣어 제품을 무겁게 만들지 않는다. 학습 주제별 패키지는 각 레슨의 `meta.packages`에 선언하고, 필요할 때 uv preflight로 준비한다.
- 각 트랙의 소개 레슨은 "이 과정으로 무엇을 할 수 있는가", "어떤 패키지가 언제 준비되는가", "첫 실행은 어떻게 검증되는가", "끝나면 어떤 산출물을 만들 수 있는가"를 보여줘야 한다.
- 특정 런타임의 설치법이나 우회 API 자체를 기본 학습 목표로 만들지 않는다. Web과 Local 모두 같은 Python 개념, outcome, CheckSpec을 보존한다.
- 좋은 커리큘럼인지 판단할 때는 "제약 문구가 없어졌는가"보다 "초보자가 개념을 익히고, 중급자가 실무 패턴으로 가져갈 수 있는가"를 우선한다.
- 전수조사는 약한 레슨을 찾는 데서 끝내지 않고, 목표 → worked example → 편집·실행 → 자동 피드백 → 실무 전이 중 빠진 단계를 우선 보강한다.

## 제품 학습 흐름

학습의 기본 진입은 공개 Web 교육 과정이다.

- **공개 교육 과정에서 시작** - 목표 경로, 검색, runtime tier를 보고 canonical 레슨을 선택한다. 모든 레슨은 바로 읽히며 Web 지원 레슨은 곧바로 Run에서 실행한다.
- **Run에서 이어서 학습** - 공개 레슨의 category, contentId, goal path를 보존해 같은 문서를 열고 실행 결과와 진도를 자동 기록한다.
- **Local에서 확장** - 전체 학습 archive를 가져와 같은 문서, 초안, 가상 파일, 패키지 요구, evidence lineage를 원자적으로 복원한다.
- **AI는 선택적 보조** - 기존 레슨 검색·조합을 먼저 하고 실제 gap에만 YAML을 만들며, 핵심 학습 경로를 가로막지 않는다.

```text
공개 `/learn`
→ 목표 경로·검색·runtime tier로 canonical 레슨 선택
→ 목표·worked example·설명·실습을 바로 읽기
→ Web 지원이면 같은 category/contentId/path로 Run 열기
→ 코드 수정·실행
→ 결과·오류·CheckSpec evidence·progress 자동 갱신
→ 필요할 때 전체 learning archive로 Local 이어가기
→ Local 파일·패키지·일정·자동화 draft 확장
```

AI가 없어도 전체 공개 catalog와 Web 지원 학습 흐름은 완결된다. AI가 있을 때만 같은 YAML/셀 구조 위에서 개인화 설명, 보충 예제, 다음 레슨 추천이 붙는다.

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
