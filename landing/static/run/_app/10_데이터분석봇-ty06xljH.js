var e=`meta:\r
  packages:\r
  - anthropic\r
  - pandas\r
  id: llmBasics_10\r
  title: 데이터분석봇\r
  order: 10\r
  category: llmBasics\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - anthropic\r
  - 종합\r
  - 데이터분석\r
  - 자동화\r
  - tool_use\r
  - caching\r
  seo:\r
    title: Claude 데이터 분석 봇 종합 - 캐싱+도구+JSON 합성\r
    description: 캐싱된 시스템 프롬프트, CSV 로딩 도구, JSON 구조화 출력으로 한 줄 자연어 요청에서 분석 결과를 만드는 자동화 봇을 빌드합니다.\r
    keywords:\r
    - data analysis bot\r
    - tool use\r
    - prompt caching\r
    - JSON output\r
    - automation\r
intro:\r
  emoji: 🤖\r
  goal: 캐싱·도구·JSON 출력을 합성해 자연어 한 줄 요청을 구조화 분석 결과로 바꾸는 봇을 만든다.\r
  description: 트랙에서 배운 흐름을 한 자동화 봇에 묶습니다. tips 데이터셋을 도구로 노출하고 캐싱된 시스템 프롬프트와 JSON 구조화 출력으로 신뢰 가능한 자동화 응답을 만듭니다.\r
  direction: 도구 정의(데이터 로드·요약·집계) → 캐시 시스템 → JSON 출력 강제 → 종합 봇 클래스화 순으로 발전시킨다.\r
  benefits:\r
  - 도구 사용 루프와 JSON 강제 출력을 같은 호출에 결합하는 패턴을 익힌다.\r
  - 캐시된 시스템 프롬프트로 반복 호출 비용을 줄인다.\r
  - 자동화에서 재사용 가능한 분석 봇 클래스를 만든다.\r
  - 결과 사전 한 개로 다른 단계(저장, 시각화)로 넘기는 흐름을 잡는다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 도구 묶음\r
      detail: load_dataset, summarize, group_mean 세 도구를 등록한다.\r
    - label: 2단계. 캐시된 분석 시스템\r
      detail: 분석 정책 시스템 프롬프트를 캐싱한다.\r
    - label: 3단계. JSON 분석 결과\r
      detail: 응답을 분석 결과 JSON으로 강제한다.\r
    - label: 4단계. AnalysisBot 클래스\r
      detail: 한 메서드 호출로 자연어 → JSON 분석 결과를 만드는 봇을 만든다.\r
    runtime:\r
    - label: LLM 호출 환경\r
      detail: anthropic, pandas와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.\r
    - label: 데이터분석봇 실행\r
      detail: tips 데이터셋에서 자연어 분석 요청을 끝까지 처리한다.\r
    - label: 데이터분석봇 완료\r
      detail: LLM 통합 트랙 전체 흐름이 하나의 봇으로 정리된다.\r
sections:\r
- id: data_tools\r
  title: 1단계. 데이터 도구 묶음 등록\r
  structuredPrimary: true\r
  subtitle: load_dataset / summarize / group_mean\r
  goal: tips 데이터셋을 다루는 세 도구를 ToolKit에 등록한다.\r
  why: 데이터 분석 자동화에서는 "데이터 로드 → 요약 → 그룹 집계"가 가장 흔한 패턴입니다. 세 도구로 분리하면 모델이 흐름을 따라가기 쉽습니다.\r
  explanation: load_dataset은 데이터셋 이름을 받아 행 수와 컬럼 목록을 돌려줍니다. summarize는 데이터 행/평균/주요 컬럼 요약을 돌려줍니다. group_mean은\r
    분류 컬럼과 측정 컬럼을 받아 그룹 평균을 돌려줍니다. 모든 결과는 JSON 문자열로 통일합니다.\r
  tips:\r
  - 도구 결과는 항상 JSON 문자열로 통일해 두면 모델이 도구 결과를 한 방식으로 다룹니다.\r
  snippet: |-\r
    import json\r
    from typing import Callable\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    class DataToolKit:\r
        def __init__(self) -> None:\r
            self.schemas: list[dict] = []\r
            self.handlers: dict[str, Callable[[dict], str]] = {}\r
\r
        def register(self, schema: dict, handler: Callable[[dict], str]) -> None:\r
            self.schemas.append(schema)\r
            self.handlers[schema["name"]] = handler\r
\r
        def dispatch(self, name: str, payload: dict) -> str:\r
            if name not in self.handlers:\r
                return json.dumps({"error": f"unknown tool {name}"})\r
            try:\r
                return self.handlers[name](payload)\r
            except (KeyError, ValueError, TypeError) as exc:\r
                return json.dumps({"error": str(exc)})\r
\r
    def handleLoad(payload: dict) -> str:\r
        frame = loadLocalDataset(payload["name"])\r
        return json.dumps({"rows": int(frame.shape[0]), "columns": list(frame.columns)})\r
\r
    def handleSummarize(payload: dict) -> str:\r
        frame = loadLocalDataset(payload["name"])\r
        numeric = frame.select_dtypes(include="number")\r
        means = numeric.mean().round(3).to_dict()\r
        return json.dumps({"rows": int(frame.shape[0]), "numeric_means": means})\r
\r
    def handleGroupMean(payload: dict) -> str:\r
        frame = loadLocalDataset(payload["name"])\r
        grouped = frame.groupby(payload["group"])[payload["target"]].mean().round(3)\r
        return json.dumps({"group": payload["group"], "target": payload["target"], "values": grouped.to_dict()})\r
\r
    kit = DataToolKit()\r
    kit.register(\r
        {\r
            "name": "load_dataset",\r
            "description": "Codaro 로컬 데이터셋의 행 수와 컬럼 이름을 돌려준다.",\r
            "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
        },\r
        handleLoad,\r
    )\r
    kit.register(\r
        {\r
            "name": "summarize",\r
            "description": "데이터셋의 수치 컬럼 평균과 행 수를 돌려준다.",\r
            "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
        },\r
        handleSummarize,\r
    )\r
    kit.register(\r
        {\r
            "name": "group_mean",\r
            "description": "데이터셋에서 그룹별 측정 컬럼 평균을 돌려준다.",\r
            "input_schema": {\r
                "type": "object",\r
                "properties": {\r
                    "name": {"type": "string"},\r
                    "group": {"type": "string"},\r
                    "target": {"type": "string"},\r
                },\r
                "required": ["name", "group", "target"],\r
            },\r
        },\r
        handleGroupMean,\r
    )\r
    (len(kit.schemas), kit.dispatch("load_dataset", {"name": "tips"}))\r
  exercise:\r
    prompt: kit에 top_rows 도구를 추가해 데이터셋의 첫 N행을 JSON 문자열로 돌려주도록 만드세요.\r
    starterCode: |-\r
      import json\r
      from typing import Callable\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      class DataToolKit:\r
          def __init__(self) -> None:\r
              self.schemas: list[dict] = []\r
              self.handlers: dict[str, Callable[[dict], str]] = {}\r
\r
          def register(self, schema: dict, handler: Callable[[dict], str]) -> None:\r
              self.schemas.append(schema)\r
              self.handlers[schema["name"]] = handler\r
\r
          def dispatch(self, name: str, payload: dict) -> str:\r
              if name not in self.handlers:\r
                  return json.dumps({"error": f"unknown tool {name}"})\r
              try:\r
                  return self.handlers[name](payload)\r
              except (KeyError, ValueError, TypeError) as exc:\r
                  return json.dumps({"error": str(exc)})\r
\r
      def handleLoad(payload: dict) -> str:\r
          frame = loadLocalDataset(payload["name"])\r
          return json.dumps({"rows": int(frame.shape[0]), "columns": list(frame.columns)})\r
\r
      def handleSummarize(payload: dict) -> str:\r
          frame = loadLocalDataset(payload["name"])\r
          numeric = frame.select_dtypes(include="number")\r
          means = numeric.mean().round(3).to_dict()\r
          return json.dumps({"rows": int(frame.shape[0]), "numeric_means": means})\r
\r
      def handleGroupMean(payload: dict) -> str:\r
          frame = loadLocalDataset(payload["name"])\r
          grouped = frame.groupby(payload["group"])[payload["target"]].mean().round(3)\r
          return json.dumps({"group": payload["group"], "target": payload["target"], "values": grouped.to_dict()})\r
\r
      kit = DataToolKit()\r
      kit.register(\r
          {\r
              "name": "load_dataset",\r
              "description": "Codaro 로컬 데이터셋의 행 수와 컬럼 이름을 돌려준다.",\r
              "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
          },\r
          handleLoad,\r
      )\r
      kit.register(\r
          {\r
              "name": "summarize",\r
              "description": "데이터셋의 수치 컬럼 평균과 행 수를 돌려준다.",\r
              "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
          },\r
          handleSummarize,\r
      )\r
      kit.register(\r
          {\r
              "name": "group_mean",\r
              "description": "데이터셋에서 그룹별 측정 컬럼 평균을 돌려준다.",\r
              "input_schema": {\r
                  "type": "object",\r
                  "properties": {\r
                      "name": {"type": "string"},\r
                      "group": {"type": "string"},\r
                      "target": {"type": "string"},\r
                  },\r
                  "required": ["name", "group", "target"],\r
              },\r
          },\r
          handleGroupMean,\r
      )\r
      (len(kit.schemas), kit.dispatch("load_dataset", {"name": "tips"}))\r
    hints:\r
    - handleTopRows(payload)가 frame.head(payload["count"]).to_dict(orient="records")를 json.dumps로 감싸 돌려주도록 만듭니다.\r
    - 스키마는 name(데이터셋)과 count(정수) 두 인자를 받습니다.\r
  check:\r
    noError: ToolKit 정의와 모든 등록, dispatch 호출이 정상 실행되어야 합니다.\r
    resultCheck: kit.schemas 길이가 3 이상이고 load_dataset 호출이 행/컬럼 정보를 돌려줘야 합니다.\r
- id: cached_system\r
  title: 2단계. 캐시된 분석 시스템\r
  structuredPrimary: true\r
  subtitle: 분석 정책을 캐싱\r
  goal: 분석 봇의 시스템 프롬프트를 캐시 마킹된 블록 리스트로 만든다.\r
  why: 분석 봇은 한 세션 안에 여러 호출을 받습니다. 시스템 프롬프트가 캐시되면 두 번째 호출부터 비용이 크게 줄어듭니다.\r
  explanation: 시스템 프롬프트는 (1) 봇 정체성 (2) 사용 가능한 도구 목록 (3) 출력 형식 세 부분으로 구성합니다. 도구 목록은 ToolKit에서 자동 생성한 텍스트를\r
    그대로 넣고, cache_control로 5분 ephemeral 캐시에 저장합니다.\r
  tips:\r
  - 도구 목록 문자열을 시스템에 넣어 두면 모델이 도구 description을 모두 보고 더 정확한 라우팅을 합니다.\r
  snippet: |-\r
    def describeKit(toolkit) -> str:\r
        lines = [f"- {schema['name']}: {schema['description']}" for schema in toolkit.schemas]\r
        return "\\n".join(lines)\r
\r
    def buildAnalysisSystem(toolkit) -> list[dict]:\r
        body = (\r
            "너는 Codaro 데이터 분석 봇이다. 다음 규칙을 모두 따른다.\\n"\r
            "- 한국어로만 응답한다.\\n"\r
            "- 분석에는 등록된 도구를 적극 사용한다.\\n"\r
            "- 최종 응답은 valid JSON 한 개로 끝낸다. 코드 블록 마크다운, 추가 설명 금지.\\n"\r
            "- JSON의 키는 정확히 question, dataset, insight, metrics 네 개를 사용한다.\\n\\n"\r
            "사용 가능한 도구 목록:\\n"\r
            f"{describeKit(toolkit)}"\r
        )\r
        return [{"type": "text", "text": body, "cache_control": {"type": "ephemeral"}}]\r
\r
    sampleKit = type("Stub", (), {"schemas": [{"name": "load_dataset", "description": "데이터셋 로드"}]})()\r
    sampleSystem = buildAnalysisSystem(sampleKit)\r
    (sampleSystem[0]["text"][:60], "cache_control" in sampleSystem[0])\r
  exercise:\r
    prompt: buildAnalysisSystem이 두 번째 블록(usage examples)을 캐싱 없이 추가하도록 확장하세요.\r
    starterCode: |-\r
      def describeKit(toolkit) -> str:\r
          lines = [f"- {schema['name']}: {schema['description']}" for schema in toolkit.schemas]\r
          return "\\n".join(lines)\r
\r
      def buildAnalysisSystem(toolkit) -> list[dict]:\r
          body = (\r
              "너는 Codaro 데이터 분석 봇이다. 다음 규칙을 모두 따른다.\\n"\r
              "- 한국어로만 응답한다.\\n"\r
              "- 분석에는 등록된 도구를 적극 사용한다.\\n"\r
              "- 최종 응답은 valid JSON 한 개로 끝낸다. 코드 블록 마크다운, 추가 설명 금지.\\n"\r
              "- JSON의 키는 정확히 question, dataset, insight, metrics 네 개를 사용한다.\\n\\n"\r
              "사용 가능한 도구 목록:\\n"\r
              f"{describeKit(toolkit)}"\r
          )\r
          return [{"type": "text", "text": body, "cache_control": {"type": "ephemeral"}}]\r
\r
      sampleKit = type("Stub", (), {"schemas": [{"name": "load_dataset", "description": "데이터셋 로드"}]})()\r
      sampleSystem = buildAnalysisSystem(sampleKit)\r
      (sampleSystem[0]["text"][:60], "cache_control" in sampleSystem[0])\r
    hints:\r
    - 두 번째 블록은 사용 예시 문장을 담은 type=text 사전으로 추가합니다.\r
    - cache_control을 두지 않으면 캐싱 대상이 아닙니다.\r
  check:\r
    noError: 함수 정의가 정상 실행되어야 합니다.\r
    resultCheck: sampleSystem이 cache_control 키를 가진 사전을 첫 항목으로 가져야 합니다.\r
- id: json_finish\r
  title: 3단계. JSON 강제 출력\r
  structuredPrimary: true\r
  subtitle: 최종 응답을 JSON으로 prefill\r
  goal: 도구 루프 종료 후 마지막 호출에서 assistant prefill로 JSON 출력을 강제한다.\r
  why: 분석 봇의 결과는 코드의 다음 단계가 받습니다. 응답이 JSON이어야 자동화가 다음 단계로 안전하게 넘어갑니다.\r
  explanation: 도구 루프 마지막 호출 시 messages 끝에 assistant 메시지를 "{"로 추가합니다. 모델이 JSON을 이어 작성하고 호출 측에서 "{"를 다시 붙여\r
    json.loads합니다. 파싱 실패 시 한 번 재시도하는 안전망까지 둡니다.\r
  tips:\r
  - 도구 루프가 진행 중일 때는 prefill을 넣지 않습니다. 도구가 끝난 마지막 라운드에만 prefill을 적용합니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
\r
    def runFinalWithJson(client, system, history) -> dict:\r
        attempts = 0\r
        while attempts < 2:\r
            result = client.messages.create(\r
                model="claude-haiku-4-5",\r
                max_tokens=400,\r
                system=system,\r
                messages=history + [{"role": "assistant", "content": "{"}],\r
            )\r
            raw = "".join(block.text for block in result.content if block.type == "text")\r
            try:\r
                return json.loads("{" + raw)\r
            except json.JSONDecodeError:\r
                attempts += 1\r
        raise ValueError("failed to produce JSON after retries")\r
\r
    sampleSystem = [{"type": "text", "text": "JSON 형식 강제 시스템", "cache_control": {"type": "ephemeral"}}]\r
    runFinalWithJson\r
  exercise:\r
    prompt: runFinalWithJson이 attempts 횟수를 호출자에게 알려주도록 결과 사전에 _attempts 키를 추가하세요.\r
    starterCode: |-\r
      import json\r
      import anthropic\r
\r
      def runFinalWithJson(client, system, history) -> dict:\r
          attempts = 0\r
          while attempts < 2:\r
              result = client.messages.create(\r
                  model="claude-haiku-4-5",\r
                  max_tokens=400,\r
                  system=system,\r
                  messages=history + [{"role": "assistant", "content": "{"}],\r
              )\r
              raw = "".join(block.text for block in result.content if block.type == "text")\r
              try:\r
                  return json.loads("{" + raw)\r
              except json.JSONDecodeError:\r
                  attempts += 1\r
          raise ValueError("failed to produce JSON after retries")\r
\r
      sampleSystem = [{"type": "text", "text": "JSON 형식 강제 시스템", "cache_control": {"type": "ephemeral"}}]\r
      runFinalWithJson\r
    hints:\r
    - 성공 시 parsed["_attempts"] = attempts + 1로 표시하고 돌려줍니다.\r
    - 자동화 측에서 재시도가 일어났는지 확인할 수 있습니다.\r
  check:\r
    noError: 함수 정의가 정상 평가되어야 합니다.\r
    resultCheck: runFinalWithJson이 함수 객체로 평가되어야 합니다.\r
- id: analysis_bot\r
  title: 4단계. AnalysisBot 클래스\r
  structuredPrimary: true\r
  subtitle: 한 메서드 호출로 자연어 → JSON 분석 결과\r
  goal: AnalysisBot.ask(question) 한 번 호출로 도구 사용·JSON 출력·캐시 적용까지 모두 합쳐진 응답을 얻는다.\r
  why: 자동화 클라이언트가 한 줄 호출로 분석 결과를 받을 수 있어야 다른 코드와 결합하기 쉽습니다.\r
  explanation: AnalysisBot은 ToolKit과 system 블록을 보관합니다. ask 메서드는 도구 사용 루프를 돌리고 마지막 라운드에서 JSON prefill로 결과를\r
    강제합니다. 결과 사전은 question/dataset/insight/metrics 네 키를 가집니다.\r
  tips:\r
  - ask 호출마다 새로운 history를 만들어 봇이 단일 호출 단위로 동작하도록 합니다. 멀티턴은 상위 호출자가 관리합니다.\r
  snippet: |-\r
    import json\r
    import anthropic\r
    from typing import Callable\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    class DataToolKit:\r
        def __init__(self) -> None:\r
            self.schemas: list[dict] = []\r
            self.handlers: dict[str, Callable[[dict], str]] = {}\r
\r
        def register(self, schema: dict, handler: Callable[[dict], str]) -> None:\r
            self.schemas.append(schema)\r
            self.handlers[schema["name"]] = handler\r
\r
        def dispatch(self, name: str, payload: dict) -> str:\r
            if name not in self.handlers:\r
                return json.dumps({"error": f"unknown tool {name}"})\r
            try:\r
                return self.handlers[name](payload)\r
            except (KeyError, ValueError, TypeError) as exc:\r
                return json.dumps({"error": str(exc)})\r
\r
    def describeKit(toolkit) -> str:\r
        return "\\n".join(f"- {schema['name']}: {schema['description']}" for schema in toolkit.schemas)\r
\r
    class AnalysisBot:\r
        def __init__(self, toolkit: DataToolKit, model: str = "claude-haiku-4-5") -> None:\r
            self.client = anthropic.Anthropic()\r
            self.toolkit = toolkit\r
            self.model = model\r
            self.system = [\r
                {\r
                    "type": "text",\r
                    "text": (\r
                        "너는 Codaro 데이터 분석 봇이다. 다음 규칙을 따른다.\\n"\r
                        "- 도구를 적극 사용한다.\\n"\r
                        "- 최종 응답은 valid JSON 한 개만. 코드 블록·추가 설명 금지.\\n"\r
                        "- 키는 question, dataset, insight, metrics 네 개만.\\n\\n"\r
                        f"사용 가능한 도구:\\n{describeKit(toolkit)}"\r
                    ),\r
                    "cache_control": {"type": "ephemeral"},\r
                }\r
            ]\r
\r
        def ask(self, question: str, maxRounds: int = 5) -> dict:\r
            history: list[dict] = [{"role": "user", "content": question}]\r
            for _ in range(maxRounds):\r
                result = self.client.messages.create(\r
                    model=self.model,\r
                    max_tokens=600,\r
                    system=self.system,\r
                    tools=self.toolkit.schemas,\r
                    messages=history,\r
                )\r
                if result.stop_reason != "tool_use":\r
                    break\r
                history.append({"role": "assistant", "content": result.content})\r
                blockResults = []\r
                for block in result.content:\r
                    if block.type != "tool_use":\r
                        continue\r
                    blockResults.append({\r
                        "type": "tool_result",\r
                        "tool_use_id": block.id,\r
                        "content": self.toolkit.dispatch(block.name, dict(block.input)),\r
                    })\r
                history.append({"role": "user", "content": blockResults})\r
            for attempt in range(2):\r
                finalResult = self.client.messages.create(\r
                    model=self.model,\r
                    max_tokens=400,\r
                    system=self.system,\r
                    tools=self.toolkit.schemas,\r
                    messages=history + [{"role": "assistant", "content": "{"}],\r
                )\r
                rawText = "".join(block.text for block in finalResult.content if block.type == "text")\r
                try:\r
                    return json.loads("{" + rawText)\r
                except json.JSONDecodeError:\r
                    if attempt == 1:\r
                        raise ValueError(f"AnalysisBot JSON failed: {rawText[:120]}")\r
            return {}\r
\r
    def buildKit() -> DataToolKit:\r
        kit = DataToolKit()\r
        kit.register(\r
            {\r
                "name": "load_dataset",\r
                "description": "Codaro 로컬 데이터셋의 행 수와 컬럼 이름을 돌려준다.",\r
                "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
            },\r
            lambda payload: json.dumps({\r
                "rows": int(loadLocalDataset(payload["name"]).shape[0]),\r
                "columns": list(loadLocalDataset(payload["name"]).columns),\r
            }),\r
        )\r
        kit.register(\r
            {\r
                "name": "summarize",\r
                "description": "데이터셋의 수치 컬럼 평균과 행 수를 돌려준다.",\r
                "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\r
            },\r
            lambda payload: json.dumps({\r
                "rows": int(loadLocalDataset(payload["name"]).shape[0]),\r
                "numeric_means": loadLocalDataset(payload["name"]).select_dtypes(include="number").mean().round(3).to_dict(),\r
            }),\r
        )\r
        kit.register(\r
            {\r
                "name": "group_mean",\r
                "description": "데이터셋에서 그룹 컬럼별 측정 컬럼 평균을 돌려준다.",\r
                "input_schema": {\r
                    "type": "object",\r
                    "properties": {\r
                        "name": {"type": "string"},\r
                        "group": {"type": "string"},\r
                        "target": {"type": "string"},\r
                    },\r
                    "required": ["name", "group", "target"],\r
                },\r
            },\r
            lambda payload: json.dumps({\r
                "values": loadLocalDataset(payload["name"])\r
                    .groupby(payload["group"])[payload["target"]]\r
                    .mean()\r
                    .round(3)\r
                    .to_dict()\r
            }),\r
        )\r
        return kit\r
\r
    bot = AnalysisBot(buildKit())\r
    bot\r
  exercise:\r
    prompt: AnalysisBot.ask가 결과 dict에 호출 비용도 함께 담아 돌려주도록 totalUsage 누적 필드를 추가하세요.\r
    starterCode: |-\r
      # 위 snippet과 같은 AnalysisBot 구조를 그대로 두고 ask 메서드 안에서\r
      # totalUsage 사전에 input_tokens / output_tokens를 누적해 마지막 반환 사전에 함께 담으세요.\r
      "see snippet"\r
    hints:\r
    - 메서드 시작에서 totalUsage 사전을 input_tokens 0과 output_tokens 0으로 초기화합니다.\r
    - 모든 호출 직후 result.usage 값을 누적하고 마지막 반환 사전에 _usage 키로 함께 돌려줍니다.\r
  check:\r
    noError: AnalysisBot 클래스 정의가 정상 평가되어야 합니다.\r
    resultCheck: bot 변수가 AnalysisBot 인스턴스로 평가되어야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 자연어 분석 요청 → JSON 결과'\r
  structuredPrimary: true\r
  subtitle: tips 데이터셋에서 그룹별 팁 비교\r
  goal: bot.ask로 tips 데이터셋의 day별 tip 평균을 자연어로 묻고 결과 JSON이 정확한 키를 갖는지 검증한다.\r
  why: 종합 봇의 가치는 자연어 요청 한 줄로 끝나는 데 있습니다. 결과 모양을 검증하면 자동화 다음 단계가 안전하게 받아갑니다.\r
  explanation: 자연어 질문에 데이터셋(tips)과 분석 키워드(요일별 팁 평균)를 명시합니다. bot.ask 결과 사전이 question/dataset/insight/metrics\r
    네 키를 모두 가지는지, metrics가 숫자 사전인지 assertion으로 확인합니다.\r
  tips:\r
  - 자연어 질문에 데이터셋 이름과 분석 차원을 명시하면 도구 호출이 안정적으로 됩니다.\r
  snippet: |-\r
    # 위 4단계의 AnalysisBot 정의가 이미 실행되어 있다고 가정합니다.\r
    insight = bot.ask("tips 데이터셋에서 요일(day)별 tip 평균을 비교해 줘.")\r
    assert isinstance(insight, dict)\r
    assert set(insight.keys()) >= {"question", "dataset", "insight", "metrics"}\r
    assert isinstance(insight["metrics"], dict)\r
    assert len(insight["metrics"]) > 0\r
    insight\r
  exercise:\r
    prompt: 같은 봇으로 다른 분석 요청("시간대(time)별 total_bill 평균")을 한 번 더 보내 두 결과의 키 집합이 같은지 확인하세요.\r
    starterCode: |-\r
      insightTwo = bot.ask("tips 데이터셋에서 시간대(time)별 total_bill 평균을 비교해 줘.")\r
      assert set(insight.keys()) == set(insightTwo.keys())\r
      insightTwo\r
    hints:\r
    - 변수명이 insight과 겹치지 않도록 insightTwo 같은 다른 이름을 씁니다.\r
    - 두 응답 모두 question/dataset/insight/metrics 네 키를 가져야 합니다.\r
  check:
    noError: bot.ask 호출과 assertion이 모두 정상 실행되어야 합니다.
    resultCheck: insight 사전이 네 키를 가지고 metrics가 비어 있지 않아야 합니다.
assessment:
  masteryVariants:
  - id: 10_data-bot-numeric-summary-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - data_tools
    title: 인라인 데이터의 수치 컬럼 요약하기
    subtitle: numeric summary
    goal: summarize_numeric_column(rows, column)를 완성해 count, mean, min, max를 반환한다.
    why: 분석 봇도 계산 자체는 결정적 코드로 검증할 수 있어야 결과를 믿고 다음 단계로 넘길 수 있습니다.
    explanation: rows는 사전 목록이고 column은 수치 컬럼 이름입니다. 컬럼이 없거나 값이 숫자로 변환되지 않으면 ValueError를 발생시킵니다.
    tips:
    - mean은 소수점 3자리로 고정해 화면과 테스트가 흔들리지 않게 합니다.
    - 빈 rows는 분석할 표본이 없으므로 실패로 처리합니다.
    exercise:
      prompt: summarize_numeric_column(rows, column)를 완성해 column, count, mean, min, max를 반환하세요.
      starterCode: |-
        def summarize_numeric_column(rows, column):
            raise NotImplementedError
      solution: |-
        def summarize_numeric_column(rows, column):
            values = []
            for row in rows:
                if column not in row:
                    raise ValueError("column missing")
                try:
                    values.append(float(row[column]))
                except (TypeError, ValueError) as exc:
                    raise ValueError("column must be numeric") from exc
            if not values:
                raise ValueError("rows must not be empty")
            return {
                "column": column,
                "count": len(values),
                "mean": round(sum(values) / len(values), 3),
                "min": min(values),
                "max": max(values),
            }
      hints:
      - 값을 모두 float로 바꾼 뒤 집계합니다.
      - 비어 있는 데이터와 누락 컬럼은 같은 성공 흐름에 넣지 않습니다.
    check:
      id: python.llm.data-bot.numeric-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.data-bot.empty.behavior.v1.fixture
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
        entry: summarize_numeric_column
        cases:
        - id: summarizes-total-bill-column
          arguments:
          - value:
            - total_bill: 10
              tip: 1.5
            - total_bill: 20
              tip: 3.0
            - total_bill: 15
              tip: 2.0
          - value: total_bill
          expectedReturn:
            column: total_bill
            count: 3
            mean: 15.0
            min: 10.0
            max: 20.0
        - id: rejects-missing-column
          arguments:
          - value:
            - total_bill: 10
          - value: tip
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 10_data-bot-group-mean-answer-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - json_finish
    - analysis_bot
    title: 그룹 평균 결과를 분석 응답 사전으로 만들기
    subtitle: group mean answer
    goal: answer_group_mean(rows, group_column, target_column)를 완성해 question, dataset, insight, metrics를 반환한다.
    why: 웹에서도 학습자가 바로 분석 흐름을 확인하려면 데이터 도구 결과가 구조화 응답으로 닫혀야 합니다.
    explanation: group_column별로 target_column 평균을 계산하고 가장 평균이 높은 그룹을 insight에 담습니다. 결과는 다음 화면이나 저장 단계가 바로 사용할 수 있는 사전입니다.
    tips:
    - metrics 값은 소수점 3자리로 고정합니다.
    - best group은 평균값이 가장 큰 그룹입니다.
    exercise:
      prompt: answer_group_mean(rows, group_column, target_column)를 완성해 구조화 분석 응답을 반환하세요.
      starterCode: |-
        def answer_group_mean(rows, group_column, target_column):
            raise NotImplementedError
      solution: |-
        def answer_group_mean(rows, group_column, target_column):
            groups = {}
            for row in rows:
                if group_column not in row or target_column not in row:
                    raise ValueError("required column missing")
                group = str(row[group_column])
                try:
                    value = float(row[target_column])
                except (TypeError, ValueError) as exc:
                    raise ValueError("target column must be numeric") from exc
                groups.setdefault(group, []).append(value)
            if not groups:
                raise ValueError("rows must not be empty")
            metrics = {
                group: round(sum(values) / len(values), 3)
                for group, values in groups.items()
            }
            best_group = max(metrics, key=metrics.get)
            return {
                "question": "group mean",
                "dataset": "inline",
                "insight": f"{best_group} highest",
                "metrics": metrics,
            }
      hints:
      - 그룹별 리스트를 만든 뒤 평균을 계산합니다.
      - 구조화 응답은 question, dataset, insight, metrics 네 키를 유지합니다.
    check:
      id: python.llm.data-bot.group-mean-answer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.data-bot.empty.behavior.v1.fixture
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
        entry: answer_group_mean
        cases:
        - id: returns-structured-group-mean-answer
          arguments:
          - value:
            - time: Lunch
              total_bill: 12
            - time: Lunch
              total_bill: 18
            - time: Dinner
              total_bill: 30
            - time: Dinner
              total_bill: 20
          - value: time
          - value: total_bill
          expectedReturn:
            question: group mean
            dataset: inline
            insight: Dinner highest
            metrics:
              Lunch: 15.0
              Dinner: 25.0
        - id: rejects-empty-rows
          arguments:
          - value: []
          - value: day
          - value: tip
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 10_data-bot-component-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - data_tools
    - cached_system
    - json_finish
    - analysis_bot
    title: 분석 봇 구성 요소 회상하기
    subtitle: analysis bot recall
    goal: choose_analysis_bot_component(goal)를 완성해 분석 봇 상황별 구성 요소와 실패 위험을 반환한다.
    why: 종합 봇은 데이터 도구, 캐시 시스템, JSON 마감, 사용량 추적, 로컬 데이터 경계가 함께 맞아야 학습과 자동화가 이어집니다.
    explanation: data-tools, cached-system, json-finish, usage-tracking, local-dataset 상황별로 적용할 규칙을 선택하세요.
    tips:
    - 데이터 계산은 도구가 맡고 모델은 흐름 선택과 설명을 맡습니다.
    - JSON 마감은 저장, 시각화, 다음 자동화 단계로 넘기는 계약입니다.
    exercise:
      prompt: choose_analysis_bot_component(goal)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_analysis_bot_component(goal):
            raise NotImplementedError
      solution: |-
        def choose_analysis_bot_component(goal):
            table = {
                "data-tools": {"rule": "expose load summarize and group operations", "useWhen": "question needs dataset facts", "risk": "hallucinated numbers"},
                "cached-system": {"rule": "cache stable analysis policy", "useWhen": "bot handles repeated questions", "risk": "high repeated cost"},
                "json-finish": {"rule": "finish with question dataset insight metrics keys", "useWhen": "result feeds UI or storage", "risk": "unusable text"},
                "usage-tracking": {"rule": "record tokens and cache fields per ask", "useWhen": "bot runs often", "risk": "unknown spend"},
                "local-dataset": {"rule": "read from approved local dataset names", "useWhen": "browser or local lesson runs", "risk": "untrusted input"},
            }
            if goal not in table:
                raise ValueError("unknown analysis bot goal")
            return table[goal]
      hints:
      - 수치 근거는 데이터 도구에서 나와야 합니다.
      - 결과는 사람이 읽는 문장과 코드가 쓰는 사전을 동시에 만족해야 합니다.
    check:
      id: python.llm.data-bot.component-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.data-bot.empty.behavior.v1.fixture
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
        entry: choose_analysis_bot_component
        cases:
        - id: recalls-data-tools-component
          arguments:
          - value: data-tools
          expectedReturn:
            rule: expose load summarize and group operations
            useWhen: question needs dataset facts
            risk: hallucinated numbers
        - id: recalls-json-finish-component
          arguments:
          - value: json-finish
          expectedReturn:
            rule: finish with question dataset insight metrics keys
            useWhen: result feeds UI or storage
            risk: unusable text
        - id: rejects-unknown-goal
          arguments:
          - value: one-click-magic
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};