import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 17. 스코프와클로저")


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
    # Day 17. 스코프와클로저

    이 노트북은 `study/python/30days/day17_스코프와클로저.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 변수 스코프 이해
    - global과 nonlocal
    - 클로저로 상태 보존
    - 고급 함수 패턴

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

    - 오늘 새로 배우는 개념: global, nonlocal, 클로저, 스코프
    - 이미 써도 되는 개념: 함수 전체
    - 오늘은 일부러 쓰지 않는 개념: import, 클래스

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 지역 변수

    *함수 내부 변수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수 안에서 만든 변수는 지역 변수입니다. 지역 변수는 함수 내부에서만 사용할 수 있고, 함수가 끝나면 사라집니다. 함수 밖에서는 접근할 수 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수 내부에서만 유효
    - 함수 종료시 사라짐
    - 외부에서 접근 불가
    - 각 함수마다 독립적
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 지역 변수 기본

    함수 내부 변수는 외부에서 접근할 수 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def calculate():
    result = 10 + 20
    return result

    calculate()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        def calculate():
            result = 10 + 20
            return result

        return calculate()
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 독립적인 지역 변수

    같은 이름이어도 각 함수에서 독립적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def addNumbers():
    value = 100
    return value + 50

    def multiplyNumbers():
    value = 10
    return value * 5

    addNumbers(), multiplyNumbers()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        def addNumbers():
            value = 100
            return value + 50

        def multiplyNumbers():
            value = 10
            return value * 5

        return (addNumbers(), multiplyNumbers())
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 매개변수도 지역 변수

    매개변수도 지역 변수입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def process(data):
    data = data * 2
    return data

    process(15)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        def process(data):
            data = data * 2
            return data

        return process(15)
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 지역 변수는 함수의 독립성을 보장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 전역 변수

    *함수 외부 변수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수 밖에서 만든 변수는 전역 변수입니다. 전역 변수는 어디서든 읽을 수 있지만, 함수 안에서 수정하려면 global 키워드가 필요합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수 밖에서 정의
    - 어디서든 읽기 가능
    - 수정은 global 필요
    - 프로그램 종료시 사라짐
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 전역 변수 읽기

    함수에서 전역 변수를 읽을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    total = 100

    def showTotal():
    return total

    showTotal()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        total = 100

        def showTotal():
            return total

        return showTotal()
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 지역 변수 우선

    같은 이름이면 지역 변수가 우선됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    count = 50

    def getCount():
    count = 30
    return count

    getCount()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        count = 50

        def getCount():
            count = 30
            return count

        return getCount()
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 전역과 지역 분리

    전역 변수는 함수 실행 후에도 유지됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    price = 1000

    def calculate():
    discount = 100
    return price - discount

    calculate()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        price = 1000

        def calculate():
            discount = 100
            return price - discount

        return calculate()
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 전역 변수는 최소한으로 사용하는 것이 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## global 키워드

    *전역 변수 수정*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    global 키워드를 사용하면 함수 안에서 전역 변수를 수정할 수 있습니다. global 변수명 형식으로 선언하고 사용합니다. 전역 상태를 변경할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - global 변수명 선언
    - 전역 변수 수정 가능
    - 함수 시작 부분에 선언
    - 여러 변수 동시 선언 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### global 기본

    global로 전역 변수를 수정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    balance = 1000

    def deposit(amount):
    global balance
    balance = balance + amount
    return balance

    deposit(500)
    ```
    """)
    return

@app.cell(hide_code=True)
def _(_runSnippet):
    _runSnippet(r"""
balance = 1000

def deposit(amount):
    global balance
    balance = balance + amount
    return balance

deposit(500)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 전역 변수

    여러 전역 변수를 수정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    score = 0
    level = 1

    def levelUp():
    global score, level
    score = score + 100
    level = level + 1
    return score, level

    levelUp()
    ```
    """)
    return

@app.cell(hide_code=True)
def _(_runSnippet):
    _runSnippet(r"""
score = 0
level = 1

def levelUp():
    global score, level
    score = score + 100
    level = level + 1
    return score, level

levelUp()
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 카운터 구현

    전역 변수로 카운터를 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    counter = 0

    def increment():
    global counter
    counter = counter + 1
    return counter

    increment()
    increment()
    ```
    """)
    return

@app.cell(hide_code=True)
def _(_runSnippet):
    _runSnippet(r"""
counter = 0

def increment():
    global counter
    counter = counter + 1
    return counter

increment()
increment()
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > global은 필요할 때만 사용하고, 가급적 return으로 값을 전달하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중첩 함수

    *함수 안의 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    함수 안에 다른 함수를 정의할 수 있습니다. 내부 함수는 외부 함수의 변수에 접근할 수 있습니다. 외부 함수에서만 내부 함수를 호출할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수 안에 함수 정의
    - 내부 함수는 외부 변수 접근
    - 외부 함수에서만 호출
    - 코드 구조화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중첩 함수 기본

    함수 안에 함수를 정의합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def outer():
    msg = 'Hello'
    def inner():
    return msg + ' World'
    return inner()

    outer()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        def outer():
            msg = 'Hello'
            def inner():
                return msg + ' World'
            return inner()

        return outer()
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 외부 변수 접근

    내부 함수가 외부 함수의 변수를 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def calculate(x):
    base = 10
    def add():
    return x + base
    return add()

    calculate(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        def calculate(x):
            base = 10
            def add():
                return x + base
            return add()

        return calculate(5)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 내부 함수

    여러 개의 내부 함수를 정의할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def compute(num):
    def double():
    return num * 2
    def triple():
    return num * 3
    return double() + triple()

    compute(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        def compute(num):
            def double():
                return num * 2
            def triple():
                return num * 3
            return double() + triple()

        return compute(5)
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중첩 함수는 관련된 기능을 그룹화할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## nonlocal 키워드

    *외부 함수 변수 수정*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    nonlocal 키워드를 사용하면 내부 함수에서 외부 함수의 변수를 수정할 수 있습니다. nonlocal 변수명 형식으로 선언합니다. 클로저를 만들 때 중요합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - nonlocal 변수명 선언
    - 외부 함수 변수 수정
    - 전역이 아닌 외부 스코프
    - 클로저 구현에 필수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### nonlocal 기본

    내부 함수에서 외부 함수 변수를 수정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def outer():
    count = 0
    def increment():
    nonlocal count
    count = count + 1
    return count
    return increment()

    outer()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        def outer():
            count = 0
            def increment():
                nonlocal count
                count = count + 1
                return count
            return increment()

        return outer()
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 번 호출

    내부 함수를 여러 번 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeCounter():
    total = 0
    def add(n):
    nonlocal total
    total = total + n
    return total
    return add(10), add(20), add(30)

    makeCounter()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        def makeCounter():
            total = 0
            def add(n):
                nonlocal total
                total = total + n
                return total
            return add(10), add(20), add(30)

        return makeCounter()
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 상태 변경

    외부 함수의 상태를 변경합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def manage():
    value = 100
    def update(delta):
    nonlocal value
    value = value + delta
    return value
    first = update(50)
    second = update(-30)
    return first, second

    manage()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        def manage():
            value = 100
            def update(delta):
                nonlocal value
                value = value + delta
                return value
            first = update(50)
            second = update(-30)
            return first, second

        return manage()
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > nonlocal은 가장 가까운 외부 함수의 변수를 참조합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 클로저 기본

    *상태를 기억하는 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    클로저는 외부 함수가 끝난 후에도 외부 함수의 변수를 기억하는 내부 함수입니다. 외부 함수가 내부 함수를 반환하면 클로저가 됩니다. 각 클로저는 독립적인 상태를 유지합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 내부 함수를 반환
    - 외부 변수를 기억
    - 독립적인 상태 유지
    - 데이터 캡슐화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 클로저 생성

    내부 함수를 반환하여 클로저를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeAdder(n):
    def add(x):
    return x + n
    return add

    add5 = makeAdder(5)
    add5(10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        def makeAdder(n):
            def add(x):
                return x + n
            return add

        add5 = makeAdder(5)
        return add5(10)
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 독립적인 클로저

    각 클로저는 독립적인 상태를 가집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def createMultiplier(factor):
    def multiply(num):
    return num * factor
    return multiply

    double = createMultiplier(2)
    triple = createMultiplier(3)
    double(5), triple(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        def createMultiplier(factor):
            def multiply(num):
                return num * factor
            return multiply

        double = createMultiplier(2)
        triple = createMultiplier(3)
        return (double(5), triple(5))
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 번 호출

    클로저를 여러 번 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makePower(exp):
    def power(base):
    return base ** exp
    return power

    square = makePower(2)
    square(3), square(4), square(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        def makePower(exp):
            def power(base):
                return base ** exp
            return power

        square = makePower(2)
        return (square(3), square(4), square(5))
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클로저는 함수 팩토리 패턴을 구현할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 클로저 활용

    *상태를 가진 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    클로저를 사용하면 상태를 가진 함수를 만들 수 있습니다. nonlocal과 함께 사용하여 상태를 변경하고 유지할 수 있습니다. 카운터, 누적기 등을 구현할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 상태 유지 함수
    - nonlocal로 상태 변경
    - 캡슐화된 데이터
    - 함수형 프로그래밍
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 카운터 클로저

    상태를 유지하는 카운터를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeCounter():
    cnt = 0
    def increment():
    nonlocal cnt
    cnt = cnt + 1
    return cnt
    return increment

    counter = makeCounter()
    counter(), counter(), counter()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0067():
        def makeCounter():
            cnt = 0
            def increment():
                nonlocal cnt
                cnt = cnt + 1
                return cnt
            return increment

        counter = makeCounter()
        return (counter(), counter(), counter())
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 누적기 클로저

    값을 누적하는 함수를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeAccumulator():
    total = 0
    def add(val):
    nonlocal total
    total = total + val
    return total
    return add

    acc = makeAccumulator()
    acc(10), acc(20), acc(30)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0069():
        def makeAccumulator():
            total = 0
            def add(val):
                nonlocal total
                total = total + val
                return total
            return add

        acc = makeAccumulator()
        return (acc(10), acc(20), acc(30))
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 체커

    범위를 기억하는 검사 함수를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeRangeChecker(minVal, maxVal):
    def check(num):
    return minVal <= num <= maxVal
    return check

    isValid = makeRangeChecker(10, 100)
    isValid(50), isValid(5), isValid(150)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        def makeRangeChecker(minVal, maxVal):
            def check(num):
                return minVal <= num <= maxVal
            return check

        isValid = makeRangeChecker(10, 100)
        return (isValid(50), isValid(5), isValid(150))
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클로저는 클래스 없이도 상태를 관리할 수 있게 해줍니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 17 종합 복습

    *스코프와 클로저 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 17에서 배운 스코프와 클로저를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 지역 변수

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
    ### 연습: 🟢 기본2: 전역 변수 읽기

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
    ### 연습: 🟢 기본3: global 키워드

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
    ### 연습: 🟢 기본4: 중첩 함수

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
    ### 연습: 🟢 기본5: 클로저

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
    ### 연습: 🟡 응용1: 잔액 관리

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
    ### 연습: 🟡 응용2: 점수 시스템

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
    ### 연습: 🟡 응용3: 함수 팩토리

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
    ### 연습: 🟡 응용4: 카운터

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
    ### 연습: 🟡 응용5: 곱셈기

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
    ### 연습: 🔴 심화1-1: 게임 상태

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
    ### 연습: 🔴 심화1-2: 누적 평균

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
    ### 연습: 🔴 심화2-1: 할인 계산기

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
    ### 연습: 🔴 심화2-2: 범위 필터

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
    ### 연습: 🔴 심화3-1: 통계 수집기

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
    ### 연습: 🔴 심화3-2: 최대/최소 추적

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
    ### 연습: 🔴 심화4-1: 함수 체이너

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
    ### 연습: 🔴 심화4-2: 메모이제이션

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
    ### 연습: 🔴 심화5-1: 카운트다운

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
    ### 연습: 🔴 심화5-2: 토글 스위치

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
