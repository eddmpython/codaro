var e=`meta:
  id: requests_00
  title: requests 자동화 소개
  order: 0
  category: requests
  packages:
    - requests
    - httpx
  tags:
    - requests
    - REST
    - API
    - JSON
    - 자동화
  outcomes:
    - automation.webApi.intro
  prerequisites:
    - python.functions
    - python.modulesAndIo
  estimatedMinutes: 30
  seo:
    title: "requests 자동화 소개 - REST API로 일일 데이터 수집 파이프라인"
    description: "requests 한 패키지로 외부 API 호출·인증·페이지네이션·파일 전송을 다루고 마지막에 httpx async로 병렬을 확장한다. 10개 프로젝트로 주간 8시간 절감 목표."
    keywords:
      - requests
      - REST API
      - JSON
      - 페이지네이션
      - httpx async

intro:
  direction: "외부 API에서 매일 받아야 하는 데이터를 requests 한 패키지로 자동 수집·결합·통보한다. 마지막 한 강의만 httpx로 비동기·병렬을 다룬다."
  benefits:
    - "주간 8시간 이상 절감 - 미세먼지·환율·외부 검색·Slack 알림·페이지네이션 수집."
    - "10개 프로젝트로 GET·POST·헤더·세션·페이지네이션·스트리밍·비동기까지 한 트랙에서 끝낸다."
    - "안전 정책 4종(환경변수, timeout, sandbox URL, dryRun)이 모든 강의 첫 셀에 의무로 들어가 학습 중 사고를 사전 차단."
  diagram:
    steps:
      - label: "1. GET·params·headers"
        detail: "requests.get으로 공공 API 단발 호출 → params로 쿼리 → headers로 API 키 주입."
      - label: "2. POST와 알림"
        detail: "requests.post + json=으로 Slack 같은 webhook 호출. dryRun 안전 패턴."
      - label: "3. 안전·세션·페이지네이션"
        detail: "timeout + Retry, Session으로 로그인 흐름, generator로 페이지 전체 수집."
      - label: "4. 파일·async 통합"
        detail: "stream으로 대용량 다운로드 → httpx로 100 URL 병렬 → 일일 수집기 한 본."
    runtime:
      - label: "메인 의존성"
        detail: "requests 한 패키지. 09강에서만 httpx, 07·10강에서 pandas 결합."
      - label: "안전 검증"
        detail: "공공 sample 또는 httpbin.org로 동작 확인 후 응답 객체 단위 assert로 검증한다. 부수효과 호출은 dryRun=True 기본."

sections:
  - id: runtime_check
    title: "라이브러리 실행 확인"
    structuredPrimary: true
    subtitle: "requests와 httpx import 확인"
    goal: "requests와 httpx를 import하고 버전 문자열을 확인해 현재 로컬 Python에서 웹 요청 도구를 바로 쓸 수 있는지 검증한다."
    why: "실제 네트워크 호출 전에 패키지와 객체를 먼저 확인하면 API 오류와 환경 오류를 분리할 수 있습니다."
    explanation: "상단 라이브러리 패널이 requests, httpx 준비 상태를 확인하고, 이 셀은 두 패키지가 코드에서 import되는지와 기본 메타데이터가 읽히는지 검증합니다."
    tips:
      - "첫 셀에서는 외부 사이트 호출보다 import와 버전 확인을 먼저 고정합니다."
      - "버전 문자열을 dict로 묶어두면 이후 진단 로그에도 그대로 재사용할 수 있습니다."
    snippet: |-
      import httpx
      import requests

      versions = {
          "requests": requests.__version__,
          "httpx": httpx.__version__,
      }

      assert all(versions.values())
      print(versions)
    exercise:
      prompt: versions dict에 두 패키지의 major 버전을 추가하고, 값이 비어 있지 않은지 assert로 확인하세요.
      starterCode: |-
        import httpx
        import requests

        versions = {
            "requests": requests.__version__,
            "httpx": httpx.__version__,
        }
        major_versions = {name: value.split(".")[0] for name, value in versions.items()}

        assert all(major_versions.values())
        print(major_versions)
      solution: |-
        import httpx
        import requests

        versions = {
            "requests": requests.__version__,
            "httpx": httpx.__version__,
        }
        major_versions = {name: value.split(".")[0] for name, value in versions.items()}

        assert all(major_versions.values())
        print(major_versions)
      hints:
      - "__version__은 패키지가 제공하는 버전 문자열입니다."
      - "split('.')의 첫 값은 major 버전입니다."
    check:
      type: noError
      noError: "requests와 httpx import, 버전 dict 생성, assert가 오류 없이 끝나야 합니다."
      resultCheck: "출력에 requests와 httpx의 major 버전이 모두 포함되어야 합니다."
  - id: position
    title: "1. 웹 API 자동화가 차지하는 자리"
    blocks:
      - type: text
        content: |-
          한국 직장인의 반복 데이터 작업은 대부분 "매일 어딘가에서 받아 어딘가에 넣는" 흐름입니다. 공공데이터포털에서 미세먼지를 받아 보고서에 붙이고, 환율 사이트에서 숫자를 받아 사내 게시판에 옮기고, 마케팅 결과를 Naver Open API로 점검하는 일이 모두 손작업이라면 주간 8시간 이상이 빠집니다. requests 한 패키지로 이 시간을 거의 0초에 가깝게 만들 수 있습니다.
      - type: text
        content: |-
          이 트랙은 한 패키지 정책을 가집니다. 메인은 requests, 마지막 한 강의(09)만 httpx로 비동기를 다룹니다. 한국 자료와 실무 트러블슈팅 사례가 모두 requests 어휘 기준으로 쌓여 있어 학습 효율이 가장 큽니다. async는 데이터 수집의 천장이 보일 때만 필요하므로 한 번만 노출합니다.
      - type: text
        content: |-
          안전 정책 네 가지가 모든 강의 첫 셀에 의무로 들어갑니다. 환경변수 자격증명, timeout 의무, sandbox/예제 URL 우선, dryRun 일관성입니다. 학습 중 100번 호출로 외부 API에 차단당하거나, 잘못된 webhook에 메시지가 폭주하는 사고를 원천 차단합니다.

  - id: library_map
    title: "2. 한 패키지의 자리"
    blocks:
      - type: table
        headers: ["모듈/객체", "역할", "사용 강의"]
        rows:
          - ["requests.get / requests.post", "단발 호출", "01·02·03·04"]
          - ["requests.Session", "쿠키·헤더·커넥션 풀 유지", "06·07·10"]
          - ["Response.json() / .text / .content / .iter_content", "응답 파싱", "01-08"]
          - ["requests.exceptions + urllib3 Retry", "에러 처리", "05·10"]
          - ["httpx.AsyncClient + asyncio.gather", "비동기 병렬", "09"]
          - ["os.environ + dryRun 가드", "자격증명·안전 패턴", "03 이후 공통"]
      - type: note
        title: "왜 urllib·aiohttp·requests-html을 쓰지 않나"
        content: "urllib는 표준이지만 JSON·세션·헤더에 보일러플레이트가 폭증해 학습 효율이 떨어집니다. aiohttp는 비동기 전용이라 학습 곡선이 가팔라 단 한 강의(09) 노출에 부적합 - 동일 API 모양의 httpx가 requests 사용자에게 이전 비용이 가장 낮습니다. requests-html은 메인터넌스 정체로 권장하지 않습니다."

  - id: persona_match
    title: "3. 누가 어느 강의에서 답을 얻나"
    blocks:
      - type: text
        content: |-
          네 페르소나를 기준으로 강의가 설계됐습니다. 본인 업무와 가까운 곳부터 우선 가져갈 수 있습니다.
      - type: table
        headers: ["페르소나", "주간 API 작업", "이 트랙 졸업 시 산출물"]
        rows:
          - ["데이터 분석 김주임", "매일 공공데이터포털에서 미세먼지·기상 조회 → 엑셀 정리 (40분/일)", "01·07·10강 - 페이지네이션 자동 수집 + DataFrame 저장"]
          - ["운영 박대리", "매일 환율 사이트 보고 사내 게시판에 옮김 (15분/일)", "02·05강 - 환율 API + 안전 호출 + 로컬 캐시"]
          - ["마케팅 정주임", "캠페인 결과를 Naver/Kakao Open API로 점검 (회당 30분)", "03·08강 - 헤더 인증 + 이미지 일괄 다운로드"]
          - ["DevOps 박과장", "배치 결과를 Slack에 수동 통보 (장애당 10분)", "04·05강 - POST 호출 + 재시도 가드"]

  - id: capability_map
    title: "4. 10개 프로젝트로 다루는 능력"
    blocks:
      - type: table
        headers: ["프로젝트", "핵심 능력", "산출물"]
        rows:
          - ["01 첫 GET 요청", "requests.get, status_code, .json()", "공공 API 미세먼지 현황 조회"]
          - ["02 쿼리 파라미터와 환율", "params=, URL 인코딩, 응답 캐시", "매일 환율 표"]
          - ["03 헤더와 API 키", "headers=, os.environ, User-Agent", "Naver 검색 결과 표"]
          - ["04 POST와 JSON 전송", "requests.post, json= vs data=", "Slack 알림 봇"]
          - ["05 에러 처리·재시도", "timeout, raise_for_status, Retry", "안전 호출 헬퍼"]
          - ["06 Session과 로그인", "Session, cookies, 헤더 persist", "인증 후 데이터 수집"]
          - ["07 페이지네이션 수집", "cursor/offset, Link 헤더, generator", "GitHub repo 전체 issue"]
          - ["08 파일 업·다운과 스트리밍", "files=, stream=, iter_content", "이미지 일괄 다운로드"]
          - ["09 httpx 비동기 병렬", "AsyncClient, gather, Semaphore", "100 URL 병렬 조회"]
          - ["10 매일 공공 API 수집기", "전 개념 종합", "3 API → DataFrame → 차트 → 저장·통보"]

  - id: safety_policy
    title: "5. 트랙 전체에 적용되는 안전 정책"
    blocks:
      - type: text
        content: |-
          웹 API 자동화는 두 가지 사고 비용이 큽니다. 자격증명 노출(코드에 평문 키)과 과도한 호출(rate limit 위반으로 IP/계정 차단). 다음 네 가지가 모든 강의 첫 셀에 의무로 들어갑니다.
      - type: list
        style: check
        items:
          - "자격증명은 환경변수만 - 코드에 평문 API 키 금지. os.environ['NAVER_CLIENT_ID']."
          - "timeout 의무화 - 모든 호출에 timeout=10 이상. 무한 대기로 스크립트가 영구 정지되는 사고 차단."
          - "sandbox/예제 URL 우선 - httpbin.org, 공공 sample, GitHub public API로 동작 확인 후 실 API."
          - "dryRun 일관성 - POST/PUT/DELETE 같은 부수효과 호출은 기본 dryRun=True. 실 호출은 명시적으로 dryRun=False."
      - type: note
        title: "공공데이터포털 인증키 발급 절차"
        content: "data.go.kr 회원가입 → 원하는 API 페이지에서 '활용신청' → 일반 인증키(Encoding) / 일반 인증키(Decoding) 두 종류 발급. URL에 그대로 붙이려면 Encoding, params= 키워드로 넘기려면 Decoding을 권장합니다. 환경변수 DATA_GO_KR_KEY에 저장하고 코드는 os.environ으로 읽습니다."

  - id: contract
    title: "6. 학습 계약"
    blocks:
      - type: list
        style: bullet
        items:
          - "모든 부수효과 호출(POST/PUT/DELETE)은 dryRun=True 기본값. 실 호출은 dryRun=False 명시 필요."
          - "01-08강은 응답 객체 단위 assert로 검증. 공공 GET은 실제 호출, POST/인증 API는 httpbin.org 또는 mock 응답으로 검증."
          - "09강은 httpbin.org/delay 엔드포인트로 async 효과를 시각화."
          - "10강은 3 API 결합 + 캐시 폴백 패턴 검증."
          - "환경변수 미설정 시 sample 응답으로 폴백해 학습이 끊기지 않게 한다."
      - type: tip
        content: "본 트랙을 시작하기 전에 Naver Open API와 Slack incoming webhook(또는 카카오워크/잔디)을 미리 발급해 환경변수에 저장해 두세요. 03·04강의 실제 호출 검증이 즉시 가능해집니다."
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
  - id: requests_00-http-request-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - runtime_check
    - contract
    title: HTTP 요청의 method·origin·timeout 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 실제 호출 전에 허용 origin, timeout, body 정책이 빠진 요청을 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 호출 함수보다 먼저 method·origin·timeout을 데이터 계약으로 만드세요.
    - GET query와 JSON body를 혼용하지 말고 API 계약에 맞게 구분하세요.
    exercise:
      prompt: audit_request_contract(request, allowed_origins)를 완성하세요.
      starterCode: |-
        def audit_request_contract(request, allowed_origins):
            raise NotImplementedError
      solution: |
        def audit_request_contract(request, allowed_origins):
            from urllib.parse import urlsplit
            required = {"method", "url", "timeoutSeconds"}
            missing = sorted(required - set(request))
            failures = []
            if request.get("method") not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                failures.append("method")
            parts = urlsplit(request.get("url", ""))
            origin = f"{parts.scheme}://{parts.netloc}" if parts.scheme and parts.netloc else ""
            if origin not in allowed_origins:
                failures.append("origin")
            if request.get("timeoutSeconds", 0) <= 0:
                failures.append("timeout")
            if request.get("method") in {"GET", "DELETE"} and request.get("json") is not None:
                failures.append("body-policy")
            return {"ready": not missing and not failures, "missing": missing, "failures": failures, "origin": origin}
      hints: *id001
    check:
      id: python.requests.requests_00.http-request-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.requests.requests_00.http-request-contract.mastery.behavior.v1.fixture
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
        entry: audit_request_contract
        cases:
        - id: accepts-bounded-get
          arguments:
          - value:
              method: GET
              url: https://api.example.test/items
              timeoutSeconds: 5
          - value:
            - https://api.example.test
          expectedReturn:
            ready: true
            missing: []
            failures: []
            origin: https://api.example.test
        - id: reports-origin-timeout-and-body
          arguments:
          - value:
              method: GET
              url: https://other.test/items
              timeoutSeconds: 0
              json:
                q: 1
          - value:
            - https://api.example.test
          expectedReturn:
            ready: false
            missing: []
            failures:
            - origin
            - timeout
            - body-policy
            origin: https://other.test
        - id: reports-missing-contract
          arguments:
          - value:
              url: not-a-url
          - value: []
          expectedReturn:
            ready: false
            missing:
            - method
            - timeoutSeconds
            failures:
            - method
            - origin
            - timeout
            origin: ''
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: requests_00-request-safety-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - requests_00-http-request-contract-mastery
    title: 새 API 작업에 재시도·idempotency 계획 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: method와 idempotency key 유무로 자동 재시도 가능 여부를 판정한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 모든 네트워크 오류를 같은 방식으로 재시도하지 마세요.
    - 상태 변경 요청은 dry run과 request identity를 먼저 확보하세요.
    exercise:
      prompt: plan_request_safety(request, maximum_attempts)를 완성하세요.
      starterCode: |-
        def plan_request_safety(request, maximum_attempts):
            raise NotImplementedError
      solution: |
        def plan_request_safety(request, maximum_attempts):
            if maximum_attempts <= 0:
                raise ValueError("attempt count must be positive")
            method = request["method"]
            inherently_safe = method in {"GET", "HEAD", "OPTIONS"}
            idempotent = inherently_safe or method in {"PUT", "DELETE"} or bool(request.get("idempotencyKey"))
            attempts = maximum_attempts if idempotent else 1
            return {
                "idempotent": idempotent,
                "attempts": attempts,
                "requiresDryRun": method in {"POST", "PATCH", "DELETE"},
                "evidence": ["request identity", "attempt log", "final response"],
            }
      hints: *id002
    check:
      id: python.requests.requests_00.request-safety-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.requests.requests_00.request-safety-plan.transfer.behavior.v1.fixture
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
        entry: plan_request_safety
        cases:
        - id: allows-get-retries
          arguments:
          - value:
              method: GET
          - value: 3
          expectedReturn:
            idempotent: true
            attempts: 3
            requiresDryRun: false
            evidence:
            - request identity
            - attempt log
            - final response
        - id: limits-unkeyed-post
          arguments:
          - value:
              method: POST
          - value: 4
          expectedReturn:
            idempotent: false
            attempts: 1
            requiresDryRun: true
            evidence:
            - request identity
            - attempt log
            - final response
        - id: allows-keyed-post-retries
          arguments:
          - value:
              method: POST
              idempotencyKey: job-42
          - value: 2
          expectedReturn:
            idempotent: true
            attempts: 2
            requiresDryRun: true
            evidence:
            - request identity
            - attempt log
            - final response
        - id: rejects-zero-attempts
          arguments:
          - value:
              method: GET
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: requests_00-requests-foundation-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - requests_00-request-safety-plan-transfer
    title: requests 기본 안전 계약 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 읽기·생성·삭제 요청의 timeout과 재시도 경계를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - HTTP 성공과 업무 데이터의 유효성을 별도 근거로 판정하세요.
    - 요청 action과 함께 재현 가능한 evidence와 남는 risk를 기록하세요.
    exercise:
      prompt: choose_request_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_request_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_request_policy(situation):
            table = {'read': {'action': 'bounded GET with retry', 'evidence': 'status headers parsed body', 'risk': 'stale cache'}, 'create': {'action': 'POST with idempotency key', 'evidence': 'request identity and created resource', 'risk': 'duplicate mutation'}, 'delete': {'action': 'dry run then allowlisted DELETE', 'evidence': 'target before and response after', 'risk': 'irreversible loss'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.requests.requests_00.requests-foundation-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.requests.requests_00.requests-foundation-recall.retrieval.behavior.v1.fixture
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
        entry: choose_request_policy
        cases:
        - id: recalls-read
          arguments:
          - value: read
          expectedReturn:
            action: bounded GET with retry
            evidence: status headers parsed body
            risk: stale cache
        - id: recalls-create
          arguments:
          - value: create
          expectedReturn:
            action: POST with idempotency key
            evidence: request identity and created resource
            risk: duplicate mutation
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};