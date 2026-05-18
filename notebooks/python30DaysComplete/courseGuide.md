# Python 30일 완성 코스 가이드

## 원본과 산출물

- 원본: `study/python/30days/curriculum.json` 및 Day별 YAML
- 산출물: `notebooks/python30DaysComplete/colab`, `notebooks/python30DaysComplete/marimo`
- 생성기: `notebooks/python30DaysComplete/tools/createNotebooks.py`
- 검증기: `notebooks/python30DaysComplete/tools/validateCourse.py`

노트북은 원본 커리큘럼을 복사한 별도 과정이 아니라, YAML에서 파생된 실행 형식입니다.

## 설계 기준

- Day별 `allowedConcepts`, `newConcepts`, `forbidden`을 노트북 상단에 표시한다.
- 예제 코드는 원본 YAML의 `code` 블록을 그대로 사용한다.
- 연습 미션은 원본 YAML의 `expansion` 블록에서 오며, 노트북에서는 학습자가 직접 작성하도록 빈 셀로 둔다.
- 초보자에게 불필요한 채점형 장치나 숨은 예상 답변 확인 흐름을 넣지 않는다.

## Day 목록

| Day | 제목 | 원본 YAML | 오늘 쓰지 않는 개념 |
|---|---|---|---|
| 01 | 헬로월드 | `day01_헬로월드.yaml` | variable, function, list, dict, import |
| 02 | 변수와 데이터 타입 | `day02_변수와데이터타입.yaml` | list, dict, tuple, set, function, class, import |
| 03 | 연산자 | `day03_연산자.yaml` | list, dict, function, import |
| 04 | 문자열 기초 | `day04_문자열기초.yaml` | indexing, slicing, string_method, list, function, import |
| 05 | 문자열 인덱싱/슬라이싱 | `day05_문자열인덱싱슬라이싱.yaml` | string_method, list, function, import |
| 06 | 문자열 메서드 | `day06_문자열메서드.yaml` | list_method, function, import |
| 07 | 리스트 기초 | `day07_리스트기초.yaml` | list_method, tuple, dict, set, function, import |
| 08 | 리스트 메서드 | `day08_리스트메서드.yaml` | tuple, dict, set, function, import |
| 09 | 튜플 | `day09_튜플.yaml` | dict, set, function, import |
| 10 | 집합 | `day10_집합.yaml` | dict, function, import |
| 11 | 딕셔너리 기초 | `day11_딕셔너리기초.yaml` | dict_method, function, import |
| 12 | 딕셔너리 메서드 | `day12_딕셔너리메서드.yaml` | function, import |
| 13 | 조건문 | `day13_조건문.yaml` | function, loop, import |
| 14 | 반복문 | `day14_반복문.yaml` | function, import |
| 15 | 함수 기초 | `day15_함수기초.yaml` | advanced_function, import, class |
| 16 | 함수 고급 | `day16_함수고급.yaml` | import, class, decorator |
| 17 | 스코프와 클로저 | `day17_스코프와클로저.yaml` | import, class |
| 18 | 모듈과 import | `day18_모듈과import.yaml` | class, external_library |
| 19 | 파일 입출력 | `day19_파일입출력.yaml` | class, external_library |
| 20 | 예외 처리 | `day20_예외처리.yaml` | class, custom_exception |
| 21 | 중간 종합 복습 | `day21_중간종합복습.yaml` | class |
| 22 | 클래스 기초 | `day22_클래스기초.yaml` | inheritance, special_method, decorator |
| 23 | 클래스 고급 | `day23_클래스고급.yaml` | special_method, decorator |
| 24 | 특수 메서드 | `day24_특수메서드.yaml` | decorator, metaclass |
| 25 | 프로퍼티와 데코레이터 | `day25_프로퍼티와데코레이터.yaml` | metaclass, external_library |
| 26 | 컴프리헨션 | `day26_컴프리헨션.yaml` | generator_expression, external_library |
| 27 | 제너레이터와 이터레이터 | `day27_제너레이터와이터레이터.yaml` | external_library |
| 28 | 고급 문법 종합 | `day28_고급문법종합.yaml` | external_library |
| 29 | 알고리즘 연습 | `day29_알고리즘연습.yaml` | external_library |
| 30 | 최종 프로젝트 | `day30_최종프로젝트.yaml` | external_library |
