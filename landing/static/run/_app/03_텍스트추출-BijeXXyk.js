var e=`meta:\r
  id: pdf_03\r
  title: PDF 텍스트 추출\r
  order: 3\r
  category: pdf\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - pypdf\r
    - pdfplumber\r
    - reportlab\r
  tags:\r
    - extract_text\r
    - pdfplumber\r
    - 회의록\r
  outcomes:\r
    - automation.pdf.extract\r
  prerequisites:\r
    - automation.pdf.read\r
    - python.strings\r
  estimatedMinutes: 50\r
  seo:\r
    title: "PDF 텍스트 추출 - pypdf와 pdfplumber 비교"\r
    description: "회의록 PDF에서 본문 텍스트를 뽑아 마크다운으로 정리한다. pypdf.extract_text와 pdfplumber.open 두 방식의 강점·약점을 직접 비교한다."\r
    keywords:\r
      - PDF 텍스트 추출\r
      - pypdf extract_text\r
      - pdfplumber\r
      - 회의록 마크다운 변환\r
\r
intro:\r
  direction: "회의록·계약서·보고서 PDF에서 본문 텍스트를 코드로 뽑아 마크다운으로 정리한다. 1시간 손작업이 8초로 줄어드는 흐름이다."\r
  benefits:\r
    - "회의록 PDF 10건 → 마크다운 변환을 60분에서 8초로 줄인다."\r
    - "pypdf.extract_text와 pdfplumber.open의 차이를 직접 비교해 본인 PDF에 맞는 도구를 고른다."\r
    - "추출 텍스트를 자르고 가공하는 함수 패턴이 손에 남아 LLM 입력 전처리에 그대로 재사용 가능."\r
  diagram:\r
    steps:\r
      - label: "1. pypdf로 한 페이지 텍스트"\r
        detail: "PdfReader(path).pages[i].extract_text()로 간단 추출."\r
      - label: "2. 모든 페이지 순회"\r
        detail: "함수화하고 페이지 구분자로 합쳐 전체 본문 만들기."\r
      - label: "3. pdfplumber로 같은 작업"\r
        detail: "pdfplumber.open으로 같은 PDF를 다시 추출해 결과를 비교."\r
      - label: "4. 회의록 → 마크다운"\r
        detail: "추출 텍스트에서 제목·항목을 식별해 간단 마크다운으로 변환."\r
    runtime:\r
      - label: "샘플 PDF 즉석 생성"\r
        detail: "reportlab으로 회의록 양식 PDF를 임시 생성. 외부 의존 없음."\r
      - label: "비교 검증"\r
        detail: "두 도구의 추출 결과 문자열을 assert로 길이·핵심 키워드 단위 비교."\r
\r
sections:\r
  - id: step1_one_page\r
    title: "1단계. pypdf로 한 페이지 텍스트 추출"\r
    structuredPrimary: true\r
    subtitle: "PdfReader(path).pages[i].extract_text()"\r
    goal: "한 페이지 PDF에서 본문 문자열을 추출한다."\r
    why: "회의록·계약서·정부 공문에서 본문을 코드로 뽑아내는 작업은 사무 자동화에서 빈도가 가장 높습니다. extract_text() 한 줄이 본문을 돌려주지만, 한국어 PDF·이미지 임베드 PDF·정부 공문은 결과 품질이 케이스마다 달라집니다. 첫 단계에서 정상 동작 PDF로 패턴을 굳히면, 이후 어긋난 PDF가 와도 어디를 봐야 할지 바로 보입니다."\r
    explanation: |-\r
      reportlab으로 한 페이지짜리 PDF를 만들고, PdfReader로 열어 첫 페이지의 extract_text()를 호출합니다. 결과는 줄바꿈을 포함한 문자열입니다.\r
    tips:\r
      - "extract_text 결과는 폰트·레이아웃에 따라 줄바꿈이 의도와 달리 들어갈 수 있습니다. 처리 전에 strip()하고 줄별로 다시 묶는 게 안전합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "note.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      canvas.drawString(72, 720, "Codaro PDF lesson")\r
      canvas.drawString(72, 700, "extract_text demo")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      body = PdfReader(pdfPath).pages[0].extract_text()\r
      body\r
    exercise:\r
      prompt: "두 줄 모두에 'lesson' 문자열이 포함되도록 본문을 바꾸고 추출 결과를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "note.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        canvas.drawString(72, 720, ___)\r
        canvas.drawString(72, 700, ___)\r
        canvas.showPage()\r
        canvas.save()\r
\r
        body = PdfReader(pdfPath).pages[0].extract_text()\r
        "lesson" in body\r
      hints:\r
        - "두 문자열 모두에 'lesson'을 포함시키세요."\r
    check:\r
      noError: "drawString 인자는 문자열입니다."\r
      resultCheck: "True를 출력해야 합니다."\r
\r
  - id: step2_all_pages\r
    title: "2단계. 모든 페이지 순회"\r
    structuredPrimary: true\r
    subtitle: "함수화 + 페이지 구분자"\r
    goal: "여러 페이지 PDF에서 본문 전체를 한 문자열로 추출한다."\r
    why: "회의록 한 건은 보통 여러 페이지입니다. 페이지 단위 추출을 한 함수로 묶으면 본문 통째 분석이 쉬워집니다."\r
    explanation: |-\r
      extractAllText(path)가 모든 페이지의 extract_text를 모아 두 줄바꿈으로 구분된 한 문자열을 돌려주게 합니다. 페이지 경계를 보존하면 후처리 단계에서 페이지 단위로 다시 자르기 쉽습니다.\r
    tips:\r
      - "페이지 구분자는 '\\\\n\\\\n---\\\\n\\\\n' 같은 명확한 마커가 후처리에 편리합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def extractAllText(path):\r
          reader = PdfReader(path)\r
          parts = [page.extract_text() or "" for page in reader.pages]\r
          return "\\n\\n---\\n\\n".join(parts)\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "multi.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      for idx in range(3):\r
          canvas.drawString(72, 720, f"page {idx + 1} body")\r
          canvas.showPage()\r
      canvas.save()\r
\r
      fullText = extractAllText(pdfPath)\r
      fullText.count("---")\r
    exercise:\r
      prompt: "4페이지 PDF를 만들고 페이지 구분자가 3번 등장하는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def extractAllText(path):\r
            reader = PdfReader(path)\r
            parts = [page.extract_text() or "" for page in reader.pages]\r
            return "\\n\\n---\\n\\n".join(parts)\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "multi.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        for idx in range(___):\r
            canvas.drawString(72, 720, f"page {idx + 1} body")\r
            canvas.showPage()\r
        canvas.save()\r
        extractAllText(pdfPath).count("---")\r
      hints:\r
        - "구분자는 페이지 사이에만 들어가므로 N페이지면 N-1개."\r
    check:\r
      noError: "range 인자가 정수여야 합니다."\r
      resultCheck: "출력이 3이어야 합니다."\r
\r
  - id: step3_pdfplumber\r
    title: "3단계. pdfplumber로 같은 작업"\r
    structuredPrimary: true\r
    subtitle: "pdfplumber.open(path).pages[i].extract_text()"\r
    goal: "같은 PDF를 pdfplumber로도 추출하고 두 결과의 길이를 비교한다."\r
    why: "pypdf와 pdfplumber는 추출 알고리즘이 다릅니다. 어떤 PDF에서는 pypdf가, 어떤 PDF에서는 pdfplumber가 더 깔끔합니다. 비교는 본인 PDF에 맞는 도구를 고르는 첫 단계입니다."\r
    explanation: |-\r
      pdfplumber는 with 컨텍스트 매니저로 열고, pages 컬렉션의 extract_text()를 같은 형태로 호출합니다. API 모양이 비슷해 전환 비용이 낮습니다.\r
    tips:\r
      - "pdfplumber는 표 추출 능력이 강점입니다. 일반 본문 텍스트만 보면 pypdf와 큰 차이가 없을 수 있습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      import pdfplumber\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "compare.pdf"\r
      canvas = Canvas(str(pdfPath))\r
      for idx in range(2):\r
          canvas.drawString(72, 720, f"sample body line {idx + 1}")\r
          canvas.showPage()\r
      canvas.save()\r
\r
      pyText = "\\n".join(p.extract_text() or "" for p in PdfReader(pdfPath).pages)\r
      with pdfplumber.open(pdfPath) as doc:\r
          plumberText = "\\n".join(p.extract_text() or "" for p in doc.pages)\r
\r
      len(pyText), len(plumberText)\r
    exercise:\r
      prompt: "두 결과의 길이를 비교하고, 차이가 5자 이내라면 True를 돌려주는 표현을 작성하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        import pdfplumber\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "compare.pdf"\r
        canvas = Canvas(str(pdfPath))\r
        for idx in range(2):\r
            canvas.drawString(72, 720, f"sample body line {idx + 1}")\r
            canvas.showPage()\r
        canvas.save()\r
\r
        pyText = "\\n".join(p.extract_text() or "" for p in PdfReader(pdfPath).pages)\r
        with pdfplumber.open(pdfPath) as doc:\r
            plumberText = "\\n".join(p.extract_text() or "" for p in doc.pages)\r
\r
        abs(len(pyText) - len(plumberText)) <= ___\r
      hints:\r
        - "차이 5자 이내. 정수 그대로."\r
    check:\r
      noError: "with 블록 들여쓰기 주의."\r
      resultCheck: "True가 출력되어야 합니다."\r
\r
  - id: step4_to_markdown\r
    title: "4단계. 회의록 → 마크다운 변환"\r
    structuredPrimary: true\r
    subtitle: "텍스트에서 제목 식별 + 마커 추가"\r
    goal: "회의록 PDF를 추출하고, 첫 줄을 H1 제목, 'ACTION:' 시작 줄을 항목으로 표시하는 마크다운을 만든다."\r
    why: "추출은 끝이 아닙니다. 추출 텍스트를 가공해 사람이 다시 쓰기 좋은 형식으로 변환하는 게 자동화의 가치입니다."\r
    explanation: |-\r
      추출 본문을 줄 단위로 순회하면서 인덱스 0은 '# 제목'으로, 'ACTION:' 시작 줄은 '- [ ] '로 변환합니다. 회의록 양식이 정형화돼 있으면 간단한 규칙으로 충분히 깔끔한 마크다운이 됩니다.\r
    tips:\r
      - "회의록 양식이 회사마다 다릅니다. 본인 양식에 맞춰 규칙을 늘리세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildSampleMinutes(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 750, "Weekly Sync 2026-05-28")\r
          canvas.drawString(72, 730, "Attendees: Kim, Park, Lee")\r
          canvas.drawString(72, 710, "ACTION: Kim draft proposal")\r
          canvas.drawString(72, 690, "ACTION: Park review on Friday")\r
          canvas.showPage()\r
          canvas.save()\r
\r
      def toMarkdown(path):\r
          body = PdfReader(path).pages[0].extract_text() or ""\r
          lines = [line.strip() for line in body.splitlines() if line.strip()]\r
          out = []\r
          for idx, line in enumerate(lines):\r
              if idx == 0:\r
                  out.append(f"# {line}")\r
              elif line.startswith("ACTION:"):\r
                  out.append(f"- [ ] {line[len('ACTION:'):].strip()}")\r
              else:\r
                  out.append(line)\r
          return "\\n".join(out)\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "minutes.pdf"\r
      buildSampleMinutes(pdfPath)\r
      markdown = toMarkdown(pdfPath)\r
      markdown\r
    exercise:\r
      prompt: "toMarkdown 함수의 루프 본문을 직접 작성하세요. 첫 줄은 '# 제목', 'ACTION:' 시작 줄은 '- [ ] ...' 체크박스, 'DECISION:' 시작 줄은 '> 결정: ...' 인용, 그 외 줄은 그대로 보존해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildSampleMinutes(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 750, "Weekly Sync 2026-05-28")\r
            canvas.drawString(72, 730, "ACTION: Kim draft proposal")\r
            canvas.drawString(72, 710, "DECISION: ship on Friday")\r
            canvas.drawString(72, 690, "Notes: review roadmap")\r
            canvas.showPage()\r
            canvas.save()\r
\r
        def toMarkdown(path):\r
            body = PdfReader(path).pages[0].extract_text() or ""\r
            lines = [line.strip() for line in body.splitlines() if line.strip()]\r
            out = []\r
            for idx, line in enumerate(lines):\r
                ___  # 첫 줄 H1, ACTION/DECISION/그 외 4-갈래 분기로 out.append\r
            return "\\n".join(out)\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "minutes.pdf"\r
        buildSampleMinutes(pdfPath)\r
        result = toMarkdown(pdfPath)\r
        assert result.startswith("# Weekly Sync")\r
        assert "- [ ] Kim draft proposal" in result\r
        assert "> 결정: ship on Friday" in result\r
        result\r
      hints:\r
        - "if idx == 0: '# {line}', elif startswith('ACTION:'): '- [ ] ...', elif startswith('DECISION:'): '> 결정: ...', else: line."\r
        - "ACTION/DECISION 본문은 line[len(prefix):].strip()으로 떼어냅니다."\r
    check:\r
      noError: "startswith 인자는 따옴표로 감싼 문자열."\r
      resultCheck: "출력에 '> 결정:' 줄이 포함되어야 합니다."\r
\r
  - id: validation\r
    title: "5단계. 검증 루프 - 추출 결과 자동 비교"\r
    structuredPrimary: true\r
    subtitle: "키워드 포함 + 길이 비교 단일 assert"\r
    goal: "추출 결과가 의도한 키워드를 포함하는지 한 셀에서 자동 검증한다."\r
    why: "추출은 결과 품질이 케이스별로 다릅니다. assert 한 줄이 텍스트 품질 회귀를 사전에 잡아냅니다."\r
    explanation: |-\r
      pypdf와 pdfplumber 두 결과 모두 의도한 키워드를 포함하는지 확인합니다. 키워드는 회의록의 핵심 단어로, 추출 도구가 바뀌어도 사라지면 안 되는 표지입니다.\r
    tips:\r
      - "키워드 기반 검증은 약한 검증입니다. 정확한 일치가 필요하면 전체 텍스트를 fixture로 두고 동등성 비교를 합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      import pdfplumber\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def buildKeywordPdf(path):\r
          canvas = Canvas(str(path))\r
          canvas.drawString(72, 720, "weekly sync 2026-05-28")\r
          canvas.drawString(72, 700, "ACTION review proposal")\r
          canvas.showPage()\r
          canvas.save()\r
\r
      vault = TemporaryDirectory()\r
      pdfPath = Path(vault.name) / "doc.pdf"\r
      buildKeywordPdf(pdfPath)\r
\r
      pyText = PdfReader(pdfPath).pages[0].extract_text() or ""\r
      with pdfplumber.open(pdfPath) as doc:\r
          plumberText = doc.pages[0].extract_text() or ""\r
\r
      for keyword in ["weekly", "ACTION", "proposal"]:\r
          assert keyword in pyText, f"pypdf missing {keyword}"\r
          assert keyword in plumberText, f"pdfplumber missing {keyword}"\r
      len(pyText), len(plumberText)\r
    exercise:\r
      prompt: "키워드 리스트에 'review'와 'sync'를 추가해 두 도구 모두 통과하는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        import pdfplumber\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def buildKeywordPdf(path):\r
            canvas = Canvas(str(path))\r
            canvas.drawString(72, 720, "weekly sync 2026-05-28")\r
            canvas.drawString(72, 700, "ACTION review proposal")\r
            canvas.showPage()\r
            canvas.save()\r
\r
        vault = TemporaryDirectory()\r
        pdfPath = Path(vault.name) / "doc.pdf"\r
        buildKeywordPdf(pdfPath)\r
\r
        pyText = PdfReader(pdfPath).pages[0].extract_text() or ""\r
        with pdfplumber.open(pdfPath) as doc:\r
            plumberText = doc.pages[0].extract_text() or ""\r
\r
        for keyword in ["weekly", "ACTION", "proposal", ___, ___]:\r
            assert keyword in pyText\r
            assert keyword in plumberText\r
        len(pyText)\r
      hints:\r
        - "두 문자열 모두 따옴표로."\r
    check:\r
      noError: "리스트 항목은 모두 문자열."\r
      resultCheck: "출력이 정수여야 합니다."\r
\r
  - id: misconception\r
    title: "6단계. 흔한 오개념 차단"\r
    subtitle: "extract_text가 None일 수 있다"\r
    goal: "추출 결과가 None일 수 있다는 사실을 인지하고 가드를 둔다."\r
    why: "이미지로만 된 PDF, 폰트 임베드가 없는 PDF, 일부 보안 설정 PDF는 extract_text가 None이거나 빈 문자열을 돌려줍니다. None을 가정하지 않은 코드는 AttributeError로 죽습니다."\r
    explanation: |-\r
      page.extract_text() or "" 패턴이 가장 짧고 안전합니다. None을 빈 문자열로 강제 변환해 후속 메서드(.splitlines, .strip)가 안전하게 동작합니다.\r
    tips:\r
      - "이미지 PDF는 OCR(Tesseract, paddleOCR)이 필요합니다. 본 트랙은 OCR을 다루지 않지만 확장 변주에서 안내합니다."\r
    snippet: |-\r
      from pypdf import PdfReader\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def safeExtract(path, pageIdx):\r
          return PdfReader(path).pages[pageIdx].extract_text() or ""\r
\r
      workdir = TemporaryDirectory()\r
      blankPath = Path(workdir.name) / "blank.pdf"\r
      canvas = Canvas(str(blankPath))\r
      canvas.showPage()\r
      canvas.save()\r
\r
      safeExtract(blankPath, 0)\r
    exercise:\r
      prompt: "safeExtract가 빈 문자열을 돌려주는지 확인하세요."\r
      starterCode: |-\r
        from pypdf import PdfReader\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def safeExtract(path, pageIdx):\r
            return PdfReader(path).pages[pageIdx].extract_text() or ___\r
\r
        workdir = TemporaryDirectory()\r
        blankPath = Path(workdir.name) / "blank.pdf"\r
        canvas = Canvas(str(blankPath))\r
        canvas.showPage()\r
        canvas.save()\r
\r
        safeExtract(blankPath, 0) == ""\r
      hints:\r
        - "or 뒤 빈 문자열은 두 쌍의 따옴표."\r
    check:\r
      noError: "or 뒤가 문자열."\r
      resultCheck: "True 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "본문 검색기 + 회의록 정리기"\r
    goal: "텍스트 추출 패턴을 활용한 실용 함수 두 개를 작성한다."\r
    why: "키워드 검색과 회의록 정리는 빈도가 가장 높은 PDF 텍스트 활용 사례입니다."\r
    explanation: |-\r
      미션1은 PDF 본문에 특정 키워드 등장 횟수를 세는 함수, 미션2는 회의록 PDF에서 ACTION 항목만 리스트로 추출하는 함수입니다.\r
    tips:\r
      - "미션 변수 prefix: cnt*(미션1), act*(미션2)."\r
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
        - "미션1: countKeyword(path, keyword) -> int"\r
        - "미션2: extractActions(path) -> list[str]"\r
    check:\r
      noError: "함수가 정의되어야 합니다."\r
      resultCheck: "미션1은 정수, 미션2는 문자열 리스트."\r
    blocks:\r
      - type: tip\r
        content: "키워드 검색은 case sensitivity가 함정입니다. 대소문자 무시 비교를 원하면 lower()로 통일하세요."\r
      - type: expansion\r
        title: "미션1: 키워드 등장 횟수"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              cntDir = TemporaryDirectory()\r
              cntPath = Path(cntDir.name) / "doc.pdf"\r
              canvas = Canvas(str(cntPath))\r
              canvas.drawString(72, 720, "report report report")\r
              canvas.drawString(72, 700, "data report")\r
              canvas.showPage()\r
              canvas.save()\r
              len(PdfReader(cntPath).pages)\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def countKeyword(path, keyword):\r
                  total = 0\r
                  for page in PdfReader(path).pages:\r
                      text = (page.extract_text() or "").lower()\r
                      total += text.count(keyword.lower())\r
                  return total\r
\r
              assert countKeyword(cntPath, "report") == 4\r
              assert countKeyword(cntPath, "REPORT") == 4\r
              countKeyword(cntPath, "data")\r
      - type: expansion\r
        title: "미션2: ACTION 항목 추출"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              actDir = TemporaryDirectory()\r
              actPath = Path(actDir.name) / "minutes.pdf"\r
              canvas = Canvas(str(actPath))\r
              canvas.drawString(72, 750, "Weekly Sync")\r
              canvas.drawString(72, 730, "ACTION Kim draft proposal")\r
              canvas.drawString(72, 710, "Discussion: roadmap")\r
              canvas.drawString(72, 690, "ACTION Park review on Friday")\r
              canvas.showPage()\r
              canvas.save()\r
              len(PdfReader(actPath).pages)\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def extractActions(path):\r
                  actions = []\r
                  for page in PdfReader(path).pages:\r
                      for line in (page.extract_text() or "").splitlines():\r
                          stripped = line.strip()\r
                          if stripped.startswith("ACTION"):\r
                              actions.append(stripped)\r
                  return actions\r
\r
              found = extractActions(actPath)\r
              assert len(found) == 2\r
              assert "Kim draft proposal" in found[0]\r
              found\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          텍스트 추출 패턴을 실무에 응용하는 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "회의록 100건 일괄 마크다운 변환 후 git 저장소에 commit"\r
          - "계약서 PDF에서 금액·기간 패턴 정규식 추출"\r
          - "추출 텍스트를 llmBasics 트랙의 구조화 출력으로 넘겨 JSON 요약"\r
          - "이미지 PDF는 OCR(예: pytesseract) 폴백 흐름 추가"\r
          - "추출 결과를 검색 가능한 SQLite 인덱스로 저장"\r
`;export{e as default};