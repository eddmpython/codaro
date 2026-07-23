var e=`meta:\r
  id: requests_01\r
  title: 첫 GET 요청 - 공공 데이터 조회\r
  order: 1\r
  category: requests\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - requests\r
  tags:\r
    - requests\r
    - GET\r
    - JSON\r
    - status_code\r
  outcomes:\r
    - automation.webApi.get\r
  prerequisites:\r
    - automation.webApi.intro\r
  estimatedMinutes: 40\r
  seo:\r
    title: "requests.get 첫 요청 - status_code, raise_for_status, .json() 파싱"\r
    description: "requests.get으로 공공 API에 첫 호출을 보내고 status_code 확인, raise_for_status 가드, .json() 파싱으로 안전한 데이터 수집 골격을 만든다."\r
    keywords:\r
      - requests.get\r
      - status_code\r
      - raise_for_status\r
      - JSON 파싱\r
      - wttr.in\r
\r
intro:\r
  direction: "requests.get 한 줄로 외부 API에 첫 호출을 보내고, status_code · raise_for_status · .json() 세 단계로 응답을 안전하게 처리하는 골격을 만든다."\r
  benefits:\r
    - "본 트랙의 모든 강의가 이 골격에서 확장된다. 02-10강이 이 4줄 패턴의 변주."\r
    - "주간 50분 절감 - 매일 10분씩 공공 데이터를 사이트에서 옮기는 일이 2초로."\r
    - "응답 객체 단위 assert 패턴을 익혀 네트워크 없는 환경에서도 호출 로직 회귀를 잡는다."\r
  diagram:\r
    steps:\r
      - label: "1. 첫 호출"\r
        detail: "requests.get(url, timeout=10) 한 줄. timeout은 의무."\r
      - label: "2. status 확인"\r
        detail: "r.status_code 또는 r.raise_for_status()로 성공·실패 분기."\r
      - label: "3. JSON 파싱"\r
        detail: "r.json()으로 응답 본문을 dict/list로 변환."\r
      - label: "4. assert 검증"\r
        detail: "응답 객체와 파싱 결과의 핵심 키를 한 셀에서 assert."\r
    runtime:\r
      - label: "엔드포인트"\r
        detail: "httpbin.org(테스트 표준) + wttr.in/Seoul(실 공공 데이터, 인증 불필요). 학습 중 차단·과금 없음."\r
      - label: "검증"\r
        detail: "외부 의존 응답을 받되 status_code·핵심 키만 가볍게 assert. 네트워크 끊김에도 골격 학습은 유지."\r
\r
sections:\r
  - id: step1_first_get\r
    title: "1단계. requests.get 첫 호출"\r
    structuredPrimary: true\r
    subtitle: "requests.get, timeout"\r
    goal: "httpbin.org/get에 단발 호출을 보내고 status_code가 200인지 확인한다."\r
    why: "본 트랙의 모든 호출이 이 한 줄에서 출발합니다. timeout 의무화가 트랙 전체의 첫 안전 가드입니다."\r
    explanation: |-\r
      requests.get(url, timeout=10)으로 GET 호출을 보냅니다. timeout은 의무입니다 - 빼면 서버가 응답하지 않을 때 스크립트가 영구 정지합니다. 응답은 Response 객체이며 status_code 속성으로 200/4xx/5xx를 구분합니다.\r
    tips:\r
      - "httpbin.org는 HTTP 요청을 그대로 echo해 주는 학습 표준 엔드포인트입니다. 인증 없이, 차단 없이, 본 트랙 전반의 검증용으로 재사용됩니다."\r
    snippet: |-\r
      import requests\r
\r
      r = requests.get("https://httpbin.org/get", timeout=10)\r
      r.status_code\r
    exercise:\r
      prompt: "URL을 httpbin.org/status/200으로 바꿔 호출하고 status_code가 200인지 확인하세요."\r
      starterCode: |-\r
        import requests\r
\r
        r = requests.get(___, timeout=10)\r
        r.status_code\r
      hints:\r
        - "문자열 'https://httpbin.org/status/200'."\r
    check:\r
      type: noError\r
      noError: "요청이 timeout 안에 응답해야 합니다. 네트워크 환경을 확인하세요."\r
      resultCheck: "출력 200."\r
\r
  - id: step2_json_parse\r
    title: "2단계. .json()으로 응답 파싱"\r
    structuredPrimary: true\r
    subtitle: "Response.json(), 응답 구조 탐색"\r
    goal: "httpbin.org/get 응답을 dict로 파싱하고 핵심 키를 꺼낸다."\r
    why: "API 응답의 99%는 JSON입니다. .json()이 본 트랙에서 가장 자주 호출되는 메서드입니다."\r
    explanation: |-\r
      r.json()은 응답 본문을 Python dict 또는 list로 파싱합니다. 응답이 JSON이 아니면 json.JSONDecodeError를 던집니다. .text는 문자열 그대로, .content는 바이트입니다 - 셋의 자리를 구분해야 합니다.\r
    tips:\r
      - ".json()은 매번 파싱을 수행하므로 같은 응답을 여러 번 쓰려면 변수에 한 번 담아 두세요."\r
    snippet: |-\r
      import requests\r
\r
      r = requests.get("https://httpbin.org/get", params={"q": "codaro"}, timeout=10)\r
      data = r.json()\r
      data["args"]["q"], data["url"]\r
    exercise:\r
      prompt: "params에 city='Seoul'을 추가해 호출하고, 응답 data['args']에서 city 값을 꺼내세요."\r
      starterCode: |-\r
        import requests\r
\r
        r = requests.get("https://httpbin.org/get", params={___: ___}, timeout=10)\r
        data = r.json()\r
        data["args"]["city"]\r
      hints:\r
        - "키와 값 모두 문자열: 'city', 'Seoul'."\r
    check:\r
      type: noError\r
      noError: ".json()은 응답이 JSON일 때만 동작합니다."\r
      resultCheck: "출력 'Seoul'."\r
\r
  - id: step3_raise_for_status\r
    title: "3단계. raise_for_status 안전 가드"\r
    structuredPrimary: true\r
    subtitle: "4xx/5xx 자동 예외화"\r
    goal: "raise_for_status로 실패 응답을 명시적 예외로 바꾸고, try/except로 처리한다."\r
    why: "200만 성공이 아닙니다. 4xx·5xx를 조용히 넘기면 빈 데이터로 분석 파이프라인이 진행되어 잘못된 보고서가 만들어집니다."\r
    explanation: |-\r
      r.raise_for_status()는 status_code가 4xx 또는 5xx면 requests.exceptions.HTTPError를 던지고, 그 외에는 아무 일도 하지 않습니다. 호출 직후에 한 줄 가드로 두면 실패가 즉시 드러납니다.\r
    tips:\r
      - "4xx는 호출자 잘못(잘못된 URL, 인증 실패, 누락 파라미터), 5xx는 서버 잘못. 5xx만 재시도가 의미 있습니다(05강에서 확장)."\r
    snippet: |-\r
      import requests\r
      from requests.exceptions import HTTPError\r
\r
      def fetchJson(url, timeout=10):\r
          r = requests.get(url, timeout=timeout)\r
          r.raise_for_status()\r
          return r.json()\r
\r
      try:\r
          data = fetchJson("https://httpbin.org/status/404")\r
          state = "ok"\r
      except HTTPError as exc:\r
          state = f"fail:{exc.response.status_code}"\r
      state\r
    exercise:\r
      prompt: "fetchJson을 호출해 https://httpbin.org/status/500을 받았을 때 state가 'fail:500'이 되도록 try/except를 완성하세요."\r
      starterCode: |-\r
        import requests\r
        from requests.exceptions import HTTPError\r
\r
        def fetchJson(url, timeout=10):\r
            r = requests.get(url, timeout=timeout)\r
            r.raise_for_status()\r
            return r.json()\r
\r
        try:\r
            data = fetchJson(___)\r
            state = "ok"\r
        except HTTPError as exc:\r
            state = f"fail:{exc.response.status_code}"\r
        state\r
      hints:\r
        - "URL 문자열 'https://httpbin.org/status/500'."\r
    check:\r
      type: noError\r
      noError: "raise_for_status가 HTTPError를 던지면 except 분기가 실행됩니다."\r
      resultCheck: "출력 'fail:500'."\r
\r
  - id: step4_real_data\r
    title: "4단계. 실 공공 데이터 - 서울 날씨"\r
    structuredPrimary: true\r
    subtitle: "wttr.in/Seoul, 인증 불필요"\r
    goal: "실제 공공 API(wttr.in)에서 서울 현재 기온을 한 줄로 가져온다."\r
    why: "데이터 분석 김주임이 매일 10분씩 사이트를 보고 옮기던 작업이 2초가 됩니다. 인증 없이 동작하는 공공 엔드포인트로 학습이 끊기지 않습니다."\r
    explanation: |-\r
      wttr.in은 인증 없이 동작하는 공공 날씨 서비스입니다. format=j1 쿼리로 JSON 응답을 받습니다. 응답 구조는 current_condition 배열에 현재 상태가 들어 있고, 그 안의 temp_C가 섭씨 기온입니다.\r
    tips:\r
      - "공공 sample 엔드포인트는 운영 안정성이 보장되지 않을 수 있습니다. 학습 중에는 httpbin과 함께 사용하고, 실 자동화에서는 응답 캐시(02강)와 재시도(05강)로 보강합니다."\r
    snippet: |-\r
      import requests\r
\r
      r = requests.get("https://wttr.in/Seoul", params={"format": "j1"}, timeout=10)\r
      r.raise_for_status()\r
      weather = r.json()\r
      tempC = weather["current_condition"][0]["temp_C"]\r
      tempC\r
    exercise:\r
      prompt: "도시 이름을 'Busan'으로 바꿔 부산의 현재 기온을 가져오세요."\r
      starterCode: |-\r
        import requests\r
\r
        r = requests.get(f"https://wttr.in/{___}", params={"format": "j1"}, timeout=10)\r
        r.raise_for_status()\r
        weather = r.json()\r
        weather["current_condition"][0]["temp_C"]\r
      hints:\r
        - "문자열 'Busan'."\r
    check:\r
      type: noError\r
      noError: "wttr.in 응답이 timeout 안에 와야 합니다."\r
      resultCheck: "출력 문자열은 섭씨 기온(예: '12')."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    subtitle: ".text와 .json()은 다르다, 200만 성공이 아니다"\r
    goal: "두 가지 흔한 함정을 차단한다."\r
    why: ".text를 .json()처럼 다루면 KeyError 대신 TypeError가 나서 디버깅이 길어지고, status_code 확인을 생략하면 빈 데이터로 잘못된 보고서가 나옵니다."\r
    explanation: |-\r
      함정1: r.text는 문자열입니다. dict처럼 ['key']로 접근하면 TypeError. r.json()으로 파싱해야 dict가 됩니다. 함정2: 200만 성공으로 보고 if r.status_code == 200으로 가드하면 201·204 같은 성공 응답이 누락됩니다. raise_for_status가 표준입니다.\r
    tips:\r
      - ".content는 바이트(bytes)입니다 - 이미지·파일 다운로드(08강)에서만 쓰고 본 강의 같은 JSON 응답에는 .json()을 씁니다."\r
    snippet: |-\r
      import requests\r
\r
      r = requests.get("https://httpbin.org/get", timeout=10)\r
\r
      asText = r.text\r
      asJson = r.json()\r
      asBytes = r.content\r
\r
      type(asText).__name__, type(asJson).__name__, type(asBytes).__name__\r
    exercise:\r
      prompt: "asJson에서 'url' 키 값을 꺼내세요. .text가 아닌 .json()을 써야 합니다."\r
      starterCode: |-\r
        import requests\r
\r
        r = requests.get("https://httpbin.org/get", timeout=10)\r
        asJson = r.___()\r
        asJson["url"]\r
      hints:\r
        - "메서드 이름은 json - 괄호 호출 필요."\r
    check:\r
      type: noError\r
      noError: ".json()은 괄호로 호출하는 메서드입니다."\r
      resultCheck: "출력은 'https://httpbin.org/get' 또는 유사 URL."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "안전 호출 함수와 다중 도시 날씨 수집"\r
    goal: "fetchJson 헬퍼를 만들어 재사용하고, 여러 도시의 날씨를 한 번에 가져온다."\r
    why: "이 두 패턴이 본 트랙의 02-10강에서 가장 자주 재사용되는 빌딩 블록입니다."\r
    explanation: |-\r
      미션1은 timeout과 raise_for_status를 묶은 fetchJson 헬퍼, 미션2는 도시 리스트를 순회해 각 도시의 기온을 dict로 모으는 패턴입니다.\r
    tips:\r
      - "변수 prefix: fch*(미션1), cty*(미션2)."\r
    snippet: |-\r
      import requests\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "미션1: fetchJson(url, timeout=10) -> dict"\r
        - "미션2: collectWeather(cities) -> dict[str, str]"\r
    check:\r
      type: contains\r
      requiredPatterns:\r
        - requests.get\r
        - raise_for_status\r
      resultCheck: "두 미션 모두 requests.get + raise_for_status 패턴을 사용해야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "여러 도시를 순회할 때는 각 호출에 timeout을 따로 두고, 한 도시 실패가 전체 수집을 막지 않도록 try/except로 감싸세요."\r
      - type: expansion\r
        title: "미션1: fetchJson 안전 헬퍼"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import requests\r
              from requests.exceptions import HTTPError\r
\r
              def fetchJson(url, timeout=10):\r
                  r = requests.get(url, timeout=timeout)\r
                  r.raise_for_status()\r
                  return r.json()\r
\r
              ok = fetchJson("https://httpbin.org/get")\r
              assert "url" in ok\r
\r
              try:\r
                  fetchJson("https://httpbin.org/status/404")\r
                  failed = False\r
              except HTTPError:\r
                  failed = True\r
\r
              "url" in ok and failed\r
      - type: expansion\r
        title: "미션2: 다중 도시 날씨 수집"\r
        blocks:\r
          - type: code\r
            title: "수집 함수 정의"\r
            content: |-\r
              import requests\r
              from requests.exceptions import RequestException\r
\r
              def collectWeather(cities, timeout=10):\r
                  result = {}\r
                  for city in cities:\r
                      try:\r
                          r = requests.get(\r
                              f"https://wttr.in/{city}",\r
                              params={"format": "j1"},\r
                              timeout=timeout,\r
                          )\r
                          r.raise_for_status()\r
                          result[city] = r.json()["current_condition"][0]["temp_C"]\r
                      except (RequestException, KeyError, IndexError) as exc:\r
                          result[city] = f"fail:{type(exc).__name__}"\r
                  return result\r
          - type: code\r
            title: "검증"\r
            content: |-\r
              report = collectWeather(["Seoul", "Busan", "Jeju"])\r
              assert set(report.keys()) == {"Seoul", "Busan", "Jeju"}\r
              report\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "wttr.in 대신 OpenWeather API(인증 필요)로 동일 흐름 (03강 헤더 패턴 연결)"\r
          - "응답을 JSON 파일로 저장해 다음 실행에서 캐시로 사용 (02강 응답 캐시 패턴 예고)"\r
          - "도시 리스트를 CSV에서 읽어 결과를 CSV로 저장"\r
          - "기온이 임계값을 넘으면 04강의 Slack 알림 패턴으로 통보"\r
          - "한국환경공단 에어코리아 미세먼지 API(인증키 필요)로 미세먼지 수집 흐름 확장"\r
`;export{e as default};