import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 13. 조건문")


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
    # Day 13. 조건문

    이 노트북은 `study/python/30days/day13_조건문.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - if로 조건 분기
    - elif와 else로 다중 분기
    - 중첩 조건문과 삼항연산자
    - 실전 조건 처리

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

    - 오늘 새로 배우는 개념: if, elif, else, ternary_operator, nested_if
    - 이미 써도 되는 개념: all_data_types, all_operators
    - 오늘은 일부러 쓰지 않는 개념: function, loop, import

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## if 기본

    *조건이 참일 때 실행*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    if문은 조건이 True일 때만 코드를 실행합니다. if 조건: 형식으로 쓰며, 조건 뒤에 콜론(:)을 붙이고 실행할 코드는 들여쓰기합니다. 조건이 False면 if 블록을 건너뜁니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - if 조건: 형식
    - 조건이 True면 실행
    - 조건이 False면 건너뜀
    - 들여쓰기로 블록 구분
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### if 기본

    조건이 참이면 실행됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        age = 20
        if age >= 18:
            result = 'adult'
        return result
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### if 조건 거짓

    조건이 거짓이면 건너뜁니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        score = 50
        if score >= 90:
            grade = 'A'
        return score
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### if 변수 수정

    조건에 따라 변수를 수정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0011():
        cost = 10000
        if cost > 5000:
            cost = cost - 1000
        return cost
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > if문의 조건은 비교 연산자, 논리 연산자, in 연산자 등을 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## if-else

    *조건에 따른 양방향 분기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    else는 if 조건이 False일 때 실행됩니다. if-else를 사용하면 조건에 따라 둘 중 하나가 반드시 실행됩니다. else 뒤에도 콜론(:)을 붙이고 들여쓰기합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - if-else로 양방향 분기
    - 조건이 True면 if 블록
    - 조건이 False면 else 블록
    - 둘 중 하나는 반드시 실행
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### if-else 기본

    조건에 따라 다른 값을 할당합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        num = 7
        if num % 2 == 0:
            parity = 'even'
        else:
            parity = 'odd'
        return parity
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 성인 판별

    나이에 따라 성인 여부를 판별합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        years = 16
        if years >= 18:
            status = 'adult'
        else:
            status = 'minor'
        return status
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 할인 적용

    가격에 따라 할인을 적용합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0021():
        amount = 15000
        if amount >= 10000:
            final = amount - 2000
        else:
            final = amount
        return final
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > if-else는 둘 중 하나를 반드시 선택해야 할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## if-elif-else

    *다중 조건 분기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    elif는 else if의 줄임말로, 여러 조건을 순차적으로 검사합니다. if-elif-else를 사용하면 3개 이상의 경우를 나눌 수 있습니다. 위에서부터 조건을 검사하여 처음 True인 블록만 실행됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - elif로 다중 조건 검사
    - 위에서부터 순서대로 검사
    - 첫 번째 True 블록만 실행
    - 모두 False면 else 실행
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 성적 등급

    점수에 따라 등급을 부여합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        point = 85
        if point >= 90:
            level = 'A'
        elif point >= 80:
            level = 'B'
        elif point >= 70:
            level = 'C'
        else:
            level = 'F'
        return level
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 온도 분류

    온도에 따라 분류합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        temp = 25
        if temp >= 30:
            weather = 'hot'
        elif temp >= 20:
            weather = 'warm'
        elif temp >= 10:
            weather = 'cool'
        else:
            weather = 'cold'
        return weather
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 요금 계산

    거리에 따라 요금을 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        distance = 15
        if distance <= 5:
            fare = 1000
        elif distance <= 10:
            fare = 2000
        elif distance <= 20:
            fare = 3000
        else:
            fare = 5000
        return fare
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > elif는 여러 개 사용할 수 있으며, else는 생략 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 비교 연산자와 조건문

    *크기 비교로 조건 판별*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    비교 연산자(==, !=, >, <, >=, <=)는 조건문에서 가장 많이 사용됩니다. 두 값을 비교하여 True/False를 반환하며, 이를 if문의 조건으로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - ==: 같음
    - !=: 다름
    - >, <: 크기 비교
    - >=, <=: 이상, 이하
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 같음 비교

    값이 같은지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0037():
        password = '1234'
        if password == '1234':
            access = 'granted'
        else:
            access = 'denied'
        return access
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다름 비교

    값이 다른지 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        stock = 0
        if stock != 0:
            available = True
        else:
            available = False
        return available
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 크기 비교

    크기를 비교합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
        speed = 120
        if speed > 100:
            warning = 'overspeed'
        else:
            warning = 'normal'
        return warning
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 문자열도 비교 연산자로 비교할 수 있습니다(사전 순서).
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 논리 연산자 and

    *여러 조건을 모두 만족*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    and 연산자는 양쪽 조건이 모두 True일 때만 True를 반환합니다. 여러 조건을 동시에 만족해야 할 때 사용합니다. 조건1 and 조건2 형식입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 양쪽 모두 True일 때만 True
    - 하나라도 False면 False
    - 여러 조건 동시 검사
    - 조건1 and 조건2 형식
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### and 기본

    두 조건을 모두 만족하는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        userAge = 25
        isMember = True
        if userAge >= 18 and isMember:
            rate = 0.2
        else:
            rate = 0
        return rate
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 검사

    값이 특정 범위 안에 있는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        num = 55
        if num >= 50 and num <= 100:
            inRange = True
        else:
            inRange = False
        return inRange
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 자격 검사

    여러 조건을 모두 만족하는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        experience = 3
        degree = True
        if experience >= 2 and degree:
            qualified = 'yes'
        else:
            qualified = 'no'
        return qualified
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 범위 검사는 50 <= value <= 100 형식으로도 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 논리 연산자 or

    *조건 중 하나만 만족*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    or 연산자는 양쪽 조건 중 하나라도 True면 True를 반환합니다. 여러 조건 중 하나만 만족해도 될 때 사용합니다. 조건1 or 조건2 형식입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 하나라도 True면 True
    - 모두 False일 때만 False
    - 대안 조건 검사
    - 조건1 or 조건2 형식
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### or 기본

    두 조건 중 하나만 만족해도 됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        weekend = False
        holiday = True
        if weekend or holiday:
            day = 'off'
        else:
            day = 'work'
        return day
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 자격 대안

    여러 자격 중 하나만 있어도 됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        card = False
        cash = True
        if card or cash:
            pay = True
        else:
            pay = False
        return pay
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 경고 조건

    여러 조건 중 하나라도 위험하면 경고합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0061():
        battery = 15
        signal = 80
        if battery < 20 or signal < 30:
            alert = 'warning'
        else:
            alert = 'normal'
        return alert
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > or는 첫 번째 True를 만나면 나머지 조건은 검사하지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 논리 연산자 not

    *조건 반대로 뒤집기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    not 연산자는 조건의 결과를 반대로 뒤집습니다. True는 False로, False는 True로 바꿉니다. not 조건 형식으로 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 조건 결과 반대로
    - True → False
    - False → True
    - not 조건 형식
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### not 기본

    조건의 반대를 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0067():
        logged = False
        if not logged:
            action = 'login required'
        else:
            action = 'proceed'
        return action
    _snippet_0067()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### not과 비교

    not과 비교 연산자를 함께 사용합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0069():
        count = 5
        if not count == 0:
            ready = True
        else:
            ready = False
        return ready
    _snippet_0069()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### not과 논리 연산

    not과 and/or를 함께 사용합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0071():
        premium = False
        trial = False
        if not (premium or trial):
            plan = 'free'
        else:
            plan = 'paid'
        return plan
    _snippet_0071()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > not count == 0 대신 count != 0을 사용하는 것이 더 읽기 쉽습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## in 연산자와 조건문

    *포함 여부 검사*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    in 연산자는 값이 리스트, 튜플, 집합, 딕셔너리, 문자열에 포함되어 있는지 검사합니다. 값 in 컬렉션 형식으로 사용하며, True/False를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값 in 컬렉션 형식
    - 포함되면 True
    - 없으면 False
    - 리스트, 튜플, 집합, 문자열 등
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 포함 검사

    값이 리스트에 포함되어 있는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0077():
        users = ['admin', 'user1', 'user2']
        user = 'user1'
        if user in users:
            permission = 'granted'
        else:
            permission = 'denied'
        return permission
    _snippet_0077()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 포함 검사

    문자가 문자열에 포함되어 있는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0079():
        email = 'test@example.com'
        if '@' in email:
            ok = True
        else:
            ok = False
        return ok
    _snippet_0079()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 딕셔너리 키 검사

    키가 딕셔너리에 있는지 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0081():
        config = {'host': 'localhost', 'port': 8080}
        if 'timeout' in config:
            timeout = config['timeout']
        else:
            timeout = 30
        return timeout
    _snippet_0081()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > not in 연산자로 포함되지 않은 것을 검사할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 중첩 조건문

    *조건 안에 조건*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    if문 안에 다시 if문을 넣을 수 있습니다. 이를 중첩 조건문이라고 하며, 복잡한 조건을 단계적으로 검사할 때 사용합니다. 들여쓰기 단계가 늘어납니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - if 안에 if 중첩
    - 단계적 조건 검사
    - 들여쓰기 단계 증가
    - 복잡한 조건 처리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중첩 if 기본

    조건을 단계적으로 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0087():
        driverAge = 25
        hasLicense = True
        if driverAge >= 18:
            if hasLicense:
                canDrive = 'yes'
            else:
                canDrive = 'no license'
        else:
            canDrive = 'too young'
        return canDrive
    _snippet_0087()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 3단계 검사

    여러 단계로 조건을 검사합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0089():
        wallet = 50000
        cost = 30000
        inStock = True
        if wallet >= cost:
            if inStock:
                outcome = 'purchase'
            else:
                outcome = 'out of stock'
        else:
            outcome = 'insufficient'
        return outcome
    _snippet_0089()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 등급과 보너스

    등급에 따라 보너스를 차등 지급합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0091():
        grade = 'gold'
        purchase = 100000
        if grade == 'gold':
            if purchase >= 50000:
                bonus = 10000
            else:
                bonus = 5000
        else:
            bonus = 0
        return bonus
    _snippet_0091()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 중첩이 깊어지면 and 연산자로 단순화할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 삼항 연산자

    *한 줄로 조건 분기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    삼항 연산자는 if-else를 한 줄로 표현합니다. 값1 if 조건 else 값2 형식으로 쓰며, 조건이 True면 값1, False면 값2를 반환합니다. 간단한 조건 분기에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 값1 if 조건 else 값2 형식
    - 조건이 True면 값1
    - 조건이 False면 값2
    - 한 줄로 간결하게
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 삼항 연산자 기본

    간단한 조건을 한 줄로 표현합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0097():
        n = 10
        category = 'even' if n % 2 == 0 else 'odd'
        return category
    _snippet_0097()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최소값 적용

    조건에 따라 값을 선택합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0099():
        qty = 3
        limit = 5
        final = qty if qty >= limit else limit
        return final
    _snippet_0099()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 할인율 결정

    금액에 따라 할인율을 결정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0101():
        total = 120000
        rate = 0.1 if total >= 100000 else 0.05
        discounted = total * (1 - rate)
        return discounted
    _snippet_0101()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 삼항 연산자는 간단한 조건에만 사용하세요. 복잡하면 일반 if-else가 더 읽기 쉽습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 13 종합 복습

    *조건문 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 13에서 배운 조건문을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: if 기본

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: if-else

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: if-elif-else

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: and 연산자

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 삼항 연산자

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 회원 등급

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 배송비 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 입장 가능 여부

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 할인 적용

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 근무 시간 분류

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-1: 대출 심사

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-2: 대출 금액 결정

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-1: 티켓 가격 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-2: 티켓 추가 혜택

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-1: 보험 자격

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-2: 보험료 계산

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-1: 상품 재고 관리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-2: 재고 알림

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-1: 성적 종합 평가

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-2: 장학금 결정

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
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
