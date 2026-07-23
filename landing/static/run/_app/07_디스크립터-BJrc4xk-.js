var e=`meta:
  id: '07'
  title: 디스크립터
  day: 7
  category: advancedPython
  tags:
  - descriptor
  - __get__
  - __set__
  - property
  - 검증
  - 데이터모델
  seo:
    title: 파이썬 디스크립터 프로토콜 - 속성 접근 제어의 핵심
    description: 디스크립터 프로토콜의 동작 원리를 이해합니다. __get__, __set__, __delete__ 구현과 property의 내부 동작.
    keywords:
    - descriptor
    - __get__
    - __set__
    - property
    - 데이터 디스크립터
intro:
  emoji: 🔧
  points:
  - __get__, __set__, __delete__ 프로토콜 이해
  - 데이터 디스크립터와 비데이터 디스크립터 구분
  - property가 디스크립터인 이유
  - 검증/지연로딩 디스크립터 구현
  direction: 디스크립터에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 디스크립터 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 디스크립터 프로토콜 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 비데이터 디스크립터 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 데이터 디스크립터 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 디스크립터 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 디스크립터 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 디스크립터 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: descriptor_protocol
  title: 디스크립터 프로토콜
  structuredPrimary: true
  subtitle: 속성 접근 가로채기
  goal: 디스크립터 프로토콜에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    디스크립터는 속성 접근을 가로채는 객체입니다. __get__, __set__, __delete__ 중 하나 이상을 구현하면 디스크립터가 됩니다. 클래스 속성으로 할당된 디스크립터는 해당 속성에 접근할 때 자동으로 호출됩니다. __get__(self, obj, objtype)은 속성을 읽을 때, __set__(self, obj, value)는 속성에 값을 할당할 때, __delete__(self, obj)는 속성을 삭제할 때 호출됩니다. obj는 인스턴스, objtype은 클래스입니다. 클래스에서 직접 접근하면 obj는 None입니다.

    __set_name__(self, owner, name)은 클래스 생성 시 자동으로 호출되어 속성 이름을 알려줍니다.
  snippet: |-
    class Verbose:
        def __get__(self, obj, objtype=None):
            return f"Getting from {objtype.__name__}"

        def __set__(self, obj, value):
            return f"Setting to {value}"

    class MyClass:
        attr = Verbose()

    MyClass.attr, MyClass().attr
  exercise:
    prompt: 디스크립터 프로토콜 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Verbose:
          def __get__(self, obj, objtype=None):
              return f"Getting from {objtype.__name__}"

          def __set__(self, obj, value):
              return f"Setting to {value}"

      class MyClass:
          attr = Verbose()

      MyClass.attr, MyClass().attr
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 디스크립터 프로토콜의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 디스크립터 프로토콜 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: non_data_descriptor
  title: 비데이터 디스크립터
  structuredPrimary: true
  subtitle: __get__만 정의
  goal: 비데이터 디스크립터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    비데이터 디스크립터(non-data descriptor)는 __get__만 정의합니다. 인스턴스 __dict__에 같은 이름의 속성이 있으면 그것이 우선합니다. 함수, classmethod, staticmethod가 비데이터 디스크립터입니다. 함수는 클래스에서 정의되면 비데이터 디스크립터가 되어, 인스턴스에서 접근할 때 바운드 메서드로 변환됩니다. 비데이터 디스크립터는 인스턴스별로 다른 값을 가질 수 있게 합니다.

    함수가 메서드로 동작하는 것도 함수의 __get__이 self를 바인딩하기 때문입니다.
  snippet: |-
    class NonData:
        def __get__(self, obj, objtype=None):
            return "descriptor value"

    class Example:
        attr = NonData()

    ex = Example()
    ex.attr
  exercise:
    prompt: 비데이터 디스크립터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class NonData:
          def __get__(self, obj, objtype=None):
              return "descriptor value"

      class Example:
          attr = NonData()

      ex = Example()
      ex.attr
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 비데이터 디스크립터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 비데이터 디스크립터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: data_descriptor
  title: 데이터 디스크립터
  structuredPrimary: true
  subtitle: __get__과 __set__
  goal: 데이터 디스크립터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    데이터 디스크립터(data descriptor)는 __get__과 __set__ 모두 정의합니다. 데이터 디스크립터는 인스턴스 __dict__보다 우선합니다. 따라서 인스턴스에서 속성에 값을 할당해도 디스크립터의 __set__이 호출됩니다. property가 데이터 디스크립터의 대표적인 예입니다. 데이터 디스크립터는 속성 접근을 완전히 제어할 때 사용합니다. __delete__만 있어도 데이터 디스크립터로 취급됩니다.

    __set__에서 실제로 아무것도 안 해도 데이터 디스크립터가 됩니다.
  snippet: |-
    class DataDesc:
        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            return obj.__dict__.get("_value", 0)

        def __set__(self, obj, value):
            obj.__dict__["_value"] = value

    class Counter:
        count = DataDesc()

    counter = Counter()
    counter.count = 10
    counter.count
  exercise:
    prompt: 데이터 디스크립터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class DataDesc:
          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              return obj.__dict__.get("_value", 0)

          def __set__(self, obj, value):
              obj.__dict__["_value"] = value

      class Counter:
          count = DataDesc()

      counter = Counter()
      counter.count = 10
      counter.count
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 데이터 디스크립터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 데이터 디스크립터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: property_internal
  title: property 내부
  structuredPrimary: true
  subtitle: property도 디스크립터
  goal: property 내부에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    property는 파이썬 내장 디스크립터입니다. getter, setter, deleter 함수를 받아 속성처럼 동작합니다. property(fget, fset, fdel, doc)로 생성하거나 @property 데코레이터를 사용합니다. 내부적으로 __get__에서 fget을 호출하고, __set__에서 fset을 호출합니다. property를 직접 구현하면 디스크립터의 동작을 이해할 수 있습니다. classmethod, staticmethod도 디스크립터로 구현되어 있습니다.

    classmethod의 __get__은 첫 번째 인자로 클래스를 바인딩합니다.
  snippet: |-
    class Circle:
        def __init__(self, radius):
            self._radius = radius

        @property
        def radius(self):
            return self._radius

        @radius.setter
        def radius(self, value):
            if value < 0:
                raise ValueError("Radius must be non-negative")
            self._radius = value

    circle = Circle(5)
    circle.radius
  exercise:
    prompt: property 내부 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Circle:
          def __init__(self, radius):
              self._radius = radius

          @property
          def radius(self):
              return self._radius

          @radius.setter
          def radius(self, value):
              if value < 0:
                  raise ValueError("Radius must be non-negative")
              self._radius = value

      circle = Circle(5)
      circle.radius
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: property 내부의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: property 내부 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: validation_descriptor
  title: 검증 디스크립터
  structuredPrimary: true
  subtitle: 타입과 범위 검사
  goal: 검증 디스크립터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    디스크립터의 가장 일반적인 활용은 속성 검증입니다. __set__에서 값을 검증하고 조건에 맞지 않으면 예외를 발생시킵니다. 타입 검사, 범위 검사, 형식 검사 등 다양한 검증 로직을 캡슐화할 수 있습니다. 한 번 정의한 검증 디스크립터는 여러 클래스, 여러 속성에서 재사용할 수 있습니다. 이는 property의 setter마다 검증 코드를 반복하는 것보다 효율적입니다.

    dataclasses의 field와 함께 사용하면 더 강력한 데이터 검증이 가능합니다.
  snippet: |-
    class Typed:
        def __init__(self, expectedType):
            self.expectedType = expectedType

        def __set_name__(self, owner, name):
            self.name = f"_{name}"

        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            return getattr(obj, self.name, None)

        def __set__(self, obj, value):
            if not isinstance(value, self.expectedType):
                raise TypeError(f"Expected {self.expectedType.__name__}")
            setattr(obj, self.name, value)

    class Person:
        name = Typed(str)
        age = Typed(int)

    p2 = Person()
    p2.name = "Alice"
    p2.age = 30
    p2.name, p2.age
  exercise:
    prompt: 검증 디스크립터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Typed:
          def __init__(self, expectedType):
              self.expectedType = expectedType

          def __set_name__(self, owner, name):
              self.name = f"_{name}"

          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              return getattr(obj, self.name, None)

          def __set__(self, obj, value):
              if not isinstance(value, self.expectedType):
                  raise TypeError(f"Expected {self.expectedType.__name__}")
              setattr(obj, self.name, value)

      class Person:
          name = Typed(str)
          age = Typed(int)

      p2 = Person()
      p2.name = "Alice"
      p2.age = 30
      p2.name, p2.age
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 검증 디스크립터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 검증 디스크립터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: lazy_descriptor
  title: 지연 로딩 디스크립터
  structuredPrimary: true
  subtitle: 계산된 속성 캐싱
  goal: 지연 로딩 디스크립터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    지연 로딩(lazy loading)은 속성에 처음 접근할 때만 값을 계산하고 이후에는 캐시된 값을 반환합니다. 비용이 많이 드는 계산이나 데이터 로딩에 유용합니다. 비데이터 디스크립터로 구현하면 첫 접근 후 인스턴스 __dict__에 저장되어 이후 접근은 디스크립터를 거치지 않습니다. Python 3.8+에서는 functools.cached_property가 이 패턴을 제공합니다.

    cached_property는 스레드 안전하지 않습니다. 멀티스레드에서는 주의가 필요합니다.
  snippet: |-
    class LazyProperty:
        def __init__(self, func):
            self.func = func
            self.name = func.__name__

        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            value = self.func(obj)
            setattr(obj, self.name, value)
            return value

    class DataLoader:
        @LazyProperty
        def data(self):
            return [i * 2 for i in range(10)]

    loader = DataLoader()
    "data" in loader.__dict__
  exercise:
    prompt: 지연 로딩 디스크립터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class LazyProperty:
          def __init__(self, func):
              self.func = func
              self.name = func.__name__

          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              value = self.func(obj)
              setattr(obj, self.name, value)
              return value

      class DataLoader:
          @LazyProperty
          def data(self):
              return [i * 2 for i in range(10)]

      loader = DataLoader()
      "data" in loader.__dict__
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 지연 로딩 디스크립터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 지연 로딩 디스크립터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 재사용 가능한 필드 검증기 만들기'
  structuredPrimary: true
  subtitle: 예측 → descriptor 저장소 → 타입/범위 오류 → 모델 검증
  goal: '현업 흐름 검증: 재사용 가능한 필드 검증기 만들기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    디스크립터는 여러 모델에서 반복되는 속성 검증 규칙을 한 번에 묶을 때 효과적입니다. 상품 행 모델에 문자열, 가격, 수량 검증을 붙이고 실패 조건까지 확인합니다.

    변주 실험
    수량에는 정수만 허용하고 가격에는 int와 float를 모두 허용하도록 디스크립터를 분리한 뒤 실패 메시지를 비교하세요.
  tips:
  - 변주 실험 수량에는 정수만 허용하고 가격에는 int와 float를 모두 허용하도록 디스크립터를 분리한 뒤 실패 메시지를 비교하세요.
  snippet: |-
    class TypedField:
        def __init__(self, expectedType):
            self.expectedType = expectedType

        def __set_name__(self, owner, name):
            self.publicName = name
            self.privateName = f"_{name}"

        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            return getattr(obj, self.privateName)

        def __set__(self, obj, value):
            if not isinstance(value, self.expectedType):
                raise TypeError(f"{self.publicName} must be {self.expectedType.__name__}")
            setattr(obj, self.privateName, value)

    class PositiveNumber:
        def __set_name__(self, owner, name):
            self.publicName = name
            self.privateName = f"_{name}"

        def __get__(self, obj, objtype=None):
            if obj is None:
                return self
            return getattr(obj, self.privateName)

        def __set__(self, obj, value):
            if value <= 0:
                raise ValueError(f"{self.publicName} must be positive")
            setattr(obj, self.privateName, value)

    class ProductLine:
        sku = TypedField(str)
        price = PositiveNumber()
        quantity = PositiveNumber()

        def __init__(self, sku, price, quantity):
            self.sku = sku
            self.price = price
            self.quantity = quantity

        @property
        def amount(self):
            return self.price * self.quantity

    line = ProductLine("KBD-001", 50000, 2)
    assert line.amount == 100000
    assert ProductLine.sku.publicName == "sku"

    try:
        ProductLine(1001, 50000, 1)
    except TypeError as exc:
        assert "sku" in str(exc)

    try:
        ProductLine("BAD", 0, 1)
    except ValueError as exc:
        assert "price" in str(exc)

    print("디스크립터 필드 검증 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 재사용 가능한 필드 검증기 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class TypedField:
          def __init__(self, expectedType):
              self.expectedType = expectedType

          def __set_name__(self, owner, name):
              self.publicName = name
              self.privateName = f"_{name}"

          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              return getattr(obj, self.privateName)

          def __set__(self, obj, value):
              if not isinstance(value, self.expectedType):
                  raise TypeError(f"{self.publicName} must be {self.expectedType.__name__}")
              setattr(obj, self.privateName, value)

      class PositiveNumber:
          def __set_name__(self, owner, name):
              self.publicName = name
              self.privateName = f"_{name}"

          def __get__(self, obj, objtype=None):
              if obj is None:
                  return self
              return getattr(obj, self.privateName)

          def __set__(self, obj, value):
              if value <= 0:
                  raise ValueError(f"{self.publicName} must be positive")
              setattr(obj, self.privateName, value)

      class ProductLine:
          sku = TypedField(str)
          price = PositiveNumber()
          quantity = PositiveNumber()

          def __init__(self, sku, price, quantity):
              self.sku = sku
              self.price = price
              self.quantity = quantity

          @property
          def amount(self):
              return self.price * self.quantity

      line = ProductLine("KBD-001", 50000, 2)
      assert line.amount == 100000
      assert ProductLine.sku.publicName == "sku"

      try:
          ProductLine(1001, 50000, 1)
      except TypeError as exc:
          assert "sku" in str(exc)

      try:
          ProductLine("BAD", 0, 1)
      except ValueError as exc:
          assert "price" in str(exc)

      print("디스크립터 필드 검증 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 재사용 가능한 필드 검증기 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 재사용 가능한 필드 검증기 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 디스크립터 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 7에서 배운 디스크립터를 난이도별로 복습합니다. 디스크립터는 __get__, __set__, __delete__ 메서드를 정의하여 속성 접근을 제어하는
    객체입니다. 파이썬의 property, classmethod, staticmethod가 모두 디스크립터로 구현되어 있습니다. 🟢 기본 문제로 데이터/비데이터 디스크립터의 차이와
    기본 구현을 익히고, 🟡 응용 문제로 타입 검증, 지연 로딩 패턴을 연습하세요. 🔴 심화 문제에서는 캐싱, 감사 로깅, 의존성 주입 등 고급 속성 관리 기법을 구현해봅니다. 디스크립터를
    이해하면 파이썬 객체 모델의 핵심 동작 원리를 파악할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Simple:
        def __get__(self, obj, objtype=None):
            return 42

    class Test:
        value = Simple()

    Test().value
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Simple:
          def __get__(self, obj, objtype=None):
              return 42

      class Test:
          value = Simple()

      Test().value
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 07_advanced_descriptor-product-field-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - descriptor_protocol
    - data_descriptor
    - validation_descriptor
    - workflow_validation
    title: 재사용 가능한 데이터 디스크립터로 상품 필드 검증하기
    subtitle: reusable validating fields
    goal: sku, price, quantity를 받아 디스크립터가 타입과 양수 조건을 강제하고 계산 금액과 저장 필드를 반환한다.
    why: 디스크립터는 property를 어렵게 다시 쓰는 문법이 아니라, 여러 필드에 반복되는 속성 검증을 한 객체로 재사용하는 도구입니다.
    explanation: validate_product_line(sku, price, quantity)를 완성해 __set_name__, __get__, __set__이 협력하는 필드 검증기를 만드세요.
    tips:
    - 클래스에서 ProductLine.sku처럼 접근하면 디스크립터 자기 자신이 반환되어야 합니다.
    - 잘못된 sku 타입과 0 이하 price는 서로 다른 예외로 구분하세요.
    exercise:
      prompt: validate_product_line(sku, price, quantity)를 완성해 amount, privateFields, descriptorNames를 반환하세요.
      starterCode: |-
        def validate_product_line(sku, price, quantity):
            raise NotImplementedError
      solution: |-
        def validate_product_line(sku, price, quantity):
            class TypedField:
                def __init__(self, expected_type):
                    self.expected_type = expected_type

                def __set_name__(self, owner, name):
                    self.public_name = name
                    self.private_name = f"_{name}"

                def __get__(self, obj, objtype=None):
                    if obj is None:
                        return self
                    return getattr(obj, self.private_name)

                def __set__(self, obj, value):
                    if not isinstance(value, self.expected_type):
                        raise TypeError(f"{self.public_name} must be {self.expected_type.__name__}")
                    setattr(obj, self.private_name, value)

            class PositiveNumber:
                def __set_name__(self, owner, name):
                    self.public_name = name
                    self.private_name = f"_{name}"

                def __get__(self, obj, objtype=None):
                    if obj is None:
                        return self
                    return getattr(obj, self.private_name)

                def __set__(self, obj, value):
                    if value <= 0:
                        raise ValueError(f"{self.public_name} must be positive")
                    setattr(obj, self.private_name, value)

            class ProductLine:
                sku = TypedField(str)
                price = PositiveNumber()
                quantity = PositiveNumber()

                def __init__(self, sku, price, quantity):
                    self.sku = sku
                    self.price = price
                    self.quantity = quantity

            line = ProductLine(sku, price, quantity)
            return {
                "amount": line.price * line.quantity,
                "privateFields": sorted(line.__dict__),
                "descriptorNames": [ProductLine.sku.public_name, ProductLine.price.public_name],
            }
      hints:
      - __set_name__에서 public name과 private storage name을 저장하세요.
      - 실제 값은 인스턴스 __dict__의 private name에 넣습니다.
    check:
      id: python.advanced.descriptor.product-field.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.descriptor.empty.behavior.v1.fixture
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
        entry: validate_product_line
        cases:
        - id: validates-fields-and-computes-amount
          arguments:
          - value: KBD-001
          - value: 50000
          - value: 2
          expectedReturn:
            amount: 100000
            privateFields:
            - _price
            - _quantity
            - _sku
            descriptorNames:
            - sku
            - price
        - id: rejects-non-string-sku
          arguments:
          - value: 1001
          - value: 50000
          - value: 1
          expectedException: TypeError
        - id: rejects-non-positive-price
          arguments:
          - value: BAD
          - value: 0
          - value: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 07_advanced_descriptor-lazy-metric-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - non_data_descriptor
    - lazy_descriptor
    - workflow_validation
    title: 비데이터 디스크립터로 지연 계산 값을 한 번만 캐시하기
    subtitle: lazy metric descriptor
    goal: 숫자 목록을 받아 첫 접근 전후 캐시 상태, 두 번 접근한 값, 계산 횟수를 반환한다.
    why: 전이 과제에서는 검증 디스크립터 밖으로 나와, 비데이터 디스크립터가 인스턴스 __dict__에 캐시되면 다음 접근을 우회한다는 우선순위를 확인합니다.
    explanation: run_lazy_metric(values)를 완성해 total 속성이 첫 접근 때만 계산되고 이후에는 인스턴스 dict 값으로 반환되는지 검증하세요.
    tips:
    - LazyMetric은 __get__만 가지는 비데이터 디스크립터여야 합니다.
    - setattr(obj, self.name, value) 뒤에는 같은 이름이 인스턴스 dict에 생깁니다.
    exercise:
      prompt: run_lazy_metric(values)를 완성해 beforeCached, first, second, computeCount, cachedKeys를 반환하세요.
      starterCode: |-
        def run_lazy_metric(values):
            raise NotImplementedError
      solution: |-
        def run_lazy_metric(values):
            class LazyMetric:
                def __init__(self, func):
                    self.func = func
                    self.name = func.__name__

                def __get__(self, obj, objtype=None):
                    if obj is None:
                        return self
                    value = self.func(obj)
                    setattr(obj, self.name, value)
                    return value

            class Batch:
                def __init__(self, values):
                    self.values = list(values)
                    self.computeCount = 0

                @LazyMetric
                def total(self):
                    self.computeCount += 1
                    return sum(self.values)

            batch = Batch(values)
            before_cached = "total" in batch.__dict__
            first = batch.total
            second = batch.total
            return {
                "beforeCached": before_cached,
                "first": first,
                "second": second,
                "computeCount": batch.computeCount,
                "cachedKeys": sorted(batch.__dict__),
            }
      hints:
      - 두 번째 batch.total은 descriptor가 아니라 __dict__의 total 값을 읽어야 합니다.
      - computeCount가 1이면 캐시가 작동한 것입니다.
    check:
      id: python.advanced.descriptor.lazy-metric.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.descriptor.empty.behavior.v1.fixture
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
        entry: run_lazy_metric
        cases:
        - id: caches-non-data-descriptor-after-first-access
          arguments:
          - value:
            - 4
            - 5
            - 6
          expectedReturn:
            beforeCached: false
            first: 15
            second: 15
            computeCount: 1
            cachedKeys:
            - computeCount
            - total
            - values
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 07_advanced_descriptor-priority-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 07_advanced_descriptor-lazy-metric-transfer
    title: 데이터 디스크립터와 비데이터 디스크립터 우선순위 회상하기
    subtitle: descriptor priority recall
    goal: 디스크립터 종류 이름을 받아 구현 메서드, 인스턴스 dict 우선 여부, 대표 예를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 __get__ 이름보다, 데이터 디스크립터는 인스턴스 dict보다 우선하고 비데이터 디스크립터는 밀릴 수 있다는 규칙입니다.
    explanation: recall_descriptor_priority(kind)를 완성해 data, non-data, property 종류별 우선순위 정보를 반환하세요.
    tips:
    - __set__이나 __delete__가 있으면 데이터 디스크립터로 취급됩니다.
    - 일반 함수 메서드는 비데이터 디스크립터입니다.
    exercise:
      prompt: recall_descriptor_priority(kind)를 완성해 디스크립터 종류별 우선순위 정보를 반환하세요.
      starterCode: |-
        def recall_descriptor_priority(kind):
            raise NotImplementedError
      solution: |-
        def recall_descriptor_priority(kind):
            table = {
                "data": {
                    "methods": ["__get__", "__set__"],
                    "instanceDictCanOverride": False,
                    "example": "property with setter",
                },
                "non-data": {
                    "methods": ["__get__"],
                    "instanceDictCanOverride": True,
                    "example": "function method or lazy property",
                },
                "property": {
                    "methods": ["__get__", "__set__"],
                    "instanceDictCanOverride": False,
                    "example": "built-in property",
                },
            }
            if kind not in table:
                raise ValueError("unknown descriptor kind")
            return table[kind]
      hints:
      - 데이터 디스크립터는 인스턴스 속성보다 먼저 작동합니다.
      - 비데이터 디스크립터는 캐시 패턴에 자주 쓰입니다.
    check:
      id: python.advanced.descriptor.priority.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.descriptor.empty.behavior.v1.fixture
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
        entry: recall_descriptor_priority
        cases:
        - id: recalls-data-descriptor-priority
          arguments:
          - value: data
          expectedReturn:
            methods:
            - __get__
            - __set__
            instanceDictCanOverride: false
            example: property with setter
        - id: recalls-non-data-descriptor-override
          arguments:
          - value: non-data
          expectedReturn:
            methods:
            - __get__
            instanceDictCanOverride: true
            example: function method or lazy property
        - id: rejects-unknown-kind
          arguments:
          - value: global-attribute
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