var e=`meta:
  packages:
  - polars
  id: polars_02
  title: 날씨데이터분석
  order: 2
  category: polars
  difficulty: ⭐
  badge: 입문
  dataSource: codaro-local:global_temp
  tags:
  - 날씨
  - 기온
  - with_columns
  - dt
  - sort
  - group_by
  seo:
    title: Polars 날씨 데이터 분석 - with_columns, dt 날짜처리
    description: 세계 도시 기온 데이터로 Polars를 배웁니다. with_columns로 새 열 추가, dt로 날짜 처리, sort로 정렬하는 방법을 실습합니다.
    keywords:
    - polars with_columns
    - dt.year
    - dt.month
    - sort
    - 날씨 데이터분석
intro:
  emoji: 🌡️
  goal: 도시별 월평균 기온 데이터를 처리하고 분석합니다.
  description: with_columns로 새 열을 추가하고, dt로 날짜를 처리합니다. 이전에 배운 select, filter, group_by를 반복하면서 새로운 개념을
    익힙니다.
  direction: 날씨데이터분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.
  - 날씨데이터분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. Polars 불러오기 입력 확인
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. CSV 불러오기 처리 실행
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 데이터 확인 결과 검증
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.
    - label: 날씨데이터분석 재사용
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 컬럼형 표 분석 환경
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.
    - label: 날씨데이터분석 실행
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.
    - label: 날씨데이터분석 완료
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.
sections:
- id: step1_import
  title: 1단계. Polars 불러오기
  structuredPrimary: true
  subtitle: import polars as pl
  goal: 1단계. Polars 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    지난 시간에 이어서 Polars를 계속 사용합니다. Polars는 고성능 데이터 처리 라이브러리로, 특히 날짜와 시간 데이터를 다루는 데 강력한 기능을 제공합니다. dt accessor를 통해 연도, 월, 일, 시간 등을 쉽게 추출하고 계산할 수 있습니다. 이번 프로젝트에서는 날씨 데이터를 분석하면서 날짜 처리 방법을 배웁니다.

    Polars는 시간 데이터 처리에 특화되어 있습니다. pandas에 비해 날짜/시간 연산이 빠르고, dt accessor로 연도, 월, 주, 요일 등을 간단하게 추출할 수 있습니다. 시계열 데이터 분석에 매우 유용합니다.
  tips:
  - Polars는 시간 데이터 처리에 특화되어 있습니다. pandas에 비해 날짜/시간 연산이 빠르고, dt accessor로 연도, 월, 주, 요일 등을 간단하게 추출할 수 있습니다.
    시계열 데이터 분석에 매우 유용합니다.
  snippet: import polars as pl
  exercise:
    prompt: 1단계. Polars 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import polars as pl
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. Polars 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. Polars 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. CSV 불러오기
  structuredPrimary: true
  subtitle: pl.read_csv()
  goal: 2단계. CSV 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    전 세계 월별 평균 기온 데이터를 불러옵니다. 이 데이터는 지구 온난화 추세를 확인할 수 있는 역사적 기후 데이터입니다. NASA와 같은 기관에서 수집한 장기간의 기온 기록으로, 수십 년간의 변화를 분석할 수 있습니다. 날짜(Date) 컬럼과 평균 기온(Mean) 컬럼이 포함되어 있으며, 이를 통해 시간에 따른 기온 변화 패턴을 파악할 수 있습니다.

    pl.read_csv()는 이전 프로젝트에서 배운 함수입니다. 반복해서 사용하면서 자연스럽게 익숙해집니다. Polars는 대용량 CSV 파일도 빠르게 읽으며, 자동으로 데이터 타입을 추론합니다.
  tips:
  - pl.read_csv()는 이전 프로젝트에서 배운 함수입니다. 반복해서 사용하면서 자연스럽게 익숙해집니다. Polars는 대용량 CSV 파일도 빠르게 읽으며, 자동으로 데이터
    타입을 추론합니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    weatherCsv = loadLocalDataset("global_temp").to_csv(index=False)
    df = pl.read_csv(StringIO(weatherCsv))
    df.head()
  exercise:
    prompt: 2단계. CSV 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      weatherCsv = loadLocalDataset("global_temp").to_csv(index=False)
      df = pl.read_csv(StringIO(weatherCsv))
      df.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. CSV 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. CSV 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_preview
  title: 3단계. 데이터 확인
  structuredPrimary: true
  subtitle: head()와 shape
  goal: 3단계. 데이터 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    head()로 데이터의 처음 몇 행을 확인하여 어떤 형태인지 파악합니다. Date 컬럼은 연도-월-일 형식의 날짜이고, Source는 데이터 출처(GCAG, GISTEMP 등), Mean은 평균 기온 편차를 나타냅니다. 기온 편차는 기준 기간(보통 20세기 평균) 대비 얼마나 높거나 낮은지를 나타내는 값으로, 양수면 평균보다 따뜻하고 음수면 평균보다 추운 것입니다.

    head()는 반복 학습 개념입니다. 데이터를 불러온 직후 항상 head()로 확인하는 습관을 들이세요. 데이터 구조와 값의 형태를 빠르게 파악할 수 있습니다.
  snippet: df.head()
  exercise:
    prompt: 3단계. 데이터 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: df.head()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 데이터 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 데이터 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_schema
  title: 4단계. 컬럼과 타입 확인
  structuredPrimary: true
  subtitle: schema
  goal: 4단계. 컬럼과 타입 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: schema로 컬럼명과 데이터 타입을 확인합니다. Date는 문자열(String)로 저장되어 있어 날짜 연산을 하려면 타입 변환이 필요합니다. Source는
    데이터 출처, Mean은 기온 편차를 나타내며 Float64 타입입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: df.schema
  exercise:
    prompt: 4단계. 컬럼과 타입 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: df.schema
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 컬럼과 타입 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 컬럼과 타입 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_select
  title: 5단계. 컬럼 선택
  structuredPrimary: true
  subtitle: select와 pl.col
  goal: 5단계. 컬럼 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: select로 필요한 컬럼을 선택합니다. pl.col()로 컬럼을 지정하며, 여러 컬럼을 선택할 때는 쉼표로 구분합니다. 분석에 필요한 Date와 Mean
    컬럼만 선택하여 데이터를 간결하게 만듭니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: df.select(pl.col("Date"), pl.col("Mean"))
  exercise:
    prompt: 5단계. 컬럼 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: df.select(pl.col("Date"), pl.col("Mean"))
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 컬럼 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. 컬럼 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_filter
  title: 6단계. 조건 필터링
  structuredPrimary: true
  subtitle: filter와 비교연산
  goal: 6단계. 조건 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: filter로 조건에 맞는 행만 선택합니다. Mean이 0보다 큰 데이터만 필터링하면 평균보다 따뜻했던 기간만 추출할 수 있습니다. 비교 연산자(>, <,
    ==, !=)를 사용하여 다양한 조건을 설정할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: df.filter(pl.col("Mean") > 0)
  exercise:
    prompt: 6단계. 조건 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: df.filter(pl.col("Mean") > 0)
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 조건 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 6단계. 조건 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step7_parse_date
  title: 7단계. 날짜 파싱
  structuredPrimary: true
  subtitle: str.to_date()
  goal: 7단계. 날짜 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    CSV 파일에서 날짜는 보통 문자열(String)로 저장됩니다. 문자열 상태에서는 날짜 연산(연도 추출, 월 계산 등)을 할 수 없으므로 Date 타입으로 변환해야 합니다. str.to_date()는 문자열을 날짜로 파싱하는 함수입니다. %Y-%m-%d는 날짜 형식을 지정하는 패턴으로, %Y는 4자리 연도, %m은 2자리 월, %d는 2자리 일을 의미합니다. with_columns()는 새로운 컬럼을 추가하거나 기존 컬럼을 변환할 때 사용하는 Polars의 핵심 메서드입니다.

    with_columns()는 기존 DataFrame에 새 컬럼을 추가하거나 기존 컬럼을 수정합니다. 원본은 변경하지 않고 새로운 DataFrame을 반환합니다(immutable). pandas의 df.assign()과 비슷하지만 더 강력하고 빠릅니다. 여러 컬럼을 리스트로 한 번에 추가할 수도 있습니다.
  tips:
  - with_columns()는 기존 DataFrame에 새 컬럼을 추가하거나 기존 컬럼을 수정합니다. 원본은 변경하지 않고 새로운 DataFrame을 반환합니다(immutable).
    pandas의 df.assign()과 비슷하지만 더 강력하고 빠릅니다. 여러 컬럼을 리스트로 한 번에 추가할 수도 있습니다.
  snippet: |-
    dfParsed = df.with_columns(
        pl.col("Date").str.to_date("%Y-%m-%d").alias("ParsedDate")
    )
    dfParsed.head()
  exercise:
    prompt: 7단계. 날짜 파싱 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      dfParsed = df.with_columns(
          pl.col("Date").str.to_date("%Y-%m-%d").alias("ParsedDate")
      )
      dfParsed.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 날짜 파싱의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 7단계. 날짜 파싱의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step8_extract_year
  title: 8단계. 연도 추출
  structuredPrimary: true
  subtitle: dt.year()
  goal: 8단계. 연도 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    날짜 타입으로 변환한 후에는 dt accessor를 사용하여 다양한 정보를 추출할 수 있습니다. dt는 "datetime accessor"의 약자로, 날짜/시간 관련 메서드를 모아놓은 것입니다. dt.year()는 날짜에서 연도만 추출합니다. 예를 들어 "2020-05-15"에서 2020만 가져오는 것입니다. 이렇게 추출한 연도로 연도별 분석을 할 수 있습니다. pandas의 .dt와 사용법이 거의 동일하지만 Polars가 훨씬 빠릅니다.

    dt accessor는 날짜/시간 데이터의 특수 메서드에 접근하는 도구입니다. dt.year()(연도), dt.month()(월), dt.day()(일), dt.weekday()(요일), dt.hour()(시간) 등을 사용할 수 있습니다. pandas의 .dt와 동일한 방식이지만 Polars가 훨씬 빠르게 처리합니다.
  tips:
  - dt accessor는 날짜/시간 데이터의 특수 메서드에 접근하는 도구입니다. dt.year()(연도), dt.month()(월), dt.day()(일), dt.weekday()(요일),
    dt.hour()(시간) 등을 사용할 수 있습니다. pandas의 .dt와 동일한 방식이지만 Polars가 훨씬 빠르게 처리합니다.
  snippet: |-
    dfYear = dfParsed.with_columns(
        pl.col("ParsedDate").dt.year().alias("Year")
    )
    dfYear.head()
  exercise:
    prompt: 8단계. 연도 추출 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      dfYear = dfParsed.with_columns(
          pl.col("ParsedDate").dt.year().alias("Year")
      )
      dfYear.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 연도 추출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 8단계. 연도 추출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step9_extract_month
  title: 9단계. 월 추출
  structuredPrimary: true
  subtitle: dt.month()
  goal: 9단계. 월 추출에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    연도뿐만 아니라 월도 추출하면 계절성 분석이 가능합니다. dt.month()는 날짜에서 월(1~12)을 추출합니다. 월별로 그룹화하면 여름(6~8월)이 더운지, 겨울(12~2월)이 추운지 등의 패턴을 확인할 수 있습니다. with_columns()를 연속으로 사용하여 Year와 Month 컬럼을 모두 추가했습니다. 이처럼 메서드 체이닝으로 여러 변환을 순차적으로 적용할 수 있습니다.

    dt.month()는 1~12의 정수로 월을 반환합니다. 여러 with_columns()를 체이닝하거나, with_columns([컬럼1, 컬럼2]) 형태로 한 번에 여러 컬럼을 추가할 수도 있습니다. 후자가 성능상 더 유리합니다.
  tips:
  - dt.month()는 1~12의 정수로 월을 반환합니다. 여러 with_columns()를 체이닝하거나, with_columns([컬럼1, 컬럼2]) 형태로 한 번에 여러 컬럼을
    추가할 수도 있습니다. 후자가 성능상 더 유리합니다.
  snippet: |-
    dfMonthly = dfYear.with_columns(
        pl.col("ParsedDate").dt.month().alias("Month")
    )
    dfMonthly.head()
  exercise:
    prompt: 9단계. 월 추출 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      dfMonthly = dfYear.with_columns(
          pl.col("ParsedDate").dt.month().alias("Month")
      )
      dfMonthly.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 월 추출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 9단계. 월 추출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step10_groupby
  title: 10단계. 연도별 평균 기온
  structuredPrimary: true
  subtitle: group_by + mean
  goal: 10단계. 연도별 평균 기온에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: group_by로 연도별 그룹을 만들고 mean으로 평균을 계산합니다. 같은 연도에 속한 모든 월별 데이터가 하나의 그룹이 되어 평균값으로 집계됩니다. agg()
    내에서 alias()를 사용해 결과 컬럼에 의미있는 이름을 붙입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    yearlyAvg = dfMonthly.group_by("Year").agg(
        pl.col("Mean").mean().alias("AvgTemp")
    )
    yearlyAvg
  exercise:
    prompt: 10단계. 연도별 평균 기온 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      yearlyAvg = dfMonthly.group_by("Year").agg(
          pl.col("Mean").mean().alias("AvgTemp")
      )
      yearlyAvg
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 연도별 평균 기온의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 10단계. 연도별 평균 기온의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step11_sort
  title: 11단계. 정렬
  structuredPrimary: true
  subtitle: sort()
  goal: 11단계. 정렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    sort로 연도순으로 정렬합니다. 시계열 분석에서는 시간 순서가 매우 중요하며, 정렬을 통해 추세를 파악할 수 있습니다. 기본값은 오름차순이며, descending=True로 내림차순 정렬도 가능합니다.

    sort 함수
    sort()는 기본적으로 오름차순 정렬입니다. 내림차순은 sort("컬럼", descending=True)를 사용합니다.
  tips:
  - sort 함수 sort()는 기본적으로 오름차순 정렬입니다. 내림차순은 sort("컬럼", descending=True)를 사용합니다.
  snippet: |-
    yearlyAvgSorted = yearlyAvg.sort("Year")
    yearlyAvgSorted
  exercise:
    prompt: 11단계. 정렬 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      yearlyAvgSorted = yearlyAvg.sort("Year")
      yearlyAvgSorted
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 정렬의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 정렬의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step12_result
  title: 12단계. 연도별 기온 추이 확인
  structuredPrimary: true
  subtitle: DataFrame 결과
  goal: 12단계. 연도별 기온 추이 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 연도별 평균 기온 추이를 DataFrame으로 확인합니다. 최근 연도로 갈수록 AvgTemp 값이 높아지는 추세가 보인다면 지구 온난화의 증거입니다. 이렇게
    시계열 데이터를 집계하면 장기적인 패턴을 발견할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: yearlyAvgSorted
  exercise:
    prompt: 12단계. 연도별 기온 추이 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: yearlyAvgSorted
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 연도별 기온 추이 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 연도별 기온 추이 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_monthly_trend
  title: 13단계. 월별 평균 기온
  structuredPrimary: true
  subtitle: 계절성 분석
  goal: 13단계. 월별 평균 기온에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 월별 평균 기온을 계산하여 계절성을 확인합니다. 1~12월 각각에 대해 전체 기간의 평균을 구하면 어떤 달이 더 따뜻하고 추운지 알 수 있습니다. 북반구 기준으로
    7~8월이 가장 높고 1~2월이 가장 낮을 것입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    monthlyAvg = dfMonthly.group_by("Month").agg(
        pl.col("Mean").mean().alias("AvgTemp")
    ).sort("Month")
    monthlyAvg
  exercise:
    prompt: 13단계. 월별 평균 기온 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      monthlyAvg = dfMonthly.group_by("Month").agg(
          pl.col("Mean").mean().alias("AvgTemp")
      ).sort("Month")
      monthlyAvg
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 13단계. 월별 평균 기온의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 13단계. 월별 평균 기온의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step14_final
  title: 14단계. 월별 기온 패턴 확인
  structuredPrimary: true
  subtitle: DataFrame 결과
  goal: 14단계. 월별 기온 패턴 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 월별 기온 패턴을 DataFrame으로 확인합니다. 정렬된 결과에서 Month 컬럼이 1부터 12까지 순서대로 나열되어 계절에 따른 기온 변화를 명확히 볼
    수 있습니다. 이런 계절성(seasonality) 분석은 시계열 데이터의 핵심입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: monthlyAvg
  exercise:
    prompt: 14단계. 월별 기온 패턴 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: monthlyAvg
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 14단계. 월별 기온 패턴 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 14단계. 월별 기온 패턴 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 날씨 데이터 분석 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    배운 내용을 활용하여 다양한 분석을 해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    tempParsed = pl.read_csv(StringIO(loadLocalDataset("global_temp").to_csv(index=False))).with_columns(
        pl.col("Date").str.to_date("%Y-%m-%d").alias("ParsedDate")
    ).with_columns(
        pl.col("ParsedDate").dt.year().alias("Year")
    )
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      tempParsed = pl.read_csv(StringIO(loadLocalDataset("global_temp").to_csv(index=False))).with_columns(
          pl.col("Date").str.to_date("%Y-%m-%d").alias("ParsedDate")
      ).with_columns(
          pl.col("ParsedDate").dt.year().alias("Year")
      )
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
    content: Polars로 날짜 데이터를 처리하고 분석했습니다.
  - type: list
    items:
    - pl.read_csv() - CSV 불러오기
    - select(pl.col()) - 컬럼 선택
    - filter(조건) - 조건 필터링
    - with_columns() - 새 컬럼 추가
    - str.to_date() - 문자열을 날짜로 변환
    - dt.year(), dt.month() - 연/월 추출
    - group_by().agg() - 그룹별 집계
    - sort() - 정렬
  - type: text
    content: 다음 시간에는 게임 판매 데이터로 다중 그룹 집계를 배웁니다.
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
  - id: polars_02-weather-filter-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 날씨 레코드의 schema·조건·projection plan 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 필수 열을 확인하고 기온 범위와 강수 조건을 적용해 필요한 열만 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - filter에 쓰는 열도 scan projection에 포함해야 합니다.
    - 최종 결과에서는 rain 열을 제외해도 filter 단계에서는 필요합니다.
    exercise:
      prompt: filter_weather(rows, minimum_temp, rainy_only)를 완성해 rows와 scannedColumns를 반환하세요.
      starterCode: |-
        def filter_weather(rows, minimum_temp, rainy_only):
            raise NotImplementedError
      solution: |
        def filter_weather(rows, minimum_temp, rainy_only):
            required = {"date", "city", "temperature", "rain"}
            if any(set(row) < required for row in rows):
                raise ValueError("weather schema mismatch")
            selected = [row for row in rows if row["temperature"] >= minimum_temp and (not rainy_only or row["rain"] > 0)]
            result = [{"date": row["date"], "city": row["city"], "temperature": row["temperature"]} for row in selected]
            return {"rows": result, "scannedColumns": sorted(required)}
      hints: *id001
    check:
      id: python.polars.polars_02.weather-filter-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_02.weather-filter-plan.mastery.behavior.v1.fixture
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
        entry: filter_weather
        cases:
        - id: filters-and-projects
          arguments:
          - value:
            - date: 07-01
              city: Seoul
              temperature: 30
              rain: 5
            - date: 07-02
              city: Seoul
              temperature: 25
              rain: 0
          - value: 28
          - value: true
          expectedReturn:
            rows:
            - date: 07-01
              city: Seoul
              temperature: 30
            scannedColumns:
            - city
            - date
            - rain
            - temperature
        - id: handles-empty-weather
          arguments:
          - value: []
          - value: 0
          - value: false
          expectedReturn:
            rows: []
            scannedColumns:
            - city
            - date
            - rain
            - temperature
        - id: rejects-schema-gap
          arguments:
          - value:
            - date: x
          - value: 0
          - value: false
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: polars_02-daily-weather-aggregation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_02-weather-filter-plan-mastery
    title: 새 hourly weather를 도시·날짜별 일 요약으로 집계하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: row filter를 group key 두 개와 min·max·rain sum 집계로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - city와 date를 함께 group key로 사용하세요.
    - temperature는 min/max, rain은 sum으로 서로 다른 집계를 적용하세요.
    exercise:
      prompt: daily_weather_summary(rows)를 완성해 city, date, minTemp, maxTemp, rainTotal 목록을 반환하세요.
      starterCode: |-
        def daily_weather_summary(rows):
            raise NotImplementedError
      solution: |
        def daily_weather_summary(rows):
            grouped = {}
            for row in rows:
                grouped.setdefault((row["city"], row["date"]), []).append(row)
            result = []
            for (city, date), group in sorted(grouped.items()):
                temperatures = [row["temperature"] for row in group]
                result.append({"city": city, "date": date, "minTemp": min(temperatures), "maxTemp": max(temperatures), "rainTotal": sum(row["rain"] for row in group)})
            return result
      hints: *id002
    check:
      id: python.polars.polars_02.daily-weather-aggregation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_02.daily-weather-aggregation.transfer.behavior.v1.fixture
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
        entry: daily_weather_summary
        cases:
        - id: groups-by-two-keys
          arguments:
          - value:
            - city: Seoul
              date: 07-01
              temperature: 20
              rain: 1
            - city: Seoul
              date: 07-01
              temperature: 30
              rain: 2
            - city: Busan
              date: 07-01
              temperature: 25
              rain: 0
          expectedReturn:
          - city: Busan
            date: 07-01
            minTemp: 25
            maxTemp: 25
            rainTotal: 0
          - city: Seoul
            date: 07-01
            minTemp: 20
            maxTemp: 30
            rainTotal: 3
        - id: handles-empty-hours
          arguments:
          - value: []
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: polars_02-query-optimization-signal-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_02-daily-weather-aggregation-transfer
    title: lazy query 최적화 신호 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: predicate pushdown, projection pushdown, streaming 가능성의 조건을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - optimizer가 이해할 수 있는 expression을 사용하세요.
    - Python callback은 pushdown을 막을 수 있습니다.
    exercise:
      prompt: choose_query_optimization(situation)를 완성해 optimization, evidence, blocker를 반환하세요.
      starterCode: |-
        def choose_query_optimization(situation):
            raise NotImplementedError
      solution: |
        def choose_query_optimization(situation):
            table = {'filter-near-scan': {'optimization': 'predicate pushdown', 'evidence': 'filter in plan', 'blocker': 'opaque Python callback'}, 'select-needed-columns': {'optimization': 'projection pushdown', 'evidence': 'scan column list', 'blocker': 'select all'}, 'bounded-group-aggregate': {'optimization': 'streaming candidate', 'evidence': 'engine plan', 'blocker': 'global sort'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.polars.polars_02.query-optimization-signal.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_02.query-optimization-signal.retrieval.behavior.v1.fixture
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
        entry: choose_query_optimization
        cases:
        - id: recalls-filter-near-scan
          arguments:
          - value: filter-near-scan
          expectedReturn:
            optimization: predicate pushdown
            evidence: filter in plan
            blocker: opaque Python callback
        - id: recalls-select-needed-columns
          arguments:
          - value: select-needed-columns
          expectedReturn:
            optimization: projection pushdown
            evidence: scan column list
            blocker: select all
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};