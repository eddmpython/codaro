import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 06. 문자열 메서드")


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
    # Day 06. 문자열 메서드

    이 노트북은 `study/python/30days/day06_문자열메서드.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 대소문자 변환 메서드
    - 공백 제거와 문자열 정리
    - 문자열 치환과 검색
    - 문자열 분할과 개수 세기

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

    - 오늘 새로 배우는 개념: upper(), lower(), split(), join(), replace(), strip(), find(), count()
    - 이미 써도 되는 개념: 문자열 기초, 인덱싱, 슬라이싱
    - 오늘은 일부러 쓰지 않는 개념: 리스트 메서드, 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 대문자 변환

    *upper()로 모두 대문자로*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    upper() 메서드는 문자열의 모든 문자를 대문자로 변환합니다. 영문자만 영향을 받으며, 숫자나 특수문자는 그대로 유지됩니다. 원본 문자열은 변경되지 않고 새로운 문자열을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 모든 문자를 대문자로 변환
    - 원본은 변경되지 않음
    - 새로운 문자열 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 대문자 변환

    문자열을 모두 대문자로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = 'hello python'
    text.upper()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        text = 'hello python'
        return text.upper()
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 소문자 변환

    *lower()로 모두 소문자로*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    lower() 메서드는 문자열의 모든 문자를 소문자로 변환합니다. 대소문자 구분 없이 비교할 때 자주 사용됩니다. 원본 문자열은 그대로 유지됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 모든 문자를 소문자로 변환
    - 대소문자 구분 없는 비교에 유용
    - 원본은 유지됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 소문자 변환

    문자열을 모두 소문자로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    msg = 'HELLO PYTHON'
    msg.lower()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        msg = 'HELLO PYTHON'
        return msg.lower()
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 첫 글자 대문자

    *capitalize()로 첫 문자만 대문자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    capitalize() 메서드는 문자열의 첫 번째 문자만 대문자로 만들고 나머지는 모두 소문자로 변환합니다. 문장의 시작을 정리할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 첫 문자만 대문자
    - 나머지는 모두 소문자
    - 문장 시작 정리에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 글자 대문자

    첫 문자만 대문자로 변환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    phrase = 'hello PYTHON'
    phrase.capitalize()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        phrase = 'hello PYTHON'
        return phrase.capitalize()
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 제목 형식

    *title()로 각 단어 첫 글자 대문자*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    title() 메서드는 각 단어의 첫 글자를 대문자로 만듭니다. 공백이나 특수문자로 구분된 각 단어마다 적용됩니다. 제목이나 이름을 정리할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 각 단어 첫 글자 대문자
    - 나머지는 소문자
    - 제목 형식으로 변환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 제목 형식

    각 단어의 첫 글자를 대문자로 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    sentence = 'hello python programming'
    sentence.title()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        sentence = 'hello python programming'
        return sentence.title()
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 양쪽 공백 제거

    *strip()으로 공백 정리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    strip() 메서드는 문자열 양쪽 끝의 공백을 제거합니다. 사용자 입력을 정리하거나 데이터를 깔끔하게 만들 때 자주 사용됩니다. 문자열 중간의 공백은 제거하지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 양쪽 끝 공백 제거
    - 중간 공백은 유지
    - 입력 데이터 정리에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 공백 제거

    문자열 양쪽의 공백을 제거합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    raw = '   hello python   '
    raw.strip()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        raw = '   hello python   '
        return raw.strip()
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 한쪽 공백 제거

    *lstrip(), rstrip()으로 한쪽만 제거*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    lstrip()은 왼쪽 공백만, rstrip()은 오른쪽 공백만 제거합니다. l은 left(왼쪽), r은 right(오른쪽)를 의미합니다. 특정 방향의 공백만 제거할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - lstrip(): 왼쪽 공백 제거
    - rstrip(): 오른쪽 공백 제거
    - 한쪽만 정리 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 왼쪽 공백 제거

    lstrip()으로 왼쪽 공백만 제거합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    left = '   hello   '
    left.lstrip()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        left = '   hello   '
        return left.lstrip()
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 오른쪽 공백 제거

    rstrip()으로 오른쪽 공백만 제거합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    right = '   hello   '
    right.rstrip()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0034():
        right = '   hello   '
        return right.rstrip()
    _snippet_0034()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 치환

    *replace()로 문자 바꾸기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    replace() 메서드는 문자열 안의 특정 부분을 다른 문자열로 바꿉니다. replace(찾을문자, 바꿀문자) 형태로 사용하며, 모든 일치하는 부분을 바꿉니다. 원본은 변경되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 문자열 치환
    - 모든 일치 부분 변경
    - replace(old, new) 형태
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 치환

    특정 문자를 다른 문자로 바꿉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    greeting = 'Hello World'
    greeting.replace('World', 'Python')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0039():
        greeting = 'Hello World'
        return greeting.replace('World', 'Python')
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 개 치환

    *모든 일치 항목 바꾸기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    replace()는 기본적으로 일치하는 모든 부분을 바꿉니다. 같은 문자가 여러 번 나와도 모두 치환됩니다. 공백을 다른 문자로 바꾸거나 특정 패턴을 제거할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 모든 일치 부분 치환
    - 여러 번 반복 가능
    - 공백 제거/변경에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 개 치환

    같은 문자가 여러 번 나올 때 모두 바꿉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    allText = 'apple apple orange apple'
    allText.replace('apple', 'banana')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0044():
        allText = 'apple apple orange apple'
        return allText.replace('apple', 'banana')
    _snippet_0044()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 개수 세기

    *count()로 등장 횟수 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    count() 메서드는 문자열에서 특정 문자나 문자열이 몇 번 등장하는지 셉니다. 결과는 정수로 반환되며, 없으면 0을 반환합니다. 대소문자를 구분합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 등장 횟수 세기
    - 결과는 정수
    - 대소문자 구분
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 개수 세기

    특정 문자가 몇 번 나오는지 셉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    words = 'hello hello world hello'
    words.count('hello')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0049():
        words = 'hello hello world hello'
        return words.count('hello')
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 문자열 위치 찾기

    *find()로 첫 등장 위치 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    find() 메서드는 문자열에서 특정 문자나 문자열이 처음 나타나는 위치(인덱스)를 반환합니다. 찾지 못하면 -1을 반환합니다. 문자열의 위치를 확인할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 첫 등장 위치 반환
    - 못 찾으면 -1 반환
    - 인덱스로 결과 제공
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 위치 찾기

    특정 문자가 처음 나오는 위치를 찾습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    code = 'Hello Python Programming'
    code.find('Python')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0054():
        code = 'Hello Python Programming'
        return code.find('Python')
    _snippet_0054()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 찾기 실패

    *없는 문자 찾을 때*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    find() 메서드로 문자열을 찾지 못하면 -1을 반환합니다. 이를 활용하여 특정 문자열의 존재 여부를 확인할 수 있습니다. in 연산자와 비슷하지만 위치 정보도 함께 얻을 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 못 찾으면 -1 반환
    - 존재 여부 확인 가능
    - in 연산자와 유사
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 찾기 결과

    없는 문자를 찾으면 -1을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    text = 'Hello World'
    result = text.find('Python')
    print('found:', result)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        text = 'Hello World'
        result = text.find('Python')
        return print('found:', result)
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 존재 여부 확인

    find 결과로 존재 여부를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    msg = 'Hello World'
    exists = msg.find('Python') != -1
    print('exists:', exists)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        msg = 'Hello World'
        exists = msg.find('Python') != -1
        return print('exists:', exists)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시작 문자 확인

    *startswith()로 시작 여부 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    startswith() 메서드는 문자열이 특정 문자로 시작하는지 확인합니다. 결과는 True 또는 False입니다. URL이 http로 시작하는지, 파일명이 특정 문자로 시작하는지 등을 확인할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 시작 문자 확인
    - 결과는 True/False
    - URL, 파일명 검증에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 시작 문자 확인

    특정 문자로 시작하는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    title = 'Python Programming'
    title.startswith('Python')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0066():
        title = 'Python Programming'
        return title.startswith('Python')
    _snippet_0066()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 끝 문자 확인

    *endswith()로 종료 여부 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    endswith() 메서드는 문자열이 특정 문자로 끝나는지 확인합니다. 파일 확장자 확인이나 문장 부호 확인 등에 자주 사용됩니다. 결과는 True 또는 False입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 끝 문자 확인
    - 결과는 True/False
    - 파일 확장자 검증에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 끝 문자 확인

    특정 문자로 끝나는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    file = 'script.py'
    file.endswith('.py')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0071():
        file = 'script.py'
        return file.endswith('.py')
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 6 종합 복습

    *문자열 메서드 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 6에서 배운 문자열 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 대문자 변환

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
    ### 연습: 🟢 기본2: 소문자 변환

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
    ### 연습: 🟢 기본3: 공백 제거

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
    ### 연습: 🟢 기본4: 문자열 치환

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
    ### 연습: 🟢 기본5: 개수 세기

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
    ### 연습: 🟡 응용1: 이름 정리

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
    ### 연습: 🟡 응용2: 파일 확장자 확인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### PDF 확인
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### TXT 확인
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: URL 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### HTTPS 확인
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### WWW 포함 확인
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 문자 치환

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
    ### 연습: 🟡 응용5: 위치 찾기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### @ 위치
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### . 위치
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 문자열 정규화

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
    ### 연습: 🔴 심화2: 비밀번호 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 숫자 포함 여부
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 최소 길이 확인
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 대문자 포함 여부
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 문자열 분석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### Hello 개수
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 느낌표 위치
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 대문자 버전
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 느낌표 제거
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 데이터 정제

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
    ### 연습: 🔴 심화5: 여러 메서드 조합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 소문자 변환
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 대시를 공백으로
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 제목 형식 변환
    """)
    return

@app.cell
def _():
    # 아래 두 줄을 지우고 직접 작성하세요.
    _result = None
    _result
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 대시 개수
    """)
    return

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
