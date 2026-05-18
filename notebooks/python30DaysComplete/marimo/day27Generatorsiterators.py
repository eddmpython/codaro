import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 27. 제너레이터와 이터레이터")


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
    # Day 27. 제너레이터와 이터레이터

    이 노트북은 `study/python/30days/day27_제너레이터와이터레이터.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - yield로 제너레이터 생성
    - 메모리 효율적인 순회
    - iter()와 next() 활용
    - 이터레이터 프로토콜 구현

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

    - 오늘 새로 배우는 개념: yield, generator, iter, next, iterator_protocol
    - 이미 써도 되는 개념: function_all, class_all, comprehension
    - 오늘은 일부러 쓰지 않는 개념: external_library

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 제너레이터 기초

    *yield 키워드*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    제너레이터는 yield 키워드를 사용하여 값을 하나씩 생성하는 함수입니다. return과 달리 yield는 함수 실행을 일시 중지하고 값을 반환한 후, 다음 호출 시 중지된 지점부터 계속 실행됩니다. 모든 값을 메모리에 저장하지 않고 필요할 때마다 생성하므로 매우 효율적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - yield: 값을 하나씩 생성
    - 함수 실행 일시 중지
    - 메모리 효율적
    - 필요할 때 값 생성
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 제너레이터

    yield로 숫자를 하나씩 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        def simpleGen():
            yield 1
            yield 2
            yield 3

        gen = simpleGen()
        return (next(gen), next(gen), next(gen))
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 제너레이터

    특정 범위의 숫자를 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        def rangeGen(n):
            i = 0
            while i < n:
                yield i
                i = i + 1

        g = rangeGen(5)
        return list(g)
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 제너레이터 순회

    for 루프로 제너레이터를 순회합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0011():
        def countdown(n):
            while n > 0:
                yield n
                n = n - 1

        output = []
        for val in countdown(5):
            output.append(val)
        return output
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 제너레이터는 한 번만 순회할 수 있습니다. 다시 순회하려면 새로 생성해야 합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 제너레이터 표현식

    *간결한 제너레이터 생성*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    제너레이터 표현식은 리스트 컴프리헨션과 비슷하지만 괄호를 사용합니다. (표현식 for 변수 in 시퀀스) 형태로 작성하며, 리스트를 만들지 않고 제너레이터를 반환합니다. 대량의 데이터를 처리할 때 메모리를 절약할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - (표현식 for 변수 in 시퀀스) 형식
    - 괄호 사용
    - 리스트 대신 제너레이터
    - 메모리 절약
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 제너레이터 표현식

    제곱수를 생성하는 제너레이터를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        squares = (x ** 2 for x in range(5))
        return list(squares)
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 제너레이터

    조건을 만족하는 값만 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        evens = (n for n in range(10) if n % 2 == 0)
        return list(evens)
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 제너레이터

    문자열을 대문자로 변환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0021():
        words = ['hello', 'world', 'python']
        upper = (w.upper() for w in words)
        return list(upper)
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 제너레이터 표현식은 sum(), max(), min() 같은 함수에 바로 전달할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 이터레이터 기초

    *iter()와 next()*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    이터레이터는 순회 가능한 객체입니다. iter() 함수로 이터레이터를 생성하고, next() 함수로 다음 값을 가져옵니다. 리스트, 튜플, 문자열 등 모든 시퀀스는 iter()로 이터레이터를 만들 수 있으며, 더 이상 값이 없으면 StopIteration 예외가 발생합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - iter(): 이터레이터 생성
    - next(): 다음 값 가져오기
    - StopIteration: 종료 신호
    - 모든 시퀀스 지원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 리스트 이터레이터

    리스트를 이터레이터로 변환합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        nums = [1, 2, 3]
        it = iter(nums)
        return (next(it), next(it), next(it))
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문자열 이터레이터

    문자열을 한 글자씩 순회합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        text = 'abc'
        textIter = iter(text)
        return (next(textIter), next(textIter))
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 수동 순회

    while과 next로 수동으로 순회합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        items = [10, 20, 30]
        iterator = iter(items)
        collected = []
        try:
            while True:
                collected.append(next(iterator))
        except StopIteration:
            pass
        return collected
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > for 루프는 내부적으로 iter()와 next()를 사용하여 순회합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 이터레이터 프로토콜

    *__iter__와 __next__ 구현*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    이터레이터 프로토콜은 __iter__와 __next__ 메서드를 구현하여 객체를 순회 가능하게 만드는 규약입니다. __iter__는 self를 반환하고, __next__는 다음 값을 반환하거나 StopIteration을 발생시킵니다. 이를 통해 사용자 정의 객체를 for 루프에서 사용할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - __iter__: self 반환
    - __next__: 다음 값 반환
    - StopIteration 발생
    - for 루프 지원
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 기본 이터레이터 클래스

    숫자를 순회하는 이터레이터를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0037():
        class Counter:
            def __init__(self, max):
                self.max = max
                self.current = 0

            def __iter__(self):
                return self

            def __next__(self):
                if self.current < self.max:
                    self.current = self.current + 1
                    return self.current
                raise StopIteration

        c = Counter(3)
        return list(c)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 이터레이터

    시작과 끝을 지정하는 이터레이터를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        class Range:
            def __init__(self, start, end):
                self.current = start
                self.end = end

            def __iter__(self):
                return self

            def __next__(self):
                if self.current < self.end:
                    val = self.current
                    self.current = self.current + 1
                    return val
                raise StopIteration

        r = Range(5, 10)
        return list(r)
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 무한 이터레이터

    무한히 값을 생성하는 이터레이터를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
        class Infinite:
            def __init__(self):
                self.num = 0

            def __iter__(self):
                return self

            def __next__(self):
                self.num = self.num + 1
                return self.num

        inf = Infinite()
        values = []
        for val in inf:
            values.append(val)
            if val >= 5:
                break
        return values
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 제너레이터는 이터레이터 프로토콜을 자동으로 구현합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 고급 제너레이터

    *실전 활용 패턴*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    제너레이터는 파일 읽기, 무한 시퀀스 생성, 파이프라인 처리 등 다양한 실전 상황에서 활용됩니다. 메모리를 효율적으로 사용하면서도 코드를 간결하게 유지할 수 있어 대용량 데이터 처리에 매우 유용합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 파일 처리
    - 무한 시퀀스
    - 데이터 파이프라인
    - 메모리 효율성
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 피보나치 제너레이터

    피보나치 수열을 무한히 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        def fibonacci():
            a = 0
            b = 1
            while True:
                yield a
                a, b = b, a + b

        fib = fibonacci()
        sequence = []
        for i in range(10):
            sequence.append(next(fib))
        return sequence
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 필터링 제너레이터

    조건에 맞는 값만 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        def filterPositive(numbers):
            for n in numbers:
                if n > 0:
                    yield n

        dataset = [-2, -1, 0, 1, 2, 3]
        filtered = filterPositive(dataset)
        return list(filtered)
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 변환 제너레이터

    값을 변환하여 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        def doubleValues(nums):
            for n in nums:
                yield n * 2

        source = [1, 2, 3, 4, 5]
        doubled = doubleValues(source)
        return list(doubled)
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 여러 제너레이터를 연결하여 데이터 파이프라인을 만들 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실전 패턴

    *제너레이터와 이터레이터 활용*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    제너레이터와 이터레이터는 실무에서 대용량 파일 처리, 배치 처리, 스트리밍 데이터 처리 등에 활용됩니다. 메모리를 절약하면서도 깔끔한 코드를 작성할 수 있어 파이썬의 강력한 기능 중 하나입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 배치 처리
    - 청크 단위 읽기
    - 파이프라인 구성
    - 메모리 최적화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 배치 제너레이터

    데이터를 일정 크기로 묶어 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        def batchGen(elements, size):
            chunk = []
            for item in elements:
                chunk.append(item)
                if len(chunk) == size:
                    yield chunk
                    chunk = []
            if chunk:
                yield chunk

        collection = [1, 2, 3, 4, 5, 6, 7]
        batches = list(batchGen(collection, 3))
        return batches
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 체인 제너레이터

    여러 제너레이터를 연결합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        def square(values):
            for n in values:
                yield n ** 2

        def addTen(integers):
            for n in integers:
                yield n + 10

        original = [1, 2, 3, 4, 5]
        pipeline = addTen(square(original))
        return list(pipeline)
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 조건부 생성

    여러 조건을 조합하여 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0061():
        def complexFilter(entries):
            for item in entries:
                if item > 0 and item % 2 == 0:
                    yield item * 3

        integers = [-2, -1, 0, 1, 2, 3, 4, 5, 6]
        outcomes = list(complexFilter(integers))
        return outcomes
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 제너레이터는 필요한 만큼만 값을 생성하므로 대용량 데이터 처리에 이상적입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 27 종합 복습

    *제너레이터와 이터레이터 마스터하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    Day 27에서 배운 제너레이터와 이터레이터를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 간단한 제너레이터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 범위 생성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 제너레이터 표현식

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: iter와 next

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 문자열 이터레이터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 조건부 제너레이터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 제너레이터 표현식 필터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 변환 제너레이터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 이터레이터 클래스

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 무한 카운터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: 피보나치 N개

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 제곱수 필터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 배치 생성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 파이프라인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 복합 필터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화6: 커스텀 범위

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화7: 누적 합계

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화8: 윈도우 생성

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화9: 조건부 변환

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화10: 중첩 제너레이터

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
