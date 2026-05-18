import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 05. 문자열 인덱싱/슬라이싱")


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
    # Day 05. 문자열 인덱싱/슬라이싱

    이 노트북은 `study/python/30days/day05_문자열인덱싱슬라이싱.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 인덱스로 문자열의 특정 위치 접근하기
    - 음수 인덱스로 뒤에서부터 접근하기
    - 슬라이싱으로 부분 문자열 추출하기
    - 스텝을 사용한 다양한 슬라이싱 패턴

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

    - 오늘 새로 배우는 개념: 인덱싱, 음수 인덱싱, 슬라이싱, 간격 슬라이싱
    - 이미 써도 되는 개념: 문자열 기초, 연산자
    - 오늘은 일부러 쓰지 않는 개념: 문자열 메서드, 리스트, 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 인덱싱 기초

    *0부터 시작하는 위치 접근*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    문자열의 각 문자는 인덱스(위치 번호)를 가집니다. 인덱스는 0부터 시작하며, 대괄호 []를 사용하여 특정 위치의 문자를 가져올 수 있습니다. 첫 번째 문자는 [0], 두 번째 문자는 [1]입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 인덱스는 0부터 시작
    - 대괄호 []로 접근
    - 첫 문자는 [0]
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 문자

    인덱스 0으로 첫 번째 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    lang = 'Python'
    lang[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        lang = 'Python'
        return lang[0]
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 두 번째 문자

    인덱스 1로 두 번째 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    code = 'Python'
    code[1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0009():
        code = 'Python'
        return code[1]
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 세 번째 문자

    인덱스 2로 세 번째 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    name = 'Python'
    name[2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0011():
        name = 'Python'
        return name[2]
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 마지막 문자 접근

    *길이를 이용한 마지막 문자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    마지막 문자의 인덱스는 문자열 길이 - 1입니다. len() 함수를 사용하여 길이를 구한 후 1을 빼면 마지막 인덱스를 얻을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 마지막 인덱스 = 길이 - 1
    - len() 함수 활용
    - 범위를 벗어나면 에러
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 문자

    길이를 이용하여 마지막 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    greet = 'Hello'
    greet[len(greet) - 1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0016():
        greet = 'Hello'
        return greet[len(greet) - 1]
    _snippet_0016()
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
    음수 인덱스를 사용하면 문자열의 뒤에서부터 접근할 수 있습니다. -1은 마지막 문자, -2는 마지막에서 두 번째 문자입니다. 길이를 계산할 필요 없이 편리하게 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - -1은 마지막 문자
    - -2는 마지막에서 두 번째
    - 뒤에서부터 -1, -2, -3...
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 문자

    음수 인덱스 -1로 마지막 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    word = 'Python'
    word[-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0021():
        word = 'Python'
        return word[-1]
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막에서 두 번째

    음수 인덱스 -2로 마지막에서 두 번째 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    term = 'Python'
    term[-2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0023():
        term = 'Python'
        return term[-2]
    _snippet_0023()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막에서 세 번째

    음수 인덱스 -3으로 마지막에서 세 번째 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    label = 'Python'
    label[-3]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0025():
        label = 'Python'
        return label[-3]
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 슬라이싱 기초

    *[start:end]로 부분 문자열 추출*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    슬라이싱은 문자열의 일부분을 추출합니다. [start:end] 형태로 사용하며, start 인덱스부터 end-1 인덱스까지 가져옵니다. end 위치는 포함되지 않는다는 점에 주의해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [start:end] 형태
    - start 포함, end 미포함
    - 부분 문자열 추출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 슬라이싱 기초

    문자열의 일부를 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    phrase = 'Python Programming'
    phrase[0:6]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        phrase = 'Python Programming'
        return phrase[0:6]
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > [0:6]은 인덱스 0부터 5까지, 총 6개의 문자를 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시작 생략 슬라이싱

    *[:end]는 처음부터*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    시작 인덱스를 생략하면 처음부터 추출합니다. [:end]는 [0:end]와 같은 의미입니다. 문자열의 앞부분을 가져올 때 편리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [:end]는 처음부터 end-1까지
    - [0:end]와 동일
    - 앞부분 추출에 편리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 시작 생략

    처음부터 특정 위치까지 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    msg = 'Hello World'
    msg[:5]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0036():
        msg = 'Hello World'
        return msg[:5]
    _snippet_0036()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 끝 생략 슬라이싱

    *[start:]는 끝까지*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    끝 인덱스를 생략하면 마지막까지 추출합니다. [start:]는 start 인덱스부터 문자열 끝까지 가져옵니다. 문자열의 뒷부분을 가져올 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [start:]는 start부터 끝까지
    - 마지막까지 추출
    - 뒷부분 추출에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 끝 생략

    특정 위치부터 끝까지 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = 'Hello World'
    text[6:]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0041():
        text = 'Hello World'
        return text[6:]
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 전체 슬라이싱

    *[:]는 전체 복사*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    시작과 끝을 모두 생략하면 전체 문자열을 복사합니다. [:]는 원본과 같은 내용의 새로운 문자열을 만듭니다. 문자열 전체를 복사할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [:]는 전체 문자열
    - 문자열 복사
    - 원본과 동일한 내용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 전체 슬라이싱

    전체 문자열을 복사합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    source = 'Python'
    source[:]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0046():
        source = 'Python'
        return source[:]
    _snippet_0046()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 음수 슬라이싱

    *음수 인덱스로 슬라이싱*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    슬라이싱에서도 음수 인덱스를 사용할 수 있습니다. 뒤에서부터 계산하여 원하는 부분을 추출할 수 있습니다. [-5:-2]는 뒤에서 5번째부터 뒤에서 3번째까지입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 음수 인덱스 사용 가능
    - 뒤에서부터 추출
    - 음수와 양수 혼용 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 음수 슬라이싱

    음수 인덱스로 뒤에서부터 슬라이싱합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sentence = 'Python Programming'
    sentence[-11:-7]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        sentence = 'Python Programming'
        return sentence[-11:-7]
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 스텝 슬라이싱

    *[start:end:step]으로 간격 지정*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    스텝을 지정하면 일정 간격으로 문자를 추출할 수 있습니다. [start:end:step] 형태로 사용하며, step은 간격을 의미합니다. [::2]는 처음부터 끝까지 2칸씩 건너뛰며 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [start:end:step] 형태
    - step은 간격
    - 문자를 건너뛰며 추출
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 스텝 슬라이싱

    2칸씩 건너뛰며 문자를 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sample = 'Python Programming'
    sample[::2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        sample = 'Python Programming'
        return sample[::2]
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 역순 슬라이싱

    *[::-1]로 문자열 뒤집기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    스텝을 -1로 지정하면 문자열을 거꾸로 뒤집을 수 있습니다. [::-1]은 문자열 전체를 역순으로 만듭니다. 회문(palindrome) 확인이나 문자열 반전에 자주 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - [::-1]로 문자열 뒤집기
    - 역순으로 추출
    - 회문 확인에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 역순 슬라이싱

    문자열을 거꾸로 뒤집습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    title = 'Python'
    title[::-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        title = 'Python'
        return title[::-1]
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 슬라이싱 패턴

    *다양한 슬라이싱 조합*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    슬라이싱의 start, end, step을 다양하게 조합하여 원하는 패턴을 추출할 수 있습니다. 홀수 번째 문자만, 짝수 번째 문자만, 또는 역순으로 일부만 등 다양한 패턴이 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - start, end, step 자유롭게 조합
    - 다양한 패턴 추출 가능
    - 음수 스텝도 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 짝수 번째 문자

    인덱스 1부터 2칸씩 건너뛰어 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    alpha = 'abcdefghij'
    alpha[1::2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        alpha = 'abcdefghij'
        return alpha[1::2]
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 역순 일부

    인덱스 7부터 2까지 거꾸로 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    seq = 'abcdefghij'
    seq[7:2:-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0068():
        seq = 'abcdefghij'
        return seq[7:2:-1]
    _snippet_0068()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 3칸씩 건너뛰기

    처음부터 3칸씩 건너뛰어 추출합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    chars = 'abcdefghij'
    chars[::3]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0070():
        chars = 'abcdefghij'
        return chars[::3]
    _snippet_0070()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 5 종합 복습

    *인덱싱과 슬라이싱 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 5에서 배운 인덱싱과 슬라이싱을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 첫 문자

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
    ### 연습: 🟢 기본2: 음수 인덱스

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
    ### 연습: 🟢 기본3: 앞 3글자

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
    ### 연습: 🟢 기본4: 뒤 3글자

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
    ### 연습: 🟢 기본5: 문자열 뒤집기

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
    ### 연습: 🟡 응용1: 중간 부분 추출

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
    ### 연습: 🟡 응용2: 홀수 번째 문자

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
    ### 연습: 🟡 응용3: 짝수 번째 문자

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
    ### 연습: 🟡 응용4: 음수 슬라이싱

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
    ### 연습: 🟡 응용5: 거꾸로 일부

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
    ### 연습: 🔴 심화1-1: 이메일 사용자명 추출

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
    ### 연습: 🔴 심화1-2: 이메일 도메인 추출

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 도메인 부분
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
    #### 확장자 부분
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
    ### 연습: 🔴 심화2: 회문 확인

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
    ### 연습: 🔴 심화3-1: 문자열 분할

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 앞 절반
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
    #### 뒤 절반
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
    ### 연습: 🔴 심화3-2: 패턴 추출

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 3개씩 건너뛰기
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
    #### 역순으로 2개씩 건너뛰기
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
    ### 연습: 🔴 심화4-1: 단어 분리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 첫 단어
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
    #### 둘째 단어
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
    ### 연습: 🔴 심화4-2: 문자열 재조합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이니셜
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
    #### 단어 순서 뒤집기
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
    ### 연습: 🔴 심화5-1: 범위 슬라이싱

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
    ### 연습: 🔴 심화5-2: 역방향 슬라이싱

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
    ### 연습: 🔴 심화5-3: 간격 슬라이싱

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
