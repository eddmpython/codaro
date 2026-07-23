var e=`meta:\r
  id: openpyxl_10\r
  title: 월간 매출 리포트 생성기\r
  order: 10\r
  category: openpyxl\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
  - openpyxl\r
  - pandas\r
  tags:\r
  - openpyxl\r
  - 리포트\r
  - 자동화\r
  - pandas\r
  - 종합프로젝트\r
  seo:\r
    title: openpyxl 월간 매출 리포트 생성기 - 다중 시트·수식·서식·차트 통합\r
    description: pandas DataFrame을 입력으로 받아 다중 시트, 수식, 스타일, 조건부 서식, 차트, 표·검증까지 모두 결합한 월간 매출 리포트를 한 함수로 생성합니다.\r
    keywords:\r
    - openpyxl 리포트\r
    - 월간 매출 리포트\r
    - pandas to_excel\r
    - 종합 프로젝트\r
intro:\r
  direction: "지금까지 익힌 모든 openpyxl 기술(시트·수식·서식·조건부 서식·차트·표·검증)을 하나의 함수로 묶어 월간 매출 리포트 자동 생성기를 완성합니다."\r
  benefits:\r
  - pandas DataFrame을 입력으로 받아 다중 시트 보고서를 자동 생성합니다.\r
  - 데이터 검증, 합계 수식, 조건부 서식, 차트가 모두 결합된 실무 양식 한 벌을 손에 넣습니다.\r
  - 같은 함수를 매월 다른 데이터로 호출하기만 하면 보고서가 나오는 진짜 자동화의 형태를 경험합니다.\r
  diagram:\r
    steps:\r
    - label: 입력 계약\r
      detail: pandas DataFrame, 필수 컬럼, 기준 임계값.\r
    - label: 시트 구성\r
      detail: summary / detail / raw 세 시트.\r
    - label: 스타일 + 차트\r
      detail: 헤더 NamedStyle + 조건부 서식 + Bar/Pie 차트.\r
    - label: 전수 재오픈 검증\r
      detail: 재오픈 후 시트 이름, 합계 수식 문자열, 차트 개수, Table 등록까지 모두 assert로 확인.\r
    runtime:\r
    - label: openpyxl + pandas 패키지 준비\r
      detail: pandas로 집계, openpyxl로 양식·서식·차트. uv run python에서 둘 다 import해 즉시 실행.\r
    - label: 월간 보고서 재오픈 전수 검증\r
      detail: 저장한 .xlsx를 load_workbook으로 다시 열어 sheetnames, headerStyle, SUM 수식, _charts 길이, salesDetail Table, raw 행 수까지 모두 확인.\r
sections:\r
- id: step1_input_contract\r
  title: 1단계. 입력 데이터 계약\r
  structuredPrimary: true\r
  subtitle: 필수 컬럼과 기본 정제\r
  goal: 보고서 생성기의 입력으로 받을 DataFrame의 형태를 명시적으로 잠근다.\r
  why: 자동 생성기의 신뢰는 입력 계약에서 시작합니다. 컬럼이 빠지거나 금액이 음수인 데이터를 그대로 받으면 보고서가 망가집니다.\r
  explanation: |-\r
    이 강의의 보고서는 ["date", "region", "product", "amount"] 네 컬럼의 DataFrame을 입력으로 받습니다. validateSalesFrame 함수는 컬럼 누락, 빈 데이터, 음수 금액을 모두 막습니다. 모든 자동화 함수의 첫 줄에 이런 검증이 있어야 합니다.\r
  tips:\r
  - "ValueError 메시지에는 어떤 컬럼이 빠졌는지, 어떤 행이 음수였는지를 명시하세요. 에러 메시지가 사용자의 첫 디버깅 단서입니다."\r
  snippet: |-\r
    import pandas as pd\r
\r
    def validateSalesFrame(frame):\r
        requiredColumns = {"date", "region", "product", "amount"}\r
        missingColumns = requiredColumns - set(frame.columns)\r
        if missingColumns:\r
            raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")\r
        if len(frame) == 0:\r
            raise ValueError("매출 데이터가 비어 있습니다.")\r
        if (frame["amount"] <= 0).any():\r
            raise ValueError("amount는 0보다 커야 합니다.")\r
        return True\r
\r
    salesFrame = pd.DataFrame([\r
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
    ])\r
    validateSalesFrame(salesFrame), len(salesFrame)\r
  exercise:\r
    prompt: amount가 0인 행을 한 줄 추가하면 ValueError가 나야 합니다. 직접 그렇게 만들어 보세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      def validateSalesFrame(frame):\r
          requiredColumns = {"date", "region", "product", "amount"}\r
          missingColumns = requiredColumns - set(frame.columns)\r
          if missingColumns:\r
              raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")\r
          if len(frame) == 0:\r
              raise ValueError("매출 데이터가 비어 있습니다.")\r
          if (frame["amount"] <= 0).any():\r
              raise ValueError("amount는 0보다 커야 합니다.")\r
          return True\r
\r
      bad = pd.DataFrame([\r
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": ___},\r
      ])\r
      try:\r
          validateSalesFrame(bad)\r
          raise AssertionError("0 amount를 통과시키면 안 됩니다.")\r
      except ValueError as exc:\r
          str(exc)\r
    hints:\r
    - "0 또는 음수를 넣으면 (frame['amount'] <= 0).any()가 True가 되어 ValueError가 납니다."\r
  check:\r
    noError: validateSalesFrame이 호출 가능해야 하고, try-except가 의도한 분기를 탑니다.\r
    resultCheck: 출력 문자열이 "amount는 0보다 커야 합니다." 메시지를 포함해야 합니다.\r
- id: step2_summary_with_formula\r
  title: 2단계. summary 시트와 합계 수식\r
  structuredPrimary: true\r
  subtitle: groupby + SUM 수식\r
  goal: 지역별 매출 합계를 pandas로 집계한 뒤, summary 시트에 표로 쓰고 총합 수식을 추가한다.\r
  why: 사람이 보는 보고서의 첫 화면은 항상 요약입니다. summary 시트가 가장 먼저 있어야 사용자가 한 번에 결론을 봅니다.\r
  explanation: |-\r
    pandas의 groupby로 region별 amount 합계를 만들고, openpyxl로 summary 시트에 적습니다. 마지막 행에는 \`=SUM(B2:B?)\` 수식을 직접 넣어 사용자가 데이터를 수정해도 총합이 자동으로 따라오게 합니다.\r
  tips:\r
  - "summary 시트의 첫 컬럼 너비는 region 이름 길이에, 둘째 컬럼은 통화 포맷 길이에 맞춰 두세요. 자동 너비가 없는 openpyxl에서는 이것이 작업의 마무리입니다."\r
  snippet: |-\r
    import pandas as pd\r
    from openpyxl import Workbook\r
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
\r
    salesFrame = pd.DataFrame([\r
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
    ])\r
    regionTotal = salesFrame.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)\r
\r
    book = Workbook()\r
    edge = Side(style="thin", color="FF000000")\r
    headerStyle = NamedStyle(name="headerStyle")\r
    headerStyle.font = Font(bold=True, color="FFFFFFFF")\r
    headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
    headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)\r
    headerStyle.alignment = Alignment(horizontal="center", vertical="center")\r
    book.add_named_style(headerStyle)\r
\r
    summary = book.active\r
    summary.title = "summary"\r
    summary.append(["region", "amount"])\r
    for cell in summary[1]:\r
        cell.style = "headerStyle"\r
    for _, row in regionTotal.iterrows():\r
        summary.append([row["region"], int(row["amount"])])\r
    lastRow = summary.max_row\r
    summary.cell(row=lastRow + 1, column=1, value="total").font = Font(bold=True)\r
    summary.cell(row=lastRow + 1, column=2, value=f"=SUM(B2:B{lastRow})").font = Font(bold=True)\r
    for amountCell in summary[f"B2:B{lastRow + 1}"]:\r
        amountCell[0].number_format = "#,##0\\"원\\""\r
    summary.column_dimensions["A"].width = 14\r
    summary.column_dimensions["B"].width = 18\r
    [(cell.value) for row in summary["A1:B5"] for cell in row]\r
  exercise:\r
    prompt: salesFrame에 ("2026-05-05", "Incheon", "Cable", 95000) 한 줄을 추가하고 lastRow + 1 위치의 SUM 수식이 자동으로 한 칸 늘어나는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from openpyxl import Workbook\r
      from openpyxl.styles import Font\r
\r
      salesFrame = pd.DataFrame([\r
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
          {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
          {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
          ___,\r
      ])\r
      regionTotal = salesFrame.groupby("region", as_index=False)["amount"].sum()\r
\r
      book = Workbook()\r
      summary = book.active\r
      summary.title = "summary"\r
      summary.append(["region", "amount"])\r
      for _, row in regionTotal.iterrows():\r
          summary.append([row["region"], int(row["amount"])])\r
      lastRow = summary.max_row\r
      summary.cell(row=lastRow + 1, column=2, value=f"=SUM(B2:B{lastRow})")\r
      summary.cell(row=lastRow + 1, column=2).value\r
    hints:\r
    - "dict {date, region, product, amount} 형식. region이 새 것이면 region 수가 늘어 summary 행도 늘어납니다."\r
  check:\r
    noError: groupby와 iterrows 호출이 ValueError 없이 끝나야 합니다.\r
    resultCheck: SUM 수식의 영역이 region 수에 맞춰 정확해야 합니다.\r
- id: step3_conditional_format\r
  title: 3단계. summary에 조건부 서식\r
  structuredPrimary: true\r
  subtitle: ColorScaleRule\r
  goal: summary 시트의 amount에 빨강·노랑·초록 신호등 색상을 자동 적용한다.\r
  why: 표만 보는 사용자는 어느 지역이 잘 됐는지를 찾으려 정렬을 합니다. 신호등이 있으면 정렬조차 필요 없습니다.\r
  explanation: |-\r
    \`ColorScaleRule(start_type="min", mid_type="percentile", mid_value=50, end_type="max", ...)\`을 summary의 amount 영역(total 행 제외)에 적용합니다. total 행 자체에는 신호등을 적용하지 않는 것이 깔끔합니다.\r
  tips:\r
  - "조건부 서식 영역은 헤더(1행)와 total(마지막) 모두 제외하는 것이 좋습니다. 'B2:B{lastRow}' 패턴을 외워 두세요."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.formatting.rule import ColorScaleRule\r
\r
    book = Workbook()\r
    summary = book.active\r
    summary.title = "summary"\r
    summary.append(["region", "amount"])\r
    for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:\r
        summary.append([region, amount])\r
    lastRow = summary.max_row\r
\r
    summary.conditional_formatting.add(\r
        f"B2:B{lastRow}",\r
        ColorScaleRule(\r
            start_type="min", start_color="FFF8696B",\r
            mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
            end_type="max", end_color="FF63BE7B",\r
        ),\r
    )\r
    [str(key.sqref) for key in summary.conditional_formatting._cf_rules.keys()]\r
  exercise:\r
    prompt: 신호등 영역에 total 행까지 포함되도록 잘못 잡은 뒤, 그것이 왜 보고서 가독성을 해치는지 직접 생각해 보고 원래대로 되돌리세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.formatting.rule import ColorScaleRule\r
\r
      book = Workbook()\r
      summary = book.active\r
      summary.title = "summary"\r
      summary.append(["region", "amount"])\r
      for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:\r
          summary.append([region, amount])\r
      summary.append(["total", 1895000])\r
      lastRowExcludingTotal = summary.max_row - ___\r
\r
      summary.conditional_formatting.add(\r
          f"B2:B{lastRowExcludingTotal}",\r
          ColorScaleRule(\r
              start_type="min", start_color="FFF8696B",\r
              mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
              end_type="max", end_color="FF63BE7B",\r
          ),\r
      )\r
      [str(key.sqref) for key in summary.conditional_formatting._cf_rules.keys()]\r
    hints:\r
    - total 행이 항상 최대값이라 신호등이 total을 초록으로 잡고 다른 지역을 모두 빨강 쪽으로 밉니다. 의도와 다른 색이 나옵니다.\r
  check:\r
    noError: ColorScaleRule 영역이 유효한 셀 좌표 문자열이어야 합니다.\r
    resultCheck: 적용된 영역이 total 행을 제외한 데이터 영역이어야 합니다.\r
- id: step4_charts\r
  title: 4단계. 막대 차트와 파이 차트\r
  structuredPrimary: true\r
  subtitle: BarChart + PieChart\r
  goal: summary 시트에 지역별 막대 차트와 비중 파이 차트를 모두 배치한다.\r
  why: 막대로 절대 금액, 파이로 비중을 동시에 보여 주면 의사결정자가 한 번에 두 질문에 답할 수 있습니다.\r
  explanation: |-\r
    07강에서 익힌 BarChart와 PieChart 패턴을 그대로 재사용합니다. Reference의 max_row는 total 행 직전까지로 잡습니다.\r
  tips:\r
  - "차트의 anchor를 한 칸씩 분리해 두면 사용자가 보고서를 인쇄해도 두 차트가 같은 페이지에 정리됩니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.chart import BarChart, PieChart, Reference\r
\r
    book = Workbook()\r
    summary = book.active\r
    summary.title = "summary"\r
    summary.append(["region", "amount"])\r
    for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:\r
        summary.append([region, amount])\r
    dataLastRow = summary.max_row\r
\r
    bar = BarChart()\r
    bar.title = "지역별 매출"\r
    bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
    bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
    summary.add_chart(bar, "D2")\r
\r
    pie = PieChart()\r
    pie.title = "지역 매출 비중"\r
    pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
    pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
    summary.add_chart(pie, "D20")\r
\r
    len(summary._charts)\r
  exercise:\r
    prompt: 두 차트 외에 LineChart를 하나 더 추가해 차트가 총 3개가 되도록 만드세요. (요약 시트라 시각 과잉이 우려되지만 연습 목적입니다.)\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.chart import BarChart, LineChart, PieChart, Reference\r
\r
      book = Workbook()\r
      summary = book.active\r
      summary.title = "summary"\r
      summary.append(["region", "amount"])\r
      for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:\r
          summary.append([region, amount])\r
      dataLastRow = summary.max_row\r
\r
      bar = BarChart()\r
      bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
      bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
      summary.add_chart(bar, "D2")\r
\r
      pie = PieChart()\r
      pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
      pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
      summary.add_chart(pie, "D20")\r
\r
      line = LineChart()\r
      line.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
      line.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
      summary.add_chart(line, ___)\r
\r
      len(summary._charts)\r
    hints:\r
    - "anchor는 빈 좌표 문자열 (예 'D38'). 두 차트 아래로 보내세요."\r
  check:\r
    noError: 세 차트의 Reference 영역이 동일하게 유효해야 합니다.\r
    resultCheck: _charts 길이가 3이어야 합니다.\r
- id: step5_detail_and_raw\r
  title: 5단계. detail 시트(표)와 raw 시트(원본)\r
  structuredPrimary: true\r
  subtitle: Table + 원본 보존\r
  goal: detail 시트는 정렬·필터 가능한 표로, raw 시트는 입력 DataFrame을 그대로 보존한다.\r
  why: "요약만 보고 의문이 생긴 사용자가 원본을 추적할 수 있어야 합니다. raw 시트는 보고서의 감사(audit) 추적성을 만듭니다."\r
  explanation: |-\r
    detail 시트에는 매출 명세를 Table로 등록해 자동 필터와 줄무늬가 켜진 표로 둡니다. raw 시트에는 입력 DataFrame을 그대로 적습니다. 두 시트가 함께 있으면 보고서는 요약·중간·원본의 3계층 구조가 됩니다.\r
  tips:\r
  - "raw 시트가 길어지면 freeze_panes를 'A2'로 줘서 헤더가 따라다니게 하세요. 사용자가 스크롤 중 컬럼 의미를 잊지 않습니다."\r
  snippet: |-\r
    import pandas as pd\r
    from openpyxl import Workbook\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
    salesFrame = pd.DataFrame([\r
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
    ])\r
\r
    book = Workbook()\r
    book.active.title = "summary"\r
    detail = book.create_sheet("detail")\r
    raw = book.create_sheet("raw")\r
    headers = list(salesFrame.columns)\r
    detail.append(headers)\r
    raw.append(headers)\r
    for _, row in salesFrame.iterrows():\r
        detail.append([row[col] for col in headers])\r
        raw.append([row[col] for col in headers])\r
\r
    detail.freeze_panes = "A2"\r
    raw.freeze_panes = "A2"\r
\r
    table = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")\r
    table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
    detail.add_table(table)\r
\r
    detail.tables["salesDetail"].ref, raw.max_row\r
  exercise:\r
    prompt: detail 표의 ref가 데이터 크기와 항상 맞도록 max_row를 사용했는지 확인하고, salesFrame을 한 줄 추가했을 때 ref가 따라 늘어나는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from openpyxl import Workbook\r
      from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
      salesFrame = pd.DataFrame([\r
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
          {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
          {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
          ___,\r
      ])\r
\r
      book = Workbook()\r
      book.active.title = "summary"\r
      detail = book.create_sheet("detail")\r
      headers = list(salesFrame.columns)\r
      detail.append(headers)\r
      for _, row in salesFrame.iterrows():\r
          detail.append([row[col] for col in headers])\r
\r
      table = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")\r
      table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
      detail.add_table(table)\r
      detail.tables["salesDetail"].ref\r
    hints:\r
    - "한 줄 더 추가 = max_row 한 증가. ref가 자동으로 'A1:D6'로 따라 늘어납니다."\r
  check:\r
    noError: Table ref가 detail.max_row 기준으로 만들어져야 합니다.\r
    resultCheck: 행 추가 시 ref의 끝 행 번호가 한 증가해야 합니다.\r
- id: validation\r
  title: 6단계. 검증 루프 - 보고서 생성기의 종합 계약\r
  structuredPrimary: true\r
  subtitle: 한 함수로 전체 보고서 + 재오픈 전수 검증\r
  goal: 입력 DataFrame을 받아 summary/detail/raw 세 시트의 완성된 보고서를 만들고, 재오픈 후 모든 요소(시트·표·차트·수식·조건부 서식)를 자동 검증한다.\r
  why: 월말마다 함수 한 번 호출이면 보고서가 자동으로 나오는 형태가 진짜 자동화입니다. 검증이 모든 요소를 덮고 있어야 안심하고 매월 호출할 수 있습니다.\r
  explanation: |-\r
    \`buildMonthlyReport\`는 이번 강의의 모든 기술을 한 함수로 묶습니다. 입력 검증 → summary 시트(헤더 스타일 + 집계 + SUM 수식 + 조건부 서식 + 차트) → detail 시트(Table) → raw 시트(원본 보존) → 저장 → 재오픈 검증. 한 함수가 곧 보고서 양식의 단일 진실 원천입니다.\r
  tips:\r
  - "이 함수를 매월 다른 입력 DataFrame으로 호출해도 결과 구조가 같아야 합니다. 그게 자동화의 의미입니다."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    import pandas as pd\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.chart import BarChart, PieChart, Reference\r
    from openpyxl.formatting.rule import ColorScaleRule\r
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
    def buildMonthlyReport(path, frame):\r
        requiredColumns = {"date", "region", "product", "amount"}\r
        missingColumns = requiredColumns - set(frame.columns)\r
        if missingColumns:\r
            raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")\r
        if (frame["amount"] <= 0).any():\r
            raise ValueError("amount는 0보다 커야 합니다.")\r
\r
        regionTotal = frame.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)\r
\r
        book = Workbook()\r
        edge = Side(style="thin", color="FF000000")\r
        headerStyle = NamedStyle(name="headerStyle")\r
        headerStyle.font = Font(bold=True, color="FFFFFFFF")\r
        headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
        headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)\r
        headerStyle.alignment = Alignment(horizontal="center", vertical="center")\r
        book.add_named_style(headerStyle)\r
\r
        summary = book.active\r
        summary.title = "summary"\r
        summary.append(["region", "amount"])\r
        for cell in summary[1]:\r
            cell.style = "headerStyle"\r
        for _, row in regionTotal.iterrows():\r
            summary.append([row["region"], int(row["amount"])])\r
        dataLastRow = summary.max_row\r
        summary.cell(row=dataLastRow + 1, column=1, value="total").font = Font(bold=True)\r
        summary.cell(\r
            row=dataLastRow + 1,\r
            column=2,\r
            value=f"=SUM(B2:B{dataLastRow})",\r
        ).font = Font(bold=True)\r
        for amountRow in summary[f"B2:B{dataLastRow + 1}"]:\r
            amountRow[0].number_format = "#,##0\\"원\\""\r
        summary.column_dimensions["A"].width = 14\r
        summary.column_dimensions["B"].width = 18\r
\r
        summary.conditional_formatting.add(\r
            f"B2:B{dataLastRow}",\r
            ColorScaleRule(\r
                start_type="min", start_color="FFF8696B",\r
                mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
                end_type="max", end_color="FF63BE7B",\r
            ),\r
        )\r
\r
        bar = BarChart()\r
        bar.title = "지역별 매출"\r
        bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
        bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
        summary.add_chart(bar, "D2")\r
\r
        pie = PieChart()\r
        pie.title = "지역 비중"\r
        pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)\r
        pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))\r
        summary.add_chart(pie, "D20")\r
\r
        detail = book.create_sheet("detail")\r
        headers = ["date", "region", "product", "amount"]\r
        detail.append(headers)\r
        for _, row in frame.iterrows():\r
            detail.append([row[col] for col in headers])\r
        detail.freeze_panes = "A2"\r
        detailTable = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")\r
        detailTable.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
        detail.add_table(detailTable)\r
        for amountRow in detail[f"D2:D{detail.max_row}"]:\r
            amountRow[0].number_format = "#,##0\\"원\\""\r
\r
        raw = book.create_sheet("raw")\r
        raw.append(headers)\r
        for _, row in frame.iterrows():\r
            raw.append([row[col] for col in headers])\r
        raw.freeze_panes = "A2"\r
\r
        book.save(path)\r
        return path\r
\r
    samples = pd.DataFrame([\r
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},\r
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},\r
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},\r
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},\r
        {"date": "2026-05-05", "region": "Incheon", "product": "Cable", "amount": 95000},\r
    ])\r
    workdir = TemporaryDirectory()\r
    reportPath = buildMonthlyReport(Path(workdir.name) / "2026-05.xlsx", samples)\r
\r
    reopened = load_workbook(reportPath)\r
    assert reopened.sheetnames == ["summary", "detail", "raw"]\r
    summarySheet = reopened["summary"]\r
    assert summarySheet["A1"].style == "headerStyle"\r
    totalFormula = summarySheet.cell(row=summarySheet.max_row, column=2).value\r
    assert isinstance(totalFormula, str) and totalFormula.startswith("=SUM")\r
    assert len(summarySheet._charts) == 2\r
    assert "salesDetail" in reopened["detail"].tables\r
    assert reopened["raw"].max_row == len(samples) + 1\r
    reopened.sheetnames, totalFormula, len(summarySheet._charts), reopened["raw"].max_row\r
  exercise:\r
    prompt: samples를 2026년 6월 자료 5건으로 바꾸고 (날짜 6월, region/product 자유) 보고서가 그대로 잘 만들어지는지, 모든 assert가 통과하는지 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      from openpyxl import load_workbook\r
      # buildMonthlyReport은 위 셀에서 이미 정의되어 있다고 가정합니다.\r
\r
      juneSamples = pd.DataFrame([\r
          {"date": "2026-06-01", "region": "Seoul", "product": "Notebook", "amount": ___},\r
          {"date": "2026-06-02", "region": "Busan", "product": "Monitor", "amount": ___},\r
          {"date": "2026-06-03", "region": "Seoul", "product": "Keyboard", "amount": ___},\r
          {"date": "2026-06-04", "region": "Daegu", "product": "Mouse", "amount": ___},\r
          {"date": "2026-06-05", "region": "Incheon", "product": "Cable", "amount": ___},\r
      ])\r
      workdir = TemporaryDirectory()\r
      juneReport = buildMonthlyReport(Path(workdir.name) / "2026-06.xlsx", juneSamples)\r
      reopened = load_workbook(juneReport)\r
      assert reopened.sheetnames == ["summary", "detail", "raw"]\r
      assert reopened["raw"].max_row == 6\r
      reopened.sheetnames\r
    hints:\r
    - 모든 amount는 양수여야 하고, 행 수 5 + 헤더 1 = raw 6행.\r
  check:\r
    noError: buildMonthlyReport이 정의된 환경에서 호출되어야 합니다.\r
    resultCheck: assert가 모두 통과하고 sheetnames가 ["summary", "detail", "raw"]여야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: 통합 보고서 생성 함수를 다른 도메인 데이터에 재사용하고, 입력 검증 실패 케이스도 자동 확인한다.\r
  why: 진짜 자동화는 같은 함수가 다른 데이터에 그대로 도는가, 그리고 잘못된 입력을 단호히 막는가로 결정됩니다.\r
  explanation: |-\r
    미션1은 학생 시험 점수 DataFrame을 입력으로 같은 패턴(요약·detail·raw)의 보고서를 생성합니다. 미션2는 컬럼 누락·음수·빈 DataFrame 세 가지 잘못된 입력에 대해 모두 ValueError가 나는지 확인합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`score*\`(미션1), \`bad*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    import pandas as pd\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.styles import Font\r
    from openpyxl.worksheet.table import Table, TableStyleInfo\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      from openpyxl import Workbook, load_workbook\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1은 buildScoreReport(path, frame) 함수를 직접 정의 - group_by class, summary + detail + raw 3시트.\r
    - 미션2는 try/except로 세 잘못된 입력에 ValueError가 나는지 확인.\r
  check:\r
    noError: 미션1 함수가 ValueError 없이 끝나야 합니다. 미션2는 의도된 ValueError가 떠야 합니다.\r
    resultCheck: 재오픈한 미션1 보고서가 3시트 구조, 미션2의 세 케이스 모두 ValueError를 캐치해야 합니다.\r
  blocks:\r
  - type: tip\r
    content: 미션1 함수는 buildMonthlyReport과 같은 골격(검증 → 집계 → 시트 → 저장 → 반환)으로 작성합니다.\r
  - type: expansion\r
    title: "미션1: 학생 시험 점수 보고서 생성기"\r
    blocks:\r
    - type: code\r
      title: buildScoreReport 함수 정의\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.styles import Font\r
        from openpyxl.worksheet.table import Table, TableStyleInfo\r
\r
        def buildScoreReport(path, frame):\r
            requiredColumns = {"student", "class", "subject", "score"}\r
            missingColumns = requiredColumns - set(frame.columns)\r
            if missingColumns:\r
                raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")\r
            if (frame["score"] < 0).any() or (frame["score"] > 100).any():\r
                raise ValueError("score는 0~100 범위여야 합니다.")\r
            classMean = frame.groupby("class", as_index=False)["score"].mean()\r
            classMean["score"] = classMean["score"].round(2)\r
\r
            book = Workbook()\r
            summary = book.active\r
            summary.title = "summary"\r
            summary.append(["class", "average_score"])\r
            for _, row in classMean.iterrows():\r
                summary.append([row["class"], float(row["score"])])\r
\r
            detail = book.create_sheet("detail")\r
            headers = ["student", "class", "subject", "score"]\r
            detail.append(headers)\r
            for _, row in frame.iterrows():\r
                detail.append([row[col] for col in headers])\r
            detailTable = Table(displayName="scoreDetail", ref=f"A1:D{detail.max_row}")\r
            detailTable.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)\r
            detail.add_table(detailTable)\r
            detail.freeze_panes = "A2"\r
\r
            raw = book.create_sheet("raw")\r
            raw.append(headers)\r
            for _, row in frame.iterrows():\r
                raw.append([row[col] for col in headers])\r
            book.save(path)\r
            return path\r
\r
        scoreDir = TemporaryDirectory()\r
        scoreFrame = pd.DataFrame([\r
            {"student": "Alice", "class": "A", "subject": "Math", "score": 88},\r
            {"student": "Bob", "class": "A", "subject": "Math", "score": 72},\r
            {"student": "Carol", "class": "B", "subject": "Math", "score": 95},\r
            {"student": "Dan", "class": "B", "subject": "Math", "score": 60},\r
            {"student": "Eve", "class": "C", "subject": "Math", "score": 78},\r
        ])\r
        scorePath = buildScoreReport(Path(scoreDir.name) / "scores.xlsx", scoreFrame)\r
        scorePath\r
    - type: code\r
      title: 보고서 재오픈 검증\r
      content: |-\r
        scoreReopen = load_workbook(scorePath)\r
        assert scoreReopen.sheetnames == ["summary", "detail", "raw"]\r
        assert "scoreDetail" in scoreReopen["detail"].tables\r
        assert scoreReopen["raw"].max_row == 6\r
        scoreSummary = scoreReopen["summary"]\r
        assert scoreSummary["A1"].value == "class"\r
        scoreReopen.sheetnames, scoreReopen["raw"].max_row\r
  - type: expansion\r
    title: "미션2: 입력 검증 실패 케이스 3종"\r
    blocks:\r
    - type: code\r
      title: validateSalesFrame 재정의와 세 가지 잘못된 입력\r
      content: |-\r
        import pandas as pd\r
\r
        def validateSalesFrame(frame):\r
            requiredColumns = {"date", "region", "product", "amount"}\r
            missingColumns = requiredColumns - set(frame.columns)\r
            if missingColumns:\r
                raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")\r
            if len(frame) == 0:\r
                raise ValueError("매출 데이터가 비어 있습니다.")\r
            if (frame["amount"] <= 0).any():\r
                raise ValueError("amount는 0보다 커야 합니다.")\r
            return True\r
\r
        badCases = {\r
            "missing_column": pd.DataFrame([\r
                {"date": "2026-05-01", "region": "Seoul", "amount": 1000}\r
            ]),\r
            "negative_amount": pd.DataFrame([\r
                {"date": "2026-05-01", "region": "Seoul", "product": "Pen", "amount": -1}\r
            ]),\r
            "empty_frame": pd.DataFrame(\r
                columns=["date", "region", "product", "amount"]\r
            ),\r
        }\r
        list(badCases)\r
    - type: code\r
      title: 세 케이스 모두 ValueError 발생 검증\r
      content: |-\r
        badMessages = {}\r
        for caseName, badFrame in badCases.items():\r
            try:\r
                validateSalesFrame(badFrame)\r
            except ValueError as exc:\r
                badMessages[caseName] = str(exc)\r
            else:\r
                raise AssertionError(f"{caseName}가 통과되면 안 됩니다.")\r
        assert "필수 컬럼" in badMessages["missing_column"]\r
        assert "0보다" in badMessages["negative_amount"]\r
        assert "비어" in badMessages["empty_frame"]\r
        badMessages\r
- id: summary\r
  title: 정리\r
  subtitle: 한 함수가 곧 보고서다\r
  blocks:\r
  - type: text\r
    content: |-\r
      입력 → 검증 → 집계 → 시트 구성 → 스타일 → 조건부 서식 → 차트 → 표 → 저장 → 재오픈 검증. openpyxl 자동화의 모든 흐름을 한 함수로 묶었습니다. 이 함수가 곧 월간 보고서의 단일 진실 원천입니다.\r
  - type: list\r
    style: check\r
    items:\r
    - 입력 DataFrame의 필수 컬럼과 양수 검증을 함수 첫 줄에서 잠근다\r
    - summary 시트는 헤더 NamedStyle + 집계 + SUM 수식 + 신호등 + 차트의 풀세트\r
    - detail 시트는 정식 Table로 등록해 정렬/필터/줄무늬가 즉시 작동\r
    - raw 시트는 원본 그대로 보존해 보고서의 감사 추적성을 만든다\r
    - 재오픈 후 시트 이름, 헤더 스타일, SUM 수식, 차트 개수, 표, raw 행 수까지 전수 검증\r
  - type: text\r
    content: |-\r
      이 함수의 호출 인터페이스(path, frame)를 그대로 두면, 매월 다른 데이터로 같은 보고서를 자동으로 만들 수 있습니다. 다음 단계는 이 함수를 스케줄러나 메일 자동화에 붙이는 것입니다 - 그건 자동화 카테고리의 다른 강의에서 다룹니다.\r
`;export{e as default};