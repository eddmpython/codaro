var e=`meta:\r
  id: 05_collections\r
  title: collections - 특수 컨테이너\r
  category: builtins\r
  tags:\r
  - collections\r
  - Counter\r
  - defaultdict\r
  - deque\r
  - namedtuple\r
  seo:\r
    title: 파이썬 collections 모듈 완전 정복\r
    description: collections 모듈의 Counter, defaultdict, deque, namedtuple 등 특수 컨테이너를 배웁니다.\r
    keywords:\r
    - collections\r
    - Counter\r
    - defaultdict\r
    - deque\r
    - namedtuple\r
    - 파이썬컬렉션\r
intro:\r
  emoji: 📦\r
  points:\r
  - Counter로 빈도 계산\r
  - defaultdict로 기본값 처리\r
  - deque로 양방향 큐 구현\r
  - namedtuple로 가독성 향상\r
  direction: collections 특수 컨테이너에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - collections 특수 컨테이너 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: collections 모듈 불 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: Counter 빈도 계산기 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: defaultdict 기본값 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: collections 특수 컨 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: collections 특수 컨 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: collections 특수 컨 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: collections 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: collections 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    collections은 파이썬 표준 라이브러리입니다. Counter, deque, defaultdict 등 특수 컨테이너를 제공하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 collections 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    from collections import Counter, defaultdict, deque, namedtuple, ChainMap\r
\r
    # 모듈 로드 확인\r
    'collections 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: collections 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from collections import Counter, defaultdict, deque, namedtuple, ChainMap\r
\r
      # 모듈 로드 확인\r
      'collections 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: collections 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: collections 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: counter\r
  title: Counter - 빈도 계산기\r
  structuredPrimary: true\r
  subtitle: 요소의 개수 세기\r
  goal: Counter 빈도 계산기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Counter는 요소의 등장 횟수를 세는 특수 딕셔너리입니다. most_common()으로 가장 많이 등장한 요소를 찾고, 산술 연산으로 카운터를 합치거나 뺄 수 있습니다. 투표 집계, 단어 빈도 분석, 통계 처리에 필수적입니다.\r
\r
    Counter는 존재하지 않는 키에 대해 0을 반환합니다. KeyError가 발생하지 않습니다.\r
  snippet: |-\r
    fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']\r
    fruitCount = Counter(fruits)\r
    fruitCount\r
  exercise:\r
    prompt: Counter 빈도 계산기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']\r
      fruitCount = Counter(fruits)\r
      fruitCount\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: Counter 빈도 계산기에서 \`fruits\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Counter 빈도 계산기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: defaultdict\r
  title: defaultdict - 기본값 딕셔너리\r
  structuredPrimary: true\r
  subtitle: KeyError 없는 딕셔너리\r
  goal: defaultdict 기본값 딕셔너리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    defaultdict는 존재하지 않는 키에 접근할 때 기본값을 자동으로 생성합니다. int, list, set 등을 기본 팩토리로 지정하면 초기화 없이 바로 사용할 수 있습니다. 그룹화, 집계, 인덱싱 작업을 간결하게 만듭니다.\r
\r
    defaultdict(lambda: 값)으로 커스텀 기본값을 설정할 수 있습니다.\r
  snippet: |-\r
    scores = defaultdict(int)\r
    scores['alice'] += 10\r
    scores['bob'] += 5\r
    scores['alice'] += 3\r
    dict(scores)\r
  exercise:\r
    prompt: defaultdict 기본값 딕셔너리 예제에서 사용자 이름이나 누적 점수를 바꾸고 자동 기본값이 합계에 반영되는지 확인하세요.\r
    starterCode: |-\r
      scores = defaultdict(int)\r
      scores['alice'] += 10\r
      scores['bob'] += 5\r
      scores['alice'] += 3\r
      dict(scores)\r
    hints:\r
    - 바꿀 지점은 \`scores[...]\`의 키 이름과 더하는 점수입니다.\r
    - 실행 뒤 dict로 변환한 결과가 새 키와 누적값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: defaultdict 기본값 딕셔너리에서 \`scores\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: defaultdict 기본값 딕셔너리 실행 뒤 \`scores\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: deque\r
  title: deque - 양방향 큐\r
  structuredPrimary: true\r
  subtitle: 빠른 양쪽 끝 삽입/삭제\r
  goal: deque 양방향 큐에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    deque는 양쪽 끝에서 빠르게 삽입과 삭제가 가능한 자료구조입니다. append()/pop()은 오른쪽, appendleft()/popleft()는 왼쪽에서 작동합니다. 리스트보다 양 끝 연산이 훨씬 빠르며, 큐, 스택, 슬라이딩 윈도우에 활용됩니다.\r
\r
    deque(maxlen=n)으로 크기 제한 큐를 만들면 자동으로 오래된 요소가 제거됩니다.\r
  snippet: |-\r
    dq = deque([1, 2, 3])\r
    dq.append(4)\r
    dq.appendleft(0)\r
    list(dq)\r
  exercise:\r
    prompt: deque 양방향 큐 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dq = deque([1, 2, 3])\r
      dq.append(4)\r
      dq.appendleft(0)\r
      list(dq)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: deque 양방향 큐에서 \`dq\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: deque 양방향 큐 실행 뒤 \`dq\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: namedtuple\r
  title: namedtuple - 이름있는 튜플\r
  structuredPrimary: true\r
  subtitle: 가독성 높은 불변 데이터\r
  goal: namedtuple 이름있는 튜플에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    namedtuple은 필드 이름으로 접근할 수 있는 튜플입니다. 인덱스 대신 속성명을 사용하여 코드 가독성을 높이고, 불변성으로 안전성을 보장합니다. 경량 데이터 클래스, 설정 객체, 반환값 구조화에 적합합니다.\r
\r
    _asdict()로 namedtuple을 OrderedDict로 변환할 수 있습니다.\r
  snippet: |-\r
    Point = namedtuple('Point', ['x', 'y'])\r
    p = Point(3, 4)\r
    p.x, p.y\r
  exercise:\r
    prompt: namedtuple 이름있는 튜플 예제에서 필드 이름이나 좌표 값을 바꾸고 속성 접근 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      Point = namedtuple('Point', ['x', 'y'])\r
      p = Point(3, 4)\r
      p.x, p.y\r
    hints:\r
    - 바꿀 지점은 \`namedtuple\`의 필드 목록과 \`Point(...)\` 생성 인자입니다.\r
    - 실행 뒤 \`p.x\`, \`p.y\` 같은 속성 접근이 바꾼 필드와 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: namedtuple 이름있는 튜플에서 \`Point\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: namedtuple 이름있는 튜플 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: chainmap\r
  title: ChainMap - 딕셔너리 체인\r
  structuredPrimary: true\r
  subtitle: 여러 딕셔너리 통합 조회\r
  goal: ChainMap 딕셔너리 체인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    ChainMap은 여러 딕셔너리를 하나의 뷰로 묶습니다. 조회 시 첫 번째 딕셔너리부터 순서대로 검색하며, 설정 우선순위나 변수 스코프 구현에 유용합니다. 실제 병합 없이 논리적으로 합치므로 메모리 효율적입니다.\r
\r
    ChainMap.maps로 내부 딕셔너리 리스트에 접근할 수 있습니다.\r
  snippet: |-\r
    defaults = {'color': 'red', 'size': 10}\r
    custom = {'size': 20}\r
    combined = ChainMap(custom, defaults)\r
    combined['color'], combined['size']\r
  exercise:\r
    prompt: ChainMap 딕셔너리 체인 예제에서 기본값과 사용자 설정 dict를 바꾸고 조회 우선순위가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      defaults = {'color': 'red', 'size': 10}\r
      custom = {'size': 20}\r
      combined = ChainMap(custom, defaults)\r
      combined['color'], combined['size']\r
    hints:\r
    - 바꿀 지점은 \`defaults\`, \`custom\`, \`ChainMap(custom, defaults)\`의 순서입니다.\r
    - 실행 뒤 같은 키 조회가 앞쪽 dict를 우선하는지 확인하세요.\r
  check:\r
    type: noError\r
    noError: ChainMap 딕셔너리 체인에서 \`defaults\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: ChainMap 딕셔너리 체인 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: collections 실무 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 collections 활용 패턴을 살펴봅니다. 투표 집계, 로그 분석, 최근 항목 관리, 데이터 구조화 등 다양한 문제를 collections로 효율적으로 해결할 수 있습니다.\r
\r
    OrderedDict는 Python 3.7+에서는 일반 dict도 순서를 유지하므로 특별한 경우를 제외하면 dict 사용을 권장합니다.\r
  snippet: |-\r
    votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob', 'Alice']\r
    voteCount = Counter(votes)\r
    winner = voteCount.most_common(1)[0]\r
    winner\r
  exercise:\r
    prompt: 실전 활용 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob', 'Alice']\r
      voteCount = Counter(votes)\r
      winner = voteCount.most_common(1)[0]\r
      winner\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`votes\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 티켓 운영 집계'\r
  structuredPrimary: true\r
  subtitle: Counter, defaultdict, deque, ChainMap 조합\r
  goal: '검증 루프: 티켓 운영 집계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    collections는 단일 함수 암기가 아니라 운영 데이터 구조를 깔끔하게 만드는 도구입니다. 티켓 로그를 집계하고, 누락 키 오류를 잡고, 최근 이벤트와 설정 우선순위를 함께 검증합니다.\r
\r
    변주 실험\r
    최근 3개가 아니라 최근 5개 상태를 기준으로 에러율을 계산하고, 경보 기준을 50%에서 40%로 낮췄을 때 경보 횟수가 어떻게 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 최근 3개가 아니라 최근 5개 상태를 기준으로 에러율을 계산하고, 경보 기준을 50%에서 40%로 낮췄을 때 경보 횟수가 어떻게 달라지는지 비교하세요.\r
  snippet: |-\r
    ticketRows = [\r
        {"ticketId": "T-101", "owner": "min", "category": "bug", "priority": "high"},\r
        {"ticketId": "T-102", "owner": "seo", "category": "billing", "priority": "medium"},\r
        {"ticketId": "T-103", "owner": "min", "category": "bug", "priority": "low"},\r
        {"ticketId": "T-104", "owner": "jin", "category": "feature", "priority": "medium"},\r
        {"ticketId": "T-105", "owner": "seo", "category": "bug", "priority": "high"},\r
    ]\r
\r
    def summarizeTickets(rows):\r
        categoryCounts = Counter(row["category"] for row in rows)\r
        priorityCounts = Counter(row["priority"] for row in rows)\r
        ticketsByOwner = defaultdict(list)\r
\r
        for row in rows:\r
            ticketsByOwner[row["owner"]].append(row["ticketId"])\r
\r
        return {\r
            "categoryCounts": categoryCounts,\r
            "priorityCounts": priorityCounts,\r
            "ticketsByOwner": dict(ticketsByOwner),\r
            "topCategory": categoryCounts.most_common(1)[0],\r
        }\r
\r
    ticketSummary = summarizeTickets(ticketRows)\r
\r
    assert ticketSummary["categoryCounts"]["bug"] == 3\r
    assert ticketSummary["priorityCounts"]["high"] == 2\r
    assert ticketSummary["ticketsByOwner"]["min"] == ["T-101", "T-103"]\r
    assert ticketSummary["topCategory"] == ("bug", 3)\r
\r
    ticketSummary\r
  exercise:\r
    prompt: '검증 루프: 티켓 운영 집계 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      ticketRows = [\r
          {"ticketId": "T-101", "owner": "min", "category": "bug", "priority": "high"},\r
          {"ticketId": "T-102", "owner": "seo", "category": "billing", "priority": "medium"},\r
          {"ticketId": "T-103", "owner": "min", "category": "bug", "priority": "low"},\r
          {"ticketId": "T-104", "owner": "jin", "category": "feature", "priority": "medium"},\r
          {"ticketId": "T-105", "owner": "seo", "category": "bug", "priority": "high"},\r
      ]\r
\r
      def summarizeTickets(rows):\r
          categoryCounts = Counter(row["category"] for row in rows)\r
          priorityCounts = Counter(row["priority"] for row in rows)\r
          ticketsByOwner = defaultdict(list)\r
\r
          for row in rows:\r
              ticketsByOwner[row["owner"]].append(row["ticketId"])\r
\r
          return {\r
              "categoryCounts": categoryCounts,\r
              "priorityCounts": priorityCounts,\r
              "ticketsByOwner": dict(ticketsByOwner),\r
              "topCategory": categoryCounts.most_common(1)[0],\r
          }\r
\r
      ticketSummary = summarizeTickets(ticketRows)\r
\r
      assert ticketSummary["categoryCounts"]["bug"] == 3\r
      assert ticketSummary["priorityCounts"]["high"] == 2\r
      assert ticketSummary["ticketsByOwner"]["min"] == ["T-101", "T-103"]\r
      assert ticketSummary["topCategory"] == ("bug", 3)\r
\r
      ticketSummary\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 티켓 운영 집계의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 티켓 운영 집계 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: collections 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 특수 컨테이너 마스터하기\r
  goal: collections 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: collections 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    items = ['a', 'b', 'a', 'c', 'b', 'a']\r
    itemCount = Counter(items)\r
    itemCount\r
  exercise:\r
    prompt: collections 모듈 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      items = ['a', 'b', 'a', 'c', 'b', 'a']\r
      itemCount = Counter(items)\r
      itemCount\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:
    type: noError
    noError: collections 모듈 종합 복습에서 \`items\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: collections 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 05_collections-ticket-backlog-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - counter
    - workflow_validation
    - practice
    title: 티켓 상태와 우선순위 집계하기
    subtitle: Counter 결과를 검증 가능한 dict로 반환
    goal: 티켓 행 목록에서 상태별 개수, 우선순위별 개수, 최다 상태를 계산해 반환한다.
    why: Counter는 눈으로 확인하는 표가 아니라 운영 상태를 다음 판단에 넘기는 집계 결과를 만들어야 쓸모가 생깁니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 티켓 목록으로 다시 호출합니다.
    tips:
    - Counter 결과는 dict로 바꿔 반환하고, 키 순서를 안정적으로 만들려면 sorted를 사용하세요.
    - most_common(1)은 가장 많이 등장한 상태와 개수를 한 쌍으로 돌려줍니다.
    exercise:
      prompt: summarize_ticket_backlog(rows)가 total, statusCounts, priorityCounts, topStatus를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_ticket_backlog(rows):
            raise NotImplementedError
      solution: |-
        from collections import Counter

        def summarize_ticket_backlog(rows):
            status_counts = Counter(row["status"] for row in rows)
            priority_counts = Counter(row["priority"] for row in rows)
            return {
                "total": len(rows),
                "statusCounts": dict(sorted(status_counts.items())),
                "priorityCounts": dict(sorted(priority_counts.items())),
                "topStatus": list(status_counts.most_common(1)[0]),
            }
      hints:
      - status와 priority는 서로 다른 Counter로 세야 합니다.
      - topStatus는 이름과 개수를 모두 담아야 합니다.
    check:
      id: python.builtins.collections.ticket-backlog.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.collections.ticket-backlog.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_ticket_backlog
        cases:
        - id: mixed-statuses
          arguments:
          - value:
            - ticketId: T-1
              status: open
              priority: high
            - ticketId: T-2
              status: done
              priority: medium
            - ticketId: T-3
              status: open
              priority: low
            - ticketId: T-4
              status: blocked
              priority: high
          expectedReturn:
            total: 4
            statusCounts:
              blocked: 1
              done: 1
              open: 2
            priorityCounts:
              high: 2
              low: 1
              medium: 1
            topStatus:
            - open
            - 2
        - id: review-heavy
          arguments:
          - value:
            - ticketId: A-1
              status: review
              priority: low
            - ticketId: A-2
              status: review
              priority: low
            - ticketId: A-3
              status: open
              priority: high
            - ticketId: A-4
              status: review
              priority: medium
            - ticketId: A-5
              status: open
              priority: high
          expectedReturn:
            total: 5
            statusCounts:
              open: 2
              review: 3
            priorityCounts:
              high: 2
              low: 2
              medium: 1
            topStatus:
            - review
            - 3
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 05_collections-owner-rollup-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 05_collections-ticket-backlog-mastery
    title: 담당자별 티켓 묶음과 점수 합계 만들기
    subtitle: defaultdict를 다른 운영 데이터에 적용
    goal: 담당자별 티켓 목록과 포인트 합계를 누락 키 초기화 없이 계산한다.
    why: 집계 코드는 새 담당자가 등장할 때마다 if 문을 늘리는 방식보다 기본값 컨테이너로 구조를 먼저 세우는 편이 안전합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 데이터가 아니라 반환 계약을 기준으로 작성하세요.
    tips:
    - tickets_by_owner는 defaultdict(list), points_by_owner는 defaultdict(int)가 어울립니다.
    - 반환 dict의 owner 순서를 안정화하면 검증 결과를 읽기 쉽습니다.
    exercise:
      prompt: build_owner_rollup(rows)가 owner별 tickets와 points를 담은 중첩 dict를 반환하도록 완성하세요.
      starterCode: |-
        def build_owner_rollup(rows):
            raise NotImplementedError
      solution: |-
        from collections import defaultdict

        def build_owner_rollup(rows):
            tickets_by_owner = defaultdict(list)
            points_by_owner = defaultdict(int)
            for row in rows:
                owner = row["owner"]
                tickets_by_owner[owner].append(row["ticketId"])
                points_by_owner[owner] += int(row["points"])
            return {
                owner: {"tickets": tickets_by_owner[owner], "points": points_by_owner[owner]}
                for owner in sorted(tickets_by_owner)
            }
      hints:
      - 같은 owner가 여러 번 나오면 tickets에는 순서대로 추가하고 points는 누적하세요.
      - defaultdict를 dict처럼 반환해도 JSON 가능한 기본 타입만 담기면 검증할 수 있습니다.
    check:
      id: python.builtins.collections.owner-rollup.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.collections.owner-rollup.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: build_owner_rollup
        cases:
        - id: two-owners
          arguments:
          - value:
            - ticketId: T-101
              owner: min
              points: 3
            - ticketId: T-102
              owner: seo
              points: 5
            - ticketId: T-103
              owner: min
              points: 8
          expectedReturn:
            min:
              tickets:
              - T-101
              - T-103
              points: 11
            seo:
              tickets:
              - T-102
              points: 5
        - id: sorted-owners
          arguments:
          - value:
            - ticketId: B-1
              owner: jin
              points: 2
            - ticketId: B-2
              owner: ari
              points: 7
            - ticketId: B-3
              owner: jin
              points: 4
            - ticketId: B-4
              owner: ari
              points: 1
          expectedReturn:
            ari:
              tickets:
              - B-2
              - B-4
              points: 8
            jin:
              tickets:
              - B-1
              - B-3
              points: 6
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 05_collections-recent-statuses-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 05_collections-ticket-backlog-mastery
    title: 최근 상태 창 다시 구성하기
    subtitle: deque와 Counter를 하루 뒤 재사용
    goal: 이벤트 목록에서 최근 N개 상태만 유지하고 상태별 개수와 error 비율을 계산한다.
    why: 스트림 처리와 모니터링에서는 전체 로그보다 최근 창을 정확히 유지하는 능력이 더 중요합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. deque(maxlen)과 Counter 흐름을 예시 없이 복원하세요.
    tips:
    - deque(maxlen=window_size)는 새 항목이 들어오면 오래된 항목을 자동 제거합니다.
    - window_size가 0 이하이면 잘못된 설정이므로 ValueError를 일으키세요.
    exercise:
      prompt: summarize_recent_statuses(events, window_size)가 windowSize, recent, statusCounts, errorRate를 반환하고 잘못된 window_size는 거부하도록 완성하세요.
      starterCode: |-
        def summarize_recent_statuses(events, window_size):
            raise NotImplementedError
      solution: |-
        from collections import Counter, deque

        def summarize_recent_statuses(events, window_size):
            if window_size <= 0:
                raise ValueError("window_size must be positive")
            recent = deque(maxlen=window_size)
            for event in events:
                recent.append(event["status"])
            counts = Counter(recent)
            error_count = counts["error"]
            return {
                "windowSize": window_size,
                "recent": list(recent),
                "statusCounts": dict(sorted(counts.items())),
                "errorRate": round(error_count / len(recent), 2) if recent else 0,
            }
      hints:
      - recent에는 전체 events가 아니라 마지막 window_size개 상태만 남아야 합니다.
      - Counter에서 없는 키를 읽으면 0이므로 error가 없는 경우도 안전합니다.
    check:
      id: python.builtins.collections.recent-statuses.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.collections.recent-statuses.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_recent_statuses
        cases:
        - id: trimmed-window
          arguments:
          - value:
            - status: ok
            - status: error
            - status: ok
            - status: error
            - status: error
          - value: 3
          expectedReturn:
            windowSize: 3
            recent:
            - ok
            - error
            - error
            statusCounts:
              error: 2
              ok: 1
            errorRate: 0.67
        - id: window-larger-than-events
          arguments:
          - value:
            - status: ok
            - status: ok
            - status: warn
            - status: error
          - value: 5
          expectedReturn:
            windowSize: 5
            recent:
            - ok
            - ok
            - warn
            - error
            statusCounts:
              error: 1
              ok: 2
              warn: 1
            errorRate: 0.25
        - id: rejects-empty-window
          arguments:
          - value:
            - status: ok
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};