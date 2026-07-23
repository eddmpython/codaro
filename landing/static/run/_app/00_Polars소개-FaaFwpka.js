var e=`meta:\r
  packages:\r
  - polars\r
  id: polars_00\r
  title: Polars소개\r
  order: 0\r
  category: polars\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - Polars\r
  - Rust\r
  - DataFrame\r
  - Lazy Evaluation\r
  - 병렬처리\r
  - Apache Arrow\r
  seo:\r
    title: Polars 입문 - Rust 기반 초고속 DataFrame\r
    description: Polars로 초고속 데이터 처리를 경험하세요. Lazy Evaluation, 병렬 처리, Apache Arrow 기반의 현대적 DataFrame 라이브러리입니다.\r
    keywords:\r
    - Polars\r
    - Rust\r
    - DataFrame\r
    - Lazy Evaluation\r
    - 병렬처리\r
    - Apache Arrow\r
    - pandas 대안\r
intro:\r
  direction: Polars소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.\r
  - Polars소개 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 업무 흐름 검증 입력 확인\r
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.\r
    - label: 컬럼 선택/필터/집계 처리 실행\r
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 행 수, 컬럼 값, 집계 결과 결과 검증\r
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.\r
    - label: Polars소개 재사용\r
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 컬럼형 표 분석 환경\r
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Polars소개 실행\r
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.\r
    - label: Polars소개 완료\r
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: ⚡\r
    title: Polars란?\r
    subtitle: pandas 말고 뭐가 더 있어?\r
  - type: hero\r
    emoji: 🦀\r
    title: Rust 기반 초고속 DataFrame\r
    subtitle: pandas보다 10~100배 빠른 데이터 처리\r
    points:\r
    - emoji: 🚀\r
      title: Rust로 작성된 초고속 엔진\r
    - emoji: 💤\r
      title: Lazy Evaluation 쿼리 최적화\r
    - emoji: 🔄\r
      title: 자동 병렬 처리\r
    - emoji: 🏹\r
      title: Apache Arrow 기반 메모리 효율\r
  - type: image\r
    src: https://raw.githubusercontent.com/pola-rs/polars-static/master/banner/polars_github_banner.svg\r
  goal: Polars란?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: why_polars\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 pandas로 충분하지 않나요?\r
    subtitle: 대용량 데이터에서의 한계\r
  - type: compare\r
    left:\r
      title: pandas\r
      subtitle: 전통적인 방식\r
      icon: 🐼\r
      color: gray\r
      items:\r
      - 싱글 스레드 처리\r
      - 메모리 비효율적\r
      - 즉시 실행 (Eager)\r
      - 대용량에서 느려짐\r
      - GIL 제한\r
      infoBox: 소규모 데이터에 적합\r
    right:\r
      title: Polars\r
      subtitle: 현대적인 방식\r
      icon: ⚡\r
      color: green\r
      items:\r
      - 자동 멀티스레딩\r
      - Apache Arrow 메모리 효율\r
      - Lazy Evaluation 최적화\r
      - 대용량에서도 빠름\r
      - GIL 우회\r
      infoBox: 대용량 데이터에 최적\r
  goal: 🤔 pandas로 충분하지 않나요?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: key_features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 Polars의 핵심 기능\r
    subtitle: 왜 Polars가 빠른가?\r
  - type: featureCards\r
    cards:\r
    - emoji: 💤\r
      title: Lazy Evaluation\r
      description: 쿼리를 즉시 실행하지 않고 최적화 후 실행. 불필요한 연산 제거\r
    - emoji: 🔄\r
      title: 병렬 처리\r
      description: 멀티코어 CPU 자동 활용. GIL 없이 진정한 병렬 처리\r
    - emoji: 🏹\r
      title: Apache Arrow\r
      description: 제로카피 데이터 공유. 메모리 효율 극대화\r
    - emoji: 🎨\r
      title: 표현식 API\r
      description: 직관적이고 읽기 쉬운 메서드 체이닝\r
  goal: 🎯 Polars의 핵심 기능에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: expression_api\r
  blocks:\r
  - type: sectionHeader\r
    title: 📝 표현식 API\r
    subtitle: 직관적인 데이터 처리 문법\r
  - type: note\r
    style: info\r
    title: Polars의 강점\r
    content: Polars는 표현식 기반 API를 제공합니다. select, filter, groupBy, agg 등을 체이닝하여 복잡한 데이터 처리도 읽기 쉽게 작성할 수\r
      있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔍\r
      title: select\r
      description: 컬럼 선택 및 변환\r
    - emoji: 🎯\r
      title: filter\r
      description: 조건에 맞는 행 필터링\r
    - emoji: 📊\r
      title: groupBy\r
      description: 그룹별 집계\r
    - emoji: 🔗\r
      title: join\r
      description: 테이블 결합\r
  goal: 📝 표현식 API에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: lazy_vs_eager\r
  blocks:\r
  - type: sectionHeader\r
    title: 💤 Lazy vs Eager\r
    subtitle: 두 가지 실행 모드\r
  - type: compare\r
    left:\r
      title: Eager Mode\r
      subtitle: 즉시 실행\r
      icon: ▶️\r
      color: blue\r
      items:\r
      - 코드 작성 즉시 실행\r
      - 결과 바로 확인\r
      - 디버깅에 편리\r
      - 소규모 데이터에 적합\r
      infoBox: pl.read_csv()\r
    right:\r
      title: Lazy Mode\r
      subtitle: 최적화 후 실행\r
      icon: 💤\r
      color: green\r
      items:\r
      - collect() 호출 시 실행\r
      - 쿼리 플랜 최적화\r
      - 불필요한 연산 제거\r
      - 대용량 데이터에 최적\r
      infoBox: pl.scan_csv()\r
  - type: note\r
    style: tip\r
    title: Lazy 우선 권장\r
    content: 대용량 데이터를 다룰 때는 scan_csv로 Lazy하게 읽고, 필요한 연산을 정의한 후 collect()로 실행하세요. 쿼리 최적화로 성능이 크게 향상됩니다.\r
  goal: 💤 Lazy vs Eager에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 10개 프로젝트 미리보기\r
    subtitle: 이 순서대로 배웁니다\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    rows:\r
    - - 입문\r
      - 01 영화데이터분석\r
      - 기본 문법, read/scan, select, filter\r
    - - 입문\r
      - 02 날씨데이터분석\r
      - groupBy, agg, 정렬, 통계 함수\r
    - - 기초\r
      - 03 게임데이터분석\r
      - 표현식 심화, withColumns, alias\r
    - - 기초\r
      - 04 주식데이터분석\r
      - 시계열, 윈도우 함수, rolling\r
    - - 기초\r
      - 05 음악데이터분석\r
      - 문자열 처리, 조건부 컬럼\r
    - - 중급\r
      - 06 부동산데이터분석\r
      - join, concat, 복합 집계\r
    - - 중급\r
      - 07 스포츠데이터분석\r
      - pivot, melt, 데이터 변환\r
    - - 중급\r
      - 08 소셜미디어분석\r
      - Lazy 최적화, 쿼리 플랜\r
    - - 심화\r
      - 09 대용량처리\r
      - 파티셔닝, 스트리밍, 성능 튜닝\r
    - - 심화\r
      - 10 종합프로젝트\r
      - 전체 개념 종합 활용\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 개념만 배우는 게 아니라 실제 분석을 수행합니다.\r
  goal: 🗺️ 10개 프로젝트 미리보기에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: local_python_support\r
  blocks:\r
  - type: sectionHeader\r
    title: 💻 로컬에서 빠르게 동작\r
    subtitle: Codaro 로컬 Python 지원\r
  - type: note\r
    style: tip\r
    title: Codaro 로컬 Python에서 Polars 사용\r
    content: Polars는 Rust 기반 엔진과 Apache Arrow 메모리 모델을 사용합니다. Codaro 로컬 Python에서는 멀티코어와 로컬 파일을 활용해 대용량\r
      데이터 분석을 실습할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: 로컬 실행\r
      description: 로컬 파일을 바로 읽고 분석\r
    - emoji: 📦\r
      title: Rust 기반 엔진\r
      description: Rust 엔진과 Arrow 기반 메모리\r
    - emoji: ⚡\r
      title: 네이티브급 성능\r
      description: 로컬 CPU에서도 빠른 처리\r
  goal: 💻 로컬에서 빠르게 동작에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: comparison_table\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 DataFrame 라이브러리 비교\r
    subtitle: 어떤 상황에 어떤 도구?\r
  - type: table\r
    headers:\r
    - 라이브러리\r
    - 특징\r
    - 추천 상황\r
    rows:\r
    - - pandas\r
      - 가장 널리 사용, 풍부한 생태계\r
      - 소규모 데이터, 빠른 프로토타이핑\r
    - - Polars\r
      - 초고속, Lazy Evaluation\r
      - 대용량 데이터, 성능 중요\r
    - - DuckDB\r
      - SQL 기반, OLAP 특화\r
      - 분석 쿼리, SQL 선호\r
    - - Dask\r
      - 분산 처리, pandas 호환\r
      - 클러스터, 분산 환경\r
    - - Vaex\r
      - 아웃오브코어, 대용량\r
      - 메모리 초과 데이터\r
  - type: note\r
    style: info\r
    title: pandas 지식 활용\r
    content: Polars API는 pandas와 유사합니다. pandas를 알고 있다면 Polars 학습이 훨씬 수월합니다.\r
  goal: 📊 DataFrame 라이브러리 비교에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Polars 공식 문서\r
      url: https://docs.pola.rs/\r
      icon: 🔗\r
    - text: Polars User Guide\r
      url: https://docs.pola.rs/user-guide/\r
      icon: 🔗\r
    - text: Polars Cheat Sheet\r
      url: https://franzdiebold.github.io/polars-cheat-sheet/Polars_cheat_sheet.pdf\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 영화 데이터 분석'\r
    subtitle: Polars 기본 문법으로 영화 데이터를 분석합니다\r
  goal: '다음: 영화 데이터 분석에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.'\r
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