import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 16. 함수고급")


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
    # Day 16. 함수고급

    이 노트북은 `study/python/30days/day16_함수고급.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 기본값으로 매개변수 유연화
    - *args, **kwargs로 가변 인자
    - lambda로 간단한 함수
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

    - 오늘 새로 배우는 개념: 기본값 매개변수, 키워드 인자, *args, **kwargs, lambda
    - 이미 써도 되는 개념: 함수 기초
    - 오늘은 일부러 쓰지 않는 개념: import, 클래스, 데코레이터

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 기본값 매개변수

    *선택적 매개변수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    매개변수에 기본값을 지정하면 인자를 생략할 수 있습니다. def 함수명(매개변수=기본값): 형식으로 쓰며, 호출시 인자를 주지 않으면 기본값이 사용됩니다. 필수 매개변수 뒤에 와야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 매개변수=기본값 형식
    - 인자 생략 가능
    - 생략시 기본값 사용
    - 필수 매개변수 뒤 배치
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 기본

    기본값이 있는 매개변수를 정의합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def greet(name='Guest'):
    return 'Hello ' + name

    greet()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        def greet(name='Guest'):
            return 'Hello ' + name

        return greet()
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 덮어쓰기

    인자를 전달하면 기본값을 덮어씁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def greetUser(name='Guest'):
    return 'Hello ' + name

    greetUser('Alice')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        def greetUser(name='Guest'):
            return 'Hello ' + name

        return greetUser('Alice')
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 기본값

    여러 매개변수에 기본값을 설정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def createProfile(name='Unknown', age=0, city='Seoul'):
    return name + ' ' + str(age) + ' ' + city

    createProfile('Bob', 25)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        def createProfile(name='Unknown', age=0, city='Seoul'):
            return name + ' ' + str(age) + ' ' + city

        return createProfile('Bob', 25)
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 기본값이 없는 매개변수는 기본값이 있는 매개변수보다 앞에 와야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 키워드 인자

    *이름으로 인자 전달*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    키워드 인자는 매개변수 이름을 명시하여 값을 전달합니다. 함수명(매개변수=값) 형식으로 쓰며, 순서와 관계없이 전달할 수 있습니다. 코드 가독성이 높아집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 매개변수=값 형식
    - 이름으로 전달
    - 순서 무관
    - 가독성 향상
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키워드 인자

    매개변수 이름을 지정하여 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def introduce(name, age, city):
    return name + ' ' + str(age) + ' ' + city

    introduce(name='Alice', age=25, city='Seoul')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        def introduce(name, age, city):
            return name + ' ' + str(age) + ' ' + city

        return introduce(name='Alice', age=25, city='Seoul')
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 순서 변경

    키워드 인자는 순서가 바뀌어도 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def showInfo(name, age, city):
    return name + ' ' + str(age) + ' ' + city

    showInfo(city='Busan', name='Bob', age=30)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        def showInfo(name, age, city):
            return name + ' ' + str(age) + ' ' + city

        return showInfo(city='Busan', name='Bob', age=30)
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 일부만 키워드

    일부 매개변수만 키워드로 전달할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeText(first, second, third):
    return first + ' ' + second + ' ' + third

    makeText('A', third='C', second='B')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        def makeText(first, second, third):
            return first + ' ' + second + ' ' + third

        return makeText('A', third='C', second='B')
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 위치 인자는 키워드 인자보다 앞에 와야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 위치 인자와 키워드 혼용

    *유연한 호출 방식*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    위치 인자와 키워드 인자를 함께 사용할 수 있습니다. 위치 인자를 먼저 쓰고 키워드 인자를 뒤에 씁니다. 필수 매개변수는 위치로, 선택적 매개변수는 키워드로 전달하면 편리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 위치 인자 먼저
    - 키워드 인자 뒤
    - 필수/선택 구분
    - 유연한 호출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 혼용 기본

    위치 인자와 키워드 인자를 함께 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def orderFood(menu, quantity=1, spicy=False):
    result = menu + ' x' + str(quantity)
    if spicy:
    result = result + ' (spicy)'
    return result

    orderFood('Pizza', quantity=2, spicy=True)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        def orderFood(menu, quantity=1, spicy=False):
            result = menu + ' x' + str(quantity)
            if spicy:
                result = result + ' (spicy)'
            return result

        return orderFood('Pizza', quantity=2, spicy=True)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 일부 생략

    기본값이 있는 매개변수는 생략할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def bookTicket(destination, passengers=1, classType='economy'):
    return destination + ' ' + str(passengers) + ' ' + classType

    bookTicket('Tokyo', passengers=2)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        def bookTicket(destination, passengers=1, classType='economy'):
            return destination + ' ' + str(passengers) + ' ' + classType

        return bookTicket('Tokyo', passengers=2)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 선택적 사용

    필요한 매개변수만 키워드로 지정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def setConfig(host, port=8080, debug=False, timeout=30):
    return host + ':' + str(port) + ' debug=' + str(debug)

    setConfig('localhost', debug=True)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        def setConfig(host, port=8080, debug=False, timeout=30):
            return host + ':' + str(port) + ' debug=' + str(debug)

        return setConfig('localhost', debug=True)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 기본값이 있는 매개변수는 키워드로 전달하면 가독성이 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## *args 기본

    *가변 위치 인자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    *args는 임의 개수의 위치 인자를 받습니다. def 함수명(*args): 형식으로 쓰며, args는 튜플로 전달됩니다. 몇 개의 인자가 올지 모를 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - *args로 가변 인자
    - 튜플로 전달됨
    - 개수 제한 없음
    - for문으로 순회 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### *args 기본

    여러 개의 인자를 받아 처리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def sumAll(*args):
    total = 0
    for num in args:
    total = total + num
    return total

    sumAll(1, 2, 3, 4, 5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        def sumAll(*args):
            total = 0
            for num in args:
                total = total + num
            return total

        return sumAll(1, 2, 3, 4, 5)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 개수 확인

    전달된 인자의 개수를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def countArgs(*args):
    return len(args)

    countArgs(10, 20, 30)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        def countArgs(*args):
            return len(args)

        return countArgs(10, 20, 30)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 인자

    args는 튜플이므로 인덱싱이 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getFirst(*args):
    if len(args) > 0:
    return args[0]
    return None

    getFirst(100, 200, 300)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        def getFirst(*args):
            if len(args) > 0:
                return args[0]
            return None

        return getFirst(100, 200, 300)
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > args는 관례적인 이름이며, 다른 이름을 사용해도 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## *args 활용

    *일반 매개변수와 혼용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    *args는 일반 매개변수와 함께 사용할 수 있습니다. 일반 매개변수를 먼저 쓰고 *args를 뒤에 씁니다. 필수 인자와 선택적 인자를 함께 받을 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 일반 매개변수 + *args
    - 일반 매개변수 먼저
    - *args는 나머지 모두
    - 유연한 인자 처리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 필수 + 가변

    필수 매개변수와 *args를 함께 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def makeList(first, *rest):
    result = [first]
    for item in rest:
    result.append(item)
    return result

    makeList('a', 'b', 'c', 'd')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0047():
        def makeList(first, *rest):
            result = [first]
            for item in rest:
                result.append(item)
            return result

        return makeList('a', 'b', 'c', 'd')
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연산 적용

    첫 번째 인자를 나머지에 적용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def multiplyAll(multiplier, *numbers):
    results = []
    for num in numbers:
    results.append(num * multiplier)
    return results

    multiplyAll(3, 1, 2, 3, 4)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        def multiplyAll(multiplier, *numbers):
            results = []
            for num in numbers:
                results.append(num * multiplier)
            return results

        return multiplyAll(3, 1, 2, 3, 4)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 평균 계산

    레이블과 함께 평균을 계산합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def average(label, *values):
    total = 0
    for val in values:
    total = total + val
    avg = total / len(values)
    return label + ': ' + str(avg)

    average('Score', 80, 90, 85, 88)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        def average(label, *values):
            total = 0
            for val in values:
                total = total + val
            avg = total / len(values)
            return label + ': ' + str(avg)

        return average('Score', 80, 90, 85, 88)
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > *args 뒤에는 키워드 전용 매개변수만 올 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## **kwargs 기본

    *가변 키워드 인자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    **kwargs는 임의 개수의 키워드 인자를 받습니다. def 함수명(**kwargs): 형식으로 쓰며, kwargs는 딕셔너리로 전달됩니다. 키-값 쌍을 여러 개 받을 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - **kwargs로 가변 키워드
    - 딕셔너리로 전달됨
    - 키=값 형식으로 호출
    - 개수 제한 없음
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### **kwargs 기본

    키워드 인자를 딕셔너리로 받습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def printInfo(**kwargs):
    result = ''
    for key in kwargs:
    result = result + key + '=' + str(kwargs[key]) + ' '
    return result

    printInfo(name='Alice', age=25, city='Seoul')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0057():
        def printInfo(**kwargs):
            result = ''
            for key in kwargs:
                result = result + key + '=' + str(kwargs[key]) + ' '
            return result

        return printInfo(name='Alice', age=25, city='Seoul')
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 추출

    딕셔너리처럼 값을 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getValue(**kwargs):
    if 'name' in kwargs:
    return kwargs['name']
    return 'Unknown'

    getValue(name='Bob', age=30)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        def getValue(**kwargs):
            if 'name' in kwargs:
                return kwargs['name']
            return 'Unknown'

        return getValue(name='Bob', age=30)
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 개수 확인

    전달된 키워드 인자의 개수를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def countKwargs(**kwargs):
    return len(kwargs)

    countKwargs(a=1, b=2, c=3, d=4)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        def countKwargs(**kwargs):
            return len(kwargs)

        return countKwargs(a=1, b=2, c=3, d=4)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > kwargs도 관례적인 이름이며, 다른 이름을 사용해도 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## **kwargs 활용

    *일반 매개변수와 혼용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    **kwargs는 일반 매개변수, *args와 함께 사용할 수 있습니다. 순서는 일반 매개변수, *args, **kwargs입니다. 매우 유연한 함수를 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 일반 + *args + **kwargs
    - 순서 지켜야 함
    - 매우 유연한 호출
    - 옵션 처리에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 필수 + 키워드

    필수 매개변수와 **kwargs를 함께 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def createUser(userId, **options):
    info = 'User: ' + userId
    if 'name' in options:
    info = info + ' Name: ' + options['name']
    if 'email' in options:
    info = info + ' Email: ' + options['email']
    return info

    createUser('user123', name='Alice', email='alice@example.com')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0067():
        def createUser(userId, **options):
            info = 'User: ' + userId
            if 'name' in options:
                info = info + ' Name: ' + options['name']
            if 'email' in options:
                info = info + ' Email: ' + options['email']
            return info

        return createUser('user123', name='Alice', email='alice@example.com')
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값과 kwargs

    기본값 매개변수와 **kwargs를 함께 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def configure(mode='dev', **settings):
    config = 'Mode: ' + mode
    for key in settings:
    config = config + ' ' + key + '=' + str(settings[key])
    return config

    configure('prod', host='localhost', port=8080, debug=False)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0069():
        def configure(mode='dev', **settings):
            config = 'Mode: ' + mode
            for key in settings:
                config = config + ' ' + key + '=' + str(settings[key])
            return config

        return configure('prod', host='localhost', port=8080, debug=False)
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 적용

    kwargs에서 값을 가져오되 없으면 기본값을 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def getConfig(**config):
    host = config.get('host', 'localhost')
    port = config.get('port', 8080)
    return host + ':' + str(port)

    getConfig(host='192.168.1.1')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        def getConfig(**config):
            host = config.get('host', 'localhost')
            port = config.get('port', 8080)
            return host + ':' + str(port)

        return getConfig(host='192.168.1.1')
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > **kwargs는 설정이나 옵션을 받을 때 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## *args와 **kwargs 함께

    *모든 인자 받기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    *args와 **kwargs를 함께 사용하면 모든 종류의 인자를 받을 수 있습니다. def 함수명(*args, **kwargs): 형식으로 쓰며, 위치 인자는 args로, 키워드 인자는 kwargs로 전달됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - *args, **kwargs 순서
    - 모든 인자 수용
    - 위치 인자 → args
    - 키워드 인자 → kwargs
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 모든 인자

    위치 인자와 키워드 인자를 모두 받습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def flexibleFunc(*args, **kwargs):
    posCount = len(args)
    kwCount = len(kwargs)
    return posCount, kwCount

    flexibleFunc(1, 2, 3, name='Alice', age=25)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0077():
        def flexibleFunc(*args, **kwargs):
            posCount = len(args)
            kwCount = len(kwargs)
            return posCount, kwCount

        return flexibleFunc(1, 2, 3, name='Alice', age=25)
    _snippet_0077()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 일반 + args + kwargs

    일반 매개변수와 함께 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def process(required, *args, **kwargs):
    result = 'Required: ' + str(required)
    result = result + ' Args: ' + str(len(args))
    result = result + ' Kwargs: ' + str(len(kwargs))
    return result

    process('data', 1, 2, 3, flag=True, mode='fast')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0079():
        def process(required, *args, **kwargs):
            result = 'Required: ' + str(required)
            result = result + ' Args: ' + str(len(args))
            result = result + ' Kwargs: ' + str(len(kwargs))
            return result

        return process('data', 1, 2, 3, flag=True, mode='fast')
    _snippet_0079()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 인자 합치기

    모든 인자를 하나의 리스트로 합칩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def combineAll(*args, **kwargs):
    combined = []
    for arg in args:
    combined.append(arg)
    for key in kwargs:
    combined.append(kwargs[key])
    return combined

    combineAll(1, 2, 3, x=10, y=20)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0081():
        def combineAll(*args, **kwargs):
            combined = []
            for arg in args:
                combined.append(arg)
            for key in kwargs:
                combined.append(kwargs[key])
            return combined

        return combineAll(1, 2, 3, x=10, y=20)
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 매우 유연하지만 과도한 사용은 코드 가독성을 해칠 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## lambda 기본

    *익명 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    lambda는 이름 없는 함수를 만듭니다. lambda 매개변수: 표현식 형식으로 쓰며, 표현식의 결과가 자동으로 반환됩니다. 간단한 함수를 한 줄로 만들 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - lambda 매개변수: 표현식
    - 이름 없는 함수
    - 한 줄로 정의
    - 자동 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### lambda 기본

    간단한 lambda 함수를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    square = lambda x: x * x
    square(5)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0087():
        square = lambda x: x * x
        return square(5)
    _snippet_0087()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 매개변수

    여러 매개변수를 받는 lambda입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    add = lambda a, b: a + b
    add(10, 20)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0089():
        add = lambda a, b: a + b
        return add(10, 20)
    _snippet_0089()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 즉시 호출

    lambda를 정의하고 바로 호출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    (lambda x: x * 3)(7)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0091():
        return (lambda x: x * 3)(7)
    _snippet_0091()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > lambda는 한 줄 표현식만 가능하며, 복잡한 로직에는 일반 함수를 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## lambda 활용

    *조건식과 함께*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    lambda에서 조건식(삼항 연산자)을 사용할 수 있습니다. lambda 매개변수: 값1 if 조건 else 값2 형식으로 쓰며, 조건에 따라 다른 값을 반환할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 조건식 사용 가능
    - 값1 if 조건 else 값2
    - 간단한 조건 분기
    - 리스트와 함께 활용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건식 lambda

    조건에 따라 다른 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
    checkEven(8)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0097():
        checkEven = lambda n: 'even' if n % 2 == 0 else 'odd'
        return checkEven(8)
    _snippet_0097()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최대값

    두 값 중 큰 값을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    maxVal = lambda a, b: a if a > b else b
    maxVal(15, 23)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0099():
        maxVal = lambda a, b: a if a > b else b
        return maxVal(15, 23)
    _snippet_0099()
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
    absVal = lambda x: x if x >= 0 else -x
    absVal(-42)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0101():
        absVal = lambda x: x if x >= 0 else -x
        return absVal(-42)
    _snippet_0101()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 복잡한 조건은 lambda보다 일반 함수가 읽기 쉽습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 16 종합 복습

    *함수 고급 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 16에서 배운 함수 고급을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 기본값

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
    ### 연습: 🟢 기본2: 키워드 인자

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
    ### 연습: 🟢 기본3: *args

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
    ### 연습: 🟢 기본4: **kwargs

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
    ### 연습: 🟢 기본5: lambda

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
    ### 연습: 🟡 응용1: 설정 함수

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
    ### 연습: 🟡 응용2: 가변 평균

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
    ### 연습: 🟡 응용3: 문자열 조합

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
    ### 연습: 🟡 응용4: lambda 필터

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
    ### 연습: 🟡 응용5: 복합 인자

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
    ### 연습: 🔴 심화1-1: 옵션 병합

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
    ### 연습: 🔴 심화1-2: 검증 함수

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
    ### 연습: 🔴 심화2-1: 최대값 찾기

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
    ### 연습: 🔴 심화2-2: 최대값과 최소값

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
    ### 연습: 🔴 심화3-1: 범위 필터

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
    ### 연습: 🔴 심화3-2: 변환 함수

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
    ### 연습: 🔴 심화4-1: 딕셔너리 빌더

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
    ### 연습: 🔴 심화4-2: 조건부 필터

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
    ### 연습: 🔴 심화5-1: 함수 체이닝

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
    ### 연습: 🔴 심화5-2: 함수 리스트

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
