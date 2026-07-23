var e=`meta:
  id: '30'
  title: 종합 문제 풀이
  day: 30
  category: advancedPython
  tags:
  - 종합
  - 실전
  - 알고리즘
  - 자료구조
  - 디자인패턴
  - 최적화
  - 검증
  - 통합프로젝트
  seo:
    title: 파이썬 종합 문제 풀이
    description: 30일간 학습한 고급 파이썬 개념을 종합적으로 활용하는 실전 문제 풀이
    keywords:
    - 종합
    - 실전
    - 알고리즘
    - 자료구조
    - 디자인패턴
    - 최적화
intro:
  emoji: 🎯
  points:
  - 알고리즘 + 자료구조 통합 문제
  - 디자인패턴 적용 실전 문제
  - 최적화 및 리팩토링 종합 문제
  - 함수형 + 객체지향 혼합 문제
  - 메타프로그래밍 활용 문제
  - 정규표현식 + 문자열 알고리즘 통합
  direction: 종합 문제 풀이에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 종합 문제 풀이 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 자료구조 + 알고리즘 통합 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 디자인패턴 통합 적용 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 함수형 + 객체지향 통합 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 종합 문제 풀이 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 종합 문제 풀이 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 종합 문제 풀이 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: data-structure-algorithm
  title: 자료구조 + 알고리즘 통합
  structuredPrimary: true
  subtitle: LRU 캐시 with TTL
  goal: 자료구조 + 알고리즘 통합에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 해시맵과 이중 연결 리스트를 결합하여 시간 제한 기능이 있는 LRU 캐시를 구현합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from time import time as getTime

    class CacheNode:
        def __init__(self, key, value, ttl):
            self.key = key
            self.value = value
            self.expiry = getTime() + ttl
            self.prev = None
            self.next = None

    class LRUCacheWithTTL:
        def __init__(self, capacity, defaultTtl=60):
            self.capacity = capacity
            self.defaultTtl = defaultTtl
            self.cache = {}
            self.head = CacheNode(None, None, 0)
            self.tail = CacheNode(None, None, 0)
            self.head.next = self.tail
            self.tail.prev = self.head

        def removeNode(self, node):
            node.prev.next = node.next
            node.next.prev = node.prev

        def addToFront(self, node):
            node.next = self.head.next
            node.prev = self.head
            self.head.next.prev = node
            self.head.next = node

        def get(self, key):
            if key not in self.cache:
                return None
            node = self.cache[key]
            if getTime() > node.expiry:
                self.removeNode(node)
                del self.cache[key]
                return None
            self.removeNode(node)
            self.addToFront(node)
            return node.value

        def put(self, key, value, ttl=None):
            ttl = ttl or self.defaultTtl
            if key in self.cache:
                self.removeNode(self.cache[key])
            node = CacheNode(key, value, ttl)
            self.cache[key] = node
            self.addToFront(node)
            if len(self.cache) > self.capacity:
                lru = self.tail.prev
                self.removeNode(lru)
                del self.cache[lru.key]

    lruCache = LRUCacheWithTTL(3, defaultTtl=10)
    lruCache.put("a", 1)
    lruCache.put("b", 2)
    lruCache.put("c", 3)
    lruCache.get("a")
    lruCache.put("d", 4)
    [lruCache.get(k) for k in ["a", "b", "c", "d"]]
  exercise:
    prompt: 자료구조 + 알고리즘 통합 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from time import time as getTime

      class CacheNode:
          def __init__(self, key, value, ttl):
              self.key = key
              self.value = value
              self.expiry = getTime() + ttl
              self.prev = None
              self.next = None

      class LRUCacheWithTTL:
          def __init__(self, capacity, defaultTtl=60):
              self.capacity = capacity
              self.defaultTtl = defaultTtl
              self.cache = {}
              self.head = CacheNode(None, None, 0)
              self.tail = CacheNode(None, None, 0)
              self.head.next = self.tail
              self.tail.prev = self.head

          def removeNode(self, node):
              node.prev.next = node.next
              node.next.prev = node.prev

          def addToFront(self, node):
              node.next = self.head.next
              node.prev = self.head
              self.head.next.prev = node
              self.head.next = node

          def get(self, key):
              if key not in self.cache:
                  return None
              node = self.cache[key]
              if getTime() > node.expiry:
                  self.removeNode(node)
                  del self.cache[key]
                  return None
              self.removeNode(node)
              self.addToFront(node)
              return node.value

          def put(self, key, value, ttl=None):
              ttl = ttl or self.defaultTtl
              if key in self.cache:
                  self.removeNode(self.cache[key])
              node = CacheNode(key, value, ttl)
              self.cache[key] = node
              self.addToFront(node)
              if len(self.cache) > self.capacity:
                  lru = self.tail.prev
                  self.removeNode(lru)
                  del self.cache[lru.key]

      lruCache = LRUCacheWithTTL(3, defaultTtl=10)
      lruCache.put("a", 1)
      lruCache.put("b", 2)
      lruCache.put("c", 3)
      lruCache.get("a")
      lruCache.put("d", 4)
      [lruCache.get(k) for k in ["a", "b", "c", "d"]]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 자료구조 + 알고리즘 통합의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 자료구조 + 알고리즘 통합 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: design-pattern-integration
  title: 디자인패턴 통합 적용
  structuredPrimary: true
  subtitle: 이벤트 기반 상태 머신
  goal: 디자인패턴 통합 적용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Observer, State, Command 패턴을 결합한 이벤트 기반 상태 머신을 구현합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from abc import ABC, abstractmethod

    class EventObserver(ABC):
        @abstractmethod
        def onEvent(self, event, data):
            pass

    class MachineState(ABC):
        @abstractmethod
        def handle(self, machine, event):
            pass

    class IdleState(MachineState):
        def handle(self, machine, event):
            if event == "start":
                machine.transition(RunningState())
                return "started"
            return "idle"

    class RunningState(MachineState):
        def handle(self, machine, event):
            if event == "pause":
                machine.transition(PausedState())
                return "paused"
            if event == "stop":
                machine.transition(IdleState())
                return "stopped"
            return "running"

    class PausedState(MachineState):
        def handle(self, machine, event):
            if event == "resume":
                machine.transition(RunningState())
                return "resumed"
            if event == "stop":
                machine.transition(IdleState())
                return "stopped"
            return "paused"

    class StateMachine:
        def __init__(self):
            self.state = IdleState()
            self.observers = []
            self.history = []

        def addObserver(self, observer):
            self.observers.append(observer)

        def notify(self, event, result):
            for obs in self.observers:
                obs.onEvent(event, result)

        def transition(self, newState):
            self.state = newState

        def dispatch(self, event):
            result = self.state.handle(self, event)
            self.history.append((event, result))
            self.notify(event, result)
            return result

    class LogObserver(EventObserver):
        def __init__(self):
            self.logs = []
        def onEvent(self, event, data):
            self.logs.append(f"{event}: {data}")

    fsm = StateMachine()
    logger = LogObserver()
    fsm.addObserver(logger)
    fsm.dispatch("start")
    fsm.dispatch("pause")
    fsm.dispatch("resume")
    fsm.dispatch("stop")
    logger.logs
  exercise:
    prompt: 디자인패턴 통합 적용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from abc import ABC, abstractmethod

      class EventObserver(ABC):
          @abstractmethod
          def onEvent(self, event, data):
              pass

      class MachineState(ABC):
          @abstractmethod
          def handle(self, machine, event):
              pass

      class IdleState(MachineState):
          def handle(self, machine, event):
              if event == "start":
                  machine.transition(RunningState())
                  return "started"
              return "idle"

      class RunningState(MachineState):
          def handle(self, machine, event):
              if event == "pause":
                  machine.transition(PausedState())
                  return "paused"
              if event == "stop":
                  machine.transition(IdleState())
                  return "stopped"
              return "running"

      class PausedState(MachineState):
          def handle(self, machine, event):
              if event == "resume":
                  machine.transition(RunningState())
                  return "resumed"
              if event == "stop":
                  machine.transition(IdleState())
                  return "stopped"
              return "paused"

      class StateMachine:
          def __init__(self):
              self.state = IdleState()
              self.observers = []
              self.history = []

          def addObserver(self, observer):
              self.observers.append(observer)

          def notify(self, event, result):
              for obs in self.observers:
                  obs.onEvent(event, result)

          def transition(self, newState):
              self.state = newState

          def dispatch(self, event):
              result = self.state.handle(self, event)
              self.history.append((event, result))
              self.notify(event, result)
              return result

      class LogObserver(EventObserver):
          def __init__(self):
              self.logs = []
          def onEvent(self, event, data):
              self.logs.append(f"{event}: {data}")

      fsm = StateMachine()
      logger = LogObserver()
      fsm.addObserver(logger)
      fsm.dispatch("start")
      fsm.dispatch("pause")
      fsm.dispatch("resume")
      fsm.dispatch("stop")
      logger.logs
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 디자인패턴 통합 적용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 디자인패턴 통합 적용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: functional-oop-integration
  title: 함수형 + 객체지향 통합
  structuredPrimary: true
  subtitle: 파이프라인 빌더
  goal: 함수형 + 객체지향 통합에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 함수형 파이프라인을 객체지향 빌더 패턴으로 구성하여 유연한 데이터 처리 시스템을 만듭니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from functools import reduce

    class Pipeline:
        def __init__(self):
            self.steps = []

        def pipe(self, func):
            self.steps.append(func)
            return self

        def filter(self, predicate):
            return self.pipe(lambda data: [x for x in data if predicate(x)])

        def map(self, transform):
            return self.pipe(lambda data: [transform(x) for x in data])

        def reduce(self, reducer, initial):
            return self.pipe(lambda data: reduce(reducer, data, initial))

        def sort(self, key=None, reverse=False):
            return self.pipe(lambda data: sorted(data, key=key, reverse=reverse))

        def take(self, n):
            return self.pipe(lambda data: data[:n])

        def execute(self, data):
            result = data
            for step in self.steps:
                result = step(result)
            return result

    sampleData = [
        {"name": "Alice", "score": 85, "age": 22},
        {"name": "Bob", "score": 92, "age": 25},
        {"name": "Charlie", "score": 78, "age": 23},
        {"name": "Diana", "score": 95, "age": 21},
        {"name": "Eve", "score": 88, "age": 24}
    ]

    pipeline = (Pipeline()
        .filter(lambda x: x["score"] >= 80)
        .map(lambda x: {**x, "grade": "A" if x["score"] >= 90 else "B"})
        .sort(key=lambda x: x["score"], reverse=True)
        .take(3))

    pipelineResult = pipeline.execute(sampleData)
    pipelineResult
  exercise:
    prompt: 함수형 + 객체지향 통합 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from functools import reduce

      class Pipeline:
          def __init__(self):
              self.steps = []

          def pipe(self, func):
              self.steps.append(func)
              return self

          def filter(self, predicate):
              return self.pipe(lambda data: [x for x in data if predicate(x)])

          def map(self, transform):
              return self.pipe(lambda data: [transform(x) for x in data])

          def reduce(self, reducer, initial):
              return self.pipe(lambda data: reduce(reducer, data, initial))

          def sort(self, key=None, reverse=False):
              return self.pipe(lambda data: sorted(data, key=key, reverse=reverse))

          def take(self, n):
              return self.pipe(lambda data: data[:n])

          def execute(self, data):
              result = data
              for step in self.steps:
                  result = step(result)
              return result

      sampleData = [
          {"name": "Alice", "score": 85, "age": 22},
          {"name": "Bob", "score": 92, "age": 25},
          {"name": "Charlie", "score": 78, "age": 23},
          {"name": "Diana", "score": 95, "age": 21},
          {"name": "Eve", "score": 88, "age": 24}
      ]

      pipeline = (Pipeline()
          .filter(lambda x: x["score"] >= 80)
          .map(lambda x: {**x, "grade": "A" if x["score"] >= 90 else "B"})
          .sort(key=lambda x: x["score"], reverse=True)
          .take(3))

      pipelineResult = pipeline.execute(sampleData)
      pipelineResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 함수형 + 객체지향 통합의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 함수형 + 객체지향 통합 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: metaprogramming-practice
  title: 메타프로그래밍 실전
  structuredPrimary: true
  subtitle: 자동 검증 데이터 클래스
  goal: 메타프로그래밍 실전에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 메타클래스와 디스크립터를 활용하여 자동 타입 검증 기능이 있는 데이터 클래스를 구현합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class TypedField:
        def __init__(self, fieldType, validator=None):
            self.fieldType = fieldType
            self.validator = validator

        def __set_name__(self, owner, name):
            self.name = name
            self.privateName = f"_{name}"

        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            return getattr(obj, self.privateName, None)

        def __set__(self, obj, value):
            if not isinstance(value, self.fieldType):
                raise TypeError(f"{self.name}: expected {self.fieldType.__name__}")
            if self.validator and not self.validator(value):
                raise ValueError(f"{self.name}: validation failed")
            setattr(obj, self.privateName, value)

    class ValidatedMeta(type):
        def __new__(mcs, name, bases, namespace):
            fields = {k: v for k, v in namespace.items()
                     if isinstance(v, TypedField)}
            namespace["_fields"] = fields
            return super().__new__(mcs, name, bases, namespace)

    class ValidatedModel(metaclass=ValidatedMeta):
        def __init__(self, **kwargs):
            for field in self._fields:
                if field in kwargs:
                    setattr(self, field, kwargs[field])

        def toDict(self):
            return {f: getattr(self, f) for f in self._fields}

    class UserModel(ValidatedModel):
        username = TypedField(str, lambda x: len(x) >= 3)
        age = TypedField(int, lambda x: 0 < x < 150)
        email = TypedField(str, lambda x: "@" in x)

    validUser = UserModel(username="alice", age=25, email="alice@test.com")
    validUser.toDict()
  exercise:
    prompt: 메타프로그래밍 실전 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class TypedField:
          def __init__(self, fieldType, validator=None):
              self.fieldType = fieldType
              self.validator = validator

          def __set_name__(self, owner, name):
              self.name = name
              self.privateName = f"_{name}"

          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              return getattr(obj, self.privateName, None)

          def __set__(self, obj, value):
              if not isinstance(value, self.fieldType):
                  raise TypeError(f"{self.name}: expected {self.fieldType.__name__}")
              if self.validator and not self.validator(value):
                  raise ValueError(f"{self.name}: validation failed")
              setattr(obj, self.privateName, value)

      class ValidatedMeta(type):
          def __new__(mcs, name, bases, namespace):
              fields = {k: v for k, v in namespace.items()
                       if isinstance(v, TypedField)}
              namespace["_fields"] = fields
              return super().__new__(mcs, name, bases, namespace)

      class ValidatedModel(metaclass=ValidatedMeta):
          def __init__(self, **kwargs):
              for field in self._fields:
                  if field in kwargs:
                      setattr(self, field, kwargs[field])

          def toDict(self):
              return {f: getattr(self, f) for f in self._fields}

      class UserModel(ValidatedModel):
          username = TypedField(str, lambda x: len(x) >= 3)
          age = TypedField(int, lambda x: 0 < x < 150)
          email = TypedField(str, lambda x: "@" in x)

      validUser = UserModel(username="alice", age=25, email="alice@test.com")
      validUser.toDict()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 메타프로그래밍 실전의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메타프로그래밍 실전 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: string-regex-integration
  title: 문자열 알고리즘 + 정규표현식
  structuredPrimary: true
  subtitle: 고급 텍스트 검색 엔진
  goal: Trie 자료구조와 정규표현식을 결합해 단어/접두사 검색이 모두 가능한 작은 검색 엔진을 만든다.
  why: 문자열 검색은 자료구조 선택이 곧 성능을 결정합니다. Trie는 접두사 검색에 O(L), 정규식 토크나이저는 입력 정규화에 강해 둘을 결합하면 짧은 코드로 실용적인 엔진이 됩니다.
  explanation: SearchEngine은 (1) regex로 입력 텍스트를 단어 단위로 토큰화하고 (2) 각 단어를 Trie에 삽입해 doc id를 누적합니다. 단어 정확 검색은 search, 접두사 검색은 searchPrefix가 처리합니다. Trie 노드 한 개당 자식 dict와 isEnd 플래그, 그 단어로 끝나는 문서 id 집합이 들어 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import re

    class TrieNode:
        def __init__(self):
            self.children = {}
            self.isEnd = False
            self.docIds = set()

    class SearchEngine:
        def __init__(self):
            self.root = TrieNode()
            self.documents = {}
            self.docId = 0

        def tokenize(self, text):
            return re.findall(r'\\b[a-zA-Z]+\\b', text.lower())

        def addDocument(self, text):
            self.docId += 1
            self.documents[self.docId] = text
            for word in self.tokenize(text):
                self.insertWord(word, self.docId)
            return self.docId

        def insertWord(self, word, docId):
            node = self.root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.isEnd = True
            node.docIds.add(docId)

        def searchWord(self, word):
            node = self.root
            for char in word.lower():
                if char not in node.children:
                    return set()
                node = node.children[char]
            return node.docIds if node.isEnd else set()

        def searchPrefix(self, prefix):
            node = self.root
            for char in prefix.lower():
                if char not in node.children:
                    return set()
                node = node.children[char]
            return self.collectDocs(node)

        def collectDocs(self, node):
            docs = set(node.docIds)
            for child in node.children.values():
                docs |= self.collectDocs(child)
            return docs

        def searchRegex(self, pattern):
            regex = re.compile(pattern, re.IGNORECASE)
            return {docId for docId, text in self.documents.items()
                   if regex.search(text)}

    searchEngine = SearchEngine()
    searchEngine.addDocument("Python is a powerful programming language")
    searchEngine.addDocument("Python supports functional programming")
    searchEngine.addDocument("JavaScript is also popular for programming")
    searchEngine.addDocument("Data structures are fundamental in programming")

    wordResult = searchEngine.searchWord("python")
    prefixResult = searchEngine.searchPrefix("prog")
    regexResult = searchEngine.searchRegex(r"python.*programming")
    {"word": wordResult, "prefix": prefixResult, "regex": regexResult}
  exercise:
    prompt: 문자열 알고리즘 + 정규표현식 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import re

      class TrieNode:
          def __init__(self):
              self.children = {}
              self.isEnd = False
              self.docIds = set()

      class SearchEngine:
          def __init__(self):
              self.root = TrieNode()
              self.documents = {}
              self.docId = 0

          def tokenize(self, text):
              return re.findall(r'\\b[a-zA-Z]+\\b', text.lower())

          def addDocument(self, text):
              self.docId += 1
              self.documents[self.docId] = text
              for word in self.tokenize(text):
                  self.insertWord(word, self.docId)
              return self.docId

          def insertWord(self, word, docId):
              node = self.root
              for char in word:
                  if char not in node.children:
                      node.children[char] = TrieNode()
                  node = node.children[char]
              node.isEnd = True
              node.docIds.add(docId)

          def searchWord(self, word):
              node = self.root
              for char in word.lower():
                  if char not in node.children:
                      return set()
                  node = node.children[char]
              return node.docIds if node.isEnd else set()

          def searchPrefix(self, prefix):
              node = self.root
              for char in prefix.lower():
                  if char not in node.children:
                      return set()
                  node = node.children[char]
              return self.collectDocs(node)

          def collectDocs(self, node):
              docs = set(node.docIds)
              for child in node.children.values():
                  docs |= self.collectDocs(child)
              return docs

          def searchRegex(self, pattern):
              regex = re.compile(pattern, re.IGNORECASE)
              return {docId for docId, text in self.documents.items()
                     if regex.search(text)}

      searchEngine = SearchEngine()
      searchEngine.addDocument("Python is a powerful programming language")
      searchEngine.addDocument("Python supports functional programming")
      searchEngine.addDocument("JavaScript is also popular for programming")
      searchEngine.addDocument("Data structures are fundamental in programming")

      wordResult = searchEngine.searchWord("python")
      prefixResult = searchEngine.searchPrefix("prog")
      regexResult = searchEngine.searchRegex(r"python.*programming")
      {"word": wordResult, "prefix": prefixResult, "regex": regexResult}
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 알고리즘 + 정규표현식의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.
    resultCheck: 문자열 알고리즘 + 정규표현식 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: optimization-dp
  title: 최적화 + 동적 프로그래밍
  structuredPrimary: true
  subtitle: 메모이제이션 데코레이터 고급 버전
  goal: 최적화 + 동적 프로그래밍에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: LRU 기반 메모이제이션에 통계 추적 기능을 추가한 고급 캐싱 데코레이터를 구현합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from functools import wraps
    from collections import OrderedDict

    def advancedMemo(maxSize=128, trackStats=True):
        def decorator(func):
            cache = OrderedDict()
            stats = {"hits": 0, "misses": 0, "evictions": 0}

            @wraps(func)
            def wrapper(*args, **kwargs):
                key = (args, tuple(sorted(kwargs.items())))
                if key in cache:
                    cache.move_to_end(key)
                    stats["hits"] += 1
                    return cache[key]

                stats["misses"] += 1
                result = func(*args, **kwargs)
                cache[key] = result

                if len(cache) > maxSize:
                    cache.popitem(last=False)
                    stats["evictions"] += 1

                return result

            def getStats():
                total = stats["hits"] + stats["misses"]
                hitRate = stats["hits"] / total if total > 0 else 0
                return {**stats, "hitRate": f"{hitRate:.2%}"}

            def clearCache():
                cache.clear()
                stats.update({"hits": 0, "misses": 0, "evictions": 0})

            wrapper.stats = getStats
            wrapper.clear = clearCache
            return wrapper
        return decorator

    @advancedMemo(maxSize=50)
    def fibonacci(n):
        if n < 2:
            return n
        return fibonacci(n - 1) + fibonacci(n - 2)

    fibResult = [fibonacci(i) for i in range(30)]
    fibStats = fibonacci.stats()
    {"fib30": fibResult[-1], "stats": fibStats}
  exercise:
    prompt: 최적화 + 동적 프로그래밍 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from functools import wraps
      from collections import OrderedDict

      def advancedMemo(maxSize=128, trackStats=True):
          def decorator(func):
              cache = OrderedDict()
              stats = {"hits": 0, "misses": 0, "evictions": 0}

              @wraps(func)
              def wrapper(*args, **kwargs):
                  key = (args, tuple(sorted(kwargs.items())))
                  if key in cache:
                      cache.move_to_end(key)
                      stats["hits"] += 1
                      return cache[key]

                  stats["misses"] += 1
                  result = func(*args, **kwargs)
                  cache[key] = result

                  if len(cache) > maxSize:
                      cache.popitem(last=False)
                      stats["evictions"] += 1

                  return result

              def getStats():
                  total = stats["hits"] + stats["misses"]
                  hitRate = stats["hits"] / total if total > 0 else 0
                  return {**stats, "hitRate": f"{hitRate:.2%}"}

              def clearCache():
                  cache.clear()
                  stats.update({"hits": 0, "misses": 0, "evictions": 0})

              wrapper.stats = getStats
              wrapper.clear = clearCache
              return wrapper
          return decorator

      @advancedMemo(maxSize=50)
      def fibonacci(n):
          if n < 2:
              return n
          return fibonacci(n - 1) + fibonacci(n - 2)

      fibResult = [fibonacci(i) for i in range(30)]
      fibStats = fibonacci.stats()
      {"fib30": fibResult[-1], "stats": fibStats}
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 최적화 + 동적 프로그래밍의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 최적화 + 동적 프로그래밍 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트'
  structuredPrimary: true
  subtitle: 정규식, 자료구조, 정렬, 집계를 하나의 검증 가능한 문제로 연결
  goal: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    종합 문제는 여러 개념을 나열하는 데서 끝나면 약합니다. 로그를 파싱하고, 실패 주문을 우선순위 큐로 정리하고, 결제 합계를 집계하는 작은 운영 리포트를 완성해보세요.

    마지막 실험으로 실패 주문을 고객별로 묶고, 금액이 큰 순서와 장애 심각도 순서가 서로 다를 때 어떤 리포트가 더 업무에 맞는지 비교하세요.
  snippet: |-
    import heapq
    import re

    logPattern = re.compile(
        r"(?P<timestamp>\\d{2}:\\d{2}) "
        r"(?P<level>INFO|WARN|ERROR) "
        r"order=(?P<orderId>O-\\d+) "
        r"status=(?P<status>paid|failed|draft) "
        r"amount=(?P<amount>\\d+)"
    )

    severityRank = {"ERROR": 0, "WARN": 1, "INFO": 2}

    def parseLine(line):
        match = logPattern.fullmatch(line)
        if match is None:
            raise ValueError("invalid operation log")
        event = match.groupdict()
        event["amount"] = int(event["amount"])
        return event

    def buildOperationReport(lines):
        events = [parseLine(line) for line in lines]
        paidTotal = sum(event["amount"] for event in events if event["status"] == "paid")
        incidentHeap = []
        for event in events:
            if event["status"] == "failed":
                heapq.heappush(
                    incidentHeap,
                    (severityRank[event["level"]], event["timestamp"], event["orderId"]),
                )
        firstIncident = heapq.heappop(incidentHeap)[2] if incidentHeap else None
        return {
            "paidTotal": paidTotal,
            "eventCount": len(events),
            "firstIncident": firstIncident,
        }

    logs = [
        "09:00 INFO order=O-100 status=paid amount=12000",
        "09:03 WARN order=O-101 status=failed amount=8000",
        "09:04 ERROR order=O-102 status=failed amount=15000",
        "09:05 INFO order=O-103 status=draft amount=3000",
    ]

    report = buildOperationReport(logs)

    assert report == {
        "paidTotal": 12000,
        "eventCount": 4,
        "firstIncident": "O-102",
    }
  exercise:
    prompt: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      import heapq
      import re

      logPattern = re.compile(
          r"(?P<timestamp>\\d{2}:\\d{2}) "
          r"(?P<level>INFO|WARN|ERROR) "
          r"order=(?P<orderId>O-\\d+) "
          r"status=(?P<status>paid|failed|draft) "
          r"amount=(?P<amount>\\d+)"
      )

      severityRank = {"ERROR": 0, "WARN": 1, "INFO": 2}

      def parseLine(line):
          match = logPattern.fullmatch(line)
          if match is None:
              raise ValueError("invalid operation log")
          event = match.groupdict()
          event["amount"] = int(event["amount"])
          return event

      def buildOperationReport(lines):
          events = [parseLine(line) for line in lines]
          paidTotal = sum(event["amount"] for event in events if event["status"] == "paid")
          incidentHeap = []
          for event in events:
              if event["status"] == "failed":
                  heapq.heappush(
                      incidentHeap,
                      (severityRank[event["level"]], event["timestamp"], event["orderId"]),
                  )
          firstIncident = heapq.heappop(incidentHeap)[2] if incidentHeap else None
          return {
              "paidTotal": paidTotal,
              "eventCount": len(events),
              "firstIncident": firstIncident,
          }

      logs = [
          "09:00 INFO order=O-100 status=paid amount=12000",
          "09:03 WARN order=O-101 status=failed amount=8000",
          "09:04 ERROR order=O-102 status=failed amount=15000",
          "09:05 INFO order=O-103 status=draft amount=3000",
      ]

      report = buildOperationReport(logs)

      assert report == {
          "paidTotal": 12000,
          "eventCount": 4,
          "firstIncident": "O-102",
      }
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice-exercises
  title: 종합 실습 문제
  structuredPrimary: true
  subtitle: 30일 과정 종합 문제
  goal: 종합 실습 문제에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 지금까지 학습한 모든 개념을 활용하여 문제를 해결하세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    EXERCISES = """
    기초 종합 (1-5)
    1. 스택 2개로 큐 구현 (자료구조)
    2. 싱글톤 + 팩토리 조합 (패턴)
    3. 고차함수로 유효성 검사기 (함수형)
    4. 프로퍼티 데코레이터 직접 구현 (메타)
    5. 이메일 파싱 정규표현식 (정규식)

    중급 종합 (6-10)
    6. 이진 힙 + 우선순위 큐 통합 (자료구조+알고리즘)
    7. 옵저버 + 전략 패턴 조합 (패턴)
    8. 모나드 체이닝 파이프라인 (함수형)
    9. 속성 접근 로깅 메타클래스 (메타)
    10. 로그 파서 + 분석기 (정규식+알고리즘)

    고급 종합 (11-20)
    11. B-트리 삽입/검색 구현 (자료구조)
    12. 이벤트 소싱 패턴 구현 (패턴+함수형)
    13. 타입 추론 시스템 구현 (메타+함수형)
    14. 컴파일러 렉서 구현 (정규식+자료구조)
    15. 그래프 최단경로 + 캐싱 (알고리즘+최적화)
    16. 플러그인 아키텍처 설계 (패턴+메타)
    17. 표현식 파서 + 평가기 (알고리즘+패턴)
    18. 비동기 작업 스케줄러 시뮬레이션 (자료구조+패턴)
    19. 도메인 특화 언어(DSL) 구현 (메타+정규식)
    20. 전체 시스템 통합 미니 프로젝트
    """
    EXERCISES
  exercise:
    prompt: 종합 실습 문제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class TwoStackQueue:
          def __init__(self):
              self.inbox = []
              self.outbox = []

          def enqueue(self, item):
              self.inbox.append(item)

          def dequeue(self):
              if not self.outbox:
                  while self.inbox:
                      self.outbox.append(self.inbox.pop())
              return self.outbox.pop() if self.outbox else None

          def peek(self):
              if not self.outbox:
                  while self.inbox:
                      self.outbox.append(self.inbox.pop())
              return self.outbox[-1] if self.outbox else None

      ex1Queue = TwoStackQueue()
      for i in range(1, 6):
          ex1Queue.enqueue(i)
      ex1Result = [ex1Queue.dequeue() for _ in range(5)]
      ex1Result
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 실습 문제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 실습 문제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 30_integrated_problem_solving-order-report-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - data-structure-algorithm
    - functional-oop-integration
    - optimization-dp
    - workflow_validation
    title: 주문 운영 리포트를 통합 파이프라인으로 만들기
    subtitle: integrated order report
    goal: build_order_operations_report(orders)를 완성해 paid 주문 요약, 중복 ID, 서비스별 금액, 최상위 서비스를 반환한다.
    why: 종합 문제의 가치는 여러 개념 이름을 나열하는 것이 아니라, 실제 운영 데이터를 한 흐름으로 처리하면서 선택한 자료구조와 알고리즘이 함께 작동하는지 증명하는 것입니다.
    explanation: status가 paid인 주문만 집계합니다. 중복 ID는 전체 입력 기준으로 탐지하고, 서비스별 금액은 paid 주문만 합산하세요.
    tips:
    - set은 중복 탐지에, dict는 서비스별 합계에 적합합니다.
    - topService는 금액이 가장 큰 서비스이며 동률이면 이름순으로 안정화하세요.
    exercise:
      prompt: build_order_operations_report(orders)를 완성해 paidCount, gross, duplicateIds, serviceTotals, topService를 반환하세요.
      starterCode: |-
        def build_order_operations_report(orders):
            raise NotImplementedError
      solution: |-
        def build_order_operations_report(orders):
            seen = set()
            duplicates = []
            paid_orders = []
            service_totals = {}
            for order in orders:
                order_id = order["id"]
                if order_id in seen and order_id not in duplicates:
                    duplicates.append(order_id)
                seen.add(order_id)
                if order["status"].lower() == "paid":
                    paid_orders.append(order)
                    service = order["service"]
                    service_totals[service] = service_totals.get(service, 0) + order["amount"]

            gross = sum(order["amount"] for order in paid_orders)
            if service_totals:
                top_service = sorted(service_totals.items(), key=lambda item: (-item[1], item[0]))[0][0]
            else:
                top_service = None
            return {
                "paidCount": len(paid_orders),
                "gross": gross,
                "duplicateIds": duplicates,
                "serviceTotals": service_totals,
                "topService": top_service,
            }
      hints:
      - 중복 탐지는 paid 여부와 별개로 전체 orders 기준으로 하세요.
      - serviceTotals가 비어 있으면 topService는 None이어야 합니다.
    check:
      id: python.advanced.integrated-problem.order-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.integrated-problem.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: build_order_operations_report
        cases:
        - id: summarizes-paid-orders-and-duplicates
          arguments:
          - value:
            - id: O-1
              status: paid
              amount: 120
              service: checkout
            - id: O-2
              status: draft
              amount: 50
              service: catalog
            - id: O-1
              status: paid
              amount: 30
              service: checkout
            - id: O-3
              status: PAID
              amount: 70
              service: billing
          expectedReturn:
            paidCount: 3
            gross: 220
            duplicateIds:
            - O-1
            serviceTotals:
              checkout: 150
              billing: 70
            topService: checkout
        - id: handles-no-paid-orders
          arguments:
          - value:
            - id: O-9
              status: draft
              amount: 10
              service: catalog
          expectedReturn:
            paidCount: 0
            gross: 0
            duplicateIds: []
            serviceTotals: {}
            topService: null
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 30_integrated_problem-support-triage-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - design-pattern-integration
    - string-regex-integration
    - optimization-dp
    title: 지원 티켓을 우선순위와 키워드로 triage하기
    subtitle: integrated support triage
    goal: triage_support_tickets(tickets)를 완성해 우선순위 정렬, refund 키워드 탐지, 첫 행동을 반환한다.
    why: 주문 리포트에서 배운 통합 흐름을 지원 운영 데이터로 옮기면, 정렬, 문자열 처리, 정책 분리를 한 문제 안에서 적용하는 전이를 확인할 수 있습니다.
    explanation: high, normal, low 순서와 createdAt 오름차순으로 정렬합니다. text에 refund가 포함된 티켓은 refundIds로 모으고, 첫 티켓의 action을 decide-refund
      또는 reply로 정하세요.
    tips:
    - priority rank dict를 두면 정렬 기준을 데이터로 분리할 수 있습니다.
    - 문자열 키워드는 lower로 정규화한 뒤 찾으세요.
    exercise:
      prompt: triage_support_tickets(tickets)를 완성해 orderedIds, refundIds, firstAction을 반환하세요.
      starterCode: |-
        def triage_support_tickets(tickets):
            raise NotImplementedError
      solution: |-
        def triage_support_tickets(tickets):
            priority_rank = {"high": 0, "normal": 1, "low": 2}
            ordered = sorted(
                tickets,
                key=lambda ticket: (priority_rank[ticket["priority"]], ticket["createdAt"], ticket["id"]),
            )
            refund_ids = [
                ticket["id"]
                for ticket in ordered
                if "refund" in ticket["text"].lower()
            ]
            if not ordered:
                first_action = None
            elif ordered[0]["id"] in refund_ids:
                first_action = "decide-refund"
            else:
                first_action = "reply"
            return {
                "orderedIds": [ticket["id"] for ticket in ordered],
                "refundIds": refund_ids,
                "firstAction": first_action,
            }
      hints:
      - sorted key 안에서 priority rank와 createdAt을 함께 비교하세요.
      - firstAction은 정렬된 첫 티켓 기준으로 결정해야 합니다.
    check:
      id: python.advanced.integrated-problem.support-triage.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.integrated-problem.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: triage_support_tickets
        cases:
        - id: prioritizes-and-tags-refund-tickets
          arguments:
          - value:
            - id: T-2
              priority: normal
              createdAt: 09:10
              text: Need refund for order
            - id: T-1
              priority: high
              createdAt: 09:20
              text: Checkout failed
            - id: T-3
              priority: high
              createdAt: 09:00
              text: Refund not received
          expectedReturn:
            orderedIds:
            - T-3
            - T-1
            - T-2
            refundIds:
            - T-3
            - T-2
            firstAction: decide-refund
        - id: handles-empty-ticket-list
          arguments:
          - value: []
          expectedReturn:
            orderedIds: []
            refundIds: []
            firstAction: null
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 30_integrated_problem-plan-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 30_integrated_problem-support-triage-transfer
    title: 종합 문제 접근 전략 회상하기
    subtitle: integrated problem strategy recall
    goal: choose_integration_plan(problem)를 완성해 종합 문제 유형별 핵심 도구 조합과 위험을 반환한다.
    why: 종합 문제를 잘 푸는 능력은 모든 개념을 한 번에 쓰는 것이 아니라, 문제의 데이터 흐름과 변경 지점에 맞는 최소 조합을 고르는 능력입니다.
    explanation: order-report, plugin-system, log-parser, async-scheduler, optimized-search 상황별 계획을 반환하세요.
    tips:
    - 먼저 입력, 변환, 상태, 출력 증거를 나누고 필요한 개념만 붙이세요.
    - 통합 문제에서는 각 단계의 중간 결과가 디버깅 단서입니다.
    exercise:
      prompt: choose_integration_plan(problem)를 완성해 tools, proof, risk를 반환하세요.
      starterCode: |-
        def choose_integration_plan(problem):
            raise NotImplementedError
      solution: |-
        def choose_integration_plan(problem):
            table = {
                "order-report": {
                    "tools": ["dict-aggregation", "stable-sort", "pure-pipeline"],
                    "proof": "totals, duplicate ids, and top group are asserted",
                    "risk": "mixing draft and paid records can inflate totals",
                },
                "plugin-system": {
                    "tools": ["factory", "registry", "descriptor-or-config-validation"],
                    "proof": "unknown plugin and duplicate key cases fail clearly",
                    "risk": "dynamic loading can hide broken contracts",
                },
                "log-parser": {
                    "tools": ["regex-named-groups", "string-normalization", "error-bucket"],
                    "proof": "valid rows and invalid rows are both counted",
                    "risk": "partial matches can create false records",
                },
                "async-scheduler": {
                    "tools": ["queue", "state-machine", "timeout-policy"],
                    "proof": "order, retry, and failure states are observable",
                    "risk": "hidden concurrency can make tests flaky",
                },
                "optimized-search": {
                    "tools": ["index", "cache", "complexity-check"],
                    "proof": "same result with fewer repeated scans",
                    "risk": "stale index returns old data",
                },
            }
            if problem not in table:
                raise ValueError("unknown integrated problem")
            return table[problem]
      hints:
      - tools는 많이 쓰는 것이 아니라 필요한 조합만 적으세요.
      - proof와 risk를 함께 말해야 설계가 학습 증거가 됩니다.
    check:
      id: python.advanced.integrated-problem.plan-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.integrated-problem.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_integration_plan
        cases:
        - id: recalls-order-report-tool-combination
          arguments:
          - value: order-report
          expectedReturn:
            tools:
            - dict-aggregation
            - stable-sort
            - pure-pipeline
            proof: totals, duplicate ids, and top group are asserted
            risk: mixing draft and paid records can inflate totals
        - id: recalls-log-parser-proof
          arguments:
          - value: log-parser
          expectedReturn:
            tools:
            - regex-named-groups
            - string-normalization
            - error-bucket
            proof: valid rows and invalid rows are both counted
            risk: partial matches can create false records
        - id: rejects-unknown-problem
          arguments:
          - value: everything-app
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};