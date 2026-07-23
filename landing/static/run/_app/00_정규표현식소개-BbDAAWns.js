var e=`meta:\r
  id: regex_00\r
  title: 정규표현식소개\r
  order: 0\r
  category: regex\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - 정규표현식\r
  - regex\r
  - re\r
  - 패턴 매칭\r
  - 텍스트 처리\r
  - 비정형 데이터\r
  seo:\r
    title: Python 정규표현식(re) 입문 - 비정형 데이터 마스터\r
    description: Python re 모듈로 정규표현식을 배우세요. 이메일 추출, 텍스트 정제, LLM 전처리까지 실전 프로젝트로 마스터합니다.\r
    keywords:\r
    - 정규표현식\r
    - regex\r
    - Python re\r
    - 패턴 매칭\r
    - 텍스트 처리\r
    - LLM 전처리\r
intro:\r
  direction: 정규표현식소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.\r
  - 정규표현식소개 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 연락처 텍스트 정제 파이프라인 입력 확인\r
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.\r
    - label: 패턴 매칭과 치환 처리 실행\r
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 매치 그룹, 추출 목록, 치환 결과 검증\r
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 정규표현식소개 재사용\r
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 텍스트 정제 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 정규표현식소개 실행\r
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.\r
    - label: 정규표현식소개 완료\r
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🔍\r
    title: 정규표현식??\r
    subtitle: 비정형 텍스트를 어떻게 다루지?\r
  - type: hero\r
    emoji: 🎯\r
    title: 패턴으로 텍스트 정복\r
    subtitle: 비정형 데이터 처리의 핵심 도구\r
    points:\r
    - emoji: 📧\r
      title: 이메일 주소 한 번에 추출\r
    - emoji: 📱\r
      title: 전화번호 형식 자동 통일\r
    - emoji: 🔐\r
      title: 개인정보 자동 마스킹\r
    - emoji: 🤖\r
      title: LLM 토큰 30% 절약\r
  goal: 정규표현식??에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: why_regex\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 왜 정규표현식을 배워야 하나요?\r
    subtitle: 실무에서 매일 마주치는 문제들\r
  - type: text\r
    content: |-\r
      데이터는 항상 깔끔하지 않습니다. 실제 현장에서는 비정형 텍스트를 다루는 일이 훨씬 많습니다.\r
\r
      - 웹 크롤링한 HTML에서 순수 텍스트만 추출하고 싶다면?\r
      - 로그 파일에서 에러 메시지만 찾아내고 싶다면?\r
      - 수천 개의 문서에서 이메일 주소를 한 번에 추출하고 싶다면?\r
      - 다양한 날짜 형식을 통일된 형태로 변환하고 싶다면?\r
\r
      정규표현식은 이 모든 문제를 한 줄의 패턴으로 해결합니다.\r
  - type: compare\r
    left:\r
      title: 수동 처리\r
      subtitle: 전통적인 방식\r
      icon: ✋\r
      color: gray\r
      items:\r
      - if/else 수십 줄 작성\r
      - 모든 경우의 수 체크\r
      - 새로운 형식마다 코드 수정\r
      - 느리고 에러 발생 쉬움\r
      - 유지보수 어려움\r
      infoBox: 비효율적이고 시간 낭비\r
    right:\r
      title: 정규표현식\r
      subtitle: 현대적인 방식\r
      icon: 🎯\r
      color: green\r
      items:\r
      - 패턴 한 줄로 끝\r
      - 다양한 형식 한 번에 처리\r
      - 패턴만 수정하면 됨\r
      - 빠르고 정확함\r
      - 간결하고 재사용 가능\r
      infoBox: 효율적이고 강력한 도구\r
  goal: 🤔 왜 정규표현식을 배워야 하나요?에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: llm_era\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤖 LLM 시대의 정규표현식\r
    subtitle: 토큰 비용을 30% 절약하는 비결\r
  - type: text\r
    content: |-\r
      ChatGPT, Claude 같은 LLM API를 사용할 때 토큰 수가 곧 비용입니다. 하지만 대부분의 웹 데이터는 노이즈 투성이죠.\r
\r
      HTML 태그, 특수문자, 불필요한 공백... 이런 것들이 토큰을 낭비합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🗑️\r
      title: 노이즈 제거\r
      description: HTML 태그, 특수문자 제거로 토큰 30% 이상 절감\r
    - emoji: 🎯\r
      title: 정보 추출\r
      description: 필요한 부분만 정확히 추출하여 프롬프트 최소화\r
    - emoji: 🔄\r
      title: 형식 통일\r
      description: 다양한 형식을 정규화하여 LLM 이해도 향상\r
    - emoji: 💰\r
      title: 비용 절감\r
      description: 전처리로 API 호출 비용 크게 감소\r
  - type: note\r
    style: tip\r
    title: 실제 사례\r
    content: |-\r
      100KB HTML 문서를 정규표현식으로 전처리하면 20KB 순수 텍스트만 남습니다.\r
      토큰 수: 25,000 → 5,000 (80% 절감!)\r
      비용: $0.50 → $0.10 (API 비용 5배 절약)\r
  goal: 🤖 LLM 시대의 정규표현식에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: real_world_uses\r
  blocks:\r
  - type: sectionHeader\r
    title: 💼 실무 활용 사례\r
    subtitle: 어디에 쓰이나요?\r
  - type: table\r
    headers:\r
    - 직무\r
    - 활용 예시\r
    - 효과\r
    rows:\r
    - - 데이터 엔지니어\r
      - 로그 파싱, ETL 파이프라인\r
      - 처리 시간 90% 단축\r
    - - 백엔드 개발자\r
      - 입력 검증, 포맷 변환\r
      - 보안 취약점 사전 차단\r
    - - 데이터 분석가\r
      - 텍스트 정제, 패턴 발견\r
      - 분석 품질 향상\r
    - - AI/ML 엔지니어\r
      - NLP 전처리, 특성 추출\r
      - 모델 성능 개선\r
    - - 웹 개발자\r
      - 폼 검증, URL 파싱\r
      - 사용자 경험 개선\r
  - type: note\r
    style: info\r
    title: 프로그래밍 언어 공통 기술\r
    content: 정규표현식은 Python뿐 아니라 JavaScript, Java, Go, Rust 등 모든 언어에서 사용됩니다. 한 번 배우면 어디서나 활용 가능합니다.\r
  goal: 💼 실무 활용 사례에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: key_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 핵심 개념 미리보기\r
    subtitle: 10개 프로젝트로 배울 내용\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔤\r
      title: 기본 패턴\r
      description: ., ^, $, \\d, \\w, \\s 등 기초 메타문자\r
    - emoji: 🔢\r
      title: 수량자\r
      description: '*, +, ?, {n,m}으로 반복 횟수 지정'\r
    - emoji: 📦\r
      title: 그룹과 캡처\r
      description: (pattern)으로 패턴 묶기, (?P<name>)으로 이름 지정\r
    - emoji: 🔧\r
      title: re 모듈 함수\r
      description: search, findall, sub, split 등 핵심 함수\r
    - emoji: 🚩\r
      title: 플래그\r
      description: re.IGNORECASE, re.MULTILINE 등 옵션\r
    - emoji: 🎓\r
      title: 고급 기능\r
      description: lookahead, lookbehind로 복잡한 조건 매칭\r
  goal: 🎯 핵심 개념 미리보기에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 10개 프로젝트 로드맵\r
    subtitle: 난이도별 개념 누적 학습\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    - 데이터 소스\r
    rows:\r
    - - 입문\r
      - 01 이메일주소추출\r
      - 기본 패턴, 문자 클래스, findall\r
      - 로컬 사용자 JSON\r
    - - 입문\r
      - 02 전화번호형식통일\r
      - 그룹 캡처, sub, 형식 변환\r
      - 로컬 전화번호 샘플\r
    - - 기초\r
      - 03 URL구조분해\r
      - 이름 있는 그룹, 복잡한 패턴\r
      - 로컬 웹사이트 샘플\r
    - - 기초\r
      - 04 HTML태그제거\r
      - 비탐욕적 매칭, DOTALL 플래그\r
      - 코드 내 샘플\r
    - - 기초\r
      - 05 로그파일분석\r
      - 멀티라인, 타임스탬프 파싱\r
      - 코드 내 로그\r
    - - 중급\r
      - 06 날짜형식변환\r
      - 복잡한 패턴, 다양한 형식 처리\r
      - 코드 내 샘플\r
    - - 중급\r
      - 07 개인정보마스킹\r
      - 역참조, 부분 치환\r
      - 코드 내 샘플\r
    - - 중급\r
      - 08 텍스트정제토큰화\r
      - split, 노이즈 제거, LLM 전처리\r
      - 로컬 노이즈 텍스트\r
    - - 심화\r
      - 09 고급패턴매칭\r
      - lookahead, lookbehind, 조건부\r
      - 코드 내 샘플\r
    - - 심화\r
      - 10 LLM전처리파이프라인\r
      - 모든 개념 종합, 실전 자동화\r
      - 로컬 게시글 + HTML\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 이전 프로젝트의 개념을 반복 사용하면서 새로운 개념을 추가로 배웁니다.\r
  goal: 🗺️ 10개 프로젝트 로드맵에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: pattern_examples\r
  blocks:\r
  - type: sectionHeader\r
    title: ✨ 실제 패턴 맛보기\r
    subtitle: 정규표현식의 강력함을 느껴보세요\r
  - type: table\r
    headers:\r
    - 찾고 싶은 것\r
    - 패턴\r
    - 설명\r
    rows:\r
    - - 이메일\r
      - \\w+@\\w+\\.\\w+\r
      - 단어@단어.단어 형식\r
    - - 전화번호\r
      - \\d{2,3}-\\d{3,4}-\\d{4}\r
      - 2~3자리-3~4자리-4자리\r
    - - URL\r
      - https?://[\\w.-]+\r
      - http 또는 https로 시작\r
    - - 날짜\r
      - \\d{4}-\\d{2}-\\d{2}\r
      - YYYY-MM-DD 형식\r
    - - 주민번호\r
      - \\d{6}-[1-4]\\d{6}\r
      - 6자리-1~4로 시작하는 7자리\r
    - - HTML 태그\r
      - <[^>]+>\r
      - < 와 > 사이의 모든 문자\r
  - type: note\r
    style: tip\r
    title: 패턴은 언어입니다\r
    content: 정규표현식은 텍스트 패턴을 표현하는 작은 언어입니다. 처음엔 어렵지만 10개 프로젝트를 완료하면 자유자재로 사용할 수 있습니다.\r
  goal: ✨ 실제 패턴 맛보기에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: vs_other_methods\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ 다른 방법과 비교\r
    subtitle: 정규표현식 vs 다른 텍스트 처리 방법\r
  - type: table\r
    headers:\r
    - 방법\r
    - 장점\r
    - 단점\r
    - 추천 상황\r
    rows:\r
    - - 정규표현식\r
      - 강력, 간결, 빠름\r
      - 학습 곡선 있음\r
      - 패턴이 명확한 텍스트\r
    - - 문자열 메서드\r
      - 쉬움, 직관적\r
      - 복잡한 패턴 처리 어려움\r
      - 단순한 문자열 조작\r
    - - 파서 라이브러리\r
      - 정확, 구조화\r
      - 특정 형식만 지원\r
      - HTML, XML, JSON\r
    - - LLM API\r
      - 유연, 맥락 이해\r
      - 비용, 느림\r
      - 복잡한 자연어 처리\r
  - type: note\r
    style: info\r
    title: 조합이 최고\r
    content: 정규표현식으로 전처리 → LLM으로 분석하면 비용은 줄이고 정확도는 높일 수 있습니다.\r
  goal: ⚖️ 다른 방법과 비교에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: performance\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚡ 성능 비교\r
    subtitle: 정규표현식은 얼마나 빠를까?\r
  - type: featureCards\r
    cards:\r
    - emoji: 🐢\r
      title: 반복문 + if/else\r
      description: '100만 줄 처리 시간: 15초'\r
    - emoji: 🚗\r
      title: 문자열 메서드\r
      description: '100만 줄 처리 시간: 5초'\r
    - emoji: 🚀\r
      title: 정규표현식\r
      description: '100만 줄 처리 시간: 0.5초'\r
  - type: note\r
    style: tip\r
    title: C로 구현된 고성능 엔진\r
    content: Python re 모듈은 C로 작성되어 매우 빠릅니다. 대용량 텍스트 처리에 최적화되어 있습니다.\r
  goal: ⚡ 성능 비교에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: learning_path\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎓 학습 로드맵\r
    subtitle: 어떻게 배우나요?\r
  - type: featureCards\r
    cards:\r
    - emoji: 1️⃣\r
      title: 입문 (01-02)\r
      description: 기본 패턴, 문자 클래스, 간단한 추출/치환\r
    - emoji: 2️⃣\r
      title: 기초 (03-05)\r
      description: 그룹, 플래그, 복잡한 패턴 조합\r
    - emoji: 3️⃣\r
      title: 중급 (06-08)\r
      description: 고급 패턴, 전처리 파이프라인 구축\r
    - emoji: 4️⃣\r
      title: 심화 (09-10)\r
      description: lookaround, 실전 프로젝트 자동화\r
  - type: note\r
    style: info\r
    title: 개념 누적 방식\r
    content: 각 프로젝트는 이전 프로젝트의 개념을 반복 사용하면서 새로운 개념을 추가합니다. 10개 프로젝트를 완료하면 정규표현식의 모든 핵심 개념을 마스터하게 됩니다.\r
  goal: 🎓 학습 로드맵에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: tools\r
  blocks:\r
  - type: sectionHeader\r
    title: 🛠️ 유용한 도구\r
    subtitle: 정규표현식 학습과 테스트\r
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: regex101.com\r
      description: 온라인 정규표현식 테스터. 패턴 설명, 매칭 확인\r
    - emoji: 🔍\r
      title: regexr.com\r
      description: 비주얼 정규표현식 에디터. 실시간 매칭 확인\r
    - emoji: 📚\r
      title: regexlearn.com\r
      description: 인터랙티브 정규표현식 튜토리얼\r
    - emoji: 🎮\r
      title: regexcrossword.com\r
      description: 정규표현식 퍼즐 게임으로 재미있게 학습\r
  goal: 🛠️ 유용한 도구에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: common_mistakes\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚠️ 흔한 실수\r
    subtitle: 초보자가 자주 하는 실수들\r
  - type: table\r
    headers:\r
    - 실수\r
    - 문제\r
    - 해결\r
    rows:\r
    - - 특수문자 이스케이프 안 함\r
      - . 이 모든 문자 매칭\r
      - \\. 으로 이스케이프\r
    - - 탐욕적 매칭\r
      - .* 가 너무 많이 매칭\r
      - .*? 비탐욕적 사용\r
    - - 플래그 미사용\r
      - 대소문자 구분으로 놓침\r
      - re.IGNORECASE 사용\r
    - - 그룹 번호 혼동\r
      - \\1, \\2 순서 틀림\r
      - (?P<name>) 이름 사용\r
    - - 패턴 검증 안 함\r
      - 예상치 못한 매칭\r
      - regex101에서 테스트\r
  - type: note\r
    style: warning\r
    title: 처음엔 어렵습니다\r
    content: 정규표현식은 암호처럼 보일 수 있습니다. 하지만 10개 프로젝트를 따라하다 보면 자연스럽게 익숙해집니다. 포기하지 마세요!\r
  goal: ⚠️ 흔한 실수에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Python re 공식 문서\r
      url: https://docs.python.org/ko/3/library/re.html\r
      icon: 🔗\r
    - text: 정규식 HOWTO (한글)\r
      url: https://docs.python.org/ko/3/howto/regex.html\r
      icon: 🔗\r
    - text: Regular Expressions Info\r
      url: https://www.regular-expressions.info/\r
      icon: 🔗\r
    - text: regex101 (온라인 테스터)\r
      url: https://regex101.com/\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 이메일 주소 추출'\r
    subtitle: 로컬 사용자 샘플에서 다양한 형식의 이메일을 추출하는 첫 프로젝트를 시작합니다\r
  goal: '다음: 이메일 주소 추출에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.'\r
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