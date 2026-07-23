var e=`meta:\r
  id: word_04\r
  title: 표 만들기\r
  order: 4\r
  category: word\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - python-docx\r
  tags:\r
    - add_table\r
    - cell\r
    - merge_cells\r
  outcomes:\r
    - automation.word.tables\r
  prerequisites:\r
    - automation.word.paragraphs\r
  estimatedMinutes: 45\r
  seo:\r
    title: "Word 표 만들기 - add_table, cell, merge_cells"\r
    description: "보고서에 들어가는 비교표를 코드로 만든다. 셀 병합·헤더 강조 패턴 포함."\r
    keywords:\r
      - python-docx add_table\r
      - merge_cells\r
      - 보고서 표 자동화\r
\r
intro:\r
  direction: "보고서·계약서에 들어가는 비교표를 코드로 만든다. 셀 병합과 헤더 강조까지."\r
  benefits:\r
    - "직원 명단·결재라인·견적 항목 표 자동 생성 - 30분 손작업이 5초."\r
    - "table.cell(i, j).text 패턴으로 모든 셀 데이터를 깔끔히 채움."\r
    - "10강 회의록의 참석자·결정사항 표 패턴이 본 강의에서 정착."\r
  diagram:\r
    steps:\r
      - label: "1. add_table"\r
        detail: "doc.add_table(rows, cols, style)로 빈 표 생성."\r
      - label: "2. cell 채우기"\r
        detail: "table.cell(i, j).text = value 또는 cell의 paragraphs[0].add_run."\r
      - label: "3. merge_cells"\r
        detail: "cell1.merge(cell2)로 셀 병합."\r
    runtime:\r
      - label: "표준 스타일"\r
        detail: "'Table Grid' 스타일이 검은 선 적용된 표준 양식."\r
      - label: "검증"\r
        detail: "재오픈 후 table.rows[i].cells[j].text 단위 assert."\r
\r
sections:\r
  - id: step1_add_table\r
    title: "1단계. add_table로 표 만들기"\r
    structuredPrimary: true\r
    subtitle: "doc.add_table(rows, cols, style='Table Grid')"\r
    goal: "3×4 비교표를 만들고 모든 셀에 데이터를 채운다."\r
    why: "보고서의 가장 흔한 콘텐츠가 표입니다. add_table 한 줄로 시작."\r
    explanation: |-\r
      doc.add_table(rows=N, cols=M, style='Table Grid')로 검은 선이 있는 빈 표 생성. table.cell(i, j).text = value로 셀 채우기.\r
    tips:\r
      - "style 인자 없이 만들면 선이 보이지 않는 빈 표가 됩니다. 'Table Grid' 권장."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "table.docx"\r
\r
      doc = Document()\r
      tbl = doc.add_table(rows=3, cols=4, style="Table Grid")\r
\r
      headers = ["region", "q1", "q2", "q3"]\r
      for colIdx, value in enumerate(headers):\r
          tbl.cell(0, colIdx).text = value\r
\r
      rows = [["Seoul", "120", "135", "150"], ["Busan", "80", "78", "92"]]\r
      for rowIdx, rowData in enumerate(rows, start=1):\r
          for colIdx, value in enumerate(rowData):\r
              tbl.cell(rowIdx, colIdx).text = value\r
\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      tbl2 = reopened.tables[0]\r
      tbl2.cell(0, 0).text, tbl2.cell(1, 1).text\r
    exercise:\r
      prompt: "4행 표로 늘려 'Daegu, 60, 65, 70' 행을 추가하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "t.docx"\r
\r
        doc = Document()\r
        tbl = doc.add_table(rows=___, cols=4, style="Table Grid")\r
\r
        headers = ["region", "q1", "q2", "q3"]\r
        for colIdx, value in enumerate(headers):\r
            tbl.cell(0, colIdx).text = value\r
\r
        rows = [["Seoul", "120", "135", "150"], ["Busan", "80", "78", "92"], ["Daegu", "60", "65", "70"]]\r
        for rowIdx, rowData in enumerate(rows, start=1):\r
            for colIdx, value in enumerate(rowData):\r
                tbl.cell(rowIdx, colIdx).text = value\r
\r
        doc.save(docxPath)\r
        Document(docxPath).tables[0].cell(3, 0).text\r
      hints:\r
        - "정수 4."\r
    check:\r
      noError: "rows는 정수."\r
      resultCheck: "출력 'Daegu'."\r
\r
  - id: step2_merge\r
    title: "2단계. merge_cells로 셀 병합"\r
    structuredPrimary: true\r
    subtitle: "cell1.merge(cell2)"\r
    goal: "헤더 행에 두 컬럼을 병합한 부제목을 만든다."\r
    why: "한국 보고서의 결재라인 표는 거의 모두 헤더 병합 구조입니다. merge_cells가 필수입니다."\r
    explanation: |-\r
      cell1.merge(cell2)는 두 셀과 사이의 모든 셀을 병합. 결과 셀에 text 입력.\r
    tips:\r
      - "병합된 셀의 .text는 결과 셀에 적용. 병합 전 각 셀의 텍스트는 합쳐집니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "merged.docx"\r
\r
      doc = Document()\r
      tbl = doc.add_table(rows=3, cols=4, style="Table Grid")\r
\r
      # 상위 헤더: 두 셀 병합\r
      tbl.cell(0, 0).merge(tbl.cell(0, 1)).text = "지역 정보"\r
      tbl.cell(0, 2).merge(tbl.cell(0, 3)).text = "매출"\r
\r
      # 하위 헤더\r
      sub = ["region", "code", "q1", "q2"]\r
      for colIdx, value in enumerate(sub):\r
          tbl.cell(1, colIdx).text = value\r
\r
      # 데이터\r
      tbl.cell(2, 0).text = "Seoul"\r
      tbl.cell(2, 1).text = "S01"\r
      tbl.cell(2, 2).text = "120"\r
      tbl.cell(2, 3).text = "135"\r
\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      reopened.tables[0].cell(0, 0).text\r
    exercise:\r
      prompt: "tbl.cell(2, 0).merge(tbl.cell(2, 1))로 데이터 행도 병합하고 텍스트를 'Seoul S01'으로."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "m.docx"\r
\r
        doc = Document()\r
        tbl = doc.add_table(rows=3, cols=4, style="Table Grid")\r
        tbl.cell(0, 0).merge(tbl.cell(0, 1)).text = "지역 정보"\r
        tbl.cell(0, 2).merge(tbl.cell(0, 3)).text = "매출"\r
        for colIdx, value in enumerate(["region", "code", "q1", "q2"]):\r
            tbl.cell(1, colIdx).text = value\r
        tbl.cell(2, 0).merge(tbl.cell(2, 1)).text = ___\r
        tbl.cell(2, 2).text = "120"\r
        doc.save(docxPath)\r
        Document(docxPath).tables[0].cell(2, 0).text\r
      hints:\r
        - "문자열 'Seoul S01'."\r
    check:\r
      noError: "merge 후 .text 대입."\r
      resultCheck: "출력 'Seoul S01'."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 비교표 빌더"\r
    structuredPrimary: true\r
    subtitle: "buildComparisonTable + cell 검증"\r
    goal: "비교표 빌더 함수의 결과를 셀 단위로 한 번에 검증한다."\r
    why: "표는 데이터 정확성이 가장 중요합니다. 셀 단위 assert가 사고 사전 차단."\r
    explanation: |-\r
      buildComparisonTable(path, headers, rows)이 표를 만들고, 재오픈 후 모든 셀이 입력 데이터와 일치하는지 확인.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      def buildComparisonTable(path, headers, rows):\r
          doc = Document()\r
          tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers), style="Table Grid")\r
          for colIdx, header in enumerate(headers):\r
              tbl.cell(0, colIdx).text = header\r
          for rowIdx, rowData in enumerate(rows, start=1):\r
              for colIdx, value in enumerate(rowData):\r
                  tbl.cell(rowIdx, colIdx).text = str(value)\r
          doc.save(path)\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "v.docx"\r
      headers = ["region", "amount"]\r
      data = [["Seoul", 120000], ["Busan", 80000], ["Daegu", 60000]]\r
      buildComparisonTable(docxPath, headers, data)\r
\r
      reopened = Document(docxPath)\r
      tbl = reopened.tables[0]\r
      assert tbl.cell(0, 0).text == "region"\r
      assert tbl.cell(1, 0).text == "Seoul"\r
      assert tbl.cell(3, 1).text == "60000"\r
      tbl.cell(0, 0).text, tbl.cell(3, 0).text\r
    exercise:\r
      prompt: "buildComparisonTable 본체를 직접 작성하세요 - 헤더 행 + 데이터 행을 모두 채우는 add_table 흐름."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
\r
        def buildComparisonTable(path, headers, rows):\r
            doc = Document()\r
            tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers), style="Table Grid")\r
            for colIdx, header in enumerate(headers):\r
                ___  # tbl.cell(0, colIdx)에 header 텍스트\r
            for rowIdx, rowData in enumerate(rows, start=1):\r
                for colIdx, value in enumerate(rowData):\r
                    ___  # tbl.cell(rowIdx, colIdx)에 str(value)\r
            doc.save(path)\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "v.docx"\r
        data = [["Seoul", 120000], ["Busan", 80000], ["Daegu", 60000]]\r
        buildComparisonTable(docxPath, ["region", "amount"], data)\r
        tbl = Document(docxPath).tables[0]\r
        tbl.cell(0, 0).text, tbl.cell(3, 1).text\r
      hints:\r
        - "tbl.cell(0, colIdx).text = header"\r
        - "tbl.cell(rowIdx, colIdx).text = str(value)"\r
    check:\r
      noError: "헤더와 데이터 셀을 모두 채워야 함."\r
      resultCheck: "('region', '60000') 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "한국식 결재라인 표"\r
    goal: "담당·검토·승인 결재라인 표 함수를 만든다."\r
    why: "결재라인 표는 한국 보고서·기안서·품의서의 99%에 들어가는 표준 구성요소입니다. 담당·검토·승인 3컬럼이 손에 익으면 사내 양식 자동화의 절반이 끝납니다."\r
    explanation: |-\r
      미션: buildApprovalLine(doc, names) 함수. 'roles → names' 3컬럼 표.\r
    snippet: |-\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: buildApprovalLine(doc, approvers: dict) -> Table"\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "표의 헤더와 데이터가 정확히 매핑."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 결재라인 표"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
\r
              def buildApprovalLine(doc, approvers):\r
                  tbl = doc.add_table(rows=2, cols=len(approvers), style="Table Grid")\r
                  for colIdx, (role, name) in enumerate(approvers.items()):\r
                      tbl.cell(0, colIdx).text = role\r
                      tbl.cell(1, colIdx).text = name\r
                  return tbl\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "a.docx"\r
              doc = Document()\r
              buildApprovalLine(doc, {"담당": "김대리", "검토": "박과장", "승인": "이팀장"})\r
              doc.save(docxPath)\r
\r
              reopened = Document(docxPath)\r
              tbl = reopened.tables[0]\r
              assert tbl.cell(0, 0).text == "담당"\r
              assert tbl.cell(1, 2).text == "이팀장"\r
              [tbl.cell(0, i).text for i in range(3)], [tbl.cell(1, i).text for i in range(3)]\r
      - type: expansion\r
        title: "미션 2: 직원 명단 → N행 표 자동 생성"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
\r
              def buildEmployeeRoster(path, employees):\r
                  doc = Document()\r
                  headers = ["이름", "부서", "직급", "내선"]\r
                  tbl = doc.add_table(rows=len(employees) + 1, cols=len(headers), style="Table Grid")\r
                  for colIdx, header in enumerate(headers):\r
                      tbl.cell(0, colIdx).text = header\r
                  for rowIdx, emp in enumerate(employees, start=1):\r
                      tbl.cell(rowIdx, 0).text = emp["name"]\r
                      tbl.cell(rowIdx, 1).text = emp["team"]\r
                      tbl.cell(rowIdx, 2).text = emp["role"]\r
                      tbl.cell(rowIdx, 3).text = emp["ext"]\r
                  doc.save(path)\r
                  return tbl\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "roster.docx"\r
              employees = [\r
                  {"name": "김대리", "team": "기획", "role": "대리", "ext": "1201"},\r
                  {"name": "박과장", "team": "개발", "role": "과장", "ext": "1305"},\r
                  {"name": "이팀장", "team": "개발", "role": "팀장", "ext": "1306"},\r
              ]\r
              buildEmployeeRoster(docxPath, employees)\r
\r
              reopened = Document(docxPath)\r
              tbl = reopened.tables[0]\r
              assert len(tbl.rows) == 4\r
              assert tbl.cell(0, 2).text == "직급"\r
              assert tbl.cell(2, 3).text == "1305"\r
              [(tbl.cell(i, 0).text, tbl.cell(i, 3).text) for i in range(len(tbl.rows))]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "표 헤더 행에 배경색 (cell._tc XML 조작)"\r
          - "셀 안 텍스트를 run 단위로 굵게 (3강 패턴 결합)"\r
          - "행 자동 stripe (짝수 행 회색)"\r
          - "표 너비를 width 인자로 명시 (Inches(6))"\r
          - "직원 명단 dict 리스트 → N행 표 자동"\r
`;export{e as default};