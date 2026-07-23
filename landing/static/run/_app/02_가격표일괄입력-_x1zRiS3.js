var e=`meta:
  id: xlwings_02
  title: 도서 가격표 2D 일괄 입력
  order: 2
  category: xlwings
  badge: 입문
  difficulty: easy
  audience: 가로 한 줄 쓰기를 익힌 학습자, 다음으로 2D 표를 한 번에 입력하고 싶은 사람
  packages:
    - xlwings
  tags:
    - xlwings
    - Range2D
    - bulkWrite
    - expand
    - 성능비교
  seo:
    title: 도서 가격표 2D 입력 - xlwings로 표 데이터를 한 번에 쓰기
    description: 출판사의 도서 가격표를 셀별 vs 2D 일괄 두 방식으로 입력하고 성능 차이를 측정한다. expand로 표 영역을 자동 인식한다.
    keywords:
      - xlwings
      - Range
      - 2D
      - bulk
      - expand
intro:
  direction: 출판사의 도서 카탈로그(ISBN, 제목, 저자, 가격)를 한 번의 Range 대입으로 입력하고, expand("table")로 영역을 자동 인식한 뒤 round-trip 검증한다.
  benefits:
    - 출판사·서점·재고 시스템처럼 행 수가 매번 달라지는 표를 다루는 실무 패턴을 익힌다.
    - 셀 하나씩 쓰는 방식과 2D 리스트 일괄 입력의 성능 차이를 time.perf_counter로 직접 측정한다.
    - "sheet[\\"A1\\"].value = listOfLists 한 줄로 표 전체를 입력하는 가장 빠른 패턴을 익힌다."
    - "expand(\\"table\\")로 ISBN 1개부터 1000개까지 같은 코드로 처리되는 일반화된 자동화를 만든다."
  diagram:
    steps:
      - label: 1단계. 도서 카탈로그 2D 데이터 구성
        detail: 헤더(ISBN/제목/저자/가격)와 도서 5권을 list-of-lists로 잡는다.
      - label: 2단계. 셀별 vs 2D 일괄 성능 비교
        detail: 같은 카탈로그를 두 방식으로 입력해 소요 시간을 직접 비교한다.
      - label: 3단계. expand로 카탈로그 영역 자동 인식
        detail: ISBN 1권부터 카탈로그 끝까지를 expand("table")로 한 번에 잡는다.
      - label: 4단계. 실습
        detail: 도서관 신간 입고 + 일별 신규 도서 append 두 시나리오를 직접 만든다.
    runtime:
      - label: xlwings 패키지 확인
        detail: meta.packages의 xlwings가 import 가능해야 한다.
      - label: 카탈로그 크기 결정
        detail: 학습 단계에서는 5-10권이 적당하다. 1000권 이상은 일괄 입력 효과가 더 극적이다.
      - label: 결과 round-trip
        detail: TemporaryDirectory에 저장하고 새 App에서 expand로 다시 읽는다.
sections:
  - id: prepare-catalog
    title: 1단계. 도서 카탈로그 2D 데이터 구성
    structuredPrimary: true
    subtitle: list of lists
    goal: 출판사의 도서 카탈로그(헤더 + 도서 5권)를 list-of-lists로 만들어 자동화 입력 단위를 잡는다.
    why: 출판사·서점의 카탈로그는 매일 신간이 추가되는 가변 크기 데이터다. 헤더와 행의 구조를 코드로 잡아두면 검증 기준이 생긴다.
    explanation: |-
      xlwings의 Range.value는 2D 데이터를 list-of-lists로 주고받습니다. 첫 번째 리스트가 가장 위 행(헤더)이 되고, 각 내부 리스트가 가로 한 줄(도서 한 권)이 됩니다.
      이번 단계에서는 ISBN, 제목, 저자, 가격 4개 컬럼으로 구성된 도서 5권 카탈로그를 만듭니다. 실무에서는 출판사 ERP나 도서 유통 API에서 이 형태로 받게 됩니다.
      [헤더] + 데이터 패턴은 자동화에서 가장 자주 쓰이므로 익혀두세요. 나중에 신간이 추가되면 데이터 리스트에 한 줄 더 붙이기만 하면 됩니다.
    tips:
      - 헤더와 데이터를 합치는 [헤더] + 데이터 패턴은 자동화의 기본 어휘입니다.
      - 한 행의 컬럼 수가 모두 같아야 합니다. 다르면 xlwings가 None으로 채우므로 빈 셀이 생깁니다.
      - ISBN은 13자리 문자열로 다루세요. 9788000... 형태의 한국 도서 ISBN은 정수로 처리하면 앞자리 0이 사라질 수 있습니다.
    snippet: |-
      bookHeader = ["isbn", "title", "author", "price"]
      bookRows = [
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
          ["9788954682152", "역행자", "자청", 19800],
      ]
      bookCatalog = [bookHeader] + bookRows

      assert len(bookCatalog) == 6
      assert all(len(row) == 4 for row in bookCatalog)
      bookCatalog
    exercise:
      prompt: 본인이 최근 읽었거나 사고 싶은 도서 한 권을 bookRows 마지막에 추가하고, 카탈로그 행 수와 컬럼 수가 모두 맞는지 검증하세요.
      starterCode: |-
        bookHeader = ["isbn", "title", "author", "price"]
        bookRows = [
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
            ["9788954682152", "역행자", "자청", 19800],
            ["___", "___", "___", ___],
        ]
        bookCatalog = [bookHeader] + bookRows

        assert len(bookCatalog) == 7
        assert all(len(row) == 4 for row in bookCatalog)
        bookCatalog
      solution: |-
        bookHeader = ["isbn", "title", "author", "price"]
        bookRows = [
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
            ["9788954682152", "역행자", "자청", 19800],
            ["9788937437373", "이방인", "알베르 카뮈", 12000],
        ]
        bookCatalog = [bookHeader] + bookRows

        assert len(bookCatalog) == 7
        assert all(len(row) == 4 for row in bookCatalog)
        bookCatalog
      hints:
        - ISBN은 13자리 문자열, 가격은 정수로 채우면 됩니다.
        - 헤더 1줄 + 도서 6권 = 카탈로그 7행이 됩니다.
    check:
      noError: bookHeader와 bookRows 정의가 IndexError 없이 끝나야 합니다.
      resultCheck: 카탈로그의 모든 행이 4컬럼을 가지고 헤더 포함 7행이 되어야 합니다.

  - id: cell-vs-bulk
    title: 2단계. 셀별 vs 2D 일괄 성능 비교
    structuredPrimary: true
    subtitle: time.perf_counter로 차이 측정
    goal: 같은 도서 카탈로그를 셀 하나씩 쓰는 방식과 2D 리스트 일괄 쓰기 방식으로 입력하고 소요 시간을 비교한다.
    why: xlwings의 셀 R/W는 매번 Excel과 COM 통신하는 비용이 든다. 한 번의 Range 대입으로 모든 셀을 채우면 통신이 한 번으로 줄어 수십 배 빨라진다.
    explanation: |-
      xlwings에서 sheet["A1"].value = 1처럼 셀 하나씩 쓰면, 매번 COM(Windows) 또는 AppleScript(macOS) 호출이 발생합니다. 100개 셀을 쓰면 100번의 호출이 일어납니다.
      반면 sheet["A1"].value = [[...], [...], ...]처럼 2D 리스트를 한 번에 대입하면 통신은 단 한 번이고, xlwings가 내부에서 데이터를 한꺼번에 Excel에 전달합니다.
      학습 단계에서는 5권이라 차이가 미미할 수 있지만, 도서 유통사의 일일 5000권 정산처럼 행 수가 많아지면 셀별 입력이 분 단위, 일괄 입력이 초 단위가 됩니다. 처음부터 일괄 입력 습관을 굳히세요.
    tips:
      - time.perf_counter는 짧은 코드 블록의 소요 시간을 정확히 재는 표준 방법입니다(시스템 sleep 영향 없음).
      - 셀별 입력은 학습용으로만 보여줍니다. 실무 코드에는 절대 쓰지 마세요.
      - sheet.cells(row, col)는 1-base 인덱스입니다. Python의 0-base와 헷갈리지 마세요.
    snippet: |-
      import time
      import xlwings as xw

      def asCells(table):
          # Excel은 숫자를 double로 저장하므로 ISBN 문자열도 숫자처럼 읽혀 22000이 22000.0으로 돌아온다.
          # 정수형 실수는 정수로 되돌리고 모든 셀을 문자열로 정규화해 round-trip 값이 그대로 살아 있는지 비교한다.
          def cell(value):
              if isinstance(value, float) and value.is_integer():
                  value = int(value)
              return str(value)
          return [[cell(value) for value in row] for row in table]

      bookHeader = ["isbn", "title", "author", "price"]
      bookRows = [
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
          ["9788954682152", "역행자", "자청", 19800],
      ]
      bookCatalog = [bookHeader] + bookRows

      with xw.App(visible=False) as perfApp:
          perfBook = perfApp.books.add()
          slowSheet = perfBook.sheets.active
          slowSheet.name = "slow"
          slowStart = time.perf_counter()
          for rowIdx, row in enumerate(bookCatalog, start=1):
              for colIdx, value in enumerate(row, start=1):
                  slowSheet.cells(rowIdx, colIdx).value = value
          slowElapsed = time.perf_counter() - slowStart

          fastSheet = perfBook.sheets.add("fast")
          fastStart = time.perf_counter()
          fastSheet["A1"].value = bookCatalog
          fastElapsed = time.perf_counter() - fastStart

          slowReadback = slowSheet["A1:D6"].value
          fastReadback = fastSheet["A1:D6"].value

      assert asCells(slowReadback) == asCells(fastReadback) == asCells(bookCatalog)
      # 일괄 입력은 행 수가 많을수록 셀별 입력보다 극적으로 빨라진다(아래 ratio로 확인).
      # 5권 정도의 작은 표에서는 COM 워밍업 노이즈로 측정값이 흔들릴 수 있어 시간 대소를 단정하지 않는다.
      {"slow": round(slowElapsed, 3), "fast": round(fastElapsed, 3), "ratio": round(slowElapsed / max(fastElapsed, 1e-6), 1)}
    exercise:
      prompt: bookRows를 두 배(10권)로 늘려서 같은 비교를 다시 실행하고, ratio 값이 어떻게 바뀌는지 보세요. 행 수가 늘수록 ratio가 커집니다.
      starterCode: |-
        import time
        import xlwings as xw

        bookHeader = ["isbn", "title", "author", "price"]
        bookRows = [
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
            ["9788954682152", "역행자", "자청", 19800],
            ["9788937437373", "이방인", "알베르 카뮈", 12000],
            ["9788932020259", "데미안", "헤르만 헤세", 11000],
            ["9788954429245", "1984", "조지 오웰", 13500],
            ["9788937462788", "인간 실격", "다자이 오사무", 9800],
            ["9788937462801", "노인과 바다", "어니스트 헤밍웨이", 11500],
        ]
        bookCatalog = [bookHeader] + bookRows

        with xw.App(visible=False) as perfApp:
            perfBook = perfApp.books.add()
            slowSheet = perfBook.sheets.active
            slowSheet.name = "slow"
            slowStart = time.perf_counter()
            for rowIdx, row in enumerate(bookCatalog, start=1):
                for colIdx, value in enumerate(row, start=1):
                    slowSheet.cells(rowIdx, colIdx).value = value
            slowElapsed = time.perf_counter() - slowStart

            fastSheet = perfBook.sheets.add("fast")
            fastStart = time.perf_counter()
            fastSheet["A1"].value = bookCatalog
            fastElapsed = time.perf_counter() - fastStart

        # 행 수가 늘수록 ratio가 커진다. 작은 표에서는 측정값이 흔들릴 수 있으니 시간 대소를 단정하지 않는다.
        {"slow": round(slowElapsed, 3), "fast": round(fastElapsed, 3), "ratio": round(slowElapsed / max(fastElapsed, 1e-6), 1)}
      solution: |-
        # starterCode와 동일 - 도서 10권으로 비교, ratio 값이 5권일 때보다 커지는 것을 확인
        # 행 수가 N배가 되면 셀별 입력 시간도 거의 N배가 되지만, 일괄 입력은 거의 그대로
        # 따라서 ratio = slow/fast가 N배 가까이 커진다
        pass
      hints:
        - 행이 늘어날수록 셀별 방식의 시간은 거의 선형으로 증가하지만, 일괄 입력은 거의 그대로입니다.
        - ratio 값이 첫 실험보다 더 커지면 차이가 더 벌어졌다는 의미입니다. 도서 유통사의 5000권 정산이면 ratio가 100배 이상이 될 수 있습니다.
    check:
      noError: 두 입력 방식 모두 NameError나 IndexError 없이 실행되어야 합니다.
      resultCheck: 두 시트의 readback이 정규화 후 원본 bookCatalog와 같아야 하고, ratio 값으로 일괄 입력이 더 빠른 경향을 확인합니다.

  - id: expand-table
    title: 3단계. expand로 카탈로그 영역 자동 인식
    structuredPrimary: true
    subtitle: 도서 수가 매번 달라도 같은 코드
    goal: 입력한 카탈로그의 시작 셀에서 expand("table")로 끝 셀까지 자동 확장된 Range를 얻어, 도서 권수를 외우지 않고도 전체를 읽는다.
    why: 도서 카탈로그는 매주 신간이 추가되고 절판본이 빠진다. expand("table")는 빈 행/빈 열을 만나기 직전까지 자동 확장해 "표 영역 전체"를 잡아주므로 코드를 일반화할 수 있다.
    explanation: |-
      sheet["A1"].expand("table")는 A1을 시작으로 오른쪽과 아래로 빈 셀을 만나기 직전까지 자동 확장된 Range를 돌려줍니다. 카탈로그가 5권이든 5000권이든 같은 코드로 처리됩니다.
      "down"으로 세로만, "right"로 가로만 확장할 수도 있습니다. 카탈로그처럼 정사각 표 형태에서는 "table"이 가장 자주 쓰입니다.
      expand는 빈 행 또는 빈 열을 경계로 멈추므로, 여러 카탈로그를 한 시트에 빈 줄로 구분해 두면 각 카탈로그를 개별적으로 잡을 수 있습니다.
    tips:
      - expand로 잡은 Range는 일반 Range와 동일하게 동작합니다. .value로 list-of-lists를 읽을 수 있습니다.
      - "표 사이를 빈 행으로 구분하면 expand로 각 표를 개별적으로 잡을 수 있습니다."
      - last_cell.row와 last_cell.column으로 표의 끝 위치를 알 수 있습니다. 신간 append에 쓰입니다.
    snippet: |-
      import xlwings as xw

      def asCells(table):
          # Excel은 숫자를 double로 저장하므로 ISBN 문자열도 숫자처럼 읽혀 22000이 22000.0으로 돌아온다.
          # 정수형 실수는 정수로 되돌리고 모든 셀을 문자열로 정규화해 round-trip 값이 그대로 살아 있는지 비교한다.
          def cell(value):
              if isinstance(value, float) and value.is_integer():
                  value = int(value)
              return str(value)
          return [[cell(value) for value in row] for row in table]

      bookHeader = ["isbn", "title", "author", "price"]
      bookRows = [
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],
          ["9788954682152", "역행자", "자청", 19800],
      ]
      bookCatalog = [bookHeader] + bookRows

      with xw.App(visible=False) as expandApp:
          expandBook = expandApp.books.add()
          expandSheet = expandBook.sheets.active
          expandSheet.name = "books"
          expandSheet["A1"].value = bookCatalog
          expandedRange = expandSheet["A1"].expand("table")
          expandedAddress = expandedRange.address
          expandedValues = expandedRange.value
          lastRow = expandedRange.last_cell.row
          lastCol = expandedRange.last_cell.column

      assert expandedAddress.endswith("$D$6")
      assert asCells(expandedValues) == asCells(bookCatalog)
      assert (lastRow, lastCol) == (6, 4)
      {"address": expandedAddress, "lastCell": (lastRow, lastCol), "bookCount": len(expandedValues) - 1}
    exercise:
      prompt: bookRows를 3권으로 줄이고, expand로 잡은 영역의 행 수가 헤더 포함 4가 되는지 확인하세요. 같은 코드가 권수와 무관하게 동작하는 것을 직접 보세요.
      starterCode: |-
        import xlwings as xw

        def asCells(table):
            def cell(value):
                if isinstance(value, float) and value.is_integer():
                    value = int(value)
                return str(value)
            return [[cell(value) for value in row] for row in table]

        bookHeader = ["isbn", "title", "author", "price"]
        bookRows = [
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
        ]
        bookCatalog = [bookHeader] + bookRows

        with xw.App(visible=False) as expandApp:
            expandBook = expandApp.books.add()
            expandSheet = expandBook.sheets.active
            expandSheet.name = "books"
            expandSheet["A1"].value = bookCatalog
            expandedRange = expandSheet["A1"].expand("table")
            expandedValues = expandedRange.value
            rowCount = len(expandedValues)

        assert rowCount == ___
        assert asCells(expandedValues) == asCells(bookCatalog)
        rowCount
      solution: |-
        import xlwings as xw

        def asCells(table):
            def cell(value):
                if isinstance(value, float) and value.is_integer():
                    value = int(value)
                return str(value)
            return [[cell(value) for value in row] for row in table]

        bookHeader = ["isbn", "title", "author", "price"]
        bookRows = [
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],
        ]
        bookCatalog = [bookHeader] + bookRows

        with xw.App(visible=False) as expandApp:
            expandBook = expandApp.books.add()
            expandSheet = expandBook.sheets.active
            expandSheet.name = "books"
            expandSheet["A1"].value = bookCatalog
            expandedRange = expandSheet["A1"].expand("table")
            expandedValues = expandedRange.value
            rowCount = len(expandedValues)

        assert rowCount == 4
        assert asCells(expandedValues) == asCells(bookCatalog)
        rowCount
      hints:
        - 도서 3권 + 헤더 1줄 = 총 4행입니다.
        - expand("table")이 빈 행을 만날 때까지 확장하므로 도서 권수에 자동으로 맞춰집니다.
    check:
      noError: expand 호출과 last_cell 접근이 AttributeError 없이 끝나야 합니다.
      resultCheck: expand로 읽은 값이 원본 카탈로그와 같고, 행 수가 권수+1과 일치해야 합니다.

  - id: practice
    title: 4단계. 실습
    subtitle: 도서관 입고 자동화
    blocks:
      - type: text
        content: |-
          이번 두 미션은 도서관 신간 입고 자동화 시나리오를 다룹니다. 한 권씩 추가하는 append 패턴과 한 번에 여러 권을 입력하는 bulk 패턴을 비교합니다.
      - type: tip
        content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되어 있으므로 import문은 생략해도 됩니다.
      - type: expansion
        title: "미션1: 도서관 신간 카탈로그 생성 + round-trip"
        blocks:
          - type: code
            title: 카탈로그 데이터와 저장 경로
            content: |-
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              libraryHeader = ["isbn", "title", "category", "copies"]
              libraryRows = [
                  ["9788932473901", "달러구트 꿈 백화점", "소설", 5],
                  ["9788966262649", "프로그래머의 뇌", "IT", 3],
                  ["9791168473690", "아주 작은 습관의 힘", "자기계발", 8],
                  ["9788937462788", "인간 실격", "고전", 4],
              ]
              libraryCatalog = [libraryHeader] + libraryRows
              libraryTemp = TemporaryDirectory()
              libraryPath = Path(libraryTemp.name) / "library_catalog.xlsx"
              libraryCatalog
          - type: code
            title: 백그라운드 Excel에 한 번에 쓰고 저장
            content: |-
              with xw.App(visible=False) as libraryWriteApp:
                  libraryBook = libraryWriteApp.books.add()
                  librarySheet = libraryBook.sheets.active
                  librarySheet.name = "catalog"
                  librarySheet["A1"].value = libraryCatalog
                  libraryBook.save(str(libraryPath))
              libraryPath.exists()
          - type: code
            title: 다시 열어 expand로 영역을 자동 인식
            content: |-
              with xw.App(visible=False) as libraryReadApp:
                  libraryReadBook = libraryReadApp.books.open(str(libraryPath))
                  libraryReadSheet = libraryReadBook.sheets["catalog"]
                  libraryReadRange = libraryReadSheet["A1"].expand("table")
                  libraryReadValues = libraryReadRange.value
                  libraryReadBook.close()

              assert len(libraryReadValues) == len(libraryCatalog)
              assert libraryReadValues[0] == libraryHeader
              libraryReadValues
      - type: expansion
        title: "미션2: 일별 신간 한 권씩 append (last_cell 활용)"
        blocks:
          - type: code
            title: 초기 카탈로그 입력
            content: |-
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              dailyHeader = ["arrivedAt", "isbn", "title", "copies"]
              dailyInitial = [
                  ["2026-05-26", "9788932473901", "달러구트 꿈 백화점", 5],
                  ["2026-05-26", "9788966262649", "프로그래머의 뇌", 3],
              ]
              dailyCatalog = [dailyHeader] + dailyInitial
              dailyTemp = TemporaryDirectory()
              dailyPath = Path(dailyTemp.name) / "daily_arrival.xlsx"

              with xw.App(visible=False) as dailyInitApp:
                  dailyBook = dailyInitApp.books.add()
                  dailySheet = dailyBook.sheets.active
                  dailySheet.name = "arrivals"
                  dailySheet["A1"].value = dailyCatalog
                  dailyBook.save(str(dailyPath))
              dailyPath.exists()
          - type: code
            title: 새 신간 한 줄 append (expand로 끝 행 찾기)
            content: |-
              newArrival = ["2026-05-27", "9791168473690", "아주 작은 습관의 힘", 8]
              with xw.App(visible=False) as dailyAppendApp:
                  dailyAppendBook = dailyAppendApp.books.open(str(dailyPath))
                  dailyAppendSheet = dailyAppendBook.sheets["arrivals"]
                  existingRange = dailyAppendSheet["A1"].expand("table")
                  nextRowIndex = existingRange.last_cell.row + 1
                  dailyAppendSheet[f"A{nextRowIndex}:D{nextRowIndex}"].value = newArrival
                  dailyAppendBook.save()
                  dailyAppendBook.close()
              {"newArrival": newArrival, "nextRowIndex": nextRowIndex}
          - type: code
            title: round-trip으로 추가된 신간이 들어가 있는지 확인
            content: |-
              with xw.App(visible=False) as dailyVerifyApp:
                  dailyVerifyBook = dailyVerifyApp.books.open(str(dailyPath))
                  dailyVerifySheet = dailyVerifyBook.sheets["arrivals"]
                  verifiedTable = dailyVerifySheet["A1"].expand("table").value
                  dailyVerifyBook.close()

              from datetime import date, datetime

              def asCell(value):
                  if isinstance(value, float) and value.is_integer():
                      return str(int(value))
                  if isinstance(value, (datetime, date)):
                      return value.isoformat()[:10]
                  return str(value)

              def asRow(row):
                  return [asCell(value) for value in row]

              assert asRow(verifiedTable[-1]) == asRow(newArrival)
              assert len(verifiedTable) == len(dailyCatalog) + 1
              verifiedTable

  - id: summary
    title: 정리
    subtitle: 2D 입력과 자동 영역 인식
    blocks:
      - type: text
        content: |-
          이번 레슨에서 셀별 입력과 2D 일괄 입력의 성능 차이를 도서 카탈로그로 직접 측정했고, expand("table")로 도서 권수가 매번 달라도 같은 코드가 동작하는 일반화된 자동화를 만들었습니다.
          이 두 패턴은 xlwings 실무 자동화의 거의 모든 코드에서 반복됩니다. 다음 레슨에서는 sheets 컬렉션과 expand를 결합해 여러 시트가 있는 워크북을 탐색합니다.
    goal: 2D 일괄 입력 + expand("table") 패턴을 한 번 완성한 채로 다음 레슨에 진입한다.
    why: 두 패턴이 자리잡으면 이후 모든 레슨의 데이터 입출력이 단순해진다.
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
  - id: xlwings_02-range-write-shape-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - prepare-catalog
    - summary
    title: 가격표 range 쓰기의 행렬 shape 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: ragged row·빈 header·범위 크기 불일치를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - range assignment 전에 2D matrix의 직사각형 shape를 계산하세요.
    - Excel의 1-based cell origin을 계약에 포함하세요.
    exercise:
      prompt: audit_range_write(start_row, start_col, values, target_rows, target_cols)를 완성하세요.
      starterCode: |-
        def audit_range_write(start_row, start_col, values, target_rows, target_cols):
            raise NotImplementedError
      solution: |
        def audit_range_write(start_row, start_col, values, target_rows, target_cols):
            widths = [len(row) for row in values]
            rows = len(values)
            cols = widths[0] if values and len(set(widths)) == 1 else 0
            failures = []
            if start_row < 1 or start_col < 1:
                failures.append("origin")
            if not values or len(set(widths)) != 1:
                failures.append("shape")
            if rows != target_rows or cols != target_cols:
                failures.append("target")
            if values and any(not str(value).strip() for value in values[0]):
                failures.append("headers")
            return {"accepted": not failures, "failures": failures, "sourceShape": [rows, cols], "targetShape": [target_rows, target_cols]}
      hints: *id001
    check:
      id: python.xlwings.xlwings_02.range-write-shape.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_02.range-write-shape.mastery.behavior.v1.fixture
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
        entry: audit_range_write
        cases:
        - id: accepts-exact-matrix
          arguments:
          - value: 1
          - value: 1
          - value:
            - - 상품
              - 가격
            - - A
              - 100
          - value: 2
          - value: 2
          expectedReturn:
            accepted: true
            failures: []
            sourceShape:
            - 2
            - 2
            targetShape:
            - 2
            - 2
        - id: reports-ragged-target
          arguments:
          - value: 1
          - value: 1
          - value:
            - - 상품
              - 가격
            - - A
          - value: 2
          - value: 2
          expectedReturn:
            accepted: false
            failures:
            - shape
            - target
            sourceShape:
            - 2
            - 0
            targetShape:
            - 2
            - 2
        - id: reports-origin-and-header
          arguments:
          - value: 0
          - value: 1
          - value:
            - - ''
              - 가격
          - value: 1
          - value: 2
          expectedReturn:
            accepted: false
            failures:
            - origin
            - headers
            sourceShape:
            - 1
            - 2
            targetShape:
            - 1
            - 2
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: xlwings_02-price-update-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_02-range-write-shape-mastery
    title: 가격표 일괄 입력 결과 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 상품 ID 기준으로 누락·추가·가격 차이를 계산한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - row index가 아니라 SKU identity로 대조하세요.
    - 금액 비교에는 명시적인 허용 오차를 사용하세요.
    exercise:
      prompt: reconcile_prices(expected, observed, tolerance=0.01)를 완성하세요.
      starterCode: |-
        def reconcile_prices(expected, observed, tolerance=0.01):
            raise NotImplementedError
      solution: |
        def reconcile_prices(expected, observed, tolerance=0.01):
            exp = {item["sku"]: item["price"] for item in expected}
            obs = {item["sku"]: item["price"] for item in observed}
            missing = sorted(set(exp) - set(obs))
            extra = sorted(set(obs) - set(exp))
            changed = sorted(key for key in set(exp) & set(obs) if abs(exp[key] - obs[key]) > tolerance)
            return {"passed": not missing and not extra and not changed, "missing": missing, "extra": extra, "changed": changed}
      hints: *id002
    check:
      id: python.xlwings.xlwings_02.price-update-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_02.price-update-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_prices
        cases:
        - id: accepts-prices
          arguments:
          - value:
            - sku: A
              price: 10
          - value:
            - sku: A
              price: 10.005
          - value: 0.01
          expectedReturn:
            passed: true
            missing: []
            extra: []
            changed: []
        - id: reports-price-delta
          arguments:
          - value:
            - sku: A
              price: 10
          - value:
            - sku: A
              price: 12
          - value: 0.01
          expectedReturn:
            passed: false
            missing: []
            extra: []
            changed:
            - A
        - id: reports-membership
          arguments:
          - value:
            - sku: A
              price: 10
          - value:
            - sku: B
              price: 10
          - value: 0.01
          expectedReturn:
            passed: false
            missing:
            - A
            extra:
            - B
            changed: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: xlwings_02-range-write-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_02-price-update-reconciliation-transfer
    title: Excel range 쓰기 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: shape·identity·재개방 대조를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 Excel 자동화 판단을 작은 함수로 즉시 검증하세요.
    - Local에서는 실제 Excel 프로세스와 workbook artifact 증거를 별도로 남기세요.
    exercise:
      prompt: choose_range_write_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_range_write_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_range_write_evidence(stage):
            table = {'shape': {'action': 'validate rectangular 2D values', 'evidence': 'source and target shape', 'risk': 'shifted cells'}, 'identity': {'action': 'key rows by stable business id', 'evidence': 'SKU manifest', 'risk': 'wrong row updated'}, 'reopen': {'action': 'read values from saved workbook', 'evidence': 'business reconciliation', 'risk': 'write call without persisted values'}}
            if stage not in table:
                raise ValueError('unknown stage')
            return table[stage]
      hints: *id003
    check:
      id: python.xlwings.xlwings_02.range-write-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_02.range-write-recall.retrieval.behavior.v1.fixture
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
        entry: choose_range_write_evidence
        cases:
        - id: recalls-shape
          arguments:
          - value: shape
          expectedReturn:
            action: validate rectangular 2D values
            evidence: source and target shape
            risk: shifted cells
        - id: recalls-identity
          arguments:
          - value: identity
          expectedReturn:
            action: key rows by stable business id
            evidence: SKU manifest
            risk: wrong row updated
        - id: recalls-reopen
          arguments:
          - value: reopen
          expectedReturn:
            action: read values from saved workbook
            evidence: business reconciliation
            risk: write call without persisted values
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};