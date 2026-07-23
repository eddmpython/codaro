var e=`meta:\r
  id: openpyxl_07\r
  title: 차트 삽입\r
  order: 7\r
  category: openpyxl\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - 차트\r
  - BarChart\r
  - LineChart\r
  - PieChart\r
  - Reference\r
  seo:\r
    title: openpyxl 차트 삽입 - BarChart·LineChart·PieChart·Reference\r
    description: 데이터 영역을 Reference로 잡아 BarChart/LineChart/PieChart를 만들고 시트에 anchor로 배치합니다. 축 제목, 범례, 데이터 라벨까지 다룹니다.\r
    keywords:\r
    - openpyxl chart\r
    - BarChart LineChart\r
    - Reference\r
    - add_chart\r
intro:\r
  direction: 표 데이터를 Reference로 잡아 막대·선·파이 차트를 만들고 시트에 위치 좌표로 배치합니다. 차트 제목, 축 라벨, 범례, 데이터 라벨까지 코드로 제어합니다.\r
  benefits:\r
  - 데이터 영역과 카테고리 영역을 Reference로 정확히 표현합니다.\r
  - 같은 데이터로 BarChart/LineChart/PieChart를 골라 만들어 적합한 표현을 선택합니다.\r
  - 한 워크북 안에 표와 차트를 함께 배치하는 보고서 패턴을 손에 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 영역\r
      detail: Reference(ws, min_col/max_col/min_row/max_row)로 영역을 잡는다.\r
    - label: 차트 생성\r
      detail: BarChart/LineChart/PieChart 중 선택해 add_data/set_categories.\r
    - label: 시트에 배치\r
      detail: ws.add_chart(chart, anchor) - anchor는 차트 좌상단 셀 좌표.\r
    - label: 차트 보존 재오픈\r
      detail: 재오픈 후 ws._charts 리스트에 의도한 개수와 제목이 보존되는지 assert로 확인.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: openpyxl.chart 모듈의 BarChart/LineChart/PieChart/Reference를 import해 즉시 차트를 만든다.\r
    - label: 차트 보존 재오픈\r
      detail: 저장한 파일을 load_workbook으로 다시 열어 _charts 길이와 각 차트의 title을 assert로 확인한다.\r
sections:\r
- id: step1_bar_chart\r
  title: 1단계. 막대 차트\r
  structuredPrimary: true\r
  subtitle: BarChart + Reference\r
  goal: 지역별 매출을 막대 차트로 만들어 시트에 배치한다.\r
  why: 카테고리 비교(지역·상품·요일)는 막대 차트가 가장 직관적입니다. 자동 보고서의 90%는 막대로 충분합니다.\r
  explanation: |-\r
    데이터 영역은 \`Reference(ws, min_col=2, min_row=1, max_col=2, max_row=5)\`로 잡습니다. min_row=1로 잡고 chart.add_data(data, titles_from_data=True)를 쓰면 첫 행이 시리즈 이름으로 인식됩니다. 카테고리(가로축 라벨)는 \`set_categories(Reference(ws, min_col=1, min_row=2, max_row=5))\`로 따로 줍니다.\r
  tips:\r
  - "titles_from_data=True 옵션을 잊으면 첫 데이터 행이 시리즈 이름으로 안 잡혀, 범례에 'Series1'처럼 자동 이름이 나옵니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.chart import BarChart, Reference\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
        sheet.append([region, amount])\r
\r
    chart = BarChart()\r
    chart.title = "지역별 매출"\r
    chart.x_axis.title = "지역"\r
    chart.y_axis.title = "금액"\r
\r
    dataRef = Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=5)\r
    categoryRef = Reference(sheet, min_col=1, min_row=2, max_row=5)\r
    chart.add_data(dataRef, titles_from_data=True)\r
    chart.set_categories(categoryRef)\r
\r
    sheet.add_chart(chart, "D2")\r
    len(sheet._charts), chart.title\r
  exercise:\r
    prompt: chart.title을 "5월 매출"로, x_axis.title을 "Region"으로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.chart import BarChart, Reference\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
          sheet.append([region, amount])\r
\r
      chart = BarChart()\r
      chart.title = ___\r
      chart.x_axis.title = ___\r
      dataRef = Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=5)\r
      categoryRef = Reference(sheet, min_col=1, min_row=2, max_row=5)\r
      chart.add_data(dataRef, titles_from_data=True)\r
      chart.set_categories(categoryRef)\r
      sheet.add_chart(chart, "D2")\r
      chart.title, chart.x_axis.title\r
    hints:\r
    - chart.title과 x_axis.title은 문자열을 바로 받습니다. 내부에서 자동으로 RichText로 변환됩니다.\r
  check:\r
    noError: Reference 인자의 행/열 범위가 데이터와 일치해야 합니다.\r
    resultCheck: 차트의 title과 x_axis.title이 입력 문자열과 같아야 합니다.\r
- id: step2_line_chart\r
  title: 2단계. 선 차트\r
  structuredPrimary: true\r
  subtitle: LineChart + 시계열\r
  goal: 일자별 매출을 선 차트로 그려 추세를 보여 준다.\r
  why: 시간의 흐름은 선이 가장 자연스럽습니다. 막대로 그리면 점들 간의 연속성이 깨져 인지 부하가 큽니다.\r
  explanation: |-\r
    \`from openpyxl.chart import LineChart\`. 데이터/카테고리 설정은 BarChart와 같습니다. LineChart는 \`chart.style = 13\` 같은 미리 정의된 스타일 번호로 색을 통째로 바꿀 수 있어 빠르게 보기 좋게 만들 수 있습니다.\r
  tips:\r
  - chart.style은 1~48 사이 정수입니다. 차트 종류별로 의미가 다릅니다. 마음에 드는 번호를 한 번 정해 두면 자동 보고서 전체에서 통일감이 생깁니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.chart import LineChart, Reference\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "amount"])\r
    for day, amount in [("05-01", 120000), ("05-02", 80000), ("05-03", 95000), ("05-04", 130000), ("05-05", 110000)]:\r
        sheet.append([day, amount])\r
\r
    chart = LineChart()\r
    chart.title = "5월 매출 추세"\r
    chart.style = 13\r
    chart.x_axis.title = "날짜"\r
    chart.y_axis.title = "금액"\r
    chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=6), titles_from_data=True)\r
    chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=6))\r
    sheet.add_chart(chart, "D2")\r
    chart.style, chart.title\r
  exercise:\r
    prompt: 데이터를 하루 더 추가하고(예 "05-06", 95000), Reference의 max_row를 7로 늘려 차트가 6일 데이터를 모두 포함하도록 하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.chart import LineChart, Reference\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "amount"])\r
      data = [("05-01", 120000), ("05-02", 80000), ("05-03", 95000), ("05-04", 130000), ("05-05", 110000), ___]\r
      for day, amount in data:\r
          sheet.append([day, amount])\r
\r
      chart = LineChart()\r
      chart.title = "5월 매출 추세"\r
      chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=___), titles_from_data=True)\r
      chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=___))\r
      sheet.add_chart(chart, "D2")\r
      sheet.max_row\r
    hints:\r
    - "데이터 6개 + 헤더 1 = 7행. data Reference는 max_row=7, category는 max_row=7."\r
  check:\r
    noError: Reference의 max_row가 실제 데이터 행 범위 안에 있어야 합니다.\r
    resultCheck: sheet.max_row가 7이어야 합니다.\r
- id: step3_pie_chart\r
  title: 3단계. 파이 차트\r
  structuredPrimary: true\r
  subtitle: PieChart + 데이터 라벨\r
  goal: "전체에 대한 부분 비율을 파이로 보여 주고, 슬라이스에 퍼센트 라벨을 표시한다."\r
  why: 한 카테고리 안의 비율 구성을 보여주는 데는 파이가 직관적입니다. 단, 카테고리가 7개를 넘으면 파이는 가독성이 급격히 떨어집니다. 5개 이하 권장.\r
  explanation: |-\r
    \`PieChart\`도 BarChart와 같은 API입니다. 슬라이스에 퍼센트를 표시하려면 \`DataLabelList(showPercent=True)\`를 chart.dataLabels에 대입합니다.\r
  tips:\r
  - 파이 차트의 첫 슬라이스를 12시 방향에 두려면 chart.firstSliceAng=0(기본)을 유지하세요. 90을 주면 시계 방향으로 90도 회전합니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.chart import PieChart, Reference\r
    from openpyxl.chart.label import DataLabelList\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
        sheet.append([region, amount])\r
\r
    chart = PieChart()\r
    chart.title = "지역 매출 비중"\r
    chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=5), titles_from_data=True)\r
    chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=5))\r
    chart.dataLabels = DataLabelList(showPercent=True)\r
    sheet.add_chart(chart, "D2")\r
    chart.dataLabels.showPercent\r
  exercise:\r
    prompt: 카테고리 이름도 함께 보이도록 DataLabelList에 showCatName=True를 추가하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.chart import PieChart, Reference\r
      from openpyxl.chart.label import DataLabelList\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
          sheet.append([region, amount])\r
\r
      chart = PieChart()\r
      chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=5), titles_from_data=True)\r
      chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=5))\r
      chart.dataLabels = DataLabelList(showPercent=True, showCatName=___)\r
      sheet.add_chart(chart, "D2")\r
      chart.dataLabels.showPercent, chart.dataLabels.showCatName\r
    hints:\r
    - showCatName은 불리언입니다.\r
  check:\r
    noError: DataLabelList의 옵션 이름이 정확해야 합니다(camelCase 주의).\r
    resultCheck: 두 옵션 모두 True여야 합니다.\r
- id: step4_anchor_layout\r
  title: 4단계. 차트 위치와 크기\r
  structuredPrimary: true\r
  subtitle: anchor 셀과 width/height\r
  goal: 차트의 좌상단 좌표를 정확히 지정하고, 차트 크기도 cm 단위로 조정한다.\r
  why: 보고서의 표와 차트를 같이 보려면 차트 위치를 의도적으로 잡아야 합니다. 자동 배치는 항상 어딘가 어색합니다.\r
  explanation: |-\r
    \`ws.add_chart(chart, anchor)\`의 anchor는 차트 좌상단 셀 좌표 문자열입니다. chart.width와 chart.height는 cm 단위입니다(기본 약 15×7.5cm).\r
  tips:\r
  - 차트가 표를 가리면 anchor를 옆 컬럼으로 옮기거나 너비를 줄이세요. 자동 보고서 디버깅에서 가장 흔한 시각 이슈입니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.chart import BarChart, Reference\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000)]:\r
        sheet.append([region, amount])\r
\r
    chart = BarChart()\r
    chart.title = "지역 매출"\r
    chart.width = 20\r
    chart.height = 10\r
    chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=4), titles_from_data=True)\r
    chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=4))\r
    sheet.add_chart(chart, "E2")\r
    chart.width, chart.height\r
  exercise:\r
    prompt: 차트를 위에서 두 칸 아래(E4)로 옮기고 width를 25로 키우세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.chart import BarChart, Reference\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000)]:\r
          sheet.append([region, amount])\r
\r
      chart = BarChart()\r
      chart.title = "지역 매출"\r
      chart.width = ___\r
      chart.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=4), titles_from_data=True)\r
      chart.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=4))\r
      sheet.add_chart(chart, ___)\r
      chart.width\r
    hints:\r
    - anchor는 셀 좌표 문자열 그대로입니다 ("E4").\r
  check:\r
    noError: anchor 문자열은 유효한 셀 좌표여야 합니다.\r
    resultCheck: chart.width가 25여야 합니다.\r
- id: validation\r
  title: 5단계. 검증 루프 - 차트 보존 확인\r
  structuredPrimary: true\r
  subtitle: 저장 → 재오픈 → _charts 길이 비교\r
  goal: 차트를 추가한 보고서를 저장 후 다시 열어 차트가 보존되는지 자동으로 확인한다.\r
  why: 차트 객체는 시트 내부의 _charts 리스트에 들어 있습니다. 잘못된 Reference나 anchor를 쓰면 저장 시 묵음 실패할 수 있어 재오픈 검증이 안전합니다.\r
  explanation: |-\r
    \`buildSalesReport\`는 표 + 막대 차트 + 선 차트를 한 시트에 묶어 만듭니다. 다시 열어 차트 개수와 제목을 모두 확인합니다.\r
  tips:\r
  - "ws._charts는 private이지만 차트 보존 확인의 가장 직접적인 경로입니다. 길이와 각 차트의 title로 충분한 계약을 만들 수 있습니다."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.chart import BarChart, LineChart, Reference\r
\r
    def buildSalesReport(path, rows):\r
        book = Workbook()\r
        sheet = book.active\r
        sheet.title = "sales"\r
        sheet.append(["date", "amount"])\r
        for row in rows:\r
            sheet.append(list(row))\r
        endRow = len(rows) + 1\r
\r
        bar = BarChart()\r
        bar.title = "일자별 매출 (막대)"\r
        bar.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
        bar.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=endRow))\r
        sheet.add_chart(bar, "D2")\r
\r
        line = LineChart()\r
        line.title = "일자별 매출 (선)"\r
        line.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
        line.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=endRow))\r
        sheet.add_chart(line, "D20")\r
\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    salesPath = buildSalesReport(\r
        Path(workdir.name) / "sales.xlsx",\r
        [("05-01", 120000), ("05-02", 80000), ("05-03", 95000), ("05-04", 130000)],\r
    )\r
\r
    reopened = load_workbook(salesPath)\r
    sales = reopened["sales"]\r
    chartTitles = []\r
    for chart in sales._charts:\r
        chartTitles.append(chart.title.tx.rich.p[0].r[0].t)\r
    assert len(sales._charts) == 2\r
    assert "막대" in chartTitles[0]\r
    assert "선" in chartTitles[1]\r
    chartTitles\r
  exercise:\r
    prompt: PieChart를 하나 더 추가해 보고서에 차트 3개가 들어가도록 만들고 assert를 3으로 바꿔 보세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.chart import BarChart, LineChart, PieChart, Reference\r
\r
      def buildSalesReport(path, rows):\r
          book = Workbook()\r
          sheet = book.active\r
          sheet.title = "sales"\r
          sheet.append(["date", "amount"])\r
          for row in rows:\r
              sheet.append(list(row))\r
          endRow = len(rows) + 1\r
\r
          bar = BarChart()\r
          bar.title = "일자별 매출 (막대)"\r
          bar.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
          bar.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=endRow))\r
          sheet.add_chart(bar, "D2")\r
\r
          line = LineChart()\r
          line.title = "일자별 매출 (선)"\r
          line.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
          line.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=endRow))\r
          sheet.add_chart(line, "D20")\r
\r
          pie = PieChart()\r
          pie.title = "일자별 매출 (파이)"\r
          pie.add_data(Reference(sheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
          pie.set_categories(Reference(sheet, min_col=1, min_row=2, max_row=endRow))\r
          sheet.add_chart(pie, ___)\r
\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      salesPath = buildSalesReport(\r
          Path(workdir.name) / "sales.xlsx",\r
          [("05-01", 120000), ("05-02", 80000), ("05-03", 95000), ("05-04", 130000)],\r
      )\r
      reopened = load_workbook(salesPath)\r
      assert len(reopened["sales"]._charts) == ___\r
      len(reopened["sales"]._charts)\r
    hints:\r
    - "anchor 문자열은 비어 있지 않은 셀 좌표여야 합니다. 'D38' 같이 다른 차트 아래로 보내세요."\r
  check:\r
    noError: PieChart 영역이 BarChart와 같은 데이터를 정확한 Reference로 잡아야 합니다.\r
    resultCheck: _charts 길이가 3이어야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: BarChart·LineChart·PieChart를 두 가지 보고서 시나리오에 결합한다.\r
  why: 차트는 한 시트에 표·막대·선이 함께 들어갔을 때 비로소 보고서다워집니다.\r
  explanation: |-\r
    미션1은 주간 매출 데이터를 BarChart + LineChart 두 차트로 한 시트에 배치합니다. 미션2는 분기별 매출 비중을 PieChart로 만들고 카테고리 이름과 퍼센트 라벨을 함께 표시합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`week*\`(미션1), \`pie*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.chart import BarChart, LineChart, PieChart, Reference\r
    from openpyxl.chart.label import DataLabelList\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.chart import BarChart, LineChart, PieChart, Reference\r
      from openpyxl.chart.label import DataLabelList\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1은 같은 데이터에 두 차트 - anchor를 분리해 같은 시트에 배치.\r
    - 미션2 DataLabelList에 showPercent=True, showCatName=True.\r
  check:\r
    noError: Reference 영역이 데이터 범위와 일치해야 합니다.\r
    resultCheck: 재오픈 후 미션1은 _charts 길이 2, 미션2는 PieChart 1개 + 라벨 옵션 보존.\r
  blocks:\r
  - type: tip\r
    content: 두 차트를 같은 시트에 배치할 때는 anchor 셀을 충분히 떨어뜨려 둬야 시각적으로 겹치지 않습니다.\r
  - type: expansion\r
    title: "미션1: 주간 매출 - BarChart + LineChart 한 시트"\r
    blocks:\r
    - type: code\r
      title: 데이터 + 두 차트\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.chart import BarChart, LineChart, Reference\r
\r
        weekDir = TemporaryDirectory()\r
        weekPath = Path(weekDir.name) / "weekly.xlsx"\r
\r
        weekBook = Workbook()\r
        weekSheet = weekBook.active\r
        weekSheet.title = "weekly"\r
        weekSheet.append(["day", "amount"])\r
        weekRows = [("Mon", 120000), ("Tue", 95000), ("Wed", 130000), ("Thu", 110000), ("Fri", 140000)]\r
        for row in weekRows:\r
            weekSheet.append(list(row))\r
        endRow = len(weekRows) + 1\r
\r
        weekBar = BarChart()\r
        weekBar.title = "주간 매출 (막대)"\r
        weekBar.add_data(Reference(weekSheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
        weekBar.set_categories(Reference(weekSheet, min_col=1, min_row=2, max_row=endRow))\r
        weekSheet.add_chart(weekBar, "D2")\r
\r
        weekLine = LineChart()\r
        weekLine.title = "주간 매출 (선)"\r
        weekLine.add_data(Reference(weekSheet, min_col=2, min_row=1, max_col=2, max_row=endRow), titles_from_data=True)\r
        weekLine.set_categories(Reference(weekSheet, min_col=1, min_row=2, max_row=endRow))\r
        weekSheet.add_chart(weekLine, "D20")\r
        weekBook.save(weekPath)\r
        len(weekSheet._charts)\r
    - type: code\r
      title: 차트 보존 검증\r
      content: |-\r
        weekReopen = load_workbook(weekPath)\r
        weekBack = weekReopen["weekly"]\r
        assert len(weekBack._charts) == 2\r
        len(weekBack._charts)\r
  - type: expansion\r
    title: "미션2: 분기별 비중 PieChart + 카테고리/퍼센트 라벨"\r
    blocks:\r
    - type: code\r
      title: 파이 차트 생성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.chart import PieChart, Reference\r
        from openpyxl.chart.label import DataLabelList\r
\r
        pieDir = TemporaryDirectory()\r
        piePath = Path(pieDir.name) / "pie.xlsx"\r
\r
        pieBook = Workbook()\r
        pieSheet = pieBook.active\r
        pieSheet.title = "quarter"\r
        pieSheet.append(["quarter", "amount"])\r
        for quarter, amount in [("Q1", 12500000), ("Q2", 18200000), ("Q3", 14700000), ("Q4", 21000000)]:\r
            pieSheet.append([quarter, amount])\r
\r
        pieChart = PieChart()\r
        pieChart.title = "분기 매출 비중"\r
        pieChart.add_data(Reference(pieSheet, min_col=2, min_row=1, max_col=2, max_row=5), titles_from_data=True)\r
        pieChart.set_categories(Reference(pieSheet, min_col=1, min_row=2, max_row=5))\r
        pieChart.dataLabels = DataLabelList(showPercent=True, showCatName=True)\r
        pieSheet.add_chart(pieChart, "D2")\r
        pieBook.save(piePath)\r
        pieChart.dataLabels.showPercent, pieChart.dataLabels.showCatName\r
    - type: code\r
      title: 라벨 옵션 보존 검증\r
      content: |-\r
        pieReopen = load_workbook(piePath)\r
        pieBack = pieReopen["quarter"]\r
        assert len(pieBack._charts) == 1\r
        assert pieBack._charts[0].dataLabels.showPercent is True\r
        assert pieBack._charts[0].dataLabels.showCatName is True\r
        len(pieBack._charts), pieBack._charts[0].dataLabels.showPercent\r
- id: summary\r
  title: 정리\r
  subtitle: 차트는 표의 시각적 결론\r
  blocks:\r
  - type: text\r
    content: |-\r
      한 워크북 안에 표와 차트가 함께 있을 때 보고서는 완성됩니다. 데이터를 보는 시간이 줄고, 결론을 보는 시간이 늘어납니다. 다음 강의에서는 같은 보고서에 이미지와 하이퍼링크를 더해 양식을 완성합니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - "Reference(ws, min_col, min_row, max_col, max_row)로 데이터·카테고리 영역을 잡는다."\r
    - "titles_from_data=True로 첫 행을 시리즈 이름으로 자동 인식."\r
    - BarChart=카테고리 비교, LineChart=시간 흐름, PieChart=비율 구성.\r
    - DataLabelList(showPercent, showCatName)로 슬라이스 라벨 제어.\r
    - "ws.add_chart(chart, anchor) - anchor는 좌상단 셀 좌표 문자열."\r
`;export{e as default};