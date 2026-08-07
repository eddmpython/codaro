var e=`meta:
  id: 05_collections
  title: collections - 특수 컨테이너
  category: builtins
  tags:
  - collections
  - Counter
  - defaultdict
  - deque
  - namedtuple
  seo:
    title: 파이썬 collections 모듈 완전 정복
    description: collections 모듈의 Counter, defaultdict, deque, namedtuple 등 특수 컨테이너를 배웁니다.
    keywords:
    - collections
    - Counter
    - defaultdict
    - deque
    - namedtuple
    - 파이썬컬렉션
intro:
  emoji: 📦
  points:
  - Counter로 빈도 계산
  - defaultdict로 기본값 처리
  - deque로 양방향 큐 구현
  - namedtuple로 가독성 향상
  direction: collections 특수 컨테이너에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - collections 특수 컨테이너 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: collections 모듈 불 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: Counter 빈도 계산기 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: defaultdict 기본값 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: collections 특수 컨 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: collections 특수 컨 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: collections 특수 컨 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: collections 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: from collections import로 가져온 이름 하나를 직접 호출해 특수 컨테이너가 준비됐는지 확인한다.
  why: Counter, defaultdict, deque, namedtuple, ChainMap은 이름마다 하는 일이 완전히 다르므로 무엇을 가져왔는지가 곧 이 노트북에서 쓸 수 있는 도구 목록이며, 이 셀을 먼저 실행해야 아래 모든 예제가 같은 이름을 공유합니다.
  explanation: |-
    collections는 파이썬 표준 라이브러리입니다. dict와 list로 매번 손으로 쓰던 개수 세기, 기본값 초기화, 양쪽 끝 넣고 빼기, 필드에 이름 붙이기를 이미 만들어 둔 특수 컨테이너로 제공합니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 셀을 먼저 실행하면 아래 모든 예제에서 Counter, defaultdict, deque, namedtuple, ChainMap을 그대로 쓸 수 있습니다.
  snippet: |-
    from collections import Counter, defaultdict, deque, namedtuple, ChainMap

    # 모듈 로드 확인
    'collections 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: |-
      마지막 줄의 문장은 로드됐다고 주장할 뿐 가져온 이름을 하나도 쓰지 않습니다. 마지막 줄 'collections 모듈이 정상적으로 로드되었습니다'를 Counter('banana')로 바꿔 가져온 이름을 실제로 호출해 보세요. 첫 줄 import는 그대로 둡니다.

      Counter는 문자열을 글자 단위로 세고, 화면에는 평범한 dict가 아니라 클래스 이름이 앞에 붙은 Counter({'a': 3, 'n': 2, 'b': 1}) 형태로 나와야 합니다.
    starterCode: |-
      from collections import Counter, defaultdict, deque, namedtuple, ChainMap

      # 모듈 로드 확인
      'collections 모듈이 정상적으로 로드되었습니다'
    solution: |-
      from collections import Counter, defaultdict, deque, namedtuple, ChainMap

      # 모듈 로드 확인
      Counter('banana')
    hints:
    - 마지막 줄의 문자열을 지우고 그 자리에 Counter('banana') 를 씁니다. 괄호 안에 리스트가 아니라 문자열을 넣으면 글자 하나하나를 셉니다.
    - "정답 형태: Counter('banana')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "Counter({'a': 3, 'n': 2, 'b': 1})"
    resultCheck: "출력이 정확히 일치해야 합니다: Counter({'a': 3, 'n': 2, 'b': 1})"
- id: counter
  title: Counter - 빈도 계산기
  structuredPrimary: true
  subtitle: 요소의 개수 세기
  goal: 세어 둔 Counter에서 상위 두 개만 뽑고, 목록에 없는 키를 조회해 0이 돌아오는 것을 함께 확인한다.
  why: 집계 결과는 대개 "몇 개인가"보다 "무엇이 위인가"로 쓰이고, 없는 키를 dict처럼 조회하면 KeyError로 멈추는 자리에서 Counter는 0을 돌려주므로 등장한 적 없는 항목까지 if 분기 없이 계산에 넣을 수 있습니다.
  explanation: |-
    Counter는 요소의 등장 횟수를 세는 특수 딕셔너리입니다. most_common(n)은 많이 나온 순서대로 (값, 개수) 튜플을 n개 돌려주고, Counter끼리 더하거나 빼서 기간별 집계를 합칠 수도 있습니다. 투표 집계, 단어 빈도 분석, 로그 상태 집계가 대표적인 사용처입니다.

    화면에 보이는 Counter의 표시 순서는 삽입 순서가 아니라 많이 나온 순서입니다. 없는 키를 조회해도 KeyError 대신 0이 나오지만, 이때 키가 새로 만들어지지는 않습니다.
  snippet: |-
    fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
    fruitCount = Counter(fruits)
    fruitCount
  exercise:
    prompt: |-
      마지막 줄 fruitCount를 fruitCount.most_common(2), fruitCount['durian']로 바꾸세요. 앞의 두 줄은 그대로 둡니다.

      most_common은 Counter가 아니라 (이름, 개수) 튜플의 리스트를 돌려주고 목록에 없는 'durian'은 KeyError 대신 0이 되므로 ([('apple', 3), ('banana', 2)], 0)이 나와야 합니다.
    starterCode: |-
      fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
      fruitCount = Counter(fruits)
      fruitCount
    solution: |-
      fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
      fruitCount = Counter(fruits)
      fruitCount.most_common(2), fruitCount['durian']
    hints:
    - 마지막 줄 fruitCount 를 지우고 fruitCount.most_common(2), fruitCount['durian'] 를 씁니다. 쉼표로 이으면 두 값이 한 튜플로 함께 표시됩니다.
    - most_common(2) 는 cherry 를 버리는 것이 아니라 상위 두 개만 잘라서 보여 줍니다.
    - "정답 형태: fruitCount.most_common(2), fruitCount['durian']"
  check:
    type: outputExact
    evidence: practice
    outputExact: "([('apple', 3), ('banana', 2)], 0)"
    resultCheck: "출력이 정확히 일치해야 합니다: ([('apple', 3), ('banana', 2)], 0)"
- id: defaultdict
  title: defaultdict - 기본값 딕셔너리
  structuredPrimary: true
  subtitle: KeyError 없는 딕셔너리
  goal: 값을 더한 적 없는 키를 한 번 조회하는 것만으로 기본값 항목이 생기는 것을 defaultdict 자체 표시로 확인한다.
  why: defaultdict는 "키가 있나 확인하고 없으면 0으로 만들기" 두 줄을 지워 주는 대신 읽기만 해도 키가 생기는 부작용이 있어서, 집계에 넣은 적 없는 이름이 0으로 끼어들어 참여자 수가 부풀려지는 사고가 실제로 자주 납니다.
  explanation: |-
    defaultdict는 존재하지 않는 키에 접근할 때 기본 팩토리를 호출해 값을 자동으로 만들어 둡니다. int를 주면 0, list를 주면 빈 리스트, set을 주면 빈 집합에서 시작하므로 누적과 그룹화 코드에서 초기화 분기가 사라집니다.

    dict(scores)로 감싸면 평범한 dict로 보이지만 감싸지 않으면 어떤 팩토리를 쓰는지까지 함께 표시됩니다. 키를 만들지 않고 값만 확인하려면 대괄호 대신 scores.get('carol', 0)을 씁니다.
  snippet: |-
    scores = defaultdict(int)
    scores['alice'] += 10
    scores['bob'] += 5
    scores['alice'] += 3
    dict(scores)
  exercise:
    prompt: |-
      두 곳을 고치세요. scores['alice'] += 3 아래에 값을 더하지 않고 읽기만 하는 줄 scores['carol']을 추가하고, 마지막 줄 dict(scores)를 scores로 바꾸세요.

      carol은 점수를 받은 적이 없지만 조회하는 순간 0으로 만들어지고 dict()를 벗기면 기본 팩토리까지 함께 보이므로 defaultdict(<class 'int'>, {'alice': 13, 'bob': 5, 'carol': 0})이 나와야 합니다.
    starterCode: |-
      scores = defaultdict(int)
      scores['alice'] += 10
      scores['bob'] += 5
      scores['alice'] += 3
      dict(scores)
    solution: |-
      scores = defaultdict(int)
      scores['alice'] += 10
      scores['bob'] += 5
      scores['alice'] += 3
      scores['carol']
      scores
    hints:
    - scores['carol'] 한 줄을 대입 없이 그대로 씁니다. += 를 붙이지 않아도 읽는 순간 기본값 0 이 채워집니다.
    - 마지막 줄에서 dict( 와 ) 를 지워 scores 만 남기면 defaultdict(<class 'int'>, ...) 형태로 표시됩니다.
    - "정답 형태: scores['carol'] 을 추가하고 마지막 줄은 scores"
  check:
    type: outputExact
    evidence: practice
    outputExact: "defaultdict(<class 'int'>, {'alice': 13, 'bob': 5, 'carol': 0})"
    resultCheck: "출력이 정확히 일치해야 합니다: defaultdict(<class 'int'>, {'alice': 13, 'bob': 5, 'carol': 0})"
- id: deque
  title: deque - 양방향 큐
  structuredPrimary: true
  subtitle: 빠른 양쪽 끝 삽입/삭제
  goal: maxlen을 준 deque에 양쪽 끝으로 넣어 보고 반대쪽 항목이 조용히 밀려 나가는 것을 확인한다.
  why: 최근 N건만 들고 가는 로그 창이나 이동 평균을 리스트로 만들면 넣을 때마다 앞을 잘라내는 코드를 직접 써야 하는데, maxlen을 준 deque는 넣기만 해도 길이가 유지되어 잘라내는 코드와 그 코드의 off-by-one 버그가 통째로 사라집니다.
  explanation: |-
    deque는 양쪽 끝에서 빠르게 넣고 뺄 수 있는 자료구조입니다. append와 pop은 오른쪽, appendleft와 popleft는 왼쪽에서 동작하며, 리스트의 insert(0, x)나 pop(0)처럼 전체를 밀어내지 않습니다.

    maxlen을 주면 길이가 고정됩니다. 이때 넘치는 항목은 넣은 쪽의 반대편에서 조용히 빠지고 예외는 나지 않으므로, 무엇이 사라졌는지는 코드가 아니라 결과를 보고 확인해야 합니다.
  snippet: |-
    dq = deque([1, 2, 3])
    dq.append(4)
    dq.appendleft(0)
    list(dq)
  exercise:
    prompt: |-
      두 곳을 고치세요. 첫 줄 deque([1, 2, 3])을 deque([1, 2, 3], maxlen=3)으로 바꾸고, 마지막 줄 list(dq)를 dq로 바꾸세요.

      길이가 3으로 묶이면 append(4)가 왼쪽 끝 1을 밀어내고 이어지는 appendleft(0)이 오른쪽 끝 4를 밀어내며, list()를 벗기면 maxlen까지 함께 표시되므로 deque([0, 2, 3], maxlen=3)이 나와야 합니다.
    starterCode: |-
      dq = deque([1, 2, 3])
      dq.append(4)
      dq.appendleft(0)
      list(dq)
    solution: |-
      dq = deque([1, 2, 3], maxlen=3)
      dq.append(4)
      dq.appendleft(0)
      dq
    hints:
    - deque([1, 2, 3]) 의 닫는 괄호 앞에 , maxlen=3 을 붙입니다. 그다음 마지막 줄에서 list( 와 ) 를 지웁니다.
    - 넣은 쪽의 반대편이 빠집니다. append(4) 로 1 이 나가고 appendleft(0) 으로 방금 들어온 4 가 다시 나갑니다.
    - "정답 형태: dq = deque([1, 2, 3], maxlen=3) 이고 마지막 줄은 dq"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'deque([0, 2, 3], maxlen=3)'
    resultCheck: "출력이 정확히 일치해야 합니다: 'deque([0, 2, 3], maxlen=3)'"
- id: namedtuple
  title: namedtuple - 이름있는 튜플
  structuredPrimary: true
  subtitle: 가독성 높은 불변 데이터
  goal: 필드를 하나 늘린 namedtuple을 만들고 _replace로 값 하나만 바꾼 새 객체를 받아 본다.
  why: namedtuple은 값을 바꿀 수 없어서 여러 함수에 넘겨도 중간에 훼손되지 않는 대신, 수정이 필요할 때는 원본을 고치는 것이 아니라 새 객체를 받아야 하고 이 규칙을 모르면 p.y = 10처럼 쓰다가 AttributeError를 만납니다.
  explanation: |-
    namedtuple은 필드 이름으로 접근할 수 있는 튜플입니다. row[2] 대신 row.label로 읽을 수 있어 의미가 코드에 남고, 튜플이라 그대로 언패킹하거나 dict의 키로도 쓸 수 있습니다.

    값을 바꾸려면 _replace(필드=값)를 씁니다. 원본은 그대로 남고 바뀐 값을 가진 새 객체가 돌아오므로, 반환값을 받지 않으면 아무 일도 일어나지 않습니다.
  snippet: |-
    Point = namedtuple('Point', ['x', 'y'])
    p = Point(3, 4)
    p.x, p.y
  exercise:
    prompt: |-
      세 곳을 고치세요. 필드 목록 ['x', 'y']를 ['x', 'y', 'label']로 바꾸고, p = Point(3, 4)를 p = Point(3, 4, 'origin')으로 바꾸고, 마지막 줄 p.x, p.y를 p._replace(y=10)으로 바꾸세요.

      _replace는 p를 고치는 것이 아니라 y만 바뀐 새 객체를 돌려주고 namedtuple은 필드 이름까지 함께 표시되므로 Point(x=3, y=10, label='origin')이 나와야 합니다.
    starterCode: |-
      Point = namedtuple('Point', ['x', 'y'])
      p = Point(3, 4)
      p.x, p.y
    solution: |-
      Point = namedtuple('Point', ['x', 'y', 'label'])
      p = Point(3, 4, 'origin')
      p._replace(y=10)
    hints:
    - 필드를 셋으로 늘리면 Point(...) 인자도 셋이어야 합니다. 'origin' 을 빼면 TypeError 가 납니다.
    - _replace 는 바꿀 필드만 키워드로 받습니다. x 와 label 은 쓰지 않아도 그대로 따라옵니다.
    - "정답 형태: p._replace(y=10)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "Point(x=3, y=10, label='origin')"
    resultCheck: "출력이 정확히 일치해야 합니다: Point(x=3, y=10, label='origin')"
- id: chainmap
  title: ChainMap - 딕셔너리 체인
  structuredPrimary: true
  subtitle: 여러 딕셔너리 통합 조회
  goal: ChainMap을 통해 값을 하나 쓴 뒤 원본 두 dict를 열어 어느 쪽이 바뀌었는지 확인한다.
  why: 설정은 기본값 위에 사용자 값을 얹어 읽되 기본값 쪽은 절대 오염되면 안 되는데, dict.update로 합치면 원본이 덮여 되돌릴 수 없는 반면 ChainMap은 쓰기를 항상 맨 앞 dict로만 보내 이 경계를 코드로 강제해 줍니다.
  explanation: |-
    ChainMap은 여러 딕셔너리를 복사 없이 하나의 뷰로 묶습니다. 값을 읽을 때는 맨 앞 dict부터 순서대로 찾아 처음 발견한 값을 돌려주므로 앞쪽이 우선순위가 높습니다.

    읽기는 여러 dict를 훑지만 쓰기와 삭제는 맨 앞 dict 하나에만 적용됩니다. 뒤쪽 기본값은 그대로 남아 있어 사용자 설정만 걷어내면 언제든 원래 상태로 돌아갈 수 있습니다.
  snippet: |-
    defaults = {'color': 'red', 'size': 10}
    custom = {'size': 20}
    combined = ChainMap(custom, defaults)
    combined['color'], combined['size']
  exercise:
    prompt: |-
      마지막 줄 combined['color'], combined['size']를 두 줄로 바꾸세요. 먼저 combined['color'] = 'blue'로 값을 쓰고, 다음 줄에 custom, defaults를 두어 원본 두 dict를 나란히 확인합니다.

      'color'는 원래 뒤쪽 defaults에만 있던 키지만 쓰기는 맨 앞 custom으로 가고 defaults의 'red'는 그대로 남으므로 ({'size': 20, 'color': 'blue'}, {'color': 'red', 'size': 10})이 나와야 합니다.
    starterCode: |-
      defaults = {'color': 'red', 'size': 10}
      custom = {'size': 20}
      combined = ChainMap(custom, defaults)
      combined['color'], combined['size']
    solution: |-
      defaults = {'color': 'red', 'size': 10}
      custom = {'size': 20}
      combined = ChainMap(custom, defaults)
      combined['color'] = 'blue'
      custom, defaults
    hints:
    - combined['color'] = 'blue' 는 defaults 를 고치지 않습니다. ChainMap 의 쓰기는 무조건 첫 번째 dict 로 갑니다.
    - 마지막 줄을 combined 로 두면 합쳐진 뷰만 보입니다. 원본이 어떻게 됐는지 보려면 custom, defaults 를 그대로 두 개 씁니다.
    - "정답 형태: combined['color'] = 'blue' 다음 줄에 custom, defaults"
  check:
    type: outputExact
    evidence: practice
    outputExact: "({'size': 20, 'color': 'blue'}, {'color': 'red', 'size': 10})"
    resultCheck: "출력이 정확히 일치해야 합니다: ({'size': 20, 'color': 'blue'}, {'color': 'red', 'size': 10})"
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: collections 실무 패턴
  goal: 최다 득표자와 표 수를 함께 꺼내 그 표가 과반을 넘겼는지까지 한 셀에서 판정한다.
  why: 1위와 과반은 다른 질문이라 most_common(1)만 보고 당선을 확정하면 세 표가 세 표를 이기지 못하는 판까지 승리로 기록하게 되고, 전체 표 수는 Counter.values()의 합으로 이미 손에 있으므로 판정 한 줄만 더 쓰면 됩니다.
  explanation: |-
    실무에서 Counter는 세는 것으로 끝나지 않고 그다음 판단으로 이어집니다. most_common(1)[0]은 (이름, 개수) 튜플이라 왼쪽에 이름 두 개를 두면 그대로 풀리고, sum(voteCount.values())는 원본 리스트를 다시 세지 않고 전체 개수를 돌려줍니다.

    과반 판정은 나눗셈 대신 곱셈으로 씁니다. winnerVotes / total > 0.5는 부동소수 오차가 끼지만 winnerVotes * 2 > total은 정수만으로 정확히 갈립니다.
  snippet: |-
    votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob', 'Alice']
    voteCount = Counter(votes)
    winner = voteCount.most_common(1)[0]
    winner
  exercise:
    prompt: |-
      세 곳을 고치세요. winner = voteCount.most_common(1)[0]을 winner, winnerVotes = voteCount.most_common(1)[0]으로 풀어 쓰고, 그 아래에 hasMajority = winnerVotes * 2 > sum(voteCount.values()) 줄을 추가하고, 마지막 줄 winner를 winner, winnerVotes, hasMajority로 바꾸세요.

      Alice가 여섯 표 중 세 표로 1위지만 3의 두 배는 6과 같아 과반을 넘지 못하므로 ('Alice', 3, False)가 나와야 합니다.
    starterCode: |-
      votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob', 'Alice']
      voteCount = Counter(votes)
      winner = voteCount.most_common(1)[0]
      winner
    solution: |-
      votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob', 'Alice']
      voteCount = Counter(votes)
      winner, winnerVotes = voteCount.most_common(1)[0]
      hasMajority = winnerVotes * 2 > sum(voteCount.values())
      winner, winnerVotes, hasMajority
    hints:
    - most_common(1)[0] 은 ('Alice', 3) 튜플이므로 왼쪽에 이름 두 개를 쉼표로 두면 그대로 풀립니다.
    - sum(voteCount.values()) 는 전체 표 수 6 입니다. len(voteCount) 는 후보 수 3 이라 과반 계산에 쓰면 안 됩니다.
    - "정답 형태: hasMajority = winnerVotes * 2 > sum(voteCount.values())"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('Alice', 3, False)"
    resultCheck: "출력이 정확히 일치해야 합니다: ('Alice', 3, False)"
- id: workflow_validation
  title: '검증 루프: 티켓 운영 집계'
  structuredPrimary: true
  subtitle: Counter, defaultdict, deque, ChainMap 조합
  goal: 경보 기준을 ChainMap 오버레이로 올리고 그 때문에 깨지는 assert를 새 기준에 맞춰 다시 통과시킨다.
  why: 집계 코드 자체는 맞는데 기준값 하나가 바뀌는 순간 판정이 조용히 뒤집히는 것이 운영 리포트의 전형적인 사고라, 기준을 바깥 설정으로 빼고 기대값을 assert로 박아 두면 기준을 만질 때 어디를 같이 고쳐야 하는지 실행이 먼저 알려 줍니다.
  explanation: |-
    이 셀은 네 컨테이너를 각자의 자리에 씁니다. Counter는 category를 세고, defaultdict(list)는 담당자별 티켓을 초기화 없이 모으고, maxlen을 준 deque는 최근 세 건만 남기고, ChainMap은 기본 설정 위에 운영 오버레이를 얹습니다.

    변주 실험
    recentTickets의 maxlen을 2로 줄이면 어떤 assert가 먼저 깨지는지, 그리고 그 assert의 기대값을 어떻게 고쳐야 하는지 확인하세요.
  tips:
  - 변주 실험 recentTickets의 maxlen을 2로 줄이면 어떤 assert가 먼저 깨지는지, 그리고 그 assert의 기대값을 어떻게 고쳐야 하는지 확인하세요.
  snippet: |-
    ticketRows = [
        {"ticketId": "T-101", "owner": "min", "category": "bug", "priority": "high"},
        {"ticketId": "T-102", "owner": "seo", "category": "billing", "priority": "medium"},
        {"ticketId": "T-103", "owner": "min", "category": "bug", "priority": "low"},
        {"ticketId": "T-104", "owner": "jin", "category": "feature", "priority": "medium"},
        {"ticketId": "T-105", "owner": "seo", "category": "bug", "priority": "high"},
    ]
    alertDefaults = {"channel": "email", "threshold": 2}
    alertOverrides = {"threshold": 3}
    alertConfig = ChainMap(alertOverrides, alertDefaults)

    def summarizeTickets(rows, config):
        categoryCounts = Counter(row["category"] for row in rows)
        ticketsByOwner = defaultdict(list)
        recentTickets = deque(maxlen=3)

        for row in rows:
            ticketsByOwner[row["owner"]].append(row["ticketId"])
            recentTickets.append(row["ticketId"])

        topCategory, topCount = categoryCounts.most_common(1)[0]
        return {
            "categoryCounts": dict(categoryCounts),
            "ticketsByOwner": dict(ticketsByOwner),
            "recentTickets": list(recentTickets),
            "topCategory": topCategory,
            "alert": topCount >= config["threshold"],
        }

    ticketSummary = summarizeTickets(ticketRows, alertConfig)

    assert ticketSummary["categoryCounts"]["bug"] == 3
    assert ticketSummary["ticketsByOwner"]["min"] == ["T-101", "T-103"]
    assert ticketSummary["recentTickets"] == ["T-103", "T-104", "T-105"]
    assert ticketSummary["alert"] is True

    ticketSummary
  exercise:
    prompt: |-
      두 곳을 고치세요. alertOverrides = {"threshold": 3}의 3을 4로 올리고, 마지막 assert 줄 ticketSummary["alert"] is True를 is False로 바꾸세요. ticketRows와 summarizeTickets 본문은 그대로 둡니다.

      가장 많은 category인 bug가 3건이라 기준을 4로 올리면 경보 조건 3 >= 4가 무너져 alert만 False로 뒤집히고 나머지 집계는 그대로이므로 마지막 줄이 아래 한 줄로 나와야 합니다.
      {'categoryCounts': {'bug': 3, 'billing': 1, 'feature': 1}, 'ticketsByOwner': {'min': ['T-101', 'T-103'], 'seo': ['T-102', 'T-105'], 'jin': ['T-104']}, 'recentTickets': ['T-103', 'T-104', 'T-105'], 'topCategory': 'bug', 'alert': False}
    starterCode: |-
      ticketRows = [
          {"ticketId": "T-101", "owner": "min", "category": "bug", "priority": "high"},
          {"ticketId": "T-102", "owner": "seo", "category": "billing", "priority": "medium"},
          {"ticketId": "T-103", "owner": "min", "category": "bug", "priority": "low"},
          {"ticketId": "T-104", "owner": "jin", "category": "feature", "priority": "medium"},
          {"ticketId": "T-105", "owner": "seo", "category": "bug", "priority": "high"},
      ]
      alertDefaults = {"channel": "email", "threshold": 2}
      alertOverrides = {"threshold": 3}
      alertConfig = ChainMap(alertOverrides, alertDefaults)

      def summarizeTickets(rows, config):
          categoryCounts = Counter(row["category"] for row in rows)
          ticketsByOwner = defaultdict(list)
          recentTickets = deque(maxlen=3)

          for row in rows:
              ticketsByOwner[row["owner"]].append(row["ticketId"])
              recentTickets.append(row["ticketId"])

          topCategory, topCount = categoryCounts.most_common(1)[0]
          return {
              "categoryCounts": dict(categoryCounts),
              "ticketsByOwner": dict(ticketsByOwner),
              "recentTickets": list(recentTickets),
              "topCategory": topCategory,
              "alert": topCount >= config["threshold"],
          }

      ticketSummary = summarizeTickets(ticketRows, alertConfig)

      assert ticketSummary["categoryCounts"]["bug"] == 3
      assert ticketSummary["ticketsByOwner"]["min"] == ["T-101", "T-103"]
      assert ticketSummary["recentTickets"] == ["T-103", "T-104", "T-105"]
      assert ticketSummary["alert"] is True

      ticketSummary
    solution: |-
      ticketRows = [
          {"ticketId": "T-101", "owner": "min", "category": "bug", "priority": "high"},
          {"ticketId": "T-102", "owner": "seo", "category": "billing", "priority": "medium"},
          {"ticketId": "T-103", "owner": "min", "category": "bug", "priority": "low"},
          {"ticketId": "T-104", "owner": "jin", "category": "feature", "priority": "medium"},
          {"ticketId": "T-105", "owner": "seo", "category": "bug", "priority": "high"},
      ]
      alertDefaults = {"channel": "email", "threshold": 2}
      alertOverrides = {"threshold": 4}
      alertConfig = ChainMap(alertOverrides, alertDefaults)

      def summarizeTickets(rows, config):
          categoryCounts = Counter(row["category"] for row in rows)
          ticketsByOwner = defaultdict(list)
          recentTickets = deque(maxlen=3)

          for row in rows:
              ticketsByOwner[row["owner"]].append(row["ticketId"])
              recentTickets.append(row["ticketId"])

          topCategory, topCount = categoryCounts.most_common(1)[0]
          return {
              "categoryCounts": dict(categoryCounts),
              "ticketsByOwner": dict(ticketsByOwner),
              "recentTickets": list(recentTickets),
              "topCategory": topCategory,
              "alert": topCount >= config["threshold"],
          }

      ticketSummary = summarizeTickets(ticketRows, alertConfig)

      assert ticketSummary["categoryCounts"]["bug"] == 3
      assert ticketSummary["ticketsByOwner"]["min"] == ["T-101", "T-103"]
      assert ticketSummary["recentTickets"] == ["T-103", "T-104", "T-105"]
      assert ticketSummary["alert"] is False

      ticketSummary
    hints:
    - alertOverrides 만 고칩니다. alertDefaults 의 2 는 ChainMap 뒤쪽이라 앞쪽에 같은 키가 있는 동안에는 쓰이지 않습니다.
    - 기준을 올리는 순간 assert ticketSummary["alert"] is True 가 AssertionError 로 먼저 막습니다. 계산이 아니라 기대값이 낡은 것이므로 그 줄을 is False 로 내립니다.
    - '정답 형태: alertOverrides = {"threshold": 4} 와 assert ticketSummary["alert"] is False'
  check:
    type: outputExact
    evidence: practice
    outputExact: "{'categoryCounts': {'bug': 3, 'billing': 1, 'feature': 1}, 'ticketsByOwner': {'min': ['T-101', 'T-103'], 'seo': ['T-102', 'T-105'], 'jin': ['T-104']}, 'recentTickets': ['T-103', 'T-104', 'T-105'], 'topCategory': 'bug', 'alert': False}"
    resultCheck: "출력이 정확히 일치해야 합니다: {'categoryCounts': {'bug': 3, 'billing': 1, 'feature': 1}, 'ticketsByOwner': {'min': ['T-101', 'T-103'], 'seo': ['T-102', 'T-105'], 'jin': ['T-104']}, 'recentTickets': ['T-103', 'T-104', 'T-105'], 'topCategory': 'bug', 'alert': False}"
- id: practice
  title: collections 모듈 종합 복습
  structuredPrimary: true
  subtitle: 특수 컨테이너 마스터하기
  goal: Counter, deque, namedtuple 세 컨테이너를 이어 붙여 이름이 붙은 요약 객체 하나를 만든다.
  why: 실제 집계 코드는 컨테이너 하나로 끝나지 않고 세고, 최근 구간만 남기고, 결과에 이름을 붙이는 세 단계를 이어 붙이는 형태이므로, 이 조합을 한 번 손으로 써 두면 다음 강의의 itertools 파이프라인에서 같은 모양을 바로 알아봅니다.
  explanation: |-
    이번 셀은 세 컨테이너의 역할이 서로 겹치지 않는다는 것을 확인하는 자리입니다. Counter는 무엇이 몇 번인지, maxlen을 준 deque는 끝에서 몇 개인지, namedtuple은 그 결과에 어떤 이름을 붙일지를 담당합니다.

    most_common(1)은 리스트, [0]은 (값, 개수) 튜플, [0][0]은 값 자체입니다. len(Counter)는 전체 개수가 아니라 서로 다른 키의 개수라는 점도 함께 확인하세요.
  tips:
  - Counter, deque, namedtuple 중 하나라도 빠지면 요약의 어떤 칸이 비는지 되짚어 보세요.
  snippet: |-
    items = ['a', 'b', 'a', 'c', 'b', 'a']
    itemCount = Counter(items)
    itemCount
  exercise:
    prompt: |-
      세 곳을 고치세요. itemCount 줄 아래에 Summary = namedtuple('Summary', ['top', 'unique', 'lastTwo'])를 추가하고, 그 아래에 summary = Summary(itemCount.most_common(1)[0][0], len(itemCount), list(deque(items, maxlen=2)))를 추가하고, 마지막 줄 itemCount를 summary로 바꾸세요.

      most_common(1)[0][0]은 최다 항목 이름만, len(itemCount)는 서로 다른 항목 수, maxlen=2를 준 deque는 마지막 두 개만 남기므로 Summary(top='a', unique=3, lastTwo=['b', 'a'])가 나와야 합니다.
    starterCode: |-
      items = ['a', 'b', 'a', 'c', 'b', 'a']
      itemCount = Counter(items)
      itemCount
    solution: |-
      items = ['a', 'b', 'a', 'c', 'b', 'a']
      itemCount = Counter(items)
      Summary = namedtuple('Summary', ['top', 'unique', 'lastTwo'])
      summary = Summary(itemCount.most_common(1)[0][0], len(itemCount), list(deque(items, maxlen=2)))
      summary
    hints:
    - most_common(1) 은 리스트, [0] 은 ('a', 3) 튜플, [0][0] 은 이름 'a' 입니다. 대괄호를 두 번 이어 붙입니다.
    - len(itemCount) 는 전체 항목 수 6 이 아니라 서로 다른 키 수 3 입니다. 전체를 세려면 sum(itemCount.values()) 를 씁니다.
    - deque(items, maxlen=2) 는 items 를 앞에서부터 밀어 넣어 마지막 두 개만 남깁니다. list() 로 감싸야 deque(...) 표시가 아니라 리스트로 들어갑니다.
    - "정답 형태: summary = Summary(itemCount.most_common(1)[0][0], len(itemCount), list(deque(items, maxlen=2)))"
  check:
    type: outputExact
    evidence: practice
    outputExact: "Summary(top='a', unique=3, lastTwo=['b', 'a'])"
    resultCheck: "출력이 정확히 일치해야 합니다: Summary(top='a', unique=3, lastTwo=['b', 'a'])"
assessment:
  masteryVariants:
  - id: 05_collections-ticket-backlog-mastery
    mode: mastery
    unseen: true
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 05_collections-recent-statuses-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 05_collections-owner-rollup-transfer
    title: 최근 상태 창 다시 구성하기
    subtitle: deque와 Counter를 하루 뒤 재사용
    goal: 이벤트 목록에서 최근 N개 상태만 유지하고 상태별 개수와 error 비율을 계산한다.
    why: 스트림 처리와 모니터링에서는 전체 로그보다 최근 창을 정확히 유지하는 능력이 더 중요합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. deque(maxlen)과 Counter 흐름을 예시 없이 복원하세요.
    tips:
    - deque(maxlen=window_size)는 새 항목이 들어오면 오래된 항목을 자동 제거합니다.
    - window_size가 0 이하이면 잘못된 설정이므로 ValueError를 일으키세요.
    exercise:
      prompt: summarize_recent_statuses(events, window_size)가 windowSize, recent, statusCounts, errorRate를 반환하고 잘못된 window_size는
        거부하도록 완성하세요.
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
`;export{e as default};