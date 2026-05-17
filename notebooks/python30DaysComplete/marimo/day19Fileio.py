import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 19. 파일 입출력")


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
    # Day 19. 파일 입출력
    
    **오늘의 초점**: 텍스트 파일을 만들고 읽고 안전하게 닫는 패턴을 익힌다.
    
    **완성 기준**: `with open(...)`과 `pathlib.Path`로 작은 텍스트/JSON 파일을 다룰 수 있다.
    
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
    
    - open
    - with
    - read
    - write
    - 파일 모드
    - pathlib
    - JSON 저장
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 왜 배우는가
    
    프로그램이 끝나도 남아야 하는 데이터는 파일에 저장해야 한다. 파일 입출력을 알면 실행 결과를 기록하고 다음 실행에서 다시 불러올 수 있다.
    
    ## 생각 모델
    
    `with`는 파일을 열고 작업이 끝나면 자동으로 닫는 안전한 작업 구역이다. 열기 모드가 읽기인지 쓰기인지에 따라 가능한 동작이 달라진다.
    
    ## 자주 하는 실수
    
    - 파일 모드를 잘못 고르기
    - 인코딩을 생략해 한글이 깨지기
    - 파일을 닫기 전에 읽거나 다른 작업을 섞기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 0. 진단 질문
    
    아래 질문은 점수를 매기기 위한 것이 아니라, 오늘 어디를 집중해야 하는지 찾기 위한 진단입니다. 답이 흐릿하면 해당 부분을 천천히 실행 추적하세요.
    
    1. `open`를 한 문장으로 설명할 수 있는가?
    2. `with`를 잘못 쓰면 어떤 결과나 에러가 날 수 있는가?
    3. 오늘 미니 프로젝트에서 어떤 값이 입력이고 어떤 값이 결과인가?
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 시작 전 회상
    
    새 문법을 보기 전에 이전 내용을 먼저 꺼내야 장기 기억으로 넘어갑니다. 아래 질문은 실행하지 않고 말이나 메모로 답합니다.
    
    - Day 18: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    - Day 16: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    - Day 12: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다.
    
    답이 바로 떠오르지 않으면 해당 Day의 예측 문제만 다시 실행하고 돌아오세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 오늘의 통과 기준
    
    이 Day는 새 개념 하나를 익히는 날입니다. 아래 기준을 만족하면 다음 Day로 넘어갑니다.
    
    - 예측 문제를 실행 전에 답했다.
    - 빈칸 문제의 `assert`가 통과했다.
    - 버그 수정 문제의 원인을 한 문장으로 설명했다.
    - 전이 연습을 정답 없이 한 번 해결했다.
    - 미니 프로젝트를 자기 데이터로 변형했다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 개념 경계
    
    오늘의 핵심 범위는 `open`, `with`, `read`, `write`, `파일 모드`, `pathlib`, `JSON 저장`입니다. 범위를 좁게 잡는 이유는 하나의 노트북에서 너무 많은 문법을 섞으면 실패 원인을 찾기 어려워지기 때문입니다.
    
    **오늘 집중할 것**
    
    - 값을 어떻게 만들고 확인하는가
    - 결과가 예상과 다를 때 어느 줄을 먼저 볼 것인가
    - 같은 문법을 다른 데이터에 적용할 수 있는가
    
    **오늘 피할 실수**
    
    - 파일 모드를 잘못 고르기
    - 인코딩을 생략해 한글이 깨지기
    - 파일을 닫기 전에 읽거나 다른 작업을 섞기
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 실행 추적
    
    오늘 핵심 개념은 `파일 입출력`입니다. 예제 셀을 실행하기 전에 아래 순서로 머릿속 실행을 해봅니다.
    
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
    | 1 | `from pathlib import Path` | 이미 만들어진 도구를 현재 노트북으로 가져옵니다. |
    | 2 | ` ` | 읽기 좋게 구획을 나누는 빈 줄입니다. |
    | 3 | `notePath = Path("studyNote.txt")` | 계산 결과나 데이터를 이름에 연결합니다. |
    | 4 | `notePath.write_text("Python file practice", encoding="utf-8")` | 계산 결과나 데이터를 이름에 연결합니다. |
    | 5 | `notePath.read_text(encoding="utf-8")` | 계산 결과나 데이터를 이름에 연결합니다. |
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
from pathlib import Path

notePath = Path("studyNote.txt")
notePath.write_text("Python file practice", encoding="utf-8")
notePath.read_text(encoding="utf-8")
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 2. 예측 → 검증
    
    `write_text` 후 같은 경로에서 `read_text`를 하면 무엇이 나올지 예측하세요.
    
    실행 전에 예상 결과를 노트에 적어두세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
from pathlib import Path

path = Path("hello.txt")
path.write_text("hello", encoding="utf-8")
path.read_text(encoding="utf-8")
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>예상 결과 확인</summary>
    
    ```python
    'hello'
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 3. 빈칸 채우기
    
    `daily.txt` 파일에 `Day 19 complete`를 저장하고 다시 읽으세요.
    
    `...` 또는 불완전한 부분을 고친 뒤 셀을 실행하세요. `assert`가 조용히 지나가면 통과입니다.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
from pathlib import Path

dailyPath = Path("daily.txt")
...
content = dailyPath.read_text(encoding="utf-8")
assert content == "Day 19 complete"
content
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
    from pathlib import Path
    
    dailyPath = Path("daily.txt")
    dailyPath.write_text("Day 19 complete", encoding="utf-8")
    content = dailyPath.read_text(encoding="utf-8")
    assert content == "Day 19 complete"
    content
    ```
    
    </details>
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 4. 버그 수정
    
    아래 코드는 쓰기 모드로 열어놓고 읽으려고 합니다. 쓰기와 읽기를 분리하세요.
    
    실패하는 코드를 그냥 지우지 말고, 왜 실패하는지 한 문장으로 설명한 뒤 고치세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
with open("modeTest.txt", "w", encoding="utf-8") as file:
    file.write("mode")
    content = file.read()
content
"""
    )
    return

@app.cell
def _(mo):
    mo.md(r"""
    <details>
    <summary>수정 예시</summary>
    
    ```python
    with open("modeTest.txt", "w", encoding="utf-8") as file:
        file.write("mode")
    
    with open("modeTest.txt", "r", encoding="utf-8") as file:
        content = file.read()
    content
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
    
    텍스트 파일에 두 줄을 저장하고 다시 읽어 줄 수를 확인하세요.
    
    같은 개념을 다른 데이터와 다른 변수명으로 다시 쓰는 단계입니다. 여기서 막히면 핵심 예제로 돌아가서 코드 모양만 다시 보고 옵니다.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
from pathlib import Path

path = Path("lines.txt")
path.write_text(..., encoding="utf-8")
lines = path.read_text(encoding="utf-8").splitlines()
assert len(lines) == 2
lines
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
    from pathlib import Path
    
    path = Path("lines.txt")
    path.write_text("first\nsecond", encoding="utf-8")
    lines = path.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    lines
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
    ('빈칸', 'dailyPath.read_text(encoding="utf-8") == "Day 19 complete"'),
    ('버그 수정', 'content == "mode"'),
    ('전이', 'len(lines) == 2')
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
    
    **랩 목표**: 학습 기록 딕셔너리를 JSON 파일로 저장하고 다시 읽어오세요.
    
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
    
    학습 기록 딕셔너리를 JSON 파일로 저장하고 다시 읽어오세요.
    
    아래 코드는 시작점입니다. 실행 후 값을 바꿔보고, 마지막 줄의 결과가 어떻게 달라지는지 확인하세요.
    """)
    return

@app.cell
def _(runCell):
    runCell(
        r"""
from pathlib import Path
import json

record = {"day": 19, "topic": "file IO", "done": True}
recordPath = Path("record.json")
recordPath.write_text(json.dumps(record, ensure_ascii=False), encoding="utf-8")
loaded = json.loads(recordPath.read_text(encoding="utf-8"))
loaded
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
from pathlib import Path

logPath = Path("studyLog.txt")
logPath.write_text("Day 19 file practice", encoding="utf-8")
logPath.read_text(encoding="utf-8")
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
dayNumber = 19
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
    
    **변형 과제**: `indent=2` 옵션을 넣어 JSON 파일을 사람이 읽기 좋게 저장해보세요.
    
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
    2. **변형**: 전이 연습 `텍스트 파일에 두 줄을 저장하고 다시 읽어 줄 수를 확인하세요.`에서 숫자나 문자열을 하나 바꾸고 `assert`도 함께 고칩니다.
    3. **역문제**: 결과값을 먼저 정하고, 그 결과가 나오도록 입력 데이터를 설계합니다.
    4. **오류 만들기**: 오늘의 자주 하는 실수 중 하나를 일부러 만들고, 에러 이름이나 잘못된 결과를 기록합니다.
    5. **설명하기**: open, with, read 중 하나를 비전공자에게 설명하는 3문장 메모를 씁니다.
    6. **연결하기**: 누적 프로젝트 셀에 오늘 배운 문법을 한 줄 더 추가합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 종료 티켓
    
    다음 세 문장을 직접 완성해야 오늘 학습을 끝낸 것으로 봅니다.
    
    - 오늘 내가 배운 핵심은 `파일 입출력`이고, 한 문장으로 말하면:
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
