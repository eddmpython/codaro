var e=`meta:\r
  id: pdf_10\r
  title: 월간 청구서 자동 생성기\r
  order: 10\r
  category: pdf\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
    - pypdf\r
    - reportlab\r
    - pandas\r
  tags:\r
    - 종합프로젝트\r
    - 청구서\r
    - 한글PDF\r
    - 자동생성\r
  outcomes:\r
    - automation.pdf.report\r
  prerequisites:\r
    - automation.pdf.layout\r
    - automation.pdf.security\r
  estimatedMinutes: 90\r
  seo:\r
    title: "월간 청구서 자동 생성기 - CSV → 고객별 한글 PDF 묶음"\r
    description: "01-09강에서 익힌 모든 패턴을 한 사이클에 결합한다. CSV 거래 데이터를 받아 고객별 한글 청구서 PDF를 일괄 생성하는 회계팀 실무 도구."\r
    keywords:\r
      - PDF 청구서 자동 생성\r
      - 한국 청구서 양식\r
      - reportlab 청구서\r
      - 월간 보고서 자동화\r
\r
intro:\r
  direction: "01-09강의 모든 패턴을 한 사이클에 묶는다. CSV 거래 데이터에서 고객별 한글 청구서 PDF 묶음을 만드는 회계팀 실무 도구를 완성한다."\r
  benefits:\r
    - "회계팀 김대리의 매월 200건 청구서 작성 6.7시간을 30초로 줄인다."\r
    - "한국 사업자 청구서 표준 양식(상호·사업자번호·공급가액·세액·합계)을 그대로 재현한다."\r
    - "trackPRD에 정의된 ROI 목표(월 15시간 절감)를 본 강의 한 함수가 달성한다."\r
  diagram:\r
    steps:\r
      - label: "1. 데이터 모델 정의"\r
        detail: "CSV → 고객 dict 리스트로 변환. 한 고객 = 한 청구서."\r
      - label: "2. 청구서 빌더"\r
        detail: "한 고객의 데이터로 표지 + 표 + 합계 + 직인 자리가 들어간 한글 PDF를 만드는 함수."\r
      - label: "3. 일괄 생성"\r
        detail: "200건 데이터를 순회하며 파일명을 자동 생성, 폴더에 저장."\r
      - label: "4. 검증과 메타"\r
        detail: "각 PDF의 합계가 데이터와 일치하는지 자동 검증 + 메타데이터 자동 입력."\r
    runtime:\r
      - label: "전 강의 패턴 통합"\r
        detail: "06강 한글 폰트, 07강 Platypus, 09강 메타데이터, 02강 일괄 패턴이 모두 호출됨."\r
      - label: "검증"\r
        detail: "200건 모두에 대해 합계·페이지 수·필수 키워드를 한 셀에서 assert."\r
\r
sections:\r
  - id: step1_data\r
    title: "1단계. 데이터 모델과 CSV 입력"\r
    structuredPrimary: true\r
    subtitle: "CSV → 고객 dict 리스트"\r
    goal: "거래 CSV를 읽어 고객별로 그룹핑된 청구 항목 리스트를 만든다."\r
    why: "자동화의 시작은 데이터 모양을 고정하는 것입니다. CSV에서 청구서 dict로 바꾸는 변환이 본 파이프라인의 첫 단계입니다."\r
    explanation: |-\r
      CSV에 customer, item, qty, unit_price 컬럼이 있다고 가정합니다. pandas로 읽어 customer별로 group_by하고, 한 고객의 청구서 dict로 변환합니다.\r
    tips:\r
      - "실무 CSV는 컬럼명·인코딩이 회사마다 다릅니다. 함수 표면에서 변환 규칙을 명시하면 회사별 차이를 흡수할 수 있습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      csvPath = base / "deals.csv"\r
      csvPath.write_text(\r
          "customer,item,qty,unit_price\\n"\r
          "Codaro Lab,Subscription,2,50000\\n"\r
          "Codaro Lab,Onboarding,1,200000\\n"\r
          "Acme Corp,Subscription,5,50000\\n"\r
          "Acme Corp,Support,3,30000\\n",\r
          encoding="utf-8",\r
      )\r
\r
      def loadInvoices(csvPath):\r
          df = pd.read_csv(csvPath)\r
          df["amount"] = df["qty"] * df["unit_price"]\r
          invoices = []\r
          for customer, group in df.groupby("customer"):\r
              items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
              invoices.append({\r
                  "customer": customer,\r
                  "items": items,\r
                  "subtotal": int(group["amount"].sum()),\r
              })\r
          return invoices\r
\r
      invoices = loadInvoices(csvPath)\r
      [(inv["customer"], inv["subtotal"]) for inv in invoices]\r
    exercise:\r
      prompt: "CSV에 'Beta Inc' 고객의 항목 두 개(Subscription qty 3, Support qty 1)를 추가하고 invoices 길이를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        csvPath = base / "deals.csv"\r
        csvPath.write_text(\r
            "customer,item,qty,unit_price\\n"\r
            "Codaro Lab,Subscription,2,50000\\n"\r
            "Acme Corp,Subscription,5,50000\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
\r
        def loadInvoices(csvPath):\r
            df = pd.read_csv(csvPath)\r
            df["amount"] = df["qty"] * df["unit_price"]\r
            invoices = []\r
            for customer, group in df.groupby("customer"):\r
                items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
                invoices.append({\r
                    "customer": customer,\r
                    "items": items,\r
                    "subtotal": int(group["amount"].sum()),\r
                })\r
            return invoices\r
\r
        invoices = loadInvoices(csvPath)\r
        len(invoices)\r
      hints:\r
        - "CSV 행 두 개. 예: 'Beta Inc,Subscription,3,50000\\\\nBeta Inc,Support,1,30000\\\\n'"\r
    check:\r
      noError: "CSV 문자열은 줄바꿈 포함, 마지막 줄에도 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_builder\r
    title: "2단계. 청구서 PDF 빌더"\r
    structuredPrimary: true\r
    subtitle: "한글 폰트 + Platypus 표 + 합계"\r
    goal: "한 고객의 청구서 dict로 한글 PDF를 생성하는 buildInvoice 함수를 만든다."\r
    why: "한국 회계팀의 월간 청구서는 공급가액·부가세·합계 세 줄과 품목 명세표가 한국 사업자 청구서 표준 양식의 핵심입니다. buildInvoice 한 함수가 06강 한글 폰트 헬퍼와 07강 Platypus Table을 한 자리에서 결합해 회계팀이 그대로 쓸 수 있는 청구서를 만듭니다. 3단계의 일괄 생성과 4단계의 합계 검증이 모두 이 함수 위에서 돌아가므로, 여기서 만든 모양이 트랙 전체의 산출물을 결정합니다."\r
    explanation: |-\r
      buildInvoice(path, invoice)는 등록한 한글 폰트로 표지(고객명, 청구일), 항목 표, 합계 행을 한 페이지 PDF로 그립니다. 부가세 10% 별도 처리도 포함합니다.\r
    tips:\r
      - "한국 청구서는 공급가액·세액·합계 세 줄로 합계를 표시하는 게 표준입니다. 표 하단 행으로 추가하세요."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
      def registerKoreanFont():\r
          paths = {\r
              "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
              "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
              "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
          }\r
          for path in paths.get(sys.platform, []):\r
              if Path(path).exists():\r
                  pdfmetrics.registerFont(TTFont("Korean", path))\r
                  return "Korean"\r
          return "Helvetica"\r
\r
      def buildInvoice(path, invoice):\r
          fontName = registerKoreanFont()\r
          styles = getSampleStyleSheet()\r
          for style in styles.byName.values():\r
              style.fontName = fontName\r
\r
          subtotal = invoice["subtotal"]\r
          vat = int(subtotal * 0.1)\r
          total = subtotal + vat\r
\r
          rows = [["품목", "수량", "단가", "금액"]]\r
          for item in invoice["items"]:\r
              rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
          rows.append(["공급가액", "", "", f"{subtotal:,}"])\r
          rows.append(["부가세", "", "", f"{vat:,}"])\r
          rows.append(["합계", "", "", f"{total:,}"])\r
\r
          doc = SimpleDocTemplate(str(path), pagesize=A4, title=f"청구서 {invoice['customer']}")\r
          flow = [\r
              Paragraph("청구서", styles["Title"]),\r
              Spacer(1, 12),\r
              Paragraph(f"고객: {invoice['customer']}", styles["Heading2"]),\r
              Spacer(1, 12),\r
              Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([\r
                  ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                  ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                  ("ALIGN", (1, 0), (-1, -1), "RIGHT"),\r
                  ("FONTNAME", (0, -3), (-1, -1), fontName),\r
              ])),\r
          ]\r
          doc.build(flow)\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "inv.pdf"\r
      sample = {\r
          "customer": "Codaro Lab",\r
          "items": [\r
              {"item": "Subscription", "qty": 2, "unit_price": 50000, "amount": 100000},\r
              {"item": "Onboarding", "qty": 1, "unit_price": 200000, "amount": 200000},\r
          ],\r
          "subtotal": 300000,\r
      }\r
      buildInvoice(pdfPath, sample)\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "Codaro Lab" in body and "300,000" in body and "30,000" in body\r
    exercise:\r
      prompt: "buildInvoice 함수 안에서 한국 청구서 표준 3행(공급가액·부가세·합계)을 만드는 로직을 직접 작성하세요. subtotal에 10% VAT를 더한 합계를 계산하고 rows에 천 단위 구분자 포맷으로 누적해야 합니다."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
        def registerKoreanFont():\r
            paths = {\r
                "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
                "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
            }\r
            for path in paths.get(sys.platform, []):\r
                if Path(path).exists():\r
                    pdfmetrics.registerFont(TTFont("Korean", path))\r
                    return "Korean"\r
            return "Helvetica"\r
\r
        def buildInvoice(path, invoice):\r
            fontName = registerKoreanFont()\r
            styles = getSampleStyleSheet()\r
            for style in styles.byName.values():\r
                style.fontName = fontName\r
            subtotal = invoice["subtotal"]\r
            rows = [["품목", "수량", "단가", "금액"]]\r
            for item in invoice["items"]:\r
                rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
            ___  # VAT 계산 + 공급가액/부가세/합계 3행을 rows에 추가\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            doc.build([\r
                Paragraph("청구서", styles["Title"]),\r
                Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([("GRID", (0,0), (-1,-1), 0.5, colors.black)])),\r
            ])\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "inv.pdf"\r
        sample = {\r
            "customer": "Acme",\r
            "items": [{"item": "Sub", "qty": 1, "unit_price": 500000, "amount": 500000}],\r
            "subtotal": 500000,\r
        }\r
        buildInvoice(pdfPath, sample)\r
        body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        assert "500,000" in body  # 공급가액\r
        assert "50,000" in body   # 부가세\r
        assert "550,000" in body  # 합계\r
        "550,000" in body\r
      hints:\r
        - "vat = int(subtotal * 0.1); total = subtotal + vat"\r
        - "rows.append(['공급가액', '', '', f'{subtotal:,}']); rows.append(['부가세', '', '', f'{vat:,}']); rows.append(['합계', '', '', f'{total:,}'])"\r
    check:\r
      noError: "dict 값이 정수여야 합니다."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_bulk\r
    title: "3단계. 일괄 청구서 생성"\r
    structuredPrimary: true\r
    subtitle: "loadInvoices → buildInvoice 반복"\r
    goal: "CSV에서 읽은 모든 고객의 청구서를 한 함수 호출로 폴더에 만든다."\r
    why: "200건 일괄 생성이 본 트랙의 ROI 목표(월 15시간 절감)를 달성하는 핵심 단계입니다."\r
    explanation: |-\r
      generateMonthlyInvoices(csvPath, outFolder)가 loadInvoices + buildInvoice를 묶어 N개 PDF를 만듭니다. 파일명은 customer 이름으로 자동 생성합니다.\r
    tips:\r
      - "customer 이름에 한글·공백·특수문자가 있을 수 있습니다. 안전화 함수로 파일명 처리."\r
    snippet: |-\r
      import re\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
      def registerKoreanFont():\r
          paths = {\r
              "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
              "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
              "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
          }\r
          for path in paths.get(sys.platform, []):\r
              if Path(path).exists():\r
                  pdfmetrics.registerFont(TTFont("Korean", path))\r
                  return "Korean"\r
          return "Helvetica"\r
\r
      def loadInvoices(csvPath):\r
          df = pd.read_csv(csvPath)\r
          df["amount"] = df["qty"] * df["unit_price"]\r
          invoices = []\r
          for customer, group in df.groupby("customer"):\r
              items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
              invoices.append({\r
                  "customer": customer,\r
                  "items": items,\r
                  "subtotal": int(group["amount"].sum()),\r
              })\r
          return invoices\r
\r
      def safeFileName(name):\r
          return re.sub(r"[^\\w가-힣]+", "_", name).strip("_")\r
\r
      def buildInvoice(path, invoice):\r
          fontName = registerKoreanFont()\r
          styles = getSampleStyleSheet()\r
          for style in styles.byName.values():\r
              style.fontName = fontName\r
          subtotal = invoice["subtotal"]\r
          vat = int(subtotal * 0.1)\r
          total = subtotal + vat\r
          rows = [["품목", "수량", "단가", "금액"]]\r
          for item in invoice["items"]:\r
              rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
          rows.append(["공급가액", "", "", f"{subtotal:,}"])\r
          rows.append(["부가세", "", "", f"{vat:,}"])\r
          rows.append(["합계", "", "", f"{total:,}"])\r
          doc = SimpleDocTemplate(str(path), pagesize=A4, title=f"청구서 {invoice['customer']}")\r
          doc.build([\r
              Paragraph("청구서", styles["Title"]),\r
              Spacer(1, 12),\r
              Paragraph(f"고객: {invoice['customer']}", styles["Heading2"]),\r
              Spacer(1, 12),\r
              Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([\r
                  ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                  ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                  ("ALIGN", (1, 0), (-1, -1), "RIGHT"),\r
              ])),\r
          ])\r
\r
      def generateMonthlyInvoices(csvPath, outFolder):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          outputs = []\r
          for invoice in loadInvoices(csvPath):\r
              outPath = Path(outFolder) / f"{safeFileName(invoice['customer'])}.pdf"\r
              buildInvoice(outPath, invoice)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      csvPath = base / "deals.csv"\r
      csvPath.write_text(\r
          "customer,item,qty,unit_price\\n"\r
          "Codaro Lab,Subscription,2,50000\\n"\r
          "Codaro Lab,Onboarding,1,200000\\n"\r
          "Acme Corp,Subscription,5,50000\\n"\r
          "Acme Corp,Support,3,30000\\n",\r
          encoding="utf-8",\r
      )\r
      paths = generateMonthlyInvoices(csvPath, base / "invoices")\r
      [p.name for p in paths]\r
    exercise:\r
      prompt: "CSV에 'Beta Inc' 고객의 항목 2개를 추가하고 결과 PDF 수가 3인지 확인하세요."\r
      starterCode: |-\r
        import re\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
        def registerKoreanFont():\r
            paths = {\r
                "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
                "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
            }\r
            for path in paths.get(sys.platform, []):\r
                if Path(path).exists():\r
                    pdfmetrics.registerFont(TTFont("Korean", path))\r
                    return "Korean"\r
            return "Helvetica"\r
\r
        def loadInvoices(csvPath):\r
            df = pd.read_csv(csvPath)\r
            df["amount"] = df["qty"] * df["unit_price"]\r
            invoices = []\r
            for customer, group in df.groupby("customer"):\r
                items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
                invoices.append({"customer": customer, "items": items, "subtotal": int(group["amount"].sum())})\r
            return invoices\r
\r
        def safeFileName(name):\r
            return re.sub(r"[^\\w가-힣]+", "_", name).strip("_")\r
\r
        def buildInvoice(path, invoice):\r
            fontName = registerKoreanFont()\r
            styles = getSampleStyleSheet()\r
            for style in styles.byName.values():\r
                style.fontName = fontName\r
            subtotal = invoice["subtotal"]\r
            vat = int(subtotal * 0.1)\r
            total = subtotal + vat\r
            rows = [["품목", "수량", "단가", "금액"]]\r
            for item in invoice["items"]:\r
                rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
            rows.append(["합계", "", "", f"{total:,}"])\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            doc.build([\r
                Paragraph("청구서", styles["Title"]),\r
                Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([("GRID", (0,0), (-1,-1), 0.5, colors.black)])),\r
            ])\r
\r
        def generateMonthlyInvoices(csvPath, outFolder):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            outputs = []\r
            for invoice in loadInvoices(csvPath):\r
                outPath = Path(outFolder) / f"{safeFileName(invoice['customer'])}.pdf"\r
                buildInvoice(outPath, invoice)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        csvPath = base / "deals.csv"\r
        csvPath.write_text(\r
            "customer,item,qty,unit_price\\n"\r
            "Codaro Lab,Subscription,2,50000\\n"\r
            "Acme Corp,Subscription,5,50000\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        paths = generateMonthlyInvoices(csvPath, base / "out")\r
        len(paths)\r
      hints:\r
        - "Beta Inc 두 줄 추가. 예: 'Beta Inc,A,1,10000\\\\nBeta Inc,B,2,20000\\\\n'."\r
    check:\r
      noError: "CSV는 마지막에도 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 일괄 결과 합계 자동 검증"\r
    structuredPrimary: true\r
    subtitle: "각 PDF 본문 + 데이터 합계 일치"\r
    goal: "생성된 모든 청구서의 합계가 CSV 데이터의 부가세 포함 합계와 일치하는지 한 셀에서 검증한다."\r
    why: "200건 청구서 자동 생성에서 합계가 어긋나면 회계 사고로 직결됩니다. assert 한 묶음이 사전에 잡습니다."\r
    explanation: |-\r
      각 PDF의 본문에 customer 이름과 부가세 포함 합계 문자열이 모두 포함되는지 확인합니다.\r
    tips:\r
      - "한국식 천 단위 구분자(,)는 f-string 포맷 {:,}로 자동 적용됩니다."\r
    snippet: |-\r
      import re\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
      def registerKoreanFont():\r
          paths = {\r
              "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
              "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
              "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
          }\r
          for path in paths.get(sys.platform, []):\r
              if Path(path).exists():\r
                  pdfmetrics.registerFont(TTFont("Korean", path))\r
                  return "Korean"\r
          return "Helvetica"\r
\r
      def loadInvoices(csvPath):\r
          df = pd.read_csv(csvPath)\r
          df["amount"] = df["qty"] * df["unit_price"]\r
          invoices = []\r
          for customer, group in df.groupby("customer"):\r
              items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
              invoices.append({"customer": customer, "items": items, "subtotal": int(group["amount"].sum())})\r
          return invoices\r
\r
      def safeFileName(name):\r
          return re.sub(r"[^\\w가-힣]+", "_", name).strip("_")\r
\r
      def buildInvoice(path, invoice):\r
          fontName = registerKoreanFont()\r
          styles = getSampleStyleSheet()\r
          for style in styles.byName.values():\r
              style.fontName = fontName\r
          subtotal = invoice["subtotal"]\r
          vat = int(subtotal * 0.1)\r
          total = subtotal + vat\r
          rows = [["품목", "수량", "단가", "금액"]]\r
          for item in invoice["items"]:\r
              rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
          rows.append(["합계", "", "", f"{total:,}"])\r
          doc = SimpleDocTemplate(str(path), pagesize=A4, title=f"청구서 {invoice['customer']}")\r
          doc.build([\r
              Paragraph("청구서", styles["Title"]),\r
              Spacer(1, 12),\r
              Paragraph(f"고객: {invoice['customer']}", styles["Heading2"]),\r
              Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([\r
                  ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                  ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
              ])),\r
          ])\r
\r
      def generateMonthlyInvoices(csvPath, outFolder):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          outputs = []\r
          for invoice in loadInvoices(csvPath):\r
              outPath = Path(outFolder) / f"{safeFileName(invoice['customer'])}.pdf"\r
              buildInvoice(outPath, invoice)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      csvPath = base / "deals.csv"\r
      csvPath.write_text(\r
          "customer,item,qty,unit_price\\n"\r
          "Codaro Lab,Subscription,2,50000\\n"\r
          "Codaro Lab,Onboarding,1,200000\\n"\r
          "Acme Corp,Subscription,5,50000\\n",\r
          encoding="utf-8",\r
      )\r
      paths = generateMonthlyInvoices(csvPath, base / "invoices")\r
      invoices = loadInvoices(csvPath)\r
\r
      for invoicePath, invoice in zip(paths, invoices):\r
          body = PdfReader(invoicePath).pages[0].extract_text() or ""\r
          assert invoice["customer"] in body\r
          total = invoice["subtotal"] + int(invoice["subtotal"] * 0.1)\r
          assert f"{total:,}" in body, f"{invoicePath.name} 합계 mismatch"\r
      len(paths)\r
    exercise:\r
      prompt: "CSV에 'Beta Inc' 두 줄을 추가하고 검증을 통과시키세요."\r
      starterCode: |-\r
        import re\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
        from pypdf import PdfReader\r
        from reportlab.lib import colors\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
        def registerKoreanFont():\r
            paths = {\r
                "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
                "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
            }\r
            for path in paths.get(sys.platform, []):\r
                if Path(path).exists():\r
                    pdfmetrics.registerFont(TTFont("Korean", path))\r
                    return "Korean"\r
            return "Helvetica"\r
\r
        def loadInvoices(csvPath):\r
            df = pd.read_csv(csvPath)\r
            df["amount"] = df["qty"] * df["unit_price"]\r
            invoices = []\r
            for customer, group in df.groupby("customer"):\r
                items = group[["item", "qty", "unit_price", "amount"]].to_dict("records")\r
                invoices.append({"customer": customer, "items": items, "subtotal": int(group["amount"].sum())})\r
            return invoices\r
\r
        def safeFileName(name):\r
            return re.sub(r"[^\\w가-힣]+", "_", name).strip("_")\r
\r
        def buildInvoice(path, invoice):\r
            fontName = registerKoreanFont()\r
            styles = getSampleStyleSheet()\r
            for style in styles.byName.values():\r
                style.fontName = fontName\r
            subtotal = invoice["subtotal"]\r
            total = subtotal + int(subtotal * 0.1)\r
            rows = [["품목", "수량", "단가", "금액"]]\r
            for item in invoice["items"]:\r
                rows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
            rows.append(["합계", "", "", f"{total:,}"])\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            doc.build([\r
                Paragraph("청구서", styles["Title"]),\r
                Paragraph(f"고객: {invoice['customer']}", styles["Heading2"]),\r
                Table(rows, colWidths=[180, 60, 100, 100], style=TableStyle([("GRID", (0,0), (-1,-1), 0.5, colors.black)])),\r
            ])\r
\r
        def generateMonthlyInvoices(csvPath, outFolder):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            outputs = []\r
            for invoice in loadInvoices(csvPath):\r
                outPath = Path(outFolder) / f"{safeFileName(invoice['customer'])}.pdf"\r
                buildInvoice(outPath, invoice)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        csvPath = base / "deals.csv"\r
        csvPath.write_text(\r
            "customer,item,qty,unit_price\\n"\r
            "Codaro Lab,Subscription,2,50000\\n"\r
            "Acme Corp,Subscription,5,50000\\n"\r
            ___,\r
            encoding="utf-8",\r
        )\r
        paths = generateMonthlyInvoices(csvPath, base / "out")\r
        invoices = loadInvoices(csvPath)\r
        for invoicePath, invoice in zip(paths, invoices):\r
            body = PdfReader(invoicePath).pages[0].extract_text() or ""\r
            assert invoice["customer"] in body\r
            total = invoice["subtotal"] + int(invoice["subtotal"] * 0.1)\r
            assert f"{total:,}" in body\r
        len(paths)\r
      hints:\r
        - "Beta Inc 두 줄 추가. 예: 'Beta Inc,A,1,10000\\\\nBeta Inc,B,2,20000\\\\n'."\r
    check:\r
      noError: "마지막 줄 줄바꿈."\r
      resultCheck: "출력 3."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    subtitle: "통합 강의에서 가장 흔한 함정"\r
    goal: "데이터·폰트·검증 3축에서 가장 흔한 함정을 한 자리에서 차단한다."\r
    why: "통합 강의는 한 군데서 막히면 전체가 멈춥니다. 함정을 사전에 알면 디버깅 시간이 0이 됩니다."\r
    explanation: |-\r
      함정1 (데이터): CSV 인코딩이 EUC-KR이면 한글이 깨집니다. 항상 UTF-8 명시. 함정2 (폰트): 한글 폰트가 시스템에 없으면 폴백 폰트로 한글이 □가 됩니다. 06강 헬퍼가 명확한 에러 메시지로 안내. 함정3 (검증): f-string {:,} 포맷은 정수만 동작합니다. float이면 소수점이 따라옵니다.\r
    tips:\r
      - "회계 데이터는 항상 정수(원 단위)로 다루세요. 소수점은 표시 단계에서만 처리."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      import pandas as pd\r
\r
      workdir = TemporaryDirectory()\r
      csvPath = Path(workdir.name) / "ko.csv"\r
      csvPath.write_text("name,amount\\nCodaro Lab,300000\\nAcme Corp,150000\\n", encoding="utf-8")\r
\r
      df = pd.read_csv(csvPath, encoding="utf-8")\r
      assert df["amount"].dtype.kind in ("i", "u")\r
      [f"{value:,}" for value in df["amount"]]\r
    exercise:\r
      prompt: "amount를 [300000, 150000, 75000]으로 3행 만든 뒤 천 단위 구분자 문자열 리스트를 만드세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        import pandas as pd\r
\r
        workdir = TemporaryDirectory()\r
        csvPath = Path(workdir.name) / "ko.csv"\r
        csvPath.write_text("name,amount\\nA,300000\\nB,150000\\nC,___\\n", encoding="utf-8")\r
        df = pd.read_csv(csvPath, encoding="utf-8")\r
        [f"{value:,}" for value in df["amount"]]\r
      hints:\r
        - "정수 75000."\r
    check:\r
      noError: "정수만 {:,} 포맷."\r
      resultCheck: "리스트에 '75,000' 포함."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "회사 양식에 맞는 청구서 생성기"\r
    goal: "본인 회사 양식에 맞춘 청구서 생성기로 확장한다."\r
    why: "본 강의의 출력물은 학습용 청구서입니다. 실무 이전에 본인 양식으로 한 번 확장해보는 게 자동화 적용의 첫 단추입니다."\r
    explanation: |-\r
      미션은 본 강의 buildInvoice를 가져와 사업자등록번호, 청구일, 결제 계좌, 회사 직인 자리를 추가한 회사 청구서 생성 함수를 만드는 것입니다.\r
    tips:\r
      - "직인은 이미지 파일이 있으면 Image flowable로, 없으면 직인 자리를 빈 박스로 그려둡니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib import colors\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수 시그니처: buildCompanyInvoice(path, invoice, company) -> Path"\r
        - "company dict: {name, biz_no, address, account, issue_date}"\r
    check:\r
      noError: "함수 정의 + 호출 + PdfReader 검증."\r
      resultCheck: "본문에 회사명, 사업자번호, 청구일, 합계가 모두 포함."\r
    blocks:\r
      - type: tip\r
        content: "회사 정보는 함수마다 전달하는 대신 환경변수 또는 설정 파일에서 한 번 읽도록 분리하면 더 깔끔합니다."\r
      - type: expansion\r
        title: "미션: 회사 양식 청구서 생성기"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import sys\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.lib import colors\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.pdfbase import pdfmetrics\r
              from reportlab.pdfbase.ttfonts import TTFont\r
              from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle\r
\r
              def registerCompanyFont():\r
                  paths = {\r
                      "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                      "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
                      "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
                  }\r
                  for path in paths.get(sys.platform, []):\r
                      if Path(path).exists():\r
                          pdfmetrics.registerFont(TTFont("Korean", path))\r
                          return "Korean"\r
                  return "Helvetica"\r
\r
              def buildCompanyInvoice(path, invoice, company):\r
                  fontName = registerCompanyFont()\r
                  styles = getSampleStyleSheet()\r
                  for style in styles.byName.values():\r
                      style.fontName = fontName\r
                  subtotal = invoice["subtotal"]\r
                  vat = int(subtotal * 0.1)\r
                  total = subtotal + vat\r
\r
                  headerRows = [\r
                      ["공급자", company["name"], "사업자번호", company["biz_no"]],\r
                      ["주소", company["address"], "청구일", company["issue_date"]],\r
                      ["계좌", company["account"], "고객", invoice["customer"]],\r
                  ]\r
                  itemRows = [["품목", "수량", "단가", "금액"]]\r
                  for item in invoice["items"]:\r
                      itemRows.append([item["item"], str(item["qty"]), f"{item['unit_price']:,}", f"{item['amount']:,}"])\r
                  itemRows.append(["공급가액", "", "", f"{subtotal:,}"])\r
                  itemRows.append(["부가세", "", "", f"{vat:,}"])\r
                  itemRows.append(["합계", "", "", f"{total:,}"])\r
\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4, title=f"청구서 {invoice['customer']}")\r
                  doc.build([\r
                      Paragraph("청구서", styles["Title"]),\r
                      Spacer(1, 12),\r
                      Table(headerRows, colWidths=[80, 180, 80, 100], style=TableStyle([\r
                          ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),\r
                          ("BACKGROUND", (2, 0), (2, -1), colors.lightgrey),\r
                          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                      ])),\r
                      Spacer(1, 18),\r
                      Table(itemRows, colWidths=[180, 60, 100, 100], style=TableStyle([\r
                          ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),\r
                          ("GRID", (0, 0), (-1, -1), 0.5, colors.black),\r
                          ("ALIGN", (1, 0), (-1, -1), "RIGHT"),\r
                      ])),\r
                  ])\r
                  return Path(path)\r
\r
              missionDir = TemporaryDirectory()\r
              outPath = Path(missionDir.name) / "company_invoice.pdf"\r
              company = {\r
                  "name": "Codaro Inc.",\r
                  "biz_no": "123-45-67890",\r
                  "address": "Seoul Gangnam-gu",\r
                  "account": "Bank 1234-5678",\r
                  "issue_date": "2026-05-28",\r
              }\r
              invoice = {\r
                  "customer": "Acme Corp",\r
                  "items": [\r
                      {"item": "Subscription", "qty": 5, "unit_price": 50000, "amount": 250000},\r
                      {"item": "Support", "qty": 3, "unit_price": 30000, "amount": 90000},\r
                  ],\r
                  "subtotal": 340000,\r
              }\r
              buildCompanyInvoice(outPath, invoice, company)\r
              body = PdfReader(outPath).pages[0].extract_text() or ""\r
              for token in ["Codaro Inc.", "123-45-67890", "2026-05-28", "Acme Corp", "374,000"]:\r
                  assert token in body, f"missing {token}"\r
              body.strip().splitlines()[:5]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          본 트랙의 마무리 강의 응용 아이디어입니다. 한 가지를 골라 본인 업무에 적용해보세요.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "Email 트랙 10강과 결합 - 생성된 청구서 PDF를 고객별 메일로 자동 발송"\r
          - "08강 패턴 추가 - 청구서마다 'INTERNAL' 워터마크 + 비밀번호 (사외 공유용)"\r
          - "월별 디렉터리 자동 생성 (out/2026-05/, out/2026-06/)"\r
          - "결제 상태 dashboard 한 페이지 추가 (송장 발행 / 입금 완료 / 미수)"\r
          - "openpyxl 트랙과 결합 - 청구서 발행 로그를 xlsx 대시보드로 자동 정리"\r
          - "llmBasics 트랙과 결합 - 청구 내역 LLM 요약 코멘트를 청구서 상단에 자동 삽입"\r
`;export{e as default};