import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 10. 집합")


@app.cell
def _():
    import marimo as mo
    return (mo,)

@app.cell
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
    # Day 10. 집합

    이 노트북은 `study/python/30days/day10_집합.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 집합으로 중복 없는 데이터 관리
    - add/remove로 요소 추가/삭제
    - 합집합, 교집합, 차집합 연산
    - 수학의 집합 개념을 프로그래밍에

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

    - 오늘 새로 배우는 개념: set, set_unique, add, remove, discard, union, intersection, difference
    - 이미 써도 되는 개념: list_all, tuple
    - 오늘은 일부러 쓰지 않는 개념: dict, function, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 집합이란?

    *중복 없고 순서 없는 자료구조*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    집합(Set)은 중복을 허용하지 않고 순서가 없는 자료구조입니다. 중괄호 {}로 만들고, 쉼표로 값을 구분합니다. 같은 값을 여러 번 넣어도 하나만 저장됩니다. 인덱스가 없어서 특정 위치의 요소에 접근할 수 없습니다. 수학의 집합 개념과 동일하며, 집합 연산을 지원합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 중괄호 {}로 생성
    - 중복 자동 제거
    - 순서가 없음 (인덱싱 불가)
    - 수학의 집합 연산 지원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 집합 만들기

    중괄호를 사용하여 집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        nums = {1, 2, 3, 4, 5}
        return nums
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 빈 집합은 {}가 아닌 set()으로 만듭니다. {}는 빈 딕셔너리입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 집합 생성하기

    *다양한 방법으로 만들기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    집합은 중괄호로 직접 만들거나 set() 함수를 사용합니다. set() 함수에 리스트, 튜플, 문자열을 넣으면 집합으로 변환됩니다. 빈 집합은 반드시 set()으로 만들어야 합니다. {}는 빈 딕셔너리를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 중괄호 {1, 2, 3}로 생성
    - set(리스트)로 변환
    - 빈 집합은 set()
    - {} 는 빈 딕셔너리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 직접 생성

    중괄호로 집합을 직접 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0013():
        direct = {1, 2, 3, 4, 5}
        return direct
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트에서 생성

    set() 함수로 리스트를 집합으로 변환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0015():
        items = set([1, 2, 3, 3, 4])
        return items
    _snippet_0015()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열에서 생성

    set() 함수로 문자열을 집합으로 변환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        chars = set('hello')
        return chars
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 빈 집합

    set()으로 빈 집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        empty = set()
        return empty
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > set('hello')는 {'h', 'e', 'l', 'o'}가 됩니다. 'l'이 하나만 남습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중복 제거 특성

    *자동으로 중복 삭제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    집합의 가장 큰 특징은 중복을 자동으로 제거한다는 것입니다. 같은 값을 여러 번 넣어도 하나만 유지됩니다. 이 특성을 이용하면 리스트의 중복을 쉽게 제거할 수 있습니다. 리스트를 집합으로 변환했다가 다시 리스트로 바꾸면 중복이 제거됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 중복 값 자동 제거
    - 하나의 값만 유지
    - 리스트 중복 제거에 유용
    - set(리스트) → list(집합)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 집합 생성시 중복 제거

    집합을 만들 때 중복이 자동으로 제거됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0025():
        dups = {1, 2, 2, 3, 3, 3, 4}
        return dups
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 중복 제거

    리스트를 집합으로 변환하여 중복을 제거합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        raw = [1, 2, 2, 3, 3, 3, 4]
        return set(raw)
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다시 리스트로

    중복 제거된 집합을 리스트로 변환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        data = [1, 2, 2, 3, 3, 3, 4]
        unique = set(data)
        return list(unique)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 집합은 순서를 보장하지 않으므로 정렬이 필요하면 sorted()를 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## add() 메서드

    *집합에 요소 추가*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    add() 메서드는 집합에 새로운 요소를 추가합니다. 이미 있는 값을 추가하려고 해도 에러가 발생하지 않고 무시됩니다. 중복을 허용하지 않기 때문입니다. 원본 집합이 직접 변경됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set.add(값) 형식
    - 새 요소 추가
    - 중복 값은 무시됨
    - 원본 집합 직접 변경
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### add로 요소 추가

    집합에 새로운 요소를 추가합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0035():
        fruits = {'사과', '바나나'}
        fruits.add('오렌지')
        fruits.add('사과')
        return fruits
    _snippet_0035()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 이미 있는 값을 add()해도 에러 없이 무시됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## remove()와 discard()

    *집합에서 요소 삭제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    remove()와 discard() 모두 집합에서 요소를 삭제합니다. 차이점은 remove()는 없는 값을 삭제하려 하면 에러가 발생하지만, discard()는 에러 없이 무시한다는 것입니다. 안전하게 삭제하려면 discard()를 사용하는 것이 좋습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - remove(값): 값 삭제, 없으면 에러
    - discard(값): 값 삭제, 없어도 에러 안남
    - 둘 다 원본 직접 변경
    - 안전한 삭제는 discard() 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### remove 사용

    remove()로 값을 삭제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
        nums = {1, 2, 3, 4, 5}
        nums.remove(3)
        return nums
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### discard 사용

    discard()로 안전하게 삭제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0043():
        vals = {1, 2, 3, 4, 5}
        vals.discard(3)
        vals.discard(10)
        return vals
    _snippet_0043()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 존재 여부가 불확실하면 discard()를 사용하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## clear() 메서드

    *모든 요소 삭제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    clear() 메서드는 집합의 모든 요소를 삭제하여 빈 집합으로 만듭니다. 리스트와 동일하게 작동합니다. 집합을 재사용할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set.clear() 형식
    - 모든 요소 삭제
    - 빈 집합이 됨
    - 집합 초기화에 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### clear로 모두 삭제

    집합의 모든 요소를 삭제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        items = {1, 2, 3, 4, 5}
        items.clear()
        return items
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > clear() 후에는 빈 집합 set()이 됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 합집합 (union)

    *두 집합을 합치기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    합집합은 두 집합의 모든 요소를 포함하는 새 집합을 만듭니다. union() 메서드나 | 연산자를 사용합니다. 중복된 요소는 하나만 포함됩니다. 원본 집합은 변경되지 않고 새로운 집합이 생성됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set1.union(set2) 또는 set1 | set2
    - 두 집합의 모든 요소 포함
    - 중복은 하나만
    - 새로운 집합 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### union 메서드

    union() 메서드로 합집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0055():
        setA = {1, 2, 3}
        setB = {3, 4, 5}
        return setA.union(setB)
    _snippet_0055()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### | 연산자

    | 연산자로 합집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        left = {1, 2, 3}
        right = {3, 4, 5}
        return left | right
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 합집합은 A ∪ B를 의미하며, 모든 요소를 포함합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 교집합 (intersection)

    *공통 요소만 추출*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    교집합은 두 집합에 모두 있는 요소만 포함하는 새 집합을 만듭니다. intersection() 메서드나 & 연산자를 사용합니다. 두 집합의 공통 부분을 찾을 때 유용합니다. 원본 집합은 변경되지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set1.intersection(set2) 또는 set1 & set2
    - 두 집합에 모두 있는 요소
    - 공통 부분만 추출
    - 새로운 집합 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### intersection 메서드

    intersection() 메서드로 교집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0063():
        setA = {1, 2, 3, 4}
        setB = {3, 4, 5, 6}
        return setA.intersection(setB)
    _snippet_0063()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### & 연산자

    & 연산자로 교집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0065():
        left = {1, 2, 3, 4}
        right = {3, 4, 5, 6}
        return left & right
    _snippet_0065()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 교집합은 A ∩ B를 의미하며, 공통 요소만 포함합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 차집합 (difference)

    *한쪽에만 있는 요소*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    차집합은 첫 번째 집합에만 있고 두 번째 집합에는 없는 요소들을 포함하는 새 집합을 만듭니다. difference() 메서드나 - 연산자를 사용합니다. 순서가 중요하므로 A - B와 B - A는 다릅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set1.difference(set2) 또는 set1 - set2
    - set1에만 있는 요소
    - 순서가 중요 (A-B ≠ B-A)
    - 새로운 집합 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 차집합 A-B

    첫 번째 집합에서 두 번째 집합을 뺍니다.
    """)
    return

@app.cell
def _():
    def _snippet_0071():
        setA = {1, 2, 3, 4, 5}
        setB = {4, 5, 6, 7}
        return setA.difference(setB)
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 차집합 B-A

    두 번째 집합에서 첫 번째 집합을 뺍니다.
    """)
    return

@app.cell
def _():
    def _snippet_0073():
        left = {1, 2, 3, 4, 5}
        right = {4, 5, 6, 7}
        return right.difference(left)
    _snippet_0073()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 차집합은 A - B를 의미하며, A에만 있는 요소입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 대칭차집합 (symmetric_difference)

    *한쪽에만 있는 모든 요소*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    대칭차집합은 두 집합 중 한쪽에만 있는 요소들을 모두 포함하는 새 집합을 만듭니다. symmetric_difference() 메서드나 ^ 연산자를 사용합니다. 교집합을 제외한 나머지 모든 요소입니다. (A - B) ∪ (B - A)와 같습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - set1.symmetric_difference(set2) 또는 set1 ^ set2
    - 한쪽에만 있는 모든 요소
    - 교집합 제외
    - 새로운 집합 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### symmetric_difference 메서드

    symmetric_difference() 메서드를 사용합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0079():
        setA = {1, 2, 3, 4}
        setB = {3, 4, 5, 6}
        return setA.symmetric_difference(setB)
    _snippet_0079()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### ^ 연산자

    ^ 연산자로 대칭차집합을 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0081():
        left = {1, 2, 3, 4}
        right = {3, 4, 5, 6}
        return left ^ right
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 대칭차집합은 A △ B를 의미하며, 공통 부분을 제외한 모든 요소입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## in/not in 연산자

    *요소 포함 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in과 not in 연산자로 집합에 특정 값이 있는지 확인할 수 있습니다. 집합은 해시 테이블로 구현되어 있어 리스트보다 훨씬 빠르게 검색됩니다. 대량의 데이터에서 값을 찾을 때 집합을 사용하면 성능이 향상됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값 in 집합으로 확인
    - 값 not in 집합으로 미포함 확인
    - 리스트보다 검색 속도 빠름
    - True/False 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 포함 확인

    in 연산자로 값이 집합에 있는지 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0087():
        colors = {'빨강', '초록', '파랑'}
        return '초록' in colors
    _snippet_0087()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 미포함 확인

    not in 연산자로 값이 집합에 없는지 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0089():
        palette = {'빨강', '초록', '파랑'}
        return '검정' not in palette
    _snippet_0089()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 집합의 in 연산은 O(1) 시간복잡도로 매우 빠릅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 집합 길이

    *len() 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    len() 함수는 집합의 요소 개수를 반환합니다. 리스트, 튜플과 동일하게 작동합니다. 중복이 제거된 후의 개수를 셉니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - len(집합)로 길이 확인
    - 요소 개수 반환
    - 중복 제거 후 개수
    - 빈 집합은 0
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 집합 길이

    len() 함수로 집합 요소 개수를 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0095():
        sample = {1, 2, 3, 4, 5}
        return len(sample)
    _snippet_0095()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중복 제거 후 개수

    중복이 제거된 후의 개수를 셉니다.
    """)
    return

@app.cell
def _():
    def _snippet_0097():
        dups = set([1, 2, 2, 3, 3, 3])
        return len(dups)
    _snippet_0097()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > set([1,2,2,3])의 길이는 3입니다. 중복이 제거되기 때문입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 10 종합 복습

    *집합 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 10에서 배운 집합을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 집합 생성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 중복 제거

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: add 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 합집합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 교집합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 학생 출석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 월요일 출석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 화요일 출석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 양일 모두 출석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 하루라도 출석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 월요일만 출석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 태그 시스템

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 게시글1 태그
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 게시글2 태그
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 공통 태그
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 모든 태그
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 게시글1만의 태그
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 태그 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 과일 재고

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 매장1 재고
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 매장2 재고
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 양 매장 공통 재고
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 재고
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 매장1만의 재고
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 공통재고에 바나나 포함 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 숫자 분석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 짝수 집합
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 3의 배수 집합
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 교집합 (짝수이면서 3의 배수)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 합집합 (짝수 또는 3의 배수)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 짝수만
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 대칭차집합
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 중복 단어 제거

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 원본 리스트
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 중복 제거
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 고유 단어 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### hello 포함 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-1: 회원 집합 연산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 활성 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 프리미엄 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 신규 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 활성 프리미엄 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 무료 활성 회원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-2: 회원 통계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 신규 프리미엄 사용자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 사용자 수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 무료 활성 사용자 수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 과목 선택

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생1 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생2 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생3 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생1과 2의 공통 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생2와 3의 공통 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 학생1만의 과목
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 과목 수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-1: 제품 카테고리 분류

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전자제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 사무용품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 인기제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전자제품이면서 사무용품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전자제품이면서 인기제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-2: 제품 카테고리 분석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전자제품만
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 인기 없는 제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 노트북이 인기제품인지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 언어 스킬

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 개발자1 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 개발자2 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 개발자3 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 모든 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 모두가 아는 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 개발자1만의 언어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 언어 수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 이벤트 참석자

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이벤트1 참석자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이벤트2 참석자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이벤트3 참석자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 3개 모두 참석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 2개 이상 참석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이벤트1만 참석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 참석자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 이벤트1또는2 참석했지만 3은 불참
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 참석자 수
    """)
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
