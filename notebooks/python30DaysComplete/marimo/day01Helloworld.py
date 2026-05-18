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

    ## 오늘 배우는 것

    - 파이썬 프로그램 실행 방법
    - print() 함수로 텍스트 출력하기
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
    - 오늘은 일부러 쓰지 않는 개념: 변수, 함수, 리스트, 딕셔너리, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
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
    모든 프로그래밍 언어를 배울 때 가장 먼저 하는 것이 'Hello World'를 출력하는 것입니다. 이는 1970년대부터 이어져 온 전통으로, 프로그램이 제대로 실행되는지 확인하는 가장 간단한 방법입니다. 파이썬에서는 print() 함수를 사용하여 화면에 텍스트를 출력합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - print() 함수로 텍스트 출력
    - 작은따옴표 또는 큰따옴표로 문자 감싸기
    - 프로그래밍의 전통적인 첫 단계
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### Hello World 출력

    print() 함수로 'Hello World'를 출력합니다.
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
    def _snippet_0007():
        return print('Hello World')
    _snippet_0007()
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
    파이썬은 유니코드(Unicode)를 지원하므로 영어뿐만 아니라 한글, 일본어, 중국어 등 모든 언어를 출력할 수 있습니다. 유니코드는 전 세계 모든 문자를 컴퓨터에서 표현할 수 있도록 만든 국제 표준입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 한글, 영어, 일본어 등 모든 언어 출력 가능
    - 유니코드 완벽 지원
    - 이모지도 출력 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 한글 출력

    한글도 자유롭게 출력할 수 있습니다.
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
    def _snippet_0013():
        return print('안녕하세요, 파이썬!')
    _snippet_0013()
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
    여러 줄의 텍스트를 출력하려면 print() 함수를 여러 번 사용하면 됩니다. 각 print()는 자동으로 줄바꿈을 하므로 다음 출력은 새 줄에서 시작됩니다.
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
    def _snippet_0019():
        print('첫 번째 줄')
        print('두 번째 줄')
        return print('세 번째 줄')
    _snippet_0019()
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
    def _snippet_0024():
        return print('첫 번째 줄\n두 번째 줄\n세 번째 줄')
    _snippet_0024()
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
    def _snippet_0030():
        return print('실행됩니다')
    _snippet_0030()
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
    def _snippet_0036():
        print('주석 전')
        '''
        이 부분은 여러 줄 설명 메모처럼 볼 수 있습니다.
        지금은 실행 결과에 보이지 않습니다.
        '''
        return print('주석 후')
    _snippet_0036()
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
    def _snippet_0042():
        return print(123)
    _snippet_0042()
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
    def _snippet_0048():
        return print(10 + 20)
    _snippet_0048()
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
    Colab과 marimo 같은 노트북 환경에서는 셀의 마지막 줄에 값이 있으면 화면에 자동으로 보입니다. 표현식(Expression)이란 값을 만들어내는 코드 조각입니다. 처음에는 print()를 주로 쓰되, 마지막 줄 값도 확인해보세요.
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
    def _snippet_0053():
        return 'Hello Notebook'
    _snippet_0053()
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
    Day 1에서 배운 print() 함수와 주석을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: Hello World 출력

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
    ### 연습: 🟢 기본2: 한글 출력

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
    ### 연습: 🟢 기본3: 숫자 출력

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
    ### 연습: 🟢 기본4: 계산 결과

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
    ### 연습: 🟢 기본5: 여러 줄 출력

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
    ### 연습: 🟡 응용1: 줄바꿈으로 인사말

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
    ### 연습: 🟡 응용2: 계산과 설명

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
    ### 연습: 🟡 응용3: 이모지와 메시지

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
    ### 연습: 🟡 응용4: 여러 계산 비교

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
    ### 연습: 🟡 응용5: 마지막 줄 계산

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
    ### 연습: 🔴 심화1: 명함 만들기

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
    ### 연습: 🔴 심화2: 계산기 출력

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
    ### 연습: 🔴 심화3: 패턴 만들기

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
    ### 연습: 🔴 심화4: 메뉴판 출력

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
    ### 연습: 🔴 심화5: 복합 정보 카드

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
