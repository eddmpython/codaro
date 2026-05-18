import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 21. 중간 종합 복습")


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
    # Day 21. 중간 종합 복습

    이 노트북은 `curricula/python/30days/day21_중간종합복습.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    Day 1-20의 문법을 작은 문제로 다시 꺼내 쓰며 빈틈을 찾습니다.

    ## 왜 중요한가

    복습은 읽은 내용을 기억으로 착각하지 않게 해줍니다. 직접 다시 쓰는 과정에서 실제 실력이 드러납니다.

    ## 생각 모델

    지식 점검은 새 문법 추가가 아니라 기억에서 꺼내는 훈련입니다.

    ## 오늘 배우는 것

    - Day 1~20 핵심 개념 복습
    - 자료구조와 제어문 통합
    - 함수와 모듈 실전 활용
    - 종합 실전 문제

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

    - 오늘 새로 배우는 개념: 복습
    - 이미 써도 되는 개념: 이전 Day 전체
    - 오늘은 일부러 쓰지 않는 개념: 클래스

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 먼저 설명을 보지 않고 기억나는 문법을 목록으로 적습니다.
    - 실행 중: 막힌 문제는 답을 보기 전에 더 작은 입력으로 줄여 실행합니다.
    - 연습 초점: 문자열, 리스트, 딕셔너리, 조건문, 반복문, 함수를 섞어 작은 프로그램을 만듭니다.
    - 막히면: 어디서 막혔는지 문법 이름이 아니라 코드 줄 번호로 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 자료구조 복습

    *문자열, 리스트, 튜플, 집합, 딕셔너리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파이썬의 5가지 핵심 자료구조를 복습합니다. 문자열(str), 리스트(list), 튜플(tuple), 집합(set), 딕셔너리(dict)의 특징과 메서드를 다시 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 문자열: 불변, 인덱싱, 슬라이싱, 메서드
    - 리스트: 가변, 순서, 중복 허용
    - 튜플: 불변, 순서, 중복 허용
    - 집합: 가변, 순서 없음, 중복 불가
    - 딕셔너리: 가변, key-value 쌍
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 활용

    문자열 메서드와 슬라이싱을 활용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    phrase = "Python Programming"
    phrase.lower().replace('p', 'J')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        phrase = "Python Programming"
        return phrase.lower().replace('p', 'J')
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 활용

    리스트 메서드를 연속으로 활용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    nums = [5, 2, 8, 1, 9]
    nums.sort()
    nums.reverse()
    nums
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        nums = [5, 2, 8, 1, 9]
        nums.sort()
        nums.reverse()
        return nums
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 집합 연산

    집합의 교집합과 합집합을 구합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    teamA = {'Alice', 'Bob', 'Charlie'}
    teamB = {'Bob', 'David', 'Eve'}
    teamA & teamB
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        teamA = {'Alice', 'Bob', 'Charlie'}
        teamB = {'Bob', 'David', 'Eve'}
        return teamA & teamB
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리 활용

    딕셔너리 메서드를 활용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    info = {'name': 'Alice', 'age': 25}
    info.get('city', 'Unknown')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0014():
        info = {'name': 'Alice', 'age': 25}
        return info.get('city', 'Unknown')
    _snippet_0014()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 제어문 복습

    *조건문과 반복문*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    조건문(if, elif, else)과 반복문(for, while)을 복습합니다. break, continue, else절을 활용하여 프로그램의 흐름을 제어할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - if, elif, else: 조건 분기
    - for: 시퀀스 순회
    - while: 조건 반복
    - break, continue: 흐름 제어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건문 활용

    점수에 따라 등급을 판정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    score = 85
    'A' if score >= 90 else 'B' if score >= 80 else 'C'
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        score = 85
        return 'A' if score >= 90 else 'B' if score >= 80 else 'C'
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### for 반복문

    리스트의 합계를 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    values = [10, 20, 30, 40, 50]
    valSum = 0
    for val in values:
    valSum = valSum + val
    valSum
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        values = [10, 20, 30, 40, 50]
        valSum = 0
        for val in values:
            valSum = valSum + val
        return valSum
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### while 반복문

    카운트다운을 구현합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    countdown = 5
    countList = []
    while countdown > 0:
    countList.append(countdown)
    countdown = countdown - 1
    countList
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0023():
        countdown = 5
        countList = []
        while countdown > 0:
            countList.append(countdown)
            countdown = countdown - 1
        return countList
    _snippet_0023()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### break 활용

    특정 값을 찾으면 반복을 중단합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    nums = [1, 3, 5, 7, 9, 2, 4]
    firstEven = None
    for n in nums:
    if n % 2 == 0:
    firstEven = n
    break
    firstEven
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0025():
        nums = [1, 3, 5, 7, 9, 2, 4]
        firstEven = None
        for n in nums:
            if n % 2 == 0:
                firstEven = n
                break
        return firstEven
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 함수 복습

    *def, return, 매개변수, 인자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수의 정의(def), 반환(return), 매개변수와 인자를 복습합니다. 기본 매개변수, 키워드 인자, *args, **kwargs, lambda까지 다양한 함수 기법을 활용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - def: 함수 정의
    - return: 값 반환
    - 매개변수: 기본값, *args, **kwargs
    - lambda: 익명 함수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 함수

    두 수를 곱하는 함수를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def multiply(a, b):
    return a * b

    multiply(7, 8)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        def multiply(a, b):
            return a * b

        return multiply(7, 8)
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 매개변수

    기본값을 가진 함수를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def greet(name, greeting='Hello'):
    return greeting + ', ' + name

    greet('Bob')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        def greet(name, greeting='Hello'):
            return greeting + ', ' + name

        return greet('Bob')
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### *args 활용

    가변 인자를 받아 합계를 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def sumAll(*args):
    acc = 0
    for num in args:
    acc = acc + num
    return acc

    sumAll(1, 2, 3, 4, 5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0034():
        def sumAll(*args):
            acc = 0
            for num in args:
                acc = acc + num
            return acc

        return sumAll(1, 2, 3, 4, 5)
    _snippet_0034()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### lambda 활용

    lambda로 간단한 함수를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    square = lambda x: x ** 2
    square(9)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0036():
        square = lambda x: x ** 2
        return square(9)
    _snippet_0036()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 모듈과 파일 복습

    *import, 파일 입출력*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    모듈 가져오기(import, from, as)와 파일 입출력(open, read, write, with)을 복습합니다. math, random, datetime 같은 표준 모듈을 활용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - import: 모듈 가져오기
    - from, as: 선택적 가져오기
    - open, with: 파일 다루기
    - 표준 모듈 활용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### math 모듈

    제곱근과 원주율을 활용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import sqrt, pi

    radius = 4
    area = pi * radius ** 2
    area
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        from math import sqrt, pi

        radius = 4
        area = pi * radius ** 2
        return area
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### random 모듈

    랜덤 정수를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from random import randint

    dice = randint(1, 6)
    dice
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0043():
        from random import randint

        dice = randint(1, 6)
        return dice
    _snippet_0043()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### datetime 모듈

    날짜를 생성하고 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from datetime import date, timedelta

    today = date(2024, 1, 1)
    nextWeek = today + timedelta(days=7)
    nextWeek.day
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0045():
        from datetime import date, timedelta

        today = date(2024, 1, 1)
        nextWeek = today + timedelta(days=7)
        return nextWeek.day
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 예외 처리 복습

    *try, except, finally, raise*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    예외 처리를 통해 오류를 안전하게 처리하는 방법을 복습합니다. try, except, finally, raise를 활용하여 안정적인 프로그램을 작성할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - try-except: 예외 포착
    - finally: 정리 작업
    - raise: 예외 발생
    - 예외 타입: ValueError, KeyError 등
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 예외 처리

    0으로 나누는 오류를 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def safeDivide(a, b):
    try:
    return a / b
    except ZeroDivisionError:
    return 'Cannot divide by zero'

    safeDivide(10, 0)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        def safeDivide(a, b):
            try:
                return a / b
            except ZeroDivisionError:
                return 'Cannot divide by zero'

        return safeDivide(10, 0)
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 예외 처리

    여러 종류의 예외를 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getItem(data, key):
    try:
    return data[key]
    except KeyError:
    return 'Key not found'
    except TypeError:
    return 'Invalid type'

    getItem({'name': 'Alice'}, 'age')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        def getItem(data, key):
            try:
                return data[key]
            except KeyError:
                return 'Key not found'
            except TypeError:
                return 'Invalid type'

        return getItem({'name': 'Alice'}, 'age')
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 통합 실전 문제

    *여러 개념을 종합적으로 활용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    여러 개념을 함께 활용하는 실전 문제들입니다. 자료구조, 제어문, 함수, 모듈을 통합적으로 사용하여 문제를 해결합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 단어 빈도수 계산

    문자열에서 단어 빈도수를 딕셔너리로 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sentence = "python is fun python is powerful"
    words = sentence.split()
    freq = {}
    for word in words:
    freq[word] = freq.get(word, 0) + 1
    freq
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        sentence = "python is fun python is powerful"
        words = sentence.split()
        freq = {}
        for word in words:
            freq[word] = freq.get(word, 0) + 1
        return freq
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 필터링

    조건에 맞는 요소만 필터링합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    allNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    evens = []
    for num in allNums:
    if num % 2 == 0:
    evens.append(num)
    evens
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        allNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        evens = []
        for num in allNums:
            if num % 2 == 0:
                evens.append(num)
        return evens
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중복 제거

    리스트에서 중복을 제거합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    rawData = [1, 2, 2, 3, 3, 3, 4, 4, 5]
    uniqueList = list(set(rawData))
    uniqueList.sort()
    uniqueList
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        rawData = [1, 2, 2, 3, 3, 3, 4, 4, 5]
        uniqueList = list(set(rawData))
        uniqueList.sort()
        return uniqueList
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최댓값 찾기

    함수로 리스트의 최댓값을 찾습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def findMax(numbers):
    if not numbers:
    return None
    maxVal = numbers[0]
    for num in numbers:
    if num > maxVal:
    maxVal = num
    return maxVal

    findMax([3, 7, 2, 9, 4])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        def findMax(numbers):
            if not numbers:
                return None
            maxVal = numbers[0]
            for num in numbers:
                if num > maxVal:
                    maxVal = num
            return maxVal

        return findMax([3, 7, 2, 9, 4])
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 여러 개념을 함께 사용하면 더 강력한 프로그램을 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 21 종합 복습

    *중간 점검 완전 정복*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 1~20까지 배운 모든 개념을 종합적으로 복습합니다. 🟢 기본 미션으로 핵심 개념을 확인하고, 🟡 응용 미션으로 활용 능력을 키우고, 🔴 심화 미션으로 통합 사고력을 키웁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 문자열 메서드

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
    ### 연습: 🟢 기본2: 리스트 메서드

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
    ### 연습: 🟢 기본3: 딕셔너리 get

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
    ### 연습: 🟢 기본4: for 반복

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
    ### 연습: 🟢 기본5: 함수 정의

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
    ### 연습: 🟡 응용1: 리스트 합계

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
    ### 연습: 🟡 응용2: 조건 필터링

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
    ### 연습: 🟡 응용3: 딕셔너리 업데이트

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
    ### 연습: 🟡 응용4: 집합 연산

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
    ### 연습: 🟡 응용5: 기본 매개변수

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
    ### 연습: 🔴 심화1-1: 최솟값 함수

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
    ### 연습: 🔴 심화1-2: 평균 계산 함수

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
    ### 연습: 🔴 심화2-1: 문자열 뒤집기

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
    ### 연습: 🔴 심화2-2: 팰린드롬 검사

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
    ### 연습: 🔴 심화3-1: 리스트 중복 제거

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
    ### 연습: 🔴 심화3-2: 두 리스트 병합

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
    ### 연습: 🔴 심화4-1: 딕셔너리 키 필터링

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
    ### 연습: 🔴 심화4-2: 딕셔너리 값 변환

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
    ### 연습: 🔴 심화5-1: 범위 내 숫자 필터링

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
    ### 연습: 🔴 심화5-2: 조건부 카운팅

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

    - 기초 문법을 섞은 문제를 설명 없이 다시 작성할 수 있다.
    - 가장 약한 개념 3개와 보강 방법을 적을 수 있다.
    - 함수로 문제를 작게 나누는 기준을 말할 수 있다.

    ## 흔한 막힘

    - 복습을 읽기만 하고 직접 쓰지 않음
    - 한 번에 큰 문제로 시작함
    - 오류 위치를 추측으로만 판단함

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
