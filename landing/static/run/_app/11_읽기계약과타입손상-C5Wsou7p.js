var e=`meta:\r
  id: pandas_11\r
  title: 읽기 계약과 타입 손상\r
  order: 11\r
  category: pandas\r
  difficulty: ⭐⭐\r
  badge: 심화\r
  packages:\r
    - pandas\r
  tags:\r
    - read_csv\r
    - dtype\r
    - 식별자\r
    - 데이터품질\r
    - 읽기계약\r
intro:\r
  emoji: 🪪\r
  goal: CSV를 읽는 순간 식별자(우편번호·사번)의 선행 0이 사라지는 손상을 보고, dtype 계약으로 막는 법을 익힌다.\r
  description: read_csv는 컬럼 타입을 자동 추론한다. 숫자처럼 보이는 식별자는 정수로 추론돼 00123이 123이 되고, 조인 키가 깨진다. dtype를 지정하는 "읽기 계약"으로 막는다.\r
  direction: 데이터를 읽는 첫 순간의 타입 추론을 점검하고, 식별자를 문자열로 지켜 조인까지 안전하게 연결한다.\r
  benefits:\r
    - 읽는 순간의 dtype 추론이 데이터 정합성을 좌우함을 안다.\r
    - dtype={"열": str}로 식별자의 선행 0을 보존한다.\r
    - 타입이 어긋난 키가 조인을 깨뜨리는 실무 사고를 예방한다.\r
  diagram:\r
    steps:\r
      - label: 추론 손상 확인\r
        detail: dtype 없이 읽으면 00123이 int 123이 되는 걸 본다.\r
      - label: 읽기 계약 적용\r
        detail: 'dtype={"id": str}로 선행 0을 보존한다.'\r
      - label: 조인 안전\r
        detail: 문자열 키가 보존돼 마스터 테이블과 정상 조인됨을 확인한다.\r
    runtime:\r
      - label: pandas + 인라인 CSV\r
        detail: io.StringIO로 작은 CSV를 만들어 로컬에서 바로 실행한다.\r
      - label: assert로 직접 확인\r
        detail: dtype와 값, 조인 매칭 수를 assert로 눈에 보이게 검증한다.\r
sections:\r
  - id: inference-corruption\r
    title: 읽는 순간의 타입 손상\r
    structuredPrimary: true\r
    subtitle: 00123이 123이 된다\r
    goal: dtype 없이 read_csv하면 식별자 컬럼이 int로 추론돼 선행 0이 사라지는 것을 확인한다.\r
    why: 우편번호·사번·전화번호처럼 숫자로 보이지만 문자열인 식별자는, 읽는 순간 정수로 추론되면 조용히 망가진다.\r
    explanation: |-\r
      read_csv는 각 컬럼의 타입을 자동으로 추론한다. "00123" 같은 값이 든 컬럼은 전부 숫자로 보이므로 int64로 추론되고, 그 순간 선행 0이 사라져 123이 된다.\r
\r
      문제는 에러가 안 난다는 것이다. 데이터는 멀쩡히 읽히고 숫자도 그럴듯하다. 하지만 "00123"이라는 원래 식별자는 이미 사라졌다.\r
    tips:\r
      - 식별자는 숫자처럼 보여도 "이름"이다 - 계산하지 않으면 문자열로 다뤄야 한다.\r
      - df["열"].dtype로 읽은 직후 타입을 확인하는 습관이 손상을 일찍 잡는다.\r
    snippet: |-\r
      import io\r
      import pandas as pd\r
\r
      csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
      df = pd.read_csv(io.StringIO(csv))\r
\r
      idDtypeName = str(df["id"].dtype)\r
      firstId = df["id"].iloc[0]\r
\r
      assert idDtypeName == "int64"\r
      assert firstId == 123\r
      idDtypeName\r
    exercise:\r
      prompt: 같은 CSV에서 첫 행 id의 값이 문자열 "00123"이 아니라 정수 123으로 읽히는지 확인하세요.\r
      starterCode: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        df = pd.read_csv(io.StringIO(csv))\r
\r
        firstId = df["id"].iloc[___]\r
\r
        assert firstId == 123\r
        firstId\r
      solution: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        df = pd.read_csv(io.StringIO(csv))\r
\r
        firstId = df["id"].iloc[0]\r
\r
        assert firstId == 123\r
        firstId\r
      hints:\r
        - 첫 행은 인덱스 0이다.\r
        - dtype 없이 읽었으므로 "00123"이 아니라 123이 나온다.\r
      check:\r
        type: noError\r
        noError: read_csv가 예외 없이 끝나야 한다.\r
        resultCheck: firstId가 정수 123이어야 한다(선행 0 손실).\r
    check:\r
      noError: read_csv가 끝나야 한다.\r
      resultCheck: idDtypeName이 "int64"여야 한다.\r
  - id: read-contract\r
    title: 읽기 계약으로 보존\r
    structuredPrimary: true\r
    subtitle: 'dtype={"id": str}'\r
    goal: read_csv에 dtype를 지정해 식별자를 문자열로 읽으면 선행 0이 보존되는 것을 확인한다.\r
    why: 읽기 계약(dtype 지정)은 "이 컬럼은 문자열이다"를 명시해, 추론에 맡기지 않고 식별자를 있는 그대로 지킨다.\r
    explanation: |-\r
      read_csv의 dtype 인자에 {"id": str}를 넘기면 id 컬럼을 추론 없이 문자열로 읽는다. 그러면 "00123"이 그대로 보존된다.\r
\r
      식별자 컬럼은 거의 항상 이 계약이 필요하다. 한 줄 추가로 "읽는 순간의 손상"을 원천 차단한다.\r
    tips:\r
      - dtype에는 여러 열을 dict로 한 번에 지정할 수 있다.\r
      - 계산이 필요한 수치 컬럼(amount 등)은 그대로 두고 식별자만 str로 지정하면 된다.\r
    snippet: |-\r
      import io\r
      import pandas as pd\r
\r
      csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
      df = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
\r
      firstId = df["id"].iloc[0]\r
      firstIdLen = len(firstId)\r
\r
      assert firstId == "00123"\r
      assert firstIdLen == 5\r
      firstIdLen\r
    exercise:\r
      prompt: dtype 계약으로 읽었을 때 두 번째 행 id가 "00045"로 보존되는지 확인하세요.\r
      starterCode: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        df = pd.read_csv(io.StringIO(csv), dtype={"id": ___})\r
\r
        secondId = df["id"].iloc[1]\r
\r
        assert secondId == "00045"\r
        secondId\r
      solution: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        df = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
\r
        secondId = df["id"].iloc[1]\r
\r
        assert secondId == "00045"\r
        secondId\r
      hints:\r
        - 문자열로 읽으려면 dtype 값으로 str을 넘긴다.\r
        - 계약을 지키면 "00045"의 선행 0이 보존된다.\r
      check:\r
        type: noError\r
        noError: dtype를 지정한 read_csv가 예외 없이 끝나야 한다.\r
        resultCheck: secondId가 문자열 "00045"여야 한다.\r
    check:\r
      noError: dtype 지정 read_csv가 끝나야 한다.\r
      resultCheck: firstIdLen이 5여야 한다(선행 0 보존).\r
  - id: join-safety\r
    title: 조인까지 안전하게\r
    structuredPrimary: true\r
    subtitle: 키 타입이 맞아야 합쳐진다\r
    goal: 읽기 계약으로 보존한 문자열 키가 마스터 테이블과 정상 조인되고, 손상된 키는 문자열로 안 맞는 것을 확인한다.\r
    why: 사번 0042가 42로 손상되면 문자열 키 마스터와 한 건도 안 맞아, 매출이 통째로 누락되는 사고가 난다.\r
    explanation: |-\r
      마스터 테이블의 id가 문자열("00123")일 때, 읽기 계약을 지킨 거래 데이터는 문자열 키가 보존돼 정상 조인된다.\r
\r
      반대로 계약 없이 읽어 id가 정수 45가 되면, 마스터의 "00045"와 문자열로 비교했을 때 "45" != "00045"라 매칭되지 않는다. 타입이 어긋난 키는 조용히 조인을 깨뜨린다.\r
    tips:\r
      - 조인 전에 양쪽 키의 dtype가 같은지 확인하면 "0건 매칭" 사고를 예방한다.\r
      - 식별자는 양쪽 모두 문자열로 통일하는 게 가장 안전하다.\r
    snippet: |-\r
      import io\r
      import pandas as pd\r
\r
      csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
      master = pd.DataFrame({"id": ["00123", "00045"], "name": ["Alice", "Bob"]})\r
\r
      right = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
      rightMerged = right.merge(master, on="id", how="inner")\r
      matchedRows = len(rightMerged)\r
\r
      wrong = pd.read_csv(io.StringIO(csv))\r
      wrongKeyAsText = str(wrong["id"].iloc[1])\r
\r
      assert matchedRows == 3\r
      assert wrongKeyAsText == "45"\r
      assert wrongKeyAsText != "00045"\r
      matchedRows\r
    exercise:\r
      prompt: 마스터에 "00045"만 있을 때, 계약을 지킨 데이터의 조인 결과가 몇 행인지 확인하세요(00045 한 종류만 매칭).\r
      starterCode: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        master = pd.DataFrame({"id": [___], "name": ["Bob"]})\r
\r
        right = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
        rightMerged = right.merge(master, on="id", how="inner")\r
        matchedRows = len(rightMerged)\r
\r
        assert matchedRows == 1\r
        matchedRows\r
      solution: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
        master = pd.DataFrame({"id": ["00045"], "name": ["Bob"]})\r
\r
        right = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
        rightMerged = right.merge(master, on="id", how="inner")\r
        matchedRows = len(rightMerged)\r
\r
        assert matchedRows == 1\r
        matchedRows\r
      hints:\r
        - 마스터 id 리스트에 "00045" 한 개만 넣는다.\r
        - CSV에 00045는 한 행뿐이라 매칭은 1행이다.\r
      check:\r
        type: noError\r
        noError: 조인이 예외 없이 끝나야 한다.\r
        resultCheck: matchedRows가 1이어야 한다.\r
    check:\r
      noError: 조인이 끝나야 한다.\r
      resultCheck: matchedRows가 3이고 손상된 키는 문자열로 안 맞아야 한다.\r
  - id: practice-read-join-pipeline\r
    title: '종합 실습: 읽기 계약을 지킨 집계'\r
    structuredPrimary: true\r
    subtitle: 안전한 읽기 → 조인 → 집계\r
    goal: 읽기 계약으로 식별자를 보존해 읽고, 마스터와 조인한 뒤 이름별 금액을 집계하는 파이프라인을 종합 점검한다.\r
    why: dtype 계약·조인·집계를 한 흐름으로 묶어, 손상 없이 읽은 데이터가 어떻게 올바른 리포트로 이어지는지 확인한다.\r
    explanation: |-\r
      거래 CSV를 dtype={"id": str}로 읽어 선행 0을 보존하고, 이름이 든 마스터와 id로 조인한 뒤 이름별 amount 합계를 구한다. 00123은 Alice(10+30=40), 00045는 Bob(20)이다.\r
\r
      읽는 순간 식별자를 지켰기 때문에 조인이 정상 매칭되고 집계가 올바르게 나온다. 한 곳에서 계약을 어기면 이 전체 파이프라인이 조용히 틀어진다.\r
    tips:\r
      - 식별자를 문자열로 읽는 한 줄이 조인·집계 전체의 정확성을 떠받친다.\r
      - 집계 결과를 dict로 만들면 기대값과 바로 비교해 검증할 수 있다.\r
    snippet: |-\r
      import io\r
      import pandas as pd\r
\r
      csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n"\r
      master = pd.DataFrame({"id": ["00123", "00045"], "name": ["Alice", "Bob"]})\r
\r
      df = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
      merged = df.merge(master, on="id", how="inner")\r
      totalByName = {name: int(value) for name, value in merged.groupby("name")["amount"].sum().items()}\r
\r
      assert totalByName == {"Alice": 40, "Bob": 20}\r
      totalByName\r
    exercise:\r
      prompt: CSV에 "00045,5" 행을 한 줄 더 넣으면 Bob의 합계가 얼마가 되는지 확인하세요.\r
      starterCode: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n00045,___\\n"\r
        master = pd.DataFrame({"id": ["00123", "00045"], "name": ["Alice", "Bob"]})\r
\r
        df = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
        merged = df.merge(master, on="id", how="inner")\r
        totalByName = {name: int(value) for name, value in merged.groupby("name")["amount"].sum().items()}\r
\r
        assert totalByName == {"Alice": 40, "Bob": 25}\r
        totalByName\r
      solution: |-\r
        import io\r
        import pandas as pd\r
\r
        csv = "id,amount\\n00123,10\\n00045,20\\n00123,30\\n00045,5\\n"\r
        master = pd.DataFrame({"id": ["00123", "00045"], "name": ["Alice", "Bob"]})\r
\r
        df = pd.read_csv(io.StringIO(csv), dtype={"id": str})\r
        merged = df.merge(master, on="id", how="inner")\r
        totalByName = {name: int(value) for name, value in merged.groupby("name")["amount"].sum().items()}\r
\r
        assert totalByName == {"Alice": 40, "Bob": 25}\r
        totalByName\r
      hints:\r
        - 추가할 금액은 정수 5다.\r
        - Bob은 20 + 5 = 25가 된다.\r
      check:\r
        type: noError\r
        noError: 읽기·조인·집계가 예외 없이 끝나야 한다.\r
        resultCheck: Bob의 합계가 25여야 한다.\r
    check:\r
      noError: 읽기·조인·집계 파이프라인이 끝나야 한다.\r
      resultCheck: 이름별 합계가 Alice 40, Bob 20이어야 한다.\r
`;export{e as default};