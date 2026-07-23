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
`;export{e as default};