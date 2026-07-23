var e=`meta:\r
  id: openpyxl_01\r
  title: 워크북과 시트 만들기\r
  order: 1\r
  category: openpyxl\r
  difficulty: ⭐\r
  badge: 입문\r
  packages:\r
  - openpyxl\r
  tags:\r
  - openpyxl\r
  - Workbook\r
  - Worksheet\r
  - 파일저장\r
  - 검증\r
  seo:\r
    title: openpyxl 워크북과 시트 만들기 - 다중 시트 파일 생성\r
    description: Workbook과 Worksheet 객체로 시트를 만들고 이름을 바꾸고 저장한 뒤 load_workbook으로 다시 열어 구조를 검증합니다.\r
    keywords:\r
    - openpyxl Workbook\r
    - create_sheet\r
    - load_workbook\r
    - 시트 이름 변경\r
intro:\r
  direction: 워크북을 만들고 시트를 추가·정렬·삭제한 뒤 .xlsx 파일로 저장하고, 다시 열어 시트 구조를 코드로 검증합니다.\r
  benefits:\r
  - Workbook · Worksheet · save · load의 4박자를 자동화의 출발점으로 익힙니다.\r
  - 기본 시트(Sheet)를 그대로 두지 않고 명시적인 이름을 부여하는 습관을 만듭니다.\r
  - 결과 파일을 load_workbook으로 다시 열어 시트 이름 목록을 assert로 확인합니다.\r
  diagram:\r
    steps:\r
    - label: Workbook 생성\r
      detail: 비어 있는 워크북을 메모리에 만든다.\r
    - label: 시트 구성\r
      detail: active 시트의 이름을 바꾸고 create_sheet로 추가한다.\r
    - label: 저장\r
      detail: TemporaryDirectory 안의 경로로 save 한다.\r
    - label: 다시 열어 검증\r
      detail: load_workbook으로 열어 sheetnames를 비교한다.\r
    runtime:\r
    - label: openpyxl 패키지 준비\r
      detail: uv run python으로 openpyxl만 import해도 워크북·시트 생성이 모두 동작한다.\r
    - label: 임시 디렉터리 저장과 재오픈\r
      detail: TemporaryDirectory 안의 .xlsx 경로에 save 후 load_workbook으로 다시 열어 sheetnames를 assert로 확인한다.\r
sections:\r
- id: step1_create_workbook\r
  title: 1단계. 빈 워크북 만들기\r
  structuredPrimary: true\r
  subtitle: Workbook() 호출\r
  goal: Workbook을 만들고 active 시트의 기본값을 직접 눈으로 확인한다.\r
  why: 새 워크북은 항상 "Sheet" 라는 익명 시트 하나로 시작합니다. 이 사실을 알지 못하면 빈 시트가 남는 보고서가 만들어집니다.\r
  explanation: |-\r
    \`Workbook()\`은 메모리에 새 .xlsx 구조를 만듭니다. 이 시점에는 디스크 파일이 없습니다. \`workbook.active\`는 처음 만들어진 기본 시트(Worksheet) 객체를 돌려주고, 기본 이름은 "Sheet"입니다. \`workbook.sheetnames\`는 현재 들어 있는 시트 이름의 리스트입니다.\r
  tips:\r
  - workbook.active와 workbook['Sheet']는 같은 객체입니다. 같은 시트를 두 변수로 잡을 뿐, 시트가 두 개 생기지 않습니다.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    workbook = Workbook()\r
    sheet = workbook.active\r
    sheet.title, workbook.sheetnames\r
  exercise:\r
    prompt: workbook.active.title을 "raw"로 바꾼 뒤, sheetnames가 ["raw"]가 되는지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      workbook = Workbook()\r
      sheet = workbook.active\r
      sheet.title = ___\r
      workbook.sheetnames\r
    hints:\r
    - sheet.title은 그냥 문자열 속성입니다. 대입하면 즉시 sheetnames에 반영됩니다.\r
  check:\r
    noError: Workbook() 호출과 sheet.title 대입이 ImportError/AttributeError 없이 실행되어야 합니다.\r
    resultCheck: sheet.title을 바꾼 뒤 workbook.sheetnames가 바뀐 이름 리스트와 같아야 합니다.\r
- id: step2_add_sheets\r
  title: 2단계. 시트 추가하기\r
  structuredPrimary: true\r
  subtitle: create_sheet(title, index)\r
  goal: create_sheet의 title과 index 파라미터로 시트 순서를 제어한다.\r
  why: 보고서는 시트 순서가 의미를 갖습니다. summary가 첫 번째인지 마지막인지에 따라 사용자 경험이 완전히 달라집니다.\r
  explanation: |-\r
    \`create_sheet(title=...)\`는 새 워크시트를 끝에 추가합니다. \`index=0\`을 주면 맨 앞에 끼워 넣을 수 있습니다. 음수 인덱스도 동작합니다(\`index=-1\`은 마지막). 만든 시트는 반환값으로 받아 변수에 묶어 두면 이후에 셀을 채울 때 편합니다.\r
  tips:\r
  - 같은 이름의 시트를 두 번 만들면 openpyxl이 자동으로 뒤에 "1", "2" 같은 숫자를 붙입니다. 의도와 다르게 시트가 늘면 이 동작을 의심하세요.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    book.active.title = "summary"\r
    detail = book.create_sheet(title="detail")\r
    raw = book.create_sheet(title="raw", index=0)\r
    book.sheetnames\r
  exercise:\r
    prompt: raw 시트를 가장 마지막으로 옮기려면 index를 어떻게 줘야 할지 직접 바꿔 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      book.active.title = "summary"\r
      detail = book.create_sheet(title="detail")\r
      raw = book.create_sheet(title="raw", index=___)\r
      book.sheetnames\r
    hints:\r
    - index를 생략하면 끝에 추가됩니다. 0이면 맨 앞입니다. 의도하는 위치의 정수 인덱스를 적어 보세요.\r
  check:\r
    noError: create_sheet 호출에 사용된 index 값이 정수 또는 None이어야 합니다.\r
    resultCheck: book.sheetnames의 raw 위치가 바꾼 index 의도와 맞아야 합니다.\r
- id: step3_remove_sheet\r
  title: 3단계. 시트 삭제하기\r
  structuredPrimary: true\r
  subtitle: del workbook[title]\r
  goal: 불필요한 기본 "Sheet"를 정리해 빈 시트가 남지 않게 한다.\r
  why: pandas나 다른 도구가 만든 임시 시트가 결과 파일에 그대로 남으면, 사용자가 받는 보고서가 어지러워집니다.\r
  explanation: |-\r
    시트는 \`del book[title]\` 또는 \`book.remove(book[title])\`로 지웁니다. 두 방식은 같은 결과를 만듭니다. 시트가 하나도 없는 상태로 저장하면 파일이 열리지 않으므로, 삭제 전후 \`sheetnames\`로 한 번 더 확인하는 습관을 가집시다.\r
  tips:\r
  - 시트 객체를 변수로 잡고 있을 때 del로 시트를 삭제하면 그 변수는 더 이상 워크북 안의 시트가 아니라 "고아 객체"가 됩니다. 다시 쓰지 마세요.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    book = Workbook()\r
    book.create_sheet("summary", 0)\r
    del book["Sheet"]\r
    book.sheetnames\r
  exercise:\r
    prompt: del 대신 book.remove(book["Sheet"])로 같은 동작을 만들고 결과가 같은지 확인하세요.\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      book = Workbook()\r
      book.create_sheet("summary", 0)\r
      book.remove(book[___])\r
      book.sheetnames\r
    hints:\r
    - 삭제 대상 시트의 이름을 문자열로 전달하면 됩니다. del과 결과가 같아야 합니다.\r
  check:\r
    noError: 삭제 대상 시트가 sheetnames에 존재해야 KeyError가 나지 않습니다.\r
    resultCheck: 삭제 후 sheetnames에 "Sheet"가 없어야 합니다.\r
- id: step4_save_and_load\r
  title: 4단계. 저장하고 다시 열어 검증하기\r
  structuredPrimary: true\r
  subtitle: save와 load_workbook\r
  goal: 저장한 .xlsx 파일을 다시 열어 시트 구조가 코드의 의도와 일치하는지 자동으로 확인한다.\r
  why: 파일 저장은 성공해도 안의 구조가 비어 있을 수 있습니다. 결과를 다시 열어 보지 않으면 자동화는 신뢰하기 어렵습니다.\r
  explanation: |-\r
    \`workbook.save(path)\`는 .xlsx를 디스크에 씁니다. \`load_workbook(path)\`은 그 파일을 다시 메모리로 읽습니다. 임시 디렉터리(\`TemporaryDirectory\`)를 쓰면 로컬 파일을 어지럽히지 않고도 같은 흐름을 재현할 수 있습니다.\r
  tips:\r
  - load_workbook의 sheetnames와 저장 직전 sheetnames를 비교하면 시트 구조가 손상 없이 보존됐는지 한 번에 확인됩니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    workdir = TemporaryDirectory()\r
    target = Path(workdir.name) / "report.xlsx"\r
\r
    book = Workbook()\r
    book.active.title = "summary"\r
    book.create_sheet("detail")\r
    book.save(target)\r
\r
    reopened = load_workbook(target)\r
    reopened.sheetnames\r
  exercise:\r
    prompt: detail 시트 뒤에 "raw"를 더 추가해 저장하고, reopened.sheetnames가 길이 3인지 assert로 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "report.xlsx"\r
\r
      book = Workbook()\r
      book.active.title = "summary"\r
      book.create_sheet("detail")\r
      book.create_sheet(___)\r
      book.save(target)\r
\r
      reopened = load_workbook(target)\r
      assert len(reopened.sheetnames) == ___\r
      reopened.sheetnames\r
    hints:\r
    - create_sheet의 첫 인자는 시트 이름 문자열입니다. assert의 숫자는 시트 개수와 같아야 합니다.\r
  check:\r
    noError: save와 load_workbook 사이에 경로 문자열이 동일해야 FileNotFoundError가 나지 않습니다.\r
    resultCheck: reopened.sheetnames의 길이와 내용이 저장 직전 의도와 일치해야 합니다.\r
- id: step5_default_sheet_pitfall\r
  title: 5단계. 자주 만나는 함정 - 빈 기본 시트\r
  structuredPrimary: true\r
  subtitle: 기본 "Sheet"가 보고서에 남는 문제\r
  goal: 빈 기본 시트를 명시적으로 정리하지 않으면 보고서에 의도치 않은 시트가 남는다는 것을 직접 확인한다.\r
  why: 실무 보고서에서 "Sheet1"이 결과 파일에 끼어 있으면 신뢰도가 즉시 떨어집니다. 빈 시트는 코드가 의도적으로 지워야 합니다.\r
  explanation: |-\r
    Workbook()이 만든 기본 시트의 이름을 명시적으로 바꾸지 않으면 보고서에 "Sheet"라는 의미 없는 탭이 그대로 남습니다. 깔끔한 자동화의 첫 번째 규칙은 "익명 시트를 절대 저장하지 않는다"입니다.\r
  tips:\r
  - 패턴화하세요. (1) Workbook() (2) active.title을 의미 있는 이름으로 변경 (3) 필요 시트 추가 (4) 저장.\r
  snippet: |-\r
    from openpyxl import Workbook\r
\r
    bad = Workbook()\r
    bad.create_sheet("summary")\r
    bad.create_sheet("detail")\r
    assert "Sheet" in bad.sheetnames\r
    bad.sheetnames\r
  exercise:\r
    prompt: 'Sheet 이름이 sheetnames 리스트에 절대 들어가지 않도록 코드를 한 줄 추가하세요.'\r
    starterCode: |-\r
      from openpyxl import Workbook\r
\r
      good = Workbook()\r
      good.active.title = ___\r
      good.create_sheet("detail")\r
      assert "Sheet" not in good.sheetnames\r
      good.sheetnames\r
    hints:\r
    - active.title을 의미 있는 이름("summary" 등)으로 즉시 덮어쓰면 됩니다.\r
  check:\r
    noError: active.title 대입이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 최종 sheetnames에 "Sheet"가 없어야 assert를 통과합니다.\r
- id: validation\r
  title: 6단계. 검증 루프 - 보고서 구조 계약\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 검증\r
  goal: 보고서 양식을 생성하는 함수가 "summary/detail/raw 3시트로 시작한다"는 계약을 깨지 않는지 자동 검증한다.\r
  why: 자동화는 함수 단위로 책임을 묶고, 그 함수가 만든 산출물의 구조를 코드로 확인할 때 비로소 재사용 가능해집니다.\r
  explanation: |-\r
    \`buildReportSkeleton\`은 빈 보고서 양식을 만드는 함수입니다. 시트 이름과 순서를 계약으로 고정하고, 그 계약을 함수 안에서 직접 assert로 확인합니다. 호출 측에서도 한 번 더 확인합니다. 같은 검증을 두 번 하는 것은 비용이 아니라 안전망입니다.\r
  tips:\r
  - 계약을 깨고 싶으면 expectedSheets 리스트의 순서를 바꿔 보세요. 어디서 실패가 나는지가 자동 검증의 가치입니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
\r
    def buildReportSkeleton(path):\r
        book = Workbook()\r
        book.active.title = "summary"\r
        book.create_sheet("detail")\r
        book.create_sheet("raw")\r
        expectedSheets = ["summary", "detail", "raw"]\r
        assert book.sheetnames == expectedSheets, book.sheetnames\r
        book.save(path)\r
        return path\r
\r
    workdir = TemporaryDirectory()\r
    skeletonPath = buildReportSkeleton(Path(workdir.name) / "skeleton.xlsx")\r
    reopened = load_workbook(skeletonPath)\r
    assert reopened.sheetnames == ["summary", "detail", "raw"]\r
    reopened.sheetnames\r
  exercise:\r
    prompt: expectedSheets의 순서를 ["raw", "detail", "summary"]로 바꾸고, assert가 실패하는지 직접 확인하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      def buildReportSkeleton(path):\r
          book = Workbook()\r
          book.active.title = "summary"\r
          book.create_sheet("detail")\r
          book.create_sheet("raw")\r
          expectedSheets = ___\r
          assert book.sheetnames == expectedSheets, book.sheetnames\r
          book.save(path)\r
          return path\r
\r
      workdir = TemporaryDirectory()\r
      skeletonPath = buildReportSkeleton(Path(workdir.name) / "skeleton.xlsx")\r
      reopened = load_workbook(skeletonPath)\r
      reopened.sheetnames\r
    hints:\r
    - assert가 실패하면 책임 라인이 어디인지 즉시 보입니다. 그 다음 의도한 순서로 다시 맞추세요.\r
  check:\r
    noError: buildReportSkeleton 호출이 ValueError 없이 끝나야 합니다.\r
    resultCheck: reopened.sheetnames가 ["summary", "detail", "raw"]과 같아야 합니다.\r
- id: practice\r
  title: 실습 - 종합 미션 2개\r
  structuredPrimary: true\r
  subtitle: import부터 검증까지 독립 실행\r
  goal: 워크북 생성·시트 구성·저장·재오픈 검증의 4박자를 두 가지 실무 시나리오에 직접 적용한다.\r
  why: 단계 별 작은 변경 너머, 처음부터 끝까지 직접 만들어 봐야 자동화 함수로 응축됩니다.\r
  explanation: |-\r
    아래 두 미션은 모두 import부터 검증까지 독립 실행 가능합니다. 미션1은 이번 강의 핵심(시트 생성·순서·삭제) 단독 적용, 미션2는 이름 정제·재오픈 비교까지 결합합니다.\r
  tips:\r
  - 각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  - 미션 간 변수가 겹치지 않도록 각각 다른 변수명(\`q*\`, \`team*\`)을 사용했습니다.\r
  snippet: |-\r
    from pathlib import Path\r
    from tempfile import TemporaryDirectory\r
    from openpyxl import Workbook, load_workbook\r
  exercise:\r
    prompt: 아래 두 미션의 expansion 블록을 펼치기 전에 직접 작성해 본 뒤 정답과 비교하세요.\r
    starterCode: |-\r
      from pathlib import Path\r
      from tempfile import TemporaryDirectory\r
      from openpyxl import Workbook, load_workbook\r
\r
      workdir = TemporaryDirectory()\r
      target = Path(workdir.name) / "mission.xlsx"\r
      ___\r
    hints:\r
    - 미션1은 Q1~Q4 + raw 5시트, 미션2는 부서명 5개 시트입니다.\r
    - 모든 저장 후 load_workbook으로 다시 열어 sheetnames를 assert로 비교하세요.\r
  check:\r
    noError: 두 미션의 save와 load_workbook 경로가 일치해야 합니다.\r
    resultCheck: 재오픈한 워크북의 sheetnames가 의도한 순서와 같아야 합니다.\r
  blocks:\r
  - type: tip\r
    content: 각 미션은 import부터 시작합니다. 변수명은 미션 간 겹치지 않게 prefix를 다르게 두었습니다.\r
  - type: expansion\r
    title: "미션1: 분기별 보고서 양식 (Q1~Q4 + raw 5시트)"\r
    blocks:\r
    - type: code\r
      title: 양식 생성과 시트 순서\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
\r
        qDir = TemporaryDirectory()\r
        qPath = Path(qDir.name) / "quarterly.xlsx"\r
\r
        qBook = Workbook()\r
        qBook.active.title = "Q1"\r
        for label in ["Q2", "Q3", "Q4"]:\r
            qBook.create_sheet(label)\r
        qBook.create_sheet("raw", 0)\r
        qBook.save(qPath)\r
        qBook.sheetnames\r
    - type: code\r
      title: 재오픈 검증\r
      content: |-\r
        qReopen = load_workbook(qPath)\r
        expectedQ = ["raw", "Q1", "Q2", "Q3", "Q4"]\r
        assert qReopen.sheetnames == expectedQ\r
        qReopen.sheetnames\r
  - type: expansion\r
    title: "미션2: 영업팀 5개 부서 양식 + 빈 기본 시트 제거"\r
    blocks:\r
    - type: code\r
      title: 부서 이름 정제 후 시트 생성\r
      content: |-\r
        from pathlib import Path\r
        from tempfile import TemporaryDirectory\r
        from openpyxl import Workbook, load_workbook\r
\r
        teamDir = TemporaryDirectory()\r
        teamPath = Path(teamDir.name) / "teams.xlsx"\r
        rawTeams = ["서울 1팀", "서울 2팀", "부산팀", "대구팀", "광주팀"]\r
        cleanTeams = [name.replace(" ", "_") for name in rawTeams]\r
\r
        teamBook = Workbook()\r
        teamBook.active.title = cleanTeams[0]\r
        for name in cleanTeams[1:]:\r
            teamBook.create_sheet(name)\r
        assert "Sheet" not in teamBook.sheetnames\r
        teamBook.save(teamPath)\r
        teamBook.sheetnames\r
    - type: code\r
      title: 재오픈 후 부서 이름 검증\r
      content: |-\r
        teamReopen = load_workbook(teamPath)\r
        assert teamReopen.sheetnames == cleanTeams\r
        assert len(teamReopen.sheetnames) == 5\r
        teamReopen.sheetnames\r
- id: summary\r
  title: 정리\r
  subtitle: 보고서의 뼈대를 코드로\r
  blocks:\r
  - type: text\r
    content: |-\r
      이번 강의에서 Workbook → 시트 정리 → 저장 → 재오픈 검증의 4단계 흐름을 완주했습니다. 모든 자동 보고서는 이 흐름 위에 셀, 수식, 차트가 얹힙니다.\r
  - type: list\r
    style: bullet\r
    items:\r
    - Workbook() - 메모리에 빈 .xlsx 구조 생성\r
    - workbook.active.title - 기본 시트 이름을 즉시 바꿔 "Sheet" 잔재 제거\r
    - create_sheet(title, index) - 시트 순서까지 의도적으로 제어\r
    - save(path) / load_workbook(path) - 저장과 재오픈을 짝으로 사용\r
    - 시트 이름 리스트(sheetnames)는 보고서의 계약이고, assert로 잠가 둔다\r
`;export{e as default};