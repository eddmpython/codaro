var e=`meta:\r
  id: openpyxl_05\r
  title: 셀 서식과 숫자 포맷\r
  order: 5\r
  category: openpyxl\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - Font\r
  - Fill\r
  - Border\r
  - Alignment\r
  - number_format\r
  seo:\r
    title: openpyxl 셀 서식과 숫자 포맷 - Font·Fill·Border·Alignment·NumberFormat\r
    description: 보고서의 시각적 표준을 코드로 만드는 방법. Font/Fill/Border/Alignment의 4대 객체와 number_format 문법, NamedStyle 재사용까지 정리합니다.\r
    keywords:\r
    - openpyxl Font\r
    - PatternFill\r
    - Border Side\r
    - number_format\r
    - NamedStyle\r
intro:\r
  direction: 셀의 글자, 배경, 테두리, 정렬, 숫자 포맷을 코드로 부여하고, NamedStyle로 재사용 가능한 스타일 라이브러리를 만듭니다.\r
  benefits:\r
  - "Font/PatternFill/Border/Alignment 네 가지 스타일 객체의 역할을 정확히 구분합니다."\r
  - 통화·퍼센트·날짜 숫자 포맷을 의도대로 적용합니다.\r
  - 같은 헤더 스타일을 한 번 정의해 여러 시트에 반복 적용합니다.\r
  diagram:\r
    steps:\r
    - label: Font\r
      detail: 글자 굵기, 크기, 색상.\r
    - label: Fill\r
      detail: 셀 배경 색상.\r
    - label: Border / Alignment\r
      detail: 테두리와 정렬 - 표가 표처럼 보이게 한다.\r
    - label: number_format / NamedStyle\r
      detail: 숫자 표현과 스타일 재사용.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: Font/PatternFill/Border/Alignment/NamedStyle 모두 openpyxl.styles 안에 있다. uv run python에서 즉시 실행 가능.\r
    - label: 스타일 보존 재오픈\r
      detail: 저장한 파일을 load_workbook으로 다시 열어 cell.style 이름과 fill 색이 보존됐는지 assert로 확인한다.\r
sections:\r
- id: step1_font\r
  title: 1단계. 글자 스타일\r
  structuredPrimary: true\r
  subtitle: Font(name, size, bold, color)\r
  goal: 헤더 셀에 굵은 글씨와 색상을 부여한다.\r
  why: 헤더가 본문과 구분되지 않으면 보고서가 표가 아니라 단순 텍스트로 읽힙니다. 시각적 계층 구조의 첫 단계가 글자입니다.\r
  explanation: |-\r
    \`from openpyxl.styles import Font\` 후 \`cell.font = Font(bold=True, color="FFFFFF", size=12)\`로 폰트를 적용합니다. color는 ARGB 8자리 또는 RGB 6자리 16진수 문자열입니다. Font 객체는 immutable이므로 매번 새로 만들어 대입해야 합니다.\r
  tips:\r
  - "cell.font.bold = True 같은 in-place 수정은 동작하지 않습니다. 새 Font 객체를 통째로 대입해야 적용됩니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.styles import Font\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "region", "amount"])\r
    headerFont = Font(name="Calibri", size=12, bold=True, color="FFFFFFFF")\r
    for cell in sheet[1]:\r
        cell.font = headerFont\r
    sheet["A1"].font.bold, sheet["A1"].font.color.rgb\r
  exercise:\r
    prompt: 헤더 글자 크기를 14로, 색상을 검정("FF000000")으로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.styles import Font\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "region", "amount"])\r
      headerFont = Font(name="Calibri", size=___, bold=True, color=___)\r
      for cell in sheet[1]:\r
          cell.font = headerFont\r
      sheet["A1"].font.size, sheet["A1"].font.color.rgb\r
    hints:\r
    - color는 ARGB 8자리 문자열입니다. 검정은 FF000000, A는 alpha입니다.\r
  check:\r
    noError: Font 인자가 모두 키워드로 전달되어야 합니다.\r
    resultCheck: 출력 튜플의 size와 rgb가 입력한 값과 같아야 합니다.\r
- id: step2_fill\r
  title: 2단계. 셀 배경 채우기\r
  structuredPrimary: true\r
  subtitle: PatternFill(start_color, end_color, fill_type)\r
  goal: 헤더에 배경 색상을 부여해 본문과 시각적으로 분리한다.\r
  why: 글자 굵기만으로는 헤더가 본문과 충분히 구분되지 않을 때가 많습니다. 배경 색상이 가장 강력한 시각 분리 도구입니다.\r
  explanation: |-\r
    \`from openpyxl.styles import PatternFill\` 후 \`cell.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\`. fill_type을 지정하지 않으면 색이 보이지 않습니다. solid 단색 채우기가 가장 흔합니다.\r
  tips:\r
  - "그라데이션 채우기는 GradientFill이라는 별도 객체입니다. 자동 보고서에서는 solid PatternFill로 충분한 경우가 거의 전부입니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.styles import Font, PatternFill\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "region", "amount"])\r
    headerFill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
    headerFont = Font(bold=True, color="FFFFFFFF")\r
    for cell in sheet[1]:\r
        cell.fill = headerFill\r
        cell.font = headerFont\r
    sheet["A1"].fill.start_color.rgb, sheet["A1"].fill.fill_type\r
  exercise:\r
    prompt: 색상을 연한 회색("FFD9D9D9")으로 바꾸고 fill_type이 여전히 "solid"인지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.styles import Font, PatternFill\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "region", "amount"])\r
      headerFill = PatternFill(start_color=___, end_color=___, fill_type=___)\r
      for cell in sheet[1]:\r
          cell.fill = headerFill\r
      sheet["A1"].fill.start_color.rgb, sheet["A1"].fill.fill_type\r
    hints:\r
    - start_color와 end_color는 같은 값을 쓰는 것이 단색의 안전한 패턴입니다.\r
  check:\r
    noError: PatternFill에 fill_type을 반드시 지정해야 색이 보입니다.\r
    resultCheck: 출력 튜플의 색과 fill_type이 입력 값과 같아야 합니다.\r
- id: step3_border_alignment\r
  title: 3단계. 테두리와 정렬\r
  structuredPrimary: true\r
  subtitle: Border / Side / Alignment\r
  goal: 표 영역에 균일한 테두리를 둘러 행/열의 경계를 명확히 한다.\r
  why: 테두리가 없는 셀들은 데이터를 시각적으로 분리하기 어렵습니다. 정렬은 숫자와 텍스트의 종류를 무의식적으로 알려주는 신호입니다.\r
  explanation: |-\r
    \`Border(left=Side(...), right=..., top=..., bottom=...)\`로 네 변을 개별 지정합니다. \`Side(style="thin", color="FF000000")\`이 가장 흔합니다. Alignment는 \`Alignment(horizontal="center", vertical="center", wrap_text=True)\`처럼 씁니다. 헤더는 가운데 정렬, 숫자는 오른쪽 정렬이 표준입니다.\r
  tips:\r
  - "wrap_text=True는 긴 문자열을 셀 안에서 줄바꿈합니다. 행 높이를 같이 늘려야 보입니다(row_dimensions[row].height)."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.styles import Border, Side, Alignment\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "region", "amount"])\r
    sheet.append(["2026-05-01", "Seoul", 120000])\r
    sheet.append(["2026-05-02", "Busan", 80000])\r
\r
    edge = Side(style="thin", color="FF000000")\r
    boxBorder = Border(left=edge, right=edge, top=edge, bottom=edge)\r
    centerAlign = Alignment(horizontal="center", vertical="center")\r
\r
    for row in sheet["A1:C3"]:\r
        for cell in row:\r
            cell.border = boxBorder\r
    for cell in sheet[1]:\r
        cell.alignment = centerAlign\r
\r
    sheet["A1"].alignment.horizontal, sheet["A1"].border.top.style\r
  exercise:\r
    prompt: 본문 숫자(amount 컬럼)는 오른쪽 정렬이 자연스럽습니다. C2:C3에 right 정렬을 적용하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.styles import Border, Side, Alignment\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "region", "amount"])\r
      sheet.append(["2026-05-01", "Seoul", 120000])\r
      sheet.append(["2026-05-02", "Busan", 80000])\r
\r
      edge = Side(style="thin", color="FF000000")\r
      boxBorder = Border(left=edge, right=edge, top=edge, bottom=edge)\r
      rightAlign = Alignment(horizontal=___)\r
\r
      for row in sheet["A1:C3"]:\r
          for cell in row:\r
              cell.border = boxBorder\r
      for cell in sheet["C2:C3"]:\r
          for innerCell in (cell if isinstance(cell, tuple) else (cell,)):\r
              innerCell.alignment = rightAlign\r
\r
      sheet["C2"].alignment.horizontal, sheet["C3"].alignment.horizontal\r
    hints:\r
    - "horizontal에 들어갈 값은 'right' 입니다. 'left'/'center'/'right'/'justify'/'fill'/'distributed' 등이 허용됩니다."\r
  check:\r
    noError: Border/Side/Alignment 객체가 모두 styles에서 import되어야 합니다.\r
    resultCheck: C2와 C3의 horizontal alignment가 "right" 여야 합니다.\r
- id: step4_number_format\r
  title: 4단계. 숫자 포맷\r
  structuredPrimary: true\r
  subtitle: cell.number_format\r
  goal: 통화·퍼센트·날짜를 보고서 표준 형식으로 보여 준다.\r
  why: 1200000과 1,200,000은 같은 값이지만 사람의 인지 부하가 완전히 다릅니다. 숫자 포맷이 곧 보고서의 품질입니다.\r
  explanation: |-\r
    \`cell.number_format\`은 Excel의 사용자 정의 형식 문자열을 그대로 받습니다. 자주 쓰는 형식은 다음과 같습니다.\r
\r
    | 의미 | 형식 |\r
    | --- | --- |\r
    | 천 단위 콤마 | "#,##0" |\r
    | 통화(원화) | "#,##0\\"원\\"" |\r
    | 소수점 둘째자리 퍼센트 | "0.00%" |\r
    | 날짜(yyyy-mm-dd) | "yyyy-mm-dd" |\r
    | 음수 빨간색 | "#,##0;[Red]-#,##0" |\r
  tips:\r
  - "퍼센트 형식은 셀에 0.1이 들어 있으면 10%로 보입니다. 이미 10이 들어 있으면 1000%가 됩니다. 데이터 자체와 형식의 단위를 항상 맞추세요."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["item", "amount", "rate"])\r
    sheet.append(["revenue", 12345678, 0.123])\r
    sheet.append(["cost", 8456000, 0.087])\r
\r
    sheet["B2"].number_format = "#,##0\\"원\\""\r
    sheet["B3"].number_format = "#,##0\\"원\\""\r
    sheet["C2"].number_format = "0.00%"\r
    sheet["C3"].number_format = "0.00%"\r
\r
    sheet["B2"].number_format, sheet["C2"].number_format\r
  exercise:\r
    prompt: rate를 소수점 첫째자리만 보이도록 "0.0%"로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["item", "amount", "rate"])\r
      sheet.append(["revenue", 12345678, 0.123])\r
      sheet.append(["cost", 8456000, 0.087])\r
\r
      sheet["B2"].number_format = "#,##0\\"원\\""\r
      sheet["B3"].number_format = "#,##0\\"원\\""\r
      sheet["C2"].number_format = ___\r
      sheet["C3"].number_format = ___\r
\r
      sheet["C2"].number_format, sheet["C3"].number_format\r
    hints:\r
    - 둘째자리는 "0.00%", 첫째자리는 "0.0%" 입니다.\r
  check:\r
    noError: number_format은 문자열이어야 합니다.\r
    resultCheck: C2와 C3의 number_format이 "0.0%" 여야 합니다.\r
- id: step5_named_style\r
  title: 5단계. NamedStyle로 재사용\r
  structuredPrimary: true\r
  subtitle: 한 번 정의, 모든 시트에서 사용\r
  goal: 같은 헤더 스타일을 NamedStyle 하나로 묶어, 여러 시트의 헤더에 한 줄로 적용한다.\r
  why: 매번 Font·Fill·Border·Alignment를 새로 만들면 코드도 길어지고 일관성도 깨집니다. NamedStyle은 자동 보고서의 디자인 시스템 역할을 합니다.\r
  explanation: |-\r
    \`from openpyxl.styles import NamedStyle\` 후 NamedStyle에 font/fill/border/alignment/number_format을 채워 \`book.add_named_style(...)\`로 등록합니다. 등록 이후에는 \`cell.style = "headerStyle"\`처럼 이름만으로 적용할 수 있습니다.\r
  tips:\r
  - NamedStyle은 워크북 단위로 등록됩니다. 같은 워크북의 모든 시트에서 같은 이름으로 호출할 수 있어 일관성이 자연스럽게 잡힙니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
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
    detail = book.create_sheet("detail")\r
    detail.append(["date", "region", "amount"])\r
\r
    for sheet in (summary, detail):\r
        for cell in sheet[1]:\r
            cell.style = "headerStyle"\r
\r
    summary["A1"].style, detail["B1"].style\r
  exercise:\r
    prompt: bodyMoney라는 NamedStyle을 하나 더 만들어 number_format이 "#,##0\\"원\\"" 인 금액 본문 스타일을 등록하고, summary의 B2에 적용하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
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
      bodyMoney = NamedStyle(name=___)\r
      bodyMoney.number_format = ___\r
      bodyMoney.alignment = Alignment(horizontal="right")\r
      book.add_named_style(bodyMoney)\r
\r
      summary = book.active\r
      summary.title = "summary"\r
      summary.append(["region", "amount"])\r
      summary.append(["Seoul", 120000])\r
      for cell in summary[1]:\r
          cell.style = "headerStyle"\r
      summary["B2"].style = "bodyMoney"\r
\r
      summary["B2"].style, summary["B2"].number_format\r
    hints:\r
    - NamedStyle의 name은 cell.style에 넣을 문자열과 일치해야 합니다.\r
  check:\r
    noError: 같은 이름의 NamedStyle을 두 번 등록하면 ValueError. 새 이름을 쓰세요.\r
    resultCheck: B2의 style이 "bodyMoney"이고 number_format이 "#,##0\\"원\\"" 이어야 합니다.\r
- id: step6_column_width\r
  title: 6단계. 컬럼 너비와 행 높이\r
  structuredPrimary: true\r
  subtitle: column_dimensions / row_dimensions\r
  goal: 긴 텍스트가 잘리지 않도록 컬럼 너비와 행 높이를 명시적으로 조정한다.\r
  why: openpyxl은 자동 너비 조정을 지원하지 않습니다. 명시적으로 너비를 지정하지 않으면 사용자가 매번 셀 경계를 더블클릭해야 합니다.\r
  explanation: |-\r
    \`ws.column_dimensions["A"].width = 18\`로 A 컬럼 너비를, \`ws.row_dimensions[1].height = 24\`로 1행 높이를 지정합니다. width 단위는 Calibri 11pt의 평균 문자 수에 가까운 추정값이고, height는 포인트(pt)입니다.\r
  tips:\r
  - 모든 컬럼을 일률적으로 같은 너비로 두지 말고, 컬럼의 콘텐츠 길이에 맞춰 차별화하세요. 날짜는 좁게, region 이름은 중간, 금액은 약간 넓게 두는 식입니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "region", "amount"])\r
    sheet.column_dimensions["A"].width = 14\r
    sheet.column_dimensions["B"].width = 12\r
    sheet.column_dimensions["C"].width = 16\r
    sheet.row_dimensions[1].height = 22\r
    sheet.column_dimensions["A"].width, sheet.row_dimensions[1].height\r
  exercise:\r
    prompt: B 컬럼만 너비를 20으로 늘리고, 1행 높이를 30으로 키우세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "region", "amount"])\r
      sheet.column_dimensions["A"].width = 14\r
      sheet.column_dimensions["B"].width = ___\r
      sheet.column_dimensions["C"].width = 16\r
      sheet.row_dimensions[1].height = ___\r
      sheet.column_dimensions["B"].width, sheet.row_dimensions[1].height\r
    hints:\r
    - width와 height는 모두 숫자 그대로 대입합니다. 단위 표기는 필요 없습니다.\r
  check:\r
    noError: column_dimensions의 키는 컬럼 문자, row_dimensions는 정수 인덱스입니다.\r
    resultCheck: B 컬럼 width가 20, 1행 height가 30이어야 합니다.\r
- id: validation\r
  title: 7단계. 검증 루프 - 스타일 보존 확인\r
  structuredPrimary: true\r
  subtitle: 저장 → 재오픈 → 스타일 비교\r
  goal: NamedStyle을 적용한 보고서를 저장 후 다시 열어, 스타일 이름과 핵심 속성이 보존되는지 확인한다.\r
  why: 스타일은 적용했지만 저장/재오픈 과정에서 손실되는 경우가 가끔 있습니다. 자동화의 마지막 안전망은 결과 파일을 다시 열어 확인하는 것입니다.\r
  explanation: |-\r
    헤더 셀의 style 이름, font.bold, fill.start_color.rgb를 모두 검증합니다. 변주 실험으로 다른 워크북에서도 같은 NamedStyle을 등록해 같은 결과가 나오는지 확인하세요.\r
  tips:\r
  - "이 시점부터 보고서를 디자인 시스템으로 다루기 시작합니다. 한 곳에서 스타일을 바꾸면 모든 보고서가 일관되게 변하도록 설계하세요."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
\r
    def buildStyledReport(path):\r
        book = Workbook()\r
        edge = Side(style="thin", color="FF000000")\r
        headerStyle = NamedStyle(name="headerStyle")\r
        headerStyle.font = Font(bold=True, color="FFFFFFFF")\r
        headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
        headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)\r
        headerStyle.alignment = Alignment(horizontal="center", vertical="center")\r
        book.add_named_style(headerStyle)\r
\r
        sheet = book.active\r
        sheet.title = "summary"\r
        sheet.append(["region", "amount"])\r
        sheet.append(["Seoul", 120000])\r
        sheet.append(["Busan", 80000])\r
        for cell in sheet[1]:\r
            cell.style = "headerStyle"\r
        for amountCell in sheet["B2:B3"]:\r
            amountCell[0].number_format = "#,##0\\"원\\""\r
        sheet.column_dimensions["A"].width = 14\r
        sheet.column_dimensions["B"].width = 16\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    reportPath = buildStyledReport(Path(workdir.name) / "styled.xlsx")\r
\r
    reopened = load_workbook(reportPath)\r
    headerCell = reopened["summary"]["A1"]\r
    assert headerCell.style == "headerStyle"\r
    assert headerCell.font.bold is True\r
    assert headerCell.fill.start_color.rgb == "FF305496"\r
    assert reopened["summary"]["B2"].number_format == "#,##0\\"원\\""\r
    headerCell.style, headerCell.font.bold, headerCell.fill.start_color.rgb\r
  exercise:\r
    prompt: NamedStyle을 추가해 dataRow에 옅은 회색 fill을 적용하고, 검증 assert를 한 줄 더 추가하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
\r
      def buildStyledReport(path):\r
          book = Workbook()\r
          edge = Side(style="thin", color="FF000000")\r
          headerStyle = NamedStyle(name="headerStyle")\r
          headerStyle.font = Font(bold=True, color="FFFFFFFF")\r
          headerStyle.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
          headerStyle.border = Border(left=edge, right=edge, top=edge, bottom=edge)\r
          headerStyle.alignment = Alignment(horizontal="center", vertical="center")\r
          book.add_named_style(headerStyle)\r
\r
          dataRow = NamedStyle(name="dataRow")\r
          dataRow.fill = PatternFill(start_color="FFF2F2F2", end_color=___, fill_type="solid")\r
          book.add_named_style(dataRow)\r
\r
          sheet = book.active\r
          sheet.title = "summary"\r
          sheet.append(["region", "amount"])\r
          sheet.append(["Seoul", 120000])\r
          for cell in sheet[1]:\r
              cell.style = "headerStyle"\r
          for cell in sheet[2]:\r
              cell.style = "dataRow"\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      reportPath = buildStyledReport(Path(workdir.name) / "styled.xlsx")\r
      reopened = load_workbook(reportPath)\r
      assert reopened["summary"]["A2"].style == ___\r
      reopened["summary"]["A2"].style\r
    hints:\r
    - "fill_type='solid'인 PatternFill에서는 start_color와 end_color를 같은 값으로 주는 것이 안전합니다."\r
  check:\r
    noError: 두 NamedStyle 모두 add_named_style로 등록되어야 합니다.\r
    resultCheck: A2의 style이 "dataRow"여야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: Font·Fill·Border·Alignment·NumberFormat·NamedStyle·컬럼너비를 두 가지 보고서에 결합한다.\r
  why: 스타일은 한 번 한 강의 안에서 처음부터 끝까지 직접 작성해 봐야 디자인 시스템 감각이 잡힙니다.\r
  explanation: |-\r
    미션1은 분기별 매출 요약표를 headerStyle + 통화 포맷 + 컬럼 너비까지 적용해 만듭니다. 미션2는 출퇴근 기록 양식에 NamedStyle 두 개(headerStyle/weekendRow)를 등록해 토/일 행을 회색으로 강조합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`qrev*\`(미션1), \`att*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1 헤더 스타일은 흰 글자 + 짙은 파란 fill + 가운데 정렬.\r
    - 미션2 weekendRow는 회색 fill만 적용하면 됩니다.\r
  check:\r
    noError: NamedStyle 등록 시 같은 이름 중복 금지. 각 미션의 prefix가 다르므로 충돌 없음.\r
    resultCheck: 재오픈 후 헤더 셀의 style/font/fill과 가중치 행의 fill이 모두 보존되어야 합니다.\r
  blocks:\r
  - type: tip\r
    content: NamedStyle 이름은 워크북 안에서 유일해야 합니다. 미션별 prefix로 충돌을 피했습니다.\r
  - type: expansion\r
    title: "미션1: 분기별 매출 요약표 + 통화 포맷 + 헤더 스타일"\r
    blocks:\r
    - type: code\r
      title: 요약표 생성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Side\r
\r
        qrevDir = TemporaryDirectory()\r
        qrevPath = Path(qrevDir.name) / "quarterly_revenue.xlsx"\r
\r
        qrevBook = Workbook()\r
        qrevEdge = Side(style="thin", color="FF000000")\r
        qrevHeader = NamedStyle(name="qrevHeader")\r
        qrevHeader.font = Font(bold=True, color="FFFFFFFF")\r
        qrevHeader.fill = PatternFill(start_color="FF305496", end_color="FF305496", fill_type="solid")\r
        qrevHeader.border = Border(left=qrevEdge, right=qrevEdge, top=qrevEdge, bottom=qrevEdge)\r
        qrevHeader.alignment = Alignment(horizontal="center")\r
        qrevBook.add_named_style(qrevHeader)\r
\r
        qrevSheet = qrevBook.active\r
        qrevSheet.title = "summary"\r
        qrevSheet.append(["quarter", "revenue"])\r
        for cell in qrevSheet[1]:\r
            cell.style = "qrevHeader"\r
        for quarter, amount in [("Q1", 12500000), ("Q2", 18200000), ("Q3", 14700000), ("Q4", 21000000)]:\r
            qrevSheet.append([quarter, amount])\r
        for revCell in qrevSheet["B2:B5"]:\r
            revCell[0].number_format = "#,##0\\"원\\""\r
        qrevSheet.column_dimensions["A"].width = 12\r
        qrevSheet.column_dimensions["B"].width = 20\r
        qrevBook.save(qrevPath)\r
        qrevSheet.max_row\r
    - type: code\r
      title: 스타일 보존 검증\r
      content: |-\r
        qrevReopen = load_workbook(qrevPath)\r
        qrevBack = qrevReopen["summary"]\r
        assert qrevBack["A1"].style == "qrevHeader"\r
        assert qrevBack["A1"].font.bold is True\r
        assert qrevBack["A1"].fill.start_color.rgb == "FF305496"\r
        assert qrevBack["B2"].number_format == "#,##0\\"원\\""\r
        assert qrevBack.column_dimensions["B"].width == 20\r
        qrevBack["A1"].style, qrevBack["B2"].number_format\r
  - type: expansion\r
    title: "미션2: 출퇴근 기록 + 주말 회색 NamedStyle"\r
    blocks:\r
    - type: code\r
      title: 출퇴근 양식 생성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.styles import Font, NamedStyle, PatternFill\r
\r
        attDir = TemporaryDirectory()\r
        attPath = Path(attDir.name) / "attendance.xlsx"\r
\r
        attBook = Workbook()\r
        attHeader = NamedStyle(name="attHeader")\r
        attHeader.font = Font(bold=True)\r
        attBook.add_named_style(attHeader)\r
        attWeekend = NamedStyle(name="attWeekend")\r
        attWeekend.fill = PatternFill(start_color="FFEFEFEF", end_color="FFEFEFEF", fill_type="solid")\r
        attBook.add_named_style(attWeekend)\r
\r
        attSheet = attBook.active\r
        attSheet.title = "attendance"\r
        attSheet.append(["date", "weekday", "check_in", "check_out"])\r
        for cell in attSheet[1]:\r
            cell.style = "attHeader"\r
        attRows = [\r
            ("2026-05-04", "Mon", "09:00", "18:00"),\r
            ("2026-05-05", "Tue", "09:02", "18:10"),\r
            ("2026-05-09", "Sat", None, None),\r
            ("2026-05-10", "Sun", None, None),\r
        ]\r
        for index, row in enumerate(attRows, start=2):\r
            for col, value in enumerate(row, start=1):\r
                attSheet.cell(row=index, column=col, value=value)\r
            if row[1] in ("Sat", "Sun"):\r
                for cell in attSheet[index]:\r
                    cell.style = "attWeekend"\r
        attBook.save(attPath)\r
        attSheet.max_row\r
    - type: code\r
      title: 주말 행 스타일 검증\r
      content: |-\r
        attReopen = load_workbook(attPath)\r
        attBack = attReopen["attendance"]\r
        assert attBack["A1"].style == "attHeader"\r
        assert attBack["A4"].style == "attWeekend"\r
        assert attBack["A5"].style == "attWeekend"\r
        assert attBack["A2"].style != "attWeekend"\r
        attBack["A4"].style, attBack["A2"].style\r
- id: summary\r
  title: 정리\r
  subtitle: 스타일은 디자인 시스템\r
  blocks:\r
  - type: text\r
    content: |-\r
      Font/Fill/Border/Alignment, 숫자 포맷, NamedStyle, 컬럼/행 크기까지 - 보고서의 시각적 표준을 코드로 만들었습니다. 다음 강의에서는 같은 표 위에 조건부 서식으로 "신호등" 효과를 얹습니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - "Font/PatternFill/Border/Alignment 네 객체는 immutable. 새로 만들어 통째로 대입한다."\r
    - "number_format은 Excel 사용자 정의 형식 문자열을 그대로 받는다."\r
    - "NamedStyle로 한 번 정의해 cell.style = '이름' 한 줄로 적용한다."\r
    - "openpyxl은 자동 컬럼 너비를 지원하지 않는다. column_dimensions로 명시 지정 필수."\r
    - "스타일도 검증한다. style/font/fill을 재오픈 후 assert로 잠가 둔다."\r
`;export{e as default};