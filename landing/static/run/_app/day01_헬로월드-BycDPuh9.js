var e=`meta:
  id: day01
  title: 헬로월드
  day: 1
  category: 30days
  outcomes: ["python.intro"]
  prerequisites: []
  estimatedMinutes: 25
  tags:
  - 헬로월드
  - print
  - 주석
  - 출력
  - 첫실행
  - 검증
  seo:
    title: 파이썬 시작 - 헬로월드
    description: 파이썬의 첫 시작, 헬로월드와 주석을 배웁니다.
    keywords:
    - 헬로월드
    - print
    - 주석
    - comment
intro:
  emoji: 👋
  points:
  - 파이썬 프로그램 실행 방법
  - print()로 텍스트 출력하기
  - 한 줄 주석과 여러 줄 설명 메모
  - 코드 작성 시 주석의 중요성
  direction: 헬로월드에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 헬로월드 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: Hello World 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 한글 출력하기 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 여러 줄 출력하기 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 헬로월드 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 헬로월드 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 헬로월드 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: hello_world
  title: Hello World
  structuredPrimary: true
  assessmentMode: mastery
  unseen: true
  subtitle: 첫 파이썬 프로그램
  goal: Hello World에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    프로그래밍을 처음 배울 때는 보통 'Hello World'를 화면에 출력합니다. 코드가 제대로 실행되는지 가장 작게 확인할 수 있기 때문입니다. 파이썬에서는 print()를 사용해 화면에 텍스트를 보여줍니다.

    작은따옴표('')와 큰따옴표("")는 기능상 차이가 없습니다. 편한 것을 사용하세요.
  snippet: print('Hello World')
  exercise:
    prompt: 빈칸 문자열을 Codaro로 바꿔 정확히 Hello Codaro를 출력하세요.
    starterCode: print('Hello ____')
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
    variations:
    - prompt: 작은따옴표 대신 큰따옴표로 바꿔도 같은 결과가 나오는지 확인하세요.
      starterCode: print("Hello Codaro")
      parameterization: 따옴표 종류 변경 - 동일 출력 검증
    - prompt: print() 안에 쉼표로 두 값을 넣으면 어떻게 표시되는지 확인하세요.
      starterCode: print('Hello', 'World')
      parameterization: 인자 개수 변경 - 공백 구분자 검증
  check:
    id: python.print.hello-codaro.output.v1
    version: 1
    kind: output
    strength: strong
    executor: browser-worker
    timeoutMs: 8000
    fixtureId: python.print.hello-codaro.fixture.v1
    fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
    fixture:
      directories: []
      env:
        LANG: C.UTF-8
        TZ: UTC
      files: []
      stdin: []
    payload:
      comparator: exact
      expected: Hello Codaro
      normalization: trim-final-newline
- id: print_korean
  title: 한글 출력하기
  structuredPrimary: true
  subtitle: 파이썬은 모든 언어 지원
  goal: 한글 출력하기에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    파이썬은 영어뿐만 아니라 한글, 일본어, 중국어처럼 여러 언어의 글자를 출력할 수 있습니다. 지금은 어려운 원리를 외울 필요 없이, 따옴표 안에 넣은 글자가 화면에 보인다고 이해하면 됩니다.

    이모지도 출력할 수 있습니다: print('🐍 Python')
  snippet: print('안녕하세요, 파이썬!')
  exercise:
    prompt: 빈칸을 Codaro로 바꿔 정확히 안녕하세요, Codaro!를 출력하세요.
    starterCode: print('안녕하세요, ____!')
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: 안녕하세요, Codaro!
    resultCheck: 출력이 안녕하세요, Codaro!와 정확히 일치해야 합니다.
- id: print_multiple
  title: 여러 줄 출력하기
  structuredPrimary: true
  subtitle: print() 여러 번 사용
  goal: 여러 줄 출력하기에서 여러 print() 호출의 출력 순서와 줄 수를 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: 여러 줄의 텍스트를 출력하려면 print()를 여러 번 사용하면 됩니다. 각 print()는 자동으로 줄을 바꾸므로 다음 출력은 새 줄에서 시작됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    print('첫 번째 줄')
    print('두 번째 줄')
    print('세 번째 줄')
  exercise:
    prompt: 두 번째 줄의 빈칸을 바꿔 세 줄을 정확한 순서로 출력하세요.
    starterCode: |-
      print('첫 번째 줄')
      print('____')
      print('세 번째 줄')
    hints:
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      첫 번째 줄
      바꾼 두 번째 줄
      세 번째 줄
    resultCheck: 세 줄의 문구와 순서가 정확히 일치해야 합니다.
- id: print_newline
  title: 줄바꿈 문자
  structuredPrimary: true
  subtitle: \\n으로 한 번에 여러 줄 출력
  goal: 줄바꿈 문자에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    \\n은 줄바꿈 문자로, 하나의 print() 안에서 여러 줄을 출력할 수 있게 해줍니다. \\n을 만나면 그 지점에서 줄이 바뀝니다. 백슬래시(\\)와 문자 n을 함께 써서 만듭니다.

    \\n을 사용하면 print() 한 번으로 여러 줄을 출력할 수 있어 편리합니다.
  snippet: print('첫 번째 줄\\n두 번째 줄\\n세 번째 줄')
  exercise:
    prompt: 가운데 빈칸을 채워 줄바꿈 문자 하나의 print()로 세 줄을 정확히 출력하세요.
    starterCode: print('첫 번째 줄\\n____\\n세 번째 줄')
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      첫 번째 줄
      두 번째 줄
      세 번째 줄
    resultCheck: 줄바꿈 뒤 세 줄이 정확히 일치해야 합니다.
- id: comment_single
  title: 한 줄 주석
  structuredPrimary: true
  subtitle: 코드에 설명 추가하기
  goal: 한 줄 주석에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    주석(Comment)은 프로그램 실행에 영향을 주지 않는 메모입니다. 코드에 설명을 추가하여 나중에 다시 볼 때나 다른 사람이 볼 때 이해하기 쉽게 만듭니다. 파이썬에서 한 줄 주석은 # 기호로 시작합니다.

    주석은 코드를 이해하기 쉽게 만들지만, 과도한 주석은 오히려 가독성을 해칩니다.
  snippet: print('실행됩니다')
  exercise:
    prompt: 첫 줄은 # 주석으로 남기고 빈칸을 바꿔 실행됩니다만 출력하세요.
    starterCode: |-
      # 이 줄은 실행 결과에 나오지 않습니다.
      print('____')
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: 실행됩니다
    resultCheck: 주석 문장은 제외되고 실행됩니다만 출력되어야 합니다.
- id: comment_multi
  title: 여러 줄 설명 메모
  structuredPrimary: true
  subtitle: 삼중 따옴표를 조심해서 보기
  goal: 여러 줄 설명 메모에서 여러 print() 호출의 출력 순서와 줄 수를 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    파이썬의 정식 주석은 #으로 시작하는 한 줄 주석입니다. 다만 삼중 따옴표(''' 또는 """)로 여러 줄 문자열을 만들어 설명 메모처럼 두는 코드도 자주 보입니다. 처음에는 '긴 설명을 여러 줄로 적는 방법' 정도로만 이해하면 됩니다.

    삼중 따옴표는 엄밀히 말하면 문자열입니다. 초보 단계에서는 일반 주석은 #으로 쓴다고 기억하세요.
  snippet: |-
    print('주석 전')
    '''
    이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.
    지금은 실행 결과에 보이지 않습니다.
    '''
    print('주석 후')
  exercise:
    prompt: 삼중 따옴표 설명은 그대로 두고 마지막 빈칸을 채워 두 줄만 출력하세요.
    starterCode: |-
      print('주석 전')
      '''
      이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.
      지금은 실행 결과에 보이지 않습니다.
      '''
      print('____')
    hints:
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      주석 전
      주석 후
    resultCheck: 설명 메모는 출력되지 않고 주석 전과 주석 후만 순서대로 나와야 합니다.
- id: print_numbers
  title: 숫자 출력하기
  structuredPrimary: true
  subtitle: 따옴표 없이 숫자 출력
  goal: 숫자 출력하기에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: |-
    숫자를 출력할 때는 따옴표가 필요 없습니다. 따옴표로 감싸면 문자로 인식되고, 따옴표 없이 쓰면 숫자로 인식됩니다. 숫자는 계산에 사용할 수 있지만, 문자는 계산할 수 없습니다.

    print(123)은 숫자 123을, print('123')은 문자 '123'을 출력합니다.
  snippet: print(123)
  exercise:
    prompt: 계산식의 숫자를 바꿔 숫자 456을 출력하세요. 따옴표로 감싸지 마세요.
    starterCode: print(100 + 23)
    hints:
    - 바꿀 지점은 print() 괄호 안의 숫자 리터럴입니다.
    - 실행 뒤 출력된 숫자가 입력한 숫자와 정확히 같은지 보세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: '456'
    resultCheck: 계산 결과가 숫자 456으로 정확히 출력되어야 합니다.
- id: print_calculation
  title: 계산 결과 출력하기
  structuredPrimary: true
  subtitle: 파이썬을 계산기처럼 사용
  goal: 계산 결과 출력하기에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: print() 안에서 직접 계산을 할 수 있습니다. 파이썬은 계산 결과를 자동으로 구한 후 출력합니다. 더하기(+), 빼기(-), 곱하기(*), 나누기(/)
    등 다양한 연산이 가능합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: print(10 + 20)
  exercise:
    prompt: 계산식의 숫자나 연산자를 바꿔 정확히 42를 출력하세요.
    starterCode: print((6 * 7) - 1)
    hints:
    - 바꿀 지점은 print() 안의 숫자, 연산자, 괄호 위치에서 찾으세요.
    - 실행 뒤 출력 숫자를 직접 계산한 값과 비교하세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: '42'
    resultCheck: 계산식의 실행 결과가 42와 정확히 일치해야 합니다.
- id: notebook_expression
  title: 마지막 줄 값 확인하기
  structuredPrimary: true
  subtitle: print 없이 표현식만 쓰기
  goal: 마지막 줄 값 확인하기에서 셀 마지막 표현식이 결과로 표시되는 흐름을 확인한다.
  why: 마지막 표현식 결과를 이해하면 노트북에서 작은 값을 빠르게 확인할 수 있습니다.
  explanation: Colab과 Codaro 같은 노트북 환경에서는 셀의 마지막 줄에 값이 있으면 화면에 자동으로 보입니다. 처음에는 print()를 주로 쓰되, 마지막 줄에
    값만 놓았을 때도 화면에 보일 수 있다는 점을 확인해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: '''Hello Notebook'''
  exercise:
    prompt: 마지막 표현식의 빈칸을 바꿔 print() 없이 Hello Notebook을 표시하세요.
    starterCode: '''Hello ____'''
    hints:
    - 바꿀 지점은 셀 마지막 줄의 문자열, 숫자, 계산식입니다.
    - 실행 뒤 출력 영역의 마지막 값이 직접 입력한 표현식 결과와 맞는지 보세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: Hello Notebook
    resultCheck: 마지막 표현식 결과가 Hello Notebook과 정확히 일치해야 합니다.
- id: practice
  title: Day 1 종합 복습
  structuredPrimary: true
  subtitle: Hello World와 주석 마스터하기
  goal: Day 1 종합 복습에서 print() 입력값이 출력 영역에 어떻게 표시되는지 확인한다.
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.
  explanation: Day 1에서 배운 print() 출력과 주석을 난이도별로 복습합니다. 기본 미션부터 시작하여 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: print('Hello World')
  exercise:
    prompt: 변수의 빈칸을 채우고 주석은 실행하지 않은 채 Hello Codaro를 출력하세요.
    starterCode: |-
      # name 변수는 출력할 대상을 기억합니다.
      name = '____'
      print('Hello', name)
    hints:
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.
  check:
    type: outputExact
    evidence: practice
    outputExact: Hello Codaro
    resultCheck: 변수와 print()를 연결한 출력이 Hello Codaro와 정확히 일치해야 합니다.
- id: reflection
  title: Day 1 회고 - 오늘 무엇을 배웠나요?
  structuredPrimary: true
  subtitle: 기억 굳히기
  goal: Day 1에서 print()와 주석으로 얻은 첫 감각을 자기 표현으로 정리한다.
  why: 자기 말로 다시 적으면 단순히 따라한 실행이 진짜 이해로 굳어집니다.
  explanation: 오늘 다룬 print(), 따옴표, 주석, 마지막 표현식의 자동 표시 중에서 가장 새로웠던 점과 가장 헷갈렸던 지점을 한 단락으로 적어보세요.
  reflection:
    prompt: 오늘 Day 1에서 가장 새로 배운 한 가지와 가장 헷갈렸던 한 가지를 각각 한 문장으로 적어주세요.
    expectedKeywords:
    - print
    - 출력
    - 주석
    aiFollowup: 학습자가 적은 답을 한 줄로 요약하고, 헷갈린 지점에 대해 다음 강의 어디에서 다시 만날지 안내한다.
assessment:
  transferVariants:
  - id: report-status-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - hello_world
    - print_calculation
    title: 새 보고 상태 한 줄 만들기
    subtitle: 예제에 없던 업무 문구로 출력 규칙 옮기기
    goal: 문자열과 숫자를 조합해 처음 보는 파일 처리 상태를 한 줄로 출력한다.
    why: 배운 예제 문구를 외우는 대신 새로운 업무 상태에 같은 출력 규칙을 적용해야 실제 전이가 확인된다.
    explanation: 앞의 정답 문구를 복제하지 않고 주어진 변수와 출력 형식만 보고 완성한다. 실행 결과는 공백과 구두점까지 독립 fixture에서 비교한다.
    tips:
    - 첫 실패 뒤에는 콜론 위치와 쉼표가 만드는 공백을 먼저 확인한다.
    - '출력 영역이 Report ready: 3 files 한 줄과 정확히 같은지 비교한다.'
    exercise:
      prompt: 'files 변수는 그대로 두고 정확히 Report ready: 3 files를 한 줄로 출력하세요.'
      starterCode: |-
        files = 3
        print("Report ___:", files, "files")
      solution: |-
        files = 3
        print("Report ready:", files, "files")
      hints:
      - 첫 문자열의 빈칸만 ready로 바꾸면 콜론은 그대로 사용할 수 있습니다.
      - print의 쉼표는 항목 사이에 공백 하나를 자동으로 넣습니다.
    check:
      id: python.print.report-status.transfer.output.v1
      version: 1
      kind: output
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.print.report-status.transfer.fixture.v1
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      payload:
        comparator: exact
        expected: 'Report ready: 3 files'
        normalization: trim-final-newline
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: hello-codaro-retrieval-24h
    mode: retrieval
    unseen: true
    minimumDelayHours: 168
    sourceSectionIds:
    - report-status-transfer
    title: 하루 뒤 첫 출력 다시 만들기
    subtitle: 예제 없이 변수와 print를 회상하기
    goal: 하루 이상 지난 뒤 변수와 print를 다시 구성해 Hello Codaro를 출력한다.
    why: 바로 본 코드를 따라 쓰는 것과 시간이 지난 뒤 스스로 회상하는 능력은 다르다.
    explanation: 이 variant는 base lesson에 즉시 표시하지 않고 strong evidence 시각에서 24시간이 지난 review queue에서 사용한다.
    tips:
    - 첫 실패 뒤에는 target 변수를 print에 전달했는지 확인한다.
    - 두 단어 사이 공백이 하나인지 출력 영역에서 확인한다.
    exercise:
      prompt: target 변수를 사용해 정확히 Hello Codaro를 출력하는 한 줄을 완성하세요.
      starterCode: |-
        target = "Codaro"
        # 아래 한 줄을 완성하세요.
      solution: |-
        target = "Codaro"
        print("Hello", target)
      hints:
      - print에는 문자열 Hello와 target 변수를 함께 전달합니다.
      - 쉼표로 두 값을 나누면 사이 공백은 print가 만듭니다.
    check:
      id: python.print.hello-codaro.retrieval-24h.output.v1
      version: 1
      kind: output
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.print.hello-codaro.retrieval-24h.fixture.v1
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      payload:
        comparator: exact
        expected: Hello Codaro
        normalization: trim-final-newline
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};