var e=`meta:
  id: 03_datetime
  title: datetime - 날짜와 시간
  category: builtins
  tags:
  - datetime
  - 날짜
  - 시간
  - date
  - time
  seo:
    title: 파이썬 datetime 모듈 완전 정복
    description: datetime 모듈로 날짜와 시간 처리, 연산, 포매팅을 배웁니다.
    keywords:
    - datetime
    - 날짜
    - 시간
    - date
    - timedelta
    - strftime
    - 파이썬날짜
intro:
  emoji: 📅
  points:
  - 날짜와 시간 객체 생성
  - 날짜 연산과 비교
  - 포매팅과 파싱
  - 실전 날짜 처리
  direction: datetime 날짜와 시간에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - datetime 날짜와 시간 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: datetime 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 날짜와 시간 객체 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 날짜 연산 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: datetime 날짜와 시간 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: datetime 날짜와 시간 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: datetime 날짜와 시간 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: datetime 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: datetime 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.
  explanation: |-
    datetime은 파이썬 표준 라이브러리입니다. 날짜와 시간을 처리하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 섹션을 먼저 실행하면 아래 모든 예제에서 datetime 모듈을 사용할 수 있습니다.
  snippet: |-
    from datetime import date, datetime, timedelta

    # 모듈 로드 확인
    'datetime 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: datetime 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: |-
      from datetime import date, datetime, timedelta

      # 모듈 로드 확인
      'datetime 모듈이 정상적으로 로드되었습니다'
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: datetime 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: datetime 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: datetime_objects
  title: 날짜와 시간 객체
  structuredPrimary: true
  subtitle: date, time, datetime
  goal: 날짜와 시간 객체에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    datetime 모듈은 날짜와 시간을 다루는 파이썬 표준 라이브러리입니다. date는 날짜만, time은 시간만, datetime은 날짜와 시간을 함께 표현합니다. 각 객체는 불변이므로 연산 결과로 새 객체가 생성됩니다. 일정 관리, 로그 분석, 데이터 처리에 필수적입니다.

    datetime.now()로 현재 날짜와 시간을 가져올 수 있습니다.
  snippet: |-
    birthday = date(2000, 1, 15)
    birthday
  exercise:
    prompt: 날짜와 시간 객체 예제에서 \`birthday\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      birthday = date(2000, 1, 15)
      birthday
    hints:
    - 바꿀 지점은 \`birthday = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`birthday\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 날짜와 시간 객체에서 \`birthday\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 날짜와 시간 객체 실행 뒤 \`birthday\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: date_arithmetic
  title: 날짜 연산
  structuredPrimary: true
  subtitle: timedelta로 날짜 계산
  goal: 날짜 연산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    timedelta는 두 날짜 사이의 차이를 나타내거나 날짜에 더하고 뺄 수 있습니다. days, seconds, microseconds로 시간 간격을 표현하며, weeks 파라미터도 사용할 수 있습니다. D-day 계산, 기한 설정, 일정 관리에 활용됩니다.

    timedelta는 weeks 파라미터를 지원합니다. timedelta(weeks=2)는 14일과 같습니다.
  snippet: |-
    currentDate = date.today()
    weekLater = currentDate + timedelta(days=7)
    weekLater
  exercise:
    prompt: 날짜 연산 예제에서 \`currentDate\`, \`weekLater\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      currentDate = date.today()
      weekLater = currentDate + timedelta(days=7)
      weekLater
    hints:
    - 바꿀 지점은 \`currentDate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`currentDate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 날짜 연산에서 \`currentDate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 날짜 연산 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: formatting
  title: 포매팅과 파싱
  structuredPrimary: true
  subtitle: strftime과 strptime
  goal: 포매팅과 파싱에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    strftime()은 날짜를 문자열로 변환하고, strptime()은 문자열을 날짜로 변환합니다. 포맷 코드(%Y, %m, %d 등)로 원하는 형식을 지정할 수 있습니다. 로그 파일 분석, 사용자 입력 처리, API 통신에서 필수적입니다.

    strftime과 strptime의 포맷 문자열은 정확히 일치해야 합니다.
  snippet: |-
    myDate = date(2024, 3, 15)
    formatted = myDate.strftime('%Y-%m-%d')
    formatted
  exercise:
    prompt: 포매팅과 파싱 예제에서 \`myDate\`, \`formatted\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      myDate = date(2024, 3, 15)
      formatted = myDate.strftime('%Y-%m-%d')
      formatted
    hints:
    - 바꿀 지점은 \`myDate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`myDate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 포매팅과 파싱에서 \`myDate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 포매팅과 파싱 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: datetime_components
  title: 날짜 구성 요소
  structuredPrimary: true
  subtitle: 년, 월, 일, 시, 분, 초 추출
  goal: 날짜 구성 요소에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    날짜 객체에서 개별 구성 요소를 추출할 수 있습니다. year, month, day, hour, minute, second, microsecond 속성으로 각 요소에 접근합니다. weekday()는 요일을, isocalendar()는 ISO 주차를 반환합니다.

    weekday()는 0(월)~6(일), isoweekday()는 1(월)~7(일)을 반환합니다.
  snippet: |-
    someDate = date(2024, 12, 25)
    yearValue = someDate.year
    monthValue = someDate.month
    dayValue = someDate.day
    yearValue, monthValue, dayValue
  exercise:
    prompt: 날짜 구성 요소 예제에서 \`someDate\`, \`yearValue\`, \`monthValue\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      someDate = date(2024, 12, 25)
      yearValue = someDate.year
      monthValue = someDate.month
      dayValue = someDate.day
      yearValue, monthValue, dayValue
    hints:
    - 바꿀 지점은 \`someDate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`someDate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 날짜 구성 요소에서 \`someDate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 날짜 구성 요소 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: comparison
  title: 날짜 비교
  structuredPrimary: true
  subtitle: 날짜 크기 비교와 정렬
  goal: 날짜 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    날짜 객체는 비교 연산자(<, >, ==, !=, <=, >=)를 지원합니다. 과거 날짜가 미래 날짜보다 작으므로 날짜 리스트를 정렬할 수 있습니다. 기한 체크, 유효성 검증, 일정 정렬에 활용됩니다.

    max()와 min()으로 날짜 리스트에서 가장 최근/오래된 날짜를 찾을 수 있습니다.
  snippet: |-
    date1 = date(2024, 1, 1)
    date2 = date(2024, 12, 31)
    isEarlier = date1 < date2
    isEarlier
  exercise:
    prompt: 날짜 비교 예제에서 \`date1\`, \`date2\`, \`isEarlier\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      date1 = date(2024, 1, 1)
      date2 = date(2024, 12, 31)
      isEarlier = date1 < date2
      isEarlier
    hints:
    - 바꿀 지점은 \`date1 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`date1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 날짜 비교에서 \`date1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 날짜 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 날짜 처리 실무 패턴
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    실무에서 자주 사용하는 날짜 처리 패턴을 살펴봅니다. D-day 계산, 나이 계산, 영업일 계산, 월말/월초 처리 등 실생활 문제를 datetime으로 해결할 수 있습니다.

    calendar 모듈과 함께 사용하면 월말일, 윤년 등을 쉽게 처리할 수 있습니다.
  snippet: |-
    targetDate = date(2025, 1, 1)
    todayDate = date.today()
    daysLeft = (targetDate - todayDate).days
    daysLeft
  exercise:
    prompt: 실전 활용 예제에서 \`targetDate\`, \`todayDate\`, \`daysLeft\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      targetDate = date(2025, 1, 1)
      todayDate = date.today()
      daysLeft = (targetDate - todayDate).days
      daysLeft
    hints:
    - 바꿀 지점은 \`targetDate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`targetDate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 실전 활용에서 \`targetDate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: workflow_validation
  title: '검증 루프: 일정 데이터 품질'
  structuredPrimary: true
  subtitle: 파싱, 마감 상태, 영업일 계산
  goal: '검증 루프: 일정 데이터 품질에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    날짜 코드는 현재 날짜에 의존하면 테스트가 흔들립니다. 기준일을 고정하고, 문자열 파싱 실패와 마감 상태 계산을 검증하면 일정 관리나 운영 리포트에 그대로 재사용할 수 있습니다.

    변주 실험
    한국 공휴일 목록을 set으로 추가하고, 주말이 아니어도 휴일이면 영업일에서 제외되도록 \`countBusinessDays\`를 확장하세요.
  tips:
  - 변주 실험 한국 공휴일 목록을 set으로 추가하고, 주말이 아니어도 휴일이면 영업일에서 제외되도록 \`countBusinessDays\`를 확장하세요.
  snippet: |-
    referenceDate = date(2026, 5, 24)
    taskRows = [
        {"task": "invoiceClose", "due": "2026-05-20"},
        {"task": "releaseReview", "due": "2026-05-24"},
        {"task": "securityAudit", "due": "2026-05-27"},
        {"task": "quarterReport", "due": "2026-06-02"},
    ]

    def parseTaskRows(rows, today):
        parsedRows = []
        for row in rows:
            dueDate = datetime.strptime(row["due"], "%Y-%m-%d").date()
            daysLeft = (dueDate - today).days
            if daysLeft < 0:
                status = "overdue"
            elif daysLeft <= 3:
                status = "dueSoon"
            else:
                status = "scheduled"

            parsedRows.append({
                "task": row["task"],
                "due": dueDate,
                "daysLeft": daysLeft,
                "status": status,
            })
        return parsedRows

    taskSchedule = parseTaskRows(taskRows, referenceDate)
    statusCounts = {}
    for item in taskSchedule:
        statusCounts[item["status"]] = statusCounts.get(item["status"], 0) + 1

    assert statusCounts == {"overdue": 1, "dueSoon": 2, "scheduled": 1}
    assert taskSchedule[0]["daysLeft"] == -4
    assert taskSchedule[-1]["due"] == date(2026, 6, 2)

    taskSchedule
  exercise:
    prompt: '검증 루프: 일정 데이터 품질 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      referenceDate = date(2026, 5, 24)
      taskRows = [
          {"task": "invoiceClose", "due": "2026-05-20"},
          {"task": "releaseReview", "due": "2026-05-24"},
          {"task": "securityAudit", "due": "2026-05-27"},
          {"task": "quarterReport", "due": "2026-06-02"},
      ]

      def parseTaskRows(rows, today):
          parsedRows = []
          for row in rows:
              dueDate = datetime.strptime(row["due"], "%Y-%m-%d").date()
              daysLeft = (dueDate - today).days
              if daysLeft < 0:
                  status = "overdue"
              elif daysLeft <= 3:
                  status = "dueSoon"
              else:
                  status = "scheduled"

              parsedRows.append({
                  "task": row["task"],
                  "due": dueDate,
                  "daysLeft": daysLeft,
                  "status": status,
              })
          return parsedRows

      taskSchedule = parseTaskRows(taskRows, referenceDate)
      statusCounts = {}
      for item in taskSchedule:
          statusCounts[item["status"]] = statusCounts.get(item["status"], 0) + 1

      assert statusCounts == {"overdue": 1, "dueSoon": 2, "scheduled": 1}
      assert taskSchedule[0]["daysLeft"] == -4
      assert taskSchedule[-1]["due"] == date(2026, 6, 2)

      taskSchedule
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 일정 데이터 품질의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '검증 루프: 일정 데이터 품질 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: datetime 모듈 종합 복습
  structuredPrimary: true
  subtitle: 날짜와 시간 마스터하기
  goal: datetime 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: datetime 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    myBirthday = date(1995, 7, 20)
    myBirthday
  exercise:
    prompt: datetime 모듈 종합 복습 예제에서 \`myBirthday\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      myBirthday = date(1995, 7, 20)
      myBirthday
    hints:
    - 바꿀 지점은 \`myBirthday = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`myBirthday\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: datetime 모듈 종합 복습에서 \`myBirthday\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: datetime 모듈 종합 복습 실행 뒤 \`myBirthday\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 03_datetime-due-date-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - date_arithmetic
    - formatting
    - workflow_validation
    title: 고정 기준일로 마감 상태 계산하기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: ISO 날짜 문자열을 date로 바꾸고 기준일 대비 남은 날짜와 상태를 반환한다.
    why: 현재 날짜에 의존하지 않고 기준일을 인자로 받아야 일정 계산을 반복 검증할 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 오늘 날짜와 마감일 조합으로 다시 호출합니다.
    tips:
    - date.fromisoformat은 YYYY-MM-DD 문자열을 date 객체로 바꿉니다.
    - 음수, 0~3일, 그 이후를 서로 다른 상태로 나누세요.
    exercise:
      prompt: classify_due_date(today_text, due_text)가 due, daysLeft, status를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        from datetime import date

        def classify_due_date(today_text, due_text):
            raise NotImplementedError
      solution: |-
        from datetime import date

        def classify_due_date(today_text, due_text):
            today = date.fromisoformat(today_text)
            due = date.fromisoformat(due_text)
            days_left = (due - today).days
            if days_left < 0:
                status = "overdue"
            elif days_left <= 3:
                status = "dueSoon"
            else:
                status = "scheduled"
            return {"due": due.isoformat(), "daysLeft": days_left, "status": status}
      hints:
      - 두 문자열을 모두 date 객체로 변환한 뒤 빼면 timedelta가 됩니다.
      - 반환 key 이름과 status 문자열이 검사 계약과 같아야 합니다.
    check:
      id: python.builtins.datetime.due-date.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.datetime.due-date.mastery.behavior.v1.fixture
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
        entry: classify_due_date
        cases:
        - id: due-soon
          arguments:
          - value: '2026-05-24'
          - value: '2026-05-27'
          expectedReturn:
            due: '2026-05-27'
            daysLeft: 3
            status: dueSoon
        - id: scheduled
          arguments:
          - value: '2026-05-24'
          - value: '2026-06-02'
          expectedReturn:
            due: '2026-06-02'
            daysLeft: 9
            status: scheduled
        - id: overdue
          arguments:
          - value: '2026-05-24'
          - value: '2026-05-20'
          expectedReturn:
            due: '2026-05-20'
            daysLeft: -4
            status: overdue
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 03_datetime-next-business-day-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 03_datetime-due-date-mastery
    title: 다음 영업일 찾기
    subtitle: 처음 보는 조건에 개념 적용
    goal: timedelta와 weekday를 사용해 주말과 지정 휴일을 건너뛴 다음 영업일을 반환한다.
    why: 날짜 연산은 하루 더하기에서 끝나지 않고 운영 규칙을 반영해야 실제 일정 자동화가 됩니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 예시가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - weekday가 5 이상이면 토요일이나 일요일입니다.
    - holidays는 ISO 문자열 목록이므로 current.isoformat()으로 비교하세요.
    exercise:
      prompt: next_business_day(start_text, holidays)가 시작일 다음 날부터 주말과 휴일을 건너뛰고 다음 영업일 ISO 문자열을 반환하도록 완성하세요.
      starterCode: |-
        from datetime import date, timedelta

        def next_business_day(start_text, holidays):
            raise NotImplementedError
      solution: |-
        from datetime import date, timedelta

        def next_business_day(start_text, holidays):
            current = date.fromisoformat(start_text) + timedelta(days=1)
            holiday_set = set(holidays)
            while current.weekday() >= 5 or current.isoformat() in holiday_set:
                current += timedelta(days=1)
            return current.isoformat()
      hints:
      - 하루씩 전진하며 조건을 검사하세요.
      - 휴일 목록과 비교할 때 date 객체가 아니라 ISO 문자열로 맞추세요.
    check:
      id: python.builtins.datetime.next-business-day.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.datetime.next-business-day.transfer.behavior.v1.fixture
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
        entry: next_business_day
        cases:
        - id: weekend-and-holiday
          arguments:
          - value: '2026-05-22'
          - value:
            - '2026-05-25'
          expectedReturn: '2026-05-26'
        - id: normal-weekday
          arguments:
          - value: '2026-05-26'
          - value: []
          expectedReturn: '2026-05-27'
        - id: friday-to-monday
          arguments:
          - value: '2026-05-29'
          - value: []
          expectedReturn: '2026-06-01'
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 03_datetime-date-window-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 03_datetime-next-business-day-transfer
    title: 날짜 구간 요약 다시 구성하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: 시작일과 종료일 사이의 전체 일수, 주말 수, 시작 요일을 계산하고 역전된 구간은 거부한다.
    why: 시간이 지난 뒤에도 포함 구간과 주말 판정을 정확히 복원해야 리포트 기간 계산을 믿을 수 있습니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - 종료일도 포함해야 하므로 while current <= end 조건을 사용하세요.
    - end가 start보다 빠르면 ValueError를 일으키세요.
    exercise:
      prompt: summarize_date_window(start_text, end_text)가 days, weekendDays, startWeekday, end를 담은 dict를 반환하고 역전된 구간은 ValueError를
        일으키도록 완성하세요.
      starterCode: |-
        from datetime import date, timedelta

        def summarize_date_window(start_text, end_text):
            raise NotImplementedError
      solution: |-
        from datetime import date, timedelta

        def summarize_date_window(start_text, end_text):
            start = date.fromisoformat(start_text)
            end = date.fromisoformat(end_text)
            if end < start:
                raise ValueError("end date must not be before start date")
            current = start
            days = 0
            weekend_days = 0
            while current <= end:
                days += 1
                if current.weekday() >= 5:
                    weekend_days += 1
                current += timedelta(days=1)
            return {
                "days": days,
                "weekendDays": weekend_days,
                "startWeekday": start.isoweekday(),
                "end": end.isoformat(),
            }
      hints:
      - weekday는 0부터, isoweekday는 1부터 시작합니다.
      - 종료일을 포함하지 않으면 첫 번째 case의 days가 맞지 않습니다.
    check:
      id: python.builtins.datetime.date-window.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.datetime.date-window.retrieval.behavior.v1.fixture
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
        entry: summarize_date_window
        cases:
        - id: weekend-window
          arguments:
          - value: '2026-05-22'
          - value: '2026-05-24'
          expectedReturn:
            days: 3
            weekendDays: 2
            startWeekday: 5
            end: '2026-05-24'
        - id: workweek-window
          arguments:
          - value: '2026-06-01'
          - value: '2026-06-05'
          expectedReturn:
            days: 5
            weekendDays: 0
            startWeekday: 1
            end: '2026-06-05'
        - id: rejects-reversed
          arguments:
          - value: '2026-06-05'
          - value: '2026-06-01'
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};