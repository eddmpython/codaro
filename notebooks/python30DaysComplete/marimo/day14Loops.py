import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 14. 반복문")


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
    # Day 14. 반복문

    이 노트북은 `curricula/python/30days/day14_반복문.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    for, while, range(), break, continue로 반복 실행을 제어합니다.

    ## 왜 중요한가

    반복문은 같은 일을 사람이 여러 번 쓰지 않도록 만드는 핵심 도구입니다.

    ## 생각 모델

    for는 정해진 목록을 하나씩 꺼내는 흐름이고, while은 조건이 참인 동안 계속 도는 흐름입니다.

    ## 오늘 배우는 것

    - for로 컬렉션 순회
    - while로 조건 반복
    - break, continue로 제어
    - 중첩 반복문 활용

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

    - 오늘 새로 배우는 개념: for 반복문, while 반복문, range(), break, continue, 반복문 else, 중첩 반복문
    - 이미 써도 되는 개념: 지금까지 배운 자료형, 조건문
    - 오늘은 일부러 쓰지 않는 개념: 직접 만드는 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 반복 횟수와 반복할 때마다 바뀌는 값을 먼저 표시합니다.
    - 실행 중: 반복문 안과 밖의 출력 위치 차이를 확인합니다.
    - 연습 초점: 리스트의 모든 값 처리, 숫자 범위 누적, 조건에 따른 중단을 연습합니다.
    - 막히면: 무한 반복이 의심되면 while 조건을 바꾸는 줄이 있는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## for 리스트 순회

    *리스트의 모든 요소 처리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    for문은 리스트의 요소를 하나씩 꺼내서 처리합니다. for 변수 in 리스트: 형식으로 쓰며, 리스트의 모든 요소에 대해 반복합니다. 들여쓰기로 반복할 코드 블록을 구분합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - for 변수 in 리스트: 형식
    - 요소를 하나씩 꺼내기
    - 모든 요소 처리할 때까지 반복
    - 들여쓰기로 블록 구분
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 순회

    리스트의 모든 요소를 순회합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    numbers = [1, 2, 3, 4, 5]
    total = 0
    for num in numbers:
    total = total + num
    total
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        numbers = [1, 2, 3, 4, 5]
        total = 0
        for num in numbers:
            total = total + num
        return total
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 문자열

    문자열 리스트를 순회합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fruits = ['apple', 'banana', 'cherry']
    joined = ''
    for fruit in fruits:
    joined = joined + fruit + ' '
    joined
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        fruits = ['apple', 'banana', 'cherry']
        joined = ''
        for fruit in fruits:
            joined = joined + fruit + ' '
        return joined
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건과 반복

    반복문 안에서 조건문을 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    values = [10, 25, 30, 15, 40]
    count = 0
    for val in values:
    if val >= 20:
    count = count + 1
    count
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        values = [10, 25, 30, 15, 40]
        count = 0
        for val in values:
            if val >= 20:
                count = count + 1
        return count
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 변수명은 의미있게 짓세요. for item in items보다 for fruit in fruits가 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## for 문자열 순회

    *문자열의 각 문자 처리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    for문은 문자열의 각 문자를 하나씩 꺼낼 수 있습니다. 문자열도 시퀀스이므로 리스트처럼 순회할 수 있습니다. 각 문자에 대해 반복 작업을 수행합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 문자열도 순회 가능
    - 각 문자를 하나씩 처리
    - 공백과 특수문자 포함
    - 리스트와 동일한 방식
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자 세기

    특정 문자의 개수를 셉니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    msg = 'hello world'
    found = 0
    for char in msg:
    if char == 'o':
    found = found + 1
    found
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        msg = 'hello world'
        found = 0
        for char in msg:
            if char == 'o':
                found = found + 1
        return found
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 대문자 변환

    각 문자를 대문자로 변환하여 결합합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = 'python'
    upper = ''
    for ch in text:
    upper = upper + ch.upper()
    upper
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        text = 'python'
        upper = ''
        for ch in text:
            upper = upper + ch.upper()
        return upper
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 모음 세기

    문자열에서 모음의 개수를 셉니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sentence = 'hello python'
    vowels = 'aeiou'
    vowelCnt = 0
    for letter in sentence:
    if letter in vowels:
    vowelCnt = vowelCnt + 1
    vowelCnt
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        sentence = 'hello python'
        vowels = 'aeiou'
        vowelCnt = 0
        for letter in sentence:
            if letter in vowels:
                vowelCnt = vowelCnt + 1
        return vowelCnt
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 문자열은 변경 불가능하므로 새 문자열을 만들어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## for 딕셔너리 순회

    *키, 값, 아이템 순회*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리는 keys(), values(), items()로 순회할 수 있습니다. 기본적으로 for문은 키를 순회하며, items()를 사용하면 키-값 쌍을 튜플로 받을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 기본: 키만 순회
    - keys(): 키 순회
    - values(): 값 순회
    - items(): 키-값 쌍 순회
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 순회

    딕셔너리의 키를 순회합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    grades = {'math': 85, 'english': 90, 'science': 88}
    subjects = ''
    for subject in grades:
    subjects = subjects + subject + ' '
    subjects
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        grades = {'math': 85, 'english': 90, 'science': 88}
        subjects = ''
        for subject in grades:
            subjects = subjects + subject + ' '
        return subjects
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 순회

    딕셔너리의 값을 순회합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    marks = {'alice': 85, 'bob': 90, 'charlie': 88}
    gradeSum = 0
    for mark in marks.values():
    gradeSum = gradeSum + mark
    gradeSum
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        marks = {'alice': 85, 'bob': 90, 'charlie': 88}
        gradeSum = 0
        for mark in marks.values():
            gradeSum = gradeSum + mark
        return gradeSum
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키-값 순회

    items()로 키와 값을 함께 순회합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    prices = {'apple': 1000, 'banana': 1500, 'cherry': 2000}
    expensive = ''
    for item, price in prices.items():
    if price >= 1500:
    expensive = expensive + item + ' '
    expensive
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        prices = {'apple': 1000, 'banana': 1500, 'cherry': 2000}
        expensive = ''
        for item, price in prices.items():
            if price >= 1500:
                expensive = expensive + item + ' '
        return expensive
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > items()를 사용하면 키와 값을 동시에 받을 수 있어 편리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## range() 함수

    *숫자 시퀀스 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    range() 함수는 숫자 시퀀스를 생성합니다. range(끝), range(시작, 끝), range(시작, 끝, 간격) 형식으로 사용하며, list()로 변환하면 리스트로 볼 수 있습니다. 끝 값은 포함되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - range(끝): 0부터 끝-1까지
    - range(시작, 끝): 시작부터 끝-1까지
    - range(시작, 끝, 간격): 간격만큼
    - 끝 값은 미포함
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### range(끝)

    0부터 시작하는 범위를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    list(range(5))
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        return list(range(5))
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### range(시작, 끝)

    시작과 끝을 지정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    list(range(3, 8))
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        return list(range(3, 8))
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### range(시작, 끝, 간격)

    간격을 지정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    list(range(0, 10, 2))
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        return list(range(0, 10, 2))
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > range()는 메모리 효율적입니다. 필요할 때만 값을 생성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## range()와 for

    *정해진 횟수만큼 반복*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    range()와 for를 함께 사용하면 정해진 횟수만큼 반복할 수 있습니다. 인덱스를 이용한 순회나 n번 반복하는 작업에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - for i in range(n): n번 반복
    - 인덱스로 리스트 접근
    - 정해진 횟수 반복
    - 카운터 활용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### n번 반복

    5번 반복하여 합계를 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    rangeSum = 0
    for i in range(1, 6):
    rangeSum = rangeSum + i
    rangeSum
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        rangeSum = 0
        for i in range(1, 6):
            rangeSum = rangeSum + i
        return rangeSum
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 인덱스로 접근

    인덱스를 사용하여 리스트 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    letters = ['a', 'b', 'c', 'd']
    concat = ''
    for idx in range(len(letters)):
    concat = concat + letters[idx]
    concat
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        letters = ['a', 'b', 'c', 'd']
        concat = ''
        for idx in range(len(letters)):
            concat = concat + letters[idx]
        return concat
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 구구단

    range로 구구단을 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    dan = 3
    answer = 0
    for i in range(1, 10):
    answer = dan * i
    answer
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        dan = 3
        answer = 0
        for i in range(1, 10):
            answer = dan * i
        return answer
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트 순회시 인덱스가 필요없다면 for item in items를 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## while 기본

    *조건이 참인 동안 반복*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    while문은 조건이 True인 동안 계속 반복합니다. while 조건: 형식으로 쓰며, 조건이 False가 되면 반복을 멈춥니다. 무한 루프에 주의해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - while 조건: 형식
    - 조건이 True면 계속 반복
    - 조건이 False면 종료
    - 무한 루프 주의
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while 카운터

    카운터를 증가시키며 반복합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    idx = 0
    acc = 0
    while idx < 5:
    acc = acc + idx
    idx = idx + 1
    acc
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        idx = 0
        acc = 0
        while idx < 5:
            acc = acc + idx
            idx = idx + 1
        return acc
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while 조건

    특정 조건을 만족할 때까지 반복합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    n = 1
    while n < 100:
    n = n * 2
    n
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        n = 1
        while n < 100:
            n = n * 2
        return n
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while 누적

    조건을 만족하는 동안 값을 누적합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    accumulated = 0
    i = 1
    while i <= 10:
    if i % 2 == 0:
    accumulated = accumulated + i
    i = i + 1
    accumulated
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        accumulated = 0
        i = 1
        while i <= 10:
            if i % 2 == 0:
                accumulated = accumulated + i
            i = i + 1
        return accumulated
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > while문에서는 조건을 변경하는 코드를 반드시 포함해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## break 문

    *반복문 즉시 종료*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    break는 반복문을 즉시 종료합니다. 조건을 만족하면 더 이상 반복하지 않고 빠져나올 때 사용합니다. for와 while 모두에서 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 반복문 즉시 종료
    - 조건 만족시 탈출
    - for, while 모두 사용 가능
    - 가장 안쪽 반복문만 종료
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### for break

    조건을 만족하면 반복을 중단합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    seq = [1, 2, 3, 4, 5, 6, 7, 8]
    hit = 0
    for x in seq:
    if x > 5:
    hit = x
    break
    hit
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0068():
        seq = [1, 2, 3, 4, 5, 6, 7, 8]
        hit = 0
        for x in seq:
            if x > 5:
                hit = x
                break
        return hit
    _snippet_0068()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while break

    while문에서 break를 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    current = 1
    while True:
    current = current * 2
    if current > 100:
    break
    current
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0070():
        current = 1
        while True:
            current = current * 2
            if current > 100:
                break
        return current
    _snippet_0070()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 검색 중단

    원하는 값을 찾으면 즉시 중단합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    data = ['apple', 'banana', 'cherry', 'date']
    key = 'cherry'
    loc = -1
    for i in range(len(data)):
    if data[i] == key:
    loc = i
    break
    loc
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0072():
        data = ['apple', 'banana', 'cherry', 'date']
        key = 'cherry'
        loc = -1
        for i in range(len(data)):
            if data[i] == key:
                loc = i
                break
        return loc
    _snippet_0072()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > break는 가장 가까운 반복문 하나만 종료합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## continue 문

    *현재 반복 건너뛰기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    continue는 현재 반복을 건너뛰고 다음 반복으로 넘어갑니다. 특정 조건에서 처리를 생략하고 싶을 때 사용합니다. 반복문 자체는 종료되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 현재 반복만 건너뛰기
    - 다음 반복으로 이동
    - 반복문은 계속 진행
    - 조건부 처리 생략
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### continue 기본

    짝수만 건너뛰고 홀수만 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    odd = 0
    for n in range(1, 11):
    if n % 2 == 0:
    continue
    odd = odd + n
    odd
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0078():
        odd = 0
        for n in range(1, 11):
            if n % 2 == 0:
                continue
            odd = odd + n
        return odd
    _snippet_0078()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 특정 값 제외

    특정 값을 제외하고 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    vals = [10, 0, 20, 0, 30, 40]
    nonZero = 0
    for v in vals:
    if v == 0:
    continue
    nonZero = nonZero + v
    nonZero
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0080():
        vals = [10, 0, 20, 0, 30, 40]
        nonZero = 0
        for v in vals:
            if v == 0:
                continue
            nonZero = nonZero + v
        return nonZero
    _snippet_0080()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 문자열

    조건을 만족하는 것만 결합합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    terms = ['apple', 'a', 'banana', 'at', 'cherry']
    long = ''
    for term in terms:
    if len(term) <= 2:
    continue
    long = long + term + ' '
    long
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0082():
        terms = ['apple', 'a', 'banana', 'at', 'cherry']
        long = ''
        for term in terms:
            if len(term) <= 2:
                continue
            long = long + term + ' '
        return long
    _snippet_0082()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > continue는 if-else 구조를 단순화할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## for-else 절

    *정상 종료시 실행*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    for문은 else 절을 가질 수 있습니다. 반복이 break 없이 정상적으로 완료되면 else 블록이 실행됩니다. break로 중단되면 else는 실행되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 정상 종료시 else 실행
    - break시 else 건너뜀
    - 완료 여부 판별
    - 검색 성공/실패 처리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### for-else 정상

    break 없이 정상 종료되면 else가 실행됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    arr1 = [1, 2, 3, 4, 5]
    for a in arr1:
    if a > 10:
    flag = 'found big'
    break
    else:
    flag = 'all small'
    flag
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0088():
        arr1 = [1, 2, 3, 4, 5]
        for a in arr1:
            if a > 10:
                flag = 'found big'
                break
        else:
            flag = 'all small'
        return flag
    _snippet_0088()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### for-else break

    break로 중단되면 else가 실행되지 않습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    arr2 = [1, 2, 15, 4, 5]
    for b in arr2:
    if b > 10:
    msg = 'found'
    break
    else:
    msg = 'not found'
    msg
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0090():
        arr2 = [1, 2, 15, 4, 5]
        for b in arr2:
            if b > 10:
                msg = 'found'
                break
        else:
            msg = 'not found'
        return msg
    _snippet_0090()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 검색 완료

    검색 성공 여부를 판별합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    users = ['alice', 'bob', 'charlie']
    name = 'david'
    for user in users:
    if user == name:
    status = 'exists'
    break
    else:
    status = 'not exists'
    status
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0092():
        users = ['alice', 'bob', 'charlie']
        name = 'david'
        for user in users:
            if user == name:
                status = 'exists'
                break
        else:
            status = 'not exists'
        return status
    _snippet_0092()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > for-else는 검색 작업에서 찾았는지 여부를 판별할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## while-else 절

    *조건 거짓시 실행*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    while문도 else 절을 가질 수 있습니다. 조건이 False가 되어 정상 종료되면 else가 실행됩니다. break로 중단되면 else는 실행되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 조건 거짓시 else 실행
    - break시 else 건너뜀
    - 정상 종료 여부 판별
    - for-else와 동일한 원리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while-else 정상

    조건이 거짓이 되면 else가 실행됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    counter = 0
    while counter < 3:
    counter = counter + 1
    else:
    completion = 'done'
    completion
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0098():
        counter = 0
        while counter < 3:
            counter = counter + 1
        else:
            completion = 'done'
        return completion
    _snippet_0098()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while-else break

    break로 중단되면 else가 실행되지 않습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    x = 0
    while x < 10:
    x = x + 1
    if x == 5:
    outcome = 'stopped'
    break
    else:
    outcome = 'completed'
    outcome
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0100():
        x = 0
        while x < 10:
            x = x + 1
            if x == 5:
                outcome = 'stopped'
                break
        else:
            outcome = 'completed'
        return outcome
    _snippet_0100()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 한도 초과 검사

    한도를 초과하면 중단합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    amount = 0
    limit = 100
    while amount < 50:
    amount = amount + 15
    if amount > limit:
    check = 'over limit'
    break
    else:
    check = 'within limit'
    check
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0102():
        amount = 0
        limit = 100
        while amount < 50:
            amount = amount + 15
            if amount > limit:
                check = 'over limit'
                break
        else:
            check = 'within limit'
        return check
    _snippet_0102()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > while-else는 제한 조건 검사에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중첩 반복문

    *반복문 안의 반복문*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    반복문 안에 다시 반복문을 넣을 수 있습니다. 이를 중첩 반복문이라고 하며, 2차원 구조나 모든 조합을 처리할 때 사용합니다. 들여쓰기 단계가 늘어납니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 반복문 안에 반복문
    - 2차원 구조 처리
    - 모든 조합 생성
    - 들여쓰기 단계 증가
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중첩 for

    두 리스트의 모든 조합을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    colors = ['red', 'blue']
    sizes = ['S', 'M']
    combinations = ''
    for color in colors:
    for size in sizes:
    combinations = combinations + color + '-' + size + ' '
    combinations
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0108():
        colors = ['red', 'blue']
        sizes = ['S', 'M']
        combinations = ''
        for color in colors:
            for size in sizes:
                combinations = combinations + color + '-' + size + ' '
        return combinations
    _snippet_0108()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 구구단 전체

    구구단 전체를 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    mult = 0
    for x in range(2, 4):
    for y in range(1, 4):
    mult = x * y
    mult
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0110():
        mult = 0
        for x in range(2, 4):
            for y in range(1, 4):
                mult = x * y
        return mult
    _snippet_0110()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 좌표 생성

    격자 좌표를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    coords = ''
    for r in range(2):
    for c in range(3):
    coords = coords + str(r) + ',' + str(c) + ' '
    coords
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0112():
        coords = ''
        for r in range(2):
            for c in range(3):
                coords = coords + str(r) + ',' + str(c) + ' '
        return coords
    _snippet_0112()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중첩이 깊어지면 성능에 영향을 줄 수 있으니 주의하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 14 종합 복습

    *반복문 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 14에서 배운 반복문을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: for 리스트

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본2: range()

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본3: while

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본4: break

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본5: continue

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용1: 딕셔너리 순회

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용2: 문자열 필터

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용3: 조건부 누적

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용4: for-else 검색

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용5: 중첩 반복

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화1-1: 최대값 찾기

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화1-2: 최소값과 최대값

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화2-1: 평균 계산

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화2-2: 평균 이상 개수

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화3-1: 소수 판별

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화3-2: 소수 목록

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화4-1: 문자열 역순

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화4-2: 단어 역순

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화5-1: 패턴 생성

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화5-2: 곱셈표

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ## 완료 기준

    - for와 while을 언제 쓰는지 구분할 수 있다.
    - range()로 반복 횟수를 만들 수 있다.
    - break와 continue의 차이를 예로 설명할 수 있다.

    ## 흔한 막힘

    - 반복문 안 들여쓰기를 빼먹음
    - while 조건을 바꾸지 않아 끝나지 않음
    - range()의 끝 값이 포함된다고 생각함

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
