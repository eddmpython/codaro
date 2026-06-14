# 커리큘럼 코드 전수 점검 기록

> **일자**: 2026-06-14 · **대상**: 루트 `curricula/python/` 472개 레슨 전체 · **상태**: 실행-검증 완료, 정독 스윕 반영 중
> 이 문서는 "모든 강의 코드를 기계적 통과가 아니라 직접 점검했다"의 증거 기록이다. PRD Phase 0(콘텐츠 정직성 QA, [PRD.md](PRD.md))의 산출물.

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
- **환경-자격 정직분류** — `isEnvCredentialError`로 자격증명/네트워크 실패를 runtime-other로 분류(환경 미준비 오판 방지).
- **단위 테스트** — `tests/curriculum/testCurriculumExecutabilityAudit.py`에 블록 실행·블랭크 스킵·중첩 namespace·자격오류 분류 케이스 추가.
- **커버리지 확대** — 레슨 선언 패키지 전체 설치로, 종전 건너뛰던 데이터과학·비전 레슨이 실제로 검사 대상이 됨.

게이트: `uv run python -X utf8 tests/curriculum/auditCurriculumExecutability.py` (임계 real-bug·undeclared-package·yaml-load-error 0).

## 6. 정독 스윕 결과 (실행으로 못 잡는 의미 결함)

41-트랙 전수 정독 스윕(트랙당 1에이전트, 코드↔본문 정합 검사)을 돌렸다. **28개 트랙 정독 완료**, 13개 트랙은 **세션 사용 한도**로 미완(후속 §8). 완료분에서 실행으론 안 잡히는 의미 결함 **약 91건(high 36 · medium 54 · 그 외)** 을 찾았다. 실행 게이트는 "안 죽으면 통과"라 이런 결함을 못 잡는다 — 이게 정독을 따로 돌린 이유다.

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

## 7. 미완 · 후속 (정직 고지)

- **정독 미완 13트랙(세션 사용 한도, resets 후 재실행)**: basics/30days · basics/builtins · dataAnalysis/numpy · dataAnalysis/pydantic · imageVision/{opencv,pillow,visionBasics,visionApps} · mathStatsMl/{scipy,sklearn} · visualization/{seaborn,altair,folium}. 이 트랙들은 **실행 게이트로는 real-bug 0 확인됨**(코드 실행 무결), 의미 정독만 미완.
- **§6.2 문서화 결함**: 합성데이터 수술/프로즈 정정은 별도 사이클. 합성↔실데이터는 단일 로더(`localData.py`) 정합화로 대량 해소 가능하나 통계 충실도(Simpson 역설 등) 재현이 필요해 신중히 진행.
- 본 기록의 수치(real-bug 61→0, 정독 91)는 2026-06-14 기준. 후속 재실행 시 갱신.
