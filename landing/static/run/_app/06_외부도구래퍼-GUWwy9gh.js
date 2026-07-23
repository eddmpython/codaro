var e=`meta:
  id: procCtl_06
  title: 외부 도구 래퍼 함수
  order: 6
  category: procCtl
  difficulty: easy
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - subprocess
    - shutil
    - wrapper
intro:
  direction: shutil.which로 실행 파일 존재를 먼저 확인하고 subprocess.run을 감싼 작은 래퍼 함수로 외부 도구를 안전하게 호출한다.
  benefits:
    - shutil.which로 도구 누락을 자동화 시작 전에 잡는다.
    - 래퍼 함수가 실패 분기와 stdout 캡처를 한 곳에서 처리한다.
    - 결과를 자동화 표준 dict로 정규화한다.
    - 같은 도구를 여러 번 호출해도 멱등하게 동작한다.
  diagram:
    steps:
      - label: 존재 확인
        detail: shutil.which로 실행 파일 경로를 받거나 None을 받는다.
      - label: 단일 호출 래퍼
        detail: 한 함수가 인자 리스트와 timeout, cwd를 받아 결과 dict를 만든다.
      - label: 결과 정규화
        detail: stdout, stderr, returncode를 자동화 보고용 dict로 묶는다.
      - label: 종합 호출 흐름
        detail: 같은 도구를 두 번 호출해도 같은 결과 형태가 나오는지 검증한다.
    runtime:
      - label: 표준 라이브러리만
        detail: subprocess, shutil, sys만 사용한다.
      - label: assert 기반 검증
        detail: 결과 dict의 모든 키와 값이 기대값과 같은지 확인한다.
sections:
  - id: which-check
    title: 도구 존재 확인
    structuredPrimary: true
    subtitle: shutil.which 사용
    goal: 자동화 시작 전에 실행 파일이 PATH에서 발견되는지 확인한다.
    why: 의존하는 외부 도구가 없는 환경에서 자동화는 즉시 멈춰야 하므로 사전 점검이 가장 단순한 안전 장치다.
    explanation: shutil.which는 인자로 받은 이름을 PATH에서 찾아 경로를 돌려준다. 없으면 None이다. 자동화 시작 시점에 None이면 RuntimeError로 빠져나가 사용자에게 어떤 도구가 없는지 즉시 알려 줄 수 있다.
    tips:
      - sys.executable은 항상 존재하므로 which 결과가 None이 될 수 없다.
      - .exe 같은 확장자는 OS가 자동으로 검색하므로 단순 이름만 넘기는 편이 안전하다.
    snippet: |-
      import shutil
      import sys

      pythonPath = shutil.which(sys.executable)
      ghostPath = shutil.which("definitely-not-a-real-tool-xyz")

      assert pythonPath is not None
      assert ghostPath is None
      {"python": pythonPath is not None, "ghost": ghostPath}
    exercise:
      prompt: shutil.which로 sys.executable을 그대로 찾으면 None이 아닌 경로가 돌아오는지 검증하세요.
      starterCode: |-
        import shutil
        import sys

        found = shutil.___(sys.executable)
        present = found is not None

        assert present is True
        present
      solution: |-
        import shutil
        import sys

        found = shutil.which(sys.executable)
        present = found is not None

        assert present is True
        present
      hints:
        - shutil.which는 PATH 또는 절대 경로 인자를 받는다.
        - 절대 경로가 인자이면 그 파일이 존재할 때 같은 경로가 돌아온다.
      check:
        type: noError
        noError: shutil.which 호출이 OSError 없이 끝나야 한다.
        resultCheck: present 값이 True여야 한다.
    check:
      noError: 두 번의 which 호출이 정상적으로 끝나야 한다.
      resultCheck: pythonPath는 None이 아니고 ghostPath는 None이어야 한다.
  - id: simple-wrapper
    title: 호출 래퍼 함수 만들기
    structuredPrimary: true
    subtitle: subprocess.run을 한 곳에서
    goal: 외부 도구 호출을 한 함수로 감싸 결과를 표준 dict로 만든다.
    why: 자동화 코드가 여러 외부 도구를 호출할 때 호출 패턴을 한 함수로 모으면 옵션 변경 한 곳만 손대면 된다.
    explanation: 래퍼 함수는 인자 리스트와 timeout을 받아 subprocess.run을 호출하고 결과 dict를 만든다. capture_output=True와 text=True를 기본으로 두어 호출자가 옵션을 잊지 않도록 한다. 실패 분기는 returncode로 직접 판별하거나 다음 섹션의 try/except 패턴으로 확장한다.
    tips:
      - 함수 시그니처에 기본값을 두면 호출자가 인자 한 두 개만 넘겨도 된다.
      - 결과 dict 키 이름을 고정하면 자동화 보고가 흔들리지 않는다.
    snippet: |-
      import subprocess
      import sys


      def callTool(args: list[str], timeoutSeconds: float = 5.0) -> dict:
          result = subprocess.run(
              args,
              timeout=timeoutSeconds,
              capture_output=True,
              text=True,
          )
          return {
              "returncode": result.returncode,
              "stdout": result.stdout.strip(),
              "stderr": result.stderr.strip(),
          }


      summary = callTool([sys.executable, "-c", "print('codaro')"])

      assert summary == {"returncode": 0, "stdout": "codaro", "stderr": ""}
      summary
    exercise:
      prompt: callTool로 자식이 "hello"를 출력하는 명령을 호출해 결과 dict의 stdout이 "hello"인지 검증하세요.
      starterCode: |-
        import subprocess
        import sys


        def callTool(args: list[str], timeoutSeconds: float = 5.0) -> dict:
            result = subprocess.run(
                args,
                timeout=timeoutSeconds,
                capture_output=___,
                text=True,
            )
            return {
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        summary = callTool([sys.executable, "-c", "print('___')"])

        assert summary == {"returncode": 0, "stdout": "hello", "stderr": ""}
        summary
      solution: |-
        import subprocess
        import sys


        def callTool(args: list[str], timeoutSeconds: float = 5.0) -> dict:
            result = subprocess.run(
                args,
                timeout=timeoutSeconds,
                capture_output=True,
                text=True,
            )
            return {
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        summary = callTool([sys.executable, "-c", "print('hello')"])

        assert summary == {"returncode": 0, "stdout": "hello", "stderr": ""}
        summary
      hints:
        - capture_output 인자는 True여야 결과 dict의 stdout이 채워진다.
        - 자식 print 문자열을 "hello"로 두면 stdout 키가 같은 값으로 채워진다.
      check:
        type: noError
        noError: callTool 호출이 TypeError 없이 끝나야 한다.
        resultCheck: summary 딕셔너리가 returncode 0, stdout "hello", stderr 빈 문자열이어야 한다.
    check:
      noError: 래퍼 함수와 자식 호출이 차례로 끝나야 한다.
      resultCheck: summary의 returncode 0, stdout "codaro", stderr 빈 문자열이어야 한다.
  - id: missing-tool-guard
    title: 누락 도구 차단 분기
    structuredPrimary: true
    subtitle: 사전 검사 후 RuntimeError
    goal: 사전 검사에서 도구가 없으면 좁힌 예외로 자동화 흐름을 즉시 멈춘다.
    why: 자동화는 의존 도구 누락이 첫 단계에서 명확히 드러나야 사용자가 환경 문제임을 즉시 알 수 있다.
    explanation: 래퍼 함수는 시작 시 shutil.which 결과를 확인하고 None이면 RuntimeError를 발생시킨다. 호출자는 좁힌 except로 잡아 "도구가 없습니다" 메시지를 만든다. raise 시 from None으로 체인을 끊으면 사용자 메시지가 깔끔해진다.
    tips:
      - except 절은 RuntimeError로 좁혀 다른 예외를 숨기지 않게 한다.
      - 예외 메시지에 도구 이름을 포함하면 운영자가 즉시 어떤 도구를 설치해야 하는지 알 수 있다.
    snippet: |-
      import shutil
      import subprocess


      def requireTool(name: str) -> str:
          path = shutil.which(name)
          if path is None:
              raise RuntimeError(f"tool not found: {name}")
          return path


      attempts = []
      try:
          requireTool("definitely-not-a-real-tool-xyz")
      except RuntimeError as exc:
          attempts.append(str(exc))

      assert attempts == ["tool not found: definitely-not-a-real-tool-xyz"]
      attempts
    exercise:
      prompt: requireTool("missing-tool-zzz")이 RuntimeError를 일으키고 메시지에 도구 이름이 포함되는지 검증하세요.
      starterCode: |-
        import shutil


        def requireTool(name: str) -> str:
            path = shutil.which(name)
            if path is None:
                raise ___(f"tool not found: {name}")
            return path


        attempts = []
        try:
            requireTool("___")
        except RuntimeError as exc:
            attempts.append(str(exc))

        assert attempts == ["tool not found: missing-tool-zzz"]
        attempts
      solution: |-
        import shutil


        def requireTool(name: str) -> str:
            path = shutil.which(name)
            if path is None:
                raise RuntimeError(f"tool not found: {name}")
            return path


        attempts = []
        try:
            requireTool("missing-tool-zzz")
        except RuntimeError as exc:
            attempts.append(str(exc))

        assert attempts == ["tool not found: missing-tool-zzz"]
        attempts
      hints:
        - raise 키워드 뒤에는 RuntimeError 같은 좁힌 예외 클래스가 와야 한다.
        - 함수 인자 문자열 missing-tool-zzz가 메시지에도 포함되어야 한다.
      check:
        type: noError
        noError: requireTool 호출이 의도한 RuntimeError로 잡혀야 한다.
        resultCheck: attempts에 도구 이름이 포함된 메시지 한 줄이 들어가야 한다.
    check:
      noError: 사전 검사 실패가 RuntimeError 한 가지 경로로 분기되어야 한다.
      resultCheck: attempts에 정확히 도구 이름이 포함된 메시지가 한 줄 들어가야 한다.
  - id: combined-wrapper
    title: 종합 래퍼 함수 정리
    structuredPrimary: true
    subtitle: 사전 검사 + 실행 + 분류
    goal: 사전 검사, 호출, 결과 분류를 한 함수에 모아 자동화 보고서에 그대로 사용할 표준 결과 dict를 만든다.
    why: 자동화는 단계가 누적될수록 호출 패턴 통일이 가독성을 결정하므로 종합 래퍼가 표준 입출력이 된다.
    explanation: runExternal 함수는 도구 이름을 받아 requireTool로 확인하고 callTool 결과에 tool 키와 status 키를 추가한다. status는 success 또는 failed 중 하나가 되어 다음 단계의 분기 입력이 된다. 같은 호출을 두 번 해도 같은 status가 돌아오는지 종합 검증한다.
    tips:
      - tool 키는 실행 파일 절대 경로를 두어 사고 분석에 도움을 준다.
      - status 키 값은 항상 두 가지 문자열 중 하나로 두어 비교가 단순해진다.
    snippet: |-
      import shutil
      import subprocess
      import sys


      def requireTool(name: str) -> str:
          path = shutil.which(name)
          if path is None:
              raise RuntimeError(f"tool not found: {name}")
          return path


      def runExternal(name: str, args: list[str], timeoutSeconds: float = 5.0) -> dict:
          resolved = requireTool(name)
          result = subprocess.run(
              [resolved, *args],
              timeout=timeoutSeconds,
              capture_output=True,
              text=True,
          )
          status = "success" if result.returncode == 0 else "failed"
          return {
              "tool": resolved,
              "status": status,
              "returncode": result.returncode,
              "stdout": result.stdout.strip(),
              "stderr": result.stderr.strip(),
          }


      first = runExternal(sys.executable, ["-c", "print('first')"])
      second = runExternal(sys.executable, ["-c", "print('second')"])

      assert first["status"] == "success"
      assert first["stdout"] == "first"
      assert second["stdout"] == "second"
      {"first": first["stdout"], "second": second["stdout"]}
    exercise:
      prompt: runExternal을 같은 sys.executable에 두 번 호출해 두 결과의 status가 모두 success가 되고 stdout이 본문에서 지정한 문자열과 같은지 종합 검증하세요.
      starterCode: |-
        import shutil
        import subprocess
        import sys


        def requireTool(name: str) -> str:
            path = shutil.which(name)
            if path is None:
                raise RuntimeError(f"tool not found: {name}")
            return path


        def runExternal(name: str, args: list[str], timeoutSeconds: float = 5.0) -> dict:
            resolved = requireTool(name)
            result = subprocess.run(
                [resolved, *args],
                timeout=timeoutSeconds,
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == ___ else "failed"
            return {
                "tool": resolved,
                "status": status,
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        first = runExternal(sys.executable, ["-c", "print('one')"])
        second = runExternal(sys.executable, ["-c", "print('two')"])

        assert first["status"] == "success"
        assert second["status"] == "success"
        assert (first["stdout"], second["stdout"]) == ("one", "two")
        {"first": first["stdout"], "second": second["stdout"]}
      solution: |-
        import shutil
        import subprocess
        import sys


        def requireTool(name: str) -> str:
            path = shutil.which(name)
            if path is None:
                raise RuntimeError(f"tool not found: {name}")
            return path


        def runExternal(name: str, args: list[str], timeoutSeconds: float = 5.0) -> dict:
            resolved = requireTool(name)
            result = subprocess.run(
                [resolved, *args],
                timeout=timeoutSeconds,
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == 0 else "failed"
            return {
                "tool": resolved,
                "status": status,
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        first = runExternal(sys.executable, ["-c", "print('one')"])
        second = runExternal(sys.executable, ["-c", "print('two')"])

        assert first["status"] == "success"
        assert second["status"] == "success"
        assert (first["stdout"], second["stdout"]) == ("one", "two")
        {"first": first["stdout"], "second": second["stdout"]}
      hints:
        - returncode가 0이어야 status가 success로 매겨진다.
        - 두 번의 호출에서 stdout이 본문에서 지정한 문자열과 같아야 한다.
      check:
        type: noError
        noError: runExternal 두 번 호출이 종합 정리 흐름으로 끝나야 한다.
        resultCheck: 두 결과의 status가 모두 success이고 stdout 값이 종합 기대값과 같아야 한다.
    check:
      noError: 종합 래퍼 함수와 사전 검사가 한 흐름에서 끝나야 한다.
      resultCheck: first와 second 두 호출의 stdout이 본문에서 지정한 문자열과 정확히 같아야 한다.
`;export{e as default};