var e=`meta:\r
  id: word_06\r
  title: 스타일과 페이지 설정\r
  order: 6\r
  category: word\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
    - python-docx\r
  tags:\r
    - styles.add_style\r
    - Pt\r
    - Inches\r
    - page_margins\r
  outcomes:\r
    - automation.word.styles\r
  prerequisites:\r
    - automation.word.runs\r
  estimatedMinutes: 50\r
  seo:\r
    title: "Word 스타일과 페이지 설정 - styles.add_style, Pt, Inches"\r
    description: "사내 양식 스타일을 정의하고 페이지 여백·크기를 코드로 설정. 03강 East Asian font 흡수."\r
    keywords:\r
      - python-docx styles\r
      - add_style\r
      - page_margins\r
\r
intro:\r
  direction: "사내 양식의 단락·헤더 스타일을 add_style로 정의하고 페이지 여백·크기를 일관되게 설정한다."\r
  benefits:\r
    - "한 함수 호출로 모든 보고서에 사내 표준 스타일 적용."\r
    - "03강 East Asian font 패턴이 본 강의 스타일 정의에 흡수돼 한글 깨짐 영구 차단."\r
    - "07·08·10강이 본 강의의 양식 함수를 그대로 호출."\r
  diagram:\r
    steps:\r
      - label: "1. add_style"\r
        detail: "doc.styles.add_style(name, type)로 새 스타일 정의."\r
      - label: "2. font + paragraph"\r
        detail: "스타일에 font, paragraph_format 설정."\r
      - label: "3. page margins"\r
        detail: "doc.sections[0].top_margin = Inches(N)."\r
    runtime:\r
      - label: "docx 표준 스타일과 공존"\r
        detail: "사내 정의 스타일은 영문 이름 권장 ('CodaroBody', 'CodaroHeading')."\r
      - label: "검증"\r
        detail: "단락의 style.name과 page margin assert."\r
\r
sections:\r
  - id: step1_add_style\r
    title: "1단계. 사내 양식 스타일 정의"\r
    structuredPrimary: true\r
    subtitle: "doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)"\r
    goal: "'CodaroBody' 단락 스타일을 정의해 모든 본문에 적용한다."\r
    why: "한 곳에서 스타일을 바꾸면 모든 보고서가 일관되게 변합니다. 디자인 시스템의 기본."\r
    explanation: |-\r
      doc.styles.add_style('CodaroBody', WD_STYLE_TYPE.PARAGRAPH)로 새 단락 스타일. style.font.name과 East Asian font, size, color를 설정.\r
    tips:\r
      - "같은 이름 스타일 중복 등록은 KeyError. 이미 있는지 확인 후 등록."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.enum.style import WD_STYLE_TYPE\r
      from docx.oxml.ns import qn\r
      from docx.shared import Pt\r
\r
      def ensureCodaroBody(doc):\r
          if "CodaroBody" in doc.styles:\r
              return doc.styles["CodaroBody"]\r
          style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)\r
          style.font.name = "맑은 고딕"\r
          style.font.size = Pt(11)\r
          style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
          return style\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "styled.docx"\r
      doc = Document()\r
      ensureCodaroBody(doc)\r
      doc.add_paragraph("본문 첫 줄", style="CodaroBody")\r
      doc.add_paragraph("본문 둘째 줄", style="CodaroBody")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      [(p.text, p.style.name) for p in reopened.paragraphs]\r
    exercise:\r
      prompt: "스타일 size를 Pt(12)로 바꾸세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.enum.style import WD_STYLE_TYPE\r
        from docx.shared import Pt\r
\r
        def ensureBody(doc):\r
            if "MyBody" in doc.styles:\r
                return doc.styles["MyBody"]\r
            style = doc.styles.add_style("MyBody", WD_STYLE_TYPE.PARAGRAPH)\r
            style.font.size = Pt(___)\r
            return style\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "s.docx"\r
        doc = Document()\r
        ensureBody(doc)\r
        doc.add_paragraph("text", style="MyBody")\r
        doc.save(docxPath)\r
        Document(docxPath).styles["MyBody"].font.size\r
      hints:\r
        - "정수 12."\r
    check:\r
      noError: "Pt 인자는 숫자."\r
      resultCheck: "Pt(12) 출력."\r
\r
  - id: step2_page\r
    title: "2단계. 페이지 여백·크기"\r
    structuredPrimary: true\r
    subtitle: "section.top_margin, page_width"\r
    goal: "여백을 모두 Inches(0.8)로 좁히고 페이지가 A4인지 확인한다."\r
    why: "한국 보고서는 1인치보다 좁은 여백이 표준입니다. 공간 활용도가 높아집니다."\r
    explanation: |-\r
      doc.sections[0].top_margin = Inches(0.8). 같은 패턴으로 bottom, left, right.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.shared import Inches\r
\r
      def tightMargins(doc, inches=0.8):\r
          section = doc.sections[0]\r
          section.top_margin = Inches(inches)\r
          section.bottom_margin = Inches(inches)\r
          section.left_margin = Inches(inches)\r
          section.right_margin = Inches(inches)\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "margin.docx"\r
      doc = Document()\r
      tightMargins(doc, 0.8)\r
      doc.add_paragraph("좁은 여백 본문")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      reopened.sections[0].top_margin\r
    exercise:\r
      prompt: "여백을 Inches(0.5)로 더 좁히세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.shared import Inches\r
\r
        def tightMargins(doc, inches=0.8):\r
            section = doc.sections[0]\r
            section.top_margin = Inches(inches)\r
            section.bottom_margin = Inches(inches)\r
            section.left_margin = Inches(inches)\r
            section.right_margin = Inches(inches)\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "m.docx"\r
        doc = Document()\r
        tightMargins(doc, ___)\r
        doc.save(docxPath)\r
        Document(docxPath).sections[0].top_margin == Inches(0.5)\r
      hints:\r
        - "숫자 0.5."\r
    check:\r
      noError: "Inches 인자는 숫자."\r
      resultCheck: "True 출력."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 양식 함수 통합"\r
    structuredPrimary: true\r
    subtitle: "applyCodaroStyles 통합"\r
    goal: "스타일 + 여백을 한 함수에서 적용하고 결과를 검증한다."\r
    why: "본 함수가 트랙 후반 모든 보고서의 양식 베이스가 됩니다."\r
    explanation: |-\r
      applyCodaroStyles(doc)이 사내 양식 스타일 등록 + 페이지 여백 설정을 한 번에. 후속 단계는 그냥 add_paragraph(text, style='CodaroBody').\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.enum.style import WD_STYLE_TYPE\r
      from docx.oxml.ns import qn\r
      from docx.shared import Inches, Pt\r
\r
      def applyCodaroStyles(doc, marginInches=0.8):\r
          if "CodaroBody" not in doc.styles:\r
              style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)\r
              style.font.name = "맑은 고딕"\r
              style.font.size = Pt(11)\r
              style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
          section = doc.sections[0]\r
          section.top_margin = Inches(marginInches)\r
          section.bottom_margin = Inches(marginInches)\r
          section.left_margin = Inches(marginInches)\r
          section.right_margin = Inches(marginInches)\r
          return doc\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "applied.docx"\r
      doc = Document()\r
      applyCodaroStyles(doc, 0.8)\r
      doc.add_paragraph("Codaro 양식 본문", style="CodaroBody")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      assert "CodaroBody" in reopened.styles\r
      assert reopened.paragraphs[0].style.name == "CodaroBody"\r
      assert reopened.sections[0].top_margin == Inches(0.8)\r
      reopened.paragraphs[0].style.name\r
    exercise:\r
      prompt: "applyCodaroStyles 본체를 완성하세요 - CodaroBody 스타일 등록(East Asian font까지) + 네 면 여백을 모두 marginInches로 설정."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.enum.style import WD_STYLE_TYPE\r
        from docx.oxml.ns import qn\r
        from docx.shared import Inches, Pt\r
\r
        def applyCodaroStyles(doc, marginInches=0.8):\r
            if "CodaroBody" not in doc.styles:\r
                style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)\r
                style.font.name = "맑은 고딕"\r
                style.font.size = Pt(11)\r
                ___  # East Asian font: qn('w:eastAsia') = '맑은 고딕'\r
            section = doc.sections[0]\r
            for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):\r
                ___  # setattr로 section의 각 면 여백을 Inches(marginInches)로\r
            return doc\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "v.docx"\r
        doc = Document()\r
        applyCodaroStyles(doc, 1.0)\r
        doc.add_paragraph("본문", style="CodaroBody")\r
        doc.save(docxPath)\r
        s = Document(docxPath).sections[0]\r
        s.top_margin == Inches(1.0) and s.left_margin == Inches(1.0) and s.right_margin == Inches(1.0)\r
      hints:\r
        - "style.element.rPr.rFonts.set(qn('w:eastAsia'), '맑은 고딕')"\r
        - "setattr(section, side, Inches(marginInches))"\r
    check:\r
      noError: "East Asian font + 네 면 여백 모두 설정."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "사내 양식 토대 함수"\r
    goal: "applyCodaroStyles 확장 - 헤더 스타일까지 등록."\r
    why: "본 함수가 트랙 후반의 핵심 빌딩 블록입니다."\r
    explanation: |-\r
      미션: applyCodaroStyles에 CodaroHeading 스타일도 추가. font.size Pt(14), bold.\r
    snippet: |-\r
      from docx import Document\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "CodaroHeading 스타일 추가 + 검증."\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "두 스타일 모두 등록."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 헤더 스타일 확장"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
              from docx.enum.style import WD_STYLE_TYPE\r
              from docx.oxml.ns import qn\r
              from docx.shared import Inches, Pt\r
\r
              def applyCodaroStyles(doc, marginInches=0.8):\r
                  for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:\r
                      if name in doc.styles:\r
                          continue\r
                      style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)\r
                      style.font.name = "맑은 고딕"\r
                      style.font.size = Pt(size)\r
                      style.font.bold = bold\r
                      style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
                  section = doc.sections[0]\r
                  section.top_margin = Inches(marginInches)\r
                  section.bottom_margin = Inches(marginInches)\r
                  section.left_margin = Inches(marginInches)\r
                  section.right_margin = Inches(marginInches)\r
                  return doc\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "ms.docx"\r
              doc = Document()\r
              applyCodaroStyles(doc, 0.8)\r
              doc.add_paragraph("월간 보고서", style="CodaroHeading")\r
              doc.add_paragraph("본문입니다.", style="CodaroBody")\r
              doc.save(docxPath)\r
\r
              reopened = Document(docxPath)\r
              assert "CodaroBody" in reopened.styles\r
              assert "CodaroHeading" in reopened.styles\r
              assert reopened.paragraphs[0].style.name == "CodaroHeading"\r
              assert reopened.paragraphs[1].style.name == "CodaroBody"\r
              [(p.text, p.style.name) for p in reopened.paragraphs]\r
      - type: expansion\r
        title: "미션 2: 줄간격·들여쓰기 포함 풀 스타일 함수"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
              from docx.enum.style import WD_STYLE_TYPE\r
              from docx.oxml.ns import qn\r
              from docx.shared import Inches, Pt\r
\r
              def applyCodaroStylesFull(doc, marginInches=0.8, lineSpacing=1.5, firstLineIndent=0.3):\r
                  if "CodaroBody" not in doc.styles:\r
                      style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)\r
                      style.font.name = "맑은 고딕"\r
                      style.font.size = Pt(11)\r
                      style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")\r
                      pf = style.paragraph_format\r
                      pf.line_spacing = lineSpacing\r
                      pf.first_line_indent = Inches(firstLineIndent)\r
                  section = doc.sections[0]\r
                  for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):\r
                      setattr(section, side, Inches(marginInches))\r
                  return doc\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "full.docx"\r
              doc = Document()\r
              applyCodaroStylesFull(doc, marginInches=0.8, lineSpacing=1.5, firstLineIndent=0.3)\r
              doc.add_paragraph("한국 보고서 본문 첫 줄이 들여쓰기됩니다.", style="CodaroBody")\r
              doc.save(docxPath)\r
\r
              reopened = Document(docxPath)\r
              style = reopened.styles["CodaroBody"]\r
              assert style.paragraph_format.line_spacing == 1.5\r
              assert style.paragraph_format.first_line_indent == Inches(0.3)\r
              style.font.name, style.paragraph_format.line_spacing\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "color도 함께 설정 (Codaro 브랜드 컬러)"\r
          - "줄간격 (paragraph_format.line_spacing)"\r
          - "첫 줄 들여쓰기 (paragraph_format.first_line_indent)"\r
          - "스타일 정의를 JSON 외부 파일에서 로드"\r
          - "사내 양식 모듈을 패키지로 분리해 재사용"\r
`;export{e as default};