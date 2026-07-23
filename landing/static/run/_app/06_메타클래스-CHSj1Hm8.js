var e=`meta:
  id: '06'
  title: 메타클래스
  day: 6
  category: advancedPython
  tags:
  - metaclass
  - type
  - class
  - __init_subclass__
  - 검증
  - 프레임워크
  seo:
    title: 파이썬 메타클래스 완벽 이해 - 클래스를 만드는 클래스
    description: 메타클래스의 동작 원리를 이해합니다. type 함수로 동적 클래스 생성, 커스텀 메타클래스, __init_subclass__ 활용법.
    keywords:
    - metaclass
    - type
    - 메타클래스
    - __new__
    - __init_subclass__
intro:
  emoji: 🏭
  points:
  - 클래스도 객체라는 개념 이해
  - type()으로 동적 클래스 생성
  - 커스텀 메타클래스 구현
  - __init_subclass__로 서브클래스 훅
  direction: 메타클래스에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 메타클래스 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 클래스도 객체 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: type()으로 클래스 생성 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 메타클래스 기초 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 메타클래스 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 메타클래스 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 메타클래스 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: class_is_object
  title: 클래스도 객체
  structuredPrimary: true
  subtitle: 타입 계층 이해
  goal: 클래스도 객체에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    파이썬에서 모든 것은 객체입니다. 클래스도 예외가 아닙니다. 클래스는 type이라는 메타클래스의 인스턴스입니다. int, str, list 같은 내장 타입도 모두 type의 인스턴스입니다. type(클래스)를 호출하면 <class 'type'>이 반환됩니다. 클래스의 __class__ 속성도 type을 가리킵니다. 이 구조를 이해하면 메타클래스가 어떻게 클래스를 생성하고 제어하는지 알 수 있습니다. 재미있는 점은 type의 타입도 type이라는 것입니다. type(type)은 type 자신을 반환합니다.

    isinstance(MyClass, type)은 True입니다. 모든 클래스는 type의 인스턴스입니다.
  snippet: |-
    class MyClass:
        pass

    obj = MyClass()

    type(obj), type(MyClass), type(type)
  exercise:
    prompt: 클래스도 객체 예제에서 \`obj\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class MyClass:
          pass

      obj = MyClass()

      type(obj), type(MyClass), type(type)
    hints:
    - 바꿀 지점은 \`obj = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`obj\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 클래스도 객체에서 \`obj\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 클래스도 객체 실행 뒤 \`obj\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: type_function
  title: type()으로 클래스 생성
  structuredPrimary: true
  subtitle: 동적 클래스 생성
  goal: type()으로 클래스 생성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    type 함수는 두 가지 용도로 사용됩니다. 인자가 하나면 객체의 타입을 반환합니다. 인자가 세 개면 새 클래스를 생성합니다. type(name, bases, dict)에서 name은 클래스 이름, bases는 부모 클래스들의 튜플, dict는 클래스 속성과 메서드를 담은 딕셔너리입니다. class 문법은 사실 type 호출의 문법적 설탕(syntactic sugar)입니다. 동적으로 클래스를 생성해야 할 때 type을 직접 사용할 수 있습니다.

    class 문을 사용할 때 파이썬은 내부적으로 type(name, bases, namespace)를 호출합니다.
  snippet: |-
    Dog = type("Dog", (), {"species": "Canis familiaris"})
    dog = Dog()
    dog.species
  exercise:
    prompt: type()으로 클래스 생성 예제에서 \`Dog\`, \`dog\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      Dog = type("Dog", (), {"species": "Canis familiaris"})
      dog = Dog()
      dog.species
    hints:
    - 바꿀 지점은 \`Dog = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`Dog\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: type()으로 클래스 생성에서 \`Dog\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: type()으로 클래스 생성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: metaclass_basic
  title: 메타클래스 기초
  structuredPrimary: true
  subtitle: __new__와 __init__
  goal: 메타클래스 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    메타클래스는 클래스를 생성하는 클래스입니다. type을 상속받아 커스텀 메타클래스를 만들 수 있습니다. 메타클래스의 __new__는 클래스 객체를 생성할 때 호출됩니다. __init__은 생성된 클래스 객체를 초기화합니다. __call__은 클래스가 인스턴스를 생성할 때 호출됩니다. 메타클래스를 사용하면 클래스 생성 과정을 가로채 속성을 수정하거나 검증할 수 있습니다.

    메타클래스의 __new__는 클래스 자체를 만들고, 클래스의 __new__는 인스턴스를 만듭니다.
  snippet: |-
    class Meta(type):
        def __new__(mcs, name, bases, namespace):
            namespace["created_by"] = "Meta"
            return super().__new__(mcs, name, bases, namespace)

    class MyClass(metaclass=Meta):
        pass

    MyClass.created_by
  exercise:
    prompt: 메타클래스 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Meta(type):
          def __new__(mcs, name, bases, namespace):
              namespace["created_by"] = "Meta"
              return super().__new__(mcs, name, bases, namespace)

      class MyClass(metaclass=Meta):
          pass

      MyClass.created_by
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 메타클래스 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메타클래스 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: metaclass_example
  title: 메타클래스 예제
  structuredPrimary: true
  subtitle: 실전 패턴
  goal: 메타클래스 예제에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    메타클래스의 대표적인 활용 사례를 살펴봅니다. 싱글톤 패턴은 클래스의 인스턴스가 하나만 존재하도록 보장합니다. 레지스트리 패턴은 생성된 모든 서브클래스를 자동으로 등록합니다. 검증 패턴은 클래스 정의 시 특정 조건을 강제합니다. 이런 패턴들은 프레임워크나 ORM에서 자주 사용됩니다. Django 모델, SQLAlchemy 테이블, pytest 플러그인 등이 메타클래스를 활용합니다.

    대부분의 경우 데코레이터나 __init_subclass__로 충분합니다. 메타클래스는 최후의 수단으로 사용하세요.
  snippet: |-
    class SingletonMeta(type):
        _instances = {}

        def __call__(cls, *args, **kwargs):
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
            return cls._instances[cls]

    class Database(metaclass=SingletonMeta):
        def __init__(self):
            self.connection = "connected"

    db1 = Database()
    db2 = Database()
    db1 is db2
  exercise:
    prompt: 메타클래스 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class SingletonMeta(type):
          _instances = {}

          def __call__(cls, *args, **kwargs):
              if cls not in cls._instances:
                  cls._instances[cls] = super().__call__(*args, **kwargs)
              return cls._instances[cls]

      class Database(metaclass=SingletonMeta):
          def __init__(self):
              self.connection = "connected"

      db1 = Database()
      db2 = Database()
      db1 is db2
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 메타클래스 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 메타클래스 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: init_subclass
  title: __init_subclass__
  structuredPrimary: true
  subtitle: 가벼운 대안
  goal: initsubclass에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __init_subclass__는 Python 3.6에서 도입된 클래스 메서드입니다. 서브클래스가 생성될 때 자동으로 호출됩니다. 메타클래스보다 간단하게 서브클래스 훅을 구현할 수 있습니다. 부모 클래스에 정의하면 모든 서브클래스에 적용됩니다. 클래스 정의 시 키워드 인자를 받을 수도 있습니다. 서브클래스 등록, 속성 검증, 자동 속성 추가 등 대부분의 메타클래스 사용 사례를 더 간단하게 구현할 수 있습니다.

    __init_subclass__는 메타클래스와 달리 상속 체인을 복잡하게 만들지 않습니다.
  snippet: |-
    class Base:
        subclasses = []

        def __init_subclass__(cls, **kwargs):
            super().__init_subclass__(**kwargs)
            cls.subclasses.append(cls.__name__)

    class Child1(Base):
        pass

    class Child2(Base):
        pass

    Base.subclasses
  exercise:
    prompt: initsubclass 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Base:
          subclasses = []

          def __init_subclass__(cls, **kwargs):
              super().__init_subclass__(**kwargs)
              cls.subclasses.append(cls.__name__)

      class Child1(Base):
          pass

      class Child2(Base):
          pass

      Base.subclasses
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: initsubclass의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: initsubclass 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: when_to_use
  title: 언제 사용하나
  structuredPrimary: true
  subtitle: 적절한 도구 선택
  goal: 언제 사용하나에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    메타클래스는 강력하지만 복잡합니다. 대부분의 경우 더 간단한 대안이 있습니다. 클래스 데코레이터는 클래스 생성 후 수정이 필요할 때 적합합니다. __init_subclass__는 서브클래스 훅에 적합합니다. 메타클래스는 클래스 생성 과정 자체를 제어해야 할 때만 사용합니다. 프레임워크 개발, ORM 구현, API 자동 생성 등 특수한 경우에 메타클래스가 필요합니다. 일반 애플리케이션 개발에서는 거의 사용하지 않습니다.

    Tim Peters: '메타클래스가 필요한지 고민된다면, 아마도 필요하지 않을 것이다.'
  snippet: |-
    def addRepr(cls):
        def customRepr(self):
            attrs = ", ".join(f"{k}={v}" for k, v in vars(self).items())
            return f"{cls.__name__}({attrs})"
        cls.__repr__ = customRepr
        return cls

    @addRepr
    class Point:
        def __init__(self, x, y):
            self.x = x
            self.y = y

    Point(3, 4)
  exercise:
    prompt: 언제 사용하나 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def addRepr(cls):
          def customRepr(self):
              attrs = ", ".join(f"{k}={v}" for k, v in vars(self).items())
              return f"{cls.__name__}({attrs})"
          cls.__repr__ = customRepr
          return cls

      @addRepr
      class Point:
          def __init__(self, x, y):
              self.x = x
              self.y = y

      Point(3, 4)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 언제 사용하나의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 언제 사용하나 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 명령 클래스 자동 등록하기'
  structuredPrimary: true
  subtitle: 예측 → 클래스 생성 훅 → 계약 위반 오류 → 레지스트리 검증
  goal: '현업 흐름 검증: 명령 클래스 자동 등록하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    메타클래스는 일반 애플리케이션 코드보다 프레임워크나 플러그인 시스템의 클래스 계약을 강제할 때 가치가 있습니다. 명령 클래스가 생성되는 순간 필수 속성과 메서드를 확인하고 자동 등록하는 흐름을 검증합니다.

    변주 실험
    \`commandName\`이 중복되면 등록을 거부하도록 바꾸고, 두 클래스가 같은 이름을 쓸 때 TypeError가 나는지 확인하세요.
  tips:
  - 변주 실험 \`commandName\`이 중복되면 등록을 거부하도록 바꾸고, 두 클래스가 같은 이름을 쓸 때 TypeError가 나는지 확인하세요.
  snippet: |-
    class CommandMeta(type):
        registry = {}

        def __new__(mcs, name, bases, namespace):
            cls = super().__new__(mcs, name, bases, namespace)
            if bases:
                commandName = namespace.get("commandName")
                if not commandName:
                    raise TypeError(f"{name} must define commandName")
                if "execute" not in namespace:
                    raise TypeError(f"{name} must implement execute")
                mcs.registry[commandName] = cls
            return cls

    class Command(metaclass=CommandMeta):
        pass

    class CreateUser(Command):
        commandName = "create_user"

        def execute(self, payload):
            return {"created": payload["email"]}

    class DisableUser(Command):
        commandName = "disable_user"

        def execute(self, payload):
            return {"disabled": payload["email"]}

    assert sorted(CommandMeta.registry) == ["create_user", "disable_user"]
    assert CommandMeta.registry["create_user"]().execute({"email": "a@example.com"}) == {
        "created": "a@example.com"
    }

    try:
        class BrokenCommand(Command):
            commandName = "broken"
    except TypeError as exc:
        assert "execute" in str(exc)

    try:
        class MissingName(Command):
            def execute(self, payload):
                return payload
    except TypeError as exc:
        assert "commandName" in str(exc)

    print("메타클래스 명령 등록 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 명령 클래스 자동 등록하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class CommandMeta(type):
          registry = {}

          def __new__(mcs, name, bases, namespace):
              cls = super().__new__(mcs, name, bases, namespace)
              if bases:
                  commandName = namespace.get("commandName")
                  if not commandName:
                      raise TypeError(f"{name} must define commandName")
                  if "execute" not in namespace:
                      raise TypeError(f"{name} must implement execute")
                  mcs.registry[commandName] = cls
              return cls

      class Command(metaclass=CommandMeta):
          pass

      class CreateUser(Command):
          commandName = "create_user"

          def execute(self, payload):
              return {"created": payload["email"]}

      class DisableUser(Command):
          commandName = "disable_user"

          def execute(self, payload):
              return {"disabled": payload["email"]}

      assert sorted(CommandMeta.registry) == ["create_user", "disable_user"]
      assert CommandMeta.registry["create_user"]().execute({"email": "a@example.com"}) == {
          "created": "a@example.com"
      }

      try:
          class BrokenCommand(Command):
              commandName = "broken"
      except TypeError as exc:
          assert "execute" in str(exc)

      try:
          class MissingName(Command):
              def execute(self, payload):
                  return payload
      except TypeError as exc:
          assert "commandName" in str(exc)

      print("메타클래스 명령 등록 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 명령 클래스 자동 등록하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 명령 클래스 자동 등록하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 메타클래스 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.
  explanation: Day 6에서 배운 메타클래스를 난이도별로 복습합니다. 메타클래스는 '클래스의 클래스'로, 클래스 생성 과정을 제어하는 파이썬의 가장 강력한 메타프로그래밍
    도구입니다. type()으로 동적 클래스 생성, __new__와 __init__으로 클래스 커스터마이징, __init_subclass__로 상속 제어를 할 수 있습니다. 🟢 기본
    문제로 type의 역할과 기본 메타클래스를 익히고, 🟡 응용 문제로 클래스 검증과 자동 속성 주입을 연습하세요. 🔴 심화 문제에서는 싱글톤, ORM 스타일 모델, 플러그인 시스템
    등 실무 패턴을 구현해봅니다. 메타클래스는 과도하게 사용하면 복잡해지므로 꼭 필요한 경우에만 적용하는 것이 좋습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Example:
        pass

    type(Example), type(Example())
  exercise:
    prompt: 종합 복습 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      class Example:
          pass

      type(Example), type(Example())
    hints:
    - 바꿀 지점은 작은 함수와 상태을 만드는 첫 줄과 추상화 패턴 줄에서 찾으세요.
    - 실행 뒤 호출 결과와 예외 경계 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 수정 코드가 추상화 패턴 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 종합 복습 실행 결과가 호출 결과와 예외 경계 기준으로 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 06_advanced_metaclass-command-registry-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - metaclass_basic
    - metaclass_example
    - workflow_validation
    title: 메타클래스로 명령 클래스 계약과 중복 등록을 검증하기
    subtitle: command registry metaclass
    goal: 명령 spec 목록을 받아 메타클래스가 commandName과 execute를 강제하고 등록 결과와 실행 결과를 반환한다.
    why: 메타클래스는 어려운 문법 자체가 목적이 아니라, 클래스가 만들어지는 순간 프레임워크 계약을 깨지 못하게 막을 때 의미가 있습니다.
    explanation: build_command_registry(command_specs)를 완성해 동적 클래스 생성, 자동 등록, 중복 commandName 거부를 함께 검증하세요.
    tips:
    - type(name, bases, namespace)로 Command 하위 클래스를 동적으로 만들 수 있습니다.
    - commandName이 중복되면 registry를 덮어쓰지 말고 ValueError로 막으세요.
    exercise:
      prompt: build_command_registry(command_specs)를 완성해 registered, results, metaclassName을 반환하세요.
      starterCode: |-
        def build_command_registry(command_specs):
            raise NotImplementedError
      solution: |-
        def build_command_registry(command_specs):
            class CommandMeta(type):
                registry = {}

                def __new__(mcs, name, bases, namespace):
                    cls = super().__new__(mcs, name, bases, namespace)
                    if bases:
                        command_name = namespace.get("commandName")
                        if not command_name:
                            raise TypeError("commandName is required")
                        if "execute" not in namespace:
                            raise TypeError("execute is required")
                        if command_name in mcs.registry:
                            raise ValueError("duplicate commandName")
                        mcs.registry[command_name] = cls
                    return cls

            class Command(metaclass=CommandMeta):
                ...

            def make_execute(result_key):
                def execute(self, payload):
                    return {result_key: payload["email"]}

                return execute

            for spec in command_specs:
                type(
                    spec["className"],
                    (Command,),
                    {
                        "commandName": spec["commandName"],
                        "execute": make_execute(spec["resultKey"]),
                    },
                )

            return {
                "registered": sorted(CommandMeta.registry),
                "results": {
                    name: CommandMeta.registry[name]().execute({"email": "a@example.com"})
                    for name in sorted(CommandMeta.registry)
                },
                "metaclassName": type(Command).__name__,
            }
      hints:
      - bases가 비어 있으면 루트 Command 클래스이므로 등록하지 않습니다.
      - make_execute는 반복문의 마지막 spec만 잡지 않도록 result_key를 클로저로 고정합니다.
    check:
      id: python.advanced.metaclass.command-registry.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaclass.empty.behavior.v1.fixture
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
        entry: build_command_registry
        cases:
        - id: registers-dynamic-command-classes
          arguments:
          - value:
            - className: CreateUser
              commandName: create_user
              resultKey: created
            - className: DisableUser
              commandName: disable_user
              resultKey: disabled
          expectedReturn:
            registered:
            - create_user
            - disable_user
            results:
              create_user:
                created: a@example.com
              disable_user:
                disabled: a@example.com
            metaclassName: CommandMeta
        - id: rejects-duplicate-command-name
          arguments:
          - value:
            - className: First
              commandName: sync
              resultKey: synced
            - className: Second
              commandName: sync
              resultKey: syncedAgain
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 06_advanced_metaclass-init-subclass-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - init_subclass
    - when_to_use
    - workflow_validation
    title: 메타클래스 대신 __init_subclass__로 핸들러 등록하기
    subtitle: subclass hook registry
    goal: __init_subclass__ 키워드 인자를 사용해 핸들러를 자동 등록하고 중복 kind 거부 여부를 반환한다.
    why: 전이 과제에서는 같은 등록 문제를 더 가벼운 도구로 풀어, 메타클래스가 최후의 수단이라는 판단을 연습합니다.
    explanation: build_subclass_hook_registry()를 완성해 EmailHandler와 SmsHandler를 등록하고 duplicate kind가 거부되는지 확인하세요.
    tips:
    - 서브클래스 훅은 부모 클래스에 한 번 정의하면 하위 클래스 생성 때 자동 호출됩니다.
    - 중복 kind를 감지하면 class 정의 도중 ValueError가 나야 합니다.
    exercise:
      prompt: build_subclass_hook_registry()를 완성해 registered, sampleResults, duplicateRejected를 반환하세요.
      starterCode: |-
        def build_subclass_hook_registry():
            raise NotImplementedError
      solution: |-
        def build_subclass_hook_registry():
            class HandlerBase:
                registry = {}

                def __init_subclass__(cls, kind, **kwargs):
                    super().__init_subclass__(**kwargs)
                    if kind in cls.registry:
                        raise ValueError("duplicate handler kind")
                    cls.kind = kind
                    cls.registry[kind] = cls

            class EmailHandler(HandlerBase, kind="email"):
                def handle(self, message):
                    return f"email:{message}"

            class SmsHandler(HandlerBase, kind="sms"):
                def handle(self, message):
                    return f"sms:{message}"

            duplicate_rejected = False
            try:
                class DuplicateEmail(HandlerBase, kind="email"):
                    def handle(self, message):
                        return message
            except ValueError:
                duplicate_rejected = True

            return {
                "registered": sorted(HandlerBase.registry),
                "sampleResults": {
                    name: HandlerBase.registry[name]().handle("ready")
                    for name in sorted(HandlerBase.registry)
                },
                "duplicateRejected": duplicate_rejected,
            }
      hints:
      - class EmailHandler(HandlerBase, kind="email") 형태로 hook에 키워드 인자를 전달합니다.
      - DuplicateEmail 정의는 try 안에서 실패해야 합니다.
    check:
      id: python.advanced.metaclass.init-subclass.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaclass.empty.behavior.v1.fixture
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
        entry: build_subclass_hook_registry
        cases:
        - id: registers-handlers-with-subclass-hook
          arguments: []
          expectedReturn:
            registered:
            - email
            - sms
            sampleResults:
              email: email:ready
              sms: sms:ready
            duplicateRejected: true
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 06_advanced_metaclass-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 06_advanced_metaclass-init-subclass-transfer
    title: type, 클래스 데코레이터, __init_subclass__, 메타클래스 선택하기
    subtitle: class creation tool recall
    goal: 목적 이름을 받아 가장 가벼운 클래스 생성 도구와 선택 이유를 반환한다.
    why: 시간이 지나도 남아야 할 감각은 메타클래스를 쓸 수 있다는 사실보다, 더 단순한 대안으로 충분한지 먼저 판단하는 기준입니다.
    explanation: choose_class_creation_tool(goal)를 완성해 dynamic-class, post-process-class, subclass-registry, control-class-creation
      목적별 도구를 고르세요.
    tips:
    - 클래스 생성 후 속성만 붙이면 클래스 데코레이터가 더 단순합니다.
    - 서브클래스 등록만 필요하면 __init_subclass__가 메타클래스보다 가볍습니다.
    exercise:
      prompt: choose_class_creation_tool(goal)를 완성해 목적별 클래스 생성 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_class_creation_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_class_creation_tool(goal):
            table = {
                "dynamic-class": {
                    "tool": "type",
                    "reason": "create a class from name, bases, and namespace",
                    "complexity": "medium",
                },
                "post-process-class": {
                    "tool": "class decorator",
                    "reason": "modify a completed class without changing creation rules",
                    "complexity": "low",
                },
                "subclass-registry": {
                    "tool": "__init_subclass__",
                    "reason": "run a hook whenever a subclass is defined",
                    "complexity": "low",
                },
                "control-class-creation": {
                    "tool": "metaclass",
                    "reason": "validate or rewrite the class during creation",
                    "complexity": "high",
                },
            }
            if goal not in table:
                raise ValueError("unknown class creation goal")
            return table[goal]
      hints:
      - 가장 강한 도구부터 고르지 말고 필요한 제어 지점부터 보세요.
      - 메타클래스는 클래스 객체가 만들어지는 과정을 제어합니다.
    check:
      id: python.advanced.metaclass.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaclass.empty.behavior.v1.fixture
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
        entry: choose_class_creation_tool
        cases:
        - id: recalls-init-subclass-for-registry
          arguments:
          - value: subclass-registry
          expectedReturn:
            tool: __init_subclass__
            reason: run a hook whenever a subclass is defined
            complexity: low
        - id: recalls-metaclass-for-class-creation-control
          arguments:
          - value: control-class-creation
          expectedReturn:
            tool: metaclass
            reason: validate or rewrite the class during creation
            complexity: high
        - id: rejects-unknown-goal
          arguments:
          - value: monkeypatch-instance
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