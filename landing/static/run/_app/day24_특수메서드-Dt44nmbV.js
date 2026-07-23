var e=`meta:
  id: day24
  title: 특수 메서드
  day: 24
  category: 30days
  tags:
  - 특수메서드
  - dunder
  - repr
  - 연산자오버로딩
  - 컨테이너
  - 검증
  seo:
    title: 파이썬 특수 메서드 - 매직 메서드로 객체 동작 정의
    description: __str__, __repr__, __len__, __add__, __eq__, __getitem__ 등 특수 메서드를 배웁니다.
    keywords:
    - 특수메서드
    - magic method
    - dunder
    - __str__
    - __repr__
intro:
  emoji: ✨
  points:
  - __str__과 __repr__로 문자열 표현
  - __len__으로 길이 정의
  - __add__, __eq__로 연산자 구현
  - __getitem__으로 인덱싱 지원
  direction: 특수 메서드에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 특수 메서드 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: str 메서드 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: repr 메서드 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: len 메서드 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 특수 메서드 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 특수 메서드 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 특수 메서드 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: str_method
  title: __str__ 메서드
  structuredPrimary: true
  subtitle: 사람이 읽기 쉬운 문자열 표현
  goal: str 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __str__ 메서드는 객체를 문자열로 변환할 때 호출됩니다. str(객체)나 print(객체)를 사용하면 자동으로 __str__이 호출되어 사람이 읽기 쉬운 형태로 출력됩니다. 이 메서드를 정의하지 않으면 기본적으로 객체의 메모리 주소가 출력됩니다.

    __str__은 최종 사용자를 위한 읽기 쉬운 출력을 만드는 데 사용합니다.
  snippet: |-
    class Book:
        def __init__(self, title, author):
            self.title = title
            self.author = author

        def __str__(self):
            return self.title + ' by ' + self.author

    book = Book('Python Guide', 'Kim')
    str(book)
  exercise:
    prompt: str 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Book:
          def __init__(self, title, author):
              self.title = title
              self.author = author

          def __str__(self):
              return self.title + ' by ' + self.author

      book = Book('Python Guide', 'Kim')
      str(book)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: str 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: str 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: repr_method
  title: __repr__ 메서드
  structuredPrimary: true
  subtitle: 개발자를 위한 명확한 표현
  goal: repr 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __repr__ 메서드는 객체의 공식적인 문자열 표현을 정의합니다. repr(객체)를 호출하거나 인터프리터에서 객체를 직접 입력하면 호출됩니다. 주로 디버깅이나 로깅에 사용되며, 가능하면 객체를 재생성할 수 있는 형태의 문자열을 반환해야 합니다.

    __str__이 없으면 __repr__이 대신 사용됩니다. 하나만 정의한다면 __repr__을 권장합니다.
  snippet: |-
    class Point:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def __repr__(self):
            return 'Point(' + str(self.x) + ', ' + str(self.y) + ')'

    pt = Point(3, 4)
    repr(pt)
  exercise:
    prompt: repr 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Point:
          def __init__(self, x, y):
              self.x = x
              self.y = y

          def __repr__(self):
              return 'Point(' + str(self.x) + ', ' + str(self.y) + ')'

      pt = Point(3, 4)
      repr(pt)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: repr 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: repr 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: len_method
  title: __len__ 메서드
  structuredPrimary: true
  subtitle: 객체의 길이 정의
  goal: len 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __len__ 메서드는 객체의 길이를 정의합니다. len(객체)를 호출하면 자동으로 __len__이 호출되어 정수값을 반환합니다. 컬렉션 타입 클래스를 만들 때 매우 유용하며, 반드시 음이 아닌 정수를 반환해야 합니다.

    __len__은 bool() 판단에도 사용됩니다. len이 0이면 False, 아니면 True입니다.
  snippet: |-
    class Playlist:
        def __init__(self):
            self.songs = []

        def add(self, song):
            self.songs.append(song)

        def __len__(self):
            return len(self.songs)

    pl = Playlist()
    pl.add('Song A')
    pl.add('Song B')
    len(pl)
  exercise:
    prompt: len 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Playlist:
          def __init__(self):
              self.songs = []

          def add(self, song):
              self.songs.append(song)

          def __len__(self):
              return len(self.songs)

      pl = Playlist()
      pl.add('Song A')
      pl.add('Song B')
      len(pl)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: len 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: len 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: add_method
  title: __add__ 메서드
  structuredPrimary: true
  subtitle: + 연산자 구현
  goal: add 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __add__ 메서드는 + 연산자의 동작을 정의합니다. a + b를 실행하면 a.__add__(b)가 호출됩니다. 이를 통해 사용자 정의 클래스에서도 덧셈 연산을 의미있게 구현할 수 있습니다. 새로운 객체를 반환하는 것이 일반적입니다.

    __sub__, __mul__, __div__ 등으로 다른 연산자도 구현할 수 있습니다.
  snippet: |-
    class Vector:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def __add__(self, other):
            return Vector(self.x + other.x, self.y + other.y)

        def __repr__(self):
            return 'Vector(' + str(self.x) + ', ' + str(self.y) + ')'

    v1 = Vector(1, 2)
    v2 = Vector(3, 4)
    v3 = v1 + v2
    repr(v3)
  exercise:
    prompt: add 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Vector:
          def __init__(self, x, y):
              self.x = x
              self.y = y

          def __add__(self, other):
              return Vector(self.x + other.x, self.y + other.y)

          def __repr__(self):
              return 'Vector(' + str(self.x) + ', ' + str(self.y) + ')'

      v1 = Vector(1, 2)
      v2 = Vector(3, 4)
      v3 = v1 + v2
      repr(v3)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: add 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: add 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: eq_method
  title: __eq__ 메서드
  structuredPrimary: true
  subtitle: == 연산자 구현
  goal: eq 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __eq__ 메서드는 == 연산자의 동작을 정의합니다. a == b를 실행하면 a.__eq__(b)가 호출됩니다. 기본적으로 객체는 같은 메모리 주소일 때만 같다고 판단하지만, __eq__를 정의하면 값 기반 비교가 가능합니다. True나 False를 반환해야 합니다.

    __ne__(!=), __lt__(<), __le__(<=), __gt__(>), __ge__(>=)도 구현할 수 있습니다.
  snippet: |-
    class Location:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def __eq__(self, other):
            return self.x == other.x and self.y == other.y

    loc1 = Location(1, 2)
    loc2 = Location(1, 2)
    loc1 == loc2
  exercise:
    prompt: eq 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Location:
          def __init__(self, x, y):
              self.x = x
              self.y = y

          def __eq__(self, other):
              return self.x == other.x and self.y == other.y

      loc1 = Location(1, 2)
      loc2 = Location(1, 2)
      loc1 == loc2
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: eq 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: eq 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: getitem_method
  title: __getitem__ 메서드
  structuredPrimary: true
  subtitle: 인덱싱과 슬라이싱 지원
  goal: getitem 메서드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    __getitem__ 메서드는 객체[키] 형태의 인덱싱을 가능하게 합니다. obj[key]를 실행하면 obj.__getitem__(key)가 호출됩니다. 리스트처럼 동작하는 커스텀 컨테이너를 만들 때 필수적이며, 슬라이싱도 지원할 수 있습니다.

    __setitem__과 __delitem__으로 obj[key] = val과 del obj[key]도 구현할 수 있습니다.
  snippet: |-
    class Items:
        def __init__(self):
            self.data = []

        def add(self, item):
            self.data.append(item)

        def __getitem__(self, idx):
            return self.data[idx]

    items = Items()
    items.add('first')
    items.add('second')
    items[0]
  exercise:
    prompt: getitem 메서드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Items:
          def __init__(self):
              self.data = []

          def add(self, item):
              self.data.append(item)

          def __getitem__(self, idx):
              return self.data[idx]

      items = Items()
      items.add('first')
      items.add('second')
      items[0]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: getitem 메서드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: getitem 메서드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: special_methods_practice
  title: 특수 메서드 실전
  structuredPrimary: true
  subtitle: 여러 특수 메서드 조합
  goal: 특수 메서드 실전에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    실제 클래스는 여러 특수 메서드를 함께 구현하여 파이썬 내장 타입처럼 동작하게 만듭니다. __str__, __len__, __getitem__ 등을 조합하면 강력하고 직관적인 인터페이스를 제공할 수 있습니다.

    특수 메서드를 잘 활용하면 사용자 정의 클래스가 파이썬 내장 타입만큼 자연스럽게 동작합니다.
  snippet: |-
    class TodoList:
        def __init__(self):
            self.tasks = []

        def add(self, task):
            self.tasks.append(task)

        def __len__(self):
            return len(self.tasks)

        def __getitem__(self, idx):
            return self.tasks[idx]

        def __str__(self):
            return str(len(self.tasks)) + ' tasks'

    todo = TodoList()
    todo.add('Study')
    todo.add('Code')
    len(todo), str(todo), todo[0]
  exercise:
    prompt: 특수 메서드 실전 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class TodoList:
          def __init__(self):
              self.tasks = []

          def add(self, task):
              self.tasks.append(task)

          def __len__(self):
              return len(self.tasks)

          def __getitem__(self, idx):
              return self.tasks[idx]

          def __str__(self):
              return str(len(self.tasks)) + ' tasks'

      todo = TodoList()
      todo.add('Study')
      todo.add('Code')
      len(todo), str(todo), todo[0]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: 특수 메서드 실전의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 특수 메서드 실전 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 장바구니를 파이썬답게 다루기'
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: '현업 흐름 검증: 장바구니를 파이썬답게 다루기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 특수 메서드는 객체를 len(), 인덱싱, 비교, 더하기 같은 파이썬 기본 문법과 자연스럽게 연결합니다. 장바구니 예제로 동작을 검증해봅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Money:
        def __init__(self, amount):
            if amount < 0:
                raise ValueError("amount must not be negative")
            self.amount = amount

        def __add__(self, other):
            if not isinstance(other, Money):
                raise TypeError("Money can only be added to Money")
            return Money(self.amount + other.amount)

        def __eq__(self, other):
            return isinstance(other, Money) and self.amount == other.amount

        def __repr__(self):
            return f"Money({self.amount})"

    class Cart:
        def __init__(self):
            self.lines = []

        def add(self, name, price):
            self.lines.append({"name": name, "price": Money(price)})

        def __len__(self):
            return len(self.lines)

        def __getitem__(self, index):
            return self.lines[index]

        def total(self):
            totalMoney = Money(0)
            for line in self.lines:
                totalMoney = totalMoney + line["price"]
            return totalMoney

        def __repr__(self):
            return f"Cart(lines={self.lines!r})"

    cart = Cart()
    cart.add("keyboard", 50000)
    cart.add("mouse", 20000)

    assert len(cart) == 2
    assert cart[0]["name"] == "keyboard"
    assert cart.total() == Money(70000)
    assert repr(cart).startswith("Cart(")

    try:
        Money(1000) + 500
    except TypeError as exc:
        assert "Money" in str(exc)

    print("장바구니 특수 메서드 흐름 통과")
  exercise:
    prompt: '현업 흐름 검증: 장바구니를 파이썬답게 다루기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      class Money:
          def __init__(self, amount):
              if amount < 0:
                  raise ValueError("amount must not be negative")
              self.amount = amount

          def __add__(self, other):
              if not isinstance(other, Money):
                  raise TypeError("Money can only be added to Money")
              return Money(self.amount + other.amount)

          def __eq__(self, other):
              return isinstance(other, Money) and self.amount == other.amount

          def __repr__(self):
              return f"Money({self.amount})"

      class Cart:
          def __init__(self):
              self.lines = []

          def add(self, name, price):
              self.lines.append({"name": name, "price": Money(price)})

          def __len__(self):
              return len(self.lines)

          def __getitem__(self, index):
              return self.lines[index]

          def total(self):
              totalMoney = Money(0)
              for line in self.lines:
                  totalMoney = totalMoney + line["price"]
              return totalMoney

          def __repr__(self):
              return f"Cart(lines={self.lines!r})"

      cart = Cart()
      cart.add("keyboard", 50000)
      cart.add("mouse", 20000)

      assert len(cart) == 2
      assert cart[0]["name"] == "keyboard"
      assert cart.total() == Money(70000)
      assert repr(cart).startswith("Cart(")

      try:
          Money(1000) + 500
      except TypeError as exc:
          assert "Money" in str(exc)

      print("장바구니 특수 메서드 흐름 통과")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 이 코드를 실행하면 어떤 예외가 발생할까요?
      expectedError: ValueError
  check:
    type: noError
    noError: '현업 흐름 검증: 장바구니를 파이썬답게 다루기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 장바구니를 파이썬답게 다루기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: Day 24 종합 복습
  structuredPrimary: true
  subtitle: 특수 메서드 마스터하기
  goal: Day 24 종합 복습에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 24에서 배운 특수 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Person:
        def __init__(self, name, age):
            self.name = name
            self.age = age

        def __str__(self):
            return self.name + ' (' + str(self.age) + ')'

    p = Person('Alice', 25)
    str(p)
  exercise:
    prompt: Day 24 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Person:
          def __init__(self, name, age):
              self.name = name
              self.age = age

          def __str__(self):
              return self.name + ' (' + str(self.age) + ')'

      p = Person('Alice', 25)
      str(p)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
    predict:
      prompt: 셀을 실행하면 출력 영역과 마지막 표현식에 무엇이 표시될까요?
      expectedValue: (직접 실행해 본 결과를 적어주세요)
  check:
    type: noError
    noError: Day 24 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Day 24 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: day24-vector-add-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - str_method
    - practice
    title: __add__로 두 벡터 더하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 특수 메서드가 연산자 동작으로 연결되는 것을 구현한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Vector.__add__와 vector_sum(left, right)를 완성해 합친 좌표 목록을 반환하세요.
      starterCode: |-
        class Vector:
            pass

        def vector_sum(left, right):
            raise NotImplementedError
      solution: |-
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __add__(self, other):
                return Vector(self.x + other.x, self.y + other.y)

        def vector_sum(left, right):
            result = Vector(*left) + Vector(*right)
            return [result.x, result.y]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day24.vector-add.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day24.vector-add.mastery.behavior.v1.fixture
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
        entry: vector_sum
        cases:
        - id: positive
          arguments:
          - value:
            - 1
            - 2
          - value:
            - 3
            - 4
          expectedReturn:
          - 4
          - 6
        - id: signed
          arguments:
          - value:
            - -1
            - 5
          - value:
            - 2
            - -3
          expectedReturn:
          - 1
          - 2
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day24-score-order-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - day24-vector-add-mastery
    title: 객체 비교로 점수 정렬하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: __lt__를 정렬 계약에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Score.__lt__와 sorted_scores(values)를 완성해 오름차순 숫자 목록을 반환하세요.
      starterCode: |-
        class Score:
            pass

        def sorted_scores(values):
            raise NotImplementedError
      solution: |-
        class Score:
            def __init__(self, value):
                self.value = value

            def __lt__(self, other):
                return self.value < other.value

        def sorted_scores(values):
            return [score.value for score in sorted(Score(value) for value in values)]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day24.score-order.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day24.score-order.transfer.behavior.v1.fixture
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
        entry: sorted_scores
        cases:
        - id: mixed
          arguments:
          - value:
            - 30
            - 10
            - 20
          expectedReturn:
          - 10
          - 20
          - 30
        - id: signed
          arguments:
          - value:
            - 0
            - -2
            - 5
          expectedReturn:
          - -2
          - 0
          - 5
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day24-book-string-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - day24-vector-add-mastery
    title: __str__ 표현 다시 만들기
    subtitle: 하루 뒤 기억에서 재구성
    goal: 객체의 사용자 표시 문자열 계약을 기억에서 복원한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: Book.__str__와 book_label(title, author)를 완성해 'title by author'를 반환하세요.
      starterCode: |-
        class Book:
            pass

        def book_label(title, author):
            raise NotImplementedError
      solution: |-
        class Book:
            def __init__(self, title, author):
                self.title = title
                self.author = author

            def __str__(self):
                return f"{self.title} by {self.author}"

        def book_label(title, author):
            return str(Book(title, author))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day24.book-string.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day24.book-string.retrieval.behavior.v1.fixture
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
        entry: book_label
        cases:
        - id: python
          arguments:
          - value: Python
          - value: Mina
          expectedReturn: Python by Mina
        - id: codaro
          arguments:
          - value: Codaro
          - value: Team
          expectedReturn: Codaro by Team
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};