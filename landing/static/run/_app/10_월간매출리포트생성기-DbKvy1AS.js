var e=`meta:
  id: openpyxl_10
  title: 월간 매출 리포트 생성기
  order: 10
  category: openpyxl
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  packages:
  - openpyxl
  - pandas
  outcomes: ["automation.excel.report"]
  prerequisites: ["automation.excel.workbook","automation.excel.formulas","automation.excel.styles","automation.excel.conditional","automation.excel.charts","automation.excel.tables"]
  estimatedMinutes: 90
  tags:
  - openpyxl
  - 리포트
  - 자동화
  - pandas
  - 종합프로젝트
  seo:
    title: openpyxl 월간 매출 리포트 생성기 - 다중 시트·수식·서식·차트 통합
    description: pandas DataFrame을 입력으로 받아 다중 시트, 수식, 스타일, 조건부 서식, 차트, 표·검증까지 모두 결합한 월간 매출 리포트를 한 함수로 생성합니다.
    keywords:
    - openpyxl 리포트
    - 월간 매출 리포트
    - pandas to_excel
    - 종합 프로젝트
intro:
  direction: "지금까지 익힌 모든 openpyxl 기술(시트·수식·서식·조건부 서식·차트·표·검증)을 하나의 함수로 묶어 월간 매출 리포트 자동 생성기를 완성합니다."
  benefits:
  - pandas DataFrame을 입력으로 받아 다중 시트 보고서를 자동 생성합니다.
  - 데이터 검증, 합계 수식, 조건부 서식, 차트가 모두 결합된 실무 양식 한 벌을 손에 넣습니다.
  - 같은 함수를 매월 다른 데이터로 호출하기만 하면 보고서가 나오는 진짜 자동화의 형태를 경험합니다.
  diagram:
    steps:
    - label: 입력 계약
      detail: pandas DataFrame, 필수 컬럼, 기준 임계값.
    - label: 시트 구성
      detail: summary / detail / raw 세 시트.
    - label: 스타일 + 차트
      detail: 헤더 NamedStyle + 조건부 서식 + Bar/Pie 차트.
    - label: 전수 재오픈 검증
      detail: 재오픈 후 시트 이름, 합계 수식 문자열, 차트 개수, Table 등록까지 모두 assert로 확인.
    runtime:
    - label: openpyxl + pandas 패키지 준비
      detail: pandas로 집계, openpyxl로 양식·서식·차트. uv run python에서 둘 다 import해 즉시 실행.
    - label: 월간 보고서 재오픈 전수 검증
      detail: 저장한 .xlsx를 load_workbook으로 다시 열어 sheetnames, headerStyle, SUM 수식, _charts 길이, salesDetail Table, raw 행 수까지 모두 확인.
sections:
- id: step1_input_contract
  title: 1단계. 입력 데이터 계약
  structuredPrimary: true
  subtitle: 필수 컬럼과 기본 정제
  goal: 보고서 생성기의 입력으로 받을 DataFrame의 형태를 명시적으로 잠근다.
  why: 자동 생성기의 신뢰는 입력 계약에서 시작합니다. 컬럼이 빠지거나 금액이 음수인 데이터를 그대로 받으면 보고서가 망가집니다.
  explanation: |-
    이 강의의 보고서는 ["date", "region", "product", "amount"] 네 컬럼의 DataFrame을 입력으로 받습니다. validateSalesFrame 함수는 컬럼 누락, 빈 데이터, 음수 금액을 모두 막습니다. 모든 자동화 함수의 첫 줄에 이런 검증이 있어야 합니다.
  tips:
  - "ValueError 메시지에는 어떤 컬럼이 빠졌는지, 어떤 행이 음수였는지를 명시하세요. 에러 메시지가 사용자의 첫 디버깅 단서입니다."
  snippet: |-
    import pandas as pd

    def validateSalesFrame(frame):
        requiredColumns = {"date", "region", "product", "amount"}
        missingColumns = requiredColumns - set(frame.columns)
        if missingColumns:
            raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")
        if len(frame) == 0:
            raise ValueError("매출 데이터가 비어 있습니다.")
        if (frame["amount"] <= 0).any():
            raise ValueError("amount는 0보다 커야 합니다.")
        return True

    salesFrame = pd.DataFrame([
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
    ])
    validateSalesFrame(salesFrame), len(salesFrame)
  exercise:
    prompt: amount가 0인 행을 한 줄 추가하면 ValueError가 나야 합니다. 직접 그렇게 만들어 보세요.
    starterCode: |-
      import pandas as pd

      def validateSalesFrame(frame):
          requiredColumns = {"date", "region", "product", "amount"}
          missingColumns = requiredColumns - set(frame.columns)
          if missingColumns:
              raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")
          if len(frame) == 0:
              raise ValueError("매출 데이터가 비어 있습니다.")
          if (frame["amount"] <= 0).any():
              raise ValueError("amount는 0보다 커야 합니다.")
          return True

      bad = pd.DataFrame([
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": ___},
      ])
      try:
          validateSalesFrame(bad)
          raise AssertionError("0 amount를 통과시키면 안 됩니다.")
      except ValueError as exc:
          str(exc)
    hints:
    - "0 또는 음수를 넣으면 (frame['amount'] <= 0).any()가 True가 되어 ValueError가 납니다."
  check:
    noError: validateSalesFrame이 호출 가능해야 하고, try-except가 의도한 분기를 탑니다.
    resultCheck: 출력 문자열이 "amount는 0보다 커야 합니다." 메시지를 포함해야 합니다.
- id: step2_summary_with_formula
  title: 2단계. summary 시트와 합계 수식
  structuredPrimary: true
  subtitle: groupby + SUM 수식
  goal: 지역별 매출 합계를 pandas로 집계한 뒤, summary 시트에 표로 쓰고 총합 수식을 추가한다.
  why: 사람이 보는 보고서의 첫 화면은 항상 요약입니다. summary 시트가 가장 먼저 있어야 사용자가 한 번에 결론을 봅니다.
  explanation: |-
    pandas의 groupby로 region별 amount 합계를 만들고, openpyxl로 summary 시트에 적습니다. 마지막 행에는 \`=SUM(B2:B?)\` 수식을 직접 넣어 사용자가 데이터를 수정해도 총합이 자동으로 따라오게 합니다.
  tips:
  - "summary 시트의 첫 컬럼 너비는 region 이름 길이에, 둘째 컬럼은 통화 포맷 길이에 맞춰 두세요. 자동 너비가 없는 openpyxl에서는 이것이 작업의 마무리입니다."
  snippet: |-
    import pandas as pd
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

    salesFrame = pd.DataFrame([
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
    ])
    regionTotal = salesFrame.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)

    book = Workbook()
    edge = Side(style="thin", color="FF000000")
    headerStyle = NamedStyle(name="headerStyle")
    headerStyle.font = Font(bold=True, color="FFFFFFFF")
    headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
    headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)
    headerStyle.alignment = Alignment(horizontal="center", vertical="center")
    book.add_named_style(headerStyle)

    summary = book.active
    summary.title = "summary"
    summary.append(["region", "amount"])
    for cell in summary[1]:
        cell.style = "headerStyle"
    for _, row in regionTotal.iterrows():
        summary.append([row["region"], int(row["amount"])])
    lastRow = summary.max_row
    summary.cell(row=lastRow + 1, column=1, value="total").font = Font(bold=True)
    summary.cell(row=lastRow + 1, column=2, value=f"=SUM(B2:B{lastRow})").font = Font(bold=True)
    for amountCell in summary[f"B2:B{lastRow + 1}"]:
        amountCell[0].number_format = "#,##0\\"원\\""
    summary.column_dimensions["A"].width = 14
    summary.column_dimensions["B"].width = 18
    [(cell.value) for row in summary["A1:B5"] for cell in row]
  exercise:
    prompt: salesFrame에 ("2026-05-05", "Incheon", "Cable", 95000) 한 줄을 추가하고 lastRow + 1 위치의 SUM 수식이 자동으로 한 칸 늘어나는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from openpyxl import Workbook
      from openpyxl.styles import Font

      salesFrame = pd.DataFrame([
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
          {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
          {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
          ___,
      ])
      regionTotal = salesFrame.groupby("region", as_index=False)["amount"].sum()

      book = Workbook()
      summary = book.active
      summary.title = "summary"
      summary.append(["region", "amount"])
      for _, row in regionTotal.iterrows():
          summary.append([row["region"], int(row["amount"])])
      lastRow = summary.max_row
      summary.cell(row=lastRow + 1, column=2, value=f"=SUM(B2:B{lastRow})")
      summary.cell(row=lastRow + 1, column=2).value
    hints:
    - "dict {date, region, product, amount} 형식. region이 새 것이면 region 수가 늘어 summary 행도 늘어납니다."
  check:
    noError: groupby와 iterrows 호출이 ValueError 없이 끝나야 합니다.
    resultCheck: SUM 수식의 영역이 region 수에 맞춰 정확해야 합니다.
- id: step3_conditional_format
  title: 3단계. summary에 조건부 서식
  structuredPrimary: true
  subtitle: ColorScaleRule
  goal: summary 시트의 amount에 빨강·노랑·초록 신호등 색상을 자동 적용한다.
  why: 표만 보는 사용자는 어느 지역이 잘 됐는지를 찾으려 정렬을 합니다. 신호등이 있으면 정렬조차 필요 없습니다.
  explanation: |-
    \`ColorScaleRule(start_type="min", mid_type="percentile", mid_value=50, end_type="max", ...)\`을 summary의 amount 영역(total 행 제외)에 적용합니다. total 행 자체에는 신호등을 적용하지 않는 것이 깔끔합니다.
  tips:
  - "조건부 서식 영역은 헤더(1행)와 total(마지막) 모두 제외하는 것이 좋습니다. 'B2:B{lastRow}' 패턴을 외워 두세요."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.formatting.rule import ColorScaleRule

    book = Workbook()
    summary = book.active
    summary.title = "summary"
    summary.append(["region", "amount"])
    for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:
        summary.append([region, amount])
    lastRow = summary.max_row

    summary.conditional_formatting.add(
        f"B2:B{lastRow}",
        ColorScaleRule(
            start_type="min", start_color="FFF8696B",
            mid_type="percentile", mid_value=50, mid_color="FFFFEB84",
            end_type="max", end_color="FF63BE7B",
        ),
    )
    [str(key.sqref) for key in summary.conditional_formatting._cf_rules.keys()]
  exercise:
    prompt: 신호등 영역에 total 행까지 포함되도록 잘못 잡은 뒤, 그것이 왜 보고서 가독성을 해치는지 직접 생각해 보고 원래대로 되돌리세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.formatting.rule import ColorScaleRule

      book = Workbook()
      summary = book.active
      summary.title = "summary"
      summary.append(["region", "amount"])
      for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:
          summary.append([region, amount])
      summary.append(["total", 1895000])
      lastRowExcludingTotal = summary.max_row - ___

      summary.conditional_formatting.add(
          f"B2:B{lastRowExcludingTotal}",
          ColorScaleRule(
              start_type="min", start_color="FFF8696B",
              mid_type="percentile", mid_value=50, mid_color="FFFFEB84",
              end_type="max", end_color="FF63BE7B",
          ),
      )
      [str(key.sqref) for key in summary.conditional_formatting._cf_rules.keys()]
    hints:
    - total 행이 항상 최대값이라 신호등이 total을 초록으로 잡고 다른 지역을 모두 빨강 쪽으로 밉니다. 의도와 다른 색이 나옵니다.
  check:
    noError: ColorScaleRule 영역이 유효한 셀 좌표 문자열이어야 합니다.
    resultCheck: 적용된 영역이 total 행을 제외한 데이터 영역이어야 합니다.
- id: step4_charts
  title: 4단계. 막대 차트와 파이 차트
  structuredPrimary: true
  subtitle: BarChart + PieChart
  goal: summary 시트에 지역별 막대 차트와 비중 파이 차트를 모두 배치한다.
  why: 막대로 절대 금액, 파이로 비중을 동시에 보여 주면 의사결정자가 한 번에 두 질문에 답할 수 있습니다.
  explanation: |-
    07강에서 익힌 BarChart와 PieChart 패턴을 그대로 재사용합니다. Reference의 max_row는 total 행 직전까지로 잡습니다.
  tips:
  - "차트의 anchor를 한 칸씩 분리해 두면 사용자가 보고서를 인쇄해도 두 차트가 같은 페이지에 정리됩니다."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.chart import BarChart, PieChart, Reference

    book = Workbook()
    summary = book.active
    summary.title = "summary"
    summary.append(["region", "amount"])
    for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:
        summary.append([region, amount])
    dataLastRow = summary.max_row

    bar = BarChart()
    bar.title = "지역별 매출"
    bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
    bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
    summary.add_chart(bar, "D2")

    pie = PieChart()
    pie.title = "지역 매출 비중"
    pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
    pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
    summary.add_chart(pie, "D20")

    len(summary._charts)
  exercise:
    prompt: 두 차트 외에 LineChart를 하나 더 추가해 차트가 총 3개가 되도록 만드세요. (요약 시트라 시각 과잉이 우려되지만 연습 목적입니다.)
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.chart import BarChart, LineChart, PieChart, Reference

      book = Workbook()
      summary = book.active
      summary.title = "summary"
      summary.append(["region", "amount"])
      for region, amount in [("Seoul", 1430000), ("Busan", 420000), ("Daegu", 45000)]:
          summary.append([region, amount])
      dataLastRow = summary.max_row

      bar = BarChart()
      bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
      bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
      summary.add_chart(bar, "D2")

      pie = PieChart()
      pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
      pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
      summary.add_chart(pie, "D20")

      line = LineChart()
      line.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
      line.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
      summary.add_chart(line, ___)

      len(summary._charts)
    hints:
    - "anchor는 빈 좌표 문자열 (예 'D38'). 두 차트 아래로 보내세요."
  check:
    noError: 세 차트의 Reference 영역이 동일하게 유효해야 합니다.
    resultCheck: _charts 길이가 3이어야 합니다.
- id: step5_detail_and_raw
  title: 5단계. detail 시트(표)와 raw 시트(원본)
  structuredPrimary: true
  subtitle: Table + 원본 보존
  goal: detail 시트는 정렬·필터 가능한 표로, raw 시트는 입력 DataFrame을 그대로 보존한다.
  why: "요약만 보고 의문이 생긴 사용자가 원본을 추적할 수 있어야 합니다. raw 시트는 보고서의 감사(audit) 추적성을 만듭니다."
  explanation: |-
    detail 시트에는 매출 명세를 Table로 등록해 자동 필터와 줄무늬가 켜진 표로 둡니다. raw 시트에는 입력 DataFrame을 그대로 적습니다. 두 시트가 함께 있으면 보고서는 요약·중간·원본의 3계층 구조가 됩니다.
  tips:
  - "raw 시트가 길어지면 freeze_panes를 'A2'로 줘서 헤더가 따라다니게 하세요. 사용자가 스크롤 중 컬럼 의미를 잊지 않습니다."
  snippet: |-
    import pandas as pd
    from openpyxl import Workbook
    from openpyxl.worksheet.table import Table, TableStyleInfo

    salesFrame = pd.DataFrame([
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
    ])

    book = Workbook()
    book.active.title = "summary"
    detail = book.create_sheet("detail")
    raw = book.create_sheet("raw")
    headers = list(salesFrame.columns)
    detail.append(headers)
    raw.append(headers)
    for _, row in salesFrame.iterrows():
        detail.append([row[col] for col in headers])
        raw.append([row[col] for col in headers])

    detail.freeze_panes = "A2"
    raw.freeze_panes = "A2"

    table = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")
    table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)
    detail.add_table(table)

    detail.tables["salesDetail"].ref, raw.max_row
  exercise:
    prompt: detail 표의 ref가 데이터 크기와 항상 맞도록 max_row를 사용했는지 확인하고, salesFrame을 한 줄 추가했을 때 ref가 따라 늘어나는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from openpyxl import Workbook
      from openpyxl.worksheet.table import Table, TableStyleInfo

      salesFrame = pd.DataFrame([
          {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
          {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
          {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
          {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
          ___,
      ])

      book = Workbook()
      book.active.title = "summary"
      detail = book.create_sheet("detail")
      headers = list(salesFrame.columns)
      detail.append(headers)
      for _, row in salesFrame.iterrows():
          detail.append([row[col] for col in headers])

      table = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")
      table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)
      detail.add_table(table)
      detail.tables["salesDetail"].ref
    hints:
    - "한 줄 더 추가 = max_row 한 증가. ref가 자동으로 'A1:D6'로 따라 늘어납니다."
  check:
    noError: Table ref가 detail.max_row 기준으로 만들어져야 합니다.
    resultCheck: 행 추가 시 ref의 끝 행 번호가 한 증가해야 합니다.
- id: validation
  title: 6단계. 검증 루프 - 보고서 생성기의 종합 계약
  structuredPrimary: true
  subtitle: 한 함수로 전체 보고서 + 재오픈 전수 검증
  goal: 입력 DataFrame을 받아 summary/detail/raw 세 시트의 완성된 보고서를 만들고, 재오픈 후 모든 요소(시트·표·차트·수식·조건부 서식)를 자동 검증한다.
  why: 월말마다 함수 한 번 호출이면 보고서가 자동으로 나오는 형태가 진짜 자동화입니다. 검증이 모든 요소를 덮고 있어야 안심하고 매월 호출할 수 있습니다.
  explanation: |-
    \`buildMonthlyReport\`는 이번 강의의 모든 기술을 한 함수로 묶습니다. 입력 검증 → summary 시트(헤더 스타일 + 집계 + SUM 수식 + 조건부 서식 + 차트) → detail 시트(Table) → raw 시트(원본 보존) → 저장 → 재오픈 검증. 한 함수가 곧 보고서 양식의 단일 진실 원천입니다.
  tips:
  - "이 함수를 매월 다른 입력 DataFrame으로 호출해도 결과 구조가 같아야 합니다. 그게 자동화의 의미입니다."
  snippet: |-
    from pathlib import Path
    from tempfile import TemporaryDirectory
    import pandas as pd
    from openpyxl import Workbook, load_workbook
    from openpyxl.chart import BarChart, PieChart, Reference
    from openpyxl.formatting.rule import ColorScaleRule
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side
    from openpyxl.worksheet.table import Table, TableStyleInfo

    def buildMonthlyReport(path, frame):
        requiredColumns = {"date", "region", "product", "amount"}
        missingColumns = requiredColumns - set(frame.columns)
        if missingColumns:
            raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")
        if (frame["amount"] <= 0).any():
            raise ValueError("amount는 0보다 커야 합니다.")

        regionTotal = frame.groupby("region", as_index=False)["amount"].sum().sort_values("amount", ascending=False)

        book = Workbook()
        edge = Side(style="thin", color="FF000000")
        headerStyle = NamedStyle(name="headerStyle")
        headerStyle.font = Font(bold=True, color="FFFFFFFF")
        headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
        headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)
        headerStyle.alignment = Alignment(horizontal="center", vertical="center")
        book.add_named_style(headerStyle)

        summary = book.active
        summary.title = "summary"
        summary.append(["region", "amount"])
        for cell in summary[1]:
            cell.style = "headerStyle"
        for _, row in regionTotal.iterrows():
            summary.append([row["region"], int(row["amount"])])
        dataLastRow = summary.max_row
        summary.cell(row=dataLastRow + 1, column=1, value="total").font = Font(bold=True)
        summary.cell(
            row=dataLastRow + 1,
            column=2,
            value=f"=SUM(B2:B{dataLastRow})",
        ).font = Font(bold=True)
        for amountRow in summary[f"B2:B{dataLastRow + 1}"]:
            amountRow[0].number_format = "#,##0\\"원\\""
        summary.column_dimensions["A"].width = 14
        summary.column_dimensions["B"].width = 18

        summary.conditional_formatting.add(
            f"B2:B{dataLastRow}",
            ColorScaleRule(
                start_type="min", start_color="FFF8696B",
                mid_type="percentile", mid_value=50, mid_color="FFFFEB84",
                end_type="max", end_color="FF63BE7B",
            ),
        )

        bar = BarChart()
        bar.title = "지역별 매출"
        bar.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
        bar.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
        summary.add_chart(bar, "D2")

        pie = PieChart()
        pie.title = "지역 비중"
        pie.add_data(Reference(summary, min_col=2, min_row=1, max_col=2, max_row=dataLastRow), titles_from_data=True)
        pie.set_categories(Reference(summary, min_col=1, min_row=2, max_row=dataLastRow))
        summary.add_chart(pie, "D20")

        detail = book.create_sheet("detail")
        headers = ["date", "region", "product", "amount"]
        detail.append(headers)
        for _, row in frame.iterrows():
            detail.append([row[col] for col in headers])
        detail.freeze_panes = "A2"
        detailTable = Table(displayName="salesDetail", ref=f"A1:D{detail.max_row}")
        detailTable.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)
        detail.add_table(detailTable)
        for amountRow in detail[f"D2:D{detail.max_row}"]:
            amountRow[0].number_format = "#,##0\\"원\\""

        raw = book.create_sheet("raw")
        raw.append(headers)
        for _, row in frame.iterrows():
            raw.append([row[col] for col in headers])
        raw.freeze_panes = "A2"

        book.save(path)
        return path

    samples = pd.DataFrame([
        {"date": "2026-05-01", "region": "Seoul", "product": "Notebook", "amount": 1250000},
        {"date": "2026-05-02", "region": "Busan", "product": "Monitor", "amount": 420000},
        {"date": "2026-05-03", "region": "Seoul", "product": "Keyboard", "amount": 180000},
        {"date": "2026-05-04", "region": "Daegu", "product": "Mouse", "amount": 45000},
        {"date": "2026-05-05", "region": "Incheon", "product": "Cable", "amount": 95000},
    ])
    workdir = TemporaryDirectory()
    reportPath = buildMonthlyReport(Path(workdir.name) / "2026-05.xlsx", samples)

    reopened = load_workbook(reportPath)
    assert reopened.sheetnames == ["summary", "detail", "raw"]
    summarySheet = reopened["summary"]
    assert summarySheet["A1"].style == "headerStyle"
    totalFormula = summarySheet.cell(row=summarySheet.max_row, column=2).value
    assert isinstance(totalFormula, str) and totalFormula.startswith("=SUM")
    assert len(summarySheet._charts) == 2
    assert "salesDetail" in reopened["detail"].tables
    assert reopened["raw"].max_row == len(samples) + 1
    reopened.sheetnames, totalFormula, len(summarySheet._charts), reopened["raw"].max_row
  exercise:
    prompt: samples를 2026년 6월 자료 5건으로 바꾸고 (날짜 6월, region/product 자유) 보고서가 그대로 잘 만들어지는지, 모든 assert가 통과하는지 확인하세요.
    starterCode: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      import pandas as pd
      from openpyxl import load_workbook
      # buildMonthlyReport은 위 셀에서 이미 정의되어 있다고 가정합니다.

      juneSamples = pd.DataFrame([
          {"date": "2026-06-01", "region": "Seoul", "product": "Notebook", "amount": ___},
          {"date": "2026-06-02", "region": "Busan", "product": "Monitor", "amount": ___},
          {"date": "2026-06-03", "region": "Seoul", "product": "Keyboard", "amount": ___},
          {"date": "2026-06-04", "region": "Daegu", "product": "Mouse", "amount": ___},
          {"date": "2026-06-05", "region": "Incheon", "product": "Cable", "amount": ___},
      ])
      workdir = TemporaryDirectory()
      juneReport = buildMonthlyReport(Path(workdir.name) / "2026-06.xlsx", juneSamples)
      reopened = load_workbook(juneReport)
      assert reopened.sheetnames == ["summary", "detail", "raw"]
      assert reopened["raw"].max_row == 6
      reopened.sheetnames
    hints:
    - 모든 amount는 양수여야 하고, 행 수 5 + 헤더 1 = raw 6행.
  check:
    noError: buildMonthlyReport이 정의된 환경에서 호출되어야 합니다.
    resultCheck: assert가 모두 통과하고 sheetnames가 ["summary", "detail", "raw"]여야 합니다.
- id: practice
  title: 실습 - 종합 미션 2개
  structuredPrimary: true
  subtitle: import부터 검증까지 독립 실행
  goal: 통합 보고서 생성 함수를 다른 도메인 데이터에 재사용하고, 입력 검증 실패 케이스도 자동 확인한다.
  why: 진짜 자동화는 같은 함수가 다른 데이터에 그대로 도는가, 그리고 잘못된 입력을 단호히 막는가로 결정됩니다.
  explanation: |-
    미션1은 학생 시험 점수 DataFrame을 입력으로 같은 패턴(요약·detail·raw)의 보고서를 생성합니다. 미션2는 컬럼 누락·음수·빈 DataFrame 세 가지 잘못된 입력에 대해 모두 ValueError가 나는지 확인합니다.
  tips:
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  - 변수 prefix는 \`score*\`(미션1), \`bad*\`(미션2)로 격리됩니다.
  snippet: |-
    from pathlib import Path
    from tempfile import TemporaryDirectory
    import pandas as pd
    from openpyxl import Workbook, load_workbook
    from openpyxl.styles import Font
    from openpyxl.worksheet.table import Table, TableStyleInfo
  exercise:
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.
    starterCode: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      import pandas as pd
      from openpyxl import Workbook, load_workbook

      workdir = TemporaryDirectory()
      target = Path(workdir.name) / "mission.xlsx"
      ___
    hints:
    - 미션1은 buildScoreReport(path, frame) 함수를 직접 정의 - group_by class, summary + detail + raw 3시트.
    - 미션2는 try/except로 세 잘못된 입력에 ValueError가 나는지 확인.
  check:
    noError: 미션1 함수가 ValueError 없이 끝나야 합니다. 미션2는 의도된 ValueError가 떠야 합니다.
    resultCheck: 재오픈한 미션1 보고서가 3시트 구조, 미션2의 세 케이스 모두 ValueError를 캐치해야 합니다.
  blocks:
  - type: tip
    content: 미션1 함수는 buildMonthlyReport과 같은 골격(검증 → 집계 → 시트 → 저장 → 반환)으로 작성합니다.
  - type: expansion
    title: "미션1: 학생 시험 점수 보고서 생성기"
    blocks:
    - type: code
      title: buildScoreReport 함수 정의
      content: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        import pandas as pd
        from openpyxl import Workbook, load_workbook
        from openpyxl.styles import Font
        from openpyxl.worksheet.table import Table, TableStyleInfo

        def buildScoreReport(path, frame):
            requiredColumns = {"student", "class", "subject", "score"}
            missingColumns = requiredColumns - set(frame.columns)
            if missingColumns:
                raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")
            if (frame["score"] < 0).any() or (frame["score"] > 100).any():
                raise ValueError("score는 0~100 범위여야 합니다.")
            classMean = frame.groupby("class", as_index=False)["score"].mean()
            classMean["score"] = classMean["score"].round(2)

            book = Workbook()
            summary = book.active
            summary.title = "summary"
            summary.append(["class", "average_score"])
            for _, row in classMean.iterrows():
                summary.append([row["class"], float(row["score"])])

            detail = book.create_sheet("detail")
            headers = ["student", "class", "subject", "score"]
            detail.append(headers)
            for _, row in frame.iterrows():
                detail.append([row[col] for col in headers])
            detailTable = Table(displayName="scoreDetail", ref=f"A1:D{detail.max_row}")
            detailTable.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)
            detail.add_table(detailTable)
            detail.freeze_panes = "A2"

            raw = book.create_sheet("raw")
            raw.append(headers)
            for _, row in frame.iterrows():
                raw.append([row[col] for col in headers])
            book.save(path)
            return path

        scoreDir = TemporaryDirectory()
        scoreFrame = pd.DataFrame([
            {"student": "Alice", "class": "A", "subject": "Math", "score": 88},
            {"student": "Bob", "class": "A", "subject": "Math", "score": 72},
            {"student": "Carol", "class": "B", "subject": "Math", "score": 95},
            {"student": "Dan", "class": "B", "subject": "Math", "score": 60},
            {"student": "Eve", "class": "C", "subject": "Math", "score": 78},
        ])
        scorePath = buildScoreReport(Path(scoreDir.name) / "scores.xlsx", scoreFrame)
        scorePath
    - type: code
      title: 보고서 재오픈 검증
      content: |-
        scoreReopen = load_workbook(scorePath)
        assert scoreReopen.sheetnames == ["summary", "detail", "raw"]
        assert "scoreDetail" in scoreReopen["detail"].tables
        assert scoreReopen["raw"].max_row == 6
        scoreSummary = scoreReopen["summary"]
        assert scoreSummary["A1"].value == "class"
        scoreReopen.sheetnames, scoreReopen["raw"].max_row
  - type: expansion
    title: "미션2: 입력 검증 실패 케이스 3종"
    blocks:
    - type: code
      title: validateSalesFrame 재정의와 세 가지 잘못된 입력
      content: |-
        import pandas as pd

        def validateSalesFrame(frame):
            requiredColumns = {"date", "region", "product", "amount"}
            missingColumns = requiredColumns - set(frame.columns)
            if missingColumns:
                raise ValueError(f"필수 컬럼이 빠졌습니다: {sorted(missingColumns)}")
            if len(frame) == 0:
                raise ValueError("매출 데이터가 비어 있습니다.")
            if (frame["amount"] <= 0).any():
                raise ValueError("amount는 0보다 커야 합니다.")
            return True

        badCases = {
            "missing_column": pd.DataFrame([
                {"date": "2026-05-01", "region": "Seoul", "amount": 1000}
            ]),
            "negative_amount": pd.DataFrame([
                {"date": "2026-05-01", "region": "Seoul", "product": "Pen", "amount": -1}
            ]),
            "empty_frame": pd.DataFrame(
                columns=["date", "region", "product", "amount"]
            ),
        }
        list(badCases)
    - type: code
      title: 세 케이스 모두 ValueError 발생 검증
      content: |-
        badMessages = {}
        for caseName, badFrame in badCases.items():
            try:
                validateSalesFrame(badFrame)
            except ValueError as exc:
                badMessages[caseName] = str(exc)
            else:
                raise AssertionError(f"{caseName}가 통과되면 안 됩니다.")
        assert "필수 컬럼" in badMessages["missing_column"]
        assert "0보다" in badMessages["negative_amount"]
        assert "비어" in badMessages["empty_frame"]
        badMessages
- id: summary
  title: 정리
  subtitle: 한 함수가 곧 보고서다
  blocks:
  - type: text
    content: |-
      입력 → 검증 → 집계 → 시트 구성 → 스타일 → 조건부 서식 → 차트 → 표 → 저장 → 재오픈 검증. openpyxl 자동화의 모든 흐름을 한 함수로 묶었습니다. 이 함수가 곧 월간 보고서의 단일 진실 원천입니다.
  - type: list
    style: check
    items:
    - 입력 DataFrame의 필수 컬럼과 양수 검증을 함수 첫 줄에서 잠근다
    - summary 시트는 헤더 NamedStyle + 집계 + SUM 수식 + 신호등 + 차트의 풀세트
    - detail 시트는 정식 Table로 등록해 정렬/필터/줄무늬가 즉시 작동
    - raw 시트는 원본 그대로 보존해 보고서의 감사 추적성을 만든다
    - 재오픈 후 시트 이름, 헤더 스타일, SUM 수식, 차트 개수, 표, raw 행 수까지 전수 검증
  - type: text
    content: |-
      이 함수의 호출 인터페이스(path, frame)를 그대로 두면, 매월 다른 데이터로 같은 보고서를 자동으로 만들 수 있습니다. 다음 단계는 이 함수를 스케줄러나 메일 자동화에 붙이는 것입니다 - 그건 자동화 카테고리의 다른 강의에서 다룹니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: openpyxl_10-monthly-sales-report-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_input_contract
    - summary
    title: 월간 매출 workbook의 원천·요약·chart·formula reconciliation 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 원천 합계와 요약 합계, 월 coverage, 필수 artifact를 함께 판정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 요약 sheet 총합을 원천 row에서 월별로 다시 계산하고 같은 판정을 JSON audit에 보존하세요.
    - 실제 xlsx 졸업 증거와 Web의 reconciliation table을 혼동하지 마세요.
    exercise:
      prompt: audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path)를 완성해
        reconciliation 결과를 반환하고, output_path에는 같은 결과를 한 행짜리 JSON table로 저장하세요.
      starterCode: |-
        def audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path=None):
            raise NotImplementedError
      solution: |
        import json
        from pathlib import Path


        def audit_monthly_sales_report(source_rows, summary_rows, artifact_manifest, required_months, output_path=None):
            source_totals = {}
            for row in source_rows:
                source_totals[row["month"]] = source_totals.get(row["month"], 0) + row["amount"]
            summary_totals = {row["month"]: row["amount"] for row in summary_rows}
            missing_months = sorted(set(required_months) - set(summary_totals))
            mismatches = sorted(month for month in set(source_totals) | set(summary_totals) if source_totals.get(month, 0) != summary_totals.get(month, 0))
            required_artifacts = {"RawTable", "SummaryTable", "MonthlyChart", "TotalFormula"}
            missing_artifacts = sorted(required_artifacts - set(artifact_manifest))
            failures = []
            if missing_months:
                failures.append("month-coverage")
            if mismatches:
                failures.append("totals")
            if missing_artifacts:
                failures.append("artifacts")
            result = {"passed": not failures, "failures": failures, "missingMonths": missing_months, "mismatchedMonths": mismatches, "missingArtifacts": missing_artifacts, "sourceGrandTotal": sum(source_totals.values()), "summaryGrandTotal": sum(summary_totals.values())}
            unexpected_months = set(summary_totals) - set(required_months)
            default_path = "output/reconciled-report.json" if result["passed"] else "output/unexpected-month-report.json" if unexpected_months else "output/gap-report.json"
            target = Path(output_path or default_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2), encoding="utf-8")
            return result
      hints: *id001
    check:
      id: python.openpyxl.openpyxl_10.monthly-sales-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_10.monthly-sales-report.mastery.behavior.v1.fixture
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
        entry: audit_monthly_sales_report
        cases:
        - id: accepts-reconciled-two-month-report
          arguments:
          - value:
            - month: 2026-01
              amount: 10
            - month: 2026-01
              amount: 5
            - month: 2026-02
              amount: 20
          - value:
            - month: 2026-01
              amount: 15
            - month: 2026-02
              amount: 20
          - value:
            - RawTable
            - SummaryTable
            - MonthlyChart
            - TotalFormula
          - value:
            - 2026-01
            - 2026-02
          - value: output/reconciled-report.json
          expectedReturn:
            passed: true
            failures: []
            missingMonths: []
            mismatchedMonths: []
            missingArtifacts: []
            sourceGrandTotal: 35
            summaryGrandTotal: 35
        - id: reports-month-total-and-artifact-gaps
          arguments:
          - value:
            - month: 2026-01
              amount: 10
          - value:
            - month: 2026-01
              amount: 9
          - value:
            - RawTable
          - value:
            - 2026-01
            - 2026-02
          - value: output/gap-report.json
          expectedReturn:
            passed: false
            failures:
            - month-coverage
            - totals
            - artifacts
            missingMonths:
            - 2026-02
            mismatchedMonths:
            - 2026-01
            missingArtifacts:
            - MonthlyChart
            - SummaryTable
            - TotalFormula
            sourceGrandTotal: 10
            summaryGrandTotal: 9
        - id: reports-unexpected-summary-month-total
          arguments:
          - value: []
          - value:
            - month: 2026-03
              amount: 1
          - value:
            - RawTable
            - SummaryTable
            - MonthlyChart
            - TotalFormula
          - value: []
          - value: output/unexpected-month-report.json
          expectedReturn:
            passed: false
            failures:
            - totals
            missingMonths: []
            mismatchedMonths:
            - 2026-03
            missingArtifacts: []
            sourceGrandTotal: 0
            summaryGrandTotal: 1
        expectedPaths:
        - path: output/reconciled-report.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - mismatchedMonths
          - missingArtifacts
          - missingMonths
          - passed
          - sourceGrandTotal
          - summaryGrandTotal
        - path: output/gap-report.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - mismatchedMonths
          - missingArtifacts
          - missingMonths
          - passed
          - sourceGrandTotal
          - summaryGrandTotal
        - path: output/unexpected-month-report.json
          kind: table
          origin: created
          format: json
          columns:
          - failures
          - mismatchedMonths
          - missingArtifacts
          - missingMonths
          - passed
          - sourceGrandTotal
          - summaryGrandTotal
        normalizeReturnPaths: []
  transferVariants:
  - id: openpyxl_10-monthly-report-release-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_10-monthly-sales-report-mastery
    title: 새 월간 workbook의 재개방·idempotency release gate 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 source hash에서 두 번 생성한 workbook의 business·structure hash를 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 같은 source에서 반복 생성한 workbook과 business hash를 비교하세요.
    - 각 run은 저장 후 재개방과 업무 reconciliation을 모두 통과해야 합니다.
    exercise:
      prompt: decide_monthly_report_release(runs, current_source_hash)를 완성하세요.
      starterCode: |-
        def decide_monthly_report_release(runs, current_source_hash):
            raise NotImplementedError
      solution: |
        def decide_monthly_report_release(runs, current_source_hash):
            current = [run for run in runs if run["sourceHash"] == current_source_hash]
            stale = sorted(run["id"] for run in runs if run["sourceHash"] != current_source_hash)
            failures = []
            if len(current) < 2:
                failures.append("repeat-evidence")
            if any(not run.get("reopened", False) or not run.get("businessPassed", False) for run in current):
                failures.append("verification")
            workbook_hashes = {run["workbookHash"] for run in current}
            business_hashes = {run["businessHash"] for run in current}
            if len(workbook_hashes) != 1 or len(business_hashes) != 1:
                failures.append("determinism")
            return {"releaseReady": not failures and not stale, "failures": failures, "staleRuns": stale, "currentRunCount": len(current)}
      hints: *id002
    check:
      id: python.openpyxl.openpyxl_10.monthly-report-release.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_10.monthly-report-release.transfer.behavior.v1.fixture
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
        entry: decide_monthly_report_release
        cases:
        - id: accepts-two-current-deterministic-runs
          arguments:
          - value:
            - id: a
              sourceHash: s
              reopened: true
              businessPassed: true
              workbookHash: w
              businessHash: b
            - id: b
              sourceHash: s
              reopened: true
              businessPassed: true
              workbookHash: w
              businessHash: b
          - value: s
          expectedReturn:
            releaseReady: true
            failures: []
            staleRuns: []
            currentRunCount: 2
        - id: reports-single-unverified-run
          arguments:
          - value:
            - id: a
              sourceHash: s
              reopened: false
              businessPassed: false
              workbookHash: w
              businessHash: b
          - value: s
          expectedReturn:
            releaseReady: false
            failures:
            - repeat-evidence
            - verification
            staleRuns: []
            currentRunCount: 1
        - id: reports-nondeterministic-and-stale
          arguments:
          - value:
            - id: old
              sourceHash: old
              reopened: true
              businessPassed: true
              workbookHash: w
              businessHash: b
            - id: a
              sourceHash: s
              reopened: true
              businessPassed: true
              workbookHash: w1
              businessHash: b
            - id: b
              sourceHash: s
              reopened: true
              businessPassed: true
              workbookHash: w2
              businessHash: b
          - value: s
          expectedReturn:
            releaseReady: false
            failures:
            - determinism
            staleRuns:
            - old
            currentRunCount: 2
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: openpyxl_10-monthly-sales-capstone-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_10-monthly-report-release-transfer
    title: 월간 매출 workbook 종료 조건 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 원천·요약·artifact·재개방·반복 생성 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Workbook 저장 성공과 업무 값·수식·표시의 정확성을 분리해 검증하세요.
    - Web에서는 문서 계약을 검증하고 Local에서는 재개방한 artifact evidence를 남기세요.
    exercise:
      prompt: choose_monthly_report_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_monthly_report_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_monthly_report_gate(situation):
            table = {'business': {'action': 'recompute monthly totals from source', 'evidence': 'month and grand-total reconciliation', 'risk': 'wrong summary'}, 'artifact': {'action': 'reopen tables formulas and chart', 'evidence': 'workbook manifest', 'risk': 'valid but incomplete xlsx'}, 'release': {'action': 'repeat with same source hash', 'evidence': 'deterministic workbook and business hashes', 'risk': 'non-idempotent report'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.openpyxl.openpyxl_10.monthly-sales-capstone-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_10.monthly-sales-capstone-recall.retrieval.behavior.v1.fixture
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
        entry: choose_monthly_report_gate
        cases:
        - id: recalls-business
          arguments:
          - value: business
          expectedReturn:
            action: recompute monthly totals from source
            evidence: month and grand-total reconciliation
            risk: wrong summary
        - id: recalls-artifact
          arguments:
          - value: artifact
          expectedReturn:
            action: reopen tables formulas and chart
            evidence: workbook manifest
            risk: valid but incomplete xlsx
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};