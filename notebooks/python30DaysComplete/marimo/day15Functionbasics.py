import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 15. 함수기초")


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
    # Day 15. 함수기초

    이 노트북은 `study/python/30days/day15_함수기초.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - def로 함수 정의
    - return으로 값 반환
    - 매개변수로 값 전달
    - 함수로 코드 재사용

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

    - 오늘 새로 배우는 개념: def 함수 정의, return, 매개변수, 인자, 문서 문자열
    - 이미 써도 되는 개념: 지금까지 배운 자료형, 조건문, 반복문
    - 오늘은 일부러 쓰지 않는 개념: 고급 함수 문법, import, 클래스

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 함수 정의

    *def로 함수 만들기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수는 특정 작업을 수행하는 코드 블록입니다. def 함수명(): 형식으로 정의하며, 들여쓰기로 함수 본문을 작성합니다. 함수를 정의한 후 함수명()으로 호출하여 실행합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - def 함수명(): 형식
    - 들여쓰기로 본문 작성
    - 함수명()으로 호출
    - 코드 재사용 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 정의

    간단한 함수를 정의합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def greet():
    msg = 'Hello'
    return msg

    greet()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        def greet():
            msg = 'Hello'
            return msg

        return greet()
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 호출

    함수를 여러 번 호출할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getMessage():
    return 'Welcome'

    first = getMessage()
    second = getMessage()
    first, second
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        def getMessage():
            return 'Welcome'

        first = getMessage()
        second = getMessage()
        return (first, second)
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 결과 사용

    함수 결과를 변수에 저장하고 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getNumber():
    return 42

    num = getNumber()
    twice = num * 2
    twice
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        def getNumber():
            return 42

        num = getNumber()
        twice = num * 2
        return twice
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 함수명은 소문자와 언더스코어를 사용하거나 카멜케이스를 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## return 문

    *값 반환하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    return은 함수의 결과값을 반환합니다. return 값 형식으로 사용하며, 함수 실행을 즉시 종료하고 값을 호출한 곳으로 돌려줍니다. return이 없으면 None을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - return 값 형식
    - 함수 결과 반환
    - 함수 즉시 종료
    - return 없으면 None
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### return 기본

    계산 결과를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def add():
    answer = 10 + 20
    return answer

    add()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        def add():
            answer = 10 + 20
            return answer

        return add()
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### return 즉시

    계산식을 바로 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def multiply():
    return 5 * 6

    multiply()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        def multiply():
            return 5 * 6

        return multiply()
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 return

    조건에 따라 다른 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def checkValue():
    value = 15
    if value > 10:
    return 'big'
    else:
    return 'small'

    checkValue()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        def checkValue():
            value = 15
            if value > 10:
                return 'big'
            else:
                return 'small'

        return checkValue()
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > return을 만나면 함수가 즉시 종료되므로 위치에 주의하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 매개변수 1개

    *값을 받는 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    매개변수는 함수가 받는 입력값입니다. def 함수명(매개변수): 형식으로 정의하며, 호출시 전달하는 값을 인자라고 합니다. 매개변수를 사용하면 함수를 더 유연하게 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - def 함수명(매개변수): 형식
    - 매개변수: 함수가 받는 변수
    - 인자: 호출시 전달하는 값
    - 함수 유연성 증가
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 매개변수 기본

    매개변수를 받아 처리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def double(num):
    return num * 2

    double(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        def double(num):
            return num * 2

        return double(5)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 매개변수

    문자열을 받아 처리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def sayHi(name):
    return 'Hello ' + name

    sayHi('Alice')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        def sayHi(name):
            return 'Hello ' + name

        return sayHi('Alice')
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건과 매개변수

    매개변수를 조건문에서 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def isAdult(age):
    if age >= 18:
    return True
    else:
    return False

    isAdult(25)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        def isAdult(age):
            if age >= 18:
                return True
            else:
                return False

        return isAdult(25)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 매개변수명은 함수 안에서만 유효한 지역 변수입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 매개변수 여러 개

    *여러 값 받기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수는 여러 개의 매개변수를 받을 수 있습니다. 쉼표로 구분하여 나열하며, 호출시에도 같은 순서로 인자를 전달해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - def 함수명(매개변수1, 매개변수2): 형식
    - 쉼표로 구분
    - 순서대로 전달
    - 여러 값 조합 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 개 매개변수

    두 개의 매개변수를 받아 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def addTwo(a, b):
    return a + b

    addTwo(10, 20)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        def addTwo(a, b):
            return a + b

        return addTwo(10, 20)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 세 개 매개변수

    세 개의 매개변수를 받아 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def average(x, y, z):
    return (x + y + z) / 3

    average(80, 90, 85)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        def average(x, y, z):
            return (x + y + z) / 3

        return average(80, 90, 85)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 조합

    여러 문자열을 조합합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def fullName(first, last):
    return first + ' ' + last

    fullName('John', 'Doe')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        def fullName(first, last):
            return first + ' ' + last

        return fullName('John', 'Doe')
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 매개변수 개수와 인자 개수가 일치해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 값 반환

    *튜플로 반환*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수는 여러 값을 반환할 수 있습니다. 쉼표로 구분하여 반환하면 튜플로 묶여서 반환됩니다. 호출한 곳에서 여러 변수로 받을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - return 값1, 값2 형식
    - 튜플로 반환됨
    - 여러 변수로 받기 가능
    - 관련된 값 함께 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 값 반환

    두 개의 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def minMax(a, b):
    if a < b:
    return a, b
    else:
    return b, a

    minMax(10, 5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        def minMax(a, b):
            if a < b:
                return a, b
            else:
                return b, a

        return minMax(10, 5)
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산 결과들

    여러 계산 결과를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def calculate(num):
    double = num * 2
    triple = num * 3
    return double, triple

    calculate(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        def calculate(num):
            double = num * 2
            triple = num * 3
            return double, triple

        return calculate(5)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 분리해서 받기

    반환된 값을 각각 변수에 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getInfo():
    name = 'Python'
    version = 3.9
    return name, version

    lang, ver = getInfo()
    lang
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        def getInfo():
            name = 'Python'
            version = 3.9
            return name, version

        lang, ver = getInfo()
        return lang
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 여러 값을 반환하면 자동으로 튜플이 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 매개변수 없는 함수

    *입력 없이 실행*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수는 매개변수가 없어도 됩니다. 항상 같은 값을 반환하거나 내부 로직만 실행하는 함수에 사용합니다. 호출시에도 괄호만 씁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - def 함수명(): 형식
    - 매개변수 없음
    - 고정된 동작 수행
    - 함수명()로 호출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 고정값 반환

    항상 같은 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getPi():
    return 3.14159

    getPi()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        def getPi():
            return 3.14159

        return getPi()
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 내부 계산

    함수 내부에서만 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getDefault():
    base = 100
    bonus = 50
    return base + bonus

    getDefault()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        def getDefault():
            base = 100
            bonus = 50
            return base + bonus

        return getDefault()
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 생성

    고정된 리스트를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getColors():
    return ['red', 'green', 'blue']

    getColors()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        def getColors():
            return ['red', 'green', 'blue']

        return getColors()
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 상수값이나 기본 설정을 반환할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## return 없는 함수

    *작업만 수행*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수는 return이 없어도 됩니다. return이 없으면 None을 반환합니다. 주로 작업만 수행하고 결과가 필요없을 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - return 생략 가능
    - None 자동 반환
    - 작업 수행용
    - 부수 효과만 목적
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### return 없음

    return이 없으면 None을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def doSomething():
    x = 10 + 20

    output = doSomething()
    output
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0067():
        def doSomething():
            x = 10 + 20

        output = doSomething()
        return output
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 return

    조건에 따라 return이 없을 수도 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def checkPositive(num):
    if num > 0:
    return 'positive'

    checkPositive(-5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0069():
        def checkPositive(num):
            if num > 0:
                return 'positive'

        return checkPositive(-5)
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 명시적 None

    명시적으로 None을 반환할 수도 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getValue(flag):
    if flag:
    return 100
    return None

    getValue(False)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        def getValue(flag):
            if flag:
                return 100
            return None

        return getValue(False)
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 반환값이 필요한 함수는 항상 return을 명시하는 것이 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 함수와 조건문

    *조건에 따른 처리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수 안에서 조건문을 사용하여 매개변수에 따라 다른 결과를 반환할 수 있습니다. 함수의 유연성이 크게 증가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수 내부에 조건문
    - 매개변수 기반 분기
    - 다양한 경우 처리
    - 유연한 함수 구현
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 등급 판정

    점수에 따라 등급을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getGrade(score):
    if score >= 90:
    return 'A'
    elif score >= 80:
    return 'B'
    elif score >= 70:
    return 'C'
    else:
    return 'F'

    getGrade(85)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0077():
        def getGrade(score):
            if score >= 90:
                return 'A'
            elif score >= 80:
                return 'B'
            elif score >= 70:
                return 'C'
            else:
                return 'F'

        return getGrade(85)
    _snippet_0077()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 절대값

    숫자의 절대값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def absolute(num):
    if num >= 0:
    return num
    else:
    return -num

    absolute(-15)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0079():
        def absolute(num):
            if num >= 0:
                return num
            else:
                return -num

        return absolute(-15)
    _snippet_0079()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 할인 계산

    금액에 따라 할인을 적용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def applyDiscount(price):
    if price >= 100000:
    return price * 0.9
    elif price >= 50000:
    return price * 0.95
    else:
    return price

    applyDiscount(80000)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0081():
        def applyDiscount(price):
            if price >= 100000:
                return price * 0.9
            elif price >= 50000:
                return price * 0.95
            else:
                return price

        return applyDiscount(80000)
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 조건문으로 다양한 입력에 대응할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 함수와 반복문

    *반복 처리 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수 안에서 반복문을 사용하여 리스트나 문자열을 처리할 수 있습니다. 반복 로직을 함수로 만들면 재사용이 쉬워집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수 내부에 반복문
    - 리스트/문자열 처리
    - 반복 로직 재사용
    - 코드 간결화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 합계

    리스트의 모든 요소를 더합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def sumList(numbers):
    acc = 0
    for num in numbers:
    acc = acc + num
    return acc

    sumList([1, 2, 3, 4, 5])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0087():
        def sumList(numbers):
            acc = 0
            for num in numbers:
                acc = acc + num
            return acc

        return sumList([1, 2, 3, 4, 5])
    _snippet_0087()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자 개수

    문자열에서 특정 문자의 개수를 셉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def countChar(text, target):
    cnt = 0
    for char in text:
    if char == target:
    cnt = cnt + 1
    return cnt

    countChar('hello world', 'o')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0089():
        def countChar(text, target):
            cnt = 0
            for char in text:
                if char == target:
                    cnt = cnt + 1
            return cnt

        return countChar('hello world', 'o')
    _snippet_0089()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최대값 찾기

    리스트에서 최대값을 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def findMax(values):
    biggest = values[0]
    for item in values:
    if item > biggest:
    biggest = item
    return biggest

    findMax([15, 42, 8, 23, 56])
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0091():
        def findMax(values):
            biggest = values[0]
            for item in values:
                if item > biggest:
                    biggest = item
            return biggest

        return findMax([15, 42, 8, 23, 56])
    _snippet_0091()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 복잡한 반복 로직을 함수로 만들면 코드가 깔끔해집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 함수 재사용

    *같은 함수 여러 번 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수의 가장 큰 장점은 재사용입니다. 한 번 정의한 함수를 여러 곳에서 다른 인자로 호출할 수 있습니다. 코드 중복을 줄이고 유지보수가 쉬워집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 한 번 정의, 여러 번 사용
    - 다른 인자로 호출
    - 코드 중복 감소
    - 유지보수 용이
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 번 호출

    같은 함수를 다른 인자로 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def square(n):
    return n * n

    sq3 = square(3)
    sq5 = square(5)
    sq7 = square(7)
    sq3, sq5, sq7
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0097():
        def square(n):
            return n * n

        sq3 = square(3)
        sq5 = square(5)
        sq7 = square(7)
        return (sq3, sq5, sq7)
    _snippet_0097()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 조합

    함수 결과를 다시 함수에 전달합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def addTen(num):
    return num + 10

    chained = addTen(5)
    chained = addTen(chained)
    chained
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0099():
        def addTen(num):
            return num + 10

        chained = addTen(5)
        chained = addTen(chained)
        return chained
    _snippet_0099()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 반복문에서 호출

    반복문 안에서 함수를 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def triple(x):
    return x * 3

    results = []
    for i in range(1, 5):
    results.append(triple(i))
    results
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0101():
        def triple(x):
            return x * 3

        results = []
        for i in range(1, 5):
            results.append(triple(i))
        return results
    _snippet_0101()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 자주 사용하는 로직은 함수로 만들어 재사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 15 종합 복습

    *함수 기초 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 15에서 배운 함수 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 함수 정의

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
    ### 연습: 🟢 기본2: 매개변수 1개

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
    ### 연습: 🟢 기본3: 매개변수 2개

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
    ### 연습: 🟢 기본4: 조건문 활용

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
    ### 연습: 🟢 기본5: 여러 값 반환

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
    ### 연습: 🟡 응용1: 온도 변환

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
    ### 연습: 🟡 응용2: 문자열 처리

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
    ### 연습: 🟡 응용3: 리스트 평균

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
    ### 연습: 🟡 응용4: 범위 검사

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
    ### 연습: 🟡 응용5: 짝수 개수

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
    ### 연습: 🔴 심화1-1: BMI 계산

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
    ### 연습: 🔴 심화1-2: BMI 판정

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
    ### 연습: 🔴 심화2-1: 팩토리얼

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
    ### 연습: 🔴 심화2-2: 순열

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
    ### 연습: 🔴 심화3-1: 소수 판별

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
    ### 연습: 🔴 심화3-2: 소수 목록

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
    ### 연습: 🔴 심화4-1: 최대공약수

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
    ### 연습: 🔴 심화4-2: 최소공배수

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
    ### 연습: 🔴 심화5-1: 피보나치

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
    ### 연습: 🔴 심화5-2: 피보나치 수열

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
