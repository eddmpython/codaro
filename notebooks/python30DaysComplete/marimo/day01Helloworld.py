import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 01. 헬로월드")


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
    # Day 01. 헬로월드

    이 노트북은 `study/python/30days/day01_헬로월드.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    print()와 문자열을 사용해 값을 화면에 출력하고, 주석으로 코드의 의도를 남깁니다.

    ## 왜 중요한가

    처음에는 복잡한 문법보다 실행 결과를 눈으로 확인하는 습관이 가장 중요합니다.

    ## 생각 모델

    코드 한 줄은 컴퓨터에게 보내는 짧은 지시입니다. print()는 그 지시의 결과를 화면에 보여주는 창입니다.

    ## 오늘 배우는 것

    - 파이썬 프로그램 실행 방법
    - print()로 텍스트 출력하기
    - 한 줄 주석과 여러 줄 설명 메모
    - 코드 작성 시 주석의 중요성

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

    - 오늘 새로 배우는 개념: print() 출력, 주석, 문자열 값
    - 이미 써도 되는 개념: 없음
    - 오늘은 일부러 쓰지 않는 개념: 변수, 직접 만드는 함수, 리스트, 딕셔너리, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 따옴표 안의 글자와 따옴표 밖의 괄호, 쉼표를 구분합니다.
    - 실행 중: 셀 하나를 실행한 뒤 화면에 나온 글자와 코드 안의 글자가 어떻게 연결되는지 확인합니다.
    - 연습 초점: 문장을 바꾸고 줄 수를 바꾸어도 실행 결과를 말로 설명합니다.
    - 막히면: 오류가 나면 따옴표, 괄호, 줄바꿈을 먼저 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Hello World

    *첫 파이썬 프로그램*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    프로그래밍을 처음 배울 때는 보통 'Hello World'를 화면에 출력합니다. 코드가 제대로 실행되는지 가장 작게 확인할 수 있기 때문입니다. 파이썬에서는 print()를 사용해 화면에 텍스트를 보여줍니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - print()로 텍스트 출력
    - 작은따옴표 또는 큰따옴표로 문자 감싸기
    - 코드 실행 결과를 눈으로 확인하기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### Hello World 출력

    print()로 'Hello World'를 출력합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('Hello World')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        return print('Hello World')
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 작은따옴표('')와 큰따옴표(\"\")는 기능상 차이가 없습니다. 편한 것을 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 한글 출력하기

    *파이썬은 모든 언어 지원*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파이썬은 영어뿐만 아니라 한글, 일본어, 중국어처럼 여러 언어의 글자를 출력할 수 있습니다. 지금은 어려운 원리를 외울 필요 없이, 따옴표 안에 넣은 글자가 화면에 보인다고 이해하면 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 한글, 영어, 일본어 등 모든 언어 출력 가능
    - 따옴표 안의 글자가 그대로 화면에 보임
    - 이모지도 출력 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 한글 출력

    한글도 자유롭게 출력할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('안녕하세요, 파이썬!')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0014():
        return print('안녕하세요, 파이썬!')
    _snippet_0014()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 이모지도 출력할 수 있습니다: print('🐍 Python')
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 줄 출력하기

    *print() 여러 번 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    여러 줄의 텍스트를 출력하려면 print()를 여러 번 사용하면 됩니다. 각 print()는 자동으로 줄을 바꾸므로 다음 출력은 새 줄에서 시작됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - print() 여러 번 사용하여 여러 줄 출력
    - 각 print()는 자동으로 줄바꿈
    - 순서대로 위에서 아래로 실행
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 줄 출력

    print()를 여러 번 사용하여 여러 줄을 출력합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('첫 번째 줄')
    print('두 번째 줄')
    print('세 번째 줄')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        print('첫 번째 줄')
        print('두 번째 줄')
        return print('세 번째 줄')
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 줄바꿈 문자

    *\n으로 한 번에 여러 줄 출력*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    \n은 줄바꿈 문자로, 하나의 print() 안에서 여러 줄을 출력할 수 있게 해줍니다. \n을 만나면 그 지점에서 줄이 바뀝니다. 백슬래시(\)와 문자 n을 함께 써서 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - \n은 줄바꿈 문자
    - 하나의 print()로 여러 줄 출력 가능
    - 백슬래시(\)와 n을 함께 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 줄바꿈 문자 사용

    \n을 사용하여 한 번에 여러 줄을 출력합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('첫 번째 줄\n두 번째 줄\n세 번째 줄')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0025():
        return print('첫 번째 줄\n두 번째 줄\n세 번째 줄')
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > \n을 사용하면 print() 한 번으로 여러 줄을 출력할 수 있어 편리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 한 줄 주석

    *코드에 설명 추가하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    주석(Comment)은 프로그램 실행에 영향을 주지 않는 메모입니다. 코드에 설명을 추가하여 나중에 다시 볼 때나 다른 사람이 볼 때 이해하기 쉽게 만듭니다. 파이썬에서 한 줄 주석은 # 기호로 시작합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - #으로 시작하는 한 줄 주석
    - 프로그램 실행에 영향 없음
    - 코드 설명이나 메모 작성
    - 코드의 가독성 향상
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 한 줄 주석 사용

    # 기호로 주석을 작성합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('실행됩니다')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0031():
        return print('실행됩니다')
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 주석은 코드를 이해하기 쉽게 만들지만, 과도한 주석은 오히려 가독성을 해칩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 줄 설명 메모

    *삼중 따옴표를 조심해서 보기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파이썬의 정식 주석은 #으로 시작하는 한 줄 주석입니다. 다만 삼중 따옴표(''' 또는 \"\"\")로 여러 줄 문자열을 만들어 설명 메모처럼 두는 코드도 자주 보입니다. 처음에는 '긴 설명을 여러 줄로 적는 방법' 정도로만 이해하면 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - #은 정식 주석
    - 삼중 따옴표는 여러 줄 문자열
    - 파일이나 함수 맨 위 설명에 자주 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 줄 설명 메모 보기

    삼중 따옴표로 여러 줄 설명을 적어봅니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print('주석 전')
    '''
    이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.
    지금은 실행 결과에 보이지 않습니다.
    '''
    print('주석 후')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        print('주석 전')
        '''
        이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.
        지금은 실행 결과에 보이지 않습니다.
        '''
        return print('주석 후')
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 삼중 따옴표는 엄밀히 말하면 문자열입니다. 초보 단계에서는 일반 주석은 #으로 쓴다고 기억하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 숫자 출력하기

    *따옴표 없이 숫자 출력*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    숫자를 출력할 때는 따옴표가 필요 없습니다. 따옴표로 감싸면 문자로 인식되고, 따옴표 없이 쓰면 숫자로 인식됩니다. 숫자는 계산에 사용할 수 있지만, 문자는 계산할 수 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 숫자는 따옴표 없이 출력
    - 정수와 소수 모두 가능
    - 따옴표로 감싸면 문자가 됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 출력

    따옴표 없이 숫자를 출력합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print(123)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0043():
        return print(123)
    _snippet_0043()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > print(123)은 숫자 123을, print('123')은 문자 '123'을 출력합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 계산 결과 출력하기

    *파이썬을 계산기처럼 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    print() 안에서 직접 계산을 할 수 있습니다. 파이썬은 계산 결과를 자동으로 구한 후 출력합니다. 더하기(+), 빼기(-), 곱하기(*), 나누기(/) 등 다양한 연산이 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - print() 안에서 직접 계산 가능
    - 계산 결과가 자동으로 출력됨
    - 파이썬을 계산기처럼 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 계산 결과 출력

    print() 안에서 계산을 하고 결과를 출력합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    print(10 + 20)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        return print(10 + 20)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 마지막 줄 값 확인하기

    *print 없이 표현식만 쓰기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Colab과 marimo 같은 노트북 환경에서는 셀의 마지막 줄에 값이 있으면 화면에 자동으로 보입니다. 처음에는 print()를 주로 쓰되, 마지막 줄에 값만 놓았을 때도 화면에 보일 수 있다는 점을 확인해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 노트북에서는 마지막 줄 값이 자동으로 보일 수 있음
    - print() 없이도 값이 화면에 표시
    - 초보 단계에서는 print()와 함께 비교해보기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 줄 값

    마지막 줄의 값이 자동으로 출력됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    'Hello Notebook'
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0054():
        return 'Hello Notebook'
    _snippet_0054()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 1 종합 복습

    *Hello World와 주석 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 1에서 배운 print() 출력과 주석을 난이도별로 복습합니다. 기본 미션부터 시작하여 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: Hello World 출력

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
    ### 연습: 🟢 기본2: 한글 출력

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
    ### 연습: 🟢 기본3: 숫자 출력

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
    ### 연습: 🟢 기본4: 계산 결과

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
    ### 연습: 🟢 기본5: 여러 줄 출력

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
    ### 연습: 🟡 응용1: 줄바꿈으로 인사말

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
    ### 연습: 🟡 응용2: 계산과 설명

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
    ### 연습: 🟡 응용3: 이모지와 메시지

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
    ### 연습: 🟡 응용4: 여러 계산 비교

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
    ### 연습: 🟡 응용5: 마지막 줄 계산

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
    ### 연습: 🔴 심화1: 명함 만들기

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
    ### 연습: 🔴 심화2: 계산기 출력

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
    ### 연습: 🔴 심화3: 패턴 만들기

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
    ### 연습: 🔴 심화4: 메뉴판 출력

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
    ### 연습: 🔴 심화5: 복합 정보 카드

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

    - print()로 한글과 숫자를 각각 출력할 수 있다.
    - 주석이 실행 결과에 영향을 주지 않는다는 점을 설명할 수 있다.
    - 마지막 줄 값 표시와 print() 출력의 차이를 말할 수 있다.

    ## 흔한 막힘

    - 따옴표를 닫지 않음
    - 괄호를 빠뜨림
    - 주석과 문자열을 혼동함

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
