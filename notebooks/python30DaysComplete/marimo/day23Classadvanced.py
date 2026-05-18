import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 23. 클래스 고급")


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
    # Day 23. 클래스 고급

    이 노트북은 `study/python/30days/day23_클래스고급.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    상속, super(), 오버라이드로 기존 클래스를 확장합니다.

    ## 왜 중요한가

    공통 동작을 반복 작성하지 않고, 차이가 나는 부분만 바꾸는 구조를 만들 수 있습니다.

    ## 생각 모델

    상속은 기본 설계도를 물려받아 필요한 부분만 덧붙이는 방식입니다.

    ## 오늘 배우는 것

    - 상속으로 클래스 확장
    - super()로 부모 메서드 호출
    - 메서드 오버라이딩으로 재정의
    - 다중 상속으로 여러 부모 활용

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

    - 오늘 새로 배우는 개념: 상속, super(), 오버라이드, 다중 상속
    - 이미 써도 되는 개념: 클래스 기초
    - 오늘은 일부러 쓰지 않는 개념: 특수 메서드, 데코레이터

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 부모 클래스의 공통점과 자식 클래스의 차이점을 먼저 표로 나눕니다.
    - 실행 중: 같은 메서드 이름이 부모와 자식에 있을 때 어느 쪽이 실행되는지 확인합니다.
    - 연습 초점: 공통 속성을 가진 여러 종류의 객체를 부모/자식 클래스로 정리합니다.
    - 막히면: 초기화가 꼬이면 super().__init__() 호출과 전달 인자를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 상속 기초

    *부모 클래스로부터 확장*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    상속은 기존 클래스를 확장하여 새로운 클래스를 만드는 기능입니다. class 자식클래스(부모클래스): 형식으로 정의하며, 자식 클래스는 부모 클래스의 모든 속성과 메서드를 물려받습니다. 코드 재사용성이 높아지고 계층 구조를 표현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - class 자식(부모): 형식
    - 부모의 속성과 메서드 상속
    - 코드 재사용
    - 계층 구조 표현
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 상속

    부모 클래스를 상속받는 자식 클래스를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Animal:
    def __init__(self, name):
    self.name = name

    def speak(self):
    return 'Some sound'

    class Dog(Animal):
    pass

    myDog = Dog('Buddy')
    myDog.name
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        class Animal:
            def __init__(self, name):
                self.name = name

            def speak(self):
                return 'Some sound'

        class Dog(Animal):
            pass

        myDog = Dog('Buddy')
        return myDog.name
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 상속받은 메서드 호출

    자식 클래스에서 부모의 메서드를 그대로 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Vehicle:
    def __init__(self, brand):
    self.brand = brand

    def start(self):
    return self.brand + ' starting'

    class Car(Vehicle):
    pass

    myCar = Car('Tesla')
    myCar.start()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        class Vehicle:
            def __init__(self, brand):
                self.brand = brand

            def start(self):
                return self.brand + ' starting'

        class Car(Vehicle):
            pass

        myCar = Car('Tesla')
        return myCar.start()
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 상속은 is-a 관계를 나타냅니다. Dog is an Animal, Car is a Vehicle.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 상속과 __init__

    *자식 클래스의 초기화*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    자식 클래스에서 __init__을 정의하지 않으면 부모의 __init__을 자동으로 사용합니다. 자식이 __init__을 정의하면 부모의 __init__은 자동으로 호출되지 않으므로 명시적으로 호출해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __init__ 없으면 부모 것 사용
    - __init__ 정의하면 부모 것 덮어씀
    - 명시적 호출 필요
    - 추가 속성 정의 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 부모 __init__ 그대로 사용

    자식이 __init__을 정의하지 않으면 부모의 것을 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Shape:
    def __init__(self, color):
    self.color = color

    class Square(Shape):
    pass

    sq = Square('red')
    sq.color
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0016():
        class Shape:
            def __init__(self, color):
                self.color = color

        class Square(Shape):
            pass

        sq = Square('red')
        return sq.color
    _snippet_0016()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 부모 __init__ 명시적 호출

    자식 __init__에서 부모의 __init__을 직접 호출합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Person:
    def __init__(self, name):
    self.name = name

    class Student(Person):
    def __init__(self, name, grade):
    Person.__init__(self, name)
    self.grade = grade

    alice = Student('Alice', 90)
    alice.name, alice.grade
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        class Person:
            def __init__(self, name):
                self.name = name

        class Student(Person):
            def __init__(self, name, grade):
                Person.__init__(self, name)
                self.grade = grade

        alice = Student('Alice', 90)
        return (alice.name, alice.grade)
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 추가 속성 정의

    자식 클래스에서 새로운 속성을 추가합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Device:
    def __init__(self, brand):
    self.brand = brand

    class Phone(Device):
    def __init__(self, brand, model):
    Device.__init__(self, brand)
    self.model = model

    ph = Phone('Samsung', 'Galaxy')
    ph.brand, ph.model
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        class Device:
            def __init__(self, brand):
                self.brand = brand

        class Phone(Device):
            def __init__(self, brand, model):
                Device.__init__(self, brand)
                self.model = model

        ph = Phone('Samsung', 'Galaxy')
        return (ph.brand, ph.model)
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 자식 __init__에서 부모 __init__을 호출할 때는 self를 명시해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## super() 함수

    *부모 클래스 참조*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    super()는 부모 클래스를 참조하는 함수입니다. super().__init__() 형태로 부모의 __init__을 호출할 수 있으며, 부모 클래스명을 직접 쓰는 것보다 유연하고 권장됩니다. 다중 상속 시 특히 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - super()로 부모 참조
    - super().__init__() 형태
    - 클래스명 직접 쓰는 것보다 유연
    - 다중 상속에서 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### super()로 __init__ 호출

    super()를 사용하여 부모 __init__을 호출합니다.

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

    class Manager(Employee):
    def __init__(self, name, department):
    super().__init__(name)
    self.department = department

    mgr = Manager('Bob', 'IT')
    mgr.name, mgr.department
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0026():
        class Employee:
            def __init__(self, name):
                self.name = name

        class Manager(Employee):
            def __init__(self, name, department):
                super().__init__(name)
                self.department = department

        mgr = Manager('Bob', 'IT')
        return (mgr.name, mgr.department)
    _snippet_0026()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### super()로 메서드 호출

    super()를 사용하여 부모의 다른 메서드도 호출할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Base:
    def greet(self):
    return 'Hello'

    class Derived(Base):
    def greet(self):
    parentGreet = super().greet()
    return parentGreet + ' from Derived'

    derived = Derived()
    derived.greet()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        class Base:
            def greet(self):
                return 'Hello'

        class Derived(Base):
            def greet(self):
                parentGreet = super().greet()
                return parentGreet + ' from Derived'

        derived = Derived()
        return derived.greet()
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### super()의 장점

    부모 클래스명이 바뀌어도 코드 수정이 필요 없습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Product:
    def __init__(self, name, price):
    self.name = name
    self.price = price

    class Book(Product):
    def __init__(self, name, price, author):
    super().__init__(name, price)
    self.author = author

    bk = Book('Python Guide', 30000, 'Kim')
    bk.name, bk.price, bk.author
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        class Product:
            def __init__(self, name, price):
                self.name = name
                self.price = price

        class Book(Product):
            def __init__(self, name, price, author):
                super().__init__(name, price)
                self.author = author

        bk = Book('Python Guide', 30000, 'Kim')
        return (bk.name, bk.price, bk.author)
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > super()를 사용하면 상속 구조가 바뀌어도 코드 변경이 최소화됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 메서드 오버라이딩

    *부모 메서드 재정의*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    메서드 오버라이딩은 자식 클래스에서 부모 클래스의 메서드를 재정의하는 것입니다. 같은 이름의 메서드를 자식 클래스에 정의하면 부모의 메서드를 덮어씁니다. 필요하면 super()로 부모 메서드를 호출한 후 추가 기능을 구현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 같은 이름 메서드 재정의
    - 부모 메서드를 덮어씀
    - super()로 부모 메서드 호출 가능
    - 다형성 구현
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 오버라이딩

    자식 클래스에서 부모 메서드를 재정의합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Bird:
    def sound(self):
    return 'chirp'

    class Parrot(Bird):
    def sound(self):
    return 'squawk'

    myBird = Parrot()
    myBird.sound()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0036():
        class Bird:
            def sound(self):
                return 'chirp'

        class Parrot(Bird):
            def sound(self):
                return 'squawk'

        myBird = Parrot()
        return myBird.sound()
    _snippet_0036()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 부모 메서드 호출 후 확장

    super()로 부모 메서드를 호출하고 추가 기능을 구현합니다.

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

    class ColoredRectangle(Rectangle):
    def __init__(self, width, height, color):
    super().__init__(width, height)
    self.color = color

    def area(self):
    baseArea = super().area()
    return baseArea

    cr = ColoredRectangle(5, 3, 'blue')
    cr.area()
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

        class ColoredRectangle(Rectangle):
            def __init__(self, width, height, color):
                super().__init__(width, height)
                self.color = color

            def area(self):
                baseArea = super().area()
                return baseArea

        cr = ColoredRectangle(5, 3, 'blue')
        return cr.area()
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 완전히 다른 구현

    부모 메서드를 완전히 다르게 재정의합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Account:
    def __init__(self):
    self.balance = 0

    def withdraw(self, amount):
    self.balance = self.balance - amount
    return self.balance

    class SafeAccount(Account):
    def withdraw(self, amount):
    if self.balance >= amount:
    self.balance = self.balance - amount
    return self.balance

    safe = SafeAccount()
    safe.balance = 1000
    safe.withdraw(1500)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        class Account:
            def __init__(self):
                self.balance = 0

            def withdraw(self, amount):
                self.balance = self.balance - amount
                return self.balance

        class SafeAccount(Account):
            def withdraw(self, amount):
                if self.balance >= amount:
                    self.balance = self.balance - amount
                return self.balance

        safe = SafeAccount()
        safe.balance = 1000
        return safe.withdraw(1500)
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 오버라이딩은 같은 인터페이스로 다른 동작을 구현하는 다형성의 핵심입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다중 상속

    *여러 부모 클래스 상속*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    다중 상속은 여러 부모 클래스를 동시에 상속받는 것입니다. class 자식(부모1, 부모2): 형식으로 정의하며, 모든 부모의 속성과 메서드를 상속받습니다. 메서드 이름이 겹치면 MRO 순서에 따라 왼쪽 부모가 우선입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - class 자식(부모1, 부모2): 형식
    - 모든 부모의 기능 상속
    - 왼쪽 부모가 우선
    - MRO로 순서 결정
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 다중 상속

    두 개의 부모 클래스를 동시에 상속받습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Flyer:
    def fly(self):
    return 'flying'

    class Swimmer:
    def swim(self):
    return 'swimming'

    class Duck(Flyer, Swimmer):
    pass

    myDuck = Duck()
    myDuck.fly(), myDuck.swim()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0046():
        class Flyer:
            def fly(self):
                return 'flying'

        class Swimmer:
            def swim(self):
                return 'swimming'

        class Duck(Flyer, Swimmer):
            pass

        myDuck = Duck()
        return (myDuck.fly(), myDuck.swim())
    _snippet_0046()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 메서드 우선순위

    같은 이름의 메서드가 있으면 왼쪽 부모가 우선입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class First:
    def action(self):
    return 'first'

    class Second:
    def action(self):
    return 'second'

    class Child(First, Second):
    pass

    childObj = Child()
    childObj.action()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        class First:
            def action(self):
                return 'first'

        class Second:
            def action(self):
                return 'second'

        class Child(First, Second):
            pass

        childObj = Child()
        return childObj.action()
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 순서 바꾸기

    상속 순서를 바꾸면 우선순위가 바뀝니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Left:
    def method(self):
    return 'left'

    class Right:
    def method(self):
    return 'right'

    class Combined(Right, Left):
    pass

    combined = Combined()
    combined.method()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        class Left:
            def method(self):
                return 'left'

        class Right:
            def method(self):
                return 'right'

        class Combined(Right, Left):
            pass

        combined = Combined()
        return combined.method()
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### __init__과 다중 상속

    다중 상속 시 super()를 사용하여 모든 부모 __init__을 호출합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Named:
    def __init__(self, name):
    self.name = name

    class Aged:
    def __init__(self, age):
    self.age = age

    class Human(Named):
    def __init__(self, name, age):
    super().__init__(name)
    self.age = age

    john = Human('John', 30)
    john.name, john.age
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        class Named:
            def __init__(self, name):
                self.name = name

        class Aged:
            def __init__(self, age):
                self.age = age

        class Human(Named):
            def __init__(self, name, age):
                super().__init__(name)
                self.age = age

        john = Human('John', 30)
        return (john.name, john.age)
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 다중 상속은 강력하지만 복잡할 수 있습니다. 신중하게 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 상속 실전 예제

    *계층 구조 설계*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    상속을 활용하여 실제 문제를 해결하는 예제를 살펴봅니다. 기본 클래스를 정의하고 여러 자식 클래스로 확장하여 코드 재사용성을 높입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 도형 계층

    기본 도형 클래스와 여러 구체적인 도형 클래스를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Polygon:
    def __init__(self, sides):
    self.sides = sides

    class Triangle(Polygon):
    def __init__(self):
    super().__init__(3)

    tri = Triangle()
    tri.sides
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        class Polygon:
            def __init__(self, sides):
                self.sides = sides

        class Triangle(Polygon):
            def __init__(self):
                super().__init__(3)

        tri = Triangle()
        return tri.sides
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 직원 관리 시스템

    기본 직원 클래스를 상속받아 다양한 직급을 구현합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Worker:
    def __init__(self, name, salary):
    self.name = name
    self.salary = salary

    def getSalary(self):
    return self.salary

    class Developer(Worker):
    def __init__(self, name, salary, language):
    super().__init__(name, salary)
    self.language = language

    dev = Developer('Alice', 5000, 'Python')
    dev.getSalary()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        class Worker:
            def __init__(self, name, salary):
                self.name = name
                self.salary = salary

            def getSalary(self):
                return self.salary

        class Developer(Worker):
            def __init__(self, name, salary, language):
                super().__init__(name, salary)
                self.language = language

        dev = Developer('Alice', 5000, 'Python')
        return dev.getSalary()
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 보너스 계산

    메서드 오버라이딩으로 다른 보너스 계산 방식을 구현합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Staff:
    def __init__(self, basePay):
    self.basePay = basePay

    def bonus(self):
    return self.basePay * 0.1

    class SeniorStaff(Staff):
    def bonus(self):
    return self.basePay * 0.2

    junior = Staff(3000)
    senior = SeniorStaff(3000)
    junior.bonus(), senior.bonus()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        class Staff:
            def __init__(self, basePay):
                self.basePay = basePay

            def bonus(self):
                return self.basePay * 0.1

        class SeniorStaff(Staff):
            def bonus(self):
                return self.basePay * 0.2

        junior = Staff(3000)
        senior = SeniorStaff(3000)
        return (junior.bonus(), senior.bonus())
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 상속은 비슷하지만 약간 다른 클래스들을 효율적으로 관리하는 도구입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 23 종합 복습

    *클래스 고급 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 23에서 배운 클래스 고급 개념을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 단순 상속

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
    ### 연습: 🟢 기본2: 부모 메서드 사용

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
    ### 연습: 🟢 기본3: 자식 __init__ 없이

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
    ### 연습: 🟢 기본4: 부모 __init__ 직접 호출

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
    ### 연습: 🟢 기본5: super() 기본

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
    ### 연습: 🟡 응용1: 메서드 오버라이딩

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
    ### 연습: 🟡 응용2: super()로 메서드 확장

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
    ### 연습: 🟡 응용3: 속성 추가

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
    ### 연습: 🟡 응용4: 다중 상속 기본

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
    ### 연습: 🟡 응용5: 우선순위 확인

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
    ### 연습: 🔴 심화1: 계산 메서드 오버라이딩

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
    ### 연습: 🔴 심화2: 체인 상속

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
    ### 연습: 🔴 심화3: 조건부 메서드

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
    ### 연습: 🔴 심화4: 다중 상속 __init__

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
    ### 연습: 🔴 심화5: 메서드 순서

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
    ### 연습: 🔴 심화6: 복합 계층 1

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
    ### 연습: 🔴 심화7: 복합 계층 2

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
    ### 연습: 🔴 심화8: 메서드 조합

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
    ### 연습: 🔴 심화9: super()로 부모 호출 후 수정

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
    ### 연습: 🔴 심화10: 복잡한 다중 상속

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

    - 상속이 중복을 줄이는 방식을 설명할 수 있다.
    - super()로 부모 초기화를 호출할 수 있다.
    - 오버라이드가 기존 동작을 바꾸는 방식임을 말할 수 있다.

    ## 흔한 막힘

    - 부모 초기화를 호출하지 않음
    - 오버라이드한 메서드 이름을 다르게 씀
    - 상속으로 해결할 문제와 단순 포함으로 해결할 문제를 구분하지 않음

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
