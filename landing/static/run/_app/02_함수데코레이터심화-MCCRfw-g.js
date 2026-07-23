var e=`meta:\r
  id: '02'\r
  title: 함수 데코레이터 심화\r
  day: 2\r
  category: advancedPython\r
  tags:\r
  - decorator\r
  - functools\r
  - wraps\r
  - 메타프로그래밍\r
  - 검증\r
  - 운영자동화\r
  seo:\r
    title: 파이썬 데코레이터 심화 - 인자 있는 데코레이터와 클래스 데코레이터\r
    description: 데코레이터의 내부 동작 원리를 완벽히 이해하고 인자 있는 데코레이터, 다중 데코레이터, 클래스 데코레이터를 마스터합니다.\r
    keywords:\r
    - decorator\r
    - functools\r
    - wraps\r
    - 클래스데코레이터\r
    - 메타프로그래밍\r
intro:\r
  emoji: 🎭\r
  points:\r
  - 데코레이터의 내부 동작 원리 완벽 이해\r
  - 인자를 받는 데코레이터 구현\r
  - 다중 데코레이터의 실행 순서\r
  - functools.wraps로 메타데이터 보존\r
  direction: 함수 데코레이터 심화에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 함수 데코레이터 심화 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데코레이터 복습 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 인자 있는 데코레이터 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 다중 데코레이터 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 함수 데코레이터 심화 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 함수 데코레이터 심화 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 함수 데코레이터 심화 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: decorator_review\r
  title: 데코레이터 복습\r
  structuredPrimary: true\r
  subtitle: 기본 패턴 이해\r
  goal: 데코레이터 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    데코레이터는 함수를 인자로 받아 새로운 함수를 반환하는 고차 함수입니다. @decorator 문법은 func = decorator(func)의 문법적 설탕(syntactic sugar)입니다. 데코레이터는 원본 함수를 감싸는 wrapper 함수를 만들어 원본 함수 호출 전후에 추가 동작을 수행합니다. 이 패턴으로 로깅, 인증, 캐싱, 타이밍 측정 등 다양한 횡단 관심사(cross-cutting concerns)를 구현할 수 있습니다. 데코레이터는 함수를 수정하지 않고 기능을 확장하는 개방-폐쇄 원칙(OCP)의 좋은 예입니다.\r
\r
    *args와 **kwargs를 사용하면 어떤 시그니처의 함수에도 적용할 수 있는 범용 데코레이터를 만들 수 있습니다.\r
  snippet: |-\r
    def simpleDecorator(func):\r
        def wrapper(*args, **kwargs):\r
            result = func(*args, **kwargs)\r
            return result\r
        return wrapper\r
\r
    @simpleDecorator\r
    def greet(name):\r
        return f"Hello, {name}!"\r
\r
    greet("Python")\r
  exercise:\r
    prompt: 데코레이터 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def simpleDecorator(func):\r
          def wrapper(*args, **kwargs):\r
              result = func(*args, **kwargs)\r
              return result\r
          return wrapper\r
\r
      @simpleDecorator\r
      def greet(name):\r
          return f"Hello, {name}!"\r
\r
      greet("Python")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데코레이터 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 데코레이터 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: parameterized\r
  title: 인자 있는 데코레이터\r
  structuredPrimary: true\r
  subtitle: 데코레이터 팩토리 패턴\r
  goal: 인자 있는 데코레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    인자를 받는 데코레이터는 3중 중첩 함수 구조로 구현합니다. 가장 바깥 함수가 데코레이터 인자를 받고, 중간 함수가 실제 데코레이터(함수를 받음), 가장 안쪽 함수가 wrapper입니다. @decorator(arg)는 decorator(arg)를 먼저 호출하여 실제 데코레이터를 얻고, 그 데코레이터가 함수에 적용됩니다. 이 패턴을 '데코레이터 팩토리'라고 부릅니다. 데코레이터에 설정값을 전달하거나 동작을 커스터마이징할 때 사용합니다.\r
\r
    인자 없이도 사용할 수 있게 하려면 인자 유무를 감지하는 추가 로직이 필요합니다.\r
  snippet: |-\r
    def repeat(times):\r
        def decorator(func):\r
            def wrapper(*args, **kwargs):\r
                results = []\r
                for _ in range(times):\r
                    results.append(func(*args, **kwargs))\r
                return results\r
            return wrapper\r
        return decorator\r
\r
    @repeat(3)\r
    def sayHello():\r
        return "Hello!"\r
\r
    sayHello()\r
  exercise:\r
    prompt: 인자 있는 데코레이터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def repeat(times):\r
          def decorator(func):\r
              def wrapper(*args, **kwargs):\r
                  results = []\r
                  for _ in range(times):\r
                      results.append(func(*args, **kwargs))\r
                  return results\r
              return wrapper\r
          return decorator\r
\r
      @repeat(3)\r
      def sayHello():\r
          return "Hello!"\r
\r
      sayHello()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 인자 있는 데코레이터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 인자 있는 데코레이터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: multiple_decorators\r
  title: 다중 데코레이터\r
  structuredPrimary: true\r
  subtitle: 데코레이터 스택\r
  goal: 다중 데코레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    하나의 함수에 여러 데코레이터를 적용할 수 있습니다. 데코레이터는 아래에서 위로 적용되고, 호출은 위에서 아래로 진행됩니다. @A @B @C def func()는 A(B(C(func)))와 같습니다. 즉 C가 먼저 func를 감싸고, B가 그 결과를 감싸고, A가 최종적으로 감쌉니다. 실행 시에는 A의 wrapper가 먼저 시작하고, 그 안에서 B의 wrapper, 그 안에서 C의 wrapper가 호출됩니다. 이 순서를 이해하는 것이 다중 데코레이터를 올바르게 사용하는 핵심입니다.\r
\r
    데코레이터 순서가 중요한 경우 주석으로 의도를 명확히 남기세요.\r
  snippet: |-\r
    executionOrder = []\r
\r
    def deco1(func):\r
        def wrapper(*args, **kwargs):\r
            executionOrder.append("deco1 start")\r
            result = func(*args, **kwargs)\r
            executionOrder.append("deco1 end")\r
            return result\r
        return wrapper\r
\r
    def deco2(func):\r
        def wrapper(*args, **kwargs):\r
            executionOrder.append("deco2 start")\r
            result = func(*args, **kwargs)\r
            executionOrder.append("deco2 end")\r
            return result\r
        return wrapper\r
\r
    @deco1\r
    @deco2\r
    def testFunc():\r
        executionOrder.append("function")\r
        return "done"\r
\r
    testFunc()\r
    executionOrder\r
  exercise:\r
    prompt: 다중 데코레이터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      executionOrder = []\r
\r
      def deco1(func):\r
          def wrapper(*args, **kwargs):\r
              executionOrder.append("deco1 start")\r
              result = func(*args, **kwargs)\r
              executionOrder.append("deco1 end")\r
              return result\r
          return wrapper\r
\r
      def deco2(func):\r
          def wrapper(*args, **kwargs):\r
              executionOrder.append("deco2 start")\r
              result = func(*args, **kwargs)\r
              executionOrder.append("deco2 end")\r
              return result\r
          return wrapper\r
\r
      @deco1\r
      @deco2\r
      def testFunc():\r
          executionOrder.append("function")\r
          return "done"\r
\r
      testFunc()\r
      executionOrder\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 다중 데코레이터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 다중 데코레이터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: functools_wraps\r
  title: functools.wraps\r
  structuredPrimary: true\r
  subtitle: 메타데이터 보존\r
  goal: functools.wraps에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    데코레이터로 함수를 감싸면 원본 함수의 __name__, __doc__, __annotations__ 등의 메타데이터가 wrapper 함수의 것으로 덮어씌워집니다. 이는 디버깅, 문서화, 인트로스펙션에서 문제가 됩니다. functools.wraps 데코레이터를 wrapper 함수에 적용하면 원본 함수의 메타데이터를 wrapper로 복사합니다. 이것은 데코레이터를 작성할 때 반드시 적용해야 하는 모범 사례입니다. wraps는 __wrapped__ 속성도 설정하여 원본 함수에 접근할 수 있게 해줍니다.\r
\r
    항상 @wraps를 사용하세요. 이것은 파이썬 커뮤니티의 표준 관행입니다.\r
  snippet: |-\r
    def badDecorator(func):\r
        def wrapper(*args, **kwargs):\r
            return func(*args, **kwargs)\r
        return wrapper\r
\r
    @badDecorator\r
    def originalFunc():\r
        """원본 함수의 독스트링"""\r
        return "original"\r
\r
    originalFunc.__name__, originalFunc.__doc__\r
  exercise:\r
    prompt: functools.wraps 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def badDecorator(func):\r
          def wrapper(*args, **kwargs):\r
              return func(*args, **kwargs)\r
          return wrapper\r
\r
      @badDecorator\r
      def originalFunc():\r
          """원본 함수의 독스트링"""\r
          return "original"\r
\r
      originalFunc.__name__, originalFunc.__doc__\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: functools.wraps의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: functools.wraps 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: class_decorator\r
  title: 클래스 데코레이터\r
  structuredPrimary: true\r
  subtitle: 클래스를 수정하는 데코레이터\r
  goal: 클래스 데코레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    데코레이터는 함수뿐만 아니라 클래스에도 적용할 수 있습니다. 클래스 데코레이터는 클래스를 인자로 받아 수정된 클래스나 새로운 클래스를 반환합니다. 클래스에 메서드를 추가하거나, 속성을 수정하거나, 클래스를 래핑하는 등의 작업을 할 수 있습니다. @dataclass, @total_ordering 같은 표준 라이브러리 데코레이터가 클래스 데코레이터의 예입니다. 메타클래스보다 간단하고 직관적인 방법으로 클래스를 수정할 수 있습니다.\r
\r
    클래스 데코레이터는 메타클래스보다 이해하기 쉽고 대부분의 경우 충분합니다.\r
  snippet: |-\r
    def addRepr(cls):\r
        def customRepr(self):\r
            attrs = ", ".join(f"{k}={v}" for k, v in self.__dict__.items())\r
            return f"{cls.__name__}({attrs})"\r
        cls.__repr__ = customRepr\r
        return cls\r
\r
    @addRepr\r
    class Person:\r
        def __init__(self, name, age):\r
            self.name = name\r
            self.age = age\r
\r
    p = Person("Alice", 30)\r
    repr(p)\r
  exercise:\r
    prompt: 클래스 데코레이터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def addRepr(cls):\r
          def customRepr(self):\r
              attrs = ", ".join(f"{k}={v}" for k, v in self.__dict__.items())\r
              return f"{cls.__name__}({attrs})"\r
          cls.__repr__ = customRepr\r
          return cls\r
\r
      @addRepr\r
      class Person:\r
          def __init__(self, name, age):\r
              self.name = name\r
              self.age = age\r
\r
      p = Person("Alice", 30)\r
      repr(p)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 클래스 데코레이터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 클래스 데코레이터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: method_decorator\r
  title: 메서드 데코레이터\r
  structuredPrimary: true\r
  subtitle: self 처리하기\r
  goal: 메서드 데코레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    클래스의 메서드에 데코레이터를 적용할 때는 self 인자를 올바르게 처리해야 합니다. 일반 함수 데코레이터와 동일하게 *args, **kwargs를 사용하면 self도 자동으로 전달됩니다. 그러나 self에 접근해야 하는 경우에는 첫 번째 인자를 명시적으로 self로 받을 수 있습니다. classmethod나 staticmethod와 함께 사용할 때는 데코레이터 순서에 주의해야 합니다. 일반적으로 @classmethod나 @staticmethod가 가장 안쪽(함수에 가장 가깝게)에 위치해야 합니다.\r
\r
    @property에 데코레이터를 적용하려면 property 객체를 반환하도록 특별히 처리해야 합니다.\r
  snippet: |-\r
    from functools import wraps\r
\r
    def logMethod(func):\r
        @wraps(func)\r
        def wrapper(self, *args, **kwargs):\r
            result = func(self, *args, **kwargs)\r
            return result\r
        return wrapper\r
\r
    class Calculator:\r
        @logMethod\r
        def add(self, a, b):\r
            return a + b\r
\r
    calc = Calculator()\r
    calc.add(3, 5)\r
  exercise:\r
    prompt: 메서드 데코레이터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import wraps\r
\r
      def logMethod(func):\r
          @wraps(func)\r
          def wrapper(self, *args, **kwargs):\r
              result = func(self, *args, **kwargs)\r
              return result\r
          return wrapper\r
\r
      class Calculator:\r
          @logMethod\r
          def add(self, a, b):\r
              return a + b\r
\r
      calc = Calculator()\r
      calc.add(3, 5)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메서드 데코레이터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메서드 데코레이터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 데코레이터로 권한, 감사 로그, 입력 검증 묶기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 래핑 → 오류 확인 → 메타데이터 검증\r
  goal: '현업 흐름 검증: 데코레이터로 권한, 감사 로그, 입력 검증 묶기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    데코레이터는 반복되는 운영 규칙을 함수 바깥으로 분리하는 도구입니다. 권한 확인, 감사 로그, 입력 검증처럼 여러 함수에 공통으로 붙는 규칙을 한 번에 검증합니다.\r
\r
    변주 실험\r
    권한 검사를 감사 로그보다 먼저 실행할지 나중에 실행할지 데코레이터 순서를 바꾸고, 실패한 요청도 로그에 남길지 assert로 정책을 고정하세요.\r
  tips:\r
  - 변주 실험 권한 검사를 감사 로그보다 먼저 실행할지 나중에 실행할지 데코레이터 순서를 바꾸고, 실패한 요청도 로그에 남길지 assert로 정책을 고정하세요.\r
  snippet: |-\r
    from functools import wraps\r
\r
    auditLog = []\r
\r
    def requireRole(requiredRole):\r
        def decorator(func):\r
            @wraps(func)\r
            def wrapper(user, *args, **kwargs):\r
                if requiredRole not in user.get("roles", []):\r
                    raise PermissionError(f"{requiredRole} role required")\r
                return func(user, *args, **kwargs)\r
            return wrapper\r
        return decorator\r
\r
    def auditAction(actionName):\r
        def decorator(func):\r
            @wraps(func)\r
            def wrapper(*args, **kwargs):\r
                result = func(*args, **kwargs)\r
                auditLog.append({"action": actionName, "result": result})\r
                return result\r
            return wrapper\r
        return decorator\r
\r
    def requirePositiveAmount(func):\r
        @wraps(func)\r
        def wrapper(user, amount):\r
            if amount <= 0:\r
                raise ValueError("amount must be positive")\r
            return func(user, amount)\r
        return wrapper\r
\r
    @auditAction("refund")\r
    @requireRole("finance")\r
    @requirePositiveAmount\r
    def approveRefund(user, amount):\r
        return {"user": user["name"], "amount": amount, "status": "approved"}\r
\r
    financeUser = {"name": "Kim", "roles": ["finance", "operator"]}\r
    viewerUser = {"name": "Lee", "roles": ["viewer"]}\r
\r
    result = approveRefund(financeUser, 30000)\r
    assert result == {"user": "Kim", "amount": 30000, "status": "approved"}\r
    assert auditLog == [{"action": "refund", "result": result}]\r
    assert approveRefund.__name__ == "approveRefund"\r
\r
    try:\r
        approveRefund(viewerUser, 10000)\r
    except PermissionError as exc:\r
        assert "finance" in str(exc)\r
\r
    try:\r
        approveRefund(financeUser, 0)\r
    except ValueError as exc:\r
        assert "positive" in str(exc)\r
\r
    print("데코레이터 운영 규칙 통과")\r
  exercise:\r
    prompt: '현업 흐름 검증: 데코레이터로 권한, 감사 로그, 입력 검증 묶기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from functools import wraps\r
\r
      auditLog = []\r
\r
      def requireRole(requiredRole):\r
          def decorator(func):\r
              @wraps(func)\r
              def wrapper(user, *args, **kwargs):\r
                  if requiredRole not in user.get("roles", []):\r
                      raise PermissionError(f"{requiredRole} role required")\r
                  return func(user, *args, **kwargs)\r
              return wrapper\r
          return decorator\r
\r
      def auditAction(actionName):\r
          def decorator(func):\r
              @wraps(func)\r
              def wrapper(*args, **kwargs):\r
                  result = func(*args, **kwargs)\r
                  auditLog.append({"action": actionName, "result": result})\r
                  return result\r
              return wrapper\r
          return decorator\r
\r
      def requirePositiveAmount(func):\r
          @wraps(func)\r
          def wrapper(user, amount):\r
              if amount <= 0:\r
                  raise ValueError("amount must be positive")\r
              return func(user, amount)\r
          return wrapper\r
\r
      @auditAction("refund")\r
      @requireRole("finance")\r
      @requirePositiveAmount\r
      def approveRefund(user, amount):\r
          return {"user": user["name"], "amount": amount, "status": "approved"}\r
\r
      financeUser = {"name": "Kim", "roles": ["finance", "operator"]}\r
      viewerUser = {"name": "Lee", "roles": ["viewer"]}\r
\r
      result = approveRefund(financeUser, 30000)\r
      assert result == {"user": "Kim", "amount": 30000, "status": "approved"}\r
      assert auditLog == [{"action": "refund", "result": result}]\r
      assert approveRefund.__name__ == "approveRefund"\r
\r
      try:\r
          approveRefund(viewerUser, 10000)\r
      except PermissionError as exc:\r
          assert "finance" in str(exc)\r
\r
      try:\r
          approveRefund(financeUser, 0)\r
      except ValueError as exc:\r
          assert "positive" in str(exc)\r
\r
      print("데코레이터 운영 규칙 통과")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 데코레이터로 권한, 감사 로그, 입력 검증 묶기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 데코레이터로 권한, 감사 로그, 입력 검증 묶기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 데코레이터 심화 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 2에서 배운 데코레이터 심화 내용을 난이도별로 복습합니다. 데코레이터는 함수나 클래스의 동작을 수정하는 강력한 메타프로그래밍 도구입니다. 기본 데코레이터부터\r
    인자를 받는 데코레이터, 클래스 데코레이터까지 단계별로 학습했습니다. 🟢 기본 문제로 래퍼 함수 작성법을 익히고, 🟡 응용 문제로 functools.wraps와 다중 데코레이터를\r
    연습하세요. 🔴 심화 문제에서는 메모이제이션, 검증, 로깅 등 실무 패턴을 직접 구현해봅니다. 프레임워크와 라이브러리에서 데코레이터는 핵심 API이므로 완벽히 이해해두면 코드\r
    품질이 크게 향상됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def addBrackets(func):\r
        def wrapper(*args, **kwargs):\r
            return f"[{func(*args, **kwargs)}]"\r
        return wrapper\r
\r
    @addBrackets\r
    def getText():\r
        return "content"\r
\r
    getText()\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def addBrackets(func):\r
          def wrapper(*args, **kwargs):\r
              return f"[{func(*args, **kwargs)}]"\r
          return wrapper\r
\r
      @addBrackets\r
      def getText():\r
          return "content"\r
\r
      getText()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 02_advanced_decorator-audit-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - parameterized
    - functools_wraps
    - workflow_validation
    title: 인자 있는 데코레이터로 권한과 감사 로그를 함께 검증하기
    subtitle: parameterized guard decorator
    goal: 사용자 역할과 필요 역할을 받아 데코레이터 팩토리, wraps, 예외 처리를 포함한 감사 결과를 반환한다.
    why: 데코레이터는 프레임워크 문법을 외우는 주제가 아니라, 반복되는 운영 규칙을 한 곳에서 검증하게 만드는 설계 도구입니다.
    explanation: run_guarded_action(user_role, required_role, amount)를 완성해 역할 확인, 성공/거부 이벤트, 원본 함수 메타데이터 보존을 함께 확인하세요.
    tips:
    - '@wraps를 쓰지 않으면 functionName과 doc 검증을 통과할 수 없습니다.'
    - 권한 실패도 events에 남겨 호출 순서를 확인하세요.
    exercise:
      prompt: run_guarded_action(user_role, required_role, amount)를 완성해 권한 검사 결과와 감사 이벤트를 반환하세요.
      starterCode: |-
        def run_guarded_action(user_role, required_role, amount):
            raise NotImplementedError
      solution: |-
        def run_guarded_action(user_role, required_role, amount):
            from functools import wraps

            events = []

            def require_role(role):
                def decorator(func):
                    @wraps(func)
                    def wrapper(*args, **kwargs):
                        events.append(f"check:{role}")
                        if user_role != role:
                            events.append("denied")
                            raise PermissionError("role denied")
                        events.append("allowed")
                        return func(*args, **kwargs)
                    return wrapper
                return decorator

            @require_role(required_role)
            def approve_payment(value):
                """Approve one payment."""
                events.append(f"approve:{value}")
                return {"approved": True, "amount": value}

            try:
                result = approve_payment(amount)
                status = "ok"
            except PermissionError as exc:
                result = {"approved": False, "reason": str(exc)}
                status = "denied"
            return {
                "status": status,
                "result": result,
                "events": events,
                "functionName": approve_payment.__name__,
                "doc": approve_payment.__doc__,
            }
      hints:
      - 가장 바깥 함수는 role을 받고, 중간 함수는 func를 받습니다.
      - wrapper 안에서 예외를 내고 바깥 try에서 결과로 바꾸면 테스트하기 쉽습니다.
    check:
      id: python.advanced.decorator.audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.decorator.empty.behavior.v1.fixture
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
        entry: run_guarded_action
        cases:
        - id: allows-required-role-and-preserves-metadata
          arguments:
          - value: admin
          - value: admin
          - value: 9000
          expectedReturn:
            status: ok
            result:
              approved: true
              amount: 9000
            events:
            - check:admin
            - allowed
            - approve:9000
            functionName: approve_payment
            doc: Approve one payment.
        - id: denies-wrong-role-with-audit-event
          arguments:
          - value: viewer
          - value: admin
          - value: 9000
          expectedReturn:
            status: denied
            result:
              approved: false
              reason: role denied
            events:
            - check:admin
            - denied
            functionName: approve_payment
            doc: Approve one payment.
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 02_advanced_decorator-stack-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - multiple_decorators
    - method_decorator
    - workflow_validation
    title: 다중 데코레이터 호출 순서와 반환값 변화를 추적하기
    subtitle: decorator stack trace
    goal: 두 개의 데코레이터가 감싼 함수의 시작, 본문, 종료 순서와 반환값 변화를 trace로 반환한다.
    why: 다중 데코레이터는 예외가 없어도 순서를 틀리면 인증, 로깅, 트랜잭션 정책이 뒤집히기 때문에 호출 순서를 증명해야 합니다.
    explanation: trace_decorator_stack(value)를 완성해 outer와 inner의 시작/종료 이벤트, 본문 실행, 최종 반환값을 검증하세요.
    tips:
    - 적용은 아래에서 위, 호출은 바깥 wrapper부터 시작합니다.
    - 음수 입력은 본문까지 가지 않게 ValueError로 거부하세요.
    exercise:
      prompt: trace_decorator_stack(value)를 완성해 decorator stack의 이벤트 순서와 최종 result를 반환하세요.
      starterCode: |-
        def trace_decorator_stack(value):
            raise NotImplementedError
      solution: |-
        def trace_decorator_stack(value):
            if value < 0:
                raise ValueError("value must be non-negative")

            events = []

            def outer(func):
                def wrapper(amount):
                    events.append("outer:start")
                    result = func(amount)
                    events.append("outer:end")
                    return result + 1
                return wrapper

            def inner(func):
                def wrapper(amount):
                    events.append("inner:start")
                    result = func(amount)
                    events.append("inner:end")
                    return result * 2
                return wrapper

            @outer
            @inner
            def base(amount):
                events.append("body")
                return amount + 3

            result = base(value)
            return {
                "events": events,
                "result": result,
                "callOrder": "outer-inner-body-inner-outer",
            }
      hints:
      - '@outer가 @inner가 감싼 함수를 다시 감쌉니다.'
      - result 계산은 body 결과가 inner에서 두 배, outer에서 1 증가합니다.
    check:
      id: python.advanced.decorator.stack.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.decorator.empty.behavior.v1.fixture
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
        entry: trace_decorator_stack
        cases:
        - id: traces-wrapper-order-and-return-transform
          arguments:
          - value: 4
          expectedReturn:
            events:
            - outer:start
            - inner:start
            - body
            - inner:end
            - outer:end
            result: 15
            callOrder: outer-inner-body-inner-outer
        - id: rejects-negative-input-before-wrapping
          arguments:
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 02_advanced_decorator-role-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - decorator_review
    - parameterized
    - functools_wraps
    title: 데코레이터 문법, 팩토리, wraps 역할 회상하기
    subtitle: syntax, factory, metadata
    goal: 개념 이름을 받아 @ 문법의 의미, 데코레이터 팩토리 필요 여부, 메타데이터 보존 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 문법 모양보다 func = decorator(func), decorator(arg)의 2단계, wraps의 역할입니다.
    explanation: recall_decorator_concept(concept)를 완성해 syntax, factory, wraps 개념별 핵심 정보를 반환하세요.
    tips:
    - '@decorator는 함수 정의 뒤 재할당되는 문법입니다.'
    - '@decorator(arg)는 arg를 받은 함수가 실제 decorator를 반환해야 합니다.'
    exercise:
      prompt: recall_decorator_concept(concept)를 완성해 데코레이터 핵심 개념을 구조화해 반환하세요.
      starterCode: |-
        def recall_decorator_concept(concept):
            raise NotImplementedError
      solution: |-
        def recall_decorator_concept(concept):
            table = {
                "syntax": {
                    "meaning": "func = decorator(func)",
                    "needsFactory": False,
                    "preservesMetadata": False,
                },
                "factory": {
                    "meaning": "decorator(arg) returns the real decorator",
                    "needsFactory": True,
                    "preservesMetadata": False,
                },
                "wraps": {
                    "meaning": "copy original function metadata to wrapper",
                    "needsFactory": False,
                    "preservesMetadata": True,
                },
            }
            if concept not in table:
                raise ValueError("unknown decorator concept")
            return table[concept]
      hints:
      - factory는 인자 있는 데코레이터에서 필요합니다.
      - wraps는 __name__과 __doc__ 같은 정보를 보존합니다.
    check:
      id: python.advanced.decorator.role.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.decorator.empty.behavior.v1.fixture
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
        entry: recall_decorator_concept
        cases:
        - id: recalls-parameterized-decorator-factory
          arguments:
          - value: factory
          expectedReturn:
            meaning: decorator(arg) returns the real decorator
            needsFactory: true
            preservesMetadata: false
        - id: recalls-wraps-metadata-role
          arguments:
          - value: wraps
          expectedReturn:
            meaning: copy original function metadata to wrapper
            needsFactory: false
            preservesMetadata: true
        - id: rejects-unknown-concept
          arguments:
          - value: monkeypatch
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};