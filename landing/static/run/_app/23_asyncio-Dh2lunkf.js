var e=`meta:\r
  id: 23_asyncio\r
  title: asyncio - 비동기 I/O\r
  category: builtins\r
  tags:\r
  - asyncio\r
  - async\r
  - await\r
  - 비동기\r
  - 이벤트루프\r
  - coroutine\r
  description: async/await 기반 비동기 프로그래밍을 위한 asyncio 모듈\r
  keywords:\r
  - asyncio\r
  - async\r
  - await\r
  - 비동기\r
  - 이벤트루프\r
  - coroutine\r
intro:\r
  emoji: ⚡\r
  points:\r
  - async/await 문법\r
  - 비동기 작업 동시 실행\r
  - 이벤트 루프 제어\r
  - Codaro 로컬 Python 완벽 지원\r
  direction: asyncio 비동기 I/O에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - asyncio 비동기 I/O 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 비동기 함수 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 동시 실행 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: asyncio 비동기 I/O 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: asyncio 비동기 I/O 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: asyncio 비동기 I/O 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: asyncio 시작하기\r
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    asyncio는 파이썬 표준 라이브러리입니다. async/await 문법을 사용한 비동기 프로그래밍을 지원합니다.\r
\r
    Codaro 로컬 Python 환경에서 asyncio는 Python 이벤트 루프 기준으로 실행됩니다. 파일, 네트워크, 태스크 자동화처럼 오래 걸리는 작업을 단계적으로 다룰 때 유용합니다.\r
  tips:\r
  - Codaro 로컬 Python 환경에서 asyncio는 Python 이벤트 루프 기준으로 실행됩니다. 파일, 네트워크, 태스크 자동화처럼 오래 걸리는 작업을 단계적으로 다룰 때\r
    유용합니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def greet():\r
        return "Hello Async"\r
\r
    result = asyncio.run(greet())\r
    result\r
  exercise:\r
    prompt: 모듈 임포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def greet():\r
          return "Hello Async"\r
\r
      result = asyncio.run(greet())\r
      result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모듈 임포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 모듈 임포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: basic_async\r
  title: 기본 비동기 함수\r
  structuredPrimary: true\r
  subtitle: async/await 문법\r
  goal: 기본 비동기 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    async def로 비동기 함수를 정의하고 await로 비동기 작업을 대기합니다.\r
\r
    await는 async 함수 내부에서만 사용하고, 로컬 스크립트에서는 asyncio.run()으로 시작 함수를 실행하면 재현성이 좋습니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def fetchData():\r
        await asyncio.sleep(0.1)\r
        return "Data loaded"\r
\r
    output = asyncio.run(fetchData())\r
    output\r
  exercise:\r
    prompt: 기본 비동기 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def fetchData():\r
          await asyncio.sleep(0.1)\r
          return "Data loaded"\r
\r
      output = asyncio.run(fetchData())\r
      output\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 비동기 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 기본 비동기 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: concurrent_tasks\r
  title: 동시 실행\r
  structuredPrimary: true\r
  subtitle: 여러 작업 병렬 처리\r
  goal: 동시 실행에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    asyncio.gather()와 asyncio.create_task()로 여러 비동기 작업을 동시에 실행할 수 있습니다.\r
\r
    gather()는 모든 작업이 완료될 때까지 기다리고, as_completed()는 완료되는 순서대로 결과를 받을 수 있습니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def taskA():\r
        await asyncio.sleep(0.1)\r
        return "A done"\r
\r
    async def taskB():\r
        await asyncio.sleep(0.1)\r
        return "B done"\r
\r
    async def taskC():\r
        await asyncio.sleep(0.1)\r
        return "C done"\r
\r
    async def runAllTasks():\r
        return await asyncio.gather(taskA(), taskB(), taskC())\r
\r
    results = asyncio.run(runAllTasks())\r
    results\r
  exercise:\r
    prompt: 동시 실행 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def taskA():\r
          await asyncio.sleep(0.1)\r
          return "A done"\r
\r
      async def taskB():\r
          await asyncio.sleep(0.1)\r
          return "B done"\r
\r
      async def taskC():\r
          await asyncio.sleep(0.1)\r
          return "C done"\r
\r
      async def runAllTasks():\r
          return await asyncio.gather(taskA(), taskB(), taskC())\r
\r
      results = asyncio.run(runAllTasks())\r
      results\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 동시 실행의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 동시 실행 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: timeout_cancel\r
  title: 타임아웃과 취소\r
  structuredPrimary: true\r
  subtitle: 작업 제어\r
  goal: 타임아웃과 취소에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    asyncio.wait_for()로 타임아웃을 설정하고, task.cancel()로 작업을 취소할 수 있습니다.\r
\r
    타임아웃은 네트워크 요청이나 외부 서비스 호출 시 필수적입니다. 무한 대기를 방지할 수 있습니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def slowOperation():\r
        await asyncio.sleep(1)\r
        return "Done"\r
\r
    async def withTimeout():\r
        try:\r
            result = await asyncio.wait_for(slowOperation(), timeout=0.1)\r
            return result\r
        except asyncio.TimeoutError:\r
            return "Timeout occurred"\r
\r
    timeoutResult = asyncio.run(withTimeout())\r
    timeoutResult\r
  exercise:\r
    prompt: 타임아웃과 취소 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def slowOperation():\r
          await asyncio.sleep(1)\r
          return "Done"\r
\r
      async def withTimeout():\r
          try:\r
              result = await asyncio.wait_for(slowOperation(), timeout=0.1)\r
              return result\r
          except asyncio.TimeoutError:\r
              return "Timeout occurred"\r
\r
      timeoutResult = asyncio.run(withTimeout())\r
      timeoutResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 타임아웃과 취소의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 타임아웃과 취소 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: async_context\r
  title: 비동기 컨텍스트\r
  structuredPrimary: true\r
  subtitle: async with와 async for\r
  goal: 비동기 컨텍스트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    async with로 비동기 컨텍스트 매니저를, async for로 비동기 이터레이터를 사용할 수 있습니다.\r
\r
    async with와 async for는 파일 I/O, 데이터베이스 연결, 스트리밍 데이터 처리에 유용합니다.\r
  snippet: |-\r
    import asyncio\r
\r
    class AsyncResource:\r
        async def __aenter__(self):\r
            await asyncio.sleep(0.01)\r
            return "Resource acquired"\r
\r
        async def __aexit__(self, exc_type, exc_val, exc_tb):\r
            await asyncio.sleep(0.01)\r
            return False\r
\r
    async def useResource():\r
        async with AsyncResource() as res:\r
            return res\r
\r
    resourceResult = asyncio.run(useResource())\r
    resourceResult\r
  exercise:\r
    prompt: 비동기 컨텍스트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      class AsyncResource:\r
          async def __aenter__(self):\r
              await asyncio.sleep(0.01)\r
              return "Resource acquired"\r
\r
          async def __aexit__(self, exc_type, exc_val, exc_tb):\r
              await asyncio.sleep(0.01)\r
              return False\r
\r
      async def useResource():\r
          async with AsyncResource() as res:\r
              return res\r
\r
      resourceResult = asyncio.run(useResource())\r
      resourceResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 비동기 컨텍스트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 비동기 컨텍스트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: error_handling\r
  title: 예외 처리\r
  structuredPrimary: true\r
  subtitle: 비동기 에러 핸들링\r
  goal: 예외 처리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    비동기 함수에서도 일반적인 try-except 문법을 사용하여 예외를 처리할 수 있습니다.\r
\r
    return_exceptions=True를 사용하면 예외가 발생해도 다른 작업이 계속 실행되고, 예외는 결과 리스트에 포함됩니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def riskyOperation(shouldFail):\r
        await asyncio.sleep(0.01)\r
        if shouldFail:\r
            raise ValueError("Operation failed")\r
        return "Success"\r
\r
    async def handleError():\r
        try:\r
            result = await riskyOperation(True)\r
            return result\r
        except ValueError as e:\r
            return f"Error: {e}"\r
\r
    errorResult = asyncio.run(handleError())\r
    errorResult\r
  exercise:\r
    prompt: 예외 처리 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def riskyOperation(shouldFail):\r
          await asyncio.sleep(0.01)\r
          if shouldFail:\r
              raise ValueError("Operation failed")\r
          return "Success"\r
\r
      async def handleError():\r
          try:\r
              result = await riskyOperation(True)\r
              return result\r
          except ValueError as e:\r
              return f"Error: {e}"\r
\r
      errorResult = asyncio.run(handleError())\r
      errorResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 예외 처리의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 예외 처리 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 패턴\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    asyncio를 활용한 실전 예제들입니다.\r
\r
    Semaphore를 사용하면 동시 실행 작업 수를 제한할 수 있어, 리소스 관리와 부하 조절에 유용합니다.\r
  snippet: |-\r
    import asyncio\r
\r
    async def fetchApi(apiName, delay):\r
        await asyncio.sleep(delay)\r
        return {"api": apiName, "data": f"{apiName} response"}\r
\r
    async def fetchAllApis():\r
        apis = [\r
            fetchApi("users", 0.1),\r
            fetchApi("posts", 0.08),\r
            fetchApi("comments", 0.12)\r
        ]\r
\r
        responses = await asyncio.gather(*apis)\r
        return responses\r
\r
    apiResponses = asyncio.run(fetchAllApis())\r
    apiResponses\r
  exercise:\r
    prompt: 실전 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def fetchApi(apiName, delay):\r
          await asyncio.sleep(delay)\r
          return {"api": apiName, "data": f"{apiName} response"}\r
\r
      async def fetchAllApis():\r
          apis = [\r
              fetchApi("users", 0.1),\r
              fetchApi("posts", 0.08),\r
              fetchApi("comments", 0.12)\r
          ]\r
\r
          responses = await asyncio.gather(*apis)\r
          return responses\r
\r
      apiResponses = asyncio.run(fetchAllApis())\r
      apiResponses\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실전 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 제한된 비동기 작업 큐'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 제한된 비동기 작업 큐에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 비동기 코드는 빠르게 실행하는 것보다 완료, 실패, 타임아웃, 동시성 제한을 예측 가능하게 다루는 것이 중요합니다. 여기서는 작은 작업 큐를 만들고 성공/실패/타임아웃을\r
    한 번에 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    async def runLimitedQueue(items, maxConcurrent=2):\r
        semaphore = asyncio.Semaphore(maxConcurrent)\r
        activeCount = 0\r
        maxSeen = 0\r
\r
        async def process(item):\r
            nonlocal activeCount, maxSeen\r
            async with semaphore:\r
                activeCount += 1\r
                maxSeen = max(maxSeen, activeCount)\r
                await asyncio.sleep(item['delay'])\r
                activeCount -= 1\r
                if item.get('fail'):\r
                    raise ValueError(f"{item['name']} failed")\r
                return {'name': item['name'], 'status': 'ok'}\r
\r
        results = await asyncio.gather(\r
            *(process(item) for item in items),\r
            return_exceptions=True\r
        )\r
        return results, maxSeen\r
\r
    queueItems = [\r
        {'name': 'load-users', 'delay': 0.02},\r
        {'name': 'load-lessons', 'delay': 0.01},\r
        {'name': 'sync-report', 'delay': 0.02, 'fail': True}\r
    ]\r
    queueResults, maxConcurrentSeen = asyncio.run(runLimitedQueue(queueItems))\r
\r
    assert maxConcurrentSeen <= 2\r
    assert sum(isinstance(result, dict) for result in queueResults) == 2\r
    assert sum(isinstance(result, ValueError) for result in queueResults) == 1\r
    queueResults\r
  exercise:\r
    prompt: '검증 루프: 제한된 비동기 작업 큐 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      async def runLimitedQueue(items, maxConcurrent=2):\r
          semaphore = asyncio.Semaphore(maxConcurrent)\r
          activeCount = 0\r
          maxSeen = 0\r
\r
          async def process(item):\r
              nonlocal activeCount, maxSeen\r
              async with semaphore:\r
                  activeCount += 1\r
                  maxSeen = max(maxSeen, activeCount)\r
                  await asyncio.sleep(item['delay'])\r
                  activeCount -= 1\r
                  if item.get('fail'):\r
                      raise ValueError(f"{item['name']} failed")\r
                  return {'name': item['name'], 'status': 'ok'}\r
\r
          results = await asyncio.gather(\r
              *(process(item) for item in items),\r
              return_exceptions=True\r
          )\r
          return results, maxSeen\r
\r
      queueItems = [\r
          {'name': 'load-users', 'delay': 0.02},\r
          {'name': 'load-lessons', 'delay': 0.01},\r
          {'name': 'sync-report', 'delay': 0.02, 'fail': True}\r
      ]\r
      queueResults, maxConcurrentSeen = asyncio.run(runLimitedQueue(queueItems))\r
\r
      assert maxConcurrentSeen <= 2\r
      assert sum(isinstance(result, dict) for result in queueResults) == 2\r
      assert sum(isinstance(result, ValueError) for result in queueResults) == 1\r
      queueResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 제한된 비동기 작업 큐의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 제한된 비동기 작업 큐 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import asyncio\r
\r
    async def sayHello():\r
        await asyncio.sleep(0.01)\r
        return "Hello"\r
\r
    greeting = asyncio.run(sayHello())\r
    greeting\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import asyncio\r
\r
      async def sayHello():\r
          await asyncio.sleep(0.01)\r
          return "Hello"\r
\r
      greeting = asyncio.run(sayHello())\r
      greeting\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 23_asyncio-limited-queue-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - workflow_validation
    title: 제한된 비동기 작업 큐를 await 가능한 함수로 검증하기
    subtitle: Semaphore와 gather
    goal: 작업 목록을 동시성 제한으로 처리하고 성공 결과, 실패 이름, 최대 동시 실행 수를 반환한다.
    why: 숙달 검증은 asyncio.run 호출 암기가 아니라, coroutine entry가 실제로 await되어 결과와 실패를 같은 증거로 남기는지 확인합니다.
    explanation: async run_limited_queue(items, max_concurrent=2)를 완성해 Semaphore로 동시성을 제한하고 gather(return_exceptions=True) 결과를 요약하세요.
    tips:
    - max_concurrent가 1보다 작으면 ValueError로 막으세요.
    - 실패한 작업은 예외를 삼키지 말고 errorNames에 이름으로 남기세요.
    exercise:
      prompt: async run_limited_queue(items, max_concurrent=2)를 완성해 results, errorNames, maxConcurrentSeen을 반환하세요.
      starterCode: |-
        async def run_limited_queue(items, max_concurrent=2):
            raise NotImplementedError
      solution: |-
        import asyncio

        async def run_limited_queue(items, max_concurrent=2):
            if max_concurrent < 1:
                raise ValueError("max_concurrent must be positive")
            semaphore = asyncio.Semaphore(max_concurrent)
            active = 0
            max_seen = 0

            async def process(item):
                nonlocal active, max_seen
                async with semaphore:
                    active += 1
                    max_seen = max(max_seen, active)
                    await asyncio.sleep(item.get("delay", 0))
                    active -= 1
                    if item.get("fail"):
                        raise ValueError(item["name"])
                    return {"name": item["name"], "status": "ok"}

            gathered = await asyncio.gather(
                *(process(item) for item in items),
                return_exceptions=True,
            )
            return {
                "results": [item for item in gathered if isinstance(item, dict)],
                "errorNames": [str(item) for item in gathered if isinstance(item, ValueError)],
                "maxConcurrentSeen": max_seen,
            }
      hints:
      - async 함수 자체를 반환하지 말고 await가 끝난 dict를 반환하세요.
      - gather의 결과 순서는 입력 coroutine 순서와 같습니다.
    check:
      id: python.builtins.asyncio.limited-queue.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.asyncio.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: run_limited_queue
        cases:
        - id: limits-concurrency-and-keeps-errors
          arguments:
          - value:
            - name: load-users
              delay: 0.01
            - name: load-lessons
              delay: 0.01
            - name: sync-report
              delay: 0.01
              fail: true
          - value: 2
          expectedReturn:
            results:
            - name: load-users
              status: ok
            - name: load-lessons
              status: ok
            errorNames:
            - sync-report
            maxConcurrentSeen: 2
        - id: rejects-zero-concurrency
          arguments:
          - value:
            - name: load-users
              delay: 0
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 23_asyncio-timeout-summary-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - timeouts
    - concurrent_tasks
    title: 비동기 작업별 timeout 결과를 순서대로 요약하기
    subtitle: wait_for와 gather
    goal: jobs 목록을 동시에 실행하고 timeout 안에 끝난 작업과 시간 초과 작업을 같은 list로 반환한다.
    why: 전이 과제에서는 큐 제한에서 timeout 정책으로 옮겨, 성공과 실패를 UI가 바로 표시할 수 있는 구조로 정리합니다.
    explanation: async summarize_timeouts(jobs, timeout)를 완성해 각 작업의 name, status, result를 입력 순서대로 반환하세요.
    tips:
    - asyncio.wait_for는 지정 시간 안에 끝나지 않으면 TimeoutError를 냅니다.
    - gather는 동시에 실행하되 결과 list는 입력 순서를 유지합니다.
    exercise:
      prompt: async summarize_timeouts(jobs, timeout)를 완성해 빠른 작업은 ok, 느린 작업은 timeout으로 반환하세요.
      starterCode: |-
        async def summarize_timeouts(jobs, timeout):
            raise NotImplementedError
      solution: |-
        import asyncio

        async def summarize_timeouts(jobs, timeout):
            async def run_job(job):
                try:
                    result = await asyncio.wait_for(
                        asyncio.sleep(job["delay"], result=job["name"].upper()),
                        timeout,
                    )
                    return {"name": job["name"], "status": "ok", "result": result}
                except TimeoutError:
                    return {"name": job["name"], "status": "timeout", "result": ""}

            return await asyncio.gather(*(run_job(job) for job in jobs))
      hints:
      - TimeoutError를 밖으로 던지면 전체 gather 결과를 잃습니다.
      - 각 작업 결과를 같은 dict shape으로 맞추면 UI와 로그가 읽기 쉬워집니다.
    check:
      id: python.builtins.asyncio.timeout-summary.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.asyncio.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: summarize_timeouts
        cases:
        - id: separates-fast-and-slow-jobs
          arguments:
          - value:
            - name: fast
              delay: 0
            - name: slow
              delay: 0.03
          - value: 0.01
          expectedReturn:
          - name: fast
            status: ok
            result: FAST
          - name: slow
            status: timeout
            result: ""
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 23_asyncio-gather-order-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - concurrent_tasks
    - practice
    title: 완료 순서가 달라도 gather 반환 순서가 유지되는지 회상하기
    subtitle: create_task와 gather 순서
    goal: 지연 시간이 다른 작업을 동시에 실행하되 입력 index 순서대로 결과 list를 반환한다.
    why: 시간이 지나도 남아야 할 asyncio 감각은 빠른 작업이 먼저 끝나도 gather 반환은 입력 순서라는 점입니다.
    explanation: async collect_ordered_results(names)가 index, name, label을 가진 dict list를 입력 순서대로 반환하게 완성하세요.
    tips:
    - delay를 일부러 다르게 줘도 gather 결과는 입력 coroutine 순서입니다.
    - label에는 index와 name을 함께 넣어 순서를 눈으로 확인하세요.
    exercise:
      prompt: async collect_ordered_results(names)를 완성해 서로 다른 delay 뒤에도 입력 순서대로 label을 반환하세요.
      starterCode: |-
        async def collect_ordered_results(names):
            raise NotImplementedError
      solution: |-
        import asyncio

        async def collect_ordered_results(names):
            async def worker(index, name):
                await asyncio.sleep(0.002 * (len(names) - index))
                return {"index": index, "name": name, "label": f"{index}:{name}"}

            return await asyncio.gather(
                *(worker(index, name) for index, name in enumerate(names))
            )
      hints:
      - create_task를 쓰지 않아도 gather가 coroutine들을 schedule합니다.
      - 완료 순서가 아니라 입력 순서를 기대값으로 잡으세요.
    check:
      id: python.builtins.asyncio.gather-order.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.asyncio.empty.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: collect_ordered_results
        cases:
        - id: keeps-input-order
          arguments:
          - value:
            - alpha
            - beta
            - gamma
          expectedReturn:
          - index: 0
            name: alpha
            label: 0:alpha
          - index: 1
            name: beta
            label: 1:beta
          - index: 2
            name: gamma
            label: 2:gamma
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};