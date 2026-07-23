var e=`meta:\r
  id: excel_01\r
  title: Excel 로컬 자동화 입문\r
  order: 1\r
  category: excel\r
  badge: 입문\r
  packages:\r
  - openpyxl\r
  tags:\r
  - excel\r
  - openpyxl\r
  - 워크북\r
  - 로컬Python\r
  - 자동화\r
  seo:\r
    title: Excel 로컬 자동화 입문 - 로컬 Python 엑셀 자동화\r
    description: openpyxl과 pandas로 로컬 Excel 파일을 만들고 검증하는 실무형 커리큘럼입니다.\r
    keywords:\r
    - excel\r
    - openpyxl\r
    - 워크북\r
    - 로컬Python\r
    - 자동화\r
intro:\r
  direction: Excel 로컬 자동화 입문에서 엑셀 파일과 셀 범위를 읽고 쓰며 결과 파일을 검증합니다.\r
  benefits:\r
  - 워크북과 시트 확인 후 셀/범위 조작에 맞는 코드 입력을 고릅니다.\r
  - Excel 로컬 자동화 입문 결과를 저장 파일과 셀 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 파일 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 로컬 Excel 자동 입력 확인\r
      detail: 입력 기준(워크북과 시트)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 워크북 만들기 처리 실행\r
      detail: 셀/범위 조작 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 워크북 검증 루프 결과 검증\r
      detail: 저장 파일과 셀 값 기준으로 실행 결과를 비교합니다.\r
    - label: Excel 로컬 자동화 입문 재사용\r
      detail: 완성 코드를 업무 파일 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 엑셀 자동화 환경\r
      detail: openpyxl 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Excel 로컬 자동화 입문 실행\r
      detail: 셀을 실행해 저장 파일과 셀 값와 예외 상태를 확인합니다.\r
    - label: Excel 로컬 자동화 입문 완료\r
      detail: 검증된 코드를 업무 파일 자동화로 남깁니다.\r
sections:\r
- id: intro\r
  title: 1단계. 로컬 Excel 자동화의 기준\r
  subtitle: 앱 제어 대신 파일 기반 자동화\r
  blocks:\r
  - type: text\r
    content: 로컬 Python 커리큘럼에서는 Excel 프로그램을 직접 조종하기보다, xlsx 파일을 코드로 생성하고 검증하는 흐름을 먼저 배웁니다. 이 방식은 CI와 서버에서도\r
      재현 가능하고, 사용자가 같은 파일을 업무에 바로 가져갈 수 있습니다.\r
  - type: tip\r
    content: Excel 앱 제어가 필요한 특수 업무는 나중에 선택지로 다루고, 기본 커리큘럼은 openpyxl/pandas 파일 자동화를 기준으로 잡습니다.\r
  goal: 1단계. 로컬 Excel 자동화의 기준에서 워크북과 시트을 바꿨을 때 저장 파일과 셀 값가 어떻게 달라지는지 확인한다.\r
  why: 엑셀 자동화는 반복 보고서와 정산 파일을 코드로 재현하는 실무 흐름입니다.\r
- id: create_workbook\r
  title: 2단계. 워크북 만들기\r
  structuredPrimary: true\r
  subtitle: Workbook과 Worksheet\r
  goal: 2단계. 워크북 만들기에서 셀/범위 조작 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 2단계. 워크북 만들기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    excelTemp = TemporaryDirectory()\r
    excelRoot = Path(excelTemp.name)\r
    salesPath = excelRoot / "sales_report.xlsx"\r
\r
    workbook = Workbook()\r
    sheet = workbook.active\r
    sheet.title = "sales"\r
    sheet.append(["date", "region", "product", "amount"])\r
    sheet.append(["2026-05-01", "Seoul", "Notebook", 1250000])\r
    sheet.append(["2026-05-02", "Busan", "Monitor", 420000])\r
    sheet.append(["2026-05-03", "Seoul", "Keyboard", 180000])\r
    workbook.save(salesPath)\r
\r
    assert salesPath.exists()\r
    salesPath\r
  exercise:\r
    prompt: 2단계. 워크북 만들기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      excelTemp = TemporaryDirectory()\r
      excelRoot = Path(excelTemp.name)\r
      salesPath = excelRoot / "sales_report.xlsx"\r
\r
      workbook = Workbook()\r
      sheet = workbook.active\r
      sheet.title = "sales"\r
      sheet.append(["date", "region", "product", "amount"])\r
      sheet.append(["2026-05-01", "Seoul", "Notebook", 1250000])\r
      sheet.append(["2026-05-02", "Busan", "Monitor", 420000])\r
      sheet.append(["2026-05-03", "Seoul", "Keyboard", 180000])\r
      workbook.save(salesPath)\r
\r
      assert salesPath.exists()\r
      salesPath\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 워크북 만들기에서 \`excelTemp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 워크북 만들기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
- id: workflow_validation\r
  title: 3단계. 워크북 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 3단계. 워크북 검증 루프에서 셀/범위 조작 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 엑셀 자동화는 파일이 만들어졌다는 사실보다, 사용자가 열었을 때 믿을 수 있는 구조인지가 중요합니다. 필수 컬럼과 금액 규칙을 검증하고, 잘못된 금액이 들어왔을\r
    때 명확하게 실패시키는 흐름을 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateSalesWorksheet(worksheet):\r
        headers = [cell.value for cell in worksheet[1]]\r
        requiredHeaders = ["date", "region", "product", "amount"]\r
        if headers != requiredHeaders:\r
            raise ValueError(f"헤더가 다릅니다: {headers}")\r
        amounts = [row[3] for row in worksheet.iter_rows(min_row=2, values_only=True)]\r
        assert all(amount > 0 for amount in amounts)\r
        return {"rowCount": len(amounts), "totalAmount": sum(amounts)}\r
\r
    loadedSheet = load_workbook(salesPath)["sales"]\r
    salesValidation = validateSalesWorksheet(loadedSheet)\r
    assert salesValidation["rowCount"] == 3\r
    salesValidation\r
  exercise:\r
    prompt: 3단계. 워크북 검증 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateSalesWorksheet(worksheet):\r
          headers = [cell.value for cell in worksheet[1]]\r
          requiredHeaders = ["date", "region", "product", "amount"]\r
          if headers != requiredHeaders:\r
              raise ValueError(f"헤더가 다릅니다: {headers}")\r
          amounts = [row[3] for row in worksheet.iter_rows(min_row=2, values_only=True)]\r
          assert all(amount > 0 for amount in amounts)\r
          return {"rowCount": len(amounts), "totalAmount": sum(amounts)}\r
\r
      loadedSheet = load_workbook(salesPath)["sales"]\r
      salesValidation = validateSalesWorksheet(loadedSheet)\r
      assert salesValidation["rowCount"] == 3\r
      salesValidation\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 워크북 검증 루프의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 3단계. 워크북 검증 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 파일 자동화의 기본 완주 조건\r
  blocks:\r
  - type: text\r
    content: 이번 레슨에서는 로컬 xlsx 파일을 만들고, 시트 구조와 금액 규칙을 검증하고, 기준을 바꿔 지역별 요약을 만드는 흐름을 완성했습니다.\r
  goal: 정리에서 워크북과 시트을 바꿨을 때 저장 파일과 셀 값가 어떻게 달라지는지 확인한다.\r
  why: 엑셀 자동화는 반복 보고서와 정산 파일을 코드로 재현하는 실무 흐름입니다.\r
`;export{e as default};