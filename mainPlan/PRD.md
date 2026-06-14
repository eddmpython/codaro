# Codaro 커리큘럼 방향 PRD — "실행 데모에서 검증되는 졸업 자동화로"

> **상태**: v3 (v2의 채점-확장 모순 정정 — Phase 0을 "검증=콘텐츠 정직성"으로 재정의, 학생 채점 동결 재확인. 이력은 §9 v3 정정).
> **범위**: Codaro 커리큘럼이 앞으로 나아갈 방향. 개별 레슨 작성 지침이 아니라 *무엇을 왜 하고 무엇을 안 하는가*, 그리고 *언제 끝났다고 하는가*를 고정한다.
> **자기충족성 기준**: 이 문서만 읽고 재조사 없이 Phase 0 첫 작업에 착수할 수 있어야 한다.
> **부록 A** 토론 요약 · **부록 B** 검증 근거(grep/게이트 라이브 출력) · **부록 C** 핵심 메커니즘 레퍼런스(file:line).

---

## 0. 한 줄 비전 (North Star)

> **Codaro 커리큘럼을 "실행 데모 472개"에서 "코드가 정직한 학습 → Harvest로 졸업하는 무인 자동화"로 전환한다.**
> 척도는 **도메인 수가 아니라 (콘텐츠 정직성 · 횡단 졸업 여정 · moat 활용)** 이다.

핵심 통찰: **갭은 폭이 아니라 깊이다.** 472레슨·31도메인·169 outcome은 이미 시장 어떤 Python 강의보다 넓다. 늘려야 할 것은 도메인이 아니라, 이미 가진 것을 *코드가 실제로 돌고 본문 주장과 일치하는 정직한 학습*과 *Codaro에서만 되는 졸업 루프*로 끌어올리는 일이다.

> **검증의 정의(중요):** 이 PRD에서 "검증"은 **레슨 코드 자체가 로컬에서 실행되고 가르치는 내용과 일치하는가**(콘텐츠 무결성)를 뜻한다. **학습자 답을 맞다/틀리다로 채점하는 것이 아니다.** 학생 채점(`check.type`을 학생 코드에 적용)은 동결 상태이며 사용자 명시 전 확장하지 않는다(§3.1).

---

## 1. 배경 — 현재 상태 (실측)

데이터 SSOT는 루트 `curricula/python/`(`.yaml` 레슨 472개 + `schema.yaml`)이며 **편집·작성은 항상 여기서** 한다. `src/codaro/curricula/`는 **stale 미추적 사본**이다(오도 주의). ⚠️ 런타임 로더 `studyLoader._curriculaPythonRoot`(`studyLoader.py:48-51`)는 *패키징*상 bundled `src/codaro/curricula/python`이 존재하면 그쪽을 **우선**하고 루트는 fallback이라, 개발 중 stale 사본이 로드될 수 있다 — 그래서 약점 감사 게이트는 명시적으로 루트를 읽도록 `StudyLoader(ROOT/"curricula"/"python")`로 고정돼 있다(`auditCurriculumWeakness.py:147`, 부록 C). 콘텐츠 변경 후 검증은 루트 기준 게이트로 한다.

**규모 (실측 2026-06-10):**

| 그룹 | 트랙(레슨 수) | 합계 |
| --- | --- | --- |
| basics | 30days(30) · advancedPython(35) · builtins(35) | 100 |
| dataAnalysis | pandas(12) · duckdb(12) · numpy(11) · polars(11) · pydantic(11) | 57 |
| visualization | matplotlib·seaborn·plotly·altair·folium (각 11) | 55 |
| mathStatsMl | scipy·statsmodels·sklearn·sympy·networkx (각 11) | 55 |
| imageVision | pillow(11)·opencv(11)·visionBasics(10)·visionFeatures(10)·visionApps(10)·deepVision(10) | 62 |
| automation | office(openpyxl·xlwings·word·pdf·email 각11, excel3, practical1)·browser/playwright(11)·os(fileOps·procCtl·inputCtl·watchSched 각10, resilience3)·text/regex(11)·webApi/requests(5) | ~129 |
| aiIntegration | llmBasics(11) | 11 |
| devLiteracy | devTools(3) | 3 |
| **합계** | | **~472** |

분류 SSOT `curricula/python/_taxonomy.yml`: outcomes 169 · domains 31 · lessonOutcomes backfill. 무결성 게이트 `tests/curriculum/testCurriculumOs.py`, 약점 감사 `tests/curriculum/auditCurriculumWeakness.py` 통과 중.

**"그래프 갭 0"의 함정:** Curriculum OS는 "모든 도메인이 plan 합성됨 / 모든 outcome이 어떤 레슨에서 제공됨"을 검증한다. 하지만 이는 *닫힌 어휘 안에서만* 참이다. `sqlite`·`agentLoop`·`secrets`처럼 **outcome 어휘 자체에 없는 능력은 갭으로 잡히지도 않는다**(부록 B에서 0건 확인). 이 PRD가 메우는 갭의 상당수는 "그래프에 안 보이는 갭"이다.

---

## 2. 문제 정의 — 진짜 갭 (4렌즈 합성)

### 2.1 콘텐츠 정직성 (Depth) — 실행으로만 보증되는 무결성

**진짜 depth 갭은 "학생을 더 빡세게 채점하느냐"가 아니라 "교재 코드가 거짓말을 안 하느냐"다.** 472레슨의 모든 `snippet`·`solution`·code 블록이 (a) 로컬에서 예외 없이 돌고 (b) 본문이 주장하는 결과를 실제로 내는가 — 이게 콘텐츠 정직성이고, 이것만이 학생 채점 부활 없이 올릴 수 있는 품질 축이다.

현 상태: 실행 가능성 게이트 `auditCurriculumExecutability.py`가 각 yaml을 노트북처럼 누적 namespace에서 `snippet`+`exercise.solution`을 실제 `exec`하고 real-bug(코드 결함)/missing-package(환경)로 분류한다(real-bug·undeclared-package·yaml-load-error 임계 0). **하지만 무결성이 아직 기계로 완전 보증되지 않는다 — 사각지대 셋:**

```
1. blocks[].type==code (code/expansion 블록 코드)는 실행 대상이 아니다.
2. code 블록의 선언된 output: 가 실제 출력과 일치하는지 검증하지 않는다.
3. missing-package 레슨은 import 단계에서 건너뛴다 → 그 안의 real-bug가 안 보인다(게이트가 coverage note로 정직히 고지).
```

그래서 "콘텐츠가 정직하다"는 **사람이 한 레슨씩 직접 읽어 코드-본문 정합을 확인**하고, 그 결과를 기계 게이트(사각지대 포함 확장)로 잠가야 비로소 참이 된다. 이것이 Phase 0다.

> **채점(0.4%) 숫자에 대한 정정(리뷰 반영):** 약점 감사의 `strong-check coverage 2/464`는 **학생 코드 채점 메커니즘**(`check.type`=output/variable/contains를 학습자 제출에 적용 → pass/fail → mastery 적립, `checkFlow.runCurriculumCheckFlow`)의 밀도를 잰다. 채점은 동결(§3.1)이므로 이 숫자는 **북극성 결함이 아니라 정보성 지표**다. 이전 v2가 이를 "최대 품질 부채"로 둔 것은 채점을 바람직한 것으로 전제한 오류였고, v3에서 콘텐츠 정직성으로 교체한다. (`weakCheckSignal`·`placeholderPredict`는 사람-작성 보강의 정보성 다이얼로 유지.)

### 2.2 Harvest 졸업 루프 부재 (Moat) — **최대 정체성 갭**

Codaro의 서명 메커닉은 **학습→Harvest→자동화 졸업**이다(`createAutomationTaskFromCodePayload`, 부록 C). 학습에서 검증한 코드를 스케줄 자동화 태스크로 졸업시키고 상주 런처가 무인 실행한다. **이 루프를 가르치는 레슨은 0개다**(커리큘럼 전체 `Harvest`/`createAutomationTask`/"졸업" 언급 0건, 부록 B). 상징적 증거: `automation/office/openpyxl/10_월간매출리포트생성기.yaml`이 재사용 함수를 만들고 *"다음 단계는 스케줄러/메일에 붙이는 것"*이라 적고 — 바로 그 졸업 직전에서 멈춘다.

결과: 472레슨 전부가 Jupyter/Colab에서 글자 그대로 똑같이 돈다. **moat 활용도 ≈ 0.**

### 2.3 횡단 여정 부재 (Journey)

모든 캡스톤이 **트랙 내부**에서 닫힌다. prerequisite 그래프도 거의 intra-domain. 그러나 실무는 횡단한다: `API(requests) → 정제(pandas/regex) → 저장(sqlite) → 리포트(openpyxl) → 발송(email) → 스케줄(watchSched)`. **크로스-도메인 캡스톤 0개.** "직장인이 자기 업무 한 편을 끝까지 자동화"하는 단일 레일이 없다.

### 2.4 스파인 공백 (구조적 누락 — 폭이 아니라 척추)

타깃(자기 업무를 자동화하려는 한국 지식근로자/주니어)에게 구조적으로 필요한데 어휘에조차 없는 둘:

- **로컬 영속 저장소(sqlite3)**: resilience 트랙이 "처리 원장(ledger)"으로 멱등성·체크포인트를 가르치는데 **정작 원장을 둘 저장소를 안 가르친다.** 표준 라이브러리라 로컬-우선 정체성과 정합. 자동화의 상태·산출물·원장의 집.
- **AI 에이전트 빌드(aiAgents)**: 제품이 에이전트 플랫폼(상주 런처·감각계·세션·E-Stop)인데 학습자가 **agent loop(tool_use 루프 → 상태 agent → 로컬 RAG)를 직접 짜는 트랙이 없다.** llmBasics 11개는 SDK 호출 카탈로그에서 끝난다.

### 2.5 구체적 약한 지점 (즉시 보강 — §8과 연결)

- **webApi/requests (5/10, 깨진 약속)**: `00_requests소개.yaml`이 "10개 프로젝트"를 약속하는데 실제는 00·01·11·12·13 5개(02~10 결번)+capstone 없음(부록 B 확인).
- **automation/os/resilience (3 개념 드릴, 통합 0)**: 멱등성·체크포인트·원자적쓰기 각각만, "배치 죽음→재시작→중복 방지" 통합 시뮬레이션 없음. (단 resilience는 `PROJECT_EXEMPT_CATEGORIES`라 project 강제는 아님 — 부록 C.)
- **devLiteracy/devTools (읽기 전용)**: mock 출력만, "직접 쳐보기"를 레슨 밖으로 미룸. (읽기 교양 스코프는 의도적 — 트랙 확장 아니라 *실행 섹션 1개 추가*로 충분. devTools도 PROJECT_EXEMPT.)

### 2.6 갭이 **아닌** 것 (명시)

- **도메인/레슨 폭**: 31도메인·472레슨은 과포화. 6번째 시각화 라이브러리, FastAPI 풀스택, 추가 비전/딥러닝은 *가장 약한 축(콘텐츠 정직성·횡단 졸업)을 놔둔 채 폭만 더 늘리는* 역효과.
- **predict 카드 / 자동 채점 / 채점 확장**: 이 PRD의 "검증"은 콘텐츠 정직성(코드 실행 정합)이지 학생 채점이 **아니다**(§3.1). `check.type`을 noError → output/variable/contains로 올리는 것도 **학생 코드 채점을 빡세게 만드는 일**이라 동결 대상이다. 명시 금지(`feedback_curriculum_no_prediction`).

---

## 3. 원칙 / 제약 (절대 게이트 — 위반 시 방향 자체가 틀림)

1. **검증 = 콘텐츠 정직성, ≠ 학생 채점.** 이 PRD의 "검증"은 *레슨의 코드(`snippet`/`solution`/code 블록)가 실제로 돌고 본문 주장과 일치*하는지를 뜻한다. **학생 답 채점이 아니다.**
   - ⚠️ **정정(이전 v2의 모순 수정):** `check.type`의 `output`/`variable`/`contains`는 *학생 제출 코드*에 돌려 pass/fail을 내고 그 결과로 outcome/mastery를 적립하는 **채점 메커니즘**이다(`checkFlow.runCurriculumCheckFlow:88-141` → `creditCheckPass`/`recordEvidence`). `noError`도 그중 "안 죽으면 통과"인 가장 약한 채점일 뿐이다. 따라서 exercise의 `check.type`을 `noError` → `output`/`variable`/`contains`로 **올리는 것 자체가 채점 확장**이며, predict·점수화와 함께 **사용자 명시 전 동결**이다(`feedback_curriculum_no_prediction`).
   - Phase 0의 "검증"은 이와 무관하게 **레슨 자신의 코드가 정직한지**를 본다. 같은 실행 인프라를 *학생*이 아니라 *교재 해답*에 돌리는 실행성 게이트(`auditCurriculumExecutability`)가 그 도구다 — 점수화 아님.
   - ⚠️ (참고) check 타입은 정확히 **`output` · `variable` · `contains` · `noError`** 4종뿐(`exerciseCheck.py:104`). `assert`·`str`은 **존재하지 않는 타입**(`type: str`은 `predict.expectedDtype` 메타)이다.
2. **bulk 생성 금지.** 새 레슨/캡스톤은 사람이 한 강의씩 직접 작성. 생성기 스크립트 금지. → PRD는 "레슨 수백 개"를 약속하지 않는다. 지표는 *수*가 아니라 *깊이·연결·졸업*.
3. **도메인 동결.** §2.4 스파인 트랙 2개(sqlite, aiAgents) 외 신규 *폭* 도메인 기본 거절. 입증 책임은 추가하려는 쪽.
4. **taxonomy 배선 의무.** 새 트랙은 (a) `_taxonomy.yml`의 `outcomes`·`domains`·`lessonOutcomes`, (b) `curricula/python/__init__.py`의 dict들 **`categoryMapping`·`categoryMeta`·`categoryGroups`·`categoryTree`(+필요 시 `learningPaths`)** 를 같은 변경에서 배선한다(별도 파일 3곳이 아니라 단일 `__init__.py` 내 다수 dict — `studyLoader.py:65` SSOT). `testCurriculumOs.py`의 `testNoOrphanLessons`/`testTaxonomyCoversAllOutcomes`/`testEveryDomainProducesPlan`이 차단. 스파인 트랙의 **첫 작업 = outcome 어휘 등록**(그래야 진짜 갭이 그래프에 드러남).
5. **데이터 SSOT = 루트 `curricula/python/`.** `src/codaro/curricula/`(stale)에 쓰지 않는다.
6. **로컬 Python 실행성 + Percent Format.** 코드는 `python file.py`로도 돌아야 한다. Harvest 캡스톤도 *Python 함수*가 본체, 졸업은 Codaro가 얹는 층 — API 암기 lock-in 금지.
7. **선행 의존성 정직.** 미승격·미추적 기능(예: `tests/_attempts/agentCore`)이나 **미구현 학습 표면**(예: from-code Harvest의 tool_use 정의 — 부록 C에서 현재 부재 확인)에 의존하는 레슨은 그 표면이 제품에 배선된 뒤에만 작성한다. Phase 1·2가 이를 선행작업으로 명시한다.

---

## 4. 로드맵 — 4 Phase (각 Phase에 머신 판정 DoD)

순서 = 의존성 + ROI. 각 Phase는 독립적으로 가치를 낸다.

### Phase 0 — 콘텐츠 정직성 QA (Depth) · 신규 콘텐츠 0 · ROI 최고

- **목표**: 472레슨의 모든 실행 가능한 코드(`snippet`·`exercise.solution`·`blocks[].code`)가 (a) 로컬에서 예외 없이 돌고 (b) 선언된 `output:`·본문 주장과 일치함을 보증한다. **학생 채점 확장 아님(§3.1)** — 교재 코드 자신의 무결성만 본다. 도메인 1개 추가는 1/31 효과지만 콘텐츠 정직성은 전 도메인 가로 레버리지.
- **측정 도구는 이미 존재**: `auditCurriculumExecutability.py`가 snippet+solution을 누적 namespace에서 실제 `exec`하고 real-bug/undeclared-package/yaml-load-error 임계 0으로 차단한다. **Phase 0 첫 작업은 "도구 만들기"가 아니라**:
  1. 베이스라인 실행 → real-bug를 전부 0으로 **정공법 수정**(우회·예외 삼킴 금지).
  2. **사람이 한 레슨씩 직접 읽어** 코드-본문 정합 확인(기계가 못 보는 의미 결함: 주장과 다른 출력, 오개념 유발 예시, 죽은 `___`, 무의미한 assert). 결과를 루트 기록에 남긴다.
  3. **사각지대 봉쇄(확장 게이트)**: 실행성 audit를 `blocks[].code`(expansion 포함) 실행까지 넓혀 회귀 차단. 선언된 `output:`/본문 주장과의 정합은 자동 비교가 취약(부동소수·객체 repr·비결정성)하므로 정독 스윕(2)이 담당하고, 자동 게이트는 실행 무결함(real-bug 0)에 집중한다.
  4. 환경상 로컬 실행 불가 레슨(xlwings/Excel, playwright/브라우저, deepVision/대형 모델)은 **실행 대신 정독 검증**으로 처리하되, 기록에 "실행-검증"과 "정독-검증"을 정직히 구분(환경 미준비를 결함으로 오판 금지).
- **DoD (머신 판정)**:

  | gate | 임계 | 통과 조건 |
  | --- | --- | --- |
  | `curriculum-executability` | real-bug 0 · undeclared-package 0 · yaml-load-error 0 | snippet+solution 누적 실행 무결함 |
  | (확장) blocks 실행 | real-bug 0 | code/expansion 블록 실행 무결함 (선언 output·본문 정합은 정독 스윕) |
  | 루트 기록 | 존재 | `mainPlan/curriculumCodeAudit.md`에 472레슨 전수 점검 결과(실행/정독 구분) |

- **비범위**: 학생 채점/점수화 확장(§3.1, 동결). 결정적 정답을 학생에게 강제하는 `check.type` 상향은 하지 않는다.

### Phase 1 — Harvest 졸업 레일 (Moat) · 정체성 핵심

- **선행작업(리뷰 반영 — 없으면 레슨 못 씀)**: from-code Harvest를 학습 표면에서 호출/안내할 수 있어야 한다. 현재 엔진(`createAutomationTaskFromCodePayload`)·REST(`POST /api/tasks/from-code`)·졸업게이트(outcomeId 미숙달 시 403)는 존재하나 **AI tool_use 정의는 부재**(기존 `create-automation-task` 도구는 path 기반, from-code 아님 — 부록 C). → Phase 1 step 0 = `src/codaro/ai/toolDefinitions/automation.py`에 from-code Harvest 도구 추가(GUI=API 사상). 이게 끝나야 레슨이 졸업을 *안내*할 수 있다.
- **목표**: 기존 캡스톤에 **명시적 Harvest 핸드오프** 마지막 단계 추가 — 검증한 노트북을 스케줄 자동화로 졸업시키고, 상주 런처가 무인 실행하며, 실패 시 알림(직전 출시 실패-가시성 `codaro_rpa_gap_review`와 연결).
- **계약(자기충족 — 부록 C 재인용)**: `createAutomationTaskFromCodePayload(*, code, name, description="", schedule=None, inputs=None, workspaceRoot) -> {created, documentPath, task}`. `schedule`은 `@every_5m`/`@daily`/`@every_Nd` 등 `parseScheduleSeconds`가 받는 프리셋. 졸업 게이트는 `outcomeId` 제공 시 mastery 미충족이면 403.
- **범위(첫 슬라이스)**: `automation/office/openpyxl/10_월간매출리포트생성기.yaml`(루프 직전에서 멈춘 곳) → 이어 pandas/email 캡스톤. 새 outcome `automation.harvest`(가칭) 어휘 등록.
- **DoD**: Harvest 핸드오프 섹션 보유 캡스톤 ≥ 3(`curricula/`에서 harvest 섹션 grep 카운트) + from-code Harvest 도구가 `toolDefinitions/automation.py`에 등록되고 teacher tool 계약 테스트 통과.
- **비범위**: Codaro API 암기 강의화. 졸업은 클릭 한 번 메커닉.

### Phase 2 — 스파인 트랙 (구조적, 사람이 한 레슨씩, phased)

- **목표**: 깊이/여정을 가능케 하는 구조적 필수 트랙 2개만 신설(폭 확장 아님).
  - **sqlite 트랙**: 표준 `sqlite3`로 자동화의 상태·산출물·**처리 원장** 저장. resilience의 "원장"이 실제 저장소를 갖게 함.
  - **aiAgents 트랙**(llmBasics 다음): tool_use 루프 → 상태 agent → 로컬 파일 임베딩 검색(간단 RAG). **MCP·멀티에이전트 보류**(타깃 과함).
- **작업 순서**: (a) `_taxonomy.yml`에 outcome 어휘 먼저 등록. (b) `__init__.py` dict 배선(§3.4). (c) 레슨을 사람이 한 편씩.
- **게이트 제약(리뷰 반영 — 작성 차단 예방)**: sqlite·aiAgents는 `PROJECT_EXEMPT_CATEGORIES`에 **없으므로** `categoryWithoutProject`(임계 0) 때문에 **각 트랙에 `lessonRole: project` 레슨이 최소 1개** 있어야 게이트를 통과한다(부록 C).
- **DoD**:

  | 항목 | 통과 조건 |
  | --- | --- |
  | taxonomy 정합 | `testCurriculumOs`(orphan 0 / 모든 outcome 제공 / 모든 도메인 plan) green |
  | project 제약 | 각 신규 트랙에 project 레슨 ≥1 → `categoryWithoutProject` 0 |
  | 품질 일관성 | 신규 트랙 레슨이 처음부터 Phase 0(콘텐츠 정직성·전수 실행)·Phase 1(Harvest 핸드오프) 기준 충족 |
  | "트랙 완성" 정의 | 그 트랙의 등록 outcome 전부가 ≥1 레슨에서 제공(gap 0) — *레슨 수가 아니라 outcome 커버리지* |

### Phase 3 — 횡단 졸업 캡스톤 (Journey) · 서명 산출물

- **목표**: `requests → pandas/regex → sqlite → openpyxl → email → watchSched`를 잇고 **Harvest로 끝나는** 크로스-도메인 캡스톤 2~3편.
- **범위(후보)**: "거래처 일괄 점검 → 차단리스트 → 주간 리포트 자동 발송"(webApi 깨진 약속 복구 결합), "내 폴더 정리 → 인덱스 DB → 주간 요약 메일".
- **DoD**: 다중 그룹 outcome을 prerequisite으로 갖는 캡스톤 ≥2, 각 캡스톤 마지막 단계가 Harvest 졸업, 전체 `testCurriculumOs`+`curriculum-weakness-audit` green.

---

## 5. 측정 지표 (정량) — 레슨 *수*는 지표가 아니다

| 지표 | 베이스라인(게이트 라이브) | 목표 | 측정 |
| --- | --- | --- | --- |
| 콘텐츠 정직성 | real-bug 미확정(blocks·output 미검증) | 모든 실행면 real-bug 0 + 선언 output 일치 + 472레슨 정독 완료 | `auditCurriculumExecutability`(확장) + 루트 점검 기록 |
| 전수 점검 커버리지 | 0 (미기록) | 472/472 (실행-검증 + 환경불가 정독-검증 구분 기록) | `mainPlan/curriculumCodeAudit.md` |
| Harvest 핸드오프 캡스톤 | 0 | ≥3 | `curricula/` harvest 섹션 카운트 |
| 크로스-도메인 캡스톤 | 0 | 2~3 | 다중 그룹 outcome prerequisite 캡스톤 |
| 스파인 outcome 어휘 | 0 (sqlite/agentLoop/secrets) | 등록 | `_taxonomy.yml` outcomes |
| 숙달 라벨 정직성 | "noError 3회=숙달" 부풀림 | autoValidate 라벨 정직화 | `codaro_capability_engine_audit` 반영 |

**비지표(의도적 제외):** 총 레슨 수, 도메인 수. 둘 다 충분하고, 늘리는 것은 약속 위반의 씨앗.

**달성 가능성(리뷰 반영):** 콘텐츠 정직성은 *결정적 산출물 비율*과 무관하다 — 탐색형 셀도 "예외 없이 돌고 본문과 모순 없음"은 보증 가능하다. 환경상 로컬 실행 불가 레슨만 실행-검증에서 빠지며, 그건 정독-검증 + 기록으로 정직히 메운다.

---

## 6. 비범위 / YAGNI (명시적 거절 — 입증 책임은 추가하려는 쪽)

- 6번째 시각화/DataFrame 라이브러리.
- FastAPI 풀스택·Django 등 웹 백엔드 도메인(pydantic FastAPI 통합 1레슨으로 충분, 정체성 밖).
- 추가 비전/딥러닝 확장(imageVision 이미 62).
- MCP·멀티에이전트·분산 RPA·Airflow/Spark·k8s/클라우드.
- 마이너 표준 라이브러리 long-tail.
- **predict 카드 / 자동 채점 / 점수화 부활**(명시 전 금지).
- 미승격 기능·미배선 학습 표면 의존 레슨(§3.7).

---

## 7. 리스크 / 완화

| 리스크 | 완화 |
| --- | --- |
| bulk 금지로 신규 콘텐츠 속도 느림 | 지표를 수가 아닌 깊이로. Phase 0(수선)·1(기존 캡스톤 확장)이 신규 작성 최소 |
| "검증"이 predict/채점 부활로 오해 | §3.1로 못박음 — 검증=콘텐츠 정직성(교재 코드 실행), 학생 채점(`check.type` 상향)은 동결 |
| `assert`/`str` 등 없는 타입 사용 | check 타입 4종 명시(§3.1, 부록 C) |
| 기존 도구 중복 구현 | Phase 0이 `auditCurriculumExecutability` 재사용·확장(§4), 새 실행기 만들지 않음 |
| 스파인 트랙 project 누락으로 차단 | Phase 2 DoD에 project ≥1 명시 |
| Harvest 학습 표면 부재 | Phase 1 step 0에 tool_use 정의 선행작업 |
| src 사본 오작성 | 데이터 SSOT 루트 고정(§3.5) |
| moat 레슨 lock-in | Python 본체 우선(§3.6) |

---

## 8. 즉시 착수 (Phase 0/1 첫 슬라이스 — 구체 파일, 순서 = 착수 순)

1. `automation/office/openpyxl/10_월간매출리포트생성기.yaml` — Harvest 핸드오프 섹션(Phase 1 첫 슬라이스). **단 Phase 1 step 0(from-code Harvest tool_use 정의) 선행.**
2. `automation/webApi/requests/` — 02~10 결번 복구 + capstone `10_거래처일괄조회자동화.yaml`(깨진 약속 복구, Phase 3 결합). **착수 전 기존 트랙 PRD `automation/webApi/requests/PRD.md`(이미 존재)를 읽고 정합을 맞춘다** — 이 트랙은 자체 PRD를 가지므로 결번 복구 계획이 그것과 충돌하지 않게 한다.
3. `automation/os/resilience/04_배치재실행시뮬레이션.yaml` — 멱등성+체크포인트+원자적쓰기 통합(sqlite 원장 씨앗, Phase 2 연결).
4. `dataAnalysis/pandas` 트랙 — Phase 0 콘텐츠 정직성 시범(snippet/solution/blocks 전수 실행 + 본문 주장 정합 정독).
5. `devLiteracy/devTools/commandLineIntro.yaml` — mock 대신 로컬 실행 섹션 1개 추가(트랙 확장 아님).

---

## 9. 의사결정 로그 (4렌즈 + 적대적 리뷰 → 수렴)

- **회의주의 렌즈**(방향 지배): 도메인 추가 금지, 깊이·검증·여정을 고쳐라. 레슨 수백 개 약속=vaporware. → 북극성·비지표·동결.
- **정체성 moat 렌즈**: Harvest 루프가 제품엔 있는데 커리큘럼엔 0건 — 최대 정체성 갭. → Phase 1.
- **전략 PM 렌즈**: sqlite·agent는 폭이 아니라 스파인 누락, 횡단 여정 0. → Phase 2·3(스파인 2개 제한).
- **품질 감사 렌즈**: 약한 레슨 구체 지목(webApi·resilience·devLiteracy). → §8.
- **적대적 리뷰 1·2**: 베이스라인이 predict 메타로 오염(`str` 허수)·`assert`/`str` 없는 타입·Phase 0 도구 이미 존재·Harvest 학습표면 부재·sqlite project 제약·`__init__` 배선 부정확·mainPlan 미추적·생성문서 stale. → v2에서 전부 반영(베이스라인 2/464 레슨단위로 교체, check 4종 명시, 도구 재사용, Phase 1 step 0, Phase 2 project 제약, 배선 정정, §10·11 신설).
- **충돌 해소**: PM "신규 트랙" vs 회의주의 "동결" → 깊이를 주축(Phase 0·1·3), 스파인 2개만 surgical(Phase 2), 나머지 폭 동결.
- **v3 정정(채점 동결 재확인)**: v2가 Phase 0을 "`check.type` noError→output/variable/contains 상향"으로 둔 것은 **학생 채점 확장**이라 no-prediction 동결과 모순이었다(`output`/`variable`/`contains`는 학생 코드에 돌려 mastery를 적립하는 채점 메커니즘 — `checkFlow.py:88-141`). v3에서 Phase 0을 **콘텐츠 정직성 QA**(교재 코드의 실행·정합)로 재정의하고, 채점 관련 모든 상향을 명시 전 동결로 못박음. 측정도 `auditCurriculumWeakness` strong-check(채점 밀도) → `auditCurriculumExecutability`(콘텐츠 무결성)로 교체.

---

## 10. 저자 · 캐파시티 · 마일스톤

- **저자**: 레슨/캡스톤 콘텐츠는 **사람이 직접 작성**(bulk 금지). AI는 초안 outline(`propose-curriculum-draft`)·검토·배선 보조까지. 최종 YAML은 사람.
- **처리량 가정**: 품질 우선이라 *주당 N편* 식 약속을 하지 않는다. 대신 **Phase는 캘린더가 아니라 DoD 게이트로 종료**한다(§4 각 DoD). 부분 완료도 진전(예: 트랙 1개만 전수 정독+실행 검증하고 확장 게이트로 잠가도 그 트랙은 영구 회귀 차단).
- **권장 시퀀스**: Phase 0(openpyxl·pandas·requests·30days 순) → Phase 1 step 0(tool) → Phase 1 캡스톤 → Phase 2 어휘 등록 → Phase 2 트랙 작성 → Phase 3 횡단 캡스톤. Phase 간 병렬 가능하나 Phase 1 캡스톤은 step 0 도구 선행 필수.

---

## 11. 롤백

- **Phase 0(콘텐츠 정직성 QA)**: 레슨 코드 수정 + 실행성 audit 확장은 단일 커밋 단위. `git revert <sha>`로 코드 수정·확장 게이트를 함께 원복(루트 점검 기록은 이력 문서라 revert하지 않고 후속 기록으로 갱신).
- **Phase 1(Harvest 섹션·tool 정의)**: 캡스톤 YAML revert + `toolDefinitions/automation.py`의 from-code 도구 등록 취소 + teacher tool 카탈로그/테스트 동기 revert.
- **Phase 2(스파인 트랙)**: 트랙 디렉터리 revert + `_taxonomy.yml` outcome/lessonOutcomes 등록 취소 + `__init__.py` dict 항목 제거(미하면 orphan/그래프 무결성 게이트가 실패하므로 같은 커밋에서 원복).
- **Phase 3(횡단 캡스톤)**: 캡스톤 YAML + taxonomy 항목 revert.
- 공통: revert 후 `tests/run.py gate curriculum-weakness-audit`와 `testCurriculumOs`로 그래프·신호 원복 확인.

---

## 부록 A — 전문가 토론 요약 (4렌즈 + 적대 2)

- **품질 감사(15+레슨 정독)**: 강한 트랙=30days·pandas·requests(구조)·matplotlib. 약한=devLiteracy(읽기만)·resilience(통합 없음). webApi capstone 부재.
- **전략 PM**: P0=sqlite·aiAgents, 여정 갭=횡단 캡스톤·Harvest 핸드오프 0. "그래프 갭 0은 닫힌 어휘 안에서만 참."
- **정체성 moat**: moat 활용도 ≈ 0. Harvest 루프 0건이 최대 갭. 방향 A(졸업 캡스톤)·B(GUI=API tool_use)·C(리액티브/무인 에이전트). 경계: lock-in·predict 부활·미승격 의존 금지.
- **회의주의**: breadth-saturated/depth-starved. exercise 8템플릿. 도메인 동결. 북극성=콘텐츠 정직성+횡단 여정. (check 99.6% weak는 채점 밀도 — §2.1 정정으로 북극성에서 강등.)
- **적대 리뷰 1(52→)**: 베이스라인 predict 오염, 도구 이미 존재 미인지, DoD/롤백/저자캐파/결과지표 누락.
- **적대 리뷰 2(68→, 게이트 정합)**: `assert`/`str` 없는 타입, check 4종 SSOT, Harvest tool 부재, sqlite project 제약, `__init__` 단일파일 다수 dict, mainPlan 미추적+생성문서 stale.

## 부록 B — 검증 근거 (실측, 2026-06-10)

```
# 약점 감사 게이트 라이브 출력
strong-check coverage 2/464 (0.4%) · 462 weak-check lessons · 30 placeholder-predict lessons

# check.type raw grep (오염 주의: str은 predict.expectedDtype)
noError 2320 · contains 7 · (type:str 5 = predict dtype, check 아님)

# Harvest/졸업 커리큘럼 언급
grep -ilE 'harvest|createAutomationTask|자동화.*졸업'  →  0건
# sqlite/agentLoop/secrets outcome 어휘
grep -niE 'sqlite|agentloop|aiagent|secrets|harvest' _taxonomy.yml  →  0건

# webApi/requests 실제 파일: 00·01·11·12·13 (02~10 결번, capstone 없음, PRD.md "10개" 약속)
# 규모: 472 .yaml 레슨 · 8그룹 · outcomes 169 · domains 31
```

## 부록 C — 핵심 메커니즘 레퍼런스 (file:line)

- check 타입 SSOT(4종): `src/codaro/curriculum/exerciseCheck.py:104` — `output/variable/contains/noError`. `output`=expectedCode/solution 출력 일치, `variable`=variableName+expectedValue, `contains`=requiredPatterns.
- 강한 체크 정의·집계(정보성, 채점 밀도): `tests/curriculum/auditCurriculumWeakness.py:72` `STRONG_CHECK_TYPES={output,variable,contains}`; `:419` strong-check coverage 출력; `:68` `weakSignalRegression:0`; allowlist `tests/_strongSignalCategories.txt`(현재 비어 회귀차단 비활성). **주의: 이 수치는 학생 채점 메커니즘 밀도이지 콘텐츠 정직성 지표가 아니다(§2.1 정정).**
- 콘텐츠 실행성 게이트(Phase 0 주도구): `tests/curriculum/auditCurriculumExecutability.py` — 각 yaml의 `snippet`+`exercise.solution`을 누적 namespace에서 실제 `exec`, real-bug/missing-package/undeclared-package 분류, 임계 real-bug·undeclared-package·yaml-load-error 0(`:118`). `blocks[].code`·선언 `output:`은 미검증(Phase 0 확장 대상, §4). 학생 채점이 아니라 *교재 해답*을 돌리는 도구다.
- 학생 채점 흐름(동결 대상): `src/codaro/curriculum/checkFlow.py:88-141` `runCurriculumCheckFlow` — `studentCode`에 `runExerciseCheck` → `result.passed` → `progressTracker.creditCheckPass`/`learnerStateStore.recordEvidence`. output/variable/contains/noError가 여기서 학생 답을 채점한다.
- project 면제: `auditCurriculumWeakness.py:121` `PROJECT_EXEMPT_CATEGORIES={builtins,excel,practical,devTools,resilience}` (sqlite·aiAgents 미포함 → project 레슨 필수).
- Harvest 엔진: `src/codaro/automation/taskFlow.py:117` `createAutomationTaskFromCodePayload`; REST `src/codaro/api/automationRouter.py:201` `POST /api/tasks/from-code`(+outcomeId 졸업 게이트 403). **AI tool_use 정의는 부재**(`toolDefinitions/automation.py`의 `create-automation-task`는 path 기반).
- 트랙 배선 SSOT: `curricula/python/__init__.py`의 `categoryMapping`·`categoryMeta`·`categoryGroups`·`categoryTree`(+`learningPaths`) — `studyLoader.py:65-70`이 이 dict들을 읽음. 경로 결정 `_curriculaPythonRoot`(`studyLoader.py:48-51`)는 bundled src 사본을 우선(패키징), 약점 감사는 루트 고정(`auditCurriculumWeakness.py:147`) — 편집 SSOT는 루트.
- 무결성 게이트: `tests/curriculum/testCurriculumOs.py` — `testNoOrphanLessons`·`testTaxonomyCoversAllOutcomes`·`testEveryDomainProducesPlan`.

근거 메모리: `codaro_capability_engine_audit`·`codaro_signal_honesty`(검증 위기) · `codaro_curricula_ssot_tree`·`codaro_new_lesson_taxonomy_gate`(SSOT·배선) · `feedback_curriculum_no_prediction`·`feedback_curriculum_no_bulk_generation`(금지) · `codaro_rpa_gap_review`·`codaro_launcher_background_residency`(Harvest 무인 실행).
