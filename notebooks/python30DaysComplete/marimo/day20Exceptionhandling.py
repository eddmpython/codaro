import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 20. 예외처리")


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
    # Day 20. 예외처리

    이 노트북은 `study/python/30days/day20_예외처리.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

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

    - 오늘 새로 배우는 개념: try, except, finally, raise, exception_type
    - 이미 써도 되는 개념: function_all, import, file_io
    - 오늘은 일부러 쓰지 않는 개념: class, custom_exception

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
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
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        try:
            result = 10 / 0
        except:
            result = 'Error occurred'

        return result
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 정상 실행

    에러가 없으면 except는 실행되지 않습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        try:
            value = 10 / 2
        except:
            value = 'Error'

        return value
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수에서 사용

    함수 안에서도 예외를 처리할 수 있습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0011():
        def safeDivide(a, b):
            try:
                return a / b
            except:
                return 0

        return safeDivide(10, 0)
    _snippet_0011()
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
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        try:
            num = 10 / 0
        except ZeroDivisionError:
            num = 'Cannot divide by zero'

        return num
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### ValueError

    잘못된 값 변환 에러를 처리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        try:
            converted = int('abc')
        except ValueError:
            converted = 0

        return converted
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### IndexError

    인덱스 범위 에러를 처리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0021():
        try:
            items = [1, 2, 3]
            item = items[10]
        except IndexError:
            item = 'Index out of range'

        return item
    _snippet_0021()
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
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        try:
            val = int('10')
            ans = val / 2
        except ValueError:
            ans = 'Invalid number'
        except ZeroDivisionError:
            ans = 'Cannot divide'

        return ans
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 튜플로 묶기

    여러 예외를 하나의 except로 처리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        try:
            data = int('5')
            output = data / 1
        except (ValueError, ZeroDivisionError):
            output = 'Error'

        return output
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 순서 중요

    위에서부터 검사하므로 순서가 중요합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        try:
            nums = [1, 2, 3]
            elem = nums[1]
        except IndexError:
            elem = 'Index error'
        except:
            elem = 'Other error'

        return elem
    _snippet_0031()
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
    """)
    return

@app.cell
def _():
    def _snippet_0037():
        try:
            calc = 10 / 2
        except:
            calc = 0
        finally:
            status = 'Completed'

        return (calc, status)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 에러시에도 실행

    에러가 발생해도 finally는 실행됩니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        try:
            res = 10 / 0
        except ZeroDivisionError:
            res = 'Error'
        finally:
            msg = 'Done'

        return (res, msg)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리소스 정리

    파일 등의 리소스를 정리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
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
    _snippet_0041()
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
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        def checkAge(age):
            if age < 0:
                raise ValueError('Age cannot be negative')
            return age

        try:
            valid = checkAge(-5)
        except ValueError:
            valid = 'Invalid age'

        return valid
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건 검증

    조건을 만족하지 않으면 예외를 발생시킵니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        def divide(a, b):
            if b == 0:
                raise ZeroDivisionError('Divisor cannot be zero')
            return a / b

        try:
            quotient = divide(10, 0)
        except ZeroDivisionError:
            quotient = 'Error'

        return quotient
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 검사

    범위를 벗어나면 예외를 발생시킵니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        def setScore(score):
            if score < 0 or score > 100:
                raise ValueError('Score out of range')
            return score

        try:
            final = setScore(150)
        except ValueError:
            final = 0

        return final
    _snippet_0051()
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
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        try:
            bad = 10 / 0
        except ZeroDivisionError as err:
            bad = str(err)

        return bad
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 에러

    ValueError의 메시지를 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        try:
            num = int('invalid')
        except ValueError as error:
            num = str(error)

        return num
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 함수에서 사용

    함수에서 예외 정보를 반환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0061():
        def safeConvert(text):
            try:
                return int(text)
            except ValueError as e:
                return str(e)

        return safeConvert('abc')
    _snippet_0061()
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

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 특정 예외

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: finally

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: raise

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 예외 정보

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 안전한 나눗셈

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 리스트 접근

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 파일 처리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 딕셔너리 키

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 숫자 변환

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-1: 범위 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1-2: 나이 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-1: 파일 읽기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2-2: 안전한 파일 쓰기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-1: 계산기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3-2: 리스트 평균

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-1: 딕셔너리 병합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4-2: 안전한 접근

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-1: 재시도 로직

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5-2: 종합 검증

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
