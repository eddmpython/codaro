var e=`meta:
  id: procCtl_08
  title: 시스템 자원 모니터링
  order: 8
  category: procCtl
  difficulty: easy
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages:
    - psutil
  tags:
    - psutil
    - cpu
    - memory
intro:
  direction: psutil로 CPU와 메모리 사용량을 측정하고 임계값을 넘는 자식 프로세스를 식별해 자동화 관찰 흐름을 완성한다.
  benefits:
    - psutil.cpu_percent와 virtual_memory로 시스템 상태를 한 줄에 본다.
    - 프로세스별 cpu_percent로 자원 사용 상위 프로세스를 찾는다.
    - 임계값을 넘는 자식만 골라 경보 후보로 분류한다.
    - 종합 관찰 보고서를 자동화 표준 dict로 정리한다.
  diagram:
    steps:
      - label: 시스템 CPU 측정
        detail: psutil.cpu_percent에 interval 인자를 주어 정밀한 측정을 한다.
      - label: 가상 메모리 보기
        detail: virtual_memory().percent로 메모리 사용률을 백분율로 받는다.
      - label: 자식 자원 비교
        detail: 자식 프로세스 객체에서 cpu_percent와 memory_info를 읽어 임계값과 비교한다.
      - label: 종합 관찰 dict
        detail: 시스템 측정값과 자식 분류 결과를 한 dict로 묶어 자동화 보고 표준을 만든다.
    runtime:
      - label: psutil 패키지 필요
        detail: meta.packages의 psutil이 로컬 가상환경에 준비되어야 한다.
      - label: assert 기반 검증
        detail: 측정값의 범위와 임계값 분류 결과를 assert로 비교한다.
sections:
  - id: system-cpu
    title: 시스템 CPU 사용률
    structuredPrimary: true
    subtitle: psutil.cpu_percent
    goal: psutil.cpu_percent로 짧은 인터벌의 CPU 사용률을 백분율로 받는다.
    why: 자동화 흐름이 시스템에 과부하를 주지 않는지 확인하려면 CPU 사용률을 측정 단위로 두는 것이 단순하다.
    explanation: cpu_percent는 interval 인자를 받아 그 시간만큼 측정하고 백분율을 돌려준다. 첫 호출에서 인자가 None이면 의미 있는 측정이 아닐 수 있어 0.1초 같은 작은 인터벌을 주면 안전하다. 값 범위는 0과 100 사이 부동소수다.
    tips:
      - interval=0.1은 짧은 측정이지만 자동화 모니터링에는 충분하다.
      - 여러 코어의 평균값이 돌아오며 100을 넘지 않는다.
    snippet: |-
      import psutil

      sample = psutil.cpu_percent(interval=0.1)

      assert 0.0 <= sample <= 100.0
      sample
    exercise:
      prompt: cpu_percent에 interval 0.05초를 주어 측정값이 0에서 100 사이에 있는지 검증하세요.
      starterCode: |-
        import psutil

        sample = psutil.cpu_percent(interval=___)

        assert 0.0 <= sample <= 100.0
        sample
      solution: |-
        import psutil

        sample = psutil.cpu_percent(interval=0.05)

        assert 0.0 <= sample <= 100.0
        sample
      hints:
        - interval 인자는 부동소수 초를 받는다.
        - 측정 결과는 백분율이므로 100을 넘지 않는다.
      check:
        noError: cpu_percent 호출이 OSError 없이 끝나야 한다.
        resultCheck: sample 값이 0 이상 100 이하 범위에 있어야 한다.
    check:
      noError: cpu_percent 호출이 정상적으로 끝나야 한다.
      resultCheck: sample 값이 0 이상 100 이하 부동소수여야 한다.
  - id: virtual-memory
    title: 가상 메모리 사용률
    structuredPrimary: true
    subtitle: virtual_memory().percent
    goal: 시스템 가상 메모리 사용률을 백분율로 받는다.
    why: 메모리 부족은 자동화 흐름의 단일 가장 큰 실패 원인 중 하나이므로 시작 시점에 측정해 두면 빠른 경보가 가능하다.
    explanation: psutil.virtual_memory는 NamedTuple을 돌려준다. percent 필드는 0과 100 사이 부동소수다. total과 used 필드로 바이트 단위 절대값도 알 수 있다. percent만 사용해도 임계값 분기에는 충분하다.
    tips:
      - percent는 사용 가능한 메모리 기준으로 계산되므로 캐시 회수 가능 영역이 반영된다.
      - 큰 자동화 작업 전에 측정해 80% 이상이면 작업을 미루는 흐름이 일반적이다.
    snippet: |-
      import psutil

      memory = psutil.virtual_memory()
      summary = {
          "percent": memory.percent,
          "withinRange": 0.0 <= memory.percent <= 100.0,
      }

      assert summary["withinRange"] is True
      summary
    exercise:
      prompt: virtual_memory percent 값을 dict로 받아 0과 100 사이에 있는지 검증하세요.
      starterCode: |-
        import psutil

        memory = psutil.___()
        summary = {
            "percent": memory.percent,
            "withinRange": 0.0 <= memory.percent <= 100.0,
        }

        assert summary["withinRange"] is True
        summary
      solution: |-
        import psutil

        memory = psutil.virtual_memory()
        summary = {
            "percent": memory.percent,
            "withinRange": 0.0 <= memory.percent <= 100.0,
        }

        assert summary["withinRange"] is True
        summary
      hints:
        - 함수 이름은 virtual_memory이며 인자가 없다.
        - 결과 객체의 percent 속성이 백분율이다.
      check:
        noError: virtual_memory 호출이 OSError 없이 끝나야 한다.
        resultCheck: summary["withinRange"]가 True여야 한다.
    check:
      noError: virtual_memory 호출과 dict 구성이 끝나야 한다.
      resultCheck: summary의 withinRange가 True여서 백분율이 정상 범위에 있어야 한다.
  - id: child-resource
    title: 자식 자원 측정과 임계값
    structuredPrimary: true
    subtitle: 메모리 사용량 비교
    goal: 자식 프로세스의 메모리 사용량이 임계값을 넘는지 직접 측정한다.
    why: 자동화는 자식 한 개가 메모리를 폭주시키는 경우를 빨리 잡아야 전체 시스템이 보호된다.
    explanation: psutil.Process.memory_info는 RSS와 VMS 같은 메모리 정보를 NamedTuple로 돌려준다. RSS는 실제로 사용 중인 물리 메모리 크기다. 자식 PID를 받아 자식이 시작한 직후 RSS를 측정하고 임계값과 비교한다.
    tips:
      - RSS 단위는 바이트이므로 1024로 나누면 KB가 된다.
      - 자식이 너무 빨리 종료되면 NoSuchProcess가 발생할 수 있어 짧게 sleep을 둔다.
    snippet: |-
      import subprocess
      import sys

      import psutil

      with subprocess.Popen(
          [sys.executable, "-c", "import time; time.sleep(0.2)"],
          stdout=subprocess.PIPE,
          text=True,
      ) as child:
          info = psutil.Process(child.pid).memory_info()
          status = "high" if info.rss > 500 * 1024 * 1024 else "ok"
          child.wait()

      assert status == "ok"
      assert info.rss > 0
      status
    exercise:
      prompt: 자식 RSS가 1GB 미만이면 status가 "ok"로 분류되는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        import psutil

        with subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(0.2)"],
            stdout=subprocess.PIPE,
            text=True,
        ) as child:
            info = psutil.Process(child.pid).memory_info()
            status = "high" if info.rss > ___ * 1024 * 1024 else "ok"
            child.wait()

        assert status == "ok"
        assert info.rss > 0
        status
      solution: |-
        import subprocess
        import sys

        import psutil

        with subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(0.2)"],
            stdout=subprocess.PIPE,
            text=True,
        ) as child:
            info = psutil.Process(child.pid).memory_info()
            status = "high" if info.rss > 1024 * 1024 * 1024 else "ok"
            child.wait()

        assert status == "ok"
        assert info.rss > 0
        status
      hints:
        - 1GB는 1024 * 1024 * 1024 바이트다.
        - 짧은 sleep 명령은 메모리를 크게 사용하지 않으므로 ok로 분류된다.
      check:
        noError: psutil.Process 호출과 memory_info 접근이 끝나야 한다.
        resultCheck: status가 ok이고 RSS가 0보다 커야 한다.
    check:
      noError: 자식 메모리 측정과 임계값 분기가 끝나야 한다.
      resultCheck: status가 ok로 분류되고 RSS가 0 초과여야 한다.
  - id: observation-bundle
    title: 종합 자원 관찰 보고
    structuredPrimary: true
    subtitle: 시스템과 자식을 한 dict로
    goal: 시스템 CPU, 메모리, 자식 자원을 한 dict로 묶어 자동화 관찰 보고의 표준 형태를 만든다.
    why: 운영 화면은 시스템 상태와 자식 상태를 동시에 봐야 의미가 있으므로 두 측면을 한 함수에서 묶는다.
    explanation: collectObservation 함수는 자식 PID를 받아 시스템 측정과 자식 측정을 한 번에 수행한다. system 키에 cpu와 memory 백분율, child 키에 RSS와 status를 둔다. 결과 dict는 자동화 보고 화면에 그대로 들어갈 수 있다.
    tips:
      - 측정은 항상 짧은 interval로 묶어 한 번에 끝낸다.
      - status 키 값은 ok와 high 두 가지로 두어 비교가 단순하다.
    snippet: |-
      import subprocess
      import sys

      import psutil


      def collectObservation(pid: int, rssLimit: int) -> dict:
          info = psutil.Process(pid).memory_info()
          return {
              "system": {
                  "cpu": psutil.cpu_percent(interval=0.05),
                  "memory": psutil.virtual_memory().percent,
              },
              "child": {
                  "rss": info.rss,
                  "status": "high" if info.rss > rssLimit else "ok",
              },
          }


      with subprocess.Popen(
          [sys.executable, "-c", "import time; time.sleep(0.2)"],
          stdout=subprocess.PIPE,
          text=True,
      ) as child:
          observation = collectObservation(child.pid, 1024 * 1024 * 1024)
          child.wait()

      assert observation["child"]["status"] == "ok"
      assert 0.0 <= observation["system"]["cpu"] <= 100.0
      assert observation["child"]["rss"] > 0
      observation["child"]["status"]
    exercise:
      prompt: collectObservation을 호출해 system과 child 키를 모두 가진 종합 dict가 만들어지고 cpu가 0~100 범위인지 검증하세요.
      starterCode: |-
        import subprocess
        import sys

        import psutil


        def collectObservation(pid: int, rssLimit: int) -> dict:
            info = psutil.Process(pid).memory_info()
            return {
                "system": {
                    "cpu": psutil.cpu_percent(interval=0.05),
                    "memory": psutil.virtual_memory().percent,
                },
                "child": {
                    "rss": info.___,
                    "status": "high" if info.rss > rssLimit else "ok",
                },
            }


        with subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(0.2)"],
            stdout=subprocess.PIPE,
            text=True,
        ) as child:
            observation = collectObservation(child.pid, 1024 * 1024 * 1024)
            child.wait()

        assert "system" in observation and "child" in observation
        assert 0.0 <= observation["system"]["cpu"] <= 100.0
        observation["child"]["status"]
      solution: |-
        import subprocess
        import sys

        import psutil


        def collectObservation(pid: int, rssLimit: int) -> dict:
            info = psutil.Process(pid).memory_info()
            return {
                "system": {
                    "cpu": psutil.cpu_percent(interval=0.05),
                    "memory": psutil.virtual_memory().percent,
                },
                "child": {
                    "rss": info.rss,
                    "status": "high" if info.rss > rssLimit else "ok",
                },
            }


        with subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(0.2)"],
            stdout=subprocess.PIPE,
            text=True,
        ) as child:
            observation = collectObservation(child.pid, 1024 * 1024 * 1024)
            child.wait()

        assert "system" in observation and "child" in observation
        assert 0.0 <= observation["system"]["cpu"] <= 100.0
        observation["child"]["status"]
      hints:
        - memory_info 객체의 RSS 속성은 rss다.
        - 결과 dict의 두 최상위 키는 system과 child다.
      check:
        noError: collectObservation 호출이 종합 정리 흐름으로 끝나야 한다.
        resultCheck: observation의 system과 child 키가 자동화 표준 dict의 형태를 가져야 한다.
    check:
      noError: 종합 관찰 함수 호출과 자식 wait가 끝나야 한다.
      resultCheck: observation의 system cpu가 정상 범위, child rss가 0 초과, status가 ok로 종합 결과가 완성되어야 한다.
`;export{e as default};