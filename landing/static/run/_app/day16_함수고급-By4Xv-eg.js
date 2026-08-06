var e=`meta:
  id: day16
  title: 함수고급
  day: 16
  category: 30days
  tags:
  - 함수
  - 기본값
  - args
  - kwargs
  - lambda
  - 설정함수
  - 검증
  seo:
    title: 파이썬 함수 고급 - 기본값, 가변인자, 람다
    description: 기본값 매개변수, 키워드 인자, *args, **kwargs, lambda를 배웁니다.
    keywords:
    - 함수고급
    - default
    - args
    - kwargs
    - lambda
intro:
  emoji: 🎯
  points:
  - 기본값으로 매개변수 유연화
  - '*args, **kwargs로 가변 인자'
  - lambda로 간단한 함수
  - 고급 함수 패턴
  direction: 함수고급에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 함수고급 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 기본값 매개변수 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 키워드 인자 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 위치 인자와 키워드 혼용 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 함수고급 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 함수고급 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 함수고급 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: default_parameter
  title: 기본값 매개변수
  structuredPrimary: true
  subtitle: 선택적 매개변수
  goal: 인자를 생략한 호출과 넣은 호출을 나란히 실행해 기본값이 언제 쓰이는지 확인한다.
  why: 함수를 부를 때마다 같은 값을 적어 넣게 만들면 호출이 길어지므로, 자주 쓰는 값은 기본값으로 두고 다를 때만 인자를 넘기게 만듭니다.
  explanation: |-
    매개변수에 기본값을 지정하면 인자를 생략할 수 있습니다. def 함수명(매개변수=기본값): 형식으로 쓰며, 호출시 인자를 주지 않으면 기본값이 사용됩니다. 필수 매개변수 뒤에 와야 합니다.

    기본값이 없는 매개변수는 기본값이 있는 매개변수보다 앞에 와야 합니다.
  snippet: |-
    def greet(name='Guest'):
        return 'Hello ' + name

    greet()
  exercise:
    prompt: |-
      마지막 줄 greet()를 print(greet())로 바꾸고, 그 아래에 print(greet('Codaro')) 한 줄을 더 쓰세요. 함수 정의는 그대로 둡니다.

      인자를 생략한 첫 호출은 기본값 Guest를 쓰고 두 번째 호출은 넘긴 값을 쓰므로, 아래 두 줄이 나와야 합니다.
      Hello Guest
      Hello Codaro
    starterCode: |-
      def greet(name='Guest'):
          return 'Hello ' + name

      greet()
    solution: |-
      def greet(name='Guest'):
          return 'Hello ' + name

      print(greet())
      print(greet('Codaro'))
    hints:
    - "마지막 줄 greet() 를 print(greet()) 로 바꾸고, 그 아래에 print(greet('Codaro')) 를 한 줄 더 씁니다. def 줄과 return 줄은 그대로 둡니다."
    - "정답 형태: print(greet()) 와 print(greet('Codaro')) 두 줄"
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      Hello Guest
      Hello Codaro
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hello Guest\\nHello Codaro'"
- id: keyword_argument
  title: 키워드 인자
  structuredPrimary: true
  subtitle: 이름으로 인자 전달
  goal: 인자를 쓰는 순서를 바꿔도 이름으로 넘기면 같은 매개변수에 들어가는 것을 확인한다.
  why: 인자가 셋 이상이면 위치만 보고는 어떤 값이 무엇인지 알기 어려운데, 이름을 붙여 넘기면 호출 한 줄만 읽어도 뜻이 드러나고 순서를 헷갈릴 일도 없습니다.
  explanation: |-
    키워드 인자는 매개변수 이름을 명시하여 값을 전달합니다. 함수명(매개변수=값) 형식으로 쓰며, 순서와 관계없이 전달할 수 있습니다. 코드 가독성이 높아집니다.

    위치 인자는 키워드 인자보다 앞에 와야 합니다.
  snippet: |-
    def introduce(name, age, city):
        return name + ' ' + str(age) + ' ' + city

    introduce(name='Alice', age=25, city='Seoul')
  exercise:
    prompt: |-
      마지막 줄 호출을 introduce(city='Busan', name='Mina', age=30)으로 바꾸세요. 함수 정의는 그대로 둡니다.

      이름을 붙여 넘기면 쓴 순서와 상관없이 각 매개변수로 들어가므로 Mina 30 Busan이 나와야 합니다.
    starterCode: |-
      def introduce(name, age, city):
          return name + ' ' + str(age) + ' ' + city

      introduce(name='Alice', age=25, city='Seoul')
    solution: |-
      def introduce(name, age, city):
          return name + ' ' + str(age) + ' ' + city

      introduce(city='Busan', name='Mina', age=30)
    hints:
    - "introduce(name='Alice', age=25, city='Seoul') 을 introduce(city='Busan', name='Mina', age=30) 으로 바꿉니다. def 줄과 return 줄은 그대로 둡니다."
    - "정답 형태: introduce(city='Busan', name='Mina', age=30)"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Mina 30 Busan'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Mina 30 Busan'"
- id: positional_keyword_mix
  title: 위치 인자와 키워드 혼용
  structuredPrimary: true
  subtitle: 유연한 호출 방식
  goal: 위치 인자 하나와 키워드 인자 하나만 넘기고 나머지는 기본값에 맡겨 결과를 맞춘다.
  why: 옵션이 많은 함수일수록 필수 값은 위치로 짧게 넘기고 바꿀 옵션만 이름으로 집어 주는 편이, 쓰지 않는 옵션까지 전부 나열하는 것보다 읽기 쉽습니다.
  explanation: |-
    위치 인자와 키워드 인자를 함께 사용할 수 있습니다. 위치 인자를 먼저 쓰고 키워드 인자를 뒤에 씁니다. 필수 매개변수는 위치로, 선택적 매개변수는 키워드로 전달하면 편리합니다.

    기본값이 있는 매개변수는 키워드로 전달하면 가독성이 좋습니다.
  snippet: |-
    def orderFood(menu, quantity=1, spicy=False):
        result = menu + ' x' + str(quantity)
        if spicy:
            result = result + ' (spicy)'
        return result

    orderFood('Pizza', quantity=2, spicy=True)
  exercise:
    prompt: |-
      마지막 줄 호출을 orderFood('Pasta', quantity=3)으로 바꾸세요. spicy는 아예 넘기지 않습니다. 함수 정의는 그대로 둡니다.

      spicy를 생략하면 기본값 False가 쓰여 if 블록을 건너뛰므로 Pasta x3이 나와야 합니다.
    starterCode: |-
      def orderFood(menu, quantity=1, spicy=False):
          result = menu + ' x' + str(quantity)
          if spicy:
              result = result + ' (spicy)'
          return result

      orderFood('Pizza', quantity=2, spicy=True)
    solution: |-
      def orderFood(menu, quantity=1, spicy=False):
          result = menu + ' x' + str(quantity)
          if spicy:
              result = result + ' (spicy)'
          return result

      orderFood('Pasta', quantity=3)
    hints:
    - "orderFood('Pizza', quantity=2, spicy=True) 를 orderFood('Pasta', quantity=3) 으로 바꿉니다. spicy=True 는 지웁니다."
    - "정답 형태: orderFood('Pasta', quantity=3)"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Pasta x3'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Pasta x3'"
- id: args_basic
  title: '*args 기본'
  structuredPrimary: true
  subtitle: 가변 위치 인자
  goal: 넘기는 인자 개수를 바꿔도 같은 함수가 그대로 도는 것을 확인한다.
  why: 합계처럼 몇 개를 받을지 미리 알 수 없는 계산은 매개변수 개수를 못 박아 두면 곧 막히므로, 값을 몇 개든 나열해 넘길 수 있게 열어 둡니다.
  explanation: |-
    *args는 임의 개수의 위치 인자를 받습니다. def 함수명(*args): 형식으로 쓰며, args는 튜플로 전달됩니다. 몇 개의 인자가 올지 모를 때 사용합니다.

    args는 관례적인 이름이며, 다른 이름을 사용해도 됩니다.
  snippet: |-
    def sumAll(*args):
        total = 0
        for num in args:
            total = total + num
        return total

    sumAll(1, 2, 3, 4, 5)
  exercise:
    prompt: |-
      마지막 줄 sumAll(1, 2, 3, 4, 5)를 sumAll(100, 200, 300, 400)으로 바꾸세요. 함수 정의는 그대로 둡니다.

      인자가 5개에서 4개로 줄어도 args가 그대로 받아 더하므로 1000이 나와야 합니다.
    starterCode: |-
      def sumAll(*args):
          total = 0
          for num in args:
              total = total + num
          return total

      sumAll(1, 2, 3, 4, 5)
    solution: |-
      def sumAll(*args):
          total = 0
          for num in args:
              total = total + num
          return total

      sumAll(100, 200, 300, 400)
    hints:
    - "sumAll(1, 2, 3, 4, 5) 를 sumAll(100, 200, 300, 400) 으로 바꿉니다. def 줄과 for 문은 그대로 둡니다."
    - "정답 형태: sumAll(100, 200, 300, 400)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '1000'
    resultCheck: "출력이 정확히 일치해야 합니다: '1000'"
- id: args_advanced
  title: '*args 활용'
  structuredPrimary: true
  subtitle: 일반 매개변수와 혼용
  goal: 첫 인자와 나머지 인자가 각각 어디로 들어가는지 인자를 바꿔 확인한다.
  why: 첫 값만 따로 다루고 나머지는 한 묶음으로 처리해야 하는 함수가 많아서, 필수 매개변수와 나머지를 나눠 받으면 함수 안에서 둘을 구분해 쓸 수 있습니다.
  explanation: |-
    *args는 일반 매개변수와 함께 사용할 수 있습니다. 일반 매개변수를 먼저 쓰고 *args를 뒤에 씁니다. 필수 인자와 선택적 인자를 함께 받을 때 유용합니다.

    *args 뒤에는 키워드 전용 매개변수만 올 수 있습니다.
  snippet: |-
    def makeList(first, *rest):
        result = [first]
        for item in rest:
            result.append(item)
        return result

    makeList('a', 'b', 'c', 'd')
  exercise:
    prompt: |-
      마지막 줄 호출을 makeList('red', 'green', 'blue')로 바꾸세요. 함수 정의는 그대로 둡니다.

      맨 앞의 'red'는 first로 들어가고 'green'과 'blue'는 rest로 묶여 뒤에 붙으므로, 아래 한 줄이 나와야 합니다.
      ['red', 'green', 'blue']
    starterCode: |-
      def makeList(first, *rest):
          result = [first]
          for item in rest:
              result.append(item)
          return result

      makeList('a', 'b', 'c', 'd')
    solution: |-
      def makeList(first, *rest):
          result = [first]
          for item in rest:
              result.append(item)
          return result

      makeList('red', 'green', 'blue')
    hints:
    - "makeList('a', 'b', 'c', 'd') 를 makeList('red', 'green', 'blue') 로 바꿉니다. def 줄과 for 문은 그대로 둡니다."
    - "정답 형태: makeList('red', 'green', 'blue')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "['red', 'green', 'blue']"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['red', 'green', 'blue']\\""
- id: kwargs_basic
  title: '**kwargs 기본'
  structuredPrimary: true
  subtitle: 가변 키워드 인자
  goal: 넘기는 키워드의 개수와 순서를 바꿔 딕셔너리가 그대로 따라오는 것을 확인한다.
  why: 설정값처럼 어떤 키가 올지 부르는 쪽이 정하는 경우, 키 이름을 매개변수로 못 박지 않고 딕셔너리로 통째로 받으면 함수를 고치지 않고도 새 키를 받을 수 있습니다.
  explanation: |-
    **kwargs는 임의 개수의 키워드 인자를 받습니다. def 함수명(**kwargs): 형식으로 쓰며, kwargs는 딕셔너리로 전달됩니다. 키-값 쌍을 여러 개 받을 때 사용합니다.

    kwargs도 관례적인 이름이며, 다른 이름을 사용해도 됩니다.
  snippet: |-
    def printInfo(**kwargs):
        result = ''
        for key in kwargs:
            result = result + key + '=' + str(kwargs[key]) + ' '
        return result

    printInfo(name='Alice', age=25, city='Seoul')
  exercise:
    prompt: |-
      마지막 줄 호출을 printInfo(city='Busan', name='Mina')로 바꾸세요. age는 아예 넘기지 않습니다. 함수 정의는 그대로 둡니다.

      받은 딕셔너리는 넘긴 순서를 그대로 기억하므로 for 문도 city 다음 name 순으로 돌아 city=Busan name=Mina가 나와야 합니다.
    starterCode: |-
      def printInfo(**kwargs):
          result = ''
          for key in kwargs:
              result = result + key + '=' + str(kwargs[key]) + ' '
          return result

      printInfo(name='Alice', age=25, city='Seoul')
    solution: |-
      def printInfo(**kwargs):
          result = ''
          for key in kwargs:
              result = result + key + '=' + str(kwargs[key]) + ' '
          return result

      printInfo(city='Busan', name='Mina')
    hints:
    - "printInfo(name='Alice', age=25, city='Seoul') 을 printInfo(city='Busan', name='Mina') 로 바꿉니다. 키워드 두 개만 남기고 age=25 는 지웁니다."
    - "정답 형태: printInfo(city='Busan', name='Mina')"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'city=Busan name=Mina'
    resultCheck: "출력이 정확히 일치해야 합니다: 'city=Busan name=Mina'"
- id: kwargs_advanced
  title: '**kwargs 활용'
  structuredPrimary: true
  subtitle: 일반 매개변수와 혼용
  goal: 옵션 하나를 빼고 호출해 없는 키의 분기가 통째로 건너뛰어지는 것을 확인한다.
  why: 선택 옵션은 늘 들어오지 않으므로 받은 딕셔너리에 키가 있는지 먼저 확인하고 써야, 옵션을 생략한 호출에서 KeyError로 죽지 않습니다.
  explanation: |-
    **kwargs는 일반 매개변수, *args와 함께 사용할 수 있습니다. 순서는 일반 매개변수, *args, **kwargs입니다. 매우 유연한 함수를 만들 수 있습니다.

    **kwargs는 설정이나 옵션을 받을 때 매우 유용합니다.
  snippet: |-
    def createUser(userId, **options):
        info = 'User: ' + userId
        if 'name' in options:
            info = info + ' Name: ' + options['name']
        if 'email' in options:
            info = info + ' Email: ' + options['email']
        return info

    createUser('user123', name='Alice', email='alice@example.com')
  exercise:
    prompt: |-
      마지막 줄 호출을 createUser('user777', name='Mina')로 바꾸세요. email 키워드 인자는 통째로 지우고 아이디와 이름만 넘깁니다. 함수 정의는 그대로 둡니다.

      options에 email 키가 없어 두 번째 if를 건너뛰므로, 아래 한 줄이 나와야 합니다.
      User: user777 Name: Mina
    starterCode: |-
      def createUser(userId, **options):
          info = 'User: ' + userId
          if 'name' in options:
              info = info + ' Name: ' + options['name']
          if 'email' in options:
              info = info + ' Email: ' + options['email']
          return info

      createUser('user123', name='Alice', email='alice@example.com')
    solution: |-
      def createUser(userId, **options):
          info = 'User: ' + userId
          if 'name' in options:
              info = info + ' Name: ' + options['name']
          if 'email' in options:
              info = info + ' Email: ' + options['email']
          return info

      createUser('user777', name='Mina')
    hints:
    - "마지막 줄 호출을 createUser('user777', name='Mina') 로 바꿉니다. email= 로 시작하는 인자는 지우고 함수 본문의 두 if 는 그대로 둡니다."
    - "정답 형태: createUser('user777', name='Mina')"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'User: user777 Name: Mina'
    resultCheck: "출력이 정확히 일치해야 합니다: 'User: user777 Name: Mina'"
- id: args_kwargs_together
  title: '*args와 **kwargs 함께'
  structuredPrimary: true
  subtitle: 모든 인자 받기
  goal: 이름 없이 넘긴 값과 이름을 붙여 넘긴 값의 개수를 뒤집어 각각 어디로 모이는지 확인한다.
  why: 다른 함수에 인자를 그대로 넘겨 주는 감싸는 함수를 만들 때 두 가지를 함께 받아 두면, 어떤 형태의 호출이 와도 손대지 않고 전달할 수 있습니다.
  explanation: |-
    *args와 **kwargs를 함께 사용하면 모든 종류의 인자를 받을 수 있습니다. def 함수명(*args, **kwargs): 형식으로 쓰며, 위치 인자는 args로, 키워드 인자는 kwargs로 전달됩니다.

    매우 유연하지만 과도한 사용은 코드 가독성을 해칠 수 있습니다.
  snippet: |-
    def flexibleFunc(*args, **kwargs):
        posCount = len(args)
        kwCount = len(kwargs)
        return posCount, kwCount

    flexibleFunc(1, 2, 3, name='Alice', age=25)
  exercise:
    prompt: |-
      마지막 줄 호출을 flexibleFunc(10, name='Mina', age=30, city='Busan')으로 바꾸세요. 함수 정의는 그대로 둡니다.

      이름 없이 넘긴 값 1개는 args로, 이름을 붙인 값 3개는 kwargs로 모이므로 (1, 3)이 나와야 합니다.
    starterCode: |-
      def flexibleFunc(*args, **kwargs):
          posCount = len(args)
          kwCount = len(kwargs)
          return posCount, kwCount

      flexibleFunc(1, 2, 3, name='Alice', age=25)
    solution: |-
      def flexibleFunc(*args, **kwargs):
          posCount = len(args)
          kwCount = len(kwargs)
          return posCount, kwCount

      flexibleFunc(10, name='Mina', age=30, city='Busan')
    hints:
    - "flexibleFunc(1, 2, 3, name='Alice', age=25) 를 flexibleFunc(10, name='Mina', age=30, city='Busan') 으로 바꿉니다. 함수 본문은 그대로 둡니다."
    - "정답 형태: flexibleFunc(10, name='Mina', age=30, city='Busan')"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(1, 3)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(1, 3)'"
- id: lambda_basic
  title: lambda 기본
  structuredPrimary: true
  subtitle: 익명 함수
  goal: lambda로 만든 함수도 def로 만든 함수처럼 괄호를 붙여 호출한다는 것을 다른 인자로 확인한다.
  why: 정렬 기준이나 변환 규칙처럼 한 줄이면 끝나는 함수까지 def로 따로 선언하면 코드가 길어지므로, 짧은 함수는 그 자리에서 lambda로 만듭니다.
  explanation: |-
    lambda는 이름 없는 함수를 만듭니다. lambda 매개변수: 표현식 형식으로 쓰며, 표현식의 결과가 자동으로 반환됩니다. 간단한 함수를 한 줄로 만들 때 사용합니다.

    lambda는 한 줄 표현식만 가능하며, 복잡한 로직에는 일반 함수를 사용하세요.
  snippet: |-
    square = lambda x: x * x
    square(5)
  exercise:
    prompt: |-
      마지막 줄 square(5)를 square(12)로 바꾸세요. 첫 줄의 lambda 정의는 그대로 둡니다.

      lambda가 만든 함수도 괄호를 붙여 호출하고 12 * 12가 계산되므로 144가 나와야 합니다.
    starterCode: |-
      square = lambda x: x * x
      square(5)
    solution: |-
      square = lambda x: x * x
      square(12)
    hints:
    - "square(5) 를 square(12) 로 바꿉니다. 첫 줄 square = lambda x: x * x 는 그대로 둡니다."
    - "정답 형태: square(12)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '144'
    resultCheck: "출력이 정확히 일치해야 합니다: '144'"
- id: lambda_advanced
  title: lambda 활용
  structuredPrimary: true
  subtitle: 조건식과 함께
  goal: 홀수를 넣어 조건식의 else 쪽 값이 선택되는 것을 확인한다.
  why: 조건식은 참일 때와 거짓일 때의 값을 한 줄에 몰아 적기 때문에, 어느 쪽이 골라졌는지는 값을 바꿔 직접 실행해 보는 것이 가장 빠릅니다.
  explanation: |-
    lambda에서 조건식(삼항 연산자)을 사용할 수 있습니다. lambda 매개변수: 값1 if 조건 else 값2 형식으로 쓰며, 조건에 따라 다른 값을 반환할 수 있습니다.

    복잡한 조건은 lambda보다 일반 함수가 읽기 쉽습니다.
  snippet: |-
    checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
    checkEven(8)
  exercise:
    prompt: |-
      마지막 줄 checkEven(8)을 checkEven(7)로 바꾸세요. 첫 줄의 조건식은 그대로 둡니다.

      7을 2로 나눈 나머지는 0이 아니라 조건이 거짓이 되고 else 쪽 값이 선택되므로 odd가 나와야 합니다.
    starterCode: |-
      checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
      checkEven(8)
    solution: |-
      checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
      checkEven(7)
    hints:
    - "checkEven(8) 을 checkEven(7) 로 바꿉니다. 첫 줄의 if/else 조건식은 손대지 않습니다."
    - "정답 형태: checkEven(7)"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'odd'
    resultCheck: "출력이 정확히 일치해야 합니다: 'odd'"
- id: workflow_validation
  title: '검증 루프: 주문 요약 함수를 유연하게 설계하기'
  structuredPrimary: true
  subtitle: 기본값, 키워드 인자, args, kwargs를 실무 옵션으로 연결
  goal: 앞 예제에서 만든 기본 주문과 VIP 주문 요약을 기준 금액과 비교해 assert가 모두 통과하는지 확인한다.
  why: 옵션에 따라 금액이 달라지는 함수는 눈으로 보고 넘기지 말고 기대값을 assert로 코드에 박아 두어야, 나중에 계산식을 고쳤을 때 어긋난 것이 바로 드러납니다.
  explanation: 고급 함수 문법은 인자를 많이 받기 위한 장식이 아닙니다. 같은 주문 계산 함수가 기본 세율, VIP 할인, 태그, 출력 옵션처럼 선택값을 안정적으로 받아야
    할 때 필요합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def buildOrderSummary(orderId, *itemPrices, taxRate=0.1, **options):
        if len(itemPrices) == 0:
            raise ValueError('주문에는 금액이 하나 이상 필요합니다')
        for price in itemPrices:
            if not isinstance(price, int):
                raise TypeError('금액은 정수여야 합니다')

        subtotal = sum(itemPrices)
        discountRate = options.get('discountRate', 0)
        discount = int(subtotal * discountRate)
        tax = int((subtotal - discount) * taxRate)
        total = subtotal - discount + tax
        tag = options.get('tag', 'normal')
        return {
            'orderId': orderId,
            'subtotal': subtotal,
            'discount': discount,
            'tax': tax,
            'total': total,
            'tag': tag,
        }


    baseSummary = buildOrderSummary('ORD-1', 10000, 5000)
    vipSummary = buildOrderSummary('ORD-2', 10000, 5000, taxRate=0.08, discountRate=0.2, tag='vip')

    assert baseSummary['total'] == 16500
    assert vipSummary['total'] == 12960
    assert vipSummary['tag'] == 'vip'
  exercise:
    prompt: |-
      이 셀은 고치지 말고 그대로 실행하세요. 위 예제가 만들어 둔 baseSummary와 vipSummary를 그대로 씁니다.

      기본 주문 합계 16500은 기준 15000 이상이고 VIP 주문 합계 12960은 미만이라 두 assert가 조용히 지나가며, 마지막 줄의 호출 결과 True가 나와야 합니다.
    starterCode: |-
      isHighValue = lambda summary: summary['total'] >= 15000
      assert isHighValue(baseSummary) is True
      assert isHighValue(vipSummary) is False
      isHighValue(baseSummary)
    solution: |-
      isHighValue = lambda summary: summary['total'] >= 15000
      assert isHighValue(baseSummary) is True
      assert isHighValue(vipSummary) is False
      isHighValue(baseSummary)
    hints:
    - 값을 바꾸지 말고 그대로 실행합니다. assert 는 기대값과 실제 결과가 같으면 아무 말 없이 지나가고, 다르면 AssertionError 로 멈춥니다.
    - "정답 형태: 셀을 수정 없이 그대로 실행"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'True'
    resultCheck: "출력이 정확히 일치해야 합니다: 'True'"
- id: practice
  title: Day 16 종합 복습
  structuredPrimary: true
  subtitle: 함수 고급 마스터하기
  goal: 위치 인자와 키워드 인자를 한 호출에 섞어 두 기본값 중 하나만 덮어쓴다.
  why: 기본값, 위치 인자, 키워드 인자는 실제 코드에서 호출 한 줄에 함께 나타나므로, 셋을 한 번에 조합해 봐야 남이 만든 함수를 부를 때 인자 자리에서 막히지 않습니다.
  explanation: Day 16에서 배운 함수 고급을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤
    순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def greetPerson(name='Guest', greeting='Hello'):
        return greeting + ' ' + name

    greetPerson()
  exercise:
    prompt: |-
      마지막 줄 greetPerson()을 greetPerson('Codaro', greeting='Hi')로 바꾸세요. 함수 정의는 그대로 둡니다.

      'Codaro'는 위치로 name에 들어가고 greeting은 이름으로 Hi를 받아 기본값 Hello를 덮으므로 Hi Codaro가 나와야 합니다.
    starterCode: |-
      def greetPerson(name='Guest', greeting='Hello'):
          return greeting + ' ' + name

      greetPerson()
    solution: |-
      def greetPerson(name='Guest', greeting='Hello'):
          return greeting + ' ' + name

      greetPerson('Codaro', greeting='Hi')
    hints:
    - "greetPerson() 을 greetPerson('Codaro', greeting='Hi') 로 바꿉니다. def 줄의 기본값 두 개는 그대로 둡니다."
    - "정답 형태: greetPerson('Codaro', greeting='Hi')"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Hi Codaro'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Hi Codaro'"
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
  - id: day16-average-values-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - default_parameter
    - practice
    title: 가변 개수 값의 평균 구하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: '*args로 전달된 값을 하나의 함수에서 처리한다.'
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: average_values(*values)가 모든 입력값의 평균을 반환하도록 완성하세요.
      starterCode: |-
        def average_values(*values):
            raise NotImplementedError
      solution: |-
        def average_values(*values):
            return sum(values) / len(values)
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day16.average-values.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day16.average-values.mastery.behavior.v1.fixture
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
        entry: average_values
        cases:
        - id: three
          arguments:
          - value: 2
          - value: 4
          - value: 6
          expectedReturn: 4.0
        - id: two
          arguments:
          - value: 10
          - value: 20
          expectedReturn: 15.0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day16-build-profile-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day16-average-values-mastery
    title: 선택 옵션을 프로필에 펼치기
    subtitle: 처음 보는 조건에 개념 적용
    goal: dict unpacking을 새 레코드 구성에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: build_profile(name, options)가 name과 options를 합친 새 딕셔너리를 반환하도록 완성하세요.
      starterCode: |-
        def build_profile(name, options):
            raise NotImplementedError
      solution: |-
        def build_profile(name, options):
            return {'name': name, **options}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day16.build-profile.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day16.build-profile.transfer.behavior.v1.fixture
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
        entry: build_profile
        cases:
        - id: city
          arguments:
          - value: Mina
          - value:
              city: Seoul
          expectedReturn:
            name: Mina
            city: Seoul
        - id: empty
          arguments:
          - value: Jun
          - value: {}
          expectedReturn:
            name: Jun
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day16-apply-operation-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day16-build-profile-transfer
    title: operation에 맞는 함수를 골라 적용하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: lambda와 고차 함수 선택을 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: apply_operation(values, operation)이 double 또는 square 연산 결과 목록을 반환하도록 완성하세요.
      starterCode: |-
        def apply_operation(values, operation):
            raise NotImplementedError
      solution: |-
        def apply_operation(values, operation):
            functions = {'double': lambda value: value * 2, 'square': lambda value: value ** 2}
            return [functions[operation](value) for value in values]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day16.apply-operation.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day16.apply-operation.retrieval.behavior.v1.fixture
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
        entry: apply_operation
        cases:
        - id: double
          arguments:
          - value:
            - 1
            - 3
            - 5
          - value: double
          expectedReturn:
          - 2
          - 6
          - 10
        - id: square
          arguments:
          - value:
            - 2
            - 4
          - value: square
          expectedReturn:
          - 4
          - 16
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};