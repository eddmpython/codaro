var e=`meta:\r
  id: regex_08\r
  title: 텍스트정제토큰화\r
  order: 8\r
  category: regex\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 텍스트 정제\r
  - 토큰화\r
  - split\r
  - LLM\r
  - 전처리\r
  seo:\r
    title: 정규표현식 중급 - 텍스트 정제와 토큰화\r
    description: 정규표현식으로 텍스트를 정제하고 토큰화합니다. re.split, 노이즈 제거, LLM 전처리를 배웁니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - 텍스트 정제\r
    - 토큰화\r
    - LLM 전처리\r
intro:\r
  emoji: 🧹\r
  goal: 로컬 노이즈 텍스트를 정제하고 토큰화하여 LLM 입력을 준비합니다.\r
  description: LLM 전처리의 핵심 단계입니다. 노이즈 제거, 정규화, 토큰화를 통해 토큰 수를 최소화하고 품질을 높입니다.\r
  direction: 텍스트정제토큰화에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - 텍스트정제토큰화 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 텍스트 데이터 로드 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 특수문자 제거 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 텍스트정제토큰화 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 텍스트정제토큰화 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: 텍스트정제토큰화 완료\r
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
- id: step2_load_text\r
  title: 2단계. 텍스트 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 로컬 노이즈 텍스트\r
  goal: 2단계. 텍스트 데이터 로드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 고객 피드백, 지원 티켓, 검색 로그처럼 노이즈가 섞인 로컬 문단을 준비합니다. 특수문자, 반복 단어, 줄바꿈, 대소문자 혼재가 들어 있어 텍스트 정제와 토큰화 흐름을 네트워크 없이 안정적으로 연습할 수 있습니다.\r
\r
    특수문자, 불필요한 공백, 대소문자 혼재 등 노이즈가 많습니다. 이런 노이즈는 LLM API 호출 시 토큰 수를 증가시키고, 분석 품질을 저하시킵니다. 정제 과정을 통해 불필요한 토큰을 줄이면 API 비용을 절감하고 응답 품질을 높일 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    textData = [\r
        "Customer feedback!!!  Delivery was fast, but packaging   had extra spaces.",\r
        "Support tickets mention login-errors, slow pages, and repeated repeated words.",\r
        "LLM preprocessing should remove noise; normalize whitespace; keep useful terms.",\r
        "Product reviews include UPPERCASE words, punctuation??? and line\\nbreaks.",\r
        "Search logs contain query fragments, duplicate tokens, and messy separators.",\r
    ]\r
\r
    rawText = " ".join(textData)\r
    rawText[:300]\r
  exercise:\r
    prompt: 2단계. 텍스트 데이터 로드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      textData = [\r
          "Customer feedback!!!  Delivery was fast, but packaging   had extra spaces.",\r
          "Support tickets mention login-errors, slow pages, and repeated repeated words.",\r
          "LLM preprocessing should remove noise; normalize whitespace; keep useful terms.",\r
          "Product reviews include UPPERCASE words, punctuation??? and line\\nbreaks.",\r
          "Search logs contain query fragments, duplicate tokens, and messy separators.",\r
      ]\r
\r
      rawText = " ".join(textData)\r
      rawText[:300]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 텍스트 데이터 로드의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 텍스트 데이터 로드의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step3_remove_special_chars\r
  title: 3단계. 특수문자 제거\r
  structuredPrimary: true\r
  subtitle: 알파벳과 공백만 남기기\r
  goal: 3단계. 특수문자 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    LLM 입력에 불필요한 특수문자를 제거합니다. 쉼표, 마침표, 느낌표 등의 구두점과 특수 기호는 대부분의 분석에서 불필요합니다. 부정 문자 클래스 [^...]를 사용하면 유지할 문자만 지정하고 나머지는 모두 제거할 수 있습니다.\r
\r
    [^...] 부정 문자 클래스\r
    - \`[a-zA-Z\\s]\` : 알파벳과 공백만 - \`[^a-zA-Z\\s]\` : 알파벳과 공백이 **아닌** 모든 것 - \`^\` 가 [ ] 안에 있으면 부정의 의미!\r
  tips:\r
  - '[^...] 부정 문자 클래스 - \`[a-zA-Z\\s]\` : 알파벳과 공백만 - \`[^a-zA-Z\\s]\` : 알파벳과 공백이 **아닌** 모든 것 - \`^\` 가 [ ] 안에\r
    있으면 부정의 의미!'\r
  snippet: |-\r
    cleanedText = re.sub(r"[^a-zA-Z\\s]", "", rawText)\r
    cleanedText[:200]\r
  exercise:\r
    prompt: 3단계. 특수문자 제거 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cleanedText = re.sub(r"[^a-zA-Z\\s]", "", rawText)\r
      cleanedText[:200]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 특수문자 제거의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 특수문자 제거의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step4_normalize_whitespace\r
  title: 4단계. 공백 정규화\r
  structuredPrimary: true\r
  subtitle: 연속 공백을 하나로\r
  goal: 4단계. 공백 정규화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    연속된 공백을 하나로 통일하여 토큰 낭비를 줄입니다. 웹에서 수집한 텍스트에는 종종 탭, 줄바꿈, 연속 공백 등이 포함됩니다. \\\\s+ 패턴으로 모든 종류의 공백 문자를 하나의 공백으로 정규화하면 깔끔한 텍스트를 얻을 수 있습니다.\r
\r
    **토큰 절약 효과:** - "word word" (4개 공백) : 약 5 토큰 - "word word" (1개 공백) : 약 2 토큰 - **60% 절약!**\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    normalizedText = re.sub(r"\\s+", " ", cleanedText)\r
    normalizedText = normalizedText.strip()\r
    normalizedText[:200]\r
  exercise:\r
    prompt: 4단계. 공백 정규화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      normalizedText = re.sub(r"\\s+", " ", cleanedText)\r
      normalizedText = normalizedText.strip()\r
      normalizedText[:200]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 공백 정규화의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 공백 정규화의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step5_lowercase\r
  title: 5단계. 소문자 변환\r
  structuredPrimary: true\r
  subtitle: 대소문자 통일\r
  goal: 5단계. 소문자 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    대소문자를 통일하여 일관성을 높이고 토큰 수를 줄입니다. LLM의 토크나이저는 대소문자를 구분하여 Hello와 hello를 다른 토큰으로 처리합니다. 소문자로 통일하면 어휘 크기가 줄어 효율성이 높아지고, 검색이나 비교도 쉬워집니다.\r
\r
    대소문자와 토큰\r
    LLM 토크나이저는 대소문자를 다른 토큰으로 인식: - "Bacon" : 1 토큰 - "bacon" : 1 토큰 - "BACON" : 1 토큰 소문자로 통일하면 어휘 크기 감소!\r
  tips:\r
  - '대소문자와 토큰 LLM 토크나이저는 대소문자를 다른 토큰으로 인식: - "Bacon" : 1 토큰 - "bacon" : 1 토큰 - "BACON" : 1 토큰 소문자로 통일하면\r
    어휘 크기 감소!'\r
  snippet: |-\r
    lowercaseText = normalizedText.lower()\r
    lowercaseText[:200]\r
  exercise:\r
    prompt: 5단계. 소문자 변환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lowercaseText = normalizedText.lower()\r
      lowercaseText[:200]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 소문자 변환의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 소문자 변환의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step6_tokenization\r
  title: 6단계. 토큰화\r
  structuredPrimary: true\r
  subtitle: re.split()으로 단어 분리\r
  goal: 6단계. 토큰화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    텍스트를 단어 단위로 분리합니다.\r
\r
    re.split(패턴, 텍스트)\r
    **re.split()**: - 패턴을 구분자로 텍스트 분리 - str.split()보다 유연함 - 여러 구분자 동시 사용 가능 예: \`re.split(r"[,;\\s]+", text)\` → 쉼표, 세미콜론, 공백으로 분리\r
  tips:\r
  - 're.split(패턴, 텍스트) **re.split()**: - 패턴을 구분자로 텍스트 분리 - str.split()보다 유연함 - 여러 구분자 동시 사용 가능 예: \`re.split(r"[,;\\s]+",\r
    text)\` → 쉼표, 세미콜론, 공백으로 분리'\r
  snippet: |-\r
    tokens = lowercaseText.split()\r
    tokens[:20]\r
  exercise:\r
    prompt: 6단계. 토큰화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      tokens = lowercaseText.split()\r
      tokens[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 토큰화의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 토큰화의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: step7_advanced_tokenization\r
  title: 7단계. 고급 토큰화\r
  structuredPrimary: true\r
  subtitle: 여러 구분자 동시 처리\r
  goal: 7단계. 고급 토큰화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    실제 텍스트는 공백 외에도 쉼표, 마침표 등으로 구분됩니다.\r
\r
    결과: ['Hello', 'world', 'How', 'are', 'you', 'Fine', 'thanks']\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    testText = "Hello, world! How are you? Fine, thanks."\r
\r
    tokens = re.split(r"[\\s,!?.;]+", testText)\r
    tokens = [t for t in tokens if t]\r
    tokens\r
  exercise:\r
    prompt: 7단계. 고급 토큰화 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      testText = "Hello, world! How are you? Fine, thanks."\r
\r
      tokens = re.split(r"[\\s,!?.;]+", testText)\r
      tokens = [t for t in tokens if t]\r
      tokens\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 고급 토큰화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 고급 토큰화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_ngrams\r
  title: 8단계. N-gram 추출\r
  structuredPrimary: true\r
  subtitle: 연속된 단어 조합\r
  goal: 8단계. Ngram 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    문맥 분석을 위해 연속된 2~3개 단어를 추출합니다.\r
\r
    N-gram의 활용\r
    N-gram은 문맥을 유지하면서 텍스트를 분석할 때 사용: - Bigram (2-gram): 연속된 2개 단어 - Trigram (3-gram): 연속된 3개 단어 검색, 추천, 자동 완성 등에 활용\r
  tips:\r
  - 'N-gram의 활용 N-gram은 문맥을 유지하면서 텍스트를 분석할 때 사용: - Bigram (2-gram): 연속된 2개 단어 - Trigram (3-gram): 연속된\r
    3개 단어 검색, 추천, 자동 완성 등에 활용'\r
  snippet: |-\r
    words = lowercaseText.split()[:50]\r
\r
    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]\r
    bigrams[:10]\r
  exercise:\r
    prompt: 8단계. Ngram 추출 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      words = lowercaseText.split()[:50]\r
\r
      bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]\r
      bigrams[:10]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. Ngram 추출의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. Ngram 추출 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_complete_pipeline\r
  title: 9단계. 완성된 전처리 파이프라인\r
  structuredPrimary: true\r
  subtitle: 모든 단계 통합\r
  goal: 9단계. 완성된 전처리 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 배운 모든 기법을 합쳐 완성된 파이프라인을 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def preprocessText(text):\r
        text = re.sub(r"[^a-zA-Z\\s]", "", text)\r
\r
        text = re.sub(r"\\s+", " ", text)\r
        text = text.strip()\r
\r
        text = text.lower()\r
\r
        tokens = re.split(r"\\s+", text)\r
\r
        return {\r
            "clean_text": text,\r
            "tokens": tokens,\r
            "token_count": len(tokens)\r
        }\r
\r
    result = preprocessText(rawText)\r
    f"토큰 수: {result['token_count']}\\n처음 10개 토큰: {result['tokens'][:10]}"\r
  exercise:\r
    prompt: 9단계. 완성된 전처리 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def preprocessText(text):\r
          text = re.sub(r"[^a-zA-Z\\s]", "", text)\r
\r
          text = re.sub(r"\\s+", " ", text)\r
          text = text.strip()\r
\r
          text = text.lower()\r
\r
          tokens = re.split(r"\\s+", text)\r
\r
          return {\r
              "clean_text": text,\r
              "tokens": tokens,\r
              "token_count": len(tokens)\r
          }\r
\r
      result = preprocessText(rawText)\r
      f"토큰 수: {result['token_count']}\\n처음 10개 토큰: {result['tokens'][:10]}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 완성된 전처리 파이프라인의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 완성된 전처리 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_comparison\r
  title: 10단계. 전처리 전후 비교\r
  structuredPrimary: true\r
  subtitle: 토큰 절약 효과\r
  goal: 10단계. 전처리 전후 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    전처리 전후의 토큰 수를 비교합니다.\r
\r
    LLM API 비용 절감\r
    평균 20~40% 토큰 절약: - 특수문자 제거: 10% - 공백 정규화: 5% - 소문자 변환: 5~10% - 불필요한 반복 제거: 10% **실제 효과**: 10,000 토큰 → 6,000 토큰 = API 비용 40% 절감!\r
  tips:\r
  - 'LLM API 비용 절감 평균 20~40% 토큰 절약: - 특수문자 제거: 10% - 공백 정규화: 5% - 소문자 변환: 5~10% - 불필요한 반복 제거: 10% **실제\r
    효과**: 10,000 토큰 → 6,000 토큰 = API 비용 40% 절감!'\r
  snippet: |-\r
    original = preprocessText(rawText)\r
    originalLen = len(rawText)\r
    cleanedLen = len(original['clean_text'])\r
    saved = ((originalLen - cleanedLen) / originalLen) * 100\r
\r
    f"원본 길이: {originalLen}자\\n정제 후: {cleanedLen}자\\n절약: {saved:.1f}%\\n\\n원본 토큰 수 (추정): {originalLen // 4}\\n정제 후 토큰: {original['token_count']}"\r
  exercise:\r
    prompt: 10단계. 전처리 전후 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      original = preprocessText(rawText)\r
      originalLen = len(rawText)\r
      cleanedLen = len(original['clean_text'])\r
      saved = ((originalLen - cleanedLen) / originalLen) * 100\r
\r
      f"원본 길이: {originalLen}자\\n정제 후: {cleanedLen}자\\n절약: {saved:.1f}%\\n\\n원본 토큰 수 (추정): {originalLen // 4}\\n정제 후 토큰: {original['token_count']}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 전처리 전후 비교의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 전처리 전후 비교의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 텍스트 정제 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    데이터 엔지니어가 되어 텍스트를 정제하고 분석합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import re\r
\r
    text = """\r
    Contact us: support@company.com, sales@company.com\r
    Partners: partner@service.org, info@service.org\r
    Admin: admin@shop.io\r
    """\r
\r
    emails = re.findall(r"[\\w.]+@[\\w.]+\\.\\w+", text)\r
    emails\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import re\r
\r
      text = """\r
      Contact us: support@company.com, sales@company.com\r
      Partners: partner@service.org, info@service.org\r
      Admin: admin@shop.io\r
      """\r
\r
      emails = re.findall(r"[\\w.]+@[\\w.]+\\.\\w+", text)\r
      emails\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 실습의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 여덟 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 텍스트 정제와 토큰화를 배웠습니다. LLM 전처리의 핵심 단계입니다.\r
  - type: list\r
    items:\r
    - '[^...] - 부정 문자 클래스'\r
    - re.split() - 패턴으로 분리\r
    - \\s+ - 공백 정규화\r
    - 토큰화 - 단어 단위 분리\r
  - type: text\r
    content: 다음은 심화 단계입니다! lookahead와 lookbehind를 배웁니다.\r
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