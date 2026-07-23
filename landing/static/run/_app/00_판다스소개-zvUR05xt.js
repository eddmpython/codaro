var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_00\r
  title: 판다스소개\r
  order: 0\r
  category: pandas\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - 판다스\r
  - 데이터분석\r
  - 입문\r
  - 검증\r
  - 로컬실행\r
  seo:\r
    title: 판다스(Pandas) 입문 - 파이썬 데이터분석 시작하기\r
    description: 파이썬 pandas 라이브러리로 데이터분석을 시작하세요. 실제 데이터(tips, titanic, penguins)로 바로 실습하며 배웁니다.\r
    keywords:\r
    - pandas\r
    - 판다스\r
    - 파이썬 데이터분석\r
    - DataFrame\r
    - 데이터프레임\r
intro:\r
  direction: 판다스소개에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.\r
  - 판다스소개 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 주문 DataFrame 기본 입력 확인\r
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 정제와 집계 처리 실행\r
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 행/열 수와 요약값 결과 검증\r
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.\r
    - label: 판다스소개 재사용\r
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 판다스소개 실행\r
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.\r
    - label: 판다스소개 완료\r
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🐼\r
    title: 판다스?? 파이썬 아니고??\r
    subtitle: 분명 파이썬 배우러 왔는데...\r
  - type: hero\r
    emoji: 🎯\r
    title: 실제 데이터로 바로 실습합니다\r
    subtitle: 이론 설명 없이, 목표를 정하고 직접 분석해봅니다\r
    points:\r
    - emoji: 📊\r
      title: 실제 데이터 사용\r
    - emoji: 🎯\r
      title: 목표 중심 학습\r
    - emoji: 🚫\r
      title: 이론 설명 없음\r
    - emoji: ✋\r
      title: 직접 해보기\r
  goal: 판다스?? 파이썬 아니고??에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 판다스로 뭘 할 수 있나요?\r
    subtitle: 실제로 이런 곳에서 씁니다\r
  - type: featureCards\r
    cards:\r
    - emoji: 📊\r
      title: 데이터 분석\r
      description: 매출 데이터, 설문조사 결과, 실험 데이터 등을 분석하고 인사이트 도출\r
    - emoji: 🧹\r
      title: 데이터 정제\r
      description: 결측치 처리, 이상치 제거, 데이터 형식 변환 등 전처리 작업\r
    - emoji: 📈\r
      title: 시각화 준비\r
      description: matplotlib, seaborn 등과 연동해서 차트/그래프 생성\r
    - emoji: 🤖\r
      title: 머신러닝 전처리\r
      description: scikit-learn, tensorflow 등에 넣기 전 데이터 준비\r
    - emoji: 💼\r
      title: 업무 자동화\r
      description: 엑셀 보고서 자동 생성, 데이터 병합, 정기 리포트\r
    - emoji: 🌐\r
      title: 웹 데이터 수집\r
      description: CSV, JSON, HTML 테이블 등 다양한 소스에서 데이터 로드\r
  goal: 🎯 판다스로 뭘 할 수 있나요?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: python_vs_pandas\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 파이썬 문법 다 배우고 판다스?\r
    subtitle: 그건 너무 멀고 험한 길입니다...\r
  - type: compare\r
    left:\r
      title: 파이썬 문법 마스터 후 판다스\r
      subtitle: 전통적인 방식\r
      icon: 😵\r
      color: orange\r
      items:\r
      - 변수 배우고...\r
      - 조건문 배우고...\r
      - 반복문 배우고...\r
      - 함수 배우고...\r
      - 클래스 배우고...\r
      - 모듈 배우고...\r
      - 드디어 판다스??\r
      infoBox: 😭 몇 달이 걸릴지 모릅니다\r
    right:\r
      title: 바로 판다스 시작!\r
      subtitle: 실용적인 방식\r
      icon: 🚀\r
      color: green\r
      items:\r
      - 변수 = 값 (5분)\r
      - 바로 데이터 분석!\r
      - 점(.) 찍으면 끝\r
      - 결과 바로 확인\r
      - 필요한 문법은 그때 학습\r
      infoBox: 🎉 오늘 바로 시작합시다!\r
  goal: 🤔 파이썬 문법 다 배우고 판다스?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: excel_connection\r
  blocks:\r
  - type: hero\r
    emoji: 📊\r
    title: 엑셀 스프레드시트 = DataFrame\r
    subtitle: 판다스는 엑셀 개념과 거의 같습니다\r
    points:\r
    - emoji: 📋\r
      title: 시트 = DataFrame\r
    - emoji: 🔤\r
      title: 열(A,B,C) = Column\r
    - emoji: 🔢\r
      title: 행(1,2,3) = Row\r
    - emoji: 📦\r
      title: 셀 = 값\r
  - type: table\r
    headers:\r
    - 이름\r
    - 나이\r
    - 점수\r
    rows:\r
    - - 철수\r
      - '25'\r
      - '85'\r
    - - 영희\r
      - '23'\r
      - '92'\r
    - - 민수\r
      - '27'\r
      - '78'\r
  - type: note\r
    title: 위 표가 바로 DataFrame입니다\r
    content: pandas에서 데이터는 이런 표 형태로 저장됩니다. 엑셀 시트와 똑같이 생겼죠?\r
  goal: 엑셀 스프레드시트 = DataFrame에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: excel_vs_pandas\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 엑셀 vs 판다스\r
    subtitle: 엑셀도 좋지만, 한계가 있습니다\r
  - type: table\r
    headers:\r
    - 비교 항목\r
    - 엑셀\r
    - 판다스\r
    rows:\r
    - - 대용량 처리\r
      - ❌ 100만 행 한계\r
      - ✅ 수천만 행 가능\r
    - - 반복 작업\r
      - ❌ 매번 수동 클릭\r
      - ✅ 코드 한 번으로 자동화\r
    - - 웹 데이터\r
      - ❌ 다운로드 → 열기\r
      - ✅ URL 한 줄로 바로\r
    - - 데이터 탐색\r
      - ❌ 스크롤하며 확인\r
      - ✅ df.describe() 한 줄\r
    - - 가격\r
      - 💰 Microsoft 365 구독\r
      - 🆓 완전 무료\r
    - - 재현성\r
      - ❌ 수동 작업 기록 안됨\r
      - ✅ 코드로 기록됨\r
  - type: note\r
    style: info\r
    title: 매일 같은 리포트 만드시나요?\r
    content: 엑셀로 30분 걸리던 작업, 판다스 코드 한 번 짜면 앞으로 1초면 끝납니다. 그렇게 판다스로 만든 결과를 엑셀로 옮기면 이게 바로 엑셀 자동화입니다.\r
  - type: video\r
    platform: local\r
    url: python/excel/xlwings_sample.webm\r
  goal: 🆚 엑셀 vs 판다스에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: alternatives\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤷 Polars? Modin? 그건 뭔가요?\r
    subtitle: 판다스 대안들도 있지만...\r
  - type: note\r
    style: info\r
    title: 왜 대안이 나왔을까?\r
    content: 판다스는 훌륭하지만, 수천만~수억 행의 대용량 데이터를 다루면 느려집니다. 최근 빅데이터 시대에 맞춰 더 빠른 대안들이 등장하고 있어요.\r
  - type: table\r
    headers:\r
    - 비교\r
    - Pandas\r
    - Polars\r
    - Modin\r
    rows:\r
    - - 속도\r
      - 기준\r
      - 약 57배 빠름\r
      - 약 4배 빠름\r
    - - 학습 난이도\r
      - ✅ 쉬움\r
      - ⚠️ 새 API 학습\r
      - ✅ 판다스와 동일\r
    - - ML 호환성\r
      - ✅ 완벽\r
      - ❌ 제한적\r
      - ✅ 완벽\r
    - - 커뮤니티\r
      - ✅ 가장 큼\r
      - ⚠️ 성장중\r
      - ⚠️ 작음\r
    - - 생태계\r
      - ✅ 가장 풍부\r
      - ⚠️ 제한적\r
      - ✅ 판다스 그대로\r
  - type: compare\r
    left:\r
      title: Polars\r
      subtitle: 속도의 왕\r
      icon: ⚡\r
      color: blue\r
      items:\r
      - Rust로 만들어서 엄청 빠름\r
      - 대용량 데이터에 최적화\r
      - 하지만 새로운 API 학습 필요\r
      - scikit-learn 등과 호환 안됨\r
      infoBox: 속도가 필요할 때 나중에 배우세요\r
    right:\r
      title: Modin\r
      subtitle: 판다스의 분신\r
      icon: 👯\r
      color: purple\r
      items:\r
      - 판다스 API 그대로 사용\r
      - 내부적으로 병렬 처리\r
      - 코드 한 줄도 안 바꿔도 됨\r
      - 대용량에서 최대 4배 빠름\r
      infoBox: 기존 코드 그대로 쓰고 싶을 때\r
  - type: note\r
    style: tip\r
    title: '결론: 판다스로 시작 → 확장'\r
    content: 판다스가 가장 직관적이고, 자료도 가장 많고, 대부분의 라이브러리와 호환됩니다. 판다스로 기본기 익힌 후, 필요하면 Polars나 Modin으로 확장하세요!\r
  goal: 🤷 Polars? Modin? 그건 뭔가요?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: roadmap\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 판다스 학습 로드맵\r
    subtitle: 이 순서대로 배우면 됩니다\r
  - type: table\r
    headers:\r
    - 단계\r
    - 배울 내용\r
    - 목표\r
    rows:\r
    - - 1단계\r
      - DataFrame 생성/조회\r
      - 데이터 불러오고 살펴보기\r
    - - 2단계\r
      - 데이터 선택/필터링\r
      - 원하는 데이터만 뽑아내기\r
    - - 3단계\r
      - 데이터 정제\r
      - 결측치, 중복 처리하기\r
    - - 4단계\r
      - 데이터 변환\r
      - 컬럼 추가, 타입 변환\r
    - - 5단계\r
      - 그룹화/집계\r
      - 통계 내고 요약하기\r
    - - 6단계\r
      - 데이터 병합\r
      - 여러 데이터 합치기\r
  - type: note\r
    style: info\r
    title: 실습은 우측 Codaro에서!\r
    content: 필요한 패키지는 uv로 준비한 뒤 바로 실습할 수 있습니다. 코드를 직접 써보면서 배워보세요!\r
  goal: 🗺️ 판다스 학습 로드맵에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: cheat_sheet\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 판다스 치트시트\r
    subtitle: 자주 쓰는 함수/메서드 빠른 참조표\r
  - type: note\r
    style: info\r
    title: 치트시트(Cheat Sheet)란?\r
    content: 시험 볼 때 몰래 보는 컨닝페이퍼처럼, 자주 쓰는 명령어를 정리한 참조표입니다. 자주 볼 수 있는 곳에 두면 도움됩니다.\r
  - type: pdf\r
    url: https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf\r
    title: Pandas 공식 Cheat Sheet\r
    height: 800px\r
  goal: 📋 판다스 치트시트에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: official_docs\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 체계적으로 공부하고 싶다면\r
    subtitle: 순서대로 차근차근 배우고 싶은 분들을 위해\r
  - type: note\r
    style: info\r
    title: 이 커리큘럼의 방식\r
    content: 아무것도 모르는 상태에서 실제 데이터로 바로 실습합니다. 목표를 정하고 분석하면서 배우는 게 훨씬 효과적이거든요. 그래서 이론 설명은 따로 하지 않습니다. 만약\r
      체계적으로 공부하고 싶다면 Pandas공식문서를 우선 공부하면 도움됩니다.\r
  - type: links\r
    items:\r
    - text: pandas 공식 문서\r
      url: https://pandas.pydata.org/docs/getting_started/index.html\r
      icon: 🔗\r
  goal: 📚 체계적으로 공부하고 싶다면에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: DataFrame 완전 정복'\r
    subtitle: 엑셀 시트처럼 생긴 DataFrame, 직접 만들고 다뤄봅시다!\r
  goal: '다음: DataFrame 완전 정복에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.'\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 DataFrame 기본 점검'\r
  structuredPrimary: true\r
  subtitle: DataFrame 생성, 컬럼 검증, 집계, 실패 케이스\r
  goal: '현업 흐름 검증: 주문 DataFrame 기본 점검에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Pandas는 표를 읽고 바로 업무 질문에 답하는 도구입니다. 처음에는 컬럼이 있는지, 금액이 올바른지, 집계가 원본과 맞는지 확인하는 습관부터 잡아야 합니다.\r
\r
    변주 실험\r
    요일 대신 지점별 매출을 집계하고, 지점 컬럼이 누락됐을 때 어떤 오류 메시지가 더 업무적으로 명확한지 바꿔보세요.\r
  tips:\r
  - 변주 실험 요일 대신 지점별 매출을 집계하고, 지점 컬럼이 누락됐을 때 어떤 오류 메시지가 더 업무적으로 명확한지 바꿔보세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    orders = pd.DataFrame({\r
        "orderId": ["O-1", "O-2", "O-3"],\r
        "day": ["Mon", "Mon", "Tue"],\r
        "amount": [12000, 8000, 15000],\r
    })\r
\r
    daily = orders.groupby("day", as_index=False)["amount"].sum()\r
\r
    assert list(orders.columns) == ["orderId", "day", "amount"]\r
    assert daily.set_index("day").loc["Mon", "amount"] == 20000\r
    assert daily["amount"].sum() == orders["amount"].sum()\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 DataFrame 기본 점검 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import pandas as pd\r
\r
      orders = pd.DataFrame({\r
          "orderId": ["O-1", "O-2", "O-3"],\r
          "day": ["Mon", "Mon", "Tue"],\r
          "amount": [12000, 8000, 15000],\r
      })\r
\r
      daily = orders.groupby("day", as_index=False)["amount"].sum()\r
\r
      assert list(orders.columns) == ["orderId", "day", "amount"]\r
      assert daily.set_index("day").loc["Mon", "amount"] == 20000\r
      assert daily["amount"].sum() == orders["amount"].sum()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 DataFrame 기본 점검의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 DataFrame 기본 점검의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.'\r
`;export{e as default};