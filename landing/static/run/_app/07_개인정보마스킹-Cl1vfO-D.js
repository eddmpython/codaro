var e=`meta:\r
  id: regex_07\r
  title: 개인정보마스킹\r
  order: 7\r
  category: regex\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 개인정보\r
  - 마스킹\r
  - 역참조\r
  - 보안\r
  - GDPR\r
  seo:\r
    title: 정규표현식 중급 - 개인정보 마스킹\r
    description: 정규표현식으로 주민번호, 카드번호, 계좌번호를 자동 마스킹합니다. 역참조, 부분 치환을 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - 개인정보\r
    - 마스킹\r
    - 역참조\r
intro:\r
  emoji: 🔐\r
  goal: 주민번호, 카드번호, 계좌번호를 자동으로 마스킹합니다.\r
  description: GDPR, 개인정보보호법 준수를 위한 필수 기술입니다. 역참조로 일부만 남기고 나머지를 마스킹하는 방법을 배웁니다.\r
  direction: 개인정보마스킹에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - 개인정보마스킹 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 개인정보 샘플 데이터 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 주민번호 마스킹 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 개인정보마스킹 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 개인정보마스킹 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: 개인정보마스킹 완료\r
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
- id: step2_sample_data\r
  title: 2단계. 개인정보 샘플 데이터\r
  structuredPrimary: true\r
  subtitle: 가상의 개인정보\r
  goal: 2단계. 개인정보 샘플 데이터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실습을 위한 가상의 개인정보 데이터를 준비합니다. 실제 서비스에서는 절대 실제 개인정보를 사용하면 안 됩니다. 로그 파일, 개발 환경, 테스트 데이터에도 가상의 정보만 사용해야 개인정보보호법을 준수할 수 있습니다.\r
\r
    개인정보 보호의 중요성\r
    실제 서비스에서는 개인정보를 로그, 화면에 노출하면 안 됩니다. - 로그 파일에 기록 전 자동 마스킹 - 화면 표시 시 일부만 표시 - 개발/테스트 환경에서도 실제 데이터 사용 금지\r
  tips:\r
  - 개인정보 보호의 중요성 실제 서비스에서는 개인정보를 로그, 화면에 노출하면 안 됩니다. - 로그 파일에 기록 전 자동 마스킹 - 화면 표시 시 일부만 표시 - 개발/테스트 환경에서도\r
    실제 데이터 사용 금지\r
  snippet: |-\r
    personalData = """\r
    이름: 김철수\r
    주민번호: 901225-1234567\r
    카드번호: 1234-5678-9012-3456\r
    계좌번호: 110-123-456789\r
    전화번호: 010-1234-5678\r
\r
    이름: 이영희\r
    주민번호: 850315-2345678\r
    카드번호: 9876-5432-1098-7654\r
    계좌번호: 020-987-654321\r
    전화번호: 010-9876-5432\r
    """\r
    personalData\r
  exercise:\r
    prompt: 2단계. 개인정보 샘플 데이터 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      personalData = """\r
      이름: 김철수\r
      주민번호: 901225-1234567\r
      카드번호: 1234-5678-9012-3456\r
      계좌번호: 110-123-456789\r
      전화번호: 010-1234-5678\r
\r
      이름: 이영희\r
      주민번호: 850315-2345678\r
      카드번호: 9876-5432-1098-7654\r
      계좌번호: 020-987-654321\r
      전화번호: 010-9876-5432\r
      """\r
      personalData\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 개인정보 샘플 데이터의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 개인정보 샘플 데이터의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_mask_resident\r
  title: 3단계. 주민번호 마스킹\r
  structuredPrimary: true\r
  subtitle: 뒷자리 전체 숨기기\r
  goal: 3단계. 주민번호 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    주민번호 뒷자리 7자리를 모두 *로 마스킹합니다. 주민번호는 XXXXXX-YYYYYYY 형식으로, 앞 6자리는 생년월일, 뒷 7자리는 성별과 고유번호입니다. 뒷자리를 마스킹하면 생년월일 정보는 유지하면서 개인 식별을 방지할 수 있습니다.\r
\r
    역참조로 부분 유지\r
    - \`\\1\` : 첫 번째 그룹(앞자리 6자리) 유지 - \`-*******\` : 하이픈 + 별표 7개 - 앞자리는 그대로, 뒷자리만 마스킹\r
  tips:\r
  - '역참조로 부분 유지 - \`\\1\` : 첫 번째 그룹(앞자리 6자리) 유지 - \`-*******\` : 하이픈 + 별표 7개 - 앞자리는 그대로, 뒷자리만 마스킹'\r
  snippet: |-\r
    pattern = r"(\\d{6})-(\\d{7})"\r
\r
    test = "주민번호: 901225-1234567"\r
    re.findall(pattern, test)\r
  exercise:\r
    prompt: 3단계. 주민번호 마스킹 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{6})-(\\d{7})"\r
\r
      test = "주민번호: 901225-1234567"\r
      re.findall(pattern, test)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 주민번호 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 주민번호 마스킹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_mask_card\r
  title: 4단계. 카드번호 마스킹\r
  structuredPrimary: true\r
  subtitle: 중간 2개 그룹 숨기기\r
  goal: 4단계. 카드번호 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    카드번호는 첫 4자리와 마지막 4자리만 표시합니다. 카드번호는 16자리로, 처음 6자리는 카드사 식별번호(BIN), 마지막 4자리는 확인용으로 노출해도 비교적 안전합니다. 중간 8자리를 마스킹하면 결제 영수증이나 알림에 사용할 수 있습니다.\r
\r
    여러 그룹 참조\r
    - \`\\1\` : 첫 번째 그룹 (1234) - \`****\` : 별표로 대체 - \`\\4\` : 네 번째 그룹 (3456) 그룹 2, 3은 사용하지 않고 별표로 대체!\r
  tips:\r
  - '여러 그룹 참조 - \`\\1\` : 첫 번째 그룹 (1234) - \`****\` : 별표로 대체 - \`\\4\` : 네 번째 그룹 (3456) 그룹 2, 3은 사용하지 않고 별표로 대체!'\r
  snippet: |-\r
    pattern = r"(\\d{4})-(\\d{4})-(\\d{4})-(\\d{4})"\r
    replacement = r"\\1-****-****-\\4"\r
\r
    test = "카드: 1234-5678-9012-3456"\r
    re.sub(pattern, replacement, test)\r
  exercise:\r
    prompt: 4단계. 카드번호 마스킹 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{4})-(\\d{4})-(\\d{4})-(\\d{4})"\r
      replacement = r"\\1-****-****-\\4"\r
\r
      test = "카드: 1234-5678-9012-3456"\r
      re.sub(pattern, replacement, test)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 카드번호 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 카드번호 마스킹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_mask_account\r
  title: 5단계. 계좌번호 마스킹\r
  structuredPrimary: true\r
  subtitle: 마지막 3자리만 표시\r
  goal: 5단계. 계좌번호 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    계좌번호는 마지막 3자리만 남기고 마스킹합니다.\r
\r
    결과: 계좌: ***-***-***789\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r"(\\d{3})-(\\d{3})-(\\d{3})(\\d{3})"\r
    replacement = r"***-***-***\\4"\r
\r
    test = "계좌: 110-123-456789"\r
    re.sub(pattern, replacement, test)\r
  exercise:\r
    prompt: 5단계. 계좌번호 마스킹 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{3})-(\\d{3})-(\\d{3})(\\d{3})"\r
      replacement = r"***-***-***\\4"\r
\r
      test = "계좌: 110-123-456789"\r
      re.sub(pattern, replacement, test)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 계좌번호 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 계좌번호 마스킹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_backreference\r
  title: 6단계. 역참조 심화\r
  structuredPrimary: true\r
  subtitle: 반복 패턴 찾기\r
  goal: 6단계. 역참조 심화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    역참조는 같은 패턴이 반복될 때도 사용할 수 있습니다.\r
\r
    역참조 사용\r
    **패턴: \\\\1** \`\\b(\\w+)\\s+\\1\\b\`: - \`(\\w+)\` : 단어를 그룹 1로 캡처 - \`\\s+\` : 공백 1개 이상 - \`\\1\` : 그룹 1과 **동일한** 단어 - \`\\b\` : 단어 경계 "정말 정말", "반드시 반드시" 같은 반복을 찾습니다!\r
  tips:\r
  - '역참조 사용 **패턴: \\\\1** \`\\b(\\w+)\\s+\\1\\b\`: - \`(\\w+)\` : 단어를 그룹 1로 캡처 - \`\\s+\` : 공백 1개 이상 - \`\\1\` : 그룹 1과 **동일한**\r
    단어 - \`\\b\` : 단어 경계 "정말 정말", "반드시 반드시" 같은 반복을 찾습니다!'\r
  snippet: |-\r
    pattern = r"\\b(\\w+)\\s+\\1\\b"\r
\r
    test = "정말 정말 중요한 사항입니다. 반드시 반드시 확인하세요."\r
    matches = re.findall(pattern, test)\r
    matches\r
  exercise:\r
    prompt: 6단계. 역참조 심화 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"\\b(\\w+)\\s+\\1\\b"\r
\r
      test = "정말 정말 중요한 사항입니다. 반드시 반드시 확인하세요."\r
      matches = re.findall(pattern, test)\r
      matches\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 역참조 심화의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 역참조 심화의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step7_complete_masking\r
  title: 7단계. 완성된 마스킹 함수\r
  structuredPrimary: true\r
  subtitle: 모든 개인정보 자동 마스킹\r
  goal: 7단계. 완성된 마스킹 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 배운 패턴을 모두 합쳐 완성된 마스킹 함수를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def maskPersonalInfo(text):\r
        text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)\r
\r
        text = re.sub(r"(\\d{4})-(\\d{4})-(\\d{4})-(\\d{4})", r"\\1-****-****-\\4", text)\r
\r
        text = re.sub(r"(\\d{3})-(\\d{3})-(\\d{3})(\\d{3})", r"***-***-***\\4", text)\r
\r
        text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)\r
\r
        return text\r
\r
    maskedData = maskPersonalInfo(personalData)\r
    maskedData\r
  exercise:\r
    prompt: 7단계. 완성된 마스킹 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def maskPersonalInfo(text):\r
          text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)\r
\r
          text = re.sub(r"(\\d{4})-(\\d{4})-(\\d{4})-(\\d{4})", r"\\1-****-****-\\4", text)\r
\r
          text = re.sub(r"(\\d{3})-(\\d{3})-(\\d{3})(\\d{3})", r"***-***-***\\4", text)\r
\r
          text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)\r
\r
          return text\r
\r
      maskedData = maskPersonalInfo(personalData)\r
      maskedData\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 완성된 마스킹 함수의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 완성된 마스킹 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step8_selective_masking\r
  title: 8단계. 선택적 마스킹\r
  structuredPrimary: true\r
  subtitle: 필요한 부분만 마스킹\r
  goal: 8단계. 선택적 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    상황에 따라 다르게 마스킹할 수 있습니다.\r
\r
    결과: 이름: 김** (성만 표시)\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r"이름: (\\S)(\\S+)"\r
    replacement = r"이름: \\1" + "*" * 2\r
\r
    test = "이름: 김철수"\r
    re.sub(pattern, replacement, test)\r
  exercise:\r
    prompt: 8단계. 선택적 마스킹 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"이름: (\\S)(\\S+)"\r
      replacement = r"이름: \\1" + "*" * 2\r
\r
      test = "이름: 김철수"\r
      re.sub(pattern, replacement, test)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 선택적 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 선택적 마스킹의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step9_log_masking\r
  title: 9단계. 로그 자동 마스킹\r
  structuredPrimary: true\r
  subtitle: 실전 활용\r
  goal: 9단계. 로그 자동 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    로그 파일에 개인정보가 실수로 기록되는 것을 방지합니다.\r
\r
    모든 개인정보가 자동으로 마스킹되어 안전하게 로그에 기록됩니다!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def safeLog(message):\r
        masked = maskPersonalInfo(message)\r
        return f"[LOG] {masked}"\r
\r
    logMessages = [\r
        "사용자 로그인: 주민번호 901225-1234567",\r
        "결제 완료: 카드 1234-5678-9012-3456",\r
        "계좌 이체: 110-123-456789 → 020-987-654321"\r
    ]\r
\r
    safeLogs = [safeLog(msg) for msg in logMessages]\r
    safeLogs\r
  exercise:\r
    prompt: 9단계. 로그 자동 마스킹 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def safeLog(message):\r
          masked = maskPersonalInfo(message)\r
          return f"[LOG] {masked}"\r
\r
      logMessages = [\r
          "사용자 로그인: 주민번호 901225-1234567",\r
          "결제 완료: 카드 1234-5678-9012-3456",\r
          "계좌 이체: 110-123-456789 → 020-987-654321"\r
      ]\r
\r
      safeLogs = [safeLog(msg) for msg in logMessages]\r
      safeLogs\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 로그 자동 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 로그 자동 마스킹 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 10단계. 보안 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 잔존 탐지 → 오류 수정 → 운영 정책\r
  goal: 10단계. 보안 검증 루프에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    개인정보 마스킹은 화면에 별표가 보인다고 끝나는 작업이 아닙니다. 원문 주민번호, 카드번호, 계좌번호, 전화번호가 결과에 남아 있지 않은지 자동으로 검사해야 합니다. 이번 단계에서는 마스킹 후 원문 패턴이 0개 남을 것이라고 먼저 예측합니다. 그다음 일부러 깨진 마스킹 결과를 넣어 검증 함수가 실패하는지 확인하고, 운영 로그 정책에 맞게 재사용 가능한 함수로 고칩니다.\r
\r
    보안 커리큘럼은 마스킹 함수를 만드는 데서 멈추면 부족합니다. 원문 패턴이 남지 않는지 검사하는 검증 함수까지 있어야 업무 로그와 리포트에 안전하게 적용할 수 있습니다.\r
  snippet: |-\r
    sensitivePatterns = {\r
        "residentNumber": r"\\d{6}-\\d{7}",\r
        "cardNumber": r"\\d{4}-\\d{4}-\\d{4}-\\d{4}",\r
        "accountNumber": r"\\b\\d{3}-\\d{3}-\\d{6}\\b",\r
        "phoneNumber": r"\\b010-\\d{3,4}-\\d{4}\\b",\r
    }\r
\r
    def findSensitiveLeaks(text):\r
        return {\r
            name: re.findall(pattern, text)\r
            for name, pattern in sensitivePatterns.items()\r
            if re.findall(pattern, text)\r
        }\r
\r
    predictedLeakCount = 0\r
    leaks = findSensitiveLeaks(maskedData)\r
\r
    assert len(leaks) == predictedLeakCount, leaks\r
    leaks\r
  exercise:\r
    prompt: 10단계. 보안 검증 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      sensitivePatterns = {\r
          "residentNumber": r"\\d{6}-\\d{7}",\r
          "cardNumber": r"\\d{4}-\\d{4}-\\d{4}-\\d{4}",\r
          "accountNumber": r"\\b\\d{3}-\\d{3}-\\d{6}\\b",\r
          "phoneNumber": r"\\b010-\\d{3,4}-\\d{4}\\b",\r
      }\r
\r
      def findSensitiveLeaks(text):\r
          return {\r
              name: re.findall(pattern, text)\r
              for name, pattern in sensitivePatterns.items()\r
              if re.findall(pattern, text)\r
          }\r
\r
      predictedLeakCount = 0\r
      leaks = findSensitiveLeaks(maskedData)\r
\r
      assert len(leaks) == predictedLeakCount, leaks\r
      leaks\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 보안 검증 루프의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 보안 검증 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 개인정보 마스킹 프로젝트\r
  goal: 보안 담당자가 되어 이름/이메일/전화번호/주민번호 같은 개인정보를 정규식 치환으로 마스킹하는 미션을 풀어 봅니다.\r
  why: 로그/덤프/분석 데이터에 개인정보가 그대로 남으면 컴플라이언스 사고가 됩니다. 정규식 마스킹은 가장 가볍고 빠른 첫 방어선이라 손에 익혀 둬야 합니다.\r
  explanation: |-\r
    보안 담당자가 되어 개인정보를 안전하게 마스킹합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    text = """\r
    담당자: john.doe@company.com\r
    CC: admin@service.org\r
    수신: contact.person@shop.co.kr\r
    """\r
\r
    def mask(match):\r
        user = match.group(1)\r
        domain = match.group(2)\r
        if len(user) <= 2:\r
            out = user[0] + "*"\r
        else:\r
            out = user[:2] + "*" * (len(user) - 2)\r
        return f"{out}@{domain}"\r
\r
    pat = re.compile(r"([\\w.]+)@([\\w.]+)")\r
    result = pat.sub(mask, text)\r
    result\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      text = """\r
      담당자: john.doe@company.com\r
      CC: admin@service.org\r
      수신: contact.person@shop.co.kr\r
      """\r
\r
      def mask(match):\r
          user = match.group(1)\r
          domain = match.group(2)\r
          if len(user) <= 2:\r
              out = user[0] + "*"\r
          else:\r
              out = user[:2] + "*" * (len(user) - 2)\r
          return f"{out}@{domain}"\r
\r
      pat = re.compile(r"([\\w.]+)@([\\w.]+)")\r
      result = pat.sub(mask, text)\r
      result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 일곱 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 역참조로 개인정보를 마스킹하는 방법을 배웠습니다. GDPR, 개인정보보호법 준수에 필수적인 기술입니다.\r
  - type: list\r
    items:\r
    - \\1, \\2 - 그룹 역참조\r
    - 부분 마스킹 - 일부는 유지, 나머지는 *로\r
    - 함수로 복잡한 마스킹 처리\r
    - re.compile() - 패턴 재사용\r
  - type: text\r
    content: 다음 프로젝트에서는 LLM 전처리를 위한 텍스트 정제와 토큰화를 배웁니다!\r
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
`;export{e as default};