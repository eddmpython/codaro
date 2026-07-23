var e=`meta:\r
  id: regex_03\r
  title: URL구조분해\r
  order: 3\r
  category: regex\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - URL\r
  - 이름 있는 그룹\r
  - search\r
  - 파싱\r
  - 로컬 샘플\r
  seo:\r
    title: 정규표현식 기초 - URL 구조 분해\r
    description: 정규표현식으로 URL을 프로토콜, 도메인, 경로, 쿼리로 분해합니다. 이름 있는 그룹, re.search를 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - URL 파싱\r
    - 이름 있는 그룹\r
    - re.search\r
intro:\r
  emoji: 🔗\r
  goal: URL을 프로토콜, 도메인, 경로, 쿼리스트링으로 분해합니다.\r
  description: 이전 프로젝트에서 배운 그룹에 이름을 붙여 더 명확하게 사용하는 방법을 배웁니다. URL 파싱으로 웹 데이터 처리의 기초를 다집니다.\r
  direction: URL구조분해에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - URL구조분해 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 완전한 URL 만들기 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: URL구조분해 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: URL구조분해 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: URL구조분해 완료\r
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 이전과 동일하게 필요한 모듈을 불러옵니다. 이번 프로젝트에서는 이름 있는 그룹(named group)이라는 새로운 개념을 배웁니다. 숫자 대신 이름으로 그룹을\r
    참조하면 코드 가독성이 높아지고, 복잡한 패턴도 쉽게 관리할 수 있습니다.\r
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
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 로컬 웹사이트 확인\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    로컬 사용자 샘플에서 웹사이트 주소를 가져옵니다. URL 파싱은 웹 크롤링, 링크 분석, SEO 최적화 등 웹 개발의 다양한 분야에서 사용됩니다. 정규표현식으로 URL 구조를 이해하면 외부 라이브러리 없이도 URL을 효과적으로 처리할 수 있습니다.\r
\r
    확인된 웹사이트들: - docs.codaro.local - analytics.dataworks.com - automation.codaro.io - insightlab.kr - support.sample.org 프로토콜이 없는 도메인만 있네요. 실습을 위해 완전한 URL을 만들어봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    usersData = [\r
        {"name": "Hana Kim", "website": "docs.codaro.local"},\r
        {"name": "Min Park", "website": "analytics.dataworks.com"},\r
        {"name": "Jae Lee", "website": "automation.codaro.io"},\r
        {"name": "Soo Choi", "website": "insightlab.kr"},\r
        {"name": "Yuna Jung", "website": "support.sample.org"},\r
        {"name": "Alex Morgan", "website": "platform.service.net"},\r
    ]\r
\r
    usersData[:2]\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      usersData = [\r
          {"name": "Hana Kim", "website": "docs.codaro.local"},\r
          {"name": "Min Park", "website": "analytics.dataworks.com"},\r
          {"name": "Jae Lee", "website": "automation.codaro.io"},\r
          {"name": "Soo Choi", "website": "insightlab.kr"},\r
          {"name": "Yuna Jung", "website": "support.sample.org"},\r
          {"name": "Alex Morgan", "website": "platform.service.net"},\r
      ]\r
\r
      usersData[:2]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_create_full_url\r
  title: 3단계. 완전한 URL 만들기\r
  structuredPrimary: true\r
  subtitle: 테스트 데이터 준비\r
  goal: 3단계. 완전한 URL 만들기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 3단계. 완전한 URL 만들기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    testUrls = [\r
        "https://www.example.com/path/to/page",\r
        "http://blog.site.org/posts/123",\r
        "https://api.service.io/v1/users?id=5&name=john",\r
        "http://shop.example.com/products/item-456?category=books",\r
        "https://subdomain.site.co.kr/search?q=python&page=2"\r
    ]\r
    testUrls[0]\r
  exercise:\r
    prompt: 3단계. 완전한 URL 만들기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      testUrls = [\r
          "https://www.example.com/path/to/page",\r
          "http://blog.site.org/posts/123",\r
          "https://api.service.io/v1/users?id=5&name=john",\r
          "http://shop.example.com/products/item-456?category=books",\r
          "https://subdomain.site.co.kr/search?q=python&page=2"\r
      ]\r
      testUrls[0]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 완전한 URL 만들기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 완전한 URL 만들기의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_basic_pattern\r
  title: 4단계. 기본 URL 패턴\r
  structuredPrimary: true\r
  subtitle: 프로토콜과 도메인 추출\r
  goal: 4단계. 기본 URL 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    먼저 간단한 패턴으로 프로토콜과 도메인을 추출해봅시다. URL의 각 부분을 그룹으로 캡처하면 나중에 개별적으로 접근할 수 있습니다. http:// 또는 https://로 시작하고, 도메인이 이어지는 기본 구조부터 파악합니다.\r
\r
    패턴 해석\r
    **패턴: (https?)://([\\w.-]+)** - \`(https?)\` : **그룹 1** - http 또는 https (s는 선택적) - \`://\` : :// 리터럴 - \`([\\w.-]+)\` : **그룹 2** - 도메인 (단어문자, 마침표, 하이픈 1개 이상)\r
  tips:\r
  - '패턴 해석 **패턴: (https?)://([\\w.-]+)** - \`(https?)\` : **그룹 1** - http 또는 https (s는 선택적) - \`://\` : ://\r
    리터럴 - \`([\\w.-]+)\` : **그룹 2** - 도메인 (단어문자, 마침표, 하이픈 1개 이상)'\r
  snippet: |-\r
    pattern = r"(https?)://([\\w.-]+)"\r
\r
    match = re.search(pattern, testUrls[0])\r
    match.groups()\r
  exercise:\r
    prompt: 4단계. 기본 URL 패턴 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(https?)://([\\w.-]+)"\r
\r
      match = re.search(pattern, testUrls[0])\r
      match.groups()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 기본 URL 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 기본 URL 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_named_groups\r
  title: 5단계. 이름 있는 그룹\r
  structuredPrimary: true\r
  subtitle: (?P<name>) 문법\r
  goal: 5단계. 이름 있는 그룹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    그룹에 번호 대신 이름을 붙이면 더 명확합니다. (?P<이름>패턴) 형식으로 작성합니다.\r
\r
    이름 있는 그룹: (?P<name>패턴)\r
    - \`(?P<protocol>https?)\` : protocol이라는 이름의 그룹 - \`(?P<domain>[\\w.-]+)\` : domain이라는 이름의 그룹 - \`match.groupdict()\` : 딕셔너리로 반환 {'protocol': 'https', 'domain': '...'} - \`match.group('protocol')\` : 이름으로 접근 가능\r
  tips:\r
  - '이름 있는 그룹: (?P<name>패턴) - \`(?P<protocol>https?)\` : protocol이라는 이름의 그룹 - \`(?P<domain>[\\w.-]+)\` : domain이라는\r
    이름의 그룹 - \`match.groupdict()\` : 딕셔너리로 반환 {''protocol'': ''https'', ''domain'': ''...''} - \`match.group(''protocol'')\`\r
    : 이름으로 접근 가능'\r
  snippet: |-\r
    pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)"\r
\r
    match = re.search(pattern, testUrls[0])\r
    match.groupdict()\r
  exercise:\r
    prompt: 5단계. 이름 있는 그룹 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)"\r
\r
      match = re.search(pattern, testUrls[0])\r
      match.groupdict()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 이름 있는 그룹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 이름 있는 그룹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_complete_pattern\r
  title: 6단계. 완전한 URL 패턴\r
  structuredPrimary: true\r
  subtitle: 경로와 쿼리스트링 추가\r
  goal: 6단계. 완전한 URL 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 6단계. 완전한 URL 패턴의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"\r
\r
    testUrl = testUrls[2]\r
    match = re.search(pattern, testUrl)\r
    match.groupdict()\r
  exercise:\r
    prompt: 6단계. 완전한 URL 패턴 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"\r
\r
      testUrl = testUrls[2]\r
      match = re.search(pattern, testUrl)\r
      match.groupdict()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 완전한 URL 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 완전한 URL 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step7_re_search_vs_findall\r
  title: 7단계. re.search() 이해하기\r
  structuredPrimary: true\r
  subtitle: findall과의 차이\r
  goal: 7단계. re.search() 이해하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 사용한 re.search는 findall과 어떻게 다를까요?\r
\r
    re.search() vs re.findall()\r
    **re.search(패턴, 텍스트)**: - 첫 번째 매칭만 찾음 - Match 객체 반환 - .group(), .groupdict() 사용 가능 **re.findall(패턴, 텍스트)**: - 모든 매칭 찾음 - 리스트 반환 - 그룹이 있으면 튜플 리스트 URL 파싱처럼 구조를 분해할 때는 search가 적합합니다.\r
  tips:\r
  - 're.search() vs re.findall() **re.search(패턴, 텍스트)**: - 첫 번째 매칭만 찾음 - Match 객체 반환 - .group(), .groupdict()\r
    사용 가능 **re.findall(패턴, 텍스트)**: - 모든 매칭 찾음 - 리스트 반환 - 그룹이 있으면 튜플 리스트 URL 파싱처럼 구조를 분해할 때는 search가 적합합니다.'\r
  snippet: |-\r
    multiUrl = "방문: https://site1.com/page 그리고 http://site2.org/other"\r
\r
    searchResult = re.search(r"(https?)://([\\w.]+)", multiUrl)\r
    findallResult = re.findall(r"(https?)://([\\w.]+)", multiUrl)\r
\r
    f"search: {searchResult.groups() if searchResult else None}\\nfindall: {findallResult}"\r
  exercise:\r
    prompt: 7단계. re.search() 이해하기 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      multiUrl = "방문: https://site1.com/page 그리고 http://site2.org/other"\r
\r
      searchResult = re.search(r"(https?)://([\\w.]+)", multiUrl)\r
      findallResult = re.findall(r"(https?)://([\\w.]+)", multiUrl)\r
\r
      f"search: {searchResult.groups() if searchResult else None}\\nfindall: {findallResult}"\r
    hints:\r
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.\r
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.\r
  check:\r
    type: noError\r
    noError: 7단계. re.search() 이해하기의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 7단계. re.search() 이해하기 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: step8_parse_all\r
  title: 8단계. 모든 URL 파싱\r
  structuredPrimary: true\r
  subtitle: 함수로 만들기\r
  goal: 8단계. 모든 URL 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    배운 패턴을 함수로 만들어 여러 URL을 파싱해봅시다.\r
\r
    모든 URL이 깔끔하게 구조화되었습니다!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def parseUrl(url):\r
        pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"\r
        match = re.search(pattern, url)\r
        return match.groupdict() if match else None\r
  exercise:\r
    prompt: 8단계. 모든 URL 파싱 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def parseUrl(url):\r
          pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"\r
          match = re.search(pattern, url)\r
          return match.groupdict() if match else None\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 모든 URL 파싱의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 모든 URL 파싱 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step9_real_data\r
  title: 9단계. 샘플 데이터 적용\r
  structuredPrimary: true\r
  subtitle: 로컬 웹사이트 파싱\r
  goal: 9단계. 샘플 데이터 적용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 사용자 데이터의 웹사이트에 프로토콜을 추가하여 파싱해봅시다.\r
\r
    **이번 프로젝트 핵심:** - \`(?P<name>패턴)\` : 이름 있는 그룹 **(신규)** - \`.groupdict()\` : 딕셔너리로 변환 **(신규)** - \`re.search()\` : 첫 매칭만 **(신규)** - \`|\` : or (http|https) **(신규)** - \`( )\` : 그룹 (02에서 배움)\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fullUrls = [f"https://{user['website']}/about" for user in usersData[:5]]\r
    fullUrls[:3]\r
  exercise:\r
    prompt: 9단계. 샘플 데이터 적용 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      fullUrls = [f"https://{user['website']}/about" for user in usersData[:5]]\r
      fullUrls[:3]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 샘플 데이터 적용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 샘플 데이터 적용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: URL 파싱 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    웹 분석가가 되어 URL 구조를 분석합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    samples = [\r
        "john.doe@company.com",\r
        "admin_user@service.org",\r
        "contact@shop.co.kr"\r
    ]\r
\r
    def parse(email):\r
        pat = r"(?P<username>[\\w.]+)@(?P<domain>[\\w.]+)\\.(?P<tld>\\w+)"\r
        match = re.search(pat, email)\r
        return match.groupdict() if match else None\r
\r
    parse(samples[0])\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      samples = [\r
          "john.doe@company.com",\r
          "admin_user@service.org",\r
          "contact@shop.co.kr"\r
      ]\r
\r
      def parse(email):\r
          pat = r"(?P<username>[\\w.]+)@(?P<domain>[\\w.]+)\\.(?P<tld>\\w+)"\r
          match = re.search(pat, email)\r
          return match.groupdict() if match else None\r
\r
      parse(samples[0])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 세 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 이름 있는 그룹과 re.search()를 배웠습니다. 복잡한 텍스트 구조를 딕셔너리로 분해할 수 있습니다.\r
  - type: list\r
    items:\r
    - (?P<name>패턴) - 이름 있는 그룹\r
    - .groupdict() - 딕셔너리로 변환\r
    - re.search() - 첫 매칭만 찾기\r
    - '| - or 연산자 (http|https)'\r
  - type: text\r
    content: 다음 프로젝트에서는 HTML 태그를 제거하는 방법을 배웁니다!\r
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 예측 → 패턴 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 정규표현식은 한 번 매칭되면 끝나는 문법이 아니라, 입력 텍스트를 정제하고 실패 패턴을 확인한 뒤 결과를 검증하는 반복 작업입니다. 여기서는 이메일과 전화번호를\r
    추출하고, 잘못된 패턴과 빈 입력을 안전하게 처리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
\r
    contactText = '''\r
    김개발 <kim@example.com> 010-1234-5678\r
    lee@company.co.kr / 02-987-6543\r
    잘못된 주소: hello@ / 번호: 12345\r
    '''\r
\r
    emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')\r
    phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')\r
\r
    emails = emailPattern.findall(contactText)\r
    phones = phonePattern.findall(contactText)\r
\r
    assert emails == ['kim@example.com', 'lee@company.co.kr']\r
    assert phones == ['010-1234-5678', '02-987-6543']\r
    emails, phones\r
  exercise:\r
    prompt: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import re\r
\r
      contactText = '''\r
      김개발 <kim@example.com> 010-1234-5678\r
      lee@company.co.kr / 02-987-6543\r
      잘못된 주소: hello@ / 번호: 12345\r
      '''\r
\r
      emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')\r
      phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')\r
\r
      emails = emailPattern.findall(contactText)\r
      phones = phonePattern.findall(contactText)\r
\r
      assert emails == ['kim@example.com', 'lee@company.co.kr']\r
      assert phones == ['010-1234-5678', '02-987-6543']\r
      emails, phones\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 결과의 추출 개수와 매치 문자열이 본문 기대값과 같아야 합니다.'\r
`;export{e as default};