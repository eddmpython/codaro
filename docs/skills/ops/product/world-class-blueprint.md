---
id: world-class-blueprint
title: 세계 1위 학습·자동화 청사진
description: PRD-level blueprint for making Codaro the leading education and automation AI product.
category: ops
section: product
order: 332
purpose: Codaro가 세계 최고 수준의 교육 AI이자 자동화 AI가 되기 위한 제품 정의, 차별화, 요구사항, 로드맵, 검증 기준을 고정한다.
whenToUse: 장기 제품 전략, 학습/자동화 통합 기능, 경쟁 포지셔닝, 1위 수준 품질 기준, roadmap 우선순위를 결정할 때.
---

# 세계 1위 학습·자동화 청사진

이 문서는 Codaro를 "좋은 로컬 노트북"이 아니라 **세계 최고 수준의 실행형 학습 + 개인 자동화 AI**로 만들기 위한 PRD다. 기준 id는 `world-class-blueprint`다. 목표는 거대 범용 모델, 대형 강의 플랫폼, SaaS 자동화 플랫폼을 정면으로 복제하는 것이 아니다. Codaro가 1위가 될 수 있는 카테고리를 선명히 정의하고, 그 카테고리에서 제품, 학습 성과, 자동화 성공률, 신뢰성, 배포 품질을 증거로 이기는 것이다.

## 한 줄 정의

Codaro는 **배우는 코드가 즉시 실행되고, 실행한 코드가 안전한 개인 자동화로 성장하는 local-first AI 스튜디오**다.

## 핵심 판단

세계 1위 가능성은 "AI 튜터"와 "자동화 툴"을 나란히 붙이는 데 있지 않다. 경쟁력은 아래 연결 고리에서 나온다.

```text
목표 대화
→ structured curriculum YAML
→ 섹션 학습카드
→ 셀 실행/검증
→ percent-format recipe
→ dry-run 자동화
→ task/schedule/webhook/workflow
→ audit/report/외부 알림
```

대부분의 교육 AI는 설명과 피드백에서 멈춘다. 대부분의 자동화 AI는 사용자가 무엇을 모르는지, 어떻게 배워야 하는지, 왜 실패했는지를 가르치지 못한다. Codaro는 이 둘 사이의 빈 공간, 즉 **학습자가 직접 이해한 코드를 반복 업무로 전환하는 순간**을 제품 중심으로 잡는다.

## 배경과 외부 신호

외부 확인일: 2026-05-25.

| 영역 | 대표 신호 | Codaro가 읽어야 할 의미 |
|---|---|---|
| 교육형 튜터 | [Khanmigo](https://www.khanacademy.org/khan-labs)는 답을 바로 주기보다 학습자가 스스로 발견하도록 유도하고, 교사용 업무 지원과 학습 콘텐츠 라이브러리를 결합한다. | 학습 AI의 상위 기준은 대화 품질만이 아니라 교육 철학, 콘텐츠, 교사/학습자 워크플로우까지 포함한다. |
| 범용 학습 모드 | [Study Mode FAQ](https://help.openai.com/en/articles/11780217)는 Socratic 질문, 단계적 설명, 개인화, 이해 확인, 업로드 자료 참조를 핵심 기능으로 둔다. | 단순 설명형 답변은 이미 commodity다. Codaro는 실행 셀, 검증, 자동화 전환으로 차별화해야 한다. |
| 교육 특화 모델 | [LearnLM](https://cloud.google.com/solutions/learnlm?hl=en)은 학습 과학을 모델과 제품에 주입해 더 교육적인 경험을 목표로 한다. | Codaro의 학습 사상은 prompt 문구가 아니라 YAML 계약, materializer, gate, UI로 강제되어야 한다. |
| 직무 기반 온라인 학습 | [Coursera Coach](https://www.coursera.org/explore/coach)는 전문가 콘텐츠에 기반한 맞춤 지원, 개념 설명, 요약, 연습, 직무 적용을 제공한다. | Codaro도 "학습 결과가 실제 업무 행동으로 이어지는가"를 핵심 성과로 삼아야 한다. |
| 앱 연결 자동화 | [Zapier Agents](https://help.zapier.com/hc/en-us/articles/24393442652557-Build-an-agent-in-Zapier-Agents)는 수천 개 앱을 이용해 작업을 자동화하는 에이전트를 만든다. | 앱 통합 수로 정면 경쟁하면 불리하다. Codaro는 로컬 Python, 파일, 데스크톱, 학습 기반 자동화를 점령해야 한다. |
| 엔터프라이즈 자동화 | [UiPath agentic automation](https://www.uipath.com/platform/agentic-automation/agentic-ai)은 governance, monitoring, access control, audit trail, robots/workflows orchestration을 강조한다. | 자동화 1위 품질은 멋진 데모가 아니라 guardrail, audit, scale, 운영 신뢰가 기준이다. |
| 시각적 자동화 플랫폼 | [Make AI Agents](https://www.make.com/en/ai-agents)는 3,000개 이상 앱, 투명한 의사결정, 신뢰 가능한 자동화를 내세운다. | Codaro의 차별점은 visual canvas가 아니라 코드가 남는 local-first recipe와 실행 가능한 학습 자산이다. |
| 컴퓨터 사용 에이전트 | [Computer-Using Agent](https://openai.com/index/computer-using-agent/)는 화면 픽셀, 마우스, 키보드 기반의 범용 조작과 민감 행동 확인을 강조한다. | Codaro의 AI 감각계는 반드시 InputGuard, dry-run, E-Stop, 확인 단계와 함께 제품화되어야 한다. |
| 코드 에이전트 | [GitHub Copilot cloud agent docs](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)는 별도 실행 환경에서 코드 탐색, 변경, 테스트, PR 생성을 수행한다. | Codaro는 PR 생성보다 학습자 로컬 실행, 셀 단위 피드백, 자동화 task 전환에 집중해야 한다. |
| 개인 자동화 | [Apple Shortcuts personal automation](https://support.apple.com/guide/shortcuts/intro-to-personal-automation-apd690170742/ios)는 시간, 위치, 앱 열기 같은 트리거로 자동화를 실행한다. | 개인 자동화는 복잡한 엔터프라이즈 워크플로우 이전에 습관, 장치, 반복 루틴을 잡는다. Codaro는 데스크톱과 모바일 채널을 이어야 한다. |

## 카테고리 정의

Codaro가 만들어야 할 카테고리는 **Executable Learning Automation Studio**다.

이 카테고리의 조건:

- 학습 콘텐츠는 읽기 자료가 아니라 실행 가능한 curriculum YAML이다.
- 학습 단위는 대화 답변이 아니라 셀, 실행 결과, 검증 결과다.
- 학습 완료는 정답 확인이 아니라 재사용 가능한 코드 산출물이다.
- 자동화는 블랙박스 agent 행동이 아니라 percent-format Python recipe다.
- 자동화의 첫 실행은 기본 dry-run이며, 실제 side effect는 확인과 audit 뒤에만 허용한다.
- 같은 문서는 에디터에서는 노트북, 커리큘럼에서는 학습 셀, 자동화에서는 task 원본이 된다.
- AI는 선택적이다. AI 없이도 기본 커리큘럼과 로컬 실행은 완주 가능해야 한다.

## 성공 정의

Codaro가 1위라고 말하려면 아래 중 하나가 아니라 전부가 증명되어야 한다.

| 축 | 1위 기준 | 증거 |
|---|---|---|
| 학습 성과 | 초보자가 설명을 소비하는 데서 끝나지 않고 예측, 실행, 오류 수정, 검증, 실무 변주를 완주한다. | `curriculum-quality-matrix`, `curriculum-top-tier-audit`, 학습 세션 completion telemetry |
| 실행 신뢰 | 셀 실행, 패키지 준비, runtime 복구가 사용자에게 이해 가능한 행동으로 이어진다. | `runtime-recovery-contract`, `runtime-recovery-browser`, `editor-runtime-preflight` |
| 자동화 전환 | 학습에서 만든 코드가 dry-run recipe, task, schedule, webhook으로 자연스럽게 승격된다. | 새 `learning-to-automation-e2e` gate, `automation-ide-audit` |
| 자동화 안전 | 클릭, 입력, 파일 쓰기, 외부 전송 같은 side effect가 정책, 확인, E-Stop, audit 아래에서만 실행된다. | `automation-ide-audit`, 새 `automation-safety-benchmark` |
| 교사 루프 품질 | AI가 긴 답변 대신 YAML, 셀 읽기/쓰기, 패키지 확인, 셀 실행/검증으로 상태를 바꾼다. | `teacher-e2e`, `assistant-workloop-contract`, `ai-live-smoke` |
| 운영 품질 | 설치, 업데이트, rollback, diagnostic, provider 설정이 반복 사용에서 깨지지 않는다. | `quality-cycle`, `install-launcher-smoke` |
| 신뢰와 배포 | 공개 사용자가 로컬 데이터 경계, 보안, 지원, 공급망을 확인할 수 있다. | root trust docs |

## 목표 사용자

### 1. Python 입문자

문제:

- 문법을 배워도 실제로 어디에 쓰는지 모른다.
- 강의와 실행 환경이 떨어져 있어 설치, 패키지, 파일 경로에서 막힌다.
- AI에게 답을 받으면 당장은 풀리지만 실력이 쌓였는지 모른다.

Codaro 약속:

- 학습카드 안에서 바로 입력하고 실행한다.
- 실패 메시지가 다음 행동으로 번역된다.
- 매 레슨은 재사용 가능한 작은 업무 루틴으로 끝난다.

### 2. 개인 자동화 사용자

문제:

- Zapier/Make류 자동화는 앱 연결에는 강하지만 로컬 파일, Python 데이터 처리, 데스크톱 앱 조작은 어렵다.
- 코드 자동화는 강력하지만 직접 고치기 어렵고 무섭다.
- 에이전트가 무엇을 할지 보이지 않으면 신뢰할 수 없다.

Codaro 약속:

- 자연어 요청을 percent-format recipe로 만든다.
- 첫 실행은 dry-run이며 실제 변경 전 diff와 계획을 보여준다.
- 클릭/입력/파일/웹훅/알림은 audit와 E-Stop 아래에서 실행된다.

### 3. 강의자와 코치

문제:

- 학습 콘텐츠, 실습 환경, 피드백, 과제 자동화가 서로 다른 도구에 흩어진다.
- 학습자가 어디서 막혔는지 실행 증거 없이 추측한다.

Codaro 약속:

- curriculum YAML 하나가 학습 설계, 실행 셀, 검증 셀의 SSOT다.
- 학습자의 실행 결과와 오류 패턴을 근거로 보충 셀을 만든다.
- 강의자는 레슨을 "업무 루틴으로 끝나는 실습"으로 설계할 수 있다.

### 4. 로컬 운영자와 파워유저

문제:

- 회사/개인 파일과 로컬 앱을 다루는 자동화는 cloud-only 서비스에 맡기기 어렵다.
- 실패, 권한, 패키지, 외부 앱 상태가 섞이면 원인 파악이 어렵다.

Codaro 약속:

- launcher가 runtime과 bundle을 관리한다.
- 외부 앱, 로그인, OS 권한은 capability diagnostics로 분리한다.
- 문제는 provider/runtime/package/frontend/automation category로 진단된다.

## 제품 원칙

1. **답변보다 상태 변경**: 학습 요청은 긴 설명보다 `write-curriculum-yaml`, 셀 materialize, `cell-call` 결과로 완성된다.
2. **배움은 실행으로 검증**: 설명, 예측, 코드, 실행 결과, 검증, 변주가 한 카드에 있어야 한다.
3. **자동화는 학습의 졸업 결과**: 좋은 레슨은 "이 코드로 무엇을 자동화할 수 있는가"까지 보여준다.
4. **로컬이 기본, 클라우드는 선택**: 기본 curriculum과 local Python 실행은 provider 없이도 동작한다.
5. **모든 side effect는 눈에 보여야 한다**: 파일 쓰기, 클릭, 입력, 외부 전송은 dry-run, 확인, audit, E-Stop을 통과한다.
6. **GUI와 API는 같은 제품**: 화면에서 되는 일은 API/tool에서도 되어야 한다.
7. **품질은 gate로 증명**: 세계 1위 표현은 내부 감상이 아니라 user flow, benchmark, audit artifact로만 말한다.

## 핵심 제품 루프

### Loop A: 목표에서 학습까지

```text
사용자: "회사 지출 CSV를 요약하는 법을 배우고 싶다"
→ clarification gate가 수준/환경/결과물을 확인
→ structured curriculum YAML 생성
→ 섹션 학습카드 렌더링
→ packages-check
→ exercise cell 입력
→ cell-call 실행/검증
→ 오류 시 힌트, 수정, 재실행
```

완료 조건:

- `contractGapCount=0`
- 최소 1개 예측 prompt
- 최소 1개 `assert` 또는 명시 검증
- 최소 1개 실무 변주
- 셀 실행 결과가 UI와 trace에 남음

### Loop B: 학습에서 자동화까지

```text
학습 완료 코드
→ "반복 실행 루틴으로 만들기"
→ write-automation-recipe
→ dry-run 계획
→ packages-check
→ cell-call dry-run 검증
→ create-automation-task
→ schedule/webhook/manual run
→ audit/report/notification
```

완료 조건:

- recipe는 `# %% [markdown]`과 `# %% [automation]`을 가진다.
- 기본 `DRY_RUN = True`다.
- workspace 내부 `automations/{slug}.py`에 저장된다.
- 실제 side effect 전 사용자 확인 또는 policy approval이 필요하다.
- task run은 성공/실패/취소 모두 audit record를 남긴다.

### Loop C: 데스크톱 감각계 자동화

```text
사용자: "매일 이 사이트에서 리포트를 내려받아 요약해줘"
→ 현재 화면/앱 capability 확인
→ capture-screen/read-screen-text/detect-elements plan
→ write-automation-recipe
→ dry-run
→ find-element/wait-for 검증
→ 제한된 click/type/hotkey 실행
→ 결과 파일 검증
→ task 등록
```

완료 조건:

- InputGuard가 좌표, 속도, 영역 제한을 적용한다.
- sensitive action은 confirmation이 필요하다.
- E-Stop active 상태에서는 어떤 입력도 실행되지 않는다.
- 실패 시 재시도 횟수, consecutive failure abort, 마지막 화면 증거가 남는다.

## 기능 요구사항

### P0. 학습 엔진

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| LE-01 | 모든 신규 학습 생성은 structured YAML을 우선한다. | `meta`, `intro.diagram`, `sections[].goal/why/explanation/tips/snippet/exercise/check`가 있고 `contractGapCount=0`이다. |
| LE-02 | 학습카드는 예측, 실행, 오류 수정, 검증, 실무 변주를 포함한다. | `curriculum-top-tier-audit`에 예측/검증/변주 coverage가 추가된다. |
| LE-03 | 학습자 답 확인은 셀 실행 없이 단정하지 않는다. | `answer-checking` skill이 `read-cells → cell-call → get-variables` 경로를 사용한다. |
| LE-04 | 레슨마다 "자동화로 키우기" CTA를 제공한다. | 완료된 exercise cell에서 `write-automation-recipe` 진입점이 열린다. |
| LE-05 | 학습 진행은 단순 퍼센트가 아니라 현재 단계와 다음 행동으로 표시된다. | UI에 `예측`, `실행`, `수정`, `검증`, `자동화로 전환` 상태가 보인다. |

### P0. Teacher tool loop

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| TL-01 | 모호한 요청은 provider 호출 전에 clarification gate에서 멈춘다. | `teacher-e2e` clarification case가 provider tool sequence empty를 증명한다. |
| TL-02 | 외부 패키지 실행은 `packages-check → packages-install → cell-call` 순서를 지킨다. | policy violation 없이 exact sequence가 trace에 남는다. |
| TL-03 | tool result는 다음 provider 호출에 bounded JSON signal로 들어간다. | e2e가 `role: tool` 결과 재주입을 검증한다. |
| TL-04 | workloop는 raw JSON 대신 사람이 읽는 단계와 결과를 보여준다. | `assistant-workloop-contract`가 label/detail/error를 검증한다. |
| TL-05 | provider 실패는 진단 category와 다음 행동으로 분류된다. | `diagnostic-summary-contract`와 `ai-live-smoke`가 diagnostic action을 남긴다. |

### P0. 자동화 엔진

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| AE-01 | 자동화 작성은 curriculum YAML이 아니라 percent-format recipe를 SSOT로 둔다. | `write-automation-recipe` 결과가 `.py` recipe와 automation cell을 만든다. |
| AE-02 | 모든 recipe는 dry-run을 기본값으로 한다. | `dryRunFirst`가 기본 true이며 UI가 실동작 전 검토를 요구한다. |
| AE-03 | task 등록은 workspace 내부 검증된 recipe만 허용한다. | workspace 밖 path와 존재하지 않는 path는 `create-automation-task`에서 실패한다. |
| AE-04 | scheduler, webhook, manual run이 같은 task registry를 사용한다. | `automation-ide-audit`가 route/registry/runner 연결을 검증한다. |
| AE-05 | E-Stop은 task runner와 input action 모두에서 즉시 적용된다. | E-Stop active 상태에서 run은 `cancelled` audit entry를 남긴다. |
| AE-06 | 자동화 실행 결과는 report 산출물로 남는다. | task run 결과가 stdout/error/variables/duration/report link를 보존한다. |

### P1. 감각계

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| SS-01 | 화면 읽기는 capture, OCR, element detection으로 분리한다. | `capture-screen`, `read-screen-text`, `detect-elements` tool result가 각각 독립 payload를 가진다. |
| SS-02 | 입력 행동은 InputGuard를 통과한다. | `click-element`, `type-text`, `press-hotkey`가 region/rate/blocked-area 정책을 따른다. |
| SS-03 | 녹화는 실행 가능한 percent-format recipe로 변환된다. | `start-recording → stop-recording` 결과가 markdown/automation 셀 구조를 가진다. |
| SS-04 | 화면 조작 recipe는 plan-first로 생성된다. | 실제 click/type 전에 dry-run plan과 target evidence가 보인다. |
| SS-05 | 민감 행동은 확인 없이 실행하지 않는다. | 파일 삭제, 외부 전송, 결제/로그인/개인정보 입력은 policy approval 없이는 block된다. |

### P1. 런처와 번들

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| LD-01 | 최종 사용자는 Python 설치를 몰라도 실행할 수 있다. | `Codaro.exe`가 embedded runtime과 exact wheel을 관리한다. |
| LD-02 | 자동화 capability는 curated bundle로 제공한다. | `codaro-excel`, `codaro-browser`, `codaro-db`, `codaro-ai-local` 같은 bundle manifest가 capability probe를 가진다. |
| LD-03 | 외부 앱과 드라이버는 user-managed boundary로 표시한다. | Excel, 브라우저 로그인, DB 서버, OS 권한 상태가 diagnostics에 분리된다. |
| LD-04 | update는 health probe 후 active release를 바꾼다. | 실패 시 last-known-good rollback이 동작한다. |

### P1. 성과와 개인화

| ID | 요구사항 | 수용 기준 |
|---|---|---|
| PM-01 | 학습자 skill graph를 셀 실행 증거 기반으로 만든다. | 개념, exercise, 오류 유형, 재시도, 자동화 전환 이력이 기록된다. |
| PM-02 | 보충 설명은 대화 기록보다 실행 실패 원인을 우선한다. | 같은 오류 2회 이상이면 힌트 단계가 올라가고, 다른 예제 변주가 제안된다. |
| PM-03 | 자동화 추천은 학습 완료 코드에서 나온다. | 레슨 종료 시 "반복 실행 루틴 후보"가 코드 의존성과 side effect 기준으로 계산된다. |
| PM-04 | 개인화 데이터는 local-first 저장소에 둔다. | export/redaction 경계가 diagnostic summary와 일치한다. |

## 비기능 요구사항

| 영역 | 요구사항 |
|---|---|
| 신뢰성 | 한 번 성공한 경로가 아니라 여러 turn, 여러 레슨, 여러 셀 실행에서 stale state가 섞이지 않아야 한다. |
| 성능 | 첫 화면과 기본 curriculum registry는 가볍게 로드하고, 레슨 YAML과 무거운 editor/runtime 기능은 lazy loading한다. |
| 접근성 | keyboard navigation, focus state, contrast, mobile text overflow를 WCAG 2.2 기준으로 검증한다. |
| 보안 | token/API key/secret은 diagnostic, log, report에 남지 않는다. 자동화 입력은 guardrail과 audit를 통과한다. |
| 관측성 | provider/model/latency/error/tool sequence/workloop trace가 turn 단위로 남는다. |
| 배포 | launcher manifest는 exact version과 sha256을 사용한다. arbitrary latest install을 기본 동작으로 삼지 않는다. |
| 복구 | provider/runtime/package/frontend/automation failure를 분리하고 각각 다음 행동을 제시한다. |

## UX 요구사항

### 첫 화면

- 첫 화면은 채팅 진입이지만, provider 연결 전에는 실제 provider 응답처럼 보이면 안 된다.
- `Provider 연결`, `기본 커리큘럼 시작`, `5분 데모 실행`, `자동화 dry-run 만들기`가 선명해야 한다.
- provider 연결 없이도 `Python 30일`, `파일 정리 dry-run`, `CSV 요약 demo`는 시작 가능해야 한다.

### 커리큘럼 화면

- 왼쪽은 `Codaro 커리큘럼`과 `나만의 커리큘럼`을 분리한다.
- 본문은 레슨 개요와 섹션 학습카드다.
- 각 섹션은 스니펫, 학습자 입력 editor, 실행 결과, 검증 피드백을 한 카드 안에서 보여준다.
- 셀 도움 요청은 해당 셀 안에서 열리고, hover-only가 아니어야 한다.
- 레슨 완료 상태에서 자동화 전환 CTA가 보인다.

### 자동화 화면

- `Codaro 자동화`, `나만의 자동화`, `태스크`, scheduler metric, audit count, E-Stop이 한 화면에 있어야 한다.
- 자동화 상세는 recipe, dry-run plan, required packages, side-effect policy, task history, report를 탭으로 보여준다.
- run button은 dry-run, confirm run, schedule run을 구분한다.
- E-Stop은 시각적으로 숨지 않고 모든 자동화 표면에서 접근 가능해야 한다.

### 채팅 화면

- 답변 텍스트보다 생성된 curriculum/automation 초안, 적용 대기 중인 변경, 실행 상태가 우선이다.
- tool lifecycle은 숨기지 않되, 기본 화면은 사람이 읽는 workloop로 요약한다.
- raw trace는 펼쳐볼 수 있어야 하지만 기본 학습 흐름을 방해하지 않는다.

## 아키텍처 요구사항

### 레이어

```text
core
→ engine(document/kernel/runtime/system)
→ domain(curriculum/ai/automation)
→ transport(api/webBuild)
→ entry(server.py/cli.py/launcher)
```

원칙:

- router는 판단하지 않는다.
- provider loop는 `ai/teacher/`가 소유한다.
- editor UI는 `editor/src/lib/*`를 통해서만 context와 API payload를 조립한다.
- tool 추가는 `tools.py`, `toolManifest.py`, `toolHandlers/*`, eval harness를 함께 갱신한다.
- 셀 schema 변경은 frontend/backend schema와 document model을 함께 갱신한다.

### 데이터 모델

| 객체 | 책임 |
|---|---|
| `CurriculumSpec` | YAML lesson SSOT. 목표, intro, sections, packages, checks를 보존한다. |
| `Document` | materialized notebook/cell state. 커리큘럼, 에디터, 자동화가 공유한다. |
| `Cell` | `type`, `role`, `displayKind`, `executionKind`, `payload`, `resultStatus`를 가진 실행/학습 단위. |
| `RuntimeResult` | 셀 실행 결과. stdout, error, variables, check result를 포함한다. |
| `AutomationRecipe` | percent-format `.py` 자동화 원본. markdown 설명 셀과 automation 실행 셀을 가진다. |
| `AutomationTask` | recipe/documentPath, schedule, inputs, status, lastRun, audit references를 가진 예약 단위. |
| `AuditEntry` | actor, actionType, parameters, success, timestamp, duration, error를 가진 JSONL 기록. |
| `SkillGraph` | 학습 개념, 실행 증거, 오류 유형, 자동화 전환 이력을 연결한다. |

### Tool lanes

| Lane | Tools | 정책 |
|---|---|---|
| curriculum | `write-curriculum-yaml` | structured YAML, contract gap 0, materialize 필수 |
| read | `read-cells`, `get-variables` | 현재 상태를 읽지 않고 수정/검증 단정 금지 |
| write | `write-cell` | 셀 역할과 displayKind를 유지 |
| dependency | `packages-check`, `packages-install` | 누락 확인 뒤 설치, uv 경로만 사용 |
| cell-call | `cell-call` | dependency preflight 완료 뒤 실행 |
| automation-authoring | `write-automation-recipe` | percent-format, dry-run 기본 |
| task | `create-automation-task`, scheduler/webhook | 검증된 workspace 내부 recipe만 등록 |
| sensory | `capture-screen`, `read-screen-text`, `find-element`, `click-element`, `type-text` | E-Stop, InputGuard, audit 필수 |

## 전략적 해자

1. **Curriculum-to-Task compiler**
   - 학습 YAML과 자동화 recipe를 연결하는 변환기가 핵심 해자다.
   - 경쟁 제품은 학습 또는 자동화 중 하나만 강하다. Codaro는 학습 완료 산출물을 자동화로 승격한다.

2. **Local-first execution evidence**
   - 학습자가 실제 자기 컴퓨터에서 실행한 결과가 곧 피드백 근거다.
   - 파일, Excel, 브라우저, 로컬 패키지 같은 현실 맥락을 다룰 수 있다.

3. **Inspectable tool loop**
   - AI가 실제로 본 context, 호출한 tool, 실행 결과가 검토 가능하다.
   - 신뢰는 "모델이 똑똑하다"가 아니라 "무엇을 했는지 볼 수 있다"에서 나온다.

4. **Safety-native automation**
   - dry-run, InputGuard, E-Stop, audit, report가 제품 기본이다.
   - 자동화 AI의 품질 기준을 "성공 데모"가 아니라 "실패해도 안전한 실행"으로 잡는다.

5. **One document model**
   - 같은 `.py`와 cell model이 학습, 편집, 자동화, task를 관통한다.
   - 사용자가 배운 내용과 자동화 원본이 흩어지지 않는다.

6. **Launcher-managed capability bundles**
   - 일반 사용자가 Python, wheel, desktop automation dependency를 직접 다루지 않게 한다.
   - 동시에 외부 앱과 로그인 같은 user-managed boundary는 명확히 드러낸다.

## 로드맵

### Phase 0: Evidence baseline

목표: 현재 제품이 문서와 gate로 어디까지 증명되는지 최신 HEAD 기준으로 재정렬한다.

필수 산출물:

- 최신 `quality-cycle`
- stale artifact 없는 `gitHead` 일치
- `world-class-blueprint` 문서가 generated docs에 반영됨

Stop rule:

- clean HEAD와 artifact head가 다르면 "세계 최고 수준 준비" 표현 금지.

### Phase 1: First complete learner-to-automation path

목표: 한 사용자가 provider 없이도, provider가 있어도, 같은 경로로 "학습 → 실행 → 자동화 dry-run → task 등록"을 완주한다.

범위:

- CSV 요약 레슨을 structured YAML로 제공
- 셀 실행/검증
- "자동화로 만들기" CTA
- recipe 생성
- dry-run 검증
- task 등록
- audit/report 확인

새 gate:

```bash
uv run python -X utf8 tests/run.py gate learning-to-automation-e2e
```

합격 기준:

- provider-offline fallback case 통과
- scripted provider case 통과
- `packages-check → cell-call → write-automation-recipe → cell-call dry-run → create-automation-task` 흐름 증명
- side effect 없음

### Phase 2: Top-tier teacher

목표: 교육 AI로서 "답변"이 아니라 학습 효과를 만든다.

범위:

- skill graph
- 3단계 힌트
- 반복 실패 진단
- 개인화 보충 셀
- lesson outcome rubric
- instructor export

새 gate:

```bash
uv run python -X utf8 tests/run.py gate teacher-outcome-benchmark
```

합격 기준:

- 학습자가 바로 답을 받는 비율보다 예측/실행/수정 완주율을 우선 측정
- 같은 개념을 최소 2개 맥락으로 변주
- 오류 유형별 피드백 정확도 측정

### Phase 3: Safety-native desktop automation

목표: Codaro가 로컬 데스크톱 자동화를 안전하게 가르치고 실행한다.

범위:

- capture/OCR/element detection UI
- plan-first desktop recipe
- InputGuard policy editor
- confirmation gates
- E-Stop visible everywhere
- task report replay

새 gate:

```bash
uv run python -X utf8 tests/run.py gate automation-safety-benchmark
```

합격 기준:

- blocked region click 차단
- sensitive action confirmation 요구
- E-Stop active에서 all input blocked
- failure replay report 생성

### Phase 4: Launcher distribution and bundles

목표: 일반 사용자가 설치와 복구를 이해하지 않아도 Codaro를 시작한다.

범위:

- Codaro.exe install/update/rollback
- `codaro-excel`, `codaro-browser`, `codaro-db` bundle baseline
- capability diagnostics UI
- release manifest signing/checksum

합격 기준:

- `install-launcher-smoke`
- real backend rollback test
- bundle capability probe report

### Phase 5: Network effects without hosted lock-in

목표: local-first를 유지하면서 공유 가능한 학습/자동화 자산 생태계를 만든다.

범위:

- curriculum pack export/import
- automation recipe gallery
- safe template review
- instructor pack
- team-local library

제약:

- 상업적 재사용과 브랜드 권리는 기존 라이선스 경계를 따른다.
- 공유 자산은 secret, local path, token을 포함하면 안 된다.

## North Star Metrics

| Metric | 목표 |
|---|---|
| `learnerToAutomationCompletionRate` | 첫 학습 세션 중 30% 이상이 dry-run 자동화까지 도달 |
| `firstRunTimeToValue` | 설치 후 5분 안에 실행 결과 또는 dry-run plan 확인 |
| `exercisePassAfterFeedbackRate` | 실패 후 2회 이내 수정 성공률 70% 이상 |
| `automationDryRunAccuracy` | dry-run plan과 실제 실행 step 일치율 95% 이상 |
| `taskRunSuccessRate` | non-side-effect task 성공률 95% 이상 |
| `unsafeActionBlockedRate` | 정책상 차단해야 할 입력/파일/외부 전송 100% 차단 |
| `staleStateLeakCount` | provider/tool/runtime stale state leak 0 |
| `diagnosticActionCoverage` | 주요 실패 category의 다음 행동 coverage 100% |
| `curriculumContractGapRate` | 신규 structured curriculum gap 0% |

## 실패 모드와 대응

| 실패 모드 | 위험 | 대응 |
|---|---|---|
| AI가 답만 주고 학습을 끝낸다 | 교육 제품이 commodity가 된다. | `write-curriculum-yaml`와 `cell-call` 없는 학습 완료를 실패로 본다. |
| 자동화가 무서워서 사용자가 실행하지 않는다 | 자동화 전환율이 낮아진다. | dry-run plan, diff, side effect labels, confirmation을 기본화한다. |
| 자동화가 실제 파일/앱을 망가뜨린다 | 신뢰가 무너진다. | InputGuard, E-Stop, audit, undo/rollback 가능한 action부터 확장한다. |
| 학습과 자동화가 UI상 분리된다 | Codaro의 핵심 차별점이 사라진다. | 레슨 완료 CTA와 recipe conversion을 모든 실무 레슨에 둔다. |
| 패키지 설치가 학습 흐름을 깨뜨린다 | 초보자가 이탈한다. | package panel은 `N/M`, 첫 오류 줄, 재시도 행동을 보여준다. |
| 문서만 세계 최고라고 말한다 | 제품 판단이 약해진다. | 모든 claim은 gate, report, telemetry metric과 연결한다. |

## Verification Matrix

| 요구사항 묶음 | 기존 gate | 추가해야 할 gate |
|---|---|---|
| 제품 기본 품질 | `quality-cycle`, `product-quality-audit` | 없음 |
| 첫 사용자 완주 | `dogfood-alpha-audit`, `onboarding-browser` | `learning-to-automation-e2e` |
| 학습 품질 | `curriculum-quality-matrix`, `curriculum-top-tier-audit`, `learning-system-readiness` | `teacher-outcome-benchmark` |
| Teacher loop | `teacher-e2e`, `assistant-workloop-contract`, `ai-live-smoke` | live provider learning outcome sample |
| 자동화 IDE | `automation-ide-audit` | `automation-safety-benchmark` |
| 런타임 복구 | `runtime-recovery-contract`, `runtime-recovery-browser` | task report replay check |
| 배포 | `install-launcher-smoke`, `launcher-test` | real backend rollback smoke |
| 공개 신뢰 | root trust docs | template safety audit |

## Non-goals

- 모든 과목을 대형 교육 플랫폼처럼 커버하지 않는다.
- 수천 개 SaaS connector 수로 Zapier/Make와 경쟁하지 않는다.
- 엔터프라이즈 RPA suite 전체를 복제하지 않는다.
- AI가 항상 실동작을 수행하는 무감독 자동화를 기본값으로 삼지 않는다.
- 학습 품질을 단순 대화 만족도로 판단하지 않는다.
- hosted service를 전제로 local-first 경계를 무너뜨리지 않는다.

## 의사결정 원칙

새 기능 우선순위는 아래 순서로 결정한다.

1. 학습자가 직접 실행하고 검증하는가?
2. 그 실행 결과가 자동화 recipe로 승격될 수 있는가?
3. 실패했을 때 원인과 다음 행동이 보이는가?
4. side effect가 dry-run, confirmation, audit 아래 있는가?
5. 같은 기능이 GUI와 API/tool에서 모두 가능한가?
6. gate로 회귀를 막을 수 있는가?

이 기준을 통과하지 못하는 기능은 세계 1위 청사진에 맞지 않는다.

## 첫 실행 PRD

### Scenario

사용자가 Codaro를 처음 열고 이렇게 입력한다.

> 다운로드 폴더의 CSV 지출 파일을 요약하는 법을 배우고, 매주 월요일 자동으로 리포트 만들게 하고 싶다.

### Expected Product Behavior

1. Codaro는 사용자의 수준, 로컬 파일 경계, 원하는 산출물만 짧게 확인한다.
2. `CSV 지출 요약` structured curriculum YAML을 만든다.
3. 커리큘럼 화면에 학습카드를 연다.
4. 첫 섹션에서 작은 sample CSV를 `tempfile` 기반으로 만들고 읽는다.
5. 사용자는 category별 합계를 예측한다.
6. 셀을 실행하고 결과를 확인한다.
7. 실패하면 패키지/파일/코드 오류가 분리되어 보인다.
8. 완료 후 `이 코드를 자동화로 만들기`를 누른다.
9. Codaro는 `automations/weekly-expense-summary.py` recipe를 만든다.
10. dry-run에서 어떤 파일을 읽고 어떤 report를 만들지 보여준다.
11. 사용자가 확인하면 task를 `@weekly_monday_09` 또는 지원 schedule로 등록한다.
12. task run 결과는 report와 audit에 남고, 외부 채널 알림은 선택 사항이다.

### Acceptance Criteria

- provider가 없어도 기본 fallback demo로 1-8단계를 볼 수 있다.
- provider가 있으면 1-12단계를 tool loop로 완주한다.
- 파일 쓰기는 dry-run 전에는 발생하지 않는다.
- task 등록 전 recipe path는 workspace 내부다.
- 실패 시 raw traceback만 보이지 않는다.
- 모든 단계는 workloop와 audit/report 중 하나에 증거가 남는다.

## 최종 완료 조건

이 청사진을 "달성했다"고 말하려면 아래가 모두 참이어야 한다.

- `learning-to-automation-e2e`가 최신 clean HEAD에서 통과한다.
- `teacher-outcome-benchmark`가 학습 성과 기준 9.0 이상을 남긴다.
- `automation-safety-benchmark`가 unsafe action 차단과 E-Stop을 증명한다.
- `quality-cycle`이 최신 clean HEAD에서 통과한다.
- stale artifact가 없다.
- README, launch kit, product docs가 "learning + execution + automation studio" 메시지로 일관된다.
- 첫 사용자 영상 또는 browser gate가 5분 안에 학습 실행과 자동화 dry-run을 모두 보여준다.

## 관련

- [[learning-three-pillars]]
- [[ai-integration]]
- [[automation-tasks-reports]]
- [[ai-sensory-system]]
- [[teacher-tool-loop]]
- [[automation-authoring-loop]]
- [[frontend-product-surface]]
- [[product-quality]]
- [[dogfood-alpha]]
