---
id: curriculum-card-contract
title: Curriculum Card Contract
description: 커리큘럼 YAML sections[].blocks[]의 학습 카드 계약(SSOT) — 어떤 표현 카드가 있고, 언제 무엇을 쓰는지 사람·AI 저자가 정확히 고르게 한다.
category: architecture
section: reference
order: 210
purpose: 학습 카드 type·displayKind·필수키를 한 곳에 못박고, 의도→카드 선택을 명확히 해 type 오타·오선택·prose fallback 사고를 막는다.
whenToUse: 레슨 카드를 작성·선택할 때(저자), 새 카드 type을 추가할 때(개발), 카드 YAML 키를 바꿀 때.
---

# Curriculum Card Contract — 학습 카드 저자 가이드

<!-- SSOT: 코드(`src/codaro/curriculum/cardContract.py`의 CARD_REGISTRY)가 type→displayKind/role/필수키의 기준,
     이 문서는 그 미러이자 "언제 무엇을 쓰는가"의 SSOT다.
     게이트 `tests/curriculum/verifyCardContract.py`(quality-cycle)가 둘의 드리프트·type 오타·필수키 누락을 차단한다. -->

이 문서는 **사람과 AI가 같은 마크다운을 읽고** 효과적인 학습 카드를 고르도록 한다.
커리큘럼 YAML의 `sections[].blocks[]`는 각 블록의 `type`으로 표현을 정한다 →
`converter.py`가 `displayKind`로 바꾸고 → 프론트(`curriculumMarkdownBody.tsx`)가 카드로 렌더한다.

## AI 저자 4규칙 (작성 전 자가검증)

1. **하나의 카드 = 하나의 의도.** 의도가 둘이면 카드를 쪼갠다.
2. **아래 "의도 → 카드" 트리에서 위→아래 첫 매치를 고른다.** "쓰지 마라(NOT)"에 걸리면 이웃 카드로 이동.
3. **필수키 OR-그룹을 채운다.** 못 채우면 게이트(`verifyCardContract.py`)가 막는다.
4. **인벤토리에 없는 type을 지어내지 않는다.** 정말 없으면 사람에게 신규 등록을 요청(게이트가 미등록 type을 차단).

## 카드 시각 규칙 (3계층 표면 모델)

1. **3계층 표면 모델.** 읽기 계층 = bare 타이포(박스·아이콘칩 없음, `max-w-[70ch]`) / 신호 계층 = 좌측 2px rail(`border-l-2` + `pl-4`, 배경 없음) / 자료·상호작용 계층 = hairline 박스(`rounded-lg border`, 코드는 `bg-code`). **박스는 만지거나(에디터·버튼·링크) 시스템이 답하거나(실행 결과·터미널) 덩어리 자료(코드·표·미디어)일 때만.**
2. **본문은 `text-foreground` 100%.** `text-muted-foreground`는 키커·캡션·부제 같은 메타 전용이다. 콜아웃 본문도 학습 내용이므로 foreground.
3. **색 5계열 고정.** 무채(zinc 토큰) + accent(`--accent-brand`, 사용자 선택) + `--success` + `--warning` + `--destructive`. 유채의 형태는 ① 2px rail ② 작은 아이콘 tint ③ 한두 단어 라벨/CTA 버튼 — 이 셋뿐. 그라디언트·유채 배경면(pass 패널·완료 rail의 `bg-success/10` 제외)·순번 무지개·이모지 장식 금지.
4. **리터럴 색 클래스 0건.** `editor/src/components/curriculum/**`에서 `emerald-*`·`rose-*`·`amber-*`·`zinc-*` 같은 리터럴 Tailwind 색상 클래스를 쓰지 않는다. semantic 토큰(`text-success` 등)만 쓴다. 게이트(`verifyLearningCardPlaywright.py`)가 DOM에서 스캔해 차단한다.
5. **렌더 은폐 금지.** 콘텐츠 결함(boilerplate·중복 문구)은 YAML을 고친다. 런타임 문자열 필터를 신설하지 않는다(기존 `isGenericLearningCopy` 1개만 유지).
6. **화면 장식에 이모지를 쓰지 않는다.** `emoji`, `titleEmoji`, `endEmoji`는 레거시 입력으로만 허용하고 렌더러는 표시하지 않는다.
7. **설명카드는 학습 행동으로 이어져야 한다.** 소개형 카드 나열 뒤 실행·검증 없이 다음 개념으로 넘어가면 실패한 카드다.

## 의도 → 카드 결정 트리

```
무엇을 하려는가?
├─ 레슨/섹션 문을 연다 ................................ hero
├─ 임팩트 수치로 동기 부여 ............................ stat
├─ 새 용어를 안내한다
│   ├─ 이미 아는 것에 빗댄다(비유) .................... conceptRow
│   └─ 정확한 뜻을 못박는다(정의) .................... definition
├─ 사실/지식 전달(읽기)
│   ├─ 한 문단 서술 .................................. text
│   ├─ 나열 ......................................... list
│   ├─ 시간·단계·인과 순서 .......................... timeline
│   └─ 권위 원문 인용 ................................ note(style:example) 또는 인용 패턴(> )
├─ 비교·판단하게 한다
│   ├─ 대안 2+ 를 축별로 맞비교 ...................... compare
│   ├─ 옳은 행동 vs 틀린 행동(규범) .................. doDont
│   ├─ 착각 vs 사실(믿음 교정) ....................... misconception
│   └─ 한 대상 장점 vs 단점 .......................... choiceCards(advantages/disadvantages)
├─ 코드를 보여준다
│   ├─ 그냥 코드 ................................... code
│   ├─ before → after 변화(리팩터링) ................ codeCompare
│   ├─ 한 줄 명령/경로/import 토큰 분해 .............. anatomy
│   ├─ 코드 라인별 해설(worked example) ............. annotatedCode
│   └─ 터미널 세션(명령 + 출력) 재현 ................ terminal
├─ 직접 해보게 한다(실습)
│   ├─ 따라 하는 절차 .............................. stepCard / practiceCard
│   └─ 자유 연습(채점 동결) ......................... expansion
├─ 주의·맥락을 덧붙인다
│   ├─ 꿀팁/보조 .................................. tip / note(style:info)
│   ├─ 성공 기준 .................................. note(style:success) / success
│   ├─ 예시 박스 .................................. note(style:example) / example
│   ├─ 일반 경고 .................................. warning
│   └─ 치명·되돌릴 수 없음 ......................... danger
├─ 확인·회수한다
│   ├─ 채점 문제 .................................. quiz
│   └─ 섹션 끝 핵심 회수(TL;DR) ..................... summary
├─ 선택지로 분기 ................................... featureCards / choiceCards
├─ 구조화 데이터 .................................. table
└─ 미디어 ......................................... image / video / youtube
```

## 충돌쌍 경계 (AI 오선택 방지)

| 충돌쌍 | 경계 규칙 | 판별 키워드 |
|---|---|---|
| conceptRow vs definition | 빗대면 conceptRow / 정확한 뜻 고정이면 definition | "마치 ~같다"=conceptRow, "~란 ~이다"=definition |
| compare vs doDont | 가치중립 맞비교=compare / 옳고 그름(규범)=doDont | 정/오 판단이 있나 |
| doDont vs misconception | 행동(코드·습관)의 권장/금지=doDont / 믿음·모델의 착각/사실=misconception | "이렇게 써라"=doDont, "~라 생각하지만 실은"=misconception |
| note vs summary | 흐름 중 곁가지 보강=note / 섹션 끝 배운 것 압축 회수=summary(새 정보 금지) | 위치: 중간=note, 끝맺음=summary |
| stepCard vs timeline | 직접 따라 하는 실습 절차=stepCard / 읽고 이해하는 사건·순서=timeline | 손으로 실행하나 |
| list vs timeline | 순서 무관 나열=list / 순서·인과가 의미=timeline | 순서가 바뀌면 틀리나 |
| code vs codeCompare | 그냥 코드=code / before→after 변화=codeCompare | 두 상태를 대비하나 |
| code vs anatomy | 통짜 코드=code / 한 줄을 토큰 부품으로 분해=anatomy | 한 줄 내부 구조를 가르치나 |
| code vs annotatedCode | 주석 없는 코드=code / 라인별 해설=annotatedCode | 줄마다 "왜"를 다나 |
| code vs terminal | 코드만=code / 명령+출력 세션=terminal | 출력까지 보여주나 |
| codeCompare vs annotatedCode | 두 상태 좌우 대비=codeCompare / 한 코드 라인별 해설=annotatedCode | 두 상태인가 한 코드인가 |
| quiz vs summary | 채점 문제=quiz / 핵심 회수=summary | 채점하나 |
| warning vs danger | 일반 주의=warning / 치명·복구불가=danger | 데이터 손실·되돌릴 수 없음=danger |

## 카드 카탈로그

각 카드: **목적 / 언제(SELECT) / 쓰지마(NOT) / displayKind·role / 필수키(OR) / 예시**.
필수키는 OR-그룹(그 중 하나 이상). 선택/미지 키는 자유(게이트 무검사).

### 도입·동기

**`hero`** — 레슨/섹션 문 열기. SELECT: 첫 화면에서 주제 한 줄 + 배울 것 3~6개. NOT: 본문 중간 강조(→ note). displayKind hero / role visual. 키: `title`, `subtitle`, `points[].{title,description}`.

**`stat`** — 큰 숫자로 규모·성능·차이를 각인. SELECT: "1억+ 사용자", "10x 빠름" 같은 임팩트 수치. NOT: 일반 표(→ table), 개념 설명. displayKind stat / role visual. 필수 `(items|stats|value)`. 항목 `{value, label, delta?, trend?(up|down|flat)}`.
```yaml
- type: stat
  title: GitHub 규모
  items:
    - { value: "1억+", label: 개발자 }
    - { value: "4억+", label: 저장소 }
```

### 개념·정의

**`conceptRow`** — 개념 ↔ 비유/예시 좌우 병치(듀얼코딩). SELECT: 낯선 개념을 이미 아는 것에 빗댈 때. NOT: 정확한 뜻 고정(→ definition). displayKind conceptRow / role visual. 필수 `(rows)`. 항목 `{concept, explain, image?}`.

**`definition`** — 용어 → 뜻 → 예시 구조로 못박기(앵커링). SELECT: 본문 첫 등장 용어를 정확히 정의. NOT: 비유(→ conceptRow), 곁가지(→ note). displayKind definition / role explanation. 필수 `(items|term)`. 항목 `{term, meaning(또는 definition), english?, example?}`.
```yaml
- type: definition
  items:
    - term: 멱등성
      english: idempotency
      meaning: 같은 작업을 여러 번 해도 결과가 한 번 한 것과 같은 성질
      example: mkdir -p 는 이미 있어도 에러 없이 끝난다
```

### 비교·판단

**`compare`** — 대안 2+ 를 축별로 맞비교(가치중립). 필수 `(cards|left|right|items)`. `left/right.{title,subtitle,icon,items[]}`.

**`doDont`** — 옳은 행동 vs 틀린 행동(규범, 대조학습). SELECT: 권장 패턴과 흔한 실수를 나란히. NOT: 가치중립 비교(→ compare), 믿음 교정(→ misconception). displayKind doDont / role check. 필수 `(do|dont|items)`. `do/dont.{title?, items[]}`.
```yaml
- type: doDont
  title: 커밋 메시지
  do:   { title: 권장, items: [무엇을 왜 바꿨는지 한 줄, 한 커밋 = 한 변경] }
  dont: { title: 지양, items: ["'수정'·'asdf' 같은 무의미", 10개 변경 몰아넣기] }
```

**`misconception`** — 착각 ❌ → 사실 ✓ 교정(Codaro 진단 철학). SELECT: 초심자 오개념을 정면 교정. NOT: 행동 규범(→ doDont). displayKind misconception / role check. 필수 `(items|myth|wrong)`. 항목 `{myth(또는 wrong), truth(또는 right)}`.
```yaml
- type: misconception
  items:
    - { myth: GitHub은 코드만 올린다, truth: 문서·이력서·블로그도 올린다 }
```

**`choiceCards`** — 선택지별 장점·단점·쓸 곳. 한 대상 prosCons도 여기로. 항목 `{title, advantages[], disadvantages[], useCases[]}`.

### 흐름·순서

**`timeline`** — 시간·단계·인과 순서(세그멘팅). SELECT: 순서가 의미를 만드는 사건/생명주기. NOT: 순서 무관 나열(→ list), 직접 실습(→ stepCard). displayKind timeline / role visual. 필수 `(items|steps|events)`. 항목 `{title, description, step?}`.
```yaml
- type: timeline
  items:
    - { step: 1, title: clone, description: 원격을 내 PC로 복제 }
    - { step: 2, title: commit, description: 변경을 스냅샷으로 }
```

### 코드

**`code`** — 보여줄 코드(실행 셀 아님은 role learning). 키 `code`, `language?`.

**`codeCompare`** — before → after 코드 대비(리팩터링·개선). SELECT: 같은 코드의 두 상태를 좌우로. NOT: 단일 코드(→ code). **before/after는 문자열 필드라 실행 게이트가 돌리지 않는다**(고의 버그 코드 안전). displayKind codeCompare / role visual. 필수 `(before|after|items)`. `before/after.{label?, code}`.
```yaml
- type: codeCompare
  title: 리팩터링 전후
  before: { label: 전, code: "for i in range(len(xs)): print(xs[i])" }
  after:  { label: 후, code: "for x in xs: print(x)" }
```

**`anatomy`** — 한 줄 명령/경로/import를 토큰별로 번호 분해(세그멘팅·시그널링). SELECT: `git commit -m "msg"`처럼 한 줄의 내부 구조를 부품으로 가르칠 때. NOT: 통짜 코드(→ code), 용어 나열(→ definition). displayKind anatomy / role visual. 필수 `(parts|items|tokens)`. `code` 권장, 항목 `{token, label?, explain?}`.
```yaml
- type: anatomy
  title: git 커밋 명령의 구조
  code: 'git commit -m "first commit"'
  parts:
    - { token: git, label: 프로그램, explain: 버전 관리 도구를 부른다 }
    - { token: commit, label: 부속 명령, explain: 변경을 이력에 새긴다 }
    - { token: "-m", label: 플래그, explain: 메시지를 바로 붙인다 }
    - { token: '"first commit"', label: 인자, explain: 이번 커밋 설명 }
```

**`annotatedCode`** (alias `codeWalkthrough`) — 단일 코드의 라인별 거터 주석(worked example + self-explanation). SELECT: "왜 이 줄이 있나"를 라인마다 붙일 때. NOT: 두 상태 대비(→ codeCompare), 주석 없는 코드(→ code). displayKind annotatedCode / role visual. 필수 `(lines|code|items)`. 항목 `{code, note?}`. **lines는 문자열 필드라 실행 게이트가 돌리지 않는다.**
```yaml
- type: annotatedCode
  title: git log --oneline 읽기
  lines:
    - { code: "a1b2c3d  first commit", note: "왼쪽은 커밋 해시(지문), 오른쪽은 메시지" }
    - { code: "e4f5g6h  fix typo", note: "최신이 위, 과거가 아래" }
```

**`terminal`** — 프롬프트(`$`)+명령+출력 터미널 세션 재현(worked example). SELECT: "이 명령을 치면 무엇이 보이나"를 미리 보여줄 때. NOT: 실행 셀(→ localWorkbench), 명령만(→ code). displayKind terminal / role visual. 필수 `(lines|commands|content)`. 항목 `{cmd?, out?}`. 명령은 풀 강도, 출력은 dim 명도로만 구분(색 없음).
```yaml
- type: terminal
  title: git status는 이렇게 보인다
  lines:
    - { cmd: git status }
    - { out: "On branch main" }
    - { out: "Changes not staged for commit:" }
    - { out: "  modified: notes.txt" }
```

### 주의·콜아웃 (한 displayKind, 톤만 다름)

`note`/`tip`/`info`/`warning`/`danger`/`success`/`example`/`summary`는 모두 displayKind `callout`이다.
작성: 전용 type(`type: danger`) 또는 `type: note` + `style: danger` 둘 다 된다. 필수 `(content|title|description|items)`.

| type / style | rail·라벨 톤 | 언제 |
|---|---|---|
| `note` / `info` / `tip` / `example` / `summary` | 무채(`border-border` + muted 라벨) | 보조 설명·꿀팁·예시·핵심 회수(TL;DR, `points[]`) |
| `warning` | `--warning` | 일반 주의 |
| `danger` | `--destructive` | 치명·되돌릴 수 없음·데이터 손실 |
| `success` | `--success` | 성공 기준·권장 결과 |

```yaml
- type: summary
  title: 이것만 기억하세요
  points: [Git은 도구·GitHub은 서비스, 커밋=되돌릴 수 있는 저장 지점]
- type: danger
  title: 되돌릴 수 없음
  content: force push는 동료의 커밋을 지울 수 있다
```

### 실습·확인·구조·미디어

- **`stepCard`/`practiceCard`** — 따라 하는 실습 절차. **`expansion`** — 자유 연습(채점 동결).
- **`quiz`** — 채점 문제(`question`, `options[]`).
- **`featureCards`** — 병렬 항목 카드 그리드(`cards[].{title,description}`). **`table`** — 표(`headers[]`, `rows[][]`). **`list`** — 목록(`items[]`, `style: bullet|number|check`).
- **`image`/`video`/`youtube`** — 미디어. 마크다운 링크 `[text](url)`는 prose/콜아웃/리스트에서 클릭된다(스킴 화이트리스트). 영상은 `<video>`·youtube-nocookie iframe 인라인 임베드. **외부 hotlink 금지** — 자체 자산을 `editor/public/curriculum/<category>/<name>.svg` 상대 경로로.

## 키 컨벤션 (canonical — alias 난립 금지)

같은 의미는 같은 키를 쓴다. 새 카드도 이 키를 재사용한다.

| 의미 | canonical 키 | 도메인 고유 신규 키(예외) |
|---|---|---|
| 항목 배열 | `items` | rows(conceptRow/definition), steps/events(timeline), stats(stat) |
| 제목/이름 | `title` | term(definition), concept(conceptRow) |
| 본문 | `description` 또는 `content` | meaning/definition, explain, truth/myth |
| 코드 | `code` | — |
| 강조색 | `accent` | 레거시 호환용. 화면 색 지정으로 쓰지 않는다 |
| 콜아웃 톤 | `style` 또는 `tone` | — |

## 새 카드 type 추가 절차 (개발)

새 카드 = **코드 5곳 + 문서 1곳 동기 변경**(하나라도 빠지면 게이트/드리프트):
1. `src/codaro/curriculum/cardContract.py` — `CARD_REGISTRY`에 `CardSpec(displayKind, role, requiredKeys)` 1줄. requiredKeys는 **느슨하게**(흔한 키 OR-그룹) — 기존 코퍼스 무파손.
2. `src/codaro/curriculum/converter.py` — `_convertBlock` 분기(+ 필요 시 formatter). 기존 displayKind 재사용이면 해당 `*_TYPES` set에 추가만.
3. `editor/src/lib/curriculaRegistry.ts` — 번들 변환 미러 분기 + `blockTypeLabel`.
4. `editor/src/components/curriculum/curriculumMarkdownBody.tsx` — 신규 displayKind면 디스패치 분기 + 컴포넌트. 콜아웃 톤이면 `CALLOUT_TONES`만 확장.
5. `editor/src/lib/cellSchema.ts` — 신규 displayKind면 `cellDisplayKinds`에 리터럴.
6. **이 문서** — 카탈로그·결정 트리·충돌쌍에 1항목.

추가 규약:
- **기존 displayKind 재사용이 가능하면 신규 displayKind 만들지 않는다**(콜아웃 톤·compare·cardGrid로 표현되면 0~2파일로 끝).
- **신규 카드는 최소 1개 레슨이 실제로 쓴다**(미사용 카드 금지) — 등록과 사용을 같은 변경에 묶는다.
- 레지스트리는 additive-only. 기존 엔트리 키/requiredKeys 변경 금지(회귀). 폐기는 alias로만.
