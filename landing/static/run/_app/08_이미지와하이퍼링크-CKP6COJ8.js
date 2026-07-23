var e=`meta:
  id: openpyxl_08
  title: 이미지와 하이퍼링크
  order: 8
  category: openpyxl
  difficulty: ⭐⭐⭐
  badge: 중급
  packages:
  - openpyxl
  - pillow
  tags:
  - openpyxl
  - 이미지
  - 하이퍼링크
  - Comment
  - 상품카탈로그
  seo:
    title: openpyxl 이미지와 하이퍼링크 - add_image·cell.hyperlink·Comment
    description: 워크시트에 PNG/JPG를 삽입하고, 셀에 URL/내부 시트 링크와 코멘트를 부여해 인터랙티브 보고서를 만듭니다.
    keywords:
    - openpyxl add_image
    - cell hyperlink
    - openpyxl Comment
    - Pillow PIL
intro:
  direction: 이미지 삽입, 외부 URL과 내부 시트 하이퍼링크, 셀 코멘트를 결합해 상품 카탈로그 같은 인터랙티브 보고서를 만듭니다.
  benefits:
  - PIL로 만든 이미지를 메모리에서 직접 워크시트로 삽입합니다.
  - URL 링크와 시트 내부 링크의 문법 차이를 구분합니다.
  - "코멘트로 셀의 부가 설명을 남겨, 보고서를 받는 사람이 별도 문서 없이도 맥락을 이해하게 만듭니다."
  diagram:
    steps:
    - label: 이미지 삽입
      detail: PIL.Image → openpyxl Image → add_image(image, anchor).
    - label: URL 링크
      detail: cell.hyperlink = "https://..." + cell.style.
    - label: 내부 링크
      detail: 같은 워크북의 다른 시트로 이동하는 "#Sheet!A1" 문법.
    - label: 코멘트
      detail: Comment(text, author)로 셀 주석.
    runtime:
    - label: openpyxl + Pillow 패키지 준비
      detail: PIL.Image와 openpyxl.drawing.image.Image, openpyxl.comments.Comment를 함께 import해 사용한다.
    - label: 이미지·링크·코멘트 재오픈 검증
      detail: load_workbook으로 다시 열어 _images 길이, hyperlink.target/location, comment.text가 보존됐는지 assert로 확인한다.
sections:
- id: step1_image_from_pil
  title: 1단계. PIL 이미지를 시트에 삽입
  structuredPrimary: true
  subtitle: PIL.Image → openpyxl.drawing.image.Image
  goal: 디스크 파일 없이 메모리에서 만든 PIL 이미지를 워크시트에 삽입한다.
  why: "디스크에 임시 이미지를 만들면 정리 책임이 생깁니다. PIL → BytesIO → openpyxl Image 흐름이 임시 파일 없이 깔끔합니다."
  explanation: |-
    PIL의 Image.new로 단색 이미지를 만들고, BytesIO에 PNG로 저장한 뒤, openpyxl의 Image로 감싸 시트에 add_image합니다. anchor는 차트와 동일하게 좌상단 셀 좌표 문자열입니다.
  tips:
  - "PIL Image 객체를 직접 openpyxl Image에 넘길 수도 있지만, BytesIO를 거치는 것이 가장 호환성이 좋습니다."
  snippet: |-
    from io import BytesIO
    from PIL import Image as PILImage
    from openpyxl import Workbook
    from openpyxl.drawing.image import Image as XlImage

    book = Workbook()
    sheet = book.active
    sheet.append(["product", "image"])
    sheet.append(["pen", "여기 이미지"])

    swatch = PILImage.new("RGB", (80, 40), (48, 84, 150))
    buffer = BytesIO()
    swatch.save(buffer, format="PNG")
    buffer.seek(0)

    sheetImage = XlImage(buffer)
    sheet.add_image(sheetImage, "B2")
    len(sheet._images)
  exercise:
    prompt: 두 번째 행에 빨간색(255,0,0) 이미지를 만들어 B3에 추가하고 sheet._images 길이가 2가 되는지 확인하세요.
    starterCode: |-
      from io import BytesIO
      from PIL import Image as PILImage
      from openpyxl import Workbook
      from openpyxl.drawing.image import Image as XlImage

      book = Workbook()
      sheet = book.active
      sheet.append(["product", "image"])
      sheet.append(["pen", "이미지"])
      sheet.append(["book", "이미지"])

      blue = PILImage.new("RGB", (80, 40), (48, 84, 150))
      blueBuffer = BytesIO()
      blue.save(blueBuffer, format="PNG")
      blueBuffer.seek(0)

      red = PILImage.new("RGB", (80, 40), ___)
      redBuffer = BytesIO()
      red.save(redBuffer, format="PNG")
      redBuffer.seek(0)

      sheet.add_image(XlImage(blueBuffer), "B2")
      sheet.add_image(XlImage(redBuffer), ___)
      len(sheet._images)
    hints:
    - "(255, 0, 0)이 빨강. anchor는 셀 좌표 문자열."
  check:
    noError: PIL.Image.new의 color는 RGB 튜플이어야 합니다.
    resultCheck: sheet._images 길이가 2여야 합니다.
- id: step2_url_hyperlink
  title: 2단계. URL 하이퍼링크
  structuredPrimary: true
  subtitle: cell.hyperlink = "https://..."
  goal: 셀에 외부 URL 링크를 부여하고 클릭 가능하도록 표시한다.
  why: 보고서에서 자세한 출처나 외부 시스템(주문 상세 페이지)으로 이동할 수 있으면 사용자 경험이 즉시 좋아집니다.
  explanation: |-
    \`cell.hyperlink = "https://example.com"\`을 직접 대입할 수 있습니다. 시각적으로 링크처럼 보이려면 cell.style = "Hyperlink"(내장 NamedStyle)를 함께 적용해야 파란 밑줄이 나타납니다.
  tips:
  - "cell.value에 표시 텍스트, cell.hyperlink에 실제 URL을 따로 둡니다. 둘이 다를 수 있습니다(예: 표시 'Order #A001', 링크는 상세 URL)."
  snippet: |-
    from openpyxl import Workbook

    book = Workbook()
    sheet = book.active
    sheet.append(["order_id", "detail_link"])
    sheet.cell(row=2, column=1, value="A001")
    detailCell = sheet.cell(row=2, column=2, value="자세히")
    detailCell.hyperlink = "https://example.com/orders/A001"
    detailCell.style = "Hyperlink"
    detailCell.value, detailCell.hyperlink.target
  exercise:
    prompt: 두 번째 주문 A002 행을 추가하고 같은 패턴으로 링크를 부여하세요.
    starterCode: |-
      from openpyxl import Workbook

      book = Workbook()
      sheet = book.active
      sheet.append(["order_id", "detail_link"])
      sheet.cell(row=2, column=1, value="A001")
      first = sheet.cell(row=2, column=2, value="자세히")
      first.hyperlink = "https://example.com/orders/A001"
      first.style = "Hyperlink"

      sheet.cell(row=3, column=1, value=___)
      second = sheet.cell(row=3, column=2, value="자세히")
      second.hyperlink = ___
      second.style = "Hyperlink"
      second.value, second.hyperlink.target
    hints:
    - "A002로 일관되게. 링크 URL도 .../orders/A002 패턴."
  check:
    noError: hyperlink.target은 문자열 URL이어야 합니다.
    resultCheck: second.hyperlink.target이 A002 주문 URL이어야 합니다.
- id: step3_internal_link
  title: 3단계. 내부 시트 링크
  structuredPrimary: true
  subtitle: "#SheetName!A1"
  goal: 같은 워크북의 다른 시트로 이동하는 내부 링크를 만든다.
  why: 다중 시트 보고서에서 summary → detail로 이동하는 링크는 사용자의 클릭 비용을 크게 줄입니다.
  explanation: |-
    내부 링크는 "#" 접두사로 시작하고, "#SheetName!A1" 형식을 따릅니다. 시트 이름에 공백이 있으면 "'My Sheet'!A1"처럼 작은따옴표가 필요합니다.
  tips:
  - "시트 이름을 직접 박지 말고 openpyxl.utils.quote_sheetname을 쓰면 따옴표 처리가 안전합니다. 큰 자동화에서 이름이 동적으로 들어올 때 유용합니다."
  snippet: |-
    from openpyxl import Workbook

    book = Workbook()
    summary = book.active
    summary.title = "summary"
    detail = book.create_sheet("detail")
    detail.append(["item", "amount"])
    detail.append(["pen", 1000])

    summary.append(["link", "label"])
    target = summary.cell(row=2, column=1, value="detail로 이동")
    target.hyperlink = "#detail!A1"
    target.style = "Hyperlink"
    target.hyperlink.location
  exercise:
    prompt: "summary에 detail!A2 셀로 정확히 이동하는 두 번째 링크를 추가하세요."
    starterCode: |-
      from openpyxl import Workbook

      book = Workbook()
      summary = book.active
      summary.title = "summary"
      detail = book.create_sheet("detail")
      detail.append(["item", "amount"])
      detail.append(["pen", 1000])

      summary.append(["link", "label"])
      first = summary.cell(row=2, column=1, value="detail로 이동")
      first.hyperlink = "#detail!A1"
      first.style = "Hyperlink"

      second = summary.cell(row=3, column=1, value="첫 데이터 행")
      second.hyperlink = ___
      second.style = "Hyperlink"
      second.hyperlink.location
    hints:
    - "내부 링크 문법: '#시트이름!셀좌표'. detail의 A2면 '#detail!A2'."
  check:
    noError: 내부 링크 문자열은 "#"으로 시작해야 합니다.
    resultCheck: second.hyperlink.location이 detail!A2를 가리켜야 합니다.
- id: step4_comments
  title: 4단계. 셀 코멘트
  structuredPrimary: true
  subtitle: openpyxl.comments.Comment
  goal: 셀에 부가 설명 코멘트를 추가해 보고서의 맥락을 보존한다.
  why: 이 숫자가 왜 이 값인가에 대한 설명을 별도 문서로 빼면 사용자가 못 보고 지나칩니다. 셀에 직접 붙이면 마우스 오버로 즉시 보입니다.
  explanation: |-
    \`from openpyxl.comments import Comment\` 후, \`cell.comment = Comment(text, author)\`. text에는 줄바꿈을 포함한 긴 설명도 들어갑니다.
  tips:
  - "코멘트의 너비/높이는 cell.comment.width/height(픽셀)로 조정합니다. 기본값으로도 대부분 충분합니다."
  snippet: |-
    from openpyxl import Workbook
    from openpyxl.comments import Comment

    book = Workbook()
    sheet = book.active
    sheet.append(["item", "amount"])
    sheet.append(["pen", 1000])
    sheet.append(["book", 12000])

    sheet["B2"].comment = Comment("단가 변동 큼. 월 1회 갱신 필요.", "autopilot")
    sheet["B2"].comment.text, sheet["B2"].comment.author
  exercise:
    prompt: B3에도 코멘트 "공급사 변경 검토 중"을 author "autopilot"으로 부여하세요.
    starterCode: |-
      from openpyxl import Workbook
      from openpyxl.comments import Comment

      book = Workbook()
      sheet = book.active
      sheet.append(["item", "amount"])
      sheet.append(["pen", 1000])
      sheet.append(["book", 12000])

      sheet["B2"].comment = Comment("단가 변동 큼. 월 1회 갱신 필요.", "autopilot")
      sheet["B3"].comment = Comment(___, ___)
      sheet["B3"].comment.text, sheet["B3"].comment.author
    hints:
    - 두 인자 모두 문자열입니다.
  check:
    noError: Comment 인자가 두 개(text, author) 모두 필요합니다.
    resultCheck: B3.comment.text와 author가 입력 값과 같아야 합니다.
- id: validation
  title: 5단계. 검증 루프 - 상품 카탈로그
  structuredPrimary: true
  subtitle: 저장 → 재오픈 → 이미지·링크·코멘트 보존
  goal: 이미지·URL 링크·내부 링크·코멘트를 모두 결합한 카탈로그를 만들고, 재오픈해 각 요소가 보존됐는지 확인한다.
  why: 이미지와 링크는 .xlsx 안에 별도 부분(part)으로 저장됩니다. 잘못된 anchor나 URL이 있으면 저장 시 정적으로 잡히지 않을 수 있어 재오픈 검증이 필수입니다.
  explanation: |-
    \`buildCatalog\`는 상품 행마다 이미지·외부 URL·내부 detail 링크·코멘트를 부여합니다. 재오픈 후 _images 길이, hyperlink.target, comment.text를 모두 확인합니다.
  tips:
  - "코멘트는 한 번 저장하면 author가 자동으로 'Comment'에서 변환되어 들어갑니다. 정확히 author 문자열을 검증하려면 in 비교가 안전합니다."
  snippet: |-
    from io import BytesIO
    from pathlib import Path
    from tempfile import TemporaryDirectory
    from PIL import Image as PILImage
    from openpyxl import Workbook, load_workbook
    from openpyxl.comments import Comment
    from openpyxl.drawing.image import Image as XlImage

    def buildCatalog(path, products):
        book = Workbook()
        summary = book.active
        summary.title = "catalog"
        summary.append(["product", "preview", "detail", "note"])
        detail = book.create_sheet("detail")
        detail.append(["product", "spec"])

        for index, (name, color, url, spec, note) in enumerate(products, start=2):
            summary.cell(row=index, column=1, value=name)

            swatch = PILImage.new("RGB", (60, 30), color)
            buffer = BytesIO()
            swatch.save(buffer, format="PNG")
            buffer.seek(0)
            summary.add_image(XlImage(buffer), f"B{index}")

            linkCell = summary.cell(row=index, column=3, value="상세")
            linkCell.hyperlink = url
            linkCell.style = "Hyperlink"

            detail.append([name, spec])
            internalCell = summary.cell(row=index, column=4, value="시트 내 상세")
            internalCell.hyperlink = f"#detail!A{index}"
            internalCell.style = "Hyperlink"

            summary.cell(row=index, column=1).comment = Comment(note, "autopilot")

        book.save(path)
        return path

    workdir = TemporaryDirectory()
    catalogPath = buildCatalog(
        Path(workdir.name) / "catalog.xlsx",
        [
            ("pen", (48, 84, 150), "https://example.com/pen", "0.5mm", "재고 충분"),
            ("book", (200, 60, 60), "https://example.com/book", "A5 노트", "공급사 변경 검토"),
        ],
    )

    reopened = load_workbook(catalogPath)
    catalog = reopened["catalog"]
    assert len(catalog._images) == 2
    assert catalog["C2"].hyperlink.target == "https://example.com/pen"
    assert catalog["D2"].hyperlink.target == "#detail!A2"
    assert "재고" in catalog["A2"].comment.text
    catalog["C2"].hyperlink.target, catalog["A2"].comment.text
  exercise:
    prompt: 세 번째 상품 ("notebook", 색 자유, URL 자유, 스펙 자유, 노트 자유)을 products에 추가하고, _images 길이가 3이 되는지 확인하세요.
    starterCode: |-
      from io import BytesIO
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from PIL import Image as PILImage
      from openpyxl import Workbook, load_workbook
      from openpyxl.comments import Comment
      from openpyxl.drawing.image import Image as XlImage

      def buildCatalog(path, products):
          book = Workbook()
          summary = book.active
          summary.title = "catalog"
          summary.append(["product", "preview", "detail", "note"])
          detail = book.create_sheet("detail")
          detail.append(["product", "spec"])
          for index, (name, color, url, spec, note) in enumerate(products, start=2):
              summary.cell(row=index, column=1, value=name)
              swatch = PILImage.new("RGB", (60, 30), color)
              buffer = BytesIO()
              swatch.save(buffer, format="PNG")
              buffer.seek(0)
              summary.add_image(XlImage(buffer), f"B{index}")
              linkCell = summary.cell(row=index, column=3, value="상세")
              linkCell.hyperlink = url
              linkCell.style = "Hyperlink"
              detail.append([name, spec])
              internalCell = summary.cell(row=index, column=4, value="시트 내 상세")
              internalCell.hyperlink = f"#detail!A{index}"
              internalCell.style = "Hyperlink"
              summary.cell(row=index, column=1).comment = Comment(note, "autopilot")
          book.save(path)
          return path

      workdir = TemporaryDirectory()
      catalogPath = buildCatalog(
          Path(workdir.name) / "catalog.xlsx",
          [
              ("pen", (48, 84, 150), "https://example.com/pen", "0.5mm", "재고 충분"),
              ("book", (200, 60, 60), "https://example.com/book", "A5 노트", "공급사 변경 검토"),
              ___,
          ],
      )
      reopened = load_workbook(catalogPath)
      assert len(reopened["catalog"]._images) == 3
      len(reopened["catalog"]._images)
    hints:
    - "5-튜플: (이름, RGB 튜플, URL, 스펙 문자열, 코멘트 문자열)."
  check:
    noError: products의 각 튜플이 5개 요소여야 unpack이 통과합니다.
    resultCheck: _images 길이가 3이어야 합니다.
- id: practice
  title: 실습 - 종합 미션 2개
  structuredPrimary: true
  subtitle: import부터 검증까지 독립 실행
  goal: 이미지·외부 URL·내부 링크·코멘트 네 가지를 두 가지 실무 양식에 결합한다.
  why: 인터랙티브 양식은 학습자가 직접 하나씩 결합해 봐야 사용자 경험이 어떻게 달라지는지 체감됩니다.
  explanation: |-
    미션1은 부서 색상 로고 이미지 + 부서 상세 URL 링크를 결합합니다. 미션2는 챕터별 시트와 summary 시트의 내부 링크 + 챕터 셀에 코멘트를 부여합니다.
  tips:
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  - 변수 prefix는 \`dept*\`(미션1), \`book*\`(미션2)로 격리됩니다.
  snippet: |-
    from io import BytesIO
    from pathlib import Path
    from tempfile import TemporaryDirectory
    from PIL import Image as PILImage
    from openpyxl import Workbook, load_workbook
    from openpyxl.comments import Comment
    from openpyxl.drawing.image import Image as XlImage
  exercise:
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.
    starterCode: |-
      from io import BytesIO
      from pathlib import Path
      from tempfile import TemporaryDirectory
      from PIL import Image as PILImage
      from openpyxl import Workbook, load_workbook
      from openpyxl.comments import Comment
      from openpyxl.drawing.image import Image as XlImage

      workdir = TemporaryDirectory()
      target = Path(workdir.name) / "mission.xlsx"
      ___
    hints:
    - 미션1 이미지는 PIL.Image.new로 부서별 색깔. URL은 부서 페이지 패턴.
    - 미션2 내부 링크 문법 "#chapter1!A1" 처럼 # 접두사.
  check:
    noError: PIL 이미지의 color는 RGB 튜플이어야 합니다.
    resultCheck: 재오픈 후 _images 개수, hyperlink.target/location, comment.text가 모두 보존되어야 합니다.
  blocks:
  - type: tip
    content: PIL.Image.new로 만든 이미지를 BytesIO로 변환하면 디스크 임시 파일 없이 워크북에 삽입할 수 있습니다.
  - type: expansion
    title: "미션1: 부서 로고 이미지 + 부서 상세 URL"
    blocks:
    - type: code
      title: 부서 행 + 이미지 + URL
      content: |-
        from io import BytesIO
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from PIL import Image as PILImage
        from openpyxl import Workbook, load_workbook
        from openpyxl.drawing.image import Image as XlImage

        deptDir = TemporaryDirectory()
        deptPath = Path(deptDir.name) / "departments.xlsx"

        deptBook = Workbook()
        deptSheet = deptBook.active
        deptSheet.title = "depts"
        deptSheet.append(["department", "logo", "detail"])
        deptRows = [
            ("Sales", (48, 84, 150), "https://example.com/dept/sales"),
            ("RnD", (40, 167, 69), "https://example.com/dept/rnd"),
            ("Ops", (220, 53, 69), "https://example.com/dept/ops"),
        ]
        for index, (name, color, url) in enumerate(deptRows, start=2):
            deptSheet.cell(row=index, column=1, value=name)
            swatch = PILImage.new("RGB", (60, 30), color)
            buffer = BytesIO()
            swatch.save(buffer, format="PNG")
            buffer.seek(0)
            deptSheet.add_image(XlImage(buffer), f"B{index}")
            urlCell = deptSheet.cell(row=index, column=3, value="자세히")
            urlCell.hyperlink = url
            urlCell.style = "Hyperlink"
        deptBook.save(deptPath)
        len(deptSheet._images)
    - type: code
      title: 이미지·링크 보존 검증
      content: |-
        deptReopen = load_workbook(deptPath)
        deptBack = deptReopen["depts"]
        assert len(deptBack._images) == 3
        assert deptBack["C2"].hyperlink.target == "https://example.com/dept/sales"
        assert deptBack["C4"].hyperlink.target.endswith("/ops")
        len(deptBack._images), deptBack["C2"].hyperlink.target
  - type: expansion
    title: "미션2: 챕터 시트 + 내부 링크 + 코멘트"
    blocks:
    - type: code
      title: summary와 챕터 시트들
      content: |-
        from pathlib import Path
        from tempfile import TemporaryDirectory
        from openpyxl import Workbook, load_workbook
        from openpyxl.comments import Comment

        bookDir = TemporaryDirectory()
        bookPath = Path(bookDir.name) / "book.xlsx"

        workBook = Workbook()
        bookSummary = workBook.active
        bookSummary.title = "summary"
        bookSummary.append(["chapter", "link", "note"])
        chapters = [
            ("chapter1", "1장 - 시작", "필수 읽기"),
            ("chapter2", "2장 - 응용", "심화"),
            ("chapter3", "3장 - 종합", "프로젝트"),
        ]
        for index, (sheetName, label, note) in enumerate(chapters, start=2):
            workBook.create_sheet(sheetName)
            bookSummary.cell(row=index, column=1, value=sheetName)
            linkCell = bookSummary.cell(row=index, column=2, value=label)
            linkCell.hyperlink = f"#{sheetName}!A1"
            linkCell.style = "Hyperlink"
            bookSummary.cell(row=index, column=3, value=note)
            bookSummary.cell(row=index, column=1).comment = Comment(note, "autopilot")
        workBook.save(bookPath)
        workBook.sheetnames
    - type: code
      title: 내부 링크·코멘트 보존 검증
      content: |-
        bookReopen = load_workbook(bookPath)
        bookBack = bookReopen["summary"]
        assert bookBack["B2"].hyperlink.target == "#chapter1!A1"
        assert bookBack["B4"].hyperlink.target == "#chapter3!A1"
        assert "프로젝트" in bookBack["A4"].comment.text
        bookBack["B2"].hyperlink.target, bookBack["A4"].comment.text
- id: summary
  title: 정리
  subtitle: 표 너머의 표현
  blocks:
  - type: text
    content: |-
      이미지, 외부 링크, 내부 링크, 코멘트가 더해지면 보고서는 정적 표가 아니라 인터랙티브 양식이 됩니다. 다음 강의에서는 입력 양식의 무결성을 데이터 검증으로 잠급니다.
  - type: list
    style: bullet
    items:
    - "PIL.Image.new → BytesIO → openpyxl Image → ws.add_image(image, anchor)"
    - 'URL 링크 cell.hyperlink = "https://...", cell.style = "Hyperlink"'
    - '내부 링크 "#SheetName!A1" 형식, 공백 있는 이름은 작은따옴표'
    - "Comment(text, author)로 셀에 부가 설명, 받는 사람이 별도 문서 없이 이해"
    - "재오픈 후 _images, hyperlink.target/location, comment.text를 모두 검증"
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
  - id: openpyxl_08-media-link-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_image_from_pil
    - summary
    title: Excel 이미지·하이퍼링크의 alt text·origin 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 이미지 크기·설명과 허용 origin 밖 링크를 검사한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 이미지는 alt text와 pixel budget을 artifact 계약에 포함하세요.
    - 하이퍼링크는 URL 문자열이 아니라 normalized origin allowlist로 검사하세요.
    exercise:
      prompt: audit_media_links(images, links, allowed_origins, maximum_image_pixels)를 완성하세요.
      starterCode: |-
        def audit_media_links(images, links, allowed_origins, maximum_image_pixels):
            raise NotImplementedError
      solution: |
        def audit_media_links(images, links, allowed_origins, maximum_image_pixels):
            from urllib.parse import urlsplit
            image_failures = []
            for image in images:
                reasons = []
                if not image.get("altText"):
                    reasons.append("alt-text")
                if image.get("width", 0) * image.get("height", 0) > maximum_image_pixels:
                    reasons.append("pixel-budget")
                if reasons:
                    image_failures.append({"id": image["id"], "reasons": reasons})
            link_failures = []
            for link in links:
                parts = urlsplit(link["url"])
                origin = f"{parts.scheme}://{parts.netloc}"
                if parts.scheme not in {"http", "https"} or origin not in allowed_origins:
                    link_failures.append({"cell": link["cell"], "origin": origin})
            return {"accepted": not image_failures and not link_failures, "imageFailures": image_failures, "linkFailures": link_failures}
      hints: *id001
    check:
      id: python.openpyxl.openpyxl_08.media-link-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_08.media-link-contract.mastery.behavior.v1.fixture
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
        entry: audit_media_links
        cases:
        - id: accepts-described-image-and-link
          arguments:
          - value:
            - id: logo
              altText: Company logo
              width: 100
              height: 50
          - value:
            - cell: A1
              url: https://example.test/report
          - value:
            - https://example.test
          - value: 10000
          expectedReturn:
            accepted: true
            imageFailures: []
            linkFailures: []
        - id: reports-image-contract-failures
          arguments:
          - value:
            - id: photo
              altText: ''
              width: 1000
              height: 1000
          - value: []
          - value: []
          - value: 10000
          expectedReturn:
            accepted: false
            imageFailures:
            - id: photo
              reasons:
              - alt-text
              - pixel-budget
            linkFailures: []
        - id: reports-disallowed-link-origin
          arguments:
          - value: []
          - value:
            - cell: B2
              url: https://other.test/x
          - value:
            - https://example.test
          - value: 1
          expectedReturn:
            accepted: false
            imageFailures: []
            linkFailures:
            - cell: B2
              origin: https://other.test
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: openpyxl_08-media-artifact-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_08-media-link-contract-mastery
    title: 새 workbook의 media relationship reconciliation 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 계획한 image·link identity가 재개방 package relationship에 존재하는지 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - cell 값만 재개방하지 말고 xlsx package media relationship도 대조하세요.
    - target 원문 대신 image bytes나 URL의 hash를 identity로 사용하세요.
    exercise:
      prompt: reconcile_media_relationships(planned, observed)를 완성하세요.
      starterCode: |-
        def reconcile_media_relationships(planned, observed):
            raise NotImplementedError
      solution: |
        def reconcile_media_relationships(planned, observed):
            planned_ids = {(item["kind"], item["anchor"], item["targetHash"]) for item in planned}
            observed_ids = {(item["kind"], item["anchor"], item["targetHash"]) for item in observed}
            missing = sorted([list(item) for item in planned_ids - observed_ids])
            unexpected = sorted([list(item) for item in observed_ids - planned_ids])
            return {"passed": not missing and not unexpected, "missing": missing, "unexpected": unexpected}
      hints: *id002
    check:
      id: python.openpyxl.openpyxl_08.media-artifact-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_08.media-artifact-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_media_relationships
        cases:
        - id: accepts-image-and-link-relationships
          arguments:
          - value:
            - kind: image
              anchor: A1
              targetHash: img
            - kind: link
              anchor: B2
              targetHash: url
          - value:
            - kind: link
              anchor: B2
              targetHash: url
            - kind: image
              anchor: A1
              targetHash: img
          expectedReturn:
            passed: true
            missing: []
            unexpected: []
        - id: reports-missing-media
          arguments:
          - value:
            - kind: image
              anchor: A1
              targetHash: img
          - value: []
          expectedReturn:
            passed: false
            missing:
            - - image
              - A1
              - img
            unexpected: []
        - id: reports-unexpected-link
          arguments:
          - value: []
          - value:
            - kind: link
              anchor: A1
              targetHash: x
          expectedReturn:
            passed: false
            missing: []
            unexpected:
            - - link
              - A1
              - x
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: openpyxl_08-excel-media-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - openpyxl_08-media-artifact-reconciliation-transfer
    title: Excel 이미지·하이퍼링크 품질 기준 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 설명·origin·relationship evidence를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Workbook 저장 성공과 업무 값·수식·표시의 정확성을 분리해 검증하세요.
    - Web에서는 문서 계약을 검증하고 Local에서는 재개방한 artifact evidence를 남기세요.
    exercise:
      prompt: choose_excel_media_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_excel_media_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_excel_media_evidence(situation):
            table = {'image': {'action': 'bound pixels and add alt text', 'evidence': 'image descriptor', 'risk': 'bloated inaccessible workbook'}, 'link': {'action': 'allowlist normalized origin', 'evidence': 'cell and URL hash', 'risk': 'unsafe destination'}, 'verify': {'action': 'reconcile package relationships', 'evidence': 'anchor and target hash', 'risk': 'missing media'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.openpyxl.openpyxl_08.excel-media-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.openpyxl.openpyxl_08.excel-media-recall.retrieval.behavior.v1.fixture
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
        entry: choose_excel_media_evidence
        cases:
        - id: recalls-image
          arguments:
          - value: image
          expectedReturn:
            action: bound pixels and add alt text
            evidence: image descriptor
            risk: bloated inaccessible workbook
        - id: recalls-link
          arguments:
          - value: link
          expectedReturn:
            action: allowlist normalized origin
            evidence: cell and URL hash
            risk: unsafe destination
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};