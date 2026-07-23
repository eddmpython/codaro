var e=`meta:\r
  id: '29'\r
  title: 클린 코드\r
  day: 29\r
  category: advancedPython\r
  tags:\r
  - clean-code\r
  - refactoring\r
  - naming\r
  - design-patterns\r
  - 검증\r
  - 리팩토링\r
  seo:\r
    title: 파이썬 클린 코드\r
    description: 가독성, 명명법, 함수 설계, 리팩토링 기법 학습\r
    keywords:\r
    - 클린코드\r
    - 리팩토링\r
    - 명명법\r
intro:\r
  emoji: ✨\r
  points:\r
  - 좋은 명명법\r
  - 함수 설계 원칙\r
  - 코드 구조화\r
  - 리팩토링 기법\r
  direction: 클린 코드에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 클린 코드 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 명명법 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 함수 설계 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 조건문 단순화 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 클린 코드 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 클린 코드 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 클린 코드 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: naming\r
  title: 명명법\r
  structuredPrimary: true\r
  subtitle: 의미 있고 명확한 이름\r
  goal: 명명법에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 변수명만 보고도 용도를 알 수 있어야 합니다. 매직 넘버를 상수로, 불리언은 is/has/can 접두사로.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    badData = [1, 2, 3]\r
    userAges = [25, 30, 35]\r
\r
    x = 86400\r
    SECONDS_PER_DAY = 86400\r
\r
    flag = True\r
    isUserLoggedIn = True\r
    hasPermission = False\r
    canEdit = True\r
\r
    namingResult = {\r
        "bad": "d, x, flag",\r
        "good": "userAges, SECONDS_PER_DAY, isLoggedIn"\r
    }\r
    namingResult\r
  exercise:\r
    prompt: 명명법 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      badData = [1, 2, 3]\r
      userAges = [25, 30, 35]\r
\r
      x = 86400\r
      SECONDS_PER_DAY = 86400\r
\r
      flag = True\r
      isUserLoggedIn = True\r
      hasPermission = False\r
      canEdit = True\r
\r
      namingResult = {\r
          "bad": "d, x, flag",\r
          "good": "userAges, SECONDS_PER_DAY, isLoggedIn"\r
      }\r
      namingResult\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 명명법에서 \`badData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 명명법 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: function_design\r
  title: 함수 설계\r
  structuredPrimary: true\r
  subtitle: 단일 책임과 작은 함수\r
  goal: 함수 설계에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 함수는 한 가지 일만 해야 합니다. 큰 함수는 작은 함수로 분리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def normalizeEmail(email):\r
        return email.lower().strip()\r
\r
    def normalizeName(name):\r
        return name.strip().title()\r
\r
    def isAdultAge(age):\r
        return isinstance(age, int) and age >= 18\r
\r
    def processUser(user):\r
        if user.get("email"):\r
            user["email"] = normalizeEmail(user["email"])\r
        if user.get("name"):\r
            user["name"] = normalizeName(user["name"])\r
        if user.get("age"):\r
            user["isAdult"] = isAdultAge(user["age"])\r
        return user\r
\r
    testUser = {"email": "  TEST@EMAIL.COM  ", "name": "  john doe  ", "age": 25}\r
    processedResult = processUser(testUser.copy())\r
    processedResult\r
  exercise:\r
    prompt: 함수 설계 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def normalizeEmail(email):\r
          return email.lower().strip()\r
\r
      def normalizeName(name):\r
          return name.strip().title()\r
\r
      def isAdultAge(age):\r
          return isinstance(age, int) and age >= 18\r
\r
      def processUser(user):\r
          if user.get("email"):\r
              user["email"] = normalizeEmail(user["email"])\r
          if user.get("name"):\r
              user["name"] = normalizeName(user["name"])\r
          if user.get("age"):\r
              user["isAdult"] = isAdultAge(user["age"])\r
          return user\r
\r
      testUser = {"email": "  TEST@EMAIL.COM  ", "name": "  john doe  ", "age": 25}\r
      processedResult = processUser(testUser.copy())\r
      processedResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 함수 설계의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 함수 설계 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: conditionals\r
  title: 조건문 단순화\r
  structuredPrimary: true\r
  subtitle: 중첩을 평탄화하기\r
  goal: 조건문 단순화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 조기 반환(guard clause)으로 중첩을 줄입니다. 전략 패턴으로 if-else 체인을 제거합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def isValidUserBad(user):\r
        if user is not None:\r
            if user.get("email") is not None:\r
                if "@" in user["email"]:\r
                    if user.get("age") is not None:\r
                        if user["age"] >= 18:\r
                            return True\r
        return False\r
\r
    def isValidUser(user):\r
        if not user:\r
            return False\r
        if not user.get("email") or "@" not in user["email"]:\r
            return False\r
        if not user.get("age") or user["age"] < 18:\r
            return False\r
        return True\r
\r
    testValid = {"email": "test@test.com", "age": 25}\r
    testInvalid = {"email": "invalid", "age": 15}\r
    validResult = (isValidUser(testValid), isValidUser(testInvalid))\r
    validResult\r
  exercise:\r
    prompt: 조건문 단순화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def isValidUserBad(user):\r
          if user is not None:\r
              if user.get("email") is not None:\r
                  if "@" in user["email"]:\r
                      if user.get("age") is not None:\r
                          if user["age"] >= 18:\r
                              return True\r
          return False\r
\r
      def isValidUser(user):\r
          if not user:\r
              return False\r
          if not user.get("email") or "@" not in user["email"]:\r
              return False\r
          if not user.get("age") or user["age"] < 18:\r
              return False\r
          return True\r
\r
      testValid = {"email": "test@test.com", "age": 25}\r
      testInvalid = {"email": "invalid", "age": 15}\r
      validResult = (isValidUser(testValid), isValidUser(testInvalid))\r
      validResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 조건문 단순화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 조건문 단순화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: error_handling\r
  title: 에러 처리\r
  structuredPrimary: true\r
  subtitle: 의미 있는 예외 처리\r
  goal: 에러 처리에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 커스텀 예외로 에러 정보를 명확히. Result 패턴으로 예외 대신 반환값 사용.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class UserNotFoundError(Exception):\r
        def __init__(self, userId):\r
            self.userId = userId\r
            super().__init__(f"User not found: {userId}")\r
\r
    class InvalidEmailError(Exception):\r
        def __init__(self, email):\r
            self.email = email\r
            super().__init__(f"Invalid email: {email}")\r
\r
    def findUser(userId, users):\r
        user = users.get(userId)\r
        if not user:\r
            raise UserNotFoundError(userId)\r
        return user\r
\r
    users = {"user1": {"name": "Alice"}}\r
    errorResult = []\r
    try:\r
        findUser("user1", users)\r
        errorResult.append("found")\r
    except UserNotFoundError as e:\r
        errorResult.append(str(e))\r
    errorResult\r
  exercise:\r
    prompt: 에러 처리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class UserNotFoundError(Exception):\r
          def __init__(self, userId):\r
              self.userId = userId\r
              super().__init__(f"User not found: {userId}")\r
\r
      class InvalidEmailError(Exception):\r
          def __init__(self, email):\r
              self.email = email\r
              super().__init__(f"Invalid email: {email}")\r
\r
      def findUser(userId, users):\r
          user = users.get(userId)\r
          if not user:\r
              raise UserNotFoundError(userId)\r
          return user\r
\r
      users = {"user1": {"name": "Alice"}}\r
      errorResult = []\r
      try:\r
          findUser("user1", users)\r
          errorResult.append("found")\r
      except UserNotFoundError as e:\r
          errorResult.append(str(e))\r
      errorResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 에러 처리의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 에러 처리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: structure\r
  title: 코드 구조화\r
  structuredPrimary: true\r
  subtitle: 의존성 주입과 모듈화\r
  goal: 코드 구조화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 의존성 주입으로 테스트 용이성 확보. 리포지토리 패턴으로 데이터 접근 추상화.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class EmailService:\r
        def send(self, to, subject, body):\r
            return f"Sent to {to}: {subject}"\r
\r
    class NotificationService:\r
        def __init__(self, emailSvc):\r
            self.emailSvc = emailSvc\r
\r
        def notifyByEmail(self, to, subject, body):\r
            return self.emailSvc.send(to, subject, body)\r
\r
    emailSvc = EmailService()\r
    notifySvc = NotificationService(emailSvc)\r
    notifyResult = notifySvc.notifyByEmail("user@test.com", "Hello", "Welcome!")\r
    notifyResult\r
  exercise:\r
    prompt: 코드 구조화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class EmailService:\r
          def send(self, to, subject, body):\r
              return f"Sent to {to}: {subject}"\r
\r
      class NotificationService:\r
          def __init__(self, emailSvc):\r
              self.emailSvc = emailSvc\r
\r
          def notifyByEmail(self, to, subject, body):\r
              return self.emailSvc.send(to, subject, body)\r
\r
      emailSvc = EmailService()\r
      notifySvc = NotificationService(emailSvc)\r
      notifyResult = notifySvc.notifyByEmail("user@test.com", "Hello", "Welcome!")\r
      notifyResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 코드 구조화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 코드 구조화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: refactoring\r
  title: 리팩토링 기법\r
  structuredPrimary: true\r
  subtitle: 코드 품질 개선\r
  goal: 리팩토링 기법에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 함수 추출, 클래스 분리로 단일 책임 원칙 적용.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def calculateSubtotal(items):\r
        return sum(item["price"] * item["qty"] for item in items)\r
\r
    def applyDiscount(amount, percent):\r
        return amount * (1 - percent / 100)\r
\r
    def addTax(amount, rate=0.1):\r
        return amount * (1 + rate)\r
\r
    def calculateOrderTotal(order):\r
        subtotal = calculateSubtotal(order["items"])\r
        afterDisc = applyDiscount(subtotal, order.get("discountPct", 0))\r
        total = addTax(afterDisc)\r
        return total\r
\r
    testOrder = {\r
        "items": [{"price": 100, "qty": 2}, {"price": 50, "qty": 1}],\r
        "discountPct": 10\r
    }\r
    orderTotal = calculateOrderTotal(testOrder)\r
    orderTotal\r
  exercise:\r
    prompt: 리팩토링 기법 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def calculateSubtotal(items):\r
          return sum(item["price"] * item["qty"] for item in items)\r
\r
      def applyDiscount(amount, percent):\r
          return amount * (1 - percent / 100)\r
\r
      def addTax(amount, rate=0.1):\r
          return amount * (1 + rate)\r
\r
      def calculateOrderTotal(order):\r
          subtotal = calculateSubtotal(order["items"])\r
          afterDisc = applyDiscount(subtotal, order.get("discountPct", 0))\r
          total = addTax(afterDisc)\r
          return total\r
\r
      testOrder = {\r
          "items": [{"price": 100, "qty": 2}, {"price": 50, "qty": 1}],\r
          "discountPct": 10\r
      }\r
      orderTotal = calculateOrderTotal(testOrder)\r
      orderTotal\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 리팩토링 기법의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 리팩토링 기법 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 금액 계산 리팩토링'\r
  structuredPrimary: true\r
  subtitle: 이름, 책임 분리, 실패 조건, 회귀 테스트를 함께 확인합니다\r
  goal: '현업 흐름 검증: 주문 금액 계산 리팩토링에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    클린 코드는 예쁜 코드가 아니라 변경할 때 덜 깨지는 코드입니다. 계산 규칙을 작은 함수로 나누고, 정상 케이스와 실패 케이스를 assert로 묶어 리팩토링 전후의 동작을 지키세요.\r
\r
    변주 실험\r
    배송비 정책이 추가될 때 \`calculateOrderTotal\`이 너무 커지지 않도록 \`calculateShippingFee\`를 분리하고, 기존 assert가 그대로 통과하는지 확인하세요.\r
  tips:\r
  - 변주 실험 배송비 정책이 추가될 때 \`calculateOrderTotal\`이 너무 커지지 않도록 \`calculateShippingFee\`를 분리하고, 기존 assert가 그대로\r
    통과하는지 확인하세요.\r
  snippet: |-\r
    TAX_RATE = 0.1\r
\r
    def calculateSubtotal(items):\r
        subtotal = 0\r
        for item in items:\r
            if item["quantity"] <= 0:\r
                raise ValueError("quantity must be positive")\r
            subtotal += item["unitPrice"] * item["quantity"]\r
        return subtotal\r
\r
    def applyDiscount(amount, discountRate):\r
        if not 0 <= discountRate <= 1:\r
            raise ValueError("discountRate must be between 0 and 1")\r
        return round(amount * (1 - discountRate))\r
\r
    def addTax(amount):\r
        return round(amount * (1 + TAX_RATE))\r
\r
    def calculateOrderTotal(order):\r
        subtotal = calculateSubtotal(order["items"])\r
        discounted = applyDiscount(subtotal, order.get("discountRate", 0))\r
        return addTax(discounted)\r
\r
    order = {\r
        "items": [\r
            {"unitPrice": 10_000, "quantity": 2},\r
            {"unitPrice": 5_000, "quantity": 1},\r
        ],\r
        "discountRate": 0.1,\r
    }\r
\r
    assert calculateSubtotal(order["items"]) == 25_000\r
    assert calculateOrderTotal(order) == 24_750\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 금액 계산 리팩토링 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      TAX_RATE = 0.1\r
\r
      def calculateSubtotal(items):\r
          subtotal = 0\r
          for item in items:\r
              if item["quantity"] <= 0:\r
                  raise ValueError("quantity must be positive")\r
              subtotal += item["unitPrice"] * item["quantity"]\r
          return subtotal\r
\r
      def applyDiscount(amount, discountRate):\r
          if not 0 <= discountRate <= 1:\r
              raise ValueError("discountRate must be between 0 and 1")\r
          return round(amount * (1 - discountRate))\r
\r
      def addTax(amount):\r
          return round(amount * (1 + TAX_RATE))\r
\r
      def calculateOrderTotal(order):\r
          subtotal = calculateSubtotal(order["items"])\r
          discounted = applyDiscount(subtotal, order.get("discountRate", 0))\r
          return addTax(discounted)\r
\r
      order = {\r
          "items": [\r
              {"unitPrice": 10_000, "quantity": 2},\r
              {"unitPrice": 5_000, "quantity": 1},\r
          ],\r
          "discountRate": 0.1,\r
      }\r
\r
      assert calculateSubtotal(order["items"]) == 25_000\r
      assert calculateOrderTotal(order) == 24_750\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 금액 계산 리팩토링의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 금액 계산 리팩토링 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 클린 코드 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Day 29에서 배운 클린 코드 원칙을 난이도별로 복습합니다. 명확한 변수명과 함수명은 코드의 의도를 드러내고, 단일 책임 원칙은 유지보수성을 높입니다. SOLID\r
    원칙과 DRY, KISS는 좋은 설계의 기초이며, 리팩토링은 기술 부채를 줄이는 핵심 활동입니다. 🟢 기본 문제로 변수명 개선, 매직 넘버 제거 등 기초 리팩토링을 연습하고,\r
    🟡 응용 문제로 함수 분리, 클래스 추출을 수행합니다. 🔴 심화 문제에서는 레거시 코드를 SOLID 원칙에 맞게 전면 리팩토링해봅니다. 클린 코드는 읽기 쉽고, 테스트하기 쉽고,\r
    변경하기 쉬운 코드를 만드는 기술입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    d = 7\r
    DAYS_IN_WEEK = 7\r
\r
    l = [1, 2, 3]\r
    userScores = [1, 2, 3]\r
\r
    t = True\r
    isEnabled = True\r
\r
    ex1Result = {"constant": DAYS_IN_WEEK, "list": userScores, "bool": isEnabled}\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      d = 7\r
      DAYS_IN_WEEK = 7\r
\r
      l = [1, 2, 3]\r
      userScores = [1, 2, 3]\r
\r
      t = True\r
      isEnabled = True\r
\r
      ex1Result = {"constant": DAYS_IN_WEEK, "list": userScores, "bool": isEnabled}\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습에서 \`d\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 연습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 29_clean_code-order-total-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - naming
    - function_design
    - error_handling
    - workflow_validation
    title: 주문 금액 계산을 검증 가능한 작은 함수로 나누기
    subtitle: clean calculation design
    goal: calculate_order_total_clean(order)를 완성해 subtotal, discount, tax, total을 명확한 단계로 계산한다.
    why: 클린 코드는 예쁜 이름 붙이기가 아니라, 실패 조건과 계산 단계를 분리해 읽고 검증하고 바꾸기 쉬운 코드로 만드는 일입니다.
    explanation: item의 quantity는 양수여야 하며, discountRate는 0 이상 1 이하입니다. 세율은 10퍼센트로 계산하고 각 중간값을 반환하세요.
    tips:
    - 중간 결과를 반환하면 계산 오류가 어느 단계에서 생겼는지 확인하기 쉽습니다.
    - 잘못된 입력을 조용히 보정하지 말고 ValueError로 거부하세요.
    exercise:
      prompt: calculate_order_total_clean(order)를 완성해 subtotal, discount, tax, total을 반환하세요.
      starterCode: |-
        def calculate_order_total_clean(order):
            raise NotImplementedError
      solution: |-
        def calculate_order_total_clean(order):
            tax_rate = 0.10
            subtotal = 0
            for item in order["items"]:
                if item["quantity"] <= 0:
                    raise ValueError("quantity must be positive")
                subtotal += item["unitPrice"] * item["quantity"]

            discount_rate = order.get("discountRate", 0)
            if not 0 <= discount_rate <= 1:
                raise ValueError("discountRate must be between 0 and 1")

            discount = round(subtotal * discount_rate)
            discounted = subtotal - discount
            tax = round(discounted * tax_rate)
            return {
                "subtotal": subtotal,
                "discount": discount,
                "tax": tax,
                "total": discounted + tax,
            }
      hints:
      - subtotal, discount, tax를 각각 이름 있는 값으로 분리하세요.
      - 입력 검증은 계산 전에 해야 원인을 바로 알 수 있습니다.
    check:
      id: python.advanced.clean-code.order-total.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.clean-code.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: calculate_order_total_clean
        cases:
        - id: returns-named-calculation-steps
          arguments:
          - value:
              items:
              - unitPrice: 10000
                quantity: 2
              - unitPrice: 5000
                quantity: 1
              discountRate: 0.1
          expectedReturn:
            subtotal: 25000
            discount: 2500
            tax: 2250
            total: 24750
        - id: rejects-invalid-quantity
          arguments:
          - value:
              items:
              - unitPrice: 1000
                quantity: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 29_clean_code-function-smell-review-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - conditionals
    - structure
    - refactoring
    title: 함수 smell을 수치 기준으로 리뷰하기
    subtitle: clean code review transfer
    goal: review_function_smells(functions)를 완성해 긴 함수, 많은 매개변수, 복잡한 분기, 숨은 부작용을 판정한다.
    why: 클린 코드 원칙을 다른 코드 리뷰 상황으로 옮기려면 막연한 취향이 아니라 관찰 가능한 신호와 우선순위를 말할 수 있어야 합니다.
    explanation: 각 함수는 name, lines, parameters, branches, sideEffects를 가집니다. issue가 2개 이상이면 highRiskNames에 넣으세요.
    tips:
    - 기준은 완벽한 진리가 아니라 리뷰 대화를 시작하는 신호입니다.
    - send, save, write, log로 시작하는 이름은 부작용을 드러낸 것으로 봅니다.
    exercise:
      prompt: review_function_smells(functions)를 완성해 reviews와 highRiskNames를 반환하세요.
      starterCode: |-
        def review_function_smells(functions):
            raise NotImplementedError
      solution: |-
        def review_function_smells(functions):
            allowed_side_effect_prefixes = ("send", "save", "write", "log")
            reviews = []
            high_risk_names = []
            for function in functions:
                issues = []
                if function["lines"] > 40:
                    issues.append("too-long")
                if function["parameters"] > 4:
                    issues.append("too-many-parameters")
                if function["branches"] > 5:
                    issues.append("complex-branches")
                if function["sideEffects"] and not function["name"].startswith(allowed_side_effect_prefixes):
                    issues.append("hidden-side-effect")
                if len(issues) >= 2:
                    high_risk_names.append(function["name"])
                reviews.append({"name": function["name"], "issues": issues, "issueCount": len(issues)})
            return {"reviews": reviews, "highRiskNames": high_risk_names}
      hints:
      - smell 판정은 한 함수마다 독립적으로 계산한 뒤 high risk를 따로 모으세요.
      - 이름이 부작용을 드러내면 리뷰 위험이 낮아집니다.
    check:
      id: python.advanced.clean-code.function-smell.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.clean-code.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: review_function_smells
        cases:
        - id: flags-high-risk-functions-by-observable-smells
          arguments:
          - value:
            - name: calculateEverything
              lines: 55
              parameters: 6
              branches: 7
              sideEffects: false
            - name: sendReceipt
              lines: 20
              parameters: 3
              branches: 1
              sideEffects: true
            - name: getTotal
              lines: 12
              parameters: 2
              branches: 1
              sideEffects: true
          expectedReturn:
            reviews:
            - name: calculateEverything
              issues:
              - too-long
              - too-many-parameters
              - complex-branches
              issueCount: 3
            - name: sendReceipt
              issues: []
              issueCount: 0
            - name: getTotal
              issues:
              - hidden-side-effect
              issueCount: 1
            highRiskNames:
            - calculateEverything
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 29_clean_code-refactoring-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - naming
    - function_design
    - conditionals
    - error_handling
    - structure
    - refactoring
    title: 클린 코드 리팩토링 선택 기준 회상하기
    subtitle: clean code refactoring recall
    goal: choose_refactoring_move(smell)를 완성해 smell별 리팩토링과 주의점을 반환한다.
    why: 클린 코드는 “좋은 이름” 목록보다, 읽기 어렵게 만드는 신호를 보고 가장 작은 안전한 개선을 고르는 능력입니다.
    explanation: vague-name, long-function, nested-conditional, silent-error, scattered-responsibility, duplicated-logic 상황별 개선을 선택하세요.
    tips:
    - 리팩토링은 동작을 바꾸지 않는 작은 단계로 나눠야 합니다.
    - 에러 처리는 숨기기보다 호출자가 이해할 수 있게 명시합니다.
    exercise:
      prompt: choose_refactoring_move(smell)를 완성해 move, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_refactoring_move(smell):
            raise NotImplementedError
      solution: |-
        def choose_refactoring_move(smell):
            table = {
                "vague-name": {
                    "move": "rename-with-domain-meaning",
                    "useWhen": "a reader cannot infer intent from the name",
                    "caution": "avoid names that describe implementation only",
                },
                "long-function": {
                    "move": "extract-function",
                    "useWhen": "one function mixes several decisions",
                    "caution": "keep extracted functions cohesive",
                },
                "nested-conditional": {
                    "move": "guard-clauses-or-strategy",
                    "useWhen": "indentation hides the main path",
                    "caution": "preserve condition order and edge cases",
                },
                "silent-error": {
                    "move": "explicit-exception-or-result",
                    "useWhen": "failure is swallowed or ambiguous",
                    "caution": "include enough context for debugging",
                },
                "scattered-responsibility": {
                    "move": "move-to-module-or-class",
                    "useWhen": "one concept is spread across files",
                    "caution": "do not create a vague utility bucket",
                },
                "duplicated-logic": {
                    "move": "extract-shared-rule",
                    "useWhen": "the same business rule appears twice",
                    "caution": "confirm the rules are truly the same",
                },
            }
            if smell not in table:
                raise ValueError("unknown clean code smell")
            return table[smell]
      hints:
      - smell을 찾은 뒤 가장 작은 리팩토링 단위를 고르세요.
      - 동작 보존을 확인할 테스트나 예시가 있어야 합니다.
    check:
      id: python.advanced.clean-code.refactoring-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.clean-code.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_refactoring_move
        cases:
        - id: recalls-extract-function-for-long-function
          arguments:
          - value: long-function
          expectedReturn:
            move: extract-function
            useWhen: one function mixes several decisions
            caution: keep extracted functions cohesive
        - id: recalls-explicit-error-for-silent-error
          arguments:
          - value: silent-error
          expectedReturn:
            move: explicit-exception-or-result
            useWhen: failure is swallowed or ambiguous
            caution: include enough context for debugging
        - id: rejects-unknown-smell
          arguments:
          - value: ugly-code
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};