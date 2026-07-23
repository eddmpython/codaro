var e=`meta:\r
  id: '25'\r
  title: 정규표현식 고급\r
  day: 25\r
  category: advancedPython\r
  tags:\r
  - regex\r
  - lookahead\r
  - lookbehind\r
  - backreference\r
  - group\r
  - 검증\r
  - 로그파싱\r
  seo:\r
    title: 파이썬 정규표현식 고급\r
    description: 룩어헤드, 룩비하인드, 그룹, 백레퍼런스 등 고급 정규표현식 기법 학습\r
    keywords:\r
    - 정규표현식\r
    - 룩어헤드\r
    - 룩비하인드\r
    - 백레퍼런스\r
intro:\r
  emoji: 🔍\r
  points:\r
  - 룩어헤드/룩비하인드 이해\r
  - 그룹과 백레퍼런스 활용\r
  - 복잡한 패턴 작성\r
  - 성능 최적화\r
  direction: 정규표현식 고급에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 정규표현식 고급 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 기본 패턴 복습 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 그룹 기초 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 룩어헤드 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 정규표현식 고급 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 정규표현식 고급 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 정규표현식 고급 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: basic_review\r
  title: 기본 패턴 복습\r
  structuredPrimary: true\r
  subtitle: 정규표현식 기초 문법\r
  goal: 기본 패턴 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 정규표현식 기본 문법 복습\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    reviewText = "Hello World 123 Python3.9"\r
    reviewDigits = re.findall(r'\\d+', reviewText)\r
    reviewWords = re.findall(r'\\w+', reviewText)\r
    reviewSplit = re.split(r'\\s+', reviewText)\r
    reviewResult = (reviewDigits, reviewWords, reviewSplit)\r
    reviewResult\r
  exercise:\r
    prompt: 기본 패턴 복습 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      reviewText = "Hello World 123 Python3.9"\r
      reviewDigits = re.findall(r'\\d+', reviewText)\r
      reviewWords = re.findall(r'\\w+', reviewText)\r
      reviewSplit = re.split(r'\\s+', reviewText)\r
      reviewResult = (reviewDigits, reviewWords, reviewSplit)\r
      reviewResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 패턴 복습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 기본 패턴 복습의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: groups_basic\r
  title: 그룹 기초\r
  structuredPrimary: true\r
  subtitle: 캡처 그룹으로 부분 추출\r
  goal: 그룹 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 괄호로 그룹을 만들면 매칭된 부분을 개별적으로 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    dateStr = "2024-03-15"\r
    dateMatch = re.match(r'(\\d{4})-(\\d{2})-(\\d{2})', dateStr)\r
    dateYear = dateMatch.group(1)\r
    dateMonth = dateMatch.group(2)\r
    dateDay = dateMatch.group(3)\r
    dateAll = dateMatch.groups()\r
    dateResult = (dateYear, dateMonth, dateDay, dateAll)\r
    dateResult\r
  exercise:\r
    prompt: 그룹 기초 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      dateStr = "2024-03-15"\r
      dateMatch = re.match(r'(\\d{4})-(\\d{2})-(\\d{2})', dateStr)\r
      dateYear = dateMatch.group(1)\r
      dateMonth = dateMatch.group(2)\r
      dateDay = dateMatch.group(3)\r
      dateAll = dateMatch.groups()\r
      dateResult = (dateYear, dateMonth, dateDay, dateAll)\r
      dateResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 그룹 기초의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 그룹 기초의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: lookahead\r
  title: 룩어헤드\r
  structuredPrimary: true\r
  subtitle: 전방 탐색으로 조건부 매칭\r
  goal: 룩어헤드에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: '(?=...) 긍정 룩어헤드: 뒤에 패턴이 있어야 매칭. (?!...) 부정 룩어헤드: 뒤에 패턴이 없어야 매칭.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    laText = "foo123 bar456 foo789"\r
    laPattern = r'\\w+(?=\\d{3})'\r
    laFound = re.findall(laPattern, laText)\r
    laResult = laFound\r
    laResult\r
  exercise:\r
    prompt: 룩어헤드 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      laText = "foo123 bar456 foo789"\r
      laPattern = r'\\w+(?=\\d{3})'\r
      laFound = re.findall(laPattern, laText)\r
      laResult = laFound\r
      laResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 룩어헤드의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 룩어헤드의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: lookbehind\r
  title: 룩비하인드\r
  structuredPrimary: true\r
  subtitle: 후방 탐색으로 조건부 매칭\r
  goal: 룩비하인드에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: '(?<=...) 긍정 룩비하인드: 앞에 패턴이 있어야 매칭. (?<!...) 부정 룩비하인드: 앞에 패턴이 없어야 매칭.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    lbText = "Price: $100 and €50"\r
    lbDollar = re.findall(r'(?<=\\$)\\d+', lbText)\r
    lbEuro = re.findall(r'(?<=€)\\d+', lbText)\r
    lbResult = (lbDollar, lbEuro)\r
    lbResult\r
  exercise:\r
    prompt: 룩비하인드 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      lbText = "Price: $100 and €50"\r
      lbDollar = re.findall(r'(?<=\\$)\\d+', lbText)\r
      lbEuro = re.findall(r'(?<=€)\\d+', lbText)\r
      lbResult = (lbDollar, lbEuro)\r
      lbResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 룩비하인드의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 룩비하인드의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: backreference\r
  title: 백레퍼런스\r
  structuredPrimary: true\r
  subtitle: 캡처한 그룹을 다시 참조\r
  goal: 백레퍼런스에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: \\1, \\2 등으로 앞서 캡처한 그룹을 다시 매칭에 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    dupText = "hello hello world world world"\r
    dupPattern = r'\\b(\\w+)\\s+\\1\\b'\r
    dupFound = re.findall(dupPattern, dupText)\r
    dupResult = dupFound\r
    dupResult\r
  exercise:\r
    prompt: 백레퍼런스 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      dupText = "hello hello world world world"\r
      dupPattern = r'\\b(\\w+)\\s+\\1\\b'\r
      dupFound = re.findall(dupPattern, dupText)\r
      dupResult = dupFound\r
      dupResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 백레퍼런스의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 백레퍼런스의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: non_capture\r
  title: 비캡처 그룹\r
  structuredPrimary: true\r
  subtitle: 그룹화만 하고 캡처하지 않음\r
  goal: 비캡처 그룹에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: '(?:...) 비캡처 그룹: 그룹화는 하지만 결과에 포함되지 않습니다. 성능과 가독성 향상.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    ncText = "foobar foobaz"\r
    ncCapture = re.findall(r'(foo)(bar|baz)', ncText)\r
    ncNonCapture = re.findall(r'(?:foo)(bar|baz)', ncText)\r
    ncResult = (ncCapture, ncNonCapture)\r
    ncResult\r
  exercise:\r
    prompt: 비캡처 그룹 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      ncText = "foobar foobaz"\r
      ncCapture = re.findall(r'(foo)(bar|baz)', ncText)\r
      ncNonCapture = re.findall(r'(?:foo)(bar|baz)', ncText)\r
      ncResult = (ncCapture, ncNonCapture)\r
      ncResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 비캡처 그룹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 비캡처 그룹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: flags\r
  title: 플래그\r
  structuredPrimary: true\r
  subtitle: 매칭 동작 변경\r
  goal: 플래그에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: (?i) 대소문자 무시, (?m) 멀티라인, (?s) 점이 줄바꿈도 매칭, (?x) 확장 모드\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    flagText = "HELLO hello HeLLo"\r
    flagCaseInsensitive = re.findall(r'(?i)hello', flagText)\r
    flagMultiText = "start line1\\nstart line2"\r
    flagMultiline = re.findall(r'(?m)^start', flagMultiText)\r
    flagResult = (flagCaseInsensitive, flagMultiline)\r
    flagResult\r
  exercise:\r
    prompt: 플래그 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      flagText = "HELLO hello HeLLo"\r
      flagCaseInsensitive = re.findall(r'(?i)hello', flagText)\r
      flagMultiText = "start line1\\nstart line2"\r
      flagMultiline = re.findall(r'(?m)^start', flagMultiText)\r
      flagResult = (flagCaseInsensitive, flagMultiline)\r
      flagResult\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 플래그의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 플래그의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: substitution\r
  title: 치환\r
  structuredPrimary: true\r
  subtitle: 패턴 기반 문자열 변환\r
  goal: 치환에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: re.sub()로 패턴에 매칭되는 부분을 치환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    subText = "cat dog cat bird"\r
    subReplaced = re.sub(r'cat|dog', 'animal', subText)\r
    subHtml = "<b>bold</b> and <i>italic</i>"\r
    subStripped = re.sub(r'<[^>]+>', '', subHtml)\r
    subResult = (subReplaced, subStripped)\r
    subResult\r
  exercise:\r
    prompt: 치환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      subText = "cat dog cat bird"\r
      subReplaced = re.sub(r'cat|dog', 'animal', subText)\r
      subHtml = "<b>bold</b> and <i>italic</i>"\r
      subStripped = re.sub(r'<[^>]+>', '', subHtml)\r
      subResult = (subReplaced, subStripped)\r
      subResult\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 치환의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 치환의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 로그 파싱과 마스킹'\r
  structuredPrimary: true\r
  subtitle: 명명 그룹, 룩어라운드, 치환 콜백을 검증 가능한 로그 처리로 연결합니다\r
  goal: '현업 흐름 검증: 주문 로그 파싱과 마스킹에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    정규표현식은 한 줄 마술이 아니라 실패를 드러내야 하는 파서입니다. 주문 로그에서 필드를 추출하고, 잘못된 라인을 거절하고, 개인정보를 마스킹하는 과정을 작은 함수로 나누어 검증하세요.\r
\r
    변주 실험\r
    \`status=failed\`인 로그만 모아 장애 리포트를 만들고, \`ERROR\` 레벨이 아닌 실패 로그도 잡히는지 테스트 데이터를 추가하세요.\r
  tips:\r
  - 변주 실험 \`status=failed\`인 로그만 모아 장애 리포트를 만들고, \`ERROR\` 레벨이 아닌 실패 로그도 잡히는지 테스트 데이터를 추가하세요.\r
  snippet: |-\r
    import re\r
\r
    logPattern = re.compile(\r
        r"(?P<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}) "\r
        r"(?P<level>INFO|WARN|ERROR) "\r
        r"service=(?P<service>[a-z-]+) "\r
        r"order=(?P<orderId>O-\\d+) "\r
        r"status=(?P<status>paid|failed|draft) "\r
        r"amount=(?P<amount>\\d+)"\r
    )\r
\r
    def parseOrderLog(line):\r
        match = logPattern.fullmatch(line)\r
        if match is None:\r
            raise ValueError("invalid order log")\r
        data = match.groupdict()\r
        data["amount"] = int(data["amount"])\r
        return data\r
\r
    line = "2026-05-24T09:30 INFO service=checkout order=O-100 status=paid amount=12000"\r
    parsed = parseOrderLog(line)\r
\r
    assert parsed["orderId"] == "O-100"\r
    assert parsed["amount"] == 12000\r
    assert parsed["service"] == "checkout"\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 로그 파싱과 마스킹 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      import re\r
\r
      logPattern = re.compile(\r
          r"(?P<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}) "\r
          r"(?P<level>INFO|WARN|ERROR) "\r
          r"service=(?P<service>[a-z-]+) "\r
          r"order=(?P<orderId>O-\\d+) "\r
          r"status=(?P<status>paid|failed|draft) "\r
          r"amount=(?P<amount>\\d+)"\r
      )\r
\r
      def parseOrderLog(line):\r
          match = logPattern.fullmatch(line)\r
          if match is None:\r
              raise ValueError("invalid order log")\r
          data = match.groupdict()\r
          data["amount"] = int(data["amount"])\r
          return data\r
\r
      line = "2026-05-24T09:30 INFO service=checkout order=O-100 status=paid amount=12000"\r
      parsed = parseOrderLog(line)\r
\r
      assert parsed["orderId"] == "O-100"\r
      assert parsed["amount"] == 12000\r
      assert parsed["service"] == "checkout"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 로그 파싱과 마스킹의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 로그 파싱과 마스킹 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 정규표현식 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: Day 25에서 배운 고급 정규표현식을 난이도별로 복습합니다. 룩어헤드와 룩비하인드는 패턴의 앞뒤 문맥을 검사하는 강력한 도구입니다. 그룹과 백레퍼런스는 복잡한\r
    텍스트 파싱과 치환에 필수적이며, 명명된 그룹은 가독성을 높입니다. 🟢 기본 문제로 이메일, 전화번호 등 실용적인 검증 패턴을 작성하고, 🟡 응용 문제로 룩어라운드와 조건부 매칭을\r
    연습하세요. 🔴 심화 문제에서는 프로그래밍 언어 토크나이저, 로그 파서 등 복잡한 파싱기를 직접 구현해봅니다. 정규표현식 숙달은 텍스트 처리 생산성을 10배 이상 높여줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    def validateMail(email):\r
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'\r
        return bool(re.match(pattern, email))\r
\r
    ex1Emails = ["test@example.com", "invalid", "a@b.co"]\r
    ex1Result = [validateMail(e) for e in ex1Emails]\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      def validateMail(email):\r
          pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'\r
          return bool(re.match(pattern, email))\r
\r
      ex1Emails = ["test@example.com", "invalid", "a@b.co"]\r
      ex1Result = [validateMail(e) for e in ex1Emails]\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 25_advanced_regex-order-log-parser-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - groups_basic
    - flags
    - workflow_validation
    title: 주문 로그를 명명 그룹으로 파싱하기
    subtitle: named group log parser
    goal: parse_order_logs(lines)를 완성해 정규식 명명 그룹으로 주문 로그를 구조화하고 실패 행을 분리한다.
    why: 정규표현식의 학습 가치는 샘플 하나를 맞히는 것이 아니라, 로그를 구조화하고 실패한 행을 버리지 않고 설명하는 데 있습니다.
    explanation: 로그 형식은 YYYY-MM-DD ORDER O-100 amount=12000 service=checkout입니다. 맞는 행은 orders에 넣고 맞지 않는 행은 invalid에 원문으로 남기세요.
    tips:
    - named group을 쓰면 group 순서보다 의미 이름으로 값을 읽을 수 있습니다.
    - re.ASCII나 re.IGNORECASE 같은 flag는 필요한 이유가 있을 때만 씁니다.
    exercise:
      prompt: parse_order_logs(lines)를 완성해 orders와 invalid 목록을 반환하세요.
      starterCode: |-
        def parse_order_logs(lines):
            raise NotImplementedError
      solution: |-
        def parse_order_logs(lines):
            import re

            pattern = re.compile(
                r"^(?P<date>\\d{4}-\\d{2}-\\d{2}) ORDER (?P<orderId>O-\\d+) amount=(?P<amount>\\d+) service=(?P<service>[a-z_]+)$",
                re.IGNORECASE,
            )
            orders = []
            invalid = []
            for line in lines:
                match = pattern.match(line)
                if not match:
                    invalid.append(line)
                    continue
                orders.append(
                    {
                        "date": match.group("date"),
                        "orderId": match.group("orderId"),
                        "amount": int(match.group("amount")),
                        "service": match.group("service").lower(),
                    }
                )
            return {"orders": orders, "invalid": invalid}
      hints:
      - (?P<name>...) 형태의 명명 그룹을 사용하세요.
      - amount는 문자열이 아니라 int로 바꿔 반환해야 합니다.
    check:
      id: python.advanced.regex-order-log.parser.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.regex-order-log.empty.behavior.v1.fixture
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
        entry: parse_order_logs
        cases:
        - id: parses-valid-lines-and-keeps-invalid-lines
          arguments:
          - value:
            - "2026-07-19 ORDER O-100 amount=12000 service=checkout"
            - "bad line"
            - "2026-07-19 ORDER O-101 amount=8000 service=PAYMENT"
          expectedReturn:
            orders:
            - date: "2026-07-19"
              orderId: O-100
              amount: 12000
              service: checkout
            - date: "2026-07-19"
              orderId: O-101
              amount: 8000
              service: payment
            invalid:
            - "bad line"
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 25_advanced_regex-sensitive-mask-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - lookahead
    - lookbehind
    - backreference
    - substitution
    title: 고객 문장에서 이메일과 전화번호 마스킹하기
    subtitle: regex substitution transfer
    goal: mask_customer_text(text)를 완성해 이메일과 전화번호를 정규식 치환으로 마스킹하고 치환 개수를 반환한다.
    why: 로그 파싱에서 배운 그룹과 치환을 개인정보 마스킹으로 옮기면, 정규식이 실제 안전 작업에 어떻게 쓰이는지 검증할 수 있습니다.
    explanation: 이메일은 첫 글자와 도메인을 남기고 가운데를 ***로 바꾸며, 전화번호는 가운데 네 자리를 ****로 바꾸세요.
    tips:
    - re.sub의 함수 replacement를 쓰면 그룹 값을 조합해 새 문자열을 만들 수 있습니다.
    - 전화번호에는 앞뒤 숫자가 이어붙은 잘못된 부분 매칭을 피하기 위해 lookaround를 둡니다.
    exercise:
      prompt: mask_customer_text(text)를 완성해 masked, emailCount, phoneCount를 반환하세요.
      starterCode: |-
        def mask_customer_text(text):
            raise NotImplementedError
      solution: |-
        def mask_customer_text(text):
            import re

            email_pattern = re.compile(
                r"(?P<first>[A-Za-z0-9._%+-])(?P<body>[A-Za-z0-9._%+-]*)(?P<domain>@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})"
            )
            phone_pattern = re.compile(r"(?<!\\d)(?P<head>\\d{3})-(?P<middle>\\d{4})-(?P<tail>\\d{4})(?!\\d)")

            email_count = 0

            def mask_email(match):
                nonlocal email_count
                email_count += 1
                return match.group("first") + "***" + match.group("domain")

            phone_count = len(phone_pattern.findall(text))
            masked = email_pattern.sub(mask_email, text)
            masked = phone_pattern.sub(r"\\g<head>-****-\\g<tail>", masked)
            return {"masked": masked, "emailCount": email_count, "phoneCount": phone_count}
      hints:
      - 이메일은 첫 글자와 domain 그룹만 남기면 됩니다.
      - (?<!\\d)와 (?!\\d)는 전화번호 앞뒤에 숫자가 붙은 부분 매칭을 막습니다.
    check:
      id: python.advanced.regex-order-log.sensitive-mask.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.regex-order-log.empty.behavior.v1.fixture
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
        entry: mask_customer_text
        cases:
        - id: masks-email-and-phone-number
          arguments:
          - value: "mail mina@example.com phone 010-1234-5678"
          expectedReturn:
            masked: "mail m***@example.com phone 010-****-5678"
            emailCount: 1
            phoneCount: 1
        - id: avoids-phone-partial-match-inside-long-number
          arguments:
          - value: "raw 9010-1234-56789 and lee@example.org"
          expectedReturn:
            masked: "raw 9010-1234-56789 and l***@example.org"
            emailCount: 1
            phoneCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 25_advanced_regex-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - basic_review
    - groups_basic
    - lookahead
    - lookbehind
    - backreference
    - non_capture
    - flags
    - substitution
    title: 고급 정규식 도구 선택 기준 회상하기
    subtitle: regex feature recall
    goal: choose_regex_tool(need)를 완성해 요구사항별 정규식 기능과 주의점을 반환한다.
    why: 정규식 고급 기능은 강력하지만 읽기 어려워지기 쉽습니다. 어떤 경우 named group, lookaround, backreference, substitution이 필요한지 구분해야 합니다.
    explanation: parse-fields, require-next-token, require-previous-token, repeated-word, group-without-capture, case-insensitive, rewrite-text 상황별 기능을 선택하세요.
    tips:
    - 캡처가 필요 없는 그룹은 비캡처 그룹으로 번호 혼란을 줄입니다.
    - lookbehind는 길이 제한과 엔진 지원 범위를 확인해야 합니다.
    exercise:
      prompt: choose_regex_tool(need)를 완성해 feature, useWhen, caution을 반환하세요.
      starterCode: |-
        def choose_regex_tool(need):
            raise NotImplementedError
      solution: |-
        def choose_regex_tool(need):
            table = {
                "parse-fields": {
                    "feature": "named-group",
                    "useWhen": "matched parts need readable names",
                    "caution": "validate the full line before trusting groups",
                },
                "require-next-token": {
                    "feature": "lookahead",
                    "useWhen": "a following pattern must exist without consuming it",
                    "caution": "too many assertions make patterns hard to debug",
                },
                "require-previous-token": {
                    "feature": "lookbehind",
                    "useWhen": "a previous fixed-width pattern must exist",
                    "caution": "variable-width lookbehind is limited",
                },
                "repeated-word": {
                    "feature": "backreference",
                    "useWhen": "a later match must equal an earlier group",
                    "caution": "renumbered groups can break numeric references",
                },
                "group-without-capture": {
                    "feature": "non-capturing-group",
                    "useWhen": "grouping is needed only for precedence or alternation",
                    "caution": "do not capture values that are never read",
                },
                "case-insensitive": {
                    "feature": "flag",
                    "useWhen": "letter case should not affect matching",
                    "caution": "flags can widen matches more than expected",
                },
                "rewrite-text": {
                    "feature": "substitution",
                    "useWhen": "matched text should be transformed or masked",
                    "caution": "count replacements for auditability",
                },
            }
            if need not in table:
                raise ValueError("unknown regex need")
            return table[need]
      hints:
      - 정규식 기능은 가장 좁은 필요에 맞춰 선택하세요.
      - 마스킹과 치환은 결과 문자열뿐 아니라 치환 건수도 확인하는 편이 안전합니다.
    check:
      id: python.advanced.regex-order-log.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.regex-order-log.empty.behavior.v1.fixture
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
        entry: choose_regex_tool
        cases:
        - id: recalls-named-group-for-field-parsing
          arguments:
          - value: parse-fields
          expectedReturn:
            feature: named-group
            useWhen: matched parts need readable names
            caution: validate the full line before trusting groups
        - id: recalls-substitution-for-masking
          arguments:
          - value: rewrite-text
          expectedReturn:
            feature: substitution
            useWhen: matched text should be transformed or masked
            caution: count replacements for auditability
        - id: rejects-unknown-need
          arguments:
          - value: regex-magic
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};