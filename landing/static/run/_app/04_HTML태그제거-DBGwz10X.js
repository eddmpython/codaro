var e=`meta:\r
  id: regex_04\r
  title: HTML태그제거\r
  order: 4\r
  category: regex\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - HTML\r
  - 비탐욕적\r
  - DOTALL\r
  - 태그 제거\r
  - 텍스트 정제\r
  seo:\r
    title: 정규표현식 기초 - HTML 태그 제거\r
    description: 정규표현식으로 HTML에서 순수 텍스트만 추출합니다. 비탐욕적 매칭, re.DOTALL 플래그를 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - HTML 파싱\r
    - 태그 제거\r
    - 비탐욕적 매칭\r
intro:\r
  emoji: 🏷️\r
  goal: HTML 문서에서 모든 태그를 제거하고 순수 텍스트만 추출합니다.\r
  description: 웹 크롤링 후 가장 많이 하는 작업입니다. 탐욕적 vs 비탐욕적 매칭의 차이를 배우고, LLM 전처리의 첫 단계를 경험합니다.\r
  direction: HTML태그제거에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - HTML태그제거 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 잘못된 패턴 (탐욕적 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: HTML태그제거 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: HTML태그제거 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: HTML태그제거 완료\r
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
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 로컬 게시글 샘플\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 로컬 게시글 샘플에 HTML 태그를 추가해 크롤링 결과와 비슷한 입력을 만듭니다. 실제 웹 데이터에는 본문, 제목, 작성자 정보와 함께 태그가 섞여 있으므로\r
    LLM 입력이나 분석 전에 태그 제거와 공백 정리가 필요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    postsData = [\r
        {\r
            "userId": 1,\r
            "id": 1,\r
            "title": "HTML cleaning checklist",\r
            "body": "Remove tags, normalize whitespace, and keep the meaningful text.",\r
        },\r
        {\r
            "userId": 2,\r
            "id": 2,\r
            "title": "Script tags are not content",\r
            "body": "Tracking scripts and inline styles should not reach the analysis step.",\r
        },\r
        {\r
            "userId": 3,\r
            "id": 3,\r
            "title": "LLM input preparation",\r
            "body": "Clean text reduces token waste and keeps prompts focused.",\r
        },\r
        {\r
            "userId": 4,\r
            "id": 4,\r
            "title": "Crawler output review",\r
            "body": "Raw pages often mix navigation, metadata, and article paragraphs.",\r
        },\r
        {\r
            "userId": 5,\r
            "id": 5,\r
            "title": "Batch preprocessing note",\r
            "body": "A reusable function makes hundreds of pages easier to clean.",\r
        },\r
    ]\r
\r
    postsData[0]['body']\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      postsData = [\r
          {\r
              "userId": 1,\r
              "id": 1,\r
              "title": "HTML cleaning checklist",\r
              "body": "Remove tags, normalize whitespace, and keep the meaningful text.",\r
          },\r
          {\r
              "userId": 2,\r
              "id": 2,\r
              "title": "Script tags are not content",\r
              "body": "Tracking scripts and inline styles should not reach the analysis step.",\r
          },\r
          {\r
              "userId": 3,\r
              "id": 3,\r
              "title": "LLM input preparation",\r
              "body": "Clean text reduces token waste and keeps prompts focused.",\r
          },\r
          {\r
              "userId": 4,\r
              "id": 4,\r
              "title": "Crawler output review",\r
              "body": "Raw pages often mix navigation, metadata, and article paragraphs.",\r
          },\r
          {\r
              "userId": 5,\r
              "id": 5,\r
              "title": "Batch preprocessing note",\r
              "body": "A reusable function makes hundreds of pages easier to clean.",\r
          },\r
      ]\r
\r
      postsData[0]['body']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_wrong_pattern\r
  title: 3단계. 잘못된 패턴 (탐욕적 매칭)\r
  structuredPrimary: true\r
  subtitle: .* 의 함정\r
  goal: 3단계. 잘못된 패턴 (탐욕적 매칭)에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    직관적으로 생각하면 < 와 > 사이의 모든 문자를 찾으면 될 것 같습니다. 하지만 정규표현식의 기본 동작은 우리의 예상과 다를 수 있습니다. 이 문제를 통해 탐욕적 매칭이라는 중요한 개념을 배워봅시다.\r
\r
    결과: ['<div>안녕</div><span>하세요</span>'] - 전체가 하나로 매칭되었습니다!\r
  tips:\r
  - '탐욕적 매칭의 문제 \`.*\`는 **탐욕적(greedy)**입니다. 가능한 한 많이 매칭하려고 합니다. \`<.*>\` 는: 1. 첫 번째 \`<\` 를 찾고 2. 마지막 \`>\` 까지\r
    최대한 많이 매칭 3. 중간의 모든 것을 다 포함 우리가 원하는 건 각 태그를 개별적으로 찾는 것입니다!'\r
  snippet: |-\r
    wrongPattern = r"<.*>"\r
\r
    testHtml = "<div>안녕</div><span>하세요</span>"\r
    re.findall(wrongPattern, testHtml)\r
  exercise:\r
    prompt: 3단계. 잘못된 패턴 (탐욕적 매칭) 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      wrongPattern = r"<.*>"\r
\r
      testHtml = "<div>안녕</div><span>하세요</span>"\r
      re.findall(wrongPattern, testHtml)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 잘못된 패턴 (탐욕적 매칭)의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 잘못된 패턴 (탐욕적 매칭)의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_non_greedy\r
  title: 4단계. 올바른 패턴 (비탐욕적 매칭)\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 4단계. 올바른 패턴 (비탐욕적 매칭)에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 4단계. 올바른 패턴 (비탐욕적 매칭)의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    correctPattern = r"<.*?>"\r
\r
    testHtml = "<div>안녕</div><span>하세요</span>"\r
    re.findall(correctPattern, testHtml)\r
  exercise:\r
    prompt: 4단계. 올바른 패턴 (비탐욕적 매칭) 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      correctPattern = r"<.*?>"\r
\r
      testHtml = "<div>안녕</div><span>하세요</span>"\r
      re.findall(correctPattern, testHtml)\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 올바른 패턴 (비탐욕적 매칭)의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 올바른 패턴 (비탐욕적 매칭)의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_remove_tags\r
  title: 5단계. HTML 태그 제거\r
  structuredPrimary: true\r
  subtitle: re.sub로 치환\r
  goal: 5단계. HTML 태그 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    이제 모든 HTML 태그를 빈 문자열로 치환하여 제거합니다.\r
\r
    태그는 사라졌지만 여러 줄의 공백이 남아있네요. 추가 정제가 필요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pattern = r"<.*?>"\r
\r
    htmlText = (\r
        "<article><h1>HTML cleaning checklist</h1>"\r
        "<p>Remove tags, normalize <b>whitespace</b>, "\r
        "and keep the meaningful <i>text</i>.</p></article>"\r
    )\r
    cleanText = re.sub(pattern, "", htmlText)\r
    cleanText\r
  exercise:\r
    prompt: 5단계. HTML 태그 제거 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pattern = r"<.*?>"\r
\r
      htmlText = (\r
          "<article><h1>HTML cleaning checklist</h1>"\r
          "<p>Remove tags, normalize <b>whitespace</b>, "\r
          "and keep the meaningful <i>text</i>.</p></article>"\r
      )\r
      cleanText = re.sub(pattern, "", htmlText)\r
      cleanText\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. HTML 태그 제거의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. HTML 태그 제거의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_clean_whitespace\r
  title: 6단계. 공백 정리\r
  structuredPrimary: true\r
  subtitle: 연속된 공백 제거\r
  goal: 6단계. 공백 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    연속된 공백, 탭, 개행을 하나의 공백으로 통일합니다.\r
\r
    공백 패턴\r
    **패턴: \\\\s+** - \`\\s\` : 공백 문자 (스페이스, 탭, 개행 등) - \`\\s+\` : 공백 문자 1개 이상 - \`.strip()\` : 양 끝 공백 제거 LLM 전처리에서 매우 자주 사용하는 패턴입니다!\r
  tips:\r
  - '공백 패턴 **패턴: \\\\s+** - \`\\s\` : 공백 문자 (스페이스, 탭, 개행 등) - \`\\s+\` : 공백 문자 1개 이상 - \`.strip()\` : 양 끝 공백 제거\r
    LLM 전처리에서 매우 자주 사용하는 패턴입니다!'\r
  snippet: |-\r
    cleanText = re.sub(r"\\s+", " ", cleanText)\r
    cleanText = cleanText.strip()\r
    cleanText\r
  exercise:\r
    prompt: 6단계. 공백 정리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cleanText = re.sub(r"\\s+", " ", cleanText)\r
      cleanText = cleanText.strip()\r
      cleanText\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 공백 정리의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 공백 정리의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step7_dotall_flag\r
  title: 7단계. re.DOTALL 플래그\r
  structuredPrimary: true\r
  subtitle: . 이 개행 포함하기\r
  goal: 7단계. re.DOTALL 플래그에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    기본적으로 . 은 개행(\\n)을 매칭하지 않습니다. 여러 줄에 걸친 태그를 처리하려면 플래그가 필요합니다.\r
\r
    re.DOTALL (re.S)\r
    **re.DOTALL** 또는 **re.S** 플래그: - \`.\` 이 개행 문자도 매칭하게 만듭니다 - 여러 줄에 걸친 패턴을 찾을 때 필수 - \`flags=re.DOTALL\` 또는 \`flags=re.S\` 로 사용\r
  tips:\r
  - 're.DOTALL (re.S) **re.DOTALL** 또는 **re.S** 플래그: - \`.\` 이 개행 문자도 매칭하게 만듭니다 - 여러 줄에 걸친 패턴을 찾을 때 필수 -\r
    \`flags=re.DOTALL\` 또는 \`flags=re.S\` 로 사용'\r
  snippet: |-\r
    multilineHtml = """\r
    <div\r
        class="container"\r
        id="main">\r
    내용\r
    </div>\r
    """\r
  exercise:\r
    prompt: 7단계. re.DOTALL 플래그 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      multilineHtml = """\r
      <div\r
          class="container"\r
          id="main">\r
      내용\r
      </div>\r
      """\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. re.DOTALL 플래그의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. re.DOTALL 플래그의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step8_complete_function\r
  title: 8단계. 완성된 HTML 정제 함수\r
  structuredPrimary: true\r
  subtitle: 재사용 가능한 함수\r
  goal: 8단계. 완성된 HTML 정제 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 배운 내용을 모두 합쳐 완성된 함수를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def stripHtml(html):\r
        noTags = re.sub(r"<.*?>", "", html, flags=re.DOTALL)\r
        cleaned = re.sub(r"\\s+", " ", noTags)\r
        return cleaned.strip()\r
  exercise:\r
    prompt: 8단계. 완성된 HTML 정제 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def stripHtml(html):\r
          noTags = re.sub(r"<.*?>", "", html, flags=re.DOTALL)\r
          cleaned = re.sub(r"\\s+", " ", noTags)\r
          return cleaned.strip()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 완성된 HTML 정제 함수의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 완성된 HTML 정제 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step9_token_comparison\r
  title: 9단계. LLM 토큰 절약 효과\r
  structuredPrimary: true\r
  subtitle: 전처리 전후 비교\r
  goal: 9단계. LLM 토큰 절약 효과에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    HTML 태그 제거가 LLM 토큰에 얼마나 영향을 주는지 확인해봅시다.\r
\r
    실제 토큰 절약\r
    HTML 태그 제거로 평균 30~50% 토큰 절약! - 원본 1000자 → 정제 후 500자 - 토큰 수: ~250 → ~125 - API 비용: 50% 절감 웹 크롤링 후 필수 전처리 단계입니다.\r
  tips:\r
  - '실제 토큰 절약 HTML 태그 제거로 평균 30~50% 토큰 절약! - 원본 1000자 → 정제 후 500자 - 토큰 수: ~250 → ~125 - API 비용: 50% 절감\r
    웹 크롤링 후 필수 전처리 단계입니다.'\r
  snippet: |-\r
    original = htmlText\r
    cleaned = stripHtml(htmlText)\r
\r
    originalLen = len(original)\r
    cleanedLen = len(cleaned)\r
    saved = ((originalLen - cleanedLen) / originalLen) * 100\r
\r
    f"원본: {originalLen}자\\n정제: {cleanedLen}자\\n절약: {saved:.1f}%"\r
  exercise:\r
    prompt: 9단계. LLM 토큰 절약 효과 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      original = htmlText\r
      cleaned = stripHtml(htmlText)\r
\r
      originalLen = len(original)\r
      cleanedLen = len(cleaned)\r
      saved = ((originalLen - cleanedLen) / originalLen) * 100\r
\r
      f"원본: {originalLen}자\\n정제: {cleanedLen}자\\n절약: {saved:.1f}%"\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. LLM 토큰 절약 효과의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. LLM 토큰 절약 효과의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: HTML 정제 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    웹 개발자가 되어 다양한 HTML 문서를 정제합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    raw = """\r
    <html>\r
    <head>\r
        <style>.red { color: red; }</style>\r
        <script>console.log('test');<\/script>\r
    </head>\r
    <body>\r
        <p>실제 내용입니다</p>\r
    </body>\r
    </html>\r
    """\r
\r
    def strip(html):\r
        out = re.sub(r"<script.*?<\/script>", "", html, flags=re.DOTALL)\r
        out = re.sub(r"<style.*?</style>", "", out, flags=re.DOTALL)\r
        out = re.sub(r"<.*?>", "", out, flags=re.DOTALL)\r
        out = re.sub(r"\\s+", " ", out)\r
        return out.strip()\r
\r
    strip(raw)\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      raw = """\r
      <html>\r
      <head>\r
          <style>.red { color: red; }</style>\r
          <script>console.log('test');<\/script>\r
      </head>\r
      <body>\r
          <p>실제 내용입니다</p>\r
      </body>\r
      </html>\r
      """\r
\r
      def strip(html):\r
          out = re.sub(r"<script.*?<\/script>", "", html, flags=re.DOTALL)\r
          out = re.sub(r"<style.*?</style>", "", out, flags=re.DOTALL)\r
          out = re.sub(r"<.*?>", "", out, flags=re.DOTALL)\r
          out = re.sub(r"\\s+", " ", out)\r
          return out.strip()\r
\r
      strip(raw)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 네 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 비탐욕적 매칭과 re.DOTALL 플래그를 배웠습니다. HTML 태그를 제거하고 순수 텍스트만 추출할 수 있습니다.\r
  - type: list\r
    items:\r
    - .*? - 비탐욕적 매칭 (최소 매칭)\r
    - re.DOTALL - . 이 개행도 매칭\r
    - \\s+ - 공백 1개 이상\r
    - re.sub() - 패턴 치환\r
  - type: text\r
    content: 다음 프로젝트에서는 로그 파일을 파싱하는 방법을 배웁니다!\r
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