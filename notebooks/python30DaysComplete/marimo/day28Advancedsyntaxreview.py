import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 28. 고급 문법 종합")


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
    # Day 28. 고급 문법 종합

    이 노트북은 `study/python/30days/day28_고급문법종합.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - with 문으로 리소스 관리
    - 컨텍스트 매니저 프로토콜
    - 자동 정리 메커니즘
    - 커스텀 컨텍스트 매니저

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

    - 오늘 새로 배우는 개념: context_manager, with_statement, custom_context_manager
    - 이미 써도 되는 개념: everything
    - 오늘은 일부러 쓰지 않는 개념: external_library

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## with 문 기초

    *자동 리소스 관리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    with 문은 리소스를 자동으로 정리하는 파이썬의 강력한 기능입니다. 파일을 열고 닫거나, 데이터베이스 연결을 관리할 때 사용합니다. with 블록이 끝나면 자동으로 정리 작업이 수행되므로 close()를 직접 호출할 필요가 없습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - with 문: 자동 정리
    - 블록 종료시 자동 close
    - 예외 발생시에도 정리 보장
    - 코드 간결성 향상
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 with 문

    with를 사용하여 파일을 안전하게 처리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        content = ''
        with open('test.txt', 'w') as f:
            f.write('Hello World')
            content = 'written'
        return content
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### with 없이 사용

    수동으로 파일을 닫아야 합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        fileHandle = open('manual.txt', 'w')
        fileHandle.write('Manual close')
        fileHandle.close()
        return 'closed manually'
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### with와 읽기

    파일을 읽고 자동으로 닫습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0011():
        with open('test.txt', 'r') as reader:
            textData = reader.read()
        return textData
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > with 문을 사용하면 예외가 발생해도 리소스가 자동으로 정리됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 컨텍스트 매니저 프로토콜

    *__enter__와 __exit__*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    컨텍스트 매니저는 __enter__와 __exit__ 메서드를 구현한 객체입니다. __enter__는 with 블록 진입시 호출되고, __exit__는 블록 종료시 호출됩니다. __exit__는 예외 정보를 받아 처리할 수 있으며, True를 반환하면 예외를 억제합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __enter__: 진입시 호출
    - __exit__: 종료시 호출
    - 예외 정보 처리 가능
    - 자동 정리 보장
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 컨텍스트 매니저

    간단한 컨텍스트 매니저를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        class SimpleContext:
            def __enter__(self):
                return 'entered'

            def __exit__(self, excType, excVal, excTb):
                return False

        with SimpleContext() as sc:
            result = sc
        return result
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 상태 추적 컨텍스트

    진입과 종료를 추적합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        class StateTracker:
            def __init__(self):
                self.status = 'init'

            def __enter__(self):
                self.status = 'active'
                return self

            def __exit__(self, excType, excVal, excTb):
                self.status = 'closed'
                return False

        tracker = StateTracker()
        with tracker:
            pass
        return tracker.status
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 값 반환 컨텍스트

    __enter__에서 반환한 값을 사용합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0021():
        class ValueProvider:
            def __enter__(self):
                return [1, 2, 3, 4, 5]

            def __exit__(self, excType, excVal, excTb):
                return False

        with ValueProvider() as vals:
            total = sum(vals)
        return total
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __exit__의 세 매개변수는 예외 타입, 예외 값, 트레이스백입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 리소스 관리

    *파일과 연결 관리*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    컨텍스트 매니저의 주요 용도는 리소스 관리입니다. 파일, 네트워크 연결, 데이터베이스 커넥션 등 사용 후 반드시 정리해야 하는 리소스를 안전하게 처리합니다. with 문을 사용하면 예외 발생 여부와 관계없이 리소스가 정리됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 파일 자동 닫기
    - 연결 자동 종료
    - 예외 안전성
    - 메모리 누수 방지
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 파일 컨텍스트

    파일을 안전하게 읽고 씁니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        class FileManager:
            def __init__(self, filename, mode):
                self.filename = filename
                self.mode = mode
                self.fileObj = None

            def __enter__(self):
                self.fileObj = open(self.filename, self.mode)
                return self.fileObj

            def __exit__(self, excType, excVal, excTb):
                if self.fileObj:
                    self.fileObj.close()
                return False

        with FileManager('resource.txt', 'w') as fm:
            fm.write('Resource managed')
        return 'completed'
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연결 컨텍스트

    연결을 자동으로 정리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        class Connection:
            def __init__(self, host):
                self.host = host
                self.connected = False

            def __enter__(self):
                self.connected = True
                return self

            def __exit__(self, excType, excVal, excTb):
                self.connected = False
                return False

        conn = Connection('localhost')
        with conn:
            status = conn.connected
        return (conn.connected, status)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리소스 카운터

    리소스 사용을 추적합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        class ResourceCounter:
            count = 0

            def __enter__(self):
                ResourceCounter.count = ResourceCounter.count + 1
                return ResourceCounter.count

            def __exit__(self, excType, excVal, excTb):
                ResourceCounter.count = ResourceCounter.count - 1
                return False

        with ResourceCounter() as rc1:
            with ResourceCounter() as rc2:
                peak = ResourceCounter.count
        return (ResourceCounter.count, peak)
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > with 블록이 중첩되면 안쪽 블록부터 바깥쪽 순서로 __exit__가 호출됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 예외 처리

    *컨텍스트 매니저와 예외*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    컨텍스트 매니저는 예외 처리에 강력합니다. __exit__ 메서드는 예외 정보를 받아 처리할 수 있으며, True를 반환하면 예외를 억제합니다. 이를 통해 정리 작업은 수행하되 예외 전파를 제어할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 예외 정보 수신
    - 예외 억제 가능
    - 정리 작업 보장
    - 예외 전파 제어
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 예외 억제

    예외를 잡아서 억제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0037():
        class ExceptionSuppressor:
            def __enter__(self):
                return self

            def __exit__(self, excType, excVal, excTb):
                if excType is ZeroDivisionError:
                    return True
                return False

        outcome = 'no error'
        with ExceptionSuppressor():
            outcome = 10 / 0
        return outcome
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 예외 로깅

    예외 정보를 기록하고 전파합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        class ExceptionLogger:
            def __init__(self):
                self.errors = []

            def __enter__(self):
                return self

            def __exit__(self, excType, excVal, excTb):
                if excType:
                    self.errors.append(str(excType.__name__))
                return False

        logger = ExceptionLogger()
        try:
            with logger:
                raise ValueError('test error')
        except ValueError:
            pass
        return logger.errors
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 억제

    특정 예외만 억제합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
        class SelectiveSuppressor:
            def __init__(self, suppress):
                self.suppress = suppress

            def __enter__(self):
                return self

            def __exit__(self, excType, excVal, excTb):
                return excType in self.suppress

        msg = 'success'
        with SelectiveSuppressor([TypeError]):
            msg = 'error' + 5
        return msg
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > __exit__가 True를 반환하면 예외가 억제되고, False나 None을 반환하면 예외가 전파됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 다중 컨텍스트

    *여러 컨텍스트 매니저 사용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    하나의 with 문에서 여러 컨텍스트 매니저를 사용할 수 있습니다. 콤마로 구분하여 나열하며, 왼쪽부터 오른쪽 순서로 __enter__가 호출되고, 오른쪽부터 왼쪽 순서로 __exit__가 호출됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 여러 리소스 동시 관리
    - 콤마로 구분
    - 진입: 왼쪽→오른쪽
    - 종료: 오른쪽→왼쪽
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 다중 파일

    여러 파일을 동시에 관리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        with open('source.txt', 'w') as src, open('dest.txt', 'w') as dst:
            src.write('source')
            dst.write('destination')
            combined = 'both written'
        return combined
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 순서 추적

    진입과 종료 순서를 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        class OrderTracker:
            def __init__(self, name):
                self.name = name

            def __enter__(self):
                return self.name

            def __exit__(self, excType, excVal, excTb):
                return False

        with OrderTracker('first') as f, OrderTracker('second') as s:
            order = f, s
        return order
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리소스 체인

    여러 리소스를 체인으로 연결합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        class ChainResource:
            def __init__(self, value):
                self.value = value

            def __enter__(self):
                return self.value

            def __exit__(self, excType, excVal, excTb):
                return False

        with ChainResource(10) as a, ChainResource(20) as b, ChainResource(30) as c:
            sumTotal = a + b + c
        return sumTotal
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 다중 컨텍스트는 with a, b, c: 형태로 작성하며, 중첩 with와 동일하게 동작합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실전 패턴

    *컨텍스트 매니저 활용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    컨텍스트 매니저는 실무에서 다양하게 활용됩니다. 타이머, 디렉토리 변경, 설정 임시 변경, 트랜잭션 관리 등 시작과 종료가 명확한 작업에 유용합니다. 코드의 안전성과 가독성을 동시에 향상시킵니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 타이머 측정
    - 임시 상태 변경
    - 트랜잭션 관리
    - 코드 블록 래핑
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 타이머 컨텍스트

    코드 실행 시간을 측정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        import time

        class Timer:
            def __enter__(self):
                self.start = time.time()
                return self

            def __exit__(self, excType, excVal, excTb):
                self.elapsed = time.time() - self.start
                return False

        timer = Timer()
        with timer:
            total = sum(range(1000))
        return timer.elapsed > 0
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 상태 백업

    상태를 임시로 변경하고 복원합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        class StateBackup:
            def __init__(self, obj, attr, newVal):
                self.obj = obj
                self.attr = attr
                self.newVal = newVal
                self.oldVal = None

            def __enter__(self):
                self.oldVal = getattr(self.obj, self.attr)
                setattr(self.obj, self.attr, self.newVal)
                return self

            def __exit__(self, excType, excVal, excTb):
                setattr(self.obj, self.attr, self.oldVal)
                return False

        class Config:
            debug = False

        cfg = Config()
        with StateBackup(cfg, 'debug', True):
            insideVal = cfg.debug
        return (cfg.debug, insideVal)
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 보호

    리스트를 임시로 사용하고 복원합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0061():
        class ListGuard:
            def __init__(self, lst):
                self.lst = lst
                self.backup = None

            def __enter__(self):
                self.backup = self.lst[:]
                return self.lst

            def __exit__(self, excType, excVal, excTb):
                self.lst[:] = self.backup
                return False

        myList = [1, 2, 3]
        with ListGuard(myList) as ml:
            ml.append(4)
            ml.append(5)
            modified = len(ml)
        return (len(myList), modified)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 컨텍스트 매니저는 '설정-작업-복원' 패턴에 이상적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 28 종합 복습

    *컨텍스트 매니저 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 28에서 배운 컨텍스트 매니저를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 간단한 with

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 기본 컨텍스트

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 상태 변경

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 값 반환

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 리스트 제공

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 카운터 컨텍스트

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 예외 억제

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 다중 컨텍스트

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 속성 추적

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 조건부 실행

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 중첩 카운터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 리소스 풀

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 예외 분류

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 값 누적

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 상태 머신

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화6: 시간 제한

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화7: 조건부 롤백

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화8: 멀티 상태

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화9: 체인 컨텍스트

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화10: 컨텍스트 팩토리

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
