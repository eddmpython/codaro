import marimo

__generated_with = "0.21.0"
app = marimo.App()


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    mo.md("""
    # Codaro Shell Fixture

    This notebook exists only for UI capture parity checks.
    """)
    return


@app.cell
def _():
    message = "hello, codaro"
    message.upper()
    return


@app.cell
def _():
    items = [1, 2, 3]
    sum(items)
    return


@app.cell
def _(mo):
    mo.md("""
    ## Notes

    - The shell should follow marimo chrome.
    - The content here is disposable.
    """)
    return


if __name__ == "__main__":
    app.run()
