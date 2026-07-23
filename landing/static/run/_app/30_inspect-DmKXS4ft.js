var e=`meta:\r
  id: 30_inspect\r
  title: inspect - 객체 검사\r
  category: builtins\r
  tags:\r
  - inspect\r
  - 검사\r
  - introspection\r
  - signature\r
  - 메타프로그래밍\r
  description: 런타임 객체 검사를 위한 inspect 모듈\r
  keywords:\r
  - inspect\r
  - 검사\r
  - introspection\r
  - signature\r
  - 메타프로그래밍\r
intro:\r
  emoji: 🔍\r
  points:\r
  - 객체 정보 추출\r
  - 함수 시그니처 확인\r
  - 소스 코드 조회\r
  - 메타프로그래밍 지원\r
  direction: inspect 객체 검사에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - inspect 객체 검사 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 타입 확인 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 함수 시그니처 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: inspect 객체 검사 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: inspect 객체 검사 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: inspect 객체 검사 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: inspect 시작하기\r
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    inspect는 파이썬 표준 라이브러리입니다. 런타임에 객체의 정보를 검사하고 추출할 수 있습니다.\r
\r
    inspect는 디버깅, 문서 자동 생성, 메타프로그래밍에 유용합니다. 객체의 내부 구조를 런타임에 파악할 수 있습니다.\r
  snippet: |-\r
    import inspect\r
\r
    def greet(name):\r
        return f"Hello {name}"\r
\r
    sig = inspect.signature(greet)\r
    str(sig)\r
  exercise:\r
    prompt: 모듈 임포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def greet(name):\r
          return f"Hello {name}"\r
\r
      sig = inspect.signature(greet)\r
      str(sig)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모듈 임포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 모듈 임포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: type_checking\r
  title: 타입 확인\r
  structuredPrimary: true\r
  subtitle: 객체 종류 판별\r
  goal: 타입 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    inspect 모듈은 객체의 타입을 확인하는 다양한 함수를 제공합니다.\r
\r
    isinstance()와 달리 inspect의 is* 함수들은 더 구체적인 타입을 확인합니다. 예: 함수 vs 메서드\r
  snippet: |-\r
    import inspect\r
\r
    def myFunc():\r
        pass\r
\r
    class MyClass:\r
        pass\r
\r
    funcCheck = inspect.isfunction(myFunc)\r
    classCheck = inspect.isclass(MyClass)\r
\r
    funcCheck, classCheck\r
  exercise:\r
    prompt: 타입 확인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def myFunc():\r
          pass\r
\r
      class MyClass:\r
          pass\r
\r
      funcCheck = inspect.isfunction(myFunc)\r
      classCheck = inspect.isclass(MyClass)\r
\r
      funcCheck, classCheck\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 타입 확인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 타입 확인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: signatures\r
  title: 함수 시그니처\r
  structuredPrimary: true\r
  subtitle: 매개변수 정보\r
  goal: 함수 시그니처에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    signature()로 함수의 매개변수 정보를 추출할 수 있습니다.\r
\r
    signature()는 문서 자동 생성이나 함수 래퍼 작성 시 매우 유용합니다. 동적으로 함수 호출 방법을 결정할 수 있습니다.\r
  snippet: |-\r
    import inspect\r
\r
    def calculate(x, y, z=10):\r
        return x + y + z\r
\r
    sig = inspect.signature(calculate)\r
    params = list(sig.parameters.keys())\r
\r
    params\r
  exercise:\r
    prompt: 함수 시그니처 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def calculate(x, y, z=10):\r
          return x + y + z\r
\r
      sig = inspect.signature(calculate)\r
      params = list(sig.parameters.keys())\r
\r
      params\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 함수 시그니처의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 함수 시그니처 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: members\r
  title: 멤버 조회\r
  structuredPrimary: true\r
  subtitle: getmembers 함수\r
  goal: 멤버 조회에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    getmembers()로 객체의 모든 속성과 메서드를 조회할 수 있습니다.\r
\r
    getmembers()는 상속된 멤버도 포함하므로, 커스텀 속성만 보려면 __dict__를 사용하거나 이름 필터링을 하세요.\r
  snippet: |-\r
    import inspect\r
\r
    class Person:\r
        species = 'Human'\r
\r
        def __init__(self, name):\r
            self.name = name\r
\r
        def greet(self):\r
            return f"Hi, I'm {self.name}"\r
\r
    person = Person('Alice')\r
    members = inspect.getmembers(person)\r
\r
    userDefined = [(n, type(v).__name__) for n, v in members if not n.startswith('_')]\r
    userDefined\r
  exercise:\r
    prompt: 멤버 조회 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      class Person:\r
          species = 'Human'\r
\r
          def __init__(self, name):\r
              self.name = name\r
\r
          def greet(self):\r
              return f"Hi, I'm {self.name}"\r
\r
      person = Person('Alice')\r
      members = inspect.getmembers(person)\r
\r
      userDefined = [(n, type(v).__name__) for n, v in members if not n.startswith('_')]\r
      userDefined\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 멤버 조회의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 멤버 조회 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: source_code\r
  title: 소스 코드 조회\r
  structuredPrimary: true\r
  subtitle: getsource 함수\r
  goal: 소스 코드 조회에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    getsource()로 함수나 클래스의 소스 코드를 문자열로 가져올 수 있습니다.\r
\r
    getsource()는 인터랙티브 셸이나 동적으로 생성된 함수에서는 작동하지 않습니다. 파일에 정의된 객체만 가능합니다.\r
  snippet: |-\r
    import importlib.util\r
    import inspect\r
    import sys\r
    import tempfile\r
    import textwrap\r
    from pathlib import Path\r
\r
    moduleCode = textwrap.dedent('''\r
    def fibonacci(n):\r
        if n <= 1:\r
            return n\r
        return fibonacci(n - 1) + fibonacci(n - 2)\r
    ''')\r
\r
    with tempfile.TemporaryDirectory() as tempDir:\r
        modulePath = Path(tempDir) / 'math_tools.py'\r
        modulePath.write_text(moduleCode, encoding='utf-8')\r
        spec = importlib.util.spec_from_file_location('math_tools', modulePath)\r
        assert spec is not None and spec.loader is not None\r
        module = importlib.util.module_from_spec(spec)\r
        sys.modules[spec.name] = module\r
        spec.loader.exec_module(module)\r
        source = inspect.getsource(module.fibonacci)\r
\r
    assert 'def fibonacci' in source\r
    source\r
  exercise:\r
    prompt: 소스 코드 조회 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import importlib.util\r
      import inspect\r
      import sys\r
      import tempfile\r
      import textwrap\r
      from pathlib import Path\r
\r
      moduleCode = textwrap.dedent('''\r
      def fibonacci(n):\r
          if n <= 1:\r
              return n\r
          return fibonacci(n - 1) + fibonacci(n - 2)\r
      ''')\r
\r
      with tempfile.TemporaryDirectory() as tempDir:\r
          modulePath = Path(tempDir) / 'math_tools.py'\r
          modulePath.write_text(moduleCode, encoding='utf-8')\r
          spec = importlib.util.spec_from_file_location('math_tools', modulePath)\r
          assert spec is not None and spec.loader is not None\r
          module = importlib.util.module_from_spec(spec)\r
          sys.modules[spec.name] = module\r
          spec.loader.exec_module(module)\r
          source = inspect.getsource(module.fibonacci)\r
\r
      assert 'def fibonacci' in source\r
      source\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 소스 코드 조회의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 소스 코드 조회 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: advanced_inspection\r
  title: 고급 검사\r
  structuredPrimary: true\r
  subtitle: 프레임과 스택\r
  goal: 고급 검사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    inspect는 현재 실행 중인 코드의 스택 정보도 조회할 수 있습니다.\r
\r
    프레임 검사는 디버깅 도구나 로깅 프레임워크에서 호출 위치를 자동으로 기록하는데 사용됩니다.\r
  snippet: |-\r
    import inspect\r
\r
    def currentFunction():\r
        frame = inspect.currentframe()\r
        return frame.f_code.co_name\r
\r
    funcName = currentFunction()\r
    funcName\r
  exercise:\r
    prompt: 고급 검사 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def currentFunction():\r
          frame = inspect.currentframe()\r
          return frame.f_code.co_name\r
\r
      funcName = currentFunction()\r
      funcName\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 고급 검사의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 고급 검사 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 활용 사례\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    inspect 모듈을 활용한 실무 패턴들입니다.\r
\r
    inspect는 프레임워크나 라이브러리 개발 시 매우 유용합니다. 사용자 정의 함수를 분석하여 자동으로 처리할 수 있습니다.\r
  snippet: |-\r
    import inspect\r
\r
    def multiply(x: int, y: int) -> int:\r
        """두 수를 곱합니다."""\r
        return x * y\r
\r
    sig = inspect.signature(multiply)\r
    doc = inspect.getdoc(multiply)\r
\r
    documentation = {\r
        'name': multiply.__name__,\r
        'signature': str(sig),\r
        'docstring': doc,\r
        'parameters': list(sig.parameters.keys())\r
    }\r
\r
    documentation\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def multiply(x: int, y: int) -> int:\r
          """두 수를 곱합니다."""\r
          return x * y\r
\r
      sig = inspect.signature(multiply)\r
      doc = inspect.getdoc(multiply)\r
\r
      documentation = {\r
          'name': multiply.__name__,\r
          'signature': str(sig),\r
          'docstring': doc,\r
          'parameters': list(sig.parameters.keys())\r
      }\r
\r
      documentation\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 플러그인 계약 검사'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 플러그인 계약 검사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: inspect의 실무 가치는 런타임 객체를 들여다본 뒤 계약을 자동 검증하는 데 있습니다. 함수 시그니처, 타입 힌트, docstring, 공개 메서드 목록을\r
    검사하면 플러그인이나 자동화 훅을 실행 전에 걸러낼 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import inspect\r
    from typing import get_type_hints\r
\r
    def validateAction(func):\r
        sig = inspect.signature(func)\r
        parameters = list(sig.parameters.values())\r
        hints = get_type_hints(func)\r
\r
        assert len(parameters) >= 2, 'payload와 context 인자가 필요합니다'\r
        assert parameters[0].name == 'payload', '첫 번째 인자는 payload여야 합니다'\r
        assert parameters[1].name == 'context', '두 번째 인자는 context여야 합니다'\r
        assert hints.get('payload') is dict, 'payload 타입 힌트는 dict여야 합니다'\r
        assert hints.get('context') is dict, 'context 타입 힌트는 dict여야 합니다'\r
        assert hints.get('return') is dict, '반환 타입 힌트는 dict여야 합니다'\r
\r
        return {\r
            'name': func.__name__,\r
            'signature': str(sig),\r
            'requiredParameters': [param.name for param in parameters[:2]]\r
        }\r
\r
    def normalizeOrder(payload: dict, context: dict) -> dict:\r
        return {'orderId': payload['id'], 'source': context['source']}\r
\r
    actionReport = validateAction(normalizeOrder)\r
\r
    assert actionReport['requiredParameters'] == ['payload', 'context']\r
    actionReport\r
  exercise:\r
    prompt: '검증 루프: 플러그인 계약 검사 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import inspect\r
      from typing import get_type_hints\r
\r
      def validateAction(func):\r
          sig = inspect.signature(func)\r
          parameters = list(sig.parameters.values())\r
          hints = get_type_hints(func)\r
\r
          assert len(parameters) >= 2, 'payload와 context 인자가 필요합니다'\r
          assert parameters[0].name == 'payload', '첫 번째 인자는 payload여야 합니다'\r
          assert parameters[1].name == 'context', '두 번째 인자는 context여야 합니다'\r
          assert hints.get('payload') is dict, 'payload 타입 힌트는 dict여야 합니다'\r
          assert hints.get('context') is dict, 'context 타입 힌트는 dict여야 합니다'\r
          assert hints.get('return') is dict, '반환 타입 힌트는 dict여야 합니다'\r
\r
          return {\r
              'name': func.__name__,\r
              'signature': str(sig),\r
              'requiredParameters': [param.name for param in parameters[:2]]\r
          }\r
\r
      def normalizeOrder(payload: dict, context: dict) -> dict:\r
          return {'orderId': payload['id'], 'source': context['source']}\r
\r
      actionReport = validateAction(normalizeOrder)\r
\r
      assert actionReport['requiredParameters'] == ['payload', 'context']\r
      actionReport\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 플러그인 계약 검사의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 플러그인 계약 검사 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import inspect\r
\r
    def test1():\r
        pass\r
\r
    check1 = inspect.isfunction(test1)\r
    check1\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import inspect\r
\r
      def test1():\r
          pass\r
\r
      check1 = inspect.isfunction(test1)\r
      check1\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 30_inspect-callable-contract-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - signatures
    - practical
    - workflow_validation
    title: callable signature에서 필수 인자와 keyword-only 옵션 읽기
    subtitle: inspect.signature contract
    goal: 샘플 callable의 signature를 inspect로 읽어 필수 인자, keyword-only 인자, 반환 annotation, docstring 여부를 반환한다.
    why: inspect를 배우는 이유는 내부를 구경하는 것이 아니라, 실행 전에 함수 호출 계약을 안전하게 판정하기 위해서입니다.
    explanation: describe_callable_contract(action_name)를 완성해 action_name에 맞는 샘플 함수를 고르고 inspect.signature와 inspect.getdoc 결과를 요약하세요.
    tips:
    - inspect.Signature.empty를 사용하면 default나 annotation 누락을 구분할 수 있습니다.
    - keyword-only 인자는 param.kind가 inspect.Parameter.KEYWORD_ONLY인지 확인하세요.
    exercise:
      prompt: describe_callable_contract(action_name)를 완성해 함수 signature와 계약 요약을 반환하세요.
      starterCode: |-
        def describe_callable_contract(action_name):
            raise NotImplementedError
      solution: |-
        def describe_callable_contract(action_name):
            import inspect

            def normalize_order(payload: dict, context: dict, *, dry_run: bool = False) -> dict:
                """Normalize an order payload."""
                return {"ok": True}

            actions = {"normalize_order": normalize_order}
            if action_name not in actions:
                raise ValueError("unknown action")

            func = actions[action_name]
            sig = inspect.signature(func)
            params = list(sig.parameters.values())
            required = [
                param.name
                for param in params
                if param.default is inspect.Signature.empty
                and param.kind
                in {
                    inspect.Parameter.POSITIONAL_ONLY,
                    inspect.Parameter.POSITIONAL_OR_KEYWORD,
                    inspect.Parameter.KEYWORD_ONLY,
                }
            ]
            keyword_only = [
                param.name
                for param in params
                if param.kind is inspect.Parameter.KEYWORD_ONLY
            ]
            return_annotation = sig.return_annotation
            if isinstance(return_annotation, str):
                return_annotation_name = return_annotation
            else:
                return_annotation_name = return_annotation.__name__
            return {
                "name": func.__name__,
                "signature": str(sig),
                "requiredParameters": required,
                "keywordOnly": keyword_only,
                "returnAnnotation": return_annotation_name,
                "hasDoc": bool(inspect.getdoc(func)),
            }
      hints:
      - parameters.values()는 정의 순서를 보존합니다.
      - str(signature) 결과를 그대로 반환하면 사람에게 보여줄 계약 문자열이 됩니다.
    check:
      id: python.builtins.inspect.callable-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.inspect.empty.behavior.v1.fixture
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
        entry: describe_callable_contract
        cases:
        - id: reports-normalize-order-contract
          arguments:
          - value: normalize_order
          expectedReturn:
            name: normalize_order
            signature: "(payload: 'dict', context: 'dict', *, dry_run: 'bool' = False) -> 'dict'"
            requiredParameters:
            - payload
            - context
            keywordOnly:
            - dry_run
            returnAnnotation: dict
            hasDoc: true
        - id: rejects-unknown-action
          arguments:
          - value: missing_action
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 30_inspect-hook-validator-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - members
    - practical
    - workflow_validation
    title: 훅 registry에서 실행 전 계약을 inspect로 검증하기
    subtitle: validate plugin hook
    goal: registry의 hook 함수를 inspect.signature와 get_type_hints로 검사하고 실행 가능한 계약 요약을 반환한다.
    why: 전이 과제에서는 inspect를 문서 생성에서 실행 전 안전장치로 옮깁니다. 잘못된 hook을 실행 전에 막아야 자동화가 안정됩니다.
    explanation: validate_hook_registry(hook_name)를 완성해 payload/context/return 타입 힌트와 인자 이름이 맞는 hook만 통과시키세요.
    tips:
    - get_type_hints(func)는 annotation 객체를 실제 타입으로 해석합니다.
    - 계약이 틀린 hook은 ValueError를 발생시키세요.
    exercise:
      prompt: validate_hook_registry(hook_name)를 완성해 유효한 hook의 signature, annotations, docstring 요약을 반환하세요.
      starterCode: |-
        def validate_hook_registry(hook_name):
            raise NotImplementedError
      solution: |-
        def validate_hook_registry(hook_name):
            import inspect
            from typing import get_type_hints

            def ingest_row(payload: dict, context: dict) -> dict:
                """Convert one row into normalized output."""
                return {"row": payload, "source": context.get("source")}

            def broken_hook(payload):
                return payload

            registry = {
                "ingest_row": ingest_row,
                "broken_hook": broken_hook,
            }
            if hook_name not in registry:
                raise ValueError("unknown hook")

            func = registry[hook_name]
            sig = inspect.signature(func)
            params = list(sig.parameters.values())
            hints = get_type_hints(func)
            valid = (
                len(params) >= 2
                and params[0].name == "payload"
                and params[1].name == "context"
                and hints.get("payload") is dict
                and hints.get("context") is dict
                and hints.get("return") is dict
            )
            if not valid:
                raise ValueError("invalid hook contract")

            return {
                "name": func.__name__,
                "signature": str(sig),
                "requiredParameters": [param.name for param in params[:2]],
                "annotations": {
                    key: value.__name__
                    for key, value in hints.items()
                },
                "docFirstLine": inspect.getdoc(func).splitlines()[0],
                "isFunction": inspect.isfunction(func),
            }
      hints:
      - params[0]과 params[1] 이름을 직접 검사하세요.
      - annotation은 문자열이 아니라 dict 타입 객체인지 비교하세요.
    check:
      id: python.builtins.inspect.hook-validator.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.inspect.empty.behavior.v1.fixture
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
        entry: validate_hook_registry
        cases:
        - id: accepts-valid-ingest-hook
          arguments:
          - value: ingest_row
          expectedReturn:
            name: ingest_row
            signature: "(payload: 'dict', context: 'dict') -> 'dict'"
            requiredParameters:
            - payload
            - context
            annotations:
              payload: dict
              context: dict
              return: dict
            docFirstLine: Convert one row into normalized output.
            isFunction: true
        - id: rejects-broken-hook
          arguments:
          - value: broken_hook
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 30_inspect-object-kind-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - type_checking
    - signatures
    - advanced_inspection
    title: function, class, bound method의 inspect 판별 차이 회상하기
    subtitle: isfunction, isclass, ismethod
    goal: 런타임 객체 종류를 골라 inspect.isfunction, isclass, ismethod, signature 결과를 반환한다.
    why: 시간이 지나도 남아야 할 inspect 감각은 callable이라고 모두 같은 객체가 아니며, bound method는 self가 이미 묶인 signature를 보인다는 점입니다.
    explanation: classify_runtime_object(object_kind)를 완성해 function, class, bound_method 샘플 중 하나를 inspect로 판별하고 signature 문자열을 반환하세요.
    tips:
    - bound method는 inspect.ismethod가 True입니다.
    - 같은 run 메서드라도 class에서 보는 함수와 instance에서 보는 bound method의 signature는 다릅니다.
    exercise:
      prompt: classify_runtime_object(object_kind)를 완성해 객체 종류별 inspect 판별 결과를 반환하세요.
      starterCode: |-
        def classify_runtime_object(object_kind):
            raise NotImplementedError
      solution: |-
        def classify_runtime_object(object_kind):
            import inspect

            class DemoAction:
                def run(self, payload, context):
                    return payload

            def plain_action(payload, context):
                return payload

            demo = DemoAction()
            objects = {
                "function": plain_action,
                "class": DemoAction,
                "bound_method": demo.run,
            }
            if object_kind not in objects:
                raise ValueError("unknown object kind")

            target = objects[object_kind]
            return {
                "isFunction": inspect.isfunction(target),
                "isClass": inspect.isclass(target),
                "isMethod": inspect.ismethod(target),
                "signature": str(inspect.signature(target)),
            }
      hints:
      - instance.method는 bound method로 판정됩니다.
      - class 객체도 callable일 수 있지만 isfunction은 False입니다.
    check:
      id: python.builtins.inspect.object-kind.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.inspect.empty.behavior.v1.fixture
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
        entry: classify_runtime_object
        cases:
        - id: recognizes-bound-method-signature
          arguments:
          - value: bound_method
          expectedReturn:
            isFunction: false
            isClass: false
            isMethod: true
            signature: "(payload, context)"
        - id: recognizes-class-object
          arguments:
          - value: class
          expectedReturn:
            isFunction: false
            isClass: true
            isMethod: false
            signature: "()"
        - id: rejects-unknown-kind
          arguments:
          - value: module
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};