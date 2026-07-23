var e=`meta:\r
  packages:\r
  - anthropic\r
  id: llmBasics_00\r
  title: LLM통합소개\r
  order: 0\r
  category: llmBasics\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - anthropic\r
  - claude\r
  - llm\r
  - api\r
  - 자동화\r
  seo:\r
    title: Claude API로 LLM 통합 시작하기 - 대화·도구·캐싱\r
    description: anthropic SDK로 Claude를 로컬 Python에서 부르고 도구·캐싱·구조화 출력까지 묶어 실무 자동화에 붙이는 흐름을 시작합니다.\r
    keywords:\r
    - anthropic SDK\r
    - Claude API\r
    - LLM 통합\r
    - tool use\r
    - prompt caching\r
intro:\r
  direction: LLM통합소개에서 Claude API를 호출하고 응답을 안전하게 다루는 표준 흐름을 만든다.\r
  benefits:\r
  - Messages API의 기본 호출 모양과 응답 객체 구조를 익혀 이후 모든 강의의 공통 토대를 만든다.\r
  - 시스템 프롬프트·멀티턴·스트리밍·도구 사용 같은 핵심 기능이 어떤 순서로 쌓이는지 미리 본다.\r
  - 토큰 사용량과 비용을 추적하는 습관을 첫 시작부터 들여 실험이 부담 없이 늘어나도록 한다.\r
  - 첫 호출은 응답 텍스트와 사용량 필드를 assert로 확인해 이후 자동화가 같은 계약을 신뢰하게 만든다.\r
  - 모델 호출 결과를 기존 데이터 분석·자동화 흐름에 붙이는 그림을 잡는다.\r
  diagram:\r
    steps:\r
    - label: 1단계. SDK 준비와 API 키 확인\r
      detail: anthropic 패키지와 ANTHROPIC_API_KEY 환경변수를 로컬에 준비한다.\r
    - label: 2단계. 첫 호출과 응답 파싱\r
      detail: Messages API로 한 줄 호출을 만들고 응답 객체에서 텍스트를 꺼낸다.\r
    - label: 3단계. 대화·스트리밍·구조화·캐싱·도구 사용 확장\r
      detail: 핵심 기능을 한 번에 하나씩 붙이며 자동화에 가져갈 수 있는 형태로 익힌다.\r
    - label: 4단계. 데이터 분석 봇으로 종합\r
      detail: 도구·캐싱·구조화 출력을 묶어 실전 자동화 한 개를 끝까지 만든다.\r
    runtime:\r
    - label: LLM 통합 환경\r
      detail: anthropic SDK와 ANTHROPIC_API_KEY를 로컬 Python에서 실행할 수 있게 준비한다.\r
    - label: LLM통합소개 실행\r
      detail: 카테고리 전체 흐름을 한눈에 보고 강의를 시작한다.\r
    - label: LLM통합소개 완료\r
      detail: 다음 강의(첫 Claude 호출)에서 실제 호출 코드를 작성할 준비를 마친다.\r
sections:\r
- id: runtime_check\r
  title: SDK 실행 확인\r
  structuredPrimary: true\r
  subtitle: import와 클라이언트 클래스 확인\r
  goal: anthropic 패키지를 import하고 클라이언트 클래스를 확인해 첫 호출 전 로컬 Python 준비 상태를 고정한다.\r
  why: 모델 호출은 자격증명과 네트워크가 필요하므로, 소개 단계에서는 패키지 import와 객체 확인을 먼저 분리해야 합니다.\r
  explanation: 상단 라이브러리 패널이 anthropic 준비 상태를 확인하고, 이 셀은 실제 요청을 보내지 않고 SDK 객체와 배포 버전을 검증합니다.\r
  tips:\r
  - 이 셀은 API 키가 없어도 실행 가능한 준비 점검입니다.\r
  - 실제 호출은 다음 강의에서 환경변수와 응답 객체 검증까지 함께 다룹니다.\r
  snippet: |-\r
    import importlib.metadata as metadata\r
    import anthropic\r
\r
    version = metadata.version("anthropic")\r
    clientClass = anthropic.Anthropic\r
\r
    assert version\r
    assert clientClass.__name__ == "Anthropic"\r
    print(version)\r
  exercise:\r
    prompt: version과 clientClass 이름을 readiness dict에 담고, 두 값이 비어 있지 않은지 assert로 확인하세요.\r
    starterCode: |-\r
      import importlib.metadata as metadata\r
      import anthropic\r
\r
      readiness = {\r
          "version": metadata.version("anthropic"),\r
          "client": anthropic.Anthropic.__name__,\r
      }\r
\r
      assert readiness["version"]\r
      assert readiness["client"] == "Anthropic"\r
      print(readiness)\r
    solution: |-\r
      import importlib.metadata as metadata\r
      import anthropic\r
\r
      readiness = {\r
          "version": metadata.version("anthropic"),\r
          "client": anthropic.Anthropic.__name__,\r
      }\r
\r
      assert readiness["version"]\r
      assert readiness["client"] == "Anthropic"\r
      print(readiness)\r
    hints:\r
    - importlib.metadata.version은 설치된 배포 패키지 버전을 읽습니다.\r
    - anthropic.Anthropic은 실제 요청 전에도 참조할 수 있는 클라이언트 클래스입니다.\r
  check:\r
    type: noError\r
    noError: anthropic import, 버전 조회, 클라이언트 클래스 확인이 오류 없이 끝나야 합니다.\r
    resultCheck: 출력에 버전 또는 readiness dict가 보이고 두 assert가 통과해야 합니다.\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: ✨\r
    title: Claude API로 LLM 통합 시작하기\r
    subtitle: 로컬 Python에서 대화·도구·캐싱·구조화 출력을 모두 다룬다\r
  - type: hero\r
    emoji: 🤖\r
    title: 대화에서 자동화까지 한 번에\r
    subtitle: Messages API 한 줄 호출에서 도구 사용 루프, 프롬프트 캐싱, JSON 강제까지\r
    points:\r
    - emoji: 💬\r
      title: 멀티턴 대화\r
    - emoji: 🌊\r
      title: 스트리밍 응답\r
    - emoji: 📦\r
      title: JSON 구조화 출력\r
    - emoji: 💾\r
      title: 프롬프트 캐싱\r
    - emoji: 🛠️\r
      title: 도구 사용\r
  goal: LLM 통합 트랙 전체 흐름을 본다.\r
  why: 각 강의가 무엇을 다루는지 미리 그리면 11개의 강의가 한 줄로 연결된다.\r
- id: why_llm\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 Claude API를 직접 다루나요?\r
    subtitle: 채팅 UI 너머의 자동화 가치\r
  - type: note\r
    style: info\r
    title: 채팅 UI는 시작일 뿐이다\r
    content: claude.ai 같은 채팅 UI는 대화 한 줄을 만드는 데 충분합니다. 하지만 같은 모델을 반복 호출하고, 코드 안에서 결과를 분석하고, 도구와 캐싱을 활용해 비용을\r
      줄이고, 자동화 파이프라인에 연결하려면 API를 직접 호출해야 합니다. 이 트랙은 Claude API를 Python 코드 흐름의 한 단계로 만드는 방법을 다룹니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚡\r
      title: 반복 자동화\r
      description: 같은 패턴을 수백 건에 적용\r
    - emoji: 🔗\r
      title: 코드 흐름 연결\r
      description: 분석·자동화 파이프라인 한 단계로 사용\r
    - emoji: 💰\r
      title: 비용 통제\r
      description: 토큰 추적과 캐싱으로 비용 가시화\r
    - emoji: 🧪\r
      title: 실험 반복\r
      description: 프롬프트·도구·모델을 실험으로 비교\r
- id: anthropic_sdk\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 anthropic SDK 선택 이유\r
    subtitle: Claude 공식 Python SDK\r
  - type: note\r
    style: info\r
    title: 공식 SDK의 가치\r
    content: anthropic 패키지는 Anthropic이 직접 관리하는 공식 Python SDK입니다. Messages API, 스트리밍, 도구 사용, 프롬프트 캐싱 같은\r
      기능을 표준 클래스로 노출하고, 응답 객체는 IDE 자동완성과 타입 검사를 받습니다. 외부 래퍼나 직접 HTTP 호출보다 코드가 짧고 안정적입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ✅\r
      title: 공식 지원\r
      description: API 변경에 빠르게 대응\r
    - emoji: 🧱\r
      title: 일관된 객체 모델\r
      description: Message·ContentBlock·Usage 표준 타입\r
    - emoji: 🌊\r
      title: 스트리밍 내장\r
      description: with client.messages.stream(...) 컨텍스트\r
    - emoji: 🛠️\r
      title: 도구·캐싱 동등 지원\r
      description: 모든 기능을 같은 API 표면에서 호출\r
- id: model_choice\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 기본 모델 선택 - claude-haiku-4-5\r
    subtitle: 학습과 자동화에 잘 맞는 모델\r
  - type: note\r
    style: info\r
    title: 왜 haiku를 기본으로 쓰나\r
    content: 이 트랙의 호출 예시는 claude-haiku-4-5를 기본 모델로 사용합니다. 학습 단계에서는 빠른 응답과 낮은 토큰 비용이 중요하고, haiku는 멀티턴\r
      대화·도구 사용·캐싱 같은 핵심 기능을 모두 지원합니다. 무거운 추론이 필요한 작업은 동일 코드에서 model 인자만 sonnet 또는 opus 계열로 바꾸면 됩니다.\r
  - type: compare\r
    left:\r
      title: claude-haiku-4-5\r
      subtitle: 학습·자동화 기본값\r
      icon: 🌱\r
      color: green\r
      items:\r
      - 빠른 응답 속도\r
      - 낮은 토큰 비용\r
      - 도구·캐싱·스트리밍 모두 지원\r
      - 반복 실험에 적합\r
      infoBox: 이 트랙의 모든 강의에서 기본 모델\r
    right:\r
      title: claude-sonnet-4-6 / opus 계열\r
      subtitle: 정밀한 추론이 필요할 때\r
      icon: 🚀\r
      color: violet\r
      items:\r
      - 더 깊은 추론과 긴 응답\r
      - 도구 체이닝 정확도 향상\r
      - 토큰 비용은 더 큼\r
      - 같은 코드에서 model 인자만 교체\r
      infoBox: 실전에서 결과 품질이 부족할 때 단계적으로 격상\r
- id: prerequisites\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧰 준비물\r
    subtitle: 시작 전에 갖춰야 할 것\r
  - type: list\r
    style: check\r
    items:\r
    - Python 3.10 이상이 설치된 로컬 환경 (이 강의는 Codaro 로컬 Python에서 실행)\r
    - anthropic 패키지 (uv가 강의별 packages 메타로 자동 준비)\r
    - ANTHROPIC_API_KEY 환경변수 (console.anthropic.com에서 발급)\r
    - Python 함수와 예외 처리에 대한 기본 이해\r
  - type: note\r
    style: warning\r
    title: API 키 보안 원칙\r
    content: ANTHROPIC_API_KEY는 환경변수로만 다루세요. 코드에 직접 적거나 노트북 셀에 평문으로 출력하지 않습니다. 노트북 공유나 git 커밋 전에 키가 코드에\r
      섞이지 않았는지 확인하는 습관을 첫 강의부터 들입니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 앞으로 배울 내용\r
    subtitle: 11개 강의로 LLM 통합 마스터하기\r
  - type: table\r
    headers:\r
    - 단계\r
    - 강의\r
    - 배울 내용\r
    - 실용 가치\r
    rows:\r
    - - 입문\r
      - 첫 Claude 호출\r
      - anthropic.Anthropic, messages.create, 응답 파싱\r
      - LLM 한 줄 호출의 표준 모양\r
    - - 입문\r
      - 시스템 프롬프트 역할 부여\r
      - system 인자, 어조·역할 지시\r
      - 응답 톤과 행동 제어\r
    - - 기초\r
      - 멀티턴 대화 만들기\r
      - messages 리스트로 user/assistant 교차\r
      - 대화형 도구의 기본 패턴\r
    - - 기초\r
      - 토큰과 비용 추적\r
      - usage.input_tokens / output_tokens, 비용 추정 함수\r
      - 실험 비용을 가시화\r
    - - 기초\r
      - 스트리밍 응답\r
      - messages.stream, 텍스트 청크 누적\r
      - 긴 응답을 실시간으로 보여주는 UI 기반\r
    - - 중급\r
      - JSON 구조화 출력\r
      - JSON 강제 프롬프트, json.loads + 재시도\r
      - 자동화에서 안전하게 받는 데이터\r
    - - 중급\r
      - 프롬프트 캐싱\r
      - cache_control, 시스템 프롬프트 캐시 적중률\r
      - 반복 호출 비용 절감\r
    - - 중급\r
      - Tool use 기초\r
      - tools 인자, tool_use → tool_result 루프\r
      - Claude가 코드 함수를 호출하게 만든다\r
    - - 심화\r
      - 멀티 도구 라우팅\r
      - 여러 도구 정의, 도구 선택 로직, 에러 처리\r
      - 도구 묶음으로 실제 업무를 처리\r
    - - 심화\r
      - 데이터 분석 봇 종합\r
      - CSV 로딩 도구 + 캐싱 + JSON 출력 합성\r
      - 실전 자동화 한 개를 끝까지 빌드\r
- id: codaro_alignment\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌱 Codaro 정체성과의 연결\r
    subtitle: 채팅·에디터·자동화·커리큘럼에 LLM을 붙이는 토대\r
  - type: note\r
    style: tip\r
    title: 트랙의 자리\r
    content: Codaro는 코드가 인터페이스가 되는 자동화 스튜디오입니다. 이 트랙은 사용자가 자신의 자동화 흐름 안에서 LLM을 직접 호출하고, 결과를 코드의 한 단계로\r
      받아들이는 능력을 만듭니다. 채팅 표면 너머에서 모델을 도구처럼 다루는 감각을 키우는 것이 이 트랙의 목표입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 💬\r
      title: 채팅 표면\r
      description: 모델 응답을 받고 멀티턴 흐름을 만든다\r
    - emoji: ✍️\r
      title: 에디터·노트북\r
      description: 셀 안에서 호출 결과를 데이터로 다룬다\r
    - emoji: 🛠️\r
      title: 자동화·태스크\r
      description: 도구 사용 루프로 함수를 묶는다\r
    - emoji: 📚\r
      title: 커리큘럼·학습\r
      description: 학습 결과를 LLM이 분석·요약·검증에 활용\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 공식 문서와 추가 학습 경로\r
  - type: links\r
    items:\r
    - text: Anthropic API 문서 (Messages)\r
      url: https://docs.anthropic.com/en/api/messages\r
      icon: 🔗\r
    - text: Anthropic Python SDK GitHub\r
      url: https://github.com/anthropics/anthropic-sdk-python\r
      icon: 🔗\r
    - text: 프롬프트 엔지니어링 가이드\r
      url: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview\r
      icon: 🔗\r
    - text: 도구 사용 가이드\r
      url: https://docs.anthropic.com/en/docs/build-with-claude/tool-use\r
      icon: 🔗\r
- id: next
  blocks:
  - type: hero
    emoji: 👉
    title: '다음: 첫 Claude 호출'
    subtitle: anthropic.Anthropic 클라이언트와 messages.create로 첫 호출을 만든다
  goal: 다음 강의에서 실제 호출 코드를 작성할 준비를 마친다.
  why: 첫 호출 한 줄이 트랙 전체의 코드 형태를 결정한다.
assessment:
  masteryVariants:
  - id: 00_llm_intro-surface-plan-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - intro
    - why_llm
    - codaro_alignment
    title: 제품 표면별 LLM 통합 목적 정리하기
    subtitle: LLM integration map
    goal: plan_llm_surface(surface)를 완성해 채팅, 노트북, 자동화, 커리큘럼 표면별 목적과 검증 증거를 반환한다.
    why: 통합 소개는 감상으로 끝나면 학습이 되지 않습니다. 어느 표면에서 모델을 왜 쓰고 무엇을 evidence로 남길지 말할 수 있어야 다음 호출 코드가 의미를 가집니다.
    explanation: chat, notebook, automation, curriculum 네 표면을 지원하고 알 수 없는 surface는 ValueError로 거부하세요.
    tips:
    - 목적과 evidence를 함께 반환해야 실행 결과를 학습 증거로 연결할 수 있습니다.
    - 외부 호출이 없어도 통합 설계의 데이터 계약은 검증할 수 있습니다.
    exercise:
      prompt: plan_llm_surface(surface)를 완성해 purpose, evidence, risk를 반환하세요.
      starterCode: |-
        def plan_llm_surface(surface):
            raise NotImplementedError
      solution: |-
        def plan_llm_surface(surface):
            table = {
                "chat": {
                    "purpose": "conversation and clarification",
                    "evidence": "message transcript",
                    "risk": "unclear user intent",
                },
                "notebook": {
                    "purpose": "turn model output into data for code cells",
                    "evidence": "validated variable or table",
                    "risk": "unparsed text copied into code",
                },
                "automation": {
                    "purpose": "call tools and route results",
                    "evidence": "tool request and tool result pair",
                    "risk": "unsafe action without validation",
                },
                "curriculum": {
                    "purpose": "explain errors and guide next practice",
                    "evidence": "check result and feedback",
                    "risk": "self-report treated as mastery",
                },
            }
            if surface not in table:
                raise ValueError("unknown surface")
            return table[surface]
      hints:
      - evidence는 화면에 보이는 말이 아니라 저장하거나 검증할 수 있는 결과여야 합니다.
      - automation 표면에서는 tool request와 tool result가 한 쌍으로 남아야 합니다.
    check:
      id: python.llm.intro.surface-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.intro.empty.behavior.v1.fixture
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
        entry: plan_llm_surface
        cases:
        - id: maps-automation-to-tool-evidence
          arguments:
          - value: automation
          expectedReturn:
            purpose: call tools and route results
            evidence: tool request and tool result pair
            risk: unsafe action without validation
        - id: rejects-unknown-surface
          arguments:
          - value: billboard
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 00_llm_intro-task-classifier-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - projects_preview
    - codaro_alignment
    title: LLM 통합 과제를 제품 표면으로 분류하기
    subtitle: integration task transfer
    goal: classify_llm_task(task)를 완성해 과제 설명의 input, output, surface를 기준으로 웹 학습 가능 여부를 반환한다.
    why: 첫 호출 전에도 어떤 과제가 브라우저에서 안전하게 검증 가능한지, 어떤 과제가 Local 자동화로 넘어가야 하는지 판단해야 합니다.
    explanation: requiresLocal이 true이면 tier는 local-required, 아니면 web-capable입니다. output이 tool-result면 automation surface로 분류하세요.
    tips:
    - 웹 학습 가능성은 모델 호출 여부가 아니라 결과 검증과 권한 요구에 달려 있습니다.
    - 파일 시스템이나 OS 권한이 필요한 과제는 local-required로 둡니다.
    exercise:
      prompt: classify_llm_task(task)를 완성해 surface, tier, evidence를 반환하세요.
      starterCode: |-
        def classify_llm_task(task):
            raise NotImplementedError
      solution: |-
        def classify_llm_task(task):
            if task.get("requiresLocal"):
                tier = "local-required"
            else:
                tier = "web-capable"
            output = task["output"]
            if output == "tool-result":
                surface = "automation"
                evidence = "tool result"
            elif output == "table":
                surface = "notebook"
                evidence = "validated table"
            elif output == "feedback":
                surface = "curriculum"
                evidence = "check feedback"
            else:
                surface = "chat"
                evidence = "message transcript"
            return {"surface": surface, "tier": tier, "evidence": evidence}
      hints:
      - requiresLocal은 surface와 별개로 tier를 결정합니다.
      - output 값이 검증 증거의 종류를 결정합니다.
    check:
      id: python.llm.intro.task-classifier.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.intro.empty.behavior.v1.fixture
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
        entry: classify_llm_task
        cases:
        - id: classifies-tool-task-as-local-automation
          arguments:
          - value:
              output: tool-result
              requiresLocal: true
          expectedReturn:
            surface: automation
            tier: local-required
            evidence: tool result
        - id: classifies-table-task-as-web-notebook
          arguments:
          - value:
              output: table
              requiresLocal: false
          expectedReturn:
            surface: notebook
            tier: web-capable
            evidence: validated table
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 00_llm_intro-concept-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - runtime_check
    - prerequisites
    - next
    title: LLM 통합 시작 전 확인 기준 회상하기
    subtitle: integration readiness recall
    goal: choose_llm_readiness_check(need)를 완성해 시작 전 확인 항목과 실패 시 대응을 반환한다.
    why: 첫 호출보다 먼저 남아야 할 지식은 환경, 비용, 검증 증거, 권한 경계를 확인하는 습관입니다.
    explanation: package, key, cost, evidence, local-boundary 상황별 확인 기준을 선택하세요.
    tips:
    - API 키 확인은 값을 출력하지 않고 존재 여부만 확인해야 합니다.
    - evidence가 없으면 모델 응답을 학습 완료로 삼으면 안 됩니다.
    exercise:
      prompt: choose_llm_readiness_check(need)를 완성해 check, why, fallback을 반환하세요.
      starterCode: |-
        def choose_llm_readiness_check(need):
            raise NotImplementedError
      solution: |-
        def choose_llm_readiness_check(need):
            table = {
                "package": {
                    "check": "import sdk",
                    "why": "client code cannot run without the package",
                    "fallback": "show runtime preparation",
                },
                "key": {
                    "check": "environment variable exists",
                    "why": "calls need credentials without printing secrets",
                    "fallback": "stay in mock request mode",
                },
                "cost": {
                    "check": "usage and price table",
                    "why": "token cost must be visible",
                    "fallback": "estimate from fake usage",
                },
                "evidence": {
                    "check": "strong result contract",
                    "why": "text alone is not mastery",
                    "fallback": "require a behavior check",
                },
                "local-boundary": {
                    "check": "permission and file access",
                    "why": "browser lessons must not fake OS automation",
                    "fallback": "mark local-required",
                },
            }
            if need not in table:
                raise ValueError("unknown readiness need")
            return table[need]
      hints:
      - 키는 출력하지 않는 것이 원칙입니다.
      - 브라우저에서 못 하는 일을 통과로 기록하면 안 됩니다.
    check:
      id: python.llm.intro.concept-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.llm.intro.empty.behavior.v1.fixture
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
        entry: choose_llm_readiness_check
        cases:
        - id: recalls-secret-safe-key-check
          arguments:
          - value: key
          expectedReturn:
            check: environment variable exists
            why: calls need credentials without printing secrets
            fallback: stay in mock request mode
        - id: recalls-local-boundary
          arguments:
          - value: local-boundary
          expectedReturn:
            check: permission and file access
            why: browser lessons must not fake OS automation
            fallback: mark local-required
        - id: rejects-unknown-need
          arguments:
          - value: vibes
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};