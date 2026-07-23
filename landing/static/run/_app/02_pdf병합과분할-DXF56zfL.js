var e=`meta:\r
  id: pdf_02\r
  title: PDF 병합과 분할\r
  order: 2\r
  category: pdf\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - pypdf\r
    - reportlab\r
  tags:\r
    - pypdf\r
    - PdfWriter\r
    - merge\r
    - split\r
  outcomes:\r
    - automation.pdf.merge\r
  prerequisites:\r
    - automation.pdf.read\r
    - python.functions\r
  estimatedMinutes: 40\r
  seo:\r
    title: "pypdf PdfWriter - PDF 병합과 분할 자동화"\r
    description: "여러 PDF를 코드로 묶고, 한 PDF를 단원별로 자르는 흐름. PdfWriter.add_page와 write의 기본 패턴을 손에 익힌다."\r
    keywords:\r
      - pypdf 병합\r
      - pypdf 분할\r
      - PdfWriter\r
      - PDF 자동 묶기\r
\r
intro:\r
  direction: "여러 PDF를 한 PDF로 묶고, 한 PDF를 단원별로 자르는 작업을 코드로 처리한다. 협력사 PDF 50종 분리·통합 반복 작업이 40분에서 5초로 줄어드는 흐름이다."\r
  benefits:\r
    - "총무 박과장의 협력사 PDF 50종 정리 작업을 40분에서 5초로 줄인다."\r
    - "PdfWriter.add_page와 write 패턴 한 가지로 합치기·자르기를 모두 처리한다."\r
    - "01강에서 만든 inspectPdfFolder 패턴을 그대로 재사용해 결과를 자동 검증한다."\r
  diagram:\r
    steps:\r
      - label: "1. PdfWriter 만들기"\r
        detail: "빈 PdfWriter() 객체에 페이지를 하나씩 add_page로 누적."\r
      - label: "2. 여러 PDF 병합"\r
        detail: "각 PDF의 reader.pages를 순회하며 writer.add_page."\r
      - label: "3. 한 PDF 분할"\r
        detail: "특정 페이지 인덱스만 새 PdfWriter에 add_page."\r
      - label: "4. 검증"\r
        detail: "결과 PDF를 다시 열어 페이지 수와 첫 줄 텍스트로 assert."\r
    runtime:\r
      - label: "샘플 PDF"\r
        detail: "reportlab으로 강의 시작에 페이지 수가 다른 PDF 3개를 즉석 생성."\r
      - label: "결과 보존"\r
        detail: "병합·분할 결과는 TemporaryDirectory에 저장. PdfReader로 재오픈해 검증."\r
\r
sections:\r
  - id: step1_writer\r
    title: "1단계. PdfWriter 만들고 빈 결과 저장"\r
    structuredPrimary: true\r
    subtitle: "PdfWriter(), writer.write(path)"\r
    goal: "PdfWriter 객체를 만들고 한 페이지짜리 결과 PDF를 임시 폴더에 저장한다."\r
    why: "총무·결재 부서는 협력사 PDF 다섯 장을 한 묶음 결재용 PDF로 합치는 작업을 매주 반복합니다. PdfWriter는 그 결재용 PDF의 빈 그릇이고, add_page로 페이지를 누적해야 의미가 생깁니다. 빈 그릇만 정확히 만들 수 있어도 02강의 병합·분할·발췌가 전부 같은 패턴으로 풀립니다."\r
    explanation: |-\r
      reportlab으로 1페이지 PDF를 만들고, 그 페이지를 PdfReader로 읽어 PdfWriter에 넘긴 뒤 writer.write(outPath)로 저장합니다. write 인자는 파일 핸들 또는 경로 문자열입니다.\r
    tips:\r
      - "writer.write(path)는 'wb' 바이너리 모드 파일을 자동으로 열어 닫습니다. 직접 open할 필요 없습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      srcPath = Path(workdir.name) / "src.pdf"\r
      outPath = Path(workdir.name) / "out.pdf"\r
\r
      canvas = Canvas(str(srcPath))\r
      canvas.drawString(72, 720, "source page")\r
      canvas.showPage()\r
      canvas.save()\r
\r
      writer = PdfWriter()\r
      writer.add_page(PdfReader(srcPath).pages[0])\r
      writer.write(str(outPath))\r
\r
      len(PdfReader(outPath).pages)\r
    exercise:\r
      prompt: "src.pdf에 페이지를 3개로 늘리고, 그 중 첫 두 페이지만 out.pdf에 담으세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        srcPath = Path(workdir.name) / "src.pdf"\r
        outPath = Path(workdir.name) / "out.pdf"\r
\r
        canvas = Canvas(str(srcPath))\r
        for idx in range(___):\r
            canvas.drawString(72, 720, f"page {idx + 1}")\r
            canvas.showPage()\r
        canvas.save()\r
\r
        writer = PdfWriter()\r
        for page in PdfReader(srcPath).pages[___]:\r
            writer.add_page(page)\r
        writer.write(str(outPath))\r
\r
        len(PdfReader(outPath).pages)\r
      hints:\r
        - "슬라이스 [:2]로 처음 두 페이지만 추출."\r
    check:\r
      noError: "writer.write는 str(path)를 받습니다. Path 직접 넘기면 일부 버전에서 실패."\r
      resultCheck: "출력값이 2여야 합니다."\r
\r
  - id: step2_merge\r
    title: "2단계. 여러 PDF 한 PDF로 병합"\r
    structuredPrimary: true\r
    subtitle: "여러 reader의 pages를 writer로 누적"\r
    goal: "3개의 임시 PDF를 한 PDF로 묶고 페이지 수가 합과 같은지 확인한다."\r
    why: "협력사가 PDF 5개를 보냈고 한 묶음으로 결재 올려야 한다면 손으로는 매번 Acrobat을 켜야 합니다. 코드로는 함수 호출 한 번입니다."\r
    explanation: |-\r
      mergePdfs(sources, outPath) 함수가 sources의 모든 페이지를 누적해 outPath로 저장합니다. PdfReader.pages는 그대로 add_page에 넘길 수 있습니다.\r
    tips:\r
      - "병합 순서는 sources 리스트 순서 그대로입니다. 파일명 정렬을 따르려면 sorted()로 미리 정렬하세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makePages(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"{path.stem}-{idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def mergePdfs(sources, outPath):\r
          writer = PdfWriter()\r
          for source in sources:\r
              for page in PdfReader(source).pages:\r
                  writer.add_page(page)\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      makePages(base / "a.pdf", 2)\r
      makePages(base / "b.pdf", 3)\r
      makePages(base / "c.pdf", 1)\r
      merged = base / "merged.pdf"\r
      mergePdfs([base / "a.pdf", base / "b.pdf", base / "c.pdf"], merged)\r
\r
      len(PdfReader(merged).pages)\r
    exercise:\r
      prompt: "PDF 4개(각 1, 4, 2, 3 페이지)를 만들고 한 묶음으로 합쳐 총 페이지 수를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makePages(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"{path.stem}-{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def mergePdfs(sources, outPath):\r
            writer = PdfWriter()\r
            for source in sources:\r
                for page in PdfReader(source).pages:\r
                    writer.add_page(page)\r
            writer.write(str(outPath))\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        for name, pages in [("a", ___), ("b", ___), ("c", ___), ("d", ___)]:\r
            makePages(base / f"{name}.pdf", pages)\r
\r
        merged = base / "merged.pdf"\r
        mergePdfs(sorted(base.glob("*.pdf")), merged)\r
        len(PdfReader(merged).pages)\r
      hints:\r
        - "1+4+2+3 = 10."\r
    check:\r
      noError: "리스트 컴프리헨션에서 각 페이지 수가 정수로 들어가야 합니다."\r
      resultCheck: "출력이 10이어야 합니다."\r
\r
  - id: step3_split\r
    title: "3단계. 한 PDF 분할"\r
    structuredPrimary: true\r
    subtitle: "특정 페이지 범위만 새 PDF로"\r
    goal: "10페이지 PDF에서 5-7페이지만 추출해 별도 파일로 저장한다."\r
    why: "긴 보고서에서 특정 단원만 발췌해 공유하는 작업은 자주 발생합니다. 페이지 범위 선택은 합치기와 같은 패턴 한 줄로 됩니다."\r
    explanation: |-\r
      splitPdf(source, outPath, startIndex, endIndex)에서 reader.pages[startIndex:endIndex]를 그대로 writer에 add_page합니다. 인덱스는 0 기준이고 endIndex는 슬라이스 관행대로 미포함입니다.\r
    tips:\r
      - "사용자에게는 1-based 페이지 번호가 익숙합니다. 함수 표면을 1-based로 받고 내부에서 -1 하는 게 친절합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeLong(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"p{idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def splitByRange(source, outPath, startPage, endPage):\r
          writer = PdfWriter()\r
          for page in PdfReader(source).pages[startPage - 1:endPage]:\r
              writer.add_page(page)\r
          writer.write(str(outPath))\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      bigPath = base / "report.pdf"\r
      makeLong(bigPath, 10)\r
      slicedPath = base / "chapter2.pdf"\r
      splitByRange(bigPath, slicedPath, 5, 7)\r
\r
      len(PdfReader(slicedPath).pages)\r
    exercise:\r
      prompt: "20페이지 PDF에서 11-15페이지만 분할해 결과 페이지 수가 5인지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeLong(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"p{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def splitByRange(source, outPath, startPage, endPage):\r
            writer = PdfWriter()\r
            for page in PdfReader(source).pages[startPage - 1:endPage]:\r
                writer.add_page(page)\r
            writer.write(str(outPath))\r
\r
        workdir = TemporaryDirectory()\r
        base = Path(workdir.name)\r
        bigPath = base / "report.pdf"\r
        makeLong(bigPath, ___)\r
        slicedPath = base / "chapter.pdf"\r
        splitByRange(bigPath, slicedPath, ___, ___)\r
        len(PdfReader(slicedPath).pages)\r
      hints:\r
        - "20페이지를 만들고 11-15 범위 추출 = 5페이지."\r
    check:\r
      noError: "startPage, endPage 모두 정수."\r
      resultCheck: "출력이 5여야 합니다."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 병합·분할 결과 자동 비교"\r
    structuredPrimary: true\r
    subtitle: "원본 페이지 합 = 병합 결과, 분할 합 = 원본"\r
    goal: "여러 PDF를 병합한 결과의 페이지 합과 원본 합이 일치하는지, 분할 결과 합이 원본과 같은지 한 셀에서 검증한다."\r
    why: "병합·분할 작업은 페이지가 누락되거나 중복되는 사고가 잦습니다. assert 한 줄이 사고를 사전에 차단합니다."\r
    explanation: |-\r
      mergePdfs와 splitByRange를 함께 호출해 결과의 페이지 수가 의도와 일치하는지 검증합니다. 이 패턴은 10강 청구서 생성기의 검증 골격이 됩니다.\r
    tips:\r
      - "검증은 함수 호출 직후에 두는 게 안전합니다. 한 셀 안에서 모두 끝내야 디버깅이 쉽습니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makePages(path, pageCount):\r
          canvas = Canvas(str(path))\r
          for idx in range(pageCount):\r
              canvas.drawString(72, 720, f"{path.stem}-{idx + 1}")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def mergePdfs(sources, outPath):\r
          writer = PdfWriter()\r
          for source in sources:\r
              for page in PdfReader(source).pages:\r
                  writer.add_page(page)\r
          writer.write(str(outPath))\r
\r
      vault = TemporaryDirectory()\r
      vaultBase = Path(vault.name)\r
      makePages(vaultBase / "x.pdf", 3)\r
      makePages(vaultBase / "y.pdf", 5)\r
      makePages(vaultBase / "z.pdf", 2)\r
\r
      mergedPath = vaultBase / "merged.pdf"\r
      mergePdfs(sorted(vaultBase.glob("*.pdf")), mergedPath)\r
\r
      originalTotal = sum(len(PdfReader(p).pages) for p in sorted(vaultBase.glob("*.pdf")) if p.name != "merged.pdf")\r
      mergedTotal = len(PdfReader(mergedPath).pages)\r
      assert mergedTotal == originalTotal == 10\r
      mergedTotal, originalTotal\r
    exercise:\r
      prompt: "mergePdfs 함수 본문을 직접 작성하세요. sources 리스트의 모든 PDF 페이지를 한 PdfWriter에 누적해 outPath에 저장해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makePages(path, pageCount):\r
            canvas = Canvas(str(path))\r
            for idx in range(pageCount):\r
                canvas.drawString(72, 720, f"{path.stem}-{idx + 1}")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def mergePdfs(sources, outPath):\r
            writer = PdfWriter()\r
            ___  # 각 source의 모든 페이지를 writer.add_page로 누적 후 writer.write(str(outPath))\r
\r
        vault = TemporaryDirectory()\r
        vaultBase = Path(vault.name)\r
        sizes = [2, 4, 1, 3, 6]\r
        for idx, size in enumerate(sizes, start=1):\r
            makePages(vaultBase / f"{idx}.pdf", size)\r
\r
        mergedPath = vaultBase / "out.pdf"\r
        mergePdfs(sorted(vaultBase.glob("*.pdf")), mergedPath)\r
\r
        merged = len(PdfReader(mergedPath).pages)\r
        assert merged == sum(sizes) == 16\r
        merged\r
      hints:\r
        - "for source in sources: for page in PdfReader(source).pages: writer.add_page(page)"\r
        - "마지막에 writer.write(str(outPath))."\r
    check:\r
      noError: "리스트 합산이 정수여야 assert가 통과합니다."\r
      resultCheck: "출력이 16이어야 합니다."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    subtitle: "병합 시 annotation·하이퍼링크 손실 가능성"\r
    goal: "병합 후에 원본의 일부 부가 정보가 손실될 수 있다는 점을 인지한다."\r
    why: "PdfWriter.add_page는 페이지 콘텐츠를 복사하지만 hyperlink, form field, bookmark 같은 상위 구조는 복사 보장이 없습니다."\r
    explanation: |-\r
      pypdf의 add_page는 페이지 자체를 옮기지만 PDF 문서 수준의 outline(bookmark), 일부 annotation은 기본 동작에서 누락되거나 변형될 수 있습니다. 사내에서 표지·목차가 중요한 문서는 텍스트로 그대로 보이지만 클릭 가능한 링크가 사라질 수 있다는 점을 인지하고, 중요한 문서는 결과 PDF를 한 번 눈으로 확인하세요.\r
    tips:\r
      - "form field가 핵심인 PDF 병합이 필요하면 PdfWriter.append(reader, import_outline=True) 옵션을 검토하거나 09강 AcroForm 패턴을 봅니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      base = Path(workdir.name)\r
      srcPath = base / "linked.pdf"\r
      canvas = Canvas(str(srcPath))\r
      canvas.drawString(72, 720, "see codaro.dev")\r
      canvas.linkURL("https://codaro.dev", (72, 715, 220, 730))\r
      canvas.showPage()\r
      canvas.save()\r
\r
      writer = PdfWriter()\r
      writer.add_page(PdfReader(srcPath).pages[0])\r
      outPath = base / "merged.pdf"\r
      writer.write(str(outPath))\r
\r
      reader = PdfReader(outPath)\r
      reader.pages[0].extract_text()\r
    exercise:\r
      prompt: "병합 후 텍스트는 유지되지만 hyperlink 클릭 동작 보존은 보장 안 된다는 점을 문장으로 적고 실행하세요."\r
      starterCode: |-\r
        note = ___\r
        note\r
      hints:\r
        - "문자열 하나를 적습니다. 예: '병합 후 텍스트는 유지되지만 hyperlink는 보장되지 않음'"\r
    check:\r
      noError: "note가 문자열이어야 합니다."\r
      resultCheck: "문자열이 출력되어야 합니다."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    subtitle: "협력사별 묶음, 단원별 분할 도구"\r
    goal: "병합과 분할 패턴을 결합한 작은 도구 두 개를 직접 작성한다."\r
    why: "한 함수 안에 PdfReader + PdfWriter + Path 처리가 모두 들어와야 자동화 도구가 완성됩니다."\r
    explanation: |-\r
      미션1은 폴더 내 PDF를 작성자별로 묶어 각각 별도 PDF로 저장하는 함수, 미션2는 한 PDF를 N페이지마다 잘라 여러 분할 PDF로 저장하는 함수입니다.\r
    tips:\r
      - "각 미션 import는 위 예제 실행 후 생략 가능."\r
      - "변수 prefix: grp*(미션1), chunk*(미션2)."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader, PdfWriter\r
      from reportlab.pdfgen.canvas import Canvas\r
    exercise:\r
      prompt: "두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader, PdfWriter\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        ___\r
      hints:\r
        - "미션1: groupByAuthor(folder, outFolder) -> dict[author, Path]"\r
        - "미션2: splitEveryN(source, outFolder, n) -> list[Path]"\r
    check:\r
      noError: "함수가 모두 정의되고 호출 결과가 dict/list여야 합니다."\r
      resultCheck: "결과 파일들이 실제로 임시 폴더에 생성되어야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "병합·분할은 같은 add_page 패턴의 응용입니다. 둘을 한 흐름으로 보면 코드가 짧아집니다."\r
      - type: expansion\r
        title: "미션1: 작성자별 묶음"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader, PdfWriter\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def makeAuthored(path, author):\r
                  canvas = Canvas(str(path))\r
                  canvas.setAuthor(author)\r
                  canvas.drawString(72, 720, path.stem)\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              grpDir = TemporaryDirectory()\r
              grpBase = Path(grpDir.name)\r
              for idx, author in enumerate(["김대리", "박과장", "김대리", "박과장", "이주임"], start=1):\r
                  makeAuthored(grpBase / f"{idx}.pdf", author)\r
              grpOut = grpBase / "grouped"\r
              grpOut.mkdir()\r
              sorted(p.name for p in grpBase.glob("*.pdf"))\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def groupByAuthor(folder, outFolder):\r
                  buckets = {}\r
                  for path in sorted(Path(folder).glob("*.pdf")):\r
                      meta = PdfReader(path).metadata\r
                      author = meta.author if meta else "unknown"\r
                      buckets.setdefault(author, []).append(path)\r
                  results = {}\r
                  for author, paths in buckets.items():\r
                      writer = PdfWriter()\r
                      for source in paths:\r
                          for page in PdfReader(source).pages:\r
                              writer.add_page(page)\r
                      outPath = Path(outFolder) / f"{author}.pdf"\r
                      writer.write(str(outPath))\r
                      results[author] = outPath\r
                  return results\r
\r
              groups = groupByAuthor(grpBase, grpOut)\r
              assert set(groups.keys()) == {"김대리", "박과장", "이주임"}\r
              assert all(p.exists() for p in groups.values())\r
              sorted(groups.keys())\r
      - type: expansion\r
        title: "미션2: N페이지마다 분할"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader, PdfWriter\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def makeLongChunk(path, pageCount):\r
                  canvas = Canvas(str(path))\r
                  for idx in range(pageCount):\r
                      canvas.drawString(72, 720, f"p{idx + 1}")\r
                      canvas.showPage()\r
                  canvas.save()\r
\r
              chunkDir = TemporaryDirectory()\r
              chunkBase = Path(chunkDir.name)\r
              chunkSrc = chunkBase / "long.pdf"\r
              makeLongChunk(chunkSrc, 11)\r
              chunkOut = chunkBase / "chunks"\r
              chunkOut.mkdir()\r
              len(PdfReader(chunkSrc).pages)\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def splitEveryN(source, outFolder, n):\r
                  pages = list(PdfReader(source).pages)\r
                  outputs = []\r
                  for chunkIdx, start in enumerate(range(0, len(pages), n)):\r
                      writer = PdfWriter()\r
                      for page in pages[start:start + n]:\r
                          writer.add_page(page)\r
                      outPath = Path(outFolder) / f"chunk_{chunkIdx + 1:02d}.pdf"\r
                      writer.write(str(outPath))\r
                      outputs.append(outPath)\r
                  return outputs\r
\r
              chunks = splitEveryN(chunkSrc, chunkOut, 5)\r
              assert len(chunks) == 3\r
              assert len(PdfReader(chunks[-1]).pages) == 1\r
              [p.name for p in chunks]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          본 강의의 병합·분할 패턴을 실무에 응용하는 아이디어입니다.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "협력사가 보낸 PDF 50개를 자동으로 한 결재용 묶음으로 통합"\r
          - "긴 사업계획서를 단원별 PDF로 분할해 협업 도구에 개별 첨부"\r
          - "월별 보고서 PDF를 1분기·2분기 단위로 자동 묶음"\r
          - "특정 페이지만 빼고 합치기 (목차·표지 제거 후 본문만)"\r
          - "한 PDF의 짝수 페이지만 또는 홀수 페이지만 추출"\r
`;export{e as default};