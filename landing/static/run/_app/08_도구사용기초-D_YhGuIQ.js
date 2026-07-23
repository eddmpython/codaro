var e=`meta:\r
  packages:\r
  - anthropic\r
  id: llmBasics_08\r
  title: 도구사용기초\r
  order: 8\r
  category: llmBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - anthropic\r
  - tool_use\r
  - function_calling\r
  - 자동화\r
  seo:\r
    title: Claude 도구 사용 기초 - tool_use와 tool_result 루프\r
    description: tools 인자로 함수 시그니처를 정의하고 tool_use→tool_result 루프로 Claude가 코드 함수를 호출하도록 만듭니다.\r
    keywords:\r
    - Claude tool use\r
    - function calling\r
    - tool_use\r
    - tool_result\r
intro:\r
  emoji: 🛠️\r
  goal: tools 인자와 tool_use→tool_result 루프로 Claude가 코드 함수를 호출하게 한다.\r
  description: 도구 사용은 LLM 자동화의 핵심입니다. 한 개의 도구를 등록하고 응답에서 도구 호출을 받아 실행하고 결과를 다시 모델에 넘기는 표준 루프를 만듭니다.\r
  direction: 도구 스키마 정의 → 첫 tool_use 받기 → tool_result 회신 → 루프 함수화 순으로 발전시킨다.\r
  benefits:\r
  - tools 인자의 스키마(name, description, input_schema) 형태를 분명히 익힌다.\r
  - 응답의 stop_reason="tool_use"가 무엇을 의미하는지 분명히 한다.\r
  - tool_result 메시지의 정확한 형식을 익힌다.\r
  - runToolLoop 함수로 자동화 코드에서 재사용 가능한 루프를 만든다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 도구 스키마 정의\r
      detail: get_weather 도구를 JSON 스키마로 만든다.\r
    - label: 2단계. tool_use 받기\r
      detail: stop_reason="tool_use"와 ToolUseBlock 구조를 확인한다.\r
    - label: 3단계. tool_result 회신\r
      detail: 도구 실행 결과를 messages에 추가해 두 번째 호출을 보낸다.\r
    - label: 4단계. runToolLoop 함수화\r
      detail: 모든 tool_use를 자동으로 처리하는 루프를 만든다.\r
    runtime:\r
    - label: LLM 호출 환경\r
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.\r
    - label: 도구사용기초 실행\r
      detail: 한 도구만 등록해 루프 한 라운드를 끝까지 본다.\r
    - label: 도구사용기초 완료\r
      detail: 다음 강의의 멀티 도구 라우팅과 종합 자동화의 기반이 된다.\r
sections:\r
- id: define_tool\r
  title: 1단계. 도구 스키마 정의\r
  structuredPrimary: true\r
  subtitle: name, description, input_schema\r
  goal: get_weather 도구를 JSON 스키마로 정의하고 tools 리스트에 담는다.\r
  why: 도구 스키마는 Claude가 도구를 언제·어떻게 호출할지 결정하는 정보입니다. 정확한 스키마가 도구 사용의 첫 단계입니다.\r
  explanation: tools 인자는 도구 사전의 리스트입니다. 각 도구는 name(고유 식별자), description(언제 사용하는지), input_schema(JSON Schema\r
    형식의 인자) 세 필드를 갖습니다. description은 도구 호출 결정을 좌우하므로 한 문장으로 명확하게 씁니다.\r
  tips:\r
  - 도구 이름은 lowerCamel이 아닌 snake_case가 컨벤션입니다. Anthropic 문서 예제와 일치시킵니다.\r
  snippet: |-\r
    weatherTool = {\r
        "name": "get_weather",\r
        "description": "특정 도시의 현재 날씨를 조회한다. 도시 이름을 받아 섭씨 기온과 날씨 상태를 돌려준다.",\r
        "input_schema": {\r
            "type": "object",\r
            "properties": {\r
                "city": {\r
                    "type": "string",\r
                    "description": "조회할 도시의 한국어 또는 영어 이름.",\r
                },\r
            },\r
            "required": ["city"],\r
        },\r
    }\r
    tools = [weatherTool]\r
    tools[0]["name"]\r
  exercise:\r
    prompt: weatherTool의 input_schema에 unit 인자(섭씨/화씨)를 추가해 보세요.\r
    starterCode: |-\r
      weatherTool = {\r
          "name": "get_weather",\r
          "description": "특정 도시의 현재 날씨를 조회한다. 도시 이름을 받아 섭씨 기온과 날씨 상태를 돌려준다.",\r
          "input_schema": {\r
              "type": "object",\r
              "properties": {\r
                  "city": {\r
                      "type": "string",\r
                      "description": "조회할 도시의 한국어 또는 영어 이름.",\r
                  },\r
              },\r
              "required": ["city"],\r
          },\r
      }\r
      tools = [weatherTool]\r
      tools[0]["name"]\r
    hints:\r
    - properties에 "unit" 키를 추가하고 type은 "string", enum은 ["celsius","fahrenheit"]로 둡니다.\r
    - required에 unit을 넣을지는 선택입니다. 선택이면 기본값을 코드에서 처리합니다.\r
  check:\r
    noError: 사전 정의가 정상 평가되어야 합니다.\r
    resultCheck: tools가 길이 1의 리스트이고 첫 항목이 get_weather여야 합니다.\r
- id: tool_use_response\r
  title: 2단계. tool_use 응답 받기\r
  structuredPrimary: true\r
  subtitle: stop_reason과 ToolUseBlock\r
  goal: tools 인자를 포함해 호출하고 stop_reason="tool_use"와 ToolUseBlock 구조를 확인한다.\r
  why: 모델이 도구를 호출하기로 결정하면 응답이 일반 텍스트가 아닌 ToolUseBlock으로 옵니다. 이 모양을 알아야 다음 단계에서 결과를 회신할 수 있습니다.\r
  explanation: messages.create에 tools를 넘기면 모델이 tool_use를 결정할 수 있습니다. 응답의 stop_reason이 "tool_use"가 되고 content\r
    리스트에 ToolUseBlock(type="tool_use")이 포함됩니다. ToolUseBlock의 name, id, input이 도구 호출 정보입니다.\r
  tips:\r
  - 도구 호출이 일어나지 않으면 stop_reason은 평소처럼 "end_turn"입니다. 두 갈래 모두 처리해야 합니다.\r
  snippet: |-\r
    import anthropic\r
\r
    weatherTool = {\r
        "name": "get_weather",\r
        "description": "특정 도시의 현재 날씨를 조회한다.",\r
        "input_schema": {\r
            "type": "object",\r
            "properties": {"city": {"type": "string"}},\r
            "required": ["city"],\r
        },\r
    }\r
\r
    client = anthropic.Anthropic()\r
    initial = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=300,\r
        tools=[weatherTool],\r
        messages=[{"role": "user", "content": "서울 날씨 알려줘."}],\r
    )\r
\r
    toolBlocks = [block for block in initial.content if block.type == "tool_use"]\r
    (initial.stop_reason, [(tb.name, tb.input) for tb in toolBlocks])\r
  exercise:\r
    prompt: 사용자 메시지를 "오늘 날씨와 상관없이 한 문장으로 인사해 줘"로 바꿔 stop_reason이 "end_turn"이 되는지 확인하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      weatherTool = {\r
          "name": "get_weather",\r
          "description": "특정 도시의 현재 날씨를 조회한다.",\r
          "input_schema": {\r
              "type": "object",\r
              "properties": {"city": {"type": "string"}},\r
              "required": ["city"],\r
          },\r
      }\r
\r
      client = anthropic.Anthropic()\r
      initial = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=300,\r
          tools=[weatherTool],\r
          messages=[{"role": "user", "content": "서울 날씨 알려줘."}],\r
      )\r
\r
      toolBlocks = [block for block in initial.content if block.type == "tool_use"]\r
      (initial.stop_reason, [(tb.name, tb.input) for tb in toolBlocks])\r
    hints:\r
    - 인사 요청에는 모델이 도구 호출이 필요 없다고 판단합니다.\r
    - stop_reason이 "end_turn"이면 toolBlocks 리스트는 비어 있습니다.\r
  check:\r
    noError: tools 포함 호출이 정상 실행되어야 합니다.\r
    resultCheck: stop_reason이 "tool_use" 또는 "end_turn" 둘 중 하나여야 합니다.\r
- id: tool_result_back\r
  title: 3단계. tool_result로 결과 회신\r
  structuredPrimary: true\r
  subtitle: 두 번째 호출에 도구 결과 넣기\r
  goal: 도구를 실제 실행한 결과를 tool_result 메시지로 만들어 두 번째 호출을 보낸다.\r
  why: tool_use는 도구 실행을 요청한 상태입니다. 결과를 다시 보내야 모델이 사용자에게 자연어 응답을 마무리합니다.\r
  explanation: 두 번째 호출의 messages에는 (1) 원래 user (2) assistant content(첫 응답 그대로) (3) user role의 tool_result 블록이\r
    들어갑니다. tool_result는 tool_use_id로 어떤 호출에 대한 결과인지 지정하고 content에 결과 문자열을 담습니다. 모델은 결과를 보고 자연어 응답을 만듭니다.\r
  tips:\r
  - assistant content는 첫 응답의 content 리스트를 그대로 넣어야 합니다. 새로 만들지 마세요.\r
  snippet: |-\r
    import anthropic\r
\r
    weatherTool = {\r
        "name": "get_weather",\r
        "description": "특정 도시의 현재 날씨를 조회한다.",\r
        "input_schema": {\r
            "type": "object",\r
            "properties": {"city": {"type": "string"}},\r
            "required": ["city"],\r
        },\r
    }\r
\r
    def fakeWeather(city: str) -> str:\r
        catalog = {"서울": "맑음 12도", "부산": "흐림 15도", "도쿄": "비 9도"}\r
        return catalog.get(city, "데이터 없음")\r
\r
    client = anthropic.Anthropic()\r
    history = [{"role": "user", "content": "서울 날씨 알려줘."}]\r
    initial = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=300,\r
        tools=[weatherTool],\r
        messages=history,\r
    )\r
\r
    toolBlock = next(block for block in initial.content if block.type == "tool_use")\r
    weather = fakeWeather(toolBlock.input["city"])\r
\r
    history.append({"role": "assistant", "content": initial.content})\r
    history.append({\r
        "role": "user",\r
        "content": [\r
            {\r
                "type": "tool_result",\r
                "tool_use_id": toolBlock.id,\r
                "content": weather,\r
            }\r
        ],\r
    })\r
\r
    final = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=300,\r
        tools=[weatherTool],\r
        messages=history,\r
    )\r
    finalText = "".join(block.text for block in final.content if block.type == "text")\r
    finalText\r
  exercise:\r
    prompt: fakeWeather 사전을 확장해 더 많은 도시 데이터를 넣고 다른 도시 질문을 던져 보세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      weatherTool = {\r
          "name": "get_weather",\r
          "description": "특정 도시의 현재 날씨를 조회한다.",\r
          "input_schema": {\r
              "type": "object",\r
              "properties": {"city": {"type": "string"}},\r
              "required": ["city"],\r
          },\r
      }\r
\r
      def fakeWeather(city: str) -> str:\r
          catalog = {"서울": "맑음 12도", "부산": "흐림 15도", "도쿄": "비 9도"}\r
          return catalog.get(city, "데이터 없음")\r
\r
      client = anthropic.Anthropic()\r
      history = [{"role": "user", "content": "서울 날씨 알려줘."}]\r
      initial = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=300,\r
          tools=[weatherTool],\r
          messages=history,\r
      )\r
\r
      toolBlock = next(block for block in initial.content if block.type == "tool_use")\r
      weather = fakeWeather(toolBlock.input["city"])\r
\r
      history.append({"role": "assistant", "content": initial.content})\r
      history.append({\r
          "role": "user",\r
          "content": [\r
              {\r
                  "type": "tool_result",\r
                  "tool_use_id": toolBlock.id,\r
                  "content": weather,\r
              }\r
          ],\r
      })\r
\r
      final = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=300,\r
          tools=[weatherTool],\r
          messages=history,\r
      )\r
      finalText = "".join(block.text for block in final.content if block.type == "text")\r
      finalText\r
    hints:\r
    - catalog 사전에 뉴욕 키와 짧은 날씨 문자열 값을 가진 항목을 하나 추가합니다.\r
    - 도시 이름은 user 메시지와 같은 표현이어야 catalog가 적중합니다.\r
  check:\r
    noError: 두 번의 호출과 결과 회신이 정상 실행되어야 합니다.\r
    resultCheck: finalText가 weather 내용을 반영한 자연어 응답이어야 합니다.\r
- id: tool_loop\r
  title: 4단계. runToolLoop 함수화\r
  structuredPrimary: true\r
  subtitle: 도구 호출이 끝날 때까지 반복\r
  goal: stop_reason이 더 이상 "tool_use"가 아닐 때까지 도구 호출을 처리하는 함수를 만든다.\r
  why: 한 번의 사용자 질문이 여러 도구 호출을 만들 수 있습니다. 자동화에서는 끝날 때까지 자동으로 처리하는 루프가 필요합니다.\r
  explanation: while 루프로 stop_reason이 "tool_use"인 동안 ToolUseBlock을 모두 실행하고 tool_result를 messages에 추가합니다.\r
    한 라운드가 여러 도구 호출을 포함할 수 있으니 toolBlocks를 리스트로 처리합니다. 종료 조건은 stop_reason이 "end_turn" 등으로 바뀌는 시점입니다.\r
  tips:\r
  - 무한 루프 방지를 위해 maxRounds 인자로 횟수 상한을 두면 안전합니다.\r
  snippet: |-\r
    import anthropic\r
\r
    weatherTool = {\r
        "name": "get_weather",\r
        "description": "특정 도시의 현재 날씨를 조회한다.",\r
        "input_schema": {\r
            "type": "object",\r
            "properties": {"city": {"type": "string"}},\r
            "required": ["city"],\r
        },\r
    }\r
\r
    def fakeWeather(city: str) -> str:\r
        catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}\r
        return catalog.get(city, "데이터 없음")\r
\r
    def runToolLoop(client, prompt: str, maxRounds: int = 5) -> str:\r
        history = [{"role": "user", "content": prompt}]\r
        for _ in range(maxRounds):\r
            result = client.messages.create(\r
                model="claude-haiku-4-5",\r
                max_tokens=400,\r
                tools=[weatherTool],\r
                messages=history,\r
            )\r
            if result.stop_reason != "tool_use":\r
                return "".join(block.text for block in result.content if block.type == "text")\r
            history.append({"role": "assistant", "content": result.content})\r
            toolResults = []\r
            for block in result.content:\r
                if block.type != "tool_use":\r
                    continue\r
                outcome = fakeWeather(block.input["city"]) if block.name == "get_weather" else "도구 없음"\r
                toolResults.append({\r
                    "type": "tool_result",\r
                    "tool_use_id": block.id,\r
                    "content": outcome,\r
                })\r
            history.append({"role": "user", "content": toolResults})\r
        return "max rounds reached"\r
\r
    client = anthropic.Anthropic()\r
    answer = runToolLoop(client, "서울과 부산 날씨를 비교해 한 문장으로 알려줘.")\r
    answer\r
  exercise:\r
    prompt: runToolLoop가 호출 횟수와 마지막 stop_reason을 함께 돌려주도록 반환을 dict로 바꿔 보세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      weatherTool = {\r
          "name": "get_weather",\r
          "description": "특정 도시의 현재 날씨를 조회한다.",\r
          "input_schema": {\r
              "type": "object",\r
              "properties": {"city": {"type": "string"}},\r
              "required": ["city"],\r
          },\r
      }\r
\r
      def fakeWeather(city: str) -> str:\r
          catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}\r
          return catalog.get(city, "데이터 없음")\r
\r
      def runToolLoop(client, prompt: str, maxRounds: int = 5) -> str:\r
          history = [{"role": "user", "content": prompt}]\r
          for _ in range(maxRounds):\r
              result = client.messages.create(\r
                  model="claude-haiku-4-5",\r
                  max_tokens=400,\r
                  tools=[weatherTool],\r
                  messages=history,\r
              )\r
              if result.stop_reason != "tool_use":\r
                  return "".join(block.text for block in result.content if block.type == "text")\r
              history.append({"role": "assistant", "content": result.content})\r
              toolResults = []\r
              for block in result.content:\r
                  if block.type != "tool_use":\r
                      continue\r
                  outcome = fakeWeather(block.input["city"]) if block.name == "get_weather" else "도구 없음"\r
                  toolResults.append({\r
                      "type": "tool_result",\r
                      "tool_use_id": block.id,\r
                      "content": outcome,\r
                  })\r
              history.append({"role": "user", "content": toolResults})\r
          return "max rounds reached"\r
\r
      client = anthropic.Anthropic()\r
      answer = runToolLoop(client, "서울과 부산 날씨를 비교해 한 문장으로 알려줘.")\r
      answer\r
    hints:\r
    - 함수가 dict를 돌려주도록 바꾸고 rounds, stop_reason, text 세 키를 둡니다.\r
    - max rounds 도달 시도 같은 모양의 dict를 돌려줍니다.\r
  check:\r
    noError: runToolLoop 함수 정의와 호출이 정상 실행되어야 합니다.\r
    resultCheck: answer가 비어있지 않은 문자열이고 도시 정보를 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 도구로 외부 데이터 답변 만들기'\r
  structuredPrimary: true\r
  subtitle: 도구가 실제 데이터를 가져오는지 검증\r
  goal: 두 도시 비교 요청에 대해 도구가 두 번 호출되었는지 코드로 확인하고 응답에 두 도시 정보가 모두 포함되었는지 검증한다.\r
  why: 자동화에서 도구 호출 횟수와 결과 반영을 검증하지 않으면 모델이 도구를 무시하고 자기 지식으로 답해도 알아차리지 못합니다.\r
  explanation: runToolLoop 안에서 도구 호출 횟수를 카운트하도록 인자를 받습니다. 호출 후 totalToolCalls가 2 이상인지, finalText에 두 도시 이름이\r
    모두 포함되었는지 assertion으로 확인합니다.\r
  tips:\r
  - 도구 호출 횟수를 외부 리스트에 누적하면 함수 내부 상태를 들여다보기 쉽습니다.\r
  snippet: |-\r
    import anthropic\r
\r
    weatherTool = {\r
        "name": "get_weather",\r
        "description": "특정 도시의 현재 날씨를 조회한다.",\r
        "input_schema": {\r
            "type": "object",\r
            "properties": {"city": {"type": "string"}},\r
            "required": ["city"],\r
        },\r
    }\r
\r
    def fakeWeather(city: str) -> str:\r
        catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}\r
        return catalog.get(city, "데이터 없음")\r
\r
    def runToolLoopWithTrace(client, prompt: str, maxRounds: int = 5) -> dict:\r
        history = [{"role": "user", "content": prompt}]\r
        callTrace: list[str] = []\r
        for _ in range(maxRounds):\r
            result = client.messages.create(\r
                model="claude-haiku-4-5",\r
                max_tokens=400,\r
                tools=[weatherTool],\r
                messages=history,\r
            )\r
            if result.stop_reason != "tool_use":\r
                text = "".join(block.text for block in result.content if block.type == "text")\r
                return {"text": text, "calls": callTrace}\r
            history.append({"role": "assistant", "content": result.content})\r
            blockResults = []\r
            for block in result.content:\r
                if block.type != "tool_use":\r
                    continue\r
                callTrace.append(block.input.get("city", ""))\r
                outcome = fakeWeather(block.input["city"]) if block.name == "get_weather" else "도구 없음"\r
                blockResults.append({\r
                    "type": "tool_result",\r
                    "tool_use_id": block.id,\r
                    "content": outcome,\r
                })\r
            history.append({"role": "user", "content": blockResults})\r
        return {"text": "max rounds reached", "calls": callTrace}\r
\r
    client = anthropic.Anthropic()\r
    outcome = runToolLoopWithTrace(client, "서울과 부산 날씨를 한 문장으로 비교해 줘.")\r
    assert len(outcome["calls"]) >= 2\r
    assert "서울" in outcome["text"]\r
    assert "부산" in outcome["text"]\r
    outcome\r
  exercise:\r
    prompt: runToolLoopWithTrace에 도시별 호출 결과까지 callTrace에 남기도록 (city, result) 튜플을 저장하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      weatherTool = {\r
          "name": "get_weather",\r
          "description": "특정 도시의 현재 날씨를 조회한다.",\r
          "input_schema": {\r
              "type": "object",\r
              "properties": {"city": {"type": "string"}},\r
              "required": ["city"],\r
          },\r
      }\r
\r
      def fakeWeather(city: str) -> str:\r
          catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}\r
          return catalog.get(city, "데이터 없음")\r
\r
      def runToolLoopWithTrace(client, prompt: str, maxRounds: int = 5) -> dict:\r
          history = [{"role": "user", "content": prompt}]\r
          callTrace: list[str] = []\r
          for _ in range(maxRounds):\r
              result = client.messages.create(\r
                  model="claude-haiku-4-5",\r
                  max_tokens=400,\r
                  tools=[weatherTool],\r
                  messages=history,\r
              )\r
              if result.stop_reason != "tool_use":\r
                  text = "".join(block.text for block in result.content if block.type == "text")\r
                  return {"text": text, "calls": callTrace}\r
              history.append({"role": "assistant", "content": result.content})\r
              blockResults = []\r
              for block in result.content:\r
                  if block.type != "tool_use":\r
                      continue\r
                  callTrace.append(block.input.get("city", ""))\r
                  outcome = fakeWeather(block.input["city"]) if block.name == "get_weather" else "도구 없음"\r
                  blockResults.append({\r
                      "type": "tool_result",\r
                      "tool_use_id": block.id,\r
                      "content": outcome,\r
                  })\r
              history.append({"role": "user", "content": blockResults})\r
          return {"text": "max rounds reached", "calls": callTrace}\r
\r
      client = anthropic.Anthropic()\r
      outcome = runToolLoopWithTrace(client, "서울과 부산 날씨를 한 문장으로 비교해 줘.")\r
      assert len(outcome["calls"]) >= 2\r
      assert "서울" in outcome["text"]\r
      assert "부산" in outcome["text"]\r
      outcome\r
    hints:\r
    - callTrace에 (city, fakeWeather(city)) 튜플을 추가합니다.\r
    - 두 도시 모두 fakeWeather가 데이터를 가지고 있어야 도구 결과가 자연어 응답에 반영됩니다.\r
  check:
    noError: runToolLoopWithTrace 호출과 assertion이 모두 정상 실행되어야 합니다.
    resultCheck: outcome["calls"] 길이가 2 이상이고 text에 두 도시 이름이 포함되어야 합니다.
assessment:
  masteryVariants:
  - id: 08_tool-use-extract-request-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - tool_use_response
    title: 응답에서 tool_use 요청 추출하기
    subtitle: tool request extractor
    goal: extract_tool_request(response)를 완성해 첫 tool_use 블록의 id, name, input을 반환한다.
    why: 도구 루프의 첫 분기점은 일반 텍스트와 tool_use 블록을 정확히 구분하는 것입니다.
    explanation: response.content를 순회하며 type이 tool_use인 블록을 찾습니다. 도구 호출이 없으면 루프를 계속할 수 없으므로 ValueError를 발생시킵니다.
    tips:
    - 테스트에서는 dict 형태를 쓰지만 실제 SDK 객체도 같은 필드를 가집니다.
    - input은 도구 핸들러로 바로 넘길 수 있도록 dict로 반환합니다.
    exercise:
      prompt: extract_tool_request(response)를 완성해 도구 호출 정보를 반환하세요.
      starterCode: |-
        def extract_tool_request(response):
            raise NotImplementedError
      solution: |-
        def read_field(value, key, default=None):
            if isinstance(value, dict):
                return value.get(key, default)
            return getattr(value, key, default)

        def extract_tool_request(response):
            for block in read_field(response, "content", []):
                if read_field(block, "type") != "tool_use":
                    continue
                return {
                    "id": read_field(block, "id"),
                    "name": read_field(block, "name"),
                    "input": dict(read_field(block, "input", {})),
                }
            raise ValueError("tool_use block not found")
      hints:
      - content 안에는 text 블록과 tool_use 블록이 함께 올 수 있습니다.
      - 없는 도구 호출을 None으로 넘기지 말고 명시적으로 실패시킵니다.
    check:
      id: python.llm.tool-use.extract-request.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.tool-use.empty.behavior.v1.fixture
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
        entry: extract_tool_request
        cases:
        - id: extracts-first-tool-use-block
          arguments:
          - value:
              content:
              - type: text
                text: 확인 중
              - type: tool_use
                id: toolu_01
                name: get_weather
                input:
                  city: 서울
          expectedReturn:
            id: toolu_01
            name: get_weather
            input:
              city: 서울
        - id: rejects-response-without-tool-use
          arguments:
          - value:
              content:
              - type: text
                text: 도구가 필요하지 않습니다
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 08_tool-use-result-message-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - tool_result_back
    - tool_loop
    title: tool_result 회신 메시지 만들기
    subtitle: tool result message
    goal: build_tool_result_message(tool_call, result_text)를 완성해 모델에 되돌릴 user 메시지를 만든다.
    why: 도구 실행 결과는 아무 문자열이 아니라 정확한 tool_result 블록 형식으로 되돌아가야 다음 모델 호출이 이어집니다.
    explanation: tool_call의 id를 tool_use_id로 복사하고, result_text를 content에 담은 user 메시지를 반환합니다. id가 없으면 어떤 호출의 결과인지 알 수 없으므로 실패해야 합니다.
    tips:
    - role은 user이고 content는 리스트입니다.
    - tool_use_id는 tool_use 블록의 id와 정확히 같아야 합니다.
    exercise:
      prompt: build_tool_result_message(tool_call, result_text)를 완성해 tool_result 메시지를 반환하세요.
      starterCode: |-
        def build_tool_result_message(tool_call, result_text):
            raise NotImplementedError
      solution: |-
        def build_tool_result_message(tool_call, result_text):
            tool_id = tool_call.get("id")
            if not tool_id:
                raise ValueError("tool_call id is required")
            return {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_id,
                        "content": str(result_text),
                    }
                ],
            }
      hints:
      - tool_call["id"]가 그대로 tool_use_id가 됩니다.
      - 실행 결과는 문자열로 정규화해도 됩니다.
    check:
      id: python.llm.tool-use.result-message.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.tool-use.empty.behavior.v1.fixture
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
        entry: build_tool_result_message
        cases:
        - id: builds-user-tool-result-message
          arguments:
          - value:
              id: toolu_01
              name: get_weather
              input:
                city: 서울
          - value: 서울은 24도, 맑음
          expectedReturn:
            role: user
            content:
            - type: tool_result
              tool_use_id: toolu_01
              content: 서울은 24도, 맑음
        - id: rejects-missing-tool-id
          arguments:
          - value:
              name: get_weather
              input:
                city: 서울
          - value: 서울은 맑음
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 08_tool-use-loop-step-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - define_tool
    - tool_use_response
    - tool_result_back
    - tool_loop
    title: 도구 루프 단계 회상하기
    subtitle: tool loop recall
    goal: choose_tool_loop_step(goal)를 완성해 도구 사용 단계별 규칙과 실패 위험을 반환한다.
    why: 도구 사용은 스키마, tool_use 감지, 로컬 실행, tool_result 회신, 라운드 제한이 순서대로 맞아야 안정됩니다.
    explanation: define-schema, inspect-stop-reason, dispatch-local, return-tool-result, limit-rounds 상황별로 적용할 규칙을 선택하세요.
    tips:
    - 도구 호출은 모델이 결정하지만 실행은 로컬 코드가 책임집니다.
    - 라운드 제한이 없으면 도구 호출 루프가 끝나지 않을 수 있습니다.
    exercise:
      prompt: choose_tool_loop_step(goal)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_tool_loop_step(goal):
            raise NotImplementedError
      solution: |-
        def choose_tool_loop_step(goal):
            table = {
                "define-schema": {"rule": "describe tool name and input schema", "useWhen": "exposing a callable function", "risk": "bad argument shape"},
                "inspect-stop-reason": {"rule": "branch when stop_reason is tool_use", "useWhen": "response arrives", "risk": "ignored tool call"},
                "dispatch-local": {"rule": "execute the named local handler", "useWhen": "tool_use block is present", "risk": "no side effect"},
                "return-tool-result": {"rule": "send user tool_result block with matching id", "useWhen": "handler returns", "risk": "model cannot continue"},
                "limit-rounds": {"rule": "cap loop iterations", "useWhen": "tool use can repeat", "risk": "infinite loop"},
            }
            if goal not in table:
                raise ValueError("unknown tool loop goal")
            return table[goal]
      hints:
      - stop_reason은 다음 행동을 결정하는 신호입니다.
      - tool_result의 id 연결이 끊기면 모델이 결과를 매칭하지 못합니다.
    check:
      id: python.llm.tool-use.loop-step.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.tool-use.empty.behavior.v1.fixture
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
        entry: choose_tool_loop_step
        cases:
        - id: recalls-dispatch-local
          arguments:
          - value: dispatch-local
          expectedReturn:
            rule: execute the named local handler
            useWhen: tool_use block is present
            risk: no side effect
        - id: recalls-limit-rounds
          arguments:
          - value: limit-rounds
          expectedReturn:
            rule: cap loop iterations
            useWhen: tool use can repeat
            risk: infinite loop
        - id: rejects-unknown-goal
          arguments:
          - value: click-confirm
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};