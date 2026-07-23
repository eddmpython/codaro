var e=`meta:\r
  id: openpyxl_02\r
  title: 셀 읽기와 쓰기\r
  order: 2\r
  category: openpyxl\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - 셀\r
  - append\r
  - 좌표변환\r
  - 검증\r
  seo:\r
    title: openpyxl 셀 읽기와 쓰기 - cell·['A1']·append 정확하게 다루기\r
    description: 셀 좌표(A1·R1C1) 두 표기법, ws.cell(row, column, value), ws.append, get_column_letter 등 셀 접근의 모든 경로와 함정을 정리합니다.\r
    keywords:\r
    - openpyxl cell\r
    - get_column_letter\r
    - column_index_from_string\r
    - ws.append\r
intro:\r
  direction: 시트 안의 셀을 좌표 두 방식으로 읽고 쓰며, append와 명시적 좌표 지정의 장단점을 직접 비교합니다.\r
  benefits:\r
  - "ws['A1']과 ws.cell(row=1, column=1)이 같은 셀임을 손에 익혀 좌표 혼동에서 벗어납니다."\r
  - 컬럼 문자(A,B,...,AA)와 정수 인덱스를 자유롭게 오갑니다.\r
  - "사람이 만든 dict 데이터를 정확한 셀 좌표에 자동으로 채웁니다."\r
  diagram:\r
    steps:\r
    - label: 두 좌표 방식\r
      detail: "ws['A1']과 ws.cell(row, column)을 동시에 다룬다."\r
    - label: append 일괄 입력\r
      detail: 리스트를 한 줄씩 끝에 추가한다.\r
    - label: 좌표 변환\r
      detail: 컬럼 문자/정수 변환으로 동적 좌표를 만든다.\r
    - label: 크기 자동 확인\r
      detail: max_row/max_column으로 의도한 표 크기인지 즉시 비교한다.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: openpyxl만 있으면 셀 좌표 양식 모두 동작한다. uv run python으로 즉시 실행.\r
    - label: TemporaryDirectory 재오픈 검증\r
      detail: 작성한 .xlsx를 load_workbook으로 다시 열어 셀 값과 행 수를 assert로 확인한다.\r
sections:\r
- id: step1_two_coords\r
  title: 1단계. 두 가지 좌표 표기\r
  structuredPrimary: true\r
  subtitle: "ws['A1']과 ws.cell(row=1, column=1)"\r
  goal: 같은 셀을 두 가지 방식으로 가리킬 수 있다는 것을 직접 확인한다.\r
  why: 좌표 표기를 혼동하면 "분명 A1에 썼는데 안 보인다"는 흔한 버그가 생깁니다. 두 방식이 같다는 사실을 코드로 굳혀 둡니다.\r
  explanation: |-\r
    \`ws['A1']\`은 사람이 보는 좌표 그대로의 접근입니다. \`ws.cell(row=1, column=1)\`은 정수 인덱스 접근으로, row와 column 모두 1부터 시작합니다(0이 아닙니다). 같은 셀을 두 방식으로 잡아 보면 두 객체는 같은 메모리 셀을 가리킵니다.\r
  tips:\r
  - openpyxl의 행/열 인덱스는 0이 아닌 1부터 시작합니다. 파이썬 리스트와 다르므로 가장 자주 틀리는 지점입니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet["A1"] = "name"\r
    cellByLetter = sheet["A1"]\r
    cellByIndex = sheet.cell(row=1, column=1)\r
    cellByLetter.value, cellByIndex.value, cellByLetter is cellByIndex\r
  exercise:\r
    prompt: cell.value 대신 cell.coordinate를 출력해 두 방식 모두 "A1"이 나오는지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet["A1"] = "name"\r
      cellByLetter = sheet["A1"]\r
      cellByIndex = sheet.cell(row=1, column=1)\r
      cellByLetter.___, cellByIndex.___\r
    hints:\r
    - cell.coordinate는 "A1" 같은 사람이 읽는 좌표 문자열을 돌려줍니다.\r
  check:\r
    noError: ws.cell 호출에 row/column이 1 이상 정수여야 합니다.\r
    resultCheck: 두 셀 객체가 같은 좌표를 가리켜야 합니다.\r
- id: step2_write_cells\r
  title: 2단계. 셀에 값 쓰기\r
  structuredPrimary: true\r
  subtitle: 대입과 cell(value=...)\r
  goal: 같은 동작을 두 가지 문법으로 작성할 수 있어, 동적 위치 쓰기와 정적 위치 쓰기를 골라 쓴다.\r
  why: 사람이 정한 셀(A1, B2)은 대괄호 표기가 읽기 좋고, 반복문 안에서 행/열이 바뀌는 동적 쓰기에는 cell(value=...)이 자연스럽습니다.\r
  explanation: |-\r
    \`ws['B2'] = 100\`처럼 직접 대입할 수 있고, \`ws.cell(row=2, column=2, value=100)\`처럼 한 번에 값까지 줄 수도 있습니다. 두 방식 모두 셀을 만들고 값을 채웁니다. 동적 좌표가 필요한 반복문 안에서는 \`ws.cell(row=i, column=j, value=...)\`이 훨씬 깔끔합니다.\r
  tips:\r
  - "cell(row=..., column=...)을 호출하는 순간 셀 객체가 생성됩니다. 빈 셀이라도 한 번 호출하면 max_row/max_column이 그 좌표를 포함하도록 확장됩니다."\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet["A1"] = "name"\r
    sheet["B1"] = "score"\r
    for rowIndex, person in enumerate([("alice", 92), ("bob", 78)], start=2):\r
        sheet.cell(row=rowIndex, column=1, value=person[0])\r
        sheet.cell(row=rowIndex, column=2, value=person[1])\r
    [(row[0].value, row[1].value) for row in sheet["A1:B3"]]\r
  exercise:\r
    prompt: 세 번째 사람 ("carol", 85)을 4행에 추가하고 결과 리스트의 길이가 4가 되는지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet["A1"] = "name"\r
      sheet["B1"] = "score"\r
      people = [("alice", 92), ("bob", 78), ___]\r
      for rowIndex, person in enumerate(people, start=2):\r
          sheet.cell(row=rowIndex, column=1, value=person[0])\r
          sheet.cell(row=rowIndex, column=2, value=person[1])\r
      [(row[0].value, row[1].value) for row in sheet["A1:B4"]]\r
    hints:\r
    - "튜플 형태로 한 명을 추가하면 됩니다. enumerate의 start=2가 헤더 다음 행부터 채우는 이유입니다."\r
  check:\r
    noError: 반복문 안의 cell 호출이 정수 row/column을 사용해야 합니다.\r
    resultCheck: 출력 리스트의 길이와 마지막 행의 내용이 추가한 데이터와 같아야 합니다.\r
- id: step3_append\r
  title: 3단계. append로 한 줄씩 끝에 쌓기\r
  structuredPrimary: true\r
  subtitle: ws.append(iterable)\r
  goal: 표 형태의 데이터를 append로 빠르게 쌓고, max_row가 어떻게 늘어나는지 확인한다.\r
  why: 데이터 행을 끝에 차곡차곡 쌓는 흐름은 자동 보고서의 가장 흔한 패턴입니다. cell() 반복보다 짧고 읽기 좋습니다.\r
  explanation: |-\r
    \`ws.append(["v1", "v2", ...])\`는 다음 빈 행에 값을 채웁니다. dict를 넘기면 키가 컬럼 문자(A, B, C)로 해석됩니다(예: \`{"A": 1, "C": 3}\`은 B를 비웁니다). append 직후 \`ws.max_row\`는 마지막으로 채워진 행 번호를 돌려줍니다.\r
  tips:\r
  - append는 리스트 외에 튜플, 제너레이터도 받습니다. 너무 큰 데이터는 제너레이터로 흘려보내 메모리를 아낄 수 있습니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    sheet = book.active\r
    sheet.append(["date", "region", "amount"])\r
    sheet.append(["2026-05-01", "Seoul", 120000])\r
    sheet.append(["2026-05-02", "Busan", 80000])\r
    sheet.max_row, sheet.max_column\r
  exercise:\r
    prompt: 행을 두 줄 더 append해서 max_row가 5가 되는지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      sheet = book.active\r
      sheet.append(["date", "region", "amount"])\r
      sheet.append(["2026-05-01", "Seoul", 120000])\r
      sheet.append(["2026-05-02", "Busan", 80000])\r
      sheet.append(___)\r
      sheet.append(___)\r
      assert sheet.max_row == 5\r
      sheet.max_row\r
    hints:\r
    - 추가 행도 같은 컬럼 순서(date, region, amount)로 맞춰야 의미가 있습니다.\r
  check:\r
    noError: append에 전달한 인자가 iterable이어야 TypeError가 나지 않습니다.\r
    resultCheck: max_row가 5가 되어야 assert를 통과합니다.\r
- id: step4_letter_to_index\r
  title: 4단계. 컬럼 문자 ↔ 정수 변환\r
  structuredPrimary: true\r
  subtitle: get_column_letter, column_index_from_string\r
  goal: 동적 컬럼 좌표를 만들 때 두 함수의 위치를 정확히 안다.\r
  why: 컬럼이 30개를 넘어가면 "AA, AB"가 시작됩니다. 이 변환을 수작업으로 하면 반드시 실수합니다.\r
  explanation: |-\r
    \`from openpyxl.utils import get_column_letter, column_index_from_string\`. \`get_column_letter(27)\`은 "AA"를, \`column_index_from_string("C")\`는 3을 돌려줍니다. 두 함수는 짝으로 기억하세요. 정수 → 문자, 문자 → 정수.\r
  tips:\r
  - openpyxl.utils에는 그 외에도 range_boundaries, coordinate_from_string 같은 좌표 헬퍼가 모여 있습니다. 좌표를 손으로 파싱하지 말고 utils를 보세요.\r
  snippet: |-\r
    from openpyxl.utils import get_column_letter, column_index_from_string\r
\r
    letters = [get_column_letter(num) for num in [1, 5, 27, 28, 702, 703]]\r
    numbers = [column_index_from_string(text) for text in ["A", "Z", "AA", "AZ", "BA"]]\r
    letters, numbers\r
  exercise:\r
    prompt: 50번 컬럼이 무슨 문자인지, "ZZ"가 몇 번째인지 직접 출력하세요.\r
    starterCode: |-\r
      from openpyxl.utils import get_column_letter, column_index_from_string\r
\r
      fiftiethLetter = get_column_letter(___)\r
      zzIndex = column_index_from_string(___)\r
      fiftiethLetter, zzIndex\r
    hints:\r
    - 두 함수 모두 1-based 정수를 사용합니다. ZZ는 26*27이 단서입니다.\r
  check:\r
    noError: get_column_letter는 1 이상 정수, column_index_from_string은 알파벳 대문자 문자열만 받습니다.\r
    resultCheck: 두 결과가 정수 50과 "ZZ"에 대응하는 값이어야 합니다.\r
- id: step5_read_existing\r
  title: 5단계. 기존 파일에서 값 읽기\r
  structuredPrimary: true\r
  subtitle: load_workbook → 셀 순회\r
  goal: 저장된 파일을 다시 열어 같은 셀 값이 보존되어 있는지 확인한다.\r
  why: 자동화 파이프라인은 항상 "쓰고 → 다시 읽고 → 검증"의 순환이 필요합니다. 한 단계라도 빠지면 산출물을 신뢰할 수 없습니다.\r
  explanation: |-\r
    \`load_workbook(path)\`로 워크북을 열고, 시트를 \`book["sheetName"]\` 또는 \`book.active\`로 잡습니다. 셀 값은 평소처럼 \`cell.value\`로 읽습니다. 임시 디렉터리를 쓰면 로컬 파일을 더럽히지 않습니다.\r
  tips:\r
  - 수식이 들어 있는 파일을 "계산된 값"으로 읽고 싶다면 load_workbook(path, data_only=True)를 씁니다. 강의 04에서 자세히 다룹니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    workdir = TemporaryDirectory()\r
    target = Path(workdir.name) / "scores.xlsx"\r
\r
    writer = Workbook()\r
    writeSheet = writer.active\r
    writeSheet.title = "scores"\r
    writeSheet.append(["name", "score"])\r
    writeSheet.append(["alice", 92])\r
    writeSheet.append(["bob", 78])\r
    writer.save(target)\r
\r
    reader = load_workbook(target)\r
    readSheet = reader["scores"]\r
    [(row[0].value, row[1].value) for row in readSheet.iter_rows(min_row=2, max_row=3)]\r
  exercise:\r
    prompt: "writer 단계에서 carol(85) 한 줄을 더 추가하고, reader 결과 리스트의 길이가 3이 되는지 확인하세요."\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "scores.xlsx"\r
\r
      writer = Workbook()\r
      writeSheet = writer.active\r
      writeSheet.title = "scores"\r
      writeSheet.append(["name", "score"])\r
      writeSheet.append(["alice", 92])\r
      writeSheet.append(["bob", 78])\r
      writeSheet.append(___)\r
      writer.save(target)\r
\r
      reader = load_workbook(target)\r
      readSheet = reader["scores"]\r
      result = [(row[0].value, row[1].value) for row in readSheet.iter_rows(min_row=2, max_row=4)]\r
      assert len(result) == 3\r
      result\r
    hints:\r
    - 추가한 사람도 (이름, 점수) 두 컬럼이어야 합니다. iter_rows의 max_row를 4로 늘린 이유와 맞춰 보세요.\r
  check:\r
    noError: writer.save와 load_workbook 모두 같은 경로 객체를 사용해야 합니다.\r
    resultCheck: 다시 읽은 행 수와 마지막 행의 값이 추가한 데이터와 같아야 합니다.\r
- id: validation\r
  title: 6단계. 검증 루프 - dict 데이터 → 정확한 좌표\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 검증\r
  goal: 사람이 만든 dict 데이터를 받아 정확한 셀 좌표에 쓰는 함수를 만들고, 다시 읽어 결과를 자동 검증한다.\r
  why: 자동화 함수의 신뢰는 "내가 의도한 좌표에 의도한 값이 들어갔는가"로 결정됩니다. 검증이 없으면 잠깐 동작하는 코드일 뿐입니다.\r
  explanation: |-\r
    \`writeStats\`는 dict 데이터를 받아 첫 행을 헤더로, 그 이후 행에 값으로 채웁니다. 저장 후 다시 열어 max_row, 헤더, 첫 데이터 행을 모두 비교합니다. 변주 실험으로 dict의 키 순서를 바꿔 결과가 어떻게 달라지는지도 함께 확인하세요.\r
  tips:\r
  - dict 순서가 헤더 순서를 결정합니다. Python 3.7부터 dict는 입력 순서를 보존합니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    def writeStats(path, stats):\r
        book = Workbook()\r
        sheet = book.active\r
        sheet.title = "stats"\r
        sheet.append(list(stats.keys()))\r
        sheet.append(list(stats.values()))\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    statsPath = writeStats(\r
        Path(workdir.name) / "stats.xlsx",\r
        {"orders": 124, "revenue": 8420000, "averageBasket": 67903},\r
    )\r
\r
    reopened = load_workbook(statsPath)\r
    statsSheet = reopened["stats"]\r
    headerRow = [cell.value for cell in statsSheet[1]]\r
    valueRow = [cell.value for cell in statsSheet[2]]\r
    assert headerRow == ["orders", "revenue", "averageBasket"]\r
    assert valueRow == [124, 8420000, 67903]\r
    assert statsSheet.max_row == 2\r
    headerRow, valueRow\r
  exercise:\r
    prompt: stats dict에 "refundRate" 0.012를 추가하고 헤더와 값 row 길이가 모두 4가 되는지 assert로 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      def writeStats(path, stats):\r
          book = Workbook()\r
          sheet = book.active\r
          sheet.title = "stats"\r
          sheet.append(list(stats.keys()))\r
          sheet.append(list(stats.values()))\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      statsPath = writeStats(\r
          Path(workdir.name) / "stats.xlsx",\r
          {"orders": 124, "revenue": 8420000, "averageBasket": 67903, ___},\r
      )\r
\r
      reopened = load_workbook(statsPath)\r
      statsSheet = reopened["stats"]\r
      headerRow = [cell.value for cell in statsSheet[1]]\r
      valueRow = [cell.value for cell in statsSheet[2]]\r
      assert len(headerRow) == ___\r
      assert len(valueRow) == ___\r
      headerRow, valueRow\r
    hints:\r
    - "키=문자열, 값=숫자. 길이 두 개를 같이 4로 맞춰야 의미가 있습니다."\r
  check:\r
    noError: writeStats 호출이 ValueError 없이 끝나야 합니다.\r
    resultCheck: 헤더와 값 row의 길이가 dict 항목 수와 같아야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: 두 가지 좌표 접근(\`cell\`, \`append\`)과 컬럼 변환 유틸을 실무 양식에 직접 적용한다.\r
  why: 좌표 감각은 손으로 한 번씩 양식을 만들어 봐야 굳어집니다. 검증까지 같이 작성해야 자동화가 됩니다.\r
  explanation: |-\r
    미션1은 dict 리스트(직원 명단)를 받아 표로 변환하고 재오픈 검증까지, 미션2는 9x9 곱셈표를 동적 좌표(\`get_column_letter\`)로 채우고 임의 좌표의 값을 검증합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 직원/곱셈 변수는 미션별 prefix(\`emp*\`, \`mul*\`)로 충돌을 피했습니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
    from openpyxl.utils import get_column_letter\r
  exercise:\r
    prompt: 두 미션을 차례로 직접 작성한 뒤 expansion 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
      from openpyxl.utils import get_column_letter\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1은 헤더 한 줄 + 직원 N명. 미션2는 (1,1)에 빈 셀, 1행과 1열에 1~9, 나머지 셀에 곱셈값.\r
    - "곱셈값 셀 좌표는 get_column_letter(col+1) + str(row+1) 패턴."\r
  check:\r
    noError: 두 미션 모두 정확한 좌표 변환으로 cell 호출이 IndexError를 내지 않아야 합니다.\r
    resultCheck: 재오픈 후 첫 직원 행과 곱셈표 임의 셀(예 5x7=35)이 모두 일치해야 합니다.\r
  blocks:\r
  - type: tip\r
    content: 미션 변수는 prefix로 격리됩니다. emp*는 미션1, mul*는 미션2 전용입니다.\r
  - type: expansion\r
    title: "미션1: 직원 dict 리스트 → 표 + 재오픈 검증"\r
    blocks:\r
    - type: code\r
      title: dict 리스트로 표 작성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
\r
        empDir = TemporaryDirectory()\r
        empPath = Path(empDir.name) / "employees.xlsx"\r
        employees = [\r
            {"id": "E001", "name": "Alice", "dept": "Sales", "salary": 5500000},\r
            {"id": "E002", "name": "Bob", "dept": "RnD", "salary": 6200000},\r
            {"id": "E003", "name": "Carol", "dept": "Sales", "salary": 4800000},\r
        ]\r
\r
        empBook = Workbook()\r
        empSheet = empBook.active\r
        empSheet.title = "employees"\r
        headers = list(employees[0].keys())\r
        empSheet.append(headers)\r
        for person in employees:\r
            empSheet.append([person[col] for col in headers])\r
        empBook.save(empPath)\r
        empSheet.max_row\r
    - type: code\r
      title: 재오픈 후 첫 직원 검증\r
      content: |-\r
        empReopen = load_workbook(empPath)\r
        empSheetBack = empReopen["employees"]\r
        firstRow = [cell.value for cell in empSheetBack[2]]\r
        assert firstRow == ["E001", "Alice", "Sales", 5500000]\r
        assert empSheetBack.max_row == len(employees) + 1\r
        firstRow\r
  - type: expansion\r
    title: "미션2: 9x9 곱셈표 + get_column_letter 동적 좌표"\r
    blocks:\r
    - type: code\r
      title: 동적 좌표로 곱셈표 채우기\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
        from openpyxl.utils import get_column_letter\r
\r
        mulDir = TemporaryDirectory()\r
        mulPath = Path(mulDir.name) / "multiplication.xlsx"\r
\r
        mulBook = Workbook()\r
        mulSheet = mulBook.active\r
        mulSheet.title = "table"\r
        for index in range(1, 10):\r
            mulSheet.cell(row=1, column=index + 1, value=index)\r
            mulSheet.cell(row=index + 1, column=1, value=index)\r
        for row in range(1, 10):\r
            for col in range(1, 10):\r
                mulSheet.cell(row=row + 1, column=col + 1, value=row * col)\r
        mulBook.save(mulPath)\r
        mulSheet.max_row, mulSheet.max_column\r
    - type: code\r
      title: 임의 좌표 검증\r
      content: |-\r
        mulReopen = load_workbook(mulPath)\r
        mulSheetBack = mulReopen["table"]\r
        cellCoord = f"{get_column_letter(5 + 1)}{7 + 1}"\r
        assert mulSheetBack[cellCoord].value == 5 * 7\r
        assert mulSheetBack["B2"].value == 1\r
        assert mulSheetBack["J10"].value == 9 * 9\r
        mulSheetBack[cellCoord].value, mulSheetBack["J10"].value\r
- id: summary\r
  title: 정리\r
  subtitle: 좌표를 손에 익히면 나머지는 쉽다\r
  blocks:\r
  - type: text\r
    content: |-\r
      셀 접근의 세 가지 길(대괄호·cell·append)을 모두 경험하고, 컬럼 문자와 정수를 변환하는 utils 두 함수도 익혔습니다. 좌표 감각이 잡히면 그 위에 수식, 서식, 차트가 자연스럽게 얹힙니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - "ws['A1'] 과 ws.cell(row=1, column=1)은 같은 셀을 가리키는 두 길이다"\r
    - "ws.append(iterable)은 max_row+1 위치에 한 줄을 쌓는다"\r
    - "get_column_letter / column_index_from_string으로 컬럼 좌표를 자유롭게 변환한다"\r
    - "load_workbook(path)로 저장한 파일을 다시 열어 항상 결과를 검증한다"\r
`;export{e as default};