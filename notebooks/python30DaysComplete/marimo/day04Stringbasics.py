import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 04. 문자열 기초")


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
    # Day 04. 문자열 기초

    이 노트북은 `study/python/30days/day04_문자열기초.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 문자열 연결과 반복
    - f-string으로 간편한 포맷팅
    - 이스케이프 문자로 특수 문자 표현하기
    - 여러 줄 문자열 작성하기

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

    - 오늘 새로 배우는 개념: 문자열 연결, f-string, 이스케이프 문자, 여러 줄 문자열, in 연산자
    - 이미 써도 되는 개념: 변수, type() 타입 확인, 연산자, print() 출력, len() 길이 확인
    - 오늘은 일부러 쓰지 않는 개념: 인덱싱, 슬라이싱, 문자열 메서드, 리스트, 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 연결

    *+ 기호로 문자열 합치기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열은 + 연산자로 연결할 수 있습니다. 두 개 이상의 문자열을 하나로 합칠 때 사용합니다. 숫자의 덧셈과 같은 기호지만 문자열에서는 연결의 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - + 기호로 문자열 연결
    - 여러 문자열 연결 가능
    - 공백도 문자로 포함됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 연결

    두 문자열을 + 기호로 연결합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    first = 'Hello'
    second = 'World'
    first + ' ' + second
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        first = 'Hello'
        second = 'World'
        return first + ' ' + second
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 공백을 넣으려면 ' ' 처럼 공백 문자열을 중간에 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 반복

    ** 기호로 문자열 반복하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열에 * 연산자를 사용하면 문자열을 반복할 수 있습니다. 숫자를 곱하면 그 횟수만큼 문자열이 반복됩니다. 같은 문자를 여러 번 출력할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - * 기호로 문자열 반복
    - 문자열 * 숫자 형태로 사용
    - 반복 횟수는 정수만 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 반복

    문자열을 3번 반복합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    word = 'Python'
    word * 3
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0013():
        word = 'Python'
        return word * 3
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > '=' * 50 처럼 사용하면 구분선을 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 길이

    *len() 함수로 길이 구하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 문자열의 길이를 반환합니다. 문자열에 포함된 문자의 개수를 세어줍니다. 공백과 특수문자도 모두 포함됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len() 함수로 문자열 길이 계산
    - 공백, 특수문자 모두 포함
    - 결과는 정수(int)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 길이

    문자열의 길이를 구합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = 'Hello Python'
    len(text)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        text = 'Hello Python'
        return len(text)
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## f-string 포맷팅

    *f-string으로 간편하게 문자열 만들기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    f-string은 문자열 앞에 f를 붙여 변수를 직접 넣을 수 있는 방법입니다. + 연결이나 str() 변환 없이도 변수와 문자를 자연스럽게 조합할 수 있습니다. 중괄호 {} 안에 변수명이나 표현식을 넣으면 자동으로 문자열로 변환됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - f'...' 형식으로 사용
    - {변수명}으로 변수 삽입
    - 자동으로 str() 변환
    - + 연결보다 읽기 쉬움
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### f-string 기본

    f-string으로 변수를 문자열에 삽입합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    name = '김철수'
    age = 25
    f'{name}님의 나이는 {age}세입니다'
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0024():
        name = '김철수'
        age = 25
        return f'{name}님의 나이는 {age}세입니다'
    _snippet_0024()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중괄호 {} 안에는 변수뿐만 아니라 연산식(예: {age + 1})도 넣을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 줄바꿈 문자

    *\n으로 줄 바꾸기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    이스케이프 문자는 백슬래시(\)로 시작하는 특수 문자입니다. \n은 줄바꿈을 의미하며, 문자열 중간에 사용하면 그 지점에서 줄이 바뀝니다. 여러 줄 출력에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - \n은 줄바꿈 문자
    - 백슬래시(\)로 시작
    - 문자열 중간에 삽입 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 줄바꿈 문자

    \n을 사용하여 줄을 바꿉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    lines = '첫 번째 줄\n두 번째 줄\n세 번째 줄'
    print(lines)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        lines = '첫 번째 줄\n두 번째 줄\n세 번째 줄'
        return print(lines)
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 탭 문자

    *\t로 간격 넣기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    \t는 탭 문자로, 일정한 간격을 만듭니다. 텍스트를 정렬할 때 유용하며, 보통 4칸 또는 8칸의 공백과 같은 효과를 냅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - \t는 탭 문자
    - 일정한 간격 생성
    - 텍스트 정렬에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 탭 문자

    \t를 사용하여 탭 간격을 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    row = '이름\t나이\t도시'
    print(row)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0035():
        row = '이름\t나이\t도시'
        return print(row)
    _snippet_0035()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 따옴표 문자

    *\'와 \"로 따옴표 넣기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열 안에 따옴표를 넣으려면 백슬래시를 앞에 붙입니다. \'는 작은따옴표, \"는 큰따옴표를 문자로 표현합니다. 또는 작은따옴표 문자열 안에 큰따옴표를 사용할 수도 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - \' 작은따옴표 문자
    - \" 큰따옴표 문자
    - 작은따옴표 안에 큰따옴표 직접 사용 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 따옴표 문자

    문자열 안에 따옴표를 넣습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    quote = "It's a beautiful day"
    quote
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        quote = "It's a beautiful day"
        return quote
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 백슬래시 문자

    *\\로 백슬래시 표현하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    백슬래시 자체를 문자로 표현하려면 \\처럼 두 번 사용합니다. Windows 경로(C:\Users)나 정규표현식에서 자주 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - \\ 백슬래시 문자
    - 두 번 사용해야 하나로 표시
    - 파일 경로 표현에 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 백슬래시 문자

    백슬래시를 문자로 표현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    path = 'C:\\\\Users\\\\Documents'
    print(path)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0045():
        path = 'C:\\\\Users\\\\Documents'
        return print(path)
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 줄 문자열

    *삼중 따옴표로 여러 줄 작성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    삼중 따옴표(''' 또는 \"\"\")를 사용하면 여러 줄에 걸친 문자열을 쉽게 작성할 수 있습니다. 줄바꿈이 자동으로 포함되며, \n을 사용하지 않아도 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 삼중 따옴표로 여러 줄 문자열
    - 줄바꿈 자동 포함
    - 긴 텍스트 작성에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 줄 문자열

    삼중 따옴표로 여러 줄 문자열을 작성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    block = '''첫 번째 줄
    두 번째 줄
    세 번째 줄'''
    print(block)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        block = '''첫 번째 줄
        두 번째 줄
        세 번째 줄'''
        return print(block)
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 원시 문자열

    *r 접두사로 이스케이프 무시하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열 앞에 r을 붙이면 이스케이프 문자를 무시합니다. \n이 줄바꿈이 아닌 문자 그대로 표시됩니다. 정규표현식이나 파일 경로 작성에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - r 접두사로 원시 문자열
    - 이스케이프 문자 무시
    - 정규표현식, 경로 작성에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 원시 문자열

    r 접두사를 사용하여 이스케이프를 무시합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    raw = r'C:\Users\Documents'
    print(raw)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0055():
        raw = r'C:\Users\Documents'
        return print(raw)
    _snippet_0055()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 포함 확인

    *in 연산자로 부분 문자열 찾기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in 연산자는 문자열 안에 특정 문자나 단어가 포함되어 있는지 확인합니다. 포함되어 있으면 True, 없으면 False를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - in 연산자로 포함 여부 확인
    - 결과는 True 또는 False
    - 대소문자 구분함
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 포함 확인

    특정 문자가 포함되어 있는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    phrase = 'Python Programming'
    'Python' in phrase
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        phrase = 'Python Programming'
        return 'Python' in phrase
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 대소문자를 구분하므로 'python' in inCheckText는 False입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 미포함 확인

    *not in 연산자로 확인하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    not in 연산자는 문자열에 특정 문자나 단어가 포함되지 않았는지 확인합니다. 포함되지 않으면 True, 포함되어 있으면 False를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - not in 연산자로 미포함 확인
    - in의 반대 결과
    - 필터링에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 미포함 확인

    특정 문자가 포함되지 않았는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sentence = 'Hello World'
    'Python' not in sentence
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        sentence = 'Hello World'
        return 'Python' not in sentence
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 4 종합 복습

    *문자열 기초 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 4에서 배운 문자열 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 문자열 연결

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
    ### 연습: 🟢 기본2: 문자열 반복

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
    ### 연습: 🟢 기본3: 문자열 길이

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
    ### 연습: 🟢 기본4: 줄바꿈 문자

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
    ### 연습: 🟢 기본5: in 연산자

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
    ### 연습: 🟢 기본6: f-string

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
    ### 연습: 🟡 응용1: 이름표 만들기

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
    ### 연습: 🟡 응용2: 메시지 포맷팅

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
    ### 연습: 🟡 응용3: 주소 라벨

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
    ### 연습: 🟡 응용4: 파일 경로 확인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 경로
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
    #### txt 파일 여부
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
    #### doc 파일 여부
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
    ### 연습: 🟡 응용5: 반복 패턴

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
    ### 연습: 🔴 심화1: 영수증 만들기

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
    ### 연습: 🔴 심화2: 테이블 헤더

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
    ### 연습: 🔴 심화3: URL 생성 및 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### URL 생성
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
    #### 보안 여부
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
    #### 유효성 검증
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
    ### 연습: 🔴 심화4: 명함 디자인

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
    ### 연습: 🔴 심화5: 로그 메시지

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 로그 메시지
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
    #### 메시지 길이
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
    #### ERROR 포함 여부
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
    #### INFO 포함 여부
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
