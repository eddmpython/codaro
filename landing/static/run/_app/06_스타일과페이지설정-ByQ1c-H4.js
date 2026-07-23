var e=`meta:
  id: word_06
  title: 스타일과 페이지 설정
  order: 6
  category: word
  difficulty: ⭐⭐⭐
  badge: 중급
  packages:
    - python-docx
  tags:
    - styles.add_style
    - Pt
    - Inches
    - page_margins
  outcomes:
    - automation.word.styles
  prerequisites:
    - automation.word.runs
  estimatedMinutes: 50
  seo:
    title: "Word 스타일과 페이지 설정 - styles.add_style, Pt, Inches"
    description: "사내 양식 스타일을 정의하고 페이지 여백·크기를 코드로 설정. 03강 East Asian font 흡수."
    keywords:
      - python-docx styles
      - add_style
      - page_margins

intro:
  direction: "사내 양식의 단락·헤더 스타일을 add_style로 정의하고 페이지 여백·크기를 일관되게 설정한다."
  benefits:
    - "한 함수 호출로 모든 보고서에 사내 표준 스타일 적용."
    - "03강 East Asian font 패턴이 본 강의 스타일 정의에 흡수돼 한글 깨짐 영구 차단."
    - "07·08·10강이 본 강의의 양식 함수를 그대로 호출."
  diagram:
    steps:
      - label: "1. add_style"
        detail: "doc.styles.add_style(name, type)로 새 스타일 정의."
      - label: "2. font + paragraph"
        detail: "스타일에 font, paragraph_format 설정."
      - label: "3. page margins"
        detail: "doc.sections[0].top_margin = Inches(N)."
    runtime:
      - label: "docx 표준 스타일과 공존"
        detail: "사내 정의 스타일은 영문 이름 권장 ('CodaroBody', 'CodaroHeading')."
      - label: "검증"
        detail: "단락의 style.name과 page margin assert."

sections:
  - id: step1_add_style
    title: "1단계. 사내 양식 스타일 정의"
    structuredPrimary: true
    subtitle: "doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)"
    goal: "'CodaroBody' 단락 스타일을 정의해 모든 본문에 적용한다."
    why: "한 곳에서 스타일을 바꾸면 모든 보고서가 일관되게 변합니다. 디자인 시스템의 기본."
    explanation: |-
      doc.styles.add_style('CodaroBody', WD_STYLE_TYPE.PARAGRAPH)로 새 단락 스타일. style.font.name과 East Asian font, size, color를 설정.
    tips:
      - "같은 이름 스타일 중복 등록은 KeyError. 이미 있는지 확인 후 등록."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docx.enum.style import WD_STYLE_TYPE
      from docx.oxml.ns import qn
      from docx.shared import Pt

      def ensureCodaroBody(doc):
          if "CodaroBody" in doc.styles:
              return doc.styles["CodaroBody"]
          style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)
          style.font.name = "맑은 고딕"
          style.font.size = Pt(11)
          style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
          return style

      workdir = TemporaryDirectory()
      docxPath = Path(workdir.name) / "styled.docx"
      doc = Document()
      ensureCodaroBody(doc)
      doc.add_paragraph("본문 첫 줄", style="CodaroBody")
      doc.add_paragraph("본문 둘째 줄", style="CodaroBody")
      doc.save(docxPath)

      reopened = Document(docxPath)
      [(p.text, p.style.name) for p in reopened.paragraphs]
    exercise:
      prompt: "스타일 size를 Pt(12)로 바꾸세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docx.enum.style import WD_STYLE_TYPE
        from docx.shared import Pt

        def ensureBody(doc):
            if "MyBody" in doc.styles:
                return doc.styles["MyBody"]
            style = doc.styles.add_style("MyBody", WD_STYLE_TYPE.PARAGRAPH)
            style.font.size = Pt(___)
            return style

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "s.docx"
        doc = Document()
        ensureBody(doc)
        doc.add_paragraph("text", style="MyBody")
        doc.save(docxPath)
        Document(docxPath).styles["MyBody"].font.size
      hints:
        - "정수 12."
    check:
      noError: "Pt 인자는 숫자."
      resultCheck: "Pt(12) 출력."

  - id: step2_page
    title: "2단계. 페이지 여백·크기"
    structuredPrimary: true
    subtitle: "section.top_margin, page_width"
    goal: "여백을 모두 Inches(0.8)로 좁히고 페이지가 A4인지 확인한다."
    why: "한국 보고서는 1인치보다 좁은 여백이 표준입니다. 공간 활용도가 높아집니다."
    explanation: |-
      doc.sections[0].top_margin = Inches(0.8). 같은 패턴으로 bottom, left, right.
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docx.shared import Inches

      def tightMargins(doc, inches=0.8):
          section = doc.sections[0]
          section.top_margin = Inches(inches)
          section.bottom_margin = Inches(inches)
          section.left_margin = Inches(inches)
          section.right_margin = Inches(inches)

      workdir = TemporaryDirectory()
      docxPath = Path(workdir.name) / "margin.docx"
      doc = Document()
      tightMargins(doc, 0.8)
      doc.add_paragraph("좁은 여백 본문")
      doc.save(docxPath)

      reopened = Document(docxPath)
      reopened.sections[0].top_margin
    exercise:
      prompt: "여백을 Inches(0.5)로 더 좁히세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docx.shared import Inches

        def tightMargins(doc, inches=0.8):
            section = doc.sections[0]
            section.top_margin = Inches(inches)
            section.bottom_margin = Inches(inches)
            section.left_margin = Inches(inches)
            section.right_margin = Inches(inches)

        workdir = TemporaryDirectory()
        docxPath = Path(workdir.name) / "m.docx"
        doc = Document()
        tightMargins(doc, ___)
        doc.save(docxPath)
        Document(docxPath).sections[0].top_margin == Inches(0.5)
      hints:
        - "숫자 0.5."
    check:
      noError: "Inches 인자는 숫자."
      resultCheck: "True 출력."

  - id: validation
    title: "3단계. 검증 - 양식 함수 통합"
    structuredPrimary: true
    subtitle: "applyCodaroStyles 통합"
    goal: "스타일 + 여백을 한 함수에서 적용하고 결과를 검증한다."
    why: "본 함수가 트랙 후반 모든 보고서의 양식 베이스가 됩니다."
    explanation: |-
      applyCodaroStyles(doc)이 사내 양식 스타일 등록 + 페이지 여백 설정을 한 번에. 후속 단계는 그냥 add_paragraph(text, style='CodaroBody').
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from docx import Document
      from docx.enum.style import WD_STYLE_TYPE
      from docx.oxml.ns import qn
      from docx.shared import Inches, Pt

      def applyCodaroStyles(doc, marginInches=0.8):
          if "CodaroBody" not in doc.styles:
              style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)
              style.font.name = "맑은 고딕"
              style.font.size = Pt(11)
              style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
          section = doc.sections[0]
          section.top_margin = Inches(marginInches)
          section.bottom_margin = Inches(marginInches)
          section.left_margin = Inches(marginInches)
          section.right_margin = Inches(marginInches)
          return doc

      vault = TemporaryDirectory()
      docxPath = Path(vault.name) / "applied.docx"
      doc = Document()
      applyCodaroStyles(doc, 0.8)
      doc.add_paragraph("Codaro 양식 본문", style="CodaroBody")
      doc.save(docxPath)

      reopened = Document(docxPath)
      assert "CodaroBody" in reopened.styles
      assert reopened.paragraphs[0].style.name == "CodaroBody"
      assert reopened.sections[0].top_margin == Inches(0.8)
      reopened.paragraphs[0].style.name
    exercise:
      prompt: "applyCodaroStyles 본체를 완성하세요 - CodaroBody 스타일 등록(East Asian font까지) + 네 면 여백을 모두 marginInches로 설정."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from docx import Document
        from docx.enum.style import WD_STYLE_TYPE
        from docx.oxml.ns import qn
        from docx.shared import Inches, Pt

        def applyCodaroStyles(doc, marginInches=0.8):
            if "CodaroBody" not in doc.styles:
                style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)
                style.font.name = "맑은 고딕"
                style.font.size = Pt(11)
                ___  # East Asian font: qn('w:eastAsia') = '맑은 고딕'
            section = doc.sections[0]
            for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):
                ___  # setattr로 section의 각 면 여백을 Inches(marginInches)로
            return doc

        vault = TemporaryDirectory()
        docxPath = Path(vault.name) / "v.docx"
        doc = Document()
        applyCodaroStyles(doc, 1.0)
        doc.add_paragraph("본문", style="CodaroBody")
        doc.save(docxPath)
        s = Document(docxPath).sections[0]
        s.top_margin == Inches(1.0) and s.left_margin == Inches(1.0) and s.right_margin == Inches(1.0)
      hints:
        - "style.element.rPr.rFonts.set(qn('w:eastAsia'), '맑은 고딕')"
        - "setattr(section, side, Inches(marginInches))"
    check:
      noError: "East Asian font + 네 면 여백 모두 설정."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션"
    subtitle: "사내 양식 토대 함수"
    goal: "applyCodaroStyles 확장 - 헤더 스타일까지 등록."
    why: "본 함수가 트랙 후반의 핵심 빌딩 블록입니다."
    explanation: |-
      미션: applyCodaroStyles에 CodaroHeading 스타일도 추가. font.size Pt(14), bold.
    snippet: |-
      from docx import Document
    exercise:
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."
      starterCode: |-
        ___
      hints:
        - "CodaroHeading 스타일 추가 + 검증."
    check:
      noError: "함수 정의."
      resultCheck: "두 스타일 모두 등록."
    blocks:
      - type: expansion
        title: "미션: 헤더 스타일 확장"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document
              from docx.enum.style import WD_STYLE_TYPE
              from docx.oxml.ns import qn
              from docx.shared import Inches, Pt

              def applyCodaroStyles(doc, marginInches=0.8):
                  for name, size, bold in [("CodaroBody", 11, False), ("CodaroHeading", 14, True)]:
                      if name in doc.styles:
                          continue
                      style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
                      style.font.name = "맑은 고딕"
                      style.font.size = Pt(size)
                      style.font.bold = bold
                      style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
                  section = doc.sections[0]
                  section.top_margin = Inches(marginInches)
                  section.bottom_margin = Inches(marginInches)
                  section.left_margin = Inches(marginInches)
                  section.right_margin = Inches(marginInches)
                  return doc

              missionDir = TemporaryDirectory()
              docxPath = Path(missionDir.name) / "ms.docx"
              doc = Document()
              applyCodaroStyles(doc, 0.8)
              doc.add_paragraph("월간 보고서", style="CodaroHeading")
              doc.add_paragraph("본문입니다.", style="CodaroBody")
              doc.save(docxPath)

              reopened = Document(docxPath)
              assert "CodaroBody" in reopened.styles
              assert "CodaroHeading" in reopened.styles
              assert reopened.paragraphs[0].style.name == "CodaroHeading"
              assert reopened.paragraphs[1].style.name == "CodaroBody"
              [(p.text, p.style.name) for p in reopened.paragraphs]
      - type: expansion
        title: "미션 2: 줄간격·들여쓰기 포함 풀 스타일 함수"
        blocks:
          - type: code
            title: "함수 정의와 검증"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from docx import Document
              from docx.enum.style import WD_STYLE_TYPE
              from docx.oxml.ns import qn
              from docx.shared import Inches, Pt

              def applyCodaroStylesFull(doc, marginInches=0.8, lineSpacing=1.5, firstLineIndent=0.3):
                  if "CodaroBody" not in doc.styles:
                      style = doc.styles.add_style("CodaroBody", WD_STYLE_TYPE.PARAGRAPH)
                      style.font.name = "맑은 고딕"
                      style.font.size = Pt(11)
                      style.element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
                      pf = style.paragraph_format
                      pf.line_spacing = lineSpacing
                      pf.first_line_indent = Inches(firstLineIndent)
                  section = doc.sections[0]
                  for side in ("top_margin", "bottom_margin", "left_margin", "right_margin"):
                      setattr(section, side, Inches(marginInches))
                  return doc

              missionDir = TemporaryDirectory()
              docxPath = Path(missionDir.name) / "full.docx"
              doc = Document()
              applyCodaroStylesFull(doc, marginInches=0.8, lineSpacing=1.5, firstLineIndent=0.3)
              doc.add_paragraph("한국 보고서 본문 첫 줄이 들여쓰기됩니다.", style="CodaroBody")
              doc.save(docxPath)

              reopened = Document(docxPath)
              style = reopened.styles["CodaroBody"]
              assert style.paragraph_format.line_spacing == 1.5
              assert style.paragraph_format.first_line_indent == Inches(0.3)
              style.font.name, style.paragraph_format.line_spacing

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: list
        style: bullet
        items:
          - "color도 함께 설정 (Codaro 브랜드 컬러)"
          - "줄간격 (paragraph_format.line_spacing)"
          - "첫 줄 들여쓰기 (paragraph_format.first_line_indent)"
          - "스타일 정의를 JSON 외부 파일에서 로드"
          - "사내 양식 모듈을 패키지로 분리해 재사용"
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
  - id: word_06-page-style-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_add_style
    - extensions
    title: 문서 스타일과 페이지 설정 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 필수 스타일·margin·본문 크기를 한 번에 검증한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 스타일 존재 여부와 실제 size·font 값을 모두 검사하세요.
    - margin과 orientation은 렌더 면적 계약의 일부입니다.
    exercise:
      prompt: audit_page_styles(page, styles, required_styles)를 완성하세요.
      starterCode: |-
        def audit_page_styles(page, styles, required_styles):
            raise NotImplementedError
      solution: |
        def audit_page_styles(page, styles, required_styles):
            failures = []
            missing = sorted(set(required_styles) - set(styles))
            margins = page.get("margins", {})
            bad_margins = sorted(key for key in ["top", "right", "bottom", "left"] if margins.get(key, 0) < 20)
            unreadable = sorted(name for name, style in styles.items() if style.get("sizePt", 0) < 9)
            if missing:
                failures.append("styles")
            if page.get("orientation") not in {"portrait", "landscape"} or bad_margins:
                failures.append("page")
            if unreadable:
                failures.append("readability")
            return {"accepted": not failures, "failures": failures, "missingStyles": missing, "badMargins": bad_margins, "unreadableStyles": unreadable}
      hints: *id001
    check:
      id: python.word.word_06.page-style-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_06.page-style-contract.mastery.behavior.v1.fixture
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
        entry: audit_page_styles
        cases:
        - id: accepts-style-system
          arguments:
          - value:
              orientation: portrait
              margins:
                top: 40
                right: 40
                bottom: 40
                left: 40
          - value:
              Body:
                sizePt: 11
              Heading 1:
                sizePt: 18
          - value:
            - Body
            - Heading 1
          expectedReturn:
            accepted: true
            failures: []
            missingStyles: []
            badMargins: []
            unreadableStyles: []
        - id: reports-missing-and-page
          arguments:
          - value:
              orientation: square
              margins:
                top: 10
                right: 40
                bottom: 40
                left: 5
          - value:
              Body:
                sizePt: 11
          - value:
            - Body
            - Heading 1
          expectedReturn:
            accepted: false
            failures:
            - styles
            - page
            missingStyles:
            - Heading 1
            badMargins:
            - left
            - top
            unreadableStyles: []
        - id: reports-unreadable-style
          arguments:
          - value:
              orientation: landscape
              margins:
                top: 30
                right: 30
                bottom: 30
                left: 30
          - value:
              Body:
                sizePt: 7
          - value:
            - Body
          expectedReturn:
            accepted: false
            failures:
            - readability
            missingStyles: []
            badMargins: []
            unreadableStyles:
            - Body
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: word_06-style-usage-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_06-page-style-contract-mastery
    title: 재개방한 문서의 style 사용을 정책과 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 정의된 스타일과 실제 사용된 스타일의 차이를 찾는다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 문단의 style name을 재개방 결과에서 수집하세요.
    - 직접 서식 예외는 문단 ID allowlist로 제한하세요.
    exercise:
      prompt: reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids)를 완성하세요.
      starterCode: |-
        def reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids):
            raise NotImplementedError
      solution: |
        def reconcile_style_usage(defined, paragraphs, allowed_direct_format_ids):
            undefined = sorted(item["id"] for item in paragraphs if item.get("style") not in defined)
            direct = sorted(item["id"] for item in paragraphs if item.get("directFormatting") and item["id"] not in allowed_direct_format_ids)
            unused = sorted(set(defined) - {item.get("style") for item in paragraphs})
            failures = []
            if undefined:
                failures.append("undefined-style")
            if direct:
                failures.append("direct-formatting")
            return {"passed": not failures, "failures": failures, "undefined": undefined, "unapprovedDirect": direct, "unusedStyles": unused}
      hints: *id002
    check:
      id: python.word.word_06.style-usage-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_06.style-usage-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_style_usage
        cases:
        - id: accepts-policy-usage
          arguments:
          - value:
            - Body
            - Heading 1
          - value:
            - id: p1
              style: Heading 1
            - id: p2
              style: Body
          - value: []
          expectedReturn:
            passed: true
            failures: []
            undefined: []
            unapprovedDirect: []
            unusedStyles: []
        - id: reports-undefined-and-direct
          arguments:
          - value:
            - Body
          - value:
            - id: p1
              style: Custom
              directFormatting: true
          - value: []
          expectedReturn:
            passed: false
            failures:
            - undefined-style
            - direct-formatting
            undefined:
            - p1
            unapprovedDirect:
            - p1
            unusedStyles:
            - Body
        - id: allows-explicit-exception
          arguments:
          - value:
            - Body
            - Caption
          - value:
            - id: p1
              style: Body
              directFormatting: true
          - value:
            - p1
          expectedReturn:
            passed: true
            failures: []
            undefined: []
            unapprovedDirect: []
            unusedStyles:
            - Caption
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: word_06-page-style-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - word_06-style-usage-reconciliation-transfer
    title: Word 스타일 시스템 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 정의·사용·렌더의 서로 다른 증거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 문서 구조와 업무 불변식을 즉시 검증하세요.
    - Local에서는 저장한 docx를 재개방하고 렌더 결과까지 증거로 남기세요.
    exercise:
      prompt: choose_page_style_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_page_style_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_page_style_evidence(stage):
            choices = {'define': {'action': 'declare semantic named styles', 'evidence': 'style token table', 'risk': 'format drift'}, 'use': {'action': 'audit paragraph style references', 'evidence': 'style usage manifest', 'risk': 'hidden direct formatting'}, 'render': {'action': 'inspect pages at target size', 'evidence': 'clipping and readability check', 'risk': 'valid styles with poor pages'}}
            if stage not in choices:
                raise ValueError('unknown stage')
            return choices[stage]
      hints: *id003
    check:
      id: python.word.word_06.page-style-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.word.word_06.page-style-recall.retrieval.behavior.v1.fixture
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
        entry: choose_page_style_evidence
        cases:
        - id: recalls-define
          arguments:
          - value: define
          expectedReturn:
            action: declare semantic named styles
            evidence: style token table
            risk: format drift
        - id: recalls-use
          arguments:
          - value: use
          expectedReturn:
            action: audit paragraph style references
            evidence: style usage manifest
            risk: hidden direct formatting
        - id: recalls-final-stage
          arguments:
          - value: render
          expectedReturn:
            action: inspect pages at target size
            evidence: clipping and readability check
            risk: valid styles with poor pages
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};