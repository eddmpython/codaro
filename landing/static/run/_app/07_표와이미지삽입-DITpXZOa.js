var e=`meta:\r
  id: pdf_07\r
  title: 표와 이미지 삽입\r
  order: 7\r
  category: pdf\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - reportlab\r
    - pypdf\r
    - pdfplumber\r
  tags:\r
    - Platypus\r
    - Table\r
    - Image\r
    - SimpleDocTemplate\r
  outcomes:\r
    - automation.pdf.layout\r
  prerequisites:\r
    - automation.pdf.create\r
  estimatedMinutes: 60\r
  seo:\r
    title: "reportlab Platypus - 표와 이미지가 들어간 한글 PDF 보고서"\r
    description: "Platypus Table, Image, SimpleDocTemplate로 데이터 표와 로고가 들어간 보고서를 만든다. colWidths 의무화로 페이지 밖으로 나가는 사고를 막는다."\r
    keywords:\r
      - reportlab Platypus\r
      - reportlab Table\r
      - reportlab Image\r
      - SimpleDocTemplate\r
\r
intro:\r
  direction: "데이터 표와 로고가 들어간 한글 보고서를 Platypus로 만든다. 120분 손작업이 15초로 줄어드는 흐름이다."\r
  benefits:\r
    - "마케팅 이주임의 표+로고 보고서 양식 작업을 120분에서 15초로 줄인다."\r
    - "Platypus Table, Image, SimpleDocTemplate의 세 객체가 한 흐름으로 묶이는 패턴을 익힌다."\r
    - "colWidths 의무화로 페이지 밖으로 텍스트가 나가는 가장 흔한 사고를 사전 차단한다."\r
  diagram:\r
    steps:\r
      - label: "1. SimpleDocTemplate"\r
        detail: "PDF 컨테이너. 페이지 크기·여백 설정 후 build에 flowable 리스트를 넘긴다."\r
      - label: "2. Platypus Table"\r
        detail: "list-of-lists 데이터를 Table로 만들고 TableStyle로 선·헤더 색 적용."\r
      - label: "3. Image"\r
        detail: "로고 PNG/JPG를 Image flowable로 삽입. width·height 단위는 pt."\r
      - label: "4. 종합 보고서"\r
        detail: "표지 + 표 + 이미지를 한 PDF로 묶어 보고서 양식을 완성."\r
    runtime:\r
      - label: "이미지 자산"\r
        detail: "본 강의는 reportlab으로 즉석 PNG를 만들거나 단색 사각형 이미지를 사용. 외부 의존 없음."\r
      - label: "검증"\r
        detail: "PdfReader로 페이지 수·본문 키워드, pdfplumber로 표 추출 결과를 함께 검증."\r
\r
sections:\r
  - id: step1_doc_template\r
    title: "1단계. SimpleDocTemplate으로 흐름 잡기"\r
    structuredPrimary: true\r
    subtitle: "SimpleDocTemplate(path, pagesize), build(flowables)"\r
    goal: "단락 두 개가 들어간 PDF를 SimpleDocTemplate으로 만든다."\r
    why: "월간 매출 보고, 분기 사업계획, 협력사 견적서 - 표와 이미지가 같이 들어가는 보고서를 좌표로 직접 그리면 페이지가 늘어날 때마다 사람이 줄을 다시 맞춰야 합니다. SimpleDocTemplate은 flowable 리스트만 넘기면 자동으로 페이지를 흘려보내므로, 보고서 양식이 데이터 길이에 따라 길어져도 코드는 그대로입니다. 10강 청구서 빌더가 이 패턴을 그대로 씁니다."\r
    explanation: |-\r
      SimpleDocTemplate(path, pagesize=A4)로 컨테이너를 만들고 build([flow1, flow2, ...])에 flowable 리스트를 넘기면 페이지가 자동으로 흘러갑니다. Paragraph는 가장 흔한 flowable입니다.\r
    tips:\r
      - "build는 한 번만 호출 가능합니다. 한 번 호출하면 PDF가 닫혀 더 이상 flowable을 추가할 수 없습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "doc.pdf"\r
      styles = getSampleStyleSheet()\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      doc.build([\r
          Paragraph("Report Title", styles["Title"]),\r
          Spacer(1, 12),\r
          Paragraph("body line one", styles["BodyText"]),\r
      ])\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "Report Title" in body and "body line one" in body\r
    exercise:\r
      prompt: "Spacer 다음에 본문 한 줄을 더 추가하고 추출 결과에 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "doc.pdf"\r
        styles = getSampleStyleSheet()\r
        doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
        doc.build([\r
            Paragraph("Report Title", styles["Title"]),\r
            Spacer(1, 12),\r
            Paragraph("body line one", styles["BodyText"]),\r
            Paragraph(___, styles["BodyText"]),\r
        ])\r
        "second line" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "문자열 'second line body'."\r
    check:\r
      noError: "Paragraph 인자는 (text:str, style:ParagraphStyle)."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_table\r
    title: "2단계. Platypus Table"\r
    structuredPrimary: true\r
    subtitle: "Table(data, colWidths), TableStyle"\r
    goal: "list-of-lists 데이터로 Table을 만들고 헤더 색·전체 선을 적용한다."\r
    why: "보고서의 핵심 콘텐츠는 표입니다. Table 객체 하나면 헤더 색, 선, 정렬을 한꺼번에 적용할 수 있습니다."\r
    explanation: |-\r
      Table(data, colWidths=[...])로 표를 만들고 setStyle(TableStyle([...]))로 스타일을 적용합니다. TableStyle 명령은 (command, fromCell, toCell, value) 4-tuple이며 cell 좌표는 (col, row)입니다.\r
    tips:\r
      - "colWidths를 지정하지 않으면 표가 페이지 폭을 넘어가서 텍스트가 잘릴 수 있습니다. 의무로 지정하세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      data = [\r
          ["region", "q1", "q2", "q3"],\r
          ["Seoul", "120", "135", "150"],\r
          ["Busan", "80", "78", "92"],\r
      ]\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "table.pdf"\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      tbl = Table(data, colWidths=[120, 80, 80, 80])\r
      tbl.setStyle(TableStyle([\r
          ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
          ("ALIGN", (1, 0), (-1, -1), "RIGHT"),\r
      ]))\r
      doc.build([tbl])\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      all(token in body for token in ["region", "Seoul", "120"])\r
    exercise:\r
      prompt: "데이터에 'Daegu, 60, 65, 70' 행을 추가하고 표를 다시 만드세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        data = [\r
            ["region", "q1", "q2", "q3"],\r
            ["Seoul", "120", "135", "150"],\r
            ["Busan", "80", "78", "92"],\r
            [___, ___, ___, ___],\r
        ]\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "table.pdf"\r
        doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
        tbl = Table(data, colWidths=[120, 80, 80, 80])\r
        tbl.setStyle(TableStyle([\r
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
        ]))\r
        doc.build([tbl])\r
        "Daegu" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "도시명 'Daegu', 숫자 문자열 3개."\r
    check:\r
      noError: "리스트 행 길이는 모두 같아야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_image\r
    title: "3단계. Image flowable"\r
    structuredPrimary: true\r
    subtitle: "Image(path, width, height)"\r
    goal: "단색 PNG를 즉석 만들어 PDF에 로고처럼 삽입한다."\r
    why: "보고서에는 회사 로고나 상단 배너가 자주 들어갑니다. Image flowable로 PNG·JPG·SVG를 텍스트와 같은 흐름에 두 수 있습니다."\r
    explanation: |-\r
      이미지 파일을 reportlab.graphics 또는 Pillow로 즉석 만들고 Image(path, width=120, height=40) flowable로 삽입합니다. width·height 단위는 pt입니다.\r
    tips:\r
      - "원본 비율을 유지하려면 height만 지정하고 width=None으로 두는 것이 안전합니다. 또는 reportlab.lib.utils.ImageReader로 비율 계산 후 지정."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer\r
      from reportlab.lib.styles import getSampleStyleSheet\r
\r
      def buildSampleImage(path):\r
          from reportlab.graphics.shapes import Drawing, Rect\r
          from reportlab.lib import colors as rlColors\r
          from reportlab.graphics import renderPM\r
          drawing = Drawing(120, 40)\r
          drawing.add(Rect(0, 0, 120, 40, fillColor=rlColors.HexColor("#305496"), strokeColor=None))\r
          renderPM.drawToFile(drawing, str(path), fmt="PNG")\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      imgPath = base / "logo.png"\r
      pdfPath = base / "with_image.pdf"\r
\r
      buildSampleImage(imgPath)\r
      styles = getSampleStyleSheet()\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      doc.build([\r
          Image(str(imgPath), width=120, height=40),\r
          Spacer(1, 12),\r
          Paragraph("body after image", styles["BodyText"]),\r
      ])\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "body after image" in body\r
    exercise:\r
      prompt: "이미지 width를 200, height를 60으로 키우고 본문이 그대로 추출되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer\r
        from reportlab.lib.styles import getSampleStyleSheet\r
\r
        def buildSampleImage(path):\r
            from reportlab.graphics.shapes import Drawing, Rect\r
            from reportlab.lib import colors as rlColors\r
            from reportlab.graphics import renderPM\r
            drawing = Drawing(120, 40)\r
            drawing.add(Rect(0, 0, 120, 40, fillColor=rlColors.HexColor("#305496"), strokeColor=None))\r
            renderPM.drawToFile(drawing, str(path), fmt="PNG")\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        imgPath = base / "logo.png"\r
        pdfPath = base / "doc.pdf"\r
        buildSampleImage(imgPath)\r
\r
        styles = getSampleStyleSheet()\r
        doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
        doc.build([\r
            Image(str(imgPath), width=___, height=___),\r
            Paragraph("after image", styles["BodyText"]),\r
        ])\r
        "after image" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "정수 200, 60."\r
    check:\r
      noError: "Image 인자는 (path:str, width:float, height:float)."\r
      resultCheck: "True 출력."\r
\r
  - id: step4_combined\r
    title: "4단계. 표 + 이미지 결합 보고서"\r
    structuredPrimary: true\r
    subtitle: "이미지(로고) + 제목 + 표 + 본문"\r
    goal: "로고 + 제목 + 표 + 본문 네 요소가 들어간 한 페이지 PDF를 만든다."\r
    why: "각 요소를 따로 익혔으니 한 흐름에 묶어 진짜 보고서 양식을 완성합니다. 10강 청구서 생성기의 직접 전 단계입니다."\r
    explanation: |-\r
      flowable 리스트에 Image, Paragraph, Table, Paragraph를 차례로 넣어 build를 한 번 호출합니다. SimpleDocTemplate은 페이지 폭에 맞게 알아서 정렬하므로 좌표를 직접 다룰 필요가 없습니다.\r
    tips:\r
      - "보고서 양식의 일관성을 위해 ParagraphStyle, TableStyle을 함수로 묶어 재사용하는 것이 좋습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
      def buildLogo(path):\r
          from reportlab.graphics.shapes import Drawing, Rect\r
          from reportlab.lib import colors as rlColors\r
          from reportlab.graphics import renderPM\r
          drawing = Drawing(120, 40)\r
          drawing.add(Rect(0, 0, 120, 40, fillColor=rlColors.HexColor("#305496"), strokeColor=None))\r
          renderPM.drawToFile(drawing, str(path), fmt="PNG")\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      imgPath = base / "logo.png"\r
      pdfPath = base / "report.pdf"\r
      buildLogo(imgPath)\r
\r
      styles = getSampleStyleSheet()\r
      data = [\r
          ["region", "amount"],\r
          ["Seoul", "120"],\r
          ["Busan", "80"],\r
      ]\r
\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      flow = [\r
          Image(str(imgPath), width=120, height=40),\r
          Spacer(1, 12),\r
          Paragraph("Monthly Sales Report", styles["Heading1"]),\r
          Spacer(1, 12),\r
          Table(data, colWidths=[200, 100], style=TableStyle([\r
              ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
              ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
          ])),\r
          Spacer(1, 12),\r
          Paragraph("Issued by accounting team on 2026-05-28.", styles["BodyText"]),\r
      ]\r
      doc.build(flow)\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      all(token in body for token in ["Monthly Sales Report", "Seoul", "Issued"])\r
    exercise:\r
      prompt: "표 colWidths를 [180, 120]으로 바꾸고 본문 키워드 검증을 통과시키세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
        def buildLogo(path):\r
            from reportlab.graphics.shapes import Drawing, Rect\r
            from reportlab.lib import colors as rlColors\r
            from reportlab.graphics import renderPM\r
            drawing = Drawing(120, 40)\r
            drawing.add(Rect(0, 0, 120, 40, fillColor=rlColors.HexColor("#305496"), strokeColor=None))\r
            renderPM.drawToFile(drawing, str(path), fmt="PNG")\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        imgPath = base / "logo.png"\r
        pdfPath = base / "report.pdf"\r
        buildLogo(imgPath)\r
\r
        styles = getSampleStyleSheet()\r
        data = [["region", "amount"], ["Seoul", "120"], ["Busan", "80"]]\r
        doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
        doc.build([\r
            Image(str(imgPath), width=120, height=40),\r
            Paragraph("Monthly Sales", styles["Heading1"]),\r
            Table(data, colWidths=[___, ___], style=TableStyle([("GRID", (0,0), (-1,-1), 0.5, colors.black)])),\r
        ])\r
        "Seoul" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "정수 180, 120."\r
    check:\r
      noError: "colWidths는 숫자 리스트."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 텍스트 + 표 동시 검증"\r
    structuredPrimary: true\r
    subtitle: "PdfReader 본문 + pdfplumber 표 비교"\r
    goal: "완성된 보고서에서 본문 키워드와 표 추출 결과를 동시에 assert한다."\r
    why: "보고서는 텍스트와 표가 둘 다 살아 있어야 가치가 있습니다. 한 검증 셀에서 둘 다 확인하면 회귀가 사전에 잡힙니다."\r
    explanation: |-\r
      buildReport(path, data)이 표지 + 표를 만들고, 결과를 PdfReader와 pdfplumber로 두 번 열어 본문 키워드와 표 추출 결과를 같이 검증합니다.\r
    tips:\r
      - "pdfplumber로 표를 추출했을 때 행 수는 데이터 행 + 헤더입니다. 검증에서는 +1을 잊지 마세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pdfplumber\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
      def buildReport(path, data):\r
          styles = getSampleStyleSheet()\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          doc.build([\r
              Paragraph("Monthly Report", styles["Heading1"]),\r
              Spacer(1, 12),\r
              Table(data, colWidths=[160, 100], style=TableStyle([\r
                  ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                  ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
              ])),\r
          ])\r
\r
      vault = TemporaryDirectory()\r
      pdfPath = Path(vault.name) / "verify.pdf"\r
      data = [["region", "amount"], ["Seoul", "120"], ["Busan", "80"], ["Daegu", "60"]]\r
      buildReport(pdfPath, data)\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      assert "Monthly Report" in body\r
      with pdfplumber.open(pdfPath) as document:\r
          tables = document.pages[0].extract_tables()\r
      assert len(tables) == 1\r
      assert len(tables[0]) == 4\r
      tables[0][0], tables[0][1]\r
    exercise:\r
      prompt: "buildReport 함수의 본문을 직접 작성하세요. 제목 Heading1, 표(colWidths=[160,100], 헤더 회색 배경, 전체 격자)가 순서대로 들어간 한 페이지 PDF를 만들어야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pdfplumber\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
        def buildReport(path, data):\r
            styles = getSampleStyleSheet()\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            ___  # Paragraph('Monthly Report', Heading1) + Spacer + Table 을 flowable 리스트로 doc.build\r
\r
        vault = TemporaryDirectory()\r
        pdfPath = Path(vault.name) / "v.pdf"\r
        data = [\r
            ["region", "amount"],\r
            ["Seoul", "120"],\r
            ["Busan", "80"],\r
            ["Daegu", "60"],\r
            ["Incheon", "55"],\r
            ["Daejeon", "50"],\r
        ]\r
        buildReport(pdfPath, data)\r
        with pdfplumber.open(pdfPath) as d:\r
            tables = d.pages[0].extract_tables()\r
        body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        assert "Monthly Report" in body\r
        assert len(tables[0]) == 6\r
        tables[0][-1]\r
      hints:\r
        - "doc.build([Paragraph('Monthly Report', styles['Heading1']), Spacer(1, 12), Table(data, colWidths=[160,100], style=TableStyle([...]))])"\r
        - "TableStyle 명령 두 줄: ('BACKGROUND', (0,0), (-1,0), colors.lightgrey), ('GRID', (0,0), (-1,-1), 0.5, colors.black)"\r
    check:\r
      noError: "리스트 길이가 2여야 합니다."\r
      resultCheck: "출력 리스트의 마지막 요소가 'Daejeon' 행."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "colWidths 미지정 → 페이지 밖으로 텍스트"\r
    goal: "표 폭을 명시하지 않으면 페이지 밖으로 잘릴 수 있다는 점을 사전에 차단한다."\r
    why: "보고서가 시각적으로 잘려 보이는 사고는 자동화의 신뢰를 깎습니다. colWidths 의무화 한 줄이 모든 사고를 사전에 차단합니다."\r
    explanation: |-\r
      Table(data)만 호출하면 reportlab이 데이터에 기반해 자동으로 폭을 추정하지만, 긴 텍스트가 들어가면 페이지 밖으로 나갈 수 있습니다. colWidths를 명시하면 항상 페이지 폭에 맞춰 균형을 잡을 수 있습니다.\r
    tips:\r
      - "A4 페이지 사용 가능 폭은 약 460pt(여백 제외)입니다. colWidths 합계를 460 이내로 두세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
      def safeBuild(path, data):\r
          totalWidth = 460\r
          colCount = len(data[0])\r
          widths = [totalWidth / colCount] * colCount\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          tbl = Table(data, colWidths=widths)\r
          tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
          doc.build([tbl])\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "safe.pdf"\r
      safeBuild(pdfPath, [["a", "b", "c"], ["1", "2", "3"]])\r
      len(PdfReader(pdfPath).pages)\r
    exercise:\r
      prompt: "safeBuild를 그대로 사용해 5컬럼 데이터에 적용하고 페이지 수를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle\r
\r
        def safeBuild(path, data):\r
            totalWidth = 460\r
            colCount = len(data[0])\r
            widths = [totalWidth / colCount] * colCount\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            tbl = Table(data, colWidths=widths)\r
            tbl.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))\r
            doc.build([tbl])\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "safe.pdf"\r
        data = [["a", "b", "c", "d", "e"], [___, ___, ___, ___, ___]]\r
        safeBuild(pdfPath, data)\r
        len(PdfReader(pdfPath).pages)\r
      hints:\r
        - "어떤 문자열이든 OK. 예: '1', '2', '3', '4', '5'."\r
    check:\r
      noError: "데이터 행 길이가 헤더와 같아야 합니다."\r
      resultCheck: "출력 1."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "표 + 이미지 보고서 생성기"\r
    goal: "Platypus 패턴을 함수로 묶어 실용 보고서 생성기 두 개를 만든다."\r
    why: "함수 형태로 묶어두면 본인 업무 데이터로 바로 가져갈 수 있습니다."\r
    explanation: |-\r
      미션1은 데이터 표만 들어간 보고서, 미션2는 로고 이미지가 상단에 들어간 보고서 생성 함수입니다.\r
    tips:\r
      - "변수 prefix: tbl*(미션1), logo*(미션2)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "미션1: makeTableReport(path, title, data) -> Path"\r
        - "미션2: makeReportWithLogo(path, logoPath, title, data) -> Path"\r
    check:\r
      noError: "두 함수가 모두 정의되어야 합니다."\r
      resultCheck: "둘 다 PdfReader 본문 검증 통과."\r
    blocks:\r
      - type: tip\r
        content: "함수가 Path를 돌려주면 후속에서 PdfReader로 검증하기 편합니다. 일관된 인터페이스를 유지하세요."\r
      - type: expansion\r
        title: "미션1: 표 보고서"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
              def makeTableReport(path, title, data):\r
                  styles = getSampleStyleSheet()\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  doc.build([\r
                      Paragraph(title, styles["Heading1"]),\r
                      Spacer(1, 12),\r
                      Table(data, colWidths=[200, 100], style=TableStyle([\r
                          ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                      ])),\r
                  ])\r
                  return Path(path)\r
\r
              tblDir = TemporaryDirectory()\r
              tblPath = Path(tblDir.name) / "table.pdf"\r
              makeTableReport(tblPath, "Sales", [\r
                  ["region", "amount"],\r
                  ["Seoul", "120"],\r
                  ["Busan", "80"],\r
              ])\r
              body = PdfReader(tblPath).pages[0].extract_text() or ""\r
              assert "Sales" in body and "Seoul" in body\r
              body.strip().splitlines()[:3]\r
      - type: expansion\r
        title: "미션2: 로고 포함 보고서"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
              def buildLogoPng(path):\r
                  from reportlab.graphics.shapes import Drawing, Rect\r
                  from reportlab.lib import colors as rlColors\r
                  from reportlab.graphics import renderPM\r
                  drawing = Drawing(120, 40)\r
                  drawing.add(Rect(0, 0, 120, 40, fillColor=rlColors.HexColor("#305496"), strokeColor=None))\r
                  renderPM.drawToFile(drawing, str(path), fmt="PNG")\r
\r
              def makeReportWithLogo(path, logoPath, title, data):\r
                  styles = getSampleStyleSheet()\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  doc.build([\r
                      Image(str(logoPath), width=120, height=40),\r
                      Spacer(1, 12),\r
                      Paragraph(title, styles["Heading1"]),\r
                      Spacer(1, 12),\r
                      Table(data, colWidths=[200, 100], style=TableStyle([\r
                          ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                      ])),\r
                  ])\r
                  return Path(path)\r
\r
              logoDir = TemporaryDirectory()\r
              logoPath = Path(logoDir.name) / "logo.png"\r
              reportPath = Path(logoDir.name) / "report.pdf"\r
              buildLogoPng(logoPath)\r
              makeReportWithLogo(reportPath, logoPath, "Monthly", [\r
                  ["region", "amount"],\r
                  ["Seoul", "120"],\r
              ])\r
              body = PdfReader(reportPath).pages[0].extract_text() or ""\r
              assert "Monthly" in body and "Seoul" in body\r
              body.strip().splitlines()[:3]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          표·이미지 결합 패턴의 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "회사 양식 함수 makeBrandedReport(데이터)로 모든 보고서 통일"\r
          - "표 헤더에 행 stripe(회색·흰색 교대)로 가독성 향상"\r
          - "이미지 대신 matplotlib png를 삽입해 차트 포함 보고서"\r
          - "여러 표를 한 페이지에 두 개 컬럼으로 배치 (Frame 활용)"\r
          - "표 셀에 색상 강조(예: 합계 행 노랑)로 한눈에 들어오는 양식"\r
`;export{e as default};