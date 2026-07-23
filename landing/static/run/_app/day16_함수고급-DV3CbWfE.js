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
  goal: 기본값 매개변수에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    매개변수에 기본값을 지정하면 인자를 생략할 수 있습니다. def 함수명(매개변수=기본값): 형식으로 쓰며, 호출시 인자를 주지 않으면 기본값이 사용됩니다. 필수 매개변수 뒤에 와야 합니다.

    기본값이 없는 매개변수는 기본값이 있는 매개변수보다 앞에 와야 합니다.
  snippet: |-
    def greet(name='Guest'):
        return 'Hello ' + name

    greet()
  exercise:
    prompt: 기본값 매개변수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def greet(name='Guest'):
          return 'Hello ' + name

      greet()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 기본값 매개변수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 기본값 매개변수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: keyword_argument
  title: 키워드 인자
  structuredPrimary: true
  subtitle: 이름으로 인자 전달
  goal: 키워드 인자에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    키워드 인자는 매개변수 이름을 명시하여 값을 전달합니다. 함수명(매개변수=값) 형식으로 쓰며, 순서와 관계없이 전달할 수 있습니다. 코드 가독성이 높아집니다.

    위치 인자는 키워드 인자보다 앞에 와야 합니다.
  snippet: |-
    def introduce(name, age, city):
        return name + ' ' + str(age) + ' ' + city

    introduce(name='Alice', age=25, city='Seoul')
  exercise:
    prompt: 키워드 인자 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def introduce(name, age, city):
          return name + ' ' + str(age) + ' ' + city

      introduce(name='Alice', age=25, city='Seoul')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 키워드 인자의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 키워드 인자 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: positional_keyword_mix
  title: 위치 인자와 키워드 혼용
  structuredPrimary: true
  subtitle: 유연한 호출 방식
  goal: 위치 인자와 키워드 혼용에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: 위치 인자와 키워드 혼용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def orderFood(menu, quantity=1, spicy=False):
          result = menu + ' x' + str(quantity)
          if spicy:
              result = result + ' (spicy)'
          return result

      orderFood('Pizza', quantity=2, spicy=True)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 위치 인자와 키워드 혼용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 위치 인자와 키워드 혼용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: args_basic
  title: '*args 기본'
  structuredPrimary: true
  subtitle: 가변 위치 인자
  goal: args 기본에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: args 기본 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def sumAll(*args):
          total = 0
          for num in args:
              total = total + num
          return total

      sumAll(1, 2, 3, 4, 5)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: args 기본의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: args 기본 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: args_advanced
  title: '*args 활용'
  structuredPrimary: true
  subtitle: 일반 매개변수와 혼용
  goal: args 활용에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: args 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def makeList(first, *rest):
          result = [first]
          for item in rest:
              result.append(item)
          return result

      makeList('a', 'b', 'c', 'd')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: args 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: args 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: kwargs_basic
  title: '**kwargs 기본'
  structuredPrimary: true
  subtitle: 가변 키워드 인자
  goal: kwargs 기본에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: kwargs 기본 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def printInfo(**kwargs):
          result = ''
          for key in kwargs:
              result = result + key + '=' + str(kwargs[key]) + ' '
          return result

      printInfo(name='Alice', age=25, city='Seoul')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: kwargs 기본의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: kwargs 기본 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: kwargs_advanced
  title: '**kwargs 활용'
  structuredPrimary: true
  subtitle: 일반 매개변수와 혼용
  goal: kwargs 활용에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: kwargs 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def createUser(userId, **options):
          info = 'User: ' + userId
          if 'name' in options:
              info = info + ' Name: ' + options['name']
          if 'email' in options:
              info = info + ' Email: ' + options['email']
          return info

      createUser('user123', name='Alice', email='alice@example.com')
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: kwargs 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: kwargs 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: args_kwargs_together
  title: '*args와 **kwargs 함께'
  structuredPrimary: true
  subtitle: 모든 인자 받기
  goal: args와 kwargs 함께에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
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
    prompt: args와 kwargs 함께 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def flexibleFunc(*args, **kwargs):
          posCount = len(args)
          kwCount = len(kwargs)
          return posCount, kwCount

      flexibleFunc(1, 2, 3, name='Alice', age=25)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: args와 kwargs 함께의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: args와 kwargs 함께 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: lambda_basic
  title: lambda 기본
  structuredPrimary: true
  subtitle: 익명 함수
  goal: lambda 기본에서 \`square\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    lambda는 이름 없는 함수를 만듭니다. lambda 매개변수: 표현식 형식으로 쓰며, 표현식의 결과가 자동으로 반환됩니다. 간단한 함수를 한 줄로 만들 때 사용합니다.

    lambda는 한 줄 표현식만 가능하며, 복잡한 로직에는 일반 함수를 사용하세요.
  snippet: |-
    square = lambda x: x * x
    square(5)
  exercise:
    prompt: lambda 기본 예제에서 \`square\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      square = lambda x: x * x
      square(5)
    hints:
    - 바꿀 지점은 \`square = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`square\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: lambda 기본에서 \`square\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: lambda 기본 실행 뒤 \`square\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: lambda_advanced
  title: lambda 활용
  structuredPrimary: true
  subtitle: 조건식과 함께
  goal: lambda 활용에서 조건값이 선택되는 분기와 결과를 어떻게 바꾸는지 확인한다.
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.
  explanation: |-
    lambda에서 조건식(삼항 연산자)을 사용할 수 있습니다. lambda 매개변수: 값1 if 조건 else 값2 형식으로 쓰며, 조건에 따라 다른 값을 반환할 수 있습니다.

    복잡한 조건은 lambda보다 일반 함수가 읽기 쉽습니다.
  snippet: |-
    checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
    checkEven(8)
  exercise:
    prompt: lambda 활용 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.
    starterCode: |-
      checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
      checkEven(8)
    hints:
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.
  check:
    type: noError
    noError: lambda 활용의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.
    resultCheck: lambda 활용 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 주문 요약 함수를 유연하게 설계하기'
  structuredPrimary: true
  subtitle: 기본값, 키워드 인자, args, kwargs를 실무 옵션으로 연결
  goal: '검증 루프: 주문 요약 함수를 유연하게 설계하기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
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
    prompt: '검증 루프: 주문 요약 함수를 유연하게 설계하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      isHighValue = lambda summary: summary['total'] >= 15000
      assert isHighValue(baseSummary) is True
      assert isHighValue(vipSummary) is False
      isHighValue(baseSummary)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: '검증 루프: 주문 요약 함수를 유연하게 설계하기에서 \`isHighValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '검증 루프: 주문 요약 함수를 유연하게 설계하기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: Day 16 종합 복습
  structuredPrimary: true
  subtitle: 함수 고급 마스터하기
  goal: Day 16 종합 복습에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 16에서 배운 함수 고급을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤
    순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def greetPerson(name='Guest', greeting='Hello'):
        return greeting + ' ' + name

    greetPerson()
  exercise:
    prompt: Day 16 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def greetPerson(name='Guest', greeting='Hello'):
          return greeting + ' ' + name

      greetPerson()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Day 16 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Day 16 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
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