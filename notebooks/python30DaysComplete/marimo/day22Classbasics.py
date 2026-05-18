import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 22. 클래스 기초")


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
    # Day 22. 클래스 기초

    이 노트북은 `study/python/30days/day22_클래스기초.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    class, __init__, self, 속성, 메서드, 인스턴스로 객체를 만듭니다.

    ## 왜 중요한가

    관련 데이터와 동작을 한곳에 묶으면 프로그램 구조가 더 읽기 쉬워집니다.

    ## 생각 모델

    클래스는 설계도이고 인스턴스는 설계도로 만든 실제 물건입니다. self는 그 물건 자기 자신을 가리킵니다.

    ## 오늘 배우는 것

    - class로 클래스 정의
    - __init__으로 초기화
    - self로 인스턴스 참조
    - 메서드와 속성 활용

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

    - 오늘 새로 배우는 개념: 클래스, __init__, self, 메서드, 속성, 인스턴스
    - 이미 써도 되는 개념: 함수 전체, import, 예외
    - 오늘은 일부러 쓰지 않는 개념: 상속, 특수 메서드, 데코레이터

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 이 객체가 가져야 할 데이터와 할 수 있는 동작을 먼저 나눕니다.
    - 실행 중: 인스턴스를 여러 개 만들고 각자의 속성이 따로 유지되는지 확인합니다.
    - 연습 초점: 학생, 계좌, 할 일처럼 상태와 행동이 함께 있는 대상을 클래스로 표현합니다.
    - 막히면: TypeError가 나면 self를 메서드 첫 매개변수에 두었는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 클래스 정의

    *class 키워드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    클래스는 객체를 만드는 설계도입니다. class 키워드로 클래스를 정의하고, 클래스명()으로 인스턴스를 생성합니다. 클래스명은 대문자로 시작하는 것이 관례입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - class 클래스명: 형식
    - 대문자로 시작
    - 클래스명()으로 인스턴스 생성
    - 설계도와 실제 객체
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 클래스

    가장 단순한 클래스를 정의합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Dog:
    pass

    myDog = Dog()
    type(myDog)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        class Dog:
            pass

        myDog = Dog()
        return type(myDog)
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 클래스 확인

    인스턴스가 어떤 클래스인지 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Cat:
    pass

    myCat = Cat()
    type(myCat).__name__
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        class Cat:
            pass

        myCat = Cat()
        return type(myCat).__name__
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클래스는 데이터와 기능을 하나로 묶는 도구입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __init__ 메서드

    *초기화 메서드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __init__ 메서드는 인스턴스 생성 시 자동으로 호출되는 특별한 메서드입니다. 인스턴스의 초기 속성값을 설정하는 데 사용합니다. 첫 번째 매개변수는 항상 self입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __init__: 초기화 메서드
    - 인스턴스 생성 시 자동 호출
    - 첫 매개변수는 self
    - 속성 초기화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 속성 초기화

    __init__으로 속성을 초기화합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Employee:
    def __init__(self, name):
    self.name = name

    alice = Employee('Alice')
    alice.name
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0016():
        class Employee:
            def __init__(self, name):
                self.name = name

        alice = Employee('Alice')
        return alice.name
    _snippet_0016()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 속성

    여러 속성을 한 번에 초기화합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Book:
    def __init__(self, title, author):
    self.title = title
    self.author = author

    book1 = Book('Python Guide', 'Kim')
    book1.title
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        class Book:
            def __init__(self, title, author):
                self.title = title
                self.author = author

        book1 = Book('Python Guide', 'Kim')
        return book1.title
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 설정

    매개변수에 기본값을 설정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Product:
    def __init__(self, name, price=0):
    self.name = name
    self.price = price

    item = Product('Notebook')
    item.price
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        class Product:
            def __init__(self, name, price=0):
                self.name = name
                self.price = price

        item = Product('Notebook')
        return item.price
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __init__은 생성자처럼 동작하지만 엄밀히는 초기화 메서드입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## self 이해하기

    *인스턴스 자신을 가리키는 참조*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    self는 인스턴스 자신을 가리키는 참조입니다. 메서드의 첫 번째 매개변수로 self를 받고, self.속성명으로 인스턴스 속성에 접근합니다. 메서드 호출 시 self는 자동으로 전달됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - self: 인스턴스 자신
    - 메서드 첫 매개변수
    - self.속성명으로 접근
    - 자동으로 전달됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### self로 속성 접근

    self를 통해 인스턴스 속성에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Tracker:
    def __init__(self):
    self.count = 0

    cnt = Tracker()
    cnt.count
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0026():
        class Tracker:
            def __init__(self):
                self.count = 0

        cnt = Tracker()
        return cnt.count
    _snippet_0026()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### self로 속성 수정

    메서드에서 self로 속성을 수정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Score:
    def __init__(self, value):
    self.value = value

    def double(self):
    self.value = self.value * 2

    s = Score(10)
    s.double()
    s.value
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        class Score:
            def __init__(self, value):
                self.value = value

            def double(self):
                self.value = self.value * 2

        s = Score(10)
        s.double()
        return s.value
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > self는 관례적인 이름이지만 다른 이름도 가능합니다. 하지만 self를 사용하는 것이 표준입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 인스턴스 메서드

    *클래스의 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    인스턴스 메서드는 클래스 내부에 정의된 함수입니다. 첫 번째 매개변수로 self를 받고, 인스턴스.메서드명()으로 호출합니다. 메서드는 인스턴스의 속성을 사용하거나 수정할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 클래스 내부 함수
    - 첫 매개변수 self
    - 인스턴스.메서드명() 호출
    - 속성 사용 및 수정
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 메서드

    간단한 메서드를 정의합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Greeter:
    def __init__(self, name):
    self.name = name

    def greet(self):
    return 'Hello, ' + self.name

    g = Greeter('Bob')
    g.greet()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0034():
        class Greeter:
            def __init__(self, name):
                self.name = name

            def greet(self):
                return 'Hello, ' + self.name

        g = Greeter('Bob')
        return g.greet()
    _snippet_0034()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 매개변수가 있는 메서드

    메서드가 추가 매개변수를 받습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Calculator:
    def __init__(self, value):
    self.value = value

    def add(self, num):
    return self.value + num

    calc = Calculator(10)
    calc.add(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0036():
        class Calculator:
            def __init__(self, value):
                self.value = value

            def add(self, num):
                return self.value + num

        calc = Calculator(10)
        return calc.add(5)
    _snippet_0036()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 메서드

    하나의 클래스에 여러 메서드를 정의합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Rectangle:
    def __init__(self, width, height):
    self.width = width
    self.height = height

    def area(self):
    return self.width * self.height

    def perimeter(self):
    return 2 * (self.width + self.height)

    rect = Rectangle(5, 3)
    rect.area()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        class Rectangle:
            def __init__(self, width, height):
                self.width = width
                self.height = height

            def area(self):
                return self.width * self.height

            def perimeter(self):
                return 2 * (self.width + self.height)

        rect = Rectangle(5, 3)
        return rect.area()
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 메서드는 인스턴스의 동작을 정의합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 인스턴스 속성

    *인스턴스의 데이터*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    인스턴스 속성은 각 인스턴스가 가지는 고유한 데이터입니다. self.속성명으로 정의하고 접근합니다. 각 인스턴스는 독립적인 속성값을 가집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - self.속성명으로 정의
    - 각 인스턴스마다 독립적
    - 외부에서 접근 가능
    - 동적으로 추가 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 독립적인 속성

    각 인스턴스는 독립적인 속성을 가집니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class User:
    def __init__(self, name, age):
    self.name = name
    self.age = age

    user1 = User('Alice', 25)
    user2 = User('Bob', 30)
    user1.age, user2.age
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0044():
        class User:
            def __init__(self, name, age):
                self.name = name
                self.age = age

        user1 = User('Alice', 25)
        user2 = User('Bob', 30)
        return (user1.age, user2.age)
    _snippet_0044()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 속성 수정

    인스턴스 속성을 직접 수정할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Savings:
    def __init__(self, balance):
    self.balance = balance

    sav = Savings(1000)
    sav.balance = sav.balance + 500
    sav.balance
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0046():
        class Savings:
            def __init__(self, balance):
                self.balance = balance

        sav = Savings(1000)
        sav.balance = sav.balance + 500
        return sav.balance
    _snippet_0046()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 동적 속성 추가

    인스턴스에 나중에 속성을 추가할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Empty:
    pass

    obj = Empty()
    obj.newAttr = 'dynamic'
    obj.newAttr
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        class Empty:
            pass

        obj = Empty()
        obj.newAttr = 'dynamic'
        return obj.newAttr
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 속성은 인스턴스의 상태를 나타냅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 인스턴스

    *클래스로부터 여러 객체 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    하나의 클래스로부터 여러 인스턴스를 생성할 수 있습니다. 각 인스턴스는 같은 구조를 가지지만 독립적인 데이터를 저장합니다. 클래스는 설계도이고 인스턴스는 실제 객체입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 하나의 클래스, 여러 인스턴스
    - 같은 구조, 다른 데이터
    - 독립적으로 동작
    - 설계도와 실제 객체
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 객체 생성

    같은 클래스로 여러 객체를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Car:
    def __init__(self, model, color):
    self.model = model
    self.color = color

    car1 = Car('Tesla', 'red')
    car2 = Car('BMW', 'blue')
    car1.model, car2.model
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0054():
        class Car:
            def __init__(self, model, color):
                self.model = model
                self.color = color

        car1 = Car('Tesla', 'red')
        car2 = Car('BMW', 'blue')
        return (car1.model, car2.model)
    _snippet_0054()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 독립적인 동작

    각 인스턴스는 독립적으로 동작합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class BankAccount:
    def __init__(self, owner):
    self.owner = owner
    self.balance = 0

    def deposit(self, amount):
    self.balance = self.balance + amount

    acc1 = BankAccount('Alice')
    acc2 = BankAccount('Bob')
    acc1.deposit(1000)
    acc2.deposit(500)
    acc1.balance, acc2.balance
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        class BankAccount:
            def __init__(self, owner):
                self.owner = owner
                self.balance = 0

            def deposit(self, amount):
                self.balance = self.balance + amount

        acc1 = BankAccount('Alice')
        acc2 = BankAccount('Bob')
        acc1.deposit(1000)
        acc2.deposit(500)
        return (acc1.balance, acc2.balance)
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트에 담기

    여러 인스턴스를 리스트에 담을 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Student:
    def __init__(self, name, grade):
    self.name = name
    self.grade = grade

    students = [
    Student('Alice', 90),
    Student('Bob', 85),
    Student('Charlie', 95)
    ]
    students[0].name, students[0].grade
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        class Student:
            def __init__(self, name, grade):
                self.name = name
                self.grade = grade

        students = [
            Student('Alice', 90),
            Student('Bob', 85),
            Student('Charlie', 95)
        ]
        return (students[0].name, students[0].grade)
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클래스는 재사용 가능한 코드 템플릿입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 22 종합 복습

    *클래스 기초 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 22에서 배운 클래스 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 빈 클래스

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
    ### 연습: 🟢 기본2: __init__ 기본

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
    ### 연습: 🟢 기본3: 여러 속성

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
    ### 연습: 🟢 기본4: 간단한 메서드

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
    ### 연습: 🟢 기본5: 속성 수정

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
    ### 연습: 🟡 응용1: 기본값 매개변수

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
    ### 연습: 🟡 응용2: 계산 메서드

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
    ### 연습: 🟡 응용3: 매개변수 메서드

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
    ### 연습: 🟡 응용4: 여러 메서드

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
    ### 연습: 🟡 응용5: 독립적인 인스턴스

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
    ### 연습: 🔴 심화1-1: 문자열 반환 메서드

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
    ### 연습: 🔴 심화1-2: 조건부 메서드

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
    ### 연습: 🔴 심화2-1: 상태 변경 메서드

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
    ### 연습: 🔴 심화2-2: 누적 계산

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
    ### 연습: 🔴 심화3-1: 리스트 속성

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
    ### 연습: 🔴 심화3-2: 카운팅 메서드

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
    ### 연습: 🔴 심화4-1: 딕셔너리 속성

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
    ### 연습: 🔴 심화4-2: 메서드 체이닝

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
    ### 연습: 🔴 심화5-1: 복잡한 계산

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
    ### 연습: 🔴 심화5-2: 조건부 필터링

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

    - 클래스와 인스턴스의 차이를 설명할 수 있다.
    - __init__에서 속성을 초기화할 수 있다.
    - 메서드가 self를 통해 속성을 읽고 바꾸는 흐름을 말할 수 있다.

    ## 흔한 막힘

    - self를 빠뜨림
    - 클래스 속성과 인스턴스 속성을 혼동함
    - 메서드를 호출할 때 괄호를 빼먹음

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
