var e=`meta:
  packages:
  - duckdb
  id: duckdb_00b
  title: MotherDuck소개
  order: 0.5
  category: duckdb
  badge: 소개
  source: eddmpython
  sourceUrl: https://eddmpython.com
  tags:
  - MotherDuck
  - DuckDB
  - 클라우드
  - 서버리스
  - 데이터웨어하우스
  - 하이브리드
  seo:
    title: MotherDuck 입문 - DuckDB 기반 클라우드 데이터 웨어하우스
    description: MotherDuck으로 로컬과 클라우드를 넘나드는 데이터 분석을 시작하세요. DuckDB 기반의 서버리스 분석 플랫폼입니다.
    keywords:
    - MotherDuck
    - DuckDB
    - 클라우드
    - 서버리스
    - 데이터웨어하우스
    - 하이브리드쿼리
intro:
  direction: MotherDuck소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - 테이블과 SQL 쿼리 확인 후 SELECT/WHERE/GROUP BY/CTE에 맞는 코드 입력을 고릅니다.
  - MotherDuck소개 결과를 쿼리 결과 행, 컬럼, 집계값 기준으로 즉시 점검합니다.
  - 완료한 코드를 로컬 분석 SQL 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 로컬 DuckDB 쿼리 품질 입력 확인
      detail: 입력 기준(테이블과 SQL 쿼리)과 필요한 조건을 먼저 고정합니다.
    - label: SELECT/WHERE/GRO 처리 실행
      detail: SELECT/WHERE/GROUP BY/CTE 코드를 실행해 중간 결과를 확인합니다.
    - label: 쿼리 결과 행, 컬럼, 집계값 결과 검증
      detail: 쿼리 결과 행, 컬럼, 집계값 기준으로 실행 결과를 비교합니다.
    - label: MotherDuck소개 재사용
      detail: 완성 코드를 로컬 분석 SQL 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: SQL 분석 환경
      detail: duckdb 기준으로 로컬 Python 실행을 준비합니다.
    - label: MotherDuck소개 실행
      detail: 셀을 실행해 쿼리 결과 행, 컬럼, 집계값와 예외 상태를 확인합니다.
    - label: MotherDuck소개 완료
      detail: 검증된 코드를 로컬 분석 SQL 리포트로 남깁니다.
sections:
- id: intro
  blocks:
  - type: mainHeader
    emoji: 🦆☁️
    title: MotherDuck??
    subtitle: DuckDB가 클라우드를 만났다
  - type: hero
    emoji: 🚀
    title: DuckDB 기반 서버리스 데이터 웨어하우스
    subtitle: 로컬과 클라우드를 넘나드는 하이브리드 분석
    points:
    - emoji: ☁️
      title: 서버리스 클라우드
    - emoji: 🔗
      title: 로컬+클라우드 동시 쿼리
    - emoji: 💰
      title: 초 단위 과금
    - emoji: 🦆
      title: DuckDB 100% 호환
  - type: image
    src: https://motherduck.com/docs/assets/images/md-diagram_v1.3-ce2f25a6d54de87545934d324514c3e7.png
  goal: MotherDuck??에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: what_is_motherduck
  blocks:
  - type: sectionHeader
    title: 🤔 MotherDuck이 뭔가요?
    subtitle: 한마디로 DuckDB의 클라우드 버전
  - type: note
    style: info
    title: DuckDB + 클라우드 = MotherDuck
    content: MotherDuck은 DuckDB 엔진을 기반으로 한 서버리스 클라우드 데이터 웨어하우스입니다. 로컬에서 돌리던 DuckDB 쿼리를 그대로 클라우드에서 실행할
      수 있고, 둘을 동시에 쿼리하는 하이브리드 실행도 가능합니다.
  - type: featureCards
    cards:
    - emoji: ☁️
      title: 서버리스
      description: 인프라 관리 불필요, SQL만 작성
    - emoji: 🔗
      title: 하이브리드 쿼리
      description: 로컬과 클라우드 데이터 동시 분석
    - emoji: 📦
      title: 관리형 스토리지
      description: 자동 최적화된 데이터 저장
    - emoji: 🤝
      title: 협업 기능
      description: 데이터 공유 및 팀 작업 지원
  goal: 🤔 MotherDuck이 뭔가요?에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: dual_execution
  blocks:
  - type: sectionHeader
    title: ⚡ Dual Execution
    subtitle: MotherDuck만의 킬러 피처
  - type: image
    src: https://motherduck.com/docs/assets/ideal-img/hybrid_query.0535877.540.png
  - type: note
    style: tip
    title: 로컬 + 클라우드 동시 실행
    content: 로컬 DuckDB에서 ATTACH 'md:' 한 줄이면 MotherDuck에 연결됩니다. 이후 하나의 쿼리에서 로컬 데이터와 클라우드 데이터를 동시에 조인할 수
      있어요. 옵티마이저가 자동으로 데이터 위치에 따라 실행을 분배합니다.
  - type: featureCards
    cards:
    - emoji: 💻
      title: 로컬 데이터
      description: 내 노트북의 CSV, Parquet 파일
    - emoji: ☁️
      title: 클라우드 데이터
      description: MotherDuck에 저장된 테이블
    - emoji: 🔀
      title: 자동 최적화
      description: 데이터 위치에 따라 실행 계획 분배
    - emoji: 💸
      title: 비용 절감
      description: 로컬 처리는 과금 없음
  goal: ⚡ Dual Execution에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: architecture
  blocks:
  - type: sectionHeader
    title: 🏗️ 아키텍처
    subtitle: 단순함을 위한 설계
  - type: note
    style: info
    title: Scale-Up 철학
    content: 분석에 따르면 95% 이상의 데이터베이스가 1TB 미만이고, 95% 이상의 쿼리가 10GB 미만 데이터를 다룹니다. MotherDuck은 복잡한 분산 시스템 대신
      단일 노드 수직 확장(Scale-Up) 방식을 선택했습니다.
  - type: featureCards
    cards:
    - emoji: 👤
      title: 사용자별 인스턴스
      description: 각 사용자에게 전용 DuckDB 인스턴스
    - emoji: 📏
      title: 수직 확장
      description: 필요에 따라 인스턴스 사이즈 조절
    - emoji: 🎯
      title: 단순한 구조
      description: 분산 시스템의 복잡성 제거
    - emoji: ⚡
      title: 빠른 시작
      description: 콜드 스타트 최소화
  goal: 🏗️ 아키텍처에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: vs_others
  blocks:
  - type: sectionHeader
    title: 🆚 다른 서비스와 비교
    subtitle: 언제 MotherDuck을 선택할까요?
  - type: compare
    left:
      title: 로컬 DuckDB
      subtitle: 내 컴퓨터에서
      icon: 💻
      color: blue
      items:
      - 설치 필요 없음 (pip)
      - 완전 무료
      - 데이터가 로컬에만
      - 내 컴퓨터 성능에 의존
      - 협업 어려움
      infoBox: 개인 분석, 프로토타이핑
    right:
      title: MotherDuck
      subtitle: 클라우드에서
      icon: ☁️
      color: green
      items:
      - 웹 브라우저로 접속
      - 사용한 만큼 과금
      - 클라우드 저장 + 공유
      - 클라우드 리소스 활용
      - 팀 협업 지원
      infoBox: 팀 분석, 대용량 데이터
  - type: table
    headers:
    - 서비스
    - 특징
    - 가격
    rows:
    - - DuckDB (로컬)
      - 무료, 로컬 전용
      - 무료
    - - MotherDuck
      - 서버리스, 하이브리드
      - 초 단위 과금
    - - BigQuery
      - 페타바이트급, GCP 생태계
      - 쿼리당 과금
    - - Snowflake
      - 엔터프라이즈급, 복잡한 기능
      - 웨어하우스 시간당
  goal: 🆚 다른 서비스와 비교에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: pricing
  blocks:
  - type: sectionHeader
    title: 💰 가격 정책
    subtitle: 사용한 만큼만 지불
  - type: note
    style: tip
    title: 무료 플랜 있음!
    content: 신규 가입 시 21일 무료 체험과 함께, 매월 10GB 스토리지 + 10 CU 시간이 무료로 제공됩니다. 개인 프로젝트나 학습에는 무료 플랜으로 충분합니다.
  - type: featureCards
    cards:
    - emoji: 💾
      title: 스토리지
      description: 저장된 압축 데이터 크기 기준
    - emoji: ⚙️
      title: 컴퓨팅
      description: 초 단위 과금, 로컬 실행은 무료
    - emoji: 🤖
      title: AI
      description: SQL Assistant, AI 함수 사용량
    - emoji: 🆓
      title: 무료 항목
      description: 데이터 공유, 클론, 로컬 데이터
  - type: note
    style: info
    title: 비용 절감 사례
    content: Definite는 기존 데이터 웨어하우스에서 MotherDuck으로 전환 후 70% 비용 절감을 달성했습니다. DuckDB의 효율적인 쿼리 엔진과 Scale-Up
      아키텍처 덕분에 타 서비스 대비 10배 저렴한 경우도 있습니다.
  goal: 💰 가격 정책에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: use_cases
  blocks:
  - type: sectionHeader
    title: 🎯 활용 사례
    subtitle: 이런 상황에서 MotherDuck이 빛납니다
  - type: featureCards
    cards:
    - emoji: 👥
      title: 팀 데이터 분석
      description: 분석 결과를 팀원들과 공유
    - emoji: 📊
      title: BI 대시보드
      description: Tableau, PowerBI, Hex 연동
    - emoji: 🔄
      title: ETL 파이프라인
      description: dbt 어댑터로 데이터 변환
    - emoji: 🤖
      title: AI 분석
      description: 자연어로 SQL 쿼리 생성
    - emoji: 📈
      title: 스타트업 분석
      description: 저비용으로 시작, 필요시 확장
    - emoji: 🔗
      title: 하이브리드 분석
      description: 민감 데이터는 로컬, 나머지는 클라우드
  goal: 🎯 활용 사례에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: getting_started
  blocks:
  - type: sectionHeader
    title: 🚀 시작하기
    subtitle: 3분 안에 첫 쿼리 실행
  - type: note
    style: info
    title: 연결 방법
    content: |-
      1. motherduck.com 가입 (Google/GitHub 로그인)
      2. 웹 UI에서 바로 쿼리하거나
      3. 로컬 DuckDB에서 ATTACH 'md:' 실행
  - type: featureCards
    cards:
    - emoji: 🌐
      title: 웹 UI
      description: 브라우저에서 바로 SQL 실행
    - emoji: 🐍
      title: Python
      description: duckdb.connect('md:')로 연결
    - emoji: 💻
      title: CLI
      description: 'duckdb md: 명령으로 접속'
    - emoji: 📊
      title: BI 도구
      description: ODBC/JDBC 드라이버 지원
  goal: 🚀 시작하기에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: ecosystem
  blocks:
  - type: sectionHeader
    title: 🔌 생태계
    subtitle: 다양한 도구와 연동
  - type: featureCards
    cards:
    - emoji: 📊
      title: BI 도구
      description: Tableau, PowerBI, Omni, Hex
    - emoji: 🔄
      title: dbt
      description: DuckDB dbt 어댑터 지원
    - emoji: 🐍
      title: Python
      description: pandas, Polars 연동
    - emoji: 📁
      title: S3
      description: S3 버킷 직접 쿼리
  goal: 🔌 생태계에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: resources
  blocks:
  - type: sectionHeader
    title: 📚 참고 자료
    subtitle: 더 깊이 공부하고 싶다면
  - type: links
    items:
    - text: MotherDuck 공식 사이트
      url: https://motherduck.com/
      icon: 🔗
    - text: MotherDuck 문서
      url: https://motherduck.com/docs/
      icon: 🔗
    - text: MotherDuck 아키텍처
      url: https://motherduck.com/docs/concepts/architecture-and-capabilities/
      icon: 🔗
    - text: MotherDuck 가격
      url: https://motherduck.com/product/pricing/
      icon: 🔗
    - text: MotherDuck 블로그
      url: https://motherduck.com/blog/
      icon: 🔗
  goal: 📚 참고 자료에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: next
  blocks:
  - type: hero
    emoji: 👉
    title: '다음: 기본 SQL 쿼리'
    subtitle: DuckDB로 SELECT, WHERE를 실습해봅니다
  goal: '다음: 기본 SQL 쿼리에서 SQL 조건과 집계 결과가 어떻게 연결되는지 확인한다.'
  why: 쿼리 조건과 결과를 같이 확인해야 리포트나 집계 자동화에서 잘못된 행을 줄일 수 있습니다.
- id: workflow_validation
  title: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트'
  structuredPrimary: true
  subtitle: 예측 → 실행 → SQL 오류 수정 → 결과 검증 → 실무 변주
  goal: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: DuckDB 학습은 쿼리 결과를 눈으로 보는 데서 끝나면 실무로 이어지기 어렵습니다. 작은 로컬 테이블을 만들고, 잘못된 컬럼명을 먼저 실패시킨 뒤, 집계
    결과와 기준 변경 실험을 assert로 고정합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import duckdb

    workflowCon = duckdb.connect()
    workflowCon.sql("""
        CREATE OR REPLACE TABLE lessonOrders AS
        SELECT * FROM (VALUES
            ('A-100', 'paid', 50000, 'web'),
            ('A-101', 'pending', 20000, 'app'),
            ('A-102', 'paid', 120000, 'web'),
            ('A-103', 'cancelled', 15000, 'store'),
            ('A-104', 'paid', 62000, 'app')
        ) AS t(orderId, status, amount, channel)
    """)

    expectedPaidRevenue = 232000
    expectedPaidCount = 3
    rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]

    assert rowCount == 5
    rowCount
  exercise:
    prompt: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import duckdb

      workflowCon = duckdb.connect()
      workflowCon.sql("""
          CREATE OR REPLACE TABLE lessonOrders AS
          SELECT * FROM (VALUES
              ('A-100', 'paid', 50000, 'web'),
              ('A-101', 'pending', 20000, 'app'),
              ('A-102', 'paid', 120000, 'web'),
              ('A-103', 'cancelled', 15000, 'store'),
              ('A-104', 'paid', 62000, 'app')
          ) AS t(orderId, status, amount, channel)
      """)

      expectedPaidRevenue = 232000
      expectedPaidCount = 3
      rowCount = workflowCon.sql("SELECT COUNT(*) FROM lessonOrders").fetchone()[0]

      assert rowCount == 5
      rowCount
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트의 SQL 컬럼, 테이블명, 조건식이 쿼리 엔진에서 해석되어야 합니다.'
    resultCheck: '현업 흐름 검증: 로컬 DuckDB 쿼리 품질 게이트 쿼리 결과의 행 수, 컬럼명, 집계값이 바꾼 SQL 조건을 반영해야 합니다.'
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
  - id: duckdb_00b-remote-secret-boundary-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - intro
    - workflow_validation
    title: MotherDuck 연결 정보와 출력 경계 점검하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 원격 연결 설정에서 token을 출력·쿼리·로그로 내보내지 않고 허용 필드만 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - secret 존재 여부만 확인하고 실제 값은 반환하지 마세요.
    - 로그 allowlist와 secret denylist를 함께 적용하세요.
    exercise:
      prompt: audit_remote_config(config, log_fields)를 완성해 ready, exposed, safeLog를 반환하세요.
      starterCode: |-
        def audit_remote_config(config, log_fields):
            raise NotImplementedError
      solution: |
        def audit_remote_config(config, log_fields):
            secret_names = {"token", "password", "api_key"}
            exposed = sorted(set(log_fields) & secret_names)
            safe_log = {name: config.get(name) for name in log_fields if name in config and name not in secret_names}
            ready = bool(config.get("database")) and bool(config.get("token")) and not exposed
            return {"ready": ready, "exposed": exposed, "safeLog": safe_log}
      hints: *id001
    check:
      id: python.duckdb.duckdb_00b.remote-secret-boundary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_00b.remote-secret-boundary.mastery.behavior.v1.fixture
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
        entry: audit_remote_config
        cases:
        - id: accepts-secret-outside-log
          arguments:
          - value:
              database: learn
              token: secret
              region: kr
          - value:
            - database
            - region
          expectedReturn:
            ready: true
            exposed: []
            safeLog:
              database: learn
              region: kr
        - id: blocks-token-log
          arguments:
          - value:
              database: learn
              token: secret
          - value:
            - database
            - token
          expectedReturn:
            ready: false
            exposed:
            - token
            safeLog:
              database: learn
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: duckdb_00b-remote-sync-budget-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_00b-remote-secret-boundary-mastery
    title: 새 원격 분석 작업의 전송 예산 세우기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 원격 실행 경계를 업로드 byte, 결과 byte, 반복 횟수의 총 전송량과 cache 판단으로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 업로드는 한 번, 결과 다운로드는 실행 횟수만큼 계산하세요.
    - 반복 실행에서는 immutable 입력을 cache할 수 있습니다.
    exercise:
      prompt: plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes)를 완성하세요.
      starterCode: |-
        def plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes):
            raise NotImplementedError
      solution: |
        def plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes):
            values = [upload_bytes, result_bytes, runs, budget_bytes]
            if any(value < 0 for value in values):
                raise ValueError("negative budget input")
            total = upload_bytes + result_bytes * runs
            return {"totalBytes": total, "withinBudget": total <= budget_bytes, "cacheUpload": runs > 1 and upload_bytes > 0}
      hints: *id002
    check:
      id: python.duckdb.duckdb_00b.remote-sync-budget.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_00b.remote-sync-budget.transfer.behavior.v1.fixture
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
        entry: plan_remote_sync
        cases:
        - id: reuses-upload-across-runs
          arguments:
          - value: 1000
          - value: 100
          - value: 3
          - value: 1500
          expectedReturn:
            totalBytes: 1300
            withinBudget: true
            cacheUpload: true
        - id: detects-over-budget
          arguments:
          - value: 0
          - value: 800
          - value: 2
          - value: 1000
          expectedReturn:
            totalBytes: 1600
            withinBudget: false
            cacheUpload: false
        - id: rejects-negative-byte
          arguments:
          - value: -1
          - value: 0
          - value: 1
          - value: 10
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: duckdb_00b-remote-boundary-choice-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - duckdb_00b-remote-sync-budget-transfer
    title: 원격 분석의 보안·비용 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 비밀값, 대용량 결과, 오프라인 재현 상황의 정책을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 비밀값은 코드와 학습 결과에 포함하지 마세요.
    - 원격에서는 원본보다 집계 결과를 이동하세요.
    exercise:
      prompt: choose_remote_boundary(situation)를 완성해 policy, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_remote_boundary(situation):
            raise NotImplementedError
      solution: |
        def choose_remote_boundary(situation):
            table = {'credential-config': {'policy': 'environment secret', 'evidence': 'redacted config audit', 'risk': 'token disclosure'}, 'large-result': {'policy': 'aggregate remotely', 'evidence': 'result byte estimate', 'risk': 'egress cost'}, 'offline-reproduction': {'policy': 'local snapshot', 'evidence': 'content hash', 'risk': 'stale data'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.duckdb.duckdb_00b.remote-boundary-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.duckdb.duckdb_00b.remote-boundary-choice.retrieval.behavior.v1.fixture
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
        entry: choose_remote_boundary
        cases:
        - id: recalls-credential-config
          arguments:
          - value: credential-config
          expectedReturn:
            policy: environment secret
            evidence: redacted config audit
            risk: token disclosure
        - id: recalls-large-result
          arguments:
          - value: large-result
          expectedReturn:
            policy: aggregate remotely
            evidence: result byte estimate
            risk: egress cost
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};