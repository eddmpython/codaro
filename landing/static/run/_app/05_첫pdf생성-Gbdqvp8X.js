var e=`meta:\r
  id: pdf_05\r
  title: 첫 PDF 생성\r
  order: 5\r
  category: pdf\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - reportlab\r
    - pypdf\r
  tags:\r
    - reportlab\r
    - Canvas\r
    - drawString\r
    - 페이지좌표\r
  outcomes:\r
    - automation.pdf.create\r
  prerequisites:\r
    - automation.pdf.read\r
  estimatedMinutes: 45\r
  seo:\r
    title: "reportlab Canvas - 첫 PDF 생성하기"\r
    description: "Canvas, drawString, setFont, showPage, save 5개 함수로 첫 PDF를 만든다. 좌하단 (0,0) 좌표계와 단위 pt를 손에 익힌다."\r
    keywords:\r
      - reportlab Canvas\r
      - drawString\r
      - PDF 좌표계\r
      - PDF 생성 입문\r
\r
intro:\r
  direction: "reportlab의 Canvas로 영문 텍스트가 들어간 한 페이지 PDF를 만든다. 좌표계와 폰트, 페이지 단위 모두를 손에 익히는 출발점이다."\r
  benefits:\r
    - "Canvas, drawString, setFont, showPage, save 다섯 함수로 PDF 생성 흐름 전체를 익힌다."\r
    - "PDF 좌표가 좌하단 (0,0) 기준이고 단위가 pt(1pt = 1/72 inch)라는 사실을 코드로 체감한다."\r
    - "06강 한글 폰트 등록의 기반 함수가 본 강의에서 만들어진다."\r
  diagram:\r
    steps:\r
      - label: "1. Canvas 생성"\r
        detail: "Canvas(str(path))로 PDF 작성용 객체를 만든다."\r
      - label: "2. drawString으로 텍스트"\r
        detail: "drawString(x, y, text)로 좌표 (x, y)에 텍스트를 그린다."\r
      - label: "3. setFont로 글꼴"\r
        detail: "setFont(name, size)로 폰트 패밀리·크기 변경."\r
      - label: "4. showPage + save"\r
        detail: "showPage로 페이지를 닫고 save로 PDF 파일을 저장."\r
    runtime:\r
      - label: "reportlab 기본 폰트"\r
        detail: "Helvetica가 기본. 한글은 06강에서 별도 등록."\r
      - label: "검증"\r
        detail: "PdfReader로 다시 열어 페이지 수와 추출 텍스트로 assert."\r
\r
sections:\r
  - id: step1_canvas\r
    title: "1단계. Canvas 만들고 한 줄 그리기"\r
    structuredPrimary: true\r
    subtitle: "Canvas, drawString, showPage, save"\r
    goal: "Hello PDF 한 줄이 들어간 한 페이지 PDF를 만든다."\r
    why: "사외 견적서, 사내 주간보고, 협력사 발주서 - 사무에서 만드는 모든 PDF는 결국 'Canvas 만들기 → 텍스트 그리기 → showPage → save' 네 동작의 변주입니다. 다섯 함수를 한 번에 손에 익히면 06강 한글 폰트, 07강 표·이미지, 10강 청구서 빌더까지 같은 형태로 자연스럽게 확장됩니다."\r
    explanation: |-\r
      Canvas(str(path)) 호출로 PDF 작성용 객체를 만들고, drawString(x, y, text)로 좌표에 문자열을 그립니다. showPage()는 현재 페이지를 닫고 다음 페이지를 시작합니다. 마지막에 save()를 호출해야 파일이 디스크에 쓰입니다.\r
    tips:\r
      - "showPage 없이 save하면 빈 PDF가 만들어질 수 있습니다. 페이지 단위로 showPage를 호출하는 습관을 들이세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "hello.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "Hello PDF")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text()\r
      "Hello PDF" in (body or "")\r
    exercise:\r
      prompt: "본문을 'Codaro PDF 005'로 바꾸고 추출 결과에 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "hello.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, ___)\r
        canvas.showPage()\r
        canvas.save()\r
\r
        body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        "Codaro" in body\r
      hints:\r
        - "문자열 따옴표 잊지 말 것."\r
    check:\r
      noError: "drawString 인자는 (x, y, text)."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_coordinate\r
    title: "2단계. PDF 좌표계 익히기"\r
    structuredPrimary: true\r
    subtitle: "좌하단 (0, 0), 단위 pt"\r
    goal: "같은 텍스트를 페이지의 네 모서리 가까이에 그려 좌표계를 손에 익힌다."\r
    why: "PDF 좌표계는 화면 좌표와 반대입니다. y가 올라가면 위로, 0이 바닥입니다. 첫 강의에서 좌표계를 정확히 잡지 않으면 이후 모든 강의에서 텍스트 위치가 어긋납니다."\r
    explanation: |-\r
      A4 페이지는 가로 595pt, 세로 842pt입니다. (72, 720)은 왼쪽 여백 1인치, 위에서 약 1.7인치 위치입니다. 네 모서리 가까이에 텍스트를 두면 좌표 감각이 잡힙니다.\r
    tips:\r
      - "여백을 명시적으로 inch 단위로 다루고 싶으면 reportlab.lib.units.inch를 사용합니다. 72pt = 1inch."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "corners.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(50, 800, "top-left")\r
      canvas.drawString(500, 800, "top-right")\r
      canvas.drawString(50, 30, "bottom-left")\r
      canvas.drawString(450, 30, "bottom-right")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      all(token in body for token in ["top-left", "top-right", "bottom-left", "bottom-right"])\r
    exercise:\r
      prompt: "페이지 중앙(약 (290, 420))에 'center' 텍스트를 추가하고 모든 라벨이 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "corners.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(50, 800, "top-left")\r
        canvas.drawString(500, 800, "top-right")\r
        canvas.drawString(50, 30, "bottom-left")\r
        canvas.drawString(450, 30, "bottom-right")\r
        canvas.drawString(___, ___, "center")\r
        canvas.showPage()\r
        canvas.save()\r
\r
        body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        "center" in body\r
      hints:\r
        - "정수 좌표 두 개."\r
    check:\r
      noError: "drawString 인자는 (x:float, y:float, text:str)."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_font\r
    title: "3단계. 폰트와 크기"\r
    structuredPrimary: true\r
    subtitle: "setFont(name, size)"\r
    goal: "Helvetica·Times-Roman·Courier 세 폰트를 같은 PDF에서 비교한다."\r
    why: "PDF 생성에서 폰트는 단순한 디자인이 아니라 가독성과 한글 지원 가능성을 결정하는 요소입니다. 기본 폰트가 어떤 것인지부터 손에 익혀야 합니다."\r
    explanation: |-\r
      reportlab 기본 PDF 폰트는 Helvetica·Times-Roman·Courier 세 가족이 모든 PDF 뷰어에 임베드 없이 보입니다. 한글은 이 셋 모두에서 깨집니다. 06강에서 TTFont 등록으로 한글을 해결합니다.\r
    tips:\r
      - "setFont는 그 시점 이후의 drawString에만 적용됩니다. 폰트별로 영역을 나눠 호출하세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "fonts.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.setFont("Helvetica", 14)\r
      canvas.drawString(72, 750, "Helvetica 14pt")\r
      canvas.setFont("Times-Roman", 18)\r
      canvas.drawString(72, 720, "Times 18pt")\r
      canvas.setFont("Courier", 10)\r
      canvas.drawString(72, 690, "Courier 10pt")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      all(name in body for name in ["Helvetica", "Times", "Courier"])\r
    exercise:\r
      prompt: "Courier-Bold 폰트로 한 줄 더 추가하고 결과를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "fonts.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.setFont("Helvetica", 14)\r
        canvas.drawString(72, 750, "Helvetica 14pt")\r
        canvas.setFont("Times-Roman", 18)\r
        canvas.drawString(72, 720, "Times 18pt")\r
        canvas.setFont("Courier", 10)\r
        canvas.drawString(72, 690, "Courier 10pt")\r
        canvas.setFont(___, 12)\r
        canvas.drawString(72, 660, "Courier-Bold 12pt")\r
        canvas.showPage()\r
        canvas.save()\r
        "Courier-Bold" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "폰트명 문자열은 'Courier-Bold'."\r
    check:\r
      noError: "setFont 인자는 (str, float)."\r
      resultCheck: "True 출력."\r
\r
  - id: step4_multi_page\r
    title: "4단계. 여러 페이지"\r
    structuredPrimary: true\r
    subtitle: "showPage 한 번 = 한 페이지"\r
    goal: "5페이지 PDF를 만들고 각 페이지에 다른 본문을 그린다."\r
    why: "보고서·청구서는 거의 모두 여러 페이지입니다. showPage의 의미를 정확히 잡고 페이지별 본문 패턴을 익히는 게 10강 청구서 생성기의 기반입니다."\r
    explanation: |-\r
      showPage 호출 시 현재 페이지가 닫히고 새 빈 페이지가 시작됩니다. 페이지마다 setFont도 다시 호출해야 일관성이 유지됩니다.\r
    tips:\r
      - "마지막 페이지 뒤에 showPage를 한 번 더 부를 필요는 없지만, 일관성을 위해 호출하는 것이 안전합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "five.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      for idx in range(5):\r
          canvas.setFont("Helvetica", 16)\r
          canvas.drawString(72, 720, f"section {idx + 1}")\r
          canvas.showPage()\r
      canvas.save()\r
\r
      len(PdfReader(pdfPath).pages)\r
    exercise:\r
      prompt: "페이지 수를 7로 늘리고 각 페이지에 'page X of 7' 본문을 그리세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "seven.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        total = ___\r
        for idx in range(total):\r
            canvas.setFont("Helvetica", 14)\r
            canvas.drawString(72, 720, f"page {idx + 1} of {total}")\r
            canvas.showPage()\r
        canvas.save()\r
        len(PdfReader(pdfPath).pages)\r
      hints:\r
        - "total 정수 7."\r
    check:\r
      noError: "f-string 안 변수가 정의되어야 합니다."\r
      resultCheck: "출력이 7."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 생성 → 재오픈 단위 assert"\r
    structuredPrimary: true\r
    subtitle: "페이지 수 + 본문 키워드 통합 검증"\r
    goal: "함수로 만든 PDF의 페이지 수와 모든 페이지 본문 키워드를 한 셀에서 검증한다."\r
    why: "PDF 생성에서 자동 검증은 디자인 회귀를 잡는 안전망입니다. 텍스트가 빠지거나 페이지가 누락되는 사고가 가장 흔합니다."\r
    explanation: |-\r
      buildReport(path, sections)이 sections 리스트의 각 항목을 한 페이지에 그리고 저장합니다. 결과를 PdfReader로 다시 열어 모든 섹션 제목이 본문에 들어있는지 한 묶음으로 검증합니다.\r
    tips:\r
      - "함수 인자로 sections 리스트를 받으면 데이터 driven 생성이 됩니다. 10강 청구서 생성기의 기본 형태입니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildReport(path, sections):\r
          canvas = Canvas(str(path))\r
          for title in sections:\r
              canvas.setFont("Helvetica", 16)\r
              canvas.drawString(72, 720, title)\r
              canvas.showPage()\r
          canvas.save()\r
\r
      vault = TemporaryDirectory()\r
      pdfPath = Path(vault.name) / "rpt.pdf"\r
      titles = ["Summary", "Sales", "Cost", "Outlook"]\r
      buildReport(pdfPath, titles)\r
\r
      reader = PdfReader(pdfPath)\r
      assert len(reader.pages) == 4\r
      bodies = [page.extract_text() or "" for page in reader.pages]\r
      for idx, title in enumerate(titles):\r
          assert title in bodies[idx], f"missing on page {idx + 1}"\r
      [body.strip() for body in bodies]\r
    exercise:\r
      prompt: "buildReport 함수의 본문을 직접 작성하세요. sections 리스트의 각 항목을 한 페이지에 16pt 폰트로 그리고 showPage로 닫은 뒤 마지막에 save해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildReport(path, sections):\r
            canvas = Canvas(str(path))\r
            ___  # 각 title을 한 페이지에 그리고 showPage, 마지막에 save\r
\r
        vault = TemporaryDirectory()\r
        pdfPath = Path(vault.name) / "rpt.pdf"\r
        titles = ["Summary", "Sales", "Cost", "Outlook", "Action"]\r
        buildReport(pdfPath, titles)\r
        reader = PdfReader(pdfPath)\r
        assert len(reader.pages) == 5\r
        bodies = [p.extract_text() or "" for p in reader.pages]\r
        for idx, title in enumerate(titles):\r
            assert title in bodies[idx]\r
        len(reader.pages)\r
      hints:\r
        - "for title in sections: canvas.setFont('Helvetica', 16); canvas.drawString(72, 720, title); canvas.showPage()"\r
        - "루프 끝나면 canvas.save()."\r
    check:\r
      noError: "리스트 원소는 모두 문자열."\r
      resultCheck: "출력 5."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "y 좌표는 위가 큰 값, save 빼먹기"\r
    goal: "PDF 좌표계와 save 호출 누락이라는 두 함정을 차단한다."\r
    why: "PDF 좌표 함정으로 텍스트가 페이지 밖으로 사라지는 사고가 가장 흔합니다. save 누락은 빈 파일을 만듭니다."\r
    explanation: |-\r
      y=0은 페이지 바닥, y=842는 A4 페이지 꼭대기입니다. 화면 좌표 감각으로 작은 y에 쓰면 텍스트가 아래쪽에 그려집니다. save를 호출하지 않으면 파일이 생기지 않거나 빈 파일이 됩니다.\r
    tips:\r
      - "함수에서 PDF를 만들 때 save를 finally 블록에 두는 패턴도 안전합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def safeBuild(path, text):\r
          canvas = Canvas(str(path))\r
          try:\r
              canvas.drawString(72, 720, text)\r
              canvas.showPage()\r
          finally:\r
              canvas.save()\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "safe.pdf"\r
      safeBuild(pdfPath, "always saved")\r
      pdfPath.stat().st_size > 0\r
    exercise:\r
      prompt: "safeBuild 안에 try/finally 패턴을 그대로 유지하고, text 인자를 'Codaro safe'로 전달하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def safeBuild(path, text):\r
            canvas = Canvas(str(path))\r
            try:\r
                canvas.drawString(72, 720, text)\r
                canvas.showPage()\r
            finally:\r
                canvas.save()\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "safe.pdf"\r
        safeBuild(pdfPath, ___)\r
        "Codaro safe" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "문자열 'Codaro safe'."\r
    check:\r
      noError: "safeBuild 호출 인자는 (path, str)."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "데이터 → PDF 변환 함수"\r
    goal: "데이터 리스트로부터 PDF를 만드는 작은 함수 두 개를 작성한다."\r
    why: "데이터에서 PDF를 만드는 함수를 직접 작성해야 10강 청구서 생성기의 흐름이 자연스럽습니다."\r
    explanation: |-\r
      미션1은 문자열 리스트를 받아 줄바꿈으로 그려 한 페이지 PDF를 만드는 함수, 미션2는 dict 리스트를 받아 각 dict를 한 페이지로 만드는 함수입니다.\r
    tips:\r
      - "변수 prefix: list*(미션1), dict*(미션2)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        ___\r
      hints:\r
        - "미션1: linesToPdf(path, lines) -> Path"\r
        - "미션2: dictsToPdf(path, items) -> Path"\r
    check:\r
      noError: "두 함수가 모두 정의되어야 합니다."\r
      resultCheck: "두 함수의 PDF 결과가 페이지 수와 본문 키워드로 통과해야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "함수가 PdfPath를 돌려주는 패턴은 호출자가 후속 검증을 쉽게 합니다."\r
      - type: expansion\r
        title: "미션1: 문자열 리스트 → 한 페이지 PDF"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def linesToPdf(path, lines):\r
                  canvas = Canvas(str(path))\r
                  yPos = 750\r
                  for line in lines:\r
                      canvas.drawString(72, yPos, line)\r
                      yPos -= 20\r
                  canvas.showPage()\r
                  canvas.save()\r
                  return Path(path)\r
\r
              listDir = TemporaryDirectory()\r
              listPath = Path(listDir.name) / "lines.pdf"\r
              linesToPdf(listPath, ["alpha", "beta", "gamma"])\r
              body = PdfReader(listPath).pages[0].extract_text() or ""\r
              assert all(token in body for token in ["alpha", "beta", "gamma"])\r
              [line for line in body.splitlines() if line.strip()]\r
      - type: expansion\r
        title: "미션2: dict 리스트 → 다중 페이지 PDF"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def dictsToPdf(path, items):\r
                  canvas = Canvas(str(path))\r
                  for entry in items:\r
                      yPos = 750\r
                      for key, value in entry.items():\r
                          canvas.drawString(72, yPos, f"{key}: {value}")\r
                          yPos -= 20\r
                      canvas.showPage()\r
                  canvas.save()\r
                  return Path(path)\r
\r
              dictDir = TemporaryDirectory()\r
              dictPath = Path(dictDir.name) / "dicts.pdf"\r
              dictsToPdf(dictPath, [\r
                  {"name": "Kim", "role": "manager"},\r
                  {"name": "Park", "role": "lead"},\r
              ])\r
              reader = PdfReader(dictPath)\r
              assert len(reader.pages) == 2\r
              firstBody = reader.pages[0].extract_text() or ""\r
              assert "Kim" in firstBody and "manager" in firstBody\r
              [page.extract_text().splitlines()[0] for page in reader.pages]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          첫 PDF 생성 패턴의 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "출장 보고서 양식을 데이터 dict로 받아 PDF로 출력"\r
          - "체크리스트 PDF 자동 생성 (할일 → 한 페이지)"\r
          - "QR 코드 페이지를 reportlab.graphics.barcode로 추가"\r
          - "한 PDF에 표지 + 본문 + 부록 섹션을 함수로 분리해 조합"\r
          - "06강 한글 폰트로 본 강의 흐름을 그대로 한글화"\r
`;export{e as default};