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
  - id: procCtl_08-resource-window-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - system-cpu
    - observation-bundle
    title: 시스템 자원 임계 초과의 지속시간 판정하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 순간 spike가 아니라 연속 sample 수로 CPU·memory 경보를 결정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 한 번의 높은 sample을 지속 장애로 선언하지 마세요.
    - threshold와 연속 sample 수를 alert evidence에 함께 남기세요.
    exercise:
      prompt: audit_resource_windows(samples, thresholds, minimum_consecutive)를 완성하세요.
      starterCode: |-
        def audit_resource_windows(samples, thresholds, minimum_consecutive):
            raise NotImplementedError
      solution: |
        def audit_resource_windows(samples, thresholds, minimum_consecutive):
            if minimum_consecutive <= 0:
                raise ValueError("minimum consecutive must be positive")
            alerts = []
            for metric, threshold in sorted(thresholds.items()):
                streak = 0
                maximum_streak = 0
                for sample in samples:
                    streak = streak + 1 if sample.get(metric, 0) > threshold else 0
                    maximum_streak = max(maximum_streak, streak)
                if maximum_streak >= minimum_consecutive:
                    alerts.append({"metric": metric, "maximumStreak": maximum_streak, "threshold": threshold})
            return {"healthy": not alerts, "alerts": alerts, "sampleCount": len(samples)}
      hints: *id001
    check:
      id: python.procctl.procCtl_08.resource-window-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_08.resource-window-audit.mastery.behavior.v1.fixture
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
        entry: audit_resource_windows
        cases:
        - id: ignores-single-spike
          arguments:
          - value:
            - cpu: 90
            - cpu: 10
          - value:
              cpu: 80
          - value: 2
          expectedReturn:
            healthy: true
            alerts: []
            sampleCount: 2
        - id: alerts-sustained-cpu
          arguments:
          - value:
            - cpu: 90
            - cpu: 91
            - cpu: 20
          - value:
              cpu: 80
          - value: 2
          expectedReturn:
            healthy: false
            alerts:
            - metric: cpu
              maximumStreak: 2
              threshold: 80
            sampleCount: 3
        - id: orders-multiple-metric-alerts
          arguments:
          - value:
            - memory: 95
              cpu: 90
            - memory: 96
              cpu: 91
          - value:
              memory: 90
              cpu: 80
          - value: 2
          expectedReturn:
            healthy: false
            alerts:
            - metric: cpu
              maximumStreak: 2
              threshold: 80
            - metric: memory
              maximumStreak: 2
              threshold: 90
            sampleCount: 2
        - id: rejects-zero-window
          arguments:
          - value: []
          - value: {}
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: procCtl_08-resource-baseline-comparison-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_08-resource-window-audit-mastery
    title: 새 실행의 자원 사용량을 baseline과 비교하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 절대 한계와 baseline 대비 증가율을 함께 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - baseline 대비 증가만으로 절대 자원 한계를 무시하지 마세요.
    - baseline 0에서는 무한 증가율을 만들지 말고 growth를 미정으로 두세요.
    exercise:
      prompt: compare_resource_baseline(current, baseline, absolute_limits, growth_limits)를 완성하세요.
      starterCode: |-
        def compare_resource_baseline(current, baseline, absolute_limits, growth_limits):
            raise NotImplementedError
      solution: |
        def compare_resource_baseline(current, baseline, absolute_limits, growth_limits):
            failures = []
            details = []
            for metric in sorted(current):
                value = current[metric]
                base = baseline.get(metric, 0)
                growth = None if base == 0 else round((value - base) / base, 4)
                reasons = []
                if metric in absolute_limits and value > absolute_limits[metric]:
                    reasons.append("absolute")
                if growth is not None and metric in growth_limits and growth > growth_limits[metric]:
                    reasons.append("growth")
                if reasons:
                    failures.append(metric)
                details.append({"metric": metric, "value": value, "baseline": base, "growth": growth, "reasons": reasons})
            return {"accepted": not failures, "failedMetrics": failures, "details": details}
      hints: *id002
    check:
      id: python.procctl.procCtl_08.resource-baseline-comparison.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_08.resource-baseline-comparison.transfer.behavior.v1.fixture
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
        entry: compare_resource_baseline
        cases:
        - id: accepts-within-limits
          arguments:
          - value:
              memory: 110
          - value:
              memory: 100
          - value:
              memory: 200
          - value:
              memory: 0.2
          expectedReturn:
            accepted: true
            failedMetrics: []
            details:
            - metric: memory
              value: 110
              baseline: 100
              growth: 0.1
              reasons: []
        - id: reports-absolute-and-growth
          arguments:
          - value:
              memory: 250
          - value:
              memory: 100
          - value:
              memory: 200
          - value:
              memory: 1.0
          expectedReturn:
            accepted: false
            failedMetrics:
            - memory
            details:
            - metric: memory
              value: 250
              baseline: 100
              growth: 1.5
              reasons:
              - absolute
              - growth
        - id: handles-zero-baseline
          arguments:
          - value:
              cpu: 10
          - value:
              cpu: 0
          - value:
              cpu: 50
          - value:
              cpu: 0.1
          expectedReturn:
            accepted: true
            failedMetrics: []
            details:
            - metric: cpu
              value: 10
              baseline: 0
              growth: null
              reasons: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: procCtl_08-resource-monitoring-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_08-resource-baseline-comparison-transfer
    title: 시스템 자원 모니터링 근거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 순간값·지속 구간·baseline 회귀를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - process 실행 성공과 업무 결과물 성공을 같은 것으로 처리하지 마세요.
    - 명령 identity·제한 시간·산출물 evidence·남는 risk를 함께 기록하세요.
    exercise:
      prompt: choose_resource_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_resource_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_resource_evidence(situation):
            table = {'sample': {'action': 'record timestamped metric', 'evidence': 'raw bounded sample', 'risk': 'single spike'}, 'alert': {'action': 'require consecutive threshold breach', 'evidence': 'maximum streak', 'risk': 'alert noise'}, 'regression': {'action': 'compare absolute and baseline limits', 'evidence': 'value growth reasons', 'risk': 'moving baseline'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.procctl.procCtl_08.resource-monitoring-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_08.resource-monitoring-recall.retrieval.behavior.v1.fixture
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
        entry: choose_resource_evidence
        cases:
        - id: recalls-sample
          arguments:
          - value: sample
          expectedReturn:
            action: record timestamped metric
            evidence: raw bounded sample
            risk: single spike
        - id: recalls-alert
          arguments:
          - value: alert
          expectedReturn:
            action: require consecutive threshold breach
            evidence: maximum streak
            risk: alert noise
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};