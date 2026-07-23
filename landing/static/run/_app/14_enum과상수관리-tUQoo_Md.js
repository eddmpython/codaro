var e=`meta:\r
  id: '14'\r
  title: enum과 상수 관리\r
  day: 14\r
  category: advancedPython\r
  tags:\r
  - Enum\r
  - IntEnum\r
  - Flag\r
  - auto\r
  - StrEnum\r
  - 검증\r
  - 상태모델\r
  seo:\r
    title: 파이썬 Enum 완벽 가이드 - 열거형과 상수 관리\r
    description: Enum으로 명명된 상수를 관리합니다. IntEnum, StrEnum, Flag, auto() 완벽 이해.\r
    keywords:\r
    - Enum\r
    - IntEnum\r
    - Flag\r
    - auto\r
    - 상수\r
intro:\r
  emoji: 🏷️\r
  points:\r
  - Enum으로 명명된 상수 집합\r
  - IntEnum, StrEnum으로 타입 호환\r
  - Flag로 비트 플래그 조합\r
  - auto()로 자동 값 할당\r
  direction: enum과 상수 관리에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - enum과 상수 관리 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: Enum 기초 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: IntEnum 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: StrEnum 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: enum과 상수 관리 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: enum과 상수 관리 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: enum과 상수 관리 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: enum_basic\r
  title: Enum 기초\r
  structuredPrimary: true\r
  subtitle: 명명된 상수\r
  goal: Enum 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Enum은 명명된 상수의 집합을 정의합니다. 관련된 상수들을 그룹화하고 타입 안전성을 제공합니다. 각 멤버는 이름(name)과 값(value)을 가집니다. Enum 멤버는 싱글톤으로 항상 동일한 객체입니다. 이름이나 값으로 멤버에 접근할 수 있습니다. 반복(iteration)과 비교 연산을 지원합니다.\r
\r
    Enum 멤버는 is로 비교하는 것이 권장됩니다 (싱글톤).\r
  snippet: |-\r
    from enum import Enum\r
\r
    class Color(Enum):\r
        RED = 1\r
        GREEN = 2\r
        BLUE = 3\r
\r
    Color.RED, Color.RED.name, Color.RED.value\r
  exercise:\r
    prompt: Enum 기초 예제에서 \`RED\`, \`GREEN\`, \`BLUE\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import Enum\r
\r
      class Color(Enum):\r
          RED = 1\r
          GREEN = 2\r
          BLUE = 3\r
\r
      Color.RED, Color.RED.name, Color.RED.value\r
    hints:\r
    - 바꿀 지점은 \`RED = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`RED\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: Enum 기초에서 \`RED\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Enum 기초 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: intenum\r
  title: IntEnum\r
  structuredPrimary: true\r
  subtitle: 정수 호환\r
  goal: IntEnum에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    IntEnum은 정수와 호환되는 열거형입니다. int를 상속받아 정수 연산과 비교가 가능합니다. 정수가 필요한 곳에서 직접 사용할 수 있습니다. 일반 Enum은 정수와 비교하면 항상 False입니다. 기존 정수 상수를 Enum으로 마이그레이션할 때 유용합니다. 주의: 정수와의 암시적 비교가 가능해 타입 안전성이 다소 약해집니다.\r
\r
    IntEnum 대신 Enum을 사용하고 .value로 정수를 얻는 것이 더 안전합니다.\r
  snippet: |-\r
    from enum import IntEnum\r
\r
    class HTTPStatus(IntEnum):\r
        OK = 200\r
        NOT_FOUND = 404\r
        SERVER_ERROR = 500\r
\r
    HTTPStatus.OK == 200, HTTPStatus.OK + 1, HTTPStatus.OK < 300\r
  exercise:\r
    prompt: IntEnum 예제에서 \`OK\`, \`NOT_FOUND\`, \`SERVER_ERROR\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import IntEnum\r
\r
      class HTTPStatus(IntEnum):\r
          OK = 200\r
          NOT_FOUND = 404\r
          SERVER_ERROR = 500\r
\r
      HTTPStatus.OK == 200, HTTPStatus.OK + 1, HTTPStatus.OK < 300\r
    hints:\r
    - 바꿀 지점은 \`OK = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`OK\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: IntEnum에서 \`OK\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: IntEnum 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: strenum\r
  title: StrEnum\r
  structuredPrimary: true\r
  subtitle: 문자열 호환\r
  goal: StrEnum에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    StrEnum은 Python 3.11에서 도입된 문자열 호환 열거형입니다. str을 상속받아 문자열 연산이 가능합니다. 문자열이 필요한 곳에서 직접 사용할 수 있습니다. API 응답, 설정 값 등 문자열 상수에 유용합니다. Python 3.10 이하에서는 str과 Enum을 다중 상속하여 비슷하게 구현할 수 있습니다.\r
\r
    StrEnum에서 auto()는 멤버 이름을 소문자로 변환한 값을 사용합니다.\r
  snippet: |-\r
    from enum import StrEnum\r
\r
    class ContentType(StrEnum):\r
        JSON = "application/json"\r
        HTML = "text/html"\r
        XML = "application/xml"\r
\r
    ContentType.JSON == "application/json", ContentType.JSON.upper()\r
  exercise:\r
    prompt: StrEnum 예제에서 \`JSON\`, \`HTML\`, \`XML\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import StrEnum\r
\r
      class ContentType(StrEnum):\r
          JSON = "application/json"\r
          HTML = "text/html"\r
          XML = "application/xml"\r
\r
      ContentType.JSON == "application/json", ContentType.JSON.upper()\r
    hints:\r
    - 바꿀 지점은 \`JSON = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`JSON\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: StrEnum에서 \`JSON\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: StrEnum 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: flag\r
  title: Flag\r
  structuredPrimary: true\r
  subtitle: 비트 플래그\r
  goal: Flag에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Flag는 비트 연산으로 조합할 수 있는 열거형입니다. 각 멤버는 2의 거듭제곱(1, 2, 4, 8, ...)이어야 합니다. |, &, ~, ^ 연산자로 플래그를 조합하거나 검사합니다. 권한, 옵션, 상태 조합 등에 유용합니다. IntFlag는 정수와도 호환됩니다. auto()는 자동으로 2의 거듭제곱을 할당합니다.\r
\r
    Flag(0)은 빈 플래그를 나타내며, 보통 NONE이라고 이름 짓습니다.\r
  snippet: |-\r
    from enum import Flag, auto\r
\r
    class Permission(Flag):\r
        READ = auto()\r
        WRITE = auto()\r
        EXECUTE = auto()\r
\r
    Permission.READ.value, Permission.WRITE.value, Permission.EXECUTE.value\r
  exercise:\r
    prompt: Flag 예제에서 \`READ\`, \`WRITE\`, \`EXECUTE\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import Flag, auto\r
\r
      class Permission(Flag):\r
          READ = auto()\r
          WRITE = auto()\r
          EXECUTE = auto()\r
\r
      Permission.READ.value, Permission.WRITE.value, Permission.EXECUTE.value\r
    hints:\r
    - 바꿀 지점은 \`READ = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`READ\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: Flag에서 \`READ\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Flag 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: auto\r
  title: auto()\r
  structuredPrimary: true\r
  subtitle: 자동 값 할당\r
  goal: auto()에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    auto()는 열거형 값을 자동으로 할당합니다. Enum에서는 1부터 시작하는 정수를 순차적으로 할당합니다. Flag에서는 1, 2, 4, 8, ... 2의 거듭제곱을 할당합니다. StrEnum에서는 멤버 이름의 소문자를 값으로 사용합니다. _generate_next_value_ 메서드를 오버라이드하여 커스터마이징할 수 있습니다.\r
\r
    auto()와 명시적 값을 섞어 사용하면 예상치 못한 결과가 나올 수 있습니다.\r
  snippet: |-\r
    from enum import Enum, auto\r
\r
    class Priority(Enum):\r
        LOW = auto()\r
        MEDIUM = auto()\r
        HIGH = auto()\r
        CRITICAL = auto()\r
\r
    [(p.name, p.value) for p in Priority]\r
  exercise:\r
    prompt: auto() 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      from enum import Enum, auto\r
\r
      class Priority(Enum):\r
          LOW = auto()\r
          MEDIUM = auto()\r
          HIGH = auto()\r
          CRITICAL = auto()\r
\r
      [(p.name, p.value) for p in Priority]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: auto()의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: auto() 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practical_enum\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 상태 머신과 설정\r
  goal: 실전 활용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    Enum은 상태 머신, 설정 관리, API 응답 등에 활용됩니다. 메서드를 추가하여 동작을 정의할 수 있습니다. @unique 데코레이터로 중복 값을 금지합니다. 값이 같은 멤버는 별칭(alias)이 됩니다. _missing_ 메서드로 없는 값 처리를 커스터마이징합니다. match 문(Python 3.10+)과 잘 어울립니다.\r
\r
    Enum은 딕셔너리 키로 사용할 수 있어 상태별 처리 함수 매핑에 유용합니다.\r
  snippet: |-\r
    from enum import Enum\r
\r
    class Planet(Enum):\r
        MERCURY = (3.303e+23, 2.4397e6)\r
        EARTH = (5.976e+24, 6.37814e6)\r
        MARS = (6.421e+23, 3.3972e6)\r
\r
        def __init__(self, mass, radius):\r
            self.mass = mass\r
            self.radius = radius\r
\r
        @property\r
        def surfaceGravity(self):\r
            G = 6.67e-11\r
            return G * self.mass / (self.radius ** 2)\r
\r
    Planet.EARTH.surfaceGravity\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from enum import Enum\r
\r
      class Planet(Enum):\r
          MERCURY = (3.303e+23, 2.4397e6)\r
          EARTH = (5.976e+24, 6.37814e6)\r
          MARS = (6.421e+23, 3.3972e6)\r
\r
          def __init__(self, mass, radius):\r
              self.mass = mass\r
              self.radius = radius\r
\r
          @property\r
          def surfaceGravity(self):\r
              G = 6.67e-11\r
              return G * self.mass / (self.radius ** 2)\r
\r
      Planet.EARTH.surfaceGravity\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 상태 머신과 권한 플래그'\r
  structuredPrimary: true\r
  subtitle: StrEnum, IntEnum, Flag로 문자열 상수와 매직 넘버를 제거합니다\r
  goal: '현업 흐름 검증: 주문 상태 머신과 권한 플래그에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Enum은 값 목록을 예쁘게 묶는 수준에서 끝나면 약합니다. 주문 상태 전이, 경고 심각도, 권한 조합처럼 실수 비용이 큰 규칙을 Enum으로 모델링하고 잘못된 값이 어디서 차단되는지 검증하세요.\r
\r
    변주 실험\r
    \`REFUND_REQUESTED\` 상태와 \`Permission.REFUND\` 권한을 연결하고, 권한이 없는 사용자는 환불 전이를 실행할 수 없도록 함수를 확장하세요.\r
  tips:\r
  - 변주 실험 \`REFUND_REQUESTED\` 상태와 \`Permission.REFUND\` 권한을 연결하고, 권한이 없는 사용자는 환불 전이를 실행할 수 없도록 함수를 확장하세요.\r
  snippet: |-\r
    from enum import Flag, IntEnum, StrEnum, auto\r
\r
    class OrderStatus(StrEnum):\r
        DRAFT = "draft"\r
        PAID = "paid"\r
        SHIPPED = "shipped"\r
        CANCELLED = "cancelled"\r
\r
    class Severity(IntEnum):\r
        INFO = 1\r
        WARNING = 2\r
        CRITICAL = 3\r
\r
    class Permission(Flag):\r
        READ = auto()\r
        WRITE = auto()\r
        REFUND = auto()\r
\r
    allowedTransitions = {\r
        OrderStatus.DRAFT: {OrderStatus.PAID, OrderStatus.CANCELLED},\r
        OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},\r
        OrderStatus.SHIPPED: set(),\r
        OrderStatus.CANCELLED: set(),\r
    }\r
\r
    def transition(current: OrderStatus, nextStatus: OrderStatus) -> OrderStatus:\r
        if nextStatus not in allowedTransitions[current]:\r
            raise ValueError(f"cannot move {current.value} to {nextStatus.value}")\r
        return nextStatus\r
\r
    operatorPermission = Permission.READ | Permission.WRITE\r
\r
    assert transition(OrderStatus.DRAFT, OrderStatus.PAID) is OrderStatus.PAID\r
    assert Severity.CRITICAL > Severity.WARNING\r
    assert operatorPermission & Permission.WRITE\r
    assert not operatorPermission & Permission.REFUND\r
    assert OrderStatus("paid") is OrderStatus.PAID\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 상태 머신과 권한 플래그 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from enum import Flag, IntEnum, StrEnum, auto\r
\r
      class OrderStatus(StrEnum):\r
          DRAFT = "draft"\r
          PAID = "paid"\r
          SHIPPED = "shipped"\r
          CANCELLED = "cancelled"\r
\r
      class Severity(IntEnum):\r
          INFO = 1\r
          WARNING = 2\r
          CRITICAL = 3\r
\r
      class Permission(Flag):\r
          READ = auto()\r
          WRITE = auto()\r
          REFUND = auto()\r
\r
      allowedTransitions = {\r
          OrderStatus.DRAFT: {OrderStatus.PAID, OrderStatus.CANCELLED},\r
          OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},\r
          OrderStatus.SHIPPED: set(),\r
          OrderStatus.CANCELLED: set(),\r
      }\r
\r
      def transition(current: OrderStatus, nextStatus: OrderStatus) -> OrderStatus:\r
          if nextStatus not in allowedTransitions[current]:\r
              raise ValueError(f"cannot move {current.value} to {nextStatus.value}")\r
          return nextStatus\r
\r
      operatorPermission = Permission.READ | Permission.WRITE\r
\r
      assert transition(OrderStatus.DRAFT, OrderStatus.PAID) is OrderStatus.PAID\r
      assert Severity.CRITICAL > Severity.WARNING\r
      assert operatorPermission & Permission.WRITE\r
      assert not operatorPermission & Permission.REFUND\r
      assert OrderStatus("paid") is OrderStatus.PAID\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: 주문 상태 머신과 권한 플래그의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 상태 머신과 권한 플래그 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: Enum 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Day 14에서 배운 Enum을 난이도별로 복습합니다. Enum은 명명된 상수의 집합을 정의하여 타입 안전성과 코드 가독성을 높이는 도구입니다. IntEnum,\r
    StrEnum으로 기본 타입과 호환되고, Flag로 비트 플래그 조합을 표현합니다. 🟢 기본 문제로 Enum 정의, auto(), 멤버 접근을 익히고, 🟡 응용 문제로 Flag\r
    조합, 메서드 추가를 연습하세요. 🔴 심화 문제에서는 상태 머신, 권한 시스템, JSON 직렬화 등 실무 패턴을 다룹니다. 매직 넘버나 문자열 상수 대신 Enum을 사용하면 버그를\r
    예방하고 IDE 자동완성의 도움을 받을 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from enum import Enum\r
\r
    class Day(Enum):\r
        MON = 1\r
        TUE = 2\r
        WED = 3\r
\r
    Day.MON, Day.MON.value\r
  exercise:\r
    prompt: 종합 복습 예제에서 \`MON\`, \`TUE\`, \`WED\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import Enum\r
\r
      class Day(Enum):\r
          MON = 1\r
          TUE = 2\r
          WED = 3\r
\r
      Day.MON, Day.MON.value\r
    hints:\r
    - 바꿀 지점은 \`MON = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`MON\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습에서 \`MON\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 14_advanced_enum-order-state-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - strenum
    - intenum
    - flag
    - workflow_validation
    title: StrEnum 상태와 Flag 권한으로 주문 전이 검증하기
    subtitle: order state machine
    goal: 현재 상태, 다음 상태, 권한 이름 목록을 받아 상태 전이, 경고 수준, 권한 조합 결과를 반환한다.
    why: Enum은 문자열 상수를 예쁘게 묶는 수준에서 끝나면 약합니다. 상태 전이와 권한 조합처럼 실수 비용이 큰 규칙을 타입 있는 상수로 고정해야 합니다.
    explanation: evaluate_order_transition(current, next_status, permission_names)를 완성해 허용 전이만 통과시키고 Flag 권한 조합을 확인하세요.
    tips:
    - StrEnum은 외부 문자열 값을 내부 상태로 변환할 때 유용합니다.
    - Permission Flag는 |로 조합하고 &로 포함 여부를 확인합니다.
    exercise:
      prompt: evaluate_order_transition(current, next_status, permission_names)를 완성해 nextStatus, severity, canWrite, canRefund를 반환하세요.
      starterCode: |-
        def evaluate_order_transition(current, next_status, permission_names):
            raise NotImplementedError
      solution: |-
        def evaluate_order_transition(current, next_status, permission_names):
            from enum import Flag, IntEnum, StrEnum, auto

            class OrderStatus(StrEnum):
                DRAFT = "draft"
                PAID = "paid"
                SHIPPED = "shipped"
                CANCELLED = "cancelled"

            class Severity(IntEnum):
                INFO = 1
                WARNING = 2
                CRITICAL = 3

            class Permission(Flag):
                READ = auto()
                WRITE = auto()
                REFUND = auto()

            transitions = {
                OrderStatus.DRAFT: {OrderStatus.PAID, OrderStatus.CANCELLED},
                OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
                OrderStatus.SHIPPED: set(),
                OrderStatus.CANCELLED: set(),
            }
            current_status = OrderStatus(current)
            requested_status = OrderStatus(next_status)
            if requested_status not in transitions[current_status]:
                raise ValueError(f"cannot move {current_status.value} to {requested_status.value}")

            permission = Permission(0)
            for name in permission_names:
                permission |= Permission[name]

            severity = Severity.CRITICAL if requested_status is OrderStatus.CANCELLED else Severity.INFO
            return {
                "nextStatus": requested_status.value,
                "severity": severity.name,
                "severityRank": int(severity),
                "canWrite": bool(permission & Permission.WRITE),
                "canRefund": bool(permission & Permission.REFUND),
            }
      hints:
      - OrderStatus(current)는 지원하지 않는 문자열이면 ValueError를 냅니다.
      - Permission[name]은 enum member 이름으로 접근합니다.
    check:
      id: python.advanced.enum.order-state.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.enum.empty.behavior.v1.fixture
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
        entry: evaluate_order_transition
        cases:
        - id: accepts-paid-to-shipped-with-write-permission
          arguments:
          - value: paid
          - value: shipped
          - value:
            - READ
            - WRITE
          expectedReturn:
            nextStatus: shipped
            severity: INFO
            severityRank: 1
            canWrite: true
            canRefund: false
        - id: rejects-invalid-transition
          arguments:
          - value: shipped
          - value: paid
          - value:
            - READ
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 14_advanced_enum-job-status-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - enum_basic
    - auto
    - practical_enum
    title: auto Enum과 IntEnum으로 작업 상태 요약 만들기
    subtitle: job status summary
    goal: 작업 상태 문자열과 우선순위 숫자를 받아 enum 변환, 완료 여부, 우선순위 비교 결과를 반환한다.
    why: 전이 과제에서는 주문 상태 밖에서 외부 입력을 enum으로 정규화하고, IntEnum의 순위 비교가 언제 유용한지 확인합니다.
    explanation: summarize_job_status(raw_status, raw_priority)를 완성해 queued/running/done 상태와 low/normal/high 우선순위를 enum으로 다루세요.
    tips:
    - 알 수 없는 상태 문자열은 ValueError로 막으세요.
    - IntEnum은 정렬 또는 임계값 비교가 필요할 때만 조심해서 사용하세요.
    exercise:
      prompt: summarize_job_status(raw_status, raw_priority)를 완성해 statusName, done, highPriority, allStatuses를 반환하세요.
      starterCode: |-
        def summarize_job_status(raw_status, raw_priority):
            raise NotImplementedError
      solution: |-
        def summarize_job_status(raw_status, raw_priority):
            from enum import Enum, IntEnum, auto

            class JobStatus(Enum):
                QUEUED = auto()
                RUNNING = auto()
                DONE = auto()

                @classmethod
                def from_text(cls, value):
                    for status in cls:
                        if status.name.lower() == value:
                            return status
                    raise ValueError("unknown job status")

            class Priority(IntEnum):
                LOW = 1
                NORMAL = 2
                HIGH = 3

            status = JobStatus.from_text(raw_status)
            priority = Priority(raw_priority)
            return {
                "statusName": status.name,
                "done": status is JobStatus.DONE,
                "highPriority": priority >= Priority.HIGH,
                "allStatuses": [item.name.lower() for item in JobStatus],
            }
      hints:
      - auto 값 자체에 의존하지 말고 name으로 외부 문자열을 매핑하세요.
      - Priority(raw_priority)는 정의되지 않은 숫자면 ValueError를 냅니다.
    check:
      id: python.advanced.enum.job-status.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.enum.empty.behavior.v1.fixture
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
        entry: summarize_job_status
        cases:
        - id: normalizes-done-high-priority-job
          arguments:
          - value: done
          - value: 3
          expectedReturn:
            statusName: DONE
            done: true
            highPriority: true
            allStatuses:
            - queued
            - running
            - done
        - id: rejects-unknown-status
          arguments:
          - value: archived
          - value: 2
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 14_advanced_enum-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - enum_basic
    - intenum
    - strenum
    - flag
    - auto
    title: Enum, IntEnum, StrEnum, Flag, auto 사용처 회상하기
    subtitle: enum tool recall
    goal: 목적 이름을 받아 적절한 enum 종류와 값 호환 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 Enum 문법보다, 문자열 API 값, 정수 순위, 비트 권한, 자동 값 생성의 선택 기준입니다.
    explanation: choose_enum_tool(goal)를 완성해 named-constants, integer-rank, string-api-value, bit-permissions, automatic-values 목적별 도구를 고르세요.
    tips:
    - 정수 비교가 필요하지 않으면 IntEnum보다 Enum이 안전합니다.
    - 여러 권한을 조합해야 하면 Flag를 고려하세요.
    exercise:
      prompt: choose_enum_tool(goal)를 완성해 목적별 enum 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_enum_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_enum_tool(goal):
            table = {
                "named-constants": {
                    "tool": "Enum",
                    "compatibleWithBaseType": False,
                    "useWhen": "group related symbolic values",
                },
                "integer-rank": {
                    "tool": "IntEnum",
                    "compatibleWithBaseType": True,
                    "useWhen": "legacy integer values or ordered severity ranks",
                },
                "string-api-value": {
                    "tool": "StrEnum",
                    "compatibleWithBaseType": True,
                    "useWhen": "external API stores string values",
                },
                "bit-permissions": {
                    "tool": "Flag",
                    "compatibleWithBaseType": False,
                    "useWhen": "combine several independent options",
                },
                "automatic-values": {
                    "tool": "auto",
                    "compatibleWithBaseType": False,
                    "useWhen": "value does not need business meaning",
                },
            }
            if goal not in table:
                raise ValueError("unknown enum goal")
            return table[goal]
      hints:
      - StrEnum은 문자열과 비교 가능한 enum입니다.
      - auto는 값 자체가 중요한 데이터에는 피하세요.
    check:
      id: python.advanced.enum.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.enum.empty.behavior.v1.fixture
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
        entry: choose_enum_tool
        cases:
        - id: recalls-flag-for-bit-permissions
          arguments:
          - value: bit-permissions
          expectedReturn:
            tool: Flag
            compatibleWithBaseType: false
            useWhen: combine several independent options
        - id: recalls-strenum-for-string-api-values
          arguments:
          - value: string-api-value
          expectedReturn:
            tool: StrEnum
            compatibleWithBaseType: true
            useWhen: external API stores string values
        - id: rejects-unknown-goal
          arguments:
          - value: mutable-settings
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};