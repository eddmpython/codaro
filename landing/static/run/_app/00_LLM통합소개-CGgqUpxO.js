var e=`meta:
  packages:
  - anthropic
  id: llmBasics_00
  title: LLM통합소개
  order: 0
  category: llmBasics
  badge: 소개
  source: eddmpython
  sourceUrl: https://eddmpython.com
  tags:
  - anthropic
  - claude
  - llm
  - api
  - 자동화
  seo:
    title: Claude API로 LLM 통합 시작하기 - 대화·도구·캐싱
    description: anthropic SDK로 Claude를 로컬 Python에서 부르고 도구·캐싱·구조화 출력까지 묶어 실무 자동화에 붙이는 흐름을 시작합니다.
    keywords:
    - anthropic SDK
    - Claude API
    - LLM 통합
    - tool use
    - prompt caching
intro:
  direction: LLM통합소개에서 Claude API를 호출하고 응답을 안전하게 다루는 표준 흐름을 만든다.
  benefits:
  - Messages API의 기본 호출 모양과 응답 객체 구조를 익혀 이후 모든 강의의 공통 토대를 만든다.
  - 시스템 프롬프트·멀티턴·스트리밍·도구 사용 같은 핵심 기능이 어떤 순서로 쌓이는지 미리 본다.
  - 토큰 사용량과 비용을 추적하는 습관을 첫 시작부터 들여 실험이 부담 없이 늘어나도록 한다.
  - 첫 호출은 응답 텍스트와 사용량 필드를 assert로 확인해 이후 자동화가 같은 계약을 신뢰하게 만든다.
  - 모델 호출 결과를 기존 데이터 분석·자동화 흐름에 붙이는 그림을 잡는다.
  diagram:
    steps:
    - label: 1단계. SDK 준비와 API 키 확인
      detail: anthropic 패키지와 ANTHROPIC_API_KEY 환경변수를 로컬에 준비한다.
    - label: 2단계. 첫 호출과 응답 파싱
      detail: Messages API로 한 줄 호출을 만들고 응답 객체에서 텍스트를 꺼낸다.
    - label: 3단계. 대화·스트리밍·구조화·캐싱·도구 사용 확장
      detail: 핵심 기능을 한 번에 하나씩 붙이며 자동화에 가져갈 수 있는 형태로 익힌다.
    - label: 4단계. 데이터 분석 봇으로 종합
      detail: 도구·캐싱·구조화 출력을 묶어 실전 자동화 한 개를 끝까지 만든다.
    runtime:
    - label: LLM 통합 환경
      detail: anthropic SDK와 ANTHROPIC_API_KEY를 로컬 Python에서 실행할 수 있게 준비한다.
    - label: LLM통합소개 실행
      detail: 카테고리 전체 흐름을 한눈에 보고 강의를 시작한다.
    - label: LLM통합소개 완료
      detail: 다음 강의(첫 Claude 호출)에서 실제 호출 코드를 작성할 준비를 마친다.
sections:
- id: runtime_check
  title: SDK 실행 확인
  structuredPrimary: true
  subtitle: import와 클라이언트 클래스 확인
  goal: anthropic 패키지를 import하고 클라이언트 클래스를 확인해 첫 호출 전 로컬 Python 준비 상태를 고정한다.
  why: 모델 호출은 자격증명과 네트워크가 필요하므로, 소개 단계에서는 패키지 import와 객체 확인을 먼저 분리해야 합니다.
  explanation: 상단 라이브러리 패널이 anthropic 준비 상태를 확인하고, 이 셀은 실제 요청을 보내지 않고 SDK 객체와 배포 버전을 검증합니다.
  tips:
  - 이 셀은 API 키가 없어도 실행 가능한 준비 점검입니다.
  - 실제 호출은 다음 강의에서 환경변수와 응답 객체 검증까지 함께 다룹니다.
  snippet: |-
    import importlib.metadata as metadata
    import anthropic

    version = metadata.version("anthropic")
    clientClass = anthropic.Anthropic

    assert version
    assert clientClass.__name__ == "Anthropic"
    print(version)
  exercise:
    prompt: version과 clientClass 이름을 readiness dict에 담고, 두 값이 비어 있지 않은지 assert로 확인하세요.
    starterCode: |-
      import importlib.metadata as metadata
      import anthropic

      readiness = {
          "version": metadata.version("anthropic"),
          "client": anthropic.Anthropic.__name__,
      }

      assert readiness["version"]
      assert readiness["client"] == "Anthropic"
      print(readiness)
    solution: |-
      import importlib.metadata as metadata
      import anthropic

      readiness = {
          "version": metadata.version("anthropic"),
          "client": anthropic.Anthropic.__name__,
      }

      assert readiness["version"]
      assert readiness["client"] == "Anthropic"
      print(readiness)
    hints:
    - importlib.metadata.version은 설치된 배포 패키지 버전을 읽습니다.
    - anthropic.Anthropic은 실제 요청 전에도 참조할 수 있는 클라이언트 클래스입니다.
  check:
    type: noError
    noError: anthropic import, 버전 조회, 클라이언트 클래스 확인이 오류 없이 끝나야 합니다.
    resultCheck: 출력에 버전 또는 readiness dict가 보이고 두 assert가 통과해야 합니다.
- id: intro
  blocks:
  - type: mainHeader
    emoji: ✨
    title: Claude API로 LLM 통합 시작하기
    subtitle: 로컬 Python에서 대화·도구·캐싱·구조화 출력을 모두 다룬다
  - type: hero
    emoji: 🤖
    title: 대화에서 자동화까지 한 번에
    subtitle: Messages API 한 줄 호출에서 도구 사용 루프, 프롬프트 캐싱, JSON 강제까지
    points:
    - emoji: 💬
      title: 멀티턴 대화
    - emoji: 🌊
      title: 스트리밍 응답
    - emoji: 📦
      title: JSON 구조화 출력
    - emoji: 💾
      title: 프롬프트 캐싱
    - emoji: 🛠️
      title: 도구 사용
  goal: LLM 통합 트랙 전체 흐름을 본다.
  why: 각 강의가 무엇을 다루는지 미리 그리면 11개의 강의가 한 줄로 연결된다.
- id: why_llm
  blocks:
  - type: sectionHeader
    title: 🌟 왜 Claude API를 직접 다루나요?
    subtitle: 채팅 UI 너머의 자동화 가치
  - type: note
    style: info
    title: 채팅 UI는 시작일 뿐이다
    content: claude.ai 같은 채팅 UI는 대화 한 줄을 만드는 데 충분합니다. 하지만 같은 모델을 반복 호출하고, 코드 안에서 결과를 분석하고, 도구와 캐싱을 활용해 비용을
      줄이고, 자동화 파이프라인에 연결하려면 API를 직접 호출해야 합니다. 이 트랙은 Claude API를 Python 코드 흐름의 한 단계로 만드는 방법을 다룹니다.
  - type: featureCards
    cards:
    - emoji: ⚡
      title: 반복 자동화
      description: 같은 패턴을 수백 건에 적용
    - emoji: 🔗
      title: 코드 흐름 연결
      description: 분석·자동화 파이프라인 한 단계로 사용
    - emoji: 💰
      title: 비용 통제
      description: 토큰 추적과 캐싱으로 비용 가시화
    - emoji: 🧪
      title: 실험 반복
      description: 프롬프트·도구·모델을 실험으로 비교
- id: anthropic_sdk
  blocks:
  - type: sectionHeader
    title: 📦 anthropic SDK 선택 이유
    subtitle: Claude 공식 Python SDK
  - type: note
    style: info
    title: 공식 SDK의 가치
    content: anthropic 패키지는 Anthropic이 직접 관리하는 공식 Python SDK입니다. Messages API, 스트리밍, 도구 사용, 프롬프트 캐싱 같은
      기능을 표준 클래스로 노출하고, 응답 객체는 IDE 자동완성과 타입 검사를 받습니다. 외부 래퍼나 직접 HTTP 호출보다 코드가 짧고 안정적입니다.
  - type: featureCards
    cards:
    - emoji: ✅
      title: 공식 지원
      description: API 변경에 빠르게 대응
    - emoji: 🧱
      title: 일관된 객체 모델
      description: Message·ContentBlock·Usage 표준 타입
    - emoji: 🌊
      title: 스트리밍 내장
      description: with client.messages.stream(...) 컨텍스트
    - emoji: 🛠️
      title: 도구·캐싱 동등 지원
      description: 모든 기능을 같은 API 표면에서 호출
- id: model_choice
  blocks:
  - type: sectionHeader
    title: 🎯 기본 모델 선택 - claude-haiku-4-5
    subtitle: 학습과 자동화에 잘 맞는 모델
  - type: note
    style: info
    title: 왜 haiku를 기본으로 쓰나
    content: 이 트랙의 호출 예시는 claude-haiku-4-5를 기본 모델로 사용합니다. 학습 단계에서는 빠른 응답과 낮은 토큰 비용이 중요하고, haiku는 멀티턴
      대화·도구 사용·캐싱 같은 핵심 기능을 모두 지원합니다. 무거운 추론이 필요한 작업은 동일 코드에서 model 인자만 sonnet 또는 opus 계열로 바꾸면 됩니다.
  - type: compare
    left:
      title: claude-haiku-4-5
      subtitle: 학습·자동화 기본값
      icon: 🌱
      color: green
      items:
      - 빠른 응답 속도
      - 낮은 토큰 비용
      - 도구·캐싱·스트리밍 모두 지원
      - 반복 실험에 적합
      infoBox: 이 트랙의 모든 강의에서 기본 모델
    right:
      title: claude-sonnet-4-6 / opus 계열
      subtitle: 정밀한 추론이 필요할 때
      icon: 🚀
      color: violet
      items:
      - 더 깊은 추론과 긴 응답
      - 도구 체이닝 정확도 향상
      - 토큰 비용은 더 큼
      - 같은 코드에서 model 인자만 교체
      infoBox: 실전에서 결과 품질이 부족할 때 단계적으로 격상
- id: prerequisites
  blocks:
  - type: sectionHeader
    title: 🧰 준비물
    subtitle: 시작 전에 갖춰야 할 것
  - type: list
    style: check
    items:
    - Python 3.10 이상이 설치된 로컬 환경 (이 강의는 Codaro 로컬 Python에서 실행)
    - anthropic 패키지 (uv가 강의별 packages 메타로 자동 준비)
    - ANTHROPIC_API_KEY 환경변수 (console.anthropic.com에서 발급)
    - Python 함수와 예외 처리에 대한 기본 이해
  - type: note
    style: warning
    title: API 키 보안 원칙
    content: ANTHROPIC_API_KEY는 환경변수로만 다루세요. 코드에 직접 적거나 노트북 셀에 평문으로 출력하지 않습니다. 노트북 공유나 git 커밋 전에 키가 코드에
      섞이지 않았는지 확인하는 습관을 첫 강의부터 들입니다.
- id: projects_preview
  blocks:
  - type: sectionHeader
    title: 🗺️ 앞으로 배울 내용
    subtitle: 11개 강의로 LLM 통합 마스터하기
  - type: table
    headers:
    - 단계
    - 강의
    - 배울 내용
    - 실용 가치
    rows:
    - - 입문
      - 첫 Claude 호출
      - anthropic.Anthropic, messages.create, 응답 파싱
      - LLM 한 줄 호출의 표준 모양
    - - 입문
      - 시스템 프롬프트 역할 부여
      - system 인자, 어조·역할 지시
      - 응답 톤과 행동 제어
    - - 기초
      - 멀티턴 대화 만들기
      - messages 리스트로 user/assistant 교차
      - 대화형 도구의 기본 패턴
    - - 기초
      - 토큰과 비용 추적
      - usage.input_tokens / output_tokens, 비용 추정 함수
      - 실험 비용을 가시화
    - - 기초
      - 스트리밍 응답
      - messages.stream, 텍스트 청크 누적
      - 긴 응답을 실시간으로 보여주는 UI 기반
    - - 중급
      - JSON 구조화 출력
      - JSON 강제 프롬프트, json.loads + 재시도
      - 자동화에서 안전하게 받는 데이터
    - - 중급
      - 프롬프트 캐싱
      - cache_control, 시스템 프롬프트 캐시 적중률
      - 반복 호출 비용 절감
    - - 중급
      - Tool use 기초
      - tools 인자, tool_use → tool_result 루프
      - Claude가 코드 함수를 호출하게 만든다
    - - 심화
      - 멀티 도구 라우팅
      - 여러 도구 정의, 도구 선택 로직, 에러 처리
      - 도구 묶음으로 실제 업무를 처리
    - - 심화
      - 데이터 분석 봇 종합
      - CSV 로딩 도구 + 캐싱 + JSON 출력 합성
      - 실전 자동화 한 개를 끝까지 빌드
- id: codaro_alignment
  blocks:
  - type: sectionHeader
    title: 🌱 Codaro 정체성과의 연결
    subtitle: 채팅·에디터·자동화·커리큘럼에 LLM을 붙이는 토대
  - type: note
    style: tip
    title: 트랙의 자리
    content: Codaro는 코드가 인터페이스가 되는 자동화 스튜디오입니다. 이 트랙은 사용자가 자신의 자동화 흐름 안에서 LLM을 직접 호출하고, 결과를 코드의 한 단계로
      받아들이는 능력을 만듭니다. 채팅 표면 너머에서 모델을 도구처럼 다루는 감각을 키우는 것이 이 트랙의 목표입니다.
  - type: featureCards
    cards:
    - emoji: 💬
      title: 채팅 표면
      description: 모델 응답을 받고 멀티턴 흐름을 만든다
    - emoji: ✍️
      title: 에디터·노트북
      description: 셀 안에서 호출 결과를 데이터로 다룬다
    - emoji: 🛠️
      title: 자동화·태스크
      description: 도구 사용 루프로 함수를 묶는다
    - emoji: 📚
      title: 커리큘럼·학습
      description: 학습 결과를 LLM이 분석·요약·검증에 활용
- id: resources
  blocks:
  - type: sectionHeader
    title: 📚 참고 자료
    subtitle: 공식 문서와 추가 학습 경로
  - type: links
    items:
    - text: Anthropic API 문서 (Messages)
      url: https://docs.anthropic.com/en/api/messages
      icon: 🔗
    - text: Anthropic Python SDK GitHub
      url: https://github.com/anthropics/anthropic-sdk-python
      icon: 🔗
    - text: 프롬프트 엔지니어링 가이드
      url: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
      icon: 🔗
    - text: 도구 사용 가이드
      url: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
      icon: 🔗
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
    unseen: true
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
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
    explanation: requiresLocal이 true이면 tier는 local-required, 아니면 web-capable입니다. output이 tool-result면 automation surface로
      분류하세요.
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 00_llm_intro-concept-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 00_llm_intro-task-classifier-transfer
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