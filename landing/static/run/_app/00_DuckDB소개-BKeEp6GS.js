var e=`meta:\r
  packages:\r
  - duckdb\r
  id: duckdb_00\r
  title: DuckDB소개\r
  order: 0\r
  category: duckdb\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - DuckDB\r
  - OLAP\r
  - SQL\r
  - 분석용DB\r
  - 인메모리\r
  - 로컬SQL\r
  seo:\r
    title: DuckDB 입문 - 분석에 특화된 SQL 데이터베이스\r
    description: DuckDB로 빠른 데이터 분석을 시작하세요. 로컬 Python에서 바로 실행되는 분석용 SQL 데이터베이스입니다.\r
    keywords:\r
    - DuckDB\r
    - OLAP\r
    - SQL\r
    - 데이터분석\r
    - 인메모리DB\r
    - 분석용데이터베이스\r
intro:\r
  direction: DuckDB소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - DuckDB소개 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 로컬 DuckDB 쿼리 품질 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: SELECT/WHERE/GRO 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 쿼리 결과 행, 컬럼, 집계값 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: DuckDB소개 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: DuckDB소개 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: DuckDB소개 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🦆\r
    title: DuckDB??\r
    subtitle: 오리가 데이터베이스라고?\r
  - type: hero\r
    emoji: 🚀\r
    title: 분석에 특화된 SQL 데이터베이스\r
    subtitle: uv 준비 후 바로 쓰는 초고속 분석 엔진\r
    points:\r
    - emoji: 💡\r
      title: uv 준비 후 SQL 한 줄\r
    - emoji: ⚡\r
      title: 분석 쿼리에 최적화\r
    - emoji: 🌐\r
      title: 로컬에서도 실행\r
    - emoji: 🐼\r
      title: pandas와 완벽 호환\r
  goal: DuckDB??에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: what_is_duckdb\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 DuckDB가 뭔가요?\r
    subtitle: 한마디로 분석용 SQLite\r
  - type: note\r
    style: info\r
    title: OLAP vs OLTP\r
    content: 데이터베이스는 크게 두 종류입니다. OLTP는 주문, 결제처럼 빠른 트랜잭션 처리용(MySQL, PostgreSQL). OLAP는 집계, 통계처럼 대량 데이터\r
      분석용(DuckDB, BigQuery). DuckDB는 OLAP에 특화된 데이터베이스입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📊\r
      title: 컬럼 기반 저장\r
      description: 행이 아닌 열 단위 저장으로 집계 쿼리 초고속\r
    - emoji: 💾\r
      title: 인메모리 처리\r
      description: 데이터를 메모리에 올려 빠른 연산\r
    - emoji: 🔌\r
      title: 서버 불필요\r
      description: 별도 서버 없이 파일 하나로 동작\r
    - emoji: 🆓\r
      title: 완전 무료\r
      description: 오픈소스, MIT 라이선스\r
  goal: 🤔 DuckDB가 뭔가요?에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: why_duckdb\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 DuckDB가 인기일까요?\r
    subtitle: 데이터 분석가들이 열광하는 이유\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚡\r
      title: 엄청 빠름\r
      description: pandas보다 10~100배 빠른 분석 쿼리 처리\r
    - emoji: 📦
      title: 준비가 간단
      description: 라이브러리 패널에서 현재 실행 환경 준비
    - emoji: 🌐\r
      title: 로컬 실행\r
      description: 로컬 Python 패키지로 바로 동작\r
    - emoji: 📁\r
      title: 다양한 포맷\r
      description: CSV, Parquet, JSON, Excel 직접 쿼리\r
    - emoji: 🐼\r
      title: pandas 호환\r
      description: DataFrame을 SQL로 바로 분석\r
    - emoji: 🔒\r
      title: 로컬 처리\r
      description: 데이터가 외부로 안 나감\r
  goal: 🌟 왜 DuckDB가 인기일까요?에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: duckdb_vs_pandas\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 DuckDB vs pandas\r
    subtitle: 언제 뭘 써야 할까요?\r
  - type: compare\r
    left:\r
      title: pandas\r
      subtitle: Python 방식\r
      icon: 🐼\r
      color: blue\r
      items:\r
      - Python 문법으로 분석\r
      - 메서드 체이닝\r
      - 유연한 데이터 조작\r
      - 시각화 라이브러리 연동\r
      - ML 전처리에 최적\r
      infoBox: Python이 익숙하다면\r
    right:\r
      title: DuckDB\r
      subtitle: SQL 방식\r
      icon: 🦆\r
      color: green\r
      items:\r
      - SQL 문법으로 분석\r
      - 표준 SQL 지원\r
      - 대용량에서 월등히 빠름\r
      - 복잡한 집계 쿼리 간결\r
      - BI 도구 연동 쉬움\r
      infoBox: SQL이 익숙하다면\r
  - type: note\r
    style: tip\r
    title: 둘 다 쓰면 됩니다!\r
    content: DuckDB는 pandas DataFrame을 직접 쿼리할 수 있습니다. pandas로 전처리하고 DuckDB로 분석하는 조합도 강력합니다. 상황에 맞게 섞어\r
      쓰세요!\r
  goal: 🆚 DuckDB vs pandas에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: sql_intro\r
  blocks:\r
  - type: sectionHeader\r
    title: 📝 SQL 기초\r
    subtitle: DuckDB를 쓰려면 SQL을 알아야 합니다\r
  - type: note\r
    style: info\r
    title: SQL이란?\r
    content: Structured Query Language의 약자로, 데이터베이스와 대화하는 언어입니다. 1970년대 만들어져 지금도 표준으로 사용됩니다. 배워두면 모든 DB에서\r
      쓸 수 있어요.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔍\r
      title: SELECT\r
      description: 데이터 조회\r
    - emoji: 🎯\r
      title: WHERE\r
      description: 조건 필터링\r
    - emoji: 📊\r
      title: GROUP BY\r
      description: 그룹별 집계\r
    - emoji: 🔗\r
      title: JOIN\r
      description: 테이블 결합\r
  - type: table\r
    headers:\r
    - SQL\r
    - pandas\r
    - 설명\r
    rows:\r
    - - SELECT *\r
      - df\r
      - 전체 조회\r
    - - SELECT col1, col2\r
      - df[['col1', 'col2']]\r
      - 컬럼 선택\r
    - - WHERE x > 10\r
      - df[df['x'] > 10]\r
      - 조건 필터\r
    - - ORDER BY x\r
      - df.sort_values('x')\r
      - 정렬\r
    - - GROUP BY x\r
      - df.groupby('x')\r
      - 그룹화\r
  goal: 📝 SQL 기초에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 DuckDB 활용 사례\r
    subtitle: 이런 상황에서 DuckDB가 빛납니다\r
  - type: featureCards\r
    cards:\r
    - emoji: 📊\r
      title: 대용량 로그 분석\r
      description: 수천만 행 로그를 SQL로 빠르게 집계\r
    - emoji: 📁\r
      title: CSV/Parquet 직접 쿼리\r
      description: 파일을 DB에 넣지 않고 바로 분석\r
    - emoji: 🔄\r
      title: ETL 파이프라인\r
      description: 데이터 변환/적재 자동화\r
    - emoji: 📈\r
      title: BI 리포트\r
      description: 복잡한 집계 쿼리로 리포트 생성\r
    - emoji: 🧪\r
      title: 데이터 탐색\r
      description: 빠른 프로토타이핑으로 인사이트 발견\r
    - emoji: 🌐\r
      title: 웹 앱 분석\r
      description: 로컬 파일과 DataFrame을 SQL로 분석\r
  goal: 🎯 DuckDB 활용 사례에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: local_duckdb\r
  blocks:\r
  - type: sectionHeader\r
    title: 💻 로컬에서 DuckDB\r
    subtitle: uv 패키지로 바로 실행\r
  - type: note\r
    style: info\r
    title: 로컬 DuckDB란?\r
    content: DuckDB는 별도 데이터베이스 서버 없이 Python 프로세스 안에서 실행되는 분석 엔진입니다. CSV, Parquet, pandas DataFrame을 로컬에서\r
      바로 SQL로 다룰 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🚫\r
      title: 서버 불필요\r
      description: 별도 DB 서버 없이 바로 실행\r
    - emoji: 🔒\r
      title: 데이터 보안\r
      description: 데이터가 서버로 안 나감\r
    - emoji: ⚡\r
      title: 네이티브급 속도\r
      description: 네이티브 엔진으로 빠른 처리\r
  goal: 💻 로컬에서 DuckDB에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: comparison_table\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 데이터베이스 비교\r
    subtitle: 어떤 상황에 어떤 도구?\r
  - type: table\r
    headers:\r
    - 도구\r
    - 특징\r
    - 추천 상황\r
    rows:\r
    - - DuckDB\r
      - 분석 특화, 컬럼 기반\r
      - 대용량 집계, 분석 쿼리\r
    - - SQLite\r
      - 가벼운 OLTP\r
      - 간단한 앱, 임베디드\r
    - - pandas\r
      - Python DataFrame\r
      - 데이터 전처리, ML\r
    - - PostgreSQL\r
      - 범용 RDBMS\r
      - 웹 서비스 백엔드\r
    - - BigQuery\r
      - 클라우드 OLAP\r
      - 페타바이트급 분석\r
  - type: note\r
    style: tip\r
    title: SQLite vs DuckDB\r
    content: 둘 다 서버 없이 파일로 동작하지만, 목적이 다릅니다. SQLite는 트랜잭션 처리(행 기반), DuckDB는 분석 쿼리(열 기반)에 최적화되어 있어요.\r
  goal: 📊 데이터베이스 비교에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 앞으로 배울 내용\r
    subtitle: DuckDB로 이런 것들을 해봅니다\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    rows:\r
    - - 입문\r
      - 기본 쿼리\r
      - SELECT, WHERE, ORDER BY\r
    - - 입문\r
      - 집계 함수\r
      - COUNT, SUM, AVG, GROUP BY\r
    - - 기초\r
      - 조인\r
      - INNER JOIN, LEFT JOIN\r
    - - 기초\r
      - 서브쿼리\r
      - 중첩 쿼리, CTE\r
    - - 중급\r
      - 윈도우 함수\r
      - RANK, LAG, LEAD\r
    - - 중급\r
      - 파일 직접 쿼리\r
      - CSV, Parquet, JSON\r
    - - 심화\r
      - pandas 연동\r
      - DataFrame SQL 분석\r
    - - 심화\r
      - 성능 최적화\r
      - 인덱스, 쿼리 플랜\r
  - type: note\r
    style: info\r
    title: 실습 중심 학습\r
    content: 각 프로젝트에서 실제 데이터를 SQL로 분석합니다. 이론만 배우는 게 아니라 직접 쿼리를 작성해보세요.\r
  goal: 🗺️ 앞으로 배울 내용에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: DuckDB 공식 문서\r
      url: https://duckdb.org/docs/\r
      icon: 🔗\r
    - text: DuckDB SQL 문법\r
      url: https://duckdb.org/docs/sql/introduction\r
      icon: 🔗\r
    - text: DuckDB Python API\r
      url: https://duckdb.org/docs/api/python/overview\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 기본 SQL 쿼리'\r
    subtitle: SELECT, WHERE로 데이터를 조회해봅니다\r
  goal: '다음: 기본 SQL 쿼리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.'\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → SQL 오류 수정 → 결과 검증 → 실무 변주\r
  goal: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: DuckDB 학습은 쿼리 결과를 눈으로 보는 데서 끝나면 실무로 이어지기 어렵습니다. 작은 로컬 테이블을 만들고, 잘못된 컬럼명을 먼저 실패시킨 뒤, 집계\r
    결과와 기준 변경 실험을 assert로 고정합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import duckdb\r
\r
    workflowCon = duckdb.connect()\r
    workflowCon.sql("""\r
        CREATE OR REPLACE TABLE lessonOrders AS\r
        SELECT * FROM (VALUES\r
            ('A-100', 'paid', 50000, 'web'),\r
            ('A-101', 'pending', 20000, 'app'),\r
            ('A-102', 'paid', 120000, 'web'),\r
            ('A-103', 'cancelled', 15000, 'store'),\r
            ('A-104', 'paid', 62000, 'app')\r
        ) AS t(orderId, status, amount, channel)\r
    """)\r
\r
    expectedPaidRevenue = 232000\r
    expectedPaidCount = 3\r
    rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]\r
\r
    assert rowCount == 5\r
    rowCount\r
  exercise:\r
    prompt: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import duckdb\r
\r
      workflowCon = duckdb.connect()\r
      workflowCon.sql("""\r
          CREATE OR REPLACE TABLE lessonOrders AS\r
          SELECT * FROM (VALUES\r
              ('A-100', 'paid', 50000, 'web'),\r
              ('A-101', 'pending', 20000, 'app'),\r
              ('A-102', 'paid', 120000, 'web'),\r
              ('A-103', 'cancelled', 15000, 'store'),\r
              ('A-104', 'paid', 62000, 'app')\r
          ) AS t(orderId, status, amount, channel)\r
      """)\r
\r
      expectedPaidRevenue = 232000\r
      expectedPaidCount = 3\r
      rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]\r
\r
      assert rowCount == 5\r
      rowCount\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.'\r
`;export{e as default};