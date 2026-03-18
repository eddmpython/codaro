# 고급 파이썬 (Advanced Python) PRD

## 개요

### 실행 환경
**⚠️ Pyodide 환경** - 브라우저에서 실행되는 WebAssembly 기반 Python

### Pyodide 제한사항
| 불가능 | 대안 |
|-------|-----|
| asyncio (이벤트 루프) | 동기 코드로 대체 |
| 멀티스레딩/프로세싱 | 불가 |
| 파일 시스템 직접 접근 | 메모리 내 처리 |
| C 확장 (Cython) | 불가 |
| subprocess | 불가 |
| 외부 패키지 설치 | micropip으로 제한적 가능 |
| 네트워크 요청 | pyodide.http.pyfetch만 가능 |
| pdb 디버거 | 불가 |

### 목표
30days 카테고리가 "파이썬 기본 문법 마스터"라면, **고급 파이썬은 "순수 파이썬 고급 기법 마스터"**를 목표로 한다.

### 대상
- 30days를 완료한 학습자
- 파이썬 기본 문법을 알지만 고급 기법을 익히고 싶은 개발자
- 코딩 테스트 준비, 알고리즘 문제 해결력 향상

### 핵심 차별점
| 30days | 고급 파이썬 |
|--------|-----------|
| 기본 문법 | 심화 개념 |
| 개념 학습 | 고급 패턴 |
| 단순 예제 | 복잡한 문제 해결 |
| Day 1~30 순차 | 주제별 독립 모듈 |

---

## 콘텐츠 구조 (Pyodide 호환)

### Week 1: 함수형 프로그래밍 심화 (Day 1-5)
1. **람다와 고차 함수** - lambda, map, filter, reduce 마스터
2. **함수 데코레이터 심화** - 다중 데코레이터, 인자 있는 데코레이터
3. **클로저와 상태 관리** - 클로저 패턴, 상태 캡슐화, 메모이제이션
4. **functools 완벽 가이드** - partial, wraps, lru_cache, singledispatch
5. **itertools 마스터** - 무한 이터레이터, 조합 함수, 그룹화

### Week 2: 객체지향 심화 (Day 6-10)
6. **메타클래스** - type(), __new__, __init_subclass__, 클래스 팩토리
7. **디스크립터** - __get__, __set__, __delete__, 프로퍼티 내부 동작
8. **추상 클래스와 프로토콜** - ABC, abstractmethod, Protocol
9. **다중 상속과 MRO** - super(), 다이아몬드 문제, Mixin 패턴
10. **slots와 메모리 최적화** - __slots__, 메모리 비교

### Week 3: 타입 시스템 심화 (Day 11-15)
11. **타입 힌팅 심화** - Generic, TypeVar, Protocol, overload
12. **dataclasses 마스터** - field, __post_init__, frozen, slots
13. **collections 심화** - namedtuple, defaultdict, Counter, deque
14. **enum과 상수 관리** - Enum, IntEnum, Flag, auto()
15. **typing 고급** - Literal, Final, TypedDict, Annotated

### Week 4: 알고리즘과 자료구조 (Day 16-20)
16. **재귀와 분할정복** - 재귀 패턴, 메모이제이션, 꼬리 재귀
17. **정렬 알고리즘** - 버블, 선택, 삽입, 병합, 퀵 정렬
18. **탐색 알고리즘** - 이진 탐색, 해시 탐색, 그래프 탐색
19. **동적 프로그래밍** - DP 패턴, 상향식/하향식, 최적화
20. **자료구조 구현** - 스택, 큐, 힙, 트리, 그래프

### Week 5: 고급 패턴과 기법 (Day 21-25)
21. **디자인 패턴 1** - 싱글톤, 팩토리, 빌더, 프로토타입
22. **디자인 패턴 2** - 옵저버, 전략, 데코레이터, 상태
23. **함수형 패턴** - 파이프라인, 커링, 모나드 개념
24. **메타프로그래밍** - exec, eval, compile, ast 모듈
25. **정규표현식 고급** - 그룹, 전방탐색, 후방탐색, 치환

### Week 6: 실전과 최적화 (Day 26-30)
26. **코드 최적화** - 시간복잡도, 공간복잡도, 빅오 분석
27. **문자열 알고리즘** - 패턴 매칭, KMP, 라빈카프
28. **수학 알고리즘** - 소수, 최대공약수, 조합론, 확률
29. **클린 코드** - SOLID 원칙, 리팩토링 기법
30. **종합 문제 풀이** - 알고리즘 종합 문제

---

## 작성 규칙

### Marimo 규칙 (30days와 동일)
1. **yaml 1개 = marimo 노트북 1개**
2. **type: code 1개 = marimo 셀 1개**
3. **변수명 재할당 금지** (다른 셀에서 같은 변수명 사용 불가)
4. **상수는 최상단에서만 정의**
5. **print() 사용 금지** (마지막 표현식 자동 출력)

### Pyodide 호환 규칙
1. **asyncio 사용 금지** - async/await, 이벤트 루프 불가
2. **외부 I/O 금지** - 파일, 네트워크, subprocess 불가
3. **C 확장 금지** - Cython, numpy 일부 기능 제한
4. **순수 파이썬만** - 표준 라이브러리 위주

### 변수명 우선순위
1. 1단어 (data, result, func, cls)
2. 유사어 (info, output, handler, klass)
3. 짧은 2단어 (rawData, baseClass)
4. 숫자접미사 (data2, result2) - 최대 2개

### text 작성 규칙
- **매우 자세하게** 작성
- 개념의 why, what, how 모두 설명
- 실무에서 언제, 왜 사용하는지 명시
- 흔한 실수와 주의점 포함

---

## 파일 구조

```
pages/studyPython/content/advancedPython/
├── PRD.md
├── CURRICULUM.md
├── 01_람다와고차함수.yaml
├── 02_함수데코레이터심화.yaml
├── 03_클로저와상태관리.yaml
├── 04_functools완벽가이드.yaml
├── 05_itertools마스터.yaml
├── 06_메타클래스.yaml
├── 07_디스크립터.yaml
├── 08_추상클래스와프로토콜.yaml
├── 09_다중상속과MRO.yaml
├── 10_slots와메모리최적화.yaml
├── 11_타입힌팅심화.yaml
├── 12_dataclasses마스터.yaml
├── 13_collections심화.yaml
├── 14_enum과상수관리.yaml
├── 15_typing고급.yaml
├── 16_재귀와분할정복.yaml
├── 17_정렬알고리즘.yaml
├── 18_탐색알고리즘.yaml
├── 19_동적프로그래밍.yaml
├── 20_자료구조구현.yaml
├── 21_디자인패턴1.yaml
├── 22_디자인패턴2.yaml
├── 23_함수형패턴.yaml
├── 24_메타프로그래밍.yaml
├── 25_정규표현식고급.yaml
├── 26_코드최적화.yaml
├── 27_문자열알고리즘.yaml
├── 28_수학알고리즘.yaml
├── 29_클린코드.yaml
└── 30_종합문제풀이.yaml
```

---

## 섹션 구조

### 각 YAML 파일 구조
```yaml
meta:
  id: "01"
  title: "람다와 고차 함수"
  day: 1
  category: "advancedPython"
  tags: ['lambda', '고차함수', 'map', 'filter']
  seo:
    title: "파이썬 람다와 고차 함수 - 함수형 프로그래밍"
    description: "lambda, map, filter, reduce를 마스터합니다."
    keywords: ['lambda', 'map', 'filter', 'reduce', '함수형']

intro:
  emoji: "⚡"
  points:
  - "핵심 포인트 1"
  - "핵심 포인트 2"
  - "핵심 포인트 3"
  - "핵심 포인트 4"

sections:
- id: "concept1"
  title: "개념 제목"
  subtitle: "부제목"
  blocks:
  - type: "text"
    content: "매우 상세한 설명 (5~10문장). 왜 이 개념이 필요한지, 어떤 상황에서 사용하는지, 내부 동작 원리는 어떤지 설명합니다."
  - type: "list"
    items:
    - "핵심 포인트 1"
    - "핵심 포인트 2"
    - "핵심 포인트 3"
  - type: "code"
    language: "python"
    title: "코드 제목"
    description: "코드 설명"
    content: |-
      varName = 'value'
      varName
  - type: "tip"
    content: "실무 팁"

- id: "practice"
  title: "종합 복습"
  subtitle: "마스터하기"
  blocks:
  - type: "text"
    content: "난이도별로 복습합니다."
  - type: "expansion"
    title: "🟢 기본1: 제목"
    code: |-
      basicVar = 'value'
      basicVar
  # ... 기본 5개, 응용 5개, 심화 10개 = 총 20개
```

---

## 품질 검증

### 체크리스트
- [ ] 변수명 파일 전체에서 중복 없음
- [ ] print() 사용 0건
- [ ] asyncio, subprocess, 파일 I/O 사용 없음
- [ ] 1섹션 = 1개념
- [ ] text는 5문장 이상 상세 설명
- [ ] expansion 20개 (🟢5 + 🟡5 + 🔴10)
- [ ] YAML 문법 오류 없음
- [ ] 각 코드 블록 독립 실행 가능

---

## 카테고리 등록

`__init__.py`에 추가 필요:
```python
categoryMapping = {
    # ... 기존 항목
    'advancedPython': '고급파이썬',
}
```

---

## 성공 기준

1. **Pyodide 호환**: 모든 코드가 브라우저에서 실행 가능
2. **완전 독립**: 모든 섹션이 어떤 순서로 실행되어도 작동
3. **심도 있는 설명**: 개념의 why, what, how 모두 다룸
4. **Marimo 최적화**: 표현식 자동 출력 100% 활용
5. **품질 보증**: 모든 검증 체크 통과
