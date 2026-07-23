var e=`meta:\r
  id: '20'\r
  title: 자료구조 구현\r
  day: 20\r
  category: advancedPython\r
  tags:\r
  - stack\r
  - queue\r
  - linkedlist\r
  - tree\r
  - heap\r
  - hashtable\r
  - 검증\r
  - 자료구조선택\r
  seo:\r
    title: 파이썬 자료구조 구현 - 스택, 큐, 연결 리스트, 트리, 힙\r
    description: 핵심 자료구조를 직접 구현하여 내부 동작을 이해합니다. 스택, 큐, 연결 리스트, 이진 트리, 힙, 해시 테이블을 직접 만들어봅니다.\r
    keywords:\r
    - 자료구조\r
    - 스택\r
    - 큐\r
    - 연결 리스트\r
    - 이진 트리\r
    - 힙\r
    - 해시 테이블\r
intro:\r
  emoji: 🏗️\r
  points:\r
  - '스택과 큐 구현: LIFO/FIFO 구조'\r
  - '연결 리스트: 단일/이중 연결'\r
  - 이진 트리와 BST 구현\r
  - 힙과 해시 테이블 구현\r
  direction: 자료구조 구현에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 자료구조 구현 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 스택 구현 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 큐 구현 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 연결 리스트 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 자료구조 구현 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 자료구조 구현 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 자료구조 구현 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: stack\r
  title: 스택 구현\r
  structuredPrimary: true\r
  subtitle: LIFO 구조\r
  goal: 스택 구현에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    스택은 후입선출(LIFO) 구조입니다. push로 삽입하고 pop으로 제거합니다. 함수 호출 스택, 괄호 검사, Undo 기능 등에 사용됩니다. O(1) 시간에 삽입/삭제가 가능합니다.\r
\r
    MinStack은 보조 스택을 사용해 최소값을 추적합니다.\r
  snippet: |-\r
    class Stack:\r
        def __init__(self):\r
            self.items = []\r
\r
        def push(self, item):\r
            self.items.append(item)\r
\r
        def pop(self):\r
            if not self.isEmpty():\r
                return self.items.pop()\r
            return None\r
\r
        def peek(self):\r
            if not self.isEmpty():\r
                return self.items[-1]\r
            return None\r
\r
        def isEmpty(self):\r
            return len(self.items) == 0\r
\r
        def size(self):\r
            return len(self.items)\r
\r
    stk = Stack()\r
    stk.push(10)\r
    stk.push(20)\r
    stk.push(30)\r
    stkPeek = stk.peek()\r
    stkPop = stk.pop()\r
    stkSize = stk.size()\r
    (stkPeek, stkPop, stkSize)\r
  exercise:\r
    prompt: 스택 구현 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Stack:\r
          def __init__(self):\r
              self.items = []\r
\r
          def push(self, item):\r
              self.items.append(item)\r
\r
          def pop(self):\r
              if not self.isEmpty():\r
                  return self.items.pop()\r
              return None\r
\r
          def peek(self):\r
              if not self.isEmpty():\r
                  return self.items[-1]\r
              return None\r
\r
          def isEmpty(self):\r
              return len(self.items) == 0\r
\r
          def size(self):\r
              return len(self.items)\r
\r
      stk = Stack()\r
      stk.push(10)\r
      stk.push(20)\r
      stk.push(30)\r
      stkPeek = stk.peek()\r
      stkPop = stk.pop()\r
      stkSize = stk.size()\r
      (stkPeek, stkPop, stkSize)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 스택 구현의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 스택 구현 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: queue\r
  title: 큐 구현\r
  structuredPrimary: true\r
  subtitle: FIFO 구조\r
  goal: 큐 구현에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    큐는 선입선출(FIFO) 구조입니다. enqueue로 삽입하고 dequeue로 제거합니다. BFS, 작업 스케줄링, 버퍼 등에 사용됩니다. 덱(Deque)은 양쪽 끝에서 삽입/삭제가 가능합니다.\r
\r
    collections.deque는 O(1) 양방향 연산을 제공합니다.\r
  snippet: |-\r
    class Queue:\r
        def __init__(self):\r
            self.items = []\r
\r
        def enqueue(self, item):\r
            self.items.append(item)\r
\r
        def dequeue(self):\r
            if not self.isEmpty():\r
                return self.items.pop(0)\r
            return None\r
\r
        def front(self):\r
            if not self.isEmpty():\r
                return self.items[0]\r
            return None\r
\r
        def isEmpty(self):\r
            return len(self.items) == 0\r
\r
        def size(self):\r
            return len(self.items)\r
\r
    que = Queue()\r
    que.enqueue('A')\r
    que.enqueue('B')\r
    que.enqueue('C')\r
    queFront = que.front()\r
    queDeq = que.dequeue()\r
    queSize = que.size()\r
    (queFront, queDeq, queSize)\r
  exercise:\r
    prompt: 큐 구현 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Queue:\r
          def __init__(self):\r
              self.items = []\r
\r
          def enqueue(self, item):\r
              self.items.append(item)\r
\r
          def dequeue(self):\r
              if not self.isEmpty():\r
                  return self.items.pop(0)\r
              return None\r
\r
          def front(self):\r
              if not self.isEmpty():\r
                  return self.items[0]\r
              return None\r
\r
          def isEmpty(self):\r
              return len(self.items) == 0\r
\r
          def size(self):\r
              return len(self.items)\r
\r
      que = Queue()\r
      que.enqueue('A')\r
      que.enqueue('B')\r
      que.enqueue('C')\r
      queFront = que.front()\r
      queDeq = que.dequeue()\r
      queSize = que.size()\r
      (queFront, queDeq, queSize)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 큐 구현의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 큐 구현 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: linkedlist\r
  title: 연결 리스트\r
  structuredPrimary: true\r
  subtitle: 노드 기반 구조\r
  goal: 연결 리스트에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    연결 리스트는 노드들이 포인터로 연결된 구조입니다. 삽입/삭제가 O(1)이지만 탐색은 O(n)입니다. 단일 연결 리스트는 다음 노드만, 이중 연결 리스트는 이전/다음 노드를 모두 참조합니다.\r
\r
    이중 연결 리스트는 LRU 캐시 구현에 자주 사용됩니다.\r
  snippet: |-\r
    class ListNode:\r
        def __init__(self, val):\r
            self.val = val\r
            self.next = None\r
\r
    class LinkedList:\r
        def __init__(self):\r
            self.head = None\r
\r
        def append(self, val):\r
            newNode = ListNode(val)\r
            if not self.head:\r
                self.head = newNode\r
                return\r
            curr = self.head\r
            while curr.next:\r
                curr = curr.next\r
            curr.next = newNode\r
\r
        def prepend(self, val):\r
            newNode = ListNode(val)\r
            newNode.next = self.head\r
            self.head = newNode\r
\r
        def delete(self, val):\r
            if not self.head:\r
                return\r
            if self.head.val == val:\r
                self.head = self.head.next\r
                return\r
            curr = self.head\r
            while curr.next and curr.next.val != val:\r
                curr = curr.next\r
            if curr.next:\r
                curr.next = curr.next.next\r
\r
        def toList(self):\r
            result = []\r
            curr = self.head\r
            while curr:\r
                result.append(curr.val)\r
                curr = curr.next\r
            return result\r
\r
    llist = LinkedList()\r
    llist.append(1)\r
    llist.append(2)\r
    llist.append(3)\r
    llist.prepend(0)\r
    llist.delete(2)\r
    llistResult = llist.toList()\r
    llistResult\r
  exercise:\r
    prompt: 연결 리스트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class ListNode:\r
          def __init__(self, val):\r
              self.val = val\r
              self.next = None\r
\r
      class LinkedList:\r
          def __init__(self):\r
              self.head = None\r
\r
          def append(self, val):\r
              newNode = ListNode(val)\r
              if not self.head:\r
                  self.head = newNode\r
                  return\r
              curr = self.head\r
              while curr.next:\r
                  curr = curr.next\r
              curr.next = newNode\r
\r
          def prepend(self, val):\r
              newNode = ListNode(val)\r
              newNode.next = self.head\r
              self.head = newNode\r
\r
          def delete(self, val):\r
              if not self.head:\r
                  return\r
              if self.head.val == val:\r
                  self.head = self.head.next\r
                  return\r
              curr = self.head\r
              while curr.next and curr.next.val != val:\r
                  curr = curr.next\r
              if curr.next:\r
                  curr.next = curr.next.next\r
\r
          def toList(self):\r
              result = []\r
              curr = self.head\r
              while curr:\r
                  result.append(curr.val)\r
                  curr = curr.next\r
              return result\r
\r
      llist = LinkedList()\r
      llist.append(1)\r
      llist.append(2)\r
      llist.append(3)\r
      llist.prepend(0)\r
      llist.delete(2)\r
      llistResult = llist.toList()\r
      llistResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 연결 리스트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 연결 리스트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: binarytree\r
  title: 이진 트리\r
  structuredPrimary: true\r
  subtitle: 트리 구조의 기본\r
  goal: 이진 트리에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    이진 트리는 각 노드가 최대 2개의 자식을 가지는 구조입니다. 전위/중위/후위 순회로 트리를 탐색합니다. 이진 탐색 트리(BST)는 왼쪽 < 부모 < 오른쪽 규칙을 따릅니다. BST에서 탐색/삽입은 평균 O(log n)입니다.\r
\r
    BST의 중위 순회는 정렬된 순서로 값을 반환합니다.\r
  snippet: |-\r
    class TreeNode:\r
        def __init__(self, val):\r
            self.val = val\r
            self.left = None\r
            self.right = None\r
\r
    class BinaryTree:\r
        def __init__(self):\r
            self.root = None\r
\r
        def inorder(self, node, result):\r
            if node:\r
                self.inorder(node.left, result)\r
                result.append(node.val)\r
                self.inorder(node.right, result)\r
            return result\r
\r
        def preorder(self, node, result):\r
            if node:\r
                result.append(node.val)\r
                self.preorder(node.left, result)\r
                self.preorder(node.right, result)\r
            return result\r
\r
        def postorder(self, node, result):\r
            if node:\r
                self.postorder(node.left, result)\r
                self.postorder(node.right, result)\r
                result.append(node.val)\r
            return result\r
\r
    btree = BinaryTree()\r
    btree.root = TreeNode(1)\r
    btree.root.left = TreeNode(2)\r
    btree.root.right = TreeNode(3)\r
    btree.root.left.left = TreeNode(4)\r
    btree.root.left.right = TreeNode(5)\r
    btInorder = btree.inorder(btree.root, [])\r
    btPreorder = btree.preorder(btree.root, [])\r
    btPostorder = btree.postorder(btree.root, [])\r
    (btInorder, btPreorder, btPostorder)\r
  exercise:\r
    prompt: 이진 트리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TreeNode:\r
          def __init__(self, val):\r
              self.val = val\r
              self.left = None\r
              self.right = None\r
\r
      class BinaryTree:\r
          def __init__(self):\r
              self.root = None\r
\r
          def inorder(self, node, result):\r
              if node:\r
                  self.inorder(node.left, result)\r
                  result.append(node.val)\r
                  self.inorder(node.right, result)\r
              return result\r
\r
          def preorder(self, node, result):\r
              if node:\r
                  result.append(node.val)\r
                  self.preorder(node.left, result)\r
                  self.preorder(node.right, result)\r
              return result\r
\r
          def postorder(self, node, result):\r
              if node:\r
                  self.postorder(node.left, result)\r
                  self.postorder(node.right, result)\r
                  result.append(node.val)\r
              return result\r
\r
      btree = BinaryTree()\r
      btree.root = TreeNode(1)\r
      btree.root.left = TreeNode(2)\r
      btree.root.right = TreeNode(3)\r
      btree.root.left.left = TreeNode(4)\r
      btree.root.left.right = TreeNode(5)\r
      btInorder = btree.inorder(btree.root, [])\r
      btPreorder = btree.preorder(btree.root, [])\r
      btPostorder = btree.postorder(btree.root, [])\r
      (btInorder, btPreorder, btPostorder)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이진 트리의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 이진 트리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: heap\r
  title: 힙 구현\r
  structuredPrimary: true\r
  subtitle: 우선순위 기반 구조\r
  goal: 힙 구현에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    힙은 완전 이진 트리 기반의 우선순위 구조입니다. 최소 힙은 부모가 자식보다 작고, 최대 힙은 부모가 자식보다 큽니다. 삽입과 삭제는 O(log n), 최솟값/최댓값 조회는 O(1)입니다. 우선순위 큐, 힙 정렬에 사용됩니다.\r
\r
    파이썬 heapq 모듈은 최소 힙을 제공합니다. 최대 힙은 값을 음수로 변환하여 사용합니다.\r
  snippet: |-\r
    class MinHeap:\r
        def __init__(self):\r
            self.heap = []\r
\r
        def parent(self, i):\r
            return (i - 1) // 2\r
\r
        def leftChild(self, i):\r
            return 2 * i + 1\r
\r
        def rightChild(self, i):\r
            return 2 * i + 2\r
\r
        def swap(self, i, j):\r
            self.heap[i], self.heap[j] = self.heap[j], self.heap[i]\r
\r
        def insert(self, val):\r
            self.heap.append(val)\r
            self._heapifyUp(len(self.heap) - 1)\r
\r
        def _heapifyUp(self, i):\r
            while i > 0 and self.heap[self.parent(i)] > self.heap[i]:\r
                self.swap(i, self.parent(i))\r
                i = self.parent(i)\r
\r
        def extractMin(self):\r
            if not self.heap:\r
                return None\r
            if len(self.heap) == 1:\r
                return self.heap.pop()\r
            minVal = self.heap[0]\r
            self.heap[0] = self.heap.pop()\r
            self._heapifyDown(0)\r
            return minVal\r
\r
        def _heapifyDown(self, i):\r
            smallest = i\r
            left = self.leftChild(i)\r
            right = self.rightChild(i)\r
            if left < len(self.heap) and self.heap[left] < self.heap[smallest]:\r
                smallest = left\r
            if right < len(self.heap) and self.heap[right] < self.heap[smallest]:\r
                smallest = right\r
            if smallest != i:\r
                self.swap(i, smallest)\r
                self._heapifyDown(smallest)\r
\r
        def peek(self):\r
            return self.heap[0] if self.heap else None\r
\r
    minHeap = MinHeap()\r
    for val in [5, 3, 8, 1, 2, 9]:\r
        minHeap.insert(val)\r
    heapMin = minHeap.peek()\r
    heapExtract = minHeap.extractMin()\r
    heapMinAfter = minHeap.peek()\r
    (heapMin, heapExtract, heapMinAfter)\r
  exercise:\r
    prompt: 힙 구현 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class MinHeap:\r
          def __init__(self):\r
              self.heap = []\r
\r
          def parent(self, i):\r
              return (i - 1) // 2\r
\r
          def leftChild(self, i):\r
              return 2 * i + 1\r
\r
          def rightChild(self, i):\r
              return 2 * i + 2\r
\r
          def swap(self, i, j):\r
              self.heap[i], self.heap[j] = self.heap[j], self.heap[i]\r
\r
          def insert(self, val):\r
              self.heap.append(val)\r
              self._heapifyUp(len(self.heap) - 1)\r
\r
          def _heapifyUp(self, i):\r
              while i > 0 and self.heap[self.parent(i)] > self.heap[i]:\r
                  self.swap(i, self.parent(i))\r
                  i = self.parent(i)\r
\r
          def extractMin(self):\r
              if not self.heap:\r
                  return None\r
              if len(self.heap) == 1:\r
                  return self.heap.pop()\r
              minVal = self.heap[0]\r
              self.heap[0] = self.heap.pop()\r
              self._heapifyDown(0)\r
              return minVal\r
\r
          def _heapifyDown(self, i):\r
              smallest = i\r
              left = self.leftChild(i)\r
              right = self.rightChild(i)\r
              if left < len(self.heap) and self.heap[left] < self.heap[smallest]:\r
                  smallest = left\r
              if right < len(self.heap) and self.heap[right] < self.heap[smallest]:\r
                  smallest = right\r
              if smallest != i:\r
                  self.swap(i, smallest)\r
                  self._heapifyDown(smallest)\r
\r
          def peek(self):\r
              return self.heap[0] if self.heap else None\r
\r
      minHeap = MinHeap()\r
      for val in [5, 3, 8, 1, 2, 9]:\r
          minHeap.insert(val)\r
      heapMin = minHeap.peek()\r
      heapExtract = minHeap.extractMin()\r
      heapMinAfter = minHeap.peek()\r
      (heapMin, heapExtract, heapMinAfter)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 힙 구현의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 힙 구현 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: hashtable\r
  title: 해시 테이블\r
  structuredPrimary: true\r
  subtitle: 키-값 저장소\r
  goal: 해시 테이블에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    해시 테이블은 키를 해시 함수로 변환하여 값을 저장합니다. 평균 O(1) 시간에 조회/삽입/삭제가 가능합니다. 충돌은 체이닝 또는 개방 주소법으로 해결합니다. LRU 캐시는 해시 테이블과 연결 리스트를 조합합니다.\r
\r
    functools.lru_cache 데코레이터로 함수 결과를 캐싱할 수 있습니다.\r
  snippet: |-\r
    class HashTable:\r
        def __init__(self, size=10):\r
            self.size = size\r
            self.buckets = [[] for _ in range(size)]\r
\r
        def _hash(self, key):\r
            return hash(key) % self.size\r
\r
        def put(self, key, value):\r
            idx = self._hash(key)\r
            for i, (k, v) in enumerate(self.buckets[idx]):\r
                if k == key:\r
                    self.buckets[idx][i] = (key, value)\r
                    return\r
            self.buckets[idx].append((key, value))\r
\r
        def get(self, key):\r
            idx = self._hash(key)\r
            for k, v in self.buckets[idx]:\r
                if k == key:\r
                    return v\r
            return None\r
\r
        def remove(self, key):\r
            idx = self._hash(key)\r
            for i, (k, v) in enumerate(self.buckets[idx]):\r
                if k == key:\r
                    del self.buckets[idx][i]\r
                    return True\r
            return False\r
\r
    htable = HashTable()\r
    htable.put("name", "Alice")\r
    htable.put("age", 30)\r
    htable.put("city", "Seoul")\r
    htGet1 = htable.get("name")\r
    htGet2 = htable.get("age")\r
    htable.remove("age")\r
    htGet3 = htable.get("age")\r
    (htGet1, htGet2, htGet3)\r
  exercise:\r
    prompt: 해시 테이블 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class HashTable:\r
          def __init__(self, size=10):\r
              self.size = size\r
              self.buckets = [[] for _ in range(size)]\r
\r
          def _hash(self, key):\r
              return hash(key) % self.size\r
\r
          def put(self, key, value):\r
              idx = self._hash(key)\r
              for i, (k, v) in enumerate(self.buckets[idx]):\r
                  if k == key:\r
                      self.buckets[idx][i] = (key, value)\r
                      return\r
              self.buckets[idx].append((key, value))\r
\r
          def get(self, key):\r
              idx = self._hash(key)\r
              for k, v in self.buckets[idx]:\r
                  if k == key:\r
                      return v\r
              return None\r
\r
          def remove(self, key):\r
              idx = self._hash(key)\r
              for i, (k, v) in enumerate(self.buckets[idx]):\r
                  if k == key:\r
                      del self.buckets[idx][i]\r
                      return True\r
              return False\r
\r
      htable = HashTable()\r
      htable.put("name", "Alice")\r
      htable.put("age", 30)\r
      htable.put("city", "Seoul")\r
      htGet1 = htable.get("name")\r
      htGet2 = htable.get("age")\r
      htable.remove("age")\r
      htGet3 = htable.get("age")\r
      (htGet1, htGet2, htGet3)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 해시 테이블의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 해시 테이블 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 실무 자료구조 선택 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 구현 → 오류 확인 → 검증\r
  goal: 실무 자료구조 선택 루프에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    자료구조는 구현 시험 문제가 아니라 업무 흐름의 병목을 줄이는 선택입니다. 티켓 처리처럼 순서, 우선순위, 되돌리기가 섞인 문제에서는 큐, 힙, 스택을 각각 어디에 써야 하는지 먼저 예측하고, 작은 데이터로 검증한 뒤 수정 실험을 해야 합니다.\r
\r
    자료구조 선택은 코드 모양보다 처리 순서와 실패 조건을 검증하는 문제입니다. 작은 입력으로 예측과 검증을 통과한 뒤 데이터 크기를 키우세요.\r
  snippet: |-\r
    class TicketQueue:\r
        def __init__(self):\r
            self.items = []\r
\r
        def enqueue(self, ticket):\r
            self.items.append(ticket)\r
\r
        def dequeue(self):\r
            if not self.items:\r
                raise IndexError("empty ticket queue")\r
            return self.items.pop(0)\r
\r
        def size(self):\r
            return len(self.items)\r
\r
    tickets = [\r
        {"id": "T-101", "priority": 3, "title": "결제 실패"},\r
        {"id": "T-102", "priority": 1, "title": "비밀번호 초기화"},\r
        {"id": "T-103", "priority": 2, "title": "리포트 지연"},\r
    ]\r
\r
    ticketQueue = TicketQueue()\r
    for ticket in tickets:\r
        ticketQueue.enqueue(ticket)\r
\r
    firstTicket = ticketQueue.dequeue()\r
    secondTicket = ticketQueue.dequeue()\r
    assert (firstTicket["id"], secondTicket["id"], ticketQueue.size()) == ("T-101", "T-102", 1)\r
  exercise:\r
    prompt: 실무 자료구조 선택 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TicketQueue:\r
          def __init__(self):\r
              self.items = []\r
\r
          def enqueue(self, ticket):\r
              self.items.append(ticket)\r
\r
          def dequeue(self):\r
              if not self.items:\r
                  raise IndexError("empty ticket queue")\r
              return self.items.pop(0)\r
\r
          def size(self):\r
              return len(self.items)\r
\r
      tickets = [\r
          {"id": "T-101", "priority": 3, "title": "결제 실패"},\r
          {"id": "T-102", "priority": 1, "title": "비밀번호 초기화"},\r
          {"id": "T-103", "priority": 2, "title": "리포트 지연"},\r
      ]\r
\r
      ticketQueue = TicketQueue()\r
      for ticket in tickets:\r
          ticketQueue.enqueue(ticket)\r
\r
      firstTicket = ticketQueue.dequeue()\r
      secondTicket = ticketQueue.dequeue()\r
      assert (firstTicket["id"], secondTicket["id"], ticketQueue.size()) == ("T-101", "T-102", 1)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실무 자료구조 선택 루프의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실무 자료구조 선택 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 자료구조 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 20에서 배운 자료구조를 난이도별로 복습합니다. 자료구조는 데이터를 효율적으로 저장하고 접근하기 위한 구조로, 알고리즘 성능의 핵심 요소입니다. 스택(LIFO),\r
    큐(FIFO), 힙(우선순위), 트리(계층), 그래프(관계)는 각각 다른 문제 유형에 최적화되어 있습니다. 🟢 기본 문제로 스택과 큐를 구현하고 괄호 검사, BFS 등에 적용해보세요.\r
    🟡 응용 문제로 힙 정렬, 이진 탐색 트리를 연습하세요. 🔴 심화 문제에서는 트라이, 그래프 알고리즘 등 고급 자료구조를 다룹니다. 적절한 자료구조 선택이 알고리즘 효율성을 결정하므로\r
    각 자료구조의 시간복잡도를 숙지하세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ParenStack:\r
        def __init__(self):\r
            self.items = []\r
\r
        def push(self, item):\r
            self.items.append(item)\r
\r
        def pop(self):\r
            return self.items.pop() if self.items else None\r
\r
        def isEmpty(self):\r
            return len(self.items) == 0\r
\r
    def isValidParens(s):\r
        pstack = ParenStack()\r
        pairs = {')': '(', '}': '{', ']': '['}\r
        for ch in s:\r
            if ch in '({[':\r
                pstack.push(ch)\r
            elif ch in ')}]':\r
                if pstack.pop() != pairs[ch]:\r
                    return False\r
        return pstack.isEmpty()\r
\r
    ex1Result = isValidParens("({[]})")\r
    ex1Result\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class ParenStack:\r
          def __init__(self):\r
              self.items = []\r
\r
          def push(self, item):\r
              self.items.append(item)\r
\r
          def pop(self):\r
              return self.items.pop() if self.items else None\r
\r
          def isEmpty(self):\r
              return len(self.items) == 0\r
\r
      def isValidParens(s):\r
          pstack = ParenStack()\r
          pairs = {')': '(', '}': '{', ']': '['}\r
          for ch in s:\r
              if ch in '({[':\r
                  pstack.push(ch)\r
              elif ch in ')}]':\r
                  if pstack.pop() != pairs[ch]:\r
                      return False\r
          return pstack.isEmpty()\r
\r
      ex1Result = isValidParens("({[]})")\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 20_data_structures-stack-events-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - stack
    - queue
    - hashtable
    - workflow_validation
    title: 스택 이벤트 로그 처리하기
    subtitle: stack operation log
    goal: process_stack_events(events)를 완성해 push, pop, peek 이벤트를 처리하고 출력 목록과 남은 스택을 반환한다.
    why: 자료구조 구현은 class 모양을 외우는 일이 아니라, 어떤 연산이 어떤 순서를 보장하는지 입력 로그로 검증할 수 있어야 합니다.
    explanation: push는 value를 쌓고, pop은 마지막 값을 꺼내 outputs에 넣습니다. peek는 꺼내지 않고 마지막 값을 outputs에 넣으며, 빈 스택 pop과 peek는 None을 출력합니다.
    tips:
    - 스택은 마지막에 들어온 값이 먼저 나가는 LIFO 구조입니다.
    - 알 수 없는 action은 ValueError로 거부해야 로그 오류가 묻히지 않습니다.
    exercise:
      prompt: process_stack_events(events)를 완성해 remaining, outputs, size를 반환하세요.
      starterCode: |-
        def process_stack_events(events):
            raise NotImplementedError
      solution: |-
        def process_stack_events(events):
            stack = []
            outputs = []
            for event in events:
                action = event["action"]
                if action == "push":
                    stack.append(event["value"])
                elif action == "pop":
                    outputs.append(stack.pop() if stack else None)
                elif action == "peek":
                    outputs.append(stack[-1] if stack else None)
                else:
                    raise ValueError("unknown stack action")
            return {"remaining": stack, "outputs": outputs, "size": len(stack)}
      hints:
      - list.append와 list.pop은 스택 구현의 가장 단순한 기본 도구입니다.
      - peek는 값을 확인만 하고 stack을 변경하지 않아야 합니다.
    check:
      id: python.advanced.data-structures.stack-events.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.data-structures.empty.behavior.v1.fixture
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
        entry: process_stack_events
        cases:
        - id: processes-push-peek-and-pop-in-lifo-order
          arguments:
          - value:
            - action: push
              value: A
            - action: push
              value: B
            - action: peek
            - action: pop
            - action: pop
            - action: pop
          expectedReturn:
            remaining: []
            outputs:
            - B
            - B
            - A
            - null
            size: 0
        - id: rejects-unknown-stack-action
          arguments:
          - value:
            - action: rotate
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 20_data_structures-round-robin-queue-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - queue
    - linkedlist
    - heap
    title: 라운드로빈 작업 큐 실행하기
    subtitle: queue scheduling transfer
    goal: run_round_robin_queue(tasks, quantum)를 완성해 각 작업을 큐 순서로 조금씩 실행하고 완료 순서를 반환한다.
    why: 큐는 단순히 append와 pop을 쓰는 문제가 아니라, 공정한 순서 처리와 재삽입 규칙을 코드로 설명할 때 학습 가치가 생깁니다.
    explanation: 각 task는 id와 remaining을 가집니다. 매번 맨 앞 작업을 최대 quantum만큼 실행하고, 남은 시간이 있으면 뒤로 다시 넣으세요.
    tips:
    - queue의 앞에서 꺼내고 뒤에 넣는 순서를 유지해야 round robin이 됩니다.
    - quantum이 0 이하이면 무한 루프가 될 수 있으므로 ValueError로 거부하세요.
    exercise:
      prompt: run_round_robin_queue(tasks, quantum)를 완성해 order, totalTicks, finished를 반환하세요.
      starterCode: |-
        def run_round_robin_queue(tasks, quantum):
            raise NotImplementedError
      solution: |-
        def run_round_robin_queue(tasks, quantum):
            if quantum <= 0:
                raise ValueError("quantum must be positive")

            queue = [{"id": task["id"], "remaining": task["remaining"]} for task in tasks]
            order = []
            finished = []
            total_ticks = 0
            while queue:
                task = queue.pop(0)
                run = min(quantum, task["remaining"])
                task["remaining"] -= run
                total_ticks += run
                order.append({"id": task["id"], "run": run})
                if task["remaining"] > 0:
                    queue.append(task)
                else:
                    finished.append(task["id"])
            return {
                "order": [item["id"] for item in order],
                "totalTicks": total_ticks,
                "finished": finished,
            }
      hints:
      - pop(0)은 큐의 맨 앞을 꺼내는 동작을 표현합니다.
      - 남은 시간이 있는 작업만 다시 queue 뒤에 넣어야 합니다.
    check:
      id: python.advanced.data-structures.round-robin.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.data-structures.empty.behavior.v1.fixture
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
        entry: run_round_robin_queue
        cases:
        - id: rotates-unfinished-tasks-to-the-back
          arguments:
          - value:
            - id: A
              remaining: 5
            - id: B
              remaining: 2
            - id: C
              remaining: 3
          - value: 2
          expectedReturn:
            order:
            - A
            - B
            - C
            - A
            - C
            - A
            totalTicks: 10
            finished:
            - B
            - C
            - A
        - id: rejects-zero-quantum
          arguments:
          - value: []
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 20_data_structures-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - stack
    - queue
    - linkedlist
    - binarytree
    - heap
    - hashtable
    title: 자료구조 선택 기준 회상하기
    subtitle: data structure recall
    goal: choose_data_structure(need)를 완성해 요구사항별 자료구조와 대표 연산을 반환한다.
    why: 자료구조 학습의 최고 가치는 구현 암기가 아니라, 작업 성격을 보고 순서, 우선순위, 계층, 조회 비용을 맞추는 선택 능력입니다.
    explanation: undo-history, print-jobs, unique-lookup, top-k, hierarchy, frequent-middle-insert 목적별 자료구조를 반환하세요.
    tips:
    - LIFO와 FIFO는 사용자 경험에서 전혀 다른 순서를 만듭니다.
    - 해시 테이블은 정확한 키 조회, 힙은 우선순위 조회에 강합니다.
    exercise:
      prompt: choose_data_structure(need)를 완성해 structure, operation, useWhen을 반환하세요.
      starterCode: |-
        def choose_data_structure(need):
            raise NotImplementedError
      solution: |-
        def choose_data_structure(need):
            table = {
                "undo-history": {
                    "structure": "stack",
                    "operation": "push-pop",
                    "useWhen": "the most recent action must be reversed first",
                },
                "print-jobs": {
                    "structure": "queue",
                    "operation": "enqueue-dequeue",
                    "useWhen": "jobs should run in arrival order",
                },
                "unique-lookup": {
                    "structure": "hash-table",
                    "operation": "key-get-set",
                    "useWhen": "records are retrieved repeatedly by id",
                },
                "top-k": {
                    "structure": "heap",
                    "operation": "push-pop-priority",
                    "useWhen": "the next smallest or largest item is needed often",
                },
                "hierarchy": {
                    "structure": "tree",
                    "operation": "traverse-children",
                    "useWhen": "items have parent child relationships",
                },
                "frequent-middle-insert": {
                    "structure": "linked-list",
                    "operation": "relink-nodes",
                    "useWhen": "known node positions change without shifting arrays",
                },
            }
            if need not in table:
                raise ValueError("unknown data structure need")
            return table[need]
      hints:
      - 자료구조 선택은 연산 비용과 보장해야 하는 순서에서 출발합니다.
      - tree와 linked list는 Python 기본 list보다 구조 표현 자체가 목적일 때 쓰입니다.
    check:
      id: python.advanced.data-structures.choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.data-structures.empty.behavior.v1.fixture
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
        entry: choose_data_structure
        cases:
        - id: recalls-stack-for-undo
          arguments:
          - value: undo-history
          expectedReturn:
            structure: stack
            operation: push-pop
            useWhen: the most recent action must be reversed first
        - id: recalls-hash-table-for-id-lookup
          arguments:
          - value: unique-lookup
          expectedReturn:
            structure: hash-table
            operation: key-get-set
            useWhen: records are retrieved repeatedly by id
        - id: rejects-unknown-need
          arguments:
          - value: magic-container
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};