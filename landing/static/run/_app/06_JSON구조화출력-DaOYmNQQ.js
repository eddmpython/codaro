var e=`meta:\r
  packages:\r
  - anthropic\r
  id: llmBasics_06\r
  title: JSON구조화출력\r
  order: 6\r
  category: llmBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - anthropic\r
  - json\r
  - 구조화출력\r
  - 스키마\r
  seo:\r
    title: Claude JSON 구조화 출력 - 자동화에서 안전한 응답 받기\r
    description: 시스템 프롬프트와 응답 prefill로 JSON 출력을 유도하고 json.loads로 파싱하는 표준 흐름을 익힙니다.\r
    keywords:\r
    - JSON output\r
    - structured output\r
    - Claude JSON\r
    - response parsing\r
intro:\r
  emoji: 📦\r
  goal: JSON만 출력하도록 모델을 유도하고 안전하게 파싱한다.\r
  description: 자동화의 다음 단계가 코드라면 응답은 JSON이어야 합니다. 프롬프트 설계, prefill, 파싱 검증, 재시도까지 한 흐름으로 묶습니다.\r
  direction: 자유 응답 → JSON 강제 system → assistant prefill → 검증·재시도 함수 순으로 발전시킨다.\r
  benefits:\r
  - JSON만 출력하도록 system 프롬프트를 작성하는 패턴을 익힌다.\r
  - assistant prefill로 응답 시작 토큰을 고정해 적중률을 올린다.\r
  - json.loads 실패에 대비하는 검증·재시도 함수를 만든다.\r
  - 자동화 파이프라인에서 다음 단계 코드로 바로 넘길 수 있는 사전을 만든다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 자유 응답 baseline\r
      detail: 자연어 응답에 JSON 비슷한 문자열이 섞이는 모양을 본다.\r
    - label: 2단계. JSON 강제 system\r
      detail: system에 키 목록과 출력 형식을 명시한다.\r
    - label: 3단계. assistant prefill\r
      detail: messages 마지막에 assistant 빈 시작을 넣어 응답을 JSON으로 강제한다.\r
    - label: 4단계. 검증과 재시도\r
      detail: json.loads 실패 시 한 번 재시도하는 함수를 만든다.\r
    runtime:\r
    - label: LLM 호출 환경\r
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.\r
    - label: JSON구조화출력 실행\r
      detail: 응답이 JSON으로 파싱되는지 한 단계씩 확인한다.\r
    - label: JSON구조화출력 완료\r
      detail: 도구 사용·종합 자동화에서 바로 재사용 가능한 파서 함수를 갖춘다.\r
sections:\r
- id: free_form_baseline\r
  title: 1단계. 자유 응답 baseline\r
  structuredPrimary: true\r
  subtitle: JSON 강제 없이 부탁만 해보기\r
  goal: JSON으로 답해 달라는 자연어 부탁만으로 보낸 응답에서 파싱이 어떻게 깨질 수 있는지 본다.\r
  why: 강제 없이 부탁만 하면 모델이 종종 자연어 설명을 함께 답합니다. json.loads가 실패하는 모양을 직접 보면 prefill의 가치가 분명해집니다.\r
  explanation: user 메시지에 JSON 출력 요청만 넣고 시스템 프롬프트는 비웁니다. 응답은 보통 JSON 비슷한 모양이지만 코드 블록 마크다운(\`\`\`json) 또는 앞뒤\r
    설명이 붙기도 합니다. 첫 try-except로 파싱이 깨질 수 있다는 사실을 코드로 확인합니다.\r
  tips:\r
  - json.loads는 마크다운 코드 블록을 그대로 받아 ValueError를 냅니다. 파싱 실패 처리가 필수입니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    client = anthropic.Anthropic()\r
    request = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        messages=[{"role": "user", "content": "주문 정보 한 건을 JSON으로 만들어 줘. 키는 orderId, customer, amount."}],\r
    )\r
    rawText = "".join(block.text for block in request.content if block.type == "text")\r
    try:\r
        parsed = json.loads(rawText)\r
        parseStatus = "ok"\r
    except json.JSONDecodeError as exc:\r
        parsed = None\r
        parseStatus = f"fail: {exc.msg}"\r
    (parseStatus, rawText[:80])\r
  exercise:\r
    prompt: 같은 호출을 두세 번 반복해 rawText 모양이 매번 같은지 본다.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      client = anthropic.Anthropic()\r
      request = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          messages=[{"role": "user", "content": "주문 정보 한 건을 JSON으로 만들어 줘. 키는 orderId, customer, amount."}],\r
      )\r
      rawText = "".join(block.text for block in request.content if block.type == "text")\r
      try:\r
          parsed = json.loads(rawText)\r
          parseStatus = "ok"\r
      except json.JSONDecodeError as exc:\r
          parsed = None\r
          parseStatus = f"fail: {exc.msg}"\r
      (parseStatus, rawText[:80])\r
    hints:\r
    - 매번 ok가 나오기도 하고 fail이 나오기도 합니다. 그게 강제가 필요한 이유입니다.\r
    - 응답 변수명은 호출마다 다른 이름을 사용해야 합니다.\r
  check:\r
    noError: 호출과 파싱 시도가 예외 없이 끝까지 완료되어야 합니다.\r
    resultCheck: rawText가 비어있지 않은 문자열이고 parseStatus가 "ok" 또는 "fail:..."이어야 합니다.\r
- id: strict_system\r
  title: 2단계. JSON 강제 system 프롬프트\r
  structuredPrimary: true\r
  subtitle: 키 목록과 출력 형식 명시\r
  goal: system에 출력 키 목록과 "JSON 외 텍스트 금지"를 명시해 응답이 JSON으로만 오도록 유도한다.\r
  why: 형식 강제는 코드 자동화의 안전장치입니다. 한 번 system을 잘 써 두면 호출 코드는 단순해지고 적중률이 높아집니다.\r
  explanation: system에 "응답은 valid JSON 한 줄만, 코드 블록 마크다운 금지, 추가 설명 금지"라고 명시합니다. 키 목록은 마지막 줄에 명시해 모델이 마지막\r
    지시를 강하게 받아들이도록 합니다. 적중률이 매우 높아지지만 100%는 아니므로 다음 단계의 prefill과 검증이 필요합니다.\r
  tips:\r
  - system은 입력 토큰 비용을 늘립니다. 7번 강의의 캐싱이 이 비용을 줄여줍니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    strictSystem = (\r
        "너는 데이터 추출 도구야. "\r
        "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운(\`\`\`json) 또는 추가 설명을 절대 넣지 마. "\r
        "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
    )\r
\r
    client = anthropic.Anthropic()\r
    strictResult = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        system=strictSystem,\r
        messages=[{"role": "user", "content": "주문 정보 한 건을 만들어 줘."}],\r
    )\r
    strictText = "".join(block.text for block in strictResult.content if block.type == "text")\r
    try:\r
        strictParsed = json.loads(strictText)\r
        strictStatus = "ok"\r
    except json.JSONDecodeError as exc:\r
        strictParsed = None\r
        strictStatus = f"fail: {exc.msg}"\r
    (strictStatus, strictText[:120])\r
  exercise:\r
    prompt: strictSystem에 "amount는 1000 이상의 정수" 같은 제약을 추가하고 응답이 그 제약을 따르는지 확인하세요.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      strictSystem = (\r
          "너는 데이터 추출 도구야. "\r
          "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운(\`\`\`json) 또는 추가 설명을 절대 넣지 마. "\r
          "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
      )\r
\r
      client = anthropic.Anthropic()\r
      strictResult = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          system=strictSystem,\r
          messages=[{"role": "user", "content": "주문 정보 한 건을 만들어 줘."}],\r
      )\r
      strictText = "".join(block.text for block in strictResult.content if block.type == "text")\r
      try:\r
          strictParsed = json.loads(strictText)\r
          strictStatus = "ok"\r
      except json.JSONDecodeError as exc:\r
          strictParsed = None\r
          strictStatus = f"fail: {exc.msg}"\r
      (strictStatus, strictText[:120])\r
    hints:\r
    - 새 system은 변수명을 strictSystemPlus 같은 다른 이름으로 만들어 비교하면 좋습니다.\r
    - 제약을 명시할수록 모델 적중률이 높아지지만 토큰도 살짝 늘어납니다.\r
  check:\r
    noError: 호출과 파싱 시도가 정상 실행되어야 합니다.\r
    resultCheck: strictStatus가 "ok"일 가능성이 높고 strictText가 JSON 모양 문자열이어야 합니다.\r
- id: assistant_prefill\r
  title: 3단계. assistant prefill로 응답 시작 고정\r
  structuredPrimary: true\r
  subtitle: messages 마지막에 빈 assistant 넣기\r
  goal: messages 마지막에 assistant 메시지를 빈 "{"로 시작해 응답이 그 자리부터 이어지도록 강제한다.\r
  why: prefill은 가장 강력한 형식 강제 도구입니다. 모델이 그 시작 토큰부터 이어 쓰기 때문에 JSON 모양이 거의 깨지지 않습니다.\r
  explanation: Messages API는 마지막 메시지의 역할이 user이든 assistant이든 모두 받습니다. 마지막을 assistant로 주고 content를 "{"로 채우면\r
    모델은 그 자리부터 이어 씁니다. 응답은 "{"가 빠진 상태로 오므로 호출 측에서 "{"를 다시 붙여 json.loads에 넘깁니다.\r
  tips:\r
  - prefill 응답은 "{ ... }" 시작이 빠진 형태로 옵니다. raw 응답에 "{"를 다시 prepend하는 게 핵심입니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    strictSystem = (\r
        "너는 데이터 추출 도구야. "\r
        "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운 또는 추가 설명을 절대 넣지 마. "\r
        "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
    )\r
\r
    client = anthropic.Anthropic()\r
    prefillResult = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        system=strictSystem,\r
        messages=[\r
            {"role": "user", "content": "주문 정보 한 건을 만들어 줘."},\r
            {"role": "assistant", "content": "{"},\r
        ],\r
    )\r
    prefillRaw = "".join(block.text for block in prefillResult.content if block.type == "text")\r
    prefillJsonText = "{" + prefillRaw\r
    prefillParsed = json.loads(prefillJsonText)\r
    prefillParsed\r
  exercise:\r
    prompt: prefill을 "{\\"orderId\\":" 형태로 키 하나까지 미리 채워 응답이 그 자리부터 시작되는지 확인하세요.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      strictSystem = (\r
          "너는 데이터 추출 도구야. "\r
          "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운 또는 추가 설명을 절대 넣지 마. "\r
          "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
      )\r
\r
      client = anthropic.Anthropic()\r
      prefillResult = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          system=strictSystem,\r
          messages=[\r
              {"role": "user", "content": "주문 정보 한 건을 만들어 줘."},\r
              {"role": "assistant", "content": "{"},\r
          ],\r
      )\r
      prefillRaw = "".join(block.text for block in prefillResult.content if block.type == "text")\r
      prefillJsonText = "{" + prefillRaw\r
      prefillParsed = json.loads(prefillJsonText)\r
      prefillParsed\r
    hints:\r
    - assistant content를 "{\\"orderId\\": \\""로 두면 모델이 그 자리부터 이어 씁니다.\r
    - 응답에 prefill 텍스트를 다시 붙여 완전한 JSON 문자열을 만듭니다.\r
  check:\r
    noError: prefill 호출과 json.loads가 정상 실행되어야 합니다.\r
    resultCheck: prefillParsed가 dict이고 orderId, customer, amount 키를 포함해야 합니다.\r
- id: parse_retry\r
  title: 4단계. 검증과 한 번 재시도\r
  structuredPrimary: true\r
  subtitle: 파싱 실패 시 재호출\r
  goal: extractJson 함수로 파싱 실패 시 한 번 재호출하는 안전한 흐름을 만든다.\r
  why: 모델 적중률이 99%여도 자동화에서는 1%가 시스템을 멈춥니다. 재시도 한 번이 안정성을 크게 올립니다.\r
  explanation: 첫 호출이 json.loads에 실패하면 같은 system/prompt로 한 번 더 호출합니다. 두 번째도 실패하면 raw 응답을 함께 ValueError로\r
    던져 호출자가 알 수 있게 합니다. 재시도는 최대 한 번으로 제한해 무한 반복을 막습니다.\r
  tips:\r
  - 재시도 전에 system에 "직전 응답이 JSON 파싱에 실패했다"는 힌트를 추가하면 재시도 성공률이 올라갑니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    strictSystem = (\r
        "너는 데이터 추출 도구야. "\r
        "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운 또는 추가 설명을 절대 넣지 마. "\r
        "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
    )\r
\r
    def extractJson(client, userText: str) -> dict:\r
        for attempt in range(2):\r
            result = client.messages.create(\r
                model="claude-haiku-4-5",\r
                max_tokens=200,\r
                system=strictSystem,\r
                messages=[\r
                    {"role": "user", "content": userText},\r
                    {"role": "assistant", "content": "{"},\r
                ],\r
            )\r
            raw = "".join(block.text for block in result.content if block.type == "text")\r
            try:\r
                return json.loads("{" + raw)\r
            except json.JSONDecodeError:\r
                if attempt == 1:\r
                    raise ValueError(f"failed twice to parse JSON: {raw[:120]}")\r
        return {}\r
\r
    client = anthropic.Anthropic()\r
    extracted = extractJson(client, "성공한 결제 한 건을 만들어 줘.")\r
    assert isinstance(extracted, dict)\r
    assert "orderId" in extracted\r
    extracted\r
  exercise:\r
    prompt: extractJson에 maxRetries 인자를 추가해 호출자가 재시도 횟수를 정할 수 있게 만드세요. 기본값은 1입니다.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      strictSystem = (\r
          "너는 데이터 추출 도구야. "\r
          "응답은 valid JSON 객체 한 개만 출력하고, 코드 블록 마크다운 또는 추가 설명을 절대 넣지 마. "\r
          "JSON의 키는 정확히 orderId, customer, amount 세 개만 사용해."\r
      )\r
\r
      def extractJson(client, userText: str) -> dict:\r
          for attempt in range(2):\r
              result = client.messages.create(\r
                  model="claude-haiku-4-5",\r
                  max_tokens=200,\r
                  system=strictSystem,\r
                  messages=[\r
                      {"role": "user", "content": userText},\r
                      {"role": "assistant", "content": "{"},\r
                  ],\r
              )\r
              raw = "".join(block.text for block in result.content if block.type == "text")\r
              try:\r
                  return json.loads("{" + raw)\r
              except json.JSONDecodeError:\r
                  if attempt == 1:\r
                      raise ValueError(f"failed twice to parse JSON: {raw[:120]}")\r
          return {}\r
\r
      client = anthropic.Anthropic()\r
      extracted = extractJson(client, "성공한 결제 한 건을 만들어 줘.")\r
      assert isinstance(extracted, dict)\r
      assert "orderId" in extracted\r
      extracted\r
    hints:\r
    - 함수 시그니처에 maxRetries=1을 추가하고 for 루프 한계를 maxRetries+1로 둡니다.\r
    - 마지막 시도에서만 ValueError를 던지도록 조건을 정합니다.\r
  check:\r
    noError: 함수 정의와 호출이 정상 실행되어야 합니다.\r
    resultCheck: extracted가 dict이고 필수 키 orderId를 포함해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 사용자 설명 → 구조화 주문 변환'\r
  structuredPrimary: true\r
  subtitle: 자연어를 안전한 JSON으로\r
  goal: 민준이가 12만원짜리 책을 결제했다는 자연어 한 줄을 JSON 주문 한 건으로 변환하는 함수를 만든다.\r
  why: 자연어 → 구조화 데이터 변환은 LLM 자동화의 핵심 패턴입니다. 작은 함수 한 개로 완성해 두면 어디든 붙입니다.\r
  explanation: 입력은 자연어 한 줄, 출력은 orderId/customer/amount 세 키를 가진 사전입니다. system 강제 + prefill + 재시도로 함수를 만들고\r
    assert로 결과 모양을 고정합니다.\r
  tips:\r
  - amount가 문자열로 올 수 있으니 int 변환을 마지막에 합니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    def parseOrderText(rawSentence: str) -> dict:\r
        agent = anthropic.Anthropic()\r
        system = (\r
            "너는 자연어를 JSON 주문으로 바꾸는 추출기야. "\r
            "응답은 정확히 키 orderId, customer, amount를 가진 JSON 한 개만. "\r
            "amount는 숫자만 적어. 코드 블록이나 추가 설명 금지."\r
        )\r
        for attempt in range(2):\r
            result = agent.messages.create(\r
                model="claude-haiku-4-5",\r
                max_tokens=200,\r
                system=system,\r
                messages=[\r
                    {"role": "user", "content": rawSentence},\r
                    {"role": "assistant", "content": "{"},\r
                ],\r
            )\r
            rawText = "".join(block.text for block in result.content if block.type == "text")\r
            try:\r
                parsed = json.loads("{" + rawText)\r
                parsed["amount"] = int(parsed["amount"])\r
                return parsed\r
            except (json.JSONDecodeError, KeyError, ValueError, TypeError):\r
                if attempt == 1:\r
                    raise ValueError(f"parseOrderText failed: {rawText[:120]}")\r
        return {}\r
\r
    order = parseOrderText("민준이가 12만원짜리 책 결제했어. 주문번호는 A-100이야.")\r
    assert order["amount"] >= 100000\r
    assert "민준" in order["customer"]\r
    order\r
  exercise:\r
    prompt: parseOrderText의 system에 currency 키를 추가해 통화 단위를 포함시키고 amount 통화를 함께 검증하세요.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      def parseOrderText(rawSentence: str) -> dict:\r
          agent = anthropic.Anthropic()\r
          system = (\r
              "너는 자연어를 JSON 주문으로 바꾸는 추출기야. "\r
              "응답은 정확히 키 orderId, customer, amount를 가진 JSON 한 개만. "\r
              "amount는 숫자만 적어. 코드 블록이나 추가 설명 금지."\r
          )\r
          for attempt in range(2):\r
              result = agent.messages.create(\r
                  model="claude-haiku-4-5",\r
                  max_tokens=200,\r
                  system=system,\r
                  messages=[\r
                      {"role": "user", "content": rawSentence},\r
                      {"role": "assistant", "content": "{"},\r
                  ],\r
              )\r
              rawText = "".join(block.text for block in result.content if block.type == "text")\r
              try:\r
                  parsed = json.loads("{" + rawText)\r
                  parsed["amount"] = int(parsed["amount"])\r
                  return parsed\r
              except (json.JSONDecodeError, KeyError, ValueError, TypeError):\r
                  if attempt == 1:\r
                      raise ValueError(f"parseOrderText failed: {rawText[:120]}")\r
          return {}\r
\r
      order = parseOrderText("민준이가 12만원짜리 책 결제했어. 주문번호는 A-100이야.")\r
      assert order["amount"] >= 100000\r
      assert "민준" in order["customer"]\r
      order\r
    hints:\r
    - system 문장에 currency 키를 정확히 KRW로 적어 달라고 추가합니다.\r
    - 검증 assertion에 order["currency"] == "KRW" 같은 항목을 추가합니다.\r
  check:
    noError: 함수 정의와 호출, assertion이 모두 정상 실행되어야 합니다.
    resultCheck: order가 amount, customer 정보를 정확히 추출해야 합니다.
assessment:
  masteryVariants:
  - id: 06_json-output-parse-order-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - strict_system
    - assistant_prefill
    title: 주문 JSON을 안전하게 파싱하기
    subtitle: strict JSON parser
    goal: parse_order_json(text)를 완성해 필수 키를 검증하고 amount를 정수로 정규화한다.
    why: 구조화 출력은 모델 응답을 그대로 믿는 것이 아니라 코드가 받을 수 있는 사전으로 확정하는 단계까지 포함합니다.
    explanation: 응답 문자열을 json.loads로 파싱한 뒤 orderId, customer, amount, currency 네 키를 검사합니다. amount는 다음 계산 단계에서 쓸 수 있도록 int로 바꿉니다.
    tips:
    - json.JSONDecodeError는 그대로 두지 말고 ValueError로 감싸면 호출부의 에러 처리가 단순해집니다.
    - 필수 키 누락과 타입 오류는 같은 실패 흐름으로 처리해도 충분합니다.
    exercise:
      prompt: parse_order_json(text)를 완성해 검증된 주문 사전을 반환하세요.
      starterCode: |-
        def parse_order_json(text):
            raise NotImplementedError
      solution: |-
        import json

        def parse_order_json(text):
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError as exc:
                raise ValueError("invalid JSON") from exc
            if not isinstance(parsed, dict):
                raise ValueError("order must be an object")
            required = ["orderId", "customer", "amount", "currency"]
            missing = [key for key in required if key not in parsed]
            if missing:
                raise ValueError("missing required keys")
            return {
                "orderId": str(parsed["orderId"]),
                "customer": str(parsed["customer"]),
                "amount": int(parsed["amount"]),
                "currency": str(parsed["currency"]),
            }
      hints:
      - 필수 키 목록을 먼저 만들고 누락 여부를 검사합니다.
      - amount는 문자열로 와도 int로 변환되어야 합니다.
    check:
      id: python.llm.json-output.parse-order.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.json-output.empty.behavior.v1.fixture
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
        entry: parse_order_json
        cases:
        - id: parses-valid-order
          arguments:
          - value: '{"orderId":"A-100","customer":"민준","amount":"120000","currency":"KRW"}'
          expectedReturn:
            orderId: A-100
            customer: 민준
            amount: 120000
            currency: KRW
        - id: rejects-invalid-json-text
          arguments:
          - value: '\`\`\`json {"orderId":"A-100"} \`\`\`'
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 06_json-output-retry-parser-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - parse_retry
    - workflow_validation
    title: 후보 응답을 순서대로 재시도해 파싱하기
    subtitle: parse retry loop
    goal: parse_order_with_retry(candidates)를 완성해 첫 유효 JSON 주문과 시도 횟수를 반환한다.
    why: 구조화 출력은 실패 가능성을 인정하고 다음 후보나 재호출 결과로 복구할 수 있어야 자동화에 쓸 수 있습니다.
    explanation: candidates는 모델 응답 후보 문자열 목록입니다. 앞 후보가 JSON 파싱이나 필수 키 검증에 실패하면 다음 후보를 시도하고, 끝까지 실패하면 ValueError를 발생시킵니다.
    tips:
    - 성공 시 attempt는 1부터 세어 사용자와 로그가 이해하기 쉽게 만듭니다.
    - 실패를 숨기지 말고 모든 후보가 실패했을 때 명시적으로 예외를 냅니다.
    exercise:
      prompt: parse_order_with_retry(candidates)를 완성해 attempts, orderId, amount, currency를 반환하세요.
      starterCode: |-
        def parse_order_with_retry(candidates):
            raise NotImplementedError
      solution: |-
        import json

        def normalize_order(parsed):
            if not isinstance(parsed, dict):
                raise ValueError("order must be an object")
            required = ["orderId", "customer", "amount", "currency"]
            missing = [key for key in required if key not in parsed]
            if missing:
                raise ValueError("missing required keys")
            return {
                "orderId": str(parsed["orderId"]),
                "customer": str(parsed["customer"]),
                "amount": int(parsed["amount"]),
                "currency": str(parsed["currency"]),
            }

        def parse_order_with_retry(candidates):
            if not candidates:
                raise ValueError("candidates must not be empty")
            for attempt, text in enumerate(candidates, 1):
                try:
                    order = normalize_order(json.loads(text))
                except (json.JSONDecodeError, TypeError, ValueError) as exc:
                    last_error = exc
                    continue
                return {
                    "attempts": attempt,
                    "orderId": order["orderId"],
                    "amount": order["amount"],
                    "currency": order["currency"],
                }
            raise ValueError("no valid order JSON") from last_error
      hints:
      - 첫 후보가 실패해도 반복문을 멈추지 않습니다.
      - 성공 반환값은 자동화 로그에 필요한 핵심 키만 담습니다.
    check:
      id: python.llm.json-output.retry-parser.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.json-output.empty.behavior.v1.fixture
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
        entry: parse_order_with_retry
        cases:
        - id: succeeds-on-second-candidate
          arguments:
          - value:
            - 주문 정보입니다.
            - '{"orderId":"B-200","customer":"지아","amount":45000,"currency":"KRW"}'
          expectedReturn:
            attempts: 2
            orderId: B-200
            amount: 45000
            currency: KRW
        - id: rejects-all-invalid-candidates
          arguments:
          - value:
            - "{}"
            - not-json
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 06_json-output-rule-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - free_form_baseline
    - strict_system
    - assistant_prefill
    - parse_retry
    title: JSON 출력 운영 규칙 회상하기
    subtitle: JSON rule recall
    goal: choose_json_output_rule(goal)를 완성해 구조화 출력 상황별 규칙과 실패 위험을 반환한다.
    why: JSON 출력은 프롬프트, prefill, 파서, 재시도가 한 묶음으로 움직일 때 안정성이 생깁니다.
    explanation: strict-system, assistant-prefill, parse-json, retry-on-fail, schema-check 상황별로 적용할 규칙을 선택하세요.
    tips:
    - JSON만 요구하는 문장과 실제 파싱 검증은 다른 단계입니다.
    - schema-check는 다음 코드가 기대하는 키를 보장합니다.
    exercise:
      prompt: choose_json_output_rule(goal)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_json_output_rule(goal):
            raise NotImplementedError
      solution: |-
        def choose_json_output_rule(goal):
            table = {
                "strict-system": {"rule": "forbid text outside valid JSON", "useWhen": "response feeds code", "risk": "markdown wrapper"},
                "assistant-prefill": {"rule": "start assistant response with opening brace", "useWhen": "shape needs stronger bias", "risk": "format drift"},
                "parse-json": {"rule": "run json.loads before using fields", "useWhen": "receiving model text", "risk": "string masquerade"},
                "retry-on-fail": {"rule": "retry when parse or schema check fails", "useWhen": "automation must recover", "risk": "single-shot failure"},
                "schema-check": {"rule": "validate required keys and types", "useWhen": "next step is deterministic code", "risk": "missing field crash"},
            }
            if goal not in table:
                raise ValueError("unknown JSON output goal")
            return table[goal]
      hints:
      - 자동화에서 문자열과 사전은 분명히 구분해야 합니다.
      - 키 검증은 파싱 직후에 실행합니다.
    check:
      id: python.llm.json-output.rule-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.json-output.empty.behavior.v1.fixture
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
        entry: choose_json_output_rule
        cases:
        - id: recalls-strict-system
          arguments:
          - value: strict-system
          expectedReturn:
            rule: forbid text outside valid JSON
            useWhen: response feeds code
            risk: markdown wrapper
        - id: recalls-schema-check
          arguments:
          - value: schema-check
          expectedReturn:
            rule: validate required keys and types
            useWhen: next step is deterministic code
            risk: missing field crash
        - id: rejects-unknown-goal
          arguments:
          - value: hope-it-parses
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};