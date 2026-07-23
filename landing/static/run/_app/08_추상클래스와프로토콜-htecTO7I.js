var e=`meta:\r
  id: 08\r
  title: 추상 클래스와 프로토콜\r
  day: 8\r
  category: advancedPython\r
  tags:\r
  - abc\r
  - abstractmethod\r
  - Protocol\r
  - duck typing\r
  - 검증\r
  - 인터페이스설계\r
  seo:\r
    title: 파이썬 ABC와 Protocol - 인터페이스 설계 완벽 가이드\r
    description: 추상 클래스와 프로토콜로 인터페이스를 설계합니다. ABC, abstractmethod, 덕 타이핑, typing.Protocol 완벽 이해.\r
    keywords:\r
    - ABC\r
    - abstractmethod\r
    - Protocol\r
    - 덕타이핑\r
    - interface\r
intro:\r
  emoji: 📋\r
  points:\r
  - ABC 모듈로 추상 클래스 정의\r
  - abstractmethod로 필수 메서드 강제\r
  - 덕 타이핑의 원리와 활용\r
  - typing.Protocol로 구조적 타이핑\r
  direction: 추상 클래스와 프로토콜에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 추상 클래스와 프로토콜 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: abc 모듈 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 추상 프로퍼티 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 인터페이스 설계 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 추상 클래스와 프로토콜 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 추상 클래스와 프로토콜 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 추상 클래스와 프로토콜 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: abc_module\r
  title: abc 모듈\r
  structuredPrimary: true\r
  subtitle: 추상 클래스 기초\r
  goal: abc 모듈에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    ABC(Abstract Base Class)는 인스턴스화할 수 없는 추상 클래스입니다. abc 모듈의 ABC 클래스를 상속하거나 metaclass=ABCMeta를 지정합니다. @abstractmethod로 데코레이트된 메서드는 서브클래스에서 반드시 구현해야 합니다. 추상 메서드를 구현하지 않으면 서브클래스도 인스턴스화할 수 없습니다. ABC는 인터페이스 계약을 강제하여 API 일관성을 보장합니다. collections.abc에는 Iterable, Mapping 등 유용한 추상 클래스가 정의되어 있습니다.\r
\r
    ABC 자체를 인스턴스화하려고 하면 TypeError: Can't instantiate abstract class가 발생합니다.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Shape(ABC):\r
        @abstractmethod\r
        def area(self):\r
            pass\r
\r
        @abstractmethod\r
        def perimeter(self):\r
            pass\r
\r
    class Rectangle(Shape):\r
        def __init__(self, width, height):\r
            self.width = width\r
            self.height = height\r
\r
        def area(self):\r
            return self.width * self.height\r
\r
        def perimeter(self):\r
            return 2 * (self.width + self.height)\r
\r
    Rectangle(3, 4).area()\r
  exercise:\r
    prompt: abc 모듈 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Shape(ABC):\r
          @abstractmethod\r
          def area(self):\r
              pass\r
\r
          @abstractmethod\r
          def perimeter(self):\r
              pass\r
\r
      class Rectangle(Shape):\r
          def __init__(self, width, height):\r
              self.width = width\r
              self.height = height\r
\r
          def area(self):\r
              return self.width * self.height\r
\r
          def perimeter(self):\r
              return 2 * (self.width + self.height)\r
\r
      Rectangle(3, 4).area()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: abc 모듈의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: abc 모듈 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: abstract_property\r
  title: 추상 프로퍼티\r
  structuredPrimary: true\r
  subtitle: '@property + @abstractmethod'\r
  goal: 추상 프로퍼티에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    추상 프로퍼티는 서브클래스에서 반드시 정의해야 하는 속성입니다. @property와 @abstractmethod를 함께 사용합니다. Python 3.3 이전에는 @abstractproperty가 있었지만 이제는 데코레이터를 조합합니다. @abstractmethod는 가장 안쪽(아래쪽)에 위치해야 합니다. 추상 classmethod와 staticmethod도 같은 방식으로 정의합니다. 추상 프로퍼티는 설정자(setter)나 삭제자(deleter)도 추상화할 수 있습니다.\r
\r
    Python 3.3+에서는 @abstractproperty 대신 @property + @abstractmethod를 사용합니다.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Sized(ABC):\r
        @property\r
        @abstractmethod\r
        def size(self):\r
            pass\r
\r
    class MyList(Sized):\r
        def __init__(self, items):\r
            self._items = items\r
\r
        @property\r
        def size(self):\r
            return len(self._items)\r
\r
    MyList([1, 2, 3]).size\r
  exercise:\r
    prompt: 추상 프로퍼티 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Sized(ABC):\r
          @property\r
          @abstractmethod\r
          def size(self):\r
              pass\r
\r
      class MyList(Sized):\r
          def __init__(self, items):\r
              self._items = items\r
\r
          @property\r
          def size(self):\r
              return len(self._items)\r
\r
      MyList([1, 2, 3]).size\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 추상 프로퍼티의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 추상 프로퍼티 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: interface_design\r
  title: 인터페이스 설계\r
  structuredPrimary: true\r
  subtitle: 명시적 계약\r
  goal: 인터페이스 설계에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    ABC를 사용한 인터페이스 설계는 명시적인 계약을 만듭니다. 인터페이스를 상속받는 클래스는 정해진 메서드를 반드시 구현해야 합니다. 이는 팀 협업이나 대규모 프로젝트에서 API 일관성을 보장합니다. 추상 클래스에 docstring을 작성하면 인터페이스 문서화도 됩니다. 기본 구현을 제공하면서 일부만 추상화할 수도 있습니다. 추상 메서드 안에도 코드를 작성할 수 있으며 super()로 호출할 수 있습니다.\r
\r
    register() 메서드로 기존 클래스를 ABC의 가상 서브클래스로 등록할 수 있습니다.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Repository(ABC):\r
        """데이터 저장소 인터페이스."""\r
\r
        @abstractmethod\r
        def find(self, id):\r
            """ID로 항목을 찾습니다.\r
\r
            Args:\r
                id: 검색할 항목의 ID\r
\r
            Returns:\r
                찾은 항목 또는 None\r
            """\r
            pass\r
\r
        @abstractmethod\r
        def save(self, item):\r
            """항목을 저장합니다."""\r
            pass\r
\r
    class MemoryRepository(Repository):\r
        def __init__(self):\r
            self._data = {}\r
\r
        def find(self, id):\r
            return self._data.get(id)\r
\r
        def save(self, item):\r
            self._data[item["id"]] = item\r
\r
    repo = MemoryRepository()\r
    repo.save({"id": 1, "name": "test"})\r
    repo.find(1)\r
  exercise:\r
    prompt: 인터페이스 설계 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Repository(ABC):\r
          """데이터 저장소 인터페이스."""\r
\r
          @abstractmethod\r
          def find(self, id):\r
              """ID로 항목을 찾습니다.\r
\r
              Args:\r
                  id: 검색할 항목의 ID\r
\r
              Returns:\r
                  찾은 항목 또는 None\r
              """\r
              pass\r
\r
          @abstractmethod\r
          def save(self, item):\r
              """항목을 저장합니다."""\r
              pass\r
\r
      class MemoryRepository(Repository):\r
          def __init__(self):\r
              self._data = {}\r
\r
          def find(self, id):\r
              return self._data.get(id)\r
\r
          def save(self, item):\r
              self._data[item["id"]] = item\r
\r
      repo = MemoryRepository()\r
      repo.save({"id": 1, "name": "test"})\r
      repo.find(1)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 인터페이스 설계의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 인터페이스 설계 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: duck_typing\r
  title: 덕 타이핑\r
  structuredPrimary: true\r
  subtitle: 타입보다 행동\r
  goal: 덕 타이핑에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    덕 타이핑(duck typing)은 '오리처럼 걷고 꽥꽥거리면 오리다'라는 원칙입니다. 객체의 타입보다 객체가 어떤 메서드를 가지고 있는지가 중요합니다. 파이썬은 동적 타이핑 언어로 덕 타이핑을 자연스럽게 지원합니다. isinstance 검사 대신 hasattr이나 EAFP(허락보다 용서가 쉽다) 스타일을 사용합니다. 덕 타이핑은 유연하지만 런타임에 오류가 발생할 수 있습니다. ABC와 덕 타이핑은 상호 보완적입니다.\r
\r
    LBYL(Look Before You Leap)보다 EAFP가 파이썬에서 권장됩니다.\r
  snippet: |-\r
    class Duck:\r
        def quack(self):\r
            return "Quack!"\r
\r
        def walk(self):\r
            return "Walking"\r
\r
    class Person:\r
        def quack(self):\r
            return "I'm quacking like a duck!"\r
\r
        def walk(self):\r
            return "Walking like a duck"\r
\r
    def makeQuack(thing):\r
        return thing.quack()\r
\r
    makeQuack(Duck()), makeQuack(Person())\r
  exercise:\r
    prompt: 덕 타이핑 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Duck:\r
          def quack(self):\r
              return "Quack!"\r
\r
          def walk(self):\r
              return "Walking"\r
\r
      class Person:\r
          def quack(self):\r
              return "I'm quacking like a duck!"\r
\r
          def walk(self):\r
              return "Walking like a duck"\r
\r
      def makeQuack(thing):\r
          return thing.quack()\r
\r
      makeQuack(Duck()), makeQuack(Person())\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 덕 타이핑의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 덕 타이핑 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: protocol_typing\r
  title: typing.Protocol\r
  structuredPrimary: true\r
  subtitle: 구조적 서브타이핑\r
  goal: typing.Protocol에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    typing.Protocol은 Python 3.8에서 도입된 구조적 서브타이핑입니다. 명시적으로 상속하지 않아도 필요한 메서드를 가지면 타입 검사를 통과합니다. 덕 타이핑을 정적 타입 검사와 결합합니다. runtime_checkable 데코레이터를 추가하면 isinstance로도 검사할 수 있습니다. Protocol은 ABC와 달리 상속이 필요 없어 기존 클래스와의 호환성이 좋습니다.\r
\r
    Protocol은 타입 힌팅용이며, runtime_checkable은 메서드 존재만 확인하고 시그니처는 검사하지 않습니다.\r
  snippet: |-\r
    from typing import Protocol\r
\r
    class Drawable(Protocol):\r
        def draw(self) -> str:\r
            ...\r
\r
    class Circle:\r
        def draw(self) -> str:\r
            return "Drawing circle"\r
\r
    class Square:\r
        def draw(self) -> str:\r
            return "Drawing square"\r
\r
    def render(shape: Drawable) -> str:\r
        return shape.draw()\r
\r
    render(Circle()), render(Square())\r
  exercise:\r
    prompt: typing.Protocol 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from typing import Protocol\r
\r
      class Drawable(Protocol):\r
          def draw(self) -> str:\r
              ...\r
\r
      class Circle:\r
          def draw(self) -> str:\r
              return "Drawing circle"\r
\r
      class Square:\r
          def draw(self) -> str:\r
              return "Drawing square"\r
\r
      def render(shape: Drawable) -> str:\r
          return shape.draw()\r
\r
      render(Circle()), render(Square())\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: typing.Protocol의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: typing.Protocol 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical_abc\r
  title: 실전 ABC\r
  structuredPrimary: true\r
  subtitle: 플러그인과 전략 패턴\r
  goal: 실전 ABC에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    ABC는 플러그인 시스템이나 전략 패턴 구현에 유용합니다. 플러그인 시스템에서 모든 플러그인이 구현해야 할 인터페이스를 ABC로 정의합니다. 전략 패턴에서 다양한 알고리즘을 같은 인터페이스로 교체할 수 있습니다. 의존성 주입(Dependency Injection)에서도 인터페이스를 ABC로 정의합니다. register 메서드로 기존 클래스를 가상 서브클래스로 등록할 수 있습니다.\r
\r
    가상 서브클래스는 isinstance를 통과하지만 실제로 추상 메서드 구현을 강제하지는 않습니다.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Plugin(ABC):\r
        @property\r
        @abstractmethod\r
        def name(self) -> str:\r
            pass\r
\r
        @abstractmethod\r
        def execute(self, data: dict) -> dict:\r
            pass\r
\r
    class ValidationPlugin(Plugin):\r
        @property\r
        def name(self) -> str:\r
            return "validator"\r
\r
        def execute(self, data: dict) -> dict:\r
            data["validated"] = True\r
            return data\r
\r
    class LoggingPlugin(Plugin):\r
        @property\r
        def name(self) -> str:\r
            return "logger"\r
\r
        def execute(self, data: dict) -> dict:\r
            data["logged"] = True\r
            return data\r
\r
    plugins = [ValidationPlugin(), LoggingPlugin()]\r
    result = {"value": 42}\r
    for p in plugins:\r
        result = p.execute(result)\r
    result\r
  exercise:\r
    prompt: 실전 ABC 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Plugin(ABC):\r
          @property\r
          @abstractmethod\r
          def name(self) -> str:\r
              pass\r
\r
          @abstractmethod\r
          def execute(self, data: dict) -> dict:\r
              pass\r
\r
      class ValidationPlugin(Plugin):\r
          @property\r
          def name(self) -> str:\r
              return "validator"\r
\r
          def execute(self, data: dict) -> dict:\r
              data["validated"] = True\r
              return data\r
\r
      class LoggingPlugin(Plugin):\r
          @property\r
          def name(self) -> str:\r
              return "logger"\r
\r
          def execute(self, data: dict) -> dict:\r
              data["logged"] = True\r
              return data\r
\r
      plugins = [ValidationPlugin(), LoggingPlugin()]\r
      result = {"value": 42}\r
      for p in plugins:\r
          result = p.execute(result)\r
      result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 실전 ABC의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 ABC 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 내보내기 인터페이스 설계하기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 명시 계약 → 구조적 타입 → 실패 확인\r
  goal: '현업 흐름 검증: 내보내기 인터페이스 설계하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    ABC는 런타임 계약을 강제하고, Protocol은 구조적 타입으로 기존 객체와의 결합을 줄입니다. 리포트 내보내기 흐름에서 저장소는 ABC로 강제하고 포맷터는 Protocol로 유연하게 받습니다.\r
\r
    변주 실험\r
    JSON 포맷터를 추가하고, 기존 \`exportRows\` 함수는 수정하지 않은 채 저장 결과만 assert로 추가하세요.\r
  tips:\r
  - 변주 실험 JSON 포맷터를 추가하고, 기존 \`exportRows\` 함수는 수정하지 않은 채 저장 결과만 assert로 추가하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
    from typing import Protocol, runtime_checkable\r
\r
    @runtime_checkable\r
    class RowFormatter(Protocol):\r
        def render(self, rows: list[dict]) -> str:\r
            ...\r
\r
    class ReportSink(ABC):\r
        @abstractmethod\r
        def write(self, name: str, content: str) -> str:\r
            pass\r
\r
    class CsvFormatter:\r
        def render(self, rows):\r
            header = ",".join(rows[0])\r
            lines = [header]\r
            for row in rows:\r
                lines.append(",".join(str(row[key]) for key in rows[0]))\r
            return "\\n".join(lines)\r
\r
    class MemorySink(ReportSink):\r
        def __init__(self):\r
            self.files = {}\r
\r
        def write(self, name, content):\r
            self.files[name] = content\r
            return name\r
\r
    def exportRows(formatter: RowFormatter, sink: ReportSink, name: str, rows: list[dict]):\r
        if not isinstance(formatter, RowFormatter):\r
            raise TypeError("formatter must implement render")\r
        content = formatter.render(rows)\r
        return sink.write(name, content)\r
\r
    rows = [{"id": "A-100", "amount": 12000}, {"id": "A-101", "amount": 9000}]\r
    sink = MemorySink()\r
    savedName = exportRows(CsvFormatter(), sink, "orders.csv", rows)\r
\r
    assert savedName == "orders.csv"\r
    assert sink.files["orders.csv"] == "id,amount\\nA-100,12000\\nA-101,9000"\r
    assert isinstance(CsvFormatter(), RowFormatter)\r
\r
    try:\r
        ReportSink()\r
    except TypeError as exc:\r
        assert "abstract" in str(exc)\r
\r
    try:\r
        exportRows(object(), sink, "broken.csv", rows)\r
    except TypeError as exc:\r
        assert "formatter" in str(exc)\r
\r
    print("ABC와 Protocol 내보내기 흐름 통과")\r
  exercise:\r
    prompt: '현업 흐름 검증: 내보내기 인터페이스 설계하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
      from typing import Protocol, runtime_checkable\r
\r
      @runtime_checkable\r
      class RowFormatter(Protocol):\r
          def render(self, rows: list[dict]) -> str:\r
              ...\r
\r
      class ReportSink(ABC):\r
          @abstractmethod\r
          def write(self, name: str, content: str) -> str:\r
              pass\r
\r
      class CsvFormatter:\r
          def render(self, rows):\r
              header = ",".join(rows[0])\r
              lines = [header]\r
              for row in rows:\r
                  lines.append(",".join(str(row[key]) for key in rows[0]))\r
              return "\\n".join(lines)\r
\r
      class MemorySink(ReportSink):\r
          def __init__(self):\r
              self.files = {}\r
\r
          def write(self, name, content):\r
              self.files[name] = content\r
              return name\r
\r
      def exportRows(formatter: RowFormatter, sink: ReportSink, name: str, rows: list[dict]):\r
          if not isinstance(formatter, RowFormatter):\r
              raise TypeError("formatter must implement render")\r
          content = formatter.render(rows)\r
          return sink.write(name, content)\r
\r
      rows = [{"id": "A-100", "amount": 12000}, {"id": "A-101", "amount": 9000}]\r
      sink = MemorySink()\r
      savedName = exportRows(CsvFormatter(), sink, "orders.csv", rows)\r
\r
      assert savedName == "orders.csv"\r
      assert sink.files["orders.csv"] == "id,amount\\nA-100,12000\\nA-101,9000"\r
      assert isinstance(CsvFormatter(), RowFormatter)\r
\r
      try:\r
          ReportSink()\r
      except TypeError as exc:\r
          assert "abstract" in str(exc)\r
\r
      try:\r
          exportRows(object(), sink, "broken.csv", rows)\r
      except TypeError as exc:\r
          assert "formatter" in str(exc)\r
\r
      print("ABC와 Protocol 내보내기 흐름 통과")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 내보내기 인터페이스 설계하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 내보내기 인터페이스 설계하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: ABC와 Protocol 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 8에서 배운 추상 클래스와 프로토콜을 난이도별로 복습합니다. ABC(Abstract Base Class)는 인터페이스를 강제하는 명목적 서브타이핑을,\r
    Protocol은 구조적 서브타이핑(덕 타이핑)을 제공합니다. 둘 다 코드의 타입 안전성과 설계 명확성을 높이는 도구입니다. 🟢 기본 문제로 ABC와 abstractmethod,\r
    Protocol 정의를 익히고, 🟡 응용 문제로 추상 프로퍼티, runtime_checkable 패턴을 연습하세요. 🔴 심화 문제에서는 믹스인, 가상 서브클래스, 제네릭 Protocol\r
    등 고급 인터페이스 설계를 다룹니다. 대규모 프로젝트에서 명확한 인터페이스 정의는 유지보수성의 핵심입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Greeter(ABC):\r
        @abstractmethod\r
        def greet(self):\r
            pass\r
\r
    class Hello(Greeter):\r
        def greet(self):\r
            return "Hello!"\r
\r
    Hello().greet()\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Greeter(ABC):\r
          @abstractmethod\r
          def greet(self):\r
              pass\r
\r
      class Hello(Greeter):\r
          def greet(self):\r
              return "Hello!"\r
\r
      Hello().greet()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 08_advanced_abc-protocol-export-contract-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - abc_module
    - protocol_typing
    - workflow_validation
    title: ABC 저장소와 Protocol 포매터로 내보내기 계약 검증하기
    subtitle: explicit sink and structural formatter
    goal: rows를 받아 ABC로 sink 구현을 강제하고 runtime_checkable Protocol로 formatter 구조를 확인한 뒤 저장 결과를 반환한다.
    why: ABC와 Protocol의 차이는 시험용 용어가 아니라, 런타임 강제 계약과 기존 객체를 받는 구조적 계약을 어디에 둘지 결정하는 설계 문제입니다.
    explanation: run_export_contract(rows)를 완성해 추상 sink 인스턴스화 실패, formatter 구조 검사, CSV 저장 결과를 함께 검증하세요.
    tips:
    - ReportSink는 write를 구현하지 않으면 인스턴스화할 수 없어야 합니다.
    - RowFormatter는 상속하지 않아도 render 메서드가 있으면 runtime check를 통과합니다.
    exercise:
      prompt: run_export_contract(rows)를 완성해 savedName, content, formatterIsProtocol, abstractRejected를 반환하세요.
      starterCode: |-
        def run_export_contract(rows):
            raise NotImplementedError
      solution: |-
        def run_export_contract(rows):
            from abc import ABC, abstractmethod
            from typing import Protocol, runtime_checkable

            @runtime_checkable
            class RowFormatter(Protocol):
                def render(self, rows: list[dict]) -> str:
                    ...

            class ReportSink(ABC):
                @abstractmethod
                def write(self, name: str, content: str) -> str:
                    raise NotImplementedError

            class CsvFormatter:
                def render(self, rows):
                    header = ",".join(rows[0])
                    lines = [header]
                    for row in rows:
                        lines.append(",".join(str(row[key]) for key in rows[0]))
                    return "\\n".join(lines)

            class MemorySink(ReportSink):
                def __init__(self):
                    self.files = {}

                def write(self, name, content):
                    self.files[name] = content
                    return name

            try:
                ReportSink()
                abstract_rejected = False
            except TypeError:
                abstract_rejected = True

            formatter = CsvFormatter()
            if not isinstance(formatter, RowFormatter):
                raise TypeError("formatter must implement render")
            sink = MemorySink()
            content = formatter.render(rows)
            saved_name = sink.write("orders.csv", content)
            return {
                "savedName": saved_name,
                "content": sink.files[saved_name],
                "formatterIsProtocol": isinstance(formatter, RowFormatter),
                "abstractRejected": abstract_rejected,
            }
      hints:
      - ABC는 상속과 abstractmethod 구현 여부를 런타임에 강제합니다.
      - Protocol은 구조를 확인하므로 CsvFormatter가 상속하지 않아도 됩니다.
    check:
      id: python.advanced.abc-protocol.export-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.abc-protocol.empty.behavior.v1.fixture
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
        entry: run_export_contract
        cases:
        - id: exports-rows-through-abc-sink-and-protocol-formatter
          arguments:
          - value:
            - id: A-100
              amount: 12000
            - id: A-101
              amount: 9000
          expectedReturn:
            savedName: orders.csv
            content: |-
              id,amount
              A-100,12000
              A-101,9000
            formatterIsProtocol: true
            abstractRejected: true
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 08_advanced_abc-plugin-pipeline-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - practical_abc
    - interface_design
    - duck_typing
    title: ABC 플러그인 파이프라인으로 데이터 검증과 보강 순서 고정하기
    subtitle: plugin interface pipeline
    goal: 데이터 dict를 받아 ABC Plugin 구현체들이 순서대로 실행된 결과와 추상 클래스 거부 여부를 반환한다.
    why: 전이 과제에서는 내보내기 예시 밖에서 ABC를 전략 패턴으로 사용해, 구현 누락을 빨리 실패시키고 실행 순서를 명시합니다.
    explanation: run_plugin_pipeline(data)를 완성해 ValidatePlugin과 EnrichPlugin을 같은 Plugin 인터페이스로 실행하고 결과 steps를 검증하세요.
    tips:
    - Plugin은 name과 execute를 모두 추상 계약으로 가져야 합니다.
    - ValidatePlugin은 id가 없으면 ValueError로 막아야 합니다.
    exercise:
      prompt: run_plugin_pipeline(data)를 완성해 result, pluginNames, abstractRejected를 반환하세요.
      starterCode: |-
        def run_plugin_pipeline(data):
            raise NotImplementedError
      solution: |-
        def run_plugin_pipeline(data):
            from abc import ABC, abstractmethod

            class Plugin(ABC):
                @property
                @abstractmethod
                def name(self) -> str:
                    raise NotImplementedError

                @abstractmethod
                def execute(self, payload: dict) -> dict:
                    raise NotImplementedError

            class ValidatePlugin(Plugin):
                @property
                def name(self):
                    return "validate"

                def execute(self, payload):
                    if "id" not in payload:
                        raise ValueError("id is required")
                    payload = dict(payload)
                    payload.setdefault("steps", []).append("validate")
                    return payload

            class EnrichPlugin(Plugin):
                @property
                def name(self):
                    return "enrich"

                def execute(self, payload):
                    payload = dict(payload)
                    payload["kind"] = "report-row"
                    payload.setdefault("steps", []).append("enrich")
                    return payload

            try:
                Plugin()
                abstract_rejected = False
            except TypeError:
                abstract_rejected = True

            plugins = [ValidatePlugin(), EnrichPlugin()]
            result = dict(data)
            for plugin in plugins:
                result = plugin.execute(result)
            return {
                "result": result,
                "pluginNames": [plugin.name for plugin in plugins],
                "abstractRejected": abstract_rejected,
            }
      hints:
      - 각 plugin은 새 dict를 반환하면 입력 부작용을 줄일 수 있습니다.
      - 추상 클래스 인스턴스화 실패도 계약 검증의 일부입니다.
    check:
      id: python.advanced.abc.plugin-pipeline.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.abc-protocol.empty.behavior.v1.fixture
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
        entry: run_plugin_pipeline
        cases:
        - id: runs-plugins-in-interface-order
          arguments:
          - value:
              id: A-100
              amount: 12000
          expectedReturn:
            result:
              id: A-100
              amount: 12000
              steps:
              - validate
              - enrich
              kind: report-row
            pluginNames:
            - validate
            - enrich
            abstractRejected: true
        - id: rejects-missing-id
          arguments:
          - value:
              amount: 12000
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 08_advanced_abc-protocol-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - abc_module
    - duck_typing
    - protocol_typing
    title: ABC, Protocol, 덕 타이핑 선택 기준 회상하기
    subtitle: interface tool recall
    goal: 목적 이름을 받아 적절한 인터페이스 설계 도구와 런타임 강제 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 ABC와 Protocol의 이름보다, 명시 상속 강제와 구조적 호환 중 무엇이 필요한지 판단하는 기준입니다.
    explanation: choose_interface_tool(goal)를 완성해 enforce-subclass-contract, accept-existing-objects, dynamic-behavior 목적별 도구를 고르세요.
    tips:
    - ABC는 구현 누락을 인스턴스 생성 시점에 막습니다.
    - Protocol은 기존 클래스가 상속 없이도 타입 계약을 만족하게 합니다.
    exercise:
      prompt: choose_interface_tool(goal)를 완성해 목적별 인터페이스 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_interface_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_interface_tool(goal):
            table = {
                "enforce-subclass-contract": {
                    "tool": "ABC",
                    "runtimeEnforced": True,
                    "requiresInheritance": True,
                },
                "accept-existing-objects": {
                    "tool": "Protocol",
                    "runtimeEnforced": False,
                    "requiresInheritance": False,
                },
                "dynamic-behavior": {
                    "tool": "duck typing",
                    "runtimeEnforced": False,
                    "requiresInheritance": False,
                },
            }
            if goal not in table:
                raise ValueError("unknown interface goal")
            return table[goal]
      hints:
      - runtime_checkable Protocol도 시그니처까지 검증하지는 않습니다.
      - 기존 객체를 느슨하게 받으려면 Protocol이나 덕 타이핑을 고려하세요.
    check:
      id: python.advanced.abc-protocol.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.abc-protocol.empty.behavior.v1.fixture
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
        entry: choose_interface_tool
        cases:
        - id: recalls-abc-for-runtime-contract
          arguments:
          - value: enforce-subclass-contract
          expectedReturn:
            tool: ABC
            runtimeEnforced: true
            requiresInheritance: true
        - id: recalls-protocol-for-existing-objects
          arguments:
          - value: accept-existing-objects
          expectedReturn:
            tool: Protocol
            runtimeEnforced: false
            requiresInheritance: false
        - id: rejects-unknown-goal
          arguments:
          - value: monkeypatch-method
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};