import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 29. 알고리즘 연습")


@app.cell
def _():
    import marimo as mo
    return (mo,)

@app.cell(hide_code=True)
def _():
    import ast

    def _runSnippet(source):
        namespace = {"__builtins__": __builtins__}
        tree = ast.parse(source, mode="exec")
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            lastExpr = ast.Expression(tree.body.pop().value)
            ast.fix_missing_locations(tree)
            ast.fix_missing_locations(lastExpr)
            exec(compile(tree, "<marimo-snippet>", "exec"), namespace)
            return eval(compile(lastExpr, "<marimo-snippet>", "eval"), namespace)
        ast.fix_missing_locations(tree)
        exec(compile(tree, "<marimo-snippet>", "exec"), namespace)
        return None

    return (_runSnippet,)

@app.cell
def _(mo):
    mo.md(r"""
    # Day 29. 알고리즘 연습

    이 노트북은 `study/python/30days/day29_알고리즘연습.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 정렬 알고리즘 구현
    - 검색 알고리즘 마스터
    - 재귀 함수 활용
    - 문제 해결 능력 향상

    ## 학습 방법

    1. 설명을 먼저 읽습니다.
    2. 바로 아래 코드 셀을 실행합니다.
    3. 출력이 설명과 어떻게 연결되는지 한 문장으로 말합니다.
    4. 연습 셀에는 예제를 보지 않고 직접 다시 작성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 범위

    - 오늘 새로 배우는 개념: 정렬, 탐색, 재귀
    - 이미 써도 되는 개념: 전체 문법
    - 오늘은 일부러 쓰지 않는 개념: 외부 라이브러리

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 정렬 알고리즘

    *데이터 정렬하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    정렬은 데이터를 특정 순서로 배열하는 기본 알고리즘입니다. 버블 정렬은 인접한 요소를 비교하여 교환하고, 선택 정렬은 최솟값을 찾아 앞으로 이동시킵니다. 삽입 정렬은 각 요소를 적절한 위치에 삽입합니다. 각 알고리즘은 시간 복잡도와 공간 복잡도가 다릅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 버블 정렬: 인접 요소 비교
    - 선택 정렬: 최솟값 선택
    - 삽입 정렬: 적절한 위치 삽입
    - 시간 복잡도 이해
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 버블 정렬

    인접한 요소를 비교하며 정렬합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
    for j in range(n - i - 1):
    if arr[j] > arr[j + 1]:
    arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

    unsorted = [64, 34, 25, 12, 22, 11, 90]
    bubbleSort(unsorted[:])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        def bubbleSort(arr):
            n = len(arr)
            for i in range(n):
                for j in range(n - i - 1):
                    if arr[j] > arr[j + 1]:
                        arr[j], arr[j + 1] = arr[j + 1], arr[j]
            return arr

        unsorted = [64, 34, 25, 12, 22, 11, 90]
        return bubbleSort(unsorted[:])
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 선택 정렬

    최솟값을 찾아 앞으로 이동시킵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def selectionSort(arr):
    n = len(arr)
    for i in range(n):
    minIdx = i
    for j in range(i + 1, n):
    if arr[j] < arr[minIdx]:
    minIdx = j
    arr[i], arr[minIdx] = arr[minIdx], arr[i]
    return arr

    numbers = [64, 25, 12, 22, 11]
    selectionSort(numbers[:])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        def selectionSort(arr):
            n = len(arr)
            for i in range(n):
                minIdx = i
                for j in range(i + 1, n):
                    if arr[j] < arr[minIdx]:
                        minIdx = j
                arr[i], arr[minIdx] = arr[minIdx], arr[i]
            return arr

        numbers = [64, 25, 12, 22, 11]
        return selectionSort(numbers[:])
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 삽입 정렬

    각 요소를 적절한 위치에 삽입합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def insertionSort(arr):
    for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
    arr[j + 1] = arr[j]
    j = j - 1
    arr[j + 1] = key
    return arr

    dataset = [12, 11, 13, 5, 6]
    insertionSort(dataset[:])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        def insertionSort(arr):
            for i in range(1, len(arr)):
                key = arr[i]
                j = i - 1
                while j >= 0 and arr[j] > key:
                    arr[j + 1] = arr[j]
                    j = j - 1
                arr[j + 1] = key
            return arr

        dataset = [12, 11, 13, 5, 6]
        return insertionSort(dataset[:])
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 정렬 알고리즘을 선택할 때는 데이터 크기와 특성을 고려해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 검색 알고리즘

    *데이터 찾기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    검색은 특정 값을 찾는 기본 알고리즘입니다. 선형 검색은 처음부터 끝까지 순차적으로 탐색하며, 이진 검색은 정렬된 배열에서 중간값과 비교하여 범위를 절반씩 줄입니다. 이진 검색은 O(log n)으로 선형 검색의 O(n)보다 훨씬 빠릅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 선형 검색: 순차 탐색
    - 이진 검색: 분할 정복
    - 정렬 여부 확인 필요
    - 시간 복잡도 차이
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 선형 검색

    순차적으로 값을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def linearSearch(arr, target):
    for i in range(len(arr)):
    if arr[i] == target:
    return i
    return -1

    elements = [10, 23, 45, 70, 11, 15]
    linearSearch(elements, 70)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        def linearSearch(arr, target):
            for i in range(len(arr)):
                if arr[i] == target:
                    return i
            return -1

        elements = [10, 23, 45, 70, 11, 15]
        return linearSearch(elements, 70)
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 이진 검색

    정렬된 배열에서 빠르게 값을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def binarySearch(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
    return mid
    elif arr[mid] < target:
    left = mid + 1
    else:
    right = mid - 1
    return -1

    sortedArr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    binarySearch(sortedArr, 23)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        def binarySearch(arr, target):
            left = 0
            right = len(arr) - 1
            while left <= right:
                mid = (left + right) // 2
                if arr[mid] == target:
                    return mid
                elif arr[mid] < target:
                    left = mid + 1
                else:
                    right = mid - 1
            return -1

        sortedArr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
        return binarySearch(sortedArr, 23)
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 존재 여부

    배열에 특정 값이 있는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def contains(arr, value):
    for item in arr:
    if item == value:
    return True
    return False

    collection = [1, 2, 3, 4, 5]
    contains(collection, 3), contains(collection, 10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        def contains(arr, value):
            for item in arr:
                if item == value:
                    return True
            return False

        collection = [1, 2, 3, 4, 5]
        return (contains(collection, 3), contains(collection, 10))
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 이진 검색을 사용하려면 배열이 정렬되어 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 재귀 함수 기초

    *함수가 자기 자신을 호출*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    재귀는 함수가 자기 자신을 호출하는 프로그래밍 기법입니다. 기저 조건(base case)과 재귀 조건(recursive case)으로 구성되며, 기저 조건이 없으면 무한 루프에 빠집니다. 팩토리얼, 피보나치, 하노이 탑 등 많은 문제를 재귀로 해결할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 기저 조건: 재귀 종료
    - 재귀 조건: 자기 호출
    - 스택 메모리 사용
    - 우아한 문제 해결
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 팩토리얼

    n! = n × (n-1)!를 재귀로 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def factorial(n):
    if n <= 1:
    return 1
    return n * factorial(n - 1)

    factorial(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        def factorial(n):
            if n <= 1:
                return 1
            return n * factorial(n - 1)

        return factorial(5)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 피보나치 수열

    F(n) = F(n-1) + F(n-2)를 재귀로 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def fibonacci(n):
    if n <= 1:
    return n
    return fibonacci(n - 1) + fibonacci(n - 2)

    fibonacci(7)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        def fibonacci(n):
            if n <= 1:
                return n
            return fibonacci(n - 1) + fibonacci(n - 2)

        return fibonacci(7)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 거듭제곱

    x^n을 재귀로 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def power(base, exp):
    if exp == 0:
    return 1
    return base * power(base, exp - 1)

    power(2, 10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        def power(base, exp):
            if exp == 0:
                return 1
            return base * power(base, exp - 1)

        return power(2, 10)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 재귀 함수는 반드시 기저 조건을 가져야 무한 재귀를 방지할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 재귀 심화

    *복잡한 재귀 문제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    재귀는 트리 구조, 백트래킹, 분할 정복 등 복잡한 알고리즘에 사용됩니다. 리스트 합계, 문자열 뒤집기, 이진 검색 등도 재귀로 구현할 수 있습니다. 재귀는 코드를 간결하게 만들지만 스택 오버플로우에 주의해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 리스트 재귀 처리
    - 문자열 재귀 처리
    - 분할 정복 전략
    - 스택 깊이 주의
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 합계

    리스트의 모든 요소를 재귀로 더합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def sumList(lst):
    if not lst:
    return 0
    return lst[0] + sumList(lst[1:])

    values = [1, 2, 3, 4, 5]
    sumList(values)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        def sumList(lst):
            if not lst:
                return 0
            return lst[0] + sumList(lst[1:])

        values = [1, 2, 3, 4, 5]
        return sumList(values)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 뒤집기

    문자열을 재귀로 뒤집습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def reverseStr(s):
    if len(s) <= 1:
    return s
    return reverseStr(s[1:]) + s[0]

    reverseStr('hello')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        def reverseStr(s):
            if len(s) <= 1:
                return s
            return reverseStr(s[1:]) + s[0]

        return reverseStr('hello')
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최댓값 찾기

    리스트에서 최댓값을 재귀로 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def findMax(lst):
    if len(lst) == 1:
    return lst[0]
    maxRest = findMax(lst[1:])
    return lst[0] if lst[0] > maxRest else maxRest

    nums = [3, 7, 2, 9, 4, 1]
    findMax(nums)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        def findMax(lst):
            if len(lst) == 1:
                return lst[0]
            maxRest = findMax(lst[1:])
            return lst[0] if lst[0] > maxRest else maxRest

        nums = [3, 7, 2, 9, 4, 1]
        return findMax(nums)
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 재귀는 문제를 더 작은 부분 문제로 나누는 분할 정복 전략에 적합합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 알고리즘 패턴

    *자주 사용되는 패턴*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    알고리즘 문제 해결에는 반복되는 패턴이 있습니다. 투 포인터는 양 끝에서 시작하여 중간으로 이동하며, 슬라이딩 윈도우는 고정 크기의 구간을 이동시킵니다. 이러한 패턴을 익히면 다양한 문제를 효율적으로 해결할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 투 포인터 기법
    - 슬라이딩 윈도우
    - 카운팅 기법
    - 효율성 향상
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 투 포인터: 회문 검사

    양 끝에서 중간으로 이동하며 비교합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def isPalindrome(s):
    left = 0
    right = len(s) - 1
    while left < right:
    if s[left] != s[right]:
    return False
    left = left + 1
    right = right - 1
    return True

    isPalindrome('radar')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        def isPalindrome(s):
            left = 0
            right = len(s) - 1
            while left < right:
                if s[left] != s[right]:
                    return False
                left = left + 1
                right = right - 1
            return True

        return isPalindrome('radar')
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 슬라이딩 윈도우

    고정 크기 구간의 최댓값을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def maxSlidingWindow(arr, k):
    if len(arr) < k:
    return []
    maxVals = []
    for i in range(len(arr) - k + 1):
    window = arr[i:i + k]
    maxVals.append(max(window))
    return maxVals

    sequence = [1, 3, 2, 5, 8, 1, 4]
    maxSlidingWindow(sequence, 3)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        def maxSlidingWindow(arr, k):
            if len(arr) < k:
                return []
            maxVals = []
            for i in range(len(arr) - k + 1):
                window = arr[i:i + k]
                maxVals.append(max(window))
            return maxVals

        sequence = [1, 3, 2, 5, 8, 1, 4]
        return maxSlidingWindow(sequence, 3)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈도 카운팅

    요소의 등장 횟수를 셉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def countFrequency(arr):
    freq = {}
    for item in arr:
    if item in freq:
    freq[item] = freq[item] + 1
    else:
    freq[item] = 1
    return freq

    items = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
    countFrequency(items)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        def countFrequency(arr):
            freq = {}
            for item in arr:
                if item in freq:
                    freq[item] = freq[item] + 1
                else:
                    freq[item] = 1
            return freq

        items = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
        return countFrequency(items)
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 알고리즘 패턴을 익히면 새로운 문제도 빠르게 해결할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실전 문제

    *종합 알고리즘 문제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    실전 알고리즘 문제는 여러 개념을 조합하여 해결합니다. 중복 제거, 최빈값 찾기, 부분 배열 합계 등은 정렬, 검색, 카운팅을 함께 사용합니다. 문제를 작은 단계로 나누고 각 단계를 구현하는 것이 중요합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 문제 분석
    - 단계별 구현
    - 테스트와 검증
    - 최적화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중복 제거

    리스트에서 중복을 제거하고 정렬합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def removeDuplicates(arr):
    seen = []
    for item in arr:
    if item not in seen:
    seen.append(item)
    return sorted(seen)

    duplicated = [4, 2, 4, 1, 3, 2, 5, 3]
    removeDuplicates(duplicated)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        def removeDuplicates(arr):
            seen = []
            for item in arr:
                if item not in seen:
                    seen.append(item)
            return sorted(seen)

        duplicated = [4, 2, 4, 1, 3, 2, 5, 3]
        return removeDuplicates(duplicated)
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최빈값 찾기

    가장 많이 등장하는 값을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def findMode(arr):
    freq = {}
    for item in arr:
    freq[item] = freq.get(item, 0) + 1
    maxCount = max(freq.values())
    for key, val in freq.items():
    if val == maxCount:
    return key
    return None

    data = [1, 2, 2, 3, 3, 3, 4, 4]
    findMode(data)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        def findMode(arr):
            freq = {}
            for item in arr:
                freq[item] = freq.get(item, 0) + 1
            maxCount = max(freq.values())
            for key, val in freq.items():
                if val == maxCount:
                    return key
            return None

        data = [1, 2, 2, 3, 3, 3, 4, 4]
        return findMode(data)
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연속 합계

    연속된 구간의 최대 합을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def maxSubarraySum(arr, k):
    if len(arr) < k:
    return 0
    maxSum = sum(arr[:k])
    currentSum = maxSum
    for i in range(k, len(arr)):
    currentSum = currentSum - arr[i - k] + arr[i]
    if currentSum > maxSum:
    maxSum = currentSum
    return maxSum

    scores = [2, 1, 5, 1, 3, 2]
    maxSubarraySum(scores, 3)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        def maxSubarraySum(arr, k):
            if len(arr) < k:
                return 0
            maxSum = sum(arr[:k])
            currentSum = maxSum
            for i in range(k, len(arr)):
                currentSum = currentSum - arr[i - k] + arr[i]
                if currentSum > maxSum:
                    maxSum = currentSum
            return maxSum

        scores = [2, 1, 5, 1, 3, 2]
        return maxSubarraySum(scores, 3)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 복잡한 문제는 작은 함수로 나누어 구현하면 이해와 디버깅이 쉬워집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 29 종합 복습

    *알고리즘 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 29에서 배운 알고리즘을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 배열 뒤집기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 최솟값 찾기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 카운트다운 재귀

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 짝수만 필터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 리스트 길이 재귀

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 정렬 확인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 재귀 합계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 이진 검색 재귀

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 두 번째로 큰 값

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 회문 재귀

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 병합 정렬

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 퀵 정렬

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: GCD 유클리드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 순열 생성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 하노이 탑

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화6: 부분집합 합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화7: 최장 증가 부분수열

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화8: 배낭 문제

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화9: 미로 찾기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화10: 동전 교환

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
