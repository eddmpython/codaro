var e=`meta:\r
  id: openpyxl_08\r
  title: 이미지와 하이퍼링크\r
  order: 8\r
  category: openpyxl\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  packages:\r
  - openpyxl\r
  - pillow\r
  tags:\r
  - openpyxl\r
  - 이미지\r
  - 하이퍼링크\r
  - Comment\r
  - 상품카탈로그\r
  seo:\r
    title: openpyxl 이미지와 하이퍼링크 - add_image·cell.hyperlink·Comment\r
    description: 워크시트에 PNG/JPG를 삽입하고, 셀에 URL/내부 시트 링크와 코멘트를 부여해 인터랙티브 보고서를 만듭니다.\r
    keywords:\r
    - openpyxl add_image\r
    - cell hyperlink\r
    - openpyxl Comment\r
    - Pillow PIL\r
intro:\r
  direction: 이미지 삽입, 외부 URL과 내부 시트 하이퍼링크, 셀 코멘트를 결합해 상품 카탈로그 같은 인터랙티브 보고서를 만듭니다.\r
  benefits:\r
  - PIL로 만든 이미지를 메모리에서 직접 워크시트로 삽입합니다.\r
  - URL 링크와 시트 내부 링크의 문법 차이를 구분합니다.\r
  - "코멘트로 셀의 부가 설명을 남겨, 보고서를 받는 사람이 별도 문서 없이도 맥락을 이해하게 만듭니다."\r
  diagram:\r
    steps:\r
    - label: 이미지 삽입\r
      detail: PIL.Image → openpyxl Image → add_image(image, anchor).\r
    - label: URL 링크\r
      detail: cell.hyperlink = "https://..." + cell.style.\r
    - label: 내부 링크\r
      detail: 같은 워크북의 다른 시트로 이동하는 "#Sheet!A1" 문법.\r
    - label: 코멘트\r
      detail: Comment(text, author)로 셀 주석.\r
    runtime:\r
    - label: openpyxl + Pillow 패키지 준비\r
      detail: PIL.Image와 openpyxl.drawing.image.Image, openpyxl.comments.Comment를 함께 import해 사용한다.\r
    - label: 이미지·링크·코멘트 재오픈 검증\r
      detail: load_workbook으로 다시 열어 _images 길이, hyperlink.target/location, comment.text가 보존됐는지 assert로 확인한다.\r
sections:\r
- id: step1_image_from_pil\r
  title: 1단계. PIL 이미지를 시트에 삽입\r
  structuredPrimary: true\r
  subtitle: PIL.Image → openpyxl.drawing.image.Image\r
  goal: 디스크 파일 없이 메모리에서 만든 PIL 이미지를 워크시트에 삽입한다.\r
  why: "디스크에 임시 이미지를 만들면 정리 책임이 생깁니다. PIL → BytesIO → openpyxl Image 흐름이 임시 파일 없이 깔끔합니다."\r
  explanation: |-\r
    PIL의 Image.new로 단색 이미지를 만들고, BytesIO에 PNG로 저장한 뒤, openpyxl의 Image로 감싸 시트에 add_image합니다. anchor는 차트와 동일하게 좌상단 셀 좌표 문자열입니다.\r
  tips:\r
  - "PIL Image 객체를 직접 openpyxl Image에 넘길 수도 있지만, BytesIO를 거치는 것이 가장 호환성이 좋습니다."\r
  snippet: |-\r
    from io import BytesIO\r
    from PIL import Image as PILImage\r
    from openpyxl import Workbook\r
    from openpyxl.drawing.image import Image as XlImage\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["product", "image"])\r
    sheet.append(["pen", "여기 이미지"])\r
\r
    swatch = PILImage.new("RGB", (80, 40), (48, 84, 150))\r
    buffer = BytesIO()\r
    swatch.save(buffer, format="PNG")\r
    buffer.seek(0)\r
\r
    sheetImage = XlImage(buffer)\r
    sheet.add_image(sheetImage, "B2")\r
    len(sheet._images)\r
  exercise:\r
    prompt: 두 번째 행에 빨간색(255,0,0) 이미지를 만들어 B3에 추가하고 sheet._images 길이가 2가 되는지 확인하세요.\r
    starterCode: |-\r
      from io import BytesIO\r
      from PIL import Image as PILImage\r
      from openpyxl import Workbook\r
      from openpyxl.drawing.image import Image as XlImage\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["product", "image"])\r
      sheet.append(["pen", "이미지"])\r
      sheet.append(["book", "이미지"])\r
\r
      blue = PILImage.new("RGB", (80, 40), (48, 84, 150))\r
      blueBuffer = BytesIO()\r
      blue.save(blueBuffer, format="PNG")\r
      blueBuffer.seek(0)\r
\r
      red = PILImage.new("RGB", (80, 40), ___)\r
      redBuffer = BytesIO()\r
      red.save(redBuffer, format="PNG")\r
      redBuffer.seek(0)\r
\r
      sheet.add_image(XlImage(blueBuffer), "B2")\r
      sheet.add_image(XlImage(redBuffer), ___)\r
      len(sheet._images)\r
    hints:\r
    - "(255, 0, 0)이 빨강. anchor는 셀 좌표 문자열."\r
  check:\r
    noError: PIL.Image.new의 color는 RGB 튜플이어야 합니다.\r
    resultCheck: sheet._images 길이가 2여야 합니다.\r
- id: step2_url_hyperlink\r
  title: 2단계. URL 하이퍼링크\r
  structuredPrimary: true\r
  subtitle: cell.hyperlink = "https://..."\r
  goal: 셀에 외부 URL 링크를 부여하고 클릭 가능하도록 표시한다.\r
  why: 보고서에서 자세한 출처나 외부 시스템(주문 상세 페이지)으로 이동할 수 있으면 사용자 경험이 즉시 좋아집니다.\r
  explanation: |-\r
    \`cell.hyperlink = "https://example.com"\`을 직접 대입할 수 있습니다. 시각적으로 링크처럼 보이려면 cell.style = "Hyperlink"(내장 NamedStyle)를 함께 적용해야 파란 밑줄이 나타납니다.\r
  tips:\r
  - "cell.value에 표시 텍스트, cell.hyperlink에 실제 URL을 따로 둡니다. 둘이 다를 수 있습니다(예: 표시 'Order #A001', 링크는 상세 URL)."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["order_id", "detail_link"])\r
    sheet.cell(row=2, column=1, value="A001")\r
    detailCell = sheet.cell(row=2, column=2, value="자세히")\r
    detailCell.hyperlink = "https://example.com/orders/A001"\r
    detailCell.style = "Hyperlink"\r
    detailCell.value, detailCell.hyperlink.target\r
  exercise:\r
    prompt: 두 번째 주문 A002 행을 추가하고 같은 패턴으로 링크를 부여하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["order_id", "detail_link"])\r
      sheet.cell(row=2, column=1, value="A001")\r
      first = sheet.cell(row=2, column=2, value="자세히")\r
      first.hyperlink = "https://example.com/orders/A001"\r
      first.style = "Hyperlink"\r
\r
      sheet.cell(row=3, column=1, value=___)\r
      second = sheet.cell(row=3, column=2, value="자세히")\r
      second.hyperlink = ___\r
      second.style = "Hyperlink"\r
      second.value, second.hyperlink.target\r
    hints:\r
    - "A002로 일관되게. 링크 URL도 .../orders/A002 패턴."\r
  check:\r
    noError: hyperlink.target은 문자열 URL이어야 합니다.\r
    resultCheck: second.hyperlink.target이 A002 주문 URL이어야 합니다.\r
- id: step3_internal_link\r
  title: 3단계. 내부 시트 링크\r
  structuredPrimary: true\r
  subtitle: "#SheetName!A1"\r
  goal: 같은 워크북의 다른 시트로 이동하는 내부 링크를 만든다.\r
  why: 다중 시트 보고서에서 summary → detail로 이동하는 링크는 사용자의 클릭 비용을 크게 줄입니다.\r
  explanation: |-\r
    내부 링크는 "#" 접두사로 시작하고, "#SheetName!A1" 형식을 따릅니다. 시트 이름에 공백이 있으면 "'My Sheet'!A1"처럼 작은따옴표가 필요합니다.\r
  tips:\r
  - "시트 이름을 직접 박지 말고 openpyxl.utils.quote_sheetname을 쓰면 따옴표 처리가 안전합니다. 큰 자동화에서 이름이 동적으로 들어올 때 유용합니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    summary = book.active\r
    summary.title = "summary"\r
    detail = book.create_sheet("detail")\r
    detail.append(["item", "amount"])\r
    detail.append(["pen", 1000])\r
\r
    summary.append(["link", "label"])\r
    target = summary.cell(row=2, column=1, value="detail로 이동")\r
    target.hyperlink = "#detail!A1"\r
    target.style = "Hyperlink"\r
    target.hyperlink.location\r
  exercise:\r
    prompt: "summary에 detail!A2 셀로 정확히 이동하는 두 번째 링크를 추가하세요."\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      summary = book.active\r
      summary.title = "summary"\r
      detail = book.create_sheet("detail")\r
      detail.append(["item", "amount"])\r
      detail.append(["pen", 1000])\r
\r
      summary.append(["link", "label"])\r
      first = summary.cell(row=2, column=1, value="detail로 이동")\r
      first.hyperlink = "#detail!A1"\r
      first.style = "Hyperlink"\r
\r
      second = summary.cell(row=3, column=1, value="첫 데이터 행")\r
      second.hyperlink = ___\r
      second.style = "Hyperlink"\r
      second.hyperlink.location\r
    hints:\r
    - "내부 링크 문법: '#시트이름!셀좌표'. detail의 A2면 '#detail!A2'."\r
  check:\r
    noError: 내부 링크 문자열은 "#"으로 시작해야 합니다.\r
    resultCheck: second.hyperlink.location이 detail!A2를 가리켜야 합니다.\r
- id: step4_comments\r
  title: 4단계. 셀 코멘트\r
  structuredPrimary: true\r
  subtitle: openpyxl.comments.Comment\r
  goal: 셀에 부가 설명 코멘트를 추가해 보고서의 맥락을 보존한다.\r
  why: 이 숫자가 왜 이 값인가에 대한 설명을 별도 문서로 빼면 사용자가 못 보고 지나칩니다. 셀에 직접 붙이면 마우스 오버로 즉시 보입니다.\r
  explanation: |-\r
    \`from openpyxl.comments import Comment\` 후, \`cell.comment = Comment(text, author)\`. text에는 줄바꿈을 포함한 긴 설명도 들어갑니다.\r
  tips:\r
  - "코멘트의 너비/높이는 cell.comment.width/height(픽셀)로 조정합니다. 기본값으로도 대부분 충분합니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
    from openpyxl.comments import Comment\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["item", "amount"])\r
    sheet.append(["pen", 1000])\r
    sheet.append(["book", 12000])\r
\r
    sheet["B2"].comment = Comment("단가 변동 큼. 월 1회 갱신 필요.", "autopilot")\r
    sheet["B2"].comment.text, sheet["B2"].comment.author\r
  exercise:\r
    prompt: B3에도 코멘트 "공급사 변경 검토 중"을 author "autopilot"으로 부여하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
      from openpyxl.comments import Comment\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["item", "amount"])\r
      sheet.append(["pen", 1000])\r
      sheet.append(["book", 12000])\r
\r
      sheet["B2"].comment = Comment("단가 변동 큼. 월 1회 갱신 필요.", "autopilot")\r
      sheet["B3"].comment = Comment(___, ___)\r
      sheet["B3"].comment.text, sheet["B3"].comment.author\r
    hints:\r
    - 두 인자 모두 문자열입니다.\r
  check:\r
    noError: Comment 인자가 두 개(text, author) 모두 필요합니다.\r
    resultCheck: B3.comment.text와 author가 입력 값과 같아야 합니다.\r
- id: validation\r
  title: 5단계. 검증 루프 - 상품 카탈로그\r
  structuredPrimary: true\r
  subtitle: 저장 → 재오픈 → 이미지·링크·코멘트 보존\r
  goal: 이미지·URL 링크·내부 링크·코멘트를 모두 결합한 카탈로그를 만들고, 재오픈해 각 요소가 보존됐는지 확인한다.\r
  why: 이미지와 링크는 .xlsx 안에 별도 부분(part)으로 저장됩니다. 잘못된 anchor나 URL이 있으면 저장 시 정적으로 잡히지 않을 수 있어 재오픈 검증이 필수입니다.\r
  explanation: |-\r
    \`buildCatalog\`는 상품 행마다 이미지·외부 URL·내부 detail 링크·코멘트를 부여합니다. 재오픈 후 _images 길이, hyperlink.target, comment.text를 모두 확인합니다.\r
  tips:\r
  - "코멘트는 한 번 저장하면 author가 자동으로 'Comment'에서 변환되어 들어갑니다. 정확히 author 문자열을 검증하려면 in 비교가 안전합니다."\r
  snippet: |-\r
    from io import BytesIO\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from PIL import Image as PILImage\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.comments import Comment\r
    from openpyxl.drawing.image import Image as XlImage\r
\r
    def buildCatalog(path, products):\r
        book = Workbook()\r
        summary = book.active\r
        summary.title = "catalog"\r
        summary.append(["product", "preview", "detail", "note"])\r
        detail = book.create_sheet("detail")\r
        detail.append(["product", "spec"])\r
\r
        for index, (name, color, url, spec, note) in enumerate(products, start=2):\r
            summary.cell(row=index, column=1, value=name)\r
\r
            swatch = PILImage.new("RGB", (60, 30), color)\r
            buffer = BytesIO()\r
            swatch.save(buffer, format="PNG")\r
            buffer.seek(0)\r
            summary.add_image(XlImage(buffer), f"B{index}")\r
\r
            linkCell = summary.cell(row=index, column=3, value="상세")\r
            linkCell.hyperlink = url\r
            linkCell.style = "Hyperlink"\r
\r
            detail.append([name, spec])\r
            internalCell = summary.cell(row=index, column=4, value="시트 내 상세")\r
            internalCell.hyperlink = f"#detail!A{index}"\r
            internalCell.style = "Hyperlink"\r
\r
            summary.cell(row=index, column=1).comment = Comment(note, "autopilot")\r
\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    catalogPath = buildCatalog(\r
        Path(workdir.name) / "catalog.xlsx",\r
        [\r
            ("pen", (48, 84, 150), "https://example.com/pen", "0.5mm", "재고 충분"),\r
            ("book", (200, 60, 60), "https://example.com/book", "A5 노트", "공급사 변경 검토"),\r
        ],\r
    )\r
\r
    reopened = load_workbook(catalogPath)\r
    catalog = reopened["catalog"]\r
    assert len(catalog._images) == 2\r
    assert catalog["C2"].hyperlink.target == "https://example.com/pen"\r
    assert catalog["D2"].hyperlink.target == "#detail!A2"\r
    assert "재고" in catalog["A2"].comment.text\r
    catalog["C2"].hyperlink.target, catalog["A2"].comment.text\r
  exercise:\r
    prompt: 세 번째 상품 ("notebook", 색 자유, URL 자유, 스펙 자유, 노트 자유)을 products에 추가하고, _images 길이가 3이 되는지 확인하세요.\r
    starterCode: |-\r
      from io import BytesIO\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from PIL import Image as PILImage\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.comments import Comment\r
      from openpyxl.drawing.image import Image as XlImage\r
\r
      def buildCatalog(path, products):\r
          book = Workbook()\r
          summary = book.active\r
          summary.title = "catalog"\r
          summary.append(["product", "preview", "detail", "note"])\r
          detail = book.create_sheet("detail")\r
          detail.append(["product", "spec"])\r
          for index, (name, color, url, spec, note) in enumerate(products, start=2):\r
              summary.cell(row=index, column=1, value=name)\r
              swatch = PILImage.new("RGB", (60, 30), color)\r
              buffer = BytesIO()\r
              swatch.save(buffer, format="PNG")\r
              buffer.seek(0)\r
              summary.add_image(XlImage(buffer), f"B{index}")\r
              linkCell = summary.cell(row=index, column=3, value="상세")\r
              linkCell.hyperlink = url\r
              linkCell.style = "Hyperlink"\r
              detail.append([name, spec])\r
              internalCell = summary.cell(row=index, column=4, value="시트 내 상세")\r
              internalCell.hyperlink = f"#detail!A{index}"\r
              internalCell.style = "Hyperlink"\r
              summary.cell(row=index, column=1).comment = Comment(note, "autopilot")\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      catalogPath = buildCatalog(\r
          Path(workdir.name) / "catalog.xlsx",\r
          [\r
              ("pen", (48, 84, 150), "https://example.com/pen", "0.5mm", "재고 충분"),\r
              ("book", (200, 60, 60), "https://example.com/book", "A5 노트", "공급사 변경 검토"),\r
              ___,\r
          ],\r
      )\r
      reopened = load_workbook(catalogPath)\r
      assert len(reopened["catalog"]._images) == 3\r
      len(reopened["catalog"]._images)\r
    hints:\r
    - "5-튜플: (이름, RGB 튜플, URL, 스펙 문자열, 코멘트 문자열)."\r
  check:\r
    noError: products의 각 튜플이 5개 요소여야 unpack이 통과합니다.\r
    resultCheck: _images 길이가 3이어야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: 이미지·외부 URL·내부 링크·코멘트 네 가지를 두 가지 실무 양식에 결합한다.\r
  why: 인터랙티브 양식은 학습자가 직접 하나씩 결합해 봐야 사용자 경험이 어떻게 달라지는지 체감됩니다.\r
  explanation: |-\r
    미션1은 부서 색상 로고 이미지 + 부서 상세 URL 링크를 결합합니다. 미션2는 챕터별 시트와 summary 시트의 내부 링크 + 챕터 셀에 코멘트를 부여합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 변수 prefix는 \`dept*\`(미션1), \`book*\`(미션2)로 격리됩니다.\r
  snippet: |-\r
    from io import BytesIO\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from PIL import Image as PILImage\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.comments import Comment\r
    from openpyxl.drawing.image import Image as XlImage\r
  exercise:\r
    prompt: 두 미션을 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from io import BytesIO\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from PIL import Image as PILImage\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.comments import Comment\r
      from openpyxl.drawing.image import Image as XlImage\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1 이미지는 PIL.Image.new로 부서별 색깔. URL은 부서 페이지 패턴.\r
    - 미션2 내부 링크 문법 "#chapter1!A1" 처럼 # 접두사.\r
  check:\r
    noError: PIL 이미지의 color는 RGB 튜플이어야 합니다.\r
    resultCheck: 재오픈 후 _images 개수, hyperlink.target/location, comment.text가 모두 보존되어야 합니다.\r
  blocks:\r
  - type: tip\r
    content: PIL.Image.new로 만든 이미지를 BytesIO로 변환하면 디스크 임시 파일 없이 워크북에 삽입할 수 있습니다.\r
  - type: expansion\r
    title: "미션1: 부서 로고 이미지 + 부서 상세 URL"\r
    blocks:\r
    - type: code\r
      title: 부서 행 + 이미지 + URL\r
      content: |-\r
        from io import BytesIO\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from PIL import Image as PILImage\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.drawing.image import Image as XlImage\r
\r
        deptDir = TemporaryDirectory()\r
        deptPath = Path(deptDir.name) / "departments.xlsx"\r
\r
        deptBook = Workbook()\r
        deptSheet = deptBook.active\r
        deptSheet.title = "depts"\r
        deptSheet.append(["department", "logo", "detail"])\r
        deptRows = [\r
            ("Sales", (48, 84, 150), "https://example.com/dept/sales"),\r
            ("RnD", (40, 167, 69), "https://example.com/dept/rnd"),\r
            ("Ops", (220, 53, 69), "https://example.com/dept/ops"),\r
        ]\r
        for index, (name, color, url) in enumerate(deptRows, start=2):\r
            deptSheet.cell(row=index, column=1, value=name)\r
            swatch = PILImage.new("RGB", (60, 30), color)\r
            buffer = BytesIO()\r
            swatch.save(buffer, format="PNG")\r
            buffer.seek(0)\r
            deptSheet.add_image(XlImage(buffer), f"B{index}")\r
            urlCell = deptSheet.cell(row=index, column=3, value="자세히")\r
            urlCell.hyperlink = url\r
            urlCell.style = "Hyperlink"\r
        deptBook.save(deptPath)\r
        len(deptSheet._images)\r
    - type: code\r
      title: 이미지·링크 보존 검증\r
      content: |-\r
        deptReopen = load_workbook(deptPath)\r
        deptBack = deptReopen["depts"]\r
        assert len(deptBack._images) == 3\r
        assert deptBack["C2"].hyperlink.target == "https://example.com/dept/sales"\r
        assert deptBack["C4"].hyperlink.target.endswith("/ops")\r
        len(deptBack._images), deptBack["C2"].hyperlink.target\r
  - type: expansion\r
    title: "미션2: 챕터 시트 + 내부 링크 + 코멘트"\r
    blocks:\r
    - type: code\r
      title: summary와 챕터 시트들\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.comments import Comment\r
\r
        bookDir = TemporaryDirectory()\r
        bookPath = Path(bookDir.name) / "book.xlsx"\r
\r
        workBook = Workbook()\r
        bookSummary = workBook.active\r
        bookSummary.title = "summary"\r
        bookSummary.append(["chapter", "link", "note"])\r
        chapters = [\r
            ("chapter1", "1장 - 시작", "필수 읽기"),\r
            ("chapter2", "2장 - 응용", "심화"),\r
            ("chapter3", "3장 - 종합", "프로젝트"),\r
        ]\r
        for index, (sheetName, label, note) in enumerate(chapters, start=2):\r
            workBook.create_sheet(sheetName)\r
            bookSummary.cell(row=index, column=1, value=sheetName)\r
            linkCell = bookSummary.cell(row=index, column=2, value=label)\r
            linkCell.hyperlink = f"#{sheetName}!A1"\r
            linkCell.style = "Hyperlink"\r
            bookSummary.cell(row=index, column=3, value=note)\r
            bookSummary.cell(row=index, column=1).comment = Comment(note, "autopilot")\r
        workBook.save(bookPath)\r
        workBook.sheetnames\r
    - type: code\r
      title: 내부 링크·코멘트 보존 검증\r
      content: |-\r
        bookReopen = load_workbook(bookPath)\r
        bookBack = bookReopen["summary"]\r
        assert bookBack["B2"].hyperlink.target == "#chapter1!A1"\r
        assert bookBack["B4"].hyperlink.target == "#chapter3!A1"\r
        assert "프로젝트" in bookBack["A4"].comment.text\r
        bookBack["B2"].hyperlink.target, bookBack["A4"].comment.text\r
- id: summary\r
  title: 정리\r
  subtitle: 표 너머의 표현\r
  blocks:\r
  - type: text\r
    content: |-\r
      이미지, 외부 링크, 내부 링크, 코멘트가 더해지면 보고서는 정적 표가 아니라 인터랙티브 양식이 됩니다. 다음 강의에서는 입력 양식의 무결성을 데이터 검증으로 잠급니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - "PIL.Image.new → BytesIO → openpyxl Image → ws.add_image(image, anchor)"\r
    - 'URL 링크 cell.hyperlink = "https://...", cell.style = "Hyperlink"'\r
    - '내부 링크 "#SheetName!A1" 형식, 공백 있는 이름은 작은따옴표'\r
    - "Comment(text, author)로 셀에 부가 설명, 받는 사람이 별도 문서 없이 이해"\r
    - "재오픈 후 _images, hyperlink.target/location, comment.text를 모두 검증"\r
`;export{e as default};