var e=`meta:\r
  packages:\r
  - anthropic\r
  id: llmBasics_02\r
  title: 시스템프롬프트역할부여\r
  order: 2\r
  category: llmBasics\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - anthropic\r
  - system_prompt\r
  - 역할\r
  - 어조\r
  seo:\r
    title: Claude 시스템 프롬프트 - 역할과 어조 제어\r
    description: Messages API의 system 인자로 Claude에게 역할·어조·응답 형식을 지시하는 패턴을 익힙니다.\r
    keywords:\r
    - system prompt\r
    - Claude 역할\r
    - 어조 제어\r
    - persona\r
intro:\r
  emoji: 🎭\r
  goal: system 인자로 Claude의 역할과 어조를 지정해 응답을 통제한다.\r
  description: 같은 질문이라도 system 프롬프트가 어떻게 응답의 톤과 형식을 바꾸는지 코드로 확인합니다.\r
  direction: 빈 system → 짧은 system → 형식 강제 system 순으로 변주해 응답이 어떻게 변하는지 시각화하고, 자동화에서 재사용할 수 있는 system 빌더 함수를 만든다.\r
  benefits:\r
  - system 인자가 첫 메시지가 아니라 별도 슬롯이라는 점을 분명히 한다.\r
  - 어조·역할·형식 지시를 하나씩 누적하며 변화를 본다.\r
  - 응답 형식을 강제하는 system 작성 감각을 만든다.\r
  - 자동화에서 재사용하는 system 빌더 함수 패턴을 익힌다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 기본 호출 baseline\r
      detail: system 없이 호출해 응답의 자연스러운 모양을 본다.\r
    - label: 2단계. 어조 지시 system\r
      detail: 한 문장 system으로 응답 톤을 통제한다.\r
    - label: 3단계. 형식 강제 system\r
      detail: 출력 형식(불릿, 문장 수)을 명시해 응답 구조를 잡는다.\r
    - label: 4단계. system 빌더 함수화\r
      detail: 역할·어조·형식 슬롯을 받는 함수로 system을 합성한다.\r
    runtime:\r
    - label: LLM 호출 환경\r
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.\r
    - label: 시스템프롬프트역할부여 실행\r
      detail: system을 단계적으로 추가하며 응답이 어떻게 달라지는지 본다.\r
    - label: 시스템프롬프트역할부여 완료\r
      detail: 다음 강의의 멀티턴 대화에서 system을 일관되게 유지하는 패턴으로 이어진다.\r
sections:\r
- id: baseline\r
  title: 1단계. system 없이 호출\r
  structuredPrimary: true\r
  subtitle: 기본 응답을 본다\r
  goal: system 인자 없이 messages만 보내 baseline 응답을 받는다.\r
  why: system을 바꿔가며 비교하려면 기준선이 필요합니다. 첫 응답이 자연스러운 자유 응답이라는 점을 먼저 확인합니다.\r
  explanation: messages.create에 system을 넘기지 않으면 Claude는 모델 기본 어조로 응답합니다. 이 baseline 응답이 이후 system 추가의 비교 대상이\r
    됩니다. 같은 user 메시지에 다른 system을 주면 응답 모양이 어떻게 달라지는지 확인하는 흐름이 핵심입니다.\r
  tips:\r
  - 한 강의에서 같은 user 질문을 여러 번 보낼 때 다양한 변수명을 써야 합니다. 셀 간 변수 재할당이 금지되기 때문입니다.\r
  snippet: |-\r
    import anthropic\r
\r
    client = anthropic.Anthropic()\r
    baseResponse = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        messages=[{"role": "user", "content": "재귀 함수가 무엇인지 알려줘."}],\r
    )\r
    baseAnswer = "".join(block.text for block in baseResponse.content if block.type == "text")\r
    baseAnswer\r
  exercise:\r
    prompt: 같은 질문을 두 번 호출해 baseAnswer가 미세하게 다른지 확인하세요. 결과 객체 변수명은 다른 이름을 사용해야 합니다.\r
    starterCode: |-\r
      import anthropic\r
\r
      client = anthropic.Anthropic()\r
      baseResponse = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          messages=[{"role": "user", "content": "재귀 함수가 무엇인지 알려줘."}],\r
      )\r
      baseAnswer = "".join(block.text for block in baseResponse.content if block.type == "text")\r
      baseAnswer\r
    hints:\r
    - 두 번째 호출은 secondResponse 같은 이름으로 새 변수를 만듭니다.\r
    - 모델 응답은 결정론적이지 않아 표현이 달라질 수 있습니다.\r
  check:\r
    noError: 호출과 텍스트 추출이 예외 없이 끝까지 완료되어야 합니다.\r
    resultCheck: baseAnswer가 비어있지 않은 문자열이어야 합니다.\r
- id: tone_system\r
  title: 2단계. 어조 지시 system\r
  structuredPrimary: true\r
  subtitle: system 한 문장으로 톤 잡기\r
  goal: system 인자에 짧은 톤 지시를 넣어 응답 어조가 달라지는지 본다.\r
  why: 어조는 자동화의 사용자 경험을 좌우합니다. system 한 문장만 잘 써도 친근체/존댓말/전문가체로 통제할 수 있습니다.\r
  explanation: system 인자는 문자열 한 줄을 받습니다. 짧은 지시 한 줄이 응답 톤을 바꾸는 데 의외로 효과적입니다. 예를 들어 "친근한 말투로 짧게 답해줘"라는 system은\r
    응답을 부드럽고 간결하게 만듭니다. 같은 user 질문 + 다른 system 조합으로 비교 실험을 합니다.\r
  tips:\r
  - system은 매 호출마다 다시 보낼 수 있습니다. 호출 사이에 상태로 저장되지 않으므로 명시적으로 전달해야 합니다.\r
  snippet: |-\r
    import anthropic\r
\r
    client = anthropic.Anthropic()\r
    toneResponse = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        system="너는 코딩을 막 시작한 사람에게 친근하게 설명하는 선배 개발자야. 비유를 적극 활용해서 짧게 답해.",\r
        messages=[{"role": "user", "content": "재귀 함수가 무엇인지 알려줘."}],\r
    )\r
    toneAnswer = "".join(block.text for block in toneResponse.content if block.type == "text")\r
    toneAnswer\r
  exercise:\r
    prompt: system 문장을 "엄격한 시니어 개발자처럼 격식 있는 한국어로 답해" 등으로 바꿔 응답의 톤이 어떻게 변하는지 비교하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      client = anthropic.Anthropic()\r
      toneResponse = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          system="너는 코딩을 막 시작한 사람에게 친근하게 설명하는 선배 개발자야. 비유를 적극 활용해서 짧게 답해.",\r
          messages=[{"role": "user", "content": "재귀 함수가 무엇인지 알려줘."}],\r
      )\r
      toneAnswer = "".join(block.text for block in toneResponse.content if block.type == "text")\r
      toneAnswer\r
    hints:\r
    - system 문장이 길어지면 어조뿐 아니라 형식까지 통제됩니다.\r
    - 한 문장에 "어조 + 길이 제한"을 함께 넣으면 응답 모양이 안정됩니다.\r
  check:\r
    noError: system 인자가 포함된 호출이 정상 실행되어야 합니다.\r
    resultCheck: toneAnswer가 baseAnswer보다 어조나 길이에서 명확히 다른 모양이어야 합니다.\r
- id: format_system\r
  title: 3단계. 형식 강제 system\r
  structuredPrimary: true\r
  subtitle: 출력 모양까지 잡기\r
  goal: system에 출력 형식(불릿 개수, 문장 길이)을 강제해 응답 구조를 통제한다.\r
  why: 자동화는 일정한 형식의 응답이 필요합니다. 후처리 코드가 의존하는 출력 모양을 system이 만들어 주면 파서가 단순해집니다.\r
  explanation: system에 "정확히 3개의 불릿으로", "한 줄 30자 이내" 같은 명령을 넣으면 응답이 그 형식을 따릅니다. 100% 보장은 아니지만 적중률이 매우 높아지고,\r
    뒤에 검증 코드를 짧게 붙이면 안전합니다. 6번 강의의 JSON 구조화 출력은 이 형식 강제의 극단형입니다.\r
  tips:\r
  - 형식 명령은 system의 끝에 두면 모델이 마지막 지시를 더 잘 따르는 경향이 있습니다.\r
  snippet: |-\r
    import anthropic\r
\r
    client = anthropic.Anthropic()\r
    formatResponse = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        system="너는 학습 자료 작가야. 답은 정확히 3개의 불릿(- )으로만 작성하고, 각 불릿은 60자 이내로 끊어.",\r
        messages=[{"role": "user", "content": "재귀 함수를 처음 배우는 사람에게 알려줘."}],\r
    )\r
    formatAnswer = "".join(block.text for block in formatResponse.content if block.type == "text")\r
    bulletCount = formatAnswer.count("\\n-") + (1 if formatAnswer.lstrip().startswith("-") else 0)\r
    (formatAnswer, bulletCount)\r
  exercise:\r
    prompt: 불릿 개수를 5개로 바꿔 형식 명령을 수정하고 bulletCount가 거의 그대로 따라오는지 확인하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      client = anthropic.Anthropic()\r
      formatResponse = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          system="너는 학습 자료 작가야. 답은 정확히 3개의 불릿(- )으로만 작성하고, 각 불릿은 60자 이내로 끊어.",\r
          messages=[{"role": "user", "content": "재귀 함수를 처음 배우는 사람에게 알려줘."}],\r
      )\r
      formatAnswer = "".join(block.text for block in formatResponse.content if block.type == "text")\r
      bulletCount = formatAnswer.count("\\n-") + (1 if formatAnswer.lstrip().startswith("-") else 0)\r
      (formatAnswer, bulletCount)\r
    hints:\r
    - 모델이 형식 명령을 따르지 않으면 system 문장을 명확히 끝에 두는지 확인합니다.\r
    - bulletCount가 정확히 일치하지 않을 수 있으니 ±1 정도의 여유로 검증합니다.\r
  check:\r
    noError: 호출과 카운팅이 예외 없이 끝까지 완료되어야 합니다.\r
    resultCheck: bulletCount가 양의 정수이고 formatAnswer가 불릿 문자열을 포함해야 합니다.\r
- id: system_builder\r
  title: 4단계. system 빌더 함수\r
  structuredPrimary: true\r
  subtitle: 역할 + 어조 + 형식을 합성\r
  goal: 역할·어조·형식 세 슬롯을 인자로 받아 system 문자열을 합성하는 함수를 만든다.\r
  why: 자동화에서 system은 자주 재구성됩니다. 인자만 바꿔 다른 페르소나를 만들 수 있는 빌더가 있으면 실험이 빨라집니다.\r
  explanation: 입력은 역할(role), 어조(tone), 형식(format) 세 문자열입니다. 출력은 세 부분을 줄바꿈으로 이어붙인 system 문자열입니다. 이 함수를\r
    호출 자리에서 사용하면 system 변경이 한 줄 변경으로 끝납니다.\r
  tips:\r
  - 빌더에서 공백/None 슬롯을 정리해 두면 어떤 슬롯이 비어도 깨끗한 system이 나옵니다.\r
  snippet: |-\r
    import anthropic\r
\r
    def buildSystem(role: str, tone: str, formatRule: str) -> str:\r
        parts = [section.strip() for section in (role, tone, formatRule) if section and section.strip()]\r
        return "\\n".join(parts)\r
\r
    client = anthropic.Anthropic()\r
    composed = buildSystem(\r
        role="너는 Python 학습 멘토야.",\r
        tone="따뜻한 어조로 격려하면서 설명해.",\r
        formatRule="답은 항상 '1) ...\\n2) ...\\n3) ...' 형태의 번호 매김 3줄로만 작성해.",\r
    )\r
    builderResponse = client.messages.create(\r
        model="claude-haiku-4-5",\r
        max_tokens=200,\r
        system=composed,\r
        messages=[{"role": "user", "content": "재귀 함수를 어떻게 연습해야 잘하게 될까?"}],\r
    )\r
    builderAnswer = "".join(block.text for block in builderResponse.content if block.type == "text")\r
    (composed, builderAnswer)\r
  exercise:\r
    prompt: buildSystem에 emoji 슬롯을 하나 더 추가해 system 끝에 붙이고, 응답에 이모지가 따라오는지 확인하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      def buildSystem(role: str, tone: str, formatRule: str) -> str:\r
          parts = [section.strip() for section in (role, tone, formatRule) if section and section.strip()]\r
          return "\\n".join(parts)\r
\r
      client = anthropic.Anthropic()\r
      composed = buildSystem(\r
          role="너는 Python 학습 멘토야.",\r
          tone="따뜻한 어조로 격려하면서 설명해.",\r
          formatRule="답은 항상 '1) ...\\n2) ...\\n3) ...' 형태의 번호 매김 3줄로만 작성해.",\r
      )\r
      builderResponse = client.messages.create(\r
          model="claude-haiku-4-5",\r
          max_tokens=200,\r
          system=composed,\r
          messages=[{"role": "user", "content": "재귀 함수를 어떻게 연습해야 잘하게 될까?"}],\r
      )\r
      builderAnswer = "".join(block.text for block in builderResponse.content if block.type == "text")\r
      (composed, builderAnswer)\r
    hints:\r
    - parts 리스트 마지막에 emoji 같은 추가 슬롯을 합치는 인자를 추가합니다.\r
    - 빈 슬롯은 if section and section.strip() 조건으로 자동 제외됩니다.\r
  check:\r
    noError: 함수 정의와 호출이 모두 예외 없이 끝까지 완료되어야 합니다.\r
    resultCheck: composed가 줄바꿈으로 합쳐진 문자열이고 builderAnswer가 비어 있지 않아야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 동일 질문 다중 페르소나 비교'\r
  structuredPrimary: true\r
  subtitle: 예측 → 호출 → 응답 차이 검증\r
  goal: 한 질문에 대해 세 가지 system 페르소나를 돌려 응답 길이/톤의 차이가 코드로 측정되는지 확인한다.\r
  why: 페르소나 비교는 자동화 도구의 응답 톤을 정하기 위한 표준 실험 절차입니다. 코드로 차이를 측정하면 어떤 페르소나가 어떤 길이/톤을 만드는지 데이터로 본다.\r
  explanation: 세 가지 system(짧은 멘토, 깊이 설명하는 강사, 한 줄 요약 마스터)을 같은 질문에 적용합니다. 각 응답의 길이를 비교하고 첫 글자만 추출해 톤 차이를 본다.\r
    자동화에서는 이런 작은 실험을 반복해 본인 워크플로에 맞는 페르소나를 고릅니다.\r
  tips:\r
  - max_tokens는 일정하게 유지해야 길이 차이가 모델의 자율 길이 조절 때문이 됩니다.\r
  snippet: |-\r
    import anthropic\r
\r
    client = anthropic.Anthropic()\r
    personas = {\r
        "shortMentor": "너는 코드를 짧게 설명하는 멘토야. 한 문단 이내로 답해.",\r
        "deepLecturer": "너는 깊이 있게 가르치는 강사야. 단계별로 자세히 설명해.",\r
        "oneLineMaster": "너는 모든 답을 정확히 한 문장으로만 끝내는 사람이야.",\r
    }\r
\r
    question = "데코레이터가 무엇인지 알려줘."\r
    responses = {}\r
    for name, systemText in personas.items():\r
        result = client.messages.create(\r
            model="claude-haiku-4-5",\r
            max_tokens=200,\r
            system=systemText,\r
            messages=[{"role": "user", "content": question}],\r
        )\r
        responses[name] = "".join(block.text for block in result.content if block.type == "text")\r
\r
    lengths = {name: len(text) for name, text in responses.items()}\r
    assert all(value > 0 for value in lengths.values())\r
    assert lengths["oneLineMaster"] <= max(lengths["deepLecturer"], lengths["shortMentor"])\r
    lengths\r
  exercise:\r
    prompt: personas 사전에 본인이 디자인한 새 페르소나를 하나 추가하고 lengths에 그 항목이 따라오는지 확인하세요.\r
    starterCode: |-\r
      import anthropic\r
\r
      client = anthropic.Anthropic()\r
      personas = {\r
          "shortMentor": "너는 코드를 짧게 설명하는 멘토야. 한 문단 이내로 답해.",\r
          "deepLecturer": "너는 깊이 있게 가르치는 강사야. 단계별로 자세히 설명해.",\r
          "oneLineMaster": "너는 모든 답을 정확히 한 문장으로만 끝내는 사람이야.",\r
      }\r
\r
      question = "데코레이터가 무엇인지 알려줘."\r
      responses = {}\r
      for name, systemText in personas.items():\r
          result = client.messages.create(\r
              model="claude-haiku-4-5",\r
              max_tokens=200,\r
              system=systemText,\r
              messages=[{"role": "user", "content": question}],\r
          )\r
          responses[name] = "".join(block.text for block in result.content if block.type == "text")\r
\r
      lengths = {name: len(text) for name, text in responses.items()}\r
      assert all(value > 0 for value in lengths.values())\r
      assert lengths["oneLineMaster"] <= max(lengths["deepLecturer"], lengths["shortMentor"])\r
      lengths\r
    hints:\r
    - personas 사전에 새 키와 system 문자열을 추가합니다.\r
    - 추가 페르소나의 length가 0보다 크면 호출이 잘 된 것입니다.\r
  check:
    noError: 모든 페르소나 호출이 정상 실행되어야 합니다.
    resultCheck: lengths의 모든 값이 양의 정수여야 합니다.
assessment:
  masteryVariants:
  - id: 02_system_prompt-persona-builder-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - tone_system
    - format_system
    - system_builder
    title: persona 목적별 system prompt 만들기
    subtitle: system prompt builder
    goal: build_system_prompt(persona, format_name)를 완성해 역할과 출력 형식을 함께 담은 system 문자열을 반환한다.
    why: system prompt는 긴 주문서가 아니라, 역할과 출력 계약을 호출마다 흔들리지 않게 고정하는 장치입니다.
    explanation: persona는 shortMentor, deepLecturer, oneLineMaster를 지원하고 format_name은 paragraph 또는 bullets를 지원합니다.
    tips:
    - 역할과 형식은 한 문자열에 함께 들어가야 합니다.
    - 알 수 없는 persona나 format은 ValueError로 거부하세요.
    exercise:
      prompt: build_system_prompt(persona, format_name)를 완성해 system 문자열을 반환하세요.
      starterCode: |-
        def build_system_prompt(persona, format_name):
            raise NotImplementedError
      solution: |-
        def build_system_prompt(persona, format_name):
            personas = {
                "shortMentor": "코드를 짧고 친절하게 설명하는 멘토야",
                "deepLecturer": "개념과 이유를 단계별로 설명하는 강사야",
                "oneLineMaster": "모든 답을 정확히 한 문장으로만 끝내는 사람이야",
            }
            formats = {
                "paragraph": "한 문단으로 답한다",
                "bullets": "짧은 bullet 3개로 답한다",
            }
            if persona not in personas or format_name not in formats:
                raise ValueError("unknown system option")
            return f"너는 {personas[persona]}. 출력 형식: {formats[format_name]}."
      hints:
      - system에는 역할과 출력 형식이 모두 들어가야 합니다.
      - table로 옵션을 제한하면 잘못된 이름을 빨리 찾을 수 있습니다.
    check:
      id: python.llm.system-prompt.persona-builder.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.system-prompt.empty.behavior.v1.fixture
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
        entry: build_system_prompt
        cases:
        - id: builds-role-and-format-contract
          arguments:
          - value: oneLineMaster
          - value: paragraph
          expectedReturn: "너는 모든 답을 정확히 한 문장으로만 끝내는 사람이야. 출력 형식: 한 문단으로 답한다."
        - id: rejects-unknown-persona
          arguments:
          - value: noisy
          - value: paragraph
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 02_system_prompt-persona-lengths-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - baseline
    - workflow_validation
    title: persona별 fake 응답 길이 비교하기
    subtitle: persona comparison transfer
    goal: compare_persona_outputs(responses)를 완성해 응답 길이, 가장 짧은 persona, 빈 응답 여부를 반환한다.
    why: system prompt 실험은 느낌 비교가 아니라, 같은 질문에 대해 persona별 결과가 어떻게 달라졌는지 측정 가능한 표로 남겨야 합니다.
    explanation: responses는 persona 이름을 응답 문자열에 매핑한 dict입니다. 빈 응답이 있으면 ValueError로 거부하세요.
    tips:
    - 길이를 dict로 반환하면 persona 추가에도 구조가 유지됩니다.
    - 가장 짧은 값은 길이와 이름을 함께 기준으로 정렬하면 안정됩니다.
    exercise:
      prompt: compare_persona_outputs(responses)를 완성해 lengths와 shortest를 반환하세요.
      starterCode: |-
        def compare_persona_outputs(responses):
            raise NotImplementedError
      solution: |-
        def compare_persona_outputs(responses):
            lengths = {}
            for name, text in responses.items():
                if not text:
                    raise ValueError("empty response")
                lengths[name] = len(text)
            shortest = sorted(lengths.items(), key=lambda item: (item[1], item[0]))[0][0]
            return {"lengths": lengths, "shortest": shortest, "personaCount": len(responses)}
      hints:
      - 빈 문자열은 호출 성공처럼 보이면 안 됩니다.
      - sorted key에 이름을 함께 넣으면 동률도 안정됩니다.
    check:
      id: python.llm.system-prompt.persona-lengths.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.system-prompt.empty.behavior.v1.fixture
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
        entry: compare_persona_outputs
        cases:
        - id: compares-persona-output-lengths
          arguments:
          - value:
              shortMentor: 짧게 설명
              deepLecturer: 아주 자세하고 단계적으로 설명합니다
              oneLineMaster: 한 문장
          expectedReturn:
            lengths:
              shortMentor: 5
              deepLecturer: 19
              oneLineMaster: 4
            shortest: oneLineMaster
            personaCount: 3
        - id: rejects-empty-response
          arguments:
          - value:
              shortMentor: ""
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 02_system_prompt-rule-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - tone_system
    - format_system
    - system_builder
    title: system prompt 설계 기준 회상하기
    subtitle: system prompt recall
    goal: choose_system_prompt_rule(goal)를 완성해 역할, 어조, 형식, 금지사항의 위치와 위험을 반환한다.
    why: 시간이 지나도 남아야 할 지식은 system prompt에 무엇을 넣고 무엇을 user 메시지로 남겨야 하는지 구분하는 기준입니다.
    explanation: role, tone, format, constraint, user-task 상황별 rule을 반환하세요.
    tips:
    - 고정 규칙은 system에, 매번 바뀌는 과제는 user 메시지에 둡니다.
    - 형식 지시는 검증 가능한 출력 계약과 연결되어야 합니다.
    exercise:
      prompt: choose_system_prompt_rule(goal)를 완성해 location, rule, risk를 반환하세요.
      starterCode: |-
        def choose_system_prompt_rule(goal):
            raise NotImplementedError
      solution: |-
        def choose_system_prompt_rule(goal):
            table = {
                "role": {"location": "system", "rule": "set stable assistant responsibility", "risk": "vague identity"},
                "tone": {"location": "system", "rule": "set consistent communication style", "risk": "tone overrides clarity"},
                "format": {"location": "system", "rule": "define output shape", "risk": "unvalidated format drift"},
                "constraint": {"location": "system", "rule": "state safety or domain limits", "risk": "hidden policy conflict"},
                "user-task": {"location": "user", "rule": "send the changing task input", "risk": "task mixed into global behavior"},
            }
            if goal not in table:
                raise ValueError("unknown system goal")
            return table[goal]
      hints:
      - 반복되는 규칙과 매번 달라지는 입력을 분리하세요.
      - format은 파싱 또는 check와 연결되어야 실무 가치가 있습니다.
    check:
      id: python.llm.system-prompt.rule-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.system-prompt.empty.behavior.v1.fixture
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
        entry: choose_system_prompt_rule
        cases:
        - id: recalls-format-as-system-contract
          arguments:
          - value: format
          expectedReturn:
            location: system
            rule: define output shape
            risk: unvalidated format drift
        - id: recalls-user-task-as-changing-input
          arguments:
          - value: user-task
          expectedReturn:
            location: user
            rule: send the changing task input
            risk: task mixed into global behavior
        - id: rejects-unknown-goal
          arguments:
          - value: mood
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};