var e=`meta:
  id: 21_urllib
  title: urllib - URL 구조와 쿼리 처리
  category: builtins
  tags:
  - urllib
  - urlparse
  - urlencode
  - urljoin
  - percent-encoding
  description: 네트워크 성공에 기대지 않고 URL 파싱, 조합, 인코딩, 검증을 다루는 urllib.parse 학습
  keywords:
  - urllib
  - urllib.parse
  - URL
  - query string
  - callback
intro:
  emoji: 🌐
  points:
  - URL을 scheme, host, path, query로 분해하기
  - query string을 dict와 list 값에서 안정적으로 만들기
  - 상대 route와 percent encoding을 안전하게 처리하기
  - callback URL을 검증해 누락된 필드를 예외로 막기
  direction: urllib.parse로 URL 입력을 구조화하고, 웹과 로컬에서 같은 결과가 나는 검증 가능한 처리 흐름을 만듭니다.
  benefits:
  - 외부 네트워크 상태와 무관하게 브라우저에서도 바로 실행할 수 있습니다.
  - URL을 문자열 더하기가 아니라 표준 파서 결과로 판단하는 습관을 만듭니다.
  - 학습 URL, 리포트 URL, 인증 callback 같은 실무 입력을 강한 검증으로 확인합니다.
  diagram:
    steps:
    - label: URL 입력 고정
      detail: 학습할 URL 예시와 필요한 필드를 먼저 정합니다.
    - label: 구조 분해와 쿼리 해석
      detail: urlparse와 parse_qs로 문자열을 안정적인 dict로 바꿉니다.
    - label: URL 재조합
      detail: urljoin, quote, urlencode로 route와 query를 다시 만듭니다.
    - label: 검증 가능한 함수화
      detail: 잘못된 scheme, 누락된 query, raw space를 예외와 반환값으로 확인합니다.
    runtime:
    - label: 브라우저 Python
      detail: 네트워크 호출 없이 urllib.parse만 사용해 Web Run에서 실행합니다.
    - label: 강한 검증
      detail: 같은 solution을 격리 Worker에서 다시 실행해 반환값과 예외를 확인합니다.
    - label: 실무 전이
      detail: 리포트 링크, tracking URL, callback URL로 입력 조건을 바꿔 봅니다.
sections:
- id: module_import
  title: urllib.parse 불러오기
  structuredPrimary: true
  subtitle: URL 도구만 가볍게 가져오기
  goal: urllib.parse에서 사용할 함수 이름을 직접 import하고 즉시 확인한다.
  why: URL 학습은 네트워크 요청보다 파싱과 인코딩이 먼저입니다. 필요한 하위 모듈만 가져오면 웹에서도 재현 가능한 실습이 됩니다.
  explanation: |-
    urllib은 표준 라이브러리 패키지이고, 이 레슨에서는 그중 urllib.parse를 사용합니다. urllib.parse는 URL을 분해하고, query string을 만들고, percent encoding을 처리합니다.

    외부 사이트를 열지 않아도 URL 처리 감각을 충분히 익힐 수 있습니다. 먼저 import한 함수 이름과 작은 샘플 URL을 확인합니다.
  snippet: |-
    from urllib.parse import urlencode, urlparse

    sampleUrl = "https://learn.codaro.dev/course/python?lesson=urllib"
    loadedNames = sorted(name for name in ("urlparse", "urlencode") if name in globals())
    parsed = urlparse(sampleUrl)
    (loadedNames, parsed.netloc)
  exercise:
    prompt: sampleUrl의 host나 query 값을 바꾸고 parsed.netloc 또는 parsed.query가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from urllib.parse import urlencode, urlparse

      sampleUrl = "https://learn.codaro.dev/course/python?lesson=urllib"
      loadedNames = sorted(name for name in ("urlparse", "urlencode") if name in globals())
      parsed = urlparse(sampleUrl)
      (loadedNames, parsed.netloc)
    hints:
    - URL 문자열의 \`learn.codaro.dev\` 부분을 다른 host로 바꿔 보세요.
    - 마지막 줄을 \`(parsed.scheme, parsed.path, parsed.query)\`로 바꾸면 URL 구조를 더 잘 볼 수 있습니다.
  check:
    type: noError
    noError: urllib.parse import와 sampleUrl 파싱 코드가 SyntaxError 없이 실행되어야 합니다.
    resultCheck: 실행 결과가 바꾼 URL의 host, path, query 중 하나를 실제로 반영해야 합니다.
- id: url_parsing
  title: URL 구조 분해
  structuredPrimary: true
  subtitle: scheme, host, path, query
  goal: urlparse 결과에서 URL의 주요 필드를 뽑아 dict로 정리한다.
  why: URL을 문자열 조각으로 자르면 \`?\`, \`#\`, port, 빈 path 같은 경우에서 쉽게 틀립니다. 표준 파서 결과를 기준으로 판단해야 합니다.
  explanation: |-
    urlparse(url)는 scheme, netloc, path, params, query, fragment를 가진 ParseResult를 반환합니다. 이 객체를 바로 dict로 옮기면 검증과 화면 표시가 쉬워집니다.

    실무에서는 host만 믿지 말고 scheme과 path까지 함께 확인해야 합니다. 같은 host라도 http와 https는 다른 보안 조건을 갖습니다.
  snippet: |-
    from urllib.parse import urlparse

    url = "https://shop.example.com:443/orders/view?id=A100#summary"
    parsed = urlparse(url)
    parts = {
        "scheme": parsed.scheme,
        "host": parsed.hostname,
        "port": parsed.port,
        "path": parsed.path,
        "query": parsed.query,
        "fragment": parsed.fragment,
    }
    parts
  exercise:
    prompt: url의 fragment나 port를 바꾸고 parts dict에서 어떤 필드가 달라지는지 확인하세요.
    starterCode: |-
      from urllib.parse import urlparse

      url = "https://shop.example.com:443/orders/view?id=A100#summary"
      parsed = urlparse(url)
      parts = {
          "scheme": parsed.scheme,
          "host": parsed.hostname,
          "port": parsed.port,
          "path": parsed.path,
          "query": parsed.query,
          "fragment": parsed.fragment,
      }
      parts
    hints:
    - "\`#summary\`를 \`#items\`로 바꾸면 fragment만 달라집니다."
    - "\`https://\`를 \`http://\`로 바꾸면 scheme 검증이 왜 필요한지 보입니다."
  check:
    type: noError
    noError: urlparse 결과를 dict로 만드는 코드가 SyntaxError와 AttributeError 없이 실행되어야 합니다.
    resultCheck: parts dict가 입력 URL의 scheme, host, path, query, fragment를 실제 값으로 담아야 합니다.
- id: query_strings
  title: 쿼리 문자열 왕복
  structuredPrimary: true
  subtitle: urlencode와 parse_qs
  goal: dict와 list 값을 query string으로 만들고 다시 parse_qs로 복원한다.
  why: 검색, 필터, tracking URL은 query string에 상태를 담습니다. list 값과 공백 인코딩까지 다루면 문자열 더하기보다 훨씬 안전합니다.
  explanation: |-
    urlencode(params, doseq=True)는 list 값을 같은 key의 여러 항목으로 펼칩니다. parse_qs(query)는 같은 key로 들어온 값들을 list로 복원합니다.

    이 흐름을 익히면 \`tags=web+run&tags=strong+check\`처럼 반복 key가 있는 URL도 잃지 않고 처리할 수 있습니다.
  snippet: |-
    from urllib.parse import parse_qs, urlencode

    params = {
        "lesson": "urllib",
        "tags": ["web run", "strong check"],
        "page": 2,
    }
    queryString = urlencode(params, doseq=True)
    restored = parse_qs(queryString)
    (queryString, restored["tags"])
  exercise:
    prompt: tags에 새 값을 하나 추가하고 queryString과 restored["tags"]가 모두 늘어나는지 확인하세요.
    starterCode: |-
      from urllib.parse import parse_qs, urlencode

      params = {
          "lesson": "urllib",
          "tags": ["web run", "strong check"],
          "page": 2,
      }
      queryString = urlencode(params, doseq=True)
      restored = parse_qs(queryString)
      (queryString, restored["tags"])
    hints:
    - list 값을 query로 펼치려면 \`doseq=True\`가 필요합니다.
    - 공백은 query string에서 \`+\`로 보일 수 있지만 parse_qs가 다시 공백으로 복원합니다.
  check:
    type: noError
    noError: queryString과 restored 변수가 만들어지고 restored["tags"] 조회가 KeyError를 내지 않아야 합니다.
    resultCheck: restored dict가 params의 lesson, tags, page 값을 query string에서 복원해야 합니다.
- id: route_joining
  title: 상대 route 결합
  structuredPrimary: true
  subtitle: urljoin으로 기준 URL 붙이기
  goal: base URL과 상대 route를 결합하고 결과 host와 path를 검증한다.
  why: 화면 이동이나 리포트 링크를 만들 때 \`base + path\`로 붙이면 슬래시 하나 때문에 다른 주소가 됩니다. urljoin으로 기준을 명확히 잡아야 합니다.
  explanation: |-
    urljoin(base, relative)는 브라우저가 링크를 해석하는 방식과 비슷하게 상대 URL을 절대 URL로 바꿉니다. base가 \`/app/\`처럼 슬래시로 끝나는지에 따라 결과가 달라질 수 있습니다.

    결합 뒤에는 host가 의도한 도메인인지, path가 예상한 prefix 아래인지 확인합니다.
  snippet: |-
    from urllib.parse import urljoin, urlparse

    baseUrl = "https://learn.codaro.dev/app/"
    relativePath = "courses/python/builtins/21_urllib?view=practice"
    targetUrl = urljoin(baseUrl, relativePath)
    parsed = urlparse(targetUrl)
    isLearningRoute = parsed.netloc == "learn.codaro.dev" and parsed.path.startswith("/app/courses/")
    (targetUrl, isLearningRoute)
  exercise:
    prompt: relativePath를 다른 course 경로로 바꾸고 isLearningRoute가 어떤 조건에서 유지되는지 확인하세요.
    starterCode: |-
      from urllib.parse import urljoin, urlparse

      baseUrl = "https://learn.codaro.dev/app/"
      relativePath = "courses/python/builtins/21_urllib?view=practice"
      targetUrl = urljoin(baseUrl, relativePath)
      parsed = urlparse(targetUrl)
      isLearningRoute = parsed.netloc == "learn.codaro.dev" and parsed.path.startswith("/app/courses/")
      (targetUrl, isLearningRoute)
    hints:
    - relativePath를 \`/courses/...\`처럼 슬래시로 시작하면 base의 \`/app/\`이 사라질 수 있습니다.
    - route 검증은 netloc과 path prefix를 같이 확인하세요.
  check:
    type: noError
    noError: targetUrl, parsed, isLearningRoute 변수가 만들어지고 ParseResult의 netloc과 path 접근이 AttributeError를 내지 않아야 합니다.
    resultCheck: isLearningRoute가 host와 path prefix 검증 결과를 실제 boolean으로 보여야 합니다.
- id: percent_encoding
  title: Percent encoding
  structuredPrimary: true
  subtitle: quote와 unquote
  goal: 공백, 한글, 슬래시가 섞인 path 조각을 URL에 안전한 문자열로 바꾸고 복원한다.
  why: URL path에 raw space나 한글을 그대로 붙이면 환경마다 다르게 처리될 수 있습니다. 표시용 문자열과 URL용 문자열을 분리해야 합니다.
  explanation: |-
    quote(text, safe="/")는 URL path에서 허용할 문자를 제외하고 percent encoding합니다. unquote(encoded)는 다시 사람이 읽는 문자열로 복원합니다.

    query string에서는 urlencode가 인코딩을 맡고, path 조각에서는 quote를 명시적으로 쓰는 방식이 읽기 쉽습니다.
  snippet: |-
    from urllib.parse import quote, unquote

    reportPath = "reports/주간 학습 요약"
    encodedPath = quote(reportPath, safe="/")
    restoredPath = unquote(encodedPath)
    {
        "encoded": encodedPath,
        "restored": restoredPath,
        "hasRawSpace": " " in encodedPath,
    }
  exercise:
    prompt: reportPath에 다른 한글 폴더명이나 공백을 넣고 encodedPath가 raw space 없이 만들어지는지 확인하세요.
    starterCode: |-
      from urllib.parse import quote, unquote

      reportPath = "reports/주간 학습 요약"
      encodedPath = quote(reportPath, safe="/")
      restoredPath = unquote(encodedPath)
      {
          "encoded": encodedPath,
          "restored": restoredPath,
          "hasRawSpace": " " in encodedPath,
      }
    hints:
    - "\`safe=\\"/\\"\`를 빼면 슬래시도 \`%2F\`로 인코딩됩니다."
    - URL에 넣을 값과 화면에 표시할 값을 같은 문자열로 취급하지 마세요.
  check:
    type: noError
    noError: encodedPath와 restoredPath가 만들어지고 quote/unquote 호출 인자가 TypeError를 내지 않아야 합니다.
    resultCheck: encodedPath에는 raw space가 없어야 하고 restoredPath는 원래 reportPath와 같아야 합니다.
- id: workflow_validation
  title: '검증 루프: Tracking URL 검사'
  structuredPrimary: true
  subtitle: parse_qs와 예외 정책
  goal: tracking URL을 함수로 검사해 campaign, amount, cache key를 반환하고 잘못된 URL은 예외로 막는다.
  why: URL 처리도 입력 검증이 빠지면 학습이 약해집니다. scheme, host, 필수 query를 한 함수 안에서 확인해야 실무 코드로 옮길 수 있습니다.
  explanation: |-
    이번 검증 루프는 URL을 열지 않습니다. 대신 URL 문자열을 구조화하고, 필요한 query 값을 읽고, 잘못된 상대 URL은 ValueError로 막습니다.

    실무 변주: \`utm_campaign\`, \`amount\`, \`id\`처럼 필수 필드를 나눠 보고 누락된 값마다 다른 오류 메시지를 반환하도록 확장해 보세요.
  snippet: |-
    from urllib.parse import parse_qs, urlparse

    def summarizeTrackingUrl(url):
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("absolute http url required")
        query = parse_qs(parsed.query, keep_blank_values=True)
        return {
            "host": parsed.netloc,
            "path": parsed.path,
            "campaign": query.get("utm_campaign", [""])[0],
            "amountCount": len(query.get("amount", [])),
            "cacheKey": f"{parsed.netloc}{parsed.path}",
        }

    summary = summarizeTrackingUrl("https://shop.example.com/orders?id=A100&utm_campaign=winter&amount=12000&amount=13000")
    assert summary["amountCount"] == 2
    summary
  exercise:
    prompt: summarizeTrackingUrl에 필수 query를 하나 더 추가하고 누락된 URL에서 ValueError가 나도록 바꿔 보세요.
    starterCode: |-
      from urllib.parse import parse_qs, urlparse

      def summarizeTrackingUrl(url):
          parsed = urlparse(url)
          if parsed.scheme not in {"http", "https"} or not parsed.netloc:
              raise ValueError("absolute http url required")
          query = parse_qs(parsed.query, keep_blank_values=True)
          return {
              "host": parsed.netloc,
              "path": parsed.path,
              "campaign": query.get("utm_campaign", [""])[0],
              "amountCount": len(query.get("amount", [])),
              "cacheKey": f"{parsed.netloc}{parsed.path}",
          }

      summary = summarizeTrackingUrl("https://shop.example.com/orders?id=A100&utm_campaign=winter&amount=12000&amount=13000")
      assert summary["amountCount"] == 2
      summary
    hints:
    - 필수 query를 확인할 때는 \`if not query.get("id"):\`처럼 빈 list도 같이 막을 수 있습니다.
    - 잘못된 URL을 조용히 빈 값으로 처리하지 말고 ValueError로 드러내세요.
  check:
    type: noError
    noError: summarizeTrackingUrl 함수와 assert 검증이 오류 없이 통과해야 합니다.
    resultCheck: summary가 입력 URL의 host, path, campaign, amount 개수를 실제로 반영해야 합니다.
- id: practice
  title: urllib.parse 종합 복습
  structuredPrimary: true
  subtitle: callback URL 검사
  goal: callback URL에서 code, state, scope를 읽고 필수 값 누락을 확인한다.
  why: 시간이 지나도 남아야 할 urllib 감각은 함수 이름 암기가 아니라, URL 입력을 구조화하고 누락을 자동으로 잡는 습관입니다.
  explanation: |-
    callback URL은 query와 fragment에 중요한 값이 들어올 수 있습니다. parse_qs를 두 번 적용한 뒤 필요한 필드가 있는지 확인하면 브라우저와 로컬에서 같은 방식으로 처리할 수 있습니다.

    이번 복습은 네트워크 없이 URL 문자열만 다루므로 Web Run에서 바로 반복할 수 있습니다.
  snippet: |-
    from urllib.parse import parse_qs, urlparse

    callbackUrl = "https://app.example.com/callback?code=abc123&state=lesson-21&scope=read+write"
    parsed = urlparse(callbackUrl)
    values = parse_qs(parsed.query)
    required = ["code", "state"]
    missing = [name for name in required if not values.get(name)]
    {
        "host": parsed.netloc,
        "path": parsed.path,
        "code": values.get("code", [""])[0],
        "missing": missing,
        "scopes": values.get("scope", [""])[0].split(),
    }
  exercise:
    prompt: callbackUrl에서 code를 지우고 missing 목록이 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from urllib.parse import parse_qs, urlparse

      callbackUrl = "https://app.example.com/callback?code=abc123&state=lesson-21&scope=read+write"
      parsed = urlparse(callbackUrl)
      values = parse_qs(parsed.query)
      required = ["code", "state"]
      missing = [name for name in required if not values.get(name)]
      {
          "host": parsed.netloc,
          "path": parsed.path,
          "code": values.get("code", [""])[0],
          "missing": missing,
          "scopes": values.get("scope", [""])[0].split(),
      }
    hints:
    - "\`parse_qs\`는 각 key의 값을 list로 돌려줍니다."
    - 필수 값 누락은 화면에서만 표시하지 말고 강한 과제에서는 ValueError로 바꿔야 합니다.
  check:
    type: noError
    noError: parsed, values, missing 변수가 만들어지고 required 목록 순회가 NameError를 내지 않아야 합니다.
    resultCheck: missing 목록과 scopes가 callbackUrl의 query 값을 실제로 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 21_urllib-tracking-summary-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - workflow_validation
    title: Tracking URL을 구조화해 campaign과 금액 목록 반환하기
    subtitle: urlparse와 parse_qs
    goal: 절대 http URL만 허용하고 query에서 campaign, amount 목록, cache key를 계산한다.
    why: 숙달 검증은 URL을 여는 능력이 아니라, URL 문자열을 구조화하고 잘못된 입력을 명시적으로 거부하는 능력을 확인합니다.
    explanation: summarize_tracking_url(url)이 scheme, host, path, campaign, amounts, hasDuplicateAmount, cacheKey를 담은 dict를 반환하게 만드세요.
    tips:
    - 상대 URL이나 host가 없는 URL은 ValueError로 막으세요.
    - parse_qs는 같은 key로 들어온 amount 값을 list로 돌려줍니다.
    exercise:
      prompt: summarize_tracking_url(url)을 완성해 URL 구조와 query 값을 반환하고 상대 URL은 ValueError로 거부하세요.
      starterCode: |-
        def summarize_tracking_url(url):
            raise NotImplementedError
      solution: |-
        from urllib.parse import parse_qs, urlparse

        def summarize_tracking_url(url):
            parsed = urlparse(url)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError("absolute http url required")
            query = parse_qs(parsed.query, keep_blank_values=True)
            amounts = [int(value) for value in query.get("amount", [])]
            return {
                "scheme": parsed.scheme,
                "host": parsed.netloc,
                "path": parsed.path,
                "campaign": query.get("utm_campaign", [""])[0],
                "amounts": amounts,
                "hasDuplicateAmount": len(amounts) > 1,
                "cacheKey": f"{parsed.netloc}{parsed.path}",
            }
      hints:
      - "\`urlparse(url)\` 결과에서 scheme과 netloc을 먼저 검사하세요."
      - amount 값은 문자열 list이므로 int로 바꿔 반환하세요.
    check:
      id: python.builtins.urllib.tracking-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.urllib.empty.behavior.v1.fixture
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
        entry: summarize_tracking_url
        cases:
        - id: summarizes-duplicate-amounts
          arguments:
          - value: https://shop.example.com/orders/view?id=A100&utm_campaign=winter&amount=12000&amount=13000
          expectedReturn:
            scheme: https
            host: shop.example.com
            path: /orders/view
            campaign: winter
            amounts:
            - 12000
            - 13000
            hasDuplicateAmount: true
            cacheKey: shop.example.com/orders/view
        - id: rejects-relative-url
          arguments:
          - value: /orders/view?id=A100&utm_campaign=winter
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 21_urllib-report-url-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - query_strings
    - route_joining
    - percent_encoding
    title: 리포트 URL을 path encoding과 query list로 조립하기
    subtitle: quote, urljoin, urlencode
    goal: base URL, report path, params를 받아 raw space 없는 리포트 URL과 query를 반환한다.
    why: 전이 과제에서는 tracking URL을 읽는 문제에서, 학습 리포트 URL을 새로 만드는 문제로 옮깁니다.
    explanation: build_report_url(base_url, report_path, params)가 percent-encoded path와 doseq query를 결합한 URL 정보를 반환하게 만드세요.
    tips:
    - path 조각에는 quote(..., safe="/")를 쓰세요.
    - list query 값을 펼치려면 urlencode(..., doseq=True)가 필요합니다.
    exercise:
      prompt: build_report_url(base_url, report_path, params)를 완성해 url, path, query, hasRawSpace를 반환하세요.
      starterCode: |-
        def build_report_url(base_url, report_path, params):
            raise NotImplementedError
      solution: |-
        from urllib.parse import quote, urlencode, urljoin, urlparse

        def build_report_url(base_url, report_path, params):
            encoded_path = quote(report_path.strip("/"), safe="/")
            base = base_url if base_url.endswith("/") else base_url + "/"
            url = urljoin(base, encoded_path)
            query = urlencode(params, doseq=True)
            full_url = f"{url}?{query}" if query else url
            parsed = urlparse(full_url)
            return {
                "url": full_url,
                "path": parsed.path,
                "query": parsed.query,
                "hasRawSpace": " " in full_url,
            }
      hints:
      - base URL은 슬래시로 끝나야 상대 path가 그 아래에 붙습니다.
      - 반환 URL 안에 raw space가 남아 있으면 실패입니다.
    check:
      id: python.builtins.urllib.report-url.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.urllib.empty.behavior.v1.fixture
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
        entry: build_report_url
        cases:
        - id: builds-encoded-report-url
          arguments:
          - value: https://codaro.example.com/app/
          - value: reports/weekly summary
          - value:
              lesson: urllib
              tags:
              - web run
              - strong check
              page: 2
          expectedReturn:
            url: https://codaro.example.com/app/reports/weekly%20summary?lesson=urllib&tags=web+run&tags=strong+check&page=2
            path: /app/reports/weekly%20summary
            query: lesson=urllib&tags=web+run&tags=strong+check&page=2
            hasRawSpace: false
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 21_urllib-callback-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - practice
    title: Callback URL에서 필수 값을 복원하고 누락을 거부하기
    subtitle: query와 fragment 회상
    goal: callback URL의 query와 fragment를 읽어 code, state, scopes를 반환하고 필수 값 누락은 ValueError로 막는다.
    why: 시간이 지나도 남아야 할 urllib.parse 감각은 값이 있으면 통과, 없으면 명시적으로 거부하는 입력 검증입니다.
    explanation: inspect_callback_url(url, required=None)가 query와 fragment를 모두 읽고 필수 필드를 확인하도록 완성하세요.
    tips:
    - parse_qs는 fragment 문자열에도 그대로 사용할 수 있습니다.
    - required가 None이면 code와 state를 기본 필수 값으로 잡으세요.
    exercise:
      prompt: inspect_callback_url(url, required=None)을 완성해 code, state, scopes를 반환하고 code 누락은 ValueError로 거부하세요.
      starterCode: |-
        def inspect_callback_url(url, required=None):
            raise NotImplementedError
      solution: |-
        from urllib.parse import parse_qs, urlparse

        def inspect_callback_url(url, required=None):
            required = tuple(required or ("code", "state"))
            parsed = urlparse(url)
            values = parse_qs(parsed.query, keep_blank_values=True)
            if parsed.fragment:
                values.update(parse_qs(parsed.fragment, keep_blank_values=True))
            missing = [name for name in required if not values.get(name)]
            if missing:
                raise ValueError("missing callback fields: " + ",".join(missing))
            scopes = values.get("scope", [""])[0].split()
            return {
                "host": parsed.netloc,
                "path": parsed.path,
                "code": values["code"][0],
                "state": values["state"][0],
                "scopes": scopes,
            }
      hints:
      - "\`values[\\"code\\"][0]\`를 읽기 전에 missing 목록으로 필수 값을 확인하세요."
      - scope는 \`read+write\`가 parse_qs 뒤에 \`read write\`가 되므로 split으로 나눌 수 있습니다.
    check:
      id: python.builtins.urllib.callback.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.urllib.empty.behavior.v1.fixture
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
        entry: inspect_callback_url
        cases:
        - id: extracts-callback-values
          arguments:
          - value: https://app.example.com/callback?code=abc123&state=lesson-21&scope=read+write
          expectedReturn:
            host: app.example.com
            path: /callback
            code: abc123
            state: lesson-21
            scopes:
            - read
            - write
        - id: rejects-missing-code
          arguments:
          - value: https://app.example.com/callback?state=lesson-21
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};