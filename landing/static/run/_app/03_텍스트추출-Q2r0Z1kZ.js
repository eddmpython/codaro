var e=`meta:
  id: pdf_03
  title: PDF 텍스트 추출
  order: 3
  category: pdf
  difficulty: ⭐⭐
  badge: 기초
  packages:
    - pypdf
    - pdfplumber
    - reportlab
  tags:
    - extract_text
    - pdfplumber
    - 회의록
  outcomes:
    - automation.pdf.extract
  prerequisites:
    - automation.pdf.read
    - python.strings
  estimatedMinutes: 50
  seo:
    title: "PDF 텍스트 추출 - pypdf와 pdfplumber 비교"
    description: "회의록 PDF에서 본문 텍스트를 뽑아 마크다운으로 정리한다. pypdf.extract_text와 pdfplumber.open 두 방식의 강점·약점을 직접 비교한다."
    keywords:
      - PDF 텍스트 추출
      - pypdf extract_text
      - pdfplumber
      - 회의록 마크다운 변환

intro:
  direction: "회의록·계약서·보고서 PDF에서 본문 텍스트를 코드로 뽑아 마크다운으로 정리한다. 1시간 손작업이 8초로 줄어드는 흐름이다."
  benefits:
    - "회의록 PDF 10건 → 마크다운 변환을 60분에서 8초로 줄인다."
    - "pypdf.extract_text와 pdfplumber.open의 차이를 직접 비교해 본인 PDF에 맞는 도구를 고른다."
    - "추출 텍스트를 자르고 가공하는 함수 패턴이 손에 남아 LLM 입력 전처리에 그대로 재사용 가능."
  diagram:
    steps:
      - label: "1. pypdf로 한 페이지 텍스트"
        detail: "PdfReader(path).pages[i].extract_text()로 간단 추출."
      - label: "2. 모든 페이지 순회"
        detail: "함수화하고 페이지 구분자로 합쳐 전체 본문 만들기."
      - label: "3. pdfplumber로 같은 작업"
        detail: "pdfplumber.open으로 같은 PDF를 다시 추출해 결과를 비교."
      - label: "4. 회의록 → 마크다운"
        detail: "추출 텍스트에서 제목·항목을 식별해 간단 마크다운으로 변환."
    runtime:
      - label: "샘플 PDF 즉석 생성"
        detail: "reportlab으로 회의록 양식 PDF를 임시 생성. 외부 의존 없음."
      - label: "비교 검증"
        detail: "두 도구의 추출 결과 문자열을 assert로 길이·핵심 키워드 단위 비교."

sections:
  - id: step1_one_page
    title: "1단계. pypdf로 한 페이지 텍스트 추출"
    structuredPrimary: true
    subtitle: "PdfReader(path).pages[i].extract_text()"
    goal: "한 페이지 PDF에서 본문 문자열을 추출한다."
    why: "회의록·계약서·정부 공문에서 본문을 코드로 뽑아내는 작업은 사무 자동화에서 빈도가 가장 높습니다. extract_text() 한 줄이 본문을 돌려주지만, 한국어 PDF·이미지 임베드 PDF·정부 공문은 결과 품질이 케이스마다 달라집니다. 첫 단계에서 정상 동작 PDF로 패턴을 굳히면, 이후 어긋난 PDF가 와도 어디를 봐야 할지 바로 보입니다."
    explanation: |-
      reportlab으로 한 페이지짜리 PDF를 만들고, PdfReader로 열어 첫 페이지의 extract_text()를 호출합니다. 결과는 줄바꿈을 포함한 문자열입니다.
    tips:
      - "extract_text 결과는 폰트·레이아웃에 따라 줄바꿈이 의도와 달리 들어갈 수 있습니다. 처리 전에 strip()하고 줄별로 다시 묶는 게 안전합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "note.pdf"
      canvas = Canvas(str(pdfPath))
      canvas.drawString(72, 720, "Codaro PDF lesson")
      canvas.drawString(72, 700, "extract_text demo")
      canvas.showPage()
      canvas.save()

      body = PdfReader(pdfPath).pages[0].extract_text()
      body
    exercise:
      prompt: "두 줄 모두에 'lesson' 문자열이 포함되도록 본문을 바꾸고 추출 결과를 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "note.pdf"
        canvas = Canvas(str(pdfPath))
        canvas.drawString(72, 720, ___)
        canvas.drawString(72, 700, ___)
        canvas.showPage()
        canvas.save()

        body = PdfReader(pdfPath).pages[0].extract_text()
        "lesson" in body
      hints:
        - "두 문자열 모두에 'lesson'을 포함시키세요."
    check:
      noError: "drawString 인자는 문자열입니다."
      resultCheck: "True를 출력해야 합니다."

  - id: step2_all_pages
    title: "2단계. 모든 페이지 순회"
    structuredPrimary: true
    subtitle: "함수화 + 페이지 구분자"
    goal: "여러 페이지 PDF에서 본문 전체를 한 문자열로 추출한다."
    why: "회의록 한 건은 보통 여러 페이지입니다. 페이지 단위 추출을 한 함수로 묶으면 본문 통째 분석이 쉬워집니다."
    explanation: |-
      extractAllText(path)가 모든 페이지의 extract_text를 모아 두 줄바꿈으로 구분된 한 문자열을 돌려주게 합니다. 페이지 경계를 보존하면 후처리 단계에서 페이지 단위로 다시 자르기 쉽습니다.
    tips:
      - "페이지 구분자는 '\\\\n\\\\n---\\\\n\\\\n' 같은 명확한 마커가 후처리에 편리합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def extractAllText(path):
          reader = PdfReader(path)
          parts = [page.extract_text() or "" for page in reader.pages]
          return "\\n\\n---\\n\\n".join(parts)

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "multi.pdf"
      canvas = Canvas(str(pdfPath))
      for idx in range(3):
          canvas.drawString(72, 720, f"page {idx + 1} body")
          canvas.showPage()
      canvas.save()

      fullText = extractAllText(pdfPath)
      fullText.count("---")
    exercise:
      prompt: "4페이지 PDF를 만들고 페이지 구분자가 3번 등장하는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def extractAllText(path):
            reader = PdfReader(path)
            parts = [page.extract_text() or "" for page in reader.pages]
            return "\\n\\n---\\n\\n".join(parts)

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "multi.pdf"
        canvas = Canvas(str(pdfPath))
        for idx in range(___):
            canvas.drawString(72, 720, f"page {idx + 1} body")
            canvas.showPage()
        canvas.save()
        extractAllText(pdfPath).count("---")
      hints:
        - "구분자는 페이지 사이에만 들어가므로 N페이지면 N-1개."
    check:
      noError: "range 인자가 정수여야 합니다."
      resultCheck: "출력이 3이어야 합니다."

  - id: step3_pdfplumber
    title: "3단계. pdfplumber로 같은 작업"
    structuredPrimary: true
    subtitle: "pdfplumber.open(path).pages[i].extract_text()"
    goal: "같은 PDF를 pdfplumber로도 추출하고 두 결과의 길이를 비교한다."
    why: "pypdf와 pdfplumber는 추출 알고리즘이 다릅니다. 어떤 PDF에서는 pypdf가, 어떤 PDF에서는 pdfplumber가 더 깔끔합니다. 비교는 본인 PDF에 맞는 도구를 고르는 첫 단계입니다."
    explanation: |-
      pdfplumber는 with 컨텍스트 매니저로 열고, pages 컬렉션의 extract_text()를 같은 형태로 호출합니다. API 모양이 비슷해 전환 비용이 낮습니다.
    tips:
      - "pdfplumber는 표 추출 능력이 강점입니다. 일반 본문 텍스트만 보면 pypdf와 큰 차이가 없을 수 있습니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      import pdfplumber
      from reportlab.pdfgen.canvas import Canvas

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "compare.pdf"
      canvas = Canvas(str(pdfPath))
      for idx in range(2):
          canvas.drawString(72, 720, f"sample body line {idx + 1}")
          canvas.showPage()
      canvas.save()

      pyText = "\\n".join(p.extract_text() or "" for p in PdfReader(pdfPath).pages)
      with pdfplumber.open(pdfPath) as doc:
          plumberText = "\\n".join(p.extract_text() or "" for p in doc.pages)

      len(pyText), len(plumberText)
    exercise:
      prompt: "두 결과의 길이를 비교하고, 차이가 5자 이내라면 True를 돌려주는 표현을 작성하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        import pdfplumber
        from reportlab.pdfgen.canvas import Canvas

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "compare.pdf"
        canvas = Canvas(str(pdfPath))
        for idx in range(2):
            canvas.drawString(72, 720, f"sample body line {idx + 1}")
            canvas.showPage()
        canvas.save()

        pyText = "\\n".join(p.extract_text() or "" for p in PdfReader(pdfPath).pages)
        with pdfplumber.open(pdfPath) as doc:
            plumberText = "\\n".join(p.extract_text() or "" for p in doc.pages)

        abs(len(pyText) - len(plumberText)) <= ___
      hints:
        - "차이 5자 이내. 정수 그대로."
    check:
      noError: "with 블록 들여쓰기 주의."
      resultCheck: "True가 출력되어야 합니다."

  - id: step4_to_markdown
    title: "4단계. 회의록 → 마크다운 변환"
    structuredPrimary: true
    subtitle: "텍스트에서 제목 식별 + 마커 추가"
    goal: "회의록 PDF를 추출하고, 첫 줄을 H1 제목, 'ACTION:' 시작 줄을 항목으로 표시하는 마크다운을 만든다."
    why: "추출은 끝이 아닙니다. 추출 텍스트를 가공해 사람이 다시 쓰기 좋은 형식으로 변환하는 게 자동화의 가치입니다."
    explanation: |-
      추출 본문을 줄 단위로 순회하면서 인덱스 0은 '# 제목'으로, 'ACTION:' 시작 줄은 '- [ ] '로 변환합니다. 회의록 양식이 정형화돼 있으면 간단한 규칙으로 충분히 깔끔한 마크다운이 됩니다.
    tips:
      - "회의록 양식이 회사마다 다릅니다. 본인 양식에 맞춰 규칙을 늘리세요."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      from reportlab.pdfgen.canvas import Canvas

      def buildSampleMinutes(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 750, "Weekly Sync 2026-05-28")
          canvas.drawString(72, 730, "Attendees: Kim, Park, Lee")
          canvas.drawString(72, 710, "ACTION: Kim draft proposal")
          canvas.drawString(72, 690, "ACTION: Park review on Friday")
          canvas.showPage()
          canvas.save()

      def toMarkdown(path):
          body = PdfReader(path).pages[0].extract_text() or ""
          lines = [line.strip() for line in body.splitlines() if line.strip()]
          out = []
          for idx, line in enumerate(lines):
              if idx == 0:
                  out.append(f"# {line}")
              elif line.startswith("ACTION:"):
                  out.append(f"- [ ] {line[len('ACTION:'):].strip()}")
              else:
                  out.append(line)
          return "\\n".join(out)

      workdir = TemporaryDirectory()
      pdfPath = Path(workdir.name) / "minutes.pdf"
      buildSampleMinutes(pdfPath)
      markdown = toMarkdown(pdfPath)
      markdown
    exercise:
      prompt: "toMarkdown 함수의 루프 본문을 직접 작성하세요. 첫 줄은 '# 제목', 'ACTION:' 시작 줄은 '- [ ] ...' 체크박스, 'DECISION:' 시작 줄은 '> 결정: ...' 인용, 그 외 줄은 그대로 보존해야 합니다."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas

        def buildSampleMinutes(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 750, "Weekly Sync 2026-05-28")
            canvas.drawString(72, 730, "ACTION: Kim draft proposal")
            canvas.drawString(72, 710, "DECISION: ship on Friday")
            canvas.drawString(72, 690, "Notes: review roadmap")
            canvas.showPage()
            canvas.save()

        def toMarkdown(path):
            body = PdfReader(path).pages[0].extract_text() or ""
            lines = [line.strip() for line in body.splitlines() if line.strip()]
            out = []
            for idx, line in enumerate(lines):
                ___  # 첫 줄 H1, ACTION/DECISION/그 외 4-갈래 분기로 out.append
            return "\\n".join(out)

        workdir = TemporaryDirectory()
        pdfPath = Path(workdir.name) / "minutes.pdf"
        buildSampleMinutes(pdfPath)
        result = toMarkdown(pdfPath)
        assert result.startswith("# Weekly Sync")
        assert "- [ ] Kim draft proposal" in result
        assert "> 결정: ship on Friday" in result
        result
      hints:
        - "if idx == 0: '# {line}', elif startswith('ACTION:'): '- [ ] ...', elif startswith('DECISION:'): '> 결정: ...', else: line."
        - "ACTION/DECISION 본문은 line[len(prefix):].strip()으로 떼어냅니다."
    check:
      noError: "startswith 인자는 따옴표로 감싼 문자열."
      resultCheck: "출력에 '> 결정:' 줄이 포함되어야 합니다."

  - id: validation
    title: "5단계. 검증 루프 - 추출 결과 자동 비교"
    structuredPrimary: true
    subtitle: "키워드 포함 + 길이 비교 단일 assert"
    goal: "추출 결과가 의도한 키워드를 포함하는지 한 셀에서 자동 검증한다."
    why: "추출은 결과 품질이 케이스별로 다릅니다. assert 한 줄이 텍스트 품질 회귀를 사전에 잡아냅니다."
    explanation: |-
      pypdf와 pdfplumber 두 결과 모두 의도한 키워드를 포함하는지 확인합니다. 키워드는 회의록의 핵심 단어로, 추출 도구가 바뀌어도 사라지면 안 되는 표지입니다.
    tips:
      - "키워드 기반 검증은 약한 검증입니다. 정확한 일치가 필요하면 전체 텍스트를 fixture로 두고 동등성 비교를 합니다."
    snippet: |-
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from pypdf import PdfReader
      import pdfplumber
      from reportlab.pdfgen.canvas import Canvas

      def buildKeywordPdf(path):
          canvas = Canvas(str(path))
          canvas.drawString(72, 720, "weekly sync 2026-05-28")
          canvas.drawString(72, 700, "ACTION review proposal")
          canvas.showPage()
          canvas.save()

      vault = TemporaryDirectory()
      pdfPath = Path(vault.name) / "doc.pdf"
      buildKeywordPdf(pdfPath)

      pyText = PdfReader(pdfPath).pages[0].extract_text() or ""
      with pdfplumber.open(pdfPath) as doc:
          plumberText = doc.pages[0].extract_text() or ""

      for keyword in ["weekly", "ACTION", "proposal"]:
          assert keyword in pyText, f"pypdf missing {keyword}"
          assert keyword in plumberText, f"pdfplumber missing {keyword}"
      len(pyText), len(plumberText)
    exercise:
      prompt: "키워드 리스트에 'review'와 'sync'를 추가해 두 도구 모두 통과하는지 확인하세요."
      starterCode: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from pypdf import PdfReader
        import pdfplumber
        from reportlab.pdfgen.canvas import Canvas

        def buildKeywordPdf(path):
            canvas = Canvas(str(path))
            canvas.drawString(72, 720, "weekly sync 2026-05-28")
            canvas.drawString(72, 700, "ACTION review proposal")
            canvas.showPage()
            canvas.save()

        vault = TemporaryDirectory()
        pdfPath = Path(vault.name) / "doc.pdf"
        buildKeywordPdf(pdfPath)

        pyText = PdfReader(pdfPath).pages[0].extract_text() or ""
        with pdfplumber.open(pdfPath) as doc:
            plumberText = doc.pages[0].extract_text() or ""

        for keyword in ["weekly", "ACTION", "proposal", ___, ___]:
            assert keyword in pyText
            assert keyword in plumberText
        len(pyText)
      hints:
        - "두 문자열 모두 따옴표로."
    check:
      noError: "리스트 항목은 모두 문자열."
      resultCheck: "출력이 정수여야 합니다."

  - id: misconception
    title: "6단계. 흔한 오개념 차단"
    subtitle: "extract_text가 None일 수 있다"
    goal: "추출 결과가 None일 수 있다는 사실을 인지하고 가드를 둔다."
    why: "이미지로만 된 PDF, 폰트 임베드가 없는 PDF, 일부 보안 설정 PDF는 extract_text가 None이거나 빈 문자열을 돌려줍니다. None을 가정하지 않은 코드는 AttributeError로 죽습니다."
    explanation: |-
      page.extract_text() or "" 패턴이 가장 짧고 안전합니다. None을 빈 문자열로 강제 변환해 후속 메서드(.splitlines, .strip)가 안전하게 동작합니다.
    tips:
      - "이미지 PDF는 OCR(Tesseract, paddleOCR)이 필요합니다. 본 트랙은 OCR을 다루지 않지만 확장 변주에서 안내합니다."
    snippet: |-
      from pypdf import PdfReader
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from reportlab.pdfgen.canvas import Canvas

      def safeExtract(path, pageIdx):
          return PdfReader(path).pages[pageIdx].extract_text() or ""

      workdir = TemporaryDirectory()
      blankPath = Path(workdir.name) / "blank.pdf"
      canvas = Canvas(str(blankPath))
      canvas.showPage()
      canvas.save()

      safeExtract(blankPath, 0)
    exercise:
      prompt: "safeExtract가 빈 문자열을 돌려주는지 확인하세요."
      starterCode: |-
        from pypdf import PdfReader
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from reportlab.pdfgen.canvas import Canvas

        def safeExtract(path, pageIdx):
            return PdfReader(path).pages[pageIdx].extract_text() or ___

        workdir = TemporaryDirectory()
        blankPath = Path(workdir.name) / "blank.pdf"
        canvas = Canvas(str(blankPath))
        canvas.showPage()
        canvas.save()

        safeExtract(blankPath, 0) == ""
      hints:
        - "or 뒤 빈 문자열은 두 쌍의 따옴표."
    check:
      noError: "or 뒤가 문자열."
      resultCheck: "True 출력."

  - id: practice
    title: "실습 - 종합 미션 2개"
    subtitle: "본문 검색기 + 회의록 정리기"
    goal: "텍스트 추출 패턴을 활용한 실용 함수 두 개를 작성한다."
    why: "키워드 검색과 회의록 정리는 빈도가 가장 높은 PDF 텍스트 활용 사례입니다."
    explanation: |-
      미션1은 PDF 본문에 특정 키워드 등장 횟수를 세는 함수, 미션2는 회의록 PDF에서 ACTION 항목만 리스트로 추출하는 함수입니다.
    tips:
      - "미션 변수 prefix: cnt*(미션1), act*(미션2)."
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
        - "미션1: countKeyword(path, keyword) -> int"
        - "미션2: extractActions(path) -> list[str]"
    check:
      noError: "함수가 정의되어야 합니다."
      resultCheck: "미션1은 정수, 미션2는 문자열 리스트."
    blocks:
      - type: tip
        content: "키워드 검색은 case sensitivity가 함정입니다. 대소문자 무시 비교를 원하면 lower()로 통일하세요."
      - type: expansion
        title: "미션1: 키워드 등장 횟수"
        blocks:
          - type: code
            title: "데이터 준비"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader
              from reportlab.pdfgen.canvas import Canvas

              cntDir = TemporaryDirectory()
              cntPath = Path(cntDir.name) / "doc.pdf"
              canvas = Canvas(str(cntPath))
              canvas.drawString(72, 720, "report report report")
              canvas.drawString(72, 700, "data report")
              canvas.showPage()
              canvas.save()
              len(PdfReader(cntPath).pages)
          - type: code
            title: "함수 정의와 검증"
            content: |-
              def countKeyword(path, keyword):
                  total = 0
                  for page in PdfReader(path).pages:
                      text = (page.extract_text() or "").lower()
                      total += text.count(keyword.lower())
                  return total

              assert countKeyword(cntPath, "report") == 4
              assert countKeyword(cntPath, "REPORT") == 4
              countKeyword(cntPath, "data")
      - type: expansion
        title: "미션2: ACTION 항목 추출"
        blocks:
          - type: code
            title: "데이터 준비"
            content: |-
              from pathlib import Path
              from tempfile import TemporaryDirectory
              from pypdf import PdfReader
              from reportlab.pdfgen.canvas import Canvas

              actDir = TemporaryDirectory()
              actPath = Path(actDir.name) / "minutes.pdf"
              canvas = Canvas(str(actPath))
              canvas.drawString(72, 750, "Weekly Sync")
              canvas.drawString(72, 730, "ACTION Kim draft proposal")
              canvas.drawString(72, 710, "Discussion: roadmap")
              canvas.drawString(72, 690, "ACTION Park review on Friday")
              canvas.showPage()
              canvas.save()
              len(PdfReader(actPath).pages)
          - type: code
            title: "함수 정의와 검증"
            content: |-
              def extractActions(path):
                  actions = []
                  for page in PdfReader(path).pages:
                      for line in (page.extract_text() or "").splitlines():
                          stripped = line.strip()
                          if stripped.startswith("ACTION"):
                              actions.append(stripped)
                  return actions

              found = extractActions(actPath)
              assert len(found) == 2
              assert "Kim draft proposal" in found[0]
              found

  - id: extensions
    title: "확장 변주"
    blocks:
      - type: text
        content: |-
          텍스트 추출 패턴을 실무에 응용하는 아이디어입니다.
      - type: list
        style: bullet
        items:
          - "회의록 100건 일괄 마크다운 변환 후 git 저장소에 commit"
          - "계약서 PDF에서 금액·기간 패턴 정규식 추출"
          - "추출 텍스트를 llmBasics 트랙의 구조화 출력으로 넘겨 JSON 요약"
          - "이미지 PDF는 OCR(예: pytesseract) 폴백 흐름 추가"
          - "추출 결과를 검색 가능한 SQLite 인덱스로 저장"
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
  - id: pdf_03-pdf-text-coverage-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_one_page
    - extensions
    title: 페이지별 PDF text 추출 coverage 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 빈 text와 replacement character 비율을 계산해 OCR 후보를 찾는다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 전체 PDF text 길이보다 페이지별 빈 text와 깨진 문자 비율을 보세요.
    - OCR은 전체 문서가 아니라 근거가 있는 page 후보에만 적용하세요.
    exercise:
      prompt: audit_text_extraction(pages, maximum_replacement_ratio)를 완성하세요.
      starterCode: |-
        def audit_text_extraction(pages, maximum_replacement_ratio):
            raise NotImplementedError
      solution: |
        def audit_text_extraction(pages, maximum_replacement_ratio):
            empty = []
            corrupted = []
            details = []
            for page in pages:
                text = page.get("text", "")
                replacement_count = text.count("�")
                ratio = 0.0 if not text else round(replacement_count / len(text), 4)
                if not text.strip():
                    empty.append(page["number"])
                if ratio > maximum_replacement_ratio:
                    corrupted.append(page["number"])
                details.append({"page": page["number"], "characterCount": len(text), "replacementRatio": ratio})
            return {"accepted": not empty and not corrupted, "emptyPages": empty, "corruptedPages": corrupted, "details": details, "ocrCandidates": sorted(set(empty + corrupted))}
      hints: *id001
    check:
      id: python.pdf.pdf_03.pdf-text-coverage.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_03.pdf-text-coverage.mastery.behavior.v1.fixture
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
        entry: audit_text_extraction
        cases:
        - id: accepts-clean-page-text
          arguments:
          - value:
            - number: 1
              text: Hello PDF
          - value: 0.1
          expectedReturn:
            accepted: true
            emptyPages: []
            corruptedPages: []
            details:
            - page: 1
              characterCount: 9
              replacementRatio: 0.0
            ocrCandidates: []
        - id: reports-empty-page
          arguments:
          - value:
            - number: 1
              text: '   '
          - value: 0.1
          expectedReturn:
            accepted: false
            emptyPages:
            - 1
            corruptedPages: []
            details:
            - page: 1
              characterCount: 3
              replacementRatio: 0.0
            ocrCandidates:
            - 1
        - id: reports-corrupted-page
          arguments:
          - value:
            - number: 2
              text: A��
          - value: 0.5
          expectedReturn:
            accepted: false
            emptyPages: []
            corruptedPages:
            - 2
            details:
            - page: 2
              characterCount: 3
              replacementRatio: 0.6667
            ocrCandidates:
            - 2
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pdf_03-extracted-text-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_03-pdf-text-coverage-mastery
    title: 새 PDF text에 필수 문구·page provenance 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 필수 text가 어느 page에서 몇 번 발견됐는지 대조한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 필수 문구 발견 여부와 page·count provenance를 함께 남기세요.
    - OCR text와 native text는 source kind를 구분해 저장하세요.
    exercise:
      prompt: reconcile_required_text(pages, required_phrases)를 완성하세요.
      starterCode: |-
        def reconcile_required_text(pages, required_phrases):
            raise NotImplementedError
      solution: |
        def reconcile_required_text(pages, required_phrases):
            findings = {}
            for phrase in required_phrases:
                matches = []
                for page in pages:
                    count = page.get("text", "").count(phrase)
                    if count:
                        matches.append({"page": page["number"], "count": count})
                findings[phrase] = matches
            missing = sorted(phrase for phrase, matches in findings.items() if not matches)
            return {"passed": not missing, "missing": missing, "findings": findings}
      hints: *id002
    check:
      id: python.pdf.pdf_03.extracted-text-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_03.extracted-text-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_required_text
        cases:
        - id: finds-phrases-by-page
          arguments:
          - value:
            - number: 1
              text: Invoice Total
            - number: 2
              text: Total Total
          - value:
            - Invoice
            - Total
          expectedReturn:
            passed: true
            missing: []
            findings:
              Invoice:
              - page: 1
                count: 1
              Total:
              - page: 1
                count: 1
              - page: 2
                count: 2
        - id: reports-missing-phrase
          arguments:
          - value:
            - number: 1
              text: Hello
          - value:
            - Total
          expectedReturn:
            passed: false
            missing:
            - Total
            findings:
              Total: []
        - id: handles-empty-requirement
          arguments:
          - value: []
          - value: []
          expectedReturn:
            passed: true
            missing: []
            findings: {}
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pdf_03-pdf-text-extraction-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_03-extracted-text-reconciliation-transfer
    title: PDF text 추출 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: page coverage·corruption·OCR·필수 문구 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.
    - Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.
    exercise:
      prompt: choose_pdf_text_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_pdf_text_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pdf_text_evidence(situation):
            table = {'native': {'action': 'extract page-level text', 'evidence': 'character counts and page hashes', 'risk': 'blank image page'}, 'quality': {'action': 'measure empty and replacement ratio', 'evidence': 'OCR candidate pages', 'risk': 'garbled text'}, 'content': {'action': 'reconcile required phrases', 'evidence': 'page and occurrence counts', 'risk': 'missing business text'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pdf.pdf_03.pdf-text-extraction-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_03.pdf-text-extraction-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pdf_text_evidence
        cases:
        - id: recalls-native
          arguments:
          - value: native
          expectedReturn:
            action: extract page-level text
            evidence: character counts and page hashes
            risk: blank image page
        - id: recalls-quality
          arguments:
          - value: quality
          expectedReturn:
            action: measure empty and replacement ratio
            evidence: OCR candidate pages
            risk: garbled text
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};