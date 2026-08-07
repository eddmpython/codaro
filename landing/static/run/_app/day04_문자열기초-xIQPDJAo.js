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
  goal: 더하기 기호로 두 문자열을 이어 붙인 결과를 만든다.
  why: 이름과 직함, 폴더 이름과 파일 이름처럼 조각으로 나뉜 글자를 하나로 합칠 때 씁니다.
  explanation: |-
    문자열은 + 연산자로 연결할 수 있습니다. 두 개 이상의 문자열을 하나로 합칠 때 사용합니다. 숫자의 덧셈과 같은 기호지만 문자열에서는 연결의 의미입니다.

    공백을 넣으려면 ' ' 처럼 공백 문자열을 중간에 추가합니다.
  snippet: |-
    first = 'Hello'
    second = 'World'
    first + ' ' + second
  exercise:
    prompt: |-
      second를 'Codaro'로 바꾸세요.

      실행하면 Hello Codaro가 나와야 합니다.
    starterCode: |-
      first = 'Hello'
      second = 'World'
      first + ' ' + second
    solution: |-
      first = 'Hello'
      second = 'Codaro'
      first + ' ' + second
    hints:
    - "second = 'World' 를 second = 'Codaro' 로 바꿉니다. 마지막 줄은 그대로 둡니다."
    - "정답 형태: second = 'Codaro'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Hello Codaro'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hello Codaro'"
- id: string_repeat
  title: 문자열 반복
  structuredPrimary: true
  subtitle: '* 기호로 문자열 반복하기'
  goal: 곱하기 기호로 같은 문자열을 정해진 횟수만큼 반복한다.
  why: 구분선이나 들여쓰기 공백처럼 같은 글자를 여러 번 찍어야 할 때 반복문 없이 한 줄로 끝냅니다.
  explanation: |-
    문자열에 * 연산자를 사용하면 문자열을 반복할 수 있습니다. 숫자를 곱하면 그 횟수만큼 문자열이 반복됩니다. 같은 문자를 여러 번 출력할 때 유용합니다.

    '=' * 50 처럼 사용하면 구분선을 만들 수 있습니다.
  snippet: |-
    word = 'Python'
    word * 3
  exercise:
    prompt: |-
      word를 'Go'로 바꾸세요. 곱하는 숫자 3은 그대로 둡니다.

      실행하면 GoGoGo가 나와야 합니다.
    starterCode: |-
      word = 'Python'
      word * 3
    solution: |-
      word = 'Go'
      word * 3
    hints:
    - "word = 'Python' 을 word = 'Go' 로 바꿉니다. word * 3 줄은 그대로 둡니다."
    - "정답 형태: word = 'Go'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'GoGoGo'
    resultCheck: "출력이 정확히 일치해야 합니다: 'GoGoGo'"
- id: string_length
  title: 문자열 길이
  structuredPrimary: true
  subtitle: len() 함수로 길이 구하기
  goal: len()으로 문자열에 든 글자 개수를 센다.
  why: 비밀번호가 최소 길이를 넘는지, 제목이 정해진 칸에 들어가는지 판단할 때 씁니다.
  explanation: len() 함수는 문자열의 길이를 반환합니다. 문자열에 포함된 문자의 개수를 세어줍니다. 공백과 특수문자도 모두 포함됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text = 'Hello Python'
    len(text)
  exercise:
    prompt: |-
      text를 'Codaro'로 바꾸세요.

      실행하면 6이 나와야 합니다.
    starterCode: |-
      text = 'Hello Python'
      len(text)
    solution: |-
      text = 'Codaro'
      len(text)
    hints:
    - "text = 'Hello Python' 을 text = 'Codaro' 로 바꿉니다. len(text) 줄은 그대로 둡니다."
    - "정답 형태: text = 'Codaro'"
  check:
    type: outputExact
    evidence: practice
    outputExact: '6'
    resultCheck: "출력이 정확히 일치해야 합니다: '6'"
- id: fstring
  title: f-string 포맷팅
  structuredPrimary: true
  subtitle: f-string으로 간편하게 문자열 만들기
  goal: f-string으로 변수 값을 문장 안에 끼워 넣는다.
  why: 알림 문구나 보고 문장처럼 사람이 읽을 글에 값을 넣을 때 더하기 연결보다 짧고 형 변환 실수가 없습니다.
  explanation: |-
    f-string은 문자열 앞에 f를 붙여 변수를 직접 넣을 수 있는 방법입니다. + 연결이나 str() 변환 없이도 변수와 문자를 자연스럽게 조합할 수 있습니다. 중괄호 {} 안에 변수명이나 표현식을 넣으면 자동으로 문자열로 변환됩니다.

    중괄호 {} 안에는 변수뿐만 아니라 연산식(예: {age + 1})도 넣을 수 있습니다.
  snippet: |-
    name = '김철수'
    age = 25
    f'{name}님의 나이는 {age}세입니다'
  exercise:
    prompt: |-
      age를 30으로 바꾸세요. f-string 줄은 그대로 둡니다.

      실행하면 아래 한 줄이 나와야 합니다.
      김철수님의 나이는 30세입니다
    starterCode: |-
      name = '김철수'
      age = 25
      f'{name}님의 나이는 {age}세입니다'
    solution: |-
      name = '김철수'
      age = 30
      f'{name}님의 나이는 {age}세입니다'
    hints:
    - age = 25 를 age = 30 으로 바꿉니다. 중괄호 안의 age는 건드리지 않습니다.
    - "정답 형태: age = 30"
  check:
    type: outputExact
    evidence: practice
    outputExact: '김철수님의 나이는 30세입니다'
    resultCheck: "출력이 정확히 일치해야 합니다: '김철수님의 나이는 30세입니다'"
- id: escape_newline
  title: 줄바꿈 문자
  structuredPrimary: true
  subtitle: \\n으로 줄 바꾸기
  goal: '\\n을 넣어 문자열 하나를 여러 줄로 출력한다.'
  why: 여러 줄짜리 안내문이나 로그를 문자열 하나로 다루면서 화면에서는 줄을 나눠 보여줄 때 씁니다.
  explanation: 이스케이프 문자는 백슬래시(\\)로 시작하는 특수 문자입니다. \\n은 줄바꿈을 의미하며, 문자열 중간에 사용하면 그 지점에서 줄이 바뀝니다. 여러 줄 출력에
    유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    lines = '첫 번째 줄\\n두 번째 줄\\n세 번째 줄'
    print(lines)
  exercise:
    prompt: |-
      lines 문자열 끝, 닫는 따옴표 바로 앞에 \\n네 번째 줄 을 이어 붙이세요.

      실행하면 아래 네 줄이 나와야 합니다.
      첫 번째 줄
      두 번째 줄
      세 번째 줄
      네 번째 줄
    starterCode: |-
      lines = '첫 번째 줄\\n두 번째 줄\\n세 번째 줄'
      print(lines)
    solution: |-
      lines = '첫 번째 줄\\n두 번째 줄\\n세 번째 줄\\n네 번째 줄'
      print(lines)
    hints:
    - '세 번째 줄 과 닫는 따옴표 사이에 \\n네 번째 줄 을 넣습니다. 따옴표는 새로 열지 않습니다.'
    - '정답 형태: lines = ''첫 번째 줄\\n두 번째 줄\\n세 번째 줄\\n네 번째 줄'''
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      첫 번째 줄
      두 번째 줄
      세 번째 줄
      네 번째 줄
    resultCheck: "출력이 정확히 일치해야 합니다: '첫 번째 줄\\n두 번째 줄\\n세 번째 줄\\n네 번째 줄'"
- id: escape_tab
  title: 탭 문자
  structuredPrimary: true
  subtitle: \\t로 간격 넣기
  goal: '\\t로 항목 사이에 탭 간격을 넣어 한 줄을 열처럼 정렬한다.'
  why: 값을 표처럼 늘어놓을 때 공백을 몇 칸 넣을지 세지 않고도 열이 맞아 보이게 만듭니다.
  explanation: \\t는 탭 문자로, 일정한 간격을 만듭니다. 텍스트를 정렬할 때 유용하며, 보통 4칸 또는 8칸의 공백과 같은 효과를 냅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    row = '이름\\t나이\\t도시'
    print(row)
  exercise:
    prompt: |-
      row 문자열 끝, 닫는 따옴표 바로 앞에 \\t직업 을 이어 붙이세요.

      실행하면 아래 한 줄이 나와야 합니다. 항목 사이는 탭 간격입니다.
      이름	나이	도시	직업
    starterCode: |-
      row = '이름\\t나이\\t도시'
      print(row)
    solution: |-
      row = '이름\\t나이\\t도시\\t직업'
      print(row)
    hints:
    - '도시 와 닫는 따옴표 사이에 \\t직업 을 넣습니다. 탭은 백슬래시와 t 두 글자로 씁니다.'
    - '정답 형태: row = ''이름\\t나이\\t도시\\t직업'''
  check:
    type: outputExact
    evidence: practice
    outputExact: "이름\\t나이\\t도시\\t직업"
    resultCheck: "출력이 정확히 일치해야 합니다: '이름\\t나이\\t도시\\t직업'"
- id: escape_quote
  title: 따옴표 문자
  structuredPrimary: true
  subtitle: \\'와 \\"로 따옴표 넣기
  goal: 따옴표가 들어간 문장을 오류 없이 문자열로 담는다.
  why: 영어 축약형 It's나 인용 부호가 든 문장은 따옴표를 잘못 고르면 문자열이 중간에 끊겨 오류가 납니다.
  explanation: 문자열 안에 따옴표를 넣으려면 백슬래시를 앞에 붙입니다. \\'는 작은따옴표, \\"는 큰따옴표를 문자로 표현합니다. 또는 작은따옴표 문자열 안에 큰따옴표를 사용할
    수도 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    quote = "It's a beautiful day"
    quote
  exercise:
    prompt: |-
      quote 안의 beautiful을 rainy로 바꾸세요.

      실행하면 It's a rainy day가 나와야 합니다. 감싼 따옴표는 화면에 나오지 않습니다.
    starterCode: |-
      quote = "It's a beautiful day"
      quote
    solution: |-
      quote = "It's a rainy day"
      quote
    hints:
    - beautiful 을 rainy 로 바꿉니다. 바깥 큰따옴표와 It's 의 작은따옴표는 그대로 둡니다.
    - "정답 형태: quote = \\"It's a rainy day\\""
  check:
    type: outputExact
    evidence: practice
    outputExact: "It's a rainy day"
    resultCheck: "출력이 정확히 일치해야 합니다: 'It's a rainy day'"
- id: escape_backslash
  title: 백슬래시 문자
  structuredPrimary: true
  subtitle: \\\\로 백슬래시 표현하기
  goal: 백슬래시를 두 번 써서 Windows 경로를 문자열에 담는다.
  why: Windows 경로에는 백슬래시가 들어가는데 한 번만 쓰면 뒤 글자와 묶여 다른 문자로 해석됩니다.
  explanation: 백슬래시 자체를 문자로 표현하려면 코드 안에서 \\\\처럼 두 번 사용합니다. 예를 들어 Windows 경로는 코드에서 'C:\\\\Users'처럼 쓰고, 출력에는 C:\\Users처럼 보입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    path = 'C:\\\\Users\\\\Documents'
    print(path)
  exercise:
    prompt: |-
      path 안의 Documents를 Reports로 바꾸세요.

      실행하면 C:\\Users\\Reports가 나와야 합니다. 코드에는 백슬래시를 두 번 쓰지만 출력에는 한 번만 보입니다.
    starterCode: |-
      path = 'C:\\\\Users\\\\Documents'
      print(path)
    solution: |-
      path = 'C:\\\\Users\\\\Reports'
      print(path)
    hints:
    - path 값의 Documents 를 Reports 로 바꿉니다. 백슬래시 두 개는 그대로 둡니다.
    - '정답 형태: path = ''C:\\\\Users\\\\Reports'''
  check:
    type: outputExact
    evidence: practice
    outputExact: 'C:\\Users\\Reports'
    resultCheck: '출력이 정확히 일치해야 합니다: ''C:\\Users\\Reports'''
- id: multiline_string
  title: 여러 줄 문자열
  structuredPrimary: true
  subtitle: 삼중 따옴표로 여러 줄 작성
  goal: 삼중 따옴표로 줄바꿈이 포함된 문자열을 보이는 모양 그대로 작성한다.
  why: '여러 줄 안내문이나 긴 SQL 문을 \\n 없이 붙여 넣을 수 있어 원문과 나란히 두고 대조하기 쉽습니다.'
  explanation: 삼중 따옴표(''' 또는 \\"\\"\\")를 사용하면 여러 줄에 걸친 문자열을 쉽게 작성할 수 있습니다. 줄바꿈이 자동으로 포함되며, \\n을 사용하지 않아도 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    block = '''첫 번째 줄
    두 번째 줄
    세 번째 줄'''
    print(block)
  exercise:
    prompt: |-
      세 번째 줄 이라고 적힌 부분을 마지막 줄 로 바꾸세요. 삼중 따옴표는 그대로 둡니다.

      실행하면 아래 세 줄이 나와야 합니다.
      첫 번째 줄
      두 번째 줄
      마지막 줄
    starterCode: |-
      block = '''첫 번째 줄
      두 번째 줄
      세 번째 줄'''
      print(block)
    solution: |-
      block = '''첫 번째 줄
      두 번째 줄
      마지막 줄'''
      print(block)
    hints:
    - 세 번째 줄 이라고 쓴 글자만 마지막 줄 로 바꿉니다. 뒤에 붙은 삼중 따옴표는 그대로 둡니다.
    - "정답 형태: 마지막 줄'''"
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      첫 번째 줄
      두 번째 줄
      마지막 줄
    resultCheck: "출력이 정확히 일치해야 합니다: '첫 번째 줄\\n두 번째 줄\\n마지막 줄'"
- id: raw_string
  title: 원시 문자열
  structuredPrimary: true
  subtitle: r 접두사로 이스케이프 무시하기
  goal: r 접두사로 백슬래시를 이스케이프로 해석하지 않게 만든다.
  why: '경로나 정규표현식처럼 백슬래시가 많은 문자열에서 \\\\ 로 두 번씩 쓰는 번거로움과 빠뜨림을 없앱니다.'
  explanation: 문자열 앞에 r을 붙이면 이스케이프 문자를 무시합니다. \\n이 줄바꿈이 아닌 문자 그대로 표시됩니다. 정규표현식이나 파일 경로 작성에 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    raw = r'C:\\Users\\Documents'
    print(raw)
  exercise:
    prompt: |-
      raw를 r'C:\\temp\\new.txt'로 바꾸세요. 앞에 붙은 r은 그대로 둡니다.

      실행하면 C:\\temp\\new.txt가 나와야 합니다. r 덕분에 \\t와 \\n이 탭과 줄바꿈으로 바뀌지 않고 글자 그대로 남습니다.
    starterCode: |-
      raw = r'C:\\Users\\Documents'
      print(raw)
    solution: |-
      raw = r'C:\\temp\\new.txt'
      print(raw)
    hints:
    - 'Users\\Documents 를 temp\\new.txt 로 바꿉니다. 앞의 r 은 지우지 않습니다.'
    - '정답 형태: raw = r''C:\\temp\\new.txt'''
  check:
    type: outputExact
    evidence: practice
    outputExact: 'C:\\temp\\new.txt'
    resultCheck: '출력이 정확히 일치해야 합니다: ''C:\\temp\\new.txt'''
- id: string_in
  title: 문자열 포함 확인
  structuredPrimary: true
  subtitle: in 연산자로 부분 문자열 찾기
  goal: in으로 문자열에 특정 단어가 있는지 판정하고 결과를 False로 뒤집어 본다.
  why: 로그 한 줄에 오류 단어가 있는지, 파일 이름에 키워드가 들어 있는지 걸러낼 때 씁니다.
  explanation: |-
    in 연산자는 문자열 안에 특정 문자나 단어가 포함되어 있는지 확인합니다. 포함되어 있으면 True, 없으면 False를 반환합니다.

    대소문자를 구분하므로 'python' in inCheckText는 False입니다.
  snippet: |-
    phrase = 'Python Programming'
    'Python' in phrase
  exercise:
    prompt: |-
      phrase를 'Codaro Programming'으로 바꾸세요.

      Codaro Programming에는 Python이 없으므로 False가 나와야 합니다.
    starterCode: |-
      phrase = 'Python Programming'
      'Python' in phrase
    solution: |-
      phrase = 'Codaro Programming'
      'Python' in phrase
    hints:
    - "phrase = 'Python Programming' 을 phrase = 'Codaro Programming' 으로 바꿉니다. 마지막 줄은 그대로 둡니다."
    - "정답 형태: phrase = 'Codaro Programming'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'False'
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"
- id: string_not_in
  title: 문자열 미포함 확인
  structuredPrimary: true
  subtitle: not in 연산자로 확인하기
  goal: not in으로 특정 단어가 없는지 판정하고 결과를 False로 뒤집어 본다.
  why: 금지어가 섞이지 않았는지, 로그에 ERROR가 없는지처럼 없어야 정상인 조건을 뒤집지 않고 그대로 적을 수 있습니다.
  explanation: not in 연산자는 문자열에 특정 문자나 단어가 포함되지 않았는지 확인합니다. 포함되지 않으면 True, 포함되어 있으면 False를 반환합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    sentence = 'Hello World'
    'Python' not in sentence
  exercise:
    prompt: |-
      sentence를 'Hello Python'으로 바꾸세요.

      Python이 들어가므로 not in 결과는 False가 나와야 합니다.
    starterCode: |-
      sentence = 'Hello World'
      'Python' not in sentence
    solution: |-
      sentence = 'Hello Python'
      'Python' not in sentence
    hints:
    - "sentence = 'Hello World' 를 sentence = 'Hello Python' 으로 바꿉니다. 마지막 줄은 그대로 둡니다."
    - "정답 형태: sentence = 'Hello Python'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'False'
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"
- id: workflow_validation
  title: '검증 루프: 영수증 문자열을 안전하게 만들기'
  structuredPrimary: true
  subtitle: 문자열을 업무 출력물로 조립하고 검증하기
  goal: 로그를 정상 기록에서 실패 기록으로 바꿀 때 f-string에 끼워 넣는 값과 검사 조건이 어떻게 함께 움직이는지 직접 고쳐 보며 확인한다.
  why: 사람이 읽을 출력물은 한 조각만 어긋나도 눈으로는 잘 안 보이므로 기준을 assert로 코드에 박아 둡니다.
  explanation: |-
    문자열 기초는 단어를 붙이는 데서 끝나지 않습니다. 실제 업무에서는 영수증, 알림 문구, 로그 메시지처럼 사람이 읽을 출력물을 만들고, 빠진 줄이나 잘못된 변환이 없는지 검증해야 합니다.

    로그 한 줄은 나중에 검색으로 찾아 쓰는 데이터이기도 합니다. 레벨과 동작 이름을 f-string으로 끼워 넣으면 형식은 늘 같게 유지되고, 그 안의 값만 상황에 따라 달라집니다. 값을 바꿀 때 검사 조건도 같이 옮겨야 로그가 실제로 무엇을 기록했는지 보증할 수 있습니다.
  tips:
  - 변주 실험 divider = '=' * 24 의 24를 30으로 바꾸면 영수증 너비만 달라지고 assert 세 줄은 그대로 통과하는 것을 확인하세요.
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
    prompt: |-
      같은 주문에서 결제가 실패했다고 보고 로그를 실패 기록으로 바꾸세요. level을 'ERROR'로, action을 'payment_failed'로 바꾸고, 그 아래 assert 세 줄을 새 로그에 맞게 고칩니다. logLine을 만드는 f-string과 orderId는 그대로 둡니다.

      f-string 형식은 그대로라 값만 갈아 끼워지므로 [ERROR] payment_failed: ORD-2026-0007 이 나옵니다. 이제 이 줄에 INFO는 들어 있지 않으므로 마지막 assert도 방향을 바꿔야 합니다.
    starterCode: |-
      level = 'INFO'
      action = 'order_created'
      orderId = 'ORD-2026-0007'
      logLine = f'[{level}] {action}: {orderId}'

      assert logLine.startswith('[INFO]')
      assert 'order_created' in logLine
      assert 'ERROR' not in logLine
      logLine
    solution: |-
      level = 'ERROR'
      action = 'payment_failed'
      orderId = 'ORD-2026-0007'
      logLine = f'[{level}] {action}: {orderId}'

      assert logLine.startswith('[ERROR]')
      assert 'payment_failed' in logLine
      assert 'INFO' not in logLine
      logLine
    hints:
    - 첫 두 줄을 level = 'ERROR' 와 action = 'payment_failed' 로 바꿉니다. f-string 줄은 값을 그대로 끼워 넣으므로 고치지 않습니다.
    - startswith 는 '[ERROR]' 로, 두 번째 assert 는 'payment_failed' 로 바꿉니다. 마지막 줄은 이제 로그에 없는 문자열을 검사해야 하므로 'ERROR' not in 을 'INFO' not in 으로 뒤집습니다.
    - "정답 형태: level = 'ERROR', action = 'payment_failed', assert logLine.startswith('[ERROR]')"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[ERROR] payment_failed: ORD-2026-0007'
    resultCheck: "출력이 정확히 일치해야 합니다: '[ERROR] payment_failed: ORD-2026-0007'"
- id: practice
  title: Day 4 종합 복습
  structuredPrimary: true
  subtitle: 문자열 기초 마스터하기
  goal: 오늘 배운 문자열 연결로 두 단어를 한 문장으로 합친다.
  why: 오늘 배운 문자열 조작을 직접 다시 써 봐야 다음 강의의 문자열 메서드로 넘어갈 수 있습니다.
  explanation: Day 4에서 배운 문자열 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤
    순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    path = 'C:\\\\Users\\\\Documents\\\\file.txt'
    path
  exercise:
    prompt: |-
      first를 'Codaro'로 바꾸세요.

      실행하면 Codaro Python이 나와야 합니다.
    starterCode: |-
      first = 'Hello'
      second = 'Python'
      first + ' ' + second
    solution: |-
      first = 'Codaro'
      second = 'Python'
      first + ' ' + second
    hints:
    - "first = 'Hello' 를 first = 'Codaro' 로 바꿉니다. second 줄과 마지막 줄은 그대로 둡니다."
    - "정답 형태: first = 'Codaro'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Codaro Python'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Codaro Python'"
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
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