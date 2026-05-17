# Python 30일 완성

이 폴더는 Codaro의 학습 철학을 독립 노트북 과정으로 먼저 배포하기 위한 공간입니다. 레포 규칙 때문에 실제 폴더명은 `python30DaysComplete`를 사용하지만, 과정명은 “Python 30일 완성”입니다.

Codaro는 장기적으로 교육용 지능형 GUI 프로그램으로 진화하는 중입니다. 다만 그 GUI와 에이전트 기능이 완성되기 전에도 학습자가 바로 사용할 수 있어야 하므로, 먼저 ai 없이도 동작하는 커리큘럼 노트북을 Colab과 marimo 두 형식으로 배포합니다.

현재 버전은 v4입니다. 단순한 문법 목록이 아니라 준비 질문, 오늘 배울 범위, 한 줄씩 보기, 떠올리기, 코드가 실행되는 순서, 예측, 값 바꾸기, 오류 고쳐보기, 틀린 이유 적기, 비슷한 문제 풀기, 자동 확인, 작은 만들기, 추가 문제은행, 30일 프로젝트, 5일 단위 리뷰 시험이 함께 들어간 공개용 워크북입니다.

## 바로가기

[![Course Guide](https://img.shields.io/badge/Course_Guide-open-2563eb)](courseGuide.md)
[![Open Day 01 in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb)
[![Open Day 01 in molab](https://img.shields.io/badge/Day_01-open_in_molab-ff5a5f)](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day01Helloworld.py)
[![Progress Tracker](https://img.shields.io/badge/Progress_Tracker-csv-16a34a)](progressTracker.csv)

처음 시작한다면 Day 01을 Colab에서 열어 위에서 아래로 실행하세요. marimo로 학습하려면 molab 링크로 바로 열거나, 이 저장소를 받은 뒤 `uvx --from marimo marimo edit notebooks/python30DaysComplete/marimo/day01Helloworld.py`로 시작할 수 있습니다.

## 목표

- 순수 파이썬 문법을 30일 동안 단계적으로 학습합니다.
- 같은 커리큘럼을 `colab/`의 `.ipynb`와 `marimo/`의 네이티브 marimo 앱 `.py`로 함께 제공합니다.
- 각 Day는 설명, 실행 예제, 예측 문제, 값 바꿔보기, 오류 고쳐보기, 틀린 이유 적기, 비슷한 문제 풀기, 자동 확인, 작은 만들기, 30일 프로젝트, 추가 문제은행으로 구성됩니다.
- 5일마다 리뷰 노트북이 있어 누적 개념을 한 번에 회수합니다.
- Colab에서 노트북 하나를 열고 위에서 아래로 실행하면서 학습할 수 있습니다.
- 배포된 기본 셀은 위에서 아래로 실행됩니다. 연습할 때는 값을 직접 바꿔 보며 결과를 확인합니다.

## 추천 학습 방식

1. 하루에 노트북 하나만 끝냅니다.
2. 예측 문제는 실행 전에 반드시 결과를 먼저 적습니다.
3. 값 바꿔보기 셀은 먼저 실행하고, 그다음 값 하나를 바꿔 다시 실행합니다.
4. 오류 고쳐보기 셀은 어떤 부분이 고쳐졌는지 한 문장으로 적습니다.
5. 비슷한 문제 풀기 셀은 값과 변수명을 바꿔 한 번 더 실행합니다.
6. 자동 확인에서 모든 항목이 통과해야 합니다.
7. 작은 만들기는 변수명과 데이터를 바꿔 자기 예제로 한 번 더 실행합니다.
8. 마무리 체크 셀의 모든 항목이 `True`가 되어야 다음 Day로 넘어갑니다.

## 파일 구성

- `colab/`: 30일치 Colab `.ipynb` 노트북과 5일 단위 리뷰 노트북
- `marimo/`: 같은 과정을 `import marimo`, `app = marimo.App(...)`, `@app.cell` 구조로 만든 네이티브 marimo 노트북
- `courseGuide.md`: 커리큘럼 맵, 학습 방법론, 루브릭, 운영 가이드, 최종 프로젝트 명세
- `progressTracker.csv`: 학습 진행 체크용 표
- `manifest.json`: 노트북 목록과 메타데이터
- `tools/createNotebooks.py`: 노트북과 문서를 다시 생성하는 스크립트
- `tools/validateCourse.py`: 공개 배포 전 구조/문법/안전 실행 검증 스크립트

## Day 목록

| Day | 제목 | 초점 | Colab | marimo |
|---:|---|---|---|---|
| 01 | Hello World와 실행 감각 | 코드를 셀 단위로 실행하고 결과를 관찰하는 기본 습관을 만든다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day01Helloworld.py) |
| 02 | 변수와 데이터 타입 | 값에 이름을 붙이고 타입을 확인하는 법을 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day02Variablestypes.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day02Variablestypes.py) |
| 03 | 연산자 | 산술, 비교, 논리 연산자를 조합해 조건을 표현한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day03Operators.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day03Operators.py) |
| 04 | 문자열 기초 | 문자열을 만들고 합치고 포맷팅하는 기본기를 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day04Stringbasics.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day04Stringbasics.py) |
| 05 | 문자열 인덱싱과 슬라이싱 | 문자열에서 특정 위치나 범위를 꺼내는 법을 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day05Stringindexingslicing.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day05Stringindexingslicing.py) |
| 06 | 문자열 메서드 | 문자열을 정리하고 나누고 바꾸는 대표 메서드를 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day06Stringmethods.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day06Stringmethods.py) |
| 07 | 리스트 기초 | 여러 값을 순서대로 담는 리스트를 만들고 읽고 바꾼다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day07Listbasics.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day07Listbasics.py) |
| 08 | 리스트 메서드 | 리스트에 값을 추가, 삭제, 정렬, 복사하는 메서드를 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day08Listmethods.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day08Listmethods.py) |
| 09 | 튜플 | 바뀌면 안 되는 순서형 데이터를 튜플로 표현한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day09Tuples.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day09Tuples.py) |
| 10 | 집합 | 중복 제거와 집합 연산으로 데이터를 비교한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day10Sets.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day10Sets.py) |
| 11 | 딕셔너리 기초 | 키와 값으로 구조화된 데이터를 표현한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day11Dictbasics.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day11Dictbasics.py) |
| 12 | 딕셔너리 메서드 | 딕셔너리를 안전하게 읽고 순회하고 갱신한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day12Dictmethods.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day12Dictmethods.py) |
| 13 | 조건문 | 상황에 따라 다른 코드를 실행하는 흐름을 만든다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day13Conditionals.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day13Conditionals.py) |
| 14 | 반복문 | 여러 데이터에 같은 작업을 반복 적용한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day14Loops.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day14Loops.py) |
| 15 | 함수 기초 | 반복되는 로직에 이름을 붙이고 재사용한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day15Functionbasics.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day15Functionbasics.py) |
| 16 | 함수 고급 | 기본값, 키워드 인자, 가변 인자, 람다를 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day16Functionadvanced.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day16Functionadvanced.py) |
| 17 | 스코프와 클로저 | 변수가 보이는 범위와 상태를 기억하는 함수를 이해한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day17Scopeclosure.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day17Scopeclosure.py) |
| 18 | 모듈과 import | 표준 라이브러리를 가져와 프로그램의 기능을 확장한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day18Modulesimport.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day18Modulesimport.py) |
| 19 | 파일 입출력 | 텍스트 파일을 만들고 읽고 안전하게 닫는 패턴을 익힌다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day19Fileio.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day19Fileio.py) |
| 20 | 예외 처리 | 실패 가능성을 예상하고 사용자에게 안전한 흐름을 제공한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day20Exceptionhandling.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day20Exceptionhandling.py) |
| 21 | 중간 종합 복습 | 자료구조, 조건문, 반복문, 함수, 파일, 예외를 하나의 흐름으로 묶는다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day21Midreview.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day21Midreview.py) |
| 22 | 클래스 기초 | 데이터와 동작을 함께 묶는 클래스를 만든다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day22Classbasics.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day22Classbasics.py) |
| 23 | 클래스 고급 | 상속과 오버라이드로 공통 동작을 확장한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day23Classadvanced.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day23Classadvanced.py) |
| 24 | 특수 메서드 | 객체가 파이썬 문법과 자연스럽게 어울리게 만든다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day24Specialmethods.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day24Specialmethods.py) |
| 25 | 프로퍼티와 데코레이터 | 속성처럼 보이지만 검증과 계산을 포함하는 인터페이스를 만든다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day25Propertydecorator.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day25Propertydecorator.py) |
| 26 | 컴프리헨션 | 반복과 조건을 짧고 읽기 쉬운 데이터 변환식으로 쓴다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day26Comprehensions.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day26Comprehensions.py) |
| 27 | 제너레이터와 이터레이터 | 필요할 때 하나씩 값을 만들어 메모리를 아끼는 흐름을 이해한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day27Generatorsiterators.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day27Generatorsiterators.py) |
| 28 | 고급 문법 종합 | 컨텍스트 매니저와 지금까지의 고급 문법을 연결한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day28Advancedsyntaxreview.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day28Advancedsyntaxreview.py) |
| 29 | 알고리즘 연습 | 문제를 작게 나누고 자료구조를 선택해 해결한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day29Algorithmpractice.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day29Algorithmpractice.py) |
| 30 | 최종 프로젝트 | 30일 동안 배운 문법으로 작은 학습 리포트 프로그램을 완성한다. | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day30Finalproject.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/day30Finalproject.py) |

## 리뷰 노트북

| 범위 | 목적 | Colab | marimo |
|---|---|---|---|
| Day 01-05 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay01To05.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay01To05.py) |
| Day 06-10 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay06To10.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay06To10.py) |
| Day 11-15 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay11To15.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay11To15.py) |
| Day 16-20 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay16To20.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay16To20.py) |
| Day 21-25 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay21To25.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay21To25.py) |
| Day 26-30 | 5일 누적 리뷰와 시험형 과제 | [Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/reviewDay26To30.ipynb) | [molab 열기](https://molab.marimo.io/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/marimo/reviewDay26To30.py) |
