# Codaro 커리큘럼 방향 PRD — "실행 데모에서 검증되는 졸업 자동화로"

> **상태**: v2 (전문가 4렌즈 토론 → 적대적 리뷰 2회 → 게이트 정합 검증으로 정제).
> **범위**: Codaro 커리큘럼이 앞으로 나아갈 방향. 개별 레슨 작성 지침이 아니라 *무엇을 왜 하고 무엇을 안 하는가*, 그리고 *언제 끝났다고 하는가*를 고정한다.
> **자기충족성 기준**: 이 문서만 읽고 재조사 없이 Phase 0 첫 작업에 착수할 수 있어야 한다.
> **부록 A** 토론 요약 · **부록 B** 검증 근거(grep/게이트 라이브 출력) · **부록 C** 핵심 메커니즘 레퍼런스(file:line).

---

## 0. 한 줄 비전 (North Star)

> **Codaro 커리큘럼을 "실행 데모 472개"에서 "검증되는 학습 → Harvest로 졸업하는 무인 자동화"로 전환한다.**
> 척도는 **도메인 수가 아니라 (검증 깊이 · 횡단 졸업 여정 · moat 활용)** 이다.

핵심 통찰: **갭은 폭이 아니라 깊이다.** 472레슨·31도메인·169 outcome은 이미 시장 어떤 Python 강의보다 넓다. 늘려야 할 것은 도메인이 아니라, 이미 가진 것을 *진짜 검증되는 학습*과 *Codaro에서만 되는 졸업 루프*로 끌어올리는 일이다.

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

### 2.1 검증 위기 (Depth) — **최대 품질 부채**

약점 감사 게이트(`auditCurriculumWeakness.py`)의 **라이브 출력**(부록 B):

```
strong-check coverage 2/464 (0.4%)   ← exercise+check 보유 464레슨 중 강한 체크(output/variable/contains) 보유는 2개뿐
462 weak-check lessons               ← 나머지 전부 noError-only("크래시 안 나면 통과")
30 placeholder-predict lessons
```

즉 exercise를 가진 464레슨 중 **99.6%가 정답을 검증하지 않는다.** 연습 프롬프트 ~2,500개도 사실상 8개 템플릿("값 하나 바꾸고 결과 보기")으로 수렴한다. 현 커리큘럼은 **"검증되는 학습"이 아니라 "실행 데모"**다. 메모리 `codaro_capability_engine_audit`·`codaro_signal_honesty`의 "엔진 설계는 상위권인데 실제 전달 ~0" 결론이 게이트 숫자로 확정된다.

> **측정 단위 주의(리뷰 반영):** 이 베이스라인은 **레슨 단위**(게이트 자신의 정의: exercise를 가진 레슨 중 강한 체크 보유 레슨 비율)다. check-블록 단위 집계(`grep type:`)는 `predict.expectedDtype`(예: `type: str`/`int`)를 검증으로 오인하므로 **쓰지 않는다.** 이 PRD의 모든 검증-깊이 목표는 게이트와 동일한 **레슨 단위·`STRONG_CHECK_TYPES={output,variable,contains}` 정의**로 통일한다.

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

- **도메인/레슨 폭**: 31도메인·472레슨은 과포화. 6번째 시각화 라이브러리, FastAPI 풀스택, 추가 비전/딥러닝은 *가장 약한 자산(검증 깊이)을 양적으로 더 늘리는* 역효과.
- **predict 카드 / 자동 채점 부활**: 이 PRD의 "검증 깊이"는 predict/채점 재도입이 **아니다**(§3.1). 명시 금지(`feedback_curriculum_no_prediction`).

---

## 3. 원칙 / 제약 (절대 게이트 — 위반 시 방향 자체가 틀림)

1. **검증 ≠ 예측/채점 부활.** "검증 깊이"는 *결정적 정답이 이미 존재하는 곳*에서 `check.type`을 `noError` → **`output`/`variable`/`contains`**(실재하는 3개 강한 타입, 부록 C)로 올리는 것이다. predict 카드·자동 채점·점수화 재도입은 **사용자 명시 전 금지**. (저장소 머신 게이트 `verifyPredictContractStrict`는 현재 strict 목록이 비어 사실상 비활성 — no-prediction은 정책/피드백 메모리로 강제됨. 이 PRD의 framing은 그 정책과 충돌하지 않는다.)
   - ⚠️ check 타입은 정확히 **`output`(expectedCode/solution 출력 일치) · `variable`(variableName+expectedValue) · `contains`(requiredPatterns) · `noError`** 4종뿐이다(`exerciseCheck.py:104`). `assert`·`str`은 **존재하지 않는 타입**이다(`type: str`은 `predict.expectedDtype` 메타). 결정적 정답 고정은 `output` 또는 `variable`로 한다.
2. **bulk 생성 금지.** 새 레슨/캡스톤은 사람이 한 강의씩 직접 작성. 생성기 스크립트 금지. → PRD는 "레슨 수백 개"를 약속하지 않는다. 지표는 *수*가 아니라 *깊이·연결·졸업*.
3. **도메인 동결.** §2.4 스파인 트랙 2개(sqlite, aiAgents) 외 신규 *폭* 도메인 기본 거절. 입증 책임은 추가하려는 쪽.
4. **taxonomy 배선 의무.** 새 트랙은 (a) `_taxonomy.yml`의 `outcomes`·`domains`·`lessonOutcomes`, (b) `curricula/python/__init__.py`의 dict들 **`categoryMapping`·`categoryMeta`·`categoryGroups`·`categoryTree`(+필요 시 `learningPaths`)** 를 같은 변경에서 배선한다(별도 파일 3곳이 아니라 단일 `__init__.py` 내 다수 dict — `studyLoader.py:65` SSOT). `testCurriculumOs.py`의 `testNoOrphanLessons`/`testTaxonomyCoversAllOutcomes`/`testEveryDomainProducesPlan`이 차단. 스파인 트랙의 **첫 작업 = outcome 어휘 등록**(그래야 진짜 갭이 그래프에 드러남).
5. **데이터 SSOT = 루트 `curricula/python/`.** `src/codaro/curricula/`(stale)에 쓰지 않는다.
6. **로컬 Python 실행성 + Percent Format.** 코드는 `python file.py`로도 돌아야 한다. Harvest 캡스톤도 *Python 함수*가 본체, 졸업은 Codaro가 얹는 층 — API 암기 lock-in 금지.
7. **선행 의존성 정직.** 미승격·미추적 기능(예: `tests/_attempts/agentCore`)이나 **미구현 학습 표면**(예: from-code Harvest의 tool_use 정의 — 부록 C에서 현재 부재 확인)에 의존하는 레슨은 그 표면이 제품에 배선된 뒤에만 작성한다. Phase 1·2가 이를 선행작업으로 명시한다.

---

## 4. 로드맵 — 4 Phase (각 Phase에 머신 판정 DoD)

순서 = 의존성 + ROI. 각 Phase는 독립적으로 가치를 낸다.

### Phase 0 — 검증 정직화 (Depth) · 신규 콘텐츠 ≈ 0 · ROI 최고

- **목표**: 핵심 트랙의 `check`를 `noError`에서 `output`/`variable`/`contains` 결정적 검증으로 올린다. 도메인 1개 추가는 1/31 효과지만 검증 정직화는 전 도메인 가로 레버리지.
- **측정 도구는 이미 존재**(리뷰 반영): `auditCurriculumWeakness.py`가 `STRONG_CHECK_TYPES`·`weakCheckSignal`·`strong-check coverage`를 이미 집계하고, `tests/_strongSignalCategories.txt` allowlist(현재 비어 회귀차단 비활성)와 `weakSignalRegression`(임계 0) 메커니즘이 이미 있다. **Phase 0 첫 작업은 "도구 만들기"가 아니라**:
  1. 우선 트랙의 결정적-정답 가능 exercise를 `output`/`variable`로 고정(noError→강한 체크).
  2. 그 트랙 카테고리 키를 `tests/_strongSignalCategories.txt`에 등록 → 이후 그 카테고리는 약한 신호로 회귀 불가(`weakSignalRegression=0` 차단).
- **우선 트랙(분모 정의 포함)**: `30days` · `pandas` · `requests` · `openpyxl`. 분모 = "exercise를 가진 레슨 중 결정적 산출물이 가능한 레슨"(탐색형 noError 레슨은 §3.1대로 정당하게 제외 → 분모에서도 제외).
- **DoD (머신 판정)**:

  | gate | 임계 | 통과 조건 |
  | --- | --- | --- |
  | `curriculum-weakness-audit` | `weakSignalRegression: 0` | 우선 트랙 키가 `_strongSignalCategories.txt`에 등록되고 해당 카테고리 weak-check 레슨 0 |
  | (보조 지표) | — | `strong-check coverage` 우선 트랙 부분이 2/464 → 우선 트랙 exercise-결정가능 레슨 100% |

- **비범위**: predict/자동채점/점수(§3.1). 결정적 정답 없는 탐색형 셀은 `noError` 유지(정직).

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
  | 품질 일관성 | 신규 트랙 레슨이 처음부터 Phase 0(강한 체크)·Phase 1(Harvest 핸드오프) 기준 충족 |
  | "트랙 완성" 정의 | 그 트랙의 등록 outcome 전부가 ≥1 레슨에서 제공(gap 0) — *레슨 수가 아니라 outcome 커버리지* |

### Phase 3 — 횡단 졸업 캡스톤 (Journey) · 서명 산출물

- **목표**: `requests → pandas/regex → sqlite → openpyxl → email → watchSched`를 잇고 **Harvest로 끝나는** 크로스-도메인 캡스톤 2~3편.
- **범위(후보)**: "거래처 일괄 점검 → 차단리스트 → 주간 리포트 자동 발송"(webApi 깨진 약속 복구 결합), "내 폴더 정리 → 인덱스 DB → 주간 요약 메일".
- **DoD**: 다중 그룹 outcome을 prerequisite으로 갖는 캡스톤 ≥2, 각 캡스톤 마지막 단계가 Harvest 졸업, 전체 `testCurriculumOs`+`curriculum-weakness-audit` green.

---

## 5. 측정 지표 (정량) — 레슨 *수*는 지표가 아니다

| 지표 | 베이스라인(게이트 라이브) | 목표 | 측정 |
| --- | --- | --- | --- |
| 검증 깊이(레슨 단위) | strong-check 2/464 (0.4%), weak 462 | 우선 트랙 결정-가능 레슨 100% + `_strongSignalCategories.txt` 등록 | `auditCurriculumWeakness` strong-check coverage + weakSignalRegression |
| Harvest 핸드오프 캡스톤 | 0 | ≥3 | `curricula/` harvest 섹션 카운트 |
| 크로스-도메인 캡스톤 | 0 | 2~3 | 다중 그룹 outcome prerequisite 캡스톤 |
| 스파인 outcome 어휘 | 0 (sqlite/agentLoop/secrets) | 등록 | `_taxonomy.yml` outcomes |
| **결과 지표(리뷰 반영)** | placeholder-predict 30 · weak 462 | 우선 트랙 weak-check 레슨 0 | 게이트 출력 추세 |
| 숙달 라벨 정직성 | "noError 3회=숙달" 부풀림 | autoValidate 라벨 정직화 | `codaro_capability_engine_audit` 반영 |

**비지표(의도적 제외):** 총 레슨 수, 도메인 수. 둘 다 충분하고, 늘리는 것은 약속 위반의 씨앗.

**달성 가능성(리뷰 반영):** "우선 트랙 100%"는 *결정적 산출물이 가능한 레슨* 분모 기준이다. Phase 0 착수 시 우선 트랙별 *결정-가능 셀 비율*을 먼저 실측해, 결정 불가능한 탐색형이 많은 트랙은 분모에서 제외(목표 천장 과대설정 방지). 트랙별 차등 가능.

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
| "검증 깊이"가 predict/채점 부활로 오해 | §3.1로 못박음, `output`/`variable`/`contains`만, 탐색형 noError 유지 |
| `assert`/`str` 등 없는 타입 사용 | check 타입 4종 명시(§3.1, 부록 C) |
| 기존 도구 중복 구현 | Phase 0이 `auditCurriculumWeakness`·`_strongSignalCategories.txt` 재사용(§4) |
| 스파인 트랙 project 누락으로 차단 | Phase 2 DoD에 project ≥1 명시 |
| Harvest 학습 표면 부재 | Phase 1 step 0에 tool_use 정의 선행작업 |
| src 사본 오작성 | 데이터 SSOT 루트 고정(§3.5) |
| moat 레슨 lock-in | Python 본체 우선(§3.6) |

---

## 8. 즉시 착수 (Phase 0/1 첫 슬라이스 — 구체 파일, 순서 = 착수 순)

1. `automation/office/openpyxl/10_월간매출리포트생성기.yaml` — Harvest 핸드오프 섹션(Phase 1 첫 슬라이스). **단 Phase 1 step 0(from-code Harvest tool_use 정의) 선행.**
2. `automation/webApi/requests/` — 02~10 결번 복구 + capstone `10_거래처일괄조회자동화.yaml`(깨진 약속 복구, Phase 3 결합). **착수 전 기존 트랙 PRD `automation/webApi/requests/PRD.md`(이미 존재)를 읽고 정합을 맞춘다** — 이 트랙은 자체 PRD를 가지므로 결번 복구 계획이 그것과 충돌하지 않게 한다.
3. `automation/os/resilience/04_배치재실행시뮬레이션.yaml` — 멱등성+체크포인트+원자적쓰기 통합(sqlite 원장 씨앗, Phase 2 연결).
4. `dataAnalysis/pandas` 우선 트랙 — Phase 0 검증 정직화 시범(`output`/`variable`로 결정적 산출물 고정) + `_strongSignalCategories.txt` 등록.
5. `devLiteracy/devTools/commandLineIntro.yaml` — mock 대신 로컬 실행 섹션 1개 추가(트랙 확장 아님).

---

## 9. 의사결정 로그 (4렌즈 + 적대적 리뷰 → 수렴)

- **회의주의 렌즈**(방향 지배): 도메인 추가 금지, 깊이·검증·여정을 고쳐라. 레슨 수백 개 약속=vaporware. → 북극성·비지표·동결.
- **정체성 moat 렌즈**: Harvest 루프가 제품엔 있는데 커리큘럼엔 0건 — 최대 정체성 갭. → Phase 1.
- **전략 PM 렌즈**: sqlite·agent는 폭이 아니라 스파인 누락, 횡단 여정 0. → Phase 2·3(스파인 2개 제한).
- **품질 감사 렌즈**: 약한 레슨 구체 지목(webApi·resilience·devLiteracy). → §8.
- **적대적 리뷰 1·2**: 베이스라인이 predict 메타로 오염(`str` 허수)·`assert`/`str` 없는 타입·Phase 0 도구 이미 존재·Harvest 학습표면 부재·sqlite project 제약·`__init__` 배선 부정확·mainPlan 미추적·생성문서 stale. → v2에서 전부 반영(베이스라인 2/464 레슨단위로 교체, check 4종 명시, 도구 재사용, Phase 1 step 0, Phase 2 project 제약, 배선 정정, §10·11 신설).
- **충돌 해소**: PM "신규 트랙" vs 회의주의 "동결" → 깊이를 주축(Phase 0·1·3), 스파인 2개만 surgical(Phase 2), 나머지 폭 동결. no-prediction 게이트로 "검증=정직 check"를 분리.

---

## 10. 저자 · 캐파시티 · 마일스톤

- **저자**: 레슨/캡스톤 콘텐츠는 **사람이 직접 작성**(bulk 금지). AI는 초안 outline(`propose-curriculum-draft`)·검토·배선 보조까지. 최종 YAML은 사람.
- **처리량 가정**: 품질 우선이라 *주당 N편* 식 약속을 하지 않는다. 대신 **Phase는 캘린더가 아니라 DoD 게이트로 종료**한다(§4 각 DoD). 부분 완료도 진전(예: 우선 트랙 1개만 강한 체크화 + allowlist 등록해도 그 카테고리는 영구 회귀 차단).
- **권장 시퀀스**: Phase 0(openpyxl·pandas·requests·30days 순) → Phase 1 step 0(tool) → Phase 1 캡스톤 → Phase 2 어휘 등록 → Phase 2 트랙 작성 → Phase 3 횡단 캡스톤. Phase 간 병렬 가능하나 Phase 1 캡스톤은 step 0 도구 선행 필수.

---

## 11. 롤백

- **Phase 0(검증 체크 변경)**: 레슨 YAML check 변경은 단일 커밋 단위. `git revert <sha>` + `_strongSignalCategories.txt`에서 해당 카테고리 줄 제거(회귀 차단 해제).
- **Phase 1(Harvest 섹션·tool 정의)**: 캡스톤 YAML revert + `toolDefinitions/automation.py`의 from-code 도구 등록 취소 + teacher tool 카탈로그/테스트 동기 revert.
- **Phase 2(스파인 트랙)**: 트랙 디렉터리 revert + `_taxonomy.yml` outcome/lessonOutcomes 등록 취소 + `__init__.py` dict 항목 제거(미하면 orphan/그래프 무결성 게이트가 실패하므로 같은 커밋에서 원복).
- **Phase 3(횡단 캡스톤)**: 캡스톤 YAML + taxonomy 항목 revert.
- 공통: revert 후 `tests/run.py gate curriculum-weakness-audit`와 `testCurriculumOs`로 그래프·신호 원복 확인.

---

## 부록 A — 전문가 토론 요약 (4렌즈 + 적대 2)

- **품질 감사(15+레슨 정독)**: 강한 트랙=30days·pandas·requests(구조)·matplotlib. 약한=devLiteracy(읽기만)·resilience(통합 없음). webApi capstone 부재.
- **전략 PM**: P0=sqlite·aiAgents, 여정 갭=횡단 캡스톤·Harvest 핸드오프 0. "그래프 갭 0은 닫힌 어휘 안에서만 참."
- **정체성 moat**: moat 활용도 ≈ 0. Harvest 루프 0건이 최대 갭. 방향 A(졸업 캡스톤)·B(GUI=API tool_use)·C(리액티브/무인 에이전트). 경계: lock-in·predict 부활·미승격 의존 금지.
- **회의주의**: breadth-saturated/depth-starved. check 99.6% weak, exercise 8템플릿. 도메인 동결. 북극성=검증 정직화+횡단 여정.
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
- 강한 체크 정의·집계: `tests/curriculum/auditCurriculumWeakness.py:72` `STRONG_CHECK_TYPES={output,variable,contains}`; `:419` strong-check coverage 출력; `:68` `weakSignalRegression:0`; allowlist `tests/_strongSignalCategories.txt`(현재 비어 회귀차단 비활성).
- project 면제: `auditCurriculumWeakness.py:121` `PROJECT_EXEMPT_CATEGORIES={builtins,excel,practical,devTools,resilience}` (sqlite·aiAgents 미포함 → project 레슨 필수).
- Harvest 엔진: `src/codaro/automation/taskFlow.py:117` `createAutomationTaskFromCodePayload`; REST `src/codaro/api/automationRouter.py:201` `POST /api/tasks/from-code`(+outcomeId 졸업 게이트 403). **AI tool_use 정의는 부재**(`toolDefinitions/automation.py`의 `create-automation-task`는 path 기반).
- 트랙 배선 SSOT: `curricula/python/__init__.py`의 `categoryMapping`·`categoryMeta`·`categoryGroups`·`categoryTree`(+`learningPaths`) — `studyLoader.py:65-70`이 이 dict들을 읽음. 경로 결정 `_curriculaPythonRoot`(`studyLoader.py:48-51`)는 bundled src 사본을 우선(패키징), 약점 감사는 루트 고정(`auditCurriculumWeakness.py:147`) — 편집 SSOT는 루트.
- 무결성 게이트: `tests/curriculum/testCurriculumOs.py` — `testNoOrphanLessons`·`testTaxonomyCoversAllOutcomes`·`testEveryDomainProducesPlan`.

근거 메모리: `codaro_capability_engine_audit`·`codaro_signal_honesty`(검증 위기) · `codaro_curricula_ssot_tree`·`codaro_new_lesson_taxonomy_gate`(SSOT·배선) · `feedback_curriculum_no_prediction`·`feedback_curriculum_no_bulk_generation`(금지) · `codaro_rpa_gap_review`·`codaro_launcher_background_residency`(Harvest 무인 실행).
