var e=`meta:\r
  id: regex_05\r
  title: 로그파일분석\r
  order: 5\r
  category: regex\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - 로그\r
  - 멀티라인\r
  - MULTILINE\r
  - 타임스탬프\r
  - 에러 파싱\r
  seo:\r
    title: 정규표현식 기초 - 로그 파일 분석\r
    description: 정규표현식으로 서버 로그를 파싱합니다. 멀티라인 모드, ^$ 앵커, 타임스탬프 추출을 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - 로그 파싱\r
    - re.MULTILINE\r
    - 타임스탬프\r
intro:\r
  emoji: 📋\r
  goal: 서버 로그에서 에러 메시지, 타임스탬프, IP 주소를 추출합니다.\r
  description: 실무에서 가장 많이 사용하는 정규표현식 활용 사례입니다. 멀티라인 모드와 앵커(^$)를 배워 로그 분석을 마스터합니다.\r
  direction: 로그파일분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - 로그파일분석 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 로그 데이터 준비 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 에러 로그만 추출 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 로그파일분석 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 로그파일분석 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: 로그파일분석 완료\r
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 1단계. 라이브러리 불러오기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import re\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import re\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_prepare_log\r
  title: 2단계. 로그 데이터 준비\r
  structuredPrimary: true\r
  subtitle: 실제 서버 로그 형식\r
  goal: 2단계. 로그 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 서버 로그 형식을 재현한 샘플 데이터를 만듭니다. 서버 로그는 날짜, 시간, 로그 레벨, IP 주소, 메시지 등 정형화된 구조를 가지고 있어 정규표현식 파싱에 적합합니다. 시스템 관리자와 DevOps 엔지니어가 가장 많이 사용하는 정규표현식 활용 사례입니다.\r
\r
    로그 형식: - 타임스탬프: YYYY-MM-DD HH:MM:SS - 로그 레벨: INFO, WARNING, ERROR - IP 주소: [192.168.1.xxx] - 메시지: 실제 로그 내용\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    serverLog = """\r
    2025-12-26 10:15:30 INFO [192.168.1.100] User login successful\r
    2025-12-26 10:16:45 ERROR [192.168.1.101] Database connection failed: timeout\r
    2025-12-26 10:17:12 WARNING [192.168.1.102] High memory usage: 85%\r
    2025-12-26 10:18:03 INFO [192.168.1.100] User logout\r
    2025-12-26 10:19:55 ERROR [192.168.1.103] File not found: /var/log/app.log\r
    2025-12-26 10:20:30 ERROR [192.168.1.101] Connection reset by peer\r
    2025-12-26 10:21:15 INFO [192.168.1.104] Request completed in 120ms\r
    """\r
    serverLog\r
  exercise:\r
    prompt: 2단계. 로그 데이터 준비 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      serverLog = """\r
      2025-12-26 10:15:30 INFO [192.168.1.100] User login successful\r
      2025-12-26 10:16:45 ERROR [192.168.1.101] Database connection failed: timeout\r
      2025-12-26 10:17:12 WARNING [192.168.1.102] High memory usage: 85%\r
      2025-12-26 10:18:03 INFO [192.168.1.100] User logout\r
      2025-12-26 10:19:55 ERROR [192.168.1.103] File not found: /var/log/app.log\r
      2025-12-26 10:20:30 ERROR [192.168.1.101] Connection reset by peer\r
      2025-12-26 10:21:15 INFO [192.168.1.104] Request completed in 120ms\r
      """\r
      serverLog\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 로그 데이터 준비의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 로그 데이터 준비의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_extract_errors\r
  title: 3단계. 에러 로그만 추출\r
  structuredPrimary: true\r
  subtitle: ERROR 레벨 필터링\r
  goal: 3단계. 에러 로그만 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    먼저 ERROR 레벨의 로그만 찾아봅시다. 에러 로그는 시스템 문제를 진단하는 데 가장 중요한 정보입니다. 수천 줄의 로그에서 에러만 빠르게 필터링하면 문제 해결 시간을 크게 단축할 수 있습니다.\r
\r
    잘 작동합니다! 하지만 줄 단위로 더 정확하게 찾는 방법이 있습니다. 앵커(anchor)를 사용하면 줄의 시작과 끝을 명시적으로 지정할 수 있어, 부분 매칭이 아닌 전체 줄을 정확하게 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r".*ERROR.*"\r
\r
    errors = re.findall(pattern, serverLog)\r
    errors\r
  exercise:\r
    prompt: 3단계. 에러 로그만 추출 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r".*ERROR.*"\r
\r
      errors = re.findall(pattern, serverLog)\r
      errors\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 에러 로그만 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 에러 로그만 추출의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_line_anchors\r
  title: 4단계. 줄 앵커 사용하기\r
  structuredPrimary: true\r
  subtitle: ^ 와 $ 메타문자\r
  goal: 4단계. 줄 앵커 사용하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    ^ 는 줄의 시작, $ 는 줄의 끝을 나타내는 앵커(anchor) 메타문자입니다. 하지만 기본적으로는 전체 문자열의 시작과 끝만 매칭합니다. re.MULTILINE 플래그를 사용해야 각 줄마다 ^와 $가 작동합니다.\r
\r
    re.MULTILINE (re.M)\r
    **re.MULTILINE** 또는 **re.M** 플래그: - \`^\` 가 각 줄의 시작을 매칭 - \`$\` 가 각 줄의 끝을 매칭 - 기본값은 전체 문자열의 시작/끝만 로그 파일처럼 여러 줄 텍스트를 다룰 때 필수!\r
  tips:\r
  - 're.MULTILINE (re.M) **re.MULTILINE** 또는 **re.M** 플래그: - \`^\` 가 각 줄의 시작을 매칭 - \`$\` 가 각 줄의 끝을 매칭 - 기본값은\r
    전체 문자열의 시작/끝만 로그 파일처럼 여러 줄 텍스트를 다룰 때 필수!'\r
  snippet: |-\r
    pattern = r"ERROR.*"\r
    re.findall(pattern, serverLog)\r
  exercise:\r
    prompt: 4단계. 줄 앵커 사용하기 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"ERROR.*"\r
      re.findall(pattern, serverLog)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 줄 앵커 사용하기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 줄 앵커 사용하기의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_parse_timestamp\r
  title: 5단계. 타임스탬프 추출\r
  structuredPrimary: true\r
  subtitle: 날짜/시간 패턴\r
  goal: 5단계. 타임스탬프 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    각 에러 로그의 타임스탬프를 추출합니다.\r
\r
    타임스탬프 패턴 해석\r
    - \`\\d{4}\` : 연도 4자리 - \`-\` : 하이픈 리터럴 - \`\\d{2}\` : 월/일 2자리 - \` \` : 공백 - \`\\d{2}:\\d{2}:\\d{2}\` : 시:분:초\r
  tips:\r
  - '타임스탬프 패턴 해석 - \`\\d{4}\` : 연도 4자리 - \`-\` : 하이픈 리터럴 - \`\\d{2}\` : 월/일 2자리 - \` \` : 공백 - \`\\d{2}:\\d{2}:\\d{2}\`\r
    : 시:분:초'\r
  snippet: |-\r
    pattern = r"(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})"\r
\r
    timestamps = re.findall(pattern, serverLog)\r
    timestamps\r
  exercise:\r
    prompt: 5단계. 타임스탬프 추출 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})"\r
\r
      timestamps = re.findall(pattern, serverLog)\r
      timestamps\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 타임스탬프 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 타임스탬프 추출의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_structured_parsing\r
  title: 6단계. 구조화된 로그 파싱\r
  structuredPrimary: true\r
  subtitle: 모든 정보를 한 번에\r
  goal: 6단계. 구조화된 로그 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    타임스탬프, 레벨, IP, 메시지를 모두 추출하는 완전한 패턴을 만듭니다.\r
\r
    re.finditer() 사용\r
    **re.finditer(패턴, 텍스트)**: - findall과 비슷하지만 Match 객체들을 반환 - 각 Match에서 .groupdict() 사용 가능 - 메모리 효율적 (제너레이터)\r
  tips:\r
  - 're.finditer() 사용 **re.finditer(패턴, 텍스트)**: - findall과 비슷하지만 Match 객체들을 반환 - 각 Match에서 .groupdict()\r
    사용 가능 - 메모리 효율적 (제너레이터)'\r
  snippet: |-\r
    pattern = r"^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) (?P<level>\\w+) \\[(?P<ip>[\\d.]+)\\] (?P<message>.+)$"\r
\r
    matches = re.finditer(pattern, serverLog, flags=re.MULTILINE)\r
\r
    parsedLogs = [match.groupdict() for match in matches]\r
    parsedLogs[:3]\r
  exercise:\r
    prompt: 6단계. 구조화된 로그 파싱 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) (?P<level>\\w+) \\[(?P<ip>[\\d.]+)\\] (?P<message>.+)$"\r
\r
      matches = re.finditer(pattern, serverLog, flags=re.MULTILINE)\r
\r
      parsedLogs = [match.groupdict() for match in matches]\r
      parsedLogs[:3]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 구조화된 로그 파싱의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 구조화된 로그 파싱 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_filter_errors\r
  title: 7단계. 에러만 필터링\r
  structuredPrimary: true\r
  subtitle: 조건부 추출\r
  goal: 7단계. 에러만 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 파싱한 로그에서 ERROR 레벨만 필터링합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    matches = re.finditer(pattern, serverLog, flags=re.MULTILINE)\r
    parsedLogs = [match.groupdict() for match in matches]\r
\r
    errorLogs = [log for log in parsedLogs if log['level'] == 'ERROR']\r
    errorLogs\r
  exercise:\r
    prompt: 7단계. 에러만 필터링 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      matches = re.finditer(pattern, serverLog, flags=re.MULTILINE)\r
      parsedLogs = [match.groupdict() for match in matches]\r
\r
      errorLogs = [log for log in parsedLogs if log['level'] == 'ERROR']\r
      errorLogs\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 에러만 필터링의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 에러만 필터링 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_ip_analysis\r
  title: 8단계. IP 주소 분석\r
  structuredPrimary: true\r
  subtitle: 에러 발생 IP 통계\r
  goal: 8단계. IP 주소 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    어느 IP에서 에러가 가장 많이 발생했는지 확인합니다.\r
\r
    192.168.1.101에서 에러가 2번 발생했네요. 이 서버를 점검해야겠습니다!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    ipCount = {}\r
    for error in errorLogs:\r
        ip = error['ip']\r
        ipCount[ip] = ipCount.get(ip, 0) + 1\r
\r
    ipCount\r
  exercise:\r
    prompt: 8단계. IP 주소 분석 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ipCount = {}\r
      for error in errorLogs:\r
          ip = error['ip']\r
          ipCount[ip] = ipCount.get(ip, 0) + 1\r
\r
      ipCount\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. IP 주소 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. IP 주소 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_advanced_pattern\r
  title: 9단계. 특정 에러 검색\r
  structuredPrimary: true\r
  subtitle: 메시지 내용 기반 필터링\r
  goal: 9단계. 특정 에러 검색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    특정 키워드가 포함된 에러만 찾아봅시다. 예를 들어 "connection" 관련 에러.\r
\r
    re.IGNORECASE (re.I)\r
    **re.IGNORECASE** 또는 **re.I** 플래그: - 대소문자 구분 안 함 - connection, Connection, CONNECTION 모두 매칭 **플래그 조합**: \`re.MULTILINE | re.IGNORECASE\`\r
  tips:\r
  - 're.IGNORECASE (re.I) **re.IGNORECASE** 또는 **re.I** 플래그: - 대소문자 구분 안 함 - connection, Connection, CONNECTION\r
    모두 매칭 **플래그 조합**: \`re.MULTILINE | re.IGNORECASE\`'\r
  snippet: |-\r
    pattern = r"^(?P<timestamp>[\\d\\-: ]+) ERROR .* (?P<message>.*connection.*)$"\r
\r
    matches = re.finditer(pattern, serverLog, flags=re.MULTILINE | re.IGNORECASE)\r
\r
    connectionErrors = [match.groupdict() for match in matches]\r
    connectionErrors\r
  exercise:\r
    prompt: 9단계. 특정 에러 검색 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"^(?P<timestamp>[\\d\\-: ]+) ERROR .* (?P<message>.*connection.*)$"\r
\r
      matches = re.finditer(pattern, serverLog, flags=re.MULTILINE | re.IGNORECASE)\r
\r
      connectionErrors = [match.groupdict() for match in matches]\r
      connectionErrors\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 특정 에러 검색의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 특정 에러 검색 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 10단계. 운영 로그 검증 루프\r
  structuredPrimary: true\r
  subtitle: 파싱 결과를 업무 기준으로 검증\r
  goal: 10단계. 운영 로그 검증 루프에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 로그 파서는 "대충 몇 줄 보인다"가 아니라 기대한 줄 수, 로그 레벨 분포, 에러 IP 집계가 모두 맞는지 확인해야 운영에서 믿고 사용할 수 있습니다. 여기서는\r
    파싱 결과를 검증하고, 일부러 잘못된 패턴을 넣어 어떤 문제가 잡히는지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    logPattern = re.compile(\r
        r"^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) "\r
        r"(?P<level>INFO|WARNING|ERROR) "\r
        r"\\[(?P<ip>\\d{1,3}(?:\\.\\d{1,3}){3})\\] "\r
        r"(?P<message>.+)$",\r
        flags=re.MULTILINE,\r
    )\r
\r
    parsedLogs = [match.groupdict() for match in logPattern.finditer(serverLog)]\r
    errorLogs = [log for log in parsedLogs if log["level"] == "ERROR"]\r
\r
    def validateParsedLogs(logs):\r
        levelCounts = {}\r
        for log in logs:\r
            levelCounts[log["level"]] = levelCounts.get(log["level"], 0) + 1\r
\r
        errorIpCounts = {}\r
        for log in logs:\r
            if log["level"] == "ERROR":\r
                errorIpCounts[log["ip"]] = errorIpCounts.get(log["ip"], 0) + 1\r
\r
        assert len(logs) == 7, f"파싱된 로그 수가 다릅니다: {len(logs)}"\r
        assert levelCounts == {"INFO": 3, "ERROR": 3, "WARNING": 1}, levelCounts\r
        assert len(errorLogs) == 3, f"ERROR 로그 수가 다릅니다: {len(errorLogs)}"\r
        assert errorIpCounts["192.168.1.101"] == 2, errorIpCounts\r
\r
        return {\r
            "totalLogs": len(logs),\r
            "levelCounts": levelCounts,\r
            "errorIpCounts": errorIpCounts,\r
        }\r
\r
    validationReport = validateParsedLogs(parsedLogs)\r
    validationReport\r
  exercise:\r
    prompt: 10단계. 운영 로그 검증 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      logPattern = re.compile(\r
          r"^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) "\r
          r"(?P<level>INFO|WARNING|ERROR) "\r
          r"\\[(?P<ip>\\d{1,3}(?:\\.\\d{1,3}){3})\\] "\r
          r"(?P<message>.+)$",\r
          flags=re.MULTILINE,\r
      )\r
\r
      parsedLogs = [match.groupdict() for match in logPattern.finditer(serverLog)]\r
      errorLogs = [log for log in parsedLogs if log["level"] == "ERROR"]\r
\r
      def validateParsedLogs(logs):\r
          levelCounts = {}\r
          for log in logs:\r
              levelCounts[log["level"]] = levelCounts.get(log["level"], 0) + 1\r
\r
          errorIpCounts = {}\r
          for log in logs:\r
              if log["level"] == "ERROR":\r
                  errorIpCounts[log["ip"]] = errorIpCounts.get(log["ip"], 0) + 1\r
\r
          assert len(logs) == 7, f"파싱된 로그 수가 다릅니다: {len(logs)}"\r
          assert levelCounts == {"INFO": 3, "ERROR": 3, "WARNING": 1}, levelCounts\r
          assert len(errorLogs) == 3, f"ERROR 로그 수가 다릅니다: {len(errorLogs)}"\r
          assert errorIpCounts["192.168.1.101"] == 2, errorIpCounts\r
\r
          return {\r
              "totalLogs": len(logs),\r
              "levelCounts": levelCounts,\r
              "errorIpCounts": errorIpCounts,\r
          }\r
\r
      validationReport = validateParsedLogs(parsedLogs)\r
      validationReport\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 운영 로그 검증 루프의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 운영 로그 검증 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 로그 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    서버 관리자가 되어 로그 파일을 분석합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    log = """\r
    2025-12-26 10:17:12 WARNING [192.168.1.102] High memory usage: 85%\r
    2025-12-26 10:25:30 WARNING [192.168.1.105] High CPU usage: 92%\r
    2025-12-26 10:30:45 WARNING [192.168.1.102] High memory usage: 91%\r
    """\r
\r
    pat = r"^(?P<timestamp>[\\d\\-: ]+) WARNING .* memory usage: (?P<percent>\\d+)%"\r
    matches = re.finditer(pat, log, flags=re.MULTILINE | re.IGNORECASE)\r
\r
    result = [\r
        {"시간": m.group('timestamp'), "사용률": m.group('percent') + "%"}\r
        for m in matches\r
    ]\r
    result\r
  exercise:\r
    prompt: 실습 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      log = """\r
      2025-12-26 10:17:12 WARNING [192.168.1.102] High memory usage: 85%\r
      2025-12-26 10:25:30 WARNING [192.168.1.105] High CPU usage: 92%\r
      2025-12-26 10:30:45 WARNING [192.168.1.102] High memory usage: 91%\r
      """\r
\r
      pat = r"^(?P<timestamp>[\\d\\-: ]+) WARNING .* memory usage: (?P<percent>\\d+)%"\r
      matches = re.finditer(pat, log, flags=re.MULTILINE | re.IGNORECASE)\r
\r
      result = [\r
          {"시간": m.group('timestamp'), "사용률": m.group('percent') + "%"}\r
          for m in matches\r
      ]\r
      result\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 다섯 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 멀티라인 모드와 줄 앵커를 배웠습니다. 서버 로그를 파싱하고 분석할 수 있습니다.\r
  - type: list\r
    items:\r
    - ^, $ - 줄 시작/끝 앵커\r
    - re.MULTILINE - 줄마다 앵커 적용\r
    - re.IGNORECASE - 대소문자 무시\r
    - re.finditer() - Match 객체 반환\r
  - type: text\r
    content: 이제 기초 단계를 완료했습니다! 다음부터는 중급 프로젝트가 시작됩니다!\r
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
`;export{e as default};