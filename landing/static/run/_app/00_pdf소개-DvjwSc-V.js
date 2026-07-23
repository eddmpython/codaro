var e=`meta:
  id: pdf_00
  title: PDF 자동화 소개
  order: 0
  category: pdf
  packages:
    - pypdf
    - pdfplumber
    - reportlab
  tags:
    - pdf
    - 사무자동화
    - 한글폰트
    - 로컬Python
  outcomes:
    - automation.pdf.intro
  prerequisites:
    - python.functions
    - python.modulesAndIo
  estimatedMinutes: 30
  seo:
    title: PDF 자동화 소개 - pypdf·pdfplumber·reportlab으로 사무 PDF를 끝낸다
    description: "받은 PDF에서 텍스트·표를 뽑고, 새 PDF로 만들고, 묶고·자르고·잠그는 흐름을 로컬 Python으로 완결한다. 10개 프로젝트 학습 흐름과 한글 폰트 정책을 정리한다."
    keywords:
      - pdf 자동화
      - pypdf
      - pdfplumber
      - reportlab
      - 한글 PDF 생성
      - 청구서 자동 생성

intro:
  direction: "받은 PDF에서 텍스트·표를 뽑고, 새 PDF로 만들고, 묶고·자르고·잠그는 사무 PDF 작업 전 과정을 로컬 Python 한 사이클로 끝낸다. Excel 앱이나 외부 서비스 없이 완결된다."
  benefits:
    - "200건 청구서 수동 작성 6.7시간이 코드 실행 30초로 줄어든다 (10강 산출물 기준)."
    - "PdfReader·PdfWriter·pdfplumber·reportlab Canvas·Platypus까지 PDF 자동화 표면 전체를 코드로 다룬다."
    - "한글 폰트 등록과 OS별 폴백 패턴이 강의에 의무로 들어가, Linux 서버·CI 어디서 돌려도 같은 한글 PDF가 나온다."
    - "10개 프로젝트를 끝내면 회계·총무·HR·마케팅 페르소나가 그대로 자기 업무에 가져갈 수 있는 도구가 손에 남는다."
  diagram:
    steps:
      - label: "1. 받은 PDF에서 뽑기"
        detail: "pypdf로 페이지·메타·텍스트, pdfplumber로 표 구조를 추출한다."
      - label: "2. PDF 묶고 자르기"
        detail: "PdfWriter로 협력사별로 합치고 단원별로 분리한다."
      - label: "3. 한글 PDF 생성"
        detail: "reportlab Canvas와 Platypus로 한글 폰트 임베드된 보고서를 만든다."
      - label: "4. 청구서 자동화"
        detail: "CSV 거래 데이터에서 고객별 한글 청구서 PDF 묶음을 한 번에 만든다."
    runtime:
      - label: "로컬 Python"
        detail: "uv 환경에 pypdf, pdfplumber, reportlab 세 패키지면 충분하다. Excel·Word·외부 서비스 모두 불필요."
      - label: "결과 검증"
        detail: "모든 생성·조작 결과는 TemporaryDirectory에 저장하고 PdfReader로 다시 열어 페이지·텍스트·메타 단위 assert로 자동 검증한다."

sections:
  - id: runtime_check
    title: "라이브러리 실행 확인"
    structuredPrimary: true
    subtitle: "PDF 세 패키지 import 확인"
    goal: "pypdf, pdfplumber, reportlab을 import하고 메모리 PDF 한 페이지를 만들어 읽을 수 있는지 확인한다."
    why: "이 트랙은 읽기·표 추출·생성을 같이 다루므로 첫 셀에서 세 라이브러리의 역할이 실제 실행으로 연결되는지 확인해야 합니다."
    explanation: "상단 라이브러리 패널이 패키지 준비를 맡고, 학습 셀은 reportlab으로 작은 PDF를 만든 뒤 pypdf와 pdfplumber로 다시 읽어 실행 계약을 고정합니다."
    tips:
      - "패키지 준비와 학습 코드를 분리하면 import 실패와 코드 실수를 쉽게 구분할 수 있습니다."
      - "파일을 바로 만들지 않고 BytesIO를 쓰면 로컬 폴더를 어지럽히지 않고도 PDF 흐름을 검증할 수 있습니다."
    snippet: |-
      import io
      import pdfplumber
      from pypdf import PdfReader
      from reportlab.pdfgen import canvas

      buffer = io.BytesIO()
      page = canvas.Canvas(buffer)
      page.drawString(72, 720, "Codaro PDF ready")
      page.save()

      buffer.seek(0)
      reader = PdfReader(buffer)
      assert len(reader.pages) == 1

      buffer.seek(0)
      with pdfplumber.open(buffer) as pdf:
          text = pdf.pages[0].extract_text() or ""

      assert "Codaro PDF ready" in text
      print(text)
    exercise:
      prompt: PDF에 쓰는 문자열을 바꾸고, pypdf 페이지 수와 pdfplumber 추출 텍스트 assert가 함께 통과하는지 확인하세요.
      starterCode: |-
        import io
        import pdfplumber
        from pypdf import PdfReader
        from reportlab.pdfgen import canvas

        label = "monthly invoice ready"
        buffer = io.BytesIO()
        page = canvas.Canvas(buffer)
        page.drawString(72, 720, label)
        page.save()

        buffer.seek(0)
        reader = PdfReader(buffer)
        assert len(reader.pages) == 1

        buffer.seek(0)
        with pdfplumber.open(buffer) as pdf:
            text = pdf.pages[0].extract_text() or ""

        assert label in text
        print(text)
      solution: |-
        import io
        import pdfplumber
        from pypdf import PdfReader
        from reportlab.pdfgen import canvas

        label = "monthly invoice ready"
        buffer = io.BytesIO()
        page = canvas.Canvas(buffer)
        page.drawString(72, 720, label)
        page.save()

        buffer.seek(0)
        reader = PdfReader(buffer)
        assert len(reader.pages) == 1

        buffer.seek(0)
        with pdfplumber.open(buffer) as pdf:
            text = pdf.pages[0].extract_text() or ""

        assert label in text
        print(text)
      hints:
        - "BytesIO는 파일 대신 메모리에 PDF 바이트를 담습니다."
        - "PdfReader와 pdfplumber가 같은 버퍼를 읽기 전에 buffer.seek(0)을 다시 호출해야 합니다."
    check:
      type: noError
      noError: "세 라이브러리 import와 메모리 PDF 생성·읽기가 오류 없이 끝나야 합니다."
      resultCheck: "페이지 수 assert와 추출 텍스트 assert가 모두 통과해야 합니다."
  - id: pdf_position
    title: "1. PDF가 사무 자동화에서 차지하는 자리"
    blocks:
      - type: text
        content: |-
          엑셀·Word 다음으로 직장인이 가장 자주 마주치는 형식이 PDF입니다. 보고서, 계약서, 견적서, 청구서, 명세서, 정부 공시 자료까지 사실상 모든 "변경 안 되게 보내는 문서"가 PDF로 오갑니다. 그래서 PDF 작업은 빈도가 높고, 손으로 하면 시간이 가장 많이 빨리는 영역입니다.
      - type: text
        content: |-
          이 트랙은 PDF 작업을 두 갈래로 나눠 한 흐름으로 묶습니다. 받은 PDF에서 뭔가 뽑는 작업(읽기·추출·메타·병합)과 새 PDF로 만드는 작업(한글 보고서·표·청구서). 04강까지는 읽기와 조작, 05강부터는 생성에 집중합니다. 10강에서 두 흐름이 합쳐져 "CSV 거래 데이터 → 고객별 한글 청구서 PDF 묶음"이라는 회계팀 실무자가 그대로 쓸 수 있는 도구가 됩니다.
      - type: text
        content: |-
          가장 큰 이점은 외부 환경 의존이 없다는 것입니다. openpyxl이 Excel 앱 없이 .xlsx 파일을 직접 만들듯, 이 트랙도 Microsoft·Adobe·외부 변환 서비스 없이 순수 Python 코드만으로 PDF 전 과정을 다룹니다. 로컬에서 돌든 GitHub Actions에서 돌든 Linux 서버에서 돌든 같은 결과가 나옵니다.

  - id: library_map
    title: "2. 세 라이브러리의 자리"
    blocks:
      - type: text
        content: |-
          PDF 작업은 한 라이브러리로 끝나지 않습니다. 읽기·표 추출·생성이 각자 다른 강점을 가진 도구를 요구하기 때문입니다. 이 트랙은 세 라이브러리를 의도적으로 같이 다뤄, 학습자가 "내 작업에는 어떤 도구가 맞나"를 자연스럽게 판단할 수 있게 합니다.
      - type: table
        headers: ["라이브러리", "역할", "사용 강의", "라이선스"]
        rows:
          - ["pypdf", "읽기, 페이지 추출, 병합, 분할, 메타데이터, 암호화", "01·02·03·08·09·10", "BSD"]
          - ["pdfplumber", "텍스트와 표 구조 추출 - pypdf의 빈자리", "03·04·10", "MIT"]
          - ["reportlab", "PDF 생성 (저수준, 한글 폰트 임베드 가능)", "05·06·07·08·10", "BSD"]
      - type: note
        title: "왜 PyMuPDF·fpdf2를 쓰지 않나"
        content: "PyMuPDF(fitz)는 빠르고 강력하지만 AGPL 라이선스라 사내·상용 자동화에 부담입니다. fpdf2는 단순하지만 Platypus 같은 레이아웃 엔진이 없어 표·이미지가 들어가는 보고서엔 한계가 있습니다. 본 트랙은 세 라이브러리 모두 BSD·MIT로 라이선스 부담 없이 회사 코드에 그대로 가져갈 수 있게 골랐습니다."

  - id: persona_match
    title: "3. 누가 어느 강의에서 답을 얻나"
    blocks:
      - type: text
        content: |-
          이 트랙은 네 페르소나를 명시적으로 설계 기준에 두고 만들었습니다. 본인 업무가 어디에 가까운지 보고, 우선순위 강의를 먼저 가져갈 수도 있습니다.
      - type: table
        headers: ["페르소나", "주간 PDF 작업", "이 트랙 졸업 시 산출물"]
        rows:
          - ["회계팀 김대리", "매월 200건 거래내역에서 고객별 청구서 PDF 수동 작성", "10강 - CSV 한 번 돌리면 200개 청구서"]
          - ["총무팀 박과장", "협력사 견적·계약서 PDF 50종 분리·통합 반복", "02강 - 자동 분리·병합 스크립트"]
          - ["마케팅 이주임", "사외 공유 PDF에 워터마크·패스워드 수동 처리", "08강 - 일괄 워터마크·암호화"]
          - ["HR 윤대리", "국세청·공공기관 PDF 표를 엑셀에 손으로 옮김", "04강 - pdfplumber 표 추출 → CSV"]

  - id: capability_map
    title: "4. 10개 프로젝트로 다루는 능력"
    blocks:
      - type: text
        content: |-
          각 강의는 독립된 풀 프로젝트입니다. 강의 끝나면 손에 도구 하나가 남고, 다음 강의는 그 도구에 새 개념을 얹어 확장합니다. 이전 강의 산출물이 다음 강의의 입력으로 연결되는 흐름이라, 끝까지 가면 트랙 전체가 한 프로젝트처럼 체감됩니다.
      - type: table
        headers: ["프로젝트", "핵심 능력", "산출물"]
        rows:
          - ["01 페이지수·메타데이터", "PdfReader, pages, metadata", "50개 PDF 일괄 점검 보고서"]
          - ["02 병합과 분할", "PdfWriter.add_page, write", "협력사별 묶음 + 단원별 분할"]
          - ["03 텍스트 추출", "extract_text vs pdfplumber.open", "회의록 PDF → 마크다운"]
          - ["04 표 추출", "extract_tables → DataFrame", "정부 통계 PDF의 표 → CSV"]
          - ["05 첫 PDF 생성", "Canvas, drawString, setFont", "한 페이지 영문 PDF"]
          - ["06 한글 폰트와 스타일", "TTFont 등록, Paragraph, Style", "한글 보고서 표지"]
          - ["07 표와 이미지", "Platypus Table, Image, SimpleDocTemplate", "표+로고 포함 보고서"]
          - ["08 워터마크와 암호화", "encrypt, overlay 워터마크", "사내전용 + 패스워드 PDF"]
          - ["09 양식 채우기", "AcroForm 필드 읽기/쓰기", "신청서 자동 입력"]
          - ["10 월간 청구서 생성기", "통합 자동화 파이프라인", "CSV → 고객별 한글 청구서 PDF 묶음"]

  - id: korean_specifics
    title: "5. 한글 PDF의 두 가지 함정"
    blocks:
      - type: text
        content: |-
          한국에서 PDF를 다룰 때 영어권 강의에는 거의 나오지 않지만 매번 사람을 막는 두 가지 함정이 있습니다. 이 트랙은 두 함정을 모두 강의 안에서 정면으로 해소합니다.
      - type: list
        style: check
        items:
          - "한글 폰트 임베드 - reportlab 기본 폰트로는 한글이 박스(□)로 깨집니다. 06강에서 시스템에 설치된 한글 폰트(Windows 맑은 고딕 / macOS AppleSDGothicNeo / Linux NanumGothic)를 OS별로 찾아 등록하는 헬퍼 함수를 만들고, 06~10강이 모두 그 헬퍼를 재사용합니다."
          - "한글 PDF 표 추출 - pdfplumber는 한국 정부 PDF의 세로 병합 셀이나 선 없는 표에 어긋날 수 있습니다. 04강에서 table_settings 튜닝과 한계를 모두 솔직히 다룹니다. 손이 더 정확할 때는 손이 빠르다는 점도 같이 가르칩니다."
      - type: note
        title: "폰트 파일은 저장소에 동봉하지 않는다"
        content: "라이선스 부담과 저장소 크기 때문에 .ttf 파일을 강의 자료에 넣지 않습니다. 대신 06강의 registerKoreanFont() 헬퍼가 OS별로 시스템 폰트를 자동으로 찾고, 못 찾으면 어떤 명령으로 설치하라고 안내합니다(Linux는 apt install fonts-nanum, Windows·macOS는 기본 폰트 사용)."

  - id: contract
    title: "6. 학습 계약"
    blocks:
      - type: list
        style: bullet
        items:
          - "모든 결과 PDF는 TemporaryDirectory에 저장하고, PdfReader로 다시 열어 페이지·텍스트·메타 단위로 assert 검증합니다. 사용자 로컬 폴더를 오염시키지 않습니다."
          - "각 강의의 마지막 단계는 코드가 직접 검증하는 자동 assert 루프입니다. 눈으로 PDF를 열어보지 않아도 결과가 맞는지 코드가 알려줍니다."
          - "입력용 샘플 PDF는 강의 시작에 reportlab으로 즉석 생성합니다. 외부 다운로드 의존이 없고, 같은 강의가 인터넷 없이도 같은 결과를 냅니다."
          - "모든 강의는 PRD에 정의된 흔한 오개념 맵의 해당 함정을 강의 안에서 한 번 차단합니다. 학습자가 흔히 빠지는 자리를 사전에 막아두는 게 본 트랙의 차별점입니다."
      - type: tip
        content: "PDF 파일은 페이지·이미지·폰트가 한 zip에 묶인 복합 형식입니다. 한 라이브러리로 모든 작업이 깔끔하게 끝나지 않습니다. 이 트랙은 pypdf로 읽고, pdfplumber로 표를 뽑고, reportlab으로 새로 만든다는 세 역할 분담을 강의별로 자연스럽게 익히게 합니다."
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
  - id: pdf_00-pdf-artifact-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - runtime_check
    - contract
    title: PDF의 page·text·render·보안 artifact 계약 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 생성 전에 페이지 수와 필수 text, render 검증, 암호화 정책을 명시한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 페이지 수와 필수 text, render 검증을 생성 전에 계약으로 만드세요.
    - 문서 보안 등급도 output filename과 함께 명시하세요.
    exercise:
      prompt: audit_pdf_contract(contract)를 완성하세요.
      starterCode: |-
        def audit_pdf_contract(contract):
            raise NotImplementedError
      solution: |
        def audit_pdf_contract(contract):
            required = {"fileName", "minimumPages", "requiredText", "renderVerification", "securityPolicy"}
            missing = sorted(required - set(contract))
            failures = []
            if not str(contract.get("fileName", "")).lower().endswith(".pdf"):
                failures.append("extension")
            if contract.get("minimumPages", 0) <= 0:
                failures.append("pages")
            if not contract.get("requiredText"):
                failures.append("text")
            if not contract.get("renderVerification", False):
                failures.append("render")
            if contract.get("securityPolicy") not in {"public", "internal", "confidential"}:
                failures.append("security")
            return {"ready": not missing and not failures, "missing": missing, "failures": failures, "evidence": ["PDF descriptor", "reopened pages", "rendered images", "business reconciliation"]}
      hints: *id001
    check:
      id: python.pdf.pdf_00.pdf-artifact-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_00.pdf-artifact-contract.mastery.behavior.v1.fixture
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
        entry: audit_pdf_contract
        cases:
        - id: accepts-explicit-pdf-contract
          arguments:
          - value:
              fileName: invoice.pdf
              minimumPages: 1
              requiredText:
              - Invoice
              - Total
              renderVerification: true
              securityPolicy: confidential
          expectedReturn:
            ready: true
            missing: []
            failures: []
            evidence:
            - PDF descriptor
            - reopened pages
            - rendered images
            - business reconciliation
        - id: reports-all-invalid-policies
          arguments:
          - value:
              fileName: invoice.txt
              minimumPages: 0
              requiredText: []
              renderVerification: false
              securityPolicy: unknown
          expectedReturn:
            ready: false
            missing: []
            failures:
            - extension
            - pages
            - text
            - render
            - security
            evidence:
            - PDF descriptor
            - reopened pages
            - rendered images
            - business reconciliation
        - id: reports-missing-contract
          arguments:
          - value:
              fileName: x.pdf
          expectedReturn:
            ready: false
            missing:
            - minimumPages
            - renderVerification
            - requiredText
            - securityPolicy
            failures:
            - pages
            - text
            - render
            - security
            evidence:
            - PDF descriptor
            - reopened pages
            - rendered images
            - business reconciliation
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pdf_00-pdf-runtime-tier-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_00-pdf-artifact-contract-mastery
    title: 새 PDF 과제에 Web·Local 역할 분리 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 문서 계약과 실제 생성·OCR·render capability를 구분한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - Web에서 PDF package 실행을 가장하지 말고 페이지·표·보안 판단을 평가하세요.
    - 실제 생성·render·OCR·암호화는 Local capability로 연결하세요.
    exercise:
      prompt: plan_pdf_runtime(requirements)를 완성하세요.
      starterCode: |-
        def plan_pdf_runtime(requirements):
            raise NotImplementedError
      solution: |
        def plan_pdf_runtime(requirements):
            local_reasons = []
            if requirements.get("createPdf"):
                local_reasons.append("pdf-artifact")
            if requirements.get("renderPages"):
                local_reasons.append("page-render")
            if requirements.get("ocr"):
                local_reasons.append("ocr-runtime")
            if requirements.get("encrypt"):
                local_reasons.append("secret-and-encryption")
            return {"tier": "local" if local_reasons else "web", "localReasons": local_reasons, "webPractice": ["page contract", "table reconciliation", "security decision"]}
      hints: *id002
    check:
      id: python.pdf.pdf_00.pdf-runtime-tier-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_00.pdf-runtime-tier-plan.transfer.behavior.v1.fixture
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
        entry: plan_pdf_runtime
        cases:
        - id: keeps-document-judgment-on-web
          arguments:
          - value: {}
          expectedReturn:
            tier: web
            localReasons: []
            webPractice:
            - page contract
            - table reconciliation
            - security decision
        - id: requires-local-for-create-and-render
          arguments:
          - value:
              createPdf: true
              renderPages: true
          expectedReturn:
            tier: local
            localReasons:
            - pdf-artifact
            - page-render
            webPractice:
            - page contract
            - table reconciliation
            - security decision
        - id: requires-local-for-ocr-and-encryption
          arguments:
          - value:
              ocr: true
              encrypt: true
          expectedReturn:
            tier: local
            localReasons:
            - ocr-runtime
            - secret-and-encryption
            webPractice:
            - page contract
            - table reconciliation
            - security decision
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pdf_00-pdf-foundation-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pdf_00-pdf-runtime-tier-plan-transfer
    title: PDF artifact 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 재개방·text·render·업무 reconciliation 근거를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - PDF 저장 성공과 페이지 내용·geometry·업무 값의 정확성을 분리해 검증하세요.
    - Web에서는 문서 판단을 연습하고 Local에서는 재개방·render artifact evidence를 남기세요.
    exercise:
      prompt: choose_pdf_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_pdf_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pdf_evidence(situation):
            table = {'structure': {'action': 'reopen and inspect pages metadata', 'evidence': 'page descriptors', 'risk': 'corrupt PDF'}, 'content': {'action': 'extract required text and tables', 'evidence': 'page-level coverage', 'risk': 'valid blank pages'}, 'visual': {'action': 'render target pages', 'evidence': 'page PNGs and geometry', 'risk': 'clipped or missing glyphs'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pdf.pdf_00.pdf-foundation-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pdf.pdf_00.pdf-foundation-recall.retrieval.behavior.v1.fixture
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
        entry: choose_pdf_evidence
        cases:
        - id: recalls-structure
          arguments:
          - value: structure
          expectedReturn:
            action: reopen and inspect pages metadata
            evidence: page descriptors
            risk: corrupt PDF
        - id: recalls-content
          arguments:
          - value: content
          expectedReturn:
            action: extract required text and tables
            evidence: page-level coverage
            risk: valid blank pages
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};