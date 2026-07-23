var e=`meta:
  id: resilience_03
  title: 원자적 쓰기
  order: 3
  category: resilience
  difficulty: easy
  audience: 리포트·상태 파일을 주기적으로 덮어쓰는 자동화를 만드는 Python 학습자
  packages: []
  tags:
    - atomic
    - 원자적
    - os.replace
    - 파일안전
    - tempfile
intro:
  direction: 임시 파일에 전량을 먼저 쓰고 os.replace로 한 번에 교체해, 쓰는 도중 죽어도 파일이 반쪽으로 남지 않게 만든다.
  benefits:
    - open('w')가 여는 즉시 기존 내용을 날린다는 위험을 직접 본다.
    - 임시 파일 + os.replace로 "옛 버전 또는 새 버전, 절대 반쪽 아님"을 보장한다.
    - 쓰다 죽어도 원본이 보존돼 다음 독자가 깨진 파일을 읽지 않는다.
  diagram:
    steps:
      - label: 직접 덮어쓰기의 위험
        detail: open('w')로 바로 쓰다 죽으면 원본도 신규본도 잃고 반쪽만 남는다.
      - label: 원자적 교체
        detail: 임시 파일에 전량 쓰고 os.replace로 한 번에 바꾼다.
      - label: 죽어도 보존
        detail: replace 전에 죽으면 원본이 그대로 남고 임시 파일만 남는다.
    runtime:
      - label: 로컬 표준 라이브러리 실행
        detail: os, pathlib, tempfile만으로 로컬 Python에서 그대로 실행한다.
      - label: assert로 직접 확인
        detail: 중단을 모사해 원본 보존 여부를 assert로 눈에 보이게 검증한다.
sections:
  - id: unsafe-overwrite
    title: 직접 덮어쓰기의 위험
    structuredPrimary: true
    subtitle: 쓰다 죽으면 반쪽만 남는다
    goal: open('w')로 직접 덮어쓰다 중간에 죽으면 원본이 사라지고 미완성 내용만 남는 것을 확인한다.
    why: 매시간 status.json을 통째로 덮어쓰는 자동화는, 쓰는 도중 죽으면 독자가 깨진 파일을 읽고 파이프라인 전체가 멈춘다.
    explanation: |-
      open(path, "w")는 파일을 여는 즉시 기존 내용을 0바이트로 날린다. 그 뒤 write로 새 내용을 조금씩 채우는데, 다 쓰기 전에 죽으면 원본은 이미 사라졌고 새 내용은 미완성 - 반쪽짜리 파일만 남는다.

      아래는 세 조각을 쓰다 세 번째에서 죽는 상황이다. 원본 "OLD-DATA"는 사라지고 "AAABBB"만 남는다. 이게 직접 덮어쓰기의 근본 위험이다.
    tips:
      - "'w' 모드는 여는 순간 truncate(0바이트화)한다 - 한 글자도 안 썼는데 원본이 날아갈 수 있다."
      - 예외를 잡되 메시지를 보존해 무엇 때문에 죽었는지 남긴다(삼키지 않기).
    snippet: |-
      import tempfile
      from pathlib import Path

      def unsafeWrite(path, chunks):
          with open(path, "w", encoding="utf-8") as handle:
              for i, chunk in enumerate(chunks):
                  if i == 2:
                      raise RuntimeError("crashed mid-write")
                  handle.write(chunk)

      with tempfile.TemporaryDirectory() as tmp:
          path = Path(tmp) / "report.txt"
          path.write_text("OLD-DATA", encoding="utf-8")
          crashed = ""
          try:
              unsafeWrite(path, ["AAA", "BBB", "CCC"])
          except RuntimeError as exc:
              crashed = str(exc)
          after = path.read_text(encoding="utf-8")

      assert crashed == "crashed mid-write"
      assert after != "OLD-DATA"
      assert after == "AAABBB"
      corruptedLen = len(after)
      assert corruptedLen == 6
      corruptedLen
    exercise:
      prompt: 두 번째 조각(i == 1)에서 죽도록 바꾸면 파일에 몇 글자가 남는지 확인하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        def unsafeWrite(path, chunks):
            with open(path, "w", encoding="utf-8") as handle:
                for i, chunk in enumerate(chunks):
                    if i == ___:
                        raise RuntimeError("crashed mid-write")
                    handle.write(chunk)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            path.write_text("OLD-DATA", encoding="utf-8")
            crashed = ""
            try:
                unsafeWrite(path, ["AAA", "BBB", "CCC"])
            except RuntimeError as exc:
                crashed = str(exc)
            after = path.read_text(encoding="utf-8")

        assert after == "AAA"
        corruptedLen = len(after)
        assert corruptedLen == 3
        corruptedLen
      solution: |-
        import tempfile
        from pathlib import Path

        def unsafeWrite(path, chunks):
            with open(path, "w", encoding="utf-8") as handle:
                for i, chunk in enumerate(chunks):
                    if i == 1:
                        raise RuntimeError("crashed mid-write")
                    handle.write(chunk)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            path.write_text("OLD-DATA", encoding="utf-8")
            crashed = ""
            try:
                unsafeWrite(path, ["AAA", "BBB", "CCC"])
            except RuntimeError as exc:
                crashed = str(exc)
            after = path.read_text(encoding="utf-8")

        assert after == "AAA"
        corruptedLen = len(after)
        assert corruptedLen == 3
        corruptedLen
      hints:
        - i == 1이면 첫 조각 "AAA"만 쓰이고 죽는다.
        - 남는 글자 수는 3이다.
      check:
        type: noError
        noError: 중단 모사가 잡혀서 끝나야 한다.
        resultCheck: corruptedLen이 3이어야 한다.
    check:
      noError: unsafeWrite 중단이 잡혀서 끝나야 한다.
      resultCheck: corruptedLen이 6이고 원본이 사라져야 한다.
  - id: atomic-replace
    title: 원자적 교체
    structuredPrimary: true
    subtitle: 임시 파일 + os.replace
    goal: 임시 파일에 전량을 쓴 뒤 os.replace로 한 번에 교체해 최종 파일이 항상 완전한지 확인한다.
    why: os.replace는 교체를 원자적으로 수행한다 - 독자는 항상 옛 버전 아니면 새 버전을 보고, 반쪽을 보는 일이 없다.
    explanation: |-
      atomicWrite는 두 단계다. ① 임시 파일(path + ".tmp")에 데이터 전량을 먼저 쓴다. ② os.replace(tmp, path)로 임시 파일을 최종 경로로 한 번에 옮긴다.

      os.replace는 운영체제 수준에서 원자적이라, 교체가 "완료" 또는 "미수행" 둘 중 하나다. 중간 상태가 독자에게 보이지 않는다. 참고로 Path.rename은 Windows에서 대상이 이미 있으면 FileExistsError를 내 교체용으로 부적합하지만, os.replace는 기존 파일을 원자적으로 덮어쓴다.
    tips:
      - 임시 파일은 같은 디렉터리에 두어야 os.replace가 같은 파일시스템 안에서 원자적으로 동작한다.
      - os.replace는 대상이 있어도 덮어쓴다 - rename과 달리 교체에 바로 쓸 수 있다.
    snippet: |-
      import os
      import tempfile
      from pathlib import Path

      def atomicWrite(path, data):
          tmpPath = str(path) + ".tmp"
          Path(tmpPath).write_text(data, encoding="utf-8")
          os.replace(tmpPath, path)

      with tempfile.TemporaryDirectory() as tmp:
          path = Path(tmp) / "report.txt"
          atomicWrite(path, "v2-complete")
          restored = path.read_text(encoding="utf-8")

      assert restored == "v2-complete"
      restored
    exercise:
      prompt: atomicWrite로 "final-report"를 쓰면 읽어 온 내용이 정확히 그 문자열인지 확인하세요.
      starterCode: |-
        import os
        import tempfile
        from pathlib import Path

        def atomicWrite(path, data):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(data, encoding="utf-8")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            atomicWrite(path, ___)
            restored = path.read_text(encoding="utf-8")

        assert restored == "final-report"
        restored
      solution: |-
        import os
        import tempfile
        from pathlib import Path

        def atomicWrite(path, data):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(data, encoding="utf-8")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            atomicWrite(path, "final-report")
            restored = path.read_text(encoding="utf-8")

        assert restored == "final-report"
        restored
      hints:
        - 쓸 데이터는 문자열 "final-report"다.
        - os.replace 뒤 읽으면 같은 문자열이 그대로 나온다.
      check:
        type: noError
        noError: 임시 파일 쓰기와 os.replace가 예외 없이 끝나야 한다.
        resultCheck: restored가 "final-report"여야 한다.
    check:
      noError: atomicWrite가 끝나야 한다.
      resultCheck: restored가 "v2-complete"여야 한다.
  - id: crash-keeps-original
    title: 쓰다 죽어도 원본 보존
    structuredPrimary: true
    subtitle: replace 전에 죽으면 원본 그대로
    goal: 임시 파일을 쓴 뒤 os.replace 전에 죽으면 원본이 그대로 남고 임시 파일만 남는 것을 확인한다.
    why: 원자적 쓰기의 진짜 이득 - 쓰다 죽어도 독자는 항상 완전한 옛 버전을 본다. 깨진 파일이 절대 노출되지 않는다.
    explanation: |-
      atomicWriteWithCrash는 임시 파일에 새 데이터를 쓴 뒤, replace 직전에 죽는 상황을 모사한다. 이때 최종 경로의 파일은 손대지 않았으므로 원본 "v1"이 그대로 남는다. 새 데이터는 임시 파일에만 있어 독자에게 보이지 않는다.

      즉 "v2로 바꾸다 죽음"의 결과가 "v1 그대로 + 임시 파일 잔존"이다. 반쪽짜리 v2는 어디에도 노출되지 않는다. 남은 임시 파일은 다음 실행이 정리하면 된다.
    tips:
      - 원자성의 핵심은 "최종 경로를 마지막 순간에 단 한 번 건드린다"는 것이다.
      - 남은 .tmp 파일은 사고의 흔적일 뿐, 원본을 오염시키지 않는다.
    snippet: |-
      import os
      import tempfile
      from pathlib import Path

      def atomicWriteWithCrash(path, data, crash):
          tmpPath = str(path) + ".tmp"
          Path(tmpPath).write_text(data, encoding="utf-8")
          if crash:
              raise RuntimeError("crashed before replace")
          os.replace(tmpPath, path)

      with tempfile.TemporaryDirectory() as tmp:
          path = Path(tmp) / "report.txt"
          path.write_text("v1", encoding="utf-8")
          crashed = ""
          try:
              atomicWriteWithCrash(path, "v2", crash=True)
          except RuntimeError as exc:
              crashed = str(exc)
          survived = path.read_text(encoding="utf-8")
          tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

      assert crashed == "crashed before replace"
      assert survived == "v1"
      assert len(tmpLeft) == 1
      survived
    exercise:
      prompt: crash=False로 바꾸면(정상 교체) 원본이 v2로 바뀌고 임시 파일이 안 남는지 확인하세요.
      starterCode: |-
        import os
        import tempfile
        from pathlib import Path

        def atomicWriteWithCrash(path, data, crash):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(data, encoding="utf-8")
            if crash:
                raise RuntimeError("crashed before replace")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            path.write_text("v1", encoding="utf-8")
            crashed = ""
            try:
                atomicWriteWithCrash(path, "v2", crash=___)
            except RuntimeError as exc:
                crashed = str(exc)
            survived = path.read_text(encoding="utf-8")
            tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

        assert survived == "v2"
        assert len(tmpLeft) == 0
        survived
      solution: |-
        import os
        import tempfile
        from pathlib import Path

        def atomicWriteWithCrash(path, data, crash):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(data, encoding="utf-8")
            if crash:
                raise RuntimeError("crashed before replace")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.txt"
            path.write_text("v1", encoding="utf-8")
            crashed = ""
            try:
                atomicWriteWithCrash(path, "v2", crash=False)
            except RuntimeError as exc:
                crashed = str(exc)
            survived = path.read_text(encoding="utf-8")
            tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

        assert survived == "v2"
        assert len(tmpLeft) == 0
        survived
      hints:
        - crash=False면 replace가 정상 수행된다.
        - 교체가 끝나면 임시 파일은 사라지고 원본은 v2가 된다.
      check:
        type: noError
        noError: 정상 교체가 예외 없이 끝나야 한다.
        resultCheck: survived가 "v2"이고 임시 파일이 안 남아야 한다.
    check:
      noError: atomicWriteWithCrash 중단이 잡혀서 끝나야 한다.
      resultCheck: survived가 "v1"으로 보존되고 임시 파일이 1개 남아야 한다.
  - id: practice-state-updater
    title: '종합 실습: 깨지지 않는 상태 파일'
    structuredPrimary: true
    subtitle: 원자적 쓰기로 반복 갱신
    goal: 상태 파일을 원자적 쓰기로 반복 갱신할 때 최종 내용이 정확하고 임시 파일이 남지 않는지 종합 점검한다.
    why: 주기적으로 status.json을 갱신하는 자동화가 임시 파일+os.replace로 어떻게 항상 완전한 상태를 유지하는지 확인한다.
    explanation: |-
      saveState는 임시 파일에 JSON을 전량 쓴 뒤 os.replace로 교체한다. 같은 경로를 두 번 갱신해도 매번 원자적으로 바뀌므로, 독자는 항상 step 1 또는 step 2의 완전한 상태만 본다.

      성공적으로 교체되면 임시 파일은 남지 않는다. 최종 내용이 마지막으로 쓴 상태와 같고 .tmp가 0개면, 반복 갱신이 안전하게 동작한 것이다.
    tips:
      - 상태를 dict로 두고 JSON으로 직렬화하면 단계·플래그를 함께 담기 쉽다.
      - 정상 교체 뒤 .tmp가 0개인지 보면 누수 없이 끝났는지 확인된다.
    snippet: |-
      import os
      import json
      import tempfile
      from pathlib import Path

      def saveState(path, state):
          tmpPath = str(path) + ".tmp"
          Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")
          os.replace(tmpPath, path)

      with tempfile.TemporaryDirectory() as tmp:
          path = Path(tmp) / "status.json"
          saveState(path, {"step": 1, "ok": True})
          saveState(path, {"step": 2, "ok": True})
          loaded = json.loads(path.read_text(encoding="utf-8"))
          leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

      assert loaded == {"step": 2, "ok": True}
      assert leftover == []
      loaded["step"]
    exercise:
      prompt: 세 번째 갱신으로 step 3을 저장하면 최종 step과 남은 임시 파일 수가 각각 얼마인지 확인하세요.
      starterCode: |-
        import os
        import json
        import tempfile
        from pathlib import Path

        def saveState(path, state):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "status.json"
            saveState(path, {"step": 1, "ok": True})
            saveState(path, {"step": 2, "ok": True})
            saveState(path, {"step": ___, "ok": True})
            loaded = json.loads(path.read_text(encoding="utf-8"))
            leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

        assert loaded["step"] == 3
        assert leftover == []
        loaded["step"]
      solution: |-
        import os
        import json
        import tempfile
        from pathlib import Path

        def saveState(path, state):
            tmpPath = str(path) + ".tmp"
            Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")
            os.replace(tmpPath, path)

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "status.json"
            saveState(path, {"step": 1, "ok": True})
            saveState(path, {"step": 2, "ok": True})
            saveState(path, {"step": 3, "ok": True})
            loaded = json.loads(path.read_text(encoding="utf-8"))
            leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]

        assert loaded["step"] == 3
        assert leftover == []
        loaded["step"]
      hints:
        - 저장할 단계 값은 정수 3이다.
        - 매 갱신이 원자적이라 .tmp는 0개로 남는다.
      check:
        type: noError
        noError: 세 번의 saveState가 예외 없이 끝나야 한다.
        resultCheck: 최종 step이 3이고 임시 파일이 0개여야 한다.
    check:
      noError: 반복 saveState가 끝나야 한다.
      resultCheck: 최종 내용이 step 2이고 임시 파일이 0개여야 한다.
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
  - id: resilience_03-atomic-write-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - unsafe-overwrite
    - practice-state-updater
    title: 원자적 쓰기의 temp·flush·replace 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 다른 볼륨 temp와 검증 없는 replace를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - temp는 target과 같은 디렉터리에 만들어 replace 원자성을 확보하세요.
    - temp 내용 검증과 fsync 뒤에만 replace하세요.
    exercise:
      prompt: audit_atomic_plan(target, temp, steps)를 완성하세요.
      starterCode: |-
        def audit_atomic_plan(target, temp, steps):
            raise NotImplementedError
      solution: |
        def audit_atomic_plan(target, temp, steps):
            from pathlib import PurePosixPath
            required_order = ["write-temp", "flush", "fsync", "verify-temp", "replace"]
            failures = []
            target_path = PurePosixPath(target)
            temp_path = PurePosixPath(temp)
            if target_path.parent != temp_path.parent:
                failures.append("directory")
            if steps != required_order:
                failures.append("order")
            if target == temp:
                failures.append("identity")
            return {"ready": not failures, "failures": failures, "sameDirectory": target_path.parent == temp_path.parent, "steps": steps}
      hints: *id001
    check:
      id: python.resilience.resilience_03.atomic-write-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.resilience.resilience_03.atomic-write-plan.mastery.behavior.v1.fixture
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
        entry: audit_atomic_plan
        cases:
        - id: accepts-same-directory-replace
          arguments:
          - value: out/report.json
          - value: out/.report.json.tmp
          - value:
            - write-temp
            - flush
            - fsync
            - verify-temp
            - replace
          expectedReturn:
            ready: true
            failures: []
            sameDirectory: true
            steps:
            - write-temp
            - flush
            - fsync
            - verify-temp
            - replace
        - id: reports-directory
          arguments:
          - value: out/report.json
          - value: tmp/report.tmp
          - value:
            - write-temp
            - flush
            - fsync
            - verify-temp
            - replace
          expectedReturn:
            ready: false
            failures:
            - directory
            sameDirectory: false
            steps:
            - write-temp
            - flush
            - fsync
            - verify-temp
            - replace
        - id: reports-order-and-identity
          arguments:
          - value: out/report.json
          - value: out/report.json
          - value:
            - write-temp
            - replace
          expectedReturn:
            ready: false
            failures:
            - order
            - identity
            sameDirectory: true
            steps:
            - write-temp
            - replace
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: resilience_03-atomic-recovery-decision-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - resilience_03-atomic-write-plan-mastery
    title: crash 뒤 target·temp 상태에서 복구 행동 결정하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: hash·validity·generation으로 보존 또는 승격을 선택한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - crash recovery는 파일 존재보다 content validity와 generation을 비교하세요.
    - 검증되지 않은 temp를 target 위로 덮지 마세요.
    exercise:
      prompt: decide_atomic_recovery(target, temp, expected_hash)를 완성하세요.
      starterCode: |-
        def decide_atomic_recovery(target, temp, expected_hash):
            raise NotImplementedError
      solution: |
        def decide_atomic_recovery(target, temp, expected_hash):
            target_valid = bool(target and target.get("valid"))
            temp_valid = bool(temp and temp.get("valid"))
            if target_valid and target.get("hash") == expected_hash:
                return {"action": "keep-target", "reason": "expected-committed"}
            if temp_valid and temp.get("hash") == expected_hash and (not target_valid or temp.get("generation", 0) > target.get("generation", 0)):
                return {"action": "promote-temp", "reason": "verified-newer-temp"}
            if target_valid:
                return {"action": "keep-target", "reason": "last-valid-artifact"}
            return {"action": "quarantine", "reason": "no-verified-artifact"}
      hints: *id002
    check:
      id: python.resilience.resilience_03.atomic-recovery-decision.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.resilience.resilience_03.atomic-recovery-decision.transfer.behavior.v1.fixture
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
        entry: decide_atomic_recovery
        cases:
        - id: keeps-expected-target
          arguments:
          - value:
              valid: true
              hash: h
              generation: 2
          - value:
              valid: true
              hash: h
              generation: 3
          - value: h
          expectedReturn:
            action: keep-target
            reason: expected-committed
        - id: promotes-verified-temp
          arguments:
          - value:
              valid: true
              hash: old
              generation: 1
          - value:
              valid: true
              hash: new
              generation: 2
          - value: new
          expectedReturn:
            action: promote-temp
            reason: verified-newer-temp
        - id: quarantines-invalid-state
          arguments:
          - value:
              valid: false
              hash: x
          - value:
              valid: false
              hash: new
          - value: new
          expectedReturn:
            action: quarantine
            reason: no-verified-artifact
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: resilience_03-atomic-write-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - resilience_03-atomic-recovery-decision-transfer
    title: 원자적 쓰기·복구 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: temp write·durability·replace·recovery를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서 상태 전이와 불변식을 즉시 검증하세요.
    - Local에서는 실제 crash·restart 뒤 원장과 artifact를 다시 읽어 확인하세요.
    exercise:
      prompt: choose_atomic_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_atomic_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_atomic_evidence(stage):
            table = {'temp': {'action': 'write unique temp beside target', 'evidence': 'bounded temp path', 'risk': 'partial target'}, 'durable': {'action': 'flush fsync and verify temp', 'evidence': 'temp hash and parse check', 'risk': 'buffered corruption'}, 'replace': {'action': 'atomically replace target', 'evidence': 'generation manifest', 'risk': 'torn update'}, 'recover': {'action': 'choose last verified generation', 'evidence': 'target-temp audit', 'risk': 'promoting invalid data'}}
            if stage not in table:
                raise ValueError('unknown stage')
            return table[stage]
      hints: *id003
    check:
      id: python.resilience.resilience_03.atomic-write-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.resilience.resilience_03.atomic-write-recall.retrieval.behavior.v1.fixture
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
        entry: choose_atomic_evidence
        cases:
        - id: recalls-temp
          arguments:
          - value: temp
          expectedReturn:
            action: write unique temp beside target
            evidence: bounded temp path
            risk: partial target
        - id: recalls-durable
          arguments:
          - value: durable
          expectedReturn:
            action: flush fsync and verify temp
            evidence: temp hash and parse check
            risk: buffered corruption
        - id: recalls-replace
          arguments:
          - value: replace
          expectedReturn:
            action: atomically replace target
            evidence: generation manifest
            risk: torn update
        - id: recalls-recover
          arguments:
          - value: recover
          expectedReturn:
            action: choose last verified generation
            evidence: target-temp audit
            risk: promoting invalid data
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};