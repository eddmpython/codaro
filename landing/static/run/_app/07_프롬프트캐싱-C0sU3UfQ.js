var e=`meta:\r
  packages:\r
  - anthropic\r
  id: llmBasics_07\r
  title: 프롬프트캐싱\r
  order: 7\r
  category: llmBasics\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - anthropic\r
  - prompt_caching\r
  - cache_control\r
  - 비용절감\r
  seo:\r
    title: Claude 프롬프트 캐싱 - 시스템 프롬프트 캐시로 비용 절감\r
    description: cache_control로 긴 시스템 프롬프트를 캐싱하고 cache_read_input_tokens로 적중률을 측정해 비용을 줄입니다.\r
    keywords:\r
    - prompt caching\r
    - cache_control\r
    - cache_read_input_tokens\r
    - Claude caching\r
intro:\r
  emoji: 💾\r
  goal: cache_control로 시스템 프롬프트를 캐시해 반복 호출 비용을 줄인다.\r
  description: 같은 시스템 프롬프트를 여러 번 보내는 자동화에서 캐싱은 비용·지연을 크게 줄입니다. 캐시 적중을 코드로 측정하는 흐름을 만듭니다.\r
  direction: 캐싱 없는 baseline → 캐시 시스템 적용 → 적중률 측정 → 캐싱 단가까지 반영한 비용 계산기 순으로 발전시킨다.\r
  benefits:\r
  - cache_control 파라미터가 어디에 들어가는지 정확히 익힌다.\r
  - cache_creation_input_tokens와 cache_read_input_tokens 두 필드 의미를 분명히 한다.\r
  - 캐싱이 비용에 미치는 영향을 코드로 직접 측정한다.\r
  - 캐싱 단가까지 반영한 비용 계산기를 만든다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 캐싱 없는 baseline\r
      detail: 긴 시스템 프롬프트로 두 번 호출해 input_tokens가 매번 동일하게 청구되는지 본다.\r
    - label: 2단계. cache_control 적용\r
      detail: 시스템 프롬프트 블록에 cache_control을 추가해 캐시 마킹한다.\r
    - label: 3단계. 적중률 측정\r
      detail: cache_creation/cache_read 필드로 첫·둘째 호출의 캐시 거동을 확인한다.\r
    - label: 4단계. 캐싱 단가 비용 계산기\r
      detail: 캐시 생성·읽기 토큰을 별도 단가로 처리하는 비용 계산기를 만든다.\r
    runtime:\r
    - label: LLM 호출 환경\r
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.\r
    - label: 프롬프트캐싱 실행\r
      detail: 같은 시스템 프롬프트로 두 번 호출해 캐시 적중을 본다.\r
    - label: 프롬프트캐싱 완료\r
      detail: 종합 자동화 강의에서 캐시된 시스템 프롬프트를 그대로 재사용한다.\r
sections:\r
- id: noncached_baseline\r
  title: 1단계. 캐싱 없는 baseline\r
  structuredPrimary: true\r
  subtitle: 긴 시스템 프롬프트 두 번 호출\r
  goal: 동일한 긴 시스템 프롬프트로 두 번 호출해 input_tokens가 매번 동일하게 청구되는지 확인한다.\r
  why: 캐싱 효과를 측정하려면 캐싱 없는 baseline의 비용 패턴을 먼저 알아야 합니다. 동일 시스템이 매번 청구된다는 점이 baseline의 핵심입니다.\r
  explanation: 시스템 프롬프트를 일부러 길게 만들어 캐싱 효과가 잘 보이도록 합니다. 두 번의 호출이 동일한 input_tokens를 청구하는 모양을 봐 둡니다. 7번 강의의\r
    핵심은 이 두 호출이 어떻게 줄어드는지입니다.\r
  tips:\r
  - 캐싱 효과는 시스템 프롬프트가 1024 토큰 이상일 때 안정적으로 나타납니다. 짧은 시스템으로는 캐시가 만들어지지 않을 수 있습니다.\r
  snippet: |-\r
    import anthropic\r
\r
    longSystem = (\r
        "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
        + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
        + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
        + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
        + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
    )\r
\r
    client = anthropic.Anthropic()\r
    first = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=120,\r
        system=longSystem,\r
        messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
    )\r
    second = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=120,\r
        system=longSystem,\r
        messages=[{"role": "user", "content": "내일 학습 팁 하나만 알려줘."}],\r
    )\r
    (first.usage.input_tokens, second.usage.input_tokens)\r
  exercise:\r
    prompt: longSystem의 반복 횟수를 5번으로 줄여 짧게 만들고 두 호출의 input_tokens가 얼마나 줄어드는지 비교하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      longSystem = (\r
          "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
          + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
          + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
          + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
          + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
      )\r
\r
      client = anthropic.Anthropic()\r
      first = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=120,\r
          system=longSystem,\r
          messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
      )\r
      second = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=120,\r
          system=longSystem,\r
          messages=[{"role": "user", "content": "내일 학습 팁 하나만 알려줘."}],\r
      )\r
      (first.usage.input_tokens, second.usage.input_tokens)\r
    hints:\r
    - 반복 횟수를 줄이면 input_tokens가 비례해서 줄어듭니다.\r
    - 짧은 시스템으로는 캐시가 효과적으로 만들어지지 않습니다.\r
  check:\r
    noError: 두 호출이 모두 정상 실행되어야 합니다.\r
    resultCheck: 두 호출의 input_tokens가 서로 비슷한 양수여야 합니다.\r
- id: cache_control_on\r
  title: 2단계. cache_control로 캐시 마킹\r
  structuredPrimary: true\r
  subtitle: system 블록을 리스트로 변환\r
  goal: system을 텍스트 블록 리스트로 바꾸고 cache_control을 추가해 캐시 마킹한다.\r
  why: 캐싱은 자동으로 켜지지 않습니다. 명시적으로 캐시 대상 블록을 지정해야 활성화됩니다.\r
  explanation: system 인자는 문자열 대신 텍스트 블록 사전들의 리스트도 받습니다. 각 블록은 type, text, cache_control 키를 가지며, cache_control을\r
    단 블록은 5분 ephemeral 캐시에 저장되고 같은 내용으로 다시 호출하면 캐시에서 읽힙니다.\r
  tips:\r
  - cache_control 대상 블록의 텍스트는 최소 1024 토큰 정도 이상이어야 캐시가 만들어집니다.\r
  snippet: |-\r
    import anthropic\r
\r
    cacheText = (\r
        "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
        + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
        + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
        + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
        + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
    )\r
\r
    cachedSystem = [\r
        {\r
            "type": "text",\r
            "text": cacheText,\r
            "cache_control": {"type": "ephemeral"},\r
        }\r
    ]\r
\r
    client = anthropic.Anthropic()\r
    firstCachedResult = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=120,\r
        system=cachedSystem,\r
        messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
    )\r
    firstCachedResult.usage.model_dump()\r
  exercise:\r
    prompt: cachedSystem에 두 번째 블록(type=text)을 추가하고 두 번째 블록은 cache_control 없이 둬 보세요. 둘 중 캐싱되는 블록이 어느 쪽인지 보세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      cacheText = (\r
          "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
          + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
          + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
          + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
          + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
      )\r
\r
      cachedSystem = [\r
          {\r
              "type": "text",\r
              "text": cacheText,\r
              "cache_control": {"type": "ephemeral"},\r
          }\r
      ]\r
\r
      client = anthropic.Anthropic()\r
      firstCachedResult = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=120,\r
          system=cachedSystem,\r
          messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
      )\r
      firstCachedResult.usage.model_dump()\r
    hints:\r
    - 두 번째 블록은 짧은 안내문이어도 됩니다.\r
    - cache_control이 없는 블록은 캐시되지 않습니다.\r
  check:\r
    noError: 캐시 마킹된 호출이 정상 실행되어야 합니다.\r
    resultCheck: usage에 cache_creation_input_tokens 또는 cache_read_input_tokens 키가 있어야 합니다.\r
- id: cache_hit_measurement\r
  title: 3단계. 캐시 적중 측정\r
  structuredPrimary: true\r
  subtitle: 첫·둘째 호출 비교\r
  goal: 같은 cachedSystem으로 두 번 호출해 두 번째에서 cache_read_input_tokens가 생기는지 확인한다.\r
  why: 캐시는 측정해야 가치가 보입니다. 코드로 적중률을 보면 시스템이 진짜 캐시되었는지 명확합니다.\r
  explanation: 첫 호출은 cache_creation_input_tokens에 큰 값이 들어가고, 두 번째 호출은 cache_read_input_tokens가 그 자리를 대신합니다.\r
    cache_read는 cache_creation보다 단가가 훨씬 낮아 비용이 크게 줄어듭니다.\r
  tips:\r
  - 두 호출 사이가 5분 이내여야 ephemeral 캐시가 살아 있습니다. 학습 셀에서 바로 이어 호출하면 안정적입니다.\r
  snippet: |-\r
    import anthropic\r
\r
    cacheText = (\r
        "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
        + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
        + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
        + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
        + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
    )\r
    cachedSystem = [\r
        {"type": "text", "text": cacheText, "cache_control": {"type": "ephemeral"}}\r
    ]\r
\r
    client = anthropic.Anthropic()\r
    coldResult = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=120,\r
        system=cachedSystem,\r
        messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
    )\r
    warmResult = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=120,\r
        system=cachedSystem,\r
        messages=[{"role": "user", "content": "내일 학습 팁 하나만 알려줘."}],\r
    )\r
    cacheStats = {\r
        "cold": coldResult.usage.model_dump(),\r
        "warm": warmResult.usage.model_dump(),\r
    }\r
    cacheStats\r
  exercise:\r
    prompt: warmResult를 한 번 더 만들어(warmResult2) 캐시 읽기가 여러 번 가능한지 확인하세요. 변수명은 새 이름을 써야 합니다.\r
    starterCode: |-\r
      import anthropic\r
\r
      cacheText = (\r
          "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
          + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
          + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
          + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
          + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
      )\r
      cachedSystem = [\r
          {"type": "text", "text": cacheText, "cache_control": {"type": "ephemeral"}}\r
      ]\r
\r
      client = anthropic.Anthropic()\r
      coldResult = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=120,\r
          system=cachedSystem,\r
          messages=[{"role": "user", "content": "오늘 학습 팁 하나만 알려줘."}],\r
      )\r
      warmResult = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=120,\r
          system=cachedSystem,\r
          messages=[{"role": "user", "content": "내일 학습 팁 하나만 알려줘."}],\r
      )\r
      cacheStats = {\r
          "cold": coldResult.usage.model_dump(),\r
          "warm": warmResult.usage.model_dump(),\r
      }\r
      cacheStats\r
    hints:\r
    - 같은 변수 client를 재사용해도 클라이언트는 stateless이므로 캐시는 서버 측에 있습니다.\r
    - 새 호출 변수명은 다른 이름을 써야 합니다.\r
  check:\r
    noError: 두 호출이 모두 정상 실행되어야 합니다.\r
    resultCheck: cacheStats가 cold와 warm 키를 가진 사전이어야 합니다.\r
- id: cached_pricing\r
  title: 4단계. 캐싱 단가 반영 비용 계산기\r
  structuredPrimary: true\r
  subtitle: cache_creation·cache_read 별도 처리\r
  goal: 캐싱 단가 사전을 만들고 추정 비용 함수가 캐시 토큰을 별도 단가로 처리하도록 확장한다.\r
  why: 캐싱 효과를 비용에 정확히 반영하려면 단가 분기가 필요합니다. 캐시 적중 비율에 따라 호출 비용이 크게 달라집니다.\r
  explanation: 캐시 생성 토큰은 일반 입력 토큰보다 살짝 비싸고(보통 25% 가산) 캐시 읽기 토큰은 훨씬 저렴(보통 90% 할인)합니다. 정확한 단가는 공식 문서에서 확인하고,\r
    여기서는 학습용 비율을 사용해 비용 계산 함수의 모양만 만듭니다.\r
  tips:\r
  - cache_read 단가는 input_per_million의 10% 정도가 일반적입니다. 실제 단가는 모델·지역마다 다르므로 공식 문서 확인이 필요합니다.\r
  snippet: |-\r
    pricing = {\r
        "claude-haiku-4-5": {\r
            "input_per_million": 1.0,\r
            "cache_creation_per_million": 1.25,\r
            "cache_read_per_million": 0.1,\r
            "output_per_million": 5.0,\r
        },\r
    }\r
\r
    def estimateCostCached(usage, modelName: str, table: dict) -> float:\r
        rate = table[modelName]\r
        inputCost = usage.input_tokens * rate["input_per_million"] / 1_000_000\r
        creationCost = (\r
            (usage.cache_creation_input_tokens or 0)\r
            * rate["cache_creation_per_million"]\r
            / 1_000_000\r
        )\r
        readCost = (\r
            (usage.cache_read_input_tokens or 0)\r
            * rate["cache_read_per_million"]\r
            / 1_000_000\r
        )\r
        outputCost = usage.output_tokens * rate["output_per_million"] / 1_000_000\r
        return round(inputCost + creationCost + readCost + outputCost, 6)\r
\r
    estimateCostCached\r
  exercise:\r
    prompt: estimateCostCached가 호출별 세부 항목(input/creation/read/output)을 함께 돌려주는 버전을 만들어 보세요.\r
    starterCode: |-\r
      pricing = {\r
          "claude-haiku-4-5": {\r
              "input_per_million": 1.0,\r
              "cache_creation_per_million": 1.25,\r
              "cache_read_per_million": 0.1,\r
              "output_per_million": 5.0,\r
          },\r
      }\r
\r
      def estimateCostCached(usage, modelName: str, table: dict) -> float:\r
          rate = table[modelName]\r
          inputCost = usage.input_tokens * rate["input_per_million"] / 1_000_000\r
          creationCost = (\r
              (usage.cache_creation_input_tokens or 0)\r
              * rate["cache_creation_per_million"]\r
              / 1_000_000\r
          )\r
          readCost = (\r
              (usage.cache_read_input_tokens or 0)\r
              * rate["cache_read_per_million"]\r
              / 1_000_000\r
          )\r
          outputCost = usage.output_tokens * rate["output_per_million"] / 1_000_000\r
          return round(inputCost + creationCost + readCost + outputCost, 6)\r
\r
      estimateCostCached\r
    hints:\r
    - 함수가 float 대신 dict를 돌려주도록 바꾸고 각 비용 항목을 키로 만듭니다.\r
    - 총합 키 "total"도 함께 두면 호출 측이 편합니다.\r
  check:\r
    noError: 함수 정의가 정상 실행되어야 합니다.\r
    resultCheck: estimateCostCached가 함수 객체로 평가되어야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 캐시 적용 전후 비용 비교 종합 결과'\r
  structuredPrimary: true\r
  subtitle: 두 시스템 모드로 호출해 비용 차이 측정\r
  goal: 캐싱 없는 모드와 있는 모드로 두 번씩 호출해 두 모드의 총 비용 차이를 데이터로 측정한다.\r
  why: 캐싱 비용 절감 효과는 호출이 반복될수록 커집니다. 두 모드 비교를 코드로 박아 두면 실무 의사결정이 빨라집니다.\r
  explanation: 동일한 긴 시스템 텍스트를 (1) 캐싱 없이 문자열로 (2) 캐싱 마킹된 블록으로 두 번씩 호출합니다. 4개 호출의 비용을 합산해 cached/uncached 두\r
    합계를 비교합니다. cached 합계가 uncached 합계보다 작으면 캐싱이 의미 있게 동작한 것입니다.\r
  tips:\r
  - 짧은 시스템에서는 캐시 효과가 안 보일 수 있습니다. 시스템을 충분히 길게 만들어야 합니다.\r
  snippet: |-\r
    import anthropic\r
\r
    pricing = {\r
        "claude-haiku-4-5": {\r
            "input_per_million": 1.0,\r
            "cache_creation_per_million": 1.25,\r
            "cache_read_per_million": 0.1,\r
            "output_per_million": 5.0,\r
        },\r
    }\r
\r
    def costOf(usage, modelName: str, table: dict) -> float:\r
        rate = table[modelName]\r
        return round(\r
            usage.input_tokens * rate["input_per_million"] / 1_000_000\r
            + (usage.cache_creation_input_tokens or 0) * rate["cache_creation_per_million"] / 1_000_000\r
            + (usage.cache_read_input_tokens or 0) * rate["cache_read_per_million"] / 1_000_000\r
            + usage.output_tokens * rate["output_per_million"] / 1_000_000,\r
            6,\r
        )\r
\r
    longText = (\r
        "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
        + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
        + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
        + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
        + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
    )\r
    plainSystem = longText\r
    cachedSystemBlocks = [\r
        {"type": "text", "text": longText, "cache_control": {"type": "ephemeral"}}\r
    ]\r
\r
    questions = ["오늘 학습 팁 하나만 알려줘.", "내일 학습 팁 하나만 알려줘."]\r
\r
    client = anthropic.Anthropic()\r
    uncachedTotal = 0.0\r
    for question in questions:\r
        plainResult = client.messages.create(\r
            model="claude-haiku-4-5",\r
            max_tokens=120,\r
            system=plainSystem,\r
            messages=[{"role": "user", "content": question}],\r
        )\r
        uncachedTotal += costOf(plainResult.usage, "claude-haiku-4-5", pricing)\r
\r
    cachedTotal = 0.0\r
    for question in questions:\r
        cachedResult = client.messages.create(\r
            model="claude-haiku-4-5",\r
            max_tokens=120,\r
            system=cachedSystemBlocks,\r
            messages=[{"role": "user", "content": question}],\r
        )\r
        cachedTotal += costOf(cachedResult.usage, "claude-haiku-4-5", pricing)\r
\r
    assert uncachedTotal > 0\r
    assert cachedTotal > 0\r
    {"uncached": round(uncachedTotal, 6), "cached": round(cachedTotal, 6), "saved": round(uncachedTotal - cachedTotal, 6)}\r
  exercise:\r
    prompt: 두 모드 호출 횟수를 3개씩으로 늘려 캐시 효과가 더 크게 보이는지 측정하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      pricing = {\r
          "claude-haiku-4-5": {\r
              "input_per_million": 1.0,\r
              "cache_creation_per_million": 1.25,\r
              "cache_read_per_million": 0.1,\r
              "output_per_million": 5.0,\r
          },\r
      }\r
\r
      def costOf(usage, modelName: str, table: dict) -> float:\r
          rate = table[modelName]\r
          return round(\r
              usage.input_tokens * rate["input_per_million"] / 1_000_000\r
              + (usage.cache_creation_input_tokens or 0) * rate["cache_creation_per_million"] / 1_000_000\r
              + (usage.cache_read_input_tokens or 0) * rate["cache_read_per_million"] / 1_000_000\r
              + usage.output_tokens * rate["output_per_million"] / 1_000_000,\r
              6,\r
          )\r
\r
      longText = (\r
          "너는 데이터 분석 자동화 도구야. 다음 규칙을 모두 따른다.\\n"\r
          + ("- 응답은 반드시 한국어로만 작성한다.\\n" * 20)\r
          + ("- 응답에는 추가 설명이나 코드 블록 마크다운을 절대 포함하지 않는다.\\n" * 20)\r
          + ("- 응답은 가능한 한 짧고 명확하게 작성하고, 핵심만 전달한다.\\n" * 20)\r
          + "- 사용자가 묻는 한 가지 질문에만 정확히 답한다."\r
      )\r
      plainSystem = longText\r
      cachedSystemBlocks = [\r
          {"type": "text", "text": longText, "cache_control": {"type": "ephemeral"}}\r
      ]\r
\r
      questions = ["오늘 학습 팁 하나만 알려줘.", "내일 학습 팁 하나만 알려줘."]\r
\r
      client = anthropic.Anthropic()\r
      uncachedTotal = 0.0\r
      for question in questions:\r
          plainResult = client.messages.create(\r
              model="claude-haiku-4-5",\r
              max_tokens=120,\r
              system=plainSystem,\r
              messages=[{"role": "user", "content": question}],\r
          )\r
          uncachedTotal += costOf(plainResult.usage, "claude-haiku-4-5", pricing)\r
\r
      cachedTotal = 0.0\r
      for question in questions:\r
          cachedResult = client.messages.create(\r
              model="claude-haiku-4-5",\r
              max_tokens=120,\r
              system=cachedSystemBlocks,\r
              messages=[{"role": "user", "content": question}],\r
          )\r
          cachedTotal += costOf(cachedResult.usage, "claude-haiku-4-5", pricing)\r
\r
      assert uncachedTotal > 0\r
      assert cachedTotal > 0\r
      {"uncached": round(uncachedTotal, 6), "cached": round(cachedTotal, 6), "saved": round(uncachedTotal - cachedTotal, 6)}\r
    hints:\r
    - questions 리스트에 새 질문 항목을 추가합니다.\r
    - 호출 횟수가 늘수록 cache_read 토큰 비중이 커져 절감 폭이 보입니다.\r
  check:
    noError: 모든 호출과 비용 합산이 정상 실행되어야 합니다.
    resultCheck: 결과 사전이 uncached/cached/saved 세 키를 모두 가져야 합니다.
assessment:
  masteryVariants:
  - id: 07_prompt-caching-cache-cost-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - cache_hit_measurement
    - cached_pricing
    title: 캐시 토큰 단가를 반영해 비용 계산하기
    subtitle: cache cost calculator
    goal: calculate_cache_cost(usage, price)를 완성해 일반 입력, 캐시 생성, 캐시 읽기, 출력 비용을 분리한다.
    why: 캐싱은 적중 여부만 보면 안 되고 생성 토큰과 읽기 토큰의 단가 차이를 실제 비용으로 환산해야 합니다.
    explanation: usage에는 input_tokens, cache_creation_input_tokens, cache_read_input_tokens, output_tokens가 들어옵니다. 각 토큰을 백만 토큰 단가로 나누어 비용을 계산합니다.
    tips:
    - 캐시 생성과 캐시 읽기는 서로 다른 단가를 사용합니다.
    - UI 표시와 로그 비교를 위해 비용은 소수점 6자리로 고정합니다.
    exercise:
      prompt: calculate_cache_cost(usage, price)를 완성해 totalCost, cacheTokens, breakdown을 반환하세요.
      starterCode: |-
        def calculate_cache_cost(usage, price):
            raise NotImplementedError
      solution: |-
        def calculate_cache_cost(usage, price):
            input_tokens = usage.get("input_tokens", 0)
            creation_tokens = usage.get("cache_creation_input_tokens", 0)
            read_tokens = usage.get("cache_read_input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            breakdown = {
                "inputCost": round(input_tokens * price["input_per_million"] / 1_000_000, 6),
                "cacheCreationCost": round(creation_tokens * price["cache_creation_per_million"] / 1_000_000, 6),
                "cacheReadCost": round(read_tokens * price["cache_read_per_million"] / 1_000_000, 6),
                "outputCost": round(output_tokens * price["output_per_million"] / 1_000_000, 6),
            }
            total = round(sum(breakdown.values()), 6)
            return {
                "totalCost": total,
                "cacheTokens": creation_tokens + read_tokens,
                "breakdown": breakdown,
            }
      hints:
      - 누락된 usage 필드는 0으로 처리합니다.
      - totalCost는 breakdown 값의 합으로 계산합니다.
    check:
      id: python.llm.prompt-caching.cache-cost.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.prompt-caching.empty.behavior.v1.fixture
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
        entry: calculate_cache_cost
        cases:
        - id: separates-cache-cost-components
          arguments:
          - value:
              input_tokens: 1000
              cache_creation_input_tokens: 2000
              cache_read_input_tokens: 5000
              output_tokens: 100
          - value:
              input_per_million: 1.0
              cache_creation_per_million: 1.25
              cache_read_per_million: 0.1
              output_per_million: 5.0
          expectedReturn:
            totalCost: 0.0045
            cacheTokens: 7000
            breakdown:
              inputCost: 0.001
              cacheCreationCost: 0.0025
              cacheReadCost: 0.0005
              outputCost: 0.0005
        - id: handles-missing-cache-fields
          arguments:
          - value:
              input_tokens: 1000
              output_tokens: 100
          - value:
              input_per_million: 1.0
              cache_creation_per_million: 1.25
              cache_read_per_million: 0.1
              output_per_million: 5.0
          expectedReturn:
            totalCost: 0.0015
            cacheTokens: 0
            breakdown:
              inputCost: 0.001
              cacheCreationCost: 0.0
              cacheReadCost: 0.0
              outputCost: 0.0005
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 07_prompt-caching-mark-blocks-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - cache_control_on
    - workflow_validation
    title: 안정적인 시스템 블록에 캐시 마킹하기
    subtitle: cache block marker
    goal: mark_cache_blocks(blocks, cache_names)를 완성해 선택된 블록에 cache_control을 추가한다.
    why: 캐싱은 모든 프롬프트가 아니라 자주 반복되고 잘 변하지 않는 블록에만 적용해야 비용과 정확성이 모두 안정됩니다.
    explanation: blocks는 name과 text를 가진 시스템 블록 목록입니다. cache_names에 들어 있는 이름만 복사본에 cache_control 값을 추가합니다.
    tips:
    - 원본 blocks를 직접 바꾸지 않고 새 사전을 만들어 반환합니다.
    - 어떤 블록이 마킹되었는지 markedNames를 함께 반환하면 검산이 쉽습니다.
    exercise:
      prompt: mark_cache_blocks(blocks, cache_names)를 완성해 blocks, markedNames, blockCount를 반환하세요.
      starterCode: |-
        def mark_cache_blocks(blocks, cache_names):
            raise NotImplementedError
      solution: |-
        def mark_cache_blocks(blocks, cache_names):
            selected = set(cache_names)
            marked = []
            marked_names = []
            for block in blocks:
                copied = dict(block)
                if copied.get("name") in selected:
                    copied["cache_control"] = {"type": "ephemeral"}
                    marked_names.append(copied["name"])
                marked.append(copied)
            return {"blocks": marked, "markedNames": marked_names, "blockCount": len(marked)}
      hints:
      - cache_names는 set으로 바꾸면 포함 검사가 단순합니다.
      - cache_control은 선택된 블록에만 붙입니다.
    check:
      id: python.llm.prompt-caching.mark-blocks.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.prompt-caching.empty.behavior.v1.fixture
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
        entry: mark_cache_blocks
        cases:
        - id: marks-selected-policy-block
          arguments:
          - value:
            - name: policy
              text: always answer as JSON
            - name: question
              text: summarize today
          - value:
            - policy
          expectedReturn:
            blocks:
            - name: policy
              text: always answer as JSON
              cache_control:
                type: ephemeral
            - name: question
              text: summarize today
            markedNames:
            - policy
            blockCount: 2
        - id: leaves-unselected-blocks-plain
          arguments:
          - value:
            - name: short
              text: hello
          - value: []
          expectedReturn:
            blocks:
            - name: short
              text: hello
            markedNames: []
            blockCount: 1
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 07_prompt-caching-rule-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - noncached_baseline
    - cache_control_on
    - cache_hit_measurement
    - cached_pricing
    title: 프롬프트 캐싱 운영 규칙 회상하기
    subtitle: cache rule recall
    goal: choose_cache_rule(goal)를 완성해 캐싱 상황별 규칙과 실패 위험을 반환한다.
    why: 캐싱은 붙이면 끝나는 옵션이 아니라 어떤 프롬프트를 캐시하고 어떤 usage 필드를 읽을지 정하는 운영 규칙입니다.
    explanation: stable-prefix, ephemeral-control, cache-read-usage, cached-pricing, compare-calls 상황별로 적용할 규칙을 선택하세요.
    tips:
    - 자주 바뀌는 사용자 질문은 캐시 대상으로 부적절합니다.
    - cache_read_input_tokens가 늘어야 반복 호출에서 이득을 봅니다.
    exercise:
      prompt: choose_cache_rule(goal)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_cache_rule(goal):
            raise NotImplementedError
      solution: |-
        def choose_cache_rule(goal):
            table = {
                "stable-prefix": {"rule": "cache long repeated system content", "useWhen": "policy text repeats", "risk": "wasted setup"},
                "ephemeral-control": {"rule": "mark cacheable blocks with ephemeral control", "useWhen": "using Messages API cache blocks", "risk": "no cache write"},
                "cache-read-usage": {"rule": "inspect cache_read_input_tokens", "useWhen": "checking cache hit", "risk": "imaginary savings"},
                "cached-pricing": {"rule": "price creation and read tokens separately", "useWhen": "showing cost", "risk": "wrong total"},
                "compare-calls": {"rule": "compare first and repeated calls", "useWhen": "validating cache benefit", "risk": "anecdotal result"},
            }
            if goal not in table:
                raise ValueError("unknown cache goal")
            return table[goal]
      hints:
      - 캐시 적중은 usage 필드로 확인합니다.
      - 비용 계산에는 일반 입력, 캐시 생성, 캐시 읽기, 출력이 모두 필요합니다.
    check:
      id: python.llm.prompt-caching.rule-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.prompt-caching.empty.behavior.v1.fixture
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
        entry: choose_cache_rule
        cases:
        - id: recalls-stable-prefix
          arguments:
          - value: stable-prefix
          expectedReturn:
            rule: cache long repeated system content
            useWhen: policy text repeats
            risk: wasted setup
        - id: recalls-cached-pricing
          arguments:
          - value: cached-pricing
          expectedReturn:
            rule: price creation and read tokens separately
            useWhen: showing cost
            risk: wrong total
        - id: rejects-unknown-goal
          arguments:
          - value: cache-everything
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};