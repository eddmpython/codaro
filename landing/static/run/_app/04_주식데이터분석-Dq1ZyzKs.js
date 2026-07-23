var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_04\r
  title: 주식데이터분석\r
  order: 4\r
  category: polars\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:apple_stock\r
  tags:\r
  - 주식\r
  - 이동평균\r
  - 수익률\r
  - rolling\r
  - shift\r
  - cum_sum\r
  seo:\r
    title: Polars 주식 데이터 분석 - 일일 수익률과 이동평균 계산\r
    description: 기술주 시세 데이터로 일일 수익률과 이동평균을 계산합니다. cast, shift, rolling_mean, cum_sum 등 윈도우 함수를 배웁니다.\r
    keywords:\r
    - Polars\r
    - 주식 분석\r
    - 이동평균\r
    - 수익률\r
    - rolling_mean\r
    - shift\r
    - cum_sum\r
intro:\r
  emoji: 📈\r
  goal: 주식 시세 데이터에서 일일 수익률과 20일 이동평균을 계산합니다.\r
  description: 기술주 데이터로 금융 분석의 기초를 배웁니다. shift로 전일 종가를 참조하고, rolling_mean으로 이동평균을 계산하며, cum_sum으로 누적 수익률을\r
    구합니다.\r
  direction: 주식데이터분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 주식데이터분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 미리보기 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 필요한 컬럼 선택 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 주식데이터분석 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 주식데이터분석 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 주식데이터분석 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: Apple 주식 시세 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    Apple 주식의 일별 시세 데이터를 분석합니다. 주식 데이터는 시계열(time series) 데이터의 대표적인 예로, 날짜 순서가 중요합니다. 이번 프로젝트에서는 윈도우 함수(window function)를 배웁니다. 윈도우 함수는 이전 행이나 다음 행을 참조하여 계산하는 강력한 기능으로, shift(이전 값 참조), rolling_mean(이동평균), cum_sum(누적합계) 등이 있습니다. 주식 분석의 핵심 지표들을 직접 계산해봅니다.\r
\r
    주식 데이터는 시계열 분석의 대표적인 예입니다. Polars는 시계열 데이터 처리에 특화되어 있어 이동평균, 수익률 계산 등이 매우 빠릅니다. pandas보다 10배 이상 빠른 성능을 보입니다.\r
  tips:\r
  - 주식 데이터는 시계열 분석의 대표적인 예입니다. Polars는 시계열 데이터 처리에 특화되어 있어 이동평균, 수익률 계산 등이 매우 빠릅니다. pandas보다 10배 이상 빠른\r
    성능을 보입니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    stockCsv = loadLocalDataset("apple_stock").to_csv(index=False)\r
    df = pl.read_csv(StringIO(stockCsv))\r
    df.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      stockCsv = loadLocalDataset("apple_stock").to_csv(index=False)\r
      df = pl.read_csv(StringIO(stockCsv))\r
      df.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 데이터 미리보기\r
  structuredPrimary: true\r
  subtitle: 구조 파악\r
  goal: 2단계. 데이터 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Date, AAPL.Open, AAPL.High, AAPL.Low, AAPL.Close, AAPL.Volume 등의 컬럼이 있습니다. AAPL은 Apple의\r
    주식 티커(코드)이며, Open(시가), High(고가), Low(저가), Close(종가), Volume(거래량)은 주식 데이터의 기본 구성 요소입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: df.head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_select\r
  title: 3단계. 필요한 컬럼 선택\r
  structuredPrimary: true\r
  subtitle: 날짜와 종가만\r
  goal: 3단계. 필요한 컬럼 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 분석에 필요한 날짜(Date)와 종가(AAPL.Close)만 선택합니다. 종가는 하루 중 마지막 거래 가격으로, 주식 분석에서 가장 많이 사용되는 지표입니다.\r
    alias()로 컬럼명을 간단하게 바꾸면 이후 코드가 깔끔해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    base = df.select([\r
        pl.col("Date").alias("date"),\r
        pl.col("AAPL.Close").alias("close")\r
    ])\r
    base.head()\r
  exercise:\r
    prompt: 3단계. 필요한 컬럼 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      base = df.select([\r
          pl.col("Date").alias("date"),\r
          pl.col("AAPL.Close").alias("close")\r
      ])\r
      base.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 필요한 컬럼 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 필요한 컬럼 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_datetime\r
  title: 4단계. 날짜 타입 변환\r
  structuredPrimary: true\r
  subtitle: 문자열을 날짜로\r
  goal: 4단계. 날짜 타입 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: date 컬럼이 문자열이면 날짜 함수를 사용할 수 없습니다. str.to_date()로 Date 타입으로 변환해야 dt.year(), dt.month() 같은\r
    날짜 함수를 사용할 수 있습니다. "%Y-%m-%d"는 연도-월-일 형식을 의미합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dated = base.with_columns(\r
        pl.col("date").str.to_date("%Y-%m-%d")\r
    )\r
    dated.head()\r
  exercise:\r
    prompt: 4단계. 날짜 타입 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      dated = base.with_columns(\r
          pl.col("date").str.to_date("%Y-%m-%d")\r
      )\r
      dated.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 날짜 타입 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 날짜 타입 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_dt\r
  title: 5단계. 날짜 정보 추출\r
  structuredPrimary: true\r
  subtitle: 연도, 월 추출\r
  goal: 5단계. 날짜 정보 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: dt.year(), dt.month()로 날짜에서 연도와 월을 추출합니다. 연도와 월 컬럼을 추가하면 월별/연도별 그룹 분석이 가능해집니다. 이전 프로젝트에서\r
    배운 dt accessor를 다시 한번 복습합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    withYearMonth = dated.with_columns([\r
        pl.col("date").dt.year().alias("year"),\r
        pl.col("date").dt.month().alias("month")\r
    ])\r
    withYearMonth.head()\r
  exercise:\r
    prompt: 5단계. 날짜 정보 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      withYearMonth = dated.with_columns([\r
          pl.col("date").dt.year().alias("year"),\r
          pl.col("date").dt.month().alias("month")\r
      ])\r
      withYearMonth.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 날짜 정보 추출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 날짜 정보 추출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_cast\r
  title: 6단계. 타입 변환\r
  structuredPrimary: true\r
  subtitle: cast()로 형변환\r
  goal: 6단계. 타입 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    close 컬럼이 Float64인지 확인합니다. 계산을 위해 명시적으로 Float64로 변환하면 타입 불일치로 인한 오류를 예방할 수 있습니다. cast()는 데이터 타입을 변환하는 함수입니다.\r
\r
    cast() 핵심\r
    cast(pl.Float64)는 컬럼 타입을 Float64로 변환합니다. 수치 계산 전에 타입을 맞춰두면 오류를 방지할 수 있습니다.\r
  tips:\r
  - cast() 핵심 cast(pl.Float64)는 컬럼 타입을 Float64로 변환합니다. 수치 계산 전에 타입을 맞춰두면 오류를 방지할 수 있습니다.\r
  snippet: |-\r
    casted = withYearMonth.with_columns(\r
        pl.col("close").cast(pl.Float64)\r
    )\r
    casted.schema\r
  exercise:\r
    prompt: 6단계. 타입 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      casted = withYearMonth.with_columns(\r
          pl.col("close").cast(pl.Float64)\r
      )\r
      casted.schema\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 타입 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 타입 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_shift\r
  title: 7단계. 전일 종가 계산\r
  structuredPrimary: true\r
  subtitle: shift()로 이전 값 참조\r
  goal: 7단계. 전일 종가 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    주식 수익률을 계산하려면 "오늘 가격"과 "어제 가격"을 비교해야 합니다. 하지만 한 행에는 오늘 가격만 있고 어제 가격은 없습니다. shift() 함수는 이 문제를 해결합니다. shift(1)은 전체 컬럼을 한 행 아래로 밀어서, 각 행에서 이전 행의 값을 참조할 수 있게 만듭니다. 첫 번째 행은 이전 값이 없으므로 null이 됩니다. 이것은 시계열 분석의 핵심 기법입니다.\r
\r
    shift(1)은 모든 값을 한 행 아래로 이동시킵니다. shift(2)는 2행 아래로, shift(-1)은 한 행 위로(다음 값 참조) 이동합니다. 시계열 데이터에서 전일/전월/전년 값을 참조할 때 필수적인 함수입니다. pandas의 shift()와 동일하지만 Polars가 훨씬 빠릅니다.\r
  tips:\r
  - shift(1)은 모든 값을 한 행 아래로 이동시킵니다. shift(2)는 2행 아래로, shift(-1)은 한 행 위로(다음 값 참조) 이동합니다. 시계열 데이터에서 전일/전월/전년\r
    값을 참조할 때 필수적인 함수입니다. pandas의 shift()와 동일하지만 Polars가 훨씬 빠릅니다.\r
  snippet: |-\r
    withPrev = casted.with_columns(\r
        pl.col("close").shift(1).alias("prevClose")\r
    )\r
    withPrev.head(10)\r
  exercise:\r
    prompt: 7단계. 전일 종가 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      withPrev = casted.with_columns(\r
          pl.col("close").shift(1).alias("prevClose")\r
      )\r
      withPrev.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 전일 종가 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 전일 종가 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_return\r
  title: 8단계. 일일 수익률 계산\r
  structuredPrimary: true\r
  subtitle: (오늘 - 어제) / 어제\r
  goal: 8단계. 일일 수익률 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 일일 수익률 = (당일 종가 - 전일 종가) / 전일 종가로 계산합니다. 100을 곱해 백분율로 표시하면 "2.5%"처럼 직관적으로 이해할 수 있습니다. 이\r
    공식은 주식 분석의 가장 기본적인 지표입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    withReturn = withPrev.with_columns(\r
        ((pl.col("close") - pl.col("prevClose")) / pl.col("prevClose") * 100).alias("dailyReturn")\r
    )\r
    withReturn.head(10)\r
  exercise:\r
    prompt: 8단계. 일일 수익률 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      withReturn = withPrev.with_columns(\r
          ((pl.col("close") - pl.col("prevClose")) / pl.col("prevClose") * 100).alias("dailyReturn")\r
      )\r
      withReturn.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 일일 수익률 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 일일 수익률 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_rolling\r
  title: 9단계. 20일 이동평균\r
  structuredPrimary: true\r
  subtitle: rolling_mean()\r
  goal: 9단계. 20일 이동평균에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    주식 가격은 매일 오르내리며 변동이 심합니다. 전체적인 추세를 보려면 단기 변동을 완화해야 하는데, 이때 사용하는 것이 이동평균(moving average)입니다. rolling_mean(window_size=20)은 현재 행을 포함한 최근 20개 값의 평균을 계산합니다. 예를 들어 5번째 행의 이동평균은 1~5번째 행의 평균이고, 30번째 행의 이동평균은 11~30번째 행의 평균입니다. 주식에서는 20일(약 1개월) 이동평균이 대표적이며, 골든크로스/데드크로스 등의 매매 신호로 활용됩니다.\r
\r
    rolling_mean(window_size=N)은 현재 포함 최근 N개 값의 평균입니다. 주식 분석에서는 5일(단기), 20일(중기), 60일(장기), 120일(초장기) 이동평균을 주로 사용합니다. window_size를 바꿔서 다양한 기간의 이동평균을 계산할 수 있습니다.\r
  tips:\r
  - rolling_mean(window_size=N)은 현재 포함 최근 N개 값의 평균입니다. 주식 분석에서는 5일(단기), 20일(중기), 60일(장기), 120일(초장기) 이동평균을\r
    주로 사용합니다. window_size를 바꿔서 다양한 기간의 이동평균을 계산할 수 있습니다.\r
  snippet: |-\r
    withMa = withReturn.with_columns(\r
        pl.col("close").rolling_mean(window_size=20).alias("ma20")\r
    )\r
    withMa.tail(10)\r
  exercise:\r
    prompt: 9단계. 20일 이동평균 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      withMa = withReturn.with_columns(\r
          pl.col("close").rolling_mean(window_size=20).alias("ma20")\r
      )\r
      withMa.tail(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 20일 이동평균의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 20일 이동평균의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_cumsum\r
  title: 10단계. 누적 수익률\r
  structuredPrimary: true\r
  subtitle: cum_sum()\r
  goal: 10단계. 누적 수익률에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    일일 수익률은 하루하루의 변화율이지만, 전체 기간 동안 얼마나 수익이 났는지 보려면 누적 수익률이 필요합니다. cum_sum()은 cumulative sum(누적 합계)의 약자로, 처음부터 현재까지의 값을 모두 더합니다. 예를 들어 1일차 +2%, 2일차 +1%, 3일차 -0.5%라면 누적 수익률은 2%, 3%, 2.5%가 됩니다. 이를 그래프로 그리면 투자 수익 추이를 한눈에 볼 수 있습니다.\r
\r
    cum_sum()은 누적 합계를 계산합니다. 첫 행부터 현재 행까지 모든 값을 더한 결과를 반환합니다. cum_max()(누적 최대), cum_min()(누적 최소), cum_prod()(누적 곱) 등 다양한 누적 함수가 있습니다. 시계열 분석의 필수 함수입니다.\r
  tips:\r
  - cum_sum()은 누적 합계를 계산합니다. 첫 행부터 현재 행까지 모든 값을 더한 결과를 반환합니다. cum_max()(누적 최대), cum_min()(누적 최소), cum_prod()(누적\r
    곱) 등 다양한 누적 함수가 있습니다. 시계열 분석의 필수 함수입니다.\r
  snippet: |-\r
    final = withMa.with_columns(\r
        pl.col("dailyReturn").cum_sum().alias("cumReturn")\r
    )\r
    final.tail(10)\r
  exercise:\r
    prompt: 10단계. 누적 수익률 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      final = withMa.with_columns(\r
          pl.col("dailyReturn").cum_sum().alias("cumReturn")\r
      )\r
      final.tail(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 누적 수익률의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 누적 수익률의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_result\r
  title: 11단계. 결과물 - 최종 데이터\r
  structuredPrimary: true\r
  subtitle: 종가 + 이동평균 + 수익률\r
  goal: 11단계. 결과물 최종 데이터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 모든 분석 결과를 포함한 최종 데이터프레임입니다. drop_nulls()로 null 값이 있는 행(첫 번째 행 등)을 제거하고, select로 핵심 컬럼만\r
    선택하여 깔끔한 결과를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: final.drop_nulls().select(["date", "close", "ma20", "dailyReturn", "cumReturn"])\r
  exercise:\r
    prompt: 11단계. 결과물 최종 데이터 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: final.drop_nulls().select(["date", "close", "ma20", "dailyReturn", "cumReturn"])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 결과물 최종 데이터의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 11단계. 결과물 최종 데이터 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 주식 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    배운 내용으로 주식 분석을 해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    aaplBase = pl.read_csv(StringIO(loadLocalDataset("apple_stock").to_csv(index=False))).select([\r
        pl.col("Date").str.to_date("%Y-%m-%d").alias("date"),\r
        pl.col("AAPL.Close").alias("close")\r
    ])\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      aaplBase = pl.read_csv(StringIO(loadLocalDataset("apple_stock").to_csv(index=False))).select([\r
          pl.col("Date").str.to_date("%Y-%m-%d").alias("date"),\r
          pl.col("AAPL.Close").alias("close")\r
      ])\r
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
    content: Polars로 주식 데이터 분석 기초를 배웠습니다.\r
  - type: list\r
    items:\r
    - read_csv() - 데이터 로드\r
    - with_columns() - 새 컬럼 추가\r
    - cast() - 타입 변환\r
    - dt.year(), dt.month() - 날짜 정보 추출\r
    - shift(1) - 이전 값 참조\r
    - rolling_mean() - 이동평균 계산\r
    - cum_sum() - 누적 합계\r
  - type: text\r
    content: 다음 시간에는 음악 스트리밍 데이터로 문자열 처리와 순위 계산을 배웁니다.\r
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