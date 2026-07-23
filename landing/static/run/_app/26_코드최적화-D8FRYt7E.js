var e=`meta:\r
  id: '26'\r
  title: 코드 최적화\r
  day: 26\r
  category: advancedPython\r
  tags:\r
  - optimization\r
  - performance\r
  - algorithm\r
  - memory\r
  - 검증\r
  - 성능측정\r
  seo:\r
    title: 파이썬 코드 최적화\r
    description: 시간/공간 복잡도 개선, 메모리 최적화, 알고리즘 튜닝 학습\r
    keywords:\r
    - 최적화\r
    - 성능\r
    - 시간복잡도\r
    - 공간복잡도\r
intro:\r
  emoji: ⚡\r
  points:\r
  - 시간 복잡도 개선\r
  - 공간 복잡도 최적화\r
  - 내장 함수 활용\r
  - 알고리즘 선택\r
  direction: 코드 최적화에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 코드 최적화 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 시간 복잡도 개선 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 자료구조 선택 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 메모리 최적화 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 코드 최적화 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 코드 최적화 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 코드 최적화 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: time_complexity\r
  title: 시간 복잡도 개선\r
  structuredPrimary: true\r
  subtitle: O(n²)에서 O(n)으로\r
  goal: 시간 복잡도 개선에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Set을 활용하면 in 연산이 O(1)이 되어 전체 복잡도가 개선됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def findDupSlow(nums):\r
        dups = []\r
        for i in range(len(nums)):\r
            for j in range(i + 1, len(nums)):\r
                if nums[i] == nums[j] and nums[i] not in dups:\r
                    dups.append(nums[i])\r
        return dups\r
\r
    def findDupFast(nums):\r
        seen = set()\r
        dups = set()\r
        for num in nums:\r
            if num in seen:\r
                dups.add(num)\r
            seen.add(num)\r
        return list(dups)\r
\r
    tcNums = [1, 2, 3, 2, 4, 3, 5]\r
    tcSlow = findDupSlow(tcNums)\r
    tcFast = findDupFast(tcNums)\r
    tcResult = (tcSlow, tcFast)\r
    tcResult\r
  exercise:\r
    prompt: 시간 복잡도 개선 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def findDupSlow(nums):\r
          dups = []\r
          for i in range(len(nums)):\r
              for j in range(i + 1, len(nums)):\r
                  if nums[i] == nums[j] and nums[i] not in dups:\r
                      dups.append(nums[i])\r
          return dups\r
\r
      def findDupFast(nums):\r
          seen = set()\r
          dups = set()\r
          for num in nums:\r
              if num in seen:\r
                  dups.add(num)\r
              seen.add(num)\r
          return list(dups)\r
\r
      tcNums = [1, 2, 3, 2, 4, 3, 5]\r
      tcSlow = findDupSlow(tcNums)\r
      tcFast = findDupFast(tcNums)\r
      tcResult = (tcSlow, tcFast)\r
      tcResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시간 복잡도 개선의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 시간 복잡도 개선 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: data_structure\r
  title: 자료구조 선택\r
  structuredPrimary: true\r
  subtitle: 적절한 자료구조로 성능 향상\r
  goal: 자료구조 선택에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: List는 검색 O(n), Set/Dict는 O(1). 검색이 잦으면 Set/Dict를 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dsTestList = list(range(10000))\r
    dsTestSet = set(dsTestList)\r
    dsTestDict = {i: i for i in dsTestList}\r
\r
    dsTarget = 9999\r
    dsListIn = dsTarget in dsTestList\r
    dsSetIn = dsTarget in dsTestSet\r
    dsDictIn = dsTarget in dsTestDict\r
    dsResult = (dsListIn, dsSetIn, dsDictIn)\r
    dsResult\r
  exercise:\r
    prompt: 자료구조 선택 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      dsTestList = list(range(10000))\r
      dsTestSet = set(dsTestList)\r
      dsTestDict = {i: i for i in dsTestList}\r
\r
      dsTarget = 9999\r
      dsListIn = dsTarget in dsTestList\r
      dsSetIn = dsTarget in dsTestSet\r
      dsDictIn = dsTarget in dsTestDict\r
      dsResult = (dsListIn, dsSetIn, dsDictIn)\r
      dsResult\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 자료구조 선택의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 자료구조 선택 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: memory_opt\r
  title: 메모리 최적화\r
  structuredPrimary: true\r
  subtitle: 메모리 사용량 줄이기\r
  goal: 메모리 최적화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 제너레이터는 값을 즉시 생성하지 않아 메모리를 절약합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def useListMem(n):\r
        return [i ** 2 for i in range(n)]\r
\r
    def useGenMem(n):\r
        return (i ** 2 for i in range(n))\r
\r
    memList = useListMem(10)\r
    memGen = useGenMem(10)\r
    memListSum = sum(memList)\r
    memGenSum = sum(memGen)\r
    memResult = (memListSum, memGenSum)\r
    memResult\r
  exercise:\r
    prompt: 메모리 최적화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def useListMem(n):\r
          return [i ** 2 for i in range(n)]\r
\r
      def useGenMem(n):\r
          return (i ** 2 for i in range(n))\r
\r
      memList = useListMem(10)\r
      memGen = useGenMem(10)\r
      memListSum = sum(memList)\r
      memGenSum = sum(memGen)\r
      memResult = (memListSum, memGenSum)\r
      memResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메모리 최적화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메모리 최적화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: builtin_func\r
  title: 내장 함수 활용\r
  structuredPrimary: true\r
  subtitle: C 구현 내장 함수 성능\r
  goal: 내장 함수 활용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: sum, min, max 등 내장 함수는 C로 구현되어 직접 루프보다 빠릅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    bfNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
\r
    def manualSumFn(lst):\r
        total = 0\r
        for n in lst:\r
            total += n\r
        return total\r
\r
    bfManualSum = manualSumFn(bfNums)\r
    bfBuiltinSum = sum(bfNums)\r
    bfManualMin = min(bfNums[0], *bfNums[1:])\r
    bfBuiltinMin = min(bfNums)\r
    bfResult = (bfManualSum, bfBuiltinSum, bfBuiltinMin)\r
    bfResult\r
  exercise:\r
    prompt: 내장 함수 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      bfNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\r
\r
      def manualSumFn(lst):\r
          total = 0\r
          for n in lst:\r
              total += n\r
          return total\r
\r
      bfManualSum = manualSumFn(bfNums)\r
      bfBuiltinSum = sum(bfNums)\r
      bfManualMin = min(bfNums[0], *bfNums[1:])\r
      bfBuiltinMin = min(bfNums)\r
      bfResult = (bfManualSum, bfBuiltinSum, bfBuiltinMin)\r
      bfResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 내장 함수 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 내장 함수 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: algorithm\r
  title: 알고리즘 선택\r
  structuredPrimary: true\r
  subtitle: 문제에 맞는 최적 알고리즘\r
  goal: 알고리즘 선택에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 정렬된 배열에서는 이진 탐색 O(log n)이 선형 탐색 O(n)보다 빠릅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def linearSrch(arr, target):\r
        for i, val in enumerate(arr):\r
            if val == target:\r
                return i\r
        return -1\r
\r
    def binarySrch(arr, target):\r
        left, right = 0, len(arr) - 1\r
        while left <= right:\r
            mid = (left + right) // 2\r
            if arr[mid] == target:\r
                return mid\r
            elif arr[mid] < target:\r
                left = mid + 1\r
            else:\r
                right = mid - 1\r
        return -1\r
\r
    srchArr = list(range(1000))\r
    srchTarget = 750\r
    srchLinear = linearSrch(srchArr, srchTarget)\r
    srchBinary = binarySrch(srchArr, srchTarget)\r
    srchResult = (srchLinear, srchBinary)\r
    srchResult\r
  exercise:\r
    prompt: 알고리즘 선택 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def linearSrch(arr, target):\r
          for i, val in enumerate(arr):\r
              if val == target:\r
                  return i\r
          return -1\r
\r
      def binarySrch(arr, target):\r
          left, right = 0, len(arr) - 1\r
          while left <= right:\r
              mid = (left + right) // 2\r
              if arr[mid] == target:\r
                  return mid\r
              elif arr[mid] < target:\r
                  left = mid + 1\r
              else:\r
                  right = mid - 1\r
          return -1\r
\r
      srchArr = list(range(1000))\r
      srchTarget = 750\r
      srchLinear = linearSrch(srchArr, srchTarget)\r
      srchBinary = binarySrch(srchArr, srchTarget)\r
      srchResult = (srchLinear, srchBinary)\r
      srchResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 알고리즘 선택의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 알고리즘 선택 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: caching\r
  title: 캐싱과 메모이제이션\r
  structuredPrimary: true\r
  subtitle: 반복 계산 방지\r
  goal: 캐싱과 메모이제이션에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 같은 입력에 대한 결과를 저장해두면 재계산을 피할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from functools import lru_cache\r
\r
    def fibNoCache(n):\r
        if n <= 1:\r
            return n\r
        return fibNoCache(n - 1) + fibNoCache(n - 2)\r
\r
    @lru_cache(maxsize=None)\r
    def fibCached(n):\r
        if n <= 1:\r
            return n\r
        return fibCached(n - 1) + fibCached(n - 2)\r
\r
    fibNc = fibNoCache(20)\r
    fibC = fibCached(30)\r
    fibInfo = fibCached.cache_info()\r
    fibResult = (fibNc, fibC, fibInfo.hits)\r
    fibResult\r
  exercise:\r
    prompt: 캐싱과 메모이제이션 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from functools import lru_cache\r
\r
      def fibNoCache(n):\r
          if n <= 1:\r
              return n\r
          return fibNoCache(n - 1) + fibNoCache(n - 2)\r
\r
      @lru_cache(maxsize=None)\r
      def fibCached(n):\r
          if n <= 1:\r
              return n\r
          return fibCached(n - 1) + fibCached(n - 2)\r
\r
      fibNc = fibNoCache(20)\r
      fibC = fibCached(30)\r
      fibInfo = fibCached.cache_info()\r
      fibResult = (fibNc, fibC, fibInfo.hits)\r
      fibResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 캐싱과 메모이제이션의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 캐싱과 메모이제이션 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 중복 주문 탐지 최적화'\r
  structuredPrimary: true\r
  subtitle: 추측이 아니라 같은 결과와 작업량 비교로 최적화를 검증합니다\r
  goal: '현업 흐름 검증: 중복 주문 탐지 최적화에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    최적화는 빠를 것 같은 코드를 고르는 일이 아닙니다. 먼저 느린 기준 구현과 빠른 구현이 같은 결과를 내는지 확인하고, 반복 횟수나 캐시 hit처럼 측정 가능한 신호를 비교하세요.\r
\r
    변주 실험\r
    주문 ID가 10만 개일 때도 결과가 같아야 합니다. 테스트 데이터 크기만 키워도 느린 구현과 빠른 구현의 작업량 차이가 어떻게 커지는지 확인하세요.\r
  tips:\r
  - 변주 실험 주문 ID가 10만 개일 때도 결과가 같아야 합니다. 테스트 데이터 크기만 키워도 느린 구현과 빠른 구현의 작업량 차이가 어떻게 커지는지 확인하세요.\r
  snippet: |-\r
    def findDuplicatesSlow(orderIds):\r
        duplicates = []\r
        comparisons = 0\r
        for index, orderId in enumerate(orderIds):\r
            for previous in orderIds[:index]:\r
                comparisons += 1\r
                if orderId == previous and orderId not in duplicates:\r
                    duplicates.append(orderId)\r
        return duplicates, comparisons\r
\r
    def findDuplicatesFast(orderIds):\r
        if not isinstance(orderIds, list):\r
            raise TypeError("orderIds must be a list")\r
        seen = set()\r
        duplicates = []\r
        checks = 0\r
        for orderId in orderIds:\r
            checks += 1\r
            if orderId in seen and orderId not in duplicates:\r
                duplicates.append(orderId)\r
            seen.add(orderId)\r
        return duplicates, checks\r
\r
    orderIds = ["O-1", "O-2", "O-3", "O-2", "O-4", "O-1"]\r
    slowResult, slowChecks = findDuplicatesSlow(orderIds)\r
    fastResult, fastChecks = findDuplicatesFast(orderIds)\r
\r
    assert slowResult == fastResult == ["O-2", "O-1"]\r
    assert fastChecks == len(orderIds)\r
    assert slowChecks > fastChecks\r
\r
    try:\r
        findDuplicatesFast("O-1,O-2")\r
    except TypeError as exc:\r
        message = str(exc)\r
\r
    assert message == "orderIds must be a list"\r
  exercise:\r
    prompt: '현업 흐름 검증: 중복 주문 탐지 최적화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      def findDuplicatesSlow(orderIds):\r
          duplicates = []\r
          comparisons = 0\r
          for index, orderId in enumerate(orderIds):\r
              for previous in orderIds[:index]:\r
                  comparisons += 1\r
                  if orderId == previous and orderId not in duplicates:\r
                      duplicates.append(orderId)\r
          return duplicates, comparisons\r
\r
      def findDuplicatesFast(orderIds):\r
          if not isinstance(orderIds, list):\r
              raise TypeError("orderIds must be a list")\r
          seen = set()\r
          duplicates = []\r
          checks = 0\r
          for orderId in orderIds:\r
              checks += 1\r
              if orderId in seen and orderId not in duplicates:\r
                  duplicates.append(orderId)\r
              seen.add(orderId)\r
          return duplicates, checks\r
\r
      orderIds = ["O-1", "O-2", "O-3", "O-2", "O-4", "O-1"]\r
      slowResult, slowChecks = findDuplicatesSlow(orderIds)\r
      fastResult, fastChecks = findDuplicatesFast(orderIds)\r
\r
      assert slowResult == fastResult == ["O-2", "O-1"]\r
      assert fastChecks == len(orderIds)\r
      assert slowChecks > fastChecks\r
\r
      try:\r
          findDuplicatesFast("O-1,O-2")\r
      except TypeError as exc:\r
          message = str(exc)\r
\r
      assert message == "orderIds must be a list"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: '현업 흐름 검증: 중복 주문 탐지 최적화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 중복 주문 탐지 최적화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 코드 최적화 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 26에서 배운 코드 최적화 기법을 난이도별로 복습합니다. 프로파일링은 병목 지점을 찾는 첫 단계이며, 시간/공간 복잡도 분석은 최적화 방향을 결정합니다.\r
    캐싱, 메모이제이션, 지연 평가는 반복 연산을 줄이는 핵심 기법입니다. 🟢 기본 문제로 O(n²)를 O(n)으로 개선하는 패턴을 익히고, 🟡 응용 문제로 자료구조 선택과 알고리즘\r
    개선을 연습하세요. 🔴 심화 문제에서는 Cython, NumPy 활용, 병렬 처리 등 고급 최적화를 직접 적용해봅니다. 최적화는 측정 없이 추측하면 안 되며, 항상 프로파일링\r
    결과를 기반으로 진행해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def dedupSlow(lst):\r
        result = []\r
        for item in lst:\r
            if item not in result:\r
                result.append(item)\r
        return result\r
\r
    def dedupFast(lst):\r
        seen = set()\r
        result = []\r
        for item in lst:\r
            if item not in seen:\r
                seen.add(item)\r
                result.append(item)\r
        return result\r
\r
    ex1Data = [1, 2, 2, 3, 3, 3, 4]\r
    ex1Slow = dedupSlow(ex1Data)\r
    ex1Fast = dedupFast(ex1Data)\r
    ex1Result = (ex1Slow, ex1Fast)\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def dedupSlow(lst):\r
          result = []\r
          for item in lst:\r
              if item not in result:\r
                  result.append(item)\r
          return result\r
\r
      def dedupFast(lst):\r
          seen = set()\r
          result = []\r
          for item in lst:\r
              if item not in seen:\r
                  seen.add(item)\r
                  result.append(item)\r
          return result\r
\r
      ex1Data = [1, 2, 2, 3, 3, 3, 4]\r
      ex1Slow = dedupSlow(ex1Data)\r
      ex1Fast = dedupFast(ex1Data)\r
      ex1Result = (ex1Slow, ex1Fast)\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 26_code_optimization-deduplicate-orders-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - time_complexity
    - data_structure
    - workflow_validation
    title: 중복 주문을 순서 보존 set으로 최적화하기
    subtitle: optimized deduplication
    goal: deduplicate_orders_with_metrics(order_ids)를 완성해 입력 순서를 유지하면서 중복을 제거하고 검사 횟수와 중복 수를 반환한다.
    why: 최적화는 빠른 척하는 코드가 아니라, 같은 결과를 유지하면서 병목이 되는 연산 수를 줄였다는 증거를 남기는 일입니다.
    explanation: order_ids는 list여야 합니다. set으로 이미 본 주문을 추적하되, 결과 목록은 최초 등장 순서를 유지하세요.
    tips:
    - list membership은 길이에 따라 느려지지만 set membership은 조회 비용이 작습니다.
    - 최적화 결과에는 uniqueIds뿐 아니라 checks와 duplicateCount를 함께 반환하세요.
    exercise:
      prompt: deduplicate_orders_with_metrics(order_ids)를 완성해 uniqueIds, duplicateCount, checks를 반환하세요.
      starterCode: |-
        def deduplicate_orders_with_metrics(order_ids):
            raise NotImplementedError
      solution: |-
        def deduplicate_orders_with_metrics(order_ids):
            if not isinstance(order_ids, list):
                raise TypeError("order_ids must be a list")
            seen = set()
            unique_ids = []
            duplicate_count = 0
            checks = 0
            for order_id in order_ids:
                checks += 1
                if order_id in seen:
                    duplicate_count += 1
                else:
                    seen.add(order_id)
                    unique_ids.append(order_id)
            return {
                "uniqueIds": unique_ids,
                "duplicateCount": duplicate_count,
                "checks": checks,
            }
      hints:
      - seen은 membership 확인용이고 unique_ids는 순서 보존용입니다.
      - 타입이 list가 아니면 문자열도 반복 가능하므로 먼저 TypeError로 막으세요.
    check:
      id: python.advanced.optimization.deduplicate-orders.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.optimization.empty.behavior.v1.fixture
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
        entry: deduplicate_orders_with_metrics
        cases:
        - id: removes-duplicates-with-stable-order
          arguments:
          - value:
            - O-1
            - O-2
            - O-1
            - O-3
            - O-2
          expectedReturn:
            uniqueIds:
            - O-1
            - O-2
            - O-3
            duplicateCount: 2
            checks: 5
        - id: rejects-non-list-input
          arguments:
          - value: O-1,O-2
          expectedException: TypeError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 26_code_optimization-shipping-cache-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - memory_opt
    - builtin_func
    - caching
    title: 배송 견적 계산을 요청 키로 캐싱하기
    subtitle: memoized quote calculation
    goal: quote_shipments(requests)를 완성해 같은 zone과 weight 조합의 견적을 한 번만 계산한다.
    why: 중복 제거에서 배운 set과 dict 사고를 계산 캐싱으로 옮기면, 최적화가 자료구조 선택과 상태 저장의 문제라는 점이 분명해집니다.
    explanation: 각 요청은 zone과 weight를 가집니다. 견적은 zone 기본값에 weight * 100을 더한 값이며, 같은 키는 cache에서 재사용하세요.
    tips:
    - dict key는 (zone, weight) 튜플처럼 불변 값으로 만들면 됩니다.
    - computedCount는 실제로 새 견적을 계산한 횟수만 세세요.
    exercise:
      prompt: quote_shipments(requests)를 완성해 quotes, computedCount, cacheKeys를 반환하세요.
      starterCode: |-
        def quote_shipments(requests):
            raise NotImplementedError
      solution: |-
        def quote_shipments(requests):
            base_by_zone = {"A": 1000, "B": 1500, "C": 2000}
            cache = {}
            quotes = []
            computed_count = 0
            for request in requests:
                key = (request["zone"], request["weight"])
                if key not in cache:
                    if request["zone"] not in base_by_zone:
                        raise ValueError("unknown zone")
                    cache[key] = base_by_zone[request["zone"]] + request["weight"] * 100
                    computed_count += 1
                quotes.append(cache[key])
            return {
                "quotes": quotes,
                "computedCount": computed_count,
                "cacheKeys": [f"{zone}:{weight}" for zone, weight in sorted(cache)],
            }
      hints:
      - requests 길이가 아니라 고유 key 개수가 computedCount가 됩니다.
      - cacheKeys를 정렬하면 결과가 항상 같은 순서로 나옵니다.
    check:
      id: python.advanced.optimization.shipping-cache.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.optimization.empty.behavior.v1.fixture
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
        entry: quote_shipments
        cases:
        - id: reuses-quote-for-repeated-zone-weight
          arguments:
          - value:
            - zone: A
              weight: 3
            - zone: B
              weight: 2
            - zone: A
              weight: 3
          expectedReturn:
            quotes:
            - 1300
            - 1700
            - 1300
            computedCount: 2
            cacheKeys:
            - A:3
            - B:2
        - id: rejects-unknown-zone
          arguments:
          - value:
            - zone: Z
              weight: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 26_code_optimization-strategy-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - time_complexity
    - data_structure
    - memory_opt
    - builtin_func
    - algorithm
    - caching
    title: 최적화 전략 선택 기준 회상하기
    subtitle: optimization strategy recall
    goal: choose_optimization_strategy(symptom)를 완성해 병목 증상별 접근과 검증 방법을 반환한다.
    why: 최적화에서 오래 남아야 할 지식은 트릭 목록이 아니라, 측정, 자료구조, 알고리즘, 캐싱, 메모리의 우선순위를 판단하는 기준입니다.
    explanation: repeated-membership, repeated-expensive-call, large-intermediate-list, slow-python-loop, wrong-algorithm 상황별 전략을 선택하세요.
    tips:
    - 최적화 전후에는 항상 같은 결과를 보존하는 검증이 있어야 합니다.
    - 캐싱은 입력 key와 무효화 조건이 명확할 때만 안전합니다.
    exercise:
      prompt: choose_optimization_strategy(symptom)를 완성해 strategy, proof, risk를 반환하세요.
      starterCode: |-
        def choose_optimization_strategy(symptom):
            raise NotImplementedError
      solution: |-
        def choose_optimization_strategy(symptom):
            table = {
                "repeated-membership": {
                    "strategy": "use-set-or-dict",
                    "proof": "membership checks stop growing with result length",
                    "risk": "sets do not preserve duplicates",
                },
                "repeated-expensive-call": {
                    "strategy": "cache-by-input-key",
                    "proof": "computed count is lower than request count",
                    "risk": "stale cache returns outdated results",
                },
                "large-intermediate-list": {
                    "strategy": "stream-or-generator",
                    "proof": "peak stored items drops",
                    "risk": "one-shot iterators can be consumed accidentally",
                },
                "slow-python-loop": {
                    "strategy": "use-builtins",
                    "proof": "same output with less Python-level work",
                    "risk": "readability can suffer if over-compressed",
                },
                "wrong-algorithm": {
                    "strategy": "change-complexity-class",
                    "proof": "growth rate improves as input scales",
                    "risk": "new algorithm may need stricter preconditions",
                },
            }
            if symptom not in table:
                raise ValueError("unknown optimization symptom")
            return table[symptom]
      hints:
      - 증상이 반복 조회인지, 반복 계산인지, 메모리 폭증인지 먼저 나누세요.
      - proof는 단순 시간 감상이 아니라 수치나 성장률로 남겨야 합니다.
    check:
      id: python.advanced.optimization.strategy-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.optimization.empty.behavior.v1.fixture
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
        entry: choose_optimization_strategy
        cases:
        - id: recalls-set-for-repeated-membership
          arguments:
          - value: repeated-membership
          expectedReturn:
            strategy: use-set-or-dict
            proof: membership checks stop growing with result length
            risk: sets do not preserve duplicates
        - id: recalls-cache-for-expensive-calls
          arguments:
          - value: repeated-expensive-call
          expectedReturn:
            strategy: cache-by-input-key
            proof: computed count is lower than request count
            risk: stale cache returns outdated results
        - id: rejects-unknown-symptom
          arguments:
          - value: make-it-fast
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};