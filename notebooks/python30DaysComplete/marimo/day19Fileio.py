import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 19. 파일입출력")


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
    # Day 19. 파일입출력

    이 노트북은 `study/python/30days/day19_파일입출력.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    open(), read(), write(), with로 파일을 읽고 씁니다.

    ## 왜 중요한가

    프로그램이 끝난 뒤에도 데이터를 남기려면 파일 입출력이 필요합니다.

    ## 생각 모델

    파일은 프로그램 밖에 있는 노트입니다. with는 노트를 열고 작업한 뒤 안전하게 닫아주는 틀입니다.

    ## 오늘 배우는 것

    - 파일 열기와 닫기
    - 파일 읽고 쓰기
    - with문으로 안전하게
    - 파일 모드 이해

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

    - 오늘 새로 배우는 개념: open(), read(), write(), with, close(), 파일 모드
    - 이미 써도 되는 개념: 함수 전체, import
    - 오늘은 일부러 쓰지 않는 개념: 클래스, 외부 라이브러리

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 읽기 모드인지 쓰기 모드인지, 파일 이름이 무엇인지 먼저 확인합니다.
    - 실행 중: 파일에 쓴 뒤 다시 읽어 실제 내용이 저장됐는지 확인합니다.
    - 연습 초점: 짧은 메모를 파일로 저장하고 다시 읽어 출력합니다.
    - 막히면: FileNotFoundError가 나면 현재 작업 폴더와 파일 이름 철자를 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 파일 열기

    *open() 함수*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    open() 함수로 파일을 엽니다. open(파일경로, 모드) 형식으로 쓰며, 파일 객체를 반환합니다. 사용 후에는 close()로 닫아야 합니다. 기본 모드는 읽기('r')입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - open(경로, 모드)
    - 파일 객체 반환
    - close()로 닫기
    - 기본은 읽기 모드
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 파일 열기

    텍스트 파일을 열어봅니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    f = open('test.txt', 'w')
    f.write('Hello World')
    f.close()
    'File created'
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        f = open('test.txt', 'w')
        f.write('Hello World')
        f.close()
        return 'File created'
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 파일 읽기

    파일을 읽기 모드로 엽니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    handle = open('test.txt', 'r')
    content = handle.read()
    handle.close()
    content
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        handle = open('test.txt', 'r')
        content = handle.read()
        handle.close()
        return content
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 파일 존재 확인

    파일이 없으면 에러가 발생합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    file = open('test.txt', 'w')
    file.write('Python')
    file.close()
    'File written'
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        file = open('test.txt', 'w')
        file.write('Python')
        file.close()
        return 'File written'
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 파일은 반드시 close()로 닫아야 리소스가 해제됩니다. 노트북 환경에서는 파일 목록 패널에서 생성된 txt 파일을 확인할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 파일 읽기

    *read() 메서드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    read() 메서드로 파일 내용을 읽습니다. 전체 내용을 문자열로 반환합니다. readline()은 한 줄씩, readlines()는 모든 줄을 리스트로 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - read(): 전체 읽기
    - readline(): 한 줄 읽기
    - readlines(): 리스트로
    - 문자열로 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 전체 읽기

    read()로 파일 전체를 읽습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    writer = open('data.txt', 'w')
    writer.write('Line 1\nLine 2\nLine 3')
    writer.close()

    reader = open('data.txt', 'r')
    text = reader.read()
    reader.close()
    text
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        writer = open('data.txt', 'w')
        writer.write('Line 1\nLine 2\nLine 3')
        writer.close()

        reader = open('data.txt', 'r')
        text = reader.read()
        reader.close()
        return text
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 한 줄 읽기

    readline()으로 첫 줄만 읽습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    output = open('sample.txt', 'w')
    output.write('First\nSecond\nThird')
    output.close()

    input = open('sample.txt', 'r')
    line = input.readline()
    input.close()
    line
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        output = open('sample.txt', 'w')
        output.write('First\nSecond\nThird')
        output.close()

        input = open('sample.txt', 'r')
        line = input.readline()
        input.close()
        return line
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 모든 줄 읽기

    readlines()로 모든 줄을 리스트로 읽습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fw = open('lines.txt', 'w')
    fw.write('A\nB\nC')
    fw.close()

    fr = open('lines.txt', 'r')
    lines = fr.readlines()
    fr.close()
    lines
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        fw = open('lines.txt', 'w')
        fw.write('A\nB\nC')
        fw.close()

        fr = open('lines.txt', 'r')
        lines = fr.readlines()
        fr.close()
        return lines
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > readlines()는 각 줄에 줄바꿈 문자(\n)를 포함합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 파일 쓰기

    *write() 메서드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    write() 메서드로 파일에 문자열을 씁니다. 'w' 모드는 기존 내용을 지우고, 'a' 모드는 끝에 추가합니다. write()는 쓴 문자 수를 반환합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - write(문자열)
    - 'w': 덮어쓰기
    - 'a': 추가하기
    - 쓴 문자 수 반환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 새로 쓰기

    'w' 모드로 새로 씁니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    fileObj = open('message.txt', 'w')
    count = fileObj.write('Hello Python')
    fileObj.close()
    count
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        fileObj = open('message.txt', 'w')
        count = fileObj.write('Hello Python')
        fileObj.close()
        return count
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 추가하기

    'a' 모드로 끝에 추가합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    obj = open('log.txt', 'w')
    obj.write('Start\n')
    obj.close()

    obj2 = open('log.txt', 'a')
    obj2.write('End\n')
    obj2.close()

    obj3 = open('log.txt', 'r')
    result = obj3.read()
    obj3.close()
    result
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        obj = open('log.txt', 'w')
        obj.write('Start\n')
        obj.close()

        obj2 = open('log.txt', 'a')
        obj2.write('End\n')
        obj2.close()

        obj3 = open('log.txt', 'r')
        result = obj3.read()
        obj3.close()
        return result
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 줄 쓰기

    여러 줄을 순서대로 씁니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    target = open('multi.txt', 'w')
    target.write('Line 1\n')
    target.write('Line 2\n')
    target.write('Line 3\n')
    target.close()

    source = open('multi.txt', 'r')
    multiText = source.read()
    source.close()
    multiText
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        target = open('multi.txt', 'w')
        target.write('Line 1\n')
        target.write('Line 2\n')
        target.write('Line 3\n')
        target.close()

        source = open('multi.txt', 'r')
        multiText = source.read()
        source.close()
        return multiText
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 'w' 모드는 기존 파일을 완전히 지우므로 주의하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## with 문

    *자동으로 닫기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    with 문을 사용하면 파일을 자동으로 닫아줍니다. with open(경로, 모드) as 변수: 형식으로 쓰며, 블록이 끝나면 자동으로 close()가 호출됩니다. 안전하고 권장되는 방법입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - with open() as 변수:
    - 자동으로 닫힘
    - 예외 발생해도 안전
    - 권장되는 방법
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### with로 읽기

    with 문으로 파일을 읽습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('test.txt', 'w') as outFile:
    outFile.write('With statement')

    with open('test.txt', 'r') as inFile:
    data = inFile.read()

    data
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        with open('test.txt', 'w') as outFile:
            outFile.write('With statement')

        with open('test.txt', 'r') as inFile:
            data = inFile.read()

        return data
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### with로 쓰기

    with 문으로 파일을 씁니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('output.txt', 'w') as stream:
    stream.write('Easy and safe')

    with open('output.txt', 'r') as stream:
    output = stream.read()

    output
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        with open('output.txt', 'w') as stream:
            stream.write('Easy and safe')

        with open('output.txt', 'r') as stream:
            output = stream.read()

        return output
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 줄 처리

    with 문 안에서 여러 작업을 합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('numbers.txt', 'w') as dest:
    for i in range(1, 4):
    dest.write(str(i) + '\n')

    with open('numbers.txt', 'r') as src:
    numLines = src.readlines()

    numLines
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        with open('numbers.txt', 'w') as dest:
            for i in range(1, 4):
                dest.write(str(i) + '\n')

        with open('numbers.txt', 'r') as src:
            numLines = src.readlines()

        return numLines
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > with 문은 close()를 잊어버릴 걱정이 없어 안전합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 파일 모드

    *읽기/쓰기/추가*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파일 모드는 파일을 어떻게 열지 결정합니다. 'r'(읽기), 'w'(쓰기), 'a'(추가), 'r+'(읽기/쓰기) 등이 있습니다. 텍스트 모드가 기본이며, 'b'를 붙이면 바이너리 모드입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 'r': 읽기 (기본)
    - 'w': 쓰기 (덮어쓰기)
    - 'a': 추가
    - 'r+': 읽기와 쓰기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 읽기 모드

    'r' 모드로 읽기만 합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('test.txt', 'w') as wf:
    wf.write('Read mode test')

    with open('test.txt', 'r') as rf:
    readData = rf.read()

    readData
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        with open('test.txt', 'w') as wf:
            wf.write('Read mode test')

        with open('test.txt', 'r') as rf:
            readData = rf.read()

        return readData
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 추가 모드

    'a' 모드로 기존 내용에 추가합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('append.txt', 'w') as initial:
    initial.write('First\n')

    with open('append.txt', 'a') as appender:
    appender.write('Second\n')

    with open('append.txt', 'r') as checker:
    appended = checker.read()

    appended
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        with open('append.txt', 'w') as initial:
            initial.write('First\n')

        with open('append.txt', 'a') as appender:
            appender.write('Second\n')

        with open('append.txt', 'r') as checker:
            appended = checker.read()

        return appended
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 모드 확인

    파일 객체의 모드를 확인할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('test.txt', 'w') as item:
    mode = item.mode

    mode
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        with open('test.txt', 'w') as item:
            mode = item.mode

        return mode
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 파일이 없을 때 'r'은 에러, 'w'와 'a'는 파일을 생성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 줄 단위 순회

    *for문으로 읽기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파일 객체는 for문으로 순회할 수 있습니다. 각 줄을 하나씩 가져오므로 메모리 효율적입니다. 큰 파일을 처리할 때 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - for 줄 in 파일:
    - 한 줄씩 순회
    - 메모리 효율적
    - 큰 파일 처리 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 줄 순회

    for문으로 각 줄을 읽습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('items.txt', 'w') as creator:
    creator.write('Apple\nBanana\nCherry')

    with open('items.txt', 'r') as processor:
    lineCount = 0
    for line in processor:
    lineCount = lineCount + 1

    lineCount
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        with open('items.txt', 'w') as creator:
            creator.write('Apple\nBanana\nCherry')

        with open('items.txt', 'r') as processor:
            lineCount = 0
            for line in processor:
                lineCount = lineCount + 1

        return lineCount
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 줄 처리

    각 줄을 처리하여 리스트로 만듭니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('words.txt', 'w') as gen:
    gen.write('hello\nworld\npython')

    with open('words.txt', 'r') as scan:
    uppered = []
    for word in scan:
    uppered.append(word.strip().upper())

    uppered
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        with open('words.txt', 'w') as gen:
            gen.write('hello\nworld\npython')

        with open('words.txt', 'r') as scan:
            uppered = []
            for word in scan:
                uppered.append(word.strip().upper())

        return uppered
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 처리

    조건에 맞는 줄만 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    with open('scores.txt', 'w') as maker:
    maker.write('80\n90\n70\n95')

    with open('scores.txt', 'r') as reader:
    passCount = 0
    for score in reader:
    if int(score) >= 80:
    passCount = passCount + 1

    passCount
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        with open('scores.txt', 'w') as maker:
            maker.write('80\n90\n70\n95')

        with open('scores.txt', 'r') as reader:
            passCount = 0
            for score in reader:
                if int(score) >= 80:
                    passCount = passCount + 1

        return passCount
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > strip()으로 줄바꿈 문자를 제거할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 19 종합 복습

    *파일 입출력 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 19에서 배운 파일 입출력을 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 파일 쓰기

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본2: 파일 읽기

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본3: 추가 모드

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본4: 줄 읽기

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟢 기본5: 줄 순회

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용1: 카운터

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용2: 숫자 합계

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용3: 필터링

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용4: 변환

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🟡 응용5: 로그 작성

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화1-1: CSV 읽기

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화1-2: CSV 분석

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화2-1: 파일 복사

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화2-2: 파일 병합

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화3-1: 단어 빈도

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화3-2: 최빈 단어

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화4-1: 성적 통계

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화4-2: 성적 등급

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화5-1: 필터 저장

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ### 연습: 🔴 심화5-2: 데이터 변환

    **목표**: 예제를 외우지 않고 같은 구조의 코드를 직접 작성합니다.

    **조건**: 오늘의 범위 안에서 해결합니다. 아직 배우지 않은 문법을 검색해서 붙여 넣지 않습니다.

    **막히면**: 바로 위 예제의 값과 이름만 바꿔 가장 작은 버전부터 실행합니다.

    **완료 확인**: 실행 오류가 없고, 결과가 왜 그렇게 나왔는지 한 문장으로 설명할 수 있어야 합니다.
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
    ## 완료 기준

    - with open(...) 구조로 파일을 안전하게 다룰 수 있다.
    - 읽기 모드와 쓰기 모드의 차이를 설명할 수 있다.
    - write()로 저장한 내용을 read()로 다시 확인할 수 있다.

    ## 흔한 막힘

    - 쓰기 모드가 기존 내용을 덮어쓴다는 점을 놓침
    - 파일을 닫기 전에 읽으려 함
    - 실행 위치와 파일 위치를 혼동함

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
