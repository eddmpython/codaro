var e=`meta:
  id: day06
  title: 문자열 메서드
  day: 6
  category: 30days
  tags:
  - 문자열
  - 메서드
  - strip
  - split
  - join
  - 데이터정제
  - 검증
  seo:
    title: 파이썬 문자열 메서드 완벽 가이드
    description: upper, lower, split, join, replace, strip, find, count 등 유용한 문자열 메서드를 배웁니다.
    keywords:
    - 문자열 메서드
    - string method
    - upper
    - lower
    - split
intro:
  emoji: 🛠️
  points:
  - 대소문자 변환 메서드
  - 공백 제거와 문자열 정리
  - 문자열 치환과 검색
  - 문자열 분할과 개수 세기
  direction: 문자열 메서드에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 문자열 메서드 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 대문자 변환 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 소문자 변환 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 첫 글자 대문자 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 문자열 메서드 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 문자열 메서드 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 문자열 메서드 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: method_upper
  title: 대문자 변환
  structuredPrimary: true
  subtitle: upper()로 모두 대문자로
  goal: upper()로 문자열의 영문자를 모두 대문자로 바꾼다.
  why: 사람이 대소문자를 섞어 입력한 코드나 약어를 한 형태로 모아 두면 값을 비교하기 쉬워집니다.
  explanation: upper() 메서드는 문자열의 모든 문자를 대문자로 변환합니다. 영문자만 영향을 받으며, 숫자나 특수문자는 그대로 유지됩니다. 원본 문자열은 변경되지 않고
    새로운 문자열을 반환합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text = 'hello python'
    text.upper()
  exercise:
    prompt: |-
      text를 'codaro lab'으로 바꾸세요.

      실행하면 CODARO LAB이 나와야 합니다.
    starterCode: |-
      text = 'hello python'
      text.upper()
    solution: |-
      text = 'codaro lab'
      text.upper()
    hints:
    - "text = 'hello python' 을 text = 'codaro lab' 으로 바꿉니다. text.upper() 줄은 그대로 둡니다."
    - "정답 형태: text = 'codaro lab'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'CODARO LAB'
    resultCheck: "출력이 정확히 일치해야 합니다: 'CODARO LAB'"
- id: method_lower
  title: 소문자 변환
  structuredPrimary: true
  subtitle: lower()로 모두 소문자로
  goal: lower()로 문자열의 영문자를 모두 소문자로 바꾼다.
  why: 아이디나 확장자를 소문자로 모아 두면 대소문자 차이 때문에 같은 값이 다른 값으로 취급되지 않습니다.
  explanation: lower() 메서드는 문자열의 모든 문자를 소문자로 변환합니다. 대소문자 구분 없이 비교할 때 자주 사용됩니다. 원본 문자열은 그대로 유지됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    msg = 'HELLO PYTHON'
    msg.lower()
  exercise:
    prompt: |-
      msg를 'CODARO LAB'으로 바꾸세요.

      실행하면 codaro lab이 나와야 합니다.
    starterCode: |-
      msg = 'HELLO PYTHON'
      msg.lower()
    solution: |-
      msg = 'CODARO LAB'
      msg.lower()
    hints:
    - "msg = 'HELLO PYTHON' 을 msg = 'CODARO LAB' 으로 바꿉니다. msg.lower() 줄은 그대로 둡니다."
    - "정답 형태: msg = 'CODARO LAB'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'codaro lab'
    resultCheck: "출력이 정확히 일치해야 합니다: 'codaro lab'"
- id: method_capitalize
  title: 첫 글자 대문자
  structuredPrimary: true
  subtitle: capitalize()로 첫 문자만 대문자
  goal: capitalize()로 첫 글자만 대문자로 만들고 나머지는 소문자로 내린다.
  why: 아무렇게나 입력된 문장을 문장 첫 글자만 대문자인 한 가지 표기로 정리할 때 씁니다.
  explanation: capitalize() 메서드는 문자열의 첫 번째 문자만 대문자로 만들고 나머지는 모두 소문자로 변환합니다. 문장의 시작을 정리할 때 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    phrase = 'hello PYTHON'
    phrase.capitalize()
  exercise:
    prompt: |-
      phrase를 'CODARO lab'으로 바꾸세요.

      실행하면 Codaro lab이 나와야 합니다. 첫 글자만 대문자로 남고 나머지는 전부 소문자로 내려갑니다.
    starterCode: |-
      phrase = 'hello PYTHON'
      phrase.capitalize()
    solution: |-
      phrase = 'CODARO lab'
      phrase.capitalize()
    hints:
    - "phrase = 'hello PYTHON' 을 phrase = 'CODARO lab' 으로 바꿉니다. phrase.capitalize() 줄은 그대로 둡니다."
    - "정답 형태: phrase = 'CODARO lab'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Codaro lab'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Codaro lab'"
- id: method_title
  title: 제목 형식
  structuredPrimary: true
  subtitle: title()로 각 단어 첫 글자 대문자
  goal: title()로 각 단어의 첫 글자를 대문자로 만든다.
  why: 이름이나 제목 목록을 한 가지 표기로 맞춰 화면과 보고서에 그대로 실을 수 있게 만듭니다.
  explanation: title() 메서드는 각 단어의 첫 글자를 대문자로 만듭니다. 공백이나 특수문자로 구분된 각 단어마다 적용됩니다. 제목이나 이름을 정리할 때 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    sentence = 'hello python programming'
    sentence.title()
  exercise:
    prompt: |-
      sentence를 'codaro lab guide'로 바꾸세요.

      실행하면 Codaro Lab Guide가 나와야 합니다. 단어 세 개의 첫 글자가 모두 대문자가 됩니다.
    starterCode: |-
      sentence = 'hello python programming'
      sentence.title()
    solution: |-
      sentence = 'codaro lab guide'
      sentence.title()
    hints:
    - "sentence = 'hello python programming' 을 sentence = 'codaro lab guide' 로 바꿉니다. sentence.title() 줄은 그대로 둡니다."
    - "정답 형태: sentence = 'codaro lab guide'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Codaro Lab Guide'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Codaro Lab Guide'"
- id: method_strip
  title: 양쪽 공백 제거
  structuredPrimary: true
  subtitle: strip()으로 공백 정리
  goal: strip()으로 문자열 양쪽 끝의 공백을 지운다.
  why: 사람이 복사해 붙인 값에는 앞뒤 공백이 자주 섞여 들어가고, 그대로 두면 비교와 저장이 어긋납니다.
  explanation: strip() 메서드는 문자열 양쪽 끝의 공백을 제거합니다. 사용자 입력을 정리하거나 데이터를 깔끔하게 만들 때 자주 사용됩니다. 문자열 중간의 공백은 제거하지
    않습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    raw = '   hello python   '
    raw.strip()
  exercise:
    prompt: |-
      raw 안의 hello python을 sales data로 바꾸세요. 앞뒤 공백 세 칸은 그대로 둡니다.

      실행하면 sales data가 나와야 합니다. 양쪽 공백은 사라지고 가운데 한 칸만 남습니다.
    starterCode: |-
      raw = '   hello python   '
      raw.strip()
    solution: |-
      raw = '   sales data   '
      raw.strip()
    hints:
    - "따옴표 안의 hello python 만 sales data 로 바꿉니다. 앞뒤 공백과 raw.strip() 줄은 그대로 둡니다."
    - "정답 형태: raw = '   sales data   '"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'sales data'
    resultCheck: "출력이 정확히 일치해야 합니다: 'sales data'"
- id: method_lstrip_rstrip
  title: 한쪽 공백 제거
  structuredPrimary: true
  subtitle: lstrip(), rstrip()으로 한쪽만 제거
  goal: lstrip()으로 왼쪽 공백만 지우고 오른쪽 공백은 남는 것을 확인한다.
  why: 들여쓰기처럼 앞쪽 공백만 걷어내고 뒤쪽은 손대지 않아야 할 때 지울 방향을 골라 쓸 수 있습니다.
  explanation: lstrip()은 왼쪽 공백만, rstrip()은 오른쪽 공백만 제거합니다. l은 left(왼쪽), r은 right(오른쪽)를 의미합니다. 특정 방향의 공백만
    제거할 때 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    left = '   hello   '
    left.lstrip()
  exercise:
    prompt: |-
      두 가지를 바꾸세요. left 안의 hello를 codaro lab으로 바꾸고, 마지막 줄을 print(left.lstrip() + '|')로 바꾸세요. 앞뒤 공백 세 칸은 그대로 둡니다.

      실행하면 codaro lab   | 이 나와야 합니다. 왼쪽 공백은 사라졌는데 오른쪽 공백 세 칸은 남아서 막대 기호 앞에 그대로 보입니다.
    starterCode: |-
      left = '   hello   '
      left.lstrip()
    solution: |-
      left = '   codaro lab   '
      print(left.lstrip() + '|')
    hints:
    - "따옴표 안의 hello 만 codaro lab 으로 바꾸고, 마지막 줄을 print(left.lstrip() + '|') 로 바꿉니다. 막대 기호는 공백이 어디까지 남았는지 보이게 하는 표시입니다."
    - "정답 형태: print(left.lstrip() + '|')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "codaro lab   |"
    resultCheck: "출력이 정확히 일치해야 합니다: 'codaro lab   |'"
- id: method_replace
  title: 문자열 치환
  structuredPrimary: true
  subtitle: replace()로 문자 바꾸기
  goal: replace()로 문자열 안의 특정 부분만 다른 문자열로 갈아 끼운다.
  why: 문구 하나만 바뀐 안내문이나 경로를 처음부터 다시 쓰지 않고 그 부분만 바꿔 쓸 수 있습니다.
  explanation: replace() 메서드는 문자열 안의 특정 부분을 다른 문자열로 바꿉니다. replace(찾을문자, 바꿀문자) 형태로 사용하며, 모든 일치하는 부분을 바꿉니다.
    원본은 변경되지 않습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    greeting = 'Hello World'
    greeting.replace('World', 'Python')
  exercise:
    prompt: |-
      greeting을 'Goodbye World'로 바꾸세요. replace() 줄은 그대로 둡니다.

      실행하면 Goodbye Python이 나와야 합니다. World만 Python으로 바뀌고 앞 단어는 그대로 남습니다.
    starterCode: |-
      greeting = 'Hello World'
      greeting.replace('World', 'Python')
    solution: |-
      greeting = 'Goodbye World'
      greeting.replace('World', 'Python')
    hints:
    - "greeting = 'Hello World' 를 greeting = 'Goodbye World' 로 바꿉니다. World 는 지우지 않습니다."
    - "정답 형태: greeting = 'Goodbye World'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Goodbye Python'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Goodbye Python'"
- id: method_replace_all
  title: 여러 개 치환
  structuredPrimary: true
  subtitle: 모든 일치 항목 바꾸기
  goal: replace()가 일치하는 부분을 하나만이 아니라 전부 바꾼다는 것을 확인한다.
  why: 문서 전체에서 같은 단어를 한 번에 바꿀 때 그 단어가 몇 번 나오는지 미리 세지 않아도 됩니다.
  explanation: replace()는 기본적으로 일치하는 모든 부분을 바꿉니다. 같은 문자가 여러 번 나와도 모두 치환됩니다. 공백을 다른 문자로 바꾸거나 특정 패턴을 제거할
    때 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    allText = 'apple apple orange apple'
    allText.replace('apple', 'banana')
  exercise:
    prompt: |-
      allText를 'apple orange apple'로 바꾸세요. replace() 줄은 그대로 둡니다.

      실행하면 banana orange banana가 나와야 합니다. apple은 두 개 모두 바뀌고 orange는 그대로 남습니다.
    starterCode: |-
      allText = 'apple apple orange apple'
      allText.replace('apple', 'banana')
    solution: |-
      allText = 'apple orange apple'
      allText.replace('apple', 'banana')
    hints:
    - "allText 값을 'apple orange apple' 로 바꿉니다. apple 두 개와 orange 하나만 남기면 됩니다."
    - "정답 형태: allText = 'apple orange apple'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'banana orange banana'
    resultCheck: "출력이 정확히 일치해야 합니다: 'banana orange banana'"
- id: method_split
  title: 문자열 나누기
  structuredPrimary: true
  subtitle: split()으로 구분자 기준 분리
  goal: split()으로 쉼표로 붙어 있는 한 줄을 항목 리스트로 나눈다.
  why: CSV 한 줄이나 로그 한 줄은 항목별로 쪼개야 계산하거나 검사할 수 있습니다.
  explanation: split() 메서드는 문자열을 특정 구분자 기준으로 나누어 리스트를 만듭니다. 쉼표로 구분된 CSV 한 줄, 공백으로 나뉜 단어, 하이픈이 들어간 코드처럼
    정해진 패턴을 데이터로 바꿀 때 자주 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    row = 'kim@example.com,paid,15000'
    row.split(',')
  exercise:
    prompt: |-
      row 끝의 15000을 27000으로 바꾸세요. 앞의 두 항목과 split 줄은 그대로 둡니다.

      실행하면 아래 리스트가 나와야 합니다. 금액도 따옴표가 붙은 문자열로 나뉩니다.
      ['kim@example.com', 'paid', '27000']
    starterCode: |-
      row = 'kim@example.com,paid,15000'
      row.split(',')
    solution: |-
      row = 'kim@example.com,paid,27000'
      row.split(',')
    hints:
    - "row 값 맨 뒤의 15000 만 27000 으로 바꿉니다. 쉼표 위치와 다른 항목은 건드리지 않습니다."
    - "정답 형태: row = 'kim@example.com,paid,27000'"
  check:
    type: outputExact
    evidence: practice
    outputExact: "['kim@example.com', 'paid', '27000']"
    resultCheck: "출력이 정확히 일치해야 합니다: ['kim@example.com', 'paid', '27000']"
- id: method_join
  title: 문자열 합치기
  structuredPrimary: true
  subtitle: join()으로 리스트를 문자열로 조립
  goal: join()으로 리스트 항목을 정한 구분자로 이어 한 문자열로 만든다.
  why: 나눠서 다루던 항목을 파일이나 로그에 다시 한 줄로 적어 저장할 때 씁니다.
  explanation: join() 메서드는 문자열 리스트를 하나의 문자열로 합칩니다. 어떤 구분자를 사이에 넣을지 먼저 쓰고, 그 뒤에 합칠 리스트를 넘깁니다. split()으로
    나눈 데이터를 다시 저장 형식으로 만들 때 함께 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    fields = ['kim@example.com', 'paid', '15000']
    '|'.join(fields)
  exercise:
    prompt: |-
      fields의 마지막 항목 '15000'을 '27000'으로 바꾸세요. 감싼 따옴표와 join 줄은 그대로 둡니다.

      실행하면 kim@example.com|paid|27000이 나와야 합니다.
    starterCode: |-
      fields = ['kim@example.com', 'paid', '15000']
      '|'.join(fields)
    solution: |-
      fields = ['kim@example.com', 'paid', '27000']
      '|'.join(fields)
    hints:
    - "리스트 세 번째 항목 '15000' 을 '27000' 으로 바꿉니다. 따옴표를 지우면 join 이 실패합니다."
    - "정답 형태: fields = ['kim@example.com', 'paid', '27000']"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'kim@example.com|paid|27000'
    resultCheck: "출력이 정확히 일치해야 합니다: 'kim@example.com|paid|27000'"
- id: method_count
  title: 문자열 개수 세기
  structuredPrimary: true
  subtitle: count()로 등장 횟수 확인
  goal: count()로 특정 문자열이 몇 번 나오는지 센다.
  why: 로그에 오류 단어가 몇 번 찍혔는지, 구분자가 몇 개인지 세어 형식이 맞는지 확인할 때 씁니다.
  explanation: count() 메서드는 문자열에서 특정 문자나 문자열이 몇 번 등장하는지 셉니다. 결과는 정수로 반환되며, 없으면 0을 반환합니다. 대소문자를 구분합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    words = 'hello hello world hello'
    words.count('hello')
  exercise:
    prompt: |-
      words를 'hello world hello world'로 바꾸세요. count 줄은 그대로 둡니다.

      hello가 두 번만 남으므로 2가 나와야 합니다.
    starterCode: |-
      words = 'hello hello world hello'
      words.count('hello')
    solution: |-
      words = 'hello world hello world'
      words.count('hello')
    hints:
    - "words 값을 'hello world hello world' 로 바꿉니다. hello 와 world 가 두 번씩 번갈아 나오게 씁니다."
    - "정답 형태: words = 'hello world hello world'"
  check:
    type: outputExact
    evidence: practice
    outputExact: '2'
    resultCheck: "출력이 정확히 일치해야 합니다: '2'"
- id: method_find
  title: 문자열 위치 찾기
  structuredPrimary: true
  subtitle: find()로 첫 등장 위치 확인
  goal: find()로 찾는 단어가 몇 번째 자리에서 시작하는지 확인한다.
  why: 구분 기호나 확장자가 몇 번째 글자에서 시작하는지 알아야 그 앞뒤를 잘라 쓸 수 있습니다.
  explanation: find() 메서드는 문자열에서 특정 문자나 문자열이 처음 나타나는 위치(인덱스)를 반환합니다. 찾지 못하면 -1을 반환합니다. 문자열의 위치를 확인할 때
    사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    code = 'Hello Python Programming'
    code.find('Python')
  exercise:
    prompt: |-
      code에서 앞의 Hello와 그 뒤 공백을 지워 'Python Programming'으로 바꾸세요.

      Python이 맨 앞으로 오므로 0이 나와야 합니다. 위치는 1이 아니라 0부터 셉니다.
    starterCode: |-
      code = 'Hello Python Programming'
      code.find('Python')
    solution: |-
      code = 'Python Programming'
      code.find('Python')
    hints:
    - "code = 'Hello Python Programming' 을 code = 'Python Programming' 으로 바꿉니다. find 줄은 그대로 둡니다."
    - "정답 형태: code = 'Python Programming'"
  check:
    type: outputExact
    evidence: practice
    outputExact: '0'
    resultCheck: "출력이 정확히 일치해야 합니다: '0'"
- id: method_find_notfound
  title: 찾기 실패
  structuredPrimary: true
  subtitle: 없는 문자 찾을 때
  goal: find()가 못 찾으면 -1, 찾으면 시작 위치를 돌려준다는 차이를 눈으로 확인한다.
  why: -1인지 아닌지만 보면 값이 있는지 없는지를 조건 하나로 가를 수 있습니다.
  explanation: find() 메서드로 문자열을 찾지 못하면 -1을 반환합니다. 이를 활용하여 특정 문자열의 존재 여부를 확인할 수 있습니다. in 연산자와 비슷하지만 위치
    정보도 함께 얻을 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text = 'Hello World'
    result = text.find('Python')
    print('found:', result)
  exercise:
    prompt: |-
      text의 World를 Python으로 바꾸세요. find 줄과 print 줄은 그대로 둡니다.

      이제 찾는 데 성공하므로 실패를 뜻하는 -1 대신 아래 한 줄이 나와야 합니다.
      found: 6
    starterCode: |-
      text = 'Hello World'
      result = text.find('Python')
      print('found:', result)
    solution: |-
      text = 'Hello Python'
      result = text.find('Python')
      print('found:', result)
    hints:
    - "text = 'Hello World' 를 text = 'Hello Python' 으로 바꿉니다. Hello 와 공백은 그대로 둡니다."
    - "정답 형태: text = 'Hello Python'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'found: 6'
    resultCheck: "출력이 정확히 일치해야 합니다: 'found: 6'"
- id: method_startswith
  title: 시작 문자 확인
  structuredPrimary: true
  subtitle: startswith()로 시작 여부 확인
  goal: startswith()로 시작 글자를 판정하고 결과를 False로 뒤집어 본다.
  why: 주소가 https로 시작하는지, 파일 이름이 정해진 접두사로 시작하는지 걸러낼 때 씁니다.
  explanation: startswith() 메서드는 문자열이 특정 문자로 시작하는지 확인합니다. 결과는 True 또는 False입니다. URL이 http로 시작하는지, 파일명이
    특정 문자로 시작하는지 등을 확인할 때 유용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    title = 'Python Programming'
    title.startswith('Python')
  exercise:
    prompt: |-
      title을 'Codaro Programming'으로 바꾸세요. startswith 줄은 그대로 둡니다.

      지금은 True가 나오지만, 바꾸면 Python으로 시작하지 않으므로 False가 나와야 합니다.
    starterCode: |-
      title = 'Python Programming'
      title.startswith('Python')
    solution: |-
      title = 'Codaro Programming'
      title.startswith('Python')
    hints:
    - "앞 단어 Python 만 Codaro 로 바꿉니다. startswith('Python') 안의 Python 은 그대로 둡니다."
    - "정답 형태: title = 'Codaro Programming'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'False'
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"
- id: method_endswith
  title: 끝 문자 확인
  structuredPrimary: true
  subtitle: endswith()로 종료 여부 확인
  goal: endswith()로 끝 글자를 판정하고 결과를 False로 뒤집어 본다.
  why: 확장자가 .py인지 .csv인지 보고 그 파일을 처리할지 건너뛸지 정할 때 씁니다.
  explanation: endswith() 메서드는 문자열이 특정 문자로 끝나는지 확인합니다. 파일 확장자 확인이나 문장 부호 확인 등에 자주 사용됩니다. 결과는 True 또는 False입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    file = 'script.py'
    file.endswith('.py')
  exercise:
    prompt: |-
      file을 'script.txt'로 바꾸세요. endswith 줄은 그대로 둡니다.

      지금은 True가 나오지만, 바꾸면 .py로 끝나지 않으므로 False가 나와야 합니다.
    starterCode: |-
      file = 'script.py'
      file.endswith('.py')
    solution: |-
      file = 'script.txt'
      file.endswith('.py')
    hints:
    - "확장자 .py 만 .txt 로 바꿉니다. endswith('.py') 안의 .py 는 그대로 둡니다."
    - "정답 형태: file = 'script.txt'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'False'
    resultCheck: "출력이 정확히 일치해야 합니다: 'False'"
- id: workflow_validation
  title: '검증 루프: 고객 행 정제하기'
  structuredPrimary: true
  subtitle: 공백, 대소문자, 쉼표 형식을 업무 데이터로 정리
  goal: strip, lower, replace를 이어 붙인 정제 결과가 기준값과 같은지 assert로 검증하는 흐름을 확인한다.
  why: 정제는 한 단계만 빠져도 결과가 그럴듯해 보여서, 기준 문자열을 assert로 코드에 박아 두어야 어긋난 순간 바로 멈춥니다.
  explanation: 문자열 메서드는 입력값을 보기 좋게 꾸미는 기능이 아니라, 사람이 넣은 거친 텍스트를 프로그램이 믿고 처리할 수 있는 데이터로 바꾸는 도구입니다. 공백 제거,
    대소문자 통일, 구분자 검사, 숫자 변환까지 한 흐름으로 묶어야 실무에서 다시 쓸 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    rawLine = '  KIM@Example.COM ,  PAID ,  15000원  '
    fields = rawLine.split(',')

    email = fields[0].strip().lower()
    status = fields[1].strip().lower()
    amountText = fields[2].strip().replace(',', '').replace('원', '')
    amount = int(amountText)
    cleanLine = '|'.join([email, status, str(amount)])

    assert email == 'kim@example.com'
    assert status == 'paid'
    assert amount == 15000
    assert cleanLine == 'kim@example.com|paid|15000'
  exercise:
    prompt: |-
      값은 바꾸지 말고 코드를 그대로 실행하세요.

      assert 두 줄이 모두 통과하고 마지막에 sales_report_2026_final.csv가 나와야 합니다.
    starterCode: |-
      rawFileName = '  Sales Report 2026 FINAL.CSV  '
      cleanFileName = rawFileName.strip().lower().replace(' ', '_')

      assert cleanFileName == 'sales_report_2026_final.csv'
      assert cleanFileName.endswith('.csv')
      cleanFileName
    solution: |-
      rawFileName = '  Sales Report 2026 FINAL.CSV  '
      cleanFileName = rawFileName.strip().lower().replace(' ', '_')

      assert cleanFileName == 'sales_report_2026_final.csv'
      assert cleanFileName.endswith('.csv')
      cleanFileName
    hints:
    - 값이나 메서드 순서를 바꾸면 assert가 AssertionError로 멈춥니다. 그때는 원래 코드로 되돌리세요.
    - "정답 형태: 코드를 그대로 실행, 마지막 값 sales_report_2026_final.csv"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'sales_report_2026_final.csv'
    resultCheck: "출력이 정확히 일치해야 합니다: 'sales_report_2026_final.csv'"
- id: practice
  title: Day 6 종합 복습
  structuredPrimary: true
  subtitle: 문자열 메서드 마스터하기
  goal: 오늘 배운 upper()로 문자열을 다시 한 번 대문자로 바꿔 본다.
  why: 메서드를 손으로 한 번 더 써 봐야 다음 강의에서 리스트에 담긴 문자열을 정제할 때 바로 꺼내 쓸 수 있습니다.
  explanation: Day 6에서 배운 문자열 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    file1 = 'document.pdf'
    isPdf = file1.endswith('.pdf')
    print('is_pdf:', isPdf)
  exercise:
    prompt: |-
      greet를 'good job'으로 바꾸세요.

      실행하면 GOOD JOB이 나와야 합니다.
    starterCode: |-
      greet = 'hello world'
      greet.upper()
    solution: |-
      greet = 'good job'
      greet.upper()
    hints:
    - "greet = 'hello world' 를 greet = 'good job' 으로 바꿉니다. greet.upper() 줄은 그대로 둡니다."
    - "정답 형태: greet = 'good job'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'GOOD JOB'
    resultCheck: "출력이 정확히 일치해야 합니다: 'GOOD JOB'"
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
  - id: day06-normalize-tag-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - method_upper
    - practice
    title: 입력 문구를 태그로 정규화하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: strip, lower, replace를 순서대로 적용한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: normalize_tag(text)가 바깥 공백을 지우고 소문자 하이픈 태그를 반환하도록 완성하세요.
      starterCode: |-
        def normalize_tag(text):
            raise NotImplementedError
      solution: |-
        def normalize_tag(text):
            return text.strip().lower().replace(' ', '-')
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day06.normalize-tag.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day06.normalize-tag.mastery.behavior.v1.fixture
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
        entry: normalize_tag
        cases:
        - id: spaces
          arguments:
          - value: '  Learn Python  '
          expectedReturn: learn-python
        - id: case
          arguments:
          - value: CODARO LAB
          expectedReturn: codaro-lab
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day06-count-word-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day06-normalize-tag-mastery
    title: 대소문자와 무관하게 단어 세기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 문자열 메서드를 간단한 텍스트 집계에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: count_word(text, word)가 공백으로 나눈 단어의 대소문자 무관 등장 횟수를 반환하도록 완성하세요.
      starterCode: |-
        def count_word(text, word):
            raise NotImplementedError
      solution: |-
        def count_word(text, word):
            return text.lower().split().count(word.lower())
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day06.count-word.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day06.count-word.transfer.behavior.v1.fixture
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
        entry: count_word
        cases:
        - id: mixed-case
          arguments:
          - value: Python code PYTHON
          - value: python
          expectedReturn: 2
        - id: missing
          arguments:
          - value: learn by doing
          - value: code
          expectedReturn: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day06-clean-csv-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day06-count-word-transfer
    title: 쉼표 항목의 공백 정리하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: split과 strip, join을 기억에서 다시 연결한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: clean_csv(text)가 쉼표로 나눈 항목 공백을 지운 뒤 ', '로 다시 이어 반환하도록 완성하세요.
      starterCode: |-
        def clean_csv(text):
            raise NotImplementedError
      solution: |-
        def clean_csv(text):
            return ', '.join(part.strip() for part in text.split(','))
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day06.clean-csv.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day06.clean-csv.retrieval.behavior.v1.fixture
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
        entry: clean_csv
        cases:
        - id: three
          arguments:
          - value: red, green,blue
          expectedReturn: red, green, blue
        - id: two
          arguments:
          - value: A ,B
          expectedReturn: A, B
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};