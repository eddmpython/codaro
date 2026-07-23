var e=`meta:
  id: '13'
  title: collections 심화
  day: 13
  category: advancedPython
  tags:
  - namedtuple
  - defaultdict
  - Counter
  - deque
  - ChainMap
  - 검증
  - 자료구조선택
  seo:
    title: 파이썬 collections 모듈 완벽 가이드 - 특수 자료구조
    description: collections 모듈을 마스터합니다. namedtuple, defaultdict, Counter, deque, OrderedDict, ChainMap
      완벽 이해.
    keywords:
    - namedtuple
    - defaultdict
    - Counter
    - deque
    - ChainMap
intro:
  emoji: 📚
  points:
  - namedtuple로 이름 있는 튜플
  - defaultdict로 KeyError 없는 딕셔너리
  - Counter로 빈도 계산
  - deque로 양방향 큐
  direction: collections 심화에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - collections 심화 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: namedtuple 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: defaultdict 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: Counter 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: collections 심화 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: collections 심화 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: collections 심화 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: namedtuple
  title: namedtuple
  structuredPrimary: true
  subtitle: 이름 있는 튜플
  goal: namedtuple에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    namedtuple은 인덱스 대신 이름으로 요소에 접근할 수 있는 튜플입니다. 일반 튜플처럼 불변(immutable)이고 해시 가능합니다. 메모리 효율적이며 일반 클래스보다 가볍습니다. _fields, _asdict(), _replace() 등 유용한 메서드를 제공합니다. 간단한 데이터 구조에 적합하며, 더 복잡한 경우 dataclass를 사용합니다. Python 3.6+에서는 typing.NamedTuple로 타입 힌트를 추가할 수 있습니다.

    namedtuple은 CSV 행이나 데이터베이스 레코드를 표현할 때 유용합니다.
  snippet: |-
    from collections import namedtuple

    Point = namedtuple('Point', ['x', 'y'])
    pt = Point(3, 4)
    pt.x, pt.y, pt[0], pt[1]
  exercise:
    prompt: namedtuple 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from collections import namedtuple

      Point = namedtuple('Point', ['x', 'y'])
      pt = Point(3, 4)
      pt.x, pt.y, pt[0], pt[1]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: namedtuple에서 \`Point\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: namedtuple 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: defaultdict
  title: defaultdict
  structuredPrimary: true
  subtitle: 기본값 딕셔너리
  goal: defaultdict에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    defaultdict는 존재하지 않는 키에 접근할 때 자동으로 기본값을 생성합니다. 생성자에 팩토리 함수를 전달합니다. list, int, set 등을 팩토리로 자주 사용합니다. 그룹화, 카운팅, 집계 등의 패턴에서 if 키 존재 검사를 제거합니다. 일반 딕셔너리처럼 모든 메서드를 사용할 수 있습니다. 중첩 defaultdict로 다차원 구조도 만들 수 있습니다.

    defaultdict(lambda: '기본값')처럼 람다로 커스텀 기본값을 만들 수 있습니다.
  snippet: |-
    from collections import defaultdict

    words = ['apple', 'banana', 'apricot', 'blueberry', 'cherry']
    grouped = defaultdict(list)

    for word in words:
        grouped[word[0]].append(word)

    dict(grouped)
  exercise:
    prompt: defaultdict 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      from collections import defaultdict

      words = ['apple', 'banana', 'apricot', 'blueberry', 'cherry']
      grouped = defaultdict(list)

      for word in words:
          grouped[word[0]].append(word)

      dict(grouped)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: defaultdict의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: defaultdict 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: counter
  title: Counter
  structuredPrimary: true
  subtitle: 빈도 계산
  goal: Counter에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Counter는 해시 가능한 객체의 개수를 세는 특수 딕셔너리입니다. iterable을 전달하면 자동으로 빈도를 계산합니다. most_common(n)으로 가장 흔한 n개를 가져옵니다. Counter끼리 +, -, &, | 연산이 가능합니다. elements()로 개수만큼 요소를 반복합니다. 텍스트 분석, 투표 집계 등에 유용합니다.

    Counter()는 빈 카운터, Counter(a=1, b=2)는 직접 지정도 가능합니다.
  snippet: |-
    from collections import Counter

    text = "abracadabra"
    counts = Counter(text)
    counts, counts.most_common(3)
  exercise:
    prompt: Counter 예제에서 \`text\`, \`counts\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      from collections import Counter

      text = "abracadabra"
      counts = Counter(text)
      counts, counts.most_common(3)
    hints:
    - 바꿀 지점은 \`text = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: Counter에서 \`text\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: Counter 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: deque
  title: deque
  structuredPrimary: true
  subtitle: 양방향 큐
  goal: deque에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    deque(double-ended queue)는 양 끝에서 O(1) 시간에 추가/삭제가 가능합니다. 리스트의 왼쪽 삽입/삭제는 O(n)이지만 deque는 O(1)입니다. maxlen을 지정하면 고정 크기 버퍼로 동작합니다. rotate(n)으로 요소를 회전할 수 있습니다. 큐, 스택, 슬라이딩 윈도우 등에 사용합니다. appendleft, popleft, extendleft 등 왼쪽 연산을 지원합니다.

    deque는 스레드 안전한 append와 popleft를 제공합니다.
  snippet: |-
    from collections import deque

    queue = deque([1, 2, 3])
    queue.append(4)
    queue.appendleft(0)
    queue.pop(), queue.popleft(), list(queue)
  exercise:
    prompt: deque 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from collections import deque

      queue = deque([1, 2, 3])
      queue.append(4)
      queue.appendleft(0)
      queue.pop(), queue.popleft(), list(queue)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: deque에서 \`queue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: deque 실행 뒤 \`queue\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: ordereddict
  title: OrderedDict
  structuredPrimary: true
  subtitle: 순서 보장 딕셔너리
  goal: OrderedDict에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    OrderedDict는 삽입 순서를 보장하는 딕셔너리입니다. Python 3.7+에서 일반 dict도 순서를 보장하지만, OrderedDict는 추가 기능이 있습니다. move_to_end()로 요소를 끝으로 이동할 수 있습니다. 순서까지 고려하여 동등성을 비교합니다. popitem(last=False)로 첫 번째 항목을 제거할 수 있습니다. LRU 캐시 구현 등에 유용합니다.

    일반적인 경우 Python 3.7+ dict로 충분하며, 특수 기능이 필요할 때 OrderedDict를 사용합니다.
  snippet: |-
    from collections import OrderedDict

    od = OrderedDict()
    od['a'] = 1
    od['b'] = 2
    od['c'] = 3
    list(od.items())
  exercise:
    prompt: OrderedDict 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from collections import OrderedDict

      od = OrderedDict()
      od['a'] = 1
      od['b'] = 2
      od['c'] = 3
      list(od.items())
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: OrderedDict에서 \`od\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: OrderedDict 실행 뒤 \`od\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: chainmap
  title: ChainMap
  structuredPrimary: true
  subtitle: 딕셔너리 체인
  goal: ChainMap으로 기본값/사용자 설정/환경변수 세 단계 dict를 합쳐 한 객체처럼 조회하고, 쓰기는 첫 번째 dict에만 적용됨을 확인합니다.
  why: 설정 우선순위(환경변수 > 사용자 > 기본값)는 보통 dict 병합으로 풀지만, 그러면 원본이 사라집니다. ChainMap은 원본 dict를 그대로 두면서 논리적 합본을 만들어 줘 디버깅이 쉬워집니다.
  explanation: |-
    ChainMap은 여러 딕셔너리를 하나처럼 연결합니다. 키 검색은 첫 번째 딕셔너리부터 순서대로 진행됩니다. 쓰기 작업은 첫 번째 딕셔너리에만 적용됩니다. 설정 계층(기본값 → 사용자 설정 → 환경변수)에 유용합니다. new_child()로 새 계층을 추가할 수 있습니다. maps 속성으로 원본 딕셔너리 리스트에 접근합니다.

    ChainMap은 복사 없이 여러 딕셔너리를 논리적으로 합칩니다.
  snippet: |-
    from collections import ChainMap

    defaults = {'theme': 'light', 'language': 'en'}
    userSettings = {'theme': 'dark'}

    config = ChainMap(userSettings, defaults)
    config['theme'], config['language']
  exercise:
    prompt: ChainMap 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      from collections import ChainMap

      defaults = {'theme': 'light', 'language': 'en'}
      userSettings = {'theme': 'dark'}

      config = ChainMap(userSettings, defaults)
      config['theme'], config['language']
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: ChainMap의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: ChainMap의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 지원 티켓 큐 정리하기'
  structuredPrimary: true
  subtitle: namedtuple, defaultdict, Counter, deque, ChainMap을 하나의 운영 흐름으로 묶습니다
  goal: '현업 흐름 검증: 지원 티켓 큐 정리하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    collections는 암기할 모듈이 아니라 문제에 맞는 자료구조를 고르는 연습입니다. 지원 티켓을 분류하고, 우선순위 큐를 만들고, 설정 우선순위를 합치며 각 선택이 왜 필요한지 확인하세요.

    변주 실험
    우선순위가 같을 때 생성 순서를 유지해야 한다면 정렬 키를 바꾸고, \`deque.appendleft()\`로 긴급 티켓을 끼워 넣는 테스트를 추가하세요.
  tips:
  - 변주 실험 우선순위가 같을 때 생성 순서를 유지해야 한다면 정렬 키를 바꾸고, \`deque.appendleft()\`로 긴급 티켓을 끼워 넣는 테스트를 추가하세요.
  snippet: |-
    from collections import ChainMap, Counter, defaultdict, deque, namedtuple

    Ticket = namedtuple("Ticket", ["id", "category", "priority"])

    tickets = [
        Ticket("T-1", "payment", 2),
        Ticket("T-2", "login", 1),
        Ticket("T-3", "payment", 3),
        Ticket("T-4", "report", 2),
    ]

    byCategory: defaultdict[str, list[Ticket]] = defaultdict(list)
    for ticket in tickets:
        byCategory[ticket.category].append(ticket)

    categoryCounts = Counter(ticket.category for ticket in tickets)
    workQueue = deque(sorted(tickets, key=lambda ticket: ticket.priority, reverse=True))

    defaults = {"slaHours": 24, "assignee": "support"}
    paymentOverride = {"slaHours": 4}
    config = ChainMap(paymentOverride, defaults)

    firstTicket = workQueue.popleft()

    assert [ticket.id for ticket in byCategory["payment"]] == ["T-1", "T-3"]
    assert categoryCounts.most_common(1) == [("payment", 2)]
    assert firstTicket.id == "T-3"
    assert config["slaHours"] == 4
    assert config["assignee"] == "support"
  exercise:
    prompt: '현업 흐름 검증: 지원 티켓 큐 정리하기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.'
    starterCode: |-
      from collections import ChainMap, Counter, defaultdict, deque, namedtuple

      Ticket = namedtuple("Ticket", ["id", "category", "priority"])

      tickets = [
          Ticket("T-1", "payment", 2),
          Ticket("T-2", "login", 1),
          Ticket("T-3", "payment", 3),
          Ticket("T-4", "report", 2),
      ]

      byCategory: defaultdict[str, list[Ticket]] = defaultdict(list)
      for ticket in tickets:
          byCategory[ticket.category].append(ticket)

      categoryCounts = Counter(ticket.category for ticket in tickets)
      workQueue = deque(sorted(tickets, key=lambda ticket: ticket.priority, reverse=True))

      defaults = {"slaHours": 24, "assignee": "support"}
      paymentOverride = {"slaHours": 4}
      config = ChainMap(paymentOverride, defaults)

      firstTicket = workQueue.popleft()

      assert [ticket.id for ticket in byCategory["payment"]] == ["T-1", "T-3"]
      assert categoryCounts.most_common(1) == [("payment", 2)]
      assert firstTicket.id == "T-3"
      assert config["slaHours"] == 4
      assert config["assignee"] == "support"
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: '현업 흐름 검증: 지원 티켓 큐 정리하기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.'
    resultCheck: '현업 흐름 검증: 지원 티켓 큐 정리하기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: collections 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 13에서 배운 collections 모듈을 난이도별로 복습합니다. collections는 내장 자료구조를 확장한 특수 컨테이너를 제공하는 표준 라이브러리입니다.
    namedtuple로 이름 있는 튜플, defaultdict로 기본값 딕셔너리, Counter로 빈도 계산, deque로 양방향 큐를 구현합니다. 🟢 기본 문제로 각 자료구조의
    기본 사용법을 익히고, 🟡 응용 문제로 중첩 defaultdict, Counter 연산을 연습하세요. 🔴 심화 문제에서는 LRU 캐시, 슬라이딩 윈도우, 복합 자료구조 등 실무
    패턴을 다룹니다. 적절한 자료구조 선택은 코드 가독성과 성능 모두에 큰 영향을 미칩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from collections import namedtuple

    Color = namedtuple('Color', ['r', 'g', 'b'])
    red = Color(255, 0, 0)
    red.r, red.g, red.b
  exercise:
    prompt: 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from collections import namedtuple

      Color = namedtuple('Color', ['r', 'g', 'b'])
      red = Color(255, 0, 0)
      red.r, red.g, red.b
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 종합 복습에서 \`Color\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 13_advanced_collections-ticket-queue-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - namedtuple
    - defaultdict
    - counter
    - deque
    - chainmap
    - workflow_validation
    title: collections 자료구조로 지원 티켓 분류와 우선순위 큐 만들기
    subtitle: support ticket queue
    goal: 티켓 dict 목록과 설정 override를 받아 카테고리 그룹, 빈도, 우선순위 첫 티켓, SLA 설정을 반환한다.
    why: collections는 외울 모듈이 아니라 namedtuple, defaultdict, Counter, deque, ChainMap 중 문제에 맞는 자료구조를 선택하는 훈련입니다.
    explanation: summarize_ticket_queue(ticket_rows, overrides)를 완성해 티켓을 이름 있는 레코드로 만들고 카테고리별 그룹, 빈도, 큐, 설정 우선순위를 검증하세요.
    tips:
    - defaultdict(list)는 카테고리별 append에서 키 존재 검사를 없앱니다.
    - ChainMap은 override를 첫 번째 dict로 두어야 설정 우선순위가 맞습니다.
    exercise:
      prompt: summarize_ticket_queue(ticket_rows, overrides)를 완성해 byCategory, topCategory, firstTicket, slaHours, remainingQueue를
        반환하세요.
      starterCode: |-
        def summarize_ticket_queue(ticket_rows, overrides):
            raise NotImplementedError
      solution: |-
        def summarize_ticket_queue(ticket_rows, overrides):
            from collections import ChainMap, Counter, defaultdict, deque, namedtuple

            Ticket = namedtuple("Ticket", ["id", "category", "priority"])
            tickets = [Ticket(row["id"], row["category"], row["priority"]) for row in ticket_rows]

            by_category = defaultdict(list)
            for ticket in tickets:
                by_category[ticket.category].append(ticket.id)

            category_counts = Counter(ticket.category for ticket in tickets)
            queue = deque(sorted(tickets, key=lambda ticket: ticket.priority, reverse=True))
            defaults = {"slaHours": 24, "assignee": "support"}
            config = ChainMap(dict(overrides), defaults)
            first_ticket = queue.popleft()

            return {
                "byCategory": {key: value for key, value in sorted(by_category.items())},
                "topCategory": category_counts.most_common(1)[0],
                "firstTicket": first_ticket.id,
                "slaHours": config["slaHours"],
                "remainingQueue": [ticket.id for ticket in queue],
            }
      hints:
      - namedtuple은 id, category, priority를 이름으로 읽게 해줍니다.
      - deque.popleft()는 다음 처리 티켓을 큐 왼쪽에서 꺼냅니다.
    check:
      id: python.advanced.collections.ticket-queue.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.collections.empty.behavior.v1.fixture
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
        entry: summarize_ticket_queue
        cases:
        - id: groups-counts-and-queues-tickets
          arguments:
          - value:
            - id: T-1
              category: payment
              priority: 2
            - id: T-2
              category: login
              priority: 1
            - id: T-3
              category: payment
              priority: 3
            - id: T-4
              category: report
              priority: 2
          - value:
              slaHours: 4
          expectedReturn:
            byCategory:
              login:
              - T-2
              payment:
              - T-1
              - T-3
              report:
              - T-4
            topCategory:
            - payment
            - 2
            firstTicket: T-3
            slaHours: 4
            remainingQueue:
            - T-1
            - T-4
            - T-2
        - id: rejects-row-missing-priority
          arguments:
          - value:
            - id: T-1
              category: payment
          - value: {}
          expectedException: KeyError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 13_advanced_collections-sliding-window-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - deque
    - counter
    - ordereddict
    title: deque로 고정 길이 슬라이딩 윈도우 합계 만들기
    subtitle: bounded rolling window
    goal: 숫자 목록과 window size를 받아 각 단계의 window와 합계, 최종 window를 반환한다.
    why: 전이 과제에서는 티켓 큐 밖으로 collections를 옮겨, deque(maxlen)가 오래된 값을 자동으로 밀어내는 스트리밍 처리 감각을 확인합니다.
    explanation: compute_sliding_window(values, window_size)를 완성해 window_size가 찬 뒤부터 각 윈도우의 합계를 기록하세요.
    tips:
    - window_size가 0 이하이면 ValueError로 막으세요.
    - deque(maxlen=window_size)는 새 값이 들어올 때 가장 오래된 값을 자동 제거합니다.
    exercise:
      prompt: compute_sliding_window(values, window_size)를 완성해 windows, totals, finalWindow를 반환하세요.
      starterCode: |-
        def compute_sliding_window(values, window_size):
            raise NotImplementedError
      solution: |-
        def compute_sliding_window(values, window_size):
            from collections import deque

            if window_size <= 0:
                raise ValueError("window_size must be positive")
            window = deque(maxlen=window_size)
            windows = []
            totals = []
            for value in values:
                window.append(value)
                if len(window) == window_size:
                    snapshot = list(window)
                    windows.append(snapshot)
                    totals.append(sum(snapshot))
            return {
                "windows": windows,
                "totals": totals,
                "finalWindow": list(window),
            }
      hints:
      - len(window)가 window_size와 같을 때만 완성된 window입니다.
      - maxlen 때문에 직접 popleft를 호출하지 않아도 됩니다.
    check:
      id: python.advanced.collections.sliding-window.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.collections.empty.behavior.v1.fixture
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
        entry: compute_sliding_window
        cases:
        - id: computes-bounded-rolling-windows
          arguments:
          - value:
            - 4
            - 2
            - 7
            - 1
          - value: 3
          expectedReturn:
            windows:
            - - 4
              - 2
              - 7
            - - 2
              - 7
              - 1
            totals:
            - 13
            - 10
            finalWindow:
            - 2
            - 7
            - 1
        - id: rejects-invalid-window-size
          arguments:
          - value:
            - 1
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 13_advanced_collections-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 13_advanced_collections-sliding-window-transfer
    title: namedtuple, defaultdict, Counter, deque, ChainMap 선택 기준 회상하기
    subtitle: collections tool recall
    goal: 목적 이름을 받아 적절한 collections 자료구조와 핵심 장점을 반환한다.
    why: 시간이 지나도 남아야 할 지식은 모듈 목록보다, 그룹화·빈도·양방향 큐·설정 계층처럼 문제에 맞는 자료구조 선택 기준입니다.
    explanation: choose_collection_tool(goal)를 완성해 named-record, group-by-key, count-frequency, queue-both-ends, layered-config
      목적별 도구를 고르세요.
    tips:
    - defaultdict는 없는 키에 기본 컨테이너를 자동으로 만듭니다.
    - ChainMap은 원본 dict를 복사하지 않고 계층 조회를 제공합니다.
    exercise:
      prompt: choose_collection_tool(goal)를 완성해 목적별 collections 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_collection_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_collection_tool(goal):
            table = {
                "named-record": {
                    "tool": "namedtuple",
                    "advantage": "tuple storage with named fields",
                    "mutable": False,
                },
                "group-by-key": {
                    "tool": "defaultdict(list)",
                    "advantage": "append without checking whether the key exists",
                    "mutable": True,
                },
                "count-frequency": {
                    "tool": "Counter",
                    "advantage": "count hashable values and ask for most_common",
                    "mutable": True,
                },
                "queue-both-ends": {
                    "tool": "deque",
                    "advantage": "O(1) append and pop on both ends",
                    "mutable": True,
                },
                "layered-config": {
                    "tool": "ChainMap",
                    "advantage": "lookup through several dict layers without copying",
                    "mutable": True,
                },
            }
            if goal not in table:
                raise ValueError("unknown collections goal")
            return table[goal]
      hints:
      - 빈도는 Counter, 순차 처리 큐는 deque가 보통 먼저 떠올라야 합니다.
      - 설정 override는 ChainMap의 앞쪽 dict가 우선합니다.
    check:
      id: python.advanced.collections.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.collections.empty.behavior.v1.fixture
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
        entry: choose_collection_tool
        cases:
        - id: recalls-counter-for-frequency
          arguments:
          - value: count-frequency
          expectedReturn:
            tool: Counter
            advantage: count hashable values and ask for most_common
            mutable: true
        - id: recalls-chainmap-for-layered-config
          arguments:
          - value: layered-config
          expectedReturn:
            tool: ChainMap
            advantage: lookup through several dict layers without copying
            mutable: true
        - id: rejects-unknown-goal
          arguments:
          - value: sorted-table
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};