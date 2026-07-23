var e=`meta:
  id: 18_textwrap
  title: textwrap - 텍스트 래핑과 포맷팅
  category: builtins
  tags:
  - textwrap
  - wrap
  - fill
  - dedent
  - indent
  - shorten
  description: 텍스트 래핑, 들여쓰기, 축약 등 텍스트 포맷팅 기능을 제공하는 textwrap 모듈
  keywords:
  - textwrap
  - wrap
  - fill
  - dedent
  - indent
  - shorten
intro:
  direction: textwrap 텍스트 래핑과 포맷팅에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - textwrap 텍스트 래핑과 포맷팅 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: textwrap 모듈 임포트 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 기본 텍스트 래핑 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 들여쓰기 제거 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: textwrap 텍스트 래핑과 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: textwrap 텍스트 래핑과 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: textwrap 텍스트 래핑과 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- title: ⚠️ textwrap 모듈 임포트
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: ⚠️ textwrap 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    표준 라이브러리 임포트
    textwrap는 Python 표준 라이브러리이므로 별도 설치 없이 사용할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import textwrap
  exercise:
    prompt: ⚠️ textwrap 모듈 임포트 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import textwrap
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: ⚠️ textwrap 모듈 임포트의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: ⚠️ textwrap 모듈 임포트 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
  name: module_import
- title: 기본 텍스트 래핑
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 기본 텍스트 래핑에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    wrap()과 fill() 함수
    wrap()는 텍스트를 리스트로 반환하고, fill()은 하나의 문자열로 반환합니다.

    wrap() 반환값
    wrap()는 각 줄을 요소로 하는 리스트를 반환합니다.
  tips:
  - wrap() 반환값 wrap()는 각 줄을 요소로 하는 리스트를 반환합니다.
  snippet: |-
    longText = "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation."
    wrappedLines = textwrap.wrap(longText, width=40)
    wrappedLines
  exercise:
    prompt: 기본 텍스트 래핑 예제에서 \`longText\`, \`wrappedLines\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      longText = "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation."
      wrappedLines = textwrap.wrap(longText, width=40)
      wrappedLines
    hints:
    - 바꿀 지점은 \`longText = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`longText\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 기본 텍스트 래핑에서 \`longText\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 기본 텍스트 래핑 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: basic_wrapping
- title: 들여쓰기 제거
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 들여쓰기 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    dedent() 함수
    dedent()는 모든 줄에서 공통 선행 공백을 제거합니다. 주로 함수 내 docstring이나 여러 줄 문자열에서 사용됩니다.

    dedent 사용 시기
    코드 내에서 여러 줄 문자열을 깔끔하게 작성할 때 유용합니다.
  tips:
  - dedent 사용 시기 코드 내에서 여러 줄 문자열을 깔끔하게 작성할 때 유용합니다.
  snippet: |-
    indentedText = """
        Hello World
        This is indented
        All lines have common spacing
    """
    dedentedText = textwrap.dedent(indentedText)
    dedentedText
  exercise:
    prompt: 들여쓰기 제거 예제에서 \`indentedText\`, \`dedentedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      indentedText = """
          Hello World
          This is indented
          All lines have common spacing
      """
      dedentedText = textwrap.dedent(indentedText)
      dedentedText
    hints:
    - 바꿀 지점은 \`indentedText = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`indentedText\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 들여쓰기 제거에서 \`indentedText\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 들여쓰기 제거 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: text_dedenting
- title: 들여쓰기 추가
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 들여쓰기 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    indent() 함수
    indent()는 각 줄의 시작 부분에 지정된 문자열을 추가합니다.

    prefix 문자열
    공백뿐만 아니라 다른 문자열도 prefix로 사용할 수 있습니다.
  tips:
  - prefix 문자열 공백뿐만 아니라 다른 문자열도 prefix로 사용할 수 있습니다.
  snippet: |-
    text = "Line 1\\nLine 2\\nLine 3"
    indentedText = textwrap.indent(text, "    ")
    indentedText
  exercise:
    prompt: 들여쓰기 추가 예제에서 \`text\`, \`indentedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      text = "Line 1\\nLine 2\\nLine 3"
      indentedText = textwrap.indent(text, "    ")
      indentedText
    hints:
    - 바꿀 지점은 \`text = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 들여쓰기 추가에서 \`text\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 들여쓰기 추가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: text_indenting
- title: 텍스트 축약
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 텍스트 축약에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    shorten() 함수
    shorten()은 텍스트를 지정된 너비로 축약하고 말줄임표를 추가합니다.

    placeholder
    기본 placeholder는 '[...]'이며, 변경할 수 있습니다.
  tips:
  - placeholder 기본 placeholder는 '[...]'이며, 변경할 수 있습니다.
  snippet: |-
    longText = "This is a very long text that needs to be shortened for display purposes."
    shortText = textwrap.shorten(longText, width=30)
    shortText
  exercise:
    prompt: 텍스트 축약 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      longText = "This is a very long text that needs to be shortened for display purposes."
      shortText = textwrap.shorten(longText, width=30)
      shortText
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 텍스트 축약의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 텍스트 축약 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
  name: text_shortening
- title: TextWrapper 클래스
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: TextWrapper 클래스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    고급 래핑 제어
    TextWrapper 클래스를 사용하면 래핑 동작을 세밀하게 제어할 수 있습니다.

    initial_indent vs subsequent_indent
    initial_indent는 첫 줄에만, subsequent_indent는 나머지 줄에 적용됩니다.
  tips:
  - initial_indent vs subsequent_indent initial_indent는 첫 줄에만, subsequent_indent는 나머지 줄에 적용됩니다.
  snippet: |-
    wrapper = textwrap.TextWrapper(width=40)
    text = "Python is a high-level programming language. It emphasizes code readability."
    wrappedText = wrapper.fill(text)
    wrappedText
  exercise:
    prompt: TextWrapper 클래스 예제에서 \`wrapper\`, \`text\`, \`wrappedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      wrapper = textwrap.TextWrapper(width=40)
      text = "Python is a high-level programming language. It emphasizes code readability."
      wrappedText = wrapper.fill(text)
      wrappedText
    hints:
    - 바꿀 지점은 \`wrapper = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`wrapper\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: TextWrapper 클래스에서 \`wrapper\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: TextWrapper 클래스 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: textwrapper_class
- title: 실전 활용 예제
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: textwrap.TextWrapper로 CLI 도움말 메시지를 너비 70자로 정렬해 한 함수에서 들여쓰기와 줄바꿈 정책을 통일합니다.
  why: 운영 도구의 help 출력은 터미널 너비가 들쭉날쭉해 가독성이 깨지기 쉽습니다. textwrap는 width/indent/subsequent_indent를 한 객체로 묶어 일관된 포맷을 보장합니다.
  explanation: |-
    실무 시나리오
    textwrap를 활용한 실전 텍스트 포맷팅 예제를 다룹니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def formatHelpMessage(command, description, width=70):
        wrapper = textwrap.TextWrapper(
            width=width,
            initial_indent=f"  {command:<15} ",
            subsequent_indent=" " * 17
        )
        return wrapper.fill(description)

    commands = [
        ("start", "Start the application server with default configuration"),
        ("stop", "Stop the running application server gracefully"),
        ("restart", "Restart the application server by stopping and starting it again")
    ]

    helpText = "\\n".join([
        formatHelpMessage(cmd, desc)
        for cmd, desc in commands
    ])

    helpText
  exercise:
    prompt: 실전 활용 예제에서 명령 설명이나 width 값을 바꾸고 CLI 도움말 줄바꿈과 들여쓰기가 달라지는지 확인하세요.
    starterCode: |-
      def formatHelpMessage(command, description, width=70):
          wrapper = textwrap.TextWrapper(
              width=width,
              initial_indent=f"  {command:<15} ",
              subsequent_indent=" " * 17
          )
          return wrapper.fill(description)

      commands = [
          ("start", "Start the application server with default configuration"),
          ("stop", "Stop the running application server gracefully"),
          ("restart", "Restart the application server by stopping and starting it again")
      ]

      helpText = "\\n".join([
          formatHelpMessage(cmd, desc)
          for cmd, desc in commands
      ])

      helpText
    hints:
    - 바꿀 지점은 \`commands\`의 설명 문자열, \`width\`, \`initial_indent\`, \`subsequent_indent\`입니다.
    - 실행 뒤 \`helpText\`의 줄 길이와 들여쓰기 정렬이 바꾼 포맷 정책을 반영하는지 보세요.
  check:
    type: noError
    noError: 실전 활용 예제의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 실전 활용 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
  name: practical
- title: '검증 루프: CLI 출력 품질 게이트'
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: '검증 루프: CLI 출력 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    출력 품질을 테스트하는 흐름
    textwrap는 보기 좋은 출력만 만드는 도구가 아닙니다. 터미널 폭을 넘지 않는지, 들여쓰기가 깨지지 않는지, 너무 긴 설명을 안전하게 줄이는지 검증하면 실제 CLI/리포트 출력 품질을 안정화할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def renderCliHelp(commands, width=56):
        assert width >= 36, "도움말 폭은 최소 36 이상이어야 합니다"
        rows = []
        for command, description in commands:
            wrapper = textwrap.TextWrapper(
                width=width,
                initial_indent=f"  {command:<12} ",
                subsequent_indent=" " * 14
            )
            rows.append(wrapper.fill(description))
        return "\\n".join(rows)

    cliCommands = [
        ("run", "Execute the selected curriculum lesson in the local Python runtime"),
        ("verify", "Run validation checks and show actionable feedback"),
        ("export", "Create a formatted report for the current learning session")
    ]
    helpOutput = renderCliHelp(cliCommands)
    assert all(len(line) <= 56 for line in helpOutput.splitlines())
    helpOutput
  exercise:
    prompt: '검증 루프: CLI 출력 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      def renderCliHelp(commands, width=56):
          assert width >= 36, "도움말 폭은 최소 36 이상이어야 합니다"
          rows = []
          for command, description in commands:
              wrapper = textwrap.TextWrapper(
                  width=width,
                  initial_indent=f"  {command:<12} ",
                  subsequent_indent=" " * 14
              )
              rows.append(wrapper.fill(description))
          return "\\n".join(rows)

      cliCommands = [
          ("run", "Execute the selected curriculum lesson in the local Python runtime"),
          ("verify", "Run validation checks and show actionable feedback"),
          ("export", "Create a formatted report for the current learning session")
      ]
      helpOutput = renderCliHelp(cliCommands)
      assert all(len(line) <= 56 for line in helpOutput.splitlines())
      helpOutput
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: CLI 출력 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: CLI 출력 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
  name: workflow_validation
- title: 연습 문제
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 연습 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 연습 문제의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text = "Python textwrap module provides convenient functions for formatting text."
    result = textwrap.fill(text, width=30)
    result
  exercise:
    prompt: 연습 문제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      text = "Python textwrap module provides convenient functions for formatting text."
      result = textwrap.fill(text, width=30)
      result
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 연습 문제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 연습 문제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
  name: practice
assessment:
  masteryVariants:
  - id: 18_textwrap-cli-help-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - basic_wrapping
    - textwrapper_class
    - workflow_validation
    title: CLI 도움말을 줄 폭 안에 맞춰 렌더링하기
    subtitle: TextWrapper와 들여쓰기 정책
    goal: command와 description 목록을 정해진 width 안에 맞춰 줄바꿈하고 줄 수, 최대 줄 길이, command 수를 반환한다.
    why: textwrap 학습은 보기 좋은 문자열을 만드는 데서 끝나지 않고, 터미널 폭을 넘지 않는 운영 출력 계약을 코드로 보장할 때 의미가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않는 command 목록을 넘겨 줄 길이와 실패 조건을 함께 검증합니다.
    tips:
    - TextWrapper의 initial_indent와 subsequent_indent를 분리하세요.
    - width가 너무 좁으면 ValueError로 막아야 합니다.
    exercise:
      prompt: render_cli_help(commands, width=56)가 text, lineCount, maxLineLength, commandCount를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def render_cli_help(commands, width=56):
            raise NotImplementedError
      solution: |-
        import textwrap

        def render_cli_help(commands, width=56):
            if width < 36:
                raise ValueError("width must be at least 36")
            rows = []
            for command, description in commands:
                wrapper = textwrap.TextWrapper(
                    width=width,
                    initial_indent=f"  {command:<12} ",
                    subsequent_indent=" " * 14,
                )
                rows.append(wrapper.fill(description))
            output = "\\n".join(rows)
            lines = output.splitlines()
            if any(len(line) > width for line in lines):
                raise ValueError("rendered line exceeded width")
            return {
                "text": output,
                "lineCount": len(lines),
                "maxLineLength": max((len(line) for line in lines), default=0),
                "commandCount": len(commands),
            }
      hints:
      - 줄 길이 검사는 렌더링 뒤 splitlines로 확인하세요.
      - maxLineLength는 비어 있는 입력도 안전하게 처리하세요.
    check:
      id: python.builtins.textwrap.cli-help.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.textwrap.formatting.behavior.v1.fixture
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
        entry: render_cli_help
        cases:
        - id: renders-help-within-width
          arguments:
          - value:
            - - run
              - Execute the selected curriculum lesson in the local Python runtime
            - - verify
              - Run validation checks and show actionable feedback
            - - export
              - Create a formatted report for the current learning session
          - value: 56
          expectedReturn:
            text: |2-
                run          Execute the selected curriculum lesson in
                            the local Python runtime
                verify       Run validation checks and show actionable
                            feedback
                export       Create a formatted report for the current
                            learning session
            lineCount: 6
            maxLineLength: 56
            commandCount: 3
        - id: rejects-too-narrow-width
          arguments:
          - value:
            - - x
              - short
          - value: 20
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 18_textwrap-status-digest-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 18_textwrap-cli-help-mastery
    - text_shortening
    - text_indenting
    title: 운영 상태 요약을 bullet digest로 포맷하기
    subtitle: shorten, wrap, hanging indent
    goal: 긴 제목과 update 목록을 폭 제한 안에 맞춰 제목과 bullet 문자열로 렌더링한다.
    why: 전이 과제에서는 CLI command 표가 아니라 운영 요약 digest로 옮겨, 같은 줄바꿈 감각을 보고서 텍스트에 적용합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 제목은 shorten으로 줄이고, 각 update는 bullet과 hanging indent를 유지하세요.
    tips:
    - 제목은 공백을 정규화한 뒤 textwrap.shorten으로 줄이세요.
    - bullet 첫 줄은 \`  - \`, 이어지는 줄은 네 칸 들여쓰기를 쓰세요.
    exercise:
      prompt: format_status_digest(title, updates, width=48)가 text, lineCount, maxLineLength, bulletCount를 담은 dict를 반환하도록
        완성하세요.
      starterCode: |-
        def format_status_digest(title, updates, width=48):
            raise NotImplementedError
      solution: |-
        import textwrap

        def format_status_digest(title, updates, width=48):
            if width < 30:
                raise ValueError("width must be at least 30")
            normalized_title = textwrap.shorten(" ".join(title.split()), width=width, placeholder="...")
            lines = [normalized_title]
            for update in updates:
                text = " ".join(str(update).split())
                wrapped = textwrap.wrap(text, width=width - 4)
                if not wrapped:
                    lines.append("  -")
                else:
                    lines.append("  - " + wrapped[0])
                    lines.extend("    " + line for line in wrapped[1:])
            rendered = "\\n".join(lines)
            return {
                "text": rendered,
                "lineCount": len(lines),
                "maxLineLength": max((len(line) for line in lines), default=0),
                "bulletCount": len(updates),
            }
      hints:
      - wrap width는 bullet prefix 길이를 고려해 \`width - 4\`로 잡으세요.
      - 공백이 여러 개인 입력은 split과 join으로 먼저 정리하세요.
    check:
      id: python.builtins.textwrap.status-digest.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.textwrap.formatting.behavior.v1.fixture
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
        entry: format_status_digest
        cases:
        - id: formats-status-digest
          arguments:
          - value: Weekly automation rollout status for operations team
          - value:
            - Imported 128 files and skipped 3 duplicates after checksum review
            - Next run should alert only on failed archive writes
          - value: 48
          expectedReturn:
            text: |-
              Weekly automation rollout status for...
                - Imported 128 files and skipped 3 duplicates
                  after checksum review
                - Next run should alert only on failed archive
                  writes
            lineCount: 5
            maxLineLength: 48
            bulletCount: 2
        - id: rejects-narrow-digest-width
          arguments:
          - value: x
          - value:
            - y
          - value: 20
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 18_textwrap-note-block-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 18_textwrap-status-digest-transfer
    title: 들여쓰기 섞인 노트 블록을 다시 읽기 좋게 복원하기
    subtitle: dedent, fill, paragraph gap
    goal: 들여쓰기된 여러 문단 문자열을 dedent하고 문단별로 wrap해 paragraph count와 최대 줄 길이를 반환한다.
    why: 시간이 지나도 textwrap에서 남아야 할 감각은 wrap 호출 하나가 아니라, 원본 들여쓰기와 문단 경계를 보존하며 읽기 폭을 다시 세우는 능력입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. raw note block을 dedent한 뒤 문단별로 fill하고 빈 줄을 유지하세요.
    tips:
    - dedent 후 strip으로 바깥 공백을 제거하세요.
    - 문단은 빈 줄 기준으로 나누고, 각 문단 내부 공백은 정규화하세요.
    exercise:
      prompt: restore_note_block(raw_text, width=42)가 text, paragraphCount, maxLineLength를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def restore_note_block(raw_text, width=42):
            raise NotImplementedError
      solution: |-
        import textwrap

        def restore_note_block(raw_text, width=42):
            if width < 24:
                raise ValueError("width must be at least 24")
            cleaned = textwrap.dedent(raw_text).strip()
            paragraphs = [part.strip() for part in cleaned.split("\\n\\n") if part.strip()]
            rendered = []
            for paragraph in paragraphs:
                rendered.append(textwrap.fill(
                    " ".join(paragraph.split()),
                    width=width,
                    subsequent_indent="  ",
                ))
            text = "\\n\\n".join(rendered)
            return {
                "text": text,
                "paragraphCount": len(paragraphs),
                "maxLineLength": max((len(line) for line in text.splitlines()), default=0),
            }
      hints:
      - textwrap.dedent는 여러 줄 문자열의 공통 들여쓰기를 제거합니다.
      - paragraph 내부 줄바꿈은 공백 하나로 정규화한 뒤 fill하세요.
    check:
      id: python.builtins.textwrap.note-block.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.textwrap.formatting.behavior.v1.fixture
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
        entry: restore_note_block
        cases:
        - id: restores-indented-note-block
          arguments:
          - value: |-
              Codaro records every verified run before it changes mastery.
              A short retry should explain the failed evidence instead of hiding it.

              Retrieval work opens later so the learner proves the idea again.
          - value: 42
          expectedReturn:
            text: |-
              Codaro records every verified run before
                it changes mastery. A short retry should
                explain the failed evidence instead of
                hiding it.

              Retrieval work opens later so the learner
                proves the idea again.
            paragraphCount: 2
            maxLineLength: 42
        - id: rejects-narrow-note-width
          arguments:
          - value: text
          - value: 10
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