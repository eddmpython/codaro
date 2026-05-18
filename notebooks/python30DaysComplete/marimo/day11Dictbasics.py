import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 11. 딕셔너리기초")


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
    # Day 11. 딕셔너리기초

    이 노트북은 `study/python/30days/day11_딕셔너리기초.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 키-값 쌍으로 데이터 저장
    - 키로 빠르게 값에 접근
    - 딕셔너리 생성과 수정
    - 실전 데이터 구조 활용

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

    - 오늘 새로 배우는 개념: 딕셔너리, 키와 값, 딕셔너리 만들기, 딕셔너리 값 읽기, 딕셔너리 값 바꾸기
    - 이미 써도 되는 개념: 리스트 전체, 튜플, 집합
    - 오늘은 일부러 쓰지 않는 개념: 딕셔너리 메서드, 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 딕셔너리란?

    *키로 찾는 데이터 저장소*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리(Dictionary)는 키(Key)와 값(Value)을 쌍으로 저장하는 자료구조입니다. 중괄호 {}로 만들고, 키:값 형태로 데이터를 저장합니다. 실제 사전처럼 단어(키)로 뜻(값)을 찾듯이, 키를 사용하여 값을 빠르게 찾을 수 있습니다. 리스트는 인덱스(숫자)로 접근하지만, 딕셔너리는 의미있는 키(문자열, 숫자 등)로 접근합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 중괄호 {}와 콜론 : 사용
    - 키:값 쌍으로 저장
    - 키로 빠른 검색 가능
    - 실제 사전과 유사한 구조
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리 만들기

    키-값 쌍으로 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    lang = {'name': 'Python', 'type': 'Language', 'year': 1991}
    lang
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0007():
        lang = {'name': 'Python', 'type': 'Language', 'year': 1991}
        return lang
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 딕셔너리는 순서를 보장하지 않았지만, Python 3.7부터는 입력 순서를 유지합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 딕셔너리 생성하기

    *다양한 방법으로 만들기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리는 중괄호로 직접 만들거나 dict() 함수를 사용합니다. 빈 딕셔너리는 {}나 dict()로 만듭니다. 키는 문자열, 숫자, 튜플 등 변경 불가능한(immutable) 타입이어야 합니다. 값은 어떤 타입이든 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 중괄호 {'키': '값'} 형태
    - dict() 함수로도 생성 가능
    - 빈 딕셔너리는 {} 또는 dict()
    - 키는 immutable 타입만 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 키 딕셔너리

    문자열 키로 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    person = {'name': '홍길동', 'age': 25, 'city': '서울'}
    person
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0013():
        person = {'name': '홍길동', 'age': 25, 'city': '서울'}
        return person
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 딕셔너리

    빈 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    empty = {}
    empty
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0015():
        empty = {}
        return empty
    _snippet_0015()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 키 딕셔너리

    숫자 키로 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    numbers = {1: 'one', 2: 'two', 3: 'three'}
    numbers
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0017():
        numbers = {1: 'one', 2: 'two', 3: 'three'}
        return numbers
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 혼합 값 딕셔너리

    여러 타입의 값을 가진 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    mixed = {'count': 10, 'active': True, 'price': 19.99}
    mixed
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0019():
        mixed = {'count': 10, 'active': True, 'price': 19.99}
        return mixed
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 리스트는 키로 사용할 수 없지만, 튜플은 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 키로 값 접근하기

    *대괄호 [] 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리에서 값을 가져올 때는 대괄호 [] 안에 키를 넣습니다. dict[key] 형식으로 사용하면 그 키에 해당하는 값을 반환합니다. 존재하지 않는 키를 사용하면 에러가 발생합니다. 리스트의 인덱스 접근과 비슷하지만, 숫자 대신 키를 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict[키] 형식으로 접근
    - 키에 해당하는 값 반환
    - 없는 키는 에러 발생
    - 리스트의 인덱싱과 유사
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 이름 가져오기

    키 'name'으로 값을 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    dev = {'name': '김철수', 'age': 30, 'job': 'developer'}
    dev['name']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0025():
        dev = {'name': '김철수', 'age': 30, 'job': 'developer'}
        return dev['name']
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 나이 가져오기

    키 'age'로 값을 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    worker = {'name': '김철수', 'age': 30, 'job': 'developer'}
    worker['age']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0027():
        worker = {'name': '김철수', 'age': 30, 'job': 'developer'}
        return worker['age']
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 직업 가져오기

    키 'job'으로 값을 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    staff = {'name': '김철수', 'age': 30, 'job': 'developer'}
    staff['job']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0029():
        staff = {'name': '김철수', 'age': 30, 'job': 'developer'}
        return staff['job']
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 키 이름을 정확히 입력해야 합니다. 대소문자도 구분합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 키로 값 수정하기

    *기존 값 변경*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리의 값을 수정할 때는 접근과 동일하게 대괄호를 사용하고 새 값을 할당합니다. dict[key] = new_value 형식입니다. 리스트처럼 원본이 직접 변경됩니다. 이미 있는 키에 값을 할당하면 기존 값이 새 값으로 교체됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict[키] = 새값 형식
    - 기존 값이 새 값으로 교체
    - 원본 딕셔너리 직접 변경
    - 리스트 수정과 유사
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 가격 수정

    키 'price'의 값을 변경합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    laptop = {'name': '노트북', 'price': 1000000, 'stock': 5}
    laptop['price'] = 1200000
    laptop
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0035():
        laptop = {'name': '노트북', 'price': 1000000, 'stock': 5}
        laptop['price'] = 1200000
        return laptop
    _snippet_0035()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 재고 수정

    키 'stock'의 값을 변경합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    device = {'name': '노트북', 'price': 1000000, 'stock': 5}
    device['stock'] = 3
    device
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0037():
        device = {'name': '노트북', 'price': 1000000, 'stock': 5}
        device['stock'] = 3
        return device
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 같은 키에 할당하면 값이 변경됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 새 키-값 쌍 추가하기

    *없는 키에 값 할당*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리에 새로운 키-값 쌍을 추가할 때도 대괄호를 사용합니다. 존재하지 않는 키에 값을 할당하면 자동으로 새 항목이 추가됩니다. dict[new_key] = value 형식입니다. 리스트의 append()처럼 별도의 메서드 없이 간단히 추가할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict[새키] = 값 형식
    - 없는 키면 자동 추가
    - 있는 키면 값 수정
    - append() 없이 간단히 추가
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 도시 추가

    새로운 키 'city'를 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    member = {'name': '이영희', 'age': 28}
    member['city'] = '부산'
    member
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0043():
        member = {'name': '이영희', 'age': 28}
        member['city'] = '부산'
        return member
    _snippet_0043()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 직업 추가

    새로운 키 'job'을 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    user = {'name': '이영희', 'age': 28}
    user['job'] = 'designer'
    user
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0045():
        user = {'name': '이영희', 'age': 28}
        user['job'] = 'designer'
        return user
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 없는 키에 할당하면 추가, 있는 키에 할당하면 수정됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## del로 키-값 삭제

    *항목 제거하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    del 키워드를 사용하여 딕셔너리에서 특정 키-값 쌍을 삭제할 수 있습니다. del dict[key] 형식으로 사용하며, 해당 키와 값이 함께 제거됩니다. 존재하지 않는 키를 삭제하려 하면 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - del dict[키] 형식
    - 키-값 쌍 제거
    - 없는 키 삭제시 에러
    - 원본 딕셔너리 직접 변경
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 'b' 삭제

    del로 키 'b'와 값을 삭제합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    alpha = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
    del alpha['b']
    alpha
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0051():
        alpha = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
        del alpha['b']
        return alpha
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 'd' 삭제

    del로 키 'd'와 값을 삭제합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    keys = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
    del keys['d']
    keys
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0053():
        keys = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
        del keys['d']
        return keys
    _snippet_0053()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > del은 변수 자체를 삭제할 때도 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## in/not in 연산자

    *키 존재 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in과 not in 연산자로 딕셔너리에 특정 키가 있는지 확인할 수 있습니다. key in dict 형식으로 사용하며, 키의 존재 여부를 True/False로 반환합니다. 주의할 점은 키를 확인하는 것이지 값을 확인하는 것이 아닙니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 키 in dict로 키 확인
    - 키 not in dict로 미존재 확인
    - 키만 확인, 값은 확인 안함
    - True/False 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 포함 확인

    in 연산자로 키가 딕셔너리에 있는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    grades = {'math': 85, 'english': 90, 'science': 88}
    'math' in grades
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0059():
        grades = {'math': 85, 'english': 90, 'science': 88}
        return 'math' in grades
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 미포함 확인

    not in 연산자로 키가 딕셔너리에 없는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    scores = {'math': 85, 'english': 90, 'science': 88}
    'history' not in scores
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0061():
        scores = {'math': 85, 'english': 90, 'science': 88}
        return 'history' not in scores
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 값의 존재를 확인하려면 values() 메서드를 사용해야 합니다(Day 12).
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 딕셔너리 길이

    *len() 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 딕셔너리의 키-값 쌍 개수를 반환합니다. 리스트, 튜플, 집합과 동일하게 작동합니다. 딕셔너리가 몇 개의 항목을 가지고 있는지 알 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len(dict)로 길이 확인
    - 키-값 쌍의 개수 반환
    - 빈 딕셔너리는 0
    - 다른 자료구조와 동일
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리 길이

    len() 함수로 키-값 쌍 개수를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    profile = {'name': '박민수', 'age': 35, 'city': '대구', 'job': 'teacher'}
    len(profile)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0067():
        profile = {'name': '박민수', 'age': 35, 'city': '대구', 'job': 'teacher'}
        return len(profile)
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 딕셔너리 길이

    빈 딕셔너리의 길이는 0입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    blank = {}
    len(blank)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0069():
        blank = {}
        return len(blank)
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > len()은 키의 개수를 셉니다. 값의 개수가 아닙니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 키-값 접근

    *한 번에 여러 값 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리에서 여러 값을 가져와야 할 때는 각 키로 개별적으로 접근합니다. 리스트처럼 슬라이싱은 없지만, 필요한 키들로 값을 가져와 새 딕셔너리나 튜플로 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 각 키로 개별 접근
    - 여러 값을 dict나 tuple로 묶기
    - 슬라이싱은 불가능
    - 필요한 키만 선택적 접근
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 정보만 추출

    여러 키로 값을 가져와 새 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    full = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
    basic = {'name': full['name'], 'age': full['age']}
    basic
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0075():
        full = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
        basic = {'name': full['name'], 'age': full['age']}
        return basic
    _snippet_0075()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 특정 값 추출

    필요한 키만 선택하여 값을 가져옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    detail = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
    detail['city'], detail['job']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0077():
        detail = {'name': '정지은', 'age': 27, 'city': '인천', 'job': 'engineer', 'hobby': 'reading'}
        return (detail['city'], detail['job'])
    _snippet_0077()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 필요한 정보만 선택하여 새 딕셔너리를 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중첩 딕셔너리

    *딕셔너리 안의 딕셔너리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리의 값으로 다른 딕셔너리를 저장할 수 있습니다. 이를 중첩 딕셔너리라고 합니다. 복잡한 계층 구조의 데이터를 표현할 때 유용합니다. 중첩된 딕셔너리에 접근할 때는 대괄호를 연속으로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값으로 딕셔너리 저장 가능
    - 계층 구조 데이터 표현
    - dict[key1][key2] 형식 접근
    - 복잡한 데이터 구조화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중첩 딕셔너리 전체

    딕셔너리 안에 딕셔너리를 저장합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    team = {
    'user1': {'name': '김개발', 'age': 28},
    'user2': {'name': '이디자인', 'age': 25}
    }
    team['user1']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0083():
        team = {
            'user1': {'name': '김개발', 'age': 28},
            'user2': {'name': '이디자인', 'age': 25}
        }
        return team['user1']
    _snippet_0083()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중첩 값 접근

    대괄호를 연속으로 사용하여 중첩된 값에 접근합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    group = {
    'user1': {'name': '김개발', 'age': 28},
    'user2': {'name': '이디자인', 'age': 25}
    }
    group['user1']['name']
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0085():
        group = {
            'user1': {'name': '김개발', 'age': 28},
            'user2': {'name': '이디자인', 'age': 25}
        }
        return group['user1']['name']
    _snippet_0085()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중첩 딕셔너리는 JSON 데이터 구조와 유사합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다양한 키 타입

    *문자열, 숫자, 튜플*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리의 키는 변경 불가능한(immutable) 타입이면 모두 사용 가능합니다. 문자열이 가장 많이 사용되지만, 숫자나 튜플도 키로 사용할 수 있습니다. 리스트, 딕셔너리, 집합은 변경 가능(mutable)하므로 키로 사용할 수 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 문자열: 가장 일반적
    - 숫자: 정수, 실수 모두 가능
    - 튜플: 좌표 등에 유용
    - 리스트/딕셔너리/집합: 불가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 키

    문자열을 키로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    config = {'name': 'Python', 'version': '3.9'}
    config
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0091():
        config = {'name': 'Python', 'version': '3.9'}
        return config
    _snippet_0091()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 숫자 키

    숫자를 키로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    ordinal = {1: 'first', 2: 'second', 3: 'third'}
    ordinal
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0093():
        ordinal = {1: 'first', 2: 'second', 3: 'third'}
        return ordinal
    _snippet_0093()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플 키

    튜플을 키로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    coords = {(0, 0): 'origin', (10, 20): 'point1', (30, 40): 'point2'}
    coords[(0, 0)]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0095():
        coords = {(0, 0): 'origin', (10, 20): 'point1', (30, 40): 'point2'}
        return coords[0, 0]
    _snippet_0095()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 튜플 키는 좌표나 날짜 같은 복합 키에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 11 종합 복습

    *딕셔너리 기초 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 11에서 배운 딕셔너리 기초를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 딕셔너리 생성

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
    ### 연습: 🟢 기본2: 값 접근

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
    ### 연습: 🟢 기본3: 값 수정

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
    ### 연습: 🟢 기본4: 항목 추가

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
    ### 연습: 🟢 기본5: 키 확인

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
    ### 연습: 🟡 응용1: 사용자 프로필

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
    ### 연습: 🟡 응용2: 상품 정보

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
    ### 연습: 🟡 응용3: 성적 관리

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
    ### 연습: 🟡 응용4: 재고 업데이트

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
    ### 연습: 🟡 응용5: 좌표 시스템

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
    ### 연습: 🔴 심화1-1: 학생 정보 구축

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
    ### 연습: 🔴 심화1-2: 학생 데이터 분석

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
    ### 연습: 🔴 심화2-1: 주문 정보 생성

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
    ### 연습: 🔴 심화2-2: 주문 금액 계산

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
    ### 연습: 🔴 심화3-1: 캐릭터 레벨업

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
    ### 연습: 🔴 심화3-2: 캐릭터 스탯 분석

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
    ### 연습: 🔴 심화4-1: 조직도 구축

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
    ### 연습: 🔴 심화4-2: 조직도 분석

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
    ### 연습: 🔴 심화5-1: 매출 데이터 분석

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
    ### 연습: 🔴 심화5-2: 성장률 계산

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
