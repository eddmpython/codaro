var e=`meta:
  id: day22
  title: 클래스 기초
  day: 22
  category: 30days
  outcomes: ["python.oop"]
  prerequisites: ["python.functions"]
  estimatedMinutes: 45
  tags:
  - 클래스
  - 객체
  - 인스턴스
  - 메서드
  - 상태관리
  - 검증
  seo:
    title: 파이썬 클래스 기초 - 객체지향 프로그래밍 시작
    description: class, __init__, self, 메서드, 속성, 인스턴스를 배웁니다.
    keywords:
    - 클래스
    - class
    - init
    - self
    - 메서드
    - 속성
intro:
  emoji: 🏗️
  points:
  - class로 클래스 정의
  - __init__으로 초기화
  - self로 인스턴스 참조
  - 메서드와 속성 활용
  direction: 클래스 기초에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 클래스 기초 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 클래스 정의 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: init 메서드 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: self 이해하기 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 클래스 기초 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 클래스 기초 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 클래스 기초 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: class_basic
  title: 클래스 정의
  structuredPrimary: true
  subtitle: class 키워드
  goal: 클래스 정의에서 \`myDog\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    클래스는 객체를 만드는 설계도입니다. class 키워드로 클래스를 정의하고, 클래스명()으로 인스턴스를 생성합니다. 클래스명은 대문자로 시작하는 것이 관례입니다.

    클래스는 데이터와 기능을 하나로 묶는 도구입니다.
  snippet: |-
    class Dog:
        pass

    myDog = Dog()
    type(myDog)
  exercise:
    prompt: 클래스 정의 예제에서 \`myDog\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Dog:
          pass

      myDog = Dog()
      type(myDog)
    hints:
    - 바꿀 지점은 \`myDog = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`myDog\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 클래스 정의에서 \`myDog\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 클래스 정의 실행 뒤 \`myDog\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: init_method
  title: __init__ 메서드
  structuredPrimary: true
  subtitle: 초기화 메서드
  goal: init 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __init__ 메서드는 인스턴스 생성 시 자동으로 호출되는 특별한 메서드입니다. 인스턴스의 초기 속성값을 설정하는 데 사용합니다. 첫 번째 매개변수는 항상 self입니다.

    __init__은 생성자처럼 동작하지만 엄밀히는 초기화 메서드입니다.
  snippet: |-
    class Employee:
        def __init__(self, name):
            self.name = name

    alice = Employee('Alice')
    alice.name
  exercise:
    prompt: init 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Employee:
          def __init__(self, name):
              self.name = name

      alice = Employee('Alice')
      alice.name
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: init 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: init 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: self_parameter
  title: self 이해하기
  structuredPrimary: true
  subtitle: 인스턴스 자신을 가리키는 참조
  goal: self 이해하기에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    self는 인스턴스 자신을 가리키는 참조입니다. 메서드의 첫 번째 매개변수로 self를 받고, self.속성명으로 인스턴스 속성에 접근합니다. 메서드 호출 시 self는 자동으로 전달됩니다.

    self는 관례적인 이름이지만 다른 이름도 가능합니다. 하지만 self를 사용하는 것이 표준입니다.
  snippet: |-
    class Tracker:
        def __init__(self):
            self.count = 0

    cnt = Tracker()
    cnt.count
  exercise:
    prompt: self 이해하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Tracker:
          def __init__(self):
              self.count = 0

      cnt = Tracker()
      cnt.count
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: self 이해하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: self 이해하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: instance_method
  title: 인스턴스 메서드
  structuredPrimary: true
  subtitle: 클래스의 함수
  goal: 인스턴스 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    인스턴스 메서드는 클래스 내부에 정의된 함수입니다. 첫 번째 매개변수로 self를 받고, 인스턴스.메서드명()으로 호출합니다. 메서드는 인스턴스의 속성을 사용하거나 수정할 수 있습니다.

    메서드는 인스턴스의 동작을 정의합니다.
  snippet: |-
    class Greeter:
        def __init__(self, name):
            self.name = name

        def greet(self):
            return 'Hello, ' + self.name

    g = Greeter('Bob')
    g.greet()
  exercise:
    prompt: 인스턴스 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Greeter:
          def __init__(self, name):
              self.name = name

          def greet(self):
              return 'Hello, ' + self.name

      g = Greeter('Bob')
      g.greet()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 인스턴스 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 인스턴스 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: instance_attribute
  title: 인스턴스 속성
  structuredPrimary: true
  subtitle: 인스턴스의 데이터
  goal: 인스턴스 속성에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    인스턴스 속성은 각 인스턴스가 가지는 고유한 데이터입니다. self.속성명으로 정의하고 접근합니다. 각 인스턴스는 독립적인 속성값을 가집니다.

    속성은 인스턴스의 상태를 나타냅니다.
  snippet: |-
    class User:
        def __init__(self, name, age):
            self.name = name
            self.age = age

    user1 = User('Alice', 25)
    user2 = User('Bob', 30)
    user1.age, user2.age
  exercise:
    prompt: 인스턴스 속성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class User:
          def __init__(self, name, age):
              self.name = name
              self.age = age

      user1 = User('Alice', 25)
      user2 = User('Bob', 30)
      user1.age, user2.age
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 인스턴스 속성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 인스턴스 속성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: multiple_instances
  title: 여러 인스턴스
  structuredPrimary: true
  subtitle: 클래스로부터 여러 객체 생성
  goal: 여러 인스턴스에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    하나의 클래스로부터 여러 인스턴스를 생성할 수 있습니다. 각 인스턴스는 같은 구조를 가지지만 독립적인 데이터를 저장합니다. 클래스는 설계도이고 인스턴스는 실제 객체입니다.

    클래스는 재사용 가능한 코드 템플릿입니다.
  snippet: |-
    class Car:
        def __init__(self, model, color):
            self.model = model
            self.color = color

    car1 = Car('Tesla', 'red')
    car2 = Car('BMW', 'blue')
    car1.model, car2.model
  exercise:
    prompt: 여러 인스턴스 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Car:
          def __init__(self, model, color):
              self.model = model
              self.color = color

      car1 = Car('Tesla', 'red')
      car2 = Car('BMW', 'blue')
      car1.model, car2.model
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 여러 인스턴스의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 여러 인스턴스 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 주문 객체로 상태와 합계 관리하기'
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: '현업 흐름 검증: 주문 객체로 상태와 합계 관리하기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 클래스의 핵심은 관련 데이터와 행동을 한 곳에 묶는 것입니다. 주문처럼 상태가 변하고 규칙이 붙는 데이터는 딕셔너리만으로 계속 다루면 실수가 늘어납니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Order:
        def __init__(self, orderId):
            self.orderId = orderId
            self.items = []
            self.status = "draft"

        def addItem(self, name, price, quantity=1):
            if price <= 0:
                raise ValueError("price must be positive")
            if quantity <= 0:
                raise ValueError("quantity must be positive")

            self.items.append({
                "name": name,
                "price": price,
                "quantity": quantity,
            })

        def total(self):
            amount = 0
            for item in self.items:
                amount += item["price"] * item["quantity"]
            return amount

        def markPaid(self):
            if not self.items:
                raise ValueError("empty order cannot be paid")
            self.status = "paid"

    firstOrder = Order("A-100")
    secondOrder = Order("A-101")

    firstOrder.addItem("keyboard", 50000, 1)
    firstOrder.addItem("mouse", 20000, 2)
    secondOrder.addItem("monitor", 180000, 1)

    assert firstOrder.total() == 90000
    assert secondOrder.total() == 180000
    assert firstOrder.items != secondOrder.items

    firstOrder.markPaid()
    assert firstOrder.status == "paid"
    assert secondOrder.status == "draft"

    try:
        secondOrder.addItem("broken item", -1000)
    except ValueError as exc:
        assert "price" in str(exc)

    print("주문 객체 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 주문 객체로 상태와 합계 관리하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class Order:
          def __init__(self, orderId):
              self.orderId = orderId
              self.items = []
              self.status = "draft"

          def addItem(self, name, price, quantity=1):
              if price <= 0:
                  raise ValueError("price must be positive")
              if quantity <= 0:
                  raise ValueError("quantity must be positive")

              self.items.append({
                  "name": name,
                  "price": price,
                  "quantity": quantity,
              })

          def total(self):
              amount = 0
              for item in self.items:
                  amount += item["price"] * item["quantity"]
              return amount

          def markPaid(self):
              if not self.items:
                  raise ValueError("empty order cannot be paid")
              self.status = "paid"

      firstOrder = Order("A-100")
      secondOrder = Order("A-101")

      firstOrder.addItem("keyboard", 50000, 1)
      firstOrder.addItem("mouse", 20000, 2)
      secondOrder.addItem("monitor", 180000, 1)

      assert firstOrder.total() == 90000
      assert secondOrder.total() == 180000
      assert firstOrder.items != secondOrder.items

      firstOrder.markPaid()
      assert firstOrder.status == "paid"
      assert secondOrder.status == "draft"

      try:
          secondOrder.addItem("broken item", -1000)
      except ValueError as exc:
          assert "price" in str(exc)

      print("주문 객체 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 주문 객체로 상태와 합계 관리하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 주문 객체로 상태와 합계 관리하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: Day 22 종합 복습
  structuredPrimary: true
  subtitle: 클래스 기초 마스터하기
  goal: Day 22 종합 복습에서 \`pet\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 22에서 배운 클래스 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Animal:
        pass

    pet = Animal()
    type(pet).__name__
  exercise:
    prompt: Day 22 종합 복습 예제에서 \`pet\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Animal:
          pass

      pet = Animal()
      type(pet).__name__
    hints:
    - 바꿀 지점은 \`pet = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pet\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Day 22 종합 복습에서 \`pet\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Day 22 종합 복습 실행 뒤 \`pet\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: day22-counter-class-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - class_basic
    - practice
    title: 상태를 가진 Counter 클래스 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 생성자와 인스턴스 메서드로 상태 변화를 표현한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Counter와 counter_after(start, steps)를 완성해 steps만큼 증가한 최종 값을 반환하세요.
      starterCode: |-
        class Counter:
            pass

        def counter_after(start, steps):
            raise NotImplementedError
      solution: |-
        class Counter:
            def __init__(self, value):
                self.value = value

            def increment(self):
                self.value += 1

        def counter_after(start, steps):
            counter = Counter(start)
            for _ in range(steps):
                counter.increment()
            return counter.value
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day22.counter-class.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day22.counter-class.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: counter_after
        cases:
        - id: three
          arguments:
          - value: 5
          - value: 3
          expectedReturn: 8
        - id: none
          arguments:
          - value: 10
          - value: 0
          expectedReturn: 10
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day22-inventory-item-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day22-counter-class-mastery
    title: 객체로 재고 항목 합계 만들기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 클래스의 속성과 메서드를 가격 계산 문맥에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: InventoryItem과 item_summary(name, price, quantity)를 완성해 name과 total 딕셔너리를 반환하세요.
      starterCode: |-
        class InventoryItem:
            pass

        def item_summary(name, price, quantity):
            raise NotImplementedError
      solution: |-
        class InventoryItem:
            def __init__(self, name, price, quantity):
                self.name = name
                self.price = price
                self.quantity = quantity

            def total(self):
                return self.price * self.quantity

        def item_summary(name, price, quantity):
            item = InventoryItem(name, price, quantity)
            return {'name': item.name, 'total': item.total()}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day22.inventory-item.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day22.inventory-item.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: item_summary
        cases:
        - id: pen
          arguments:
          - value: pen
          - value: 1000
          - value: 3
          expectedReturn:
            name: pen
            total: 3000
        - id: book
          arguments:
          - value: book
          - value: 7500
          - value: 2
          expectedReturn:
            name: book
            total: 15000
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day22-temperature-class-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day22-inventory-item-transfer
    title: 객체의 온도 변환 다시 만들기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 생성자와 계산 메서드를 기억에서 복원한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Temperature와 fahrenheit_of(celsius)를 완성해 화씨 온도를 반환하세요.
      starterCode: |-
        class Temperature:
            pass

        def fahrenheit_of(celsius):
            raise NotImplementedError
      solution: |-
        class Temperature:
            def __init__(self, celsius):
                self.celsius = celsius

            def fahrenheit(self):
                return self.celsius * 9 / 5 + 32

        def fahrenheit_of(celsius):
            return Temperature(celsius).fahrenheit()
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day22.temperature-class.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day22.temperature-class.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: fahrenheit_of
        cases:
        - id: freezing
          arguments:
          - value: 0
          expectedReturn: 32.0
        - id: boiling
          arguments:
          - value: 100
          expectedReturn: 212.0
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};