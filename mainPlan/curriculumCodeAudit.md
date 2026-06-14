# 커리큘럼 코드 전수 점검 기록

> **일자**: 2026-06-14 · **대상**: 루트 `curricula/python/` 473개 레슨 전체 · **상태**: 실행-검증 + 41-트랙 의미 정독 전수 완료, broken-exercise 회귀 락 가동
> 이 문서는 "모든 강의 코드를 기계적 통과가 아니라 직접 점검했다"의 증거 기록이다. PRD Phase 0(콘텐츠 정직성 QA, [PRD.md](PRD.md))의 산출물.
>
> **2차 갱신(같은 날)**: 의미 정독을 41개 트랙 전수로 완료(종전 28/41 → 41/41). 동시에 audit를 **starterCode 실행**까지 확장하니, solution만 보던 종전 게이트가 못 잡던 **broken-exercise 40건**(학습자가 실제 실행하는 starterCode가 미정의 헬퍼·변수 참조)이 코퍼스 전역에서 드러나 정공법 수정했다. 8절 참조.

## 1. 무엇을, 어떻게 점검했나

점검 대상은 472개 레슨의 **모든 실행 코드**다 — `section.snippet`, `exercise.solution`, `exercise.starterCode`(블랭크 `___` 제외), 그리고 `blocks[].code`(expansion 중첩 포함).

세 겹으로 봤다. 한 겹으로는 못 잡는다:

1. **실행 검증 (executability audit, 전체 패키지 설치 후)** — 각 yaml을 노트북처럼 누적 namespace에서 실제 `exec`. **이번에 처음으로** 레슨이 선언한 데이터과학·비전·자동화 패키지 전체(46종, `torch` CPU 포함)를 설치해, 종전 audit가 "라이브러리 미설치"로 **건너뛰던 65%(4318개 실행 중 2816개)** 를 실제로 돌렸다. 이게 핵심 — 숨어 있던 결함이 그제야 드러났다.
2. **의미 정독 (트랙별 전수 스윕)** — 트랙당 에이전트 1개가 그 트랙의 모든 레슨을 정독해 코드↔본문 정합을 본다. 실행으로는 안 잡히는 결함(주장과 다른 출력, API 오용, 깨진 연습, 과장 설명)을 찾는다.
3. **수동 심층** — real-bug 클러스터를 직접 정독하고 `uv run`으로 근본원인을 실증한 뒤 정공법으로 고쳤다.

도구 SSOT: `tests/curriculum/auditCurriculumExecutability.py`. 이번 작업에서 **blocks[].code 실행**과 **환경-자격 정직분류**까지 확장했다(아래 5절).

## 2. 핵심 발견 — 패키지를 깔자 드러난 real-bug 61건

종전 audit는 커리큘럼 패키지가 환경에 없어 데이터과학·비전·자동화 레슨을 import 단계에서 건너뛰었다. 전체 설치 후 재실행하니 **숨어 있던 real-bug 61건**이 드러났다. 분류:

| 클러스터 | 건수 | 정체 | 판정 | 처리 |
| --- | --- | --- | --- | --- |
| `aiIntegration/llmBasics` (01~10) | 38 | `anthropic` SDK가 `ANTHROPIC_API_KEY` 없이 `messages.create` 호출 → `TypeError: Could not resolve authentication method` | **환경 의존** (코드 정확, 키만 없음) | audit를 정직분류로 보강 → runtime-other. 코드 정합은 정독으로 확인 |
| `visualization/matplotlib/05` | 2 | `ax.boxplot(..., labels=...)` — `labels`는 matplotlib 3.9+에서 제거됨(`tick_labels`로 대체) | **진짜 API drift** | `tick_labels=`로 수정(snippet·starterCode·설명문) |
| `imageVision/deepVision` (01~10) + `visionApps/06` | 12 | `weights.transforms()` 프리셋이 numpy ndarray 거부(PIL/Tensor만) → `TypeError: Unexpected type numpy.ndarray` | **진짜 트랙 버그** | `Image.fromarray()`로 변환(+`from PIL import Image`), 본문/힌트도 PIL 입력 명시 |
| `imageVision/deepVision` + `visionApps` NameError | (위 포함) | snippet이 직전 *exercise*에서만 정의되는 변수 참조(`chinaAuto`/`detCategories`/`china`/`flowerTop5`/`segCategories`/`cat18` 등). audit는 snippet+solution만 돌리고 starterCode는 안 돌려서 노출 | **진짜 결함**(snippet이 자체충족 아님) | 해당 변수를 snippet 안에서 정의해 자체충족화 |
| `automation/office/xlwings/02` | 3 | (a) ISBN 문자열을 Excel이 숫자로 강제해 float로 왕복 → `readback == catalog`(문자열) 불일치 (b) `assert fastElapsed < slowElapsed` 5행에서 flaky | **진짜 버그**(Excel 설치 환경에서 실패) | 셀 정규화 비교 헬퍼 + 비결정 타이밍 assert 제거 |
| `automation/office/xlwings/03` | 1 | `sheets.add(name)`가 활성 시트 *앞*에 삽입 → 시트 순서 assert 실패 | **진짜 버그** | `after=sheets[-1]`로 오른쪽 append |
| `automation/office/xlwings/10` | 2 | `@xw.func` UDF(순수 Python)의 **기댓값 literal이 틀림** — 칼로리 `197.2→197.3`/`247.8→248.0`, 체지방 F-케이스 `26.66→27.56` | **진짜 버그**(공식과 불일치) | 공식 재계산값으로 literal 정정(Deurenberg 식·칼로리식 모두 검증) |

> **정직성 주의**: 38건의 anthropic 실패는 "제품 결함"이 아니라 "환경 미준비(API 키)"다. 이를 real-bug로 두면 게이트가 환경 문제를 콘텐츠 결함으로 오판한다(최근 커밋 "게이트 분류 정직화"와 같은 원칙). 그래서 audit가 자격-증명 실패 신호를 runtime-other(정보성)로 분류하도록 고쳤고, 해당 코드의 *정합*(올바른 SDK 사용)은 정독으로 따로 확인했다.

## 3. 정공법 수정 (우회·예외삼킴 없음)

- **matplotlib/05** — `boxplot(labels=)` → `boxplot(tick_labels=)` (현행 API). snippet 2곳 + starterCode 2곳 + 설명문.
- **deepVision 01~10 · visionApps/06** — `weights.transforms()` 입력을 `Image.fromarray()`로 PIL 변환. ToTensor(ndarray 허용)·수동 `torch.from_numpy().permute()`·`imshow(ndarray)`는 정상이라 손대지 않음. snippet이 exercise-전용 변수를 참조하던 곳은 snippet 안에서 정의해 자체충족화.
- **xlwings 02·03·10** — float 왕복 정규화 비교, 비결정 타이밍 assert 제거, 시트 삽입 위치 명시, 잘못된 기댓값 literal 정정. 검증 로직 자체는 유지(round-trip 그대로).

수정은 모두 루트 SSOT `curricula/python/`에 적용(`src/codaro/curricula/`는 stale 사본이라 미수정).

## 4. 실행-검증 vs 정독-검증 vs 환경불가 (정직 구분)

"전수 점검"이라도 정직하게 셋을 구분한다:

- **실행-검증**: 패키지가 깔린 채 실제로 돌아 통과한 레슨(대다수). real-bug 0이 머신으로 보증.
- **정독-검증(환경상 실행 일부 불가)**: `llmBasics`(API 키·네트워크 필요), `xlwings`(Excel 필요), 일부 `playwright`(브라우저)·OCR(tesseract 바이너리) 등은 환경 의존이라 전 구간 실행이 불가. 코드 정합은 정독 + 부분 실행으로 확인하고, 이 문서에 "정독-검증"으로 표시.
- **환경불가는 결함이 아니다**: 키/Excel/브라우저가 없어 못 도는 것을 버그로 적지 않는다.

## 5. 회귀 방지 (혁신적 잠금)

이번에 다시 깨지지 않도록 기계 게이트를 보강했다:

- **blocks[].code 실행 확장** — 종전 audit는 snippet+solution만 돌렸다. 이제 `blocks[].code`(expansion 중첩 포함)도 섹션 namespace 복사본에서 실행해 real-bug를 잡는다. blank(`___`)·비-Python(shell/browser) 블록은 정확히 제외.
- **starterCode 실행 확장 (혁신 회귀 락)** — 종전 audit의 최대 사각지대는 **학습자가 노트북에서 실제로 실행하는 `exercise.starterCode`** 였다. solution(정답 복사본)만 검사하니, starterCode가 snippet에 없는 헬퍼·집계 변수를 참조해도 통과했다. 이제 blank(`___`)가 없는 완성형 starterCode를 섹션 **누적 namespace 복사본**에서 실행한다. 노트북 모델을 충실히 재현하므로(이전 snippet이 누적 namespace에 정의한 이름은 보임) cross-section 참조는 false positive가 아니고, 어디에도 정의되지 않은 이름만 NameError로 잡는다. 이 확장이 코퍼스 전역에서 broken-exercise 40건을 발굴했다(8절).
- **환경-자격 정직분류** — `isEnvCredentialError`로 자격증명/네트워크 실패를 runtime-other로 분류(환경 미준비 오판 방지).
- **단위 테스트** — `tests/curriculum/testCurriculumExecutabilityAudit.py`에 블록 실행·블랭크 스킵·중첩 namespace·자격오류 분류 + **starterCode 3종**(미정의 참조→real-bug / blank starter→실행제외 / snippet정의 변수 참조 starter→ok) 케이스 추가. 전체 18 케이스 green.
- **커버리지 확대** — 레슨 선언 패키지 전체 설치로, 종전 건너뛰던 데이터과학·비전 레슨이 실제로 검사 대상이 됨.

게이트: `uv run python -X utf8 tests/curriculum/auditCurriculumExecutability.py` (임계 real-bug·undeclared-package·yaml-load-error 0). 검사 단위가 snippet·solution·blocks·**starterCode** 4종으로 늘어 7,583 체크(473파일).

## 6. 정독 스윕 결과 (실행으로 못 잡는 의미 결함)

41-트랙 전수 정독 스윕(트랙당 1에이전트, 코드↔본문 정합 검사)을 **41/41 트랙 완료**했다(1차 28 + 2차 13). 각 에이전트는 그 트랙 모든 레슨을 정독하고 구체 수치 주장은 `uv run python`으로 직접 실증했다. 실행으론 안 잡히는 의미 결함을 다수 찾았다 — 실행 게이트는 "안 죽으면 통과"라 이런 결함을 못 잡는다(이게 정독을 따로 돌린 이유). 2차 13트랙 결과는 6.4절.

### 6.1 수정한 정독 결함

- **dataAnalysis/polars (00·02~10, 10개 레슨) — broken-exercise(high)**: `workflow_validation`의 `exercise.starterCode`가 **어디에도 정의되지 않은 `revenueByChannel`** 를 참조해 학습자가 실행하면 `NameError`. check가 `noError`라 통과 불가, solution도 starterCode와 무관. → snippet의 `orderFrame`에서 `revenueByChannel`(refund 제외 채널별 netRevenue 집계)를 starterCode에 정의하도록 정공법 수정. 실증: `qualifiedChannels [3,2,2]` 단조 비증가 assert 통과.

### 6.2 문서화한 정독 결함 (후속 보강 대상 — 합성데이터 수술/프로즈 정정 필요)

> 아래는 **실데이터용으로 쓴 본문이 합성 데이터(`loadLocalDataset`, src/codaro/curriculum/localData.py)와 불일치**하거나, 프로즈/힌트가 코드와 어긋난 결함이다. 다수가 한 뿌리(합성 ↔ 실데이터)라 로더 수술 또는 레슨별 프로즈 정정이 필요해 이번 사이클의 코드-실행 수정과 분리해 문서화한다.

- **합성데이터 ↔ 실데이터 프로즈(systemic, high/medium 다수)**:
  - duckdb(titanic): `_titanicData()`는 age에 null이 없어 `WHERE age IS NULL`이 0행 → NULL 처리 강의의 핵심 개념이 빈 결과로 안 보임. "177명 누락"·"891행"·여성 생존율74%/남성19%(실제 합성: 여성100%/남성25%)도 불일치. (대안: `_titanicData`에 null age 주입 또는 `titanic_passengers` 로더 사용 — 후자는 컬럼 스키마 다름.)
  - 다이아몬드 Simpson 역설: 합성 `_diamondsData`는 Fair가 최고가가 아니라 역설이 재현 안 됨 → 역설을 못 보여주는 데이터로 역설을 가르침.
  - mpg(origin 평균): 본문 "일본 최고"인데 합성은 europe 최고. flights(1960 Jul): 본문 "465·3배"인데 합성 417(~2.5배). titanic 생존율 구체 수치 다수.
- **llmBasics/07 (프롬프트캐싱, medium×2)**: 캐시 최소 임계값을 "1024 토큰"이라 했으나 haiku-4-5는 **4096 토큰**. 데모 시스템 프롬프트가 ~1000토큰이라 **캐시가 실제로 안 생겨** 핵심 시연(cache_read 증가)이 일어나지 않음(assert는 cachedTotal>0뿐이라 안 깨짐). + 06·10의 assistant prefill JSON 강제는 haiku 전용(sonnet/opus 4.6+에서 400) — 00강의 "모델만 바꾸면 됨" 안내와 충돌(low).
- **sympy/07 (삼각함수, medium)**: `step9_product`가 `expand_trig(sin(a)*cos(b))`로 곱→합을 시연한다지만 `expand_trig`는 그대로 반환 → 개념 미시연. (`fu()`/`TR8()` 필요.)
- **openpyxl 조건부서식(medium×2)**: `step1_color_scale`/`step2_data_bar` 스니펫 마지막 표시값이 규칙 적용을 안 보여줌 → `[str(k.sqref) for k in ...]` 패턴으로 정정 필요. `step3_internal_link`은 `.location` 대신 `.target` 사용 권장.
- **automation/webApi/requests(medium)**: `capability_map`/`persona_match`/`contract`가 **존재하지 않는 02~10강**을 참조(실제는 00·01·11·12·13만). 학습 계약이 없는 강의를 가리킴(PRD §2.5 "깨진 약속"과 동일).
- **소형 프로즈/힌트 결함(medium)**: os/fileOps `mtime-datetime` 힌트가 15:00:00Z(실제 16:00:00Z, 1시간 오차) · os/inputCtl `validate-key`의 "'A'→False" 거짓(실제 True) + `capture-and-locate` needleAt 비결정 · os/procCtl `parent-relation` resultCheck가 `==os.getpid()` 단정(실제 양수일 뿐) · text/regex `step4_line_anchors`(앵커·MULTILINE 미사용) + `step7` 전화번호 정규화 모순 · builtins `chainmap`/`workflow_validation`(차트 레슨 복붙 잔재).
- **email(검토 필요)**: 스윕은 `iter_parts()`→`walk()`(StopIteration)를 high로 봤으나 **실행 게이트에선 email 스니펫/솔루션이 clean** — snippet/solution 실행 무결함과 모순이라 starterCode 한정이거나 오탐. 수동 재확인 후 판정(미수정).

### 6.3 깨끗한 트랙(정독 clean)

playwright(11), sympy(00~06·08~10), llmBasics(00~05·08·09), office/practical 등은 정독에서 코드↔본문 정합 양호로 확인.

### 6.4 2차 13트랙 정독 결과 (종전 미완분 — 이번에 전수 완료)

각 트랙 high/medium 위주(low는 합산만). 결함은 5계열로 분류한다:
**A** broken-exercise(코드/NameError, 게이트가 잡음 → 8절에서 수정) · **B** 합성데이터↔본문 실데이터 불일치(loader-surgery/prose, 문서화) · **C** 타 주제 템플릿 잔재(차트/정규식/리스트 어휘가 엉뚱한 섹션 prompt/hints, prose-fix) · **D** prose 사실오류/과장(prose-fix) · **E** 구조 이상(check.type 누락 등). check/resultCheck에 있는 결함은 **채점 카드라 보고만**(predict/채점 동결, [PRD.md](PRD.md)).

| 트랙 | high/med/low | 핵심 결함(계열) |
| --- | --- | --- |
| basics/30days | 1/6/12 | day12 method_get prompt/hints가 Altair 차트 템플릿 잔재(C, high). day04 `'C:\\\\Users'`(4 backslash) 본문 규칙과 출력 불일치(D). day07/14/28 reflection이 안 가르친 내용 회상(D). day05 파일전체 "리스트" prose(실제 string, C) |
| basics/builtins | 11/14/13 | **차트 템플릿 잔재** prompt/hints — 13_json·15_pickle·18_textwrap·28_copy(C, high). **정규식(re) 템플릿 잔재** — 11_glob(4섹션)·19_difflib·26_unittest(C, high). 12_shutil workflow 깨진약속(copy/archive 약속, 실제 개수집계만, D) + "_backup" 교육이 repo 규칙 충돌. check.type 체계적 누락 14_csv·24_argparse·26_unittest(E) |
| dataAnalysis/numpy | 9/5/5 | 합성↔실데이터 규모 단정(B): 03"23,000건"(합성160)·04"32,000곡"(144)·05"10,000명"(160)·10"768명"(220). **09 전복** 합성 회귀 R²=0.003(설명력0)+본문 "ShellWeight 최중요"인데 실제 WholeWeight(B). 02 기온 본문 145년인데 합성 10년→온난화 차이 항상 0(B). workflow assert 11셀 전부 실제 통과 |
| dataAnalysis/pydantic | 4/5/8 | 누락 import 순차커널 NameError — 01 Optional·06 computed_field·09 datetime/Literal/TypeVar(**A후보→8절 머신확정**). 차트 템플릿 잔재 광범위 05(5섹션)·01(3섹션)·02·04·06(C). 10 quality errorsByType 실제 stage별(D) |
| imageVision/opencv | 3/1/1 | L03 step2 resize height=214인데 hint·check 213 기대(cv2 반올림, hint=D수정/check=보고만). L06 step5/6 적응임계 데모 입력이 전역우위 못 만듦→데모 작동 안 함(B/D). L08 practice china 고대비라 CLAHE std↓→contrastImproved 항상 거짓(B/D) |
| imageVision/pillow | 1/4/6 | 07 워터마크 step2 좌표픽셀(12,12) 검증이 기본폰트 글리프 미도달로 flower에서 항상 False(D, diff기반으로). 02 crop off-by-one 107/213→106/214(D). 04 emboss/07 우연·공허 통과(D). 08 type:noError가 resultCheck 무력화 가능(E) |
| imageVision/visionBasics | 0/1/3 | 04 lab_lightness가 BT.709 휘도를 OpenCV Lab L 근사라 오기(실제 비선형 CIE L*, D). 10 빨강증폭을 "누런"(실제 붉은, D). 04 hint brightMask 미정의(개방형). 08 np.where dtype int64 |
| imageVision/visionApps | 1/1/1 | 05 Haar가 flower에서 3개 오검출(본문 "얼굴0·동일이미지" 거짓, D 정정). 10 노출태깅 'bright' 0건(합성 max mean~158, B/D). 08 썸네일 균등간격 prose(D) |
| mathStatsMl/scipy | 0/0/2 | 거의 clean. 05 로그변환 후 정규성 회복 단정인데 Shapiro p≈0.014 여전히 기각(D, prose완화). 03 interp1d legacy. 모든 수치 직접 검증·시드 고정 |
| mathStatsMl/sklearn | 12/1/2 | **workflow_validation starterCode fitRiskModel 미정의 ×11(A→8절)**. 02 유방암 recall이 pos_label=1(benign)인데 본문 "악성 재현율 중요"라 라벨 불일치(D). 08 "14개 특성"(실제 13, D) |
| visualization/seaborn | 1/2/4 | 07 step10 `isin([1967,1987,2007])` 합성 gapminder에 1967/1987 없어 1패널만 렌더→데모 붕괴(B, high prose-fix). 05 titanic"891명"(180)·여성생존100%(실제74%)·age null 0(B). 02/03/00 행수 표기(B) |
| visualization/altair | 1/3/5 | 04 step3 stacked-area가 합성 penguins 섬당1종이라 안 쌓임(본문은 다종분포, B). 04 step8 "점선=평균"인데 rule 레이어 없음(D)+dotFinal 표시줄 누락(차트 안 보임, D). 07 step4 "범례클릭"인데 bind='legend' 없음(D). 09 step3 explanation 자리표시자(D). 00 "Codaro 문서" 링크가 Altair URL(D) |
| visualization/folium | 0/4/4 | 05·08·10 step11/workflow why·prompt·hints가 차트/정규식 어휘 오염(C). 00 약속한 `m` 지도 표시 셀이 레슨에 없음(D). 좌표·GeoJSON·API 전부 정상 |

> 압도적 패턴 둘: **B(합성데이터↔실데이터 prose)** 와 **C(타 주제 템플릿 잔재)**. B는 단일 로더 `src/codaro/curriculum/localData.py` 정합화로 대량 해소 가능하나 통계 충실도 재현이 필요(별도 사이클). C는 prompt/hints prose의 대량 정정(별도 사이클). 둘 다 실행 게이트 사각이라 §6.2와 함께 후속 보강 대상으로 문서화한다. 작고 명확한 D 계열 code-fix(altair dotFinal·30days backslash 등)도 함께 묶어 후속.

## 7. 후속 보강 대상 (정직 고지 — 게이트 사각의 의미 결함)

정독으로 드러난 의미 결함 중 **실행/회귀 게이트가 못 잡는** 것(prose·합성데이터·구조)은 별도 사이클로 둔다. 게이트가 잡는 코드 결함은 8절에서 이번에 전부 수정했다.

- **B. 합성데이터↔실데이터 prose 클러스터** — numpy·seaborn·altair 다수 + §6.2(duckdb/diamonds/mpg/flights). `localData.py` 단일 로더 정합화로 대량 해소 가능하나 통계 충실도(Simpson 역설·결측·실데이터 행수) 재현이 필요해 신중히. 게이트 통과엔 prose-fix(행수/결론 톤다운)로 충분.
- **C. 타 주제 템플릿 잔재** — builtins(11)·pydantic·folium·30days·altair의 prompt/hints에 차트/정규식/리스트 어휘 오염. 대량 prose-fix(섹션 실제 주제 어휘로). check 블록의 동일 오염은 채점 카드라 동결.
- **D. 소형 prose 사실오류** — 산발(scipy 로그변환·pillow crop·sklearn recall·opencv hint 등).
- **E. 구조 이상** — builtins의 check.type 체계적 누락 등(loader-surgery).
- 본 기록 수치(real-bug 61+40→0, 정독 41/41)는 2026-06-14 기준.

## 8. broken-exercise 회귀 락이 발굴한 40건 — 정공법 수정 (게이트 통과)

starterCode 실행 확장(5절)을 코퍼스 전역(473파일, 7,583체크)에 돌리니 종전 게이트가 못 잡던 **real-bug 40건**이 드러났다. 전부 "학습자가 실제 실행하는 starterCode가 어디에도 정의되지 않은 헬퍼·변수를 참조" — solution만 보던 게이트의 사각이었다. 주목할 점: 이 중 networkx·statsmodels·visionFeatures는 이번 의미 정독 13트랙에도 없던 트랙인데, **머신 회귀 락이 코퍼스 전역에서 스스로 발굴**했다(정독이 닿지 않은 곳까지 커버). 4개 패턴:

| 패턴 | 건수 | 정체 | 정공법 |
| --- | --- | --- | --- |
| P1 sklearn 00~10 workflow_validation | 11 | snippet이 `riskPipeline`만 정의, starterCode가 참조하는 헬퍼 `fitRiskModel`·baseline `riskAccuracy`/`riskF1` 미정의 → NameError | snippet에 `fitRiskModel` 정의 + baseline 학습/평가 추가(누적 namespace 충족) |
| P1 networkx 00~10 workflow_validation | 11 | snippet이 그래프만 만들고 starterCode의 `salesToFinanceCost`(경로비용) 미정의 | snippet에 그래프 실제 노드 기준 비용 변수 정의 |
| P1 statsmodels 00~06·08~10 workflow_validation | 10 | snippet이 모델만 적합하고 starterCode의 `reportY`(예측/실측) 미정의 | snippet에 모델 결과 기준 `reportY` 정의 |
| P2 이미지 starterCode 자체충족 실패 | 7 | deepVision/04(`queryFlower`)·visionBasics/04(`chinaHsv`)·05(`china`)·09(`flower`)·visionFeatures/02(`flower`,`kpFlower`) — 직전 exercise에서만 정의되던 샘플 변수 | 해당 섹션 snippet에서 샘플을 정의해 자체충족화(deepVision 1차 수정과 동일 원칙) |
| P3 statsmodels/07 step5_gdp_trend | 1패턴 | snippet+starter 둘 다 `ValueError: cannot insert date, already exists`(date 인덱스/컬럼 충돌) | reset_index 충돌 정공법 수정 |

> P1은 **snippet만** 고친다 — starterCode는 누적 namespace에서 그 정의를 보므로, snippet이 헬퍼/baseline을 정의하면 자연히 해소된다(check 채점 카드는 동결, 무수정). cascade-failure 13건은 위 real-bug의 2차 파생이라 원인 수정으로 함께 사라진다. 수정 후 코퍼스 audit **real-bug 0** 확인.
