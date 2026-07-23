var e=`meta:\r
  id: openpyxl_09\r
  title: 표와 데이터 검증\r
  order: 9\r
  category: openpyxl\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - Table\r
  - DataValidation\r
  - AutoFilter\r
  - freeze_panes\r
  seo:\r
    title: openpyxl 표와 데이터 검증 - Table·DataValidation·freeze_panes·AutoFilter\r
    description: 정렬 가능한 표, 드롭다운 데이터 검증, 행 고정, 자동 필터까지 - 입력 양식의 무결성을 코드로 잠그는 패턴을 정리합니다.\r
    keywords:\r
    - openpyxl Table\r
    - TableStyleInfo\r
    - DataValidation\r
    - freeze_panes\r
intro:\r
  direction: 입력 양식의 무결성을 표·데이터 검증·고정창·자동 필터로 잠가, 사람이 잘못된 값을 넣을 수 없는 보고서 양식을 만듭니다.\r
  benefits:\r
  - Table + TableStyleInfo로 정렬·필터·줄무늬가 한 번에 적용되는 표를 만듭니다.\r
  - DataValidation으로 셀에 드롭다운, 숫자 범위, 날짜 제약을 부여합니다.\r
  - freeze_panes로 헤더가 따라다니는 보고서를 만듭니다.\r
  diagram:\r
    steps:\r
    - label: Table\r
      detail: 영역을 정식 Table 객체로 등록.\r
    - label: TableStyleInfo\r
      detail: 줄무늬·헤더 강조·필터 토글.\r
    - label: DataValidation\r
      detail: list/decimal/date로 입력 제약.\r
    - label: freeze_panes / auto_filter\r
      detail: 사용 편의성을 코드로 보장.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: openpyxl.worksheet.table의 Table/TableStyleInfo와 openpyxl.worksheet.datavalidation의 DataValidation을 import해 사용한다.\r
    - label: 표·검증 재오픈 보존 확인\r
      detail: load_workbook으로 다시 열어 ws.tables 키, freeze_panes, data_validations.dataValidation 종류가 보존됐는지 assert로 확인한다.\r
sections:\r
- id: step1_table\r
  title: 1단계. 정식 Table 등록\r
  structuredPrimary: true\r
  subtitle: openpyxl.worksheet.table.Table\r
  goal: 데이터 영역을 정식 Table 객체로 등록해 정렬·필터 가능한 표로 만든다.\r
  why: '"단순 셀 영역"과 "표"는 다릅니다. 표는 자동 줄무늬, 헤더 강조, 자동 필터, 정렬이 따라옵니다. 사용자 경험이 즉시 달라집니다.'\r
  explanation: |-\r
    \`from openpyxl.worksheet.table import Table\`. \`Table(displayName="orders", ref="A1:D10")\`로 만들어 \`ws.add_table(table)\`로 추가합니다. displayName은 워크북 안에서 유일해야 합니다. ref는 헤더를 포함한 전체 영역입니다.\r
  tips:\r
  - 같은 워크북에 같은 displayName으로 표를 두 개 만들면 ValueError가 납니다. 시트 이름과 결합해 prefix를 두는 식으로 충돌을 피하세요.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.worksheet.table import Table\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "amount", "status"])\r
    for row in [\r
        ("A001", "Seoul", 120000, "ok"),\r
        ("A002", "Busan", 80000, "refund"),\r
        ("A003", "Daegu", 30000, "ok"),\r
    ]:\r
        sheet.append(list(row))\r
\r
    table = Table(displayName="ordersTable", ref="A1:D4")\r
    sheet.add_table(table)\r
    sheet.tables["ordersTable"].ref\r
  exercise:\r
    prompt: 데이터 행을 한 줄 더 추가한 뒤 Table의 ref를 "A1:D5"로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.worksheet.table import Table\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "amount", "status"])\r
      for row in [\r
          ("A001", "Seoul", 120000, "ok"),\r
          ("A002", "Busan", 80000, "refund"),\r
          ("A003", "Daegu", 30000, "ok"),\r
          ___,\r
      ]:\r
          sheet.append(list(row))\r
\r
      table = Table(displayName="ordersTable", ref=___)\r
      sheet.add_table(table)\r
      sheet.tables["ordersTable"].ref\r
    hints:\r
    - "4-튜플 (id, region, amount, status). ref는 헤더 포함 'A1:D5'."\r
  check:\r
    noError: Table의 ref는 헤더 포함 실제 데이터 영역과 정확히 일치해야 합니다.\r
    resultCheck: tables 등록 후 ref가 "A1:D5"여야 합니다.\r
- id: step2_table_style\r
  title: 2단계. TableStyleInfo로 스타일\r
  structuredPrimary: true\r
  subtitle: 줄무늬·필터 토글\r
  goal: TableStyleInfo로 표에 줄무늬와 필터 가시화를 적용한다.\r
  why: 표 스타일은 사람이 표를 표로 인식하게 만드는 시각 신호입니다. Excel 기본 스타일 이름을 그대로 쓸 수 있어 한 줄에 끝납니다.\r
  explanation: |-\r
    \`from openpyxl.worksheet.table import TableStyleInfo\`. \`TableStyleInfo(name="TableStyleMedium9", showFirstColumn=False, showLastColumn=False, showRowStripes=True, showColumnStripes=False)\`. name은 Excel 내장 표 스타일 이름(Light/Medium/Dark1~21).\r
  tips:\r
  - "TableStyleMedium9 (파란 헤더 + 회색 줄무늬)가 가장 자주 쓰는 무난한 선택입니다. 디자인 시스템을 통일하려면 워크북 전체에서 같은 name을 쓰세요."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "amount", "status"])\r
    for row in [("A001", "Seoul", 120000, "ok"), ("A002", "Busan", 80000, "refund")]:\r
        sheet.append(list(row))\r
\r
    table = Table(displayName="ordersTable", ref="A1:D3")\r
    table.tableStyleInfo = TableStyleInfo(\r
        name="TableStyleMedium9",\r
        showRowStripes=True,\r
        showColumnStripes=False,\r
    )\r
    sheet.add_table(table)\r
    table.tableStyleInfo.name, table.tableStyleInfo.showRowStripes\r
  exercise:\r
    prompt: 컬럼 줄무늬도 보이도록 showColumnStripes를 True로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "amount", "status"])\r
      for row in [("A001", "Seoul", 120000, "ok"), ("A002", "Busan", 80000, "refund")]:\r
          sheet.append(list(row))\r
\r
      table = Table(displayName="ordersTable", ref="A1:D3")\r
      table.tableStyleInfo = TableStyleInfo(\r
          name="TableStyleMedium9",\r
          showRowStripes=True,\r
          showColumnStripes=___,\r
      )\r
      sheet.add_table(table)\r
      table.tableStyleInfo.showColumnStripes\r
    hints:\r
    - 불리언 True입니다.\r
  check:\r
    noError: TableStyleInfo의 name이 유효한 내장 스타일 이름이어야 합니다.\r
    resultCheck: showColumnStripes가 True여야 합니다.\r
- id: step3_dv_list\r
  title: 3단계. 드롭다운 DataValidation\r
  structuredPrimary: true\r
  subtitle: list 타입\r
  goal: status 컬럼에 고정된 값들로만 입력되도록 드롭다운을 부여한다.\r
  why: 자유 입력은 항상 오타를 만듭니다. "ok"/"refund"/"pending" 같이 정해진 값만 받으면 보고서의 신뢰도가 올라갑니다.\r
  explanation: |-\r
    \`from openpyxl.worksheet.datavalidation import DataValidation\`. \`DataValidation(type="list", formula1='"ok,refund,pending"', allow_blank=True)\`. formula1의 인용 부호 한 쌍이 Excel 문자열 리스트 문법입니다. 만든 DataValidation을 \`ws.add_data_validation(dv)\` 한 뒤, \`dv.add("D2:D100")\`처럼 적용 영역을 추가합니다.\r
  tips:\r
  - "값이 많거나 동적이면 같은 워크북의 별도 시트 영역을 가리키게 할 수도 있습니다. formula1='Codes!$A$2:$A$10'."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.worksheet.datavalidation import DataValidation\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "amount", "status"])\r
\r
    statusDv = DataValidation(\r
        type="list",\r
        formula1='"ok,refund,pending"',\r
        allow_blank=True,\r
    )\r
    sheet.add_data_validation(statusDv)\r
    statusDv.add("D2:D100")\r
    sheet.data_validations.dataValidation[0].type, sheet.data_validations.dataValidation[0].sqref\r
  exercise:\r
    prompt: region 컬럼(B)에도 "Seoul,Busan,Daegu,Incheon" 드롭다운을 한 줄 추가해 같은 시트에 두 개의 DataValidation이 들어가도록 만드세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.worksheet.datavalidation import DataValidation\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "amount", "status"])\r
\r
      statusDv = DataValidation(type="list", formula1='"ok,refund,pending"', allow_blank=True)\r
      sheet.add_data_validation(statusDv)\r
      statusDv.add("D2:D100")\r
\r
      regionDv = DataValidation(type="list", formula1=___, allow_blank=True)\r
      sheet.add_data_validation(regionDv)\r
      regionDv.add(___)\r
\r
      len(sheet.data_validations.dataValidation)\r
    hints:\r
    - "formula1 문자열은 큰따옴표 안에 콤마 구분. region 영역은 'B2:B100'."\r
  check:\r
    noError: DataValidation type "list"는 formula1에 인용된 값 목록이 필요합니다.\r
    resultCheck: 시트의 data_validations.dataValidation 길이가 2여야 합니다.\r
- id: step4_dv_decimal\r
  title: 4단계. 숫자 범위 DataValidation\r
  structuredPrimary: true\r
  subtitle: decimal 타입\r
  goal: amount 컬럼에 음수와 0 이하 값이 들어가지 못하도록 범위 제약을 부여한다.\r
  why: 금액 컬럼에 음수가 들어가면 합계가 엉뚱해집니다. 입력 단계에서 막는 것이 가장 싸고 안전합니다.\r
  explanation: |-\r
    \`DataValidation(type="decimal", operator="greaterThan", formula1=0, allow_blank=False)\`. operator는 between, greaterThan, lessThanOrEqual 등 Excel 비교 키워드. 사용자가 잘못 입력하면 errorTitle/error 문자열로 안내 메시지를 띄울 수 있습니다.\r
  tips:\r
  - 에러 메시지는 보고서를 받는 사람이 실수 후 처음 보는 가이드입니다. 무성의한 기본 문구 대신 어떤 값이 허용되는지 명확히 적으세요.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.worksheet.datavalidation import DataValidation\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "amount", "status"])\r
\r
    amountDv = DataValidation(\r
        type="decimal",\r
        operator="greaterThan",\r
        formula1=0,\r
        allow_blank=False,\r
        errorTitle="잘못된 금액",\r
        error="amount는 0보다 커야 합니다.",\r
    )\r
    sheet.add_data_validation(amountDv)\r
    amountDv.add("C2:C100")\r
    amountDv.type, amountDv.operator, amountDv.error\r
  exercise:\r
    prompt: between 연산자로 0보다 크고 10,000,000 이하만 허용하도록 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.worksheet.datavalidation import DataValidation\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "amount", "status"])\r
\r
      amountDv = DataValidation(\r
          type="decimal",\r
          operator=___,\r
          formula1=0,\r
          formula2=___,\r
          allow_blank=False,\r
          errorTitle="잘못된 금액",\r
          error="amount는 0 초과 10,000,000 이하여야 합니다.",\r
      )\r
      sheet.add_data_validation(amountDv)\r
      amountDv.add("C2:C100")\r
      amountDv.operator, amountDv.formula1, amountDv.formula2\r
    hints:\r
    - "between은 formula1=하한, formula2=상한 두 값이 필요합니다."\r
  check:\r
    noError: between 연산자는 formula1과 formula2 모두 있어야 합니다.\r
    resultCheck: 결과 튜플의 operator가 "between"이어야 합니다.\r
- id: step5_freeze_filter\r
  title: 5단계. freeze_panes와 auto_filter\r
  structuredPrimary: true\r
  subtitle: 헤더 고정 + 자동 필터 토글\r
  goal: 헤더가 스크롤 시 따라다니도록 고정하고, 자동 필터 화살표를 헤더에 켠다.\r
  why: 행이 많은 보고서에서 헤더가 사라지면 컬럼이 무슨 의미인지 잊습니다. 자동 필터는 사용자가 직접 정렬/필터하는 비용을 0으로 만듭니다.\r
  explanation: |-\r
    \`ws.freeze_panes = "A2"\`는 1행을 위에 고정합니다. \`ws.freeze_panes = "B2"\`는 1행+A열을 모두 고정합니다. \`ws.auto_filter.ref = "A1:D100"\`은 헤더에 자동 필터 화살표를 켭니다.\r
  tips:\r
  - "Table을 등록하면 자동 필터가 표 영역에 자동으로 켜집니다. 표를 안 쓰는 시트에만 auto_filter.ref를 따로 지정하세요."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.title = "orders"\r
    sheet.append(["order_id", "region", "amount", "status"])\r
    sheet.freeze_panes = "A2"\r
    sheet.auto_filter.ref = "A1:D100"\r
    sheet.freeze_panes, sheet.auto_filter.ref\r
  exercise:\r
    prompt: freeze_panes를 "B2"로 바꿔 A열도 고정하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.title = "orders"\r
      sheet.append(["order_id", "region", "amount", "status"])\r
      sheet.freeze_panes = ___\r
      sheet.auto_filter.ref = "A1:D100"\r
      sheet.freeze_panes\r
    hints:\r
    - "freeze_panes는 셀 좌표 문자열입니다. 좌상단부터 그 좌표 이전 행/열이 모두 고정됩니다."\r
  check:\r
    noError: freeze_panes는 유효한 셀 좌표 문자열이어야 합니다.\r
    resultCheck: freeze_panes가 "B2"여야 합니다.\r
- id: validation\r
  title: 6단계. 검증 루프 - 주문 양식 무결성\r
  structuredPrimary: true\r
  subtitle: 저장 → 재오픈 → 양식 계약\r
  goal: 표·드롭다운·금액 범위·헤더 고정을 모두 결합한 주문 입력 양식을 만들고, 재오픈 후 각 제약이 보존됐는지 확인한다.\r
  why: 입력 양식의 신뢰는 "코드로 만든 제약이 파일 안에서도 살아 있는가"로 결정됩니다. 재오픈으로 검증하지 않으면 사용자에게 깨진 양식을 전달할 수 있습니다.\r
  explanation: |-\r
    \`buildOrderForm\`은 표 + 드롭다운 + 금액 검증 + 헤더 고정을 한 시트에 묶어 만듭니다. 재오픈 후 tables, data_validations, freeze_panes를 모두 확인합니다.\r
  tips:\r
  - "openpyxl이 보존하는 제약과 그렇지 않은 제약(예 일부 사용자 정의 표 스타일)을 알면, 양식을 더 안전하게 설계할 수 있습니다."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.worksheet.datavalidation import DataValidation\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
    def buildOrderForm(path):\r
        book = Workbook()\r
        sheet = book.active\r
        sheet.title = "orders"\r
        sheet.append(["order_id", "region", "amount", "status"])\r
        sheet.append(["A001", "Seoul", 120000, "ok"])\r
        sheet.append(["A002", "Busan", 80000, "refund"])\r
\r
        table = Table(displayName="ordersTable", ref="A1:D3")\r
        table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
        sheet.add_table(table)\r
\r
        statusDv = DataValidation(type="list", formula1='"ok,refund,pending"', allow_blank=True)\r
        sheet.add_data_validation(statusDv)\r
        statusDv.add("D2:D100")\r
\r
        amountDv = DataValidation(\r
            type="decimal",\r
            operator="greaterThan",\r
            formula1=0,\r
            allow_blank=False,\r
            errorTitle="잘못된 금액",\r
            error="amount는 0보다 커야 합니다.",\r
        )\r
        sheet.add_data_validation(amountDv)\r
        amountDv.add("C2:C100")\r
\r
        sheet.freeze_panes = "A2"\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    formPath = buildOrderForm(Path(workdir.name) / "order_form.xlsx")\r
\r
    reopened = load_workbook(formPath)\r
    orders = reopened["orders"]\r
    assert "ordersTable" in orders.tables\r
    assert orders.freeze_panes == "A2"\r
    dvTypes = {dv.type for dv in orders.data_validations.dataValidation}\r
    assert "list" in dvTypes\r
    assert "decimal" in dvTypes\r
    list(orders.tables), orders.freeze_panes, sorted(dvTypes)\r
  exercise:\r
    prompt: priority 컬럼(E)을 추가해 "high,normal,low" 드롭다운을 더하고 ref/freeze/검증 모두 확장하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.worksheet.datavalidation import DataValidation\r
      from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
      def buildOrderForm(path):\r
          book = Workbook()\r
          sheet = book.active\r
          sheet.title = "orders"\r
          sheet.append(["order_id", "region", "amount", "status", "priority"])\r
          sheet.append(["A001", "Seoul", 120000, "ok", "high"])\r
          sheet.append(["A002", "Busan", 80000, "refund", "low"])\r
\r
          table = Table(displayName="ordersTable", ref=___)\r
          table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
          sheet.add_table(table)\r
\r
          priorityDv = DataValidation(type="list", formula1='"high,normal,low"', allow_blank=True)\r
          sheet.add_data_validation(priorityDv)\r
          priorityDv.add("E2:E100")\r
\r
          sheet.freeze_panes = "A2"\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      formPath = buildOrderForm(Path(workdir.name) / "order_form.xlsx")\r
      reopened = load_workbook(formPath)\r
      assert "ordersTable" in reopened["orders"].tables\r
      reopened["orders"].tables["ordersTable"].ref\r
    hints:\r
    - "헤더 포함 'A1:E3' 영역. priority 추가로 컬럼이 5개."\r
  check:\r
    noError: Table의 ref가 헤더 포함 데이터 영역과 정확히 일치해야 합니다.\r
    resultCheck: ref가 "A1:E3"이어야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: Table·DataValidation·freeze_panes를 두 가지 실무 양식에 결합한다.\r
  why: 입력 양식의 무결성은 단계별 예제만으로는 부족합니다. 여러 검증을 한 양식에 결합해 봐야 양식이 양식답게 동작합니다.\r
  explanation: |-\r
    미션1은 휴가 신청서(부서 드롭다운 + 일수 1~30 범위 + Table + 헤더 고정)입니다. 미션2는 재고 입력 양식(카테고리 드롭다운 + 수량 양수 검증 + Table + A열까지 고정)입니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`leave*\`(미션1), \`stock*\`(미션2)로 격리됩니다. Table displayName도 미션별로 다르게 두지 않으면 ValueError가 납니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.worksheet.datavalidation import DataValidation\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.worksheet.datavalidation import DataValidation\r
      from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1 부서 목록은 '"영업,개발,운영"' 형식, 일수는 decimal 1~30.\r
    - 미션2 카테고리는 '"가전,주방,사무"', 수량은 decimal greaterThan 0.\r
  check:\r
    noError: DataValidation의 formula1은 큰따옴표로 감싼 콤마 문자열이어야 합니다.\r
    resultCheck: 재오픈 후 tables 개수와 freeze_panes 값이 모두 보존되어야 합니다.\r
  blocks:\r
  - type: tip\r
    content: Table의 displayName은 워크북 전역에서 고유해야 합니다. 두 미션을 한 파일에 합치지 말고 별도 파일로 분리하세요.\r
  - type: expansion\r
    title: "미션1: 휴가 신청서 양식"\r
    blocks:\r
    - type: code\r
      title: 부서 드롭다운 + 일수 범위 + Table + 헤더 고정\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.worksheet.datavalidation import DataValidation\r
        from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
        leaveDir = TemporaryDirectory()\r
        leavePath = Path(leaveDir.name) / "leave.xlsx"\r
\r
        leaveBook = Workbook()\r
        leaveSheet = leaveBook.active\r
        leaveSheet.title = "leaves"\r
        leaveSheet.append(["사번", "부서", "사유", "일수", "시작일"])\r
        leaveSheet.append(["E001", "영업", "연차", 3, "2026-06-03"])\r
        leaveSheet.append(["E002", "개발", "병가", 1, "2026-06-05"])\r
\r
        deptDv = DataValidation(type="list", formula1='"영업,개발,운영"', allow_blank=False)\r
        deptDv.errorTitle = "부서 선택"\r
        deptDv.error = "영업/개발/운영 중 하나를 선택하세요."\r
        leaveSheet.add_data_validation(deptDv)\r
        deptDv.add("B2:B100")\r
\r
        daysDv = DataValidation(type="decimal", operator="between", formula1=1, formula2=30)\r
        daysDv.errorTitle = "일수 범위"\r
        daysDv.error = "1~30일 사이로 입력하세요."\r
        leaveSheet.add_data_validation(daysDv)\r
        daysDv.add("D2:D100")\r
\r
        leaveTable = Table(displayName="LeaveTable", ref="A1:E3")\r
        leaveTable.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)\r
        leaveSheet.add_table(leaveTable)\r
        leaveSheet.freeze_panes = "A2"\r
        leaveBook.save(leavePath)\r
        leaveSheet.freeze_panes\r
    - type: code\r
      title: 양식 무결성 검증\r
      content: |-\r
        leaveReopen = load_workbook(leavePath)\r
        leaveBack = leaveReopen["leaves"]\r
        assert len(leaveBack.tables) == 1\r
        assert "LeaveTable" in leaveBack.tables\r
        assert leaveBack.freeze_panes == "A2"\r
        assert len(leaveBack.data_validations.dataValidation) == 2\r
        len(leaveBack.tables), leaveBack.freeze_panes\r
  - type: expansion\r
    title: "미션2: 재고 입력 양식"\r
    blocks:\r
    - type: code\r
      title: 카테고리 드롭다운 + 수량 양수 + Table + 첫 열 고정\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.worksheet.datavalidation import DataValidation\r
        from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
        stockDir = TemporaryDirectory()\r
        stockPath = Path(stockDir.name) / "stock.xlsx"\r
\r
        stockBook = Workbook()\r
        stockSheet = stockBook.active\r
        stockSheet.title = "stocks"\r
        stockSheet.append(["품번", "카테고리", "수량", "단가"])\r
        stockSheet.append(["SKU-1", "가전", 12, 480000])\r
        stockSheet.append(["SKU-2", "주방", 25, 35000])\r
\r
        categoryDv = DataValidation(type="list", formula1='"가전,주방,사무"', allow_blank=False)\r
        categoryDv.errorTitle = "카테고리 선택"\r
        categoryDv.error = "가전/주방/사무 중 하나를 선택하세요."\r
        stockSheet.add_data_validation(categoryDv)\r
        categoryDv.add("B2:B100")\r
\r
        qtyDv = DataValidation(type="decimal", operator="greaterThan", formula1=0)\r
        qtyDv.errorTitle = "수량은 양수"\r
        qtyDv.error = "0보다 큰 수량을 입력하세요."\r
        stockSheet.add_data_validation(qtyDv)\r
        qtyDv.add("C2:C100")\r
\r
        stockTable = Table(displayName="StockTable", ref="A1:D3")\r
        stockTable.tableStyleInfo = TableStyleInfo(name="TableStyleLight9", showRowStripes=True)\r
        stockSheet.add_table(stockTable)\r
        stockSheet.freeze_panes = "B2"\r
        stockBook.save(stockPath)\r
        stockSheet.freeze_panes\r
    - type: code\r
      title: 양식 무결성 검증\r
      content: |-\r
        stockReopen = load_workbook(stockPath)\r
        stockBack = stockReopen["stocks"]\r
        assert "StockTable" in stockBack.tables\r
        assert stockBack.freeze_panes == "B2"\r
        assert len(stockBack.data_validations.dataValidation) == 2\r
        len(stockBack.tables), stockBack.freeze_panes\r
- id: summary\r
  title: 정리\r
  subtitle: 양식의 무결성을 코드로\r
  blocks:\r
  - type: text\r
    content: |-\r
      입력 양식의 무결성을 표·검증·고정창으로 잠그면, 사용자의 실수는 자연스럽게 줄어듭니다. 다음 강의에서는 모든 강의의 기술을 한 워크북에 통합해 월간 매출 리포트 자동 생성기를 완성합니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - "Table(displayName, ref) + TableStyleInfo로 정렬·필터·줄무늬"\r
    - "DataValidation type=list/decimal/date로 입력 제약, add(range)로 영역 적용"\r
    - "errorTitle/error 문자열로 사용자에게 친절한 가이드"\r
    - "freeze_panes = 'A2'로 헤더 고정, 'B2'면 A열까지 고정"\r
    - "Table을 쓰면 auto_filter가 자동으로 켜진다 - 일반 영역에만 auto_filter.ref 따로 지정"\r
`;export{e as default};