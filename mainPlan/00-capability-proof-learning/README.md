# 능력 증명 학습 체계 PRD

상태: 설계

Codaro는 472개 레슨을 가진 강의 카탈로그에서 멈추지 않는다. 사용자가 실제 입력을 다루고, 오류를 고치고, 새 조건에서도 다시 해내며, 검증된 결과물을 자동화로 이어 가는 학습 스튜디오가 된다.

이 이니셔티브의 결정은 간단하다. 하나의 유명 커리큘럼을 복제하지 않는다. 연구 근거가 있는 교수설계 메커니즘을 Codaro의 실행, 채점, 증거 계약에 맞게 조합하고, 한 개의 golden path를 제품 내부에서 끝까지 기계 검증한 뒤에만 범위를 넓힌다.

## 한 문장 제품 약속

> Codaro는 사용자가 수업 정답 없이 새로운 입력을 처리하고, 시간이 지난 뒤 다시 수행한 증거를 남기며, 검증된 결과물을 자동화로 이어갈 수 있게 한다.

`machineVerified`는 이 약속의 실행, 판정, 증거 계보가 제품 계약과 자동 테스트를 통과했다는 뜻이다. `effectVerified`는 사람의 학습 효과에 관한 인과 주장이다. 이 이니셔티브는 전자를 제품 내부에서 닫고, 인간 근거가 생기기 전에는 후자를 표시하거나 홍보하지 않는다.

## 제품 결정

1. 기본 진입은 전체 카탈로그가 아니라 목적이 분명한 golden path 하나다.
2. 첫 경로는 Python 문법 완주가 아니라 입력 검증, 변환, 보고서 생성, 재실행으로 이어지는 end-to-end 자동화 경로다.
3. 레슨은 교수 자산이고, 성취의 최소 단위는 `OutcomeDef`, 사용자 약속의 소유자는 `DomainDef`, 평가 반복의 소유자는 `TaskFamily`다.
4. 모든 레슨에 독립 수행, 전이, 시간 뒤 재수행 문항을 세 벌씩 붙이지 않는다. 승격 가능한 능력 checkpoint만 assurance lifecycle을 가진다.
5. 숙련 확실성과 실제 적용은 서로 다른 축으로 보여 준다.
6. 채점 결정과 credit 쓰기는 결정론적 검사만 소유한다. provider는 판정 이후의 설명만 도울 수 있다.
7. 백준형 알고리즘 문제는 핵심 과정이 아니다. 필요해지면 취업 준비용 선택 트랙으로만 둔다.
8. 외부 강사 승인, 제휴 인증, 수동 검수 계약은 구현 종료 조건으로 두지 않는다.

## 기준선

현재 저장소의 두 감사 층은 서로 다른 사실을 측정한다. 둘을 합쳐서 한 숫자로 홍보하면 안 된다.

| 층 | 측정 결과 | 의미 |
| --- | ---: | --- |
| canonical 레슨 | 472 | 검색 가능한 전체 교수 자산 |
| 평가 대상 레슨 | 468 | assessment variant가 붙은 레슨 |
| 저작된 assessment variant | 1,402 | 468개 레슨에 mastery, transfer, retrieval을 거의 세 벌씩 붙인 결과 |
| 원본 section strong check | 48 | 본문 연습 자체가 실행 가능한 강한 검사를 가진 레슨 |
| 원본 section weak check | 184 | 출력이나 일부 신호만 보는 레슨 |
| 원본 section prose-only | 236 | 실행되지 않는 서술형 확인만 가진 레슨 |
| assessment review 상태 | 1,402 pending, 468 authoring approved | 문항 상태는 independent review 대기인데 레슨 저작 상태는 동시에 승인으로 표시되는 모순 |
| featured path | 6 | 모두 같은 품질의 공개 경로처럼 보이는 경로 |
| 대표 capstone | 6 | 경로 종점 과제, 사용자 적용 증명 claim은 없음 |

1,402개 variant는 엔진이 없다는 뜻이 아니다. 472개를 모두 정식 과정처럼 유지하면서 세 모드의 문항을 거의 반복한 운영 비용이 이미 크다는 뜻이다. 반대로 원본 section의 236개 prose-only는 학습 흐름 안의 즉시 피드백이 아직 약하다는 뜻이다. review label의 모순은 사람 승인 문구가 실행 가능한 품질 gate를 대신할 수 없다는 뜻이다. 이 이니셔티브는 assessment 수를 더 늘리지 않고 두 층을 하나의 능력 계약으로 수렴시킨다.

## 해결할 사용자 문제

### 무엇을 배웠는지 보이지 않는다

현재 홈의 `강한 검증`, `독립 적용`, `숙달` 숫자는 진행량은 보여 주지만 능력을 설명하지 못한다. 사용자는 다음 질문에 답을 받아야 한다.

- 지금 어떤 일을 할 수 있는가.
- 수업 정답 없이 해냈는가.
- 예제와 다른 조건에서도 해냈는가.
- 시간이 지난 뒤 다시 해냈는가.
- 어떤 파일이나 자동화가 그 사실을 증명하는가.
- 무엇을 아직 증명하지 않았는가.

### 채점이 맞아도 학습이 얕을 수 있다

하나의 예시 출력 통과는 그 예시에서의 동작만 증명한다. 변수명, 대소문자, 공백 같은 표면 형식이 목표가 아닐 때 이를 강제하면 올바른 풀이를 탈락시킨다. 반대로 상수 반환이나 예제 하드코딩을 통과시키면 틀린 풀이를 합격시킨다. 똑똑한 채점은 자유로운 언어 판정이 아니라 능력별 관찰과 허용 범위를 정확히 계약하는 일이다.

### 학습과 실제 사용이 끊겨 있다

capstone 통과와 실제 결과물, 자동화 재실행은 같은 일이 아니다. 학습용 코드가 한 번 통과했다고 실제 적용을 주장해서도 안 되고, 일반 자동화 생성 자체를 숙달 상태로 막아서도 안 된다. 학습 성취로 표시할 적용만 canonical proof lineage를 요구한다.

## 대상 사용자와 성공 장면

주 대상은 Python을 처음 배우거나 문법은 조금 알지만 파일, 표, 보고서 자동화를 혼자 끝내지 못하는 성인 독학자다. 시작 시점에 백지 프로젝트를 요구하지 않는다. 완성된 전체 과업과 충분한 starter를 먼저 보여 주고, 같은 종류의 과업 안에서 도움을 줄여 간다.

성공 장면은 다음과 같다.

1. 사용자가 CSV 입력과 원하는 JSON 보고서를 본다.
2. 기능별 subgoal이 표시된 완성 예제를 실행하고 상태와 결과를 조사한다.
3. 하나의 요구를 바꾸고, 의도적으로 심은 오류를 고친다.
4. 점차 얇아지는 starter에서 같은 전체 과업을 완성한다.
5. 수업 정답과 단계별 힌트 없이 fresh fixture를 통과한다.
6. 표면 조건이 다른 과제에서 같은 불변 규칙을 적용한다.
7. due 이후 새로운 variant를 다시 수행한다. 늦게 돌아와도 응시 자격은 유지한다.
8. 결과물 파일을 열고, 검증된 코드로 자동화를 만들고, 실제 실행 receipt를 남긴다.

## 학습과학 판정

Codaro에 그대로 가져올 하나의 검증된 브랜드 커리큘럼은 없다. 다음 메커니즘을 근거 강도와 한계를 함께 적어 사용한다.

| 메커니즘 | 채택 | Codaro 적용 | 과장하지 않을 경계 |
| --- | --- | --- | --- |
| subgoal이 붙은 worked example | 핵심 | 완성 코드와 입출력에 기능적 단계를 표시한다. | 입문 프로그래밍 준실험의 긍정 신호를 모든 대상과 시험 성적으로 일반화하지 않는다. |
| guidance fading | 핵심 | 예제, 수정, 오류 복구, 일부 완성, 독립 제작 순으로 도움을 줄인다. | 고정 속도가 아니라 실패 코드와 지원 이력에 맞춰 조절한다. |
| mastery learning | 구조만 채택 | 목표는 고정하고 시간과 교정 지원은 가변으로 둔다. | 80% 같은 학교 시험 임계치를 코드 과제에 이식하지 않는다. |
| retrieval과 spacing | 조건부 채택 | due 이후 fresh variant를 실제로 작성하고 실행한다. | 7일, 14일, variant 3개를 과학 상수라고 부르지 않는다. |
| transfer | 성취의 핵심 | 데이터, 맥락, 요구가 다른 unseen task family variant로 본다. | 한 번 통과로 일반 문제 해결 능력 전체를 주장하지 않는다. |
| project 기반 수행 | 후반 적용 | 기초 능력을 묶는 guided artifact와 자동화에 사용한다. | 초보자에게 빈 프로젝트를 던지는 pure discovery는 쓰지 않는다. |
| Parsons scaffold | 막힘 대응 | 반복 실패 시 코드 조각 배열을 선택적으로 제공한다. | 풀이 부담을 낮추는 도구일 뿐 assurance credit으로 쓰지 않는다. |
| 4C/ID | 설계 휴리스틱 | 복합 과업을 simple-to-complex task class로 나눈다. | 네 요소를 선형 4단계나 효과가 보장된 완성 과정으로 부르지 않는다. |

4C/ID의 네 요소는 learning task, supportive information, procedural information, part-task practice다. whole task는 초보자에게 전체 맥락을 보여 준다는 뜻이지 무지원 제작을 뜻하지 않는다. supportive information은 task class 전에 제공하고, procedural information은 수행 직전에 제공하며, part-task practice는 자동화가 필요한 반복 기술에만 제한한다.

PRIMM 전체는 채택하지 않는다. 실행, 상태와 출력 조사, 요구 변경, 새 제작이라는 일부 상호작용만 참고한다. Predict 입력은 도입하지 않으며 교사 대화가 포함된 PRIMM 연구 효과를 Codaro의 효과 근거로 사용하지 않는다.

## 외부 커리큘럼 활용 정책

| 참고 대상 | 사용할 것 | 사용하지 않을 것 |
| --- | --- | --- |
| Helsinki Python MOOC | 짧은 설명, 잦은 실행 과제, 점진적인 문제 크기 | 점수, 시험, 지원 체계와 학습 효과 claim |
| Software Carpentry | 실제 데이터 하나가 과정을 잇는 구조, 오류와 방어적 프로그래밍 | 강사 진행 전제와 과학 데이터 맥락의 직접 복제 |
| CS50 | 엄격한 문제 계약과 자동 확인 방식 | 비상업 라이선스 콘텐츠, 문제, 해설, 코드의 복제 |
| CS2023 | 포함, catalog only, 제품 정체성상 제외를 기록하는 용어 감사표 | 학부 CS 17개 영역을 모두 넣는 범위 확대 체크리스트 |
| 백준형 문제 | 제한 조건, 자료구조, 인터뷰 대비가 목적일 때의 선택 연습 | 핵심 성취, 자동화 능력의 대리 지표, 전체 홈의 기본 진입 |

외부 과정은 설계와 범위의 참고점일 뿐 Codaro의 자동 채점 신뢰성을 대신하지 않는다. 출처와 라이선스가 허용해도 콘텐츠는 기본적으로 직접 저작하고, 실제 복사가 필요한 경우에만 별도 출처, 변경, 라이선스 계약을 둔다.

## 코딩테스트에 대한 제품 판정

알고리즘 코딩테스트는 사라지지 않았다. 2026년 CoderPad 업체 설문에서는 알고리즘 문항이 43%로 여전히 사용됐고, 실제 업무 시뮬레이션과 시스템 설계가 각각 38%, 코드 리뷰가 21%, 디버깅이 19%였다. 2025년 HackerRank 업체 설문에서는 개발자의 78%가 평가가 실제 일과 맞지 않는다고 답했고, 56%가 알고리즘 문항이 자기 업무와 무관하다고 답했다.

두 자료는 채용 도구 업체 설문이라 시장 전체의 인과 근거가 아니다. 다만 알고리즘 평가가 남아 있으면서 실제 업무형 평가도 커진다는 방향 신호로는 쓸 수 있다. Codaro의 정체성은 취업 문제은행이 아니라 개인 자동화 학습 스튜디오다. 따라서 golden path가 안정되기 전에는 알고리즘 트랙을 만들지 않고, 이후에도 사용자가 취업 준비를 명시적으로 선택했을 때만 별도 경로로 둔다.

## 장기 도메인 모델

새로운 claim 데이터베이스를 만들지 않는다. 기존 taxonomy와 evidence 엔진을 아래처럼 연결한다.

```text
DomainDef
사용자가 읽는 능력 약속과 경로 소유자
        ↓
OutcomeDef
실패를 귀속할 수 있는 원자 능력
        ↓
TaskFamily + variant + fixture
어떤 수행을 관찰할 것인가
        ↓
CheckSpec + evidence slice
어떤 결과를 어느 outcome의 증거로 해석할 것인가
        ↓
LearningEvent + MasteryPolicy
실제 실행, 지원, 판정, credit의 canonical 기록
        ↓
CapabilityProjection
assurance와 application의 사용자용 read model
```

### `DomainDef` 확장

`DomainDef`가 하나 이상의 사용자용 capability claim과 경로 구성의 단일 소유자가 된다. 다음 의미를 갖는다.

- claim별 사용자가 읽는 can-do 문장
- claim별 실제 쓰임과 대표 결과물
- 기존 `targetOutcomes`
- claim별 필수 `taskFamilyIds`
- 허용 도구와 runtime 조건
- 무엇을 증명하지 않는지 적는 `inferenceBoundary`
- material 의미 변경을 추적하는 semantic version

`OutcomeDef`는 176개 원자 능력 그래프와 prerequisite의 소유자로 유지한다. 큰 domain checkpoint가 여러 outcome을 묶을 때는 claim별 subcheck와 evidence slice 없이 일괄 credit을 주지 않는다.

### `TaskFamily` 계약

`sourceSectionIds`와 `${lessonRef}#${sectionId}`는 구체적인 순서와 variant 식별자일 뿐 같은 능력을 다른 조건에서 평가한다는 의미를 담지 못한다. promoted assessment에는 명시적 `taskFamilyId`를 추가한다.

각 TaskFamily는 다음을 가진다.

- 하나의 응집된 수행 불변조건
- 소유 domain과 대상 outcome
- acquisition, transfer, retrieval, 필요한 경우 capstone variant
- variant별 fresh fixture와 `taskVariantId`
- 허용 지원과 정답 공개 정책
- strong `CheckSpec`
- case와 outcome을 연결하는 evidence slice
- 측정하지 않는 품질과 일반화 범위
- reference solution, mutation corpus, valid alternative corpus
- artifact schema와 application 조건
- claim, family, variant, check, artifact contract의 semantic version

같은 event는 명시적으로 충족하지 않은 mode에 중복 credit을 주지 않는다. acquisition은 수업 정답과 단계별 힌트 없이, transfer는 다른 표면 조건과 fresh fixture에서, retrieval은 due 이후의 새로운 variant에서 각각 관찰한다. 과거 evidence는 event에 봉인된 claim, family, variant, check, artifact contract version이 현재 claim과 compatible할 때만 현재 stage를 올린다.

### 교수 역할과 평가 역할 분리

한 enum에 교수 역할과 평가 권한을 섞지 않는다.

```text
instructionRole: reference | workedExample | practice | project
assessmentRole: none | formative | assurance | application
assessmentMode: acquisition | transfer | retrieval | capstone
```

- `instructionRole`은 무엇을 어떻게 배우는지 설명한다.
- `assessmentRole`은 해당 section이 어떤 credit을 만들 수 있는지 제한한다.
- `assessmentMode`는 실제 evidence lifecycle에서의 위치를 말한다.
- 기존 `mastery` 값은 migration reader에서만 해석하고 새 writer는 `acquisition`을 쓴다.
- project라는 이유로 credit을 주지 않고, application이라는 이유로 assurance를 자동 승격하지 않는다.

## canonical evidence 권한

성취 단계는 한 경로만 바꾼다.

```text
Observed attempt
→ outer AttemptObserved bundle
→ RunObserved
→ CheckEvaluated
→ SupportProvided, 필요한 경우
→ EvidenceTransaction
→ CreditGranted
→ MasteryPolicy
→ CapabilityProjection
```

assurance projection의 authority는 LearningEvent archive다. application projection은 여기에 content-hash blob store, 기존 learning archive의 automation draft lineage, `TaskRegistry`의 task run receipt를 읽기 전용 입력으로 더한다. 별도 mutable application stage를 저장하지 않는다.

다음 항목은 stage를 바꾸지 못한다.

- 페이지 방문과 실행 횟수
- 자기평가와 수동 toggle
- legacy EMA와 review 성공
- provider 설명
- 결과물 파일 존재만 확인한 사건
- 정답 공개 뒤의 통과
- 같은 variant와 같은 fingerprint의 replay
- weak 또는 prose-only check

지원 노출은 한 attempt에서 끝나지 않는다. hint, worked step, Parsons scaffold, answer reveal, case-specific expected 정보가 노출되면 exposure receipt를 남기고 이후 같은 `taskVariantId`의 run이 이를 참조한다. answer reveal을 본 variant는 계속 formative로만 쓴다. 단계별 지원을 받아 고친 variant는 remediation 성공으로 기록하고, assurance는 노출되지 않은 fresh parallel variant에서 다시 시도한다.

### 먼저 고칠 권한 오류

1. `canonicalLearningEvidence.ts::creditMode`의 `mastery → capstone` 전역 변환을 제거한다.
2. 성공만 저장하는 outer archive에 `AttemptObserved` bundle을 추가하고 실제 성공, 실패, error class, hint, answer reveal을 모두 기록한다.
3. outer evidence의 artifact descriptor와 보존된 artifact content를 canonical run에 연결한다.
4. retrieval의 minimum delay는 응시 자격으로 유지하되 maximum을 credit 실격 조건에서 제거한다. overdue는 실제 지연 시간과 `reviewDue`로 표현한다.
5. assessment queue의 `7 * 24` 중복 상수를 versioned policy에서 읽게 한다.
6. `/api/tasks/from-code`에서 optional outcome과 legacy gate를 제거해 일반 자동화 생성으로 유지한다.
7. 학습 적용은 기존 automation draft adopt 경로를 강화하고 canonical proof, artifact, task run lineage를 요구한다.
8. 구형 수동 validation과 review writer는 migration 또는 diagnostics-only로 격리하고 stage 영향이 없음을 테스트한다.
9. claim, TaskFamily, variant, CheckSpec, artifact contract version을 run context와 receipt에 봉인한다.
10. `MasteryPolicy` v2에서 capstone은 assurance를 올리지 않고 application projection만 공급한다. v1 capstone은 compatibility acquisition으로만 읽는다.

## 첫 golden path

새 path id `reportAutomationFoundation`을 만들고 공개 이름을 `입력을 검증해 자동화 보고서 만들기`로 둔다. 기존 `pythonFoundation`의 의미와 과거 evidence는 바꾸지 않는다.

전체 과업은 다음과 같다.

> CSV 레코드를 읽고, 잘못된 값을 분리하고, 집계 결과를 JSON 보고서로 저장한 뒤, 같은 처리 규칙을 새 데이터에서 다시 실행한다.

기존 레슨 source를 문법 목록으로 차례대로 끝낸 뒤 마지막에 프로젝트를 주지 않는다. 처음부터 완성된 전체 과업을 보여 주고 네 개 task class 안에 필요한 개념을 배치한다. `python.oop`, `python.advancedSyntax`, day22, day25는 첫 golden claim을 막지 않는 optional enrichment와 reference로 남긴다.

| task class | 기존 outcome과 레슨 | 사용자가 하는 전체 과업의 확장 | 지원 수준 |
| --- | --- | --- | --- |
| 1. 한 레코드 표현 | intro, variables, operators, strings와 day01~04 | 한 행을 읽고 계산된 상태 문장을 만든다. | 완성 예제, subgoal, 강한 starter |
| 2. 여러 레코드 판정 | lists, dictsAndSets, controlFlow와 day07, day10, day13 | 여러 행을 순회하고 유효, 무효를 나눠 요약한다. | modify, seeded repair, 일부 완성 |
| 3. 재사용 가능한 파이프라인 | functions, modulesAndIo, errorHandling과 day15, day18, day20 | 함수를 모듈로 나누고 파일 입출력과 오류를 처리한다. | 얇은 starter, just-in-time 정보 |
| 4. 전달 가능한 결과물 | projectDelivery와 day30 | 함수 기반 보고서 생성기와 JSON 결과물을 만들고 재실행한다. | 수업 정답 없는 build, transfer, retrieval, application |

아래 아홉 요소는 저작 coverage이지 모든 학습자가 전부 소비하는 고정 syllabus가 아니다. 초보자 기본 진입은 worked example이다. 노출되지 않은 entry checkpoint를 수업 정답 없이 통과하거나 compatible한 기존 evidence가 있으면 formative 단계를 건너뛰고 transfer로 간다. entry 실패는 lapse나 벌점이 아니며 즉시 worked example과 formative 흐름으로 연결한다.

각 task class의 저작 coverage는 아래 순서를 따른다.

1. 최종 입력과 출력, 실제 쓰임을 한 문장으로 제시한다.
2. 기능적 subgoal이 붙은 worked example을 실행한다.
3. 변수 상태, 오류, output diff를 직접 조사한다.
4. 하나의 업무 요구를 바꾸는 modify를 한다.
5. 목표 오개념이 심긴 repair를 한다.
6. 일부만 남긴 faded completion을 한다.
7. 수업 정답 없이 build하고 strong check를 통과한다.
8. 다른 데이터와 요구의 fresh transfer를 수행한다.
9. due 이후 새로운 retrieval variant를 수행한다.

같은 오개념이 반복되면 deterministic failure code에 따라 개념 단서, worked step 일부, Parsons scaffold 순으로 지원을 늘린다. 초기 반복 횟수와 지원 단계는 versioned 제품 가설로 두고 가상 시계와 고정 fixture로 테스트한다. 정답 공개는 사용자 명령으로만 제공하고 노출된 variant는 assurance에 다시 쓰지 않는다.

## 채점 설계

### 판정 층

1. 실행: syntax, exception, timeout, 허용되지 않은 side effect
2. 행동: 공개 예시, 봉인 fixture, property 또는 metamorphic invariant
3. 결과물: 파일명뿐 아니라 media type, schema, 의미 필드, 행과 열, content hash
4. 과정: task family, variant, fixture, hint, answer reveal, fingerprint, evidence time
5. 품질: 가독성과 유지보수성이 명시 outcome일 때만 정적 규칙으로 검사

대소문자와 공백은 outcome에 무관할 때 semantic matcher가 허용한다. 그것 자체가 목표일 때만 exact 옵션을 쓴다. expected 코드 모양, 변수명, 특정 반복문은 계약이 요구하지 않으면 채점 기준이 아니다.

### checker 자기검증

모든 promoted TaskFamily는 사람 승인 없이 다음 실행 게이트를 통과해야 한다.

| 검사 | 실패 시 의미 |
| --- | --- |
| reference solution 전부 통과 | checker 또는 fixture가 자기 정답과 모순됨 |
| unchanged starter와 no-op 전부 거부 | 의미 없는 제출을 허용함 |
| curated mutation corpus 전부 거부 | off-by-one, 분기 삭제, 상수 반환, 오류 처리 누락을 구분하지 못함 |
| curated valid alternatives 전부 허용 | 특정 구현 모양을 정답으로 오해함 |
| boundary와 metamorphic fixture 통과 | 예제값만 맞추는 검사임 |
| student와 expected namespace 분리 | 정답 오염 위험이 있음 |
| 동일 seed 결정성 | 재실행마다 점수가 달라짐 |
| 지원 runtime parity | Web과 Local 판정이 다름 |
| artifact schema와 content hash 일치 | 빈 파일이나 잘못된 결과물이 성취로 남음 |
| answer reveal된 variant와 replay의 assurance credit 0 | 증거 부풀리기가 가능함 |

LLM은 reference solution을 만들거나 mutation 후보를 제안할 수 있지만 gate의 판정자는 아니다. 필수 테스트는 외부 네트워크, 사용자 파일, 유료 provider 없이 재현돼야 한다.

### 피드백 계약

첫 실패부터 해결책 전체를 노출하지 않는다.

1. 어떤 requirement와 case가 실패했는지 보여 준다.
2. observed와 expected의 의미 차이, error class, 관련 줄을 보여 준다.
3. 같은 misconception이면 개념 단서를 준다.
4. 계속 막히면 worked step 일부를 준다.
5. 요청 시 정답을 공개하되 해당 variant를 formative로 고정하고 fresh parallel variant를 다음 assurance 기회로 둔다.

피드백 문구는 checker가 낸 구조화 failure code에서 결정론적으로 선택한다. provider를 사용할 때도 이 결정을 설명하는 범위를 넘지 못한다.

## 사용자 성취 매개체: 작업 증명

하나의 퍼센트나 배지 대신 canonical evidence에서 두 축을 투영한다.

### 수행 확실성

- 연습 중
- 수업 정답 없이 해냄
- 새 조건에서도 해냄
- 시간 뒤 다시 해냄
- 복습 필요

`수업 정답 없이`는 일반 문서, 명세, 허용된 개발 도구까지 금지한다는 뜻이 아니다. 단계별 교수 힌트와 answer reveal을 사용하지 않았다는 뜻이며, 허용 도구는 claim receipt에 명시한다.

TaskFamily stage는 해당 mode의 required case와 outcome slice가 모두 통과해야 올라간다. claim stage는 current claim version의 모든 required TaskFamily가 도달한 최저 stage다. path는 claim별 mixed state를 최고값 하나로 합치지 않고 `2/4 능력에서 새 조건 수행, 다음은 파일 오류 처리`처럼 보여 준다. required family 하나라도 due이면 과거 evidence는 보존한 채 path에 복습 필요를 표시한다.

### 실제 적용

- 검증된 결과물을 만듦
- 여러 능력을 묶어 완성함
- 자동화로 다시 실행됨
- 새 입력으로 다시 실행됨
- 예약 실행됨

application은 파일이 존재한다는 이유만으로 올라가지 않는다. strong artifact check와 application 또는 capstone credit이 같은 transaction에 있어야 첫 단계를 얻는다. 자동화 단계는 canonical proof에서 만든 draft와 task run receipt의 lineage가 연결돼야 한다. fixture run은 `자동화로 다시 실행됨`, 사용자가 고른 새 입력은 `새 입력으로 다시 실행됨`, 실제 schedule receipt는 `예약 실행됨`으로 구분한다.

### evidence receipt

각 상태는 클릭하면 다음을 보여 준다.

- 능력 문장과 inference boundary
- task family와 variant
- runtime, fixture, check version
- 허용 도구와 실제 지원 수준
- 수행 시점과 실제 지연 시간
- 통과한 claim별 evidence slice
- 결과물 이름, media type, content hash, 다시 열기
- 연결된 자동화와 최근 실행 상태

화면 상태는 별도로 쓰지 않고 archive의 canonical event에서 항상 재계산한다.

## catalog와 경로 운영

472개를 지우거나 모두 golden으로 승격하지 않는다. 경로 공개 상태, 개별 레슨 가용성, 사용자 성취를 서로 분리한다.

| 계약 | 상태 | 의미 |
| --- | --- | --- |
| `PathPublicationState` | `candidate`, `golden` | path promotion projector가 machine gate에서 파생 |
| `LessonAvailability` | `reference`, `practice`, `unavailable` | 개별 레슨의 실행 가능성과 check 수준 |
| `Visibility` | `visible`, `hidden` | 기본 탐색 노출 여부 |
| 개인 achievement | assurance와 application 각 단계 | 실제 사용자의 canonical evidence에서 파생 |

경로의 golden readiness는 retrieval task 정의, reference solution, mutant, valid alternative, 가상 시계 queue와 synthetic archive projection으로 판정한다. 실제 사용자의 due 수행은 개인의 `시간 뒤 다시 해냄`에만 영향을 준다. E0~E3와 `effectVerified`는 별도 효과 근거 축이며 machine golden과 기본 노출을 막지 않는다.

처음에는 새 `reportAutomationFoundation` 하나만 golden이다. 현재 featured 6개는 candidate로 강등하고, 나머지 catalog는 기존 감사 결과를 이용해 기본 `reference` 또는 `unavailable`로 표시한다. 이 initiative는 472개를 다시 저작하거나 두 번째 경로를 승격하지 않고, 다음 경로가 재사용할 machine promotion gate까지만 만든다.

## 성공 지표

### 제품 내부에서 즉시 판정 가능한 게이트

- golden claim의 TaskFamily 연결 누락 0
- assurance checkpoint에 닿지 않는 필수 outcome 0
- claim별 subcheck에 귀속되지 않는 실패 0
- required family 일부만 통과한 claim의 전체 stage 승격 0
- family별 mixed state를 단일 최고 stage로 표시하는 경우 0
- reference solution 실패 0
- curated required mutant의 false accept 0
- curated valid alternative의 false reject 0
- unchanged starter와 cosmetic-only credit 0
- weak, prose-only, self-report, manual toggle의 stage 영향 0
- Python과 TypeScript projection 불일치 0
- 지원 runtime의 판정 불일치 0
- overdue retrieval 응시 자격 상실 0
- 같은 variant replay credit 0
- support exposure를 누락한 같은 variant의 assurance credit 0
- reveal 뒤 같은 variant의 assurance credit 0
- incompatible claim, family, check version의 현재 stage 승격 0
- archive export와 import 뒤 receipt, artifact, lineage 손실 0
- canonical proof 없는 학습 적용 claim 0
- golden이 아닌 경로의 featured 노출 0
- 필수 gate의 외부 네트워크 또는 provider 의존 0

### 사용자 사건에서 읽되 구현 종료를 막지 않는 신호

- 첫 의미 있는 편집부터 수업 정답 없는 통과까지의 시도 수
- acquisition에서 transfer로 갈 때의 하락
- transfer에서 시간 뒤 재수행으로 갈 때의 lapse
- task class가 진행될수록 줄어드는 scaffold 의존
- 같은 misconception의 반복과 회복
- 결과물 열기, 다시 실행, 자동화 전환
- checker false accept와 false reject 신고의 재현율

사용자 표본이 없을 때 임의 합격률을 연구 사실처럼 정하지 않는다. 이벤트 정의, 재현성, 개인정보 없는 local-first 집계까지만 기계 검증한다.

## 구현 순서

순서를 바꾸지 않는다. 앞 단계의 authority와 계약이 닫히기 전에 콘텐츠나 화면을 넓히면 다시 두 개의 성취 시스템이 생긴다.

| 순서 | workstream | 핵심 산출 | 다음 단계 진입 조건 |
| ---: | --- | --- | --- |
| 0 | [증거 권한과 정책 수렴](00-evidence-authority/README.md) | backward-compatible event reader, MasteryPolicy v2, 실패와 지원 기록, canonical projection, legacy stage writer 격리 | 동일 event archive에서 Python과 TypeScript가 같은 stage를 내고 일반 Harvest가 legacy state를 읽지 않음 |
| 1 | [능력과 TaskFamily 계약](01-capability-task-family/README.md) | DomainDef claim, 세 역할 분리, explicit taskFamilyId, checker discrimination harness | golden 후보의 모든 claim, outcome, case가 닫힌 계약 그래프를 가짐 |
| 2 | [첫 golden 자동화 경로](02-golden-automation-path/README.md) | 한 family 수직 slice 뒤 네 task class, faded support, transfer, overdue retrieval, 실제 보고서 | `reportAutomationFoundation`이 machine golden 계약을 통과하고 Local proof와 Web false-credit 0이 확인됨 |
| 3 | [작업 증명과 적용 표면](03-work-proof-surface/README.md) | assurance와 application 2축, receipt, artifact opener, automation lineage | 화면의 모든 상태가 canonical event로 재생되고 일반 task 생성과 학습 적용 증명이 분리됨 |
| 4 | [catalog 재분류와 확장 통제](04-catalog-governance/README.md) | reference, candidate, golden 노출, false featured 제거, path-by-path promotion | golden 한 개만 기본 노출되고 다음 경로가 같은 gate를 재사용할 수 있음 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 1,402개 variant를 곧바로 삭제해 호환성이 깨짐 | legacy reader를 유지하고 golden path부터 TaskFamily로 승격한다. catalog legacy variant는 projection-only로 읽다가 경로별로 이동한다. |
| 큰 checkpoint가 여러 능력을 한 번에 숙달 처리함 | outcome별 evidence slice와 실패 귀속이 없는 통합 checker는 assurance를 만들지 못하게 한다. |
| 유사한 fixture 세 개가 전이처럼 보임 | surface context, 데이터 분포, 요구 조건이 바뀌었는지 fingerprint와 mutation harness로 검사한다. |
| 자동 채점이 correctness만 보고 품질까지 주장함 | inference boundary를 receipt에 노출하고 품질 outcome이 있을 때만 정적 품질 check를 추가한다. |
| 지연 과제가 사용자를 벌줌 | minimum만 eligibility로 쓰고 overdue는 계속 열어 둔 채 실제 지연 시간을 기록한다. |
| provider가 credit을 부풀림 | `CreditGranted` writer allowlist와 external-free replay test를 둔다. |
| catalog가 여전히 동급 과정처럼 보임 | 홈 기본 진입과 featured 권한을 golden에만 준다. |
| 인간 학습 효과를 기계 테스트로 과장함 | `machineVerified`와 `effectVerified` vocabulary를 계약과 문구 gate에서 분리한다. |

## 비목표

- CS50, Helsinki, Software Carpentry, PRIMM, 백준의 전체 과정 복제
- 472개 레슨 전부에 strong assurance lifecycle 부여
- Predict 카드 재도입
- 초보자 핵심 흐름에 빈 프로젝트 제공
- XP, streak, page view, self-rating을 mastery로 사용
- LLM을 최종 채점자나 credit writer로 사용
- 한 fixture 통과로 일반 코딩 능력, 가독성, 유지보수성을 함께 주장
- 7일, 14일, variant 3개를 검증된 보편 상수로 표현
- 사람 근거 없이 학습 효과의 인과 검증 claim 사용
- 첫 golden path 전에 인터뷰 알고리즘 트랙 확장

## 근거 자료

- [How People Learn II의 평가와 피드백](https://www.nationalacademies.org/read/24783/chapter/9): 명확한 학습 목표와 과업 중심 피드백을 assessment 설계에 연결한다.
- [Evidence-Centered Design의 CS 평가 적용](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.695376/full): claim, evidence, task를 맞추는 장기 계약의 근거다.
- [프로그래밍 subgoal worked example 연구](https://link.springer.com/article/10.1186/s40594-020-00222-7): 265명 준실험의 긍정 결과와 일반화 한계를 함께 반영한다.
- [4C/ID 공식 개요](https://www.4cid.org/about/): 네 설계 요소와 simple-to-complex whole task를 휴리스틱으로 사용한다.
- [EEF mastery learning 종합](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/mastery-learning): 목표 고정과 가변 지원 구조를 참고하되 evidence security가 low임을 반영한다.
- [spacing과 retention interval 연구](https://pubmed.ncbi.nlm.nih.gov/19076480/): 최적 간격이 목표 보존 기간에 따라 달라진다는 근거로 고정 최대창을 피한다.
- [Adaptive Parsons 연구](https://doi.org/10.1145/3501385.3543977): 풀이 시간 감소와 학습 향상 미검출을 함께 반영해 보조 scaffold로 제한한다.
- [Helsinki Python MOOC 2026 평가 구조](https://programming-26.mooc.fi/grading-and-exams/): exercise 외에 시험과 지원 체계가 있음을 명시하고 상호작용 벤치마크로만 쓴다.
- [CS2023](https://ieeecs-media.computer.org/media/education/reports/CS2023.pdf): 학부 전체 범위를 복제하지 않고 포함과 제외 vocabulary 감사에만 쓴다.
- [HackerRank 2025 개발자 설문](https://www.hackerrank.com/reports/developer-skills-report-2025): 실제 업무와 평가의 괴리에 관한 업체 설문 신호다.
- [CoderPad 2026 기술 채용 설문](https://coderpad.io/survey-reports/coderpad-state-of-tech-hiring-2026/): 알고리즘 평가가 남아 있으면서 업무형 평가가 커지는 업체 설문 신호다.

## 목표

기존 taxonomy, strong check, LearningEvent, MasteryPolicy를 단일 능력 증명 흐름으로 묶는다. 첫 golden path에서 수업 정답 없는 수행, 새 조건의 수행, 시간 뒤 재수행, 결과물, 자동화 재실행을 제품 내부의 결정론적 증거로 보여 준다.

## 영향 파일

- `contracts/learningEvent.schema.json`
- `contracts/masteryPolicy.v1.json`
- `contracts/masteryPolicy.v2.json`
- `contracts/learning-content/**`
- `src/codaro/curriculum/**`
- `src/codaro/api/curriculumRouter.py`
- `src/codaro/api/automationRouter.py`
- `editor/src/lib/**LearningEvidence*.ts`
- `editor/src/lib/masteryPolicy.ts`
- `editor/src/components/curriculum/**`
- `curricula/python/basics/30days/**`
- `tests/curriculum/**`
- `tests/product/**`
- `tests/plan/**`
- `docs/skills/architecture/learning-experience.md`
- `docs/skills/architecture/curriculum-os.md`
- `docs/skills/ops/product/learning-efficacy-operations.md`

하위 workstream이 파일과 심볼의 정확한 변경 단위를 소유한다.

## 영향 함수·심볼

- `buildCanonicalStrongCheckEvents`
- `creditMode`
- `MasteryPolicy.reduce`
- `MasteryPolicy.advance`와 `MasteryPolicy._advance`
- `dueAssessmentSectionIds`
- `computeMastery`
- `HarvestCodeRequest`
- `apiHarvestCode`
- `OutcomeDef`
- `DomainDef`
- `CurriculumHome`
- `curriculumSectionRenderer`

새 심볼은 `TaskFamily`, `CapabilityProjection`, artifact 보존소와 proof receipt projector가 될 수 있다. 이름은 구현 전에 기존 owner와 충돌하지 않는지 다시 확인한다.

## 테스트

각 leaf가 지정한 단위 테스트와 gate를 먼저 실행한다. initiative 수준에서는 다음을 모두 요구한다.

```powershell
uv run python -X utf8 tests/run.py gate learning-evidence-contract
uv run python -X utf8 tests/run.py gate curriculum-weakness-audit
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

시간 때문에 큰 gate를 생략하거나 timeout을 통과로 기록하지 않는다. 환경 문제면 실패 이유와 재현 명령을 남기고 해당 leaf를 유지한다.

## 롤백

1. v1 event와 policy reader는 v2 projection parity가 확인될 때까지 유지한다.
2. 새 writer를 되돌려도 새 optional identity와 `AttemptObserved` bundle을 읽는 호환 reader는 되돌리지 않는다.
3. UI projection은 raw canonical archive에서 재생 가능하므로 별도 사용자 상태를 롤백 대상으로 만들지 않는다.
4. publication state 변경은 콘텐츠 삭제가 아니라 노출 변경으로 되돌린다.
5. 일반 자동화 생성 경로는 학습 proof gate와 분리해 학습 기능 롤백이 자동화 기능을 막지 않게 한다.

## 평가

평가는 외부 심사자가 아니라 versioned contract, 고정 fixture, mutation corpus, valid alternative corpus, 가상 시계, Python과 TypeScript parity, archive replay, browser flow가 수행한다. 모든 기술 게이트가 통과해도 인간 학습 효과의 인과 검증을 주장하지 않는다.
