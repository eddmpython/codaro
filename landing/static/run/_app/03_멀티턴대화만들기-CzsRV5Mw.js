var e=`meta:
  packages:
  - anthropic
  id: llmBasics_03
  title: 멀티턴대화만들기
  order: 3
  category: llmBasics
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - anthropic
  - multiturn
  - messages
  - 대화
  seo:
    title: Claude 멀티턴 대화 - messages 리스트로 컨텍스트 이어가기
    description: messages 리스트에 user/assistant 메시지를 누적해 멀티턴 대화 컨텍스트를 유지하는 방법을 익힙니다.
    keywords:
    - 멀티턴 대화
    - messages 리스트
    - Claude 대화 히스토리
    - conversation history
intro:
  emoji: 💬
  goal: messages 리스트에 user/assistant 메시지를 누적해 컨텍스트가 이어지는 대화를 만든다.
  description: 호출 사이에 대화 상태가 자동 저장되지 않는다는 특성을 이해하고, 명시적으로 messages를 키워가는 패턴을 손에 익힙니다.
  direction: 단일 메시지 → 직접 누적 → ChatSession 클래스화 순으로 대화 패턴을 발전시키며 자동화에서 재사용 가능한 구조를 만든다.
  benefits:
  - Messages API가 stateless라는 점과 대화 컨텍스트를 명시적으로 보내야 한다는 점을 분명히 한다.
  - user/assistant 메시지를 올바른 형식으로 누적하는 방법을 익힌다.
  - 대화 길이가 늘어남에 따라 input_tokens가 증가하는 현상을 직접 관찰한다.
  - ChatSession 클래스로 자동화 코드에서 바로 쓸 수 있는 추상화를 만든다.
  diagram:
    steps:
    - label: 1단계. 단일 turn 호출
      detail: messages 리스트가 user 한 줄만 가진 baseline.
    - label: 2단계. assistant 응답 누적
      detail: 응답 텍스트를 다음 호출의 messages에 assistant 역할로 추가한다.
    - label: 3단계. 대화 이어가기
      detail: 새 user 질문을 덧붙여 컨텍스트가 유지되는지 확인한다.
    - label: 4단계. ChatSession 클래스화
      detail: 대화 상태를 캡슐화한 객체를 만들어 자동화에서 재사용한다.
    runtime:
    - label: LLM 호출 환경
      detail: anthropic 패키지와 ANTHROPIC_API_KEY가 준비된 로컬 Python에서 실행한다.
    - label: 멀티턴대화만들기 실행
      detail: messages 리스트를 한 단계씩 키우며 input_tokens 변화를 관찰한다.
    - label: 멀티턴대화만들기 완료
      detail: 다음 강의의 비용 추적과 5번 스트리밍 응답의 토대가 된다.
sections:
- id: stateless
  title: 1단계. API는 stateless다
  structuredPrimary: true
  subtitle: 매 호출마다 컨텍스트를 다시 보낸다
  goal: 두 번의 독립 호출로는 대화가 이어지지 않는다는 사실을 코드로 확인한다.
  why: Messages API는 호출 사이에 상태를 저장하지 않습니다. 이 사실을 처음부터 분명히 해두면 컨텍스트 누락 버그를 피할 수 있습니다.
  explanation: 두 번 따로 호출하면 두 번째 응답은 첫 번째 응답을 모릅니다. 두 번째 호출의 messages에 첫 번째 응답이 없기 때문입니다. 자동화에서 "왜 갑자기 이전
    대화를 잊지?"라는 현상은 대부분 messages를 누적하지 않아 생깁니다.
  tips:
  - 셀 사이 변수 재할당이 금지되므로 두 호출 응답은 다른 이름(first/second)으로 받습니다.
  snippet: |-
    import anthropic

    client = anthropic.Anthropic()
    firstResponse = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=120,
        messages=[{"role": "user", "content": "내 이름은 김민준이야."}],
    )
    secondResponse = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=120,
        messages=[{"role": "user", "content": "내 이름이 뭐였지?"}],
    )
    secondAnswer = "".join(block.text for block in secondResponse.content if block.type == "text")
    secondAnswer
  exercise:
    prompt: secondResponse가 "기억하지 못한다" 같은 답을 줄 가능성이 높습니다. 응답을 그대로 확인하고 stateless 동작이 어떤 모양으로 드러나는지 보세요.
    starterCode: |-
      import anthropic

      client = anthropic.Anthropic()
      firstResponse = client.messages.create(
          model="claude-haiku-4-5",
          max_tokens=120,
          messages=[{"role": "user", "content": "내 이름은 김민준이야."}],
      )
      secondResponse = client.messages.create(
          model="claude-haiku-4-5",
          max_tokens=120,
          messages=[{"role": "user", "content": "내 이름이 뭐였지?"}],
      )
      secondAnswer = "".join(block.text for block in secondResponse.content if block.type == "text")
      secondAnswer
    hints:
    - 모델이 추측해서 답하더라도 첫 호출의 정보를 정확히 재현하기 어렵습니다.
    - 모델이 정보가 없다고 답하면 stateless를 정확히 보여준 것입니다.
  check:
    noError: 두 번의 독립 호출이 예외 없이 끝까지 완료되어야 합니다.
    resultCheck: secondAnswer가 비어있지 않은 문자열이어야 합니다.
- id: accumulate
  title: 2단계. assistant 응답을 messages에 누적
  structuredPrimary: true
  subtitle: 역할 교차로 컨텍스트 만들기
  goal: 첫 응답을 다음 호출의 messages에 assistant 역할로 추가해 대화 컨텍스트를 명시적으로 만든다.
  why: 컨텍스트 유지의 핵심 패턴입니다. 한 번만 익히면 도구 사용·캐싱·구조화 출력 모두에서 동일한 패턴이 반복됩니다.
  explanation: 두 번째 호출의 messages는 user → assistant → user 순서가 됩니다. assistant 메시지의 content에는 첫 응답의 텍스트가 들어갑니다.
    역할이 user/assistant로 교차되어야 모델이 대화의 순서를 정확히 인식합니다.
  tips:
  - assistant content는 텍스트 문자열 또는 ContentBlock 리스트 모두 허용됩니다. 학습 단계에서는 문자열로 충분합니다.
  snippet: |-
    import anthropic

    client = anthropic.Anthropic()
    intro = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=120,
        messages=[{"role": "user", "content": "내 이름은 김민준이야. 인사해 줘."}],
    )
    introText = "".join(block.text for block in intro.content if block.type == "text")

    history = [
        {"role": "user", "content": "내 이름은 김민준이야. 인사해 줘."},
        {"role": "assistant", "content": introText},
        {"role": "user", "content": "내 이름이 뭐라고 했지?"},
    ]
    follow = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=120,
        messages=history,
    )
    followText = "".join(block.text for block in follow.content if block.type == "text")
    (introText[:40], followText)
  exercise:
    prompt: follow 호출의 messages에서 assistant 항목을 빼고 호출해 결과가 달라지는지 비교하세요.
    starterCode: |-
      import anthropic

      client = anthropic.Anthropic()
      intro = client.messages.create(
          model="claude-haiku-4-5",
          max_tokens=120,
          messages=[{"role": "user", "content": "내 이름은 김민준이야. 인사해 줘."}],
      )
      introText = "".join(block.text for block in intro.content if block.type == "text")

      history = [
          {"role": "user", "content": "내 이름은 김민준이야. 인사해 줘."},
          {"role": "assistant", "content": introText},
          {"role": "user", "content": "내 이름이 뭐라고 했지?"},
      ]
      follow = client.messages.create(
          model="claude-haiku-4-5",
          max_tokens=120,
          messages=history,
      )
      followText = "".join(block.text for block in follow.content if block.type == "text")
      (introText[:40], followText)
    hints:
    - assistant 메시지를 빼면 follow가 첫 user 메시지를 다시 본 것처럼 동작합니다.
    - 역할 순서는 항상 user로 끝나야 모델이 응답을 만듭니다.
  check:
    noError: 두 호출이 모두 정상 실행되어야 합니다.
    resultCheck: followText가 "김민준" 같은 첫 메시지 정보를 반영해야 합니다.
- id: extend_turns
  title: 3단계. 여러 턴 이어가기
  structuredPrimary: true
  subtitle: 매 호출마다 history를 확장
  goal: 세 번의 사용자 발화를 누적해 history가 길어질수록 input_tokens가 늘어나는 것을 관찰한다.
  why: 토큰은 history 길이에 비례합니다. 비용 직감을 만들기 위해 직접 측정하는 단계가 필요합니다.
  explanation: 한 턴마다 history에 user/assistant 두 개씩 추가됩니다. 호출이 누적될수록 input_tokens가 늘어나는 패턴이 명확하게 관찰됩니다. 비용
    가시화를 위해 input_tokens 리스트를 함께 보관해두면 학습이 빨라집니다.
  tips:
  - history를 명시적인 변수로 따로 관리하면 어떤 컨텍스트가 모델에 들어갔는지 디버깅이 쉬워집니다.
  snippet: |-
    import anthropic

    client = anthropic.Anthropic()
    history = []
    turns = [
        "내 이름은 김민준이야.",
        "내 직업은 데이터 분석가야.",
        "지금 내 직업과 이름을 한 문장으로 정리해 줘.",
    ]
    inputTokensHistory = []
    for question in turns:
        history.append({"role": "user", "content": question})
        result = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=200,
            messages=history,
        )
        answer = "".join(block.text for block in result.content if block.type == "text")
        history.append({"role": "assistant", "content": answer})
        inputTokensHistory.append(result.usage.input_tokens)

    inputTokensHistory
  exercise:
    prompt: turns에 질문을 두 개 더 추가하고 inputTokensHistory가 단조 증가하는지 확인하세요.
    starterCode: |-
      import anthropic

      client = anthropic.Anthropic()
      history = []
      turns = [
          "내 이름은 김민준이야.",
          "내 직업은 데이터 분석가야.",
          "지금 내 직업과 이름을 한 문장으로 정리해 줘.",
      ]
      inputTokensHistory = []
      for question in turns:
          history.append({"role": "user", "content": question})
          result = client.messages.create(
              model="claude-haiku-4-5",
              max_tokens=200,
              messages=history,
          )
          answer = "".join(block.text for block in result.content if block.type == "text")
          history.append({"role": "assistant", "content": answer})
          inputTokensHistory.append(result.usage.input_tokens)

      inputTokensHistory
    hints:
    - 새 질문을 추가하면 history 길이가 늘어나 input_tokens가 증가합니다.
    - 매 호출마다 history.append가 두 번씩 실행되는 흐름을 머릿속에 그리면 디버깅이 쉽습니다.
  check:
    noError: 반복 호출이 예외 없이 끝까지 완료되어야 합니다.
    resultCheck: inputTokensHistory가 단조 증가하는 양의 정수 리스트여야 합니다.
- id: chat_session
  title: 4단계. ChatSession 클래스로 캡슐화
  structuredPrimary: true
  subtitle: 대화 상태를 객체에 담기
  goal: 클라이언트와 history를 가진 ChatSession 클래스를 만들어 send 한 메서드로 대화를 잇는다.
  why: 자동화에서 대화는 보통 함수 한 개가 아니라 객체 단위로 관리됩니다. 클래스 한 개로 만들어 두면 여러 대화를 병렬로 다룰 수 있습니다.
  explanation: ChatSession은 model, system, history를 인스턴스 속성으로 보관합니다. send(question) 메서드는 history에 user를 추가하고
    API를 호출한 뒤 응답을 assistant로 저장합니다. 자동화 코드에서는 ChatSession 객체를 함수 인자로 주고받으며 컨텍스트를 유지합니다.
  tips:
  - reset 메서드를 두면 같은 객체로 새 대화를 시작할 수 있어 테스트가 편해집니다.
  snippet: |-
    import anthropic

    class ChatSession:
        def __init__(self, model: str = "claude-haiku-4-5", system: str | None = None) -> None:
            self.client = anthropic.Anthropic()
            self.model = model
            self.system = system
            self.history: list[dict] = []
            self.lastUsage = None

        def send(self, question: str, maxTokens: int = 256) -> str:
            self.history.append({"role": "user", "content": question})
            kwargs = {
                "model": self.model,
                "max_tokens": maxTokens,
                "messages": self.history,
            }
            if self.system:
                kwargs["system"] = self.system
            result = self.client.messages.create(**kwargs)
            text = "".join(block.text for block in result.content if block.type == "text")
            self.history.append({"role": "assistant", "content": text})
            self.lastUsage = result.usage
            return text

        def reset(self) -> None:
            self.history.clear()
            self.lastUsage = None

    session = ChatSession(system="너는 정중하게 답하는 데이터 멘토야.")
    intro = session.send("Python을 처음 배우는 사람에게 한 가지 조언을 해 줘.")
    follow = session.send("그 조언을 더 짧게 한 문장으로 줄여 줘.")
    (len(session.history), intro[:30], follow[:30])
  exercise:
    prompt: ChatSession에 cumulativeInputTokens 속성을 추가해 매 호출 input_tokens 합을 누적하세요.
    starterCode: |-
      import anthropic

      class ChatSession:
          def __init__(self, model: str = "claude-haiku-4-5", system: str | None = None) -> None:
              self.client = anthropic.Anthropic()
              self.model = model
              self.system = system
              self.history: list[dict] = []
              self.lastUsage = None

          def send(self, question: str, maxTokens: int = 256) -> str:
              self.history.append({"role": "user", "content": question})
              kwargs = {
                  "model": self.model,
                  "max_tokens": maxTokens,
                  "messages": self.history,
              }
              if self.system:
                  kwargs["system"] = self.system
              result = self.client.messages.create(**kwargs)
              text = "".join(block.text for block in result.content if block.type == "text")
              self.history.append({"role": "assistant", "content": text})
              self.lastUsage = result.usage
              return text

          def reset(self) -> None:
              self.history.clear()
              self.lastUsage = None

      session = ChatSession(system="너는 정중하게 답하는 데이터 멘토야.")
      intro = session.send("Python을 처음 배우는 사람에게 한 가지 조언을 해 줘.")
      follow = session.send("그 조언을 더 짧게 한 문장으로 줄여 줘.")
      (len(session.history), intro[:30], follow[:30])
    hints:
    - __init__에서 self.cumulativeInputTokens = 0으로 초기화합니다.
    - send 안에서 self.cumulativeInputTokens += result.usage.input_tokens를 추가합니다.
  check:
    noError: 클래스 정의와 두 번의 send 호출이 정상 실행되어야 합니다.
    resultCheck: history 길이가 4이고 두 응답 모두 비어있지 않은 문자열이어야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 다섯 턴 대화 누적 + 사실 회상 검증'
  structuredPrimary: true
  subtitle: 예측 → 누적 → 검증 → 사실 회상
  goal: 다섯 턴 동안 정보를 누적하고 마지막 턴에서 사실이 회상되는지 코드로 검증한다.
  why: 멀티턴은 컨텍스트 유지를 검증해야 의미가 있습니다. 누적된 사실 두 가지가 마지막 응답에 나타나는지 assertion으로 확인하면 자동화에서 신뢰할 수 있습니다.
  explanation: 사용자 정보를 다섯 턴에 걸쳐 알려주고, 마지막에 모델이 두 가지 사실(이름, 직업)을 모두 응답에 포함하는지 in 연산자로 확인합니다. 모델 응답이 표현
    변형을 할 수 있으므로 핵심 키워드 중심으로 검증합니다.
  tips:
  - 검증할 키워드를 명시적으로 리스트로 두면 assertion 메시지가 명확해집니다.
  snippet: |-
    import anthropic

    client = anthropic.Anthropic()
    chatHistory = []
    facts = [
        "내 이름은 김민준이야.",
        "나는 데이터 분석가로 일해.",
        "주로 pandas와 SQL을 쓰고 있어.",
        "최근에 LLM 자동화에 관심이 생겼어.",
        "지금까지 알려준 내 이름과 직업을 한 문장으로 정리해 줘.",
    ]

    finalAnswer = ""
    for line in facts:
        chatHistory.append({"role": "user", "content": line})
        result = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=200,
            messages=chatHistory,
        )
        finalAnswer = "".join(block.text for block in result.content if block.type == "text")
        chatHistory.append({"role": "assistant", "content": finalAnswer})

    keywords = ["김민준", "데이터 분석"]
    missing = [keyword for keyword in keywords if keyword not in finalAnswer]
    assert not missing, f"missing keywords: {missing}"
    finalAnswer
  exercise:
    prompt: facts에 한 줄을 더 추가하고 keywords에도 새 키워드를 더해 검증을 통과시켜 보세요.
    starterCode: |-
      import anthropic

      client = anthropic.Anthropic()
      chatHistory = []
      facts = [
          "내 이름은 김민준이야.",
          "나는 데이터 분석가로 일해.",
          "주로 pandas와 SQL을 쓰고 있어.",
          "최근에 LLM 자동화에 관심이 생겼어.",
          "지금까지 알려준 내 이름과 직업을 한 문장으로 정리해 줘.",
      ]

      finalAnswer = ""
      for line in facts:
          chatHistory.append({"role": "user", "content": line})
          result = client.messages.create(
              model="claude-haiku-4-5",
              max_tokens=200,
              messages=chatHistory,
          )
          finalAnswer = "".join(block.text for block in result.content if block.type == "text")
          chatHistory.append({"role": "assistant", "content": finalAnswer})

      keywords = ["김민준", "데이터 분석"]
      missing = [keyword for keyword in keywords if keyword not in finalAnswer]
      assert not missing, f"missing keywords: {missing}"
      finalAnswer
    hints:
    - facts와 keywords를 함께 늘립니다.
    - 키워드는 모델이 그대로 사용할 가능성이 높은 명사 위주로 고릅니다.
  check:
    noError: 다섯 번의 호출이 모두 정상 실행되어야 합니다.
    resultCheck: missing 리스트가 비어 있어야 합니다.
assessment:
  masteryVariants:
  - id: 03_multi_turn-history-append-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - stateless
    - accumulate
    - chat_session
    title: 멀티턴 history에 user와 assistant 턴 누적하기
    subtitle: chat history contract
    goal: append_chat_turn(history, user_text, assistant_text)를 완성해 기존 history를 보존하고 새 두 턴이 붙은 목록을 반환한다.
    why: 멀티턴 대화의 본질은 모델이 기억한다는 착각이 아니라, 호출자가 messages history를 다시 보내 상태를 구성한다는 점입니다.
    explanation: 입력 history는 바꾸지 말고 복사본에 user, assistant 순서로 새 턴을 붙이세요. 빈 user_text는 ValueError입니다.
    tips:
    - 기존 history를 직접 append하면 호출자가 가진 원본도 변합니다.
    - role 순서가 user 다음 assistant인지 확인하세요.
    exercise:
      prompt: append_chat_turn(history, user_text, assistant_text)를 완성해 새 history와 원본 길이를 반환하세요.
      starterCode: |-
        def append_chat_turn(history, user_text, assistant_text):
            raise NotImplementedError
      solution: |-
        def append_chat_turn(history, user_text, assistant_text):
            if not user_text.strip():
                raise ValueError("user_text must not be empty")
            next_history = [dict(message) for message in history]
            next_history.append({"role": "user", "content": user_text})
            next_history.append({"role": "assistant", "content": assistant_text})
            return {"history": next_history, "originalLength": len(history)}
      hints:
      - dict(message)로 각 메시지를 복사하면 원본 mutation을 줄일 수 있습니다.
      - assistant_text가 빈 문자열이어도 응답 실패를 별도 단계에서 처리할 수 있게 여기서는 구조만 유지합니다.
    check:
      id: python.llm.multi-turn.history-append.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-turn.empty.behavior.v1.fixture
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
        entry: append_chat_turn
        cases:
        - id: appends-user-and-assistant-turns
          arguments:
          - value:
            - role: user
              content: 내 이름은 민준이야
            - role: assistant
              content: 기억할게요
          - value: 내 직업은 데이터 분석가야
          - value: 데이터 분석가라고 저장했어요
          expectedReturn:
            history:
            - role: user
              content: 내 이름은 민준이야
            - role: assistant
              content: 기억할게요
            - role: user
              content: 내 직업은 데이터 분석가야
            - role: assistant
              content: 데이터 분석가라고 저장했어요
            originalLength: 2
        - id: rejects-empty-user-text
          arguments:
          - value: []
          - value: ''
          - value: ok
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 03_multi_turn-memory-check-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - extend_turns
    - workflow_validation
    title: 마지막 응답이 필요한 사실을 회상했는지 검사하기
    subtitle: chat memory verification
    goal: check_memory_keywords(final_answer, keywords)를 완성해 누락 키워드와 통과 여부를 반환한다.
    why: 멀티턴 회상은 느낌이 아니라, 필요한 사실이 마지막 답변에 들어 있는지 자동으로 확인해야 학습 증거가 됩니다.
    explanation: keywords의 모든 항목이 final_answer에 포함되어야 passed가 true입니다. 대소문자는 그대로 비교합니다.
    tips:
    - missing 목록이 비어 있으면 통과입니다.
    - 키워드는 모델이 그대로 사용할 가능성이 높은 명사를 고릅니다.
    exercise:
      prompt: check_memory_keywords(final_answer, keywords)를 완성해 passed와 missing을 반환하세요.
      starterCode: |-
        def check_memory_keywords(final_answer, keywords):
            raise NotImplementedError
      solution: |-
        def check_memory_keywords(final_answer, keywords):
            missing = [keyword for keyword in keywords if keyword not in final_answer]
            return {"passed": not missing, "missing": missing, "keywordCount": len(keywords)}
      hints:
      - missing 리스트를 만들면 실패 원인을 바로 보여줄 수 있습니다.
      - bool(missing)이 아니라 not missing이 통과 조건입니다.
    check:
      id: python.llm.multi-turn.memory-check.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-turn.empty.behavior.v1.fixture
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
        entry: check_memory_keywords
        cases:
        - id: passes-when-all-keywords-are-present
          arguments:
          - value: 민준님은 데이터 분석가이고 pandas를 사용합니다.
          - value:
            - 민준
            - 데이터 분석가
            - pandas
          expectedReturn:
            passed: true
            missing: []
            keywordCount: 3
        - id: reports-missing-keywords
          arguments:
          - value: 민준님은 pandas를 사용합니다.
          - value:
            - 민준
            - 데이터 분석가
          expectedReturn:
            passed: false
            missing:
            - 데이터 분석가
            keywordCount: 2
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 03_multi_turn-rule-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 03_multi_turn-memory-check-transfer
    title: 멀티턴 대화 상태 관리 기준 회상하기
    subtitle: multi-turn recall
    goal: choose_multi_turn_rule(need)를 완성해 history 관리 상황별 규칙과 위험을 반환한다.
    why: 멀티턴에서 오래 남아야 할 지식은 모델이 자동으로 기억하지 않으며, 호출자가 보낸 messages가 상태라는 점입니다.
    explanation: stateless-api, append-assistant, trim-history, verify-memory, encapsulate-session 상황별 규칙을 선택하세요.
    tips:
    - assistant 응답도 다음 호출 history에 넣어야 맥락이 이어집니다.
    - history가 길어지면 요약이나 windowing 정책이 필요합니다.
    exercise:
      prompt: choose_multi_turn_rule(need)를 완성해 rule, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_multi_turn_rule(need):
            raise NotImplementedError
      solution: |-
        def choose_multi_turn_rule(need):
            table = {
                "stateless-api": {"rule": "send prior messages again", "useWhen": "context must continue", "risk": "missing facts"},
                "append-assistant": {"rule": "store model replies too", "useWhen": "later turns refer to previous answers", "risk": "one-sided history"},
                "trim-history": {"rule": "summarize or window old turns", "useWhen": "history grows too long", "risk": "lost details"},
                "verify-memory": {"rule": "assert required keywords or facts", "useWhen": "a fact must be recalled", "risk": "false confidence"},
                "encapsulate-session": {"rule": "wrap history updates in a class", "useWhen": "several calls share state", "risk": "hidden mutation"},
            }
            if need not in table:
                raise ValueError("unknown multi-turn need")
            return table[need]
      hints:
      - 상태는 서버가 아니라 messages 배열에 있습니다.
      - 기억 검증은 자동 check와 함께 있어야 합니다.
    check:
      id: python.llm.multi-turn.rule-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.multi-turn.empty.behavior.v1.fixture
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
        entry: choose_multi_turn_rule
        cases:
        - id: recalls-stateless-api-rule
          arguments:
          - value: stateless-api
          expectedReturn:
            rule: send prior messages again
            useWhen: context must continue
            risk: missing facts
        - id: recalls-memory-verification
          arguments:
          - value: verify-memory
          expectedReturn:
            rule: assert required keywords or facts
            useWhen: a fact must be recalled
            risk: false confidence
        - id: rejects-unknown-need
          arguments:
          - value: model-remembers-forever
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