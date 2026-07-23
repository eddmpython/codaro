var e=`meta:\r
  id: pdf_06\r
  title: 한글 폰트와 스타일\r
  order: 6\r
  category: pdf\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - reportlab\r
    - pypdf\r
  tags:\r
    - 한글폰트\r
    - TTFont\r
    - Paragraph\r
    - getSampleStyleSheet\r
  outcomes:\r
    - automation.pdf.create\r
  prerequisites:\r
    - automation.pdf.create\r
  estimatedMinutes: 55\r
  seo:\r
    title: "reportlab 한글 PDF - TTFont 등록과 Paragraph 스타일"\r
    description: "한글이 □로 깨지는 PDF를 시스템 폰트 등록으로 해결한다. OS별 폴백 헬퍼와 Paragraph·getSampleStyleSheet로 단락 스타일까지 다룬다."\r
    keywords:\r
      - reportlab 한글\r
      - TTFont 등록\r
      - Paragraph 스타일\r
      - 한글 PDF 폰트 폴백\r
\r
intro:\r
  direction: "reportlab 기본 폰트는 한글이 □로 깨진다. 시스템에 설치된 한글 폰트를 OS별로 찾아 등록하는 헬퍼를 만들고, Paragraph로 단락 스타일까지 다룬다."\r
  benefits:\r
    - "Windows·macOS·Linux 어디서든 같은 함수 호출로 한글 PDF가 나온다."\r
    - "한 번 만든 registerKoreanFont 헬퍼를 06·07·08·10에서 모두 재사용한다."\r
    - "Paragraph와 getSampleStyleSheet로 줄바꿈 자동 처리와 단락 스타일을 함께 익힌다."\r
  diagram:\r
    steps:\r
      - label: "1. registerKoreanFont 헬퍼"\r
        detail: "sys.platform 분기로 시스템 한글 폰트를 찾고 TTFont로 등록한다."\r
      - label: "2. drawString으로 한글"\r
        detail: "등록한 폰트로 setFont 후 한글 본문 그리기."\r
      - label: "3. Paragraph + Style"\r
        detail: "긴 문장의 자동 줄바꿈은 Paragraph가, 정렬·색·여백은 ParagraphStyle이 처리."\r
      - label: "4. getSampleStyleSheet 재사용"\r
        detail: "기본 스타일 라이브러리에 한글 폰트만 갈아끼워 빠르게 보고서 표지를 만든다."\r
    runtime:\r
      - label: "시스템 폰트 의존"\r
        detail: "Windows 맑은 고딕, macOS AppleSDGothicNeo, Linux NanumGothic 중 첫 발견을 사용. 저장소에 .ttf 미동봉."\r
      - label: "재오픈 검증"\r
        detail: "PdfReader로 다시 열어 한글 본문이 깨지지 않고 추출되는지 assert."\r
\r
sections:\r
  - id: step1_register\r
    title: "1단계. registerKoreanFont 헬퍼"\r
    structuredPrimary: true\r
    subtitle: "sys.platform 분기 + pdfmetrics.registerFont"\r
    goal: "OS별로 시스템 한글 폰트를 찾아 'Korean' 이름으로 등록하는 헬퍼를 만든다."\r
    why: "월간보고서, 청구서, 정부 공문, 사내 결재 문서 - 한국에서 만드는 거의 모든 PDF는 한글이 본문입니다. reportlab 기본 폰트로 한글을 그리면 □로 깨지는데, 한 번 만든 registerKoreanFont 헬퍼가 OS를 가리지 않고 같은 함수 호출로 그 문제를 끝냅니다. 06~10강 다섯 강의가 이 헬퍼 한 줄 위에서 돌아가므로 가장 먼저, 가장 정확히 손에 익혀야 합니다."\r
    explanation: |-\r
      sys.platform이 'win32'면 맑은 고딕, 'darwin'이면 AppleSDGothicNeo, 'linux'면 NanumGothic 후보 경로를 순회합니다. 첫 발견된 파일을 TTFont로 등록하고 이름 'Korean'을 돌려줍니다. 모두 못 찾으면 명확한 FileNotFoundError를 발생시킵니다.\r
    tips:\r
      - "Linux에 폰트가 없으면 apt install fonts-nanum 명령으로 설치. 학습자가 메시지에서 정확한 해결책을 볼 수 있어야 합니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
\r
      def registerKoreanFont():\r
          candidates = {\r
              "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
              "darwin": [\r
                  "/System/Library/Fonts/AppleSDGothicNeo.ttc",\r
                  "/Library/Fonts/AppleSDGothicNeo.ttc",\r
              ],\r
              "linux": [\r
                  "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",\r
                  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",\r
              ],\r
          }\r
          for path in candidates.get(sys.platform, []):\r
              if Path(path).exists():\r
                  pdfmetrics.registerFont(TTFont("Korean", path))\r
                  return "Korean"\r
          raise FileNotFoundError(\r
              "한글 폰트를 찾지 못했습니다. Linux는 'apt install fonts-nanum', "\r
              "Windows·macOS는 기본 폰트 사용."\r
          )\r
\r
      try:\r
          fontName = registerKoreanFont()\r
      except FileNotFoundError as exc:\r
          fontName = None\r
      fontName\r
    exercise:\r
      prompt: "registerKoreanFont 함수의 본문을 직접 작성하세요. candidates에서 현재 OS(sys.platform)에 맞는 경로 리스트를 가져와, 존재하는 첫 파일을 TTFont('Korean', path)로 등록하고 'Korean' 문자열을 돌려줘야 합니다. 모두 못 찾으면 FileNotFoundError를 raise합니다."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
\r
        def registerKoreanFont():\r
            candidates = {\r
                "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                "darwin": [\r
                    "/System/Library/Fonts/AppleSDGothicNeo.ttc",\r
                    "/Library/Fonts/AppleSDGothicNeo.ttc",\r
                ],\r
                "linux": [\r
                    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",\r
                    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",\r
                ],\r
            }\r
            ___  # 후보 경로 순회 + 존재 확인 + TTFont 등록 + 'Korean' 반환, 모두 실패 시 FileNotFoundError\r
\r
        try:\r
            fontName = registerKoreanFont()\r
        except FileNotFoundError:\r
            fontName = None\r
        assert fontName in ("Korean", None)\r
        fontName\r
      hints:\r
        - "for path in candidates.get(sys.platform, []): if Path(path).exists(): pdfmetrics.registerFont(TTFont('Korean', path)); return 'Korean'"\r
        - "루프 끝나면 raise FileNotFoundError('한글 폰트 없음 - apt install fonts-nanum')."\r
    check:\r
      noError: "TTFont 등록 시 두 번째 인자는 파일 경로 문자열."\r
      resultCheck: "fontName이 'Korean' 또는 None."\r
\r
  - id: step2_korean_text\r
    title: "2단계. drawString으로 한글 본문"\r
    structuredPrimary: true\r
    subtitle: "setFont('Korean', size) + drawString"\r
    goal: "등록한 한글 폰트로 한글 본문이 들어간 PDF를 만든다."\r
    why: "헬퍼만 만들고 끝나면 의미가 없습니다. 실제 한글 본문이 PdfReader로 추출될 때 깨지지 않는지 확인하는 게 중요합니다."\r
    explanation: |-\r
      registerKoreanFont() 호출 후 setFont('Korean', 14)을 부르면 그 시점부터 drawString에 한글이 깨지지 않고 그려집니다.\r
    tips:\r
      - "폰트가 등록되지 않은 상태에서 drawString에 한글을 넘기면 PDF는 만들어지지만 본문이 □로 보입니다. PdfReader.extract_text 결과도 깨질 수 있습니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def registerKoreanFont():\r
          candidates = {\r
              "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
              "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
              "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
          }\r
          for path in candidates.get(sys.platform, []):\r
              if Path(path).exists():\r
                  pdfmetrics.registerFont(TTFont("Korean", path))\r
                  return "Korean"\r
          return None\r
\r
      fontName = registerKoreanFont() or "Helvetica"\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "ko.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.setFont(fontName, 14)\r
      canvas.drawString(72, 720, "월간 보고서")\r
      canvas.drawString(72, 700, "작성자: 김대리")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "월간" in body and "작성자" in body\r
    exercise:\r
      prompt: "한 줄을 더 그려 '부서: 회계팀' 본문을 추가하고 추출 결과에 '회계'가 포함되는지 확인하세요."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def registerKoreanFont():\r
            candidates = {\r
                "win32": [r"C:\\Windows\\Fonts\\malgun.ttf"],\r
                "darwin": ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],\r
                "linux": ["/usr/share/fonts/truetype/nanum/NanumGothic.ttf"],\r
            }\r
            for path in candidates.get(sys.platform, []):\r
                if Path(path).exists():\r
                    pdfmetrics.registerFont(TTFont("Korean", path))\r
                    return "Korean"\r
            return None\r
\r
        fontName = registerKoreanFont() or "Helvetica"\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "ko.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.setFont(fontName, 14)\r
        canvas.drawString(72, 720, "월간 보고서")\r
        canvas.drawString(72, 700, "작성자: 김대리")\r
        canvas.drawString(72, 680, ___)\r
        canvas.showPage()\r
        canvas.save()\r
        "회계" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "한글 문자열 '부서: 회계팀'."\r
    check:\r
      noError: "drawString 인자는 문자열."\r
      resultCheck: "True 출력 (시스템 폰트 있을 때)."\r
\r
  - id: step3_paragraph\r
    title: "3단계. Paragraph와 ParagraphStyle"\r
    structuredPrimary: true\r
    subtitle: "긴 문장 자동 줄바꿈"\r
    goal: "긴 한글 문장을 Paragraph로 그려 페이지 폭에 맞춰 자동 줄바꿈한다."\r
    why: "drawString은 줄바꿈을 직접 계산해야 합니다. Paragraph는 폭만 정해주면 자동으로 줄바꿈하므로 본문 단락 처리에 적합합니다."\r
    explanation: |-\r
      Paragraph(text, style)을 만들고 wrapOn으로 폭을 정한 뒤 drawOn으로 그립니다. ParagraphStyle은 이름·폰트·크기·줄간격·정렬을 한 객체에 묶습니다.\r
    tips:\r
      - "Paragraph는 SimpleDocTemplate.build의 flowable로도 쓸 수 있습니다. 07강에서 활용합니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.styles import ParagraphStyle\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.pdfgen.canvas import Canvas\r
      from reportlab.platypus import Paragraph\r
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
      fontName = registerKoreanFont()\r
\r
      style = ParagraphStyle(\r
          name="ko",\r
          fontName=fontName,\r
          fontSize=12,\r
          leading=18,\r
          alignment=0,\r
      )\r
      longText = (\r
          "Codaro의 PDF 자동화 트랙은 받은 PDF에서 텍스트와 표를 뽑고, "\r
          "새 PDF를 만들고, 묶고 자르고 잠그는 흐름을 로컬 Python 한 사이클로 끝냅니다."\r
      )\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "para.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      paragraph = Paragraph(longText, style)\r
      width, height = paragraph.wrapOn(canvas, 400, 200)\r
      paragraph.drawOn(canvas, 72, 720 - height)\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "PDF 자동화" in body\r
    exercise:\r
      prompt: "leading(줄간격) 값을 24로 늘리고 본문이 여전히 추출되는지 확인하세요."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib.styles import ParagraphStyle\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.pdfgen.canvas import Canvas\r
        from reportlab.platypus import Paragraph\r
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
        fontName = registerKoreanFont()\r
        style = ParagraphStyle(name="ko2", fontName=fontName, fontSize=12, leading=___, alignment=0)\r
        longText = "Codaro PDF 자동화 트랙 설명입니다."\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "p.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        paragraph = Paragraph(longText, style)\r
        width, height = paragraph.wrapOn(canvas, 400, 200)\r
        paragraph.drawOn(canvas, 72, 720 - height)\r
        canvas.showPage()\r
        canvas.save()\r
        "Codaro" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "정수 24."\r
    check:\r
      noError: "leading은 숫자."\r
      resultCheck: "True 출력."\r
\r
  - id: step4_sample_stylesheet\r
    title: "4단계. getSampleStyleSheet로 표지 만들기"\r
    structuredPrimary: true\r
    subtitle: "기본 스타일 갈아끼우기"\r
    goal: "표지 PDF를 Title·Heading1·BodyText 스타일로 그린다."\r
    why: "처음부터 ParagraphStyle을 일일이 만드는 건 비효율적입니다. 기본 스타일 라이브러리를 가져와 한글 폰트로 갈아끼우는 게 가장 빠릅니다."\r
    explanation: |-\r
      getSampleStyleSheet()는 Title, Heading1, BodyText 같은 기본 스타일을 반환합니다. style.fontName = 'Korean'으로 한 줄에 한글 폰트로 바꿉니다.\r
    tips:\r
      - "기본 스타일은 영어 권장 크기·줄간격으로 설정됩니다. 한글 표지는 조금 키우는 게 어울립니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
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
      fontName = registerKoreanFont()\r
      styles = getSampleStyleSheet()\r
      for style in styles.byName.values():\r
          style.fontName = fontName\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "cover.pdf"\r
      doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
      flow = [\r
          Paragraph("월간 보고서", styles["Title"]),\r
          Spacer(1, 24),\r
          Paragraph("2026년 5월", styles["Heading1"]),\r
          Spacer(1, 12),\r
          Paragraph("작성자: 회계팀 김대리", styles["BodyText"]),\r
      ]\r
      doc.build(flow)\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "월간 보고서" in body and "김대리" in body\r
    exercise:\r
      prompt: "부서명 'Heading2' 스타일로 한 줄 더 추가하세요."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
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
        fontName = registerKoreanFont()\r
        styles = getSampleStyleSheet()\r
        for style in styles.byName.values():\r
            style.fontName = fontName\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "cover.pdf"\r
        doc = SimpleDocTemplate(str(pdfPath), pagesize=A4)\r
        flow = [\r
            Paragraph("월간 보고서", styles["Title"]),\r
            Paragraph("재무회계실", styles[___]),\r
            Paragraph("작성자: 김대리", styles["BodyText"]),\r
        ]\r
        doc.build(flow)\r
        "재무회계실" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "스타일 이름 'Heading2'."\r
    check:\r
      noError: "styles 인덱싱은 정확한 이름."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 한글 본문 보존"\r
    structuredPrimary: true\r
    subtitle: "buildKoreanCover + PdfReader 비교"\r
    goal: "한글 표지 PDF를 만든 뒤 본문 한글이 추출에서 깨지지 않는지 단일 assert로 검증한다."\r
    why: "한글 PDF의 핵심 회귀는 본문이 깨지는 것입니다. assert 한 묶음이 폰트 등록 누락·깨진 폰트 사용을 자동으로 잡습니다."\r
    explanation: |-\r
      buildKoreanCover(path, title, author)이 표지 한 페이지를 만들고, 결과를 PdfReader로 다시 열어 title·author 두 단어가 모두 포함되는지 확인합니다.\r
    tips:\r
      - "한글 폰트가 시스템에 없는 환경(예: CI)에서는 'Helvetica'로 폴백되어 한글이 깨질 수 있습니다. 검증에서는 영문 문자열을 같이 그려두는 게 안전합니다."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate\r
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
      def buildKoreanCover(path, title, author):\r
          fontName = registerKoreanFont()\r
          styles = getSampleStyleSheet()\r
          for style in styles.byName.values():\r
              style.fontName = fontName\r
          doc = SimpleDocTemplate(str(path), pagesize=A4)\r
          doc.build([\r
              Paragraph(title, styles["Title"]),\r
              Paragraph(f"author: {author}", styles["BodyText"]),\r
          ])\r
\r
      vault = TemporaryDirectory()\r
      pdfPath = Path(vault.name) / "verify.pdf"\r
      buildKoreanCover(pdfPath, "월간 보고서", "Kim")\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      assert "Kim" in body\r
      assert "author" in body\r
      body\r
    exercise:\r
      prompt: "buildKoreanCover에 'department' 영문 키도 본문에 그려, 검증에 추가하세요."\r
      starterCode: |-\r
        import sys\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.lib.pagesizes import A4\r
        from reportlab.lib.styles import getSampleStyleSheet\r
        from reportlab.pdfbase import pdfmetrics\r
        from reportlab.pdfbase.ttfonts import TTFont\r
        from reportlab.platypus import Paragraph, SimpleDocTemplate\r
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
        def buildKoreanCover(path, title, author, department):\r
            fontName = registerKoreanFont()\r
            styles = getSampleStyleSheet()\r
            for style in styles.byName.values():\r
                style.fontName = fontName\r
            doc = SimpleDocTemplate(str(path), pagesize=A4)\r
            doc.build([\r
                Paragraph(title, styles["Title"]),\r
                Paragraph(f"author: {author}", styles["BodyText"]),\r
                Paragraph(f"department: {department}", styles["BodyText"]),\r
            ])\r
\r
        vault = TemporaryDirectory()\r
        pdfPath = Path(vault.name) / "verify.pdf"\r
        buildKoreanCover(pdfPath, "월간 보고서", "Kim", ___)\r
        body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        assert "department" in body\r
        body\r
      hints:\r
        - "영문 문자열 'finance' 같은 단어."\r
    check:\r
      noError: "함수 인자는 4개."\r
      resultCheck: "본문 문자열이 출력되어야 합니다."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "폰트 미등록 = PDF 만들기는 됨, 추출은 깨짐"\r
    goal: "한글이 깨졌을 때 사용자가 잘못된 곳을 보지 않게 한다."\r
    why: "한글 PDF가 시각적으로 □로 보이는 게 가장 흔한 사고입니다. PDF 자체가 망가진 게 아니라 폰트 등록을 안 한 것뿐입니다."\r
    explanation: |-\r
      등록 없이 setFont('Helvetica')로 한글 drawString을 호출하면 PDF는 생성되지만 한글이 ASCII 폴백 또는 □로 표시됩니다. PdfReader.extract_text 결과에도 깨진 문자가 나옵니다. 해결은 단 한 줄, registerKoreanFont() 호출입니다.\r
    tips:\r
      - "PDF가 안 깨진 것 같은데 추출이 깨지면 폰트 임베드는 됐지만 텍스트 매핑(ToUnicode)이 누락된 경우입니다. 06강 헬퍼는 임베드와 매핑을 모두 처리합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "broken.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.setFont("Helvetica", 14)\r
      canvas.drawString(72, 720, "Hello - ASCII OK")\r
      canvas.showPage()\r
      canvas.save()\r
      body = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      "ASCII OK" in body\r
    exercise:\r
      prompt: "본문을 'ASCII fine'으로 바꾸고 추출에 그대로 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "broken.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.setFont("Helvetica", 14)\r
        canvas.drawString(72, 720, ___)\r
        canvas.showPage()\r
        canvas.save()\r
        "ASCII fine" in (PdfReader(pdfPath).pages[0].extract_text() or "")\r
      hints:\r
        - "영문 문자열 'ASCII fine'."\r
    check:\r
      noError: "drawString 인자는 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "한글 표지 + 본문 단락"\r
    goal: "헬퍼 + Paragraph 패턴으로 실용 PDF 두 개를 직접 만든다."\r
    why: "헬퍼를 한 번 만들고 끝나는 게 아니라, 직접 PDF에 호출해봐야 후속 강의에서 자연스럽게 재사용됩니다."\r
    explanation: |-\r
      미션1은 회사 표지 PDF(회사명·부서·날짜), 미션2는 긴 본문 단락(자동 줄바꿈)이 들어간 보고서 본문 PDF입니다.\r
    tips:\r
      - "변수 prefix: cover*(미션1), body*(미션2)."\r
    snippet: |-\r
      import sys\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.lib.pagesizes import A4\r
      from reportlab.lib.styles import getSampleStyleSheet\r
      from reportlab.pdfbase import pdfmetrics\r
      from reportlab.pdfbase.ttfonts import TTFont\r
      from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "미션1: makeCompanyCover(path, company, dept, date) -> Path"\r
        - "미션2: makeLongBody(path, body) -> Path"\r
    check:\r
      noError: "헬퍼 호출과 함수 정의가 일관되어야 합니다."\r
      resultCheck: "두 결과 모두 PdfReader로 본문 키워드가 검출되어야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "registerKoreanFont는 같은 프로세스에서 여러 번 호출해도 안전합니다. 중복 등록은 reportlab이 알아서 처리합니다."\r
      - type: expansion\r
        title: "미션1: 회사 표지 PDF"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import sys\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.pdfbase import pdfmetrics\r
              from reportlab.pdfbase.ttfonts import TTFont\r
              from reportlab.platypus import Paragraph, SimpleDocTemplate\r
\r
              def registerCover():\r
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
              def makeCompanyCover(path, company, dept, date):\r
                  fontName = registerCover()\r
                  styles = getSampleStyleSheet()\r
                  for style in styles.byName.values():\r
                      style.fontName = fontName\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  doc.build([\r
                      Paragraph(company, styles["Title"]),\r
                      Paragraph(f"dept: {dept}", styles["Heading2"]),\r
                      Paragraph(f"date: {date}", styles["BodyText"]),\r
                  ])\r
                  return Path(path)\r
\r
              coverDir = TemporaryDirectory()\r
              coverPath = Path(coverDir.name) / "cover.pdf"\r
              makeCompanyCover(coverPath, "Codaro", "finance", "2026-05-28")\r
              body = PdfReader(coverPath).pages[0].extract_text() or ""\r
              assert "Codaro" in body and "finance" in body and "2026-05-28" in body\r
              body.strip().splitlines()\r
      - type: expansion\r
        title: "미션2: 긴 본문 단락 PDF"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              import sys\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.lib.pagesizes import A4\r
              from reportlab.lib.styles import getSampleStyleSheet\r
              from reportlab.pdfbase import pdfmetrics\r
              from reportlab.pdfbase.ttfonts import TTFont\r
              from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer\r
\r
              def registerBody():\r
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
              def makeLongBody(path, body):\r
                  fontName = registerBody()\r
                  styles = getSampleStyleSheet()\r
                  for style in styles.byName.values():\r
                      style.fontName = fontName\r
                  doc = SimpleDocTemplate(str(path), pagesize=A4)\r
                  doc.build([\r
                      Paragraph("body section", styles["Heading1"]),\r
                      Spacer(1, 12),\r
                      Paragraph(body, styles["BodyText"]),\r
                  ])\r
                  return Path(path)\r
\r
              bodyDir = TemporaryDirectory()\r
              bodyPath = Path(bodyDir.name) / "body.pdf"\r
              longText = (\r
                  "Codaro PDF lesson covers reading, extracting, generating, and securing PDFs in a single local Python cycle."\r
              )\r
              makeLongBody(bodyPath, longText)\r
              extracted = PdfReader(bodyPath).pages[0].extract_text() or ""\r
              assert "Codaro" in extracted\r
              extracted[:80]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          한글 폰트 헬퍼와 단락 스타일의 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "회사 양식의 색·여백·로고 위치를 BrandStyle 객체로 정의해 모든 보고서에 재사용"\r
          - "헬퍼에 굵은 폰트(NanumGothicBold) 추가 등록"\r
          - "다국어 PDF(영문 본문 + 한글 표지) 페이지별로 다른 폰트 적용"\r
          - "표지 + 목차 + 본문 + 부록을 함수로 분리해 SimpleDocTemplate 다중 빌드"\r
          - "Paragraph 스타일을 JSON 설정으로 외부화해 디자인 일관성 유지"\r
`;export{e as default};