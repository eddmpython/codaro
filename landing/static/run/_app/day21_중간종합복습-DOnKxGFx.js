var e=`meta:\r
  id: day21\r
  title: 중간 종합 복습\r
  day: 21\r
  category: 30days\r
  tags:\r
  - 종합복습\r
  - 자료구조\r
  - 제어문\r
  - 함수\r
  - 파일입출력\r
  - 예외처리\r
  - 검증\r
  seo:\r
    title: 파이썬 중간 종합 복습 - Day 1~20 완전 정복\r
    description: 변수, 자료구조, 제어문, 함수, 모듈, 파일, 예외처리를 종합 복습합니다.\r
    keywords:\r
    - 복습\r
    - 종합\r
    - 정리\r
    - 파이썬기초\r
    - 중간점검\r
intro:\r
  emoji: 🎯\r
  points:\r
  - Day 1~20 핵심 개념 복습\r
  - 자료구조와 제어문 통합\r
  - 함수와 모듈 실전 활용\r
  - 종합 실전 문제\r
  direction: 중간 종합 복습에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.\r
  benefits:\r
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.\r
  - 중간 종합 복습 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 자료구조 복습 입력 확인\r
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.\r
    - label: 제어문 복습 처리 실행\r
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 함수 복습 결과 검증\r
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 중간 종합 복습 재사용\r
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 기초 자동화 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 중간 종합 복습 실행\r
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.\r
    - label: 중간 종합 복습 완료\r
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.\r
sections:\r
- id: data_structures_review\r
  title: 자료구조 복습\r
  structuredPrimary: true\r
  subtitle: 문자열, 리스트, 튜플, 집합, 딕셔너리\r
  goal: 문자열 메서드를 이어 붙이고 마지막에 split으로 리스트를 만들어 자료형이 바뀌는 지점을 확인한다.\r
  why: 원본 데이터는 대부분 한 덩어리 문자열로 들어오기 때문에, 모양을 다듬은 뒤 리스트로 쪼개 두어야 그다음 반복문과 집계로 넘길 수 있습니다.\r
  explanation: 파이썬의 5가지 핵심 자료구조를 복습합니다. 문자열(str), 리스트(list), 튜플(tuple), 집합(set), 딕셔너리(dict)의 특징과 메서드를\r
    다시 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    phrase = "Python Programming"\r
    phrase.lower().replace('p', 'J')\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. phrase 값을 "Python Data Tools"로 바꾸고, 마지막 줄 phrase.lower().replace('p', 'J')를 phrase.upper().split()로 바꾸세요.\r
\r
      전부 대문자로 바꾼 뒤 공백에서 쪼개지므로 아래 리스트가 나와야 합니다.\r
      ['PYTHON', 'DATA', 'TOOLS']\r
    starterCode: |-\r
      phrase = "Python Programming"\r
      phrase.lower().replace('p', 'J')\r
    solution: |-\r
      phrase = "Python Data Tools"\r
      phrase.upper().split()\r
    hints:\r
    - 'phrase 값을 "Python Data Tools" 로 바꾸고, 마지막 줄 전체를 phrase.upper().split() 로 바꿉니다.'\r
    - "정답 형태: phrase.upper().split()"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "['PYTHON', 'DATA', 'TOOLS']"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['PYTHON', 'DATA', 'TOOLS']\\""\r
- id: control_flow_review\r
  title: 제어문 복습\r
  structuredPrimary: true\r
  subtitle: 조건문과 반복문\r
  goal: 값 하나를 판정하던 조건식을 for 루프 안으로 옮겨 목록 전체를 한 번에 등급으로 바꾼다.\r
  why: 판정 규칙은 값 하나에만 쓰이지 않고 보통 목록 전체에 같은 기준을 반복 적용해야 하므로, 조건식과 반복문을 붙여 쓰는 형태가 실제로 가장 많이 나옵니다.\r
  explanation: 조건문(if, elif, else)과 반복문(for, while)을 복습합니다. break, continue, else절을 활용하여 프로그램의 흐름을 제어할\r
    수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    score = 85\r
    'A' if score >= 90 else 'B' if score >= 80 else 'C'\r
  exercise:\r
    prompt: |-\r
      점수 하나를 판정하던 코드를 점수 목록 전체를 판정하는 코드로 바꾸세요. 첫 줄 score = 85를 scores = [95, 72, 88]로 바꾸고, 그 아래에 grades = [] 한 줄을 추가합니다. 이어서 for score in scores: 줄을 넣고, 원래 마지막 줄에 있던 조건식을 그 안에서 grades.append(...)의 괄호 안으로 옮겨 들여씁니다. 맨 마지막 줄에는 grades만 씁니다.\r
\r
      95는 A, 72는 C, 88은 B로 판정되어 아래 리스트가 나와야 합니다.\r
      ['A', 'C', 'B']\r
    starterCode: |-\r
      score = 85\r
      'A' if score >= 90 else 'B' if score >= 80 else 'C'\r
    solution: |-\r
      scores = [95, 72, 88]\r
      grades = []\r
      for score in scores:\r
          grades.append('A' if score >= 90 else 'B' if score >= 80 else 'C')\r
      grades\r
    hints:\r
    - "score = 85 를 scores = [95, 72, 88] 로 바꾸고 그 아래 grades = [] 를 추가한 뒤, for score in scores: 안에서 grades.append(조건식) 을 호출하고 마지막 줄에 grades 를 씁니다."\r
    - "정답 형태: for 루프 안에서 grades.append('A' if score >= 90 else 'B' if score >= 80 else 'C')"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "['A', 'C', 'B']"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['A', 'C', 'B']\\""\r
- id: function_review\r
  title: 함수 복습\r
  structuredPrimary: true\r
  subtitle: def, return, 매개변수, 인자\r
  goal: 매개변수에 기본값을 주어 인자를 하나만 넘겨도 같은 함수가 도는 것을 확인한다.\r
  why: 자주 쓰는 값을 기본값으로 정해 두면 호출할 때마다 같은 숫자를 다시 적지 않아도 되고, 특별한 경우에만 값을 넘겨 덮어쓸 수 있습니다.\r
  explanation: 함수의 정의(def), 반환(return), 매개변수와 인자를 복습합니다. 기본 매개변수, 키워드 인자, *args, **kwargs, lambda까지 다양한\r
    함수 기법을 활용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def multiply(a, b):\r
        return a * b\r
\r
    multiply(7, 8)\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. def multiply(a, b):를 def multiply(a, b=10):으로 바꾸고, 마지막 줄 multiply(7, 8)을 multiply(7)로 바꾸세요. 함수 본문 return a * b는 그대로 둡니다.\r
\r
      b를 넘기지 않으면 기본값 10이 대신 쓰이므로 70이 나와야 합니다.\r
    starterCode: |-\r
      def multiply(a, b):\r
          return a * b\r
\r
      multiply(7, 8)\r
    solution: |-\r
      def multiply(a, b=10):\r
          return a * b\r
\r
      multiply(7)\r
    hints:\r
    - "def 줄의 b 뒤에 =10 을 붙여 def multiply(a, b=10): 으로 만들고, 마지막 줄에서 두 번째 인자를 지워 multiply(7) 로 바꿉니다."\r
    - "정답 형태: def multiply(a, b=10) 과 multiply(7)"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '70'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '70'"\r
- id: module_file_review\r
  title: 모듈과 파일 복습\r
  structuredPrimary: true\r
  subtitle: import, 파일 입출력\r
  goal: import한 pi와 sqrt를 둘 다 써서 원의 넓이와 그 넓이를 가진 정사각형의 한 변을 구한다.\r
  why: from math import로 이름을 여러 개 가져오면 math.를 앞에 붙이지 않고 바로 쓸 수 있어서 계산식이 종이에 쓴 수식과 비슷해집니다.\r
  explanation: 모듈 가져오기(import, from, as)와 파일 입출력(open, read, write, with)을 복습합니다. math, random, datetime\r
    같은 표준 모듈을 활용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from math import sqrt, pi\r
\r
    radius = 4\r
    area = pi * radius ** 2\r
    area\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. radius를 5로 바꾸고, 마지막 줄 area를 round(sqrt(area), 2)로 바꾸세요. import 줄과 area 계산 줄은 그대로 둡니다.\r
\r
      반지름 5인 원의 넓이는 78.53981633974483이고 그 제곱근이 같은 넓이인 정사각형의 한 변입니다. 소수점 둘째 자리까지 반올림하면 8.86이 나와야 합니다.\r
    starterCode: |-\r
      from math import sqrt, pi\r
\r
      radius = 4\r
      area = pi * radius ** 2\r
      area\r
    solution: |-\r
      from math import sqrt, pi\r
\r
      radius = 5\r
      area = pi * radius ** 2\r
      round(sqrt(area), 2)\r
    hints:\r
    - radius = 4 를 radius = 5 로 바꾸고, 마지막 줄 area 를 round(sqrt(area), 2) 로 바꿉니다. sqrt는 첫 줄에서 이미 가져왔으므로 바로 쓸 수 있습니다.\r
    - "정답 형태: round(sqrt(area), 2)"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '8.86'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '8.86'"\r
- id: exception_review\r
  title: 예외 처리 복습\r
  structuredPrimary: true\r
  subtitle: try, except, finally, raise\r
  goal: finally 블록이 return보다 먼저 실행되고 그다음에 값이 돌아오는 순서를 출력으로 확인한다.\r
  why: 파일을 닫거나 기록을 남기는 마무리 작업은 성공했든 예외가 났든 반드시 실행돼야 하는데, finally에 두면 그 보장을 코드로 얻습니다.\r
  explanation: 예외 처리를 통해 오류를 안전하게 처리하는 방법을 복습합니다. try, except, finally, raise를 활용하여 안정적인 프로그램을 작성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def safeDivide(a, b):\r
        try:\r
            return a / b\r
        except ZeroDivisionError:\r
            return 'Cannot divide by zero'\r
\r
    safeDivide(10, 0)\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. except 블록 다음에 try와 같은 열로 finally: 줄을 넣고 그 안에 print('done')을 들여쓰세요. 그리고 마지막 줄 safeDivide(10, 0)을 print(safeDivide(9, 4))로 바꾸세요.\r
\r
      0으로 나누지 않으니 예외가 나지 않고, 값이 돌아가기 전에 finally가 먼저 실행되므로 아래 두 줄이 이 순서로 나와야 합니다.\r
      done\r
      2.25\r
    starterCode: |-\r
      def safeDivide(a, b):\r
          try:\r
              return a / b\r
          except ZeroDivisionError:\r
              return 'Cannot divide by zero'\r
\r
      safeDivide(10, 0)\r
    solution: |-\r
      def safeDivide(a, b):\r
          try:\r
              return a / b\r
          except ZeroDivisionError:\r
              return 'Cannot divide by zero'\r
          finally:\r
              print('done')\r
\r
      print(safeDivide(9, 4))\r
    hints:\r
    - "except 블록 아래에 finally: 를 try 와 같은 열에 쓰고 그 다음 줄에 print('done') 을 들여씁니다. 마지막 줄은 print(safeDivide(9, 4)) 로 바꿉니다."\r
    - "정답 형태: finally 안에 print('done'), 마지막 줄에 print(safeDivide(9, 4))"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: |-\r
      done\r
      2.25\r
    resultCheck: "출력이 정확히 일치해야 합니다: 'done\\n2.25'"\r
- id: integrated_practice\r
  title: 통합 실전 문제\r
  structuredPrimary: true\r
  subtitle: 여러 개념을 종합적으로 활용\r
  goal: 문장을 단어로 쪼개고 딕셔너리로 개수를 센 뒤 정렬된 목록으로 내놓는 흐름을 끝까지 잇는다.\r
  why: 로그 한 줄이나 설문 답변처럼 반복되는 문자열을 셀 때 이 흐름을 그대로 쓰고, 마지막에 정렬해 두면 실행할 때마다 같은 순서로 볼 수 있습니다.\r
  explanation: |-\r
    여러 개념을 함께 활용하는 실전 문제들입니다. 자료구조, 제어문, 함수, 모듈을 통합적으로 사용하여 문제를 해결합니다.\r
\r
    여러 개념을 함께 사용하면 더 강력한 프로그램을 만들 수 있습니다.\r
  snippet: |-\r
    sentence = "python is fun python is powerful"\r
    words = sentence.split()\r
    freq = {}\r
    for word in words:\r
        freq[word] = freq.get(word, 0) + 1\r
    freq\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. sentence를 "data is gold data is oil data wins"로 바꾸고, 마지막 줄 freq를 sorted(freq.items())로 바꾸세요. 가운데 for 루프는 그대로 둡니다.\r
\r
      data가 3번, is가 2번, 나머지가 1번씩 세어지고 단어 순으로 정렬되어 아래 한 줄이 나와야 합니다.\r
      [('data', 3), ('gold', 1), ('is', 2), ('oil', 1), ('wins', 1)]\r
    starterCode: |-\r
      sentence = "python is fun python is powerful"\r
      words = sentence.split()\r
      freq = {}\r
      for word in words:\r
          freq[word] = freq.get(word, 0) + 1\r
      freq\r
    solution: |-\r
      sentence = "data is gold data is oil data wins"\r
      words = sentence.split()\r
      freq = {}\r
      for word in words:\r
          freq[word] = freq.get(word, 0) + 1\r
      sorted(freq.items())\r
    hints:\r
    - 'sentence 값을 "data is gold data is oil data wins" 로 바꾸고, 마지막 줄 freq 를 sorted(freq.items()) 로 바꿉니다.'\r
    - "정답 형태: sorted(freq.items())"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "[('data', 3), ('gold', 1), ('is', 2), ('oil', 1), ('wins', 1)]"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"[('data', 3), ('gold', 1), ('is', 2), ('oil', 1), ('wins', 1)]\\""\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 데이터를 정제하고 리포트 만들기'\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 정제, 집계, 예외, 파일 쓰기를 한 흐름으로 잇고 단계마다 기대값을 assert로 못박아 실행한다.\r
  why: 단계가 여러 개인 코드는 중간 한 곳만 어긋나도 마지막 숫자만 봐서는 어디서 틀렸는지 알 수 없으므로, 단계마다 기대값을 assert로 박아 두면 틀린 지점에서 바로 멈춥니다.\r
  explanation: 중간 복습에서는 문법을 따로따로 외우는 것보다, 작은 업무 흐름을 끝까지 통과시키는지가 중요합니다. 아래 코드는 문자열 정제, 딕셔너리 검증, 함수 분리,\r
    반복문, 예외 처리, 파일 입출력을 한 번에 연결합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pathlib import Path\r
    import tempfile\r
\r
    rawOrders = [\r
        {"id": " A-100 ", "status": " PAID ", "amount": "12000"},\r
        {"id": "A-101", "status": "cancelled", "amount": "8000"},\r
        {"id": "A-102", "status": "paid", "amount": "15000"},\r
    ]\r
\r
    def normalizeOrder(row):\r
        requiredKeys = {"id", "status", "amount"}\r
        missingKeys = sorted(requiredKeys - set(row))\r
        if missingKeys:\r
            raise KeyError(f"missing keys: {missingKeys}")\r
\r
        orderId = row["id"].strip()\r
        status = row["status"].strip().lower()\r
\r
        try:\r
            amount = int(row["amount"])\r
        except ValueError as exc:\r
            raise ValueError(f"invalid amount: {row['amount']}") from exc\r
\r
        return {"id": orderId, "status": status, "amount": amount}\r
\r
    def summarizePaidOrders(orders):\r
        paidIds = []\r
        paidAmount = 0\r
\r
        for order in orders:\r
            if order["status"] != "paid":\r
                continue\r
            paidIds.append(order["id"])\r
            paidAmount += order["amount"]\r
\r
        return {\r
            "paidCount": len(paidIds),\r
            "paidAmount": paidAmount,\r
            "paidIds": paidIds,\r
        }\r
\r
    normalizedOrders = []\r
    for row in rawOrders:\r
        normalizedOrders.append(normalizeOrder(row))\r
    summary = summarizePaidOrders(normalizedOrders)\r
\r
    assert summary["paidCount"] == 2\r
    assert summary["paidAmount"] == 27000\r
    assert summary["paidIds"] == ["A-100", "A-102"]\r
\r
    try:\r
        normalizeOrder({"id": "A-999", "status": "paid", "amount": "twelve"})\r
    except ValueError as exc:\r
        assert "invalid amount" in str(exc)\r
\r
    with tempfile.TemporaryDirectory() as tempDir:\r
        reportPath = Path(tempDir) / "midReviewReport.txt"\r
        reportPath.write_text(\r
            f"paidCount={summary['paidCount']}\\npaidAmount={summary['paidAmount']}",\r
            encoding="utf-8",\r
        )\r
        loadedReport = reportPath.read_text(encoding="utf-8")\r
\r
    assert "paidCount=2" in loadedReport\r
    assert "paidAmount=27000" in loadedReport\r
    print("중간 복습 흐름 통과")\r
  exercise:\r
    prompt: |-\r
      값은 바꾸지 말고 코드를 그대로 실행하세요. 어디를 고치면 어떤 assert가 멈추는지는 실행이 통과한 다음에 확인하세요.\r
\r
      paid 주문 2건, 합계 27000, 잘못된 금액의 ValueError, 파일에 쓰고 다시 읽은 내용까지 assert가 전부 통과하면 마지막 줄에서 아래 문구가 출력되어야 합니다.\r
      중간 복습 흐름 통과\r
    starterCode: |-\r
      from pathlib import Path\r
      import tempfile\r
\r
      rawOrders = [\r
          {"id": " A-100 ", "status": " PAID ", "amount": "12000"},\r
          {"id": "A-101", "status": "cancelled", "amount": "8000"},\r
          {"id": "A-102", "status": "paid", "amount": "15000"},\r
      ]\r
\r
      def normalizeOrder(row):\r
          requiredKeys = {"id", "status", "amount"}\r
          missingKeys = sorted(requiredKeys - set(row))\r
          if missingKeys:\r
              raise KeyError(f"missing keys: {missingKeys}")\r
\r
          orderId = row["id"].strip()\r
          status = row["status"].strip().lower()\r
\r
          try:\r
              amount = int(row["amount"])\r
          except ValueError as exc:\r
              raise ValueError(f"invalid amount: {row['amount']}") from exc\r
\r
          return {"id": orderId, "status": status, "amount": amount}\r
\r
      def summarizePaidOrders(orders):\r
          paidIds = []\r
          paidAmount = 0\r
\r
          for order in orders:\r
              if order["status"] != "paid":\r
                  continue\r
              paidIds.append(order["id"])\r
              paidAmount += order["amount"]\r
\r
          return {\r
              "paidCount": len(paidIds),\r
              "paidAmount": paidAmount,\r
              "paidIds": paidIds,\r
          }\r
\r
      normalizedOrders = []\r
      for row in rawOrders:\r
          normalizedOrders.append(normalizeOrder(row))\r
      summary = summarizePaidOrders(normalizedOrders)\r
\r
      assert summary["paidCount"] == 2\r
      assert summary["paidAmount"] == 27000\r
      assert summary["paidIds"] == ["A-100", "A-102"]\r
\r
      try:\r
          normalizeOrder({"id": "A-999", "status": "paid", "amount": "twelve"})\r
      except ValueError as exc:\r
          assert "invalid amount" in str(exc)\r
\r
      with tempfile.TemporaryDirectory() as tempDir:\r
          reportPath = Path(tempDir) / "midReviewReport.txt"\r
          reportPath.write_text(\r
              f"paidCount={summary['paidCount']}\\npaidAmount={summary['paidAmount']}",\r
              encoding="utf-8",\r
          )\r
          loadedReport = reportPath.read_text(encoding="utf-8")\r
\r
      assert "paidCount=2" in loadedReport\r
      assert "paidAmount=27000" in loadedReport\r
      print("중간 복습 흐름 통과")\r
    solution: |-\r
      from pathlib import Path\r
      import tempfile\r
\r
      rawOrders = [\r
          {"id": " A-100 ", "status": " PAID ", "amount": "12000"},\r
          {"id": "A-101", "status": "cancelled", "amount": "8000"},\r
          {"id": "A-102", "status": "paid", "amount": "15000"},\r
      ]\r
\r
      def normalizeOrder(row):\r
          requiredKeys = {"id", "status", "amount"}\r
          missingKeys = sorted(requiredKeys - set(row))\r
          if missingKeys:\r
              raise KeyError(f"missing keys: {missingKeys}")\r
\r
          orderId = row["id"].strip()\r
          status = row["status"].strip().lower()\r
\r
          try:\r
              amount = int(row["amount"])\r
          except ValueError as exc:\r
              raise ValueError(f"invalid amount: {row['amount']}") from exc\r
\r
          return {"id": orderId, "status": status, "amount": amount}\r
\r
      def summarizePaidOrders(orders):\r
          paidIds = []\r
          paidAmount = 0\r
\r
          for order in orders:\r
              if order["status"] != "paid":\r
                  continue\r
              paidIds.append(order["id"])\r
              paidAmount += order["amount"]\r
\r
          return {\r
              "paidCount": len(paidIds),\r
              "paidAmount": paidAmount,\r
              "paidIds": paidIds,\r
          }\r
\r
      normalizedOrders = []\r
      for row in rawOrders:\r
          normalizedOrders.append(normalizeOrder(row))\r
      summary = summarizePaidOrders(normalizedOrders)\r
\r
      assert summary["paidCount"] == 2\r
      assert summary["paidAmount"] == 27000\r
      assert summary["paidIds"] == ["A-100", "A-102"]\r
\r
      try:\r
          normalizeOrder({"id": "A-999", "status": "paid", "amount": "twelve"})\r
      except ValueError as exc:\r
          assert "invalid amount" in str(exc)\r
\r
      with tempfile.TemporaryDirectory() as tempDir:\r
          reportPath = Path(tempDir) / "midReviewReport.txt"\r
          reportPath.write_text(\r
              f"paidCount={summary['paidCount']}\\npaidAmount={summary['paidAmount']}",\r
              encoding="utf-8",\r
          )\r
          loadedReport = reportPath.read_text(encoding="utf-8")\r
\r
      assert "paidCount=2" in loadedReport\r
      assert "paidAmount=27000" in loadedReport\r
      print("중간 복습 흐름 통과")\r
    hints:\r
    - 금액이나 status 값을 바꾸면 대응하는 assert가 AssertionError로 멈춥니다. 그때는 원래 값으로 되돌리세요.\r
    - "정답 형태: 코드를 그대로 실행, 출력은 중간 복습 흐름 통과"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: '중간 복습 흐름 통과'\r
    resultCheck: "출력이 정확히 일치해야 합니다: '중간 복습 흐름 통과'"\r
- id: practice\r
  title: Day 21 종합 복습\r
  structuredPrimary: true\r
  subtitle: 중간 점검 완전 정복\r
  goal: 앞뒤 공백을 걷어내고 단어마다 첫 글자를 대문자로 바꾼 뒤 리스트로 쪼개는 세 단계를 한 줄로 잇는다.\r
  why: 사람이 입력한 이름이나 제목은 공백과 대소문자가 제각각이라, 저장하기 전에 같은 모양으로 다듬어 두어야 나중에 비교와 정렬이 어긋나지 않습니다.\r
  explanation: Day 1~20까지 배운 모든 개념을 종합적으로 복습합니다. 🟢 기본 미션으로 핵심 개념을 확인하고, 🟡 응용 미션으로 활용 능력을 키우고, 🔴 심화 미션으로\r
    통합 사고력을 키웁니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    text = "  Hello World  "\r
    text.strip().upper()\r
  exercise:\r
    prompt: |-\r
      두 곳을 고치세요. text를 "  codaro python study  "로 바꾸고(앞뒤 공백 두 칸은 그대로 남겨 둡니다), 마지막 줄 text.strip().upper()를 text.strip().title().split()로 바꾸세요.\r
\r
      앞뒤 공백이 지워지고 단어마다 첫 글자가 대문자가 된 뒤 공백에서 쪼개지므로 아래 리스트가 나와야 합니다.\r
      ['Codaro', 'Python', 'Study']\r
    starterCode: |-\r
      text = "  Hello World  "\r
      text.strip().upper()\r
    solution: |-\r
      text = "  codaro python study  "\r
      text.strip().title().split()\r
    hints:\r
    - 'text 값을 "  codaro python study  " 로 바꾸고, 마지막 줄의 upper() 를 title() 로 바꾼 뒤 그 뒤에 .split() 을 붙입니다.'\r
    - "정답 형태: text.strip().title().split()"\r
  check:\r
    type: outputExact\r
    evidence: practice\r
    outputExact: "['Codaro', 'Python', 'Study']"\r
    resultCheck: "출력이 정확히 일치해야 합니다: \\"['Codaro', 'Python', 'Study']\\""\r
- id: reflection\r
  title: Day 21 회고 - 중간 종합 점검\r
  structuredPrimary: true\r
  subtitle: 기억 굳히기\r
  goal: Day 1부터 20까지 중 자신이 가장 자주 막혔던 영역 하나를 고르고, 그 영역으로 다음 주에 만들 것을 한 줄로 정한다.\r
  why: 막혔던 자리를 적어 두지 않으면 다음에도 같은 자리에서 막히고, 만들 것을 미리 정해 두면 다음 복습이 막연한 다시 읽기가 아니라 실제 코드 작성이 됩니다.\r
  explanation: Day 1-20에서 다룬 print, 변수, 자료형, 문자열, 리스트/딕셔너리, 조건문, 반복문, 함수, 파일입출력 중에서 가장 자주 막혔던 영역을 한 가지만 적고, 다음 주에 이 영역으로 무엇을 만들지 한 줄로 계획해보세요.\r
  reflection:\r
    prompt: 가장 약한 영역 1개 + 그 영역으로 다음 주에 만들 작은 자동화 1개를 적어주세요.\r
    expectedKeywords:\r
    - 약점\r
    - 자동화\r
    aiFollowup: 학습자가 고른 약한 영역에 해당하는 Day 강의 ID 1-2개를 안내하고 자동화 아이디어를 한 줄 짧게 강화한다.\r
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
  - id: day21-summarize-orders-mastery\r
    mode: mastery\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - data_structures_review\r
    - reflection\r
    title: 주문 목록을 한 번에 요약하기\r
    subtitle: 예시 없이 핵심 규칙 완성\r
    goal: 리스트와 딕셔너리, 조건, 합계를 결합한다.\r
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.\r
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: summarize_orders(orders)가 주문 수, 전체 금액, paid 주문 수를 딕셔너리로 반환하도록 완성하세요.\r
      starterCode: |-\r
        def summarize_orders(orders):\r
            raise NotImplementedError\r
      solution: |-\r
        def summarize_orders(orders):\r
            return {\r
                'count': len(orders),\r
                'total': sum(order['amount'] for order in orders),\r
                'paid': sum(1 for order in orders if order['status'] == 'paid'),\r
            }\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day21.summarize-orders.mastery.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day21.summarize-orders.mastery.behavior.v1.fixture\r
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
        entry: summarize_orders\r
        cases:\r
        - id: mixed\r
          arguments:\r
          - value:\r
            - amount: 1000\r
              status: paid\r
            - amount: 2500\r
              status: pending\r
          expectedReturn:\r
            count: 2\r
            total: 3500\r
            paid: 1\r
        - id: empty\r
          arguments:\r
          - value: []\r
          expectedReturn:\r
            count: 0\r
            total: 0\r
            paid: 0\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
  transferVariants:\r
  - id: day21-group-totals-transfer\r
    mode: transfer\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - day21-summarize-orders-mastery\r
    title: 범주별 금액 합계 만들기\r
    subtitle: 처음 보는 조건에 개념 적용\r
    goal: 반복 누적을 처음 보는 레코드 그룹화에 적용한다.\r
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.\r
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: group_totals(rows)가 category별 amount 합계를 딕셔너리로 반환하도록 완성하세요.\r
      starterCode: |-\r
        def group_totals(rows):\r
            raise NotImplementedError\r
      solution: |-\r
        def group_totals(rows):\r
            totals = {}\r
            for row in rows:\r
                category = row['category']\r
                totals[category] = totals.get(category, 0) + row['amount']\r
            return totals\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day21.group-totals.transfer.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day21.group-totals.transfer.behavior.v1.fixture\r
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
        entry: group_totals\r
        cases:\r
        - id: sales\r
          arguments:\r
          - value:\r
            - category: book\r
              amount: 10\r
            - category: pen\r
              amount: 3\r
            - category: book\r
              amount: 7\r
          expectedReturn:\r
            book: 17\r
            pen: 3\r
        - id: single\r
          arguments:\r
          - value:\r
            - category: file\r
              amount: 5\r
          expectedReturn:\r
            file: 5\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
  retrievalVariants:\r
  - id: day21-normalize-records-retrieval\r
    mode: retrieval\r
    unseen: true\r
    claimScope: portable-concept\r
    reviewStatus: machine-verified-pending-independent-review\r
    sourceSectionIds:\r
    - day21-group-totals-transfer\r
    title: 튜플 레코드를 정렬된 문구로 정리하기\r
    subtitle: 7일 뒤 기억에서 재구성\r
    goal: 컬렉션 문법을 기억에서 다시 연결한다.\r
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.\r
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.\r
    tips:\r
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.\r
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.\r
    exercise:\r
      prompt: normalize_records(records)가 (name, score)를 score 내림차순의 'name:score' 목록으로 반환하도록 완성하세요.\r
      starterCode: |-\r
        def normalize_records(records):\r
            raise NotImplementedError\r
      solution: |-\r
        def normalize_records(records):\r
            ordered = sorted(records, key=lambda item: item[1], reverse=True)\r
            return [f"{name}:{score}" for name, score in ordered]\r
      hints:\r
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.\r
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.\r
    check:\r
      id: python.30days.day21.normalize-records.retrieval.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.30days.day21.normalize-records.retrieval.behavior.v1.fixture\r
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
        entry: normalize_records\r
        cases:\r
        - id: scores\r
          arguments:\r
          - value:\r
            - - Mina\r
              - 80\r
            - - Jun\r
              - 95\r
          expectedReturn:\r
          - Jun:95\r
          - Mina:80\r
        - id: tie-order\r
          arguments:\r
          - value:\r
            - - A\r
              - 10\r
            - - B\r
              - 20\r
            - - C\r
              - 15\r
          expectedReturn:\r
          - B:20\r
          - C:15\r
          - A:10\r
        expectedPaths: []\r
        normalizeReturnPaths: []\r
    minimumDelayHours: 168\r
`;export{e as default};