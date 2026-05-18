import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Review Day 26-30")


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
    # Review Day 26-30

    이 노트북은 진도용이 아니라 회상용입니다. 이전 Day를 다시 열기 전에, 먼저 기억나는 개념과 코드를 직접 꺼내봅니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 복습 범위

    | Day | 제목 | 핵심 개념 |
    |---|---|---|
    | Day 26 | 컴프리헨션 | list_comprehension, dict_comprehension, set_comprehension, nested_comprehension |
    | Day 27 | 제너레이터와 이터레이터 | yield, generator, iter, next, iterator_protocol |
    | Day 28 | 고급 문법 종합 | context_manager, with_statement, custom_context_manager |
    | Day 29 | 알고리즘 연습 | sorting, searching, recursion |
    | Day 30 | 최종 프로젝트 | 복습 |
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
