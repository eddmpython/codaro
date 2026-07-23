var e=`meta:\r
  id: regex_10\r
  title: LLM전처리파이프라인\r
  order: 10\r
  category: regex\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - LLM\r
  - 전처리\r
  - 파이프라인\r
  - 토큰 최적화\r
  - 실전 프로젝트\r
  seo:\r
    title: 정규표현식 실전 - LLM 전처리 완전 자동화\r
    description: 정규표현식으로 웹 데이터를 LLM 입력으로 최적화합니다. HTML 제거, 정제, 토큰 절약을 한 번에 처리합니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - LLM 전처리\r
    - 토큰 최적화\r
    - 파이프라인\r
intro:\r
  emoji: 🚀\r
  goal: 웹 크롤링 데이터를 LLM API 입력으로 최적화하는 완전 자동화 파이프라인을 구축합니다.\r
  description: 지금까지 배운 모든 개념을 종합합니다. HTML 제거, 개인정보 마스킹, 텍스트 정제, 토큰 최적화를 한 번에 처리하여 API 비용을 30% 이상 절감합니다.\r
  direction: LLM전처리파이프라인에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - LLM전처리파이프라인 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 실제 웹 데이터 로드 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. HTML 태그 제거 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: LLM전처리파이프라인 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: LLM전처리파이프라인 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: LLM전처리파이프라인 완료\r
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
- id: step2_load_data\r
  title: 2단계. 실제 웹 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 로컬 게시글 + HTML\r
  goal: 2단계. 실제 웹 데이터 로드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 실제 웹에서 크롤링한 것처럼 HTML이 포함된 로컬 게시글 입력을 만듭니다. 웹 페이지에는 본문 외에도 script, style 태그, 메타 정보 등 LLM\r
    입력에 불필요한 요소가 많습니다. 또한 개인정보가 포함될 수 있으므로 마스킹까지 포함한 종합 파이프라인을 끝까지 실습합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    postsData = [\r
        {\r
            "userId": 1,\r
            "id": 1,\r
            "title": "Support article about account recovery",\r
            "body": "Reset flow failed for user hana@blog.com, phone 010-1234-5678.",\r
        },\r
        {\r
            "userId": 2,\r
            "id": 2,\r
            "title": "Release note draft",\r
            "body": "Remove tracking scripts, compress whitespace, and mask private fields.",\r
        },\r
        {\r
            "userId": 3,\r
            "id": 3,\r
            "title": "Crawler quality report",\r
            "body": "Navigation links, style blocks, and duplicate banners polluted the page.",\r
        },\r
        {\r
            "userId": 4,\r
            "id": 4,\r
            "title": "Knowledge base cleanup",\r
            "body": "The source article contains emails, phone numbers, and noisy markup.",\r
        },\r
        {\r
            "userId": 5,\r
            "id": 5,\r
            "title": "Prompt input budget review",\r
            "body": "Shorter cleaned text reduces token cost while preserving the answer context.",\r
        },\r
    ]\r
\r
    rawWebData = f"""\r
    <html>\r
    <head><title>블로그 게시글</title></head>\r
    <body>\r
        <div class="post">\r
            <h1>{postsData[0]['title']}</h1>\r
            <p class="author">작성자 ID: {postsData[0]['userId']}</p>\r
            <p class="content">{postsData[0]['body']}</p>\r
            <div class="contact">\r
                <span>문의: admin@blog.com</span>\r
                <span>전화: 010-1234-5678</span>\r
                <span>주민번호: 901225-1234567</span>\r
            </div>\r
        </div>\r
        <script>console.log('tracking');<\/script>\r
        <style>.post {{ color: red; }}</style>\r
    </body>\r
    </html>\r
    """\r
    len(rawWebData)\r
  exercise:\r
    prompt: 2단계. 실제 웹 데이터 로드 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      postsData = [\r
          {\r
              "userId": 1,\r
              "id": 1,\r
              "title": "Support article about account recovery",\r
              "body": "Reset flow failed for user hana@blog.com, phone 010-1234-5678.",\r
          },\r
          {\r
              "userId": 2,\r
              "id": 2,\r
              "title": "Release note draft",\r
              "body": "Remove tracking scripts, compress whitespace, and mask private fields.",\r
          },\r
          {\r
              "userId": 3,\r
              "id": 3,\r
              "title": "Crawler quality report",\r
              "body": "Navigation links, style blocks, and duplicate banners polluted the page.",\r
          },\r
          {\r
              "userId": 4,\r
              "id": 4,\r
              "title": "Knowledge base cleanup",\r
              "body": "The source article contains emails, phone numbers, and noisy markup.",\r
          },\r
          {\r
              "userId": 5,\r
              "id": 5,\r
              "title": "Prompt input budget review",\r
              "body": "Shorter cleaned text reduces token cost while preserving the answer context.",\r
          },\r
      ]\r
\r
      rawWebData = f"""\r
      <html>\r
      <head><title>블로그 게시글</title></head>\r
      <body>\r
          <div class="post">\r
              <h1>{postsData[0]['title']}</h1>\r
              <p class="author">작성자 ID: {postsData[0]['userId']}</p>\r
              <p class="content">{postsData[0]['body']}</p>\r
              <div class="contact">\r
                  <span>문의: admin@blog.com</span>\r
                  <span>전화: 010-1234-5678</span>\r
                  <span>주민번호: 901225-1234567</span>\r
              </div>\r
          </div>\r
          <script>console.log('tracking');<\/script>\r
          <style>.post {{ color: red; }}</style>\r
      </body>\r
      </html>\r
      """\r
      len(rawWebData)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 실제 웹 데이터 로드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 2단계. 실제 웹 데이터 로드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step3_step1_html\r
  title: 3단계. HTML 태그 제거\r
  structuredPrimary: true\r
  subtitle: 순수 텍스트 추출\r
  goal: 3단계. HTML 태그 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    첫 번째 단계로 script, style 태그와 모든 HTML 태그를 제거합니다. script와 style 태그는 본문 내용이 아니므로 먼저 제거하고, 그 다음 나머지 태그들을 정리합니다. 비탐욕적 매칭과 re.DOTALL 플래그를 함께 사용해 멀티라인 태그도 처리합니다.\r
\r
    **토큰 절약: 1단계** - 원본: ~400자 → 정제 후: ~200자 - **50% 절약!**\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def removeHtml(text):\r
        text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL | re.IGNORECASE)\r
        text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)\r
        text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)\r
        return text\r
\r
    step1 = removeHtml(rawWebData)\r
    step1[:200]\r
  exercise:\r
    prompt: 3단계. HTML 태그 제거 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def removeHtml(text):\r
          text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL | re.IGNORECASE)\r
          text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)\r
          text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)\r
          return text\r
\r
      step1 = removeHtml(rawWebData)\r
      step1[:200]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. HTML 태그 제거의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. HTML 태그 제거 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step4_step2_personal\r
  title: 4단계. 개인정보 마스킹\r
  structuredPrimary: true\r
  subtitle: 보안 처리\r
  goal: 4단계. 개인정보 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    두 번째 단계로 개인정보를 자동으로 마스킹합니다. LLM에 개인정보를 그대로 전송하면 개인정보보호법 위반이 될 수 있습니다. 주민번호, 전화번호, 이메일 등을 자동으로 탐지하고 마스킹하는 함수를 만들어 파이프라인에 포함시킵니다.\r
\r
    개인정보가 안전하게 마스킹되었습니다. 주민번호 뒷자리, 전화번호 중간자리, 이메일 아이디 일부가 별표로 대체되어 개인을 식별할 수 없지만 데이터의 맥락은 유지됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def maskPersonalInfo(text):\r
        text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)\r
        text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)\r
        text = re.sub(r"([\\w.]{1,2})[\\w.]*@([\\w.]+)", r"\\1***@\\2", text)\r
        return text\r
\r
    step2 = maskPersonalInfo(step1)\r
    step2[:300]\r
  exercise:\r
    prompt: 4단계. 개인정보 마스킹 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def maskPersonalInfo(text):\r
          text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)\r
          text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)\r
          text = re.sub(r"([\\w.]{1,2})[\\w.]*@([\\w.]+)", r"\\1***@\\2", text)\r
          return text\r
\r
      step2 = maskPersonalInfo(step1)\r
      step2[:300]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 개인정보 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 개인정보 마스킹 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step5_step3_normalize\r
  title: 5단계. 텍스트 정규화\r
  structuredPrimary: true\r
  subtitle: 공백과 특수문자 정리\r
  goal: 5단계. 텍스트 정규화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    세 번째 단계: 연속 공백 제거, 특수문자 정리로 토큰을 추가 절약합니다.\r
\r
    **토큰 절약: 2단계** - 공백 정규화: 10% 추가 절약 - 특수문자 제거: 5% 추가 절약\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def normalizeText(text):\r
        text = re.sub(r"\\s+", " ", text)\r
        text = re.sub(r"[^\\w\\s가-힣-]", "", text)\r
        text = text.strip()\r
        return text\r
\r
    step3 = normalizeText(step2)\r
    step3[:200]\r
  exercise:\r
    prompt: 5단계. 텍스트 정규화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def normalizeText(text):\r
          text = re.sub(r"\\s+", " ", text)\r
          text = re.sub(r"[^\\w\\s가-힣-]", "", text)\r
          text = text.strip()\r
          return text\r
\r
      step3 = normalizeText(step2)\r
      step3[:200]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 텍스트 정규화의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 텍스트 정규화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step6_step4_extract\r
  title: 6단계. 핵심 정보 추출\r
  structuredPrimary: true\r
  subtitle: 필요한 부분만\r
  goal: 6단계. 핵심 정보 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: '네 번째 단계: 제목, 내용 등 핵심 정보만 추출합니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def extractKeyInfo(text):\r
        title = re.search(r"([^가-힣\\s]+(?:\\s+[^가-힣\\s]+)*)", text)\r
        userId = re.search(r"ID\\s*:?\\s*(\\d+)", text)\r
        content = re.search(r"(?:내용|content)[:\\s]+(.+?)(?:문의|$)", text, re.IGNORECASE)\r
\r
        return {\r
            "title": title.group(1) if title else "",\r
            "user_id": userId.group(1) if userId else "",\r
            "content_preview": content.group(1)[:100] if content else text[:100]\r
        }\r
\r
    extracted = extractKeyInfo(step3)\r
    extracted\r
  exercise:\r
    prompt: 6단계. 핵심 정보 추출 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def extractKeyInfo(text):\r
          title = re.search(r"([^가-힣\\s]+(?:\\s+[^가-힣\\s]+)*)", text)\r
          userId = re.search(r"ID\\s*:?\\s*(\\d+)", text)\r
          content = re.search(r"(?:내용|content)[:\\s]+(.+?)(?:문의|$)", text, re.IGNORECASE)\r
\r
          return {\r
              "title": title.group(1) if title else "",\r
              "user_id": userId.group(1) if userId else "",\r
              "content_preview": content.group(1)[:100] if content else text[:100]\r
          }\r
\r
      extracted = extractKeyInfo(step3)\r
      extracted\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 핵심 정보 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 핵심 정보 추출 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step7_complete_pipeline\r
  title: 7단계. 완성된 파이프라인\r
  structuredPrimary: true\r
  subtitle: 모든 단계 통합\r
  goal: 7단계. 완성된 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 모든 전처리 단계를 하나의 파이프라인으로 통합합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def preprocessForLLM(rawHtml):\r
        noHtml = removeHtml(rawHtml)\r
\r
        masked = maskPersonalInfo(noHtml)\r
\r
        normalized = normalizeText(masked)\r
\r
        keyInfo = extractKeyInfo(normalized)\r
\r
        return {\r
            "raw_length": len(rawHtml),\r
            "processed_length": len(normalized),\r
            "token_saved_percent": ((len(rawHtml) - len(normalized)) / len(rawHtml)) * 100,\r
            "processed_text": normalized,\r
            "extracted_info": keyInfo\r
        }\r
\r
    result = preprocessForLLM(rawWebData)\r
    f"원본: {result['raw_length']}자\\n처리 후: {result['processed_length']}자\\n절약: {result['token_saved_percent']:.1f}%"\r
  exercise:\r
    prompt: 7단계. 완성된 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def preprocessForLLM(rawHtml):\r
          noHtml = removeHtml(rawHtml)\r
\r
          masked = maskPersonalInfo(noHtml)\r
\r
          normalized = normalizeText(masked)\r
\r
          keyInfo = extractKeyInfo(normalized)\r
\r
          return {\r
              "raw_length": len(rawHtml),\r
              "processed_length": len(normalized),\r
              "token_saved_percent": ((len(rawHtml) - len(normalized)) / len(rawHtml)) * 100,\r
              "processed_text": normalized,\r
              "extracted_info": keyInfo\r
          }\r
\r
      result = preprocessForLLM(rawWebData)\r
      f"원본: {result['raw_length']}자\\n처리 후: {result['processed_length']}자\\n절약: {result['token_saved_percent']:.1f}%"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 완성된 파이프라인의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 완성된 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step8_batch_processing\r
  title: 8단계. 배치 처리\r
  structuredPrimary: true\r
  subtitle: 여러 문서 한 번에\r
  goal: 8단계. 배치 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 여러 웹 페이지를 한 번에 처리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    batchData = [\r
        f"<h1>{post['title']}</h1><p>{post['body']}</p>"\r
        for post in postsData[:5]\r
    ]\r
\r
    batchResults = [preprocessForLLM(html) for html in batchData]\r
\r
    totalSaved = sum(r['token_saved_percent'] for r in batchResults) / len(batchResults)\r
    f"평균 토큰 절약: {totalSaved:.1f}%"\r
  exercise:\r
    prompt: 8단계. 배치 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      batchData = [\r
          f"<h1>{post['title']}</h1><p>{post['body']}</p>"\r
          for post in postsData[:5]\r
      ]\r
\r
      batchResults = [preprocessForLLM(html) for html in batchData]\r
\r
      totalSaved = sum(r['token_saved_percent'] for r in batchResults) / len(batchResults)\r
      f"평균 토큰 절약: {totalSaved:.1f}%"\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 배치 처리의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 배치 처리 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_comparison\r
  title: 9단계. 비용 절감 계산\r
  structuredPrimary: true\r
  subtitle: 실제 API 비용\r
  goal: 9단계. 비용 절감 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    LLM API 비용을 실제로 얼마나 절감하는지 계산합니다.\r
\r
    실제 비용 절감 효과\r
    **100,000건 처리 시:** - 전처리 없음: $30 - 전처리 사용: $18 - **절약: $12 (40%)** 월 1,000,000건이면 $120 절약!\r
  tips:\r
  - '실제 비용 절감 효과 **100,000건 처리 시:** - 전처리 없음: $30 - 전처리 사용: $18 - **절약: $12 (40%)** 월 1,000,000건이면 $120\r
    절약!'\r
  snippet: |-\r
    def calculateCostSaving(originalChars, processedChars):\r
        tokensPerChar = 0.25\r
        costPerToken = 0.00003\r
\r
        originalTokens = int(originalChars * tokensPerChar)\r
        processedTokens = int(processedChars * tokensPerChar)\r
\r
        originalCost = originalTokens * costPerToken\r
        processedCost = processedTokens * costPerToken\r
        savedCost = originalCost - processedCost\r
        savedPercent = (savedCost / originalCost) * 100\r
\r
        return {\r
            "원본 토큰": originalTokens,\r
            "처리 후 토큰": processedTokens,\r
            "원본 비용": f"\${originalCost:.4f}",\r
            "처리 후 비용": f"\${processedCost:.4f}",\r
            "절약액": f"\${savedCost:.4f}",\r
            "절약률": f"{savedPercent:.1f}%"\r
        }\r
\r
    cost = calculateCostSaving(result['raw_length'], result['processed_length'])\r
    cost\r
  exercise:\r
    prompt: 9단계. 비용 절감 계산 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def calculateCostSaving(originalChars, processedChars):\r
          tokensPerChar = 0.25\r
          costPerToken = 0.00003\r
\r
          originalTokens = int(originalChars * tokensPerChar)\r
          processedTokens = int(processedChars * tokensPerChar)\r
\r
          originalCost = originalTokens * costPerToken\r
          processedCost = processedTokens * costPerToken\r
          savedCost = originalCost - processedCost\r
          savedPercent = (savedCost / originalCost) * 100\r
\r
          return {\r
              "원본 토큰": originalTokens,\r
              "처리 후 토큰": processedTokens,\r
              "원본 비용": f"\${originalCost:.4f}",\r
              "처리 후 비용": f"\${processedCost:.4f}",\r
              "절약액": f"\${savedCost:.4f}",\r
              "절약률": f"{savedPercent:.1f}%"\r
          }\r
\r
      cost = calculateCostSaving(result['raw_length'], result['processed_length'])\r
      cost\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 비용 절감 계산의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 비용 절감 계산 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_final_function\r
  title: 10단계. 프로덕션 레디 함수\r
  structuredPrimary: true\r
  subtitle: 실전 배포용\r
  goal: 10단계. 프로덕션 레디 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 에러 처리와 로깅을 추가한 프로덕션 버전을 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def productionPreprocess(rawHtml, options=None):\r
        if options is None:\r
            options = {\r
                "remove_html": True,\r
                "mask_personal": True,\r
                "normalize": True,\r
                "extract_info": True\r
            }\r
\r
        try:\r
            if not isinstance(rawHtml, str):\r
                raise TypeError("rawHtml must be a string")\r
            if rawHtml == "":\r
                raise ValueError("rawHtml must not be empty")\r
\r
            text = rawHtml\r
\r
            if options.get("remove_html"):\r
                text = removeHtml(text)\r
\r
            if options.get("mask_personal"):\r
                text = maskPersonalInfo(text)\r
\r
            if options.get("normalize"):\r
                text = normalizeText(text)\r
\r
            result = {\r
                "success": True,\r
                "processed_text": text,\r
                "original_length": len(rawHtml),\r
                "processed_length": len(text),\r
                "token_saved": ((len(rawHtml) - len(text)) / len(rawHtml)) * 100\r
            }\r
\r
            if options.get("extract_info"):\r
                result["extracted"] = extractKeyInfo(text)\r
\r
            return result\r
\r
        except (TypeError, ValueError, re.error) as exc:\r
            return {\r
                "success": False,\r
                "error": str(exc),\r
                "original_text": str(rawHtml)[:100]\r
            }\r
\r
    final = productionPreprocess(rawWebData)\r
    f"성공: {final['success']}, 토큰 절약: {final['token_saved']:.1f}%"\r
  exercise:\r
    prompt: 10단계. 프로덕션 레디 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def productionPreprocess(rawHtml, options=None):\r
          if options is None:\r
              options = {\r
                  "remove_html": True,\r
                  "mask_personal": True,\r
                  "normalize": True,\r
                  "extract_info": True\r
              }\r
\r
          try:\r
              if not isinstance(rawHtml, str):\r
                  raise TypeError("rawHtml must be a string")\r
              if rawHtml == "":\r
                  raise ValueError("rawHtml must not be empty")\r
\r
              text = rawHtml\r
\r
              if options.get("remove_html"):\r
                  text = removeHtml(text)\r
\r
              if options.get("mask_personal"):\r
                  text = maskPersonalInfo(text)\r
\r
              if options.get("normalize"):\r
                  text = normalizeText(text)\r
\r
              result = {\r
                  "success": True,\r
                  "processed_text": text,\r
                  "original_length": len(rawHtml),\r
                  "processed_length": len(text),\r
                  "token_saved": ((len(rawHtml) - len(text)) / len(rawHtml)) * 100\r
              }\r
\r
              if options.get("extract_info"):\r
                  result["extracted"] = extractKeyInfo(text)\r
\r
              return result\r
\r
          except (TypeError, ValueError, re.error) as exc:\r
              return {\r
                  "success": False,\r
                  "error": str(exc),\r
                  "original_text": str(rawHtml)[:100]\r
              }\r
\r
      final = productionPreprocess(rawWebData)\r
      f"성공: {final['success']}, 토큰 절약: {final['token_saved']:.1f}%"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 프로덕션 레디 함수의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 프로덕션 레디 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: LLM 전처리 종합 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 모든 정규표현식 개념을 사용하여 자신만의 전처리 함수를 만들어보세요! 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    raw = """\r
    <div>\r
        <a href="https://example.com">링크</a>\r
        <p>게시일: 2025/12/26</p>\r
        <p>내용입니다</p>\r
    </div>\r
    """\r
\r
    def strip(text):\r
        text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL)\r
        text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL)\r
        text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)\r
        return text\r
\r
    strip(raw)\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      raw = """\r
      <div>\r
          <a href="https://example.com">링크</a>\r
          <p>게시일: 2025/12/26</p>\r
          <p>내용입니다</p>\r
      </div>\r
      """\r
\r
      def strip(text):\r
          text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL)\r
          text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL)\r
          text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)\r
          return text\r
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
  subtitle: 열 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 정규표현식 마스터 완성! 10개 프로젝트를 통해 모든 핵심 개념을 배웠습니다.\r
  - type: list\r
    items:\r
    - '기본 패턴: \\w, \\d, \\s, ., ^, $'\r
    - '수량자: +, *, ?, {n,m}, *?'\r
    - '문자 클래스: [abc], [^abc]'\r
    - '그룹: (), (?:), (?P<name>)'\r
    - '함수: findall, search, sub, split, finditer'\r
    - '플래그: re.I, re.M, re.S, re.DOTALL'\r
    - '고급: (?<=), (?=), (?<!), (?!)'\r
    - '실전: HTML 제거, 마스킹, 토큰 최적화'\r
  - type: text\r
    content: 이제 실무에서 자신있게 정규표현식을 사용하세요!\r
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