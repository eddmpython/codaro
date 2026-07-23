var e=`meta:
  id: regex_10
  title: LLM전처리파이프라인
  order: 10
  category: regex
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - LLM
  - 전처리
  - 파이프라인
  - 토큰 최적화
  - 실전 프로젝트
  seo:
    title: 정규표현식 실전 - LLM 전처리 완전 자동화
    description: 정규표현식으로 웹 데이터를 LLM 입력으로 최적화합니다. HTML 제거, 정제, 토큰 절약을 한 번에 처리합니다.
    keywords:
    - 정규표현식
    - regex
    - LLM 전처리
    - 토큰 최적화
    - 파이프라인
intro:
  emoji: 🚀
  goal: 웹 크롤링 데이터를 LLM API 입력으로 최적화하는 완전 자동화 파이프라인을 구축합니다.
  description: 지금까지 배운 모든 개념을 종합합니다. HTML 제거, 개인정보 마스킹, 텍스트 정제, 토큰 최적화를 한 번에 처리하여 API 비용을 30% 이상 절감합니다.
  direction: LLM전처리파이프라인에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.
  - LLM전처리파이프라인 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 실제 웹 데이터 로드 처리 실행
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. HTML 태그 제거 결과 검증
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.
    - label: LLM전처리파이프라인 재사용
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.
    runtime:
    - label: 텍스트 정제 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: LLM전처리파이프라인 실행
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.
    - label: LLM전처리파이프라인 완료
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 1단계. 라이브러리 불러오기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
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
- id: step2_load_data
  title: 2단계. 실제 웹 데이터 로드
  structuredPrimary: true
  subtitle: 로컬 게시글 + HTML
  goal: 2단계. 실제 웹 데이터 로드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 실제 웹에서 크롤링한 것처럼 HTML이 포함된 로컬 게시글 입력을 만듭니다. 웹 페이지에는 본문 외에도 script, style 태그, 메타 정보 등 LLM
    입력에 불필요한 요소가 많습니다. 또한 개인정보가 포함될 수 있으므로 마스킹까지 포함한 종합 파이프라인을 끝까지 실습합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    postsData = [
        {
            "userId": 1,
            "id": 1,
            "title": "Support article about account recovery",
            "body": "Reset flow failed for user hana@blog.com, phone 010-1234-5678.",
        },
        {
            "userId": 2,
            "id": 2,
            "title": "Release note draft",
            "body": "Remove tracking scripts, compress whitespace, and mask private fields.",
        },
        {
            "userId": 3,
            "id": 3,
            "title": "Crawler quality report",
            "body": "Navigation links, style blocks, and duplicate banners polluted the page.",
        },
        {
            "userId": 4,
            "id": 4,
            "title": "Knowledge base cleanup",
            "body": "The source article contains emails, phone numbers, and noisy markup.",
        },
        {
            "userId": 5,
            "id": 5,
            "title": "Prompt input budget review",
            "body": "Shorter cleaned text reduces token cost while preserving the answer context.",
        },
    ]

    rawWebData = f"""
    <html>
    <head><title>블로그 게시글</title></head>
    <body>
        <div class="post">
            <h1>{postsData[0]['title']}</h1>
            <p class="author">작성자 ID: {postsData[0]['userId']}</p>
            <p class="content">{postsData[0]['body']}</p>
            <div class="contact">
                <span>문의: admin@blog.com</span>
                <span>전화: 010-1234-5678</span>
                <span>주민번호: 901225-1234567</span>
            </div>
        </div>
        <script>console.log('tracking');<\/script>
        <style>.post {{ color: red; }}</style>
    </body>
    </html>
    """
    len(rawWebData)
  exercise:
    prompt: 2단계. 실제 웹 데이터 로드 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      postsData = [
          {
              "userId": 1,
              "id": 1,
              "title": "Support article about account recovery",
              "body": "Reset flow failed for user hana@blog.com, phone 010-1234-5678.",
          },
          {
              "userId": 2,
              "id": 2,
              "title": "Release note draft",
              "body": "Remove tracking scripts, compress whitespace, and mask private fields.",
          },
          {
              "userId": 3,
              "id": 3,
              "title": "Crawler quality report",
              "body": "Navigation links, style blocks, and duplicate banners polluted the page.",
          },
          {
              "userId": 4,
              "id": 4,
              "title": "Knowledge base cleanup",
              "body": "The source article contains emails, phone numbers, and noisy markup.",
          },
          {
              "userId": 5,
              "id": 5,
              "title": "Prompt input budget review",
              "body": "Shorter cleaned text reduces token cost while preserving the answer context.",
          },
      ]

      rawWebData = f"""
      <html>
      <head><title>블로그 게시글</title></head>
      <body>
          <div class="post">
              <h1>{postsData[0]['title']}</h1>
              <p class="author">작성자 ID: {postsData[0]['userId']}</p>
              <p class="content">{postsData[0]['body']}</p>
              <div class="contact">
                  <span>문의: admin@blog.com</span>
                  <span>전화: 010-1234-5678</span>
                  <span>주민번호: 901225-1234567</span>
              </div>
          </div>
          <script>console.log('tracking');<\/script>
          <style>.post {{ color: red; }}</style>
      </body>
      </html>
      """
      len(rawWebData)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 실제 웹 데이터 로드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 2단계. 실제 웹 데이터 로드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step3_step1_html
  title: 3단계. HTML 태그 제거
  structuredPrimary: true
  subtitle: 순수 텍스트 추출
  goal: 3단계. HTML 태그 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    첫 번째 단계로 script, style 태그와 모든 HTML 태그를 제거합니다. script와 style 태그는 본문 내용이 아니므로 먼저 제거하고, 그 다음 나머지 태그들을 정리합니다. 비탐욕적 매칭과 re.DOTALL 플래그를 함께 사용해 멀티라인 태그도 처리합니다.

    **토큰 절약: 1단계** - 원본: ~400자 → 정제 후: ~200자 - **50% 절약!**
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def removeHtml(text):
        text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)
        return text

    step1 = removeHtml(rawWebData)
    step1[:200]
  exercise:
    prompt: 3단계. HTML 태그 제거 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def removeHtml(text):
          text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL | re.IGNORECASE)
          text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
          text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)
          return text

      step1 = removeHtml(rawWebData)
      step1[:200]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 3단계. HTML 태그 제거의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 3단계. HTML 태그 제거 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step4_step2_personal
  title: 4단계. 개인정보 마스킹
  structuredPrimary: true
  subtitle: 보안 처리
  goal: 4단계. 개인정보 마스킹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    두 번째 단계로 개인정보를 자동으로 마스킹합니다. LLM에 개인정보를 그대로 전송하면 개인정보보호법 위반이 될 수 있습니다. 주민번호, 전화번호, 이메일 등을 자동으로 탐지하고 마스킹하는 함수를 만들어 파이프라인에 포함시킵니다.

    개인정보가 안전하게 마스킹되었습니다. 주민번호 뒷자리, 전화번호 중간자리, 이메일 아이디 일부가 별표로 대체되어 개인을 식별할 수 없지만 데이터의 맥락은 유지됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def maskPersonalInfo(text):
        text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)
        text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)
        text = re.sub(r"([\\w.]{1,2})[\\w.]*@([\\w.]+)", r"\\1***@\\2", text)
        return text

    step2 = maskPersonalInfo(step1)
    step2[:300]
  exercise:
    prompt: 4단계. 개인정보 마스킹 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def maskPersonalInfo(text):
          text = re.sub(r"(\\d{6})-(\\d{7})", r"\\1-*******", text)
          text = re.sub(r"(\\d{3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)
          text = re.sub(r"([\\w.]{1,2})[\\w.]*@([\\w.]+)", r"\\1***@\\2", text)
          return text

      step2 = maskPersonalInfo(step1)
      step2[:300]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 개인정보 마스킹의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 4단계. 개인정보 마스킹 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step5_step3_normalize
  title: 5단계. 텍스트 정규화
  structuredPrimary: true
  subtitle: 공백과 특수문자 정리
  goal: 5단계. 텍스트 정규화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    세 번째 단계: 연속 공백 제거, 특수문자 정리로 토큰을 추가 절약합니다.

    **토큰 절약: 2단계** - 공백 정규화: 10% 추가 절약 - 특수문자 제거: 5% 추가 절약
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def normalizeText(text):
        text = re.sub(r"\\s+", " ", text)
        text = re.sub(r"[^\\w\\s가-힣-]", "", text)
        text = text.strip()
        return text

    step3 = normalizeText(step2)
    step3[:200]
  exercise:
    prompt: 5단계. 텍스트 정규화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def normalizeText(text):
          text = re.sub(r"\\s+", " ", text)
          text = re.sub(r"[^\\w\\s가-힣-]", "", text)
          text = text.strip()
          return text

      step3 = normalizeText(step2)
      step3[:200]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 텍스트 정규화의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 5단계. 텍스트 정규화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step6_step4_extract
  title: 6단계. 핵심 정보 추출
  structuredPrimary: true
  subtitle: 필요한 부분만
  goal: 6단계. 핵심 정보 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: '네 번째 단계: 제목, 내용 등 핵심 정보만 추출합니다.'
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def extractKeyInfo(text):
        title = re.search(r"([^가-힣\\s]+(?:\\s+[^가-힣\\s]+)*)", text)
        userId = re.search(r"ID\\s*:?\\s*(\\d+)", text)
        content = re.search(r"(?:내용|content)[:\\s]+(.+?)(?:문의|$)", text, re.IGNORECASE)

        return {
            "title": title.group(1) if title else "",
            "user_id": userId.group(1) if userId else "",
            "content_preview": content.group(1)[:100] if content else text[:100]
        }

    extracted = extractKeyInfo(step3)
    extracted
  exercise:
    prompt: 6단계. 핵심 정보 추출 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def extractKeyInfo(text):
          title = re.search(r"([^가-힣\\s]+(?:\\s+[^가-힣\\s]+)*)", text)
          userId = re.search(r"ID\\s*:?\\s*(\\d+)", text)
          content = re.search(r"(?:내용|content)[:\\s]+(.+?)(?:문의|$)", text, re.IGNORECASE)

          return {
              "title": title.group(1) if title else "",
              "user_id": userId.group(1) if userId else "",
              "content_preview": content.group(1)[:100] if content else text[:100]
          }

      extracted = extractKeyInfo(step3)
      extracted
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 핵심 정보 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 6단계. 핵심 정보 추출 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step7_complete_pipeline
  title: 7단계. 완성된 파이프라인
  structuredPrimary: true
  subtitle: 모든 단계 통합
  goal: 7단계. 완성된 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 모든 전처리 단계를 하나의 파이프라인으로 통합합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def preprocessForLLM(rawHtml):
        noHtml = removeHtml(rawHtml)

        masked = maskPersonalInfo(noHtml)

        normalized = normalizeText(masked)

        keyInfo = extractKeyInfo(normalized)

        return {
            "raw_length": len(rawHtml),
            "processed_length": len(normalized),
            "token_saved_percent": ((len(rawHtml) - len(normalized)) / len(rawHtml)) * 100,
            "processed_text": normalized,
            "extracted_info": keyInfo
        }

    result = preprocessForLLM(rawWebData)
    f"원본: {result['raw_length']}자\\n처리 후: {result['processed_length']}자\\n절약: {result['token_saved_percent']:.1f}%"
  exercise:
    prompt: 7단계. 완성된 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def preprocessForLLM(rawHtml):
          noHtml = removeHtml(rawHtml)

          masked = maskPersonalInfo(noHtml)

          normalized = normalizeText(masked)

          keyInfo = extractKeyInfo(normalized)

          return {
              "raw_length": len(rawHtml),
              "processed_length": len(normalized),
              "token_saved_percent": ((len(rawHtml) - len(normalized)) / len(rawHtml)) * 100,
              "processed_text": normalized,
              "extracted_info": keyInfo
          }

      result = preprocessForLLM(rawWebData)
      f"원본: {result['raw_length']}자\\n처리 후: {result['processed_length']}자\\n절약: {result['token_saved_percent']:.1f}%"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. 완성된 파이프라인의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 7단계. 완성된 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step8_batch_processing
  title: 8단계. 배치 처리
  structuredPrimary: true
  subtitle: 여러 문서 한 번에
  goal: 8단계. 배치 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 여러 웹 페이지를 한 번에 처리합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    batchData = [
        f"<h1>{post['title']}</h1><p>{post['body']}</p>"
        for post in postsData[:5]
    ]

    batchResults = [preprocessForLLM(html) for html in batchData]

    totalSaved = sum(r['token_saved_percent'] for r in batchResults) / len(batchResults)
    f"평균 토큰 절약: {totalSaved:.1f}%"
  exercise:
    prompt: 8단계. 배치 처리 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      batchData = [
          f"<h1>{post['title']}</h1><p>{post['body']}</p>"
          for post in postsData[:5]
      ]

      batchResults = [preprocessForLLM(html) for html in batchData]

      totalSaved = sum(r['token_saved_percent'] for r in batchResults) / len(batchResults)
      f"평균 토큰 절약: {totalSaved:.1f}%"
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 배치 처리의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 8단계. 배치 처리 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step9_comparison
  title: 9단계. 비용 절감 계산
  structuredPrimary: true
  subtitle: 실제 API 비용
  goal: 9단계. 비용 절감 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    LLM API 비용을 실제로 얼마나 절감하는지 계산합니다.

    실제 비용 절감 효과
    **100,000건 처리 시:** - 전처리 없음: $30 - 전처리 사용: $18 - **절약: $12 (40%)** 월 1,000,000건이면 $120 절약!
  tips:
  - '실제 비용 절감 효과 **100,000건 처리 시:** - 전처리 없음: $30 - 전처리 사용: $18 - **절약: $12 (40%)** 월 1,000,000건이면 $120
    절약!'
  snippet: |-
    def calculateCostSaving(originalChars, processedChars):
        tokensPerChar = 0.25
        costPerToken = 0.00003

        originalTokens = int(originalChars * tokensPerChar)
        processedTokens = int(processedChars * tokensPerChar)

        originalCost = originalTokens * costPerToken
        processedCost = processedTokens * costPerToken
        savedCost = originalCost - processedCost
        savedPercent = (savedCost / originalCost) * 100

        return {
            "원본 토큰": originalTokens,
            "처리 후 토큰": processedTokens,
            "원본 비용": f"\${originalCost:.4f}",
            "처리 후 비용": f"\${processedCost:.4f}",
            "절약액": f"\${savedCost:.4f}",
            "절약률": f"{savedPercent:.1f}%"
        }

    cost = calculateCostSaving(result['raw_length'], result['processed_length'])
    cost
  exercise:
    prompt: 9단계. 비용 절감 계산 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def calculateCostSaving(originalChars, processedChars):
          tokensPerChar = 0.25
          costPerToken = 0.00003

          originalTokens = int(originalChars * tokensPerChar)
          processedTokens = int(processedChars * tokensPerChar)

          originalCost = originalTokens * costPerToken
          processedCost = processedTokens * costPerToken
          savedCost = originalCost - processedCost
          savedPercent = (savedCost / originalCost) * 100

          return {
              "원본 토큰": originalTokens,
              "처리 후 토큰": processedTokens,
              "원본 비용": f"\${originalCost:.4f}",
              "처리 후 비용": f"\${processedCost:.4f}",
              "절약액": f"\${savedCost:.4f}",
              "절약률": f"{savedPercent:.1f}%"
          }

      cost = calculateCostSaving(result['raw_length'], result['processed_length'])
      cost
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. 비용 절감 계산의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 9단계. 비용 절감 계산 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step10_final_function
  title: 10단계. 프로덕션 레디 함수
  structuredPrimary: true
  subtitle: 실전 배포용
  goal: 10단계. 프로덕션 레디 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 에러 처리와 로깅을 추가한 프로덕션 버전을 만듭니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def productionPreprocess(rawHtml, options=None):
        if options is None:
            options = {
                "remove_html": True,
                "mask_personal": True,
                "normalize": True,
                "extract_info": True
            }

        try:
            if not isinstance(rawHtml, str):
                raise TypeError("rawHtml must be a string")
            if rawHtml == "":
                raise ValueError("rawHtml must not be empty")

            text = rawHtml

            if options.get("remove_html"):
                text = removeHtml(text)

            if options.get("mask_personal"):
                text = maskPersonalInfo(text)

            if options.get("normalize"):
                text = normalizeText(text)

            result = {
                "success": True,
                "processed_text": text,
                "original_length": len(rawHtml),
                "processed_length": len(text),
                "token_saved": ((len(rawHtml) - len(text)) / len(rawHtml)) * 100
            }

            if options.get("extract_info"):
                result["extracted"] = extractKeyInfo(text)

            return result

        except (TypeError, ValueError, re.error) as exc:
            return {
                "success": False,
                "error": str(exc),
                "original_text": str(rawHtml)[:100]
            }

    final = productionPreprocess(rawWebData)
    f"성공: {final['success']}, 토큰 절약: {final['token_saved']:.1f}%"
  exercise:
    prompt: 10단계. 프로덕션 레디 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def productionPreprocess(rawHtml, options=None):
          if options is None:
              options = {
                  "remove_html": True,
                  "mask_personal": True,
                  "normalize": True,
                  "extract_info": True
              }

          try:
              if not isinstance(rawHtml, str):
                  raise TypeError("rawHtml must be a string")
              if rawHtml == "":
                  raise ValueError("rawHtml must not be empty")

              text = rawHtml

              if options.get("remove_html"):
                  text = removeHtml(text)

              if options.get("mask_personal"):
                  text = maskPersonalInfo(text)

              if options.get("normalize"):
                  text = normalizeText(text)

              result = {
                  "success": True,
                  "processed_text": text,
                  "original_length": len(rawHtml),
                  "processed_length": len(text),
                  "token_saved": ((len(rawHtml) - len(text)) / len(rawHtml)) * 100
              }

              if options.get("extract_info"):
                  result["extracted"] = extractKeyInfo(text)

              return result

          except (TypeError, ValueError, re.error) as exc:
              return {
                  "success": False,
                  "error": str(exc),
                  "original_text": str(rawHtml)[:100]
              }

      final = productionPreprocess(rawWebData)
      f"성공: {final['success']}, 토큰 절약: {final['token_saved']:.1f}%"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 프로덕션 레디 함수의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 10단계. 프로덕션 레디 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: LLM 전처리 종합 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    지금까지 배운 모든 정규표현식 개념을 사용하여 자신만의 전처리 함수를 만들어보세요! 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import re

    raw = """
    <div>
        <a href="https://example.com">링크</a>
        <p>게시일: 2025/12/26</p>
        <p>내용입니다</p>
    </div>
    """

    def strip(text):
        text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL)
        text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL)
        text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)
        return text

    strip(raw)
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import re

      raw = """
      <div>
          <a href="https://example.com">링크</a>
          <p>게시일: 2025/12/26</p>
          <p>내용입니다</p>
      </div>
      """

      def strip(text):
          text = re.sub(r"<script.*?<\/script>", "", text, flags=re.DOTALL)
          text = re.sub(r"<style.*?</style>", "", text, flags=re.DOTALL)
          text = re.sub(r"<.*?>", "", text, flags=re.DOTALL)
          return text

      strip(raw)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: summary
  title: 정리
  subtitle: 열 번째 프로젝트 완료!
  blocks:
  - type: text
    content: 정규표현식 마스터 완성! 10개 프로젝트를 통해 모든 핵심 개념을 배웠습니다.
  - type: list
    items:
    - '기본 패턴: \\w, \\d, \\s, ., ^, $'
    - '수량자: +, *, ?, {n,m}, *?'
    - '문자 클래스: [abc], [^abc]'
    - '그룹: (), (?:), (?P<name>)'
    - '함수: findall, search, sub, split, finditer'
    - '플래그: re.I, re.M, re.S, re.DOTALL'
    - '고급: (?<=), (?=), (?<!), (?!)'
    - '실전: HTML 제거, 마스킹, 토큰 최적화'
  - type: text
    content: 이제 실무에서 자신있게 정규표현식을 사용하세요!
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
  - id: regex_10-llm-chunk-provenance-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: LLM 입력 chunk에 원문 provenance와 겹침 계약 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: token 목록을 고정 크기·겹침으로 나누고 source span을 보존한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - chunk 본문만 저장하지 말고 source ID와 token start/end를 함께 보존하세요.
    - overlap이 size 이상이면 진행하지 못하므로 계약 단계에서 거부하세요.
    exercise:
      prompt: chunk_tokens(tokens, size, overlap, source_id)를 완성하세요.
      starterCode: |-
        def chunk_tokens(tokens, size, overlap, source_id):
            raise NotImplementedError
      solution: |
        def chunk_tokens(tokens, size, overlap, source_id):
            if size <= 0 or overlap < 0 or overlap >= size:
                raise ValueError("invalid chunk contract")
            step = size - overlap
            chunks = []
            for start in range(0, len(tokens), step):
                values = tokens[start : start + size]
                if not values:
                    break
                chunks.append({"id": f"{source_id}:{start}-{start + len(values)}", "sourceId": source_id, "start": start, "end": start + len(values), "tokens": values})
                if start + size >= len(tokens):
                    break
            return chunks
      hints: *id001
    check:
      id: python.regex.regex_10.llm-chunk-provenance.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_10.llm-chunk-provenance.mastery.behavior.v1.fixture
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
        entry: chunk_tokens
        cases:
        - id: chunks-with-overlap
          arguments:
          - value:
            - a
            - b
            - c
            - d
            - e
          - value: 3
          - value: 1
          - value: doc
          expectedReturn:
          - id: doc:0-3
            sourceId: doc
            start: 0
            end: 3
            tokens:
            - a
            - b
            - c
          - id: doc:2-5
            sourceId: doc
            start: 2
            end: 5
            tokens:
            - c
            - d
            - e
        - id: handles-short-document
          arguments:
          - value:
            - a
          - value: 3
          - value: 0
          - value: one
          expectedReturn:
          - id: one:0-1
            sourceId: one
            start: 0
            end: 1
            tokens:
            - a
        - id: handles-empty-document
          arguments:
          - value: []
          - value: 3
          - value: 1
          - value: empty
          expectedReturn: []
        - id: rejects-overlap-equal-size
          arguments:
          - value:
            - a
          - value: 2
          - value: 2
          - value: doc
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: regex_10-llm-preprocessing-release-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_10-llm-chunk-provenance-mastery
    title: 새 LLM 전처리 산출물에 release 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: PII 잔존, 빈 chunk, provenance 누락, prompt injection flag를 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 전처리된 text가 깨끗해 보여도 source span과 PII scan 결과를 검사하세요.
    - 문서 안의 지시문을 시스템 instruction으로 승격하지 않도록 별도 flag를 남기세요.
    exercise:
      prompt: audit_llm_chunks(chunks)를 완성하세요.
      starterCode: |-
        def audit_llm_chunks(chunks):
            raise NotImplementedError
      solution: |
        def audit_llm_chunks(chunks):
            failures = []
            pii = sorted(chunk["id"] for chunk in chunks if chunk.get("piiFindings", 0) > 0)
            empty = sorted(chunk["id"] for chunk in chunks if not chunk.get("text", "").strip())
            missing_provenance = sorted(chunk.get("id", "<missing>") for chunk in chunks if not chunk.get("sourceId") or "start" not in chunk or "end" not in chunk)
            injections = sorted(chunk["id"] for chunk in chunks if chunk.get("instructionLike", False))
            if pii:
                failures.append("pii")
            if empty:
                failures.append("empty")
            if missing_provenance:
                failures.append("provenance")
            if injections:
                failures.append("instruction-boundary")
            return {"releaseReady": not failures, "failures": failures, "pii": pii, "empty": empty, "missingProvenance": missing_provenance, "instructionLike": injections}
      hints: *id002
    check:
      id: python.regex.regex_10.llm-preprocessing-release-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_10.llm-preprocessing-release-audit.transfer.behavior.v1.fixture
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
        entry: audit_llm_chunks
        cases:
        - id: accepts-clean-provenanced-chunk
          arguments:
          - value:
            - id: a:0-2
              sourceId: a
              start: 0
              end: 2
              text: safe
              piiFindings: 0
              instructionLike: false
          expectedReturn:
            releaseReady: true
            failures: []
            pii: []
            empty: []
            missingProvenance: []
            instructionLike: []
        - id: reports-pii-empty-and-injection
          arguments:
          - value:
            - id: bad
              sourceId: a
              start: 0
              end: 0
              text: ' '
              piiFindings: 2
              instructionLike: true
          expectedReturn:
            releaseReady: false
            failures:
            - pii
            - empty
            - instruction-boundary
            pii:
            - bad
            empty:
            - bad
            missingProvenance: []
            instructionLike:
            - bad
        - id: reports-missing-provenance
          arguments:
          - value:
            - id: x
              text: content
          expectedReturn:
            releaseReady: false
            failures:
            - provenance
            pii: []
            empty: []
            missingProvenance:
            - x
            instructionLike: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: regex_10-llm-preprocessing-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_10-llm-preprocessing-release-audit-transfer
    title: LLM 전처리 pipeline 종료 조건 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 정제·chunk·안전·provenance evidence를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - match 수만 보지 말고 정규화 뒤 보존된 의미와 거부된 입력을 함께 확인하세요.
    - regex가 아닌 전용 parser가 필요한 구조에서는 경계를 명시하세요.
    exercise:
      prompt: choose_llm_preprocessing_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_llm_preprocessing_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_llm_preprocessing_gate(situation):
            table = {'clean': {'action': 'normalize and mask before chunking', 'evidence': 'transformation counts', 'risk': 'PII residual'}, 'chunk': {'action': 'preserve source token spans', 'evidence': 'source-bound chunk IDs', 'risk': 'lost citation'}, 'release': {'action': 'audit PII empty and instruction boundary', 'evidence': 'zero blocking findings', 'risk': 'prompt injection'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.regex.regex_10.llm-preprocessing-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_10.llm-preprocessing-recall.retrieval.behavior.v1.fixture
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
        entry: choose_llm_preprocessing_gate
        cases:
        - id: recalls-clean
          arguments:
          - value: clean
          expectedReturn:
            action: normalize and mask before chunking
            evidence: transformation counts
            risk: PII residual
        - id: recalls-chunk
          arguments:
          - value: chunk
          expectedReturn:
            action: preserve source token spans
            evidence: source-bound chunk IDs
            risk: lost citation
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};