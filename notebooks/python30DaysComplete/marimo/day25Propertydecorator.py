import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 25. 프로퍼티와 데코레이터")


@app.cell
def _():
    import marimo as mo
    return (mo,)

@app.cell
def _():
    import ast

    _courseState = {"__builtins__": __builtins__}

    def runCell(source):
        tree = ast.parse(source, mode="exec")
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            lastExpr = ast.Expression(tree.body.pop().value)
            ast.fix_missing_locations(tree)
            ast.fix_missing_locations(lastExpr)
            exec(compile(tree, "<marimo-cell>", "exec"), _courseState)
            return eval(compile(lastExpr, "<marimo-cell>", "eval"), _courseState)
        ast.fix_missing_locations(tree)
        exec(compile(tree, "<marimo-cell>", "exec"), _courseState)
        return None

    return (runCell,)

@app.cell
def _(mo):
    mo.md(r"""
    # Day 25. 프로퍼티와 데코레이터
    
    **오늘의 초점**: 속성처럼 보이지만 검증과 계산을 포함하는 인터페이스를 만든다.
    
    **완성 기준**: `@property`, setter, `@staticmethod`, `@classmethod`, 기본 데코레이터 구조를 이해한다.
    
    이 노트북의 기본 코드는 위에서 아래로 모두 실행됩니다. 먼저 실행해서 결과를 확인하고, 그다음 안내에 따라 값을 조금씩 바꿔 보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 학습 흐름
    
    1. 준비 질문과 시작 전 떠올리기로 오늘 배울 내용을 확인합니다.
    2. 오늘 배울 범위, 코드가 실행되는 순서, 한 줄씩 보기를 읽습니다.
    3. 예측 문제는 먼저 머릿속으로 답을 정하고 실행합니다.
    4. 값 바꿔보기와 오류 고쳐보기를 따라 실행합니다.
    5. 비슷한 문제와 자동 확인으로 오늘 코드를 확인합니다.
    6. 작은 만들기, 30일 프로젝트, 더 연습하기로 자기 코드까지 확장합니다.
    
    ## 오늘 다룰 개념
    
    - @property
    - setter
    - staticmethod
    - classmethod
    - 함수 데코레이터
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 왜 배우는가
    
    사용자는 `obj.value`처럼 단순하게 쓰고 싶지만, 내부에서는 검증이나 계산이 필요할 때가 있다. 프로퍼티는 깔끔한 사용법과 안전한 내부 로직을 함께 제공한다.
    
    ## 생각 모델
    
    프로퍼티는 메서드를 속성처럼 보이게 하는 약속이다. 외부 사용법은 단순하게 유지하고 내부 구현은 바꿀 수 있다.
    
    ## 자주 하는 실수
    
    - 프로퍼티를 메서드처럼 호출하기
    - setter 내부에서 같은 프로퍼티에 다시 대입해 무한 재귀 만들기
    - 데코레이터가 함수를 감싸는 구조를 잊기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 0. 준비 질문
    
    아래 질문은 점수를 매기기 위한 것이 아니라, 오늘 어디를 집중해야 하는지 찾기 위한 준비 질문입니다. 답이 흐릿하면 해당 부분을 천천히 다시 읽으세요.
    
    1. `@property`를 한 문장으로 설명할 수 있는가?
    2. `setter`를 잘못 쓰면 어떤 결과나 에러가 날 수 있는가?
    3. 오늘 작은 만들기에서 어떤 값이 입력이고 어떤 값이 결과인가?
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시작 전 떠올리기
    
    새 문법을 보기 전에 이전 내용을 먼저 꺼내야 장기 기억으로 넘어갑니다. 아래 질문은 실행하지 않고 말이나 메모로 답합니다.
    
    - Day 24: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    - Day 22: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    - Day 18: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    
    답이 바로 떠오르지 않으면 해당 Day의 예측 문제만 다시 실행하고 돌아오세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 마일스톤: 객체지향 기본 설계 점검
    
    오늘은 단순 진도일이 아니라 누적 점검일입니다. 새 셀을 끝낸 뒤, 이전 Day의 작은 만들기 중 하나를 골라 변수명과 데이터를 바꿔 다시 구현하세요.
    
    통과 기준은 더 엄격합니다.
    
    - 이전 개념을 최소 3개 이상 함께 사용했다.
    - 에러가 났을 때 에러 이름과 원인을 적었다.
    - 최종 셀의 결과를 보고 “이 코드가 하는 일”을 비전공자에게 설명할 수 있다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘 배울 범위
    
    오늘은 `@property`, `setter`, `staticmethod`, `classmethod`, `함수 데코레이터`만 집중합니다. 한 번에 너무 많이 배우면 어디서 막혔는지 찾기 어렵기 때문입니다.
    
    **오늘 집중할 것**
    
    - 값을 어떻게 만들고 확인하는가
    - 결과가 예상과 다를 때 어느 줄을 먼저 볼 것인가
    - 같은 문법을 다른 데이터에 적용할 수 있는가
    
    **오늘 피할 실수**
    
    - 프로퍼티를 메서드처럼 호출하기
    - setter 내부에서 같은 프로퍼티에 다시 대입해 무한 재귀 만들기
    - 데코레이터가 함수를 감싸는 구조를 잊기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 코드가 실행되는 순서
    
    오늘 핵심 내용은 `프로퍼티와 데코레이터`입니다. 예제 셀을 실행하기 전에 아래 순서로 천천히 따라가 봅니다.
    
    | 단계 | 볼 것 | 적을 내용 |
    |---:|---|---|
    | 1 | 입력값 | 처음 만들어지는 값과 타입 |
    | 2 | 변환 | 어떤 연산이나 메서드가 값을 바꾸는지 |
    | 3 | 결과 | 마지막 줄이 보여줄 값 |
    
    표를 완벽하게 채우는 것이 목표가 아닙니다. 코드가 위에서 아래로 한 줄씩 실행된다는 감각을 만드는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 한 줄씩 보기
    
    예제 코드를 실행하기 전에 한 줄씩 의미를 봅니다. 코드를 통째로 외우기보다, 각 줄이 무엇을 만드는지 말할 수 있으면 됩니다.
    
    | 줄 | 코드 | 역할 |
    |---:|---|---|
    | 1 | `class Temperature:` | 데이터와 동작을 묶을 새 타입의 설계도를 만듭니다. |
    | 2 | `    def __init__(self, celsius):` | 재사용할 동작에 이름을 붙입니다. 입력과 반환값을 함께 생각합니다. |
    | 3 | `        self.celsius = celsius` | 계산 결과나 데이터를 이름에 연결합니다. |
    | 4 | ` ` | 읽기 좋게 구획을 나누는 빈 줄입니다. |
    | 5 | `    @property` | 마지막 표현식이거나 호출입니다. 실행 결과를 관찰해 상태를 확인합니다. |
    | 6 | `    def fahrenheit(self):` | 재사용할 동작에 이름을 붙입니다. 입력과 반환값을 함께 생각합니다. |
    | 7 | `        return self.celsius * 9 / 5 + 32` | 함수 호출자에게 돌려줄 결과를 정합니다. |
    | 8 | ` ` | 읽기 좋게 구획을 나누는 빈 줄입니다. |
    | 9 | `temp = Temperature(20)` | 계산 결과나 데이터를 이름에 연결합니다. |
    | 10 | `temp.fahrenheit` | 마지막 표현식이거나 호출입니다. 실행 결과를 관찰해 상태를 확인합니다. |
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 1. 핵심 예제
    
    먼저 완성된 예제를 실행해 오늘의 문법이 어떤 모양인지 확인합니다.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

temp = Temperature(20)
temp.fahrenheit
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 2. 먼저 예상하고 실행하기
    
    `@property`가 붙은 메서드는 괄호 없이 접근합니다.
    
    실행 전에 예상 결과를 노트에 적어두세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class User:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def fullName(self):
        return f"{self.first} {self.last}"

User("Ada", "Lovelace").fullName
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>예상 결과 확인</summary>
    
    ```python
    'Ada Lovelace'
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 3. 값 바꿔보기
    
    `Score`의 `value` setter에서 0 이상 100 이하만 허용하세요.
    
    아래 코드는 바로 실행됩니다. `assert`는 “이 조건이 맞아야 한다”는 확인문입니다. 조건이 맞으면 아무 말 없이 지나갑니다. 먼저 실행한 뒤 값을 하나 바꿔 보세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class Score:
    def __init__(self, value):
        self.value = value

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, newValue):
        if newValue < 0 or newValue > 100:
            raise ValueError("score must be 0..100")
        self._value = newValue

score = Score(90)
assert score.value == 90
score.value
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>힌트와 설명</summary>
    
    1. 어떤 값이 최종 변수에 들어가야 하는지 먼저 말로 설명합니다.
    2. 이미 만들어진 변수 중 재사용할 수 있는 값을 찾습니다.
    3. 정답 예시는 아래와 같습니다.
    
    ```python
    class Score:
        def __init__(self, value):
            self.value = value
    
        @property
        def value(self):
            return self._value
    
        @value.setter
        def value(self, newValue):
            if newValue < 0 or newValue > 100:
                raise ValueError("score must be 0..100")
            self._value = newValue
    
    score = Score(90)
    assert score.value == 90
    score.value
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 4. 오류 고쳐보기
    
    자주 하는 실수는 프로퍼티에 괄호를 붙여 호출합니다. 속성처럼 접근하도록 고치세요.
    
    아래 셀은 그 실수를 고친 버전입니다. 먼저 실행해서 정상 결과를 보고, 어떤 부분이 고쳐졌는지 한 문장으로 적어 보세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class Product:
    def __init__(self, price):
        self.price = price

    @property
    def salePrice(self):
        return int(self.price * 0.9)

product = Product(10000)
product.salePrice
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>수정 예시</summary>
    
    ```python
    class Product:
        def __init__(self, price):
            self.price = price
    
        @property
        def salePrice(self):
            return int(self.price * 0.9)
    
    product = Product(10000)
    product.salePrice
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 틀린 이유 적기
    
    오류 고쳐보기 셀을 실행한 뒤 아래 세 줄을 노트나 마크다운 셀에 직접 적습니다. 중요한 것은 정답 코드를 외우는 것이 아니라, 같은 실수를 다시 줄이는 규칙을 만드는 것입니다.
    
    - 오류 이름:
    - 실제 원인:
    - 다음에 확인할 규칙:
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 5. 비슷한 문제 풀기
    
    `@property`로 전체 이름을 계산하세요.
    
    같은 문법을 다른 데이터와 다른 변수명으로 다시 써 봅니다. 아래 코드는 바로 실행됩니다. 실행한 뒤 값 하나를 바꿔 다시 확인하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class Person:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def fullName(self):
        return f"{self.first} {self.last}"

person = Person("Ada", "Lovelace")
assert person.fullName == "Ada Lovelace"
person.fullName
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>비슷한 문제 3단계 힌트</summary>
    
    1. 개념 힌트: 오늘 배운 핵심 문법 중 어떤 것을 써야 하는지 먼저 고릅니다.
    2. 구조 힌트: 최종 변수에 어떤 값이 들어가야 `assert`가 통과하는지 역으로 생각합니다.
    3. 정답 예시는 아래와 같습니다.
    
    ```python
    class Person:
        def __init__(self, first, last):
            self.first = first
            self.last = last
    
        @property
        def fullName(self):
            return f"{self.first} {self.last}"
    
    person = Person("Ada", "Lovelace")
    assert person.fullName == "Ada Lovelace"
    person.fullName
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 자동 확인
    
    값 바꿔보기, 오류 고쳐보기, 비슷한 문제 풀기를 확인합니다. 실패 항목이 있으면 해당 셀로 돌아가 값을 다시 확인하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
checks = [
    ('값 바꾸기', 'score.value == 90'),
    ('오류 고쳐보기', 'product.salePrice == 9000'),
    ('비슷한 문제', 'person.fullName == "Ada Lovelace"')
]
checkpointResults = []
for checkName, expression in checks:
    try:
        passed = bool(eval(expression))
        checkpointResults.append({"check": checkName, "passed": passed, "error": ""})
    except (NameError, AssertionError, TypeError, ValueError, AttributeError, KeyError, IndexError) as exc:
        checkpointResults.append({"check": checkName, "passed": False, "error": type(exc).__name__})

passedCount = sum(1 for item in checkpointResults if item["passed"])
{"passed": passedCount, "total": len(checkpointResults), "details": checkpointResults}
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 작은 만들기 기준
    
    작은 만들기는 오늘 배운 문법을 내 예제로 바꾸는 단계입니다.
    
    **랩 목표**: 상품 클래스에 할인 가격 프로퍼티와 문자열에서 상품을 만드는 클래스 메서드를 추가하세요.
    
    **우수 제출 기준**
    
    - 변수명만 읽어도 데이터 의미가 드러난다.
    - 마지막 줄의 출력이 목표와 직접 연결된다.
    - `assert` 또는 자동 확인 코드로 핵심 결과를 확인한다.
    - 데이터를 하나 바꿨을 때 결과가 어떻게 바뀌는지 설명할 수 있다.
    - 오늘 배운 문법을 적어도 한 번은 자기 예제로 변형했다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 6. 작은 만들기
    
    상품 클래스에 할인 가격 프로퍼티와 문자열에서 상품을 만드는 클래스 메서드를 추가하세요.
    
    아래 코드는 시작점입니다. 실행 후 값을 바꿔보고, 마지막 줄의 결과가 어떻게 달라지는지 확인하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    @property
    def salePrice(self):
        return int(self.price * 0.8)

    @classmethod
    def fromText(cls, text):
        name, price = text.split(":")
        return cls(name, int(price))

product = Product.fromText("book:15000")
product.name, product.salePrice
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 7. 30일 프로젝트
    
    매일 하나의 작은 학습 기록 프로그램을 조금씩 키웁니다. 오늘 셀은 이전 문법을 버리지 않고 새 문법을 얹는 방식으로 작성되어 있습니다.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
class StudyGoal:
    def __init__(self, minutes):
        self.minutes = minutes

    @property
    def hours(self):
        return self.minutes / 60

goal = StudyGoal(90)
goal.hours
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 8. 마무리 체크
    
    아래 값을 직접 `True`로 바꾸는 것은 체크 표시가 아니라 약속입니다. 각 항목을 실제로 끝낸 뒤에만 바꾸세요. 마지막 값이 `True`가 아니면 다음 Day로 넘어가지 않습니다.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
dayNumber = 25
predictionWritten = False
fillBlankPassed = False
bugExplained = False
transferSolved = False
projectChanged = False
readyForNextDay = predictionWritten and fillBlankPassed and bugExplained and transferSolved and projectChanged
readyForNextDay
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 9. 변형 과제와 회고
    
    **변형 과제**: `@staticmethod`으로 가격이 양수인지 검사하는 함수를 추가해보세요.
    
    **회고 질문**
    
    - 오늘 문법을 어디에 쓸 수 있는가?
    - 가장 헷갈린 규칙은 무엇인가?
    - 같은 문제를 내일 다시 푼다면 어떤 변수명이나 함수명을 더 좋게 바꿀 수 있는가?
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 더 연습하기
    
    자동 확인까지 통과했다면 아래 문제를 노트북 맨 아래 새 셀에 직접 풉니다. 정답보다 중요한 것은 같은 코드를 내 데이터로 바꿔 보는 것입니다.
    
    1. **따라 쓰기**: 핵심 예제와 같은 구조로 변수명과 데이터만 바꿔 다시 작성합니다.
    2. **값 바꾸기**: 비슷한 문제 ``@property`로 전체 이름을 계산하세요.`에서 숫자나 문자열을 하나 바꾸고 확인 코드도 함께 고칩니다.
    3. **역문제**: 결과값을 먼저 정하고, 그 결과가 나오도록 입력 데이터를 설계합니다.
    4. **오류 만들기**: 오늘의 자주 하는 실수 중 하나를 일부러 만들고, 에러 이름이나 잘못된 결과를 기록합니다.
    5. **설명하기**: @property, setter, staticmethod 중 하나를 비전공자에게 설명하는 3문장 메모를 씁니다.
    6. **연결하기**: 30일 프로젝트 셀에 오늘 배운 문법을 한 줄 더 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 마지막 한 줄 정리
    
    다음 세 문장을 직접 완성해야 오늘 학습을 끝낸 것으로 봅니다.
    
    - 오늘 내가 배운 핵심은 `프로퍼티와 데코레이터`이고, 한 문장으로 말하면:
    - 내가 고친 오류의 원인은:
    - 내일 다시 보면 가장 먼저 확인할 코드는:
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘 완료 기준
    
    이 노트북을 공개 학습 자료로 사용할 때의 기준입니다. 단순히 셀을 모두 실행한 것이 아니라, 아래 조건을 만족해야 훌륭한 완료로 봅니다.
    
    - 예측, 값 바꾸기, 오류 고치기, 비슷한 문제, 프로젝트 변형이 모두 남아 있다.
    - 자동 확인이 통과한 상태의 노트북을 저장했다.
    - 틀린 이유 적기에 최소 1개의 실제 실수가 기록되어 있다.
    - 30일 프로젝트 셀을 자기 데이터로 바꿔 실행했다.
    """)
    return

if __name__ == "__main__":
    app.run()
