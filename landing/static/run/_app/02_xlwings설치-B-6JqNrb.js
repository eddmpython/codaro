var e=`meta:\r
  id: excel_02\r
  title: Excel 데이터 읽기와 정제\r
  order: 2\r
  category: excel\r
  badge: 실무\r
  packages:\r
  - openpyxl\r
  - pandas\r
  tags:\r
  - excel\r
  - pandas\r
  - openpyxl\r
  - 데이터정제\r
  - xlsx\r
  seo:\r
    title: Excel 데이터 읽기와 정제 - 로컬 Python 엑셀 자동화\r
    description: openpyxl과 pandas로 로컬 Excel 파일을 만들고 검증하는 실무형 커리큘럼입니다.\r
    keywords:\r
    - excel\r
    - pandas\r
    - openpyxl\r
    - 데이터정제\r
    - xlsx\r
intro:\r
  direction: Excel 데이터 읽기와 정제에서 엑셀 파일과 셀 범위를 읽고 쓰며 결과 파일을 검증합니다.\r
  benefits:\r
  - 워크북과 시트 확인 후 셀/범위 조작에 맞는 코드 입력을 고릅니다.\r
  - Excel 데이터 읽기와 정제 결과를 저장 파일과 셀 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 파일 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 업무 파일을 Data 입력 확인\r
      detail: 입력 기준(워크북과 시트)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 파생 컬럼과 요약 처리 실행\r
      detail: 셀/범위 조작 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 정제 파이프라인 검증 결과 검증\r
      detail: 저장 파일과 셀 값 기준으로 실행 결과를 비교합니다.\r
    - label: Excel 데이터 읽기와 정제 재사용\r
      detail: 완성 코드를 업무 파일 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 엑셀 자동화 환경\r
      detail: openpyxl, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Excel 데이터 읽기와 정제 실행\r
      detail: 셀을 실행해 저장 파일과 셀 값와 예외 상태를 확인합니다.\r
    - label: Excel 데이터 읽기와 정제 완료\r
      detail: 검증된 코드를 업무 파일 자동화로 남깁니다.\r
sections:\r
- id: intro\r
  title: 1단계. 업무 파일을 DataFrame으로 읽기\r
  structuredPrimary: true\r
  subtitle: read_excel과 계약 확인\r
  goal: 1단계. 업무 파일을 DataFrame으로 읽기에서 셀/범위 조작 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 실무 엑셀 파일은 사람이 만들기 때문에 헤더 누락, 음수 값, 불필요한 시트가 자주 생깁니다. pandas로 읽은 뒤 컬럼 계약을 먼저 확인하는 습관을 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook\r
    import pandas as pd\r
\r
    excelTemp = TemporaryDirectory()\r
    excelRoot = Path(excelTemp.name)\r
    ordersPath = excelRoot / "orders.xlsx"\r
\r
    workbook = Workbook()\r
    sheet = workbook.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "quantity", "unit_price"])\r
    sheet.append(["A001", "Seoul", 3, 120000])\r
    sheet.append(["A002", "Busan", 2, 80000])\r
    sheet.append(["A003", "Seoul", 5, 45000])\r
    workbook.save(ordersPath)\r
\r
    orders = pd.read_excel(ordersPath, sheet_name="orders")\r
    assert list(orders.columns) == ["order_id", "region", "quantity", "unit_price"]\r
    orders\r
  exercise:\r
    prompt: 1단계. 업무 파일을 DataFrame으로 읽기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook\r
      import pandas as pd\r
\r
      excelTemp = TemporaryDirectory()\r
      excelRoot = Path(excelTemp.name)\r
      ordersPath = excelRoot / "orders.xlsx"\r
\r
      workbook = Workbook()\r
      sheet = workbook.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "quantity", "unit_price"])\r
      sheet.append(["A001", "Seoul", 3, 120000])\r
      sheet.append(["A002", "Busan", 2, 80000])\r
      sheet.append(["A003", "Seoul", 5, 45000])\r
      workbook.save(ordersPath)\r
\r
      orders = pd.read_excel(ordersPath, sheet_name="orders")\r
      assert list(orders.columns) == ["order_id", "region", "quantity", "unit_price"]\r
      orders\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 업무 파일을 DataFrame으로 읽기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 업무 파일을 DataFrame으로 읽기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: cleaning_flow\r
  title: 2단계. 파생 컬럼과 요약\r
  structuredPrimary: true\r
  subtitle: amount 계산\r
  goal: 2단계. 파생 컬럼과 요약에서 셀/범위 조작 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 2단계. 파생 컬럼과 요약의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    orders = orders.assign(amount=orders["quantity"] * orders["unit_price"])\r
    regionSummary = orders.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)\r
\r
    assert orders["amount"].sum() == 745000\r
    assert regionSummary.iloc[0]["region"] == "Seoul"\r
    regionSummary\r
  exercise:\r
    prompt: 2단계. 파생 컬럼과 요약 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      orders = orders.assign(amount=orders["quantity"] * orders["unit_price"])\r
      regionSummary = orders.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)\r
\r
      assert orders["amount"].sum() == 745000\r
      assert regionSummary.iloc[0]["region"] == "Seoul"\r
      regionSummary\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 파생 컬럼과 요약에서 \`orders\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 파생 컬럼과 요약에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
- id: workflow_validation\r
  title: 3단계. 정제 파이프라인 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 3단계. 정제 파이프라인 검증 루프에서 셀/범위 조작 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 엑셀 정제 파이프라인은 읽기, 계산, 저장이 모두 맞아야 합니다. 입력 컬럼을 검증하고, 잘못된 수량을 잡고, 집계 기준을 바꿔 결과가 어떻게 달라지는지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateOrders(frame):\r
        requiredColumns = {"order_id", "region", "quantity", "unit_price"}\r
        missingColumns = requiredColumns - set(frame.columns)\r
        if missingColumns:\r
            raise ValueError(f"주문 파일 필수 컬럼 누락: {sorted(missingColumns)}")\r
        assert frame["quantity"].gt(0).all()\r
        assert frame["unit_price"].gt(0).all()\r
        return True\r
\r
    assert validateOrders(orders)\r
  exercise:\r
    prompt: 3단계. 정제 파이프라인 검증 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateOrders(frame):\r
          requiredColumns = {"order_id", "region", "quantity", "unit_price"}\r
          missingColumns = requiredColumns - set(frame.columns)\r
          if missingColumns:\r
              raise ValueError(f"주문 파일 필수 컬럼 누락: {sorted(missingColumns)}")\r
          assert frame["quantity"].gt(0).all()\r
          assert frame["unit_price"].gt(0).all()\r
          return True\r
\r
      assert validateOrders(orders)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 정제 파이프라인 검증 루프의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 3단계. 정제 파이프라인 검증 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 읽기-정제-저장 완주\r
  blocks:\r
  - type: text\r
    content: 이번 레슨에서는 xlsx 입력을 DataFrame으로 읽고, 파생 컬럼을 만들고, 정제 결과와 요약을 여러 시트로 저장했습니다.\r
  goal: 정리에서 워크북과 시트을 바꿨을 때 저장 파일과 셀 값가 어떻게 달라지는지 확인한다.\r
  why: 엑셀 자동화는 반복 보고서와 정산 파일을 코드로 재현하는 실무 흐름입니다.\r
`;export{e as default};