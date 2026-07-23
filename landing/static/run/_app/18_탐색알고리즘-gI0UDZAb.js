var e=`meta:\r
  id: '18'\r
  title: 탐색 알고리즘\r
  day: 18\r
  category: advancedPython\r
  tags:\r
  - search\r
  - binary-search\r
  - bisect\r
  - bfs\r
  - dfs\r
  - graph\r
  - 검증\r
  - 탐색전략\r
  seo:\r
    title: 파이썬 탐색 알고리즘 - 선형, 이진, BFS, DFS\r
    description: 선형 탐색, 이진 탐색, bisect 모듈, BFS, DFS, 해시 탐색까지 파이썬 탐색 알고리즘 완벽 가이드\r
    keywords:\r
    - 탐색\r
    - 이진탐색\r
    - bisect\r
    - BFS\r
    - DFS\r
    - 그래프\r
intro:\r
  emoji: 🔍\r
  points:\r
  - 선형 탐색 O(n) vs 이진 탐색 O(log n) 시간 복잡도 비교\r
  - bisect 모듈로 정렬 유지하며 효율적 삽입/탐색\r
  - BFS(너비 우선)와 DFS(깊이 우선) 그래프 탐색\r
  - 해시 기반 O(1) 탐색의 원리와 활용\r
  direction: 탐색 알고리즘에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 탐색 알고리즘 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 선형 탐색 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 이진 탐색 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: bisect 모듈 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 탐색 알고리즘 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 탐색 알고리즘 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 탐색 알고리즘 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: linear_search\r
  title: 선형 탐색\r
  structuredPrimary: true\r
  subtitle: 순차 검색\r
  goal: 선형 탐색에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    선형 탐색(Linear Search)은 가장 기본적인 탐색 알고리즘입니다. 배열의 처음부터 끝까지 순차적으로 탐색하며 원하는 값을 찾습니다. 시간 복잡도는 O(n)이며, 공간 복잡도는 O(1)입니다. 정렬되지 않은 데이터에서도 사용할 수 있고 구현이 매우 간단합니다. 작은 데이터셋이나 정렬 비용이 높은 경우에 적합합니다.\r
\r
    파이썬의 in 연산자와 index() 메서드도 내부적으로 선형 탐색을 사용합니다.\r
  snippet: |-\r
    def linearSearch(arr, target):\r
        for i, val in enumerate(arr):\r
            if val == target:\r
                return i\r
        return -1\r
\r
    linearNums = [4, 2, 7, 1, 9, 3, 6, 8, 5]\r
    linearIdx = linearSearch(linearNums, 7)\r
    f"7의 인덱스: {linearIdx}"\r
  exercise:\r
    prompt: 선형 탐색 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def linearSearch(arr, target):\r
          for i, val in enumerate(arr):\r
              if val == target:\r
                  return i\r
          return -1\r
\r
      linearNums = [4, 2, 7, 1, 9, 3, 6, 8, 5]\r
      linearIdx = linearSearch(linearNums, 7)\r
      f"7의 인덱스: {linearIdx}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 선형 탐색의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 선형 탐색 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: binary_search\r
  title: 이진 탐색\r
  structuredPrimary: true\r
  subtitle: 분할 정복 O(log n)\r
  goal: 이진 탐색에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    이진 탐색(Binary Search)은 정렬된 데이터에서 절반씩 범위를 줄여나가는 효율적인 알고리즘입니다. 중간값과 비교하여 탐색 범위를 절반으로 줄입니다. 시간 복잡도는 O(log n)으로, 100만 개 데이터도 최대 20번 비교로 찾습니다. 반드시 정렬된 데이터에서만 사용해야 합니다. 반복문과 재귀 두 가지 방식으로 구현할 수 있습니다.\r
\r
    lo <= hi는 값 찾기, lo < hi는 삽입 위치 찾기에 사용합니다.\r
  snippet: |-\r
    def binarySearchIterative(arr, target):\r
        lo, hi = 0, len(arr) - 1\r
        while lo <= hi:\r
            mid = (lo + hi) // 2\r
            if arr[mid] == target:\r
                return mid\r
            elif arr[mid] < target:\r
                lo = mid + 1\r
            else:\r
                hi = mid - 1\r
        return -1\r
\r
    sortedNums = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]\r
    bsIdx = binarySearchIterative(sortedNums, 11)\r
    f"11의 인덱스: {bsIdx}"\r
  exercise:\r
    prompt: 이진 탐색 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def binarySearchIterative(arr, target):\r
          lo, hi = 0, len(arr) - 1\r
          while lo <= hi:\r
              mid = (lo + hi) // 2\r
              if arr[mid] == target:\r
                  return mid\r
              elif arr[mid] < target:\r
                  lo = mid + 1\r
              else:\r
                  hi = mid - 1\r
          return -1\r
\r
      sortedNums = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]\r
      bsIdx = binarySearchIterative(sortedNums, 11)\r
      f"11의 인덱스: {bsIdx}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이진 탐색의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 이진 탐색 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: bisect_module\r
  title: bisect 모듈\r
  structuredPrimary: true\r
  subtitle: 표준 라이브러리 이진 탐색\r
  goal: bisect 모듈에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    bisect 모듈은 정렬된 리스트에서 O(log n) 탐색과 삽입을 제공하는 표준 라이브러리입니다. bisect_left는 같은 값의 왼쪽 위치를, bisect_right는 오른쪽 위치를 반환합니다. insort 함수로 정렬을 유지하며 삽입할 수 있습니다. 직접 구현보다 빠르고 안정적이므로 실무에서는 bisect 사용을 권장합니다.\r
\r
    bisect는 key 파라미터도 지원합니다 (Python 3.10+).\r
  snippet: |-\r
    import bisect\r
\r
    gradeList = [60, 70, 80, 90]\r
    leftPosition = bisect.bisect_left(gradeList, 80)\r
    rightPosition = bisect.bisect_right(gradeList, 80)\r
    f"bisect_left(80): {leftPosition}, bisect_right(80): {rightPosition}"\r
  exercise:\r
    prompt: bisect 모듈 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import bisect\r
\r
      gradeList = [60, 70, 80, 90]\r
      leftPosition = bisect.bisect_left(gradeList, 80)\r
      rightPosition = bisect.bisect_right(gradeList, 80)\r
      f"bisect_left(80): {leftPosition}, bisect_right(80): {rightPosition}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: bisect 모듈에서 \`gradeList\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: bisect 모듈 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: bfs\r
  title: 너비 우선 탐색 (BFS)\r
  structuredPrimary: true\r
  subtitle: 레벨 순서 탐색\r
  goal: 너비 우선 탐색 (BFS)에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    BFS(Breadth-First Search)는 시작 노드에서 가까운 노드부터 탐색하는 알고리즘입니다. 큐(Queue) 자료구조를 사용하여 레벨 순서로 탐색합니다. 시간 복잡도는 O(V + E)로 정점과 간선 수에 비례합니다. 가중치 없는 그래프에서 최단 경로를 보장합니다. 미로 탐색, 네트워크 분석, 레벨 순회 등에 사용됩니다.\r
\r
    BFS는 가중치가 없는 그래프에서만 최단 경로를 보장합니다. 가중치가 있으면 다익스트라를 사용하세요.\r
  snippet: |-\r
    from collections import deque\r
\r
    def bfsTraversal(graph, start):\r
        visitedBfs = set()\r
        queueBfs = deque([start])\r
        orderBfs = []\r
        visitedBfs.add(start)\r
        while queueBfs:\r
            nodeBfs = queueBfs.popleft()\r
            orderBfs.append(nodeBfs)\r
            for neighbor in graph[nodeBfs]:\r
                if neighbor not in visitedBfs:\r
                    visitedBfs.add(neighbor)\r
                    queueBfs.append(neighbor)\r
        return orderBfs\r
\r
    graphBfs = {\r
        'A': ['B', 'C'],\r
        'B': ['A', 'D', 'E'],\r
        'C': ['A', 'F'],\r
        'D': ['B'],\r
        'E': ['B', 'F'],\r
        'F': ['C', 'E']\r
    }\r
    bfsOrder = bfsTraversal(graphBfs, 'A')\r
    f"BFS 순서: {' -> '.join(bfsOrder)}"\r
  exercise:\r
    prompt: 너비 우선 탐색 (BFS) 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from collections import deque\r
\r
      def bfsTraversal(graph, start):\r
          visitedBfs = set()\r
          queueBfs = deque([start])\r
          orderBfs = []\r
          visitedBfs.add(start)\r
          while queueBfs:\r
              nodeBfs = queueBfs.popleft()\r
              orderBfs.append(nodeBfs)\r
              for neighbor in graph[nodeBfs]:\r
                  if neighbor not in visitedBfs:\r
                      visitedBfs.add(neighbor)\r
                      queueBfs.append(neighbor)\r
          return orderBfs\r
\r
      graphBfs = {\r
          'A': ['B', 'C'],\r
          'B': ['A', 'D', 'E'],\r
          'C': ['A', 'F'],\r
          'D': ['B'],\r
          'E': ['B', 'F'],\r
          'F': ['C', 'E']\r
      }\r
      bfsOrder = bfsTraversal(graphBfs, 'A')\r
      f"BFS 순서: {' -> '.join(bfsOrder)}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 너비 우선 탐색 (BFS)의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 너비 우선 탐색 (BFS) 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: dfs\r
  title: 깊이 우선 탐색 (DFS)\r
  structuredPrimary: true\r
  subtitle: 경로 우선 탐색\r
  goal: 깊이 우선 탐색 (DFS)에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    DFS(Depth-First Search)는 한 경로를 끝까지 탐색한 후 되돌아오는 알고리즘입니다. 스택 또는 재귀를 사용하여 구현합니다. 시간 복잡도는 O(V + E)로 BFS와 동일합니다. 최단 경로를 보장하지 않지만 모든 경로 탐색에 유리합니다. 사이클 탐지, 위상 정렬, 백트래킹 등에 사용됩니다.\r
\r
    파이썬 기본 재귀 한도는 1000입니다. 깊은 그래프는 스택 버전을 사용하세요.\r
  snippet: |-\r
    def dfsRecursive(graph, node, visitedDfs=None):\r
        if visitedDfs is None:\r
            visitedDfs = set()\r
        visitedDfs.add(node)\r
        orderDfs = [node]\r
        for neighbor in graph[node]:\r
            if neighbor not in visitedDfs:\r
                orderDfs.extend(dfsRecursive(graph, neighbor, visitedDfs))\r
        return orderDfs\r
\r
    graphDfs = {\r
        'A': ['B', 'C'], 'B': ['A', 'D', 'E'],\r
        'C': ['A', 'F'], 'D': ['B'], 'E': ['B', 'F'], 'F': ['C', 'E']\r
    }\r
    dfsResult = dfsRecursive(graphDfs, 'A')\r
    f"DFS 순서 (재귀): {' -> '.join(dfsResult)}"\r
  exercise:\r
    prompt: 깊이 우선 탐색 (DFS) 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def dfsRecursive(graph, node, visitedDfs=None):\r
          if visitedDfs is None:\r
              visitedDfs = set()\r
          visitedDfs.add(node)\r
          orderDfs = [node]\r
          for neighbor in graph[node]:\r
              if neighbor not in visitedDfs:\r
                  orderDfs.extend(dfsRecursive(graph, neighbor, visitedDfs))\r
          return orderDfs\r
\r
      graphDfs = {\r
          'A': ['B', 'C'], 'B': ['A', 'D', 'E'],\r
          'C': ['A', 'F'], 'D': ['B'], 'E': ['B', 'F'], 'F': ['C', 'E']\r
      }\r
      dfsResult = dfsRecursive(graphDfs, 'A')\r
      f"DFS 순서 (재귀): {' -> '.join(dfsResult)}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 깊이 우선 탐색 (DFS)의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 깊이 우선 탐색 (DFS) 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: hash_search\r
  title: 해시 탐색\r
  structuredPrimary: true\r
  subtitle: O(1) 상수 시간\r
  goal: 해시 탐색에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    해시 탐색은 해시 함수를 사용하여 평균 O(1) 시간에 탐색하는 방법입니다. 파이썬의 dict와 set이 해시 테이블로 구현되어 있습니다. 해시 충돌이 많으면 최악 O(n)이 될 수 있습니다. 키 존재 여부 확인, 빈도 카운팅, 중복 제거에 최적입니다. 메모리를 더 사용하지만 탐색 속도가 매우 빠릅니다.\r
\r
    리스트에서 in 연산은 O(n), set에서는 O(1)입니다. 반복 탐색은 set을 사용하세요.\r
  snippet: |-\r
    employeeDict = {\r
        'E001': {'name': '김철수', 'dept': '개발팀'},\r
        'E002': {'name': '이영희', 'dept': '기획팀'},\r
        'E003': {'name': '박지민', 'dept': '디자인팀'}\r
    }\r
    foundEmployee = employeeDict.get('E002')\r
    f"E002 정보: {foundEmployee}"\r
  exercise:\r
    prompt: 해시 탐색 예제에서 \`employeeDict\`, \`foundEmployee\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      employeeDict = {\r
          'E001': {'name': '김철수', 'dept': '개발팀'},\r
          'E002': {'name': '이영희', 'dept': '기획팀'},\r
          'E003': {'name': '박지민', 'dept': '디자인팀'}\r
      }\r
      foundEmployee = employeeDict.get('E002')\r
      f"E002 정보: {foundEmployee}"\r
    hints:\r
    - 바꿀 지점은 \`employeeDict = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`employeeDict\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 해시 탐색에서 \`employeeDict\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 해시 탐색 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 재고 조회와 장애 경로 찾기'\r
  structuredPrimary: true\r
  subtitle: 정렬 데이터 이진 탐색과 그래프 BFS를 각각 맞는 문제에 적용합니다\r
  goal: '현업 흐름 검증: 재고 조회와 장애 경로 찾기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    탐색 알고리즘은 데이터 모양을 먼저 봐야 합니다. 정렬된 재고 목록은 이진 탐색으로 찾고, 서비스 의존성처럼 관계가 얽힌 문제는 BFS로 최단 경로를 찾습니다.\r
\r
    변주 실험\r
    재고가 품절인 SKU만 set으로 만들고, 주문 목록을 돌며 품절 SKU가 포함되어 있는지 O(1) 멤버십으로 검사하세요.\r
  tips:\r
  - 변주 실험 재고가 품절인 SKU만 set으로 만들고, 주문 목록을 돌며 품절 SKU가 포함되어 있는지 O(1) 멤버십으로 검사하세요.\r
  snippet: |-\r
    from bisect import bisect_left\r
\r
    def findSku(rows, sku):\r
        keys = [row["sku"] for row in rows]\r
        if keys != sorted(keys):\r
            raise ValueError("rows must be sorted by sku")\r
        index = bisect_left(keys, sku)\r
        if index < len(rows) and rows[index]["sku"] == sku:\r
            return rows[index]\r
        return None\r
\r
    inventory = [\r
        {"sku": "A-100", "stock": 5},\r
        {"sku": "B-200", "stock": 0},\r
        {"sku": "C-300", "stock": 12},\r
    ]\r
\r
    assert findSku(inventory, "C-300")["stock"] == 12\r
    assert findSku(inventory, "D-400") is None\r
  exercise:\r
    prompt: '현업 흐름 검증: 재고 조회와 장애 경로 찾기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from bisect import bisect_left\r
\r
      def findSku(rows, sku):\r
          keys = [row["sku"] for row in rows]\r
          if keys != sorted(keys):\r
              raise ValueError("rows must be sorted by sku")\r
          index = bisect_left(keys, sku)\r
          if index < len(rows) and rows[index]["sku"] == sku:\r
              return rows[index]\r
          return None\r
\r
      inventory = [\r
          {"sku": "A-100", "stock": 5},\r
          {"sku": "B-200", "stock": 0},\r
          {"sku": "C-300", "stock": 12},\r
      ]\r
\r
      assert findSku(inventory, "C-300")["stock"] == 12\r
      assert findSku(inventory, "D-400") is None\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 재고 조회와 장애 경로 찾기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 재고 조회와 장애 경로 찾기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 탐색 알고리즘 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 18에서 배운 탐색 알고리즘을 난이도별로 복습합니다. 탐색은 데이터에서 원하는 값을 찾는 기본 연산으로, 선형 탐색 O(n)과 이진 탐색 O(log\r
    n)의 성능 차이를 이해하는 것이 핵심입니다. 해시 탐색은 O(1)을 제공하며, 그래프 탐색(BFS, DFS)은 복잡한 구조 탐색의 기반입니다. 🟢 기본 문제로 선형 탐색, 최댓값/최솟값\r
    찾기를 익히고, 🟡 응용 문제로 이진 탐색, 해시 탐색을 연습하세요. 🔴 심화 문제에서는 BFS/DFS, 경로 찾기, bisect 모듈 활용 등 고급 탐색을 다룹니다. 탐색 알고리즘\r
    선택은 데이터 정렬 여부, 크기, 접근 패턴에 따라 달라집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def findMaxIndex(arr):\r
        if not arr:\r
            return -1\r
        maxIdx = 0\r
        for i in range(1, len(arr)):\r
            if arr[i] > arr[maxIdx]:\r
                maxIdx = i\r
        return maxIdx\r
\r
    ex1Nums = [3, 7, 2, 9, 4, 6, 8, 1, 5]\r
    ex1Result = findMaxIndex(ex1Nums)\r
    f"최댓값 {ex1Nums[ex1Result]}의 인덱스: {ex1Result}"\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def findMaxIndex(arr):\r
          if not arr:\r
              return -1\r
          maxIdx = 0\r
          for i in range(1, len(arr)):\r
              if arr[i] > arr[maxIdx]:\r
                  maxIdx = i\r
          return maxIdx\r
\r
      ex1Nums = [3, 7, 2, 9, 4, 6, 8, 1, 5]\r
      ex1Result = findMaxIndex(ex1Nums)\r
      f"최댓값 {ex1Nums[ex1Result]}의 인덱스: {ex1Result}"\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 18_search_algorithms-inventory-binary-search-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - linear_search
    - binary_search
    - bisect_module
    - workflow_validation
    title: 정렬된 재고에서 이진 탐색과 삽입 위치 찾기
    subtitle: binary search inventory
    goal: binary_search_inventory(records, sku)를 완성해 검색 성공 여부, 인덱스, 재고, 삽입 위치, 비교 횟수를 반환한다.
    why: 이진 탐색은 빠르지만 정렬이라는 전제가 깨지면 조용히 틀립니다. 학습자는 속도보다 먼저 전제 조건과 실패 시 삽입 위치를 함께 다뤄야 합니다.
    explanation: records는 sku 오름차순으로 정렬된 딕셔너리 리스트입니다. 찾으면 해당 index와 stock을 반환하고, 없으면 들어갈 insertionIndex를 반환하세요.
    tips:
    - 매 반복에서 low, high 중 하나가 반드시 줄어야 합니다.
    - 정렬되지 않은 records는 ValueError로 거부해야 탐색 전제를 지킬 수 있습니다.
    exercise:
      prompt: binary_search_inventory(records, sku)를 완성해 found, index, stock, insertionIndex, checks를 반환하세요.
      starterCode: |-
        def binary_search_inventory(records, sku):
            raise NotImplementedError
      solution: |-
        def binary_search_inventory(records, sku):
            skus = [record["sku"] for record in records]
            if any(skus[index] > skus[index + 1] for index in range(len(skus) - 1)):
                raise ValueError("records must be sorted by sku")

            low = 0
            high = len(records) - 1
            checks = 0
            while low <= high:
                mid = (low + high) // 2
                checks += 1
                current = records[mid]["sku"]
                if current == sku:
                    return {
                        "found": True,
                        "index": mid,
                        "stock": records[mid]["stock"],
                        "insertionIndex": mid,
                        "checks": checks,
                    }
                if current < sku:
                    low = mid + 1
                else:
                    high = mid - 1
            return {
                "found": False,
                "index": -1,
                "stock": None,
                "insertionIndex": low,
                "checks": checks,
            }
      hints:
      - low는 탐색 실패 뒤 삽입 위치가 됩니다.
      - 비교 횟수는 while 루프에서 mid를 확인할 때마다 늘리세요.
    check:
      id: python.advanced.search-inventory.binary-search.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.search-inventory.empty.behavior.v1.fixture
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
        entry: binary_search_inventory
        cases:
        - id: finds-existing-sku-with-one-check
          arguments:
          - value:
            - sku: A-100
              stock: 5
            - sku: B-200
              stock: 0
            - sku: D-400
              stock: 12
          - value: B-200
          expectedReturn:
            found: true
            index: 1
            stock: 0
            insertionIndex: 1
            checks: 1
        - id: returns-insertion-index-for-missing-sku
          arguments:
          - value:
            - sku: A-100
              stock: 5
            - sku: B-200
              stock: 0
            - sku: D-400
              stock: 12
          - value: C-300
          expectedReturn:
            found: false
            index: -1
            stock: null
            insertionIndex: 2
            checks: 2
        - id: rejects-unsorted-inventory
          arguments:
          - value:
            - sku: B-200
              stock: 0
            - sku: A-100
              stock: 5
          - value: A-100
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 18_search_algorithms-incident-path-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - bfs
    - dfs
    - hash_search
    title: 서비스 장애 그래프에서 최단 경로 찾기
    subtitle: bfs incident path transfer
    goal: shortest_incident_path(graph, start, target)를 완성해 BFS로 최단 경로와 방문 순서를 반환한다.
    why: 탐색은 배열에서 값을 찾는 데서 끝나지 않습니다. 장애 전파, 화면 흐름, 의존 관계처럼 연결 구조에서 가장 짧은 설명 경로를 찾는 일이 실무에 자주 나옵니다.
    explanation: graph는 노드 이름을 이웃 목록에 매핑한 딕셔너리입니다. start에서 target까지 BFS로 탐색하고, 도달하지 못하면 found false와 빈 path를 반환하세요.
    tips:
    - 큐에 넣는 순간 seen에 추가하면 같은 노드를 중복 방문하지 않습니다.
    - 경로는 큐에 노드와 함께 들고 다니면 target을 만났을 때 바로 반환할 수 있습니다.
    exercise:
      prompt: shortest_incident_path(graph, start, target)를 완성해 found, path, distance, visitedOrder를 반환하세요.
      starterCode: |-
        def shortest_incident_path(graph, start, target):
            raise NotImplementedError
      solution: |-
        def shortest_incident_path(graph, start, target):
            if start not in graph:
                raise ValueError("start node is missing")

            queue = [(start, [start])]
            seen = {start}
            visited = []
            index = 0
            while index < len(queue):
                node, path = queue[index]
                index += 1
                visited.append(node)
                if node == target:
                    return {
                        "found": True,
                        "path": path,
                        "distance": len(path) - 1,
                        "visitedOrder": visited,
                    }
                for neighbor in graph.get(node, []):
                    if neighbor not in seen:
                        seen.add(neighbor)
                        queue.append((neighbor, path + [neighbor]))
            return {
                "found": False,
                "path": [],
                "distance": None,
                "visitedOrder": visited,
            }
      hints:
      - BFS는 먼저 발견한 target 경로가 최단 경로입니다.
      - graph.get(node, [])를 쓰면 이웃 목록이 없는 말단도 안전하게 처리할 수 있습니다.
    check:
      id: python.advanced.search-inventory.incident-path.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.search-inventory.empty.behavior.v1.fixture
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
        entry: shortest_incident_path
        cases:
        - id: finds-shortest-service-path
          arguments:
          - value:
              api:
              - auth
              - billing
              auth:
              - profile
              billing:
              - ledger
              profile:
              - ledger
              ledger: []
          - value: api
          - value: ledger
          expectedReturn:
            found: true
            path:
            - api
            - billing
            - ledger
            distance: 2
            visitedOrder:
            - api
            - auth
            - billing
            - profile
            - ledger
        - id: reports-unreachable-target
          arguments:
          - value:
              api:
              - auth
              auth: []
              cache: []
          - value: api
          - value: cache
          expectedReturn:
            found: false
            path: []
            distance: null
            visitedOrder:
            - api
            - auth
        - id: rejects-missing-start
          arguments:
          - value:
              api: []
          - value: worker
          - value: api
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 18_search_algorithms-strategy-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - linear_search
    - binary_search
    - bisect_module
    - bfs
    - dfs
    - hash_search
    title: 탐색 전략 선택 기준 회상하기
    subtitle: search strategy recall
    goal: choose_search_strategy(context)를 완성해 데이터 조건별 탐색 방법과 필요한 전제를 반환한다.
    why: 탐색 알고리즘의 핵심은 이름 암기가 아니라, 정렬 여부, 조회 빈도, 연결 구조, 전체 순회 필요성을 보고 방법을 고르는 판단입니다.
    explanation: unsorted-small, sorted-static, range-insertion, relationship-hop, exhaustive-path, exact-key 상황별로 method와 requirement를 반환하세요.
    tips:
    - 이진 탐색과 bisect는 정렬 전제가 필수입니다.
    - exact key 반복 조회는 딕셔너리 같은 해시 구조가 보통 가장 단순합니다.
    exercise:
      prompt: choose_search_strategy(context)를 완성해 method, requirement, useWhen을 반환하세요.
      starterCode: |-
        def choose_search_strategy(context):
            raise NotImplementedError
      solution: |-
        def choose_search_strategy(context):
            table = {
                "unsorted-small": {
                    "method": "linear-search",
                    "requirement": "none",
                    "useWhen": "the list is small or only scanned once",
                },
                "sorted-static": {
                    "method": "binary-search",
                    "requirement": "sorted input",
                    "useWhen": "many lookups happen on a stable sorted list",
                },
                "range-insertion": {
                    "method": "bisect",
                    "requirement": "sorted input",
                    "useWhen": "find insertion boundaries without rewriting search loops",
                },
                "relationship-hop": {
                    "method": "bfs",
                    "requirement": "neighbors for each node",
                    "useWhen": "the shortest unweighted path matters",
                },
                "exhaustive-path": {
                    "method": "dfs",
                    "requirement": "visited tracking",
                    "useWhen": "explore all reachable branches or backtracking paths",
                },
                "exact-key": {
                    "method": "hash-lookup",
                    "requirement": "unique or grouped keys",
                    "useWhen": "direct repeated lookup by id is needed",
                },
            }
            if context not in table:
                raise ValueError("unknown search context")
            return table[context]
      hints:
      - 해시 탐색은 정렬이 아니라 키 설계가 핵심입니다.
      - BFS는 최단 경로, DFS는 전체 탐색과 백트래킹에서 자주 씁니다.
    check:
      id: python.advanced.search-inventory.strategy-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.search-inventory.empty.behavior.v1.fixture
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
        entry: choose_search_strategy
        cases:
        - id: recalls-binary-search-precondition
          arguments:
          - value: sorted-static
          expectedReturn:
            method: binary-search
            requirement: sorted input
            useWhen: many lookups happen on a stable sorted list
        - id: recalls-bfs-for-shortest-hop-path
          arguments:
          - value: relationship-hop
          expectedReturn:
            method: bfs
            requirement: neighbors for each node
            useWhen: the shortest unweighted path matters
        - id: rejects-unknown-context
          arguments:
          - value: random-probing
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};