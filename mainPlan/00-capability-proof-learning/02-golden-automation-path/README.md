# 02. 첫 golden 자동화 경로

상태: 대기

선행: `00-evidence-authority`, `01-capability-task-family`

첫 golden path는 새 `reportAutomationFoundation` id를 사용하고 기존 레슨 source 중 실제 과업에 필요한 11개를 재사용한다. 기존 `pythonFoundation`의 의미와 과거 evidence는 유지한다. 공개 약속은 Python 문법 자체가 아니라 `입력을 검증해 자동화 보고서 만들기`다.

## packet 순서

1. [최소 outcome과 새 path](00-minimum-outcome-path/README.md)
2. [한 TaskFamily 수직 slice](01-single-family-slice/README.md)
3. [나머지 task class와 capstone](02-task-classes-capstone/README.md)

## 최종 수행 계약

사용자는 다음 조건에서 전체 과업을 수행한다.

```text
입력
CSV item, amount 레코드와 출력 파일명

해야 할 일
필드를 읽고 숫자를 검증하고 유효값과 무효값을 분리한다.
count, total, average를 계산한다.
JSON 보고서를 저장하고 같은 의미의 딕셔너리를 반환한다.

결과물
schema와 의미 필드가 검증된 JSON 파일

허용 도구
문제 명세, Python 표준 라이브러리 문서, 일반 편집 기능

assurance에서 금지되는 도움
수업 정답, 단계별 교수 힌트, answer reveal

증명하지 않는 것
대규모 데이터 성능, 보안, 팀 코드 유지보수성, 모든 Python 문제 해결 능력
```

day30의 기존 `build_sales_report`, `status_summary`, `validate_pipeline`을 최종 TaskFamily의 세 mode seed로 재사용하되, application과 assurance를 분리하고 outcome별 subcheck를 추가한다.

## 먼저 만드는 수직 slice

11개 레슨을 한꺼번에 바꾸지 않는다. day13, day15, day20, day30의 일부를 연결한 `python.report.pipeline` family 하나를 먼저 관통한다.

```text
entry 또는 worked example
→ acquisition
→ transfer
→ virtual-clock retrieval
→ Local strong artifact descriptor
→ learning archive automation draft lineage
```

이 slice는 UI receipt와 artifact opener를 요구하지 않는다. Local에서 canonical strong proof와 lineage를 만들고, Web behavior run이 강한 credit을 만들지 않으며 정확한 Local handoff를 보이는 것까지를 종료 조건으로 둔다. 이 slice의 checker discrimination과 저작 구조가 닫힌 뒤 나머지 task class를 연다.

## task class 설계

### Class 1. 한 레코드를 결과로 표현한다

대상:

- `python.intro`
- `python.variables`
- `python.operators`
- `python.strings`
- day01, day02, day03, day04

whole task의 작은 버전은 한 행의 item과 amount를 읽어 계산된 상태 문장을 만드는 일이다. 완성 예제에 `입력 읽기`, `값 변환`, `표현 만들기`, `결과 확인` subgoal을 표시한다.

교수 순서:

1. 완성 예제를 실행한다.
2. item과 amount를 바꿔 output diff를 읽는다.
3. 잘못된 문자열 결합 또는 형 변환 오류를 고친다.
4. 일부 expression만 남은 starter를 채운다.
5. 새로운 레코드 fixture에서 수업 정답 없이 한 행 변환을 수행한다.

### Class 2. 여러 레코드를 판정하고 집계한다

대상:

- `python.lists`
- `python.dictsAndSets`
- `python.controlFlow`
- day07, day10, day13

whole task는 여러 행을 순회하고 유효, 중복, 무효 상태를 나눈 뒤 count와 total을 만드는 일로 확장된다.

필수 오개념 fixture:

- 빈 입력
- 중복 item
- 누락된 amount
- 0과 음수
- 숫자로 바꿀 수 없는 문자열
- 입력 순서가 바뀐 경우

set 사용 자체를 정답으로 강제하지 않는다. 중복 처리라는 outcome을 behavior와 invariant로 판정한다.

### Class 3. 재사용 가능하고 실패를 설명하는 파이프라인을 만든다

대상:

- `python.functions`
- `python.modulesAndIo`
- `python.errorHandling`
- day15, day18, day20

whole task는 함수 계약, 파일 입출력, 오류 분리를 가진 작은 파이프라인이 된다.

지원은 다음처럼 줄인다.

- 첫 task: 함수 경계와 파일 열기 코드 제공
- 두 번째 task: 함수 시그니처와 fixture 경로만 제공
- 세 번째 task: 입출력 계약과 expected artifact만 제공

repair task에는 `except Exception`으로 모든 오류를 숨기기, invalid row를 조용히 버리기, 빈 입력에서 0으로 나누기 같은 목표 오개념을 심는다. 실패 code는 어느 requirement가 깨졌는지 보여 주고 바로 정답 코드를 노출하지 않는다.

### Class 4. 전달 가능한 보고서와 자동화를 만든다

대상:

- `python.projectDelivery`
- day30

whole task는 함수 기반 보고서 생성기, 검증된 JSON 결과물, 재실행 가능한 자동화 draft로 확장된다. OOP, property, decorator는 이 claim의 필수 outcome이 아니며 day22와 day25는 optional enrichment 또는 catalog reference로 남긴다.

assurance lifecycle:

1. acquisition: `build_sales_report` 계열을 수업 정답과 단계별 힌트 없이 통과한다.
2. transfer: 상태 레코드처럼 표면 맥락과 데이터 조건이 다른 fresh variant를 통과한다.
3. retrieval: due 이후 invalid row와 경계값을 포함한 새로운 variant를 통과한다.
4. application: JSON artifact strong check와 capstone transaction을 남긴다.
5. automation run: proof lineage를 가진 자동화 draft를 만들고 검증 fixture에서 한 번 실행한다.

retrieval은 due 전에 열리지 않지만 overdue에도 계속 열려 있어야 한다. receipt에는 `7일 안에 통과`가 아니라 `실제 N일 뒤 새로운 조건에서 통과`로 기록한다.

## section 저작 형식

아래 요소는 저작 coverage다. compatible evidence가 있거나 노출되지 않은 entry checkpoint를 통과한 사용자는 formative 요소를 건너뛰고 transfer로 간다. entry 실패는 lapse가 아니라 worked example 진입 신호다.

| 요소 | instructionRole | assessmentRole | credit |
| --- | --- | --- | --- |
| 전체 맥락과 완성 예제 | workedExample | none | 없음 |
| output, 변수, 오류 조사 | practice | formative | 없음 |
| 요구 하나 변경 | practice | formative | 없음 |
| 목표 오개념 repair | practice | formative | 없음 |
| faded completion | practice | formative | 없음 |
| 수업 정답 없는 build | practice | assurance | acquisition |
| fresh context task | practice | assurance | transfer |
| due 이후 fresh task | practice | assurance | retrieval |
| 결과물과 자동화 | project | application | capstone |

예측 답변 카드와 읽음 확인은 넣지 않는다. 조사 단계는 실행 결과, 변수, 오류, output diff를 직접 읽는 상호작용으로 만든다.

## deterministic remediation

checker가 반환하는 failure code를 아래 지원 단계에 연결한다.

| failure 계열 | 첫 지원 | 반복 시 지원 | assurance 영향 |
| --- | --- | --- | --- |
| syntax 또는 name | 관련 줄과 error class | 최소 문법 예시 | 단계별 힌트 사용으로 기록 |
| contract shape | observed와 expected key, type 차이 | 결과 구조 subgoal | 단계별 힌트 사용으로 기록 |
| boundary | 실패 case와 불변조건 | worked step 일부 | 단계별 힌트 사용으로 기록 |
| misconception repeat | 개념 단서 | Parsons 또는 더 강한 starter | formative로 돌아감 |
| answer reveal | 정답과 설명 | fresh parallel variant | 노출된 variant는 계속 formative |

같은 misconception의 반복 기준은 configurable policy다. 초기값을 둘 수 있지만 학습과학 상수라고 표현하지 않는다. attempt fingerprint가 같거나 공백만 바뀐 재실행은 반복 시도 수에 넣지 않는다. hint, worked step, case-specific expected, reveal exposure는 이후 같은 variant의 run에도 연결한다.

## 결과물 계약

JSON 파일 존재만 확인하지 않는다.

- media type이 application/json이다.
- UTF-8로 열 수 있다.
- `count`, `total`, `average`의 type과 의미가 맞다.
- 유효 레코드와 무효 레코드 규칙이 fixture와 일치한다.
- 반환값과 파일 내용이 같은 의미다.
- 파일 content hash가 descriptor와 같다.
- automation draft가 같은 artifact contract와 source proof를 참조한다.

artifact bytes 보존, export와 import 뒤 reopen, receipt UI는 `03-work-proof-surface`가 소유한다. 이 workstream은 artifact descriptor, content hash, automation draft lineage까지 만든다.

현재 browser policy에서 behavior check는 `localRequired`다. 첫 golden assurance는 Local strong을 사용한다. Web에서는 weak pass로 낮추지 않고 false credit 0과 Local handoff를 검증한다. 이후 Web supported subset이 별도 보안 gate를 통과하면 같은 oracle의 parity를 추가할 수 있다.

## 목표

기존 Python 레슨 중 과업에 필요한 11개를 새 end-to-end 자동화 경로로 묶는다. 한 family 수직 slice로 contract를 증명한 뒤 네 task class를 연다. OOP와 advanced syntax는 첫 golden의 필수 조건에서 제외한다.

## 영향 파일

- `curricula/python/_taxonomy.yml`
- `contracts/learning-content/path-ledgers/reportAutomationFoundation.yml`
- `contracts/learning-content/featured-capstones.yml`
- `curricula/python/schema.yaml`
- `curricula/python/basics/30days/day01_헬로월드.yaml`
- `curricula/python/basics/30days/day02_변수와데이터타입.yaml`
- `curricula/python/basics/30days/day03_연산자.yaml`
- `curricula/python/basics/30days/day04_문자열기초.yaml`
- `curricula/python/basics/30days/day07_리스트기초.yaml`
- `curricula/python/basics/30days/day10_집합.yaml`
- `curricula/python/basics/30days/day13_조건문.yaml`
- `curricula/python/basics/30days/day15_함수기초.yaml`
- `curricula/python/basics/30days/day18_모듈과import.yaml`
- `curricula/python/basics/30days/day20_예외처리.yaml`
- `curricula/python/basics/30days/day30_최종프로젝트.yaml`
- golden path fixture, mutation, alternative corpus
- `tests/curriculum/**`
- `tests/product/**`

## 영향 함수·심볼

- `registryLesson`
- `registryAssessmentBlocks`
- `documentFromCurriculumYaml`
- `sectionAssessmentMode`
- `dueAssessmentSectionIds`
- `evaluateLearningAttempt`
- strong behavior executor와 artifact collector
- path ledger builder
- featured capstone validator

콘텐츠 id는 가능한 한 유지하고 새 `taskFamilyId`, 역할, evidence slice를 추가한다.

## 테스트

1. 수직 slice 네 레슨의 Local source, solution, lineage 실행
2. 네 TaskFamily의 claim과 outcome closure
3. task class별 reference solution 전부 통과
4. unchanged starter, no-op, constant return 전부 거부
5. family별 required mutation corpus 전부 거부
6. 다른 변수명, loop, comprehension, 함수 분해를 포함한 valid alternative 전부 허용
7. empty, duplicate, invalid, nonpositive, reordered input fixture
8. acquisition, transfer, retrieval의 distinct variant와 fixture
9. hint 0과 answer reveal 없음 조건의 assurance credit
10. 6일 차 잠금, due 이후 열림, 15일 이후에도 eligibility 유지
11. outcome별 failure attribution과 일괄 credit 방지
12. JSON artifact schema, semantic field, content hash, descriptor
13. Local strong proof와 Web false-credit 0 및 Local handoff
14. slice 통과 뒤 11개 path lesson source schema와 solution 실행

```powershell
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate curriculum-weakness-audit
uv run python -X utf8 tests/run.py gate curriculum-executability
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

## 롤백

- 기존 lesson ref와 `pythonFoundation` path id를 유지하고 새 narrow path만 제거 가능하게 한다.
- 새 task class order를 되돌려도 event의 taskFamilyId와 version identity는 삭제하지 않는다.
- runtime capability가 부족하면 해당 checkpoint를 `localRequired` 또는 supported tier로 되돌리고 weak assurance로 강등하지 않는다.
- golden publication을 candidate로 되돌릴 수 있으나 학습 기록과 결과물은 보존한다.
- 콘텐츠 source rollback 뒤 ledger와 generated artifact를 다시 생성한다.

## 평가

첫 경로에서 다음을 기계 판정한다.

- 모든 필수 outcome이 하나 이상의 assurance evidence slice에 연결된다.
- 한 실패를 특정 outcome과 requirement에 귀속할 수 있다.
- 한 capstone pass가 미검증 outcome을 일괄 승격하지 않는다.
- acquisition, transfer, retrieval이 서로 다른 관찰이다.
- overdue 사용자가 다시 수행할 수 있다.
- 자동화 draft는 canonical proof lineage를 가진다.
- behavior assurance는 Local strong에서만 생기고 Web false credit은 0이다.
- 전체 흐름은 외부 강사, 수동 검수, provider 없이 재현된다.
