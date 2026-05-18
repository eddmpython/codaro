import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 25. 프로퍼티와 데코레이터")


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
    # Day 25. 프로퍼티와 데코레이터

    이 노트북은 `study/python/30days/day25_프로퍼티와데코레이터.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - @property로 속성처럼 사용
    - setter/deleter로 값 제어
    - @staticmethod, @classmethod 활용
    - 데코레이터로 기능 확장

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

    - 오늘 새로 배우는 개념: property, setter, deleter, staticmethod, classmethod, 데코레이터
    - 이미 써도 되는 개념: 클래스 전체, 특수 메서드
    - 오늘은 일부러 쓰지 않는 개념: 메타클래스, 외부 라이브러리

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 프로퍼티 기초

    *@property 데코레이터*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    프로퍼티는 메서드를 속성처럼 사용할 수 있게 해주는 기능입니다. @property 데코레이터를 메서드에 붙이면 obj.method() 대신 obj.method로 접근할 수 있습니다. 이를 통해 계산된 값을 속성처럼 제공하거나, 내부 속성에 대한 접근을 제어할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - @property 데코레이터 사용
    - 메서드를 속성처럼 접근
    - 괄호 없이 호출
    - 계산된 값 제공
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 프로퍼티

    메서드를 속성처럼 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Circle:
    def __init__(self, radius):
    self.radius = radius

    @property
    def area(self):
    return 3.14 * self.radius ** 2

    cir = Circle(5)
    cir.area
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        class Circle:
            def __init__(self, radius):
                self.radius = radius

            @property
            def area(self):
                return 3.14 * self.radius ** 2

        cir = Circle(5)
        return cir.area
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 프로퍼티

    하나의 클래스에 여러 프로퍼티를 정의할 수 있습니다.
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

    @property
    def area(self):
    return self.width * self.height

    @property
    def perimeter(self):
    return 2 * (self.width + self.height)

    rect = Rectangle(4, 6)
    rect.area, rect.perimeter
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        class Rectangle:
            def __init__(self, width, height):
                self.width = width
                self.height = height

            @property
            def area(self):
                return self.width * self.height

            @property
            def perimeter(self):
                return 2 * (self.width + self.height)

        rect = Rectangle(4, 6)
        return (rect.area, rect.perimeter)
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 프로퍼티

    조건에 따라 다른 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Account:
    def __init__(self, balance):
    self.balance = balance

    @property
    def status(self):
    if self.balance >= 0:
    return 'positive'
    else:
    return 'negative'

    acc = Account(-100)
    acc.status
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        class Account:
            def __init__(self, balance):
                self.balance = balance

            @property
            def status(self):
                if self.balance >= 0:
                    return 'positive'
                else:
                    return 'negative'

        acc = Account(-100)
        return acc.status
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 프로퍼티는 읽기 전용 속성을 만들 때 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## setter와 deleter

    *값 설정과 삭제 제어*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    프로퍼티는 getter뿐만 아니라 setter와 deleter도 정의할 수 있습니다. @프로퍼티명.setter는 값을 설정할 때, @프로퍼티명.deleter는 값을 삭제할 때 호출됩니다. 이를 통해 값의 유효성 검사나 부가 작업을 수행할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - @property.setter: 값 설정
    - @property.deleter: 값 삭제
    - 유효성 검사 가능
    - 내부 속성 보호
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### setter 정의

    값을 설정할 때 유효성을 검사합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Temperature:
    def __init__(self):
    self._celsius = 0

    @property
    def celsius(self):
    return self._celsius

    @celsius.setter
    def celsius(self, value):
    if value < -273:
    self._celsius = -273
    else:
    self._celsius = value

    temp = Temperature()
    temp.celsius = -300
    temp.celsius
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        class Temperature:
            def __init__(self):
                self._celsius = 0

            @property
            def celsius(self):
                return self._celsius

            @celsius.setter
            def celsius(self, value):
                if value < -273:
                    self._celsius = -273
                else:
                    self._celsius = value

        temp = Temperature()
        temp.celsius = -300
        return temp.celsius
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산된 setter

    설정된 값으로 다른 속성도 업데이트합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Product:
    def __init__(self, price):
    self._price = price

    @property
    def price(self):
    return self._price

    @price.setter
    def price(self, value):
    self._price = value
    self._tax = value * 0.1

    prod = Product(1000)
    prod.price = 2000
    prod._tax
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        class Product:
            def __init__(self, price):
                self._price = price

            @property
            def price(self):
                return self._price

            @price.setter
            def price(self, value):
                self._price = value
                self._tax = value * 0.1

        prod = Product(1000)
        prod.price = 2000
        return prod._tax
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### deleter 정의

    속성 삭제를 제어합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Cache:
    def __init__(self):
    self._data = {}

    @property
    def data(self):
    return self._data

    @data.deleter
    def data(self):
    self._data = {}

    cache = Cache()
    cache._data['key'] = 'value'
    del cache.data
    len(cache._data)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        class Cache:
            def __init__(self):
                self._data = {}

            @property
            def data(self):
                return self._data

            @data.deleter
            def data(self):
                self._data = {}

        cache = Cache()
        cache._data['key'] = 'value'
        del cache.data
        return len(cache._data)
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > setter를 사용하면 직접 속성에 접근하는 것처럼 보이지만 내부적으로 검증 로직을 실행할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## @staticmethod

    *정적 메서드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    정적 메서드는 클래스나 인스턴스와 무관하게 독립적으로 동작하는 메서드입니다. @staticmethod 데코레이터를 사용하며, self나 cls 매개변수를 받지 않습니다. 주로 유틸리티 함수나 헬퍼 함수를 클래스 내부에 정의할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - @staticmethod 데코레이터
    - self, cls 없음
    - 독립적인 유틸리티 함수
    - 클래스명.메서드() 호출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 정적 메서드

    클래스와 독립적인 함수를 정의합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Math:
    @staticmethod
    def add(a, b):
    return a + b

    @staticmethod
    def multiply(a, b):
    return a * b

    Math.add(3, 4)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        class Math:
            @staticmethod
            def add(a, b):
                return a + b

            @staticmethod
            def multiply(a, b):
                return a * b

        return Math.add(3, 4)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 유효성 검사 메서드

    정적 메서드로 검증 로직을 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Validator:
    @staticmethod
    def isPositive(num):
    return num > 0

    @staticmethod
    def isEmail(text):
    return '@' in text

    Validator.isPositive(10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        class Validator:
            @staticmethod
            def isPositive(num):
                return num > 0

            @staticmethod
            def isEmail(text):
                return '@' in text

        return Validator.isPositive(10)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 메서드

    데이터 변환 로직을 정적 메서드로 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Converter:
    @staticmethod
    def celsiusToFahrenheit(c):
    return c * 9 / 5 + 32

    @staticmethod
    def fahrenheitToCelsius(f):
    return (f - 32) * 5 / 9

    Converter.celsiusToFahrenheit(25)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        class Converter:
            @staticmethod
            def celsiusToFahrenheit(c):
                return c * 9 / 5 + 32

            @staticmethod
            def fahrenheitToCelsius(f):
                return (f - 32) * 5 / 9

        return Converter.celsiusToFahrenheit(25)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 정적 메서드는 클래스 내부에 관련 함수를 그룹화하여 네임스페이스를 깔끔하게 유지합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## @classmethod

    *클래스 메서드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    클래스 메서드는 클래스 자체를 첫 번째 매개변수로 받는 메서드입니다. @classmethod 데코레이터를 사용하며, 첫 매개변수는 관례적으로 cls로 명명합니다. 주로 팩토리 메서드나 클래스 레벨의 작업을 수행할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - @classmethod 데코레이터
    - 첫 매개변수는 cls
    - 클래스 참조 가능
    - 팩토리 메서드 구현
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 클래스 메서드

    클래스를 매개변수로 받아 인스턴스를 생성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Person:
    def __init__(self, name, age):
    self.name = name
    self.age = age

    @classmethod
    def fromBirthYear(cls, name, birthYear):
    age = 2024 - birthYear
    return cls(name, age)

    p = Person.fromBirthYear('Alice', 2000)
    p.age
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        class Person:
            def __init__(self, name, age):
                self.name = name
                self.age = age

            @classmethod
            def fromBirthYear(cls, name, birthYear):
                age = 2024 - birthYear
                return cls(name, age)

        p = Person.fromBirthYear('Alice', 2000)
        return p.age
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 팩토리 메서드

    다양한 방식으로 객체를 생성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Point:
    def __init__(self, x, y):
    self.x = x
    self.y = y

    @classmethod
    def origin(cls):
    return cls(0, 0)

    @classmethod
    def unit(cls):
    return cls(1, 1)

    pt = Point.origin()
    pt.x, pt.y
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            @classmethod
            def origin(cls):
                return cls(0, 0)

            @classmethod
            def unit(cls):
                return cls(1, 1)

        pt = Point.origin()
        return (pt.x, pt.y)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 파싱

    문자열을 파싱하여 객체를 생성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class RGB:
    def __init__(self, r, g, b):
    self.r = r
    self.g = g
    self.b = b

    @classmethod
    def fromHex(cls, hexCode):
    r = int(hexCode[0:2], 16)
    g = int(hexCode[2:4], 16)
    b = int(hexCode[4:6], 16)
    return cls(r, g, b)

    color = RGB.fromHex('FF8800')
    color.r, color.g
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        class RGB:
            def __init__(self, r, g, b):
                self.r = r
                self.g = g
                self.b = b

            @classmethod
            def fromHex(cls, hexCode):
                r = int(hexCode[0:2], 16)
                g = int(hexCode[2:4], 16)
                b = int(hexCode[4:6], 16)
                return cls(r, g, b)

        color = RGB.fromHex('FF8800')
        return (color.r, color.g)
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클래스 메서드는 상속 시 자식 클래스의 타입을 자동으로 따릅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 데코레이터 기초

    *함수를 꾸미는 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    데코레이터는 다른 함수를 감싸서 기능을 추가하는 함수입니다. @데코레이터명 형태로 함수 위에 붙여 사용하며, 원래 함수의 동작을 변경하거나 확장할 수 있습니다. 로깅, 타이밍, 캐싱 등 다양한 용도로 활용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 함수를 감싸는 함수
    - @데코레이터명 형태
    - 기능 추가와 확장
    - 재사용 가능한 패턴
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 간단한 데코레이터

    함수 호출 전후에 로그를 출력합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def logger(func):
    def wrapper():
    msg = 'Calling ' + func.__name__
    result = func()
    return msg + ' -> ' + str(result)
    return wrapper

    @logger
    def greet():
    return 'Hello'

    greet()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        def logger(func):
            def wrapper():
                msg = 'Calling ' + func.__name__
                result = func()
                return msg + ' -> ' + str(result)
            return wrapper

        @logger
        def greet():
            return 'Hello'

        return greet()
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 인자를 받는 데코레이터

    데코레이터가 인자를 받는 함수도 감쌀 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def double(func):
    def wrapper(x):
    result = func(x)
    return result * 2
    return wrapper

    @double
    def square(n):
    return n * n

    square(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        def double(func):
            def wrapper(x):
                result = func(x)
                return result * 2
            return wrapper

        @double
        def square(n):
            return n * n

        return square(5)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 데코레이터

    하나의 함수에 여러 데코레이터를 적용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def addOne(func):
    def wrapper(x):
    return func(x) + 1
    return wrapper

    def triple(func):
    def wrapper(x):
    return func(x) * 3
    return wrapper

    @addOne
    @triple
    def getValue(n):
    return n

    getValue(10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        def addOne(func):
            def wrapper(x):
                return func(x) + 1
            return wrapper

        def triple(func):
            def wrapper(x):
                return func(x) * 3
            return wrapper

        @addOne
        @triple
        def getValue(n):
            return n

        return getValue(10)
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 데코레이터는 아래에서 위로 적용됩니다. @addOne @triple은 triple을 먼저 적용하고 addOne을 나중에 적용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실전 패턴

    *프로퍼티와 데코레이터 활용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    프로퍼티와 데코레이터를 함께 사용하면 깔끔하고 유지보수하기 쉬운 코드를 작성할 수 있습니다. 캐싱, 유효성 검사, 접근 제어 등 다양한 패턴을 구현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 프로퍼티로 캡슐화
    - 데코레이터로 기능 확장
    - 코드 재사용성 향상
    - 깔끔한 인터페이스
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 프로퍼티 캐싱

    계산 결과를 캐싱하여 성능을 향상시킵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Fibonacci:
    def __init__(self):
    self._cache = {}

    @property
    def tenth(self):
    if 10 not in self._cache:
    self._cache[10] = self._fib(10)
    return self._cache[10]

    def _fib(self, n):
    if n <= 1:
    return n
    return self._fib(n - 1) + self._fib(n - 2)

    fib = Fibonacci()
    fib.tenth
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        class Fibonacci:
            def __init__(self):
                self._cache = {}

            @property
            def tenth(self):
                if 10 not in self._cache:
                    self._cache[10] = self._fib(10)
                return self._cache[10]

            def _fib(self, n):
                if n <= 1:
                    return n
                return self._fib(n - 1) + self._fib(n - 2)

        fib = Fibonacci()
        return fib.tenth
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 유효성 검사 프로퍼티

    프로퍼티와 setter로 안전한 접근을 보장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class User:
    def __init__(self, name, age):
    self._name = name
    self._age = age

    @property
    def age(self):
    return self._age

    @age.setter
    def age(self, value):
    if 0 <= value <= 150:
    self._age = value

    user = User('Bob', 25)
    user.age = 200
    user.age
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        class User:
            def __init__(self, name, age):
                self._name = name
                self._age = age

            @property
            def age(self):
                return self._age

            @age.setter
            def age(self, value):
                if 0 <= value <= 150:
                    self._age = value

        user = User('Bob', 25)
        user.age = 200
        return user.age
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 클래스 메서드 팩토리

    클래스 메서드로 다양한 생성 방법을 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Config:
    def __init__(self, host, port):
    self.host = host
    self.port = port

    @classmethod
    def development(cls):
    return cls('localhost', 8000)

    @classmethod
    def production(cls):
    return cls('server.com', 80)

    cfg = Config.development()
    cfg.host, cfg.port
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        class Config:
            def __init__(self, host, port):
                self.host = host
                self.port = port

            @classmethod
            def development(cls):
                return cls('localhost', 8000)

            @classmethod
            def production(cls):
                return cls('server.com', 80)

        cfg = Config.development()
        return (cfg.host, cfg.port)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 프로퍼티와 데코레이터를 적절히 조합하면 파이썬스러운 깔끔한 코드를 작성할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 25 종합 복습

    *프로퍼티와 데코레이터 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 25에서 배운 프로퍼티와 데코레이터를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 읽기 프로퍼티

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
    ### 연습: 🟢 기본2: 정적 메서드

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
    ### 연습: 🟢 기본3: 클래스 메서드

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
    ### 연습: 🟢 기본4: setter 사용

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
    ### 연습: 🟢 기본5: 간단한 데코레이터

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
    ### 연습: 🟡 응용1: 여러 프로퍼티

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
    ### 연습: 🟡 응용2: 검증 setter

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
    ### 연습: 🟡 응용3: 팩토리 메서드

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
    ### 연습: 🟡 응용4: 여러 정적 메서드

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
    ### 연습: 🟡 응용5: 데코레이터 체이닝

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
    ### 연습: 🔴 심화1: 계산 프로퍼티

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
    ### 연습: 🔴 심화2: 범위 검증

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
    ### 연습: 🔴 심화3: 파싱 팩토리

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
    ### 연습: 🔴 심화4: 유틸리티 클래스

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
    ### 연습: 🔴 심화5: 조건부 데코레이터

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
    ### 연습: 🔴 심화6: 캐싱 프로퍼티

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
    ### 연습: 🔴 심화7: 다중 팩토리

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
    ### 연습: 🔴 심화8: 로깅 데코레이터

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
    ### 연습: 🔴 심화9: 읽기전용 프로퍼티

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
    ### 연습: 🔴 심화10: 체인 데코레이터

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
