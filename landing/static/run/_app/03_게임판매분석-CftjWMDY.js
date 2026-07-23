var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_03\r
  title: 게임판매분석\r
  order: 3\r
  category: polars\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:video_games\r
  tags:\r
  - vgsales\r
  - select\r
  - filter\r
  - group_by\r
  - agg\r
  - alias\r
  - head\r
  seo:\r
    title: Polars 다중 그룹 집계 - 게임 판매 분석\r
    description: Polars로 비디오 게임 판매 데이터를 분석합니다. 다중 열 선택, 복합 조건 필터, agg로 여러 집계 한번에, 다중 그룹 group_by를 실습합니다.\r
    keywords:\r
    - polars group_by\r
    - polars agg\r
    - polars alias\r
    - 다중 그룹\r
    - 게임 판매\r
intro:\r
  emoji: 🎮\r
  goal: 플랫폼과 장르별로 게임 판매량을 분석하고 시각화합니다.\r
  description: 다중 열 선택, 복합 조건 필터, 다중 그룹 집계를 배웁니다. 이전에 배운 select, filter, group_by를 복습하면서 새로운 기능을 추가합니다.\r
  direction: 게임판매분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 게임판매분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 구조 확인 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 미리보기 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 게임판매분석 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 게임판매분석 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 게임판매분석 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 비디오 게임 판매 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    VGChartz에서 수집한 비디오 게임 판매 데이터입니다. 1980년대부터 2020년까지 16,000개 이상의 게임 판매 기록이 담겨 있으며, 플랫폼(게임기), 장르, 퍼블리셔, 연도, 지역별 판매량 등 다양한 정보를 포함합니다. 이 데이터로 다중 컬럼 선택, 복합 조건 필터링, 다중 그룹 집계 등 중급 기술을 배웁니다. 실제 비즈니스 분석에서 자주 사용하는 패턴들입니다.\r
\r
    shape는 (행 수, 열 수)를 반환합니다. 이 데이터는 16,000개 이상의 게임 기록이 있어 대용량 데이터 분석 연습에 적합합니다. Polars는 이런 규모의 데이터도 빠르게 처리합니다.\r
  tips:\r
  - shape는 (행 수, 열 수)를 반환합니다. 이 데이터는 16,000개 이상의 게임 기록이 있어 대용량 데이터 분석 연습에 적합합니다. Polars는 이런 규모의 데이터도 빠르게\r
    처리합니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    gameCsv = loadLocalDataset("video_games").to_csv(index=False)\r
    games = pl.read_csv(StringIO(gameCsv))\r
    games.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      gameCsv = loadLocalDataset("video_games").to_csv(index=False)\r
      games = pl.read_csv(StringIO(gameCsv))\r
      games.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_schema\r
  title: 2단계. 데이터 구조 확인\r
  structuredPrimary: true\r
  subtitle: 컬럼과 타입\r
  goal: 2단계. 데이터 구조 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Platform은 게임기, Genre는 장르, NA_Sales/EU_Sales/JP_Sales/Global_Sales는 지역별 판매량(백만 단위)입니다. 예를\r
    들어 Global_Sales가 10이면 1000만 장이 판매된 것입니다. 이 데이터셋에는 16,000개 이상의 게임이 포함되어 있어 다양한 분석이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: games.schema\r
  exercise:\r
    prompt: 2단계. 데이터 구조 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: games.schema\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 구조 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 구조 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_head\r
  title: 3단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 상위 데이터 확인\r
  goal: 3단계. 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    head()로 상위 N개 행을 확인합니다. 데이터가 Rank(순위) 순으로 정렬되어 있어 가장 많이 팔린 게임들이 상위에 위치합니다. Wii Sports, Super Mario Bros 등 역대급 히트작들을 볼 수 있습니다.\r
\r
    head(N)은 상위 N개 행만 보여줍니다. 괄호 안의 숫자를 바꿔서 원하는 개수를 볼 수 있습니다.\r
  snippet: games.head(5)\r
  exercise:\r
    prompt: 3단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: games.head(5)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_select_multi\r
  title: 4단계. 다중 열 선택\r
  structuredPrimary: true\r
  subtitle: 여러 컬럼 한번에\r
  goal: 4단계. 다중 열 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이전 프로젝트에서는 pl.col()을 하나씩 나열했지만, 더 간결한 방법이 있습니다. pl.col("컬럼1", "컬럼2", "컬럼3")처럼 쉼표로 구분하여 여러 컬럼을 한 번에 선택할 수 있습니다. 이는 Polars의 강력한 기능으로, 코드가 짧아지고 가독성이 좋아집니다. 분석에 필요한 핵심 컬럼만 골라서 보면 데이터를 이해하기 쉽습니다.\r
\r
    pl.col("A", "B", "C")는 여러 컬럼을 한 번에 선택하는 축약 문법입니다. pl.col("A"), pl.col("B"), pl.col("C")를 나열한 것과 동일하지만 훨씬 간결합니다. 컬럼이 많을 때 매우 유용합니다.\r
  tips:\r
  - pl.col("A", "B", "C")는 여러 컬럼을 한 번에 선택하는 축약 문법입니다. pl.col("A"), pl.col("B"), pl.col("C")를 나열한 것과 동일하지만\r
    훨씬 간결합니다. 컬럼이 많을 때 매우 유용합니다.\r
  snippet: |-\r
    games.select(\r
        pl.col("Name", "Platform", "Genre", "Global_Sales")\r
    ).head(10)\r
  exercise:\r
    prompt: 4단계. 다중 열 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.select(\r
          pl.col("Name", "Platform", "Genre", "Global_Sales")\r
      ).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 다중 열 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 다중 열 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_filter_basic\r
  title: 5단계. 기본 필터링\r
  structuredPrimary: true\r
  subtitle: 조건에 맞는 행 선택\r
  goal: 5단계. 기본 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 특정 플랫폼 게임만 골라봅시다. filter() 함수에 조건을 전달하면 해당 조건을 만족하는 행만 선택됩니다. PS4는 PlayStation 4의 약자로,\r
    2013년 출시된 소니의 게임기입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    games.filter(\r
        pl.col("Platform") == "PS4"\r
    ).head(10)\r
  exercise:\r
    prompt: 5단계. 기본 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.filter(\r
          pl.col("Platform") == "PS4"\r
      ).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 기본 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 기본 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_filter_logic\r
  title: 6단계. 복합 조건 필터\r
  structuredPrimary: true\r
  subtitle: 논리 연산자 &, |\r
  goal: 6단계. 복합 조건 필터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    실전에서는 하나의 조건만으로는 부족한 경우가 많습니다. "PS4 게임 중에서 액션 장르만"처럼 여러 조건을 동시에 만족하는 데이터를 찾아야 할 때가 있습니다. &(AND)는 모든 조건을 만족해야 하고, |(OR)은 하나라도 만족하면 됩니다. Python의 연산자 우선순위 때문에 각 조건을 괄호로 감싸야 합니다. 이것은 Polars와 pandas 공통입니다.\r
\r
    & 는 AND(모두 만족), | 는 OR(하나라도 만족)입니다. Python의 and/or이 아닌 &/|를 사용하며, 각 조건을 반드시 괄호()로 감싸야 합니다. (조건1) & (조건2) & (조건3)처럼 여러 조건을 연결할 수 있습니다.\r
  tips:\r
  - '& 는 AND(모두 만족), | 는 OR(하나라도 만족)입니다. Python의 and/or이 아닌 &/|를 사용하며, 각 조건을 반드시 괄호()로 감싸야 합니다. (조건1)\r
    & (조건2) & (조건3)처럼 여러 조건을 연결할 수 있습니다.'\r
  snippet: |-\r
    games.filter(\r
        (pl.col("Platform") == "PS4") & (pl.col("Genre") == "Action")\r
    ).head(10)\r
  exercise:\r
    prompt: 6단계. 복합 조건 필터 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.filter(\r
          (pl.col("Platform") == "PS4") & (pl.col("Genre") == "Action")\r
      ).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 복합 조건 필터의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 복합 조건 필터의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_filter_or\r
  title: 7단계. OR 조건\r
  structuredPrimary: true\r
  subtitle: 여러 값 중 하나\r
  goal: 7단계. OR 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 여러 플랫폼을 한번에 필터링해봅시다. OR 연산자(|)를 사용하면 여러 조건 중 하나라도 만족하는 행을 선택합니다. PS4와 XOne(Xbox One)은 같은\r
    세대의 경쟁 게임기로, 비교 분석에 자주 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    games.filter(\r
        (pl.col("Platform") == "PS4") | (pl.col("Platform") == "XOne")\r
    ).head(10)\r
  exercise:\r
    prompt: 7단계. OR 조건 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.filter(\r
          (pl.col("Platform") == "PS4") | (pl.col("Platform") == "XOne")\r
      ).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. OR 조건의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. OR 조건의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_groupby_basic\r
  title: 8단계. 기본 그룹 집계\r
  structuredPrimary: true\r
  subtitle: 플랫폼별 판매량\r
  goal: 8단계. 기본 그룹 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 플랫폼별로 총 판매량을 계산합니다. group_by는 같은 값을 가진 행들을 그룹으로 묶고, agg는 그룹별로 집계 함수를 적용합니다. sum()은 그룹 내\r
    모든 값을 더하여 총합을 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    games.group_by("Platform").agg(\r
        pl.col("Global_Sales").sum()\r
    ).sort("Global_Sales", descending=True).head(10)\r
  exercise:\r
    prompt: 8단계. 기본 그룹 집계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.group_by("Platform").agg(\r
          pl.col("Global_Sales").sum()\r
      ).sort("Global_Sales", descending=True).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 기본 그룹 집계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 기본 그룹 집계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_alias\r
  title: 9단계. 별칭 붙이기\r
  structuredPrimary: true\r
  subtitle: alias로 컬럼명 변경\r
  goal: 9단계. 별칭 붙이기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    집계 결과에 의미 있는 이름을 붙이려면 alias()를 사용합니다. alias()를 사용하지 않으면 컬럼명이 "Global_Sales"로 유지되어 원본인지 합계인지 구분하기 어렵습니다. "totalSales"처럼 명확한 이름을 붙이면 결과를 이해하기 쉽습니다.\r
\r
    alias("새이름")은 집계 결과 컬럼에 원하는 이름을 붙입니다. 나중에 시각화할 때 더 읽기 쉬운 이름을 쓸 수 있습니다.\r
  snippet: |-\r
    games.group_by("Platform").agg(\r
        pl.col("Global_Sales").sum().alias("totalSales")\r
    ).sort("totalSales", descending=True).head(10)\r
  exercise:\r
    prompt: 9단계. 별칭 붙이기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.group_by("Platform").agg(\r
          pl.col("Global_Sales").sum().alias("totalSales")\r
      ).sort("totalSales", descending=True).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 별칭 붙이기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 별칭 붙이기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_agg_multi\r
  title: 10단계. 여러 집계 한번에\r
  structuredPrimary: true\r
  subtitle: agg에 리스트 전달\r
  goal: 10단계. 여러 집계 한번에에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    agg()에 여러 집계를 리스트로 전달하면 한번에 여러 통계를 구할 수 있습니다. sum(총합), mean(평균), count(개수) 등 다양한 집계 함수를 조합하면 데이터의 여러 측면을 동시에 파악할 수 있습니다. 각 집계에 alias()로 이름을 붙여 구분합니다.\r
\r
    agg([...]) 안에 여러 집계를 나열합니다. 각 집계에 alias를 붙여서 결과를 구분하세요.\r
  snippet: |-\r
    games.group_by("Platform").agg([\r
        pl.col("Global_Sales").sum().alias("totalSales"),\r
        pl.col("Global_Sales").mean().alias("avgSales"),\r
        pl.col("Name").count().alias("gameCount")\r
    ]).sort("totalSales", descending=True).head(10)\r
  exercise:\r
    prompt: 10단계. 여러 집계 한번에 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      games.group_by("Platform").agg([\r
          pl.col("Global_Sales").sum().alias("totalSales"),\r
          pl.col("Global_Sales").mean().alias("avgSales"),\r
          pl.col("Name").count().alias("gameCount")\r
      ]).sort("totalSales", descending=True).head(10)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 여러 집계 한번에의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 10단계. 여러 집계 한번에 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step11_multi_group\r
  title: 11단계. 다중 그룹\r
  structuredPrimary: true\r
  subtitle: 플랫폼 + 장르\r
  goal: 11단계. 다중 그룹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이제 이 프로젝트의 핵심 개념인 다중 그룹 집계를 배웁니다. group_by(["컬럼1", "컬럼2"])처럼 리스트로 여러 컬럼을 전달하면, 그 조합별로 그룹을 만듭니다. 예를 들어 "PS2의 Action", "PS2의 Sports", "Xbox의 Action" 등 플랫폼과 장르의 모든 조합이 각각의 그룹이 됩니다. 이렇게 하면 "어떤 플랫폼에서 어떤 장르가 잘 팔렸는지" 같은 세밀한 분석이 가능합니다. 실제 비즈니스에서 매우 자주 사용하는 기법입니다.\r
\r
    group_by(["A", "B"])는 A와 B 컬럼의 모든 조합별로 그룹을 만듭니다. ["연도", "지역", "카테고리"]처럼 3개 이상도 가능합니다. 다차원 분석의 핵심 기법으로, SQL의 GROUP BY 여러 컬럼과 동일한 개념입니다.\r
  tips:\r
  - group_by(["A", "B"])는 A와 B 컬럼의 모든 조합별로 그룹을 만듭니다. ["연도", "지역", "카테고리"]처럼 3개 이상도 가능합니다. 다차원 분석의 핵심 기법으로,\r
    SQL의 GROUP BY 여러 컬럼과 동일한 개념입니다.\r
  snippet: |-\r
    platformGenre = games.group_by(["Platform", "Genre"]).agg([\r
        pl.col("Global_Sales").sum().alias("totalSales"),\r
        pl.col("Name").count().alias("gameCount")\r
    ]).sort("totalSales", descending=True)\r
    platformGenre.head(15)\r
  exercise:\r
    prompt: 11단계. 다중 그룹 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      platformGenre = games.group_by(["Platform", "Genre"]).agg([\r
          pl.col("Global_Sales").sum().alias("totalSales"),\r
          pl.col("Name").count().alias("gameCount")\r
      ]).sort("totalSales", descending=True)\r
      platformGenre.head(15)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 다중 그룹의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 다중 그룹의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_genre_analysis\r
  title: 12단계. 장르별 분석\r
  structuredPrimary: true\r
  subtitle: 인기 장르 찾기\r
  goal: 12단계. 장르별 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 장르별 판매량을 분석해서 어떤 장르가 인기 있는지 확인합니다. Action, Sports, Shooter 등 장르별로 그룹화하여 총 판매량과 게임 수를 계산합니다.\r
    어떤 장르가 가장 많이 팔렸고, 어떤 장르에 게임이 가장 많은지 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    genreSales = games.group_by("Genre").agg([\r
        pl.col("Global_Sales").sum().alias("totalSales"),\r
        pl.col("Name").count().alias("gameCount")\r
    ]).sort("totalSales", descending=True)\r
    genreSales\r
  exercise:\r
    prompt: 12단계. 장르별 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      genreSales = games.group_by("Genre").agg([\r
          pl.col("Global_Sales").sum().alias("totalSales"),\r
          pl.col("Name").count().alias("gameCount")\r
      ]).sort("totalSales", descending=True)\r
      genreSales\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 장르별 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 장르별 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_top_platform_genre\r
  title: 13단계. TOP 조합 분석\r
  structuredPrimary: true\r
  subtitle: 가장 성공한 플랫폼+장르\r
  goal: 13단계. TOP 조합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 플랫폼과 장르 조합 중 가장 판매량이 높은 조합을 찾습니다. 예를 들어 "PS2의 Action 게임"이 얼마나 팔렸는지 알 수 있습니다. 이런 다차원 분석은\r
    마케팅 전략 수립에 중요한 인사이트를 제공합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    topCombo = games.group_by(["Platform", "Genre"]).agg(\r
        pl.col("Global_Sales").sum().alias("totalSales")\r
    ).sort("totalSales", descending=True).head(10)\r
    topCombo\r
  exercise:\r
    prompt: 13단계. TOP 조합 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      topCombo = games.group_by(["Platform", "Genre"]).agg(\r
          pl.col("Global_Sales").sum().alias("totalSales")\r
      ).sort("totalSales", descending=True).head(10)\r
      topCombo\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. TOP 조합 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. TOP 조합 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step14_pivot_analysis\r
  title: 14단계. 피벗 분석\r
  structuredPrimary: true\r
  subtitle: 플랫폼 x 장르 매트릭스\r
  goal: 14단계. 피벗 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 주요 플랫폼과 장르의 판매량을 피벗 테이블로 확인합니다. is_in()으로 상위 플랫폼만 필터링한 후 다중 그룹 집계를 수행합니다. 이렇게 하면 핵심 데이터에\r
    집중하여 분석할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    topPlatforms = ["PS2", "X360", "PS3", "Wii", "DS", "PS4"]\r
    heatData = games.filter(\r
        pl.col("Platform").is_in(topPlatforms)\r
    ).group_by(["Platform", "Genre"]).agg(\r
        pl.col("Global_Sales").sum().alias("totalSales")\r
    )\r
    heatData.sort("totalSales", descending=True).head(20)\r
  exercise:\r
    prompt: 14단계. 피벗 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      topPlatforms = ["PS2", "X360", "PS3", "Wii", "DS", "PS4"]\r
      heatData = games.filter(\r
          pl.col("Platform").is_in(topPlatforms)\r
      ).group_by(["Platform", "Genre"]).agg(\r
          pl.col("Global_Sales").sum().alias("totalSales")\r
      )\r
      heatData.sort("totalSales", descending=True).head(20)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 피벗 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 피벗 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 게임 판매 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    게임 분석가가 되어 판매 데이터를 분석해봅시다. 다중 열 선택, 복합 조건 필터, 다중 그룹 집계를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    vgSales = pl.read_csv(StringIO(loadLocalDataset("video_games").to_csv(index=False)))\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      vgSales = pl.read_csv(StringIO(loadLocalDataset("video_games").to_csv(index=False)))\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 다중 그룹 집계와 복합 조건 필터를 마스터했습니다.\r
  - type: list\r
    items:\r
    - pl.col("a", "b", "c") - 다중 열 선택\r
    - (조건1) & (조건2) - AND 조건\r
    - (조건1) | (조건2) - OR 조건\r
    - .alias("이름") - 결과 컬럼에 별칭 붙이기\r
    - group_by(["컬럼1", "컬럼2"]) - 다중 그룹\r
    - agg([집계1, 집계2]) - 여러 집계 한번에\r
    - head(N) - 상위 N개 행만\r
  - type: text\r
    content: 다음 시간에는 주식 데이터로 윈도우 함수(rolling_mean, shift, cum_sum)를 배웁니다.\r
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 주문 매출 파이프라인\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: Polars는 빠른 집계만 배우면 부족합니다. 업무에서는 입력 스키마를 먼저 확인하고, 잘못된 수량이나 단가를 명확한 오류로 막고, 예측한 상위 채널이 실제\r
    집계와 맞는지 검증해야 합니다. 마지막에는 기준값을 바꾸는 변주로 결론이 얼마나 안정적인지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import polars as pl\r
\r
    orderFrame = pl.DataFrame({\r
        "orderId": [1001, 1002, 1003, 1004, 1005, 1006],\r
        "channel": ["web", "store", "web", "partner", "store", "web"],\r
        "quantity": [3, 2, 5, 1, 4, 2],\r
        "unitPrice": [12000, 18000, 9000, 40000, 15000, 22000],\r
        "refund": [0, 0, 1, 0, 0, 0],\r
    })\r
\r
    def validateOrderFrame(frame: pl.DataFrame) -> bool:\r
        requiredColumns = {"orderId", "channel", "quantity", "unitPrice", "refund"}\r
        missingColumns = requiredColumns - set(frame.columns)\r
        if missingColumns:\r
            raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")\r
        if frame.select((pl.col("quantity") <= 0).any()).item():\r
            raise ValueError("quantity는 0보다 커야 합니다.")\r
        if frame.select((pl.col("unitPrice") <= 0).any()).item():\r
            raise ValueError("unitPrice는 0보다 커야 합니다.")\r
        return True\r
\r
    validateOrderFrame(orderFrame)\r
    orderFrame\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      revenueByChannel = (\r
          orderFrame.filter(pl.col("refund") == 0)\r
          .with_columns((pl.col("quantity") * pl.col("unitPrice")).alias("netRevenue"))\r
          .group_by("channel")\r
          .agg(pl.col("netRevenue").sum())\r
      )\r
\r
      thresholdFrame = pl.DataFrame({"threshold": [20000, 50000, 80000]}).with_columns(\r
          pl.col("threshold").map_elements(\r
              lambda threshold: revenueByChannel.filter(pl.col("netRevenue") >= threshold).height,\r
              return_dtype=pl.Int64,\r
          ).alias("qualifiedChannels")\r
      )\r
\r
      assert thresholdFrame.select((pl.col("qualifiedChannels").diff().fill_null(0) <= 0).all()).item()\r
      thresholdFrame\r
    solution: |-\r
      import polars as pl\r
\r
      orderFrame = pl.DataFrame({\r
          "orderId": [1001, 1002, 1003, 1004, 1005, 1006],\r
          "channel": ["web", "store", "web", "partner", "store", "web"],\r
          "quantity": [3, 2, 5, 1, 4, 2],\r
          "unitPrice": [12000, 18000, 9000, 40000, 15000, 22000],\r
          "refund": [0, 0, 1, 0, 0, 0],\r
      })\r
\r
      def validateOrderFrame(frame: pl.DataFrame) -> bool:\r
          requiredColumns = {"orderId", "channel", "quantity", "unitPrice", "refund"}\r
          missingColumns = requiredColumns - set(frame.columns)\r
          if missingColumns:\r
              raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")\r
          if frame.select((pl.col("quantity") <= 0).any()).item():\r
              raise ValueError("quantity는 0보다 커야 합니다.")\r
          if frame.select((pl.col("unitPrice") <= 0).any()).item():\r
              raise ValueError("unitPrice는 0보다 커야 합니다.")\r
          return True\r
\r
      validateOrderFrame(orderFrame)\r
      orderFrame\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 업무 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};