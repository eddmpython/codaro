import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 20. 예외처리")


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
    # Day 20. 예외처리

    이 노트북은 `study/python/30days/day20_예외처리.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘의 목표

    try, except, finally, raise로 예상 가능한 오류를 처리합니다.

    ## 왜 중요한가

    좋은 프로그램은 오류가 나지 않는 척하지 않고, 실패 상황을 읽을 수 있게 다룹니다.

    ## 생각 모델

    예외 처리는 위험할 수 있는 코드를 보호 구역에 넣고, 실패 종류에 맞게 대응하는 구조입니다.

    ## 오늘 배우는 것

    - try-except로 에러 처리
    - finally로 정리 작업
    - raise로 예외 발생
    - 안정적인 프로그램

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

    - 오늘 새로 배우는 개념: try, except, finally, raise, 예외 종류
    - 이미 써도 되는 개념: 함수 전체, import, 파일 입출력
    - 오늘은 일부러 쓰지 않는 개념: 클래스, 사용자 정의 예외

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 학습 전략

    - 코딩 전: 어떤 줄에서 어떤 예외가 날 수 있는지 먼저 예상합니다.
    - 실행 중: 정상 입력과 실패 입력을 모두 실행해 흐름이 어떻게 갈라지는지 확인합니다.
    - 연습 초점: 숫자 변환, 파일 읽기처럼 실패할 수 있는 작업에 좁은 except를 붙입니다.
    - 막히면: 모든 오류를 한 번에 잡으려 하지 말고 실제 예외 이름을 확인합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## try-except 기본

    *에러 처리하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    try-except 문으로 에러를 처리합니다. try 블록에서 에러가 발생하면 except 블록이 실행됩니다. 프로그램이 중단되지 않고 계속 실행됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - try: 실행할 코드
    - except: 에러 처리
    - 에러 발생시 except 실행
    - 프로그램 중단 방지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 예외 처리

    에러가 발생해도 프로그램이 계속 실행됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    result = 10 / 0
    except:
    result = 'Error occurred'

    result
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0008():
        try:
            result = 10 / 0
        except:
            result = 'Error occurred'

        return result
    _snippet_0008()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정상 실행

    에러가 없으면 except는 실행되지 않습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    value = 10 / 2
    except:
    value = 'Error'

    value
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0010():
        try:
            value = 10 / 2
        except:
            value = 'Error'

        return value
    _snippet_0010()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수에서 사용

    함수 안에서도 예외를 처리할 수 있습니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def safeDivide(a, b):
    try:
    return a / b
    except:
    return 0

    safeDivide(10, 0)
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0012():
        def safeDivide(a, b):
            try:
                return a / b
            except:
                return 0

        return safeDivide(10, 0)
    _snippet_0012()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > try-except는 예상되는 에러를 처리할 때 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 특정 예외 처리

    *예외 타입 지정*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    except 뒤에 예외 타입을 지정할 수 있습니다. 특정 에러만 처리하고 다른 에러는 그대로 발생시킵니다. 더 정확한 에러 처리가 가능합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - except 예외타입:
    - 특정 에러만 처리
    - 다른 에러는 발생
    - 정확한 처리 가능
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### ZeroDivisionError

    0으로 나누는 에러만 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    num = 10 / 0
    except ZeroDivisionError:
    num = 'Cannot divide by zero'

    num
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0018():
        try:
            num = 10 / 0
        except ZeroDivisionError:
            num = 'Cannot divide by zero'

        return num
    _snippet_0018()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### ValueError

    잘못된 값 변환 에러를 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    converted = int('abc')
    except ValueError:
    converted = 0

    converted
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0020():
        try:
            converted = int('abc')
        except ValueError:
            converted = 0

        return converted
    _snippet_0020()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### IndexError

    인덱스 범위 에러를 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    items = [1, 2, 3]
    item = items[10]
    except IndexError:
    item = 'Index out of range'

    item
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0022():
        try:
            items = [1, 2, 3]
            item = items[10]
        except IndexError:
            item = 'Index out of range'

        return item
    _snippet_0022()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 예외 타입을 지정하면 의도하지 않은 에러를 놓치지 않습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 여러 예외 처리

    *다양한 에러 대응*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    여러 except 블록으로 다양한 예외를 처리할 수 있습니다. 위에서부터 순서대로 검사하며, 처음 일치하는 except가 실행됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 여러 except 블록
    - 위에서부터 검사
    - 첫 일치만 실행
    - 다양한 에러 처리
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 여러 예외

    여러 종류의 에러를 각각 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    val = int('10')
    ans = val / 2
    except ValueError:
    ans = 'Invalid number'
    except ZeroDivisionError:
    ans = 'Cannot divide'

    ans
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0028():
        try:
            val = int('10')
            ans = val / 2
        except ValueError:
            ans = 'Invalid number'
        except ZeroDivisionError:
            ans = 'Cannot divide'

        return ans
    _snippet_0028()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플로 묶기

    여러 예외를 하나의 except로 처리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    data = int('5')
    output = data / 1
    except (ValueError, ZeroDivisionError):
    output = 'Error'

    output
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0030():
        try:
            data = int('5')
            output = data / 1
        except (ValueError, ZeroDivisionError):
            output = 'Error'

        return output
    _snippet_0030()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 순서 중요

    위에서부터 검사하므로 순서가 중요합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    nums = [1, 2, 3]
    elem = nums[1]
    except IndexError:
    elem = 'Index error'
    except:
    elem = 'Other error'

    elem
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0032():
        try:
            nums = [1, 2, 3]
            elem = nums[1]
        except IndexError:
            elem = 'Index error'
        except:
            elem = 'Other error'

        return elem
    _snippet_0032()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 구체적인 예외를 먼저, 일반적인 예외를 나중에 배치하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## finally 절

    *항상 실행되는 코드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    finally 블록은 예외 발생 여부와 관계없이 항상 실행됩니다. 파일 닫기, 리소스 해제 등 정리 작업에 사용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 항상 실행됨
    - 에러 상관없이
    - 정리 작업용
    - try-except-finally
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### finally 기본

    finally는 항상 실행됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    calc = 10 / 2
    except:
    calc = 0
    finally:
    status = 'Completed'

    calc, status
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0038():
        try:
            calc = 10 / 2
        except:
            calc = 0
        finally:
            status = 'Completed'

        return (calc, status)
    _snippet_0038()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 에러시에도 실행

    에러가 발생해도 finally는 실행됩니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    res = 10 / 0
    except ZeroDivisionError:
    res = 'Error'
    finally:
    msg = 'Done'

    res, msg
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0040():
        try:
            res = 10 / 0
        except ZeroDivisionError:
            res = 'Error'
        finally:
            msg = 'Done'

        return (res, msg)
    _snippet_0040()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리소스 정리

    파일 등의 리소스를 정리합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    opened = False
    try:
    f = open('test.txt', 'w')
    opened = True
    f.write('Data')
    except:
    content = 'Error'
    finally:
    if opened:
    f.close()
    content = 'Closed'

    content
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0042():
        opened = False
        try:
            f = open('test.txt', 'w')
            opened = True
            f.write('Data')
        except:
            content = 'Error'
        finally:
            if opened:
                f.close()
            content = 'Closed'

        return content
    _snippet_0042()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > with 문을 사용하면 finally 없이도 자동으로 정리됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## raise로 예외 발생

    *의도적으로 에러 발생*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    raise 키워드로 예외를 발생시킬 수 있습니다. 조건이 맞지 않을 때 강제로 에러를 내어 프로그램을 중단하거나 예외를 전달합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - raise 예외타입(메시지)
    - 의도적 에러 발생
    - 조건 검증
    - 예외 전달
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### ValueError 발생

    잘못된 값일 때 예외를 발생시킵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def checkAge(age):
    if age < 0:
    raise ValueError('Age cannot be negative')
    return age

    try:
    valid = checkAge(-5)
    except ValueError:
    valid = 'Invalid age'

    valid
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0048():
        def checkAge(age):
            if age < 0:
                raise ValueError('Age cannot be negative')
            return age

        try:
            valid = checkAge(-5)
        except ValueError:
            valid = 'Invalid age'

        return valid
    _snippet_0048()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건 검증

    조건을 만족하지 않으면 예외를 발생시킵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def divide(a, b):
    if b == 0:
    raise ZeroDivisionError('Divisor cannot be zero')
    return a / b

    try:
    quotient = divide(10, 0)
    except ZeroDivisionError:
    quotient = 'Error'

    quotient
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0050():
        def divide(a, b):
            if b == 0:
                raise ZeroDivisionError('Divisor cannot be zero')
            return a / b

        try:
            quotient = divide(10, 0)
        except ZeroDivisionError:
            quotient = 'Error'

        return quotient
    _snippet_0050()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 검사

    범위를 벗어나면 예외를 발생시킵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def setScore(score):
    if score < 0 or score > 100:
    raise ValueError('Score out of range')
    return score

    try:
    final = setScore(150)
    except ValueError:
    final = 0

    final
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0052():
        def setScore(score):
            if score < 0 or score > 100:
                raise ValueError('Score out of range')
            return score

        try:
            final = setScore(150)
        except ValueError:
            final = 0

        return final
    _snippet_0052()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > raise는 함수의 입력값 검증에 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 예외 정보

    *에러 메시지 받기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    except 예외타입 as 변수: 형식으로 예외 객체를 받을 수 있습니다. 예외 객체는 에러 메시지와 정보를 담고 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - except 타입 as 변수:
    - 예외 객체 받기
    - 에러 메시지 확인
    - 디버깅에 유용
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 예외 객체

    예외 객체에서 메시지를 가져옵니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    bad = 10 / 0
    except ZeroDivisionError as err:
    bad = str(err)

    bad
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0058():
        try:
            bad = 10 / 0
        except ZeroDivisionError as err:
            bad = str(err)

        return bad
    _snippet_0058()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 에러

    ValueError의 메시지를 확인합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    try:
    num = int('invalid')
    except ValueError as error:
    num = str(error)

    num
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0060():
        try:
            num = int('invalid')
        except ValueError as error:
            num = str(error)

        return num
    _snippet_0060()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수에서 사용

    함수에서 예외 정보를 반환합니다.

    **실행 전**: 코드에서 값, 이름, 기호를 하나씩 짚고 어떤 결과가 나올지 먼저 예상하세요.

    **실행 후**: 실제 결과가 어느 줄에서 만들어졌는지 한 문장으로 설명하세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ```python
    def safeConvert(text):
    try:
    return int(text)
    except ValueError as e:
    return str(e)

    safeConvert('abc')
    ```
    """)
    return

@app.cell(hide_code=True)
def _():
    def _snippet_0062():
        def safeConvert(text):
            try:
                return int(text)
            except ValueError as e:
                return str(e)

        return safeConvert('abc')
    _snippet_0062()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 예외 메시지를 확인하면 문제를 파악하기 쉽습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 20 종합 복습

    *예외 처리 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 20에서 배운 예외 처리를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로 어떤 순서로 해도 괜찮습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: try-except

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
    ### 연습: 🟢 기본2: 특정 예외

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
    ### 연습: 🟢 기본3: finally

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
    ### 연습: 🟢 기본4: raise

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
    ### 연습: 🟢 기본5: 예외 정보

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
    ### 연습: 🟡 응용1: 안전한 나눗셈

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
    ### 연습: 🟡 응용2: 리스트 접근

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
    ### 연습: 🟡 응용3: 파일 처리

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
    ### 연습: 🟡 응용4: 딕셔너리 키

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
    ### 연습: 🟡 응용5: 숫자 변환

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
    ### 연습: 🔴 심화1-1: 범위 검증

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
    ### 연습: 🔴 심화1-2: 나이 검증

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
    ### 연습: 🔴 심화2-1: 파일 읽기

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
    ### 연습: 🔴 심화2-2: 안전한 파일 쓰기

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
    ### 연습: 🔴 심화3-1: 계산기

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
    ### 연습: 🔴 심화3-2: 리스트 평균

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
    ### 연습: 🔴 심화4-1: 딕셔너리 병합

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
    ### 연습: 🔴 심화4-2: 안전한 접근

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
    ### 연습: 🔴 심화5-1: 재시도 로직

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
    ### 연습: 🔴 심화5-2: 종합 검증

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

    - try와 except의 실행 흐름을 설명할 수 있다.
    - finally가 언제 실행되는지 확인할 수 있다.
    - raise로 직접 예외를 발생시키는 이유를 말할 수 있다.

    ## 흔한 막힘

    - except를 너무 넓게 씀
    - 오류를 처리했다고 원인이 사라진 것으로 착각함
    - raise 뒤에 왜 실패했는지 설명하지 않음

    ## 마무리

    오늘 노트북에서 직접 작성한 연습 셀을 다시 훑어보세요. 설명을 보지 않고 같은 코드를 한 번 더 쓸 수 있으면 다음 Day로 넘어갑니다.
    """)
    return


if __name__ == "__main__":
    app.run()
