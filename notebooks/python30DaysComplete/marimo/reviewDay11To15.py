import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Review Day 11-15")


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
    # Review Day 11-15
    
    이 리뷰 노트북은 진도용이 아니라 회수용입니다. 5일 동안 배운 개념을 한 문제 안에서 다시 꺼내 쓰는지 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 개념 맵
    
    | 범위 | 주제 | 핵심 개념 |
    |---|---|---|
    | Day 11 | 딕셔너리 기초 | 키와 값, 값 읽기, 값 수정, 새 키 추가 |
    | Day 12 | 딕셔너리 메서드 | 안전한 읽기, 키 목록, 값 목록, 키-값 순회 |
    | Day 13 | 조건문 | if, elif, else, 중첩 조건 |
    | Day 14 | 반복문 | for, while, range, 누적 |
    | Day 15 | 함수 기초 | def, 매개변수, 인자, return |
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리뷰 프로젝트
    
    아래 코드는 해당 구간의 핵심 개념을 하나로 묶은 작은 프로젝트입니다. 먼저 실행하고, 그 다음 데이터와 변수명을 바꿔 다시 작성하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
records = [
    {"topic": "dict", "score": 85},
    {"topic": "loop", "score": 72},
    {"topic": "function", "score": 91},
]
def grade(score):
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    return "C"

report = {}
for record in records:
    report[record["topic"]] = grade(record["score"])
report
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시험형 과제
    
    새 코드 셀을 만들고 아래 조건을 만족하는 코드를 작성합니다.
    
    - 이전 5일 중 최소 3일의 개념을 사용한다.
    - 결과 검증용 `assert`를 2개 이상 넣는다.
    - 에러가 날 수 있는 입력을 하나 이상 고려한다.
    - 마지막 줄은 사람이 읽을 수 있는 요약값이어야 한다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리뷰 통과 기준
    
    - 개념 이름을 보지 않고 코드에서 쓰인 문법을 설명할 수 있다.
    - 코드 한 줄을 바꿨을 때 어떤 출력이 달라지는지 말할 수 있다.
    - 같은 프로젝트를 자기 데이터로 다시 만들었다.
    """)
    return

if __name__ == "__main__":
    app.run()
