import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 18. 모듈과import")


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
    # Day 18. 모듈과import

    이 노트북은 `study/python/30days/day18_모듈과import.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    import, from import, as로 표준 라이브러리 기능을 불러옵니다.

    ## 왜 중요한가

    모든 기능을 직접 만들 필요는 없습니다. 모듈을 쓰면 이미 검증된 도구를 가져올 수 있습니다.

    ## 생각 모델

    모듈은 도구 상자입니다. import는 상자를 가져오고, from import는 그 안의 특정 도구를 꺼냅니다.

    ## 오늘 배우는 것

    - import로 모듈 가져오기
    - from, as로 유연하게
    - math, random, datetime 활용
    - 표준 라이브러리 사용

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

    - 오늘 새로 배우는 개념: import, from import, as 별칭, math 모듈, random 모듈, datetime 모듈, os 모듈, sys 모듈
    - 이미 써도 되는 개념: 함수 전체
    - 오늘은 일부러 쓰지 않는 개념: 클래스, 외부 라이브러리

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 어떤 이름으로 모듈을 부를지, 점 뒤에 어떤 기능을 쓸지 확인합니다.
    - 실행 중: math, random, datetime처럼 서로 다른 모듈의 호출 모양을 비교합니다.
    - 연습 초점: 계산, 무작위 선택, 날짜 확인을 표준 라이브러리로 해결합니다.
    - 막히면: ImportError나 AttributeError가 나면 모듈 이름과 기능 이름을 분리해서 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## import 기본

    *모듈 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    모듈은 함수와 변수를 담은 파이썬 파일입니다. import 모듈명으로 모듈을 가져오고, 모듈명.함수명()으로 사용합니다. 파이썬은 많은 표준 모듈을 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - import 모듈명 형식
    - 모듈명.함수명() 사용
    - 표준 라이브러리 제공
    - 코드 재사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### math 모듈

    math 모듈을 가져와 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    import math

    math.sqrt(16)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        import math

        return math.sqrt(16)
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 함수 사용

    모듈의 여러 함수를 사용할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    # import math  # 이미 위 셀에서 import한 경우 제거

    radius = 5
    area = math.pi * radius ** 2
    area
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        # import math  # 이미 위 셀에서 import한 경우 제거

        radius = 5
        area = math.pi * radius ** 2
        return area
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 모듈

    여러 모듈을 가져올 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    # import math  # 이미 위 셀에서 import한 경우 제거
    import random

    value = math.ceil(3.2)
    value
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        # import math  # 이미 위 셀에서 import한 경우 제거
        import random

        value = math.ceil(3.2)
        return value
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 처음에는 필요한 모듈을 노트북 위쪽 한 셀에 모아 import하면 흐름을 이해하기 쉽습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## from import

    *특정 함수만 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    from 모듈명 import 함수명으로 특정 함수만 가져올 수 있습니다. 모듈명 없이 함수명만으로 사용할 수 있습니다. 여러 함수를 쉼표로 구분하여 가져올 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - from 모듈명 import 함수명
    - 모듈명 없이 사용
    - 쉼표로 여러 함수
    - 코드 간결화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 직접 사용

    from import로 함수를 직접 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import sqrt

    sqrt(25)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        from math import sqrt

        return sqrt(25)
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 함수 가져오기

    여러 함수를 한 번에 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import pi, ceil, floor

    ceil(3.2), floor(3.8)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        from math import pi, ceil, floor

        return (ceil(3.2), floor(3.8))
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산에 활용

    가져온 함수와 상수를 계산에 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import pi, pow

    r = 3
    volume = 4 / 3 * pi * pow(r, 3)
    volume
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        from math import pi, pow

        r = 3
        volume = 4 / 3 * pi * pow(r, 3)
        return volume
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 필요한 함수만 가져오면 코드가 깔끔해집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## as 별칭

    *모듈/함수 이름 바꾸기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    as 키워드로 모듈이나 함수에 별칭을 붙일 수 있습니다. import 모듈명 as 별칭 또는 from 모듈명 import 함수명 as 별칭 형식입니다. 긴 이름을 짧게 만들거나 충돌을 피할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - as 별칭 형식
    - 긴 이름 단축
    - 이름 충돌 방지
    - 관습적 별칭 존재
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 모듈 별칭

    모듈에 짧은 별칭을 붙입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    import math as m

    m.sqrt(36)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        import math as m

        return m.sqrt(36)
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수 별칭

    함수에 별칭을 붙입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import sqrt as sq

    sq(49)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        from math import sqrt as sq

        return sq(49)
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 별칭

    여러 함수에 별칭을 붙입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from random import randint as rInt, choice as pick

    rInt(1, 10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        from random import randint as rInt, choice as pick

        return rInt(1, 10)
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 별칭은 짧고 의미있게 지으세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## math 모듈

    *수학 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    math 모듈은 수학 함수를 제공합니다. sqrt(제곱근), ceil(올림), floor(내림), pow(거듭제곱), pi(파이), e(자연상수) 등을 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - sqrt(): 제곱근
    - ceil(): 올림
    - floor(): 내림
    - pow(): 거듭제곱
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 제곱근

    sqrt로 제곱근을 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import sqrt

    sqrt(144)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        from math import sqrt

        return sqrt(144)
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 올림과 내림

    ceil과 floor로 올림과 내림을 합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import ceil, floor

    num = 5.7
    ceil(num), floor(num)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        from math import ceil, floor

        num = 5.7
        return (ceil(num), floor(num))
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 거듭제곱

    pow로 거듭제곱을 계산합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from math import pow

    pow(2, 10)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        from math import pow

        return pow(2, 10)
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > math.pow는 실수를 반환하고, ** 연산자는 정수도 유지합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## random 모듈

    *난수 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    random 모듈은 난수를 생성합니다. randint(정수 난수), choice(리스트에서 선택), shuffle(리스트 섞기), random(0~1 실수) 등을 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - randint(a, b): a~b 정수
    - choice(리스트): 랜덤 선택
    - shuffle(리스트): 섞기
    - random(): 0~1 실수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정수 난수

    randint로 범위 내 정수를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from random import randint

    randint(1, 100)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        from random import randint

        return randint(1, 100)
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 랜덤 선택

    choice로 리스트에서 하나를 선택합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from random import choice

    colors = ['red', 'green', 'blue', 'yellow']
    choice(colors)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        from random import choice

        colors = ['red', 'green', 'blue', 'yellow']
        return choice(colors)
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 실수 난수

    random()으로 0과 1 사이의 실수를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from random import random

    random()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        from random import random

        return random()
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 난수는 실행할 때마다 다른 값이 나옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## datetime 모듈

    *날짜와 시간*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    datetime 모듈은 날짜와 시간을 다룹니다. datetime.now(현재 시각), date(날짜), time(시간), timedelta(시간 차이) 등을 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - datetime.now(): 현재 시각
    - date(): 날짜 생성
    - time(): 시간 생성
    - timedelta(): 시간 차이
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 현재 시각

    datetime.now()로 현재 시각을 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from datetime import datetime

    now = datetime.now()
    now.year, now.month, now.day
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        from datetime import datetime

        now = datetime.now()
        return (now.year, now.month, now.day)
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 날짜 생성

    특정 날짜를 생성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    from datetime import date

    birthday = date(2000, 1, 1)
    birthday.year, birthday.month, birthday.day
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        from datetime import date

        birthday = date(2000, 1, 1)
        return (birthday.year, birthday.month, birthday.day)
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 시간 차이

    timedelta로 시간 차이를 계산합니다.

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
    tomorrow = today + timedelta(days=1)
    tomorrow.day
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        from datetime import date, timedelta

        today = date(2024, 1, 1)
        tomorrow = today + timedelta(days=1)
        return tomorrow.day
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > datetime 객체는 여러 속성과 메서드를 제공합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 18 종합 복습

    *모듈과 import 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 18에서 배운 모듈과 import를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: import

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
    ### 연습: 🟢 기본2: from import

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
    ### 연습: 🟢 기본3: as 별칭

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
    ### 연습: 🟢 기본4: random

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
    ### 연습: 🟢 기본5: datetime

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
    ### 연습: 🟡 응용1: 원의 넓이

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
    ### 연습: 🟡 응용2: 주사위

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
    ### 연습: 🟡 응용3: 올림과 내림

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
    ### 연습: 🟡 응용4: 랜덤 선택

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
    ### 연습: 🟡 응용5: 날짜 계산

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
    ### 연습: 🔴 심화1-1: 피타고라스

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
    ### 연습: 🔴 심화1-2: 구의 부피

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
    ### 연습: 🔴 심화2-1: 로또 번호

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
    ### 연습: 🔴 심화2-2: 팀 나누기

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
    ### 연습: 🔴 심화3-1: 나이 계산

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
    ### 연습: 🔴 심화3-2: D-Day 계산

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
    ### 연습: 🔴 심화4-1: 거리 계산

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
    ### 연습: 🔴 심화4-2: 각도 계산

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
    ### 연습: 🔴 심화5-1: 랜덤 비밀번호

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
    ### 연습: 🔴 심화5-2: 근무일 계산

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

    - import와 from import의 차이를 설명할 수 있다.
    - as로 별칭을 붙여 사용할 수 있다.
    - 표준 라이브러리와 외부 라이브러리의 차이를 말할 수 있다.

    ## 흔한 막힘

    - 모듈을 가져오지 않고 바로 함수 이름을 씀
    - 별칭을 만든 뒤 원래 이름으로 호출함
    - 외부 설치가 필요한 라이브러리와 표준 모듈을 혼동함

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
