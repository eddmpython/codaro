var e=`meta:
  packages:
  - polars
  id: polars_00
  title: Polars소개
  order: 0
  category: polars
  badge: 소개
  source: eddmpython
  sourceUrl: https://eddmpython.com
  tags:
  - Polars
  - Rust
  - DataFrame
  - Lazy Evaluation
  - 병렬처리
  - Apache Arrow
  seo:
    title: Polars 입문 - Rust 기반 초고속 DataFrame
    description: Polars로 초고속 데이터 처리를 경험하세요. Lazy Evaluation, 병렬 처리, Apache Arrow 기반의 현대적 DataFrame 라이브러리입니다.
    keywords:
    - Polars
    - Rust
    - DataFrame
    - Lazy Evaluation
    - 병렬처리
    - Apache Arrow
    - pandas 대안
intro:
  direction: Polars소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - Polars DataFrame 확인 후 컬럼 선택/필터/집계에 맞는 코드 입력을 고릅니다.
  - Polars소개 결과를 행 수, 컬럼 값, 집계 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 대용량 데이터 분석 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 업무 흐름 검증 입력 확인
      detail: 입력 기준(Polars DataFrame)과 필요한 조건을 먼저 고정합니다.
    - label: 컬럼 선택/필터/집계 처리 실행
      detail: 컬럼 선택/필터/집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 행 수, 컬럼 값, 집계 결과 결과 검증
      detail: 행 수, 컬럼 값, 집계 결과 기준으로 실행 결과를 비교합니다.
    - label: Polars소개 재사용
      detail: 완성 코드를 대용량 데이터 분석 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 컬럼형 표 분석 환경
      detail: polars 기준으로 로컬 Python 실행을 준비합니다.
    - label: Polars소개 실행
      detail: 셀을 실행해 행 수, 컬럼 값, 집계 결과와 예외 상태를 확인합니다.
    - label: Polars소개 완료
      detail: 검증된 코드를 대용량 데이터 분석 파이프라인로 남깁니다.
sections:
- id: intro
  blocks:
  - type: mainHeader
    emoji: ⚡
    title: Polars란?
    subtitle: pandas 말고 뭐가 더 있어?
  - type: hero
    emoji: 🦀
    title: Rust 기반 초고속 DataFrame
    subtitle: pandas보다 10~100배 빠른 데이터 처리
    points:
    - emoji: 🚀
      title: Rust로 작성된 초고속 엔진
    - emoji: 💤
      title: Lazy Evaluation 쿼리 최적화
    - emoji: 🔄
      title: 자동 병렬 처리
    - emoji: 🏹
      title: Apache Arrow 기반 메모리 효율
  - type: image
    src: https://raw.githubusercontent.com/pola-rs/polars-static/master/banner/polars_github_banner.svg
  goal: Polars란?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: why_polars
  blocks:
  - type: sectionHeader
    title: 🤔 pandas로 충분하지 않나요?
    subtitle: 대용량 데이터에서의 한계
  - type: compare
    left:
      title: pandas
      subtitle: 전통적인 방식
      icon: 🐼
      color: gray
      items:
      - 싱글 스레드 처리
      - 메모리 비효율적
      - 즉시 실행 (Eager)
      - 대용량에서 느려짐
      - GIL 제한
      infoBox: 소규모 데이터에 적합
    right:
      title: Polars
      subtitle: 현대적인 방식
      icon: ⚡
      color: green
      items:
      - 자동 멀티스레딩
      - Apache Arrow 메모리 효율
      - Lazy Evaluation 최적화
      - 대용량에서도 빠름
      - GIL 우회
      infoBox: 대용량 데이터에 최적
  goal: 🤔 pandas로 충분하지 않나요?에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: key_features
  blocks:
  - type: sectionHeader
    title: 🎯 Polars의 핵심 기능
    subtitle: 왜 Polars가 빠른가?
  - type: featureCards
    cards:
    - emoji: 💤
      title: Lazy Evaluation
      description: 쿼리를 즉시 실행하지 않고 최적화 후 실행. 불필요한 연산 제거
    - emoji: 🔄
      title: 병렬 처리
      description: 멀티코어 CPU 자동 활용. GIL 없이 진정한 병렬 처리
    - emoji: 🏹
      title: Apache Arrow
      description: 제로카피 데이터 공유. 메모리 효율 극대화
    - emoji: 🎨
      title: 표현식 API
      description: 직관적이고 읽기 쉬운 메서드 체이닝
  goal: 🎯 Polars의 핵심 기능에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: expression_api
  blocks:
  - type: sectionHeader
    title: 📝 표현식 API
    subtitle: 직관적인 데이터 처리 문법
  - type: note
    style: info
    title: Polars의 강점
    content: Polars는 표현식 기반 API를 제공합니다. select, filter, groupBy, agg 등을 체이닝하여 복잡한 데이터 처리도 읽기 쉽게 작성할 수
      있습니다.
  - type: featureCards
    cards:
    - emoji: 🔍
      title: select
      description: 컬럼 선택 및 변환
    - emoji: 🎯
      title: filter
      description: 조건에 맞는 행 필터링
    - emoji: 📊
      title: groupBy
      description: 그룹별 집계
    - emoji: 🔗
      title: join
      description: 테이블 결합
  goal: 📝 표현식 API에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: lazy_vs_eager
  blocks:
  - type: sectionHeader
    title: 💤 Lazy vs Eager
    subtitle: 두 가지 실행 모드
  - type: compare
    left:
      title: Eager Mode
      subtitle: 즉시 실행
      icon: ▶️
      color: blue
      items:
      - 코드 작성 즉시 실행
      - 결과 바로 확인
      - 디버깅에 편리
      - 소규모 데이터에 적합
      infoBox: pl.read_csv()
    right:
      title: Lazy Mode
      subtitle: 최적화 후 실행
      icon: 💤
      color: green
      items:
      - collect() 호출 시 실행
      - 쿼리 플랜 최적화
      - 불필요한 연산 제거
      - 대용량 데이터에 최적
      infoBox: pl.scan_csv()
  - type: note
    style: tip
    title: Lazy 우선 권장
    content: 대용량 데이터를 다룰 때는 scan_csv로 Lazy하게 읽고, 필요한 연산을 정의한 후 collect()로 실행하세요. 쿼리 최적화로 성능이 크게 향상됩니다.
  goal: 💤 Lazy vs Eager에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: projects_preview
  blocks:
  - type: sectionHeader
    title: 🗺️ 10개 프로젝트 미리보기
    subtitle: 이 순서대로 배웁니다
  - type: table
    headers:
    - 단계
    - 프로젝트
    - 배울 내용
    rows:
    - - 입문
      - 01 영화데이터분석
      - 기본 문법, read/scan, select, filter
    - - 입문
      - 02 날씨데이터분석
      - groupBy, agg, 정렬, 통계 함수
    - - 기초
      - 03 게임데이터분석
      - 표현식 심화, withColumns, alias
    - - 기초
      - 04 주식데이터분석
      - 시계열, 윈도우 함수, rolling
    - - 기초
      - 05 음악데이터분석
      - 문자열 처리, 조건부 컬럼
    - - 중급
      - 06 부동산데이터분석
      - join, concat, 복합 집계
    - - 중급
      - 07 스포츠데이터분석
      - pivot, melt, 데이터 변환
    - - 중급
      - 08 소셜미디어분석
      - Lazy 최적화, 쿼리 플랜
    - - 심화
      - 09 대용량처리
      - 파티셔닝, 스트리밍, 성능 튜닝
    - - 심화
      - 10 종합프로젝트
      - 전체 개념 종합 활용
  - type: note
    style: info
    title: 프로젝트 기반 학습
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 개념만 배우는 게 아니라 실제 분석을 수행합니다.
  goal: 🗺️ 10개 프로젝트 미리보기에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: local_python_support
  blocks:
  - type: sectionHeader
    title: 💻 로컬에서 빠르게 동작
    subtitle: Codaro 로컬 Python 지원
  - type: note
    style: tip
    title: Codaro 로컬 Python에서 Polars 사용
    content: Polars는 Rust 기반 엔진과 Apache Arrow 메모리 모델을 사용합니다. Codaro 로컬 Python에서는 멀티코어와 로컬 파일을 활용해 대용량
      데이터 분석을 실습할 수 있습니다.
  - type: featureCards
    cards:
    - emoji: 🌐
      title: 로컬 실행
      description: 로컬 파일을 바로 읽고 분석
    - emoji: 📦
      title: Rust 기반 엔진
      description: Rust 엔진과 Arrow 기반 메모리
    - emoji: ⚡
      title: 네이티브급 성능
      description: 로컬 CPU에서도 빠른 처리
  goal: 💻 로컬에서 빠르게 동작에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: comparison_table
  blocks:
  - type: sectionHeader
    title: 📊 DataFrame 라이브러리 비교
    subtitle: 어떤 상황에 어떤 도구?
  - type: table
    headers:
    - 라이브러리
    - 특징
    - 추천 상황
    rows:
    - - pandas
      - 가장 널리 사용, 풍부한 생태계
      - 소규모 데이터, 빠른 프로토타이핑
    - - Polars
      - 초고속, Lazy Evaluation
      - 대용량 데이터, 성능 중요
    - - DuckDB
      - SQL 기반, OLAP 특화
      - 분석 쿼리, SQL 선호
    - - Dask
      - 분산 처리, pandas 호환
      - 클러스터, 분산 환경
    - - Vaex
      - 아웃오브코어, 대용량
      - 메모리 초과 데이터
  - type: note
    style: info
    title: pandas 지식 활용
    content: Polars API는 pandas와 유사합니다. pandas를 알고 있다면 Polars 학습이 훨씬 수월합니다.
  goal: 📊 DataFrame 라이브러리 비교에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: resources
  blocks:
  - type: sectionHeader
    title: 📚 참고 자료
    subtitle: 더 깊이 공부하고 싶다면
  - type: links
    items:
    - text: Polars 공식 문서
      url: https://docs.pola.rs/
      icon: 🔗
    - text: Polars User Guide
      url: https://docs.pola.rs/user-guide/
      icon: 🔗
    - text: Polars Cheat Sheet
      url: https://franzdiebold.github.io/polars-cheat-sheet/Polars_cheat_sheet.pdf
      icon: 🔗
  goal: 📚 참고 자료에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
- id: next
  blocks:
  - type: hero
    emoji: 👉
    title: '다음: 영화 데이터 분석'
    subtitle: Polars 기본 문법으로 영화 데이터를 분석합니다
  goal: '다음: 영화 데이터 분석에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.'
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
  - id: polars_00-lazy-query-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - intro
    - workflow_validation
    title: columnar lazy query의 연산 순서 계획하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: scan·filter·select·group·collect 단계를 검증하고 projection pushdown 가능 열을 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - collect는 lazy plan의 마지막 경계에서 한 번만 호출하세요.
    - 실제로 필요한 열만 scanColumns에 남겨 projection pushdown을 설명하세요.
    exercise:
      prompt: audit_lazy_plan(steps, required_columns)를 완성해 valid, stages, scanColumns를 반환하세요.
      starterCode: |-
        def audit_lazy_plan(steps, required_columns):
            raise NotImplementedError
      solution: |
        def audit_lazy_plan(steps, required_columns):
            allowed = ["scan", "filter", "select", "group", "collect"]
            if not steps or steps[0] != "scan" or steps[-1] != "collect" or any(step not in allowed for step in steps):
                return {"valid": False, "stages": steps, "scanColumns": []}
            if steps.count("collect") != 1 or steps.count("scan") != 1:
                return {"valid": False, "stages": steps, "scanColumns": []}
            return {"valid": True, "stages": steps, "scanColumns": sorted(set(required_columns))}
      hints: *id001
    check:
      id: python.polars.polars_00.lazy-query-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_00.lazy-query-plan.mastery.behavior.v1.fixture
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
        entry: audit_lazy_plan
        cases:
        - id: accepts-one-collect-at-boundary
          arguments:
          - value:
            - scan
            - filter
            - select
            - collect
          - value:
            - amount
            - region
            - amount
          expectedReturn:
            valid: true
            stages:
            - scan
            - filter
            - select
            - collect
            scanColumns:
            - amount
            - region
        - id: rejects-early-collect
          arguments:
          - value:
            - scan
            - collect
            - filter
          - value:
            - x
          expectedReturn:
            valid: false
            stages:
            - scan
            - collect
            - filter
            scanColumns: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: polars_00-expression-dependency-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_00-lazy-query-plan-mastery
    title: 새 파생 열 expression의 의존성 순서 만들기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: lazy 단계 개념을 파생 열 간 dependency graph와 실행 순서로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - expression이 참조하는 열이 먼저 만들어져야 합니다.
    - 진행할 ready node가 없으면 cycle이나 missing dependency를 unresolved로 남기세요.
    exercise:
      prompt: order_expressions(expressions)를 완성해 order와 unresolved를 반환하세요.
      starterCode: |-
        def order_expressions(expressions):
            raise NotImplementedError
      solution: |
        def order_expressions(expressions):
            pending = {item["name"]: set(item.get("dependsOn", [])) for item in expressions}
            known = {"source"}
            order = []
            while pending:
                ready = sorted(name for name, deps in pending.items() if deps <= known)
                if not ready:
                    break
                for name in ready:
                    order.append(name)
                    known.add(name)
                    del pending[name]
            return {"order": order, "unresolved": sorted(pending)}
      hints: *id002
    check:
      id: python.polars.polars_00.expression-dependency-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_00.expression-dependency-plan.transfer.behavior.v1.fixture
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
        entry: order_expressions
        cases:
        - id: orders-dependent-columns
          arguments:
          - value:
            - name: net
              dependsOn:
              - source
            - name: tax
              dependsOn:
              - net
            - name: final
              dependsOn:
              - net
              - tax
          expectedReturn:
            order:
            - net
            - tax
            - final
            unresolved: []
        - id: reports-cycle
          arguments:
          - value:
            - name: a
              dependsOn:
              - b
            - name: b
              dependsOn:
              - a
          expectedReturn:
            order: []
            unresolved:
            - a
            - b
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: polars_00-lazy-eager-boundary-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - polars_00-expression-dependency-plan-transfer
    title: lazy와 eager 실행 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 대용량 scan, 작은 결과 확인, 반복 변환 상황의 실행 정책을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - lazy라는 이름만으로 빠른 것이 아니라 optimizer가 볼 전체 plan이 있어야 합니다.
    - collect 횟수와 결과 크기를 증거로 남기세요.
    exercise:
      prompt: choose_lazy_boundary(situation)를 완성해 mode, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_lazy_boundary(situation):
            raise NotImplementedError
      solution: |
        def choose_lazy_boundary(situation):
            table = {'large-file-pipeline': {'mode': 'lazy', 'evidence': 'optimized plan', 'risk': 'early materialization'}, 'small-final-result': {'mode': 'collect once', 'evidence': 'row count and schema', 'risk': 'repeated collect'}, 'interactive-single-column': {'mode': 'eager acceptable', 'evidence': 'bounded size', 'risk': 'unbounded source'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.polars.polars_00.lazy-eager-boundary.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.polars.polars_00.lazy-eager-boundary.retrieval.behavior.v1.fixture
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
        entry: choose_lazy_boundary
        cases:
        - id: recalls-large-file-pipeline
          arguments:
          - value: large-file-pipeline
          expectedReturn:
            mode: lazy
            evidence: optimized plan
            risk: early materialization
        - id: recalls-small-final-result
          arguments:
          - value: small-final-result
          expectedReturn:
            mode: collect once
            evidence: row count and schema
            risk: repeated collect
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};