var e=`meta:\r
  id: openpyxl_04\r
  title: 수식과 이름 영역\r
  order: 4\r
  category: openpyxl\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - 수식\r
  - SUM\r
  - IF\r
  - DefinedName\r
  - data_only\r
  seo:\r
    title: openpyxl 수식과 이름 영역 - SUM/IF/VLOOKUP·DefinedName·data_only 차이\r
    description: 셀에 수식 문자열을 쓰는 방법, 캐시된 계산 결과를 data_only로 읽는 차이, DefinedName으로 가독성을 높이는 패턴까지 정리합니다.\r
    keywords:\r
    - openpyxl 수식\r
    - SUM IF VLOOKUP\r
    - DefinedName\r
    - data_only\r
intro:\r
  direction: 셀에 수식 문자열을 직접 쓰고, 저장된 파일을 data_only로 다시 열어 캐시된 결과값을 읽습니다. DefinedName으로 수식을 사람이 읽기 좋게 만듭니다.\r
  benefits:\r
  - 합계, 평균, 조건 분기, 룩업 수식을 코드로 정확히 넣습니다.\r
  - 수식 문자열과 캐시된 결과값을 구분해 다루며, Excel에서 한 번 열어야 결과가 채워지는 한계를 이해합니다.\r
  - DefinedName으로 "tax_rate" 같은 이름 영역을 만들어 수식의 가독성을 높입니다.\r
  diagram:\r
    steps:\r
    - label: 수식 입력\r
      detail: 셀.value에 "=" 시작 문자열을 대입.\r
    - label: data_only\r
      detail: load_workbook(path, data_only=True)로 캐시 결과를 읽는다.\r
    - label: DefinedName\r
      detail: 이름 영역으로 수식을 사람이 읽기 좋게 묶는다.\r
    - label: 수식 문자열 검증\r
      detail: 수식 문자열은 openpyxl로 즉시 assert. 캐시된 결과값은 Excel을 거쳐야 채워진다는 한계도 확인한다.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: 수식 자체는 openpyxl만으로 충분. uv run python에서 SUM/IF/VLOOKUP 문자열을 셀에 그대로 쓴다.\r
    - label: data_only 캐시 재오픈\r
      detail: load_workbook(path, data_only=True)로 다시 열어 캐시값이 None인지 직접 확인한다.\r
sections:\r
- id: step1_basic_formula\r
  title: 1단계. 셀에 수식 쓰기\r
  structuredPrimary: true\r
  subtitle: cell.value에 "=" 시작 문자열\r
  goal: 합계 수식을 코드로 넣고, 셀의 .value가 그대로 수식 문자열로 보존되는 것을 확인한다.\r
  why: openpyxl은 수식을 "문자열"로 다루고 직접 계산은 하지 않습니다. 이 사실을 모르면 "셀 값이 왜 숫자가 아니라 = 로 시작하는 문자열이지?"에서 막힙니다.\r
  explanation: |-\r
    \`ws['B4'] = "=SUM(B2:B3)"\`처럼 등호로 시작하는 문자열을 셀에 넣으면 openpyxl은 그것을 수식으로 저장합니다. 저장 직후 같은 워크북에서 \`cell.value\`로 읽으면 수식 문자열 그대로 돌아옵니다. 결과값(예: 200000)은 아직 어디에도 없습니다. Excel이 파일을 열어 재계산해야 비로소 캐시에 결과가 채워집니다.\r
  tips:\r
  - 수식 문자열은 영어 함수명(SUM, AVERAGE, IF, ...)만 인식합니다. Excel UI가 한국어라도 코드에서는 영어 이름을 쓰세요.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    sheet.append(["Seoul", 120000])\r
    sheet.append(["Busan", 80000])\r
    sheet["A4"] = "total"\r
    sheet["B4"] = "=SUM(B2:B3)"\r
    sheet["B4"].value\r
  exercise:\r
    prompt: 평균을 구하는 수식을 C4에 추가하고 같은 방법으로 .value가 수식 문자열인지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount", "average"])\r
      sheet.append(["Seoul", 120000, None])\r
      sheet.append(["Busan", 80000, None])\r
      sheet["A4"] = "total"\r
      sheet["B4"] = "=SUM(B2:B3)"\r
      sheet["C4"] = ___\r
      sheet["B4"].value, sheet["C4"].value\r
    hints:\r
    - "AVERAGE(B2:B3) 같은 함수를 = 로 시작하는 문자열로 넣으면 됩니다."\r
  check:\r
    noError: 수식 문자열이 등호(=)로 시작해야 openpyxl이 수식으로 인식합니다.\r
    resultCheck: 두 셀의 .value가 모두 수식 문자열(예 "=SUM..", "=AVERAGE..")이어야 합니다.\r
- id: step2_data_only\r
  title: 2단계. data_only로 캐시 결과 읽기\r
  structuredPrimary: true\r
  subtitle: load_workbook(path, data_only=True)\r
  goal: openpyxl이 직접 계산하지 못한다는 사실과, 캐시가 비어 있을 때의 동작을 코드로 확인한다.\r
  why: 수식을 넣은 파일을 다른 시스템에서 "계산된 결과 값"으로 쓰려면 캐시 갱신 단계가 필요합니다. 이 한계를 알아야 자동화 파이프라인을 잘 설계할 수 있습니다.\r
  explanation: |-\r
    저장 직후의 .xlsx에는 수식 문자열만 들어 있고 캐시된 결과값(cachedValue)은 비어 있습니다. \`load_workbook(path, data_only=True)\`로 다시 열면 cell.value는 캐시 값을 돌려주지만, 그 값은 None입니다. 캐시가 채워지려면 Excel/LibreOffice가 한 번 파일을 열어 저장해야 합니다.\r
  tips:\r
  - "이 한계 때문에 openpyxl 자동화는 '수식 자체가 결과'인 경우(인보이스 양식, 동적 계산 보고서)에 강합니다. '수식 결과를 다시 계산해 다른 시스템에 넘기는' 흐름이면 LibreOffice headless 호출이나 pandas로 직접 계산하는 편이 안전합니다."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    workdir = TemporaryDirectory()\r
    target = Path(workdir.name) / "formula.xlsx"\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    sheet.append(["Seoul", 120000])\r
    sheet.append(["Busan", 80000])\r
    sheet["A4"] = "total"\r
    sheet["B4"] = "=SUM(B2:B3)"\r
    book.save(target)\r
\r
    formulaView = load_workbook(target)\r
    dataView = load_workbook(target, data_only=True)\r
    formulaView["Sheet"]["B4"].value, dataView["Sheet"]["B4"].value\r
  exercise:\r
    prompt: dataView["Sheet"]["B4"].value가 None인지 직접 assert로 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "formula.xlsx"\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      sheet.append(["Seoul", 120000])\r
      sheet.append(["Busan", 80000])\r
      sheet["A4"] = "total"\r
      sheet["B4"] = "=SUM(B2:B3)"\r
      book.save(target)\r
\r
      dataView = load_workbook(target, data_only=True)\r
      assert dataView["Sheet"]["B4"].value is ___\r
      dataView["Sheet"]["B4"].value\r
    hints:\r
    - 캐시가 없으면 None이 옵니다. is None 비교가 정확합니다.\r
  check:\r
    noError: 두 load_workbook 호출이 모두 같은 경로를 써야 FileNotFoundError가 안 납니다.\r
    resultCheck: data_only로 연 B4의 value가 None이어야 합니다.\r
- id: step3_if_and_countif\r
  title: 3단계. IF와 COUNTIF\r
  structuredPrimary: true\r
  subtitle: 조건 수식 두 가지\r
  goal: 조건 분기 수식을 셀에 넣고, 셀 좌표 참조와 비교 연산자 사용을 익힌다.\r
  why: 매출 분석에서 "기준 이상/미만" 분류와 카운트는 가장 자주 쓰이는 수식입니다. 코드로 정확한 셀 좌표를 넣을 수 있어야 합니다.\r
  explanation: |-\r
    \`=IF(B2>=100000,"high","low")\`는 B2 값에 따라 "high"나 "low"를 돌려줍니다. \`=COUNTIF(B2:B4,">=100000")\`은 영역에서 조건을 만족하는 셀 수를 셉니다. 비교 연산자는 큰따옴표로 감싼 문자열 안에 넣어야 합니다.\r
  tips:\r
  - "f-string으로 조건을 동적으로 만들 때는 인용부호 충돌에 주의하세요. f'=COUNTIF(B2:B4,\\">={threshold}\\")' 같은 패턴이 편합니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount", "tier"])\r
    sheet.append(["Seoul", 120000, "=IF(B2>=100000,\\"high\\",\\"low\\")"])\r
    sheet.append(["Busan", 80000, "=IF(B3>=100000,\\"high\\",\\"low\\")"])\r
    sheet.append(["Daegu", 30000, "=IF(B4>=100000,\\"high\\",\\"low\\")"])\r
    sheet["A5"] = "high count"\r
    sheet["B5"] = "=COUNTIF(B2:B4,\\">=100000\\")"\r
    [sheet.cell(row=row, column=3).value for row in range(2, 5)] + [sheet["B5"].value]\r
  exercise:\r
    prompt: 기준을 100000에서 60000으로 바꾸려면 IF 수식 세 개와 COUNTIF 한 개의 어디를 고쳐야 할까요?\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      threshold = ___\r
      sheet.append(["region", "amount", "tier"])\r
      for rowIndex, (region, amount) in enumerate(\r
          [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000)], start=2\r
      ):\r
          sheet.cell(row=rowIndex, column=1, value=region)\r
          sheet.cell(row=rowIndex, column=2, value=amount)\r
          sheet.cell(\r
              row=rowIndex,\r
              column=3,\r
              value=f'=IF(B{rowIndex}>={threshold},"high","low")',\r
          )\r
      sheet["A5"] = "high count"\r
      sheet["B5"] = f'=COUNTIF(B2:B4,">={threshold}")'\r
      [sheet.cell(row=row, column=3).value for row in range(2, 5)] + [sheet["B5"].value]\r
    hints:\r
    - threshold 변수 하나만 바꿔도 수식 네 개가 일관되게 바뀝니다.\r
  check:\r
    noError: f-string의 인용부호가 짝을 맞춰야 SyntaxError가 안 납니다.\r
    resultCheck: 결과 리스트의 각 수식 문자열에 같은 threshold 값이 포함되어야 합니다.\r
- id: step4_defined_name\r
  title: 4단계. DefinedName으로 이름 영역 만들기\r
  structuredPrimary: true\r
  subtitle: openpyxl.workbook.defined_name.DefinedName\r
  goal: 셀 영역에 사람이 읽는 이름을 붙여 수식의 가독성을 높인다.\r
  why: 셀 주소가 직접 들어간 수식보다 tax_rate 같은 이름이 들어간 수식이 훨씬 의도가 분명합니다. 이름 영역은 자동 보고서의 유지보수성을 결정합니다.\r
  explanation: |-\r
    \`from openpyxl.workbook.defined_name import DefinedName\` 후, \`book.defined_names["tax_rate"] = DefinedName(name="tax_rate", attr_text="Settings!$B$2")\`로 이름을 등록합니다. 수식에서는 좌표 대신 \`tax_rate\`를 쓰면 됩니다.\r
  tips:\r
  - attr_text는 절대 참조($)로 적는 것이 안전합니다. 상대 참조를 쓰면 수식이 복사될 때 의도와 다르게 움직입니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.workbook.defined_name import DefinedName\r
\r
    book = Workbook()\r
    settings = book.active\r
    settings.title = "Settings"\r
    settings["A1"] = "tax_rate"\r
    settings["B1"] = 0.1\r
\r
    book.defined_names["tax_rate"] = DefinedName(\r
        name="tax_rate",\r
        attr_text="Settings!$B$1",\r
    )\r
\r
    invoice = book.create_sheet("Invoice")\r
    invoice.append(["item", "amount"])\r
    invoice.append(["pen", 1000])\r
    invoice.append(["book", 12000])\r
    invoice["A4"] = "subtotal"\r
    invoice["B4"] = "=SUM(B2:B3)"\r
    invoice["A5"] = "tax"\r
    invoice["B5"] = "=B4*tax_rate"\r
    invoice["A6"] = "total"\r
    invoice["B6"] = "=B4+B5"\r
    [invoice.cell(row=row, column=2).value for row in range(4, 7)]\r
  exercise:\r
    prompt: discount_rate를 0.05로 추가해 invoice에 "discount" 행을 만들고 total 수식을 (subtotal - discount + tax) 형태로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.workbook.defined_name import DefinedName\r
\r
      book = Workbook()\r
      settings = book.active\r
      settings.title = "Settings"\r
      settings["A1"] = "tax_rate"\r
      settings["B1"] = 0.1\r
      settings["A2"] = "discount_rate"\r
      settings["B2"] = 0.05\r
\r
      book.defined_names["tax_rate"] = DefinedName(\r
          name="tax_rate", attr_text="Settings!$B$1"\r
      )\r
      book.defined_names["discount_rate"] = DefinedName(\r
          name="discount_rate", attr_text=___\r
      )\r
\r
      invoice = book.create_sheet("Invoice")\r
      invoice.append(["item", "amount"])\r
      invoice.append(["pen", 1000])\r
      invoice.append(["book", 12000])\r
      invoice["A4"] = "subtotal"\r
      invoice["B4"] = "=SUM(B2:B3)"\r
      invoice["A5"] = "discount"\r
      invoice["B5"] = "=B4*discount_rate"\r
      invoice["A6"] = "tax"\r
      invoice["B6"] = "=(B4-B5)*tax_rate"\r
      invoice["A7"] = "total"\r
      invoice["B7"] = "=B4-B5+B6"\r
      [invoice.cell(row=row, column=2).value for row in range(4, 8)]\r
    hints:\r
    - attr_text는 절대 참조 좌표 문자열입니다. Settings 시트의 B2가 discount_rate니까 "Settings!$B$2"입니다.\r
  check:\r
    noError: DefinedName 등록에서 시트 이름과 셀 좌표가 실제 시트/셀과 맞아야 합니다.\r
    resultCheck: invoice의 B5, B6, B7이 모두 수식 문자열이며 정의된 이름을 포함해야 합니다.\r
- id: step5_vlookup\r
  title: 5단계. VLOOKUP으로 매핑\r
  structuredPrimary: true\r
  subtitle: 코드 → 이름 변환\r
  goal: 룩업 테이블을 별도 시트에 두고 메인 시트의 코드를 이름으로 자동 변환한다.\r
  why: 매핑 테이블을 코드에 박지 않고 시트로 빼두면, 사용자가 직접 매핑을 수정할 수 있는 "유지보수 가능한 자동화"가 됩니다.\r
  explanation: |-\r
    Codes 시트에 코드(A)와 이름(B) 매핑을 두고, Main 시트에서 \`=VLOOKUP(A2,Codes!$A$2:$B$5,2,FALSE)\`로 코드를 이름으로 변환합니다. 룩업 영역은 절대 참조($)로 잠가야 수식을 복사해도 안전합니다.\r
  tips:\r
  - 네 번째 인자 FALSE(또는 0)는 정확히 일치하는 값만 찾으라는 뜻입니다. TRUE는 근사 매칭이라 정렬되지 않은 키에는 위험합니다. 자동화에서는 항상 FALSE를 권장합니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    codes = book.active\r
    codes.title = "Codes"\r
    codes.append(["code", "label"])\r
    codes.append(["SE", "Seoul"])\r
    codes.append(["BS", "Busan"])\r
    codes.append(["DG", "Daegu"])\r
\r
    main = book.create_sheet("Main")\r
    main.append(["code", "region"])\r
    main.append(["SE", "=VLOOKUP(A2,Codes!$A$2:$B$4,2,FALSE)"])\r
    main.append(["BS", "=VLOOKUP(A3,Codes!$A$2:$B$4,2,FALSE)"])\r
    main.append(["DG", "=VLOOKUP(A4,Codes!$A$2:$B$4,2,FALSE)"])\r
    [main.cell(row=row, column=2).value for row in range(2, 5)]\r
  exercise:\r
    prompt: Codes에 ("IC", "Incheon")을 추가하고 Main에 IC 행을 더해 같은 VLOOKUP 수식이 동작하도록 영역을 확장하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      codes = book.active\r
      codes.title = "Codes"\r
      codes.append(["code", "label"])\r
      codes.append(["SE", "Seoul"])\r
      codes.append(["BS", "Busan"])\r
      codes.append(["DG", "Daegu"])\r
      codes.append(___)\r
\r
      main = book.create_sheet("Main")\r
      main.append(["code", "region"])\r
      for rowIndex, code in enumerate(["SE", "BS", "DG", "IC"], start=2):\r
          main.cell(row=rowIndex, column=1, value=code)\r
          main.cell(\r
              row=rowIndex,\r
              column=2,\r
              value=f"=VLOOKUP(A{rowIndex},Codes!$A$2:$B$___,2,FALSE)",\r
          )\r
      [main.cell(row=row, column=2).value for row in range(2, 6)]\r
    hints:\r
    - "Codes의 마지막 행 번호로 영역 끝을 바꾸세요. 5행까지 4개 코드면 $B$5입니다."\r
  check:\r
    noError: VLOOKUP 영역 좌표가 실제 Codes 시트의 데이터 범위를 포함해야 합니다.\r
    resultCheck: 4개 VLOOKUP 수식 문자열이 모두 같은 영역과 같은 컬럼 인덱스 2를 사용해야 합니다.\r
- id: validation\r
  title: 6단계. 검증 루프 - 수식 문자열 계약\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 검증\r
  goal: 수식 자체가 의도한 함수와 영역을 포함하는지 코드로 검증한다.\r
  why: 수식 결과값은 Excel을 거쳐야 채워지지만, 수식 문자열 자체는 openpyxl로 즉시 검증할 수 있습니다. 이것이 자동화 신뢰의 1차 방어선입니다.\r
  explanation: |-\r
    \`buildInvoice\`는 인보이스를 만드는 함수입니다. 저장 후 다시 열어 핵심 셀이 (1) 수식 문자열인지, (2) 의도한 함수와 영역을 참조하는지 assert로 확인합니다.\r
  tips:\r
  - 수식 문자열에 포함되어야 할 키워드(예 "SUM", "tax_rate")를 in 연산자로 확인하면 가벼우면서도 의미 있는 계약이 됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.workbook.defined_name import DefinedName\r
\r
    def buildInvoice(path, items, taxRate):\r
        book = Workbook()\r
        settings = book.active\r
        settings.title = "Settings"\r
        settings["A1"] = "tax_rate"\r
        settings["B1"] = taxRate\r
        book.defined_names["tax_rate"] = DefinedName(\r
            name="tax_rate", attr_text="Settings!$B$1"\r
        )\r
        invoice = book.create_sheet("Invoice")\r
        invoice.append(["item", "amount"])\r
        for item, amount in items:\r
            invoice.append([item, amount])\r
        subtotalRow = len(items) + 2\r
        invoice.cell(row=subtotalRow, column=1, value="subtotal")\r
        invoice.cell(row=subtotalRow, column=2, value=f"=SUM(B2:B{subtotalRow - 1})")\r
        invoice.cell(row=subtotalRow + 1, column=1, value="tax")\r
        invoice.cell(row=subtotalRow + 1, column=2, value=f"=B{subtotalRow}*tax_rate")\r
        invoice.cell(row=subtotalRow + 2, column=1, value="total")\r
        invoice.cell(\r
            row=subtotalRow + 2,\r
            column=2,\r
            value=f"=B{subtotalRow}+B{subtotalRow + 1}",\r
        )\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    invoicePath = buildInvoice(\r
        Path(workdir.name) / "invoice.xlsx",\r
        [("pen", 1000), ("book", 12000), ("notebook", 5000)],\r
        0.1,\r
    )\r
\r
    reopened = load_workbook(invoicePath)\r
    invoiceSheet = reopened["Invoice"]\r
    subtotalValue = invoiceSheet["B5"].value\r
    taxValue = invoiceSheet["B6"].value\r
    totalValue = invoiceSheet["B7"].value\r
    assert isinstance(subtotalValue, str) and subtotalValue.startswith("=SUM")\r
    assert "tax_rate" in taxValue\r
    assert "B5" in totalValue and "B6" in totalValue\r
    subtotalValue, taxValue, totalValue\r
  exercise:\r
    prompt: items에 한 줄을 더 추가했을 때, subtotal 수식의 영역(B2:B?)이 자동으로 한 칸 늘어나는지 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.workbook.defined_name import DefinedName\r
\r
      def buildInvoice(path, items, taxRate):\r
          book = Workbook()\r
          settings = book.active\r
          settings.title = "Settings"\r
          settings["A1"] = "tax_rate"\r
          settings["B1"] = taxRate\r
          book.defined_names["tax_rate"] = DefinedName(\r
              name="tax_rate", attr_text="Settings!$B$1"\r
          )\r
          invoice = book.create_sheet("Invoice")\r
          invoice.append(["item", "amount"])\r
          for item, amount in items:\r
              invoice.append([item, amount])\r
          subtotalRow = len(items) + 2\r
          invoice.cell(row=subtotalRow, column=1, value="subtotal")\r
          invoice.cell(row=subtotalRow, column=2, value=f"=SUM(B2:B{subtotalRow - 1})")\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      invoicePath = buildInvoice(\r
          Path(workdir.name) / "invoice.xlsx",\r
          [("pen", 1000), ("book", 12000), ("notebook", 5000), ___],\r
          0.1,\r
      )\r
      reopened = load_workbook(invoicePath)\r
      subtotalValue = reopened["Invoice"].cell(row=___, column=2).value\r
      subtotalValue\r
    hints:\r
    - "아이템 4개면 subtotal 행은 6, 영역은 B2:B5가 됩니다."\r
  check:\r
    noError: buildInvoice가 items 길이에 맞게 subtotal 행을 정확히 계산해야 합니다.\r
    resultCheck: subtotal 수식 문자열의 영역이 추가된 행 수에 맞게 확장되어야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: 수식 입력·DefinedName·VLOOKUP을 두 가지 양식(견적서·수강신청서)에 적용한다.\r
  why: 수식 자동화는 양식 단위로 직접 만들어 봐야 수식 문자열 패턴이 익숙해집니다.\r
  explanation: |-\r
    미션1은 견적서(소계/세금/총액 수식)를 만들고 수식 문자열을 assert로 검증합니다. 미션2는 강의 코드 매핑표 + 수강신청서를 만들어 VLOOKUP 수식이 매핑 영역을 정확히 가리키는지 확인합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`quote*\`(미션1), \`enroll*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.workbook.defined_name import DefinedName\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.workbook.defined_name import DefinedName\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1은 항목 N개 + 소계 SUM 수식 + tax_rate 이름 영역 + 총액.\r
    - 미션2는 Codes 시트 + 신청서 시트, VLOOKUP은 절대 참조($)로 잠가야 안전.\r
  check:\r
    noError: 수식 문자열이 등호로 시작하고 영역 좌표가 유효해야 합니다.\r
    resultCheck: 미션1 총액 수식과 미션2 VLOOKUP 수식이 모두 의도한 영역을 참조해야 합니다.\r
  blocks:\r
  - type: tip\r
    content: 두 미션은 서로 다른 prefix로 변수를 분리합니다.\r
  - type: expansion\r
    title: "미션1: 견적서 - 소계/세금/총액 수식 + DefinedName"\r
    blocks:\r
    - type: code\r
      title: 견적서 생성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.workbook.defined_name import DefinedName\r
\r
        quoteDir = TemporaryDirectory()\r
        quotePath = Path(quoteDir.name) / "quote.xlsx"\r
\r
        quoteBook = Workbook()\r
        quoteSettings = quoteBook.active\r
        quoteSettings.title = "Settings"\r
        quoteSettings["A1"] = "tax_rate"\r
        quoteSettings["B1"] = 0.1\r
        quoteBook.defined_names["tax_rate"] = DefinedName(\r
            name="tax_rate", attr_text="Settings!$B$1"\r
        )\r
\r
        quoteSheet = quoteBook.create_sheet("Quote")\r
        quoteSheet.append(["item", "quantity", "unit_price", "amount"])\r
        quoteItems = [("Notebook", 2, 1200000), ("Mouse", 5, 25000), ("Cable", 10, 8000)]\r
        for index, (item, qty, price) in enumerate(quoteItems, start=2):\r
            quoteSheet.cell(row=index, column=1, value=item)\r
            quoteSheet.cell(row=index, column=2, value=qty)\r
            quoteSheet.cell(row=index, column=3, value=price)\r
            quoteSheet.cell(row=index, column=4, value=f"=B{index}*C{index}")\r
        subtotalRow = len(quoteItems) + 2\r
        quoteSheet.cell(row=subtotalRow, column=1, value="subtotal")\r
        quoteSheet.cell(row=subtotalRow, column=4, value=f"=SUM(D2:D{subtotalRow - 1})")\r
        quoteSheet.cell(row=subtotalRow + 1, column=1, value="tax")\r
        quoteSheet.cell(row=subtotalRow + 1, column=4, value=f"=D{subtotalRow}*tax_rate")\r
        quoteSheet.cell(row=subtotalRow + 2, column=1, value="total")\r
        quoteSheet.cell(row=subtotalRow + 2, column=4, value=f"=D{subtotalRow}+D{subtotalRow + 1}")\r
        quoteBook.save(quotePath)\r
        subtotalRow\r
    - type: code\r
      title: 수식 문자열 검증\r
      content: |-\r
        quoteReopen = load_workbook(quotePath)\r
        quoteBack = quoteReopen["Quote"]\r
        subtotalFormula = quoteBack.cell(row=5, column=4).value\r
        taxFormula = quoteBack.cell(row=6, column=4).value\r
        totalFormula = quoteBack.cell(row=7, column=4).value\r
        assert subtotalFormula.startswith("=SUM")\r
        assert "tax_rate" in taxFormula\r
        assert "D5" in totalFormula and "D6" in totalFormula\r
        subtotalFormula, taxFormula, totalFormula\r
  - type: expansion\r
    title: "미션2: 강의 코드 매핑 + VLOOKUP 수강 신청서"\r
    blocks:\r
    - type: code\r
      title: Codes 시트와 Enrollment 시트\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
\r
        enrollDir = TemporaryDirectory()\r
        enrollPath = Path(enrollDir.name) / "enrollment.xlsx"\r
\r
        enrollBook = Workbook()\r
        enrollCodes = enrollBook.active\r
        enrollCodes.title = "Codes"\r
        enrollCodes.append(["code", "course"])\r
        codePairs = [("CS101", "프로그래밍 입문"), ("CS201", "자료구조"), ("CS301", "운영체제")]\r
        for pair in codePairs:\r
            enrollCodes.append(list(pair))\r
\r
        enrollMain = enrollBook.create_sheet("Enrollment")\r
        enrollMain.append(["student", "code", "course"])\r
        enrollStudents = [("Alice", "CS101"), ("Bob", "CS201"), ("Carol", "CS301")]\r
        for index, (student, code) in enumerate(enrollStudents, start=2):\r
            enrollMain.cell(row=index, column=1, value=student)\r
            enrollMain.cell(row=index, column=2, value=code)\r
            enrollMain.cell(\r
                row=index,\r
                column=3,\r
                value=f"=VLOOKUP(B{index},Codes!$A$2:$B$4,2,FALSE)",\r
            )\r
        enrollBook.save(enrollPath)\r
        enrollMain.max_row\r
    - type: code\r
      title: VLOOKUP 수식 영역 검증\r
      content: |-\r
        enrollReopen = load_workbook(enrollPath)\r
        enrollBack = enrollReopen["Enrollment"]\r
        for row in range(2, 5):\r
            formula = enrollBack.cell(row=row, column=3).value\r
            assert formula.startswith("=VLOOKUP")\r
            assert "$A$2:$B$4" in formula\r
            assert "FALSE" in formula\r
        [enrollBack.cell(row=row, column=3).value for row in range(2, 5)]\r
- id: summary\r
  title: 정리\r
  subtitle: 수식은 문자열이다\r
  blocks:\r
  - type: text\r
    content: |-\r
      openpyxl이 수식을 "문자열로 저장하고 사람이 열어 계산"하는 방식이라는 사실을 받아들이면, 그 위에서 만들 수 있는 자동화가 분명해집니다. 인보이스, 견적서, 정산 양식은 openpyxl의 수식이 가장 빛나는 영역입니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - 수식은 항상 "=" 시작 문자열로 cell.value에 대입\r
    - data_only=True로 다시 열면 캐시 결과를 읽지만 비어 있으면 None\r
    - DefinedName으로 이름 영역을 만들면 수식 가독성이 즉시 좋아진다\r
    - VLOOKUP 영역은 절대 참조($)로 잠그고, 4번째 인자는 항상 FALSE\r
    - 수식 결과값이 아닌 "수식 문자열 자체"를 assert로 검증해 자동화의 1차 방어선을 만든다\r
`;export{e as default};