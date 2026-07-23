var e=`meta:
  id: openpyxl_05
  title: 셀 서식과 숫자 포맷
  order: 5
  category: openpyxl
  difficulty: ⭐⭐
  badge: 기초
  packages:
  - openpyxl
  outcomes: ["automation.excel.styles"]
  prerequisites: ["automation.excel.workbook"]
  estimatedMinutes: 55
  tags:
  - openpyxl
  - Font
  - Fill
  - Border
  - Alignment
  - number_format
  seo:
    title: openpyxl 셀 서식과 숫자 포맷 - Font·Fill·Border·Alignment·NumberFormat
    description: 보고서의 시각적 표준을 코드로 만드는 방법. Font/Fill/Border/Alignment의 4대 객체와 number_format 문법, NamedStyle 재사용까지 정리합니다.
    keywords:
    - openpyxl Font
    - PatternFill
    - Border Side
    - number_format
    - NamedStyle
intro:
  direction: 셀의 글자, 배경, 테두리, 정렬, 숫자 포맷을 코드로 부여하고, NamedStyle로 재사용 가능한 스타일 라이브러리를 만듭니다.
  benefits:
  - "Font/PatternFill/Border/Alignment 네 가지 스타일 객체의 역할을 정확히 구분합니다."
  - 통화·퍼센트·날짜 숫자 포맷을 의도대로 적용합니다.
  - 같은 헤더 스타일을 한 번 정의해 여러 시트에 반복 적용합니다.
  diagram:
    steps:
    - label: Font
      detail: 글자 굵기, 크기, 색상.
    - label: Fill
      detail: 셀 배경 색상.
    - label: Border / Alignment
      detail: 테두리와 정렬 - 표가 표처럼 보이게 한다.
    - label: number_format / NamedStyle
      detail: 숫자 표현과 스타일 재사용.
    runtime:
    - label: openpyxl 패키지 준비
      detail: Font/PatternFill/Border/Alignment/NamedStyle 모두 openpyxl.styles 안에 있다. uv run python에서 즉시 실행 가능.
    - label: 스타일 보존 재오픈
      detail: 저장한 파일을 load_workbook으로 다시 열어 cell.style 이름과 fill 색이 보존됐는지 assert로 확인한다.
sections:
- id: step1_font
  title: 1단계. 글자 스타일
  structuredPrimary: true
  subtitle: Font(name, size, bold, color)
  goal: 헤더 셀에 굵은 글씨와 색상을 부여한다.
  why: 헤더가 본문과 구분되지 않으면 보고서가 표가 아니라 단순 텍스트로 읽힙니다. 시각적 계층 구조의 첫 단계가 글자입니다.
  explanation: |-
    \`from openpyxl.styles import Font\` 후 \`cell.font = Font(bold=True, color="FFFFFF", size=12)\`로 폰트를 적용합니다. color는 ARGB 8자리 또는 RGB 6자리 16진수 문자열입니다. Font 객체는 immutable이므로 매번 새로 만들어 대입해야 합니다.
  tips:
  - "cell.font.bold = True 같은 in-place 수정은 동작하지 않습니다. 새 Font 객체를 통째로 대입해야 적용됩니다."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.styles import Font

    book = Workbook()
    sheet = book.active
    sheet.append(["date", "region", "amount"])
    headerFont = Font(name="Calibri", size=12, bold=True, color="FFFFFFFF")
    for cell in sheet[1]:
        cell.font = headerFont
    sheet["A1"].font.bold, sheet["A1"].font.color.rgb
  exercise:
    prompt: 헤더 글자 크기를 14로, 색상을 검정("FF000000")으로 바꾸세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.styles import Font

      book = Workbook()
      sheet = book.active
      sheet.append(["date", "region", "amount"])
      headerFont = Font(name="Calibri", size=___, bold=True, color=___)
      for cell in sheet[1]:
          cell.font = headerFont
      sheet["A1"].font.size, sheet["A1"].font.color.rgb
    hints:
    - color는 ARGB 8자리 문자열입니다. 검정은 FF000000, A는 alpha입니다.
  check:
    noError: Font 인자가 모두 키워드로 전달되어야 합니다.
    resultCheck: 출력 튜플의 size와 rgb가 입력한 값과 같아야 합니다.
- id: step2_fill
  title: 2단계. 셀 배경 채우기
  structuredPrimary: true
  subtitle: PatternFill(start_color, end_color, fill_type)
  goal: 헤더에 배경 색상을 부여해 본문과 시각적으로 분리한다.
  why: 글자 굵기만으로는 헤더가 본문과 충분히 구분되지 않을 때가 많습니다. 배경 색상이 가장 강력한 시각 분리 도구입니다.
  explanation: |-
    \`from openpyxl.styles import PatternFill\` 후 \`cell.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\`. fill_type을 지정하지 않으면 색이 보이지 않습니다. solid 단색 채우기가 가장 흔합니다.
  tips:
  - "그라데이션 채우기는 GradientFill이라는 별도 객체입니다. 자동 보고서에서는 solid PatternFill로 충분한 경우가 거의 전부입니다."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill

    book = Workbook()
    sheet = book.active
    sheet.append(["date", "region", "amount"])
    headerFill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
    headerFont = Font(bold=True, color="FFFFFFFF")
    for cell in sheet[1]:
        cell.fill = headerFill
        cell.font = headerFont
    sheet["A1"].fill.start_color.rgb, sheet["A1"].fill.fill_type
  exercise:
    prompt: 색상을 연한 회색("FFD9D9D9")으로 바꾸고 fill_type이 여전히 "solid"인지 확인하세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.styles import Font, PatternFill

      book = Workbook()
      sheet = book.active
      sheet.append(["date", "region", "amount"])
      headerFill = PatternFill(start_color=___, end_color=___, fill_type=___)
      for cell in sheet[1]:
          cell.fill = headerFill
      sheet["A1"].fill.start_color.rgb, sheet["A1"].fill.fill_type
    hints:
    - start_color와 end_color는 같은 값을 쓰는 것이 단색의 안전한 패턴입니다.
  check:
    noError: PatternFill에 fill_type을 반드시 지정해야 색이 보입니다.
    resultCheck: 출력 튜플의 색과 fill_type이 입력 값과 같아야 합니다.
- id: step3_border_alignment
  title: 3단계. 테두리와 정렬
  structuredPrimary: true
  subtitle: Border / Side / Alignment
  goal: 표 영역에 균일한 테두리를 둘러 행/열의 경계를 명확히 한다.
  why: 테두리가 없는 셀들은 데이터를 시각적으로 분리하기 어렵습니다. 정렬은 숫자와 텍스트의 종류를 무의식적으로 알려주는 신호입니다.
  explanation: |-
    \`Border(left=Side(...), right=..., top=..., bottom=...)\`로 네 변을 개별 지정합니다. \`Side(style="thin", color="FF000000")\`이 가장 흔합니다. Alignment는 \`Alignment(horizontal="center", vertical="center", wrap_text=True)\`처럼 씁니다. 헤더는 가운데 정렬, 숫자는 오른쪽 정렬이 표준입니다.
  tips:
  - "wrap_text=True는 긴 문자열을 셀 안에서 줄바꿈합니다. 행 높이를 같이 늘려야 보입니다(row_dimensions[row].height)."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.styles import Border, Side, Alignment

    book = Workbook()
    sheet = book.active
    sheet.append(["date", "region", "amount"])
    sheet.append(["2026-05-01", "Seoul", 120000])
    sheet.append(["2026-05-02", "Busan", 80000])

    edge = Side(style="thin", color="FF000000")
    boxBorder = Border(left=edge, right=edge, top=edge, bottom=edge)
    centerAlign = Alignment(horizontal="center", vertical="center")

    for row in sheet["A1:C3"]:
        for cell in row:
            cell.border = boxBorder
    for cell in sheet[1]:
        cell.alignment = centerAlign

    sheet["A1"].alignment.horizontal, sheet["A1"].border.top.style
  exercise:
    prompt: 본문 숫자(amount 컬럼)는 오른쪽 정렬이 자연스럽습니다. C2:C3에 right 정렬을 적용하세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.styles import Border, Side, Alignment

      book = Workbook()
      sheet = book.active
      sheet.append(["date", "region", "amount"])
      sheet.append(["2026-05-01", "Seoul", 120000])
      sheet.append(["2026-05-02", "Busan", 80000])

      edge = Side(style="thin", color="FF000000")
      boxBorder = Border(left=edge, right=edge, top=edge, bottom=edge)
      rightAlign = Alignment(horizontal=___)

      for row in sheet["A1:C3"]:
          for cell in row:
              cell.border = boxBorder
      for cell in sheet["C2:C3"]:
          for innerCell in (cell if isinstance(cell, tuple) else (cell,)):
              innerCell.alignment = rightAlign

      sheet["C2"].alignment.horizontal, sheet["C3"].alignment.horizontal
    hints:
    - "horizontal에 들어갈 값은 'right' 입니다. 'left'/'center'/'right'/'justify'/'fill'/'distributed' 등이 허용됩니다."
  check:
    noError: Border/Side/Alignment 객체가 모두 styles에서 import되어야 합니다.
    resultCheck: C2와 C3의 horizontal alignment가 "right" 여야 합니다.
- id: step4_number_format
  title: 4단계. 숫자 포맷
  structuredPrimary: true
  subtitle: cell.number_format
  goal: 통화·퍼센트·날짜를 보고서 표준 형식으로 보여 준다.
  why: 1200000과 1,200,000은 같은 값이지만 사람의 인지 부하가 완전히 다릅니다. 숫자 포맷이 곧 보고서의 품질입니다.
  explanation: |-
    \`cell.number_format\`은 Excel의 사용자 정의 형식 문자열을 그대로 받습니다. 자주 쓰는 형식은 다음과 같습니다.

    | 의미 | 형식 |
    | --- | --- |
    | 천 단위 콤마 | "#,##0" |
    | 통화(원화) | "#,##0\\"원\\"" |
    | 소수점 둘째자리 퍼센트 | "0.00%" |
    | 날짜(yyyy-mm-dd) | "yyyy-mm-dd" |
    | 음수 빨간색 | "#,##0;[Red]-#,##0" |
  tips:
  - "퍼센트 형식은 셀에 0.1이 들어 있으면 10%로 보입니다. 이미 10이 들어 있으면 1000%가 됩니다. 데이터 자체와 형식의 단위를 항상 맞추세요."
  snippet: |-
    from openpyxl import Workbook

    book = Workbook()
    sheet = book.active
    sheet.append(["item", "amount", "rate"])
    sheet.append(["revenue", 12345678, 0.123])
    sheet.append(["cost", 8456000, 0.087])

    sheet["B2"].number_format = "#,##0\\"원\\""
    sheet["B3"].number_format = "#,##0\\"원\\""
    sheet["C2"].number_format = "0.00%"
    sheet["C3"].number_format = "0.00%"

    sheet["B2"].number_format, sheet["C2"].number_format
  exercise:
    prompt: rate를 소수점 첫째자리만 보이도록 "0.0%"로 바꾸세요.
    starterCode: |-
      from openpyxl import Workbook

      book = Workbook()
      sheet = book.active
      sheet.append(["item", "amount", "rate"])
      sheet.append(["revenue", 12345678, 0.123])
      sheet.append(["cost", 8456000, 0.087])

      sheet["B2"].number_format = "#,##0\\"원\\""
      sheet["B3"].number_format = "#,##0\\"원\\""
      sheet["C2"].number_format = ___
      sheet["C3"].number_format = ___

      sheet["C2"].number_format, sheet["C3"].number_format
    hints:
    - 둘째자리는 "0.00%", 첫째자리는 "0.0%" 입니다.
  check:
    noError: number_format은 문자열이어야 합니다.
    resultCheck: C2와 C3의 number_format이 "0.0%" 여야 합니다.
- id: step5_named_style
  title: 5단계. NamedStyle로 재사용
  structuredPrimary: true
  subtitle: 한 번 정의, 모든 시트에서 사용
  goal: 같은 헤더 스타일을 NamedStyle 하나로 묶어, 여러 시트의 헤더에 한 줄로 적용한다.
  why: 매번 Font·Fill·Border·Alignment를 새로 만들면 코드도 길어지고 일관성도 깨집니다. NamedStyle은 자동 보고서의 디자인 시스템 역할을 합니다.
  explanation: |-
    \`from openpyxl.styles import NamedStyle\` 후 NamedStyle에 font/fill/border/alignment/number_format을 채워 \`book.add_named_style(...)\`로 등록합니다. 등록 이후에는 \`cell.style = "headerStyle"\`처럼 이름만으로 적용할 수 있습니다.
  tips:
  - NamedStyle은 워크북 단위로 등록됩니다. 같은 워크북의 모든 시트에서 같은 이름으로 호출할 수 있어 일관성이 자연스럽게 잡힙니다.
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

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
    detail = book.create_sheet("detail")
    detail.append(["date", "region", "amount"])

    for sheet in (summary, detail):
        for cell in sheet[1]:
            cell.style = "headerStyle"

    summary["A1"].style, detail["B1"].style
  exercise:
    prompt: bodyMoney라는 NamedStyle을 하나 더 만들어 number_format이 "#,##0\\"원\\"" 인 금액 본문 스타일을 등록하고, summary의 B2에 적용하세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

      book = Workbook()
      edge = Side(style="thin", color="FF000000")
      headerStyle = NamedStyle(name="headerStyle")
      headerStyle.font = Font(bold=True, color="FFFFFFFF")
      headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
      headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)
      headerStyle.alignment = Alignment(horizontal="center", vertical="center")
      book.add_named_style(headerStyle)

      bodyMoney = NamedStyle(name=___)
      bodyMoney.number_format = ___
      bodyMoney.alignment = Alignment(horizontal="right")
      book.add_named_style(bodyMoney)

      summary = book.active
      summary.title = "summary"
      summary.append(["region", "amount"])
      summary.append(["Seoul", 120000])
      for cell in summary[1]:
          cell.style = "headerStyle"
      summary["B2"].style = "bodyMoney"

      summary["B2"].style, summary["B2"].number_format
    hints:
    - NamedStyle의 name은 cell.style에 넣을 문자열과 일치해야 합니다.
  check:
    noError: 같은 이름의 NamedStyle을 두 번 등록하면 ValueError. 새 이름을 쓰세요.
    resultCheck: B2의 style이 "bodyMoney"이고 number_format이 "#,##0\\"원\\"" 이어야 합니다.
- id: step6_column_width
  title: 6단계. 컬럼 너비와 행 높이
  structuredPrimary: true
  subtitle: column_dimensions / row_dimensions
  goal: 긴 텍스트가 잘리지 않도록 컬럼 너비와 행 높이를 명시적으로 조정한다.
  why: openpyxl은 자동 너비 조정을 지원하지 않습니다. 명시적으로 너비를 지정하지 않으면 사용자가 매번 셀 경계를 더블클릭해야 합니다.
  explanation: |-
    \`ws.column_dimensions["A"].width = 18\`로 A 컬럼 너비를, \`ws.row_dimensions[1].height = 24\`로 1행 높이를 지정합니다. width 단위는 Calibri 11pt의 평균 문자 수에 가까운 추정값이고, height는 포인트(pt)입니다.
  tips:
  - 모든 컬럼을 일률적으로 같은 너비로 두지 말고, 컬럼의 콘텐츠 길이에 맞춰 차별화하세요. 날짜는 좁게, region 이름은 중간, 금액은 약간 넓게 두는 식입니다.
  snippet: |-
    from openpyxl import Workbook

    book = Workbook()
    sheet = book.active
    sheet.append(["date", "region", "amount"])
    sheet.column_dimensions["A"].width = 14
    sheet.column_dimensions["B"].width = 12
    sheet.column_dimensions["C"].width = 16
    sheet.row_dimensions[1].height = 22
    sheet.column_dimensions["A"].width, sheet.row_dimensions[1].height
  exercise:
    prompt: B 컬럼만 너비를 20으로 늘리고, 1행 높이를 30으로 키우세요.
    starterCode: |-
      from openpyxl import Workbook

      book = Workbook()
      sheet = book.active
      sheet.append(["date", "region", "amount"])
      sheet.column_dimensions["A"].width = 14
      sheet.column_dimensions["B"].width = ___
      sheet.column_dimensions["C"].width = 16
      sheet.row_dimensions[1].height = ___
      sheet.column_dimensions["B"].width, sheet.row_dimensions[1].height
    hints:
    - width와 height는 모두 숫자 그대로 대입합니다. 단위 표기는 필요 없습니다.
  check:
    noError: column_dimensions의 키는 컬럼 문자, row_dimensions는 정수 인덱스입니다.
    resultCheck: B 컬럼 width가 20, 1행 height가 30이어야 합니다.
- id: validation
  title: 7단계. 검증 루프 - 스타일 보존 확인
  structuredPrimary: true
  subtitle: 저장 → 재오픈 → 스타일 비교
  goal: NamedStyle을 적용한 보고서를 저장 후 다시 열어, 스타일 이름과 핵심 속성이 보존되는지 확인한다.
  why: 스타일은 적용했지만 저장/재오픈 과정에서 손실되는 경우가 가끔 있습니다. 자동화의 마지막 안전망은 결과 파일을 다시 열어 확인하는 것입니다.
  explanation: |-
    헤더 셀의 style 이름, font.bold, fill.start_color.rgb를 모두 검증합니다. 변주 실험으로 다른 워크북에서도 같은 NamedStyle을 등록해 같은 결과가 나오는지 확인하세요.
  tips:
  - "이 시점부터 보고서를 디자인 시스템으로 다루기 시작합니다. 한 곳에서 스타일을 바꾸면 모든 보고서가 일관되게 변하도록 설계하세요."
  snippet: |-
    from pathlib import Path
    from tempfile import TemporaryDirectory
    from openpyxl import Workbook, load_workbook
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

    def buildStyledReport(path):
        book = Workbook()
        edge = Side(style="thin", color="FF000000")
        headerStyle = NamedStyle(name="headerStyle")
        headerStyle.font = Font(bold=True, color="FFFFFFFF")
        headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
        headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)
        headerStyle.alignment = Alignment(horizontal="center", vertical="center")
        book.add_named_style(headerStyle)

        sheet = book.active
        sheet.title = "summary"
        sheet.append(["region", "amount"])
        sheet.append(["Seoul", 120000])
        sheet.append(["Busan", 80000])
        for cell in sheet[1]:
            cell.style = "headerStyle"
        for amountCell in sheet["B2:B3"]:
            amountCell[0].number_format = "#,##0\\"원\\""
        sheet.column_dimensions["A"].width = 14
        sheet.column_dimensions["B"].width = 16
        book.save(path)
        return path

    workdir = TemporaryDirectory()
    reportPath = buildStyledReport(Path(workdir.name) / "styled.xlsx")

    reopened = load_workbook(reportPath)
    headerCell = reopened["summary"]["A1"]
    assert headerCell.style == "headerStyle"
    assert headerCell.font.bold is True
    assert headerCell.fill.start_color.rgb == "FF305496"
    assert reopened["summary"]["B2"].number_format == "#,##0\\"원\\""
    headerCell.style, headerCell.font.bold, headerCell.fill.start_color.rgb
  exercise:
    prompt: NamedStyle을 추가해 dataRow에 옅은 회색 fill을 적용하고, 검증 assert를 한 줄 더 추가하세요.
    starterCode: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from openpyxl import Workbook, load_workbook
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

      def buildStyledReport(path):
          book = Workbook()
          edge = Side(style="thin", color="FF000000")
          headerStyle = NamedStyle(name="headerStyle")
          headerStyle.font = Font(bold=True, color="FFFFFFFF")
          headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
          headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)
          headerStyle.alignment = Alignment(horizontal="center", vertical="center")
          book.add_named_style(headerStyle)

          dataRow = NamedStyle(name="dataRow")
          dataRow.fill = PatternFill(start_color="FFF2F2F2", end_color=___, fill_type="solid")
          book.add_named_style(dataRow)

          sheet = book.active
          sheet.title = "summary"
          sheet.append(["region", "amount"])
          sheet.append(["Seoul", 120000])
          for cell in sheet[1]:
              cell.style = "headerStyle"
          for cell in sheet[2]:
              cell.style = "dataRow"
          book.save(path)
          return path

      workdir = TemporaryDirectory()
      reportPath = buildStyledReport(Path(workdir.name) / "styled.xlsx")
      reopened = load_workbook(reportPath)
      assert reopened["summary"]["A2"].style == ___
      reopened["summary"]["A2"].style
    hints:
    - "fill_type='solid'인 PatternFill에서는 start_color와 end_color를 같은 값으로 주는 것이 안전합니다."
  check:
    noError: 두 NamedStyle 모두 add_named_style로 등록되어야 합니다.
    resultCheck: A2의 style이 "dataRow"여야 합니다.
- id: practice
  title: 실습 - 종합 미션 2개
  structuredPrimary: true
  subtitle: import부터 검증까지 독립 실행
  goal: Font·Fill·Border·Alignment·NumberFormat·NamedStyle·컬럼너비를 두 가지 보고서에 결합한다.
  why: 스타일은 한 번 한 강의 안에서 처음부터 끝까지 직접 작성해 봐야 디자인 시스템 감각이 잡힙니다.
  explanation: |-
    미션1은 분기별 매출 요약표를 headerStyle + 통화 포맷 + 컬럼 너비까지 적용해 만듭니다. 미션2는 출퇴근 기록 양식에 NamedStyle 두 개(headerStyle/weekendRow)를 등록해 토/일 행을 회색으로 강조합니다.
  tips:
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  - 변수 prefix는 \`qrev*\`(미션1), \`att*\`(미션2)로 격리됩니다.
  snippet: |-
    from pathlib import Path
    from tempfile import TemporaryDirectory
    from openpyxl import Workbook, load_workbook
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side
  exercise:
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.
    starterCode: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from openpyxl import Workbook, load_workbook
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

      workdir = TemporaryDirectory()
      target = Path(workdir.name) / "mission.xlsx"
      ___
    hints:
    - 미션1 헤더 스타일은 흰 글자 + 짙은 파란 fill + 가운데 정렬.
    - 미션2 weekendRow는 회색 fill만 적용하면 됩니다.
  check:
    noError: NamedStyle 등록 시 같은 이름 중복 금지. 각 미션의 prefix가 다르므로 충돌 없음.
    resultCheck: 재오픈 후 헤더 셀의 style/font/fill과 가중치 행의 fill이 모두 보존되어야 합니다.
  blocks:
  - type: tip
    content: NamedStyle 이름은 워크북 안에서 유일해야 합니다. 미션별 prefix로 충돌을 피했습니다.
  - type: expansion
    title: "미션1: 분기별 매출 요약표 + 통화 포맷 + 헤더 스타일"
    blocks:
    - type: code
      title: 요약표 생성
      content: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from openpyxl import Workbook, load_workbook
        from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side

        qrevDir = TemporaryDirectory()
        qrevPath = Path(qrevDir.name) / "quarterly_revenue.xlsx"

        qrevBook = Workbook()
        qrevEdge = Side(style="thin", color="FF000000")
        qrevHeader = NamedStyle(name="qrevHeader")
        qrevHeader.font = Font(bold=True, color="FFFFFFFF")
        qrevHeader.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")
        qrevHeader.border = Border(left=qrevEdge, right=qrevEdge, top=qrevEdge, bottom=qrevEdge)
        qrevHeader.alignment = Alignment(horizontal="center")
        qrevBook.add_named_style(qrevHeader)

        qrevSheet = qrevBook.active
        qrevSheet.title = "summary"
        qrevSheet.append(["quarter", "revenue"])
        for cell in qrevSheet[1]:
            cell.style = "qrevHeader"
        for quarter, amount in [("Q1", 12500000), ("Q2", 18200000), ("Q3", 14700000), ("Q4", 21000000)]:
            qrevSheet.append([quarter, amount])
        for revCell in qrevSheet["B2:B5"]:
            revCell[0].number_format = "#,##0\\"원\\""
        qrevSheet.column_dimensions["A"].width = 12
        qrevSheet.column_dimensions["B"].width = 20
        qrevBook.save(qrevPath)
        qrevSheet.max_row
    - type: code
      title: 스타일 보존 검증
      content: |-
        qrevReopen = load_workbook(qrevPath)
        qrevBack = qrevReopen["summary"]
        assert qrevBack["A1"].style == "qrevHeader"
        assert qrevBack["A1"].font.bold is True
        assert qrevBack["A1"].fill.start_color.rgb == "FF305496"
        assert qrevBack["B2"].number_format == "#,##0\\"원\\""
        assert qrevBack.column_dimensions["B"].width == 20
        qrevBack["A1"].style, qrevBack["B2"].number_format
  - type: expansion
    title: "미션2: 출퇴근 기록 + 주말 회색 NamedStyle"
    blocks:
    - type: code
      title: 출퇴근 양식 생성
      content: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from openpyxl import Workbook, load_workbook
        from openpyxl.styles import Font, NamedStyle, PatternFill

        attDir = TemporaryDirectory()
        attPath = Path(attDir.name) / "attendance.xlsx"

        attBook = Workbook()
        attHeader = NamedStyle(name="attHeader")
        attHeader.font = Font(bold=True)
        attBook.add_named_style(attHeader)
        attWeekend = NamedStyle(name="attWeekend")
        attWeekend.fill = PatternFill(start_color="FFEFEFEF", end_color="FFEFEFEF", fill_type="solid")
        attBook.add_named_style(attWeekend)

        attSheet = attBook.active
        attSheet.title = "attendance"
        attSheet.append(["date", "weekday", "check_in", "check_out"])
        for cell in attSheet[1]:
            cell.style = "attHeader"
        attRows = [
            ("2026-05-04", "Mon", "09:00", "18:00"),
            ("2026-05-05", "Tue", "09:02", "18:10"),
            ("2026-05-09", "Sat", None, None),
            ("2026-05-10", "Sun", None, None),
        ]
        for index, row in enumerate(attRows, start=2):
            for col, value in enumerate(row, start=1):
                attSheet.cell(row=index, column=col, value=value)
            if row[1] in ("Sat", "Sun"):
                for cell in attSheet[index]:
                    cell.style = "attWeekend"
        attBook.save(attPath)
        attSheet.max_row
    - type: code
      title: 주말 행 스타일 검증
      content: |-
        attReopen = load_workbook(attPath)
        attBack = attReopen["attendance"]
        assert attBack["A1"].style == "attHeader"
        assert attBack["A4"].style == "attWeekend"
        assert attBack["A5"].style == "attWeekend"
        assert attBack["A2"].style != "attWeekend"
        attBack["A4"].style, attBack["A2"].style
- id: summary
  title: 정리
  subtitle: 스타일은 디자인 시스템
  blocks:
  - type: text
    content: |-
      Font/Fill/Border/Alignment, 숫자 포맷, NamedStyle, 컬럼/행 크기까지 - 보고서의 시각적 표준을 코드로 만들었습니다. 다음 강의에서는 같은 표 위에 조건부 서식으로 "신호등" 효과를 얹습니다.
  - type: list
    style: bullet
    items:
    - "Font/PatternFill/Border/Alignment 네 객체는 immutable. 새로 만들어 통째로 대입한다."
    - "number_format은 Excel 사용자 정의 형식 문자열을 그대로 받는다."
    - "NamedStyle로 한 번 정의해 cell.style = '이름' 한 줄로 적용한다."
    - "openpyxl은 자동 컬럼 너비를 지원하지 않는다. column_dimensions로 명시 지정 필수."
    - "스타일도 검증한다. style/font/fill을 재오픈 후 assert로 잠가 둔다."
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
  - id: openpyxl_05-number-format-policy-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_font
    - summary
    title: 업무 semantic type별 Excel number format 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 통화·비율·날짜·정수 값에 맞는 format과 raw type을 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 표시 format으로 text 숫자를 숫자로 만들 수는 없습니다. raw type도 검사하세요.
    - semantic type별 허용 format 목록을 workbook 계약에 두세요.
    exercise:
      prompt: audit_number_formats(cells, policy)를 완성하세요.
      starterCode: |-
        def audit_number_formats(cells, policy):
            raise NotImplementedError
      solution: |
        def audit_number_formats(cells, policy):
            violations = []
            for cell in cells:
                semantic = cell["semantic"]
                contract = policy[semantic]
                reasons = []
                if cell.get("numberFormat") not in contract["formats"]:
                    reasons.append("format")
                if type(cell.get("value")).__name__ not in contract["valueTypes"]:
                    reasons.append("value-type")
                if reasons:
                    violations.append({"cell": cell["cell"], "reasons": reasons})
            return {"accepted": not violations, "violations": violations}
      hints: *id001
    check:
      id: python.openpyxl.openpyxl_05.number-format-policy.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_05.number-format-policy.mastery.behavior.v1.fixture
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
        entry: audit_number_formats
        cases:
        - id: accepts-currency-and-percent
          arguments:
          - value:
            - cell: B2
              semantic: currency
              value: 1000
              numberFormat: '#,##0'
            - cell: C2
              semantic: percent
              value: 0.25
              numberFormat: 0.0%
          - value:
              currency:
                formats:
                - '#,##0'
                valueTypes:
                - int
                - float
              percent:
                formats:
                - 0.0%
                valueTypes:
                - float
          expectedReturn:
            accepted: true
            violations: []
        - id: reports-text-number-and-format
          arguments:
          - value:
            - cell: B2
              semantic: currency
              value: '1000'
              numberFormat: General
          - value:
              currency:
                formats:
                - '#,##0'
                valueTypes:
                - int
                - float
          expectedReturn:
            accepted: false
            violations:
            - cell: B2
              reasons:
              - format
              - value-type
        - id: accepts-date-serial-contract
          arguments:
          - value:
            - cell: A2
              semantic: date
              value: '2026-07-22'
              numberFormat: yyyy-mm-dd
          - value:
              date:
                formats:
                - yyyy-mm-dd
                valueTypes:
                - str
          expectedReturn:
            accepted: true
            violations: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: openpyxl_05-style-consistency-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_05-number-format-policy-mastery
    title: 새 workbook의 header·data style 일관성 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: role별 style signature가 하나인지와 과도한 unique style 수를 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - cell마다 새 style을 만들지 말고 role별 style signature를 재사용하세요.
    - 워크북 전체 unique style budget을 검사해 file 비대화를 막으세요.
    exercise:
      prompt: audit_style_consistency(cells, maximum_unique_styles)를 완성하세요.
      starterCode: |-
        def audit_style_consistency(cells, maximum_unique_styles):
            raise NotImplementedError
      solution: |
        def audit_style_consistency(cells, maximum_unique_styles):
            by_role = {}
            all_styles = set()
            for cell in cells:
                signature = cell["style"]
                by_role.setdefault(cell["role"], set()).add(signature)
                all_styles.add(signature)
            inconsistent = sorted(role for role, styles in by_role.items() if len(styles) > 1)
            failures = []
            if inconsistent:
                failures.append("role-consistency")
            if len(all_styles) > maximum_unique_styles:
                failures.append("style-budget")
            return {"accepted": not failures, "failures": failures, "inconsistentRoles": inconsistent, "uniqueStyleCount": len(all_styles)}
      hints: *id002
    check:
      id: python.openpyxl.openpyxl_05.style-consistency-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_05.style-consistency-audit.transfer.behavior.v1.fixture
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
        entry: audit_style_consistency
        cases:
        - id: accepts-consistent-role-styles
          arguments:
          - value:
            - cell: A1
              role: header
              style: h
            - cell: B1
              role: header
              style: h
            - cell: A2
              role: data
              style: d
          - value: 3
          expectedReturn:
            accepted: true
            failures: []
            inconsistentRoles: []
            uniqueStyleCount: 2
        - id: reports-role-inconsistency
          arguments:
          - value:
            - cell: A1
              role: header
              style: h1
            - cell: B1
              role: header
              style: h2
          - value: 3
          expectedReturn:
            accepted: false
            failures:
            - role-consistency
            inconsistentRoles:
            - header
            uniqueStyleCount: 2
        - id: reports-style-budget
          arguments:
          - value:
            - cell: A
              role: a
              style: '1'
            - cell: B
              role: b
              style: '2'
            - cell: C
              role: c
              style: '3'
          - value: 2
          expectedReturn:
            accepted: false
            failures:
            - style-budget
            inconsistentRoles: []
            uniqueStyleCount: 3
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: openpyxl_05-cell-format-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_05-style-consistency-audit-transfer
    title: 셀 서식·숫자 format 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: raw type·semantic format·style budget 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Workbook 저장 성공과 업무 값·수식·표시의 정확성을 분리해 검증하세요.
    - Web에서는 문서 계약을 검증하고 Local에서는 재개방한 artifact evidence를 남기세요.
    exercise:
      prompt: choose_cell_format_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_cell_format_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_cell_format_evidence(situation):
            table = {'number': {'action': 'validate raw type and semantic format', 'evidence': 'cell value type and format', 'risk': 'text masquerading as number'}, 'style': {'action': 'reuse role-based signatures', 'evidence': 'styles by role', 'risk': 'inconsistent workbook'}, 'budget': {'action': 'bound unique styles', 'evidence': 'unique style count', 'risk': 'bloated xlsx'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.openpyxl.openpyxl_05.cell-format-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_05.cell-format-recall.retrieval.behavior.v1.fixture
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
        entry: choose_cell_format_evidence
        cases:
        - id: recalls-number
          arguments:
          - value: number
          expectedReturn:
            action: validate raw type and semantic format
            evidence: cell value type and format
            risk: text masquerading as number
        - id: recalls-style
          arguments:
          - value: style
          expectedReturn:
            action: reuse role-based signatures
            evidence: styles by role
            risk: inconsistent workbook
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};