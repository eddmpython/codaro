var e=`meta:\r
  id: requests_12\r
  title: 공휴일·영업일 계산 - 마감일을 영업일 기준으로 자동화\r
  order: 12\r
  category: requests\r
  difficulty: ⭐⭐\r
  badge: 실전\r
  packages:\r
    - requests\r
  tags:\r
    - 영업일\r
    - 공휴일\r
    - 특일정보\r
    - 마감일\r
    - 공공데이터포털\r
  outcomes:\r
    - automation.webApi.businessDays\r
  prerequisites:\r
    - automation.webApi.get\r
  estimatedMinutes: 45\r
  seo:\r
    title: "공휴일·영업일 계산 자동화 - 공공데이터 특일정보 API로 마감일 순연 처리"\r
    description: "공공데이터포털 특일정보 Open API로 그 해 공휴일을 받아 datetime으로 영업일 판정·D+N 영업일·마감일 순연을 계산한다. 세금계산서 발행기한·정산·배송 SLA를 영업일 기준으로 자동화한다."\r
    keywords:\r
      - 영업일 계산\r
      - 공휴일 API\r
      - 특일정보\r
      - 마감일 순연\r
      - data.go.kr\r
\r
intro:\r
  direction: "거래·정산·배송 마감일을 '영업일 기준'으로 정확히 계산한다. 공휴일은 매년 대체·임시공휴일로 바뀌므로, 공공데이터 특일정보 API로 그 해 공휴일을 받아 datetime으로 주말·공휴일을 함께 건너뛴다."\r
  benefits:\r
    - "세금계산서 발행기한(익월 10일)·급여/정산 마감·'영업일 +3일 배송'을 손으로 달력 세던 일을 코드 한 번으로. 마감을 하루 넘기면 가산세·연체로 실제 돈이 샌다."\r
    - "설·추석 대체공휴일과 임시공휴일은 매년 바뀐다 - 공휴일을 코드에 하드코딩하면 내년에 틀린다. 공식 API가 그 해 공휴일을 준다."\r
    - "공휴일 집합은 키 없이 샘플로 폴백하고, 영업일 산술은 표준 datetime만으로 네트워크 없이 검증한다."\r
  diagram:\r
    steps:\r
      - label: "1. 공휴일 받기"\r
        detail: "특일정보 API 응답에서 isHoliday가 'Y'인 날만 공휴일 date 집합으로 추린다."\r
      - label: "2. 영업일 판정"\r
        detail: "주말(토·일)과 공휴일을 함께 빼야 영업일이다."\r
      - label: "3. N영업일 계산"\r
        detail: "'영업일 +N'은 단순 +N일이 아니다 - 주말·공휴일을 건너뛰며 센다."\r
      - label: "4. 마감일 순연"\r
        detail: "마감일이 휴일이면 다음 영업일로 순연한다."\r
    runtime:\r
      - label: "로컬 requests + 환경변수 키"\r
        detail: "requests.get로 data.go.kr 특일정보 호출, serviceKey는 os.environ에서. 로컬 Python에서 그대로 실행한다."\r
      - label: "키 없이 결정론 검증"\r
        detail: "공휴일 파싱·영업일 산술·마감 순연은 샘플 공휴일로 assert. 네트워크·키 없이도 회귀를 잡는다."\r
\r
sections:\r
  - id: parse_holidays\r
    title: "1단계. 공휴일 받기 - 하드코딩 대신 공식 API"\r
    structuredPrimary: true\r
    subtitle: "특일정보 응답에서 isHoliday='Y'만 공휴일 집합으로"\r
    goal: "특일정보 API 응답 항목에서 실제 공휴일(isHoliday가 'Y')만 골라 date 집합으로 만든다."\r
    why: "공휴일은 매년 바뀐다 - 2025년 설 연휴 앞 1월 27일은 정부가 지정한 임시공휴일이었다. 코드에 공휴일을 박아두면 내년엔 틀린다. 그 해 공휴일은 공식 특일정보 API가 준다."\r
    explanation: |-\r
      공공데이터포털 특일정보(한국천문연구원) API는 연·월별 특일 목록을 준다. 응답 항목은 dateName(명칭), isHoliday('Y'/'N'), locdate(YYYYMMDD 정수) 등을 담는다.\r
\r
      여기서 핵심은 isHoliday 필터다. 특일정보에는 공휴일이 아닌 국경일(예: 제헌절)도 섞여 들어올 수 있으므로, 쉬는 날 계산에는 isHoliday가 'Y'인 항목만 추려야 한다. locdate는 정수라 문자열로 바꿔 date로 파싱한다.\r
    tips:\r
      - "isHoliday가 'N'인 항목(제헌절 같은 국경일)은 빨간 날이 아니다 - 영업일 계산에서 빼지 않는다."\r
      - "locdate는 20250101 같은 정수다. str()로 바꿔 '%Y%m%d'로 파싱하면 date가 된다."\r
    snippet: |-\r
      from datetime import date, datetime\r
\r
      def parseHolidays(items):\r
          holidays = set()\r
          for item in items:\r
              if item["isHoliday"] == "Y":\r
                  holidays.add(datetime.strptime(str(item["locdate"]), "%Y%m%d").date())\r
          return holidays\r
\r
      items = [\r
          {"dateName": "1월1일", "isHoliday": "Y", "locdate": 20250101},\r
          {"dateName": "임시공휴일", "isHoliday": "Y", "locdate": 20250127},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250128},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250129},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250130},\r
          {"dateName": "제헌절", "isHoliday": "N", "locdate": 20250717},\r
      ]\r
      holidays = parseHolidays(items)\r
\r
      assert date(2025, 1, 27) in holidays\r
      assert date(2025, 7, 17) not in holidays\r
      assert len(holidays) == 5\r
      sorted(holidays)\r
    exercise:\r
      prompt: "제헌절(7월 17일)은 국경일이지만 공휴일이 아니다. isHoliday를 'N'으로 두면 공휴일 집합에서 빠지는지 확인하세요."\r
      starterCode: |-\r
        from datetime import date, datetime\r
\r
        def parseHolidays(items):\r
            holidays = set()\r
            for item in items:\r
                if item["isHoliday"] == "Y":\r
                    holidays.add(datetime.strptime(str(item["locdate"]), "%Y%m%d").date())\r
            return holidays\r
\r
        items = [\r
            {"dateName": "1월1일", "isHoliday": "Y", "locdate": 20250101},\r
            {"dateName": "제헌절", "isHoliday": ___, "locdate": 20250717},\r
        ]\r
        holidays = parseHolidays(items)\r
\r
        assert date(2025, 7, 17) not in holidays\r
        assert len(holidays) == 1\r
        sorted(holidays)\r
      hints:\r
        - "제헌절은 국경일이지만 쉬는 날이 아니므로 isHoliday는 \\"N\\"."\r
        - "isHoliday가 'Y'가 아니면 집합에 추가되지 않는다."\r
      check:\r
        type: noError\r
        noError: "parseHolidays가 예외 없이 끝나야 한다."\r
        resultCheck: "제헌절이 빠져 공휴일이 1건(신정)만 남아야 한다."\r
    check:\r
      noError: "공휴일 파싱이 끝나야 한다."\r
      resultCheck: "isHoliday가 'Y'인 5건만 공휴일 집합에 담긴다."\r
\r
  - id: is_business_day\r
    title: "2단계. 영업일 판정 - 주말과 공휴일을 함께 뺀다"\r
    structuredPrimary: true\r
    subtitle: "weekday < 5 그리고 공휴일이 아님"\r
    goal: "어떤 날짜가 영업일인지(평일이면서 공휴일이 아님) 판정하는 함수를 만든다."\r
    why: "흔한 버그는 주말만 빼고 공휴일을 깜빡하는 것이다. 1월 27일(월)은 평일이지만 임시공휴일이라 영업일이 아니다 - 둘 다 빼야 맞다."\r
    explanation: |-\r
      date.weekday()는 월요일 0 … 일요일 6을 돌려준다. 그래서 평일은 weekday가 0~4(5 미만)이다. 토요일(5)·일요일(6)은 주말이다.\r
\r
      영업일은 '평일' 그리고 '공휴일이 아님'을 동시에 만족해야 한다. 둘 중 하나라도 어기면 영업일이 아니다. 그래서 weekday < 5 and 날짜 not in 공휴일집합 으로 판정한다.\r
    tips:\r
      - "weekday()는 월0~일6이다. 토·일을 빼려면 weekday < 5인지 본다(요일 영어 약자에 의존하지 않는다)."\r
      - "평일이어도 공휴일이면 영업일이 아니다 - 1월 27일(월) 임시공휴일이 그 예다."\r
    snippet: |-\r
      from datetime import date\r
\r
      def isBusinessDay(d, holidays):\r
          return d.weekday() < 5 and d not in holidays\r
\r
      holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
      assert isBusinessDay(date(2025, 1, 2), holidays) is True\r
      assert isBusinessDay(date(2025, 1, 25), holidays) is False\r
      assert isBusinessDay(date(2025, 1, 27), holidays) is False\r
      isBusinessDay(date(2025, 1, 27), holidays)\r
    exercise:\r
      prompt: "1월 28일은 설날(화요일이지만 공휴일)이다. 평일이어도 공휴일이면 영업일이 아님을 확인하세요."\r
      starterCode: |-\r
        from datetime import date\r
\r
        def isBusinessDay(d, holidays):\r
            return d.weekday() < 5 and d not in holidays\r
\r
        holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
        result = isBusinessDay(date(2025, 1, ___), holidays)\r
\r
        assert result is False\r
        result\r
      hints:\r
        - "설날은 1월 28일."\r
        - "28일은 화요일(평일)이지만 공휴일이라 영업일이 아니다."\r
      check:\r
        type: noError\r
        noError: "isBusinessDay가 예외 없이 끝나야 한다."\r
        resultCheck: "1월 28일은 공휴일이라 영업일이 아니다(False)."\r
    check:\r
      noError: "영업일 판정이 끝나야 한다."\r
      resultCheck: "주말(1/25)과 공휴일(1/27)이 모두 영업일이 아니다."\r
\r
  - id: add_business_days\r
    title: "3단계. N영업일 후·전 - 주말·공휴일을 건너뛰며 센다"\r
    structuredPrimary: true\r
    subtitle: "'영업일 +N'은 단순 +N일이 아니다"\r
    goal: "시작일에서 N영업일 후(또는 음수면 N영업일 전) 날짜를 구한다."\r
    why: "'영업일 +1'을 단순히 +1일로 계산하면 금요일 다음이 토요일이 되어 틀린다. 영업일이 아닌 날은 세지 않고 건너뛰어야 한다."\r
    explanation: |-\r
      하루씩 이동하면서, 도착한 날이 영업일일 때만 남은 횟수를 줄인다. 남은 횟수가 0이 되면 멈춘다. n이 음수면 거꾸로(영업일 전) 이동한다.\r
\r
      2025년 1월 24일(금)에서 1영업일 뒤를 보자. 토(25)·일(26)·임시공휴일(27)·설 연휴(28·29·30)를 모두 건너뛰면 1월 31일(금)이 첫 영업일이다. 단순 +1일(=1/25 토요일)과 한참 다르다.\r
    tips:\r
      - "남은 영업일이 0이 될 때까지 하루씩 옮기되, 영업일일 때만 카운트를 줄인다."\r
      - "n이 음수면 step을 -1로 - 같은 로직으로 'N영업일 전'(예: 마감 2영업일 전 알림)이 나온다."\r
    snippet: |-\r
      from datetime import date, timedelta\r
\r
      def isBusinessDay(d, holidays):\r
          return d.weekday() < 5 and d not in holidays\r
\r
      def addBusinessDays(start, n, holidays):\r
          step = 1 if n >= 0 else -1\r
          remaining = abs(n)\r
          current = start\r
          while remaining > 0:\r
              current += timedelta(days=step)\r
              if isBusinessDay(current, holidays):\r
                  remaining -= 1\r
          return current\r
\r
      holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
      assert addBusinessDays(date(2025, 1, 24), 1, holidays) == date(2025, 1, 31)\r
      assert addBusinessDays(date(2025, 1, 31), -1, holidays) == date(2025, 1, 24)\r
      addBusinessDays(date(2025, 1, 24), 1, holidays)\r
    exercise:\r
      prompt: "1월 24일(금)에서 2영업일 뒤를 구하세요. 설 연휴를 건너뛰면 2월 3일(월)이 됩니다."\r
      starterCode: |-\r
        from datetime import date, timedelta\r
\r
        def isBusinessDay(d, holidays):\r
            return d.weekday() < 5 and d not in holidays\r
\r
        def addBusinessDays(start, n, holidays):\r
            step = 1 if n >= 0 else -1\r
            remaining = abs(n)\r
            current = start\r
            while remaining > 0:\r
                current += timedelta(days=step)\r
                if isBusinessDay(current, holidays):\r
                    remaining -= 1\r
            return current\r
\r
        holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
        due = addBusinessDays(date(2025, 1, 24), ___, holidays)\r
\r
        assert due == date(2025, 2, 3)\r
        due\r
      hints:\r
        - "2영업일을 넣는다."\r
        - "1/24 다음 영업일은 1/31(금), 그다음 영업일은 2/3(월)이다."\r
      check:\r
        type: noError\r
        noError: "addBusinessDays가 예외 없이 끝나야 한다."\r
        resultCheck: "1/24의 2영업일 뒤는 2월 3일이다."\r
    check:\r
      noError: "N영업일 계산이 끝나야 한다."\r
      resultCheck: "1/24의 1영업일 뒤는 설 연휴를 건너뛴 1월 31일이다."\r
\r
  - id: fetch_and_due\r
    title: "4단계. 실전 호출 - 공휴일 받기 + 마감일 순연"\r
    structuredPrimary: true\r
    subtitle: "requests.get + os.environ + dryRun, 그리고 익영업일 순연"\r
    goal: "특일정보 API로 공휴일을 받는 실제 호출 함수를 만들되 키가 없으면 샘플로 폴백하고, 마감일이 휴일이면 다음 영업일로 순연한다."\r
    why: "정산·급여 마감일이 그 달 27일인데 27일이 임시공휴일이면, 마감은 다음 영업일로 미뤄진다. serviceKey는 자격증명이라 코드·커밋·로그에 남기지 않고 환경변수로 분리한다."\r
    explanation: |-\r
      엔드포인트는 GET \`http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo\`이고, 파라미터에 serviceKey와 solYear(연도)를 넣고 _type=json으로 받는다. serviceKey는 os.environ에서 읽는다 - 평문 키를 코드에 넣지 않는다.\r
\r
      fetchHolidays는 dryRun이 True거나 키가 없으면 네트워크를 타지 않고 sample을 돌려준다. nextBusinessDayOnOrAfter는 주어진 날이 영업일이 될 때까지 하루씩 미뤄, '마감일이 휴일이면 익영업일로 순연' 규칙을 구현한다. 27일이 임시공휴일이고 28~30일이 설 연휴라면 마감은 31일(금)로 순연된다.\r
    tips:\r
      - "serviceKey를 코드에 박거나 커밋하지 않는다 - 환경변수(DATA_GO_KR_KEY)로만. 공공데이터포털에서 활용신청 후 무료 발급."\r
      - "data.go.kr 키는 'URL Encoded'와 '디코딩' 두 형태가 있다. requests의 params=로 넘기면 자동 인코딩되므로 디코딩 키를 쓴다."\r
    snippet: |-\r
      import os\r
      import requests\r
      from datetime import date, datetime, timedelta\r
\r
      def parseHolidays(items):\r
          holidays = set()\r
          for item in items:\r
              if item["isHoliday"] == "Y":\r
                  holidays.add(datetime.strptime(str(item["locdate"]), "%Y%m%d").date())\r
          return holidays\r
\r
      def isBusinessDay(d, holidays):\r
          return d.weekday() < 5 and d not in holidays\r
\r
      def nextBusinessDayOnOrAfter(d, holidays):\r
          current = d\r
          while not isBusinessDay(current, holidays):\r
              current += timedelta(days=1)\r
          return current\r
\r
      def fetchHolidays(year, serviceKey=None, dryRun=True, sample=None):\r
          if dryRun or not serviceKey:\r
              return sample\r
          url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo"\r
          response = requests.get(\r
              url,\r
              params={"serviceKey": serviceKey, "solYear": str(year), "numOfRows": 100, "_type": "json"},\r
              timeout=10,\r
          )\r
          response.raise_for_status()\r
          return response.json()["response"]["body"]["items"]["item"]\r
\r
      sample = [\r
          {"dateName": "1월1일", "isHoliday": "Y", "locdate": 20250101},\r
          {"dateName": "임시공휴일", "isHoliday": "Y", "locdate": 20250127},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250128},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250129},\r
          {"dateName": "설날", "isHoliday": "Y", "locdate": 20250130},\r
      ]\r
      serviceKey = os.environ.get("DATA_GO_KR_KEY")\r
      items = fetchHolidays(2025, serviceKey=serviceKey, dryRun=True, sample=sample)\r
      holidays = parseHolidays(items)\r
\r
      settle = nextBusinessDayOnOrAfter(date(2025, 1, 27), holidays)\r
      assert settle == date(2025, 1, 31)\r
      assert nextBusinessDayOnOrAfter(date(2025, 1, 10), holidays) == date(2025, 1, 10)\r
      settle.isoformat()\r
    exercise:\r
      prompt: "dryRun=True로 호출하면 네트워크 없이 sample이 그대로 반환되어 공휴일 5건이 파싱되는지 확인하세요."\r
      starterCode: |-\r
        import os\r
        import requests\r
        from datetime import date, datetime, timedelta\r
\r
        def parseHolidays(items):\r
            holidays = set()\r
            for item in items:\r
                if item["isHoliday"] == "Y":\r
                    holidays.add(datetime.strptime(str(item["locdate"]), "%Y%m%d").date())\r
            return holidays\r
\r
        def fetchHolidays(year, serviceKey=None, dryRun=True, sample=None):\r
            if dryRun or not serviceKey:\r
                return sample\r
            url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo"\r
            response = requests.get(\r
                url,\r
                params={"serviceKey": serviceKey, "solYear": str(year), "numOfRows": 100, "_type": "json"},\r
                timeout=10,\r
            )\r
            response.raise_for_status()\r
            return response.json()["response"]["body"]["items"]["item"]\r
\r
        sample = [\r
            {"dateName": "1월1일", "isHoliday": "Y", "locdate": 20250101},\r
            {"dateName": "임시공휴일", "isHoliday": "Y", "locdate": 20250127},\r
            {"dateName": "설날", "isHoliday": "Y", "locdate": 20250128},\r
            {"dateName": "설날", "isHoliday": "Y", "locdate": 20250129},\r
            {"dateName": "설날", "isHoliday": "Y", "locdate": 20250130},\r
        ]\r
        items = fetchHolidays(2025, dryRun=___, sample=sample)\r
        holidays = parseHolidays(items)\r
\r
        assert len(holidays) == 5\r
        len(holidays)\r
      hints:\r
        - "네트워크를 타지 않으려면 dryRun을 True로."\r
        - "dryRun이 True면 sample이 그대로 반환되어 공휴일 5건이 파싱된다."\r
      check:\r
        type: noError\r
        noError: "dryRun 경로는 requests를 호출하지 않으므로 키·네트워크 없이 끝나야 한다."\r
        resultCheck: "공휴일 5건이 파싱되어야 한다."\r
    check:\r
      noError: "공휴일 받기·마감 순연이 끝나야 한다."\r
      resultCheck: "27일 마감이 임시공휴일·설 연휴를 넘겨 1월 31일로 순연된다."\r
\r
  - id: practice\r
    title: "5단계. 종합 실전 - 주문 CSV → 영업일 기준 마감일 CSV"\r
    structuredPrimary: true\r
    subtitle: "주문일 + 영업일 SLA = 도착예정일"\r
    goal: "주문번호·주문일·SLA(영업일)가 담긴 CSV를 읽어 각 건의 도착예정일(영업일 기준)을 계산하고 CSV로 산출한다."\r
    why: "공휴일 파싱(1·4)·영업일 판정(2)·N영업일 계산(3)을 하나로 묶어, 마감 때 그대로 돌리는 자동화로 완성한다. 입력 주문 목록 → 출력 마감일 표가 그날 바로 쓰인다."\r
    explanation: |-\r
      주문 CSV(주문번호·주문일·SLA 영업일 수)를 csv.DictReader로 읽고, 주문일을 date로 파싱한 뒤 addBusinessDays로 SLA 영업일만큼 더해 도착예정일을 구한다. 결과는 csv.DictWriter로 다시 CSV 문자열로 쓴다.\r
\r
      설 연휴 때문에 1월 23일(목) +2영업일과 1월 24일(금) +1영업일이 모두 1월 31일(금)로 모인다 - 달력을 손으로 세면 놓치기 쉬운 부분을 코드가 정확히 잡는다.\r
    tips:\r
      - "주문일 문자열은 datetime.strptime(..., '%Y-%m-%d').date()로 파싱한다."\r
      - "산출 CSV는 io.StringIO로 만들어 파일·이메일·시트로 흘려보낼 수 있다(email·openpyxl 트랙과 결합)."\r
    snippet: |-\r
      import csv\r
      import io\r
      from datetime import date, datetime, timedelta\r
\r
      def isBusinessDay(d, holidays):\r
          return d.weekday() < 5 and d not in holidays\r
\r
      def addBusinessDays(start, n, holidays):\r
          step = 1 if n >= 0 else -1\r
          remaining = abs(n)\r
          current = start\r
          while remaining > 0:\r
              current += timedelta(days=step)\r
              if isBusinessDay(current, holidays):\r
                  remaining -= 1\r
          return current\r
\r
      holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
      orderCsv = "order_no,order_date,sla_days\\nA-1,2025-01-23,2\\nA-2,2025-01-24,1\\n"\r
      rows = []\r
      for row in csv.DictReader(io.StringIO(orderCsv)):\r
          ordered = datetime.strptime(row["order_date"], "%Y-%m-%d").date()\r
          due = addBusinessDays(ordered, int(row["sla_days"]), holidays)\r
          rows.append({"order_no": row["order_no"], "due_date": due.isoformat()})\r
\r
      output = io.StringIO()\r
      writer = csv.DictWriter(output, fieldnames=["order_no", "due_date"])\r
      writer.writeheader()\r
      writer.writerows(rows)\r
      dueCsv = output.getvalue()\r
\r
      assert rows[0]["due_date"] == "2025-01-31"\r
      assert rows[1]["due_date"] == "2025-01-31"\r
      assert "A-1,2025-01-31" in dueCsv\r
      len(rows)\r
    exercise:\r
      prompt: "A-1의 SLA를 3영업일로 바꾸면 도착예정일이 며칠이 되는지 확인하세요. 설 연휴를 건너뛰어 2월 3일(월)이 됩니다."\r
      starterCode: |-\r
        import csv\r
        import io\r
        from datetime import date, datetime, timedelta\r
\r
        def isBusinessDay(d, holidays):\r
            return d.weekday() < 5 and d not in holidays\r
\r
        def addBusinessDays(start, n, holidays):\r
            step = 1 if n >= 0 else -1\r
            remaining = abs(n)\r
            current = start\r
            while remaining > 0:\r
                current += timedelta(days=step)\r
                if isBusinessDay(current, holidays):\r
                    remaining -= 1\r
            return current\r
\r
        holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
        orderCsv = "order_no,order_date,sla_days\\nA-1,2025-01-23,___\\nA-2,2025-01-24,1\\n"\r
        rows = []\r
        for row in csv.DictReader(io.StringIO(orderCsv)):\r
            ordered = datetime.strptime(row["order_date"], "%Y-%m-%d").date()\r
            due = addBusinessDays(ordered, int(row["sla_days"]), holidays)\r
            rows.append({"order_no": row["order_no"], "due_date": due.isoformat()})\r
\r
        assert rows[0]["due_date"] == "2025-02-03"\r
        assert len(rows) == 2\r
        rows[0]["due_date"]\r
      solution: |-\r
        import csv\r
        import io\r
        from datetime import date, datetime, timedelta\r
\r
        def isBusinessDay(d, holidays):\r
            return d.weekday() < 5 and d not in holidays\r
\r
        def addBusinessDays(start, n, holidays):\r
            step = 1 if n >= 0 else -1\r
            remaining = abs(n)\r
            current = start\r
            while remaining > 0:\r
                current += timedelta(days=step)\r
                if isBusinessDay(current, holidays):\r
                    remaining -= 1\r
            return current\r
\r
        holidays = {date(2025, 1, 1), date(2025, 1, 27), date(2025, 1, 28), date(2025, 1, 29), date(2025, 1, 30)}\r
\r
        orderCsv = "order_no,order_date,sla_days\\nA-1,2025-01-23,3\\nA-2,2025-01-24,1\\n"\r
        rows = []\r
        for row in csv.DictReader(io.StringIO(orderCsv)):\r
            ordered = datetime.strptime(row["order_date"], "%Y-%m-%d").date()\r
            due = addBusinessDays(ordered, int(row["sla_days"]), holidays)\r
            rows.append({"order_no": row["order_no"], "due_date": due.isoformat()})\r
\r
        assert rows[0]["due_date"] == "2025-02-03"\r
        assert len(rows) == 2\r
        rows[0]["due_date"]\r
      hints:\r
        - "빈칸에 3을 넣는다(영업일 3일)."\r
        - "1/23 다음 영업일은 1/24, 그다음은 설 연휴를 건너뛴 1/31, 그다음이 2/3(월)이다."\r
      check:\r
        type: noError\r
        noError: "전체 파이프라인이 예외 없이 끝나야 한다."\r
        resultCheck: "A-1의 도착예정일이 2월 3일이어야 한다."\r
    check:\r
      noError: "주문 CSV → 마감일 CSV 파이프라인이 끝나야 한다."\r
      resultCheck: "설 연휴로 1/23 +2영업일과 1/24 +1영업일이 모두 1월 31일로 모인다."\r
\r
    blocks:\r
      - type: tip\r
        content: "흔한 오개념: '영업일 +N'을 단순 +N일로 계산해 주말·공휴일을 넘기지 못한다. 또 공휴일을 코드에 하드코딩하면 대체·임시공휴일이 바뀌는 이듬해에 틀린다 - 그 해 공휴일은 특일정보 API로 받는다. 상태조회(번호만)와 달리 특일정보는 GET + solYear/solMonth 파라미터다."\r
      - type: list\r
        style: bullet\r
        items:\r
          - "세금계산서 발행기한(공급일 익월 10일, 휴일이면 익영업일 순연)을 nextBusinessDayOnOrAfter로 자동 산출."\r
          - "마감 2영업일 전 알림: addBusinessDays(마감일, -2)로 사전 통보일을 계산해 email 트랙으로 발송."\r
          - "연도별 공휴일을 한 번 받아 캐시(원자적 쓰기 트랙과 결합)하고, 매년 1월에 갱신."\r
          - "여러 해에 걸친 SLA는 fetchHolidays를 연도별로 호출해 공휴일 집합을 합친다(set 합집합)."\r
          - "배송·정산·급여 마감을 한 표로 묶어 watchSched로 매일 자동 실행하고 변화분만 통보."\r
`;export{e as default};