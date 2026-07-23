var e=`meta:
  id: fileOps_09
  title: 파일 메타데이터 다루기
  order: 9
  category: fileOps
  difficulty: easy
  audience: 파일 자동화에 입문하는 Python 학습자
  packages: []
  tags:
    - stat
    - datetime
    - permissions
intro:
  direction: tempfile 격리 폴더에서 Path.stat로 크기, 수정 시각, 권한을 읽어 자동화 리포트에 그대로 들어갈 메타데이터 dict를 만든다.
  benefits:
    - st_size로 파일 크기를 정확히 측정한다.
    - st_mtime을 datetime으로 변환해 사람이 읽을 수 있게 만든다.
    - st_mode와 stat 모듈 상수로 권한 비트를 확인한다.
    - 한 파일의 종합 메타데이터를 dict로 묶어 자동화 리포트에 사용한다.
  diagram:
    steps:
      - label: stat 호출과 크기
        detail: Path.stat을 호출해 st_size로 바이트 단위 크기를 받는다.
      - label: 수정 시각 변환
        detail: st_mtime을 datetime.fromtimestamp로 사람이 읽는 형태로 바꾼다.
      - label: 권한 비트 확인
        detail: stat.S_ISREG와 oct로 모드 비트를 직접 들여다본다.
      - label: 종합 dict 구성
        detail: 한 파일의 모든 메타데이터를 자동화 리포트용 dict로 묶는다.
    runtime:
      - label: 표준 라이브러리만
        detail: pathlib, tempfile, stat, datetime만 사용한다.
      - label: assert 기반 검증
        detail: 크기, 시각, 모드를 assert로 비교해 메타데이터 신뢰성을 확인한다.
sections:
  - id: file-size
    title: 파일 크기 측정
    structuredPrimary: true
    subtitle: stat.st_size 정확도
    goal: 작성한 파일이 디스크에서 차지하는 바이트 수를 stat으로 정확히 측정한다.
    why: 자동화 리포트의 크기 통계는 운영 의사결정에 자주 사용되므로 항상 정확한 값을 받는 방법을 확실히 알아야 한다.
    explanation: Path.stat은 os.stat 결과를 그대로 돌려준다. st_size는 일반 파일에서 바이트 수, 디렉터리에서는 파일 시스템에 따라 다른 값일 수 있다. 텍스트 파일에서는 인코딩에 따라 한 글자가 여러 바이트일 수 있어 길이와 다를 수 있다.
    tips:
      - "한글 한 글자는 utf-8에서 3바이트 또는 4바이트가 된다."
      - st_size는 캐시 없이 항상 실시간 값을 반환하므로 빠르다.
    snippet: |-
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "data.bin"
          target.write_bytes(b"abcdefgh")
          size = target.stat().st_size

      assert size == 8
      size
    exercise:
      prompt: notes.txt 파일에 utf-8로 "안녕"을 저장하고 stat.st_size가 6바이트인지 검증하세요.
      starterCode: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "notes.txt"
            target.write_text("___", encoding="utf-8")
            size = target.stat().___

        assert size == 6
        size
      solution: |-
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "notes.txt"
            target.write_text("안녕", encoding="utf-8")
            size = target.stat().st_size

        assert size == 6
        size
      hints:
        - 한글 한 글자가 utf-8에서 3바이트이므로 두 글자는 6바이트가 된다.
        - stat 객체의 속성 이름은 st_size다.
      check:
        type: noError
        noError: write_text와 stat 호출이 IOError 없이 끝나야 한다.
        resultCheck: size 변수가 정확히 6이어야 한다.
    check:
      noError: 바이트 쓰기와 stat 조회가 순서대로 끝나야 한다.
      resultCheck: size 변수가 저장한 바이트 길이와 같은 8이어야 한다.
  - id: mtime-datetime
    title: 수정 시각을 사람이 읽기
    structuredPrimary: true
    subtitle: datetime.fromtimestamp 변환
    goal: stat의 timestamp를 사람이 읽을 수 있는 ISO 문자열로 바꾼다.
    why: 자동화 리포트에서 사용자가 직접 보는 시각은 timestamp보다 ISO 형식이 훨씬 직관적이다.
    explanation: datetime.fromtimestamp는 초 단위 timestamp를 로컬 datetime 객체로 바꾼다. timezone을 명시하면 UTC 기반으로 일관된 보고를 만들 수 있다. isoformat은 표준 ISO 8601 문자열을 돌려주며 파일 이름에 그대로 쓸 수도 있다.
    tips:
      - 자동화 보고에는 UTC를 쓰는 편이 다른 머신과 비교하기 쉽다.
      - isoformat은 timespec 인자로 초 단위까지 잘라 출력 형식을 통일할 수 있다.
    snippet: |-
      import os
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "log.txt"
          target.write_text("hi", encoding="utf-8")
          os.utime(target, (1_700_000_000, 1_700_000_000))
          modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")

      assert modified == "2023-11-14T22:13:20+00:00"
      modified
    exercise:
      prompt: 같은 흐름으로 mtime을 1_710_000_000 초로 맞춘 뒤 ISO 문자열이 "2024-03-09T16:00:00+00:00"으로 나오는지 검증하세요.
      starterCode: |-
        import os
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "log.txt"
            target.write_text("hi", encoding="utf-8")
            os.utime(target, (___, ___))
            modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")

        assert modified == "2024-03-09T16:00:00+00:00"
        modified
      solution: |-
        import os
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "log.txt"
            target.write_text("hi", encoding="utf-8")
            os.utime(target, (1_710_000_000, 1_710_000_000))
            modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")

        assert modified == "2024-03-09T16:00:00+00:00"
        modified
      hints:
        - os.utime의 두 번째 인자는 (atime, mtime) 두 값을 같은 timestamp로 채워야 한다.
        - 1_710_000_000은 2024-03-09T15:00:00Z를 가리키는 epoch 초다.
      check:
        type: noError
        noError: datetime.fromtimestamp 호출과 ISO 변환이 끝나야 한다.
        resultCheck: modified 문자열이 본문에서 지정한 ISO 형식과 정확히 같아야 한다.
    check:
      noError: utime과 isoformat 호출이 한 흐름에서 끝나야 한다.
      resultCheck: modified 문자열이 1_700_000_000 epoch에 해당하는 UTC ISO 표현과 같아야 한다.
  - id: permission-bits
    title: 권한 비트 살펴보기
    structuredPrimary: true
    subtitle: stat.S_ISREG와 oct
    goal: 파일이 일반 파일인지 확인하고 권한 비트를 8진수로 읽어 자동화 점검 지표를 만든다.
    why: 자동화 시스템은 잘못된 권한 때문에 갑자기 실패할 수 있어서 파일 종류와 모드 비트를 사전에 점검하면 사고가 줄어든다.
    explanation: stat 모듈은 S_ISREG, S_ISDIR 같은 헬퍼와 S_IMODE 함수를 제공한다. Path.stat().st_mode를 stat.S_IMODE에 통과시키면 권한 비트만 남는다. oct로 출력하면 0o644 같은 표준 표기가 된다.
    tips:
      - Windows에서는 권한 비트가 제한적으로 노출되지만 함수 호출 자체는 동작한다.
      - 권한 변경은 Path.chmod를 사용하며 0o644 같은 8진수 리터럴로 표현한다.
    snippet: |-
      import stat
      import tempfile
      from pathlib import Path

      with tempfile.TemporaryDirectory() as td:
          target = Path(td) / "rules.txt"
          target.write_text("r", encoding="utf-8")
          target.chmod(0o644)
          info = {
              "isFile": stat.S_ISREG(target.stat().st_mode),
              "mode": oct(stat.S_IMODE(target.stat().st_mode)),
          }

      assert info["isFile"] is True
      assert info["mode"].endswith("644") or info["mode"].endswith("666")
      info
    exercise:
      prompt: 같은 파일에 chmod(0o600)을 적용한 뒤 mode 문자열이 600 또는 666으로 끝나는지 검증하세요.
      starterCode: |-
        import stat
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "rules.txt"
            target.write_text("r", encoding="utf-8")
            target.chmod(___)
            info = {
                "isFile": stat.S_ISREG(target.stat().st_mode),
                "mode": oct(stat.S_IMODE(target.stat().st_mode)),
            }

        assert info["isFile"] is True
        assert info["mode"].endswith("600") or info["mode"].endswith("666")
        info
      solution: |-
        import stat
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "rules.txt"
            target.write_text("r", encoding="utf-8")
            target.chmod(0o600)
            info = {
                "isFile": stat.S_ISREG(target.stat().st_mode),
                "mode": oct(stat.S_IMODE(target.stat().st_mode)),
            }

        assert info["isFile"] is True
        assert info["mode"].endswith("600") or info["mode"].endswith("666")
        info
      hints:
        - chmod 인자는 0o로 시작하는 8진수 리터럴로 적는다.
        - Windows에서는 666처럼 다른 값이 나올 수 있어 endswith 두 가지를 함께 허용한다.
      check:
        type: noError
        noError: chmod와 stat 호출이 PermissionError 없이 끝나야 한다.
        resultCheck: info 딕셔너리의 isFile이 True이고 mode가 600 또는 666으로 끝나야 한다.
    check:
      noError: chmod와 stat.S_IMODE 호출이 끝나야 한다.
      resultCheck: info의 isFile이 True이고 mode 문자열이 권한 비트를 8진수로 표시해야 한다.
  - id: combined-record
    title: 메타데이터 종합 정리
    structuredPrimary: true
    subtitle: 자동화 리포트 표준 dict
    goal: 한 파일의 크기, mtime, 모드, 절대 경로를 한 dict로 묶어 다음 자동화 단계의 표준 입력으로 만든다.
    why: 자동화 리포트는 항상 같은 키 구조를 가져야 후속 단계에서 변경에 흔들리지 않는다.
    explanation: 마지막 섹션은 앞 세 섹션 결과를 한 함수로 합쳐 자동화 리포트의 한 행을 만든다. dict 키 이름은 size, modifiedAt, mode, path로 고정해 다른 자동화 코드가 같은 이름을 신뢰할 수 있다. 종합 정리 결과는 폴더 단위 리포트로 확장하기 쉽다.
    tips:
      - 키 이름을 영문 카멜케이스로 통일하면 다른 자동화 코드와 호환이 좋다.
      - mode 키는 사람이 읽을 수 있는 8진수 문자열로 보관한다.
    snippet: |-
      import os
      import stat
      import tempfile
      from datetime import UTC, datetime
      from pathlib import Path


      def describeFile(path: Path) -> dict:
          info = path.stat()
          return {
              "path": str(path.resolve()),
              "size": info.st_size,
              "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),
              "mode": oct(stat.S_IMODE(info.st_mode)),
          }


      with tempfile.TemporaryDirectory() as td:
          base = Path(td)
          target = base / "summary.txt"
          target.write_text("done", encoding="utf-8")
          os.utime(target, (1_700_000_000, 1_700_000_000))
          target.chmod(0o644)
          record = describeFile(target)

      assert record["size"] == 4
      assert record["modifiedAt"] == "2023-11-14T22:13:20+00:00"
      assert record["mode"].endswith("644") or record["mode"].endswith("666")
      record
    exercise:
      prompt: describeFile을 호출해 final.txt 파일이 크기 5바이트, ISO 시각 "2024-03-09T16:00:00+00:00", 모드 600 또는 666인지 종합 검증하세요.
      starterCode: |-
        import os
        import stat
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def describeFile(path: Path) -> dict:
            info = path.stat()
            return {
                "path": str(path.resolve()),
                "size": info.st_size,
                "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),
                "mode": oct(stat.S_IMODE(info.st_mode)),
            }


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            target = base / "final.txt"
            target.write_text("___", encoding="utf-8")
            os.utime(target, (1_710_000_000, 1_710_000_000))
            target.chmod(___)
            record = describeFile(target)

        assert record["size"] == 5
        assert record["modifiedAt"] == "2024-03-09T16:00:00+00:00"
        assert record["mode"].endswith("600") or record["mode"].endswith("666")
        record
      solution: |-
        import os
        import stat
        import tempfile
        from datetime import UTC, datetime
        from pathlib import Path


        def describeFile(path: Path) -> dict:
            info = path.stat()
            return {
                "path": str(path.resolve()),
                "size": info.st_size,
                "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),
                "mode": oct(stat.S_IMODE(info.st_mode)),
            }


        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            target = base / "final.txt"
            target.write_text("close", encoding="utf-8")
            os.utime(target, (1_710_000_000, 1_710_000_000))
            target.chmod(0o600)
            record = describeFile(target)

        assert record["size"] == 5
        assert record["modifiedAt"] == "2024-03-09T16:00:00+00:00"
        assert record["mode"].endswith("600") or record["mode"].endswith("666")
        record
      hints:
        - 길이 5짜리 문자열을 저장하면 size 키가 5가 된다.
        - 0o600을 chmod 인자로 넘기면 모드 문자열이 600으로 끝난다.
      check:
        type: noError
        noError: describeFile 함수 호출과 utime, chmod가 격리 공간에서 끝나야 한다.
        resultCheck: record 딕셔너리의 size, modifiedAt, mode 세 값이 종합 조건을 모두 만족해야 한다.
    check:
      noError: describeFile 호출과 stat, datetime 변환이 한 흐름에서 끝나야 한다.
      resultCheck: record 딕셔너리가 path, size, modifiedAt, mode 네 키를 모두 채우고 본문 기대값과 같아야 한다.
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
  - id: fileOps_09-file-metadata-descriptor-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - file-size
    - combined-record
    title: 파일 metadata를 portable artifact descriptor로 정규화하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: path·kind·size·modified time·content hash·mode를 검증 가능한 구조로 만든다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - artifact path는 root 상대 identity로 저장하세요.
    - modified time만이 아니라 content hash와 byte length를 함께 기록하세요.
    exercise:
      prompt: normalize_file_metadata(metadata, root)를 완성하세요.
      starterCode: |-
        def normalize_file_metadata(metadata, root):
            raise NotImplementedError
      solution: |
        def normalize_file_metadata(metadata, root):
            from pathlib import PurePosixPath
            path = PurePosixPath(metadata["path"])
            try:
                relative = path.relative_to(PurePosixPath(root)).as_posix()
            except ValueError as error:
                raise ValueError("path outside root") from error
            if metadata.get("size", -1) < 0 or not metadata.get("contentHash"):
                raise ValueError("invalid metadata")
            return {"path": relative, "kind": metadata.get("kind", "file"), "byteLength": metadata["size"], "modifiedNs": metadata["modifiedNs"], "contentHash": metadata["contentHash"], "mode": metadata.get("mode")}
      hints: *id001
    check:
      id: python.fileops.fileOps_09.file-metadata-descriptor.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_09.file-metadata-descriptor.mastery.behavior.v1.fixture
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
        entry: normalize_file_metadata
        cases:
        - id: normalizes-relative-descriptor
          arguments:
          - value:
              path: /root/sub/a.txt
              size: 5
              modifiedNs: 10
              contentHash: abc
              mode: '0644'
          - value: /root
          expectedReturn:
            path: sub/a.txt
            kind: file
            byteLength: 5
            modifiedNs: 10
            contentHash: abc
            mode: '0644'
        - id: preserves-explicit-kind
          arguments:
          - value:
              path: /root/folder
              kind: directory
              size: 0
              modifiedNs: 1
              contentHash: tree
          - value: /root
          expectedReturn:
            path: folder
            kind: directory
            byteLength: 0
            modifiedNs: 1
            contentHash: tree
            mode: null
        - id: rejects-outside-root
          arguments:
          - value:
              path: /other/a
              size: 1
              modifiedNs: 1
              contentHash: x
          - value: /root
          expectedException: ValueError
        - id: rejects-negative-size
          arguments:
          - value:
              path: /root/a
              size: -1
              modifiedNs: 1
              contentHash: x
          - value: /root
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: fileOps_09-metadata-policy-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_09-file-metadata-descriptor-mastery
    title: 새 artifact metadata에 크기·나이·permission 정책 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 정책 위반을 path별 사유로 분리한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - metadata 정책의 threshold를 report와 함께 보존하세요.
    - 한 파일의 복수 위반 사유를 첫 번째 하나로 숨기지 마세요.
    exercise:
      prompt: audit_metadata_policy(items, now_ns, policy)를 완성하세요.
      starterCode: |-
        def audit_metadata_policy(items, now_ns, policy):
            raise NotImplementedError
      solution: |
        def audit_metadata_policy(items, now_ns, policy):
            violations = []
            for item in items:
                reasons = []
                if item["byteLength"] > policy["maximumBytes"]:
                    reasons.append("size")
                if now_ns - item["modifiedNs"] > policy["maximumAgeNs"]:
                    reasons.append("age")
                if item.get("mode") in policy.get("blockedModes", []):
                    reasons.append("mode")
                if reasons:
                    violations.append({"path": item["path"], "reasons": reasons})
            return {"accepted": not violations, "violations": violations, "itemCount": len(items)}
      hints: *id002
    check:
      id: python.fileops.fileOps_09.metadata-policy-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_09.metadata-policy-audit.transfer.behavior.v1.fixture
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
        entry: audit_metadata_policy
        cases:
        - id: accepts-within-policy
          arguments:
          - value:
            - path: a
              byteLength: 10
              modifiedNs: 90
              mode: '0644'
          - value: 100
          - value:
              maximumBytes: 20
              maximumAgeNs: 20
              blockedModes:
              - '0777'
          expectedReturn:
            accepted: true
            violations: []
            itemCount: 1
        - id: reports-size-age-and-mode
          arguments:
          - value:
            - path: a
              byteLength: 30
              modifiedNs: 50
              mode: '0777'
          - value: 100
          - value:
              maximumBytes: 20
              maximumAgeNs: 20
              blockedModes:
              - '0777'
          expectedReturn:
            accepted: false
            violations:
            - path: a
              reasons:
              - size
              - age
              - mode
            itemCount: 1
        - id: handles-empty-items
          arguments:
          - value: []
          - value: 100
          - value:
              maximumBytes: 1
              maximumAgeNs: 1
          expectedReturn:
            accepted: true
            violations: []
            itemCount: 0
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: fileOps_09-file-metadata-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - fileOps_09-metadata-policy-audit-transfer
    title: 파일 metadata 활용 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: identity·변경·정책 판정 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 파일 action 전에 root·충돌·dry run 계약을 확인하세요.
    - 실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.
    exercise:
      prompt: choose_metadata_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_metadata_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_metadata_evidence(situation):
            table = {'identity': {'action': 'record relative path size and hash', 'evidence': 'artifact descriptor', 'risk': 'absolute path leakage'}, 'change': {'action': 'compare content hash', 'evidence': 'before after descriptors', 'risk': 'mtime-only decision'}, 'policy': {'action': 'audit size age and mode', 'evidence': 'path reasons thresholds', 'risk': 'hidden permission issue'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.fileops.fileOps_09.file-metadata-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.fileops.fileOps_09.file-metadata-recall.retrieval.behavior.v1.fixture
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
        entry: choose_metadata_evidence
        cases:
        - id: recalls-identity
          arguments:
          - value: identity
          expectedReturn:
            action: record relative path size and hash
            evidence: artifact descriptor
            risk: absolute path leakage
        - id: recalls-change
          arguments:
          - value: change
          expectedReturn:
            action: compare content hash
            evidence: before after descriptors
            risk: mtime-only decision
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};