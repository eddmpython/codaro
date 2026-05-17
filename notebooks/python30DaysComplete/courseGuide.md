# Python 30일 완성 코스 가이드

이 문서는 커리큘럼 맵, 학습 방법론, 품질 루브릭, 운영 가이드, 최종 프로젝트 명세를 하나로 합친 배포용 기준 문서입니다. 학습자가 볼 문서는 `readme.md`와 이 파일만으로 충분해야 합니다.

## 과정의 위치

Codaro는 교육용 지능형 GUI 프로그램으로 진화하는 중입니다. 이 과정은 그 전에 먼저 배포하는 독립 학습 노트북입니다. 학습자는 별도 도우미 없이도 Colab 또는 marimo에서 순수 파이썬을 30일 동안 단계적으로 익힐 수 있어야 합니다.

## 학습 설계

각 Day는 같은 리듬을 유지합니다.

1. 오늘의 초점과 완성 기준을 확인한다.
2. 왜 배우는지, 어떤 생각 모델로 접근할지 읽는다.
3. 진단 질문과 시작 전 회상으로 이전 기억을 꺼낸다.
4. 실행 추적과 라인별 해설로 코드의 상태 변화를 본다.
5. 예측 문제를 먼저 풀고 실행으로 검증한다.
6. 빈칸 채우기, 버그 수정, 오답 노트를 통해 실패를 고친다.
7. 전이 연습과 자동 체크포인트로 실제 이해를 확인한다.
8. 미니 프로젝트, 누적 프로젝트, 추가 문제은행으로 자기 예제로 확장한다.

## 방법론

- R3 루프: Recall, Run, Repair를 매일 반복한다.
- 실행 전 예측: 결과를 먼저 적은 뒤 실행한다.
- 작은 입력 검증: 새 문법은 작은 데이터로 먼저 검증한다.
- 오류 읽기: 에러 이름, 줄 위치, 원인을 분리해서 기록한다.
- 전이 사다리: 예제와 다른 데이터, 다른 변수명, 다른 맥락으로 다시 푼다.
- 5일 회수: 5일마다 리뷰 노트북으로 단기 기억을 다시 꺼낸다.

## 파일 형식 기준

- `colab/` 노트북은 순차 실행 상태를 그대로 사용하는 `.ipynb` 워크북입니다.
- `marimo/` 노트북은 `import marimo`, `app = marimo.App(...)`, `@app.cell` 구조의 네이티브 `.py` 앱입니다.
- marimo 코드 셀은 중복 변수 오류를 피하면서 Colab식 순차 실습 흐름을 유지하기 위해 공유 학습 상태에서 실행됩니다.
- 일부 셀은 의도적으로 실패합니다. 실패 셀은 삭제하지 않고 원인을 설명한 뒤 고치는 것이 학습 목표입니다.

## 품질 루브릭

Day별 통과 기준은 아래 6개입니다.

- 예측: 실행 전에 결과를 먼저 썼다.
- 구현: 빈칸 문제의 `assert`가 통과했다.
- 디버깅: 버그 수정 문제의 에러 이름과 원인을 설명했다.
- 전이: 같은 개념을 다른 맥락의 전이 연습에서 다시 사용했다.
- 검증: 자동 체크포인트의 모든 항목이 통과했다.
- 변형: 미니 프로젝트 또는 누적 프로젝트를 자기 데이터로 바꿨다.

## 마일스톤

| Day | 이름 | 통과 기준 |
|---:|---|---|
| Day 05 | 문자열과 값 다루기 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |
| Day 10 | 순서형/집합형 자료구조 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |
| Day 15 | 조건, 반복, 함수 기초 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |
| Day 20 | 모듈, 파일, 예외 처리 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |
| Day 25 | 객체지향 기본 설계 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |
| Day 30 | 최종 프로젝트 완성 점검 | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |

## 리뷰 노트북

| 범위 | Colab | marimo |
|---|---|---|
| Day 01-05 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay01To05.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay01To05.py) |
| Day 06-10 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay06To10.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay06To10.py) |
| Day 11-15 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay11To15.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay11To15.py) |
| Day 16-20 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay16To20.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay16To20.py) |
| Day 21-25 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay21To25.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay21To25.py) |
| Day 26-30 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay26To30.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay26To30.py) |

## 운영 가이드

- 하루에 노트북 하나만 끝내는 것을 기본 속도로 둔다.
- 처음 틀린 답에는 바로 정답을 보지 않고 어떤 값과 타입을 기대했는지 먼저 적는다.
- 체크포인트 실패는 되돌아갈 위치를 알려주는 신호로 본다.
- 마일스톤 Day에는 새 진도보다 이전 개념을 연결하는지 확인한다.
- 리뷰 노트북은 반드시 새 데이터로 다시 풀어야 한다.

## 최종 프로젝트

Day 30의 최종 산출물은 30일 학습 리포트 프로그램입니다.

필수 기능:

- 학습 기록을 표현하는 클래스 또는 딕셔너리 구조
- 완료한 Day 수와 완료율 계산
- 총 학습 시간과 완료한 학습 시간 계산
- 미완료 주제 목록 생성
- JSON 파일 저장과 다시 읽기
- 잘못된 입력에 대한 예외 처리 또는 검증 함수

우수 기준:

- 함수가 3개 이상으로 분리되어 있다.
- 변수명만 읽어도 데이터 의미가 드러난다.
- `assert` 또는 자동 체크 코드로 핵심 결과를 검증한다.
- 최종 JSON 파일을 다시 읽어 저장 결과를 확인한다.
- 다음 학습 주제를 추천하는 간단한 규칙이 있다.

## 공개 전 체크

- `tools/createNotebooks.py`로 전체 파일을 재생성할 수 있다.
- `tools/validateCourse.py`가 통과한다.
- Day 노트북 30개와 리뷰 노트북 6개가 Colab과 marimo 양쪽에 존재한다.
- marimo 파일은 percent marker가 아니라 `@app.cell` 구조를 가진다.
- 루트 문서는 `readme.md`, `courseGuide.md`, `manifest.json`, `progressTracker.csv`로 좁힌다.

## Day별 지도


## Day 01. Hello World와 실행 감각

- 초점: 코드를 셀 단위로 실행하고 결과를 관찰하는 기본 습관을 만든다.
- 완성 기준: 문자열, 숫자, 간단한 표현식을 실행하고 결과가 어디에 나타나는지 설명할 수 있다.
- 핵심 개념: 코드 셀 실행, 문자열 리터럴, 숫자 표현식, 결과 관찰
- 산출물: 오늘의 작은 결과물은 자기소개 한 줄입니다. 이름, 오늘 배운 것, 내일 목표를 각각 변수에 담고 하나의 문장으로 합치세요.
- 변형: 문장의 마침표를 느낌표로 바꾸고 다시 실행해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day01Helloworld.py)

## Day 02. 변수와 데이터 타입

- 초점: 값에 이름을 붙이고 타입을 확인하는 법을 익힌다.
- 완성 기준: int, float, str, bool 값을 구분하고 `type()`과 `len()`으로 기본 정보를 확인할 수 있다.
- 핵심 개념: 변수 대입, 정수와 실수, 문자열, 불리언, 타입 확인
- 산출물: 간단한 영수증 데이터를 변수로 만들고, 최종 결제 금액을 계산하세요.
- 변형: `payment`가 10000 이상인지 `isBigOrder` 변수에 저장해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day02Variablestypes.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day02Variablestypes.py)

## Day 03. 연산자

- 초점: 산술, 비교, 논리 연산자를 조합해 조건을 표현한다.
- 완성 기준: 계산 결과뿐 아니라 `True`/`False`로 나오는 판단식을 만들 수 있다.
- 핵심 개념: 산술 연산, 나머지, 비교 연산, 논리 연산, 멤버십 연산
- 산출물: 간단한 입장 조건을 만드세요. 나이가 13 이상이고 티켓을 가진 사람만 입장할 수 있습니다.
- 변형: 나이가 65 이상이면 티켓이 없어도 입장 가능하도록 조건을 확장해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day03Operators.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day03Operators.py)

## Day 04. 문자열 기초

- 초점: 문자열을 만들고 합치고 포맷팅하는 기본기를 익힌다.
- 완성 기준: f-string으로 읽기 쉬운 문장을 만들고 특수 문자를 다룰 수 있다.
- 핵심 개념: 문자열 연결, f-string, 이스케이프, 여러 줄 문자열, 포함 여부
- 산출물: 짧은 주문 확인 문장을 만드세요. 메뉴명, 수량, 결제 금액이 모두 들어가야 합니다.
- 변형: 문장 안에 줄바꿈 `\n`을 넣어 영수증처럼 두 줄로 출력해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day04Stringbasics.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day04Stringbasics.py)

## Day 05. 문자열 인덱싱과 슬라이싱

- 초점: 문자열에서 특정 위치나 범위를 꺼내는 법을 익힌다.
- 완성 기준: 양수/음수 인덱스와 슬라이스 범위를 사용해 필요한 글자만 가져올 수 있다.
- 핵심 개념: 0번 인덱스, 음수 인덱스, 범위 슬라이싱, 간격 슬라이싱, 끝 미포함 규칙
- 산출물: 주민번호처럼 생긴 예시 문자열에서 생년월일 부분과 뒤 첫 숫자를 분리하세요. 실제 개인정보를 사용하지 마세요.
- 변형: `sampleId`에서 하이픈을 기준으로 앞부분과 뒷부분을 각각 슬라이스해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day05Stringindexingslicing.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day05Stringindexingslicing.py)

## Day 06. 문자열 메서드

- 초점: 문자열을 정리하고 나누고 바꾸는 대표 메서드를 익힌다.
- 완성 기준: `strip`, `lower`, `split`, `join`, `replace`, `find`, `count`를 실제 텍스트 정리에 사용할 수 있다.
- 핵심 개념: 공백 제거, 대소문자 변환, 분리, 결합, 치환, 검색
- 산출물: 사용자가 입력한 문장처럼 보이는 텍스트를 정리해 검색 키워드로 바꾸세요.
- 변형: `keyword.count('-')`로 단어 사이 구분자가 몇 개인지 확인해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day06Stringmethods.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day06Stringmethods.py)

## Day 07. 리스트 기초

- 초점: 여러 값을 순서대로 담는 리스트를 만들고 읽고 바꾼다.
- 완성 기준: 리스트 생성, 인덱싱, 슬라이싱, 값 변경을 사용할 수 있다.
- 핵심 개념: 리스트 생성, 리스트 인덱싱, 리스트 슬라이싱, 값 변경, 길이 확인
- 산출물: 이번 주 학습 항목 리스트를 만들고, 앞의 3개 항목만 `weekStart`로 꺼내세요.
- 변형: 마지막 항목을 다른 주제로 바꾼 뒤 다시 출력해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day07Listbasics.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day07Listbasics.py)

## Day 08. 리스트 메서드

- 초점: 리스트에 값을 추가, 삭제, 정렬, 복사하는 메서드를 익힌다.
- 완성 기준: `append`, `insert`, `remove`, `pop`, `sort`, `reverse`, `copy`, `extend`를 상황에 맞게 고를 수 있다.
- 핵심 개념: 추가, 삽입, 삭제, 정렬, 복사, 확장
- 산출물: 대기열을 만들고 한 명을 앞에 추가한 뒤, 첫 번째 사람을 처리하세요.
- 변형: `copy()`를 사용해 원본 대기열과 백업 대기열을 분리해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day08Listmethods.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day08Listmethods.py)

## Day 09. 튜플

- 초점: 바뀌면 안 되는 순서형 데이터를 튜플로 표현한다.
- 완성 기준: 튜플 생성, 패킹, 언패킹, 불변성의 의미를 설명할 수 있다.
- 핵심 개념: 튜플 생성, 불변성, 패킹, 언패킹, 반환값 묶음
- 산출물: 좌표 두 개를 튜플로 만들고, x/y 차이를 계산하세요.
- 변형: 언패킹을 사용해 `startX`, `startY`, `endX`, `endY`로 바꿔 계산해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day09Tuples.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day09Tuples.py)

## Day 10. 집합

- 초점: 중복 제거와 집합 연산으로 데이터를 비교한다.
- 완성 기준: 합집합, 교집합, 차집합을 사용해 두 데이터 묶음의 관계를 찾을 수 있다.
- 핵심 개념: 중복 제거, 소속 검사, add, discard, 합집합, 교집합, 차집합
- 산출물: 이벤트 참가자와 설문 응답자의 교집합, 전체 고유 인원을 구하세요.
- 변형: 참가했지만 설문에 응답하지 않은 사람을 찾아보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day10Sets.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day10Sets.py)

## Day 11. 딕셔너리 기초

- 초점: 키와 값으로 구조화된 데이터를 표현한다.
- 완성 기준: 딕셔너리를 만들고, 키로 값을 읽고, 값을 추가하거나 수정할 수 있다.
- 핵심 개념: 키와 값, 값 읽기, 값 수정, 새 키 추가, 중첩 데이터의 시작
- 산출물: 학생 한 명의 성적표를 딕셔너리로 만들고 평균 점수를 계산하세요.
- 변형: `report`에 `passed` 키를 추가하고 평균이 80 이상인지 저장해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day11Dictbasics.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day11Dictbasics.py)

## Day 12. 딕셔너리 메서드

- 초점: 딕셔너리를 안전하게 읽고 순회하고 갱신한다.
- 완성 기준: `get`, `keys`, `values`, `items`, `update`, `pop`을 실제 데이터 정리에 사용할 수 있다.
- 핵심 개념: 안전한 읽기, 키 목록, 값 목록, 키-값 순회, 갱신, 삭제
- 산출물: 상품 가격 딕셔너리를 안전하게 읽고, 품절 상품을 제거한 뒤, 새 상품 가격을 한 번에 추가하세요.
- 변형: `pop`으로 품절 상품을 제거한 뒤 남은 딕셔너리를 확인해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day12Dictmethods.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day12Dictmethods.py)

## Day 13. 조건문

- 초점: 상황에 따라 다른 코드를 실행하는 흐름을 만든다.
- 완성 기준: `if`, `elif`, `else`로 점수, 상태, 입력값에 따른 분기 로직을 작성할 수 있다.
- 핵심 개념: if, elif, else, 중첩 조건, 조건 표현식, 블록 들여쓰기
- 산출물: 배송비 정책을 조건문으로 구현하세요. 50000원 이상은 무료, 30000원 이상은 2000원, 그 외는 3000원입니다.
- 변형: 쿠폰 보유 여부까지 반영해 최종 결제 금액을 계산해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day13Conditionals.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day13Conditionals.py)

## Day 14. 반복문

- 초점: 여러 데이터에 같은 작업을 반복 적용한다.
- 완성 기준: `for`, `while`, `range`, `break`, `continue`를 사용해 반복 흐름을 제어할 수 있다.
- 핵심 개념: for, while, range, 누적, break, continue, 중첩 반복
- 산출물: 구매 금액 리스트에서 10000원 이상인 주문만 골라 총합을 구하세요.
- 변형: `continue`를 사용해 10000원 미만 주문을 건너뛰는 형태로 바꿔보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day14Loops.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day14Loops.py)

## Day 15. 함수 기초

- 초점: 반복되는 로직에 이름을 붙이고 재사용한다.
- 완성 기준: `def`, 매개변수, 반환값을 사용해 작은 함수를 만들 수 있다.
- 핵심 개념: def, 매개변수, 인자, return, docstring, 재사용
- 산출물: 금액과 할인율을 받아 할인 후 금액을 반환하는 함수를 만드세요.
- 변형: 할인 후 금액이 0보다 작아지지 않도록 함수를 보강해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day15Functionbasics.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day15Functionbasics.py)

## Day 16. 함수 고급

- 초점: 기본값, 키워드 인자, 가변 인자, 람다를 익힌다.
- 완성 기준: 함수 호출 방식을 유연하게 설계하고 간단한 콜백 함수를 만들 수 있다.
- 핵심 개념: 기본 매개변수, 키워드 인자, *args, **kwargs, lambda
- 산출물: 금액 리스트와 할인율을 받아 할인 금액 리스트를 반환하는 함수를 만드세요.
- 변형: `lambda price: price >= 20000`를 만들어 고가 상품만 필터링해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day16Functionadvanced.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day16Functionadvanced.py)

## Day 17. 스코프와 클로저

- 초점: 변수가 보이는 범위와 상태를 기억하는 함수를 이해한다.
- 완성 기준: 지역/전역 스코프를 구분하고 클로저로 간단한 상태를 캡슐화할 수 있다.
- 핵심 개념: 지역 스코프, 전역 스코프, nonlocal, global, 클로저, 상태 캡슐화
- 산출물: 누적 합계를 기억하는 `makeAccumulator`를 만들고 여러 번 호출해보세요.
- 변형: 누적 합계가 음수가 되지 않도록 `add` 내부에 조건문을 추가해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day17Scopeclosure.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day17Scopeclosure.py)

## Day 18. 모듈과 import

- 초점: 표준 라이브러리를 가져와 프로그램의 기능을 확장한다.
- 완성 기준: `import`, `from import`, 별칭을 사용하고 `math`, `random`, `datetime` 같은 모듈을 활용할 수 있다.
- 핵심 개념: import, from import, as 별칭, 표준 라이브러리, 모듈 네임스페이스
- 산출물: 오늘 날짜와 임의의 학습 점수를 조합해 학습 기록 딕셔너리를 만드세요.
- 변형: `random.seed(7)`을 추가하면 임의 결과가 어떻게 바뀌는지 확인해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day18Modulesimport.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day18Modulesimport.py)

## Day 19. 파일 입출력

- 초점: 텍스트 파일을 만들고 읽고 안전하게 닫는 패턴을 익힌다.
- 완성 기준: `with open(...)`과 `pathlib.Path`로 작은 텍스트/JSON 파일을 다룰 수 있다.
- 핵심 개념: open, with, read, write, 파일 모드, pathlib, JSON 저장
- 산출물: 학습 기록 딕셔너리를 JSON 파일로 저장하고 다시 읽어오세요.
- 변형: `indent=2` 옵션을 넣어 JSON 파일을 사람이 읽기 좋게 저장해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day19Fileio.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day19Fileio.py)

## Day 20. 예외 처리

- 초점: 실패 가능성을 예상하고 사용자에게 안전한 흐름을 제공한다.
- 완성 기준: `try`, 구체적인 `except`, `else`, `finally`, `raise`를 상황에 맞게 사용할 수 있다.
- 핵심 개념: try, except, 구체 예외, else, finally, raise, 예외 메시지
- 산출물: 점수 문자열 리스트를 정수로 바꾸고, 잘못된 값은 `invalidValues`에 모으세요.
- 변형: 잘못된 값이 하나라도 있으면 `ValueError`를 직접 발생시키는 검증 함수를 만들어보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day20Exceptionhandling.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day20Exceptionhandling.py)

## Day 21. 중간 종합 복습

- 초점: 자료구조, 조건문, 반복문, 함수, 파일, 예외를 하나의 흐름으로 묶는다.
- 완성 기준: 작은 데이터를 입력받아 정리, 검증, 요약하는 파이프라인을 직접 구성할 수 있다.
- 핵심 개념: 데이터 파이프라인, 검증 함수, 반복 처리, 요약, 작은 설계
- 산출물: 간단한 학습 기록 목록에서 완료한 항목 수, 평균 점수, 미완료 항목을 요약하세요.
- 변형: 요약 결과를 JSON 파일로 저장하고 다시 읽어오세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day21Midreview.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day21Midreview.py)

## Day 22. 클래스 기초

- 초점: 데이터와 동작을 함께 묶는 클래스를 만든다.
- 완성 기준: `class`, `__init__`, `self`, 인스턴스 속성, 메서드를 사용할 수 있다.
- 핵심 개념: class, __init__, self, 인스턴스, 속성, 메서드
- 산출물: 할 일 하나를 표현하는 `Task` 클래스를 만들고 완료 처리 메서드를 작성하세요.
- 변형: `rename` 메서드를 추가해 제목을 바꿀 수 있게 해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day22Classbasics.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day22Classbasics.py)

## Day 23. 클래스 고급

- 초점: 상속과 오버라이드로 공통 동작을 확장한다.
- 완성 기준: 부모 클래스의 기능을 재사용하고 `super()`로 초기화를 확장할 수 있다.
- 핵심 개념: 상속, super, 오버라이드, 다형성, 상속보다 합성 판단
- 산출물: 알림 기본 클래스와 이메일/문자 알림 클래스를 만들고 같은 `send` 메서드 이름으로 다르게 동작하게 하세요.
- 변형: 새로운 `PushNotification` 클래스를 추가해 같은 리스트에서 동작하게 해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day23Classadvanced.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day23Classadvanced.py)

## Day 24. 특수 메서드

- 초점: 객체가 파이썬 문법과 자연스럽게 어울리게 만든다.
- 완성 기준: `__str__`, `__repr__`, `__len__`, `__eq__`, `__add__`, `__getitem__`의 역할을 이해한다.
- 핵심 개념: __str__, __repr__, __len__, __eq__, __add__, __getitem__
- 산출물: 장바구니 클래스를 만들고 `len(cart)`, `cart[0]`, `str(cart)`가 동작하게 하세요.
- 변형: `__add__`를 추가해 장바구니끼리 합칠 수 있게 해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day24Specialmethods.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day24Specialmethods.py)

## Day 25. 프로퍼티와 데코레이터

- 초점: 속성처럼 보이지만 검증과 계산을 포함하는 인터페이스를 만든다.
- 완성 기준: `@property`, setter, `@staticmethod`, `@classmethod`, 기본 데코레이터 구조를 이해한다.
- 핵심 개념: @property, setter, staticmethod, classmethod, 함수 데코레이터
- 산출물: 상품 클래스에 할인 가격 프로퍼티와 문자열에서 상품을 만드는 클래스 메서드를 추가하세요.
- 변형: `@staticmethod`으로 가격이 양수인지 검사하는 함수를 추가해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day25Propertydecorator.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day25Propertydecorator.py)

## Day 26. 컴프리헨션

- 초점: 반복과 조건을 짧고 읽기 쉬운 데이터 변환식으로 쓴다.
- 완성 기준: 리스트, 딕셔너리, 집합 컴프리헨션을 사용해 데이터를 변환하고 필터링할 수 있다.
- 핵심 개념: 리스트 컴프리헨션, 조건 필터, 딕셔너리 컴프리헨션, 집합 컴프리헨션, 중첩 컴프리헨션
- 산출물: 주문 목록에서 결제 완료된 주문만 골라 상품명과 할인 금액 딕셔너리를 만드세요.
- 변형: 같은 로직을 일반 for문으로 다시 작성해 가독성을 비교해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day26Comprehensions.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day26Comprehensions.py)

## Day 27. 제너레이터와 이터레이터

- 초점: 필요할 때 하나씩 값을 만들어 메모리를 아끼는 흐름을 이해한다.
- 완성 기준: `yield`, `iter`, `next`, 이터레이터 프로토콜을 사용해 지연 계산을 설명할 수 있다.
- 핵심 개념: yield, 제너레이터, next, iter, 이터레이터 프로토콜, 지연 평가
- 산출물: 로그 문자열 리스트에서 `ERROR`가 들어간 줄만 하나씩 내보내는 제너레이터를 만드세요.
- 변형: `next`와 `try/except StopIteration`으로 직접 하나씩 꺼내보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day27Generatorsiterators.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day27Generatorsiterators.py)

## Day 28. 고급 문법 종합

- 초점: 컨텍스트 매니저와 지금까지의 고급 문법을 연결한다.
- 완성 기준: `with` 문이 자원 획득과 정리를 어떻게 보장하는지 이해하고 직접 구현할 수 있다.
- 핵심 개념: with 문, __enter__, __exit__, contextlib, 정리 보장, 고급 문법 연결
- 산출물: 임시 설정을 켰다가 블록이 끝나면 원래 값으로 되돌리는 컨텍스트 매니저를 만드세요.
- 변형: 블록 안에서 예외가 발생해도 `outside`가 복구되는지 실험해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day28Advancedsyntaxreview.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day28Advancedsyntaxreview.py)

## Day 29. 알고리즘 연습

- 초점: 문제를 작게 나누고 자료구조를 선택해 해결한다.
- 완성 기준: 정렬, 탐색, 빈도 계산, 재귀의 기본 패턴을 문제에 적용할 수 있다.
- 핵심 개념: 문제 분석, 정렬, 선형 탐색, 딕셔너리 빈도, 재귀, 복잡도 감각
- 산출물: 주문 금액 리스트에서 기준 금액 이상인 주문의 개수와 총액을 반환하는 함수를 만드세요.
- 변형: 같은 함수를 컴프리헨션과 `sum`으로 다시 작성해보세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day29Algorithmpractice.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day29Algorithmpractice.py)

## Day 30. 최종 프로젝트

- 초점: 30일 동안 배운 문법으로 작은 학습 리포트 프로그램을 완성한다.
- 완성 기준: 데이터 구조 설계, 함수 분리, 클래스, 예외 처리, 파일 저장을 포함한 하나의 프로그램을 만들 수 있다.
- 핵심 개념: 요구사항 분해, 데이터 모델, 함수 분리, 클래스, 파일 저장, 최종 점검
- 산출물: 최종 프로젝트: 30일 학습 기록을 요약하는 리포트 프로그램을 완성하세요. 아래 시작 코드를 확장해 JSON 저장까지 수행합니다.
- 변형: 미완료 항목, 최장 학습일, 다음 복습 추천 주제를 리포트에 추가하세요.
- Colab: [바로 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day30Finalproject.ipynb)
- marimo: [molab에서 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day30Finalproject.py)
