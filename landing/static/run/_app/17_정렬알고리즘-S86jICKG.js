var e=`meta:\r
  id: '17'\r
  title: 정렬 알고리즘\r
  day: 17\r
  category: advancedPython\r
  tags:\r
  - sorting\r
  - bubble sort\r
  - merge sort\r
  - quick sort\r
  - timsort\r
  - 검증\r
  - 실무정렬\r
  seo:\r
    title: 파이썬 정렬 알고리즘 - 버블, 선택, 삽입, 병합, 퀵 정렬\r
    description: 정렬 알고리즘을 직접 구현하고 이해합니다. O(n²) 기본 정렬부터 O(n log n) 고급 정렬까지.\r
    keywords:\r
    - 정렬\r
    - bubble sort\r
    - merge sort\r
    - quick sort\r
    - timsort\r
intro:\r
  emoji: 📊\r
  points:\r
  - 'O(n²) 기본 정렬: 버블, 선택, 삽입'\r
  - 'O(n log n) 고급 정렬: 병합, 퀵'\r
  - 파이썬 내장 정렬 Timsort\r
  - key 함수로 커스텀 정렬\r
  direction: 정렬 알고리즘에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 정렬 알고리즘 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 버블 정렬 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 선택 정렬 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 삽입 정렬 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 정렬 알고리즘 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 정렬 알고리즘 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 정렬 알고리즘 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: bubble_sort\r
  title: 버블 정렬\r
  structuredPrimary: true\r
  subtitle: 인접 요소 교환\r
  goal: 버블 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    버블 정렬은 인접한 두 요소를 비교하여 교환하는 가장 단순한 정렬입니다. 가장 큰 값이 거품처럼 맨 뒤로 떠오릅니다. 시간 복잡도는 최악/평균 O(n²), 최선 O(n)입니다. 공간 복잡도는 O(1)로 제자리(in-place) 정렬입니다. 안정(stable) 정렬로 같은 값의 순서가 유지됩니다. 교육용으로는 좋지만 실무에서는 거의 사용하지 않습니다.\r
\r
    n개 요소의 버블 정렬은 최대 n(n-1)/2번 비교합니다.\r
  snippet: |-\r
    def bubbleSort(arr):\r
        n = len(arr)\r
        for i in range(n):\r
            for j in range(n - 1 - i):\r
                if arr[j] > arr[j + 1]:\r
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]\r
        return arr\r
\r
    bubbleSort([64, 34, 25, 12, 22, 11, 90])\r
  exercise:\r
    prompt: 버블 정렬 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def bubbleSort(arr):\r
          n = len(arr)\r
          for i in range(n):\r
              for j in range(n - 1 - i):\r
                  if arr[j] > arr[j + 1]:\r
                      arr[j], arr[j + 1] = arr[j + 1], arr[j]\r
          return arr\r
\r
      bubbleSort([64, 34, 25, 12, 22, 11, 90])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 버블 정렬의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 버블 정렬 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: selection_sort\r
  title: 선택 정렬\r
  structuredPrimary: true\r
  subtitle: 최솟값 선택\r
  goal: 선택 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    선택 정렬은 남은 요소 중 최솟값을 찾아 현재 위치에 놓습니다. 각 패스에서 정확히 하나의 요소가 정렬됩니다. 시간 복잡도는 항상 O(n²)입니다. 공간 복잡도는 O(1)입니다. 교환 횟수가 적어 쓰기 비용이 높을 때 유리합니다. 불안정(unstable) 정렬로 같은 값의 순서가 바뀔 수 있습니다.\r
\r
    선택 정렬은 교환이 O(n)으로 버블 정렬보다 적습니다.\r
  snippet: |-\r
    def selectionSort(arr):\r
        n = len(arr)\r
        for i in range(n):\r
            minIdx = i\r
            for j in range(i + 1, n):\r
                if arr[j] < arr[minIdx]:\r
                    minIdx = j\r
            arr[i], arr[minIdx] = arr[minIdx], arr[i]\r
        return arr\r
\r
    selectionSort([64, 25, 12, 22, 11])\r
  exercise:\r
    prompt: 선택 정렬 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def selectionSort(arr):\r
          n = len(arr)\r
          for i in range(n):\r
              minIdx = i\r
              for j in range(i + 1, n):\r
                  if arr[j] < arr[minIdx]:\r
                      minIdx = j\r
              arr[i], arr[minIdx] = arr[minIdx], arr[i]\r
          return arr\r
\r
      selectionSort([64, 25, 12, 22, 11])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 선택 정렬의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 선택 정렬 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: insertion_sort\r
  title: 삽입 정렬\r
  structuredPrimary: true\r
  subtitle: 정렬된 부분에 삽입\r
  goal: 삽입 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    삽입 정렬은 각 요소를 이미 정렬된 부분의 올바른 위치에 삽입합니다. 카드 게임에서 손에 든 카드를 정렬하는 방식과 같습니다. 시간 복잡도는 최악 O(n²), 최선 O(n)입니다. 거의 정렬된 데이터에서 매우 효율적입니다. 안정 정렬이며 작은 데이터셋에 적합합니다. Timsort의 구성 요소로 사용됩니다.\r
\r
    삽입 정렬은 온라인 알고리즘으로 스트리밍 데이터에도 사용할 수 있습니다.\r
  snippet: |-\r
    def insertionSort(arr):\r
        for i in range(1, len(arr)):\r
            key = arr[i]\r
            j = i - 1\r
            while j >= 0 and arr[j] > key:\r
                arr[j + 1] = arr[j]\r
                j -= 1\r
            arr[j + 1] = key\r
        return arr\r
\r
    insertionSort([12, 11, 13, 5, 6])\r
  exercise:\r
    prompt: 삽입 정렬 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def insertionSort(arr):\r
          for i in range(1, len(arr)):\r
              key = arr[i]\r
              j = i - 1\r
              while j >= 0 and arr[j] > key:\r
                  arr[j + 1] = arr[j]\r
                  j -= 1\r
              arr[j + 1] = key\r
          return arr\r
\r
      insertionSort([12, 11, 13, 5, 6])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 삽입 정렬의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 삽입 정렬 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: merge_sort\r
  title: 병합 정렬\r
  structuredPrimary: true\r
  subtitle: 분할정복 O(n log n)\r
  goal: 병합 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    병합 정렬은 분할정복 방식의 효율적인 정렬입니다. 배열을 반으로 나누고, 각각 정렬한 후, 병합합니다. 시간 복잡도는 항상 O(n log n)입니다. 공간 복잡도는 O(n)으로 추가 메모리가 필요합니다. 안정 정렬이며 연결 리스트에 적합합니다. 대용량 데이터의 외부 정렬에도 사용됩니다.\r
\r
    병합 정렬은 예측 가능한 성능이 필요할 때 좋습니다.\r
  snippet: |-\r
    def mergeSort(arr):\r
        if len(arr) <= 1:\r
            return arr\r
        mid = len(arr) // 2\r
        left = mergeSort(arr[:mid])\r
        right = mergeSort(arr[mid:])\r
        return merge(left, right)\r
\r
    def merge(left, right):\r
        result = []\r
        i = j = 0\r
        while i < len(left) and j < len(right):\r
            if left[i] <= right[j]:\r
                result.append(left[i])\r
                i += 1\r
            else:\r
                result.append(right[j])\r
                j += 1\r
        result.extend(left[i:])\r
        result.extend(right[j:])\r
        return result\r
\r
    mergeSort([38, 27, 43, 3, 9, 82, 10])\r
  exercise:\r
    prompt: 병합 정렬 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def mergeSort(arr):\r
          if len(arr) <= 1:\r
              return arr\r
          mid = len(arr) // 2\r
          left = mergeSort(arr[:mid])\r
          right = mergeSort(arr[mid:])\r
          return merge(left, right)\r
\r
      def merge(left, right):\r
          result = []\r
          i = j = 0\r
          while i < len(left) and j < len(right):\r
              if left[i] <= right[j]:\r
                  result.append(left[i])\r
                  i += 1\r
              else:\r
                  result.append(right[j])\r
                  j += 1\r
          result.extend(left[i:])\r
          result.extend(right[j:])\r
          return result\r
\r
      mergeSort([38, 27, 43, 3, 9, 82, 10])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 병합 정렬의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 병합 정렬 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: quick_sort\r
  title: 퀵 정렬\r
  structuredPrimary: true\r
  subtitle: 피벗 기반 분할\r
  goal: 퀵 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    퀵 정렬은 피벗을 기준으로 작은 값과 큰 값을 분할합니다. 평균 시간 복잡도 O(n log n), 최악 O(n²)입니다. 공간 복잡도는 O(log n) 스택 공간입니다. 제자리 정렬이며 캐시 효율이 좋습니다. 피벗 선택이 성능에 큰 영향을 미칩니다. 불안정 정렬이지만 실무에서 가장 빠른 경우가 많습니다.\r
\r
    정렬된 배열에서 첫/끝 피벗은 O(n²)가 됩니다. 중간 또는 랜덤 피벗을 사용하세요.\r
  snippet: |-\r
    def quickSort(arr):\r
        if len(arr) <= 1:\r
            return arr\r
        pivot = arr[len(arr) // 2]\r
        left = [x for x in arr if x < pivot]\r
        middle = [x for x in arr if x == pivot]\r
        right = [x for x in arr if x > pivot]\r
        return quickSort(left) + middle + quickSort(right)\r
\r
    quickSort([3, 6, 8, 10, 1, 2, 1])\r
  exercise:\r
    prompt: 퀵 정렬 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def quickSort(arr):\r
          if len(arr) <= 1:\r
              return arr\r
          pivot = arr[len(arr) // 2]\r
          left = [x for x in arr if x < pivot]\r
          middle = [x for x in arr if x == pivot]\r
          right = [x for x in arr if x > pivot]\r
          return quickSort(left) + middle + quickSort(right)\r
\r
      quickSort([3, 6, 8, 10, 1, 2, 1])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 퀵 정렬의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 퀵 정렬 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: python_sort\r
  title: 파이썬 정렬\r
  structuredPrimary: true\r
  subtitle: Timsort와 활용\r
  goal: 파이썬 정렬에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    파이썬의 sort()와 sorted()는 Timsort를 사용합니다. Timsort는 병합 정렬과 삽입 정렬의 하이브리드입니다. 시간 복잡도는 최악 O(n log n), 최선 O(n)입니다. 안정 정렬이며 실세계 데이터에 최적화되어 있습니다. key 함수로 정렬 기준을 지정합니다. reverse=True로 내림차순 정렬합니다.\r
\r
    operator.itemgetter, operator.attrgetter로 key 함수를 더 효율적으로 만들 수 있습니다.\r
  snippet: |-\r
    numbers = [3, 1, 4, 1, 5, 9, 2, 6]\r
    sortedNums = sorted(numbers)\r
    numbers.sort(reverse=True)\r
    sortedNums, numbers\r
  exercise:\r
    prompt: 파이썬 정렬 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      numbers = [3, 1, 4, 1, 5, 9, 2, 6]\r
      sortedNums = sorted(numbers)\r
      numbers.sort(reverse=True)\r
      sortedNums, numbers\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 파이썬 정렬에서 \`numbers\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 파이썬 정렬 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 처리 우선순위 정렬하기'\r
  structuredPrimary: true\r
  subtitle: 안정 정렬, key 함수, 입력 검증을 업무 데이터로 확인합니다\r
  goal: '현업 흐름 검증: 주문 처리 우선순위 정렬하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    실무 정렬은 알고리즘을 직접 구현하는 것보다 기준을 틀리지 않는 것이 중요합니다. 접수 시간으로 한 번 정렬한 뒤 SLA로 다시 정렬하면 Python의 안정 정렬 때문에 같은 SLA 안에서는 접수 순서가 유지됩니다.\r
\r
    변주 실험\r
    환불 요청은 금액보다 생성 시간이 중요하다는 규칙을 추가하고, 정렬 기준 함수만 바꿔 기대 순서가 바뀌는지 검증하세요.\r
  tips:\r
  - 변주 실험 환불 요청은 금액보다 생성 시간이 중요하다는 규칙을 추가하고, 정렬 기준 함수만 바꿔 기대 순서가 바뀌는지 검증하세요.\r
  snippet: |-\r
    orders = [\r
        {"id": "O-3", "sla": 2, "createdAt": "09:20", "amount": 80_000},\r
        {"id": "O-1", "sla": 1, "createdAt": "09:00", "amount": 30_000},\r
        {"id": "O-2", "sla": 2, "createdAt": "09:05", "amount": 120_000},\r
        {"id": "O-4", "sla": 1, "createdAt": "09:10", "amount": 40_000},\r
    ]\r
\r
    byCreated = sorted(orders, key=lambda order: order["createdAt"])\r
    bySlaStable = sorted(byCreated, key=lambda order: order["sla"])\r
\r
    assert [order["id"] for order in bySlaStable] == ["O-1", "O-4", "O-2", "O-3"]\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 처리 우선순위 정렬하기 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.'\r
    starterCode: |-\r
      orders = [\r
          {"id": "O-3", "sla": 2, "createdAt": "09:20", "amount": 80_000},\r
          {"id": "O-1", "sla": 1, "createdAt": "09:00", "amount": 30_000},\r
          {"id": "O-2", "sla": 2, "createdAt": "09:05", "amount": 120_000},\r
          {"id": "O-4", "sla": 1, "createdAt": "09:10", "amount": 40_000},\r
      ]\r
\r
      byCreated = sorted(orders, key=lambda order: order["createdAt"])\r
      bySlaStable = sorted(byCreated, key=lambda order: order["sla"])\r
\r
      assert [order["id"] for order in bySlaStable] == ["O-1", "O-4", "O-2", "O-3"]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 처리 우선순위 정렬하기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 처리 우선순위 정렬하기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 정렬 알고리즘 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 17에서 배운 정렬 알고리즘을 난이도별로 복습합니다. 정렬은 데이터를 특정 순서로 배열하는 기본적이면서 중요한 알고리즘으로, 시간복잡도와 공간복잡도의\r
    트레이드오프를 이해하는 핵심 주제입니다. O(n²) 알고리즘(버블, 선택, 삽입)과 O(n log n) 알고리즘(병합, 퀵)의 차이를 체감해보세요. 🟢 기본 문제로 버블, 선택,\r
    삽입 정렬을 구현하고, 🟡 응용 문제로 병합 정렬과 퀵 정렬을 연습하세요. 🔴 심화 문제에서는 안정 정렬, 키 함수 정렬, 복합 정렬 조건 등 실무 패턴을 다룹니다. 실무에서는\r
    대부분 내장 sorted()를 사용하지만, 원리를 알면 최적화 판단에 도움이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def bubble(arr):\r
        n = len(arr)\r
        for i in range(n):\r
            for j in range(n - 1 - i):\r
                if arr[j] > arr[j+1]:\r
                    arr[j], arr[j+1] = arr[j+1], arr[j]\r
        return arr\r
\r
    bubble([5, 3, 8, 4, 2])\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def bubble(arr):\r
          n = len(arr)\r
          for i in range(n):\r
              for j in range(n - 1 - i):\r
                  if arr[j] > arr[j+1]:\r
                      arr[j], arr[j+1] = arr[j+1], arr[j]\r
          return arr\r
\r
      bubble([5, 3, 8, 4, 2])\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 17_sorting_algorithms-dispatch-priority-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - insertion_sort
    - merge_sort
    - python_sort
    - workflow_validation
    title: 주문 처리 우선순위를 안정 정렬로 만들기
    subtitle: stable business sorting
    goal: prioritize_orders(orders)를 완성해 SLA가 낮은 주문, 생성 시간이 빠른 주문, 금액이 큰 주문 순서로 정렬한 요약을 반환한다.
    why: 실무 정렬은 숫자를 오름차순으로 놓는 연습보다, 여러 기준을 안정적으로 적용해 업무 순서를 설명 가능하게 만드는 일이 더 많습니다.
    explanation: 각 주문은 id, sla, createdAt, amount를 가집니다. sla는 낮을수록 급하고, createdAt은 HH:MM 문자열로 비교하며, 같은 시간에서는 amount가 큰 주문을 먼저 처리하세요.
    tips:
    - sorted의 key에 튜플을 넘기면 여러 기준을 한 번에 표현할 수 있습니다.
    - 내림차순 기준은 숫자 부호를 바꾸면 key 안에서 같이 다룰 수 있습니다.
    exercise:
      prompt: prioritize_orders(orders)를 완성해 정렬된 주문 id 목록과 첫 주문, 전체 개수를 반환하세요.
      starterCode: |-
        def prioritize_orders(orders):
            raise NotImplementedError
      solution: |-
        def prioritize_orders(orders):
            ordered = sorted(
                orders,
                key=lambda order: (
                    order["sla"],
                    order["createdAt"],
                    -order.get("amount", 0),
                    order["id"],
                ),
            )
            return {
                "orderedIds": [order["id"] for order in ordered],
                "first": ordered[0]["id"] if ordered else None,
                "count": len(ordered),
            }
      hints:
      - 필요한 key가 빠지면 KeyError가 나야 잘못된 데이터를 조용히 넘기지 않습니다.
      - amount만 내림차순이면 -amount를 key에 넣을 수 있습니다.
    check:
      id: python.advanced.sorting-orders.priority.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.sorting-orders.empty.behavior.v1.fixture
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
        entry: prioritize_orders
        cases:
        - id: sorts-by-sla-created-time-and-amount
          arguments:
          - value:
            - id: O-3
              sla: 2
              createdAt: "09:20"
              amount: 80000
            - id: O-1
              sla: 1
              createdAt: "09:00"
              amount: 30000
            - id: O-2
              sla: 2
              createdAt: "09:05"
              amount: 120000
            - id: O-4
              sla: 1
              createdAt: "09:10"
              amount: 40000
          expectedReturn:
            orderedIds:
            - O-1
            - O-4
            - O-2
            - O-3
            first: O-1
            count: 4
        - id: rejects-missing-created-time
          arguments:
          - value:
            - id: O-5
              sla: 1
              amount: 100
          expectedException: KeyError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 17_sorting_algorithms-merge-runs-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - merge_sort
    - quick_sort
    - python_sort
    title: 이미 정렬된 두 묶음을 병합하기
    subtitle: merge sorted runs transfer
    goal: merge_sorted_runs(left, right)를 완성해 두 정렬 리스트를 병합하고 각 원소가 어느 쪽에서 왔는지 기록한다.
    why: 정렬 알고리즘을 이해했다면 sorted를 쓰는 상황과, 이미 정렬된 스트림을 추가 비용 없이 병합해야 하는 상황을 구분할 수 있어야 합니다.
    explanation: left와 right는 오름차순이어야 합니다. 정렬되지 않은 입력은 ValueError로 거부하고, 같은 값은 left 값을 먼저 가져와 안정성을 유지하세요.
    tips:
    - 두 포인터 i, j를 움직이면 전체를 다시 정렬하지 않고 병합할 수 있습니다.
    - 입력이 이미 정렬됐는지 먼저 확인하면 실패 원인을 빠르게 설명할 수 있습니다.
    exercise:
      prompt: merge_sorted_runs(left, right)를 완성해 merged, sourcePattern, fromLeft를 반환하세요.
      starterCode: |-
        def merge_sorted_runs(left, right):
            raise NotImplementedError
      solution: |-
        def merge_sorted_runs(left, right):
            def is_sorted(values):
                return all(values[index] <= values[index + 1] for index in range(len(values) - 1))

            if not is_sorted(left) or not is_sorted(right):
                raise ValueError("both runs must already be sorted")

            merged = []
            source = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    merged.append(left[i])
                    source.append("L")
                    i += 1
                else:
                    merged.append(right[j])
                    source.append("R")
                    j += 1
            while i < len(left):
                merged.append(left[i])
                source.append("L")
                i += 1
            while j < len(right):
                merged.append(right[j])
                source.append("R")
                j += 1
            return {
                "merged": merged,
                "sourcePattern": "".join(source),
                "fromLeft": source.count("L"),
            }
      hints:
      - 같은 값에서 left를 먼저 가져오면 안정 병합이 됩니다.
      - 병합 뒤 남은 한쪽 리스트도 모두 결과에 붙여야 합니다.
    check:
      id: python.advanced.sorting-orders.merge-runs.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.sorting-orders.empty.behavior.v1.fixture
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
        entry: merge_sorted_runs
        cases:
        - id: merges-and-records-source-side
          arguments:
          - value:
            - 1
            - 4
            - 4
          - value:
            - 2
            - 3
            - 5
          expectedReturn:
            merged:
            - 1
            - 2
            - 3
            - 4
            - 4
            - 5
            sourcePattern: LRRLLR
            fromLeft: 3
        - id: rejects-unsorted-left-run
          arguments:
          - value:
            - 3
            - 1
          - value:
            - 2
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 17_sorting_algorithms-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - bubble_sort
    - insertion_sort
    - merge_sort
    - quick_sort
    - python_sort
    title: 정렬 알고리즘과 내장 정렬 선택 기준 회상하기
    subtitle: sorting strategy recall
    goal: choose_sorting_tool(goal)를 완성해 상황별 정렬 선택과 이유를 반환한다.
    why: 좋은 학습자는 버블 정렬 코드를 기억하는 데서 멈추지 않고, 데이터 크기, 안정성, 이미 정렬된 정도, 내장 도구의 장점을 보고 선택합니다.
    explanation: business-priority, teaching-small-array, nearly-sorted, merge-large-runs, in-place-average 목적별로 적절한 선택을 반환하세요.
    tips:
    - 실무 복합 기준 정렬은 대부분 sorted와 key 함수가 가장 안전합니다.
    - 삽입 정렬은 거의 정렬된 작은 데이터에서 설명 가치가 큽니다.
    exercise:
      prompt: choose_sorting_tool(goal)를 완성해 tool, stable, useWhen을 반환하세요.
      starterCode: |-
        def choose_sorting_tool(goal):
            raise NotImplementedError
      solution: |-
        def choose_sorting_tool(goal):
            table = {
                "business-priority": {
                    "tool": "sorted-key",
                    "stable": True,
                    "useWhen": "records need multiple readable business ordering rules",
                },
                "teaching-small-array": {
                    "tool": "bubble-or-selection",
                    "stable": False,
                    "useWhen": "the goal is to expose comparison and swap mechanics",
                },
                "nearly-sorted": {
                    "tool": "insertion-sort",
                    "stable": True,
                    "useWhen": "most items are already close to the final position",
                },
                "merge-large-runs": {
                    "tool": "merge-sort",
                    "stable": True,
                    "useWhen": "two or more sorted runs must be combined predictably",
                },
                "in-place-average": {
                    "tool": "quick-sort",
                    "stable": False,
                    "useWhen": "average performance matters and stability is not required",
                },
            }
            if goal not in table:
                raise ValueError("unknown sorting goal")
            return table[goal]
      hints:
      - stable은 같은 key의 상대 순서가 유지되는지 묻는 기준입니다.
      - 내장 sorted는 안정 정렬이며 key 함수로 실무 조건을 표현하기 좋습니다.
    check:
      id: python.advanced.sorting-orders.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.sorting-orders.empty.behavior.v1.fixture
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
        entry: choose_sorting_tool
        cases:
        - id: recalls-sorted-key-for-business-priority
          arguments:
          - value: business-priority
          expectedReturn:
            tool: sorted-key
            stable: true
            useWhen: records need multiple readable business ordering rules
        - id: recalls-merge-sort-for-runs
          arguments:
          - value: merge-large-runs
          expectedReturn:
            tool: merge-sort
            stable: true
            useWhen: two or more sorted runs must be combined predictably
        - id: rejects-unknown-goal
          arguments:
          - value: random-shuffle
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};