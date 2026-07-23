var e=`meta:\r
  id: requests_11\r
  title: 사업자등록 상태조회 - 세금계산서 발행 차단 리스트 자동화\r
  order: 11\r
  category: requests\r
  difficulty: ⭐⭐\r
  badge: 실전\r
  packages:\r
    - requests\r
  tags:\r
    - 국세청\r
    - 사업자등록\r
    - 진위확인\r
    - 상태조회\r
    - 공공데이터포털\r
  outcomes:\r
    - automation.webApi.businessStatus\r
  prerequisites:\r
    - automation.webApi.get\r
  estimatedMinutes: 45\r
  seo:\r
    title: "사업자등록 상태조회 자동화 - 국세청 Open API로 휴폐업·과세유형 일괄 확인"\r
    description: "공공데이터포털 국세청 사업자등록 상태조회 Open API를 requests로 호출해 거래처 휴업·폐업·면세·미등록을 일괄 분류하고, 세금계산서 발행 차단 리스트를 자동 생성한다."\r
    keywords:\r
      - 사업자등록 상태조회\r
      - 국세청 API\r
      - 휴폐업 조회\r
      - 세금계산서 발행\r
      - data.go.kr\r
\r
intro:\r
  direction: "거래처 사업자번호 목록을 국세청 공식 Open API로 일괄 조회해 휴업·폐업·면세·미등록을 분류하고, 세금계산서를 끊으면 안 되는 '발행 차단 리스트'를 자동으로 만든다."\r
  benefits:\r
    - "월·분기 마감마다 거래처 수백 건의 휴폐업 여부를 홈택스에 하나씩 치던 일을 배치 1회로. 폐업자에게 끊은 세금계산서는 매입세액 불공제로 실제 돈이 샌다."\r
    - "로그인·인증서·간편인증이 전혀 필요 없는 공식 API라 깨지지 않는다 - 화면 스크래핑보다 안정적이고 정당하다."\r
    - "serviceKey는 환경변수로 분리하고, 키 없이도 샘플 응답으로 전체 흐름을 학습·검증한다."\r
  diagram:\r
    steps:\r
      - label: "1. 방법 결정"\r
        detail: "공식 API가 있으면 로그인 자동화가 아니라 API. 결정 트리로 먼저 고른다."\r
      - label: "2. 상태조회 응답 분류"\r
        detail: "b_stt_cd로 계속·휴업·폐업·미등록을, tax_type으로 면세를 가른다."\r
      - label: "3. 발행 차단 리스트"\r
        detail: "정상(계속·일반/간이)이 아닌 거래처를 차단 리스트로 모은다."\r
      - label: "4. 거래처 CSV → 차단 CSV"\r
        detail: "거래처 목록을 읽어 조회·분류·차단 리스트를 파일로 산출한다."\r
    runtime:\r
      - label: "로컬 requests + 환경변수 키"\r
        detail: "requests.post로 data.go.kr 호출, serviceKey는 os.environ에서. 로컬 Python에서 그대로 실행한다."\r
      - label: "키 없이 결정론 검증"\r
        detail: "응답 처리·분류·차단 로직은 샘플 응답으로 assert. 네트워크·키 없이도 회귀를 잡는다."\r
\r
sections:\r
  - id: choose_method\r
    title: "1단계. 방법 결정 - API가 스크래핑을 이긴다"\r
    structuredPrimary: true\r
    subtitle: "결정 트리: 공식 API > 일괄 다운로드 > 세션 재사용"\r
    goal: "자동화 첫 질문을 '로그인을 어떻게 뚫나'가 아니라 '공식 API/일괄기능이 있나'로 바꾸는 결정 트리를 만든다."\r
    why: "사업자 상태조회는 국세청이 공식 Open API로 제공한다. 그래서 홈택스 화면 로그인 자동화(간편인증·보안플러그인·anti-bot으로 깨짐)가 아니라 requests 한 번이 정답이다. 이 판단이 자동화의 절반이다."\r
    explanation: |-\r
      자동화 대상을 만나면 첫 질문은 "이 작업에 공식 API나 네이티브 일괄기능이 있나?"다. 있으면 화면을 긁지 않는다 - API는 인증서·간편인증·보안플러그인·anti-bot이 없어 깨지지 않고 정당하다.\r
\r
      사업자등록 상태조회는 공공데이터포털(data.go.kr)에 국세청 공식 Open API가 있다. 따라서 로그인 자동화는 잘못된 출발점이고, requests로 API를 부르는 게 정공이다. 로그인 세션 재사용(storage_state)은 "공식 경로가 전혀 없을 때"의 마지막 수단이다.\r
    tips:\r
      - "공식 API가 있는데 화면을 스크래핑하는 건 같은 결과를 더 취약하게 얻는 안티패턴이다."\r
      - "결정 순서: ① 공식 API → ② 네이티브 일괄 다운로드 → ③ (불가피할 때만) 수동 인증 후 세션 재사용."\r
    snippet: |-\r
      def chooseMethod(hasOfficialApi, hasBulkDownload, needsLogin):\r
          if hasOfficialApi:\r
              return "공식 API (requests)"\r
          if hasBulkDownload:\r
              return "네이티브 일괄 다운로드 후 처리"\r
          if needsLogin:\r
              return "수동 인증 1회 + 세션 재사용"\r
          return "공개 페이지 직접 조회"\r
\r
      method = chooseMethod(hasOfficialApi=True, hasBulkDownload=False, needsLogin=True)\r
\r
      assert method == "공식 API (requests)"\r
      method\r
    exercise:\r
      prompt: "공식 API는 없지만(False) 네이티브 일괄 다운로드가 있는(True) 작업이면 어떤 방법이 선택되는지 확인하세요."\r
      starterCode: |-\r
        def chooseMethod(hasOfficialApi, hasBulkDownload, needsLogin):\r
            if hasOfficialApi:\r
                return "공식 API (requests)"\r
            if hasBulkDownload:\r
                return "네이티브 일괄 다운로드 후 처리"\r
            if needsLogin:\r
                return "수동 인증 1회 + 세션 재사용"\r
            return "공개 페이지 직접 조회"\r
\r
        method = chooseMethod(hasOfficialApi=___, hasBulkDownload=True, needsLogin=True)\r
\r
        assert method == "네이티브 일괄 다운로드 후 처리"\r
        method\r
      hints:\r
        - "공식 API가 없으면 첫 인자는 False."\r
        - "API가 없고 일괄 다운로드가 있으면 두 번째 분기가 선택된다."\r
      check:\r
        type: noError\r
        noError: "chooseMethod 호출이 예외 없이 끝나야 한다."\r
        resultCheck: "method가 '네이티브 일괄 다운로드 후 처리'여야 한다."\r
    check:\r
      noError: "결정 트리 함수가 끝나야 한다."\r
      resultCheck: "공식 API가 있으면 'API (requests)'를 고른다."\r
\r
  - id: parse_status\r
    title: "2단계. 상태조회 응답 한 건 분류"\r
    structuredPrimary: true\r
    subtitle: "b_stt_cd → 계속·휴업·폐업·미등록"\r
    goal: "국세청 상태조회 API 응답 한 건에서 b_stt_cd를 읽어 거래처 상태를 분류한다."\r
    why: "응답의 b_stt_cd가 거래처가 살아있는지를 말한다. 이 분류가 발행 차단 판단의 기준이다. 응답 스키마를 정확히 읽는 게 핵심이다."\r
    explanation: |-\r
      상태조회 응답의 data 배열 각 원소는 b_no(사업자번호), b_stt(상태 문자열), b_stt_cd(상태 코드), tax_type(과세유형), end_dt(폐업일) 등을 담는다. 상태 코드는 "01" 계속사업자, "02" 휴업자, "03" 폐업자이며, 국세청에 등록되지 않은 번호는 b_stt와 b_stt_cd가 빈 문자열로 온다.\r
\r
      코드 값에만 의존해 분류하면 문자열 표기 변화에 흔들리지 않는다.\r
    tips:\r
      - "미등록 번호는 b_stt_cd가 빈 문자열('')이고 tax_type에 '등록되지 않은' 안내 문구가 온다 - 정상 응답이지 에러가 아니다."\r
      - "상태 문자열(b_stt)이 아니라 코드(b_stt_cd)로 분기하면 표기가 바뀌어도 안전하다."\r
    snippet: |-\r
      STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
      def classifyStatus(record):\r
          return STATUS_BY_CODE.get(record["b_stt_cd"], "미등록")\r
\r
      record = {\r
          "b_no": "2345678901",\r
          "b_stt": "폐업자",\r
          "b_stt_cd": "03",\r
          "tax_type": "부가가치세 일반과세자",\r
          "end_dt": "20240115",\r
      }\r
      state = classifyStatus(record)\r
\r
      assert state == "폐업"\r
      state\r
    exercise:\r
      prompt: "b_stt_cd가 빈 문자열인 미등록 번호 응답을 분류하면 어떤 상태가 나오는지 확인하세요."\r
      starterCode: |-\r
        STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
        def classifyStatus(record):\r
            return STATUS_BY_CODE.get(record["b_stt_cd"], "미등록")\r
\r
        record = {\r
            "b_no": "3456789012",\r
            "b_stt": "",\r
            "b_stt_cd": ___,\r
            "tax_type": "국세청에 등록되지 않은 사업자등록번호입니다.",\r
            "end_dt": "",\r
        }\r
        state = classifyStatus(record)\r
\r
        assert state == "미등록"\r
        state\r
      hints:\r
        - "미등록 번호의 b_stt_cd는 빈 문자열 \\"\\"."\r
        - "STATUS_BY_CODE에 없는 코드는 get의 기본값 '미등록'이 된다."\r
      check:\r
        type: noError\r
        noError: "classifyStatus가 예외 없이 끝나야 한다."\r
        resultCheck: "state가 '미등록'이어야 한다."\r
    check:\r
      noError: "상태 분류가 끝나야 한다."\r
      resultCheck: "b_stt_cd '03'이 '폐업'으로 분류돼야 한다."\r
\r
  - id: block_list\r
    title: "3단계. 세금계산서 발행 차단 리스트"\r
    structuredPrimary: true\r
    subtitle: "정상(계속·일반/간이)이 아닌 거래처 거르기"\r
    goal: "여러 건의 상태조회 결과에서 세금계산서를 끊으면 안 되는 거래처를 차단 리스트로 모은다."\r
    why: "폐업·휴업·미등록 거래처에 세금계산서를 발행하면 매입세액 불공제로 돈이 샌다. 면세사업자에게는 세금계산서가 아니라 계산서를 끊어야 한다. 이걸 사람 눈으로 거르던 일을 코드가 한다."\r
    explanation: |-\r
      발행 차단 대상은 두 가지다. (1) 상태가 정상(계속, b_stt_cd '01')이 아닌 거래처 - 휴업·폐업·미등록. (2) 면세사업자 - tax_type에 '면세'가 들어가면 세금계산서 대상이 아니다.\r
\r
      buildBlockList는 응답 data를 돌며 이 두 조건 중 하나라도 맞으면 차단 리스트에 넣는다. 정상 일반·간이과세자만 통과한다.\r
    tips:\r
      - "차단 사유를 함께 담으면 운영자가 왜 막혔는지 바로 안다(폐업/휴업/미등록/면세)."\r
      - "조건은 'b_stt_cd != 01' 또는 'tax_type에 면세 포함' - 둘 중 하나면 차단."\r
    snippet: |-\r
      STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
      def buildBlockList(records):\r
          blocked = []\r
          for record in records:\r
              state = STATUS_BY_CODE.get(record["b_stt_cd"], "미등록")\r
              taxFree = "면세" in record["tax_type"]\r
              if state != "계속" or taxFree:\r
                  reason = "면세" if (state == "계속" and taxFree) else state\r
                  blocked.append({"b_no": record["b_no"], "reason": reason})\r
          return blocked\r
\r
      records = [\r
          {"b_no": "1234567890", "b_stt_cd": "01", "tax_type": "부가가치세 일반과세자"},\r
          {"b_no": "2345678901", "b_stt_cd": "03", "tax_type": "부가가치세 일반과세자"},\r
          {"b_no": "3456789012", "b_stt_cd": "", "tax_type": "국세청에 등록되지 않은 사업자등록번호입니다."},\r
          {"b_no": "4567890123", "b_stt_cd": "01", "tax_type": "부가가치세 면세사업자"},\r
      ]\r
      blocked = buildBlockList(records)\r
\r
      assert [item["b_no"] for item in blocked] == ["2345678901", "3456789012", "4567890123"]\r
      assert [item["reason"] for item in blocked] == ["폐업", "미등록", "면세"]\r
      blocked\r
    exercise:\r
      prompt: "휴업(b_stt_cd '02') 거래처 하나만 넣었을 때 차단 리스트에 사유 '휴업'으로 잡히는지 확인하세요."\r
      starterCode: |-\r
        STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
        def buildBlockList(records):\r
            blocked = []\r
            for record in records:\r
                state = STATUS_BY_CODE.get(record["b_stt_cd"], "미등록")\r
                taxFree = "면세" in record["tax_type"]\r
                if state != "계속" or taxFree:\r
                    reason = "면세" if (state == "계속" and taxFree) else state\r
                    blocked.append({"b_no": record["b_no"], "reason": reason})\r
            return blocked\r
\r
        records = [\r
            {"b_no": "5678901234", "b_stt_cd": ___, "tax_type": "부가가치세 일반과세자"},\r
        ]\r
        blocked = buildBlockList(records)\r
\r
        assert blocked == [{"b_no": "5678901234", "reason": "휴업"}]\r
        blocked\r
      hints:\r
        - "휴업자의 b_stt_cd는 '02'."\r
        - "상태가 '계속'이 아니므로 사유는 상태값('휴업')이 된다."\r
      check:\r
        type: noError\r
        noError: "buildBlockList가 예외 없이 끝나야 한다."\r
        resultCheck: "차단 리스트에 사유 '휴업'으로 한 건 잡혀야 한다."\r
    check:\r
      noError: "발행 차단 리스트 생성이 끝나야 한다."\r
      resultCheck: "폐업·미등록·면세 세 건이 사유와 함께 차단된다."\r
\r
  - id: real_call\r
    title: "4단계. 실전 호출 - serviceKey 위생과 dryRun"\r
    structuredPrimary: true\r
    subtitle: "requests.post + os.environ + dryRun 안전판"\r
    goal: "국세청 상태조회 API를 부르는 실제 호출 함수를 만들되, 키가 없으면 샘플로 폴백해 결정론적으로 검증한다."\r
    why: "serviceKey는 자격증명이다 - 코드·커밋·로그에 절대 남기지 않고 환경변수로 분리한다. dryRun 안전판은 키 없이도 전체 파이프라인을 돌려보게 해준다."\r
    explanation: |-\r
      엔드포인트는 POST \`https://api.odcloud.kr/api/nts-businessman/v1/status\`이고, 쿼리 파라미터에 serviceKey, 본문에 \`{"b_no": [사업자번호들]}\`(하이픈 없는 숫자, 한 번에 100건)를 보낸다. serviceKey는 os.environ["DATA_GO_KR_KEY"]로 읽는다 - 평문 키를 코드에 넣지 않는다.\r
\r
      queryStatus는 dryRun이 True거나 키가 없으면 네트워크를 타지 않고 sample 응답을 돌려준다. 학습·테스트는 이 경로로 결정론적으로 검증하고, 실전에서는 dryRun=False로 실제 호출한다.\r
    tips:\r
      - "serviceKey를 코드에 박거나 커밋하지 않는다 - 환경변수(DATA_GO_KR_KEY)로만. 공공데이터포털에서 활용신청 후 무료 발급."\r
      - "data.go.kr 키는 'URL Encoded'와 '디코딩' 두 형태가 있다. requests의 params=로 넘기면 자동 인코딩되므로 디코딩 키를 쓴다."\r
    snippet: |-\r
      import os\r
      import requests\r
\r
      def queryStatus(bNoList, serviceKey=None, dryRun=True, sample=None):\r
          if dryRun or not serviceKey:\r
              return sample\r
          url = "https://api.odcloud.kr/api/nts-businessman/v1/status"\r
          response = requests.post(\r
              url,\r
              params={"serviceKey": serviceKey},\r
              json={"b_no": bNoList},\r
              timeout=10,\r
          )\r
          response.raise_for_status()\r
          return response.json()\r
\r
      sample = {\r
          "status_code": "OK",\r
          "request_cnt": 1,\r
          "match_cnt": 1,\r
          "data": [{"b_no": "1234567890", "b_stt_cd": "01", "tax_type": "부가가치세 일반과세자"}],\r
      }\r
\r
      serviceKey = os.environ.get("DATA_GO_KR_KEY")\r
      result = queryStatus(["1234567890"], serviceKey=serviceKey, dryRun=True, sample=sample)\r
\r
      assert result["status_code"] == "OK"\r
      assert result["data"][0]["b_stt_cd"] == "01"\r
      result["match_cnt"]\r
    exercise:\r
      prompt: "dryRun=True로 호출하면 네트워크 없이 sample이 그대로 반환되는지(request_cnt 값으로) 확인하세요."\r
      starterCode: |-\r
        import os\r
        import requests\r
\r
        def queryStatus(bNoList, serviceKey=None, dryRun=True, sample=None):\r
            if dryRun or not serviceKey:\r
                return sample\r
            url = "https://api.odcloud.kr/api/nts-businessman/v1/status"\r
            response = requests.post(\r
                url,\r
                params={"serviceKey": serviceKey},\r
                json={"b_no": bNoList},\r
                timeout=10,\r
            )\r
            response.raise_for_status()\r
            return response.json()\r
\r
        sample = {"status_code": "OK", "request_cnt": 2, "match_cnt": 2, "data": []}\r
        result = queryStatus(["1", "2"], dryRun=___, sample=sample)\r
\r
        assert result["request_cnt"] == 2\r
        result["request_cnt"]\r
      hints:\r
        - "네트워크를 타지 않으려면 dryRun을 True로."\r
        - "dryRun이 True면 sample이 그대로 반환된다."\r
      check:\r
        type: noError\r
        noError: "dryRun 경로는 requests를 호출하지 않으므로 키·네트워크 없이 끝나야 한다."\r
        resultCheck: "result['request_cnt']가 2여야 한다."\r
    check:\r
      noError: "queryStatus dryRun 호출이 끝나야 한다."\r
      resultCheck: "키가 없어도 sample 응답이 반환된다."\r
\r
  - id: practice\r
    title: "5단계. 종합 실전 - 거래처 CSV → 발행 차단 CSV"\r
    structuredPrimary: true\r
    subtitle: "조회·분류·차단을 한 흐름으로"\r
    goal: "거래처 사업자번호 CSV를 읽어 상태조회 결과로 분류하고, 세금계산서 발행 차단 리스트를 CSV로 산출하는 전체 파이프라인을 완성한다."\r
    why: "결정 트리(1)·응답 분류(2)·차단 리스트(3)·실전 호출(4)을 하나로 묶어, 마감 때 그대로 돌리는 자동화로 완성한다. 입력 거래처 목록 → 출력 차단 리스트가 그날 바로 쓰인다."\r
    explanation: |-\r
      거래처 CSV(사업자번호·상호)를 읽고, 사업자번호 배치를 queryStatus로 조회한 뒤(여기선 샘플 응답), 응답을 사업자번호 기준 dict로 만들어 각 거래처를 분류한다. 정상(계속·비면세)이 아닌 거래처만 사유와 함께 차단 CSV 문자열로 출력한다.\r
\r
      실전에서는 sample 대신 queryStatus(..., dryRun=False, serviceKey=키)로 실제 응답을 받으면 같은 흐름이 그대로 돈다.\r
    tips:\r
      - "응답 data를 b_no 기준 dict로 인덱싱하면 거래처 행과 빠르게 매칭된다."\r
      - "산출 CSV는 io.StringIO로 만들어 파일·이메일·시트로 흘려보낼 수 있다(email·openpyxl 트랙과 결합)."\r
    snippet: |-\r
      import csv\r
      import io\r
\r
      STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
      vendorCsv = "b_no,name\\n1234567890,정상상사\\n2345678901,폐업상사\\n4567890123,면세상사\\n"\r
      sampleData = [\r
          {"b_no": "1234567890", "b_stt_cd": "01", "tax_type": "부가가치세 일반과세자"},\r
          {"b_no": "2345678901", "b_stt_cd": "03", "tax_type": "부가가치세 일반과세자"},\r
          {"b_no": "4567890123", "b_stt_cd": "01", "tax_type": "부가가치세 면세사업자"},\r
      ]\r
      statusByNo = {record["b_no"]: record for record in sampleData}\r
\r
      blocked = []\r
      for row in csv.DictReader(io.StringIO(vendorCsv)):\r
          info = statusByNo[row["b_no"]]\r
          state = STATUS_BY_CODE.get(info["b_stt_cd"], "미등록")\r
          taxFree = "면세" in info["tax_type"]\r
          if state != "계속" or taxFree:\r
              reason = "면세" if (state == "계속" and taxFree) else state\r
              blocked.append({"b_no": row["b_no"], "name": row["name"], "reason": reason})\r
\r
      output = io.StringIO()\r
      writer = csv.DictWriter(output, fieldnames=["b_no", "name", "reason"])\r
      writer.writeheader()\r
      writer.writerows(blocked)\r
      blockCsv = output.getvalue()\r
\r
      assert len(blocked) == 2\r
      assert {item["name"] for item in blocked} == {"폐업상사", "면세상사"}\r
      assert "2345678901,폐업상사,폐업" in blockCsv\r
      len(blocked)\r
    exercise:\r
      prompt: "정상상사(1234567890)도 폐업(b_stt_cd '03')으로 바뀌면 차단 건수가 몇이 되는지 확인하세요."\r
      starterCode: |-\r
        import csv\r
        import io\r
\r
        STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
        vendorCsv = "b_no,name\\n1234567890,정상상사\\n2345678901,폐업상사\\n4567890123,면세상사\\n"\r
        sampleData = [\r
            {"b_no": "1234567890", "b_stt_cd": ___, "tax_type": "부가가치세 일반과세자"},\r
            {"b_no": "2345678901", "b_stt_cd": "03", "tax_type": "부가가치세 일반과세자"},\r
            {"b_no": "4567890123", "b_stt_cd": "01", "tax_type": "부가가치세 면세사업자"},\r
        ]\r
        statusByNo = {record["b_no"]: record for record in sampleData}\r
\r
        blocked = []\r
        for row in csv.DictReader(io.StringIO(vendorCsv)):\r
            info = statusByNo[row["b_no"]]\r
            state = STATUS_BY_CODE.get(info["b_stt_cd"], "미등록")\r
            taxFree = "면세" in info["tax_type"]\r
            if state != "계속" or taxFree:\r
                reason = "면세" if (state == "계속" and taxFree) else state\r
                blocked.append({"b_no": row["b_no"], "name": row["name"], "reason": reason})\r
\r
        assert len(blocked) == 3\r
        len(blocked)\r
      solution: |-\r
        import csv\r
        import io\r
\r
        STATUS_BY_CODE = {"01": "계속", "02": "휴업", "03": "폐업"}\r
\r
        vendorCsv = "b_no,name\\n1234567890,정상상사\\n2345678901,폐업상사\\n4567890123,면세상사\\n"\r
        sampleData = [\r
            {"b_no": "1234567890", "b_stt_cd": "03", "tax_type": "부가가치세 일반과세자"},\r
            {"b_no": "2345678901", "b_stt_cd": "03", "tax_type": "부가가치세 일반과세자"},\r
            {"b_no": "4567890123", "b_stt_cd": "01", "tax_type": "부가가치세 면세사업자"},\r
        ]\r
        statusByNo = {record["b_no"]: record for record in sampleData}\r
\r
        blocked = []\r
        for row in csv.DictReader(io.StringIO(vendorCsv)):\r
            info = statusByNo[row["b_no"]]\r
            state = STATUS_BY_CODE.get(info["b_stt_cd"], "미등록")\r
            taxFree = "면세" in info["tax_type"]\r
            if state != "계속" or taxFree:\r
                reason = "면세" if (state == "계속" and taxFree) else state\r
                blocked.append({"b_no": row["b_no"], "name": row["name"], "reason": reason})\r
\r
        assert len(blocked) == 3\r
        len(blocked)\r
      hints:\r
        - "정상상사를 폐업으로 바꾸려면 b_stt_cd를 '03'으로."\r
        - "세 거래처 모두 차단되어 건수는 3이다."\r
      check:\r
        type: noError\r
        noError: "전체 파이프라인이 예외 없이 끝나야 한다."\r
        resultCheck: "차단 건수가 3이어야 한다."\r
    check:\r
      noError: "거래처 CSV → 차단 CSV 파이프라인이 끝나야 한다."\r
      resultCheck: "폐업·면세 두 거래처가 차단 리스트에 잡힌다."\r
\r
    blocks:\r
      - type: tip\r
        content: "흔한 오개념: data.go.kr 키가 'URL Encoded'인지 '디코딩'인지 헷갈려 401이 난다. requests의 params=로 넘기면 자동 인코딩되므로 디코딩 키를 쓴다. 또 상태조회(번호만)와 진위확인(번호+대표자명+개업일자 3개 일치)은 다른 엔드포인트다."\r
      - type: list\r
        style: bullet\r
        items:\r
          - "진위확인(/validate)으로 확장: 사업자번호 + 대표자명 + 개업일자가 실제로 일치하는지 검증(거래 개시 전 실사)."\r
          - "차단 리스트를 openpyxl로 조건부 서식(빨강 강조) 엑셀로 산출."\r
          - "분기 마감마다 watchSched로 자동 실행하고 결과를 email 트랙으로 담당자에게 발송."\r
          - "100건 초과 거래처는 b_no를 100개씩 끊어 배치 호출(일 100만건 한도 내)."\r
          - "조회 결과를 거래처 마스터와 대사해 신규 폐업 거래처만 변화분으로 통보."\r
`;export{e as default};