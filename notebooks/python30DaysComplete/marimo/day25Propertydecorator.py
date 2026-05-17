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
    
    이 노트북에는 일부러 비워두거나 실패하게 만든 셀이 있습니다. 설명을 읽고 코드를 고친 뒤 다시 실행하는 방식으로 학습하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 학습 흐름
    
    1. 진단 질문과 시작 전 회상으로 오늘의 위치를 확인합니다.
    2. 개념 경계, 실행 추적, 라인별 해설로 코드가 움직이는 방식을 봅니다.
    3. 예측 문제는 먼저 머릿속으로 답을 정하고 실행합니다.
    4. 빈칸 문제와 버그 수정 문제를 직접 고칩니다.
    5. 전이 연습과 자동 체크포인트로 실제 이해를 검증합니다.
    6. 미니 프로젝트, 누적 프로젝트, 추가 문제은행으로 자기 코드까지 확장합니다.
    
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
    ## 0. 진단 질문
    
    아래 질문은 점수를 매기기 위한 것이 아니라, 오늘 어디를 집중해야 하는지 찾기 위한 진단입니다. 답이 흐릿하면 해당 부분을 천천히 실행 추적하세요.
    
    1. `@property`를 한 문장으로 설명할 수 있는가?
    2. `setter`를 잘못 쓰면 어떤 결과나 에러가 날 수 있는가?
    3. 오늘 미니 프로젝트에서 어떤 값이 입력이고 어떤 값이 결과인가?
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시작 전 회상
    
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
    
    오늘은 단순 진도일이 아니라 누적 점검일입니다. 새 셀을 끝낸 뒤, 이전 Day의 미니 프로젝트 중 하나를 골라 변수명과 데이터를 바꿔 다시 구현하세요.
    
    통과 기준은 더 엄격합니다.
    
    - 이전 개념을 최소 3개 이상 함께 사용했다.
    - 에러가 났을 때 에러 이름과 원인을 적었다.
    - 최종 셀의 결과를 보고 “이 코드가 하는 일”을 비전공자에게 설명할 수 있다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 개념 경계
    
    오늘의 핵심 범위는 `@property`, `setter`, `staticmethod`, `classmethod`, `함수 데코레이터`입니다. 범위를 좁게 잡는 이유는 하나의 노트북에서 너무 많은 문법을 섞으면 실패 원인을 찾기 어려워지기 때문입니다.
    
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
    ## 실행 추적
    
    오늘 핵심 개념은 `프로퍼티와 데코레이터`입니다. 예제 셀을 실행하기 전에 아래 순서로 머릿속 실행을 해봅니다.
    
    | 단계 | 볼 것 | 적을 내용 |
    |---:|---|---|
    | 1 | 입력값 | 처음 만들어지는 값과 타입 |
    | 2 | 변환 | 어떤 연산이나 메서드가 값을 바꾸는지 |
    | 3 | 결과 | 마지막 줄이 보여줄 값 |
    
    표를 완벽하게 채우는 것이 목표가 아닙니다. 코드가 한 줄씩 상태를 바꾼다는 감각을 만드는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 라인별 해설
    
    예제 코드를 실행하기 전에 한 줄씩 의미를 분해합니다. 뛰어난 학습자는 코드를 통째로 외우지 않고, 각 줄이 상태를 어떻게 바꾸는지 말할 수 있습니다.
    
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
    ## 2. 예측 → 검증
    
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
    ## 3. 빈칸 채우기
    
    `Score`의 `value` setter에서 0 이상 100 이하만 허용하세요.
    
    `...` 또는 불완전한 부분을 고친 뒤 셀을 실행하세요. `assert`가 조용히 지나가면 통과입니다.
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
        if ...:
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
    <summary>힌트와 정답</summary>
    
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
    ## 4. 버그 수정
    
    아래 코드는 프로퍼티에 괄호를 붙여 호출합니다. 속성처럼 접근하도록 고치세요.
    
    실패하는 코드를 그냥 지우지 말고, 왜 실패하는지 한 문장으로 설명한 뒤 고치세요.
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
product.salePrice()
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
    ## 오답 노트
    
    버그 수정 셀을 고친 뒤 아래 세 줄을 노트나 마크다운 셀에 직접 적습니다. 공개용 학습 과정에서 중요한 것은 정답 코드가 아니라, 같은 실수를 다시 하지 않게 만드는 규칙입니다.
    
    - 에러 이름:
    - 실제 원인:
    - 다음에 확인할 규칙:
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 5. 전이 연습
    
    `@property`로 전체 이름을 계산하세요.
    
    같은 개념을 다른 데이터와 다른 변수명으로 다시 쓰는 단계입니다. 여기서 막히면 핵심 예제로 돌아가서 코드 모양만 다시 보고 옵니다.
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
        return ...

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
    <summary>전이 연습 3단계 힌트와 정답</summary>
    
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
    ## 자동 체크포인트
    
    빈칸, 버그 수정, 전이 연습을 모두 고친 뒤 실행합니다. 실패 항목이 있으면 해당 셀로 돌아가 고친 다음 이 셀을 다시 실행하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
checks = [
    ('빈칸', 'score.value == 90'),
    ('버그 수정', 'product.salePrice == 9000'),
    ('전이', 'person.fullName == "Ada Lovelace"')
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
    ## 실전 랩 기준
    
    미니 프로젝트는 단순 실행 예제가 아니라 오늘의 실전 랩입니다.
    
    **랩 목표**: 상품 클래스에 할인 가격 프로퍼티와 문자열에서 상품을 만드는 클래스 메서드를 추가하세요.
    
    **우수 제출 기준**
    
    - 변수명만 읽어도 데이터 의미가 드러난다.
    - 마지막 줄의 출력이 목표와 직접 연결된다.
    - `assert` 또는 자동 체크포인트로 핵심 결과를 검증한다.
    - 데이터를 하나 바꿨을 때 결과가 어떻게 바뀌는지 설명할 수 있다.
    - 오늘 배운 문법을 적어도 한 번은 자기 예제로 변형했다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 6. 미니 프로젝트
    
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
    ## 7. 30일 누적 프로젝트
    
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
    ## 8. 자동 자기점검
    
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
    ## 추가 문제은행
    
    자동 체크포인트까지 통과했다면 아래 문제를 노트북 맨 아래 새 셀에 직접 풉니다. 정답 셀은 제공하지 않습니다. 공개용 과정에서는 정답보다 변형 능력이 더 중요합니다.
    
    1. **따라 쓰기**: 핵심 예제와 같은 구조로 변수명과 데이터만 바꿔 다시 작성합니다.
    2. **변형**: 전이 연습 ``@property`로 전체 이름을 계산하세요.`에서 숫자나 문자열을 하나 바꾸고 `assert`도 함께 고칩니다.
    3. **역문제**: 결과값을 먼저 정하고, 그 결과가 나오도록 입력 데이터를 설계합니다.
    4. **오류 만들기**: 오늘의 자주 하는 실수 중 하나를 일부러 만들고, 에러 이름이나 잘못된 결과를 기록합니다.
    5. **설명하기**: @property, setter, staticmethod 중 하나를 비전공자에게 설명하는 3문장 메모를 씁니다.
    6. **연결하기**: 누적 프로젝트 셀에 오늘 배운 문법을 한 줄 더 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 종료 티켓
    
    다음 세 문장을 직접 완성해야 오늘 학습을 끝낸 것으로 봅니다.
    
    - 오늘 내가 배운 핵심은 `프로퍼티와 데코레이터`이고, 한 문장으로 말하면:
    - 내가 고친 버그의 원인은:
    - 내일 다시 보면 가장 먼저 확인할 코드는:
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 공개용 완성 기준
    
    이 노트북을 공개 학습 자료로 사용할 때의 기준입니다. 단순히 셀을 모두 실행한 것이 아니라, 아래 조건을 만족해야 훌륭한 완료로 봅니다.
    
    - 예측, 구현, 디버깅, 전이, 프로젝트 변형이 모두 남아 있다.
    - 자동 체크포인트가 통과한 상태의 노트북을 저장했다.
    - 오답 노트에 최소 1개의 실제 실수가 기록되어 있다.
    - 누적 프로젝트 셀을 자기 데이터로 바꿔 실행했다.
    """)
    return

if __name__ == "__main__":
    app.run()
