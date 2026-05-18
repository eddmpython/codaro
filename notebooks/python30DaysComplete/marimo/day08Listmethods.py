import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 08. 리스트메서드")


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
    # Day 08. 리스트메서드

    이 노트북은 `study/python/30days/day08_리스트메서드.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - append/insert로 요소 추가
    - remove/pop으로 요소 삭제
    - sort/reverse로 정렬과 뒤집기
    - extend/copy로 리스트 확장과 복사

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

    - 오늘 새로 배우는 개념: append, insert, remove, pop, sort, reverse, copy, extend, clear
    - 이미 써도 되는 개념: list_basic
    - 오늘은 일부러 쓰지 않는 개념: tuple, dict, set, function, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리스트 메서드란?

    *리스트를 조작하는 내장 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    메서드(Method)는 객체가 가지고 있는 함수입니다. 리스트에는 요소를 추가, 삭제, 정렬하는 다양한 메서드가 내장되어 있습니다. 메서드는 리스트 이름 뒤에 점(.)을 찍고 메서드 이름을 쓰는 형식으로 사용합니다. 대부분의 리스트 메서드는 원본 리스트를 직접 변경하며 None을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.method() 형식으로 사용
    - 원본 리스트를 직접 수정
    - 대부분 None을 반환
    - 리스트 조작의 핵심 도구
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 메서드 사용 예시

    리스트 메서드의 기본 사용법입니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        nums = [1, 2, 3]
        nums.append(4)
        return nums
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 메서드는 원본을 변경하므로 사용 후 리스트가 달라집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## append() 메서드

    *리스트 끝에 요소 추가*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    append() 메서드는 리스트의 끝에 새로운 요소를 추가합니다. 괄호 안에 추가할 값을 넣으면 리스트 마지막에 그 값이 추가됩니다. 원본 리스트가 직접 변경되며, None을 반환합니다. 리스트를 점진적으로 만들어갈 때 가장 많이 사용하는 메서드입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.append(값) 형식
    - 리스트 끝에 요소 추가
    - 원본 리스트 직접 변경
    - 반환값은 None
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### append로 요소 추가

    리스트 끝에 새로운 요소를 추가합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0013():
        fruits = ['사과', '바나나']
        fruits.append('오렌지')
        fruits.append('포도')
        return fruits
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > append()는 한 번에 하나의 요소만 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## insert() 메서드

    *원하는 위치에 요소 추가*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    insert() 메서드는 리스트의 특정 위치에 요소를 추가합니다. 첫 번째 인수로 인덱스를, 두 번째 인수로 추가할 값을 받습니다. 그 위치에 값이 삽입되고, 기존 요소들은 뒤로 밀립니다. append()와 달리 원하는 위치에 정확히 추가할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.insert(인덱스, 값) 형식
    - 특정 위치에 요소 삽입
    - 기존 요소는 뒤로 이동
    - 순서가 중요할 때 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### insert로 특정 위치에 추가

    원하는 위치에 정확히 요소를 삽입합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        colors = ['빨강', '파랑']
        colors.insert(1, '초록')
        return colors
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > insert(0, 값)은 리스트 맨 앞에 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## remove() 메서드

    *값으로 요소 삭제*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    remove() 메서드는 리스트에서 특정 값을 찾아 삭제합니다. 괄호 안에 삭제할 값을 넣으면 그 값이 처음 나타나는 위치에서 제거됩니다. 같은 값이 여러 개 있어도 첫 번째 것만 삭제됩니다. 값이 리스트에 없으면 에러가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.remove(값) 형식
    - 해당 값을 찾아 삭제
    - 첫 번째로 발견된 값만 삭제
    - 값이 없으면 에러 발생
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### remove로 값 삭제

    특정 값을 찾아서 삭제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0025():
        items = ['사과', '바나나', '오렌지', '바나나']
        items.remove('바나나')
        return items
    _snippet_0025()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 값이 여러 개 있어도 첫 번째 것만 삭제됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## pop() 메서드

    *인덱스로 요소 삭제하고 반환*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    pop() 메서드는 리스트에서 특정 인덱스의 요소를 제거하고 그 값을 반환합니다. 괄호 안에 인덱스를 넣으면 그 위치의 요소가 삭제됩니다. 인덱스를 생략하면 마지막 요소가 삭제됩니다. remove()와 달리 삭제된 값을 받을 수 있어 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.pop() 또는 list.pop(인덱스)
    - 요소를 삭제하고 값을 반환
    - 인덱스 생략시 마지막 요소 삭제
    - 삭제된 값을 사용 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 마지막 요소 pop

    pop()으로 마지막 요소를 삭제하고 반환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        nums = [10, 20, 30, 40, 50]
        return nums.pop()
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 요소 pop

    pop(0)으로 첫 번째 요소를 삭제하고 반환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0033():
        vals = [10, 20, 30, 40, 50]
        return vals.pop(0)
    _snippet_0033()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > pop()은 스택(stack) 자료구조 구현에 자주 사용됩니다.
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
    clear() 메서드는 리스트의 모든 요소를 삭제하여 빈 리스트로 만듭니다. 리스트 자체는 그대로 유지되고 내용만 비워집니다. 리스트를 초기화할 때 사용합니다. 변수에 []를 할당하는 것과 비슷하지만, 같은 리스트를 참조하는 다른 변수가 있을 때 차이가 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.clear() 형식
    - 모든 요소 삭제
    - 빈 리스트가 됨
    - 리스트 초기화에 사용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### clear로 모두 삭제

    리스트의 모든 요소를 삭제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        nums = [1, 2, 3, 4, 5]
        nums.clear()
        return nums
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > clear()는 리스트를 재사용할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## extend() 메서드

    *리스트 합치기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    extend() 메서드는 리스트에 다른 리스트의 모든 요소를 추가합니다. + 연산자와 비슷하지만, + 는 새 리스트를 만들고 extend()는 원본 리스트를 변경합니다. 여러 요소를 한 번에 추가할 때 append()를 반복하는 것보다 효율적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.extend(다른리스트) 형식
    - 다른 리스트의 모든 요소 추가
    - 원본 리스트 직접 변경
    - + 연산자보다 메모리 효율적
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### extend로 리스트 확장

    다른 리스트의 모든 요소를 추가합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0045():
        base = [1, 2, 3]
        extra = [4, 5, 6]
        base.extend(extra)
        return base
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > append([4,5,6])은 리스트를 통째로 추가하지만, extend([4,5,6])은 요소들을 개별적으로 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## sort() 메서드

    *리스트 정렬*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    sort() 메서드는 리스트의 요소를 오름차순으로 정렬합니다. 숫자는 작은 것부터, 문자열은 사전 순으로 정렬됩니다. reverse=True 인수를 주면 내림차순으로 정렬됩니다. 원본 리스트가 직접 변경되며, None을 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.sort() 형식
    - 오름차순 정렬 (기본)
    - reverse=True로 내림차순
    - 원본 리스트 직접 변경
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 오름차순 정렬

    sort()로 리스트를 오름차순으로 정렬합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        data = [5, 2, 8, 1, 9]
        data.sort()
        return data
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 내림차순 정렬

    sort(reverse=True)로 내림차순으로 정렬합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0053():
        scores = [5, 2, 8, 1, 9]
        scores.sort(reverse=True)
        return scores
    _snippet_0053()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > sorted() 함수는 원본을 유지하고 정렬된 새 리스트를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## reverse() 메서드

    *리스트 뒤집기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    reverse() 메서드는 리스트의 순서를 완전히 뒤집습니다. 첫 번째와 마지막, 두 번째와 끝에서 두 번째 같은 식으로 위치를 바꿉니다. 정렬과는 다르며, 단순히 순서만 반대로 만듭니다. 원본 리스트가 직접 변경됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.reverse() 형식
    - 순서를 완전히 반대로
    - 정렬과는 다른 개념
    - 원본 리스트 직접 변경
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### reverse로 뒤집기

    리스트의 순서를 반대로 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        chars = ['A', 'B', 'C', 'D', 'E']
        chars.reverse()
        return chars
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > [::-1] 슬라이싱도 리스트를 뒤집지만 새 리스트를 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## copy() 메서드

    *리스트 복사*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    copy() 메서드는 리스트의 얕은 복사본을 만듭니다. 원본과 똑같은 내용의 새로운 리스트가 생성됩니다. 단순히 변수에 할당(=)하면 같은 리스트를 참조하지만, copy()는 완전히 독립적인 리스트를 만듭니다. 한쪽을 변경해도 다른 쪽에 영향을 주지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.copy() 형식
    - 독립적인 새 리스트 생성
    - 원본과 복사본은 서로 독립적
    - = 할당과는 다름
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### copy로 복사

    원본과 독립적인 리스트를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0065():
        orig = [1, 2, 3]
        copy = orig.copy()
        copy.append(4)
        return copy
    _snippet_0065()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > list[:] 슬라이싱도 복사본을 만듭니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## count() 메서드

    *요소 개수 세기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    count() 메서드는 리스트에서 특정 값이 몇 번 나타나는지 세어줍니다. 괄호 안에 찾을 값을 넣으면 그 값의 개수를 반환합니다. 값이 없으면 0을 반환합니다. 리스트를 변경하지 않고 정보만 알려줍니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.count(값) 형식
    - 특정 값의 개수 반환
    - 없으면 0 반환
    - 리스트는 변경 안됨
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 개수 세기

    count()로 특정 값이 몇 번 나타나는지 셉니다.
    """)
    return

@app.cell
def _():
    def _snippet_0071():
        nums = [1, 2, 3, 2, 4, 2, 5]
        return nums.count(2)
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 없는 값 개수

    없는 값을 세면 0을 반환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0073():
        arr = [1, 2, 3, 2, 4, 2, 5]
        return arr.count(6)
    _snippet_0073()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > count()는 데이터 분석에서 빈도 계산에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## index() 메서드

    *요소 위치 찾기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    index() 메서드는 리스트에서 특정 값이 처음 나타나는 위치의 인덱스를 반환합니다. 같은 값이 여러 개 있어도 첫 번째 위치만 알려줍니다. 값이 리스트에 없으면 에러가 발생합니다. 요소의 위치를 알아야 할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - list.index(값) 형식
    - 값의 첫 번째 인덱스 반환
    - 값이 없으면 에러 발생
    - 위치 파악에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 첫 번째 위치 찾기

    index()로 값의 첫 번째 위치를 찾습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0079():
        fruits = ['사과', '바나나', '오렌지', '바나나']
        return fruits.index('바나나')
    _snippet_0079()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다른 값 위치 찾기

    다른 값의 인덱스를 찾습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0081():
        basket = ['사과', '바나나', '오렌지', '바나나']
        return basket.index('오렌지')
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > in 연산자로 값의 존재 여부를 먼저 확인한 후 index()를 사용하면 안전합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 8 종합 복습

    *리스트 메서드 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 8에서 배운 리스트 메서드를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: append 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: remove 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: sort 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: reverse 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: pop 사용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 리스트 상태
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 제거된 값
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 할일 목록 관리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 남은 할일
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 완료한 할일
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 점수 정렬

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 원본
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 오름차순
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 내림차순
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 장바구니 수정

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 장바구니 내용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 아이템 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 학생 명단 관리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 학생
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 첫 번째 학생
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 마지막 학생
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 숫자 목록 조작

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 리스트
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 1의 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 4의 위치
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 재고 관리 시스템

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 제품 목록
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 재고 수량
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 재고 부족 제품
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-1: 플레이리스트 추가 및 재생

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 현재 플레이리스트
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 재생한 노래
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-2: 플레이리스트 정렬

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 정렬된 복사본
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 메시지 큐

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 남은 큐
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 처리된 메시지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 남은 개수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-1: 투표 개수 집계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 전체 투표
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### A 득표수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### B 득표수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### C 득표수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-2: 투표 결과 분석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-1: 게임 플레이어 추가

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 플레이어 목록
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 점수 목록
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-2: 게임 랭킹 분석

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 점수 랭킹
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 상위 3명
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 영희 점수
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
