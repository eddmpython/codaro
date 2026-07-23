var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_08\r
  title: 소셜미디어분석\r
  order: 8\r
  category: polars\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 소셜미디어\r
  - unpivot\r
  - 체이닝\r
  - over\r
  - rolling\r
  - 시간대분석\r
  seo:\r
    title: Polars 소셜미디어 분석 - unpivot과 복합 체이닝\r
    description: 소셜미디어 데이터로 시간대별 게시물 패턴을 분석합니다. unpivot, over 윈도우, rolling, 복합 표현식 체이닝을 배웁니다.\r
    keywords:\r
    - Polars unpivot\r
    - 표현식 체이닝\r
    - 윈도우 함수\r
    - 소셜미디어 분석\r
intro:\r
  emoji: 📱\r
  goal: 소셜미디어 데이터에서 "시간대별 게시물 패턴"을 분석하는 대시보드를 만듭니다.\r
  description: 게시물 데이터를 탐색하고 시간대별 패턴을 찾습니다. unpivot으로 데이터를 변환하고, over 윈도우 함수로 그룹별 계산을 수행하며, rolling으로\r
    이동평균을 구하고, 복합 표현식 체이닝으로 효율적인 분석을 수행합니다. Polars의 강력한 표현식 시스템을 활용하여 pandas보다 간결하고 빠른 코드를 작성합니다.\r
  direction: 소셜미디어분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 소셜미디어분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 생성 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 탐색 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 날짜/시간 처리 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 소셜미디어분석 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 소셜미디어분석 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 소셜미디어분석 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_data\r
  title: 1단계. 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 소셜미디어 게시물 데이터\r
  goal: 1단계. 데이터 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    소셜미디어 게시물 데이터를 생성합니다. 실무에서는 Twitter API, Instagram API 등에서 수집한 데이터를 사용하지만, 여기서는 실습용으로 1000개의 샘플 게시물을 생성합니다. 게시 시간(postTime), 플랫폼(platform), 좋아요(likes), 댓글(comments), 공유(shares), 해시태그(hashtag) 등 실제 소셜미디어 분석에 필요한 정보를 포함합니다. 시간대별, 플랫폼별 패턴을 분석하여 최적의 게시 전략을 수립할 수 있습니다.\r
\r
    random.seed(42)를 사용하면 매번 동일한 랜덤 데이터가 생성되어 재현 가능한 분석이 됩니다. 실무에서는 재현성이 중요하므로 시드를 고정하는 습관을 들이는 것이 좋습니다.\r
  snippet: |-\r
    import polars as pl\r
    from datetime import datetime, timedelta\r
    import random\r
\r
    random.seed(42)\r
    baseDate = datetime(2024, 1, 1)\r
    hashtags = ["#python", "#data", "#ai", "#ml", "#tech", "#coding", "#dev", "#learn"]\r
    platforms = ["twitter", "instagram", "facebook"]\r
\r
    posts = []\r
    for i in range(1000):\r
        posts.append({\r
            "postId": i + 1,\r
            "postTime": baseDate + timedelta(hours=random.randint(0, 24 * 180)),\r
            "platform": random.choice(platforms),\r
            "likes": random.randint(0, 1000),\r
            "comments": random.randint(0, 200),\r
            "shares": random.randint(0, 100),\r
            "hashtag": random.choice(hashtags),\r
        })\r
\r
    df = pl.DataFrame(posts)\r
    df.head(5)\r
  exercise:\r
    prompt: 1단계. 데이터 생성 예제에서 platforms나 hashtags 리스트 항목을 바꾸고 생성된 df의 분포가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from datetime import datetime, timedelta\r
      import random\r
\r
      random.seed(42)\r
      baseDate = datetime(2024, 1, 1)\r
      hashtags = ["#python", "#data", "#ai", "#ml", "#tech", "#coding", "#dev", "#learn"]\r
      platforms = ["twitter", "instagram", "facebook"]\r
\r
      posts = []\r
      for i in range(1000):\r
          posts.append({\r
              "postId": i + 1,\r
              "postTime": baseDate + timedelta(hours=random.randint(0, 24 * 180)),\r
              "platform": random.choice(platforms),\r
              "likes": random.randint(0, 1000),\r
              "comments": random.randint(0, 200),\r
              "shares": random.randint(0, 100),\r
              "hashtag": random.choice(hashtags),\r
          })\r
\r
      df = pl.DataFrame(posts)\r
      df.head(5)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_explore\r
  title: 2단계. 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 기본 정보 확인\r
  goal: 2단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    생성된 데이터의 구조와 기본 통계를 확인합니다. describe() 메서드는 수치형 컬럼의 count, null_count, mean, std, min, 25%, 50%, 75%, max를 한 번에 보여줍니다. 이를 통해 데이터 분포, 이상치, null 여부를 빠르게 파악할 수 있습니다. 좋아요 수의 평균과 표준편차, 최솟값과 최댓값을 확인하면 데이터 품질을 검증할 수 있습니다.\r
\r
    describe()는 pandas의 describe()와 동일하지만, Polars는 더 빠르고 메모리 효율적입니다. select(pl.all().describe())로 모든 통계를 한눈에 볼 수도 있습니다.\r
  tips:\r
  - describe()는 pandas의 describe()와 동일하지만, Polars는 더 빠르고 메모리 효율적입니다. select(pl.all().describe())로 모든 통계를\r
    한눈에 볼 수도 있습니다.\r
  snippet: df.describe()\r
  exercise:\r
    prompt: 2단계. 데이터 탐색 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: df.describe()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 데이터 탐색의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 탐색의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_datetime\r
  title: 3단계. 날짜/시간 처리\r
  structuredPrimary: true\r
  subtitle: dt 네임스페이스 활용\r
  goal: 3단계. 날짜/시간 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    postTime 컬럼에서 연(year), 월(month), 일(day), 시간(hour), 요일(weekday)을 추출합니다. Polars의 dt 네임스페이스는 날짜/시간 데이터를 처리하는 전용 메서드를 제공합니다. dt.year(), dt.month(), dt.hour(), dt.weekday()로 각 구성 요소를 쉽게 추출할 수 있으며, 시간대별, 요일별 패턴 분석에 필수적입니다. weekday는 0=월요일, 6=일요일을 의미합니다.\r
\r
    dt 네임스페이스에는 dt.date(), dt.time(), dt.timestamp(), dt.strftime() 등 다양한 메서드가 있습니다. pandas의 dt와 유사하지만, Polars는 타입 안정성이 더 높고 성능도 우수합니다.\r
  tips:\r
  - dt 네임스페이스에는 dt.date(), dt.time(), dt.timestamp(), dt.strftime() 등 다양한 메서드가 있습니다. pandas의 dt와 유사하지만,\r
    Polars는 타입 안정성이 더 높고 성능도 우수합니다.\r
  snippet: |-\r
    df = df.with_columns([\r
        pl.col("postTime").dt.year().alias("year"),\r
        pl.col("postTime").dt.month().alias("month"),\r
        pl.col("postTime").dt.day().alias("day"),\r
        pl.col("postTime").dt.hour().alias("hour"),\r
        pl.col("postTime").dt.weekday().alias("weekday")\r
    ])\r
    df.head(5)\r
  exercise:\r
    prompt: 3단계. 날짜/시간 처리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df = df.with_columns([\r
          pl.col("postTime").dt.year().alias("year"),\r
          pl.col("postTime").dt.month().alias("month"),\r
          pl.col("postTime").dt.day().alias("day"),\r
          pl.col("postTime").dt.hour().alias("hour"),\r
          pl.col("postTime").dt.weekday().alias("weekday")\r
      ])\r
      df.head(5)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 날짜/시간 처리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 날짜/시간 처리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_string\r
  title: 4단계. 문자열 처리\r
  structuredPrimary: true\r
  subtitle: str 네임스페이스 활용\r
  goal: 4단계. 문자열 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    해시태그에서\r
\r
    str 네임스페이스에는 str.slice(), str.contains(), str.starts_with(), str.split() 등 다양한 메서드가 있습니다. 정규표현식도 지원하여 복잡한 텍스트 처리가 가능합니다.\r
  tips:\r
  - str 네임스페이스에는 str.slice(), str.contains(), str.starts_with(), str.split() 등 다양한 메서드가 있습니다. 정규표현식도 지원하여\r
    복잡한 텍스트 처리가 가능합니다.\r
  snippet: |-\r
    df = df.with_columns(\r
        pl.col("hashtag").str.replace("#", "").str.to_uppercase().alias("tag")\r
    )\r
    df.select(["hashtag", "tag"]).head(5)\r
  exercise:\r
    prompt: 4단계. 문자열 처리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df = df.with_columns(\r
          pl.col("hashtag").str.replace("#", "").str.to_uppercase().alias("tag")\r
      )\r
      df.select(["hashtag", "tag"]).head(5)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 문자열 처리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 문자열 처리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_groupby\r
  title: 5단계. 그룹별 집계\r
  structuredPrimary: true\r
  subtitle: 플랫폼별 통계\r
  goal: 5단계. 그룹별 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    플랫폼별로 게시물 수, 평균 좋아요, 평균 댓글, 평균 공유를 계산합니다. 이를 통해 어떤 플랫폼이 인게이지먼트가 높은지 비교할 수 있습니다. 일반적으로 Instagram은 좋아요 수가 높고, Twitter는 공유(리트윗)가 활발하며, Facebook은 댓글이 많은 경향이 있습니다. round(1)로 소수점 첫째 자리까지만 표시하여 가독성을 높입니다.\r
\r
    pl.len()은 그룹 내 행 개수를 세는 집계 함수입니다. 최신 Polars에서는 그룹 행 수 집계에 pl.len()을 사용합니다.\r
  snippet: |-\r
    df.group_by("platform").agg([\r
        pl.len().alias("postCount"),\r
        pl.col("likes").mean().round(1).alias("avgLikes"),\r
        pl.col("comments").mean().round(1).alias("avgComments"),\r
        pl.col("shares").mean().round(1).alias("avgShares")\r
    ])\r
  exercise:\r
    prompt: 5단계. 그룹별 집계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df.group_by("platform").agg([\r
          pl.len().alias("postCount"),\r
          pl.col("likes").mean().round(1).alias("avgLikes"),\r
          pl.col("comments").mean().round(1).alias("avgComments"),\r
          pl.col("shares").mean().round(1).alias("avgShares")\r
      ])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 그룹별 집계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 그룹별 집계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_multi_group\r
  title: 6단계. 다중 그룹 집계\r
  structuredPrimary: true\r
  subtitle: 플랫폼 + 시간대별\r
  goal: 6단계. 다중 그룹 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    플랫폼과 시간대(오전/오후)별로 집계합니다. when-then-otherwise로 hour를 오전(0-11)과 오후(12-23)로 분류한 후, 플랫폼과 시간대 두 개의 컬럼으로 그룹화합니다. 이렇게 다중 그룹 집계를 하면 "Instagram은 오후에 좋아요가 많다" 같은 세밀한 인사이트를 발견할 수 있습니다. sort()로 플랫폼과 시간대 순으로 정렬하여 비교하기 쉽게 만듭니다.\r
\r
    group_by([컬럼1, 컬럼2])로 여러 컬럼을 동시에 그룹화할 수 있습니다. 결과는 모든 조합에 대한 집계가 생성됩니다. SQL의 GROUP BY col1, col2와 동일합니다.\r
  snippet: |-\r
    df = df.with_columns(\r
        pl.when(pl.col("hour") < 12)\r
        .then(pl.lit("morning"))\r
        .otherwise(pl.lit("afternoon"))\r
        .alias("timeSlot")\r
    )\r
\r
    df.group_by(["platform", "timeSlot"]).agg([\r
        pl.len().alias("postCount"),\r
        pl.col("likes").mean().round(1).alias("avgLikes")\r
    ]).sort(["platform", "timeSlot"])\r
  exercise:\r
    prompt: 6단계. 다중 그룹 집계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df = df.with_columns(\r
          pl.when(pl.col("hour") < 12)\r
          .then(pl.lit("morning"))\r
          .otherwise(pl.lit("afternoon"))\r
          .alias("timeSlot")\r
      )\r
\r
      df.group_by(["platform", "timeSlot"]).agg([\r
          pl.len().alias("postCount"),\r
          pl.col("likes").mean().round(1).alias("avgLikes")\r
      ]).sort(["platform", "timeSlot"])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 다중 그룹 집계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 다중 그룹 집계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_over\r
  title: 7단계. over 윈도우 함수\r
  structuredPrimary: true\r
  subtitle: 그룹별 계산 유지\r
  goal: 7단계. over 윈도우 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    over()를 사용하면 그룹별 계산 결과를 원본 행에 붙일 수 있습니다. group_by()와의 차이점은 행 개수가 유지된다는 것입니다. group_by()는 그룹당 하나의 행으로 축소되지만, over()는 각 행에 그룹 통계를 추가합니다. 예를 들어 각 게시물이 해당 플랫폼 평균 대비 얼마나 좋아요를 받았는지 비교할 수 있습니다. 이는 SQL의 윈도우 함수(OVER PARTITION BY)와 동일한 개념입니다.\r
\r
    over('platform')은 각 행이 속한 플랫폼의 집계 결과를 반환합니다. GROUP BY와 달리 행 수가 유지되므로, 원본 데이터와 그룹 통계를 함께 볼 수 있습니다. over([컬럼1, 컬럼2])로 여러 컬럼으로 그룹화도 가능합니다.\r
  tips:\r
  - over('platform')은 각 행이 속한 플랫폼의 집계 결과를 반환합니다. GROUP BY와 달리 행 수가 유지되므로, 원본 데이터와 그룹 통계를 함께 볼 수 있습니다.\r
    over([컬럼1, 컬럼2])로 여러 컬럼으로 그룹화도 가능합니다.\r
  snippet: |-\r
    df = df.with_columns([\r
        pl.col("likes").mean().over("platform").round(1).alias("platformAvgLikes"),\r
        (pl.col("likes") - pl.col("likes").mean().over("platform")).round(1).alias("diffFromAvg")\r
    ])\r
    df.select(["platform", "likes", "platformAvgLikes", "diffFromAvg"]).head(10)\r
  exercise:\r
    prompt: 7단계. over 윈도우 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df = df.with_columns([\r
          pl.col("likes").mean().over("platform").round(1).alias("platformAvgLikes"),\r
          (pl.col("likes") - pl.col("likes").mean().over("platform")).round(1).alias("diffFromAvg")\r
      ])\r
      df.select(["platform", "likes", "platformAvgLikes", "diffFromAvg"]).head(10)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. over 윈도우 함수의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. over 윈도우 함수의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_rolling\r
  title: 8단계. rolling 이동평균\r
  structuredPrimary: true\r
  subtitle: 시계열 분석\r
  goal: 8단계. rolling 이동평균에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    날짜별 좋아요 합계의 7일 이동평균을 계산합니다. 이동평균(moving average)은 시계열 데이터의 트렌드를 파악하는 핵심 기법으로, 단기 변동을 제거하고 장기 추세를 드러냅니다. rolling_mean(window_size=7)은 현재 행을 포함한 최근 7개 값의 평균을 계산합니다. 일별 집계 후 날짜 순으로 정렬한 뒤 이동평균을 적용하면 소셜미디어 인기도의 추세를 시각화할 수 있습니다.\r
\r
    rolling_mean(window_size=7)은 현재 행 포함 최근 7개 값의 평균입니다. window_size를 조정하여 단기/장기 추세를 파악할 수 있습니다. rolling_sum(), rolling_max(), rolling_std() 등 다양한 rolling 함수를 지원합니다.\r
  tips:\r
  - rolling_mean(window_size=7)은 현재 행 포함 최근 7개 값의 평균입니다. window_size를 조정하여 단기/장기 추세를 파악할 수 있습니다. rolling_sum(),\r
    rolling_max(), rolling_std() 등 다양한 rolling 함수를 지원합니다.\r
  snippet: |-\r
    dailyStats = df.group_by(pl.col("postTime").dt.date().alias("date")).agg([\r
        pl.len().alias("postCount"),\r
        pl.col("likes").sum().alias("totalLikes")\r
    ]).sort("date")\r
\r
    dailyStats = dailyStats.with_columns(\r
        pl.col("totalLikes").rolling_mean(window_size=7).round(1).alias("ma7Likes")\r
    )\r
    dailyStats.head(15)\r
  exercise:\r
    prompt: 8단계. rolling 이동평균 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dailyStats = df.group_by(pl.col("postTime").dt.date().alias("date")).agg([\r
          pl.len().alias("postCount"),\r
          pl.col("likes").sum().alias("totalLikes")\r
      ]).sort("date")\r
\r
      dailyStats = dailyStats.with_columns(\r
          pl.col("totalLikes").rolling_mean(window_size=7).round(1).alias("ma7Likes")\r
      )\r
      dailyStats.head(15)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. rolling 이동평균의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. rolling 이동평균의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_unpivot\r
  title: 9단계. unpivot 변환\r
  structuredPrimary: true\r
  subtitle: 넓은 형태를 긴 형태로\r
  goal: 9단계. unpivot 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    likes, comments, shares 컬럼을 하나의 metric 컬럼으로 변환합니다. unpivot(언피벗)은 여러 컬럼에 분산된 값을 variable-value 형태로 모으는 작업으로, pandas의 melt()와 동일합니다. 넓은 형태(wide format)를 긴 형태(long format)로 변환하면 메트릭별 비교 분석이 쉬워집니다. 예를 들어 "어떤 메트릭이 플랫폼별로 차이가 큰가?"를 한 번에 분석할 수 있습니다.\r
\r
    unpivot(on=[열1, 열2], index=고정열)은 on에 지정한 열들을 variable/value 쌍으로 변환합니다. index는 고정되어 유지되는 컬럼입니다. pandas의 melt(id_vars, value_vars)와 같은 기능이지만 파라미터 이름이 다릅니다.\r
  tips:\r
  - unpivot(on=[열1, 열2], index=고정열)은 on에 지정한 열들을 variable/value 쌍으로 변환합니다. index는 고정되어 유지되는 컬럼입니다. pandas의\r
    melt(id_vars, value_vars)와 같은 기능이지만 파라미터 이름이 다릅니다.\r
  snippet: |-\r
    melted = df.select(["postId", "platform", "likes", "comments", "shares"]).unpivot(\r
        on=["likes", "comments", "shares"],\r
        index=["postId", "platform"],\r
        variable_name="metric",\r
        value_name="value"\r
    )\r
    melted.head(15)\r
  exercise:\r
    prompt: 9단계. unpivot 변환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      melted = df.select(["postId", "platform", "likes", "comments", "shares"]).unpivot(\r
          on=["likes", "comments", "shares"],\r
          index=["postId", "platform"],\r
          variable_name="metric",\r
          value_name="value"\r
      )\r
      melted.head(15)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. unpivot 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. unpivot 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_unpivot_agg\r
  title: 10단계. unpivot 후 집계\r
  structuredPrimary: true\r
  subtitle: 메트릭별 통계\r
  goal: 10단계. unpivot 후 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: unpivot된 데이터에서 플랫폼별, 메트릭별 평균을 계산합니다. 이렇게 하면 "Instagram은 likes가 높고, Twitter는 shares가 높다"처럼\r
    메트릭별로 플랫폼 특성을 비교할 수 있습니다. group_by([플랫폼, 메트릭])으로 두 축을 동시에 그룹화하고, sort()로 정렬하여 패턴을 명확히 드러냅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    melted.group_by(["platform", "metric"]).agg(\r
        pl.col("value").mean().round(1).alias("avgValue")\r
    ).sort(["metric", "platform"])\r
  exercise:\r
    prompt: 10단계. unpivot 후 집계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      melted.group_by(["platform", "metric"]).agg(\r
          pl.col("value").mean().round(1).alias("avgValue")\r
      ).sort(["metric", "platform"])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. unpivot 후 집계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 10단계. unpivot 후 집계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step11_chaining\r
  title: 11단계. 복합 체이닝\r
  structuredPrimary: true\r
  subtitle: 여러 변환을 한 번에\r
  goal: 11단계. 복합 체이닝에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    filter, with_columns, group_by, agg, sort를 체이닝하여 한 번에 복잡한 분석을 수행합니다. Polars의 강력한 표현식 체이닝을 활용하면 중간 변수 없이 읽기 쉬운 파이프라인을 만들 수 있습니다. 여기서는 "Instagram 오후 게시물의 해시태그별 인게이지먼트"를 분석합니다. filter로 조건 필터링, with_columns로 파생 변수 생성, group_by로 집계, sort로 정렬을 한 줄로 연결합니다. 이는 pandas보다 간결하고 빠른 Polars의 장점입니다.\r
\r
    복합 체이닝은 filter(...).with_columns(...).group_by(...).agg(...).sort(...) 형태로 여러 변환을 연결합니다. 각 단계는 새로운 DataFrame을 반환하므로 불변성(immutability)이 유지됩니다. 괄호로 감싸면 여러 줄로 나눠 쓸 수 있어 가독성이 좋습니다.\r
  tips:\r
  - 복합 체이닝은 filter(...).with_columns(...).group_by(...).agg(...).sort(...) 형태로 여러 변환을 연결합니다. 각 단계는 새로운\r
    DataFrame을 반환하므로 불변성(immutability)이 유지됩니다. 괄호로 감싸면 여러 줄로 나눠 쓸 수 있어 가독성이 좋습니다.\r
  snippet: |-\r
    filtered = df.filter((pl.col("platform") == "instagram") & (pl.col("hour") >= 12))\r
    withEngagement = filtered.with_columns(\r
        (pl.col("likes") + pl.col("comments") + pl.col("shares")).alias("engagement")\r
    )\r
    withEngagement.head()\r
  exercise:\r
    prompt: 11단계. 복합 체이닝 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      filtered = df.filter((pl.col("platform") == "instagram") & (pl.col("hour") >= 12))\r
      withEngagement = filtered.with_columns(\r
          (pl.col("likes") + pl.col("comments") + pl.col("shares")).alias("engagement")\r
      )\r
      withEngagement.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 복합 체이닝의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 복합 체이닝의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_dashboard\r
  title: 12단계. 대시보드 데이터\r
  structuredPrimary: true\r
  subtitle: 시간대별 분석 완성\r
  goal: 12단계. 대시보드 데이터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    최종 대시보드에 필요한 시간대별 통계를 생성합니다. 0-23시 각 시간대의 게시물 수, 평균 좋아요, 댓글, 공유, 총 인게이지먼트를 계산하고, 전체 게시물 대비 비율도 추가합니다. over(pl.lit(1))은 전체 데이터를 하나의 그룹으로 보고 총합을 계산하는 트릭입니다. 이렇게 만든 시간대별 통계로 "언제 게시하는 것이 가장 효과적인가?"를 답할 수 있습니다.\r
\r
    over(pl.lit(1))은 전체 데이터를 하나의 윈도우로 보는 트릭입니다. pl.lit(1)은 모든 행이 같은 값(1)을 가지므로, 전체가 하나의 그룹이 됩니다. 이를 이용해 전체 총합, 전체 평균 등을 계산할 수 있습니다.\r
  tips:\r
  - over(pl.lit(1))은 전체 데이터를 하나의 윈도우로 보는 트릭입니다. pl.lit(1)은 모든 행이 같은 값(1)을 가지므로, 전체가 하나의 그룹이 됩니다. 이를 이용해\r
    전체 총합, 전체 평균 등을 계산할 수 있습니다.\r
  snippet: |-\r
    hourlyDashboard = df.group_by("hour").agg([\r
        pl.len().alias("postCount"),\r
        pl.col("likes").mean().round(1).alias("avgLikes"),\r
        pl.col("comments").mean().round(1).alias("avgComments"),\r
        pl.col("shares").mean().round(1).alias("avgShares"),\r
        (pl.col("likes") + pl.col("comments") + pl.col("shares")).mean().round(1).alias("avgEngagement")\r
    ]).with_columns(\r
        (pl.col("postCount") / pl.col("postCount").sum().over(pl.lit(1)) * 100).round(1).alias("pctOfTotal")\r
    ).sort("hour")\r
    hourlyDashboard.head()\r
  exercise:\r
    prompt: 12단계. 대시보드 데이터 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      hourlyDashboard = df.group_by("hour").agg([\r
          pl.len().alias("postCount"),\r
          pl.col("likes").mean().round(1).alias("avgLikes"),\r
          pl.col("comments").mean().round(1).alias("avgComments"),\r
          pl.col("shares").mean().round(1).alias("avgShares"),\r
          (pl.col("likes") + pl.col("comments") + pl.col("shares")).mean().round(1).alias("avgEngagement")\r
      ]).with_columns(\r
          (pl.col("postCount") / pl.col("postCount").sum().over(pl.lit(1)) * 100).round(1).alias("pctOfTotal")\r
      ).sort("hour")\r
      hourlyDashboard.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 12단계. 대시보드 데이터의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 대시보드 데이터의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_peak\r
  title: 13단계. 피크 시간대 분석\r
  structuredPrimary: true\r
  subtitle: 최적 게시 시간\r
  goal: 13단계. 피크 시간대 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 평균 인게이지먼트가 전체 평균보다 높은 시간대를 필터링하여 최적의 게시 시간을 찾습니다. 이렇게 찾은 피크 시간대에 게시하면 더 많은 사용자 반응을 얻을 수\r
    있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    (\r
        hourlyDashboard\r
        .filter(pl.col("avgEngagement") > pl.col("avgEngagement").mean())\r
        .select(["hour", "postCount", "avgEngagement", "pctOfTotal"])\r
        .sort("avgEngagement", descending=True)\r
    )\r
  exercise:\r
    prompt: 13단계. 피크 시간대 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      (\r
          hourlyDashboard\r
          .filter(pl.col("avgEngagement") > pl.col("avgEngagement").mean())\r
          .select(["hour", "postCount", "avgEngagement", "pctOfTotal"])\r
          .sort("avgEngagement", descending=True)\r
      )\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 13단계. 피크 시간대 분석의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 13단계. 피크 시간대 분석 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step14_weekday\r
  title: 14단계. 요일별 분석\r
  structuredPrimary: true\r
  subtitle: 복합 체이닝으로 요일 패턴\r
  goal: 14단계. 요일별 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 요일별 게시물 수와 평균 인게이지먼트를 계산하고, 전체 평균과의 차이를 구합니다. 이를 통해 "주말에 인게이지먼트가 높다" 같은 요일별 패턴을 발견할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    weekdayStats = df.group_by("weekday").agg([\r
        pl.len().alias("postCount"),\r
        (pl.col("likes") + pl.col("comments") + pl.col("shares")).mean().round(1).alias("avgEngagement")\r
    ])\r
    weekdayStats\r
  exercise:\r
    prompt: 14단계. 요일별 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      weekdayStats = df.group_by("weekday").agg([\r
          pl.len().alias("postCount"),\r
          (pl.col("likes") + pl.col("comments") + pl.col("shares")).mean().round(1).alias("avgEngagement")\r
      ])\r
      weekdayStats\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 14단계. 요일별 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 요일별 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 소셜미디어 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    소셜미디어 분석가가 되어 배운 모든 개념을 심층적으로 활용해봅시다. unpivot으로 메트릭 변환, over로 그룹별 비교, rolling으로 트렌드 분석, 복합 체이닝으로 다단계 분석을 모두 사용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
    from datetime import datetime, timedelta\r
    import random\r
\r
    random.seed(42)\r
    baseDate = datetime(2024, 1, 1)\r
    hashtags = ["#python", "#data", "#ai", "#ml", "#tech"]\r
    platforms = ["twitter", "instagram", "facebook"]\r
    posts = []\r
    for i in range(500):\r
        postDate = baseDate + timedelta(days=random.randint(0, 89), hours=random.randint(0, 23))\r
        platform = random.choice(platforms)\r
        likes = random.randint(0, 500) if platform != "instagram" else random.randint(50, 1000)\r
        posts.append({"postId": i + 1, "platform": platform, "postTime": postDate,\r
            "likes": likes, "comments": random.randint(0, int(likes * 0.3)),\r
            "shares": random.randint(0, int(likes * 0.2))})\r
    socialRaw = pl.DataFrame(posts)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from datetime import datetime, timedelta\r
      import random\r
\r
      random.seed(42)\r
      baseDate = datetime(2024, 1, 1)\r
      hashtags = ["#python", "#data", "#ai", "#ml", "#tech"]\r
      platforms = ["twitter", "instagram", "facebook"]\r
      posts = []\r
      for i in range(500):\r
          postDate = baseDate + timedelta(days=random.randint(0, 89), hours=random.randint(0, 23))\r
          platform = random.choice(platforms)\r
          likes = random.randint(0, 500) if platform != "instagram" else random.randint(50, 1000)\r
          posts.append({"postId": i + 1, "platform": platform, "postTime": postDate,\r
              "likes": likes, "comments": random.randint(0, int(likes * 0.3)),\r
              "shares": random.randint(0, int(likes * 0.2))})\r
      socialRaw = pl.DataFrame(posts)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 소셜미디어 분석을 통해 Polars의 고급 기능을 마스터했습니다. over, rolling, unpivot, 복합 체이닝은 실무 데이터 분석의 핵심 기법입니다.\r
  - type: list\r
    items:\r
    - dt.hour(), dt.weekday() - 날짜/시간 구성 요소 추출, 시간대/요일별 분석\r
    - str.replace(), str.to_uppercase() - 문자열 정제 및 변환\r
    - over('col') - 그룹별 윈도우 계산, 행 수 유지하며 그룹 통계 추가\r
    - rolling_mean(window_size=N) - N개 값의 이동평균, 시계열 트렌드 분석\r
    - unpivot(on=[], index=[]) - 넓은 형태를 긴 형태로, 메트릭별 비교 분석\r
    - filter().with_columns().group_by().agg() - 복합 체이닝, 중간 변수 없이 파이프라인 구축\r
    - over(pl.lit(1)) - 전체 데이터를 하나의 윈도우로, 전체 통계 계산\r
  - type: text\r
    content: 다음 시간에는 대용량 로그 데이터로 Lazy Evaluation과 쿼리 최적화를 배웁니다. explain()으로 쿼리 실행 계획을 확인하고 Predicate Pushdown을\r
      경험합니다.\r
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