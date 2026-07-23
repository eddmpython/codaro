var e=`meta:
  id: '15'
  title: typing 고급
  day: 15
  category: advancedPython
  tags:
  - Literal
  - Final
  - TypedDict
  - Annotated
  - NewType
  - 검증
  - 데이터계약
  seo:
    title: 파이썬 typing 고급 - Literal, Final, TypedDict, Annotated
    description: 고급 타이핑을 마스터합니다. Literal, Final, TypedDict, Annotated, NewType, TypeGuard 완벽 이해.
    keywords:
    - Literal
    - Final
    - TypedDict
    - Annotated
    - NewType
intro:
  emoji: 🔒
  points:
  - Literal로 특정 값만 허용
  - Final로 상수 표시
  - TypedDict로 딕셔너리 타입
  - Annotated로 메타데이터 추가
  direction: typing 고급에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - typing 고급 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: Literal 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: Final 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: TypedDict 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: typing 고급 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: typing 고급 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: typing 고급 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: literal
  title: Literal
  structuredPrimary: true
  subtitle: 특정 값만 허용
  goal: Literal에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    Literal은 특정 리터럴 값만 허용하는 타입입니다. 문자열, 정수, 불리언, None 등의 리터럴을 지정할 수 있습니다. 함수 인자나 반환 타입을 특정 값으로 제한합니다. @overload와 함께 사용하면 값에 따른 반환 타입을 정확히 표현할 수 있습니다. 타입 체커가 허용되지 않은 값을 감지합니다. 설정 옵션, 모드 선택 등에 유용합니다.

    Literal[True]와 Literal[False]를 사용하면 불리언 값에 따른 조건부 타입을 표현할 수 있습니다.
  snippet: |-
    from typing import Literal

    def setMode(mode: Literal['read', 'write', 'append']) -> str:
        return f"Mode set to {mode}"

    setMode('read'), setMode('write')
  exercise:
    prompt: Literal 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from typing import Literal

      def setMode(mode: Literal['read', 'write', 'append']) -> str:
          return f"Mode set to {mode}"

      setMode('read'), setMode('write')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Literal의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Literal 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: final
  title: Final
  structuredPrimary: true
  subtitle: 상수 표시
  goal: Final에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.
  explanation: |-
    Final은 변수나 속성이 재할당되어서는 안 된다는 것을 표시합니다. 타입 체커가 재할당 시도를 감지합니다. 클래스 속성에 사용하면 오버라이드도 금지합니다. @final 데코레이터는 메서드나 클래스의 상속/오버라이드를 금지합니다. 상수를 명시적으로 표시하여 의도를 전달합니다. 런타임에는 아무 효과가 없습니다.

    Final은 문서화 역할도 하여 코드를 읽는 사람에게 의도를 전달합니다.
  snippet: |-
    from typing import Final

    MAX_SIZE: Final[int] = 100
    API_URL: Final = "https://api.example.com"

    MAX_SIZE, API_URL
  exercise:
    prompt: Final 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from typing import Final

      MAX_SIZE: Final[int] = 100
      API_URL: Final = "https://api.example.com"

      MAX_SIZE, API_URL
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: Final의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: Final 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: typeddict
  title: TypedDict
  structuredPrimary: true
  subtitle: 타입 있는 딕셔너리
  goal: TypedDict에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 고급 문법은 복잡한 코드를 더 작고 검증 가능한 단위로 나누는 데 필요합니다.
  explanation: |-
    TypedDict는 키 이름과 값 타입을 지정한 딕셔너리 타입입니다. API 응답, 설정 파일 등 구조화된 딕셔너리에 유용합니다. 필수 키와 선택적 키를 구분할 수 있습니다. total=False로 모든 키를 선택적으로 만들 수 있습니다. NotRequired와 Required로 개별 키의 필수 여부를 지정합니다. 런타임에는 일반 dict로 동작합니다.

    TypedDict는 상속도 지원합니다. class Admin(User): role: str
  snippet: |-
    from typing import TypedDict

    class User(TypedDict):
        id: int
        name: str
        email: str

    user: User = {"id": 1, "name": "Alice", "email": "alice@example.com"}
    user
  exercise:
    prompt: TypedDict 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from typing import TypedDict

      class User(TypedDict):
          id: int
          name: str
          email: str

      user: User = {"id": 1, "name": "Alice", "email": "alice@example.com"}
      user
    hints:
    - 바꿀 지점은 작은 함수와 상태을 만드는 첫 줄과 추상화 패턴 줄에서 찾으세요.
    - 실행 뒤 호출 결과와 예외 경계 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: TypedDict의 수정 코드가 추상화 패턴 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: TypedDict 실행 결과가 호출 결과와 예외 경계 기준으로 바꾼 입력값을 반영해야 합니다.
- id: annotated
  title: Annotated
  structuredPrimary: true
  subtitle: 메타데이터 추가
  goal: Annotated에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    Annotated는 타입에 추가 메타데이터를 첨부합니다. Annotated[T, metadata1, metadata2, ...]로 사용합니다. 타입 체커는 첫 번째 인자(T)만 사용하고 나머지는 무시합니다. 메타데이터는 런타임에 접근할 수 있습니다. 검증 라이브러리(Pydantic 등)에서 제약 조건을 표현하는 데 사용됩니다. 문서화, 직렬화 힌트 등 다양한 용도로 활용됩니다.

    Pydantic v2는 Annotated를 적극 활용하여 Field 정보를 표현합니다.
  snippet: |-
    from typing import Annotated

    PositiveInt = Annotated[int, "must be positive"]
    EmailStr = Annotated[str, "valid email format"]

    def createUser(age: PositiveInt, email: EmailStr) -> dict:
        return {"age": age, "email": email}

    createUser(25, "user@example.com")
  exercise:
    prompt: Annotated 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from typing import Annotated

      PositiveInt = Annotated[int, "must be positive"]
      EmailStr = Annotated[str, "valid email format"]

      def createUser(age: PositiveInt, email: EmailStr) -> dict:
          return {"age": age, "email": email}

      createUser(25, "user@example.com")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Annotated의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Annotated 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: newtype
  title: NewType
  structuredPrimary: true
  subtitle: 타입 별칭 강화
  goal: NewType에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    NewType은 기존 타입의 구별되는 새 타입을 만듭니다. 타입 별칭(TypeAlias)과 달리 타입 체커가 다른 타입으로 취급합니다. UserId = NewType('UserId', int)로 정의하면 int와 호환되지만 구별됩니다. 실수로 잘못된 값을 전달하는 것을 방지합니다. 런타임에는 아무 변환도 하지 않습니다(제로 오버헤드).

    NewType은 상속할 수 없습니다. 더 복잡한 경우 클래스를 사용하세요.
  snippet: |-
    from typing import NewType

    UserId = NewType('UserId', int)
    OrderId = NewType('OrderId', int)

    def getUser(userId: UserId) -> dict:
        return {"id": userId}

    userId = UserId(123)
    getUser(userId)
  exercise:
    prompt: NewType 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from typing import NewType

      UserId = NewType('UserId', int)
      OrderId = NewType('OrderId', int)

      def getUser(userId: UserId) -> dict:
          return {"id": userId}

      userId = UserId(123)
      getUser(userId)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: NewType의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: NewType 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: type_guards
  title: 타입 가드
  structuredPrimary: true
  subtitle: TypeGuard와 타입 좁히기
  goal: 타입 가드에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    TypeGuard는 타입 좁히기(type narrowing) 함수를 정의합니다. 함수가 True를 반환하면 인자가 특정 타입임을 보장합니다. isinstance보다 복잡한 조건을 표현할 수 있습니다. 타입 체커가 이후 코드에서 좁혀진 타입을 사용합니다. Python 3.10+에서는 TypeIs도 도입되었습니다. 커스텀 타입 검사 함수에 유용합니다.

    Python 3.13+에서는 TypeIs가 더 정확한 타입 좁히기를 제공합니다.
  snippet: |-
    from typing import TypeGuard, List, Union

    def isStringList(val: List[Union[str, int]]) -> TypeGuard[List[str]]:
        return all(isinstance(x, str) for x in val)

    def process(items: List[Union[str, int]]) -> str:
        if isStringList(items):
            return ",".join(items)
        return "mixed"

    process(["a", "b"]), process([1, 2])
  exercise:
    prompt: 타입 가드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from typing import TypeGuard, List, Union

      def isStringList(val: List[Union[str, int]]) -> TypeGuard[List[str]]:
          return all(isinstance(x, str) for x in val)

      def process(items: List[Union[str, int]]) -> str:
          if isStringList(items):
              return ",".join(items)
          return "mixed"

      process(["a", "b"]), process([1, 2])
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 타입 가드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 타입 가드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 결제 요청 데이터 계약 만들기'
  structuredPrimary: true
  subtitle: Literal, Final, TypedDict, Annotated, NewType을 실행 가능한 검증 흐름으로 연결합니다
  goal: '현업 흐름 검증: 결제 요청 데이터 계약 만들기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    정밀한 typing은 API 경계에서 특히 효과가 큽니다. 결제 요청 딕셔너리의 필수 키, 허용 값, 금액 제한을 타입으로 표현하고, 런타임 검증 함수가 같은 계약을 지키는지 확인하세요.

    변주 실험
    \`refund\` 메서드를 추가할 때 허용 통화와 금액 범위를 어떻게 바꿔야 하는지 \`Literal\`과 검증 함수를 같이 수정한 뒤 실패 케이스를 먼저 작성하세요.
  tips:
  - 변주 실험 \`refund\` 메서드를 추가할 때 허용 통화와 금액 범위를 어떻게 바꿔야 하는지 \`Literal\`과 검증 함수를 같이 수정한 뒤 실패 케이스를 먼저 작성하세요.
  snippet: |-
    from typing import Annotated, Final, Literal, NewType, TypedDict, get_args, get_origin

    OrderId = NewType("OrderId", str)
    Currency = Literal["KRW", "USD"]
    Method = Literal["card", "bank"]
    PositiveAmount = Annotated[int, "positive"]
    MAX_AMOUNT: Final[int] = 1_000_000

    class PaymentPayload(TypedDict):
        orderId: str
        amount: int
        currency: Currency
        method: Method

    def validatePayment(payload: PaymentPayload) -> PaymentPayload:
        required = {"orderId", "amount", "currency", "method"}
        missing = required - payload.keys()
        if missing:
            raise KeyError(f"missing keys: {sorted(missing)}")
        if payload["currency"] not in get_args(Currency):
            raise ValueError("unsupported currency")
        if payload["method"] not in get_args(Method):
            raise ValueError("unsupported method")
        if not 0 < payload["amount"] <= MAX_AMOUNT:
            raise ValueError("amount out of range")
        return payload

    request: PaymentPayload = {
        "orderId": OrderId("O-100"),
        "amount": 49_000,
        "currency": "KRW",
        "method": "card",
    }

    checked = validatePayment(request)

    assert checked["orderId"] == "O-100"
    assert get_origin(PositiveAmount) is Annotated
    assert get_args(Currency) == ("KRW", "USD")
  exercise:
    prompt: '현업 흐름 검증: 결제 요청 데이터 계약 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      from typing import Annotated, Final, Literal, NewType, TypedDict, get_args, get_origin

      OrderId = NewType("OrderId", str)
      Currency = Literal["KRW", "USD"]
      Method = Literal["card", "bank"]
      PositiveAmount = Annotated[int, "positive"]
      MAX_AMOUNT: Final[int] = 1_000_000

      class PaymentPayload(TypedDict):
          orderId: str
          amount: int
          currency: Currency
          method: Method

      def validatePayment(payload: PaymentPayload) -> PaymentPayload:
          required = {"orderId", "amount", "currency", "method"}
          missing = required - payload.keys()
          if missing:
              raise KeyError(f"missing keys: {sorted(missing)}")
          if payload["currency"] not in get_args(Currency):
              raise ValueError("unsupported currency")
          if payload["method"] not in get_args(Method):
              raise ValueError("unsupported method")
          if not 0 < payload["amount"] <= MAX_AMOUNT:
              raise ValueError("amount out of range")
          return payload

      request: PaymentPayload = {
          "orderId": OrderId("O-100"),
          "amount": 49_000,
          "currency": "KRW",
          "method": "card",
      }

      checked = validatePayment(request)

      assert checked["orderId"] == "O-100"
      assert get_origin(PositiveAmount) is Annotated
      assert get_args(Currency) == ("KRW", "USD")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: '현업 흐름 검증: 결제 요청 데이터 계약 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 결제 요청 데이터 계약 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: typing 고급 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 15에서 배운 고급 typing을 난이도별로 복습합니다. Literal로 특정 값만 허용하고, Final로 상수를 표시하며, TypedDict로 딕셔너리
    구조를, Annotated로 메타데이터를 표현합니다. NewType은 같은 기본 타입이지만 의미가 다른 값을 구별하고, TypeGuard는 타입 좁히기 함수를 정의합니다. 🟢
    기본 문제로 각 타입의 기본 사용법을 익히고, 🟡 응용 문제로 복합 타입과 overload 조합을 연습하세요. 🔴 심화 문제에서는 Unpack, 재귀 타입, Self 등 최신
    타입 시스템을 다룹니다. 정밀한 타입 정의는 타입 체커의 도움을 극대화하고 런타임 버그를 사전에 방지합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from typing import Literal

    def getColor(name: Literal['red', 'green', 'blue']) -> str:
        return f"Color: {name}"

    getColor('red')
  exercise:
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from typing import Literal

      def getColor(name: Literal['red', 'green', 'blue']) -> str:
          return f"Color: {name}"

      getColor('red')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 15_advanced_typing-payment-contract-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - literal
    - typeddict
    - annotated
    - newtype
    - workflow_validation
    title: Literal과 TypedDict로 결제 요청 데이터 계약 검증하기
    subtitle: payment payload contract
    goal: 결제 payload를 받아 필수 키, 허용 currency/method, 금액 범위, Annotated 메타데이터를 검증해 요약을 반환한다.
    why: 고급 typing은 타입 체커 장식이 아니라 API 경계에서 허용 값과 딕셔너리 구조를 명시하고 런타임 검증과 나란히 두는 데 가치가 있습니다.
    explanation: validate_payment_payload(payload)를 완성해 Literal 허용값, TypedDict 필수 키, NewType order id, Annotated positive
      metadata를 함께 확인하세요.
    tips:
    - Literal 허용값은 get_args로 런타임 검증에 재사용할 수 있습니다.
    - TypedDict는 런타임에는 dict이므로 필수 키 검증은 직접 해야 합니다.
    exercise:
      prompt: validate_payment_payload(payload)를 완성해 orderId, accepted, metadata, maxAmount를 반환하세요.
      starterCode: |-
        def validate_payment_payload(payload):
            raise NotImplementedError
      solution: |-
        def validate_payment_payload(payload):
            from typing import Annotated, Final, Literal, NewType, TypedDict, get_args, get_origin

            OrderId = NewType("OrderId", str)
            Currency = Literal["KRW", "USD"]
            Method = Literal["card", "bank"]
            PositiveAmount = Annotated[int, "positive"]
            MAX_AMOUNT: Final[int] = 1_000_000

            class PaymentPayload(TypedDict):
                orderId: str
                amount: int
                currency: Currency
                method: Method

            required = set(PaymentPayload.__annotations__)
            missing = required - payload.keys()
            if missing:
                raise KeyError(f"missing keys: {sorted(missing)}")
            if payload["currency"] not in get_args(Currency):
                raise ValueError("unsupported currency")
            if payload["method"] not in get_args(Method):
                raise ValueError("unsupported method")
            if not 0 < payload["amount"] <= MAX_AMOUNT:
                raise ValueError("amount out of range")

            order_id = OrderId(payload["orderId"])
            return {
                "orderId": order_id,
                "accepted": True,
                "metadata": list(get_args(PositiveAmount)[1:]),
                "originIsAnnotated": get_origin(PositiveAmount) is Annotated,
                "maxAmount": MAX_AMOUNT,
            }
      hints:
      - NewType은 런타임 변환을 하지 않지만 의미 있는 타입 이름을 붙입니다.
      - Annotated의 첫 번째 인자는 실제 타입이고 이후 값이 메타데이터입니다.
    check:
      id: python.advanced.typing-payment.contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.typing-payment.empty.behavior.v1.fixture
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
        entry: validate_payment_payload
        cases:
        - id: validates-payment-contract
          arguments:
          - value:
              orderId: O-100
              amount: 49000
              currency: KRW
              method: card
          expectedReturn:
            orderId: O-100
            accepted: true
            metadata:
            - positive
            originIsAnnotated: true
            maxAmount: 1000000
        - id: rejects-unsupported-currency
          arguments:
          - value:
              orderId: O-100
              amount: 49000
              currency: EUR
              method: card
          expectedException: ValueError
        - id: rejects-missing-required-key
          arguments:
          - value:
              orderId: O-100
              amount: 49000
              currency: KRW
          expectedException: KeyError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 15_advanced_typing-typeguard-tags-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - type_guards
    - literal
    - final
    title: TypeGuard로 태그 배치와 혼합 배치를 구분하기
    subtitle: runtime narrowing with TypeGuard
    goal: 여러 배치를 받아 모든 항목이 문자열인 배치는 join하고 혼합 배치는 mixed로 표시한다.
    why: 전이 과제에서는 결제 payload 밖에서 TypeGuard를 사용해 단순 isinstance보다 복잡한 리스트 내부 조건으로 타입을 좁히는 감각을 확인합니다.
    explanation: summarize_tag_batches(batches)를 완성해 list[str]로 좁혀진 배치와 혼합 배치를 서로 다르게 처리하세요.
    tips:
    - TypeGuard 함수는 True일 때만 이후 코드에서 더 좁은 타입으로 해석됩니다.
    - 빈 배치는 태그로 의미가 없으므로 ValueError로 막으세요.
    exercise:
      prompt: summarize_tag_batches(batches)를 완성해 joined, mixedCount, batchCount를 반환하세요.
      starterCode: |-
        def summarize_tag_batches(batches):
            raise NotImplementedError
      solution: |-
        def summarize_tag_batches(batches):
            from typing import Final, TypeGuard

            EMPTY_MARKER: Final[str] = "empty"

            def is_string_list(value: list[object]) -> TypeGuard[list[str]]:
                return bool(value) and all(isinstance(item, str) for item in value)

            joined = []
            mixed_count = 0
            for batch in batches:
                if not batch:
                    raise ValueError(EMPTY_MARKER)
                if is_string_list(batch):
                    joined.append(",".join(batch))
                else:
                    mixed_count += 1
                    joined.append("mixed")
            return {
                "joined": joined,
                "mixedCount": mixed_count,
                "batchCount": len(batches),
            }
      hints:
      - all(isinstance(...)) 조건이 True일 때만 문자열 join이 안전합니다.
      - Final은 런타임 보호가 아니라 상수 의도 표시입니다.
    check:
      id: python.advanced.typing-payment.typeguard-tags.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.typing-payment.empty.behavior.v1.fixture
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
        entry: summarize_tag_batches
        cases:
        - id: separates-string-and-mixed-batches
          arguments:
          - value:
            - - paid
              - vip
            - - 1
              - draft
            - - retry
          expectedReturn:
            joined:
            - paid,vip
            - mixed
            - retry
            mixedCount: 1
            batchCount: 3
        - id: rejects-empty-batch
          arguments:
          - value:
            - []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 15_advanced_typing-advanced-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 15_advanced_typing-typeguard-tags-transfer
    title: Literal, Final, TypedDict, Annotated, NewType, TypeGuard 선택 기준 회상하기
    subtitle: advanced typing recall
    goal: 목적 이름을 받아 적절한 고급 typing 도구와 런타임 영향 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 고급 typing 목록보다, 허용값 제한, 딕셔너리 구조, 의미 타입, 타입 좁히기처럼 각각 해결하는 문제가 다르다는 점입니다.
    explanation: choose_advanced_typing_tool(goal)를 완성해 allowed-values, constant-intent, dict-shape, metadata, semantic-id,
      narrow-list 목적별 도구를 고르세요.
    tips:
    - TypedDict는 dict 구조를 타입으로 표현하지만 런타임 검증은 직접 해야 합니다.
    - TypeGuard는 사용자 정의 조건으로 타입을 좁히는 함수에 씁니다.
    exercise:
      prompt: choose_advanced_typing_tool(goal)를 완성해 목적별 고급 typing 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_advanced_typing_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_advanced_typing_tool(goal):
            table = {
                "allowed-values": {
                    "tool": "Literal",
                    "runtimeEffect": False,
                    "useWhen": "only specific string or number values are allowed",
                },
                "constant-intent": {
                    "tool": "Final",
                    "runtimeEffect": False,
                    "useWhen": "a name should not be reassigned by convention and type checker",
                },
                "dict-shape": {
                    "tool": "TypedDict",
                    "runtimeEffect": False,
                    "useWhen": "a dict has known required keys and value types",
                },
                "metadata": {
                    "tool": "Annotated",
                    "runtimeEffect": False,
                    "useWhen": "attach validation or documentation metadata to a type",
                },
                "semantic-id": {
                    "tool": "NewType",
                    "runtimeEffect": False,
                    "useWhen": "same base type has different domain meaning",
                },
                "narrow-list": {
                    "tool": "TypeGuard",
                    "runtimeEffect": False,
                    "useWhen": "a boolean function proves a narrower type",
                },
            }
            if goal not in table:
                raise ValueError("unknown advanced typing goal")
            return table[goal]
      hints:
      - 대부분의 고급 typing 도구는 타입 체커를 위한 신호입니다.
      - 런타임 경계에서는 타입 힌트와 별개로 검증 코드를 작성해야 합니다.
    check:
      id: python.advanced.typing-payment.advanced-tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.typing-payment.empty.behavior.v1.fixture
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
        entry: choose_advanced_typing_tool
        cases:
        - id: recalls-typeddict-for-dict-shape
          arguments:
          - value: dict-shape
          expectedReturn:
            tool: TypedDict
            runtimeEffect: false
            useWhen: a dict has known required keys and value types
        - id: recalls-typeguard-for-narrowing
          arguments:
          - value: narrow-list
          expectedReturn:
            tool: TypeGuard
            runtimeEffect: false
            useWhen: a boolean function proves a narrower type
        - id: rejects-unknown-goal
          arguments:
          - value: runtime-database-schema
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