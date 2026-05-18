import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 07. 리스트기초")


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
    # Day 07. 리스트기초

    이 노트북은 `study/python/30days/day07_리스트기초.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    리스트를 만들고, 순서가 있는 여러 값을 인덱싱과 슬라이싱으로 다룹니다.

    ## 왜 중요한가

    여러 값을 한 덩어리로 다루는 순간부터 프로그램은 실제 데이터를 처리할 수 있습니다.

    ## 생각 모델

    리스트는 칸이 여러 개인 상자입니다. 각 칸에는 순서 번호가 있고 값은 바꿀 수 있습니다.

    ## 오늘 배우는 것

    - 리스트로 여러 값을 한 번에 관리
    - 인덱스로 원하는 요소에 접근
    - 슬라이싱으로 부분 리스트 추출
    - 리스트 수정과 연산

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

    - 오늘 새로 배우는 개념: 리스트, 리스트 만들기, 리스트 인덱싱, 리스트 슬라이싱, 리스트 값 바꾸기
    - 이미 써도 되는 개념: 문자열 전체, 연산자, 인덱싱, 슬라이싱
    - 오늘은 일부러 쓰지 않는 개념: 리스트 메서드, 튜플, 딕셔너리, 집합, 직접 만드는 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 대괄호 안의 값 개수와 각 값의 위치를 먼저 셉니다.
    - 실행 중: 값을 바꾼 뒤 같은 리스트를 다시 출력해 변경이 유지되는지 확인합니다.
    - 연습 초점: 문자열, 숫자, 섞인 값을 담고 특정 위치의 값을 바꿔봅니다.
    - 막히면: IndexError가 나면 리스트 길이와 마지막 인덱스를 비교합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트란?

    *여러 값을 담는 상자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트(List)는 여러 개의 값을 순서대로 담을 수 있는 자료구조입니다. 대괄호 []로 만들고, 쉼표로 값을 구분합니다. 숫자, 문자열, 불린 등 어떤 타입의 값도 담을 수 있습니다. 리스트는 순서가 있어서 첫 번째, 두 번째 같은 위치로 값에 접근할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 대괄호 []로 생성
    - 여러 값을 쉼표로 구분
    - 순서가 있는 자료구조
    - 다양한 타입 저장 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 만들기

    대괄호를 사용하여 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    items = [1, 2, 3, 4, 5]
    items
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        items = [1, 2, 3, 4, 5]
        return items
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트는 프로그래밍에서 가장 많이 사용하는 자료구조 중 하나입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다양한 리스트 생성

    *타입 제한 없이 자유롭게*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트는 숫자만, 문자열만 담을 수도 있고, 여러 타입을 섞어서 담을 수도 있습니다. 빈 리스트도 만들 수 있습니다. 리스트 안에 리스트를 넣어 중첩 리스트도 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 숫자 리스트: [1, 2, 3]
    - 문자열 리스트: ['a', 'b', 'c']
    - 혼합 리스트: [1, 'hello', True]
    - 빈 리스트: []
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 리스트

    숫자만 담은 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    nums = [10, 20, 30]
    nums
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0014():
        nums = [10, 20, 30]
        return nums
    _snippet_0014()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 리스트

    문자열만 담은 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fruits = ['사과', '바나나', '오렌지']
    fruits
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0016():
        fruits = ['사과', '바나나', '오렌지']
        return fruits
    _snippet_0016()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 혼합 리스트

    여러 타입을 섞어서 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    mixed = [1, 'hello', True, 3.14]
    mixed
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        mixed = [1, 'hello', True, 3.14]
        return mixed
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 리스트

    빈 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    empty = []
    empty
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        empty = []
        return empty
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 빈 리스트는 나중에 값을 추가할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 인덱싱

    *위치로 값 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트의 각 요소는 인덱스(위치 번호)로 접근할 수 있습니다. 인덱스는 0부터 시작합니다. 첫 번째 요소는 [0], 두 번째는 [1], 세 번째는 [2]입니다. 리스트 이름 뒤에 대괄호를 쓰고 인덱스를 넣으면 그 위치의 값을 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 인덱스는 0부터 시작
    - list[0]은 첫 번째 요소
    - list[1]은 두 번째 요소
    - 대괄호 안에 인덱스 작성
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 요소

    인덱스 0으로 첫 번째 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    basket = ['사과', '바나나', '오렌지', '포도']
    basket[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0026():
        basket = ['사과', '바나나', '오렌지', '포도']
        return basket[0]
    _snippet_0026()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 번째 요소

    인덱스 1로 두 번째 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    produce = ['사과', '바나나', '오렌지', '포도']
    produce[1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        produce = ['사과', '바나나', '오렌지', '포도']
        return produce[1]
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 세 번째 요소

    인덱스 2로 세 번째 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    snacks = ['사과', '바나나', '오렌지', '포도']
    snacks[2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        snacks = ['사과', '바나나', '오렌지', '포도']
        return snacks[2]
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트 길이보다 큰 인덱스를 사용하면 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 음수 인덱싱

    *뒤에서부터 접근하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    음수 인덱스를 사용하면 리스트의 뒤에서부터 접근할 수 있습니다. -1은 마지막 요소, -2는 뒤에서 두 번째 요소, -3은 뒤에서 세 번째 요소입니다. 리스트가 길 때 마지막 요소에 접근하는 간편한 방법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 음수 인덱스는 뒤에서부터 접근
    - list[-1]은 마지막 요소
    - list[-2]는 뒤에서 두 번째
    - 긴 리스트에서 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 요소

    음수 인덱스 -1로 마지막 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    values = [10, 20, 30, 40, 50]
    values[-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0036():
        values = [10, 20, 30, 40, 50]
        return values[-1]
    _snippet_0036()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 뒤에서 두 번째

    음수 인덱스 -2로 뒤에서 두 번째 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    digits = [10, 20, 30, 40, 50]
    digits[-2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        digits = [10, 20, 30, 40, 50]
        return digits[-2]
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 뒤에서 세 번째

    음수 인덱스 -3으로 뒤에서 세 번째 요소에 접근합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    counts = [10, 20, 30, 40, 50]
    counts[-3]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        counts = [10, 20, 30, 40, 50]
        return counts[-3]
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트 길이를 몰라도 [-1]로 마지막 요소에 접근할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 슬라이싱

    *범위로 잘라내기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    슬라이싱은 리스트의 일부분을 잘라내어 새 리스트를 만듭니다. [시작:끝] 형식으로 사용하며, 시작 인덱스부터 끝 인덱스 직전까지 가져옵니다. 시작을 생략하면 처음부터, 끝을 생략하면 끝까지 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list[시작:끝] 형식
    - 시작 인덱스 포함, 끝 인덱스 미포함
    - list[:3]은 처음부터 2번 인덱스까지
    - list[2:]는 2번 인덱스부터 끝까지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 처음부터 3개

    [:3]으로 처음부터 3개 요소를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    rainbow = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
    rainbow[:3]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0046():
        rainbow = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
        return rainbow[:3]
    _snippet_0046()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중간 범위

    [2:5]로 인덱스 2부터 4까지 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    palette = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
    palette[2:5]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        palette = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
        return palette[2:5]
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 3개

    [-3:]으로 마지막 3개 요소를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    hues = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
    hues[-3:]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        hues = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라']
        return hues[-3:]
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 슬라이싱은 원본 리스트를 변경하지 않고 새 리스트를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 슬라이싱 step

    *간격을 두고 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    슬라이싱에 step을 추가하면 지정한 간격으로 요소를 가져올 수 있습니다. [시작:끝:step] 형식으로 사용합니다. step이 2면 하나 건너 하나씩, 3이면 두 개 건너 하나씩 가져옵니다. 음수 step을 사용하면 역순으로 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list[시작:끝:step] 형식
    - step이 2면 하나 건너 가져오기
    - step이 -1이면 역순
    - list[::2]는 처음부터 끝까지 하나 건너
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 하나 건너 가져오기

    [::2]로 하나 건너 하나씩 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    sequence[::2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        sequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        return sequence[::2]
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 개 건너 가져오기

    [::3]으로 두 개 건너 하나씩 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    series = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    series[::3]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        series = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        return series[::3]
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 역순으로 가져오기

    [::-1]로 리스트를 역순으로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    chain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    chain[::-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        chain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        return chain[::-1]
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > [::-1]은 리스트를 뒤집는 간편한 방법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 수정

    *인덱스로 값 변경하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트는 수정 가능한(mutable) 자료구조입니다. 인덱스를 사용하여 특정 위치의 값을 다른 값으로 변경할 수 있습니다. list[0] = 'new value' 형식으로 할당하면 그 위치의 값이 바뀝니다. 문자열과 달리 리스트는 생성 후에도 내용을 변경할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list[인덱스] = 새값으로 수정
    - 리스트는 수정 가능(mutable)
    - 문자열은 수정 불가(immutable)
    - 원본 리스트가 직접 변경됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 수정 전

    원본 리스트를 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    before = ['사과', '바나나', '오렌지']
    print('before:', before)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        before = ['사과', '바나나', '오렌지']
        return print('before:', before)
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 수정 후

    인덱스를 사용하여 리스트의 값을 변경합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    after = ['사과', '바나나', '오렌지']
    after[1] = '딸기'
    print('after:', after)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0068():
        after = ['사과', '바나나', '오렌지']
        after[1] = '딸기'
        return print('after:', after)
    _snippet_0068()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 길이

    *len() 함수 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 리스트에 담긴 요소의 개수를 반환합니다. 리스트가 몇 개의 항목을 가지고 있는지 알아야 할 때 사용합니다. 빈 리스트의 길이는 0입니다. 리스트의 마지막 인덱스는 len(list) - 1입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len(list)로 요소 개수 확인
    - 빈 리스트는 길이가 0
    - 마지막 인덱스는 길이 - 1
    - 반복문에서 자주 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 길이

    len() 함수로 리스트 요소 개수를 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    goods = ['사과', '바나나', '오렌지', '포도', '딸기']
    len(goods)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0073():
        goods = ['사과', '바나나', '오렌지', '포도', '딸기']
        return len(goods)
    _snippet_0073()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 인덱스

    길이에서 1을 빼면 마지막 인덱스입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    treats = ['사과', '바나나', '오렌지', '포도', '딸기']
    len(treats) - 1
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0075():
        treats = ['사과', '바나나', '오렌지', '포도', '딸기']
        return len(treats) - 1
    _snippet_0075()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > len() 함수는 문자열의 길이도 확인할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 연결

    *+ 연산자로 합치기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    두 개 이상의 리스트를 + 연산자로 연결하여 하나의 긴 리스트를 만들 수 있습니다. 원본 리스트는 변경되지 않고 새로운 리스트가 생성됩니다. 여러 리스트를 순서대로 합칠 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - + 연산자로 리스트 연결
    - 원본 리스트는 변경 안됨
    - 새로운 리스트 생성
    - 순서대로 합쳐짐
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 리스트 연결

    + 연산자로 두 리스트를 연결합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    front = [1, 2, 3]
    back = [4, 5, 6]
    front + back
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0081():
        front = [1, 2, 3]
        back = [4, 5, 6]
        return front + back
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 세 리스트 연결

    + 연산자로 여러 리스트를 연결합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    first = [1, 2, 3]
    second = [4, 5, 6]
    third = [7, 8, 9]
    first + second + third
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0083():
        first = [1, 2, 3]
        second = [4, 5, 6]
        third = [7, 8, 9]
        return first + second + third
    _snippet_0083()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트 + 리스트만 가능합니다. 리스트 + 숫자는 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 반복

    ** 연산자로 복제하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    리스트에 * 연산자를 사용하면 리스트를 여러 번 반복한 새 리스트를 만들 수 있습니다. list * 3은 리스트를 3번 반복합니다. 같은 값을 여러 개 가진 리스트를 만들 때 편리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - * 연산자로 리스트 반복
    - list * n은 n번 반복
    - 새로운 리스트 생성
    - 초기값 설정에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 3번 반복

    * 연산자로 리스트를 3번 반복합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    base = [1, 2, 3]
    base * 3
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0089():
        base = [1, 2, 3]
        return base * 3
    _snippet_0089()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 0으로 채우기

    [0] * 5로 0이 5개인 리스트를 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    zeros = [0] * 5
    zeros
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0091():
        zeros = [0] * 5
        return zeros
    _snippet_0091()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > [0] * 10으로 0이 10개인 리스트를 쉽게 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## in/not in 연산자

    *요소 포함 여부 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in 연산자는 특정 값이 리스트에 있는지 확인합니다. not in은 그 반대입니다. 결과는 True 또는 False입니다. 리스트에서 값을 찾을 때 인덱스를 모두 확인할 필요 없이 간편하게 검사할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값 in 리스트로 포함 여부 확인
    - 값 not in 리스트로 미포함 확인
    - 결과는 True 또는 False
    - 조건문에서 자주 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 포함 확인

    in 연산자로 값이 리스트에 있는지 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    bucket = ['사과', '바나나', '오렌지']
    '바나나' in bucket
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0097():
        bucket = ['사과', '바나나', '오렌지']
        return '바나나' in bucket
    _snippet_0097()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 미포함 확인

    not in 연산자로 값이 리스트에 없는지 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    cart = ['사과', '바나나', '오렌지']
    '딸기' not in cart
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0099():
        cart = ['사과', '바나나', '오렌지']
        return '딸기' not in cart
    _snippet_0099()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > in 연산자는 문자열에서 부분 문자열 검색에도 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 7 종합 복습

    *리스트 기초 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 7에서 배운 리스트 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 숫자 리스트

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
    ### 연습: 🟢 기본2: 과일 리스트

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
    ### 연습: 🟢 기본3: 첫 요소

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
    ### 연습: 🟢 기본4: 마지막 요소

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
    ### 연습: 🟢 기본5: 슬라이싱

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
    ### 연습: 🟡 응용1: 학생 명단

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 학생
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
    #### 학생 수
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
    #### 처음 3명
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
    ### 연습: 🟡 응용2: 점수 평균

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 점수
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
    #### 합계
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
    #### 평균
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
    ### 연습: 🟡 응용3: 쇼핑 리스트 수정

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 수정 전
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
    #### 수정 후
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
    ### 연습: 🟡 응용4: 주중/주말 분리

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 요일
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
    #### 주중
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
    #### 주말
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
    ### 연습: 🟡 응용5: 메뉴 검색

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 메뉴
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
    #### 피자 포함 여부
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
    #### 초밥 포함 여부
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
    ### 연습: 🔴 심화1-1: 재고 목록 조회

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 제품 목록
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
    #### 재고 수량
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
    #### 첫 번째 제품
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
    #### 첫 번째 재고
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
    ### 연습: 🔴 심화1-2: 재고 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 재고 부족 여부
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
    #### 전체 제품 수
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
    #### 마지막 제품
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
    #### 마지막 재고
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
    ### 연습: 🔴 심화2-1: 성적 데이터 조회

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 과목 목록
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
    #### 전체 점수
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
    #### 하나 건너 점수
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
    #### 상위 3개 점수
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
    ### 연습: 🔴 심화2-2: 성적 통계 계산

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 총점
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
    #### 평균
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
    #### 합격 여부
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
    ### 연습: 🔴 심화3-1: 할일 목록 수정

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 수정 전
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
    #### 수정 후
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
    #### 긴급 할일
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
    #### 일반 할일
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
    ### 연습: 🔴 심화3-2: 할일 검색

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 코딩 포함 여부
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
    #### 전체 할일 수
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
    ### 연습: 🔴 심화4-1: 순위표 조회

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 이름
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
    #### 전체 점수
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
    #### 상위 3명 이름
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
    #### 상위 3명 점수
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
    ### 연습: 🔴 심화4-2: 순위표 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 1등 이름
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
    #### 1등 점수
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
    #### 꼴등 이름
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
    #### 꼴등 점수
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
    #### 점수 차이
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
    ### 연습: 🔴 심화5-1: 플레이리스트 분할

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 노래
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
    #### 플레이리스트 1
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
    #### 플레이리스트 2
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
    #### 역순
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
    ### 연습: 🔴 심화5-2: 플레이리스트 조작

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 하나 건너
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
    #### 결합
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
    #### 반복
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
    #### 노래3 포함 여부
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

    - 리스트를 만들고 길이를 확인할 수 있다.
    - 리스트의 특정 위치 값을 읽고 바꿀 수 있다.
    - 문자열 슬라이싱과 리스트 슬라이싱의 공통점을 설명할 수 있다.

    ## 흔한 막힘

    - 대괄호와 소괄호를 혼동함
    - 존재하지 않는 인덱스를 사용함
    - 리스트 안 문자열의 따옴표를 빠뜨림

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
