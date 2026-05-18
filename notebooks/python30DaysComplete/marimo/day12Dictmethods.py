import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 12. 딕셔너리메서드")


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
    # Day 12. 딕셔너리메서드

    이 노트북은 `study/python/30days/day12_딕셔너리메서드.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    딕셔너리 메서드로 값을 안전하게 읽고, 키/값/항목을 순회할 준비를 합니다.

    ## 왜 중요한가

    딕셔너리를 실무처럼 쓰려면 없는 값 처리와 전체 항목 확인이 필요합니다.

    ## 생각 모델

    딕셔너리 메서드는 서랍의 이름표 목록, 값 목록, 한 쌍 목록을 꺼내는 도구입니다.

    ## 오늘 배우는 것

    - 안전한 값 접근 get()
    - 키, 값, 아이템 순회
    - 딕셔너리 병합과 삭제
    - 실전 데이터 처리

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

    - 오늘 새로 배우는 개념: get(), keys(), values(), items(), update(), pop(), popitem(), clear()
    - 이미 써도 되는 개념: 딕셔너리 기초
    - 오늘은 일부러 쓰지 않는 개념: 직접 만드는 함수, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: get()은 없을 때 대체값을 줄 수 있다는 점을 먼저 떠올립니다.
    - 실행 중: keys(), values(), items()의 출력 모양을 비교합니다.
    - 연습 초점: 프로필 딕셔너리에서 없는 정보는 기본값으로 표시하도록 만들어봅니다.
    - 막히면: pop() 이후 같은 키를 다시 읽는 코드가 있는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## get() 메서드

    *안전한 값 접근*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    get() 메서드는 대괄호[] 접근의 안전한 대안입니다. 키가 없어도 에러 없이 None을 반환하며, 기본값을 지정할 수도 있습니다. dict.get(key) 또는 dict.get(key, default) 형식으로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.get(key) 형식
    - 없는 키는 None 반환
    - 기본값 지정 가능
    - 에러 없이 안전
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 get()

    존재하는 키로 값을 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    config = {'host': 'localhost', 'port': 8080}
    config.get('host')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        config = {'host': 'localhost', 'port': 8080}
        return config.get('host')
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 없는 키 get()

    없는 키는 None을 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    server = {'host': 'localhost', 'port': 8080}
    server.get('user')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        server = {'host': 'localhost', 'port': 8080}
        return server.get('user')
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 지정

    두 번째 인자로 기본값을 지정합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    db = {'host': 'localhost', 'port': 5432}
    db.get('user', 'admin')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        db = {'host': 'localhost', 'port': 5432}
        return db.get('user', 'admin')
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > get()은 설정값이나 옵션 처리에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## keys() 메서드

    *모든 키 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    keys() 메서드는 딕셔너리의 모든 키를 dict_keys 객체로 반환합니다. list()로 변환하여 리스트로 사용할 수 있습니다. 키만 필요할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.keys() 형식
    - dict_keys 객체 반환
    - list()로 변환 가능
    - 키 목록 확인용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### keys() 기본

    딕셔너리의 모든 키를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    grade = {'math': 85, 'english': 90, 'science': 88}
    grade.keys()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        grade = {'math': 85, 'english': 90, 'science': 88}
        return grade.keys()
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 변환

    list()로 변환하여 리스트로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    score = {'math': 85, 'english': 90, 'science': 88}
    list(score.keys())
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        score = {'math': 85, 'english': 90, 'science': 88}
        return list(score.keys())
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 개수 확인

    len()과 함께 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    point = {'math': 85, 'english': 90, 'science': 88}
    len(point.keys())
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        point = {'math': 85, 'english': 90, 'science': 88}
        return len(point.keys())
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > keys()는 딕셔너리 순회나 키 확인에 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## values() 메서드

    *모든 값 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    values() 메서드는 딕셔너리의 모든 값을 dict_values 객체로 반환합니다. list()로 변환하여 리스트로 사용할 수 있습니다. 값만 필요할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.values() 형식
    - dict_values 객체 반환
    - list()로 변환 가능
    - 값 목록 확인용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### values() 기본

    딕셔너리의 모든 값을 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    exam = {'math': 85, 'english': 90, 'science': 88}
    exam.values()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        exam = {'math': 85, 'english': 90, 'science': 88}
        return exam.values()
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 변환

    list()로 변환하여 리스트로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    test = {'math': 85, 'english': 90, 'science': 88}
    list(test.values())
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        test = {'math': 85, 'english': 90, 'science': 88}
        return list(test.values())
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 확인

    특정 값이 있는지 in으로 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    result = {'math': 85, 'english': 90, 'science': 88}
    85 in result.values()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        result = {'math': 85, 'english': 90, 'science': 88}
        return 85 in result.values()
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > values()는 값의 존재 확인이나 통계 계산에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## items() 메서드

    *키-값 쌍 가져오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    items() 메서드는 딕셔너리의 모든 키-값 쌍을 dict_items 객체로 반환합니다. 각 항목은 (키, 값) 튜플 형태입니다. list()로 변환하면 튜플의 리스트가 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.items() 형식
    - dict_items 객체 반환
    - (키, 값) 튜플로 반환
    - 순회와 변환에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### items() 기본

    딕셔너리의 모든 키-값 쌍을 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    product = {'name': '노트북', 'price': 1200000, 'stock': 5}
    product.items()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        product = {'name': '노트북', 'price': 1200000, 'stock': 5}
        return product.items()
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 변환

    list()로 변환하여 튜플 리스트로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    item = {'name': '노트북', 'price': 1200000, 'stock': 5}
    list(item.items())
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        item = {'name': '노트북', 'price': 1200000, 'stock': 5}
        return list(item.items())
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 아이템

    리스트로 변환 후 인덱싱합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    goods = {'name': '노트북', 'price': 1200000, 'stock': 5}
    pairs = list(goods.items())
    pairs[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        goods = {'name': '노트북', 'price': 1200000, 'stock': 5}
        pairs = list(goods.items())
        return pairs[0]
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > items()는 딕셔너리 전체를 순회하거나 변환할 때 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## update() 메서드

    *딕셔너리 병합*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    update() 메서드는 다른 딕셔너리의 키-값 쌍을 현재 딕셔너리에 추가하거나 업데이트합니다. dict1.update(dict2) 형식으로 사용하며, dict2의 내용이 dict1에 병합됩니다. 같은 키가 있으면 값이 덮어씌워집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict1.update(dict2) 형식
    - dict2의 내용을 dict1에 병합
    - 같은 키는 값 덮어쓰기
    - 원본 딕셔너리 직접 변경
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 새 키 추가

    다른 딕셔너리의 새 키를 추가합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    user = {'name': '김철수', 'age': 30}
    extra = {'city': '서울', 'job': 'developer'}
    user.update(extra)
    user
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        user = {'name': '김철수', 'age': 30}
        extra = {'city': '서울', 'job': 'developer'}
        user.update(extra)
        return user
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 덮어쓰기

    같은 키가 있으면 값이 업데이트됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    account = {'name': '이영희', 'age': 25, 'city': '부산'}
    change = {'age': 26, 'job': 'designer'}
    account.update(change)
    account
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        account = {'name': '이영희', 'age': 25, 'city': '부산'}
        change = {'age': 26, 'job': 'designer'}
        account.update(change)
        return account
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 번 병합

    여러 딕셔너리를 순차적으로 병합합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    base = {'name': '박민수'}
    info1 = {'age': 35, 'city': '대구'}
    info2 = {'job': 'teacher', 'hobby': 'reading'}
    base.update(info1)
    base.update(info2)
    base
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        base = {'name': '박민수'}
        info1 = {'age': 35, 'city': '대구'}
        info2 = {'job': 'teacher', 'hobby': 'reading'}
        base.update(info1)
        base.update(info2)
        return base
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > update()는 설정 병합이나 데이터 통합에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## pop() 메서드

    *키로 값 제거하고 반환*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    pop() 메서드는 지정한 키의 값을 제거하고 그 값을 반환합니다. dict.pop(key) 형식으로 사용하며, 없는 키를 pop하면 에러가 발생합니다. dict.pop(key, default)로 기본값을 지정할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.pop(key) 형식
    - 키 제거하고 값 반환
    - 없는 키는 에러 발생
    - 기본값 지정 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### pop() 기본

    키를 제거하고 값을 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    stock = {'laptop': 10, 'mouse': 50, 'keyboard': 30}
    stock.pop('mouse')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        stock = {'laptop': 10, 'mouse': 50, 'keyboard': 30}
        return stock.pop('mouse')
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본값 지정

    없는 키를 pop할 때 기본값을 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    inventory = {'laptop': 10, 'keyboard': 30}
    inventory.pop('monitor', 0)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        inventory = {'laptop': 10, 'keyboard': 30}
        return inventory.pop('monitor', 0)
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 키 제거

    여러 키를 순차적으로 제거합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    data = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
    data.pop('b')
    data.pop('d')
    data
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        data = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
        data.pop('b')
        data.pop('d')
        return data
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > pop()은 값을 꺼내면서 동시에 제거할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## popitem() 메서드

    *마지막 키-값 쌍 제거*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    popitem() 메서드는 딕셔너리의 마지막 키-값 쌍을 제거하고 (키, 값) 튜플로 반환합니다. dict.popitem() 형식으로 사용하며, 빈 딕셔너리에 사용하면 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.popitem() 형식
    - 마지막 키-값 쌍 제거
    - (키, 값) 튜플 반환
    - 빈 딕셔너리는 에러
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### popitem() 기본

    마지막 키-값 쌍을 제거하고 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    queue = {'first': 1, 'second': 2, 'third': 3}
    queue.popitem()
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0068():
        queue = {'first': 1, 'second': 2, 'third': 3}
        return queue.popitem()
    _snippet_0068()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연속 제거

    popitem()을 여러 번 호출하여 제거합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    stack = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
    stack.popitem()
    stack.popitem()
    stack
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0070():
        stack = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
        stack.popitem()
        stack.popitem()
        return stack
    _snippet_0070()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키와 값 분리

    반환된 튜플에서 키와 값을 인덱싱으로 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    record = {'name': '김철수', 'age': 30, 'city': '서울'}
    pair = record.popitem()
    pair[0]
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0072():
        record = {'name': '김철수', 'age': 30, 'city': '서울'}
        pair = record.popitem()
        return pair[0]
    _snippet_0072()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > popitem()은 LIFO(후입선출) 스택 구현에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## clear() 메서드

    *모든 항목 제거*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    clear() 메서드는 딕셔너리의 모든 키-값 쌍을 제거하여 빈 딕셔너리로 만듭니다. dict.clear() 형식으로 사용하며, 반환값은 None입니다. 리스트의 clear()와 동일하게 작동합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.clear() 형식
    - 모든 키-값 쌍 제거
    - 빈 딕셔너리로 만듦
    - 반환값 없음(None)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### clear() 기본

    딕셔너리의 모든 항목을 제거합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    temp = {'a': 1, 'b': 2, 'c': 3}
    temp.clear()
    temp
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0078():
        temp = {'a': 1, 'b': 2, 'c': 3}
        temp.clear()
        return temp
    _snippet_0078()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 초기화 비교

    clear()와 빈 딕셔너리 할당은 다릅니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    data1 = {'x': 1, 'y': 2}
    data2 = {'x': 1, 'y': 2}
    data1.clear()
    data2 = {}
    data1 == data2
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0080():
        data1 = {'x': 1, 'y': 2}
        data2 = {'x': 1, 'y': 2}
        data1.clear()
        data2 = {}
        return data1 == data2
    _snippet_0080()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > clear()는 원본 딕셔너리를 유지하면서 내용만 비웁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## setdefault() 메서드

    *키가 없으면 추가*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    setdefault() 메서드는 키가 있으면 그 값을 반환하고, 없으면 지정한 기본값으로 키를 추가하고 그 값을 반환합니다. dict.setdefault(key, default) 형식으로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - dict.setdefault(key, default) 형식
    - 키 있으면 값 반환
    - 키 없으면 추가하고 반환
    - 카운팅에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 있을 때

    이미 있는 키는 기존 값을 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    cache = {'name': '김철수', 'age': 30}
    cache.setdefault('name', '이영희')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0086():
        cache = {'name': '김철수', 'age': 30}
        return cache.setdefault('name', '이영희')
    _snippet_0086()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 키 없을 때

    없는 키는 기본값으로 추가됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    session = {'user': 'admin'}
    session.setdefault('timeout', 3600)
    session
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0088():
        session = {'user': 'admin'}
        session.setdefault('timeout', 3600)
        return session
    _snippet_0088()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 리스트 초기화

    빈 리스트를 기본값으로 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    groups = {'admin': ['user1', 'user2']}
    groups.setdefault('guest', [])
    groups
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0090():
        groups = {'admin': ['user1', 'user2']}
        groups.setdefault('guest', [])
        return groups
    _snippet_0090()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > setdefault()는 딕셔너리 카운팅이나 그룹화에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 메서드 비교

    *언제 어떤 메서드를 사용할까?*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    딕셔너리 메서드는 각각 특정 상황에 최적화되어 있습니다. get()은 안전한 접근, keys/values/items는 순회, update는 병합, pop/popitem/clear는 제거 작업에 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - get(): 안전한 값 접근
    - keys/values/items: 순회
    - update(): 딕셔너리 병합
    - pop/popitem/clear: 제거
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 종합 예제

    여러 메서드를 조합하여 사용합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    setting = {'host': 'localhost', 'port': 8080}
    setting.update({'user': 'admin', 'timeout': 30})
    setting.pop('port')
    setting
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0096():
        setting = {'host': 'localhost', 'port': 8080}
        setting.update({'user': 'admin', 'timeout': 30})
        setting.pop('port')
        return setting
    _snippet_0096()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 상황에 맞는 메서드를 선택하면 코드가 간결해집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 12 종합 복습

    *딕셔너리 메서드 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 12에서 배운 딕셔너리 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: get() 메서드

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
    ### 연습: 🟢 기본2: keys() 메서드

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
    ### 연습: 🟢 기본3: values() 메서드

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
    ### 연습: 🟢 기본4: items() 메서드

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
    ### 연습: 🟢 기본5: update() 메서드

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
    ### 연습: 🟡 응용1: 설정 관리

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
    ### 연습: 🟡 응용2: 재고 관리

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
    ### 연습: 🟡 응용3: 성적 분석

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
    ### 연습: 🟡 응용4: 사용자 프로필

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
    ### 연습: 🟡 응용5: 주문 처리

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
    ### 연습: 🔴 심화1-1: 멀티 설정 병합

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
    ### 연습: 🔴 심화1-2: 설정 분석

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
    ### 연습: 🔴 심화2-1: 캐시 구현

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
    ### 연습: 🔴 심화2-2: 캐시 통계

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
    ### 연습: 🔴 심화3-1: 주문 시스템

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
    ### 연습: 🔴 심화3-2: 주문 처리

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
    ### 연습: 🔴 심화4-1: 팀 관리

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
    ### 연습: 🔴 심화4-2: 팀 재구성

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
    ### 연습: 🔴 심화5-1: 통계 계산

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
    ### 연습: 🔴 심화5-2: 통계 분석

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

    - get()으로 없는 키를 안전하게 처리할 수 있다.
    - keys(), values(), items()가 각각 무엇을 꺼내는지 설명할 수 있다.
    - update(), pop(), popitem(), clear()의 효과를 확인할 수 있다.

    ## 흔한 막힘

    - get()과 대괄호 접근의 실패 동작을 혼동함
    - items()의 키와 값을 한 덩어리로만 봄
    - pop()으로 값을 꺼내며 원본도 바뀐다는 점을 놓침

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
