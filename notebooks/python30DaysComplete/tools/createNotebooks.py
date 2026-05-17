from __future__ import annotations

import csv
import json
from pathlib import Path
from textwrap import dedent


ROOT = Path(__file__).resolve().parents[1]
COLAB_DIR = ROOT / "colab"
MARIMO_DIR = ROOT / "marimo"
REVIEW_RANGES = [(1, 5), (6, 10), (11, 15), (16, 20), (21, 25), (26, 30)]
REPOSITORY = "eddmpython/codaro"
BRANCH = "main"
COURSE_PATH = "notebooks/python30DaysComplete"


DAY_CONTENT = [
    {
        "day": 1,
        "slug": "helloWorld",
        "title": "Hello World와 실행 감각",
        "focus": "코드를 셀 단위로 실행하고 결과를 관찰하는 기본 습관을 만든다.",
        "outcome": "문자열, 숫자, 간단한 표현식을 실행하고 결과가 어디에 나타나는지 설명할 수 있다.",
        "why": "첫날의 목표는 문법을 많이 외우는 것이 아니라 실행 감각을 얻는 것이다. 파이썬은 한 줄씩 실행해도 바로 결과를 확인할 수 있으므로, 작은 실험을 자주 하는 사람이 빠르게 는다.",
        "mentalModel": "코드 셀은 작은 실험실이다. 한 셀에는 하나의 생각만 담고, 실행 결과를 보고 다음 셀에서 생각을 조금 바꿔본다.",
        "concepts": ["코드 셀 실행", "문자열 리터럴", "숫자 표현식", "결과 관찰"],
        "exampleCode": """\
message = "Hello, Python"
message
""",
        "predictPrompt": "`2 + 3 * 4`의 결과를 먼저 적어본 뒤 실행하세요. 곱셈이 덧셈보다 먼저 계산됩니다.",
        "predictCode": """\
2 + 3 * 4
""",
        "predictAnswer": "14",
        "exercisePrompt": "`answer`가 `Hello, Codaro`가 되도록 `...` 부분을 바꾸세요.",
        "exerciseCode": """\
answer = ...
assert answer == "Hello, Codaro"
answer
""",
        "solutionCode": """\
answer = "Hello, Codaro"
assert answer == "Hello, Codaro"
answer
""",
        "bugPrompt": "아래 코드는 문자열 따옴표가 빠져서 실패합니다. 값을 문자열로 고쳐 실행하세요.",
        "bugCode": """\
greeting = Hello
greeting
""",
        "bugFixCode": """\
greeting = "Hello"
greeting
""",
        "projectPrompt": "오늘의 작은 결과물은 자기소개 한 줄입니다. 이름, 오늘 배운 것, 내일 목표를 각각 변수에 담고 하나의 문장으로 합치세요.",
        "projectCode": """\
name = "Mina"
today = "running code cells"
tomorrow = "variables"
summary = f"{name} practiced {today}; tomorrow: {tomorrow}."
summary
""",
        "challenge": "문장의 마침표를 느낌표로 바꾸고 다시 실행해보세요.",
        "commonMistakes": ["문자열 따옴표를 빼먹기", "실행하지 않은 셀의 결과를 기대하기", "한 셀에 너무 많은 실험을 넣기"],
    },
    {
        "day": 2,
        "slug": "variablesTypes",
        "title": "변수와 데이터 타입",
        "focus": "값에 이름을 붙이고 타입을 확인하는 법을 익힌다.",
        "outcome": "int, float, str, bool 값을 구분하고 `type()`과 `len()`으로 기본 정보를 확인할 수 있다.",
        "why": "프로그램은 값을 다루고, 변수는 그 값에 붙이는 이름이다. 이름이 명확하면 코드를 읽는 사람이 데이터의 의미를 바로 이해할 수 있다.",
        "mentalModel": "변수는 상자가 아니라 이름표에 가깝다. 같은 값에도 여러 이름표를 붙일 수 있고, 같은 이름표를 다른 값에 다시 붙일 수도 있다.",
        "concepts": ["변수 대입", "정수와 실수", "문자열", "불리언", "타입 확인"],
        "exampleCode": """\
studentName = "Jin"
studentAge = 17
hasLaptop = True
type(studentName), type(studentAge), type(hasLaptop)
""",
        "predictPrompt": "`len('Python')`의 결과를 예측하세요. 공백이나 따옴표는 길이에 포함되지 않습니다.",
        "predictCode": """\
len("Python")
""",
        "predictAnswer": "6",
        "exercisePrompt": "상품 가격과 수량으로 `totalPrice`를 계산하세요.",
        "exerciseCode": """\
itemPrice = 12000
itemCount = 3
totalPrice = ...
assert totalPrice == 36000
totalPrice
""",
        "solutionCode": """\
itemPrice = 12000
itemCount = 3
totalPrice = itemPrice * itemCount
assert totalPrice == 36000
totalPrice
""",
        "bugPrompt": "아래 코드는 숫자 문자열과 정수를 바로 더하려고 해서 실패합니다. 문자열을 정수로 바꾸세요.",
        "bugCode": """\
rawCount = "5"
nextCount = rawCount + 1
nextCount
""",
        "bugFixCode": """\
rawCount = "5"
nextCount = int(rawCount) + 1
nextCount
""",
        "projectPrompt": "간단한 영수증 데이터를 변수로 만들고, 최종 결제 금액을 계산하세요.",
        "projectCode": """\
coffeePrice = 4500
cakePrice = 6200
coupon = 1000
payment = coffeePrice + cakePrice - coupon
payment
""",
        "challenge": "`payment`가 10000 이상인지 `isBigOrder` 변수에 저장해보세요.",
        "commonMistakes": ["숫자처럼 보이는 문자열을 숫자로 착각하기", "변수명에 띄어쓰기 넣기", "타입을 확인하지 않고 연산하기"],
    },
    {
        "day": 3,
        "slug": "operators",
        "title": "연산자",
        "focus": "산술, 비교, 논리 연산자를 조합해 조건을 표현한다.",
        "outcome": "계산 결과뿐 아니라 `True`/`False`로 나오는 판단식을 만들 수 있다.",
        "why": "연산자는 프로그램의 판단 언어다. 숫자를 계산하고, 값이 조건을 만족하는지 비교하고, 여러 조건을 하나로 묶는다.",
        "mentalModel": "연산식은 질문이다. `price > 10000`은 가격이 큰지 묻는 질문이고, 파이썬은 그 답으로 `True` 또는 `False`를 준다.",
        "concepts": ["산술 연산", "나머지", "비교 연산", "논리 연산", "멤버십 연산"],
        "exampleCode": """\
orderTotal = 27000
hasCoupon = True
canDiscount = orderTotal >= 20000 and hasCoupon
canDiscount
""",
        "predictPrompt": "`17 % 5`는 무엇을 의미할까요? 몫이 아니라 남는 값을 생각하세요.",
        "predictCode": """\
17 % 5
""",
        "predictAnswer": "2",
        "exercisePrompt": "`score`가 80 이상이고 `attendance`가 10 이상이면 통과입니다. `passed`를 완성하세요.",
        "exerciseCode": """\
score = 86
attendance = 12
passed = ...
assert passed is True
passed
""",
        "solutionCode": """\
score = 86
attendance = 12
passed = score >= 80 and attendance >= 10
assert passed is True
passed
""",
        "bugPrompt": "아래 코드는 할인 조건을 반대로 쓰고 있습니다. 20000원 이상일 때 할인되도록 고치세요.",
        "bugCode": """\
cartTotal = 23000
discountTarget = cartTotal < 20000
assert discountTarget is True
discountTarget
""",
        "bugFixCode": """\
cartTotal = 23000
discountTarget = cartTotal >= 20000
assert discountTarget is True
discountTarget
""",
        "projectPrompt": "간단한 입장 조건을 만드세요. 나이가 13 이상이고 티켓을 가진 사람만 입장할 수 있습니다.",
        "projectCode": """\
age = 15
hasTicket = True
canEnter = age >= 13 and hasTicket
canEnter
""",
        "challenge": "나이가 65 이상이면 티켓이 없어도 입장 가능하도록 조건을 확장해보세요.",
        "commonMistakes": ["`=`와 `==`를 혼동하기", "`and`와 `or`를 감으로 고르기", "나머지 연산을 몫으로 착각하기"],
    },
    {
        "day": 4,
        "slug": "stringBasics",
        "title": "문자열 기초",
        "focus": "문자열을 만들고 합치고 포맷팅하는 기본기를 익힌다.",
        "outcome": "f-string으로 읽기 쉬운 문장을 만들고 특수 문자를 다룰 수 있다.",
        "why": "실제 프로그램의 많은 출력은 사람이 읽는 문장이다. 문자열을 잘 다루면 데이터가 사용자에게 의미 있는 메시지로 바뀐다.",
        "mentalModel": "문자열은 글자들의 순서 있는 묶음이다. 숫자 계산과 달리 문자열 연산은 문장을 만들거나 반복하는 방향으로 생각해야 한다.",
        "concepts": ["문자열 연결", "f-string", "이스케이프", "여러 줄 문자열", "포함 여부"],
        "exampleCode": """\
name = "Sora"
level = 3
badge = f"{name} reached level {level}."
badge
""",
        "predictPrompt": "`'ha' * 3`의 결과를 예측하세요. 문자열 곱셈은 같은 문자열을 반복합니다.",
        "predictCode": """\
"ha" * 3
""",
        "predictAnswer": "'hahaha'",
        "exercisePrompt": "`userName`과 `points`를 이용해 `Rin has 42 points.` 문장을 만드세요.",
        "exerciseCode": """\
userName = "Rin"
points = 42
sentence = ...
assert sentence == "Rin has 42 points."
sentence
""",
        "solutionCode": """\
userName = "Rin"
points = 42
sentence = f"{userName} has {points} points."
assert sentence == "Rin has 42 points."
sentence
""",
        "bugPrompt": "아래 코드는 숫자와 문자열을 `+`로 바로 합치고 있습니다. f-string으로 고치세요.",
        "bugCode": """\
rank = 1
message = "Rank: " + rank
message
""",
        "bugFixCode": """\
rank = 1
message = f"Rank: {rank}"
message
""",
        "projectPrompt": "짧은 주문 확인 문장을 만드세요. 메뉴명, 수량, 결제 금액이 모두 들어가야 합니다.",
        "projectCode": """\
menu = "latte"
quantity = 2
amount = 9000
receipt = f"Order: {menu} x {quantity}, total {amount} won"
receipt
""",
        "challenge": "문장 안에 줄바꿈 `\\n`을 넣어 영수증처럼 두 줄로 출력해보세요.",
        "commonMistakes": ["문자열과 숫자를 `+`로 바로 연결하기", "f-string 앞의 `f`를 빼먹기", "따옴표 안팎을 헷갈리기"],
    },
    {
        "day": 5,
        "slug": "stringIndexingSlicing",
        "title": "문자열 인덱싱과 슬라이싱",
        "focus": "문자열에서 특정 위치나 범위를 꺼내는 법을 익힌다.",
        "outcome": "양수/음수 인덱스와 슬라이스 범위를 사용해 필요한 글자만 가져올 수 있다.",
        "why": "로그, 코드, 이메일, 파일명처럼 텍스트에서 일부만 꺼내야 하는 일이 많다. 인덱싱과 슬라이싱은 텍스트를 자르는 가장 기본적인 도구다.",
        "mentalModel": "인덱스는 글자 사이의 칸이 아니라 각 글자에 붙은 번호다. 슬라이스의 끝 번호는 포함되지 않는다는 규칙만 분명히 기억하면 된다.",
        "concepts": ["0번 인덱스", "음수 인덱스", "범위 슬라이싱", "간격 슬라이싱", "끝 미포함 규칙"],
        "exampleCode": """\
code = "PYTHON"
firstLetter = code[0]
lastLetter = code[-1]
firstLetter, lastLetter
""",
        "predictPrompt": "`'CODARO'[1:4]`의 결과를 예측하세요. 시작은 포함, 끝은 제외입니다.",
        "predictCode": """\
"CODARO"[1:4]
""",
        "predictAnswer": "'ODA'",
        "exercisePrompt": "`fileName`에서 확장자 `csv`만 꺼내세요.",
        "exerciseCode": """\
fileName = "salesReport.csv"
extension = ...
assert extension == "csv"
extension
""",
        "solutionCode": """\
fileName = "salesReport.csv"
extension = fileName[-3:]
assert extension == "csv"
extension
""",
        "bugPrompt": "아래 코드는 끝 인덱스를 포함한다고 착각해서 값이 짧게 나옵니다. `Python`이 나오게 고치세요.",
        "bugCode": """\
text = "Learn Python Today"
word = text[6:11]
assert word == "Python"
word
""",
        "bugFixCode": """\
text = "Learn Python Today"
word = text[6:12]
assert word == "Python"
word
""",
        "projectPrompt": "주민번호처럼 생긴 예시 문자열에서 생년월일 부분과 뒤 첫 숫자를 분리하세요. 실제 개인정보를 사용하지 마세요.",
        "projectCode": """\
sampleId = "990101-2345678"
birth = sampleId[:6]
groupCode = sampleId[7]
birth, groupCode
""",
        "challenge": "`sampleId`에서 하이픈을 기준으로 앞부분과 뒷부분을 각각 슬라이스해보세요.",
        "commonMistakes": ["끝 인덱스가 포함된다고 생각하기", "첫 번째 글자를 1번으로 세기", "음수 인덱스 방향을 반대로 이해하기"],
    },
    {
        "day": 6,
        "slug": "stringMethods",
        "title": "문자열 메서드",
        "focus": "문자열을 정리하고 나누고 바꾸는 대표 메서드를 익힌다.",
        "outcome": "`strip`, `lower`, `split`, `join`, `replace`, `find`, `count`를 실제 텍스트 정리에 사용할 수 있다.",
        "why": "현실의 텍스트 데이터는 대소문자, 공백, 구분자가 뒤섞여 있다. 문자열 메서드는 지저분한 입력을 비교 가능한 형태로 정리해준다.",
        "mentalModel": "메서드는 값 뒤에 붙여 쓰는 동작이다. 문자열 메서드는 원본을 직접 바꾸지 않고 새 문자열을 만든다는 점이 중요하다.",
        "concepts": ["공백 제거", "대소문자 변환", "분리", "결합", "치환", "검색"],
        "exampleCode": """\
rawEmail = "  USER@Example.COM  "
cleanEmail = rawEmail.strip().lower()
cleanEmail
""",
        "predictPrompt": "`'a,b,c'.split(',')`의 결과를 예측하세요. 문자열이 어떤 자료구조로 바뀌는지 보세요.",
        "predictCode": """\
"a,b,c".split(",")
""",
        "predictAnswer": "['a', 'b', 'c']",
        "exercisePrompt": "`rawTags`를 쉼표로 나누고, 하이픈으로 다시 연결해 `python-colab-practice`를 만드세요.",
        "exerciseCode": """\
rawTags = "python,colab,practice"
tagList = rawTags.split(",")
joinedTags = ...
assert joinedTags == "python-colab-practice"
joinedTags
""",
        "solutionCode": """\
rawTags = "python,colab,practice"
tagList = rawTags.split(",")
joinedTags = "-".join(tagList)
assert joinedTags == "python-colab-practice"
joinedTags
""",
        "bugPrompt": "아래 코드는 `replace` 결과를 저장하지 않아 원본이 그대로입니다. 새 값을 변수에 담으세요.",
        "bugCode": """\
title = "Python basics"
title.replace("basics", "mastery")
assert title == "Python mastery"
title
""",
        "bugFixCode": """\
title = "Python basics"
title = title.replace("basics", "mastery")
assert title == "Python mastery"
title
""",
        "projectPrompt": "사용자가 입력한 문장처럼 보이는 텍스트를 정리해 검색 키워드로 바꾸세요.",
        "projectCode": """\
rawQuery = "  Learn Python Fast  "
keyword = rawQuery.strip().lower().replace(" ", "-")
keyword
""",
        "challenge": "`keyword.count('-')`로 단어 사이 구분자가 몇 개인지 확인해보세요.",
        "commonMistakes": ["메서드 결과를 저장하지 않기", "`split` 결과가 문자열이라고 착각하기", "원본 문자열이 바뀐다고 생각하기"],
    },
    {
        "day": 7,
        "slug": "listBasics",
        "title": "리스트 기초",
        "focus": "여러 값을 순서대로 담는 리스트를 만들고 읽고 바꾼다.",
        "outcome": "리스트 생성, 인덱싱, 슬라이싱, 값 변경을 사용할 수 있다.",
        "why": "프로그램은 하나의 값보다 여러 값을 다룰 때가 훨씬 많다. 리스트는 순서가 있는 데이터 묶음을 다루는 기본 도구다.",
        "mentalModel": "리스트는 줄 서 있는 값들이다. 각 값은 위치 번호를 가지고, 위치로 읽거나 바꿀 수 있다.",
        "concepts": ["리스트 생성", "리스트 인덱싱", "리스트 슬라이싱", "값 변경", "길이 확인"],
        "exampleCode": """\
scores = [70, 85, 92]
scores[1] = 88
scores
""",
        "predictPrompt": "`['a', 'b', 'c'][-1]`의 결과를 예측하세요. 음수 인덱스는 뒤에서 셉니다.",
        "predictCode": """\
["a", "b", "c"][-1]
""",
        "predictAnswer": "'c'",
        "exercisePrompt": "`todos`의 두 번째 값을 `review`로 바꾸세요.",
        "exerciseCode": """\
todos = ["read", "draft", "send"]
todos[...] = "review"
assert todos == ["read", "review", "send"]
todos
""",
        "solutionCode": """\
todos = ["read", "draft", "send"]
todos[1] = "review"
assert todos == ["read", "review", "send"]
todos
""",
        "bugPrompt": "아래 코드는 첫 번째 값을 1번 인덱스로 착각했습니다. `red`가 나오도록 고치세요.",
        "bugCode": """\
colors = ["red", "green", "blue"]
firstColor = colors[1]
assert firstColor == "red"
firstColor
""",
        "bugFixCode": """\
colors = ["red", "green", "blue"]
firstColor = colors[0]
assert firstColor == "red"
firstColor
""",
        "projectPrompt": "이번 주 학습 항목 리스트를 만들고, 앞의 3개 항목만 `weekStart`로 꺼내세요.",
        "projectCode": """\
topics = ["variables", "strings", "lists", "tuples", "sets"]
weekStart = topics[:3]
weekStart
""",
        "challenge": "마지막 항목을 다른 주제로 바꾼 뒤 다시 출력해보세요.",
        "commonMistakes": ["인덱스를 1부터 센다고 생각하기", "리스트와 문자열의 공통점과 차이를 구분하지 못하기", "슬라이스 결과가 새 리스트라는 점을 놓치기"],
    },
    {
        "day": 8,
        "slug": "listMethods",
        "title": "리스트 메서드",
        "focus": "리스트에 값을 추가, 삭제, 정렬, 복사하는 메서드를 익힌다.",
        "outcome": "`append`, `insert`, `remove`, `pop`, `sort`, `reverse`, `copy`, `extend`를 상황에 맞게 고를 수 있다.",
        "why": "리스트는 고정된 표가 아니라 계속 변하는 작업 목록에 가깝다. 메서드를 알면 데이터를 직접 관리하는 작은 프로그램을 만들 수 있다.",
        "mentalModel": "일부 리스트 메서드는 원본 리스트를 직접 바꾼다. `sort()`처럼 결과를 반환하지 않는 메서드와 `sorted()`처럼 새 값을 만드는 함수를 구분해야 한다.",
        "concepts": ["추가", "삽입", "삭제", "정렬", "복사", "확장"],
        "exampleCode": """\
queue = ["A", "B"]
queue.append("C")
served = queue.pop(0)
served, queue
""",
        "predictPrompt": "`nums.sort()`를 실행한 뒤 `nums`가 어떻게 바뀌는지 예측하세요.",
        "predictCode": """\
nums = [3, 1, 2]
nums.sort()
nums
""",
        "predictAnswer": "[1, 2, 3]",
        "exercisePrompt": "`cart`에 `tea`를 추가하고 `cookie`를 제거하세요.",
        "exerciseCode": """\
cart = ["coffee", "cookie"]
cart.append(...)
cart.remove(...)
assert cart == ["coffee", "tea"]
cart
""",
        "solutionCode": """\
cart = ["coffee", "cookie"]
cart.append("tea")
cart.remove("cookie")
assert cart == ["coffee", "tea"]
cart
""",
        "bugPrompt": "아래 코드는 `sort()`의 반환값을 저장하려고 해서 `None`이 됩니다. 원본 리스트를 정렬한 뒤 출력하세요.",
        "bugCode": """\
levels = [2, 5, 1]
sortedLevels = levels.sort()
assert sortedLevels == [1, 2, 5]
sortedLevels
""",
        "bugFixCode": """\
levels = [2, 5, 1]
levels.sort()
sortedLevels = levels
assert sortedLevels == [1, 2, 5]
sortedLevels
""",
        "projectPrompt": "대기열을 만들고 한 명을 앞에 추가한 뒤, 첫 번째 사람을 처리하세요.",
        "projectCode": """\
waiting = ["Noa", "Mia", "Leo"]
waiting.insert(0, "Kai")
nextUser = waiting.pop(0)
nextUser, waiting
""",
        "challenge": "`copy()`를 사용해 원본 대기열과 백업 대기열을 분리해보세요.",
        "commonMistakes": ["`sort()` 결과를 변수에 저장하기", "`remove`와 `pop`의 기준을 헷갈리기", "복사 없이 같은 리스트를 두 이름으로 공유하기"],
    },
    {
        "day": 9,
        "slug": "tuples",
        "title": "튜플",
        "focus": "바뀌면 안 되는 순서형 데이터를 튜플로 표현한다.",
        "outcome": "튜플 생성, 패킹, 언패킹, 불변성의 의미를 설명할 수 있다.",
        "why": "좌표, 날짜, 고정된 설정처럼 위치는 중요하지만 값을 바꾸면 안 되는 데이터가 있다. 튜플은 그런 데이터를 명확하게 표현한다.",
        "mentalModel": "튜플은 잠근 리스트가 아니라 의미 있는 묶음이다. 특히 언패킹을 사용하면 묶음 안의 의미를 변수명으로 드러낼 수 있다.",
        "concepts": ["튜플 생성", "불변성", "패킹", "언패킹", "반환값 묶음"],
        "exampleCode": """\
point = (3, 7)
x, y = point
x + y
""",
        "predictPrompt": "`name, score = ('Ada', 95)` 이후 `score` 값은 무엇일까요?",
        "predictCode": """\
name, score = ("Ada", 95)
score
""",
        "predictAnswer": "95",
        "exercisePrompt": "`userInfo`를 언패킹해서 `userName`과 `userLevel`을 만드세요.",
        "exerciseCode": """\
userInfo = ("Rin", 4)
...
assert userName == "Rin"
assert userLevel == 4
userName, userLevel
""",
        "solutionCode": """\
userInfo = ("Rin", 4)
userName, userLevel = userInfo
assert userName == "Rin"
assert userLevel == 4
userName, userLevel
""",
        "bugPrompt": "아래 코드는 튜플 값을 직접 바꾸려고 해서 실패합니다. 새 튜플을 만들어 해결하세요.",
        "bugCode": """\
size = (1920, 1080)
size[1] = 720
size
""",
        "bugFixCode": """\
size = (1920, 1080)
size = (size[0], 720)
size
""",
        "projectPrompt": "좌표 두 개를 튜플로 만들고, x/y 차이를 계산하세요.",
        "projectCode": """\
start = (2, 3)
end = (8, 11)
dx = end[0] - start[0]
dy = end[1] - start[1]
dx, dy
""",
        "challenge": "언패킹을 사용해 `startX`, `startY`, `endX`, `endY`로 바꿔 계산해보세요.",
        "commonMistakes": ["튜플을 리스트처럼 수정하려 하기", "원소가 1개인 튜플에서 쉼표를 빼먹기", "언패킹 변수 개수를 맞추지 않기"],
    },
    {
        "day": 10,
        "slug": "sets",
        "title": "집합",
        "focus": "중복 제거와 집합 연산으로 데이터를 비교한다.",
        "outcome": "합집합, 교집합, 차집합을 사용해 두 데이터 묶음의 관계를 찾을 수 있다.",
        "why": "사용자 목록, 태그, 권한처럼 중복보다 포함 관계가 중요한 데이터가 많다. 집합은 이런 비교를 짧고 정확하게 표현한다.",
        "mentalModel": "집합은 순서보다 소속 여부가 중요한 묶음이다. 어떤 값이 들어 있는지, 두 묶음이 어떻게 겹치는지가 핵심이다.",
        "concepts": ["중복 제거", "소속 검사", "add", "discard", "합집합", "교집합", "차집합"],
        "exampleCode": """\
webUsers = {"Ari", "Bo", "Choi"}
appUsers = {"Bo", "Dana"}
sharedUsers = webUsers & appUsers
sharedUsers
""",
        "predictPrompt": "`set([1, 1, 2, 3])`의 결과에서 1은 몇 번 남을까요?",
        "predictCode": """\
set([1, 1, 2, 3])
""",
        "predictAnswer": "{1, 2, 3}",
        "exercisePrompt": "`paidUsers`에는 있지만 `activeUsers`에는 없는 사용자를 찾으세요.",
        "exerciseCode": """\
paidUsers = {"a", "b", "c"}
activeUsers = {"b", "c", "d"}
inactivePaid = ...
assert inactivePaid == {"a"}
inactivePaid
""",
        "solutionCode": """\
paidUsers = {"a", "b", "c"}
activeUsers = {"b", "c", "d"}
inactivePaid = paidUsers - activeUsers
assert inactivePaid == {"a"}
inactivePaid
""",
        "bugPrompt": "아래 코드는 빈 집합을 만들려다 빈 딕셔너리를 만들었습니다. `set()`을 사용하세요.",
        "bugCode": """\
tags = {}
tags.add("python")
tags
""",
        "bugFixCode": """\
tags = set()
tags.add("python")
tags
""",
        "projectPrompt": "이벤트 참가자와 설문 응답자의 교집합, 전체 고유 인원을 구하세요.",
        "projectCode": """\
attendees = {"Kim", "Lee", "Park"}
respondents = {"Lee", "Choi", "Kim"}
completedSurvey = attendees & respondents
uniquePeople = attendees | respondents
completedSurvey, uniquePeople
""",
        "challenge": "참가했지만 설문에 응답하지 않은 사람을 찾아보세요.",
        "commonMistakes": ["`{}`를 빈 집합으로 착각하기", "집합에 순서가 있다고 기대하기", "`remove`와 `discard`의 에러 차이를 모르는 것"],
    },
    {
        "day": 11,
        "slug": "dictBasics",
        "title": "딕셔너리 기초",
        "focus": "키와 값으로 구조화된 데이터를 표현한다.",
        "outcome": "딕셔너리를 만들고, 키로 값을 읽고, 값을 추가하거나 수정할 수 있다.",
        "why": "현실 데이터는 이름표가 붙은 값의 묶음인 경우가 많다. 딕셔너리는 사용자, 상품, 설정처럼 필드가 있는 데이터를 표현하는 핵심 구조다.",
        "mentalModel": "딕셔너리는 사전처럼 키로 값을 찾는다. 리스트가 위치 번호로 찾는다면 딕셔너리는 의미 있는 이름으로 찾는다.",
        "concepts": ["키와 값", "값 읽기", "값 수정", "새 키 추가", "중첩 데이터의 시작"],
        "exampleCode": """\
profile = {"name": "Jin", "level": 5}
profile["level"] = profile["level"] + 1
profile
""",
        "predictPrompt": "`profile['name']`은 어떤 값을 돌려줄까요?",
        "predictCode": """\
profile = {"name": "Jin", "level": 5}
profile["name"]
""",
        "predictAnswer": "'Jin'",
        "exercisePrompt": "`book`에 `pages` 키를 추가하고 값은 320으로 넣으세요.",
        "exerciseCode": """\
book = {"title": "Python Notes", "author": "Codaro"}
...
assert book["pages"] == 320
book
""",
        "solutionCode": """\
book = {"title": "Python Notes", "author": "Codaro"}
book["pages"] = 320
assert book["pages"] == 320
book
""",
        "bugPrompt": "아래 코드는 없는 키를 읽어서 실패합니다. 존재하는 키 이름으로 고치세요.",
        "bugCode": """\
item = {"name": "notebook", "price": 3000}
itemCost = item["cost"]
itemCost
""",
        "bugFixCode": """\
item = {"name": "notebook", "price": 3000}
itemCost = item["price"]
itemCost
""",
        "projectPrompt": "학생 한 명의 성적표를 딕셔너리로 만들고 평균 점수를 계산하세요.",
        "projectCode": """\
report = {"name": "Mina", "math": 90, "english": 85, "science": 95}
average = (report["math"] + report["english"] + report["science"]) / 3
average
""",
        "challenge": "`report`에 `passed` 키를 추가하고 평균이 80 이상인지 저장해보세요.",
        "commonMistakes": ["키 문자열 따옴표를 빼먹기", "없는 키를 바로 읽기", "리스트 인덱스와 딕셔너리 키를 섞어 생각하기"],
    },
    {
        "day": 12,
        "slug": "dictMethods",
        "title": "딕셔너리 메서드",
        "focus": "딕셔너리를 안전하게 읽고 순회하고 갱신한다.",
        "outcome": "`get`, `keys`, `values`, `items`, `update`, `pop`을 실제 데이터 정리에 사용할 수 있다.",
        "why": "딕셔너리는 편리하지만 없는 키를 읽으면 에러가 난다. 메서드를 사용하면 안전하게 읽고, 여러 값을 한 번에 갱신하고, 키-값 쌍을 반복 처리할 수 있다.",
        "mentalModel": "`items()`는 딕셔너리를 작은 튜플들의 흐름으로 보여준다. 키와 값을 동시에 다뤄야 할 때 가장 자주 쓴다.",
        "concepts": ["안전한 읽기", "키 목록", "값 목록", "키-값 순회", "갱신", "삭제"],
        "exampleCode": """\
settings = {"theme": "dark", "fontSize": 14}
fontSize = settings.get("fontSize", 12)
fontSize
""",
        "predictPrompt": "없는 키를 `get`으로 읽으면 기본값이 어떻게 쓰이는지 확인하세요.",
        "predictCode": """\
settings = {"theme": "dark"}
settings.get("language", "en")
""",
        "predictAnswer": "'en'",
        "exercisePrompt": "`inventory`에서 `pen`의 수량을 꺼내고, 없으면 0을 쓰도록 만드세요.",
        "exerciseCode": """\
inventory = {"notebook": 5, "eraser": 2}
penCount = ...
assert penCount == 0
penCount
""",
        "solutionCode": """\
inventory = {"notebook": 5, "eraser": 2}
penCount = inventory.get("pen", 0)
assert penCount == 0
penCount
""",
        "bugPrompt": "아래 코드는 `keys()` 결과에서 값 3000을 찾으려고 합니다. 값을 보려면 `values()`를 쓰세요.",
        "bugCode": """\
prices = {"coffee": 3000, "tea": 2500}
hasPrice = 3000 in prices.keys()
assert hasPrice is True
hasPrice
""",
        "bugFixCode": """\
prices = {"coffee": 3000, "tea": 2500}
hasPrice = 3000 in prices.values()
assert hasPrice is True
hasPrice
""",
        "projectPrompt": "상품 가격 딕셔너리를 안전하게 읽고, 품절 상품을 제거한 뒤, 새 상품 가격을 한 번에 추가하세요.",
        "projectCode": """\
prices = {"coffee": 5000, "tea": 4000, "cake": 7000}
teaPrice = prices.get("tea", 0)
soldOut = prices.pop("cake")
prices.update({"cookie": 3500})
teaPrice, soldOut, prices
""",
        "challenge": "`pop`으로 품절 상품을 제거한 뒤 남은 딕셔너리를 확인해보세요.",
        "commonMistakes": ["`get`의 기본값을 빼먹기", "`keys()`와 `values()`를 혼동하기", "`items()`가 키와 값을 함께 준다는 점을 놓치기"],
    },
    {
        "day": 13,
        "slug": "conditionals",
        "title": "조건문",
        "focus": "상황에 따라 다른 코드를 실행하는 흐름을 만든다.",
        "outcome": "`if`, `elif`, `else`로 점수, 상태, 입력값에 따른 분기 로직을 작성할 수 있다.",
        "why": "프로그램은 매번 같은 일을 하지 않는다. 조건문은 데이터의 상태에 따라 다른 결정을 내리게 하는 기본 구조다.",
        "mentalModel": "조건문은 위에서 아래로 검사하는 문이다. 처음으로 참이 되는 문을 만나면 그 블록을 실행하고 나머지는 건너뛴다.",
        "concepts": ["if", "elif", "else", "중첩 조건", "조건 표현식", "블록 들여쓰기"],
        "exampleCode": """\
score = 87
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
grade
""",
        "predictPrompt": "`temperature = 30`일 때 아래 조건문은 어떤 값을 만들까요?",
        "predictCode": """\
temperature = 30
if temperature >= 28:
    weather = "hot"
else:
    weather = "mild"
weather
""",
        "predictAnswer": "'hot'",
        "exercisePrompt": "`age`가 19 이상이면 `adult`, 아니면 `minor`를 `label`에 저장하세요.",
        "exerciseCode": """\
age = 18
if ...:
    label = "adult"
else:
    label = "minor"
assert label == "minor"
label
""",
        "solutionCode": """\
age = 18
if age >= 19:
    label = "adult"
else:
    label = "minor"
assert label == "minor"
label
""",
        "bugPrompt": "아래 코드는 높은 점수를 먼저 검사하지 않아 95점도 B가 됩니다. 조건 순서를 고치세요.",
        "bugCode": """\
score = 95
if score >= 80:
    grade = "B"
elif score >= 90:
    grade = "A"
else:
    grade = "C"
assert grade == "A"
grade
""",
        "bugFixCode": """\
score = 95
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
assert grade == "A"
grade
""",
        "projectPrompt": "배송비 정책을 조건문으로 구현하세요. 50000원 이상은 무료, 30000원 이상은 2000원, 그 외는 3000원입니다.",
        "projectCode": """\
orderAmount = 42000
if orderAmount >= 50000:
    shippingFee = 0
elif orderAmount >= 30000:
    shippingFee = 2000
else:
    shippingFee = 3000
shippingFee
""",
        "challenge": "쿠폰 보유 여부까지 반영해 최종 결제 금액을 계산해보세요.",
        "commonMistakes": ["들여쓰기를 맞추지 않기", "조건 순서를 잘못 배치하기", "`elif`가 아니라 여러 `if`를 써서 중복 실행 만들기"],
    },
    {
        "day": 14,
        "slug": "loops",
        "title": "반복문",
        "focus": "여러 데이터에 같은 작업을 반복 적용한다.",
        "outcome": "`for`, `while`, `range`, `break`, `continue`를 사용해 반복 흐름을 제어할 수 있다.",
        "why": "리스트의 모든 값에 같은 계산을 하거나, 조건이 만족될 때까지 시도하는 일은 반복문 없이는 불편하다. 반복문은 작은 규칙을 여러 데이터에 확장한다.",
        "mentalModel": "`for`는 준비된 묶음을 하나씩 꺼내고, `while`은 조건이 참인 동안 계속 돈다. 끝나는 조건을 명확히 두는 것이 안전하다.",
        "concepts": ["for", "while", "range", "누적", "break", "continue", "중첩 반복"],
        "exampleCode": """\
scores = [80, 95, 70]
total = 0
for score in scores:
    total = total + score
average = total / len(scores)
average
""",
        "predictPrompt": "`range(1, 5)`가 실제로 어떤 숫자들을 만들어내는지 확인하세요.",
        "predictCode": """\
list(range(1, 5))
""",
        "predictAnswer": "[1, 2, 3, 4]",
        "exercisePrompt": "`numbers`에서 짝수만 골라 `evens`에 넣으세요.",
        "exerciseCode": """\
numbers = [1, 2, 3, 4, 5, 6]
evens = []
for num in numbers:
    if ...:
        evens.append(num)
assert evens == [2, 4, 6]
evens
""",
        "solutionCode": """\
numbers = [1, 2, 3, 4, 5, 6]
evens = []
for num in numbers:
    if num % 2 == 0:
        evens.append(num)
assert evens == [2, 4, 6]
evens
""",
        "bugPrompt": "아래 `while` 반복문은 `count`를 증가시키지 않아 끝나지 않습니다. 증가식을 추가하세요.",
        "bugCode": """\
count = 0
items = []
while count < 3:
    items.append(count)
items
""",
        "bugFixCode": """\
count = 0
items = []
while count < 3:
    items.append(count)
    count = count + 1
items
""",
        "projectPrompt": "구매 금액 리스트에서 10000원 이상인 주문만 골라 총합을 구하세요.",
        "projectCode": """\
orders = [8000, 12000, 5400, 23000, 15000]
largeTotal = 0
for order in orders:
    if order >= 10000:
        largeTotal = largeTotal + order
largeTotal
""",
        "challenge": "`continue`를 사용해 10000원 미만 주문을 건너뛰는 형태로 바꿔보세요.",
        "commonMistakes": ["`range`의 끝값이 포함된다고 생각하기", "`while` 종료 조건을 빼먹기", "누적 변수를 반복문 안에서 매번 초기화하기"],
    },
    {
        "day": 15,
        "slug": "functionBasics",
        "title": "함수 기초",
        "focus": "반복되는 로직에 이름을 붙이고 재사용한다.",
        "outcome": "`def`, 매개변수, 반환값을 사용해 작은 함수를 만들 수 있다.",
        "why": "함수는 코드를 줄이는 도구일 뿐 아니라 생각에 이름을 붙이는 도구다. 잘 만든 함수는 프로그램을 읽기 쉬운 단계들로 나눈다.",
        "mentalModel": "함수는 입력을 받아 내부 규칙을 적용하고 결과를 돌려주는 작은 기계다. 출력하려는 값과 반환하려는 값을 구분하는 것이 중요하다.",
        "concepts": ["def", "매개변수", "인자", "return", "docstring", "재사용"],
        "exampleCode": """\
def addTax(price):
    return int(price * 1.1)

addTax(10000)
""",
        "predictPrompt": "`return` 이후의 값이 함수 호출 결과가 됩니다. 아래 결과를 예측하세요.",
        "predictCode": """\
def double(num):
    return num * 2

double(7)
""",
        "predictAnswer": "14",
        "exercisePrompt": "두 숫자의 평균을 반환하는 `averageTwo` 함수를 완성하세요.",
        "exerciseCode": """\
def averageTwo(a, b):
    return ...

result = averageTwo(80, 100)
assert result == 90
result
""",
        "solutionCode": """\
def averageTwo(a, b):
    return (a + b) / 2

result = averageTwo(80, 100)
assert result == 90
result
""",
        "bugPrompt": "아래 함수는 계산만 하고 반환하지 않아 결과가 `None`입니다. `return`을 추가하세요.",
        "bugCode": """\
def makeTotal(price, count):
    price * count

total = makeTotal(3000, 4)
assert total == 12000
total
""",
        "bugFixCode": """\
def makeTotal(price, count):
    return price * count

total = makeTotal(3000, 4)
assert total == 12000
total
""",
        "projectPrompt": "금액과 할인율을 받아 할인 후 금액을 반환하는 함수를 만드세요.",
        "projectCode": """\
def applyDiscount(price, rate):
    return int(price * (1 - rate))

finalPrice = applyDiscount(20000, 0.15)
finalPrice
""",
        "challenge": "할인 후 금액이 0보다 작아지지 않도록 함수를 보강해보세요.",
        "commonMistakes": ["`print`와 `return`을 혼동하기", "함수 이름만 쓰고 호출 괄호를 빼먹기", "매개변수와 인자의 방향을 헷갈리기"],
    },
    {
        "day": 16,
        "slug": "functionAdvanced",
        "title": "함수 고급",
        "focus": "기본값, 키워드 인자, 가변 인자, 람다를 익힌다.",
        "outcome": "함수 호출 방식을 유연하게 설계하고 간단한 콜백 함수를 만들 수 있다.",
        "why": "실제 함수는 항상 같은 개수의 인자만 받지 않는다. 기본값과 키워드 인자는 함수의 사용성을 높이고, 가변 인자는 여러 값을 자연스럽게 처리하게 해준다.",
        "mentalModel": "함수의 시그니처는 사용 설명서다. 어떤 값이 필수인지, 어떤 값은 선택인지 시그니처만 보고 알 수 있어야 한다.",
        "concepts": ["기본 매개변수", "키워드 인자", "*args", "**kwargs", "lambda"],
        "exampleCode": """\
def formatUser(name, level=1):
    return f"{name}: level {level}"

formatUser("Mina", level=3)
""",
        "predictPrompt": "기본값이 있는 함수에 두 번째 인자를 생략하면 어떤 값이 쓰일까요?",
        "predictCode": """\
def addShipping(price, fee=3000):
    return price + fee

addShipping(10000)
""",
        "predictAnswer": "13000",
        "exercisePrompt": "여러 숫자를 받아 합계를 반환하는 `sumAll` 함수를 완성하세요.",
        "exerciseCode": """\
def sumAll(nums):
    return sum(nums)

result = sumAll(1, 2, 3, 4)
assert result == 10
result
""",
        "solutionCode": """\
def sumAll(*nums):
    return sum(nums)

result = sumAll(1, 2, 3, 4)
assert result == 10
result
""",
        "bugPrompt": "아래 함수는 가변 기본값 리스트를 공유합니다. 기본값을 `None`으로 바꾸고 내부에서 새 리스트를 만드세요.",
        "bugCode": """\
def addTask(task, tasks=[]):
    tasks.append(task)
    return tasks

first = addTask("read")
second = addTask("write")
assert second == ["write"]
second
""",
        "bugFixCode": """\
def addTask(task, tasks=None):
    if tasks is None:
        tasks = []
    tasks.append(task)
    return tasks

first = addTask("read")
second = addTask("write")
assert second == ["write"]
second
""",
        "projectPrompt": "금액 리스트와 할인율을 받아 할인 금액 리스트를 반환하는 함수를 만드세요.",
        "projectCode": """\
def discountMany(rate, *prices):
    results = []
    for price in prices:
        results.append(int(price * (1 - rate)))
    return results

discountMany(0.1, 10000, 20000, 30000)
""",
        "challenge": "`lambda price: price >= 20000`를 만들어 고가 상품만 필터링해보세요.",
        "commonMistakes": ["가변 기본값을 그대로 쓰기", "`*args`가 튜플이라는 점을 잊기", "키워드 인자를 위치 인자보다 앞에 두기"],
    },
    {
        "day": 17,
        "slug": "scopeClosure",
        "title": "스코프와 클로저",
        "focus": "변수가 보이는 범위와 상태를 기억하는 함수를 이해한다.",
        "outcome": "지역/전역 스코프를 구분하고 클로저로 간단한 상태를 캡슐화할 수 있다.",
        "why": "변수 이름이 같아도 어디에서 만들어졌는지에 따라 전혀 다른 값일 수 있다. 스코프를 이해하면 예상치 못한 값 변경과 이름 충돌을 줄일 수 있다.",
        "mentalModel": "파이썬은 가까운 방부터 이름을 찾는다. 함수 안, 바깥 함수, 전역, 내장 순서로 이름을 찾는다고 생각하면 된다.",
        "concepts": ["지역 스코프", "전역 스코프", "nonlocal", "global", "클로저", "상태 캡슐화"],
        "exampleCode": """\
def makeCounter():
    count = 0
    def nextCount():
        nonlocal count
        count = count + 1
        return count
    return nextCount

counter = makeCounter()
counter(), counter()
""",
        "predictPrompt": "함수 안에서 만든 `name`은 함수 밖의 `name`을 바꿀까요?",
        "predictCode": """\
name = "outer"
def rename():
    name = "inner"
    return name

rename(), name
""",
        "predictAnswer": "('inner', 'outer')",
        "exercisePrompt": "`makeMultiplier`가 배수를 기억하는 함수를 반환하도록 완성하세요.",
        "exerciseCode": """\
def makeMultiplier(factor):
    def multiply(num):
        return ...
    return multiply

triple = makeMultiplier(3)
result = triple(10)
assert result == 30
result
""",
        "solutionCode": """\
def makeMultiplier(factor):
    def multiply(num):
        return num * factor
    return multiply

triple = makeMultiplier(3)
result = triple(10)
assert result == 30
result
""",
        "bugPrompt": "아래 코드는 바깥 함수의 `count`를 수정하려 하지만 `nonlocal`이 없어 실패합니다.",
        "bugCode": """\
def makeClicker():
    count = 0
    def click():
        count = count + 1
        return count
    return click

clicker = makeClicker()
clicker()
""",
        "bugFixCode": """\
def makeClicker():
    count = 0
    def click():
        nonlocal count
        count = count + 1
        return count
    return click

clicker = makeClicker()
clicker()
""",
        "projectPrompt": "누적 합계를 기억하는 `makeAccumulator`를 만들고 여러 번 호출해보세요.",
        "projectCode": """\
def makeAccumulator():
    total = 0
    def add(amount):
        nonlocal total
        total = total + amount
        return total
    return add

wallet = makeAccumulator()
wallet(5000), wallet(3000), wallet(-2000)
""",
        "challenge": "누적 합계가 음수가 되지 않도록 `add` 내부에 조건문을 추가해보세요.",
        "commonMistakes": ["함수 안 대입이 전역 변수를 바꾼다고 생각하기", "`global`을 과하게 쓰기", "`nonlocal`이 필요한 상황을 놓치기"],
    },
    {
        "day": 18,
        "slug": "modulesImport",
        "title": "모듈과 import",
        "focus": "표준 라이브러리를 가져와 프로그램의 기능을 확장한다.",
        "outcome": "`import`, `from import`, 별칭을 사용하고 `math`, `random`, `datetime` 같은 모듈을 활용할 수 있다.",
        "why": "파이썬의 힘은 직접 모든 것을 만들지 않아도 된다는 데 있다. 표준 라이브러리는 이미 검증된 도구 상자이고, import는 그 도구를 꺼내는 문법이다.",
        "mentalModel": "모듈은 관련 함수와 값을 모아둔 파일이다. `import math`는 `math`라는 이름의 도구 상자를 가져오는 일이다.",
        "concepts": ["import", "from import", "as 별칭", "표준 라이브러리", "모듈 네임스페이스"],
        "exampleCode": """\
import math

radius = 3
area = math.pi * radius ** 2
round(area, 2)
""",
        "predictPrompt": "`from datetime import date`를 쓰면 `date.today()`를 바로 호출할 수 있습니다.",
        "predictCode": """\
from datetime import date

date.today().year >= 2024
""",
        "predictAnswer": "True",
        "exercisePrompt": "`math.sqrt`를 사용해 144의 제곱근을 구하세요.",
        "exerciseCode": """\
import math

root = ...
assert root == 12
root
""",
        "solutionCode": """\
import math

root = math.sqrt(144)
assert root == 12
root
""",
        "bugPrompt": "아래 코드는 `random` 모듈을 가져오지 않고 사용합니다. import를 추가하세요.",
        "bugCode": """\
number = random.randint(1, 10)
1 <= number <= 10
""",
        "bugFixCode": """\
import random

number = random.randint(1, 10)
1 <= number <= 10
""",
        "projectPrompt": "오늘 날짜와 임의의 학습 점수를 조합해 학습 기록 딕셔너리를 만드세요.",
        "projectCode": """\
from datetime import date
import random

studyLog = {
    "date": date.today().isoformat(),
    "score": random.randint(70, 100),
}
studyLog
""",
        "challenge": "`random.seed(7)`을 추가하면 임의 결과가 어떻게 바뀌는지 확인해보세요.",
        "commonMistakes": ["모듈을 import하기 전에 사용하기", "`import math` 후 `sqrt`만 바로 쓰기", "별칭을 만든 뒤 원래 이름으로 부르기"],
    },
    {
        "day": 19,
        "slug": "fileIo",
        "title": "파일 입출력",
        "focus": "텍스트 파일을 만들고 읽고 안전하게 닫는 패턴을 익힌다.",
        "outcome": "`with open(...)`과 `pathlib.Path`로 작은 텍스트/JSON 파일을 다룰 수 있다.",
        "why": "프로그램이 끝나도 남아야 하는 데이터는 파일에 저장해야 한다. 파일 입출력을 알면 실행 결과를 기록하고 다음 실행에서 다시 불러올 수 있다.",
        "mentalModel": "`with`는 파일을 열고 작업이 끝나면 자동으로 닫는 안전한 작업 구역이다. 열기 모드가 읽기인지 쓰기인지에 따라 가능한 동작이 달라진다.",
        "concepts": ["open", "with", "read", "write", "파일 모드", "pathlib", "JSON 저장"],
        "exampleCode": """\
from pathlib import Path

notePath = Path("studyNote.txt")
notePath.write_text("Python file practice", encoding="utf-8")
notePath.read_text(encoding="utf-8")
""",
        "predictPrompt": "`write_text` 후 같은 경로에서 `read_text`를 하면 무엇이 나올지 예측하세요.",
        "predictCode": """\
from pathlib import Path

path = Path("hello.txt")
path.write_text("hello", encoding="utf-8")
path.read_text(encoding="utf-8")
""",
        "predictAnswer": "'hello'",
        "exercisePrompt": "`daily.txt` 파일에 `Day 19 complete`를 저장하고 다시 읽으세요.",
        "exerciseCode": """\
from pathlib import Path

dailyPath = Path("daily.txt")
...
content = dailyPath.read_text(encoding="utf-8")
assert content == "Day 19 complete"
content
""",
        "solutionCode": """\
from pathlib import Path

dailyPath = Path("daily.txt")
dailyPath.write_text("Day 19 complete", encoding="utf-8")
content = dailyPath.read_text(encoding="utf-8")
assert content == "Day 19 complete"
content
""",
        "bugPrompt": "아래 코드는 쓰기 모드로 열어놓고 읽으려고 합니다. 쓰기와 읽기를 분리하세요.",
        "bugCode": """\
with open("modeTest.txt", "w", encoding="utf-8") as file:
    file.write("mode")
    content = file.read()
content
""",
        "bugFixCode": """\
with open("modeTest.txt", "w", encoding="utf-8") as file:
    file.write("mode")

with open("modeTest.txt", "r", encoding="utf-8") as file:
    content = file.read()
content
""",
        "projectPrompt": "학습 기록 딕셔너리를 JSON 파일로 저장하고 다시 읽어오세요.",
        "projectCode": """\
from pathlib import Path
import json

record = {"day": 19, "topic": "file IO", "done": True}
recordPath = Path("record.json")
recordPath.write_text(json.dumps(record, ensure_ascii=False), encoding="utf-8")
loaded = json.loads(recordPath.read_text(encoding="utf-8"))
loaded
""",
        "challenge": "`indent=2` 옵션을 넣어 JSON 파일을 사람이 읽기 좋게 저장해보세요.",
        "commonMistakes": ["파일 모드를 잘못 고르기", "인코딩을 생략해 한글이 깨지기", "파일을 닫기 전에 읽거나 다른 작업을 섞기"],
    },
    {
        "day": 20,
        "slug": "exceptionHandling",
        "title": "예외 처리",
        "focus": "실패 가능성을 예상하고 사용자에게 안전한 흐름을 제공한다.",
        "outcome": "`try`, 구체적인 `except`, `else`, `finally`, `raise`를 상황에 맞게 사용할 수 있다.",
        "why": "프로그램은 항상 정상 입력만 받지 않는다. 예외 처리는 실패를 숨기는 기술이 아니라, 실패를 설명 가능한 흐름으로 바꾸는 기술이다.",
        "mentalModel": "예외는 특별한 반환값이 아니라 실행 흐름을 중단시키는 신호다. 잡을 수 있는 위치에서 구체적으로 잡고, 모르면 그대로 드러나게 하는 편이 안전하다.",
        "concepts": ["try", "except", "구체 예외", "else", "finally", "raise", "예외 메시지"],
        "exampleCode": """\
rawAge = "17"
try:
    age = int(rawAge)
except ValueError as exc:
    age = 0
age
""",
        "predictPrompt": "`int('abc')`는 어떤 예외를 만들까요? 실행 후 예외 이름을 확인하세요.",
        "predictCode": """\
try:
    value = int("abc")
except ValueError as exc:
    value = "invalid number"
value
""",
        "predictAnswer": "'invalid number'",
        "exercisePrompt": "`rawCount`를 정수로 바꾸되 실패하면 0을 사용하세요.",
        "exerciseCode": """\
rawCount = "many"
try:
    count = ...
except ValueError as exc:
    count = ...
assert count == 0
count
""",
        "solutionCode": """\
rawCount = "many"
try:
    count = int(rawCount)
except ValueError as exc:
    count = 0
assert count == 0
count
""",
        "bugPrompt": "아래 코드는 `KeyError`가 나는데 `ValueError`만 잡고 있습니다. 실제 예외 타입에 맞게 고치세요.",
        "bugCode": """\
data = {"name": "Mina"}
try:
    age = data["age"]
except ValueError as exc:
    age = 0
age
""",
        "bugFixCode": """\
data = {"name": "Mina"}
try:
    age = data["age"]
except KeyError as exc:
    age = 0
age
""",
        "projectPrompt": "점수 문자열 리스트를 정수로 바꾸고, 잘못된 값은 `invalidValues`에 모으세요.",
        "projectCode": """\
rawScores = ["90", "x", "75", "100", "none"]
scores = []
invalidValues = []
for raw in rawScores:
    try:
        scores.append(int(raw))
    except ValueError as exc:
        invalidValues.append(raw)
scores, invalidValues
""",
        "challenge": "잘못된 값이 하나라도 있으면 `ValueError`를 직접 발생시키는 검증 함수를 만들어보세요.",
        "commonMistakes": ["너무 넓은 예외를 조용히 무시하기", "실제 예외 타입과 다른 타입을 잡기", "예외 처리로 정상 조건문을 대신하려 하기"],
    },
    {
        "day": 21,
        "slug": "midReview",
        "title": "중간 종합 복습",
        "focus": "자료구조, 조건문, 반복문, 함수, 파일, 예외를 하나의 흐름으로 묶는다.",
        "outcome": "작은 데이터를 입력받아 정리, 검증, 요약하는 파이프라인을 직접 구성할 수 있다.",
        "why": "문법을 따로 배우는 것과 프로그램을 만드는 것은 다르다. 중간 복습의 목표는 지금까지 배운 도구를 한 문제 안에서 연결하는 것이다.",
        "mentalModel": "프로그램을 데이터 흐름으로 보자. 입력이 들어오고, 정리되고, 검증되고, 요약되어 결과가 된다.",
        "concepts": ["데이터 파이프라인", "검증 함수", "반복 처리", "요약", "작은 설계"],
        "exampleCode": """\
def normalizeName(name):
    return name.strip().title()

rawNames = [" mina ", "JIN", " leo"]
cleanNames = []
for name in rawNames:
    cleanNames.append(normalizeName(name))
cleanNames
""",
        "predictPrompt": "정리 함수가 리스트의 각 값에 적용되면 어떤 결과가 나올까요?",
        "predictCode": """\
def cleanTag(tag):
    return tag.strip().lower()

tags = [" Python ", "COLAB"]
cleanTags = []
for tag in tags:
    cleanTags.append(cleanTag(tag))
cleanTags
""",
        "predictAnswer": "['python', 'colab']",
        "exercisePrompt": "문자열 점수 리스트에서 숫자로 바꿀 수 있는 값만 평균에 포함하세요.",
        "exerciseCode": """\
rawScores = ["80", "bad", "100"]
scores = []
for raw in rawScores:
    try:
        scores.append(...)
    except ValueError as exc:
        skipped = raw
average = sum(scores) / len(scores)
assert average == 90
average
""",
        "solutionCode": """\
rawScores = ["80", "bad", "100"]
scores = []
for raw in rawScores:
    try:
        scores.append(int(raw))
    except ValueError as exc:
        continue
average = sum(scores) / len(scores)
assert average == 90
average
""",
        "bugPrompt": "아래 코드는 잘못된 값을 무시하면서 원인을 기록하지 않습니다. `invalidValues`에 모으도록 고치세요.",
        "bugCode": """\
rawScores = ["80", "bad", "100"]
scores = []
for raw in rawScores:
    try:
        scores.append(int(raw))
    except ValueError as exc:
        continue
invalidValues = []
assert invalidValues == ["bad"]
invalidValues
""",
        "bugFixCode": """\
rawScores = ["80", "bad", "100"]
scores = []
invalidValues = []
for raw in rawScores:
    try:
        scores.append(int(raw))
    except ValueError as exc:
        invalidValues.append(raw)
assert invalidValues == ["bad"]
invalidValues
""",
        "projectPrompt": "간단한 학습 기록 목록에서 완료한 항목 수, 평균 점수, 미완료 항목을 요약하세요.",
        "projectCode": """\
records = [
    {"topic": "variables", "done": True, "score": 90},
    {"topic": "strings", "done": True, "score": 80},
    {"topic": "files", "done": False, "score": None},
]
doneScores = []
pendingTopics = []
for record in records:
    if record["done"]:
        doneScores.append(record["score"])
    else:
        pendingTopics.append(record["topic"])
summary = {
    "doneCount": len(doneScores),
    "average": sum(doneScores) / len(doneScores),
    "pending": pendingTopics,
}
summary
""",
        "challenge": "요약 결과를 JSON 파일로 저장하고 다시 읽어오세요.",
        "commonMistakes": ["복습 문제에서 새 문법을 섞어 쓰기", "잘못된 입력을 기록하지 않고 버리기", "단계별 중간 결과를 확인하지 않기"],
    },
    {
        "day": 22,
        "slug": "classBasics",
        "title": "클래스 기초",
        "focus": "데이터와 동작을 함께 묶는 클래스를 만든다.",
        "outcome": "`class`, `__init__`, `self`, 인스턴스 속성, 메서드를 사용할 수 있다.",
        "why": "딕셔너리로도 데이터를 묶을 수 있지만, 그 데이터가 할 수 있는 동작까지 함께 묶고 싶을 때 클래스가 필요하다. 클래스는 같은 구조의 객체를 반복해서 만들 수 있게 해준다.",
        "mentalModel": "클래스는 설계도이고 인스턴스는 설계도로 만든 실제 물건이다. `self`는 지금 동작 중인 그 물건 자신을 가리킨다.",
        "concepts": ["class", "__init__", "self", "인스턴스", "속성", "메서드"],
        "exampleCode": """\
class Timer:
    def __init__(self, minutes):
        self.minutes = minutes

    def add(self, amount):
        self.minutes = self.minutes + amount
        return self.minutes

timer = Timer(25)
timer.add(5)
""",
        "predictPrompt": "서로 다른 인스턴스는 속성 값을 공유할까요? 아래 결과를 확인하세요.",
        "predictCode": """\
class Note:
    def __init__(self, title):
        self.title = title

first = Note("A")
second = Note("B")
first.title, second.title
""",
        "predictAnswer": "('A', 'B')",
        "exercisePrompt": "`Book` 클래스에 제목과 페이지 수를 저장하고, `isLong` 메서드를 완성하세요.",
        "exerciseCode": """\
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def isLong(self):
        return ...

book = Book("Python", 320)
assert book.isLong() is True
book.isLong()
""",
        "solutionCode": """\
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def isLong(self):
        return self.pages >= 300

book = Book("Python", 320)
assert book.isLong() is True
book.isLong()
""",
        "bugPrompt": "아래 메서드는 `self`를 빼먹었습니다. 인스턴스 메서드 첫 번째 매개변수로 `self`를 넣으세요.",
        "bugCode": """\
class Counter:
    def __init__(self):
        self.count = 0

    def add():
        self.count = self.count + 1
        return self.count

counter = Counter()
counter.add()
""",
        "bugFixCode": """\
class Counter:
    def __init__(self):
        self.count = 0

    def add(self):
        self.count = self.count + 1
        return self.count

counter = Counter()
counter.add()
""",
        "projectPrompt": "할 일 하나를 표현하는 `Task` 클래스를 만들고 완료 처리 메서드를 작성하세요.",
        "projectCode": """\
class Task:
    def __init__(self, title):
        self.title = title
        self.done = False

    def complete(self):
        self.done = True
        return self.done

task = Task("Review Day 22")
task.complete()
task.title, task.done
""",
        "challenge": "`rename` 메서드를 추가해 제목을 바꿀 수 있게 해보세요.",
        "commonMistakes": ["`self`를 빼먹기", "클래스와 인스턴스를 혼동하기", "__init__ 이름을 잘못 쓰기"],
    },
    {
        "day": 23,
        "slug": "classAdvanced",
        "title": "클래스 고급",
        "focus": "상속과 오버라이드로 공통 동작을 확장한다.",
        "outcome": "부모 클래스의 기능을 재사용하고 `super()`로 초기화를 확장할 수 있다.",
        "why": "여러 클래스가 비슷한 속성과 동작을 공유할 때 매번 복사하면 유지보수가 어려워진다. 상속은 공통 부분을 부모로 올리고 차이만 자식에서 표현하게 해준다.",
        "mentalModel": "상속은 '종류' 관계를 표현할 때만 쓰는 것이 좋다. 자식은 부모처럼 행동할 수 있어야 하고, 필요한 부분만 더하거나 바꾼다.",
        "concepts": ["상속", "super", "오버라이드", "다형성", "상속보다 합성 판단"],
        "exampleCode": """\
class Animal:
    def speak(self):
        return "sound"

class Dog(Animal):
    def speak(self):
        return "bark"

pet = Dog()
pet.speak()
""",
        "predictPrompt": "자식 클래스에 같은 이름의 메서드가 있으면 부모 메서드와 어떤 관계가 될까요?",
        "predictCode": """\
class Base:
    def label(self):
        return "base"

class Child(Base):
    def label(self):
        return "child"

Child().label()
""",
        "predictAnswer": "'child'",
        "exercisePrompt": "`PremiumUser`가 `User`를 상속하고 `canExport`가 `True`가 되도록 완성하세요.",
        "exerciseCode": """\
class User:
    def __init__(self, name):
        self.name = name
        self.canExport = False

class PremiumUser(User):
    def __init__(self, name):
        ...
        self.canExport = True

user = PremiumUser("Mina")
assert user.name == "Mina"
assert user.canExport is True
user.name, user.canExport
""",
        "solutionCode": """\
class User:
    def __init__(self, name):
        self.name = name
        self.canExport = False

class PremiumUser(User):
    def __init__(self, name):
        super().__init__(name)
        self.canExport = True

user = PremiumUser("Mina")
assert user.name == "Mina"
assert user.canExport is True
user.name, user.canExport
""",
        "bugPrompt": "아래 자식 클래스는 부모 초기화를 호출하지 않아 `name` 속성이 없습니다. `super()`를 추가하세요.",
        "bugCode": """\
class Member:
    def __init__(self, name):
        self.name = name

class Admin(Member):
    def __init__(self, name):
        self.role = "admin"

admin = Admin("Jin")
admin.name
""",
        "bugFixCode": """\
class Member:
    def __init__(self, name):
        self.name = name

class Admin(Member):
    def __init__(self, name):
        super().__init__(name)
        self.role = "admin"

admin = Admin("Jin")
admin.name
""",
        "projectPrompt": "알림 기본 클래스와 이메일/문자 알림 클래스를 만들고 같은 `send` 메서드 이름으로 다르게 동작하게 하세요.",
        "projectCode": """\
class Notification:
    def __init__(self, message):
        self.message = message

    def send(self):
        return self.message

class EmailNotification(Notification):
    def send(self):
        return f"email: {self.message}"

class SmsNotification(Notification):
    def send(self):
        return f"sms: {self.message}"

messages = [EmailNotification("Hi"), SmsNotification("Hi")]
[message.send() for message in messages]
""",
        "challenge": "새로운 `PushNotification` 클래스를 추가해 같은 리스트에서 동작하게 해보세요.",
        "commonMistakes": ["공통 코드 복사로 상속 효과를 없애기", "`super().__init__` 호출을 빼먹기", "상속이 맞지 않는 관계에 억지로 쓰기"],
    },
    {
        "day": 24,
        "slug": "specialMethods",
        "title": "특수 메서드",
        "focus": "객체가 파이썬 문법과 자연스럽게 어울리게 만든다.",
        "outcome": "`__str__`, `__repr__`, `__len__`, `__eq__`, `__add__`, `__getitem__`의 역할을 이해한다.",
        "why": "특수 메서드는 객체가 `len(obj)`, `obj1 + obj2`, `obj[0]` 같은 파이썬 표준 문법에 반응하게 만든다. 잘 쓰면 직접 만든 객체도 내장 타입처럼 자연스럽게 다룰 수 있다.",
        "mentalModel": "특수 메서드는 파이썬이 특정 문법을 만났을 때 대신 호출하는 약속된 이름이다. 직접 자주 호출하기보다 문법을 통해 호출되게 둔다.",
        "concepts": ["__str__", "__repr__", "__len__", "__eq__", "__add__", "__getitem__"],
        "exampleCode": """\
class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

playlist = Playlist(["intro", "loop"])
len(playlist)
""",
        "predictPrompt": "`str(obj)`가 호출될 때 어떤 특수 메서드가 쓰이는지 확인하세요.",
        "predictCode": """\
class Label:
    def __str__(self):
        return "custom label"

str(Label())
""",
        "predictAnswer": "'custom label'",
        "exercisePrompt": "`Point` 두 개가 같은 좌표면 같다고 판단하도록 `__eq__`를 완성하세요.",
        "exerciseCode": """\
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return ...

assert Point(1, 2) == Point(1, 2)
Point(1, 2) == Point(2, 1)
""",
        "solutionCode": """\
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

assert Point(1, 2) == Point(1, 2)
Point(1, 2) == Point(2, 1)
""",
        "bugPrompt": "아래 클래스는 `len(box)`를 쓰려 하지만 `__len__`이 문자열을 반환합니다. 정수를 반환하도록 고치세요.",
        "bugCode": """\
class Box:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return "many"

box = Box([1, 2, 3])
len(box)
""",
        "bugFixCode": """\
class Box:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

box = Box([1, 2, 3])
len(box)
""",
        "projectPrompt": "장바구니 클래스를 만들고 `len(cart)`, `cart[0]`, `str(cart)`가 동작하게 하세요.",
        "projectCode": """\
class Cart:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

    def __getitem__(self, index):
        return self.items[index]

    def __str__(self):
        return f"Cart({len(self)} items)"

cart = Cart(["coffee", "tea"])
len(cart), cart[0], str(cart)
""",
        "challenge": "`__add__`를 추가해 장바구니끼리 합칠 수 있게 해보세요.",
        "commonMistakes": ["특수 메서드 이름의 밑줄 개수를 틀리기", "`__len__`에서 정수가 아닌 값을 반환하기", "`__repr__`와 `__str__`의 목적을 구분하지 않기"],
    },
    {
        "day": 25,
        "slug": "propertyDecorator",
        "title": "프로퍼티와 데코레이터",
        "focus": "속성처럼 보이지만 검증과 계산을 포함하는 인터페이스를 만든다.",
        "outcome": "`@property`, setter, `@staticmethod`, `@classmethod`, 기본 데코레이터 구조를 이해한다.",
        "why": "사용자는 `obj.value`처럼 단순하게 쓰고 싶지만, 내부에서는 검증이나 계산이 필요할 때가 있다. 프로퍼티는 깔끔한 사용법과 안전한 내부 로직을 함께 제공한다.",
        "mentalModel": "프로퍼티는 메서드를 속성처럼 보이게 하는 약속이다. 외부 사용법은 단순하게 유지하고 내부 구현은 바꿀 수 있다.",
        "concepts": ["@property", "setter", "staticmethod", "classmethod", "함수 데코레이터"],
        "exampleCode": """\
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32

temp = Temperature(20)
temp.fahrenheit
""",
        "predictPrompt": "`@property`가 붙은 메서드는 괄호 없이 접근합니다.",
        "predictCode": """\
class User:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def fullName(self):
        return f"{self.first} {self.last}"

User("Ada", "Lovelace").fullName
""",
        "predictAnswer": "'Ada Lovelace'",
        "exercisePrompt": "`Score`의 `value` setter에서 0 이상 100 이하만 허용하세요.",
        "exerciseCode": """\
class Score:
    def __init__(self, value):
        self.value = value

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, newValue):
        if ...:
            raise ValueError("score must be 0..100")
        self._value = newValue

score = Score(90)
assert score.value == 90
score.value
""",
        "solutionCode": """\
class Score:
    def __init__(self, value):
        self.value = value

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, newValue):
        if newValue < 0 or newValue > 100:
            raise ValueError("score must be 0..100")
        self._value = newValue

score = Score(90)
assert score.value == 90
score.value
""",
        "bugPrompt": "아래 코드는 프로퍼티에 괄호를 붙여 호출합니다. 속성처럼 접근하도록 고치세요.",
        "bugCode": """\
class Product:
    def __init__(self, price):
        self.price = price

    @property
    def salePrice(self):
        return int(self.price * 0.9)

product = Product(10000)
product.salePrice()
""",
        "bugFixCode": """\
class Product:
    def __init__(self, price):
        self.price = price

    @property
    def salePrice(self):
        return int(self.price * 0.9)

product = Product(10000)
product.salePrice
""",
        "projectPrompt": "상품 클래스에 할인 가격 프로퍼티와 문자열에서 상품을 만드는 클래스 메서드를 추가하세요.",
        "projectCode": """\
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    @property
    def salePrice(self):
        return int(self.price * 0.8)

    @classmethod
    def fromText(cls, text):
        name, price = text.split(":")
        return cls(name, int(price))

product = Product.fromText("book:15000")
product.name, product.salePrice
""",
        "challenge": "`@staticmethod`으로 가격이 양수인지 검사하는 함수를 추가해보세요.",
        "commonMistakes": ["프로퍼티를 메서드처럼 호출하기", "setter 내부에서 같은 프로퍼티에 다시 대입해 무한 재귀 만들기", "데코레이터가 함수를 감싸는 구조를 잊기"],
    },
    {
        "day": 26,
        "slug": "comprehensions",
        "title": "컴프리헨션",
        "focus": "반복과 조건을 짧고 읽기 쉬운 데이터 변환식으로 쓴다.",
        "outcome": "리스트, 딕셔너리, 집합 컴프리헨션을 사용해 데이터를 변환하고 필터링할 수 있다.",
        "why": "컴프리헨션은 반복문을 무조건 줄이는 기술이 아니라, '무엇을 만들 것인가'가 분명할 때 코드를 선명하게 만드는 기술이다.",
        "mentalModel": "컴프리헨션은 결과 모양을 맨 앞에 쓰고, 뒤에서 데이터를 하나씩 꺼내며, 필요하면 조건으로 거른다.",
        "concepts": ["리스트 컴프리헨션", "조건 필터", "딕셔너리 컴프리헨션", "집합 컴프리헨션", "중첩 컴프리헨션"],
        "exampleCode": """\
prices = [1000, 2500, 4000]
salePrices = [int(price * 0.9) for price in prices]
salePrices
""",
        "predictPrompt": "`[num * num for num in range(4)]`의 결과를 예측하세요.",
        "predictCode": """\
[num * num for num in range(4)]
""",
        "predictAnswer": "[0, 1, 4, 9]",
        "exercisePrompt": "`words`에서 길이가 5 이상인 단어만 소문자로 모으세요.",
        "exerciseCode": """\
words = ["Python", "go", "Colab", "R"]
longWords = [...]
assert longWords == ["python", "colab"]
longWords
""",
        "solutionCode": """\
words = ["Python", "go", "Colab", "R"]
longWords = [word.lower() for word in words if len(word) >= 5]
assert longWords == ["python", "colab"]
longWords
""",
        "bugPrompt": "아래 딕셔너리 컴프리헨션은 키와 값을 반대로 만들었습니다. 단어를 키, 길이를 값으로 고치세요.",
        "bugCode": """\
words = ["cat", "python"]
lengthMap = {len(word): word for word in words}
assert lengthMap == {"cat": 3, "python": 6}
lengthMap
""",
        "bugFixCode": """\
words = ["cat", "python"]
lengthMap = {word: len(word) for word in words}
assert lengthMap == {"cat": 3, "python": 6}
lengthMap
""",
        "projectPrompt": "주문 목록에서 결제 완료된 주문만 골라 상품명과 할인 금액 딕셔너리를 만드세요.",
        "projectCode": """\
orders = [
    {"name": "coffee", "price": 5000, "paid": True},
    {"name": "tea", "price": 4000, "paid": False},
    {"name": "cake", "price": 7000, "paid": True},
]
saleMap = {order["name"]: int(order["price"] * 0.9) for order in orders if order["paid"]}
saleMap
""",
        "challenge": "같은 로직을 일반 for문으로 다시 작성해 가독성을 비교해보세요.",
        "commonMistakes": ["너무 복잡한 로직을 한 줄에 우겨 넣기", "결과 표현식과 반복 변수를 혼동하기", "딕셔너리 컴프리헨션에서 키와 값 위치를 바꾸기"],
    },
    {
        "day": 27,
        "slug": "generatorsIterators",
        "title": "제너레이터와 이터레이터",
        "focus": "필요할 때 하나씩 값을 만들어 메모리를 아끼는 흐름을 이해한다.",
        "outcome": "`yield`, `iter`, `next`, 이터레이터 프로토콜을 사용해 지연 계산을 설명할 수 있다.",
        "why": "모든 값을 한 번에 리스트로 만들 필요는 없다. 데이터가 크거나 끝이 없을 수 있을 때 제너레이터는 필요한 만큼만 계산하게 해준다.",
        "mentalModel": "제너레이터는 멈췄다가 이어지는 함수다. `yield`에서 값을 하나 내보내고, 다음 요청이 올 때 그 자리부터 다시 시작한다.",
        "concepts": ["yield", "제너레이터", "next", "iter", "이터레이터 프로토콜", "지연 평가"],
        "exampleCode": """\
def countdown(start):
    current = start
    while current > 0:
        yield current
        current = current - 1

list(countdown(3))
""",
        "predictPrompt": "`next`를 두 번 호출하면 제너레이터가 어디까지 진행될까요?",
        "predictCode": """\
def makeNums():
    yield 1
    yield 2
    yield 3

nums = makeNums()
first = next(nums)
second = next(nums)
first, second
""",
        "predictAnswer": "(1, 2)",
        "exercisePrompt": "0부터 `limit - 1`까지 짝수만 내보내는 `evenNumbers`를 완성하세요.",
        "exerciseCode": """\
def evenNumbers(limit):
    for num in range(limit):
        if ...:
            yield num

result = list(evenNumbers(7))
assert result == [0, 2, 4, 6]
result
""",
        "solutionCode": """\
def evenNumbers(limit):
    for num in range(limit):
        if num % 2 == 0:
            yield num

result = list(evenNumbers(7))
assert result == [0, 2, 4, 6]
result
""",
        "bugPrompt": "아래 코드는 제너레이터를 한 번 소비한 뒤 다시 쓰려고 합니다. 새 제너레이터를 만들거나 리스트로 보관하세요.",
        "bugCode": """\
values = (num for num in range(3))
firstList = list(values)
secondList = list(values)
assert secondList == [0, 1, 2]
secondList
""",
        "bugFixCode": """\
values = (num for num in range(3))
firstList = list(values)
values = (num for num in range(3))
secondList = list(values)
assert secondList == [0, 1, 2]
secondList
""",
        "projectPrompt": "로그 문자열 리스트에서 `ERROR`가 들어간 줄만 하나씩 내보내는 제너레이터를 만드세요.",
        "projectCode": """\
def errorLines(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

logs = ["INFO start", "ERROR missing", "INFO end", "ERROR timeout"]
list(errorLines(logs))
""",
        "challenge": "`next`와 `try/except StopIteration`으로 직접 하나씩 꺼내보세요.",
        "commonMistakes": ["제너레이터를 리스트처럼 여러 번 재사용하려 하기", "`yield`와 `return`의 차이를 놓치기", "지연 평가 때문에 아직 실행되지 않았다는 점을 잊기"],
    },
    {
        "day": 28,
        "slug": "advancedSyntaxReview",
        "title": "고급 문법 종합",
        "focus": "컨텍스트 매니저와 지금까지의 고급 문법을 연결한다.",
        "outcome": "`with` 문이 자원 획득과 정리를 어떻게 보장하는지 이해하고 직접 구현할 수 있다.",
        "why": "파일, 연결, 임시 상태처럼 시작과 끝이 분명한 작업은 정리가 중요하다. 컨텍스트 매니저는 성공하든 실패하든 마무리 코드를 실행하게 만든다.",
        "mentalModel": "`with`는 입장과 퇴장을 가진 안전 구역이다. `__enter__`가 시작을 맡고 `__exit__`가 마무리를 맡는다.",
        "concepts": ["with 문", "__enter__", "__exit__", "contextlib", "정리 보장", "고급 문법 연결"],
        "exampleCode": """\
from contextlib import contextmanager

@contextmanager
def section(name):
    result = f"enter {name}"
    yield result

with section("study") as message:
    output = message.upper()
output
""",
        "predictPrompt": "`with` 블록 안에서 만든 결과가 블록 밖 변수에 저장되면 어떻게 보일까요?",
        "predictCode": """\
from contextlib import contextmanager

@contextmanager
def label(text):
    yield f"[{text}]"

with label("run") as tag:
    result = tag + " done"
result
""",
        "predictAnswer": "'[run] done'",
        "exercisePrompt": "`TimerLabel` 컨텍스트 매니저의 `__enter__`가 라벨 문자열을 반환하도록 완성하세요.",
        "exerciseCode": """\
class TimerLabel:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        return ...

    def __exit__(self, excType, exc, trace):
        return False

with TimerLabel("practice") as label:
    timerResult = label
assert timerResult == "start practice"
timerResult
""",
        "solutionCode": """\
class TimerLabel:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        return f"start {self.name}"

    def __exit__(self, excType, exc, trace):
        return False

with TimerLabel("practice") as label:
    timerResult = label
assert timerResult == "start practice"
timerResult
""",
        "bugPrompt": "아래 컨텍스트 매니저는 `__exit__` 이름을 잘못 써서 동작하지 않습니다. 특수 메서드 이름을 고치세요.",
        "bugCode": """\
class OpenClose:
    def __enter__(self):
        return "open"

    def exit(self, excType, exc, trace):
        return False

with OpenClose() as state:
    result = state
result
""",
        "bugFixCode": """\
class OpenClose:
    def __enter__(self):
        return "open"

    def __exit__(self, excType, exc, trace):
        return False

with OpenClose() as state:
    result = state
result
""",
        "projectPrompt": "임시 설정을 켰다가 블록이 끝나면 원래 값으로 되돌리는 컨텍스트 매니저를 만드세요.",
        "projectCode": """\
class TemporaryMode:
    def __init__(self, settings, value):
        self.settings = settings
        self.value = value
        self.previous = settings["mode"]

    def __enter__(self):
        self.settings["mode"] = self.value
        return self.settings

    def __exit__(self, excType, exc, trace):
        self.settings["mode"] = self.previous
        return False

settings = {"mode": "normal"}
with TemporaryMode(settings, "debug") as current:
    inside = current["mode"]
outside = settings["mode"]
inside, outside
""",
        "challenge": "블록 안에서 예외가 발생해도 `outside`가 복구되는지 실험해보세요.",
        "commonMistakes": ["특수 메서드 이름을 틀리기", "`__exit__` 반환값이 예외 처리에 영향을 준다는 점을 모르는 것", "정리 로직을 블록 안쪽에만 두기"],
    },
    {
        "day": 29,
        "slug": "algorithmPractice",
        "title": "알고리즘 연습",
        "focus": "문제를 작게 나누고 자료구조를 선택해 해결한다.",
        "outcome": "정렬, 탐색, 빈도 계산, 재귀의 기본 패턴을 문제에 적용할 수 있다.",
        "why": "알고리즘은 어려운 공식 암기가 아니라 문제를 다루는 습관이다. 입력 크기, 필요한 결과, 반복되는 구조를 보면 어떤 도구가 맞는지 판단할 수 있다.",
        "mentalModel": "먼저 손으로 작은 예제를 풀고, 그 과정을 코드로 옮긴다. 코드부터 쓰면 문제의 규칙을 놓치기 쉽다.",
        "concepts": ["문제 분석", "정렬", "선형 탐색", "딕셔너리 빈도", "재귀", "복잡도 감각"],
        "exampleCode": """\
numbers = [4, 1, 7, 1, 4, 4]
counts = {}
for num in numbers:
    counts[num] = counts.get(num, 0) + 1
counts
""",
        "predictPrompt": "최댓값을 찾는 반복문에서 `best`가 언제 바뀌는지 추적하세요.",
        "predictCode": """\
numbers = [3, 8, 2, 10]
best = numbers[0]
for num in numbers:
    if num > best:
        best = num
best
""",
        "predictAnswer": "10",
        "exercisePrompt": "리스트에서 가장 자주 등장한 값을 반환하는 `mostCommon` 함수를 완성하세요.",
        "exerciseCode": """\
def mostCommon(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    bestItem = None
    bestCount = 0
    for item, count in counts.items():
        if ...:
            bestItem = item
            bestCount = count
    return bestItem

result = mostCommon(["a", "b", "a", "c", "a"])
assert result == "a"
result
""",
        "solutionCode": """\
def mostCommon(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    bestItem = None
    bestCount = 0
    for item, count in counts.items():
        if count > bestCount:
            bestItem = item
            bestCount = count
    return bestItem

result = mostCommon(["a", "b", "a", "c", "a"])
assert result == "a"
result
""",
        "bugPrompt": "아래 이진 탐색은 `right` 초기값이 범위를 벗어납니다. 마지막 인덱스로 고치세요.",
        "bugCode": """\
def binarySearch(nums, target):
    left = 0
    right = len(nums)
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

binarySearch([1, 3, 5], 5)
""",
        "bugFixCode": """\
def binarySearch(nums, target):
    left = 0
    right = len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

binarySearch([1, 3, 5], 5)
""",
        "projectPrompt": "주문 금액 리스트에서 기준 금액 이상인 주문의 개수와 총액을 반환하는 함수를 만드세요.",
        "projectCode": """\
def summarizeLargeOrders(orders, limit):
    count = 0
    total = 0
    for order in orders:
        if order >= limit:
            count = count + 1
            total = total + order
    return {"count": count, "total": total}

summarizeLargeOrders([8000, 12000, 23000, 5000], 10000)
""",
        "challenge": "같은 함수를 컴프리헨션과 `sum`으로 다시 작성해보세요.",
        "commonMistakes": ["작은 예제를 손으로 풀지 않고 코드부터 쓰기", "경계 인덱스를 하나씩 틀리기", "빈 입력 리스트를 고려하지 않기"],
    },
    {
        "day": 30,
        "slug": "finalProject",
        "title": "최종 프로젝트",
        "focus": "30일 동안 배운 문법으로 작은 학습 리포트 프로그램을 완성한다.",
        "outcome": "데이터 구조 설계, 함수 분리, 클래스, 예외 처리, 파일 저장을 포함한 하나의 프로그램을 만들 수 있다.",
        "why": "마지막 날의 목표는 새 문법을 더 배우는 것이 아니라 배운 것을 연결해 결과물을 만드는 것이다. 완성된 작은 프로그램 하나가 문법 목록보다 오래 기억에 남는다.",
        "mentalModel": "프로젝트는 한 번에 완성하지 않는다. 데이터 모델, 계산 함수, 표시 함수, 저장 흐름으로 나누어 작은 조각을 검증하며 합친다.",
        "concepts": ["요구사항 분해", "데이터 모델", "함수 분리", "클래스", "파일 저장", "최종 점검"],
        "exampleCode": """\
records = [
    {"day": 1, "topic": "hello", "minutes": 25, "done": True},
    {"day": 2, "topic": "variables", "minutes": 40, "done": True},
]
totalMinutes = sum(record["minutes"] for record in records)
totalMinutes
""",
        "predictPrompt": "완료율은 `완료한 항목 수 / 전체 항목 수`입니다. 아래 결과를 예측하세요.",
        "predictCode": """\
records = [
    {"done": True},
    {"done": False},
    {"done": True},
]
doneCount = sum(1 for record in records if record["done"])
doneCount / len(records)
""",
        "predictAnswer": "0.6666666666666666",
        "exercisePrompt": "`StudyRecord` 클래스의 `isLongSession` 메서드를 완성하세요.",
        "exerciseCode": """\
class StudyRecord:
    def __init__(self, day, topic, minutes, done):
        self.day = day
        self.topic = topic
        self.minutes = minutes
        self.done = done

    def isLongSession(self):
        return ...

record = StudyRecord(30, "final project", 80, True)
assert record.isLongSession() is True
record.isLongSession()
""",
        "solutionCode": """\
class StudyRecord:
    def __init__(self, day, topic, minutes, done):
        self.day = day
        self.topic = topic
        self.minutes = minutes
        self.done = done

    def isLongSession(self):
        return self.minutes >= 60

record = StudyRecord(30, "final project", 80, True)
assert record.isLongSession() is True
record.isLongSession()
""",
        "bugPrompt": "아래 요약 함수는 완료하지 않은 항목까지 평균에 포함합니다. 완료한 항목만 사용하도록 고치세요.",
        "bugCode": """\
def averageDoneMinutes(records):
    minutes = [record["minutes"] for record in records]
    return sum(minutes) / len(minutes)

records = [
    {"minutes": 30, "done": True},
    {"minutes": 100, "done": False},
    {"minutes": 50, "done": True},
]
assert averageDoneMinutes(records) == 40
averageDoneMinutes(records)
""",
        "bugFixCode": """\
def averageDoneMinutes(records):
    minutes = [record["minutes"] for record in records if record["done"]]
    return sum(minutes) / len(minutes)

records = [
    {"minutes": 30, "done": True},
    {"minutes": 100, "done": False},
    {"minutes": 50, "done": True},
]
assert averageDoneMinutes(records) == 40
averageDoneMinutes(records)
""",
        "projectPrompt": "최종 프로젝트: 30일 학습 기록을 요약하는 리포트 프로그램을 완성하세요. 아래 시작 코드를 확장해 JSON 저장까지 수행합니다.",
        "projectCode": """\
from pathlib import Path
import json

class StudyRecord:
    def __init__(self, day, topic, minutes, done):
        self.day = day
        self.topic = topic
        self.minutes = minutes
        self.done = done

    def toDict(self):
        return {
            "day": self.day,
            "topic": self.topic,
            "minutes": self.minutes,
            "done": self.done,
        }

def summarize(records):
    doneRecords = [record for record in records if record.done]
    totalMinutes = sum(record.minutes for record in records)
    doneMinutes = sum(record.minutes for record in doneRecords)
    return {
        "totalDays": len(records),
        "doneDays": len(doneRecords),
        "completionRate": round(len(doneRecords) / len(records), 2),
        "totalMinutes": totalMinutes,
        "doneMinutes": doneMinutes,
    }

records = [
    StudyRecord(1, "hello", 25, True),
    StudyRecord(2, "variables", 40, True),
    StudyRecord(30, "final project", 90, True),
]
report = summarize(records)
payload = {
    "records": [record.toDict() for record in records],
    "report": report,
}
Path("python30Report.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
report
""",
        "challenge": "미완료 항목, 최장 학습일, 다음 복습 추천 주제를 리포트에 추가하세요.",
        "commonMistakes": ["프로젝트를 한 셀에 모두 작성해 검증하기 어렵게 만들기", "데이터 구조를 먼저 정하지 않고 함수부터 쓰기", "파일 저장 결과를 다시 읽어 검증하지 않기"],
    },
]


TRANSFER_PRACTICE = {
    1: {
        "prompt": "다른 인사 문장을 직접 만들어보세요. `intro`가 정확히 `I run Python today.`가 되어야 합니다.",
        "code": """\
intro = ...
assert intro == "I run Python today."
intro
""",
        "solution": """\
intro = "I run Python today."
assert intro == "I run Python today."
intro
""",
    },
    2: {
        "prompt": "학습 시간을 분 단위에서 시간 단위로 바꾸세요. 나눗셈 결과는 실수입니다.",
        "code": """\
studyMinutes = 90
studyHours = ...
assert studyHours == 1.5
studyHours
""",
        "solution": """\
studyMinutes = 90
studyHours = studyMinutes / 60
assert studyHours == 1.5
studyHours
""",
    },
    3: {
        "prompt": "무료 배송 조건을 판단하세요. 주문 금액이 30000 이상이거나 VIP면 무료 배송입니다.",
        "code": """\
orderAmount = 22000
isVip = True
freeShipping = ...
assert freeShipping is True
freeShipping
""",
        "solution": """\
orderAmount = 22000
isVip = True
freeShipping = orderAmount >= 30000 or isVip
assert freeShipping is True
freeShipping
""",
    },
    4: {
        "prompt": "이름과 남은 미션 수를 사용해 `Noa has 3 missions left.` 문장을 만드세요.",
        "code": """\
learner = "Noa"
left = 3
status = ...
assert status == "Noa has 3 missions left."
status
""",
        "solution": """\
learner = "Noa"
left = 3
status = f"{learner} has {left} missions left."
assert status == "Noa has 3 missions left."
status
""",
    },
    5: {
        "prompt": "날짜 문자열에서 연도, 월, 일을 각각 슬라이스하세요.",
        "code": """\
dateText = "2026-05-17"
year = ...
month = ...
day = ...
assert (year, month, day) == ("2026", "05", "17")
year, month, day
""",
        "solution": """\
dateText = "2026-05-17"
year = dateText[:4]
month = dateText[5:7]
day = dateText[8:]
assert (year, month, day) == ("2026", "05", "17")
year, month, day
""",
    },
    6: {
        "prompt": "입력 문장을 검색용 slug로 정리하세요. 앞뒤 공백 제거, 소문자 변환, 공백을 하이픈으로 바꾸는 순서입니다.",
        "code": """\
rawTitle = "  Python Practice Plan  "
slug = ...
assert slug == "python-practice-plan"
slug
""",
        "solution": """\
rawTitle = "  Python Practice Plan  "
slug = rawTitle.strip().lower().replace(" ", "-")
assert slug == "python-practice-plan"
slug
""",
    },
    7: {
        "prompt": "리스트에서 첫 번째와 마지막 주제를 꺼내 튜플처럼 함께 출력하세요.",
        "code": """\
topics = ["strings", "lists", "loops", "functions"]
firstTopic = ...
lastTopic = ...
assert firstTopic == "strings"
assert lastTopic == "functions"
firstTopic, lastTopic
""",
        "solution": """\
topics = ["strings", "lists", "loops", "functions"]
firstTopic = topics[0]
lastTopic = topics[-1]
assert firstTopic == "strings"
assert lastTopic == "functions"
firstTopic, lastTopic
""",
    },
    8: {
        "prompt": "작업 목록에 `test`를 추가하고, 가장 앞 작업을 꺼내세요.",
        "code": """\
tasks = ["plan", "write"]
tasks.append(...)
firstTask = tasks.pop(...)
assert firstTask == "plan"
assert tasks == ["write", "test"]
firstTask, tasks
""",
        "solution": """\
tasks = ["plan", "write"]
tasks.append("test")
firstTask = tasks.pop(0)
assert firstTask == "plan"
assert tasks == ["write", "test"]
firstTask, tasks
""",
    },
    9: {
        "prompt": "튜플로 묶인 좌표를 언패킹하고, 두 좌표의 합을 구하세요.",
        "code": """\
position = (12, 8)
...
total = x + y
assert total == 20
total
""",
        "solution": """\
position = (12, 8)
x, y = position
total = x + y
assert total == 20
total
""",
    },
    10: {
        "prompt": "두 그룹에 모두 속한 사람과 어느 한쪽에만 속한 전체 사람을 구하세요.",
        "code": """\
morning = {"Ari", "Bo", "Chen"}
evening = {"Bo", "Dana"}
both = ...
allPeople = ...
assert both == {"Bo"}
assert allPeople == {"Ari", "Bo", "Chen", "Dana"}
both, allPeople
""",
        "solution": """\
morning = {"Ari", "Bo", "Chen"}
evening = {"Bo", "Dana"}
both = morning & evening
allPeople = morning | evening
assert both == {"Bo"}
assert allPeople == {"Ari", "Bo", "Chen", "Dana"}
both, allPeople
""",
    },
    11: {
        "prompt": "딕셔너리에 새 키를 추가하고 기존 값을 수정하세요.",
        "code": """\
profile = {"name": "Mina", "level": 2}
...
...
assert profile == {"name": "Mina", "level": 3, "active": True}
profile
""",
        "solution": """\
profile = {"name": "Mina", "level": 2}
profile["level"] = 3
profile["active"] = True
assert profile == {"name": "Mina", "level": 3, "active": True}
profile
""",
    },
    12: {
        "prompt": "없는 키를 안전하게 읽고, 여러 설정을 한 번에 업데이트하세요.",
        "code": """\
settings = {"theme": "light"}
language = ...
settings.update(...)
assert language == "ko"
assert settings["theme"] == "dark"
settings
""",
        "solution": """\
settings = {"theme": "light"}
language = settings.get("language", "ko")
settings.update({"theme": "dark", "fontSize": 16})
assert language == "ko"
assert settings["theme"] == "dark"
settings
""",
    },
    13: {
        "prompt": "점수에 따라 `excellent`, `pass`, `retry` 중 하나를 고르세요.",
        "code": """\
score = 72
if ...:
    scoreLabel = "excellent"
elif ...:
    scoreLabel = "pass"
else:
    scoreLabel = "retry"
assert scoreLabel == "pass"
scoreLabel
""",
        "solution": """\
score = 72
if score >= 90:
    scoreLabel = "excellent"
elif score >= 60:
    scoreLabel = "pass"
else:
    scoreLabel = "retry"
assert scoreLabel == "pass"
scoreLabel
""",
    },
    14: {
        "prompt": "문자열 목록에서 길이가 5 이상인 단어만 모으세요.",
        "code": """\
words = ["py", "colab", "notebook", "go"]
longWords = []
for word in words:
    if ...:
        longWords.append(word)
assert longWords == ["colab", "notebook"]
longWords
""",
        "solution": """\
words = ["py", "colab", "notebook", "go"]
longWords = []
for word in words:
    if len(word) >= 5:
        longWords.append(word)
assert longWords == ["colab", "notebook"]
longWords
""",
    },
    15: {
        "prompt": "가격과 수량을 받아 총액을 반환하는 함수를 작성하세요.",
        "code": """\
def orderTotal(price, count):
    ...

result = orderTotal(4500, 3)
assert result == 13500
result
""",
        "solution": """\
def orderTotal(price, count):
    return price * count

result = orderTotal(4500, 3)
assert result == 13500
result
""",
    },
    16: {
        "prompt": "기본 배송비가 있는 결제 함수를 만들고 키워드 인자로 배송비를 바꿔보세요.",
        "code": """\
def pay(price, fee=3000):
    return ...

basic = pay(10000)
express = pay(10000, fee=5000)
assert (basic, express) == (13000, 15000)
basic, express
""",
        "solution": """\
def pay(price, fee=3000):
    return price + fee

basic = pay(10000)
express = pay(10000, fee=5000)
assert (basic, express) == (13000, 15000)
basic, express
""",
    },
    17: {
        "prompt": "클로저로 접두어를 기억하는 formatter를 만드세요.",
        "code": """\
def makeFormatter(prefix):
    def formatText(text):
        return ...
    return formatText

errorFormat = makeFormatter("ERROR")
result = errorFormat("missing file")
assert result == "ERROR: missing file"
result
""",
        "solution": """\
def makeFormatter(prefix):
    def formatText(text):
        return f"{prefix}: {text}"
    return formatText

errorFormat = makeFormatter("ERROR")
result = errorFormat("missing file")
assert result == "ERROR: missing file"
result
""",
    },
    18: {
        "prompt": "`random`에 seed를 주고 1부터 6 사이의 숫자를 만드세요.",
        "code": """\
import random

random.seed(3)
dice = ...
assert 1 <= dice <= 6
dice
""",
        "solution": """\
import random

random.seed(3)
dice = random.randint(1, 6)
assert 1 <= dice <= 6
dice
""",
    },
    19: {
        "prompt": "텍스트 파일에 두 줄을 저장하고 다시 읽어 줄 수를 확인하세요.",
        "code": """\
from pathlib import Path

path = Path("lines.txt")
path.write_text(..., encoding="utf-8")
lines = path.read_text(encoding="utf-8").splitlines()
assert len(lines) == 2
lines
""",
        "solution": """\
from pathlib import Path

path = Path("lines.txt")
path.write_text("first\\nsecond", encoding="utf-8")
lines = path.read_text(encoding="utf-8").splitlines()
assert len(lines) == 2
lines
""",
    },
    20: {
        "prompt": "0으로 나누는 경우를 잡아 `None`을 반환하는 함수를 작성하세요.",
        "code": """\
def safeDivide(a, b):
    try:
        return ...
    except ... as exc:
        return None

assert safeDivide(10, 2) == 5
assert safeDivide(10, 0) is None
safeDivide(10, 0)
""",
        "solution": """\
def safeDivide(a, b):
    try:
        return a / b
    except ZeroDivisionError as exc:
        return None

assert safeDivide(10, 2) == 5
assert safeDivide(10, 0) is None
safeDivide(10, 0)
""",
    },
    21: {
        "prompt": "학습 기록을 정리해 완료한 주제만 깔끔한 이름으로 모으세요.",
        "code": """\
records = [
    {"topic": " strings ", "done": True},
    {"topic": "files", "done": False},
    {"topic": " LOOPS ", "done": True},
]
doneTopics = []
for record in records:
    if ...:
        doneTopics.append(...)
assert doneTopics == ["Strings", "Loops"]
doneTopics
""",
        "solution": """\
records = [
    {"topic": " strings ", "done": True},
    {"topic": "files", "done": False},
    {"topic": " LOOPS ", "done": True},
]
doneTopics = []
for record in records:
    if record["done"]:
        doneTopics.append(record["topic"].strip().title())
assert doneTopics == ["Strings", "Loops"]
doneTopics
""",
    },
    22: {
        "prompt": "작은 `Habit` 클래스를 만들고 완료 횟수를 1 늘리는 메서드를 작성하세요.",
        "code": """\
class Habit:
    def __init__(self, name):
        self.name = name
        self.count = 0

    def complete(self):
        ...
        return self.count

habit = Habit("practice")
assert habit.complete() == 1
habit.name, habit.count
""",
        "solution": """\
class Habit:
    def __init__(self, name):
        self.name = name
        self.count = 0

    def complete(self):
        self.count = self.count + 1
        return self.count

habit = Habit("practice")
assert habit.complete() == 1
habit.name, habit.count
""",
    },
    23: {
        "prompt": "부모 클래스의 초기화를 재사용해 관리자 사용자를 만드세요.",
        "code": """\
class User:
    def __init__(self, name):
        self.name = name

class Admin(User):
    def __init__(self, name):
        ...
        self.role = "admin"

admin = Admin("Noa")
assert (admin.name, admin.role) == ("Noa", "admin")
admin.name, admin.role
""",
        "solution": """\
class User:
    def __init__(self, name):
        self.name = name

class Admin(User):
    def __init__(self, name):
        super().__init__(name)
        self.role = "admin"

admin = Admin("Noa")
assert (admin.name, admin.role) == ("Noa", "admin")
admin.name, admin.role
""",
    },
    24: {
        "prompt": "`len()`이 직접 만든 클래스에서 동작하도록 특수 메서드를 추가하세요.",
        "code": """\
class Stack:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return ...

stack = Stack(["a", "b", "c"])
assert len(stack) == 3
len(stack)
""",
        "solution": """\
class Stack:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

stack = Stack(["a", "b", "c"])
assert len(stack) == 3
len(stack)
""",
    },
    25: {
        "prompt": "`@property`로 전체 이름을 계산하세요.",
        "code": """\
class Person:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def fullName(self):
        return ...

person = Person("Ada", "Lovelace")
assert person.fullName == "Ada Lovelace"
person.fullName
""",
        "solution": """\
class Person:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def fullName(self):
        return f"{self.first} {self.last}"

person = Person("Ada", "Lovelace")
assert person.fullName == "Ada Lovelace"
person.fullName
""",
    },
    26: {
        "prompt": "컴프리헨션으로 짝수의 제곱만 모으세요.",
        "code": """\
numbers = [1, 2, 3, 4, 5, 6]
evenSquares = [...]
assert evenSquares == [4, 16, 36]
evenSquares
""",
        "solution": """\
numbers = [1, 2, 3, 4, 5, 6]
evenSquares = [num * num for num in numbers if num % 2 == 0]
assert evenSquares == [4, 16, 36]
evenSquares
""",
    },
    27: {
        "prompt": "제너레이터로 특정 길이 이상의 단어만 하나씩 내보내세요.",
        "code": """\
def longWords(words, minLength):
    for word in words:
        if ...:
            yield word

result = list(longWords(["py", "colab", "python"], 5))
assert result == ["colab", "python"]
result
""",
        "solution": """\
def longWords(words, minLength):
    for word in words:
        if len(word) >= minLength:
            yield word

result = list(longWords(["py", "colab", "python"], 5))
assert result == ["colab", "python"]
result
""",
    },
    28: {
        "prompt": "컨텍스트 매니저가 들어갈 때와 나올 때 상태를 바꾸도록 작성하세요.",
        "code": """\
class Flag:
    def __init__(self):
        self.active = False

    def __enter__(self):
        ...
        return self

    def __exit__(self, excType, exc, trace):
        ...
        return False

flag = Flag()
with flag as current:
    inside = current.active
outside = flag.active
assert (inside, outside) == (True, False)
inside, outside
""",
        "solution": """\
class Flag:
    def __init__(self):
        self.active = False

    def __enter__(self):
        self.active = True
        return self

    def __exit__(self, excType, exc, trace):
        self.active = False
        return False

flag = Flag()
with flag as current:
    inside = current.active
outside = flag.active
assert (inside, outside) == (True, False)
inside, outside
""",
    },
    29: {
        "prompt": "두 포인터 방식으로 정렬된 리스트에서 목표 합을 찾으세요.",
        "code": """\
def hasPair(nums, target):
    left = 0
    right = len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return True
        if total < target:
            ...
        else:
            ...
    return False

assert hasPair([1, 2, 4, 7, 9], 11) is True
hasPair([1, 2, 4, 7, 9], 20)
""",
        "solution": """\
def hasPair(nums, target):
    left = 0
    right = len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return True
        if total < target:
            left = left + 1
        else:
            right = right - 1
    return False

assert hasPair([1, 2, 4, 7, 9], 11) is True
hasPair([1, 2, 4, 7, 9], 20)
""",
    },
    30: {
        "prompt": "최종 리포트에 완료율을 계산하는 함수를 추가하세요.",
        "code": """\
def completionRate(records):
    doneCount = sum(1 for record in records if record["done"])
    return ...

records = [{"done": True}, {"done": False}, {"done": True}]
rate = completionRate(records)
assert rate == 0.67
rate
""",
        "solution": """\
def completionRate(records):
    doneCount = sum(1 for record in records if record["done"])
    return round(doneCount / len(records), 2)

records = [{"done": True}, {"done": False}, {"done": True}]
rate = completionRate(records)
assert rate == 0.67
rate
""",
    },
}


MILESTONE_DAYS = {
    5: "문자열과 값 다루기 점검",
    10: "순서형/집합형 자료구조 점검",
    15: "조건, 반복, 함수 기초 점검",
    20: "모듈, 파일, 예외 처리 점검",
    25: "객체지향 기본 설계 점검",
    30: "최종 프로젝트 완성 점검",
}


CHECKPOINTS = {
    1: [
        ("빈칸", 'answer == "Hello, Codaro"'),
        ("버그 수정", 'greeting == "Hello"'),
        ("전이", 'intro == "I run Python today."'),
    ],
    2: [
        ("빈칸", "totalPrice == 36000"),
        ("버그 수정", "nextCount == 6"),
        ("전이", "studyHours == 1.5"),
    ],
    3: [
        ("빈칸", "passed is True"),
        ("버그 수정", "discountTarget is True"),
        ("전이", "freeShipping is True"),
    ],
    4: [
        ("빈칸", 'sentence == "Rin has 42 points."'),
        ("버그 수정", 'message == "Rank: 1"'),
        ("전이", 'status == "Noa has 3 missions left."'),
    ],
    5: [
        ("빈칸", 'extension == "csv"'),
        ("버그 수정", 'word == "Python"'),
        ("전이", '(year, month, day) == ("2026", "05", "17")'),
    ],
    6: [
        ("빈칸", 'joinedTags == "python-colab-practice"'),
        ("버그 수정", 'title == "Python mastery"'),
        ("전이", 'slug == "python-practice-plan"'),
    ],
    7: [
        ("빈칸", 'todos == ["read", "review", "send"]'),
        ("버그 수정", 'firstColor == "red"'),
        ("전이", 'firstTopic == "strings" and lastTopic == "functions"'),
    ],
    8: [
        ("빈칸", 'cart == ["coffee", "tea"]'),
        ("버그 수정", "sortedLevels == [1, 2, 5]"),
        ("전이", 'firstTask == "plan" and tasks == ["write", "test"]'),
    ],
    9: [
        ("빈칸", 'userName == "Rin" and userLevel == 4'),
        ("버그 수정", "size == (1920, 720)"),
        ("전이", "total == 20"),
    ],
    10: [
        ("빈칸", 'inactivePaid == {"a"}'),
        ("버그 수정", '"python" in tags'),
        ("전이", 'both == {"Bo"} and allPeople == {"Ari", "Bo", "Chen", "Dana"}'),
    ],
    11: [
        ("빈칸", 'book["pages"] == 320'),
        ("버그 수정", "itemCost == 3000"),
        ("전이", 'profile == {"name": "Mina", "level": 3, "active": True}'),
    ],
    12: [
        ("빈칸", "penCount == 0"),
        ("버그 수정", "hasPrice is True"),
        ("전이", 'language == "ko" and settings["theme"] == "dark" and settings["fontSize"] == 16'),
    ],
    13: [
        ("빈칸", 'label == "minor"'),
        ("버그 수정", 'grade == "A"'),
        ("전이", 'scoreLabel == "pass"'),
    ],
    14: [
        ("빈칸", "evens == [2, 4, 6]"),
        ("버그 수정", "items == [0, 1, 2]"),
        ("전이", 'longWords == ["colab", "notebook"]'),
    ],
    15: [
        ("빈칸", "averageTwo(80, 100) == 90"),
        ("버그 수정", "makeTotal(3000, 4) == 12000"),
        ("전이", "orderTotal(4500, 3) == 13500"),
    ],
    16: [
        ("빈칸", "sumAll(1, 2, 3, 4) == 10"),
        ("버그 수정", 'second == ["write"]'),
        ("전이", "basic == 13000 and express == 15000"),
    ],
    17: [
        ("빈칸", "triple(10) == 30"),
        ("버그 수정", "clicker() == 2"),
        ("전이", 'result == "ERROR: missing file"'),
    ],
    18: [
        ("빈칸", "root == 12"),
        ("버그 수정", "1 <= number <= 10"),
        ("전이", "1 <= dice <= 6"),
    ],
    19: [
        ("빈칸", 'dailyPath.read_text(encoding="utf-8") == "Day 19 complete"'),
        ("버그 수정", 'content == "mode"'),
        ("전이", "len(lines) == 2"),
    ],
    20: [
        ("빈칸", "count == 0"),
        ("버그 수정", "age == 0"),
        ("전이", "safeDivide(10, 0) is None and safeDivide(10, 2) == 5"),
    ],
    21: [
        ("빈칸", "average == 90"),
        ("버그 수정", 'invalidValues == ["bad"]'),
        ("전이", 'doneTopics == ["Strings", "Loops"]'),
    ],
    22: [
        ("빈칸", "book.isLong() is True"),
        ("버그 수정", "counter.add() == 2"),
        ("전이", 'habit.name == "practice" and habit.count == 1'),
    ],
    23: [
        ("빈칸", 'user.name == "Mina" and user.canExport is True'),
        ("버그 수정", 'admin.name == "Noa" or admin.name == "Jin"'),
        ("전이", 'admin.role == "admin"'),
    ],
    24: [
        ("빈칸", "Point(1, 2) == Point(1, 2)"),
        ("버그 수정", "len(box) == 3"),
        ("전이", "len(stack) == 3"),
    ],
    25: [
        ("빈칸", "score.value == 90"),
        ("버그 수정", "product.salePrice == 9000"),
        ("전이", 'person.fullName == "Ada Lovelace"'),
    ],
    26: [
        ("빈칸", 'longWords == ["python", "colab"]'),
        ("버그 수정", 'lengthMap == {"cat": 3, "python": 6}'),
        ("전이", "evenSquares == [4, 16, 36]"),
    ],
    27: [
        ("빈칸", "result == [0, 2, 4, 6] or result == ['colab', 'python']"),
        ("버그 수정", "secondList == [0, 1, 2]"),
        ("전이", 'result == ["colab", "python"]'),
    ],
    28: [
        ("빈칸", 'timerResult == "start practice"'),
        ("버그 수정", 'state == "open"'),
        ("전이", "inside is True and outside is False"),
    ],
    29: [
        ("빈칸", 'result == "a"'),
        ("버그 수정", "binarySearch([1, 3, 5], 5) == 2"),
        ("전이", "hasPair([1, 2, 4, 7, 9], 11) is True"),
    ],
    30: [
        ("빈칸", "record.isLongSession() is True"),
        ("버그 수정", 'averageDoneMinutes([{"minutes": 30, "done": True}, {"minutes": 100, "done": False}, {"minutes": 50, "done": True}]) == 40'),
        ("전이", "rate == 0.67"),
    ],
}


def cleanCode(text: str) -> str:
    return dedent(text).strip()


def cleanMarkdown(text: str) -> str:
    lines = dedent(text).strip().splitlines()
    cleanedLines = []
    inFence = False
    fenceLines = []
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith("```"):
            if inFence:
                if fenceLines and fenceLines[0].startswith(" "):
                    fenceLines[0] = fenceLines[0].lstrip()
                cleanedLines.extend(fenceLines)
                fenceLines = []
            cleanedLines.append(stripped)
            inFence = not inFence
        elif inFence:
            fenceLines.append(line)
        else:
            cleanedLines.append(stripped)
    if fenceLines:
        if fenceLines[0].startswith(" "):
            fenceLines[0] = fenceLines[0].lstrip()
        cleanedLines.extend(fenceLines)
    return "\n".join(cleanedLines).strip()


def makeMarkdownCell(source: str) -> dict[str, object]:
    return {"cell_type": "markdown", "metadata": {}, "source": cleanMarkdown(source)}


def makeCodeCell(source: str) -> dict[str, object]:
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": cleanCode(source),
    }


def colabUrl(relativePath: str) -> str:
    return f"https://colab.research.google.com/github/{REPOSITORY}/blob/{BRANCH}/{COURSE_PATH}/{relativePath}"


def molabUrl(relativePath: str) -> str:
    return f"https://molab.marimo.io/github/{REPOSITORY}/blob/{BRANCH}/{COURSE_PATH}/{relativePath}"


def makeReviewMarkdown(day: int) -> str:
    if day == 1:
        return """
        ## 시작 전 회상

        오늘은 복습할 이전 Day가 없습니다. 대신 아래 세 가지를 기준점으로 잡습니다.

        - 코드를 실행하기 전에 결과를 먼저 예상한다.
        - 결과가 다르면 코드를 지우지 말고 왜 다른지 적는다.
        - 한 셀에는 하나의 실험만 둔다.
        """
    candidates = [day - 1, day - 3, day - 7]
    reviewDays = [candidate for candidate in candidates if candidate >= 1]
    items = "\n".join(
        f"- Day {reviewDay:02d}: 제목을 보지 않고 핵심 문법 하나와 실수 하나를 떠올린다."
        for reviewDay in reviewDays
    )
    return f"""
    ## 시작 전 회상

    새 문법을 보기 전에 이전 내용을 먼저 꺼내야 장기 기억으로 넘어갑니다. 아래 질문은 실행하지 않고 말이나 메모로 답합니다.

    {items}

    답이 바로 떠오르지 않으면 해당 Day의 예측 문제만 다시 실행하고 돌아오세요.
    """


def makeMilestoneMarkdown(day: int) -> str:
    title = MILESTONE_DAYS.get(day)
    if title is None:
        return """
        ## 오늘의 통과 기준

        이 Day는 새 개념 하나를 익히는 날입니다. 아래 기준을 만족하면 다음 Day로 넘어갑니다.

        - 예측 문제를 실행 전에 답했다.
        - 빈칸 문제의 `assert`가 통과했다.
        - 버그 수정 문제의 원인을 한 문장으로 설명했다.
        - 전이 연습을 정답 없이 한 번 해결했다.
        - 미니 프로젝트를 자기 데이터로 변형했다.
        """
    return f"""
    ## 마일스톤: {title}

    오늘은 단순 진도일이 아니라 누적 점검일입니다. 새 셀을 끝낸 뒤, 이전 Day의 미니 프로젝트 중 하나를 골라 변수명과 데이터를 바꿔 다시 구현하세요.

    통과 기준은 더 엄격합니다.

    - 이전 개념을 최소 3개 이상 함께 사용했다.
    - 에러가 났을 때 에러 이름과 원인을 적었다.
    - 최종 셀의 결과를 보고 “이 코드가 하는 일”을 비전공자에게 설명할 수 있다.
    """


def makeCumulativeProjectCode(day: int) -> str:
    if day == 1:
        return """\
learner = "Mina"
course = "Python 30 Days"
todayLog = learner + " started " + course
todayLog
"""
    if day == 2:
        return """\
studyMinutes = 35
breakMinutes = 10
totalMinutes = studyMinutes + breakMinutes
totalMinutes
"""
    if day == 3:
        return """\
studyMinutes = 35
targetMinutes = 30
isOnTrack = studyMinutes >= targetMinutes
isOnTrack
"""
    if day == 4:
        return """\
learner = "Mina"
studyMinutes = 35
message = f"{learner} studied for {studyMinutes} minutes."
message
"""
    if day == 5:
        return """\
logId = "2026-05-17-python"
logDate = logId[:10]
topic = logId[11:]
logDate, topic
"""
    if day == 6:
        return """\
rawTopic = "  Python String Methods  "
cleanTopic = rawTopic.strip().lower().replace(" ", "-")
cleanTopic
"""
    if day == 7:
        return """\
weeklyTopics = ["values", "strings", "lists"]
firstTopic = weeklyTopics[0]
lastTopic = weeklyTopics[-1]
firstTopic, lastTopic
"""
    if day == 8:
        return """\
todo = ["review", "practice"]
todo.append("reflect")
done = todo.pop(0)
done, todo
"""
    if day == 9:
        return """\
studyBlock = ("Day 09", "tuples", 40)
dayLabel, topic, minutes = studyBlock
dayLabel, topic, minutes
"""
    if day == 10:
        return """\
planned = {"strings", "lists", "sets"}
completed = {"strings", "sets"}
remaining = planned - completed
remaining
"""
    if day == 11:
        return """\
record = {"day": 11, "topic": "dict", "minutes": 45}
record["done"] = True
record
"""
    if day == 12:
        return """\
settings = {"targetMinutes": 30, "theme": "light"}
target = settings.get("targetMinutes", 25)
settings.update({"theme": "dark"})
target, settings
"""
    if day == 13:
        return """\
minutes = 42
if minutes >= 40:
    status = "deep work"
elif minutes >= 20:
    status = "practice"
else:
    status = "warm up"
status
"""
    if day == 14:
        return """\
minutesList = [20, 45, 10, 60]
focusedTotal = 0
for minutes in minutesList:
    if minutes >= 30:
        focusedTotal = focusedTotal + minutes
focusedTotal
"""
    if day == 15:
        return """\
def isFocused(minutes):
    return minutes >= 30

isFocused(45)
"""
    if day == 16:
        return """\
def addSession(minutes, bonus=0):
    return minutes + bonus

regular = addSession(30)
review = addSession(30, bonus=10)
regular, review
"""
    if day == 17:
        return """\
def makeStreak():
    count = 0
    def addDay():
        nonlocal count
        count = count + 1
        return count
    return addDay

streak = makeStreak()
streak(), streak()
"""
    if day == 18:
        return """\
from datetime import date

logDate = date.today().isoformat()
logDate
"""
    if day == 19:
        return """\
from pathlib import Path

logPath = Path("studyLog.txt")
logPath.write_text("Day 19 file practice", encoding="utf-8")
logPath.read_text(encoding="utf-8")
"""
    if day == 20:
        return """\
rawMinutes = ["30", "bad", "45"]
minutes = []
errors = []
for raw in rawMinutes:
    try:
        minutes.append(int(raw))
    except ValueError as exc:
        errors.append(raw)
minutes, errors
"""
    if day == 21:
        return """\
records = [
    {"topic": "strings", "minutes": 35, "done": True},
    {"topic": "files", "minutes": 20, "done": False},
]
doneTopics = []
for record in records:
    if record["done"]:
        doneTopics.append(record["topic"])
doneTopics
"""
    if day == 22:
        return """\
class StudySession:
    def __init__(self, topic, minutes):
        self.topic = topic
        self.minutes = minutes

    def isFocused(self):
        return self.minutes >= 30

session = StudySession("class", 45)
session.topic, session.isFocused()
"""
    if day == 23:
        return """\
class Session:
    def __init__(self, topic):
        self.topic = topic

class ReviewSession(Session):
    def __init__(self, topic):
        super().__init__(topic)
        self.kind = "review"

session = ReviewSession("inheritance")
session.topic, session.kind
"""
    if day == 24:
        return """\
class StudyList:
    def __init__(self, topics):
        self.topics = topics

    def __len__(self):
        return len(self.topics)

studyList = StudyList(["class", "special methods"])
len(studyList)
"""
    if day == 25:
        return """\
class StudyGoal:
    def __init__(self, minutes):
        self.minutes = minutes

    @property
    def hours(self):
        return self.minutes / 60

goal = StudyGoal(90)
goal.hours
"""
    if day == 26:
        return """\
records = [
    {"topic": "class", "done": True},
    {"topic": "decorator", "done": False},
    {"topic": "comprehension", "done": True},
]
doneTopics = [record["topic"] for record in records if record["done"]]
doneTopics
"""
    if day == 27:
        return """\
def doneTopics(records):
    for record in records:
        if record["done"]:
            yield record["topic"]

records = [{"topic": "yield", "done": True}, {"topic": "io", "done": False}]
list(doneTopics(records))
"""
    if day == 28:
        return """\
class StudyMode:
    def __enter__(self):
        return "focus"

    def __exit__(self, excType, exc, trace):
        return False

with StudyMode() as mode:
    result = mode.upper()
result
"""
    if day == 29:
        return """\
minutes = [15, 60, 30, 45]
best = minutes[0]
for value in minutes:
    if value > best:
        best = value
best
"""
    return """\
from pathlib import Path
import json

report = {
    "course": "Python 30 Days",
    "completedDays": 30,
    "nextStep": "build a personal automation script",
}
Path("finalStudyReport.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
report
"""


def makeMasteryCheckCode(day: int) -> str:
    return f"""\
dayNumber = {day}
predictionWritten = False
fillBlankPassed = False
bugExplained = False
transferSolved = False
projectChanged = False
readyForNextDay = predictionWritten and fillBlankPassed and bugExplained and transferSolved and projectChanged
readyForNextDay
"""


def makeAutoCheckpointCode(day: int) -> str:
    rows = ",\n    ".join(repr(check) for check in CHECKPOINTS[day])
    return f"""\
checks = [
    {rows}
]
checkpointResults = []
for checkName, expression in checks:
    try:
        passed = bool(eval(expression))
        checkpointResults.append({{"check": checkName, "passed": passed, "error": ""}})
    except (NameError, AssertionError, TypeError, ValueError, AttributeError, KeyError, IndexError) as exc:
        checkpointResults.append({{"check": checkName, "passed": False, "error": type(exc).__name__}})

passedCount = sum(1 for item in checkpointResults if item["passed"])
{{"passed": passedCount, "total": len(checkpointResults), "details": checkpointResults}}
"""


def makeErrorJournalMarkdown() -> str:
    return """
    ## 오답 노트

    버그 수정 셀을 고친 뒤 아래 세 줄을 노트나 마크다운 셀에 직접 적습니다. 공개용 학습 과정에서 중요한 것은 정답 코드가 아니라, 같은 실수를 다시 하지 않게 만드는 규칙입니다.

    - 에러 이름:
    - 실제 원인:
    - 다음에 확인할 규칙:
    """


def makeTraceMarkdown(dayInfo: dict[str, object]) -> str:
    return f"""
    ## 실행 추적

    오늘 핵심 개념은 `{dayInfo["title"]}`입니다. 예제 셀을 실행하기 전에 아래 순서로 머릿속 실행을 해봅니다.

    | 단계 | 볼 것 | 적을 내용 |
    |---:|---|---|
    | 1 | 입력값 | 처음 만들어지는 값과 타입 |
    | 2 | 변환 | 어떤 연산이나 메서드가 값을 바꾸는지 |
    | 3 | 결과 | 마지막 줄이 보여줄 값 |

    표를 완벽하게 채우는 것이 목표가 아닙니다. 코드가 한 줄씩 상태를 바꾼다는 감각을 만드는 것이 목표입니다.
    """


def explainLine(line: str) -> str:
    stripped = line.strip()
    if not stripped:
        return "읽기 좋게 구획을 나누는 빈 줄입니다."
    if stripped.startswith("def "):
        return "재사용할 동작에 이름을 붙입니다. 입력과 반환값을 함께 생각합니다."
    if stripped.startswith("class "):
        return "데이터와 동작을 묶을 새 타입의 설계도를 만듭니다."
    if stripped.startswith("return "):
        return "함수 호출자에게 돌려줄 결과를 정합니다."
    if stripped.startswith("if "):
        return "조건을 검사하고 참일 때 실행할 경로를 엽니다."
    if stripped.startswith("elif "):
        return "앞 조건이 거짓일 때 다음 가능성을 검사합니다."
    if stripped.startswith("else"):
        return "위 조건들이 모두 거짓일 때의 기본 경로입니다."
    if stripped.startswith("for "):
        return "묶음에서 값을 하나씩 꺼내 같은 규칙을 적용합니다."
    if stripped.startswith("while "):
        return "조건이 참인 동안 같은 작업을 반복합니다."
    if stripped.startswith("try"):
        return "실패할 수 있는 코드를 안전하게 실행해봅니다."
    if stripped.startswith("except "):
        return "예상한 실패를 잡아 복구 경로로 보냅니다."
    if stripped.startswith("with "):
        return "시작과 정리가 필요한 작업을 안전한 구역으로 묶습니다."
    if stripped.startswith("import ") or stripped.startswith("from "):
        return "이미 만들어진 도구를 현재 노트북으로 가져옵니다."
    if "assert " in stripped or stripped.startswith("assert "):
        return "내가 기대한 결과가 맞는지 즉시 검사합니다."
    if "=" in stripped and "==" not in stripped and "!=" not in stripped and ">=" not in stripped and "<=" not in stripped:
        return "계산 결과나 데이터를 이름에 연결합니다."
    return "마지막 표현식이거나 호출입니다. 실행 결과를 관찰해 상태를 확인합니다."


def makeLineByLineMarkdown(dayInfo: dict[str, object]) -> str:
    rows = []
    for number, line in enumerate(cleanCode(str(dayInfo["exampleCode"])).splitlines(), start=1):
        displayLine = line.replace("|", "\\|") or " "
        rows.append(f"| {number} | `{displayLine}` | {explainLine(line)} |")
    joinedRows = "\n".join(rows)
    return f"""
    ## 라인별 해설

    예제 코드를 실행하기 전에 한 줄씩 의미를 분해합니다. 뛰어난 학습자는 코드를 통째로 외우지 않고, 각 줄이 상태를 어떻게 바꾸는지 말할 수 있습니다.

    | 줄 | 코드 | 역할 |
    |---:|---|---|
    {joinedRows}
    """


def makeDiagnosticMarkdown(dayInfo: dict[str, object]) -> str:
    concepts = list(dayInfo["concepts"])
    primary = concepts[0]
    secondary = concepts[min(1, len(concepts) - 1)]
    return f"""
    ## 0. 진단 질문

    아래 질문은 점수를 매기기 위한 것이 아니라, 오늘 어디를 집중해야 하는지 찾기 위한 진단입니다. 답이 흐릿하면 해당 부분을 천천히 실행 추적하세요.

    1. `{primary}`를 한 문장으로 설명할 수 있는가?
    2. `{secondary}`를 잘못 쓰면 어떤 결과나 에러가 날 수 있는가?
    3. 오늘 미니 프로젝트에서 어떤 값이 입력이고 어떤 값이 결과인가?
    """


def makeConceptBoundaryMarkdown(dayInfo: dict[str, object]) -> str:
    concepts = ", ".join(f"`{concept}`" for concept in dayInfo["concepts"])
    mistakes = "\n".join(f"- {mistake}" for mistake in dayInfo["commonMistakes"])
    return f"""
    ## 개념 경계

    오늘의 핵심 범위는 {concepts}입니다. 범위를 좁게 잡는 이유는 하나의 노트북에서 너무 많은 문법을 섞으면 실패 원인을 찾기 어려워지기 때문입니다.

    **오늘 집중할 것**

    - 값을 어떻게 만들고 확인하는가
    - 결과가 예상과 다를 때 어느 줄을 먼저 볼 것인가
    - 같은 문법을 다른 데이터에 적용할 수 있는가

    **오늘 피할 실수**

    {mistakes}
    """


def makePracticeBankMarkdown(dayInfo: dict[str, object], transferPractice: dict[str, str]) -> str:
    concepts = list(dayInfo["concepts"])
    conceptText = ", ".join(concepts[:3])
    return f"""
    ## 추가 문제은행

    자동 체크포인트까지 통과했다면 아래 문제를 노트북 맨 아래 새 셀에 직접 풉니다. 정답 셀은 제공하지 않습니다. 공개용 과정에서는 정답보다 변형 능력이 더 중요합니다.

    1. **따라 쓰기**: 핵심 예제와 같은 구조로 변수명과 데이터만 바꿔 다시 작성합니다.
    2. **변형**: 전이 연습 `{transferPractice["prompt"]}`에서 숫자나 문자열을 하나 바꾸고 `assert`도 함께 고칩니다.
    3. **역문제**: 결과값을 먼저 정하고, 그 결과가 나오도록 입력 데이터를 설계합니다.
    4. **오류 만들기**: 오늘의 자주 하는 실수 중 하나를 일부러 만들고, 에러 이름이나 잘못된 결과를 기록합니다.
    5. **설명하기**: {conceptText} 중 하나를 비전공자에게 설명하는 3문장 메모를 씁니다.
    6. **연결하기**: 누적 프로젝트 셀에 오늘 배운 문법을 한 줄 더 추가합니다.
    """


def makeLabRubricMarkdown(dayInfo: dict[str, object]) -> str:
    return f"""
    ## 실전 랩 기준

    미니 프로젝트는 단순 실행 예제가 아니라 오늘의 실전 랩입니다.

    **랩 목표**: {dayInfo["projectPrompt"]}

    **우수 제출 기준**

    - 변수명만 읽어도 데이터 의미가 드러난다.
    - 마지막 줄의 출력이 목표와 직접 연결된다.
    - `assert` 또는 자동 체크포인트로 핵심 결과를 검증한다.
    - 데이터를 하나 바꿨을 때 결과가 어떻게 바뀌는지 설명할 수 있다.
    - 오늘 배운 문법을 적어도 한 번은 자기 예제로 변형했다.
    """


def makeExitTicketMarkdown(dayInfo: dict[str, object]) -> str:
    return f"""
    ## 종료 티켓

    다음 세 문장을 직접 완성해야 오늘 학습을 끝낸 것으로 봅니다.

    - 오늘 내가 배운 핵심은 `{dayInfo["title"]}`이고, 한 문장으로 말하면:
    - 내가 고친 버그의 원인은:
    - 내일 다시 보면 가장 먼저 확인할 코드는:
    """


def reviewNotebookName(startDay: int, endDay: int) -> str:
    return f"reviewDay{startDay:02d}To{endDay:02d}.ipynb"


def makeReviewProjectCode(startDay: int, endDay: int) -> str:
    if (startDay, endDay) == (1, 5):
        return """\
rawLog = "2026-05-17 Mina 45"
logDate = rawLog[:10]
learner = rawLog[11:15]
minutes = int(rawLog[-2:])
summary = f"{learner} studied {minutes} minutes on {logDate}."
summary
"""
    if (startDay, endDay) == (6, 10):
        return """\
rawTopics = " strings,lists,sets,lists "
topics = rawTopics.strip().split(",")
uniqueTopics = set(topics)
ordered = sorted(uniqueTopics)
ordered
"""
    if (startDay, endDay) == (11, 15):
        return """\
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
    if (startDay, endDay) == (16, 20):
        return """\
from pathlib import Path
import json

def parseMinutes(raw):
    try:
        return int(raw)
    except ValueError as exc:
        return 0

minutes = [parseMinutes(raw) for raw in ["30", "bad", "45"]]
path = Path("reviewMinutes.json")
path.write_text(json.dumps({"minutes": minutes}), encoding="utf-8")
json.loads(path.read_text(encoding="utf-8"))
"""
    if (startDay, endDay) == (21, 25):
        return """\
class ReviewRecord:
    def __init__(self, topic, score):
        self.topic = topic
        self.score = score

    @property
    def passed(self):
        return self.score >= 80

    def __str__(self):
        return f"{self.topic}: {self.score}"

record = ReviewRecord("property", 88)
str(record), record.passed
"""
    return """\
from pathlib import Path
import json

def doneTopics(records):
    for record in records:
        if record["done"]:
            yield record["topic"]

records = [
    {"topic": "comprehension", "done": True, "minutes": 35},
    {"topic": "generator", "done": True, "minutes": 40},
    {"topic": "context", "done": False, "minutes": 20},
]
summary = {
    "done": [topic for topic in doneTopics(records)],
    "totalMinutes": sum(record["minutes"] for record in records),
}
Path("finalReview.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
summary
"""


def makeReviewNotebook(startDay: int, endDay: int) -> dict[str, object]:
    daySlice = DAY_CONTENT[startDay - 1 : endDay]
    conceptRows = "\n".join(
        f"| Day {int(dayInfo['day']):02d} | {dayInfo['title']} | {', '.join(dayInfo['concepts'][:4])} |"
        for dayInfo in daySlice
    )
    cells = [
        makeMarkdownCell(
            f"""
            # Review Day {startDay:02d}-{endDay:02d}

            이 리뷰 노트북은 진도용이 아니라 회수용입니다. 5일 동안 배운 개념을 한 문제 안에서 다시 꺼내 쓰는지 확인합니다.
            """
        ),
        makeMarkdownCell(
            f"""
            ## 개념 맵

            | 범위 | 주제 | 핵심 개념 |
            |---|---|---|
            {conceptRows}
            """
        ),
        makeMarkdownCell(
            """
            ## 리뷰 프로젝트

            아래 코드는 해당 구간의 핵심 개념을 하나로 묶은 작은 프로젝트입니다. 먼저 실행하고, 그 다음 데이터와 변수명을 바꿔 다시 작성하세요.
            """
        ),
        makeCodeCell(makeReviewProjectCode(startDay, endDay)),
        makeMarkdownCell(
            """
            ## 시험형 과제

            새 코드 셀을 만들고 아래 조건을 만족하는 코드를 작성합니다.

            - 이전 5일 중 최소 3일의 개념을 사용한다.
            - 결과 검증용 `assert`를 2개 이상 넣는다.
            - 에러가 날 수 있는 입력을 하나 이상 고려한다.
            - 마지막 줄은 사람이 읽을 수 있는 요약값이어야 한다.
            """
        ),
        makeMarkdownCell(
            """
            ## 리뷰 통과 기준

            - 개념 이름을 보지 않고 코드에서 쓰인 문법을 설명할 수 있다.
            - 코드 한 줄을 바꿨을 때 어떤 출력이 달라지는지 말할 수 있다.
            - 같은 프로젝트를 자기 데이터로 다시 만들었다.
            """
        ),
    ]
    return {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": [], "toc_visible": True},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def makeNotebook(dayInfo: dict[str, object]) -> dict[str, object]:
    day = int(dayInfo["day"])
    title = str(dayInfo["title"])
    concepts = "\n".join(f"- {concept}" for concept in dayInfo["concepts"])
    mistakes = "\n".join(f"- {mistake}" for mistake in dayInfo["commonMistakes"])
    transferPractice = TRANSFER_PRACTICE[day]
    cells = [
        makeMarkdownCell(
            f"""
            # Day {day:02d}. {title}

            **오늘의 초점**: {dayInfo["focus"]}

            **완성 기준**: {dayInfo["outcome"]}

            이 노트북에는 일부러 비워두거나 실패하게 만든 셀이 있습니다. 설명을 읽고 코드를 고친 뒤 다시 실행하는 방식으로 학습하세요.
            """
        ),
        makeMarkdownCell(
            f"""
            ## 학습 흐름

            1. 진단 질문과 시작 전 회상으로 오늘의 위치를 확인합니다.
            2. 개념 경계, 실행 추적, 라인별 해설로 코드가 움직이는 방식을 봅니다.
            3. 예측 문제는 먼저 머릿속으로 답을 정하고 실행합니다.
            4. 빈칸 문제와 버그 수정 문제를 직접 고칩니다.
            5. 전이 연습과 자동 체크포인트로 실제 이해를 검증합니다.
            6. 미니 프로젝트, 누적 프로젝트, 추가 문제은행으로 자기 코드까지 확장합니다.

            ## 오늘 다룰 개념

            {concepts}
            """
        ),
        makeMarkdownCell(
            f"""
            ## 왜 배우는가

            {dayInfo["why"]}

            ## 생각 모델

            {dayInfo["mentalModel"]}

            ## 자주 하는 실수

            {mistakes}
            """
        ),
        makeMarkdownCell(makeDiagnosticMarkdown(dayInfo)),
        makeMarkdownCell(makeReviewMarkdown(day)),
        makeMarkdownCell(makeMilestoneMarkdown(day)),
        makeMarkdownCell(makeConceptBoundaryMarkdown(dayInfo)),
        makeMarkdownCell(makeTraceMarkdown(dayInfo)),
        makeMarkdownCell(makeLineByLineMarkdown(dayInfo)),
        makeMarkdownCell("## 1. 핵심 예제\n\n먼저 완성된 예제를 실행해 오늘의 문법이 어떤 모양인지 확인합니다."),
        makeCodeCell(str(dayInfo["exampleCode"])),
        makeMarkdownCell(
            f"""
            ## 2. 예측 → 검증

            {dayInfo["predictPrompt"]}

            실행 전에 예상 결과를 노트에 적어두세요.
            """
        ),
        makeCodeCell(str(dayInfo["predictCode"])),
        makeMarkdownCell(
            f"""
            <details>
            <summary>예상 결과 확인</summary>

            ```python
            {dayInfo["predictAnswer"]}
            ```

            </details>
            """
        ),
        makeMarkdownCell(
            f"""
            ## 3. 빈칸 채우기

            {dayInfo["exercisePrompt"]}

            `...` 또는 불완전한 부분을 고친 뒤 셀을 실행하세요. `assert`가 조용히 지나가면 통과입니다.
            """
        ),
        makeCodeCell(str(dayInfo["exerciseCode"])),
        makeMarkdownCell(
            f"""
            <details>
            <summary>힌트와 정답</summary>

            1. 어떤 값이 최종 변수에 들어가야 하는지 먼저 말로 설명합니다.
            2. 이미 만들어진 변수 중 재사용할 수 있는 값을 찾습니다.
            3. 정답 예시는 아래와 같습니다.

            ```python
            {cleanCode(str(dayInfo["solutionCode"]))}
            ```

            </details>
            """
        ),
        makeMarkdownCell(
            f"""
            ## 4. 버그 수정

            {dayInfo["bugPrompt"]}

            실패하는 코드를 그냥 지우지 말고, 왜 실패하는지 한 문장으로 설명한 뒤 고치세요.
            """
        ),
        makeCodeCell(str(dayInfo["bugCode"])),
        makeMarkdownCell(
            f"""
            <details>
            <summary>수정 예시</summary>

            ```python
            {cleanCode(str(dayInfo["bugFixCode"]))}
            ```

            </details>
            """
        ),
        makeMarkdownCell(makeErrorJournalMarkdown()),
        makeMarkdownCell(
            f"""
            ## 5. 전이 연습

            {transferPractice["prompt"]}

            같은 개념을 다른 데이터와 다른 변수명으로 다시 쓰는 단계입니다. 여기서 막히면 핵심 예제로 돌아가서 코드 모양만 다시 보고 옵니다.
            """
        ),
        makeCodeCell(str(transferPractice["code"])),
        makeMarkdownCell(
            f"""
            <details>
            <summary>전이 연습 3단계 힌트와 정답</summary>

            1. 개념 힌트: 오늘 배운 핵심 문법 중 어떤 것을 써야 하는지 먼저 고릅니다.
            2. 구조 힌트: 최종 변수에 어떤 값이 들어가야 `assert`가 통과하는지 역으로 생각합니다.
            3. 정답 예시는 아래와 같습니다.

            ```python
            {cleanCode(str(transferPractice["solution"]))}
            ```

            </details>
            """
        ),
        makeMarkdownCell(
            """
            ## 자동 체크포인트

            빈칸, 버그 수정, 전이 연습을 모두 고친 뒤 실행합니다. 실패 항목이 있으면 해당 셀로 돌아가 고친 다음 이 셀을 다시 실행하세요.
            """
        ),
        makeCodeCell(makeAutoCheckpointCode(day)),
        makeMarkdownCell(makeLabRubricMarkdown(dayInfo)),
        makeMarkdownCell(
            f"""
            ## 6. 미니 프로젝트

            {dayInfo["projectPrompt"]}

            아래 코드는 시작점입니다. 실행 후 값을 바꿔보고, 마지막 줄의 결과가 어떻게 달라지는지 확인하세요.
            """
        ),
        makeCodeCell(str(dayInfo["projectCode"])),
        makeMarkdownCell(
            f"""
            ## 7. 30일 누적 프로젝트

            매일 하나의 작은 학습 기록 프로그램을 조금씩 키웁니다. 오늘 셀은 이전 문법을 버리지 않고 새 문법을 얹는 방식으로 작성되어 있습니다.
            """
        ),
        makeCodeCell(makeCumulativeProjectCode(day)),
        makeMarkdownCell(
            """
            ## 8. 자동 자기점검

            아래 값을 직접 `True`로 바꾸는 것은 체크 표시가 아니라 약속입니다. 각 항목을 실제로 끝낸 뒤에만 바꾸세요. 마지막 값이 `True`가 아니면 다음 Day로 넘어가지 않습니다.
            """
        ),
        makeCodeCell(makeMasteryCheckCode(day)),
        makeMarkdownCell(
            f"""
            ## 9. 변형 과제와 회고

            **변형 과제**: {dayInfo["challenge"]}

            **회고 질문**

            - 오늘 문법을 어디에 쓸 수 있는가?
            - 가장 헷갈린 규칙은 무엇인가?
            - 같은 문제를 내일 다시 푼다면 어떤 변수명이나 함수명을 더 좋게 바꿀 수 있는가?
            """
        ),
        makeMarkdownCell(makePracticeBankMarkdown(dayInfo, transferPractice)),
        makeMarkdownCell(makeExitTicketMarkdown(dayInfo)),
        makeMarkdownCell(
            """
            ## 공개용 완성 기준

            이 노트북을 공개 학습 자료로 사용할 때의 기준입니다. 단순히 셀을 모두 실행한 것이 아니라, 아래 조건을 만족해야 훌륭한 완료로 봅니다.

            - 예측, 구현, 디버깅, 전이, 프로젝트 변형이 모두 남아 있다.
            - 자동 체크포인트가 통과한 상태의 노트북을 저장했다.
            - 오답 노트에 최소 1개의 실제 실수가 기록되어 있다.
            - 누적 프로젝트 셀을 자기 데이터로 바꿔 실행했다.
            """
        ),
    ]
    return {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": [], "toc_visible": True},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def notebookName(dayInfo: dict[str, object]) -> str:
    return f"day{int(dayInfo['day']):02d}{str(dayInfo['slug']).title().replace(' ', '')}.ipynb"


def marimoName(dayInfo: dict[str, object]) -> str:
    return notebookName(dayInfo).replace(".ipynb", ".py")


def pythonTripleString(text: str) -> list[str]:
    escaped = text.replace('"""', '\\"\\"\\"')
    return ['    mo.md(r"""', *[f"    {line}" for line in escaped.splitlines()], '    """)']


def marimoSourceCall(functionName: str, source: str) -> list[str]:
    escaped = source.replace('"""', '\\"\\"\\"')
    return [f"    {functionName}(", '        r"""', *escaped.splitlines(), '"""', "    )"]


def notebookToMarimoPython(notebook: dict[str, object], title: str) -> str:
    appTitle = title.replace("\\", "\\\\").replace('"', '\\"')
    chunks = [
        "import marimo",
        "",
        '__generated_with = "0.23.6"',
        "",
        f'app = marimo.App(app_title="{appTitle}")',
        "",
        "",
        "@app.cell",
        "def _():",
        "    import marimo as mo",
        "    return (mo,)",
        "",
        "@app.cell",
        "def _():",
        "    import ast",
        "",
        '    _courseState = {"__builtins__": __builtins__}',
        "",
        "    def runCell(source):",
        '        tree = ast.parse(source, mode="exec")',
        "        if tree.body and isinstance(tree.body[-1], ast.Expr):",
        "            lastExpr = ast.Expression(tree.body.pop().value)",
        "            ast.fix_missing_locations(tree)",
        "            ast.fix_missing_locations(lastExpr)",
        '            exec(compile(tree, "<marimo-cell>", "exec"), _courseState)',
        '            return eval(compile(lastExpr, "<marimo-cell>", "eval"), _courseState)',
        "        ast.fix_missing_locations(tree)",
        '        exec(compile(tree, "<marimo-cell>", "exec"), _courseState)',
        "        return None",
        "",
        "    return (runCell,)",
        "",
    ]
    for cell in notebook["cells"]:
        chunks.append("@app.cell")
        if cell["cell_type"] == "markdown":
            chunks.append("def _(mo):")
            chunks.extend(pythonTripleString(cleanMarkdown(str(cell["source"]))))
            chunks.append("    return")
        else:
            chunks.append("def _(runCell):")
            code = cleanCode(str(cell["source"]))
            if code.strip():
                chunks.extend(marimoSourceCall("runCell", code))
            else:
                chunks.append("    runCell(\"\")")
            chunks.append("    return")
        chunks.append("")
    chunks.extend(['if __name__ == "__main__":', "    app.run()", ""])
    return "\n".join(chunks)


def writeNotebook(dayInfo: dict[str, object]) -> None:
    COLAB_DIR.mkdir(parents=True, exist_ok=True)
    notebook = makeNotebook(dayInfo)
    path = COLAB_DIR / notebookName(dayInfo)
    path.write_text(json.dumps(notebook, ensure_ascii=False, indent=2), encoding="utf-8")


def writeMarimoNotebook(dayInfo: dict[str, object]) -> None:
    MARIMO_DIR.mkdir(parents=True, exist_ok=True)
    notebook = makeNotebook(dayInfo)
    path = MARIMO_DIR / marimoName(dayInfo)
    title = f"Day {int(dayInfo['day']):02d}. {dayInfo['title']}"
    path.write_text(notebookToMarimoPython(notebook, title), encoding="utf-8")


def writeReviewNotebooks() -> None:
    COLAB_DIR.mkdir(parents=True, exist_ok=True)
    MARIMO_DIR.mkdir(parents=True, exist_ok=True)
    for startDay, endDay in REVIEW_RANGES:
        notebook = makeReviewNotebook(startDay, endDay)
        path = COLAB_DIR / reviewNotebookName(startDay, endDay)
        path.write_text(json.dumps(notebook, ensure_ascii=False, indent=2), encoding="utf-8")
        marimoPath = MARIMO_DIR / reviewNotebookName(startDay, endDay).replace(".ipynb", ".py")
        marimoPath.write_text(notebookToMarimoPython(notebook, f"Review Day {startDay:02d}-{endDay:02d}"), encoding="utf-8")


def writeManifest() -> None:
    reviewItems = [
        {
            "range": f"{startDay:02d}-{endDay:02d}",
            "title": f"Review Day {startDay:02d}-{endDay:02d}",
            "colab": f"colab/{reviewNotebookName(startDay, endDay)}",
            "marimo": f"marimo/{reviewNotebookName(startDay, endDay).replace('.ipynb', '.py')}",
        }
        for startDay, endDay in REVIEW_RANGES
    ]
    manifest = {
        "title": "Python 30일 완성",
        "version": "4.0",
        "description": "Colab에서 진단, 실행 추적, 예측, 디버깅, 자동 체크포인트, 리뷰 시험, 누적 프로젝트로 배우는 순수 파이썬 30일 과정",
        "folderRule": "Repository path uses camelCase: notebooks/python30DaysComplete",
        "days": [
            {
                "day": dayInfo["day"],
                "title": dayInfo["title"],
                "focus": dayInfo["focus"],
                "milestone": MILESTONE_DAYS.get(int(dayInfo["day"]), ""),
                "colab": f"colab/{notebookName(dayInfo)}",
                "marimo": f"marimo/{marimoName(dayInfo)}",
            }
            for dayInfo in DAY_CONTENT
        ],
        "reviews": reviewItems,
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def writeProgressCsv() -> None:
    path = ROOT / "progressTracker.csv"
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(
            [
                "day",
                "title",
                "colab",
                "marimo",
                "milestone",
                "started",
                "predictionDone",
                "fillBlankPassed",
                "bugExplained",
                "transferSolved",
                "autoCheckpointPassed",
                "projectChanged",
                "completed",
                "reviewNote",
            ]
        )
        for dayInfo in DAY_CONTENT:
            day = int(dayInfo["day"])
            writer.writerow(
                [
                    dayInfo["day"],
                    dayInfo["title"],
                    f"colab/{notebookName(dayInfo)}",
                    f"marimo/{marimoName(dayInfo)}",
                    MILESTONE_DAYS.get(day, ""),
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ]
            )


def writeReadme() -> None:
    rows = "\n".join(
        f"| {int(dayInfo['day']):02d} | {dayInfo['title']} | {dayInfo['focus']} | [Colab 열기]({colabUrl('colab/' + notebookName(dayInfo))}) | [molab 열기]({molabUrl('marimo/' + marimoName(dayInfo))}) |"
        for dayInfo in DAY_CONTENT
    )
    reviewRows = "\n".join(
        f"| Day {startDay:02d}-{endDay:02d} | 5일 누적 리뷰와 시험형 과제 | [Colab 열기]({colabUrl('colab/' + reviewNotebookName(startDay, endDay))}) | [molab 열기]({molabUrl('marimo/' + reviewNotebookName(startDay, endDay).replace('.ipynb', '.py'))}) |"
        for startDay, endDay in REVIEW_RANGES
    )
    readme = f"""
    # Python 30일 완성

    이 폴더는 Codaro의 학습 철학을 독립 노트북 과정으로 먼저 배포하기 위한 공간입니다. 레포 규칙 때문에 실제 폴더명은 `python30DaysComplete`를 사용하지만, 과정명은 “Python 30일 완성”입니다.

    Codaro는 장기적으로 교육용 지능형 GUI 프로그램으로 진화하는 중입니다. 다만 그 GUI와 에이전트 기능이 완성되기 전에도 학습자가 바로 사용할 수 있어야 하므로, 먼저 ai 없이도 동작하는 커리큘럼 노트북을 Colab과 marimo 두 형식으로 배포합니다.

    현재 버전은 v4입니다. 단순한 문법 목록이 아니라 진단, 개념 경계, 라인별 해설, 회상, 실행 추적, 예측, 빈칸, 버그 수정, 오답노트, 전이 연습, 자동 체크포인트, 실전 랩, 추가 문제은행, 누적 프로젝트, 5일 단위 리뷰 시험이 함께 들어간 공개용 워크북입니다.

    ## 바로가기

    [![Course Guide](https://img.shields.io/badge/Course_Guide-open-2563eb)](courseGuide.md)
    [![Open Day 01 in Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colabUrl("colab/day01Helloworld.ipynb")})
    [![Open Day 01 in molab](https://img.shields.io/badge/Day_01-open_in_molab-ff5a5f)]({molabUrl("marimo/day01Helloworld.py")})
    [![Progress Tracker](https://img.shields.io/badge/Progress_Tracker-csv-16a34a)](progressTracker.csv)

    처음 시작한다면 Day 01을 Colab에서 열어 위에서 아래로 실행하세요. marimo로 학습하려면 molab 링크로 바로 열거나, 이 저장소를 받은 뒤 `uvx --from marimo marimo edit notebooks/python30DaysComplete/marimo/day01Helloworld.py`로 시작할 수 있습니다.

    ## 목표

    - 순수 파이썬 문법을 30일 동안 단계적으로 학습합니다.
    - 같은 커리큘럼을 `colab/`의 `.ipynb`와 `marimo/`의 네이티브 marimo 앱 `.py`로 함께 제공합니다.
    - 각 Day는 설명, 실행 예제, 예측 문제, 빈칸 채우기, 버그 수정, 오답노트, 전이 연습, 자동 체크포인트, 미니 프로젝트, 누적 프로젝트, 추가 문제은행으로 구성됩니다.
    - 5일마다 리뷰 노트북이 있어 누적 개념을 한 번에 회수합니다.
    - Colab에서 노트북 하나를 열고 위에서 아래로 실행하면서 학습할 수 있습니다.
    - 일부 셀은 의도적으로 실패합니다. 실패를 읽고 고치는 과정이 학습의 일부입니다.

    ## 추천 학습 방식

    1. 하루에 노트북 하나만 끝냅니다.
    2. 예측 문제는 실행 전에 반드시 결과를 먼저 적습니다.
    3. 빈칸 문제는 정답을 열기 전에 두 번 이상 직접 고칩니다.
    4. 버그 수정 문제는 에러 메시지를 먼저 읽고 한 문장으로 원인을 적습니다.
    5. 전이 연습은 정답을 열기 전에 최소 한 번 직접 해결합니다.
    6. 자동 체크포인트에서 모든 항목이 통과해야 합니다.
    7. 미니 프로젝트는 변수명과 데이터를 바꿔 자기 예제로 한 번 더 실행합니다.
    8. 자동 자기점검 셀의 모든 항목이 `True`가 되어야 다음 Day로 넘어갑니다.

    ## 파일 구성

    - `colab/`: 30일치 Colab `.ipynb` 노트북과 5일 단위 리뷰 노트북
    - `marimo/`: 같은 과정을 `import marimo`, `app = marimo.App(...)`, `@app.cell` 구조로 만든 네이티브 marimo 노트북
    - `courseGuide.md`: 커리큘럼 맵, 학습 방법론, 루브릭, 운영 가이드, 최종 프로젝트 명세
    - `progressTracker.csv`: 학습 진행 체크용 표
    - `manifest.json`: 노트북 목록과 메타데이터
    - `tools/createNotebooks.py`: 노트북과 문서를 다시 생성하는 스크립트
    - `tools/validateCourse.py`: 공개 배포 전 구조/문법/안전 실행 검증 스크립트

    ## Day 목록

    | Day | 제목 | 초점 | Colab | marimo |
    |---:|---|---|---|---|
    {rows}

    ## 리뷰 노트북

    | 범위 | 목적 | Colab | marimo |
    |---|---|---|---|
    {reviewRows}
    """
    (ROOT / "readme.md").write_text(cleanMarkdown(readme) + "\n", encoding="utf-8")


def writeCourseGuide() -> None:
    daySections = []
    for dayInfo in DAY_CONTENT:
        concepts = ", ".join(dayInfo["concepts"])
        daySections.append(
            f"""
            ## Day {int(dayInfo['day']):02d}. {dayInfo['title']}

            - 초점: {dayInfo['focus']}
            - 완성 기준: {dayInfo['outcome']}
            - 핵심 개념: {concepts}
            - 산출물: {dayInfo['projectPrompt']}
            - 변형: {dayInfo['challenge']}
            - Colab: [바로 열기]({colabUrl('colab/' + notebookName(dayInfo))})
            - marimo: [molab에서 열기]({molabUrl('marimo/' + marimoName(dayInfo))})
            """
        )
    milestoneRows = "\n".join(
        f"| Day {day:02d} | {title} | 이전 개념 3개 이상을 함께 써서 미니 프로젝트를 다시 구현한다. |"
        for day, title in MILESTONE_DAYS.items()
    )
    reviewRows = "\n".join(
        f"| Day {startDay:02d}-{endDay:02d} | [Colab 열기]({colabUrl('colab/' + reviewNotebookName(startDay, endDay))}) | [molab 열기]({molabUrl('marimo/' + reviewNotebookName(startDay, endDay).replace('.ipynb', '.py'))}) |"
        for startDay, endDay in REVIEW_RANGES
    )
    content = f"""
    # Python 30일 완성 코스 가이드

    이 문서는 커리큘럼 맵, 학습 방법론, 품질 루브릭, 운영 가이드, 최종 프로젝트 명세를 하나로 합친 배포용 기준 문서입니다. 학습자가 볼 문서는 `readme.md`와 이 파일만으로 충분해야 합니다.

    ## 과정의 위치

    Codaro는 교육용 지능형 GUI 프로그램으로 진화하는 중입니다. 이 과정은 그 전에 먼저 배포하는 독립 학습 노트북입니다. 학습자는 별도 도우미 없이도 Colab 또는 marimo에서 순수 파이썬을 30일 동안 단계적으로 익힐 수 있어야 합니다.

    ## 학습 설계

    각 Day는 같은 리듬을 유지합니다.

    1. 오늘의 초점과 완성 기준을 확인한다.
    2. 왜 배우는지, 어떤 생각 모델로 접근할지 읽는다.
    3. 진단 질문과 시작 전 회상으로 이전 기억을 꺼낸다.
    4. 실행 추적과 라인별 해설로 코드의 상태 변화를 본다.
    5. 예측 문제를 먼저 풀고 실행으로 검증한다.
    6. 빈칸 채우기, 버그 수정, 오답 노트를 통해 실패를 고친다.
    7. 전이 연습과 자동 체크포인트로 실제 이해를 확인한다.
    8. 미니 프로젝트, 누적 프로젝트, 추가 문제은행으로 자기 예제로 확장한다.

    ## 방법론

    - R3 루프: Recall, Run, Repair를 매일 반복한다.
    - 실행 전 예측: 결과를 먼저 적은 뒤 실행한다.
    - 작은 입력 검증: 새 문법은 작은 데이터로 먼저 검증한다.
    - 오류 읽기: 에러 이름, 줄 위치, 원인을 분리해서 기록한다.
    - 전이 사다리: 예제와 다른 데이터, 다른 변수명, 다른 맥락으로 다시 푼다.
    - 5일 회수: 5일마다 리뷰 노트북으로 단기 기억을 다시 꺼낸다.

    ## 파일 형식 기준

    - `colab/` 노트북은 순차 실행 상태를 그대로 사용하는 `.ipynb` 워크북입니다.
    - `marimo/` 노트북은 `import marimo`, `app = marimo.App(...)`, `@app.cell` 구조의 네이티브 `.py` 앱입니다.
    - marimo 코드 셀은 중복 변수 오류를 피하면서 Colab식 순차 실습 흐름을 유지하기 위해 공유 학습 상태에서 실행됩니다.
    - 일부 셀은 의도적으로 실패합니다. 실패 셀은 삭제하지 않고 원인을 설명한 뒤 고치는 것이 학습 목표입니다.

    ## 품질 루브릭

    Day별 통과 기준은 아래 6개입니다.

    - 예측: 실행 전에 결과를 먼저 썼다.
    - 구현: 빈칸 문제의 `assert`가 통과했다.
    - 디버깅: 버그 수정 문제의 에러 이름과 원인을 설명했다.
    - 전이: 같은 개념을 다른 맥락의 전이 연습에서 다시 사용했다.
    - 검증: 자동 체크포인트의 모든 항목이 통과했다.
    - 변형: 미니 프로젝트 또는 누적 프로젝트를 자기 데이터로 바꿨다.

    ## 마일스톤

    | Day | 이름 | 통과 기준 |
    |---:|---|---|
    {milestoneRows}

    ## 리뷰 노트북

    | 범위 | Colab | marimo |
    |---|---|---|
    {reviewRows}

    ## 운영 가이드

    - 하루에 노트북 하나만 끝내는 것을 기본 속도로 둔다.
    - 처음 틀린 답에는 바로 정답을 보지 않고 어떤 값과 타입을 기대했는지 먼저 적는다.
    - 체크포인트 실패는 되돌아갈 위치를 알려주는 신호로 본다.
    - 마일스톤 Day에는 새 진도보다 이전 개념을 연결하는지 확인한다.
    - 리뷰 노트북은 반드시 새 데이터로 다시 풀어야 한다.

    ## 최종 프로젝트

    Day 30의 최종 산출물은 30일 학습 리포트 프로그램입니다.

    필수 기능:

    - 학습 기록을 표현하는 클래스 또는 딕셔너리 구조
    - 완료한 Day 수와 완료율 계산
    - 총 학습 시간과 완료한 학습 시간 계산
    - 미완료 주제 목록 생성
    - JSON 파일 저장과 다시 읽기
    - 잘못된 입력에 대한 예외 처리 또는 검증 함수

    우수 기준:

    - 함수가 3개 이상으로 분리되어 있다.
    - 변수명만 읽어도 데이터 의미가 드러난다.
    - `assert` 또는 자동 체크 코드로 핵심 결과를 검증한다.
    - 최종 JSON 파일을 다시 읽어 저장 결과를 확인한다.
    - 다음 학습 주제를 추천하는 간단한 규칙이 있다.

    ## 공개 전 체크

    - `tools/createNotebooks.py`로 전체 파일을 재생성할 수 있다.
    - `tools/validateCourse.py`가 통과한다.
    - Day 노트북 30개와 리뷰 노트북 6개가 Colab과 marimo 양쪽에 존재한다.
    - marimo 파일은 percent marker가 아니라 `@app.cell` 구조를 가진다.
    - 루트 문서는 `readme.md`, `courseGuide.md`, `manifest.json`, `progressTracker.csv`로 좁힌다.

    ## Day별 지도

    {''.join(daySections)}
    """
    (ROOT / "courseGuide.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeCurriculumMap() -> None:
    sections = []
    for dayInfo in DAY_CONTENT:
        concepts = ", ".join(dayInfo["concepts"])
        sections.append(
            f"""
            ## Day {int(dayInfo['day']):02d}. {dayInfo['title']}

            - Colab: `colab/{notebookName(dayInfo)}`
            - marimo: `marimo/{marimoName(dayInfo)}`
            - 초점: {dayInfo['focus']}
            - 완성 기준: {dayInfo['outcome']}
            - 핵심 개념: {concepts}
            - 미니 프로젝트: {dayInfo['projectPrompt']}
            - 변형 과제: {dayInfo['challenge']}
            """
        )
    content = f"""
    # Python 30일 완성 커리큘럼 맵

    이 문서는 30개 노트북의 학습 의도와 산출물을 한눈에 보기 위한 설계표입니다. 각 Day는 하나의 핵심 주제를 다루되, 이전 Day의 개념을 계속 재사용하도록 구성했습니다.

    ## 진행 원칙

    - Day 01-06: 실행 감각, 값, 문자열
    - Day 07-12: 자료구조
    - Day 13-20: 흐름 제어, 함수, 파일, 예외
    - Day 21: 중간 종합
    - Day 22-28: 객체지향과 고급 문법
    - Day 29-30: 알고리즘과 최종 프로젝트

    {''.join(sections)}
    """
    (ROOT / "curriculumMap.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeLearningDesign() -> None:
    content = """
    # 학습 설계

    ## 대상

    완전 초보자부터 기초 문법을 다시 다지고 싶은 학습자까지를 대상으로 합니다. 외부 패키지보다 순수 파이썬 문법과 표준 라이브러리를 우선합니다.

    ## 노트북 구조

    각 Day는 같은 리듬을 가지되, v4에서는 공개 강의용 워크북으로 쓰일 수 있도록 진단, 개념 경계, 라인별 해설, 추가 문제은행, 실전 랩 기준까지 포함합니다.

    1. 오늘의 초점과 완성 기준
    2. 왜 배우는가, 생각 모델, 자주 하는 실수
    3. 진단 질문
    4. 시작 전 회상
    5. 오늘의 통과 기준 또는 마일스톤 기준
    6. 개념 경계
    7. 실행 추적과 라인별 해설
    8. 핵심 예제
    9. 예측 후 실행
    10. 빈칸 채우기
    11. 버그 수정과 오답 노트
    12. 전이 연습
    13. 자동 체크포인트
    14. 실전 랩과 30일 누적 프로젝트
    15. 추가 문제은행, 자동 자기점검, 종료 티켓

    ## 설계 원칙

    - 한 셀에는 한 가지 생각만 담습니다.
    - 실행 전에 먼저 예측하게 합니다.
    - 완전히 빈 화면에서 시작하지 않고, 거의 완성된 코드의 빈칸을 채우게 합니다.
    - 오류 메시지를 학습 자료로 사용합니다.
    - 매일 작은 산출물을 만들고, 누적 프로젝트에서 그 산출물의 일부 패턴을 재사용합니다.
    - 설명은 충분히 구체적으로 쓰되, 실행 셀을 바로 따라가게 배치합니다.
    - Day 5, 10, 15, 20, 25, 30은 마일스톤으로 보고 이전 내용을 함께 점검합니다.
    - 새 개념이 이전 개념과 섞일 때는 반드시 작은 데이터로 먼저 검증합니다.
    - 자동 체크포인트는 학습자의 현재 노트북 상태를 검사합니다. 실패가 나오면 정답을 보는 대신 실패 셀로 돌아갑니다.
    - 5일 단위 리뷰 노트북은 단기 기억을 장기 기억으로 넘기는 회수 장치입니다.

    ## 평가 기준

    - 예측 문제를 실행 전 스스로 답했는가?
    - 빈칸 문제의 `assert`가 통과했는가?
    - 버그 수정 문제에서 원인을 말로 설명할 수 있는가?
    - 전이 연습을 정답 없이 해결했는가?
    - 자동 체크포인트가 전부 통과했는가?
    - 미니 프로젝트를 자기 데이터로 한 번 변형했는가?
    - 추가 문제은행에서 최소 2개 문제를 새 셀에 풀었는가?
    - 누적 프로젝트 셀을 실행하고 오늘 문법이 어디에 추가되었는지 설명할 수 있는가?
    - 5일 단위 리뷰 노트북의 시험형 과제를 통과했는가?
    - Day 30에서 JSON 파일 저장까지 포함한 최종 리포트를 완성했는가?

    ## 실행 환경 메모

    `colab/`의 `.ipynb`는 Colab에 업로드하거나 GitHub에서 열어 실행할 수 있습니다. `marimo/`의 `.py`는 네이티브 marimo 앱 형식이므로 marimo에서 열어 같은 흐름으로 학습할 수 있습니다. 일부 셀은 의도적으로 실패하므로, 전체 실행보다 섹션별 실행을 권장합니다.
    """
    (ROOT / "learningDesign.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeMethodology() -> None:
    content = """
    # 학습 방법론

    이 과정은 설명을 오래 읽는 방식이 아니라, 짧게 예측하고 실행하고 고치는 방식으로 설계되어 있습니다. 각 방법은 노트북 안의 실제 셀 구조와 연결됩니다.

    ## 1. R3 루프

    Recall, Run, Repair의 반복입니다.

    - Recall: 시작 전 회상과 진단 질문으로 이전 기억을 먼저 꺼냅니다.
    - Run: 예측을 적고 코드를 실행합니다.
    - Repair: 예상과 다르면 버그 수정 셀과 오답 노트로 원인을 고칩니다.

    ## 2. 실행 추적 표

    코드를 보기만 하지 않고 입력값, 변환, 결과를 분리합니다. 초보자는 문법보다 “어느 줄에서 값이 바뀌는지”를 놓치기 때문에, 모든 Day에 실행 추적과 라인별 해설을 넣었습니다.

    ## 3. 전이 사다리

    예제와 같은 문제를 푸는 것은 이해가 아닙니다. 그래서 각 Day는 빈칸 문제 다음에 다른 데이터, 다른 변수명, 다른 맥락의 전이 연습을 둡니다.

    ## 4. 체크포인트 계약

    자동 체크포인트는 학습자가 고친 코드가 실제로 맞는지 확인합니다. 실패가 나오면 다음 설명으로 넘어가는 대신, 해당 셀로 돌아가 다시 고칩니다.

    ## 5. 5일 회수

    Day 5, 10, 15, 20, 25, 30마다 리뷰 노트북을 둡니다. 이 리뷰는 새 진도가 아니라 단기 기억을 꺼내 다시 조합하는 시험형 과제입니다.

    ## 6. 누적 프로젝트 척추

    매일의 작은 프로젝트가 Day 30의 학습 리포트로 이어집니다. 문법을 따로따로 외우지 않고, 하나의 프로그램을 키워가며 배운 내용을 연결합니다.
    """
    (ROOT / "methodology.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeQualityRubric() -> None:
    content = """
    # 품질 루브릭

    이 과정의 목표는 “30일 동안 노트북을 열어봤다”가 아니라, 학습자가 순수 파이썬으로 작은 프로그램을 스스로 설계하고 고칠 수 있는 상태에 도달하는 것입니다.

    ## Day별 통과 기준

    각 Day는 아래 6개 항목을 모두 만족해야 완료입니다.

    - 예측: 실행 전에 결과를 먼저 썼다.
    - 구현: 빈칸 문제의 `assert`가 통과했다.
    - 디버깅: 버그 수정 문제의 에러 이름과 원인을 설명했다.
    - 전이: 같은 개념을 다른 맥락의 전이 연습에서 다시 사용했다.
    - 자동 검증: 자동 체크포인트의 모든 항목이 통과했다.
    - 변형: 미니 프로젝트 또는 누적 프로젝트를 자기 데이터로 바꿨다.

    ## 마일스톤 기준

    Day 05, 10, 15, 20, 25, 30은 누적 점검일입니다. 이 날은 해당 Day만 끝내는 것으로 충분하지 않습니다.

    - 최소 3개 이전 Day 개념을 함께 사용해야 합니다.
    - 이전 미니 프로젝트 하나를 다시 구현해야 합니다.
    - 실수 하나를 골라 “왜 틀렸고 어떻게 고쳤는지” 적어야 합니다.
    - 다음 마일스톤 전까지 보강할 약점을 하나 정해야 합니다.

    ## 훌륭한 학습의 증거

    - 코드를 외우지 않고, 작은 입력을 손으로 먼저 계산할 수 있다.
    - 에러 메시지를 무시하지 않고 예외 이름, 위치, 원인을 구분한다.
    - 변수명과 함수명만 읽어도 코드의 목적이 드러난다.
    - 한 셀을 고치면 어떤 결과가 달라질지 실행 전에 예측한다.
    - Day 30에서 파일 저장을 포함한 학습 리포트 프로그램을 자기 방식으로 확장한다.

    ## 강의자 관점의 보강 대상

    이 v4는 공개 배포를 전제로 노트북 내부 깊이, 자동 검증, 추가 문제은행, 5일 단위 리뷰, 운영 문서를 강화한 버전입니다. 이후 더 끌어올릴 부분은 학습자 제출 노트북 자동 채점과 시각 자료입니다.
    """
    (ROOT / "qualityRubric.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeTeacherGuide() -> None:
    content = """
    # 강의자 가이드

    ## 운영 원칙

    이 과정은 문법 설명을 길게 듣는 강의가 아니라, 실행 전 예측하고 실패를 고치며 작은 프로그램을 완성하는 실습형 과정입니다. 강의자는 정답을 먼저 설명하기보다 학습자가 어떤 예측을 했고 왜 빗나갔는지를 확인합니다.

    ## 1일 권장 진행

    - 5분: 진단 질문과 시작 전 회상
    - 10분: 개념 경계, 라인별 해설, 핵심 예제
    - 10분: 예측 문제와 빈칸 문제
    - 10분: 버그 수정과 오답 노트
    - 10분: 전이 연습과 자동 체크포인트
    - 15분: 실전 랩, 누적 프로젝트, 추가 문제은행

    ## 피드백 규칙

    - 처음 틀린 답에는 정답을 주지 않고 어떤 값과 타입을 기대했는지 묻습니다.
    - 에러가 나면 에러 이름, 줄 위치, 원인을 분리해서 말하게 합니다.
    - 자동 체크포인트 실패는 벌점이 아니라 되돌아갈 위치를 알려주는 신호로 다룹니다.
    - 마일스톤 Day에는 새 진도보다 이전 개념을 연결하는지 확인합니다.
    - 5일 리뷰 노트북은 반드시 새 데이터로 다시 풀게 합니다.

    ## 리뷰어 체크

    - 학습자가 변수명을 의미 있게 바꿨는가?
    - 코드가 작게 나뉘어 있고 중간 결과를 확인하는가?
    - 같은 개념을 다른 데이터로 다시 쓸 수 있는가?
    - 추가 문제은행에서 스스로 만든 `assert`가 있는가?
    - Day 30 최종 프로젝트가 학습자 자신의 데이터와 문장으로 확장되었는가?
    """
    (ROOT / "teacherGuide.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writeCapstoneSpec() -> None:
    content = """
    # 최종 프로젝트 명세

    ## 프로젝트 이름

    Python 30일 학습 리포트

    ## 목표

    30일 동안 배운 순수 파이썬 문법을 사용해 학습 기록을 저장하고 요약하는 작은 프로그램을 완성합니다. 이 프로젝트는 Day 30의 한 셀을 실행하는 것으로 끝나지 않고, 학습자 자신의 기록 데이터로 확장해야 합니다.

    ## 필수 기능

    - 학습 기록을 표현하는 클래스 또는 딕셔너리 구조
    - 완료한 Day 수와 완료율 계산
    - 총 학습 시간과 완료한 학습 시간 계산
    - 미완료 주제 목록 생성
    - JSON 파일 저장과 다시 읽기
    - 잘못된 입력에 대한 예외 처리 또는 검증 함수

    ## 우수 기준

    - 함수가 3개 이상으로 분리되어 있다.
    - 변수명만 읽어도 데이터 의미가 드러난다.
    - `assert` 또는 자동 체크 코드로 핵심 결과를 검증한다.
    - 최종 JSON 파일을 다시 읽어 저장 결과를 확인한다.
    - 다음 학습 주제를 추천하는 간단한 규칙이 있다.

    ## 제출물

    - 완성한 Day 30 노트북
    - 생성된 JSON 파일
    - “가장 많이 고친 버그 1개와 배운 점” 3문장 회고
    """
    (ROOT / "capstoneSpec.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def writePublishingReview() -> None:
    content = """
    # 배포 리뷰

    ## 공개 전 필수 확인

    - `tools/createNotebooks.py`로 노트북을 재생성할 수 있다.
    - `tools/validateCourse.py`가 통과한다.
    - 노트북 30개가 모두 JSON으로 파싱된다.
    - 모든 코드 셀이 문법적으로 유효하다.
    - 의도적으로 실패하는 셀은 학습 설명에 명시되어 있다.
    - Day 05, 10, 15, 20, 25, 30이 마일스톤으로 표시되어 있다.
    - 자동 체크포인트가 모든 Day에 존재한다.
    - 5일 단위 리뷰 노트북 6개가 존재한다.
    - 최종 프로젝트 명세와 품질 루브릭이 README에서 발견 가능하다.

    ## 공개 품질 기준

    이 과정은 “문법을 나열한 자료”가 아니라 “학습자가 매일 손으로 검증하고 5일마다 회수하는 과정”으로 배포합니다. 따라서 설명의 양보다 중요한 것은 진단, 예측, 실행, 실패, 수정, 전이, 검증, 리뷰가 실제 노트북 안에서 반복되는지입니다.

    ## 남은 개선 후보

    - 학습자 제출 노트북 자동 채점 스크립트
    - 시각 자료가 필요한 개념의 다이어그램
    - Colab badge 링크 자동 생성
    """
    (ROOT / "publishingReview.md").write_text(cleanMarkdown(content) + "\n", encoding="utf-8")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    COLAB_DIR.mkdir(parents=True, exist_ok=True)
    MARIMO_DIR.mkdir(parents=True, exist_ok=True)
    for dayInfo in DAY_CONTENT:
        writeNotebook(dayInfo)
        writeMarimoNotebook(dayInfo)
    writeReviewNotebooks()
    writeManifest()
    writeProgressCsv()
    writeReadme()
    writeCourseGuide()


if __name__ == "__main__":
    main()
