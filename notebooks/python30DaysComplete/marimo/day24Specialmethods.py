import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 24. 특수 메서드")


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
    # Day 24. 특수 메서드

    이 노트북은 `study/python/30days/day24_특수메서드.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - __str__과 __repr__로 문자열 표현
    - __len__으로 길이 정의
    - __add__, __eq__로 연산자 구현
    - __getitem__으로 인덱싱 지원

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

    - 오늘 새로 배우는 개념: __str__, __repr__, __len__, __add__, __eq__, __getitem__
    - 이미 써도 되는 개념: 클래스 전체
    - 오늘은 일부러 쓰지 않는 개념: 데코레이터, 메타클래스

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __str__ 메서드

    *사람이 읽기 쉬운 문자열 표현*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __str__ 메서드는 객체를 문자열로 변환할 때 호출됩니다. str(객체)나 print(객체)를 사용하면 자동으로 __str__이 호출되어 사람이 읽기 쉬운 형태로 출력됩니다. 이 메서드를 정의하지 않으면 기본적으로 객체의 메모리 주소가 출력됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __str__(self): 형식
    - str(), print()에서 자동 호출
    - 사용자 친화적인 출력
    - 문자열 반환 필수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __str__

    __str__을 정의하여 객체를 문자열로 표현합니다.
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

    def __str__(self):
    return self.title + ' by ' + self.author

    book = Book('Python Guide', 'Kim')
    str(book)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        class Book:
            def __init__(self, title, author):
                self.title = title
                self.author = author

            def __str__(self):
                return self.title + ' by ' + self.author

        book = Book('Python Guide', 'Kim')
        return str(book)
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 상세한 문자열

    여러 속성을 조합하여 정보를 제공합니다.
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

    def __str__(self):
    return self.name + ': ' + str(self.price) + '원'

    item = Product('Laptop', 1500000)
    str(item)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        class Product:
            def __init__(self, name, price):
                self.name = name
                self.price = price

            def __str__(self):
                return self.name + ': ' + str(self.price) + '원'

        item = Product('Laptop', 1500000)
        return str(item)
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 문자열

    상태에 따라 다른 문자열을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Account:
    def __init__(self, owner, balance):
    self.owner = owner
    self.balance = balance

    def __str__(self):
    status = 'positive' if self.balance >= 0 else 'negative'
    return self.owner + ' (' + status + ')'

    acc = Account('Alice', -1000)
    str(acc)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        class Account:
            def __init__(self, owner, balance):
                self.owner = owner
                self.balance = balance

            def __str__(self):
                status = 'positive' if self.balance >= 0 else 'negative'
                return self.owner + ' (' + status + ')'

        acc = Account('Alice', -1000)
        return str(acc)
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __str__은 최종 사용자를 위한 읽기 쉬운 출력을 만드는 데 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __repr__ 메서드

    *개발자를 위한 명확한 표현*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __repr__ 메서드는 객체의 공식적인 문자열 표현을 정의합니다. repr(객체)를 호출하거나 인터프리터에서 객체를 직접 입력하면 호출됩니다. 주로 디버깅이나 로깅에 사용되며, 가능하면 객체를 재생성할 수 있는 형태의 문자열을 반환해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __repr__(self): 형식
    - repr()에서 자동 호출
    - 개발자용 명확한 표현
    - 디버깅과 로깅에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __repr__

    객체 정보를 명확하게 표현합니다.
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

    def __repr__(self):
    return 'Point(' + str(self.x) + ', ' + str(self.y) + ')'

    pt = Point(3, 4)
    repr(pt)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __repr__(self):
                return 'Point(' + str(self.x) + ', ' + str(self.y) + ')'

        pt = Point(3, 4)
        return repr(pt)
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 재생성 가능한 표현

    반환된 문자열로 객체를 재생성할 수 있게 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Color:
    def __init__(self, r, g, b):
    self.r = r
    self.g = g
    self.b = b

    def __repr__(self):
    return 'Color(' + str(self.r) + ', ' + str(self.g) + ', ' + str(self.b) + ')'

    color = Color(255, 128, 0)
    repr(color)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        class Color:
            def __init__(self, r, g, b):
                self.r = r
                self.g = g
                self.b = b

            def __repr__(self):
                return 'Color(' + str(self.r) + ', ' + str(self.g) + ', ' + str(self.b) + ')'

        color = Color(255, 128, 0)
        return repr(color)
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### __str__과 __repr__ 함께

    두 메서드를 모두 정의할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class User:
    def __init__(self, name, userId):
    self.name = name
    self.userId = userId

    def __str__(self):
    return self.name

    def __repr__(self):
    return 'User(' + str(self.userId) + ')'

    user = User('Bob', 1001)
    str(user), repr(user)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        class User:
            def __init__(self, name, userId):
                self.name = name
                self.userId = userId

            def __str__(self):
                return self.name

            def __repr__(self):
                return 'User(' + str(self.userId) + ')'

        user = User('Bob', 1001)
        return (str(user), repr(user))
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __str__이 없으면 __repr__이 대신 사용됩니다. 하나만 정의한다면 __repr__을 권장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __len__ 메서드

    *객체의 길이 정의*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __len__ 메서드는 객체의 길이를 정의합니다. len(객체)를 호출하면 자동으로 __len__이 호출되어 정수값을 반환합니다. 컬렉션 타입 클래스를 만들 때 매우 유용하며, 반드시 음이 아닌 정수를 반환해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __len__(self): 형식
    - len()에서 자동 호출
    - 정수값 반환 필수
    - 컬렉션 클래스에 필수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __len__

    내부 리스트의 길이를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Playlist:
    def __init__(self):
    self.songs = []

    def add(self, song):
    self.songs.append(song)

    def __len__(self):
    return len(self.songs)

    pl = Playlist()
    pl.add('Song A')
    pl.add('Song B')
    len(pl)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        class Playlist:
            def __init__(self):
                self.songs = []

            def add(self, song):
                self.songs.append(song)

            def __len__(self):
                return len(self.songs)

        pl = Playlist()
        pl.add('Song A')
        pl.add('Song B')
        return len(pl)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 커스텀 길이 계산

    특정 기준으로 길이를 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class TextDoc:
    def __init__(self, content):
    self.content = content

    def __len__(self):
    return len(self.content.split())

    doc = TextDoc('Hello world from Python')
    len(doc)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        class TextDoc:
            def __init__(self, content):
                self.content = content

            def __len__(self):
                return len(self.content.split())

        doc = TextDoc('Hello world from Python')
        return len(doc)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 속성 기반 길이

    여러 속성을 조합하여 길이를 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Inventory:
    def __init__(self):
    self.items = []

    def add(self, item, qty):
    self.items.append({'item': item, 'qty': qty})

    def __len__(self):
    total = 0
    for entry in self.items:
    total = total + entry['qty']
    return total

    inv = Inventory()
    inv.add('apple', 5)
    inv.add('banana', 3)
    len(inv)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        class Inventory:
            def __init__(self):
                self.items = []

            def add(self, item, qty):
                self.items.append({'item': item, 'qty': qty})

            def __len__(self):
                total = 0
                for entry in self.items:
                    total = total + entry['qty']
                return total

        inv = Inventory()
        inv.add('apple', 5)
        inv.add('banana', 3)
        return len(inv)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __len__은 bool() 판단에도 사용됩니다. len이 0이면 False, 아니면 True입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __add__ 메서드

    *+ 연산자 구현*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __add__ 메서드는 + 연산자의 동작을 정의합니다. a + b를 실행하면 a.__add__(b)가 호출됩니다. 이를 통해 사용자 정의 클래스에서도 덧셈 연산을 의미있게 구현할 수 있습니다. 새로운 객체를 반환하는 것이 일반적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __add__(self, other): 형식
    - + 연산자에서 자동 호출
    - 새 객체 반환 권장
    - 연산자 오버로딩
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __add__

    두 벡터를 더합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Vector:
    def __init__(self, x, y):
    self.x = x
    self.y = y

    def __add__(self, other):
    return Vector(self.x + other.x, self.y + other.y)

    def __repr__(self):
    return 'Vector(' + str(self.x) + ', ' + str(self.y) + ')'

    v1 = Vector(1, 2)
    v2 = Vector(3, 4)
    v3 = v1 + v2
    repr(v3)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __add__(self, other):
                return Vector(self.x + other.x, self.y + other.y)

            def __repr__(self):
                return 'Vector(' + str(self.x) + ', ' + str(self.y) + ')'

        v1 = Vector(1, 2)
        v2 = Vector(3, 4)
        v3 = v1 + v2
        return repr(v3)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 결합

    객체를 더해서 새로운 문자열을 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Name:
    def __init__(self, text):
    self.text = text

    def __add__(self, other):
    return Name(self.text + ' ' + other.text)

    def __str__(self):
    return self.text

    first = Name('John')
    last = Name('Doe')
    full = first + last
    str(full)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        class Name:
            def __init__(self, text):
                self.text = text

            def __add__(self, other):
                return Name(self.text + ' ' + other.text)

            def __str__(self):
                return self.text

        first = Name('John')
        last = Name('Doe')
        full = first + last
        return str(full)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 누적

    카운터를 더해서 합산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Counter:
    def __init__(self, val):
    self.val = val

    def __add__(self, other):
    return Counter(self.val + other.val)

    cnt1 = Counter(10)
    cnt2 = Counter(20)
    combined = cnt1 + cnt2
    combined.val
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        class Counter:
            def __init__(self, val):
                self.val = val

            def __add__(self, other):
                return Counter(self.val + other.val)

        cnt1 = Counter(10)
        cnt2 = Counter(20)
        combined = cnt1 + cnt2
        return combined.val
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __sub__, __mul__, __div__ 등으로 다른 연산자도 구현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __eq__ 메서드

    *== 연산자 구현*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __eq__ 메서드는 == 연산자의 동작을 정의합니다. a == b를 실행하면 a.__eq__(b)가 호출됩니다. 기본적으로 객체는 같은 메모리 주소일 때만 같다고 판단하지만, __eq__를 정의하면 값 기반 비교가 가능합니다. True나 False를 반환해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __eq__(self, other): 형식
    - == 연산자에서 자동 호출
    - True/False 반환
    - 값 기반 비교 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __eq__

    좌표가 같으면 같은 점으로 판단합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Location:
    def __init__(self, x, y):
    self.x = x
    self.y = y

    def __eq__(self, other):
    return self.x == other.x and self.y == other.y

    loc1 = Location(1, 2)
    loc2 = Location(1, 2)
    loc1 == loc2
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        class Location:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __eq__(self, other):
                return self.x == other.x and self.y == other.y

        loc1 = Location(1, 2)
        loc2 = Location(1, 2)
        return loc1 == loc2
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 비교

    내용이 같으면 같은 객체로 판단합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Tag:
    def __init__(self, name):
    self.name = name

    def __eq__(self, other):
    return self.name == other.name

    tag1 = Tag('python')
    tag2 = Tag('python')
    tag1 == tag2
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        class Tag:
            def __init__(self, name):
                self.name = name

            def __eq__(self, other):
                return self.name == other.name

        tag1 = Tag('python')
        tag2 = Tag('python')
        return tag1 == tag2
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 복합 조건 비교

    여러 속성을 모두 비교합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Card:
    def __init__(self, rank, suit):
    self.rank = rank
    self.suit = suit

    def __eq__(self, other):
    return self.rank == other.rank and self.suit == other.suit

    card1 = Card('A', 'hearts')
    card2 = Card('A', 'spades')
    card1 == card2
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        class Card:
            def __init__(self, rank, suit):
                self.rank = rank
                self.suit = suit

            def __eq__(self, other):
                return self.rank == other.rank and self.suit == other.suit

        card1 = Card('A', 'hearts')
        card2 = Card('A', 'spades')
        return card1 == card2
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __ne__(!=), __lt__(<), __le__(<=), __gt__(>), __ge__(>=)도 구현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## __getitem__ 메서드

    *인덱싱과 슬라이싱 지원*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    __getitem__ 메서드는 객체[키] 형태의 인덱싱을 가능하게 합니다. obj[key]를 실행하면 obj.__getitem__(key)가 호출됩니다. 리스트처럼 동작하는 커스텀 컨테이너를 만들 때 필수적이며, 슬라이싱도 지원할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __getitem__(self, key): 형식
    - obj[key]에서 자동 호출
    - 인덱싱과 슬라이싱 지원
    - 컨테이너 인터페이스
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 __getitem__

    인덱스로 내부 리스트에 접근합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Items:
    def __init__(self):
    self.data = []

    def add(self, item):
    self.data.append(item)

    def __getitem__(self, idx):
    return self.data[idx]

    items = Items()
    items.add('first')
    items.add('second')
    items[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        class Items:
            def __init__(self):
                self.data = []

            def add(self, item):
                self.data.append(item)

            def __getitem__(self, idx):
                return self.data[idx]

        items = Items()
        items.add('first')
        items.add('second')
        return items[0]
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리형 접근

    키로 값을 조회합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Config:
    def __init__(self):
    self.settings = {}

    def set(self, key, val):
    self.settings[key] = val

    def __getitem__(self, key):
    return self.settings.get(key, 'Not found')

    cfg = Config()
    cfg.set('host', 'localhost')
    cfg['host']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        class Config:
            def __init__(self):
                self.settings = {}

            def set(self, key, val):
                self.settings[key] = val

            def __getitem__(self, key):
                return self.settings.get(key, 'Not found')

        cfg = Config()
        cfg.set('host', 'localhost')
        return cfg['host']
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산된 값 반환

    인덱스에 따라 계산된 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Fibonacci:
    def __getitem__(self, n):
    if n <= 1:
    return n
    a = 0
    b = 1
    for i in range(2, n + 1):
    c = a + b
    a = b
    b = c
    return b

    fib = Fibonacci()
    fib[7]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        class Fibonacci:
            def __getitem__(self, n):
                if n <= 1:
                    return n
                a = 0
                b = 1
                for i in range(2, n + 1):
                    c = a + b
                    a = b
                    b = c
                return b

        fib = Fibonacci()
        return fib[7]
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __setitem__과 __delitem__으로 obj[key] = val과 del obj[key]도 구현할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 특수 메서드 실전

    *여러 특수 메서드 조합*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    실제 클래스는 여러 특수 메서드를 함께 구현하여 파이썬 내장 타입처럼 동작하게 만듭니다. __str__, __len__, __getitem__ 등을 조합하면 강력하고 직관적인 인터페이스를 제공할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 여러 특수 메서드 조합
    - 내장 타입처럼 동작
    - 직관적인 인터페이스
    - 파이썬스러운 코드
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 완전한 컬렉션 클래스

    여러 특수 메서드를 함께 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class TodoList:
    def __init__(self):
    self.tasks = []

    def add(self, task):
    self.tasks.append(task)

    def __len__(self):
    return len(self.tasks)

    def __getitem__(self, idx):
    return self.tasks[idx]

    def __str__(self):
    return str(len(self.tasks)) + ' tasks'

    todo = TodoList()
    todo.add('Study')
    todo.add('Code')
    len(todo), str(todo), todo[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0067():
        class TodoList:
            def __init__(self):
                self.tasks = []

            def add(self, task):
                self.tasks.append(task)

            def __len__(self):
                return len(self.tasks)

            def __getitem__(self, idx):
                return self.tasks[idx]

            def __str__(self):
                return str(len(self.tasks)) + ' tasks'

        todo = TodoList()
        todo.add('Study')
        todo.add('Code')
        return (len(todo), str(todo), todo[0])
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 수학적 객체

    덧셈과 비교를 모두 지원합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Money:
    def __init__(self, amount):
    self.amount = amount

    def __add__(self, other):
    return Money(self.amount + other.amount)

    def __eq__(self, other):
    return self.amount == other.amount

    def __str__(self):
    return str(self.amount) + '원'

    m1 = Money(1000)
    m2 = Money(2000)
    m3 = m1 + m2
    str(m3)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0069():
        class Money:
            def __init__(self, amount):
                self.amount = amount

            def __add__(self, other):
                return Money(self.amount + other.amount)

            def __eq__(self, other):
                return self.amount == other.amount

            def __str__(self):
                return str(self.amount) + '원'

        m1 = Money(1000)
        m2 = Money(2000)
        m3 = m1 + m2
        return str(m3)
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 체이닝 가능한 클래스

    여러 연산을 연결할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    class Chain:
    def __init__(self, val):
    self.val = val

    def __add__(self, other):
    return Chain(self.val + other.val)

    def __repr__(self):
    return 'Chain(' + str(self.val) + ')'

    c1 = Chain(10)
    c2 = Chain(20)
    c3 = Chain(30)
    chained = c1 + c2 + c3
    repr(chained)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        class Chain:
            def __init__(self, val):
                self.val = val

            def __add__(self, other):
                return Chain(self.val + other.val)

            def __repr__(self):
                return 'Chain(' + str(self.val) + ')'

        c1 = Chain(10)
        c2 = Chain(20)
        c3 = Chain(30)
        chained = c1 + c2 + c3
        return repr(chained)
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 특수 메서드를 잘 활용하면 사용자 정의 클래스가 파이썬 내장 타입만큼 자연스럽게 동작합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 24 종합 복습

    *특수 메서드 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 24에서 배운 특수 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: __str__ 구현

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
    ### 연습: 🟢 기본2: __repr__ 구현

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
    ### 연습: 🟢 기본3: __len__ 구현

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
    ### 연습: 🟢 기본4: __add__ 구현

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
    ### 연습: 🟢 기본5: __eq__ 구현

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
    ### 연습: 🟡 응용1: __str__과 __repr__ 함께

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
    ### 연습: 🟡 응용2: 단어 수 __len__

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
    ### 연습: 🟡 응용3: 벡터 덧셈

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
    ### 연습: 🟡 응용4: __getitem__ 리스트형

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
    ### 연습: 🟡 응용5: 복합 비교

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
    ### 연습: 🔴 심화1: 문자열 포맷팅

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
    ### 연습: 🔴 심화2: 커스텀 길이

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
    ### 연습: 🔴 심화3: 연산 체이닝

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
    ### 연습: 🔴 심화4: 딕셔너리형 접근

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
    ### 연습: 🔴 심화5: 범위 체크

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
    ### 연습: 🔴 심화6: 시퀀스 프로토콜

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
    ### 연습: 🔴 심화7: 불변 객체

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
    ### 연습: 🔴 심화8: 스마트 컨테이너

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
    ### 연습: 🔴 심화9: 비교 연산자

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
    ### 연습: 🔴 심화10: 완전한 자료구조

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
