var e=`meta:
  id: '05'
  title: itertools 마스터
  day: 5
  category: advancedPython
  tags:
  - itertools
  - iterator
  - combinations
  - groupby
  - 스트리밍
  - 검증
  seo:
    title: 파이썬 itertools 마스터 - 무한 이터레이터와 조합 함수
    description: itertools 모듈의 모든 함수를 마스터합니다. 무한 이터레이터, 종료 이터레이터, 조합 함수 완벽 이해.
    keywords:
    - itertools
    - count
    - cycle
    - combinations
    - permutations
    - groupby
intro:
  emoji: 🔄
  points:
  - count, cycle, repeat으로 무한 시퀀스 생성
  - takewhile, dropwhile, islice로 시퀀스 제어
  - product, permutations, combinations로 조합 생성
  - groupby, chain, accumulate로 데이터 처리
  direction: itertools 마스터에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - itertools 마스터 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 무한 이터레이터 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 종료 이터레이터 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 조합 함수 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: itertools 마스터 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: itertools 마스터 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: itertools 마스터 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: infinite_iterators
  title: 무한 이터레이터
  structuredPrimary: true
  subtitle: 끝없는 시퀀스 생성
  goal: count로 만든 이터레이터를 islice로 두 번 잘라 두 번째 조각이 처음이 아니라 멈춘 자리에서 이어진다는 것을 확인한다.
  why: count, cycle, repeat은 값을 미리 만들어 두지 않고 요청받을 때 하나씩 내주기 때문에 길이가 얼마든 메모리를 거의 쓰지 않지만, 그 대가로 한 번 지나간 값은 돌아오지 않으므로 같은 이터레이터를 두 군데서 나눠 쓰면 뒤쪽이 데이터를 잃습니다.
  explanation: |-
    itertools에는 끝나지 않는 이터레이터가 셋 있습니다. count는 시작값부터 step씩 늘어나는 수열을, cycle은 받은 iterable을 끝없이 되풀이하고, repeat은 같은 값을 계속 내줍니다. 값을 미리 만들지 않고 요청받을 때 하나씩 계산하므로 메모리에는 현재 상태만 남습니다.

    그래서 세 함수 모두 list()로 감싸면 프로그램이 멈추지 않습니다. islice, takewhile, break 중 하나로 반드시 끝을 정해야 합니다.

    또 하나 놓치기 쉬운 것은 이터레이터가 상태를 들고 있다는 점입니다. islice가 다섯 개를 꺼내면 원본 count는 그만큼 앞으로 나아가 있고, 같은 이터레이터를 다시 자르면 여섯 번째부터 나옵니다. 리스트를 두 번 슬라이싱하는 것과 결과가 다릅니다.
  snippet: |-
    from itertools import count, islice

    counter = count(10, 2)
    list(islice(counter, 5))
  exercise:
    prompt: |-
      세 곳을 고치세요.
      1. import 줄을 from itertools import count, cycle, islice, repeat 으로 바꿉니다.
      2. 마지막 줄을 firstBatch = list(islice(counter, 5)) 로 바꾸고, 그 아래에 secondBatch = list(islice(counter, 3)) 을 추가합니다.
      3. rotation = list(islice(cycle("AB"), 5)) 와 padding = list(repeat("-", 3)) 을 만든 뒤 마지막 줄에 firstBatch, secondBatch, rotation, padding 을 표시합니다.

      counter는 첫 islice에서 이미 다섯 칸 나아갔으므로 두 번째 조각은 10이 아니라 20부터 시작합니다. cycle은 AB를 되풀이하고 repeat은 개수를 주면 스스로 끝나므로 ([10, 12, 14, 16, 18], [20, 22, 24], ['A', 'B', 'A', 'B', 'A'], ['-', '-', '-'])가 나와야 합니다.
    starterCode: |-
      from itertools import count, islice

      counter = count(10, 2)
      list(islice(counter, 5))
    solution: |-
      from itertools import count, cycle, islice, repeat

      counter = count(10, 2)
      firstBatch = list(islice(counter, 5))
      secondBatch = list(islice(counter, 3))
      rotation = list(islice(cycle("AB"), 5))
      padding = list(repeat("-", 3))
      firstBatch, secondBatch, rotation, padding
    hints:
    - cycle("AB") 는 끝이 없으므로 반드시 islice 로 개수를 정해야 합니다. repeat 은 두 번째 인자로 횟수를 주면 스스로 끝나 list() 로 바로 받을 수 있습니다.
    - '정답 형태: firstBatch, secondBatch, rotation, padding'
  check:
    type: outputExact
    evidence: practice
    outputExact: "([10, 12, 14, 16, 18], [20, 22, 24], ['A', 'B', 'A', 'B', 'A'], ['-', '-', '-'])"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"([10, 12, 14, 16, 18], [20, 22, 24], ['A', 'B', 'A', 'B', 'A'], ['-', '-', '-'])\\""
- id: terminating_iterators
  title: 종료 이터레이터
  structuredPrimary: true
  subtitle: 시퀀스 제어
  goal: 같은 리스트에 takewhile, dropwhile, filter, filterfalse를 모두 걸어 조건이 처음 깨지는 자리에서 멈추는 쪽과 끝까지 훑는 쪽을 갈라 본다.
  why: 시간순 로그에서 최근 구간만 잘라낼 때 takewhile은 첫 실패에서 멈춰 뒤쪽을 아예 읽지 않지만 filter는 전부 읽으므로, 둘을 바꿔 쓰면 결과가 달라지는 것은 물론 큰 파일에서 읽어 들이는 양까지 달라집니다.
  explanation: |-
    종료 이터레이터는 무한한 입력이든 유한한 입력이든 받아 끝이 있는 결과를 만듭니다. 이름이 비슷한 네 함수의 차이가 핵심입니다.

    takewhile은 조건이 처음 거짓이 되는 순간 멈추고 그 뒤는 보지 않습니다. dropwhile은 조건이 처음 거짓이 되는 순간까지만 버리고 그 뒤는 조건과 상관없이 전부 내보냅니다. 반면 filter와 filterfalse는 입력 전체를 훑으며 각 요소를 따로 판정합니다.

    그래서 조건에 맞는 값이 앞쪽에 몰려 있다고 가정할 수 있으면 takewhile이 읽는 양을 줄여 주고, 그런 가정이 없으면 filter를 써야 값을 빠뜨리지 않습니다.
  snippet: |-
    from itertools import takewhile, dropwhile

    data = [1, 3, 5, 2, 4, 6, 8]
    taken = list(takewhile(lambda x: x < 5, data))
    dropped = list(dropwhile(lambda x: x < 5, data))
    taken, dropped
  exercise:
    prompt: |-
      두 곳을 고치세요.
      1. import 줄을 from itertools import dropwhile, filterfalse, takewhile 로 바꿉니다.
      2. dropped 줄 아래에 kept = list(filter(lambda x: x < 5, data)) 와 skipped = list(filterfalse(lambda x: x < 5, data)) 를 추가하고, 마지막 줄을 taken, dropped, kept, skipped 로 바꿉니다.

      데이터는 1, 3, 5, 2, 4, 6, 8입니다. takewhile은 5에서 멈춰 뒤에 있는 2와 4를 보지 못하지만 filter는 끝까지 훑어 둘을 챙깁니다. 그래서 ([1, 3], [5, 2, 4, 6, 8], [1, 3, 2, 4], [5, 6, 8])이 나와야 합니다.
    starterCode: |-
      from itertools import takewhile, dropwhile

      data = [1, 3, 5, 2, 4, 6, 8]
      taken = list(takewhile(lambda x: x < 5, data))
      dropped = list(dropwhile(lambda x: x < 5, data))
      taken, dropped
    solution: |-
      from itertools import dropwhile, filterfalse, takewhile

      data = [1, 3, 5, 2, 4, 6, 8]
      taken = list(takewhile(lambda x: x < 5, data))
      dropped = list(dropwhile(lambda x: x < 5, data))
      kept = list(filter(lambda x: x < 5, data))
      skipped = list(filterfalse(lambda x: x < 5, data))
      taken, dropped, kept, skipped
    hints:
    - 'filter 는 파이썬 내장이라 import 가 필요 없지만 filterfalse 는 itertools 에서 가져와야 합니다. 네 줄 모두 조건 함수는 lambda x: x < 5 로 같게 둡니다.'
    - '정답 형태: taken, dropped, kept, skipped'
  check:
    type: outputExact
    evidence: practice
    outputExact: '([1, 3], [5, 2, 4, 6, 8], [1, 3, 2, 4], [5, 6, 8])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([1, 3], [5, 2, 4, 6, 8], [1, 3, 2, 4], [5, 6, 8])'"
- id: combinatoric
  title: 조합 함수
  structuredPrimary: true
  subtitle: 순열, 조합, 곱집합
  goal: 같은 세 글자에 permutations, combinations, combinations_with_replacement, product를 걸어 순서와 중복을 허용하는지에 따라 가짓수가 어떻게 갈리는지 센다.
  why: 테스트 입력 조합이나 상품 옵션표를 만들 때 순서를 구분해야 하는지 같은 항목을 두 번 써도 되는지에 따라 경우의 수가 몇 배씩 달라지므로, 네 함수를 같은 입력에 한 번 걸어 눈으로 비교하는 편이 공식을 외우는 것보다 확실합니다.
  explanation: |-
    네 함수는 모두 A, B, C에서 두 개를 고르는 문제를 풀지만 규칙이 다릅니다.

    permutations는 순서를 구분합니다. AB와 BA가 다른 것으로 세어 여섯 가지입니다. combinations는 순서를 무시해 AB만 남기므로 세 가지입니다. combinations_with_replacement는 순서를 무시하되 같은 항목을 두 번 고르는 것을 허용해 AA가 들어오고 여섯 가지가 됩니다. product는 서로 다른 iterable의 모든 짝을 만드는 함수이며, repeat 인자를 주면 같은 목록을 그 횟수만큼 곱해 아홉 가지가 됩니다.

    넷 다 이터레이터를 돌려주므로 개수를 세거나 목록으로 보려면 list()로 받아야 합니다. 조합 수는 입력 크기에 따라 폭발적으로 늘어나니 큰 입력에서는 세기 전에 공식으로 규모를 가늠하세요.
  snippet: |-
    from itertools import product

    colorList = ["red", "blue"]
    sizes = ["S", "M", "L"]
    list(product(colorList, sizes))
  exercise:
    prompt: |-
      상품 옵션 대신 A, B, C 세 글자로 네 규칙을 한 번에 비교하세요. 고칠 곳은 세 군데입니다.
      1. import 줄을 from itertools import combinations, combinations_with_replacement, permutations, product 로 바꿉니다.
      2. colorList와 sizes 두 줄을 items = ["A", "B", "C"] 한 줄로 바꿉니다.
      3. pairsOrdered, pairsUnordered, pairsRepeat 세 변수를 만듭니다. 각각 permutations(items, 2), combinations(items, 2), combinations_with_replacement(items, 2)를 돌며 "".join(pair) 로 두 글자 문자열을 만든 리스트입니다. gridCount = len(list(product(items, repeat=2))) 도 만들고, 마지막 줄에 pairsOrdered, pairsUnordered, pairsRepeat, gridCount 를 표시합니다.

      순서를 세면 여섯, 순서를 무시하면 셋, 중복을 허용하면 다시 여섯, 두 자리를 독립으로 곱하면 아홉입니다. 그래서 (['AB', 'AC', 'BA', 'BC', 'CA', 'CB'], ['AB', 'AC', 'BC'], ['AA', 'AB', 'AC', 'BB', 'BC', 'CC'], 9)가 나와야 합니다.
    starterCode: |-
      from itertools import product

      colorList = ["red", "blue"]
      sizes = ["S", "M", "L"]
      list(product(colorList, sizes))
    solution: |-
      from itertools import combinations, combinations_with_replacement, permutations, product

      items = ["A", "B", "C"]
      pairsOrdered = ["".join(pair) for pair in permutations(items, 2)]
      pairsUnordered = ["".join(pair) for pair in combinations(items, 2)]
      pairsRepeat = ["".join(pair) for pair in combinations_with_replacement(items, 2)]
      gridCount = len(list(product(items, repeat=2)))
      pairsOrdered, pairsUnordered, pairsRepeat, gridCount
    hints:
    - 네 함수 모두 튜플을 내주므로 "".join(pair) 로 두 글자 문자열을 만듭니다. product 는 목록을 두 개 받는 대신 repeat=2 로 같은 목록을 두 번 곱하게 할 수 있습니다.
    - '정답 형태: pairsOrdered, pairsUnordered, pairsRepeat, gridCount'
  check:
    type: outputExact
    evidence: practice
    outputExact: "(['AB', 'AC', 'BA', 'BC', 'CA', 'CB'], ['AB', 'AC', 'BC'], ['AA', 'AB', 'AC', 'BB', 'BC', 'CC'], 9)"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"(['AB', 'AC', 'BA', 'BC', 'CA', 'CB'], ['AB', 'AC', 'BC'], ['AA', 'AB', 'AC', 'BB', 'BC', 'CC'], 9)\\""
- id: groupby
  title: groupby 함수
  structuredPrimary: true
  subtitle: 연속 요소 그룹화
  goal: 같은 문자열을 그대로 groupby한 결과와 정렬한 뒤 groupby한 결과를 나란히 세워 그룹이 5개에서 3개로 줄어드는 것을 확인한다.
  why: groupby는 SQL의 GROUP BY와 달리 붙어 있는 것만 묶어 주기 때문에 정렬을 빠뜨려도 예외 없이 그럴듯한 표가 나오고, 이렇게 조용히 틀리는 집계는 리포트에서 가장 늦게 발견되는 종류의 결함입니다.
  explanation: |-
    groupby는 이웃한 요소의 키를 비교해 키가 바뀌는 자리에서 그룹을 끊습니다. 전체를 훑어 같은 키를 모으는 것이 아니라, 지나가면서 경계만 찾습니다.

    그래서 같은 입력이라도 정렬 여부에 따라 결과가 달라집니다. 정렬하지 않으면 떨어져 있는 같은 키가 서로 다른 그룹이 되어 연속 구간(run) 분석이 되고, 정렬하면 전체 집계가 됩니다. 둘 다 쓸모가 있으니 지금 어느 쪽을 원하는지 정하고 코드를 써야 합니다.

    한 가지 더, groupby가 내주는 그룹은 리스트가 아니라 이터레이터이고 다음 그룹으로 넘어가는 순간 비워집니다. 나중에 쓰려면 그 자리에서 list()나 len(list())로 붙잡아 두어야 합니다.
  snippet: |-
    from itertools import groupby

    letters = "AAABBBCCAABB"
    grouped = [(k, list(g)) for k, g in groupby(letters)]
    grouped
  exercise:
    prompt: |-
      정렬 유무가 결과를 어떻게 가르는지 한 셀에서 비교하세요. 고칠 곳은 두 군데입니다.
      1. grouped 줄을 runs = [(key, len(list(group))) for key, group in groupby(letters)] 로 바꾸고, 그 아래에 같은 식에서 letters 대신 sorted(letters)를 쓰는 totals 를 추가합니다.
      2. 마지막 줄을 runs, totals, len(runs), len(totals) 로 바꿉니다.

      letters는 AAABBBCCAABB이고 A와 B가 두 번씩 떨어져 나타납니다. 정렬하지 않으면 연속 구간 다섯 개로 잘리고, 정렬하면 A 다섯 개, B 다섯 개, C 두 개인 그룹 세 개로 합쳐집니다. 그래서 ([('A', 3), ('B', 3), ('C', 2), ('A', 2), ('B', 2)], [('A', 5), ('B', 5), ('C', 2)], 5, 3)이 나와야 합니다.
    starterCode: |-
      from itertools import groupby

      letters = "AAABBBCCAABB"
      grouped = [(k, list(g)) for k, g in groupby(letters)]
      grouped
    solution: |-
      from itertools import groupby

      letters = "AAABBBCCAABB"
      runs = [(key, len(list(group))) for key, group in groupby(letters)]
      totals = [(key, len(list(group))) for key, group in groupby(sorted(letters))]
      runs, totals, len(runs), len(totals)
    hints:
    - 두 줄의 차이는 groupby 에 letters 를 넣느냐 sorted(letters) 를 넣느냐 하나뿐입니다. 그룹은 이터레이터라 len(group) 은 쓸 수 없고 len(list(group)) 으로 세야 합니다.
    - '정답 형태: runs, totals, len(runs), len(totals)'
  check:
    type: outputExact
    evidence: practice
    outputExact: "([('A', 3), ('B', 3), ('C', 2), ('A', 2), ('B', 2)], [('A', 5), ('B', 5), ('C', 2)], 5, 3)"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"([('A', 3), ('B', 3), ('C', 2), ('A', 2), ('B', 2)], [('A', 5), ('B', 5), ('C', 2)], 5, 3)\\""
- id: chain_zip
  title: chain과 zip_longest
  structuredPrimary: true
  subtitle: 이터레이터 연결과 병합
  goal: 길이가 서로 다른 행 세 개를 chain.from_iterable로 펴고 같은 데이터를 zip과 zip_longest로 각각 묶어 어느 쪽이 값을 버리는지 본다.
  why: zip은 가장 짧은 쪽에서 조용히 멈춰 남은 값을 통째로 버리므로, 길이가 어긋날 수 있는 두 목록을 합칠 때는 zip_longest로 빈자리를 채워 두어야 나중에 몇 건이 어디서 사라졌는지 되짚는 일을 피할 수 있습니다.
  explanation: |-
    chain은 여러 iterable을 이어 붙여 하나처럼 순회하게 합니다. 리스트를 더해 새 리스트를 만드는 것과 결과는 같지만, 합친 사본을 메모리에 만들지 않는다는 점이 다릅니다. chain.from_iterable은 인자를 하나만 받아 그 안의 iterable들을 이어 붙이므로 중첩 리스트를 한 겹 펴는 데 씁니다.

    zip과 zip_longest의 차이는 길이가 다를 때 드러납니다. zip은 가장 짧은 쪽이 끝나는 순간 조용히 멈추고 나머지를 버립니다. 예외도 경고도 없습니다. zip_longest는 가장 긴 쪽에 맞추고 모자란 자리를 fillvalue로 채웁니다.

    데이터를 합치는 코드에서는 어긋난 길이가 곧 결측이므로, 버릴지 채울지를 코드로 명시하는 편이 안전합니다.
  snippet: |-
    from itertools import chain

    list1 = [1, 2, 3]
    list2 = [4, 5, 6]
    list3 = [7, 8, 9]
    list(chain(list1, list2, list3))
  exercise:
    prompt: |-
      길이가 다른 데이터로 바꿔 zip이 무엇을 버리는지 드러내세요. 고칠 곳은 세 군데입니다.
      1. import 줄을 from itertools import chain, zip_longest 로 바꿉니다.
      2. list1, list2, list3 세 줄을 rows = [[1, 2, 3], [4, 5], [6, 7, 8, 9]] 한 줄로 바꿉니다.
      3. flat = list(chain.from_iterable(rows)), zipped = list(zip(rows[0], rows[1])), padded = list(zip_longest(rows[0], rows[1], fillvalue=0)) 세 줄을 만들고, 마지막 줄에 flat, zipped, padded, len(flat) 을 표시합니다.

      rows[1]은 두 개뿐이라 zip은 거기서 멈춰 rows[0]의 3을 버리지만 zip_longest는 빈자리를 0으로 채워 세 쌍을 만듭니다. 그래서 ([1, 2, 3, 4, 5, 6, 7, 8, 9], [(1, 4), (2, 5)], [(1, 4), (2, 5), (3, 0)], 9)가 나와야 합니다.
    starterCode: |-
      from itertools import chain

      list1 = [1, 2, 3]
      list2 = [4, 5, 6]
      list3 = [7, 8, 9]
      list(chain(list1, list2, list3))
    solution: |-
      from itertools import chain, zip_longest

      rows = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
      flat = list(chain.from_iterable(rows))
      zipped = list(zip(rows[0], rows[1]))
      padded = list(zip_longest(rows[0], rows[1], fillvalue=0))
      flat, zipped, padded, len(flat)
    hints:
    - chain.from_iterable(rows) 는 chain(*rows) 와 같은 결과를 내지만 목록을 미리 펼치지 않습니다. zip_longest 의 빈자리 값은 fillvalue 인자로 정합니다.
    - '정답 형태: flat, zipped, padded, len(flat)'
  check:
    type: outputExact
    evidence: practice
    outputExact: '([1, 2, 3, 4, 5, 6, 7, 8, 9], [(1, 4), (2, 5)], [(1, 4), (2, 5), (3, 0)], 9)'
    resultCheck: "출력이 정확히 일치해야 합니다: '([1, 2, 3, 4, 5, 6, 7, 8, 9], [(1, 4), (2, 5)], [(1, 4), (2, 5), (3, 0)], 9)'"
- id: accumulate
  title: accumulate 함수
  structuredPrimary: true
  subtitle: 누적 연산
  goal: 입출금 증감 목록에 accumulate를 세 가지 방식으로 걸어 잔액, 기초 잔액을 포함한 잔액, 지금까지의 최고 잔액을 한 번에 만든다.
  why: 누적 잔액과 최고 잔액을 for 문으로 직접 돌리면 중간 변수와 조건이 붙지만 accumulate는 initial과 함수 인자만 갈아 끼워 같은 답을 내주고, 마지막 값 하나가 아니라 중간값을 전부 남기므로 추이 그래프에 그대로 쓸 수 있습니다.
  explanation: |-
    accumulate는 앞에서부터 값을 접어 가며 중간 결과를 하나씩 내줍니다. functools.reduce가 최종값 하나만 주는 것과 달리 모든 단계를 남긴다는 점이 다릅니다.

    쓰는 방법은 세 가지입니다. 인자를 하나만 주면 누적 합입니다. 두 번째 인자로 두 값을 받는 함수를 주면 그 연산으로 접습니다. max를 주면 지금까지의 최고값이 이어집니다. initial을 주면 그 값이 맨 앞에 먼저 나오므로 결과 길이가 입력보다 하나 깁니다. 기초 잔액이나 시작 재고를 표현할 때 이 한 칸이 필요합니다.

    accumulate 역시 이터레이터를 돌려주므로 화면에서 보려면 list()로 받아야 합니다.
  snippet: |-
    from itertools import accumulate

    numbers = [1, 2, 3, 4, 5]
    list(accumulate(numbers))
  exercise:
    prompt: |-
      단순 합계 대신 잔액 추이를 만드세요. 고칠 곳은 두 군데입니다.
      1. numbers 줄을 changes = [100, -30, 50, -80, 20] 으로 바꿉니다.
      2. 마지막 줄을 balance = list(accumulate(changes)) 로 바꾸고, 그 아래에 withOpening = list(accumulate(changes, initial=500)) 과 runningPeak = list(accumulate(balance, max)) 를 만든 뒤 balance, withOpening, runningPeak 을 표시합니다.

      기초 잔액 500을 주면 결과가 여섯 칸으로 한 칸 늘어납니다. runningPeak은 잔액이 120까지 올랐다가 40으로 떨어져도 그때까지의 최고값을 그대로 붙듭니다. 그래서 ([100, 70, 120, 40, 60], [500, 600, 570, 620, 540, 560], [100, 100, 120, 120, 120])이 나와야 합니다.
    starterCode: |-
      from itertools import accumulate

      numbers = [1, 2, 3, 4, 5]
      list(accumulate(numbers))
    solution: |-
      from itertools import accumulate

      changes = [100, -30, 50, -80, 20]
      balance = list(accumulate(changes))
      withOpening = list(accumulate(changes, initial=500))
      runningPeak = list(accumulate(balance, max))
      balance, withOpening, runningPeak
    hints:
    - runningPeak 은 changes 가 아니라 이미 계산한 balance 에 max 를 걸어야 합니다. initial 은 키워드 인자이고 두 번째 자리의 함수 인자와는 다른 자리입니다.
    - '정답 형태: balance, withOpening, runningPeak'
  check:
    type: outputExact
    evidence: practice
    outputExact: '([100, 70, 120, 40, 60], [500, 600, 570, 620, 540, 560], [100, 100, 120, 120, 120])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([100, 70, 120, 40, 60], [500, 600, 570, 620, 540, 560], [100, 100, 120, 120, 120])'"
- id: workflow_validation
  title: 실무 이터레이터 파이프라인
  structuredPrimary: true
  subtitle: 정렬, 그룹화, 조합 실험, 검증
  goal: 정렬한 파이프라인과 정렬을 뺀 파이프라인을 같은 매출 데이터에 돌려 예외 없이 매출이 줄어드는 것을 assert로 못 박는다.
  why: 이터레이터 파이프라인의 사고는 대부분 예외가 아니라 숫자가 조용히 틀리는 형태로 나타나므로, 잘못된 버전을 일부러 옆에 두고 두 결과를 함께 고정해야 나중에 코드를 고쳤을 때 어느 쪽으로 미끄러졌는지 알 수 있습니다.
  explanation: |-
    이 셀은 같은 데이터에 두 가지 요약 함수를 돌립니다. 하나는 채널로 정렬한 뒤 groupby하고, 다른 하나는 거르기만 하고 정렬을 건너뜁니다.

    입력에서 online 이벤트는 목록 안에 흩어져 있습니다. 정렬하지 않으면 그 사이에 낀 다른 채널 때문에 online이 여러 그룹으로 잘리고, summary[channel]에 대입하는 코드가 뒤 그룹으로 앞 그룹을 덮어씁니다. 매출은 165000에서 45000으로 줄지만 예외는 나지 않고 표도 멀쩡해 보입니다.

    그래서 assert로 두 결과를 모두 고정합니다. 맞는 값만 고정하면 나중에 정렬을 실수로 지웠을 때 무엇이 어떻게 달라졌는지 읽어 낼 수 없습니다.
  snippet: |-
    from itertools import groupby

    salesEvents = [
        {"channel": "online", "amount": 120000, "status": "paid"},
        {"channel": "offline", "amount": 80000, "status": "paid"},
        {"channel": "online", "amount": 45000, "status": "paid"},
        {"channel": "online", "amount": 30000, "status": "refund"},
        {"channel": "partner", "amount": 55000, "status": "paid"},
        {"channel": "offline", "amount": 70000, "status": "paid"},
    ]

    def summarizeByChannel(events):
        paidEvents = sorted(
            (event for event in events if event["status"] == "paid"),
            key=lambda event: event["channel"],
        )
        summary = {}
        for channel, groupedEvents in groupby(paidEvents, key=lambda event: event["channel"]):
            groupList = list(groupedEvents)
            summary[channel] = {
                "orders": len(groupList),
                "revenue": sum(event["amount"] for event in groupList),
            }
        return summary

    channelSummary = summarizeByChannel(salesEvents)
    channelSummary
  exercise:
    prompt: |-
      정렬을 뺐을 때 무엇이 깨지는지 같은 셀에서 만들어 비교하세요. 고칠 곳은 두 군데입니다.
      1. summarizeByChannel 아래에 summarizeWithoutSorting(events)를 만듭니다. 본문은 summarizeByChannel과 같되 sorted(...) 대신 paidEvents = [event for event in events if event["status"] == "paid"] 로 정렬 없이 거르기만 합니다.
      2. 마지막 두 줄을 지우고 channelSummary = summarizeByChannel(salesEvents) 와 brokenSummary = summarizeWithoutSorting(salesEvents) 를 만든 뒤 assert 세 줄과 print 두 줄을 씁니다. assert는 channelSummary["online"] == {"orders": 2, "revenue": 165000}, brokenSummary["online"] == {"orders": 1, "revenue": 45000}, list(channelSummary) == ["offline", "online", "partner"] 입니다. print는 print(channelSummary["online"], brokenSummary["online"]) 와 print(list(channelSummary), list(brokenSummary)) 입니다.

      online 이벤트는 목록 안에서 떨어져 있어 정렬하지 않으면 서로 다른 그룹으로 잘리고, 나중 그룹이 앞 그룹을 딕셔너리에서 덮어써 매출이 165000에서 45000으로 줄어듭니다. 예외는 나지 않습니다. 그래서 아래 두 줄이 나와야 합니다.
      {'orders': 2, 'revenue': 165000} {'orders': 1, 'revenue': 45000}
      ['offline', 'online', 'partner'] ['online', 'offline', 'partner']
    starterCode: |-
      from itertools import groupby

      salesEvents = [
          {"channel": "online", "amount": 120000, "status": "paid"},
          {"channel": "offline", "amount": 80000, "status": "paid"},
          {"channel": "online", "amount": 45000, "status": "paid"},
          {"channel": "online", "amount": 30000, "status": "refund"},
          {"channel": "partner", "amount": 55000, "status": "paid"},
          {"channel": "offline", "amount": 70000, "status": "paid"},
      ]

      def summarizeByChannel(events):
          paidEvents = sorted(
              (event for event in events if event["status"] == "paid"),
              key=lambda event: event["channel"],
          )
          summary = {}
          for channel, groupedEvents in groupby(paidEvents, key=lambda event: event["channel"]):
              groupList = list(groupedEvents)
              summary[channel] = {
                  "orders": len(groupList),
                  "revenue": sum(event["amount"] for event in groupList),
              }
          return summary

      channelSummary = summarizeByChannel(salesEvents)
      channelSummary
    solution: |-
      from itertools import groupby

      salesEvents = [
          {"channel": "online", "amount": 120000, "status": "paid"},
          {"channel": "offline", "amount": 80000, "status": "paid"},
          {"channel": "online", "amount": 45000, "status": "paid"},
          {"channel": "online", "amount": 30000, "status": "refund"},
          {"channel": "partner", "amount": 55000, "status": "paid"},
          {"channel": "offline", "amount": 70000, "status": "paid"},
      ]

      def summarizeByChannel(events):
          paidEvents = sorted(
              (event for event in events if event["status"] == "paid"),
              key=lambda event: event["channel"],
          )
          summary = {}
          for channel, groupedEvents in groupby(paidEvents, key=lambda event: event["channel"]):
              groupList = list(groupedEvents)
              summary[channel] = {
                  "orders": len(groupList),
                  "revenue": sum(event["amount"] for event in groupList),
              }
          return summary

      def summarizeWithoutSorting(events):
          paidEvents = [event for event in events if event["status"] == "paid"]
          summary = {}
          for channel, groupedEvents in groupby(paidEvents, key=lambda event: event["channel"]):
              groupList = list(groupedEvents)
              summary[channel] = {
                  "orders": len(groupList),
                  "revenue": sum(event["amount"] for event in groupList),
              }
          return summary

      channelSummary = summarizeByChannel(salesEvents)
      brokenSummary = summarizeWithoutSorting(salesEvents)

      assert channelSummary["online"] == {"orders": 2, "revenue": 165000}
      assert brokenSummary["online"] == {"orders": 1, "revenue": 45000}
      assert list(channelSummary) == ["offline", "online", "partner"]

      print(channelSummary["online"], brokenSummary["online"])
      print(list(channelSummary), list(brokenSummary))
    hints:
    - 두 함수의 차이는 paidEvents 를 만드는 줄 하나뿐입니다. sorted 를 쓰면 같은 채널이 붙어 하나의 그룹이 되고, 리스트 컴프리헨션만 쓰면 원래 순서가 그대로 남습니다.
    - '정답 형태: 마지막 줄에 print(list(channelSummary), list(brokenSummary))'
  check:
    type: outputExact
    evidence: practice
    outputExact: |-
      {'orders': 2, 'revenue': 165000} {'orders': 1, 'revenue': 45000}
      ['offline', 'online', 'partner'] ['online', 'offline', 'partner']
    resultCheck: "출력이 정확히 일치해야 합니다: \\"{'orders': 2, 'revenue': 165000} {'orders': 1, 'revenue': 45000}\\n['offline', 'online', 'partner'] ['online', 'offline', 'partner']\\""
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: itertools 마스터하기
  goal: 무한 count에서 islice로 세 개씩 네 번 꺼내는 배치 함수를 만들고, 다 꺼낸 뒤 남은 이터레이터가 어디서 이어지는지까지 확인한다.
  why: 끝을 모르는 스트림은 통째로 리스트에 담을 수 없으므로 필요한 만큼만 꺼내 처리하고 다음에 이어 읽는 배치 루프가 기본형이 되며, 이 모양이 로그 처리와 페이지 단위 API 호출에 그대로 쓰입니다.
  explanation: |-
    마지막 셀에서는 앞의 여섯 절을 한 흐름으로 잇습니다. 무한 이터레이터를 만들고, islice로 잘라 배치를 만들고, accumulate로 배치 결과를 누적합니다.

    배치 루프의 핵심은 두 가지입니다. 첫째, islice에 리스트가 아니라 이터레이터를 넘겨야 다음 호출이 이어집니다. 리스트를 넘기면 매번 앞에서부터 다시 잘립니다. 둘째, 꺼낸 조각이 비면 원본이 끝난 것이므로 그때 루프를 멈춰야 합니다. 무한 이터레이터에서는 이 조건이 걸리지 않지만, 유한한 입력에도 같은 함수를 쓰려면 필요합니다.

    마지막에 next(evens)로 다음 값을 하나 꺼내 보면 이터레이터가 소비한 만큼 앞으로 이동해 있다는 것이 숫자로 드러납니다.
  tips:
  - islice 는 리스트에도 쓸 수 있지만 그때는 매번 처음부터 자릅니다. 이어 읽으려면 이터레이터를 그대로 넘겨야 합니다.
  snippet: |-
    from itertools import count, islice

    evens = count(0, 2)
    list(islice(evens, 5))
  exercise:
    prompt: |-
      무한 이터레이터에서 필요한 만큼만 꺼내는 배치 함수를 직접 만드세요. 고칠 곳은 세 군데입니다.
      1. import 줄을 from itertools import accumulate, count, islice 로 바꿉니다.
      2. 그 아래에 takeBatches(source, size, batchCount)를 만듭니다. 빈 리스트 batches를 두고 batchCount번 반복하며 batch = list(islice(source, size)) 를 만들고, batch가 비었으면 break, 아니면 batches에 넣습니다. 마지막에 batches를 반환합니다.
      3. 마지막 줄을 지우고 batches = takeBatches(evens, 3, 4), totals = [sum(batch) for batch in batches], running = list(accumulate(totals)) 를 만든 뒤 batches, totals, running, next(evens) 를 표시합니다.

      evens는 리스트가 아니라 값을 하나씩 내주는 이터레이터라 islice가 꺼낸 만큼 앞으로 나아갑니다. 세 개씩 네 번, 즉 열두 개를 꺼냈으니 다음 값은 24입니다. 그래서 ([[0, 2, 4], [6, 8, 10], [12, 14, 16], [18, 20, 22]], [6, 24, 42, 60], [6, 30, 72, 132], 24)가 나와야 합니다.
    starterCode: |-
      from itertools import count, islice

      evens = count(0, 2)
      list(islice(evens, 5))
    solution: |-
      from itertools import accumulate, count, islice

      def takeBatches(source, size, batchCount):
          batches = []
          for _ in range(batchCount):
              batch = list(islice(source, size))
              if not batch:
                  break
              batches.append(batch)
          return batches

      evens = count(0, 2)
      batches = takeBatches(evens, 3, 4)
      totals = [sum(batch) for batch in batches]
      running = list(accumulate(totals))
      batches, totals, running, next(evens)
    hints:
    - takeBatches 안에서 islice 에 넘기는 것은 source 그 자체입니다. list(source) 로 먼저 받으면 무한 이터레이터에서 멈추지 않습니다.
    - '정답 형태: batches, totals, running, next(evens)'
  check:
    type: outputExact
    evidence: practice
    outputExact: '([[0, 2, 4], [6, 8, 10], [12, 14, 16], [18, 20, 22]], [6, 24, 42, 60], [6, 30, 72, 132], 24)'
    resultCheck: "출력이 정확히 일치해야 합니다: '([[0, 2, 4], [6, 8, 10], [12, 14, 16], [18, 20, 22]], [6, 24, 42, 60], [6, 30, 72, 132], 24)'"
assessment:
  masteryVariants:
  - id: 05_advanced_itertools-paid-sales-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - groupby
    - accumulate
    - workflow_validation
    title: 정렬 후 groupby로 채널별 유료 매출 요약 만들기
    subtitle: sorted groupby revenue report
    goal: 판매 이벤트 목록을 받아 paid 이벤트만 채널별로 묶고 주문 수, 매출, 평균 주문액, 채널 순서를 반환한다.
    why: itertools의 groupby는 SQL처럼 알아서 같은 키를 모아주지 않기 때문에, 정렬과 그룹 이터레이터 소비를 함께 검증해야 합니다.
    explanation: summarize_paid_sales_by_channel(events)를 완성해 status가 paid인 이벤트만 channel 기준으로 정렬한 뒤 groupby로 요약하세요.
    tips:
    - groupby 전에 channel로 정렬해야 같은 채널이 하나의 그룹이 됩니다.
    - amount가 음수이면 매출 데이터가 깨진 것이므로 ValueError로 막으세요.
    exercise:
      prompt: summarize_paid_sales_by_channel(events)를 완성해 채널별 orders, revenue, averageOrder, channelOrder를 반환하세요.
      starterCode: |-
        def summarize_paid_sales_by_channel(events):
            raise NotImplementedError
      solution: |-
        def summarize_paid_sales_by_channel(events):
            from itertools import groupby

            for event in events:
                if event["amount"] < 0:
                    raise ValueError("amount must be non-negative")

            paid_events = sorted(
                (event for event in events if event["status"] == "paid"),
                key=lambda event: event["channel"],
            )
            summary = {}
            for channel, grouped_events in groupby(paid_events, key=lambda event: event["channel"]):
                group_list = list(grouped_events)
                revenue = sum(event["amount"] for event in group_list)
                summary[channel] = {
                    "orders": len(group_list),
                    "revenue": revenue,
                    "averageOrder": revenue // len(group_list),
                }
            return {
                "summary": summary,
                "channelOrder": list(summary),
            }
      hints:
      - grouped_events는 한 번 순회하면 소진되므로 list로 고정하세요.
      - 평균은 정수 나눗셈으로 반환하세요.
    check:
      id: python.advanced.itertools.paid-sales.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.itertools.empty.behavior.v1.fixture
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
        entry: summarize_paid_sales_by_channel
        cases:
        - id: groups-paid-events-after-sorting
          arguments:
          - value:
            - channel: online
              amount: 120000
              status: paid
            - channel: offline
              amount: 80000
              status: paid
            - channel: online
              amount: 45000
              status: paid
            - channel: online
              amount: 30000
              status: refund
            - channel: partner
              amount: 55000
              status: paid
            - channel: offline
              amount: 70000
              status: paid
          expectedReturn:
            summary:
              offline:
                orders: 2
                revenue: 150000
                averageOrder: 75000
              online:
                orders: 2
                revenue: 165000
                averageOrder: 82500
              partner:
                orders: 1
                revenue: 55000
                averageOrder: 55000
            channelOrder:
            - offline
            - online
            - partner
        - id: rejects-negative-amount
          arguments:
          - value:
            - channel: online
              amount: -1
              status: paid
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 05_advanced_itertools-variant-grid-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - infinite_iterators
    - terminating_iterators
    - combinatoric
    title: product와 islice로 상품 옵션 조합 미리보기 만들기
    subtitle: bounded variant preview
    goal: 색상, 사이즈, 차단 조합을 받아 가능한 옵션 전체 수와 제한된 미리보기 목록을 반환한다.
    why: 전이 과제에서는 itertools를 매출 요약 밖으로 옮겨, 많은 조합을 만들 때 필요한 만큼만 보여주는 실무 감각을 확인합니다.
    explanation: build_variant_grid(colors, sizes, blocked, limit=4)를 완성해 product로 조합을 만들고 blocked를 제외한 뒤 islice로 preview를
      제한하세요.
    tips:
    - colors나 sizes가 비어 있으면 조합 의미가 없으므로 ValueError로 막으세요.
    - blocked는 color-size 문자열 기준으로 비교하세요.
    exercise:
      prompt: build_variant_grid(colors, sizes, blocked, limit=4)를 완성해 preview, totalCount, blockedCount를 반환하세요.
      starterCode: |-
        def build_variant_grid(colors, sizes, blocked, limit=4):
            raise NotImplementedError
      solution: |-
        def build_variant_grid(colors, sizes, blocked, limit=4):
            from itertools import islice, product

            if not colors or not sizes:
                raise ValueError("colors and sizes are required")
            blocked_set = set(blocked)
            variants = [
                f"{color}-{size}"
                for color, size in product(colors, sizes)
                if f"{color}-{size}" not in blocked_set
            ]
            return {
                "preview": list(islice(iter(variants), limit)),
                "totalCount": len(variants),
                "blockedCount": len(blocked_set),
            }
      hints:
      - product(colors, sizes)는 색상과 사이즈의 모든 순서쌍을 만듭니다.
      - islice로 preview 개수를 제한하세요.
    check:
      id: python.advanced.itertools.variant-grid.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.itertools.empty.behavior.v1.fixture
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
        entry: build_variant_grid
        cases:
        - id: builds-bounded-preview-and-counts
          arguments:
          - value:
            - red
            - blue
          - value:
            - S
            - M
            - L
          - value:
            - blue-L
          - value: 4
          expectedReturn:
            preview:
            - red-S
            - red-M
            - red-L
            - blue-S
            totalCount: 5
            blockedCount: 1
        - id: rejects-empty-colors
          arguments:
          - value: []
          - value:
            - S
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 05_advanced_itertools-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 05_advanced_itertools-variant-grid-transfer
    title: groupby, islice, zip_longest, accumulate 사용처 회상하기
    subtitle: iterator tool recall
    goal: 목적 이름을 받아 적절한 itertools 도구와 정렬 또는 종료 제한 필요 여부를 반환한다.
    why: 시간이 지나도 남아야 할 지식은 함수 목록보다, 무한 이터레이터 제한과 groupby 정렬 조건처럼 실수를 막는 선택 기준입니다.
    explanation: choose_itertools_tool(goal)를 완성해 group-contiguous, limit-infinite, fill-shorter-zip, running-total 목적별 도구를
      고르세요.
    tips:
    - groupby는 같은 key가 붙어 있어야 제대로 묶입니다.
    - count, cycle 같은 무한 이터레이터에는 islice 같은 제한 도구가 필요합니다.
    exercise:
      prompt: choose_itertools_tool(goal)를 완성해 목적별 itertools 도구 선택 결과를 반환하세요.
      starterCode: |-
        def choose_itertools_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_itertools_tool(goal):
            table = {
                "group-contiguous": {
                    "tool": "groupby",
                    "requiresSortedInput": True,
                    "preventsInfiniteLoop": False,
                },
                "limit-infinite": {
                    "tool": "islice",
                    "requiresSortedInput": False,
                    "preventsInfiniteLoop": True,
                },
                "fill-shorter-zip": {
                    "tool": "zip_longest",
                    "requiresSortedInput": False,
                    "preventsInfiniteLoop": False,
                },
                "running-total": {
                    "tool": "accumulate",
                    "requiresSortedInput": False,
                    "preventsInfiniteLoop": False,
                },
            }
            if goal not in table:
                raise ValueError("unknown itertools goal")
            return table[goal]
      hints:
      - groupby의 핵심 주의점은 정렬 또는 같은 key의 연속성입니다.
      - islice는 무한 시퀀스에서 필요한 개수만 꺼낼 때 씁니다.
    check:
      id: python.advanced.itertools.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.itertools.empty.behavior.v1.fixture
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
        entry: choose_itertools_tool
        cases:
        - id: recalls-groupby-sorted-input-risk
          arguments:
          - value: group-contiguous
          expectedReturn:
            tool: groupby
            requiresSortedInput: true
            preventsInfiniteLoop: false
        - id: recalls-islice-for-infinite-iterator
          arguments:
          - value: limit-infinite
          expectedReturn:
            tool: islice
            requiresSortedInput: false
            preventsInfiniteLoop: true
        - id: rejects-unknown-goal
          arguments:
          - value: mutate-list
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