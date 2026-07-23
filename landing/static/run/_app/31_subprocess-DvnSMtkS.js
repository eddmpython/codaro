var e=`meta:
  id: '31'
  title: subprocess
  day: 31
  category: builtins
  tags:
  - subprocess
  - 외부명령
  - 자동화
  - CompletedProcess
  - Popen
  - 보안
  seo:
    title: 파이썬 subprocess 표준 라이브러리 - 외부 명령 실행
    description: subprocess.run, capture_output, check, shell=True 위험성, Popen으로 파이프 다루기.
    keywords:
    - subprocess.run
    - CompletedProcess
    - capture_output
    - subprocess.Popen
    - shell injection
intro:
  emoji: 📡
  points:
  - subprocess.run으로 외부 명령 실행과 결과 수집
  - capture_output, text, check, timeout 인자 의미
  - shell=True 의 위험성과 리스트 인자 사용
  - Popen으로 stdin/stdout 파이프 직접 제어
  - returncode와 stderr로 실패 진단
  direction: subprocess에서 외부 명령을 실행하고 결과/오류/종료 코드를 표준 객체로 받아 자동화 흐름을 코드로 확인합니다.
  benefits:
  - 셸 스크립트와 Python 코드를 한 자리에 묶어 자동화 워크플로를 만듭니다.
  - 결과를 문자열/바이트로 받아 후속 처리에 그대로 사용합니다.
  - shell=True 사용 시의 인젝션 위험을 이해하고 안전한 호출 패턴을 선택합니다.
  diagram:
    steps:
    - label: 명령 입력 확인
      detail: 실행할 명령을 리스트로 작성하고 인자가 올바른 위치에 있는지 점검합니다.
    - label: subprocess.run 처리 실행
      detail: capture_output과 text 인자로 결과를 문자열로 받아옵니다.
    - label: 결과 검증
      detail: returncode, stdout, stderr를 확인해 명령 성공/실패를 판단합니다.
    - label: subprocess 패턴 재사용
      detail: 자동화 스크립트에서 같은 호출 흐름을 다른 명령에 그대로 붙입니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: subprocess와 sys만 사용해 추가 패키지 없이 실행합니다.
    - label: subprocess 실행
      detail: 셀을 실행해 외부 프로세스 호출과 결과 객체 필드를 확인합니다.
    - label: subprocess 완료
      detail: 검증된 호출 패턴을 자동화 유틸리티로 남깁니다.
sections:
- id: run-basics
  title: subprocess.run으로 명령 실행
  structuredPrimary: true
  subtitle: CompletedProcess 객체 받아오기
  goal: subprocess.run으로 Python 인터프리터를 띄워 한 줄 코드를 실행하고 stdout을 문자열로 받습니다.
  why: 외부 명령을 깔끔하게 한 번 실행하고 결과를 객체로 받는 것이 자동화 코드의 기본 형태입니다.
  explanation: subprocess.run(args, capture_output=True, text=True)는 args 리스트를 외부 명령으로 실행하고 CompletedProcess 객체를 돌려줍니다. capture_output=True가 stdout/stderr을 캡처하고 text=True가 바이트를 문자열로 디코딩합니다.
  tips:
  - args는 리스트로 전달하는 것이 안전합니다. 공백을 포함한 인자가 그대로 한 인자로 전달됩니다.
  - capture_output=False(기본)면 stdout이 부모 콘솔로 출력되어 캡처되지 않습니다.
  snippet: |-
    import subprocess
    import sys

    result = subprocess.run(
        [sys.executable, "-c", "print('hello from child')"],
        capture_output=True,
        text=True,
    )

    {"returncode": result.returncode, "stdoutLines": result.stdout.splitlines(), "stderr": result.stderr}
  exercise:
    prompt: stderr로 출력하는 코드를 한 줄 짜서 실행하고, stdout과 stderr이 각각 어디에 담기는지 확인하세요.
    starterCode: |-
      import subprocess
      import sys

      result = subprocess.run(
          [sys.executable, "-c", "import sys; print('out'); print('err', file=sys.stderr)"],
          capture_output=True,
          text=True,
      )

      {
          "returncode": result.returncode,
          "stdout": result.stdout.strip(),
          "stderr": result.stderr.strip(),
      }
    hints:
    - capture_output=True가 둘 다 캡처합니다.
    - print(..., file=sys.stderr)는 stderr로 흐릅니다.
  check:
    type: noError
    noError: subprocess.run 호출이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: returncode가 0이고 stdout과 stderr이 각각 out과 err로 분리되어야 합니다.
- id: check-and-timeout
  title: check와 timeout으로 실패 안전성
  structuredPrimary: true
  subtitle: 자동 예외 발생과 시간 제한
  goal: check=True로 비정상 종료 코드에 예외를 발생시키고 timeout으로 무한 대기를 막는 흐름을 확인합니다.
  why: 자동화 스크립트는 외부 명령 실패를 빨리 감지해야 하고, 멈춘 명령으로 전체가 정지되는 사고를 피해야 합니다.
  explanation: check=True는 returncode가 0이 아니면 CalledProcessError를 발생시킵니다. timeout=초로 지정하면 시간을 초과한 명령에 SIGTERM을 보내고 TimeoutExpired를 발생시킵니다. 두 예외 모두 result.stdout/stderr 속성에 부분 출력이 담깁니다.
  tips:
  - check=False(기본)일 때는 returncode를 직접 확인해야 합니다.
  - timeout 발생 시에도 자식 프로세스가 끝나 있도록 wait/communicate가 호출됩니다.
  snippet: |-
    import subprocess
    import sys

    try:
        subprocess.run(
            [sys.executable, "-c", "import sys; sys.exit(2)"],
            capture_output=True,
            text=True,
            check=True,
        )
        outcome = "no error"
    except subprocess.CalledProcessError as exc:
        outcome = {"returncode": exc.returncode, "cmd": exc.cmd}

    outcome
  exercise:
    prompt: time.sleep(2)를 호출하는 자식 프로세스를 timeout=0.5로 실행해 TimeoutExpired가 발생하고 캡처된 stdout이 비어 있는지 확인하세요.
    starterCode: |-
      import subprocess
      import sys

      try:
          subprocess.run(
              [sys.executable, "-c", "import time; time.sleep(2); print('done')"],
              capture_output=True,
              text=True,
              timeout=0.5,
          )
          outcome = "no timeout"
      except subprocess.TimeoutExpired as exc:
          outcome = {"timeoutSec": exc.timeout, "stdout": exc.stdout or ""}

      outcome
    hints:
    - TimeoutExpired는 timeout 인자 값을 .timeout에 담습니다.
    - 자식이 stdout을 쓰기 전에 죽었으므로 부분 출력은 비어 있습니다.
  check:
    type: noError
    noError: try/except 분기가 NameError나 ImportError 없이 실행되어야 합니다.
    resultCheck: CalledProcessError 분기는 returncode가 2여야 하고, timeout 분기는 stdout이 빈 문자열이어야 합니다.
- id: shell-injection
  title: shell=True의 위험성
  structuredPrimary: true
  subtitle: 리스트 인자 vs 셸 문자열
  goal: shell=True에 사용자 입력을 넘기면 명령 인젝션이 가능함을 코드로 확인하고 리스트 인자로 안전하게 호출하는 흐름을 익힙니다.
  why: shell=True는 입력을 셸이 해석하므로 외부 입력을 그대로 넘기면 임의 명령 실행 위험이 있습니다. 자동화 코드의 가장 흔한 보안 사고입니다.
  explanation: 리스트 인자로 호출하면 인자 분리를 셸이 아닌 OS가 처리합니다. 사용자 입력에 ;나 &가 들어와도 한 인자로 취급되어 안전합니다. shell=True가 꼭 필요한 경우에는 shlex.quote로 입력을 명시적으로 따옴표 처리합니다.
  tips:
  - 외부 입력을 받는 자동화 코드에서는 기본적으로 shell=False(기본)로 호출하세요.
  - shell=True가 필요하면 shlex.quote로 입력을 감싸야 합니다.
  snippet: |-
    import subprocess
    import sys

    userArg = "alpha; echo INJECTED"

    listResult = subprocess.run(
        [sys.executable, "-c", "import sys; print('user:', sys.argv[1])", userArg],
        capture_output=True,
        text=True,
    )

    {"stdout": listResult.stdout.strip(), "returncode": listResult.returncode}
  exercise:
    prompt: shell=True에 사용자 문자열을 그대로 넘기면 두 번째 명령(echo)이 실제로 실행되는 것을 검증하고, 리스트 인자 호출에서는 실행되지 않음을 비교하세요.
    starterCode: |-
      import subprocess
      import sys

      payload = "alpha; echo INJECTED"

      listResult = subprocess.run(
          [sys.executable, "-c", "import sys; print('user:', sys.argv[1])", payload],
          capture_output=True,
          text=True,
      )

      shellResult = subprocess.run(
          f'echo {payload}',
          shell=True,
          capture_output=True,
          text=True,
      )

      {
          "listStdout": listResult.stdout.strip(),
          "shellStdout": shellResult.stdout.strip(),
      }
    hints:
    - 리스트 인자에서는 ;가 인자의 일부로 처리되어 echo가 실행되지 않습니다.
    - shell=True 호출에서는 ;가 명령 구분자로 해석되어 INJECTED가 출력됩니다.
  check:
    type: noError
    noError: 두 subprocess.run 호출이 NameError나 FileNotFoundError 없이 실행되어야 합니다.
    resultCheck: listStdout에는 INJECTED가 없고 shellStdout에는 INJECTED가 포함되어 셸 해석 차이가 드러나야 합니다.
- id: popen-pipes
  title: Popen으로 stdin/stdout 파이프 다루기
  structuredPrimary: true
  subtitle: 양방향 통신과 communicate
  goal: Popen으로 자식 프로세스에 stdin을 흘려보내고 stdout을 읽어 양방향 통신 패턴을 구성합니다.
  why: subprocess.run은 단발성 호출에 최적화되어 있지만, stdin을 흘려보내거나 부분 출력을 읽어야 할 때는 Popen이 필요합니다.
  explanation: Popen(stdin=PIPE, stdout=PIPE, text=True)로 객체를 생성한 뒤 communicate(input=...)으로 입력을 보내고 출력/오류를 한 번에 받습니다. 큰 데이터에 read()/readline() 루프를 직접 돌면 데드락 위험이 있으므로 communicate 사용이 표준입니다.
  tips:
  - communicate는 자식이 끝날 때까지 기다리고 출력 전체를 메모리에 모읍니다.
  - 부분 스트리밍은 readline 루프 + 별도 스레드로 stderr을 읽는 식의 패턴이 필요합니다.
  snippet: |-
    import subprocess
    import sys

    proc = subprocess.Popen(
        [sys.executable, "-c", "import sys; data = sys.stdin.read(); print(data.upper())"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    stdout, stderr = proc.communicate(input="hello pipe\\n")

    {"stdout": stdout.strip(), "stderr": stderr.strip(), "returncode": proc.returncode}
  exercise:
    prompt: Popen에 두 줄짜리 stdin을 보내고, 자식이 readlines로 받아 각 줄을 prefix 처리한 결과를 받도록 만들어 보세요.
    starterCode: |-
      import subprocess
      import sys

      proc = subprocess.Popen(
          [sys.executable, "-c", "import sys\\nfor line in sys.stdin:\\n    print('OUT:', line.strip())"],
          stdin=subprocess.PIPE,
          stdout=subprocess.PIPE,
          stderr=subprocess.PIPE,
          text=True,
      )

      stdout, stderr = proc.communicate(input="first\\nsecond\\n")

      {
          "lines": stdout.strip().splitlines(),
          "returncode": proc.returncode,
      }
    hints:
    - communicate input의 줄바꿈은 자식이 한 줄씩 읽을 수 있게 합니다.
    - 자식의 stdout이 print로 끝나면 자동으로 줄바꿈이 추가됩니다.
  check:
    noError: Popen과 communicate 호출이 NameError나 BrokenPipeError 없이 실행되어야 합니다.
    resultCheck: lines가 [OUT - first, OUT - second]처럼 두 줄로 prefix 처리되고 returncode가 0이어야 합니다.
- id: failure-diagnosis
  title: 실패 진단 - returncode와 stderr
  structuredPrimary: true
  subtitle: 자동화 워크플로의 실패 분기
  goal: 외부 명령의 비정상 종료를 returncode와 stderr로 분기하고 호출자에게 의미 있는 메시지를 돌려주는 패턴을 만듭니다.
  why: 자동화 스크립트는 실패를 무시하면 누적된 오류가 한꺼번에 터집니다. 종료 코드와 표준 오류를 보고 호출자가 어떤 행동을 해야 할지 판단할 수 있어야 합니다.
  explanation: subprocess.run의 결과 객체는 returncode, stdout, stderr 세 필드를 노출합니다. returncode 0은 성공, 0이 아니면 셸 관례상 실패입니다. stderr에 사람이 읽을 메시지를 담고, 호출자는 종료 코드와 메시지를 묶어 보고합니다.
  tips:
  - returncode 의미는 명령마다 다릅니다. 자주 쓰는 명령은 매뉴얼을 확인해 의미를 매핑하세요.
  - stderr이 비어 있어도 returncode가 0이 아니면 실패입니다.
  snippet: |-
    import subprocess
    import sys

    def runCheck(cmd):
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return {"status": "ok", "stdout": result.stdout.strip()}
        return {
            "status": "fail",
            "returncode": result.returncode,
            "stderr": result.stderr.strip() or "(no stderr)",
        }

    successCmd = [sys.executable, "-c", "print('ok')"]
    failureCmd = [sys.executable, "-c", "import sys; print('boom', file=sys.stderr); sys.exit(3)"]

    {"success": runCheck(successCmd), "failure": runCheck(failureCmd)}
  exercise:
    prompt: runCheck를 확장해 returncode마다 매핑된 사람용 메시지(예 - 2 - 입력 오류, 3 - 외부 의존성 실패)를 돌려주도록 만들어 보세요.
    starterCode: |-
      import subprocess
      import sys

      ERROR_TABLE = {
          2: "입력 오류",
          3: "외부 의존성 실패",
      }

      def runCheck(cmd):
          result = subprocess.run(cmd, capture_output=True, text=True)
          if result.returncode == 0:
              return {"status": "ok", "stdout": result.stdout.strip()}
          return {
              "status": "fail",
              "returncode": result.returncode,
              "reason": ERROR_TABLE.get(result.returncode, "알 수 없는 실패"),
              "stderr": result.stderr.strip(),
          }

      cmdA = [sys.executable, "-c", "import sys; sys.exit(2)"]
      cmdB = [sys.executable, "-c", "import sys; sys.exit(3)"]
      cmdC = [sys.executable, "-c", "import sys; sys.exit(9)"]

      {
          "a": runCheck(cmdA),
          "b": runCheck(cmdB),
          "c": runCheck(cmdC),
      }
    hints:
    - 매핑이 없는 코드는 dict.get의 default로 처리합니다.
    - 모든 분기에 reason 필드가 채워져 호출자가 일관된 형태로 받을 수 있도록 합니다.
  check:
    type: noError
    noError: runCheck와 subprocess 호출이 NameError나 KeyError 없이 실행되어야 합니다.
    resultCheck: 결과 dict가 returncode별로 reason을 분기해 a/b는 표 매핑이 적용되고 c는 default 메시지가 들어가야 합니다.
assessment:
  masteryVariants:
  - id: 31_subprocess-run-plan-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - run-basics
    - check-and-timeout
    title: subprocess.run 호출 계획을 안전한 옵션 dict로 만들기
    subtitle: args, capture, check, timeout
    goal: executable과 Python 한 줄 코드를 받아 shell=False 리스트 인자, capture_output, text, check, timeout 설정을 반환한다.
    why: 웹 학습에서는 외부 프로세스를 직접 띄우지 않아도, 안전한 subprocess.run 호출 구조를 정확히 설계하는 능력을 검증할 수 있습니다.
    explanation: plan_subprocess_run(executable, script, timeout=5)를 완성해 실행 전 계획을 dict로 만들고, 비어 있는 명령이나 0 이하 timeout은 ValueError로
      막으세요.
    tips:
    - args는 문자열 하나가 아니라 리스트여야 합니다.
    - 자동화 기본값은 shell=False, capture_output=True, text=True, check=True입니다.
    exercise:
      prompt: plan_subprocess_run(executable, script, timeout=5)를 완성해 안전한 subprocess.run 옵션 계획을 반환하세요.
      starterCode: |-
        def plan_subprocess_run(executable, script, timeout=5):
            raise NotImplementedError
      solution: |-
        def plan_subprocess_run(executable, script, timeout=5):
            if not executable or not script.strip():
                raise ValueError("executable and script required")
            if timeout <= 0:
                raise ValueError("timeout must be positive")
            args = [executable, "-c", script]
            return {
                "args": args,
                "argCount": len(args),
                "captureOutput": True,
                "text": True,
                "check": True,
                "timeout": timeout,
                "shell": False,
            }
      hints:
      - script는 "-c" 뒤의 한 인자로 유지하세요.
      - timeout은 외부 명령이 멈췄을 때 전체 자동화가 같이 멈추지 않게 하는 안전장치입니다.
    check:
      id: python.builtins.subprocess.run-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.subprocess.empty.behavior.v1.fixture
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
        entry: plan_subprocess_run
        cases:
        - id: builds-captured-checked-run-plan
          arguments:
          - value: python
          - value: print('ok')
          - value: 3
          expectedReturn:
            args:
            - python
            - -c
            - print('ok')
            argCount: 3
            captureOutput: true
            text: true
            check: true
            timeout: 3
            shell: false
        - id: rejects-zero-timeout
          arguments:
          - value: python
          - value: print('ok')
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 31_subprocess-safe-user-arg-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - shell-injection
    - run-basics
    title: 사용자 입력을 셸 문자열이 아닌 argv 한 칸으로 보존하기
    subtitle: no shell interpolation
    goal: base_args와 사용자 입력을 받아 shell=False 호출 계획을 만들고, 셸 메타문자가 있어도 user_arg가 한 인자로 남는지 반환한다.
    why: 전이 과제에서는 subprocess 지식을 보안 감각으로 옮깁니다. 사용자 입력을 문자열로 이어 붙이지 않는 것이 핵심입니다.
    explanation: build_safe_user_command(base_args, user_arg)를 완성해 base_args 뒤에 user_arg를 한 인자로 붙이고 shell=False, userArgIndex,
      containsShellMetachar를 반환하세요.
    tips:
    - 세미콜론이나 파이프 문자가 있어도 리스트 인자에서는 명령 구분자로 해석되지 않습니다.
    - base_args가 비어 있으면 실행할 프로그램이 없으므로 ValueError로 막으세요.
    exercise:
      prompt: build_safe_user_command(base_args, user_arg)를 완성해 사용자 입력을 한 argv 칸으로 보존하는 안전 계획을 반환하세요.
      starterCode: |-
        def build_safe_user_command(base_args, user_arg):
            raise NotImplementedError
      solution: |-
        def build_safe_user_command(base_args, user_arg):
            if not isinstance(base_args, list) or not base_args:
                raise ValueError("base_args required")
            text = str(user_arg)
            args = list(base_args) + [text]
            return {
                "args": args,
                "shell": False,
                "userArgIndex": len(base_args),
                "userArgPreserved": args[len(base_args)] == text,
                "containsShellMetachar": any(char in text for char in ";&|"),
                "willInvokeShell": False,
            }
      hints:
      - user_arg를 split하지 마세요.
      - base_args를 직접 수정하지 말고 새 list를 만드세요.
    check:
      id: python.builtins.subprocess.safe-user-arg.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.subprocess.empty.behavior.v1.fixture
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
        entry: build_safe_user_command
        cases:
        - id: keeps-injection-payload-as-one-argument
          arguments:
          - value:
            - python
            - -m
            - codaro_tool
          - value: alpha; echo INJECTED
          expectedReturn:
            args:
            - python
            - -m
            - codaro_tool
            - alpha; echo INJECTED
            shell: false
            userArgIndex: 3
            userArgPreserved: true
            containsShellMetachar: true
            willInvokeShell: false
        - id: rejects-empty-base-args
          arguments:
          - value: []
          - value: anything
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 31_subprocess-returncode-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 31_subprocess-safe-user-arg-transfer
    title: CompletedProcess 결과 dict에서 성공과 실패 분기 회상하기
    subtitle: returncode, stdout, stderr
    goal: CompletedProcess 모양의 dict와 오류 표를 받아 status, reason, stdoutLines, stderr를 반환한다.
    why: 시간이 지나도 남아야 할 subprocess 감각은 returncode 0은 성공, 0이 아니면 stderr와 매핑 표로 실패 원인을 설명해야 한다는 점입니다.
    explanation: classify_process_result(result, error_table)를 완성해 returncode를 기준으로 ok/fail을 나누고 stdout/stderr를 사람이 읽을 수 있는
      dict로 정리하세요.
    tips:
    - stderr가 비어 있어도 returncode가 0이 아니면 실패입니다.
    - error_table에 없는 코드는 unknown failure로 처리하세요.
    exercise:
      prompt: classify_process_result(result, error_table)를 완성해 returncode 기반 성공/실패 요약을 반환하세요.
      starterCode: |-
        def classify_process_result(result, error_table):
            raise NotImplementedError
      solution: |-
        def classify_process_result(result, error_table):
            if "returncode" not in result:
                raise ValueError("returncode required")
            returncode = result["returncode"]
            stdout = result.get("stdout", "")
            stderr = result.get("stderr", "")
            stdout_lines = stdout.splitlines()
            if returncode == 0:
                return {
                    "status": "ok",
                    "returncode": 0,
                    "stdoutLines": stdout_lines,
                    "stderr": stderr.strip(),
                    "reason": "",
                }
            reason = error_table.get(returncode, error_table.get(str(returncode), "unknown failure"))
            return {
                "status": "fail",
                "returncode": returncode,
                "stdoutLines": stdout_lines,
                "stderr": stderr.strip() or "(no stderr)",
                "reason": reason,
            }
      hints:
      - stdout는 여러 줄 결과일 수 있으므로 splitlines()로 보존하세요.
      - 실패 분기에서는 stderr가 비었을 때도 fallback 문자열을 채우세요.
    check:
      id: python.builtins.subprocess.returncode.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.subprocess.empty.behavior.v1.fixture
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
        entry: classify_process_result
        cases:
        - id: classifies-nonzero-returncode-with-stderr
          arguments:
          - value:
              args:
              - python
              - -m
              - codaro_tool
              returncode: 3
              stdout: ''
              stderr: |
                missing dependency
          - value:
              '2': input error
              '3': external dependency failed
          expectedReturn:
            status: fail
            returncode: 3
            stdoutLines: []
            stderr: missing dependency
            reason: external dependency failed
        - id: rejects-result-without-returncode
          arguments:
          - value:
              stdout: ok
          - value: {}
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