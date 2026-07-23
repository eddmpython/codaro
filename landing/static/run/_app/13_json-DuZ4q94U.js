var e=`meta:\r
  id: 13_json\r
  title: json - JSON 처리\r
  category: builtins\r
  tags:\r
  - json\r
  - 직렬화\r
  - API\r
  - 데이터교환\r
  seo:\r
    title: 파이썬 json 모듈 완전 정복\r
    description: json 모듈로 JSON 데이터 직렬화, 파일 처리, 커스텀 인코딩을 배웁니다.\r
    keywords:\r
    - json\r
    - 직렬화\r
    - dumps\r
    - loads\r
    - API\r
    - 파이썬JSON\r
intro:\r
  emoji: 📋\r
  points:\r
  - JSON 직렬화와 역직렬화\r
  - 파일 읽기와 쓰기\r
  - 포맷팅과 정렬 옵션\r
  - 커스텀 인코딩/디코딩\r
  direction: json JSON 처리에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - json JSON 처리 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: json 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 직렬화 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 파일 읽기와 쓰기 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: json JSON 처리 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: json JSON 처리 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: json JSON 처리 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: json 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: json 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    json은 파이썬 표준 라이브러리입니다. JSON(JavaScript Object Notation) 데이터를 처리하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 json 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    import json\r
    import tempfile\r
    from pathlib import Path\r
\r
    jsonScratch = Path(tempfile.gettempdir()) / 'codaro_json_scratch'\r
    jsonScratch.mkdir(parents=True, exist_ok=True)\r
\r
    'json 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: json 모듈 불러오기 예제에서 \`jsonScratch\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      jsonScratch = Path(tempfile.gettempdir()) / 'codaro_json_scratch'\r
      jsonScratch.mkdir(parents=True, exist_ok=True)\r
\r
      'json 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 \`jsonScratch = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`jsonScratch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: json 모듈 불러오기에서 \`jsonScratch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: json 모듈 불러오기 실행 뒤 \`jsonScratch\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: basic_serialization\r
  title: 기본 직렬화\r
  structuredPrimary: true\r
  subtitle: dumps와 loads\r
  goal: 기본 직렬화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    json 모듈은 Python 객체와 JSON 문자열 간 변환을 제공합니다. dumps()는 Python 객체를 JSON 문자열로 직렬화하고, loads()는 JSON 문자열을 Python 객체로 역직렬화합니다. API 통신, 설정 파일, 데이터 교환에 필수적입니다.\r
\r
    JSON의 true/false는 Python의 True/False로, null은 None으로 자동 변환됩니다.\r
  snippet: |-\r
    userData = {'name': 'Alice', 'age': 30, 'city': 'Seoul'}\r
    jsonString = json.dumps(userData)\r
    jsonString\r
  exercise:\r
    prompt: 기본 직렬화 예제에서 \`userData\`, \`jsonString\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      userData = {'name': 'Alice', 'age': 30, 'city': 'Seoul'}\r
      jsonString = json.dumps(userData)\r
      jsonString\r
    hints:\r
    - 바꿀 지점은 \`userData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`userData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 직렬화에서 \`userData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 직렬화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: file_operations\r
  title: 파일 읽기와 쓰기\r
  structuredPrimary: true\r
  subtitle: dump와 load\r
  goal: json.dump로 파일에 저장하고 json.load로 같은 파일을 읽어 왕복한 결과가 원본과 같은지 확인합니다.\r
  why: 설정 파일, 캐시, 영속 데이터는 거의 항상 파일 기반입니다. dumps/loads 문자열 왕복 대신 파일 왕복을 한 번 직접 해 봐야 운영 코드의 절반이 자연스럽게 짜입니다.\r
  explanation: |-\r
    dump()는 Python 객체를 JSON 파일로 저장하고, load()는 JSON 파일을 Python 객체로 읽어옵니다. 설정 파일, 데이터 캐싱, 영속성 저장에 활용됩니다. 파일 핸들을 직접 전달하여 효율적으로 처리합니다.\r
\r
    대용량 데이터는 dump/load가 dumps/loads보다 메모리 효율적입니다.\r
  snippet: |-\r
    configData = {'theme': 'dark', 'language': 'ko', 'notifications': True}\r
    with open(jsonScratch / 'config.json', 'w', encoding='utf-8') as f:\r
        json.dump(configData, f)\r
    'config.json 저장 완료'\r
  exercise:\r
    prompt: 파일 읽기와 쓰기 예제에서 설정 키나 값을 바꾸고 저장 후 다시 읽은 JSON이 원본 변경을 반영하는지 확인하세요.\r
    starterCode: |-\r
      configData = {'theme': 'dark', 'language': 'ko', 'notifications': True}\r
      with open(jsonScratch / 'config.json', 'w', encoding='utf-8') as f:\r
          json.dump(configData, f)\r
      'config.json 저장 완료'\r
    hints:\r
    - 바꿀 지점은 \`configData\`의 키와 값, 저장 파일명, json.dump/json.load 흐름입니다.\r
    - 실행 뒤 저장 파일을 다시 읽은 결과와 원본 dict가 같은지 확인하세요.\r
  check:\r
    noError: 파일 읽기와 쓰기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 파일 읽기와 쓰기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: formatting\r
  title: 포맷팅 옵션\r
  structuredPrimary: true\r
  subtitle: indent, sort_keys, separators\r
  goal: 포맷팅 옵션에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    JSON 출력을 사람이 읽기 쉽게 포맷팅할 수 있습니다. indent는 들여쓰기 수준을 지정하고, sort_keys는 키를 정렬하며, separators는 구분자를 커스터마이즈합니다. 디버깅, 로그, 설정 파일 작성에 유용합니다.\r
\r
    ensure_ascii=False를 사용하면 한글, 이모지 등이 \\uXXXX 형태로 변환되지 않습니다.\r
  snippet: |-\r
    studentData = {'name': '김철수', 'grade': 'A', 'score': 95}\r
    prettyJson = json.dumps(studentData, indent=2, ensure_ascii=False)\r
    prettyJson\r
  exercise:\r
    prompt: 포맷팅 옵션 예제에서 \`studentData\`, \`prettyJson\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      studentData = {'name': '김철수', 'grade': 'A', 'score': 95}\r
      prettyJson = json.dumps(studentData, indent=2, ensure_ascii=False)\r
      prettyJson\r
    hints:\r
    - 바꿀 지점은 \`studentData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`studentData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 포맷팅 옵션에서 \`studentData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 포맷팅 옵션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: data_types\r
  title: 지원 데이터 타입\r
  structuredPrimary: true\r
  subtitle: Python ↔ JSON 변환\r
  goal: 지원 데이터 타입에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    JSON은 제한된 데이터 타입만 지원합니다. Python의 일부 타입은 JSON으로 직렬화할 수 없거나 변환 시 타입이 바뀝니다. 딕셔너리, 리스트, 문자열, 숫자, 불린, None만 직접 지원되며, 날짜나 집합 등은 커스텀 처리가 필요합니다.\r
\r
    set, datetime, custom 객체는 기본적으로 직렬화할 수 없습니다. 커스텀 인코더가 필요합니다.\r
  snippet: |-\r
    mixedData = {\r
        'text': 'Hello',\r
        'number': 42,\r
        'decimal': 3.14,\r
        'flag': True,\r
        'empty': None,\r
        'items': [1, 2, 3]\r
    }\r
    convertedJson = json.dumps(mixedData, indent=2)\r
    convertedJson\r
  exercise:\r
    prompt: 지원 데이터 타입 예제에서 JSON으로 직접 직렬화되는 값과 별도 처리가 필요한 값을 바꿔 변환 결과를 확인하세요.\r
    starterCode: |-\r
      mixedData = {\r
          'text': 'Hello',\r
          'number': 42,\r
          'decimal': 3.14,\r
          'flag': True,\r
          'empty': None,\r
          'items': [1, 2, 3]\r
      }\r
      convertedJson = json.dumps(mixedData, indent=2)\r
      convertedJson\r
    hints:\r
    - 바꿀 지점은 \`mixedData\`의 문자열, 숫자, 불린, None, 리스트 값입니다.\r
    - 실행 뒤 \`convertedJson\`에 값과 타입 변환이 어떻게 반영됐는지 보세요.\r
  check:\r
    noError: 지원 데이터 타입에서 \`mixedData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 지원 데이터 타입 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: custom_encoding\r
  title: 커스텀 인코딩\r
  structuredPrimary: true\r
  subtitle: default와 object_hook\r
  goal: 커스텀 인코딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    기본 지원되지 않는 타입을 JSON으로 변환하려면 default 함수를 사용합니다. 역직렬화 시 커스텀 변환은 object_hook으로 구현합니다. 날짜, 집합, 사용자 정의 클래스 등을 JSON으로 처리할 수 있습니다.\r
\r
    복잡한 객체는 __dict__를 사용하여 딕셔너리로 변환한 후 직렬화할 수 있습니다.\r
  snippet: |-\r
    def customEncoder(obj):\r
        if isinstance(obj, set):\r
            return list(obj)\r
        raise TypeError(f'{type(obj)} not serializable')\r
\r
    dataWithSet = {'tags': {'python', 'json', 'tutorial'}}\r
    encodedSet = json.dumps(dataWithSet, default=customEncoder)\r
    encodedSet\r
  exercise:\r
    prompt: 커스텀 인코딩 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def customEncoder(obj):\r
          if isinstance(obj, set):\r
              return list(obj)\r
          raise TypeError(f'{type(obj)} not serializable')\r
\r
      dataWithSet = {'tags': {'python', 'json', 'tutorial'}}\r
      encodedSet = json.dumps(dataWithSet, default=customEncoder)\r
      encodedSet\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 커스텀 인코딩의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커스텀 인코딩 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: API, 설정 파일, 로그\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 JSON 활용 패턴을 살펴봅니다. API 응답 처리, 설정 파일 관리, 로그 저장, 데이터 교환 등 다양한 시나리오에서 JSON을 효과적으로 사용할 수 있습니다.\r
\r
    JSON 파일은 주석을 지원하지 않습니다. 설명이 필요하면 '_comment' 키를 사용하세요.\r
  snippet: |-\r
    apiResponse = '{"status": "success", "data": {"users": 150, "active": 120}}'\r
    parsedResponse = json.loads(apiResponse)\r
    totalUsers = parsedResponse['data']['users']\r
    totalUsers\r
  exercise:\r
    prompt: 실전 활용 예제에서 API 응답 JSON의 키나 숫자 값을 바꾸고 파싱 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      apiResponse = '{"status": "success", "data": {"users": 150, "active": 120}}'\r
      parsedResponse = json.loads(apiResponse)\r
      totalUsers = parsedResponse['data']['users']\r
      totalUsers\r
    hints:\r
    - 바꿀 지점은 JSON 문자열 안의 \`status\`, \`users\`, \`active\` 값입니다.\r
    - 실행 뒤 \`parsedResponse\`와 \`totalUsers\`가 바꾼 응답 데이터를 반영하는지 보세요.\r
  check:\r
    noError: 실전 활용에서 \`apiResponse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: JSON 설정 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: JSON 설정 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 실무 JSON은 읽고 쓰는 것보다 구조를 검증하고 민감 정보를 제거한 뒤, 다시 읽어도 같은 데이터인지 확인하는 과정이 중요합니다. 여기서는 잘못된 JSON,\r
    누락된 필드, 저장 후 재검증을 한 흐름으로 묶습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    jsonWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_json_workflow_'))\r
    rawConfig = {\r
        'app': {'name': 'Codaro', 'version': '1.0.0'},\r
        'features': ['curriculum', 'automation'],\r
        'limits': {'maxUsers': 25},\r
        'token': 'secret-token'\r
    }\r
\r
    def normalizeConfig(config):\r
        assert isinstance(config.get('app'), dict), 'app 설정은 딕셔너리여야 합니다'\r
        assert isinstance(config['app'].get('name'), str), 'app.name이 필요합니다'\r
        assert isinstance(config['app'].get('version'), str), 'app.version이 필요합니다'\r
        assert isinstance(config.get('features'), list), 'features는 리스트여야 합니다'\r
        assert isinstance(config.get('limits'), dict), 'limits 설정이 필요합니다'\r
        assert isinstance(config['limits'].get('maxUsers'), int), 'limits.maxUsers는 정수여야 합니다'\r
\r
        publicConfig = {key: value for key, value in config.items() if key not in {'password', 'token'}}\r
        publicConfig['features'] = sorted(publicConfig['features'])\r
        return publicConfig\r
\r
    normalizedConfig = normalizeConfig(rawConfig)\r
    assert 'token' not in normalizedConfig\r
    normalizedConfig\r
  exercise:\r
    prompt: '검증 루프: JSON 설정 품질 게이트 예제에서 설정 필드, 제한값, 비밀 키를 바꾸고 정규화와 검증 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      jsonWorkflowRoot = Path(tempfile.mkdtemp(prefix='codaro_json_workflow_'))\r
      rawConfig = {\r
          'app': {'name': 'Codaro', 'version': '1.0.0'},\r
          'features': ['curriculum', 'automation'],\r
          'limits': {'maxUsers': 25},\r
          'token': 'secret-token'\r
      }\r
\r
      def normalizeConfig(config):\r
          assert isinstance(config.get('app'), dict), 'app 설정은 딕셔너리여야 합니다'\r
          assert isinstance(config['app'].get('name'), str), 'app.name이 필요합니다'\r
          assert isinstance(config['app'].get('version'), str), 'app.version이 필요합니다'\r
          assert isinstance(config.get('features'), list), 'features는 리스트여야 합니다'\r
          assert isinstance(config.get('limits'), dict), 'limits 설정이 필요합니다'\r
          assert isinstance(config['limits'].get('maxUsers'), int), 'limits.maxUsers는 정수여야 합니다'\r
\r
          publicConfig = {key: value for key, value in config.items() if key not in {'password', 'token'}}\r
          publicConfig['features'] = sorted(publicConfig['features'])\r
          return publicConfig\r
\r
      normalizedConfig = normalizeConfig(rawConfig)\r
      assert 'token' not in normalizedConfig\r
      normalizedConfig\r
    hints:\r
    - 바꿀 지점은 \`rawConfig\`의 중첩 필드, \`features\`, \`limits\`, 비밀 키입니다.\r
    - 실행 뒤 정렬된 공개 설정과 비밀 키 제거 여부가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: '검증 루프: JSON 설정 품질 게이트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.'\r
    resultCheck: '검증 루프: JSON 설정 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: json 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: JSON 처리 마스터하기\r
  goal: json 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: json 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    person = {'name': 'John', 'age': 25}\r
    jsonStr = json.dumps(person)\r
    jsonStr\r
  exercise:\r
    prompt: json 모듈 종합 복습 예제에서 \`person\`, \`jsonStr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      person = {'name': 'John', 'age': 25}\r
      jsonStr = json.dumps(person)\r
      jsonStr\r
    hints:\r
    - 바꿀 지점은 \`person = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`person\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    noError: json 모듈 종합 복습에서 \`person\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: json 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 13_json-public-config-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - basic_serialization
    - workflow_validation
    - practice
    title: 공개 설정 JSON 정규화하기
    subtitle: 필수 구조 검증과 비밀 키 제거
    goal: 설정 dict를 검증하고 password, token 같은 비밀 키를 제거한 공개 설정 요약을 반환한다.
    why: JSON 학습은 문자열 변환보다 외부에서 온 설정을 검증하고 공개 가능한 형태로 바꾸는 능력이 실제 제품에 더 직접적입니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 설정 dict로 다시 호출합니다.
    tips:
    - app, features, limits 필드 타입을 먼저 확인하세요.
    - 공개 결과에는 token과 password가 남아 있으면 안 됩니다.
    exercise:
      prompt: normalize_public_config(config)가 appName, version, features, maxUsers, publicKeys를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def normalize_public_config(config):
            raise NotImplementedError
      solution: |-
        def normalize_public_config(config):
            if not isinstance(config.get("app"), dict):
                raise ValueError("app must be an object")
            if not isinstance(config.get("features"), list):
                raise ValueError("features must be a list")
            if not isinstance(config.get("limits"), dict):
                raise ValueError("limits must be an object")
            public_config = {
                key: value
                for key, value in config.items()
                if key not in {"password", "token"}
            }
            return {
                "appName": public_config["app"]["name"],
                "version": public_config["app"]["version"],
                "features": sorted(public_config["features"]),
                "maxUsers": public_config["limits"]["maxUsers"],
                "publicKeys": sorted(public_config),
            }
      hints:
      - 외부 JSON을 이미 dict로 받은 상태라고 생각하고 구조부터 확인하세요.
      - features는 순서를 안정화하기 위해 sorted로 반환하세요.
    check:
      id: python.builtins.json.public-config.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.json.output-roundtrip.behavior.v1.fixture
      fixtureHash: sha256-a8vNUnXz7mslkw9j500ecOVAV+chLErOuyiQo/6hQdU=
      fixture:
        directories:
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: normalize_public_config
        cases:
        - id: removes-token
          arguments:
          - value:
              app:
                name: Codaro
                version: 1.0.0
              features:
              - automation
              - curriculum
              limits:
                maxUsers: 25
              token: secret-token
          expectedReturn:
            appName: Codaro
            version: 1.0.0
            features:
            - automation
            - curriculum
            maxUsers: 25
            publicKeys:
            - app
            - features
            - limits
        - id: removes-password
          arguments:
          - value:
              app:
                name: Learn
                version: 2.1.0
              features:
              - web
              - local
              limits:
                maxUsers: 10
              password: hidden
          expectedReturn:
            appName: Learn
            version: 2.1.0
            features:
            - local
            - web
            maxUsers: 10
            publicKeys:
            - app
            - features
            - limits
        - id: rejects-missing-features
          arguments:
          - value:
              app:
                name: Bad
              limits:
                maxUsers: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 13_json-api-response-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 13_json-public-config-mastery
    title: API 응답 문자열을 실행 가능한 요약으로 바꾸기
    subtitle: loads와 누락 필드 방어
    goal: JSON 응답 문자열에서 status, users, active를 읽어 userCount와 activeRate를 반환한다.
    why: 웹 학습에서 JSON은 API 응답을 받아 다음 행동으로 연결하는 형식이므로, 파싱 실패와 구조 누락을 함께 다뤄야 합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 설정 dict가 아니라 JSON 문자열을 직접 파싱하세요.
    tips:
    - json.loads가 실패하면 JSONDecodeError가 발생합니다.
    - activeRate는 active / users를 소수점 둘째 자리까지 반올림하세요.
    exercise:
      prompt: summarize_api_response(payload)가 status, userCount, activeRate를 담은 dict를 반환하고 잘못된 구조는 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        def summarize_api_response(payload):
            raise NotImplementedError
      solution: |-
        import json

        def summarize_api_response(payload):
            parsed = json.loads(payload)
            data = parsed.get("data")
            if not isinstance(data, dict) or "users" not in data or "active" not in data:
                raise ValueError("data.users and data.active are required")
            users = data["users"]
            active = data["active"]
            return {
                "status": parsed.get("status", "unknown"),
                "userCount": users,
                "activeRate": round(active / users, 2) if users else 0,
            }
      hints:
      - JSON 문법 오류와 구조 오류는 서로 다른 실패입니다.
      - users가 0이면 나누지 말고 activeRate를 0으로 두세요.
    check:
      id: python.builtins.json.api-response.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.json.output-roundtrip.behavior.v1.fixture
      fixtureHash: sha256-a8vNUnXz7mslkw9j500ecOVAV+chLErOuyiQo/6hQdU=
      fixture:
        directories:
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_api_response
        cases:
        - id: success-response
          arguments:
          - value: '{"status":"success","data":{"users":150,"active":120}}'
          expectedReturn:
            status: success
            userCount: 150
            activeRate: 0.8
        - id: zero-users
          arguments:
          - value: '{"status":"empty","data":{"users":0,"active":0}}'
          expectedReturn:
            status: empty
            userCount: 0
            activeRate: 0
        - id: rejects-missing-data
          arguments:
          - value: '{"status":"bad"}'
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 13_json-write-report-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 13_json-public-config-mastery
    title: JSON 리포트를 저장하고 다시 읽기
    subtitle: dump, load, sort_keys round-trip
    goal: data를 JSON 파일로 저장한 뒤 다시 읽어 roundTrip, keys, path를 반환한다.
    why: 시간이 지난 뒤에도 JSON 저장은 파일을 썼다는 사실보다 다시 읽어도 같은 데이터인지 확인하는 습관이 핵심입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 저장, 읽기, 검증 흐름을 예시 없이 다시 조립하세요.
    tips:
    - target_path.parent.mkdir(parents=True, exist_ok=True)로 폴더를 준비하세요.
    - ensure_ascii=False와 sort_keys=True를 같이 사용하면 한국어와 key 순서가 안정적입니다.
    exercise:
      prompt: write_json_report(target_path, data)가 path, roundTrip, keys를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def write_json_report(target_path, data):
            raise NotImplementedError
      solution: |-
        import json
        from pathlib import Path

        def write_json_report(target_path, data):
            path = Path(target_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("w", encoding="utf-8") as file:
                json.dump(data, file, ensure_ascii=False, sort_keys=True, indent=2)
            with path.open("r", encoding="utf-8") as file:
                loaded = json.load(file)
            return {"path": str(path), "roundTrip": loaded == data, "keys": sorted(loaded)}
      hints:
      - 파일을 쓴 뒤 같은 경로를 다시 열어 json.load로 검증하세요.
      - 반환 path는 verifier가 fixture root 기준 상대경로로 정규화합니다.
    check:
      id: python.builtins.json.write-report.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.json.output-roundtrip.behavior.v1.fixture
      fixtureHash: sha256-a8vNUnXz7mslkw9j500ecOVAV+chLErOuyiQo/6hQdU=
      fixture:
        directories:
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: write_json_report
        cases:
        - id: writes-summary
          arguments:
          - fixturePath: output/summary.json
          - value:
              status: ok
              count: 3
              label: 학습
          expectedReturn:
            path: output/summary.json
            roundTrip: true
            keys:
            - count
            - label
            - status
        - id: writes-nested
          arguments:
          - fixturePath: output/reports/detail.json
          - value:
              app:
                name: Codaro
              enabled: true
          expectedReturn:
            path: output/reports/detail.json
            roundTrip: true
            keys:
            - app
            - enabled
        expectedPaths:
        - path: output/summary.json
          kind: file
        - path: output/reports/detail.json
          kind: file
        normalizeReturnPaths:
        - path
    minimumDelayHours: 24
`;export{e as default};