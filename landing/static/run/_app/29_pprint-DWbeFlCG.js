var e=`meta:\r
  id: 29_pprint\r
  title: pprint - 예쁜 출력\r
  category: builtins\r
  tags:\r
  - pprint\r
  - 출력\r
  - 포맷\r
  - 디버깅\r
  - pretty print\r
  description: 데이터 구조를 읽기 쉽게 출력하는 pprint 모듈\r
  keywords:\r
  - pprint\r
  - 출력\r
  - 포맷\r
  - 디버깅\r
  - pretty print\r
intro:\r
  emoji: 🎨\r
  points:\r
  - 읽기 쉬운 데이터 출력\r
  - 중첩 구조 들여쓰기\r
  - 폭과 깊이 제어\r
  - 디버깅과 로깅에 유용\r
  direction: pprint 예쁜 출력에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - pprint 예쁜 출력 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 출력 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 폭과 깊이 제어 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: pprint 예쁜 출력 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: pprint 예쁜 출력 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: pprint 예쁜 출력 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: pprint 시작하기\r
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    pprint는 파이썬 표준 라이브러리입니다. 복잡한 데이터 구조를 읽기 쉽게 포맷팅하여 출력합니다.\r
\r
    Codaro 환경에서는 pformat()을 사용하여 문자열로 반환합니다. 일반 Python에서는 pprint()가 직접 콘솔에 출력합니다.\r
  snippet: |-\r
    import pprint\r
\r
    data = {'name': 'Alice', 'age': 30, 'skills': ['Python', 'JavaScript', 'SQL']}\r
\r
    formatted = pprint.pformat(data)\r
    formatted\r
  exercise:\r
    prompt: 모듈 임포트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      data = {'name': 'Alice', 'age': 30, 'skills': ['Python', 'JavaScript', 'SQL']}\r
\r
      formatted = pprint.pformat(data)\r
      formatted\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모듈 임포트에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 모듈 임포트 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: basic_pprint\r
  title: 기본 출력\r
  structuredPrimary: true\r
  subtitle: pformat 함수\r
  goal: 기본 출력에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    pformat()은 데이터 구조를 보기 좋게 포맷팅한 문자열을 반환합니다.\r
\r
    pformat()은 객체를 수정하지 않고 문자열만 반환하므로, 로그 파일이나 디버그 메시지에 안전하게 사용할 수 있습니다.\r
  snippet: |-\r
    import pprint\r
\r
    numbers = list(range(1, 21))\r
    prettyList = pprint.pformat(numbers)\r
    prettyList\r
  exercise:\r
    prompt: 기본 출력 예제에서 \`numbers\`, \`prettyList\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      numbers = list(range(1, 21))\r
      prettyList = pprint.pformat(numbers)\r
      prettyList\r
    hints:\r
    - 바꿀 지점은 \`numbers = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`numbers\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 출력에서 \`numbers\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 출력 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: width_depth\r
  title: 폭과 깊이 제어\r
  structuredPrimary: true\r
  subtitle: 출력 형식 조정\r
  goal: 폭과 깊이 제어에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    width와 depth 파라미터로 출력 형식을 세밀하게 제어할 수 있습니다.\r
\r
    width를 좁게 설정하면 더 많은 줄바꿈이 발생하여 세로로 긴 출력이 됩니다. 터미널 폭에 맞춰 조정하세요.\r
  snippet: |-\r
    import pprint\r
\r
    items = [f'item_{i}' for i in range(20)]\r
\r
    narrow = pprint.pformat(items, width=40)\r
    wide = pprint.pformat(items, width=120)\r
\r
    narrow, wide\r
  exercise:\r
    prompt: 폭과 깊이 제어 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      items = [f'item_{i}' for i in range(20)]\r
\r
      narrow = pprint.pformat(items, width=40)\r
      wide = pprint.pformat(items, width=120)\r
\r
      narrow, wide\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 폭과 깊이 제어의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 폭과 깊이 제어 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: prettyprinter\r
  title: PrettyPrinter 클래스\r
  structuredPrimary: true\r
  subtitle: 재사용 가능한 프린터\r
  goal: PrettyPrinter 클래스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    PrettyPrinter 객체를 생성하면 동일한 설정으로 여러 번 사용할 수 있습니다.\r
\r
    PrettyPrinter 객체를 만들면 동일한 포맷 설정을 여러 곳에서 재사용할 수 있어 일관성을 유지하기 좋습니다.\r
  snippet: |-\r
    import pprint\r
\r
    printer = pprint.PrettyPrinter(width=60, indent=4)\r
\r
    data1 = {'a': 1, 'b': 2, 'c': 3}\r
    data2 = ['x', 'y', 'z']\r
\r
    result1 = printer.pformat(data1)\r
    result2 = printer.pformat(data2)\r
\r
    result1, result2\r
  exercise:\r
    prompt: PrettyPrinter 클래스 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      printer = pprint.PrettyPrinter(width=60, indent=4)\r
\r
      data1 = {'a': 1, 'b': 2, 'c': 3}\r
      data2 = ['x', 'y', 'z']\r
\r
      result1 = printer.pformat(data1)\r
      result2 = printer.pformat(data2)\r
\r
      result1, result2\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: PrettyPrinter 클래스에서 \`printer\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: PrettyPrinter 클래스 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: sorting\r
  title: 정렬과 정리\r
  structuredPrimary: true\r
  subtitle: 키 정렬\r
  goal: 정렬과 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    딕셔너리 키를 정렬하여 출력하면 일관된 순서로 데이터를 확인할 수 있습니다.\r
\r
    sort_dicts=True는 딕셔너리 비교나 디버깅 시 유용합니다. 동일한 데이터가 항상 같은 순서로 출력됩니다.\r
  snippet: |-\r
    import pprint\r
\r
    unordered = {'z': 1, 'a': 2, 'm': 3, 'b': 4}\r
\r
    sortedOutput = pprint.pformat(unordered, sort_dicts=True)\r
    unsorted = pprint.pformat(unordered, sort_dicts=False)\r
\r
    sortedOutput, unsorted\r
  exercise:\r
    prompt: 정렬과 정리 예제에서 \`unordered\`, \`sortedOutput\`, \`unsorted\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      unordered = {'z': 1, 'a': 2, 'm': 3, 'b': 4}\r
\r
      sortedOutput = pprint.pformat(unordered, sort_dicts=True)\r
      unsorted = pprint.pformat(unordered, sort_dicts=False)\r
\r
      sortedOutput, unsorted\r
    hints:\r
    - 바꿀 지점은 \`unordered = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`unordered\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 정렬과 정리에서 \`unordered\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 정렬과 정리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: debugging\r
  title: 디버깅 활용\r
  structuredPrimary: true\r
  subtitle: 실무 활용 패턴\r
  goal: 디버깅 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    pprint는 복잡한 데이터 구조를 디버깅하고 로그에 기록할 때 매우 유용합니다.\r
\r
    디버깅 시 pformat()을 로깅 메시지에 포함하면 복잡한 객체의 상태를 쉽게 추적할 수 있습니다.\r
  snippet: |-\r
    import pprint\r
\r
    apiResponse = {\r
        'status': 200,\r
        'data': {\r
            'users': [\r
                {'id': 1, 'name': 'Alice', 'active': True},\r
                {'id': 2, 'name': 'Bob', 'active': False}\r
            ],\r
            'pagination': {'page': 1, 'total': 100}\r
        }\r
    }\r
\r
    readable = pprint.pformat(apiResponse, indent=2)\r
    readable\r
  exercise:\r
    prompt: 디버깅 활용 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      apiResponse = {\r
          'status': 200,\r
          'data': {\r
              'users': [\r
                  {'id': 1, 'name': 'Alice', 'active': True},\r
                  {'id': 2, 'name': 'Bob', 'active': False}\r
              ],\r
              'pagination': {'page': 1, 'total': 100}\r
          }\r
      }\r
\r
      readable = pprint.pformat(apiResponse, indent=2)\r
      readable\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디버깅 활용에서 \`apiResponse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 디버깅 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 사용 사례\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실제 프로젝트에서 pprint를 활용하는 다양한 패턴들입니다.\r
\r
    pprint는 JSON과 달리 파이썬 객체 그대로 출력하므로, None, True, False 등이 파이썬 형식으로 표시됩니다.\r
  snippet: |-\r
    import pprint\r
\r
    environment = {\r
        'APP_NAME': 'MyApp',\r
        'DEBUG': True,\r
        'DATABASE_URL': 'postgresql://localhost/mydb',\r
        'FEATURES': {\r
            'auth': True,\r
            'cache': True,\r
            'logging': {'level': 'INFO', 'file': 'app.log'}\r
        }\r
    }\r
\r
    envDump = pprint.pformat(environment, indent=2, width=70)\r
    envDump\r
  exercise:\r
    prompt: 실전 활용 예제에서 \`environment\`, \`envDump\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      environment = {\r
          'APP_NAME': 'MyApp',\r
          'DEBUG': True,\r
          'DATABASE_URL': 'postgresql://localhost/mydb',\r
          'FEATURES': {\r
              'auth': True,\r
              'cache': True,\r
              'logging': {'level': 'INFO', 'file': 'app.log'}\r
          }\r
      }\r
\r
      envDump = pprint.pformat(environment, indent=2, width=70)\r
      envDump\r
    hints:\r
    - 바꿀 지점은 \`environment = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`environment\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`environment\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 안전한 진단 리포트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 안전한 진단 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: pprint는 보기 좋은 출력만 만드는 도구가 아닙니다. 운영 진단 리포트에서는 읽기 쉬운 줄 길이, 안정적인 키 순서, 민감정보 마스킹까지 검증해야 업무\r
    로그로 쓸 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pprint\r
\r
    diagnosticPayload = {\r
        'service': 'billing-api',\r
        'health': {'database': 'ok', 'queue': 'slow'},\r
        'credentials': {\r
            'user': 'service-account',\r
            'password': 'plain-text-password',\r
            'token': 'secret-token'\r
        },\r
        'recentErrors': [\r
            {'code': 'QUEUE_LAG', 'count': 3},\r
            {'code': 'TIMEOUT', 'count': 1}\r
        ]\r
    }\r
\r
    sensitiveKeys = {'password', 'token', 'api_key'}\r
\r
    def redactSecrets(value):\r
        if isinstance(value, dict):\r
            return {\r
                key: '***' if key.lower() in sensitiveKeys else redactSecrets(item)\r
                for key, item in value.items()\r
            }\r
        if isinstance(value, list):\r
            return [redactSecrets(item) for item in value]\r
        return value\r
\r
    safePayload = redactSecrets(diagnosticPayload)\r
    reportText = pprint.pformat(safePayload, sort_dicts=True, width=72)\r
\r
    assert 'plain-text-password' not in reportText\r
    assert 'secret-token' not in reportText\r
    assert "'password': '***'" in reportText\r
    reportText\r
  exercise:\r
    prompt: '검증 루프: 안전한 진단 리포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import pprint\r
\r
      diagnosticPayload = {\r
          'service': 'billing-api',\r
          'health': {'database': 'ok', 'queue': 'slow'},\r
          'credentials': {\r
              'user': 'service-account',\r
              'password': 'plain-text-password',\r
              'token': 'secret-token'\r
          },\r
          'recentErrors': [\r
              {'code': 'QUEUE_LAG', 'count': 3},\r
              {'code': 'TIMEOUT', 'count': 1}\r
          ]\r
      }\r
\r
      sensitiveKeys = {'password', 'token', 'api_key'}\r
\r
      def redactSecrets(value):\r
          if isinstance(value, dict):\r
              return {\r
                  key: '***' if key.lower() in sensitiveKeys else redactSecrets(item)\r
                  for key, item in value.items()\r
              }\r
          if isinstance(value, list):\r
              return [redactSecrets(item) for item in value]\r
          return value\r
\r
      safePayload = redactSecrets(diagnosticPayload)\r
      reportText = pprint.pformat(safePayload, sort_dicts=True, width=72)\r
\r
      assert 'plain-text-password' not in reportText\r
      assert 'secret-token' not in reportText\r
      assert "'password': '***'" in reportText\r
      reportText\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 안전한 진단 리포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 안전한 진단 리포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pprint\r
\r
    nums = [1, 2, 3, 4, 5]\r
    output1 = pprint.pformat(nums)\r
    output1\r
  exercise:\r
    prompt: 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pprint\r
\r
      nums = [1, 2, 3, 4, 5]\r
      output1 = pprint.pformat(nums)\r
      output1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 29_pprint-report-shape-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - width_depth
    - prettyprinter
    - workflow_validation
    title: pformat report의 줄 수와 생략 표시를 결과로 검증하기
    subtitle: width, depth, sorted keys
    goal: 입력 payload를 pformat으로 렌더링하고 줄 수, 첫 줄, 마지막 줄, depth 생략 여부를 반환한다.
    why: pprint는 눈으로 보기 좋은 출력이 아니라, 디버그 리포트가 너무 길거나 깊은 구조를 노출하지 않는지 검증할 때 더 유용합니다.
    explanation: summarize_pretty_report(payload, width=60, depth=None)를 완성해 sort_dicts=True로 안정적인 문자열을 만들고, width/depth가 만든 shape를 dict로 반환하세요.
    tips:
    - width가 너무 작으면 읽을 수 없는 report가 되므로 ValueError로 막으세요.
    - depth가 제한되면 pprint 출력 안에 ... 생략 표시가 생깁니다.
    exercise:
      prompt: summarize_pretty_report(payload, width=60, depth=None)를 완성해 렌더링 문자열과 shape 요약을 반환하세요.
      starterCode: |-
        def summarize_pretty_report(payload, width=60, depth=None):
            raise NotImplementedError
      solution: |-
        def summarize_pretty_report(payload, width=60, depth=None):
            import pprint

            if width < 20:
                raise ValueError("width must be at least 20")

            rendered = pprint.pformat(payload, sort_dicts=True, width=width, depth=depth)
            lines = rendered.splitlines()
            return {
                "rendered": rendered,
                "lineCount": len(lines),
                "firstLine": lines[0],
                "lastLine": lines[-1],
                "containsEllipsis": "..." in rendered,
            }
      hints:
      - pformat은 stdout에 쓰지 않고 문자열을 반환합니다.
      - splitlines()로 report가 실제 몇 줄인지 확인하세요.
    check:
      id: python.builtins.pprint.report-shape.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pprint.empty.behavior.v1.fixture
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
        entry: summarize_pretty_report
        cases:
        - id: summarizes-depth-limited-report
          arguments:
          - value:
              beta:
              - x: 1
              - y: 2
              alpha:
                nested:
                - red
                - blue
          - value: 35
          - value: 2
          expectedReturn:
            rendered: |-
              {'alpha': {'nested': [...]},
               'beta': [{...}, {...}]}
            lineCount: 2
            firstLine: "{'alpha': {'nested': [...]},"
            lastLine: " 'beta': [{...}, {...}]}"
            containsEllipsis: true
        - id: rejects-unreadable-width
          arguments:
          - value:
              alpha: 1
          - value: 8
          - value: null
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 29_pprint-safe-debug-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - debugging
    - practical
    - workflow_validation
    title: 민감정보를 마스킹한 디버그 리포트를 pformat으로 만들기
    subtitle: redact before formatting
    goal: 중첩 payload에서 지정 key를 마스킹한 뒤 안정적인 pprint 문자열과 안전성 신호를 반환한다.
    why: 실제 로그에서는 읽기 쉬운 출력보다 먼저 안전한 출력이어야 합니다. pprint 전에 원본 payload를 정리하는 습관이 중요합니다.
    explanation: build_safe_debug_report(payload, hidden_keys, width=60)를 완성해 hidden_keys에 해당하는 dict 값을 재귀적으로 마스킹하고 pformat report를 반환하세요.
    tips:
    - hidden_keys는 소문자 기준으로 비교하세요.
    - report에 원본 token 값이 남아 있으면 실패해야 합니다.
    exercise:
      prompt: build_safe_debug_report(payload, hidden_keys, width=60)를 완성해 마스킹된 report와 안전성 요약을 반환하세요.
      starterCode: |-
        def build_safe_debug_report(payload, hidden_keys, width=60):
            raise NotImplementedError
      solution: |-
        def build_safe_debug_report(payload, hidden_keys, width=60):
            import pprint

            hidden = {str(key).lower() for key in hidden_keys}
            if not hidden:
                raise ValueError("hidden_keys required")
            if width < 20:
                raise ValueError("width must be at least 20")

            def redact(value):
                if isinstance(value, dict):
                    return {
                        key: "***" if str(key).lower() in hidden else redact(item)
                        for key, item in value.items()
                    }
                if isinstance(value, list):
                    return [redact(item) for item in value]
                return value

            report = pprint.pformat(redact(payload), sort_dicts=True, width=width)
            return {
                "report": report,
                "lineCount": len(report.splitlines()),
                "containsRawToken": "t-123" in report,
                "maskedTokenSeen": "'token': '***'" in report,
            }
      hints:
      - pformat 전에 payload를 먼저 재귀적으로 정리하세요.
      - sort_dicts=True를 쓰면 같은 payload가 같은 순서로 출력됩니다.
    check:
      id: python.builtins.pprint.safe-debug.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pprint.empty.behavior.v1.fixture
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
        entry: build_safe_debug_report
        cases:
        - id: redacts-token-before-formatting
          arguments:
          - value:
              service: api
              credentials:
                token: t-123
                user: robot
              events:
              - id: 2
                status: slow
              - id: 1
                status: ok
          - value:
            - token
          - value: 60
          expectedReturn:
            report: |-
              {'credentials': {'token': '***', 'user': 'robot'},
               'events': [{'id': 2, 'status': 'slow'},
                          {'id': 1, 'status': 'ok'}],
               'service': 'api'}
            lineCount: 4
            containsRawToken: false
            maskedTokenSeen: true
        - id: rejects-empty-hidden-key-list
          arguments:
          - value:
              token: t-123
          - value: []
          - value: 60
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 29_pprint-options-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - module_import
    - width_depth
    - sorting
    title: sort_dicts와 depth 옵션의 효과 회상하기
    subtitle: stable order and shallow view
    goal: 같은 dict를 compact 출력과 depth=1 출력으로 렌더링하고 정렬 순서, 줄 수, 생략 표시를 반환한다.
    why: 시간이 지나도 남아야 할 pprint 감각은 pformat이 문자열을 반환하고, sort_dicts는 순서를 안정화하며, depth는 깊은 구조를 생략한다는 점입니다.
    explanation: recall_pformat_controls(data)를 완성해 sort_dicts=True compact 문자열과 depth=1 shallow 문자열의 차이를 반환하세요.
    tips:
    - dict가 아니면 이 회상 과제의 입력 계약이 아니므로 ValueError로 막으세요.
    - depth=1은 중첩 dict/list를 ...로 줄입니다.
    exercise:
      prompt: recall_pformat_controls(data)를 완성해 compact와 shallow pformat 결과의 핵심 차이를 반환하세요.
      starterCode: |-
        def recall_pformat_controls(data):
            raise NotImplementedError
      solution: |-
        def recall_pformat_controls(data):
            import pprint

            if not isinstance(data, dict):
                raise ValueError("dict data required")

            compact = pprint.pformat(data, width=120, depth=None, sort_dicts=True)
            shallow = pprint.pformat(data, width=120, depth=1, sort_dicts=True)
            return {
                "compact": compact,
                "shallow": shallow,
                "compactLineCount": len(compact.splitlines()),
                "sortedStartsWithA": compact.startswith("{'a'"),
                "fullContainsInner": "inner" in compact,
                "shallowUsesEllipsis": "..." in shallow,
            }
      hints:
      - compact는 전체 구조를 보여야 합니다.
      - shallow는 깊이를 줄여 inner 내용을 생략해야 합니다.
    check:
      id: python.builtins.pprint.options.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.pprint.empty.behavior.v1.fixture
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
        entry: recall_pformat_controls
        cases:
        - id: compares-compact-and-depth-limited-output
          arguments:
          - value:
              b:
                inner:
                - 1
                - 2
              a: 1
          expectedReturn:
            compact: "{'a': 1, 'b': {'inner': [1, 2]}}"
            shallow: "{'a': 1, 'b': {...}}"
            compactLineCount: 1
            sortedStartsWithA: true
            fullContainsInner: true
            shallowUsesEllipsis: true
        - id: rejects-non-dict-input
          arguments:
          - value:
            - a
            - b
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};