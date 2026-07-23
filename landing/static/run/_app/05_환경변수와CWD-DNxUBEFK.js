var e=`meta:
  id: procCtl_05
  title: 환경 변수와 작업 디렉터리
  order: 5
  category: procCtl
  difficulty: easy
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - subprocess
    - env
    - cwd
intro:
  direction: subprocess.run의 env와 cwd 인자로 자식 프로세스의 환경 변수와 작업 디렉터리를 명시적으로 제어한다.
  benefits:
    - env 인자로 자식이 받을 환경 변수를 좁힌다.
    - PATH 변수 한 곳만 조정해 보조 도구를 부른다.
    - cwd 인자로 자식이 시작할 디렉터리를 지정한다.
    - 부모 환경을 오염시키지 않고 한 번만 변형해 자식에게 넘긴다.
  diagram:
    steps:
      - label: 기본 환경 복사
        detail: os.environ.copy로 부모 환경을 dict로 받아 안전하게 수정한다.
      - label: 좁힌 변수 주입
        detail: env에 필요한 키만 두거나 새 키를 추가해 자식에 전달한다.
      - label: 작업 디렉터리 지정
        detail: cwd에 tempfile 경로를 넘겨 자식의 시작 위치를 격리한다.
      - label: 종합 결과 비교
        detail: 자식이 보고한 환경과 cwd가 기대값과 일치하는지 검증한다.
    runtime:
      - label: 표준 라이브러리만
        detail: subprocess, os, tempfile만 사용한다.
      - label: assert 기반 검증
        detail: 자식의 출력과 부모의 환경을 assert로 비교한다.
sections:
  - id: copy-env
    title: 부모 환경 안전 복사
    structuredPrimary: true
    subtitle: os.environ.copy 활용
    goal: 부모 환경을 dict로 복사한 뒤 한 키만 변경해 자식에 넘긴다.
    why: os.environ을 직접 수정하면 부모 프로세스 전체에 영향이 가므로 사본 한 개에만 변경을 가하는 패턴이 안전하다.
    explanation: os.environ.copy는 부모 환경을 보통 dict로 만들어 준다. 그 dict를 수정해 subprocess.run의 env 인자로 넘기면 자식만 변형된 환경을 본다. 부모는 영향을 받지 않으므로 후속 자동화 단계가 흔들리지 않는다.
    tips:
      - env 인자가 None이면 자식은 부모 환경을 그대로 상속한다.
      - PATH 같은 핵심 키를 빼버리면 자식이 셸 명령을 찾지 못할 수 있다.
    snippet: |-
      import os
      import subprocess
      import sys

      childEnv = os.environ.copy()
      childEnv["CODARO_TAG"] = "automation"
      completed = subprocess.run(
          [sys.executable, "-c", "import os; print(os.environ.get('CODARO_TAG'))"],
          env=childEnv,
          capture_output=True,
          text=True,
      )

      assert completed.stdout.strip() == "automation"
      assert "CODARO_TAG" not in os.environ
      completed.stdout.strip()
    exercise:
      prompt: 자식에게만 LESSON_NUMBER 환경 변수를 "5"로 전달하고 부모에는 그 키가 남지 않는지 검증하세요.
      starterCode: |-
        import os
        import subprocess
        import sys

        childEnv = os.environ.___()
        childEnv["LESSON_NUMBER"] = "___"
        completed = subprocess.run(
            [sys.executable, "-c", "import os; print(os.environ.get('LESSON_NUMBER'))"],
            env=childEnv,
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "5"
        assert "LESSON_NUMBER" not in os.environ
        completed.stdout.strip()
      solution: |-
        import os
        import subprocess
        import sys

        childEnv = os.environ.copy()
        childEnv["LESSON_NUMBER"] = "5"
        completed = subprocess.run(
            [sys.executable, "-c", "import os; print(os.environ.get('LESSON_NUMBER'))"],
            env=childEnv,
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "5"
        assert "LESSON_NUMBER" not in os.environ
        completed.stdout.strip()
      hints:
        - os.environ.copy는 부모 환경을 dict로 복사해 자식 변형에만 사용한다.
        - 자식 stdout이 "5"여야 하므로 LESSON_NUMBER 값도 같은 문자열이어야 한다.
      check:
        type: noError
        noError: 자식 실행이 환경 변수와 함께 정상적으로 끝나야 한다.
        resultCheck: stdout이 "5"이고 부모 환경에는 LESSON_NUMBER 키가 없어야 한다.
    check:
      noError: env 인자로 한정된 변형이 자식에만 적용되어야 한다.
      resultCheck: stdout이 "automation"이고 부모 환경에는 CODARO_TAG 키가 남지 않아야 한다.
  - id: narrow-path
    title: 좁힌 PATH로 보조 도구 찾기
    structuredPrimary: true
    subtitle: PATHEXT 사고 회피
    goal: 자식에게 전달되는 PATH를 명시적으로 좁혀 의도한 도구만 자동화 흐름에서 사용되게 한다.
    why: 자동화 코드가 실수로 다른 위치의 동일 이름 도구를 부르는 사고를 막으려면 PATH를 좁히는 습관이 좋다.
    explanation: env dict에 PATH 키만 다시 정의하면 자식이 사용하는 검색 경로가 한정된다. shutil.which를 통해 자식 안에서 도구가 발견되는지 직접 확인할 수 있다. 운영체제에 따라 경로 구분자가 다르므로 os.pathsep을 사용한다.
    tips:
      - os.pathsep은 Linux는 콜론, Windows는 세미콜론이다.
      - shutil.which는 PATH에서 첫 번째로 발견되는 실행 파일 경로를 돌려준다.
    snippet: |-
      import os
      import subprocess
      import sys
      from pathlib import Path

      childEnv = os.environ.copy()
      childEnv["PATH"] = str(Path(sys.executable).parent)
      script = "import shutil; print('found' if shutil.which('python') or shutil.which('python.exe') else 'missing')"
      completed = subprocess.run(
          [sys.executable, "-c", script],
          env=childEnv,
          capture_output=True,
          text=True,
      )

      assert completed.stdout.strip() in {"found", "missing"}
      completed.stdout.strip()
    exercise:
      prompt: 자식 PATH를 빈 문자열로 두면 shutil.which가 외부 도구를 찾지 못해 "missing"을 출력하는지 검증하세요.
      starterCode: |-
        import os
        import subprocess
        import sys

        childEnv = os.environ.copy()
        childEnv["PATH"] = "___"
        script = "import shutil; print('found' if shutil.which('definitely-not-a-real-tool-xyz') else 'missing')"
        completed = subprocess.run(
            [sys.executable, "-c", script],
            env=childEnv,
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "missing"
        completed.stdout.strip()
      solution: |-
        import os
        import subprocess
        import sys

        childEnv = os.environ.copy()
        childEnv["PATH"] = ""
        script = "import shutil; print('found' if shutil.which('definitely-not-a-real-tool-xyz') else 'missing')"
        completed = subprocess.run(
            [sys.executable, "-c", script],
            env=childEnv,
            capture_output=True,
            text=True,
        )

        assert completed.stdout.strip() == "missing"
        completed.stdout.strip()
      hints:
        - PATH를 빈 문자열로 만들면 어떤 도구도 발견되지 않아 missing이 출력된다.
        - 도구 이름이 존재하지 않는 임의 문자열이어야 어떤 PATH에서도 찾지 못한다.
      check:
        type: noError
        noError: 자식 실행이 좁힌 PATH 안에서 끝나야 한다.
        resultCheck: stdout이 정확히 "missing"이어야 한다.
    check:
      noError: 좁힌 PATH 자식 실행이 끝나야 한다.
      resultCheck: stdout이 found 또는 missing 둘 중 하나로 출력되어 PATH 좁힘 동작을 확인해야 한다.
  - id: cwd-path
    title: 작업 디렉터리 지정
    structuredPrimary: true
    subtitle: tempfile 폴더에서 시작
    goal: 자식이 시작할 작업 디렉터리를 cwd 인자로 명시한다.
    why: 자식이 어디서 시작하느냐가 상대 경로와 출력 위치에 영향을 주므로 자동화는 항상 cwd를 의도적으로 지정해야 한다.
    explanation: subprocess.run에 cwd로 절대 경로를 넘기면 자식 안에서 Path.cwd가 그 경로를 가리킨다. 같은 셀에서 tempfile.TemporaryDirectory로 만든 절대 경로를 그대로 cwd에 넘기면 자식이 격리 폴더에서 시작한다. 부모의 작업 디렉터리는 영향을 받지 않는다.
    tips:
      - cwd 인자는 문자열 또는 Path 객체를 받는다.
      - 자식이 끝난 뒤에도 부모 작업 디렉터리는 그대로 유지된다.
    snippet: |-
      import subprocess
      import sys
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          completed = subprocess.run(
              [sys.executable, "-c", "import os; print(os.getcwd())"],
              cwd=td,
              capture_output=True,
              text=True,
          )
          reportedCwd = Path(completed.stdout.strip()).resolve()
          expectedCwd = Path(td).resolve()

      assert reportedCwd == expectedCwd
      reportedCwd.name
    exercise:
      prompt: 자식 cwd를 tempfile 폴더로 두고 print(os.getcwd()) 결과가 그 절대 경로와 같은지 검증하세요.
      starterCode: |-
        import subprocess
        import sys
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            completed = subprocess.run(
                [sys.executable, "-c", "import os; print(os.getcwd())"],
                cwd=___,
                capture_output=True,
                text=True,
            )
            reportedCwd = Path(completed.stdout.strip()).resolve()
            expectedCwd = Path(td).resolve()

        assert reportedCwd == expectedCwd
        reportedCwd.name
      solution: |-
        import subprocess
        import sys
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            completed = subprocess.run(
                [sys.executable, "-c", "import os; print(os.getcwd())"],
                cwd=td,
                capture_output=True,
                text=True,
            )
            reportedCwd = Path(completed.stdout.strip()).resolve()
            expectedCwd = Path(td).resolve()

        assert reportedCwd == expectedCwd
        reportedCwd.name
      hints:
        - cwd 인자 값은 tempfile.TemporaryDirectory가 돌려준 td 문자열을 그대로 넘긴다.
        - resolve를 양쪽에 적용하면 운영체제 별 표기 차이가 사라진다.
      check:
        type: noError
        noError: 자식 실행과 cwd 비교가 정상적으로 끝나야 한다.
        resultCheck: reportedCwd가 tempfile 절대 경로와 정확히 같아야 한다.
    check:
      noError: cwd 인자로 자식이 격리 폴더에서 시작해야 한다.
      resultCheck: reportedCwd가 tempfile 절대 경로와 정확히 같아야 한다.
  - id: env-cwd-combo
    title: env와 cwd 종합 정리
    structuredPrimary: true
    subtitle: 자식 환경 한 dict로 검증
    goal: 자식이 받은 환경 변수와 작업 디렉터리를 한 dict로 보고해 자동화 표준 출력 형태를 만든다.
    why: 종합 자동화는 자식이 시작한 위치와 변수를 같이 봐야 결과를 신뢰할 수 있으므로 두 정보를 묶어 검증한다.
    explanation: 마지막 섹션은 자식 코드가 env에서 한 키를 읽고 getcwd 결과와 함께 JSON으로 출력하도록 한다. 부모는 결과를 json.loads로 받아 dict로 비교한다. 이 패턴은 자동화 보고에 그대로 들어가는 표준 형태다.
    tips:
      - JSON 직렬화를 자식이 직접 하면 부모는 단순 파싱으로 결과를 검증한다.
      - 종합 출력은 한 줄 JSON이 가장 단순하고 안정적이다.
    snippet: |-
      import json
      import os
      import subprocess
      import sys
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          childEnv = os.environ.copy()
          childEnv["LESSON_KEY"] = "procCtl_05"
          script = (
              "import os, json, sys; "
              "json.dump({'cwd': os.getcwd(), 'key': os.environ.get('LESSON_KEY')}, sys.stdout)"
          )
          completed = subprocess.run(
              [sys.executable, "-c", script],
              cwd=td,
              env=childEnv,
              capture_output=True,
              text=True,
          )
          parsed = json.loads(completed.stdout)
          parsed["cwd"] = str(Path(parsed["cwd"]).resolve())

      assert parsed == {"cwd": str(Path(td).resolve()), "key": "procCtl_05"}
      parsed
    exercise:
      prompt: 같은 종합 흐름에서 LESSON_KEY 값을 "fileOps_10"으로 두고 결과 dict가 정확히 그 값을 담는지 검증하세요.
      starterCode: |-
        import json
        import os
        import subprocess
        import sys
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            childEnv = os.environ.copy()
            childEnv["LESSON_KEY"] = "___"
            script = (
                "import os, json, sys; "
                "json.dump({'cwd': os.getcwd(), 'key': os.environ.get('LESSON_KEY')}, sys.stdout)"
            )
            completed = subprocess.run(
                [sys.executable, "-c", script],
                cwd=td,
                env=childEnv,
                capture_output=True,
                text=True,
            )
            parsed = json.loads(completed.stdout)
            parsed["cwd"] = str(Path(parsed["cwd"]).resolve())

        assert parsed == {"cwd": str(Path(td).resolve()), "key": "fileOps_10"}
        parsed
      solution: |-
        import json
        import os
        import subprocess
        import sys
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            childEnv = os.environ.copy()
            childEnv["LESSON_KEY"] = "fileOps_10"
            script = (
                "import os, json, sys; "
                "json.dump({'cwd': os.getcwd(), 'key': os.environ.get('LESSON_KEY')}, sys.stdout)"
            )
            completed = subprocess.run(
                [sys.executable, "-c", script],
                cwd=td,
                env=childEnv,
                capture_output=True,
                text=True,
            )
            parsed = json.loads(completed.stdout)
            parsed["cwd"] = str(Path(parsed["cwd"]).resolve())

        assert parsed == {"cwd": str(Path(td).resolve()), "key": "fileOps_10"}
        parsed
      hints:
        - LESSON_KEY 값을 fileOps_10으로 두면 parsed의 key 항목과 비교가 통과한다.
        - parsed의 cwd는 자식이 보고한 절대 경로와 일치해야 한다.
      check:
        type: noError
        noError: json.loads 호출이 JSONDecodeError 없이 끝나야 한다.
        resultCheck: parsed dict가 cwd와 key 두 값을 종합 결과로 정확히 담아야 한다.
    check:
      noError: 환경과 cwd가 함께 적용된 자식 호출이 끝나야 한다.
      resultCheck: parsed가 cwd와 key 두 값을 정확히 담아 종합 결과를 검증해야 한다.
`;export{e as default};