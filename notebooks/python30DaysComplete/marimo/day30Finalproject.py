import marimo

__generated_with = "0.23.6"

app = marimo.App(app_title="Day 30. 최종 프로젝트")


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
    # Day 30. 최종 프로젝트

    이 노트북은 `study/python/30days/day30_최종프로젝트.yaml` YAML을 원본으로 생성했습니다. 위에서 아래로 읽고 실행하되, 연습 셀은 일부러 비워둔 공간입니다.

    ## 오늘 배우는 것

    - 30일간 배운 모든 개념 통합
    - 실전 프로젝트 구현
    - 문제 해결 능력 완성
    - 파이썬 마스터 달성

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

    - 오늘 새로 배우는 개념: 복습
    - 이미 써도 되는 개념: everything
    - 오늘은 일부러 쓰지 않는 개념: external_library

    범위를 좁히는 이유는 간단합니다. 처음 배우는 사람은 한 번에 많은 문법을 보면 어디서 막혔는지 찾기 어렵습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 텍스트 처리 프로젝트

    *문자열과 파일 다루기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    텍스트 처리는 파이썬의 대표적인 활용 분야입니다. 파일 읽기, 문자열 조작, 단어 카운팅, 텍스트 분석 등을 조합하여 실용적인 프로그램을 만들 수 있습니다. 딕셔너리와 리스트를 활용하여 효율적으로 데이터를 관리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 파일 읽기와 쓰기
    - 문자열 메서드 활용
    - 딕셔너리로 카운팅
    - 데이터 분석
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 단어 빈도 분석기

    텍스트에서 단어 빈도를 분석합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0007():
        def analyzeWords(text):
            words = text.lower().split()
            frequency = {}
            for word in words:
                cleaned = word.strip('.,!?')
                if cleaned:
                    frequency[cleaned] = frequency.get(cleaned, 0) + 1
            return frequency

        sampleText = 'hello world hello python world'
        return analyzeWords(sampleText)
    _snippet_0007()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 최빈 단어 찾기

    가장 많이 등장하는 단어를 찾습니다.
    """)
    return

@app.cell
def _():
    def _snippet_0009():
        def findTopWords(text, n):
            words = text.lower().split()
            freq = {}
            for word in words:
                freq[word] = freq.get(word, 0) + 1
            sorted_items = sorted(freq.items(), key=lambda x: x[1], reverse=True)
            return sorted_items[:n]

        document = 'python is great python is powerful python is easy'
        return findTopWords(document, 2)
    _snippet_0009()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 문장 통계

    텍스트의 통계 정보를 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0011():
        def textStats(text):
            sentences = text.split('.')
            words = text.split()
            chars = len(text)
            return len(sentences) - 1, len(words), chars

        passage = 'This is a test. Python is amazing. I love coding.'
        return textStats(passage)
    _snippet_0011()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 텍스트 처리는 웹 크롤링, 데이터 분석, 자연어 처리의 기초입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 데이터 관리 프로젝트

    *자료구조 활용하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    데이터 관리는 리스트, 딕셔너리, 세트를 조합하여 효율적으로 정보를 저장하고 조회하는 것입니다. 학생 성적 관리, 재고 관리, 주소록 등 실생활 문제를 자료구조로 해결할 수 있습니다. 클래스를 사용하면 더욱 체계적으로 관리할 수 있습니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 리스트로 순서 관리
    - 딕셔너리로 빠른 조회
    - 세트로 중복 제거
    - 클래스로 구조화
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 학생 성적 관리

    학생들의 성적을 관리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0017():
        class GradeBook:
            def __init__(self):
                self.students = {}

            def addScore(self, name, score):
                if name not in self.students:
                    self.students[name] = []
                self.students[name].append(score)

            def getAverage(self, name):
                if name in self.students:
                    scores = self.students[name]
                    return sum(scores) / len(scores)
                return 0

        gb = GradeBook()
        gb.addScore('Alice', 90)
        gb.addScore('Alice', 85)
        return gb.getAverage('Alice')
    _snippet_0017()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 재고 관리 시스템

    물품의 재고를 관리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0019():
        class Inventory:
            def __init__(self):
                self.items = {}

            def add(self, item, quantity):
                self.items[item] = self.items.get(item, 0) + quantity

            def remove(self, item, quantity):
                if item in self.items:
                    self.items[item] = max(0, self.items[item] - quantity)

            def check(self, item):
                return self.items.get(item, 0)

        inv = Inventory()
        inv.add('apple', 10)
        inv.remove('apple', 3)
        return inv.check('apple')
    _snippet_0019()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연락처 관리

    연락처를 저장하고 검색합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0021():
        class ContactBook:
            def __init__(self):
                self.contacts = {}

            def add(self, name, phone):
                self.contacts[name] = phone

            def find(self, name):
                return self.contacts.get(name, 'Not found')

            def delete(self, name):
                if name in self.contacts:
                    del self.contacts[name]
                    return True
                return False

        cb = ContactBook()
        cb.add('John', '123-4567')
        return cb.find('John')
    _snippet_0021()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 적절한 자료구조를 선택하면 프로그램의 효율성이 크게 향상됩니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 게임 로직 프로젝트

    *알고리즘으로 게임 만들기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    게임 로직은 조건문, 반복문, 함수를 조합하여 규칙을 구현합니다. 숫자 맞추기, 가위바위보, 틱택토 등 간단한 게임을 만들면서 프로그래밍 논리를 익힐 수 있습니다. 난수 생성과 사용자 입력 처리가 핵심입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 게임 규칙 구현
    - 상태 관리
    - 승패 판정
    - 점수 계산
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 가위바위보 게임

    가위바위보 승패를 판정합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0027():
        def playRPS(player1, player2):
            wins = {
                'rock': 'scissors',
                'scissors': 'paper',
                'paper': 'rock'
            }
            if player1 == player2:
                return 'draw'
            elif wins[player1] == player2:
                return 'player1'
            else:
                return 'player2'

        return playRPS('rock', 'scissors')
    _snippet_0027()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 틱택토 승리 체크

    틱택토에서 승리 조건을 확인합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0029():
        def checkWinner(board):
            lines = [
                [board[0], board[1], board[2]],
                [board[3], board[4], board[5]],
                [board[6], board[7], board[8]],
                [board[0], board[3], board[6]],
                [board[1], board[4], board[7]],
                [board[2], board[5], board[8]],
                [board[0], board[4], board[8]],
                [board[2], board[4], board[6]]
            ]
            for line in lines:
                if line[0] == line[1] == line[2] and line[0] != ' ':
                    return line[0]
            return None

        gameBoard = ['X', 'X', 'X', 'O', 'O', ' ', ' ', ' ', ' ']
        return checkWinner(gameBoard)
    _snippet_0029()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 주사위 게임

    두 주사위의 합을 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0031():
        import random

        def rollDice():
            die1 = random.randint(1, 6)
            die2 = random.randint(1, 6)
            return die1 + die2

        return rollDice()
    _snippet_0031()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 게임 로직은 조건문과 반복문을 연습하기에 좋은 주제입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 파일 처리 프로젝트

    *데이터 저장과 불러오기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    파일 처리는 데이터를 영구적으로 저장하고 불러오는 기능입니다. CSV 파일 읽기, JSON 형식 저장, 로그 파일 작성 등 실무에서 자주 사용됩니다. with 문을 사용하여 안전하게 파일을 관리하고, 예외 처리로 오류를 방지합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 파일 읽기/쓰기
    - with 문 활용
    - 예외 처리
    - 데이터 형식 변환
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### CSV 읽기

    CSV 형식의 데이터를 파싱합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0037():
        def parseCSV(content):
            lines = content.strip().split('\n')
            header = lines[0].split(',')
            data = []
            for line in lines[1:]:
                values = line.split(',')
                row = dict(zip(header, values))
                data.append(row)
            return data

        csvContent = 'name,age\nAlice,25\nBob,30'
        return parseCSV(csvContent)
    _snippet_0037()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 로그 생성

    로그 메시지를 생성합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0039():
        import time

        def createLog(level, message):
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            return f'[{timestamp}] {level}: {message}'

        return createLog('INFO', 'Application started')
    _snippet_0039()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 설정 파일 파싱

    key=value 형식의 설정을 파싱합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0041():
        def parseConfig(text):
            config = {}
            for line in text.strip().split('\n'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
            return config

        configText = 'host=localhost\nport=8080\ndebug=true'
        return parseConfig(configText)
    _snippet_0041()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 파일 처리는 데이터 영속성을 위한 필수 기능입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 객체지향 프로젝트

    *클래스로 모델링하기*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    객체지향 프로그래밍은 현실 세계를 클래스와 객체로 모델링합니다. 은행 계좌, 도서관 시스템, 쇼핑카트 등을 클래스로 설계하면 코드의 재사용성과 유지보수성이 향상됩니다. 상속과 캡슐화를 활용하여 체계적인 프로그램을 작성합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 클래스 설계
    - 상속과 다형성
    - 캡슐화
    - 메서드 구현
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 은행 계좌

    입금과 출금이 가능한 계좌를 만듭니다.
    """)
    return

@app.cell
def _():
    def _snippet_0047():
        class BankAccount:
            def __init__(self, owner, balance=0):
                self.owner = owner
                self.balance = balance

            def deposit(self, amount):
                if amount > 0:
                    self.balance = self.balance + amount
                    return True
                return False

            def withdraw(self, amount):
                if 0 < amount <= self.balance:
                    self.balance = self.balance - amount
                    return True
                return False

        account = BankAccount('Alice', 1000)
        account.deposit(500)
        account.withdraw(300)
        return account.balance
    _snippet_0047()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 도서관 시스템

    책 대출과 반납을 관리합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0049():
        class Library:
            def __init__(self):
                self.books = {}
                self.borrowed = {}

            def addBook(self, title, copies):
                self.books[title] = copies

            def borrow(self, user, title):
                if self.books.get(title, 0) > 0:
                    self.books[title] = self.books[title] - 1
                    if user not in self.borrowed:
                        self.borrowed[user] = []
                    self.borrowed[user].append(title)
                    return True
                return False

            def returnBook(self, user, title):
                if user in self.borrowed and title in self.borrowed[user]:
                    self.borrowed[user].remove(title)
                    self.books[title] = self.books[title] + 1
                    return True
                return False

        lib = Library()
        lib.addBook('Python Guide', 3)
        lib.borrow('Bob', 'Python Guide')
        return lib.books['Python Guide']
    _snippet_0049()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 쇼핑 카트

    장바구니에 상품을 추가하고 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0051():
        class ShoppingCart:
            def __init__(self):
                self.items = {}

            def add(self, item, price, quantity=1):
                if item in self.items:
                    self.items[item]['quantity'] = self.items[item]['quantity'] + quantity
                else:
                    self.items[item] = {'price': price, 'quantity': quantity}

            def getTotal(self):
                total = 0
                for item in self.items.values():
                    total = total + item['price'] * item['quantity']
                return total

        cart = ShoppingCart()
        cart.add('apple', 1.5, 3)
        cart.add('banana', 0.8, 5)
        return cart.getTotal()
    _snippet_0051()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 클래스는 관련된 데이터와 기능을 하나로 묶어 관리합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## 알고리즘 프로젝트

    *효율적인 문제 해결*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    알고리즘 프로젝트는 정렬, 검색, 재귀를 조합하여 복잡한 문제를 해결합니다. 데이터 필터링, 패턴 찾기, 최적화 등 실무에서 자주 마주치는 문제들을 효율적으로 처리하는 방법을 배웁니다. 시간 복잡도를 고려하여 최적의 알고리즘을 선택합니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    - 정렬과 검색 조합
    - 재귀로 문제 분해
    - 효율성 고려
    - 최적화 전략
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 중복 제거 정렬

    중복을 제거하고 정렬합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0057():
        def uniqueSorted(arr):
            seen = set()
            unique = []
            for item in arr:
                if item not in seen:
                    seen.add(item)
                    unique.append(item)
            return sorted(unique)

        mixedData = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
        return uniqueSorted(mixedData)
    _snippet_0057()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 그룹핑

    조건에 따라 데이터를 그룹화합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0059():
        def groupBy(arr, keyFunc):
            groups = {}
            for item in arr:
                key = keyFunc(item)
                if key not in groups:
                    groups[key] = []
                groups[key].append(item)
            return groups

        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        return groupBy(numbers, lambda x: 'even' if x % 2 == 0 else 'odd')
    _snippet_0059()
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 범위 합계

    특정 범위의 합을 빠르게 계산합니다.
    """)
    return

@app.cell
def _():
    def _snippet_0061():
        def rangeSumQuery(arr):
            prefixSum = [0]
            for num in arr:
                prefixSum.append(prefixSum[-1] + num)

            def query(start, end):
                return prefixSum[end + 1] - prefixSum[start]

            return query

        queryFunc = rangeSumQuery([1, 2, 3, 4, 5])
        return queryFunc(1, 3)
    _snippet_0061()
    return

@app.cell
def _(mo):
    mo.md(r"""
    > **팁**
    >
    > 알고리즘은 문제를 효율적으로 해결하는 절차입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ## Day 30 최종 복습

    *30일 완성 프로젝트*
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    30일간 배운 모든 파이썬 문법을 종합하여 실전 프로젝트를 완성합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전하며 파이썬 마스터가 되어보세요.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본1: 문자열 역순

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본2: 리스트 필터

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본3: 딕셔너리 병합

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본4: 카운터 클래스

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟢 기본5: 팩토리얼 반복

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용1: 투표 시스템

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용2: 날짜 파싱

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용3: 스택 구현

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용4: 큐 구현

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🟡 응용5: 온도 변환기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화1: JSON 파싱

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화2: 메모이제이션

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화3: 단어 체인

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화4: 행렬 전치

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화5: 괄호 검증

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화6: LRU 캐시

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화7: 표현식 계산기

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화8: 최소 편집 거리

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화9: 트리 순회

    아래 빈 코드 셀에 직접 작성하세요. 바로 위 예제를 그대로 복사하기보다 이름이나 값을 조금 바꿔 다시 써보는 것이 목표입니다.
    """)
    return

@app.cell
def _(mo):
    mo.md(r"""
    ### 연습: 🔴 심화10: 완성 축하

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
