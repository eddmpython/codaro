var e=`meta:
  id: procCtl_10
  title: 종합 빌드 러너 프로젝트
  order: 10
  category: procCtl
  difficulty: medium
  audience: 프로세스 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - subprocess
    - pipeline
    - project
intro:
  direction: 외부 도구 래퍼, 타임아웃, 종료 분류를 모아 여러 명령을 순서대로 실행하고 JSON 리포트를 저장하는 종합 빌드 러너를 만든다.
  benefits:
    - 명령 목록을 dict로 받아 순서대로 실행한다.
    - 한 명령 실패 시 후속 명령을 건너뛰는 분기를 만든다.
    - 단계별 결과를 self-contained dict 리스트로 누적한다.
    - 최종 리포트를 JSON으로 저장해 다음 사이클이 비교할 수 있게 한다.
  diagram:
    steps:
      - label: 빌드 명령 목록 정의
        detail: name과 args, timeout을 가진 dict 리스트로 한 사이클을 표현한다.
      - label: 단계별 실행
        detail: 각 단계마다 subprocess.run을 호출해 결과 dict를 만든다.
      - label: 실패 단계 후 중단
        detail: status가 failed면 후속 단계를 건너뛰고 skipped로 기록한다.
      - label: 종합 리포트 저장
        detail: 단계 결과 리스트와 startedAt, completedAt을 JSON으로 저장한다.
    runtime:
      - label: 표준 라이브러리만
        detail: subprocess, json, datetime, tempfile만 사용한다.
      - label: assert 기반 종합 검증
        detail: 단계별 status 분기와 저장된 JSON 내용을 assert로 비교한다.
sections:
  - id: pipeline-input
    title: 빌드 명령 목록 정의
    structuredPrimary: true
    subtitle: 입력 dict 리스트
    goal: 한 사이클의 빌드 명령들을 name과 args를 가진 dict 리스트로 표현한다.
    why: 자동화 빌드는 명령 목록을 데이터로 두면 코드 변경 없이 단계만 늘리거나 줄일 수 있어 유지보수가 단순해진다.
    explanation: 입력 리스트의 각 dict는 name, args, timeout을 키로 둔다. name은 보고서에 표시될 단계 이름, args는 subprocess에 그대로 넘길 리스트, timeout은 부동소수 초다. 이 구조가 빌드 러너의 표준 입력이 된다.
    tips:
      - name 키는 사람이 읽기 쉬운 짧은 문자열로 둔다.
      - args 키는 subprocess.run에 그대로 넘길 수 있는 형태여야 한다.
    snippet: |-
      import sys

      jobs = [
          {"name": "step-1", "args": [sys.executable, "-c", "print('first')"], "timeout": 5.0},
          {"name": "step-2", "args": [sys.executable, "-c", "print('second')"], "timeout": 5.0},
      ]
      summary = {"count": len(jobs), "names": [job["name"] for job in jobs]}

      assert summary == {"count": 2, "names": ["step-1", "step-2"]}
      summary
    exercise:
      prompt: 같은 형식으로 step-A와 step-B 두 단계를 정의하고 count가 2, names 리스트가 ["step-A", "step-B"]임을 검증하세요.
      starterCode: |-
        import sys

        jobs = [
            {"name": "___", "args": [sys.executable, "-c", "print('a')"], "timeout": 5.0},
            {"name": "___", "args": [sys.executable, "-c", "print('b')"], "timeout": 5.0},
        ]
        summary = {"count": len(jobs), "names": [job["name"] for job in jobs]}

        assert summary == {"count": 2, "names": ["step-A", "step-B"]}
        summary
      solution: |-
        import sys

        jobs = [
            {"name": "step-A", "args": [sys.executable, "-c", "print('a')"], "timeout": 5.0},
            {"name": "step-B", "args": [sys.executable, "-c", "print('b')"], "timeout": 5.0},
        ]
        summary = {"count": len(jobs), "names": [job["name"] for job in jobs]}

        assert summary == {"count": 2, "names": ["step-A", "step-B"]}
        summary
      hints:
        - 두 단계 이름을 step-A와 step-B로 두어야 검증이 통과한다.
        - 리스트 컴프리헨션이 단계 이름을 그대로 모으도록 두면 된다.
      check:
        type: noError
        noError: 리스트 구성과 dict 빌드가 끝나야 한다.
        resultCheck: summary의 count가 2, names 리스트가 본문 기대값과 같아야 한다.
    check:
      noError: 입력 리스트와 summary 구성이 끝나야 한다.
      resultCheck: summary가 count 2와 ["step-1", "step-2"] 두 이름을 정확히 담아야 한다.
  - id: run-step
    title: 단계별 실행 함수
    structuredPrimary: true
    subtitle: subprocess.run + status
    goal: 한 단계 dict를 받아 subprocess.run을 호출하고 success 또는 failed로 분류한 결과 dict를 만든다.
    why: 단계별 함수가 잘 정리되어 있어야 빌드 러너 본체가 단순해지고 테스트도 쉬워진다.
    explanation: runStep 함수는 입력 dict의 args와 timeout을 사용해 subprocess.run을 호출한다. capture_output=True와 text=True를 켜고 returncode를 확인한다. 결과 dict는 단계 이름과 status, returncode, stdout, stderr를 가진 표준 형태다.
    tips:
      - stdout과 stderr는 strip해서 빈 줄을 제거하면 보고서가 깔끔해진다.
      - TimeoutExpired는 별도로 잡아 status를 timeout으로 분류할 수 있다.
    snippet: |-
      import subprocess
      import sys


      def runStep(step: dict) -> dict:
          try:
              result = subprocess.run(
                  step["args"],
                  timeout=step["timeout"],
                  capture_output=True,
                  text=True,
              )
          except subprocess.TimeoutExpired as exc:
              return {
                  "name": step["name"],
                  "status": "timeout",
                  "returncode": None,
                  "stdout": (exc.stdout or "").strip() if exc.stdout else "",
                  "stderr": (exc.stderr or "").strip() if exc.stderr else "",
              }
          status = "success" if result.returncode == 0 else "failed"
          return {
              "name": step["name"],
              "status": status,
              "returncode": result.returncode,
              "stdout": result.stdout.strip(),
              "stderr": result.stderr.strip(),
          }


      okStep = {"name": "ok", "args": [sys.executable, "-c", "print('done')"], "timeout": 5.0}
      result = runStep(okStep)

      assert result["status"] == "success"
      assert result["stdout"] == "done"
      result
    exercise:
      prompt: runStep에 sys.exit(2) 명령을 가진 단계를 넘기면 status가 "failed"가 되고 returncode가 2인지 검증하세요.
      starterCode: |-
        import subprocess
        import sys


        def runStep(step: dict) -> dict:
            try:
                result = subprocess.run(
                    step["args"],
                    timeout=step["timeout"],
                    capture_output=True,
                    text=True,
                )
            except subprocess.TimeoutExpired as exc:
                return {
                    "name": step["name"],
                    "status": "timeout",
                    "returncode": None,
                    "stdout": (exc.stdout or "").strip() if exc.stdout else "",
                    "stderr": (exc.stderr or "").strip() if exc.stderr else "",
                }
            status = "success" if result.returncode == ___ else "failed"
            return {
                "name": step["name"],
                "status": status,
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        failStep = {"name": "fail", "args": [sys.executable, "-c", "import sys; sys.exit(2)"], "timeout": 5.0}
        result = runStep(failStep)

        assert result["status"] == "failed"
        assert result["returncode"] == 2
        result
      solution: |-
        import subprocess
        import sys


        def runStep(step: dict) -> dict:
            try:
                result = subprocess.run(
                    step["args"],
                    timeout=step["timeout"],
                    capture_output=True,
                    text=True,
                )
            except subprocess.TimeoutExpired as exc:
                return {
                    "name": step["name"],
                    "status": "timeout",
                    "returncode": None,
                    "stdout": (exc.stdout or "").strip() if exc.stdout else "",
                    "stderr": (exc.stderr or "").strip() if exc.stderr else "",
                }
            status = "success" if result.returncode == 0 else "failed"
            return {
                "name": step["name"],
                "status": status,
                "returncode": result.returncode,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
            }


        failStep = {"name": "fail", "args": [sys.executable, "-c", "import sys; sys.exit(2)"], "timeout": 5.0}
        result = runStep(failStep)

        assert result["status"] == "failed"
        assert result["returncode"] == 2
        result
      hints:
        - returncode가 0일 때만 status가 success로 매겨진다.
        - sys.exit(2)는 returncode를 정확히 2로 만든다.
      check:
        type: noError
        noError: runStep 호출과 분기 처리가 끝나야 한다.
        resultCheck: result의 status가 failed이고 returncode가 2여야 한다.
    check:
      noError: runStep 호출이 종합 처리 흐름으로 끝나야 한다.
      resultCheck: result의 status가 success이고 stdout이 "done"이어야 한다.
  - id: skip-on-failure
    title: 실패 후 후속 단계 건너뛰기
    structuredPrimary: true
    subtitle: 단계 중단 분기
    goal: 한 단계가 실패하면 후속 단계를 실행하지 않고 skipped로 기록한다.
    why: 자동화 빌드는 실패가 발생한 시점에 후속 단계가 의미를 잃는 경우가 많으므로 명시적 중단이 자원과 시간을 아낀다.
    explanation: runPipeline 함수는 단계 리스트를 순회한다. 단계 상태가 success인 동안에만 실제 실행을 호출하고, 실패 후에는 skipped 상태로 단계 결과를 누적한다. skipped 단계는 returncode None과 비어 있는 stdout으로 표시한다.
    tips:
      - skip 분기는 자동화 안에서 사고 추적을 단순화하는 명시적 신호다.
      - 모든 단계가 skipped로 끝나는 경우는 첫 단계 실패 직후 두 번째 단계만 skipped라는 의미다.
    snippet: |-
      import subprocess
      import sys


      def runStep(step: dict) -> dict:
          result = subprocess.run(
              step["args"],
              timeout=step["timeout"],
              capture_output=True,
              text=True,
          )
          status = "success" if result.returncode == 0 else "failed"
          return {"name": step["name"], "status": status, "returncode": result.returncode}


      def runPipeline(jobs: list) -> list:
          results = []
          failed = False
          for job in jobs:
              if failed:
                  results.append({"name": job["name"], "status": "skipped", "returncode": None})
                  continue
              outcome = runStep(job)
              results.append(outcome)
              if outcome["status"] != "success":
                  failed = True
          return results


      pipeline = [
          {"name": "step-1", "args": [sys.executable, "-c", "import sys; sys.exit(1)"], "timeout": 5.0},
          {"name": "step-2", "args": [sys.executable, "-c", "print('never run')"], "timeout": 5.0},
      ]
      results = runPipeline(pipeline)

      assert results[0]["status"] == "failed"
      assert results[1]["status"] == "skipped"
      assert results[1]["returncode"] is None
      [step["status"] for step in results]
    exercise:
      prompt: 첫 단계가 sys.exit(0)으로 성공하면 두 번째 단계도 실행되고 두 단계 모두 success가 되는지 검증하세요.
      starterCode: |-
        import subprocess
        import sys


        def runStep(step: dict) -> dict:
            result = subprocess.run(
                step["args"],
                timeout=step["timeout"],
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == 0 else "failed"
            return {"name": step["name"], "status": status, "returncode": result.returncode}


        def runPipeline(jobs: list) -> list:
            results = []
            failed = ___
            for job in jobs:
                if failed:
                    results.append({"name": job["name"], "status": "skipped", "returncode": None})
                    continue
                outcome = runStep(job)
                results.append(outcome)
                if outcome["status"] != "success":
                    failed = True
            return results


        pipeline = [
            {"name": "step-1", "args": [sys.executable, "-c", "print('ok')"], "timeout": 5.0},
            {"name": "step-2", "args": [sys.executable, "-c", "print('also ok')"], "timeout": 5.0},
        ]
        results = runPipeline(pipeline)

        assert results[0]["status"] == "success"
        assert results[1]["status"] == "success"
        [step["status"] for step in results]
      solution: |-
        import subprocess
        import sys


        def runStep(step: dict) -> dict:
            result = subprocess.run(
                step["args"],
                timeout=step["timeout"],
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == 0 else "failed"
            return {"name": step["name"], "status": status, "returncode": result.returncode}


        def runPipeline(jobs: list) -> list:
            results = []
            failed = False
            for job in jobs:
                if failed:
                    results.append({"name": job["name"], "status": "skipped", "returncode": None})
                    continue
                outcome = runStep(job)
                results.append(outcome)
                if outcome["status"] != "success":
                    failed = True
            return results


        pipeline = [
            {"name": "step-1", "args": [sys.executable, "-c", "print('ok')"], "timeout": 5.0},
            {"name": "step-2", "args": [sys.executable, "-c", "print('also ok')"], "timeout": 5.0},
        ]
        results = runPipeline(pipeline)

        assert results[0]["status"] == "success"
        assert results[1]["status"] == "success"
        [step["status"] for step in results]
      hints:
        - failed 초기값은 False로 두어야 첫 단계가 실행된다.
        - 두 단계 모두 성공이므로 skipped는 없다.
      check:
        type: noError
        noError: runPipeline 두 단계 흐름이 정상적으로 끝나야 한다.
        resultCheck: 두 단계 모두 status가 success여야 한다.
    check:
      noError: runPipeline 호출과 skip 분기가 정상적으로 처리되어야 한다.
      resultCheck: 두 번째 단계가 skipped로 기록되고 returncode가 None이어야 한다.
  - id: report-save-cycle
    title: JSON 리포트 종합 정리
    structuredPrimary: true
    subtitle: 단계 결과 영속화
    goal: 한 사이클의 단계 결과를 JSON 리포트로 저장하고 다시 읽어 영속성을 검증한다.
    why: 종합 보고서가 디스크에 남아야 운영자가 어제와 오늘의 차이를 비교할 수 있고 자동화 사고를 추적할 수 있다.
    explanation: saveReport 함수는 단계 결과 리스트와 startedAt, completedAt을 받아 JSON으로 저장한다. tempfile 폴더의 reports/last.json 경로를 사용해 격리된 위치에서 영속화한다. 같은 셀에서 다시 read_text와 json.loads로 복원해 dict가 동일한지 확인한다.
    tips:
      - generatedAt 같은 시각 정보는 항상 UTC로 두어 자동화 표준에 맞춘다.
      - JSON은 한 줄로 저장해도 되고 indent=2로 사람이 읽기 좋게 저장할 수도 있다.
    snippet: |-
      import json
      import subprocess
      import sys
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path


      def runStep(step: dict) -> dict:
          result = subprocess.run(
              step["args"],
              timeout=step["timeout"],
              capture_output=True,
              text=True,
          )
          status = "success" if result.returncode == 0 else "failed"
          return {"name": step["name"], "status": status}


      def runPipeline(jobs: list) -> list:
          return [runStep(job) for job in jobs]


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          reportsDir = base / "reports"
          reportsDir.mkdir()
          jobs = [
              {"name": "s1", "args": [sys.executable, "-c", "print('first')"], "timeout": 5.0},
              {"name": "s2", "args": [sys.executable, "-c", "print('second')"], "timeout": 5.0},
          ]
          steps = runPipeline(jobs)
          payload = {
              "steps": steps,
              "generatedAt": datetime.now(UTC).isoformat(timespec="seconds"),
          }
          target = reportsDir / "last.json"
          target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
          restored = json.loads(target.read_text(encoding="utf-8"))

      assert restored["steps"] == steps
      assert "generatedAt" in restored
      restored["steps"]
    exercise:
      prompt: 종합 리포트를 저장하고 다시 읽었을 때 steps 리스트가 두 단계의 status를 모두 success로 보고하고 generatedAt 키가 포함되어 있는지 검증하세요.
      starterCode: |-
        import json
        import subprocess
        import sys
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def runStep(step: dict) -> dict:
            result = subprocess.run(
                step["args"],
                timeout=step["timeout"],
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == 0 else "failed"
            return {"name": step["name"], "status": status}


        def runPipeline(jobs: list) -> list:
            return [runStep(job) for job in jobs]


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            reportsDir = base / "reports"
            reportsDir.mkdir()
            jobs = [
                {"name": "alpha", "args": [sys.executable, "-c", "print('alpha')"], "timeout": 5.0},
                {"name": "beta", "args": [sys.executable, "-c", "print('beta')"], "timeout": 5.0},
            ]
            steps = runPipeline(jobs)
            payload = {
                "steps": steps,
                "generatedAt": datetime.now(UTC).isoformat(timespec="seconds"),
            }
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            restored = json.loads(target.___(encoding="utf-8"))

        assert [step["status"] for step in restored["steps"]] == ["success", "success"]
        assert "generatedAt" in restored
        restored["steps"]
      solution: |-
        import json
        import subprocess
        import sys
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def runStep(step: dict) -> dict:
            result = subprocess.run(
                step["args"],
                timeout=step["timeout"],
                capture_output=True,
                text=True,
            )
            status = "success" if result.returncode == 0 else "failed"
            return {"name": step["name"], "status": status}


        def runPipeline(jobs: list) -> list:
            return [runStep(job) for job in jobs]


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            reportsDir = base / "reports"
            reportsDir.mkdir()
            jobs = [
                {"name": "alpha", "args": [sys.executable, "-c", "print('alpha')"], "timeout": 5.0},
                {"name": "beta", "args": [sys.executable, "-c", "print('beta')"], "timeout": 5.0},
            ]
            steps = runPipeline(jobs)
            payload = {
                "steps": steps,
                "generatedAt": datetime.now(UTC).isoformat(timespec="seconds"),
            }
            target = reportsDir / "last.json"
            target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            restored = json.loads(target.read_text(encoding="utf-8"))

        assert [step["status"] for step in restored["steps"]] == ["success", "success"]
        assert "generatedAt" in restored
        restored["steps"]
      hints:
        - Path 객체의 텍스트 읽기 메서드는 read_text다.
        - 두 단계가 모두 성공이므로 restored 리스트에서 status를 뽑으면 두 success가 나온다.
      check:
        type: noError
        noError: 종합 리포트 저장과 다시 읽기가 IOError 없이 끝나야 한다.
        resultCheck: restored의 steps가 두 success 항목을 가지고 generatedAt 키가 채워져야 한다.
    check:
      noError: 종합 리포트 작성과 복원이 격리 공간에서 끝나야 한다.
      resultCheck: restored가 steps와 generatedAt 두 키를 모두 가져 종합 정리 결과가 영속화되어야 한다.
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
  - id: procCtl_10-build-runner-dag-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pipeline-input
    - report-save-cycle
    title: 빌드 step 의존성 DAG와 실행 순서 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 누락 의존성과 cycle을 거부하고 결정적 topological order를 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - step 목록 순서를 의존성 순서로 가정하지 말고 DAG를 계산하세요.
    - 누락 dependency와 cycle을 process 실행 전에 거부하세요.
    exercise:
      prompt: plan_build_steps(steps)를 완성하세요.
      starterCode: |-
        def plan_build_steps(steps):
            raise NotImplementedError
      solution: |
        def plan_build_steps(steps):
            names = {step["name"] for step in steps}
            missing = sorted({dependency for step in steps for dependency in step.get("needs", []) if dependency not in names})
            if missing:
                raise ValueError("missing dependency")
            needs = {step["name"]: set(step.get("needs", [])) for step in steps}
            order = []
            while needs:
                ready = sorted(name for name, dependencies in needs.items() if not dependencies)
                if not ready:
                    raise ValueError("dependency cycle")
                for name in ready:
                    order.append(name)
                    needs.pop(name)
                for dependencies in needs.values():
                    dependencies.difference_update(ready)
            return {"order": order, "stepCount": len(order)}
      hints: *id001
    check:
      id: python.procctl.procCtl_10.build-runner-dag.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_10.build-runner-dag.mastery.behavior.v1.fixture
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
        entry: plan_build_steps
        cases:
        - id: orders-dependent-steps
          arguments:
          - value:
            - name: test
              needs:
              - lint
            - name: lint
              needs: []
            - name: package
              needs:
              - test
          expectedReturn:
            order:
            - lint
            - test
            - package
            stepCount: 3
        - id: orders-independent-steps-by-name
          arguments:
          - value:
            - name: b
              needs: []
            - name: a
              needs: []
          expectedReturn:
            order:
            - a
            - b
            stepCount: 2
        - id: rejects-missing-dependency
          arguments:
          - value:
            - name: test
              needs:
              - build
          expectedException: ValueError
        - id: rejects-cycle
          arguments:
          - value:
            - name: a
              needs:
              - b
            - name: b
              needs:
              - a
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: procCtl_10-build-run-evidence-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_10-build-runner-dag-mastery
    title: 새 빌드 실행에 step·artifact 증거 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 실패 뒤 downstream 실행과 산출물 누락을 찾아 전체 결과를 판정한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - step 실패 뒤 실행된 downstream step를 green count에 포함하지 마세요.
    - 빌드 성공은 필수 artifact identity와 함께 판정하세요.
    exercise:
      prompt: audit_build_run(results, expected_artifacts)를 완성하세요.
      starterCode: |-
        def audit_build_run(results, expected_artifacts):
            raise NotImplementedError
      solution: |
        def audit_build_run(results, expected_artifacts):
            failures = []
            first_failed_index = next((index for index, result in enumerate(results) if not result["passed"]), None)
            executed_after_failure = []
            if first_failed_index is not None:
                failures.append("step")
                executed_after_failure = [result["name"] for result in results[first_failed_index + 1 :] if result.get("executed", True)]
                if executed_after_failure:
                    failures.append("continued-after-failure")
            artifacts = {artifact for result in results for artifact in result.get("artifacts", [])}
            missing = sorted(set(expected_artifacts) - artifacts)
            if missing:
                failures.append("artifacts")
            return {"passed": not failures, "failures": failures, "executedAfterFailure": executed_after_failure, "missingArtifacts": missing}
      hints: *id002
    check:
      id: python.procctl.procCtl_10.build-run-evidence.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_10.build-run-evidence.transfer.behavior.v1.fixture
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
        entry: audit_build_run
        cases:
        - id: accepts-green-build-with-artifact
          arguments:
          - value:
            - name: test
              passed: true
              artifacts: []
            - name: package
              passed: true
              artifacts:
              - app.zip
          - value:
            - app.zip
          expectedReturn:
            passed: true
            failures: []
            executedAfterFailure: []
            missingArtifacts: []
        - id: reports-continuation-and-missing-artifact
          arguments:
          - value:
            - name: test
              passed: false
            - name: package
              passed: true
              executed: true
          - value:
            - app.zip
          expectedReturn:
            passed: false
            failures:
            - step
            - continued-after-failure
            - artifacts
            executedAfterFailure:
            - package
            missingArtifacts:
            - app.zip
        - id: reports-stopped-failure
          arguments:
          - value:
            - name: test
              passed: false
          - value: []
          expectedReturn:
            passed: false
            failures:
            - step
            executedAfterFailure: []
            missingArtifacts: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: procCtl_10-build-runner-capstone-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - procCtl_10-build-run-evidence-transfer
    title: 종합 빌드 runner 종료 조건 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: DAG·sandbox·step·artifact 증거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - process 실행 성공과 업무 결과물 성공을 같은 것으로 처리하지 마세요.
    - 명령 identity·제한 시간·산출물 evidence·남는 risk를 함께 기록하세요.
    exercise:
      prompt: choose_build_runner_gate(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_build_runner_gate(situation):
            raise NotImplementedError
      solution: |
        def choose_build_runner_gate(situation):
            table = {'plan': {'action': 'validate dependency DAG', 'evidence': 'deterministic order', 'risk': 'cycle or missing step'}, 'execute': {'action': 'run each step in bounded context', 'evidence': 'argv duration return code', 'risk': 'ambient environment'}, 'release': {'action': 'verify all steps and artifacts', 'evidence': 'source-bound build manifest', 'risk': 'stale artifact'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.procctl.procCtl_10.build-runner-capstone-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.procctl.procCtl_10.build-runner-capstone-recall.retrieval.behavior.v1.fixture
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
        entry: choose_build_runner_gate
        cases:
        - id: recalls-plan
          arguments:
          - value: plan
          expectedReturn:
            action: validate dependency DAG
            evidence: deterministic order
            risk: cycle or missing step
        - id: recalls-execute
          arguments:
          - value: execute
          expectedReturn:
            action: run each step in bounded context
            evidence: argv duration return code
            risk: ambient environment
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};