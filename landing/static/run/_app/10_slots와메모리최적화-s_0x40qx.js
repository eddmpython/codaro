var e=`meta:
  id: '10'
  title: slots와 메모리 최적화
  day: 10
  category: advancedPython
  tags:
  - __slots__
  - memory
  - optimization
  - getsizeof
  - 검증
  - 데이터모델
  seo:
    title: 파이썬 __slots__와 메모리 최적화 - 대량 객체 최적화
    description: __slots__로 메모리를 절약합니다. sys.getsizeof, 상속과 slots, 성능 비교, weakref 지원까지.
    keywords:
    - __slots__
    - 메모리최적화
    - getsizeof
    - Python optimization
intro:
  emoji: 💾
  points:
  - __slots__의 동작 원리와 효과
  - 메모리 사용량 측정 방법
  - 상속에서의 __slots__ 처리
  - 제한사항과 트레이드오프
  direction: slots와 메모리 최적화에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - slots와 메모리 최적화 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: slots 기초 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 메모리 비교 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 상속과 slots 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: slots와 메모리 최적화 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: slots와 메모리 최적화 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: slots와 메모리 최적화 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: slots_basic
  title: __slots__ 기초
  structuredPrimary: true
  subtitle: __dict__ 제거
  goal: slots 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __slots__는 인스턴스가 가질 수 있는 속성을 미리 선언합니다. 일반 클래스는 각 인스턴스마다 __dict__ 딕셔너리를 생성하여 속성을 저장합니다. __slots__를 정의하면 __dict__가 생성되지 않고, 속성이 고정된 슬롯에 저장됩니다. 이로 인해 메모리가 크게 절약됩니다. 특히 수만~수백만 개의 인스턴스를 생성할 때 효과적입니다. 단점은 선언되지 않은 속성을 동적으로 추가할 수 없다는 것입니다.

    __slots__에 '__dict__'을 포함하면 동적 속성 추가가 가능해지지만 메모리 이점이 사라집니다.
  snippet: |-
    class Point:
        __slots__ = ('x', 'y')

        def __init__(self, x, y):
            self.x = x
            self.y = y

    p = Point(3, 4)
    p.x, p.y
  exercise:
    prompt: slots 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Point:
          __slots__ = ('x', 'y')

          def __init__(self, x, y):
              self.x = x
              self.y = y

      p = Point(3, 4)
      p.x, p.y
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: slots 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: slots 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: memory_comparison
  title: 메모리 비교
  structuredPrimary: true
  subtitle: sys.getsizeof
  goal: 메모리 비교에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    sys.getsizeof()로 객체의 메모리 크기를 바이트 단위로 측정합니다. __slots__를 사용하면 인스턴스당 수십~수백 바이트를 절약할 수 있습니다. __dict__는 해시 테이블 구조로 오버헤드가 큽니다. 빈 딕셔너리도 약 64~112 바이트를 차지합니다. 수만 개의 객체를 생성하면 메가바이트 단위로 차이가 납니다. getsizeof는 얕은(shallow) 크기만 측정하므로, 참조하는 객체의 크기는 포함되지 않습니다.

    정확한 메모리 측정은 tracemalloc 모듈을 사용하세요.
  snippet: |-
    import sys

    class Regular:
        def __init__(self, x, y, z):
            self.x = x
            self.y = y
            self.z = z

    class Slotted:
        __slots__ = ('x', 'y', 'z')
        def __init__(self, x, y, z):
            self.x = x
            self.y = y
            self.z = z

    regular = Regular(1, 2, 3)
    slotted = Slotted(1, 2, 3)

    regularSize = sys.getsizeof(regular) + sys.getsizeof(regular.__dict__)
    slottedSize = sys.getsizeof(slotted)
    regularSize, slottedSize
  exercise:
    prompt: 메모리 비교 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import sys

      class Regular:
          def __init__(self, x, y, z):
              self.x = x
              self.y = y
              self.z = z

      class Slotted:
          __slots__ = ('x', 'y', 'z')
          def __init__(self, x, y, z):
              self.x = x
              self.y = y
              self.z = z

      regular = Regular(1, 2, 3)
      slotted = Slotted(1, 2, 3)

      regularSize = sys.getsizeof(regular) + sys.getsizeof(regular.__dict__)
      slottedSize = sys.getsizeof(slotted)
      regularSize, slottedSize
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 메모리 비교의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메모리 비교 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: slots_inheritance
  title: 상속과 __slots__
  structuredPrimary: true
  subtitle: 부모와 자식 슬롯
  goal: 상속과 slots에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    상속에서 __slots__는 누적됩니다. 자식 클래스가 __slots__를 정의하면 부모의 슬롯에 추가됩니다. 자식이 __slots__를 정의하지 않으면 __dict__가 생성되어 슬롯 이점이 사라집니다. 부모 슬롯에 있는 속성을 자식 슬롯에 중복 선언하면 메모리 낭비입니다. 빈 슬롯 __slots__ = ()도 유효하며, 새 속성 없이 슬롯 방식을 유지합니다. 다중 상속에서 여러 부모가 비어 있지 않은 __slots__를 가지면 문제가 됩니다.

    다중 상속에서 여러 부모가 비어 있지 않은 __slots__를 가지면 TypeError가 발생합니다.
  snippet: |-
    class Parent:
        __slots__ = ('a', 'b')
        def __init__(self, a, b):
            self.a = a
            self.b = b

    class Child(Parent):
        __slots__ = ('c',)
        def __init__(self, a, b, c):
            super().__init__(a, b)
            self.c = c

    child = Child(1, 2, 3)
    child.a, child.b, child.c
  exercise:
    prompt: 상속과 slots 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Parent:
          __slots__ = ('a', 'b')
          def __init__(self, a, b):
              self.a = a
              self.b = b

      class Child(Parent):
          __slots__ = ('c',)
          def __init__(self, a, b, c):
              super().__init__(a, b)
              self.c = c

      child = Child(1, 2, 3)
      child.a, child.b, child.c
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 상속과 slots의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 상속과 slots 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: slots_limitations
  title: 제한사항
  structuredPrimary: true
  subtitle: 트레이드오프
  goal: 제한사항에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    __slots__에는 여러 제한사항이 있습니다. 동적으로 속성을 추가할 수 없어 유연성이 줄어듭니다. __dict__가 없으므로 vars(), __dict__.update() 등을 사용할 수 없습니다. 기본값을 클래스 수준에서 정의할 수 없고, __init__에서 설정해야 합니다. 다중 상속에서 여러 부모가 비어 있지 않은 슬롯을 가지면 충돌합니다. weakref가 필요하면 '__weakref__'를 슬롯에 추가해야 합니다.

    pickle로 슬롯 객체를 직렬화하려면 __getstate__와 __setstate__를 구현해야 합니다.
  snippet: |-
    class Strict:
        __slots__ = ('x', 'y')

    strict = Strict()
    strict.x = 1
    strict.y = 2
    strict.x, strict.y
  exercise:
    prompt: 제한사항 예제에서 \`__slots__\`, \`strict\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      class Strict:
          __slots__ = ('x', 'y')

      strict = Strict()
      strict.x = 1
      strict.y = 2
      strict.x, strict.y
    hints:
    - 바꿀 지점은 \`__slots__ = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`__slots__\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 제한사항에서 \`__slots__\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 제한사항 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: weakref_support
  title: weakref 지원
  structuredPrimary: true
  subtitle: __weakref__ 슬롯
  goal: weakref 지원에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    weakref는 객체에 대한 약한 참조를 생성합니다. 약한 참조는 참조 카운트를 증가시키지 않아 가비지 컬렉션을 방해하지 않습니다. 일반 클래스는 자동으로 weakref를 지원하지만, __slots__ 클래스는 '__weakref__'를 슬롯에 명시해야 합니다. 캐시, 옵저버 패턴 등에서 메모리 누수 방지에 유용합니다. __weakref__ 없이 weakref.ref()를 호출하면 TypeError가 발생합니다.

    WeakSet, WeakKeyDictionary, WeakValueDictionary로 자동 정리되는 컬렉션을 만들 수 있습니다.
  snippet: |-
    import weakref

    class Normal:
        pass

    obj = Normal()
    ref = weakref.ref(obj)
    ref() is obj
  exercise:
    prompt: weakref 지원 예제에서 \`obj\`, \`ref\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      import weakref

      class Normal:
          pass

      obj = Normal()
      ref = weakref.ref(obj)
      ref() is obj
    hints:
    - 바꿀 지점은 \`obj = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`obj\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: weakref 지원에서 \`obj\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: weakref 지원 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: performance
  title: 성능 비교
  structuredPrimary: true
  subtitle: 속성 접근 속도
  goal: 성능 비교에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __slots__는 메모리 절약 외에도 속성 접근 속도가 약간 빨라집니다. __dict__ 검색 대신 고정된 오프셋으로 직접 접근하기 때문입니다. 그러나 속도 향상은 미미하며, 주요 이점은 메모리 절약입니다. 성능이 중요한 경우 실제 환경에서 벤치마크하세요. __slots__ 결정은 메모리와 유연성 사이의 트레이드오프입니다. 대량의 단순 데이터 객체에 적합하고, 동적 속성이 필요한 경우에는 부적합합니다.

    Python 3.10+에서는 @dataclass(slots=True)로 간단하게 슬롯 데이터클래스를 만들 수 있습니다.
  snippet: |-
    class Normal:
        def __init__(self, x):
            self.x = x

    class Slotted:
        __slots__ = ('x',)
        def __init__(self, x):
            self.x = x

    norm = Normal(1)
    slot = Slotted(1)

    def accessTest(obj, count):
        for _ in range(count):
            _ = obj.x
        return "done"

    accessTest(norm, 10000), accessTest(slot, 10000)
  exercise:
    prompt: 성능 비교 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Normal:
          def __init__(self, x):
              self.x = x

      class Slotted:
          __slots__ = ('x',)
          def __init__(self, x):
              self.x = x

      norm = Normal(1)
      slot = Slotted(1)

      def accessTest(obj, count):
          for _ in range(count):
              _ = obj.x
          return "done"

      accessTest(norm, 10000), accessTest(slot, 10000)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 성능 비교의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 성능 비교 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 대량 이벤트 모델을 slots로 고정하기'
  structuredPrimary: true
  subtitle: 예측 → 메모리 모델 → 동적 속성 차단 → dataclass slots 검증
  goal: '현업 흐름 검증: 대량 이벤트 모델을 slots로 고정하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    __slots__는 속도를 위한 마법이 아니라, 대량으로 생성되는 단순 객체의 메모리와 속성 계약을 고정하는 선택입니다. 동적 속성이 필요한 모델에는 맞지 않으므로 실패 조건까지 확인해야 합니다.

    변주 실험
    나중에 태그를 자유롭게 붙여야 하는 이벤트 모델이라면 slots가 맞지 않습니다. \`tags\` 슬롯을 명시적으로 추가한 버전과 일반 객체 버전을 비교하세요.
  tips:
  - 변주 실험 나중에 태그를 자유롭게 붙여야 하는 이벤트 모델이라면 slots가 맞지 않습니다. \`tags\` 슬롯을 명시적으로 추가한 버전과 일반 객체 버전을 비교하세요.
  snippet: |-
    from dataclasses import dataclass
    import sys

    class NormalEvent:
        def __init__(self, eventId, amount):
            self.eventId = eventId
            self.amount = amount

    class SlottedEvent:
        __slots__ = ("eventId", "amount")

        def __init__(self, eventId, amount):
            self.eventId = eventId
            self.amount = amount

    @dataclass(slots=True)
    class MetricSample:
        name: str
        value: int

    normal = NormalEvent("E-100", 12000)
    slotted = SlottedEvent("E-100", 12000)
    metric = MetricSample("paidRevenue", 12000)

    assert hasattr(normal, "__dict__")
    assert not hasattr(slotted, "__dict__")
    assert not hasattr(metric, "__dict__")
    assert metric.value == 12000
    assert sys.getsizeof(slotted) <= sys.getsizeof(normal) + 128

    normal.extra = "allowed"
    assert normal.extra == "allowed"

    try:
        slotted.extra = "blocked"
    except AttributeError as exc:
        assert "extra" in str(exc)

    print("slots 이벤트 모델 검증 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 대량 이벤트 모델을 slots로 고정하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      from dataclasses import dataclass
      import sys

      class NormalEvent:
          def __init__(self, eventId, amount):
              self.eventId = eventId
              self.amount = amount

      class SlottedEvent:
          __slots__ = ("eventId", "amount")

          def __init__(self, eventId, amount):
              self.eventId = eventId
              self.amount = amount

      @dataclass(slots=True)
      class MetricSample:
          name: str
          value: int

      normal = NormalEvent("E-100", 12000)
      slotted = SlottedEvent("E-100", 12000)
      metric = MetricSample("paidRevenue", 12000)

      assert hasattr(normal, "__dict__")
      assert not hasattr(slotted, "__dict__")
      assert not hasattr(metric, "__dict__")
      assert metric.value == 12000
      assert sys.getsizeof(slotted) <= sys.getsizeof(normal) + 128

      normal.extra = "allowed"
      assert normal.extra == "allowed"

      try:
          slotted.extra = "blocked"
      except AttributeError as exc:
          assert "extra" in str(exc)

      print("slots 이벤트 모델 검증 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 대량 이벤트 모델을 slots로 고정하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 대량 이벤트 모델을 slots로 고정하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: __slots__와 메모리 최적화 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 10에서 배운 __slots__와 메모리 최적화를 난이도별로 복습합니다. __slots__는 인스턴스 속성을 고정하여 __dict__ 생성을 막고 메모리를
    절약하는 기법입니다. 수만~수백만 개의 객체를 생성할 때 효과적이며, 속성 접근 속도도 약간 빨라집니다. 🟢 기본 문제로 __slots__ 정의와 메모리 비교를 익히고, 🟡 응용
    문제로 상속, weakref 지원 패턴을 연습하세요. 🔴 심화 문제에서는 pickle 직렬화, 동적 슬롯 클래스, dataclass(slots=True) 등 고급 기법을 다룹니다.
    __slots__는 메모리와 유연성 사이의 트레이드오프이므로 대량 데이터 객체에 선택적으로 적용하세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Point:
        __slots__ = ('x', 'y')
        def __init__(self, x, y):
            self.x = x
            self.y = y

    pt = Point(3, 4)
    pt.x, pt.y
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Point:
          __slots__ = ('x', 'y')
          def __init__(self, x, y):
              self.x = x
              self.y = y

      pt = Point(3, 4)
      pt.x, pt.y
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 10_advanced_slots-event-model-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - slots_basic
    - memory_comparison
    - workflow_validation
    title: 일반 이벤트와 slotted 이벤트의 속성 계약 차이 검증하기
    subtitle: fixed event model contract
    goal: event id와 amount를 받아 일반 객체와 slotted 객체의 __dict__ 존재, 동적 속성 차단, 크기 관계를 반환한다.
    why: slots의 핵심은 속성 접근 속도보다 대량 객체의 필드 계약을 고정하고 동적 속성 추가를 막는 선택이라는 점입니다.
    explanation: inspect_slotted_event(event_id, amount)를 완성해 일반 객체는 extra 속성을 받을 수 있고 slotted 객체는 AttributeError로 막는지 확인하세요.
    tips:
    - sys.getsizeof 값은 환경마다 다를 수 있으므로 정확한 byte 대신 관계 boolean을 반환하세요.
    - slotted 객체에 선언되지 않은 extra를 넣으면 AttributeError가 나야 합니다.
    exercise:
      prompt: inspect_slotted_event(event_id, amount)를 완성해 normalHasDict, slottedHasDict, dynamicBlocked, sizeWithinBudget,
        value를 반환하세요.
      starterCode: |-
        def inspect_slotted_event(event_id, amount):
            raise NotImplementedError
      solution: |-
        def inspect_slotted_event(event_id, amount):
            import sys

            class NormalEvent:
                def __init__(self, event_id, amount):
                    self.event_id = event_id
                    self.amount = amount

            class SlottedEvent:
                __slots__ = ("event_id", "amount")

                def __init__(self, event_id, amount):
                    self.event_id = event_id
                    self.amount = amount

            normal = NormalEvent(event_id, amount)
            slotted = SlottedEvent(event_id, amount)
            normal.extra = "allowed"
            dynamic_blocked = False
            try:
                slotted.extra = "blocked"
            except AttributeError:
                dynamic_blocked = True

            return {
                "normalHasDict": hasattr(normal, "__dict__"),
                "slottedHasDict": hasattr(slotted, "__dict__"),
                "dynamicBlocked": dynamic_blocked,
                "sizeWithinBudget": sys.getsizeof(slotted) <= sys.getsizeof(normal) + 128,
                "value": f"{slotted.event_id}:{slotted.amount}",
            }
      hints:
      - __slots__에 없는 이름은 인스턴스 속성으로 추가할 수 없습니다.
      - 메모리 크기는 interpreter 차이를 고려해 넉넉한 관계로 비교하세요.
    check:
      id: python.advanced.slots.event-model.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.slots.empty.behavior.v1.fixture
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
        entry: inspect_slotted_event
        cases:
        - id: blocks-dynamic-attributes-on-slotted-object
          arguments:
          - value: E-100
          - value: 12000
          expectedReturn:
            normalHasDict: true
            slottedHasDict: false
            dynamicBlocked: true
            sizeWithinBudget: true
            value: E-100:12000
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 10_advanced_slots-dataclass-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - slots_inheritance
    - slots_limitations
    - workflow_validation
    title: dataclass(slots=True)로 지표 샘플의 필드 계약 고정하기
    subtitle: slotted dataclass metric
    goal: 지표 이름과 값을 받아 slotted dataclass가 __dict__ 없이 동작하고 동적 속성을 거부하는지 반환한다.
    why: 전이 과제에서는 직접 __slots__를 쓰는 방식 밖으로 나와, 현대 Python에서 dataclass(slots=True)를 선택하는 실무 흐름을 확인합니다.
    explanation: inspect_slotted_metric(name, value)를 완성해 value 검증, dataclass slots, 동적 속성 차단, 선언 슬롯 목록을 반환하세요.
    tips:
    - 음수 value는 지표 샘플로 받지 말고 ValueError로 막으세요.
    - dataclass(slots=True)는 자동으로 __slots__를 구성합니다.
    exercise:
      prompt: inspect_slotted_metric(name, value)를 완성해 hasDict, dynamicBlocked, slots, pair를 반환하세요.
      starterCode: |-
        def inspect_slotted_metric(name, value):
            raise NotImplementedError
      solution: |-
        def inspect_slotted_metric(name, value):
            from dataclasses import dataclass

            if value < 0:
                raise ValueError("value must be non-negative")

            @dataclass(slots=True)
            class MetricSample:
                name: str
                value: int

            metric = MetricSample(name, value)
            dynamic_blocked = False
            try:
                metric.extra = "blocked"
            except AttributeError:
                dynamic_blocked = True

            return {
                "hasDict": hasattr(metric, "__dict__"),
                "dynamicBlocked": dynamic_blocked,
                "slots": list(MetricSample.__slots__),
                "pair": [metric.name, metric.value],
            }
      hints:
      - slots=True dataclass도 선언되지 않은 속성은 받지 않습니다.
      - __slots__는 클래스에 저장됩니다.
    check:
      id: python.advanced.slots.dataclass.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.slots.empty.behavior.v1.fixture
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
        entry: inspect_slotted_metric
        cases:
        - id: creates-slotted-dataclass-metric
          arguments:
          - value: paidRevenue
          - value: 12000
          expectedReturn:
            hasDict: false
            dynamicBlocked: true
            slots:
            - name
            - value
            pair:
            - paidRevenue
            - 12000
        - id: rejects-negative-metric-value
          arguments:
          - value: loss
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 10_advanced_slots-fit-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 10_advanced_slots-dataclass-transfer
    title: slots가 맞는 상황과 피해야 할 상황 회상하기
    subtitle: slots fit recall
    goal: 상황 이름을 받아 권장 모델 선택, 동적 속성 허용 여부, weakref 필요 처리를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 __slots__ 문법보다, 대량 고정 필드에는 맞고 자유로운 확장 객체에는 맞지 않는다는 판단 기준입니다.
    explanation: choose_slots_fit(situation)를 완성해 massive-fixed-record, dynamic-fields, weakref-needed 상황별 선택을 반환하세요.
    tips:
    - weakref가 필요하면 __weakref__ 슬롯을 명시해야 합니다.
    - 런타임에 임의 필드를 붙이는 모델에는 slots가 맞지 않을 수 있습니다.
    exercise:
      prompt: choose_slots_fit(situation)를 완성해 상황별 slots 선택 기준을 반환하세요.
      starterCode: |-
        def choose_slots_fit(situation):
            raise NotImplementedError
      solution: |-
        def choose_slots_fit(situation):
            table = {
                "massive-fixed-record": {
                    "choice": "slots",
                    "allowsDynamicAttributes": False,
                    "weakrefSlot": False,
                },
                "dynamic-fields": {
                    "choice": "regular class",
                    "allowsDynamicAttributes": True,
                    "weakrefSlot": False,
                },
                "weakref-needed": {
                    "choice": "slots with __weakref__",
                    "allowsDynamicAttributes": False,
                    "weakrefSlot": True,
                },
            }
            if situation not in table:
                raise ValueError("unknown slots situation")
            return table[situation]
      hints:
      - slots는 필드가 고정된 대량 객체에 가장 잘 맞습니다.
      - __dict__를 slots에 넣으면 동적 속성은 가능하지만 메모리 이점이 줄어듭니다.
    check:
      id: python.advanced.slots.fit.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.slots.empty.behavior.v1.fixture
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
        entry: choose_slots_fit
        cases:
        - id: recalls-slots-for-fixed-records
          arguments:
          - value: massive-fixed-record
          expectedReturn:
            choice: slots
            allowsDynamicAttributes: false
            weakrefSlot: false
        - id: recalls-regular-class-for-dynamic-fields
          arguments:
          - value: dynamic-fields
          expectedReturn:
            choice: regular class
            allowsDynamicAttributes: true
            weakrefSlot: false
        - id: rejects-unknown-situation
          arguments:
          - value: always-faster
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