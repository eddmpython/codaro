var e=`meta:\r
  id: pdf_00\r
  title: PDF 자동화 소개\r
  order: 0\r
  category: pdf\r
  packages:\r
    - pypdf\r
    - pdfplumber\r
    - reportlab\r
  tags:\r
    - pdf\r
    - 사무자동화\r
    - 한글폰트\r
    - 로컬Python\r
  outcomes:\r
    - automation.pdf.intro\r
  prerequisites:\r
    - python.functions\r
    - python.modulesAndIo\r
  estimatedMinutes: 30\r
  seo:\r
    title: PDF 자동화 소개 - pypdf·pdfplumber·reportlab으로 사무 PDF를 끝낸다\r
    description: "받은 PDF에서 텍스트·표를 뽑고, 새 PDF로 만들고, 묶고·자르고·잠그는 흐름을 로컬 Python으로 완결한다. 10개 프로젝트 학습 흐름과 한글 폰트 정책을 정리한다."\r
    keywords:\r
      - pdf 자동화\r
      - pypdf\r
      - pdfplumber\r
      - reportlab\r
      - 한글 PDF 생성\r
      - 청구서 자동 생성\r
\r
intro:\r
  direction: "받은 PDF에서 텍스트·표를 뽑고, 새 PDF로 만들고, 묶고·자르고·잠그는 사무 PDF 작업 전 과정을 로컬 Python 한 사이클로 끝낸다. Excel 앱이나 외부 서비스 없이 완결된다."\r
  benefits:\r
    - "200건 청구서 수동 작성 6.7시간이 코드 실행 30초로 줄어든다 (10강 산출물 기준)."\r
    - "PdfReader·PdfWriter·pdfplumber·reportlab Canvas·Platypus까지 PDF 자동화 표면 전체를 코드로 다룬다."\r
    - "한글 폰트 등록과 OS별 폴백 패턴이 강의에 의무로 들어가, Linux 서버·CI 어디서 돌려도 같은 한글 PDF가 나온다."\r
    - "10개 프로젝트를 끝내면 회계·총무·HR·마케팅 페르소나가 그대로 자기 업무에 가져갈 수 있는 도구가 손에 남는다."\r
  diagram:\r
    steps:\r
      - label: "1. 받은 PDF에서 뽑기"\r
        detail: "pypdf로 페이지·메타·텍스트, pdfplumber로 표 구조를 추출한다."\r
      - label: "2. PDF 묶고 자르기"\r
        detail: "PdfWriter로 협력사별로 합치고 단원별로 분리한다."\r
      - label: "3. 한글 PDF 생성"\r
        detail: "reportlab Canvas와 Platypus로 한글 폰트 임베드된 보고서를 만든다."\r
      - label: "4. 청구서 자동화"\r
        detail: "CSV 거래 데이터에서 고객별 한글 청구서 PDF 묶음을 한 번에 만든다."\r
    runtime:\r
      - label: "로컬 Python"\r
        detail: "uv 환경에 pypdf, pdfplumber, reportlab 세 패키지면 충분하다. Excel·Word·외부 서비스 모두 불필요."\r
      - label: "결과 검증"\r
        detail: "모든 생성·조작 결과는 TemporaryDirectory에 저장하고 PdfReader로 다시 열어 페이지·텍스트·메타 단위 assert로 자동 검증한다."\r
\r
sections:\r
  - id: runtime_check\r
    title: "라이브러리 실행 확인"\r
    structuredPrimary: true\r
    subtitle: "PDF 세 패키지 import 확인"\r
    goal: "pypdf, pdfplumber, reportlab을 import하고 메모리 PDF 한 페이지를 만들어 읽을 수 있는지 확인한다."\r
    why: "이 트랙은 읽기·표 추출·생성을 같이 다루므로 첫 셀에서 세 라이브러리의 역할이 실제 실행으로 연결되는지 확인해야 합니다."\r
    explanation: "상단 라이브러리 패널이 패키지 준비를 맡고, 학습 셀은 reportlab으로 작은 PDF를 만든 뒤 pypdf와 pdfplumber로 다시 읽어 실행 계약을 고정합니다."\r
    tips:\r
      - "패키지 준비와 학습 코드를 분리하면 import 실패와 코드 실수를 쉽게 구분할 수 있습니다."\r
      - "파일을 바로 만들지 않고 BytesIO를 쓰면 로컬 폴더를 어지럽히지 않고도 PDF 흐름을 검증할 수 있습니다."\r
    snippet: |-\r
      import io\r
      import pdfplumber\r
      from pypdf import PdfReader\r
      from reportlab.pdfgen import canvas\r
\r
      buffer = io.BytesIO()\r
      page = canvas.Canvas(buffer)\r
      page.drawString(72, 720, "Codaro PDF ready")\r
      page.save()\r
\r
      buffer.seek(0)\r
      reader = PdfReader(buffer)\r
      assert len(reader.pages) == 1\r
\r
      buffer.seek(0)\r
      with pdfplumber.open(buffer) as pdf:\r
          text = pdf.pages[0].extract_text() or ""\r
\r
      assert "Codaro PDF ready" in text\r
      print(text)\r
    exercise:\r
      prompt: PDF에 쓰는 문자열을 바꾸고, pypdf 페이지 수와 pdfplumber 추출 텍스트 assert가 함께 통과하는지 확인하세요.\r
      starterCode: |-\r
        import io\r
        import pdfplumber\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen import canvas\r
\r
        label = "monthly invoice ready"\r
        buffer = io.BytesIO()\r
        page = canvas.Canvas(buffer)\r
        page.drawString(72, 720, label)\r
        page.save()\r
\r
        buffer.seek(0)\r
        reader = PdfReader(buffer)\r
        assert len(reader.pages) == 1\r
\r
        buffer.seek(0)\r
        with pdfplumber.open(buffer) as pdf:\r
            text = pdf.pages[0].extract_text() or ""\r
\r
        assert label in text\r
        print(text)\r
      solution: |-\r
        import io\r
        import pdfplumber\r
        from pypdf import PdfReader\r
        from reportlab.pdfgen import canvas\r
\r
        label = "monthly invoice ready"\r
        buffer = io.BytesIO()\r
        page = canvas.Canvas(buffer)\r
        page.drawString(72, 720, label)\r
        page.save()\r
\r
        buffer.seek(0)\r
        reader = PdfReader(buffer)\r
        assert len(reader.pages) == 1\r
\r
        buffer.seek(0)\r
        with pdfplumber.open(buffer) as pdf:\r
            text = pdf.pages[0].extract_text() or ""\r
\r
        assert label in text\r
        print(text)\r
      hints:\r
        - "BytesIO는 파일 대신 메모리에 PDF 바이트를 담습니다."\r
        - "PdfReader와 pdfplumber가 같은 버퍼를 읽기 전에 buffer.seek(0)을 다시 호출해야 합니다."\r
    check:\r
      type: noError\r
      noError: "세 라이브러리 import와 메모리 PDF 생성·읽기가 오류 없이 끝나야 합니다."\r
      resultCheck: "페이지 수 assert와 추출 텍스트 assert가 모두 통과해야 합니다."\r
  - id: pdf_position\r
    title: "1. PDF가 사무 자동화에서 차지하는 자리"\r
    blocks:\r
      - type: text\r
        content: |-\r
          엑셀·Word 다음으로 직장인이 가장 자주 마주치는 형식이 PDF입니다. 보고서, 계약서, 견적서, 청구서, 명세서, 정부 공시 자료까지 사실상 모든 "변경 안 되게 보내는 문서"가 PDF로 오갑니다. 그래서 PDF 작업은 빈도가 높고, 손으로 하면 시간이 가장 많이 빨리는 영역입니다.\r
      - type: text\r
        content: |-\r
          이 트랙은 PDF 작업을 두 갈래로 나눠 한 흐름으로 묶습니다. 받은 PDF에서 뭔가 뽑는 작업(읽기·추출·메타·병합)과 새 PDF로 만드는 작업(한글 보고서·표·청구서). 04강까지는 읽기와 조작, 05강부터는 생성에 집중합니다. 10강에서 두 흐름이 합쳐져 "CSV 거래 데이터 → 고객별 한글 청구서 PDF 묶음"이라는 회계팀 실무자가 그대로 쓸 수 있는 도구가 됩니다.\r
      - type: text\r
        content: |-\r
          가장 큰 이점은 외부 환경 의존이 없다는 것입니다. openpyxl이 Excel 앱 없이 .xlsx 파일을 직접 만들듯, 이 트랙도 Microsoft·Adobe·외부 변환 서비스 없이 순수 Python 코드만으로 PDF 전 과정을 다룹니다. 로컬에서 돌든 GitHub Actions에서 돌든 Linux 서버에서 돌든 같은 결과가 나옵니다.\r
\r
  - id: library_map\r
    title: "2. 세 라이브러리의 자리"\r
    blocks:\r
      - type: text\r
        content: |-\r
          PDF 작업은 한 라이브러리로 끝나지 않습니다. 읽기·표 추출·생성이 각자 다른 강점을 가진 도구를 요구하기 때문입니다. 이 트랙은 세 라이브러리를 의도적으로 같이 다뤄, 학습자가 "내 작업에는 어떤 도구가 맞나"를 자연스럽게 판단할 수 있게 합니다.\r
      - type: table\r
        headers: ["라이브러리", "역할", "사용 강의", "라이선스"]\r
        rows:\r
          - ["pypdf", "읽기, 페이지 추출, 병합, 분할, 메타데이터, 암호화", "01·02·03·08·09·10", "BSD"]\r
          - ["pdfplumber", "텍스트와 표 구조 추출 - pypdf의 빈자리", "03·04·10", "MIT"]\r
          - ["reportlab", "PDF 생성 (저수준, 한글 폰트 임베드 가능)", "05·06·07·08·10", "BSD"]\r
      - type: note\r
        title: "왜 PyMuPDF·fpdf2를 쓰지 않나"\r
        content: "PyMuPDF(fitz)는 빠르고 강력하지만 AGPL 라이선스라 사내·상용 자동화에 부담입니다. fpdf2는 단순하지만 Platypus 같은 레이아웃 엔진이 없어 표·이미지가 들어가는 보고서엔 한계가 있습니다. 본 트랙은 세 라이브러리 모두 BSD·MIT로 라이선스 부담 없이 회사 코드에 그대로 가져갈 수 있게 골랐습니다."\r
\r
  - id: persona_match\r
    title: "3. 누가 어느 강의에서 답을 얻나"\r
    blocks:\r
      - type: text\r
        content: |-\r
          이 트랙은 네 페르소나를 명시적으로 설계 기준에 두고 만들었습니다. 본인 업무가 어디에 가까운지 보고, 우선순위 강의를 먼저 가져갈 수도 있습니다.\r
      - type: table\r
        headers: ["페르소나", "주간 PDF 작업", "이 트랙 졸업 시 산출물"]\r
        rows:\r
          - ["회계팀 김대리", "매월 200건 거래내역에서 고객별 청구서 PDF 수동 작성", "10강 - CSV 한 번 돌리면 200개 청구서"]\r
          - ["총무팀 박과장", "협력사 견적·계약서 PDF 50종 분리·통합 반복", "02강 - 자동 분리·병합 스크립트"]\r
          - ["마케팅 이주임", "사외 공유 PDF에 워터마크·패스워드 수동 처리", "08강 - 일괄 워터마크·암호화"]\r
          - ["HR 윤대리", "국세청·공공기관 PDF 표를 엑셀에 손으로 옮김", "04강 - pdfplumber 표 추출 → CSV"]\r
\r
  - id: capability_map\r
    title: "4. 10개 프로젝트로 다루는 능력"\r
    blocks:\r
      - type: text\r
        content: |-\r
          각 강의는 독립된 풀 프로젝트입니다. 강의 끝나면 손에 도구 하나가 남고, 다음 강의는 그 도구에 새 개념을 얹어 확장합니다. 이전 강의 산출물이 다음 강의의 입력으로 연결되는 흐름이라, 끝까지 가면 트랙 전체가 한 프로젝트처럼 체감됩니다.\r
      - type: table\r
        headers: ["프로젝트", "핵심 능력", "산출물"]\r
        rows:\r
          - ["01 페이지수·메타데이터", "PdfReader, pages, metadata", "50개 PDF 일괄 점검 보고서"]\r
          - ["02 병합과 분할", "PdfWriter.add_page, write", "협력사별 묶음 + 단원별 분할"]\r
          - ["03 텍스트 추출", "extract_text vs pdfplumber.open", "회의록 PDF → 마크다운"]\r
          - ["04 표 추출", "extract_tables → DataFrame", "정부 통계 PDF의 표 → CSV"]\r
          - ["05 첫 PDF 생성", "Canvas, drawString, setFont", "한 페이지 영문 PDF"]\r
          - ["06 한글 폰트와 스타일", "TTFont 등록, Paragraph, Style", "한글 보고서 표지"]\r
          - ["07 표와 이미지", "Platypus Table, Image, SimpleDocTemplate", "표+로고 포함 보고서"]\r
          - ["08 워터마크와 암호화", "encrypt, overlay 워터마크", "사내전용 + 패스워드 PDF"]\r
          - ["09 양식 채우기", "AcroForm 필드 읽기/쓰기", "신청서 자동 입력"]\r
          - ["10 월간 청구서 생성기", "통합 자동화 파이프라인", "CSV → 고객별 한글 청구서 PDF 묶음"]\r
\r
  - id: korean_specifics\r
    title: "5. 한글 PDF의 두 가지 함정"\r
    blocks:\r
      - type: text\r
        content: |-\r
          한국에서 PDF를 다룰 때 영어권 강의에는 거의 나오지 않지만 매번 사람을 막는 두 가지 함정이 있습니다. 이 트랙은 두 함정을 모두 강의 안에서 정면으로 해소합니다.\r
      - type: list\r
        style: check\r
        items:\r
          - "한글 폰트 임베드 - reportlab 기본 폰트로는 한글이 박스(□)로 깨집니다. 06강에서 시스템에 설치된 한글 폰트(Windows 맑은 고딕 / macOS AppleSDGothicNeo / Linux NanumGothic)를 OS별로 찾아 등록하는 헬퍼 함수를 만들고, 06~10강이 모두 그 헬퍼를 재사용합니다."\r
          - "한글 PDF 표 추출 - pdfplumber는 한국 정부 PDF의 세로 병합 셀이나 선 없는 표에 어긋날 수 있습니다. 04강에서 table_settings 튜닝과 한계를 모두 솔직히 다룹니다. 손이 더 정확할 때는 손이 빠르다는 점도 같이 가르칩니다."\r
      - type: note\r
        title: "폰트 파일은 저장소에 동봉하지 않는다"\r
        content: "라이선스 부담과 저장소 크기 때문에 .ttf 파일을 강의 자료에 넣지 않습니다. 대신 06강의 registerKoreanFont() 헬퍼가 OS별로 시스템 폰트를 자동으로 찾고, 못 찾으면 어떤 명령으로 설치하라고 안내합니다(Linux는 apt install fonts-nanum, Windows·macOS는 기본 폰트 사용)."\r
\r
  - id: contract\r
    title: "6. 학습 계약"\r
    blocks:\r
      - type: list\r
        style: bullet\r
        items:\r
          - "모든 결과 PDF는 TemporaryDirectory에 저장하고, PdfReader로 다시 열어 페이지·텍스트·메타 단위로 assert 검증합니다. 사용자 로컬 폴더를 오염시키지 않습니다."\r
          - "각 강의의 마지막 단계는 코드가 직접 검증하는 자동 assert 루프입니다. 눈으로 PDF를 열어보지 않아도 결과가 맞는지 코드가 알려줍니다."\r
          - "입력용 샘플 PDF는 강의 시작에 reportlab으로 즉석 생성합니다. 외부 다운로드 의존이 없고, 같은 강의가 인터넷 없이도 같은 결과를 냅니다."\r
          - "모든 강의는 PRD에 정의된 흔한 오개념 맵의 해당 함정을 강의 안에서 한 번 차단합니다. 학습자가 흔히 빠지는 자리를 사전에 막아두는 게 본 트랙의 차별점입니다."\r
      - type: tip\r
        content: "PDF 파일은 페이지·이미지·폰트가 한 zip에 묶인 복합 형식입니다. 한 라이브러리로 모든 작업이 깔끔하게 끝나지 않습니다. 이 트랙은 pypdf로 읽고, pdfplumber로 표를 뽑고, reportlab으로 새로 만든다는 세 역할 분담을 강의별로 자연스럽게 익히게 합니다."\r
`;export{e as default};