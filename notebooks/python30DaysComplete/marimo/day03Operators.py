import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 03. 연산자")


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
    # Day 03. 연산자

    이 노트북은 `study/python/30days/day03_연산자.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 산술 연산자로 수학 계산하기
    - 비교 연산자로 값 비교하기
    - 논리 연산자로 조건 조합하기
    - 멤버십 연산자로 포함 여부 확인하기

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

    - 오늘 새로 배우는 개념: arithmetic_operator, comparison_operator, logical_operator, membership_operator
    - 이미 써도 되는 개념: variable, int, float, str, bool, type, print
    - 오늘은 일부러 쓰지 않는 개념: list, dict, function, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 덧셈 연산자

    *+ 기호로 더하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    덧셈 연산자(+)는 두 숫자를 더합니다. 정수끼리, 소수끼리, 정수와 소수를 섞어서도 계산할 수 있습니다. 결과는 자동으로 화면에 표시됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 정수 덧셈 가능
    - 소수 덧셈 가능
    - 정수 + 소수 = 소수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 덧셈 계산

    두 숫자를 더한 결과가 자동 출력됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        itemA = 10
        itemB = 20
        return itemA + itemB
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 결과를 변수에 저장하려면 result = price + qty처럼 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 뺄셈 연산자

    *- 기호로 빼기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    뺄셈 연산자(-)는 앞 숫자에서 뒤 숫자를 뺍니다. 음수 결과도 가능하며, 순서가 중요합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 앞 숫자 - 뒤 숫자
    - 음수 결과 가능
    - 순서 바뀌면 결과도 바뀜
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 뺄셈 계산

    100에서 35를 뺀 결과입니다.
    """)
    return

@app.cell
def _():
    def _snippet_0013():
        budget = 100
        spent = 35
        return budget - spent
    _snippet_0013()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 곱셈 연산자

    ** 기호로 곱하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    곱셈 연산자(*)는 두 숫자를 곱합니다. 수학에서는 ×를 사용하지만, 프로그래밍에서는 *를 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - * 기호로 곱셈
    - 정수와 소수 모두 가능
    - 음수 곱셈도 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 곱셈 계산

    7과 8을 곱한 결과입니다.
    """)
    return

@app.cell
def _():
    def _snippet_0018():
        width = 7
        height = 8
        return width * height
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 나눗셈 연산자

    */ 기호로 나누기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    나눗셈 연산자(/)는 앞 숫자를 뒤 숫자로 나눕니다. 결과는 항상 소수(float)로 나옵니다. 정수 나누기 정수도 결과는 소수입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - / 기호로 나눗셈
    - 결과는 항상 소수
    - 0으로 나누면 에러
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 나눗셈 계산

    10을 3으로 나눈 결과입니다.
    """)
    return

@app.cell
def _():
    def _snippet_0023():
        dividend = 10
        divisor = 3
        return dividend / divisor
    _snippet_0023()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 결과가 3.3333...처럼 소수로 나옵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 몫 연산자

    *// 기호로 몫 구하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    몫 연산자(//)는 나눗셈의 몫만 구합니다. 소수점 이하는 버리고 정수 부분만 반환합니다. 10 // 3 = 3 (나머지 1은 버림)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - // 기호로 몫 계산
    - 소수점 이하 버림
    - 정수 결과 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 몫 계산

    17을 5로 나눈 몫을 구합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        items = 17
        boxes = 5
        return items // boxes
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 나머지 연산자

    *% 기호로 나머지 구하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    나머지 연산자(%)는 나눗셈의 나머지를 구합니다. 10 % 3 = 1 (10을 3으로 나누면 몫 3, 나머지 1) 짝수/홀수 판별, 배수 확인 등에 자주 사용됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - % 기호로 나머지 계산
    - 나눗셈 후 남은 값
    - 짝수/홀수 판별에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 나머지 계산

    17을 5로 나눈 나머지를 구합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0034():
        coins = 17
        slots = 5
        return coins % slots
    _snippet_0034()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > val % 2가 0이면 짝수, 1이면 홀수입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 거듭제곱 연산자

    *** 기호로 제곱 계산*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    거듭제곱 연산자(**)는 앞 숫자를 뒤 숫자만큼 거듭제곱합니다. 2 ** 3 = 8 (2 × 2 × 2) 수학의 2³를 프로그래밍에서는 2 ** 3으로 씁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - ** 기호로 거듭제곱
    - 2 ** 3 = 2³ = 8
    - 제곱근도 가능 (9 ** 0.5 = 3)
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 거듭제곱 계산

    2의 10승을 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0040():
        base = 2
        power = 10
        return base ** power
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 같음 비교 연산자

    *== 기호로 같은지 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    같음 연산자(==)는 두 값이 같은지 비교합니다. 같으면 True, 다르면 False를 반환합니다. 주의: 대입(=)과 비교(==)는 다릅니다!
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - == 기호로 같은지 비교
    - 결과는 True 또는 False
    - = (대입)과 == (비교) 구별
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 같음 비교

    두 숫자가 같은지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0045():
        left = 10
        right = 10
        return left == right
    _snippet_0045()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > = 하나는 대입, == 두 개는 비교입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다름 비교 연산자

    *!= 기호로 다른지 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    다름 연산자(!=)는 두 값이 다른지 비교합니다. 다르면 True, 같으면 False를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - != 기호로 다른지 비교
    - 다르면 True
    - 같으면 False
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다름 비교

    두 숫자가 다른지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        first = 5
        second = 8
        return first != second
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 크기 비교 연산자

    *> < >= <= 기호로 크기 비교*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    크기 비교 연산자는 두 값의 대소를 비교합니다. > (크다), < (작다), >= (크거나 같다), <= (작거나 같다) 결과는 True 또는 False입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - > (크다), < (작다)
    - >= (크거나 같다), <= (작거나 같다)
    - 결과는 True 또는 False
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 크다 (>)

    왼쪽이 오른쪽보다 큰지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0056():
        val = 15
        target = 10
        return val > target
    _snippet_0056()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 작다 (<)

    왼쪽이 오른쪽보다 작은지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0058():
        num = 15
        limit = 10
        return num < limit
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 크거나 같다 (>=)

    왼쪽이 오른쪽보다 크거나 같은지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0060():
        level = 15
        min = 10
        return level >= min
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 작거나 같다 (<=)

    왼쪽이 오른쪽보다 작거나 같은지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0062():
        stock = 15
        max = 10
        return stock <= max
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## and 논리 연산자

    *모두 참이어야 참*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    and 연산자는 양쪽 조건이 모두 True일 때만 True를 반환합니다. 하나라도 False면 결과는 False입니다. '그리고'의 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 양쪽 모두 True → True
    - 하나라도 False → False
    - '그리고'의 의미
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### and 연산

    두 조건을 and로 결합합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0067():
        adult = True
        valid = True
        return adult and valid
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## or 논리 연산자

    *하나만 참이어도 참*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    or 연산자는 양쪽 조건 중 하나만 True여도 True를 반환합니다. 둘 다 False일 때만 False입니다. '또는'의 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 하나라도 True → True
    - 둘 다 False → False
    - '또는'의 의미
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### or 연산

    두 조건을 or로 결합합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0072():
        cash = True
        card = False
        return cash or card
    _snippet_0072()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## not 논리 연산자

    *참과 거짓 반전*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    not 연산자는 True를 False로, False를 True로 바꿉니다. 조건의 반대를 표현할 때 사용합니다. '아니다'의 의미입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - True → False
    - False → True
    - '아니다'의 의미
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### not 연산

    조건을 반전시킵니다.
    """)
    return

@app.cell
def _():
    def _snippet_0077():
        rain = True
        return not rain
    _snippet_0077()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## in 멤버십 연산자

    *포함 여부 확인*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in 연산자는 왼쪽 값이 오른쪽 문자열에 포함되어 있는지 확인합니다. 포함되어 있으면 True, 없으면 False를 반환합니다. 문자열에서 특정 문자나 단어를 찾을 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 포함되어 있으면 True
    - 없으면 False
    - 문자열 검색에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### in 연산

    문자열에 특정 문자가 포함되어 있는지 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0082():
        lang = 'Python'
        return 'th' in lang
    _snippet_0082()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 'not in'을 사용하면 포함되지 않았는지 확인할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 복합 대입 연산자

    *연산과 대입을 한번에*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    복합 대입 연산자는 연산과 대입을 동시에 합니다. x += 5는 x = x + 5와 같은 의미입니다. 코드를 더 간결하게 만들어줍니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - += 덧셈 후 대입
    - -= 뺄셈 후 대입
    - *= 곱셈 후 대입
    - /= 나눗셈 후 대입
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 복합 대입 연산

    숫자에 10을 더한 후 다시 저장합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0088():
        balance = 50
        balance += 10
        return balance
    _snippet_0088()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 연산자 우선순위

    *계산 순서 이해하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    여러 연산자가 함께 사용될 때 계산 순서가 정해져 있습니다. 수학처럼 곱셈/나눗셈이 덧셈/뺄셈보다 먼저 계산됩니다. 괄호를 사용하면 우선순위를 변경할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 1순위: 괄호 ()
    - 2순위: 거듭제곱 **
    - 3순위: 곱셈/나눗셈 * / // %
    - 4순위: 덧셈/뺄셈 + -
    - 5순위: 비교 연산자
    - 6순위: 논리 연산자
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연산자 우선순위

    우선순위에 따라 계산됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0093():
        raw = 2 + 3 * 4
        grouped = (2 + 3) * 4
        print('without_paren:', raw)
        return print('with_paren:', grouped)
    _snippet_0093()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 헷갈릴 때는 괄호를 사용하면 명확해집니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 3 종합 복습

    *연산자 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 3에서 배운 연산자들을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 덧셈

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 곱셈

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 나눗셈

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 같음 비교

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 크기 비교

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 온도 범위 확인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 점수 계산 및 비교

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 총점
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 평균
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 합격 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 할인가 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 자격 조건 확인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 이메일 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 학점 계산 시스템

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 점수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### A학점 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### B학점 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### C학점 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 쇼핑 총액 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 소계
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 세금
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 총액
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 무료배송 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 온도 변환 및 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 섭씨 온도
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 화씨 온도
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 쾌적 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 게임 점수 시스템

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 게임 점수
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### KDA 비율
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### MVP 여부
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 복잡한 조건 판별

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 조건1 확인
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 조건2 확인
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    #### 최종 승인
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
