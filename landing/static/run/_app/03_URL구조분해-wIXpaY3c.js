var e=`meta:
  id: regex_03
  title: URL구조분해
  order: 3
  category: regex
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - URL
  - 이름 있는 그룹
  - search
  - 파싱
  - 로컬 샘플
  seo:
    title: 정규표현식 기초 - URL 구조 분해
    description: 정규표현식으로 URL을 프로토콜, 도메인, 경로, 쿼리로 분해합니다. 이름 있는 그룹, re.search를 배웁니다.
    keywords:
    - 정규표현식
    - regex
    - URL 파싱
    - 이름 있는 그룹
    - re.search
intro:
  emoji: 🔗
  goal: URL을 프로토콜, 도메인, 경로, 쿼리스트링으로 분해합니다.
  description: 이전 프로젝트에서 배운 그룹에 이름을 붙여 더 명확하게 사용하는 방법을 배웁니다. URL 파싱으로 웹 데이터 처리의 기초를 다집니다.
  direction: URL구조분해에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.
  - URL구조분해 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 완전한 URL 만들기 결과 검증
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.
    - label: URL구조분해 재사용
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.
    runtime:
    - label: 텍스트 정제 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: URL구조분해 실행
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.
    - label: URL구조분해 완료
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 이전과 동일하게 필요한 모듈을 불러옵니다. 이번 프로젝트에서는 이름 있는 그룹(named group)이라는 새로운 개념을 배웁니다. 숫자 대신 이름으로 그룹을
    참조하면 코드 가독성이 높아지고, 복잡한 패턴도 쉽게 관리할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import re
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import re
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: 로컬 웹사이트 확인
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    로컬 사용자 샘플에서 웹사이트 주소를 가져옵니다. URL 파싱은 웹 크롤링, 링크 분석, SEO 최적화 등 웹 개발의 다양한 분야에서 사용됩니다. 정규표현식으로 URL 구조를 이해하면 외부 라이브러리 없이도 URL을 효과적으로 처리할 수 있습니다.

    확인된 웹사이트들: - docs.codaro.local - analytics.dataworks.com - automation.codaro.io - insightlab.kr - support.sample.org 프로토콜이 없는 도메인만 있네요. 실습을 위해 완전한 URL을 만들어봅시다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    usersData = [
        {"name": "Hana Kim", "website": "docs.codaro.local"},
        {"name": "Min Park", "website": "analytics.dataworks.com"},
        {"name": "Jae Lee", "website": "automation.codaro.io"},
        {"name": "Soo Choi", "website": "insightlab.kr"},
        {"name": "Yuna Jung", "website": "support.sample.org"},
        {"name": "Alex Morgan", "website": "platform.service.net"},
    ]

    usersData[:2]
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      usersData = [
          {"name": "Hana Kim", "website": "docs.codaro.local"},
          {"name": "Min Park", "website": "analytics.dataworks.com"},
          {"name": "Jae Lee", "website": "automation.codaro.io"},
          {"name": "Soo Choi", "website": "insightlab.kr"},
          {"name": "Yuna Jung", "website": "support.sample.org"},
          {"name": "Alex Morgan", "website": "platform.service.net"},
      ]

      usersData[:2]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 2단계. 데이터 불러오기의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step3_create_full_url
  title: 3단계. 완전한 URL 만들기
  structuredPrimary: true
  subtitle: 테스트 데이터 준비
  goal: 3단계. 완전한 URL 만들기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 3단계. 완전한 URL 만들기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    testUrls = [
        "https://www.example.com/path/to/page",
        "http://blog.site.org/posts/123",
        "https://api.service.io/v1/users?id=5&name=john",
        "http://shop.example.com/products/item-456?category=books",
        "https://subdomain.site.co.kr/search?q=python&page=2"
    ]
    testUrls[0]
  exercise:
    prompt: 3단계. 완전한 URL 만들기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      testUrls = [
          "https://www.example.com/path/to/page",
          "http://blog.site.org/posts/123",
          "https://api.service.io/v1/users?id=5&name=john",
          "http://shop.example.com/products/item-456?category=books",
          "https://subdomain.site.co.kr/search?q=python&page=2"
      ]
      testUrls[0]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 3단계. 완전한 URL 만들기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 3단계. 완전한 URL 만들기의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step4_basic_pattern
  title: 4단계. 기본 URL 패턴
  structuredPrimary: true
  subtitle: 프로토콜과 도메인 추출
  goal: 4단계. 기본 URL 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    먼저 간단한 패턴으로 프로토콜과 도메인을 추출해봅시다. URL의 각 부분을 그룹으로 캡처하면 나중에 개별적으로 접근할 수 있습니다. http:// 또는 https://로 시작하고, 도메인이 이어지는 기본 구조부터 파악합니다.

    패턴 해석
    **패턴: (https?)://([\\w.-]+)** - \`(https?)\` : **그룹 1** - http 또는 https (s는 선택적) - \`://\` : :// 리터럴 - \`([\\w.-]+)\` : **그룹 2** - 도메인 (단어문자, 마침표, 하이픈 1개 이상)
  tips:
  - '패턴 해석 **패턴: (https?)://([\\w.-]+)** - \`(https?)\` : **그룹 1** - http 또는 https (s는 선택적) - \`://\` : ://
    리터럴 - \`([\\w.-]+)\` : **그룹 2** - 도메인 (단어문자, 마침표, 하이픈 1개 이상)'
  snippet: |-
    pattern = r"(https?)://([\\w.-]+)"

    match = re.search(pattern, testUrls[0])
    match.groups()
  exercise:
    prompt: 4단계. 기본 URL 패턴 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      pattern = r"(https?)://([\\w.-]+)"

      match = re.search(pattern, testUrls[0])
      match.groups()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 기본 URL 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 4단계. 기본 URL 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step5_named_groups
  title: 5단계. 이름 있는 그룹
  structuredPrimary: true
  subtitle: (?P<name>) 문법
  goal: 5단계. 이름 있는 그룹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    그룹에 번호 대신 이름을 붙이면 더 명확합니다. (?P<이름>패턴) 형식으로 작성합니다.

    이름 있는 그룹: (?P<name>패턴)
    - \`(?P<protocol>https?)\` : protocol이라는 이름의 그룹 - \`(?P<domain>[\\w.-]+)\` : domain이라는 이름의 그룹 - \`match.groupdict()\` : 딕셔너리로 반환 {'protocol': 'https', 'domain': '...'} - \`match.group('protocol')\` : 이름으로 접근 가능
  tips:
  - '이름 있는 그룹: (?P<name>패턴) - \`(?P<protocol>https?)\` : protocol이라는 이름의 그룹 - \`(?P<domain>[\\w.-]+)\` : domain이라는
    이름의 그룹 - \`match.groupdict()\` : 딕셔너리로 반환 {''protocol'': ''https'', ''domain'': ''...''} - \`match.group(''protocol'')\`
    : 이름으로 접근 가능'
  snippet: |-
    pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)"

    match = re.search(pattern, testUrls[0])
    match.groupdict()
  exercise:
    prompt: 5단계. 이름 있는 그룹 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)"

      match = re.search(pattern, testUrls[0])
      match.groupdict()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 이름 있는 그룹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 5단계. 이름 있는 그룹의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step6_complete_pattern
  title: 6단계. 완전한 URL 패턴
  structuredPrimary: true
  subtitle: 경로와 쿼리스트링 추가
  goal: 6단계. 완전한 URL 패턴에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 6단계. 완전한 URL 패턴의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"

    testUrl = testUrls[2]
    match = re.search(pattern, testUrl)
    match.groupdict()
  exercise:
    prompt: 6단계. 완전한 URL 패턴 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"

      testUrl = testUrls[2]
      match = re.search(pattern, testUrl)
      match.groupdict()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 완전한 URL 패턴의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 6단계. 완전한 URL 패턴의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step7_re_search_vs_findall
  title: 7단계. re.search() 이해하기
  structuredPrimary: true
  subtitle: findall과의 차이
  goal: 7단계. re.search() 이해하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    지금까지 사용한 re.search는 findall과 어떻게 다를까요?

    re.search() vs re.findall()
    **re.search(패턴, 텍스트)**: - 첫 번째 매칭만 찾음 - Match 객체 반환 - .group(), .groupdict() 사용 가능 **re.findall(패턴, 텍스트)**: - 모든 매칭 찾음 - 리스트 반환 - 그룹이 있으면 튜플 리스트 URL 파싱처럼 구조를 분해할 때는 search가 적합합니다.
  tips:
  - 're.search() vs re.findall() **re.search(패턴, 텍스트)**: - 첫 번째 매칭만 찾음 - Match 객체 반환 - .group(), .groupdict()
    사용 가능 **re.findall(패턴, 텍스트)**: - 모든 매칭 찾음 - 리스트 반환 - 그룹이 있으면 튜플 리스트 URL 파싱처럼 구조를 분해할 때는 search가 적합합니다.'
  snippet: |-
    multiUrl = "방문: https://site1.com/page 그리고 http://site2.org/other"

    searchResult = re.search(r"(https?)://([\\w.]+)", multiUrl)
    findallResult = re.findall(r"(https?)://([\\w.]+)", multiUrl)

    f"search: {searchResult.groups() if searchResult else None}\\nfindall: {findallResult}"
  exercise:
    prompt: 7단계. re.search() 이해하기 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.
    starterCode: |-
      multiUrl = "방문: https://site1.com/page 그리고 http://site2.org/other"

      searchResult = re.search(r"(https?)://([\\w.]+)", multiUrl)
      findallResult = re.findall(r"(https?)://([\\w.]+)", multiUrl)

      f"search: {searchResult.groups() if searchResult else None}\\nfindall: {findallResult}"
    hints:
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.
  check:
    type: noError
    noError: 7단계. re.search() 이해하기의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.
    resultCheck: 7단계. re.search() 이해하기 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.
- id: step8_parse_all
  title: 8단계. 모든 URL 파싱
  structuredPrimary: true
  subtitle: 함수로 만들기
  goal: 8단계. 모든 URL 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    배운 패턴을 함수로 만들어 여러 URL을 파싱해봅시다.

    모든 URL이 깔끔하게 구조화되었습니다!
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def parseUrl(url):
        pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"
        match = re.search(pattern, url)
        return match.groupdict() if match else None
  exercise:
    prompt: 8단계. 모든 URL 파싱 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def parseUrl(url):
          pattern = r"(?P<protocol>https?)://(?P<domain>[\\w.-]+)(?P<path>/[\\w/-]*)(?P<query>\\?[\\w=&-]*)?"
          match = re.search(pattern, url)
          return match.groupdict() if match else None
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 모든 URL 파싱의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 8단계. 모든 URL 파싱 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step9_real_data
  title: 9단계. 샘플 데이터 적용
  structuredPrimary: true
  subtitle: 로컬 웹사이트 파싱
  goal: 9단계. 샘플 데이터 적용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    실제 사용자 데이터의 웹사이트에 프로토콜을 추가하여 파싱해봅시다.

    **이번 프로젝트 핵심:** - \`(?P<name>패턴)\` : 이름 있는 그룹 **(신규)** - \`.groupdict()\` : 딕셔너리로 변환 **(신규)** - \`re.search()\` : 첫 매칭만 **(신규)** - \`|\` : or (http|https) **(신규)** - \`( )\` : 그룹 (02에서 배움)
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    fullUrls = [f"https://{user['website']}/about" for user in usersData[:5]]
    fullUrls[:3]
  exercise:
    prompt: 9단계. 샘플 데이터 적용 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      fullUrls = [f"https://{user['website']}/about" for user in usersData[:5]]
      fullUrls[:3]
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 샘플 데이터 적용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 샘플 데이터 적용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: URL 파싱 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    웹 분석가가 되어 URL 구조를 분석합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import re

    samples = [
        "john.doe@company.com",
        "admin_user@service.org",
        "contact@shop.co.kr"
    ]

    def parse(email):
        pat = r"(?P<username>[\\w.]+)@(?P<domain>[\\w.]+)\\.(?P<tld>\\w+)"
        match = re.search(pat, email)
        return match.groupdict() if match else None

    parse(samples[0])
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import re

      samples = [
          "john.doe@company.com",
          "admin_user@service.org",
          "contact@shop.co.kr"
      ]

      def parse(email):
          pat = r"(?P<username>[\\w.]+)@(?P<domain>[\\w.]+)\\.(?P<tld>\\w+)"
          match = re.search(pat, email)
          return match.groupdict() if match else None

      parse(samples[0])
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: summary
  title: 정리
  subtitle: 세 번째 프로젝트 완료!
  blocks:
  - type: text
    content: 이번 프로젝트에서는 이름 있는 그룹과 re.search()를 배웠습니다. 복잡한 텍스트 구조를 딕셔너리로 분해할 수 있습니다.
  - type: list
    items:
    - (?P<name>패턴) - 이름 있는 그룹
    - .groupdict() - 딕셔너리로 변환
    - re.search() - 첫 매칭만 찾기
    - '| - or 연산자 (http|https)'
  - type: text
    content: 다음 프로젝트에서는 HTML 태그를 제거하는 방법을 배웁니다!
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
- id: workflow_validation
  title: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인'
  structuredPrimary: true
  subtitle: 예측 → 패턴 실행 → 오류 수정 → 검증 → 실무 변주
  goal: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 정규표현식은 한 번 매칭되면 끝나는 문법이 아니라, 입력 텍스트를 정제하고 실패 패턴을 확인한 뒤 결과를 검증하는 반복 작업입니다. 여기서는 이메일과 전화번호를
    추출하고, 잘못된 패턴과 빈 입력을 안전하게 처리합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import re

    contactText = '''
    김개발 <kim@example.com> 010-1234-5678
    lee@company.co.kr / 02-987-6543
    잘못된 주소: hello@ / 번호: 12345
    '''

    emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')
    phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')

    emails = emailPattern.findall(contactText)
    phones = phonePattern.findall(contactText)

    assert emails == ['kim@example.com', 'lee@company.co.kr']
    assert phones == ['010-1234-5678', '02-987-6543']
    emails, phones
  exercise:
    prompt: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import re

      contactText = '''
      김개발 <kim@example.com> 010-1234-5678
      lee@company.co.kr / 02-987-6543
      잘못된 주소: hello@ / 번호: 12345
      '''

      emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')
      phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')

      emails = emailPattern.findall(contactText)
      phones = phonePattern.findall(contactText)

      assert emails == ['kim@example.com', 'lee@company.co.kr']
      assert phones == ['010-1234-5678', '02-987-6543']
      emails, phones
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 결과의 추출 개수와 매치 문자열이 본문 기대값과 같아야 합니다.'
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: regex_03-url-structure-parse-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: URL을 전용 parser로 안전하게 구조화하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: scheme·host·port·path·query를 분리하고 fragment를 요청에서 제외한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - URL 전체를 regex group으로 재구현하지 말고 \`urllib.parse\`를 사용하세요.
    - 반복 query key를 마지막 값 하나로 덮지 마세요.
    exercise:
      prompt: parse_url_contract(url)를 완성하세요.
      starterCode: |-
        def parse_url_contract(url):
            raise NotImplementedError
      solution: |
        def parse_url_contract(url):
            from urllib.parse import parse_qsl, urlsplit
            parts = urlsplit(url)
            if parts.scheme not in {"http", "https"} or not parts.hostname:
                raise ValueError("absolute HTTP URL required")
            query = {}
            for key, value in parse_qsl(parts.query, keep_blank_values=True):
                query.setdefault(key, []).append(value)
            default_port = 443 if parts.scheme == "https" else 80
            return {"scheme": parts.scheme, "host": parts.hostname, "port": parts.port or default_port, "path": parts.path or "/", "query": query, "fragment": parts.fragment}
      hints: *id001
    check:
      id: python.regex.regex_03.url-structure-parse.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_03.url-structure-parse.mastery.behavior.v1.fixture
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
        entry: parse_url_contract
        cases:
        - id: parses-repeated-query-and-fragment
          arguments:
          - value: https://Example.test:8443/items?q=a&q=b#top
          expectedReturn:
            scheme: https
            host: example.test
            port: 8443
            path: /items
            query:
              q:
              - a
              - b
            fragment: top
        - id: applies-default-port-and-path
          arguments:
          - value: http://example.test
          expectedReturn:
            scheme: http
            host: example.test
            port: 80
            path: /
            query: {}
            fragment: ''
        - id: rejects-relative-url
          arguments:
          - value: /items?q=a
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: regex_03-url-redaction-policy-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_03-url-structure-parse-mastery
    title: 새 URL 로그에 query secret 제거 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 민감 query 값을 redacted marker로 바꾸고 제거된 key를 보고한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - URL을 로그에 쓰기 전에 token·key query를 이름 기준으로 제거하세요.
    - fragment는 서버 요청 증거가 아니므로 보존 목적을 명시하지 않으면 제거하세요.
    exercise:
      prompt: redact_url_query(url, secret_keys)를 완성하세요.
      starterCode: |-
        def redact_url_query(url, secret_keys):
            raise NotImplementedError
      solution: |
        def redact_url_query(url, secret_keys):
            from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
            parts = urlsplit(url)
            secrets = {key.lower() for key in secret_keys}
            redacted_keys = []
            pairs = []
            for key, value in parse_qsl(parts.query, keep_blank_values=True):
                if key.lower() in secrets:
                    pairs.append((key, "[REDACTED]"))
                    redacted_keys.append(key)
                else:
                    pairs.append((key, value))
            clean = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(pairs), ""))
            return {"url": clean, "redactedKeys": redacted_keys, "fragmentRemoved": bool(parts.fragment)}
      hints: *id002
    check:
      id: python.regex.regex_03.url-redaction-policy.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_03.url-redaction-policy.transfer.behavior.v1.fixture
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
        entry: redact_url_query
        cases:
        - id: redacts-token-and-removes-fragment
          arguments:
          - value: https://api.test/items?token=abc&q=hello#debug
          - value:
            - token
          expectedReturn:
            url: https://api.test/items?token=%5BREDACTED%5D&q=hello
            redactedKeys:
            - token
            fragmentRemoved: true
        - id: matches-key-case-insensitively
          arguments:
          - value: https://api.test/?API_KEY=abc
          - value:
            - api_key
          expectedReturn:
            url: https://api.test/?API_KEY=%5BREDACTED%5D
            redactedKeys:
            - API_KEY
            fragmentRemoved: false
        - id: preserves-safe-query
          arguments:
          - value: https://api.test/?page=2
          - value:
            - token
          expectedReturn:
            url: https://api.test/?page=2
            redactedKeys: []
            fragmentRemoved: false
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: regex_03-url-parsing-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_03-url-redaction-policy-transfer
    title: URL 구조 처리 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 구조 파싱·origin 판정·로그 redaction 역할을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - match 수만 보지 말고 정규화 뒤 보존된 의미와 거부된 입력을 함께 확인하세요.
    - regex가 아닌 전용 parser가 필요한 구조에서는 경계를 명시하세요.
    exercise:
      prompt: choose_url_action(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_url_action(situation):
            raise NotImplementedError
      solution: |
        def choose_url_action(situation):
            table = {'parse': {'action': 'use urlsplit and parse_qsl', 'evidence': 'scheme host path repeated query', 'risk': 'regex edge cases'}, 'authorize': {'action': 'compare normalized origin', 'evidence': 'scheme host effective port', 'risk': 'lookalike host'}, 'log': {'action': 'redact secret query and fragment', 'evidence': 'redacted key list', 'risk': 'credential leakage'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.regex.regex_03.url-parsing-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_03.url-parsing-recall.retrieval.behavior.v1.fixture
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
        entry: choose_url_action
        cases:
        - id: recalls-parse
          arguments:
          - value: parse
          expectedReturn:
            action: use urlsplit and parse_qsl
            evidence: scheme host path repeated query
            risk: regex edge cases
        - id: recalls-authorize
          arguments:
          - value: authorize
          expectedReturn:
            action: compare normalized origin
            evidence: scheme host effective port
            risk: lookalike host
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};