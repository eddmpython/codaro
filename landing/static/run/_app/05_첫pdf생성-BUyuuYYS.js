var e=`meta:
  id: pdf_05
  title: 첫 PDF 생성
  order: 5
  category: pdf
  difficulty: ⭐⭐
  badge: 기초
  packages:
    - reportlab
    - pypdf
  tags:
    - reportlab
    - Canvas
    - drawString
    - 페이지좌표
  outcomes:
    - automation.pdf.create
  prerequisites:
    - automation.pdf.read
  estimatedMinutes: 45
  seo:
    title: "reportlab Canvas - 첫 PDF 생성하기"
    description: "Canvas, drawString, setFont, showPage, save 5개 함수로 첫 PDF를 만든다. 좌하단 (0,0) 좌표계와 단위 pt를 손에 익힌다."
    keywords:
      - reportlab Canvas
      - drawString
      - PDF 좌표계
      - PDF 생성 입문

intro:
  direction: "reportlab의 Canvas로 영문 텍스트가 들어간 한 페이지 PDF를 만든다. 좌표계와 폰트, 페이지 단위 모두를 손에 익히는 출발점이다."
  benefits:
    - "Canvas, drawString, setFont, showPage, save 다섯 함수로 PDF 생성 흐름 전체를 익힌다."
    - "PDF 좌표가 좌하단 (0,0) 기준이고 단위가 pt(1pt = 1/72 inch)라는 사실을 코드로 체감한다."
    - "06강 한글 폰트 등록의 기반 함수가 본 강의에서 만들어진다."
  diagram:
    steps:
      - label: "1. Canvas 생성"
        detail: "Canvas(str(path))로 PDF 작성용 객체를 만든다."
      - label: "2. drawString으로 텍스트"
        detail: "drawString(x, y, text)로 좌표 (x, y)에 텍스트를 그린다."
      - label: "3. setFont로 글꼴"
        detail: "setFont(name, size)로 폰트 패밀리·크기 변경."
      - label: "4. showPage + save"
        detail: "showPage로 페이지를 닫고 save로 PDF 파일을 저장."
    runtime:
      - label: "reportlab 기본 폰트"
        detail: "Helvetica가 기본. 한글은 06강에서 별도 등록."
      - label: "검증"
        detail: "PdfReader로 다시 열어 페이지 수와 추출 텍스트로 assert."

sections:
  - id: step1_canvas
    title: "1단계. Canvas 만들고 한 줄 그리기"
    structuredPrimary: true
    subtitle: "Canvas, drawString, showPage, save"
    goal: "Hello PDF 한 줄이 들어간 한 페이지 PDF를 만든다."
    why: "사외 견적서, 사내 주간보고, 협력사 발주서 - 사무에서 만드는 모든 PDF는 결국 'Canvas 만들기 → 텍스트 그리기 → showPage → save' 네 동작의 변주입니다. 다섯 함수를 한 번에 손에 익히면 06강 한글 폰트, 07강 표·이미지, 10강 청구서 빌더까지 같은 형태로 자연스럽게 확장됩니다."
    explanation: |-
      Canvas(str(path)) 호출로 PDF 작성용 객체를 만들고, drawString(x, y, text)로 좌표에 문자열을 그립니다. showPage()는 현재 페이지를 닫고 다음 페이지를 시작합니다. 마지막에 save()를 호출해야 파일이 디스크에 쓰입니다.
    tips:
      - "showPage 없이 save하면 빈 PDF가 만들어질 수 있습니다. 페이지 단위로 showPage를 호출하는 습관을 들이세요."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "hello.pdf"
      canvas = Canvas(str(pdfPath))
      canvas.drawString(72, 720, "Hello PDF")
      canvas.showPage()
      canvas.save()

      body = PdfReader(pdfPath).pages[0].extract_text()
      "Hello PDF" in (body or "")
    exercise:
      prompt: "본문을 'Codaro PDF 005'로 바꾸고 추출 결과에 포함되는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "hello.pdf"
        canvas = Canvas(str(pdfPath))
        canvas.drawString(72, 720, ___)
        canvas.showPage()
        canvas.save()

        body = PdfReader(pdfPath).pages[0].extract_text() or ""
        "Codaro" in body
      hints:
        - "문자열 따옴표 잊지 말 것."
    check:
      noError: "drawString 인자는 (x, y, text)."
      resultCheck: "True 출력."

  - id: step2_coordinate
    title: "2단계. PDF 좌표계 익히기"
    structuredPrimary: true
    subtitle: "좌하단 (0, 0), 단위 pt"
    goal: "같은 텍스트를 페이지의 네 모서리 가까이에 그려 좌표계를 손에 익힌다."
    why: "PDF 좌표계는 화면 좌표와 반대입니다. y가 올라가면 위로, 0이 바닥입니다. 첫 강의에서 좌표계를 정확히 잡지 않으면 이후 모든 강의에서 텍스트 위치가 어긋납니다."
    explanation: |-
      A4 페이지는 가로 595pt, 세로 842pt입니다. (72, 720)은 왼쪽 여백 1인치, 위에서 약 1.7인치 위치입니다. 네 모서리 가까이에 텍스트를 두면 좌표 감각이 잡힙니다.
    tips:
      - "여백을 명시적으로 inch 단위로 다루고 싶으면 reportlab.lib.units.inch를 사용합니다. 72pt = 1inch."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "corners.pdf"
      canvas = Canvas(str(pdfPath))
      canvas.drawString(50, 800, "top-left")
      canvas.drawString(500, 800, "top-right")
      canvas.drawString(50, 30, "bottom-left")
      canvas.drawString(450, 30, "bottom-right")
      canvas.showPage()
      canvas.save()

      body = PdfReader(pdfPath).pages[0].extract_text() or ""
      all(token in body for token in ["top-left", "top-right", "bottom-left", "bottom-right"])
    exercise:
      prompt: "페이지 중앙(약 (290, 420))에 'center' 텍스트를 추가하고 모든 라벨이 포함되는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "corners.pdf"
        canvas = Canvas(str(pdfPath))
        canvas.drawString(50, 800, "top-left")
        canvas.drawString(500, 800, "top-right")
        canvas.drawString(50, 30, "bottom-left")
        canvas.drawString(450, 30, "bottom-right")
        canvas.drawString(___, ___, "center")
        canvas.showPage()
        canvas.save()

        body = PdfReader(pdfPath).pages[0].extract_text() or ""
        "center" in body
      hints:
        - "정수 좌표 두 개."
    check:
      noError: "drawString 인자는 (x:float, y:float, text:str)."
      resultCheck: "True 출력."

  - id: step3_font
    title: "3단계. 폰트와 크기"
    structuredPrimary: true
    subtitle: "setFont(name, size)"
    goal: "Helvetica·Times-Roman·Courier 세 폰트를 같은 PDF에서 비교한다."
    why: "PDF 생성에서 폰트는 단순한 디자인이 아니라 가독성과 한글 지원 가능성을 결정하는 요소입니다. 기본 폰트가 어떤 것인지부터 손에 익혀야 합니다."
    explanation: |-
      reportlab 기본 PDF 폰트는 Helvetica·Times-Roman·Courier 세 가족이 모든 PDF 뷰어에 임베드 없이 보입니다. 한글은 이 셋 모두에서 깨집니다. 06강에서 TTFont 등록으로 한글을 해결합니다.
    tips:
      - "setFont는 그 시점 이후의 drawString에만 적용됩니다. 폰트별로 영역을 나눠 호출하세요."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "fonts.pdf"
      canvas = Canvas(str(pdfPath))
      canvas.setFont("Helvetica", 14)
      canvas.drawString(72, 750, "Helvetica 14pt")
      canvas.setFont("Times-Roman", 18)
      canvas.drawString(72, 720, "Times 18pt")
      canvas.setFont("Courier", 10)
      canvas.drawString(72, 690, "Courier 10pt")
      canvas.showPage()
      canvas.save()

      body = PdfReader(pdfPath).pages[0].extract_text() or ""
      all(name in body for name in ["Helvetica", "Times", "Courier"])
    exercise:
      prompt: "Courier-Bold 폰트로 한 줄 더 추가하고 결과를 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "fonts.pdf"
        canvas = Canvas(str(pdfPath))
        canvas.setFont("Helvetica", 14)
        canvas.drawString(72, 750, "Helvetica 14pt")
        canvas.setFont("Times-Roman", 18)
        canvas.drawString(72, 720, "Times 18pt")
        canvas.setFont("Courier", 10)
        canvas.drawString(72, 690, "Courier 10pt")
        canvas.setFont(___, 12)
        canvas.drawString(72, 660, "Courier-Bold 12pt")
        canvas.showPage()
        canvas.save()
        "Courier-Bold" in (PdfReader(pdfPath).pages[0].extract_text() or "")
      hints:
        - "폰트명 문자열은 'Courier-Bold'."
    check:
      noError: "setFont 인자는 (str, float)."
      resultCheck: "True 출력."

  - id: step4_multi_page
    title: "4단계. 여러 페이지"
    structuredPrimary: true
    subtitle: "showPage 한 번 = 한 페이지"
    goal: "5페이지 PDF를 만들고 각 페이지에 다른 본문을 그린다."
    why: "보고서·청구서는 거의 모두 여러 페이지입니다. showPage의 의미를 정확히 잡고 페이지별 본문 패턴을 익히는 게 10강 청구서 생성기의 기반입니다."
    explanation: |-
      showPage 호출 시 현재 페이지가 닫히고 새 빈 페이지가 시작됩니다. 페이지마다 setFont도 다시 호출해야 일관성이 유지됩니다.
    tips:
      - "마지막 페이지 뒤에 showPage를 한 번 더 부를 필요는 없지만, 일관성을 위해 호출하는 것이 안전합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "five.pdf"
      canvas = Canvas(str(pdfPath))
      for idx in range(5):
          canvas.setFont("Helvetica", 16)
          canvas.drawString(72, 720, f"section {idx + 1}")
          canvas.showPage()
      canvas.save()

      len(PdfReader(pdfPath).pages)
    exercise:
      prompt: "페이지 수를 7로 늘리고 각 페이지에 'page X of 7' 본문을 그리세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "seven.pdf"
        canvas = Canvas(str(pdfPath))
        total = ___
        for idx in range(total):
            canvas.setFont("Helvetica", 14)
            canvas.drawString(72, 720, f"page {idx + 1} of {total}")
            canvas.showPage()
        canvas.save()
        len(PdfReader(pdfPath).pages)
      hints:
        - "total 정수 7."
    check:
      noError: "f-string 안 변수가 정의되어야 합니다."
      resultCheck: "출력이 7."

  - id: validation
    title: "5단계. 검증 루프 - 생성 → 재오픈 단위 assert"
    structuredPrimary: true
    subtitle: "페이지 수 + 본문 키워드 통합 검증"
    goal: "함수로 만든 PDF의 페이지 수와 모든 페이지 본문 키워드를 한 셀에서 검증한다."
    why: "PDF 생성에서 자동 검증은 디자인 회귀를 잡는 안전망입니다. 텍스트가 빠지거나 페이지가 누락되는 사고가 가장 흔합니다."
    explanation: |-
      buildReport(path, sections)이 sections 리스트의 각 항목을 한 페이지에 그리고 저장합니다. 결과를 PdfReader로 다시 열어 모든 섹션 제목이 본문에 들어있는지 한 묶음으로 검증합니다.
    tips:
      - "함수 인자로 sections 리스트를 받으면 데이터 driven 생성이 됩니다. 10강 청구서 생성기의 기본 형태입니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def buildReport(path, sections):
          canvas = Canvas(str(path))
          for title in sections:
              canvas.setFont("Helvetica", 16)
              canvas.drawString(72, 720, title)
              canvas.showPage()
          canvas.save()

      vault = TemporaryDirectory()
      pdfPath = Path(vault.name) / "rpt.pdf"
      titles = ["Summary", "Sales", "Cost", "Outlook"]
      buildReport(pdfPath, titles)

      reader = PdfReader(pdfPath)
      assert len(reader.pages) == 4
      bodies = [page.extract_text() or "" for page in reader.pages]
      for idx, title in enumerate(titles):
          assert title in bodies[idx], f"missing on page {idx + 1}"
      [body.strip() for body in bodies]
    exercise:
      prompt: "buildReport 함수의 본문을 직접 작성하세요. sections 리스트의 각 항목을 한 페이지에 16pt 폰트로 그리고 showPage로 닫은 뒤 마지막에 save해야 합니다."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def buildReport(path, sections):
            canvas = Canvas(str(path))
            ___  # 각 title을 한 페이지에 그리고 showPage, 마지막에 save

        vault = TemporaryDirectory()
        pdfPath = Path(vault.name) / "rpt.pdf"
        titles = ["Summary", "Sales", "Cost", "Outlook", "Action"]
        buildReport(pdfPath, titles)
        reader = PdfReader(pdfPath)
        assert len(reader.pages) == 5
        bodies = [p.extract_text() or "" for p in reader.pages]
        for idx, title in enumerate(titles):
            assert title in bodies[idx]
        len(reader.pages)
      hints:
        - "for title in sections: canvas.setFont('Helvetica', 16); canvas.drawString(72, 720, title); canvas.showPage()"
        - "루프 끝나면 canvas.save()."
    check:
      noError: "리스트 원소는 모두 문자열."
      resultCheck: "출력 5."

  - id: misconception
    title: "6단계. 흔한 오개념 차단"
    subtitle: "y 좌표는 위가 큰 값, save 빼먹기"
    goal: "PDF 좌표계와 save 호출 누락이라는 두 함정을 차단한다."
    why: "PDF 좌표 함정으로 텍스트가 페이지 밖으로 사라지는 사고가 가장 흔합니다. save 누락은 빈 파일을 만듭니다."
    explanation: |-
      y=0은 페이지 바닥, y=842는 A4 페이지 꼭대기입니다. 화면 좌표 감각으로 작은 y에 쓰면 텍스트가 아래쪽에 그려집니다. save를 호출하지 않으면 파일이 생기지 않거나 빈 파일이 됩니다.
    tips:
      - "함수에서 PDF를 만들 때 save를 finally 블록에 두는 패턴도 안전합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def safeBuild(path, text):
          canvas = Canvas(str(path))
          try:
              canvas.drawString(72, 720, text)
              canvas.showPage()
          finally:
              canvas.save()

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "safe.pdf"
      safeBuild(pdfPath, "always saved")
      pdfPath.stat().st_size > 0
    exercise:
      prompt: "safeBuild 안에 try/finally 패턴을 그대로 유지하고, text 인자를 'Codaro safe'로 전달하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def safeBuild(path, text):
            canvas = Canvas(str(path))
            try:
                canvas.drawString(72, 720, text)
                canvas.showPage()
            finally:
                canvas.save()

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "safe.pdf"
        safeBuild(pdfPath, ___)
        "Codaro safe" in (PdfReader(pdfPath).pages[0].extract_text() or "")
      hints:
        - "문자열 'Codaro safe'."
    check:
      noError: "safeBuild 호출 인자는 (path, str)."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션 2개"
    subtitle: "데이터 → PDF 변환 함수"
    goal: "데이터 리스트로부터 PDF를 만드는 작은 함수 두 개를 작성한다."
    why: "데이터에서 PDF를 만드는 함수를 직접 작성해야 10강 청구서 생성기의 흐름이 자연스럽습니다."
    explanation: |-
      미션1은 문자열 리스트를 받아 줄바꿈으로 그려 한 페이지 PDF를 만드는 함수, 미션2는 dict 리스트를 받아 각 dict를 한 페이지로 만드는 함수입니다.
    tips:
      - "변수 prefix: list*(미션1), dict*(미션2)."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas
    exercise:
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        ___
      hints:
        - "미션1: linesToPdf(path, lines) -> Path"
        - "미션2: dictsToPdf(path, items) -> Path"
    check:
      noError: "두 함수가 모두 정의되어야 합니다."
      resultCheck: "두 함수의 PDF 결과가 페이지 수와 본문 키워드로 통과해야 합니다."
    blocks:
      - type: tip
        content: "함수가 PdfPath를 돌려주는 패턴은 호출자가 후속 검증을 쉽게 합니다."
      - type: expansion
        title: "미션1: 문자열 리스트 → 한 페이지 PDF"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader
              from reportlab.pdfgen.canvas import Canvas

              def linesToPdf(path, lines):
                  canvas = Canvas(str(path))
                  yPos = 750
                  for line in lines:
                      canvas.drawString(72, yPos, line)
                      yPos -= 20
                  canvas.showPage()
                  canvas.save()
                  return Path(path)

              listDir = TemporaryDirectory()
              listPath = Path(listDir.name) / "lines.pdf"
              linesToPdf(listPath, ["alpha", "beta", "gamma"])
              body = PdfReader(listPath).pages[0].extract_text() or ""
              assert all(token in body for token in ["alpha", "beta", "gamma"])
              [line for line in body.splitlines() if line.strip()]
      - type: expansion
        title: "미션2: dict 리스트 → 다중 페이지 PDF"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader
              from reportlab.pdfgen.canvas import Canvas

              def dictsToPdf(path, items):
                  canvas = Canvas(str(path))
                  for entry in items:
                      yPos = 750
                      for key, value in entry.items():
                          canvas.drawString(72, yPos, f"{key}: {value}")
                          yPos -= 20
                      canvas.showPage()
                  canvas.save()
                  return Path(path)

              dictDir = TemporaryDirectory()
              dictPath = Path(dictDir.name) / "dicts.pdf"
              dictsToPdf(dictPath, [
                  {"name": "Kim", "role": "manager"},
                  {"name": "Park", "role": "lead"},
              ])
              reader = PdfReader(dictPath)
              assert len(reader.pages) == 2
              firstBody = reader.pages[0].extract_text() or ""
              assert "Kim" in firstBody and "manager" in firstBody
              [page.extract_text().splitlines()[0] for page in reader.pages]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: text
        content: |-
          첫 PDF 생성 패턴의 응용 아이디어입니다.
      - type: list
        style: bullet
        items:
          - "출장 보고서 양식을 데이터 dict로 받아 PDF로 출력"
          - "체크리스트 PDF 자동 생성 (할일 → 한 페이지)"
          - "QR 코드 페이지를 reportlab.graphics.barcode로 추가"
          - "한 PDF에 표지 + 본문 + 부록 섹션을 함수로 분리해 조합"
          - "06강 한글 폰트로 본 강의 흐름을 그대로 한글화"
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
  - id: pdf_05-pdf-layout-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_canvas
    - extensions
    title: 첫 PDF의 page size·margin·content box 계획하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 양수 margin과 content 영역, block 높이 overflow를 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 페이지 크기와 margin에서 실제 content box를 먼저 계산하세요.
    - block height 합과 개별 width를 render 전에 검사하세요.
    exercise:
      prompt: audit_pdf_layout(page, blocks)를 완성하세요.
      starterCode: |-
        def audit_pdf_layout(page, blocks):
            raise NotImplementedError
      solution: |
        def audit_pdf_layout(page, blocks):
            margins = page["margins"]
            failures = []
            if any(margins[key] < 0 for key in ["top", "right", "bottom", "left"]):
                failures.append("margins")
            content_width = page["width"] - margins["left"] - margins["right"]
            content_height = page["height"] - margins["top"] - margins["bottom"]
            if content_width <= 0 or content_height <= 0:
                failures.append("content-box")
            used_height = sum(block["height"] for block in blocks)
            if used_height > content_height:
                failures.append("overflow")
            too_wide = sorted(block["id"] for block in blocks if block["width"] > content_width)
            if too_wide:
                failures.append("width")
            return {"accepted": not failures, "failures": failures, "contentBox": [content_width, content_height], "usedHeight": used_height, "tooWide": too_wide}
      hints: *id001
    check:
      id: python.pdf.pdf_05.pdf-layout-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_05.pdf-layout-plan.mastery.behavior.v1.fixture
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
        entry: audit_pdf_layout
        cases:
        - id: accepts-blocks-within-a4-box
          arguments:
          - value:
              width: 595
              height: 842
              margins:
                top: 50
                right: 50
                bottom: 50
                left: 50
          - value:
            - id: title
              width: 400
              height: 50
            - id: body
              width: 495
              height: 600
          expectedReturn:
            accepted: true
            failures: []
            contentBox:
            - 495
            - 742
            usedHeight: 650
            tooWide: []
        - id: reports-overflow-and-width
          arguments:
          - value:
              width: 100
              height: 100
              margins:
                top: 10
                right: 10
                bottom: 10
                left: 10
          - value:
            - id: block
              width: 90
              height: 90
          expectedReturn:
            accepted: false
            failures:
            - overflow
            - width
            contentBox:
            - 80
            - 80
            usedHeight: 90
            tooWide:
            - block
        - id: reports-invalid-content-box
          arguments:
          - value:
              width: 100
              height: 100
              margins:
                top: 60
                right: 60
                bottom: 60
                left: 60
          - value: []
          expectedReturn:
            accepted: false
            failures:
            - content-box
            - overflow
            contentBox:
            - -20
            - -20
            usedHeight: 0
            tooWide: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pdf_05-pdf-section-pagination-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_05-pdf-layout-plan-mastery
    title: 새 문서 section에 page break 계획 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: section을 content height 안에서 순서대로 배치하고 page별 사용량을 반환한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - section을 잘라 넣지 말고 page break 전에 높이를 계산하세요.
    - content height보다 큰 section은 별도 layout 전략 없이는 거부하세요.
    exercise:
      prompt: paginate_sections(sections, content_height)를 완성하세요.
      starterCode: |-
        def paginate_sections(sections, content_height):
            raise NotImplementedError
      solution: |
        def paginate_sections(sections, content_height):
            if content_height <= 0:
                raise ValueError("content height must be positive")
            pages = []
            current = {"sections": [], "usedHeight": 0}
            for section in sections:
                if section["height"] > content_height:
                    raise ValueError("section taller than page")
                if current["sections"] and current["usedHeight"] + section["height"] > content_height:
                    pages.append(current)
                    current = {"sections": [], "usedHeight": 0}
                current["sections"].append(section["id"])
                current["usedHeight"] += section["height"]
            if current["sections"]:
                pages.append(current)
            return {"pageCount": len(pages), "pages": pages}
      hints: *id002
    check:
      id: python.pdf.pdf_05.pdf-section-pagination.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_05.pdf-section-pagination.transfer.behavior.v1.fixture
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
        entry: paginate_sections
        cases:
        - id: paginates-three-sections
          arguments:
          - value:
            - id: a
              height: 40
            - id: b
              height: 60
            - id: c
              height: 20
          - value: 100
          expectedReturn:
            pageCount: 2
            pages:
            - sections:
              - a
              - b
              usedHeight: 100
            - sections:
              - c
              usedHeight: 20
        - id: handles-empty-document
          arguments:
          - value: []
          - value: 100
          expectedReturn:
            pageCount: 0
            pages: []
        - id: rejects-tall-section
          arguments:
          - value:
            - id: a
              height: 101
          - value: 100
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pdf_05-first-pdf-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_05-pdf-section-pagination-transfer
    title: 첫 PDF layout 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: page box·margin·block overflow·pagination 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.
    - Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.
    exercise:
      prompt: choose_pdf_layout_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_pdf_layout_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pdf_layout_evidence(situation):
            table = {'box': {'action': 'compute content box from page and margins', 'evidence': 'width height geometry', 'risk': 'negative space'}, 'blocks': {'action': 'measure block dimensions', 'evidence': 'used height and too-wide IDs', 'risk': 'clipping'}, 'pages': {'action': 'paginate whole sections', 'evidence': 'page section manifest', 'risk': 'split content'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pdf.pdf_05.first-pdf-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_05.first-pdf-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pdf_layout_evidence
        cases:
        - id: recalls-box
          arguments:
          - value: box
          expectedReturn:
            action: compute content box from page and margins
            evidence: width height geometry
            risk: negative space
        - id: recalls-blocks
          arguments:
          - value: blocks
          expectedReturn:
            action: measure block dimensions
            evidence: used height and too-wide IDs
            risk: clipping
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};