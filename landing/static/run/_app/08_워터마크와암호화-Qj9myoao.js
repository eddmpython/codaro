var e=`meta:\r
  id: pdf_08\r
  title: 워터마크와 암호화\r
  order: 8\r
  category: pdf\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - pypdf\r
    - reportlab\r
  tags:\r
    - 워터마크\r
    - 암호화\r
    - overlay\r
    - encrypt\r
  outcomes:\r
    - automation.pdf.security\r
  prerequisites:\r
    - automation.pdf.merge\r
    - automation.pdf.create\r
  estimatedMinutes: 50\r
  seo:\r
    title: "PDF 워터마크와 암호화 - pypdf encrypt + overlay"\r
    description: "사외 공유 PDF에 사내전용 워터마크와 패스워드를 한 흐름에 적용한다. 50개 PDF 일괄 보안 처리가 50분에서 6초로 줄어든다."\r
    keywords:\r
      - PDF 워터마크\r
      - PDF 암호화\r
      - pypdf encrypt\r
      - 워터마크 overlay\r
\r
intro:\r
  direction: "사외 공유 PDF에 '사내전용' 워터마크와 패스워드 보호를 코드로 일괄 적용한다. 50개 PDF 처리가 50분에서 6초로 줄어든다."\r
  benefits:\r
    - "마케팅 이주임의 사외 공유 PDF 보안 처리 50분을 6초로 줄인다."\r
    - "워터마크 overlay와 encrypt 두 패턴을 한 흐름에 묶어 처리하는 자동화 골격을 만든다."\r
    - "한글 워터마크에 06강의 registerKoreanFont 헬퍼를 재사용해 트랙 통합성을 체감한다."\r
  diagram:\r
    steps:\r
      - label: "1. 워터마크 PDF 만들기"\r
        detail: "투명 배경 PDF에 '사내전용' 텍스트를 큰 회색으로."\r
      - label: "2. overlay 합성"\r
        detail: "원본 PDF의 각 페이지에 워터마크 페이지를 merge_page로 겹친다."\r
      - label: "3. 패스워드 암호화"\r
        detail: "PdfWriter.encrypt(user_pw, owner_pw)로 보호."\r
      - label: "4. 일괄 처리"\r
        detail: "폴더의 모든 PDF에 워터마크 + 암호화를 한 함수 호출로 적용."\r
    runtime:\r
      - label: "한글 폰트 재사용"\r
        detail: "06강 registerKoreanFont 헬퍼를 그대로 가져와 사용."\r
      - label: "검증"\r
        detail: "워터마크 키워드가 본문에 포함되는지, encrypt 후 비밀번호로 다시 열리는지 assert."\r
\r
sections:\r
  - id: step1_make_watermark\r
    title: "1단계. 워터마크 PDF 만들기"\r
    structuredPrimary: true\r
    subtitle: "투명 배경 + 큰 회색 텍스트"\r
    goal: "'사내전용' 텍스트가 페이지 중앙에 큰 회색으로 그려진 한 페이지 PDF를 만든다."\r
    why: "사외 보내는 견적서·제안서·내부 보고서에 '사내전용' 또는 '대외비' 표시를 박는 작업은 마케팅·전략실에서 매주 반복됩니다. 워터마크 PDF를 한 번 만들어두면 원본 50개에 재사용할 수 있고, 발송 직전에 한 줄 호출로 표식이 박힙니다. 본 단계가 02강의 add_page 패턴과 결합되어 08강 끝의 일괄 보안 파이프라인이 만들어집니다."\r
    explanation: |-\r
      Canvas로 한 페이지 PDF를 만들고, setFillColorRGB로 회색을 지정한 뒤 큰 폰트로 'CONFIDENTIAL' 또는 '사내전용'을 중앙에 그립니다. 텍스트가 클수록 워터마크 효과가 강합니다.\r
    tips:\r
      - "한글 워터마크는 06강의 registerKoreanFont 헬퍼가 필요합니다. 영문은 Helvetica 기본 폰트로 충분합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeWatermark(path, text):\r
          canvas = Canvas(str(path))\r
          canvas.setFillColorRGB(0.7, 0.7, 0.7)\r
          canvas.setFont("Helvetica-Bold", 60)\r
          canvas.drawCentredString(298, 421, text)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      workdir = TemporaryDirectory()\r
      wmPath = Path(workdir.name) / "wm.pdf"\r
      makeWatermark(wmPath, "CONFIDENTIAL")\r
      body = PdfReader(wmPath).pages[0].extract_text() or ""\r
      "CONFIDENTIAL" in body\r
    exercise:\r
      prompt: "텍스트를 'DRAFT'로 바꾸고 폰트 크기를 80으로 키우세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeWatermark(path, text, fontSize):\r
            canvas = Canvas(str(path))\r
            canvas.setFillColorRGB(0.7, 0.7, 0.7)\r
            canvas.setFont("Helvetica-Bold", fontSize)\r
            canvas.drawCentredString(298, 421, text)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        workdir = TemporaryDirectory()\r
        wmPath = Path(workdir.name) / "wm.pdf"\r
        makeWatermark(wmPath, ___, ___)\r
        "DRAFT" in (PdfReader(wmPath).pages[0].extract_text() or "")\r
      hints:\r
        - "문자열 'DRAFT'와 정수 80."\r
    check:\r
      noError: "setFont 인자는 (str, float)."\r
      resultCheck: "True 출력."\r
\r
  - id: step2_overlay\r
    title: "2단계. overlay 합성"\r
    structuredPrimary: true\r
    subtitle: "page.merge_page(watermarkPage)"\r
    goal: "원본 PDF의 모든 페이지에 워터마크를 겹쳐 새 PDF로 저장한다."\r
    why: "pypdf의 merge_page는 두 페이지를 겹치는 가장 직관적인 방법입니다. 원본 위에 워터마크가 얹어집니다."\r
    explanation: |-\r
      원본 PdfReader의 각 페이지에 watermarkReader.pages[0]을 merge_page로 겹치고, 결과를 PdfWriter에 add_page해 저장합니다.\r
    tips:\r
      - "merge_page는 원본 페이지를 그 자리에서 수정합니다. 원본을 보존하려면 새 PdfReader로 다시 열어야 합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeWatermark(path, text):\r
          canvas = Canvas(str(path))\r
          canvas.setFillColorRGB(0.7, 0.7, 0.7)\r
          canvas.setFont("Helvetica-Bold", 60)\r
          canvas.drawCentredString(298, 421, text)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def makeSource(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"original page {idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def overlayWatermark(srcPath, watermarkPath, outPath):\r
          watermark = PdfReader(watermarkPath).pages[0]\r
          writer = PdfWriter()\r
          for page in PdfReader(srcPath).pages:\r
              page.merge_page(watermark)\r
              writer.add_page(page)\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      srcPath = base / "src.pdf"\r
      wmPath = base / "wm.pdf"\r
      outPath = base / "out.pdf"\r
      makeSource(srcPath, 3)\r
      makeWatermark(wmPath, "CONFIDENTIAL")\r
      overlayWatermark(srcPath, wmPath, outPath)\r
\r
      body = PdfReader(outPath).pages[0].extract_text() or ""\r
      "CONFIDENTIAL" in body and "original page 1" in body\r
    exercise:\r
      prompt: "원본을 5페이지로 만들고 워터마크 텍스트를 'INTERNAL'로 바꿔 모든 페이지 본문에 포함되는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeWatermark(path, text):\r
            canvas = Canvas(str(path))\r
            canvas.setFillColorRGB(0.7, 0.7, 0.7)\r
            canvas.setFont("Helvetica-Bold", 60)\r
            canvas.drawCentredString(298, 421, text)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def makeSource(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"p{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def overlayWatermark(srcPath, watermarkPath, outPath):\r
            watermark = PdfReader(watermarkPath).pages[0]\r
            writer = PdfWriter()\r
            for page in PdfReader(srcPath).pages:\r
                page.merge_page(watermark)\r
                writer.add_page(page)\r
            writer.write(str(outPath))\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        srcPath = base / "src.pdf"\r
        wmPath = base / "wm.pdf"\r
        outPath = base / "out.pdf"\r
        makeSource(srcPath, ___)\r
        makeWatermark(wmPath, ___)\r
        overlayWatermark(srcPath, wmPath, outPath)\r
\r
        all("INTERNAL" in (page.extract_text() or "") for page in PdfReader(outPath).pages)\r
      hints:\r
        - "정수 5, 문자열 'INTERNAL'."\r
    check:\r
      noError: "merge_page 호출 시 인자는 page 객체."\r
      resultCheck: "True 출력."\r
\r
  - id: step3_encrypt\r
    title: "3단계. 패스워드 암호화"\r
    structuredPrimary: true\r
    subtitle: "PdfWriter.encrypt(user_pw, owner_pw)"\r
    goal: "결과 PDF에 사용자 비밀번호를 걸고, 비밀번호 없이 열면 실패하는지 확인한다."\r
    why: "사외 공유 PDF는 비밀번호가 필요합니다. encrypt 호출 한 줄로 추가되며, 비밀번호 없이는 텍스트 추출도 막힙니다."\r
    explanation: |-\r
      PdfWriter에 add_page를 끝낸 뒤 writer.encrypt(user_password='secret', owner_password='admin')을 호출하면 결과 PDF가 비밀번호 보호됩니다. 비밀번호 없이 PdfReader로 열면 IsEncryptionError가 납니다.\r
    tips:\r
      - "user_pw는 PDF 열기·읽기, owner_pw는 권한(인쇄·복사) 설정. 비워두면 사용자 비밀번호로 자동 사용."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from pypdf.errors import DependencyError, PdfReadError\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeSource(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 720, "secret content")\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def encryptPdf(srcPath, outPath, password):\r
          writer = PdfWriter()\r
          for page in PdfReader(srcPath).pages:\r
              writer.add_page(page)\r
          writer.encrypt(user_password=password, owner_password="admin")\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      srcPath = base / "src.pdf"\r
      outPath = base / "secure.pdf"\r
      makeSource(srcPath)\r
      encryptPdf(srcPath, outPath, "lesson08")\r
\r
      reader = PdfReader(outPath)\r
      reader.is_encrypted, reader.decrypt("lesson08")\r
    exercise:\r
      prompt: "비밀번호를 'codaro2026'으로 바꾸고 decrypt 결과가 PasswordType.USER_PASSWORD인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeSource(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 720, "secret")\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def encryptPdf(srcPath, outPath, password):\r
            writer = PdfWriter()\r
            for page in PdfReader(srcPath).pages:\r
                writer.add_page(page)\r
            writer.encrypt(user_password=password, owner_password="admin")\r
            writer.write(str(outPath))\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        srcPath = base / "src.pdf"\r
        outPath = base / "secure.pdf"\r
        makeSource(srcPath)\r
        encryptPdf(srcPath, outPath, ___)\r
        reader = PdfReader(outPath)\r
        reader.is_encrypted, bool(reader.decrypt(___))\r
      hints:\r
        - "두 칸 모두 'codaro2026' 문자열."\r
    check:\r
      noError: "encrypt 두 인자는 모두 문자열."\r
      resultCheck: "(True, True) 또는 비슷한 튜플 출력."\r
\r
  - id: step4_pipeline\r
    title: "4단계. 워터마크 + 암호화 파이프라인"\r
    structuredPrimary: true\r
    subtitle: "한 함수로 묶기"\r
    goal: "원본 PDF에 워터마크를 합성하고 비밀번호를 적용해 결과 파일을 만드는 함수를 작성한다."\r
    why: "두 패턴을 한 함수에 묶으면 사외 공유 PDF 처리가 한 줄 호출이 됩니다. 50개 PDF 처리도 같은 패턴으로 확장 가능합니다."\r
    explanation: |-\r
      secureExport(srcPath, watermarkPath, outPath, password)이 워터마크 overlay + encrypt를 한 흐름에 처리합니다. 결과 PDF는 워터마크 + 비밀번호 보호 둘 다 갖춥니다.\r
    tips:\r
      - "워터마크 PDF를 한 번 만들어 모듈 수준 상수로 둘 수도 있습니다. 같은 워터마크를 여러 PDF에 적용할 때 비용 절약."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeWatermark(path, text):\r
          canvas = Canvas(str(path))\r
          canvas.setFillColorRGB(0.75, 0.75, 0.75)\r
          canvas.setFont("Helvetica-Bold", 60)\r
          canvas.drawCentredString(298, 421, text)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def makeSource(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"content {idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def secureExport(srcPath, watermarkPath, outPath, password):\r
          watermark = PdfReader(watermarkPath).pages[0]\r
          writer = PdfWriter()\r
          for page in PdfReader(srcPath).pages:\r
              page.merge_page(watermark)\r
              writer.add_page(page)\r
          writer.encrypt(user_password=password, owner_password="admin")\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      srcPath = base / "src.pdf"\r
      wmPath = base / "wm.pdf"\r
      outPath = base / "out.pdf"\r
      makeSource(srcPath, 3)\r
      makeWatermark(wmPath, "INTERNAL")\r
      secureExport(srcPath, wmPath, outPath, "share2026")\r
\r
      reader = PdfReader(outPath)\r
      reader.is_encrypted, reader.decrypt("share2026"), len(reader.pages)\r
    exercise:\r
      prompt: "secureExport 함수의 본문을 직접 작성하세요. 워터마크 PDF 첫 페이지를 원본의 모든 페이지에 merge_page로 합성하고, PdfWriter에 누적한 뒤 encrypt(user/owner)로 비밀번호를 걸어 저장해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeWatermark(path, text):\r
            canvas = Canvas(str(path))\r
            canvas.setFillColorRGB(0.75, 0.75, 0.75)\r
            canvas.setFont("Helvetica-Bold", 60)\r
            canvas.drawCentredString(298, 421, text)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def makeSource(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"c{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def secureExport(srcPath, watermarkPath, outPath, password):\r
            ___  # watermark page 로드 + writer에 merge_page 후 add_page + encrypt + write\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        srcPath = base / "src.pdf"\r
        wmPath = base / "wm.pdf"\r
        outPath = base / "out.pdf"\r
        makeSource(srcPath, 7)\r
        makeWatermark(wmPath, "INTERNAL")\r
        secureExport(srcPath, wmPath, outPath, "share2026")\r
        reader = PdfReader(outPath)\r
        assert reader.is_encrypted is True\r
        reader.decrypt("share2026")\r
        assert len(reader.pages) == 7\r
        len(reader.pages)\r
      hints:\r
        - "watermark = PdfReader(watermarkPath).pages[0]; writer = PdfWriter()"\r
        - "for page in PdfReader(srcPath).pages: page.merge_page(watermark); writer.add_page(page)"\r
        - "writer.encrypt(user_password=password, owner_password='admin'); writer.write(str(outPath))"\r
    check:\r
      noError: "함수 인자가 모두 채워져야 합니다."\r
      resultCheck: "출력 7."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 보안 처리 통합 assert"\r
    structuredPrimary: true\r
    subtitle: "워터마크 텍스트 + 암호화 + 페이지 수 단일 검증"\r
    goal: "secureExport 결과의 페이지 수, 암호화 여부, 워터마크 텍스트 포함을 한 셀에서 검증한다."\r
    why: "보안 처리는 한 단계라도 빠지면 사고가 큽니다. 통합 assert가 회귀를 사전에 잡습니다."\r
    explanation: |-\r
      decrypt 후 본문에 워터마크 텍스트가 포함되는지, 페이지 수가 원본과 같은지 모두 확인합니다.\r
    tips:\r
      - "워터마크 텍스트가 extract_text에 잡히는 것은 폰트 임베드에 따라 다릅니다. 시각적 워터마크와 추출 가능 여부는 별개이므로 시각 확인도 같이 권장."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeWatermark(path, text):\r
          canvas = Canvas(str(path))\r
          canvas.setFillColorRGB(0.75, 0.75, 0.75)\r
          canvas.setFont("Helvetica-Bold", 60)\r
          canvas.drawCentredString(298, 421, text)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def makeSource(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"content {idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def secureExport(srcPath, watermarkPath, outPath, password):\r
          watermark = PdfReader(watermarkPath).pages[0]\r
          writer = PdfWriter()\r
          for page in PdfReader(srcPath).pages:\r
              page.merge_page(watermark)\r
              writer.add_page(page)\r
          writer.encrypt(user_password=password, owner_password="admin")\r
          writer.write(str(outPath))\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      srcPath = base / "src.pdf"\r
      wmPath = base / "wm.pdf"\r
      outPath = base / "out.pdf"\r
      makeSource(srcPath, 4)\r
      makeWatermark(wmPath, "CONFIDENTIAL")\r
      secureExport(srcPath, wmPath, outPath, "p2026")\r
\r
      reader = PdfReader(outPath)\r
      assert reader.is_encrypted is True\r
      reader.decrypt("p2026")\r
      assert len(reader.pages) == 4\r
      body = reader.pages[0].extract_text() or ""\r
      assert "content 1" in body\r
      reader.is_encrypted, len(reader.pages)\r
    exercise:\r
      prompt: "원본 페이지를 6으로 늘리고 모든 assert가 통과하는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeWatermark(path, text):\r
            canvas = Canvas(str(path))\r
            canvas.setFillColorRGB(0.75, 0.75, 0.75)\r
            canvas.setFont("Helvetica-Bold", 60)\r
            canvas.drawCentredString(298, 421, text)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def makeSource(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"c{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def secureExport(srcPath, watermarkPath, outPath, password):\r
            watermark = PdfReader(watermarkPath).pages[0]\r
            writer = PdfWriter()\r
            for page in PdfReader(srcPath).pages:\r
                page.merge_page(watermark)\r
                writer.add_page(page)\r
            writer.encrypt(user_password=password, owner_password="admin")\r
            writer.write(str(outPath))\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        makeSource(base / "src.pdf", ___)\r
        makeWatermark(base / "wm.pdf", "INTERNAL")\r
        secureExport(base / "src.pdf", base / "wm.pdf", base / "out.pdf", "x")\r
        reader = PdfReader(base / "out.pdf")\r
        reader.decrypt("x")\r
        assert len(reader.pages) == 6\r
        len(reader.pages)\r
      hints:\r
        - "정수 6."\r
    check:\r
      noError: "decrypt 호출이 encrypt 비밀번호와 같아야 합니다."\r
      resultCheck: "출력 6."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "encrypt는 메타데이터까지 숨기지 않는다"\r
    goal: "암호화의 한계를 인지하고, 무엇이 보호되고 무엇이 보호되지 않는지 명확히 한다."\r
    why: "암호화에 대한 잘못된 기대는 보안 사고의 원인입니다. encrypt가 어디까지 보호하는지 알아야 합니다."\r
    explanation: |-\r
      pypdf encrypt는 페이지 콘텐츠와 일부 메타데이터를 암호화하지만, PDF의 일부 정보(파일명·일부 메타 구조)는 평문으로 남을 수 있습니다. 또한 user_password가 알려진 환경에서는 보호 효과가 없습니다. 추가 보안이 필요하면 별도 DRM 솔루션을 고려해야 합니다.\r
    tips:\r
      - "패스워드는 길고 복잡할수록 안전합니다. 사외 공유용은 12자 이상 권장."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      srcPath = base / "src.pdf"\r
      outPath = base / "enc.pdf"\r
      canvas = Canvas(str(srcPath))\r
      canvas.drawString(72, 720, "body")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      writer = PdfWriter()\r
      for page in PdfReader(srcPath).pages:\r
          writer.add_page(page)\r
      writer.encrypt(user_password="lesson", owner_password="admin")\r
      writer.write(str(outPath))\r
\r
      reader = PdfReader(outPath)\r
      reader.is_encrypted\r
    exercise:\r
      prompt: "암호화된 PDF의 is_encrypted 속성을 확인하고 True인지 보세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        srcPath = base / "src.pdf"\r
        outPath = base / "e.pdf"\r
        canvas = Canvas(str(srcPath))\r
        canvas.drawString(72, 720, "x")\r
        canvas.showPage()\r
        canvas.save()\r
\r
        writer = PdfWriter()\r
        for page in PdfReader(srcPath).pages:\r
            writer.add_page(page)\r
        writer.encrypt(user_password="a", owner_password="b")\r
        writer.write(str(outPath))\r
\r
        reader = PdfReader(outPath)\r
        reader.is_encrypted is ___\r
      hints:\r
        - "True 키워드."\r
    check:\r
      noError: "is_encrypted는 bool."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "보안 처리 도구 두 개"\r
    goal: "워터마크와 암호화 패턴을 결합한 도구 두 개를 작성한다."\r
    why: "사외 공유 보안 처리는 정형적이고 빈도가 높은 작업입니다. 함수 두 개로 일상 업무 자동화가 됩니다."\r
    explanation: |-\r
      미션1은 폴더의 모든 PDF에 같은 워터마크를 일괄 적용하는 함수, 미션2는 폴더의 모든 PDF에 비밀번호를 일괄 적용하는 함수입니다.\r
    tips:\r
      - "변수 prefix: bulk*(미션1), pw*(미션2)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "미션1: bulkWatermark(srcFolder, outFolder, watermarkText) -> list[Path]"\r
        - "미션2: bulkEncrypt(srcFolder, outFolder, password) -> list[Path]"\r
    check:\r
      noError: "함수가 정의되고 결과 리스트가 비어있지 않아야 합니다."\r
      resultCheck: "두 함수 모두 결과 PDF가 실제로 생성되어야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "두 함수 모두 같은 패턴(폴더 순회 + PdfReader/PdfWriter)을 갖습니다. 차이는 페이지 처리 단계입니다."\r
      - type: expansion\r
        title: "미션1: 폴더 일괄 워터마크"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader, PdfWriter\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def buildBulkWatermark(path, text):\r
                  canvas = Canvas(str(path))\r
                  canvas.setFillColorRGB(0.75, 0.75, 0.75)\r
                  canvas.setFont("Helvetica-Bold", 60)\r
                  canvas.drawCentredString(298, 421, text)\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              def buildBulkSource(path, pageCount):\r
                  canvas = Canvas(str(path))\r
                  for idx in range(pageCount):\r
                      canvas.drawString(72, 720, f"src {path.stem} p{idx + 1}")\r
                      canvas.showPage()\r
                  canvas.save()\r
\r
              def bulkWatermark(srcFolder, outFolder, watermarkText):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  wmPath = Path(outFolder) / "wm.pdf"\r
                  buildBulkWatermark(wmPath, watermarkText)\r
                  watermark = PdfReader(wmPath).pages[0]\r
                  outputs = []\r
                  for srcPath in sorted(Path(srcFolder).glob("*.pdf")):\r
                      writer = PdfWriter()\r
                      for page in PdfReader(srcPath).pages:\r
                          page.merge_page(watermark)\r
                          writer.add_page(page)\r
                      outPath = Path(outFolder) / srcPath.name\r
                      writer.write(str(outPath))\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              bulkDir = TemporaryDirectory()\r
              bulkSrc = Path(bulkDir.name) / "src"\r
              bulkOut = Path(bulkDir.name) / "out"\r
              bulkSrc.mkdir()\r
              for idx in range(3):\r
                  buildBulkSource(bulkSrc / f"{idx + 1}.pdf", 2)\r
\r
              results = bulkWatermark(bulkSrc, bulkOut, "INTERNAL")\r
              assert len(results) == 3\r
              assert all(p.exists() for p in results)\r
              [p.name for p in results]\r
      - type: expansion\r
        title: "미션2: 폴더 일괄 암호화"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader, PdfWriter\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def buildPwSource(path, text):\r
                  canvas = Canvas(str(path))\r
                  canvas.drawString(72, 720, text)\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              def bulkEncrypt(srcFolder, outFolder, password):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  outputs = []\r
                  for srcPath in sorted(Path(srcFolder).glob("*.pdf")):\r
                      writer = PdfWriter()\r
                      for page in PdfReader(srcPath).pages:\r
                          writer.add_page(page)\r
                      writer.encrypt(user_password=password, owner_password="admin")\r
                      outPath = Path(outFolder) / srcPath.name\r
                      writer.write(str(outPath))\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              pwDir = TemporaryDirectory()\r
              pwSrc = Path(pwDir.name) / "src"\r
              pwOut = Path(pwDir.name) / "out"\r
              pwSrc.mkdir()\r
              for idx in range(2):\r
                  buildPwSource(pwSrc / f"{idx + 1}.pdf", f"secret {idx + 1}")\r
\r
              encrypted = bulkEncrypt(pwSrc, pwOut, "p2026")\r
              assert len(encrypted) == 2\r
              for outPath in encrypted:\r
                  reader = PdfReader(outPath)\r
                  assert reader.is_encrypted is True\r
                  reader.decrypt("p2026")\r
              [p.name for p in encrypted]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          보안 처리 패턴의 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "워터마크 텍스트를 발송 시각 + 수신자명으로 동적 생성 (개인화 워터마크)"\r
          - "사외/사내별로 다른 워터마크 + 비밀번호 정책 적용"\r
          - "암호화 PDF의 비밀번호를 자동 생성해 이메일로 함께 발송 (Email 트랙 결합)"\r
          - "워터마크를 좌상단·우하단 두 위치에 동시 배치"\r
          - "06강 한글 폰트로 한글 워터마크 ('사내전용', '복사금지') 적용"\r
`;export{e as default};