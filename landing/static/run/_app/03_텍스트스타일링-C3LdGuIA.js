var e=`meta:\r
  id: word_03\r
  title: 텍스트 스타일링\r
  order: 3\r
  category: word\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  packages:\r
    - python-docx\r
  tags:\r
    - run\r
    - font\r
    - East Asian\r
  outcomes:\r
    - automation.word.runs\r
  prerequisites:\r
    - automation.word.paragraphs\r
  estimatedMinutes: 40\r
  seo:\r
    title: "Word 텍스트 스타일링 - run, font, East Asian font 패턴"\r
    description: "Bold·색상·크기를 run 단위로 적용. 한글 East Asian font 의무 패턴으로 폰트 깨짐 차단."\r
    keywords:\r
      - python-docx run font\r
      - East Asian font\r
      - 한글 폰트 docx\r
\r
intro:\r
  direction: "단락을 run 단위로 쪼개 굵기·색·크기를 적용한다. 한글 East Asian font 의무 패턴을 본 강의에서 정착시킨다."\r
  benefits:\r
    - "Bold·색·크기를 run 단위로 제어 - docx 모든 강조 표현이 가능."\r
    - "East Asian font 패턴 한 번 익히면 한글 폰트 깨짐이 트랙 끝까지 없음."\r
    - "06강 스타일 정의 함수의 베이스가 되는 함수 형태 정착."\r
  diagram:\r
    steps:\r
      - label: "1. Paragraph.add_run"\r
        detail: "단락 안에 run을 추가해 부분별로 다른 스타일."\r
      - label: "2. run.font.bold/size/color"\r
        detail: "Bold, 크기, 색 적용."\r
      - label: "3. East Asian font 의무"\r
        detail: "qn('w:eastAsia') 설정으로 한글 폰트 적용."\r
    runtime:\r
      - label: "python-docx"\r
        detail: "docx.oxml.ns.qn 임포트 필요."\r
      - label: "검증"\r
        detail: "Document 재오픈 후 paragraphs[i].runs[j]의 속성 검증."\r
\r
sections:\r
  - id: step1_runs\r
    title: "1단계. add_run으로 부분 스타일"\r
    structuredPrimary: true\r
    subtitle: "p.add_run(text)"\r
    goal: "한 단락 안에 일반 텍스트 + Bold 텍스트가 섞인 구조를 만든다."\r
    why: "단락 전체에 단일 스타일을 적용하면 강조가 안 됩니다. run 단위로 쪼개야 부분 굵기·색·크기 적용이 가능합니다."\r
    explanation: |-\r
      p = doc.add_paragraph()로 빈 단락. p.add_run('일반 텍스트') 후 run = p.add_run(' 강조'); run.bold = True로 일부만 굵게.\r
    tips:\r
      - "add_paragraph(text)는 첫 run을 자동 추가합니다. 빈 단락에 add_run을 여러 번 호출하는 게 더 유연."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "runs.docx"\r
\r
      doc = Document()\r
      p = doc.add_paragraph()\r
      p.add_run("일반 텍스트 ")\r
      bold = p.add_run("강조 부분")\r
      bold.bold = True\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      runs = reopened.paragraphs[0].runs\r
      [(r.text, r.bold) for r in runs]\r
    exercise:\r
      prompt: "세 번째 run으로 ' 마지막'을 추가하고 모두 색을 빨강(0xFF0000)으로 바꾸세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.shared import RGBColor\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "r.docx"\r
\r
        doc = Document()\r
        p = doc.add_paragraph()\r
        for text in ["일반 ", "강조", ___]:\r
            run = p.add_run(text)\r
            run.font.color.rgb = RGBColor(0xFF, 0x00, 0x00)\r
        doc.save(docxPath)\r
\r
        len(Document(docxPath).paragraphs[0].runs)\r
      hints:\r
        - "문자열 ' 마지막'."\r
    check:\r
      noError: "add_run 인자는 문자열."\r
      resultCheck: "출력 3."\r
\r
  - id: step2_east_asian\r
    title: "2단계. East Asian font 의무 패턴"\r
    structuredPrimary: true\r
    subtitle: "qn('w:eastAsia') 설정"\r
    goal: "한글 폰트를 East Asian font 설정까지 포함해 정확히 적용한다."\r
    why: "run.font.name만 설정하면 한글 부분이 기본 영문 폰트로 렌더링됩니다. East Asian font 설정이 빠지면 한글이 깨끗하게 안 보입니다."\r
    explanation: |-\r
      from docx.oxml.ns import qn; run.font.name='맑은 고딕'; run._element.rPr.rFonts.set(qn('w:eastAsia'), '맑은 고딕'). 두 줄이 한 묶음.\r
    tips:\r
      - "rPr이 없는 run에 .rFonts 접근하면 AttributeError. 한 번 font.name을 설정하면 rPr이 자동 생성됩니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.oxml.ns import qn\r
\r
      def applyKoreanFont(run, fontName="맑은 고딕"):\r
          run.font.name = fontName\r
          run._element.rPr.rFonts.set(qn("w:eastAsia"), fontName)\r
\r
      workdir = TemporaryDirectory()\r
      docxPath = Path(workdir.name) / "ko.docx"\r
\r
      doc = Document()\r
      p = doc.add_paragraph()\r
      run = p.add_run("한글 본문이 맑은 고딕으로 보입니다.")\r
      applyKoreanFont(run, "맑은 고딕")\r
      doc.save(docxPath)\r
\r
      reopened = Document(docxPath)\r
      reopened.paragraphs[0].runs[0].font.name\r
    exercise:\r
      prompt: "applyKoreanFont의 함수 본체를 직접 작성하세요 - East Asian font까지 정확히 설정해야 한글이 깨지지 않습니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.oxml.ns import qn\r
\r
        def applyKoreanFont(run, fontName="맑은 고딕"):\r
            run.font.name = fontName\r
            ___  # East Asian font 적용: qn('w:eastAsia') 설정\r
\r
        workdir = TemporaryDirectory()\r
        docxPath = Path(workdir.name) / "k.docx"\r
\r
        doc = Document()\r
        p = doc.add_paragraph()\r
        run = p.add_run("한글 본문")\r
        applyKoreanFont(run, "NanumGothic")\r
        doc.save(docxPath)\r
\r
        run0 = Document(docxPath).paragraphs[0].runs[0]\r
        eastAsia = run0._element.rPr.rFonts.get(qn("w:eastAsia"))\r
        run0.font.name == "NanumGothic" and eastAsia == "NanumGothic"\r
      hints:\r
        - "run._element.rPr.rFonts.set(qn('w:eastAsia'), fontName)"\r
        - "rPr는 font.name 설정 직후 자동 생성됩니다."\r
    check:\r
      noError: "qn('w:eastAsia') 키로 rFonts 설정."\r
      resultCheck: "True 출력 (이름과 East Asian 둘 다 적용)."\r
\r
  - id: validation\r
    title: "3단계. 검증 - 한글 강조 단락 통합"\r
    structuredPrimary: true\r
    subtitle: "Bold + 한글 폰트 + 크기"\r
    goal: "강조된 한글 단락 함수의 결과를 단위 assert로 검증한다."\r
    why: "본 패턴이 06강 스타일 함수의 첫 번째 빌딩 블록입니다."\r
    explanation: |-\r
      buildEmphasis 함수가 한 단락에 일반/강조/한글 폰트를 한 번에 적용. 재오픈 후 runs.font 속성 검증.\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from docx import Document\r
      from docx.oxml.ns import qn\r
      from docx.shared import Pt, RGBColor\r
\r
      def applyKoreanFont(run, fontName="맑은 고딕"):\r
          run.font.name = fontName\r
          run._element.rPr.rFonts.set(qn("w:eastAsia"), fontName)\r
\r
      def buildEmphasis(path, normalText, boldText):\r
          doc = Document()\r
          p = doc.add_paragraph()\r
          n = p.add_run(normalText)\r
          applyKoreanFont(n)\r
          b = p.add_run(boldText)\r
          b.bold = True\r
          b.font.size = Pt(14)\r
          b.font.color.rgb = RGBColor(0xC0, 0x39, 0x2B)\r
          applyKoreanFont(b)\r
          doc.save(path)\r
\r
      vault = TemporaryDirectory()\r
      docxPath = Path(vault.name) / "emp.docx"\r
      buildEmphasis(docxPath, "본문은 ", "여기가 강조")\r
\r
      reopened = Document(docxPath)\r
      runs = reopened.paragraphs[0].runs\r
      assert len(runs) == 2\r
      assert runs[1].bold is True\r
      assert runs[1].font.size == Pt(14)\r
      [(r.text, r.bold) for r in runs]\r
    exercise:\r
      prompt: "buildEmphasis 본체를 완성하세요 - boldText는 Bold + Pt(14) 크기 + 빨강(0xC0,0x39,0x2B)을 모두 적용하고, 두 run 모두 한글 폰트가 들어가야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from docx import Document\r
        from docx.oxml.ns import qn\r
        from docx.shared import Pt, RGBColor\r
\r
        def applyKoreanFont(run, fontName="맑은 고딕"):\r
            run.font.name = fontName\r
            run._element.rPr.rFonts.set(qn("w:eastAsia"), fontName)\r
\r
        def buildEmphasis(path, normalText, boldText):\r
            doc = Document()\r
            p = doc.add_paragraph()\r
            n = p.add_run(normalText)\r
            applyKoreanFont(n)\r
            b = p.add_run(boldText)\r
            ___  # b에 bold/size Pt(14)/color RGBColor(0xC0,0x39,0x2B) 적용 + applyKoreanFont(b)\r
            doc.save(path)\r
\r
        vault = TemporaryDirectory()\r
        docxPath = Path(vault.name) / "e.docx"\r
        buildEmphasis(docxPath, "보고서 ", "월간")\r
        runs = Document(docxPath).paragraphs[0].runs\r
        runs[1].bold, runs[1].font.size, runs[1].font.color.rgb\r
      hints:\r
        - "b.bold = True; b.font.size = Pt(14); b.font.color.rgb = RGBColor(0xC0,0x39,0x2B); applyKoreanFont(b)"\r
        - "네 줄 모두 빠뜨리지 않아야 검증 통과."\r
    check:\r
      noError: "Bold + size + color + 한글 폰트 동시 적용."\r
      resultCheck: "(True, 177800, RGBColor(0xC0, 0x39, 0x2B)) 출력."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션"\r
    subtitle: "한글 강조 단락 생성기"\r
    goal: "단락 빌더 함수를 직접 작성한다."\r
    why: "본 패턴이 트랙 후반의 모든 단락 생성 함수에 재사용됩니다."\r
    explanation: |-\r
      미션: buildKoreanParagraph(doc, normalText, boldText, color) 함수. 한 단락에 두 run, Bold + 색 적용.\r
    snippet: |-\r
      from docx import Document\r
      from docx.oxml.ns import qn\r
      from docx.shared import Pt, RGBColor\r
    exercise:\r
      prompt: "미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        ___\r
      hints:\r
        - "함수: buildKoreanParagraph(doc, normalText, boldText, color=(0x33, 0x33, 0x33))"\r
    check:\r
      noError: "함수 정의."\r
      resultCheck: "run 2개와 색 검증."\r
    blocks:\r
      - type: expansion\r
        title: "미션: 한글 강조 단락"\r
        blocks:\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from docx import Document\r
              from docx.oxml.ns import qn\r
              from docx.shared import Pt, RGBColor\r
\r
              def applyKoreanFont(run, fontName="맑은 고딕"):\r
                  run.font.name = fontName\r
                  run._element.rPr.rFonts.set(qn("w:eastAsia"), fontName)\r
\r
              def buildKoreanParagraph(doc, normalText, boldText, color=(0x33, 0x33, 0x33)):\r
                  p = doc.add_paragraph()\r
                  n = p.add_run(normalText)\r
                  applyKoreanFont(n)\r
                  b = p.add_run(boldText)\r
                  b.bold = True\r
                  b.font.color.rgb = RGBColor(*color)\r
                  applyKoreanFont(b)\r
                  return p\r
\r
              missionDir = TemporaryDirectory()\r
              docxPath = Path(missionDir.name) / "p.docx"\r
              doc = Document()\r
              buildKoreanParagraph(doc, "이번 주 ", "매출 1.2억", color=(0xC0, 0x39, 0x2B))\r
              doc.save(docxPath)\r
\r
              reopened = Document(docxPath)\r
              runs = reopened.paragraphs[0].runs\r
              assert len(runs) == 2\r
              assert runs[1].bold is True\r
              assert runs[1].font.color.rgb == RGBColor(0xC0, 0x39, 0x2B)\r
              [(r.text, r.bold) for r in runs]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "굵기·기울임·밑줄·취소선을 한 함수에서 다중 인자"\r
          - "한 단락에 여러 색 (긍정 녹색, 부정 빨강)"\r
          - "RGBColor를 16진수 문자열로 받는 헬퍼 (예: '#C0392B')"\r
          - "기본 폰트를 '나눔고딕'으로 바꿔 본문 분위기 전환"\r
          - "06강 스타일 정의 함수에 본 패턴 흡수"\r
`;export{e as default};