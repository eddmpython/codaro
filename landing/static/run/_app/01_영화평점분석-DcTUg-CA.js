var e=`meta:
  packages:
  - polars
  id: polars_01
  title: 영화평점분석
  order: 1
  category: polars
  difficulty: ⭐
  badge: 입문
  tags:
  - IMDB
  - read_csv
  - select
  - filter
  - group_by
  - mean
  - DataFrame
  seo:
    title: Polars 입문 - 영화 평점 데이터 분석
    description: IMDB 영화 데이터로 장르별 평균 평점을 분석합니다. pl.read_csv, select, filter, group_by, mean 사용법을 배웁니다.
    keywords:
    - polars
    - pl.read_csv
    - select
    - filter
    - group_by
    - mean
    - 영화분석
intro:
  emoji: 🎬
  goal: 장르별 평균 평점을 DataFrame으로 분석합니다.
  description: IMDB 영화 데이터로 Polars 기본 문법을 익힙니다. 데이터 로드 → 탐색 → 집계 → 결과 확인의 흐름을 경험합니다.
  direction: 영화평점분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.
  - 영화평점분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 스키마 확인 결과 검증
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.
    - label: 영화평점분석 재사용
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 컬럼형 표 분석 환경
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.
    - label: 영화평점분석 실행
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.
    - label: 영화평점분석 완료
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import polars as pl
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    Polars는 pandas와 유사한 DataFrame 라이브러리지만, 성능에 특화되어 있습니다. Rust 언어로 작성되어 메모리 효율이 뛰어나고 병렬 처리를 기본으로 지원합니다. pl이라는 짧은 이름으로 불러와서 사용하는 것이 관례입니다. pandas가 pd인 것처럼 Polars는 pl로 시작합니다.

    import polars as pl은 Polars의 표준 관례입니다. pandas의 pd처럼 짧게 사용하여 pl.read_csv(), pl.col() 등의 함수를 호출합니다. Polars는 Rust 기반으로 pandas보다 10~100배 빠르며, 메모리 사용량도 적습니다.
  tips:
  - import polars as pl은 Polars의 표준 관례입니다. pandas의 pd처럼 짧게 사용하여 pl.read_csv(), pl.col() 등의 함수를 호출합니다.
    Polars는 Rust 기반으로 pandas보다 10~100배 빠르며, 메모리 사용량도 적습니다.
  snippet: import polars as pl
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import polars as pl
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: pl.read_csv()
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    IMDB(Internet Movie Database) 영화 데이터를 불러옵니다. 이 데이터셋에는 2006년부터 2016년까지의 인기 영화 1000개에 대한 정보가 포함되어 있습니다. 영화 제목, 장르, 감독, 배우, 평점, 수익 등 다양한 정보를 담고 있어 데이터 분석 연습에 적합합니다. pl.read_csv()는 CSV 파일을 읽어 Polars DataFrame으로 변환합니다. pandas의 pd.read_csv()와 사용법이 거의 동일하지만, 내부적으로는 훨씬 빠른 성능을 제공합니다.

    이번 수업은 Codaro 로컬 데이터를 CSV 문자열로 만든 뒤 StringIO와 pl.read_csv()로 읽습니다. 실제 업무에서는 같은 함수에 파일 경로나 내부 데이터 경로를 넣어 대용량 CSV를 빠르게 읽을 수 있습니다.
  tips:
  - 이번 수업은 Codaro 로컬 데이터를 CSV 문자열로 만든 뒤 StringIO와 pl.read_csv()로 읽습니다. 실제 업무에서는 같은 함수에 파일 경로나 내부 데이터 경로를
    넣어 대용량 CSV를 빠르게 읽을 수 있습니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    moviesCsv = loadLocalDataset("imdb_movies").to_csv(index=False)
    movies = pl.read_csv(StringIO(moviesCsv))
    movies.head()
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      moviesCsv = loadLocalDataset("imdb_movies").to_csv(index=False)
      movies = pl.read_csv(StringIO(moviesCsv))
      movies.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_schema
  title: 3단계. 스키마 확인
  structuredPrimary: true
  subtitle: schema
  goal: 3단계. 스키마 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    스키마(schema)는 DataFrame의 설계도입니다. 각 컬럼의 이름과 데이터 타입이 무엇인지 한눈에 보여줍니다. 데이터 분석을 시작할 때는 어떤 컬럼이 있고, 각 컬럼이 숫자인지 문자인지 날짜인지 파악하는 것이 중요합니다. Polars는 Int64(정수), Float64(실수), Utf8(문자열) 등 명확한 타입 시스템을 가지고 있어 타입 관련 오류를 미리 방지할 수 있습니다.

    schema는 딕셔너리 형태로 {컬럼명: 타입}을 반환합니다. pandas의 dtypes와 비슷하지만 더 읽기 쉬운 형태입니다. Polars는 타입을 명확히 구분하여 Int64(64비트 정수), Float64(64비트 실수), Utf8(문자열), Date(날짜) 등으로 표시합니다.
  tips:
  - 'schema는 딕셔너리 형태로 {컬럼명: 타입}을 반환합니다. pandas의 dtypes와 비슷하지만 더 읽기 쉬운 형태입니다. Polars는 타입을 명확히 구분하여 Int64(64비트
    정수), Float64(64비트 실수), Utf8(문자열), Date(날짜) 등으로 표시합니다.'
  snippet: movies.schema
  exercise:
    prompt: 3단계. 스키마 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: movies.schema
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 스키마 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 스키마 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_preview
  title: 4단계. 데이터 미리보기
  structuredPrimary: true
  subtitle: head()
  goal: 4단계. 데이터 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    head() 메서드로 데이터의 처음 몇 행을 확인합니다. 전체 데이터를 다 보면 너무 길기 때문에 대표적인 샘플만 보는 것입니다. 기본적으로 5행을 보여주며, head(10)처럼 괄호 안에 숫자를 넣으면 원하는 개수만큼 볼 수 있습니다. 데이터의 실제 값들을 보면서 각 컬럼이 어떤 정보를 담고 있는지 감을 잡을 수 있습니다.

    head()는 기본적으로 5행을 보여줍니다. head(10)처럼 숫자를 넣으면 원하는 개수만큼 확인할 수 있습니다. 반대로 tail()을 사용하면 마지막 행부터 볼 수 있습니다. 데이터 탐색의 첫 단계로 자주 사용됩니다.
  tips:
  - head()는 기본적으로 5행을 보여줍니다. head(10)처럼 숫자를 넣으면 원하는 개수만큼 확인할 수 있습니다. 반대로 tail()을 사용하면 마지막 행부터 볼 수 있습니다.
    데이터 탐색의 첫 단계로 자주 사용됩니다.
  snippet: movies.head()
  exercise:
    prompt: 4단계. 데이터 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: movies.head()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 데이터 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 데이터 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_select
  title: 5단계. 필요한 컬럼 선택
  structuredPrimary: true
  subtitle: select, pl.col
  goal: 5단계. 필요한 컬럼 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    데이터에 너무 많은 컬럼이 있으면 분석이 복잡해집니다. select()로 필요한 컬럼만 골라서 작업할 수 있습니다. Polars에서는 pl.col()이라는 표현식(expression)을 사용하여 컬럼을 지정합니다. 이것은 Polars의 핵심 개념으로, 단순히 컬럼을 선택하는 것뿐만 아니라 나중에 다양한 연산과 변환에도 사용됩니다. pandas의 df["Title"]과 비슷하지만 더 강력하고 유연한 기능을 제공합니다.

    pl.col()은 Polars의 핵심 표현식입니다. 컬럼을 참조하는 것뿐만 아니라 나중에 필터링, 변환, 집계 등 모든 작업에 사용됩니다. select() 안에 여러 pl.col()을 나열하면 해당 컬럼들만 선택한 새로운 DataFrame을 반환합니다. 원본은 변경되지 않습니다.
  tips:
  - pl.col()은 Polars의 핵심 표현식입니다. 컬럼을 참조하는 것뿐만 아니라 나중에 필터링, 변환, 집계 등 모든 작업에 사용됩니다. select() 안에 여러 pl.col()을
    나열하면 해당 컬럼들만 선택한 새로운 DataFrame을 반환합니다. 원본은 변경되지 않습니다.
  snippet: |-
    movies.select(
        pl.col("Title"),
        pl.col("Genre"),
        pl.col("Rating")
    )
  exercise:
    prompt: 5단계. 필요한 컬럼 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      movies.select(
          pl.col("Title"),
          pl.col("Genre"),
          pl.col("Rating")
      )
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 필요한 컬럼 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. 필요한 컬럼 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_filter
  title: 6단계. 조건 필터링
  structuredPrimary: true
  subtitle: filter
  goal: 6단계. 조건 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    모든 영화를 분석하는 것보다 특정 조건에 맞는 영화만 선택하는 것이 더 의미 있을 때가 많습니다. filter()는 조건에 맞는 행만 추출하는 함수입니다. 여기서는 평점 7.0 이상인 고평점 영화만 선택합니다. pandas의 불린 인덱싱(df[df["Rating"] >= 7.0])과 비슷하지만, Polars는 filter() 메서드로 더 명확하게 표현합니다. shape 속성으로 필터링 결과 몇 개의 행이 남았는지 확인할 수 있습니다.

    filter()는 조건에 맞는 행만 남깁니다. pl.col("컬럼명") >= 값 형태로 조건을 작성하며, >=, <=, ==, != 등의 비교 연산자를 사용합니다. shape로 (행 수, 열 수)를 확인할 수 있습니다. pandas의 df[조건]보다 읽기 쉽고 메서드 체이닝에 적합합니다.
  tips:
  - filter()는 조건에 맞는 행만 남깁니다. pl.col("컬럼명") >= 값 형태로 조건을 작성하며, >=, <=, ==, != 등의 비교 연산자를 사용합니다. shape로
    (행 수, 열 수)를 확인할 수 있습니다. pandas의 df[조건]보다 읽기 쉽고 메서드 체이닝에 적합합니다.
  snippet: |-
    highRated = movies.filter(pl.col("Rating") >= 7.0)
    highRated.shape
  exercise:
    prompt: 6단계. 조건 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      highRated = movies.filter(pl.col("Rating") >= 7.0)
      highRated.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 조건 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 6단계. 조건 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step7_genre
  title: 7단계. 장르 분리하기
  structuredPrimary: true
  subtitle: 문자열 처리와 with_columns
  goal: 7단계. 장르 분리하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    실제 데이터는 깔끔하지 않은 경우가 많습니다. 이 데이터의 Genre 컬럼은 "Action,Adventure,Sci-Fi"처럼 여러 장르가 쉼표로 연결되어 있습니다. 분석을 위해 주요 장르 하나만 추출하겠습니다. str.split(",")으로 쉼표 기준으로 문자열을 나누고, list.first()로 첫 번째 값만 가져옵니다. with_columns()는 새로운 컬럼을 추가하는 메서드이며, alias()로 새 컬럼의 이름을 지정합니다. 이것은 Polars의 메서드 체이닝(method chaining) 스타일입니다.

    str.split()은 문자열을 나누어 리스트로 만들고, list.first()는 리스트의 첫 번째 요소를 가져옵니다. with_columns()는 기존 DataFrame에 새 컬럼을 추가하며, alias()로 컬럼명을 지정합니다. 이러한 메서드 체이닝은 Polars의 핵심 스타일입니다.
  tips:
  - str.split()은 문자열을 나누어 리스트로 만들고, list.first()는 리스트의 첫 번째 요소를 가져옵니다. with_columns()는 기존 DataFrame에 새
    컬럼을 추가하며, alias()로 컬럼명을 지정합니다. 이러한 메서드 체이닝은 Polars의 핵심 스타일입니다.
  snippet: |-
    moviesWithGenre = movies.with_columns(
        pl.col("Genre").str.split(",").list.first().alias("MainGenre")
    )
    moviesWithGenre.select("Title", "Genre", "MainGenre", "Rating").head()
  exercise:
    prompt: 7단계. 장르 분리하기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      moviesWithGenre = movies.with_columns(
          pl.col("Genre").str.split(",").list.first().alias("MainGenre")
      )
      moviesWithGenre.select("Title", "Genre", "MainGenre", "Rating").head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 장르 분리하기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 7단계. 장르 분리하기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step8_groupby
  title: 8단계. 장르별 평균 계산
  structuredPrimary: true
  subtitle: group_by와 agg
  goal: 8단계. 장르별 평균 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    이제 프로젝트의 핵심 목표인 "장르별 평균 평점"을 계산합니다. group_by()는 지정한 컬럼의 값이 같은 행들을 하나의 그룹으로 묶습니다. 예를 들어 MainGenre가 "Action"인 모든 영화를 하나의 그룹으로, "Comedy"인 영화를 또 다른 그룹으로 묶는 것입니다. agg()는 각 그룹에 대해 집계 함수를 적용합니다. mean()으로 평균을 구하고, alias()로 결과 컬럼명을 "AvgRating"으로 지정합니다. sort()로 평균 평점이 높은 순으로 정렬하여 어떤 장르의 평점이 가장 높은지 확인합니다.

    group_by("컬럼")은 해당 컬럼 값이 같은 행끼리 그룹을 만듭니다. agg() 안에 집계 함수를 넣어 각 그룹별 통계를 계산합니다. mean()(평균), sum()(합계), count()(개수), max()(최대), min()(최소) 등을 사용할 수 있습니다. sort(descending=True)로 내림차순 정렬합니다.
  tips:
  - group_by("컬럼")은 해당 컬럼 값이 같은 행끼리 그룹을 만듭니다. agg() 안에 집계 함수를 넣어 각 그룹별 통계를 계산합니다. mean()(평균), sum()(합계),
    count()(개수), max()(최대), min()(최소) 등을 사용할 수 있습니다. sort(descending=True)로 내림차순 정렬합니다.
  snippet: |-
    genreRating = moviesWithGenre.group_by("MainGenre").agg(
        pl.col("Rating").mean().alias("AvgRating")
    ).sort("AvgRating", descending=True)
    genreRating
  exercise:
    prompt: 8단계. 장르별 평균 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      genreRating = moviesWithGenre.group_by("MainGenre").agg(
          pl.col("Rating").mean().alias("AvgRating")
      ).sort("AvgRating", descending=True)
      genreRating
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 장르별 평균 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 8단계. 장르별 평균 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step9_result
  title: 9단계. 결과 확인
  structuredPrimary: true
  subtitle: DataFrame 출력
  goal: 9단계. 결과 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 정렬된 DataFrame 결과를 확인합니다. 평균 평점이 높은 순으로 장르가 나열됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: genreRating
  exercise:
    prompt: 9단계. 결과 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: genreRating
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 결과 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 9단계. 결과 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step10_final
  title: 10단계. 추가 분석
  structuredPrimary: true
  subtitle: 여러 집계 동시에
  goal: 10단계. 추가 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    agg() 안에 여러 집계 함수를 리스트로 전달하면 한 번에 여러 통계를 계산할 수 있습니다. 장르별 평균 평점뿐만 아니라 해당 장르의 영화가 몇 개인지도 함께 확인하면 더 의미 있는 분석이 됩니다. 예를 들어 평균 평점이 높아도 영화가 1개뿐이면 신뢰도가 낮을 수 있습니다. count()로 각 장르의 영화 개수를 세고, mean()으로 평균 평점을 구합니다. 이렇게 여러 지표를 함께 보면 데이터를 더 정확하게 이해할 수 있습니다.

    agg() 안에 여러 집계를 리스트로 묶으면 한 번에 여러 통계를 계산합니다. 각 집계마다 alias()로 의미 있는 컬럼명을 지정하세요. 이렇게 하면 평균, 개수, 합계 등을 동시에 구할 수 있어 효율적입니다.
  tips:
  - agg() 안에 여러 집계를 리스트로 묶으면 한 번에 여러 통계를 계산합니다. 각 집계마다 alias()로 의미 있는 컬럼명을 지정하세요. 이렇게 하면 평균, 개수, 합계 등을
    동시에 구할 수 있어 효율적입니다.
  snippet: |-
    genreStats = moviesWithGenre.group_by("MainGenre").agg([
        pl.col("Rating").mean().alias("AvgRating"),
        pl.col("Rating").count().alias("MovieCount")
    ]).sort("AvgRating", descending=True)
    genreStats
  exercise:
    prompt: 10단계. 추가 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      genreStats = moviesWithGenre.group_by("MainGenre").agg([
          pl.col("Rating").mean().alias("AvgRating"),
          pl.col("Rating").count().alias("MovieCount")
      ]).sort("AvgRating", descending=True)
      genreStats
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 추가 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 10단계. 추가 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: workflow_validation
  title: 11단계. 실무 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 오류 수정 → 검증 → 기준 변경
  goal: 11단계. 실무 검증 루프에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    업무에서 집계 결과를 보고서나 자동화 파이프라인에 넘길 때는 DataFrame이 만들어졌다는 사실만으로 충분하지 않습니다. 먼저 필요한 컬럼이 있는지 확인하고, 결과가 말이 되는지 예측한 뒤, 의도적으로 깨진 결과를 검증 함수가 잡아내는지 확인합니다. 마지막으로 기준값을 바꿔도 결론이 안정적인지 실험합니다.

    실무 집계는 결과를 눈으로만 보는 것이 아니라 데이터 계약, 예상 결론, 실패 케이스, 기준값 변화까지 함께 남겨야 재사용할 수 있습니다.
  snippet: |-
    requiredColumns = {"Title", "Genre", "Director", "Year", "Rating", "Revenue (Millions)"}
    missingColumns = requiredColumns - set(movies.columns)

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert movies.height == 1000, "로컬 IMDB 샘플은 1000행이어야 합니다."
    assert movies.select(pl.col("Rating").is_between(0, 10).all()).item(), "평점은 0~10 범위여야 합니다."

    print("데이터 계약 통과:", movies.shape)
  exercise:
    prompt: 11단계. 실무 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      requiredColumns = {"Title", "Genre", "Director", "Year", "Rating", "Revenue (Millions)"}
      missingColumns = requiredColumns - set(movies.columns)

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert movies.height == 1000, "로컬 IMDB 샘플은 1000행이어야 합니다."
      assert movies.select(pl.col("Rating").is_between(0, 10).all()).item(), "평점은 0~10 범위여야 합니다."

      print("데이터 계약 통과:", movies.shape)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 실무 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 실무 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: IMDB 영화 데이터 분석 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 select, filter, group_by, mean을 활용하여 다양한 분석을 해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import polars as pl
    from io import StringIO
    from codaro.curriculum.localData import loadLocalDataset

    imdb = pl.read_csv(StringIO(loadLocalDataset("imdb_movies").to_csv(index=False)))
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import polars as pl
      from io import StringIO
      from codaro.curriculum.localData import loadLocalDataset

      imdb = pl.read_csv(StringIO(loadLocalDataset("imdb_movies").to_csv(index=False)))
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
    content: Polars로 첫 데이터 분석을 완료했습니다.
  - type: list
    items:
    - pl.read_csv() - CSV 파일 읽기
    - schema - 컬럼명과 타입 확인
    - select(pl.col()) - 원하는 컬럼 선택
    - filter(조건) - 조건에 맞는 행 필터링
    - group_by().agg() - 그룹별 집계
    - mean() - 평균 계산
  - type: text
    content: 다음 시간에는 날씨 데이터로 with_columns와 날짜 처리를 배웁니다.
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
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
  - id: polars_01-movie-rating-groups-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - summary
    title: 영화별 평점 count·mean과 최소 표본 필터 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: group aggregation 뒤 최소 rating 수를 통과한 영화만 평균 내림차순으로 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - minimum_count는 개별 row filter가 아니라 group count에 적용하세요.
    - 평균과 count를 함께 보여 표본이 작은 순위를 숨기지 마세요.
    exercise:
      prompt: rank_movie_ratings(rows, minimum_count)를 완성해 movies와 dropped를 반환하세요.
      starterCode: |-
        def rank_movie_ratings(rows, minimum_count):
            raise NotImplementedError
      solution: |
        def rank_movie_ratings(rows, minimum_count):
            grouped = {}
            for row in rows:
                grouped.setdefault(row["movie"], []).append(row["rating"])
            kept = []
            dropped = []
            for movie, values in grouped.items():
                if len(values) < minimum_count:
                    dropped.append(movie)
                else:
                    kept.append({"movie": movie, "count": len(values), "mean": round(sum(values) / len(values), 2)})
            kept.sort(key=lambda row: (-row["mean"], -row["count"], row["movie"]))
            return {"movies": kept, "dropped": sorted(dropped)}
      hints: *id001
    check:
      id: python.polars.polars_01.movie-rating-groups.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_01.movie-rating-groups.mastery.behavior.v1.fixture
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
        entry: rank_movie_ratings
        cases:
        - id: filters-after-grouping
          arguments:
          - value:
            - movie: A
              rating: 5
            - movie: A
              rating: 3
            - movie: B
              rating: 5
          - value: 2
          expectedReturn:
            movies:
            - movie: A
              count: 2
              mean: 4.0
            dropped:
            - B
        - id: handles-empty-ratings
          arguments:
          - value: []
          - value: 1
          expectedReturn:
            movies: []
            dropped: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: polars_01-weighted-review-score-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_01-movie-rating-groups-mastery
    title: 새 리뷰 데이터에 신뢰도 weight를 적용하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 단순 평균을 verified reviewer weight가 있는 가중 평균과 evidence count로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 가중 합과 weight 합을 따로 누적하세요.
    - 가중 평균 옆에 실제 reviewCount도 남기세요.
    exercise:
      prompt: weighted_review_scores(rows)를 완성해 영화별 score와 weightTotal을 반환하세요.
      starterCode: |-
        def weighted_review_scores(rows):
            raise NotImplementedError
      solution: |
        def weighted_review_scores(rows):
            grouped = {}
            for row in rows:
                weight = 2 if row.get("verified") else 1
                bucket = grouped.setdefault(row["movie"], {"weighted": 0, "weight": 0, "count": 0})
                bucket["weighted"] += row["rating"] * weight
                bucket["weight"] += weight
                bucket["count"] += 1
            return {movie: {"score": round(bucket["weighted"] / bucket["weight"], 3), "weightTotal": bucket["weight"], "reviewCount": bucket["count"]} for movie, bucket in sorted(grouped.items())}
      hints: *id002
    check:
      id: python.polars.polars_01.weighted-review-score.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_01.weighted-review-score.transfer.behavior.v1.fixture
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
        entry: weighted_review_scores
        cases:
        - id: weights-verified-review
          arguments:
          - value:
            - movie: A
              rating: 5
              verified: true
            - movie: A
              rating: 2
              verified: false
            - movie: B
              rating: 4
              verified: false
          expectedReturn:
            A:
              score: 4.0
              weightTotal: 3
              reviewCount: 2
            B:
              score: 4.0
              weightTotal: 1
              reviewCount: 1
        - id: handles-empty-review-set
          arguments:
          - value: []
          expectedReturn: {}
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: polars_01-group-expression-choice-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_01-weighted-review-score-transfer
    title: group aggregation expression 선택 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: count, mean, weighted mean 질문의 분자·분모·필터 시점을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - group filter와 row filter의 시점을 구분하세요.
    - 가중 평균 분모는 row 수가 아니라 weight 합입니다.
    exercise:
      prompt: choose_group_expression(situation)를 완성해 expression, denominator, filterStage를 반환하세요.
      starterCode: |-
        def choose_group_expression(situation):
            raise NotImplementedError
      solution: |
        def choose_group_expression(situation):
            table = {'ratings-per-movie': {'expression': 'len', 'denominator': None, 'filterStage': 'after group'}, 'average-rating': {'expression': 'mean', 'denominator': 'non-null ratings', 'filterStage': 'before group for invalid rows'}, 'trusted-average': {'expression': 'sum(value*weight)/sum(weight)', 'denominator': 'weight sum', 'filterStage': 'after weight validation'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.polars.polars_01.group-expression-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_01.group-expression-choice.retrieval.behavior.v1.fixture
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
        entry: choose_group_expression
        cases:
        - id: recalls-ratings-per-movie
          arguments:
          - value: ratings-per-movie
          expectedReturn:
            expression: len
            denominator: null
            filterStage: after group
        - id: recalls-average-rating
          arguments:
          - value: average-rating
          expectedReturn:
            expression: mean
            denominator: non-null ratings
            filterStage: before group for invalid rows
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};