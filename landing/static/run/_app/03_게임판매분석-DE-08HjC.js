var e=`meta:
  packages:
  - polars
  id: polars_03
  title: 게임판매분석
  order: 3
  category: polars
  difficulty: ⭐⭐
  badge: 기초
  dataSource: codaro-local:video_games
  tags:
  - vgsales
  - select
  - filter
  - group_by
  - agg
  - alias
  - head
  seo:
    title: Polars 다중 그룹 집계 - 게임 판매 분석
    description: Polars로 비디오 게임 판매 데이터를 분석합니다. 다중 열 선택, 복합 조건 필터, agg로 여러 집계 한번에, 다중 그룹 group_by를 실습합니다.
    keywords:
    - polars group_by
    - polars agg
    - polars alias
    - 다중 그룹
    - 게임 판매
intro:
  emoji: 🎮
  goal: 플랫폼과 장르별로 게임 판매량을 분석하고 시각화합니다.
  description: 다중 열 선택, 복합 조건 필터, 다중 그룹 집계를 배웁니다. 이전에 배운 select, filter, group_by를 복습하면서 새로운 기능을 추가합니다.
  direction: 게임판매분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.
  - 게임판매분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 구조 확인 처리 실행
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 미리보기 결과 검증
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.
    - label: 게임판매분석 재사용
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 컬럼형 표 분석 환경
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.
    - label: 게임판매분석 실행
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.
    - label: 게임판매분석 완료
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: 비디오 게임 판매 데이터
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    VGChartz에서 수집한 비디오 게임 판매 데이터입니다. 1980년대부터 2020년까지 16,000개 이상의 게임 판매 기록이 담겨 있으며, 플랫폼(게임기), 장르, 퍼블리셔, 연도, 지역별 판매량 등 다양한 정보를 포함합니다. 이 데이터로 다중 컬럼 선택, 복합 조건 필터링, 다중 그룹 집계 등 중급 기술을 배웁니다. 실제 비즈니스 분석에서 자주 사용하는 패턴들입니다.

    shape는 (행 수, 열 수)를 반환합니다. 이 데이터는 16,000개 이상의 게임 기록이 있어 대용량 데이터 분석 연습에 적합합니다. Polars는 이런 규모의 데이터도 빠르게 처리합니다.
  tips:
  - shape는 (행 수, 열 수)를 반환합니다. 이 데이터는 16,000개 이상의 게임 기록이 있어 대용량 데이터 분석 연습에 적합합니다. Polars는 이런 규모의 데이터도 빠르게
    처리합니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    gameCsv = loadLocalDataset("video_games").to_csv(index=False)
    games = pl.read_csv(StringIO(gameCsv))
    games.shape
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      gameCsv = loadLocalDataset("video_games").to_csv(index=False)
      games = pl.read_csv(StringIO(gameCsv))
      games.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_schema
  title: 2단계. 데이터 구조 확인
  structuredPrimary: true
  subtitle: 컬럼과 타입
  goal: 2단계. 데이터 구조 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Platform은 게임기, Genre는 장르, NA_Sales/EU_Sales/JP_Sales/Global_Sales는 지역별 판매량(백만 단위)입니다. 예를
    들어 Global_Sales가 10이면 1000만 장이 판매된 것입니다. 이 데이터셋에는 16,000개 이상의 게임이 포함되어 있어 다양한 분석이 가능합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: games.schema
  exercise:
    prompt: 2단계. 데이터 구조 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: games.schema
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 구조 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 구조 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_head
  title: 3단계. 미리보기
  structuredPrimary: true
  subtitle: 상위 데이터 확인
  goal: 3단계. 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    head()로 상위 N개 행을 확인합니다. 데이터가 Rank(순위) 순으로 정렬되어 있어 가장 많이 팔린 게임들이 상위에 위치합니다. Wii Sports, Super Mario Bros 등 역대급 히트작들을 볼 수 있습니다.

    head(N)은 상위 N개 행만 보여줍니다. 괄호 안의 숫자를 바꿔서 원하는 개수를 볼 수 있습니다.
  snippet: games.head(5)
  exercise:
    prompt: 3단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: games.head(5)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_select_multi
  title: 4단계. 다중 열 선택
  structuredPrimary: true
  subtitle: 여러 컬럼 한번에
  goal: 4단계. 다중 열 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    이전 프로젝트에서는 pl.col()을 하나씩 나열했지만, 더 간결한 방법이 있습니다. pl.col("컬럼1", "컬럼2", "컬럼3")처럼 쉼표로 구분하여 여러 컬럼을 한 번에 선택할 수 있습니다. 이는 Polars의 강력한 기능으로, 코드가 짧아지고 가독성이 좋아집니다. 분석에 필요한 핵심 컬럼만 골라서 보면 데이터를 이해하기 쉽습니다.

    pl.col("A", "B", "C")는 여러 컬럼을 한 번에 선택하는 축약 문법입니다. pl.col("A"), pl.col("B"), pl.col("C")를 나열한 것과 동일하지만 훨씬 간결합니다. 컬럼이 많을 때 매우 유용합니다.
  tips:
  - pl.col("A", "B", "C")는 여러 컬럼을 한 번에 선택하는 축약 문법입니다. pl.col("A"), pl.col("B"), pl.col("C")를 나열한 것과 동일하지만
    훨씬 간결합니다. 컬럼이 많을 때 매우 유용합니다.
  snippet: |-
    games.select(
        pl.col("Name", "Platform", "Genre", "Global_Sales")
    ).head(10)
  exercise:
    prompt: 4단계. 다중 열 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.select(
          pl.col("Name", "Platform", "Genre", "Global_Sales")
      ).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 다중 열 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 다중 열 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_filter_basic
  title: 5단계. 기본 필터링
  structuredPrimary: true
  subtitle: 조건에 맞는 행 선택
  goal: 5단계. 기본 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 특정 플랫폼 게임만 골라봅시다. filter() 함수에 조건을 전달하면 해당 조건을 만족하는 행만 선택됩니다. PS4는 PlayStation 4의 약자로,
    2013년 출시된 소니의 게임기입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    games.filter(
        pl.col("Platform") == "PS4"
    ).head(10)
  exercise:
    prompt: 5단계. 기본 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.filter(
          pl.col("Platform") == "PS4"
      ).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 기본 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. 기본 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_filter_logic
  title: 6단계. 복합 조건 필터
  structuredPrimary: true
  subtitle: 논리 연산자 &, |
  goal: 6단계. 복합 조건 필터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    실전에서는 하나의 조건만으로는 부족한 경우가 많습니다. "PS4 게임 중에서 액션 장르만"처럼 여러 조건을 동시에 만족하는 데이터를 찾아야 할 때가 있습니다. &(AND)는 모든 조건을 만족해야 하고, |(OR)은 하나라도 만족하면 됩니다. Python의 연산자 우선순위 때문에 각 조건을 괄호로 감싸야 합니다. 이것은 Polars와 pandas 공통입니다.

    & 는 AND(모두 만족), | 는 OR(하나라도 만족)입니다. Python의 and/or이 아닌 &/|를 사용하며, 각 조건을 반드시 괄호()로 감싸야 합니다. (조건1) & (조건2) & (조건3)처럼 여러 조건을 연결할 수 있습니다.
  tips:
  - '& 는 AND(모두 만족), | 는 OR(하나라도 만족)입니다. Python의 and/or이 아닌 &/|를 사용하며, 각 조건을 반드시 괄호()로 감싸야 합니다. (조건1)
    & (조건2) & (조건3)처럼 여러 조건을 연결할 수 있습니다.'
  snippet: |-
    games.filter(
        (pl.col("Platform") == "PS4") & (pl.col("Genre") == "Action")
    ).head(10)
  exercise:
    prompt: 6단계. 복합 조건 필터 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.filter(
          (pl.col("Platform") == "PS4") & (pl.col("Genre") == "Action")
      ).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 복합 조건 필터의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 6단계. 복합 조건 필터의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step7_filter_or
  title: 7단계. OR 조건
  structuredPrimary: true
  subtitle: 여러 값 중 하나
  goal: 7단계. OR 조건에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 여러 플랫폼을 한번에 필터링해봅시다. OR 연산자(|)를 사용하면 여러 조건 중 하나라도 만족하는 행을 선택합니다. PS4와 XOne(Xbox One)은 같은
    세대의 경쟁 게임기로, 비교 분석에 자주 사용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    games.filter(
        (pl.col("Platform") == "PS4") | (pl.col("Platform") == "XOne")
    ).head(10)
  exercise:
    prompt: 7단계. OR 조건 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.filter(
          (pl.col("Platform") == "PS4") | (pl.col("Platform") == "XOne")
      ).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. OR 조건의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 7단계. OR 조건의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step8_groupby_basic
  title: 8단계. 기본 그룹 집계
  structuredPrimary: true
  subtitle: 플랫폼별 판매량
  goal: 8단계. 기본 그룹 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 플랫폼별로 총 판매량을 계산합니다. group_by는 같은 값을 가진 행들을 그룹으로 묶고, agg는 그룹별로 집계 함수를 적용합니다. sum()은 그룹 내
    모든 값을 더하여 총합을 계산합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    games.group_by("Platform").agg(
        pl.col("Global_Sales").sum()
    ).sort("Global_Sales", descending=True).head(10)
  exercise:
    prompt: 8단계. 기본 그룹 집계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.group_by("Platform").agg(
          pl.col("Global_Sales").sum()
      ).sort("Global_Sales", descending=True).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 기본 그룹 집계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 8단계. 기본 그룹 집계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step9_alias
  title: 9단계. 별칭 붙이기
  structuredPrimary: true
  subtitle: alias로 컬럼명 변경
  goal: 9단계. 별칭 붙이기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    집계 결과에 의미 있는 이름을 붙이려면 alias()를 사용합니다. alias()를 사용하지 않으면 컬럼명이 "Global_Sales"로 유지되어 원본인지 합계인지 구분하기 어렵습니다. "totalSales"처럼 명확한 이름을 붙이면 결과를 이해하기 쉽습니다.

    alias("새이름")은 집계 결과 컬럼에 원하는 이름을 붙입니다. 나중에 시각화할 때 더 읽기 쉬운 이름을 쓸 수 있습니다.
  snippet: |-
    games.group_by("Platform").agg(
        pl.col("Global_Sales").sum().alias("totalSales")
    ).sort("totalSales", descending=True).head(10)
  exercise:
    prompt: 9단계. 별칭 붙이기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      games.group_by("Platform").agg(
          pl.col("Global_Sales").sum().alias("totalSales")
      ).sort("totalSales", descending=True).head(10)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 별칭 붙이기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 9단계. 별칭 붙이기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step10_agg_multi
  title: 10단계. 여러 집계 한번에
  structuredPrimary: true
  subtitle: agg에 리스트 전달
  goal: 10단계. 여러 집계 한번에에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    agg()에 여러 집계를 리스트로 전달하면 한번에 여러 통계를 구할 수 있습니다. sum(총합), mean(평균), count(개수) 등 다양한 집계 함수를 조합하면 데이터의 여러 측면을 동시에 파악할 수 있습니다. 각 집계에 alias()로 이름을 붙여 구분합니다.

    agg([...]) 안에 여러 집계를 나열합니다. 각 집계에 alias를 붙여서 결과를 구분하세요.
  snippet: |-
    games.group_by("Platform").agg([
        pl.col("Global_Sales").sum().alias("totalSales"),
        pl.col("Global_Sales").mean().alias("avgSales"),
        pl.col("Name").count().alias("gameCount")
    ]).sort("totalSales", descending=True).head(10)
  exercise:
    prompt: 10단계. 여러 집계 한번에 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      games.group_by("Platform").agg([
          pl.col("Global_Sales").sum().alias("totalSales"),
          pl.col("Global_Sales").mean().alias("avgSales"),
          pl.col("Name").count().alias("gameCount")
      ]).sort("totalSales", descending=True).head(10)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 여러 집계 한번에의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 10단계. 여러 집계 한번에 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step11_multi_group
  title: 11단계. 다중 그룹
  structuredPrimary: true
  subtitle: 플랫폼 + 장르
  goal: 11단계. 다중 그룹에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    이제 이 프로젝트의 핵심 개념인 다중 그룹 집계를 배웁니다. group_by(["컬럼1", "컬럼2"])처럼 리스트로 여러 컬럼을 전달하면, 그 조합별로 그룹을 만듭니다. 예를 들어 "PS2의 Action", "PS2의 Sports", "Xbox의 Action" 등 플랫폼과 장르의 모든 조합이 각각의 그룹이 됩니다. 이렇게 하면 "어떤 플랫폼에서 어떤 장르가 잘 팔렸는지" 같은 세밀한 분석이 가능합니다. 실제 비즈니스에서 매우 자주 사용하는 기법입니다.

    group_by(["A", "B"])는 A와 B 컬럼의 모든 조합별로 그룹을 만듭니다. ["연도", "지역", "카테고리"]처럼 3개 이상도 가능합니다. 다차원 분석의 핵심 기법으로, SQL의 GROUP BY 여러 컬럼과 동일한 개념입니다.
  tips:
  - group_by(["A", "B"])는 A와 B 컬럼의 모든 조합별로 그룹을 만듭니다. ["연도", "지역", "카테고리"]처럼 3개 이상도 가능합니다. 다차원 분석의 핵심 기법으로,
    SQL의 GROUP BY 여러 컬럼과 동일한 개념입니다.
  snippet: |-
    platformGenre = games.group_by(["Platform", "Genre"]).agg([
        pl.col("Global_Sales").sum().alias("totalSales"),
        pl.col("Name").count().alias("gameCount")
    ]).sort("totalSales", descending=True)
    platformGenre.head(15)
  exercise:
    prompt: 11단계. 다중 그룹 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      platformGenre = games.group_by(["Platform", "Genre"]).agg([
          pl.col("Global_Sales").sum().alias("totalSales"),
          pl.col("Name").count().alias("gameCount")
      ]).sort("totalSales", descending=True)
      platformGenre.head(15)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 11단계. 다중 그룹의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 다중 그룹의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step12_genre_analysis
  title: 12단계. 장르별 분석
  structuredPrimary: true
  subtitle: 인기 장르 찾기
  goal: 12단계. 장르별 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 장르별 판매량을 분석해서 어떤 장르가 인기 있는지 확인합니다. Action, Sports, Shooter 등 장르별로 그룹화하여 총 판매량과 게임 수를 계산합니다.
    어떤 장르가 가장 많이 팔렸고, 어떤 장르에 게임이 가장 많은지 비교할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    genreSales = games.group_by("Genre").agg([
        pl.col("Global_Sales").sum().alias("totalSales"),
        pl.col("Name").count().alias("gameCount")
    ]).sort("totalSales", descending=True)
    genreSales
  exercise:
    prompt: 12단계. 장르별 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      genreSales = games.group_by("Genre").agg([
          pl.col("Global_Sales").sum().alias("totalSales"),
          pl.col("Name").count().alias("gameCount")
      ]).sort("totalSales", descending=True)
      genreSales
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 12단계. 장르별 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 장르별 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_top_platform_genre
  title: 13단계. TOP 조합 분석
  structuredPrimary: true
  subtitle: 가장 성공한 플랫폼+장르
  goal: 13단계. TOP 조합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 플랫폼과 장르 조합 중 가장 판매량이 높은 조합을 찾습니다. 예를 들어 "PS2의 Action 게임"이 얼마나 팔렸는지 알 수 있습니다. 이런 다차원 분석은
    마케팅 전략 수립에 중요한 인사이트를 제공합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    topCombo = games.group_by(["Platform", "Genre"]).agg(
        pl.col("Global_Sales").sum().alias("totalSales")
    ).sort("totalSales", descending=True).head(10)
    topCombo
  exercise:
    prompt: 13단계. TOP 조합 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      topCombo = games.group_by(["Platform", "Genre"]).agg(
          pl.col("Global_Sales").sum().alias("totalSales")
      ).sort("totalSales", descending=True).head(10)
      topCombo
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 13단계. TOP 조합 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 13단계. TOP 조합 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step14_pivot_analysis
  title: 14단계. 피벗 분석
  structuredPrimary: true
  subtitle: 플랫폼 x 장르 매트릭스
  goal: 14단계. 피벗 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 주요 플랫폼과 장르의 판매량을 피벗 테이블로 확인합니다. is_in()으로 상위 플랫폼만 필터링한 후 다중 그룹 집계를 수행합니다. 이렇게 하면 핵심 데이터에
    집중하여 분석할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    topPlatforms = ["PS2", "X360", "PS3", "Wii", "DS", "PS4"]
    heatData = games.filter(
        pl.col("Platform").is_in(topPlatforms)
    ).group_by(["Platform", "Genre"]).agg(
        pl.col("Global_Sales").sum().alias("totalSales")
    )
    heatData.sort("totalSales", descending=True).head(20)
  exercise:
    prompt: 14단계. 피벗 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      topPlatforms = ["PS2", "X360", "PS3", "Wii", "DS", "PS4"]
      heatData = games.filter(
          pl.col("Platform").is_in(topPlatforms)
      ).group_by(["Platform", "Genre"]).agg(
          pl.col("Global_Sales").sum().alias("totalSales")
      )
      heatData.sort("totalSales", descending=True).head(20)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 14단계. 피벗 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 14단계. 피벗 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 게임 판매 분석 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    게임 분석가가 되어 판매 데이터를 분석해봅시다. 다중 열 선택, 복합 조건 필터, 다중 그룹 집계를 모두 활용합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    vgSales = pl.read_csv(StringIO(loadLocalDataset("video_games").to_csv(index=False)))
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      vgSales = pl.read_csv(StringIO(loadLocalDataset("video_games").to_csv(index=False)))
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: 다중 그룹 집계와 복합 조건 필터를 마스터했습니다.
  - type: list
    items:
    - pl.col("a", "b", "c") - 다중 열 선택
    - (조건1) & (조건2) - AND 조건
    - (조건1) | (조건2) - OR 조건
    - .alias("이름") - 결과 컬럼에 별칭 붙이기
    - group_by(["컬럼1", "컬럼2"]) - 다중 그룹
    - agg([집계1, 집계2]) - 여러 집계 한번에
    - head(N) - 상위 N개 행만
  - type: text
    content: 다음 시간에는 주식 데이터로 윈도우 함수(rolling_mean, shift, cum_sum)를 배웁니다.
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 주문 매출 파이프라인
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: Polars는 빠른 집계만 배우면 부족합니다. 업무에서는 입력 스키마를 먼저 확인하고, 잘못된 수량이나 단가를 명확한 오류로 막고, 예측한 상위 채널이 실제
    집계와 맞는지 검증해야 합니다. 마지막에는 기준값을 바꾸는 변주로 결론이 얼마나 안정적인지 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import polars as pl

    orderFrame = pl.DataFrame({
        "orderId": [1001, 1002, 1003, 1004, 1005, 1006],
        "channel": ["web", "store", "web", "partner", "store", "web"],
        "quantity": [3, 2, 5, 1, 4, 2],
        "unitPrice": [12000, 18000, 9000, 40000, 15000, 22000],
        "refund": [0, 0, 1, 0, 0, 0],
    })

    def validateOrderFrame(frame: pl.DataFrame) -> bool:
        requiredColumns = {"orderId", "channel", "quantity", "unitPrice", "refund"}
        missingColumns = requiredColumns - set(frame.columns)
        if missingColumns:
            raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
        if frame.select((pl.col("quantity") <= 0).any()).item():
            raise ValueError("quantity는 0보다 커야 합니다.")
        if frame.select((pl.col("unitPrice") <= 0).any()).item():
            raise ValueError("unitPrice는 0보다 커야 합니다.")
        return True

    validateOrderFrame(orderFrame)
    orderFrame
  exercise:
    prompt: 업무 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      revenueByChannel = (
          orderFrame.filter(pl.col("refund") == 0)
          .with_columns((pl.col("quantity") * pl.col("unitPrice")).alias("netRevenue"))
          .group_by("channel")
          .agg(pl.col("netRevenue").sum())
      )

      thresholdFrame = pl.DataFrame({"threshold": [20000, 50000, 80000]}).with_columns(
          pl.col("threshold").map_elements(
              lambda threshold: revenueByChannel.filter(pl.col("netRevenue") >= threshold).height,
              return_dtype=pl.Int64,
          ).alias("qualifiedChannels")
      )

      assert thresholdFrame.select((pl.col("qualifiedChannels").diff().fill_null(0) <= 0).all()).item()
      thresholdFrame
    solution: |-
      import polars as pl

      orderFrame = pl.DataFrame({
          "orderId": [1001, 1002, 1003, 1004, 1005, 1006],
          "channel": ["web", "store", "web", "partner", "store", "web"],
          "quantity": [3, 2, 5, 1, 4, 2],
          "unitPrice": [12000, 18000, 9000, 40000, 15000, 22000],
          "refund": [0, 0, 1, 0, 0, 0],
      })

      def validateOrderFrame(frame: pl.DataFrame) -> bool:
          requiredColumns = {"orderId", "channel", "quantity", "unitPrice", "refund"}
          missingColumns = requiredColumns - set(frame.columns)
          if missingColumns:
              raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
          if frame.select((pl.col("quantity") <= 0).any()).item():
              raise ValueError("quantity는 0보다 커야 합니다.")
          if frame.select((pl.col("unitPrice") <= 0).any()).item():
              raise ValueError("unitPrice는 0보다 커야 합니다.")
          return True

      validateOrderFrame(orderFrame)
      orderFrame
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 업무 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: polars_03-game-sales-pivot-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 플랫폼·지역별 게임 판매를 pivot 형태로 집계하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: long rows를 플랫폼 행과 지역 열의 합계 matrix로 바꾸고 row totals를 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 같은 platform·region 조합이 여러 행이면 먼저 합산하세요.
    - 관측이 없는 조합은 0으로 채우되 region 열 목록을 별도로 남기세요.
    exercise:
      prompt: pivot_game_sales(rows)를 완성해 regions, rows를 반환하세요.
      starterCode: |-
        def pivot_game_sales(rows):
            raise NotImplementedError
      solution: |
        def pivot_game_sales(rows):
            regions = sorted({row["region"] for row in rows})
            platforms = sorted({row["platform"] for row in rows})
            result = []
            for platform in platforms:
                values = {region: sum(row["sales"] for row in rows if row["platform"] == platform and row["region"] == region) for region in regions}
                result.append({"platform": platform, **values, "total": sum(values.values())})
            return {"regions": regions, "rows": result}
      hints: *id001
    check:
      id: python.polars.polars_03.game-sales-pivot.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_03.game-sales-pivot.mastery.behavior.v1.fixture
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
        entry: pivot_game_sales
        cases:
        - id: pivots-and-sums-duplicates
          arguments:
          - value:
            - platform: PC
              region: EU
              sales: 2
            - platform: PC
              region: EU
              sales: 1
            - platform: Switch
              region: JP
              sales: 4
          expectedReturn:
            regions:
            - EU
            - JP
            rows:
            - platform: PC
              EU: 3
              JP: 0
              total: 3
            - platform: Switch
              EU: 0
              JP: 4
              total: 4
        - id: handles-empty-sales
          arguments:
          - value: []
          expectedReturn:
            regions: []
            rows: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: polars_03-market-share-by-platform-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_03-game-sales-pivot-mastery
    title: 새 판매 matrix에서 지역 내 플랫폼 점유율 계산하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: pivot 합계를 지역별 분모가 다른 share와 선두 플랫폼으로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 점유율 분모는 전체 세계 판매가 아니라 각 region 합계입니다.
    - share와 leader를 같은 group 결과에서 계산하세요.
    exercise:
      prompt: regional_market_share(rows)를 완성해 shares와 leaders를 반환하세요.
      starterCode: |-
        def regional_market_share(rows):
            raise NotImplementedError
      solution: |
        def regional_market_share(rows):
            regions = sorted({row["region"] for row in rows})
            shares = {}
            leaders = {}
            for region in regions:
                totals = {}
                for row in rows:
                    if row["region"] == region:
                        totals[row["platform"]] = totals.get(row["platform"], 0) + row["sales"]
                denominator = sum(totals.values())
                if denominator <= 0:
                    raise ValueError("region total must be positive")
                shares[region] = {key: round(totals[key] / denominator, 3) for key in sorted(totals)}
                leaders[region] = max(totals, key=lambda key: (totals[key], key))
            return {"shares": shares, "leaders": leaders}
      hints: *id002
    check:
      id: python.polars.polars_03.market-share-by-platform.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_03.market-share-by-platform.transfer.behavior.v1.fixture
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
        entry: regional_market_share
        cases:
        - id: computes-region-specific-denominator
          arguments:
          - value:
            - region: EU
              platform: PC
              sales: 3
            - region: EU
              platform: Switch
              sales: 1
            - region: JP
              platform: Switch
              sales: 2
          expectedReturn:
            shares:
              EU:
                PC: 0.75
                Switch: 0.25
              JP:
                Switch: 1.0
            leaders:
              EU: PC
              JP: Switch
        - id: handles-empty-markets
          arguments:
          - value: []
          expectedReturn:
            shares: {}
            leaders: {}
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: polars_03-reshape-operation-choice-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_03-market-share-by-platform-transfer
    title: long·wide 변환 연산 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: pivot, melt, explode가 바꾸는 행·열 구조를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 변환 전 unique key가 보장되는지 확인하세요.
    - reshape 뒤 예상 행 수와 identifier 열을 검증하세요.
    exercise:
      prompt: choose_reshape_operation(situation)를 완성해 operation, inputShape, risk를 반환하세요.
      starterCode: |-
        def choose_reshape_operation(situation):
            raise NotImplementedError
      solution: |
        def choose_reshape_operation(situation):
            table = {'categories-to-columns': {'operation': 'pivot', 'inputShape': 'long', 'risk': 'duplicate key needs aggregate'}, 'columns-to-category-rows': {'operation': 'melt', 'inputShape': 'wide', 'risk': 'lose identifier columns'}, 'list-items-to-rows': {'operation': 'explode', 'inputShape': 'list column', 'risk': 'row count expansion'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.polars.polars_03.reshape-operation-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_03.reshape-operation-choice.retrieval.behavior.v1.fixture
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
        entry: choose_reshape_operation
        cases:
        - id: recalls-categories-to-columns
          arguments:
          - value: categories-to-columns
          expectedReturn:
            operation: pivot
            inputShape: long
            risk: duplicate key needs aggregate
        - id: recalls-columns-to-category-rows
          arguments:
          - value: columns-to-category-rows
          expectedReturn:
            operation: melt
            inputShape: wide
            risk: lose identifier columns
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};