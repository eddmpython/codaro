var e=`meta:
  id: fileOps_05
  title: 안전 삭제 패턴
  order: 5
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - pathlib
    - shutil
    - quarantine
intro:
  direction: 임시 폴더 안에서 즉시 삭제와 격리 폴더 이동 두 방식을 비교해 실수에서 회복 가능한 자동화 흐름을 만든다.
  benefits:
    - Path.unlink와 shutil.rmtree의 차이를 정확히 구분한다.
    - missing_ok 인자로 멱등한 삭제 함수를 만든다.
    - 격리 폴더로 옮기는 패턴으로 휴지통 대체 흐름을 직접 구현한다.
    - 드라이런 모드로 실제 삭제 없이 결과를 미리 본다.
  diagram:
    steps:
      - label: 단일 파일 삭제
        detail: Path.unlink로 파일 한 개를 지우고 사라졌는지 확인한다.
      - label: 폴더 트리 정리
        detail: shutil.rmtree로 빈 폴더와 자식까지 한 번에 제거한다.
      - label: 격리 폴더 이동
        detail: trash 폴더로 옮기는 안전한 대체 삭제를 구현한다.
      - label: 드라이런 종합
        detail: dry-run 옵션 함수가 어떤 파일을 지울지 미리 보여주고 실제 변경은 한 번에 처리한다.
    runtime:
      - label: 표준 라이브러리만
        detail: pathlib, shutil, tempfile만 사용해 외부 패키지 없이 동작한다.
      - label: assert 기준 검증
        detail: 삭제 전후 상태를 assert로 비교해 멱등성과 안전성을 확인한다.
sections:
  - id: unlink-once
    title: 한 파일을 안전하게 지우기
    structuredPrimary: true
    subtitle: missing_ok로 멱등성 확보
    goal: 같은 파일을 두 번 삭제해도 오류가 나지 않는 멱등한 삭제 함수를 만든다.
    why: 자동화는 같은 셀이 여러 번 실행될 수 있어서 두 번째 호출에서 FileNotFoundError가 나지 않도록 멱등하게 만들어야 안전하다.
    explanation: Path.unlink는 파일을 지우고 없으면 FileNotFoundError를 낸다. Python 3.8 이상에서는 missing_ok=True를 넘기면 없는 파일에 대해서도 조용히 통과한다. 디렉터리에 대해 호출하면 IsADirectoryError가 나므로 파일 전용으로 쓴다.
    tips:
      - missing_ok는 None이 아니라 boolean을 받으며 기본값은 False다.
      - 디렉터리는 unlink가 아닌 rmdir이나 shutil.rmtree로 처리해야 한다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "today.log"
          target.write_text("hi", encoding="utf-8")
          firstExists = target.exists()
          target.unlink(missing_ok=True)
          secondExists = target.exists()
          target.unlink(missing_ok=True)

      assert firstExists is True
      assert secondExists is False
      {"first": firstExists, "second": secondExists}
    exercise:
      prompt: cache.json 파일을 만든 뒤 unlink를 두 번 호출해도 두 번째 호출이 오류 없이 끝나는지 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "cache.json"
            target.write_text("{}", encoding="utf-8")
            firstExists = target.exists()
            target.unlink(missing_ok=___)
            secondExists = target.exists()
            target.unlink(missing_ok=___)

        assert firstExists is True
        assert secondExists is False
        {"first": firstExists, "second": secondExists}
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "cache.json"
            target.write_text("{}", encoding="utf-8")
            firstExists = target.exists()
            target.unlink(missing_ok=True)
            secondExists = target.exists()
            target.unlink(missing_ok=True)

        assert firstExists is True
        assert secondExists is False
        {"first": firstExists, "second": secondExists}
      hints:
        - 두 번째 unlink는 파일이 이미 없는데도 통과해야 한다.
        - missing_ok 인자에 True를 넘겨야 두 번째 호출이 멱등하게 끝난다.
      check:
        type: noError
        noError: unlink 두 번 호출이 FileNotFoundError 없이 끝나야 한다.
        resultCheck: firstExists는 True이고 secondExists는 False여야 한다.
    check:
      noError: 파일 생성, 첫 unlink, 두 번째 unlink가 차례로 끝나야 한다.
      resultCheck: firstExists와 secondExists 두 값이 본문 순서대로 True와 False여야 한다.
  - id: rmtree-folder
    title: 폴더 트리 한 번에 제거
    structuredPrimary: true
    subtitle: shutil.rmtree와 자식 포함 삭제
    goal: 자식 파일이 들어 있는 폴더를 한 번의 호출로 안전하게 제거한다.
    why: 격리 폴더나 임시 캐시 폴더처럼 정리할 자식이 여러 개인 경우 rmtree가 가장 단순하고 빠른 방법이다.
    explanation: shutil.rmtree는 인자로 받은 디렉터리와 그 자식을 모두 제거한다. ignore_errors=True를 주면 일부 항목이 사용 중이어도 통과한다. 자동화에서는 ignore_errors를 함부로 켜면 실패가 감춰지므로 기본값을 유지하고 필요한 경우에만 명시적으로 켠다.
    tips:
      - rmtree는 디렉터리만 받으며 파일에는 NotADirectoryError를 낸다.
      - 폴더가 없을 때 호출하면 FileNotFoundError가 나므로 사전에 exists 확인을 한다.
    snippet: |-
      import shutil
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          cache = base / "cache"
          (cache / "a").mkdir(parents=True)
          (cache / "a" / "1.txt").write_text("", encoding="utf-8")
          (cache / "b.log").write_text("", encoding="utf-8")
          beforeChildren = sorted(p.name for p in cache.rglob("*"))
          shutil.rmtree(cache)
          afterExists = cache.exists()

      assert beforeChildren == ["1.txt", "a", "b.log"]
      assert afterExists is False
      {"before": beforeChildren, "after": afterExists}
    exercise:
      prompt: temp 폴더 안에 sub 폴더와 keep.txt 파일을 만든 뒤 rmtree로 temp 전체를 제거해 빈 상태가 되는지 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            temp = base / "temp"
            (temp / "sub").mkdir(___=True)
            (temp / "sub" / "deep.txt").write_text("", encoding="utf-8")
            (temp / "keep.txt").write_text("", encoding="utf-8")
            beforeChildren = sorted(p.name for p in temp.rglob("*"))
            shutil.___(temp)
            afterExists = temp.exists()

        assert beforeChildren == ["deep.txt", "keep.txt", "sub"]
        assert afterExists is False
        {"before": beforeChildren, "after": afterExists}
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            temp = base / "temp"
            (temp / "sub").mkdir(parents=True)
            (temp / "sub" / "deep.txt").write_text("", encoding="utf-8")
            (temp / "keep.txt").write_text("", encoding="utf-8")
            beforeChildren = sorted(p.name for p in temp.rglob("*"))
            shutil.rmtree(temp)
            afterExists = temp.exists()

        assert beforeChildren == ["deep.txt", "keep.txt", "sub"]
        assert afterExists is False
        {"before": beforeChildren, "after": afterExists}
      hints:
        - parents=True를 주어야 한 번에 하위 폴더 트리가 만들어진다.
        - rmtree는 디렉터리 자체와 자식을 모두 지운다.
      check:
        type: noError
        noError: rmtree 호출이 PermissionError 없이 끝나야 한다.
        resultCheck: beforeChildren에 세 항목이 정렬된 상태로 들어 있고 afterExists는 False여야 한다.
    check:
      noError: 폴더 트리 생성과 rmtree 호출이 격리 공간에서 정상 끝나야 한다.
      resultCheck: rmtree 호출 후 cache 폴더가 더 이상 존재하지 않아야 한다.
  - id: quarantine-move
    title: 휴지통 대체 격리 폴더
    structuredPrimary: true
    subtitle: trash로 옮기는 회수 가능 패턴
    goal: 삭제 대신 trash 폴더로 이동시켜 자동화 실수에서 회복할 수 있는 안전 그물망을 만든다.
    why: 자동화가 실수로 중요한 파일을 지웠을 때 즉시 복구할 수 있는 길을 열어 두는 것이 실무에서 가장 큰 차이를 만든다.
    explanation: trash 폴더를 미리 만들어 두고 삭제 대신 그 폴더로 shutil.move를 호출한다. 이름이 충돌하면 timestamp 접두어로 회피한다. 일정 기간이 지난 trash 항목만 실제 삭제하는 정리 작업은 별도 스케줄에서 처리한다.
    tips:
      - 격리 폴더는 자동화 작업 폴더와 같은 디스크에 두는 편이 이동이 빠르다.
      - timestamp 접두어로 충돌을 회피하면 같은 이름이 여러 번 들어와도 안전하다.
    snippet: |-
      import shutil
      import tempfile
      import time
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          trash = base / "trash"
          trash.mkdir()
          victim = base / "draft.txt"
          victim.write_text("temporary", encoding="utf-8")
          tag = f"{int(time.time() * 1000)}_{victim.name}"
          moved = Path(shutil.move(victim, trash / tag))
          status = {"sourceGone": victim.exists(), "movedExists": moved.exists()}

      assert status == {"sourceGone": False, "movedExists": True}
      status
    exercise:
      prompt: temp.csv 파일을 trash 폴더로 옮기되 파일 이름 앞에 "backup_" 접두어를 붙여 새 이름이 backup_temp.csv가 되도록 검증하세요.
      starterCode: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            trash = base / "trash"
            trash.mkdir()
            victim = base / "temp.csv"
            victim.write_text("a,b", encoding="utf-8")
            newName = f"___{victim.name}"
            moved = Path(shutil.___(victim, trash / newName))
            status = {"sourceGone": victim.exists(), "movedExists": moved.exists(), "name": moved.name}

        assert status == {"sourceGone": False, "movedExists": True, "name": "backup_temp.csv"}
        status
      solution: |-
        import shutil
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            trash = base / "trash"
            trash.mkdir()
            victim = base / "temp.csv"
            victim.write_text("a,b", encoding="utf-8")
            newName = f"backup_{victim.name}"
            moved = Path(shutil.move(victim, trash / newName))
            status = {"sourceGone": victim.exists(), "movedExists": moved.exists(), "name": moved.name}

        assert status == {"sourceGone": False, "movedExists": True, "name": "backup_temp.csv"}
        status
      hints:
        - 접두어 문자열이 backup_이어야 최종 이름이 backup_temp.csv가 된다.
        - shutil.move는 결과 경로를 문자열로 돌려주므로 Path로 감싸야 .name이 가능하다.
      check:
        type: noError
        noError: shutil.move 호출이 FileExistsError 없이 끝나야 한다.
        resultCheck: status 딕셔너리에서 name 키가 backup_temp.csv이고 원본은 사라진 상태여야 한다.
    check:
      noError: trash 폴더 생성과 victim 이동이 격리 공간에서 정상 처리되어야 한다.
      resultCheck: moved 경로가 trash 폴더 아래에 새 이름으로 존재해야 한다.
  - id: dry-run-summary
    title: 드라이런 종합 정리
    structuredPrimary: true
    subtitle: 미리 보기 후 한 번에 처리
    goal: 삭제 대상을 dry-run 모드로 먼저 모아 보여 주고 사용자가 확인한 뒤에만 실제 작업을 수행한다.
    why: 자동화가 한 번에 많은 파일을 지우기 전에 사람이 확인할 수 있는 미리 보기를 항상 두는 것이 사고를 막는 가장 단순한 방법이다.
    explanation: 마지막 섹션은 dry-run 옵션을 가진 작은 함수를 만든다. 패턴에 매칭되는 파일을 모은 뒤 dry_run=True면 후보 리스트만 돌려준다. False로 호출하면 실제로 삭제하거나 trash로 옮긴다. 종합 결과 dict는 다음 자동화 단계에 그대로 입력으로 넘길 수 있다.
    tips:
      - dry_run 모드는 항상 같은 후보 리스트를 만들어야 사용자가 신뢰할 수 있다.
      - 실제 작업 단계에서는 후보 리스트만 처리해 새로운 파일이 들어와도 안전하다.
    snippet: |-
      import tempfile
      from pathlib import Path


      def planCleanup(base: Path, pattern: str, dryRun: bool) -> dict:
          candidates = sorted(p.relative_to(base).as_posix() for p in base.rglob(pattern))
          removed = []
          if not dryRun:
              for relative in candidates:
                  (base / relative).unlink(missing_ok=True)
                  removed.append(relative)
          return {"candidates": candidates, "removed": removed}


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          (base / "logs").mkdir()
          (base / "logs" / "today.log").write_text("", encoding="utf-8")
          (base / "logs" / "stale.log").write_text("", encoding="utf-8")
          preview = planCleanup(base, "*.log", dryRun=True)
          applied = planCleanup(base, "*.log", dryRun=False)

      assert preview == {"candidates": ["logs/stale.log", "logs/today.log"], "removed": []}
      assert applied["removed"] == ["logs/stale.log", "logs/today.log"]
      {"preview": preview, "applied": applied}
    exercise:
      prompt: planCleanup을 ".tmp" 패턴으로 호출해 같은 폴더의 임시 파일 두 개에 대해 dry-run 결과와 실제 삭제 결과를 종합 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path


        def planCleanup(base: Path, pattern: str, dryRun: bool) -> dict:
            candidates = sorted(p.relative_to(base).as_posix() for p in base.rglob(pattern))
            removed = []
            if not dryRun:
                for relative in candidates:
                    (base / relative).unlink(missing_ok=True)
                    removed.append(relative)
            return {"candidates": candidates, "removed": removed}


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "cache").mkdir()
            (base / "cache" / "a.tmp").write_text("", encoding="utf-8")
            (base / "cache" / "b.tmp").write_text("", encoding="utf-8")
            preview = planCleanup(base, "*.___", dryRun=True)
            applied = planCleanup(base, "*.tmp", dryRun=___)

        assert preview == {"candidates": ["cache/a.tmp", "cache/b.tmp"], "removed": []}
        assert applied["removed"] == ["cache/a.tmp", "cache/b.tmp"]
        {"preview": preview, "applied": applied}
      solution: |-
        import tempfile
        from pathlib import Path


        def planCleanup(base: Path, pattern: str, dryRun: bool) -> dict:
            candidates = sorted(p.relative_to(base).as_posix() for p in base.rglob(pattern))
            removed = []
            if not dryRun:
                for relative in candidates:
                    (base / relative).unlink(missing_ok=True)
                    removed.append(relative)
            return {"candidates": candidates, "removed": removed}


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            (base / "cache").mkdir()
            (base / "cache" / "a.tmp").write_text("", encoding="utf-8")
            (base / "cache" / "b.tmp").write_text("", encoding="utf-8")
            preview = planCleanup(base, "*.tmp", dryRun=True)
            applied = planCleanup(base, "*.tmp", dryRun=False)

        assert preview == {"candidates": ["cache/a.tmp", "cache/b.tmp"], "removed": []}
        assert applied["removed"] == ["cache/a.tmp", "cache/b.tmp"]
        {"preview": preview, "applied": applied}
      hints:
        - 첫 호출은 dryRun=True로 후보만 모으고 실제 삭제는 두 번째 호출에서 진행한다.
        - 패턴은 두 호출 모두 *.tmp로 같은 문자열을 넘겨야 종합 결과가 일치한다.
      check:
        type: noError
        noError: planCleanup 두 번 호출이 PermissionError 없이 끝나야 한다.
        resultCheck: preview는 candidates만 채우고 applied는 removed에 두 경로가 모두 담겨야 한다.
    check:
      noError: 함수 정의와 dry-run, 실행 호출이 격리 공간에서 끝나야 한다.
      resultCheck: 종합 결과 dict가 candidates와 removed를 모두 같은 두 경로로 채워야 한다.
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
  - id: fileOps_05-safe-delete-plan-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - unlink-once
    - dry-run-summary
    title: 삭제 대상을 quarantine로 이동하는 안전 계획 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 허용 root·보존 기간·manifest가 있는 경우에만 삭제 후보를 준비한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 바로 unlink하지 말고 quarantine 이동과 보존 기간을 먼저 적용하세요.
    - 열려 있는 파일과 허용 root 밖 path는 삭제 계획에서 제외하세요.
    exercise:
      prompt: plan_safe_delete(items, allowed_root, quarantine_root, retention_days)를 완성하세요.
      starterCode: |-
        def plan_safe_delete(items, allowed_root, quarantine_root, retention_days):
            raise NotImplementedError
      solution: |
        def plan_safe_delete(items, allowed_root, quarantine_root, retention_days):
            if retention_days <= 0:
                raise ValueError("retention must be positive")
            accepted = []
            rejected = []
            prefix = allowed_root.rstrip("/") + "/"
            for item in items:
                if not item["path"].startswith(prefix):
                    rejected.append({"path": item["path"], "reason": "root"})
                elif item.get("open", False):
                    rejected.append({"path": item["path"], "reason": "open-file"})
                else:
                    destination = quarantine_root.rstrip("/") + "/" + item["path"][len(prefix) :]
                    accepted.append({"source": item["path"], "quarantine": destination, "hash": item["hash"]})
            return {"ready": not rejected, "moves": accepted, "rejected": rejected, "retentionDays": retention_days}
      hints: *id001
    check:
      id: python.fileops.fileOps_05.safe-delete-plan.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_05.safe-delete-plan.mastery.behavior.v1.fixture
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
        entry: plan_safe_delete
        cases:
        - id: plans-quarantine-move
          arguments:
          - value:
            - path: /root/old.txt
              hash: abc
              open: false
          - value: /root
          - value: /trash
          - value: 30
          expectedReturn:
            ready: true
            moves:
            - source: /root/old.txt
              quarantine: /trash/old.txt
              hash: abc
            rejected: []
            retentionDays: 30
        - id: rejects-outside-and-open-files
          arguments:
          - value:
            - path: /other/x
              hash: x
            - path: /root/open
              hash: o
              open: true
          - value: /root
          - value: /trash
          - value: 7
          expectedReturn:
            ready: false
            moves: []
            rejected:
            - path: /other/x
              reason: root
            - path: /root/open
              reason: open-file
            retentionDays: 7
        - id: rejects-zero-retention
          arguments:
          - value: []
          - value: /root
          - value: /trash
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: fileOps_05-quarantine-purge-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_05-safe-delete-plan-mastery
    title: 새 quarantine purge에 보존 기간·승인·hash 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 만료되고 manifest hash가 일치하며 승인된 항목만 영구 삭제한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 영구 삭제는 학습 확인 클릭과 달리 명시적 안전 승인이 필요합니다.
    - quarantine 이후 변경된 파일은 manifest hash 불일치로 purge를 막으세요.
    exercise:
      prompt: authorize_quarantine_purge(items, now_day, approved_ids)를 완성하세요.
      starterCode: |-
        def authorize_quarantine_purge(items, now_day, approved_ids):
            raise NotImplementedError
      solution: |
        def authorize_quarantine_purge(items, now_day, approved_ids):
            approved = set(approved_ids)
            purge = []
            blocked = []
            for item in items:
                reasons = []
                if item["id"] not in approved:
                    reasons.append("approval")
                if item["purgeAfterDay"] > now_day:
                    reasons.append("retention")
                if item.get("currentHash") != item.get("manifestHash"):
                    reasons.append("hash")
                if reasons:
                    blocked.append({"id": item["id"], "reasons": reasons})
                else:
                    purge.append(item["id"])
            return {"authorized": purge, "blocked": blocked}
      hints: *id002
    check:
      id: python.fileops.fileOps_05.quarantine-purge-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_05.quarantine-purge-audit.transfer.behavior.v1.fixture
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
        entry: authorize_quarantine_purge
        cases:
        - id: authorizes-expired-approved-item
          arguments:
          - value:
            - id: a
              purgeAfterDay: 10
              currentHash: x
              manifestHash: x
          - value: 10
          - value:
            - a
          expectedReturn:
            authorized:
            - a
            blocked: []
        - id: reports-all-blocking-reasons
          arguments:
          - value:
            - id: a
              purgeAfterDay: 20
              currentHash: y
              manifestHash: x
          - value: 10
          - value: []
          expectedReturn:
            authorized: []
            blocked:
            - id: a
              reasons:
              - approval
              - retention
              - hash
        - id: separates-authorized-and-blocked
          arguments:
          - value:
            - id: a
              purgeAfterDay: 1
              currentHash: x
              manifestHash: x
            - id: b
              purgeAfterDay: 1
              currentHash: x
              manifestHash: x
          - value: 2
          - value:
            - a
          expectedReturn:
            authorized:
            - a
            blocked:
            - id: b
              reasons:
              - approval
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: fileOps_05-safe-delete-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_05-quarantine-purge-audit-transfer
    title: 안전 삭제 단계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: quarantine·retention·purge 승인 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 파일 action 전에 root·충돌·dry run 계약을 확인하세요.
    - 실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.
    exercise:
      prompt: choose_safe_delete_policy(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_safe_delete_policy(situation):
            raise NotImplementedError
      solution: |
        def choose_safe_delete_policy(situation):
            table = {'prepare': {'action': 'validate root and open state', 'evidence': 'candidate descriptor', 'risk': 'wrong file'}, 'quarantine': {'action': 'move and record hash', 'evidence': 'reversible manifest', 'risk': 'lost recovery'}, 'purge': {'action': 'require expiry hash and approval', 'evidence': 'purge authorization', 'risk': 'irreversible deletion'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.fileops.fileOps_05.safe-delete-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_05.safe-delete-recall.retrieval.behavior.v1.fixture
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
        entry: choose_safe_delete_policy
        cases:
        - id: recalls-prepare
          arguments:
          - value: prepare
          expectedReturn:
            action: validate root and open state
            evidence: candidate descriptor
            risk: wrong file
        - id: recalls-quarantine
          arguments:
          - value: quarantine
          expectedReturn:
            action: move and record hash
            evidence: reversible manifest
            risk: lost recovery
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};