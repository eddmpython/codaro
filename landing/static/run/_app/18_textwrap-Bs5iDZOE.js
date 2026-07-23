var e=`meta:\r
  id: 18_textwrap\r
  title: textwrap - 텍스트 래핑과 포맷팅\r
  category: builtins\r
  tags:\r
  - textwrap\r
  - wrap\r
  - fill\r
  - dedent\r
  - indent\r
  - shorten\r
  description: 텍스트 래핑, 들여쓰기, 축약 등 텍스트 포맷팅 기능을 제공하는 textwrap 모듈\r
  keywords:\r
  - textwrap\r
  - wrap\r
  - fill\r
  - dedent\r
  - indent\r
  - shorten\r
intro:\r
  direction: textwrap 텍스트 래핑과 포맷팅에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - textwrap 텍스트 래핑과 포맷팅 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: textwrap 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 텍스트 래핑 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 들여쓰기 제거 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: textwrap 텍스트 래핑과 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: textwrap 텍스트 래핑과 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: textwrap 텍스트 래핑과 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- title: ⚠️ textwrap 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: ⚠️ textwrap 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    표준 라이브러리 임포트\r
    textwrap는 Python 표준 라이브러리이므로 별도 설치 없이 사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import textwrap\r
  exercise:\r
    prompt: ⚠️ textwrap 모듈 임포트 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import textwrap\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: ⚠️ textwrap 모듈 임포트의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: ⚠️ textwrap 모듈 임포트 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
  name: module_import\r
- title: 기본 텍스트 래핑\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 기본 텍스트 래핑에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    wrap()과 fill() 함수\r
    wrap()는 텍스트를 리스트로 반환하고, fill()은 하나의 문자열로 반환합니다.\r
\r
    wrap() 반환값\r
    wrap()는 각 줄을 요소로 하는 리스트를 반환합니다.\r
  tips:\r
  - wrap() 반환값 wrap()는 각 줄을 요소로 하는 리스트를 반환합니다.\r
  snippet: |-\r
    longText = "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation."\r
    wrappedLines = textwrap.wrap(longText, width=40)\r
    wrappedLines\r
  exercise:\r
    prompt: 기본 텍스트 래핑 예제에서 \`longText\`, \`wrappedLines\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      longText = "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation."\r
      wrappedLines = textwrap.wrap(longText, width=40)\r
      wrappedLines\r
    hints:\r
    - 바꿀 지점은 \`longText = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`longText\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 텍스트 래핑에서 \`longText\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 텍스트 래핑 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: basic_wrapping\r
- title: 들여쓰기 제거\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 들여쓰기 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    dedent() 함수\r
    dedent()는 모든 줄에서 공통 선행 공백을 제거합니다. 주로 함수 내 docstring이나 여러 줄 문자열에서 사용됩니다.\r
\r
    dedent 사용 시기\r
    코드 내에서 여러 줄 문자열을 깔끔하게 작성할 때 유용합니다.\r
  tips:\r
  - dedent 사용 시기 코드 내에서 여러 줄 문자열을 깔끔하게 작성할 때 유용합니다.\r
  snippet: |-\r
    indentedText = """\r
        Hello World\r
        This is indented\r
        All lines have common spacing\r
    """\r
    dedentedText = textwrap.dedent(indentedText)\r
    dedentedText\r
  exercise:\r
    prompt: 들여쓰기 제거 예제에서 \`indentedText\`, \`dedentedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      indentedText = """\r
          Hello World\r
          This is indented\r
          All lines have common spacing\r
      """\r
      dedentedText = textwrap.dedent(indentedText)\r
      dedentedText\r
    hints:\r
    - 바꿀 지점은 \`indentedText = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`indentedText\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 들여쓰기 제거에서 \`indentedText\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 들여쓰기 제거 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: text_dedenting\r
- title: 들여쓰기 추가\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 들여쓰기 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    indent() 함수\r
    indent()는 각 줄의 시작 부분에 지정된 문자열을 추가합니다.\r
\r
    prefix 문자열\r
    공백뿐만 아니라 다른 문자열도 prefix로 사용할 수 있습니다.\r
  tips:\r
  - prefix 문자열 공백뿐만 아니라 다른 문자열도 prefix로 사용할 수 있습니다.\r
  snippet: |-\r
    text = "Line 1\\nLine 2\\nLine 3"\r
    indentedText = textwrap.indent(text, "    ")\r
    indentedText\r
  exercise:\r
    prompt: 들여쓰기 추가 예제에서 \`text\`, \`indentedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      text = "Line 1\\nLine 2\\nLine 3"\r
      indentedText = textwrap.indent(text, "    ")\r
      indentedText\r
    hints:\r
    - 바꿀 지점은 \`text = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 들여쓰기 추가에서 \`text\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 들여쓰기 추가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: text_indenting\r
- title: 텍스트 축약\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 텍스트 축약에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    shorten() 함수\r
    shorten()은 텍스트를 지정된 너비로 축약하고 말줄임표를 추가합니다.\r
\r
    placeholder\r
    기본 placeholder는 '[...]'이며, 변경할 수 있습니다.\r
  tips:\r
  - placeholder 기본 placeholder는 '[...]'이며, 변경할 수 있습니다.\r
  snippet: |-\r
    longText = "This is a very long text that needs to be shortened for display purposes."\r
    shortText = textwrap.shorten(longText, width=30)\r
    shortText\r
  exercise:\r
    prompt: 텍스트 축약 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      longText = "This is a very long text that needs to be shortened for display purposes."\r
      shortText = textwrap.shorten(longText, width=30)\r
      shortText\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 텍스트 축약의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 텍스트 축약 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
  name: text_shortening\r
- title: TextWrapper 클래스\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: TextWrapper 클래스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    고급 래핑 제어\r
    TextWrapper 클래스를 사용하면 래핑 동작을 세밀하게 제어할 수 있습니다.\r
\r
    initial_indent vs subsequent_indent\r
    initial_indent는 첫 줄에만, subsequent_indent는 나머지 줄에 적용됩니다.\r
  tips:\r
  - initial_indent vs subsequent_indent initial_indent는 첫 줄에만, subsequent_indent는 나머지 줄에 적용됩니다.\r
  snippet: |-\r
    wrapper = textwrap.TextWrapper(width=40)\r
    text = "Python is a high-level programming language. It emphasizes code readability."\r
    wrappedText = wrapper.fill(text)\r
    wrappedText\r
  exercise:\r
    prompt: TextWrapper 클래스 예제에서 \`wrapper\`, \`text\`, \`wrappedText\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      wrapper = textwrap.TextWrapper(width=40)\r
      text = "Python is a high-level programming language. It emphasizes code readability."\r
      wrappedText = wrapper.fill(text)\r
      wrappedText\r
    hints:\r
    - 바꿀 지점은 \`wrapper = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`wrapper\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: TextWrapper 클래스에서 \`wrapper\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: TextWrapper 클래스 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
  name: textwrapper_class\r
- title: 실전 활용 예제\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: textwrap.TextWrapper로 CLI 도움말 메시지를 너비 70자로 정렬해 한 함수에서 들여쓰기와 줄바꿈 정책을 통일합니다.\r
  why: 운영 도구의 help 출력은 터미널 너비가 들쭉날쭉해 가독성이 깨지기 쉽습니다. textwrap는 width/indent/subsequent_indent를 한 객체로 묶어 일관된 포맷을 보장합니다.\r
  explanation: |-\r
    실무 시나리오\r
    textwrap를 활용한 실전 텍스트 포맷팅 예제를 다룹니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def formatHelpMessage(command, description, width=70):\r
        wrapper = textwrap.TextWrapper(\r
            width=width,\r
            initial_indent=f"  {command:<15} ",\r
            subsequent_indent=" " * 17\r
        )\r
        return wrapper.fill(description)\r
\r
    commands = [\r
        ("start", "Start the application server with default configuration"),\r
        ("stop", "Stop the running application server gracefully"),\r
        ("restart", "Restart the application server by stopping and starting it again")\r
    ]\r
\r
    helpText = "\\n".join([\r
        formatHelpMessage(cmd, desc)\r
        for cmd, desc in commands\r
    ])\r
\r
    helpText\r
  exercise:\r
    prompt: 실전 활용 예제에서 명령 설명이나 width 값을 바꾸고 CLI 도움말 줄바꿈과 들여쓰기가 달라지는지 확인하세요.
    starterCode: |-\r
      def formatHelpMessage(command, description, width=70):\r
          wrapper = textwrap.TextWrapper(\r
              width=width,\r
              initial_indent=f"  {command:<15} ",\r
              subsequent_indent=" " * 17\r
          )\r
          return wrapper.fill(description)\r
\r
      commands = [\r
          ("start", "Start the application server with default configuration"),\r
          ("stop", "Stop the running application server gracefully"),\r
          ("restart", "Restart the application server by stopping and starting it again")\r
      ]\r
\r
      helpText = "\\n".join([\r
          formatHelpMessage(cmd, desc)\r
          for cmd, desc in commands\r
      ])\r
\r
      helpText\r
    hints:\r
    - 바꿀 지점은 \`commands\`의 설명 문자열, \`width\`, \`initial_indent\`, \`subsequent_indent\`입니다.
    - 실행 뒤 \`helpText\`의 줄 길이와 들여쓰기 정렬이 바꾼 포맷 정책을 반영하는지 보세요.
  check:\r
    type: noError\r
    noError: 실전 활용 예제의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 실전 활용 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
  name: practical\r
- title: '검증 루프: CLI 출력 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: '검증 루프: CLI 출력 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    출력 품질을 테스트하는 흐름\r
    textwrap는 보기 좋은 출력만 만드는 도구가 아닙니다. 터미널 폭을 넘지 않는지, 들여쓰기가 깨지지 않는지, 너무 긴 설명을 안전하게 줄이는지 검증하면 실제 CLI/리포트 출력 품질을 안정화할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def renderCliHelp(commands, width=56):\r
        assert width >= 36, "도움말 폭은 최소 36 이상이어야 합니다"\r
        rows = []\r
        for command, description in commands:\r
            wrapper = textwrap.TextWrapper(\r
                width=width,\r
                initial_indent=f"  {command:<12} ",\r
                subsequent_indent=" " * 14\r
            )\r
            rows.append(wrapper.fill(description))\r
        return "\\n".join(rows)\r
\r
    cliCommands = [\r
        ("run", "Execute the selected curriculum lesson in the local Python runtime"),\r
        ("verify", "Run validation checks and show actionable feedback"),\r
        ("export", "Create a formatted report for the current learning session")\r
    ]\r
    helpOutput = renderCliHelp(cliCommands)\r
    assert all(len(line) <= 56 for line in helpOutput.splitlines())\r
    helpOutput\r
  exercise:\r
    prompt: '검증 루프: CLI 출력 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      def renderCliHelp(commands, width=56):\r
          assert width >= 36, "도움말 폭은 최소 36 이상이어야 합니다"\r
          rows = []\r
          for command, description in commands:\r
              wrapper = textwrap.TextWrapper(\r
                  width=width,\r
                  initial_indent=f"  {command:<12} ",\r
                  subsequent_indent=" " * 14\r
              )\r
              rows.append(wrapper.fill(description))\r
          return "\\n".join(rows)\r
\r
      cliCommands = [\r
          ("run", "Execute the selected curriculum lesson in the local Python runtime"),\r
          ("verify", "Run validation checks and show actionable feedback"),\r
          ("export", "Create a formatted report for the current learning session")\r
      ]\r
      helpOutput = renderCliHelp(cliCommands)\r
      assert all(len(line) <= 56 for line in helpOutput.splitlines())\r
      helpOutput\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: CLI 출력 품질 게이트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: CLI 출력 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
  name: workflow_validation\r
- title: 연습 문제\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 연습 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 연습 문제의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    text = "Python textwrap module provides convenient functions for formatting text."\r
    result = textwrap.fill(text, width=30)\r
    result\r
  exercise:\r
    prompt: 연습 문제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      text = "Python textwrap module provides convenient functions for formatting text."\r
      result = textwrap.fill(text, width=30)\r
      result\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:
    type: noError
    noError: 연습 문제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 연습 문제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
  name: practice
assessment:
  masteryVariants:
  - id: 18_textwrap-cli-help-mastery
    mode: mastery
    unseen: false
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
            text: "  run          Execute the selected curriculum lesson in\\n              the local Python runtime\\n  verify       Run validation checks and show actionable\\n              feedback\\n  export       Create a formatted report for the current\\n              learning session"
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
      prompt: format_status_digest(title, updates, width=48)가 text, lineCount, maxLineLength, bulletCount를 담은 dict를 반환하도록 완성하세요.
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
  retrievalVariants:
  - id: 18_textwrap-note-block-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 18_textwrap-cli-help-mastery
    - text_dedenting
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
    minimumDelayHours: 24
`;export{e as default};