var e=`meta:
  id: 04_time
  title: time - 시간 측정과 제어
  category: builtins
  tags:
  - time
  - 시간
  - 측정
  - sleep
  - performance
  seo:
    title: 파이썬 time 모듈 완전 정복
    description: time 모듈로 시간 측정, 지연 처리, 성능 분석을 배웁니다.
    keywords:
    - time
    - 시간
    - 타임스탬프
    - sleep
    - 성능측정
    - 파이썬시간
intro:
  emoji: ⏱️
  points:
  - 시간 측정과 타임스탬프
  - 프로그램 지연과 대기
  - 성능 측정과 벤치마크
  - 시간대와 형식 변환
  direction: time 시간 측정과 제어에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - time 시간 측정과 제어 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: time 모듈 불러오기 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 기본 시간 함수 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 시간 형식 변환 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: time 시간 측정과 제어 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: time 시간 측정과 제어 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: time 시간 측정과 제어 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- id: module_import
  title: time 모듈 불러오기
  structuredPrimary: true
  subtitle: ⚠️ 가장 먼저 실행하세요
  goal: import한 time으로 함수를 한 번 호출해 epoch 0이 실제로 어느 시각인지 눈으로 확인한다.
  why: time 모듈이 다루는 숫자는 전부 1970년 1월 1일 UTC를 0으로 잡고 센 초라서, 이 기준점을 처음에 확인해 두지 않으면 뒤에 나오는 열 자리 숫자가 무엇을 세는 값인지 감이 잡히지 않습니다.
  explanation: |-
    time은 파이썬 표준 라이브러리입니다. 시각을 읽고, 프로그램을 멈추고, 시간 문자열을 해석하는 함수가 모여 있습니다. 별도 설치 없이 import만으로 사용할 수 있습니다.

    이 셀을 먼저 실행하면 아래 모든 예제에서 time 이름을 그대로 쓸 수 있습니다. gmtime(0)은 epoch 기준점인 1970년 1월 1일 0시 UTC를 struct_time으로 돌려줍니다.
  snippet: |-
    import time

    # 모듈 로드 확인
    'time 모듈이 정상적으로 로드되었습니다'
  exercise:
    prompt: |-
      마지막 줄 문장은 로드되었다고 주장할 뿐 time 함수를 한 번도 부르지 않습니다. 'time 모듈이 정상적으로 로드되었습니다'를 time.gmtime(0)으로 바꿔 모듈 함수를 직접 호출하세요. 첫 줄 import time은 그대로 둡니다.

      gmtime(0)은 epoch 기준점을 UTC로 풀어 주고 돌려주는 객체는 time 모듈에서 온 이름이라, 화면에 모듈 이름이 붙은 채 1970년 1월 1일이 나와야 합니다.
    starterCode: |-
      import time

      # 모듈 로드 확인
      'time 모듈이 정상적으로 로드되었습니다'
    solution: |-
      import time

      # 모듈 로드 확인
      time.gmtime(0)
    hints:
    - 마지막 줄의 문자열을 지우고 그 자리에 time.gmtime(0) 을 씁니다. 괄호 안의 0 이 epoch 기준점인 0 초입니다.
    - "정답 형태: time.gmtime(0)"
  check:
    type: outputExact
    evidence: practice
    outputExact: 'time.struct_time(tm_year=1970, tm_mon=1, tm_mday=1, tm_hour=0, tm_min=0, tm_sec=0, tm_wday=3, tm_yday=1, tm_isdst=0)'
    resultCheck: "출력이 정확히 일치해야 합니다: 'time.struct_time(tm_year=1970, tm_mon=1, tm_mday=1, tm_hour=0, tm_min=0, tm_sec=0, tm_wday=3, tm_yday=1, tm_isdst=0)'"
- id: basic_time
  title: 기본 시간 함수
  structuredPrimary: true
  subtitle: time(), sleep(), perf_counter()
  goal: 세 함수를 한 번씩 불러 time과 perf_counter는 실수를, sleep은 아무것도 돌려주지 않는다는 것을 확인한다.
  why: sleep이 기다린 시간을 돌려준다고 착각하면 대기 시간을 기록하려던 로그가 통째로 None으로 남으므로, 각 함수가 무엇을 돌려주는지부터 손으로 확인해 둡니다.
  explanation: |-
    세 함수는 서로 다른 일을 합니다. time()은 epoch 이후 흐른 초를 실수로 돌려주고, sleep()은 지정한 초만큼 프로그램을 멈춘 뒤 아무것도 돌려주지 않으며, perf_counter()는 구간 측정용 고정밀 카운터를 실수로 돌려줍니다.

    time()과 perf_counter()는 둘 다 실수지만 뜻이 다릅니다. time()은 1970년부터 센 절대 시각이라 날짜로 풀 수 있고, perf_counter()는 시작점 자체에 의미가 없어 두 값의 차이로만 씁니다.
  snippet: |-
    timestamp = time.time()
    timestamp
  exercise:
    prompt: |-
      지금은 time()이 돌려준 숫자 하나만 봅니다. 이 값은 실행할 때마다 달라 기대 결과로 삼을 수 없으니, 값 대신 세 함수가 각각 무엇을 돌려주는지를 확인하세요.

      첫 줄은 그대로 두고 napResult = time.sleep(0.01)과 counterValue = time.perf_counter() 두 줄을 아래에 추가한 뒤, 마지막 줄 timestamp를 type(timestamp).__name__, napResult, type(counterValue).__name__으로 바꾸세요.

      time()과 perf_counter()는 실수를 돌려주고 sleep()은 아무것도 돌려주지 않으므로 ('float', None, 'float')가 나와야 합니다.
    starterCode: |-
      timestamp = time.time()
      timestamp
    solution: |-
      timestamp = time.time()
      napResult = time.sleep(0.01)
      counterValue = time.perf_counter()
      type(timestamp).__name__, napResult, type(counterValue).__name__
    hints:
    - sleep 의 반환값을 napResult 에 담아 두면 sleep 이 무엇을 돌려주는지 그대로 보입니다. type(x).__name__ 은 값의 타입 이름을 문자열로 줍니다.
    - "정답 형태: type(timestamp).__name__, napResult, type(counterValue).__name__"
  check:
    type: outputExact
    evidence: practice
    outputExact: "('float', None, 'float')"
    resultCheck: "출력이 정확히 일치해야 합니다: ('float', None, 'float')"
- id: time_formats
  title: 시간 형식 변환
  structuredPrimary: true
  subtitle: struct_time과 포맷팅
  goal: 고정한 epoch 초를 gmtime으로 struct_time으로 풀고 strftime으로 원하는 형식의 문자열로 다시 쓴다.
  why: 저장은 숫자 하나로 하고 표시는 사람이 읽는 형식으로 해야 하니 이 경로가 로그와 리포트에서 가장 자주 쓰이고, 기준을 UTC로 잡아야 어느 기계에서 돌려도 같은 문자열이 나옵니다.
  explanation: |-
    struct_time은 연, 월, 일, 시, 분, 초를 tm_year, tm_mon, tm_mday, tm_hour, tm_min, tm_sec라는 이름으로 담은 객체입니다. gmtime()은 epoch 초를 UTC 기준 struct_time으로 풀고, strftime()은 그 struct_time을 원하는 형식의 문자열로 씁니다.

    localtime()도 같은 변환을 하지만 기계에 설정된 시간대를 따릅니다. 같은 코드가 어디서 돌아도 같은 문자열을 내야 한다면 gmtime()으로 UTC 기준을 쓰고, 인자 없이 부르지 말고 변환할 타임스탬프를 직접 넘기세요.
  snippet: |-
    timeStruct = time.gmtime(1767225600)
    timeStruct.tm_year, timeStruct.tm_mon, timeStruct.tm_mday
  exercise:
    prompt: |-
      지금은 struct_time에서 숫자 세 개를 꺼내 튜플로 볼 뿐이라 사람이 읽을 형식이 아닙니다. 마지막 줄 timeStruct.tm_year, timeStruct.tm_mon, timeStruct.tm_mday를 time.strftime('%Y/%m/%d %H:%M', timeStruct)로 바꾸세요. 첫 줄은 그대로 둡니다.

      1767225600초는 UTC로 2026년 1월 1일 0시이고 이를 슬래시 형식으로 옮겨 적으면 2026/01/01 00:00이 나와야 합니다.
    starterCode: |-
      timeStruct = time.gmtime(1767225600)
      timeStruct.tm_year, timeStruct.tm_mon, timeStruct.tm_mday
    solution: |-
      timeStruct = time.gmtime(1767225600)
      time.strftime('%Y/%m/%d %H:%M', timeStruct)
    hints:
    - strftime 은 형식 문자열이 먼저, struct_time 이 나중입니다. %Y 는 네 자리 연도, %m 과 %d 는 두 자리 월과 일, %H 와 %M 은 두 자리 시와 분입니다.
    - "정답 형태: time.strftime('%Y/%m/%d %H:%M', timeStruct)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '2026/01/01 00:00'
    resultCheck: "출력이 정확히 일치해야 합니다: '2026/01/01 00:00'"
- id: performance_measurement
  title: 성능 측정
  structuredPrimary: true
  subtitle: 코드 실행 시간 분석
  goal: perf_counter로 구간을 재되 결과로는 측정한 초 대신 무엇을 얼마나 처리했는지와 구간이 유효한지를 남긴다.
  why: 측정한 초는 같은 코드라도 실행할 때마다 달라 그 숫자만 적어 두면 아무도 재현하지 못하므로, 벤치마크 기록에는 작업 크기를 함께 남겨 다음에 같은 조건으로 다시 잴 수 있게 합니다.
  explanation: |-
    perf_counter()는 시작과 끝을 재서 그 차이로 구간 시간을 구합니다. 시스템 시계가 조정돼도 영향받지 않고 되돌아가지도 않으므로 finish - start는 언제나 0 이상입니다.

    다만 그 차이 자체는 실행할 때마다 달라집니다. 측정 결과를 남길 때는 초와 함께 무엇을 얼마나 처리한 구간인지를 적어야 나중에 같은 조건을 다시 만들 수 있습니다.
  snippet: |-
    start = time.perf_counter()
    result = [i * i for i in range(10000)]
    finish = time.perf_counter()
    executionTime = finish - start
    executionTime
  exercise:
    prompt: |-
      마지막 줄이 executionTime 하나만 보여 주는데, 이 숫자는 실행할 때마다 달라지고 어떤 작업을 잰 것인지도 남기지 못합니다.

      두 곳을 고치세요. range(10000)을 range(2000)으로 줄이고, 마지막 줄 executionTime을 len(result), result[-1], executionTime >= 0으로 바꿉니다. 시간을 재는 세 줄은 그대로 둡니다.

      2000개를 만들었고 마지막 값은 1999의 제곱인 3996001이며 perf_counter 구간은 되돌아가지 않으므로 (2000, 3996001, True)가 나와야 합니다.
    starterCode: |-
      start = time.perf_counter()
      result = [i * i for i in range(10000)]
      finish = time.perf_counter()
      executionTime = finish - start
      executionTime
    solution: |-
      start = time.perf_counter()
      result = [i * i for i in range(2000)]
      finish = time.perf_counter()
      executionTime = finish - start
      len(result), result[-1], executionTime >= 0
    hints:
    - range(10000) 의 10000 을 2000 으로 바꾸고, 마지막 줄에 리스트 길이, 마지막 값, 구간 유효성 세 가지를 쉼표로 나란히 둡니다.
    - "정답 형태: len(result), result[-1], executionTime >= 0"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(2000, 3996001, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(2000, 3996001, True)'"
- id: timing_control
  title: 시간 제어와 대기
  structuredPrimary: true
  subtitle: sleep과 주기적 실행
  goal: 재시도 대기 간격을 리스트로 먼저 정해 두고 그대로 sleep한 뒤 재시도 횟수와 총 대기 시간을 계산한다.
  why: 간격을 sleep 호출 안에 숫자로 흩뿌리면 총 몇 초를 기다리는 설정인지 코드를 다 읽어야 알 수 있고 간격을 조정할 때마다 여러 줄을 고쳐야 하므로, 대기 계획을 데이터 한곳에 모읍니다.
  explanation: |-
    sleep()은 지정한 초만큼 프로그램을 멈춥니다. 0.01처럼 소수를 주면 밀리초 단위로도 멈출 수 있어 API 호출 간격 조절, 폴링, 재시도 사이 대기에 씁니다.

    재시도는 보통 간격을 두 배씩 늘리는 지수 백오프를 씁니다. 이 간격을 리스트로 들고 있으면 몇 번 재시도하는지, 최악의 경우 몇 초를 기다리는지 sleep을 실제로 돌리기 전에 계산할 수 있습니다.
  snippet: |-
    time.sleep(0.01)
    'Done'
  exercise:
    prompt: |-
      'Done'은 기다렸다는 사실만 말할 뿐 몇 번, 몇 초를 기다렸는지 남기지 못합니다. 두 줄을 재시도 대기 계획으로 바꾸세요.

      첫 줄을 waitPlan = [0.01, 0.02, 0.04]로 바꾸고, for waitSeconds in waitPlan: 아래에서 time.sleep(waitSeconds)를 호출한 뒤, 마지막 줄 'Done'을 len(waitPlan), round(sum(waitPlan), 3)으로 바꾸세요.

      간격이 두 배씩 늘어나는 세 번의 재시도이고 다 합치면 0.07초이므로 (3, 0.07)이 나와야 합니다.
    starterCode: |-
      time.sleep(0.01)
      'Done'
    solution: |-
      waitPlan = [0.01, 0.02, 0.04]
      for waitSeconds in waitPlan:
          time.sleep(waitSeconds)
      len(waitPlan), round(sum(waitPlan), 3)
    hints:
    - 대기 간격을 [0.01, 0.02, 0.04] 리스트로 먼저 적고 for 문으로 하나씩 time.sleep 에 넘깁니다. 합계에는 부동소수점 찌꺼기가 남으므로 round(..., 3) 으로 정리합니다.
    - "정답 형태: len(waitPlan), round(sum(waitPlan), 3)"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(3, 0.07)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(3, 0.07)'"
- id: clock_types
  title: 다양한 시계
  structuredPrimary: true
  subtitle: monotonic, process_time
  goal: 같은 sleep 구간을 monotonic과 process_time으로 동시에 재서 CPU 시간에는 대기가 잡히지 않는 것을 확인한다.
  why: 응답이 느린 원인이 계산이 무거워서인지 남을 기다려서인지는 벽시계 하나로 구분되지 않으므로, CPU를 실제로 쓴 시간을 따로 재야 최적화할 지점을 엉뚱한 코드에서 찾지 않습니다.
  explanation: |-
    Python은 목적이 다른 시계를 따로 제공합니다. monotonic()은 되돌아가지 않는 벽시계라 구간 측정에 쓰고, process_time()은 이 프로세스가 CPU를 실제로 사용한 시간만 셉니다. time()은 시스템 시계라 보정으로 뒤로 점프할 수 있어 구간 측정에는 맞지 않습니다.

    대기하는 동안에는 CPU를 쓰지 않습니다. 그래서 같은 구간을 두 시계로 재면 monotonic은 대기한 만큼 늘고 process_time은 거의 그대로입니다. 이 차이가 대기와 계산을 갈라내는 기준입니다.
  snippet: |-
    tick = time.monotonic()
    time.sleep(0.05)
    tock = time.monotonic()
    interval = tock - tick
    interval
  exercise:
    prompt: |-
      벽시계 하나로만 재기 때문에 이 구간이 계산에 쓴 시간인지 그냥 기다린 시간인지 구분되지 않습니다. 같은 구간을 CPU 시계로도 재세요.

      tick을 wallStart로 이름만 바꾸고, tock과 interval 두 줄을 wallSeconds = time.monotonic() - wallStart 한 줄로 합칩니다. sleep 바로 앞에 cpuStart = time.process_time()을, wallSeconds 아래에 cpuSeconds = time.process_time() - cpuStart를 넣고, 마지막 줄을 round(cpuSeconds, 1), wallSeconds > cpuSeconds로 바꾸세요.

      대기 구간에서는 CPU를 쓰지 않아 소수 첫째 자리로 반올림하면 0.0이고 벽시계 쪽이 더 많이 흘렀으므로 (0.0, True)가 나와야 합니다.
    starterCode: |-
      tick = time.monotonic()
      time.sleep(0.05)
      tock = time.monotonic()
      interval = tock - tick
      interval
    solution: |-
      wallStart = time.monotonic()
      cpuStart = time.process_time()
      time.sleep(0.05)
      wallSeconds = time.monotonic() - wallStart
      cpuSeconds = time.process_time() - cpuStart
      round(cpuSeconds, 1), wallSeconds > cpuSeconds
    hints:
    - 두 시계의 시작값을 sleep 앞에서 함께 읽고 sleep 뒤에서 각각 빼서 구간을 만듭니다. process_time 은 CPU 를 쓴 시간만 세므로 대기 중에는 거의 늘지 않습니다.
    - "정답 형태: round(cpuSeconds, 1), wallSeconds > cpuSeconds"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(0.0, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(0.0, True)'"
- id: practical
  title: 실전 활용
  structuredPrimary: true
  subtitle: 시간 측정 실무 패턴
  goal: 작업 전후에 관측한 두 시각으로 제한 시간 초과를 판정하고 초 뺄셈에 남는 부동소수점 찌꺼기를 정리한다.
  why: 방금 만든 기한을 방금 읽은 시각과 비교하면 판정이 언제나 통과라 초과를 영영 잡지 못하고, 판정에 쓸 시각을 값으로 받아 두어야 같은 상황을 나중에 그대로 재현해 확인할 수 있습니다.
  explanation: |-
    타임아웃 판정은 작업이 걸린 시간과 제한값을 비교하는 일입니다. 비교에 쓰는 두 시각은 작업 전후에 실제로 관측한 값이어야 하고, 판정 코드가 그 값을 그대로 받아 계산해야 같은 입력으로 몇 번이든 다시 확인할 수 있습니다.

    epoch 초는 실수라 뺄셈에 부동소수점 찌꺼기가 남습니다. 3.4를 기대한 자리에 3.4000000953674316이 찍히면 로그도 비교도 지저분해지므로 round()로 자리를 정리합니다.
  snippet: |-
    limitSeconds = 3
    deadline = time.time() + limitSeconds
    finished = True if time.time() < deadline else False
    if finished:
        time.sleep(0.01)
    finished
  exercise:
    prompt: |-
      기한을 방금 만들고 바로 비교하니 finished는 언제나 True입니다. 아직 지났을 리 없는 기한을 확인하는 셈이라 이 판정은 초과를 한 번도 잡지 못합니다.

      첫 줄 limitSeconds = 3만 남기고 아래를 관측된 두 시각으로 다시 쓰세요. startedAt = 1767225600.0과 finishedAt = 1767225603.4를 두고, elapsedSeconds = round(finishedAt - startedAt, 3)과 timedOut = elapsedSeconds > limitSeconds를 계산한 뒤 마지막 줄을 elapsedSeconds, timedOut으로 바꿉니다.

      3.4초 걸린 작업에 제한이 3초이므로 초과로 잡혀 (3.4, True)가 나와야 합니다.
    starterCode: |-
      limitSeconds = 3
      deadline = time.time() + limitSeconds
      finished = True if time.time() < deadline else False
      if finished:
          time.sleep(0.01)
      finished
    solution: |-
      limitSeconds = 3
      startedAt = 1767225600.0
      finishedAt = 1767225603.4
      elapsedSeconds = round(finishedAt - startedAt, 3)
      timedOut = elapsedSeconds > limitSeconds
      elapsedSeconds, timedOut
    hints:
    - time.time() 을 부르던 두 줄과 if 블록을 지우고 startedAt, finishedAt 에 관측값을 직접 적습니다. round(..., 3) 을 빼면 3.4000000953674316 이 그대로 나옵니다.
    - "정답 형태: timedOut = elapsedSeconds > limitSeconds"
  check:
    type: outputExact
    evidence: practice
    outputExact: '(3.4, True)'
    resultCheck: "출력이 정확히 일치해야 합니다: '(3.4, True)'"
- id: workflow_validation
  title: '검증 루프: 시간 측정 운영 리포트'
  structuredPrimary: true
  subtitle: SLA, 재시도 간격, 타임스탬프 검증
  goal: 범위로 대충 통과시키던 평균 검증을 반올림한 한 점 비교로 바꾸고 SLA 기준을 실제 목표치인 30ms로 조인다.
  why: 24와 25 사이면 무엇이든 통과하는 assert는 평균이 어긋나도 조용히 넘어가고 기준이 느슨한 리포트는 언제나 초록으로 나오므로, 검증 루프는 기대값을 한 점으로 좁히고 기준을 목표치에 맞춰야 실패를 실패로 보여 줍니다.
  explanation: |-
    시간 측정 코드는 출력값보다 기준이 중요합니다. 수집한 지연 샘플을 같은 단위로 바꾸고, 평균과 최대값을 계산하고, 기준을 넘었는지 assert로 박아 두면 운영 자동화에 그대로 넣을 수 있습니다.

    기대값을 범위로 두면 검증이 헐거워집니다. 24.0 < averageMs < 25.0은 평균이 24.1이든 24.9든 똑같이 통과시킵니다. 계산이 확정되는 값이라면 반올림한 뒤 한 점으로 비교하세요.
  tips:
  - 변주 실험 latencySamples 끝에 0.06을 추가하면 maxMs가 60.0으로 올라갑니다. count와 averageMs 기대값도 함께 고쳐야 통과합니다.
  snippet: |-
    latencySamples = [0.012, 0.018, 0.041, 0.025, 0.033, 0.02]

    def summarizeLatencies(secondsSamples, slaMs):
        milliseconds = [round(sample * 1000, 2) for sample in secondsSamples]
        return {
            "count": len(milliseconds),
            "averageMs": sum(milliseconds) / len(milliseconds),
            "maxMs": max(milliseconds),
            "withinSla": max(milliseconds) <= slaMs,
        }

    latencyReport = summarizeLatencies(latencySamples, slaMs=50)

    assert latencyReport["count"] == 6
    assert 24.0 < latencyReport["averageMs"] < 25.0
    assert latencyReport["maxMs"] == 41.0
    assert latencyReport["withinSla"] is True

    latencyReport
  exercise:
    prompt: |-
      이 검증 루프는 두 군데가 헐겁습니다. averageMs는 24.0과 25.0 사이면 무엇이든 통과하고, SLA 기준 50ms는 실제 목표인 30ms보다 느슨해 이 샘플이 언제나 통과합니다.

      세 곳을 고치세요. return의 "averageMs" 값을 round(sum(milliseconds) / len(milliseconds), 2)로 감싸고, 호출 인자를 slaMs=30으로 바꾸고, assert 두 줄을 latencyReport["averageMs"] == 24.83과 latencyReport["withinSla"] is False로 고칩니다. latencySamples와 나머지 assert 두 줄은 그대로 둡니다.

      평균은 24.83으로 떨어지고 최대 41.0ms는 30ms 기준을 넘으므로 {'count': 6, 'averageMs': 24.83, 'maxMs': 41.0, 'withinSla': False}가 나와야 합니다.
    starterCode: |-
      latencySamples = [0.012, 0.018, 0.041, 0.025, 0.033, 0.02]

      def summarizeLatencies(secondsSamples, slaMs):
          milliseconds = [round(sample * 1000, 2) for sample in secondsSamples]
          return {
              "count": len(milliseconds),
              "averageMs": sum(milliseconds) / len(milliseconds),
              "maxMs": max(milliseconds),
              "withinSla": max(milliseconds) <= slaMs,
          }

      latencyReport = summarizeLatencies(latencySamples, slaMs=50)

      assert latencyReport["count"] == 6
      assert 24.0 < latencyReport["averageMs"] < 25.0
      assert latencyReport["maxMs"] == 41.0
      assert latencyReport["withinSla"] is True

      latencyReport
    solution: |-
      latencySamples = [0.012, 0.018, 0.041, 0.025, 0.033, 0.02]

      def summarizeLatencies(secondsSamples, slaMs):
          milliseconds = [round(sample * 1000, 2) for sample in secondsSamples]
          return {
              "count": len(milliseconds),
              "averageMs": round(sum(milliseconds) / len(milliseconds), 2),
              "maxMs": max(milliseconds),
              "withinSla": max(milliseconds) <= slaMs,
          }

      latencyReport = summarizeLatencies(latencySamples, slaMs=30)

      assert latencyReport["count"] == 6
      assert latencyReport["averageMs"] == 24.83
      assert latencyReport["maxMs"] == 41.0
      assert latencyReport["withinSla"] is False

      latencyReport
    hints:
    - 평균 계산을 round(..., 2) 로 감싸면 24.833333333333332 가 24.83 이 됩니다. 그래야 부등호 범위 대신 == 로 한 점 비교를 할 수 있습니다.
    - slaMs 를 30 으로 낮추면 최대 41.0ms 가 기준을 넘어 withinSla 가 False 로 바뀝니다. 마지막 assert 도 is False 로 고쳐야 합니다.
    - "정답 형태: latencyReport = summarizeLatencies(latencySamples, slaMs=30)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "{'count': 6, 'averageMs': 24.83, 'maxMs': 41.0, 'withinSla': False}"
    resultCheck: "출력이 정확히 일치해야 합니다: {'count': 6, 'averageMs': 24.83, 'maxMs': 41.0, 'withinSla': False}"
- id: practice
  title: time 모듈 종합 복습
  structuredPrimary: true
  subtitle: 시간 측정 마스터하기
  goal: 로그에 문자열로 적힌 시작과 종료 시각을 strptime으로 읽어 경과 초를 구하고 시작 시각을 짧은 형식으로 함께 남긴다.
  why: 남이 남긴 로그에는 시각이 문자열로만 적혀 있어 그대로는 뺄 수 없으므로, 읽어서 초로 환산하고 다시 사람이 읽을 형식으로 내보내는 이 왕복이 시간 데이터를 다루는 마지막 조립 단계입니다.
  explanation: |-
    time 모듈에서 배운 것을 한 줄기로 잇습니다. strptime()으로 문자열을 struct_time으로 읽고, tm_hour와 tm_min과 tm_sec로 하루 안의 초를 계산하고, strftime()으로 다시 사람이 읽을 형식으로 씁니다.

    같은 날 안의 두 시각이라면 하루 안의 초로 바꿔 빼는 것으로 충분합니다. 날짜를 넘나드는 계산이 필요해지면 epoch 초로 바꿔 다루는 편이 안전합니다.
  tips:
  - strptime 의 형식 문자열은 읽을 문자열과 한 글자도 어긋나면 ValueError 가 납니다. 하이픈, 공백, 콜론 위치까지 맞추세요.
  snippet: |-
    startedStruct = time.strptime('2026-03-02 09:30:00', '%Y-%m-%d %H:%M:%S')

    def secondsOfDay(timeStruct):
        return timeStruct.tm_hour * 3600 + timeStruct.tm_min * 60 + timeStruct.tm_sec

    secondsOfDay(startedStruct)
  exercise:
    prompt: |-
      지금은 시작 시각 하나만 초로 바꿉니다. 종료 시각을 더해 실제로 걸린 시간을 구하세요.

      startedStruct 아래에 finishedStruct = time.strptime('2026-03-02 09:47:30', '%Y-%m-%d %H:%M:%S')를 추가하고, 마지막 줄 secondsOfDay(startedStruct)를 secondsOfDay(finishedStruct) - secondsOfDay(startedStruct), time.strftime('%H:%M', startedStruct)로 바꾸세요.

      09:30:00에서 09:47:30까지는 17분 30초, 곧 1050초이고 시작 시각을 시와 분으로만 다시 쓰면 09:30이므로 (1050, '09:30')이 나와야 합니다.
    starterCode: |-
      startedStruct = time.strptime('2026-03-02 09:30:00', '%Y-%m-%d %H:%M:%S')

      def secondsOfDay(timeStruct):
          return timeStruct.tm_hour * 3600 + timeStruct.tm_min * 60 + timeStruct.tm_sec

      secondsOfDay(startedStruct)
    solution: |-
      startedStruct = time.strptime('2026-03-02 09:30:00', '%Y-%m-%d %H:%M:%S')
      finishedStruct = time.strptime('2026-03-02 09:47:30', '%Y-%m-%d %H:%M:%S')

      def secondsOfDay(timeStruct):
          return timeStruct.tm_hour * 3600 + timeStruct.tm_min * 60 + timeStruct.tm_sec

      secondsOfDay(finishedStruct) - secondsOfDay(startedStruct), time.strftime('%H:%M', startedStruct)
    hints:
    - 종료 시각도 같은 형식 문자열로 strptime 에 넘겨 finishedStruct 를 만듭니다. 뺄셈은 종료에서 시작을 빼는 방향입니다.
    - "정답 형태: secondsOfDay(finishedStruct) - secondsOfDay(startedStruct), time.strftime('%H:%M', startedStruct)"
  check:
    type: outputExact
    evidence: practice
    outputExact: "(1050, '09:30')"
    resultCheck: "출력이 정확히 일치해야 합니다: (1050, '09:30')"
assessment:
  masteryVariants:
  - id: 04_time-latency-summary-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - performance_measurement
    - workflow_validation
    - practice
    title: 지연 샘플 SLA 요약 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: 초 단위 지연 샘플을 ms로 변환하고 평균, 최대값, SLA 통과 여부를 반환한다.
    why: 시간 측정은 실제 대기를 오래 하는 것보다 수집된 샘플을 같은 기준으로 판단하는 능력이 중요합니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 지연 샘플과 SLA 기준으로 다시 호출합니다.
    tips:
    - 초 단위 샘플에 1000을 곱해 ms 단위로 바꾸세요.
    - 평균은 소수점 둘째 자리까지 반올림하세요.
    exercise:
      prompt: summarize_latencies(seconds_samples, sla_ms)가 count, averageMs, maxMs, withinSla를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_latencies(seconds_samples, sla_ms):
            raise NotImplementedError
      solution: |-
        def summarize_latencies(seconds_samples, sla_ms):
            milliseconds = [round(sample * 1000, 2) for sample in seconds_samples]
            return {
                "count": len(milliseconds),
                "averageMs": round(sum(milliseconds) / len(milliseconds), 2),
                "maxMs": max(milliseconds),
                "withinSla": max(milliseconds) <= sla_ms,
            }
      hints:
      - max(milliseconds)가 SLA 기준보다 작거나 같으면 통과입니다.
      - 초 단위와 ms 단위를 섞으면 case가 맞지 않습니다.
    check:
      id: python.builtins.time.latency-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.time.latency-summary.mastery.behavior.v1.fixture
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
        entry: summarize_latencies
        cases:
        - id: within-sla
          arguments:
          - value:
            - 0.012
            - 0.018
            - 0.041
            - 0.025
            - 0.033
          - value: 50
          expectedReturn:
            count: 5
            averageMs: 25.8
            maxMs: 41.0
            withinSla: true
        - id: over-sla
          arguments:
          - value:
            - 0.04
            - 0.052
          - value: 50
          expectedReturn:
            count: 2
            averageMs: 46.0
            maxMs: 52.0
            withinSla: false
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 04_time-elapsed-timeout-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 04_time-latency-summary-mastery
    title: 경과 시간으로 timeout 판정하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 시작과 종료 초 값을 ms 차이로 바꾸고 timeout 여부와 남은 시간을 계산한다.
    why: 실무 자동화에서는 실제 sleep보다 관측된 시작, 종료 시각으로 제한 시간을 판정하는 코드가 더 자주 필요합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 예시가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - finish_seconds에서 start_seconds를 뺀 뒤 1000을 곱하세요.
    - 남은 시간은 음수가 아니라 0으로 막아야 합니다.
    exercise:
      prompt: classify_elapsed(start_seconds, finish_seconds, limit_ms)가 elapsedMs, timedOut, remainingMs를 담은 dict를 반환하도록
        완성하세요.
      starterCode: |-
        def classify_elapsed(start_seconds, finish_seconds, limit_ms):
            raise NotImplementedError
      solution: |-
        def classify_elapsed(start_seconds, finish_seconds, limit_ms):
            elapsed_ms = round((finish_seconds - start_seconds) * 1000, 2)
            return {
                "elapsedMs": elapsed_ms,
                "timedOut": elapsed_ms > limit_ms,
                "remainingMs": max(0, round(limit_ms - elapsed_ms, 2)),
            }
      hints:
      - timedOut은 경과 시간이 limit_ms보다 큰 경우에만 True입니다.
      - round 위치를 맞춰야 expected 값과 일치합니다.
    check:
      id: python.builtins.time.elapsed-timeout.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.time.elapsed-timeout.transfer.behavior.v1.fixture
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
        entry: classify_elapsed
        cases:
        - id: still-inside-limit
          arguments:
          - value: 10.0
          - value: 10.125
          - value: 200
          expectedReturn:
            elapsedMs: 125.0
            timedOut: false
            remainingMs: 75.0
        - id: over-limit
          arguments:
          - value: 10.0
          - value: 10.35
          - value: 200
          expectedReturn:
            elapsedMs: 350.0
            timedOut: true
            remainingMs: 0
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 04_time-retry-schedule-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 04_time-elapsed-timeout-transfer
    title: 재시도 시각표 다시 구성하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: 시작 타임스탬프와 지연 목록에서 각 재시도 시각과 최종 시각을 계산하고 음수 지연은 거부한다.
    why: 시간을 두고도 sleep을 직접 호출하지 않고 schedule을 먼저 계산할 수 있어야 자동화 루프가 안전해집니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - delays를 순서대로 누적하고 각 순간을 moments에 기록하세요.
    - 음수 지연은 잘못된 설정이므로 ValueError를 일으키세요.
    exercise:
      prompt: retry_schedule(start_timestamp, delays)가 attempts, finalTimestamp, moments를 담은 dict를 반환하고 음수 지연은 ValueError를
        일으키도록 완성하세요.
      starterCode: |-
        def retry_schedule(start_timestamp, delays):
            raise NotImplementedError
      solution: |-
        def retry_schedule(start_timestamp, delays):
            current = start_timestamp
            moments = []
            for delay in delays:
                if delay < 0:
                    raise ValueError("delay must not be negative")
                current += delay
                moments.append(round(current, 3))
            return {"attempts": len(delays), "finalTimestamp": round(current, 3), "moments": moments}
      hints:
      - 각 delay는 이전 시각에 누적됩니다.
      - finalTimestamp는 마지막 moments 값과 같아야 합니다.
    check:
      id: python.builtins.time.retry-schedule.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.time.retry-schedule.retrieval.behavior.v1.fixture
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
        entry: retry_schedule
        cases:
        - id: exponential-like-delays
          arguments:
          - value: 1000.0
          - value:
            - 0.1
            - 0.2
            - 0.4
          expectedReturn:
            attempts: 3
            finalTimestamp: 1000.7
            moments:
            - 1000.1
            - 1000.3
            - 1000.7
        - id: simple-delays
          arguments:
          - value: 5.5
          - value:
            - 1.0
            - 1.5
          expectedReturn:
            attempts: 2
            finalTimestamp: 8.0
            moments:
            - 6.5
            - 8.0
        - id: rejects-negative-delay
          arguments:
          - value: 1.0
          - value:
            - 0.5
            - -0.1
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
    independentReview: approved
    reviewerId: "curriculum-integrity-review"
    reviewedAt: "2026-08-02T13:06:47+09:00"
    evidenceCommit: "22505301c65a9621c9e3321759115562ffa5e136"
`;export{e as default};