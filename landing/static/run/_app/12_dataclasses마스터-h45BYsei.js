var e=`meta:
  id: '12'
  title: dataclasses 마스터
  day: 12
  category: advancedPython
  tags:
  - dataclass
  - field
  - frozen
  - __post_init__
  - 검증
  - 데이터모델
  seo:
    title: 파이썬 dataclasses 완벽 가이드 - 보일러플레이트 없는 클래스
    description: dataclasses로 깔끔한 데이터 클래스를 만듭니다. field(), __post_init__, frozen, slots 옵션 완벽 이해.
    keywords:
    - dataclass
    - field
    - frozen
    - __post_init__
    - slots
intro:
  emoji: 📦
  points:
  - '@dataclass 데코레이터 활용'
  - field()로 세밀한 필드 제어
  - __post_init__으로 초기화 후처리
  - frozen=True로 불변 객체 생성
  direction: dataclasses 마스터에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - dataclasses 마스터 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: dataclass 기초 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: field() 함수 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: postinit 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: dataclasses 마스터 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: dataclasses 마스터 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: dataclasses 마스터 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: dataclass_basic
  title: '@dataclass 기초'
  structuredPrimary: true
  subtitle: 자동 __init__, __repr__
  goal: '@dataclass 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    @dataclass 데코레이터는 __init__, __repr__, __eq__ 등의 특수 메서드를 자동 생성합니다. 클래스 속성에 타입 힌트를 추가하면 그것이 인스턴스 필드가 됩니다. 기본값이 있는 필드는 기본값 없는 필드 뒤에 와야 합니다. 데이터를 담는 클래스를 만들 때 보일러플레이트 코드를 크게 줄여줍니다. Python 3.7에서 도입되었으며, 이후 버전에서 기능이 계속 추가되었습니다.

    dataclass 옵션: @dataclass(init=True, repr=True, eq=True, order=False, frozen=False)
  snippet: |-
    from dataclasses import dataclass

    @dataclass
    class Point:
        x: float
        y: float

    pt = Point(3.0, 4.0)
    pt
  exercise:
    prompt: '@dataclass 기초 예제에서 \`pt\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.'
    starterCode: |-
      from dataclasses import dataclass

      @dataclass
      class Point:
          x: float
          y: float

      pt = Point(3.0, 4.0)
      pt
    hints:
    - 바꿀 지점은 \`pt = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pt\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: '@dataclass 기초에서 \`pt\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '@dataclass 기초 실행 뒤 \`pt\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.'
- id: field_function
  title: field() 함수
  structuredPrimary: true
  subtitle: 세밀한 필드 제어
  goal: field() 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    field() 함수로 각 필드의 동작을 세밀하게 제어합니다. default_factory는 가변 기본값(리스트, 딕셔너리)을 안전하게 사용합니다. repr=False로 __repr__에서 필드를 숨길 수 있습니다. compare=False로 __eq__ 비교에서 제외합니다. init=False로 __init__ 파라미터에서 제외합니다. metadata로 추가 정보를 저장할 수 있습니다.

    field(default_factory=dict)처럼 사용하면 각 인스턴스가 독립적인 딕셔너리를 가집니다.
  snippet: |-
    from dataclasses import dataclass, field
    from typing import List

    @dataclass
    class ShoppingCart:
        items: List[str] = field(default_factory=list)
        discount: float = 0.0

    cart1 = ShoppingCart()
    cart2 = ShoppingCart()
    cart1.items.append("apple")
    cart1.items, cart2.items
  exercise:
    prompt: field() 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass, field
      from typing import List

      @dataclass
      class ShoppingCart:
          items: List[str] = field(default_factory=list)
          discount: float = 0.0

      cart1 = ShoppingCart()
      cart2 = ShoppingCart()
      cart1.items.append("apple")
      cart1.items, cart2.items
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: field() 함수에서 \`cart1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: field() 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: post_init
  title: __post_init__
  structuredPrimary: true
  subtitle: 초기화 후처리
  goal: postinit에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __post_init__ 메서드는 __init__이 끝난 후 자동으로 호출됩니다. 필드 값을 기반으로 계산된 속성을 설정하거나 유효성 검사를 수행합니다. InitVar 타입을 사용하면 __init__에만 전달되고 필드로 저장되지 않는 값을 정의할 수 있습니다. __post_init__은 InitVar 값을 순서대로 인자로 받습니다. 복잡한 초기화 로직을 깔끔하게 분리할 수 있습니다.

    InitVar 필드는 __repr__이나 __eq__에 포함되지 않습니다.
  snippet: |-
    from dataclasses import dataclass, field

    @dataclass
    class Rectangle:
        width: float
        height: float
        area: float = field(init=False)
        perimeter: float = field(init=False)

        def __post_init__(self):
            self.area = self.width * self.height
            self.perimeter = 2 * (self.width + self.height)

    Rectangle(3, 4)
  exercise:
    prompt: postinit 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass, field

      @dataclass
      class Rectangle:
          width: float
          height: float
          area: float = field(init=False)
          perimeter: float = field(init=False)

          def __post_init__(self):
              self.area = self.width * self.height
              self.perimeter = 2 * (self.width + self.height)

      Rectangle(3, 4)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: postinit의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: postinit 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: frozen_dataclass
  title: frozen=True
  structuredPrimary: true
  subtitle: 불변 인스턴스
  goal: frozen=True에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    frozen=True 옵션은 인스턴스를 불변(immutable)으로 만듭니다. 필드 값을 변경하려고 하면 FrozenInstanceError가 발생합니다. frozen 객체는 해시 가능(hashable)하여 딕셔너리 키나 집합 요소로 사용할 수 있습니다. 불변 객체는 함수형 프로그래밍 패턴과 잘 맞습니다. 변경이 필요하면 replace() 함수로 새 인스턴스를 만듭니다.

    frozen=True면 __hash__가 자동 생성됩니다. 가변 dataclass는 unsafe_hash=True로 강제할 수 있습니다.
  snippet: |-
    from dataclasses import dataclass

    @dataclass(frozen=True)
    class Point:
        x: float
        y: float

    pt = Point(3.0, 4.0)
    pt.x, pt.y
  exercise:
    prompt: frozen=True 예제에서 \`pt\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass

      @dataclass(frozen=True)
      class Point:
          x: float
          y: float

      pt = Point(3.0, 4.0)
      pt.x, pt.y
    hints:
    - 바꿀 지점은 \`pt = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pt\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: frozen=True에서 \`pt\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: frozen=True 실행 뒤 \`pt\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: slots_dataclass
  title: slots=True
  structuredPrimary: true
  subtitle: 메모리 최적화
  goal: slots=True에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Python 3.10+에서 slots=True 옵션이 추가되었습니다. __slots__를 자동 생성하여 메모리를 절약합니다. 많은 인스턴스를 생성할 때 효과적입니다. __dict__가 없어 동적 속성 추가가 불가능합니다. frozen=True와 함께 사용하면 불변 + 메모리 효율적인 객체가 됩니다. 상속 시 부모도 slots를 사용해야 합니다.

    weakref가 필요하면 weakref_slot=True 옵션을 추가하세요 (Python 3.11+).
  snippet: |-
    from dataclasses import dataclass

    @dataclass(slots=True)
    class Point3D:
        x: float
        y: float
        z: float

    p3d = Point3D(1.0, 2.0, 3.0)
    hasattr(p3d, '__dict__'), hasattr(p3d, '__slots__')
  exercise:
    prompt: slots=True 예제에서 \`p3d\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass

      @dataclass(slots=True)
      class Point3D:
          x: float
          y: float
          z: float

      p3d = Point3D(1.0, 2.0, 3.0)
      hasattr(p3d, '__dict__'), hasattr(p3d, '__slots__')
    hints:
    - 바꿀 지점은 \`p3d = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`p3d\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: slots=True에서 \`p3d\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: slots=True 실행 뒤 \`p3d\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: inheritance
  title: 상속
  structuredPrimary: true
  subtitle: dataclass 상속
  goal: 상속에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.
  explanation: |-
    dataclass는 다른 dataclass를 상속할 수 있습니다. 자식 클래스의 필드가 부모 필드 뒤에 추가됩니다. 부모의 기본값 있는 필드 뒤에 자식의 기본값 없는 필드가 오면 오류가 발생합니다. 이 문제는 field(default=...)나 kw_only=True로 해결합니다. Python 3.10+에서는 kw_only 옵션으로 키워드 전용 인자를 지정할 수 있습니다.

    복잡한 상속 구조에서는 합성(composition)을 고려하세요.
  snippet: |-
    from dataclasses import dataclass

    @dataclass
    class Animal:
        name: str
        age: int

    @dataclass
    class Dog(Animal):
        breed: str

    Dog("Buddy", 3, "Labrador")
  exercise:
    prompt: 상속 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass

      @dataclass
      class Animal:
          name: str
          age: int

      @dataclass
      class Dog(Animal):
          breed: str

      Dog("Buddy", 3, "Labrador")
    hints:
    - 바꿀 지점은 작은 함수와 상태을 만드는 첫 줄과 추상화 패턴 줄에서 찾으세요.
    - 실행 뒤 호출 결과와 예외 경계 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 상속의 수정 코드가 추상화 패턴 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 상속 실행 결과가 호출 결과와 예외 경계 기준으로 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 주문 라인 데이터 모델 만들기'
  structuredPrimary: true
  subtitle: field, default_factory, frozen, replace, asdict를 한 흐름에서 검증합니다
  goal: '현업 흐름 검증: 주문 라인 데이터 모델 만들기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    dataclass는 단순한 보일러플레이트 제거 도구가 아니라, 데이터 규칙을 한 곳에 모으는 모델링 도구입니다. 주문 라인의 금액 계산과 세금 규칙을 만들고, 잘못된 입력이 어디서 막히는지 확인하세요.

    변주 실험
    배송비, 할인율, 쿠폰 코드를 필드로 추가하고 \`replace()\` 후에도 \`subtotal\`과 최종 금액이 다시 계산되는지 assert로 검증하세요.
  tips:
  - 변주 실험 배송비, 할인율, 쿠폰 코드를 필드로 추가하고 \`replace()\` 후에도 \`subtotal\`과 최종 금액이 다시 계산되는지 assert로 검증하세요.
  snippet: |-
    from dataclasses import asdict, dataclass, field, replace

    @dataclass(frozen=True)
    class PriceRule:
        taxRate: float

        def __post_init__(self) -> None:
            if not 0 <= self.taxRate <= 0.3:
                raise ValueError("taxRate must be between 0 and 0.3")

        def tax(self, amount: int) -> int:
            return round(amount * self.taxRate)

    @dataclass
    class OrderLine:
        sku: str
        unitPrice: int
        quantity: int
        tags: list[str] = field(default_factory=list)
        subtotal: int = field(init=False)

        def __post_init__(self) -> None:
            if self.unitPrice <= 0:
                raise ValueError("unitPrice must be positive")
            if self.quantity <= 0:
                raise ValueError("quantity must be positive")
            self.subtotal = self.unitPrice * self.quantity

    rule = PriceRule(taxRate=0.1)
    line = OrderLine("KEYBOARD", 50_000, 2, tags=["office"])
    updated = replace(line, quantity=3)

    assert line.subtotal == 100_000
    assert updated.subtotal == 150_000
    assert rule.tax(updated.subtotal) == 15_000
    assert asdict(updated)["tags"] == ["office"]
  exercise:
    prompt: '현업 흐름 검증: 주문 라인 데이터 모델 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      from dataclasses import asdict, dataclass, field, replace

      @dataclass(frozen=True)
      class PriceRule:
          taxRate: float

          def __post_init__(self) -> None:
              if not 0 <= self.taxRate <= 0.3:
                  raise ValueError("taxRate must be between 0 and 0.3")

          def tax(self, amount: int) -> int:
              return round(amount * self.taxRate)

      @dataclass
      class OrderLine:
          sku: str
          unitPrice: int
          quantity: int
          tags: list[str] = field(default_factory=list)
          subtotal: int = field(init=False)

          def __post_init__(self) -> None:
              if self.unitPrice <= 0:
                  raise ValueError("unitPrice must be positive")
              if self.quantity <= 0:
                  raise ValueError("quantity must be positive")
              self.subtotal = self.unitPrice * self.quantity

      rule = PriceRule(taxRate=0.1)
      line = OrderLine("KEYBOARD", 50_000, 2, tags=["office"])
      updated = replace(line, quantity=3)

      assert line.subtotal == 100_000
      assert updated.subtotal == 150_000
      assert rule.tax(updated.subtotal) == 15_000
      assert asdict(updated)["tags"] == ["office"]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 주문 라인 데이터 모델 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 주문 라인 데이터 모델 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: dataclasses 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.
  explanation: Day 12에서 배운 dataclasses를 난이도별로 복습합니다. @dataclass는 __init__, __repr__, __eq__ 등 보일러플레이트
    코드를 자동 생성하여 데이터 클래스 작성을 크게 단순화합니다. field()로 세밀한 필드 제어, __post_init__으로 초기화 후처리, frozen=True로 불변 객체를
    만들 수 있습니다. 🟢 기본 문제로 dataclass 정의와 기본값 설정을 익히고, 🟡 응용 문제로 default_factory, InitVar 패턴을 연습하세요. 🔴 심화 문제에서는
    상속, slots=True, asdict/astuple 변환 등 고급 기법을 다룹니다. 데이터 중심 클래스에는 dataclass를 기본으로 사용하고, 더 복잡한 검증이 필요하면
    Pydantic을 고려하세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from dataclasses import dataclass

    @dataclass
    class Book:
        title: str
        author: str
        pages: int

    Book("Python Guide", "Alice", 300)
  exercise:
    prompt: 종합 복습 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from dataclasses import dataclass

      @dataclass
      class Book:
          title: str
          author: str
          pages: int

      Book("Python Guide", "Alice", 300)
    hints:
    - 바꿀 지점은 작은 함수와 상태을 만드는 첫 줄과 추상화 패턴 줄에서 찾으세요.
    - 실행 뒤 호출 결과와 예외 경계 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 수정 코드가 추상화 패턴 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 종합 복습 실행 결과가 호출 결과와 예외 경계 기준으로 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 12_advanced_dataclass-order-line-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - field_function
    - post_init
    - workflow_validation
    title: dataclass 주문 라인에서 후처리 계산과 replace 재계산 검증하기
    subtitle: dataclass order model
    goal: sku, 단가, 수량, 세율을 받아 subtotal, replace 후 subtotal, tax, asdict 결과를 반환한다.
    why: dataclass는 자동 init만 쓰면 얕습니다. 실제 데이터 모델에서는 기본 리스트 분리, 후처리 계산, 잘못된 값 거부까지 함께 검증해야 합니다.
    explanation: build_order_line_report(sku, unit_price, quantity, tax_rate)를 완성해 field(default_factory), __post_init__,
      replace, asdict를 한 흐름으로 확인하세요.
    tips:
    - subtotal은 init에서 직접 받지 않고 __post_init__에서 계산하세요.
    - replace(line, quantity=quantity + 1) 뒤에도 __post_init__이 다시 실행되어야 합니다.
    exercise:
      prompt: build_order_line_report(sku, unit_price, quantity, tax_rate)를 완성해 dataclass 모델 검증 결과를 반환하세요.
      starterCode: |-
        def build_order_line_report(sku, unit_price, quantity, tax_rate):
            raise NotImplementedError
      solution: |-
        def build_order_line_report(sku, unit_price, quantity, tax_rate):
            from dataclasses import asdict, dataclass, field, replace

            @dataclass(frozen=True)
            class PriceRule:
                tax_rate: float

                def __post_init__(self):
                    if not 0 <= self.tax_rate <= 0.3:
                        raise ValueError("tax_rate must be between 0 and 0.3")

                def tax(self, amount: int) -> int:
                    return round(amount * self.tax_rate)

            @dataclass
            class OrderLine:
                sku: str
                unit_price: int
                quantity: int
                tags: list[str] = field(default_factory=list)
                subtotal: int = field(init=False)

                def __post_init__(self):
                    if self.unit_price <= 0:
                        raise ValueError("unit_price must be positive")
                    if self.quantity <= 0:
                        raise ValueError("quantity must be positive")
                    self.subtotal = self.unit_price * self.quantity

            rule = PriceRule(tax_rate)
            line = OrderLine(sku, unit_price, quantity, tags=["office"])
            updated = replace(line, quantity=quantity + 1)
            return {
                "subtotal": line.subtotal,
                "updatedSubtotal": updated.subtotal,
                "tax": rule.tax(updated.subtotal),
                "tags": asdict(updated)["tags"],
                "reprContains": "OrderLine" in repr(line),
            }
      hints:
      - default_factory=list를 써야 인스턴스마다 tags 리스트가 분리됩니다.
      - frozen PriceRule은 세율 규칙을 값 객체로 고정합니다.
    check:
      id: python.advanced.dataclass.order-line.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dataclass.empty.behavior.v1.fixture
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
        entry: build_order_line_report
        cases:
        - id: computes-and-recomputes-derived-fields
          arguments:
          - value: KEYBOARD
          - value: 50000
          - value: 2
          - value: 0.1
          expectedReturn:
            subtotal: 100000
            updatedSubtotal: 150000
            tax: 15000
            tags:
            - office
            reprContains: true
        - id: rejects-invalid-tax-rate
          arguments:
          - value: KEYBOARD
          - value: 50000
          - value: 2
          - value: 0.5
          expectedException: ValueError
        - id: rejects-non-positive-quantity
          arguments:
          - value: KEYBOARD
          - value: 50000
          - value: 0
          - value: 0.1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 12_advanced_dataclass-frozen-slots-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - frozen_dataclass
    - slots_dataclass
    - inheritance
    title: frozen slots dataclass로 재시도 설정 값 객체 만들기
    subtitle: immutable slotted config
    goal: base URL과 retries를 받아 frozen slots dataclass의 불변성, __dict__ 제거, replace 결과를 반환한다.
    why: 전이 과제에서는 주문 데이터 밖에서 dataclass를 설정 값 객체로 사용해, 변경 가능 데이터 모델과 불변 설정 모델의 차이를 확인합니다.
    explanation: inspect_retry_config(base_url, retries)를 완성해 frozen=True와 slots=True가 어떤 실행 계약을 만드는지 검증하세요.
    tips:
    - retries가 음수이면 ValueError로 막으세요.
    - frozen 객체를 바꾸려면 직접 대입하지 말고 replace를 사용하세요.
    exercise:
      prompt: inspect_retry_config(base_url, retries)를 완성해 hasDict, mutationBlocked, nextRetries, endpoints를 반환하세요.
      starterCode: |-
        def inspect_retry_config(base_url, retries):
            raise NotImplementedError
      solution: |-
        def inspect_retry_config(base_url, retries):
            from dataclasses import FrozenInstanceError, dataclass, field, replace

            @dataclass(frozen=True, slots=True)
            class RetryConfig:
                base_url: str
                retries: int
                endpoints: tuple[str, ...] = field(default_factory=tuple)

                def __post_init__(self):
                    if self.retries < 0:
                        raise ValueError("retries must be non-negative")

            config = RetryConfig(base_url, retries, endpoints=("/health",))
            mutation_blocked = False
            try:
                config.retries = retries + 1
            except FrozenInstanceError:
                mutation_blocked = True
            updated = replace(config, retries=retries + 1)
            return {
                "hasDict": hasattr(config, "__dict__"),
                "mutationBlocked": mutation_blocked,
                "nextRetries": updated.retries,
                "endpoints": list(updated.endpoints),
            }
      hints:
      - frozen dataclass의 대입 실패는 FrozenInstanceError입니다.
      - slots=True이면 일반적으로 인스턴스 __dict__가 없습니다.
    check:
      id: python.advanced.dataclass.frozen-slots.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dataclass.empty.behavior.v1.fixture
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
        entry: inspect_retry_config
        cases:
        - id: blocks-mutation-and-replaces-config
          arguments:
          - value: https://api.example.test
          - value: 2
          expectedReturn:
            hasDict: false
            mutationBlocked: true
            nextRetries: 3
            endpoints:
            - /health
        - id: rejects-negative-retries
          arguments:
          - value: https://api.example.test
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 12_advanced_dataclass-feature-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 12_advanced_dataclass-frozen-slots-transfer
    title: field, __post_init__, frozen, slots, replace 사용처 회상하기
    subtitle: dataclass feature recall
    goal: 목적 이름을 받아 적절한 dataclass 기능과 주의점을 반환한다.
    why: 시간이 지나도 남아야 할 지식은 dataclass가 편하다는 말보다, 어떤 옵션이 어떤 데이터 모델 문제를 해결하는지의 선택 기준입니다.
    explanation: choose_dataclass_feature(goal)를 완성해 mutable-default, derived-field, immutable-value, many-instances, changed-copy
      목적별 기능을 고르세요.
    tips:
    - 가변 기본값에는 default_factory가 필요합니다.
    - replace는 새 인스턴스를 만들며 __post_init__을 다시 실행합니다.
    exercise:
      prompt: choose_dataclass_feature(goal)를 완성해 목적별 dataclass 기능 선택 결과를 반환하세요.
      starterCode: |-
        def choose_dataclass_feature(goal):
            raise NotImplementedError
      solution: |-
        def choose_dataclass_feature(goal):
            table = {
                "mutable-default": {
                    "feature": "field(default_factory=...)",
                    "reason": "give each instance its own mutable value",
                    "runtimeEffect": True,
                },
                "derived-field": {
                    "feature": "__post_init__ with init=False field",
                    "reason": "compute or validate values after generated __init__",
                    "runtimeEffect": True,
                },
                "immutable-value": {
                    "feature": "frozen=True",
                    "reason": "block reassignment and model a value object",
                    "runtimeEffect": True,
                },
                "many-instances": {
                    "feature": "slots=True",
                    "reason": "remove per-instance __dict__ for fixed fields",
                    "runtimeEffect": True,
                },
                "changed-copy": {
                    "feature": "replace",
                    "reason": "create a modified copy and rerun post-init validation",
                    "runtimeEffect": True,
                },
            }
            if goal not in table:
                raise ValueError("unknown dataclass goal")
            return table[goal]
      hints:
      - dataclass 옵션은 런타임 생성 메서드와 인스턴스 동작을 바꿉니다.
      - default_factory는 리스트나 dict 기본값 공유 버그를 막습니다.
    check:
      id: python.advanced.dataclass.feature-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.dataclass.empty.behavior.v1.fixture
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
        entry: choose_dataclass_feature
        cases:
        - id: recalls-default-factory-for-mutable-defaults
          arguments:
          - value: mutable-default
          expectedReturn:
            feature: field(default_factory=...)
            reason: give each instance its own mutable value
            runtimeEffect: true
        - id: recalls-frozen-for-value-object
          arguments:
          - value: immutable-value
          expectedReturn:
            feature: frozen=True
            reason: block reassignment and model a value object
            runtimeEffect: true
        - id: rejects-unknown-goal
          arguments:
          - value: hidden-database-query
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