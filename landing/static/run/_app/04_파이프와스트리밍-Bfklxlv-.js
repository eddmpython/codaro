var e=`meta:
  id: procCtl_04
  title: 파이프와 스트리밍
  order: 4
  category: procCtl
  difficulty: easy
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - subprocess
    - popen
    - streaming
intro:
  direction: subprocess.Popen으로 자식의 stdout을 줄 단위로 받으며 실시간 처리 흐름과 두 자식 간 파이프 연결을 안전하게 다룬다.
  benefits:
    - Popen 컨텍스트 매니저로 자식 자원을 명확히 닫는다.
    - stdout iter로 줄 단위 진행 상황을 받는다.
    - 두 자식 프로세스를 파이프로 연결한다.
    - 종합 결과로 모은 줄 리스트를 자동화 보고에 사용한다.
  diagram:
    steps:
      - label: Popen 컨텍스트 진입
        detail: with subprocess.Popen으로 자식 PID와 PIPE를 안전한 범위에 둔다.
      - label: 줄 단위 stdout 수집
        detail: for 루프로 stdout 이터레이터를 돌며 progress 라인을 수집한다.
      - label: 두 자식 연결
        detail: 첫 자식의 stdout을 두 번째 자식의 stdin으로 직접 연결한다.
      - label: 종합 결과 정리
        detail: 수집한 줄과 최종 returncode를 한 dict로 묶어 다음 단계가 사용한다.
    runtime:
      - label: 표준 라이브러리만
        detail: subprocess와 sys만 사용해 외부 패키지가 필요 없다.
      - label: assert 기반 검증
        detail: 줄 리스트와 returncode를 assert로 비교해 흐름이 의도대로 끝났는지 확인한다.
sections:
  - id: popen-context
    title: Popen 컨텍스트 매니저
    structuredPrimary: true
    subtitle: 자원 누수 없는 자식 실행
    goal: Popen을 with 문에 두고 자식 프로세스 자원을 자동으로 회수한다.
    why: 자동화에서 자식 프로세스 누수는 좀비 프로세스로 이어지므로 with 컨텍스트가 가장 안전한 패턴이다.
    explanation: subprocess.Popen은 컨텍스트 매니저 프로토콜을 지원해 with 블록을 빠져나갈 때 wait를 자동 호출한다. communicate 메서드는 stdout과 stderr를 끝까지 받아 결과 튜플로 돌려준다. with 블록과 communicate를 함께 쓰면 누수가 없다.
    tips:
      - Popen의 첫 인자는 subprocess.run과 동일한 리스트 형식이다.
      - communicate를 부른 뒤에는 returncode가 즉시 채워진다.
    snippet: |-
      import subprocess
      import sys

      with subprocess.Popen(
          [sys.executable, "-c", "print('start')"],
          stdout=subprocess.PIPE,
          text=True,
      ) as proc:
          stdout, _ = proc.communicate()

      assert proc.returncode == 0
      assert stdout.strip() == "start"
      stdout.strip()
    exercise:
      prompt: 자식이 "ready"를 출력하도록 두고 with 컨텍스트와 communicate로 stdout이 정확히 "ready"인지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        with subprocess.Popen(
            [sys.executable, "-c", "print('___')"],
            stdout=subprocess.___,
            text=True,
        ) as proc:
            stdout, _ = proc.communicate()

        assert proc.returncode == 0
        assert stdout.strip() == "ready"
        stdout.strip()
      solution: |-
        import subprocess
        import sys

        with subprocess.Popen(
            [sys.executable, "-c", "print('ready')"],
            stdout=subprocess.PIPE,
            text=True,
        ) as proc:
            stdout, _ = proc.communicate()

        assert proc.returncode == 0
        assert stdout.strip() == "ready"
        stdout.strip()
      hints:
        - 자식 안 print 문자열을 "ready"로 두면 비교가 통과한다.
        - stdout 인자는 subprocess.PIPE로 두어야 communicate가 결과를 받는다.
      check:
        noError: Popen 컨텍스트와 communicate가 끝나야 한다.
        resultCheck: stdout이 정확히 "ready"여야 한다.
    check:
      noError: with 컨텍스트 진입과 종료가 모두 정상적으로 끝나야 한다.
      resultCheck: stdout이 "start"이고 returncode가 0이어야 한다.
  - id: stream-lines
    title: 줄 단위 진행 상황 수집
    structuredPrimary: true
    subtitle: stdout 이터레이터 사용
    goal: 자식이 한 줄씩 출력하는 진행 상황을 실시간으로 받아 리스트에 모은다.
    why: 자동화 작업에서 큰 명령은 결과 전체가 아니라 진행 상황을 즉시 볼 수 있어야 사용자가 흐름을 신뢰한다.
    explanation: Popen 객체의 stdout 속성은 PIPE일 때 이터레이터로 한 줄씩 받을 수 있다. flush=True를 자식 print에 넣어야 부모가 즉시 받는다. for 루프 안에서 strip하면 깔끔한 문자열 리스트가 만들어진다.
    tips:
      - flush=True를 빠뜨리면 자식 종료 시점까지 출력이 부모로 가지 않는다.
      - text=True를 켜야 줄 단위 결과가 문자열로 도착한다.
    snippet: |-
      import subprocess
      import sys

      script = (
          "import time, sys\\n"
          "for step in range(3):\\n"
          "    print(f'step {step}', flush=True)\\n"
      )
      collected = []
      with subprocess.Popen(
          [sys.executable, "-c", script],
          stdout=subprocess.PIPE,
          text=True,
      ) as proc:
          for line in proc.stdout:
              collected.append(line.strip())

      assert collected == ["step 0", "step 1", "step 2"]
      collected
    exercise:
      prompt: 자식이 0부터 4까지 print하는 동안 progress 리스트에 다섯 줄이 정확히 모이는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        script = (
            "import sys\\n"
            "for step in range(___):\\n"
            "    print(f'tick {step}', flush=True)\\n"
        )
        progress = []
        with subprocess.Popen(
            [sys.executable, "-c", script],
            stdout=subprocess.PIPE,
            text=True,
        ) as proc:
            for line in proc.stdout:
                progress.append(line.strip())

        assert progress == ["tick 0", "tick 1", "tick 2", "tick 3", "tick 4"]
        progress
      solution: |-
        import subprocess
        import sys

        script = (
            "import sys\\n"
            "for step in range(5):\\n"
            "    print(f'tick {step}', flush=True)\\n"
        )
        progress = []
        with subprocess.Popen(
            [sys.executable, "-c", script],
            stdout=subprocess.PIPE,
            text=True,
        ) as proc:
            for line in proc.stdout:
                progress.append(line.strip())

        assert progress == ["tick 0", "tick 1", "tick 2", "tick 3", "tick 4"]
        progress
      hints:
        - range(5)이면 0부터 4까지 다섯 번 반복한다.
        - flush=True를 print에 넣어야 각 줄이 즉시 부모에게 도착한다.
      check:
        noError: Popen 줄 반복이 OSError 없이 끝나야 한다.
        resultCheck: progress 리스트가 다섯 줄을 정확히 담아야 한다.
    check:
      noError: 진행 상황 수집이 자식 종료까지 이어져야 한다.
      resultCheck: collected가 "step 0", "step 1", "step 2" 세 줄을 정확히 담아야 한다.
  - id: pipe-two-processes
    title: 두 자식을 파이프로 연결
    structuredPrimary: true
    subtitle: stdout을 stdin으로
    goal: 첫 자식의 stdout을 두 번째 자식의 stdin으로 직접 흘려 보낸다.
    why: 자동화에서 두 명령을 합쳐 한 줄 흐름으로 만드는 패턴은 셸 없이도 안전하게 구현할 수 있다.
    explanation: 첫 Popen에서 stdout=subprocess.PIPE를 두면 객체의 stdout 속성이 파일 핸들이 된다. 두 번째 Popen의 stdin 인자에 그 핸들을 넘기면 자식들 사이에 OS 파이프가 만들어진다. 첫 자식의 stdout을 close해야 두 번째 자식이 EOF를 인식하고 종료한다.
    tips:
      - 첫 자식 stdout을 닫지 않으면 두 번째 자식이 EOF 신호를 받지 못해 멈출 수 있다.
      - shell=True 없이도 파이프 동작이 가능하므로 안전하다.
    snippet: |-
      import subprocess
      import sys

      with subprocess.Popen(
          [sys.executable, "-c", "import sys; sys.stdout.write('hello\\\\nworld\\\\n')"],
          stdout=subprocess.PIPE,
          text=True,
      ) as first:
          with subprocess.Popen(
              [sys.executable, "-c", "import sys; print(sum(1 for _ in sys.stdin))"],
              stdin=first.stdout,
              stdout=subprocess.PIPE,
              text=True,
          ) as second:
              first.stdout.close()
              lineCount = second.communicate()[0].strip()

      assert lineCount == "2"
      lineCount
    exercise:
      prompt: 첫 자식이 세 줄을 출력하면 두 번째 자식이 받은 줄 수가 3으로 보고되는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        with subprocess.Popen(
            [sys.executable, "-c", "import sys; sys.stdout.write('___\\\\n___\\\\n___\\\\n')"],
            stdout=subprocess.PIPE,
            text=True,
        ) as first:
            with subprocess.Popen(
                [sys.executable, "-c", "import sys; print(sum(1 for _ in sys.stdin))"],
                stdin=first.stdout,
                stdout=subprocess.PIPE,
                text=True,
            ) as second:
                first.stdout.close()
                lineCount = second.communicate()[0].strip()

        assert lineCount == "3"
        lineCount
      solution: |-
        import subprocess
        import sys

        with subprocess.Popen(
            [sys.executable, "-c", "import sys; sys.stdout.write('one\\\\ntwo\\\\nthree\\\\n')"],
            stdout=subprocess.PIPE,
            text=True,
        ) as first:
            with subprocess.Popen(
                [sys.executable, "-c", "import sys; print(sum(1 for _ in sys.stdin))"],
                stdin=first.stdout,
                stdout=subprocess.PIPE,
                text=True,
            ) as second:
                first.stdout.close()
                lineCount = second.communicate()[0].strip()

        assert lineCount == "3"
        lineCount
      hints:
        - 첫 자식이 출력할 줄 수가 세 개여야 lineCount가 3이 된다.
        - 첫 자식 stdout을 close해야 두 번째 자식이 EOF를 받아 종료한다.
      check:
        noError: 두 Popen 컨텍스트 모두 정상적으로 진입과 종료를 완료해야 한다.
        resultCheck: lineCount 문자열이 "3"이어야 한다.
    check:
      noError: 파이프 연결과 communicate가 끝나야 한다.
      resultCheck: lineCount가 "2"여서 두 줄이 정확히 흘러갔음을 확인해야 한다.
  - id: streaming-summary
    title: 스트리밍 결과 종합 정리
    structuredPrimary: true
    subtitle: 진행 줄과 returncode를 한 dict로
    goal: 줄 단위 진행 정보와 returncode를 한 dict로 묶어 자동화 보고의 표준 항목을 만든다.
    why: 자동화 다음 단계는 진행 상황 줄과 종료 상태를 함께 보고 결정해야 하므로 두 정보를 한 객체로 묶는 패턴이 표준이다.
    explanation: 마지막 섹션은 Popen을 함수 안에 감추고 결과 dict를 만들어 돌려준다. progress 키에 줄 리스트, returncode 키에 종료 상태를 둔다. wait 호출로 returncode가 채워진다. 같은 dict 형태가 다음 자동화 단계의 표준 입력이 된다.
    tips:
      - progress 키는 항상 리스트로 두어 빈 결과에서도 KeyError가 없다.
      - returncode 키는 None이면 종료 전 호출 사고로 판단할 수 있다.
    snippet: |-
      import subprocess
      import sys


      def runStreaming(script: str) -> dict:
          progress = []
          with subprocess.Popen(
              [sys.executable, "-c", script],
              stdout=subprocess.PIPE,
              text=True,
          ) as proc:
              for line in proc.stdout:
                  progress.append(line.strip())
              proc.wait()
          return {"progress": progress, "returncode": proc.returncode}


      summary = runStreaming(
          "import sys\\n"
          "for step in ('plan', 'run', 'verify'):\\n"
          "    print(step, flush=True)\\n"
      )

      assert summary == {"progress": ["plan", "run", "verify"], "returncode": 0}
      summary
    exercise:
      prompt: runStreaming에 두 줄을 출력하는 자식을 넘기고 progress와 returncode가 종합 결과로 돌아오는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys


        def runStreaming(script: str) -> dict:
            progress = []
            with subprocess.Popen(
                [sys.executable, "-c", script],
                stdout=subprocess.PIPE,
                text=True,
            ) as proc:
                for line in proc.stdout:
                    progress.append(line.strip())
                proc.___()
            return {"progress": progress, "returncode": proc.returncode}


        summary = runStreaming(
            "import sys\\n"
            "for line in ('alpha', 'beta'):\\n"
            "    print(line, flush=True)\\n"
        )

        assert summary == {"progress": ["alpha", "beta"], "returncode": 0}
        summary
      solution: |-
        import subprocess
        import sys


        def runStreaming(script: str) -> dict:
            progress = []
            with subprocess.Popen(
                [sys.executable, "-c", script],
                stdout=subprocess.PIPE,
                text=True,
            ) as proc:
                for line in proc.stdout:
                    progress.append(line.strip())
                proc.wait()
            return {"progress": progress, "returncode": proc.returncode}


        summary = runStreaming(
            "import sys\\n"
            "for line in ('alpha', 'beta'):\\n"
            "    print(line, flush=True)\\n"
        )

        assert summary == {"progress": ["alpha", "beta"], "returncode": 0}
        summary
      hints:
        - wait 메서드를 호출해야 returncode가 채워진다.
        - 두 줄이 모두 progress 리스트에 같은 순서로 들어가야 한다.
      check:
        noError: runStreaming 함수와 자식 실행이 종합 정리 흐름으로 끝나야 한다.
        resultCheck: summary 딕셔너리의 progress 리스트가 두 줄, returncode는 0이어야 한다.
    check:
      noError: 종합 정리 함수 호출과 dict 반환이 한 흐름에서 끝나야 한다.
      resultCheck: summary가 progress와 returncode 두 키를 모두 갖고 자동화 표준 형태와 일치해야 한다.
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
  - id: procCtl_04-stream-line-framing-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - popen-context
    - streaming-summary
    title: stream chunk를 줄 단위 record로 안전하게 조립하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: chunk 경계에 걸린 UTF-8 text를 buffer에 보존하고 완성 줄만 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - read chunk 하나를 log line 하나로 가정하지 마세요.
    - 마지막 newline이 없는 remainder를 성공 line처럼 확정하지 마세요.
    exercise:
      prompt: frame_stream_lines(chunks)를 완성하세요.
      starterCode: |-
        def frame_stream_lines(chunks):
            raise NotImplementedError
      solution: |
        def frame_stream_lines(chunks):
            buffer = ""
            lines = []
            for chunk in chunks:
                buffer += chunk
                parts = buffer.split("\\n")
                lines.extend(parts[:-1])
                buffer = parts[-1]
            return {"lines": lines, "remainder": buffer, "lineCount": len(lines)}
      hints: *id001
    check:
      id: python.procctl.procCtl_04.stream-line-framing.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_04.stream-line-framing.mastery.behavior.v1.fixture
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
        entry: frame_stream_lines
        cases:
        - id: joins-split-lines
          arguments:
          - value:
            - hel
            - 'lo

              wor'
            - 'ld

              '
          expectedReturn:
            lines:
            - hello
            - world
            remainder: ''
            lineCount: 2
        - id: keeps-final-remainder
          arguments:
          - value:
            - 'a

              b'
          expectedReturn:
            lines:
            - a
            remainder: b
            lineCount: 1
        - id: handles-empty-chunks
          arguments:
          - value: []
          expectedReturn:
            lines: []
            remainder: ''
            lineCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: procCtl_04-stream-backpressure-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_04-stream-line-framing-mastery
    title: 새 process stream에 buffer 제한 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: producer·consumer rate와 최대 buffer로 pause·drop 금지 정책을 판정한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - stdout가 빠르다는 이유로 줄을 버리지 말고 producer를 제어하세요.
    - 현재 buffer와 다음 interval 성장량을 함께 계산하세요.
    exercise:
      prompt: plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer)를 완성하세요.
      starterCode: |-
        def plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer):
            raise NotImplementedError
      solution: |
        def plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer):
            if min(producer_rate, consumer_rate, current_buffer, maximum_buffer) < 0 or maximum_buffer == 0:
                raise ValueError("invalid stream rates")
            growth = max(0, producer_rate - consumer_rate)
            projected = current_buffer + growth
            if projected > maximum_buffer:
                action = "pause-producer"
            elif projected > maximum_buffer * 0.8:
                action = "drain-priority"
            else:
                action = "continue"
            return {"action": action, "projectedBuffer": projected, "growth": growth, "dropAllowed": False}
      hints: *id002
    check:
      id: python.procctl.procCtl_04.stream-backpressure-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_04.stream-backpressure-plan.transfer.behavior.v1.fixture
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
        entry: plan_stream_backpressure
        cases:
        - id: continues-balanced-stream
          arguments:
          - value: 10
          - value: 10
          - value: 20
          - value: 100
          expectedReturn:
            action: continue
            projectedBuffer: 20
            growth: 0
            dropAllowed: false
        - id: prioritizes-near-limit-drain
          arguments:
          - value: 20
          - value: 10
          - value: 75
          - value: 100
          expectedReturn:
            action: drain-priority
            projectedBuffer: 85
            growth: 10
            dropAllowed: false
        - id: pauses-over-limit-producer
          arguments:
          - value: 50
          - value: 10
          - value: 80
          - value: 100
          expectedReturn:
            action: pause-producer
            projectedBuffer: 120
            growth: 40
            dropAllowed: false
        - id: rejects-zero-buffer
          arguments:
          - value: 1
          - value: 1
          - value: 0
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: procCtl_04-streaming-process-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_04-stream-backpressure-plan-transfer
    title: process streaming 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: chunk framing·stderr 분리·backpressure 증거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - process 실행 성공과 업무 결과물 성공을 같은 것으로 처리하지 마세요.
    - 명령 identity·제한 시간·산출물 evidence·남는 risk를 함께 기록하세요.
    exercise:
      prompt: choose_streaming_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_streaming_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_streaming_policy(situation):
            table = {'framing': {'action': 'buffer until newline', 'evidence': 'complete lines and remainder', 'risk': 'split record'}, 'channels': {'action': 'tag stdout and stderr separately', 'evidence': 'channel timestamp sequence', 'risk': 'lost ordering'}, 'pressure': {'action': 'bound buffer and pause producer', 'evidence': 'rates and buffer size', 'risk': 'silent drop'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.procctl.procCtl_04.streaming-process-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_04.streaming-process-recall.retrieval.behavior.v1.fixture
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
        entry: choose_streaming_policy
        cases:
        - id: recalls-framing
          arguments:
          - value: framing
          expectedReturn:
            action: buffer until newline
            evidence: complete lines and remainder
            risk: split record
        - id: recalls-channels
          arguments:
          - value: channels
          expectedReturn:
            action: tag stdout and stderr separately
            evidence: channel timestamp sequence
            risk: lost ordering
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};