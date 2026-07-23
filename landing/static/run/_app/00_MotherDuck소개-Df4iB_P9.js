var e=`meta:\r
  packages:\r
  - duckdb\r
  id: duckdb_00b\r
  title: MotherDuck소개\r
  order: 0.5\r
  category: duckdb\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - MotherDuck\r
  - DuckDB\r
  - 클라우드\r
  - 서버리스\r
  - 데이터웨어하우스\r
  - 하이브리드\r
  seo:\r
    title: MotherDuck 입문 - DuckDB 기반 클라우드 데이터 웨어하우스\r
    description: MotherDuck으로 로컬과 클라우드를 넘나드는 데이터 분석을 시작하세요. DuckDB 기반의 서버리스 분석 플랫폼입니다.\r
    keywords:\r
    - MotherDuck\r
    - DuckDB\r
    - 클라우드\r
    - 서버리스\r
    - 데이터웨어하우스\r
    - 하이브리드쿼리\r
intro:\r
  direction: MotherDuck소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.\r
  - MotherDuck소개 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 로컬 DuckDB 쿼리 품질 입력 확인\r
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.\r
    - label: SELECT/WHERE/GRO 처리 실행\r
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 쿼리 결과 행, 컬럼, 집계값 결과 검증\r
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.\r
    - label: MotherDuck소개 재사용\r
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: SQL 분석 환경\r
      detail: duckdb 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: MotherDuck소개 실행\r
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.\r
    - label: MotherDuck소개 완료\r
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🦆☁️\r
    title: MotherDuck??\r
    subtitle: DuckDB가 클라우드를 만났다\r
  - type: hero\r
    emoji: 🚀\r
    title: DuckDB 기반 서버리스 데이터 웨어하우스\r
    subtitle: 로컬과 클라우드를 넘나드는 하이브리드 분석\r
    points:\r
    - emoji: ☁️\r
      title: 서버리스 클라우드\r
    - emoji: 🔗\r
      title: 로컬+클라우드 동시 쿼리\r
    - emoji: 💰\r
      title: 초 단위 과금\r
    - emoji: 🦆\r
      title: DuckDB 100% 호환\r
  - type: image\r
    src: https://motherduck.com/docs/assets/images/md-diagram_v1.3-ce2f25a6d54de87545934d324514c3e7.png\r
  goal: MotherDuck??에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: what_is_motherduck\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 MotherDuck이 뭔가요?\r
    subtitle: 한마디로 DuckDB의 클라우드 버전\r
  - type: note\r
    style: info\r
    title: DuckDB + 클라우드 = MotherDuck\r
    content: MotherDuck은 DuckDB 엔진을 기반으로 한 서버리스 클라우드 데이터 웨어하우스입니다. 로컬에서 돌리던 DuckDB 쿼리를 그대로 클라우드에서 실행할\r
      수 있고, 둘을 동시에 쿼리하는 하이브리드 실행도 가능합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ☁️\r
      title: 서버리스\r
      description: 인프라 관리 불필요, SQL만 작성\r
    - emoji: 🔗\r
      title: 하이브리드 쿼리\r
      description: 로컬과 클라우드 데이터 동시 분석\r
    - emoji: 📦\r
      title: 관리형 스토리지\r
      description: 자동 최적화된 데이터 저장\r
    - emoji: 🤝\r
      title: 협업 기능\r
      description: 데이터 공유 및 팀 작업 지원\r
  goal: 🤔 MotherDuck이 뭔가요?에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: dual_execution\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚡ Dual Execution\r
    subtitle: MotherDuck만의 킬러 피처\r
  - type: image\r
    src: https://motherduck.com/docs/assets/ideal-img/hybrid_query.0535877.540.png\r
  - type: note\r
    style: tip\r
    title: 로컬 + 클라우드 동시 실행\r
    content: 로컬 DuckDB에서 ATTACH 'md:' 한 줄이면 MotherDuck에 연결됩니다. 이후 하나의 쿼리에서 로컬 데이터와 클라우드 데이터를 동시에 조인할 수\r
      있어요. 옵티마이저가 자동으로 데이터 위치에 따라 실행을 분배합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 💻\r
      title: 로컬 데이터\r
      description: 내 노트북의 CSV, Parquet 파일\r
    - emoji: ☁️\r
      title: 클라우드 데이터\r
      description: MotherDuck에 저장된 테이블\r
    - emoji: 🔀\r
      title: 자동 최적화\r
      description: 데이터 위치에 따라 실행 계획 분배\r
    - emoji: 💸\r
      title: 비용 절감\r
      description: 로컬 처리는 과금 없음\r
  goal: ⚡ Dual Execution에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: architecture\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏗️ 아키텍처\r
    subtitle: 단순함을 위한 설계\r
  - type: note\r
    style: info\r
    title: Scale-Up 철학\r
    content: 분석에 따르면 95% 이상의 데이터베이스가 1TB 미만이고, 95% 이상의 쿼리가 10GB 미만 데이터를 다룹니다. MotherDuck은 복잡한 분산 시스템 대신\r
      단일 노드 수직 확장(Scale-Up) 방식을 선택했습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 👤\r
      title: 사용자별 인스턴스\r
      description: 각 사용자에게 전용 DuckDB 인스턴스\r
    - emoji: 📏\r
      title: 수직 확장\r
      description: 필요에 따라 인스턴스 사이즈 조절\r
    - emoji: 🎯\r
      title: 단순한 구조\r
      description: 분산 시스템의 복잡성 제거\r
    - emoji: ⚡\r
      title: 빠른 시작\r
      description: 콜드 스타트 최소화\r
  goal: 🏗️ 아키텍처에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: vs_others\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 다른 서비스와 비교\r
    subtitle: 언제 MotherDuck을 선택할까요?\r
  - type: compare\r
    left:\r
      title: 로컬 DuckDB\r
      subtitle: 내 컴퓨터에서\r
      icon: 💻\r
      color: blue\r
      items:\r
      - 설치 필요 없음 (pip)\r
      - 완전 무료\r
      - 데이터가 로컬에만\r
      - 내 컴퓨터 성능에 의존\r
      - 협업 어려움\r
      infoBox: 개인 분석, 프로토타이핑\r
    right:\r
      title: MotherDuck\r
      subtitle: 클라우드에서\r
      icon: ☁️\r
      color: green\r
      items:\r
      - 웹 브라우저로 접속\r
      - 사용한 만큼 과금\r
      - 클라우드 저장 + 공유\r
      - 클라우드 리소스 활용\r
      - 팀 협업 지원\r
      infoBox: 팀 분석, 대용량 데이터\r
  - type: table\r
    headers:\r
    - 서비스\r
    - 특징\r
    - 가격\r
    rows:\r
    - - DuckDB (로컬)\r
      - 무료, 로컬 전용\r
      - 무료\r
    - - MotherDuck\r
      - 서버리스, 하이브리드\r
      - 초 단위 과금\r
    - - BigQuery\r
      - 페타바이트급, GCP 생태계\r
      - 쿼리당 과금\r
    - - Snowflake\r
      - 엔터프라이즈급, 복잡한 기능\r
      - 웨어하우스 시간당\r
  goal: 🆚 다른 서비스와 비교에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: pricing\r
  blocks:\r
  - type: sectionHeader\r
    title: 💰 가격 정책\r
    subtitle: 사용한 만큼만 지불\r
  - type: note\r
    style: tip\r
    title: 무료 플랜 있음!\r
    content: 신규 가입 시 21일 무료 체험과 함께, 매월 10GB 스토리지 + 10 CU 시간이 무료로 제공됩니다. 개인 프로젝트나 학습에는 무료 플랜으로 충분합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 💾\r
      title: 스토리지\r
      description: 저장된 압축 데이터 크기 기준\r
    - emoji: ⚙️\r
      title: 컴퓨팅\r
      description: 초 단위 과금, 로컬 실행은 무료\r
    - emoji: 🤖\r
      title: AI\r
      description: SQL Assistant, AI 함수 사용량\r
    - emoji: 🆓\r
      title: 무료 항목\r
      description: 데이터 공유, 클론, 로컬 데이터\r
  - type: note\r
    style: info\r
    title: 비용 절감 사례\r
    content: Definite는 기존 데이터 웨어하우스에서 MotherDuck으로 전환 후 70% 비용 절감을 달성했습니다. DuckDB의 효율적인 쿼리 엔진과 Scale-Up\r
      아키텍처 덕분에 타 서비스 대비 10배 저렴한 경우도 있습니다.\r
  goal: 💰 가격 정책에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 활용 사례\r
    subtitle: 이런 상황에서 MotherDuck이 빛납니다\r
  - type: featureCards\r
    cards:\r
    - emoji: 👥\r
      title: 팀 데이터 분석\r
      description: 분석 결과를 팀원들과 공유\r
    - emoji: 📊\r
      title: BI 대시보드\r
      description: Tableau, PowerBI, Hex 연동\r
    - emoji: 🔄\r
      title: ETL 파이프라인\r
      description: dbt 어댑터로 데이터 변환\r
    - emoji: 🤖\r
      title: AI 분석\r
      description: 자연어로 SQL 쿼리 생성\r
    - emoji: 📈\r
      title: 스타트업 분석\r
      description: 저비용으로 시작, 필요시 확장\r
    - emoji: 🔗\r
      title: 하이브리드 분석\r
      description: 민감 데이터는 로컬, 나머지는 클라우드\r
  goal: 🎯 활용 사례에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: getting_started\r
  blocks:\r
  - type: sectionHeader\r
    title: 🚀 시작하기\r
    subtitle: 3분 안에 첫 쿼리 실행\r
  - type: note\r
    style: info\r
    title: 연결 방법\r
    content: |-\r
      1. motherduck.com 가입 (Google/GitHub 로그인)\r
      2. 웹 UI에서 바로 쿼리하거나\r
      3. 로컬 DuckDB에서 ATTACH 'md:' 실행\r
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: 웹 UI\r
      description: 브라우저에서 바로 SQL 실행\r
    - emoji: 🐍\r
      title: Python\r
      description: duckdb.connect('md:')로 연결\r
    - emoji: 💻\r
      title: CLI\r
      description: 'duckdb md: 명령으로 접속'\r
    - emoji: 📊\r
      title: BI 도구\r
      description: ODBC/JDBC 드라이버 지원\r
  goal: 🚀 시작하기에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: ecosystem\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔌 생태계\r
    subtitle: 다양한 도구와 연동\r
  - type: featureCards\r
    cards:\r
    - emoji: 📊\r
      title: BI 도구\r
      description: Tableau, PowerBI, Omni, Hex\r
    - emoji: 🔄\r
      title: dbt\r
      description: DuckDB dbt 어댑터 지원\r
    - emoji: 🐍\r
      title: Python\r
      description: pandas, Polars 연동\r
    - emoji: 📁\r
      title: S3\r
      description: S3 버킷 직접 쿼리\r
  goal: 🔌 생태계에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: MotherDuck 공식 사이트\r
      url: https://motherduck.com/\r
      icon: 🔗\r
    - text: MotherDuck 문서\r
      url: https://motherduck.com/docs/\r
      icon: 🔗\r
    - text: MotherDuck 아키텍처\r
      url: https://motherduck.com/docs/concepts/architecture-and-capabilities/\r
      icon: 🔗\r
    - text: MotherDuck 가격\r
      url: https://motherduck.com/product/pricing/\r
      icon: 🔗\r
    - text: MotherDuck 블로그\r
      url: https://motherduck.com/blog/\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.\r
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 기본 SQL 쿼리'\r
    subtitle: DuckDB로 SELECT, WHERE를 실습해봅니다\r
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