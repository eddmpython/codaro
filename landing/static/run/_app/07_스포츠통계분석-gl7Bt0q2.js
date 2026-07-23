var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_07\r
  title: 스포츠통계분석\r
  order: 7\r
  category: polars\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  dataSource: codaro-local:fifa_players\r
  tags:\r
  - FIFA\r
  - exclude\r
  - concat\r
  - pivot\r
  - 능력치분석\r
  seo:\r
    title: Polars 피벗과 결합 - FIFA 선수 능력치 분석\r
    description: FIFA 선수 데이터로 포지션별 능력치를 비교합니다. exclude로 열 제외, concat으로 결합, pivot으로 피벗 테이블을 만듭니다.\r
    keywords:\r
    - polars pivot\r
    - polars concat\r
    - polars exclude\r
    - FIFA 데이터\r
    - 선수 능력치\r
intro:\r
  emoji: ⚽\r
  goal: FIFA 선수 데이터에서 "포지션별 능력치"를 비교하는 피벗 테이블을 만듭니다.\r
  description: 스포츠 데이터 분석의 핵심! 특정 열을 제외하고, 데이터를 결합하고, 피벗 테이블로 요약합니다. exclude, concat, pivot을 익힙니다.\r
  direction: 스포츠통계분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - 스포츠통계분석 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 스키마 확인 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 미리보기 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 스포츠통계분석 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 스포츠통계분석 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: 스포츠통계분석 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: FIFA 선수 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    FIFA 게임의 선수 능력치 데이터를 불러옵니다. 이 데이터는 18,000명 이상의 실제 축구 선수들의 게임 내 능력치를 포함하고 있으며, 이름(Name), 포지션(Position), 종합능력치(Overall), 속도(Pace), 슈팅(Shooting), 패스(Passing), 드리블(Dribbling), 수비(Defending), 피지컬(Physical) 등 다양한 스탯이 포함됩니다. EA Sports의 FIFA 게임은 실제 선수 데이터를 기반으로 하므로 스포츠 데이터 분석의 훌륭한 연습 소재입니다. Polars의 빠른 CSV 읽기 성능으로 대용량 선수 데이터도 순식간에 로드할 수 있습니다.\r
\r
    FIFA 데이터는 실제 스포츠 분석에서 자주 사용되는 구조를 가지고 있습니다. 선수(Entity), 포지션(Category), 능력치(Metrics)의 조합으로 구성되어 있어, 실무 스포츠 데이터 분석과 동일한 패턴을 연습할 수 있습니다.\r
  tips:\r
  - FIFA 데이터는 실제 스포츠 분석에서 자주 사용되는 구조를 가지고 있습니다. 선수(Entity), 포지션(Category), 능력치(Metrics)의 조합으로 구성되어 있어,\r
    실무 스포츠 데이터 분석과 동일한 패턴을 연습할 수 있습니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    fifaCsv = loadLocalDataset("fifa_players").to_csv(index=False)\r
    df = pl.read_csv(StringIO(fifaCsv))\r
    df.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      fifaCsv = loadLocalDataset("fifa_players").to_csv(index=False)\r
      df = pl.read_csv(StringIO(fifaCsv))\r
      df.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_schema\r
  title: 2단계. 스키마 확인\r
  structuredPrimary: true\r
  subtitle: 컬럼과 타입 파악\r
  goal: 2단계. 스키마 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    DataFrame의 스키마를 확인하여 어떤 컬럼이 있고 각각의 데이터 타입이 무엇인지 파악합니다. FIFA 데이터는 선수 정보(Name, Nationality, Club), 포지션 정보(Position), 능력치(Overall, Pace, Shooting 등), 신체 정보(Height, Weight) 등 다양한 카테고리의 컬럼을 포함합니다. 스키마 확인은 데이터 분석의 첫 단계로, 어떤 분석이 가능한지 계획을 세우는 데 필수적입니다. Polars는 정수는 Int64, 실수는 Float64, 문자열은 Utf8로 명확하게 타입을 구분합니다.\r
\r
    .schema는 컬럼명과 타입의 딕셔너리를 반환합니다. .columns로 컬럼명 리스트만 확인하거나, .dtypes로 타입 리스트만 확인할 수도 있습니다. 대용량 데이터에서는 .head()보다 .schema를 먼저 확인하는 것이 효율적입니다.\r
  tips:\r
  - .schema는 컬럼명과 타입의 딕셔너리를 반환합니다. .columns로 컬럼명 리스트만 확인하거나, .dtypes로 타입 리스트만 확인할 수도 있습니다. 대용량 데이터에서는\r
    .head()보다 .schema를 먼저 확인하는 것이 효율적입니다.\r
  snippet: df.schema\r
  exercise:\r
    prompt: 2단계. 스키마 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: df.schema\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 스키마 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 스키마 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_head\r
  title: 3단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 상위 데이터 확인\r
  goal: 3단계. 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    실제 데이터가 어떻게 생겼는지 확인합니다. head() 메서드는 상위 5개 행을 반환하여 데이터의 구조와 값을 빠르게 파악할 수 있게 해줍니다. 스키마만으로는 알 수 없는 실제 값의 형태, 범위, 패턴을 확인할 수 있습니다.\r
\r
    head(n)으로 상위 n개 행을 볼 수 있습니다. tail(n)은 하위 n개 행을 반환합니다. 기본값은 5입니다. sample(n)으로 무작위 샘플링도 가능합니다.\r
  snippet: df.head()\r
  exercise:\r
    prompt: 3단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: df.head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_select_basic\r
  title: 4단계. 필요한 열 선택\r
  structuredPrimary: true\r
  subtitle: 분석에 필요한 열만\r
  goal: 4단계. 필요한 열 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    분석에 필요한 핵심 컬럼만 선택하여 작업 효율을 높입니다. FIFA 데이터는 100개 이상의 컬럼을 포함하지만, 포지션별 능력치 비교에는 Name, Position과 6개 핵심 능력치만 있으면 충분합니다. 불필요한 컬럼을 제거하면 메모리 사용량이 줄어들고 연산 속도가 빨라집니다. select()는 여러 컬럼을 리스트로 전달받아 새로운 DataFrame을 반환합니다.\r
\r
    select()는 원본 DataFrame을 변경하지 않고 새로운 DataFrame을 반환합니다. Codaro 환경에서는 새 변수명(stats)에 할당하여 사용합니다. pl.col("컬럼명")은 컬럼을 선택하는 표현식입니다.\r
  tips:\r
  - select()는 원본 DataFrame을 변경하지 않고 새로운 DataFrame을 반환합니다. Codaro 환경에서는 새 변수명(stats)에 할당하여 사용합니다. pl.col("컬럼명")은\r
    컬럼을 선택하는 표현식입니다.\r
  snippet: |-\r
    stats = df.select([\r
        pl.col("Name"),\r
        pl.col("Position"),\r
        pl.col("Overall"),\r
        pl.col("Pace"),\r
        pl.col("Shooting"),\r
        pl.col("Passing"),\r
        pl.col("Dribbling"),\r
        pl.col("Defending"),\r
        pl.col("Physical")\r
    ])\r
    stats.head()\r
  exercise:\r
    prompt: 4단계. 필요한 열 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      stats = df.select([\r
          pl.col("Name"),\r
          pl.col("Position"),\r
          pl.col("Overall"),\r
          pl.col("Pace"),\r
          pl.col("Shooting"),\r
          pl.col("Passing"),\r
          pl.col("Dribbling"),\r
          pl.col("Defending"),\r
          pl.col("Physical")\r
      ])\r
      stats.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 필요한 열 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 필요한 열 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_exclude\r
  title: 5단계. 특정 열 제외하기\r
  structuredPrimary: true\r
  subtitle: pl.all().exclude()\r
  goal: 5단계. 특정 열 제외하기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    선택할 컬럼이 많고 제외할 컬럼이 적을 때는 exclude()가 더 효율적입니다. pl.all()은 모든 컬럼을 선택하는 표현식이고, exclude()는 특정 컬럼을 제외합니다. FIFA 데이터의 경우 ID, Photo, Flag, Club Logo처럼 분석에 불필요한 메타데이터나 URL 컬럼을 제거할 때 유용합니다. 특히 컬럼이 100개 이상인 경우 필요한 컬럼을 일일이 나열하는 것보다 제외할 컬럼만 지정하는 것이 훨씬 간결합니다.\r
\r
    pl.all().exclude([열 목록])은 지정한 열만 제외하고 나머지 전부를 선택합니다. 열이 많을 때 유용하며, pandas의 df.drop(columns=[...])과 유사하지만 Polars는 select 내에서 표현식으로 처리합니다. 정규표현식으로 패턴 매칭도 가능합니다.\r
  tips:\r
  - pl.all().exclude([열 목록])은 지정한 열만 제외하고 나머지 전부를 선택합니다. 열이 많을 때 유용하며, pandas의 df.drop(columns=[...])과\r
    유사하지만 Polars는 select 내에서 표현식으로 처리합니다. 정규표현식으로 패턴 매칭도 가능합니다.\r
  snippet: |-\r
    df.select(\r
        pl.all().exclude(["ID", "Photo", "Flag", "Club Logo"])\r
    ).head()\r
  exercise:\r
    prompt: 5단계. 특정 열 제외하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      df.select(\r
          pl.all().exclude(["ID", "Photo", "Flag", "Club Logo"])\r
      ).head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 특정 열 제외하기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 특정 열 제외하기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_filter_position\r
  title: 6단계. 포지션 필터링\r
  structuredPrimary: true\r
  subtitle: 주요 포지션만\r
  goal: 6단계. 포지션 필터링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    FIFA에는 27개 이상의 포지션이 있지만, 핵심 분석을 위해 대표적인 4개 포지션만 선택합니다. ST(Striker, 공격수)는 득점, CM(Central Midfielder, 중앙 미드필더)은 패스와 조율, CB(Center Back, 중앙 수비수)는 수비, GK(Goalkeeper, 골키퍼)는 골문 방어를 담당합니다. is_in() 메서드는 SQL의 IN 연산자와 동일하며, 지정한 값 목록에 포함되는 행만 필터링합니다. 이렇게 포지션을 제한하면 각 포지션의 특성이 명확히 드러납니다.\r
\r
    is_in([값 목록])은 여러 값 중 하나와 일치하는 행을 선택합니다. pandas의 df[df['col'].isin([...])]과 동일합니다. 반대로 is_not_in()으로 제외할 수도 있습니다.\r
  tips:\r
  - is_in([값 목록])은 여러 값 중 하나와 일치하는 행을 선택합니다. pandas의 df[df['col'].isin([...])]과 동일합니다. 반대로 is_not_in()으로\r
    제외할 수도 있습니다.\r
  snippet: |-\r
    positions = ["ST", "CM", "CB", "GK"]\r
    filtered = stats.filter(pl.col("Position").is_in(positions))\r
    filtered.shape\r
  exercise:\r
    prompt: 6단계. 포지션 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      positions = ["ST", "CM", "CB", "GK"]\r
      filtered = stats.filter(pl.col("Position").is_in(positions))\r
      filtered.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 포지션 필터링의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 포지션 필터링의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_groupby\r
  title: 7단계. 포지션별 평균 능력치\r
  structuredPrimary: true\r
  subtitle: group_by + agg\r
  goal: 7단계. 포지션별 평균 능력치에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    각 포지션별로 능력치 평균을 계산하여 포지션 특성을 파악합니다. group_by("Position")은 Position 값이 같은 행들을 그룹으로 묶고, agg()는 각 그룹에 집계 함수를 적용합니다. 예를 들어 ST(공격수)는 Shooting과 Pace가 높고, CB(수비수)는 Defending과 Physical이 높으며, GK(골키퍼)는 다른 능력치보다 골키핑 능력치가 중요합니다. 이렇게 그룹별 평균을 비교하면 각 포지션이 요구하는 핵심 능력을 명확히 알 수 있습니다.\r
\r
    group_by().agg()는 Polars의 핵심 패턴입니다. agg() 안에 여러 집계 표현식을 리스트로 전달하면 한 번에 여러 통계를 계산할 수 있습니다. pandas의 groupby().agg()와 유사하지만 Polars가 훨씬 빠릅니다.\r
  tips:\r
  - group_by().agg()는 Polars의 핵심 패턴입니다. agg() 안에 여러 집계 표현식을 리스트로 전달하면 한 번에 여러 통계를 계산할 수 있습니다. pandas의\r
    groupby().agg()와 유사하지만 Polars가 훨씬 빠릅니다.\r
  snippet: |-\r
    positionStats = filtered.group_by("Position").agg([\r
        pl.col("Overall").mean().alias("avgOverall"),\r
        pl.col("Pace").mean().alias("avgPace"),\r
        pl.col("Shooting").mean().alias("avgShooting"),\r
        pl.col("Passing").mean().alias("avgPassing"),\r
        pl.col("Dribbling").mean().alias("avgDribbling"),\r
        pl.col("Defending").mean().alias("avgDefending"),\r
        pl.col("Physical").mean().alias("avgPhysical")\r
    ])\r
    positionStats\r
  exercise:\r
    prompt: 7단계. 포지션별 평균 능력치 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      positionStats = filtered.group_by("Position").agg([\r
          pl.col("Overall").mean().alias("avgOverall"),\r
          pl.col("Pace").mean().alias("avgPace"),\r
          pl.col("Shooting").mean().alias("avgShooting"),\r
          pl.col("Passing").mean().alias("avgPassing"),\r
          pl.col("Dribbling").mean().alias("avgDribbling"),\r
          pl.col("Defending").mean().alias("avgDefending"),\r
          pl.col("Physical").mean().alias("avgPhysical")\r
      ])\r
      positionStats\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 포지션별 평균 능력치의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 포지션별 평균 능력치의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_with_columns\r
  title: 8단계. 등급 컬럼 추가\r
  structuredPrimary: true\r
  subtitle: with_columns\r
  goal: 8단계. 등급 컬럼 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Overall 점수에 따라 등급을 부여합니다. when-then-otherwise 구문으로 85점 이상 Elite, 75점 이상 Good, 65점 이상 Average,\r
    그 외는 Developing으로 분류합니다. 이렇게 연속형 변수를 범주형으로 변환하면 등급별 분석이 가능해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    graded = stats.with_columns(\r
        pl.when(pl.col("Overall") >= 85).then(pl.lit("Elite"))\r
        .when(pl.col("Overall") >= 75).then(pl.lit("Good"))\r
        .when(pl.col("Overall") >= 65).then(pl.lit("Average"))\r
        .otherwise(pl.lit("Developing"))\r
        .alias("Grade")\r
    )\r
    graded.head(10)\r
  exercise:\r
    prompt: 8단계. 등급 컬럼 추가 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      graded = stats.with_columns(\r
          pl.when(pl.col("Overall") >= 85).then(pl.lit("Elite"))\r
          .when(pl.col("Overall") >= 75).then(pl.lit("Good"))\r
          .when(pl.col("Overall") >= 65).then(pl.lit("Average"))\r
          .otherwise(pl.lit("Developing"))\r
          .alias("Grade")\r
      )\r
      graded.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 등급 컬럼 추가의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 등급 컬럼 추가의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_concat_intro\r
  title: 9단계. 데이터 결합\r
  structuredPrimary: true\r
  subtitle: pl.concat\r
  goal: 9단계. 데이터 결합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    여러 DataFrame을 하나로 결합하는 연습을 합니다. 공격수(ST)와 수비수(CB) 데이터를 각각 추출한 뒤 수직으로 합쳐봅니다. 실무에서는 여러 파일에서 읽어온 데이터나, 서로 다른 조건으로 필터링한 데이터를 다시 합칠 때 concat을 사용합니다. concat은 여러 DataFrame을 행 방향(수직)으로 쌓는 기능으로, SQL의 UNION ALL과 유사합니다.\r
\r
    실무에서는 월별 데이터 파일을 각각 읽어온 후 concat으로 통합하는 경우가 많습니다. 예를 들어 2024년 1월~12월 파일을 각각 읽고 pl.concat()으로 연간 데이터를 만듭니다.\r
  tips:\r
  - 실무에서는 월별 데이터 파일을 각각 읽어온 후 concat으로 통합하는 경우가 많습니다. 예를 들어 2024년 1월~12월 파일을 각각 읽고 pl.concat()으로 연간 데이터를\r
    만듭니다.\r
  snippet: |-\r
    strikers = stats.filter(pl.col("Position") == "ST").head(5)\r
    defenders = stats.filter(pl.col("Position") == "CB").head(5)\r
    strikers.shape, defenders.shape\r
  exercise:\r
    prompt: 9단계. 데이터 결합 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      strikers = stats.filter(pl.col("Position") == "ST").head(5)\r
      defenders = stats.filter(pl.col("Position") == "CB").head(5)\r
      strikers.shape, defenders.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 데이터 결합의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 데이터 결합의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_concat\r
  title: 10단계. 수직 결합\r
  structuredPrimary: true\r
  subtitle: concat으로 합치기\r
  goal: 10단계. 수직 결합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    pl.concat()은 여러 DataFrame을 수직으로 쌓아 하나의 DataFrame으로 만듭니다. 리스트로 전달된 DataFrame들의 행을 순서대로 이어붙이며, 모든 DataFrame의 컬럼 구조가 동일해야 합니다. how 파라미터로 동작 방식을 제어할 수 있으며, 기본값 'vertical'은 행을 쌓고, 'horizontal'은 열을 옆으로 붙입니다. concat은 pandas의 pd.concat()과 유사하지만 Polars가 더 빠릅니다.\r
\r
    pl.concat([df1, df2, df3, ...])는 여러 DataFrame을 한 번에 결합할 수 있습니다. how='vertical'이 기본값이며, 컬럼이 다르면 에러가 발생합니다. how='diagonal'로 컬럼이 다른 DataFrame도 결합 가능하며, 없는 컬럼은 null로 채워집니다.\r
  tips:\r
  - pl.concat([df1, df2, df3, ...])는 여러 DataFrame을 한 번에 결합할 수 있습니다. how='vertical'이 기본값이며, 컬럼이 다르면 에러가\r
    발생합니다. how='diagonal'로 컬럼이 다른 DataFrame도 결합 가능하며, 없는 컬럼은 null로 채워집니다.\r
  snippet: |-\r
    combined = pl.concat([strikers, defenders])\r
    combined\r
  exercise:\r
    prompt: 10단계. 수직 결합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      combined = pl.concat([strikers, defenders])\r
      combined\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 수직 결합의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 수직 결합의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_pivot_prep\r
  title: 11단계. 피벗 준비\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 변환\r
  goal: 11단계. 피벗 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 피벗 테이블을 만들기 위해 포지션별 능력치 평균 데이터를 준비합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pivotData = filtered.group_by("Position").agg([\r
        pl.col("Pace").mean().round(1).alias("Pace"),\r
        pl.col("Shooting").mean().round(1).alias("Shooting"),\r
        pl.col("Passing").mean().round(1).alias("Passing"),\r
        pl.col("Dribbling").mean().round(1).alias("Dribbling"),\r
        pl.col("Defending").mean().round(1).alias("Defending"),\r
        pl.col("Physical").mean().round(1).alias("Physical")\r
    ])\r
    pivotData\r
  exercise:\r
    prompt: 11단계. 피벗 준비 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pivotData = filtered.group_by("Position").agg([\r
          pl.col("Pace").mean().round(1).alias("Pace"),\r
          pl.col("Shooting").mean().round(1).alias("Shooting"),\r
          pl.col("Passing").mean().round(1).alias("Passing"),\r
          pl.col("Dribbling").mean().round(1).alias("Dribbling"),\r
          pl.col("Defending").mean().round(1).alias("Defending"),\r
          pl.col("Physical").mean().round(1).alias("Physical")\r
      ])\r
      pivotData\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 피벗 준비의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 피벗 준비의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_unpivot\r
  title: 12단계. 언피벗\r
  structuredPrimary: true\r
  subtitle: 넓은 형태를 긴 형태로\r
  goal: 12단계. 언피벗에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    피벗(pivot)을 이해하려면 먼저 언피벗(unpivot)을 알아야 합니다. 언피벗은 넓은 형태(wide format)의 데이터를 긴 형태(long format)로 변환하는 작업입니다. 여러 컬럼에 흩어져 있던 값들을 하나의 변수(variable)와 값(value) 컬럼으로 모읍니다. Pace, Shooting, Passing 등 6개 능력치 컬럼을 Stat(능력치명)과 Value(값) 2개 컬럼으로 변환하면, 포지션 × 능력치 조합이 각각 하나의 행이 됩니다. 이는 데이터 시각화나 피벗 테이블 생성에 유용한 형태입니다.\r
\r
    unpivot(index=고정할컬럼, variable_name=변수명컬럼, value_name=값컬럼)은 여러 컬럼을 하나로 모읍니다. pandas의 melt()와 동일한 기능입니다. index에 지정하지 않은 모든 컬럼이 변환 대상이 됩니다.\r
  tips:\r
  - unpivot(index=고정할컬럼, variable_name=변수명컬럼, value_name=값컬럼)은 여러 컬럼을 하나로 모읍니다. pandas의 melt()와 동일한 기능입니다.\r
    index에 지정하지 않은 모든 컬럼이 변환 대상이 됩니다.\r
  snippet: |-\r
    longData = pivotData.unpivot(\r
        index="Position",\r
        variable_name="Stat",\r
        value_name="Value"\r
    )\r
    longData.head(12)\r
  exercise:\r
    prompt: 12단계. 언피벗 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      longData = pivotData.unpivot(\r
          index="Position",\r
          variable_name="Stat",\r
          value_name="Value"\r
      )\r
      longData.head(12)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 언피벗의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 언피벗의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_pivot\r
  title: 13단계. 피벗 테이블\r
  structuredPrimary: true\r
  subtitle: 긴 형태를 넓게\r
  goal: 13단계. 피벗 테이블에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이제 피벗(pivot)으로 긴 형태를 다시 넓은 형태로 변환합니다. 피벗은 특정 컬럼의 고유값들을 새로운 컬럼으로 만들어 데이터를 재구조화합니다. Position의 고유값(ST, CM, CB, GK)이 새로운 컬럼이 되고, Stat(능력치명)이 행 인덱스가 되어, 각 포지션별 능력치를 한눈에 비교할 수 있는 테이블이 완성됩니다. 이는 엑셀의 피벗 테이블, pandas의 pivot_table()과 동일한 개념으로, 스포츠 데이터 분석에서 매우 유용합니다.\r
\r
    pivot(on=열이될컬럼, index=행이될컬럼, values=값컬럼)으로 피벗 테이블을 만듭니다. on에 지정한 컬럼의 고유값들이 새 컬럼이 됩니다. aggregate_function 파라미터로 집계 함수(mean, sum 등)를 지정할 수 있습니다.\r
  tips:\r
  - pivot(on=열이될컬럼, index=행이될컬럼, values=값컬럼)으로 피벗 테이블을 만듭니다. on에 지정한 컬럼의 고유값들이 새 컬럼이 됩니다. aggregate_function\r
    파라미터로 집계 함수(mean, sum 등)를 지정할 수 있습니다.\r
  snippet: |-\r
    pivotTable = longData.pivot(\r
        on="Position",\r
        index="Stat",\r
        values="Value"\r
    )\r
    pivotTable\r
  exercise:\r
    prompt: 13단계. 피벗 테이블 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      pivotTable = longData.pivot(\r
          on="Position",\r
          index="Stat",\r
          values="Value"\r
      )\r
      pivotTable\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 피벗 테이블의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 피벗 테이블의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step14_viz\r
  title: 14단계. 결과물 - 포지션별 능력치 비교\r
  structuredPrimary: true\r
  subtitle: 피벗 테이블 결과\r
  goal: 14단계. 결과물 포지션별 능력치 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    최종 결과물인 피벗 테이블이 완성되었습니다. 이 테이블은 포지션(ST, CM, CB, GK)을 열로, 능력치(Pace, Shooting, Passing, Dribbling, Defending, Physical)를 행으로 배치하여, 각 포지션이 어떤 능력에 특화되어 있는지 한눈에 비교할 수 있습니다. 예를 들어 ST는 Shooting이 높고 Defending이 낮으며, CB는 그 반대입니다. 이러한 인사이트는 축구 게임 전략 수립, 선수 영입 결정, 포메이션 설계 등 실무 스포츠 분석에 직접 활용됩니다.\r
\r
    피벗 테이블은 데이터를 요약하고 비교하는 가장 효과적인 방법입니다. 실무에서는 이 테이블을 그래프(히트맵, 레이더 차트 등)로 시각화하면 더욱 직관적인 인사이트를 얻을 수 있습니다.\r
  snippet: pivotTable\r
  exercise:\r
    prompt: 14단계. 결과물 포지션별 능력치 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pivotTable\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 결과물 포지션별 능력치 비교의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 결과물 포지션별 능력치 비교의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: FIFA 데이터 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    스포츠 데이터 분석가가 되어 배운 모든 개념을 종합적으로 활용해봅시다. exclude로 불필요한 컬럼 제거, concat으로 여러 포지션 데이터 결합, pivot으로 비교 테이블 생성, group_by로 심층 집계를 모두 사용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import polars as pl\r
    from io import StringIO\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    fifaRaw = pl.read_csv(StringIO(loadLocalDataset("fifa_players").to_csv(index=False)))\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import polars as pl\r
      from io import StringIO\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      fifaRaw = pl.read_csv(StringIO(loadLocalDataset("fifa_players").to_csv(index=False)))\r
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
    content: 스포츠 데이터 분석의 핵심 기법을 마스터했습니다. exclude, concat, pivot은 실무에서 매우 자주 사용되는 필수 기능입니다.\r
  - type: list\r
    items:\r
    - pl.all().exclude([열]) - 특정 열 제외하고 나머지 전부 선택, 컬럼이 많을 때 효율적\r
    - pl.concat([df1, df2, ...]) - 여러 DataFrame 수직 결합, how='vertical'/'horizontal'/'diagonal'\r
    - unpivot(index, variable_name, value_name) - 넓은 형태를 긴 형태로, pandas melt()와 동일\r
    - pivot(on, index, values) - 긴 형태를 넓게, 피벗 테이블 생성으로 비교 분석\r
    - group_by().agg() - 포지션별 평균 능력치 계산, 그룹별 집계\r
    - is_in([값 목록]) - 여러 조건 필터링, SQL IN과 동일\r
  - type: text\r
    content: 다음 시간에는 소셜미디어 데이터로 over, rolling, unpivot을 활용한 복잡한 표현식 체이닝을 배웁니다.\r
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