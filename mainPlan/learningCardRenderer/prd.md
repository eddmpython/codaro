# 학습카드 렌더러 개선 PRD

> 상태: draft 1  
> 범위: Codaro 현재 학습 표면의 카드 렌더러, 소개 카드, 구조화 섹션 카드, 보조 블록 카드, 실행 결과, 검증 피드백.  
> 결론: 전문가 검토 기준 92/100. 구현 전제와 게이트가 명확하고, 사용자가 말한 "보기 힘든 학습카드" 문제를 카드 단위에서 해결한다.

## 1. 제품 정의

학습카드 렌더러는 커리큘럼 YAML을 화면 카드로 예쁘게 바꾸는 장식 레이어가 아니다. 학습자가 레슨을 열었을 때 다음 순서를 놓치지 않게 만드는 학습 조작면이다.

```text
무엇을 배울지 파악
→ 왜 필요한지 이해
→ 예제 스니펫 읽기
→ 직접 입력 실습 수정
→ 실행 결과 확인
→ 검증 피드백으로 다음 행동 결정
```

현재 구조는 이 순서를 어느 정도 갖고 있지만, 화면에서는 소개 카드와 섹션 카드 안에 너무 많은 요소가 같은 무게로 보인다. 특히 소개 카드는 커리큘럼 배지, 제목, 방향, 실무 흐름, 학습 효과, 라이브러리 준비, 과제방 패널이 한 프레임에 들어가면서 "첫 화면에서 무엇을 봐야 하는지"가 흐려진다. 구조화 섹션 카드도 목표, 이유, 팁, 상세 설명, 스니펫, 실습, 실행, 검증이 모두 카드나 작은 패널처럼 보여서 읽기 피로가 커진다.

이 PRD의 목표는 전체 제품 UI를 갈아엎는 것이 아니라, 학습카드의 정보 위계와 상태 전이를 다시 설계하는 것이다.

## 2. 현재 근거

검토한 핵심 파일:

| 영역 | 현재 파일·심볼 | 관찰 |
| --- | --- | --- |
| 레슨 소개 | `editor/src/components/curriculum/curriculumSurface.tsx` `LearningOverviewHeader` | 소개 카드가 제목, 방향, 워크플로, 혜택, 패키지, 과제방을 모두 같은 카드 안에 둔다. |
| 섹션 카드 | `CurriculumSectionCard`, `SectionContractOverview`, `StructuredSectionLearningBody` | `sectionContract` 흐름은 있으나 개념 설명과 실습 행동의 위계가 약하다. |
| 보조 카드 | `editor/src/components/curriculum/curriculumMarkdownBody.tsx` `CurriculumMarkdownBody` | displayKind별 렌더가 많고, 작은 `text-xs`와 반복 border가 많아 카드 더미처럼 보일 수 있다. |
| 검증 피드백 | `editor/src/components/curriculum/checkResultPanel.tsx` `CheckResultPanel` | 피드백, diff, 힌트, detail, 예측 diff, 오개념, outcome, 다음 행동, 도움 버튼이 비슷한 무게로 쌓인다. |
| YAML 계약 | `docs/skills/architecture/learning-yaml-contract.md` | "섹션 하나가 학습카드 하나"와 `goal → why → explanation → tips → snippet → exercise → result → check` 순서가 이미 명시돼 있다. |
| 카드 계약 | `docs/skills/architecture/curriculum-card-contract.md`, `src/codaro/curriculum/cardContract.py` | 카드 type 재고는 충분하다. 새 type보다 렌더러 위계 개선이 우선이다. |
| 게이트 | `tests/run.py` `learning-card-contract`, `learning-card-browser` | 마커와 실제 브라우저 검증 경로가 있으므로 redesign 후 증명할 수 있다. |

현재 코드가 이미 잘하고 있는 것:

- `sectionContract` 기반으로 소개, 섹션, 스니펫, 실습, 결과, 검증을 연결하려는 큰 방향은 맞다.
- 실습 셀은 preview가 아니라 실제 editor로 바로 보인다.
- 실행 전에는 result/check 영역을 숨기는 방향이 맞다.
- `sectionContract:check`를 학습자용 정적 카드로 보여주지 않는 정책이 맞다.
- 카드 type 레지스트리와 문서 계약이 있어, 신규 카드 type 남발 없이 개선할 수 있다.

현재 코드가 학습 경험을 흐리는 지점:

- 소개 카드가 "방향", "작업 흐름", "준비 상태"를 한꺼번에 보여주지만 시각 우선순위가 없다.
- 구조화 섹션 카드의 overview가 2-3열 미니 대시보드처럼 보여, 읽기 순서가 약하다.
- Korean 학습 문구가 `truncate`, `line-clamp`, `text-xs`에 자주 걸려 핵심 문장이 보조 메타처럼 느껴진다.
- 보조 블록 카드가 모두 border 박스가 되면서 카드 안 카드 더미처럼 보인다.
- 실행, 검증, 도움 요청 버튼이 같은 줄에서 경쟁한다.
- 검증 실패 후 가장 중요한 "왜 틀렸는지 / 다음 한 걸음"보다 상세 패널들이 먼저 눈에 들어올 수 있다.

## 3. 전문가 토론 합성

### 3.1 학습 효과 관점

좋은 학습카드는 정보량이 적은 카드가 아니라, 주의 이동이 명확한 카드다. Codaro의 카드 흐름은 다음 네 단계로 읽혀야 한다.

1. **목표 앵커**: 이번 섹션에서 무엇을 할 수 있게 되는지 한 문장.
2. **맥락 압축**: 왜 필요한지, 어디에 쓰는지 한 문장.
3. **작업 예시**: 읽기 전용 스니펫과 핵심 관찰 포인트.
4. **수행과 회수**: 직접 입력, 실행, 검증, 다음 행동.

현재처럼 목표, 이유, 팁, 설명이 모두 같은 작은 블록으로 놓이면 학습자는 무엇을 먼저 읽어야 하는지 결정해야 한다. 초급 학습자에게 이 결정 비용은 실제 개념 학습보다 먼저 온다.

### 3.2 정보구조 관점

카드 렌더러의 1차 모델은 `sectionContract`여야 한다. legacy `sections[].blocks[]`는 여전히 지원하지만, 학습자의 머릿속 모델은 "작은 카드 목록"이 아니라 "섹션 하나 = 학습 행동 하나"가 되어야 한다.

권장 정보구조:

```text
레슨 소개 카드
├─ 오늘 만들거나 할 수 있게 되는 것
├─ 실무 흐름 3-4단계
└─ 준비 상태: 라이브러리, 실행 환경, 과제방

섹션 카드
├─ 섹션 헤더: 번호, 제목, 상태
├─ 작업 브리프: 목표 + 이유
├─ 개념 설명: 기본은 짧게, 긴 설명은 펼침
├─ 예제 스니펫: 읽기 전용, 복사 가능
├─ 직접 입력 실습: 실제 editor
├─ 실행 결과: 실행 뒤 노출
└─ 검증 피드백: 검증 뒤 노출

보조 블록
└─ legacy 카드 type은 섹션 아래 보조 자료로 유지
```

### 3.3 구현 계약 관점

리팩터링은 디자인 변경보다 먼저 또는 같은 단계에서 계약을 보존해야 한다. 특히 `curriculumSurface.tsx`는 현재 소개, 섹션 grouping, 섹션 카드, 실습 검증, 목차까지 많이 들고 있다. 시각 개선만 얹으면 파일은 더 비대해지고 회귀 위험이 커진다.

권장 분리:

| 책임 | 새 후보 위치 | 설명 |
| --- | --- | --- |
| 레슨 소개 | `editor/src/components/curriculum/learningLessonOverview.tsx` | `learningContract`, intro diagram, dependency/assignment slot만 담당 |
| 섹션 카드 프레임 | `editor/src/components/curriculum/learningSectionCard.tsx` | header, marker, selected state, section status |
| 구조화 섹션 본문 | `editor/src/components/curriculum/structuredSectionBody.tsx` | overview → snippet → exercise → result → check 순서 |
| 실습 검증 상태 | `editor/src/hooks/useSectionExerciseCheck.ts` | `runExerciseCheck`, hintLevel, completion record |
| 계약 view model | `editor/src/lib/learningContractViewModel.ts` | `learningContract`, `sectionContract`, payload reader 중앙화 |
| legacy 렌더러 | `editor/src/components/curriculum/legacyBlockRenderer/` | `CurriculumMarkdownBody`는 facade로 남기고 displayKind family를 분리 |

## 4. 북극성

**학습자는 섹션 카드 하나를 보고 10초 안에 다음 세 질문에 답할 수 있어야 한다.**

- 지금 무엇을 배우는가?
- 어느 코드를 읽고 어느 코드를 바꾸는가?
- 실행과 검증 결과를 어디서 확인하는가?

북극성 지표:

| 지표 | 목표 |
| --- | --- |
| 첫 화면 이해 | 소개 카드에서 학습 목표, 작업 흐름, 준비 상태가 한 번에 구분된다. |
| 섹션 행동 이해 | 각 섹션에서 `읽기 → 바꾸기 → 실행 → 검증` 순서가 시각적으로 이어진다. |
| 글자 가독성 | 학습 본문은 보조 메타처럼 보이지 않고, 긴 한국어 문장이 잘리지 않는다. |
| 모바일 완주성 | 360px 폭에서도 editor, 실행 버튼, 검증 버튼, 도움 버튼이 겹치지 않는다. |
| 계약 보존 | 기존 `data-learning-*` marker와 YAML 계약이 깨지지 않는다. |

## 5. 대상 사용자

### 초급 학습자

특징:

- 개념보다 화면 조작을 먼저 두려워한다.
- 긴 코드보다 "어디를 바꾸면 되는지"가 중요하다.
- 실패했을 때 원인보다 다음 한 걸음이 먼저 필요하다.

필요:

- 문장 길이가 짧고, 읽는 순서가 보이는 카드.
- 실제 editor가 바로 보이는 실습.
- 실패 시 한 줄 진단과 다음 행동.

### 중급 학습자

특징:

- 빠르게 핵심 예제와 검증 기준을 보고 싶다.
- 긴 설명은 필요할 때만 펼치고 싶다.
- 코드를 복사하거나 변형해 자기 작업에 가져가려 한다.

필요:

- 스니펫 복사, 코드 영역의 안정적 폭, 실행 결과의 명확한 분리.
- 설명은 접힘 가능하거나 낮은 밀도로 배치.
- 상태와 완료 기준이 과장되지 않는 정직한 라벨.

### 커리큘럼 작성자

특징:

- YAML 계약을 통해 화면을 예측해야 한다.
- 카드 type을 고르는 문제보다 섹션 흐름을 설계하는 문제가 크다.

필요:

- `sectionContract` 중심의 렌더링 규칙.
- legacy block이 보조 자료로 남는 명확한 위치.
- `sectionContract:check` 같은 내부 메타가 화면 카드로 새지 않는 보장.

## 6. 범위와 제외

### 포함

- `LearningOverviewHeader`의 소개 카드 정보 위계.
- `WorkflowArchitectureDiagram`의 읽기 흐름과 긴 문장 처리.
- `CurriculumSectionCard`의 헤더, 상태, 내부 순서.
- `SectionContractOverview`의 브리프화.
- `StructuredSectionLearningBody`의 스니펫, 실습, 실행 결과, 검증 피드백 배치.
- `CheckResultPanel`의 정보 우선순위.
- `CurriculumMarkdownBody`의 legacy block 렌더러를 보조 자료로 정리하는 방향.
- 데스크톱/모바일 가독성, keyboard focus, touch target, overflow 방지.

### 제외

- 전체 앱 레이아웃 개편.
- 커리큘럼 YAML 대량 재작성.
- 새 카드 type 대량 추가.
- 학생 채점 확장.
- 예측 카드 부활.
- 진행률 또는 숙달 라벨의 별도 제품 정책 변경.
- 패키지 설치 로직을 카드 렌더러 안으로 이동.
- 과제방 기능 자체 변경.

## 7. 핵심 요구사항

### LCR-01. 소개 카드는 학습 준비 패널이어야 한다

소개 카드는 마케팅 hero가 아니라 레슨 시작 전 작업 지도를 제공해야 한다.

필수 구성:

1. **오늘 할 수 있게 되는 것**: `intro.direction` 또는 `learningContract.intro.direction`.
2. **실무 흐름**: `intro.diagram.steps`에서 3-4개. 일반 단어만 있는 단계는 걸러낸다.
3. **준비 상태**: `meta.packages`, 런타임 준비, 과제방 연결 상태.

표현 규칙:

- benefits는 최대 4개.
- 라이브러리가 모두 준비된 상태라면 compact badge 수준으로 줄인다.
- 설치 필요, 설치 중, 오류 상태일 때만 준비 패널을 확장한다.
- `intro.diagram.runtime`은 준비 상태 근거로 쓰되, 본문을 반복하지 않는다.
- 핵심 학습 문구에 `truncate`를 쓰지 않는다.

수용 기준:

- `data-learning-overview`, `data-learning-workflow-diagram`, `data-learning-workflow-step` marker 유지.
- 긴 workflow step label이 모바일에서 잘리지 않고 줄바꿈된다.
- 소개 카드 안에서 title, direction, workflow, readiness가 시각적으로 구분된다.

### LCR-02. 섹션 하나는 하나의 학습카드여야 한다

구조화 섹션은 여러 독립 카드의 목록으로 보이면 안 된다. 하나의 outer section card 안에서 band가 순서대로 내려가야 한다.

필수 순서:

```text
section header
→ task brief(goal + why)
→ concept detail(optional)
→ snippet
→ exercise editor
→ execution result(after run)
→ check feedback(after check)
→ auxiliary legacy blocks(optional)
```

표현 규칙:

- header에는 번호, title, subtitle, 상태만 둔다.
- goal과 why는 가장 먼저 읽히는 task brief로 묶는다.
- explanation은 68ch 안팎의 본문 폭을 가진다.
- tips는 "하면서 볼 힌트"로 낮은 위계에 둔다.
- code/result처럼 fixed-format 영역만 명확한 프레임을 사용한다.
- 개념·팁·설명은 카드 안 카드가 아니라 rail, divider, typography로 구분한다.

수용 기준:

- `data-learning-section-card`, `data-learning-section-structured`, `data-learning-section-part` marker 유지.
- structured section은 "독립 카드 pile"이 아니라 하나의 section card로 보인다.
- 실행 전 result/check 영역은 보이지 않는다.

### LCR-03. 글자 크기와 줄 길이를 학습 본문 기준으로 다시 잡는다

현재 제품 기본 글자 크기는 밀도 높은 도구 표면에 맞춰 작다. 학습카드는 반복 작업 도구가 아니라 읽기와 실행이 결합된 표면이므로 본문 가독성 기준이 달라야 한다.

타이포그래피 계약:

| 영역 | 목표 |
| --- | --- |
| 레슨 제목 | 카드 안에서는 과장하지 않고 `text-2xl` 이하 |
| 섹션 제목 | `text-lg` 수준, 한 줄 고정 금지 |
| 학습 본문 | 최소 14px 상당, `leading-6` 이상 |
| 긴 설명 | 최대 68-72ch 폭 |
| 보조 메타 | `text-xs` 가능하나 핵심 학습 문구에는 금지 |
| 코드 | 12-13px 가능, 줄바꿈과 가로 스크롤 정책 명확화 |
| 버튼 | 모바일 touch target 최소 40px |

금지:

- 학습 핵심 문장에 무조건 `truncate`.
- Korean label을 uppercase micro-label처럼 취급.
- viewport width 기반 font scaling.
- negative letter spacing.
- 카드 안에서 본문보다 badge가 더 눈에 띄는 구성.

### LCR-04. 스니펫은 읽기 전용 예제, 실습은 실제 editor다

스니펫과 실습은 서로 다른 역할이다.

스니펫:

- 읽기 전용.
- 복사 가능.
- "왜 이 예제를 보는지" 한 문장 포함.
- 코드가 길면 스크롤되지만 카드 밖으로 넘치지 않는다.

실습:

- preview 클릭 후 열림이 아니라 바로 보이는 editor.
- starter code가 바로 보인다.
- `data-learning-exercise-input-role="student-practice"` 유지.
- 실행 버튼은 editor 근처에 있고, 검증 버튼보다 먼저 읽힌다.

수용 기준:

- desktop/mobile 모두 editor가 0 크기나 overflow 없이 보인다.
- 실습 전용 라벨은 중복되지 않는다.
- keyboard focus가 header, editor, 실행, 검증, 도움 순서로 자연스럽다.

### LCR-05. 실행과 검증은 경쟁하지 않고 순서를 만든다

실행은 기술 결과 확인이고, 검증은 학습 피드백이다. 둘은 같은 줄의 동급 버튼처럼 보이면 안 된다.

상태별 규칙:

| 상태 | 화면 |
| --- | --- |
| 작성 전 | 실행 버튼 강조, 검증은 보조 또는 비활성 원인 표시 |
| 실행 중 | 실행 중 표시, 검증 잠금 |
| 실행 성공 | 실행 결과 노출, 검증 가능 |
| 실행 실패 | 오류 출력 노출, 검증보다 오류 수정 유도 |
| 검증 중 | 검증 중 표시 |
| 검증 실패 | 한 줄 진단 + 핵심 diff + 다음 힌트 |
| 검증 통과 | 통과, 다음 섹션 또는 완료 행동 |

검증 불가 상태는 단순 disabled만 두지 않는다. 이유를 짧게 보여야 한다. 예: "먼저 실행하세요", "런타임 준비 필요".

### LCR-06. 검증 피드백은 첫 줄이 가장 중요해야 한다

검증 패널은 풍부한 정보를 갖고 있지만, 실패 직후에는 다음 정보가 먼저 보여야 한다.

1. 통과/실패 상태.
2. 가장 중요한 이유 한 줄.
3. expected/actual 핵심 차이.
4. 다음 힌트 또는 다음 행동.
5. 세부 진단, 예측 diff, 오개념 목록, outcome 기여는 아래쪽 또는 접힘.

수용 기준:

- 실패 카드 첫 화면에 "왜 실패했는지"와 "다음에 무엇을 할지"가 보인다.
- raw detail은 기본 접힘.
- 오개념 진단은 학습자에게 도움이 되는 하나의 우선 항목부터 보이고, 나머지는 보조로 둔다.
- 통과 후에도 "숙달"처럼 과장된 표현을 쓰지 않는다. 라벨은 검증 통과, 섹션 완료, 레슨 완료 수준으로 정직하게 둔다.

### LCR-07. legacy block renderer는 보조 자료로 다룬다

`CurriculumMarkdownBody`가 지원하는 `conceptRow`, `definition`, `misconception`, `timeline`, `stat`, `codeCompare`, `anatomy`, `terminal`, `annotatedCode`는 계속 가치가 있다. 그러나 이들은 구조화 섹션의 중심 흐름을 대체하면 안 된다.

규칙:

- legacy block은 `sectionContract` 흐름 뒤의 보조 자료로 보인다.
- 모든 legacy block이 outer card와 같은 강한 border를 갖지 않는다.
- 카드 그리드는 2-3개 이하일 때 효과적이다. 그 이상은 목록 또는 timeline으로 바꾸는 authoring 지침이 필요하다.
- 이모지, accent, 순번별 색상은 장식으로 쓰지 않는다.
- 신규 displayKind는 이 PRD의 1차 해법이 아니다.

### LCR-08. 모바일 내비게이션은 hover rail에 의존하지 않는다

현재 목차는 큰 화면의 hover rail에 가깝다. 모바일 또는 좁은 데스크톱에서는 hover 기반 목차가 핵심 이동 수단이 될 수 없다.

요구:

- 360px 폭 기준 섹션 카드가 수평 overflow를 만들지 않는다.
- 섹션 header action은 줄바꿈 가능해야 한다.
- 실행, 검증, 도움 버튼은 터치 가능한 크기를 가진다.
- 모바일에는 "섹션 n/n", 이전/다음 섹션 이동, 현재 상태 badge 중 하나 이상의 명확한 이동 단서가 필요하다.
- hover-only primary action 금지.

### LCR-09. 접근성과 조작 안정성

유지해야 할 것:

- editor aria-label.
- 항상 보이는 셀 도움 trigger.
- button label과 role.
- keyboard focus order.
- `data-learning-*` marker.
- `data-check-result`, `data-check-next-action` 같은 피드백 marker.

금지:

- 도움 버튼을 hover 때만 보이게 되돌리기.
- 클릭해야 editor가 열리는 preview 패턴.
- button text overflow.
- 카드 밖으로 나가는 popover 또는 tooltip.
- text와 control 겹침.

## 8. 상태 모델

섹션 카드는 다음 상태를 가진다.

| 상태 | 의미 | 시각 신호 |
| --- | --- | --- |
| `notStarted` | 아직 읽거나 수정하지 않음 | neutral |
| `focused` | 현재 선택된 섹션 | header ring 또는 subtle rail |
| `edited` | 실습 코드가 starter와 다름 | 작은 "수정됨" 상태 |
| `running` | 셀 실행 중 | 실행 spinner, 검증 잠금 |
| `ranOk` | 실행 성공 | result band 노출 |
| `runError` | 실행 실패 | result band에 오류 우선 |
| `checking` | 검증 중 | check spinner |
| `checkFailed` | 검증 실패 | 피드백 첫 줄 + 힌트 |
| `checkPassed` | 검증 통과 | 통과 + 다음 행동 |
| `lessonComplete` | 레슨 실습 완료 | 완료 banner, 과장 라벨 금지 |

상태 전이:

```text
notStarted
→ focused
→ edited
→ running
→ ranOk | runError
→ checking
→ checkFailed | checkPassed
→ lessonComplete
```

상태는 시각 장식이 아니라 노출 영역을 결정한다. result는 실행 뒤, check feedback은 검증 뒤, completion은 완료 뒤에만 보인다.

## 9. 데이터 계약과 드리프트 정리

### 9.1 `sectionContract`가 1차 입력이다

미래 렌더러는 다음 원칙을 따른다.

- `learningContract`는 레슨 소개와 준비 상태의 source.
- `sectionContract`는 섹션 카드의 source.
- `sections[].blocks[]`는 보조 자료와 legacy 호환.
- `BlockConfig`의 물리 type은 계속 `markdown`, `code`, `automation` 중심으로 유지.
- 의미는 `role`, `displayKind`, `executionKind`, `sourceType`, `payload`로 표현한다.

### 9.2 backend/frontend materializer parity

현재 주의할 드리프트:

- backend `src/codaro/curriculum/converter.py`는 structured field가 있으면 structured block을 먼저 만들고 source block도 뒤에 붙인다.
- frontend `editor/src/lib/curriculaRegistry.ts` mirror는 source block이 있으면 structured block 생성을 건너뛸 수 있다.

PRD 수용 기준:

- structured field와 legacy `blocks`가 함께 있는 레슨은 두 materializer 모두 structured flow를 먼저 보여주고, legacy blocks를 extra block으로 보존한다.
- 이 parity는 테스트로 고정한다.

### 9.3 `sectionContract:check`는 학습자 카드가 아니다

검증 기준은 내부 메타다. 학습자는 정적 "검증 기준 카드"가 아니라 검증 버튼과 결과 패널을 본다.

정리 필요:

- backend 정책: 유지.
- frontend mirror: 정적 check block을 만들더라도 renderer가 숨기는 현재 상태를 명확히 하거나, mirror도 backend와 맞춘다.
- 문서: `learning-yaml-contract.md`의 golden bullet 중 `sectionContract:check`를 정적 카드처럼 읽히게 하는 문구는 수정 대상이다.

### 9.4 payload reader 중앙화

현재 `payloadText`, `payloadMap`, `payloadItems` 같은 local reader가 여러 renderer 안에 흩어져 있다. malformed payload가 조용히 prose fallback으로 떨어지면 카드 개선 효과가 사라진다.

요구:

- `learningContractViewModel.ts` 또는 동등한 module에 typed reader를 둔다.
- UI는 깨진 payload를 화면에서 과장하지 않는다.
- 테스트는 깨진 payload와 누락 필드를 잡는다.

## 10. 구현 계획

### Phase 0. 계약 보강

목표: 시각 변경 전에 깨지면 안 되는 계약을 테스트로 고정한다.

작업:

- structured field + legacy `blocks` 혼합 fixture 추가.
- frontend/backend materializer parity 테스트.
- `sectionContract:check`가 정적 학습 카드로 보이지 않는 테스트.
- contract gap이 제품 카드에 노출되지 않는 테스트 유지.
- 긴 한국어 title, subtitle, workflow label fixture 추가.

완료 기준:

- `learning-card-contract` green.
- 관련 curriculum section contract 테스트 green.

### Phase 1. 컴포넌트 책임 분리

목표: 거대한 surface 파일에 시각 변경을 얹지 않고, 카드 책임을 분리한다.

작업:

- `LearningOverviewHeader` 추출.
- `CurriculumSectionCard` shell 추출.
- `StructuredSectionLearningBody` 추출.
- 실습 검증 로직 hook 추출.
- marker 이름과 위치는 유지.

완료 기준:

- 외부 props contract는 명확해진다.
- `CurriculumView`는 assembly와 routing에 가까워진다.
- `learning-card-contract` green.

### Phase 2. 소개 카드 재설계

목표: 소개 카드를 "학습 준비 패널"로 만든다.

작업:

- title/direction/benefits/workflow/readiness를 세 영역으로 재배치.
- workflow step label clamp 제거 또는 full text path 제공.
- ready 상태의 dependency panel compact화.
- missing/install/error 상태는 확장.
- assignment panel은 소개 본문과 시각 경쟁하지 않는 slot으로 낮춘다.

완료 기준:

- 첫 viewport에서 목표, 작업 흐름, 준비 상태가 구분된다.
- 모바일에서 workflow와 준비 상태가 겹치지 않는다.

### Phase 3. 섹션 카드 재설계

목표: `goal → why → snippet → exercise → result → check`를 하나의 안내 레일로 만든다.

작업:

- section header에는 번호, 제목, 상태만 남긴다.
- overview 3열 미니 카드 구조를 task brief + optional detail로 단순화.
- tips는 낮은 위계 또는 접힘으로 정리.
- snippet은 "읽기 예제"로, exercise는 "직접 입력 실습"으로 확실히 분리.
- 실행과 검증 버튼 순서를 상태 기반으로 정리.

완료 기준:

- 섹션 카드가 하나의 흐름으로 보인다.
- 실행 전 result/check 숨김 유지.
- desktop/mobile visual integrity 통과.

### Phase 4. 검증 피드백 재정렬

목표: 실패 직후 가장 중요한 학습 신호를 위로 올린다.

작업:

- feedback summary를 첫 줄에 둔다.
- expected/actual 핵심 diff를 바로 아래 둔다.
- 다음 힌트와 다음 행동을 primary action으로 정리.
- raw detail, prediction diff, 오개념 목록, outcome 기여는 secondary 영역으로 낮춘다.
- 통과 라벨은 정직하게 유지한다.

완료 기준:

- 실패 상태에서 한 화면 안에 이유와 다음 행동이 보인다.
- detail 정보가 첫 화면을 밀어내지 않는다.

### Phase 5. legacy block renderer 정리

목표: legacy block 렌더러를 보조 자료 adapter로 안정화한다.

작업:

- `CurriculumMarkdownBody`를 public facade로 유지.
- displayKind family별 renderer를 점진적으로 분리.
- concept/definition/timeline/code-like/media family 순서로 extraction.
- cardGrid가 과도하게 중첩 card pile로 보이지 않도록 style token 정리.
- 이모지/accent 장식 금지 유지.

완료 기준:

- 기존 card contract 유지.
- 신규 displayKind 없이 가독성 향상.
- `verifyCardContract.py`와 editor build green.

## 11. 영향 파일

1차 영향:

- `editor/src/components/curriculum/curriculumSurface.tsx`
- `editor/src/components/curriculum/curriculumMarkdownBody.tsx`
- `editor/src/components/curriculum/checkResultPanel.tsx`
- `editor/src/components/curriculum/curriculumDependencyPanel.tsx`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/lib/cellSchema.ts`
- `src/codaro/curriculum/converter.py`
- `src/codaro/curriculum/sectionContract.py`
- `docs/skills/architecture/learning-yaml-contract.md`
- `docs/skills/architecture/curriculum-card-contract.md`

신규 후보:

- `editor/src/components/curriculum/learningLessonOverview.tsx`
- `editor/src/components/curriculum/learningSectionCard.tsx`
- `editor/src/components/curriculum/structuredSectionBody.tsx`
- `editor/src/components/curriculum/legacyBlockRenderer/`
- `editor/src/hooks/useSectionExerciseCheck.ts`
- `editor/src/lib/learningContractViewModel.ts`

테스트 영향:

- `tests/learning/verifyLearningSectionCardContract.py`
- `tests/learning/verifyLearningCardPlaywright.py`
- `tests/curriculum/testCurriculumSectionContract.py`
- `tests/surface/testFrontendBoundary.py`
- `tests/surface/testProductSurfaceContract.py`
- `tests/run.py`

## 12. 영향 함수·심볼

| 파일 | 심볼 | 변경 방향 |
| --- | --- | --- |
| `curriculumSurface.tsx` | `LearningOverviewHeader` | 소개 카드 view extraction, 정보 위계 재정렬 |
| `curriculumSurface.tsx` | `WorkflowArchitectureDiagram` | 긴 label wrap, 단계 compact rail |
| `curriculumSurface.tsx` | `CurriculumSectionCard` | section shell과 상태 badge 책임으로 축소 |
| `curriculumSurface.tsx` | `SectionContractOverview` | task brief 중심으로 재설계 |
| `curriculumSurface.tsx` | `StructuredSectionLearningBody` | body extraction, 상태 기반 노출 |
| `curriculumSurface.tsx` | `structuredSectionParts` | 내부 check 숨김 정책 유지 |
| `curriculumSurface.tsx` | `CurriculumCellToc` | desktop push rail 유지, mobile 보조 내비게이션 검토 |
| `curriculumMarkdownBody.tsx` | `CurriculumMarkdownBody` | facade 유지, renderer family 분리 |
| `curriculumMarkdownBody.tsx` | `MarkdownBlock` | prose typography 개선, 핵심 문구 truncation 금지 |
| `checkResultPanel.tsx` | `CheckResultPanel` | feedback hierarchy 재정렬 |
| `curriculaRegistry.ts` | `documentFromCurriculumYaml`, `structuredBlocksFromSectionContract` | backend converter parity |
| `converter.py` | `yamlToDocument`, `_convertStructuredSection`, `_convertBlock` | source of truth 유지, frontend mirror 기준 제공 |

## 13. 수용 기준

### 기능 수용 기준

- 구조화 섹션은 하나의 section card로 렌더링된다.
- structured field와 legacy `blocks`가 함께 있을 때 structured flow가 먼저 보이고 extra blocks가 보존된다.
- `sectionContract:check`는 학습자 정적 카드로 보이지 않는다.
- contract gap 경고는 제품 카드에 사용자-facing 문구로 새지 않는다.
- 실습 editor는 바로 보이고, `student-practice` marker를 유지한다.
- 실행 전 result/check 영역은 숨겨진다.
- 검증 실패 후 첫 화면에 이유와 다음 행동이 보인다.
- 도움 trigger는 항상 보인다.

### 시각 수용 기준

- desktop과 360px 모바일에서 수평 overflow가 없다.
- 긴 한국어 제목과 workflow label이 잘리지 않는다.
- button text overflow가 없다.
- 카드 안 카드 더미처럼 보이는 중첩 border가 줄어든다.
- prose는 68-72ch 안팎에서 읽힌다.
- 모바일 control touch target은 최소 40px이다.

### 계약 수용 기준

- 기존 `data-learning-overview`, `data-learning-workflow-diagram`, `data-learning-section-card`, `data-learning-section-structured`, `data-learning-section-part`, `data-learning-exercise-input-role` marker 유지.
- components/hooks는 API client를 직접 import하지 않는다.
- 신규 physical block type을 만들지 않는다.
- 신규 displayKind 추가는 이 PRD의 완료 조건이 아니다.

## 14. 테스트

필수:

```powershell
uv run python -X utf8 tests/run.py gate learning-card-contract
uv run python -X utf8 tests/run.py gate learning-card-browser
uv run python -X utf8 tests/run.py gate editor-build
uv run python -X utf8 -m pytest tests/curriculum/testCurriculumSectionContract.py -q
uv run python -X utf8 -m pytest tests/surface/testFrontendBoundary.py tests/surface/testProductSurfaceContract.py -q
```

PRD 구현 후 broader confidence:

```powershell
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate learning-system-readiness
```

주의:

- `preflight`는 `root-clean`, `docs`, `backend` 중심이므로 학습카드 렌더러 완성을 증명하지 않는다.
- 레이아웃 변경은 브라우저 게이트가 필요하다.
- 긴 한국어 fixture, 긴 코드, 긴 검증 피드백, 모바일 폭, keyboard focus를 테스트에 포함해야 한다.

## 15. 롤백

롤백 단위:

1. 시각 재배치만 문제면 extracted component style 변경만 되돌린다.
2. marker 회귀가 있으면 `learning-card-contract` 기준으로 marker 위치를 되돌린다.
3. materializer parity 문제가 있으면 `curriculaRegistry.ts` mirror 변경을 되돌리고 backend converter 기준을 재확인한다.
4. 피드백 패널이 과도하게 축약되면 `CheckResultPanel`의 secondary 영역만 되돌린다.
5. extraction이 불안정하면 facade 파일인 `CurriculumMarkdownBody`와 `CurriculumSectionCard` public props를 유지한 채 내부 모듈만 되돌린다.

롤백 후 확인:

```powershell
uv run python -X utf8 tests/run.py gate learning-card-contract
uv run python -X utf8 tests/run.py gate learning-card-browser
```

## 16. 평가

### 개발자 렌즈

점수: 91/100.

강점:

- 기존 SSOT와 테스트 게이트를 존중한다.
- 새 카드 type 남발 없이 렌더러 책임과 상태 전이를 정리한다.
- `curriculumSurface.tsx` 비대화 위험을 추출 계획으로 다룬다.
- backend/frontend materializer 드리프트를 명시한다.

감점:

- 실제 구현 전 문서라 pixel-level final spec은 브라우저 검증 후 확정해야 한다.
- mobile 내비게이션은 구체 컴포넌트 후보까지는 잡았지만, 최종 interaction은 구현 중 조정이 필요하다.

### 제품 렌즈

점수: 93/100.

강점:

- 사용자가 지적한 "학습카드가 보기 힘듦"을 카드 단위의 진짜 문제로 좁혔다.
- 소개 카드가 별로라는 문제를 별도 요구사항으로 정면 처리한다.
- 초급 학습자의 주의 이동과 실패 후 다음 행동을 중심에 둔다.
- 전체 UI 개편으로 scope가 퍼지지 않는다.

감점:

- 카드 디자인 mockup은 아직 없다. 구현 단계에서 브라우저 screenshot 검토가 필요하다.

종합 결론: 92/100. 이 PRD는 바로 구현 착수 가능한 수준이며, 성공 여부를 기존 학습카드 게이트와 추가 fixture로 검증할 수 있다.
