var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_05\r
  title: 음악스트리밍분석\r
  order: 5\r
  category: polars\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:spotify_songs\r
  tags:\r
  - spotify\r
  - str.contains\r
  - over\r
  - rank\r
  - window\r
  seo:\r
    title: Polars 문자열 처리와 윈도우 함수 - 아티스트별 인기 순위 분석\r
    description: Spotify 차트 데이터로 문자열 포함(str.contains), 소문자 변환(str.to_lowercase), 윈도우 함수(over, rank)를 배웁니다.\r
    keywords:\r
    - polars str.contains\r
    - polars over\r
    - polars rank\r
    - 윈도우 함수\r
    - spotify 분석\r
intro:\r
  emoji: 🎵\r
  goal: Spotify 차트 데이터에서 "아티스트별 인기도 순위"를 분석합니다.\r
  description: 문자열 처리와 윈도우 함수를 배웁니다. str.contains로 특정 키워드를 찾고, over + rank로 그룹 내 순위를 계산합니다.\r
  direction: 음악스트리밍분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 음악스트리밍분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 미리보기 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 인기도 필터링 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 음악스트리밍분석 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 음악스트리밍분석 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 음악스트리밍분석 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: Spotify 차트 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    Spotify 음악 스트리밍 데이터를 분석합니다. 수천 개의 트랙에 대한 정보가 담겨 있으며, 곡명, 아티스트, 장르, 인기도(popularity) 등의 정보를 포함합니다. 이번 프로젝트에서는 문자열 처리(str.contains, str.to_lowercase)와 윈도우 함수(over, rank)를 배웁니다. over()는 그룹별 계산을 하되 원본 행을 유지하는 강력한 기능이고, rank()는 순위를 매기는 함수입니다. 이 두 개를 조합하면 "아티스트별로 가장 인기 있는 곡"처럼 그룹 내 순위를 구할 수 있습니다.\r
\r
    이 데이터셋은 수만 개의 곡 정보를 포함하고 있어 대용량 데이터 처리 연습에 적합합니다. Polars는 이런 규모의 데이터도 빠르게 필터링하고 그룹화할 수 있습니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    spotifyCsv = loadLocalDataset("spotify_songs").to_csv(index=False)\r
    spotify = pl.read_csv(StringIO(spotifyCsv))\r
    spotify.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      spotifyCsv = loadLocalDataset("spotify_songs").to_csv(index=False)\r
      spotify = pl.read_csv(StringIO(spotifyCsv))\r
      spotify.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 파악\r
  goal: 2단계. 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: track_name(곡명), track_artist(아티스트), track_popularity(인기도), playlist_genre(장르) 등이 있습니다.\r
    track_popularity는 0~100 사이의 값으로, 높을수록 최근에 많이 재생된 인기곡입니다. 이 데이터는 실제 Spotify 차트 데이터를 기반으로 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: spotify.select("track_name", "track_artist", "track_popularity", "playlist_genre").head()\r
  exercise:\r
    prompt: 2단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: spotify.select("track_name", "track_artist", "track_popularity", "playlist_genre").head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_filter\r
  title: 3단계. 인기도 필터링\r
  structuredPrimary: true\r
  subtitle: 복습 - filter\r
  goal: 3단계. 인기도 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 인기도 80 이상인 곡만 필터링합니다. 이전에 배운 filter를 복습하며, 비교 연산자(>=)를 사용해 조건을 만듭니다. 80점 이상이면 상위 약 20%에\r
    해당하는 인기곡입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: spotify.filter(pl.col("track_popularity") >= 80).select("track_name", "track_artist", "track_popularity")\r
  exercise:\r
    prompt: 3단계. 인기도 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: spotify.filter(pl.col("track_popularity") >= 80).select("track_name", "track_artist",\r
      "track_popularity")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 인기도 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 인기도 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_groupby\r
  title: 4단계. 아티스트별 평균 인기도\r
  structuredPrimary: true\r
  subtitle: 복습 - group_by + mean\r
  goal: 4단계. 아티스트별 평균 인기도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 아티스트별 평균 인기도를 계산합니다. 이전에 배운 group_by와 mean을 복습하며, sort로 내림차순 정렬하면 가장 인기 있는 아티스트 순으로 볼 수\r
    있습니다. 꾸준히 높은 인기도를 유지하는 아티스트가 상위에 위치합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    spotify.group_by("track_artist").agg(\r
        pl.col("track_popularity").mean().alias("avgPopularity")\r
    ).sort("avgPopularity", descending=True).head(10)\r
  exercise:\r
    prompt: 4단계. 아티스트별 평균 인기도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.group_by("track_artist").agg(\r
          pl.col("track_popularity").mean().alias("avgPopularity")\r
      ).sort("avgPopularity", descending=True).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 아티스트별 평균 인기도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 아티스트별 평균 인기도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_str_contains\r
  title: 5단계. 문자열 포함 검색\r
  structuredPrimary: true\r
  subtitle: str.contains\r
  goal: 5단계. 문자열 포함 검색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    데이터 분석에서 문자열 검색은 매우 자주 사용됩니다. "Love"라는 단어가 들어간 곡만 찾고 싶을 때 str.contains()를 사용합니다. str은 문자열(string) 관련 메서드에 접근하는 accessor이고, contains()는 "포함하다"의 의미입니다. pl.col("track_name").str.contains("Love")는 track_name 컬럼에서 "Love"가 포함된 행은 True, 아니면 False를 반환합니다. filter()와 함께 사용하면 True인 행만 선택됩니다.\r
\r
    str.contains("키워드")는 해당 키워드가 포함된 행을 찾습니다. "Love Story"처럼 단어 전체가 아니라 일부만 일치해도 찾습니다. 정규표현식(regex)도 지원하여 복잡한 패턴 검색이 가능합니다. 대소문자를 구분하므로 주의하세요.\r
  tips:\r
  - str.contains("키워드")는 해당 키워드가 포함된 행을 찾습니다. "Love Story"처럼 단어 전체가 아니라 일부만 일치해도 찾습니다. 정규표현식(regex)도 지원하여\r
    복잡한 패턴 검색이 가능합니다. 대소문자를 구분하므로 주의하세요.\r
  snippet: |-\r
    spotify.filter(\r
        pl.col("track_name").str.contains("Love")\r
    ).select("track_name", "track_artist", "track_popularity").head(10)\r
  exercise:\r
    prompt: 5단계. 문자열 포함 검색 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.filter(\r
          pl.col("track_name").str.contains("Love")\r
      ).select("track_name", "track_artist", "track_popularity").head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 문자열 포함 검색의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 문자열 포함 검색의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_str_lowercase\r
  title: 6단계. 소문자 변환\r
  structuredPrimary: true\r
  subtitle: str.to_lowercase\r
  goal: 6단계. 소문자 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    대소문자 구분 없이 검색하려면 소문자로 변환 후 비교합니다. "Love", "LOVE", "love"를 모두 찾으려면 먼저 str.to_lowercase()로 소문자로 통일한 뒤 str.contains("love")를 적용합니다.\r
\r
    문자열 처리 팁\r
    str.to_lowercase()는 모든 문자를 소문자로 변환합니다. 대소문자 구분 없는 검색에 유용합니다.\r
  tips:\r
  - 문자열 처리 팁 str.to_lowercase()는 모든 문자를 소문자로 변환합니다. 대소문자 구분 없는 검색에 유용합니다.\r
  snippet: |-\r
    spotify.filter(\r
        pl.col("track_name").str.to_lowercase().str.contains("love")\r
    ).select("track_name", "track_artist", "track_popularity").head(10)\r
  exercise:\r
    prompt: 6단계. 소문자 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.filter(\r
          pl.col("track_name").str.to_lowercase().str.contains("love")\r
      ).select("track_name", "track_artist", "track_popularity").head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 소문자 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 소문자 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_genre_filter\r
  title: 7단계. 장르별 필터링\r
  structuredPrimary: true\r
  subtitle: 문자열 조건 조합\r
  goal: 7단계. 장르별 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: pop 장르에서 dance가 포함된 곡을 찾습니다. 장르 조건과 문자열 조건을 &(AND)로 연결하여 복합 필터를 만듭니다. 이렇게 여러 조건을 조합하면 원하는\r
    데이터를 정확하게 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    spotify.filter(\r
        (pl.col("playlist_genre") == "pop") &\r
        (pl.col("track_name").str.to_lowercase().str.contains("dance"))\r
    ).select("track_name", "track_artist", "track_popularity")\r
  exercise:\r
    prompt: 7단계. 장르별 필터링 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.filter(\r
          (pl.col("playlist_genre") == "pop") &\r
          (pl.col("track_name").str.to_lowercase().str.contains("dance"))\r
      ).select("track_name", "track_artist", "track_popularity")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 장르별 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 장르별 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_over\r
  title: 8단계. 윈도우 함수 소개\r
  structuredPrimary: true\r
  subtitle: over()\r
  goal: 8단계. 윈도우 함수 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    over()는 이번 프로젝트의 핵심 개념입니다. group_by()는 그룹별 통계를 계산하지만 행 수가 줄어듭니다(그룹 개수만큼만 남음). 하지만 때로는 "그룹별 평균을 계산하되, 원본 데이터는 그대로 유지"하고 싶을 때가 있습니다. over()는 이 문제를 해결합니다. pl.col("값").mean().over("그룹")은 그룹별 평균을 계산한 후 그 값을 해당 그룹의 모든 행에 붙여줍니다. SQL의 윈도우 함수(Window Function)와 동일한 개념으로, 매우 강력한 기능입니다.\r
\r
    over("그룹")은 그룹별 계산을 하되 행 수를 유지합니다. group_by()는 그룹 개수만큼 행이 줄지만, over()는 원본 행 수 그대로 유지하면서 각 행에 그룹 통계를 추가합니다. "개별 값과 그룹 평균을 동시에 보고 싶을 때" 필수적인 기능입니다.\r
  tips:\r
  - over("그룹")은 그룹별 계산을 하되 행 수를 유지합니다. group_by()는 그룹 개수만큼 행이 줄지만, over()는 원본 행 수 그대로 유지하면서 각 행에 그룹 통계를\r
    추가합니다. "개별 값과 그룹 평균을 동시에 보고 싶을 때" 필수적인 기능입니다.\r
  snippet: |-\r
    spotify.select(\r
        "track_name",\r
        "playlist_genre",\r
        "track_popularity",\r
        pl.col("track_popularity").mean().over("playlist_genre").alias("genreAvg")\r
    ).head(10)\r
  exercise:\r
    prompt: 8단계. 윈도우 함수 소개 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.select(\r
          "track_name",\r
          "playlist_genre",\r
          "track_popularity",\r
          pl.col("track_popularity").mean().over("playlist_genre").alias("genreAvg")\r
      ).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 윈도우 함수 소개의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 윈도우 함수 소개의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_over_vs_groupby\r
  title: 9단계. over vs group_by 비교\r
  structuredPrimary: true\r
  subtitle: 차이점 이해\r
  goal: 9단계. over vs groupby 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: group_by는 그룹 수만큼 행이 줄어들고, over는 원본 행 수를 유지합니다. 아래 코드에서 group_by 결과는 장르 수(6개 정도)만큼의 행이 되지만,\r
    over를 사용한 이전 예제에서는 수만 개의 원본 행이 그대로 유지됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    spotify.group_by("playlist_genre").agg(\r
        pl.col("track_popularity").mean().alias("genreAvg")\r
    )\r
  exercise:\r
    prompt: 9단계. over vs groupby 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.group_by("playlist_genre").agg(\r
          pl.col("track_popularity").mean().alias("genreAvg")\r
      )\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. over vs groupby 비교의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. over vs groupby 비교의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_rank\r
  title: 10단계. 순위 계산\r
  structuredPrimary: true\r
  subtitle: rank()\r
  goal: 10단계. 순위 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    rank()는 값에 순위를 매기는 함수입니다. 인기도가 높은 곡부터 1위, 2위, 3위... 순으로 번호를 매기는 것입니다. method="ordinal"은 같은 값이어도 다른 순위를 부여하는 방식입니다(동점 처리 안 함). descending=True는 내림차순 정렬로, 큰 값이 1위가 됩니다. 인기도가 100인 곡이 1위, 99인 곡이 2위가 되는 식입니다. 이 함수는 다음 단계에서 over()와 조합하여 더욱 강력해집니다.\r
\r
    rank()는 순위를 매깁니다. method="ordinal"은 동점도 다른 순위, "dense"는 동점은 같은 순위지만 다음 순위가 연속, "min"은 동점은 같은 순위이고 다음 순위는 건너뛰기입니다. descending=True는 큰 값이 상위 순위(1위)가 됩니다.\r
  tips:\r
  - rank()는 순위를 매깁니다. method="ordinal"은 동점도 다른 순위, "dense"는 동점은 같은 순위지만 다음 순위가 연속, "min"은 동점은 같은 순위이고\r
    다음 순위는 건너뛰기입니다. descending=True는 큰 값이 상위 순위(1위)가 됩니다.\r
  snippet: |-\r
    spotify.select(\r
        "track_name",\r
        "track_artist",\r
        "track_popularity",\r
        pl.col("track_popularity").rank(method="ordinal", descending=True).alias("overallRank")\r
    ).sort("overallRank").head(10)\r
  exercise:\r
    prompt: 10단계. 순위 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.select(\r
          "track_name",\r
          "track_artist",\r
          "track_popularity",\r
          pl.col("track_popularity").rank(method="ordinal", descending=True).alias("overallRank")\r
      ).sort("overallRank").head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 순위 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 순위 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_rank_over\r
  title: 11단계. 그룹 내 순위\r
  structuredPrimary: true\r
  subtitle: rank + over 조합\r
  goal: 11단계. 그룹 내 순위에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    드디어 rank()와 over()를 조합합니다. pl.col("값").rank().over("그룹")은 "각 그룹 내에서의 순위"를 매깁니다. 예를 들어 아티스트별로 곡에 순위를 매기면, "아티스트 A의 1위 곡, 2위 곡", "아티스트 B의 1위 곡, 2위 곡"을 구할 수 있습니다. 이것은 "각 아티스트의 대표곡(1위 곡)만 추출"하는 등 실전에서 매우 유용한 기법입니다. Polars와 SQL의 가장 강력한 기능 중 하나입니다.\r
\r
    rank().over("그룹")은 그룹별로 독립적인 순위를 매깁니다. 아티스트별, 장르별, 연도별 TOP N을 구할 때 필수입니다. filter(artistRank == 1)로 각 그룹의 1위만 추출하는 패턴은 실전에서 매우 자주 사용됩니다.\r
  tips:\r
  - rank().over("그룹")은 그룹별로 독립적인 순위를 매깁니다. 아티스트별, 장르별, 연도별 TOP N을 구할 때 필수입니다. filter(artistRank == 1)로\r
    각 그룹의 1위만 추출하는 패턴은 실전에서 매우 자주 사용됩니다.\r
  snippet: |-\r
    spotify.select(\r
        "track_name",\r
        "track_artist",\r
        "track_popularity",\r
        pl.col("track_popularity").rank(method="ordinal", descending=True).over("track_artist").alias("artistRank")\r
    ).filter(pl.col("artistRank") == 1).sort("track_popularity", descending=True).head(10)\r
  exercise:\r
    prompt: 11단계. 그룹 내 순위 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.select(\r
          "track_name",\r
          "track_artist",\r
          "track_popularity",\r
          pl.col("track_popularity").rank(method="ordinal", descending=True).over("track_artist").alias("artistRank")\r
      ).filter(pl.col("artistRank") == 1).sort("track_popularity", descending=True).head(10)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 그룹 내 순위의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 그룹 내 순위의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_genre_rank\r
  title: 12단계. 장르별 TOP 3\r
  structuredPrimary: true\r
  subtitle: 실전 활용\r
  goal: 12단계. 장르별 TOP 3에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 각 장르에서 인기도 TOP 3 곡을 뽑습니다. rank().over("playlist_genre")로 장르별 순위를 계산한 뒤 filter로 3위 이하만 선택하면\r
    각 장르의 대표곡을 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    spotify.select(\r
        "track_name",\r
        "track_artist",\r
        "playlist_genre",\r
        "track_popularity",\r
        pl.col("track_popularity").rank(method="ordinal", descending=True).over("playlist_genre").alias("genreRank")\r
    ).filter(pl.col("genreRank") <= 3).sort("playlist_genre", "genreRank")\r
  exercise:\r
    prompt: 12단계. 장르별 TOP 3 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.select(\r
          "track_name",\r
          "track_artist",\r
          "playlist_genre",\r
          "track_popularity",\r
          pl.col("track_popularity").rank(method="ordinal", descending=True).over("playlist_genre").alias("genreRank")\r
      ).filter(pl.col("genreRank") <= 3).sort("playlist_genre", "genreRank")\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 장르별 TOP 3의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 장르별 TOP 3의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_complex\r
  title: 13단계. 종합 분석\r
  structuredPrimary: true\r
  subtitle: 모든 개념 조합\r
  goal: 13단계. 종합 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: love가 포함된 곡 중 장르별 인기도 1위를 찾습니다. 먼저 filter로 "love"가 포함된 곡을 추출하고, rank().over()로 그 중에서 장르별\r
    순위를 계산합니다. str.contains, over, rank를 모두 조합하는 고급 기법입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    spotify.filter(\r
        pl.col("track_name").str.to_lowercase().str.contains("love")\r
    ).select(\r
        "track_name",\r
        "track_artist",\r
        "playlist_genre",\r
        "track_popularity",\r
        pl.col("track_popularity").rank(method="ordinal", descending=True).over("playlist_genre").alias("genreRank")\r
    ).filter(pl.col("genreRank") == 1).sort("track_popularity", descending=True)\r
  exercise:\r
    prompt: 13단계. 종합 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      spotify.filter(\r
          pl.col("track_name").str.to_lowercase().str.contains("love")\r
      ).select(\r
          "track_name",\r
          "track_artist",\r
          "playlist_genre",\r
          "track_popularity",\r
          pl.col("track_popularity").rank(method="ordinal", descending=True).over("playlist_genre").alias("genreRank")\r
      ).filter(pl.col("genreRank") == 1).sort("track_popularity", descending=True)\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 종합 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 종합 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 음악 스트리밍 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    배운 모든 내용을 활용해서 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    tracks = pl.read_csv(StringIO(loadLocalDataset("spotify_songs").to_csv(index=False)))\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      tracks = pl.read_csv(StringIO(loadLocalDataset("spotify_songs").to_csv(index=False)))\r
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
    content: 문자열 처리와 윈도우 함수를 배웠습니다.\r
  - type: list\r
    items:\r
    - pl.col("컬럼").str.contains("키워드") - 문자열 포함 검색\r
    - pl.col("컬럼").str.to_lowercase() - 소문자 변환\r
    - pl.col("값").mean().over("그룹") - 그룹별 계산 (행 유지)\r
    - pl.col("값").rank().over("그룹") - 그룹 내 순위\r
  - type: text\r
    content: 다음 시간에는 부동산 데이터로 조건부 변환(when-then)과 조인을 배웁니다.\r
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