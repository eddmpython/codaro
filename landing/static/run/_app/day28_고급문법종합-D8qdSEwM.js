var e=`meta:
  id: day28
  title: 고급 문법 종합
  day: 28
  category: 30days
  tags:
  - 고급문법
  - 컨텍스트매니저
  - 데코레이터
  - 제너레이터
  - 검증
  seo:
    title: 파이썬 고급 문법 종합 - 컨텍스트 매니저
    description: with 문, context manager, __enter__, __exit__을 배웁니다.
    keywords:
    - 컨텍스트매니저
    - with
    - __enter__
    - __exit__
    - 리소스관리
intro:
  emoji: 🎯
  points:
  - with 문으로 리소스 관리
  - 컨텍스트 매니저 프로토콜
  - 자동 정리 메커니즘
  - 커스텀 컨텍스트 매니저
  direction: 고급 문법 종합에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 고급 문법 종합 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: with 문 기초 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: 컨텍스트 매니저 프로토콜 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: 리소스 관리 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 고급 문법 종합 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 고급 문법 종합 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 고급 문법 종합 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: with_basic
  title: with 문 기초
  structuredPrimary: true
  subtitle: 자동 리소스 관리
  goal: with 블록을 벗어나 파일이 닫힌 뒤에야 쓴 내용이 파일에 남는다는 것을 다시 읽어 확인한다.
  why: 파일에 쓴 내용은 close가 불려야 확정됩니다. with를 쓰면 블록을 벗어나는 순간 그 close가 자동으로 불리므로, 바로 다음 줄에서 읽어도 내용이 온전합니다.
  explanation: |-
    with 문은 리소스를 자동으로 정리하는 파이썬의 강력한 기능입니다. 파일을 열고 닫거나, 데이터베이스 연결을 관리할 때 사용합니다. with 블록이 끝나면 자동으로 정리 작업이 수행되므로 close()를 직접 호출할 필요가 없습니다.

    with 문을 사용하면 예외가 발생해도 리소스가 자동으로 정리됩니다.
  snippet: |-
    from pathlib import Path
    import tempfile

    day28Scratch = Path(tempfile.mkdtemp(prefix='codaro_day28_'))
    testFile = day28Scratch / 'test.txt'
    content = ''
    with open(testFile, 'w') as f:
        f.write('Hello World')
        content = 'written'
    content
  exercise:
    prompt: |-
      마지막 줄 content를 content, testFile.read_text(encoding='utf-8')로 바꾸세요. 위의 with 블록은 그대로 둡니다.

      with 블록이 끝나며 파일이 닫혀 Hello World가 파일에 남습니다. 실행하면 ('written', 'Hello World')가 나와야 합니다.
    starterCode: |-
      from pathlib import Path
      import tempfile

      day28Scratch = Path(tempfile.mkdtemp(prefix='codaro_day28_'))
      testFile = day28Scratch / 'test.txt'
      content = ''
      with open(testFile, 'w') as f:
          f.write('Hello World')
          content = 'written'
      content
    solution: |-
      from pathlib import Path
      import tempfile

      day28Scratch = Path(tempfile.mkdtemp(prefix='codaro_day28_'))
      testFile = day28Scratch / 'test.txt'
      content = ''
      with open(testFile, 'w') as f:
          f.write('Hello World')
          content = 'written'
      content, testFile.read_text(encoding='utf-8')
    hints:
    - "마지막 줄 content 를 content, testFile.read_text(encoding='utf-8') 로 바꿉니다. 읽는 줄은 with 블록 바깥, 들여쓰기 없는 자리에 있어야 합니다."
    - "정답 형태: content, testFile.read_text(encoding='utf-8')"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('written', 'Hello World')"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"('written', 'Hello World')\\""
- id: context_manager_protocol
  title: 컨텍스트 매니저 프로토콜
  structuredPrimary: true
  subtitle: __enter__와 __exit__
  goal: __enter__가 돌려준 값이 그대로 as 뒤 변수에 들어간다는 것을, 반환값을 튜플로 바꿔 확인한다.
  why: with 블록에서 손에 쥘 것을 정하는 자리가 __enter__입니다. 여기서 무엇을 돌려주느냐에 따라 as 뒤 변수가 파일이 되기도 하고, 연결 객체나 값 묶음이 되기도 합니다.
  explanation: |-
    컨텍스트 매니저는 __enter__와 __exit__ 메서드를 구현한 객체입니다. __enter__는 with 블록 진입시 호출되고, __exit__는 블록 종료시 호출됩니다. __exit__는 예외 정보를 받아 처리할 수 있으며, True를 반환하면 예외를 억제합니다.

    __exit__의 세 매개변수는 예외 타입, 예외 값, 트레이스백입니다.
  snippet: |-
    class SimpleContext:
        def __enter__(self):
            return 'entered'

        def __exit__(self, excType, excVal, excTb):
            return False

    with SimpleContext() as sc:
        result = sc
    result
  exercise:
    prompt: |-
      __enter__의 return 'entered'를 return 'entered', 3으로 바꾸세요. 나머지 줄은 그대로 둡니다.

      as sc는 __enter__가 돌려준 값을 그대로 받으므로 sc가 문자열이 아니라 튜플이 됩니다. 실행하면 ('entered', 3)이 나와야 합니다.
    starterCode: |-
      class SimpleContext:
          def __enter__(self):
              return 'entered'

          def __exit__(self, excType, excVal, excTb):
              return False

      with SimpleContext() as sc:
          result = sc
      result
    solution: |-
      class SimpleContext:
          def __enter__(self):
              return 'entered', 3

          def __exit__(self, excType, excVal, excTb):
              return False

      with SimpleContext() as sc:
          result = sc
      result
    hints:
    - "__enter__ 안의 return 'entered' 를 return 'entered', 3 으로 바꿉니다. __exit__ 와 with 블록, 마지막 result 줄은 그대로 둡니다."
    - "정답 형태: return 'entered', 3"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('entered', 3)"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"('entered', 3)\\""
- id: resource_management
  title: 리소스 관리
  structuredPrimary: true
  subtitle: 파일과 연결 관리
  goal: 직접 만든 컨텍스트 매니저를 mode만 바꿔 다시 쓰면서, 쓰기 블록이 끝나며 닫힌 파일을 곧바로 읽어 확인한다.
  why: 열고 닫는 규칙을 클래스 한곳에 넣어 두면 쓰기든 읽기든 같은 방식으로 안전하게 쓸 수 있습니다. 호출하는 쪽마다 close를 잊지 않았는지 살필 필요가 없습니다.
  explanation: |-
    컨텍스트 매니저의 주요 용도는 리소스 관리입니다. 파일, 네트워크 연결, 데이터베이스 커넥션 등 사용 후 반드시 정리해야 하는 리소스를 안전하게 처리합니다. with 문을 사용하면 예외 발생 여부와 관계없이 리소스가 정리됩니다.

    with 블록이 중첩되면 안쪽 블록부터 바깥쪽 순서로 __exit__가 호출됩니다.
  snippet: |-
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
    'completed'
  exercise:
    prompt: |-
      마지막 줄 'completed'를 지우고 그 자리에 아래 세 줄을 넣으세요. 클래스 본문과 쓰기 with 블록은 그대로 둡니다.
      with FileManager('resource.txt', 'r') as fm:
          saved = fm.read()
      saved

      쓰기 블록이 끝날 때 __exit__가 파일을 닫았기 때문에 곧바로 다시 열어 읽을 수 있습니다. 실행하면 Resource managed가 나와야 합니다.
    starterCode: |-
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
      'completed'
    solution: |-
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

      with FileManager('resource.txt', 'r') as fm:
          saved = fm.read()
      saved
    hints:
    - "마지막 줄 'completed' 를 지우고 읽기용 with 블록을 넣습니다. FileManager 의 두 번째 인자를 'w' 가 아니라 'r' 로 주고, 블록 안에서 saved = fm.read() 로 받은 뒤 마지막 줄에 saved 만 씁니다."
    - "정답 형태: 마지막 줄 saved"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'Resource managed'
    resultCheck: "출력이 정확히 일치해야 합니다: 'Resource managed'"
- id: exception_handling
  title: 예외 처리
  structuredPrimary: true
  subtitle: 컨텍스트 매니저와 예외
  goal: with 블록 안에서 예외가 나면 그 줄 뒤가 실행되지 않는다는 것을, 앞뒤에 대입을 하나씩 넣어 확인한다.
  why: __exit__가 예외를 삼키면 셀은 멈추지 않고 계속 갑니다. 그래서 블록의 남은 줄이 건너뛰어졌다는 사실이 눈에 띄지 않고, 뒤에서 쓰는 값이 조용히 옛날 값으로 남습니다.
  explanation: |-
    컨텍스트 매니저는 예외 처리에 강력합니다. __exit__ 메서드는 예외 정보를 받아 처리할 수 있으며, True를 반환하면 예외를 억제합니다. 이를 통해 정리 작업은 수행하되 예외 전파를 제어할 수 있습니다.

    __exit__가 True를 반환하면 예외가 억제되고, False나 None을 반환하면 예외가 전파됩니다.
  snippet: |-
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
    outcome
  exercise:
    prompt: |-
      with 블록 안 outcome = 10 / 0 위에 outcome = 'started'를, 아래에 outcome = 'never'를 같은 들여쓰기로 추가하세요. 클래스 본문과 마지막 줄은 그대로 둡니다.

      10 / 0에서 예외가 나 그 아래 줄은 실행되지 않고, __exit__가 True를 돌려줘 셀은 에러 없이 끝납니다. 실행하면 started가 나와야 합니다.
    starterCode: |-
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
      outcome
    solution: |-
      class ExceptionSuppressor:
          def __enter__(self):
              return self

          def __exit__(self, excType, excVal, excTb):
              if excType is ZeroDivisionError:
                  return True
              return False

      outcome = 'no error'
      with ExceptionSuppressor():
          outcome = 'started'
          outcome = 10 / 0
          outcome = 'never'
      outcome
    hints:
    - "with 블록 안이 세 줄이 되게 만듭니다. 순서는 outcome = 'started', outcome = 10 / 0, outcome = 'never' 이고 셋 다 공백 4칸 들여쓰기입니다."
    - "정답 형태: 블록 안 첫 줄 outcome = 'started'"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'started'
    resultCheck: "출력이 정확히 일치해야 합니다: 'started'"
- id: multiple_context
  title: 다중 컨텍스트
  structuredPrimary: true
  subtitle: 여러 컨텍스트 매니저 사용
  goal: with 한 줄에 매니저 두 개를 나열해도 블록이 끝나면 둘 다 닫힌다는 것을 확인한다.
  why: 원본과 대상을 함께 열어야 하는 복사나 변환 작업에서, 하나만 닫고 다른 하나를 잊는 실수를 with 한 줄이 막아 줍니다.
  explanation: |-
    하나의 with 문에서 여러 컨텍스트 매니저를 사용할 수 있습니다. 콤마로 구분하여 나열하며, 왼쪽부터 오른쪽 순서로 __enter__가 호출되고, 오른쪽부터 왼쪽 순서로 __exit__가 호출됩니다.

    다중 컨텍스트는 with a, b, c: 형태로 작성하며, 중첩 with와 동일하게 동작합니다.
  snippet: |-
    sourceFile = day28Scratch / 'source.txt'
    destFile = day28Scratch / 'dest.txt'
    with open(sourceFile, 'w') as src, open(destFile, 'w') as dst:
        src.write('source')
        dst.write('destination')
        combined = 'both written'
    combined
  exercise:
    prompt: |-
      마지막 줄 combined를 src.closed, dst.closed로 바꾸세요. 위의 코드는 그대로 둡니다.

      with 문에 나열한 두 파일은 블록을 벗어날 때 모두 닫힙니다. 실행하면 (True, True)가 나와야 합니다.
    starterCode: |-
      sourceFile = day28Scratch / 'source.txt'
      destFile = day28Scratch / 'dest.txt'
      with open(sourceFile, 'w') as src, open(destFile, 'w') as dst:
          src.write('source')
          dst.write('destination')
          combined = 'both written'
      combined
    solution: |-
      sourceFile = day28Scratch / 'source.txt'
      destFile = day28Scratch / 'dest.txt'
      with open(sourceFile, 'w') as src, open(destFile, 'w') as dst:
          src.write('source')
          dst.write('destination')
          combined = 'both written'
      src.closed, dst.closed
    hints:
    - 마지막 줄 combined 를 src.closed, dst.closed 로 바꿉니다. with 문에서 as 로 붙인 이름 src 와 dst 를 그대로 씁니다.
    - "정답 형태: src.closed, dst.closed"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(True, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(True, True)'"
- id: practical_patterns
  title: 실전 패턴
  structuredPrimary: true
  subtitle: 컨텍스트 매니저 활용
  goal: 매니저를 변수에 담아 두면 블록이 끝난 뒤 __exit__가 남긴 측정 결과를 밖에서 꺼내 쓸 수 있다는 것을 확인한다.
  why: 걸린 시간은 실행할 때마다 달라서 값 자체를 기대값으로 쓸 수 없습니다. 이럴 때는 측정값을 그대로 비교하지 말고 0 이상인가 같은 판정으로 바꿔야 검증이 흔들리지 않습니다.
  explanation: |-
    컨텍스트 매니저는 실무에서 다양하게 활용됩니다. 타이머, 디렉토리 변경, 설정 임시 변경, 트랜잭션 관리 등 시작과 종료가 명확한 작업에 유용합니다. 코드의 안전성과 가독성을 동시에 향상시킵니다.

    컨텍스트 매니저는 '설정-작업-복원' 패턴에 이상적입니다.
  snippet: |-
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
    timer.elapsed > 0
  exercise:
    prompt: |-
      마지막 줄 timer.elapsed > 0을 total, timer.elapsed >= 0으로 바꾸세요. 클래스 본문과 with 블록은 그대로 둡니다.

      total은 sum(range(1000))이라 항상 499500이고, 걸린 시간은 실행할 때마다 다르지만 0 이상이라는 판정은 항상 True입니다. 실행하면 (499500, True)가 나와야 합니다.
    starterCode: |-
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
      timer.elapsed > 0
    solution: |-
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
      total, timer.elapsed >= 0
    hints:
    - 마지막 줄 timer.elapsed > 0 을 total, timer.elapsed >= 0 으로 바꿉니다. timer = Timer() 로 이름을 붙여 두었기 때문에 블록이 끝난 뒤에도 timer.elapsed 를 읽을 수 있습니다.
    - "정답 형태: total, timer.elapsed >= 0"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(499500, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(499500, True)'"
- id: workflow_validation
  title: '현업 흐름 검증: 리포트 파일을 안전하게 쓰고 복원하기'
  structuredPrimary: true
  subtitle: 예측 → 리소스 열기 → 오류 처리 → 정리 검증
  goal: 컨텍스트 매니저가 닫아 준 리포트 파일을 assert로 검증한 다음, 저장된 줄에서 매출 숫자를 뽑아낸다.
  why: 검증만 하고 끝내면 화면에 리포트 본문만 남습니다. 저장된 리포트에서 필요한 숫자를 꺼내야 다음 계산이나 보고에 그대로 이어 쓸 수 있습니다.
  explanation: |-
    고급 문법은 멋진 문법을 쓰는 것이 아니라, 열고 닫아야 하는 리소스와 실패 시 복원해야 하는 상태를 안전하게 다루는 데서 가치가 생깁니다. 여기서는 리포트 파일 컨텍스트 매니저를 직접 만들고 정상 기록, 오류, 정리 상태를 검증합니다.

    실무 변주: ReportWriter에 append 모드와 dryRun 옵션을 추가하고, 실패 시 기존 파일이 유지되는지까지 검증해 보세요.
  snippet: |-
    from pathlib import Path
    import tempfile

    class ReportWriter:
        def __init__(self, root, filename):
            self.root = Path(root)
            self.path = self.root / filename
            self.fileObj = None

        def __enter__(self):
            self.root.mkdir(parents=True, exist_ok=True)
            self.fileObj = self.path.open('w', encoding='utf-8')
            return self

        def writeLine(self, text):
            if not text.strip():
                raise ValueError('report line must not be empty')
            self.fileObj.write(text.strip() + '\\n')

        def __exit__(self, excType, excValue, traceback):
            self.fileObj.close()
            return False

    with tempfile.TemporaryDirectory() as tempDir:
        with ReportWriter(tempDir, 'dailyReport.txt') as report:
            report.writeLine('paidCount=2')
            report.writeLine('paidRevenue=230000')
            reportClosedInside = report.fileObj.closed
            reportPath = report.path

        savedReport = reportPath.read_text(encoding='utf-8')
        reportClosedAfter = report.fileObj.closed

    assert reportClosedInside is False
    assert reportClosedAfter is True
    assert 'paidRevenue=230000' in savedReport
    savedReport
  exercise:
    prompt: |-
      위쪽 ReportWriter 클래스, with 블록 두 개, assert 세 줄은 모두 그대로 두고 마지막 줄만 바꿉니다.
      savedReport 한 줄을 아래 두 줄로 바꾸세요.
      paidRevenueLine = savedReport.splitlines()[1]
      int(paidRevenueLine.split('=')[1])

      저장된 리포트의 둘째 줄은 paidRevenue=230000입니다. = 뒤를 잘라 정수로 바꾸므로 실행하면 230000이 나와야 합니다.
    starterCode: |-
      from pathlib import Path
      import tempfile

      class ReportWriter:
          def __init__(self, root, filename):
              self.root = Path(root)
              self.path = self.root / filename
              self.fileObj = None

          def __enter__(self):
              self.root.mkdir(parents=True, exist_ok=True)
              self.fileObj = self.path.open('w', encoding='utf-8')
              return self

          def writeLine(self, text):
              if not text.strip():
                  raise ValueError('report line must not be empty')
              self.fileObj.write(text.strip() + '\\n')

          def __exit__(self, excType, excValue, traceback):
              self.fileObj.close()
              return False

      with tempfile.TemporaryDirectory() as tempDir:
          with ReportWriter(tempDir, 'dailyReport.txt') as report:
              report.writeLine('paidCount=2')
              report.writeLine('paidRevenue=230000')
              reportClosedInside = report.fileObj.closed
              reportPath = report.path

          savedReport = reportPath.read_text(encoding='utf-8')
          reportClosedAfter = report.fileObj.closed

      assert reportClosedInside is False
      assert reportClosedAfter is True
      assert 'paidRevenue=230000' in savedReport
      savedReport
    solution: |-
      from pathlib import Path
      import tempfile

      class ReportWriter:
          def __init__(self, root, filename):
              self.root = Path(root)
              self.path = self.root / filename
              self.fileObj = None

          def __enter__(self):
              self.root.mkdir(parents=True, exist_ok=True)
              self.fileObj = self.path.open('w', encoding='utf-8')
              return self

          def writeLine(self, text):
              if not text.strip():
                  raise ValueError('report line must not be empty')
              self.fileObj.write(text.strip() + '\\n')

          def __exit__(self, excType, excValue, traceback):
              self.fileObj.close()
              return False

      with tempfile.TemporaryDirectory() as tempDir:
          with ReportWriter(tempDir, 'dailyReport.txt') as report:
              report.writeLine('paidCount=2')
              report.writeLine('paidRevenue=230000')
              reportClosedInside = report.fileObj.closed
              reportPath = report.path

          savedReport = reportPath.read_text(encoding='utf-8')
          reportClosedAfter = report.fileObj.closed

      assert reportClosedInside is False
      assert reportClosedAfter is True
      assert 'paidRevenue=230000' in savedReport
      paidRevenueLine = savedReport.splitlines()[1]
      int(paidRevenueLine.split('=')[1])
    hints:
    - "마지막 savedReport 한 줄만 두 줄로 바꿉니다. splitlines() 로 줄 목록을 만들어 [1] 로 둘째 줄을 고르고, split('=') 의 뒤쪽 조각을 int() 로 바꿉니다. 위쪽 assert 세 줄은 건드리지 않습니다."
    - "정답 형태: int(paidRevenueLine.split('=')[1])"
  check:
    type: outputExact
    evidence: practice
    outputExact: '230000'
    resultCheck: "출력이 정확히 일치해야 합니다: '230000'"
- id: practice
  title: Day 28 종합 복습
  structuredPrimary: true
  subtitle: 컨텍스트 매니저 마스터하기
  goal: 쓰기 with 블록 뒤에 읽기 with 블록을 이어 붙여, 저장된 내용을 같은 셀에서 곧바로 확인한다.
  why: 파일을 만드는 코드와 그것을 읽어 확인하는 코드가 붙어 있어야, 자동화 스크립트가 정말 원하는 내용을 남겼는지 매번 눈으로 열어 보지 않고도 알 수 있습니다.
  explanation: Day 28에서 배운 컨텍스트 매니저를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pathlib import Path
    import tempfile

    basicScratch = Path(tempfile.mkdtemp(prefix='codaro_day28_basic_'))
    basicFile = basicScratch / 'basic.txt'
    with open(basicFile, 'w') as f:
        f.write('test')
        written = True
    written
  exercise:
    prompt: |-
      마지막 줄 written을 지우고 그 자리에 아래 세 줄을 넣으세요. 위의 쓰기 with 블록은 그대로 둡니다.
      with open(basicFile, 'r') as reader:
          saved = reader.read()
      written, saved

      쓰기 블록이 끝나며 파일이 닫혀 test가 저장됩니다. 실행하면 (True, 'test')가 나와야 합니다.
    starterCode: |-
      from pathlib import Path
      import tempfile

      basicScratch = Path(tempfile.mkdtemp(prefix='codaro_day28_basic_'))
      basicFile = basicScratch / 'basic.txt'
      with open(basicFile, 'w') as f:
          f.write('test')
          written = True
      written
    solution: |-
      from pathlib import Path
      import tempfile

      basicScratch = Path(tempfile.mkdtemp(prefix='codaro_day28_basic_'))
      basicFile = basicScratch / 'basic.txt'
      with open(basicFile, 'w') as f:
          f.write('test')
          written = True
      with open(basicFile, 'r') as reader:
          saved = reader.read()
      written, saved
    hints:
    - "마지막 written 한 줄을 지우고 읽기 with 블록을 넣습니다. open(basicFile, 'r') 로 열어 saved = reader.read() 로 받고, 마지막 줄에 written, saved 를 씁니다."
    - "정답 형태: 마지막 줄 written, saved"
  check:
    type: outputExact
    evidence: practice
    outputExact: "(True, 'test')"
    resultCheck: "출력이 정확히 일치해야 합니다: \\"(True, 'test')\\""
- id: reflection
  title: Day 28 회고 - 리소스 관리 흐름 굳히기
  structuredPrimary: true
  subtitle: 기억 굳히기
  goal: 오늘 확인한 자동 닫힘, __enter__ 반환값, 예외 억제, 다중 컨텍스트 중 하나를 골라 자기 업무 코드의 어느 줄에 끼울지 정한다.
  why: 리소스를 다루는 코드의 진짜 시험대는 정상 실행이 아니라 중간에 실패했을 때입니다. 내 코드에서 무엇이 열리고 어디서 닫히는지, 실패하면 어떤 상태가 남는지를 한 번 짚어 두면 그 자리에 with를 쓸지 바로 판단할 수 있습니다.
  explanation: with 문, 컨텍스트 매니저, try/except/finally, 파일 백업과 복원 중에서 가장 인상 깊었던 한 가지를 골라, 자신의 업무 코드(엑셀 자동화, 데이터 정리, 텍스트 처리 등)에 어디에 끼울 수 있을지 한 단락으로 적어보세요.
  reflection:
    prompt: 인상 깊었던 리소스 관리 패턴 1개 + 그것을 적용할 자기 업무 코드 위치 1개를 적어주세요.
    expectedKeywords:
    - with
    - 컨텍스트 매니저
    - 예외 처리
    aiFollowup: 학습자가 고른 리소스 관리 패턴과 업무 위치를 짧게 정리하고, 실패했을 때 어떤 상태가 복원되어야 하는지 한 가지를 되묻는다.
assessment:
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 Python 행동을 검증하고, 파일 산출물이 있는 과제는 Local 재실행 증거를 추가로 요구합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
  masteryVariants:
  - id: day28-head-middle-tail-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - with_basic
    - reflection
    title: 확장 언패킹으로 목록 분해하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 첫 값, 중간 목록, 마지막 값을 한 계약으로 반환한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: split_parts(items)가 head, middle, tail을 가진 딕셔너리를 반환하도록 완성하세요.
      starterCode: |-
        def split_parts(items):
            raise NotImplementedError
      solution: |-
        def split_parts(items):
            head, *middle, tail = items
            return {'head': head, 'middle': middle, 'tail': tail}
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day28.head-middle-tail.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day28.head-middle-tail.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: split_parts
        cases:
        - id: many
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
          expectedReturn:
            head: 1
            middle:
            - 2
            - 3
            tail: 4
        - id: two
          arguments:
          - value:
            - a
            - b
          expectedReturn:
            head: a
            middle: []
            tail: b
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day28-match-payload-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day28-head-middle-tail-mastery
    title: 구조 패턴으로 payload 분류하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: match/case를 처음 보는 이벤트 데이터에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: classify_payload(payload)가 kind와 필드에 따라 'text:value', 'count:value', 또는 'unknown'을 반환하도록 완성하세요.
      starterCode: |-
        def classify_payload(payload):
            raise NotImplementedError
      solution: |-
        def classify_payload(payload):
            match payload:
                case {'kind': 'text', 'value': str(value)}:
                    return f"text:{value}"
                case {'kind': 'count', 'value': int(value)}:
                    return f"count:{value}"
                case _:
                    return 'unknown'
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day28.match-payload.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day28.match-payload.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: classify_payload
        cases:
        - id: text
          arguments:
          - value:
              kind: text
              value: hello
          expectedReturn: text:hello
        - id: count
          arguments:
          - value:
              kind: count
              value: 3
          expectedReturn: count:3
        - id: unknown
          arguments:
          - value:
              kind: other
          expectedReturn: unknown
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day28-walrus-lengths-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day28-match-payload-transfer
    title: 계산한 길이를 조건과 결과에 재사용하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: 할당 표현식을 기억에서 다시 구성한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: long_lengths(texts, minimum)가 minimum 이상인 문자열 길이만 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def long_lengths(texts, minimum):
            raise NotImplementedError
      solution: |-
        def long_lengths(texts, minimum):
            return [length for text in texts if (length := len(text)) >= minimum]
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day28.walrus-lengths.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day28.walrus-lengths.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: long_lengths
        cases:
        - id: mixed
          arguments:
          - value:
            - a
            - python
            - code
          - value: 4
          expectedReturn:
          - 6
          - 4
        - id: none
          arguments:
          - value:
            - a
            - bb
          - value: 3
          expectedReturn: []
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};