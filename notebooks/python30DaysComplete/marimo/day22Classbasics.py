import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 22. 클래스 기초")


@app.cell
def _():
    import marimo as mo
    return (mo,)

@app.cell
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

    - 오늘 새로 배우는 개념: class, init, self, method, attribute, instance
    - 이미 써도 되는 개념: function_all, import, exception
    - 오늘은 일부러 쓰지 않는 개념: inheritance, special_method, decorator

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
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
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        class Dog:
            pass

        myDog = Dog()
        return type(myDog)
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 클래스 확인

    인스턴스가 어떤 클래스인지 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        class Cat:
            pass

        myCat = Cat()
        return type(myCat).__name__
    _snippet_0009()
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
    """)
    return

@app.cell
def _():
    def _snippet_0015():
        class Employee:
            def __init__(self, name):
                self.name = name

        alice = Employee('Alice')
        return alice.name
    _snippet_0015()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 속성

    여러 속성을 한 번에 초기화합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        class Book:
            def __init__(self, title, author):
                self.title = title
                self.author = author

        book1 = Book('Python Guide', 'Kim')
        return book1.title
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 설정

    매개변수에 기본값을 설정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        class Product:
            def __init__(self, name, price=0):
                self.name = name
                self.price = price

        item = Product('Notebook')
        return item.price
    _snippet_0019()
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
    """)
    return

@app.cell
def _():
    def _snippet_0025():
        class Tracker:
            def __init__(self):
                self.count = 0

        cnt = Tracker()
        return cnt.count
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### self로 속성 수정

    메서드에서 self로 속성을 수정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        class Score:
            def __init__(self, value):
                self.value = value

            def double(self):
                self.value = self.value * 2

        s = Score(10)
        s.double()
        return s.value
    _snippet_0027()
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
    """)
    return

@app.cell
def _():
    def _snippet_0033():
        class Greeter:
            def __init__(self, name):
                self.name = name

            def greet(self):
                return 'Hello, ' + self.name

        g = Greeter('Bob')
        return g.greet()
    _snippet_0033()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 매개변수가 있는 메서드

    메서드가 추가 매개변수를 받습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0035():
        class Calculator:
            def __init__(self, value):
                self.value = value

            def add(self, num):
                return self.value + num

        calc = Calculator(10)
        return calc.add(5)
    _snippet_0035()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 메서드

    하나의 클래스에 여러 메서드를 정의합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0037():
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
    _snippet_0037()
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
    """)
    return

@app.cell
def _():
    def _snippet_0043():
        class User:
            def __init__(self, name, age):
                self.name = name
                self.age = age

        user1 = User('Alice', 25)
        user2 = User('Bob', 30)
        return (user1.age, user2.age)
    _snippet_0043()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 속성 수정

    인스턴스 속성을 직접 수정할 수 있습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0045():
        class Savings:
            def __init__(self, balance):
                self.balance = balance

        sav = Savings(1000)
        sav.balance = sav.balance + 500
        return sav.balance
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 동적 속성 추가

    인스턴스에 나중에 속성을 추가할 수 있습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        class Empty:
            pass

        obj = Empty()
        obj.newAttr = 'dynamic'
        return obj.newAttr
    _snippet_0047()
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
    """)
    return

@app.cell
def _():
    def _snippet_0053():
        class Car:
            def __init__(self, model, color):
                self.model = model
                self.color = color

        car1 = Car('Tesla', 'red')
        car2 = Car('BMW', 'blue')
        return (car1.model, car2.model)
    _snippet_0053()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 독립적인 동작

    각 인스턴스는 독립적으로 동작합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0055():
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
    _snippet_0055()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트에 담기

    여러 인스턴스를 리스트에 담을 수 있습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
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
    _snippet_0057()
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

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: __init__ 기본

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 여러 속성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 간단한 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 속성 수정

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 기본값 매개변수

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 계산 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 매개변수 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 여러 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 독립적인 인스턴스

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-1: 문자열 반환 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-2: 조건부 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-1: 상태 변경 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-2: 누적 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-1: 리스트 속성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-2: 카운팅 메서드

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-1: 딕셔너리 속성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-2: 메서드 체이닝

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-1: 복잡한 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-2: 조건부 필터링

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
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
