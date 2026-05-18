import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 26. 컴프리헨션")


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
    # Day 26. 컴프리헨션

    이 노트북은 `study/python/30days/day26_컴프리헨션.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    리스트, 딕셔너리, 집합 컴프리헨션으로 반복과 조건을 짧게 표현합니다.

    ## 왜 중요한가

    컴프리헨션은 데이터 변환 코드를 간결하게 만들지만, 읽을 수 있을 때만 강력합니다.

    ## 생각 모델

    컴프리헨션은 반복문을 한 줄 안에 접은 형태입니다. 앞에는 만들 값, 뒤에는 반복과 조건이 옵니다.

    ## 오늘 배우는 것

    - 리스트 컴프리헨션으로 간결한 코드
    - 딕셔너리 컴프리헨션으로 변환
    - 집합 컴프리헨션으로 중복 제거
    - 중첩 컴프리헨션으로 다차원 처리

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

    - 오늘 새로 배우는 개념: 리스트 컴프리헨션, 딕셔너리 컴프리헨션, 집합 컴프리헨션, 중첩 컴프리헨션
    - 이미 써도 되는 개념: 기본 문법 전체, 반복문, 조건문
    - 오늘은 일부러 쓰지 않는 개념: 제너레이터 표현식, 외부 라이브러리

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 먼저 일반 for문으로 풀어쓴 모습을 떠올린 뒤 한 줄로 접습니다.
    - 실행 중: 조건이 있는 경우 필터링되는 값과 변환되는 값을 구분합니다.
    - 연습 초점: 숫자 목록 변환, 조건 필터링, 키-값 변환을 각각 컴프리헨션으로 작성합니다.
    - 막히면: 읽기 어려우면 즉시 일반 반복문으로 풀어 써서 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 컴프리헨션 기초

    *간결한 리스트 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트 컴프리헨션은 for 반복문을 한 줄로 압축하여 새로운 리스트를 만드는 방법입니다. [표현식 for 변수 in 시퀀스] 형태로 작성하며, 기존 반복문보다 간결하고 읽기 쉬운 코드를 만들 수 있습니다. 파이썬스러운 코드 작성의 핵심 기법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [표현식 for 변수 in 시퀀스] 형식
    - 한 줄로 리스트 생성
    - 반복문보다 간결
    - 파이썬스러운 코드
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 컴프리헨션

    리스트의 각 요소를 제곱합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    nums = [1, 2, 3, 4, 5]
    squared = [x ** 2 for x in nums]
    squared
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        nums = [1, 2, 3, 4, 5]
        squared = [x ** 2 for x in nums]
        return squared
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 변환

    문자열 리스트를 모두 대문자로 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    words = ['hello', 'world', 'python']
    upper = [w.upper() for w in words]
    upper
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        words = ['hello', 'world', 'python']
        upper = [w.upper() for w in words]
        return upper
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산 결과

    범위의 각 수에 10을 곱합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    multiplied = [n * 10 for n in range(5)]
    multiplied
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        multiplied = [n * 10 for n in range(5)]
        return multiplied
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트 컴프리헨션은 간결하지만, 너무 복잡하면 가독성이 떨어지니 적절히 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 조건부 컴프리헨션

    *필터링과 조건문*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트 컴프리헨션에 if 조건을 추가하여 특정 요소만 선택할 수 있습니다. [표현식 for 변수 in 시퀀스 if 조건] 형태로 작성하며, 조건을 만족하는 요소만 결과에 포함됩니다. 필터링과 변환을 동시에 수행할 수 있어 매우 강력합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [표현식 for 변수 in 시퀀스 if 조건]
    - 조건 만족 요소만 포함
    - 필터링과 변환 동시 수행
    - 깔끔한 데이터 처리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 짝수 필터링

    짝수만 선택하여 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    range10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    evens = [n for n in range10 if n % 2 == 0]
    evens
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        range10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        evens = [n for n in range10 if n % 2 == 0]
        return evens
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 길이 조건

    특정 길이 이상인 문자열만 선택합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    texts = ['a', 'ab', 'abc', 'abcd']
    long = [t for t in texts if len(t) >= 3]
    long
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        texts = ['a', 'ab', 'abc', 'abcd']
        long = [t for t in texts if len(t) >= 3]
        return long
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 필터링과 변환

    양수만 선택하여 제곱합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    values = [-2, -1, 0, 1, 2, 3]
    positiveSquares = [v ** 2 for v in values if v > 0]
    positiveSquares
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        values = [-2, -1, 0, 1, 2, 3]
        positiveSquares = [v ** 2 for v in values if v > 0]
        return positiveSquares
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > if-else를 사용하려면 [표현식1 if 조건 else 표현식2 for 변수 in 시퀀스] 형태로 작성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 고급 리스트 컴프리헨션

    *복잡한 표현식과 다중 조건*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트 컴프리헨션은 복잡한 표현식, if-else 구문, 다중 조건을 모두 지원합니다. 삼항 연산자를 활용하거나 여러 조건을 and/or로 연결할 수 있습니다. 다만 너무 복잡해지면 일반 반복문이 더 읽기 쉬울 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - if-else 삼항 연산자
    - 다중 조건 결합
    - 복잡한 표현식
    - 가독성 고려 필수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### if-else 사용

    홀수는 그대로, 짝수는 2배로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    data = [1, 2, 3, 4, 5]
    result = [x if x % 2 == 1 else x * 2 for x in data]
    result
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        data = [1, 2, 3, 4, 5]
        result = [x if x % 2 == 1 else x * 2 for x in data]
        return result
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다중 조건

    여러 조건을 만족하는 요소만 선택합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    scores = [45, 55, 65, 75, 85, 95]
    passing = [s for s in scores if s >= 60 and s < 80]
    passing
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        scores = [45, 55, 65, 75, 85, 95]
        passing = [s for s in scores if s >= 60 and s < 80]
        return passing
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 메서드 체이닝

    여러 메서드를 연결하여 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    items = ['  Hello  ', '  World  ', '  Python  ']
    cleaned = [item.strip().lower() for item in items]
    cleaned
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        items = ['  Hello  ', '  World  ', '  Python  ']
        cleaned = [item.strip().lower() for item in items]
        return cleaned
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 한 줄이 너무 길어지면 괄호 안에서 여러 줄로 나눌 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 딕셔너리 컴프리헨션

    *딕셔너리 생성과 변환*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리 컴프리헨션은 리스트 컴프리헨션과 비슷하지만 중괄호를 사용하고 key: value 쌍을 생성합니다. {key: value for 변수 in 시퀀스} 형태로 작성하며, 기존 데이터를 딕셔너리로 변환하거나 딕셔너리를 필터링할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - {key: value for 변수 in 시퀀스}
    - key-value 쌍 생성
    - 딕셔너리 변환과 필터링
    - 간결한 매핑 생성
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 딕셔너리 생성

    숫자와 그 제곱을 매핑합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    squares = {n: n ** 2 for n in range(5)}
    squares
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        squares = {n: n ** 2 for n in range(5)}
        return squares
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트를 딕셔너리로

    문자열 리스트를 길이와 매핑합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    terms = ['cat', 'dog', 'elephant']
    lengths = {w: len(w) for w in terms}
    lengths
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        terms = ['cat', 'dog', 'elephant']
        lengths = {w: len(w) for w in terms}
        return lengths
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리 필터링

    조건을 만족하는 항목만 선택합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    prices = {'apple': 100, 'banana': 50, 'cherry': 200}
    expensive = {k: v for k, v in prices.items() if v >= 100}
    expensive
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        prices = {'apple': 100, 'banana': 50, 'cherry': 200}
        expensive = {k: v for k, v in prices.items() if v >= 100}
        return expensive
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 딕셔너리 컴프리헨션으로 두 리스트를 zip과 함께 사용하면 매핑을 쉽게 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 집합 컴프리헨션

    *중복 없는 집합 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    집합 컴프리헨션은 중괄호를 사용하지만 key: value가 아닌 단일 값만 생성합니다. {표현식 for 변수 in 시퀀스} 형태로 작성하며, 자동으로 중복이 제거된 집합을 만듭니다. 유일한 값만 필요할 때 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - {표현식 for 변수 in 시퀀스}
    - 중복 자동 제거
    - 순서 없는 집합
    - 유일한 값 추출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중복 제거

    리스트에서 중복을 제거한 집합을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    digits = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    unique = {n for n in digits}
    unique
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        digits = [1, 2, 2, 3, 3, 3, 4, 4, 5]
        unique = {n for n in digits}
        return unique
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 후 중복 제거

    문자열 길이를 집합으로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    strings = ['a', 'ab', 'abc', 'ab', 'a']
    uniqueLengths = {len(w) for w in strings}
    uniqueLengths
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        strings = ['a', 'ab', 'abc', 'ab', 'a']
        uniqueLengths = {len(w) for w in strings}
        return uniqueLengths
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 집합

    조건을 만족하는 유일한 값만 선택합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    amounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    evenSet = {v for v in amounts if v % 2 == 0}
    evenSet
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        amounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        evenSet = {v for v in amounts if v % 2 == 0}
        return evenSet
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 집합 컴프리헨션과 딕셔너리 컴프리헨션은 중괄호로 구분이 어려우니 : 유무로 판단하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중첩 컴프리헨션

    *다차원 데이터 처리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    중첩 컴프리헨션은 여러 개의 for 문을 하나의 컴프리헨션에 작성하는 것입니다. 2차원 리스트를 평탄화하거나, 중첩 반복문을 간결하게 표현할 때 사용합니다. 다만 너무 복잡하면 가독성이 떨어지므로 2중 정도까지만 사용하는 것이 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 여러 for 문 연결
    - 2차원 데이터 처리
    - 평탄화와 조합
    - 가독성 주의 필요
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 2차원 리스트 평탄화

    중첩 리스트를 1차원으로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    flat = [num for row in matrix for num in row]
    flat
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        flat = [num for row in matrix for num in row]
        return flat
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 좌표 생성

    두 범위의 모든 조합을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    coords = [(x, y) for x in range(3) for y in range(3)]
    coords
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        coords = [(x, y) for x in range(3) for y in range(3)]
        return coords
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 중첩

    중첩 컴프리헨션에 조건을 추가합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    pairs = [(a, b) for a in range(1, 5) for b in range(1, 5) if a < b]
    pairs
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        pairs = [(a, b) for a in range(1, 5) for b in range(1, 5) if a < b]
        return pairs
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중첩 컴프리헨션의 for 순서는 일반 중첩 반복문과 같습니다. 왼쪽이 바깥쪽 반복문입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 컴프리헨션 실전

    *실용적인 활용 패턴*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    컴프리헨션은 데이터 변환, 필터링, 집계 등 다양한 실무 작업을 간결하게 처리할 수 있습니다. 리스트 처리, 딕셔너리 변환, 데이터 정제 등에서 자주 사용되는 패턴을 익히면 효율적인 코드를 작성할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 데이터 변환과 정제
    - 필터링과 매핑
    - 중복 제거와 집계
    - 실무 패턴 활용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 데이터 정제

    공백을 제거하고 소문자로 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ']
    trimmed = [d.strip().lower() for d in rawData]
    trimmed
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0068():
        rawData = ['  Apple  ', '  BANANA  ', '  Cherry  ']
        trimmed = [d.strip().lower() for d in rawData]
        return trimmed
    _snippet_0068()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 점수 등급 변환

    점수를 등급으로 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    marks = [95, 87, 72, 65, 58]
    grades = ['A' if s >= 90 else 'B' if s >= 80 else 'C' if s >= 70 else 'D' if s >= 60 else 'F' for s in marks]
    grades
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0070():
        marks = [95, 87, 72, 65, 58]
        grades = ['A' if s >= 90 else 'B' if s >= 80 else 'C' if s >= 70 else 'D' if s >= 60 else 'F' for s in marks]
        return grades
    _snippet_0070()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키워드 추출

    특정 접두사로 시작하는 단어만 추출합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    tags = ['python', 'javascript', 'java', 'ruby', 'rust']
    jTags = [t for t in tags if t.startswith('j')]
    jTags
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0072():
        tags = ['python', 'javascript', 'java', 'ruby', 'rust']
        jTags = [t for t in tags if t.startswith('j')]
        return jTags
    _snippet_0072()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 컴프리헨션은 강력하지만, 복잡한 로직은 일반 반복문이 더 명확할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 26 종합 복습

    *컴프리헨션 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 26에서 배운 컴프리헨션을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 리스트 변환

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
    ### 연습: 🟢 기본2: 문자열 변환

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
    ### 연습: 🟢 기본3: 범위 리스트

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
    ### 연습: 🟢 기본4: 딕셔너리 생성

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
    ### 연습: 🟢 기본5: 집합 중복 제거

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
    ### 연습: 🟡 응용1: 조건부 필터링

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
    ### 연습: 🟡 응용2: if-else 변환

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
    ### 연습: 🟡 응용3: 딕셔너리 필터링

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
    ### 연습: 🟡 응용4: 문자열 길이 매핑

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
    ### 연습: 🟡 응용5: 중첩 평탄화

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
    ### 연습: 🔴 심화1: 복합 조건 필터링

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
    ### 연습: 🔴 심화2: 다중 변환

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
    ### 연습: 🔴 심화3: 딕셔너리 값 변환

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
    ### 연습: 🔴 심화4: 조건부 딕셔너리

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
    ### 연습: 🔴 심화5: 좌표 조합

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
    ### 연습: 🔴 심화6: 단어 필터링

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
    ### 연습: 🔴 심화7: 중첩 변환

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
    ### 연습: 🔴 심화8: 집합 조건부

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
    ### 연습: 🔴 심화9: 키-값 교환

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
    ### 연습: 🔴 심화10: 복합 평탄화

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

    - 리스트 컴프리헨션을 일반 for문으로 풀어 설명할 수 있다.
    - 조건이 있는 컴프리헨션을 사용할 수 있다.
    - 딕셔너리와 집합 컴프리헨션의 결과 모양을 구분할 수 있다.

    ## 흔한 막힘

    - 만들 값과 반복 대상을 거꾸로 씀
    - 조건 위치를 헷갈림
    - 중첩 컴프리헨션을 지나치게 복잡하게 만듦

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
