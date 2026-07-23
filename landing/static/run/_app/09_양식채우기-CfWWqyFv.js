var e=`meta:\r
  id: pdf_09\r
  title: PDF 양식 채우기\r
  order: 9\r
  category: pdf\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  packages:\r
    - pypdf\r
    - reportlab\r
  tags:\r
    - AcroForm\r
    - 양식\r
    - 신청서\r
    - 자동입력\r
  outcomes:\r
    - automation.pdf.forms\r
  prerequisites:\r
    - automation.pdf.read\r
    - automation.pdf.create\r
  estimatedMinutes: 50\r
  seo:\r
    title: "PDF 양식 자동 채우기 - pypdf AcroForm"\r
    description: "reportlab으로 신청서 양식 PDF를 만들고 pypdf로 필드 값을 자동 입력한다. 한 페이지짜리 인사·총무 신청서 자동화의 골격이다."\r
    keywords:\r
      - pypdf AcroForm\r
      - PDF 양식 채우기\r
      - update_page_form_field_values\r
      - PDF 신청서 자동화\r
\r
intro:\r
  direction: "신청서·양식 PDF의 텍스트 필드를 코드로 일괄 채운다. 인사·총무에서 동일 양식 N장을 손으로 채우던 작업이 한 번의 함수 호출이 된다."\r
  benefits:\r
    - "신청서 양식 100장 수동 작성을 코드 한 번 실행으로 끝낸다."\r
    - "reportlab canvas.acroForm으로 양식 PDF를 즉석 생성, 외부 양식 의존 없이 학습 가능."\r
    - "pypdf의 update_page_form_field_values 패턴이 손에 남아 회사 양식에 그대로 적용 가능."\r
  diagram:\r
    steps:\r
      - label: "1. 양식 PDF 만들기"\r
        detail: "reportlab canvas.acroForm.textfield로 입력 필드가 있는 PDF를 즉석 생성."\r
      - label: "2. 필드 식별"\r
        detail: "PdfReader.get_fields()로 양식의 모든 필드를 dict로 확인."\r
      - label: "3. 필드 값 채우기"\r
        detail: "PdfWriter.update_page_form_field_values(page, {name: value})로 일괄 입력."\r
      - label: "4. 일괄 처리"\r
        detail: "신청자 dict 리스트를 받아 N개의 채워진 양식 PDF를 생성."\r
    runtime:\r
      - label: "AcroForm vs XFA"\r
        detail: "본 트랙은 표준 AcroForm만 다룬다. Adobe LiveCycle XFA 양식은 pypdf 미지원."\r
      - label: "검증"\r
        detail: "결과 PDF를 다시 열어 get_fields의 값이 의도와 같은지 assert."\r
\r
sections:\r
  - id: step1_make_form\r
    title: "1단계. 양식 PDF 만들기"\r
    structuredPrimary: true\r
    subtitle: "canvas.acroForm.textfield"\r
    goal: "이름·전화 두 텍스트 필드가 있는 한 페이지 신청서 PDF를 만든다."\r
    why: "근로계약서, 출장 신청서, 휴가 신청서, 정부 보조금 신청서 - 인사·총무는 같은 양식 PDF에 사람별 정보만 바꿔 N장 만드는 작업을 매주 합니다. 양식 채우기를 코드로 풀려면 우선 채울 양식이 있어야 하므로, 회사 양식 PDF를 받기 전 학습용으로 reportlab AcroForm으로 즉석 만듭니다. 실무에서는 templatePath만 회사 양식 경로로 바꾸면 같은 코드가 그대로 돌아갑니다."\r
    explanation: |-\r
      Canvas의 acroForm.textfield(name='...', x, y, width, height)가 텍스트 입력 필드를 추가합니다. name이 채우기 단계에서 key가 됩니다.\r
    tips:\r
      - "textfield의 borderStyle, fillColor 등은 시각적 디자인용 인자. 기본값으로 충분합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildForm(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 750, "Application Form")\r
          canvas.drawString(72, 720, "Name:")\r
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
          canvas.drawString(72, 690, "Phone:")\r
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "form.pdf"\r
      buildForm(pdfPath)\r
\r
      fields = PdfReader(pdfPath).get_fields()\r
      sorted(fields.keys()) if fields else []\r
    exercise:\r
      prompt: "양식에 'applicantEmail' 필드를 한 줄 더 추가하고 get_fields에 3개 키가 보이는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildForm(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 750, "Application Form")\r
            canvas.drawString(72, 720, "Name:")\r
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
            canvas.drawString(72, 690, "Phone:")\r
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
            canvas.drawString(72, 660, "Email:")\r
            canvas.acroForm.textfield(name=___, x=140, y=655, width=200, height=20)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "form.pdf"\r
        buildForm(pdfPath)\r
        fields = PdfReader(pdfPath).get_fields()\r
        len(fields) if fields else 0\r
      hints:\r
        - "이름 문자열 'applicantEmail'."\r
    check:\r
      noError: "name 인자는 문자열."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_fill_fields\r
    title: "2단계. 필드 값 채우기"\r
    structuredPrimary: true\r
    subtitle: "PdfWriter.update_page_form_field_values"\r
    goal: "1단계 양식 PDF의 두 필드를 한 신청자 데이터로 채워 저장한다."\r
    why: "양식 PDF의 가치는 채우기 자동화에 있습니다. update_page_form_field_values 한 줄이 양식 입력의 핵심입니다."\r
    explanation: |-\r
      PdfWriter()를 만들고, 원본 양식의 페이지를 append 또는 add_page로 옮긴 뒤 writer.update_page_form_field_values(writer.pages[0], {'name': 'value', ...})로 채웁니다.\r
    tips:\r
      - "update_page_form_field_values는 writer의 페이지에 적용해야 합니다. reader의 페이지에 적용하면 저장이 반영되지 않습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildForm(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 720, "Name:")\r
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
          canvas.drawString(72, 690, "Phone:")\r
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def fillForm(templatePath, outPath, data):\r
          reader = PdfReader(templatePath)\r
          writer = PdfWriter(clone_from=reader)\r
          writer.update_page_form_field_values(writer.pages[0], data)\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      templatePath = base / "tpl.pdf"\r
      outPath = base / "filled.pdf"\r
      buildForm(templatePath)\r
      fillForm(templatePath, outPath, {"applicantName": "Kim Daeri", "applicantPhone": "010-1111-2222"})\r
\r
      filled = PdfReader(outPath).get_fields() or {}\r
      filled.get("applicantName", {}).get("/V"), filled.get("applicantPhone", {}).get("/V")\r
    exercise:\r
      prompt: "신청자 이름을 'Park Manager', 전화를 '010-3333-4444'로 채우고 결과를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildForm(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 720, "Name:")\r
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
            canvas.drawString(72, 690, "Phone:")\r
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def fillForm(templatePath, outPath, data):\r
            reader = PdfReader(templatePath)\r
            writer = PdfWriter(clone_from=reader)\r
            writer.update_page_form_field_values(writer.pages[0], data)\r
            writer.write(str(outPath))\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        templatePath = base / "tpl.pdf"\r
        outPath = base / "filled.pdf"\r
        buildForm(templatePath)\r
        fillForm(templatePath, outPath, {"applicantName": ___, "applicantPhone": ___})\r
\r
        filled = PdfReader(outPath).get_fields() or {}\r
        filled.get("applicantName", {}).get("/V")\r
      hints:\r
        - "두 문자열을 입력. 'Park Manager', '010-3333-4444'."\r
    check:\r
      noError: "data는 dict, 키와 값 모두 문자열."\r
      resultCheck: "출력이 'Park Manager'."\r
\r
  - id: step3_bulk\r
    title: "3단계. 일괄 양식 생성"\r
    structuredPrimary: true\r
    subtitle: "신청자 리스트 → N개 PDF"\r
    goal: "신청자 dict 리스트를 받아 각 사람용 양식 PDF를 따로 만든다."\r
    why: "100장 신청서 자동 생성이 본 강의의 진짜 가치입니다. 한 함수 호출로 폴더에 N개 PDF가 만들어집니다."\r
    explanation: |-\r
      generateForms(templatePath, outFolder, applicants)는 applicants의 각 dict로 fillForm을 호출해 폴더에 N개 결과 PDF를 만듭니다. 파일명은 신청자 이름으로 자동 생성.\r
    tips:\r
      - "신청자 이름에 공백·특수문자가 있으면 파일명 안전화(replace, slugify) 처리가 필요합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildForm(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 720, "Name:")\r
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
          canvas.drawString(72, 690, "Phone:")\r
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def fillForm(templatePath, outPath, data):\r
          reader = PdfReader(templatePath)\r
          writer = PdfWriter(clone_from=reader)\r
          writer.update_page_form_field_values(writer.pages[0], data)\r
          writer.write(str(outPath))\r
\r
      def generateForms(templatePath, outFolder, applicants):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          outputs = []\r
          for applicant in applicants:\r
              safeName = applicant["applicantName"].replace(" ", "_")\r
              outPath = Path(outFolder) / f"{safeName}.pdf"\r
              fillForm(templatePath, outPath, applicant)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      templatePath = base / "tpl.pdf"\r
      outFolder = base / "filled"\r
      buildForm(templatePath)\r
\r
      applicants = [\r
          {"applicantName": "Kim Daeri", "applicantPhone": "010-1111-1111"},\r
          {"applicantName": "Park Manager", "applicantPhone": "010-2222-2222"},\r
          {"applicantName": "Lee Junior", "applicantPhone": "010-3333-3333"},\r
      ]\r
      paths = generateForms(templatePath, outFolder, applicants)\r
      [p.name for p in paths]\r
    exercise:\r
      prompt: "신청자 리스트에 한 명 더 추가(Yoon Lead, 010-4444-4444)해 결과 파일 수를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildForm(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 720, "Name:")\r
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
            canvas.drawString(72, 690, "Phone:")\r
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def fillForm(templatePath, outPath, data):\r
            reader = PdfReader(templatePath)\r
            writer = PdfWriter(clone_from=reader)\r
            writer.update_page_form_field_values(writer.pages[0], data)\r
            writer.write(str(outPath))\r
\r
        def generateForms(templatePath, outFolder, applicants):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            outputs = []\r
            for applicant in applicants:\r
                safeName = applicant["applicantName"].replace(" ", "_")\r
                outPath = Path(outFolder) / f"{safeName}.pdf"\r
                fillForm(templatePath, outPath, applicant)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        templatePath = base / "tpl.pdf"\r
        outFolder = base / "filled"\r
        buildForm(templatePath)\r
        applicants = [\r
            {"applicantName": "Kim", "applicantPhone": "010-1111"},\r
            {"applicantName": "Park", "applicantPhone": "010-2222"},\r
            {"applicantName": "Lee", "applicantPhone": "010-3333"},\r
            {"applicantName": ___, "applicantPhone": ___},\r
        ]\r
        paths = generateForms(templatePath, outFolder, applicants)\r
        len(paths)\r
      hints:\r
        - "두 문자열 추가."\r
    check:\r
      noError: "dict 키는 양식 필드 name과 일치해야 합니다."\r
      resultCheck: "출력 4."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 모든 결과 PDF 필드 검증"\r
    structuredPrimary: true\r
    subtitle: "get_fields로 입력값 확인"\r
    goal: "생성된 모든 PDF의 양식 필드 값이 의도한 신청자 데이터와 일치하는지 확인한다."\r
    why: "양식 자동 입력의 회귀는 필드 누락 또는 잘못된 매핑입니다. assert 한 묶음이 사전에 잡습니다."\r
    explanation: |-\r
      generateForms 결과 리스트를 순회하면서 각 PDF를 다시 열고 get_fields의 /V 값이 applicants의 입력값과 같은지 확인합니다.\r
    tips:\r
      - "필드 값은 PdfReader.get_fields()의 각 항목 dict의 '/V' 키에 들어 있습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildForm(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 720, "Name:")\r
          canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
          canvas.drawString(72, 690, "Phone:")\r
          canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def fillForm(templatePath, outPath, data):\r
          reader = PdfReader(templatePath)\r
          writer = PdfWriter(clone_from=reader)\r
          writer.update_page_form_field_values(writer.pages[0], data)\r
          writer.write(str(outPath))\r
\r
      def generateForms(templatePath, outFolder, applicants):\r
          Path(outFolder).mkdir(exist_ok=True)\r
          outputs = []\r
          for applicant in applicants:\r
              safeName = applicant["applicantName"].replace(" ", "_")\r
              outPath = Path(outFolder) / f"{safeName}.pdf"\r
              fillForm(templatePath, outPath, applicant)\r
              outputs.append(outPath)\r
          return outputs\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      buildForm(base / "tpl.pdf")\r
      applicants = [\r
          {"applicantName": "Kim", "applicantPhone": "010-1"},\r
          {"applicantName": "Park", "applicantPhone": "010-2"},\r
      ]\r
      paths = generateForms(base / "tpl.pdf", base / "out", applicants)\r
\r
      for path, applicant in zip(paths, applicants):\r
          fields = PdfReader(path).get_fields() or {}\r
          for key, value in applicant.items():\r
              assert fields.get(key, {}).get("/V") == value, f"{path.name}의 {key} mismatch"\r
      [p.name for p in paths]\r
    exercise:\r
      prompt: "fillForm 함수의 본문을 직접 작성하세요. templatePath의 PDF를 PdfWriter(clone_from=...)로 복제한 뒤 update_page_form_field_values로 첫 페이지에 data를 채우고 outPath로 저장해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildForm(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 720, "Name:")\r
            canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
            canvas.drawString(72, 690, "Phone:")\r
            canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def fillForm(templatePath, outPath, data):\r
            ___  # reader 로드 + PdfWriter(clone_from=reader) + update_page_form_field_values + write\r
\r
        def generateForms(templatePath, outFolder, applicants):\r
            Path(outFolder).mkdir(exist_ok=True)\r
            outputs = []\r
            for applicant in applicants:\r
                safeName = applicant["applicantName"].replace(" ", "_")\r
                outPath = Path(outFolder) / f"{safeName}.pdf"\r
                fillForm(templatePath, outPath, applicant)\r
                outputs.append(outPath)\r
            return outputs\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        buildForm(base / "tpl.pdf")\r
        applicants = [\r
            {"applicantName": "Kim", "applicantPhone": "010-1"},\r
            {"applicantName": "Park", "applicantPhone": "010-2"},\r
            {"applicantName": "Lee", "applicantPhone": "010-3"},\r
        ]\r
        paths = generateForms(base / "tpl.pdf", base / "out", applicants)\r
        for path, applicant in zip(paths, applicants):\r
            fields = PdfReader(path).get_fields() or {}\r
            for key, value in applicant.items():\r
                assert fields.get(key, {}).get("/V") == value\r
        len(paths)\r
      hints:\r
        - "reader = PdfReader(templatePath); writer = PdfWriter(clone_from=reader)"\r
        - "writer.update_page_form_field_values(writer.pages[0], data); writer.write(str(outPath))"\r
    check:\r
      noError: "applicants 리스트의 각 dict 키가 양식 필드 name과 같아야 합니다."\r
      resultCheck: "출력 3."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    subtitle: "AcroForm vs XFA, writer.pages vs reader.pages"\r
    goal: "AcroForm만 지원, writer 페이지에 적용해야 한다는 두 함정을 차단한다."\r
    why: "Adobe LiveCycle 양식(XFA)은 pypdf로 채울 수 없습니다. update_page_form_field_values를 reader.pages에 적용하면 저장이 반영되지 않습니다."\r
    explanation: |-\r
      양식 PDF를 받았는데 채워지지 않으면 두 가지를 의심합니다. (1) XFA 양식이면 본 트랙으로는 채울 수 없습니다 → LibreOffice 또는 다른 도구 필요. (2) update_page_form_field_values를 writer가 아닌 reader의 페이지에 적용했으면 저장이 안 됩니다.\r
    tips:\r
      - "양식 PDF 종류는 PdfReader의 trailer 정보로 일부 식별 가능합니다. XFA가 의심되면 PDF를 텍스트 에디터로 열어 '/XFA' 문자열을 검색해 보세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildForm(path):\r
          canvas = Canvas(str(path))\r
          canvas.acroForm.textfield(name="f1", x=72, y=700, width=200, height=20)\r
          canvas.showPage()\r
          canvas.save()\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      tplPath = base / "tpl.pdf"\r
      outPath = base / "out.pdf"\r
      buildForm(tplPath)\r
\r
      reader = PdfReader(tplPath)\r
      writer = PdfWriter(clone_from=reader)\r
      writer.update_page_form_field_values(writer.pages[0], {"f1": "applied"})\r
      writer.write(str(outPath))\r
\r
      filledFields = PdfReader(outPath).get_fields() or {}\r
      filledFields.get("f1", {}).get("/V")\r
    exercise:\r
      prompt: "필드 값을 'check value'로 바꾸고 저장 후 다시 읽었을 때 일치하는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildForm(path):\r
            canvas = Canvas(str(path))\r
            canvas.acroForm.textfield(name="f1", x=72, y=700, width=200, height=20)\r
            canvas.showPage()\r
            canvas.save()\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        tplPath = base / "tpl.pdf"\r
        outPath = base / "out.pdf"\r
        buildForm(tplPath)\r
\r
        reader = PdfReader(tplPath)\r
        writer = PdfWriter(clone_from=reader)\r
        writer.update_page_form_field_values(writer.pages[0], {"f1": ___})\r
        writer.write(str(outPath))\r
\r
        filledFields = PdfReader(outPath).get_fields() or {}\r
        filledFields.get("f1", {}).get("/V") == "check value"\r
      hints:\r
        - "문자열 'check value'."\r
    check:\r
      noError: "dict 값은 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "신청서 일괄 생성기 + 양식 필드 자동 탐색"\r
    goal: "양식 PDF + 신청자 CSV → 채워진 PDF 묶음, 그리고 받은 양식의 필드 이름을 자동 추출하는 두 도구를 만든다."\r
    why: "양식 자동 입력의 끝은 데이터 소스(CSV)에서 시작해 결과 PDF 폴더로 끝나는 한 파이프라인입니다. 회사 양식이 새로 오면 필드 이름을 먼저 알아야 입력 dict를 짤 수 있어, 필드 자동 탐색이 짝패로 따라옵니다."\r
    explanation: |-\r
      미션1은 신청자 dict 리스트로 양식 PDF를 일괄 채우는 함수, 미션2는 받은 양식 PDF의 모든 필드 이름과 기본값을 dict로 돌려주는 탐색 함수입니다.\r
    tips:\r
      - "변수 prefix: bulk*(미션1), probe*(미션2)."\r
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
        - "미션1: bulkFillForms(templatePath, outFolder, applicants) -> list[Path]"\r
        - "미션2: probeFormFields(templatePath) -> dict[str, str] (필드명 → 현재값 또는 빈 문자열)"\r
    check:\r
      noError: "함수 정의 + 결과 검증."\r
      resultCheck: "미션1 리스트 길이 == applicants 길이, 미션2 dict 키 == 양식 필드명."\r
    blocks:\r
      - type: tip\r
        content: "실무에서는 양식 파일이 이미 존재합니다. buildForm 단계는 학습용이고, 실제 코드는 templatePath를 회사 양식 PDF 경로로 받게 합니다."\r
      - type: expansion\r
        title: "미션1: 양식 일괄 채우기 + 검증"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader, PdfWriter\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def buildBulkForm(path):\r
                  canvas = Canvas(str(path))\r
                  canvas.drawString(72, 720, "Name:")\r
                  canvas.acroForm.textfield(name="applicantName", x=140, y=715, width=200, height=20)\r
                  canvas.drawString(72, 690, "Phone:")\r
                  canvas.acroForm.textfield(name="applicantPhone", x=140, y=685, width=200, height=20)\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              def bulkFillForms(templatePath, outFolder, applicants):\r
                  Path(outFolder).mkdir(exist_ok=True)\r
                  outputs = []\r
                  for applicant in applicants:\r
                      safeName = applicant["applicantName"].replace(" ", "_")\r
                      outPath = Path(outFolder) / f"{safeName}.pdf"\r
                      reader = PdfReader(templatePath)\r
                      writer = PdfWriter(clone_from=reader)\r
                      writer.update_page_form_field_values(writer.pages[0], applicant)\r
                      writer.write(str(outPath))\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              bulkDir = TemporaryDirectory()\r
              base = Path(bulkDir.name)\r
              templatePath = base / "tpl.pdf"\r
              outFolder = base / "filled"\r
              buildBulkForm(templatePath)\r
              applicants = [\r
                  {"applicantName": "Kim Daeri", "applicantPhone": "010-1"},\r
                  {"applicantName": "Park Manager", "applicantPhone": "010-2"},\r
                  {"applicantName": "Lee Junior", "applicantPhone": "010-3"},\r
              ]\r
              filledPaths = bulkFillForms(templatePath, outFolder, applicants)\r
              for filledPath, applicant in zip(filledPaths, applicants):\r
                  fields = PdfReader(filledPath).get_fields() or {}\r
                  for key, value in applicant.items():\r
                      assert fields.get(key, {}).get("/V") == value\r
              [p.name for p in filledPaths]\r
      - type: expansion\r
        title: "미션2: 양식 필드 자동 탐색"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def buildProbeForm(path):\r
                  canvas = Canvas(str(path))\r
                  canvas.drawString(72, 750, "Vacation Request")\r
                  canvas.acroForm.textfield(name="employeeName", x=140, y=720, width=200, height=20)\r
                  canvas.acroForm.textfield(name="department", x=140, y=690, width=200, height=20)\r
                  canvas.acroForm.textfield(name="startDate", x=140, y=660, width=200, height=20)\r
                  canvas.acroForm.textfield(name="endDate", x=140, y=630, width=200, height=20)\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              def probeFormFields(templatePath):\r
                  reader = PdfReader(templatePath)\r
                  fields = reader.get_fields() or {}\r
                  result = {}\r
                  for name, spec in fields.items():\r
                      value = spec.get("/V") if isinstance(spec, dict) else None\r
                      result[name] = value if value is not None else ""\r
                  return result\r
\r
              probeDir = TemporaryDirectory()\r
              probePath = Path(probeDir.name) / "vacation.pdf"\r
              buildProbeForm(probePath)\r
              discovered = probeFormFields(probePath)\r
              assert set(discovered.keys()) == {"employeeName", "department", "startDate", "endDate"}\r
              assert all(value == "" for value in discovered.values())\r
              sorted(discovered.keys())\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          양식 자동 채우기 패턴의 응용 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "근로계약서 양식 + HR DB CSV → 신입 N명의 계약서 PDF 자동 생성"\r
          - "공공기관 신청서 양식을 매월 자동 입력 후 메일 발송 (Email 트랙 결합)"\r
          - "체크박스·라디오 버튼 필드 추가 (canvas.acroForm.checkbox 활용)"\r
          - "AcroForm 필드 위치를 회사 양식에 맞춰 좌표 조정"\r
          - "기존 받은 양식 PDF의 모든 필드 이름을 자동 추출해 입력 도우미 dict 템플릿 생성"\r
`;export{e as default};