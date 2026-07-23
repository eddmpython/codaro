var e=`meta:
  id: 17_string
  title: string - 문자열 도구
  category: builtins
  tags:
  - string
  - 템플릿
  - 상수
  - 검증
  seo:
    title: 파이썬 string 모듈 완전 정복
    description: string 모듈의 상수, Template, Formatter를 배웁니다.
    keywords:
    - string
    - 문자열
    - Template
    - ascii
    - digits
    - 파이썬string
intro:
  emoji: 📝
  points:
  - 문자열 상수 활용
  - Template으로 간편한 치환
  - 커스텀 Formatter
  - 검증과 생성 패턴
  direction: string 문자열 도구에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - string 문자열 도구 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: string 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 문자열 상수 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 문자 검증 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: string 문자열 도구 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: string 문자열 도구 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: string 문자열 도구 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: string 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: string 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.
  explanation: |-
    string은 파이썬 표준 라이브러리입니다. 문자열 처리에 유용한 상수와 도구를 제공하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 섹션을 먼저 실행하면 아래 모든 예제에서 string 모듈을 사용할 수 있습니다.
  snippet: |-
    import secrets
    import string

    'string 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: string 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      import secrets
      import string

      'string 모듈이 정상적으로 로드되었습니다'
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: string 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: string 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: string_constants
  title: 문자열 상수
  structuredPrimary: true
  subtitle: ascii_letters, digits, punctuation
  goal: 문자열 상수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    string 모듈은 자주 사용하는 문자 집합을 미리 정의한 상수를 제공합니다. ascii_letters는 모든 영문자, digits는 숫자, punctuation은 특수문자를 포함합니다. 입력 검증, 랜덤 문자열 생성, 비밀번호 정책에 활용됩니다.

    이 상수들은 불변 문자열이므로 직접 수정할 수 없습니다. 필요하면 복사해서 사용하세요.
  snippet: |-
    allLetters = string.ascii_letters
    allLetters
  exercise:
    prompt: 문자열 상수 예제에서 \`allLetters\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      allLetters = string.ascii_letters
      allLetters
    hints:
    - 바꿀 지점은 \`allLetters = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`allLetters\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 문자열 상수에서 \`allLetters\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 문자열 상수 실행 뒤 \`allLetters\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: character_validation
  title: 문자 검증
  structuredPrimary: true
  subtitle: 입력 유효성 검사
  goal: 문자 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    string 상수를 활용하여 입력 문자열을 검증할 수 있습니다. 문자열이 특정 문자 집합으로만 구성되어 있는지 확인하거나, 허용되지 않은 문자가 포함되어 있는지 검사합니다. 사용자 입력 검증, 데이터 정제에 필수적입니다.

    보안이 중요한 경우 secrets 모듈로 비밀번호를 생성하세요. random은 예측 가능합니다.
  snippet: |-
    inputText = '12345'
    isOnlyDigits = all(c in string.digits for c in inputText)
    isOnlyDigits
  exercise:
    prompt: 문자 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      inputText = '12345'
      isOnlyDigits = all(c in string.digits for c in inputText)
      isOnlyDigits
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 문자 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 문자 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: template_strings
  title: 템플릿 문자열
  structuredPrimary: true
  subtitle: Template으로 치환
  goal: 템플릿 문자열에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    string.Template은 $변수명 형식의 간단한 문자열 템플릿을 제공합니다. substitute()로 값을 치환하고, safe_substitute()는 누락된 변수를 그대로 둡니다. 설정 파일, 이메일 템플릿, 보고서 생성에 유용합니다.

    f-string이나 format()보다 간단하지만 기능이 제한적입니다. 복잡한 포맷팅은 f-string을 사용하세요.
  snippet: |-
    greetTemplate = string.Template('Hello, $name!')
    greetMessage = greetTemplate.substitute(name='Alice')
    greetMessage
  exercise:
    prompt: 템플릿 문자열 예제에서 \`greetTemplate\`, \`greetMessage\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      greetTemplate = string.Template('Hello, $name!')
      greetMessage = greetTemplate.substitute(name='Alice')
      greetMessage
    hints:
    - 바꿀 지점은 \`greetTemplate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`greetTemplate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 템플릿 문자열에서 \`greetTemplate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 템플릿 문자열 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: formatter
  title: 커스텀 포매터
  structuredPrimary: true
  subtitle: Formatter 클래스
  goal: 커스텀 포매터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    string.Formatter는 format() 메서드의 동작을 커스터마이즈할 수 있습니다. vformat()으로 직접 포맷팅하고, parse()로 포맷 문자열을 분석합니다. 도메인 특화 포맷팅, 다국어 지원, 커스텀 변환에 활용됩니다.

    대부분의 경우 f-string이나 .format()이 더 편리합니다. Formatter는 고급 커스터마이징이 필요할 때만 사용하세요.
  snippet: |-
    formatter = string.Formatter()
    formattedText = formatter.vformat('{0}님의 점수: {1}', ('Alice', 95), {})
    formattedText
  exercise:
    prompt: 커스텀 포매터 예제에서 \`formatter\`, \`formattedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      formatter = string.Formatter()
      formattedText = formatter.vformat('{0}님의 점수: {1}', ('Alice', 95), {})
      formattedText
    hints:
    - 바꿀 지점은 \`formatter = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`formatter\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 커스텀 포매터에서 \`formatter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 커스텀 포매터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: utilities
  title: 유틸리티 함수
  structuredPrimary: true
  subtitle: capwords 등
  goal: 유틸리티 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    string 모듈은 문자열 처리 유틸리티 함수를 제공합니다. capwords()는 각 단어의 첫 글자를 대문자로 변환합니다. str 메서드와 유사하지만 미묘한 차이가 있어 특정 상황에서 유용합니다.

    str.title()과 비슷하지만 capwords()는 여러 공백을 하나로 정규화합니다.
  snippet: |-
    sentence = 'hello world from python'
    titleCased = string.capwords(sentence)
    titleCased
  exercise:
    prompt: 유틸리티 함수 예제에서 \`sentence\`, \`titleCased\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      sentence = 'hello world from python'
      titleCased = string.capwords(sentence)
      titleCased
    hints:
    - 바꿀 지점은 \`sentence = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`sentence\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 유틸리티 함수에서 \`sentence\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 유틸리티 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 검증, 생성, 템플릿
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    실무에서 자주 사용하는 string 모듈 활용 패턴을 살펴봅니다. 비밀번호 생성, 입력 검증, 이메일 템플릿, 식별자 생성 등 다양한 시나리오에서 string을 효과적으로 사용할 수 있습니다.

    보안이 중요한 비밀번호 생성은 secrets.choice()를 사용하세요.
  snippet: |-
    charset = string.ascii_letters + string.digits
    randomString = ''.join(secrets.choice(charset) for _ in range(8))
    randomString
  exercise:
    prompt: 실전 활용 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      charset = string.ascii_letters + string.digits
      randomString = ''.join(secrets.choice(charset) for _ in range(8))
      randomString
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실전 활용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실전 활용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '검증 루프: 초대 코드와 메시지 템플릿'
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증
  goal: '검증 루프: 초대 코드와 메시지 템플릿에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    string 모듈은 단순 상수 모음이 아니라 입력 검증, 안전한 코드 생성, 템플릿 누락 확인에 연결할 때 실무 가치가 커집니다. 여기서는 계정 초대 메시지를 만들면서 허용 문자, 누락 변수, 출력 형식을 검증합니다.

    실무 변주: 초대 코드 길이와 허용 문자 정책을 팀별로 다르게 두고, 템플릿 누락 변수 리포트를 운영 로그 형식으로 바꿔 보세요.
  snippet: |-
    safeAlphabet = ''.join(
        c for c in string.ascii_uppercase + string.digits
        if c not in {'0', 'O', '1', 'I'}
    )

    def makeInviteCode(length=10):
        assert length >= 6, '초대 코드는 최소 6자 이상이어야 합니다'
        return ''.join(secrets.choice(safeAlphabet) for _ in range(length))

    inviteCode = makeInviteCode()
    assert len(inviteCode) == 10
    assert all(c in safeAlphabet for c in inviteCode)
    inviteCode
  exercise:
    prompt: '검증 루프: 초대 코드와 메시지 템플릿 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      safeAlphabet = ''.join(
          c for c in string.ascii_uppercase + string.digits
          if c not in {'0', 'O', '1', 'I'}
      )

      def makeInviteCode(length=10):
          assert length >= 6, '초대 코드는 최소 6자 이상이어야 합니다'
          return ''.join(secrets.choice(safeAlphabet) for _ in range(length))

      inviteCode = makeInviteCode()
      assert len(inviteCode) == 10
      assert all(c in safeAlphabet for c in inviteCode)
      inviteCode
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 초대 코드와 메시지 템플릿의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 초대 코드와 메시지 템플릿 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: string 모듈 종합 복습
  structuredPrimary: true
  subtitle: 문자열 도구 마스터하기
  goal: string 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: string 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    letters = string.ascii_letters
    len(letters)
  exercise:
    prompt: string 모듈 종합 복습 예제에서 \`letters\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      letters = string.ascii_letters
      len(letters)
    hints:
    - 바꿀 지점은 \`letters = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`letters\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: string 모듈 종합 복습에서 \`letters\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: string 모듈 종합 복습 실행 뒤 \`letters\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 17_string-invite-template-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - string_constants
    - template_strings
    - workflow_validation
    title: 초대 코드 정책을 검증하고 메시지 만들기
    subtitle: string 상수와 Template 치환
    goal: 초대 record의 code를 안전한 alphabet으로 검증하고 Template으로 개인화 메시지를 만든다.
    why: string 모듈은 상수를 외우는 도구가 아니라, 허용 문자 정책과 템플릿 출력을 한 함수 안에서 검증할 때 학습 효과가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않는 record 목록과 template을 넘겨 정상 메시지와 실패 케이스를 함께 검증합니다.
    tips:
    - '\`0\`, \`O\`, \`1\`, \`I\`는 혼동을 줄이기 위해 허용하지 마세요.'
    - Template.substitute는 누락 값이 있으면 즉시 실패합니다.
    exercise:
      prompt: render_invite_messages(template_text, records)가 개인화 메시지 list를 반환하고 정책 밖 code는 ValueError로 막도록 완성하세요.
      starterCode: |-
        def render_invite_messages(template_text, records):
            raise NotImplementedError
      solution: |-
        import string

        SAFE_ALPHABET = "".join(
            char for char in string.ascii_uppercase + string.digits
            if char not in {"0", "O", "1", "I"}
        )

        def render_invite_messages(template_text, records):
            template = string.Template(template_text)
            messages = []
            for record in records:
                code = record["code"]
                if len(code) < 6 or any(char not in SAFE_ALPHABET for char in code):
                    raise ValueError("invite code does not match policy")
                messages.append(template.substitute(
                    name=record["name"],
                    team=record["team"],
                    code=code,
                ))
            return messages
      hints:
      - SAFE_ALPHABET을 먼저 만들고 code의 모든 글자가 포함되는지 확인하세요.
      - Template.substitute에는 name, team, code를 명시적으로 넘기세요.
    check:
      id: python.builtins.string.invite-template.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.string.invite.behavior.v1.fixture
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
        entry: render_invite_messages
        cases:
        - id: renders-valid-invites
          arguments:
          - value: Hi $name, join $team with code $code.
          - value:
            - name: Mina
              team: Ops
              code: AB23CD
            - name: Joon
              team: Data
              code: ZXCV99
          expectedReturn:
          - Hi Mina, join Ops with code AB23CD.
          - Hi Joon, join Data with code ZXCV99.
        - id: rejects-confusing-code
          arguments:
          - value: Hi $name, join $team with code $code.
          - value:
            - name: Sol
              team: QA
              code: A0BCD2
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 17_string-code-policy-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 17_string-invite-template-mastery
    - character_validation
    title: 초대 코드 묶음의 실패 이유 감사하기
    subtitle: 허용 문자와 길이 정책 분리
    goal: code 목록을 검사해 validCount, invalid reason, alphabetSize를 반환한다.
    why: 전이 과제에서는 메시지 생성 없이 정책 검사만 분리해, 같은 string 상수 지식을 배치 검증 도구로 옮깁니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 이번에는 record dict가 아니라 code 문자열 목록만 보고 실패 이유를 남기세요.
    tips:
    - 짧은 code와 허용되지 않은 문자를 각각 reason으로 남기세요.
    - invalid 문자는 중복 제거 후 정렬하면 검증이 안정됩니다.
    exercise:
      prompt: summarize_invite_codes(codes)가 validCount, invalid, alphabetSize를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_invite_codes(codes):
            raise NotImplementedError
      solution: |-
        import string

        SAFE_ALPHABET = "".join(
            char for char in string.ascii_uppercase + string.digits
            if char not in {"0", "O", "1", "I"}
        )

        def summarize_invite_codes(codes):
            valid = []
            invalid = []
            for code in codes:
                reasons = []
                if len(code) < 6:
                    reasons.append("short")
                bad_chars = sorted({char for char in code if char not in SAFE_ALPHABET})
                if bad_chars:
                    reasons.append("invalid:" + "".join(bad_chars))
                if reasons:
                    invalid.append(f"{code}:{'|'.join(reasons)}")
                else:
                    valid.append(code)
            return {
                "validCount": len(valid),
                "invalid": invalid,
                "alphabetSize": len(SAFE_ALPHABET),
            }
      hints:
      - '\`set\`으로 bad char 중복을 제거하고 sorted로 순서를 고정하세요.'
      - 유효 code와 invalid code를 따로 모으면 count와 reason을 동시에 만들기 쉽습니다.
    check:
      id: python.builtins.string.code-policy.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.string.invite.behavior.v1.fixture
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
        entry: summarize_invite_codes
        cases:
        - id: audits-code-policy
          arguments:
          - value:
            - ABCD23
            - A0CD23
            - AB12
            - ZXCV99
          expectedReturn:
            validCount: 2
            invalid:
            - A0CD23:invalid:0
            - AB12:short|invalid:1
            alphabetSize: 32
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 17_string-template-preview-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 17_string-code-policy-transfer
    title: 누락 placeholder를 남긴 채 템플릿 미리보기
    subtitle: safe_substitute와 Template pattern
    goal: Template.safe_substitute 결과와 누락 placeholder 목록을 함께 반환하고 invalid template은 거부한다.
    why: 시간이 지나도 Template에서 남아야 할 감각은 값을 치환하는 법뿐 아니라, 아직 채울 수 없는 변수를 화면에 안전하게 남기는 방법입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. substitute가 아니라 safe_substitute로 preview를 만들고 누락 field를 찾아내세요.
    tips:
    - Template.pattern에서 named 또는 braced group을 읽어 placeholder 이름을 얻을 수 있습니다.
    - missing 목록은 템플릿 등장 순서를 유지하세요.
    exercise:
      prompt: preview_template(template_text, values)가 rendered와 missing을 담은 dict를 반환하고 invalid placeholder는 ValueError로 막도록
        완성하세요.
      starterCode: |-
        def preview_template(template_text, values):
            raise NotImplementedError
      solution: |-
        import string

        def preview_template(template_text, values):
            template = string.Template(template_text)
            rendered = template.safe_substitute(values)
            missing = []
            for match in template.pattern.finditer(template_text):
                if match.group("invalid") is not None:
                    raise ValueError("invalid template placeholder")
                name = match.group("named") or match.group("braced")
                if name and name not in values and name not in missing:
                    missing.append(name)
            return {"rendered": rendered, "missing": missing}
      hints:
      - safe_substitute는 누락 값을 \`$name\` 형태로 남겨 preview에 쓸 수 있습니다.
      - missing에 같은 placeholder가 두 번 들어가지 않게 확인하세요.
    check:
      id: python.builtins.string.template-preview.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.string.invite.behavior.v1.fixture
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
        entry: preview_template
        cases:
        - id: previews-missing-code
          arguments:
          - value: Hello $name, use $code for \${team}.
          - value:
              name: Mina
              team: Ops
          expectedReturn:
            rendered: Hello Mina, use $code for Ops.
            missing:
            - code
        - id: rejects-invalid-template
          arguments:
          - value: Hello $
          - value:
              name: Mina
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