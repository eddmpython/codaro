var e=`meta:
  id: pdf_09
  title: PDF 양식 채우기
  order: 9
  category: pdf
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  packages:
    - pypdf
    - reportlab
  tags:
    - AcroForm
    - 양식
    - 신청서
    - 자동입력
  outcomes:
    - automation.pdf.forms
  prerequisites:
    - automation.pdf.read
    - automation.pdf.create
  estimatedMinutes: 50
  seo:
    title: "PDF 양식 자동 채우기 - pypdf AcroForm"
    description: "reportlab으로 신청서 양식 PDF를 만들고 pypdf로 필드 값을 자동 입력한다. 한 페이지짜리 인사·총무 신청서 자동화의 골격이다."
    keywords:
      - pypdf AcroForm
      - PDF 양식 채우기
      - update_page_form_field_values
      - PDF 신청서 자동화

intro:
  direction: "신청서·양식 PDF의 텍스트 필드를 코드로 일괄 채운다. 인사·총무에서 동일 양식 N장을 손으로 채우던 작업이 한 번의 함수 호출이 된다."
  benefits:
    - "신청서 양식 100장 수동 작성을 코드 한 번 실행으로 끝낸다."
    - "reportlab canvas.acroForm으로 양식 PDF를 즉석 생성, 외부 양식 의존 없이 학습 가능."
    - "pypdf의 update_page_form_field_values 패턴이 손에 남아 회사 양식에 그대로 적용 가능."
  diagram:
    steps:
      - label: "1. 양식 PDF 만들기"
        detail: "reportlab canvas.acroForm.textfield로 입력 필드가 있는 PDF를 즉석 생성."
      - label: "2. 필드 식별"
        detail: "PdfReader.get_fields()로 양식의 모든 필드를 dict로 확인."
      - label: "3. 필드 값 채우기"
        detail: "PdfWriter.update_page_form_field_values(page, {name: value})로 일괄 입력."
      - label: "4. 일괄 처리"
        detail: "신청자 dict 리스트를 받아 N개의 채워진 양식 PDF를 생성."
    runtime:
      - label: "AcroForm vs XFA"
        detail: "본 트랙은 표준 AcroForm만 다룬다. Adobe LiveCycle XFA 양식은 pypdf 미지원."
      - label: "검증"
        detail: "결과 PDF를 다시 열어 get_fields의 값이 의도와 같은지 assert."

sections:
  - id: step1_make_form
    title: "1단계. 양식 PDF 만들기"
    structuredPrimary: true
    subtitle: "canvas.acroForm.textfield"
    goal: "이름·전화 두 텍스트 필드가 있는 한 페이지 신청서 PDF를 만든다."
    why: "근로계약서, 출장 신청서, 휴가 신청서, 정부 보조금 신청서 - 인사·총무는 같은 양식 PDF에 사람별 정보만 바꿔 N장 만드는 작업을 매주 합니다. 양식 채우기를 코드로 풀려면 우선 채울 양식이 있어야 하므로, 회사 양식 PDF를 받기 전 학습용으로 reportlab AcroForm으로 즉석 만듭니다. 실무에서는 templatePath만 회사 양식 경로로 바꾸면 같은 코드가 그대로 돌아갑니다."
    explanation: |-
      Canvas의 acroForm.textfield(name='...', x, y, width, height)가 텍스트 입력 필드를 추가합니다. name이 채우기 단계에서 key가 됩니다.
    tips:
      - "textfield의 borderStyle, fillColor 등은 시각적 디자인용 인자. 기본값으로 충분합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def buildForm(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 750, "Application Form")
          canvas.drawString(72, 720, "Name:")
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
          canvas.drawString(72, 690, "Phone:")
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
          canvas.showPage()
          canvas.save()

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "form.pdf"
      buildForm(pdfPath)

      fields = PdfReader(pdfPath).get_fields()
      sorted(fields.keys()) if fields else []
    exercise:
      prompt: "양식에 'applicantEmail' 필드를 한 줄 더 추가하고 get_fields에 3개 키가 보이는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def buildForm(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 750, "Application Form")
            canvas.drawString(72, 720, "Name:")
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
            canvas.drawString(72, 690, "Phone:")
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
            canvas.drawString(72, 660, "Email:")
            canvas.acroForm.textfield(name=___, x=140, y=655, width=200, height=20)
            canvas.showPage()
            canvas.save()

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "form.pdf"
        buildForm(pdfPath)
        fields = PdfReader(pdfPath).get_fields()
        len(fields) if fields else 0
      hints:
        - "이름 문자열 'applicantEmail'."
    check:
      noError: "name 인자는 문자열."
      resultCheck: "출력 3."

  - id: step2_fill_fields
    title: "2단계. 필드 값 채우기"
    structuredPrimary: true
    subtitle: "PdfWriter.update_page_form_field_values"
    goal: "1단계 양식 PDF의 두 필드를 한 신청자 데이터로 채워 저장한다."
    why: "양식 PDF의 가치는 채우기 자동화에 있습니다. update_page_form_field_values 한 줄이 양식 입력의 핵심입니다."
    explanation: |-
      PdfWriter()를 만들고, 원본 양식의 페이지를 append 또는 add_page로 옮긴 뒤 writer.update_page_form_field_values(writer.pages[0], {'name': 'value', ...})로 채웁니다.
    tips:
      - "update_page_form_field_values는 writer의 페이지에 적용해야 합니다. reader의 페이지에 적용하면 저장이 반영되지 않습니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def buildForm(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 720, "Name:")
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
          canvas.drawString(72, 690, "Phone:")
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
          canvas.showPage()
          canvas.save()

      def fillForm(templatePath, outPath, data):
          reader = PdfReader(templatePath)
          writer = PdfWriter(clone_from=reader)
          writer.update_page_form_field_values(writer.pages[0], data)
          writer.write(str(outPath))

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      templatePath = base / "tpl.pdf"
      outPath = base / "filled.pdf"
      buildForm(templatePath)
      fillForm(templatePath, outPath, {"applicantName": "Kim Daeri", "applicantPhone": "010-1111-2222"})

      filled = PdfReader(outPath).get_fields() or {}
      filled.get("applicantName", {}).get("/V"), filled.get("applicantPhone", {}).get("/V")
    exercise:
      prompt: "신청자 이름을 'Park Manager', 전화를 '010-3333-4444'로 채우고 결과를 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def buildForm(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 720, "Name:")
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
            canvas.drawString(72, 690, "Phone:")
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
            canvas.showPage()
            canvas.save()

        def fillForm(templatePath, outPath, data):
            reader = PdfReader(templatePath)
            writer = PdfWriter(clone_from=reader)
            writer.update_page_form_field_values(writer.pages[0], data)
            writer.write(str(outPath))

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        templatePath = base / "tpl.pdf"
        outPath = base / "filled.pdf"
        buildForm(templatePath)
        fillForm(templatePath, outPath, {"applicantName": ___, "applicantPhone": ___})

        filled = PdfReader(outPath).get_fields() or {}
        filled.get("applicantName", {}).get("/V")
      hints:
        - "두 문자열을 입력. 'Park Manager', '010-3333-4444'."
    check:
      noError: "data는 dict, 키와 값 모두 문자열."
      resultCheck: "출력이 'Park Manager'."

  - id: step3_bulk
    title: "3단계. 일괄 양식 생성"
    structuredPrimary: true
    subtitle: "신청자 리스트 → N개 PDF"
    goal: "신청자 dict 리스트를 받아 각 사람용 양식 PDF를 따로 만든다."
    why: "100장 신청서 자동 생성이 본 강의의 진짜 가치입니다. 한 함수 호출로 폴더에 N개 PDF가 만들어집니다."
    explanation: |-
      generateForms(templatePath, outFolder, applicants)는 applicants의 각 dict로 fillForm을 호출해 폴더에 N개 결과 PDF를 만듭니다. 파일명은 신청자 이름으로 자동 생성.
    tips:
      - "신청자 이름에 공백·특수문자가 있으면 파일명 안전화(replace, slugify) 처리가 필요합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def buildForm(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 720, "Name:")
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
          canvas.drawString(72, 690, "Phone:")
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
          canvas.showPage()
          canvas.save()

      def fillForm(templatePath, outPath, data):
          reader = PdfReader(templatePath)
          writer = PdfWriter(clone_from=reader)
          writer.update_page_form_field_values(writer.pages[0], data)
          writer.write(str(outPath))

      def generateForms(templatePath, outFolder, applicants):
          Path(outFolder).mkdir(exist_ok=True)
          outputs = []
          for applicant in applicants:
              safeName = applicant["applicantName"].replace(" ", "_")
              outPath = Path(outFolder) / f"{safeName}.pdf"
              fillForm(templatePath, outPath, applicant)
              outputs.append(outPath)
          return outputs

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      templatePath = base / "tpl.pdf"
      outFolder = base / "filled"
      buildForm(templatePath)

      applicants = [
          {"applicantName": "Kim Daeri", "applicantPhone": "010-1111-1111"},
          {"applicantName": "Park Manager", "applicantPhone": "010-2222-2222"},
          {"applicantName": "Lee Junior", "applicantPhone": "010-3333-3333"},
      ]
      paths = generateForms(templatePath, outFolder, applicants)
      [p.name for p in paths]
    exercise:
      prompt: "신청자 리스트에 한 명 더 추가(Yoon Lead, 010-4444-4444)해 결과 파일 수를 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def buildForm(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 720, "Name:")
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
            canvas.drawString(72, 690, "Phone:")
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
            canvas.showPage()
            canvas.save()

        def fillForm(templatePath, outPath, data):
            reader = PdfReader(templatePath)
            writer = PdfWriter(clone_from=reader)
            writer.update_page_form_field_values(writer.pages[0], data)
            writer.write(str(outPath))

        def generateForms(templatePath, outFolder, applicants):
            Path(outFolder).mkdir(exist_ok=True)
            outputs = []
            for applicant in applicants:
                safeName = applicant["applicantName"].replace(" ", "_")
                outPath = Path(outFolder) / f"{safeName}.pdf"
                fillForm(templatePath, outPath, applicant)
                outputs.append(outPath)
            return outputs

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        templatePath = base / "tpl.pdf"
        outFolder = base / "filled"
        buildForm(templatePath)
        applicants = [
            {"applicantName": "Kim", "applicantPhone": "010-1111"},
            {"applicantName": "Park", "applicantPhone": "010-2222"},
            {"applicantName": "Lee", "applicantPhone": "010-3333"},
            {"applicantName": ___, "applicantPhone": ___},
        ]
        paths = generateForms(templatePath, outFolder, applicants)
        len(paths)
      hints:
        - "두 문자열 추가."
    check:
      noError: "dict 키는 양식 필드 name과 일치해야 합니다."
      resultCheck: "출력 4."

  - id: validation
    title: "4단계. 검증 루프 - 모든 결과 PDF 필드 검증"
    structuredPrimary: true
    subtitle: "get_fields로 입력값 확인"
    goal: "생성된 모든 PDF의 양식 필드 값이 의도한 신청자 데이터와 일치하는지 확인한다."
    why: "양식 자동 입력의 회귀는 필드 누락 또는 잘못된 매핑입니다. assert 한 묶음이 사전에 잡습니다."
    explanation: |-
      generateForms 결과 리스트를 순회하면서 각 PDF를 다시 열고 get_fields의 /V 값이 applicants의 입력값과 같은지 확인합니다.
    tips:
      - "필드 값은 PdfReader.get_fields()의 각 항목 dict의 '/V' 키에 들어 있습니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def buildForm(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 720, "Name:")
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
          canvas.drawString(72, 690, "Phone:")
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
          canvas.showPage()
          canvas.save()

      def fillForm(templatePath, outPath, data):
          reader = PdfReader(templatePath)
          writer = PdfWriter(clone_from=reader)
          writer.update_page_form_field_values(writer.pages[0], data)
          writer.write(str(outPath))

      def generateForms(templatePath, outFolder, applicants):
          Path(outFolder).mkdir(exist_ok=True)
          outputs = []
          for applicant in applicants:
              safeName = applicant["applicantName"].replace(" ", "_")
              outPath = Path(outFolder) / f"{safeName}.pdf"
              fillForm(templatePath, outPath, applicant)
              outputs.append(outPath)
          return outputs

      vault = TemporaryDirectory()
      base = Path(vault.name)
      buildForm(base / "tpl.pdf")
      applicants = [
          {"applicantName": "Kim", "applicantPhone": "010-1"},
          {"applicantName": "Park", "applicantPhone": "010-2"},
      ]
      paths = generateForms(base / "tpl.pdf", base / "out", applicants)

      for path, applicant in zip(paths, applicants):
          fields = PdfReader(path).get_fields() or {}
          for key, value in applicant.items():
              assert fields.get(key, {}).get("/V") == value, f"{path.name}의 {key} mismatch"
      [p.name for p in paths]
    exercise:
      prompt: "fillForm 함수의 본문을 직접 작성하세요. templatePath의 PDF를 PdfWriter(clone_from=...)로 복제한 뒤 update_page_form_field_values로 첫 페이지에 data를 채우고 outPath로 저장해야 합니다."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def buildForm(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 720, "Name:")
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
            canvas.drawString(72, 690, "Phone:")
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
            canvas.showPage()
            canvas.save()

        def fillForm(templatePath, outPath, data):
            ___  # reader 로드 + PdfWriter(clone_from=reader) + update_page_form_field_values + write

        def generateForms(templatePath, outFolder, applicants):
            Path(outFolder).mkdir(exist_ok=True)
            outputs = []
            for applicant in applicants:
                safeName = applicant["applicantName"].replace(" ", "_")
                outPath = Path(outFolder) / f"{safeName}.pdf"
                fillForm(templatePath, outPath, applicant)
                outputs.append(outPath)
            return outputs

        vault = TemporaryDirectory()
        base = Path(vault.name)
        buildForm(base / "tpl.pdf")
        applicants = [
            {"applicantName": "Kim", "applicantPhone": "010-1"},
            {"applicantName": "Park", "applicantPhone": "010-2"},
            {"applicantName": "Lee", "applicantPhone": "010-3"},
        ]
        paths = generateForms(base / "tpl.pdf", base / "out", applicants)
        for path, applicant in zip(paths, applicants):
            fields = PdfReader(path).get_fields() or {}
            for key, value in applicant.items():
                assert fields.get(key, {}).get("/V") == value
        len(paths)
      hints:
        - "reader = PdfReader(templatePath); writer = PdfWriter(clone_from=reader)"
        - "writer.update_page_form_field_values(writer.pages[0], data); writer.write(str(outPath))"
    check:
      noError: "applicants 리스트의 각 dict 키가 양식 필드 name과 같아야 합니다."
      resultCheck: "출력 3."

  - id: misconception
    title: "5단계. 흔한 오개념 차단"
    subtitle: "AcroForm vs XFA, writer.pages vs reader.pages"
    goal: "AcroForm만 지원, writer 페이지에 적용해야 한다는 두 함정을 차단한다."
    why: "Adobe LiveCycle 양식(XFA)은 pypdf로 채울 수 없습니다. update_page_form_field_values를 reader.pages에 적용하면 저장이 반영되지 않습니다."
    explanation: |-
      양식 PDF를 받았는데 채워지지 않으면 두 가지를 의심합니다. (1) XFA 양식이면 본 트랙으로는 채울 수 없습니다 → LibreOffice 또는 다른 도구 필요. (2) update_page_form_field_values를 writer가 아닌 reader의 페이지에 적용했으면 저장이 안 됩니다.
    tips:
      - "양식 PDF 종류는 PdfReader의 trailer 정보로 일부 식별 가능합니다. XFA가 의심되면 PDF를 텍스트 에디터로 열어 '/XFA' 문자열을 검색해 보세요."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader, PdfWriter
      from reportlab.pdfgen.canvas import Canvas

      def buildForm(path):
          canvas = Canvas(str(path))
          canvas.acroForm.textfield(name="f1", x=72, y=700, width=200, height=20)
          canvas.showPage()
          canvas.save()

      workdir = TemporaryDirectory()
      base = Path(workdir.name)
      tplPath = base / "tpl.pdf"
      outPath = base / "out.pdf"
      buildForm(tplPath)

      reader = PdfReader(tplPath)
      writer = PdfWriter(clone_from=reader)
      writer.update_page_form_field_values(writer.pages[0], {"f1": "applied"})
      writer.write(str(outPath))

      filledFields = PdfReader(outPath).get_fields() or {}
      filledFields.get("f1", {}).get("/V")
    exercise:
      prompt: "필드 값을 'check value'로 바꾸고 저장 후 다시 읽었을 때 일치하는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen.canvas import Canvas

        def buildForm(path):
            canvas = Canvas(str(path))
            canvas.acroForm.textfield(name="f1", x=72, y=700, width=200, height=20)
            canvas.showPage()
            canvas.save()

        workdir = TemporaryDirectory()
        base = Path(workdir.name)
        tplPath = base / "tpl.pdf"
        outPath = base / "out.pdf"
        buildForm(tplPath)

        reader = PdfReader(tplPath)
        writer = PdfWriter(clone_from=reader)
        writer.update_page_form_field_values(writer.pages[0], {"f1": ___})
        writer.write(str(outPath))

        filledFields = PdfReader(outPath).get_fields() or {}
        filledFields.get("f1", {}).get("/V") == "check value"
      hints:
        - "문자열 'check value'."
    check:
      noError: "dict 값은 문자열."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션 2개"
    subtitle: "신청서 일괄 생성기 + 양식 필드 자동 탐색"
    goal: "양식 PDF + 신청자 CSV → 채워진 PDF 묶음, 그리고 받은 양식의 필드 이름을 자동 추출하는 두 도구를 만든다."
    why: "양식 자동 입력의 끝은 데이터 소스(CSV)에서 시작해 결과 PDF 폴더로 끝나는 한 파이프라인입니다. 회사 양식이 새로 오면 필드 이름을 먼저 알아야 입력 dict를 짤 수 있어, 필드 자동 탐색이 짝패로 따라옵니다."
    explanation: |-
      미션1은 신청자 dict 리스트로 양식 PDF를 일괄 채우는 함수, 미션2는 받은 양식 PDF의 모든 필드 이름과 기본값을 dict로 돌려주는 탐색 함수입니다.
    tips:
      - "변수 prefix: bulk*(미션1), probe*(미션2)."
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
        - "미션1: bulkFillForms(templatePath, outFolder, applicants) -> list[Path]"
        - "미션2: probeFormFields(templatePath) -> dict[str, str] (필드명 → 현재값 또는 빈 문자열)"
    check:
      noError: "함수 정의 + 결과 검증."
      resultCheck: "미션1 리스트 길이 == applicants 길이, 미션2 dict 키 == 양식 필드명."
    blocks:
      - type: tip
        content: "실무에서는 양식 파일이 이미 존재합니다. buildForm 단계는 학습용이고, 실제 코드는 templatePath를 회사 양식 PDF 경로로 받게 합니다."
      - type: expansion
        title: "미션1: 양식 일괄 채우기 + 검증"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader, PdfWriter
              from reportlab.pdfgen.canvas import Canvas

              def buildBulkForm(path):
                  canvas = Canvas(str(path))
                  canvas.drawString(72, 720, "Name:")
                  canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)
                  canvas.drawString(72, 690, "Phone:")
                  canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)
                  canvas.showPage()
                  canvas.save()

              def bulkFillForms(templatePath, outFolder, applicants):
                  Path(outFolder).mkdir(exist_ok=True)
                  outputs = []
                  for applicant in applicants:
                      safeName = applicant["applicantName"].replace(" ", "_")
                      outPath = Path(outFolder) / f"{safeName}.pdf"
                      reader = PdfReader(templatePath)
                      writer = PdfWriter(clone_from=reader)
                      writer.update_page_form_field_values(writer.pages[0], applicant)
                      writer.write(str(outPath))
                      outputs.append(outPath)
                  return outputs

              bulkDir = TemporaryDirectory()
              base = Path(bulkDir.name)
              templatePath = base / "tpl.pdf"
              outFolder = base / "filled"
              buildBulkForm(templatePath)
              applicants = [
                  {"applicantName": "Kim Daeri", "applicantPhone": "010-1"},
                  {"applicantName": "Park Manager", "applicantPhone": "010-2"},
                  {"applicantName": "Lee Junior", "applicantPhone": "010-3"},
              ]
              filledPaths = bulkFillForms(templatePath, outFolder, applicants)
              for filledPath, applicant in zip(filledPaths, applicants):
                  fields = PdfReader(filledPath).get_fields() or {}
                  for key, value in applicant.items():
                      assert fields.get(key, {}).get("/V") == value
              [p.name for p in filledPaths]
      - type: expansion
        title: "미션2: 양식 필드 자동 탐색"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader
              from reportlab.pdfgen.canvas import Canvas

              def buildProbeForm(path):
                  canvas = Canvas(str(path))
                  canvas.drawString(72, 750, "Vacation Request")
                  canvas.acroForm.textfield(name="employeeName", x=140, y=720, width=200, height=20)
                  canvas.acroForm.textfield(name="department", x=140, y=690, width=200, height=20)
                  canvas.acroForm.textfield(name="startDate", x=140, y=660, width=200, height=20)
                  canvas.acroForm.textfield(name="endDate", x=140, y=630, width=200, height=20)
                  canvas.showPage()
                  canvas.save()

              def probeFormFields(templatePath):
                  reader = PdfReader(templatePath)
                  fields = reader.get_fields() or {}
                  result = {}
                  for name, spec in fields.items():
                      value = spec.get("/V") if isinstance(spec, dict) else None
                      result[name] = value if value is not None else ""
                  return result

              probeDir = TemporaryDirectory()
              probePath = Path(probeDir.name) / "vacation.pdf"
              buildProbeForm(probePath)
              discovered = probeFormFields(probePath)
              assert set(discovered.keys()) == {"employeeName", "department", "startDate", "endDate"}
              assert all(value == "" for value in discovered.values())
              sorted(discovered.keys())

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: text
        content: |-
          양식 자동 채우기 패턴의 응용 아이디어입니다.
      - type: list
        style: bullet
        items:
          - "근로계약서 양식 + HR DB CSV → 신입 N명의 계약서 PDF 자동 생성"
          - "공공기관 신청서 양식을 매월 자동 입력 후 메일 발송 (Email 트랙 결합)"
          - "체크박스·라디오 버튼 필드 추가 (canvas.acroForm.checkbox 활용)"
          - "AcroForm 필드 위치를 회사 양식에 맞춰 좌표 조정"
          - "기존 받은 양식 PDF의 모든 필드 이름을 자동 추출해 입력 도우미 dict 템플릿 생성"
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
  - id: pdf_09-pdf-form-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_make_form
    - extensions
    title: PDF form field의 이름·type·required·default 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 중복 field와 type에 맞지 않는 default 값을 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - form field name은 문서 전체에서 유일해야 합니다.
    - checkbox·choice default가 field type 계약에 맞는지 검사하세요.
    exercise:
      prompt: audit_pdf_form_fields(fields)를 완성하세요.
      starterCode: |-
        def audit_pdf_form_fields(fields):
            raise NotImplementedError
      solution: |
        def audit_pdf_form_fields(fields):
            failures = []
            names = [field["name"] for field in fields]
            duplicates = sorted({name for name in names if names.count(name) > 1})
            invalid = []
            for field in fields:
                reasons = []
                field_type = field.get("type")
                value = field.get("default")
                if field_type not in {"text", "checkbox", "choice"}:
                    reasons.append("type")
                elif field_type == "checkbox" and value is not None and not isinstance(value, bool):
                    reasons.append("default")
                elif field_type == "choice" and value is not None and value not in field.get("options", []):
                    reasons.append("default")
                if field.get("required", False) and value in {None, ""}:
                    reasons.append("required-default")
                if reasons:
                    invalid.append({"name": field["name"], "reasons": reasons})
            if duplicates:
                failures.append("duplicates")
            if invalid:
                failures.append("fields")
            return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "invalid": invalid}
      hints: *id001
    check:
      id: python.pdf.pdf_09.pdf-form-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_09.pdf-form-contract.mastery.behavior.v1.fixture
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
        entry: audit_pdf_form_fields
        cases:
        - id: accepts-text-checkbox-and-choice
          arguments:
          - value:
            - name: name
              type: text
              required: true
              default: A
            - name: agree
              type: checkbox
              default: false
            - name: region
              type: choice
              options:
              - KR
              - US
              default: KR
          expectedReturn:
            accepted: true
            failures: []
            duplicates: []
            invalid: []
        - id: reports-duplicate-and-required-default
          arguments:
          - value:
            - name: name
              type: text
              required: true
              default: ''
            - name: name
              type: text
              default: B
          expectedReturn:
            accepted: false
            failures:
            - duplicates
            - fields
            duplicates:
            - name
            invalid:
            - name: name
              reasons:
              - required-default
        - id: reports-invalid-choice-default
          arguments:
          - value:
            - name: region
              type: choice
              options:
              - KR
              default: US
          expectedReturn:
            accepted: false
            failures:
            - fields
            duplicates: []
            invalid:
            - name: region
              reasons:
              - default
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pdf_09-pdf-form-fill-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_09-pdf-form-contract-mastery
    title: 새 PDF form 입력에 type·required·unknown field 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: form schema와 값 dict를 대조해 fill plan을 만든다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 값 dict의 unknown field를 조용히 무시하지 마세요.
    - required·checkbox·choice type을 fill 전에 검사하세요.
    exercise:
      prompt: audit_form_values(fields, values)를 완성하세요.
      starterCode: |-
        def audit_form_values(fields, values):
            raise NotImplementedError
      solution: |
        def audit_form_values(fields, values):
            schema = {field["name"]: field for field in fields}
            unknown = sorted(set(values) - set(schema))
            missing = sorted(field["name"] for field in fields if field.get("required", False) and values.get(field["name"]) in {None, ""})
            invalid = []
            for name, value in values.items():
                if name not in schema:
                    continue
                field = schema[name]
                if field["type"] == "checkbox" and not isinstance(value, bool):
                    invalid.append(name)
                elif field["type"] == "choice" and value not in field.get("options", []):
                    invalid.append(name)
            return {"ready": not unknown and not missing and not invalid, "unknown": unknown, "missing": missing, "invalid": sorted(invalid), "fill": sorted(name for name in values if name in schema and name not in invalid)}
      hints: *id002
    check:
      id: python.pdf.pdf_09.pdf-form-fill-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_09.pdf-form-fill-audit.transfer.behavior.v1.fixture
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
        entry: audit_form_values
        cases:
        - id: accepts-valid-form-values
          arguments:
          - value:
            - name: name
              type: text
              required: true
            - name: agree
              type: checkbox
          - value:
              name: A
              agree: true
          expectedReturn:
            ready: true
            unknown: []
            missing: []
            invalid: []
            fill:
            - agree
            - name
        - id: reports-unknown-missing-and-invalid
          arguments:
          - value:
            - name: name
              type: text
              required: true
            - name: agree
              type: checkbox
          - value:
              name: ''
              agree: 'yes'
              extra: 1
          expectedReturn:
            ready: false
            unknown:
            - extra
            missing:
            - name
            invalid:
            - agree
            fill:
            - name
        - id: reports-invalid-choice
          arguments:
          - value:
            - name: region
              type: choice
              options:
              - KR
          - value:
              region: US
          expectedReturn:
            ready: false
            unknown: []
            missing: []
            invalid:
            - region
            fill: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pdf_09-pdf-form-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_09-pdf-form-fill-audit-transfer
    title: PDF form 채우기 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: field schema·value type·재개방 evidence를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.
    - Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.
    exercise:
      prompt: choose_pdf_form_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_pdf_form_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pdf_form_evidence(situation):
            table = {'schema': {'action': 'validate unique names types and defaults', 'evidence': 'field manifest', 'risk': 'ambiguous form'}, 'fill': {'action': 'reject unknown missing invalid values', 'evidence': 'fill plan', 'risk': 'wrong field value'}, 'verify': {'action': 'reopen and read filled fields', 'evidence': 'observed field values', 'risk': 'unsaved form data'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pdf.pdf_09.pdf-form-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_09.pdf-form-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pdf_form_evidence
        cases:
        - id: recalls-schema
          arguments:
          - value: schema
          expectedReturn:
            action: validate unique names types and defaults
            evidence: field manifest
            risk: ambiguous form
        - id: recalls-fill
          arguments:
          - value: fill
          expectedReturn:
            action: reject unknown missing invalid values
            evidence: fill plan
            risk: wrong field value
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};