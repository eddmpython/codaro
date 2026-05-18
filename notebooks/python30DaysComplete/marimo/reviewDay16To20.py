import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Review Day 16-20")


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
    # Review Day 16-20

    이 노트북은 진도용이 아니라 회상용입니다. 이전 Day를 다시 열기 전에, 먼저 기억나는 개념과 코드를 직접 꺼내봅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 복습 범위

    | Day | 제목 | 핵심 개념 |
    |---|---|---|
    | Day 16 | 함수 고급 | 기본값 매개변수, 키워드 인자, *args, **kwargs, lambda |
    | Day 17 | 스코프와 클로저 | global, nonlocal, 클로저, 스코프 |
    | Day 18 | 모듈과 import | import, from import, as 별칭, math 모듈, random 모듈, datetime 모듈, os 모듈, sys 모듈 |
    | Day 19 | 파일 입출력 | open(), read(), write(), with, close(), 파일 모드 |
    | Day 20 | 예외 처리 | try, except, finally, raise, 예외 종류 |
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 직접 작성

    아래 셀에 이번 범위에서 기억나는 예제를 3개 이상 다시 작성하세요.
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
    ## 점검 질문

    - 설명을 보지 않고 가장 쉬운 예제를 다시 쓸 수 있는가?
    - 가장 헷갈린 개념 하나를 말로 설명할 수 있는가?
    - 같은 코드를 다른 값으로 바꿔도 결과를 예상할 수 있는가?
    """)
    return


if __name__ == "__main__":
    app.run()
