# Python 30일 완성 코스 가이드

## 원본과 산출물

- 원본: `study/python/30days/curriculum.json` 및 Day별 YAML
- 산출물: `notebooks/python30DaysComplete/colab`, `notebooks/python30DaysComplete/marimo`
- 생성기: `notebooks/python30DaysComplete/tools/createNotebooks.py`
- 검증기: `notebooks/python30DaysComplete/tools/validateCourse.py`

노트북은 원본 커리큘럼을 복사한 별도 과정이 아니라, YAML에서 파생된 실행 형식입니다.

## 설계 기준

- Day별 학습 범위를 SSOT의 개념 라벨로 노트북 상단에 표시한다.
- 예제 코드는 원본 YAML의 `code` 블록을 그대로 사용한다.
- 연습 미션은 원본 YAML의 `expansion` 블록에서 오며, 노트북에서는 학습자가 직접 작성하도록 빈 셀로 둔다.
- 초보자에게 불필요한 채점형 장치나 숨은 예상 답변 확인 흐름을 넣지 않는다.

## Day 목록

| Day | 제목 | 원본 YAML | 오늘 쓰지 않는 개념 |
|---|---|---|---|
| 01 | 헬로월드 | `day01_헬로월드.yaml` | 변수, 함수, 리스트, 딕셔너리, import |
| 02 | 변수와 데이터 타입 | `day02_변수와데이터타입.yaml` | 리스트, 딕셔너리, 튜플, 집합, 함수, 클래스, import |
| 03 | 연산자 | `day03_연산자.yaml` | 리스트, 딕셔너리, 함수, import |
| 04 | 문자열 기초 | `day04_문자열기초.yaml` | 인덱싱, 슬라이싱, 문자열 메서드, 리스트, 함수, import |
| 05 | 문자열 인덱싱/슬라이싱 | `day05_문자열인덱싱슬라이싱.yaml` | 문자열 메서드, 리스트, 함수, import |
| 06 | 문자열 메서드 | `day06_문자열메서드.yaml` | 리스트 메서드, 함수, import |
| 07 | 리스트 기초 | `day07_리스트기초.yaml` | 리스트 메서드, 튜플, 딕셔너리, 집합, 함수, import |
| 08 | 리스트 메서드 | `day08_리스트메서드.yaml` | 튜플, 딕셔너리, 집합, 함수, import |
| 09 | 튜플 | `day09_튜플.yaml` | 딕셔너리, 집합, 함수, import |
| 10 | 집합 | `day10_집합.yaml` | 딕셔너리, 함수, import |
| 11 | 딕셔너리 기초 | `day11_딕셔너리기초.yaml` | 딕셔너리 메서드, 함수, import |
| 12 | 딕셔너리 메서드 | `day12_딕셔너리메서드.yaml` | 함수, import |
| 13 | 조건문 | `day13_조건문.yaml` | 함수, 반복문, import |
| 14 | 반복문 | `day14_반복문.yaml` | 함수, import |
| 15 | 함수 기초 | `day15_함수기초.yaml` | 고급 함수 문법, import, 클래스 |
| 16 | 함수 고급 | `day16_함수고급.yaml` | import, 클래스, 데코레이터 |
| 17 | 스코프와 클로저 | `day17_스코프와클로저.yaml` | import, 클래스 |
| 18 | 모듈과 import | `day18_모듈과import.yaml` | 클래스, 외부 라이브러리 |
| 19 | 파일 입출력 | `day19_파일입출력.yaml` | 클래스, 외부 라이브러리 |
| 20 | 예외 처리 | `day20_예외처리.yaml` | 클래스, 사용자 정의 예외 |
| 21 | 중간 종합 복습 | `day21_중간종합복습.yaml` | 클래스 |
| 22 | 클래스 기초 | `day22_클래스기초.yaml` | 상속, 특수 메서드, 데코레이터 |
| 23 | 클래스 고급 | `day23_클래스고급.yaml` | 특수 메서드, 데코레이터 |
| 24 | 특수 메서드 | `day24_특수메서드.yaml` | 데코레이터, 메타클래스 |
| 25 | 프로퍼티와 데코레이터 | `day25_프로퍼티와데코레이터.yaml` | 메타클래스, 외부 라이브러리 |
| 26 | 컴프리헨션 | `day26_컴프리헨션.yaml` | 제너레이터 표현식, 외부 라이브러리 |
| 27 | 제너레이터와 이터레이터 | `day27_제너레이터와이터레이터.yaml` | 외부 라이브러리 |
| 28 | 고급 문법 종합 | `day28_고급문법종합.yaml` | 외부 라이브러리 |
| 29 | 알고리즘 연습 | `day29_알고리즘연습.yaml` | 외부 라이브러리 |
| 30 | 최종 프로젝트 | `day30_최종프로젝트.yaml` | 외부 라이브러리 |
