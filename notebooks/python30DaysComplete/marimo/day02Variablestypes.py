import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 02. 변수와 데이터 타입")


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
    # Day 02. 변수와 데이터 타입

    이 노트북은 `study/python/30days/day02_변수와데이터타입.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 변수의 개념과 값 저장 방법
    - 정수, 실수, 문자열, 불린 데이터 타입
    - type() 함수로 타입 확인하기
    - len() 함수로 길이 측정하기
    - 타입 변환 (int, float, str)
    - 다중 변수 할당 기법

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

    - 오늘 새로 배우는 개념: 변수, 정수(int), 실수(float), 문자열(str), 참/거짓(bool), type() 타입 확인, len() 길이 확인
    - 이미 써도 되는 개념: print() 출력, 주석, 문자열 값
    - 오늘은 일부러 쓰지 않는 개념: 리스트, 딕셔너리, 튜플, 집합, 함수, 클래스, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 변수란?

    *데이터를 저장하는 이름표*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    변수(Variable)는 데이터를 저장하는 메모리 공간에 붙인 이름표입니다.
    마치 상자에 물건을 넣고 라벨을 붙이는 것과 같습니다.
    변수를 사용하면 데이터를 저장했다가 나중에 다시 사용할 수 있습니다.
    = 기호는 수학의 "같다"가 아니라 "오른쪽 값을 왼쪽 변수에 저장한다"는 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 변수명 = 값 형태로 할당
    - 데이터를 저장하고 재사용
    - = 기호는 할당(assignment) 의미
    - 의미 있는 이름으로 가독성 향상
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변수 기본 사용

    변수에 값을 저장하고 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    msg = 'Python'
    msg
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        msg = 'Python'
        return msg
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 변수명은 영문자, 숫자, 밑줄(_)만 사용 가능하며, 숫자로 시작할 수 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 변수명 작성 스타일

    *카멜케이스 vs 스네이크케이스*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    변수명을 지을 때 단어를 연결하는 방법에는 크게 두 가지 스타일이 있습니다. 카멜케이스(camelCase)는 첫 단어는 소문자로 시작하고 이후 단어의 첫 글자를 대문자로 쓰는 방식입니다. 스네이크케이스(snake_case)는 모든 단어를 소문자로 쓰고 밑줄(_)로 연결하는 방식입니다. 파이썬 공식 스타일 가이드(PEP 8)는 스네이크케이스를 권장하지만, 이 학습 컨텐츠는 작성자의 코딩 스타일에 따라 카멜케이스를 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 카멜케이스: userName, totalPrice, isActive
    - 스네이크케이스: user_name, total_price, is_active
    - 파이썬 공식 가이드는 스네이크케이스 권장
    - 중요한 것은 한 프로젝트에서 일관성 유지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 가지 스타일 비교

    카멜케이스와 스네이크케이스 모두 사용 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    userName = 'John Doe'
    user_name = 'Jane Smith'
    print('카멜케이스 : ', userName, '\n스네이크케이스 : ', user_name)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0013():
        userName = 'John Doe'
        user_name = 'Jane Smith'
        return print('카멜케이스 : ', userName, '\n스네이크케이스 : ', user_name)
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 이 학습 컨텐츠는 카멜케이스로 작성되었지만, 여러분은 원하는 스타일을 선택하여 사용하세요. 중요한 것은 선택한 스타일을 일관되게 유지하는 것입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 변수 값 변경하기

    *저장된 값을 새 값으로 교체*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    변수는 언제든지 새로운 값으로 변경할 수 있습니다.
    같은 변수에 새 값을 할당하면 이전 값은 사라지고 새 값으로 대체됩니다.
    이것이 "변수(Variable)"라는 이름의 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 같은 변수에 새 값 할당 가능
    - 이전 값은 사라지고 새 값으로 대체
    - 변할 수 있기에 "변수"
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변수 값 변경

    변수에 새로운 값을 할당합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    score = 80
    score = 95
    score
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        score = 80
        score = 95
        return score
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 변수는 최종적으로 할당된 값을 가집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 정수 타입

    *소수점 없는 숫자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    정수(Integer)는 소수점이 없는 숫자입니다.
    1, 100, -5처럼 양수, 0, 음수 모두 정수입니다.
    파이썬에서 정수 타입은 int로 표시됩니다.
    int는 integer(정수)의 줄임말입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 소수점 없는 숫자
    - 양수, 0, 음수 모두 가능
    - 타입 이름은 int
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정수 변수

    정수를 변수에 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    years = 25
    years
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0025():
        years = 25
        return years
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실수 타입

    *소수점 있는 숫자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    실수(Float)는 소수점이 있는 숫자입니다.
    3.14, 2.5, -1.5처럼 소수점을 포함한 숫자입니다.
    파이썬에서 실수 타입은 float로 표시됩니다.
    float는 floating point(부동소수점)의 줄임말입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 소수점 있는 숫자
    - 정밀한 계산에 사용
    - 타입 이름은 float
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 실수 변수

    실수를 변수에 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    pi = 3.14159
    pi
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        pi = 3.14159
        return pi
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 타입

    *따옴표로 감싼 텍스트*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열(String)은 따옴표로 감싼 텍스트입니다.
    'Hello', "Python"처럼 작은따옴표나 큰따옴표로 만듭니다.
    문자 하나('A')도 문자열이고, 긴 문장도 문자열입니다.
    파이썬에서 문자열 타입은 str로 표시됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 따옴표로 감싼 텍스트
    - 한 글자도 문자열
    - 타입 이름은 str
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 변수

    문자열을 변수에 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    town = 'Seoul'
    town
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0035():
        town = 'Seoul'
        return town
    _snippet_0035()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 불린 타입

    *참과 거짓*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    불린(Boolean)은 참(True) 또는 거짓(False) 두 가지 값만 가지는 타입입니다.
    영국 수학자 조지 불(George Boole)의 이름에서 유래했습니다.
    True와 False는 첫 글자가 반드시 대문자여야 합니다.
    조건 판단, 비교 연산에서 주로 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - True 또는 False 두 값만 존재
    - 첫 글자 반드시 대문자
    - 조건 판단에 사용
    - 타입 이름은 bool
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 불린 변수

    True와 False를 변수에 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    active = True
    active
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        active = True
        return active
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## type() 함수

    *데이터 타입 확인하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    type() 함수는 값이나 변수의 데이터 타입을 알려줍니다.
    괄호 안에 변수나 값을 넣으면 그것의 타입을 반환합니다.
    결과는 <class 'int'>, <class 'str'> 같은 형태로 표시됩니다.
    디버깅이나 타입 확인에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - type(값) 형태로 사용
    - 데이터 타입 확인
    - <class '타입이름'> 형태로 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### type() 함수 사용

    다양한 값의 타입을 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    point = 100
    type(point)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0045():
        point = 100
        return type(point)
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## len() 함수

    *문자열 길이 측정*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 문자열의 길이(문자 개수)를 반환합니다.
    len은 length(길이)의 줄임말입니다.
    공백, 특수문자, 한글 모두 각각 1로 계산됩니다.
    빈 문자열('')의 길이는 0입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len(문자열) 형태로 사용
    - 문자 개수 반환
    - 공백도 1로 계산
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### len() 함수 사용

    문자열의 길이를 측정합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    email = 'python@example.com'
    len(email)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        email = 'python@example.com'
        return len(email)
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 'Hello World'의 길이는 11입니다. 공백도 문자로 계산됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## int() 변환

    *정수로 변환하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    int() 함수는 다른 타입을 정수로 변환합니다.
    문자열 '100'을 숫자 100으로 바꿀 수 있습니다.
    단, 문자열은 숫자로만 이루어져 있어야 합니다.
    실수를 정수로 변환하면 소수점 이하는 버려집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - int(값) 형태로 사용
    - 문자열을 정수로 변환
    - 실수는 소수점 이하 버림
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### int() 변환

    문자열과 실수를 정수로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = '100'
    int(text)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        text = '100'
        return int(text)
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## float() 변환

    *실수로 변환하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    float() 함수는 다른 타입을 실수로 변환합니다.
    정수 10을 실수 10.0으로 바꿀 수 있습니다.
    문자열 '3.14'를 숫자 3.14로 변환할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - float(값) 형태로 사용
    - 정수를 실수로 변환
    - 문자열을 실수로 변환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### float() 변환

    정수와 문자열을 실수로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    val = 42
    float(val)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        val = 42
        return float(val)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## str() 변환

    *문자열로 변환하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    str() 함수는 어떤 값이든 문자열로 변환합니다.
    숫자 25를 문자열 '25'로 바꿀 수 있습니다.
    문자열 연결이나 출력 메시지를 만들 때 자주 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - str(값) 형태로 사용
    - 모든 타입을 문자열로 변환
    - 문자열 연결에 필수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### str() 변환

    숫자를 문자열로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    code = 123
    str(code)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        code = 123
        return str(code)
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다중 변수 할당

    *한 줄로 여러 변수 선언*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    쉼표로 구분하여 한 줄에 여러 변수를 선언할 수 있습니다.
    순서대로 매칭되므로 첫 번째 변수에 첫 번째 값이 저장됩니다.
    코드를 더 간결하게 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 쉼표로 변수와 값 구분
    - 순서대로 매칭
    - 코드 간결화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다중 변수 할당

    여러 변수를 한 줄에 선언합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    name, age, city = 'Alice', 25, 'Seoul'
    name, age, city
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        name, age, city = 'Alice', 25, 'Seoul'
        return (name, age, city)
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 같은 값 할당

    *여러 변수에 동일한 값*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    = 연산자를 연결하면 여러 변수에 같은 값을 동시에 할당할 수 있습니다.
    모든 변수가 동일한 값을 가지게 됩니다.
    초기화할 때 자주 사용하는 패턴입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - = 연산자 연결
    - 모든 변수에 같은 값
    - 초기화에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 같은 값 할당

    여러 변수에 같은 값을 할당합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    a = b = c = 0
    a
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0076():
        a = b = c = 0
        return a
    _snippet_0076()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 2 종합 복습

    *변수와 타입 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 2에서 배운 변수, 데이터 타입, 타입 변환을 난이도별로 복습합니다.
    🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 변수 선언

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
    ### 연습: 🟢 기본2: 정수 변수

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
    ### 연습: 🟢 기본3: 실수 변수

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
    ### 연습: 🟢 기본4: 타입 확인

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
    ### 연습: 🟢 기본5: 길이 확인

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
    ### 연습: 🟡 응용1-1: 사용자 이름과 나이

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 사용자 이름
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
    #### 사용자 나이
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
    ### 연습: 🟡 응용1-2: 사용자 도시

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
    ### 연습: 🟡 응용2: 나이 계산

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
    ### 연습: 🟡 응용3: 가격 계산

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
    ### 연습: 🟡 응용4-1: 문자열 길이

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 문자열 내용
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
    #### 문자열 길이
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
    ### 연습: 🟡 응용4-2: 문자열 타입

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
    ### 연습: 🟡 응용5: 다중 할당 활용

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
    ### 연습: 🔴 심화1-1: 프로필 기본 정보

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이름
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
    #### 나이
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
    #### 직업
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
    ### 연습: 🔴 심화1-2: 프로필 상세 정보

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 급여
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
    #### 활성 상태
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
    #### 이름 길이
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
    ### 연습: 🔴 심화2-1: 상품 기본 정보

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 상품명
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
    #### 단가
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
    ### 연습: 🔴 심화2-2: 상품 재고 가치

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
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
    #### 총 가치
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
    ### 연습: 🔴 심화3-1: 문자열 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 텍스트 값
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
    #### 텍스트 타입
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
    #### 텍스트 길이
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
    ### 연습: 🔴 심화3-2: 숫자 변환 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 문자열 숫자
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
    #### 정수로 변환
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
    #### 변환된 타입
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
    ### 연습: 🔴 심화4-1: 학생 개별 과목 성적

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생 이름
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
    #### 수학 성적
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
    #### 영어 성적
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
    ### 연습: 🔴 심화4-2: 학생 평균 성적

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 과학 성적
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
    #### 평균 계산
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
    ### 연습: 🔴 심화5-1: 타입 변환 1단계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 원본 문자열
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
    #### 실수로 변환
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
    #### 정수로 변환
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
    ### 연습: 🔴 심화5-2: 타입 변환 2단계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 문자열로 변환
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
    #### 최종 길이
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
