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
  goal: 무한 이터레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    itertools는 무한히 값을 생성하는 세 가지 이터레이터를 제공합니다. count는 시작값부터 step씩 증가하는 무한 수열을 생성합니다. cycle은 iterable의 요소를 무한히 반복합니다. repeat은 같은 값을 무한히(또는 지정된 횟수만큼) 반복합니다. 이들은 지연 평가(lazy evaluation)되어 메모리를 거의 사용하지 않습니다. 무한 이터레이터를 사용할 때는 반드시 islice, takewhile 등으로 제한하거나 break로 루프를 종료해야 합니다.

    count와 zip을 조합하면 enumerate와 비슷한 효과를 낼 수 있습니다.
  snippet: |-
    from itertools import count, islice

    counter = count(10, 2)
    list(islice(counter, 5))
  exercise:
    prompt: 무한 이터레이터 예제에서 \`counter\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import count, islice

      counter = count(10, 2)
      list(islice(counter, 5))
    hints:
    - 바꿀 지점은 \`counter = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`counter\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 무한 이터레이터에서 \`counter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 무한 이터레이터 실행 뒤 \`counter\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: terminating_iterators
  title: 종료 이터레이터
  structuredPrimary: true
  subtitle: 시퀀스 제어
  goal: 종료 이터레이터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    종료 이터레이터는 입력 iterable을 가공하여 유한한 결과를 생성합니다. takewhile은 조건이 참인 동안 요소를 가져옵니다. dropwhile은 조건이 참인 동안 요소를 건너뜁니다. islice는 시퀀스의 일부분을 슬라이싱합니다. filterfalse는 filter의 반대로 조건이 거짓인 요소를 반환합니다. 이들은 모두 지연 평가되어 효율적입니다.

    takewhile과 dropwhile은 정렬된 데이터에서 특히 유용합니다.
  snippet: |-
    from itertools import takewhile, dropwhile

    data = [1, 3, 5, 2, 4, 6, 8]
    taken = list(takewhile(lambda x: x < 5, data))
    dropped = list(dropwhile(lambda x: x < 5, data))
    taken, dropped
  exercise:
    prompt: 종료 이터레이터 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import takewhile, dropwhile

      data = [1, 3, 5, 2, 4, 6, 8]
      taken = list(takewhile(lambda x: x < 5, data))
      dropped = list(dropwhile(lambda x: x < 5, data))
      taken, dropped
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 종료 이터레이터에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종료 이터레이터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: combinatoric
  title: 조합 함수
  structuredPrimary: true
  subtitle: 순열, 조합, 곱집합
  goal: 조합 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    itertools는 수학적 조합을 생성하는 함수들을 제공합니다. product는 여러 iterable의 데카르트 곱(모든 조합)을 생성합니다. permutations는 순서가 있는 순열을 생성합니다. combinations는 순서 없는 조합을 생성합니다. combinations_with_replacement는 중복을 허용하는 조합입니다. 이들은 알고리즘 문제 해결이나 가능한 모든 경우를 탐색할 때 유용합니다.

    permutations의 개수는 n!/(n-r)!, combinations는 n!/(r!(n-r)!)입니다.
  snippet: |-
    from itertools import product

    colorList = ["red", "blue"]
    sizes = ["S", "M", "L"]
    list(product(colorList, sizes))
  exercise:
    prompt: 조합 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import product

      colorList = ["red", "blue"]
      sizes = ["S", "M", "L"]
      list(product(colorList, sizes))
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 조합 함수에서 \`colorList\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 조합 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: groupby
  title: groupby 함수
  structuredPrimary: true
  subtitle: 연속 요소 그룹화
  goal: groupby 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    groupby는 iterable의 연속된 동일한 키를 가진 요소들을 그룹화합니다. SQL의 GROUP BY와 다르게, 먼저 데이터를 정렬해야 원하는 그룹화가 됩니다. 정렬 없이 사용하면 같은 키라도 떨어져 있으면 별도의 그룹이 됩니다. groupby는 (키, 그룹 이터레이터) 쌍을 생성하며, 그룹 이터레이터는 한 번만 순회할 수 있습니다. 데이터 분류나 연속 구간 처리에 유용합니다.

    그룹 이터레이터를 바로 list()로 변환해두지 않으면 다음 그룹으로 넘어갈 때 소진됩니다.
  snippet: |-
    from itertools import groupby

    letters = "AAABBBCCAABB"
    grouped = [(k, list(g)) for k, g in groupby(letters)]
    grouped
  exercise:
    prompt: groupby 함수 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      from itertools import groupby

      letters = "AAABBBCCAABB"
      grouped = [(k, list(g)) for k, g in groupby(letters)]
      grouped
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: groupby 함수의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: groupby 함수 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: chain_zip
  title: chain과 zip_longest
  structuredPrimary: true
  subtitle: 이터레이터 연결과 병합
  goal: chain과 ziplongest에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    chain은 여러 iterable을 하나로 연결합니다. chain.from_iterable은 iterable의 iterable을 평탄화합니다. zip_longest는 길이가 다른 iterable들을 zip할 때 짧은 쪽을 fillvalue로 채웁니다. 일반 zip은 가장 짧은 iterable에서 멈추지만, zip_longest는 가장 긴 iterable까지 진행합니다. 이들은 데이터 병합이나 평탄화에 자주 사용됩니다.

    tee는 이터레이터를 복제하지만, 원본 이터레이터를 더 이상 사용하면 안 됩니다.
  snippet: |-
    from itertools import chain

    list1 = [1, 2, 3]
    list2 = [4, 5, 6]
    list3 = [7, 8, 9]
    list(chain(list1, list2, list3))
  exercise:
    prompt: chain과 ziplongest 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import chain

      list1 = [1, 2, 3]
      list2 = [4, 5, 6]
      list3 = [7, 8, 9]
      list(chain(list1, list2, list3))
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: chain과 ziplongest에서 \`list1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: chain과 ziplongest 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: accumulate
  title: accumulate 함수
  structuredPrimary: true
  subtitle: 누적 연산
  goal: accumulate 함수에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    accumulate는 iterable의 누적 결과를 생성합니다. 기본적으로 누적 합계를 계산하지만, func 인자로 다른 연산(곱셈, 최대값 등)을 지정할 수 있습니다. Python 3.8부터는 initial 인자로 초기값을 지정할 수 있습니다. reduce와 비슷하지만, accumulate는 모든 중간 결과를 반환합니다. 누적 합계, 누적 곱, 러닝 맥스/민 등을 계산할 때 유용합니다.

    accumulate는 지연 평가되어 대용량 데이터에서도 효율적입니다.
  snippet: |-
    from itertools import accumulate

    numbers = [1, 2, 3, 4, 5]
    list(accumulate(numbers))
  exercise:
    prompt: accumulate 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import accumulate

      numbers = [1, 2, 3, 4, 5]
      list(accumulate(numbers))
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: accumulate 함수에서 \`numbers\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: accumulate 함수 실행 뒤 \`numbers\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: workflow_validation
  title: 실무 이터레이터 파이프라인
  structuredPrimary: true
  subtitle: 정렬, 그룹화, 조합 실험, 검증
  goal: 실무 이터레이터 파이프라인에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    itertools는 함수 이름을 외우는 것보다, 많은 데이터를 한 번에 만들지 않고 흘려보내며 필요한 결과만 검증하는 감각이 중요합니다. 특히 groupby는 SQL GROUP BY처럼 자동으로 같은 키를 모아주지 않으므로, 실행 전에 정렬 여부가 결과에 어떤 영향을 주는지 예측해야 합니다. 이 실수는 예외가 나지 않는 논리 버그라서 검증이 더 중요합니다.

    itertools를 쓸 때는 결과를 전부 만드는 습관보다, 정렬 조건과 경우의 수를 먼저 예측하고 작은 샘플로 검증하는 습관이 더 중요합니다.
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
    prompt: 실무 이터레이터 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
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
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실무 이터레이터 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실무 이터레이터 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 종합 복습
  structuredPrimary: true
  subtitle: itertools 마스터하기
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Day 5에서 배운 itertools 모듈을 난이도별로 복습합니다. itertools는 효율적인 이터레이터 생성을 위한 표준 라이브러리로, 메모리 효율적인
    데이터 처리의 핵심입니다. 무한 이터레이터(count, cycle, repeat), 종료 이터레이터(chain, groupby, islice), 조합 이터레이터(permutations,
    combinations, product)를 제공합니다. 🟢 기본 문제로 각 함수의 기본 사용법을 익히고, 🟡 응용 문제로 체이닝과 조합을 연습하세요. 🔴 심화 문제에서는 슬라이딩
    윈도우, 배치 처리, 복잡한 순열/조합 문제를 다룹니다. 대용량 데이터 처리와 알고리즘 문제 해결에서 itertools 활용은 필수 스킬입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from itertools import count, islice

    evens = count(0, 2)
    list(islice(evens, 5))
  exercise:
    prompt: 종합 복습 예제에서 \`evens\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      from itertools import count, islice

      evens = count(0, 2)
      list(islice(evens, 5))
    hints:
    - 바꿀 지점은 \`evens = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`evens\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 복습에서 \`evens\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 \`evens\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
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
    independentReview: pending
`;export{e as default};