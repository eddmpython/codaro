var e=`meta:\r
  id: '30'\r
  title: 종합 문제 풀이\r
  day: 30\r
  category: advancedPython\r
  tags:\r
  - 종합\r
  - 실전\r
  - 알고리즘\r
  - 자료구조\r
  - 디자인패턴\r
  - 최적화\r
  - 검증\r
  - 통합프로젝트\r
  seo:\r
    title: 파이썬 종합 문제 풀이\r
    description: 30일간 학습한 고급 파이썬 개념을 종합적으로 활용하는 실전 문제 풀이\r
    keywords:\r
    - 종합\r
    - 실전\r
    - 알고리즘\r
    - 자료구조\r
    - 디자인패턴\r
    - 최적화\r
intro:\r
  emoji: 🎯\r
  points:\r
  - 알고리즘 + 자료구조 통합 문제\r
  - 디자인패턴 적용 실전 문제\r
  - 최적화 및 리팩토링 종합 문제\r
  - 함수형 + 객체지향 혼합 문제\r
  - 메타프로그래밍 활용 문제\r
  - 정규표현식 + 문자열 알고리즘 통합\r
  direction: 종합 문제 풀이에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 종합 문제 풀이 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 자료구조 + 알고리즘 통합 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 디자인패턴 통합 적용 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 함수형 + 객체지향 통합 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 종합 문제 풀이 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합 문제 풀이 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 종합 문제 풀이 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: data-structure-algorithm\r
  title: 자료구조 + 알고리즘 통합\r
  structuredPrimary: true\r
  subtitle: LRU 캐시 with TTL\r
  goal: 자료구조 + 알고리즘 통합에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 해시맵과 이중 연결 리스트를 결합하여 시간 제한 기능이 있는 LRU 캐시를 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from time import time as getTime\r
\r
    class CacheNode:\r
        def __init__(self, key, value, ttl):\r
            self.key = key\r
            self.value = value\r
            self.expiry = getTime() + ttl\r
            self.prev = None\r
            self.next = None\r
\r
    class LRUCacheWithTTL:\r
        def __init__(self, capacity, defaultTtl=60):\r
            self.capacity = capacity\r
            self.defaultTtl = defaultTtl\r
            self.cache = {}\r
            self.head = CacheNode(None, None, 0)\r
            self.tail = CacheNode(None, None, 0)\r
            self.head.next = self.tail\r
            self.tail.prev = self.head\r
\r
        def removeNode(self, node):\r
            node.prev.next = node.next\r
            node.next.prev = node.prev\r
\r
        def addToFront(self, node):\r
            node.next = self.head.next\r
            node.prev = self.head\r
            self.head.next.prev = node\r
            self.head.next = node\r
\r
        def get(self, key):\r
            if key not in self.cache:\r
                return None\r
            node = self.cache[key]\r
            if getTime() > node.expiry:\r
                self.removeNode(node)\r
                del self.cache[key]\r
                return None\r
            self.removeNode(node)\r
            self.addToFront(node)\r
            return node.value\r
\r
        def put(self, key, value, ttl=None):\r
            ttl = ttl or self.defaultTtl\r
            if key in self.cache:\r
                self.removeNode(self.cache[key])\r
            node = CacheNode(key, value, ttl)\r
            self.cache[key] = node\r
            self.addToFront(node)\r
            if len(self.cache) > self.capacity:\r
                lru = self.tail.prev\r
                self.removeNode(lru)\r
                del self.cache[lru.key]\r
\r
    lruCache = LRUCacheWithTTL(3, defaultTtl=10)\r
    lruCache.put("a", 1)\r
    lruCache.put("b", 2)\r
    lruCache.put("c", 3)\r
    lruCache.get("a")\r
    lruCache.put("d", 4)\r
    [lruCache.get(k) for k in ["a", "b", "c", "d"]]\r
  exercise:\r
    prompt: 자료구조 + 알고리즘 통합 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from time import time as getTime\r
\r
      class CacheNode:\r
          def __init__(self, key, value, ttl):\r
              self.key = key\r
              self.value = value\r
              self.expiry = getTime() + ttl\r
              self.prev = None\r
              self.next = None\r
\r
      class LRUCacheWithTTL:\r
          def __init__(self, capacity, defaultTtl=60):\r
              self.capacity = capacity\r
              self.defaultTtl = defaultTtl\r
              self.cache = {}\r
              self.head = CacheNode(None, None, 0)\r
              self.tail = CacheNode(None, None, 0)\r
              self.head.next = self.tail\r
              self.tail.prev = self.head\r
\r
          def removeNode(self, node):\r
              node.prev.next = node.next\r
              node.next.prev = node.prev\r
\r
          def addToFront(self, node):\r
              node.next = self.head.next\r
              node.prev = self.head\r
              self.head.next.prev = node\r
              self.head.next = node\r
\r
          def get(self, key):\r
              if key not in self.cache:\r
                  return None\r
              node = self.cache[key]\r
              if getTime() > node.expiry:\r
                  self.removeNode(node)\r
                  del self.cache[key]\r
                  return None\r
              self.removeNode(node)\r
              self.addToFront(node)\r
              return node.value\r
\r
          def put(self, key, value, ttl=None):\r
              ttl = ttl or self.defaultTtl\r
              if key in self.cache:\r
                  self.removeNode(self.cache[key])\r
              node = CacheNode(key, value, ttl)\r
              self.cache[key] = node\r
              self.addToFront(node)\r
              if len(self.cache) > self.capacity:\r
                  lru = self.tail.prev\r
                  self.removeNode(lru)\r
                  del self.cache[lru.key]\r
\r
      lruCache = LRUCacheWithTTL(3, defaultTtl=10)\r
      lruCache.put("a", 1)\r
      lruCache.put("b", 2)\r
      lruCache.put("c", 3)\r
      lruCache.get("a")\r
      lruCache.put("d", 4)\r
      [lruCache.get(k) for k in ["a", "b", "c", "d"]]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 자료구조 + 알고리즘 통합의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 자료구조 + 알고리즘 통합 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: design-pattern-integration\r
  title: 디자인패턴 통합 적용\r
  structuredPrimary: true\r
  subtitle: 이벤트 기반 상태 머신\r
  goal: 디자인패턴 통합 적용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Observer, State, Command 패턴을 결합한 이벤트 기반 상태 머신을 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class EventObserver(ABC):\r
        @abstractmethod\r
        def onEvent(self, event, data):\r
            pass\r
\r
    class MachineState(ABC):\r
        @abstractmethod\r
        def handle(self, machine, event):\r
            pass\r
\r
    class IdleState(MachineState):\r
        def handle(self, machine, event):\r
            if event == "start":\r
                machine.transition(RunningState())\r
                return "started"\r
            return "idle"\r
\r
    class RunningState(MachineState):\r
        def handle(self, machine, event):\r
            if event == "pause":\r
                machine.transition(PausedState())\r
                return "paused"\r
            if event == "stop":\r
                machine.transition(IdleState())\r
                return "stopped"\r
            return "running"\r
\r
    class PausedState(MachineState):\r
        def handle(self, machine, event):\r
            if event == "resume":\r
                machine.transition(RunningState())\r
                return "resumed"\r
            if event == "stop":\r
                machine.transition(IdleState())\r
                return "stopped"\r
            return "paused"\r
\r
    class StateMachine:\r
        def __init__(self):\r
            self.state = IdleState()\r
            self.observers = []\r
            self.history = []\r
\r
        def addObserver(self, observer):\r
            self.observers.append(observer)\r
\r
        def notify(self, event, result):\r
            for obs in self.observers:\r
                obs.onEvent(event, result)\r
\r
        def transition(self, newState):\r
            self.state = newState\r
\r
        def dispatch(self, event):\r
            result = self.state.handle(self, event)\r
            self.history.append((event, result))\r
            self.notify(event, result)\r
            return result\r
\r
    class LogObserver(EventObserver):\r
        def __init__(self):\r
            self.logs = []\r
        def onEvent(self, event, data):\r
            self.logs.append(f"{event}: {data}")\r
\r
    fsm = StateMachine()\r
    logger = LogObserver()\r
    fsm.addObserver(logger)\r
    fsm.dispatch("start")\r
    fsm.dispatch("pause")\r
    fsm.dispatch("resume")\r
    fsm.dispatch("stop")\r
    logger.logs\r
  exercise:\r
    prompt: 디자인패턴 통합 적용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class EventObserver(ABC):\r
          @abstractmethod\r
          def onEvent(self, event, data):\r
              pass\r
\r
      class MachineState(ABC):\r
          @abstractmethod\r
          def handle(self, machine, event):\r
              pass\r
\r
      class IdleState(MachineState):\r
          def handle(self, machine, event):\r
              if event == "start":\r
                  machine.transition(RunningState())\r
                  return "started"\r
              return "idle"\r
\r
      class RunningState(MachineState):\r
          def handle(self, machine, event):\r
              if event == "pause":\r
                  machine.transition(PausedState())\r
                  return "paused"\r
              if event == "stop":\r
                  machine.transition(IdleState())\r
                  return "stopped"\r
              return "running"\r
\r
      class PausedState(MachineState):\r
          def handle(self, machine, event):\r
              if event == "resume":\r
                  machine.transition(RunningState())\r
                  return "resumed"\r
              if event == "stop":\r
                  machine.transition(IdleState())\r
                  return "stopped"\r
              return "paused"\r
\r
      class StateMachine:\r
          def __init__(self):\r
              self.state = IdleState()\r
              self.observers = []\r
              self.history = []\r
\r
          def addObserver(self, observer):\r
              self.observers.append(observer)\r
\r
          def notify(self, event, result):\r
              for obs in self.observers:\r
                  obs.onEvent(event, result)\r
\r
          def transition(self, newState):\r
              self.state = newState\r
\r
          def dispatch(self, event):\r
              result = self.state.handle(self, event)\r
              self.history.append((event, result))\r
              self.notify(event, result)\r
              return result\r
\r
      class LogObserver(EventObserver):\r
          def __init__(self):\r
              self.logs = []\r
          def onEvent(self, event, data):\r
              self.logs.append(f"{event}: {data}")\r
\r
      fsm = StateMachine()\r
      logger = LogObserver()\r
      fsm.addObserver(logger)\r
      fsm.dispatch("start")\r
      fsm.dispatch("pause")\r
      fsm.dispatch("resume")\r
      fsm.dispatch("stop")\r
      logger.logs\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디자인패턴 통합 적용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 디자인패턴 통합 적용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: functional-oop-integration\r
  title: 함수형 + 객체지향 통합\r
  structuredPrimary: true\r
  subtitle: 파이프라인 빌더\r
  goal: 함수형 + 객체지향 통합에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 함수형 파이프라인을 객체지향 빌더 패턴으로 구성하여 유연한 데이터 처리 시스템을 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from functools import reduce\r
\r
    class Pipeline:\r
        def __init__(self):\r
            self.steps = []\r
\r
        def pipe(self, func):\r
            self.steps.append(func)\r
            return self\r
\r
        def filter(self, predicate):\r
            return self.pipe(lambda data: [x for x in data if predicate(x)])\r
\r
        def map(self, transform):\r
            return self.pipe(lambda data: [transform(x) for x in data])\r
\r
        def reduce(self, reducer, initial):\r
            return self.pipe(lambda data: reduce(reducer, data, initial))\r
\r
        def sort(self, key=None, reverse=False):\r
            return self.pipe(lambda data: sorted(data, key=key, reverse=reverse))\r
\r
        def take(self, n):\r
            return self.pipe(lambda data: data[:n])\r
\r
        def execute(self, data):\r
            result = data\r
            for step in self.steps:\r
                result = step(result)\r
            return result\r
\r
    sampleData = [\r
        {"name": "Alice", "score": 85, "age": 22},\r
        {"name": "Bob", "score": 92, "age": 25},\r
        {"name": "Charlie", "score": 78, "age": 23},\r
        {"name": "Diana", "score": 95, "age": 21},\r
        {"name": "Eve", "score": 88, "age": 24}\r
    ]\r
\r
    pipeline = (Pipeline()\r
        .filter(lambda x: x["score"] >= 80)\r
        .map(lambda x: {**x, "grade": "A" if x["score"] >= 90 else "B"})\r
        .sort(key=lambda x: x["score"], reverse=True)\r
        .take(3))\r
\r
    pipelineResult = pipeline.execute(sampleData)\r
    pipelineResult\r
  exercise:\r
    prompt: 함수형 + 객체지향 통합 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import reduce\r
\r
      class Pipeline:\r
          def __init__(self):\r
              self.steps = []\r
\r
          def pipe(self, func):\r
              self.steps.append(func)\r
              return self\r
\r
          def filter(self, predicate):\r
              return self.pipe(lambda data: [x for x in data if predicate(x)])\r
\r
          def map(self, transform):\r
              return self.pipe(lambda data: [transform(x) for x in data])\r
\r
          def reduce(self, reducer, initial):\r
              return self.pipe(lambda data: reduce(reducer, data, initial))\r
\r
          def sort(self, key=None, reverse=False):\r
              return self.pipe(lambda data: sorted(data, key=key, reverse=reverse))\r
\r
          def take(self, n):\r
              return self.pipe(lambda data: data[:n])\r
\r
          def execute(self, data):\r
              result = data\r
              for step in self.steps:\r
                  result = step(result)\r
              return result\r
\r
      sampleData = [\r
          {"name": "Alice", "score": 85, "age": 22},\r
          {"name": "Bob", "score": 92, "age": 25},\r
          {"name": "Charlie", "score": 78, "age": 23},\r
          {"name": "Diana", "score": 95, "age": 21},\r
          {"name": "Eve", "score": 88, "age": 24}\r
      ]\r
\r
      pipeline = (Pipeline()\r
          .filter(lambda x: x["score"] >= 80)\r
          .map(lambda x: {**x, "grade": "A" if x["score"] >= 90 else "B"})\r
          .sort(key=lambda x: x["score"], reverse=True)\r
          .take(3))\r
\r
      pipelineResult = pipeline.execute(sampleData)\r
      pipelineResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 함수형 + 객체지향 통합의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 함수형 + 객체지향 통합 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: metaprogramming-practice\r
  title: 메타프로그래밍 실전\r
  structuredPrimary: true\r
  subtitle: 자동 검증 데이터 클래스\r
  goal: 메타프로그래밍 실전에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 메타클래스와 디스크립터를 활용하여 자동 타입 검증 기능이 있는 데이터 클래스를 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TypedField:\r
        def __init__(self, fieldType, validator=None):\r
            self.fieldType = fieldType\r
            self.validator = validator\r
\r
        def __set_name__(self, owner, name):\r
            self.name = name\r
            self.privateName = f"_{name}"\r
\r
        def __get__(self, obj, objtype=None):\r
            if obj is None:\r
                return self\r
            return getattr(obj, self.privateName, None)\r
\r
        def __set__(self, obj, value):\r
            if not isinstance(value, self.fieldType):\r
                raise TypeError(f"{self.name}: expected {self.fieldType.__name__}")\r
            if self.validator and not self.validator(value):\r
                raise ValueError(f"{self.name}: validation failed")\r
            setattr(obj, self.privateName, value)\r
\r
    class ValidatedMeta(type):\r
        def __new__(mcs, name, bases, namespace):\r
            fields = {k: v for k, v in namespace.items()\r
                     if isinstance(v, TypedField)}\r
            namespace["_fields"] = fields\r
            return super().__new__(mcs, name, bases, namespace)\r
\r
    class ValidatedModel(metaclass=ValidatedMeta):\r
        def __init__(self, **kwargs):\r
            for field in self._fields:\r
                if field in kwargs:\r
                    setattr(self, field, kwargs[field])\r
\r
        def toDict(self):\r
            return {f: getattr(self, f) for f in self._fields}\r
\r
    class UserModel(ValidatedModel):\r
        username = TypedField(str, lambda x: len(x) >= 3)\r
        age = TypedField(int, lambda x: 0 < x < 150)\r
        email = TypedField(str, lambda x: "@" in x)\r
\r
    validUser = UserModel(username="alice", age=25, email="alice@test.com")\r
    validUser.toDict()\r
  exercise:\r
    prompt: 메타프로그래밍 실전 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TypedField:\r
          def __init__(self, fieldType, validator=None):\r
              self.fieldType = fieldType\r
              self.validator = validator\r
\r
          def __set_name__(self, owner, name):\r
              self.name = name\r
              self.privateName = f"_{name}"\r
\r
          def __get__(self, obj, objtype=None):\r
              if obj is None:\r
                  return self\r
              return getattr(obj, self.privateName, None)\r
\r
          def __set__(self, obj, value):\r
              if not isinstance(value, self.fieldType):\r
                  raise TypeError(f"{self.name}: expected {self.fieldType.__name__}")\r
              if self.validator and not self.validator(value):\r
                  raise ValueError(f"{self.name}: validation failed")\r
              setattr(obj, self.privateName, value)\r
\r
      class ValidatedMeta(type):\r
          def __new__(mcs, name, bases, namespace):\r
              fields = {k: v for k, v in namespace.items()\r
                       if isinstance(v, TypedField)}\r
              namespace["_fields"] = fields\r
              return super().__new__(mcs, name, bases, namespace)\r
\r
      class ValidatedModel(metaclass=ValidatedMeta):\r
          def __init__(self, **kwargs):\r
              for field in self._fields:\r
                  if field in kwargs:\r
                      setattr(self, field, kwargs[field])\r
\r
          def toDict(self):\r
              return {f: getattr(self, f) for f in self._fields}\r
\r
      class UserModel(ValidatedModel):\r
          username = TypedField(str, lambda x: len(x) >= 3)\r
          age = TypedField(int, lambda x: 0 < x < 150)\r
          email = TypedField(str, lambda x: "@" in x)\r
\r
      validUser = UserModel(username="alice", age=25, email="alice@test.com")\r
      validUser.toDict()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메타프로그래밍 실전의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메타프로그래밍 실전 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: string-regex-integration\r
  title: 문자열 알고리즘 + 정규표현식\r
  structuredPrimary: true\r
  subtitle: 고급 텍스트 검색 엔진\r
  goal: Trie 자료구조와 정규표현식을 결합해 단어/접두사 검색이 모두 가능한 작은 검색 엔진을 만든다.\r
  why: 문자열 검색은 자료구조 선택이 곧 성능을 결정합니다. Trie는 접두사 검색에 O(L), 정규식 토크나이저는 입력 정규화에 강해 둘을 결합하면 짧은 코드로 실용적인 엔진이 됩니다.\r
  explanation: SearchEngine은 (1) regex로 입력 텍스트를 단어 단위로 토큰화하고 (2) 각 단어를 Trie에 삽입해 doc id를 누적합니다. 단어 정확 검색은 search, 접두사 검색은 searchPrefix가 처리합니다. Trie 노드 한 개당 자식 dict와 isEnd 플래그, 그 단어로 끝나는 문서 id 집합이 들어 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    class TrieNode:\r
        def __init__(self):\r
            self.children = {}\r
            self.isEnd = False\r
            self.docIds = set()\r
\r
    class SearchEngine:\r
        def __init__(self):\r
            self.root = TrieNode()\r
            self.documents = {}\r
            self.docId = 0\r
\r
        def tokenize(self, text):\r
            return re.findall(r'\\b[a-zA-Z]+\\b', text.lower())\r
\r
        def addDocument(self, text):\r
            self.docId += 1\r
            self.documents[self.docId] = text\r
            for word in self.tokenize(text):\r
                self.insertWord(word, self.docId)\r
            return self.docId\r
\r
        def insertWord(self, word, docId):\r
            node = self.root\r
            for char in word:\r
                if char not in node.children:\r
                    node.children[char] = TrieNode()\r
                node = node.children[char]\r
            node.isEnd = True\r
            node.docIds.add(docId)\r
\r
        def searchWord(self, word):\r
            node = self.root\r
            for char in word.lower():\r
                if char not in node.children:\r
                    return set()\r
                node = node.children[char]\r
            return node.docIds if node.isEnd else set()\r
\r
        def searchPrefix(self, prefix):\r
            node = self.root\r
            for char in prefix.lower():\r
                if char not in node.children:\r
                    return set()\r
                node = node.children[char]\r
            return self.collectDocs(node)\r
\r
        def collectDocs(self, node):\r
            docs = set(node.docIds)\r
            for child in node.children.values():\r
                docs |= self.collectDocs(child)\r
            return docs\r
\r
        def searchRegex(self, pattern):\r
            regex = re.compile(pattern, re.IGNORECASE)\r
            return {docId for docId, text in self.documents.items()\r
                   if regex.search(text)}\r
\r
    searchEngine = SearchEngine()\r
    searchEngine.addDocument("Python is a powerful programming language")\r
    searchEngine.addDocument("Python supports functional programming")\r
    searchEngine.addDocument("JavaScript is also popular for programming")\r
    searchEngine.addDocument("Data structures are fundamental in programming")\r
\r
    wordResult = searchEngine.searchWord("python")\r
    prefixResult = searchEngine.searchPrefix("prog")\r
    regexResult = searchEngine.searchRegex(r"python.*programming")\r
    {"word": wordResult, "prefix": prefixResult, "regex": regexResult}\r
  exercise:\r
    prompt: 문자열 알고리즘 + 정규표현식 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      class TrieNode:\r
          def __init__(self):\r
              self.children = {}\r
              self.isEnd = False\r
              self.docIds = set()\r
\r
      class SearchEngine:\r
          def __init__(self):\r
              self.root = TrieNode()\r
              self.documents = {}\r
              self.docId = 0\r
\r
          def tokenize(self, text):\r
              return re.findall(r'\\b[a-zA-Z]+\\b', text.lower())\r
\r
          def addDocument(self, text):\r
              self.docId += 1\r
              self.documents[self.docId] = text\r
              for word in self.tokenize(text):\r
                  self.insertWord(word, self.docId)\r
              return self.docId\r
\r
          def insertWord(self, word, docId):\r
              node = self.root\r
              for char in word:\r
                  if char not in node.children:\r
                      node.children[char] = TrieNode()\r
                  node = node.children[char]\r
              node.isEnd = True\r
              node.docIds.add(docId)\r
\r
          def searchWord(self, word):\r
              node = self.root\r
              for char in word.lower():\r
                  if char not in node.children:\r
                      return set()\r
                  node = node.children[char]\r
              return node.docIds if node.isEnd else set()\r
\r
          def searchPrefix(self, prefix):\r
              node = self.root\r
              for char in prefix.lower():\r
                  if char not in node.children:\r
                      return set()\r
                  node = node.children[char]\r
              return self.collectDocs(node)\r
\r
          def collectDocs(self, node):\r
              docs = set(node.docIds)\r
              for child in node.children.values():\r
                  docs |= self.collectDocs(child)\r
              return docs\r
\r
          def searchRegex(self, pattern):\r
              regex = re.compile(pattern, re.IGNORECASE)\r
              return {docId for docId, text in self.documents.items()\r
                     if regex.search(text)}\r
\r
      searchEngine = SearchEngine()\r
      searchEngine.addDocument("Python is a powerful programming language")\r
      searchEngine.addDocument("Python supports functional programming")\r
      searchEngine.addDocument("JavaScript is also popular for programming")\r
      searchEngine.addDocument("Data structures are fundamental in programming")\r
\r
      wordResult = searchEngine.searchWord("python")\r
      prefixResult = searchEngine.searchPrefix("prog")\r
      regexResult = searchEngine.searchRegex(r"python.*programming")\r
      {"word": wordResult, "prefix": prefixResult, "regex": regexResult}\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 문자열 알고리즘 + 정규표현식의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.\r
    resultCheck: 문자열 알고리즘 + 정규표현식 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: optimization-dp\r
  title: 최적화 + 동적 프로그래밍\r
  structuredPrimary: true\r
  subtitle: 메모이제이션 데코레이터 고급 버전\r
  goal: 최적화 + 동적 프로그래밍에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: LRU 기반 메모이제이션에 통계 추적 기능을 추가한 고급 캐싱 데코레이터를 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from functools import wraps\r
    from collections import OrderedDict\r
\r
    def advancedMemo(maxSize=128, trackStats=True):\r
        def decorator(func):\r
            cache = OrderedDict()\r
            stats = {"hits": 0, "misses": 0, "evictions": 0}\r
\r
            @wraps(func)\r
            def wrapper(*args, **kwargs):\r
                key = (args, tuple(sorted(kwargs.items())))\r
                if key in cache:\r
                    cache.move_to_end(key)\r
                    stats["hits"] += 1\r
                    return cache[key]\r
\r
                stats["misses"] += 1\r
                result = func(*args, **kwargs)\r
                cache[key] = result\r
\r
                if len(cache) > maxSize:\r
                    cache.popitem(last=False)\r
                    stats["evictions"] += 1\r
\r
                return result\r
\r
            def getStats():\r
                total = stats["hits"] + stats["misses"]\r
                hitRate = stats["hits"] / total if total > 0 else 0\r
                return {**stats, "hitRate": f"{hitRate:.2%}"}\r
\r
            def clearCache():\r
                cache.clear()\r
                stats.update({"hits": 0, "misses": 0, "evictions": 0})\r
\r
            wrapper.stats = getStats\r
            wrapper.clear = clearCache\r
            return wrapper\r
        return decorator\r
\r
    @advancedMemo(maxSize=50)\r
    def fibonacci(n):\r
        if n < 2:\r
            return n\r
        return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
    fibResult = [fibonacci(i) for i in range(30)]\r
    fibStats = fibonacci.stats()\r
    {"fib30": fibResult[-1], "stats": fibStats}\r
  exercise:\r
    prompt: 최적화 + 동적 프로그래밍 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import wraps\r
      from collections import OrderedDict\r
\r
      def advancedMemo(maxSize=128, trackStats=True):\r
          def decorator(func):\r
              cache = OrderedDict()\r
              stats = {"hits": 0, "misses": 0, "evictions": 0}\r
\r
              @wraps(func)\r
              def wrapper(*args, **kwargs):\r
                  key = (args, tuple(sorted(kwargs.items())))\r
                  if key in cache:\r
                      cache.move_to_end(key)\r
                      stats["hits"] += 1\r
                      return cache[key]\r
\r
                  stats["misses"] += 1\r
                  result = func(*args, **kwargs)\r
                  cache[key] = result\r
\r
                  if len(cache) > maxSize:\r
                      cache.popitem(last=False)\r
                      stats["evictions"] += 1\r
\r
                  return result\r
\r
              def getStats():\r
                  total = stats["hits"] + stats["misses"]\r
                  hitRate = stats["hits"] / total if total > 0 else 0\r
                  return {**stats, "hitRate": f"{hitRate:.2%}"}\r
\r
              def clearCache():\r
                  cache.clear()\r
                  stats.update({"hits": 0, "misses": 0, "evictions": 0})\r
\r
              wrapper.stats = getStats\r
              wrapper.clear = clearCache\r
              return wrapper\r
          return decorator\r
\r
      @advancedMemo(maxSize=50)\r
      def fibonacci(n):\r
          if n < 2:\r
              return n\r
          return fibonacci(n - 1) + fibonacci(n - 2)\r
\r
      fibResult = [fibonacci(i) for i in range(30)]\r
      fibStats = fibonacci.stats()\r
      {"fib30": fibResult[-1], "stats": fibStats}\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 최적화 + 동적 프로그래밍의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 최적화 + 동적 프로그래밍 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트'\r
  structuredPrimary: true\r
  subtitle: 정규식, 자료구조, 정렬, 집계를 하나의 검증 가능한 문제로 연결\r
  goal: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    종합 문제는 여러 개념을 나열하는 데서 끝나면 약합니다. 로그를 파싱하고, 실패 주문을 우선순위 큐로 정리하고, 결제 합계를 집계하는 작은 운영 리포트를 완성해보세요.\r
\r
    마지막 실험으로 실패 주문을 고객별로 묶고, 금액이 큰 순서와 장애 심각도 순서가 서로 다를 때 어떤 리포트가 더 업무에 맞는지 비교하세요.\r
  snippet: |-\r
    import heapq\r
    import re\r
\r
    logPattern = re.compile(\r
        r"(?P<timestamp>\\d{2}:\\d{2}) "\r
        r"(?P<level>INFO|WARN|ERROR) "\r
        r"order=(?P<orderId>O-\\d+) "\r
        r"status=(?P<status>paid|failed|draft) "\r
        r"amount=(?P<amount>\\d+)"\r
    )\r
\r
    severityRank = {"ERROR": 0, "WARN": 1, "INFO": 2}\r
\r
    def parseLine(line):\r
        match = logPattern.fullmatch(line)\r
        if match is None:\r
            raise ValueError("invalid operation log")\r
        event = match.groupdict()\r
        event["amount"] = int(event["amount"])\r
        return event\r
\r
    def buildOperationReport(lines):\r
        events = [parseLine(line) for line in lines]\r
        paidTotal = sum(event["amount"] for event in events if event["status"] == "paid")\r
        incidentHeap = []\r
        for event in events:\r
            if event["status"] == "failed":\r
                heapq.heappush(\r
                    incidentHeap,\r
                    (severityRank[event["level"]], event["timestamp"], event["orderId"]),\r
                )\r
        firstIncident = heapq.heappop(incidentHeap)[2] if incidentHeap else None\r
        return {\r
            "paidTotal": paidTotal,\r
            "eventCount": len(events),\r
            "firstIncident": firstIncident,\r
        }\r
\r
    logs = [\r
        "09:00 INFO order=O-100 status=paid amount=12000",\r
        "09:03 WARN order=O-101 status=failed amount=8000",\r
        "09:04 ERROR order=O-102 status=failed amount=15000",\r
        "09:05 INFO order=O-103 status=draft amount=3000",\r
    ]\r
\r
    report = buildOperationReport(logs)\r
\r
    assert report == {\r
        "paidTotal": 12000,\r
        "eventCount": 4,\r
        "firstIncident": "O-102",\r
    }\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import heapq\r
      import re\r
\r
      logPattern = re.compile(\r
          r"(?P<timestamp>\\d{2}:\\d{2}) "\r
          r"(?P<level>INFO|WARN|ERROR) "\r
          r"order=(?P<orderId>O-\\d+) "\r
          r"status=(?P<status>paid|failed|draft) "\r
          r"amount=(?P<amount>\\d+)"\r
      )\r
\r
      severityRank = {"ERROR": 0, "WARN": 1, "INFO": 2}\r
\r
      def parseLine(line):\r
          match = logPattern.fullmatch(line)\r
          if match is None:\r
              raise ValueError("invalid operation log")\r
          event = match.groupdict()\r
          event["amount"] = int(event["amount"])\r
          return event\r
\r
      def buildOperationReport(lines):\r
          events = [parseLine(line) for line in lines]\r
          paidTotal = sum(event["amount"] for event in events if event["status"] == "paid")\r
          incidentHeap = []\r
          for event in events:\r
              if event["status"] == "failed":\r
                  heapq.heappush(\r
                      incidentHeap,\r
                      (severityRank[event["level"]], event["timestamp"], event["orderId"]),\r
                  )\r
          firstIncident = heapq.heappop(incidentHeap)[2] if incidentHeap else None\r
          return {\r
              "paidTotal": paidTotal,\r
              "eventCount": len(events),\r
              "firstIncident": firstIncident,\r
          }\r
\r
      logs = [\r
          "09:00 INFO order=O-100 status=paid amount=12000",\r
          "09:03 WARN order=O-101 status=failed amount=8000",\r
          "09:04 ERROR order=O-102 status=failed amount=15000",\r
          "09:05 INFO order=O-103 status=draft amount=3000",\r
      ]\r
\r
      report = buildOperationReport(logs)\r
\r
      assert report == {\r
          "paidTotal": 12000,\r
          "eventCount": 4,\r
          "firstIncident": "O-102",\r
      }\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 운영 리포트 미니 프로젝트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice-exercises\r
  title: 종합 실습 문제\r
  structuredPrimary: true\r
  subtitle: 30일 과정 종합 문제\r
  goal: 종합 실습 문제에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 지금까지 학습한 모든 개념을 활용하여 문제를 해결하세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    EXERCISES = """\r
    기초 종합 (1-5)\r
    1. 스택 2개로 큐 구현 (자료구조)\r
    2. 싱글톤 + 팩토리 조합 (패턴)\r
    3. 고차함수로 유효성 검사기 (함수형)\r
    4. 프로퍼티 데코레이터 직접 구현 (메타)\r
    5. 이메일 파싱 정규표현식 (정규식)\r
\r
    중급 종합 (6-10)\r
    6. 이진 힙 + 우선순위 큐 통합 (자료구조+알고리즘)\r
    7. 옵저버 + 전략 패턴 조합 (패턴)\r
    8. 모나드 체이닝 파이프라인 (함수형)\r
    9. 속성 접근 로깅 메타클래스 (메타)\r
    10. 로그 파서 + 분석기 (정규식+알고리즘)\r
\r
    고급 종합 (11-20)\r
    11. B-트리 삽입/검색 구현 (자료구조)\r
    12. 이벤트 소싱 패턴 구현 (패턴+함수형)\r
    13. 타입 추론 시스템 구현 (메타+함수형)\r
    14. 컴파일러 렉서 구현 (정규식+자료구조)\r
    15. 그래프 최단경로 + 캐싱 (알고리즘+최적화)\r
    16. 플러그인 아키텍처 설계 (패턴+메타)\r
    17. 표현식 파서 + 평가기 (알고리즘+패턴)\r
    18. 비동기 작업 스케줄러 시뮬레이션 (자료구조+패턴)\r
    19. 도메인 특화 언어(DSL) 구현 (메타+정규식)\r
    20. 전체 시스템 통합 미니 프로젝트\r
    """\r
    EXERCISES\r
  exercise:\r
    prompt: 종합 실습 문제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TwoStackQueue:\r
          def __init__(self):\r
              self.inbox = []\r
              self.outbox = []\r
\r
          def enqueue(self, item):\r
              self.inbox.append(item)\r
\r
          def dequeue(self):\r
              if not self.outbox:\r
                  while self.inbox:\r
                      self.outbox.append(self.inbox.pop())\r
              return self.outbox.pop() if self.outbox else None\r
\r
          def peek(self):\r
              if not self.outbox:\r
                  while self.inbox:\r
                      self.outbox.append(self.inbox.pop())\r
              return self.outbox[-1] if self.outbox else None\r
\r
      ex1Queue = TwoStackQueue()\r
      for i in range(1, 6):\r
          ex1Queue.enqueue(i)\r
      ex1Result = [ex1Queue.dequeue() for _ in range(5)]\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 실습 문제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 실습 문제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 30_integrated_problem_solving-order-report-mastery
    mode: mastery
    unseen: false
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
    explanation: high, normal, low 순서와 createdAt 오름차순으로 정렬합니다. text에 refund가 포함된 티켓은 refundIds로 모으고, 첫 티켓의 action을 decide-refund 또는 reply로 정하세요.
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
              createdAt: "09:10"
              text: "Need refund for order"
            - id: T-1
              priority: high
              createdAt: "09:20"
              text: "Checkout failed"
            - id: T-3
              priority: high
              createdAt: "09:00"
              text: "Refund not received"
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
  retrievalVariants:
  - id: 30_integrated_problem-plan-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - data-structure-algorithm
    - design-pattern-integration
    - functional-oop-integration
    - metaprogramming-practice
    - string-regex-integration
    - optimization-dp
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
    minimumDelayHours: 24
`;export{e as default};