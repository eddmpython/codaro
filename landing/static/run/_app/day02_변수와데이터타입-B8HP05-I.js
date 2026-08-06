var e=`meta:\r
  id: day02\r
  title: 변수와 데이터 타입\r
  day: 2\r
  category: 30days\r
  outcomes: ["python.variables"]\r
  prerequisites: ["python.intro"]\r
  estimatedMinutes: 40\r
  tags:\r
  - 변수\r
  - 데이터타입\r
  - type\r
  - len\r
  - 형변환\r
  - 검증\r
  seo:\r
    title: 파이썬 변수와 데이터 타입\r
    description: 변수에 값을 저장하고 다양한 데이터 타입을 다루는 방법을 배웁니다.\r
    keywords:\r
    - 변수\r
    - variable\r
    - int\r
    - float\r
    - str\r
    - bool\r
    - type\r
intro:\r
  emoji: 📦\r
  points:\r
  - 변수의 개념과 값 저장 방법\r
  - 정수, 실수, 문자열, 불린 데이터 타입\r
  - type() 함수로 타입 확인하기\r
  - len() 함수로 길이 측정하기\r
  - 타입 변환 (int, float, str)\r
  - 다중 변수 할당 기법\r
  direction: 변수와 데이터 타입에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.\r
  benefits:\r
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.\r
  - 변수와 데이터 타입 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 변수란? 입력 확인\r
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.\r
    - label: 변수명 작성 스타일 처리 실행\r
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 변수 값 변경하기 결과 검증\r
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 변수와 데이터 타입 재사용\r
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기초 자동화 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 변수와 데이터 타입 실행\r
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.\r
    - label: 변수와 데이터 타입 완료\r
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.\r
sections:\r
- id: variable_concept\r
  title: 변수란?\r
  structuredPrimary: true\r
  subtitle: 데이터를 저장하는 이름표\r
  blocks:\r
  - type: image\r
    assetId: pythonFundamentals\r
  goal: 변수에 문자열을 넣고 그 값이 화면에 나오는지 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    변수(Variable)는 데이터를 저장하는 메모리 공간에 붙인 이름표입니다. 마치 상자에 물건을 넣고 라벨을 붙이는 것과 같습니다. 변수를 사용하면 데이터를 저장했다가 나중에 다시 사용할 수 있습니다. = 기호는 수학의 "같다"가 아니라 "오른쪽 값을 왼쪽 변수에 저장한다"는 의미입니다.\r
\r
    변수명은 영문자, 숫자, 밑줄(_)만 사용 가능하며, 숫자로 시작할 수 없습니다.\r
  snippet: |-\r
    msg = 'Python'\r
    msg\r
  exercise:\r
    prompt: |-\r
      msg의 값을 'Codaro'로 바꾸세요.\r
      \r
      실행하면 Codaro가 보여야 합니다.\r
    starterCode: |-\r
      msg = 'Python'\r
      msg\r
    solution: |-\r
      msg = 'Codaro'\r
      msg\r
    hints:\r
    - "msg = 'Python'을 msg = 'Codaro'로 바꿉니다."\r
    - 마지막 줄 msg는 그대로 둡니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: Codaro\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'Codaro'"\r
- id: naming_convention\r
  title: 변수명 작성 스타일\r
  structuredPrimary: true\r
  subtitle: 카멜케이스 vs 스네이크케이스\r
  goal: 카멜케이스와 스네이크케이스 변수로 이름을 출력한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    변수명을 지을 때 단어를 연결하는 방법에는 크게 두 가지 스타일이 있습니다. 카멜케이스(camelCase)는 첫 단어는 소문자로 시작하고 이후 단어의 첫 글자를 대문자로 쓰는 방식입니다. 스네이크케이스(snake_case)는 모든 단어를 소문자로 쓰고 밑줄(_)로 연결하는 방식입니다. 파이썬 공식 스타일 가이드(PEP 8)는 스네이크케이스를 권장하지만, 이 학습 컨텐츠는 작성자의 코딩 스타일에 따라 카멜케이스를 사용합니다.\r
\r
    이 학습 컨텐츠는 카멜케이스로 작성되었지만, 여러분은 원하는 스타일을 선택하여 사용하세요. 중요한 것은 선택한 스타일을 일관되게 유지하는 것입니다.\r
  snippet: |-\r
    userName = 'John Doe'\r
    user_name = 'Jane Smith'\r
    print('카멜케이스 : ', userName, '\\n스네이크케이스 : ', user_name)\r
  exercise:\r
    prompt: |-\r
      userName 값을 'Codaro User'로, user_name 값을 'Codaro Learner'로 바꾸세요.\r
      \r
      실행하면 두 이름이 모두 출력되어야 합니다.\r
    starterCode: |-\r
      userName = 'John Doe'\r
      user_name = 'Jane Smith'\r
      print('카멜케이스 : ', userName, '\\n스네이크케이스 : ', user_name)\r
    solution: |-\r
      userName = 'Codaro User'\r
      user_name = 'Codaro Learner'\r
      print('카멜케이스 : ', userName, '\\n스네이크케이스 : ', user_name)\r
    hints:\r
    - 따옴표 안 글자만 바꿉니다. 변수 이름은 그대로 둡니다.\r
    - 출력에 Codaro User와 Codaro Learner가 보이면 맞습니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: |-\r
      카멜케이스 :  Codaro User \r
      스네이크케이스 :  Codaro Learner\r
    resultCheck: "출력이 정확히 일치해야 합니다: '카멜케이스 :  Codaro User \\n스네이크케이스 :  Codaro Learner'"\r
- id: variable_reassign\r
  title: 변수 값 변경하기\r
  structuredPrimary: true\r
  subtitle: 저장된 값을 새 값으로 교체\r
  goal: 같은 변수에 새 값을 넣으면 마지막 값만 남는다는 걸 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    변수는 언제든지 새로운 값으로 변경할 수 있습니다. 같은 변수에 새 값을 할당하면 이전 값은 사라지고 새 값으로 대체됩니다. 이것이 "변수(Variable)"라는 이름의 의미입니다.\r
\r
    변수는 최종적으로 할당된 값을 가집니다.\r
  snippet: |-\r
    score = 80\r
    score = 95\r
    score\r
  exercise:\r
    prompt: |-\r
      두 번째 줄 score를 100으로 바꾸세요.\r
      \r
      실행하면 최종 값 100이 보여야 합니다.\r
    starterCode: |-\r
      score = 80\r
      score = 95\r
      score\r
    solution: |-\r
      score = 80\r
      score = 100\r
      score\r
    hints:\r
    - score = 95를 score = 100으로 바꿉니다.\r
    - 첫 줄 score = 80은 그대로 둬도 됩니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '100'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '100'"\r
- id: type_integer\r
  title: 정수 타입\r
  structuredPrimary: true\r
  subtitle: 소수점 없는 숫자\r
  goal: 정수(int) 값을 변수에 넣고 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 정수(Integer)는 소수점이 없는 숫자입니다. 1, 100, -5처럼 양수, 0, 음수 모두 정수입니다. 파이썬에서 정수 타입은 int로 표시됩니다. int는\r
    integer(정수)의 줄임말입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    years = 25\r
    years\r
  exercise:\r
    prompt: |-\r
      years를 30으로 바꾸세요.\r
      \r
      실행하면 30이 보여야 합니다.\r
    starterCode: |-\r
      years = 25\r
      years\r
    solution: |-\r
      years = 30\r
      years\r
    hints:\r
    - years = 25를 years = 30으로 바꿉니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '30'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '30'"\r
- id: type_float\r
  title: 실수 타입\r
  structuredPrimary: true\r
  subtitle: 소수점 있는 숫자\r
  goal: 실수(float) 값을 변수에 넣고 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 실수(Float)는 소수점이 있는 숫자입니다. 3.14, 2.5, -1.5처럼 소수점을 포함한 숫자입니다. 파이썬에서 실수 타입은 float로 표시됩니다.\r
    float는 floating point(부동소수점)의 줄임말입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pi = 3.14159\r
    pi\r
  exercise:\r
    prompt: |-\r
      pi를 3.14로 바꾸세요.\r
      \r
      실행하면 3.14가 보여야 합니다.\r
    starterCode: |-\r
      pi = 3.14159\r
      pi\r
    solution: |-\r
      pi = 3.14\r
      pi\r
    hints:\r
    - pi = 3.14159를 pi = 3.14로 바꿉니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '3.14'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '3.14'"\r
- id: type_string\r
  title: 문자열 타입\r
  structuredPrimary: true\r
  subtitle: 따옴표로 감싼 텍스트\r
  goal: 문자열(str) 값을 변수에 넣고 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 문자열(String)은 따옴표로 감싼 텍스트입니다. 'Hello', "Python"처럼 작은따옴표나 큰따옴표로 만듭니다. 문자 하나('A')도 문자열이고,\r
    긴 문장도 문자열입니다. 파이썬에서 문자열 타입은 str로 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    town = 'Seoul'\r
    town\r
  exercise:\r
    prompt: |-\r
      town을 'Busan'으로 바꾸세요.\r
      \r
      실행하면 Busan이 보여야 합니다.\r
    starterCode: |-\r
      town = 'Seoul'\r
      town\r
    solution: |-\r
      town = 'Busan'\r
      town\r
    hints:\r
    - "town = 'Seoul'을 town = 'Busan'으로 바꿉니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: Busan\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'Busan'"\r
- id: type_boolean\r
  title: 불린 타입\r
  structuredPrimary: true\r
  subtitle: 참과 거짓\r
  goal: 불린(bool) 값을 변수에 넣고 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 불린(Boolean)은 참(True) 또는 거짓(False) 두 가지 값만 가지는 타입입니다. 영국 수학자 조지 불(George Boole)의 이름에서 유래했습니다.\r
    True와 False는 첫 글자가 반드시 대문자여야 합니다. 조건 판단, 비교 연산에서 주로 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    active = True\r
    active\r
  exercise:\r
    prompt: |-\r
      active를 False로 바꾸세요.\r
      \r
      실행하면 False가 보여야 합니다.\r
    starterCode: |-\r
      active = True\r
      active\r
    solution: |-\r
      active = False\r
      active\r
    hints:\r
    - active = True를 active = False로 바꿉니다.\r
    - False는 대문자 F로 씁니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: 'False'\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"\r
- id: type_function\r
  title: type() 함수\r
  structuredPrimary: true\r
  subtitle: 데이터 타입 확인하기\r
  goal: type()으로 값의 타입을 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: type() 함수는 값이나 변수의 데이터 타입을 알려줍니다. 괄호 안에 변수나 값을 넣으면 그것의 타입을 반환합니다. 결과는 <class 'int'>, <class\r
    'str'> 같은 형태로 표시됩니다. 디버깅이나 타입 확인에 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    point = 100\r
    type(point)\r
  exercise:\r
    prompt: |-\r
      point를 3.5로 바꾼 뒤 type(point)를 실행하세요.\r
      \r
      결과는 float 타입이어야 합니다.\r
    starterCode: |-\r
      point = 100\r
      type(point)\r
    solution: |-\r
      point = 3.5\r
      type(point)\r
    hints:\r
    - point = 100을 point = 3.5로 바꿉니다.\r
    - "화면에 <class 'float'>가 보이면 맞습니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "<class 'float'>"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"<class 'float'>\\""\r
- id: len_function\r
  title: len() 함수\r
  structuredPrimary: true\r
  subtitle: 문자열 길이 측정\r
  goal: len()으로 문자열 길이를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    len() 함수는 문자열의 길이(문자 개수)를 반환합니다. len은 length(길이)의 줄임말입니다. 공백, 특수문자, 한글 모두 각각 1로 계산됩니다. 빈 문자열('')의 길이는 0입니다.\r
\r
    'Hello World'의 길이는 11입니다. 공백도 문자로 계산됩니다.\r
  snippet: |-\r
    email = 'python@example.com'\r
    len(email)\r
  exercise:\r
    prompt: |-\r
      email을 'a@example.com'으로 바꾸세요.\r
\r
      실행하면 길이 13이 나와야 합니다.\r
    starterCode: |-\r
      email = 'python@example.com'\r
      len(email)\r
    solution: |-\r
      email = 'a@example.com'\r
      len(email)\r
    hints:\r
    - "email = 'python@example.com'을 email = 'a@example.com'으로 바꿉니다."\r
    - "len('a@example.com')은 13입니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '13'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '13'"\r
- id: convert_to_int\r
  title: int() 변환\r
  structuredPrimary: true\r
  subtitle: 정수로 변환하기\r
  goal: int()로 문자열을 정수로 바꾼다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: int() 함수는 다른 타입을 정수로 변환합니다. 문자열 '100'을 숫자 100으로 바꿀 수 있습니다. 단, 문자열은 숫자로만 이루어져 있어야 합니다. 실수를\r
    정수로 변환하면 소수점 이하는 버려집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    text = '100'\r
    int(text)\r
  exercise:\r
    prompt: |-\r
      text를 '42'로 바꾸세요.\r
      \r
      실행하면 정수 42가 나와야 합니다.\r
    starterCode: |-\r
      text = '100'\r
      int(text)\r
    solution: |-\r
      text = '42'\r
      int(text)\r
    hints:\r
    - "text = '100'을 text = '42'로 바꿉니다."\r
    - "int('42') 결과는 42입니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '42'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '42'"\r
- id: convert_to_float\r
  title: float() 변환\r
  structuredPrimary: true\r
  subtitle: 실수로 변환하기\r
  goal: float()로 정수를 실수로 바꾼다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: float() 함수는 다른 타입을 실수로 변환합니다. 정수 10을 실수 10.0으로 바꿀 수 있습니다. 문자열 '3.14'를 숫자 3.14로 변환할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    val = 42\r
    float(val)\r
  exercise:\r
    prompt: |-\r
      val을 7로 바꾸세요.\r
      \r
      실행하면 7.0이 나와야 합니다.\r
    starterCode: |-\r
      val = 42\r
      float(val)\r
    solution: |-\r
      val = 7\r
      float(val)\r
    hints:\r
    - val = 42를 val = 7로 바꿉니다.\r
    - float(7) 결과는 7.0입니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '7.0'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '7.0'"\r
- id: convert_to_str\r
  title: str() 변환\r
  structuredPrimary: true\r
  subtitle: 문자열로 변환하기\r
  goal: str()로 숫자를 문자열로 바꾼다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: str() 함수는 어떤 값이든 문자열로 변환합니다. 숫자 25를 문자열 '25'로 바꿀 수 있습니다. 문자열 연결이나 출력 메시지를 만들 때 자주 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    code = 123\r
    str(code)\r
  exercise:\r
    prompt: |-\r
      code를 7로 바꾸세요.\r
      \r
      실행하면 문자열 '7'이 나와야 합니다.\r
    starterCode: |-\r
      code = 123\r
      str(code)\r
    solution: |-\r
      code = 7\r
      str(code)\r
    hints:\r
    - code = 123을 code = 7로 바꿉니다.\r
    - 화면에 따옴표 없이 7처럼 보여도 문자열입니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '7'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '7'"\r
- id: multiple_assign\r
  title: 다중 변수 할당\r
  structuredPrimary: true\r
  subtitle: 한 줄로 여러 변수 선언\r
  goal: 한 줄에서 여러 변수에 값을 넣는다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 쉼표로 구분하여 한 줄에 여러 변수를 선언할 수 있습니다. 순서대로 매칭되므로 첫 번째 변수에 첫 번째 값이 저장됩니다. 코드를 더 간결하게 만들 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    name, age, city = 'Alice', 25, 'Seoul'\r
    name, age, city\r
  exercise:\r
    prompt: |-\r
      name을 'Codaro'로 바꾸세요.\r
      \r
      실행하면 Codaro가 포함된 결과가 나와야 합니다.\r
    starterCode: |-\r
      name, age, city = 'Alice', 25, 'Seoul'\r
      name, age, city\r
    solution: |-\r
      name, age, city = 'Codaro', 25, 'Seoul'\r
      name, age, city\r
    hints:\r
    - "'Alice'만 'Codaro'로 바꿉니다."\r
    - age와 city는 그대로 둬도 됩니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "('Codaro', 25, 'Seoul')"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"('Codaro', 25, 'Seoul')\\""\r
- id: same_value_assign\r
  title: 같은 값 할당\r
  structuredPrimary: true\r
  subtitle: 여러 변수에 동일한 값\r
  goal: 여러 변수에 같은 값을 한 번에 넣는다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: = 연산자를 연결하면 여러 변수에 같은 값을 동시에 할당할 수 있습니다. 모든 변수가 동일한 값을 가지게 됩니다. 초기화할 때 자주 사용하는 패턴입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    a = b = c = 0\r
    a\r
  exercise:\r
    prompt: |-\r
      a = b = c = 0의 0을 5로 바꾸세요.\r
      \r
      실행하면 5가 보여야 합니다.\r
    starterCode: |-\r
      a = b = c = 0\r
      a\r
    solution: |-\r
      a = b = c = 5\r
      a\r
    hints:\r
    - 오른쪽 숫자만 5로 바꿉니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '5'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '5'"\r
- id: workflow_validation\r
  title: '검증 루프: 입력값을 업무 데이터로 바꾸기'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: 문자열 입력을 숫자로 바꾼 뒤 assert로 검증하는 흐름을 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 변수와 타입은 값을 담는 문법이 아니라, 외부에서 들어온 문자열을 계산 가능한 데이터로 바꾸고 검증하는 출발점입니다. 실행 전에 어떤 값이 str/int/float/bool이\r
    될지 예측하고, 변환 실패를 직접 확인한 뒤, 업무 리포트에 쓸 수 있는 구조로 정리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    rawProduct = "notebook"\r
    rawPrice = "1200000"\r
    rawQuantity = "2"\r
    rawMember = "yes"\r
\r
    productName = rawProduct\r
    unitPrice = int(rawPrice)\r
    quantity = int(rawQuantity)\r
    isMember = rawMember == "yes"\r
\r
    assert type(productName).__name__ == "str"\r
    assert type(unitPrice).__name__ == "int"\r
    assert type(quantity).__name__ == "int"\r
    assert type(isMember).__name__ == "bool"\r
\r
    orderSubtotal = unitPrice * quantity\r
    orderSubtotal\r
  exercise:\r
    prompt: |-\r
      코드를 그대로 실행하세요.\r
      \r
      값을 마음대로 바꾸면 assert가 깨질 수 있습니다.\r
      assert가 모두 통과하고 마지막에 2400000이 나오면 맞습니다.\r
    starterCode: |-\r
      rawProduct = "notebook"\r
      rawPrice = "1200000"\r
      rawQuantity = "2"\r
      rawMember = "yes"\r
\r
      productName = rawProduct\r
      unitPrice = int(rawPrice)\r
      quantity = int(rawQuantity)\r
      isMember = rawMember == "yes"\r
\r
      assert type(productName).__name__ == "str"\r
      assert type(unitPrice).__name__ == "int"\r
      assert type(quantity).__name__ == "int"\r
      assert type(isMember).__name__ == "bool"\r
\r
      orderSubtotal = unitPrice * quantity\r
      orderSubtotal\r
    solution: |-\r
      rawProduct = "notebook"\r
      rawPrice = "1200000"\r
      rawQuantity = "2"\r
      rawMember = "yes"\r
\r
      productName = rawProduct\r
      unitPrice = int(rawPrice)\r
      quantity = int(rawQuantity)\r
      isMember = rawMember == "yes"\r
\r
      assert type(productName).__name__ == "str"\r
      assert type(unitPrice).__name__ == "int"\r
      assert type(quantity).__name__ == "int"\r
      assert type(isMember).__name__ == "bool"\r
\r
      orderSubtotal = unitPrice * quantity\r
      orderSubtotal\r
    hints:\r
    - rawPrice와 rawQuantity를 정수로 바꾼 뒤 곱합니다.\r
    - 마지막 값 orderSubtotal이 2400000이면 통과입니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '2400000'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '2400000'"\r
- id: practice\r
  title: Day 2 종합 복습\r
  structuredPrimary: true\r
  subtitle: 변수와 타입 마스터하기\r
  goal: 변수를 만들고 값을 확인하는 Day 2 복습을 한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Day 2에서 배운 변수, 데이터 타입, 타입 변환을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    name = '홍길동'\r
    print('name:', name)\r
  exercise:\r
    prompt: |-\r
      lang을 'Codaro'로 바꾸세요.\r
      \r
      실행하면 Codaro가 보여야 합니다.\r
    starterCode: |-\r
      lang = 'Python'\r
      lang\r
    solution: |-\r
      lang = 'Codaro'\r
      lang\r
    hints:\r
    - "lang = 'Python'을 lang = 'Codaro'로 바꿉니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: Codaro\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'Codaro'"\r
assessment:\r
  schemaVersion: 1\r
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.\r
  tierParity:\r
    web: portable-concept\r
    local: package-practice-and-artifact\r
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.\r
  authoring:\r
    source: curated-blueprint\r
    solutionVerification: required\r
    independentReview: approved\r
    reviewerId: "curriculum-integrity-review"\r
    reviewedAt: "2026-08-02T13:06:47+09:00"\r
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"\r
  masteryVariants:\r
  - id: day02-describe-value-mastery\r
    mode: mastery\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - variable_concept\r
    - practice\r
    title: 값과 타입을 한 줄로 설명하기\r
    subtitle: 예시 없이 핵심 규칙 완성\r
    goal: 값에 맞는 타입 이름과 값을 함께 반환한다.\r
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.\r
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: describe_value(value)가 타입이름:값 형식의 문자열을 반환하도록 완성하세요.\r
      starterCode: |-\r
        def describe_value(value):\r
            raise NotImplementedError\r
      solution: |-\r
        def describe_value(value):\r
            return f"{type(value).__name__}:{value}"\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day02.describe-value.mastery.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day02.describe-value.mastery.behavior.v1.fixture\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      packageAssets: []\r
      payload:\r
        entry: describe_value\r
        cases:\r
        - id: integer\r
          arguments:\r
          - value: 7\r
          expectedReturn: int:7\r
        - id: text\r
          arguments:\r
          - value: Codaro\r
          expectedReturn: str:Codaro\r
        - id: boolean\r
          arguments:\r
          - value: true\r
          expectedReturn: bool:True\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
  transferVariants:\r
  - id: day02-profile-line-transfer\r
    mode: transfer\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - day02-describe-value-mastery\r
    title: 문자 나이를 프로필 문구로 바꾸기\r
    subtitle: 처음 보는 조건에 개념 적용\r
    goal: 문자열 입력을 정수로 바꿔 새 출력 형식에 적용한다.\r
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.\r
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: profile_line(name, age)가 이름(나이) 형식의 문자열을 반환하도록 완성하세요.\r
      starterCode: |-\r
        def profile_line(name, age):\r
            raise NotImplementedError\r
      solution: |-\r
        def profile_line(name, age):\r
            return f"{name}({int(age)})"\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day02.profile-line.transfer.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day02.profile-line.transfer.behavior.v1.fixture\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      packageAssets: []\r
      payload:\r
        entry: profile_line\r
        cases:\r
        - id: text-age\r
          arguments:\r
          - value: Mina\r
          - value: '21'\r
          expectedReturn: Mina(21)\r
        - id: number-age\r
          arguments:\r
          - value: Jun\r
          - value: 30\r
          expectedReturn: Jun(30)\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
  retrievalVariants:\r
  - id: day02-reassign-score-retrieval\r
    mode: retrieval\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - day02-profile-line-transfer\r
    title: 점수를 다시 할당해 갱신하기\r
    subtitle: 7일 뒤 기억에서 재구성\r
    goal: 시간이 지난 뒤 변수 재할당 결과를 스스로 구성한다.\r
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.\r
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: reassign_score(start, bonus)가 시작 점수에 보너스를 반영한 최종 값을 반환하도록 완성하세요.\r
      starterCode: |-\r
        def reassign_score(start, bonus):\r
            raise NotImplementedError\r
      solution: |-\r
        def reassign_score(start, bonus):\r
            score = start\r
            score += bonus\r
            return score\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day02.reassign-score.retrieval.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day02.reassign-score.retrieval.behavior.v1.fixture\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      packageAssets: []\r
      payload:\r
        entry: reassign_score\r
        cases:\r
        - id: positive\r
          arguments:\r
          - value: 80\r
          - value: 15\r
          expectedReturn: 95\r
        - id: negative\r
          arguments:\r
          - value: 50\r
          - value: -8\r
          expectedReturn: 42\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
    minimumDelayHours: 168\r
`;export{e as default};