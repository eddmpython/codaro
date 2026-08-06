var e=`meta:\r
  id: day01\r
  title: 헬로월드\r
  day: 1\r
  category: 30days\r
  outcomes: ["python.intro"]\r
  prerequisites: []\r
  estimatedMinutes: 25\r
  tags:\r
  - 헬로월드\r
  - print\r
  - 주석\r
  - 출력\r
  - 첫실행\r
  - 검증\r
  seo:\r
    title: 파이썬 시작 - 헬로월드\r
    description: 파이썬의 첫 시작, 헬로월드와 주석을 배웁니다.\r
    keywords:\r
    - 헬로월드\r
    - print\r
    - 주석\r
    - comment\r
intro:\r
  emoji: 👋\r
  points:\r
  - 파이썬 프로그램 실행 방법\r
  - print()로 텍스트 출력하기\r
  - 한 줄 주석과 여러 줄 설명 메모\r
  - 코드 작성 시 주석의 중요성\r
  direction: 헬로월드에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.\r
  benefits:\r
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.\r
  - 헬로월드 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: Hello World 입력 확인\r
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.\r
    - label: 한글 출력하기 처리 실행\r
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 여러 줄 출력하기 결과 검증\r
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 헬로월드 재사용\r
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기초 자동화 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 헬로월드 실행\r
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.\r
    - label: 헬로월드 완료\r
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.\r
sections:\r
- id: hello_world\r
  title: Hello World\r
  structuredPrimary: true\r
  assessmentMode: mastery\r
  unseen: true\r
  subtitle: 첫 파이썬 프로그램\r
  goal: print()로 글자를 화면에 출력하는 방법을 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    프로그래밍을 처음 배울 때는 보통 'Hello World'를 화면에 출력합니다. 코드가 제대로 실행되는지 가장 작게 확인할 수 있기 때문입니다. 파이썬에서는 print()를 사용해 화면에 텍스트를 보여줍니다.\r
\r
    작은따옴표('')와 큰따옴표("")는 기능상 차이가 없습니다. 편한 것을 사용하세요.\r
  snippet: print('Hello World')\r
  exercise:\r
    prompt: |-\r
      print() 안의 ____를 Codaro로 바꾸세요.\r
      \r
      실행하면 Hello Codaro가 한 줄로 나와야 합니다.\r
    starterCode: print('Hello ____')\r
    hints:\r
    - ____만 Codaro로 바꿉니다. 따옴표는 그대로 둡니다.\r
    - "정답 형태: print('Hello Codaro')"\r
  check:\r
    id: python.print.hello-codaro.output.v1\r
    version: 1\r
    kind: output\r
    strength: strong\r
    executor: browser-worker\r
    timeoutMs: 8000\r
    fixtureId: python.print.hello-codaro.fixture.v1\r
    fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
    fixture:\r
      directories: []\r
      env:\r
        LANG: C.UTF-8\r
        TZ: UTC\r
      files: []\r
      stdin: []\r
    payload:\r
      comparator: exact\r
      expected: Hello Codaro\r
      normalization: trim-final-newline\r
- id: print_korean\r
  title: 한글 출력하기\r
  structuredPrimary: true\r
  subtitle: 파이썬은 모든 언어 지원\r
  goal: print()로 한글도 그대로 출력되는지 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    파이썬은 영어뿐만 아니라 한글, 일본어, 중국어처럼 여러 언어의 글자를 출력할 수 있습니다. 지금은 어려운 원리를 외울 필요 없이, 따옴표 안에 넣은 글자가 화면에 보인다고 이해하면 됩니다.\r
\r
    이모지도 출력할 수 있습니다: print('🐍 Python')\r
  snippet: print('안녕하세요, 파이썬!')\r
  exercise:\r
    prompt: |-\r
      print() 안의 ____를 Codaro로 바꾸세요.\r
      \r
      실행하면 안녕하세요, Codaro!가 한 줄로 나와야 합니다.\r
    starterCode: print('안녕하세요, ____!')\r
    solution: |-\r
      print('안녕하세요, Codaro!')\r
    hints:\r
    - ____만 Codaro로 바꿉니다. 쉼표와 느낌표는 그대로 둡니다.\r
    - "정답 형태: print('안녕하세요, Codaro!')"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "안녕하세요, Codaro!"\r
    resultCheck: "출력이 정확히 일치해야 합니다: '안녕하세요, Codaro!'"\r
- id: print_multiple\r
  title: 여러 줄 출력하기\r
  structuredPrimary: true\r
  subtitle: print() 여러 번 사용\r
  goal: print()를 여러 번 쓰면 화면에 여러 줄이 나온다는 걸 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 여러 줄의 텍스트를 출력하려면 print()를 여러 번 사용하면 됩니다. 각 print()는 자동으로 줄을 바꾸므로 다음 출력은 새 줄에서 시작됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    print('첫 번째 줄')\r
    print('두 번째 줄')\r
    print('세 번째 줄')\r
  exercise:\r
    prompt: |-\r
      두 번째 print() 안의 ____만 아래 글자로 바꾸세요.\r
      \r
      바꾼 두 번째 줄\r
      \r
      다른 줄은 그대로 두고 실행하세요. 결과는 세 줄이어야 합니다.\r
    starterCode: |-\r
      print('첫 번째 줄')\r
      print('____')\r
      print('세 번째 줄')\r
    solution: |-\r
      print('첫 번째 줄')\r
      print('바꾼 두 번째 줄')\r
      print('세 번째 줄')\r
    hints:\r
    - ____가 있는 줄만 고치면 됩니다.\r
    - "따옴표는 그대로 두고 안만 바꿉니다. 예: print('바꾼 두 번째 줄')"\r
    - "실행 후 화면에 세 줄이 이 순서로 보이면 맞습니다: 첫 번째 줄 / 바꾼 두 번째 줄 / 세 번째 줄"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: |-\r
      첫 번째 줄\r
      바꾼 두 번째 줄\r
      세 번째 줄\r
    resultCheck: "출력이 정확히 일치해야 합니다: '첫 번째 줄\\n바꾼 두 번째 줄\\n세 번째 줄'"\r
- id: print_newline\r
  title: 줄바꿈 문자\r
  structuredPrimary: true\r
  subtitle: \\n으로 한 번에 여러 줄 출력\r
  goal: 하나의 print()에 줄바꿈 문자를 넣어 여러 줄을 출력하는 방법을 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    \\n은 줄바꿈 문자로, 하나의 print() 안에서 여러 줄을 출력할 수 있게 해줍니다. \\n을 만나면 그 지점에서 줄이 바뀝니다. 백슬래시(\\)와 문자 n을 함께 써서 만듭니다.\r
\r
    \\n을 사용하면 print() 한 번으로 여러 줄을 출력할 수 있어 편리합니다.\r
  snippet: print('첫 번째 줄\\n두 번째 줄\\n세 번째 줄')\r
  exercise:\r
    prompt: |-\r
      print() 안의 ____를 두 번째 줄로 바꾸세요.\r
      \r
      줄바꿈 문자(백슬래시와 n)는 그대로 둡니다. 실행하면 세 줄이 나와야 합니다.\r
    starterCode: print('첫 번째 줄\\n____\\n세 번째 줄')\r
    solution: |-\r
      print('첫 번째 줄\\n두 번째 줄\\n세 번째 줄')\r
    hints:\r
    - ____만 두 번째 줄로 바꿉니다. 줄바꿈 문자는 건드리지 마세요.\r
    - "정답 형태: print('첫 번째 줄' 다음에 줄바꿈 문자, '두 번째 줄', 줄바꿈 문자, '세 번째 줄')"\r
    - 화면에 첫 번째 줄 / 두 번째 줄 / 세 번째 줄이 보이면 맞습니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: |-\r
      첫 번째 줄\r
      두 번째 줄\r
      세 번째 줄\r
    resultCheck: "출력이 정확히 일치해야 합니다: '첫 번째 줄\\n두 번째 줄\\n세 번째 줄'"\r
- id: comment_single\r
  title: 한 줄 주석\r
  structuredPrimary: true\r
  subtitle: 코드에 설명 추가하기\r
  goal: "샵(#)으로 시작하는 줄은 실행되지 않고, print()만 출력되는지 확인한다."\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    주석(Comment)은 프로그램 실행에 영향을 주지 않는 메모입니다. 코드에 설명을 추가하여 나중에 다시 볼 때나 다른 사람이 볼 때 이해하기 쉽게 만듭니다. 파이썬에서 한 줄 주석은 # 기호로 시작합니다.\r
\r
    주석은 코드를 이해하기 쉽게 만들지만, 과도한 주석은 오히려 가독성을 해칩니다.\r
  snippet: print('실행됩니다')\r
  exercise:\r
    prompt: |-\r
      샵(#)으로 시작하는 첫 줄은 그대로 두세요.\r
      print() 안의 ____를 실행됩니다로 바꾸세요.\r
      \r
      화면에는 실행됩니다 라는 글자만 나와야 합니다.\r
    starterCode: |-\r
      # 이 줄은 실행 결과에 나오지 않습니다.\r
      print('____')\r
    solution: |-\r
      # 이 줄은 실행 결과에 나오지 않습니다.\r
      print('실행됩니다')\r
    hints:\r
    - "샵(#) 줄은 메모라서 화면에 안 나옵니다. 건드리지 마세요."\r
    - ____만 실행됩니다로 바꿉니다.\r
    - "정답 형태: print('실행됩니다')"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: 실행됩니다\r
    resultCheck: "출력이 정확히 일치해야 합니다: '실행됩니다'"\r
- id: comment_multi\r
  title: 여러 줄 설명 메모\r
  structuredPrimary: true\r
  subtitle: 삼중 따옴표를 조심해서 보기\r
  goal: 삼중 따옴표 설명 메모는 출력되지 않고, print()만 화면에 나오는지 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    파이썬의 정식 주석은 #으로 시작하는 한 줄 주석입니다. 다만 삼중 따옴표(''' 또는 """)로 여러 줄 문자열을 만들어 설명 메모처럼 두는 코드도 자주 보입니다. 처음에는 '긴 설명을 여러 줄로 적는 방법' 정도로만 이해하면 됩니다.\r
\r
    삼중 따옴표는 엄밀히 말하면 문자열입니다. 초보 단계에서는 일반 주석은 #으로 쓴다고 기억하세요.\r
  snippet: |-\r
    print('주석 전')\r
    '''\r
    이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.\r
    지금은 실행 결과에 보이지 않습니다.\r
    '''\r
    print('주석 후')\r
  exercise:\r
    prompt: |-\r
      가운데 삼중 따옴표 설명은 그대로 두세요.\r
      마지막 print() 안의 ____를 주석 후로 바꾸세요.\r
      \r
      화면에는 주석 전과 주석 후, 두 줄만 나와야 합니다.\r
    starterCode: |-\r
      print('주석 전')\r
      '''\r
      이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.\r
      지금은 실행 결과에 보이지 않습니다.\r
      '''\r
      print('____')\r
    solution: |-\r
      print('주석 전')\r
      '''\r
      이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.\r
      지금은 실행 결과에 보이지 않습니다.\r
      '''\r
      print('주석 후')\r
    hints:\r
    - 삼중 따옴표로 감싼 부분은 건드리지 마세요.\r
    - ____만 주석 후로 바꿉니다.\r
    - "정답 형태: print('주석 후')"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: |-\r
      주석 전\r
      주석 후\r
    resultCheck: "출력이 정확히 일치해야 합니다: '주석 전\\n주석 후'"\r
- id: print_numbers\r
  title: 숫자 출력하기\r
  structuredPrimary: true\r
  subtitle: 따옴표 없이 숫자 출력\r
  goal: 숫자에는 따옴표를 쓰지 않고 print()로 출력하는 방법을 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    숫자를 출력할 때는 따옴표가 필요 없습니다. 따옴표로 감싸면 문자로 인식되고, 따옴표 없이 쓰면 숫자로 인식됩니다. 숫자는 계산에 사용할 수 있지만, 문자는 계산할 수 없습니다.\r
\r
    print(123)은 숫자 123을, print('123')은 문자 '123'을 출력합니다.\r
  snippet: print(123)\r
  exercise:\r
    prompt: |-\r
      print() 안의 계산을 고쳐 화면에 456이 나오게 하세요.\r
      \r
      따옴표는 쓰지 마세요. 예: print(400 + 56) 또는 print(456)\r
    starterCode: print(100 + 23)\r
    solution: |-\r
      print(400 + 56)\r
    hints:\r
    - 지금 코드는 100 + 23이라 123이 나옵니다.\r
    - 괄호 안을 바꿔 결과가 456이 되게 하면 됩니다.\r
    - "print('456')처럼 따옴표를 쓰면 이번 연습에서는 틀립니다."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '456'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '456'"\r
- id: print_calculation\r
  title: 계산 결과 출력하기\r
  structuredPrimary: true\r
  subtitle: 파이썬을 계산기처럼 사용\r
  goal: print() 안에서 계산한 결과가 화면에 나오는지 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: print() 안에서 직접 계산을 할 수 있습니다. 파이썬은 계산 결과를 자동으로 구한 후 출력합니다. 더하기(+), 빼기(-), 곱하기(*), 나누기(/)\r
    등 다양한 연산이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: print(10 + 20)\r
  exercise:\r
    prompt: |-\r
      print() 안의 계산을 고쳐 화면에 42가 나오게 하세요.\r
      \r
      지금 식은 (6 * 7) - 1이라 41이 나옵니다.\r
    starterCode: print((6 * 7) - 1)\r
    solution: |-\r
      print(6 * 7)\r
    hints:\r
    - "숫자나 연산자 중 하나만 고쳐도 됩니다. 예: 빼기 1을 지우거나 더하기 0으로 바꾸기."\r
    - 실행 결과가 정확히 42면 통과입니다.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '42'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '42'"\r
- id: notebook_expression\r
  title: 마지막 줄 값 확인하기\r
  structuredPrimary: true\r
  subtitle: print 없이 표현식만 쓰기\r
  goal: print() 없이도 셀 마지막 값이 화면에 보이는지 확인한다.\r
  why: 마지막 표현식 결과를 이해하면 노트북에서 작은 값을 빠르게 확인할 수 있습니다.\r
  explanation: Colab과 Codaro 같은 노트북 환경에서는 셀의 마지막 줄에 값이 있으면 화면에 자동으로 보입니다. 처음에는 print()를 주로 쓰되, 마지막 줄에\r
    값만 놓았을 때도 화면에 보일 수 있다는 점을 확인해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: '''Hello Notebook'''\r
  exercise:\r
    prompt: |-\r
      ____를 Notebook으로 바꾸세요.\r
      \r
      print()는 쓰지 마세요. 실행하면 Hello Notebook이 보여야 합니다.\r
    starterCode: '''Hello ____'''\r
    solution: |-\r
      'Hello Notebook'\r
    hints:\r
    - ____만 Notebook으로 바꿉니다.\r
    - "정답 형태: 'Hello Notebook'"\r
    - print()를 새로 추가하지 마세요.\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: Hello Notebook\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hello Notebook'"\r
- id: practice\r
  title: Day 1 종합 복습\r
  structuredPrimary: true\r
  subtitle: Hello World와 주석 마스터하기\r
  goal: 변수와 print()를 함께 써서 Hello Codaro를 출력한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: Day 1에서 배운 print() 출력과 주석을 난이도별로 복습합니다. 기본 미션부터 시작하여 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로\r
    어떤 순서로 해도 괜찮습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: print('Hello World')\r
  exercise:\r
    prompt: |-\r
      name = '____'의 ____를 Codaro로 바꾸세요.\r
      \r
      샵(#) 주석 줄과 print() 줄은 그대로 둡니다.\r
      실행하면 Hello Codaro가 나와야 합니다.\r
    starterCode: |-\r
      # name 변수는 출력할 대상을 기억합니다.\r
      name = '____'\r
      print('Hello', name)\r
    solution: |-\r
      # name 변수는 출력할 대상을 기억합니다.\r
      name = 'Codaro'\r
      print('Hello', name)\r
    hints:\r
    - ____만 Codaro로 바꿉니다.\r
    - "샵(#) 줄은 메모라서 화면에 안 나옵니다."\r
    - "print('Hello', name)은 이미 맞게 되어 있으니 건드리지 마세요."\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: Hello Codaro\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hello Codaro'"\r
- id: reflection\r
  title: Day 1 회고 - 오늘 무엇을 배웠나요?\r
  structuredPrimary: true\r
  subtitle: 기억 굳히기\r
  goal: Day 1에서 print()와 주석으로 얻은 첫 감각을 자기 표현으로 정리한다.\r
  why: 자기 말로 다시 적으면 단순히 따라한 실행이 진짜 이해로 굳어집니다.\r
  explanation: 오늘 다룬 print(), 따옴표, 주석, 마지막 표현식의 자동 표시 중에서 가장 새로웠던 점과 가장 헷갈렸던 지점을 한 단락으로 적어보세요.\r
  reflection:\r
    prompt: 오늘 Day 1에서 가장 새로 배운 한 가지와 가장 헷갈렸던 한 가지를 각각 한 문장으로 적어주세요.\r
    expectedKeywords:\r
    - print\r
    - 출력\r
    - 주석\r
    aiFollowup: 학습자가 적은 답을 한 줄로 요약하고, 헷갈린 지점에 대해 다음 강의 어디에서 다시 만날지 안내한다.\r
assessment:\r
  transferVariants:\r
  - id: report-status-transfer\r
    mode: transfer\r
    unseen: true\r
    sourceSectionIds:\r
    - hello_world\r
    - print_calculation\r
    title: 새 보고 상태 한 줄 만들기\r
    subtitle: 예제에 없던 업무 문구로 출력 규칙 옮기기\r
    goal: 문자열과 숫자를 조합해 처음 보는 파일 처리 상태를 한 줄로 출력한다.\r
    why: 배운 예제 문구를 외우는 대신 새로운 업무 상태에 같은 출력 규칙을 적용해야 실제 전이가 확인된다.\r
    explanation: 앞의 정답 문구를 복제하지 않고 주어진 변수와 출력 형식만 보고 완성한다. 실행 결과는 공백과 구두점까지 독립 fixture에서 비교한다.\r
    tips:\r
    - 첫 실패 뒤에는 콜론 위치와 쉼표가 만드는 공백을 먼저 확인한다.\r
    - '출력 영역이 Report ready: 3 files 한 줄과 정확히 같은지 비교한다.'\r
    exercise:\r
      prompt: 'files 변수는 그대로 두고 정확히 Report ready: 3 files를 한 줄로 출력하세요.'\r
      starterCode: |-\r
        files = 3\r
        print("Report ___:", files, "files")\r
      solution: |-\r
        files = 3\r
        print("Report ready:", files, "files")\r
      hints:\r
      - 첫 문자열의 빈칸만 ready로 바꾸면 콜론은 그대로 사용할 수 있습니다.\r
      - print의 쉼표는 항목 사이에 공백 하나를 자동으로 넣습니다.\r
    check:\r
      id: python.print.report-status.transfer.output.v1\r
      version: 1\r
      kind: output\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.print.report-status.transfer.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        comparator: exact\r
        expected: 'Report ready: 3 files'\r
        normalization: trim-final-newline\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
  retrievalVariants:\r
  - id: hello-codaro-retrieval-24h\r
    mode: retrieval\r
    unseen: true\r
    minimumDelayHours: 168\r
    sourceSectionIds:\r
    - report-status-transfer\r
    title: 하루 뒤 첫 출력 다시 만들기\r
    subtitle: 예제 없이 변수와 print를 회상하기\r
    goal: 하루 이상 지난 뒤 변수와 print를 다시 구성해 Hello Codaro를 출력한다.\r
    why: 바로 본 코드를 따라 쓰는 것과 시간이 지난 뒤 스스로 회상하는 능력은 다르다.\r
    explanation: 이 variant는 base lesson에 즉시 표시하지 않고 strong evidence 시각에서 24시간이 지난 review queue에서 사용한다.\r
    tips:\r
    - 첫 실패 뒤에는 target 변수를 print에 전달했는지 확인한다.\r
    - 두 단어 사이 공백이 하나인지 출력 영역에서 확인한다.\r
    exercise:\r
      prompt: target 변수를 사용해 정확히 Hello Codaro를 출력하는 한 줄을 완성하세요.\r
      starterCode: |-\r
        target = "Codaro"\r
        # 아래 한 줄을 완성하세요.\r
      solution: |-\r
        target = "Codaro"\r
        print("Hello", target)\r
      hints:\r
      - print에는 문자열 Hello와 target 변수를 함께 전달합니다.\r
      - 쉼표로 두 값을 나누면 사이 공백은 print가 만듭니다.\r
    check:\r
      id: python.print.hello-codaro.retrieval-24h.output.v1\r
      version: 1\r
      kind: output\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.print.hello-codaro.retrieval-24h.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        comparator: exact\r
        expected: Hello Codaro\r
        normalization: trim-final-newline\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
  schemaVersion: 1\r
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local\r
    evidence로 분리합니다.\r
  tierParity:\r
    web: portable-concept\r
    local: package-practice-and-artifact\r
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.\r
  authoring:\r
    source: curated-existing-assessment\r
    solutionVerification: required\r
    independentReview: approved\r
    reviewerId: "curriculum-integrity-review"\r
    reviewedAt: "2026-08-02T13:06:47+09:00"\r
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"\r
`;export{e as default};