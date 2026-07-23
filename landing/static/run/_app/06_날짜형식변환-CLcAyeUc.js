var e=`meta:\r
  id: regex_06\r
  title: 날짜형식변환\r
  order: 6\r
  category: regex\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 날짜\r
  - 형식 변환\r
  - compile\r
  - 복잡한 패턴\r
  - 정규화\r
  seo:\r
    title: 정규표현식 중급 - 날짜 형식 변환\r
    description: 정규표현식으로 다양한 날짜 형식을 YYYY-MM-DD로 통일합니다. re.compile, 복잡한 패턴 조합을 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - 날짜 파싱\r
    - re.compile\r
    - 형식 변환\r
intro:\r
  emoji: 📅\r
  goal: 10가지 날짜 형식을 YYYY-MM-DD로 통일합니다.\r
  description: 실무에서 가장 골치아픈 작업 중 하나가 날짜 형식 통일입니다. 여러 패턴을 조합하고 re.compile로 최적화하는 방법을 배웁니다.\r
  direction: 날짜형식변환에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - 날짜형식변환 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 다양한 날짜 형식 확 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. YYYYMMDD 형식 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 날짜형식변환 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 날짜형식변환 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: 날짜형식변환 완료\r
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
- id: step2_date_formats\r
  title: 2단계. 다양한 날짜 형식 확인\r
  structuredPrimary: true\r
  subtitle: 실제 데이터의 혼란\r
  goal: 2단계. 다양한 날짜 형식 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 데이터에서는 날짜가 온갖 형식으로 저장되어 있습니다. 미국식(MM/DD/YYYY), 유럽식(DD.MM.YYYY), 아시아식(YYYY-MM-DD), 한국어(2024년 1월 1일), 영문 월명(Jan 1, 2024) 등 다양한 형식이 혼재합니다. 이런 데이터를 분석하거나 DB에 저장하려면 반드시 형식을 통일해야 합니다.\r
\r
    YYYY-MM-DD, YYYY/MM/DD, DD.MM.YYYY, 영문 월 등 10가지 형식이 섞여 있습니다. ISO 8601 표준인 YYYY-MM-DD 형식으로 통일하면 정렬, 비교, 저장이 모두 쉬워집니다. 하나씩 패턴을 만들어 변환해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mixedDates = """\r
    생년월일: 1990-12-25\r
    입사일: 2020/03/15\r
    계약일: 12.05.2023\r
    만료일: 25-12-2025\r
    등록일: Dec 25, 2024\r
    방문일: 2024년 11월 30일\r
    신청일: 15/08/2023\r
    발행일: 2023-7-9\r
    갱신일: 2024.1.5\r
    종료일: 31 Dec 2025\r
    """\r
    mixedDates\r
  exercise:\r
    prompt: 2단계. 다양한 날짜 형식 확인 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mixedDates = """\r
      생년월일: 1990-12-25\r
      입사일: 2020/03/15\r
      계약일: 12.05.2023\r
      만료일: 25-12-2025\r
      등록일: Dec 25, 2024\r
      방문일: 2024년 11월 30일\r
      신청일: 15/08/2023\r
      발행일: 2023-7-9\r
      갱신일: 2024.1.5\r
      종료일: 31 Dec 2025\r
      """\r
      mixedDates\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 다양한 날짜 형식 확인의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 다양한 날짜 형식 확인의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_pattern1_yyyymmdd\r
  title: 3단계. YYYY-MM-DD 형식 처리\r
  structuredPrimary: true\r
  subtitle: 가장 표준적인 형식\r
  goal: 3단계. YYYYMMDD 형식 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    먼저 이미 표준 형식인 YYYY-MM-DD 날짜들을 찾습니다. 변환이 필요 없는 데이터를 먼저 확인하면 어떤 형식들을 추가로 처리해야 하는지 파악할 수 있습니다. 수량자 {1,2}를 사용하면 한 자리 월/일도 매칭할 수 있습니다.\r
\r
    수량자 사용 이유\r
    **패턴: \\\\d{1,2}** - \`\\d{2}\` : 정확히 2자리 (01, 02, 12만 매칭) - \`\\d{1,2}\` : 1~2자리 (1, 9, 01, 12 모두 매칭) 실제 데이터는 선행 0이 없을 수 있으므로 {1,2} 사용!\r
  tips:\r
  - '수량자 사용 이유 **패턴: \\\\d{1,2}** - \`\\d{2}\` : 정확히 2자리 (01, 02, 12만 매칭) - \`\\d{1,2}\` : 1~2자리 (1, 9, 01, 12\r
    모두 매칭) 실제 데이터는 선행 0이 없을 수 있으므로 {1,2} 사용!'\r
  snippet: |-\r
    pattern = r"\\d{4}-\\d{1,2}-\\d{1,2}"\r
\r
    matches = re.findall(pattern, mixedDates)\r
    matches\r
  exercise:\r
    prompt: 3단계. YYYYMMDD 형식 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"\\d{4}-\\d{1,2}-\\d{1,2}"\r
\r
      matches = re.findall(pattern, mixedDates)\r
      matches\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. YYYYMMDD 형식 처리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. YYYYMMDD 형식 처리의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_pattern2_slash\r
  title: 4단계. 슬래시(/) 형식 처리\r
  structuredPrimary: true\r
  subtitle: YYYY/MM/DD 변환\r
  goal: 4단계. 슬래시(/) 형식 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    슬래시로 구분된 날짜를 하이픈으로 변환합니다. YYYY/MM/DD 형식은 연도가 앞에 있어 순서는 같고 구분자만 바꾸면 됩니다. 그룹 캡처 후 동일한 순서로 재조합하되 구분자를 하이픈으로 변경합니다.\r
\r
    2020/03/15 → 2020-03-15 로 변환되었습니다!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r"(\\d{4})/(\\d{1,2})/(\\d{1,2})"\r
    replacement = r"\\1-\\2-\\3"\r
\r
    result = re.sub(pattern, replacement, "입사일: 2020/03/15")\r
    result\r
  exercise:\r
    prompt: 4단계. 슬래시(/) 형식 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{4})/(\\d{1,2})/(\\d{1,2})"\r
      replacement = r"\\1-\\2-\\3"\r
\r
      result = re.sub(pattern, replacement, "입사일: 2020/03/15")\r
      result\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 슬래시(/) 형식 처리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 슬래시(/) 형식 처리의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_pattern3_dotdmy\r
  title: 5단계. DD.MM.YYYY 형식 처리\r
  structuredPrimary: true\r
  subtitle: 유럽식 날짜 순서 변경\r
  goal: 5단계. DD.MM.YYYY 형식 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    유럽에서 많이 쓰는 DD.MM.YYYY 형식은 일-월-년 순서입니다. YYYY-MM-DD로 변환하려면 그룹의 순서를 역순으로 바꿔야 합니다. 치환 문자열에서 \\\\3-\\\\2-\\\\1처럼 그룹 순서를 바꿔 참조하면 됩니다.\r
\r
    그룹 순서 바꾸기\r
    - 원본: \`(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})\` → 그룹 1, 2, 3 - 치환: \`\\3-\\2-\\1\` → 그룹 3, 2, 1 순서로 재배치 날짜 순서를 바꿀 때 매우 유용합니다!\r
  tips:\r
  - '그룹 순서 바꾸기 - 원본: \`(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})\` → 그룹 1, 2, 3 - 치환: \`\\3-\\2-\\1\` → 그룹 3, 2, 1 순서로 재배치\r
    날짜 순서를 바꿀 때 매우 유용합니다!'\r
  snippet: |-\r
    pattern = r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})"\r
    replacement = r"\\3-\\2-\\1"\r
\r
    result = re.sub(pattern, replacement, "계약일: 12.05.2023")\r
    result\r
  exercise:\r
    prompt: 5단계. DD.MM.YYYY 형식 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})"\r
      replacement = r"\\3-\\2-\\1"\r
\r
      result = re.sub(pattern, replacement, "계약일: 12.05.2023")\r
      result\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. DD.MM.YYYY 형식 처리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. DD.MM.YYYY 형식 처리의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_multiple_patterns\r
  title: 6단계. 여러 패턴 한 번에 처리\r
  structuredPrimary: true\r
  subtitle: 순차적 치환\r
  goal: 6단계. 여러 패턴 한 번에 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 모든 패턴을 함수로 만들어 순차적으로 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def normalizeDates(text):\r
        text = re.sub(r"(\\d{4})/(\\d{1,2})/(\\d{1,2})", r"\\1-\\2-\\3", text)\r
\r
        text = re.sub(r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
        text = re.sub(r"(\\d{1,2})-(\\d{1,2})-(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
        text = re.sub(r"(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2})", r"\\1-\\2-\\3", text)\r
\r
        text = re.sub(r"(\\d{1,2})/(\\d{1,2})/(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
        return text\r
\r
    result = normalizeDates(mixedDates)\r
    result[:300]\r
  exercise:\r
    prompt: 6단계. 여러 패턴 한 번에 처리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def normalizeDates(text):\r
          text = re.sub(r"(\\d{4})/(\\d{1,2})/(\\d{1,2})", r"\\1-\\2-\\3", text)\r
\r
          text = re.sub(r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
          text = re.sub(r"(\\d{1,2})-(\\d{1,2})-(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
          text = re.sub(r"(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2})", r"\\1-\\2-\\3", text)\r
\r
          text = re.sub(r"(\\d{1,2})/(\\d{1,2})/(\\d{4})", r"\\3-\\2-\\1", text)\r
\r
          return text\r
\r
      result = normalizeDates(mixedDates)\r
      result[:300]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 여러 패턴 한 번에 처리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 여러 패턴 한 번에 처리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step7_compile_pattern\r
  title: 7단계. re.compile로 최적화\r
  structuredPrimary: true\r
  subtitle: 패턴 재사용\r
  goal: 같은 패턴을 re.compile로 미리 컴파일해 반복 호출 시간을 줄이고, 컴파일 객체와 모듈 함수 호출의 시간 차이를 직접 측정합니다.\r
  why: re.findall 같은 모듈 함수는 호출마다 패턴을 재컴파일합니다. 핫 루프에서 같은 패턴을 수천 번 쓰면 컴파일 비용이 누적되어 컴파일 객체 재사용이 표준 최적화입니다.\r
  explanation: |-\r
    같은 패턴을 여러 번 사용할 때는 re.compile로 미리 컴파일하면 성능이 향상됩니다.\r
\r
    re.compile() 사용 이유\r
    **re.compile(패턴)**: - 패턴을 미리 컴파일하여 Pattern 객체 생성 - 같은 패턴을 여러 번 사용할 때 성능 향상 (30~50% 빠름) - \`.sub()\`, \`.findall()\`, \`.search()\` 등 메서드 사용 \`\`\`python pattern = re.compile(r"\\d+") pattern.findall(text) pattern.sub("X", text) \`\`\`\r
  tips:\r
  - 're.compile() 사용 이유 **re.compile(패턴)**: - 패턴을 미리 컴파일하여 Pattern 객체 생성 - 같은 패턴을 여러 번 사용할 때 성능 향상 (30~50%\r
    빠름) - \`.sub()\`, \`.findall()\`, \`.search()\` 등 메서드 사용 \`\`\`python pattern = re.compile(r"\\d+") pattern.findall(text)\r
    pattern.sub("X", text) \`\`\`'\r
  snippet: |-\r
    slashPattern = re.compile(r"(\\d{4})/(\\d{1,2})/(\\d{1,2})")\r
    dotPattern = re.compile(r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})")\r
\r
    text = "입사: 2020/03/15, 계약: 12.05.2023"\r
\r
    text = slashPattern.sub(r"\\1-\\2-\\3", text)\r
    text = dotPattern.sub(r"\\3-\\2-\\1", text)\r
    text\r
  exercise:\r
    prompt: 7단계. re.compile로 최적화 예제에서 이미지 크기, 색상, 임계값, 필터 설정 중 하나를 바꾸고 결과 배열을 확인하세요.\r
    starterCode: |-\r
      slashPattern = re.compile(r"(\\d{4})/(\\d{1,2})/(\\d{1,2})")\r
      dotPattern = re.compile(r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})")\r
\r
      text = "입사: 2020/03/15, 계약: 12.05.2023"\r
\r
      text = slashPattern.sub(r"\\1-\\2-\\3", text)\r
      text = dotPattern.sub(r"\\3-\\2-\\1", text)\r
      text\r
    hints:\r
    - 바꿀 지점은 이미지 로드, resize, 색공간 변환, threshold/filter 인자입니다.\r
    - 실행 뒤 shape, dtype, 채널 수, 검출 개수, 저장 파일이 바뀐 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. re.compile로 최적화의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. re.compile로 최적화 결과의 추출 개수와 매치 문자열이 본문 기대값과 같아야 합니다.\r
- id: step8_month_names\r
  title: 8단계. 영문 월 이름 처리\r
  structuredPrimary: true\r
  subtitle: Dec → 12 변환\r
  goal: 8단계. 영문 월 이름 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    "Dec 25, 2024" 같은 영문 날짜를 숫자로 변환합니다.\r
\r
    함수를 치환 인자로 사용\r
    \`re.sub(패턴, 함수, 텍스트)\`: - 두 번째 인자로 문자열 대신 함수 전달 가능 - 함수는 Match 객체를 받아 치환할 문자열 반환 - 복잡한 변환 로직 구현 가능\r
  tips:\r
  - '함수를 치환 인자로 사용 \`re.sub(패턴, 함수, 텍스트)\`: - 두 번째 인자로 문자열 대신 함수 전달 가능 - 함수는 Match 객체를 받아 치환할 문자열 반환 - 복잡한\r
    변환 로직 구현 가능'\r
  snippet: |-\r
    monthMap = {\r
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",\r
        "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",\r
        "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"\r
    }\r
  exercise:\r
    prompt: 8단계. 영문 월 이름 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      monthMap = {\r
          "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",\r
          "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",\r
          "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"\r
      }\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 영문 월 이름 처리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 영문 월 이름 처리의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step9_complete_converter\r
  title: 9단계. 완성된 날짜 변환기\r
  structuredPrimary: true\r
  subtitle: 모든 형식 처리\r
  goal: 9단계. 완성된 날짜 변환기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 배운 모든 패턴을 합쳐 완성된 변환기를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    MONTH_NAME_PATTERN = r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec"\r
    monthMap = {\r
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",\r
        "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",\r
        "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",\r
    }\r
\r
    def formatDate(year, month, day):\r
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"\r
\r
    def convertAllDates(text):\r
        text = re.sub(\r
            r"(\\d{4})/(\\d{1,2})/(\\d{1,2})",\r
            lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})",\r
            lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{1,2})-(\\d{1,2})-(\\d{4})",\r
            lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2})",\r
            lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{1,2})/(\\d{1,2})/(\\d{4})",\r
            lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
            text,\r
        )\r
        text = re.sub(\r
            rf"({MONTH_NAME_PATTERN}) (\\d{{1,2}}), (\\d{{4}})",\r
            lambda match: formatDate(match.group(3), monthMap[match.group(1)], match.group(2)),\r
            text,\r
        )\r
        text = re.sub(\r
            rf"(\\d{{1,2}}) ({MONTH_NAME_PATTERN}) (\\d{{4}})",\r
            lambda match: formatDate(match.group(3), monthMap[match.group(2)], match.group(1)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{4})년 (\\d{1,2})월 (\\d{1,2})일",\r
            lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
            text,\r
        )\r
        text = re.sub(\r
            r"(\\d{4})-(\\d{1,2})-(\\d{1,2})",\r
            lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
            text,\r
        )\r
        return text\r
\r
    result = convertAllDates(mixedDates)\r
    result\r
  exercise:\r
    prompt: 9단계. 완성된 날짜 변환기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      MONTH_NAME_PATTERN = r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec"\r
      monthMap = {\r
          "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",\r
          "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",\r
          "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",\r
      }\r
\r
      def formatDate(year, month, day):\r
          return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"\r
\r
      def convertAllDates(text):\r
          text = re.sub(\r
              r"(\\d{4})/(\\d{1,2})/(\\d{1,2})",\r
              lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})",\r
              lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{1,2})-(\\d{1,2})-(\\d{4})",\r
              lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{4})\\.(\\d{1,2})\\.(\\d{1,2})",\r
              lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{1,2})/(\\d{1,2})/(\\d{4})",\r
              lambda match: formatDate(match.group(3), match.group(2), match.group(1)),\r
              text,\r
          )\r
          text = re.sub(\r
              rf"({MONTH_NAME_PATTERN}) (\\d{{1,2}}), (\\d{{4}})",\r
              lambda match: formatDate(match.group(3), monthMap[match.group(1)], match.group(2)),\r
              text,\r
          )\r
          text = re.sub(\r
              rf"(\\d{{1,2}}) ({MONTH_NAME_PATTERN}) (\\d{{4}})",\r
              lambda match: formatDate(match.group(3), monthMap[match.group(2)], match.group(1)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{4})년 (\\d{1,2})월 (\\d{1,2})일",\r
              lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
              text,\r
          )\r
          text = re.sub(\r
              r"(\\d{4})-(\\d{1,2})-(\\d{1,2})",\r
              lambda match: formatDate(match.group(1), match.group(2), match.group(3)),\r
              text,\r
          )\r
          return text\r
\r
      result = convertAllDates(mixedDates)\r
      result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 완성된 날짜 변환기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 완성된 날짜 변환기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_extract_dates\r
  title: 10단계. 날짜만 추출\r
  structuredPrimary: true\r
  subtitle: 최종 결과 확인\r
  goal: 10단계. 날짜만 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    변환된 텍스트에서 표준 형식의 날짜만 추출합니다.\r
\r
    모든 날짜가 YYYY-MM-DD 형식으로 통일되었습니다!\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    converted = convertAllDates(mixedDates)\r
    standardDates = re.findall(r"\\d{4}-\\d{2}-\\d{2}", converted)\r
    standardDates\r
  exercise:\r
    prompt: 10단계. 날짜만 추출 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      converted = convertAllDates(mixedDates)\r
      standardDates = re.findall(r"\\d{4}-\\d{2}-\\d{2}", converted)\r
      standardDates\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 날짜만 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 날짜만 추출의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: workflow_validation\r
  title: 11단계. 날짜 정규화 검증 루프\r
  structuredPrimary: true\r
  subtitle: 누락과 0-padding을 검증\r
  goal: 11단계. 날짜 정규화 검증 루프에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 날짜 정제는 눈으로 결과를 훑으면 누락을 놓치기 쉽습니다. 변환 후 날짜 개수, 정확한 YYYY-MM-DD 형식, 한 자리 월/일의 0-padding, 영문\r
    일-월-연도 형식까지 검증해야 업무 데이터로 쓸 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    standardDatePattern = re.compile(r"\\b\\d{4}-\\d{2}-\\d{2}\\b")\r
\r
    def validateStandardDates(text, expectedCount):\r
        dates = standardDatePattern.findall(text)\r
\r
        assert len(dates) == expectedCount, f"표준 날짜 수가 다릅니다: {len(dates)}"\r
        assert all(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", date) for date in dates)\r
        assert "2023-07-09" in dates, "한 자리 월/일이 0-padding되지 않았습니다."\r
        assert "2024-01-05" in dates, "점 형식의 한 자리 월/일이 0-padding되지 않았습니다."\r
        assert "2025-12-31" in dates, "DD Mon YYYY 형식이 변환되지 않았습니다."\r
\r
        return dates\r
\r
    converted = convertAllDates(mixedDates)\r
    standardDates = validateStandardDates(converted, expectedCount=10)\r
    standardDates\r
  exercise:\r
    prompt: 11단계. 날짜 정규화 검증 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      standardDatePattern = re.compile(r"\\b\\d{4}-\\d{2}-\\d{2}\\b")\r
\r
      def validateStandardDates(text, expectedCount):\r
          dates = standardDatePattern.findall(text)\r
\r
          assert len(dates) == expectedCount, f"표준 날짜 수가 다릅니다: {len(dates)}"\r
          assert all(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", date) for date in dates)\r
          assert "2023-07-09" in dates, "한 자리 월/일이 0-padding되지 않았습니다."\r
          assert "2024-01-05" in dates, "점 형식의 한 자리 월/일이 0-padding되지 않았습니다."\r
          assert "2025-12-31" in dates, "DD Mon YYYY 형식이 변환되지 않았습니다."\r
\r
          return dates\r
\r
      converted = convertAllDates(mixedDates)\r
      standardDates = validateStandardDates(converted, expectedCount=10)\r
      standardDates\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 날짜 정규화 검증 루프의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 날짜 정규화 검증 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 날짜 변환 프로젝트\r
  goal: 데이터 정제 담당자가 되어 다양한 형식의 날짜를 통일된 ISO 형식(YYYY-MM-DD)으로 정규화하는 미션을 풀어 봅니다.\r
  why: 실무 데이터는 한 컬럼에 여러 날짜 포맷이 섞여 들어옵니다. 정규식 패턴 한 세트로 모두를 한 형식으로 환산할 수 있어야 다음 분석 단계가 흔들리지 않습니다.\r
  explanation: |-\r
    데이터 정제 담당자가 되어 다양한 형식의 데이터를 통일합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    text = """\r
    회의: 2:30 PM\r
    점심: 12:00 PM\r
    기상: 7:15 AM\r
    취침: 11:45 PM\r
    """\r
\r
    def convert(match):\r
        h = int(match.group(1))\r
        m = match.group(2)\r
        p = match.group(3)\r
        if p == "PM" and h != 12:\r
            h += 12\r
        elif p == "AM" and h == 12:\r
            h = 0\r
        return f"{h:02d}:{m}"\r
\r
    pat = re.compile(r"(\\d{1,2}):(\\d{2}) (AM|PM)")\r
    result = pat.sub(convert, text)\r
    result\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      text = """\r
      회의: 2:30 PM\r
      점심: 12:00 PM\r
      기상: 7:15 AM\r
      취침: 11:45 PM\r
      """\r
\r
      def convert(match):\r
          h = int(match.group(1))\r
          m = match.group(2)\r
          p = match.group(3)\r
          if p == "PM" and h != 12:\r
              h += 12\r
          elif p == "AM" and h == 12:\r
              h = 0\r
          return f"{h:02d}:{m}"\r
\r
      pat = re.compile(r"(\\d{1,2}):(\\d{2}) (AM|PM)")\r
      result = pat.sub(convert, text)\r
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
  subtitle: 여섯 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 re.compile과 함수 치환을 배웠습니다. 다양한 날짜 형식을 통일된 형식으로 변환할 수 있습니다.\r
  - type: list\r
    items:\r
    - re.compile() - 패턴 미리 컴파일\r
    - re.sub(패턴, 함수) - 함수로 치환\r
    - \\d{1,2} - 1~2자리 숫자\r
    - \\3-\\2-\\1 - 그룹 순서 변경\r
  - type: text\r
    content: 다음 프로젝트에서는 개인정보를 자동으로 마스킹하는 방법을 배웁니다!\r
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: workflow_variation\r
  title: '실무 변주: 날짜 변환 정책 확장'\r
  blocks:\r
  - type: tip\r
    content: '실무 변주: YYYY-MM-DD, YYYY/MM/DD, 2026년 5월 24일 형식을 모두 같은 날짜로 바꾸고, 변환 실패 행은 원본 문자열과 함께 오류 리포트로\r
      분리해 보세요.'\r
  goal: '실무 변주: 날짜 변환 정책 확장에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.'\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
`;export{e as default};