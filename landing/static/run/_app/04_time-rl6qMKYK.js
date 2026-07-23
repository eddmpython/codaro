var e=`meta:\r
  id: 04_time\r
  title: time - 시간 측정과 제어\r
  category: builtins\r
  tags:\r
  - time\r
  - 시간\r
  - 측정\r
  - sleep\r
  - performance\r
  seo:\r
    title: 파이썬 time 모듈 완전 정복\r
    description: time 모듈로 시간 측정, 지연 처리, 성능 분석을 배웁니다.\r
    keywords:\r
    - time\r
    - 시간\r
    - 타임스탬프\r
    - sleep\r
    - 성능측정\r
    - 파이썬시간\r
intro:\r
  emoji: ⏱️\r
  points:\r
  - 시간 측정과 타임스탬프\r
  - 프로그램 지연과 대기\r
  - 성능 측정과 벤치마크\r
  - 시간대와 형식 변환\r
  direction: time 시간 측정과 제어에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - time 시간 측정과 제어 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: time 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 시간 함수 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 시간 형식 변환 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: time 시간 측정과 제어 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: time 시간 측정과 제어 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: time 시간 측정과 제어 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: time 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: time 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    time은 파이썬 표준 라이브러리입니다. 시간 측정과 제어를 담당하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 time 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    import time\r
\r
    # 모듈 로드 확인\r
    'time 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: time 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import time\r
\r
      # 모듈 로드 확인\r
      'time 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: time 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: time 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic_time\r
  title: 기본 시간 함수\r
  structuredPrimary: true\r
  subtitle: time(), sleep(), perf_counter()\r
  goal: 기본 시간 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    time 모듈은 시간 측정과 제어를 담당합니다. time()은 1970년 1월 1일 이후의 초를 반환하고, sleep()은 프로그램을 일시 정지하며, perf_counter()는 고정밀 시간 측정에 사용됩니다. 성능 분석, 타이머, 주기적 작업에 필수적입니다.\r
\r
    perf_counter()는 sleep()과 시스템 시간 변경에 영향받지 않아 성능 측정에 이상적입니다.\r
  snippet: |-\r
    timestamp = time.time()\r
    timestamp\r
  exercise:\r
    prompt: 기본 시간 함수 예제에서 \`timestamp\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      timestamp = time.time()\r
      timestamp\r
    hints:\r
    - 바꿀 지점은 \`timestamp = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`timestamp\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 시간 함수에서 \`timestamp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 시간 함수 실행 뒤 \`timestamp\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: time_formats\r
  title: 시간 형식 변환\r
  structuredPrimary: true\r
  subtitle: struct_time과 포맷팅\r
  goal: 시간 형식 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    타임스탬프를 읽기 쉬운 형식으로 변환할 수 있습니다. localtime()은 타임스탬프를 구조화된 시간으로 변환하고, strftime()은 원하는 형식의 문자열을 만듭니다. gmtime()은 UTC 시간을 반환합니다.\r
\r
    로컬 시간과 UTC 시간의 차이는 time.timezone 변수로 확인할 수 있습니다.\r
  snippet: |-\r
    current = time.time()\r
    timeStruct = time.localtime(current)\r
    timeStruct.tm_year, timeStruct.tm_mon, timeStruct.tm_mday\r
  exercise:\r
    prompt: 시간 형식 변환 예제에서 \`current\`, \`timeStruct\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      current = time.time()\r
      timeStruct = time.localtime(current)\r
      timeStruct.tm_year, timeStruct.tm_mon, timeStruct.tm_mday\r
    hints:\r
    - 바꿀 지점은 \`current = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`current\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시간 형식 변환에서 \`current\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 시간 형식 변환 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: performance_measurement\r
  title: 성능 측정\r
  structuredPrimary: true\r
  subtitle: 코드 실행 시간 분석\r
  goal: 성능 측정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    프로그램의 성능을 측정하려면 perf_counter()를 사용합니다. 시작 시점과 종료 시점의 차이로 실행 시간을 계산할 수 있습니다. 알고리즘 비교, 병목 지점 발견, 최적화 효과 검증에 활용됩니다.\r
\r
    timeit 모듈은 더 정확한 벤치마크를 제공하지만 간단한 측정은 perf_counter()로 충분합니다.\r
  snippet: |-\r
    start = time.perf_counter()\r
    result = [i * i for i in range(10000)]\r
    finish = time.perf_counter()\r
    executionTime = finish - start\r
    executionTime\r
  exercise:\r
    prompt: 성능 측정 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      start = time.perf_counter()\r
      result = [i * i for i in range(10000)]\r
      finish = time.perf_counter()\r
      executionTime = finish - start\r
      executionTime\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 성능 측정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 성능 측정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: timing_control\r
  title: 시간 제어와 대기\r
  structuredPrimary: true\r
  subtitle: sleep과 주기적 실행\r
  goal: 시간 제어와 대기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    sleep()은 지정된 시간만큼 프로그램을 일시 정지합니다. 초 단위로 지정하며 소수점으로 밀리초 단위도 가능합니다. API 호출 간격 조절, 폴링, 애니메이션 프레임 제어에 사용됩니다.\r
\r
    정확한 주기를 원한다면 sleep 후 시간 오차를 보정해야 합니다.\r
  snippet: |-\r
    time.sleep(1)\r
    'Done'\r
  exercise:\r
    prompt: 시간 제어와 대기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      time.sleep(1)\r
      'Done'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시간 제어와 대기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 시간 제어와 대기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: clock_types\r
  title: 다양한 시계\r
  structuredPrimary: true\r
  subtitle: monotonic, process_time\r
  goal: 다양한 시계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Python은 여러 종류의 시계를 제공합니다. monotonic()은 항상 증가하는 시간, process_time()은 CPU 사용 시간, thread_time()은 스레드별 시간을 측정합니다. 각 시계는 특정 목적에 최적화되어 있습니다.\r
\r
    sleep()은 process_time()에 포함되지 않습니다. CPU를 실제로 사용한 시간만 측정합니다.\r
  snippet: |-\r
    tick = time.monotonic()\r
    time.sleep(1)\r
    tock = time.monotonic()\r
    interval = tock - tick\r
    interval\r
  exercise:\r
    prompt: 다양한 시계 예제에서 \`tick\`, \`tock\`, \`interval\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      tick = time.monotonic()\r
      time.sleep(1)\r
      tock = time.monotonic()\r
      interval = tock - tick\r
      interval\r
    hints:\r
    - 바꿀 지점은 \`tick = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tick\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 다양한 시계에서 \`tick\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 다양한 시계 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 시간 측정 실무 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.\r
  explanation: |-\r
    실무에서 자주 사용하는 시간 측정 패턴을 살펴봅니다. 타임아웃 구현, 진행률 표시, 재시도 로직, 성능 프로파일링 등 실생활 문제를 time 모듈로 해결할 수 있습니다.\r
\r
    로그 파일에는 time.strftime()으로 읽기 쉬운 형식의 타임스탬프를 기록하세요.\r
  snippet: |-\r
    limitSeconds = 3\r
    deadline = time.time() + limitSeconds\r
    finished = True if time.time() < deadline else False\r
    if finished:\r
        time.sleep(0.5)\r
    finished\r
  exercise:\r
    prompt: 실전 활용 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      limitSeconds = 3\r
      deadline = time.time() + limitSeconds\r
      finished = True if time.time() < deadline else False\r
      if finished:\r
          time.sleep(0.5)\r
      finished\r
    hints:\r
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.\r
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 실전 활용 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 시간 측정 운영 리포트'\r
  structuredPrimary: true\r
  subtitle: SLA, 재시도 간격, 타임스탬프 검증\r
  goal: '검증 루프: 시간 측정 운영 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    시간 측정 코드는 출력값보다 기준이 중요합니다. 성능 측정에는 perf_counter()를 쓰고, 재시도 간격이나 SLA 판단은 계산 결과를 검증해야 운영 자동화에 안전하게 넣을 수 있습니다.\r
\r
    변주 실험\r
    SLA 기준을 50ms에서 30ms로 바꾸고, 같은 지연 샘플에서 \`withinSla\`가 어떻게 달라지는지 확인하세요.\r
  tips:\r
  - 변주 실험 SLA 기준을 50ms에서 30ms로 바꾸고, 같은 지연 샘플에서 \`withinSla\`가 어떻게 달라지는지 확인하세요.\r
  snippet: |-\r
    latencySamples = [0.012, 0.018, 0.041, 0.025, 0.033]\r
\r
    def summarizeLatencies(secondsSamples, slaMs):\r
        milliseconds = [round(sample * 1000, 2) for sample in secondsSamples]\r
        return {\r
            "count": len(milliseconds),\r
            "averageMs": sum(milliseconds) / len(milliseconds),\r
            "maxMs": max(milliseconds),\r
            "withinSla": max(milliseconds) <= slaMs,\r
        }\r
\r
    latencyReport = summarizeLatencies(latencySamples, slaMs=50)\r
\r
    assert latencyReport["count"] == 5\r
    assert 25.0 < latencyReport["averageMs"] < 26.0\r
    assert latencyReport["maxMs"] == 41.0\r
    assert latencyReport["withinSla"] is True\r
\r
    latencyReport\r
  exercise:\r
    prompt: '검증 루프: 시간 측정 운영 리포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      latencySamples = [0.012, 0.018, 0.041, 0.025, 0.033]\r
\r
      def summarizeLatencies(secondsSamples, slaMs):\r
          milliseconds = [round(sample * 1000, 2) for sample in secondsSamples]\r
          return {\r
              "count": len(milliseconds),\r
              "averageMs": sum(milliseconds) / len(milliseconds),\r
              "maxMs": max(milliseconds),\r
              "withinSla": max(milliseconds) <= slaMs,\r
          }\r
\r
      latencyReport = summarizeLatencies(latencySamples, slaMs=50)\r
\r
      assert latencyReport["count"] == 5\r
      assert 25.0 < latencyReport["averageMs"] < 26.0\r
      assert latencyReport["maxMs"] == 41.0\r
      assert latencyReport["withinSla"] is True\r
\r
      latencyReport\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 시간 측정 운영 리포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 시간 측정 운영 리포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: time 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 시간 측정 마스터하기\r
  goal: time 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: time 모듈의 다양한 기능을 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    currentTimestamp = time.time()\r
    currentTimestamp\r
  exercise:\r
    prompt: time 모듈 종합 복습 예제에서 \`currentTimestamp\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      currentTimestamp = time.time()\r
      currentTimestamp\r
    hints:\r
    - 바꿀 지점은 \`currentTimestamp = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`currentTimestamp\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: time 모듈 종합 복습에서 \`currentTimestamp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: time 모듈 종합 복습 실행 뒤 \`currentTimestamp\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 04_time-latency-summary-mastery
    mode: mastery
    unseen: false
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
      prompt: classify_elapsed(start_seconds, finish_seconds, limit_ms)가 elapsedMs, timedOut, remainingMs를 담은 dict를 반환하도록 완성하세요.
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
  retrievalVariants:
  - id: 04_time-retry-schedule-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 04_time-latency-summary-mastery
    title: 재시도 시각표 다시 구성하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: 시작 타임스탬프와 지연 목록에서 각 재시도 시각과 최종 시각을 계산하고 음수 지연은 거부한다.
    why: 시간을 두고도 sleep을 직접 호출하지 않고 schedule을 먼저 계산할 수 있어야 자동화 루프가 안전해집니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - delays를 순서대로 누적하고 각 순간을 moments에 기록하세요.
    - 음수 지연은 잘못된 설정이므로 ValueError를 일으키세요.
    exercise:
      prompt: retry_schedule(start_timestamp, delays)가 attempts, finalTimestamp, moments를 담은 dict를 반환하고 음수 지연은 ValueError를 일으키도록 완성하세요.
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
    minimumDelayHours: 24
`;export{e as default};