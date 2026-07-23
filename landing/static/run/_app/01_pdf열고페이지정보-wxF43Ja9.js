var e=`meta:\r
  id: pdf_01\r
  title: PDF 열고 페이지 정보 추출\r
  order: 1\r
  category: pdf\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
    - pypdf\r
    - reportlab\r
  tags:\r
    - pypdf\r
    - PdfReader\r
    - metadata\r
    - 일괄점검\r
  outcomes:\r
    - automation.pdf.read\r
  prerequisites:\r
    - automation.pdf.intro\r
    - python.functions\r
    - python.modulesAndIo\r
  estimatedMinutes: 40\r
  seo:\r
    title: "pypdf로 PDF 열기 - PdfReader, pages, metadata 일괄 점검"\r
    description: "받은 50개 PDF의 페이지 수와 작성자·제목 메타데이터를 코드 한 번으로 표로 정리한다. PdfReader 기본 흐름과 함수화 패턴을 익힌다."\r
    keywords:\r
      - pypdf PdfReader\r
      - PDF 페이지 수\r
      - PDF 메타데이터\r
      - 일괄 PDF 점검\r
\r
intro:\r
  direction: "받은 PDF에서 페이지 수·제목·작성자·작성일 같은 메타 정보를 코드로 뽑아 표로 정리한다. 50개 PDF 일괄 점검이 25분에서 2초로 줄어드는 흐름을 만든다."\r
  benefits:\r
    - "총무 박과장의 협력사 PDF 50개 일괄 점검을 25분에서 2초로 줄인다."\r
    - "PdfReader 객체와 pages 컬렉션, metadata 딕셔너리의 구조를 손에 익힌다."\r
    - "여러 PDF를 한 함수로 점검하고 결과를 dict 리스트로 모으는 자동화 패턴을 만든다."\r
  diagram:\r
    steps:\r
      - label: "1. PdfReader로 열기"\r
        detail: "PdfReader(path)로 PDF 객체를 만든다."\r
      - label: "2. 페이지 수와 본문 길이"\r
        detail: "len(reader.pages)와 reader.pages[0].extract_text() 일부로 빠르게 점검."\r
      - label: "3. 메타데이터"\r
        detail: "reader.metadata의 title·author·creator·created 정보 추출."\r
      - label: "4. 여러 PDF 일괄 점검"\r
        detail: "함수화하고 폴더의 모든 PDF에 반복 적용해 표로 정리."\r
    runtime:\r
      - label: "샘플 PDF 즉석 생성"\r
        detail: "reportlab으로 강의 시작에 점검 대상 PDF를 임시 폴더에 만든다. 외부 다운로드 의존 없음."\r
      - label: "결과 검증"\r
        detail: "각 PDF의 페이지 수와 메타가 의도한 값과 같은지 assert로 자동 검증."\r
\r
sections:\r
  - id: step1_open\r
    title: "1단계. PDF 열고 페이지 수 확인"\r
    structuredPrimary: true\r
    subtitle: "PdfReader(path), len(reader.pages)"\r
    goal: "임시 PDF를 하나 만들고 PdfReader로 열어 페이지 수를 확인한다."\r
    why: "협력사·정부·내부 PDF 점검의 모든 후속 작업이 PdfReader 객체 위에서 일어납니다. 객체가 잘 만들어졌다는 사실 하나로 페이지 수, 메타데이터, 본문, 표 추출이 전부 열립니다. 이 한 줄이 막히면 01-10강 모든 자동화가 멈춥니다."\r
    explanation: |-\r
      reportlab의 Canvas로 3페이지 PDF를 임시 폴더에 만든 뒤 PdfReader(path)로 엽니다. reader.pages는 인덱싱 가능한 시퀀스이고 len()으로 페이지 수를 즉시 알 수 있습니다.\r
    tips:\r
      - "PdfReader는 파일 경로 문자열·Path·바이트 스트림 모두 받습니다. 가장 흔한 형태는 Path 인스턴스입니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      samplePath = Path(workdir.name) / "sample.pdf"\r
      canvas = Canvas(str(samplePath))\r
      for idx in range(3):\r
          canvas.drawString(72, 720, f"page {idx + 1}")\r
          canvas.showPage()\r
      canvas.save()\r
\r
      reader = PdfReader(samplePath)\r
      len(reader.pages)\r
    exercise:\r
      prompt: "페이지 수를 5로 늘려 PDF를 다시 만들고 len(reader.pages)를 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        samplePath = Path(workdir.name) / "sample.pdf"\r
        canvas = Canvas(str(samplePath))\r
        for idx in range(___):\r
            canvas.drawString(72, 720, f"page {idx + 1}")\r
            canvas.showPage()\r
        canvas.save()\r
\r
        reader = PdfReader(samplePath)\r
        len(reader.pages)\r
      hints:\r
        - "range(N)에 페이지 수를 직접 넣습니다."\r
    check:\r
      noError: "Canvas는 str(path)를 요구합니다. Path 객체를 직접 넣으면 TypeError가 나는 경우가 있으니 str()로 감싸세요."\r
      resultCheck: "출력값이 5여야 합니다."\r
\r
  - id: step2_metadata\r
    title: "2단계. 메타데이터 추출"\r
    structuredPrimary: true\r
    subtitle: "reader.metadata, title·author·creator"\r
    goal: "PDF에 작성자와 제목을 심고, 다시 열어 메타데이터를 읽어낸다."\r
    why: "협력사가 보낸 50개 PDF에서 누가 만들었고 언제 만들었는지 빠르게 분류하려면 metadata가 가장 빠른 열쇠입니다."\r
    explanation: |-\r
      reportlab Canvas의 setAuthor·setTitle·setCreator로 메타를 심을 수 있습니다. PdfReader.metadata는 IndirectObject를 감싼 객체로, dict처럼 접근하거나 .title·.author 속성으로 직접 읽습니다.\r
    tips:\r
      - "reader.metadata는 PDF에 메타가 없으면 None이 될 수 있습니다. 함수에서 다룰 때는 None 가드를 두세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      workdir = TemporaryDirectory()\r
      pdfPath = Path(workdir.name) / "report.pdf"\r
      writer = Canvas(str(pdfPath))\r
      writer.setTitle("월간 보고서")\r
      writer.setAuthor("김대리")\r
      writer.setCreator("Codaro PDF 트랙")\r
      writer.drawString(72, 720, "body")\r
      writer.showPage()\r
      writer.save()\r
\r
      meta = PdfReader(pdfPath).metadata\r
      meta.title, meta.author, meta.creator\r
    exercise:\r
      prompt: "setTitle을 '분기 보고서'로, setAuthor를 '박과장'으로 바꾸고 meta를 다시 읽으세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        workdir = TemporaryDirectory()\r
        pdfPath = Path(workdir.name) / "report.pdf"\r
        writer = Canvas(str(pdfPath))\r
        writer.setTitle(___)\r
        writer.setAuthor(___)\r
        writer.setCreator("Codaro PDF 트랙")\r
        writer.drawString(72, 720, "body")\r
        writer.showPage()\r
        writer.save()\r
\r
        meta = PdfReader(pdfPath).metadata\r
        meta.title, meta.author\r
      hints:\r
        - "문자열은 반드시 따옴표로 감싸세요."\r
    check:\r
      noError: "setAuthor/setTitle은 문자열만 받습니다."\r
      resultCheck: "출력 튜플이 ('분기 보고서', '박과장')과 같아야 합니다."\r
\r
  - id: step3_bulk\r
    title: "3단계. 여러 PDF 일괄 점검"\r
    structuredPrimary: true\r
    subtitle: "함수화 + dict 리스트로 결과 모으기"\r
    goal: "임시 폴더에 5개 PDF를 만들고, 한 함수로 모두 점검해 결과를 리스트에 모은다."\r
    why: "PDF 1개 점검은 의미 없습니다. 50개·100개를 일괄로 처리해 표로 만드는 게 자동화의 본질입니다."\r
    explanation: |-\r
      inspectPdf(path)라는 함수가 path 하나를 받아 {파일명, 페이지수, 제목, 작성자} dict를 돌려주게 합니다. 그런 다음 폴더의 모든 PDF에 함수를 적용해 리스트로 모으면 표 형태로 정리 가능합니다.\r
    tips:\r
      - "함수 인자는 Path 또는 str을 모두 허용하도록 Path()로 한 번 감싸세요. 함수 사용자가 어느 쪽을 넣어도 동작합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeSample(path, pageCount, title, author):\r
          canvas = Canvas(str(path))\r
          canvas.setTitle(title)\r
          canvas.setAuthor(author)\r
          for _ in range(pageCount):\r
              canvas.drawString(72, 720, "x")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def inspectPdf(path):\r
          reader = PdfReader(path)\r
          meta = reader.metadata\r
          return {\r
              "file": Path(path).name,\r
              "pages": len(reader.pages),\r
              "title": meta.title if meta else None,\r
              "author": meta.author if meta else None,\r
          }\r
\r
      workdir = TemporaryDirectory()\r
      folder = Path(workdir.name)\r
      makeSample(folder / "a.pdf", 2, "기획안", "김대리")\r
      makeSample(folder / "b.pdf", 5, "계약서", "박과장")\r
      makeSample(folder / "c.pdf", 1, "안내문", "이주임")\r
\r
      report = [inspectPdf(p) for p in sorted(folder.glob("*.pdf"))]\r
      report\r
    exercise:\r
      prompt: "샘플 d.pdf(페이지 7, 제목 '견적서', 작성자 '윤대리')를 하나 더 만들고, inspectPdf가 4개 결과를 돌려주는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeSample(path, pageCount, title, author):\r
            canvas = Canvas(str(path))\r
            canvas.setTitle(title)\r
            canvas.setAuthor(author)\r
            for _ in range(pageCount):\r
                canvas.drawString(72, 720, "x")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def inspectPdf(path):\r
            reader = PdfReader(path)\r
            meta = reader.metadata\r
            return {\r
                "file": Path(path).name,\r
                "pages": len(reader.pages),\r
                "title": meta.title if meta else None,\r
                "author": meta.author if meta else None,\r
            }\r
\r
        workdir = TemporaryDirectory()\r
        folder = Path(workdir.name)\r
        makeSample(folder / "a.pdf", 2, "기획안", "김대리")\r
        makeSample(folder / "b.pdf", 5, "계약서", "박과장")\r
        makeSample(folder / "c.pdf", 1, "안내문", "이주임")\r
        makeSample(folder / "d.pdf", ___, ___, ___)\r
\r
        report = [inspectPdf(p) for p in sorted(folder.glob("*.pdf"))]\r
        len(report), report[-1]\r
      hints:\r
        - "정수는 따옴표 없이, 문자열은 따옴표로."\r
    check:\r
      noError: "makeSample 인자가 4개 모두 채워져야 합니다."\r
      resultCheck: "len(report)가 4이고 마지막 dict의 author가 '윤대리'여야 합니다."\r
\r
  - id: validation\r
    title: "4단계. 검증 루프 - 일괄 점검 결과 자동 확인"\r
    structuredPrimary: true\r
    subtitle: "리스트 결과를 assert로 통째 검증"\r
    goal: "5개 PDF를 만들고 일괄 점검 결과를 assert 한 묶음으로 검증한다."\r
    why: "사람 눈으로 50개 PDF 메타를 비교하는 건 자동화의 의미를 깎습니다. 결과 자체를 자동 검증해야 진짜 자동화입니다."\r
    explanation: |-\r
      inspectPdfFolder(folder)라는 함수에 폴더 경로 하나만 넘기면 리스트가 나오게 합니다. 결과 리스트의 페이지 합계와 작성자 집합을 assert로 한 번에 검증합니다.\r
    tips:\r
      - "TemporaryDirectory는 컨텍스트 매니저로도, 인스턴스로도 쓸 수 있습니다. 인스턴스로 두면 셀 끝나도 폴더가 유지되어 후속 셀에서 재사용 가능합니다."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def makeSample(path, pageCount, title, author):\r
          canvas = Canvas(str(path))\r
          canvas.setTitle(title)\r
          canvas.setAuthor(author)\r
          for _ in range(pageCount):\r
              canvas.drawString(72, 720, "x")\r
              canvas.showPage()\r
          canvas.save()\r
\r
      def inspectPdfFolder(folder):\r
          rows = []\r
          for path in sorted(Path(folder).glob("*.pdf")):\r
              reader = PdfReader(path)\r
              meta = reader.metadata\r
              rows.append({\r
                  "file": path.name,\r
                  "pages": len(reader.pages),\r
                  "title": meta.title if meta else None,\r
                  "author": meta.author if meta else None,\r
              })\r
          return rows\r
\r
      vault = TemporaryDirectory()\r
      base = Path(vault.name)\r
      makeSample(base / "01.pdf", 2, "A", "김대리")\r
      makeSample(base / "02.pdf", 5, "B", "박과장")\r
      makeSample(base / "03.pdf", 1, "C", "이주임")\r
      makeSample(base / "04.pdf", 4, "D", "윤대리")\r
      makeSample(base / "05.pdf", 3, "E", "김대리")\r
\r
      rows = inspectPdfFolder(base)\r
      assert len(rows) == 5\r
      assert sum(row["pages"] for row in rows) == 15\r
      assert {row["author"] for row in rows} == {"김대리", "박과장", "이주임", "윤대리"}\r
      rows\r
    exercise:\r
      prompt: "inspectPdfFolder의 본문을 직접 작성하세요. 폴더의 모든 PDF를 순회하며 파일명·페이지수·제목·작성자 dict 리스트를 돌려줘야 합니다. metadata가 None인 PDF도 안전하게 처리해야 합니다."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def makeSample(path, pageCount, title, author):\r
            canvas = Canvas(str(path))\r
            canvas.setTitle(title)\r
            canvas.setAuthor(author)\r
            for _ in range(pageCount):\r
                canvas.drawString(72, 720, "x")\r
                canvas.showPage()\r
            canvas.save()\r
\r
        def inspectPdfFolder(folder):\r
            rows = []\r
            for path in sorted(Path(folder).glob("*.pdf")):\r
                ___  # PdfReader 열고 metadata None 가드 후 dict append\r
            return rows\r
\r
        vault = TemporaryDirectory()\r
        base = Path(vault.name)\r
        for idx, author in enumerate(["김대리", "박과장", "이주임", "윤대리", "최팀장", "김대리", "박과장"], start=1):\r
            makeSample(base / f"{idx:02d}.pdf", idx, f"T{idx}", author)\r
\r
        rows = inspectPdfFolder(base)\r
        assert len(rows) == 7\r
        assert sum(row["pages"] for row in rows) == 28\r
        assert len({row["author"] for row in rows}) == 5\r
        rows\r
      hints:\r
        - "reader = PdfReader(path), meta = reader.metadata, meta is None 가드 후 rows.append(dict)."\r
        - "dict 키: file, pages, title, author (snippet과 동일 구조)."\r
    check:\r
      noError: "리스트 길이와 enumerate 인자 수가 맞아야 합니다."\r
      resultCheck: "len(rows)가 7, 작성자 unique 수가 5여야 합니다."\r
\r
  - id: misconception\r
    title: "5단계. 흔한 오개념 차단"\r
    structuredPrimary: false\r
    subtitle: "metadata가 None일 때, Path 객체 직접 전달"\r
    goal: "초보자가 빠지는 두 가지 함정을 미리 차단한다."\r
    why: "이 두 가지를 사전에 알면 다음 강의들에서 디버깅 시간이 0이 됩니다."\r
    explanation: |-\r
      함정1: PDF에 메타가 없으면 reader.metadata는 None입니다. None.title은 AttributeError를 냅니다. 함정2: Canvas(path) 인자는 str을 요구합니다. Path 인스턴스를 넘기면 일부 버전에서 TypeError가 납니다.\r
    tips:\r
      - "메타 없는 PDF는 외부에서 받는 케이스에서 흔합니다. 함수에서 항상 None 가드를 두세요."\r
    snippet: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen.canvas import Canvas\r
\r
      def safeAuthor(path):\r
          meta = PdfReader(path).metadata\r
          if meta is None:\r
              return None\r
          return meta.author\r
\r
      workdir = TemporaryDirectory()\r
      noMetaPath = Path(workdir.name) / "raw.pdf"\r
      blank = Canvas(str(noMetaPath))\r
      blank.drawString(72, 720, "no meta")\r
      blank.showPage()\r
      blank.save()\r
\r
      safeAuthor(noMetaPath)\r
    exercise:\r
      prompt: "safeAuthor가 None을 돌려주는지 확인하세요."\r
      starterCode: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen.canvas import Canvas\r
\r
        def safeAuthor(path):\r
            meta = PdfReader(path).metadata\r
            if meta is ___:\r
                return ___\r
            return meta.author\r
\r
        workdir = TemporaryDirectory()\r
        noMetaPath = Path(workdir.name) / "raw.pdf"\r
        blank = Canvas(str(noMetaPath))\r
        blank.drawString(72, 720, "no meta")\r
        blank.showPage()\r
        blank.save()\r
\r
        safeAuthor(noMetaPath)\r
      hints:\r
        - "None 비교는 is None, 반환값도 None."\r
    check:\r
      noError: "is None 비교와 return None이 일관되어야 합니다."\r
      resultCheck: "결과가 None이어야 합니다."\r
\r
  - id: practice\r
    title: "실습 - 종합 미션 2개"\r
    structuredPrimary: true\r
    subtitle: "독립 실행 가능한 PDF 일괄 점검 도구"\r
    goal: "PdfReader + metadata + 일괄 점검을 결합한 작은 도구 두 개를 직접 작성한다."\r
    why: "처음부터 끝까지 한 흐름을 손으로 쳐봐야 PdfReader 객체 감각이 굳어집니다."\r
    explanation: |-\r
      미션1은 폴더의 모든 PDF에서 페이지 수 합계가 N 이상인지 확인하는 함수, 미션2는 특정 작성자의 PDF만 골라 리스트로 돌려주는 함수입니다.\r
    tips:\r
      - "각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다."\r
      - "변수 prefix는 sum*(미션1), pick*(미션2)로 격리됩니다."\r
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
        - "미션1 함수 시그니처: totalPagesAtLeast(folder, threshold) -> bool"\r
        - "미션2 함수 시그니처: pickByAuthor(folder, authorName) -> list[Path]"\r
    check:\r
      noError: "함수가 정의되어야 하고 호출 결과가 True/list여야 합니다."\r
      resultCheck: "미션1은 임계값 비교 결과, 미션2는 매칭 파일 리스트가 정확해야 합니다."\r
    blocks:\r
      - type: tip\r
        content: "PdfReader는 매 호출마다 파일을 다시 엽니다. 같은 PDF를 여러 번 점검하면 한 번만 열어 결과를 캐싱하는 게 효율적입니다."\r
      - type: expansion\r
        title: "미션1: 총 페이지 임계값 점검"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def makeSampleSum(path, pageCount):\r
                  canvas = Canvas(str(path))\r
                  for _ in range(pageCount):\r
                      canvas.drawString(72, 720, "x")\r
                      canvas.showPage()\r
                  canvas.save()\r
\r
              sumDir = TemporaryDirectory()\r
              sumBase = Path(sumDir.name)\r
              for idx, pages in enumerate([3, 7, 2, 5], start=1):\r
                  makeSampleSum(sumBase / f"{idx}.pdf", pages)\r
              sorted(p.name for p in sumBase.glob("*.pdf"))\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def totalPagesAtLeast(folder, threshold):\r
                  total = sum(len(PdfReader(p).pages) for p in Path(folder).glob("*.pdf"))\r
                  return total >= threshold\r
\r
              assert totalPagesAtLeast(sumBase, 15) is True\r
              assert totalPagesAtLeast(sumBase, 20) is False\r
              totalPagesAtLeast(sumBase, 17)\r
      - type: expansion\r
        title: "미션2: 작성자별 필터"\r
        blocks:\r
          - type: code\r
            title: "데이터 준비"\r
            content: |-\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
              from pypdf import PdfReader\r
              from reportlab.pdfgen.canvas import Canvas\r
\r
              def makeSamplePick(path, author):\r
                  canvas = Canvas(str(path))\r
                  canvas.setAuthor(author)\r
                  canvas.drawString(72, 720, "x")\r
                  canvas.showPage()\r
                  canvas.save()\r
\r
              pickDir = TemporaryDirectory()\r
              pickBase = Path(pickDir.name)\r
              for idx, author in enumerate(["김대리", "박과장", "김대리", "이주임"], start=1):\r
                  makeSamplePick(pickBase / f"{idx}.pdf", author)\r
              sorted(p.name for p in pickBase.glob("*.pdf"))\r
          - type: code\r
            title: "함수 정의와 검증"\r
            content: |-\r
              def pickByAuthor(folder, authorName):\r
                  matched = []\r
                  for path in sorted(Path(folder).glob("*.pdf")):\r
                      meta = PdfReader(path).metadata\r
                      if meta is not None and meta.author == authorName:\r
                          matched.append(path)\r
                  return matched\r
\r
              assert len(pickByAuthor(pickBase, "김대리")) == 2\r
              assert len(pickByAuthor(pickBase, "박과장")) == 1\r
              [p.name for p in pickByAuthor(pickBase, "김대리")]\r
\r
  - id: extensions\r
    title: "확장 변주"\r
    blocks:\r
      - type: text\r
        content: |-\r
          본 강의 패턴을 응용하면 사무에서 다음 작업을 즉시 자동화할 수 있습니다. 본인 업무에 가까운 변주를 골라 시도해 보세요.\r
      - type: list\r
        style: bullet\r
        items:\r
          - "내 다운로드 폴더의 모든 PDF 메타 일괄 추출 후 CSV로 저장"\r
          - "페이지 수 N 이상인 PDF만 별도 폴더로 자동 이동"\r
          - "작성자별로 PDF를 묶어 별도 폴더에 정리"\r
          - "메타가 비어있는 PDF만 찾아 일괄 메타 채워 다시 저장"\r
          - "월별로 만들어진 PDF를 created 기준으로 분류"\r
`;export{e as default};