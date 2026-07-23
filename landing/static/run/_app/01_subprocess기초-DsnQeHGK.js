var e=`meta:
  id: procCtl_01
  title: subprocess 기초
  order: 1
  category: procCtl
  difficulty: easy
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - subprocess
    - run
    - stdout
intro:
  direction: subprocess.run으로 Python 자체를 자식 프로세스로 실행하면서 returncode와 stdout, stderr를 안전하게 캡처한다.
  benefits:
    - subprocess.run의 가장 단순한 호출 형태를 익힌다.
    - returncode로 실행 성공과 실패를 구분한다.
    - stdout과 stderr를 텍스트로 캡처한다.
    - check=True 옵션으로 실패를 좁힌 예외로 받아 처리한다.
  diagram:
    steps:
      - label: Python 자식 실행
        detail: sys.executable과 -c 인자로 같은 인터프리터를 다시 호출한다.
      - label: stdout 캡처
        detail: capture_output=True와 text=True로 결과를 문자열로 받는다.
      - label: returncode 판정
        detail: 정상 종료는 0, 실패는 양의 정수임을 직접 확인한다.
      - label: 안전한 예외 변환
        detail: check=True를 켜면 실패가 CalledProcessError로 좁혀진다.
    runtime:
      - label: 표준 라이브러리만
        detail: subprocess와 sys만 사용해 외부 패키지가 필요 없다.
      - label: assert 기반 검증
        detail: returncode, stdout, exception type을 assert로 비교한다.
sections:
  - id: simple-run
    title: 가장 단순한 subprocess.run
    structuredPrimary: true
    subtitle: returncode와 stdout 받기
    goal: 같은 Python으로 한 줄을 실행하고 결과 문자열을 받아 본다.
    why: 모든 자동화는 외부 명령 한 번을 안전하게 호출하는 데서 시작하므로 가장 단순한 호출 형태를 확실히 익혀야 한다.
    explanation: subprocess.run은 인자 리스트와 옵션을 받고 CompletedProcess 객체를 돌려준다. capture_output=True는 stdout과 stderr를 PIPE로 받아 결과 객체에 저장한다. text=True는 바이트가 아닌 문자열로 결과를 받게 한다.
    tips:
      - sys.executable을 쓰면 현재 가상환경의 Python을 정확히 다시 호출할 수 있다.
      - 인자는 리스트로 넘기는 편이 셸 인용 사고를 피한다.
    snippet: |-
      import subprocess
      import sys

      completed = subprocess.run(
          [sys.executable, "-c", "print('hi codaro')"],
          capture_output=True,
          text=True,
      )

      assert completed.returncode == 0
      assert completed.stdout.strip() == "hi codaro"
      completed.stdout.strip()
    exercise:
      prompt: 'print(1 + 2) 한 줄을 자식 Python으로 실행해 stdout이 "3"으로 캡처되는지 검증하세요.'
      starterCode: |-
        import subprocess
        import sys

        completed = subprocess.run(
            [sys.executable, "-c", "___"],
            capture_output=___,
            text=True,
        )

        assert completed.returncode == 0
        assert completed.stdout.strip() == "3"
        completed.stdout.strip()
      solution: |-
        import subprocess
        import sys

        completed = subprocess.run(
            [sys.executable, "-c", "print(1 + 2)"],
            capture_output=True,
            text=True,
        )

        assert completed.returncode == 0
        assert completed.stdout.strip() == "3"
        completed.stdout.strip()
      hints:
        - 자식 명령 안에 print(1 + 2) 한 줄만 들어가면 된다.
        - capture_output 인자는 True여야 stdout이 결과 객체에 담긴다.
      check:
        type: noError
        noError: subprocess.run 호출이 FileNotFoundError 없이 끝나야 한다.
        resultCheck: completed.stdout.strip 결과가 "3"과 동일해야 한다.
    check:
      noError: 자식 프로세스 실행과 결과 받기가 차례로 끝나야 한다.
      resultCheck: completed.stdout.strip 결과가 "hi codaro"와 같아야 한다.
  - id: returncode-meaning
    title: returncode로 성공과 실패 구분
    structuredPrimary: true
    subtitle: 0과 비-0의 차이
    goal: 정상 종료와 실패 종료가 각각 어떤 returncode를 갖는지 직접 확인한다.
    why: 자동화 흐름은 returncode를 기준으로 다음 단계를 결정하므로 성공과 실패의 코드 차이를 손으로 확인하면 흐름 설계가 단단해진다.
    explanation: Python의 sys.exit는 정수를 받아 그 값을 부모 프로세스의 returncode로 돌려준다. 0은 성공, 1 이상은 실패다. sys.exit 호출은 자식 안에서 SystemExit 예외를 일으키지만 subprocess.run은 이것을 returncode로 변환해 부모에 전달한다.
    tips:
      - sys.exit를 부르지 않으면 자식이 정상 종료해 자동으로 0이 반환된다.
      - 음수 returncode는 시그널로 종료된 경우이므로 별도 처리해야 한다.
    snippet: |-
      import subprocess
      import sys

      okResult = subprocess.run([sys.executable, "-c", "import sys; sys.exit(0)"])
      failResult = subprocess.run([sys.executable, "-c", "import sys; sys.exit(2)"])

      assert okResult.returncode == 0
      assert failResult.returncode == 2
      [okResult.returncode, failResult.returncode]
    exercise:
      prompt: sys.exit(7)을 호출하는 자식을 실행해 returncode가 정확히 7이 되는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        completed = subprocess.run([sys.executable, "-c", "import sys; sys.exit(___)"])

        assert completed.returncode == 7
        completed.returncode
      solution: |-
        import subprocess
        import sys

        completed = subprocess.run([sys.executable, "-c", "import sys; sys.exit(7)"])

        assert completed.returncode == 7
        completed.returncode
      hints:
        - sys.exit 인자에 7을 그대로 넣으면 자식의 종료 코드도 7이 된다.
        - subprocess.run은 비-0 returncode에서도 예외를 일으키지 않는다.
      check:
        type: noError
        noError: subprocess.run 두 번 호출이 자원 누수 없이 끝나야 한다.
        resultCheck: returncode가 정확히 7이어야 한다.
    check:
      noError: 두 자식 프로세스 호출이 모두 완료되어야 한다.
      resultCheck: okResult.returncode는 0이고 failResult.returncode는 2여야 한다.
  - id: stderr-capture
    title: stderr 별도 캡처
    structuredPrimary: true
    subtitle: stdout과 분리해 읽기
    goal: 자식의 stderr 출력을 stdout과 분리해 같은 결과 객체에서 읽는다.
    why: 자동화 로그에서 정상 메시지와 오류 메시지를 분리해 두면 사고 분석이 훨씬 빨라진다.
    explanation: capture_output=True는 stdout과 stderr를 같이 받는다. CompletedProcess 객체의 stdout과 stderr 속성에 각각 들어간다. text=True가 켜져 있으면 두 결과 모두 문자열이 된다.
    tips:
      - stderr=subprocess.STDOUT을 주면 두 스트림을 한 곳으로 합칠 수도 있다.
      - print는 기본적으로 stdout으로 나가지만 file=sys.stderr 인자를 주면 stderr로 보낼 수 있다.
    snippet: |-
      import subprocess
      import sys

      completed = subprocess.run(
          [sys.executable, "-c", "import sys; print('out'); print('err', file=sys.stderr)"],
          capture_output=True,
          text=True,
      )

      assert completed.stdout.strip() == "out"
      assert completed.stderr.strip() == "err"
      {"stdout": completed.stdout.strip(), "stderr": completed.stderr.strip()}
    exercise:
      prompt: 자식이 stdout에 "ok"를 stderr에 "warn"을 출력하도록 만들고 두 값이 각자 다른 속성에 캡처되는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        completed = subprocess.run(
            [sys.executable, "-c", "import sys; print('___'); print('warn', file=sys.___)"],
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "ok"
        assert completed.stderr.strip() == "warn"
        {"stdout": completed.stdout.strip(), "stderr": completed.stderr.strip()}
      solution: |-
        import subprocess
        import sys

        completed = subprocess.run(
            [sys.executable, "-c", "import sys; print('ok'); print('warn', file=sys.stderr)"],
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "ok"
        assert completed.stderr.strip() == "warn"
        {"stdout": completed.stdout.strip(), "stderr": completed.stderr.strip()}
      hints:
        - 첫 print에는 "ok" 문자열을 넣어야 한다.
        - stderr 출력은 file=sys.stderr 인자를 명시해야 한다.
      check:
        type: noError
        noError: subprocess.run 호출이 OSError 없이 끝나야 한다.
        resultCheck: stdout과 stderr가 본문 기대값과 정확히 같아야 한다.
    check:
      noError: stdout과 stderr 두 스트림이 모두 캡처되어야 한다.
      resultCheck: 두 속성이 본문에서 출력한 "out"과 "err" 문자열을 각각 담아야 한다.
  - id: check-true-pattern
    title: check=True 종합 정리
    structuredPrimary: true
    subtitle: 실패를 좁힌 예외로 변환
    goal: 실패 returncode를 자동화 흐름에서 CalledProcessError로 잡아 안전한 분기를 만든다.
    why: 자동화에서 명시적 예외는 returncode 분기보다 코드를 읽기 좋게 만들고 try/except로 처리 책임을 명확히 한다.
    explanation: subprocess.run에 check=True를 주면 returncode가 0이 아닐 때 CalledProcessError가 발생한다. 예외 객체에는 returncode, cmd, stdout, stderr가 모두 들어 있어 로그 작성에 충분한 정보를 준다. try/except로 잡으면 자동화 흐름이 끊기지 않는다.
    tips:
      - check=True는 sys.exit 비-0뿐 아니라 자식 자체가 비정상 종료한 경우에도 발동한다.
      - except 절은 CalledProcessError로 좁혀 다른 예외를 숨기지 않게 한다.
    snippet: |-
      import subprocess
      import sys

      attempts = []
      try:
          subprocess.run([sys.executable, "-c", "import sys; sys.exit(5)"], check=True)
      except subprocess.CalledProcessError as exc:
          attempts.append({"returncode": exc.returncode, "cmd": exc.cmd[-1]})

      assert attempts == [{"returncode": 5, "cmd": "import sys; sys.exit(5)"}]
      attempts
    exercise:
      prompt: 자식이 sys.exit(11)을 호출했을 때 CalledProcessError로 returncode 11이 잡히는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        attempts = []
        try:
            subprocess.run([sys.executable, "-c", "import sys; sys.exit(___)"], check=True)
        except subprocess.CalledProcessError as exc:
            attempts.append({"returncode": exc.___, "cmd": exc.cmd[-1]})

        assert attempts == [{"returncode": 11, "cmd": "import sys; sys.exit(11)"}]
        attempts
      solution: |-
        import subprocess
        import sys

        attempts = []
        try:
            subprocess.run([sys.executable, "-c", "import sys; sys.exit(11)"], check=True)
        except subprocess.CalledProcessError as exc:
            attempts.append({"returncode": exc.returncode, "cmd": exc.cmd[-1]})

        assert attempts == [{"returncode": 11, "cmd": "import sys; sys.exit(11)"}]
        attempts
      hints:
        - sys.exit 인자의 숫자와 attempts 안 returncode를 일치시켜야 한다.
        - CalledProcessError 객체는 returncode 속성을 가진다.
      check:
        type: noError
        noError: CalledProcessError 좁힌 예외 처리 흐름이 끝나야 한다.
        resultCheck: attempts가 returncode 11과 자식 명령 문자열을 모두 담은 dict 한 개를 가져야 한다.
    check:
      noError: try/except 블록이 종합 정리 흐름을 정상적으로 처리해야 한다.
      resultCheck: attempts가 단 한 개의 dict로 returncode 5와 cmd 문자열을 정확히 담아야 한다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: procCtl_01-subprocess-result-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - simple-run
    - check-true-pattern
    title: subprocess 결과의 return code·출력·산출물 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 프로세스 종료와 기대 산출물 생성을 분리해 성공 여부를 결정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - return code 0만으로 report 생성 성공을 선언하지 마세요.
    - stderr 허용은 도구별 계약으로 명시하고 기본값은 실패로 두세요.
    exercise:
      prompt: audit_process_result(result, expected_artifacts)를 완성하세요.
      starterCode: |-
        def audit_process_result(result, expected_artifacts):
            raise NotImplementedError
      solution: |
        def audit_process_result(result, expected_artifacts):
            failures = []
            if result.get("returnCode") != 0:
                failures.append("return-code")
            produced = set(result.get("artifacts", []))
            missing = sorted(set(expected_artifacts) - produced)
            if missing:
                failures.append("artifacts")
            if result.get("stderr", "").strip() and not result.get("stderrAllowed", False):
                failures.append("stderr")
            return {"passed": not failures, "failures": failures, "missingArtifacts": missing, "stdoutLines": len(result.get("stdout", "").splitlines())}
      hints: *id001
    check:
      id: python.procctl.procCtl_01.subprocess-result-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_01.subprocess-result-audit.mastery.behavior.v1.fixture
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
        entry: audit_process_result
        cases:
        - id: accepts-zero-with-artifact
          arguments:
          - value:
              returnCode: 0
              stdout: 'done

                '
              stderr: ''
              artifacts:
              - report.json
          - value:
            - report.json
          expectedReturn:
            passed: true
            failures: []
            missingArtifacts: []
            stdoutLines: 1
        - id: reports-code-and-artifact
          arguments:
          - value:
              returnCode: 2
              stdout: ''
              stderr: failed
              artifacts: []
          - value:
            - report.json
          expectedReturn:
            passed: false
            failures:
            - return-code
            - artifacts
            - stderr
            missingArtifacts:
            - report.json
            stdoutLines: 0
        - id: allows-documented-stderr
          arguments:
          - value:
              returnCode: 0
              stdout: ok
              stderr: warning
              stderrAllowed: true
              artifacts: []
          - value: []
          expectedReturn:
            passed: true
            failures: []
            missingArtifacts: []
            stdoutLines: 1
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: procCtl_01-command-capability-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_01-subprocess-result-audit-mastery
    title: 새 외부 명령에 capability 제한 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 필요한 filesystem·network·process 권한을 allowlist와 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 외부 명령 전체를 신뢰하지 말고 필요한 capability만 요청하게 하세요.
    - 요청과 허용의 차이를 실행 전에 denied 목록으로 보여주세요.
    exercise:
      prompt: plan_command_capabilities(requested, allowed)를 완성하세요.
      starterCode: |-
        def plan_command_capabilities(requested, allowed):
            raise NotImplementedError
      solution: |
        def plan_command_capabilities(requested, allowed):
            requested_set = set(requested)
            allowed_set = set(allowed)
            denied = sorted(requested_set - allowed_set)
            granted = sorted(requested_set & allowed_set)
            return {"ready": not denied, "granted": granted, "denied": denied, "sandbox": "restricted" if granted else "no-capabilities"}
      hints: *id002
    check:
      id: python.procctl.procCtl_01.command-capability-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_01.command-capability-plan.transfer.behavior.v1.fixture
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
        entry: plan_command_capabilities
        cases:
        - id: grants-allowed-filesystem-read
          arguments:
          - value:
            - filesystem-read
          - value:
            - filesystem-read
            - network
          expectedReturn:
            ready: true
            granted:
            - filesystem-read
            denied: []
            sandbox: restricted
        - id: denies-unlisted-process-spawn
          arguments:
          - value:
            - filesystem-read
            - process-spawn
          - value:
            - filesystem-read
          expectedReturn:
            ready: false
            granted:
            - filesystem-read
            denied:
            - process-spawn
            sandbox: restricted
        - id: handles-no-capabilities
          arguments:
          - value: []
          - value:
            - network
          expectedReturn:
            ready: true
            granted: []
            denied: []
            sandbox: no-capabilities
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: procCtl_01-subprocess-foundation-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_01-command-capability-plan-transfer
    title: subprocess 실행 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 프로세스·출력·artifact 성공 근거를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - process 실행 성공과 업무 결과물 성공을 같은 것으로 처리하지 마세요.
    - 명령 identity·제한 시간·산출물 evidence·남는 risk를 함께 기록하세요.
    exercise:
      prompt: choose_subprocess_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_subprocess_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_subprocess_evidence(situation):
            table = {'process': {'action': 'capture return code', 'evidence': 'exit identity and duration', 'risk': 'zero without outcome'}, 'output': {'action': 'capture bounded stdout stderr', 'evidence': 'decoded streams', 'risk': 'secret leakage'}, 'artifact': {'action': 'verify expected paths and hashes', 'evidence': 'artifact descriptors', 'risk': 'stale file'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.procctl.procCtl_01.subprocess-foundation-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_01.subprocess-foundation-recall.retrieval.behavior.v1.fixture
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
        entry: choose_subprocess_evidence
        cases:
        - id: recalls-process
          arguments:
          - value: process
          expectedReturn:
            action: capture return code
            evidence: exit identity and duration
            risk: zero without outcome
        - id: recalls-output
          arguments:
          - value: output
          expectedReturn:
            action: capture bounded stdout stderr
            evidence: decoded streams
            risk: secret leakage
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};