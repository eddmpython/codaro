var e=`meta:
  id: day18
  title: 모듈과import
  day: 18
  category: 30days
  outcomes: ["python.modulesAndIo"]
  prerequisites: ["python.functions"]
  estimatedMinutes: 35
  tags:
  - 모듈
  - import
  - 표준라이브러리
  - datetime
  - pathlib
  - 리포트
  - 검증
  seo:
    title: 파이썬 모듈과 import - 표준 라이브러리 활용
    description: import, from, as와 math, random, datetime 모듈을 배웁니다.
    keywords:
    - 모듈
    - import
    - math
    - random
    - datetime
intro:
  emoji: 📦
  points:
  - import로 모듈 가져오기
  - from, as로 유연하게
  - math, random, datetime 활용
  - 표준 라이브러리 사용
  direction: 모듈과import에서 입력값, 처리 로직, 출력 확인을 작은 스크립트로 연결합니다.
  benefits:
  - 문자열, 숫자, 변수 같은 예제 값 확인 후 기초 문법에 맞는 코드 입력을 고릅니다.
  - 모듈과import 결과를 출력 또는 마지막 표현식 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 작은 자동화 스크립트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: import 기본 입력 확인
      detail: 입력 기준(문자열, 숫자, 변수 같은 예제 값)과 필요한 조건을 먼저 고정합니다.
    - label: from import 처리 실행
      detail: 기초 문법 코드를 실행해 중간 결과를 확인합니다.
    - label: as 별칭 결과 검증
      detail: 출력 또는 마지막 표현식 결과 기준으로 실행 결과를 비교합니다.
    - label: 모듈과import 재사용
      detail: 완성 코드를 작은 자동화 스크립트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 기초 자동화 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 모듈과import 실행
      detail: 셀을 실행해 출력 또는 마지막 표현식 결과와 예외 상태를 확인합니다.
    - label: 모듈과import 완료
      detail: 검증된 코드를 작은 자동화 스크립트로 남깁니다.
sections:
- id: import_basic
  title: import 기본
  structuredPrimary: true
  subtitle: 모듈 가져오기
  goal: import 기본에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    모듈은 함수와 변수를 담은 파이썬 파일입니다. import 모듈명으로 모듈을 가져오고, 모듈명.함수명()으로 사용합니다. 파이썬은 많은 표준 모듈을 제공합니다.

    처음에는 필요한 모듈을 노트북 위쪽 한 셀에 모아 import하면 흐름을 이해하기 쉽습니다.
  snippet: |-
    import math

    math.sqrt(16)
  exercise:
    prompt: import 기본 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      import math

      math.sqrt(16)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: import 기본의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: import 기본 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: from_import
  title: from import
  structuredPrimary: true
  subtitle: 특정 함수만 가져오기
  goal: from import에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    from 모듈명 import 함수명으로 특정 함수만 가져올 수 있습니다. 모듈명 없이 함수명만으로 사용할 수 있습니다. 여러 함수를 쉼표로 구분하여 가져올 수 있습니다.

    필요한 함수만 가져오면 코드가 깔끔해집니다.
  snippet: |-
    from math import sqrt

    sqrt(25)
  exercise:
    prompt: from import 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from math import sqrt

      sqrt(25)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: from import의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: from import 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: import_as
  title: as 별칭
  structuredPrimary: true
  subtitle: 모듈/함수 이름 바꾸기
  goal: as 별칭에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    as 키워드로 모듈이나 함수에 별칭을 붙일 수 있습니다. import 모듈명 as 별칭 또는 from 모듈명 import 함수명 as 별칭 형식입니다. 긴 이름을 짧게 만들거나 충돌을 피할 때 사용합니다.

    별칭은 짧고 의미있게 지으세요.
  snippet: |-
    import math as m

    m.sqrt(36)
  exercise:
    prompt: as 별칭 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      import math as m

      m.sqrt(36)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: as 별칭의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: as 별칭 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: math_module
  title: math 모듈
  structuredPrimary: true
  subtitle: 수학 함수
  goal: math 모듈에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    math 모듈은 수학 함수를 제공합니다. sqrt(제곱근), ceil(올림), floor(내림), pow(거듭제곱), pi(파이), e(자연상수) 등을 사용할 수 있습니다.

    math.pow는 실수를 반환하고, ** 연산자는 정수도 유지합니다.
  snippet: |-
    from math import sqrt

    sqrt(144)
  exercise:
    prompt: math 모듈 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from math import sqrt

      sqrt(144)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: math 모듈의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: math 모듈 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: random_module
  title: random 모듈
  structuredPrimary: true
  subtitle: 난수 생성
  goal: random 모듈에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: |-
    random 모듈은 난수를 생성합니다. randint(정수 난수), choice(리스트에서 선택), shuffle(리스트 섞기), random(0~1 실수) 등을 제공합니다.

    난수는 실행할 때마다 다른 값이 나옵니다.
  snippet: |-
    from random import randint

    randint(1, 100)
  exercise:
    prompt: random 모듈 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from random import randint

      randint(1, 100)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: random 모듈의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: random 모듈 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: datetime_module
  title: datetime 모듈
  structuredPrimary: true
  subtitle: 날짜와 시간
  goal: datetime 모듈에서 \`now\` 값이 이후 출력이나 확인 결과와 어떻게 연결되는지 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    datetime 모듈은 날짜와 시간을 다룹니다. datetime.now(현재 시각), date(날짜), time(시간), timedelta(시간 차이) 등을 제공합니다.

    datetime 객체는 여러 속성과 메서드를 제공합니다.
  snippet: |-
    from datetime import datetime

    now = datetime.now()
    now.year, now.month, now.day
  exercise:
    prompt: datetime 모듈 예제에서 \`now\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      from datetime import datetime

      now = datetime.now()
      now.year, now.month, now.day
    hints:
    - 바꿀 지점은 \`now = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`now\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: datetime 모듈에서 \`now\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: datetime 모듈 실행 뒤 \`now\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: workflow_validation
  title: 실무 import 조합 루프
  structuredPrimary: true
  subtitle: 필요한 도구를 고르고 오류를 읽기
  goal: 실무 import 조합 루프에서 함수 입력과 반환값이 호출 결과로 연결되는지 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    실무에서는 모듈 하나만 외워서 쓰기보다, 표준 라이브러리 여러 개를 필요한 만큼 가져와 작은 리포트 흐름을 만듭니다. 실행 전에 어떤 모듈이 어떤 역할을 하는지 예측하고, 이름 오류가 나면 import 방식과 별칭을 확인해 고칩니다.

    import는 코드 맨 위를 꾸미는 문장이 아니라, 문제를 해결할 도구를 명확히 고르는 과정입니다. 모듈 이름을 바꾸거나 별칭을 쓰면 호출 코드도 함께 검증하세요.
  snippet: |-
    from datetime import datetime
    from pathlib import Path
    from statistics import mean

    workLogs = [
        {"startedAt": "2026-05-01 09:15", "minutes": 18, "status": "done"},
        {"startedAt": "2026-05-02 10:30", "minutes": 32, "status": "done"},
        {"startedAt": "2026-05-03 13:10", "minutes": 21, "status": "done"},
        {"startedAt": "2026-05-03 16:00", "minutes": 12, "status": "todo"},
    ]

    def summarizeWorkLogs(logs):
        finishedLogs = [log for log in logs if log["status"] == "done"]
        latestStartedAt = max(
            datetime.strptime(log["startedAt"], "%Y-%m-%d %H:%M")
            for log in finishedLogs
        )
        reportPath = Path("reports") / f"daily-{latestStartedAt:%Y-%m-%d}.txt"
        return {
            "doneCount": len(finishedLogs),
            "averageMinutes": round(mean(log["minutes"] for log in finishedLogs), 1),
            "latestDate": latestStartedAt.strftime("%Y-%m-%d"),
            "reportFile": reportPath.name,
        }

    workSummary = summarizeWorkLogs(workLogs)
    workSummary
  exercise:
    prompt: 실무 import 조합 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from datetime import datetime
      from pathlib import Path
      from statistics import mean

      workLogs = [
          {"startedAt": "2026-05-01 09:15", "minutes": 18, "status": "done"},
          {"startedAt": "2026-05-02 10:30", "minutes": 32, "status": "done"},
          {"startedAt": "2026-05-03 13:10", "minutes": 21, "status": "done"},
          {"startedAt": "2026-05-03 16:00", "minutes": 12, "status": "todo"},
      ]

      def summarizeWorkLogs(logs):
          finishedLogs = [log for log in logs if log["status"] == "done"]
          latestStartedAt = max(
              datetime.strptime(log["startedAt"], "%Y-%m-%d %H:%M")
              for log in finishedLogs
          )
          reportPath = Path("reports") / f"daily-{latestStartedAt:%Y-%m-%d}.txt"
          return {
              "doneCount": len(finishedLogs),
              "averageMinutes": round(mean(log["minutes"] for log in finishedLogs), 1),
              "latestDate": latestStartedAt.strftime("%Y-%m-%d"),
              "reportFile": reportPath.name,
          }

      workSummary = summarizeWorkLogs(workLogs)
      workSummary
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실무 import 조합 루프의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실무 import 조합 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: Day 18 종합 복습
  structuredPrimary: true
  subtitle: 모듈과 import 마스터하기
  goal: Day 18 종합 복습에서 문자열, 숫자, 변수 같은 예제 값을 바꿨을 때 출력 또는 마지막 표현식 결과가 어떻게 달라지는지 확인한다.
  why: 기초 문법은 나중에 자동화 스크립트의 입력과 결과를 안정적으로 다루는 기준이 됩니다.
  explanation: Day 18에서 배운 모듈과 import를 난이도별로 복습합니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요. 각 미션은 독립적으로 실행 가능하므로
    어떤 순서로 해도 괜찮습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import math  # 첫 번째 셀에서 import

    math.sqrt(81)
  exercise:
    prompt: Day 18 종합 복습 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      import math  # 첫 번째 셀에서 import

      math.sqrt(81)
    hints:
    - 바꿀 지점은 문자열, 숫자, 변수 같은 예제 값을 만드는 첫 줄과 기초 문법 줄에서 찾으세요.
    - 실행 뒤 출력 또는 마지막 표현식 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: Day 18 종합 복습의 수정 코드가 기초 문법 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: Day 18 종합 복습 실행 결과가 출력 또는 마지막 표현식 결과 기준으로 바꾼 입력값을 반영해야 합니다.
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
    independentReview: pending
  masteryVariants:
  - id: day18-circle-area-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - import_basic
    - practice
    title: 표준 모듈 상수로 원 넓이 계산하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: math 모듈을 함수 내부에서 가져와 계산한다.
    why: 앞 예시를 복사하지 않고 여러 입력에서 같은 규칙이 성립해야 개념을 익혔다고 볼 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 입력으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: circle_area(radius)가 math.pi를 사용한 넓이를 소수 셋째 자리에서 반올림해 반환하도록 완성하세요.
      starterCode: |-
        def circle_area(radius):
            raise NotImplementedError
      solution: |-
        def circle_area(radius):
            import math
            return round(math.pi * radius ** 2, 2)
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day18.circle-area.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day18.circle-area.mastery.behavior.v1.fixture
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
        entry: circle_area
        cases:
        - id: one
          arguments:
          - value: 1
          expectedReturn: 3.14
        - id: two
          arguments:
          - value: 2
          expectedReturn: 12.57
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: day18-path-name-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day18-circle-area-mastery
    title: 경로 문자열에서 파일 이름 분리하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 모듈의 객체를 처음 보는 경로 처리에 적용한다.
    why: 같은 문법을 처음 보는 데이터와 업무 조건에 옮겨야 실제 활용 능력을 확인할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 정답 문구가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: path_name(path_text)가 POSIX 경로의 마지막 파일 이름을 반환하도록 완성하세요.
      starterCode: |-
        def path_name(path_text):
            raise NotImplementedError
      solution: |-
        def path_name(path_text):
            from pathlib import PurePosixPath
            return PurePosixPath(path_text).name
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day18.path-name.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day18.path-name.transfer.behavior.v1.fixture
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
        entry: path_name
        cases:
        - id: nested
          arguments:
          - value: reports/2026/july.csv
          expectedReturn: july.csv
        - id: single
          arguments:
          - value: notes.txt
          expectedReturn: notes.txt
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: day18-json-keys-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - day18-path-name-transfer
    title: JSON 문자열을 모듈로 해석하기
    subtitle: 7일 뒤 기억에서 재구성
    goal: import와 함수 호출을 기억에서 다시 연결한다.
    why: 시간을 두고 다시 구성해야 잠깐 본 코드를 따라 쓴 것과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 첫 실패에서는 표시된 실제 반환값과 계약의 차이 한 가지부터 고치세요.
    exercise:
      prompt: json_keys(text)가 JSON object의 key를 정렬한 목록으로 반환하도록 완성하세요.
      starterCode: |-
        def json_keys(text):
            raise NotImplementedError
      solution: |-
        def json_keys(text):
            import json
            return sorted(json.loads(text).keys())
      hints:
      - 반환값의 타입과 순서가 문제의 계약과 같은지 먼저 확인하세요.
      - 한 예시를 하드코딩하면 다른 격리 입력에서 통과하지 않습니다.
    check:
      id: python.30days.day18.json-keys.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.30days.day18.json-keys.retrieval.behavior.v1.fixture
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
        entry: json_keys
        cases:
        - id: two
          arguments:
          - value: '{"b": 2, "a": 1}'
          expectedReturn:
          - a
          - b
        - id: one
          arguments:
          - value: '{"name": "Codaro"}'
          expectedReturn:
          - name
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};