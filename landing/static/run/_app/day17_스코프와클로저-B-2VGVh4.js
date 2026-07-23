var e=`meta:
  id: day17
  title: 스코프와클로저
  day: 17
  category: 30days
  tags:
  - 스코프
  - 클로저
  - nonlocal
  - 상태관리
  - 캡슐화
  - 검증
  seo:
    title: 파이썬 스코프와 클로저 - 변수 범위와 함수 상태
    description: 지역/전역 스코프, global, nonlocal, closure를 배웁니다.
    keywords:
    - 스코프
    - scope
    - global
    - nonlocal
    - closure
intro:
  emoji: 🔍
  points:
  - 변수 스코프 이해
  - global과 nonlocal
  - 클로저로 상태 보존
  - 고급 함수 패턴
  direction: 스코프와클로저에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 스코프와클로저 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 지역 변수 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 전역 변수 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: global 키워드 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 스코프와클로저 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 스코프와클로저 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 스코프와클로저 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: local_scope
  title: 지역 변수
  structuredPrimary: true
  subtitle: 함수 내부 변수
  goal: 지역 변수에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    함수 안에서 만든 변수는 지역 변수입니다. 지역 변수는 함수 내부에서만 사용할 수 있고, 함수가 끝나면 사라집니다. 함수 밖에서는 접근할 수 없습니다.

    지역 변수는 함수의 독립성을 보장합니다.
  snippet: |-
    def calculate():
        result = 10 + 20
        return result

    calculate()
  exercise:
    prompt: 지역 변수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def calculate():
          result = 10 + 20
          return result

      calculate()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 지역 변수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 지역 변수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: global_scope
  title: 전역 변수
  structuredPrimary: true
  subtitle: 함수 외부 변수
  goal: 전역 변수에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    함수 밖에서 만든 변수는 전역 변수입니다. 전역 변수는 어디서든 읽을 수 있지만, 함수 안에서 수정하려면 global 키워드가 필요합니다.

    전역 변수는 최소한으로 사용하는 것이 좋습니다.
  snippet: |-
    total = 100

    def showTotal():
        return total

    showTotal()
  exercise:
    prompt: 전역 변수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      total = 100

      def showTotal():
          return total

      showTotal()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 전역 변수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 전역 변수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: global_keyword
  title: global 키워드
  structuredPrimary: true
  subtitle: 전역 변수 수정
  goal: global 키워드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    global 키워드를 사용하면 함수 안에서 전역 변수를 수정할 수 있습니다. global 변수명 형식으로 선언하고 사용합니다. 전역 상태를 변경할 때 사용합니다.

    global은 필요할 때만 사용하고, 가급적 return으로 값을 전달하세요.
  snippet: |-
    balance = 1000

    def deposit(amount):
        global balance
        balance = balance + amount
        return balance

    deposit(500)
  exercise:
    prompt: global 키워드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      balance = 1000

      def deposit(amount):
          global balance
          balance = balance + amount
          return balance

      deposit(500)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: global 키워드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: global 키워드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: nested_function
  title: 중첩 함수
  structuredPrimary: true
  subtitle: 함수 안의 함수
  goal: 중첩 함수에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    함수 안에 다른 함수를 정의할 수 있습니다. 내부 함수는 외부 함수의 변수에 접근할 수 있습니다. 외부 함수에서만 내부 함수를 호출할 수 있습니다.

    중첩 함수는 관련된 기능을 그룹화할 때 유용합니다.
  snippet: |-
    def outer():
        msg = 'Hello'
        def inner():
            return msg + ' World'
        return inner()

    outer()
  exercise:
    prompt: 중첩 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def outer():
          msg = 'Hello'
          def inner():
              return msg + ' World'
          return inner()

      outer()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 중첩 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 중첩 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: nonlocal_keyword
  title: nonlocal 키워드
  structuredPrimary: true
  subtitle: 외부 함수 변수 수정
  goal: nonlocal 키워드에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    nonlocal 키워드를 사용하면 내부 함수에서 외부 함수의 변수를 수정할 수 있습니다. nonlocal 변수명 형식으로 선언합니다. 클로저를 만들 때 중요합니다.

    nonlocal은 가장 가까운 외부 함수의 변수를 참조합니다.
  snippet: |-
    def outer():
        count = 0
        def increment():
            nonlocal count
            count = count + 1
            return count
        return increment()

    outer()
  exercise:
    prompt: nonlocal 키워드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def outer():
          count = 0
          def increment():
              nonlocal count
              count = count + 1
              return count
          return increment()

      outer()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: nonlocal 키워드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: nonlocal 키워드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: closure_basic
  title: 클로저 기본
  structuredPrimary: true
  subtitle: 상태를 기억하는 함수
  goal: 클로저 기본에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    클로저는 외부 함수가 끝난 후에도 외부 함수의 변수를 기억하는 내부 함수입니다. 외부 함수가 내부 함수를 반환하면 클로저가 됩니다. 각 클로저는 독립적인 상태를 유지합니다.

    클로저는 함수 팩토리 패턴을 구현할 때 유용합니다.
  snippet: |-
    def makeAdder(n):
        def add(x):
            return x + n
        return add

    add5 = makeAdder(5)
    add5(10)
  exercise:
    prompt: 클로저 기본 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def makeAdder(n):
          def add(x):
              return x + n
          return add

      add5 = makeAdder(5)
      add5(10)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 클로저 기본의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 클로저 기본 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: closure_advanced
  title: 클로저 활용
  structuredPrimary: true
  subtitle: 상태를 가진 함수
  goal: 클로저 활용에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    클로저를 사용하면 상태를 가진 함수를 만들 수 있습니다. nonlocal과 함께 사용하여 상태를 변경하고 유지할 수 있습니다. 카운터, 누적기 등을 구현할 때 유용합니다.

    클로저는 클래스 없이도 상태를 관리할 수 있게 해줍니다.
  snippet: |-
    def makeCounter():
        cnt = 0
        def increment():
            nonlocal cnt
            cnt = cnt + 1
            return cnt
        return increment

    counter = makeCounter()
    counter(), counter(), counter()
  exercise:
    prompt: 클로저 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def makeCounter():
          cnt = 0
          def increment():
              nonlocal cnt
              cnt = cnt + 1
              return cnt
          return increment

      counter = makeCounter()
      counter(), counter(), counter()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 클로저 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 클로저 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 고객별 누적 결제 상태 만들기'
  structuredPrimary: true
  subtitle: global 대신 클로저로 상태를 격리하고 검증
  goal: '검증 루프: 고객별 누적 결제 상태 만들기에서 예상값과 실제 실행 결과를 비교하는 검증 흐름을 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 스코프와 클로저는 시험용 문법이 아니라, 상태가 섞이면 안 되는 업무 흐름을 안전하게 나누는 도구입니다. 고객별 누적 결제 금액처럼 서로 독립이어야 하는 상태는
    전역 변수보다 클로저로 관리하는 편이 안전합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def makePaymentTracker(customerId):
        totalPaid = 0
        paymentCount = 0

        def track(amount):
            nonlocal totalPaid, paymentCount
            if amount <= 0:
                raise ValueError('결제 금액은 양수여야 합니다')
            totalPaid = totalPaid + amount
            paymentCount = paymentCount + 1
            return {
                'customerId': customerId,
                'totalPaid': totalPaid,
                'paymentCount': paymentCount,
            }

        return track


    kimTracker = makePaymentTracker('kim')
    leeTracker = makePaymentTracker('lee')

    kimFirst = kimTracker(10000)
    kimSecond = kimTracker(5000)
    leeFirst = leeTracker(7000)

    assert kimSecond == {'customerId': 'kim', 'totalPaid': 15000, 'paymentCount': 2}
    assert leeFirst == {'customerId': 'lee', 'totalPaid': 7000, 'paymentCount': 1}
    assert kimFirst['totalPaid'] == 10000
  exercise:
    prompt: '검증 루프: 고객별 누적 결제 상태 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def makeStatusCounter(statusName):
          count = 0
          def mark():
              nonlocal count
              count = count + 1
              return {'status': statusName, 'count': count}
          return mark


      successCounter = makeStatusCounter('success')
      failedCounter = makeStatusCounter('failed')

      assert successCounter()['count'] == 1
      assert successCounter()['count'] == 2
      assert failedCounter() == {'status': 'failed', 'count': 1}
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 고객별 누적 결제 상태 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 고객별 누적 결제 상태 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: Day 17 종합 복습
  structuredPrimary: true
  subtitle: 스코프와 클로저 마스터하기
  goal: Day 17 종합 복습에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 17에서 배운 스코프와 클로저를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def compute():
        result = 15 * 3
        return result

    compute()
  exercise:
    prompt: Day 17 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def compute():
          result = 15 * 3
          return result

      compute()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: Day 17 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: Day 17 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
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
  - id: day17-counter-values-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - local_scope
    - practice
    title: nonlocal 상태를 여러 번 갱신하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 클로저가 바깥 함수의 상태를 기억하는 흐름을 확인한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: counter_values(start, step, count)가 클로저 카운터를 count번 호출한 결과 목록을 반환하도록 완성하세요.
      starterCode: |-
        def counter_values(start, step, count):
            raise NotImplementedError
      solution: |-
        def counter_values(start, step, count):
            current = start
            def next_value():
                nonlocal current
                current += step
                return current
            return [next_value() for _ in range(count)]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day17.counter-values.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day17.counter-values.mastery.behavior.v1.fixture
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
        entry: counter_values
        cases:
        - id: positive
          arguments:
          - value: 10
          - value: 2
          - value: 3
          expectedReturn:
          - 12
          - 14
          - 16
        - id: negative
          arguments:
          - value: 5
          - value: -1
          - value: 2
          expectedReturn:
          - 4
          - 3
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day17-scaled-values-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day17-counter-values-mastery
    title: 설정값을 기억하는 변환 함수 만들기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 클로저를 데이터 변환 설정에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: scaled_values(values, factor)가 factor를 기억하는 내부 함수를 사용해 변환 목록을 반환하도록 완성하세요.
      starterCode: |-
        def scaled_values(values, factor):
            raise NotImplementedError
      solution: |-
        def scaled_values(values, factor):
            def scale(value):
                return value * factor
            return [scale(value) for value in values]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day17.scaled-values.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day17.scaled-values.transfer.behavior.v1.fixture
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
        entry: scaled_values
        cases:
        - id: triple
          arguments:
          - value:
            - 1
            - 2
            - 3
          - value: 3
          expectedReturn:
          - 3
          - 6
          - 9
        - id: half
          arguments:
          - value:
            - 4
            - 8
          - value: 0.5
          expectedReturn:
          - 2.0
          - 4.0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day17-nonlocal-total-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day17-scaled-values-transfer
    title: 내부 함수로 누적 상태 다시 만들기
    subtitle: 7일 뒤 기억에서 재구성
    goal: nonlocal 선언과 호출 순서를 기억에서 복원한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: nonlocal_total(values)가 내부 add 함수로 값을 누적한 최종 합계를 반환하도록 완성하세요.
      starterCode: |-
        def nonlocal_total(values):
            raise NotImplementedError
      solution: |-
        def nonlocal_total(values):
            total = 0
            def add(value):
                nonlocal total
                total += value
            for value in values:
                add(value)
            return total
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day17.nonlocal-total.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day17.nonlocal-total.retrieval.behavior.v1.fixture
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
        entry: nonlocal_total
        cases:
        - id: positive
          arguments:
          - value:
            - 3
            - 4
            - 5
          expectedReturn: 12
        - id: signed
          arguments:
          - value:
            - 10
            - -3
          expectedReturn: 7
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};