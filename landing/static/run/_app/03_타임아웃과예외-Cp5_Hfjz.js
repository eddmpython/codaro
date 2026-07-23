var e=`meta:\r
  id: procCtl_03\r
  title: 타임아웃과 예외 처리\r
  order: 3\r
  category: procCtl\r
  difficulty: easy\r
  audience: 프로세스 자동화에 입문하는 Python 학습자\r
  packages: []\r
  tags:\r
    - subprocess\r
    - timeout\r
    - exception\r
intro:\r
  direction: subprocess.run의 timeout 인자와 TimeoutExpired, CalledProcessError를 좁힌 예외 처리로 자동화에서 멈춤 사고와 실패 사고를 안전하게 다룬다.\r
  benefits:\r
    - timeout 인자로 멈춘 자식 프로세스를 잡는다.\r
    - TimeoutExpired 예외에서 남은 자식 프로세스를 안전하게 종료한다.\r
    - CalledProcessError와 TimeoutExpired를 분리해 다른 흐름으로 처리한다.\r
    - 종합 처리 함수가 성공, 실패, 멈춤 세 결과를 dict로 분류한다.\r
  diagram:\r
    steps:\r
      - label: 짧은 timeout 설정\r
        detail: 자식이 1초보다 오래 걸리는 경우 timeout 인자로 자동 종료한다.\r
      - label: TimeoutExpired 잡기\r
        detail: 좁힌 except로 TimeoutExpired만 처리하고 좀비 프로세스를 정리한다.\r
      - label: 실패와 멈춤 분리\r
        detail: CalledProcessError는 실패, TimeoutExpired는 멈춤으로 다른 키에 기록한다.\r
      - label: 종합 결과 분류\r
        detail: 세 결과를 한 함수로 묶어 status 키에 success, failed, timeout 중 하나를 둔다.\r
    runtime:\r
      - label: 표준 라이브러리만\r
        detail: subprocess와 sys만 사용해 외부 패키지가 필요 없다.\r
      - label: assert 기반 검증\r
        detail: timeout 발생과 returncode를 assert로 비교한다.\r
sections:\r
  - id: timeout-basic\r
    title: 자식이 너무 오래 걸릴 때\r
    structuredPrimary: true\r
    subtitle: subprocess.run의 timeout\r
    goal: 일부러 멈춰 있는 자식을 timeout 인자로 강제 종료한다.\r
    why: 자동화 흐름이 외부 명령에서 멈추면 전체 사이클이 진행되지 않으므로 timeout 인자가 안전 핸들이다.\r
    explanation: subprocess.run에 timeout 초가 지나면 TimeoutExpired 예외가 발생한다. 예외 객체는 cmd와 timeout 값을 모두 들고 있어 로그에 그대로 기록할 수 있다. 자식 프로세스는 라이브러리가 자동으로 종료 시그널을 보낸다.\r
    tips:\r
      - timeout은 부동소수도 받으므로 0.5초 같은 짧은 값도 가능하다.\r
      - TimeoutExpired는 좁힌 예외이므로 except 절은 정확히 그 이름으로 잡는다.\r
    snippet: |-\r
      import subprocess\r
      import sys\r
\r
      events = []\r
      try:\r
          subprocess.run(\r
              [sys.executable, "-c", "import time; time.sleep(5)"],\r
              timeout=0.3,\r
          )\r
      except subprocess.TimeoutExpired as exc:\r
          events.append({"timeout": round(exc.timeout, 3), "cmd": exc.cmd[-1]})\r
\r
      assert events == [{"timeout": 0.3, "cmd": "import time; time.sleep(5)"}]\r
      events\r
    exercise:\r
      prompt: 자식이 time.sleep(2)를 호출하도록 두고 timeout을 0.2초로 줘서 TimeoutExpired가 정확히 발생하는지 검증하세요.\r
      starterCode: |-\r
        import subprocess\r
        import sys\r
\r
        events = []\r
        try:\r
            subprocess.run(\r
                [sys.executable, "-c", "import time; time.sleep(___)"],\r
                timeout=___,\r
            )\r
        except subprocess.TimeoutExpired as exc:\r
            events.append({"timeout": round(exc.timeout, 3), "cmd": exc.cmd[-1]})\r
\r
        assert events == [{"timeout": 0.2, "cmd": "import time; time.sleep(2)"}]\r
        events\r
      solution: |-\r
        import subprocess\r
        import sys\r
\r
        events = []\r
        try:\r
            subprocess.run(\r
                [sys.executable, "-c", "import time; time.sleep(2)"],\r
                timeout=0.2,\r
            )\r
        except subprocess.TimeoutExpired as exc:\r
            events.append({"timeout": round(exc.timeout, 3), "cmd": exc.cmd[-1]})\r
\r
        assert events == [{"timeout": 0.2, "cmd": "import time; time.sleep(2)"}]\r
        events\r
      hints:\r
        - 자식 sleep 인자와 timeout 값은 본문에서 지정한 대로 2와 0.2다.\r
        - exc.cmd[-1]은 -c 다음의 코드 문자열을 그대로 돌려준다.\r
      check:\r
        type: noError\r
        noError: TimeoutExpired 좁힌 예외 처리가 정확히 발동해야 한다.\r
        resultCheck: events 리스트가 본문 기대값과 정확히 같아야 한다.\r
    check:\r
      noError: TimeoutExpired 좁힌 예외가 발생하고 잡혀야 한다.\r
      resultCheck: events 리스트가 timeout 0.3과 자식 명령 문자열을 정확히 담아야 한다.\r
  - id: capture-after-timeout\r
    title: 타임아웃 후 출력 복원\r
    structuredPrimary: true\r
    subtitle: stdout 일부 보존\r
    goal: 자식이 타임아웃되더라도 그 시점까지 남긴 stdout 부분을 보존해 로그로 기록한다.\r
    why: 자동화 진단에서 멈추기 전에 자식이 어디까지 진행했는지 알 수 있으면 사고 분석이 훨씬 빨라진다.\r
    explanation: TimeoutExpired 예외 객체에는 stdout과 stderr 속성이 있다. capture_output=True를 켰을 때 예외 시점까지의 출력이 들어 있다. 자식이 멈추기 전에 남긴 print 결과를 그대로 받을 수 있어 흔히 progress 표시 용도로 쓰인다.\r
    tips:\r
      - flush=True를 print에 주면 stdout이 즉시 자식 밖으로 빠져 나간다.\r
      - TimeoutExpired.stdout은 bytes 또는 text 모드 설정에 따라 형이 다르다.\r
      - 부분 출력을 보려면 timeout이 자식의 첫 출력 시점보다 길어야 한다. 너무 짧으면 자식이 인터프리터를 띄우기도 전에 잘려 stdout이 빈다.\r
    snippet: |-\r
      import subprocess\r
      import sys\r
\r
      script = "import time, sys; print('start', flush=True); time.sleep(30); print('end')"\r
      collected = None\r
      try:\r
          subprocess.run(\r
              [sys.executable, "-c", script],\r
              timeout=8.0,\r
              capture_output=True,\r
              text=True,\r
          )\r
      except subprocess.TimeoutExpired as exc:\r
          collected = (exc.stdout or "").strip()\r
\r
      assert collected == "start"\r
      collected\r
    exercise:\r
      prompt: 자식이 "running"을 출력한 뒤 sleep으로 멈추도록 만들고 TimeoutExpired에서 stdout이 "running"으로 잡히는지 검증하세요.\r
      starterCode: |-\r
        import subprocess\r
        import sys\r
\r
        script = "import time, sys; print('___', flush=True); time.sleep(30)"\r
        collected = None\r
        try:\r
            subprocess.run(\r
                [sys.executable, "-c", script],\r
                timeout=8.0,\r
                capture_output=___,\r
                text=True,\r
            )\r
        except subprocess.TimeoutExpired as exc:\r
            collected = (exc.stdout or "").strip()\r
\r
        assert collected == "running"\r
        collected\r
      solution: |-\r
        import subprocess\r
        import sys\r
\r
        script = "import time, sys; print('running', flush=True); time.sleep(30)"\r
        collected = None\r
        try:\r
            subprocess.run(\r
                [sys.executable, "-c", script],\r
                timeout=8.0,\r
                capture_output=True,\r
                text=True,\r
            )\r
        except subprocess.TimeoutExpired as exc:\r
            collected = (exc.stdout or "").strip()\r
\r
        assert collected == "running"\r
        collected\r
      hints:\r
        - 자식 print 문자열을 "running"으로 두면 collected와 비교가 통과한다.\r
        - capture_output=True를 켜야 TimeoutExpired 객체에 stdout이 들어간다.\r
      check:\r
        type: noError\r
        noError: TimeoutExpired 발생과 예외 객체 stdout 접근이 끝나야 한다.\r
        resultCheck: collected가 "running"과 정확히 같아야 한다.\r
    check:\r
      noError: 부분 출력 보존 흐름이 정상적으로 끝나야 한다.\r
      resultCheck: collected가 "start" 문자열을 포함해 타임아웃 직전 출력을 보존해야 한다.\r
  - id: differentiate-errors\r
    title: 실패와 멈춤 분기\r
    structuredPrimary: true\r
    subtitle: CalledProcessError vs TimeoutExpired\r
    goal: 자식 실행 결과를 success, failed, timeout 세 분기로 처리한다.\r
    why: 자동화는 각 분기에 다른 후속 작업이 따라오므로 예외 종류를 정확히 분리하는 것이 큰 차이를 만든다.\r
    explanation: try 블록 안에 subprocess.run을 호출하고 except 절을 두 개로 분리한다. TimeoutExpired는 멈춤 분기, CalledProcessError는 실패 분기, try의 정상 경로는 성공 분기다. 결과 dict는 status 키에 셋 중 하나를 두어 다음 단계가 분기를 그대로 사용할 수 있게 한다.\r
    tips:\r
      - 두 except 절은 좁힌 예외만 받게 두고 그 외 예외는 잡지 않는다.\r
      - status 값은 항상 동일한 세 문자열로 두어 후속 코드가 비교하기 쉬워진다.\r
    snippet: |-\r
      import subprocess\r
      import sys\r
\r
\r
      def runOnce(script: str, timeoutSeconds: float) -> dict:\r
          try:\r
              result = subprocess.run(\r
                  [sys.executable, "-c", script],\r
                  timeout=timeoutSeconds,\r
                  capture_output=True,\r
                  text=True,\r
                  check=True,\r
              )\r
              return {"status": "success", "returncode": result.returncode}\r
          except subprocess.TimeoutExpired:\r
              return {"status": "timeout", "returncode": None}\r
          except subprocess.CalledProcessError as exc:\r
              return {"status": "failed", "returncode": exc.returncode}\r
\r
\r
      summary = {\r
          "ok": runOnce("print('ok')", 10.0),\r
          "slow": runOnce("import time; time.sleep(5)", 0.2),\r
          "fail": runOnce("import sys; sys.exit(3)", 10.0),\r
      }\r
\r
      assert summary["ok"]["status"] == "success"\r
      assert summary["slow"]["status"] == "timeout"\r
      assert summary["fail"]["status"] == "failed"\r
      summary\r
    exercise:\r
      prompt: runOnce를 호출해 sys.exit(4)는 failed 분기로 가고 sleep(3)에 timeout 0.2초는 timeout 분기로 가는지 검증하세요.\r
      starterCode: |-\r
        import subprocess\r
        import sys\r
\r
\r
        def runOnce(script: str, timeoutSeconds: float) -> dict:\r
            try:\r
                result = subprocess.run(\r
                    [sys.executable, "-c", script],\r
                    timeout=timeoutSeconds,\r
                    capture_output=True,\r
                    text=True,\r
                    check=True,\r
                )\r
                return {"status": "success", "returncode": result.returncode}\r
            except subprocess.___:\r
                return {"status": "timeout", "returncode": None}\r
            except subprocess.___ as exc:\r
                return {"status": "failed", "returncode": exc.returncode}\r
\r
\r
        first = runOnce("import sys; sys.exit(4)", 10.0)\r
        second = runOnce("import time; time.sleep(3)", 0.2)\r
\r
        assert first == {"status": "failed", "returncode": 4}\r
        assert second == {"status": "timeout", "returncode": None}\r
        {"first": first, "second": second}\r
      solution: |-\r
        import subprocess\r
        import sys\r
\r
\r
        def runOnce(script: str, timeoutSeconds: float) -> dict:\r
            try:\r
                result = subprocess.run(\r
                    [sys.executable, "-c", script],\r
                    timeout=timeoutSeconds,\r
                    capture_output=True,\r
                    text=True,\r
                    check=True,\r
                )\r
                return {"status": "success", "returncode": result.returncode}\r
            except subprocess.TimeoutExpired:\r
                return {"status": "timeout", "returncode": None}\r
            except subprocess.CalledProcessError as exc:\r
                return {"status": "failed", "returncode": exc.returncode}\r
\r
\r
        first = runOnce("import sys; sys.exit(4)", 10.0)\r
        second = runOnce("import time; time.sleep(3)", 0.2)\r
\r
        assert first == {"status": "failed", "returncode": 4}\r
        assert second == {"status": "timeout", "returncode": None}\r
        {"first": first, "second": second}\r
      hints:\r
        - 첫 번째 except 이름은 subprocess.TimeoutExpired다.\r
        - 두 번째 except 이름은 subprocess.CalledProcessError다.\r
      check:\r
        type: noError\r
        noError: 두 분기 호출이 좁힌 예외 처리로 끝나야 한다.\r
        resultCheck: first는 status failed, second는 status timeout으로 분류되어야 한다.\r
    check:\r
      noError: 세 가지 경우 모두 분기 처리가 정상적으로 끝나야 한다.\r
      resultCheck: summary의 세 status 값이 success, timeout, failed로 각각 분류되어야 한다.\r
  - id: status-summary\r
    title: 종합 status 분류 정리\r
    structuredPrimary: true\r
    subtitle: dict 한 개로 한 사이클 보고\r
    goal: 여러 명령을 한 번에 실행한 결과를 status별로 분류해 보고 dict로 정리한다.\r
    why: 자동화 배치 작업은 명령 단위 결과보다 전체 사이클의 통계 보고가 다음 의사결정에 직접 사용된다.\r
    explanation: 마지막 섹션은 입력 명령 목록을 받아 각 명령을 runOnce로 실행한 뒤 결과를 status별 리스트로 분류한다. successList, failedList, timeoutList 세 키를 가진 종합 보고는 운영자가 한 화면에서 한 사이클을 이해할 수 있게 한다. 동일 입력에 대한 두 번째 실행은 같은 분류를 만들어야 한다.\r
    tips:\r
      - 종합 보고 dict의 키 이름을 고정하면 운영 화면이 흔들리지 않는다.\r
      - 리스트 내부 항목은 명령 식별자만 두어 보고가 길어지지 않게 한다.\r
    snippet: |-\r
      import subprocess\r
      import sys\r
\r
\r
      def runOnce(name: str, script: str, timeoutSeconds: float) -> dict:\r
          try:\r
              subprocess.run(\r
                  [sys.executable, "-c", script],\r
                  timeout=timeoutSeconds,\r
                  capture_output=True,\r
                  text=True,\r
                  check=True,\r
              )\r
              return {"name": name, "status": "success"}\r
          except subprocess.TimeoutExpired:\r
              return {"name": name, "status": "timeout"}\r
          except subprocess.CalledProcessError:\r
              return {"name": name, "status": "failed"}\r
\r
\r
      def summarizeBatch(jobs: list[dict]) -> dict:\r
          buckets = {"success": [], "failed": [], "timeout": []}\r
          for job in jobs:\r
              result = runOnce(job["name"], job["script"], job["timeout"])\r
              buckets[result["status"]].append(result["name"])\r
          return buckets\r
\r
\r
      summary = summarizeBatch([\r
          {"name": "ok", "script": "print(1)", "timeout": 10.0},\r
          {"name": "slow", "script": "import time; time.sleep(5)", "timeout": 0.2},\r
          {"name": "fail", "script": "import sys; sys.exit(2)", "timeout": 10.0},\r
      ])\r
\r
      assert summary == {"success": ["ok"], "failed": ["fail"], "timeout": ["slow"]}\r
      summary\r
    exercise:\r
      prompt: summarizeBatch에 두 개의 ok 작업과 한 개의 fail 작업을 넘기면 success 리스트에 두 이름이 들어가고 failed 리스트에 한 이름이 들어가는지 종합 검증하세요.\r
      starterCode: |-\r
        import subprocess\r
        import sys\r
\r
\r
        def runOnce(name: str, script: str, timeoutSeconds: float) -> dict:\r
            try:\r
                subprocess.run(\r
                    [sys.executable, "-c", script],\r
                    timeout=timeoutSeconds,\r
                    capture_output=True,\r
                    text=True,\r
                    check=True,\r
                )\r
                return {"name": name, "status": "success"}\r
            except subprocess.TimeoutExpired:\r
                return {"name": name, "status": "timeout"}\r
            except subprocess.CalledProcessError:\r
                return {"name": name, "status": "failed"}\r
\r
\r
        def summarizeBatch(jobs: list[dict]) -> dict:\r
            buckets = {"success": [], "failed": [], "timeout": []}\r
            for job in jobs:\r
                result = runOnce(job["name"], job["script"], job["timeout"])\r
                buckets[result["___"]].append(result["name"])\r
            return buckets\r
\r
\r
        summary = summarizeBatch([\r
            {"name": "alpha", "script": "print(0)", "timeout": 10.0},\r
            {"name": "beta", "script": "print(1)", "timeout": 10.0},\r
            {"name": "gamma", "script": "import sys; sys.exit(9)", "timeout": 10.0},\r
        ])\r
\r
        assert summary == {"success": ["alpha", "beta"], "failed": ["gamma"], "timeout": []}\r
        summary\r
      solution: |-\r
        import subprocess\r
        import sys\r
\r
\r
        def runOnce(name: str, script: str, timeoutSeconds: float) -> dict:\r
            try:\r
                subprocess.run(\r
                    [sys.executable, "-c", script],\r
                    timeout=timeoutSeconds,\r
                    capture_output=True,\r
                    text=True,\r
                    check=True,\r
                )\r
                return {"name": name, "status": "success"}\r
            except subprocess.TimeoutExpired:\r
                return {"name": name, "status": "timeout"}\r
            except subprocess.CalledProcessError:\r
                return {"name": name, "status": "failed"}\r
\r
\r
        def summarizeBatch(jobs: list[dict]) -> dict:\r
            buckets = {"success": [], "failed": [], "timeout": []}\r
            for job in jobs:\r
                result = runOnce(job["name"], job["script"], job["timeout"])\r
                buckets[result["status"]].append(result["name"])\r
            return buckets\r
\r
\r
        summary = summarizeBatch([\r
            {"name": "alpha", "script": "print(0)", "timeout": 10.0},\r
            {"name": "beta", "script": "print(1)", "timeout": 10.0},\r
            {"name": "gamma", "script": "import sys; sys.exit(9)", "timeout": 10.0},\r
        ])\r
\r
        assert summary == {"success": ["alpha", "beta"], "failed": ["gamma"], "timeout": []}\r
        summary\r
      hints:\r
        - 분류 키 이름은 result 객체의 status 속성을 그대로 사용한다.\r
        - 세 명령 중 두 개는 성공, 한 개는 실패이므로 timeout 리스트는 빈 채 남는다.\r
      check:\r
        type: noError\r
        noError: summarizeBatch 호출이 KeyError 없이 끝나야 한다.\r
        resultCheck: 종합 결과 dict가 success 두 개와 failed 한 개를 정확히 분류해야 한다.\r
    check:\r
      noError: 종합 분류 함수와 세 작업 실행이 한 흐름에서 끝나야 한다.\r
      resultCheck: summary가 success ok, failed fail, timeout slow 세 키 분류를 정확히 보고해야 한다.\r
`;export{e as default};