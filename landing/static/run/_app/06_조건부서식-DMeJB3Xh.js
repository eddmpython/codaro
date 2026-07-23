var e=`meta:\r
  id: openpyxl_06\r
  title: 조건부 서식\r
  order: 6\r
  category: openpyxl\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - 조건부서식\r
  - ColorScale\r
  - DataBar\r
  - FormulaRule\r
  seo:\r
    title: openpyxl 조건부 서식 - ColorScale·DataBar·CellIs·FormulaRule\r
    description: KPI 신호등, 데이터바, 수식 기반 조건 강조까지 - openpyxl의 4가지 조건부 서식 규칙을 실무 보고서 패턴으로 정리합니다.\r
    keywords:\r
    - openpyxl 조건부서식\r
    - ColorScaleRule\r
    - DataBarRule\r
    - CellIsRule\r
    - FormulaRule\r
intro:\r
  direction: 셀 값에 따라 색을 자동으로 입히는 조건부 서식을 KPI 대시보드 관점에서 익힙니다. 사람이 표를 읽기 전에 색만으로 결론이 보이게 만듭니다.\r
  benefits:\r
  - ColorScaleRule로 값 분포에 따른 그라데이션 신호등을 만듭니다.\r
  - DataBarRule로 셀 안에 막대 그래프를 그려 비교 직관을 높입니다.\r
  - CellIsRule과 FormulaRule로 임계값/복합 조건 강조를 제어합니다.\r
  diagram:\r
    steps:\r
    - label: ColorScale\r
      detail: 값 분포 그라데이션. 빨강·노랑·초록 신호등.\r
    - label: DataBar\r
      detail: 셀 안 미니 막대로 상대 크기 비교.\r
    - label: CellIs\r
      detail: ">=, between 등 단순 비교."\r
    - label: Formula\r
      detail: 복합 조건. 다른 셀 값 비교까지.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: openpyxl.formatting.rule에서 ColorScaleRule/DataBarRule/CellIsRule/FormulaRule을 직접 import해 사용한다.\r
    - label: 규칙 보존 재오픈\r
      detail: 저장한 .xlsx를 load_workbook으로 다시 열어 _cf_rules의 영역 키가 보존됐는지 assert로 확인한다.\r
sections:\r
- id: step1_color_scale\r
  title: 1단계. ColorScaleRule\r
  structuredPrimary: true\r
  subtitle: 값 분포 → 색 그라데이션\r
  goal: 매출 금액에 따라 빨강·노랑·초록으로 변하는 신호등을 자동으로 적용한다.\r
  why: 이번 달 어느 지역이 잘 됐는가라는 질문은 색 그라데이션 한 번으로 즉답이 나옵니다. 표를 정렬하지 않아도 됩니다.\r
  explanation: |-\r
    \`from openpyxl.formatting.rule import ColorScaleRule\` 후, \`ws.conditional_formatting.add(range_string, rule)\`로 적용합니다. start/mid/end 세 지점에 값 기준(min/percentile/num)과 색을 줍니다. 3색 신호등은 빨강(낮음) → 노랑(중간) → 초록(높음)이 보편적입니다.\r
  tips:\r
  - "start_type='min'은 셀 영역 안의 최솟값을 기준으로 잡습니다. 데이터가 추가되면 자동으로 다시 계산되므로 보고서 자동화에 잘 맞습니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.formatting.rule import ColorScaleRule\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
        sheet.append([region, amount])\r
\r
    rule = ColorScaleRule(\r
        start_type="min", start_color="FFF8696B",\r
        mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
        end_type="max", end_color="FF63BE7B",\r
    )\r
    sheet.conditional_formatting.add("B2:B5", rule)\r
    list(sheet.conditional_formatting._cf_rules.keys())\r
  exercise:\r
    prompt: mid_value를 30으로 바꿔 노란색이 더 빨리 등장하도록 만들고, rule이 같은 영역에 적용됐는지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.formatting.rule import ColorScaleRule\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
          sheet.append([region, amount])\r
\r
      rule = ColorScaleRule(\r
          start_type="min", start_color="FFF8696B",\r
          mid_type="percentile", mid_value=___, mid_color="FFFFEB84",\r
          end_type="max", end_color="FF63BE7B",\r
      )\r
      sheet.conditional_formatting.add("B2:B5", rule)\r
      list(sheet.conditional_formatting._cf_rules.keys())\r
    hints:\r
    - mid_value는 0~100 사이 백분위입니다. 작을수록 노란색 지점이 낮은 값에 잡힙니다.\r
  check:\r
    noError: ColorScaleRule의 세 type/color 인자가 모두 적절히 전달되어야 합니다.\r
    resultCheck: 결과 키 리스트에 "B2:B5" 영역이 포함되어야 합니다.\r
- id: step2_data_bar\r
  title: 2단계. DataBarRule\r
  structuredPrimary: true\r
  subtitle: 셀 안 막대 그래프\r
  goal: 금액 값에 비례한 셀 내부 막대를 자동으로 그려 한눈에 상대 크기를 비교한다.\r
  why: ColorScale은 색으로, DataBar는 길이로 크기를 알려 줍니다. 두 표현은 보완 관계입니다.\r
  explanation: |-\r
    \`DataBarRule(start_type="min", end_type="max", color="FF638EC6", showValue=True)\`. showValue=False를 주면 값을 가리고 막대만 보입니다. 마찬가지로 영역에 add합니다.\r
  tips:\r
  - "두 규칙을 같은 영역에 동시에 적용하면 색은 ColorScale, 막대는 DataBar로 둘 다 나타납니다. 단, 시각적 과잉이 될 수 있으니 신중하게 쓰세요."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.formatting.rule import DataBarRule\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
        sheet.append([region, amount])\r
\r
    rule = DataBarRule(\r
        start_type="min", end_type="max",\r
        color="FF638EC6", showValue=True,\r
    )\r
    sheet.conditional_formatting.add("B2:B5", rule)\r
    "B2:B5" in sheet.conditional_formatting._cf_rules\r
  exercise:\r
    prompt: showValue를 False로 바꿔 값이 가려진 막대만 나오게 하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.formatting.rule import DataBarRule\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
          sheet.append([region, amount])\r
\r
      rule = DataBarRule(\r
          start_type="min", end_type="max",\r
          color="FF638EC6", showValue=___,\r
      )\r
      sheet.conditional_formatting.add("B2:B5", rule)\r
      rule.showValue\r
    hints:\r
    - showValue는 불리언입니다. True/False 둘 중 하나입니다.\r
  check:\r
    noError: DataBarRule 인자 이름이 정확해야 합니다.\r
    resultCheck: rule.showValue가 False여야 합니다.\r
- id: step3_cell_is\r
  title: 3단계. CellIsRule\r
  structuredPrimary: true\r
  subtitle: 임계값 기반 강조\r
  goal: "특정 임계값을 넘는 셀에 즉시 빨강 배경을 입힌다."\r
  why: 일정 금액 이상 주문 같은 비즈니스 임계값은 색으로 강조해야 실무자가 즉시 보고 행동합니다.\r
  explanation: |-\r
    \`from openpyxl.formatting.rule import CellIsRule\`, \`from openpyxl.styles import PatternFill\`. \`CellIsRule(operator="greaterThanOrEqual", formula=["100000"], fill=PatternFill(start_color="FFF8696B", end_color="FFF8696B", fill_type="solid"))\`. operator는 lessThan, between, equal, notEqual 등 Excel의 비교 연산자 영문명을 그대로 사용합니다.\r
  tips:\r
  - "formula는 리스트입니다. between은 두 값이 필요하므로 formula=['50000','100000'] 처럼 두 개를 줍니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.formatting.rule import CellIsRule\r
    from openpyxl.styles import PatternFill\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount"])\r
    for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
        sheet.append([region, amount])\r
\r
    redFill = PatternFill(start_color="FFF8696B", end_color="FFF8696B", fill_type="solid")\r
    rule = CellIsRule(operator="greaterThanOrEqual", formula=["100000"], fill=redFill)\r
    sheet.conditional_formatting.add("B2:B5", rule)\r
    rule.operator, rule.formula\r
  exercise:\r
    prompt: between 연산자로 50000~99999 사이만 노란색으로 강조하는 규칙을 추가하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.formatting.rule import CellIsRule\r
      from openpyxl.styles import PatternFill\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount"])\r
      for region, amount in [("Seoul", 120000), ("Busan", 80000), ("Daegu", 30000), ("Incheon", 65000)]:\r
          sheet.append([region, amount])\r
\r
      yellowFill = PatternFill(start_color="FFFFEB84", end_color="FFFFEB84", fill_type="solid")\r
      rule = CellIsRule(operator=___, formula=___, fill=yellowFill)\r
      sheet.conditional_formatting.add("B2:B5", rule)\r
      rule.operator, rule.formula\r
    hints:\r
    - between은 ["50000","99999"] 두 값 리스트입니다.\r
  check:\r
    noError: operator는 Excel 비교 키워드 영문 이름이어야 합니다.\r
    resultCheck: rule.operator가 "between"이고 formula가 두 요소 리스트여야 합니다.\r
- id: step4_formula_rule\r
  title: 4단계. FormulaRule\r
  structuredPrimary: true\r
  subtitle: 복합 조건 + 다른 셀 비교\r
  goal: 다른 컬럼 값에 따라 같은 행 전체에 색을 입히는 행 단위 강조를 만든다.\r
  why: 환불 발생 행 전체를 분홍색으로 칠하는 패턴은 CellIs로는 어렵습니다. 수식 기반이 필요합니다.\r
  explanation: |-\r
    \`FormulaRule(formula=["$C2=\\"refund\\""], fill=...)\`. 영역(\`A2:C5\`)에 적용하면 각 행에서 같은 수식이 행 번호만 바뀌어 평가됩니다. 절대 컬럼($C)·상대 행(2)으로 적어야 같은 행의 C 값을 보는 동작이 됩니다.\r
  tips:\r
  - "$ 위치가 핵심입니다. $C2는 'C 컬럼은 고정, 행은 평가 위치에 따라'. C$2는 반대입니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.formatting.rule import FormulaRule\r
    from openpyxl.styles import PatternFill\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["region", "amount", "status"])\r
    sheet.append(["Seoul", 120000, "ok"])\r
    sheet.append(["Busan", 80000, "refund"])\r
    sheet.append(["Daegu", 30000, "ok"])\r
\r
    pinkFill = PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid")\r
    rule = FormulaRule(formula=["$C2=\\"refund\\""], fill=pinkFill)\r
    sheet.conditional_formatting.add("A2:C4", rule)\r
    rule.formula\r
  exercise:\r
    prompt: 환불이면서 금액이 50000 이상인 행만 강조하도록 AND를 추가한 수식으로 바꾸세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.formatting.rule import FormulaRule\r
      from openpyxl.styles import PatternFill\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["region", "amount", "status"])\r
      sheet.append(["Seoul", 120000, "ok"])\r
      sheet.append(["Busan", 80000, "refund"])\r
      sheet.append(["Daegu", 30000, "ok"])\r
\r
      pinkFill = PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid")\r
      rule = FormulaRule(formula=[___], fill=pinkFill)\r
      sheet.conditional_formatting.add("A2:C4", rule)\r
      rule.formula\r
    hints:\r
    - "Excel 수식: AND($C2=\\"refund\\", $B2>=50000)"\r
  check:\r
    noError: 수식 문자열의 따옴표가 짝을 맞춰야 합니다.\r
    resultCheck: rule.formula에 AND가 포함되어야 합니다.\r
- id: validation\r
  title: 5단계. 검증 루프 - KPI 대시보드 계약\r
  structuredPrimary: true\r
  subtitle: 저장 → 재오픈 → 규칙 보존 확인\r
  goal: 조건부 서식 규칙이 저장 후 다시 열어도 보존되는지 확인한다.\r
  why: 조건부 서식은 XML 구조 안에서 따로 저장됩니다. 잘못된 영역 문자열이나 규칙 객체를 쓰면 저장 후 사라질 수 있어 재오픈 검증이 필수입니다.\r
  explanation: |-\r
    \`buildKpiDashboard\`는 매출 + 신호등 + 환불 행 강조까지 묶은 KPI 대시보드를 만듭니다. 저장 후 다시 열어 규칙이 적용된 영역 키가 그대로 있는지 확인합니다.\r
  tips:\r
  - "조건부 서식 규칙 객체는 _cf_rules dict에 영역 문자열을 키로 저장됩니다. private 속성이지만 검증 용도로는 가장 직접적입니다."\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.formatting.rule import ColorScaleRule, FormulaRule\r
    from openpyxl.styles import PatternFill\r
\r
    def buildKpiDashboard(path, rows):\r
        book = Workbook()\r
        sheet = book.active\r
        sheet.title = "kpi"\r
        sheet.append(["region", "amount", "status"])\r
        for row in rows:\r
            sheet.append(list(row))\r
        endRow = len(rows) + 1\r
\r
        sheet.conditional_formatting.add(\r
            f"B2:B{endRow}",\r
            ColorScaleRule(\r
                start_type="min", start_color="FFF8696B",\r
                mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
                end_type="max", end_color="FF63BE7B",\r
            ),\r
        )\r
        sheet.conditional_formatting.add(\r
            f"A2:C{endRow}",\r
            FormulaRule(\r
                formula=["$C2=\\"refund\\""],\r
                fill=PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid"),\r
            ),\r
        )\r
        book.save(path)\r
        return path, endRow\r
\r
    workdir = TemporaryDirectory()\r
    samples = [\r
        ("Seoul", 120000, "ok"),\r
        ("Busan", 80000, "refund"),\r
        ("Daegu", 30000, "ok"),\r
        ("Incheon", 65000, "ok"),\r
    ]\r
    dashboardPath, endRow = buildKpiDashboard(\r
        Path(workdir.name) / "kpi.xlsx", samples\r
    )\r
\r
    reopened = load_workbook(dashboardPath)\r
    ruleKeys = list(reopened["kpi"].conditional_formatting._cf_rules.keys())\r
    ranges = [str(key.sqref) for key in ruleKeys]\r
    assert f"B2:B{endRow}" in ranges\r
    assert f"A2:C{endRow}" in ranges\r
    ranges\r
  exercise:\r
    prompt: samples에 ("Daejeon", 95000, "ok") 한 줄을 추가하면 endRow가 6이 되고 두 규칙 영역도 같이 늘어나는지 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.formatting.rule import ColorScaleRule, FormulaRule\r
      from openpyxl.styles import PatternFill\r
\r
      def buildKpiDashboard(path, rows):\r
          book = Workbook()\r
          sheet = book.active\r
          sheet.title = "kpi"\r
          sheet.append(["region", "amount", "status"])\r
          for row in rows:\r
              sheet.append(list(row))\r
          endRow = len(rows) + 1\r
          sheet.conditional_formatting.add(\r
              f"B2:B{endRow}",\r
              ColorScaleRule(\r
                  start_type="min", start_color="FFF8696B",\r
                  mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
                  end_type="max", end_color="FF63BE7B",\r
              ),\r
          )\r
          sheet.conditional_formatting.add(\r
              f"A2:C{endRow}",\r
              FormulaRule(\r
                  formula=["$C2=\\"refund\\""],\r
                  fill=PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid"),\r
              ),\r
          )\r
          book.save(path)\r
          return path, endRow\r
\r
      workdir = TemporaryDirectory()\r
      samples = [\r
          ("Seoul", 120000, "ok"),\r
          ("Busan", 80000, "refund"),\r
          ("Daegu", 30000, "ok"),\r
          ("Incheon", 65000, "ok"),\r
          ___,\r
      ]\r
      dashboardPath, endRow = buildKpiDashboard(Path(workdir.name) / "kpi.xlsx", samples)\r
      assert endRow == ___\r
      endRow\r
    hints:\r
    - 행 5 + 헤더 1 = endRow 6입니다.\r
  check:\r
    noError: buildKpiDashboard가 ValueError 없이 끝나야 합니다.\r
    resultCheck: endRow가 추가된 행 수에 맞게 6이어야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: ColorScale·CellIs·FormulaRule을 두 가지 현실 시나리오에 결합한다.\r
  why: 조건부 서식은 데이터 분포에 따라 색이 어떻게 도와주는지 직접 만들어 봐야 감각이 잡힙니다.\r
  explanation: |-\r
    미션1은 시험 점수 표에 ColorScale 신호등과 60점 미만 빨강 강조를 함께 적용합니다. 미션2는 예산 vs 실제 표에서 초과한 행 전체를 FormulaRule로 분홍색 강조합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`exam*\`(미션1), \`budget*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.formatting.rule import CellIsRule, ColorScaleRule, FormulaRule\r
    from openpyxl.styles import PatternFill\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.formatting.rule import CellIsRule, ColorScaleRule, FormulaRule\r
      from openpyxl.styles import PatternFill\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1 ColorScale은 점수 영역만, CellIs는 같은 영역에 lessThan 60.\r
    - 미션2 FormulaRule은 $C2>$B2(실제 > 예산) 같은 절대-상대 혼합 참조.\r
  check:\r
    noError: 조건부 서식 영역 문자열이 유효해야 합니다.\r
    resultCheck: 재오픈 후 두 규칙이 _cf_rules에 보존되어 있어야 합니다.\r
  blocks:\r
  - type: tip\r
    content: ColorScale과 CellIs를 같은 영역에 함께 적용해 색과 강조를 동시에 줄 수 있습니다.\r
  - type: expansion\r
    title: "미션1: 시험 점수 - ColorScale + 60점 미만 빨강"\r
    blocks:\r
    - type: code\r
      title: 점수표와 두 규칙 적용\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.formatting.rule import CellIsRule, ColorScaleRule\r
        from openpyxl.styles import PatternFill\r
\r
        examDir = TemporaryDirectory()\r
        examPath = Path(examDir.name) / "exam.xlsx"\r
\r
        examBook = Workbook()\r
        examSheet = examBook.active\r
        examSheet.title = "scores"\r
        examSheet.append(["student", "score"])\r
        examRows = [("Alice", 92), ("Bob", 55), ("Carol", 78), ("Dan", 45), ("Eve", 88)]\r
        for row in examRows:\r
            examSheet.append(list(row))\r
\r
        examSheet.conditional_formatting.add(\r
            "B2:B6",\r
            ColorScaleRule(\r
                start_type="min", start_color="FFF8696B",\r
                mid_type="percentile", mid_value=50, mid_color="FFFFEB84",\r
                end_type="max", end_color="FF63BE7B",\r
            ),\r
        )\r
        examRed = PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid")\r
        examSheet.conditional_formatting.add(\r
            "B2:B6",\r
            CellIsRule(operator="lessThan", formula=["60"], fill=examRed),\r
        )\r
        examBook.save(examPath)\r
        list(examSheet.conditional_formatting._cf_rules.keys())\r
    - type: code\r
      title: 규칙 보존 검증\r
      content: |-\r
        examReopen = load_workbook(examPath)\r
        examBack = examReopen["scores"]\r
        examRanges = [str(key.sqref) for key in examBack.conditional_formatting._cf_rules.keys()]\r
        assert "B2:B6" in examRanges\r
        examRanges\r
  - type: expansion\r
    title: "미션2: 예산 vs 실제 - FormulaRule로 초과 행 강조"\r
    blocks:\r
    - type: code\r
      title: 예산 표 + FormulaRule 적용\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.formatting.rule import FormulaRule\r
        from openpyxl.styles import PatternFill\r
\r
        budgetDir = TemporaryDirectory()\r
        budgetPath = Path(budgetDir.name) / "budget.xlsx"\r
\r
        budgetBook = Workbook()\r
        budgetSheet = budgetBook.active\r
        budgetSheet.title = "budget"\r
        budgetSheet.append(["item", "budget", "actual"])\r
        budgetRows = [\r
            ("Marketing", 5000000, 4800000),\r
            ("RnD", 8000000, 9200000),\r
            ("Ops", 3000000, 2900000),\r
            ("Travel", 1500000, 1800000),\r
        ]\r
        for row in budgetRows:\r
            budgetSheet.append(list(row))\r
\r
        budgetPink = PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid")\r
        budgetSheet.conditional_formatting.add(\r
            "A2:C5",\r
            FormulaRule(formula=["$C2>$B2"], fill=budgetPink),\r
        )\r
        budgetBook.save(budgetPath)\r
        list(budgetSheet.conditional_formatting._cf_rules.keys())\r
    - type: code\r
      title: 규칙 보존 검증\r
      content: |-\r
        budgetReopen = load_workbook(budgetPath)\r
        budgetBack = budgetReopen["budget"]\r
        budgetRanges = [str(key.sqref) for key in budgetBack.conditional_formatting._cf_rules.keys()]\r
        assert "A2:C5" in budgetRanges\r
        rule = list(budgetBack.conditional_formatting._cf_rules.values())[0][0]\r
        assert "$C2>$B2" in rule.formula[0]\r
        budgetRanges\r
- id: summary\r
  title: 정리\r
  subtitle: 색이 데이터를 말한다\r
  blocks:\r
  - type: text\r
    content: |-\r
      조건부 서식은 사람의 눈이 표를 읽기 전에 결론을 미리 그려 주는 도구입니다. ColorScale은 분포, DataBar는 상대 크기, CellIs는 임계값, FormulaRule은 복합 조건 - 네 가지를 상황에 맞게 골라 쓰세요.\r
  - type: list\r
    style: bullet\r
    items:\r
    - ColorScaleRule - 분포 기반 신호등(3색이 표준)\r
    - DataBarRule - 셀 안 막대 그래프\r
    - CellIsRule - operator + formula 리스트로 임계값 강조\r
    - FormulaRule - 다른 셀을 보는 복합 조건, $ 위치가 핵심\r
    - 조건부 서식은 _cf_rules에 영역 문자열 키로 저장되므로 재오픈 검증이 가능\r
`;export{e as default};