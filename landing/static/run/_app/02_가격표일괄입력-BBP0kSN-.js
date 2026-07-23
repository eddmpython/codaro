var e=`meta:\r
  id: xlwings_02\r
  title: 도서 가격표 2D 일괄 입력\r
  order: 2\r
  category: xlwings\r
  badge: 입문\r
  difficulty: easy\r
  audience: 가로 한 줄 쓰기를 익힌 학습자, 다음으로 2D 표를 한 번에 입력하고 싶은 사람\r
  packages:\r
    - xlwings\r
  tags:\r
    - xlwings\r
    - Range2D\r
    - bulkWrite\r
    - expand\r
    - 성능비교\r
  seo:\r
    title: 도서 가격표 2D 입력 - xlwings로 표 데이터를 한 번에 쓰기\r
    description: 출판사의 도서 가격표를 셀별 vs 2D 일괄 두 방식으로 입력하고 성능 차이를 측정한다. expand로 표 영역을 자동 인식한다.\r
    keywords:\r
      - xlwings\r
      - Range\r
      - 2D\r
      - bulk\r
      - expand\r
intro:\r
  direction: 출판사의 도서 카탈로그(ISBN, 제목, 저자, 가격)를 한 번의 Range 대입으로 입력하고, expand("table")로 영역을 자동 인식한 뒤 round-trip 검증한다.\r
  benefits:\r
    - 출판사·서점·재고 시스템처럼 행 수가 매번 달라지는 표를 다루는 실무 패턴을 익힌다.\r
    - 셀 하나씩 쓰는 방식과 2D 리스트 일괄 입력의 성능 차이를 time.perf_counter로 직접 측정한다.\r
    - "sheet[\\"A1\\"].value = listOfLists 한 줄로 표 전체를 입력하는 가장 빠른 패턴을 익힌다."\r
    - "expand(\\"table\\")로 ISBN 1개부터 1000개까지 같은 코드로 처리되는 일반화된 자동화를 만든다."\r
  diagram:\r
    steps:\r
      - label: 1단계. 도서 카탈로그 2D 데이터 구성\r
        detail: 헤더(ISBN/제목/저자/가격)와 도서 5권을 list-of-lists로 잡는다.\r
      - label: 2단계. 셀별 vs 2D 일괄 성능 비교\r
        detail: 같은 카탈로그를 두 방식으로 입력해 소요 시간을 직접 비교한다.\r
      - label: 3단계. expand로 카탈로그 영역 자동 인식\r
        detail: ISBN 1권부터 카탈로그 끝까지를 expand("table")로 한 번에 잡는다.\r
      - label: 4단계. 실습\r
        detail: 도서관 신간 입고 + 일별 신규 도서 append 두 시나리오를 직접 만든다.\r
    runtime:\r
      - label: xlwings 패키지 확인\r
        detail: meta.packages의 xlwings가 import 가능해야 한다.\r
      - label: 카탈로그 크기 결정\r
        detail: 학습 단계에서는 5-10권이 적당하다. 1000권 이상은 일괄 입력 효과가 더 극적이다.\r
      - label: 결과 round-trip\r
        detail: TemporaryDirectory에 저장하고 새 App에서 expand로 다시 읽는다.\r
sections:\r
  - id: prepare-catalog\r
    title: 1단계. 도서 카탈로그 2D 데이터 구성\r
    structuredPrimary: true\r
    subtitle: list of lists\r
    goal: 출판사의 도서 카탈로그(헤더 + 도서 5권)를 list-of-lists로 만들어 자동화 입력 단위를 잡는다.\r
    why: 출판사·서점의 카탈로그는 매일 신간이 추가되는 가변 크기 데이터다. 헤더와 행의 구조를 코드로 잡아두면 검증 기준이 생긴다.\r
    explanation: |-\r
      xlwings의 Range.value는 2D 데이터를 list-of-lists로 주고받습니다. 첫 번째 리스트가 가장 위 행(헤더)이 되고, 각 내부 리스트가 가로 한 줄(도서 한 권)이 됩니다.\r
      이번 단계에서는 ISBN, 제목, 저자, 가격 4개 컬럼으로 구성된 도서 5권 카탈로그를 만듭니다. 실무에서는 출판사 ERP나 도서 유통 API에서 이 형태로 받게 됩니다.\r
      [헤더] + 데이터 패턴은 자동화에서 가장 자주 쓰이므로 익혀두세요. 나중에 신간이 추가되면 데이터 리스트에 한 줄 더 붙이기만 하면 됩니다.\r
    tips:\r
      - 헤더와 데이터를 합치는 [헤더] + 데이터 패턴은 자동화의 기본 어휘입니다.\r
      - 한 행의 컬럼 수가 모두 같아야 합니다. 다르면 xlwings가 None으로 채우므로 빈 셀이 생깁니다.\r
      - ISBN은 13자리 문자열로 다루세요. 9788000... 형태의 한국 도서 ISBN은 정수로 처리하면 앞자리 0이 사라질 수 있습니다.\r
    snippet: |-\r
      bookHeader = ["isbn", "title", "author", "price"]\r
      bookRows = [\r
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
          ["9788954682152", "역행자", "자청", 19800],\r
      ]\r
      bookCatalog = [bookHeader] + bookRows\r
\r
      assert len(bookCatalog) == 6\r
      assert all(len(row) == 4 for row in bookCatalog)\r
      bookCatalog\r
    exercise:\r
      prompt: 본인이 최근 읽었거나 사고 싶은 도서 한 권을 bookRows 마지막에 추가하고, 카탈로그 행 수와 컬럼 수가 모두 맞는지 검증하세요.\r
      starterCode: |-\r
        bookHeader = ["isbn", "title", "author", "price"]\r
        bookRows = [\r
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
            ["9788954682152", "역행자", "자청", 19800],\r
            ["___", "___", "___", ___],\r
        ]\r
        bookCatalog = [bookHeader] + bookRows\r
\r
        assert len(bookCatalog) == 7\r
        assert all(len(row) == 4 for row in bookCatalog)\r
        bookCatalog\r
      solution: |-\r
        bookHeader = ["isbn", "title", "author", "price"]\r
        bookRows = [\r
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
            ["9788954682152", "역행자", "자청", 19800],\r
            ["9788937437373", "이방인", "알베르 카뮈", 12000],\r
        ]\r
        bookCatalog = [bookHeader] + bookRows\r
\r
        assert len(bookCatalog) == 7\r
        assert all(len(row) == 4 for row in bookCatalog)\r
        bookCatalog\r
      hints:\r
        - ISBN은 13자리 문자열, 가격은 정수로 채우면 됩니다.\r
        - 헤더 1줄 + 도서 6권 = 카탈로그 7행이 됩니다.\r
    check:\r
      noError: bookHeader와 bookRows 정의가 IndexError 없이 끝나야 합니다.\r
      resultCheck: 카탈로그의 모든 행이 4컬럼을 가지고 헤더 포함 7행이 되어야 합니다.\r
\r
  - id: cell-vs-bulk\r
    title: 2단계. 셀별 vs 2D 일괄 성능 비교\r
    structuredPrimary: true\r
    subtitle: time.perf_counter로 차이 측정\r
    goal: 같은 도서 카탈로그를 셀 하나씩 쓰는 방식과 2D 리스트 일괄 쓰기 방식으로 입력하고 소요 시간을 비교한다.\r
    why: xlwings의 셀 R/W는 매번 Excel과 COM 통신하는 비용이 든다. 한 번의 Range 대입으로 모든 셀을 채우면 통신이 한 번으로 줄어 수십 배 빨라진다.\r
    explanation: |-\r
      xlwings에서 sheet["A1"].value = 1처럼 셀 하나씩 쓰면, 매번 COM(Windows) 또는 AppleScript(macOS) 호출이 발생합니다. 100개 셀을 쓰면 100번의 호출이 일어납니다.\r
      반면 sheet["A1"].value = [[...], [...], ...]처럼 2D 리스트를 한 번에 대입하면 통신은 단 한 번이고, xlwings가 내부에서 데이터를 한꺼번에 Excel에 전달합니다.\r
      학습 단계에서는 5권이라 차이가 미미할 수 있지만, 도서 유통사의 일일 5000권 정산처럼 행 수가 많아지면 셀별 입력이 분 단위, 일괄 입력이 초 단위가 됩니다. 처음부터 일괄 입력 습관을 굳히세요.\r
    tips:\r
      - time.perf_counter는 짧은 코드 블록의 소요 시간을 정확히 재는 표준 방법입니다(시스템 sleep 영향 없음).\r
      - 셀별 입력은 학습용으로만 보여줍니다. 실무 코드에는 절대 쓰지 마세요.\r
      - sheet.cells(row, col)는 1-base 인덱스입니다. Python의 0-base와 헷갈리지 마세요.\r
    snippet: |-\r
      import time\r
      import xlwings as xw\r
\r
      def asCells(table):\r
          # Excel은 숫자를 double로 저장하므로 ISBN 문자열도 숫자처럼 읽혀 22000이 22000.0으로 돌아온다.\r
          # 정수형 실수는 정수로 되돌리고 모든 셀을 문자열로 정규화해 round-trip 값이 그대로 살아 있는지 비교한다.\r
          def cell(value):\r
              if isinstance(value, float) and value.is_integer():\r
                  value = int(value)\r
              return str(value)\r
          return [[cell(value) for value in row] for row in table]\r
\r
      bookHeader = ["isbn", "title", "author", "price"]\r
      bookRows = [\r
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
          ["9788954682152", "역행자", "자청", 19800],\r
      ]\r
      bookCatalog = [bookHeader] + bookRows\r
\r
      with xw.App(visible=False) as perfApp:\r
          perfBook = perfApp.books.add()\r
          slowSheet = perfBook.sheets.active\r
          slowSheet.name = "slow"\r
          slowStart = time.perf_counter()\r
          for rowIdx, row in enumerate(bookCatalog, start=1):\r
              for colIdx, value in enumerate(row, start=1):\r
                  slowSheet.cells(rowIdx, colIdx).value = value\r
          slowElapsed = time.perf_counter() - slowStart\r
\r
          fastSheet = perfBook.sheets.add("fast")\r
          fastStart = time.perf_counter()\r
          fastSheet["A1"].value = bookCatalog\r
          fastElapsed = time.perf_counter() - fastStart\r
\r
          slowReadback = slowSheet["A1:D6"].value\r
          fastReadback = fastSheet["A1:D6"].value\r
\r
      assert asCells(slowReadback) == asCells(fastReadback) == asCells(bookCatalog)\r
      # 일괄 입력은 행 수가 많을수록 셀별 입력보다 극적으로 빨라진다(아래 ratio로 확인).\r
      # 5권 정도의 작은 표에서는 COM 워밍업 노이즈로 측정값이 흔들릴 수 있어 시간 대소를 단정하지 않는다.\r
      {"slow": round(slowElapsed, 3), "fast": round(fastElapsed, 3), "ratio": round(slowElapsed / max(fastElapsed, 1e-6), 1)}\r
    exercise:\r
      prompt: bookRows를 두 배(10권)로 늘려서 같은 비교를 다시 실행하고, ratio 값이 어떻게 바뀌는지 보세요. 행 수가 늘수록 ratio가 커집니다.\r
      starterCode: |-\r
        import time\r
        import xlwings as xw\r
\r
        bookHeader = ["isbn", "title", "author", "price"]\r
        bookRows = [\r
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
            ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
            ["9788954682152", "역행자", "자청", 19800],\r
            ["9788937437373", "이방인", "알베르 카뮈", 12000],\r
            ["9788932020259", "데미안", "헤르만 헤세", 11000],\r
            ["9788954429245", "1984", "조지 오웰", 13500],\r
            ["9788937462788", "인간 실격", "다자이 오사무", 9800],\r
            ["9788937462801", "노인과 바다", "어니스트 헤밍웨이", 11500],\r
        ]\r
        bookCatalog = [bookHeader] + bookRows\r
\r
        with xw.App(visible=False) as perfApp:\r
            perfBook = perfApp.books.add()\r
            slowSheet = perfBook.sheets.active\r
            slowSheet.name = "slow"\r
            slowStart = time.perf_counter()\r
            for rowIdx, row in enumerate(bookCatalog, start=1):\r
                for colIdx, value in enumerate(row, start=1):\r
                    slowSheet.cells(rowIdx, colIdx).value = value\r
            slowElapsed = time.perf_counter() - slowStart\r
\r
            fastSheet = perfBook.sheets.add("fast")\r
            fastStart = time.perf_counter()\r
            fastSheet["A1"].value = bookCatalog\r
            fastElapsed = time.perf_counter() - fastStart\r
\r
        # 행 수가 늘수록 ratio가 커진다. 작은 표에서는 측정값이 흔들릴 수 있으니 시간 대소를 단정하지 않는다.\r
        {"slow": round(slowElapsed, 3), "fast": round(fastElapsed, 3), "ratio": round(slowElapsed / max(fastElapsed, 1e-6), 1)}\r
      solution: |-\r
        # starterCode와 동일 - 도서 10권으로 비교, ratio 값이 5권일 때보다 커지는 것을 확인\r
        # 행 수가 N배가 되면 셀별 입력 시간도 거의 N배가 되지만, 일괄 입력은 거의 그대로\r
        # 따라서 ratio = slow/fast가 N배 가까이 커진다\r
        pass\r
      hints:\r
        - 행이 늘어날수록 셀별 방식의 시간은 거의 선형으로 증가하지만, 일괄 입력은 거의 그대로입니다.\r
        - ratio 값이 첫 실험보다 더 커지면 차이가 더 벌어졌다는 의미입니다. 도서 유통사의 5000권 정산이면 ratio가 100배 이상이 될 수 있습니다.\r
    check:\r
      noError: 두 입력 방식 모두 NameError나 IndexError 없이 실행되어야 합니다.\r
      resultCheck: 두 시트의 readback이 정규화 후 원본 bookCatalog와 같아야 하고, ratio 값으로 일괄 입력이 더 빠른 경향을 확인합니다.\r
\r
  - id: expand-table\r
    title: 3단계. expand로 카탈로그 영역 자동 인식\r
    structuredPrimary: true\r
    subtitle: 도서 수가 매번 달라도 같은 코드\r
    goal: 입력한 카탈로그의 시작 셀에서 expand("table")로 끝 셀까지 자동 확장된 Range를 얻어, 도서 권수를 외우지 않고도 전체를 읽는다.\r
    why: 도서 카탈로그는 매주 신간이 추가되고 절판본이 빠진다. expand("table")는 빈 행/빈 열을 만나기 직전까지 자동 확장해 "표 영역 전체"를 잡아주므로 코드를 일반화할 수 있다.\r
    explanation: |-\r
      sheet["A1"].expand("table")는 A1을 시작으로 오른쪽과 아래로 빈 셀을 만나기 직전까지 자동 확장된 Range를 돌려줍니다. 카탈로그가 5권이든 5000권이든 같은 코드로 처리됩니다.\r
      "down"으로 세로만, "right"로 가로만 확장할 수도 있습니다. 카탈로그처럼 정사각 표 형태에서는 "table"이 가장 자주 쓰입니다.\r
      expand는 빈 행 또는 빈 열을 경계로 멈추므로, 여러 카탈로그를 한 시트에 빈 줄로 구분해 두면 각 카탈로그를 개별적으로 잡을 수 있습니다.\r
    tips:\r
      - expand로 잡은 Range는 일반 Range와 동일하게 동작합니다. .value로 list-of-lists를 읽을 수 있습니다.\r
      - "표 사이를 빈 행으로 구분하면 expand로 각 표를 개별적으로 잡을 수 있습니다."\r
      - last_cell.row와 last_cell.column으로 표의 끝 위치를 알 수 있습니다. 신간 append에 쓰입니다.\r
    snippet: |-\r
      import xlwings as xw\r
\r
      def asCells(table):\r
          # Excel은 숫자를 double로 저장하므로 ISBN 문자열도 숫자처럼 읽혀 22000이 22000.0으로 돌아온다.\r
          # 정수형 실수는 정수로 되돌리고 모든 셀을 문자열로 정규화해 round-trip 값이 그대로 살아 있는지 비교한다.\r
          def cell(value):\r
              if isinstance(value, float) and value.is_integer():\r
                  value = int(value)\r
              return str(value)\r
          return [[cell(value) for value in row] for row in table]\r
\r
      bookHeader = ["isbn", "title", "author", "price"]\r
      bookRows = [\r
          ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
          ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
          ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
          ["9791191891027", "퓨처 셀프", "벤저민 하디", 18500],\r
          ["9788954682152", "역행자", "자청", 19800],\r
      ]\r
      bookCatalog = [bookHeader] + bookRows\r
\r
      with xw.App(visible=False) as expandApp:\r
          expandBook = expandApp.books.add()\r
          expandSheet = expandBook.sheets.active\r
          expandSheet.name = "books"\r
          expandSheet["A1"].value = bookCatalog\r
          expandedRange = expandSheet["A1"].expand("table")\r
          expandedAddress = expandedRange.address\r
          expandedValues = expandedRange.value\r
          lastRow = expandedRange.last_cell.row\r
          lastCol = expandedRange.last_cell.column\r
\r
      assert expandedAddress.endswith("$D$6")\r
      assert asCells(expandedValues) == asCells(bookCatalog)\r
      assert (lastRow, lastCol) == (6, 4)\r
      {"address": expandedAddress, "lastCell": (lastRow, lastCol), "bookCount": len(expandedValues) - 1}\r
    exercise:\r
      prompt: bookRows를 3권으로 줄이고, expand로 잡은 영역의 행 수가 헤더 포함 4가 되는지 확인하세요. 같은 코드가 권수와 무관하게 동작하는 것을 직접 보세요.\r
      starterCode: |-\r
        import xlwings as xw\r
\r
        def asCells(table):\r
            def cell(value):\r
                if isinstance(value, float) and value.is_integer():\r
                    value = int(value)\r
                return str(value)\r
            return [[cell(value) for value in row] for row in table]\r
\r
        bookHeader = ["isbn", "title", "author", "price"]\r
        bookRows = [\r
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
        ]\r
        bookCatalog = [bookHeader] + bookRows\r
\r
        with xw.App(visible=False) as expandApp:\r
            expandBook = expandApp.books.add()\r
            expandSheet = expandBook.sheets.active\r
            expandSheet.name = "books"\r
            expandSheet["A1"].value = bookCatalog\r
            expandedRange = expandSheet["A1"].expand("table")\r
            expandedValues = expandedRange.value\r
            rowCount = len(expandedValues)\r
\r
        assert rowCount == ___\r
        assert asCells(expandedValues) == asCells(bookCatalog)\r
        rowCount\r
      solution: |-\r
        import xlwings as xw\r
\r
        def asCells(table):\r
            def cell(value):\r
                if isinstance(value, float) and value.is_integer():\r
                    value = int(value)\r
                return str(value)\r
            return [[cell(value) for value in row] for row in table]\r
\r
        bookHeader = ["isbn", "title", "author", "price"]\r
        bookRows = [\r
            ["9788966262649", "프로그래머의 뇌", "펠리에나 헤르마스", 22000],\r
            ["9791168473690", "아주 작은 습관의 힘", "제임스 클리어", 16800],\r
            ["9788932473901", "달러구트 꿈 백화점", "이미예", 13800],\r
        ]\r
        bookCatalog = [bookHeader] + bookRows\r
\r
        with xw.App(visible=False) as expandApp:\r
            expandBook = expandApp.books.add()\r
            expandSheet = expandBook.sheets.active\r
            expandSheet.name = "books"\r
            expandSheet["A1"].value = bookCatalog\r
            expandedRange = expandSheet["A1"].expand("table")\r
            expandedValues = expandedRange.value\r
            rowCount = len(expandedValues)\r
\r
        assert rowCount == 4\r
        assert asCells(expandedValues) == asCells(bookCatalog)\r
        rowCount\r
      hints:\r
        - 도서 3권 + 헤더 1줄 = 총 4행입니다.\r
        - expand("table")이 빈 행을 만날 때까지 확장하므로 도서 권수에 자동으로 맞춰집니다.\r
    check:\r
      noError: expand 호출과 last_cell 접근이 AttributeError 없이 끝나야 합니다.\r
      resultCheck: expand로 읽은 값이 원본 카탈로그와 같고, 행 수가 권수+1과 일치해야 합니다.\r
\r
  - id: practice\r
    title: 4단계. 실습\r
    subtitle: 도서관 입고 자동화\r
    blocks:\r
      - type: text\r
        content: |-\r
          이번 두 미션은 도서관 신간 입고 자동화 시나리오를 다룹니다. 한 권씩 추가하는 append 패턴과 한 번에 여러 권을 입력하는 bulk 패턴을 비교합니다.\r
      - type: tip\r
        content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되어 있으므로 import문은 생략해도 됩니다.\r
      - type: expansion\r
        title: "미션1: 도서관 신간 카탈로그 생성 + round-trip"\r
        blocks:\r
          - type: code\r
            title: 카탈로그 데이터와 저장 경로\r
            content: |-\r
              import xlwings as xw\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
\r
              libraryHeader = ["isbn", "title", "category", "copies"]\r
              libraryRows = [\r
                  ["9788932473901", "달러구트 꿈 백화점", "소설", 5],\r
                  ["9788966262649", "프로그래머의 뇌", "IT", 3],\r
                  ["9791168473690", "아주 작은 습관의 힘", "자기계발", 8],\r
                  ["9788937462788", "인간 실격", "고전", 4],\r
              ]\r
              libraryCatalog = [libraryHeader] + libraryRows\r
              libraryTemp = TemporaryDirectory()\r
              libraryPath = Path(libraryTemp.name) / "library_catalog.xlsx"\r
              libraryCatalog\r
          - type: code\r
            title: 백그라운드 Excel에 한 번에 쓰고 저장\r
            content: |-\r
              with xw.App(visible=False) as libraryWriteApp:\r
                  libraryBook = libraryWriteApp.books.add()\r
                  librarySheet = libraryBook.sheets.active\r
                  librarySheet.name = "catalog"\r
                  librarySheet["A1"].value = libraryCatalog\r
                  libraryBook.save(str(libraryPath))\r
              libraryPath.exists()\r
          - type: code\r
            title: 다시 열어 expand로 영역을 자동 인식\r
            content: |-\r
              with xw.App(visible=False) as libraryReadApp:\r
                  libraryReadBook = libraryReadApp.books.open(str(libraryPath))\r
                  libraryReadSheet = libraryReadBook.sheets["catalog"]\r
                  libraryReadRange = libraryReadSheet["A1"].expand("table")\r
                  libraryReadValues = libraryReadRange.value\r
                  libraryReadBook.close()\r
\r
              assert len(libraryReadValues) == len(libraryCatalog)\r
              assert libraryReadValues[0] == libraryHeader\r
              libraryReadValues\r
      - type: expansion\r
        title: "미션2: 일별 신간 한 권씩 append (last_cell 활용)"\r
        blocks:\r
          - type: code\r
            title: 초기 카탈로그 입력\r
            content: |-\r
              import xlwings as xw\r
              from pathlib import Path\r
              from tempfile import TemporaryDirectory\r
\r
              dailyHeader = ["arrivedAt", "isbn", "title", "copies"]\r
              dailyInitial = [\r
                  ["2026-05-26", "9788932473901", "달러구트 꿈 백화점", 5],\r
                  ["2026-05-26", "9788966262649", "프로그래머의 뇌", 3],\r
              ]\r
              dailyCatalog = [dailyHeader] + dailyInitial\r
              dailyTemp = TemporaryDirectory()\r
              dailyPath = Path(dailyTemp.name) / "daily_arrival.xlsx"\r
\r
              with xw.App(visible=False) as dailyInitApp:\r
                  dailyBook = dailyInitApp.books.add()\r
                  dailySheet = dailyBook.sheets.active\r
                  dailySheet.name = "arrivals"\r
                  dailySheet["A1"].value = dailyCatalog\r
                  dailyBook.save(str(dailyPath))\r
              dailyPath.exists()\r
          - type: code\r
            title: 새 신간 한 줄 append (expand로 끝 행 찾기)\r
            content: |-\r
              newArrival = ["2026-05-27", "9791168473690", "아주 작은 습관의 힘", 8]\r
              with xw.App(visible=False) as dailyAppendApp:\r
                  dailyAppendBook = dailyAppendApp.books.open(str(dailyPath))\r
                  dailyAppendSheet = dailyAppendBook.sheets["arrivals"]\r
                  existingRange = dailyAppendSheet["A1"].expand("table")\r
                  nextRowIndex = existingRange.last_cell.row + 1\r
                  dailyAppendSheet[f"A{nextRowIndex}:D{nextRowIndex}"].value = newArrival\r
                  dailyAppendBook.save()\r
                  dailyAppendBook.close()\r
              {"newArrival": newArrival, "nextRowIndex": nextRowIndex}\r
          - type: code\r
            title: round-trip으로 추가된 신간이 들어가 있는지 확인\r
            content: |-\r
              with xw.App(visible=False) as dailyVerifyApp:\r
                  dailyVerifyBook = dailyVerifyApp.books.open(str(dailyPath))\r
                  dailyVerifySheet = dailyVerifyBook.sheets["arrivals"]\r
                  verifiedTable = dailyVerifySheet["A1"].expand("table").value\r
                  dailyVerifyBook.close()\r
\r
              from datetime import date, datetime\r
\r
              def asCell(value):\r
                  if isinstance(value, float) and value.is_integer():\r
                      return str(int(value))\r
                  if isinstance(value, (datetime, date)):\r
                      return value.isoformat()[:10]\r
                  return str(value)\r
\r
              def asRow(row):\r
                  return [asCell(value) for value in row]\r
\r
              assert asRow(verifiedTable[-1]) == asRow(newArrival)\r
              assert len(verifiedTable) == len(dailyCatalog) + 1\r
              verifiedTable\r
\r
  - id: summary\r
    title: 정리\r
    subtitle: 2D 입력과 자동 영역 인식\r
    blocks:\r
      - type: text\r
        content: |-\r
          이번 레슨에서 셀별 입력과 2D 일괄 입력의 성능 차이를 도서 카탈로그로 직접 측정했고, expand("table")로 도서 권수가 매번 달라도 같은 코드가 동작하는 일반화된 자동화를 만들었습니다.\r
          이 두 패턴은 xlwings 실무 자동화의 거의 모든 코드에서 반복됩니다. 다음 레슨에서는 sheets 컬렉션과 expand를 결합해 여러 시트가 있는 워크북을 탐색합니다.\r
    goal: 2D 일괄 입력 + expand("table") 패턴을 한 번 완성한 채로 다음 레슨에 진입한다.\r
    why: 두 패턴이 자리잡으면 이후 모든 레슨의 데이터 입출력이 단순해진다.\r
`;export{e as default};