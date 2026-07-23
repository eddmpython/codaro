var e=`meta:\r
  id: pdf_04\r
  title: PDF 표 추출\r
  order: 4\r
  category: pdf\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - pdfplumber\r
    - pandas\r
    - reportlab\r
  tags:\r
    - extract_tables\r
    - pdfplumber\r
    - pandas\r
    - 통계 PDF\r
  outcomes:\r
    - automation.pdf.extract\r
  prerequisites:\r
    - automation.pdf.extract\r
    - pandas.intro\r
  estimatedMinutes: 55\r
  seo:\r
    title: "PDF 표를 코드로 추출 - pdfplumber + pandas"\r
    description: "국세청·통계청 PDF의 표를 pdfplumber로 뽑아 pandas DataFrame과 CSV로 정리한다. 선 없는 표·병합 셀 한계와 해결법을 함께 다룬다."\r
    keywords:\r
      - pdfplumber extract_tables\r
      - PDF 표 추출\r
      - 정부 통계 PDF\r
      - PDF to CSV\r
\r
intro:\r
  direction: "정부 통계·세금계산서·금융 보고서의 표를 코드로 뽑아 DataFrame과 CSV로 변환한다. 90분 손작업이 10초로 줄어드는 흐름이다."\r
  benefits:\r
    - "HR 윤대리의 PDF 표 → 엑셀 옮기기 작업 90분을 10초로 줄인다."\r
    - "extract_tables의 기본·튜닝 옵션과 한계를 모두 다뤄 본인 PDF에 맞는 전략을 결정한다."\r
    - "추출 결과가 그대로 pandas DataFrame이 되어 openpyxl 트랙·통계 트랙의 입력으로 직결된다."\r
  diagram:\r
    steps:\r
      - label: "1. 표 PDF 만들기"\r
        detail: "reportlab Platypus Table로 선 있는 표 PDF를 즉석 생성."\r
      - label: "2. extract_tables 기본"\r
        detail: "pdfplumber.open으로 표를 추출해 리스트 of 리스트로 확인."\r
      - label: "3. DataFrame과 CSV"\r
        detail: "추출 결과를 pandas DataFrame으로 만들고 CSV로 저장."\r
      - label: "4. 튜닝과 한계"\r
        detail: "선 없는 표는 table_settings로, 병합 셀과 줄바꿈은 후처리로 다룬다."\r
    runtime:\r
      - label: "Platypus로 샘플 표"\r
        detail: "07강에서 다룰 Platypus Table을 본 강의에서 미리 활용해 표 있는 PDF를 만듦."\r
      - label: "DataFrame 검증"\r
        detail: "shape, columns, dtypes 단위로 assert. CSV 재오픈으로 round-trip 확인."\r
\r
sections:\r
  - id: step1_make_table_pdf\r
    title: "1단계. 표가 들어간 PDF 만들기"\r
    structuredPrimary: true\r
    subtitle: "reportlab Platypus Table"\r
    goal: "선이 있는 3×4 표가 들어간 한 페이지 PDF를 만든다."\r
    why: "국세청 부가세 신고서·통계청 분기 통계·금융감독원 공시는 모두 표 중심 PDF입니다. 추출 실험을 하려면 같은 모양의 표 PDF가 먼저 있어야 하고, 외부 다운로드 의존을 없애기 위해 reportlab Platypus Table로 즉석 만듭니다. 같은 패턴이 07강의 보고서 양식과 10강의 청구서 명세표에서 그대로 재사용됩니다."\r
    explanation: |-\r
      Platypus의 Table은 list-of-lists를 받아 표를 그립니다. TableStyle로 선과 헤더 굵기를 지정합니다. SimpleDocTemplate.build로 표가 들어간 PDF를 한 번에 저장합니다.\r
    tips:\r
      - "Platypus Table은 콘텐츠 분량이 페이지를 넘으면 자동으로 다음 페이지로 잘립니다. 본 강의는 한 페이지 안에 들어가게 작게 만듭니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      def buildTablePdf(path):\r
          rows = [\r
              ["region", "q1", "q2", "q3"],\r
              ["Seoul", "120", "135", "150"],\r
              ["Busan", "80", "78", "92"],\r
              ["Daegu", "60", "65", "70"],\r
          ]\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          tbl = Table(rows)\r
          tbl.setStyle(TableStyle([\r
              ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
              ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),\r
          ]))\r
          doc.build([tbl])\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "table.pdf"\r
      buildTablePdf(pdfPath)\r
      pdfPath.stat().st_size > 0\r
    exercise:\r
      prompt: "표 행을 5개로 늘리고(Incheon, Daejeon 추가) PDF 크기가 양수인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        def buildTablePdf(path):\r
            rows = [\r
                ["region", "q1", "q2", "q3"],\r
                ["Seoul", "120", "135", "150"],\r
                ["Busan", "80", "78", "92"],\r
                ["Daegu", "60", "65", "70"],\r
                [___, "55", "60", "62"],\r
                [___, "50", "52", "58"],\r
            ]\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            tbl = Table(rows)\r
            tbl.setStyle(TableStyle([\r
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
            ]))\r
            doc.build([tbl])\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "t.pdf"\r
        buildTablePdf(pdfPath)\r
        pdfPath.stat().st_size > 0\r
      hints:\r
        - "도시 이름 문자열 두 개 추가."\r
    check:\r
      noError: "리스트 행 길이가 모두 같아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_extract_basic\r
    title: "2단계. extract_tables 기본"\r
    structuredPrimary: true\r
    subtitle: "pdfplumber.open + page.extract_tables()"\r
    goal: "1단계의 표 PDF를 추출해 리스트 of 리스트로 확인한다."\r
    why: "추출 결과의 구조를 먼저 봐야 후처리 전략이 보입니다. raw 결과가 어떤 모양인지 손에 익히는 게 본 단계의 목적입니다."\r
    explanation: |-\r
      pdfplumber.open(path)를 with로 열고 page.extract_tables()를 호출하면 [[row, row, ...]] 형태의 리스트 of 리스트가 나옵니다. 단일 표 PDF는 첫 원소를 쓰면 됩니다.\r
    tips:\r
      - "extract_tables 결과는 모두 문자열입니다. 숫자 변환은 후처리 단계에서 따로 해야 합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pdfplumber\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      def buildTablePdf(path):\r
          rows = [\r
              ["region", "q1", "q2", "q3"],\r
              ["Seoul", "120", "135", "150"],\r
              ["Busan", "80", "78", "92"],\r
          ]\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          tbl = Table(rows)\r
          tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
          doc.build([tbl])\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "t.pdf"\r
      buildTablePdf(pdfPath)\r
\r
      with pdfplumber.open(pdfPath) as doc:\r
          tables = doc.pages[0].extract_tables()\r
      len(tables), len(tables[0]), len(tables[0][0])\r
    exercise:\r
      prompt: "extract_tables의 첫 표에서 두 번째 행의 첫 컬럼이 'Seoul'인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pdfplumber\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        def buildTablePdf(path):\r
            rows = [\r
                ["region", "q1", "q2", "q3"],\r
                ["Seoul", "120", "135", "150"],\r
                ["Busan", "80", "78", "92"],\r
            ]\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            tbl = Table(rows)\r
            tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
            doc.build([tbl])\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "t.pdf"\r
        buildTablePdf(pdfPath)\r
\r
        with pdfplumber.open(pdfPath) as doc:\r
            tables = doc.pages[0].extract_tables()\r
        tables[0][___][___] == "Seoul"\r
      hints:\r
        - "두 번째 행은 index 1, 첫 컬럼은 index 0."\r
    check:\r
      noError: "with 블록 안에서 결과를 변수에 저장한 후 밖에서 사용해야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_to_dataframe\r
    title: "3단계. DataFrame과 CSV"\r
    structuredPrimary: true\r
    subtitle: "pandas.DataFrame + to_csv"\r
    goal: "추출한 표를 pandas DataFrame으로 만들고 CSV로 저장한 뒤 다시 읽어 확인한다."\r
    why: "추출의 진짜 가치는 DataFrame이나 CSV로 다른 도구로 넘기는 데 있습니다. pandas로 변환되는 순간 분석·시각화·openpyxl로 연결됩니다."\r
    explanation: |-\r
      tables[0]의 첫 행을 컬럼명으로, 나머지를 데이터로 사용해 DataFrame을 만듭니다. to_csv로 임시 폴더에 저장하고 pd.read_csv로 다시 읽어 행 수가 보존되는지 확인합니다.\r
    tips:\r
      - "to_csv에 index=False를 주지 않으면 자동 인덱스가 컬럼으로 들어갑니다. 표 데이터는 보통 index=False가 안전합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      import pdfplumber\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      def buildTablePdf(path):\r
          rows = [\r
              ["region", "q1", "q2", "q3"],\r
              ["Seoul", "120", "135", "150"],\r
              ["Busan", "80", "78", "92"],\r
              ["Daegu", "60", "65", "70"],\r
          ]\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          tbl = Table(rows)\r
          tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
          doc.build([tbl])\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      pdfPath = base / "t.pdf"\r
      csvPath = base / "t.csv"\r
      buildTablePdf(pdfPath)\r
\r
      with pdfplumber.open(pdfPath) as doc:\r
          rawTable = doc.pages[0].extract_tables()[0]\r
      df = pd.DataFrame(rawTable[1:], columns=rawTable[0])\r
      df.to_csv(csvPath, index=False)\r
      reloaded = pd.read_csv(csvPath)\r
      df.shape, reloaded.shape\r
    exercise:\r
      prompt: "df의 'q1' 컬럼을 정수로 변환한 뒤 합계를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        import pdfplumber\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        def buildTablePdf(path):\r
            rows = [\r
                ["region", "q1", "q2", "q3"],\r
                ["Seoul", "120", "135", "150"],\r
                ["Busan", "80", "78", "92"],\r
                ["Daegu", "60", "65", "70"],\r
            ]\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            tbl = Table(rows)\r
            tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
            doc.build([tbl])\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "t.pdf"\r
        buildTablePdf(pdfPath)\r
\r
        with pdfplumber.open(pdfPath) as doc:\r
            rawTable = doc.pages[0].extract_tables()[0]\r
        df = pd.DataFrame(rawTable[1:], columns=rawTable[0])\r
        df["q1"] = df["q1"].astype(___)\r
        df["q1"].sum()\r
      hints:\r
        - "정수 타입은 int."\r
    check:\r
      noError: "astype 인자는 type 이름."\r
      resultCheck: "출력이 260이어야 합니다."\r
\r
  - id: step4_tuning_limits\r
    title: "4단계. 튜닝과 한계"\r
    structuredPrimary: true\r
    subtitle: "table_settings로 선 없는 표 처리"\r
    goal: "선이 없는 표는 vertical_strategy='text'로, 병합 셀은 후처리로 다룬다."\r
    why: "한국 정부 PDF의 표 대부분은 선 없는 텍스트 정렬 기반입니다. 기본 옵션으로는 잡히지 않고 table_settings 튜닝이 필요합니다."\r
    explanation: |-\r
      pdfplumber.Page.extract_tables(table_settings={'vertical_strategy': 'text', 'horizontal_strategy': 'text'})는 선이 아니라 텍스트 위치를 기준으로 표를 잡습니다. 완벽하지 않지만 선이 없는 PDF에 첫 시도로 적합합니다. 결과가 어긋날 때는 손이 더 빠른 케이스도 인정합니다.\r
    tips:\r
      - "튜닝 옵션이 무력한 PDF도 있습니다. 그런 경우 PDF를 텍스트로 추출한 뒤 정규식으로 표 형태를 복원하는 게 더 빠를 수 있습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pdfplumber\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildTextTablePdf(path):\r
          canvas = Canvas(str(path))\r
          canvas.setFont("Helvetica", 11)\r
          rows = [\r
              ["region", "q1", "q2", "q3"],\r
              ["Seoul", "120", "135", "150"],\r
              ["Busan", "80", "78", "92"],\r
          ]\r
          yPos = 750\r
          for row in rows:\r
              for colIdx, value in enumerate(row):\r
                  canvas.drawString(72 + colIdx * 80, yPos, value)\r
              yPos -= 20\r
          canvas.showPage()\r
          canvas.save()\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "txt_table.pdf"\r
      buildTextTablePdf(pdfPath)\r
\r
      with pdfplumber.open(pdfPath) as doc:\r
          textTables = doc.pages[0].extract_tables(table_settings={\r
              "vertical_strategy": "text",\r
              "horizontal_strategy": "text",\r
          })\r
      textTables[0][0] if textTables else None\r
    exercise:\r
      prompt: "extractTextTable(path) 함수를 직접 작성하세요. 선이 없는 표 PDF에서 vertical/horizontal strategy를 'text'로 두고 첫 표를 추출해 돌려주거나, 표가 없으면 빈 리스트를 돌려줘야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pdfplumber\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildTextTablePdf(path):\r
            canvas = Canvas(str(path))\r
            canvas.setFont("Helvetica", 11)\r
            rows = [\r
                ["region", "q1", "q2", "q3"],\r
                ["Seoul", "120", "135", "150"],\r
                ["Busan", "80", "78", "92"],\r
            ]\r
            yPos = 750\r
            for row in rows:\r
                for colIdx, value in enumerate(row):\r
                    canvas.drawString(72 + colIdx * 80, yPos, value)\r
                yPos -= 20\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def extractTextTable(path):\r
            ___  # pdfplumber.open(path) with 블록 안에서 strategy 두 값 모두 'text'로 extract_tables 호출, 첫 표 또는 [] 반환\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "txt_table.pdf"\r
        buildTextTablePdf(pdfPath)\r
        table = extractTextTable(pdfPath)\r
        assert table and table[0]\r
        table[0]\r
      hints:\r
        - "with pdfplumber.open(path) as doc: tables = doc.pages[0].extract_tables(table_settings={...}); return tables[0] if tables else []"\r
        - "table_settings의 vertical_strategy, horizontal_strategy 두 값을 'text'로."\r
    check:\r
      noError: "strategy 값은 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 추출 → DataFrame → CSV 왕복"\r
    structuredPrimary: true\r
    subtitle: "shape·합계·CSV 재오픈 통합 assert"\r
    goal: "추출 → DataFrame → CSV 저장 → 재오픈까지 한 셀에서 자동 검증한다."\r
    why: "표 추출은 round-trip 검증이 핵심입니다. 추출만 되면 사람이 일일이 비교해야 하지만, CSV 재오픈까지 자동으로 비교하면 회귀가 사전에 잡힙니다."\r
    explanation: |-\r
      df.shape, 합계, CSV 재오픈 결과까지 모두 assert로 묶습니다. 이 패턴이 10강 청구서 생성기의 데이터 검증 골격이 됩니다.\r
    tips:\r
      - "CSV는 dtype 정보가 사라집니다. 재오픈 후 합계 비교는 직접 astype으로 강제하세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      import pdfplumber\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      def buildAndExtract(path, csvPath):\r
          rows = [\r
              ["region", "q1", "q2", "q3"],\r
              ["Seoul", "120", "135", "150"],\r
              ["Busan", "80", "78", "92"],\r
              ["Daegu", "60", "65", "70"],\r
          ]\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          tbl = Table(rows)\r
          tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
          doc.build([tbl])\r
          with pdfplumber.open(path) as document:\r
              raw = document.pages[0].extract_tables()[0]\r
          df = pd.DataFrame(raw[1:], columns=raw[0])\r
          df.to_csv(csvPath, index=False)\r
          return df\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      pdfPath = base / "vault.pdf"\r
      csvPath = base / "vault.csv"\r
      df = buildAndExtract(pdfPath, csvPath)\r
\r
      assert df.shape == (3, 4)\r
      reloaded = pd.read_csv(csvPath)\r
      assert reloaded.shape == df.shape\r
      assert reloaded["q1"].astype(int).sum() == 260\r
      df.shape, reloaded.shape\r
    exercise:\r
      prompt: "행을 한 개 추가(Incheon 55/60/62)하고 shape와 q1 합계 검증을 그대로 통과시키세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        import pdfplumber\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        def buildAndExtract(path, csvPath):\r
            rows = [\r
                ["region", "q1", "q2", "q3"],\r
                ["Seoul", "120", "135", "150"],\r
                ["Busan", "80", "78", "92"],\r
                ["Daegu", "60", "65", "70"],\r
                [___, ___, ___, ___],\r
            ]\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            tbl = Table(rows)\r
            tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
            doc.build([tbl])\r
            with pdfplumber.open(path) as document:\r
                raw = document.pages[0].extract_tables()[0]\r
            df = pd.DataFrame(raw[1:], columns=raw[0])\r
            df.to_csv(csvPath, index=False)\r
            return df\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        pdfPath = base / "v.pdf"\r
        csvPath = base / "v.csv"\r
        df = buildAndExtract(pdfPath, csvPath)\r
        assert df.shape == (4, 4)\r
        assert df["q1"].astype(int).sum() == 315\r
        df.shape\r
      hints:\r
        - "Incheon의 q1은 55."\r
    check:\r
      noError: "행 길이가 헤더와 같아야 합니다."\r
      resultCheck: "출력이 (4, 4)이어야 합니다."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "extract_tables는 모든 표를 잡는다?"\r
    goal: "선이 없거나 셀이 병합된 표에서 결과가 어긋날 수 있다는 점을 인지한다."\r
    why: "한국 공공기관 PDF의 표는 선 없거나 헤더가 세로 병합된 경우가 많습니다. 결과가 어긋나면 자동화의 신뢰가 깨집니다."\r
    explanation: |-\r
      세로 병합 셀의 경우 첫 행에만 값이 들어가고 이어지는 행은 빈 문자열이 됩니다. 후처리로 ffill (forward fill)을 적용하면 일반 표 형태로 정규화할 수 있습니다. 손이 더 빠른 경우도 인정하고, 단순 일회성 작업은 손으로 가는 것도 자동화의 한 선택입니다.\r
    tips:\r
      - "df.fillna(method='ffill')는 deprecation 됐고 df.ffill()를 권장합니다."\r
    snippet: |-\r
      import pandas as pd\r
\r
      raw = [\r
          ["region", "metric", "value"],\r
          ["Seoul", "q1", "120"],\r
          ["",       "q2", "135"],\r
          ["Busan",  "q1", "80"],\r
          ["",       "q2", "78"],\r
      ]\r
      df = pd.DataFrame(raw[1:], columns=raw[0])\r
      df["region"] = df["region"].replace("", pd.NA).ffill()\r
      df\r
    exercise:\r
      prompt: "Daegu 행 두 개를 더해(q1 60, q2 65) ffill 후 빈 region이 없는지 확인하세요."\r
      starterCode: |-\r
        import pandas as pd\r
\r
        raw = [\r
            ["region", "metric", "value"],\r
            ["Seoul", "q1", "120"],\r
            ["",       "q2", "135"],\r
            ["Busan",  "q1", "80"],\r
            ["",       "q2", "78"],\r
            ["Daegu",  "q1", ___],\r
            ["",       "q2", ___],\r
        ]\r
        df = pd.DataFrame(raw[1:], columns=raw[0])\r
        df["region"] = df["region"].replace("", pd.NA).ffill()\r
        df["region"].isna().sum() == 0\r
      hints:\r
        - "숫자 문자열 두 개. 예: '60', '65'."\r
    check:\r
      noError: "리스트 원소는 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "표 PDF → CSV 도구"\r
    goal: "표 추출과 후처리 패턴을 결합한 실용 함수 두 개를 작성한다."\r
    why: "표 추출은 데이터 분석의 시작 지점입니다. 손으로 옮기지 않게 만드는 게 모든 후속 작업의 시간을 줄입니다."\r
    explanation: |-\r
      미션1은 여러 표가 포함된 PDF에서 모든 표를 추출해 DataFrame 리스트로 돌려주는 함수, 미션2는 한 PDF의 모든 표를 한 CSV에 누적해 저장하는 함수입니다.\r
    tips:\r
      - "미션 변수 prefix: multi*(미션1), agg*(미션2)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      import pdfplumber\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        import pdfplumber\r
\r
        ___\r
      hints:\r
        - "미션1: extractAllAsFrames(path) -> list[DataFrame]"\r
        - "미션2: extractToOneCsv(path, csvPath) -> DataFrame"\r
    check:\r
      noError: "함수가 정의되고 호출되어야 합니다."\r
      resultCheck: "미션1은 list, 미션2는 DataFrame 반환."\r
    blocks:\r
      - type: tip\r
        content: "extract_tables는 페이지마다 호출해야 합니다. 모든 페이지를 순회하면서 결과를 누적하세요."\r
      - type: expansion\r
        title: "미션1: 여러 표를 DataFrame 리스트로"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              import pdfplumber\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer\r
\r
              def buildMultiTablePdf(path):\r
                  table1 = [["region", "q1"], ["Seoul", "120"], ["Busan", "80"]]\r
                  table2 = [["product", "price"], ["A", "10"], ["B", "20"], ["C", "30"]]\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  style = TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)])\r
                  flows = [Table(table1, style=style), Spacer(1, 12), Table(table2, style=style)]\r
                  doc.build(flows)\r
\r
              multiDir = TemporaryDirectory()\r
              multiPath = Path(multiDir.name) / "multi.pdf"\r
              buildMultiTablePdf(multiPath)\r
              multiPath.stat().st_size > 0\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import pandas as pd\r
\r
              def extractAllAsFrames(path):\r
                  frames = []\r
                  with pdfplumber.open(path) as document:\r
                      for page in document.pages:\r
                          for raw in page.extract_tables():\r
                              if raw:\r
                                  frames.append(pd.DataFrame(raw[1:], columns=raw[0]))\r
                  return frames\r
\r
              frames = extractAllAsFrames(multiPath)\r
              assert len(frames) == 2\r
              assert frames[0].shape == (2, 2)\r
              assert frames[1].shape == (3, 2)\r
              [f.shape for f in frames]\r
      - type: expansion\r
        title: "미션2: 한 PDF의 모든 표를 한 CSV로"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              import pdfplumber\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer\r
\r
              def buildAggPdf(path):\r
                  table1 = [["region", "value"], ["Seoul", "120"], ["Busan", "80"]]\r
                  table2 = [["region", "value"], ["Daegu", "60"], ["Incheon", "55"]]\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  style = TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)])\r
                  doc.build([Table(table1, style=style), Spacer(1, 12), Table(table2, style=style)])\r
\r
              aggDir = TemporaryDirectory()\r
              aggPath = Path(aggDir.name) / "agg.pdf"\r
              aggCsv = Path(aggDir.name) / "agg.csv"\r
              buildAggPdf(aggPath)\r
              aggPath.stat().st_size > 0\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import pandas as pd\r
\r
              def extractToOneCsv(path, csvPath):\r
                  frames = []\r
                  with pdfplumber.open(path) as document:\r
                      for page in document.pages:\r
                          for raw in page.extract_tables():\r
                              if raw:\r
                                  frames.append(pd.DataFrame(raw[1:], columns=raw[0]))\r
                  combined = pd.concat(frames, ignore_index=True)\r
                  combined.to_csv(csvPath, index=False)\r
                  return combined\r
\r
              combined = extractToOneCsv(aggPath, aggCsv)\r
              assert combined.shape == (4, 2)\r
              reloaded = pd.read_csv(aggCsv)\r
              assert reloaded.shape == (4, 2)\r
              combined\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          표 추출 패턴의 실무 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "국세청 부가가치세 신고서 PDF의 매출/매입 표를 분기별 자동 추출"\r
          - "금융 보고서 PDF의 재무제표를 DataFrame으로 변환 후 시계열 분석"\r
          - "이력서 PDF의 경력 표를 추출해 HRIS에 자동 입력"\r
          - "여러 PDF의 동일 양식 표를 모아 하나의 분석용 DataFrame으로 합치기"\r
          - "추출 결과를 openpyxl 트랙의 차트·서식 적용해 보고용 xlsx로 변환"\r
`;export{e as default};