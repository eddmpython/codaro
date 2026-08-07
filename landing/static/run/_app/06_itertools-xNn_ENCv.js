var e=`meta:
  id: 06_itertools
  title: itertools - 이터레이터 도구
  category: builtins
  tags:
  - itertools
  - iterator
  - combinations
  - permutations
  - cycle
  seo:
    title: 파이썬 itertools 모듈 완전 정복
    description: itertools 모듈의 무한 이터레이터, 조합, 순열, 그룹화 등을 배웁니다.
    keywords:
    - itertools
    - 이터레이터
    - 조합
    - 순열
    - permutations
    - combinations
intro:
  emoji: 🔄
  points:
  - 무한 이터레이터 생성
  - 조합과 순열 계산
  - 이터레이터 체이닝과 병합
  - 그룹화와 필터링
  direction: itertools 이터레이터 도구에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - itertools 이터레이터 도구 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: itertools 모듈 불러오 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 무한 이터레이터 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 조합과 순열 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: itertools 이터레이터 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: itertools 이터레이터 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: itertools 이터레이터 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: itertools 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: 가져온 itertools 이름 두 개를 이어 붙여 끝없이 이어지는 카운터에서 앞 세 개만 꺼내 본다.
  why: itertools 함수는 값을 미리 만들어 두지 않고 요청받을 때 하나씩 내주기 때문에 무엇을 가져왔는지보다 가져온 것을 어디서 끊고 어떻게 확정 값으로 바꾸는지가 먼저이고, 이 첫 셀을 실행해 두어야 뒤의 예제들이 import 줄을 다시 쓰지 않고 바로 이어집니다.
  explanation: |-
    itertools는 파이썬 표준 라이브러리입니다. 반복을 리스트로 펼치지 않고 필요한 만큼만 흘려보내는 이터레이터 도구를 모아 둔 모듈이며, 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 모듈의 함수는 대부분 리스트가 아니라 이터레이터를 돌려줍니다. 그대로 화면에 두면 값이 아니라 객체 주소가 찍히므로 list()나 sum()으로 소비해 확정 값으로 바꾼 뒤 확인합니다.
  snippet: |-
    from itertools import count, cycle, repeat, islice, combinations, permutations, product, chain, zip_longest, tee, filterfalse, takewhile, dropwhile, groupby, accumulate, combinations_with_replacement

    # 모듈 로드 확인
    'itertools 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: |-
      마지막 줄 'itertools 모듈이 정상적으로 로드되었습니다'를 list(islice(count(10), 3))으로 바꾸세요. 첫 줄 import는 그대로 둡니다.

      count(10)은 10, 11, 12로 끝없이 이어지지만 islice가 앞 세 개에서 끊고 list가 그것을 확정 값으로 바꾸므로 [10, 11, 12]가 나와야 합니다.
    starterCode: |-
      from itertools import count, cycle, repeat, islice, combinations, permutations, product, chain, zip_longest, tee, filterfalse, takewhile, dropwhile, groupby, accumulate, combinations_with_replacement

      # 모듈 로드 확인
      'itertools 모듈이 정상적으로 로드되었습니다'
    solution: |-
      from itertools import count, cycle, repeat, islice, combinations, permutations, product, chain, zip_longest, tee, filterfalse, takewhile, dropwhile, groupby, accumulate, combinations_with_replacement

      # 모듈 로드 확인
      list(islice(count(10), 3))
    hints:
    - 마지막 줄의 문자열을 지우고 그 자리에 list(islice(count(10), 3)) 을 씁니다. 안쪽부터 만들고, 끊고, 확정하는 순서입니다.
    - list() 를 빼면 값 대신 <itertools.islice object at 0x...> 처럼 주소가 찍히고 실행할 때마다 달라집니다.
    - "정답 형태: list(islice(count(10), 3))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '[10, 11, 12]'
    resultCheck: "출력이 정확히 일치해야 합니다: '[10, 11, 12]'"
- id: infinite_iterators
  title: 무한 이터레이터
  structuredPrimary: true
  subtitle: count, cycle, repeat
  goal: count에 시작값과 걸음 폭을 주고 같은 이터레이터를 두 번 잘라 두 번째가 처음이 아니라 멈춘 자리에서 이어지는 것을 확인한다.
  why: 이터레이터는 어디까지 내줬는지를 스스로 기억하기 때문에 같은 변수를 두 번 소비하면 처음부터 다시 나올 것이라고 착각한 코드가 예외 하나 없이 이어진 값이나 빈 결과를 내놓고, 이 착각은 배치 재시도나 두 번 집계에서 그대로 잘못된 숫자가 됩니다.
  explanation: |-
    count는 끝이 없는 카운터입니다. count(start, step) 형태로 시작값과 걸음 폭을 줄 수 있고, cycle은 주어진 항목을 계속 돌리며, repeat는 같은 값을 반복해서 내줍니다. 셋 다 스스로 멈추지 않으므로 islice나 break로 끊어야 합니다.

    끊는 것만큼 중요한 것이 상태입니다. islice는 이터레이터에서 값을 실제로 꺼내 가므로, 같은 이터레이터를 다시 자르면 앞에서 멈춘 자리부터 이어집니다.
  snippet: |-
    counter = count(0)
    first5 = list(islice(counter, 5))
    first5
  exercise:
    prompt: |-
      세 곳을 고치세요. counter = count(0)을 counter = count(10, 5)로 바꾸고, first5 줄 아래에 nextTwo = list(islice(counter, 2))를 추가하고, 마지막 줄 first5를 first5, nextTwo로 바꾸세요.

      count(10, 5)는 10부터 5씩 커지고 두 번째 islice는 처음이 아니라 앞에서 멈춘 30 다음부터 이어 가므로 ([10, 15, 20, 25, 30], [35, 40])이 나와야 합니다.
    starterCode: |-
      counter = count(0)
      first5 = list(islice(counter, 5))
      first5
    solution: |-
      counter = count(10, 5)
      first5 = list(islice(counter, 5))
      nextTwo = list(islice(counter, 2))
      first5, nextTwo
    hints:
    - count(10, 5) 의 두 번째 인자가 걸음 폭입니다. count(10) 처럼 하나만 주면 1 씩 커집니다.
    - nextTwo 는 새 카운터를 만들지 않고 같은 counter 를 다시 자릅니다. 여기에 count(10, 5) 를 한 번 더 쓰면 35 가 아니라 10 부터 다시 나옵니다.
    - "정답 형태: nextTwo = list(islice(counter, 2))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([10, 15, 20, 25, 30], [35, 40])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([10, 15, 20, 25, 30], [35, 40])'"
- id: combinatorics
  title: 조합과 순열
  structuredPrimary: true
  subtitle: combinations, permutations, product
  goal: 같은 후보 목록에서 조합과 순열을 각각 만들어 개수가 몇 배로 갈리는지 직접 세어 비교한다.
  why: 순서를 따지는지 아닌지를 잘못 고르면 경우의 수가 두 배로 어긋나 A/B 테스트 조합 수나 대진표 개수가 통째로 틀리는데, 이 차이는 설명을 읽는 것보다 두 개수를 나란히 찍어 보는 편이 훨씬 빨리 몸에 붙습니다.
  explanation: |-
    combinations는 순서를 따지지 않아 ('A', 'B')와 ('B', 'A')를 같은 것으로 보고 하나만 냅니다. permutations는 둘을 다른 것으로 보고 둘 다 내며, product는 서로 다른 목록끼리 짝지어 데카르트 곱을 만듭니다.

    세 함수 모두 이터레이터를 돌려주므로 개수를 세려면 list로 확정한 뒤 len을 씁니다. 후보가 조금만 늘어도 결과가 급격히 커지니 개수를 먼저 확인하는 습관이 안전합니다.
  snippet: |-
    choices = ['A', 'B', 'C']
    pairs = list(combinations(choices, 2))
    pairs
  exercise:
    prompt: |-
      두 곳을 고치세요. pairs 줄 아래에 ordered = list(permutations(choices, 2))를 추가하고, 마지막 줄 pairs를 len(pairs), len(ordered), ordered[:2]로 바꾸세요.

      combinations는 ('A', 'B')만 세고 permutations는 ('A', 'B')와 ('B', 'A')를 따로 세므로 개수가 3과 6으로 갈려 (3, 6, [('A', 'B'), ('A', 'C')])가 나와야 합니다.
    starterCode: |-
      choices = ['A', 'B', 'C']
      pairs = list(combinations(choices, 2))
      pairs
    solution: |-
      choices = ['A', 'B', 'C']
      pairs = list(combinations(choices, 2))
      ordered = list(permutations(choices, 2))
      len(pairs), len(ordered), ordered[:2]
    hints:
    - permutations 도 combinations 와 같은 자리에 뽑을 개수 2 를 받습니다. 뒤 인자는 그대로 두세요.
    - ordered[:2] 는 순열 여섯 개 중 앞 두 개만 보여 주는 슬라이스입니다. ordered 를 통째로 두면 기대 출력과 달라집니다.
    - "정답 형태: len(pairs), len(ordered), ordered[:2]"
  check:
    type: outputExact
    evidence: practice
    outputExact: "(3, 6, [('A', 'B'), ('A', 'C')])"
    resultCheck: "출력이 정확히 일치해야 합니다: (3, 6, [('A', 'B'), ('A', 'C')])"
- id: chaining
  title: 이터레이터 연결
  structuredPrimary: true
  subtitle: chain, zip_longest, tee
  goal: 길이가 다른 두 목록을 chain으로 이어 붙이는 경우와 zip_longest로 짝짓는 경우를 한 셀에서 비교한다.
  why: 두 목록을 합칠 때 뒤에 붙일 것인지 나란히 짝지을 것인지에 따라 결과 모양이 완전히 달라지고, 길이가 다를 때 기본 zip은 남는 항목을 말없이 버려서 행이 조용히 사라지는 반면 zip_longest는 빈 자리를 채워 손실을 드러냅니다.
  explanation: |-
    chain은 여러 이터러블을 앞뒤로 이어 하나처럼 흘려보냅니다. 리스트끼리 +로 붙이는 것과 결과는 같지만 새 리스트를 만들지 않아 큰 데이터에서도 메모리가 늘지 않습니다. 중첩 목록을 한 겹 펼칠 때는 chain.from_iterable을 씁니다.

    zip_longest는 짧은 쪽이 끝나도 멈추지 않고 fillvalue로 채웁니다. fillvalue를 주지 않으면 None이 들어가므로, 뒤에서 숫자로 계산할 값이라면 0처럼 계산 가능한 기본값을 직접 지정합니다.
  snippet: |-
    list1 = [1, 2, 3]
    list2 = [4, 5]
    combined = list(chain(list1, list2))
    combined
  exercise:
    prompt: |-
      두 곳을 고치세요. combined 줄 아래에 padded = list(zip_longest(list1, list2, fillvalue=0))를 추가하고, 마지막 줄 combined를 combined, padded로 바꾸세요.

      chain은 두 목록을 이어 붙여 다섯 개짜리 하나로 만들고 zip_longest는 짧은 list2의 빈 자리를 0으로 채워 세 쌍을 만들므로 ([1, 2, 3, 4, 5], [(1, 4), (2, 5), (3, 0)])이 나와야 합니다.
    starterCode: |-
      list1 = [1, 2, 3]
      list2 = [4, 5]
      combined = list(chain(list1, list2))
      combined
    solution: |-
      list1 = [1, 2, 3]
      list2 = [4, 5]
      combined = list(chain(list1, list2))
      padded = list(zip_longest(list1, list2, fillvalue=0))
      combined, padded
    hints:
    - fillvalue=0 을 빼면 마지막 쌍이 (3, 0) 이 아니라 (3, None) 이 됩니다.
    - 기본 zip 을 쓰면 짝이 없는 3 이 통째로 사라져 두 쌍만 남습니다. 여기서는 zip_longest 를 씁니다.
    - "정답 형태: padded = list(zip_longest(list1, list2, fillvalue=0))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([1, 2, 3, 4, 5], [(1, 4), (2, 5), (3, 0)])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([1, 2, 3, 4, 5], [(1, 4), (2, 5), (3, 0)])'"
- id: filtering
  title: 필터링과 슬라이싱
  structuredPrimary: true
  subtitle: islice, filterfalse, takewhile, dropwhile
  goal: 같은 숫자 목록에 takewhile과 filterfalse를 걸어 조건이 깨지는 자리에서 멈추는 것과 끝까지 훑는 것의 차이를 눈으로 확인한다.
  why: 첫 위반에서 멈출지 끝까지 볼지는 정렬된 로그의 앞부분만 잘라 낼 때와 예외 항목을 하나도 놓치지 않고 모을 때를 가르는 선택이라, 둘을 바꿔 쓰면 뒤에 남은 데이터를 통째로 못 보고도 오류가 나지 않아 사고를 늦게 발견합니다.
  explanation: |-
    islice는 값이 아니라 위치로 자릅니다. islice(numbers, 2, 5)는 조건과 무관하게 2번부터 4번까지를 가져옵니다.

    takewhile은 조건이 참인 동안만 내주다가 처음 거짓을 만나면 그 자리에서 끝냅니다. 뒤에 조건을 만족하는 값이 더 있어도 보지 않습니다. filterfalse는 반대로 끝까지 훑으면서 조건이 거짓인 항목만 남깁니다.
  snippet: |-
    numbers = [1, 3, 5, 4, 7, 9]
    sliced = list(islice(numbers, 2, 5))
    sliced
  exercise:
    prompt: |-
      세 곳을 고치세요. 둘째 줄 sliced = list(islice(numbers, 2, 5))를 leadingOdds = list(takewhile(lambda n: n % 2 == 1, numbers))로 바꾸고, 그 아래에 allEvens = list(filterfalse(lambda n: n % 2 == 1, numbers))를 추가하고, 마지막 줄 sliced를 leadingOdds, allEvens로 바꾸세요.

      takewhile은 짝수 4를 만나는 순간 멈춰 뒤의 7과 9를 보지 못하고 filterfalse는 끝까지 훑어 홀수가 아닌 4만 남기므로 ([1, 3, 5], [4])가 나와야 합니다.
    starterCode: |-
      numbers = [1, 3, 5, 4, 7, 9]
      sliced = list(islice(numbers, 2, 5))
      sliced
    solution: |-
      numbers = [1, 3, 5, 4, 7, 9]
      leadingOdds = list(takewhile(lambda n: n % 2 == 1, numbers))
      allEvens = list(filterfalse(lambda n: n % 2 == 1, numbers))
      leadingOdds, allEvens
    hints:
    - 두 함수 모두 조건 함수를 첫 인자로 받습니다. n % 2 == 1 은 홀수일 때 참입니다.
    - takewhile 결과에 7 과 9 가 없는 것이 정상입니다. 멈춘 뒤로는 아예 읽지 않기 때문입니다.
    - "정답 형태: allEvens = list(filterfalse(lambda n: n % 2 == 1, numbers))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([1, 3, 5], [4])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([1, 3, 5], [4])'"
- id: grouping
  title: 그룹화와 누적
  structuredPrimary: true
  subtitle: groupby, accumulate
  goal: groupby 앞에 정렬을 넣어 두 조각으로 갈라졌던 그룹을 하나로 합치고, accumulate로 원래 순서의 누적 합을 함께 만든다.
  why: groupby는 전체를 보지 않고 바로 옆 값만 비교하기 때문에 정렬을 빠뜨리면 같은 키가 여러 조각으로 갈라지는데, 예외가 나지 않고 개수만 조용히 어긋나서 그대로 리포트에 실리면 나중에 원인을 찾기가 가장 어렵습니다.
  explanation: |-
    groupby는 이웃한 같은 값만 한 덩어리로 묶습니다. 그래서 같은 키가 떨어져 있으면 별도 그룹이 되고, 이것을 막으려면 같은 key 기준으로 먼저 정렬해야 합니다. 그룹 안의 g는 이터레이터라 그 자리에서 list나 len으로 소비하지 않으면 다음 그룹으로 넘어갈 때 사라집니다.

    accumulate는 앞에서부터 차례로 더한 값을 하나씩 내줍니다. 정렬하지 않은 원본에 걸면 입력 순서 그대로의 누적이 되므로, 그룹화용 정렬과 누적용 원본을 섞지 않는 것이 중요합니다.
  snippet: |-
    data = [1, 1, 2, 2, 2, 3, 1]
    grouped = [(k, len(list(g))) for k, g in groupby(data)]
    grouped
  exercise:
    prompt: |-
      세 곳을 고치세요. groupby(data)를 groupby(sorted(data))로 감싸고, 그 아래에 runningTotal = list(accumulate(data)) 줄을 추가하고, 마지막 줄 grouped를 grouped, runningTotal로 바꾸세요.

      정렬 전에는 1이 앞뒤로 떨어져 있어 두 조각으로 세지지만 정렬하면 한 그룹으로 합쳐지고 accumulate는 정렬하지 않은 원본을 앞에서부터 더하므로 ([(1, 3), (2, 3), (3, 1)], [1, 2, 4, 6, 8, 11, 12])가 나와야 합니다.
    starterCode: |-
      data = [1, 1, 2, 2, 2, 3, 1]
      grouped = [(k, len(list(g))) for k, g in groupby(data)]
      grouped
    solution: |-
      data = [1, 1, 2, 2, 2, 3, 1]
      grouped = [(k, len(list(g))) for k, g in groupby(sorted(data))]
      runningTotal = list(accumulate(data))
      grouped, runningTotal
    hints:
    - groupby(data) 의 data 만 sorted(data) 로 감쌉니다. 원본 data 는 그대로 두어야 accumulate 가 입력 순서를 지킵니다.
    - 고치기 전 결과 [(1, 2), (2, 3), (3, 1), (1, 1)] 에서 1 이 두 번 나오는 것이 바로 정렬을 빠뜨린 흔적입니다.
    - "정답 형태: grouped = [(k, len(list(g))) for k, g in groupby(sorted(data))]"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([(1, 3), (2, 3), (3, 1)], [1, 2, 4, 6, 8, 11, 12])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([(1, 3), (2, 3), (3, 1)], [1, 2, 4, 6, 8, 11, 12])'"
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: itertools 실무 패턴
  goal: 배치 생성기에 리스트 대신 이터레이터를 넘겨 한 번 소진된 뒤 두 번째 호출이 빈 결과가 되는 것을 확인한다.
  why: 배치 처리 함수에 이터레이터를 넘기면 메모리는 아끼지만 그 자리에서 소진되기 때문에, 같은 입력으로 한 번 더 돌리는 재시도나 이중 집계 코드가 오류 하나 없이 0건을 처리하고 성공으로 끝나 버립니다.
  explanation: |-
    chunk는 iter로 반복자를 하나 만들고 islice로 size개씩 잘라 내는 배치 생성기입니다. 전체를 리스트로 펼치지 않으므로 입력이 아무리 커도 한 번에 메모리에 올라가는 것은 배치 하나뿐이고, API 호출을 100건씩 묶어 보내는 코드가 이 모양입니다.

    다만 넘기는 것이 리스트인지 이터레이터인지가 결과를 가릅니다. range나 리스트는 몇 번이든 처음부터 다시 읽히지만 iter로 감싼 이터레이터는 한 번 읽으면 그대로 끝납니다.
  snippet: |-
    def chunk(iterable, size):
        iterator = iter(iterable)
        while True:
            batch = list(islice(iterator, size))
            if not batch:
                break
            yield batch

    dataset = range(10)
    batches = list(chunk(dataset, 3))
    batches
  exercise:
    prompt: |-
      네 곳을 고치세요. dataset = range(10)을 dataset = iter(range(10))으로 바꾸고, chunk(dataset, 3)의 3을 4로 바꾸고, 그 아래에 again = list(chunk(dataset, 4)) 줄을 추가하고, 마지막 줄 batches를 [sum(batch) for batch in batches], again으로 바꾸세요. chunk 함수 본문은 그대로 둡니다.

      크기 4로 나누면 배치가 [0, 1, 2, 3], [4, 5, 6, 7], [8, 9]가 되어 합이 6, 22, 17이고 dataset은 이미 다 읽혀 두 번째 호출은 빈 목록이 되므로 ([6, 22, 17], [])이 나와야 합니다.
    starterCode: |-
      def chunk(iterable, size):
          iterator = iter(iterable)
          while True:
              batch = list(islice(iterator, size))
              if not batch:
                  break
              yield batch

      dataset = range(10)
      batches = list(chunk(dataset, 3))
      batches
    solution: |-
      def chunk(iterable, size):
          iterator = iter(iterable)
          while True:
              batch = list(islice(iterator, size))
              if not batch:
                  break
              yield batch

      dataset = iter(range(10))
      batches = list(chunk(dataset, 4))
      again = list(chunk(dataset, 4))
      [sum(batch) for batch in batches], again
    hints:
    - range(10) 자체는 소진되지 않습니다. iter() 로 감싸야 한 번만 읽히는 이터레이터가 되어 두 번째 호출이 비게 됩니다.
    - again 은 dataset 을 다시 만들지 않고 그대로 넘깁니다. iter(range(10)) 을 한 번 더 쓰면 두 번째도 값이 나와 기대 출력과 달라집니다.
    - "정답 형태: again = list(chunk(dataset, 4)) 이고 마지막 줄은 [sum(batch) for batch in batches], again"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([6, 22, 17], [])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([6, 22, 17], [])'"
- id: workflow_validation
  title: '검증 루프: 이터레이터 데이터 파이프라인'
  structuredPrimary: true
  subtitle: 배치, groupby 정렬, 조합 탐색 검증
  goal: 배치 크기를 올려 깨지는 배치 길이 assert를 맞추고, 크기를 바꿔도 변하면 안 되는 지역별 합계를 새 assert로 잠근다.
  why: 배치 크기는 처리량 때문에 자주 손대는 값인데 바뀌어도 펼친 결과와 지역 합계는 그대로여야 하므로, 무엇이 달라져야 하고 무엇이 달라지면 안 되는지를 assert로 나눠 두면 크기를 만질 때마다 파이프라인 전체를 다시 믿을 수 있습니다.
  explanation: |-
    이 셀은 이터레이터 파이프라인의 두 전제를 함께 검사합니다. chunkRecords는 원본을 한 번만 훑어 배치로 나누고, chain.from_iterable은 그 배치를 다시 한 겹 펼치며, totalsByRegion은 groupby 앞에 정렬을 두어 같은 지역이 갈라지지 않게 합니다.

    변주 실험
    totalsByRegion에서 sorted를 지우면 어떤 지역이 두 조각으로 갈라지는지, 그리고 그때 regionTotals assert가 어떤 값으로 실패하는지 확인하세요.
  tips:
  - 변주 실험 totalsByRegion에서 sorted를 지우면 어떤 지역이 두 조각으로 갈라지는지, 그리고 그때 regionTotals assert가 어떤 값으로 실패하는지 확인하세요.
  snippet: |-
    orderRows = [
        {"orderId": "O-101", "region": "KR", "amount": 120},
        {"orderId": "O-102", "region": "US", "amount": 80},
        {"orderId": "O-103", "region": "KR", "amount": 150},
        {"orderId": "O-104", "region": "JP", "amount": 60},
        {"orderId": "O-105", "region": "US", "amount": 90},
    ]

    def chunkRecords(records, size):
        if size <= 0:
            raise ValueError("size must be positive")
        iterator = iter(records)
        while True:
            batch = list(islice(iterator, size))
            if not batch:
                break
            yield batch

    def totalsByRegion(records):
        ordered = sorted(records, key=lambda row: row["region"])
        return [
            (region, sum(row["amount"] for row in group))
            for region, group in groupby(ordered, key=lambda row: row["region"])
        ]

    orderBatches = list(chunkRecords(orderRows, size=2))
    flattenedOrders = list(chain.from_iterable(orderBatches))
    regionTotals = totalsByRegion(flattenedOrders)

    assert [len(batch) for batch in orderBatches] == [2, 2, 1]
    assert flattenedOrders == orderRows
    assert sum(row["amount"] for row in flattenedOrders) == 500

    [len(batch) for batch in orderBatches], regionTotals
  exercise:
    prompt: |-
      세 곳을 고치세요. chunkRecords(orderRows, size=2)의 size를 3으로 올리고, assert [len(batch) for batch in orderBatches] == [2, 2, 1]의 기대값을 [3, 2]로 바꾸고, 마지막 assert 줄 아래에 assert regionTotals == [("JP", 60), ("KR", 270), ("US", 170)] 한 줄을 추가하세요. 두 함수 본문과 orderRows는 그대로 둡니다.

      다섯 건을 3개씩 나누면 배치가 3건과 2건으로 갈리지만 펼친 결과와 지역별 합계는 그대로이므로 ([3, 2], [('JP', 60), ('KR', 270), ('US', 170)])이 나와야 합니다.
    starterCode: |-
      orderRows = [
          {"orderId": "O-101", "region": "KR", "amount": 120},
          {"orderId": "O-102", "region": "US", "amount": 80},
          {"orderId": "O-103", "region": "KR", "amount": 150},
          {"orderId": "O-104", "region": "JP", "amount": 60},
          {"orderId": "O-105", "region": "US", "amount": 90},
      ]

      def chunkRecords(records, size):
          if size <= 0:
              raise ValueError("size must be positive")
          iterator = iter(records)
          while True:
              batch = list(islice(iterator, size))
              if not batch:
                  break
              yield batch

      def totalsByRegion(records):
          ordered = sorted(records, key=lambda row: row["region"])
          return [
              (region, sum(row["amount"] for row in group))
              for region, group in groupby(ordered, key=lambda row: row["region"])
          ]

      orderBatches = list(chunkRecords(orderRows, size=2))
      flattenedOrders = list(chain.from_iterable(orderBatches))
      regionTotals = totalsByRegion(flattenedOrders)

      assert [len(batch) for batch in orderBatches] == [2, 2, 1]
      assert flattenedOrders == orderRows
      assert sum(row["amount"] for row in flattenedOrders) == 500

      [len(batch) for batch in orderBatches], regionTotals
    solution: |-
      orderRows = [
          {"orderId": "O-101", "region": "KR", "amount": 120},
          {"orderId": "O-102", "region": "US", "amount": 80},
          {"orderId": "O-103", "region": "KR", "amount": 150},
          {"orderId": "O-104", "region": "JP", "amount": 60},
          {"orderId": "O-105", "region": "US", "amount": 90},
      ]

      def chunkRecords(records, size):
          if size <= 0:
              raise ValueError("size must be positive")
          iterator = iter(records)
          while True:
              batch = list(islice(iterator, size))
              if not batch:
                  break
              yield batch

      def totalsByRegion(records):
          ordered = sorted(records, key=lambda row: row["region"])
          return [
              (region, sum(row["amount"] for row in group))
              for region, group in groupby(ordered, key=lambda row: row["region"])
          ]

      orderBatches = list(chunkRecords(orderRows, size=3))
      flattenedOrders = list(chain.from_iterable(orderBatches))
      regionTotals = totalsByRegion(flattenedOrders)

      assert [len(batch) for batch in orderBatches] == [3, 2]
      assert flattenedOrders == orderRows
      assert sum(row["amount"] for row in flattenedOrders) == 500
      assert regionTotals == [("JP", 60), ("KR", 270), ("US", 170)]

      [len(batch) for batch in orderBatches], regionTotals
    hints:
    - size 를 올리는 순간 assert [len(batch) ...] == [2, 2, 1] 이 AssertionError 로 먼저 막습니다. 다섯 건을 3 개씩 나누면 [3, 2] 입니다.
    - flattenedOrders 와 금액 합계 assert 는 손대지 않습니다. 배치 크기를 바꿔도 그 둘이 그대로라는 것이 이 파이프라인의 보장입니다.
    - 새로 추가하는 assert 의 지역 순서는 sorted 가 정한 알파벳 순서 JP, KR, US 입니다.
    - '정답 형태: orderBatches = list(chunkRecords(orderRows, size=3)) 와 assert regionTotals == [("JP", 60), ("KR", 270), ("US", 170)]'
  check:
    type: outputExact
    evidence: practice
    outputExact: "([3, 2], [('JP', 60), ('KR', 270), ('US', 170)])"
    resultCheck: "출력이 정확히 일치해야 합니다: ([3, 2], [('JP', 60), ('KR', 270), ('US', 170)])"
- id: practice
  title: itertools 모듈 종합 복습
  structuredPrimary: true
  subtitle: 이터레이터 도구 마스터하기
  goal: count로 확정한 세 값을 chain으로 잇고 accumulate와 combinations로 두 가지 결과를 한 셀에서 만든다.
  why: itertools는 함수 하나로 끝나기보다 만들고, 잇고, 접는 순서로 이어 붙일 때 값을 발휘하는데, 중간 결과를 list로 확정해 두지 않으면 뒤 단계가 이미 비어 버린 이터레이터를 받아 조용히 빈 결과를 내므로 어디서 확정할지가 곧 설계입니다.
  explanation: |-
    이번 셀은 이 강의에서 배운 네 가지를 한 줄기로 잇습니다. count와 islice로 무한한 것에서 유한한 것을 만들고, chain으로 다른 값을 이어 붙이고, accumulate로 앞에서부터 접고, combinations로 같은 값에서 짝을 만듭니다.

    first3처럼 list로 확정해 둔 값은 몇 번이든 다시 읽힙니다. 반대로 countUp을 그대로 뒤 단계에 넘기면 끝이 없어 멈추지 않으므로, 무한한 것과 확정한 것을 구분해서 넘기세요.
  tips:
  - 각 줄이 무엇을 만들고 무엇을 소비하는지 한 줄씩 짚어 보세요. 확정하지 않은 이터레이터를 두 번 쓰면 어디서 비는지 보입니다.
  snippet: |-
    countUp = count(1)
    first3 = list(islice(countUp, 3))
    first3
  exercise:
    prompt: |-
      세 곳을 고치세요. first3 줄 아래에 runningTotal = list(accumulate(chain(first3, [10])))를 추가하고, 그 아래에 pairs = list(combinations(first3, 2))를 추가하고, 마지막 줄 first3를 runningTotal, pairs로 바꾸세요.

      first3는 [1, 2, 3]이고 여기에 10을 이어 붙여 앞에서부터 더하면 1, 3, 6, 16이 되며 같은 세 값에서 두 개씩 뽑는 조합은 세 가지이므로 ([1, 3, 6, 16], [(1, 2), (1, 3), (2, 3)])이 나와야 합니다.
    starterCode: |-
      countUp = count(1)
      first3 = list(islice(countUp, 3))
      first3
    solution: |-
      countUp = count(1)
      first3 = list(islice(countUp, 3))
      runningTotal = list(accumulate(chain(first3, [10])))
      pairs = list(combinations(first3, 2))
      runningTotal, pairs
    hints:
    - chain(first3, [10]) 은 1, 2, 3, 10 을 차례로 내주고 accumulate 가 그것을 앞에서부터 누적합니다. 마지막 16 은 6 에 10 을 더한 값입니다.
    - first3 는 이미 list 라서 combinations 에 다시 넣어도 처음부터 읽힙니다. 자리에 countUp 을 넣으면 끝이 없어 멈추지 않습니다.
    - "정답 형태: runningTotal = list(accumulate(chain(first3, [10])))"
  check:
    type: outputExact
    evidence: practice
    outputExact: '([1, 3, 6, 16], [(1, 2), (1, 3), (2, 3)])'
    resultCheck: "출력이 정확히 일치해야 합니다: '([1, 3, 6, 16], [(1, 2), (1, 3), (2, 3)])'"
assessment:
  masteryVariants:
  - id: 06_itertools-chunk-records-mastery
    mode: mastery
    unseen: true
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
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
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 06_itertools-region-amounts-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 06_itertools-campaign-pairs-transfer
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