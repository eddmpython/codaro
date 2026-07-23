var e=`meta:
  id: day04
  title: 문자열 기초
  day: 4
  category: 30days
  outcomes: ["python.strings"]
  prerequisites: ["python.variables"]
  estimatedMinutes: 35
  tags:
  - 문자열
  - f-string
  - 이스케이프
  - 포맷팅
  - 영수증
  - 검증
  seo:
    title: 파이썬 문자열 기초 완벽 가이드
    description: 문자열 연결, 이스케이프 문자, 여러 줄 문자열, 문자열 반복을 배웁니다.
    keywords:
    - 문자열
    - string
    - 연결
    - concat
    - 이스케이프
intro:
  emoji: 📝
  points:
  - 문자열 연결과 반복
  - f-string으로 간편한 포맷팅
  - 이스케이프 문자로 특수 문자 표현하기
  - 여러 줄 문자열 작성하기
  direction: 문자열 기초에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 문자열 기초 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 문자열 연결 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 문자열 반복 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 문자열 길이 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 문자열 기초 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 문자열 기초 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 문자열 기초 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: string_concat
  title: 문자열 연결
  structuredPrimary: true
  subtitle: + 기호로 문자열 합치기
  goal: 문자열 연결에서 \`first\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    문자열은 + 연산자로 연결할 수 있습니다. 두 개 이상의 문자열을 하나로 합칠 때 사용합니다. 숫자의 덧셈과 같은 기호지만 문자열에서는 연결의 의미입니다.

    공백을 넣으려면 ' ' 처럼 공백 문자열을 중간에 추가합니다.
  snippet: |-
    first = 'Hello'
    second = 'World'
    first + ' ' + second
  exercise:
    prompt: 문자열 연결 예제에서 \`first\`, \`second\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      first = 'Hello'
      second = 'World'
      first + ' ' + second
    hints:
    - 바꿀 지점은 \`first = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`first\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 연결에서 \`first\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 연결 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: string_repeat
  title: 문자열 반복
  structuredPrimary: true
  subtitle: '* 기호로 문자열 반복하기'
  goal: 문자열 반복에서 \`word\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    문자열에 * 연산자를 사용하면 문자열을 반복할 수 있습니다. 숫자를 곱하면 그 횟수만큼 문자열이 반복됩니다. 같은 문자를 여러 번 출력할 때 유용합니다.

    '=' * 50 처럼 사용하면 구분선을 만들 수 있습니다.
  snippet: |-
    word = 'Python'
    word * 3
  exercise:
    prompt: 문자열 반복 예제에서 \`word\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      word = 'Python'
      word * 3
    hints:
    - 바꿀 지점은 \`word = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`word\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 반복에서 \`word\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 반복 실행 뒤 \`word\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: string_length
  title: 문자열 길이
  structuredPrimary: true
  subtitle: len() 함수로 길이 구하기
  goal: 문자열 길이에서 \`text\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: len() 함수는 문자열의 길이를 반환합니다. 문자열에 포함된 문자의 개수를 세어줍니다. 공백과 특수문자도 모두 포함됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text = 'Hello Python'
    len(text)
  exercise:
    prompt: 문자열 길이 예제에서 \`text\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      text = 'Hello Python'
      len(text)
    hints:
    - 바꿀 지점은 \`text = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 길이에서 \`text\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 길이 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: fstring
  title: f-string 포맷팅
  structuredPrimary: true
  subtitle: f-string으로 간편하게 문자열 만들기
  goal: fstring 포맷팅에서 \`name\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    f-string은 문자열 앞에 f를 붙여 변수를 직접 넣을 수 있는 방법입니다. + 연결이나 str() 변환 없이도 변수와 문자를 자연스럽게 조합할 수 있습니다. 중괄호 {} 안에 변수명이나 표현식을 넣으면 자동으로 문자열로 변환됩니다.

    중괄호 {} 안에는 변수뿐만 아니라 연산식(예: {age + 1})도 넣을 수 있습니다.
  snippet: |-
    name = '김철수'
    age = 25
    f'{name}님의 나이는 {age}세입니다'
  exercise:
    prompt: fstring 포맷팅 예제에서 \`name\`, \`age\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      name = '김철수'
      age = 25
      f'{name}님의 나이는 {age}세입니다'
    hints:
    - 바꿀 지점은 \`name = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`name\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: fstring 포맷팅에서 \`name\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: fstring 포맷팅 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: escape_newline
  title: 줄바꿈 문자
  structuredPrimary: true
  subtitle: \\n으로 줄 바꾸기
  goal: 줄바꿈 문자에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: 이스케이프 문자는 백슬래시(\\)로 시작하는 특수 문자입니다. \\n은 줄바꿈을 의미하며, 문자열 중간에 사용하면 그 지점에서 줄이 바뀝니다. 여러 줄 출력에
    유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    lines = '첫 번째 줄\\n두 번째 줄\\n세 번째 줄'
    print(lines)
  exercise:
    prompt: 줄바꿈 문자 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.
    starterCode: |-
      lines = '첫 번째 줄\\n두 번째 줄\\n세 번째 줄'
      print(lines)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: noError
    noError: 줄바꿈 문자의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.
    resultCheck: 줄바꿈 문자 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.
- id: escape_tab
  title: 탭 문자
  structuredPrimary: true
  subtitle: \\t로 간격 넣기
  goal: 탭 문자에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: \\t는 탭 문자로, 일정한 간격을 만듭니다. 텍스트를 정렬할 때 유용하며, 보통 4칸 또는 8칸의 공백과 같은 효과를 냅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    row = '이름\\t나이\\t도시'
    print(row)
  exercise:
    prompt: 탭 문자 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.
    starterCode: |-
      row = '이름\\t나이\\t도시'
      print(row)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: noError
    noError: 탭 문자의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.
    resultCheck: 탭 문자 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.
- id: escape_quote
  title: 따옴표 문자
  structuredPrimary: true
  subtitle: \\'와 \\"로 따옴표 넣기
  goal: 따옴표 문자에서 \`quote\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 문자열 안에 따옴표를 넣으려면 백슬래시를 앞에 붙입니다. \\'는 작은따옴표, \\"는 큰따옴표를 문자로 표현합니다. 또는 작은따옴표 문자열 안에 큰따옴표를 사용할
    수도 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    quote = "It's a beautiful day"
    quote
  exercise:
    prompt: 따옴표 문자 예제에서 \`quote\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      quote = "It's a beautiful day"
      quote
    hints:
    - 바꿀 지점은 \`quote = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`quote\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 따옴표 문자에서 \`quote\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 따옴표 문자 실행 뒤 \`quote\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: escape_backslash
  title: 백슬래시 문자
  structuredPrimary: true
  subtitle: \\\\로 백슬래시 표현하기
  goal: 백슬래시 문자에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: 백슬래시 자체를 문자로 표현하려면 코드 안에서 \\\\처럼 두 번 사용합니다. 예를 들어 Windows 경로는 코드에서 'C:\\\\Users'처럼 쓰고, 출력에는 C:\\Users처럼 보입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    path = 'C:\\\\Users\\\\Documents'
    print(path)
  exercise:
    prompt: 백슬래시 문자 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.
    starterCode: |-
      path = 'C:\\\\Users\\\\Documents'
      print(path)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: noError
    noError: 백슬래시 문자의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.
    resultCheck: 백슬래시 문자 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.
- id: multiline_string
  title: 여러 줄 문자열
  structuredPrimary: true
  subtitle: 삼중 따옴표로 여러 줄 작성
  goal: 여러 줄 문자열에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: 삼중 따옴표(''' 또는 \\"\\"\\")를 사용하면 여러 줄에 걸친 문자열을 쉽게 작성할 수 있습니다. 줄바꿈이 자동으로 포함되며, \\n을 사용하지 않아도 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    block = '''첫 번째 줄
    두 번째 줄
    세 번째 줄'''
    print(block)
  exercise:
    prompt: 여러 줄 문자열 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.
    starterCode: |-
      block = '''첫 번째 줄
      두 번째 줄
      세 번째 줄'''
      print(block)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: noError
    noError: 여러 줄 문자열의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.
    resultCheck: 여러 줄 문자열 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.
- id: raw_string
  title: 원시 문자열
  structuredPrimary: true
  subtitle: r 접두사로 이스케이프 무시하기
  goal: 원시 문자열에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: 문자열 앞에 r을 붙이면 이스케이프 문자를 무시합니다. \\n이 줄바꿈이 아닌 문자 그대로 표시됩니다. 정규표현식이나 파일 경로 작성에 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    raw = r'C:\\Users\\Documents'
    print(raw)
  exercise:
    prompt: 원시 문자열 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.
    starterCode: |-
      raw = r'C:\\Users\\Documents'
      print(raw)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: noError
    noError: 원시 문자열의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.
    resultCheck: 원시 문자열 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.
- id: string_in
  title: 문자열 포함 확인
  structuredPrimary: true
  subtitle: in 연산자로 부분 문자열 찾기
  goal: 문자열 포함 확인에서 \`phrase\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    in 연산자는 문자열 안에 특정 문자나 단어가 포함되어 있는지 확인합니다. 포함되어 있으면 True, 없으면 False를 반환합니다.

    대소문자를 구분하므로 'python' in inCheckText는 False입니다.
  snippet: |-
    phrase = 'Python Programming'
    'Python' in phrase
  exercise:
    prompt: 문자열 포함 확인 예제에서 \`phrase\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      phrase = 'Python Programming'
      'Python' in phrase
    hints:
    - 바꿀 지점은 \`phrase = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`phrase\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 포함 확인에서 \`phrase\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 포함 확인 실행 뒤 \`phrase\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: string_not_in
  title: 문자열 미포함 확인
  structuredPrimary: true
  subtitle: not in 연산자로 확인하기
  goal: 문자열 미포함 확인에서 \`sentence\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: not in 연산자는 문자열에 특정 문자나 단어가 포함되지 않았는지 확인합니다. 포함되지 않으면 True, 포함되어 있으면 False를 반환합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    sentence = 'Hello World'
    'Python' not in sentence
  exercise:
    prompt: 문자열 미포함 확인 예제에서 \`sentence\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      sentence = 'Hello World'
      'Python' not in sentence
    hints:
    - 바꿀 지점은 \`sentence = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`sentence\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 미포함 확인에서 \`sentence\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 미포함 확인 실행 뒤 \`sentence\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 영수증 문자열을 안전하게 만들기'
  structuredPrimary: true
  subtitle: 문자열을 업무 출력물로 조립하고 검증하기
  goal: '검증 루프: 영수증 문자열을 안전하게 만들기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 문자열 기초는 단어를 붙이는 데서 끝나지 않습니다. 실제 업무에서는 영수증, 알림 문구, 로그 메시지처럼 사람이 읽을 출력물을 만들고, 빠진 줄이나 잘못된
    변환이 없는지 검증해야 합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    storeName = '코다로 문구'
    itemName = '노트'
    quantity = 3
    unitPrice = 2500
    totalPrice = quantity * unitPrice
    divider = '=' * 24

    receipt = (
        f'{divider}\\n'
        f'{storeName}\\n'
        f'{divider}\\n'
        f'품목: {itemName}\\n'
        f'수량: {quantity}\\n'
        f'합계: {totalPrice}원'
    )

    assert storeName in receipt
    assert f'합계: {totalPrice}원' in receipt
    assert receipt.count('\\n') == 5
    print(receipt)
  exercise:
    prompt: '검증 루프: 영수증 문자열을 안전하게 만들기 예제에서 문자열 값과 포맷 조각을 바꾸고 출력 문장이 달라지는지 확인하세요.'
    starterCode: |-
      level = 'INFO'
      action = 'order_created'
      orderId = 'ORD-2026-0007'
      logLine = f'[{level}] {action}: {orderId}'

      assert logLine.startswith('[INFO]')
      assert 'order_created' in logLine
      assert 'ERROR' not in logLine
      logLine
    hints:
    - 바꿀 지점은 \`level\`, \`orderId\`, \`amount\`, f-string 포맷 조각입니다.
    - 실행 뒤 \`receipt\` 문자열의 접두사, 주문번호, 금액 표기가 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 영수증 문자열을 안전하게 만들기에서 \`level\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '검증 루프: 영수증 문자열을 안전하게 만들기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: Day 4 종합 복습
  structuredPrimary: true
  subtitle: 문자열 기초 마스터하기
  goal: Day 4 종합 복습에서 \`first\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 4에서 배운 문자열 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤
    순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    path = 'C:\\\\Users\\\\Documents\\\\file.txt'
    path
  exercise:
    prompt: Day 4 종합 복습 예제에서 \`first\`, \`second\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      first = 'Hello'
      second = 'Python'
      first + ' ' + second
    hints:
    - 바꿀 지점은 \`first = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`first\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Day 4 종합 복습에서 \`first\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Day 4 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
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
  - id: day04-introduce-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - string_concat
    - practice
    title: 두 문자열로 소개 문장 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 문자열 보간으로 입력값을 정확한 문장에 배치한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: introduce(name, language)가 '이름 learns 언어' 문장을 반환하도록 완성하세요.
      starterCode: |-
        def introduce(name, language):
            raise NotImplementedError
      solution: |-
        def introduce(name, language):
            return f"{name} learns {language}"
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day04.introduce.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day04.introduce.mastery.behavior.v1.fixture
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
        entry: introduce
        cases:
        - id: python
          arguments:
          - value: Mina
          - value: Python
          expectedReturn: Mina learns Python
        - id: rust
          arguments:
          - value: Jun
          - value: Rust
          expectedReturn: Jun learns Rust
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day04-initials-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day04-introduce-mastery
    title: 여러 단어에서 이니셜 만들기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 문자열 분리와 결합을 이름 축약 문제에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: initials(full_name)가 각 단어 첫 글자를 대문자로 이어 반환하도록 완성하세요.
      starterCode: |-
        def initials(full_name):
            raise NotImplementedError
      solution: |-
        def initials(full_name):
            return ''.join(part[0].upper() for part in full_name.split())
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day04.initials.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day04.initials.transfer.behavior.v1.fixture
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
        entry: initials
        cases:
        - id: two-words
          arguments:
          - value: ada lovelace
          expectedReturn: AL
        - id: three-words
          arguments:
          - value: kim min su
          expectedReturn: KMS
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day04-quote-text-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day04-initials-transfer
    title: 따옴표가 포함된 문자열 다시 만들기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 문자열 경계와 따옴표 표현을 기억에서 복원한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: quote_text(text)가 입력 양쪽에 큰따옴표를 붙여 반환하도록 완성하세요.
      starterCode: |-
        def quote_text(text):
            raise NotImplementedError
      solution: |-
        def quote_text(text):
            return f'"{text}"'
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day04.quote-text.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day04.quote-text.retrieval.behavior.v1.fixture
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
        entry: quote_text
        cases:
        - id: word
          arguments:
          - value: Codaro
          expectedReturn: '"Codaro"'
        - id: sentence
          arguments:
          - value: learn by doing
          expectedReturn: '"learn by doing"'
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};