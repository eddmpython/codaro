var e=`meta:\r
  id: watchSched_05\r
  title: schedule 라이브러리 기본\r
  order: 5\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages:\r
    - schedule\r
  tags:\r
    - schedule\r
    - jobs\r
    - interval\r
intro:\r
  direction: schedule 라이브러리로 인터벌과 시간 기반 작업을 정의하고 run_pending으로 셀에서 직접 실행 흐름을 확인한다.\r
  benefits:\r
    - schedule.every로 인터벌 작업을 등록한다.\r
    - run_pending과 run_all로 셀에서 즉시 실행한다.\r
    - 작업 단위 함수에서 결과 리스트를 누적한다.\r
    - 종합 결과 dict로 실행 횟수와 마지막 실행 시각을 보고한다.\r
  diagram:\r
    steps:\r
      - label: 작업 함수 정의\r
        detail: 결과 리스트에 값을 추가하는 작은 작업을 정의한다.\r
      - label: 인터벌 등록\r
        detail: schedule.every().seconds.do(job)으로 등록한다.\r
      - label: run_pending과 run_all\r
        detail: 셀에서 직접 작업을 실행해 누적 결과를 확인한다.\r
      - label: 종합 결과 정리\r
        detail: 누적 횟수와 결과 리스트를 dict로 묶어 자동화 보고에 사용한다.\r
    runtime:\r
      - label: schedule 패키지 필요\r
        detail: Web 강검증은 저장소에 고정한 schedule 1.2.2 wheel의 SHA-256을 확인하고, Local은 meta.packages를 uv 환경에 준비한다.\r
      - label: 자동 행동 검증\r
        detail: Run 뒤 별도 확인 없이 함수 반환값과 scheduler 정리 상태를 fresh Worker에서 검사한다.\r
sections:\r
  - id: job-skeleton\r
    title: 작업 함수 정의\r
    structuredPrimary: true\r
    subtitle: 결과 리스트에 누적\r
    goal: 호출될 때마다 결과 리스트에 카운터를 추가하는 단순 작업 함수를 만든다.\r
    why: 스케줄러 학습은 작업 함수가 단순할 때 실행 흐름을 가장 명확히 보여 준다.\r
    explanation: '작업 함수는 인자 없이 호출되며 외부 상태(예: results 리스트)에 부수효과를 남기는 단순 형태다. 함수 자체는 import schedule과 무관하게 정의되고, 등록은 별도 단계에서 한다. 함수가 결과 리스트에 append만 하므로 동작 검증이 쉽다.'\r
    tips:\r
      - 외부 리스트는 함수 호출 사이에 상태를 유지한다.\r
      - 작업 결과는 가능한 한 dict로 두어 다음 단계에서 의미를 가진다.\r
    snippet: |-\r
      def build_job_results(call_count: int) -> list[int]:\r
          results: list[int] = []\r
\r
          def run_job() -> None:\r
              results.append(len(results) + 1)\r
\r
          for _ in range(call_count):\r
              run_job()\r
          return results\r
    exercise:\r
      prompt: call_count만큼 작업 함수를 호출해 1부터 시작하는 누적 결과를 반환하는 build_job_results 함수를 완성하세요. 검증기는 서로 다른 호출 횟수로 자동 실행합니다.\r
      starterCode: |-\r
        def build_job_results(call_count: int) -> list[int]:\r
            results: list[int] = []\r
\r
            def run_job() -> None:\r
                results.append(len(results) + ___)\r
\r
            for _ in range(call_count):\r
                run_job()\r
            return results\r
      solution: |-\r
        def build_job_results(call_count: int) -> list[int]:\r
            results: list[int] = []\r
\r
            def run_job() -> None:\r
                results.append(len(results) + 1)\r
\r
            for _ in range(call_count):\r
                run_job()\r
            return results\r
      hints:\r
        - 카운터는 현재 리스트 길이에 1을 더한 값으로 계산된다.\r
        - 세 번 호출은 [1, 2, 3]을 만든다.\r
    check:\r
      id: python.schedule.build-job-results.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.schedule.build-job-results.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        entry: build_job_results\r
        cases:\r
          - id: one-call\r
            arguments:\r
              - value: 1\r
            expectedReturn:\r
              - 1\r
          - id: three-calls\r
            arguments:\r
              - value: 3\r
            expectedReturn:\r
              - 1\r
              - 2\r
              - 3\r
        expectedPaths: []\r
  - id: schedule-register\r
    title: schedule.every 등록\r
    structuredPrimary: true\r
    subtitle: 인터벌 작업 만들기\r
    goal: schedule.every().seconds.do로 작업을 등록하고 schedule.jobs 리스트가 한 개의 Job을 가진다는 것을 확인한다.\r
    why: 자동화는 작업 등록과 실행을 분리해야 같은 함수를 다른 주기로 등록하기 쉬워진다.\r
    explanation: schedule.every()는 Job 객체를 만들고 seconds, minutes, hours 같은 속성과 do(callable)로 등록을 마친다. schedule.jobs는 등록된 모든 Job 리스트다. clear()로 등록을 모두 비우면 다음 셀에 영향을 주지 않는다.\r
    tips:\r
      - schedule.clear는 모든 등록을 비우므로 셀 시작 시 호출하면 안전하다.\r
      - Job 객체의 interval 속성은 인자로 받은 정수를 그대로 보여 준다.\r
    snippet: |-\r
      import schedule\r
\r
      def registered_intervals(intervals: list[int]) -> list[int]:\r
          schedule.clear()\r
          for interval in intervals:\r
              schedule.every(interval).seconds.do(lambda: None)\r
          registered = [job.interval for job in schedule.jobs]\r
          schedule.clear()\r
          return registered\r
    exercise:\r
      prompt: 전달받은 각 interval을 seconds Job으로 등록하고 실제 Job.interval 목록을 반환한 뒤 scheduler를 비우는 registered_intervals 함수를 완성하세요.\r
      starterCode: |-\r
        import schedule\r
\r
        def registered_intervals(intervals: list[int]) -> list[int]:\r
            schedule.clear()\r
            for interval in intervals:\r
                schedule.every(___).seconds.do(lambda: None)\r
            registered = [job.interval for job in schedule.jobs]\r
            schedule.clear()\r
            return registered\r
      solution: |-\r
        import schedule\r
\r
        def registered_intervals(intervals: list[int]) -> list[int]:\r
            schedule.clear()\r
            for interval in intervals:\r
                schedule.every(interval).seconds.do(lambda: None)\r
            registered = [job.interval for job in schedule.jobs]\r
            schedule.clear()\r
            return registered\r
      hints:\r
        - schedule.every에 5를 두 번 넘기면 두 Job이 만들어진다.\r
        - schedule.clear는 다음 검사를 위해 마지막에 호출해 셀 상태를 정리한다.\r
    check:\r
      id: python.schedule.registered-intervals.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.schedule.registered-intervals.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      packageAssets:\r
        - name: schedule\r
          version: 1.2.2\r
          url: check-packages/schedule-1.2.2-py3-none-any.whl\r
          integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        entry: registered_intervals\r
        cases:\r
          - id: two-different-intervals\r
            arguments:\r
              - value:\r
                  - 2\r
                  - 5\r
            expectedReturn:\r
              - 2\r
              - 5\r
          - id: one-transfer-interval\r
            arguments:\r
              - value:\r
                  - 3\r
            expectedReturn:\r
              - 3\r
        expectedPaths: []\r
  - id: run-now\r
    title: 셀에서 즉시 실행\r
    structuredPrimary: true\r
    subtitle: schedule.run_all\r
    goal: 등록된 모든 작업을 셀에서 즉시 실행해 누적 결과를 확인한다.\r
    why: 자동화 학습 환경은 보통 백그라운드 루프를 돌리지 않으므로 run_all로 동작을 즉시 검증한다.\r
    explanation: schedule.run_all은 등록된 모든 Job을 즉시 호출한다. 인자로 delay_seconds를 주면 작업 사이에 대기를 두지만 학습에서는 0이 기본이다. 동일 작업을 여러 번 등록하면 같은 횟수만큼 호출된다.\r
    tips:\r
      - run_all은 즉시 모든 등록 작업을 실행하므로 학습 검증에 편리하다.\r
      - 실제 운영에서는 schedule.run_pending을 루프 안에서 호출한다.\r
    snippet: |-\r
      import schedule\r
\r
      def run_registered_jobs(count: int) -> list[int]:\r
          schedule.clear()\r
          results: list[int] = []\r
\r
          def run_job() -> None:\r
              results.append(len(results) + 1)\r
\r
          for _ in range(count):\r
              schedule.every(1).seconds.do(run_job)\r
          schedule.run_all()\r
          schedule.clear()\r
          return results\r
    exercise:\r
      prompt: count만큼 같은 작업을 등록하고 run_all로 즉시 실행한 뒤 누적 결과를 반환하고 scheduler를 비우는 run_registered_jobs 함수를 완성하세요.\r
      starterCode: |-\r
        import schedule\r
\r
        def run_registered_jobs(count: int) -> list[int]:\r
            schedule.clear()\r
            results: list[int] = []\r
\r
            def run_job() -> None:\r
                results.append(len(results) + 1)\r
\r
            for _ in range(count):\r
                schedule.every(1).seconds.do(run_job)\r
            schedule.___()\r
            schedule.clear()\r
            return results\r
      solution: |-\r
        import schedule\r
\r
        def run_registered_jobs(count: int) -> list[int]:\r
            schedule.clear()\r
            results: list[int] = []\r
\r
            def run_job() -> None:\r
                results.append(len(results) + 1)\r
\r
            for _ in range(count):\r
                schedule.every(1).seconds.do(run_job)\r
            schedule.run_all()\r
            schedule.clear()\r
            return results\r
      hints:\r
        - 모든 작업을 즉시 실행하는 함수 이름은 run_all이다.\r
        - 등록 세 번이면 카운터가 1부터 3까지 차례로 늘어난다.\r
    check:\r
      id: python.schedule.run-registered-jobs.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.schedule.run-registered-jobs.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      packageAssets:\r
        - name: schedule\r
          version: 1.2.2\r
          url: check-packages/schedule-1.2.2-py3-none-any.whl\r
          integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        entry: run_registered_jobs\r
        cases:\r
          - id: one-job\r
            arguments:\r
              - value: 1\r
            expectedReturn:\r
              - 1\r
          - id: three-jobs\r
            arguments:\r
              - value: 3\r
            expectedReturn:\r
              - 1\r
              - 2\r
              - 3\r
        expectedPaths: []\r
  - id: tick-summary\r
    title: 종합 실행 결과 정리\r
    structuredPrimary: true\r
    subtitle: 횟수와 마지막 값 보고\r
    goal: 셀에서 일정 횟수만큼 작업을 호출한 뒤 종합 결과 dict로 통계를 정리한다.\r
    why: 종합 보고는 다음 자동화 단계가 같은 dict 구조를 신뢰할 수 있도록 표준 형태로 둔다.\r
    explanation: 마지막 섹션은 작업 함수와 등록을 함수에 묶어 호출 횟수와 결과 리스트를 dict로 돌려준다. 같은 함수는 두 번 호출해도 같은 dict 형태를 유지한다. 자동화에서는 이 dict가 대시보드 입력이 된다.\r
    tips:\r
      - dict 키 이름은 count와 lastValue처럼 짧게 두어 자동화 코드가 단순해진다.\r
      - schedule.clear는 함수 시작 시 호출해 외부 상태가 새 사이클에 영향을 주지 않게 한다.\r
    snippet: |-\r
      import schedule\r
\r
      def run_cycle(count: int) -> dict:\r
          schedule.clear()\r
          results: list[int] = []\r
\r
          def job() -> None:\r
              results.append(len(results) + 1)\r
\r
          for _ in range(count):\r
              schedule.every(1).seconds.do(job)\r
          schedule.run_all()\r
          schedule.clear()\r
          return {\r
              "count": count,\r
              "lastValue": results[-1] if results else None,\r
              "all": results,\r
              "remainingJobs": len(schedule.jobs),\r
          }\r
    exercise:\r
      prompt: count만큼 작업을 등록·실행하고 count, lastValue, all, remainingJobs를 반환하는 run_cycle 함수를 완성하세요. count가 0인 경우도 자동 검증됩니다.\r
      starterCode: |-\r
        import schedule\r
\r
        def run_cycle(count: int) -> dict:\r
            schedule.clear()\r
            results: list[int] = []\r
\r
            def job() -> None:\r
                results.append(len(results) + 1)\r
\r
            for _ in range(count):\r
                schedule.every(1).seconds.do(job)\r
            schedule.run_all()\r
            schedule.clear()\r
            return {\r
                "count": count,\r
                "lastValue": results[-___] if results else None,\r
                "all": results,\r
                "remainingJobs": len(schedule.jobs),\r
            }\r
      solution: |-\r
        import schedule\r
\r
        def run_cycle(count: int) -> dict:\r
            schedule.clear()\r
            results: list[int] = []\r
\r
            def job() -> None:\r
                results.append(len(results) + 1)\r
\r
            for _ in range(count):\r
                schedule.every(1).seconds.do(job)\r
            schedule.run_all()\r
            schedule.clear()\r
            return {\r
                "count": count,\r
                "lastValue": results[-1] if results else None,\r
                "all": results,\r
                "remainingJobs": len(schedule.jobs),\r
            }\r
      hints:\r
        - 마지막 항목은 results 리스트의 -1 인덱스다.\r
        - 카운트 5이면 all 리스트가 1부터 5까지 다섯 정수를 담는다.\r
    check:\r
      id: python.schedule.run-cycle.behavior.v1\r
      version: 1\r
      kind: behavior\r
      strength: strong\r
      executor: browser-worker\r
      timeoutMs: 8000\r
      fixtureId: python.schedule.run-cycle.fixture.v1\r
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
      packageAssets:\r
        - name: schedule\r
          version: 1.2.2\r
          url: check-packages/schedule-1.2.2-py3-none-any.whl\r
          integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=\r
      fixture:\r
        directories: []\r
        env:\r
          LANG: C.UTF-8\r
          TZ: UTC\r
        files: []\r
        stdin: []\r
      payload:\r
        entry: run_cycle\r
        cases:\r
          - id: empty-cycle\r
            arguments:\r
              - value: 0\r
            expectedReturn:\r
              count: 0\r
              lastValue: null\r
              all: []\r
              remainingJobs: 0\r
          - id: five-job-cycle\r
            arguments:\r
              - value: 5\r
            expectedReturn:\r
              count: 5\r
              lastValue: 5\r
              all:\r
                - 1\r
                - 2\r
                - 3\r
                - 4\r
                - 5\r
              remainingJobs: 0\r
        expectedPaths: []\r
assessment:\r
  masteryVariants:\r
    - id: schedule-tagged-jobs-mastery\r
      mode: mastery\r
      unseen: false\r
      sourceSectionIds:\r
        - schedule-register\r
        - tick-summary\r
      title: 주기와 tag가 있는 작업 등록하기\r
      subtitle: 예시 없이 등록 상태와 정리까지 완성\r
      goal: 서로 다른 초 간격 작업에 공통 tag를 붙이고 실제 Job 정보를 보고한 뒤 scheduler를 비운다.\r
      why: 운영 자동화는 작업을 등록하는 것만큼 어떤 묶음인지 식별하고 다음 실행에 상태를 남기지 않는 것이 중요하다.\r
      explanation: interval과 tag를 바꾼 두 case가 같은 함수를 호출하고 반환값과 남은 Job 수를 함께 검사한다.\r
      tips:\r
        - do 뒤에 tag(tag_name)를 이어 호출할 수 있습니다.\r
        - 보고에 필요한 값을 읽은 뒤 clear하고 remaining 값을 계산하세요.\r
      exercise:\r
        prompt: register_tagged_jobs(intervals, tag_name)이 각 seconds Job을 등록하고 interval·tags 보고와 remaining 0을 반환하도록 완성하세요.\r
        starterCode: |-\r
          import schedule\r
\r
          def register_tagged_jobs(intervals, tag_name):\r
              raise NotImplementedError\r
        solution: |-\r
          import schedule\r
\r
          def register_tagged_jobs(intervals, tag_name):\r
              schedule.clear()\r
              for interval in intervals:\r
                  schedule.every(interval).seconds.do(lambda: None).tag(tag_name)\r
              jobs = [\r
                  {"interval": job.interval, "tags": sorted(job.tags)}\r
                  for job in schedule.jobs\r
              ]\r
              schedule.clear()\r
              return {"jobs": jobs, "remaining": len(schedule.jobs)}\r
        hints:\r
          - 등록된 Job 객체마다 interval과 tags를 읽어 dict로 만드세요.\r
          - 반환 전에 schedule.clear()를 호출하고 남은 길이를 다시 확인하세요.\r
      check:\r
        id: python.schedule.register-tagged-jobs.mastery.behavior.v1\r
        version: 1\r
        kind: behavior\r
        strength: strong\r
        executor: browser-worker\r
        timeoutMs: 8000\r
        fixtureId: python.schedule.register-tagged-jobs.mastery.fixture.v1\r
        fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
        fixture:\r
          directories: []\r
          env:\r
            LANG: C.UTF-8\r
            TZ: UTC\r
          files: []\r
          stdin: []\r
        packageAssets:\r
          - name: schedule\r
            version: 1.2.2\r
            url: check-packages/schedule-1.2.2-py3-none-any.whl\r
            integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=
        payload:\r
          entry: register_tagged_jobs\r
          cases:\r
            - id: report-jobs\r
              arguments:\r
                - value:\r
                    - 2\r
                    - 5\r
                - value: report\r
              expectedReturn:\r
                jobs:\r
                  - interval: 2\r
                    tags:\r
                      - report\r
                  - interval: 5\r
                    tags:\r
                      - report\r
                remaining: 0\r
            - id: cleanup-job\r
              arguments:\r
                - value:\r
                    - 1\r
                - value: cleanup\r
              expectedReturn:\r
                jobs:\r
                  - interval: 1\r
                    tags:\r
                      - cleanup\r
                remaining: 0\r
          expectedPaths: []\r
          normalizeReturnPaths: []\r
  transferVariants:\r
    - id: schedule-named-batch-transfer\r
      mode: transfer\r
      unseen: true\r
      sourceSectionIds:\r
        - schedule-tagged-jobs-mastery\r
        - run-now\r
      title: 낯선 작업 이름 묶음을 즉시 실행하기\r
      subtitle: 등록과 실행을 업무 batch에 적용\r
      goal: 입력받은 작업 이름을 각각 등록하고 run_all로 순서대로 실행한 뒤 상태를 정리한다.\r
      why: 간격 숫자 예제를 외우는 대신 실제 작업 식별자를 scheduler callback 인자로 넘겨야 재사용 가능한 batch가 된다.\r
      explanation: 길이와 이름이 다른 두 batch를 fresh 실행해 입력 순서, 실행 수, cleanup을 함께 검사한다.\r
      tips:\r
        - do(record, name)처럼 callback 인자를 등록 시점에 넘기세요.\r
        - run_all 뒤 clear를 호출하고 executed 목록과 remainingJobs를 반환하세요.\r
      exercise:\r
        prompt: run_named_batch(names)가 각 이름을 Job으로 등록·즉시 실행하고 executed, count, remainingJobs를 반환하도록 완성하세요.\r
        starterCode: |-\r
          import schedule\r
\r
          def run_named_batch(names):\r
              raise NotImplementedError\r
        solution: |-\r
          import schedule\r
\r
          def run_named_batch(names):\r
              schedule.clear()\r
              executed = []\r
\r
              def record(name):\r
                  executed.append(name)\r
\r
              for name in names:\r
                  schedule.every(1).seconds.do(record, name)\r
              schedule.run_all()\r
              schedule.clear()\r
              return {\r
                  "executed": executed,\r
                  "count": len(executed),\r
                  "remainingJobs": len(schedule.jobs),\r
              }\r
        hints:\r
          - callback 함수가 name을 받아 executed에 append하도록 만드세요.\r
          - 모든 Job 등록 뒤 run_all을 한 번만 호출하세요.\r
      check:\r
        id: python.schedule.run-named-batch.transfer.behavior.v1\r
        version: 1\r
        kind: behavior\r
        strength: strong\r
        executor: browser-worker\r
        timeoutMs: 8000\r
        fixtureId: python.schedule.run-named-batch.transfer.fixture.v1\r
        fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
        fixture:\r
          directories: []\r
          env:\r
            LANG: C.UTF-8\r
            TZ: UTC\r
          files: []\r
          stdin: []\r
        packageAssets:\r
          - name: schedule\r
            version: 1.2.2\r
            url: check-packages/schedule-1.2.2-py3-none-any.whl\r
            integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=
        payload:\r
          entry: run_named_batch\r
          cases:\r
            - id: two-report-tasks\r
              arguments:\r
                - value:\r
                    - load-orders\r
                    - publish-report\r
              expectedReturn:\r
                executed:\r
                  - load-orders\r
                  - publish-report\r
                count: 2\r
                remainingJobs: 0\r
            - id: one-cleanup-task\r
              arguments:\r
                - value:\r
                    - cleanup-cache\r
              expectedReturn:\r
                executed:\r
                  - cleanup-cache\r
                count: 1\r
                remainingJobs: 0\r
          expectedPaths: []\r
          normalizeReturnPaths: []\r
  retrievalVariants:\r
    - id: schedule-resilient-cycle-retrieval\r
      mode: retrieval\r
      unseen: true\r
      minimumDelayHours: 24\r
      sourceSectionIds:\r
        - schedule-tagged-jobs-mastery\r
        - tick-summary\r
      title: 하루 뒤 실패를 격리하는 실행 cycle 만들기\r
      subtitle: callback 상태와 cleanup을 기억에서 복원\r
      goal: 일부 작업이 실패해도 각 결과를 기록하고 scheduler를 항상 비운다.\r
      why: 시간이 지난 뒤에도 실행과 정리 순서를 재구성해야 한 작업의 오류가 다음 자동화 cycle에 남지 않는다.\r
      explanation: 전체 성공 batch와 중간 실패 batch를 각각 실행해 순서별 status와 remainingJobs 0을 검사한다.\r
      tips:\r
        - callback 안에서 실패 조건을 status로 바꾸고 다음 Job이 계속 실행되게 하세요.\r
        - run_all이 끝난 뒤 clear하고 전체 records를 반환하세요.\r
      exercise:\r
        prompt: run_resilient_cycle(values, fail_value)이 각 값을 실행해 ok 또는 failed status를 기록하고 scheduler를 비운 결과를 반환하도록 완성하세요.\r
        starterCode: |-\r
          import schedule\r
\r
          def run_resilient_cycle(values, fail_value):\r
              raise NotImplementedError\r
        solution: |-\r
          import schedule\r
\r
          def run_resilient_cycle(values, fail_value):\r
              schedule.clear()\r
              records = []\r
\r
              def run_one(value):\r
                  status = "failed" if value == fail_value else "ok"\r
                  records.append({"value": value, "status": status})\r
\r
              for value in values:\r
                  schedule.every(1).seconds.do(run_one, value)\r
              schedule.run_all()\r
              schedule.clear()\r
              return {"records": records, "remainingJobs": len(schedule.jobs)}\r
        hints:\r
          - 실패 값을 예외로 밖에 던지지 말고 callback 결과 status로 격리하세요.\r
          - 모든 callback 실행 뒤 clear하고 remainingJobs를 확인하세요.\r
      check:\r
        id: python.schedule.run-resilient-cycle.retrieval.behavior.v1\r
        version: 1\r
        kind: behavior\r
        strength: strong\r
        executor: browser-worker\r
        timeoutMs: 8000\r
        fixtureId: python.schedule.run-resilient-cycle.retrieval.fixture.v1\r
        fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=\r
        fixture:\r
          directories: []\r
          env:\r
            LANG: C.UTF-8\r
            TZ: UTC\r
          files: []\r
          stdin: []\r
        packageAssets:\r
          - name: schedule\r
            version: 1.2.2\r
            url: check-packages/schedule-1.2.2-py3-none-any.whl\r
            integrity: sha256-W+9KKgGDq/RARq4NFkytysIbHbARvdgQLkoMHpHgan0=
        payload:\r
          entry: run_resilient_cycle\r
          cases:\r
            - id: all-success\r
              arguments:\r
                - value:\r
                    - 1\r
                    - 2\r
                - value: 99\r
              expectedReturn:\r
                records:\r
                  - value: 1\r
                    status: ok\r
                  - value: 2\r
                    status: ok\r
                remainingJobs: 0\r
            - id: middle-failure\r
              arguments:\r
                - value:\r
                    - 1\r
                    - 2\r
                    - 3\r
                - value: 2\r
              expectedReturn:\r
                records:\r
                  - value: 1\r
                    status: ok\r
                  - value: 2\r
                    status: failed\r
                  - value: 3\r
                    status: ok\r
                remainingJobs: 0\r
          expectedPaths: []\r
          normalizeReturnPaths: []\r
`;export{e as default};