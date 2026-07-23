var e=`meta:\r
  id: 06_itertools\r
  title: itertools - 이터레이터 도구\r
  category: builtins\r
  tags:\r
  - itertools\r
  - iterator\r
  - combinations\r
  - permutations\r
  - cycle\r
  seo:\r
    title: 파이썬 itertools 모듈 완전 정복\r
    description: itertools 모듈의 무한 이터레이터, 조합, 순열, 그룹화 등을 배웁니다.\r
    keywords:\r
    - itertools\r
    - 이터레이터\r
    - 조합\r
    - 순열\r
    - permutations\r
    - combinations\r
intro:\r
  emoji: 🔄\r
  points:\r
  - 무한 이터레이터 생성\r
  - 조합과 순열 계산\r
  - 이터레이터 체이닝과 병합\r
  - 그룹화와 필터링\r
  direction: itertools 이터레이터 도구에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - itertools 이터레이터 도구 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: itertools 모듈 불러오 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 무한 이터레이터 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 조합과 순열 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: itertools 이터레이터 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: itertools 이터레이터 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: itertools 이터레이터 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: itertools 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: itertools 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    itertools은 파이썬 표준 라이브러리입니다. 효율적인 반복과 조합을 위한 이터레이터 도구를 제공하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 itertools 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    from itertools import count, cycle, repeat, islice, combinations, permutations, product, chain, zip_longest, tee, filterfalse, takewhile, dropwhile, groupby, accumulate, combinations_with_replacement\r
\r
    # 모듈 로드 확인\r
    'itertools 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: itertools 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from itertools import count, cycle, repeat, islice, combinations, permutations, product, chain, zip_longest, tee, filterfalse, takewhile, dropwhile, groupby, accumulate, combinations_with_replacement\r
\r
      # 모듈 로드 확인\r
      'itertools 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: itertools 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: itertools 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: infinite_iterators\r
  title: 무한 이터레이터\r
  structuredPrimary: true\r
  subtitle: count, cycle, repeat\r
  goal: 무한 이터레이터에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    itertools는 메모리 효율적인 이터레이터를 제공합니다. count()는 무한 카운터, cycle()은 순환 반복, repeat()는 값 반복을 생성합니다. 무한 시퀀스를 다룰 때는 반드시 종료 조건이나 제한이 필요합니다.\r
\r
    무한 이터레이터는 for 루프에서 break 없이 사용하면 무한 루프가 됩니다.\r
  snippet: |-\r
    counter = count(0)\r
    first5 = list(islice(counter, 5))\r
    first5\r
  exercise:\r
    prompt: 무한 이터레이터 예제에서 \`counter\`, \`first5\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      counter = count(0)\r
      first5 = list(islice(counter, 5))\r
      first5\r
    hints:\r
    - 바꿀 지점은 \`counter = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`counter\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 무한 이터레이터에서 \`counter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 무한 이터레이터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: combinatorics\r
  title: 조합과 순열\r
  structuredPrimary: true\r
  subtitle: combinations, permutations, product\r
  goal: 조합과 순열에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    조합론 함수로 모든 가능한 조합과 순열을 생성합니다. combinations()는 순서 무관 조합, permutations()는 순서 있는 순열, product()는 데카르트 곱을 반환합니다. 경우의 수 계산, 완전 탐색에 활용됩니다.\r
\r
    조합과 순열의 차이: combinations([1,2,3], 2)는 (1,2)만, permutations는 (1,2)와 (2,1) 모두 포함.\r
  snippet: |-\r
    choices = ['A', 'B', 'C']\r
    pairs = list(combinations(choices, 2))\r
    pairs\r
  exercise:\r
    prompt: 조합과 순열 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      choices = ['A', 'B', 'C']\r
      pairs = list(combinations(choices, 2))\r
      pairs\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 조합과 순열에서 \`choices\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 조합과 순열 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: chaining\r
  title: 이터레이터 연결\r
  structuredPrimary: true\r
  subtitle: chain, zip_longest, tee\r
  goal: 이터레이터 연결에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    여러 이터레이터를 연결하거나 복제할 수 있습니다. chain()은 여러 이터레이터를 순차 연결하고, zip_longest()는 길이가 다른 이터레이터를 짝짓습니다. tee()는 하나의 이터레이터를 여러 개로 복제합니다.\r
\r
    tee로 복제한 이터레이터는 독립적이므로 하나를 소진해도 다른 것에 영향을 주지 않습니다.\r
  snippet: |-\r
    list1 = [1, 2, 3]\r
    list2 = [4, 5, 6]\r
    combined = list(chain(list1, list2))\r
    combined\r
  exercise:\r
    prompt: 이터레이터 연결 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      list1 = [1, 2, 3]\r
      list2 = [4, 5, 6]\r
      combined = list(chain(list1, list2))\r
      combined\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이터레이터 연결에서 \`list1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 이터레이터 연결 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: filtering\r
  title: 필터링과 슬라이싱\r
  structuredPrimary: true\r
  subtitle: islice, filterfalse, takewhile, dropwhile\r
  goal: 필터링과 슬라이싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이터레이터를 조건에 따라 필터링하거나 슬라이싱할 수 있습니다. islice()는 인덱스 범위로 자르고, filterfalse()는 조건을 만족하지 않는 것만, takewhile()은 조건이 참인 동안만 가져옵니다.\r
\r
    takewhile과 filter의 차이: takewhile은 조건이 거짓이 되면 즉시 중단하지만 filter는 끝까지 검사합니다.\r
  snippet: |-\r
    numbers = range(10)\r
    sliced = list(islice(numbers, 2, 6))\r
    sliced\r
  exercise:\r
    prompt: 필터링과 슬라이싱 예제에서 \`numbers\`, \`sliced\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      numbers = range(10)\r
      sliced = list(islice(numbers, 2, 6))\r
      sliced\r
    hints:\r
    - 바꿀 지점은 \`numbers = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`numbers\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 필터링과 슬라이싱에서 \`numbers\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 필터링과 슬라이싱 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: grouping\r
  title: 그룹화와 누적\r
  structuredPrimary: true\r
  subtitle: groupby, accumulate\r
  goal: 그룹화와 누적에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    연속된 동일 요소를 그룹화하거나 누적값을 계산합니다. groupby()는 정렬된 데이터에서 연속된 같은 값을 묶고, accumulate()는 누적 합계나 누적 연산을 수행합니다. 데이터 집계, 통계 분석에 유용합니다.\r
\r
    groupby는 반드시 정렬된 데이터에 사용해야 합니다. 정렬되지 않으면 같은 값이 여러 그룹으로 나뉩니다.\r
  snippet: |-\r
    data = [1, 1, 2, 2, 2, 3, 1]\r
    grouped = [(k, len(list(g))) for k, g in groupby(data)]\r
    grouped\r
  exercise:\r
    prompt: 그룹화와 누적 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      data = [1, 1, 2, 2, 2, 3, 1]\r
      grouped = [(k, len(list(g))) for k, g in groupby(data)]\r
      grouped\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 그룹화와 누적의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 그룹화와 누적 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: itertools 실무 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 itertools 활용 패턴을 살펴봅니다. 배치 처리, 윈도우 슬라이딩, 페이지네이션, 조합 탐색 등 다양한 문제를 itertools로 효율적으로 해결할 수 있습니다.\r
\r
    itertools 함수들은 제너레이터를 반환하므로 메모리를 절약합니다. 필요한 만큼만 소비하세요.\r
  snippet: |-\r
    def chunk(iterable, size):\r
        iterator = iter(iterable)\r
        while True:\r
            batch = list(islice(iterator, size))\r
            if not batch:\r
                break\r
            yield batch\r
\r
    dataset = range(10)\r
    batches = list(chunk(dataset, 3))\r
    batches\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def chunk(iterable, size):\r
          iterator = iter(iterable)\r
          while True:\r
              batch = list(islice(iterator, size))\r
              if not batch:\r
                  break\r
              yield batch\r
\r
      dataset = range(10)\r
      batches = list(chunk(dataset, 3))\r
      batches\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 이터레이터 데이터 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 배치, groupby 정렬, 조합 탐색 검증\r
  goal: '검증 루프: 이터레이터 데이터 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    itertools는 메모리를 아끼는 대신 이터레이터가 한 번 소비된다는 점과 groupby의 정렬 조건을 반드시 이해해야 합니다. 여기서는 작은 주문 데이터를 배치 처리하고, 일부러 정렬 누락 버그를 잡은 뒤, 조합 탐색을 제한해 안전하게 검증합니다.\r
\r
    변주 실험\r
    프로모션 후보를 전부 만들지 않고 \`islice(product(...), 10)\`으로 상위 10개만 검토하는 흐름으로 바꿔 메모리 사용을 비교하세요.\r
  tips:\r
  - 변주 실험 프로모션 후보를 전부 만들지 않고 \`islice(product(...), 10)\`으로 상위 10개만 검토하는 흐름으로 바꿔 메모리 사용을 비교하세요.\r
  snippet: |-\r
    orderRows = [\r
        {"orderId": "O-101", "region": "KR", "amount": 120},\r
        {"orderId": "O-102", "region": "US", "amount": 80},\r
        {"orderId": "O-103", "region": "KR", "amount": 150},\r
        {"orderId": "O-104", "region": "JP", "amount": 60},\r
        {"orderId": "O-105", "region": "US", "amount": 90},\r
    ]\r
\r
    def chunkRecords(records, size):\r
        if size <= 0:\r
            raise ValueError("size must be positive")\r
        iterator = iter(records)\r
        while True:\r
            batch = list(islice(iterator, size))\r
            if not batch:\r
                break\r
            yield batch\r
\r
    orderBatches = list(chunkRecords(orderRows, size=2))\r
    flattenedOrders = list(chain.from_iterable(orderBatches))\r
\r
    assert [len(batch) for batch in orderBatches] == [2, 2, 1]\r
    assert flattenedOrders == orderRows\r
    assert sum(row["amount"] for row in flattenedOrders) == 500\r
\r
    orderBatches\r
  exercise:\r
    prompt: '검증 루프: 이터레이터 데이터 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      orderRows = [\r
          {"orderId": "O-101", "region": "KR", "amount": 120},\r
          {"orderId": "O-102", "region": "US", "amount": 80},\r
          {"orderId": "O-103", "region": "KR", "amount": 150},\r
          {"orderId": "O-104", "region": "JP", "amount": 60},\r
          {"orderId": "O-105", "region": "US", "amount": 90},\r
      ]\r
\r
      def chunkRecords(records, size):\r
          if size <= 0:\r
              raise ValueError("size must be positive")\r
          iterator = iter(records)\r
          while True:\r
              batch = list(islice(iterator, size))\r
              if not batch:\r
                  break\r
              yield batch\r
\r
      orderBatches = list(chunkRecords(orderRows, size=2))\r
      flattenedOrders = list(chain.from_iterable(orderBatches))\r
\r
      assert [len(batch) for batch in orderBatches] == [2, 2, 1]\r
      assert flattenedOrders == orderRows\r
      assert sum(row["amount"] for row in flattenedOrders) == 500\r
\r
      orderBatches\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 이터레이터 데이터 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 이터레이터 데이터 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: itertools 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 이터레이터 도구 마스터하기\r
  goal: itertools 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: itertools 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    countUp = count(1)\r
    first3 = list(islice(countUp, 3))\r
    first3\r
  exercise:\r
    prompt: itertools 모듈 종합 복습 예제에서 \`countUp\`, \`first3\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      countUp = count(1)\r
      first3 = list(islice(countUp, 3))\r
      first3\r
    hints:\r
    - 바꿀 지점은 \`countUp = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`countUp\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: itertools 모듈 종합 복습에서 \`countUp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: itertools 모듈 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 06_itertools-chunk-records-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - filtering
    - practical
    - workflow_validation
    title: iterator를 일정 크기 배치로 나누기
    subtitle: islice로 한 번씩만 소비
    goal: 입력 iterable을 지정한 크기의 batch 목록으로 나누고 잘못된 크기는 거부한다.
    why: 대량 데이터를 한 번에 리스트로 펼치지 않고 필요한 만큼만 소비해야 웹과 로컬 학습 실행이 모두 안정적입니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 record 목록과 batch 크기로 다시 호출합니다.
    tips:
    - iterator = iter(records)로 하나의 반복자를 만들고 islice로 size개씩 소비하세요.
    - 빈 batch가 나오면 반복을 끝내야 합니다.
    exercise:
      prompt: chunk_records(records, size)가 records를 size 단위의 list 묶음으로 반환하고 size <= 0이면 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        def chunk_records(records, size):
            raise NotImplementedError
      solution: |-
        from itertools import islice

        def chunk_records(records, size):
            if size <= 0:
                raise ValueError("size must be positive")
            iterator = iter(records)
            batches = []
            while True:
                batch = list(islice(iterator, size))
                if not batch:
                    break
                batches.append(batch)
            return batches
      hints:
      - islice(iterator, size)는 iterator의 다음 size개만 가져옵니다.
      - records 전체를 미리 복사하지 않아도 됩니다.
    check:
      id: python.builtins.itertools.chunk-records.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.itertools.chunk-records.mastery.behavior.v1.fixture
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
        entry: chunk_records
        cases:
        - id: uneven-string-records
          arguments:
          - value:
            - O-1
            - O-2
            - O-3
            - O-4
            - O-5
          - value: 2
          expectedReturn:
          - - O-1
            - O-2
          - - O-3
            - O-4
          - - O-5
        - id: numeric-records
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
            - 5
            - 6
          - value: 4
          expectedReturn:
          - - 1
            - 2
            - 3
            - 4
          - - 5
            - 6
        - id: rejects-zero-size
          arguments:
          - value:
            - O-1
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 06_itertools-campaign-pairs-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 06_itertools-chunk-records-mastery
    title: 캠페인과 채널 조합을 제한해서 만들기
    subtitle: product 결과를 islice로 절단
    goal: 캠페인과 채널의 모든 조합 중 앞에서부터 limit개만 문자열 목록으로 반환한다.
    why: 조합 탐색은 쉽게 폭발하므로 생성과 동시에 제한하는 습관이 실무 자동화 비용을 줄입니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 전체 product를 무작정 펼치지 말고 필요한 수만 소비하세요.
    tips:
    - product(campaigns, channels)는 campaign이 바깥쪽 순서로 반복됩니다.
    - limit이 음수면 잘못된 설정이므로 ValueError를 일으키세요.
    exercise:
      prompt: first_campaign_channel_pairs(campaigns, channels, limit)가 "campaign:channel" 문자열을 limit개까지 반환하도록 완성하세요.
      starterCode: |-
        def first_campaign_channel_pairs(campaigns, channels, limit):
            raise NotImplementedError
      solution: |-
        from itertools import islice, product

        def first_campaign_channel_pairs(campaigns, channels, limit):
            if limit < 0:
                raise ValueError("limit must not be negative")
            return [
                f"{campaign}:{channel}"
                for campaign, channel in islice(product(campaigns, channels), limit)
            ]
      hints:
      - product 결과를 list로 전부 만든 뒤 자르는 방식보다 islice로 먼저 제한하세요.
      - 반환값은 tuple이 아니라 문자열 목록입니다.
    check:
      id: python.builtins.itertools.campaign-pairs.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.itertools.campaign-pairs.transfer.behavior.v1.fixture
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
        entry: first_campaign_channel_pairs
        cases:
        - id: limited-cartesian-product
          arguments:
          - value:
            - launch
            - winback
          - value:
            - email
            - sms
            - push
          - value: 4
          expectedReturn:
          - launch:email
          - launch:sms
          - launch:push
          - winback:email
        - id: limit-larger-than-product
          arguments:
          - value:
            - a
            - b
            - c
          - value:
            - web
          - value: 5
          expectedReturn:
          - a:web
          - b:web
          - c:web
        - id: rejects-negative-limit
          arguments:
          - value:
            - a
          - value:
            - web
          - value: -1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 06_itertools-region-amounts-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 06_itertools-chunk-records-mastery
    title: 지역별 누적 매출 다시 구성하기
    subtitle: groupby 정렬 조건과 accumulate 복원
    goal: 주문 행을 region 기준으로 정렬한 뒤 지역별 total과 running 누적값을 반환한다.
    why: groupby는 정렬을 잊으면 같은 지역이 여러 조각으로 갈라지므로, 하루 뒤에도 이 전제부터 복원해야 합니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 정렬, groupby, accumulate 순서를 다시 세우세요.
    tips:
    - groupby 전에 sorted(rows, key=lambda row: row["region"])를 먼저 적용하세요.
    - accumulate(amounts)의 마지막 값이 지역 total입니다.
    exercise:
      prompt: summarize_region_amounts(rows)가 region, total, running을 담은 dict 목록을 region 오름차순으로 반환하도록 완성하세요.
      starterCode: |-
        def summarize_region_amounts(rows):
            raise NotImplementedError
      solution: |-
        from itertools import accumulate, groupby

        def summarize_region_amounts(rows):
            ordered = sorted(rows, key=lambda row: row["region"])
            summary = []
            for region, group in groupby(ordered, key=lambda row: row["region"]):
                amounts = [row["amount"] for row in group]
                running = list(accumulate(amounts))
                summary.append({"region": region, "total": running[-1], "running": running})
            return summary
      hints:
      - rows가 비어 있으면 for 루프가 돌지 않아 빈 list가 반환됩니다.
      - running은 지역 안에서 입력 순서대로 누적한 금액 목록입니다.
    check:
      id: python.builtins.itertools.region-amounts.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.itertools.region-amounts.retrieval.behavior.v1.fixture
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
        entry: summarize_region_amounts
        cases:
        - id: unsorted-regions
          arguments:
          - value:
            - region: KR
              amount: 120
            - region: US
              amount: 80
            - region: KR
              amount: 150
            - region: JP
              amount: 60
          expectedReturn:
          - region: JP
            total: 60
            running:
            - 60
          - region: KR
            total: 270
            running:
            - 120
            - 270
          - region: US
            total: 80
            running:
            - 80
        - id: already-adjacent
          arguments:
          - value:
            - region: EU
              amount: 30
            - region: EU
              amount: 20
            - region: APAC
              amount: 50
          expectedReturn:
          - region: APAC
            total: 50
            running:
            - 50
          - region: EU
            total: 50
            running:
            - 30
            - 50
        - id: empty-rows
          arguments:
          - value: []
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};