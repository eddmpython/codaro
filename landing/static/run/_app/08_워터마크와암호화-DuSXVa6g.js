var e=`meta:
  id: pdf_08
  title: 워터마크와 암호화
  order: 8
  category: pdf
  difficulty: ⭐⭐⭐
  badge: 중급
  packages:
    - pypdf
    - reportlab
  tags:
    - 워터마크
    - 암호화
    - overlay
    - encrypt
  outcomes:
    - automation.pdf.security
  prerequisites:
    - automation.pdf.merge
    - automation.pdf.create
  estimatedMinutes: 50
  seo:
    title: "PDF 워터마크와 암호화 - pypdf encrypt + overlay"
    description: "사외 공유 PDF에 사내전용 워터마크와 패스워드를 한 흐름에 적용한다. 50개 PDF 일괄 보안 처리가 50분에서 6초로 줄어든다."
    keywords:
      - PDF 워터마크
      - PDF 암호화
      - pypdf encrypt
      - 워터마크 overlay

intro:
  direction: "사외 공유 PDF에 '사내전용' 워터마크와 패스워드 보호를 코드로 일괄 적용한다. 50개 PDF 처리가 50분에서 6초로 줄어든다."
  benefits:
    - "마케팅 이주임의 사외 공유 PDF 보안 처리 50분을 6초로 줄인다."
    - "워터마크 overlay와 encrypt 두 패턴을 한 흐름에 묶어 처리하는 자동화 골격을 만든다."
    - "한글 워터마크에 06강의 registerKoreanFont 헬퍼를 재사용해 트랙 통합성을 체감한다."
  diagram:
    steps:
      - label: "1. 워터마크 PDF 만들기"
        detail: "투명 배경 PDF에 '사내전용' 텍스트를 큰 회색으로."
      - label: "2. overlay 합성"
        detail: "원본 PDF의 각 페이지에 워터마크 페이지를 merge_page로 겹친다."
      - label: "3. 패스워드 암호화"
        detail: "PdfWriter.encrypt(user_pw, owner_pw)로 보호."
      - label: "4. 일괄 처리"
        detail: "폴더의 모든 PDF에 워터마크 + 암호화를 한 함수 호출로 적용."
    runtime:
      - label: "한글 폰트 재사용"
        detail: "06강 registerKoreanFont 헬퍼를 그대로 가져와 사용."
      - label: "검증"
        detail: "워터마크 키워드가 본문에 포함되는지, encrypt 후 비밀번호로 다시 열리는지 assert."

sections:
  - id: step1_make_watermark
    title: "1단계. 워터마크 PDF 만들기"
    structuredPrimary: true
    subtitle: "투명 배경 + 큰 회색 텍스트"
    goal: "'사내전용' 텍스트가 페이지 중앙에 큰 회색으로 그려진 한 페이지 PDF를 만든다."
    why: "사외 보내는 견적서·제안서·내부 보고서에 '사내전용' 또는 '대외비' 표시를 박는 작업은 마케팅·전략실에서 매주 반복됩니다. 워터마크 PDF를 한 번 만들어두면 원본 50개에 재사용할 수 있고, 발송 직전에 한 줄 호출로 표식이 박힙니다. 본 단계가 02강의 add_page 패턴과 결합되어 08강 끝의 일괄 보안 파이프라인이 만들어집니다."
    explanation: |-
      Canvas로 한 페이지 PDF를 만들고, setFillColorRGB로 회색을 지정한 뒤 큰 폰트로 'CONFIDENTIAL' 또는 '사내전용'을 중앙에 그립니다. 텍스트가 클수록 워터마크 효과가 강합니다.
    tips:
      - "한글 워터마크는 06강의 registerKoreanFont 헬퍼가 필요합니다. 영문은 Helvetica 기본 폰트로 충분합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def makeWatermark(path, text):
          canvas = Canvas(str(path))
          canvas.setFillColorRGB(0.7, 0.7, 0.7)
          canvas.setFont("Helvetica-Bold", 60)
          canvas.drawCentredString(298, 421, text)
          canvas.showPage()
          canvas.save()

      workdir = TemporaryDirectory()
      wmPath = Path(workdir.name) / "wm.pdf"
      makeWatermark(wmPath, "CONFIDENTIAL")
      body = PdfReader(wmPath).pages[0].extract_text() or ""
      "CONFIDENTIAL" in body
    exercise:
      prompt: "텍스트를 'DRAFT'로 바꾸고 폰트 크기를 80으로 키우세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def makeWatermark(path, text, fontSize):
            canvas = Canvas(str(path))
            canvas.setFillColorRGB(0.7, 0.7, 0.7)
            canvas.setFont("Helvetica-Bold", fontSize)
            canvas.drawCentredString(298, 421, text)
            canvas.showPage()
            canvas.save()

        workdir = TemporaryDirectory()
        wmPath = Path(workdir.name) / "wm.pdf"
        makeWatermark(wmPath, ___, ___)
        "DRAFT" in (PdfReader(wmPath).pages[0].extract_text() or "")
      hints:
        - "문자열 'DRAFT'와 정수 80."
    check:
      noError: "setFont 인자는 (str, float)."
      resultCheck: "True 출력."

  - id: step2_overlay
    title: "2단계. overlay 합성"
    structuredPrimary: true
    subtitle: "page.merge_page(watermarkPage)"
    goal: "원본 PDF의 모든 페이지에 워터마크를 겹쳐 새 PDF로 저장한다."
    why: "pypdf의 merge_page는 두 페이지를 겹치는 가장 직관적인 방법입니다. 원본 위에 워터마크가 얹어집니다."
    explanation: |-
      원본 PdfReader의 각 페이지에 watermarkReader.pages[0]을 merge_page로 겹치고, 결과를 PdfWriter에 add_page해 저장합니다.
    tips:
      - "merge_page는 원본 페이지를 그 자리에서 수정합니다. 원본을 보존하려면 새 PdfReader로 다시 열어야 합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def makeWatermark(path, text):
          canvas = Canvas(str(path))
          canvas.setFillColorRGB(0.7, 0.7, 0.7)
          canvas.setFont("Helvetica-Bold", 60)
          canvas.drawCentredString(298, 421, text)
          canvas.showPage()
          canvas.save()

      def makeSource(path, pageCount):
          canvas = Canvas(str(path))
          for idx in range(pageCount):
              canvas.drawString(72, 720, f"original page {idx + 1}")
              canvas.showPage()
          canvas.save()

      def overlayWatermark(srcPath, watermarkPath, outPath):
          watermark = PdfReader(watermarkPath).pages[0]
          writer = PdfWriter()
          for page in PdfReader(srcPath).pages:
              page.merge_page(watermark)
              writer.add_page(page)
          writer.write(str(outPath))

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      srcPath = base / "src.pdf"
      wmPath = base / "wm.pdf"
      outPath = base / "out.pdf"
      makeSource(srcPath, 3)
      makeWatermark(wmPath, "CONFIDENTIAL")
      overlayWatermark(srcPath, wmPath, outPath)

      body = PdfReader(outPath).pages[0].extract_text() or ""
      "CONFIDENTIAL" in body and "original page 1" in body
    exercise:
      prompt: "원본을 5페이지로 만들고 워터마크 텍스트를 'INTERNAL'로 바꿔 모든 페이지 본문에 포함되는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def makeWatermark(path, text):
            canvas = Canvas(str(path))
            canvas.setFillColorRGB(0.7, 0.7, 0.7)
            canvas.setFont("Helvetica-Bold", 60)
            canvas.drawCentredString(298, 421, text)
            canvas.showPage()
            canvas.save()

        def makeSource(path, pageCount):
            canvas = Canvas(str(path))
            for idx in range(pageCount):
                canvas.drawString(72, 720, f"p{idx + 1}")
                canvas.showPage()
            canvas.save()

        def overlayWatermark(srcPath, watermarkPath, outPath):
            watermark = PdfReader(watermarkPath).pages[0]
            writer = PdfWriter()
            for page in PdfReader(srcPath).pages:
                page.merge_page(watermark)
                writer.add_page(page)
            writer.write(str(outPath))

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        srcPath = base / "src.pdf"
        wmPath = base / "wm.pdf"
        outPath = base / "out.pdf"
        makeSource(srcPath, ___)
        makeWatermark(wmPath, ___)
        overlayWatermark(srcPath, wmPath, outPath)

        all("INTERNAL" in (page.extract_text() or "") for page in PdfReader(outPath).pages)
      hints:
        - "정수 5, 문자열 'INTERNAL'."
    check:
      noError: "merge_page 호출 시 인자는 page 객체."
      resultCheck: "True 출력."

  - id: step3_encrypt
    title: "3단계. 패스워드 암호화"
    structuredPrimary: true
    subtitle: "PdfWriter.encrypt(user_pw, owner_pw)"
    goal: "결과 PDF에 사용자 비밀번호를 걸고, 비밀번호 없이 열면 실패하는지 확인한다."
    why: "사외 공유 PDF는 비밀번호가 필요합니다. encrypt 호출 한 줄로 추가되며, 비밀번호 없이는 텍스트 추출도 막힙니다."
    explanation: |-
      PdfWriter에 add_page를 끝낸 뒤 writer.encrypt(user_password='secret', owner_password='admin')을 호출하면 결과 PDF가 비밀번호 보호됩니다. 비밀번호 없이 PdfReader로 열면 IsEncryptionError가 납니다.
    tips:
      - "user_pw는 PDF 열기·읽기, owner_pw는 권한(인쇄·복사) 설정. 비워두면 사용자 비밀번호로 자동 사용."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from pypdf.errors import DependencyError, PdfReadError
      from reportlab.pdfgen.canvas import Canvas

      def makeSource(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 720, "secret content")
          canvas.showPage()
          canvas.save()

      def encryptPdf(srcPath, outPath, password):
          writer = PdfWriter()
          for page in PdfReader(srcPath).pages:
              writer.add_page(page)
          writer.encrypt(user_password=password, owner_password="admin")
          writer.write(str(outPath))

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      srcPath = base / "src.pdf"
      outPath = base / "secure.pdf"
      makeSource(srcPath)
      encryptPdf(srcPath, outPath, "lesson08")

      reader = PdfReader(outPath)
      reader.is_encrypted, reader.decrypt("lesson08")
    exercise:
      prompt: "비밀번호를 'codaro2026'으로 바꾸고 decrypt 결과가 PasswordType.USER_PASSWORD인지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def makeSource(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 720, "secret")
            canvas.showPage()
            canvas.save()

        def encryptPdf(srcPath, outPath, password):
            writer = PdfWriter()
            for page in PdfReader(srcPath).pages:
                writer.add_page(page)
            writer.encrypt(user_password=password, owner_password="admin")
            writer.write(str(outPath))

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        srcPath = base / "src.pdf"
        outPath = base / "secure.pdf"
        makeSource(srcPath)
        encryptPdf(srcPath, outPath, ___)
        reader = PdfReader(outPath)
        reader.is_encrypted, bool(reader.decrypt(___))
      hints:
        - "두 칸 모두 'codaro2026' 문자열."
    check:
      noError: "encrypt 두 인자는 모두 문자열."
      resultCheck: "(True, True) 또는 비슷한 튜플 출력."

  - id: step4_pipeline
    title: "4단계. 워터마크 + 암호화 파이프라인"
    structuredPrimary: true
    subtitle: "한 함수로 묶기"
    goal: "원본 PDF에 워터마크를 합성하고 비밀번호를 적용해 결과 파일을 만드는 함수를 작성한다."
    why: "두 패턴을 한 함수에 묶으면 사외 공유 PDF 처리가 한 줄 호출이 됩니다. 50개 PDF 처리도 같은 패턴으로 확장 가능합니다."
    explanation: |-
      secureExport(srcPath, watermarkPath, outPath, password)이 워터마크 overlay + encrypt를 한 흐름에 처리합니다. 결과 PDF는 워터마크 + 비밀번호 보호 둘 다 갖춥니다.
    tips:
      - "워터마크 PDF를 한 번 만들어 모듈 수준 상수로 둘 수도 있습니다. 같은 워터마크를 여러 PDF에 적용할 때 비용 절약."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def makeWatermark(path, text):
          canvas = Canvas(str(path))
          canvas.setFillColorRGB(0.75, 0.75, 0.75)
          canvas.setFont("Helvetica-Bold", 60)
          canvas.drawCentredString(298, 421, text)
          canvas.showPage()
          canvas.save()

      def makeSource(path, pageCount):
          canvas = Canvas(str(path))
          for idx in range(pageCount):
              canvas.drawString(72, 720, f"content {idx + 1}")
              canvas.showPage()
          canvas.save()

      def secureExport(srcPath, watermarkPath, outPath, password):
          watermark = PdfReader(watermarkPath).pages[0]
          writer = PdfWriter()
          for page in PdfReader(srcPath).pages:
              page.merge_page(watermark)
              writer.add_page(page)
          writer.encrypt(user_password=password, owner_password="admin")
          writer.write(str(outPath))

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      srcPath = base / "src.pdf"
      wmPath = base / "wm.pdf"
      outPath = base / "out.pdf"
      makeSource(srcPath, 3)
      makeWatermark(wmPath, "INTERNAL")
      secureExport(srcPath, wmPath, outPath, "share2026")

      reader = PdfReader(outPath)
      reader.is_encrypted, reader.decrypt("share2026"), len(reader.pages)
    exercise:
      prompt: "secureExport 함수의 본문을 직접 작성하세요. 워터마크 PDF 첫 페이지를 원본의 모든 페이지에 merge_page로 합성하고, PdfWriter에 누적한 뒤 encrypt(user/owner)로 비밀번호를 걸어 저장해야 합니다."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def makeWatermark(path, text):
            canvas = Canvas(str(path))
            canvas.setFillColorRGB(0.75, 0.75, 0.75)
            canvas.setFont("Helvetica-Bold", 60)
            canvas.drawCentredString(298, 421, text)
            canvas.showPage()
            canvas.save()

        def makeSource(path, pageCount):
            canvas = Canvas(str(path))
            for idx in range(pageCount):
                canvas.drawString(72, 720, f"c{idx + 1}")
                canvas.showPage()
            canvas.save()

        def secureExport(srcPath, watermarkPath, outPath, password):
            ___  # watermark page 로드 + writer에 merge_page 후 add_page + encrypt + write

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        srcPath = base / "src.pdf"
        wmPath = base / "wm.pdf"
        outPath = base / "out.pdf"
        makeSource(srcPath, 7)
        makeWatermark(wmPath, "INTERNAL")
        secureExport(srcPath, wmPath, outPath, "share2026")
        reader = PdfReader(outPath)
        assert reader.is_encrypted is True
        reader.decrypt("share2026")
        assert len(reader.pages) == 7
        len(reader.pages)
      hints:
        - "watermark = PdfReader(watermarkPath).pages[0]; writer = PdfWriter()"
        - "for page in PdfReader(srcPath).pages: page.merge_page(watermark); writer.add_page(page)"
        - "writer.encrypt(user_password=password, owner_password='admin'); writer.write(str(outPath))"
    check:
      noError: "함수 인자가 모두 채워져야 합니다."
      resultCheck: "출력 7."

  - id: validation
    title: "5단계. 검증 루프 - 보안 처리 통합 assert"
    structuredPrimary: true
    subtitle: "워터마크 텍스트 + 암호화 + 페이지 수 단일 검증"
    goal: "secureExport 결과의 페이지 수, 암호화 여부, 워터마크 텍스트 포함을 한 셀에서 검증한다."
    why: "보안 처리는 한 단계라도 빠지면 사고가 큽니다. 통합 assert가 회귀를 사전에 잡습니다."
    explanation: |-
      decrypt 후 본문에 워터마크 텍스트가 포함되는지, 페이지 수가 원본과 같은지 모두 확인합니다.
    tips:
      - "워터마크 텍스트가 extract_text에 잡히는 것은 폰트 임베드에 따라 다릅니다. 시각적 워터마크와 추출 가능 여부는 별개이므로 시각 확인도 같이 권장."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def makeWatermark(path, text):
          canvas = Canvas(str(path))
          canvas.setFillColorRGB(0.75, 0.75, 0.75)
          canvas.setFont("Helvetica-Bold", 60)
          canvas.drawCentredString(298, 421, text)
          canvas.showPage()
          canvas.save()

      def makeSource(path, pageCount):
          canvas = Canvas(str(path))
          for idx in range(pageCount):
              canvas.drawString(72, 720, f"content {idx + 1}")
              canvas.showPage()
          canvas.save()

      def secureExport(srcPath, watermarkPath, outPath, password):
          watermark = PdfReader(watermarkPath).pages[0]
          writer = PdfWriter()
          for page in PdfReader(srcPath).pages:
              page.merge_page(watermark)
              writer.add_page(page)
          writer.encrypt(user_password=password, owner_password="admin")
          writer.write(str(outPath))

      vault = TemporaryDirectory()
      base = Path(vault.name)
      srcPath = base / "src.pdf"
      wmPath = base / "wm.pdf"
      outPath = base / "out.pdf"
      makeSource(srcPath, 4)
      makeWatermark(wmPath, "CONFIDENTIAL")
      secureExport(srcPath, wmPath, outPath, "p2026")

      reader = PdfReader(outPath)
      assert reader.is_encrypted is True
      reader.decrypt("p2026")
      assert len(reader.pages) == 4
      body = reader.pages[0].extract_text() or ""
      assert "content 1" in body
      reader.is_encrypted, len(reader.pages)
    exercise:
      prompt: "원본 페이지를 6으로 늘리고 모든 assert가 통과하는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def makeWatermark(path, text):
            canvas = Canvas(str(path))
            canvas.setFillColorRGB(0.75, 0.75, 0.75)
            canvas.setFont("Helvetica-Bold", 60)
            canvas.drawCentredString(298, 421, text)
            canvas.showPage()
            canvas.save()

        def makeSource(path, pageCount):
            canvas = Canvas(str(path))
            for idx in range(pageCount):
                canvas.drawString(72, 720, f"c{idx + 1}")
                canvas.showPage()
            canvas.save()

        def secureExport(srcPath, watermarkPath, outPath, password):
            watermark = PdfReader(watermarkPath).pages[0]
            writer = PdfWriter()
            for page in PdfReader(srcPath).pages:
                page.merge_page(watermark)
                writer.add_page(page)
            writer.encrypt(user_password=password, owner_password="admin")
            writer.write(str(outPath))

        vault = TemporaryDirectory()
        base = Path(vault.name)
        makeSource(base / "src.pdf", ___)
        makeWatermark(base / "wm.pdf", "INTERNAL")
        secureExport(base / "src.pdf", base / "wm.pdf", base / "out.pdf", "x")
        reader = PdfReader(base / "out.pdf")
        reader.decrypt("x")
        assert len(reader.pages) == 6
        len(reader.pages)
      hints:
        - "정수 6."
    check:
      noError: "decrypt 호출이 encrypt 비밀번호와 같아야 합니다."
      resultCheck: "출력 6."

  - id: misconception
    title: "6단계. 흔한 오개념 차단"
    subtitle: "encrypt는 메타데이터까지 숨기지 않는다"
    goal: "암호화의 한계를 인지하고, 무엇이 보호되고 무엇이 보호되지 않는지 명확히 한다."
    why: "암호화에 대한 잘못된 기대는 보안 사고의 원인입니다. encrypt가 어디까지 보호하는지 알아야 합니다."
    explanation: |-
      pypdf encrypt는 페이지 콘텐츠와 일부 메타데이터를 암호화하지만, PDF의 일부 정보(파일명·일부 메타 구조)는 평문으로 남을 수 있습니다. 또한 user_password가 알려진 환경에서는 보호 효과가 없습니다. 추가 보안이 필요하면 별도 DRM 솔루션을 고려해야 합니다.
    tips:
      - "패스워드는 길고 복잡할수록 안전합니다. 사외 공유용은 12자 이상 권장."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      srcPath = base / "src.pdf"
      outPath = base / "enc.pdf"
      canvas = Canvas(str(srcPath))
      canvas.drawString(72, 720, "body")
      canvas.showPage()
      canvas.save()

      writer = PdfWriter()
      for page in PdfReader(srcPath).pages:
          writer.add_page(page)
      writer.encrypt(user_password="lesson", owner_password="admin")
      writer.write(str(outPath))

      reader = PdfReader(outPath)
      reader.is_encrypted
    exercise:
      prompt: "암호화된 PDF의 is_encrypted 속성을 확인하고 True인지 보세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        srcPath = base / "src.pdf"
        outPath = base / "e.pdf"
        canvas = Canvas(str(srcPath))
        canvas.drawString(72, 720, "x")
        canvas.showPage()
        canvas.save()

        writer = PdfWriter()
        for page in PdfReader(srcPath).pages:
            writer.add_page(page)
        writer.encrypt(user_password="a", owner_password="b")
        writer.write(str(outPath))

        reader = PdfReader(outPath)
        reader.is_encrypted is ___
      hints:
        - "True 키워드."
    check:
      noError: "is_encrypted는 bool."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션 2개"
    subtitle: "보안 처리 도구 두 개"
    goal: "워터마크와 암호화 패턴을 결합한 도구 두 개를 작성한다."
    why: "사외 공유 보안 처리는 정형적이고 빈도가 높은 작업입니다. 함수 두 개로 일상 업무 자동화가 됩니다."
    explanation: |-
      미션1은 폴더의 모든 PDF에 같은 워터마크를 일괄 적용하는 함수, 미션2는 폴더의 모든 PDF에 비밀번호를 일괄 적용하는 함수입니다.
    tips:
      - "변수 prefix: bulk*(미션1), pw*(미션2)."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas
    exercise:
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "미션1: bulkWatermark(srcFolder, outFolder, watermarkText) -> list[Path]"
        - "미션2: bulkEncrypt(srcFolder, outFolder, password) -> list[Path]"
    check:
      noError: "함수가 정의되고 결과 리스트가 비어있지 않아야 합니다."
      resultCheck: "두 함수 모두 결과 PDF가 실제로 생성되어야 합니다."
    blocks:
      - type: tip
        content: "두 함수 모두 같은 패턴(폴더 순회 + PdfReader/PdfWriter)을 갖습니다. 차이는 페이지 처리 단계입니다."
      - type: expansion
        title: "미션1: 폴더 일괄 워터마크"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader, PdfWriter
              from reportlab.pdfgen.canvas import Canvas

              def buildBulkWatermark(path, text):
                  canvas = Canvas(str(path))
                  canvas.setFillColorRGB(0.75, 0.75, 0.75)
                  canvas.setFont("Helvetica-Bold", 60)
                  canvas.drawCentredString(298, 421, text)
                  canvas.showPage()
                  canvas.save()

              def buildBulkSource(path, pageCount):
                  canvas = Canvas(str(path))
                  for idx in range(pageCount):
                      canvas.drawString(72, 720, f"src {path.stem} p{idx + 1}")
                      canvas.showPage()
                  canvas.save()

              def bulkWatermark(srcFolder, outFolder, watermarkText):
                  Path(outFolder).mkdir(exist_ok=True)
                  wmPath = Path(outFolder) / "wm.pdf"
                  buildBulkWatermark(wmPath, watermarkText)
                  watermark = PdfReader(wmPath).pages[0]
                  outputs = []
                  for srcPath in sorted(Path(srcFolder).glob("*.pdf")):
                      writer = PdfWriter()
                      for page in PdfReader(srcPath).pages:
                          page.merge_page(watermark)
                          writer.add_page(page)
                      outPath = Path(outFolder) / srcPath.name
                      writer.write(str(outPath))
                      outputs.append(outPath)
                  return outputs

              bulkDir = TemporaryDirectory()
              bulkSrc = Path(bulkDir.name) / "src"
              bulkOut = Path(bulkDir.name) / "out"
              bulkSrc.mkdir()
              for idx in range(3):
                  buildBulkSource(bulkSrc / f"{idx + 1}.pdf", 2)

              results = bulkWatermark(bulkSrc, bulkOut, "INTERNAL")
              assert len(results) == 3
              assert all(p.exists() for p in results)
              [p.name for p in results]
      - type: expansion
        title: "미션2: 폴더 일괄 암호화"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader, PdfWriter
              from reportlab.pdfgen.canvas import Canvas

              def buildPwSource(path, text):
                  canvas = Canvas(str(path))
                  canvas.drawString(72, 720, text)
                  canvas.showPage()
                  canvas.save()

              def bulkEncrypt(srcFolder, outFolder, password):
                  Path(outFolder).mkdir(exist_ok=True)
                  outputs = []
                  for srcPath in sorted(Path(srcFolder).glob("*.pdf")):
                      writer = PdfWriter()
                      for page in PdfReader(srcPath).pages:
                          writer.add_page(page)
                      writer.encrypt(user_password=password, owner_password="admin")
                      outPath = Path(outFolder) / srcPath.name
                      writer.write(str(outPath))
                      outputs.append(outPath)
                  return outputs

              pwDir = TemporaryDirectory()
              pwSrc = Path(pwDir.name) / "src"
              pwOut = Path(pwDir.name) / "out"
              pwSrc.mkdir()
              for idx in range(2):
                  buildPwSource(pwSrc / f"{idx + 1}.pdf", f"secret {idx + 1}")

              encrypted = bulkEncrypt(pwSrc, pwOut, "p2026")
              assert len(encrypted) == 2
              for outPath in encrypted:
                  reader = PdfReader(outPath)
                  assert reader.is_encrypted is True
                  reader.decrypt("p2026")
              [p.name for p in encrypted]

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: text
        content: |-
          보안 처리 패턴의 응용 아이디어입니다.
      - type: list
        style: bullet
        items:
          - "워터마크 텍스트를 발송 시각 + 수신자명으로 동적 생성 (개인화 워터마크)"
          - "사외/사내별로 다른 워터마크 + 비밀번호 정책 적용"
          - "암호화 PDF의 비밀번호를 자동 생성해 이메일로 함께 발송 (Email 트랙 결합)"
          - "워터마크를 좌상단·우하단 두 위치에 동시 배치"
          - "06강 한글 폰트로 한글 워터마크 ('사내전용', '복사금지') 적용"
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
  - id: pdf_08-pdf-security-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_make_watermark
    - extensions
    title: PDF watermark·암호화·permission 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 보안 등급에 필요한 watermark와 user/owner password 분리, permission을 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - user와 owner password는 서로 다른 secret reference로 관리하세요.
    - watermark는 암호화를 대체하지 않으며 permission도 allowlist로 제한하세요.
    exercise:
      prompt: audit_pdf_security(security, policy)를 완성하세요.
      starterCode: |-
        def audit_pdf_security(security, policy):
            raise NotImplementedError
      solution: |
        def audit_pdf_security(security, policy):
            failures = []
            if policy.get("requireWatermark") and not security.get("watermarkText"):
                failures.append("watermark")
            if policy.get("requireEncryption") and not security.get("encrypted", False):
                failures.append("encryption")
            if security.get("encrypted", False) and security.get("userPasswordRef") == security.get("ownerPasswordRef"):
                failures.append("password-separation")
            excessive = sorted(set(security.get("permissions", [])) - set(policy.get("allowedPermissions", [])))
            if excessive:
                failures.append("permissions")
            if "userPassword" in security or "ownerPassword" in security:
                failures.append("embedded-secret")
            return {"accepted": not failures, "failures": failures, "excessivePermissions": excessive}
      hints: *id001
    check:
      id: python.pdf.pdf_08.pdf-security-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_08.pdf-security-contract.mastery.behavior.v1.fixture
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
        entry: audit_pdf_security
        cases:
        - id: accepts-watermarked-encrypted-policy
          arguments:
          - value:
              watermarkText: CONFIDENTIAL
              encrypted: true
              userPasswordRef: user-ref
              ownerPasswordRef: owner-ref
              permissions:
              - print
          - value:
              requireWatermark: true
              requireEncryption: true
              allowedPermissions:
              - print
          expectedReturn:
            accepted: true
            failures: []
            excessivePermissions: []
        - id: reports-missing-security-and-password-separation
          arguments:
          - value:
              watermarkText: ''
              encrypted: true
              userPasswordRef: same
              ownerPasswordRef: same
              permissions:
              - copy
          - value:
              requireWatermark: true
              requireEncryption: true
              allowedPermissions: []
          expectedReturn:
            accepted: false
            failures:
            - watermark
            - password-separation
            - permissions
            excessivePermissions:
            - copy
        - id: reports-unencrypted-embedded-secret
          arguments:
          - value:
              encrypted: false
              userPassword: secret
              permissions: []
          - value:
              requireWatermark: false
              requireEncryption: true
              allowedPermissions: []
          expectedReturn:
            accepted: false
            failures:
            - encryption
            - embedded-secret
            excessivePermissions: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pdf_08-pdf-security-result-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_08-pdf-security-contract-mastery
    title: 새 보안 PDF의 재개방·permission 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: password별 open 결과와 추출/인쇄 permission을 정책과 대조한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 실제 PDF를 user/owner/무암호 세 방식으로 재개방해 정책을 검증하세요.
    - password 값이 log나 metadata에 남지 않았는지 residual scan을 수행하세요.
    exercise:
      prompt: audit_security_result(result, expected_permissions)를 완성하세요.
      starterCode: |-
        def audit_security_result(result, expected_permissions):
            raise NotImplementedError
      solution: |
        def audit_security_result(result, expected_permissions):
            failures = []
            if not result.get("opensWithUserPassword", False):
                failures.append("user-password")
            if not result.get("opensWithOwnerPassword", False):
                failures.append("owner-password")
            if result.get("opensWithoutPassword", False):
                failures.append("unencrypted-open")
            observed = set(result.get("permissions", []))
            missing = sorted(set(expected_permissions) - observed)
            unexpected = sorted(observed - set(expected_permissions))
            if missing or unexpected:
                failures.append("permissions")
            if result.get("secretResidualFindings", 0) != 0:
                failures.append("secret-residual")
            return {"passed": not failures, "failures": failures, "missingPermissions": missing, "unexpectedPermissions": unexpected}
      hints: *id002
    check:
      id: python.pdf.pdf_08.pdf-security-result.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_08.pdf-security-result.transfer.behavior.v1.fixture
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
        entry: audit_security_result
        cases:
        - id: accepts-encrypted-permission-result
          arguments:
          - value:
              opensWithUserPassword: true
              opensWithOwnerPassword: true
              opensWithoutPassword: false
              permissions:
              - print
              secretResidualFindings: 0
          - value:
            - print
          expectedReturn:
            passed: true
            failures: []
            missingPermissions: []
            unexpectedPermissions: []
        - id: reports-password-and-permission-failures
          arguments:
          - value:
              opensWithUserPassword: false
              opensWithOwnerPassword: false
              opensWithoutPassword: true
              permissions:
              - copy
          - value:
            - print
          expectedReturn:
            passed: false
            failures:
            - user-password
            - owner-password
            - unencrypted-open
            - permissions
            missingPermissions:
            - print
            unexpectedPermissions:
            - copy
        - id: reports-secret-residual
          arguments:
          - value:
              opensWithUserPassword: true
              opensWithOwnerPassword: true
              opensWithoutPassword: false
              permissions: []
              secretResidualFindings: 1
          - value: []
          expectedReturn:
            passed: false
            failures:
            - secret-residual
            missingPermissions: []
            unexpectedPermissions: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pdf_08-pdf-security-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_08-pdf-security-result-transfer
    title: PDF watermark·암호화 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 분류 표시·password·permission·재개방 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.
    - Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.
    exercise:
      prompt: choose_pdf_security_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_pdf_security_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pdf_security_evidence(situation):
            table = {'watermark': {'action': 'render classification mark', 'evidence': 'watermark text and page coverage', 'risk': 'visual mark only'}, 'encrypt': {'action': 'use separate secret references', 'evidence': 'encryption configuration', 'risk': 'embedded password'}, 'verify': {'action': 'reopen with password matrix', 'evidence': 'open results and permissions', 'risk': 'misconfigured security'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pdf.pdf_08.pdf-security-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_08.pdf-security-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pdf_security_evidence
        cases:
        - id: recalls-watermark
          arguments:
          - value: watermark
          expectedReturn:
            action: render classification mark
            evidence: watermark text and page coverage
            risk: visual mark only
        - id: recalls-encrypt
          arguments:
          - value: encrypt
          expectedReturn:
            action: use separate secret references
            evidence: encryption configuration
            risk: embedded password
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};