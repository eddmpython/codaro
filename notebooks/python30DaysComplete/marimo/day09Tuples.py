import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 09. 튜플")


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
    # Day 09. 튜플

    이 노트북은 `curricula/python/30days/day09_튜플.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    튜플을 만들고, 바꿀 수 없는 값 묶음과 패킹/언패킹을 이해합니다.

    ## 왜 중요한가

    변하지 않아야 하는 묶음과 여러 값을 한 번에 주고받는 패턴을 구분할 수 있게 됩니다.

    ## 생각 모델

    튜플은 잠근 리스트입니다. 순서는 있지만 칸 안의 값을 바꾸는 용도는 아닙니다.

    ## 오늘 배우는 것

    - 튜플의 불변성과 리스트와의 차이
    - 소괄호로 튜플 생성하기
    - 튜플 패킹과 언패킹
    - 안전한 데이터 저장

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

    - 오늘 새로 배우는 개념: 튜플, 바꿀 수 없는 튜플, 튜플 패킹, 튜플 언패킹
    - 이미 써도 되는 개념: 리스트 전체, 문자열 전체
    - 오늘은 일부러 쓰지 않는 개념: 딕셔너리, 집합, 직접 만드는 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 괄호보다 쉼표가 튜플을 만든다는 점을 확인합니다.
    - 실행 중: 리스트에서 되던 값 변경이 튜플에서는 왜 실패하는지 관찰합니다.
    - 연습 초점: 좌표, 이름과 점수처럼 의미가 정해진 묶음을 튜플로 표현합니다.
    - 막히면: 언패킹 오류가 나면 왼쪽 변수 개수와 오른쪽 값 개수를 맞춥니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플이란?

    *변경 불가능한 리스트*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플(Tuple)은 리스트와 비슷하지만 한 번 만들면 내용을 변경할 수 없는 자료구조입니다. 소괄호 ()로 만들고, 쉼표로 값을 구분합니다. 리스트는 수정 가능(mutable)하지만 튜플은 수정 불가능(immutable)합니다. 이러한 특성 때문에 변경되면 안 되는 중요한 데이터를 저장할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 소괄호 ()로 생성
    - 쉼표로 값 구분
    - 생성 후 변경 불가능 (immutable)
    - 리스트보다 메모리 효율적
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 만들기

    소괄호를 사용하여 튜플을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    nums = (1, 2, 3, 4, 5)
    nums
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        nums = (1, 2, 3, 4, 5)
        return nums
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 튜플은 딕셔너리의 키로 사용할 수 있지만, 리스트는 불가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다양한 튜플 생성

    *여러 형태의 튜플*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플은 리스트처럼 다양한 타입을 담을 수 있습니다. 숫자만, 문자열만, 또는 여러 타입을 섞어서 만들 수 있습니다. 요소가 하나인 튜플은 쉼표를 꼭 붙여야 합니다. 소괄호 없이 쉼표만으로도 튜플이 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 다양한 타입 저장 가능
    - 빈 튜플: ()
    - 요소 1개: (값,) 쉼표 필수
    - 소괄호 생략 가능: 1, 2, 3
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 튜플

    숫자만 담은 튜플을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    digits = (10, 20, 30)
    digits
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0014():
        digits = (10, 20, 30)
        return digits
    _snippet_0014()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 튜플

    문자열만 담은 튜플을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fruits = ('사과', '바나나', '오렌지')
    fruits
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0016():
        fruits = ('사과', '바나나', '오렌지')
        return fruits
    _snippet_0016()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 혼합 튜플

    여러 타입을 섞어서 튜플을 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    mixed = (1, 'hello', True, 3.14)
    mixed
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        mixed = (1, 'hello', True, 3.14)
        return mixed
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 요소 1개 튜플

    요소가 하나일 때는 쉼표를 꼭 붙여야 합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    single = (42,)
    single
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        single = (42,)
        return single
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 소괄호 없는 튜플

    소괄호 없이 쉼표만으로도 튜플이 됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    packed = 1, 2, 3
    packed
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        packed = 1, 2, 3
        return packed
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 요소가 하나일 때 (42)는 그냥 숫자이고, (42,)가 튜플입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 인덱싱

    *리스트처럼 접근*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플도 리스트처럼 인덱스로 요소에 접근할 수 있습니다. 0부터 시작하는 양수 인덱스와 -1부터 시작하는 음수 인덱스를 모두 사용할 수 있습니다. 접근 방법은 리스트와 완전히 동일합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - tuple[0]으로 첫 번째 요소
    - tuple[-1]로 마지막 요소
    - 리스트와 동일한 인덱싱
    - 대괄호 [] 사용
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
    palette = ('빨강', '초록', '파랑', '노랑')
    palette[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        palette = ('빨강', '초록', '파랑', '노랑')
        return palette[0]
    _snippet_0028()
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
    hues = ('빨강', '초록', '파랑', '노랑')
    hues[-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        hues = ('빨강', '초록', '파랑', '노랑')
        return hues[-1]
    _snippet_0030()
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
    tones = ('빨강', '초록', '파랑', '노랑')
    tones[1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        tones = ('빨강', '초록', '파랑', '노랑')
        return tones[1]
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 튜플의 인덱싱은 리스트와 동일하게 작동합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 슬라이싱

    *부분 튜플 추출*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플도 슬라이싱으로 부분 튜플을 추출할 수 있습니다. [시작:끝] 형식을 사용하며, 결과는 새로운 튜플입니다. step을 지정하여 간격을 두고 추출하거나 역순으로 만들 수도 있습니다. 슬라이싱 문법은 리스트와 완전히 동일합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - tuple[시작:끝] 형식
    - 새로운 튜플 반환
    - step 사용 가능
    - 리스트와 동일한 슬라이싱
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 처음 5개

    [:5]로 처음 5개 요소를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    digits = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
    digits[:5]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        digits = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
        return digits[:5]
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 5개

    [-5:]로 마지막 5개 요소를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sequence = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
    sequence[-5:]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        sequence = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
        return sequence[-5:]
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 하나 건너

    [::2]로 하나 건너 하나씩 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    range10 = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
    range10[::2]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        range10 = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
        return range10[::2]
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 역순

    [::-1]로 튜플을 역순으로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    series = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
    series[::-1]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0044():
        series = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
        return series[::-1]
    _snippet_0044()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 슬라이싱 결과는 항상 새로운 튜플입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플의 불변성

    *변경 불가능한 특성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플은 한 번 만들면 요소를 추가, 삭제, 수정할 수 없습니다. 인덱스로 값을 변경하려고 하면 에러가 발생합니다. 이것이 리스트와 가장 큰 차이점입니다. 불변성 덕분에 안전하게 데이터를 보호할 수 있고, 딕셔너리의 키로 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 요소 추가/삭제/수정 불가
    - 리스트와 가장 큰 차이점
    - 데이터 보호와 안정성
    - 딕셔너리 키로 사용 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 불변성 확인

    튜플은 변경할 수 없습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fixed = (1, 2, 3)
    flex = [1, 2, 3]
    flex[0] = 10
    print('tuple:', fixed)
    print('list_before:', [1, 2, 3])
    print('list_after:', flex)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        fixed = (1, 2, 3)
        flex = [1, 2, 3]
        flex[0] = 10
        print('tuple:', fixed)
        print('list_before:', [1, 2, 3])
        return print('list_after:', flex)
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 튜플[0] = 새값 같은 코드는 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 연결과 반복

    *+ 와 * 연산자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플도 + 연산자로 연결하고 * 연산자로 반복할 수 있습니다. 이 연산들은 원본 튜플을 변경하지 않고 새로운 튜플을 만듭니다. 불변성을 유지하면서도 새로운 튜플을 생성할 수 있는 방법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - + 연산자로 튜플 연결
    - * 연산자로 튜플 반복
    - 원본은 변경 안됨
    - 새로운 튜플 생성
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 연결

    + 연산자로 두 튜플을 연결합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    left = (1, 2, 3)
    right = (4, 5, 6)
    left + right
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0056():
        left = (1, 2, 3)
        right = (4, 5, 6)
        return left + right
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 반복

    * 연산자로 튜플을 반복합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    repeated = (0,) * 5
    repeated
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        repeated = (0,) * 5
        return repeated
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 연결과 반복은 원본을 변경하지 않고 새 튜플을 만듭니다.
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
    튜플도 in과 not in 연산자로 특정 값의 포함 여부를 확인할 수 있습니다. 사용법은 리스트와 완전히 동일합니다. True 또는 False를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값 in 튜플로 확인
    - 값 not in 튜플로 미포함 확인
    - True/False 반환
    - 리스트와 동일한 사용법
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 포함 확인

    in 연산자로 값이 튜플에 있는지 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    weekdays = ('월', '화', '수', '목', '금')
    '수' in weekdays
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0064():
        weekdays = ('월', '화', '수', '목', '금')
        return '수' in weekdays
    _snippet_0064()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 미포함 확인

    not in 연산자로 값이 튜플에 없는지 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    workdays = ('월', '화', '수', '목', '금')
    '일' not in workdays
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        workdays = ('월', '화', '수', '목', '금')
        return '일' not in workdays
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > in 연산자는 튜플에서도 리스트처럼 작동합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 패킹

    *여러 값을 하나로 묶기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    여러 개의 값을 쉼표로 나열하면 자동으로 튜플이 만들어집니다. 이를 튜플 패킹(Tuple Packing)이라고 합니다. 소괄호 없이도 튜플이 생성됩니다. 함수에서 여러 값을 반환할 때 자주 사용되는 기법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 쉼표로 값 나열하면 튜플
    - 소괄호 생략 가능
    - 자동으로 튜플로 묶임
    - 함수 반환값에 자주 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 좌표 패킹

    두 값이 자동으로 튜플로 묶입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    coords = 10, 20
    coords
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0072():
        coords = 10, 20
        return coords
    _snippet_0072()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정보 패킹

    여러 값이 자동으로 튜플로 묶입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    person = '홍길동', 25, '서울'
    person
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0074():
        person = '홍길동', 25, '서울'
        return person
    _snippet_0074()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 쉼표가 튜플을 만드는 핵심입니다. 소괄호는 선택사항입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 언패킹

    *튜플을 여러 변수로 분리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플의 요소들을 여러 개의 변수에 한 번에 할당하는 것을 튜플 언패킹(Tuple Unpacking)이라고 합니다. 튜플의 요소 개수와 변수 개수가 정확히 일치해야 합니다. 값 교환이나 함수 반환값 받기에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 튜플을 여러 변수로 분리
    - 요소 개수와 변수 개수 일치 필수
    - 값 교환에 매우 유용
    - 코드가 간결해짐
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 좌표 언패킹

    튜플의 요소를 두 변수로 분리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    point = (100, 200)
    px, py = point
    px, py
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0080():
        point = (100, 200)
        px, py = point
        return (px, py)
    _snippet_0080()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정보 언패킹

    여러 값을 여러 변수로 분리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    name, age, city = '김철수', 30, '부산'
    name, age, city
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0082():
        name, age, city = '김철수', 30, '부산'
        return (name, age, city)
    _snippet_0082()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > a, b = b, a 로 두 변수의 값을 간단히 교환할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플과 리스트 변환

    *tuple()과 list() 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    tuple() 함수는 리스트를 튜플로, list() 함수는 튜플을 리스트로 변환합니다. 데이터를 수정해야 할 때는 리스트로, 보호해야 할 때는 튜플로 변환합니다. 문자열도 tuple()이나 list()로 변환하면 문자들이 개별 요소가 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - tuple(리스트)로 튜플로 변환
    - list(튜플)로 리스트로 변환
    - 수정 필요시 리스트로
    - 보호 필요시 튜플로
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트를 튜플로

    tuple() 함수로 리스트를 튜플로 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    items = [1, 2, 3, 4, 5]
    tuple(items)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0088():
        items = [1, 2, 3, 4, 5]
        return tuple(items)
    _snippet_0088()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플을 리스트로

    list() 함수로 튜플을 리스트로 변환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    chars = ('a', 'b', 'c')
    list(chars)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0090():
        chars = ('a', 'b', 'c')
        return list(chars)
    _snippet_0090()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > tuple('hello')는 ('h', 'e', 'l', 'l', 'o')가 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 메서드

    *count()와 index()*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    튜플은 수정 불가능하기 때문에 리스트보다 메서드가 적습니다. count()는 특정 값의 개수를, index()는 특정 값의 위치를 반환합니다. 이 두 메서드는 리스트의 메서드와 완전히 동일하게 작동합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - count(값): 값의 개수 반환
    - index(값): 값의 인덱스 반환
    - 리스트보다 메서드 적음
    - 수정 메서드는 없음
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### count 메서드

    count()로 값의 개수를 셉니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sample = (1, 2, 3, 2, 4, 2, 5)
    sample.count(2)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0096():
        sample = (1, 2, 3, 2, 4, 2, 5)
        return sample.count(2)
    _snippet_0096()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### index 메서드

    index()로 값의 위치를 찾습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    items = (1, 2, 3, 2, 4, 2, 5)
    items.index(4)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0098():
        items = (1, 2, 3, 2, 4, 2, 5)
        return items.index(4)
    _snippet_0098()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > append, remove 같은 수정 메서드는 튜플에 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 튜플 길이

    *len() 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 튜플의 요소 개수를 반환합니다. 리스트, 문자열과 동일하게 작동합니다. 튜플이 몇 개의 요소를 가지고 있는지 알 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len(튜플)로 길이 확인
    - 요소 개수 반환
    - 리스트와 동일
    - 빈 튜플은 0
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 길이

    len() 함수로 튜플 요소 개수를 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    week = ('월', '화', '수', '목', '금', '토', '일')
    len(week)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0104():
        week = ('월', '화', '수', '목', '금', '토', '일')
        return len(week)
    _snippet_0104()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 튜플 길이

    빈 튜플의 길이는 0입니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    empty = ()
    len(empty)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0106():
        empty = ()
        return len(empty)
    _snippet_0106()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > len()은 문자열, 리스트, 튜플 모두에 사용 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 9 종합 복습

    *튜플 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 9에서 배운 튜플을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 튜플 생성

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
    ### 연습: 🟢 기본2: 튜플 인덱싱

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
    ### 연습: 🟢 기본3: 튜플 슬라이싱

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
    ### 연습: 🟢 기본4: 튜플 패킹

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
    ### 연습: 🟢 기본5: 튜플 언패킹

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
    ### 연습: 🟡 응용1: 좌표 시스템

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 좌표1
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
    #### 좌표2
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
    #### X 거리
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
    #### Y 거리
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
    ### 연습: 🟡 응용2: 사용자 정보

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 사용자 튜플
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
    #### 정보 문자열
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
    #### 튜플 길이
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
    ### 연습: 🟡 응용3: RGB 색상

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 빨강
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
    #### 초록
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
    #### 노랑 합성
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
    ### 연습: 🟡 응용4: 시간 정보

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 시간 튜플
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
    #### 시
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
    #### 분
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
    #### 총 초
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
    ### 연습: 🟡 응용5: 날짜 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 날짜 튜플
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
    #### 연도
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
    #### 겨울 여부
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
    #### 날짜 문자열
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
    ### 연습: 🔴 심화1-1: 성적 데이터 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 점수
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
    #### 과목
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
    ### 연습: 🔴 심화1-2: 성적 순위 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 상위 3개
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
    #### 국어 인덱스
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
    ### 연습: 🔴 심화2-1: 좌표 정보 추출

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 좌표
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
    #### 첫 좌표
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
    #### 마지막 좌표
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
    ### 연습: 🔴 심화2-2: 좌표 연산

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 너비
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
    #### 높이
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
    #### 중심점
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
    ### 연습: 🔴 심화3-1: 상품 재고 정보

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 상품1
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
    #### 상품2
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
    #### 상품3
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
    ### 연습: 🔴 심화3-2: 상품 재고 가치 계산

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 상품1 가치
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
    #### 전체 재고 가치
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
    ### 연습: 🔴 심화4: 값 교환과 정렬

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 교환 후
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
    #### 정렬
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
    #### 최대값
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
    #### 최소값
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
    ### 연습: 🔴 심화5-1: 통계 기본 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 데이터
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
    #### 20의 개수
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
    #### 30의 인덱스
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
    #### 길이
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
    ### 연습: 🔴 심화5-2: 통계 슬라이싱 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 처음 3개
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
    #### 마지막 3개
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
    ### 연습: 🔴 심화5-3: 통계 포함 여부 확인

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 40 포함 여부
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
    #### 60 포함 여부
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

    - 튜플과 리스트의 차이를 설명할 수 있다.
    - 튜플 패킹과 언패킹을 사용할 수 있다.
    - 값 개수가 맞지 않을 때 왜 오류가 나는지 말할 수 있다.

    ## 흔한 막힘

    - 원소 1개 튜플의 쉼표를 빠뜨림
    - 튜플 값을 직접 바꾸려 함
    - 언패킹 변수 개수를 맞추지 않음

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
