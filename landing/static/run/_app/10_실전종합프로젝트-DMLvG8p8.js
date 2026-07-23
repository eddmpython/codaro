var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_10\r
  title: 실전종합프로젝트\r
  order: 10\r
  category: polars\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - Polars\r
  - 다중소스\r
  - 통합분석\r
  - Lazy\r
  - 종합프로젝트\r
  seo:\r
    title: Polars 실전 종합 프로젝트 - 다중 데이터 통합 분석\r
    description: 여러 데이터셋을 결합하여 종합 분석 파이프라인을 구축합니다. 모든 Polars 개념을 총정리합니다.\r
    keywords:\r
    - polars\r
    - 다중 데이터\r
    - 통합 분석\r
    - lazy evaluation\r
    - 종합 프로젝트\r
intro:\r
  emoji: 🏆\r
  goal: 영화, 배우, 수익 데이터를 통합하여 "영화 산업 종합 분석 대시보드"를 완성합니다.\r
  description: 모든 Polars 개념(read_csv, select, filter, with_columns, group_by, join, concat, window, lazy,\r
    pivot)을 종합하여 실전 데이터 파이프라인을 구축합니다.\r
  direction: 실전종합프로젝트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 실전종합프로젝트 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 프로젝트 목표 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 생성 및 로드 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 전처리 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 실전종합프로젝트 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 실전종합프로젝트 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 실전종합프로젝트 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_goal\r
  title: 1단계. 프로젝트 목표\r
  structuredPrimary: true\r
  subtitle: 다중 소스 통합 분석\r
  goal: 1단계. 프로젝트 목표에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 10개의 Polars 프로젝트를 마무리하는 종합 프로젝트입니다. 지금까지 배운 모든 개념을 하나의 데이터 파이프라인에 통합하여 실전 분석 능력을 완성합니다.\r
    실무 데이터 분석에서는 단일 테이블이 아닌 여러 소스의 데이터를 결합하여 분석하는 경우가 대부분입니다. 이 프로젝트에서는 영화 정보, 배우 정보, 수익 데이터라는 3개의 독립적인\r
    데이터셋을 movieId라는 공통 키로 조인하여 영화 산업 전반을 분석합니다. 데이터 로드부터 전처리, 결합, 변환, 집계, 윈도우 함수, 피벗, Lazy 최적화까지 모든 단계를\r
    경험하며, 종합 대시보드를 만드는 완전한 데이터 파이프라인을 구축합니다. 이 프로젝트를 완료하면 Polars로 어떤 분석 업무도 수행할 수 있는 역량을 갖추게 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import polars as pl\r
\r
    projectPlan = pl.DataFrame({\r
        "단계": ["1.로드", "2.전처리", "3.결합", "4.변환", "5.필터", "6.집계", "7.윈도우", "8.피벗", "9.Lazy", "10.대시보드"],\r
        "핵심함수": ["read_csv", "cast/null", "join", "with_columns", "filter", "group_by", "over", "pivot", "lazy/collect", "agg"],\r
        "설명": ["3개 DataFrame 생성", "타입변환/결측치", "movieId로 조인", "ROI/등급 파생", "조건 추출", "장르별 통계", "순위/누적", "교차표 생성", "쿼리 최적화", "종합 요약"]\r
    })\r
    projectPlan\r
  exercise:\r
    prompt: 1단계. 프로젝트 목표 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
\r
      projectPlan = pl.DataFrame({\r
          "단계": ["1.로드", "2.전처리", "3.결합", "4.변환", "5.필터", "6.집계", "7.윈도우", "8.피벗", "9.Lazy", "10.대시보드"],\r
          "핵심함수": ["read_csv", "cast/null", "join", "with_columns", "filter", "group_by", "over", "pivot", "lazy/collect", "agg"],\r
          "설명": ["3개 DataFrame 생성", "타입변환/결측치", "movieId로 조인", "ROI/등급 파생", "조건 추출", "장르별 통계", "순위/누적", "교차표 생성", "쿼리 최적화", "종합 요약"]\r
      })\r
      projectPlan\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 프로젝트 목표의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 프로젝트 목표의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 생성 및 로드\r
  structuredPrimary: true\r
  subtitle: 세 개의 DataFrame (A1, A3 반복)\r
  goal: 2단계. 데이터 생성 및 로드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 실전 분석을 시뮬레이션하기 위해 3개의 독립적인 DataFrame을 생성합니다. 실무 환경에서는 영화 정보는 영화사 데이터베이스에서, 배우 정보는 인사 시스템에서,\r
    수익 데이터는 재무 시스템에서 각각 추출하여 pl.read_csv()나 pl.read_database()로 불러옵니다. 이렇게 분산된 데이터 소스를 하나로 통합하는 것이 데이터\r
    엔지니어링의 핵심입니다. dfMovies는 영화 제목, 장르, 개봉연도, 평점, 국가 정보를 담고 있고, dfActors는 배우명과 출연료를, dfRevenue는 제작비와 흥행\r
    수익을 포함합니다. 세 테이블은 모두 movieId라는 공통 식별자를 가지고 있어 조인이 가능합니다. 스키마를 확인하면 각 테이블의 구조와 데이터 타입을 파악할 수 있으며, 이는\r
    조인 전략을 수립하는 첫 단계입니다. 실무에서는 수백만 건의 데이터를 다루지만, 여기서는 학습을 위해 10건의 대표적인 영화를 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import polars as pl\r
\r
    dfMovies = pl.DataFrame({\r
        "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
        "title": ["Avengers", "Titanic", "Avatar", "Joker", "Frozen", "Inception", "Interstellar", "Parasite", "The Batman", "Dune"],\r
        "genre": ["Action", "Romance", "Sci-Fi", "Drama", "Animation", "Sci-Fi", "Sci-Fi", "Drama", "Action", "Sci-Fi"],\r
        "year": [2012, 1997, 2009, 2019, 2013, 2010, 2014, 2019, 2022, 2021],\r
        "rating": [8.0, 7.9, 7.8, 8.4, 7.4, 8.8, 8.6, 8.5, 7.8, 8.0],\r
        "country": ["USA", "USA", "USA", "USA", "USA", "USA", "USA", "Korea", "USA", "USA"]\r
    })\r
\r
    dfActors = pl.DataFrame({\r
        "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
        "name": ["Robert Downey Jr.", "Leonardo DiCaprio", "Sam Worthington", "Joaquin Phoenix", "Kristen Bell", "Leonardo DiCaprio", "Matthew McConaughey", "Song Kangho", "Robert Pattinson", "Timothee Chalamet"],\r
        "fee": [50, 25, 10, 20, 5, 30, 25, 2, 15, 12]\r
    })\r
\r
    dfRevenue = pl.DataFrame({\r
        "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
        "budget": [220, 200, 237, 55, 150, 160, 165, 11, 185, 165],\r
        "boxOffice": [1518, 2200, 2847, 1074, 1280, 829, 677, 258, 770, 401],\r
        "releaseDate": ["2012-05-04", "1997-12-19", "2009-12-18", "2019-10-04", "2013-11-27", "2010-07-16", "2014-11-07", "2019-05-30", "2022-03-04", "2021-10-22"]\r
    })\r
\r
    dfMovies\r
  exercise:\r
    prompt: 2단계. 데이터 생성 및 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
\r
      dfMovies = pl.DataFrame({\r
          "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
          "title": ["Avengers", "Titanic", "Avatar", "Joker", "Frozen", "Inception", "Interstellar", "Parasite", "The Batman", "Dune"],\r
          "genre": ["Action", "Romance", "Sci-Fi", "Drama", "Animation", "Sci-Fi", "Sci-Fi", "Drama", "Action", "Sci-Fi"],\r
          "year": [2012, 1997, 2009, 2019, 2013, 2010, 2014, 2019, 2022, 2021],\r
          "rating": [8.0, 7.9, 7.8, 8.4, 7.4, 8.8, 8.6, 8.5, 7.8, 8.0],\r
          "country": ["USA", "USA", "USA", "USA", "USA", "USA", "USA", "Korea", "USA", "USA"]\r
      })\r
\r
      dfActors = pl.DataFrame({\r
          "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
          "name": ["Robert Downey Jr.", "Leonardo DiCaprio", "Sam Worthington", "Joaquin Phoenix", "Kristen Bell", "Leonardo DiCaprio", "Matthew McConaughey", "Song Kangho", "Robert Pattinson", "Timothee Chalamet"],\r
          "fee": [50, 25, 10, 20, 5, 30, 25, 2, 15, 12]\r
      })\r
\r
      dfRevenue = pl.DataFrame({\r
          "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
          "budget": [220, 200, 237, 55, 150, 160, 165, 11, 185, 165],\r
          "boxOffice": [1518, 2200, 2847, 1074, 1280, 829, 677, 258, 770, 401],\r
          "releaseDate": ["2012-05-04", "1997-12-19", "2009-12-18", "2019-10-04", "2013-11-27", "2010-07-16", "2014-11-07", "2019-05-30", "2022-03-04", "2021-10-22"]\r
      })\r
\r
      dfMovies\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 생성 및 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 생성 및 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_preprocess\r
  title: 3단계. 전처리\r
  structuredPrimary: true\r
  subtitle: null 처리, 타입 변환 (C5, D3, D5 반복)\r
  goal: 3단계. 전처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 원시 데이터(raw data)는 그대로 분석에 사용할 수 없는 경우가 많습니다. 전처리(preprocessing) 단계에서 데이터 타입을 변환하고, 결측치를\r
    처리하고, 이상치를 제거하는 등의 작업을 수행합니다. 여기서는 releaseDate가 문자열("2012-05-04")로 저장되어 있어 날짜 연산이 불가능합니다. str.to_date()로\r
    Date 타입으로 변환하면 연도, 월, 요일 추출, 날짜 차이 계산 등의 시계열 분석이 가능해집니다. null 값 확인은 데이터 품질 점검의 필수 단계입니다. null이 있으면\r
    집계 결과가 왜곡되거나 조인 실패가 발생할 수 있습니다. 실무에서는 전처리 단계에서 데이터 품질 리포트를 생성하고, 문제가 있는 데이터는 소스 시스템에 피드백하거나 규칙에 따라\r
    처리합니다. 좋은 분석의 80%는 전처리에서 결정됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfRevenue = dfRevenue.with_columns(\r
        pl.col("releaseDate").str.to_date("%Y-%m-%d").alias("releaseDate")\r
    )\r
    dfRevenue\r
  exercise:\r
    prompt: 3단계. 전처리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfRevenue = dfRevenue.with_columns(\r
          pl.col("releaseDate").str.to_date("%Y-%m-%d").alias("releaseDate")\r
      )\r
      dfRevenue\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 전처리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 전처리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_join\r
  title: 4단계. 데이터 결합\r
  structuredPrimary: true\r
  subtitle: join, concat (F1, F4 반복)\r
  goal: 4단계. 데이터 결합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 분산된 데이터를 하나의 분석 테이블로 통합하는 것이 데이터 결합(join)입니다. SQL의 JOIN과 동일한 개념으로, 공통 키(movieId)를 기준으로\r
    여러 테이블의 정보를 결합합니다. left join을 사용하면 왼쪽 테이블(dfMovies)의 모든 행을 유지하고, 오른쪽 테이블에서 매칭되는 정보를 가져옵니다. 먼저 영화와\r
    배우 데이터를 결합하고(dfMovieActor), 그 결과에 수익 데이터를 추가로 결합합니다(dfFull). 단계별로 조인하면 각 단계의 결과를 확인하며 진행할 수 있습니다.\r
    조인 후에는 영화 제목, 배우명, 출연료, 제작비, 흥행 수익 등 모든 정보가 하나의 행에 모이므로 종합적인 분석이 가능해집니다. 실무에서는 수십 개의 테이블을 조인하는 경우도\r
    있으며, 조인 키 선택, 조인 방식(inner/left/outer), 중복 처리 등이 중요한 이슈입니다. Polars의 조인은 pandas보다 훨씬 빠른 성능을 제공합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfMovieActor = dfMovies.join(\r
        dfActors,\r
        on="movieId",\r
        how="left"\r
    )\r
    dfFull = dfMovieActor.join(\r
        dfRevenue,\r
        on="movieId",\r
        how="left"\r
    )\r
    dfFull\r
  exercise:\r
    prompt: 4단계. 데이터 결합 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfMovieActor = dfMovies.join(\r
          dfActors,\r
          on="movieId",\r
          how="left"\r
      )\r
      dfFull = dfMovieActor.join(\r
          dfRevenue,\r
          on="movieId",\r
          how="left"\r
      )\r
      dfFull\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 데이터 결합의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 데이터 결합의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_transform\r
  title: 5단계. 파생 컬럼 생성\r
  structuredPrimary: true\r
  subtitle: with_columns, alias, when-then (D1, D2, D6 반복)\r
  goal: 5단계. 파생 컬럼 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 원본 데이터에는 없지만 분석에 필요한 파생 변수(derived variable)를 생성합니다. 수익률(ROI)은 "(흥행 수익 - 제작비) / 제작비 * 100"으로\r
    계산하며, 투자 대비 수익을 백분율로 표현합니다. ROI가 200%면 투자금의 3배를 벌었다는 의미입니다. 날짜에서 연도(releaseYear)와 월(releaseMonth)을\r
    추출하면 시계열 분석과 계절성 분석이 가능합니다. when-then-otherwise 구문으로 수익률을 기준으로 "대박", "성공", "보통", "실패" 등급을 부여하면 영화를\r
    범주화할 수 있습니다. 이렇게 연속형 변수를 범주화하면 그룹별 비교가 쉬워집니다. 파생 변수는 원본 데이터에는 없지만 비즈니스 인사이트를 얻는 데 핵심적인 역할을 합니다. 실무에서는\r
    도메인 지식을 바탕으로 의미 있는 파생 변수를 설계하는 것이 데이터 분석가의 중요한 역량입니다. with_columns()로 여러 파생 변수를 한 번에 생성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfFull = dfFull.with_columns([\r
        ((pl.col("boxOffice") - pl.col("budget")) / pl.col("budget") * 100).alias("roi"),\r
        pl.col("releaseDate").dt.year().alias("releaseYear"),\r
        pl.col("releaseDate").dt.month().alias("releaseMonth")\r
    ])\r
    dfFull = dfFull.with_columns(\r
        pl.when(pl.col("roi") >= 500).then(pl.lit("대박"))\r
        .when(pl.col("roi") >= 200).then(pl.lit("성공"))\r
        .when(pl.col("roi") >= 0).then(pl.lit("보통"))\r
        .otherwise(pl.lit("실패")).alias("successLevel")\r
    )\r
    dfFull.select(["title", "budget", "boxOffice", "roi", "releaseYear", "releaseMonth", "successLevel"])\r
  exercise:\r
    prompt: 5단계. 파생 컬럼 생성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfFull = dfFull.with_columns([\r
          ((pl.col("boxOffice") - pl.col("budget")) / pl.col("budget") * 100).alias("roi"),\r
          pl.col("releaseDate").dt.year().alias("releaseYear"),\r
          pl.col("releaseDate").dt.month().alias("releaseMonth")\r
      ])\r
      dfFull = dfFull.with_columns(\r
          pl.when(pl.col("roi") >= 500).then(pl.lit("대박"))\r
          .when(pl.col("roi") >= 200).then(pl.lit("성공"))\r
          .when(pl.col("roi") >= 0).then(pl.lit("보통"))\r
          .otherwise(pl.lit("실패")).alias("successLevel")\r
      )\r
      dfFull.select(["title", "budget", "boxOffice", "roi", "releaseYear", "releaseMonth", "successLevel"])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 파생 컬럼 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 파생 컬럼 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_filter\r
  title: 6단계. 필터링\r
  structuredPrimary: true\r
  subtitle: filter, 비교/논리연산, str.contains (C1, C2, C3, C4 반복)\r
  goal: 6단계. 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 전체 데이터에서 분석 목적에 맞는 부분집합을 추출하는 것이 필터링입니다. 평점 8점 이상이면서 수익률 200% 이상인 영화만 추출하면 "흥행과 작품성을 모두\r
    갖춘 히트작"을 선별할 수 있습니다. &(and), |(or) 같은 논리 연산자로 복합 조건을 만들 수 있습니다. 문자열 필터에서는 str.contains()로 장르가 "Sci-Fi"를\r
    포함하는 영화를 찾을 수 있습니다. 정규표현식도 지원하므로 복잡한 패턴 매칭도 가능합니다. 필터링은 데이터 탐색의 기본이며, 적절한 필터링으로 노이즈를 제거하고 핵심 데이터에\r
    집중할 수 있습니다. Lazy 모드에서는 Predicate Pushdown으로 필터가 최우선으로 적용되어 성능이 극대화됩니다. 실무에서는 비즈니스 규칙에 따라 복잡한 필터 조건을\r
    설계합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfHits = dfFull.filter(\r
        (pl.col("rating") >= 8.0) & (pl.col("roi") >= 200)\r
    )\r
    dfHits.select(["title", "rating", "roi", "successLevel"])\r
  exercise:\r
    prompt: 6단계. 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfHits = dfFull.filter(\r
          (pl.col("rating") >= 8.0) & (pl.col("roi") >= 200)\r
      )\r
      dfHits.select(["title", "rating", "roi", "successLevel"])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_select\r
  title: 7단계. 열 선택\r
  structuredPrimary: true\r
  subtitle: select, pl.col, 다중열, exclude (B1, B2, B4, B5 반복)\r
  goal: 7단계. 열 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 분석 목적에 맞는 핵심 컬럼만 선택하여 데이터를 간결하게 만듭니다. 전체 테이블에는 수십 개의 컬럼이 있을 수 있지만, 특정 분석에서는 그 중 일부만 필요합니다.\r
    select()로 title, genre, rating, boxOffice 등 필요한 컬럼만 선택하면 데이터 크기가 줄어들어 메모리 효율이 높아지고 가독성도 향상됩니다. alias()로\r
    컬럼명을 변경하여 더 명확하게 표현할 수 있습니다. 반대로 exclude()를 사용하면 특정 컬럼만 제외하고 나머지를 선택할 수 있습니다. 예를 들어 movieId, actorId\r
    같은 내부 식별자는 분석 결과에서 제외하는 것이 좋습니다. Projection Pushdown 최적화에서는 select가 일찍 적용되어 불필요한 컬럼을 읽지 않으므로 I/O 비용이\r
    크게 감소합니다. 실무에서는 리포트마다 필요한 컬럼 세트가 다르므로 적절한 선택이 중요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfCore = dfFull.select([\r
        pl.col("title"),\r
        pl.col("genre"),\r
        pl.col("year"),\r
        pl.col("rating"),\r
        pl.col("name").alias("leadActor"),\r
        pl.col("boxOffice"),\r
        pl.col("roi")\r
    ])\r
    dfCore\r
  exercise:\r
    prompt: 7단계. 열 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfCore = dfFull.select([\r
          pl.col("title"),\r
          pl.col("genre"),\r
          pl.col("year"),\r
          pl.col("rating"),\r
          pl.col("name").alias("leadActor"),\r
          pl.col("boxOffice"),\r
          pl.col("roi")\r
      ])\r
      dfCore\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 열 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 열 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_group\r
  title: 8단계. 집계 분석\r
  structuredPrimary: true\r
  subtitle: group_by, agg, 다중그룹 (E1, E2, E3, E4, E5 반복)\r
  goal: 8단계. 집계 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 개별 데이터를 그룹별로 요약하여 전체적인 패턴을 파악하는 것이 집계 분석입니다. group_by("genre")로 장르별로 그룹화하고, agg()로 각 그룹의\r
    총 수익, 평균 수익, 평균 평점, 영화 수를 계산하면 "어떤 장르가 가장 수익성이 높은지" 한눈에 알 수 있습니다. 다중 그룹 집계에서는 ["genre", "successLevel"]처럼\r
    여러 컬럼으로 그룹화하여 교차 분석을 수행합니다. 예를 들어 "Sci-Fi 장르의 대박 영화는 몇 편인지"를 확인할 수 있습니다. sum, mean, count, first,\r
    n_unique 등 다양한 집계 함수를 조합하면 풍부한 통계를 산출할 수 있습니다. 집계 결과를 정렬하면 상위/하위 그룹을 빠르게 파악할 수 있습니다. Polars의 group_by는\r
    pandas보다 월등히 빠르며, 수백만 건의 데이터도 초 단위로 집계합니다. 실무에서는 집계 데이터를 대시보드나 리포트에 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    genreStats = dfFull.group_by("genre").agg([\r
        pl.col("boxOffice").sum().alias("totalRevenue"),\r
        pl.col("boxOffice").mean().alias("avgRevenue"),\r
        pl.col("rating").mean().alias("avgRating"),\r
        pl.len().alias("movieCount")\r
    ]).sort("totalRevenue", descending=True)\r
    genreStats\r
  exercise:\r
    prompt: 8단계. 집계 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      genreStats = dfFull.group_by("genre").agg([\r
          pl.col("boxOffice").sum().alias("totalRevenue"),\r
          pl.col("boxOffice").mean().alias("avgRevenue"),\r
          pl.col("rating").mean().alias("avgRating"),\r
          pl.len().alias("movieCount")\r
      ]).sort("totalRevenue", descending=True)\r
      genreStats\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 집계 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 집계 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_window\r
  title: 9단계. 윈도우 함수\r
  structuredPrimary: true\r
  subtitle: over, rank, rolling, cum_sum, shift (I1, I2, I3, I4, I5 반복)\r
  goal: 9단계. 윈도우 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 윈도우 함수는 집계와 달리 행을 줄이지 않고 각 행에 그룹 내 통계를 추가하는 고급 기법입니다. rank().over("genre")는 각 장르 내에서 흥행\r
    순위를 계산합니다. 예를 들어 Sci-Fi 장르 안에서 Avatar가 1위, Dune이 2위처럼 매기는 것입니다. 이렇게 하면 "각 장르의 최고 흥행작"을 쉽게 찾을 수 있습니다.\r
    시계열 분석에서는 cum_sum()으로 누적 합계를 계산하여 "시간에 따른 총 수익 증가 추세"를 볼 수 있고, shift()로 이전 값과 비교하여 증가율을 계산할 수 있습니다.\r
    rolling()로 이동 평균을 계산하면 단기 트렌드를 파악할 수 있습니다. 윈도우 함수는 SQL의 OVER 절, pandas의 transform()과 유사하지만 Polars가\r
    더 빠릅니다. 실무에서는 순위, 비율, 증가율, 이동 평균 등 복잡한 비즈니스 로직을 윈도우 함수로 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dfRanked = dfFull.with_columns(\r
        pl.col("boxOffice").rank(descending=True).over("genre").alias("genreRank")\r
    ).select(["title", "genre", "boxOffice", "genreRank"]).sort(["genre", "genreRank"])\r
    dfRanked\r
  exercise:\r
    prompt: 9단계. 윈도우 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dfRanked = dfFull.with_columns(\r
          pl.col("boxOffice").rank(descending=True).over("genre").alias("genreRank")\r
      ).select(["title", "genre", "boxOffice", "genreRank"]).sort(["genre", "genreRank"])\r
      dfRanked\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 윈도우 함수의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 윈도우 함수의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_sort\r
  title: 10단계. 정렬 및 상위 N개\r
  structuredPrimary: true\r
  subtitle: sort, head/tail (G1, G5 반복)\r
  goal: 10단계. 정렬 및 상위 N개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 데이터를 특정 기준으로 순서대로 배열하는 것이 정렬입니다. sort("roi", descending=True)는 수익률 내림차순 정렬로, 가장 수익성이 높은\r
    영화가 맨 위에 옵니다. head(5)와 조합하면 Top 5를 추출할 수 있습니다. 반대로 rating 오름차순 정렬 후 head(3)하면 평점이 낮은 하위 3개 영화를 찾을\r
    수 있습니다. 다중 정렬도 가능하여 ["genre", "rating"]으로 정렬하면 "장르별로 그룹화되고, 각 장르 내에서는 평점 순"으로 정렬됩니다. tail()은 하위 N개를\r
    추출합니다. 정렬은 데이터 탐색과 리포트 생성에 필수적이며, 상위/하위 항목을 찾는 것은 의사결정에 직접 활용됩니다. 실무에서는 "Top 10 고객", "하위 5% 제품" 같은\r
    분석을 자주 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    top5Roi = dfFull.sort("roi", descending=True).head(5).select(["title", "genre", "roi", "successLevel"])\r
    top5Roi\r
  exercise:\r
    prompt: 10단계. 정렬 및 상위 N개 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      top5Roi = dfFull.sort("roi", descending=True).head(5).select(["title", "genre", "roi", "successLevel"])\r
      top5Roi\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 정렬 및 상위 N개의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 정렬 및 상위 N개의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_pivot\r
  title: 11단계. 피벗\r
  structuredPrimary: true\r
  subtitle: pivot, unpivot, 체이닝 (J1, J2, J3 반복)\r
  goal: 11단계. 피벗에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 피벗은 데이터의 형태를 바꾸어 교차표(cross-tabulation)를 만드는 기법입니다. 행 데이터를 열로 펼치면 가독성이 높은 매트릭스 형태가 됩니다.\r
    장르별, 성공등급별 수익을 계산한 후 pivot(on="successLevel", index="genre", values="revenue")하면 장르가 행, 성공등급(대박/성공/보통/실패)이\r
    열이 되는 테이블이 생성됩니다. 이렇게 하면 "Sci-Fi 장르의 대박 영화 수익은 얼마인지" 한눈에 볼 수 있습니다. fill_null(0)로 값이 없는 셀을 0으로 채웁니다.\r
    Excel의 피벗 테이블, pandas의 pivot_table()과 동일한 기능입니다. unpivot()은 반대로 넓은 형태를 긴 형태로 변환합니다. 메서드 체이닝으로 filter,\r
    group_by, pivot, sort를 한 줄로 연결하면 복잡한 분석도 간결하게 표현할 수 있습니다. 실무에서는 피벗 테이블을 리포트나 대시보드의 핵심 뷰로 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pivotTable = dfFull.group_by(["genre", "successLevel"]).agg(\r
        pl.col("boxOffice").sum().alias("revenue")\r
    ).pivot(\r
        on="successLevel",\r
        index="genre",\r
        values="revenue"\r
    ).fill_null(0)\r
    pivotTable\r
  exercise:\r
    prompt: 11단계. 피벗 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pivotTable = dfFull.group_by(["genre", "successLevel"]).agg(\r
          pl.col("boxOffice").sum().alias("revenue")\r
      ).pivot(\r
          on="successLevel",\r
          index="genre",\r
          values="revenue"\r
      ).fill_null(0)\r
      pivotTable\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 11단계. 피벗의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 피벗의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_lazy\r
  title: 12단계. Lazy 최적화\r
  structuredPrimary: true\r
  subtitle: lazy, collect, explain (H1, H2, H3 반복)\r
  goal: 12단계. Lazy 최적화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 복잡한 데이터 파이프라인을 Lazy 모드로 작성하면 Polars가 자동으로 쿼리를 최적화합니다. lazy()로 시작하여 filter, group_by, agg,\r
    sort 등을 체이닝하면 쿼리 계획이 수집됩니다. explain()으로 최적화된 실행 계획을 확인하면 Predicate Pushdown, Projection Pushdown 등이\r
    적용된 것을 볼 수 있습니다. 예를 들어 "ROI > 100 필터링"이 맨 앞으로 이동하여 불필요한 데이터 처리를 건너뜁니다. collect()를 호출하면 최적화된 계획이 실제로\r
    실행되어 DataFrame을 반환합니다. 실무에서는 대부분의 분석을 Lazy 모드로 작성하여 성능을 극대화합니다. 특히 수백만 건 이상의 대용량 데이터나 복잡한 조인이 포함된\r
    쿼리에서 Lazy 모드의 성능 이점이 두드러집니다. 쿼리 개발 시에는 fetch(100)으로 상위 100개만 빠르게 테스트하고, 최종 실행 시 collect()를 사용하는 것이\r
    효율적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lazyQuery = (\r
        dfFull.lazy()\r
        .filter(pl.col("roi") > 100)\r
        .group_by("genre")\r
        .agg([\r
            pl.col("boxOffice").sum().alias("totalRevenue"),\r
            pl.len().alias("count")\r
        ])\r
        .sort("totalRevenue", descending=True)\r
    )\r
    lazyQuery.explain()\r
  exercise:\r
    prompt: 12단계. Lazy 최적화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lazyQuery = (\r
          dfFull.lazy()\r
          .filter(pl.col("roi") > 100)\r
          .group_by("genre")\r
          .agg([\r
              pl.col("boxOffice").sum().alias("totalRevenue"),\r
              pl.len().alias("count")\r
          ])\r
          .sort("totalRevenue", descending=True)\r
      )\r
      lazyQuery.explain()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 12단계. Lazy 최적화의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. Lazy 최적화의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_dashboard\r
  title: 13단계. 종합 대시보드\r
  structuredPrimary: true\r
  subtitle: 최종 결과물\r
  goal: 13단계. 종합 대시보드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 데이터 파이프라인의 최종 산출물은 의사결정에 활용할 수 있는 인사이트입니다. 종합 대시보드는 여러 관점의 집계 데이터를 한곳에 모아 전체 상황을 조망할 수\r
    있게 합니다. 장르별 요약에서는 영화 수, 총수익, 평균수익, 평균ROI, 평균평점을 계산하여 "어떤 장르가 가장 수익성이 높고 안정적인지" 파악합니다. 연도별 요약은 시계열\r
    트렌드를 보여주어 "영화 산업이 성장하는지, 제작비 대비 수익이 개선되는지" 분석할 수 있습니다. 배우별 요약은 "어떤 배우가 출연료 대비 흥행 효율이 높은지" 평가하여 캐스팅\r
    의사결정에 활용할 수 있습니다. round()로 소수점을 정리하고 한글 컬럼명을 사용하면 리포트 가독성이 향상됩니다. 실무에서는 이런 집계 데이터를 Tableau, Power\r
    BI, Grafana 같은 BI 도구에 연결하거나, CSV로 저장하여 공유합니다. 데이터 분석의 최종 목표는 비즈니스 가치를 창출하는 것입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dashboardGenre = dfFull.group_by("genre").agg([\r
        pl.len().alias("영화수"),\r
        pl.col("boxOffice").sum().round(1).alias("총수익"),\r
        pl.col("boxOffice").mean().round(1).alias("평균수익"),\r
        pl.col("roi").mean().round(1).alias("평균ROI"),\r
        pl.col("rating").mean().round(2).alias("평균평점")\r
    ]).sort("총수익", descending=True)\r
    dashboardGenre\r
  exercise:\r
    prompt: 13단계. 종합 대시보드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dashboardGenre = dfFull.group_by("genre").agg([\r
          pl.len().alias("영화수"),\r
          pl.col("boxOffice").sum().round(1).alias("총수익"),\r
          pl.col("boxOffice").mean().round(1).alias("평균수익"),\r
          pl.col("roi").mean().round(1).alias("평균ROI"),\r
          pl.col("rating").mean().round(2).alias("평균평점")\r
      ]).sort("총수익", descending=True)\r
      dashboardGenre\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 13단계. 종합 대시보드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 종합 대시보드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 고급 확장 과제\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    10개 프로젝트에서 배운 모든 Polars 개념을 종합하여 실전 수준의 심화 분석을 수행합니다. 복잡한 필터 조건, 다중 조인, 윈도우 함수, 피벗, Lazy 최적화를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
\r
    movies = pl.DataFrame({\r
        "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
        "title": ["Avengers", "Titanic", "Avatar", "Joker", "Frozen", "Inception", "Interstellar", "Parasite", "The Batman", "Dune"],\r
        "genre": ["Action", "Romance", "Sci-Fi", "Drama", "Animation", "Sci-Fi", "Sci-Fi", "Drama", "Action", "Sci-Fi"],\r
        "year": [2012, 1997, 2009, 2019, 2013, 2010, 2014, 2019, 2022, 2021],\r
        "rating": [8.0, 7.9, 7.8, 8.4, 7.4, 8.8, 8.6, 8.5, 7.8, 8.0]\r
    })\r
    revenue = pl.DataFrame({"movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
        "budget": [220.0, 200.0, 237.0, 55.0, 150.0, 160.0, 165.0, 11.4, 185.0, 165.0],\r
        "boxOffice": [1518.8, 2187.5, 2847.2, 1074.3, 1280.8, 829.9, 701.7, 258.8, 770.8, 402.0]})\r
    movieRevenue = movies.join(revenue, on="movieId", how="left").with_columns(\r
        ((pl.col("boxOffice") - pl.col("budget")) / pl.col("budget") * 100).alias("roi"))\r
    movieRevenue.head()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
\r
      movies = pl.DataFrame({\r
          "movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
          "title": ["Avengers", "Titanic", "Avatar", "Joker", "Frozen", "Inception", "Interstellar", "Parasite", "The Batman", "Dune"],\r
          "genre": ["Action", "Romance", "Sci-Fi", "Drama", "Animation", "Sci-Fi", "Sci-Fi", "Drama", "Action", "Sci-Fi"],\r
          "year": [2012, 1997, 2009, 2019, 2013, 2010, 2014, 2019, 2022, 2021],\r
          "rating": [8.0, 7.9, 7.8, 8.4, 7.4, 8.8, 8.6, 8.5, 7.8, 8.0]\r
      })\r
      revenue = pl.DataFrame({"movieId": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\r
          "budget": [220.0, 200.0, 237.0, 55.0, 150.0, 160.0, 165.0, 11.4, 185.0, 165.0],\r
          "boxOffice": [1518.8, 2187.5, 2847.2, 1074.3, 1280.8, 829.9, 701.7, 258.8, 770.8, 402.0]})\r
      movieRevenue = movies.join(revenue, on="movieId", how="left").with_columns(\r
          ((pl.col("boxOffice") - pl.col("budget")) / pl.col("budget") * 100).alias("roi"))\r
      movieRevenue.head()\r
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
    content: 10개 프로젝트를 완주하며 Polars의 모든 핵심 개념을 마스터했습니다! 다중 데이터 소스를 통합하고, 전처리하고, 변환하고, 집계하고, 시각화 준비까지 완료하는\r
      완전한 데이터 파이프라인을 구축할 수 있는 능력을 갖추었습니다. 이제 실무 환경에서 어떤 데이터 분석 과제가 주어져도 Polars로 효율적으로 처리할 수 있습니다. pandas보다\r
      수십 배 빠른 성능, Lazy Evaluation을 통한 자동 최적화, 풍부한 표현식 API는 Polars를 현대 데이터 분석의 필수 도구로 만들어줍니다. 계속해서 실전 프로젝트를\r
      경험하며 역량을 키워나가시기 바랍니다!\r
  - type: list\r
    items:\r
    - 'A. 데이터 로드: read_csv, schema 확인'\r
    - 'B. 선택: select, pl.col, 다중열, exclude'\r
    - 'C. 필터링: filter, 비교/논리연산, str.contains, null 처리'\r
    - 'D. 변환: with_columns, alias, cast, str, dt, when-then'\r
    - 'E. 집계: group_by, agg, 기본/고급집계, 다중그룹'\r
    - 'F. 결합: join, concat'\r
    - 'G. 정렬: sort, head/tail'\r
    - 'H. Lazy: lazy, collect, explain'\r
    - 'I. 윈도우: over, rank, rolling, cum_sum, shift'\r
    - 'J. 피벗: pivot, unpivot, 체이닝'\r
  - type: text\r
    content: 10개 프로젝트를 완료하며 Polars의 모든 핵심 개념을 마스터했습니다! 영화 평점 분석부터 시작하여 날씨 데이터, 게임 판매, 주식 시계열, 음악 스트리밍,\r
      부동산 가격, 스포츠 통계, 소셜 미디어, 대용량 로그, 그리고 이 종합 프로젝트까지 다양한 도메인의 데이터를 다루며 실전 감각을 익혔습니다. 이제 pandas를 대체하여\r
      월등히 빠른 성능으로 대용량 데이터를 처리할 수 있고, Lazy Evaluation으로 쿼리를 자동 최적화하며, 윈도우 함수와 표현식 API로 복잡한 분석도 간결하게 수행할\r
      수 있습니다. 실전 데이터 파이프라인을 자유롭게 구축할 수 있는 역량을 갖추셨습니다. 다음 단계로 DuckDB, Altair 등 다른 도구와 함께 사용하며 데이터 분석 능력을\r
      더욱 확장해나가세요!\r
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