var e=`meta:
  id: 09
  title: 다중 상속과 MRO
  day: 9
  category: advancedPython
  tags:
  - multiple inheritance
  - MRO
  - super
  - mixin
  - 검증
  - 협력상속
  seo:
    title: 파이썬 다중 상속과 MRO - 메서드 해석 순서 완벽 이해
    description: 다중 상속의 동작 원리와 MRO를 이해합니다. C3 선형화, super() 심화, Mixin 패턴, 상속 vs 합성.
    keywords:
    - 다중상속
    - MRO
    - super
    - mixin
    - C3 linearization
intro:
  emoji: 🔀
  points:
  - 다중 상속의 작동 원리
  - MRO(Method Resolution Order) 이해
  - 다이아몬드 문제와 해결책
  - Mixin 패턴으로 기능 조합
  direction: 다중 상속과 MRO에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 다중 상속과 MRO 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 다중 상속 기초 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: MRO 알고리즘 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 다이아몬드 문제 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 다중 상속과 MRO 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 다중 상속과 MRO 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 다중 상속과 MRO 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: multiple_inheritance
  title: 다중 상속 기초
  structuredPrimary: true
  subtitle: 여러 부모 클래스
  goal: 다중 상속 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    파이썬은 다중 상속을 지원합니다. 클래스 정의 시 여러 부모 클래스를 쉼표로 구분하여 지정합니다. 자식 클래스는 모든 부모 클래스의 속성과 메서드를 상속받습니다. 같은 이름의 메서드가 여러 부모에 있으면 MRO에 따라 첫 번째 발견된 것이 사용됩니다. 다중 상속은 강력하지만 복잡성을 증가시킬 수 있습니다. 올바르게 사용하면 코드 재사용성을 높이고 유연한 설계가 가능합니다.

    다중 상속에서 super()를 사용하면 MRO를 따라 모든 부모가 올바르게 초기화됩니다.
  snippet: |-
    class Flyable:
        def fly(self):
            return "Flying"

    class Swimmable:
        def swim(self):
            return "Swimming"

    class Duck(Flyable, Swimmable):
        def quack(self):
            return "Quack!"

    duck = Duck()
    duck.fly(), duck.swim(), duck.quack()
  exercise:
    prompt: 다중 상속 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Flyable:
          def fly(self):
              return "Flying"

      class Swimmable:
          def swim(self):
              return "Swimming"

      class Duck(Flyable, Swimmable):
          def quack(self):
              return "Quack!"

      duck = Duck()
      duck.fly(), duck.swim(), duck.quack()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 다중 상속 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 다중 상속 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: mro_algorithm
  title: MRO 알고리즘
  structuredPrimary: true
  subtitle: C3 선형화
  goal: MRO 알고리즘에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    MRO(Method Resolution Order)는 메서드를 찾는 순서입니다. 파이썬은 C3 선형화 알고리즘을 사용합니다. C3는 단조성(부모-자식 순서 유지)과 지역 우선(왼쪽 부모 우선)을 보장합니다. 클래스.__mro__ 또는 클래스.mro()로 MRO를 확인할 수 있습니다. MRO는 클래스 정의 시 계산되며, 유효하지 않은 상속 구조는 TypeError를 발생시킵니다. super()는 MRO의 다음 클래스를 호출합니다.

    MRO가 유효하지 않으면 'Cannot create a consistent method resolution order' 에러가 발생합니다.
  snippet: |-
    class A:
        pass

    class B(A):
        pass

    class C(A):
        pass

    class D(B, C):
        pass

    [cls.__name__ for cls in D.__mro__]
  exercise:
    prompt: MRO 알고리즘 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      class A:
          pass

      class B(A):
          pass

      class C(A):
          pass

      class D(B, C):
          pass

      [cls.__name__ for cls in D.__mro__]
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: MRO 알고리즘의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: MRO 알고리즘 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: diamond_problem
  title: 다이아몬드 문제
  structuredPrimary: true
  subtitle: 공통 조상 처리
  goal: 다이아몬드 문제에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    다이아몬드 문제는 두 부모가 같은 조상을 가질 때 발생합니다. 조상의 메서드가 두 번 호출될 수 있는 문제입니다. 파이썬의 MRO와 super()는 이 문제를 해결합니다. C3 선형화는 각 클래스가 MRO에서 한 번만 나타나도록 보장합니다. super()를 사용하면 MRO를 따라 각 클래스의 메서드가 한 번씩만 호출됩니다. 협력적 다중 상속(cooperative multiple inheritance)이라고 합니다.

    다중 상속에서는 항상 super()를 사용하고, 모든 클래스가 super()를 호출하도록 설계하세요.
  snippet: |-
    class A:
        def __init__(self):
            self.value = "A"

    class B(A):
        def __init__(self):
            super().__init__()
            self.value += "B"

    class C(A):
        def __init__(self):
            super().__init__()
            self.value += "C"

    class D(B, C):
        def __init__(self):
            super().__init__()
            self.value += "D"

    D().value
  exercise:
    prompt: 다이아몬드 문제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class A:
          def __init__(self):
              self.value = "A"

      class B(A):
          def __init__(self):
              super().__init__()
              self.value += "B"

      class C(A):
          def __init__(self):
              super().__init__()
              self.value += "C"

      class D(B, C):
          def __init__(self):
              super().__init__()
              self.value += "D"

      D().value
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 다이아몬드 문제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 다이아몬드 문제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: super_function
  title: super() 심화
  structuredPrimary: true
  subtitle: 협력적 상속
  goal: super() 심화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    super()는 MRO에서 현재 클래스 다음의 클래스를 반환합니다. super(Type, obj)처럼 인자를 지정할 수도 있습니다. 메서드 내에서 super()를 호출하면 자동으로 현재 클래스와 인스턴스가 사용됩니다. super()는 프록시 객체를 반환하며, 이 프록시가 MRO의 다음 클래스의 메서드를 호출합니다. 협력적 다중 상속에서는 모든 클래스가 super()를 호출해야 체인이 완성됩니다.

    super()와 **kwargs 패턴을 사용하면 다중 상속에서 인자를 안전하게 전달할 수 있습니다.
  snippet: |-
    class Parent:
        def greet(self):
            return "Hello from Parent"

    class Child(Parent):
        def greet(self):
            parentGreet = super().greet()
            return f"{parentGreet} and Child"

    Child().greet()
  exercise:
    prompt: super() 심화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Parent:
          def greet(self):
              return "Hello from Parent"

      class Child(Parent):
          def greet(self):
              parentGreet = super().greet()
              return f"{parentGreet} and Child"

      Child().greet()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: super() 심화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: super() 심화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: mixin_pattern
  title: Mixin 패턴
  structuredPrimary: true
  subtitle: 기능 조합
  goal: Mixin 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    Mixin은 독립적인 기능을 제공하는 작은 클래스입니다. 단독으로 사용하지 않고 다른 클래스와 조합합니다. Mixin은 보통 특정 기능만 추가하고 인스턴스 상태는 최소화합니다. 이름에 Mixin 접미사를 붙여 용도를 명확히 합니다. 여러 Mixin을 조합해 다양한 기능을 가진 클래스를 만들 수 있습니다. Mixin은 is-a 관계보다 has-a 기능에 가깝습니다.

    Mixin은 오른쪽에, 주요 부모 클래스는 왼쪽에 배치하는 것이 관례입니다.
  snippet: |-
    class JSONMixin:
        def toJSON(self):
            import json
            return json.dumps(self.__dict__)

    class XMLMixin:
        def toXML(self):
            attrs = " ".join(f'{k}="{v}"' for k, v in self.__dict__.items())
            return f"<object {attrs}/>"

    class Data(JSONMixin, XMLMixin):
        def __init__(self, name, value):
            self.name = name
            self.value = value

    data = Data("test", 42)
    data.toJSON(), data.toXML()
  exercise:
    prompt: Mixin 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class JSONMixin:
          def toJSON(self):
              import json
              return json.dumps(self.__dict__)

      class XMLMixin:
          def toXML(self):
              attrs = " ".join(f'{k}="{v}"' for k, v in self.__dict__.items())
              return f"<object {attrs}/>"

      class Data(JSONMixin, XMLMixin):
          def __init__(self, name, value):
              self.name = name
              self.value = value

      data = Data("test", 42)
      data.toJSON(), data.toXML()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Mixin 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Mixin 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: composition
  title: 상속 vs 합성
  structuredPrimary: true
  subtitle: 언제 무엇을 사용할지
  goal: 상속 vs 합성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    상속보다 합성을 선호하라(Favor composition over inheritance)는 유명한 설계 원칙입니다. 상속은 is-a 관계를 표현하고, 합성은 has-a 관계를 표현합니다. 상속은 부모의 구현에 강하게 결합되어 변경에 취약합니다. 합성은 객체를 멤버로 포함하여 느슨한 결합을 유지합니다. 상속이 적합한 경우: 명확한 is-a 관계, 부모 인터페이스 재사용. 합성이 적합한 경우: 구현 재사용, 유연한 조합이 필요할 때.

    변하지 않는 is-a 관계에는 상속을, 변할 수 있는 기능 조합에는 합성을 사용하세요.
  snippet: |-
    class Engine:
        def start(self):
            return "Engine started"

    class Car(Engine):
        def drive(self):
            return f"{self.start()} -> Driving"

    Car().drive()
  exercise:
    prompt: 상속 vs 합성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Engine:
          def start(self):
              return "Engine started"

      class Car(Engine):
          def drive(self):
              return f"{self.start()} -> Driving"

      Car().drive()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 상속 vs 합성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 상속 vs 합성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 믹스인 처리 순서 고정하기'
  structuredPrimary: true
  subtitle: 예측 → MRO 확인 → super 체인 → 오류 검증
  goal: '현업 흐름 검증: 믹스인 처리 순서 고정하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    다중 상속은 믹스인이 모두 cooperative super를 지킬 때만 안전합니다. 처리 파이프라인에서 검증, 감사, 기본 처리 순서가 MRO와 일치하는지 확인합니다.

    변주 실험
    \`AuditMixin\`과 \`ValidateMixin\`의 상속 순서를 바꾸고, 실패 요청이 감사 로그에 남아야 하는지 업무 정책에 맞춰 기대 순서를 고정하세요.
  tips:
  - 변주 실험 \`AuditMixin\`과 \`ValidateMixin\`의 상속 순서를 바꾸고, 실패 요청이 감사 로그에 남아야 하는지 업무 정책에 맞춰 기대 순서를 고정하세요.
  snippet: |-
    class BaseProcessor:
        def process(self, payload):
            payload["steps"].append("base")
            payload["status"] = "processed"
            return payload

    class ValidateMixin:
        def process(self, payload):
            if "orderId" not in payload:
                raise ValueError("orderId is required")
            payload["steps"].append("validate")
            return super().process(payload)

    class AuditMixin:
        def process(self, payload):
            payload["steps"].append("audit")
            return super().process(payload)

    class OrderProcessor(ValidateMixin, AuditMixin, BaseProcessor):
        pass

    processor = OrderProcessor()
    payload = {"orderId": "A-100", "steps": []}
    result = processor.process(payload)

    assert result["steps"] == ["validate", "audit", "base"]
    assert result["status"] == "processed"
    assert [cls.__name__ for cls in OrderProcessor.__mro__[:4]] == [
        "OrderProcessor", "ValidateMixin", "AuditMixin", "BaseProcessor"
    ]

    try:
        processor.process({"steps": []})
    except ValueError as exc:
        assert "orderId" in str(exc)

    print("다중 상속 MRO 검증 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 믹스인 처리 순서 고정하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class BaseProcessor:
          def process(self, payload):
              payload["steps"].append("base")
              payload["status"] = "processed"
              return payload

      class ValidateMixin:
          def process(self, payload):
              if "orderId" not in payload:
                  raise ValueError("orderId is required")
              payload["steps"].append("validate")
              return super().process(payload)

      class AuditMixin:
          def process(self, payload):
              payload["steps"].append("audit")
              return super().process(payload)

      class OrderProcessor(ValidateMixin, AuditMixin, BaseProcessor):
          pass

      processor = OrderProcessor()
      payload = {"orderId": "A-100", "steps": []}
      result = processor.process(payload)

      assert result["steps"] == ["validate", "audit", "base"]
      assert result["status"] == "processed"
      assert [cls.__name__ for cls in OrderProcessor.__mro__[:4]] == [
          "OrderProcessor", "ValidateMixin", "AuditMixin", "BaseProcessor"
      ]

      try:
          processor.process({"steps": []})
      except ValueError as exc:
          assert "orderId" in str(exc)

      print("다중 상속 MRO 검증 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 믹스인 처리 순서 고정하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 믹스인 처리 순서 고정하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: 다중 상속과 MRO 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 9에서 배운 다중 상속과 MRO를 난이도별로 복습합니다. 파이썬의 다중 상속은 C3 선형화 알고리즘으로 MRO(Method Resolution Order)를
    결정하여 다이아몬드 문제를 해결합니다. super()는 MRO를 따라 다음 클래스를 호출하므로 협력적 다중 상속이 가능합니다. 🟢 기본 문제로 MRO 확인과 super() 기본
    사용법을 익히고, 🟡 응용 문제로 Mixin 패턴과 협력적 super() 체인을 연습하세요. 🔴 심화 문제에서는 복잡한 상속 구조, 인터페이스 분리, 합성 vs 상속 판단 등을
    다룹니다. 다중 상속은 강력하지만 남용하면 복잡해지므로 Mixin 패턴 위주로 사용하는 것이 권장됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class A:
        def methodA(self):
            return "A"

    class B:
        def methodB(self):
            return "B"

    class C(A, B):
        pass

    obj = C()
    obj.methodA(), obj.methodB()
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class A:
          def methodA(self):
              return "A"

      class B:
          def methodB(self):
              return "B"

      class C(A, B):
          pass

      obj = C()
      obj.methodA(), obj.methodB()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 09_advanced_mro-order-processor-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - mro_algorithm
    - diamond_problem
    - workflow_validation
    title: MRO에 따라 검증, 감사, 기본 처리 순서를 고정하기
    subtitle: cooperative super chain
    goal: 주문 payload를 받아 다중 상속 processor의 MRO와 처리 steps, status를 반환한다.
    why: 다중 상속은 예외가 없다고 안전한 것이 아니라, 모든 mixin이 cooperative super를 지켜야 업무 처리 순서가 유지됩니다.
    explanation: run_order_processor(payload)를 완성해 ValidateMixin, AuditMixin, BaseProcessor가 MRO 순서대로 한 번씩 실행되는지 검증하세요.
    tips:
    - ValidateMixin이 먼저 실행되어 orderId 누락을 막아야 합니다.
    - 각 process는 super().process(payload)를 반환해 체인을 이어야 합니다.
    exercise:
      prompt: run_order_processor(payload)를 완성해 steps, status, mro를 반환하세요.
      starterCode: |-
        def run_order_processor(payload):
            raise NotImplementedError
      solution: |-
        def run_order_processor(payload):
            class BaseProcessor:
                def process(self, data):
                    data["steps"].append("base")
                    data["status"] = "processed"
                    return data

            class ValidateMixin:
                def process(self, data):
                    if "orderId" not in data:
                        raise ValueError("orderId is required")
                    data["steps"].append("validate")
                    return super().process(data)

            class AuditMixin:
                def process(self, data):
                    data["steps"].append("audit")
                    return super().process(data)

            class OrderProcessor(ValidateMixin, AuditMixin, BaseProcessor):
                ...

            data = dict(payload)
            data["steps"] = list(data.get("steps", []))
            result = OrderProcessor().process(data)
            return {
                "steps": result["steps"],
                "status": result["status"],
                "mro": [cls.__name__ for cls in OrderProcessor.__mro__[:4]],
            }
      hints:
      - OrderProcessor의 부모 순서가 처리 순서를 결정합니다.
      - payload를 복사하면 테스트 케이스 입력 부작용을 줄일 수 있습니다.
    check:
      id: python.advanced.mro.order-processor.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.mro.empty.behavior.v1.fixture
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
        entry: run_order_processor
        cases:
        - id: follows-validate-audit-base-mro
          arguments:
          - value:
              orderId: A-100
          expectedReturn:
            steps:
            - validate
            - audit
            - base
            status: processed
            mro:
            - OrderProcessor
            - ValidateMixin
            - AuditMixin
            - BaseProcessor
        - id: rejects-missing-order-id-before-audit
          arguments:
          - value: {}
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 09_advanced_mro-mixin-order-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - super_function
    - mixin_pattern
    - composition
    title: 믹스인 순서 변경이 처리 결과를 어떻게 바꾸는지 비교하기
    subtitle: mixin order comparison
    goal: 같은 mixin을 다른 부모 순서로 조합한 두 processor의 steps와 MRO를 비교해 반환한다.
    why: 전이 과제에서는 단일 정답 순서만 보는 대신, 부모 클래스 순서가 실제 처리 파이프라인을 바꾸는 설계 위험을 확인합니다.
    explanation: compare_mixin_orders()를 완성해 ValidateFirstProcessor와 AuditFirstProcessor의 steps와 MRO 차이를 반환하세요.
    tips:
    - 같은 mixin이라도 class 선언의 부모 순서가 바뀌면 MRO가 바뀝니다.
    - cooperative super가 없으면 뒤쪽 mixin이 실행되지 않습니다.
    exercise:
      prompt: compare_mixin_orders()를 완성해 validateFirst와 auditFirst의 steps, mro를 반환하세요.
      starterCode: |-
        def compare_mixin_orders():
            raise NotImplementedError
      solution: |-
        def compare_mixin_orders():
            class BaseProcessor:
                def process(self, data):
                    data["steps"].append("base")
                    return data

            class ValidateMixin:
                def process(self, data):
                    data["steps"].append("validate")
                    return super().process(data)

            class AuditMixin:
                def process(self, data):
                    data["steps"].append("audit")
                    return super().process(data)

            class ValidateFirstProcessor(ValidateMixin, AuditMixin, BaseProcessor):
                ...

            class AuditFirstProcessor(AuditMixin, ValidateMixin, BaseProcessor):
                ...

            def run(processor_cls):
                result = processor_cls().process({"steps": []})
                return {
                    "steps": result["steps"],
                    "mro": [cls.__name__ for cls in processor_cls.__mro__[:4]],
                }

            return {
                "validateFirst": run(ValidateFirstProcessor),
                "auditFirst": run(AuditFirstProcessor),
            }
      hints:
      - 두 processor는 같은 mixin을 사용하지만 부모 순서만 다릅니다.
      - steps와 mro를 함께 반환해야 원인을 확인할 수 있습니다.
    check:
      id: python.advanced.mro.mixin-order.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.mro.empty.behavior.v1.fixture
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
        entry: compare_mixin_orders
        cases:
        - id: compares-two-parent-orders
          arguments: []
          expectedReturn:
            validateFirst:
              steps:
              - validate
              - audit
              - base
              mro:
              - ValidateFirstProcessor
              - ValidateMixin
              - AuditMixin
              - BaseProcessor
            auditFirst:
              steps:
              - audit
              - validate
              - base
              mro:
              - AuditFirstProcessor
              - AuditMixin
              - ValidateMixin
              - BaseProcessor
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 09_advanced_mro-design-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 09_advanced_mro-mixin-order-transfer
    title: 상속, 믹스인, 합성, super 체인 선택 기준 회상하기
    subtitle: inheritance design recall
    goal: 설계 상황 이름을 받아 권장 도구와 이유, MRO 의존 여부를 반환한다.
    why: 시간이 지나도 남아야 할 감각은 다중 상속을 쓸 수 있다는 사실보다, is-a 관계와 기능 조합, 교체 가능한 협력 객체를 구분하는 기준입니다.
    explanation: choose_inheritance_design(situation)를 완성해 stable-is-a, add-small-capability, interchangeable-component, cooperative-chain
      상황별 선택을 반환하세요.
    tips:
    - 변할 수 있는 기능 조합에는 합성이 더 안전한 경우가 많습니다.
    - mixin은 작고 상태가 적은 기능 추가에 맞습니다.
    exercise:
      prompt: choose_inheritance_design(situation)를 완성해 설계 상황별 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_inheritance_design(situation):
            raise NotImplementedError
      solution: |-
        def choose_inheritance_design(situation):
            table = {
                "stable-is-a": {
                    "choice": "inheritance",
                    "reason": "child is a durable specialization of parent",
                    "dependsOnMro": False,
                },
                "add-small-capability": {
                    "choice": "mixin",
                    "reason": "small reusable behavior can join a class hierarchy",
                    "dependsOnMro": True,
                },
                "interchangeable-component": {
                    "choice": "composition",
                    "reason": "behavior should be swapped without changing class hierarchy",
                    "dependsOnMro": False,
                },
                "cooperative-chain": {
                    "choice": "super chain",
                    "reason": "every class must call the next implementation once",
                    "dependsOnMro": True,
                },
            }
            if situation not in table:
                raise ValueError("unknown inheritance situation")
            return table[situation]
      hints:
      - mixin과 cooperative super는 MRO 순서에 영향을 받습니다.
      - 합성은 MRO보다 명시적 위임 관계를 사용합니다.
    check:
      id: python.advanced.mro.design-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.mro.empty.behavior.v1.fixture
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
        entry: choose_inheritance_design
        cases:
        - id: recalls-mixin-mro-dependence
          arguments:
          - value: add-small-capability
          expectedReturn:
            choice: mixin
            reason: small reusable behavior can join a class hierarchy
            dependsOnMro: true
        - id: recalls-composition-for-swappable-component
          arguments:
          - value: interchangeable-component
          expectedReturn:
            choice: composition
            reason: behavior should be swapped without changing class hierarchy
            dependsOnMro: false
        - id: rejects-unknown-situation
          arguments:
          - value: monkeypatch-base
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