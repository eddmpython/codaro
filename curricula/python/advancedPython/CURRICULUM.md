# 고급 파이썬 커리큘럼 (Pyodide 호환)

## ⚠️ Pyodide 환경 제약

모든 콘텐츠는 브라우저 내 Pyodide에서 실행됩니다.

**사용 가능**:
- 순수 파이썬 표준 라이브러리
- functools, itertools, collections, typing, dataclasses
- abc, enum, re, math, random, heapq, bisect
- 메모리 내 자료구조 처리

**사용 불가**:
- asyncio, threading, multiprocessing
- 파일 I/O, subprocess
- 네트워크 요청 (aiohttp, requests)
- C 확장 (Cython)

---

## Week 1: 함수형 프로그래밍 심화

### Day 01: 람다와 고차 함수
**파일명**: `01_람다와고차함수.yaml`

**학습 목표**:
- lambda 표현식의 문법과 활용 이해
- map(), filter(), reduce()의 내부 동작 원리 파악
- 함수를 인자로 받거나 반환하는 고차 함수 개념 습득
- 함수형 프로그래밍 패러다임의 장점 이해

**섹션 구성**:
1. **lambda_basics**: 람다 표현식 기초 - 문법, 단일 표현식 규칙, 언제 사용하는지
2. **map_function**: map() 함수 - 반복 변환, 다중 iterable, lazy evaluation
3. **filter_function**: filter() 함수 - 조건부 필터링, None 필터, 활용 패턴
4. **reduce_function**: reduce() 함수 - 누적 연산, 초기값, functools.reduce
5. **higher_order**: 고차 함수 - 함수를 반환하는 함수, 콜백 패턴
6. **practical_patterns**: 실전 패턴 - 파이프라인, 함수 합성

**핵심 개념**:
- 람다는 익명 함수, 단일 표현식만 가능
- map/filter는 지연 평가(lazy evaluation)
- reduce는 functools 모듈에서 import 필요
- 고차 함수는 함수를 인자로 받거나 반환하는 함수

---

### Day 02: 함수 데코레이터 심화
**파일명**: `02_함수데코레이터심화.yaml`

**학습 목표**:
- 데코레이터의 내부 동작 원리 완벽 이해
- 인자를 받는 데코레이터 구현
- 다중 데코레이터 스택 순서 이해
- 클래스 데코레이터 활용

**섹션 구성**:
1. **decorator_review**: 데코레이터 복습 - 기본 패턴, @syntax, wrapper 함수
2. **parameterized**: 인자 있는 데코레이터 - 3중 중첩, 팩토리 패턴
3. **multiple_decorators**: 다중 데코레이터 - 실행 순서, 스택 구조
4. **functools_wraps**: functools.wraps - 메타데이터 보존, __name__, __doc__
5. **class_decorator**: 클래스 데코레이터 - 클래스를 수정하는 데코레이터
6. **method_decorator**: 메서드 데코레이터 - self 처리, 인스턴스 메서드

**핵심 개념**:
- 데코레이터 = 함수를 받아 함수를 반환하는 함수
- 인자 있는 데코레이터는 3중 중첩 (데코레이터 팩토리)
- 다중 데코레이터는 아래에서 위로 적용
- @functools.wraps로 원본 함수 메타데이터 보존

---

### Day 03: 클로저와 상태 관리
**파일명**: `03_클로저와상태관리.yaml`

**학습 목표**:
- 클로저의 정의와 동작 원리 이해
- 자유 변수(free variable)와 셀(cell) 개념 파악
- 클로저를 이용한 상태 캡슐화 패턴 학습
- 메모이제이션 구현

**섹션 구성**:
1. **closure_definition**: 클로저 정의 - 자유 변수, __closure__, cell objects
2. **state_encapsulation**: 상태 캡슐화 - 프라이빗 변수 흉내, 카운터 패턴
3. **factory_pattern**: 팩토리 패턴 - 함수 생성기, 설정 주입
4. **memoization**: 메모이제이션 - 캐시 패턴, 재귀 최적화
5. **nonlocal_keyword**: nonlocal 키워드 - 외부 스코프 변수 수정
6. **closure_vs_class**: 클로저 vs 클래스 - 언제 무엇을 사용할지

**핵심 개념**:
- 클로저 = 자유 변수를 기억하는 함수
- nonlocal로 외부 스코프 변수 수정 가능
- 메모이제이션은 클로저의 대표적 활용 사례
- 간단한 상태 관리는 클로저, 복잡하면 클래스

---

### Day 04: functools 완벽 가이드
**파일명**: `04_functools완벽가이드.yaml`

**학습 목표**:
- functools 모듈의 주요 함수 완벽 이해
- partial로 함수 커링 구현
- lru_cache로 캐싱 최적화
- singledispatch로 함수 오버로딩

**섹션 구성**:
1. **partial_function**: functools.partial - 부분 적용, 인자 고정
2. **wraps_decorator**: functools.wraps - 데코레이터 메타데이터
3. **lru_cache**: functools.lru_cache - 메모이제이션, maxsize, typed
4. **cache**: functools.cache - Python 3.9+ 무제한 캐시
5. **singledispatch**: functools.singledispatch - 타입 기반 디스패치
6. **total_ordering**: functools.total_ordering - 비교 연산자 자동 생성

**핵심 개념**:
- partial = 함수의 일부 인자를 미리 고정
- lru_cache = Least Recently Used 캐시
- singledispatch = 첫 번째 인자 타입에 따라 다른 함수 호출
- total_ordering = __lt__, __eq__만 정의하면 나머지 자동 생성

---

### Day 05: itertools 마스터
**파일명**: `05_itertools마스터.yaml`

**학습 목표**:
- itertools 모듈의 모든 함수 학습
- 무한 이터레이터 활용법
- 조합/순열 생성
- 실전에서 itertools 활용

**섹션 구성**:
1. **infinite_iterators**: 무한 이터레이터 - count, cycle, repeat
2. **terminating_iterators**: 종료 이터레이터 - takewhile, dropwhile, islice
3. **combinatoric**: 조합 함수 - product, permutations, combinations
4. **groupby**: groupby 함수 - 그룹화, 정렬 필수 조건
5. **chain_zip**: chain과 zip_longest - 이터레이터 연결, 길이 맞추기
6. **accumulate**: accumulate 함수 - 누적 합, 커스텀 함수

**핵심 개념**:
- 무한 이터레이터는 break나 islice로 제한 필요
- groupby는 연속된 같은 값끼리 그룹화 (정렬 필수)
- combinations는 순서 무관, permutations는 순서 있음
- 모든 itertools 함수는 지연 평가

---

## Week 2: 객체지향 심화

### Day 06: 메타클래스
**파일명**: `06_메타클래스.yaml`

**학습 목표**:
- 클래스도 객체라는 개념 이해
- type()을 이용한 동적 클래스 생성
- 커스텀 메타클래스 구현
- __init_subclass__ 활용

**섹션 구성**:
1. **class_is_object**: 클래스도 객체 - type(cls), __class__, 타입 계층
2. **type_function**: type()으로 클래스 생성 - 동적 클래스, 속성 주입
3. **metaclass_basic**: 메타클래스 기초 - __new__, __init__, __call__
4. **metaclass_example**: 메타클래스 예제 - 싱글톤, 레지스트리, 검증
5. **init_subclass**: __init_subclass__ - 서브클래스 훅, Python 3.6+
6. **when_to_use**: 언제 사용하나 - 프레임워크, ORM, 데코레이터 대안

**핵심 개념**:
- 클래스는 type의 인스턴스
- 메타클래스는 클래스를 생성하는 클래스
- __init_subclass__는 메타클래스의 가벼운 대안
- 대부분의 경우 데코레이터로 충분

---

### Day 07: 디스크립터
**파일명**: `07_디스크립터.yaml`

**학습 목표**:
- 디스크립터 프로토콜 이해
- __get__, __set__, __delete__ 구현
- 프로퍼티의 내부 동작 파악
- 검증 디스크립터 구현

**섹션 구성**:
1. **descriptor_protocol**: 디스크립터 프로토콜 - __get__, __set__, __delete__
2. **non_data_descriptor**: 비데이터 디스크립터 - __get__만 정의
3. **data_descriptor**: 데이터 디스크립터 - __get__, __set__ 모두 정의
4. **property_internal**: property 내부 - property도 디스크립터
5. **validation_descriptor**: 검증 디스크립터 - 타입 검사, 범위 검사
6. **lazy_descriptor**: 지연 로딩 디스크립터 - 계산된 속성 캐싱

**핵심 개념**:
- 디스크립터 = 속성 접근을 가로채는 객체
- 데이터 디스크립터 > 인스턴스 __dict__ > 비데이터 디스크립터
- property, classmethod, staticmethod 모두 디스크립터
- 재사용 가능한 속성 로직에 활용

---

### Day 08: 추상 클래스와 프로토콜
**파일명**: `08_추상클래스와프로토콜.yaml`

**학습 목표**:
- ABC 모듈 활용법 학습
- 추상 메서드와 추상 프로퍼티 정의
- 덕 타이핑과 프로토콜
- typing.Protocol 활용

**섹션 구성**:
1. **abc_module**: abc 모듈 - ABC, abstractmethod 기초
2. **abstract_property**: 추상 프로퍼티 - @property + @abstractmethod
3. **interface_design**: 인터페이스 설계 - 명시적 계약, 문서화
4. **duck_typing**: 덕 타이핑 - 타입보다 행동, EAFP
5. **protocol_typing**: typing.Protocol - 구조적 서브타이핑
6. **practical_abc**: 실전 ABC - 플러그인 시스템, 전략 패턴

**핵심 개념**:
- ABC = 인스턴스화 불가능한 추상 클래스
- abstractmethod = 반드시 오버라이드해야 하는 메서드
- 덕 타이핑 = "오리처럼 걷고 꽥꽥거리면 오리다"
- Protocol = 명시적 상속 없이 타입 검사

---

### Day 09: 다중 상속과 MRO
**파일명**: `09_다중상속과MRO.yaml`

**학습 목표**:
- 다중 상속의 작동 원리 이해
- MRO (Method Resolution Order) 파악
- 다이아몬드 문제와 해결책
- Mixin 패턴 활용

**섹션 구성**:
1. **multiple_inheritance**: 다중 상속 기초 - 문법, 속성 검색 순서
2. **mro_algorithm**: MRO 알고리즘 - C3 선형화, __mro__ 확인
3. **diamond_problem**: 다이아몬드 문제 - 공통 조상, super() 체인
4. **super_function**: super() 심화 - 협력적 상속, 인자 전달
5. **mixin_pattern**: Mixin 패턴 - 재사용 가능한 기능 조합
6. **composition**: 상속 vs 합성 - 언제 무엇을 사용할지

**핵심 개념**:
- MRO = 메서드 검색 순서 (왼쪽에서 오른쪽, 깊이 우선)
- super()는 MRO 순서대로 다음 클래스 호출
- Mixin = 독립적인 기능을 제공하는 작은 클래스
- "상속보다 합성을 선호하라"

---

### Day 10: slots와 메모리 최적화
**파일명**: `10_slots와메모리최적화.yaml`

**학습 목표**:
- __slots__의 동작 원리와 장단점 이해
- 메모리 사용량 측정 방법
- 대량 객체 생성 시 최적화

**섹션 구성**:
1. **slots_basic**: __slots__ 기초 - 문법, __dict__ 제거 효과
2. **memory_comparison**: 메모리 비교 - sys.getsizeof, 객체 크기 측정
3. **slots_inheritance**: 상속과 __slots__ - 부모/자식 슬롯, 빈 슬롯
4. **slots_limitations**: 제한사항 - 동적 속성 불가, 다중 상속 문제
5. **weakref_support**: weakref 지원 - __weakref__ 슬롯 추가
6. **performance**: 성능 비교 - 속성 접근 속도

**핵심 개념**:
- __slots__ = 허용된 속성만 정의, __dict__ 없음
- 메모리 절약 (특히 많은 인스턴스 생성 시)
- 속성 접근 속도 약간 향상
- 유연성과 메모리 사이의 트레이드오프

---

## Week 3: 타입 시스템 심화

### Day 11: 타입 힌팅 심화
**파일명**: `11_타입힌팅심화.yaml`

**학습 목표**:
- Generic과 TypeVar 이해
- Protocol로 구조적 타이핑
- overload로 함수 오버로딩 타입 힌팅
- 복잡한 타입 표현

**섹션 구성**:
1. **generic_class**: Generic 클래스 - 타입 파라미터, 재사용
2. **typevar**: TypeVar - 타입 변수, bound, constraints
3. **protocol_typing**: Protocol - 구조적 서브타이핑
4. **overload**: @overload - 여러 시그니처 정의
5. **callable**: Callable - 함수 타입 힌팅
6. **advanced_types**: 고급 타입 - Union, Optional, Any

**핵심 개념**:
- Generic = 타입을 파라미터로 받는 클래스
- TypeVar = 타입 변수, 여러 곳에서 같은 타입 보장
- Protocol = 덕 타이핑의 타입 힌팅 버전
- @overload = 런타임에는 없음, 타입 체커용

---

### Day 12: dataclasses 마스터
**파일명**: `12_dataclasses마스터.yaml`

**학습 목표**:
- dataclass 데코레이터 완벽 이해
- field() 함수 활용
- 불변 데이터클래스 (frozen)
- 상속과 dataclass

**섹션 구성**:
1. **dataclass_basic**: @dataclass 기초 - 자동 __init__, __repr__
2. **field_function**: field() 함수 - default_factory, compare, hash
3. **post_init**: __post_init__ - 초기화 후처리
4. **frozen_dataclass**: frozen=True - 불변 인스턴스
5. **slots_dataclass**: slots=True - 메모리 최적화 (Python 3.10+)
6. **inheritance**: 상속 - 부모 필드, 기본값 순서

**핵심 개념**:
- @dataclass = 보일러플레이트 코드 자동 생성
- field(default_factory=list) = 가변 기본값 안전하게
- __post_init__ = __init__ 이후 추가 로직
- frozen = 해시 가능한 불변 객체

---

### Day 13: collections 심화
**파일명**: `13_collections심화.yaml`

**학습 목표**:
- namedtuple 활용
- defaultdict 패턴
- Counter 객체 마스터
- deque 자료구조

**섹션 구성**:
1. **namedtuple**: namedtuple - 이름 있는 튜플, 불변성
2. **defaultdict**: defaultdict - 기본값 팩토리, 그룹화
3. **counter**: Counter - 빈도 계산, 연산자
4. **deque**: deque - 양방향 큐, maxlen
5. **ordereddict**: OrderedDict - 순서 보장 (Python 3.7+ dict도 가능)
6. **chainmap**: ChainMap - 여러 딕셔너리 체인

**핵심 개념**:
- namedtuple = 인덱스 대신 이름으로 접근
- defaultdict = KeyError 없이 기본값 자동 생성
- Counter = 해시 가능 객체 빈도 세기
- deque = O(1) 양 끝 추가/삭제

---

### Day 14: enum과 상수 관리
**파일명**: `14_enum과상수관리.yaml`

**학습 목표**:
- Enum 클래스 활용
- IntEnum, StrEnum
- Flag 비트 연산
- auto() 자동 값 할당

**섹션 구성**:
1. **enum_basic**: Enum 기초 - 정의, 접근, 반복
2. **intenum**: IntEnum - 정수 비교 가능
3. **strenum**: StrEnum - 문자열 열거형 (Python 3.11+)
4. **flag**: Flag - 비트 플래그, 조합
5. **auto**: auto() - 자동 값 할당
6. **practical_enum**: 실전 활용 - 상태 머신, 설정

**핵심 개념**:
- Enum = 명명된 상수 집합
- IntEnum = int와 호환되는 열거형
- Flag = 비트 연산으로 조합 가능
- auto() = 값을 자동으로 할당

---

### Day 15: typing 고급
**파일명**: `15_typing고급.yaml`

**학습 목표**:
- Literal 타입
- Final 상수
- TypedDict
- Annotated 메타데이터

**섹션 구성**:
1. **literal**: Literal - 특정 값만 허용
2. **final**: Final - 재할당 금지 상수
3. **typeddict**: TypedDict - 키 이름과 타입 지정
4. **annotated**: Annotated - 타입에 메타데이터 추가
5. **newtype**: NewType - 새로운 타입 별칭
6. **type_guards**: 타입 가드 - TypeGuard, isinstance 힌팅

**핵심 개념**:
- Literal = 특정 리터럴 값만 허용
- Final = 재할당하면 안 되는 상수 표시
- TypedDict = 딕셔너리 키와 값 타입 지정
- Annotated = 추가 정보 첨부 (검증, 문서화)

---

## Week 4: 알고리즘과 자료구조

### Day 16: 재귀와 분할정복
**파일명**: `16_재귀와분할정복.yaml`

**학습 목표**:
- 재귀 함수의 구조 이해
- 메모이제이션으로 최적화
- 분할정복 패턴
- 꼬리 재귀 개념

**섹션 구성**:
1. **recursion_basics**: 재귀 기초 - 기저 조건, 재귀 조건
2. **factorial_fibonacci**: 팩토리얼과 피보나치 - 전형적인 예제
3. **memoization**: 메모이제이션 - lru_cache, 수동 캐싱
4. **divide_conquer**: 분할정복 - 문제 쪼개기, 합치기
5. **tail_recursion**: 꼬리 재귀 - 개념 (파이썬은 최적화 안 함)
6. **iteration_conversion**: 반복 변환 - 재귀를 반복으로

**핵심 개념**:
- 재귀 = 함수가 자기 자신을 호출
- 기저 조건 없으면 무한 루프
- 메모이제이션 = 중복 계산 방지
- 파이썬 재귀 제한 약 1000

---

### Day 17: 정렬 알고리즘
**파일명**: `17_정렬알고리즘.yaml`

**학습 목표**:
- 기본 정렬 알고리즘 구현
- 고급 정렬 알고리즘 이해
- 시간복잡도 분석
- Python 정렬 활용

**섹션 구성**:
1. **bubble_sort**: 버블 정렬 - O(n²), 인접 교환
2. **selection_sort**: 선택 정렬 - O(n²), 최솟값 선택
3. **insertion_sort**: 삽입 정렬 - O(n²), 정렬된 부분에 삽입
4. **merge_sort**: 병합 정렬 - O(n log n), 분할정복
5. **quick_sort**: 퀵 정렬 - O(n log n) 평균, 피벗
6. **python_sort**: 파이썬 정렬 - sorted, sort, key, reverse

**핵심 개념**:
- O(n²): 버블, 선택, 삽입
- O(n log n): 병합, 퀵 (평균)
- 파이썬 sorted()는 Timsort (O(n log n))
- key 함수로 커스텀 정렬

---

### Day 18: 탐색 알고리즘
**파일명**: `18_탐색알고리즘.yaml`

**학습 목표**:
- 선형 탐색과 이진 탐색
- bisect 모듈 활용
- 그래프 탐색 기초
- 해시 탐색

**섹션 구성**:
1. **linear_search**: 선형 탐색 - O(n), 순차 검색
2. **binary_search**: 이진 탐색 - O(log n), 정렬 필수
3. **bisect_module**: bisect 모듈 - bisect_left, bisect_right, insort
4. **bfs**: 너비 우선 탐색 - 큐, 레벨 순회
5. **dfs**: 깊이 우선 탐색 - 스택/재귀, 경로 탐색
6. **hash_search**: 해시 탐색 - O(1) 평균, 딕셔너리/집합

**핵심 개념**:
- 이진 탐색 = 정렬된 데이터에서 절반씩 제거
- bisect = 정렬 유지하며 삽입/검색
- BFS = 가장 가까운 것부터 (최단 경로)
- DFS = 가장 깊이 먼저 (경로 존재 여부)

---

### Day 19: 동적 프로그래밍
**파일명**: `19_동적프로그래밍.yaml`

**학습 목표**:
- DP의 핵심 개념 이해
- 상향식(Bottom-up) vs 하향식(Top-down)
- 대표적인 DP 문제 풀이
- 최적화 기법

**섹션 구성**:
1. **dp_concept**: DP 개념 - 최적 부분 구조, 중복 부분 문제
2. **top_down**: 하향식 - 메모이제이션, 재귀
3. **bottom_up**: 상향식 - 테이블, 반복
4. **fibonacci_dp**: 피보나치 DP - 기본 예제
5. **knapsack**: 배낭 문제 - 0/1 Knapsack
6. **longest_common**: LCS - 최장 공통 부분 수열

**핵심 개념**:
- DP = 큰 문제를 작은 문제로 나누어 해결
- 중복 계산을 저장하여 재사용
- 상향식 = 작은 것부터 채우기
- 하향식 = 큰 것부터 내려가며 캐싱

---

### Day 20: 자료구조 구현
**파일명**: `20_자료구조구현.yaml`

**학습 목표**:
- 스택과 큐 구현
- 힙과 우선순위 큐
- 트리 구조
- 그래프 표현

**섹션 구성**:
1. **stack**: 스택 - LIFO, push/pop
2. **queue**: 큐 - FIFO, deque 활용
3. **heap**: 힙 - heapq, 최소힙, 최대힙
4. **binary_tree**: 이진 트리 - 노드, 순회
5. **bst**: 이진 탐색 트리 - 삽입, 검색
6. **graph**: 그래프 - 인접 리스트, 인접 행렬

**핵심 개념**:
- 스택 = 리스트 append/pop
- 큐 = deque popleft
- heapq = 최소힙, 부호 반전으로 최대힙
- 그래프 = 딕셔너리로 인접 리스트

---

## Week 5: 고급 패턴과 기법

### Day 21: 디자인 패턴 1 - 생성 패턴
**파일명**: `21_디자인패턴1.yaml`

**학습 목표**:
- 싱글톤 패턴
- 팩토리 패턴
- 빌더 패턴
- 프로토타입 패턴

**섹션 구성**:
1. **singleton**: 싱글톤 - 단일 인스턴스, 구현 방법들
2. **factory_method**: 팩토리 메서드 - 객체 생성 캡슐화
3. **abstract_factory**: 추상 팩토리 - 관련 객체 그룹 생성
4. **builder**: 빌더 - 단계별 객체 구성
5. **prototype**: 프로토타입 - 복제를 통한 생성
6. **when_to_use**: 언제 사용하나 - 상황별 패턴 선택

**핵심 개념**:
- 싱글톤 = 클래스의 인스턴스가 하나만 존재
- 팩토리 = 객체 생성 로직을 분리
- 빌더 = 복잡한 객체를 단계별로 생성
- 파이썬에서는 모듈 자체가 싱글톤

---

### Day 22: 디자인 패턴 2 - 행동 패턴
**파일명**: `22_디자인패턴2.yaml`

**학습 목표**:
- 옵저버 패턴
- 전략 패턴
- 상태 패턴
- 데코레이터 패턴 (GoF)

**섹션 구성**:
1. **observer**: 옵저버 - 이벤트 구독/발행
2. **strategy**: 전략 - 알고리즘 교체
3. **state**: 상태 - 상태에 따른 행동 변경
4. **decorator_pattern**: 데코레이터 패턴 - 동적 기능 추가
5. **template_method**: 템플릿 메서드 - 알고리즘 골격 정의
6. **chain_responsibility**: 책임 연쇄 - 요청 처리 체인

**핵심 개념**:
- 옵저버 = 상태 변경 알림 (이벤트 시스템)
- 전략 = 런타임에 알고리즘 교체
- 상태 = 객체 상태에 따라 행동 변경
- 파이썬에서는 함수가 일급 객체라 더 간단히 구현

---

### Day 23: 함수형 패턴
**파일명**: `23_함수형패턴.yaml`

**학습 목표**:
- 파이프라인 패턴
- 커링과 부분 적용
- 함수 합성
- 모나드 개념 소개

**섹션 구성**:
1. **pipeline**: 파이프라인 - 함수 체이닝
2. **currying**: 커링 - 다중 인자를 단일 인자로
3. **partial_application**: 부분 적용 - functools.partial 활용
4. **function_composition**: 함수 합성 - compose, pipe
5. **maybe_pattern**: Maybe 패턴 - None 처리
6. **functional_error**: 함수형 에러 처리 - Either, Result 패턴

**핵심 개념**:
- 파이프라인 = 데이터를 함수 체인으로 변환
- 커링 = f(a, b) → f(a)(b)
- 함수 합성 = (f ∘ g)(x) = f(g(x))
- Maybe = None을 안전하게 처리

---

### Day 24: 메타프로그래밍
**파일명**: `24_메타프로그래밍.yaml`

**학습 목표**:
- exec과 eval 이해
- compile 함수
- ast 모듈 활용
- 코드 생성

**섹션 구성**:
1. **eval_function**: eval - 표현식 평가, 보안 주의
2. **exec_function**: exec - 문장 실행, 네임스페이스
3. **compile_function**: compile - 코드 객체 생성
4. **ast_module**: ast 모듈 - 구문 트리 분석
5. **code_generation**: 코드 생성 - 동적 함수 생성
6. **inspection**: inspect 모듈 - 객체 분석

**핵심 개념**:
- eval = 문자열을 표현식으로 평가
- exec = 문자열을 코드로 실행
- ast = 파이썬 코드를 트리로 분석
- 보안에 매우 주의 필요

---

### Day 25: 정규표현식 고급
**파일명**: `25_정규표현식고급.yaml`

**학습 목표**:
- 그룹과 캡처
- 전방탐색, 후방탐색
- 치환과 콜백
- 성능 최적화

**섹션 구성**:
1. **groups**: 그룹 - 캡처, 비캡처 그룹
2. **named_groups**: 명명 그룹 - (?P<name>...)
3. **lookahead**: 전방탐색 - 긍정/부정
4. **lookbehind**: 후방탐색 - 긍정/부정
5. **substitution**: 치환 - sub, 콜백 함수
6. **optimization**: 최적화 - 컴파일, 탐욕적/게으른

**핵심 개념**:
- 그룹 = () 로 부분 매칭 캡처
- 전방탐색 = 뒤에 올 패턴 확인
- 후방탐색 = 앞에 올 패턴 확인
- re.compile()로 반복 사용 시 성능 향상

---

## Week 6: 실전과 최적화

### Day 26: 코드 최적화
**파일명**: `26_코드최적화.yaml`

**학습 목표**:
- 시간복잡도 분석
- 공간복잡도 분석
- 빅오 표기법
- 실전 최적화 기법

**섹션 구성**:
1. **big_o**: 빅오 표기법 - O(1), O(n), O(n²), O(log n)
2. **time_complexity**: 시간복잡도 - 연산 횟수 분석
3. **space_complexity**: 공간복잡도 - 메모리 사용 분석
4. **common_patterns**: 자주 나오는 패턴 - 루프, 재귀
5. **optimization_tips**: 최적화 팁 - 리스트 컴프리헨션, 제너레이터
6. **trade_offs**: 트레이드오프 - 시간 vs 공간

**핵심 개념**:
- O(1) < O(log n) < O(n) < O(n log n) < O(n²)
- 중첩 루프 = O(n²)
- 재귀 깊이 = 공간복잡도
- 캐싱 = 시간↓ 공간↑

---

### Day 27: 문자열 알고리즘
**파일명**: `27_문자열알고리즘.yaml`

**학습 목표**:
- 문자열 패턴 매칭
- KMP 알고리즘
- 라빈-카프 알고리즘
- 문자열 처리 기법

**섹션 구성**:
1. **naive_matching**: 브루트포스 - O(nm), 단순 비교
2. **kmp**: KMP 알고리즘 - O(n+m), 실패 함수
3. **rabin_karp**: 라빈-카프 - 해시 기반, 롤링 해시
4. **string_manipulation**: 문자열 조작 - 슬라이싱, 결합
5. **palindrome**: 팰린드롬 - 양방향 검사
6. **anagram**: 아나그램 - 문자 빈도 비교

**핵심 개념**:
- 브루트포스 = 모든 위치에서 비교
- KMP = 실패 시 처음부터 시작하지 않음
- 라빈-카프 = 해시 충돌 처리
- Counter로 아나그램 쉽게 판별

---

### Day 28: 수학 알고리즘
**파일명**: `28_수학알고리즘.yaml`

**학습 목표**:
- 소수 알고리즘
- 최대공약수, 최소공배수
- 조합론 기초
- 확률 계산

**섹션 구성**:
1. **prime**: 소수 판별 - O(√n), 에라토스테네스 체
2. **gcd_lcm**: 최대공약수/최소공배수 - 유클리드 알고리즘
3. **factorial_comb**: 팩토리얼과 조합 - math 모듈
4. **permutation_comb**: 순열과 조합 - itertools
5. **probability**: 확률 기초 - random 모듈
6. **modular**: 모듈러 연산 - 큰 수 계산

**핵심 개념**:
- 소수 판별 = √n까지만 확인
- 에라토스테네스 = 범위 내 모든 소수
- gcd = math.gcd (Python 3.5+)
- 모듈러 = 큰 수 연산 오버플로 방지

---

### Day 29: 클린 코드
**파일명**: `29_클린코드.yaml`

**학습 목표**:
- SOLID 원칙
- 리팩토링 기법
- 코드 스멜 탐지
- 클린 코드 원칙

**섹션 구성**:
1. **srp**: 단일 책임 원칙 - 하나의 변경 이유
2. **ocp**: 개방-폐쇄 원칙 - 확장에 열림, 수정에 닫힘
3. **lsp**: 리스코프 치환 원칙 - 서브타입 대체 가능
4. **isp**: 인터페이스 분리 원칙 - 작은 인터페이스
5. **dip**: 의존성 역전 원칙 - 추상화에 의존
6. **refactoring**: 리팩토링 - 이름 변경, 추출, 인라인

**핵심 개념**:
- SRP = 클래스는 하나의 책임만
- OCP = 기존 코드 수정 없이 기능 추가
- LSP = 부모 대신 자식 사용 가능
- DIP = 고수준 모듈이 저수준에 의존하지 않음

---

### Day 30: 종합 문제 풀이
**파일명**: `30_종합문제풀이.yaml`

**학습 목표**:
- 배운 개념 종합 적용
- 문제 해결 접근법
- 코드 최적화 실습
- 알고리즘 선택

**섹션 구성**:
1. **problem_approach**: 문제 접근법 - 분석, 설계, 구현
2. **array_problems**: 배열 문제 - 투 포인터, 슬라이딩 윈도우
3. **string_problems**: 문자열 문제 - 파싱, 변환
4. **recursion_problems**: 재귀 문제 - 백트래킹
5. **dp_problems**: DP 문제 - 최적화 문제
6. **graph_problems**: 그래프 문제 - 탐색, 경로

**핵심 개념**:
- 문제 이해 → 예제 분석 → 알고리즘 선택 → 구현
- 투 포인터 = 양 끝에서 접근
- 슬라이딩 윈도우 = 고정 크기 구간 이동
- 백트래킹 = 가지치기 재귀

---

## 선수 지식 (30days 완료 기준)

### 필수 완료
- 변수, 데이터 타입, 연산자
- 문자열, 리스트, 튜플, 집합, 딕셔너리
- 조건문, 반복문
- 함수 (기초, 고급, 스코프)
- 클래스 (기초, 고급, 특수 메서드)
- 컴프리헨션
- 제너레이터, 이터레이터
- 컨텍스트 매니저

### 권장 완료
- 파일 입출력
- 예외 처리
- 모듈과 import
- 프로퍼티와 데코레이터 (기초)

---

## 카테고리 메타데이터

```python
categoryMapping = {
    'advancedPython': '고급파이썬',
}
```

**표시 순서**: 30days 바로 다음
