var e=`meta:
  packages:
  - anthropic
  id: llmBasics_09
  title: 멀티도구라우팅
  order: 9
  category: llmBasics
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - anthropic
  - tool_use
  - 라우팅
  - 다중도구
  seo:
    title: Claude 멀티 도구 라우팅 - 여러 도구 묶어 자동화
    description: 여러 도구를 한 번에 정의하고 dispatcher로 도구별 핸들러를 라우팅하는 자동화 패턴을 익힙니다.
    keywords:
    - multi tool
    - tool routing
    - dispatcher
    - Claude tools
intro:
  emoji: 🛠️
  goal: 여러 도구를 함께 등록하고 dispatcher로 도구별 핸들러를 라우팅한다.
  description: 한 자동화 흐름에 도구가 두 개 이상 들어가는 경우가 많습니다. 도구 묶음 + dispatcher + 에러 처리까지 한 번에 만듭니다.
  direction: 도구 두 개 정의 → dispatcher 함수 → 잘못된 도구·인자 처리 → ToolKit 클래스화 순으로 발전시킨다.
  benefits:
  - 두 개 이상의 도구를 한 번에 등록하고 description으로 분기를 유도하는 패턴을 익힌다.
  - 도구 이름 → 핸들러 함수 매핑(dispatcher)을 만든다.
  - 알 수 없는 도구·잘못된 인자·핸들러 예외를 깔끔하게 처리한다.
  - ToolKit 클래스로 도구 묶음을 재사용 가능한 객체로 만든다.
  diagram:
    steps:
    - label: 1단계. 두 도구 등록
      detail: get_weather와 list_holidays 두 도구를 동시에 등록한다.
    - label: 2단계. dispatcher 함수
      detail: 도구 이름과 입력을 받아 핸들러로 라우팅하는 함수를 만든다.
    - label: 3단계. 에러 처리
      detail: 알 수 없는 도구·인자 누락·핸들러 예외를 일관된 형식의 결과로 묶는다.
    - label: 4단계. ToolKit 객체
      detail: 도구·핸들러·스키마를 묶은 클래스로 자동화 코드에서 재사용한다.
    runtime:
    - label: LLM 호출 환경
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.
    - label: 멀티도구라우팅 실행
      detail: 사용자 요청이 두 도구를 모두 호출하는지 본다.
    - label: 멀티도구라우팅 완료
      detail: 종합 데이터 분석 봇에서 그대로 재사용된다.
sections:
- id: register_two_tools
  title: 1단계. 두 도구 등록
  structuredPrimary: true
  subtitle: 같은 tools 리스트에 두 항목
  goal: get_weather와 list_holidays 두 도구를 같은 tools 리스트에 담아 모델에 노출한다.
  why: 멀티 도구는 description으로 모델이 선택합니다. 두 도구의 description이 명확히 다르면 모델이 정확히 라우팅합니다.
  explanation: tools 리스트에 두 사전을 모두 넣고, 각 도구의 description을 사용 시점이 다르게 명시합니다. 사용자 질문이 두 도구 모두를 요구하면 모델이 두
    번의 tool_use를 만들어 줍니다.
  tips:
  - description은 한 문장 + 사용 시점 한 줄로 구성하면 모델이 분기를 잘 합니다.
  snippet: |-
    weatherTool = {
        "name": "get_weather",
        "description": "특정 도시의 현재 날씨를 조회한다. 도시 이름이 명시될 때만 사용한다.",
        "input_schema": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    }
    holidayTool = {
        "name": "list_holidays",
        "description": "특정 연도의 한국 공휴일 목록을 돌려준다. 사용자가 휴일 정보를 요청할 때만 사용한다.",
        "input_schema": {
            "type": "object",
            "properties": {"year": {"type": "integer"}},
            "required": ["year"],
        },
    }
    tools = [weatherTool, holidayTool]
    [tool["name"] for tool in tools]
  exercise:
    prompt: tools에 세 번째 도구(get_exchange_rate)를 추가하고 description으로 사용 시점을 명확히 명시하세요.
    starterCode: |-
      weatherTool = {
          "name": "get_weather",
          "description": "특정 도시의 현재 날씨를 조회한다. 도시 이름이 명시될 때만 사용한다.",
          "input_schema": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      }
      holidayTool = {
          "name": "list_holidays",
          "description": "특정 연도의 한국 공휴일 목록을 돌려준다. 사용자가 휴일 정보를 요청할 때만 사용한다.",
          "input_schema": {
              "type": "object",
              "properties": {"year": {"type": "integer"}},
              "required": ["year"],
          },
      }
      tools = [weatherTool, holidayTool]
      [tool["name"] for tool in tools]
    hints:
    - get_exchange_rate는 source/target 통화 두 인자를 받게 정의합니다.
    - description에 "환율" 같은 구체 명사를 포함해야 모델이 분기를 잘 합니다.
  check:
    noError: 리스트 정의가 정상 평가되어야 합니다.
    resultCheck: tools가 두 도구 이름을 정확히 포함해야 합니다.
- id: dispatcher
  title: 2단계. dispatcher 함수
  structuredPrimary: true
  subtitle: 도구 이름 → 핸들러 매핑
  goal: 도구 이름과 input을 받아 해당 핸들러를 호출하는 dispatchTool 함수를 만든다.
  why: 도구 호출은 한 곳에서 라우팅되어야 디버깅이 쉽습니다. dispatcher가 있으면 도구를 추가할 때 dispatcher 한 군데만 수정하면 됩니다.
  explanation: 핸들러 사전(handlers)에 도구 이름 → 함수를 매핑하고 dispatchTool은 이 사전에서 함수를 찾아 호출합니다. 없는 도구는 명시적 ValueError로
    처리합니다. 호출 결과는 항상 문자열로 반환하도록 통일하면 tool_result content에 그대로 넣을 수 있습니다.
  tips:
  - 핸들러는 짧은 함수로 두고 데이터 접근/계산은 별도 모듈로 분리하면 테스트가 쉬워집니다.
  snippet: |-
    def handleWeather(payload: dict) -> str:
        catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}
        return catalog.get(payload["city"], "데이터 없음")

    def handleHolidays(payload: dict) -> str:
        catalog = {2025: ["설날 2025-01-29", "삼일절 2025-03-01"], 2026: ["설날 2026-02-17"]}
        holidays = catalog.get(payload["year"], [])
        return ", ".join(holidays) if holidays else "공휴일 정보 없음"

    handlers = {
        "get_weather": handleWeather,
        "list_holidays": handleHolidays,
    }

    def dispatchTool(name: str, payload: dict) -> str:
        if name not in handlers:
            raise ValueError(f"unknown tool: {name}")
        return handlers[name](payload)

    dispatchTool("get_weather", {"city": "서울"})
  exercise:
    prompt: handlers에 get_exchange_rate 핸들러를 추가하고 dispatchTool 호출로 검증하세요.
    starterCode: |-
      def handleWeather(payload: dict) -> str:
          catalog = {"서울": "맑음 12도", "부산": "흐림 15도"}
          return catalog.get(payload["city"], "데이터 없음")

      def handleHolidays(payload: dict) -> str:
          catalog = {2025: ["설날 2025-01-29", "삼일절 2025-03-01"], 2026: ["설날 2026-02-17"]}
          holidays = catalog.get(payload["year"], [])
          return ", ".join(holidays) if holidays else "공휴일 정보 없음"

      handlers = {
          "get_weather": handleWeather,
          "list_holidays": handleHolidays,
      }

      def dispatchTool(name: str, payload: dict) -> str:
          if name not in handlers:
              raise ValueError(f"unknown tool: {name}")
          return handlers[name](payload)

      dispatchTool("get_weather", {"city": "서울"})
    hints:
    - handleExchange(payload) 함수를 정의하고 source/target 인자를 사용합니다.
    - handlers 사전에 "get_exchange_rate": handleExchange를 추가합니다.
  check:
    noError: 핸들러 정의와 dispatchTool 호출이 정상 실행되어야 합니다.
    resultCheck: 호출 결과가 "맑음 12도" 같은 문자열이어야 합니다.
- id: error_handling
  title: 3단계. 잘못된 도구·인자 처리
  structuredPrimary: true
  subtitle: 핸들러 예외를 일관된 결과로
  goal: dispatcher가 핸들러 예외와 인자 누락을 잡아 한 줄짜리 오류 문자열로 돌려준다.
  why: 자동화에서 도구 호출 실패는 자주 발생합니다. 모델에 오류 문자열로 회신하면 모델이 사용자에게 친절히 설명하거나 다른 도구를 시도하도록 유도할 수 있습니다.
  explanation: dispatcher를 try-except로 감싸 핸들러 내부 예외를 모두 잡습니다. 결과 문자열을 "오류:" 접두사로 시작하게 두면 모델이 tool_result를
    보고 사용자에게 자연어로 설명할 수 있습니다. 예외는 좁게 잡고 message를 보존합니다.
  tips:
  - except Exception을 쓸 때는 항상 메시지를 포함해 디버깅 정보가 사라지지 않게 합니다.
  snippet: |-
    def handleWeather(payload: dict) -> str:
        if "city" not in payload:
            raise KeyError("city argument missing")
        catalog = {"서울": "맑음 12도"}
        return catalog.get(payload["city"], "데이터 없음")

    def handleHolidays(payload: dict) -> str:
        year = payload["year"]
        if year < 2000:
            raise ValueError("year before 2000 not supported")
        catalog = {2025: ["설날"]}
        return ", ".join(catalog.get(year, [])) or "공휴일 정보 없음"

    handlers = {"get_weather": handleWeather, "list_holidays": handleHolidays}

    def safeDispatch(name: str, payload: dict) -> str:
        if name not in handlers:
            return f"오류: 알 수 없는 도구 {name}"
        try:
            return handlers[name](payload)
        except (KeyError, ValueError) as exc:
            return f"오류: {exc}"

    [safeDispatch("get_weather", {}), safeDispatch("list_holidays", {"year": 1990})]
  exercise:
    prompt: safeDispatch가 알 수 없는 도구 호출 시 오류 메시지에 도구 이름을 포함시키도록 이미 작성되어 있습니다. unknown 호출을 직접 테스트해 보세요.
    starterCode: |-
      def handleWeather(payload: dict) -> str:
          if "city" not in payload:
              raise KeyError("city argument missing")
          catalog = {"서울": "맑음 12도"}
          return catalog.get(payload["city"], "데이터 없음")

      def handleHolidays(payload: dict) -> str:
          year = payload["year"]
          if year < 2000:
              raise ValueError("year before 2000 not supported")
          catalog = {2025: ["설날"]}
          return ", ".join(catalog.get(year, [])) or "공휴일 정보 없음"

      handlers = {"get_weather": handleWeather, "list_holidays": handleHolidays}

      def safeDispatch(name: str, payload: dict) -> str:
          if name not in handlers:
              return f"오류: 알 수 없는 도구 {name}"
          try:
              return handlers[name](payload)
          except (KeyError, ValueError) as exc:
              return f"오류: {exc}"

      [safeDispatch("get_weather", {}), safeDispatch("list_holidays", {"year": 1990})]
    hints:
    - safeDispatch("get_exchange_rate", {}) 같은 호출을 추가합니다.
    - 결과 리스트에 "오류:" 접두사 문자열이 포함됩니다.
  check:
    noError: safeDispatch 호출이 예외 없이 문자열을 돌려줘야 합니다.
    resultCheck: 결과 리스트에 두 개의 오류 메시지가 들어있어야 합니다.
- id: toolkit_class
  title: 4단계. ToolKit 클래스로 묶기
  structuredPrimary: true
  subtitle: 스키마·핸들러·dispatcher 한 객체
  goal: ToolKit 클래스로 스키마 리스트와 dispatcher를 한 객체에 묶는다.
  why: 자동화 코드에서 도구 묶음은 객체 단위로 주고받는 게 자연스럽습니다. 다른 도구 묶음을 만들 때도 같은 클래스를 상속하면 됩니다.
  explanation: ToolKit은 schemas 리스트와 handlers 사전을 속성으로 갖습니다. register(name, schema, handler) 메서드로 도구를 등록하고
    dispatch(name, payload) 메서드로 호출합니다. messages.create에는 toolkit.schemas를 그대로 넘깁니다.
  tips:
  - 클래스가 schema·handler를 함께 받게 두면 누락 시 즉시 알 수 있습니다.
  snippet: |-
    from typing import Callable

    class ToolKit:
        def __init__(self) -> None:
            self.schemas: list[dict] = []
            self.handlers: dict[str, Callable[[dict], str]] = {}

        def register(self, schema: dict, handler: Callable[[dict], str]) -> None:
            self.schemas.append(schema)
            self.handlers[schema["name"]] = handler

        def dispatch(self, name: str, payload: dict) -> str:
            if name not in self.handlers:
                return f"오류: 알 수 없는 도구 {name}"
            try:
                return self.handlers[name](payload)
            except (KeyError, ValueError, TypeError) as exc:
                return f"오류: {exc}"

    kit = ToolKit()
    kit.register(
        {
            "name": "get_weather",
            "description": "특정 도시의 현재 날씨를 조회한다.",
            "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
        },
        lambda payload: {"서울": "맑음 12도"}.get(payload["city"], "데이터 없음"),
    )
    kit.register(
        {
            "name": "list_holidays",
            "description": "특정 연도의 한국 공휴일을 돌려준다.",
            "input_schema": {"type": "object", "properties": {"year": {"type": "integer"}}, "required": ["year"]},
        },
        lambda payload: ", ".join({2025: ["설날"]}.get(payload["year"], [])) or "공휴일 정보 없음",
    )
    (len(kit.schemas), kit.dispatch("get_weather", {"city": "서울"}))
  exercise:
    prompt: ToolKit에 도구 목록을 description으로 요약해 한 문장으로 만드는 describeAll 메서드를 추가하세요.
    starterCode: |-
      from typing import Callable

      class ToolKit:
          def __init__(self) -> None:
              self.schemas: list[dict] = []
              self.handlers: dict[str, Callable[[dict], str]] = {}

          def register(self, schema: dict, handler: Callable[[dict], str]) -> None:
              self.schemas.append(schema)
              self.handlers[schema["name"]] = handler

          def dispatch(self, name: str, payload: dict) -> str:
              if name not in self.handlers:
                  return f"오류: 알 수 없는 도구 {name}"
              try:
                  return self.handlers[name](payload)
              except (KeyError, ValueError, TypeError) as exc:
                  return f"오류: {exc}"

      kit = ToolKit()
      kit.register(
          {
              "name": "get_weather",
              "description": "특정 도시의 현재 날씨를 조회한다.",
              "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
          },
          lambda payload: {"서울": "맑음 12도"}.get(payload["city"], "데이터 없음"),
      )
      kit.register(
          {
              "name": "list_holidays",
              "description": "특정 연도의 한국 공휴일을 돌려준다.",
              "input_schema": {"type": "object", "properties": {"year": {"type": "integer"}}, "required": ["year"]},
          },
          lambda payload: ", ".join({2025: ["설날"]}.get(payload["year"], [])) or "공휴일 정보 없음",
      )
      (len(kit.schemas), kit.dispatch("get_weather", {"city": "서울"}))
    hints:
    - describeAll은 schemas의 name과 description을 모아 "name: description" 문자열 리스트를 join한 문자열을 돌려줍니다.
    - 자동화에서 이 함수 결과를 시스템 프롬프트에 넣어 도구 목록을 모델에 알려줄 수 있습니다.
  check:
    noError: ToolKit 정의와 두 도구 등록이 정상 실행되어야 합니다.
    resultCheck: kit.schemas 길이가 2이고 dispatch 결과가 "맑음 12도"여야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: ToolKit + 모델 루프 통합'
  structuredPrimary: true
  subtitle: 두 도구가 모두 호출되는 자연어 요청
  goal: 사용자 요청이 두 도구를 모두 요구하도록 만들어 ToolKit이 두 도구를 모두 호출하는지 검증한다.
  why: 멀티 도구의 의미는 한 사용자 요청이 두 도구를 묶어 결과를 만드는 데 있습니다. 모델이 둘 다 호출했는지 코드로 검증하면 자동화의 신뢰가 올라갑니다.
  explanation: 사용자가 "서울 날씨와 2025년 한국 공휴일을 묶어 알려줘"라고 요청합니다. ToolKit과 함께 messages.create를 루프로 호출해 모든 tool_use를
    처리합니다. 호출 추적 리스트에 두 도구 이름이 모두 포함되었는지 assertion으로 확인합니다.
  tips:
  - 사용자 요청에 두 도구의 키워드(날씨, 공휴일)를 명시하면 라우팅이 안정적입니다.
  snippet: |-
    import anthropic
    from typing import Callable

    class ToolKit:
        def __init__(self) -> None:
            self.schemas: list[dict] = []
            self.handlers: dict[str, Callable[[dict], str]] = {}

        def register(self, schema: dict, handler: Callable[[dict], str]) -> None:
            self.schemas.append(schema)
            self.handlers[schema["name"]] = handler

        def dispatch(self, name: str, payload: dict) -> str:
            if name not in self.handlers:
                return f"오류: 알 수 없는 도구 {name}"
            try:
                return self.handlers[name](payload)
            except (KeyError, ValueError, TypeError) as exc:
                return f"오류: {exc}"

    kit = ToolKit()
    kit.register(
        {
            "name": "get_weather",
            "description": "특정 도시의 현재 날씨를 조회한다.",
            "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
        },
        lambda payload: {"서울": "맑음 12도"}.get(payload["city"], "데이터 없음"),
    )
    kit.register(
        {
            "name": "list_holidays",
            "description": "특정 연도의 한국 공휴일을 돌려준다.",
            "input_schema": {"type": "object", "properties": {"year": {"type": "integer"}}, "required": ["year"]},
        },
        lambda payload: ", ".join({2025: ["설날 2025-01-29"]}.get(payload["year"], [])) or "공휴일 정보 없음",
    )

    def runWithKit(client, kitInstance: ToolKit, prompt: str, maxRounds: int = 5) -> dict:
        history = [{"role": "user", "content": prompt}]
        called: list[str] = []
        for _ in range(maxRounds):
            result = client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=400,
                tools=kitInstance.schemas,
                messages=history,
            )
            if result.stop_reason != "tool_use":
                text = "".join(block.text for block in result.content if block.type == "text")
                return {"text": text, "called": called}
            history.append({"role": "assistant", "content": result.content})
            blockResults = []
            for block in result.content:
                if block.type != "tool_use":
                    continue
                called.append(block.name)
                blockResults.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": kitInstance.dispatch(block.name, dict(block.input)),
                })
            history.append({"role": "user", "content": blockResults})
        return {"text": "max rounds reached", "called": called}

    client = anthropic.Anthropic()
    outcome = runWithKit(client, kit, "서울 날씨와 2025년 한국 공휴일을 묶어 한 단락으로 알려줘.")
    assert "get_weather" in outcome["called"]
    assert "list_holidays" in outcome["called"]
    outcome
  exercise:
    prompt: runWithKit이 도구별 호출 횟수도 함께 돌려주도록 called 사전으로 바꿔 보세요.
    starterCode: |-
      import anthropic
      from typing import Callable

      class ToolKit:
          def __init__(self) -> None:
              self.schemas: list[dict] = []
              self.handlers: dict[str, Callable[[dict], str]] = {}

          def register(self, schema: dict, handler: Callable[[dict], str]) -> None:
              self.schemas.append(schema)
              self.handlers[schema["name"]] = handler

          def dispatch(self, name: str, payload: dict) -> str:
              if name not in self.handlers:
                  return f"오류: 알 수 없는 도구 {name}"
              try:
                  return self.handlers[name](payload)
              except (KeyError, ValueError, TypeError) as exc:
                  return f"오류: {exc}"

      kit = ToolKit()
      kit.register(
          {
              "name": "get_weather",
              "description": "특정 도시의 현재 날씨를 조회한다.",
              "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
          },
          lambda payload: {"서울": "맑음 12도"}.get(payload["city"], "데이터 없음"),
      )
      kit.register(
          {
              "name": "list_holidays",
              "description": "특정 연도의 한국 공휴일을 돌려준다.",
              "input_schema": {"type": "object", "properties": {"year": {"type": "integer"}}, "required": ["year"]},
          },
          lambda payload: ", ".join({2025: ["설날 2025-01-29"]}.get(payload["year"], [])) or "공휴일 정보 없음",
      )

      def runWithKit(client, kitInstance: ToolKit, prompt: str, maxRounds: int = 5) -> dict:
          history = [{"role": "user", "content": prompt}]
          called: list[str] = []
          for _ in range(maxRounds):
              result = client.messages.create(
                  model="claude-haiku-4-5",
                  max_tokens=400,
                  tools=kitInstance.schemas,
                  messages=history,
              )
              if result.stop_reason != "tool_use":
                  text = "".join(block.text for block in result.content if block.type == "text")
                  return {"text": text, "called": called}
              history.append({"role": "assistant", "content": result.content})
              blockResults = []
              for block in result.content:
                  if block.type != "tool_use":
                      continue
                  called.append(block.name)
                  blockResults.append({
                      "type": "tool_result",
                      "tool_use_id": block.id,
                      "content": kitInstance.dispatch(block.name, dict(block.input)),
                  })
              history.append({"role": "user", "content": blockResults})
          return {"text": "max rounds reached", "called": called}

      client = anthropic.Anthropic()
      outcome = runWithKit(client, kit, "서울 날씨와 2025년 한국 공휴일을 묶어 한 단락으로 알려줘.")
      assert "get_weather" in outcome["called"]
      assert "list_holidays" in outcome["called"]
      outcome
    hints:
    - called를 사전으로 만들고 호출 시 called[name] = called.get(name, 0) + 1로 누적합니다.
    - 결과에 도구별 호출 횟수가 들어갑니다.
  check:
    noError: 호출과 assertion이 모두 정상 실행되어야 합니다.
    resultCheck: outcome["called"]에 두 도구 이름이 모두 포함되어야 합니다.
assessment:
  masteryVariants:
  - id: 09_multi-tool-dispatch-call-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - dispatcher
    title: 도구 이름으로 핸들러 라우팅하기
    subtitle: tool dispatcher
    goal: dispatch_tool_call(call)를 완성해 get_weather와 list_holidays 호출을 서로 다른 결과로 라우팅한다.
    why: 멀티 도구에서는 모델이 고른 이름을 로컬 핸들러로 정확히 연결하는 dispatcher가 핵심입니다.
    explanation: call은 name과 input을 가진 도구 호출 사전입니다. 알려진 두 도구는 정규화된 결과를 반환하고, 모르는 도구나 필수 인자 누락은 ValueError로 막습니다.
    tips:
    - 핸들러별 필수 인자를 먼저 확인합니다.
    - 반환 사전에 tool 이름을 넣어 추적 가능하게 만듭니다.
    exercise:
      prompt: dispatch_tool_call(call)를 완성해 도구별 실행 결과 사전을 반환하세요.
      starterCode: |-
        def dispatch_tool_call(call):
            raise NotImplementedError
      solution: |-
        def dispatch_tool_call(call):
            name = call.get("name")
            payload = dict(call.get("input", {}))
            if name == "get_weather":
                city = payload.get("city")
                if not city:
                    raise ValueError("city is required")
                return {"tool": "get_weather", "input": {"city": city}, "text": f"{city}: 맑음"}
            if name == "list_holidays":
                if "year" not in payload:
                    raise ValueError("year is required")
                year = int(payload["year"])
                return {
                    "tool": "list_holidays",
                    "input": {"year": year},
                    "items": ["New Year", "Chuseok"],
                }
            raise ValueError("unknown tool")
      hints:
      - call["input"]은 도구별로 다른 키를 가집니다.
      - 모르는 도구 이름은 조용히 무시하지 않습니다.
    check:
      id: python.llm.multi-tool.dispatch-call.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-tool.empty.behavior.v1.fixture
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
        entry: dispatch_tool_call
        cases:
        - id: dispatches-weather-tool
          arguments:
          - value:
              name: get_weather
              input:
                city: 서울
          expectedReturn:
            tool: get_weather
            input:
              city: 서울
            text: '서울: 맑음'
        - id: dispatches-holiday-tool
          arguments:
          - value:
              name: list_holidays
              input:
                year: 2025
          expectedReturn:
            tool: list_holidays
            input:
              year: 2025
            items:
            - New Year
            - Chuseok
        - id: rejects-unknown-tool
          arguments:
          - value:
              name: send_email
              input:
                to: user@example.com
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 09_multi-tool-count-calls-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - error_handling
    - toolkit_class
    title: 멀티 도구 호출과 오류를 집계하기
    subtitle: tool call telemetry
    goal: count_tool_calls(calls)를 완성해 허용된 도구별 호출 수와 오류 목록을 반환한다.
    why: 학습 화면과 자동화 로그는 도구가 실제로 어떻게 선택되었는지 즉시 보여줘야 합니다.
    explanation: calls는 여러 tool_use 요청 목록입니다. 허용된 도구 이름은 횟수를 누적하고, 모르는 도구는 errors에 남겨 errorCount로 집계합니다.
    tips:
    - called는 도구 이름별 카운트 사전입니다.
    - 오류도 데이터로 남겨야 다음 학습 피드백을 만들 수 있습니다.
    exercise:
      prompt: count_tool_calls(calls)를 완성해 called, errorCount, errors를 반환하세요.
      starterCode: |-
        def count_tool_calls(calls):
            raise NotImplementedError
      solution: |-
        def count_tool_calls(calls):
            allowed = {"get_weather", "list_holidays"}
            called = {}
            errors = []
            for call in calls:
                name = call.get("name")
                if name not in allowed:
                    errors.append({"name": str(name), "error": "unknown tool"})
                    continue
                called[name] = called.get(name, 0) + 1
            return {"called": called, "errorCount": len(errors), "errors": errors}
      hints:
      - 허용 목록을 set으로 두면 분기가 명확합니다.
      - 모르는 도구도 로그에 남기고 반복은 계속합니다.
    check:
      id: python.llm.multi-tool.count-calls.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-tool.empty.behavior.v1.fixture
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
        entry: count_tool_calls
        cases:
        - id: counts-known-tools-and-errors
          arguments:
          - value:
            - name: get_weather
              input:
                city: 서울
            - name: list_holidays
              input:
                year: 2025
            - name: get_weather
              input:
                city: 부산
            - name: send_email
              input:
                to: user@example.com
          expectedReturn:
            called:
              get_weather: 2
              list_holidays: 1
            errorCount: 1
            errors:
            - name: send_email
              error: unknown tool
        - id: handles-empty-call-list
          arguments:
          - value: []
          expectedReturn:
            called: {}
            errorCount: 0
            errors: []
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 09_multi-tool-rule-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 09_multi-tool-count-calls-transfer
    title: 멀티 도구 라우팅 규칙 회상하기
    subtitle: multi tool recall
    goal: choose_multi_tool_rule(goal)를 완성해 멀티 도구 상황별 규칙과 실패 위험을 반환한다.
    why: 도구가 늘어날수록 스키마 등록, dispatcher, 검증, 오류 회신, 호출 집계가 분리되어야 운영이 안정됩니다.
    explanation: registry, dispatcher, validation, error-result, call-count 상황별로 적용할 규칙을 선택하세요.
    tips:
    - registry와 dispatcher가 어긋나면 등록된 도구를 실행하지 못합니다.
    - 오류도 tool_result로 돌려주면 모델이 흐름을 이어갈 수 있습니다.
    exercise:
      prompt: choose_multi_tool_rule(goal)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_multi_tool_rule(goal):
            raise NotImplementedError
      solution: |-
        def choose_multi_tool_rule(goal):
            table = {
                "registry": {"rule": "keep tool schemas in one list", "useWhen": "exposing multiple tools", "risk": "missing tool"},
                "dispatcher": {"rule": "map tool name to local handler", "useWhen": "tool_use arrives", "risk": "wrong handler"},
                "validation": {"rule": "validate required inputs per tool", "useWhen": "before calling handler", "risk": "handler crash"},
                "error-result": {"rule": "return structured error for recoverable failures", "useWhen": "handler cannot run", "risk": "dead loop"},
                "call-count": {"rule": "count selected tools by name", "useWhen": "auditing routing quality", "risk": "invisible behavior"},
            }
            if goal not in table:
                raise ValueError("unknown multi tool goal")
            return table[goal]
      hints:
      - 멀티 도구의 품질은 선택된 도구 목록으로 검산합니다.
      - 입력 검증은 dispatcher 안쪽에서 도구별로 처리합니다.
    check:
      id: python.llm.multi-tool.rule-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-tool.empty.behavior.v1.fixture
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
        entry: choose_multi_tool_rule
        cases:
        - id: recalls-dispatcher-rule
          arguments:
          - value: dispatcher
          expectedReturn:
            rule: map tool name to local handler
            useWhen: tool_use arrives
            risk: wrong handler
        - id: recalls-call-count-rule
          arguments:
          - value: call-count
          expectedReturn:
            rule: count selected tools by name
            useWhen: auditing routing quality
            risk: invisible behavior
        - id: rejects-unknown-goal
          arguments:
          - value: one-big-function
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
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