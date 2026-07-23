var e=`meta:\r
  id: fileOps_09\r
  title: 파일 메타데이터 다루기\r
  order: 9\r
  category: fileOps\r
  difficulty: easy\r
  audience: 파일 자동화에 입문하는 Python 학습자\r
  packages: []\r
  tags:\r
    - stat\r
    - datetime\r
    - permissions\r
intro:\r
  direction: tempfile 격리 폴더에서 Path.stat로 크기, 수정 시각, 권한을 읽어 자동화 리포트에 그대로 들어갈 메타데이터 dict를 만든다.\r
  benefits:\r
    - st_size로 파일 크기를 정확히 측정한다.\r
    - st_mtime을 datetime으로 변환해 사람이 읽을 수 있게 만든다.\r
    - st_mode와 stat 모듈 상수로 권한 비트를 확인한다.\r
    - 한 파일의 종합 메타데이터를 dict로 묶어 자동화 리포트에 사용한다.\r
  diagram:\r
    steps:\r
      - label: stat 호출과 크기\r
        detail: Path.stat을 호출해 st_size로 바이트 단위 크기를 받는다.\r
      - label: 수정 시각 변환\r
        detail: st_mtime을 datetime.fromtimestamp로 사람이 읽는 형태로 바꾼다.\r
      - label: 권한 비트 확인\r
        detail: stat.S_ISREG와 oct로 모드 비트를 직접 들여다본다.\r
      - label: 종합 dict 구성\r
        detail: 한 파일의 모든 메타데이터를 자동화 리포트용 dict로 묶는다.\r
    runtime:\r
      - label: 표준 라이브러리만\r
        detail: pathlib, tempfile, stat, datetime만 사용한다.\r
      - label: assert 기반 검증\r
        detail: 크기, 시각, 모드를 assert로 비교해 메타데이터 신뢰성을 확인한다.\r
sections:\r
  - id: file-size\r
    title: 파일 크기 측정\r
    structuredPrimary: true\r
    subtitle: stat.st_size 정확도\r
    goal: 작성한 파일이 디스크에서 차지하는 바이트 수를 stat으로 정확히 측정한다.\r
    why: 자동화 리포트의 크기 통계는 운영 의사결정에 자주 사용되므로 항상 정확한 값을 받는 방법을 확실히 알아야 한다.\r
    explanation: Path.stat은 os.stat 결과를 그대로 돌려준다. st_size는 일반 파일에서 바이트 수, 디렉터리에서는 파일 시스템에 따라 다른 값일 수 있다. 텍스트 파일에서는 인코딩에 따라 한 글자가 여러 바이트일 수 있어 길이와 다를 수 있다.\r
    tips:\r
      - "한글 한 글자는 utf-8에서 3바이트 또는 4바이트가 된다."\r
      - st_size는 캐시 없이 항상 실시간 값을 반환하므로 빠르다.\r
    snippet: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      with tempfile.TemporaryDirectory() as td:\r
          target = Path(td) / "data.bin"\r
          target.write_bytes(b"abcdefgh")\r
          size = target.stat().st_size\r
\r
      assert size == 8\r
      size\r
    exercise:\r
      prompt: notes.txt 파일에 utf-8로 "안녕"을 저장하고 stat.st_size가 6바이트인지 검증하세요.\r
      starterCode: |-\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "notes.txt"\r
            target.write_text("___", encoding="utf-8")\r
            size = target.stat().___\r
\r
        assert size == 6\r
        size\r
      solution: |-\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "notes.txt"\r
            target.write_text("안녕", encoding="utf-8")\r
            size = target.stat().st_size\r
\r
        assert size == 6\r
        size\r
      hints:\r
        - 한글 한 글자가 utf-8에서 3바이트이므로 두 글자는 6바이트가 된다.\r
        - stat 객체의 속성 이름은 st_size다.\r
      check:\r
        type: noError\r
        noError: write_text와 stat 호출이 IOError 없이 끝나야 한다.\r
        resultCheck: size 변수가 정확히 6이어야 한다.\r
    check:\r
      noError: 바이트 쓰기와 stat 조회가 순서대로 끝나야 한다.\r
      resultCheck: size 변수가 저장한 바이트 길이와 같은 8이어야 한다.\r
  - id: mtime-datetime\r
    title: 수정 시각을 사람이 읽기\r
    structuredPrimary: true\r
    subtitle: datetime.fromtimestamp 변환\r
    goal: stat의 timestamp를 사람이 읽을 수 있는 ISO 문자열로 바꾼다.\r
    why: 자동화 리포트에서 사용자가 직접 보는 시각은 timestamp보다 ISO 형식이 훨씬 직관적이다.\r
    explanation: datetime.fromtimestamp는 초 단위 timestamp를 로컬 datetime 객체로 바꾼다. timezone을 명시하면 UTC 기반으로 일관된 보고를 만들 수 있다. isoformat은 표준 ISO 8601 문자열을 돌려주며 파일 이름에 그대로 쓸 수도 있다.\r
    tips:\r
      - 자동화 보고에는 UTC를 쓰는 편이 다른 머신과 비교하기 쉽다.\r
      - isoformat은 timespec 인자로 초 단위까지 잘라 출력 형식을 통일할 수 있다.\r
    snippet: |-\r
      import os\r
      import tempfile\r
      from datetime import UTC, datetime\r
      from pathlib import Path\r
\r
      with tempfile.TemporaryDirectory() as td:\r
          target = Path(td) / "log.txt"\r
          target.write_text("hi", encoding="utf-8")\r
          os.utime(target, (1_700_000_000, 1_700_000_000))\r
          modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")\r
\r
      assert modified == "2023-11-14T22:13:20+00:00"\r
      modified\r
    exercise:\r
      prompt: 같은 흐름으로 mtime을 1_710_000_000 초로 맞춘 뒤 ISO 문자열이 "2024-03-09T16:00:00+00:00"으로 나오는지 검증하세요.\r
      starterCode: |-\r
        import os\r
        import tempfile\r
        from datetime import UTC, datetime\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "log.txt"\r
            target.write_text("hi", encoding="utf-8")\r
            os.utime(target, (___, ___))\r
            modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")\r
\r
        assert modified == "2024-03-09T16:00:00+00:00"\r
        modified\r
      solution: |-\r
        import os\r
        import tempfile\r
        from datetime import UTC, datetime\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "log.txt"\r
            target.write_text("hi", encoding="utf-8")\r
            os.utime(target, (1_710_000_000, 1_710_000_000))\r
            modified = datetime.fromtimestamp(target.stat().st_mtime, tz=UTC).isoformat(timespec="seconds")\r
\r
        assert modified == "2024-03-09T16:00:00+00:00"\r
        modified\r
      hints:\r
        - os.utime의 두 번째 인자는 (atime, mtime) 두 값을 같은 timestamp로 채워야 한다.\r
        - 1_710_000_000은 2024-03-09T15:00:00Z를 가리키는 epoch 초다.\r
      check:\r
        type: noError\r
        noError: datetime.fromtimestamp 호출과 ISO 변환이 끝나야 한다.\r
        resultCheck: modified 문자열이 본문에서 지정한 ISO 형식과 정확히 같아야 한다.\r
    check:\r
      noError: utime과 isoformat 호출이 한 흐름에서 끝나야 한다.\r
      resultCheck: modified 문자열이 1_700_000_000 epoch에 해당하는 UTC ISO 표현과 같아야 한다.\r
  - id: permission-bits\r
    title: 권한 비트 살펴보기\r
    structuredPrimary: true\r
    subtitle: stat.S_ISREG와 oct\r
    goal: 파일이 일반 파일인지 확인하고 권한 비트를 8진수로 읽어 자동화 점검 지표를 만든다.\r
    why: 자동화 시스템은 잘못된 권한 때문에 갑자기 실패할 수 있어서 파일 종류와 모드 비트를 사전에 점검하면 사고가 줄어든다.\r
    explanation: stat 모듈은 S_ISREG, S_ISDIR 같은 헬퍼와 S_IMODE 함수를 제공한다. Path.stat().st_mode를 stat.S_IMODE에 통과시키면 권한 비트만 남는다. oct로 출력하면 0o644 같은 표준 표기가 된다.\r
    tips:\r
      - Windows에서는 권한 비트가 제한적으로 노출되지만 함수 호출 자체는 동작한다.\r
      - 권한 변경은 Path.chmod를 사용하며 0o644 같은 8진수 리터럴로 표현한다.\r
    snippet: |-\r
      import stat\r
      import tempfile\r
      from pathlib import Path\r
\r
      with tempfile.TemporaryDirectory() as td:\r
          target = Path(td) / "rules.txt"\r
          target.write_text("r", encoding="utf-8")\r
          target.chmod(0o644)\r
          info = {\r
              "isFile": stat.S_ISREG(target.stat().st_mode),\r
              "mode": oct(stat.S_IMODE(target.stat().st_mode)),\r
          }\r
\r
      assert info["isFile"] is True\r
      assert info["mode"].endswith("644") or info["mode"].endswith("666")\r
      info\r
    exercise:\r
      prompt: 같은 파일에 chmod(0o600)을 적용한 뒤 mode 문자열이 600 또는 666으로 끝나는지 검증하세요.\r
      starterCode: |-\r
        import stat\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "rules.txt"\r
            target.write_text("r", encoding="utf-8")\r
            target.chmod(___)\r
            info = {\r
                "isFile": stat.S_ISREG(target.stat().st_mode),\r
                "mode": oct(stat.S_IMODE(target.stat().st_mode)),\r
            }\r
\r
        assert info["isFile"] is True\r
        assert info["mode"].endswith("600") or info["mode"].endswith("666")\r
        info\r
      solution: |-\r
        import stat\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            target = Path(td) / "rules.txt"\r
            target.write_text("r", encoding="utf-8")\r
            target.chmod(0o600)\r
            info = {\r
                "isFile": stat.S_ISREG(target.stat().st_mode),\r
                "mode": oct(stat.S_IMODE(target.stat().st_mode)),\r
            }\r
\r
        assert info["isFile"] is True\r
        assert info["mode"].endswith("600") or info["mode"].endswith("666")\r
        info\r
      hints:\r
        - chmod 인자는 0o로 시작하는 8진수 리터럴로 적는다.\r
        - Windows에서는 666처럼 다른 값이 나올 수 있어 endswith 두 가지를 함께 허용한다.\r
      check:\r
        type: noError\r
        noError: chmod와 stat 호출이 PermissionError 없이 끝나야 한다.\r
        resultCheck: info 딕셔너리의 isFile이 True이고 mode가 600 또는 666으로 끝나야 한다.\r
    check:\r
      noError: chmod와 stat.S_IMODE 호출이 끝나야 한다.\r
      resultCheck: info의 isFile이 True이고 mode 문자열이 권한 비트를 8진수로 표시해야 한다.\r
  - id: combined-record\r
    title: 메타데이터 종합 정리\r
    structuredPrimary: true\r
    subtitle: 자동화 리포트 표준 dict\r
    goal: 한 파일의 크기, mtime, 모드, 절대 경로를 한 dict로 묶어 다음 자동화 단계의 표준 입력으로 만든다.\r
    why: 자동화 리포트는 항상 같은 키 구조를 가져야 후속 단계에서 변경에 흔들리지 않는다.\r
    explanation: 마지막 섹션은 앞 세 섹션 결과를 한 함수로 합쳐 자동화 리포트의 한 행을 만든다. dict 키 이름은 size, modifiedAt, mode, path로 고정해 다른 자동화 코드가 같은 이름을 신뢰할 수 있다. 종합 정리 결과는 폴더 단위 리포트로 확장하기 쉽다.\r
    tips:\r
      - 키 이름을 영문 카멜케이스로 통일하면 다른 자동화 코드와 호환이 좋다.\r
      - mode 키는 사람이 읽을 수 있는 8진수 문자열로 보관한다.\r
    snippet: |-\r
      import os\r
      import stat\r
      import tempfile\r
      from datetime import UTC, datetime\r
      from pathlib import Path\r
\r
\r
      def describeFile(path: Path) -> dict:\r
          info = path.stat()\r
          return {\r
              "path": str(path.resolve()),\r
              "size": info.st_size,\r
              "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),\r
              "mode": oct(stat.S_IMODE(info.st_mode)),\r
          }\r
\r
\r
      with tempfile.TemporaryDirectory() as td:\r
          base = Path(td)\r
          target = base / "summary.txt"\r
          target.write_text("done", encoding="utf-8")\r
          os.utime(target, (1_700_000_000, 1_700_000_000))\r
          target.chmod(0o644)\r
          record = describeFile(target)\r
\r
      assert record["size"] == 4\r
      assert record["modifiedAt"] == "2023-11-14T22:13:20+00:00"\r
      assert record["mode"].endswith("644") or record["mode"].endswith("666")\r
      record\r
    exercise:\r
      prompt: describeFile을 호출해 final.txt 파일이 크기 5바이트, ISO 시각 "2024-03-09T16:00:00+00:00", 모드 600 또는 666인지 종합 검증하세요.\r
      starterCode: |-\r
        import os\r
        import stat\r
        import tempfile\r
        from datetime import UTC, datetime\r
        from pathlib import Path\r
\r
\r
        def describeFile(path: Path) -> dict:\r
            info = path.stat()\r
            return {\r
                "path": str(path.resolve()),\r
                "size": info.st_size,\r
                "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),\r
                "mode": oct(stat.S_IMODE(info.st_mode)),\r
            }\r
\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            target = base / "final.txt"\r
            target.write_text("___", encoding="utf-8")\r
            os.utime(target, (1_710_000_000, 1_710_000_000))\r
            target.chmod(___)\r
            record = describeFile(target)\r
\r
        assert record["size"] == 5\r
        assert record["modifiedAt"] == "2024-03-09T16:00:00+00:00"\r
        assert record["mode"].endswith("600") or record["mode"].endswith("666")\r
        record\r
      solution: |-\r
        import os\r
        import stat\r
        import tempfile\r
        from datetime import UTC, datetime\r
        from pathlib import Path\r
\r
\r
        def describeFile(path: Path) -> dict:\r
            info = path.stat()\r
            return {\r
                "path": str(path.resolve()),\r
                "size": info.st_size,\r
                "modifiedAt": datetime.fromtimestamp(info.st_mtime, tz=UTC).isoformat(timespec="seconds"),\r
                "mode": oct(stat.S_IMODE(info.st_mode)),\r
            }\r
\r
\r
        with tempfile.TemporaryDirectory() as td:\r
            base = Path(td)\r
            target = base / "final.txt"\r
            target.write_text("close", encoding="utf-8")\r
            os.utime(target, (1_710_000_000, 1_710_000_000))\r
            target.chmod(0o600)\r
            record = describeFile(target)\r
\r
        assert record["size"] == 5\r
        assert record["modifiedAt"] == "2024-03-09T16:00:00+00:00"\r
        assert record["mode"].endswith("600") or record["mode"].endswith("666")\r
        record\r
      hints:\r
        - 길이 5짜리 문자열을 저장하면 size 키가 5가 된다.\r
        - 0o600을 chmod 인자로 넘기면 모드 문자열이 600으로 끝난다.\r
      check:\r
        type: noError\r
        noError: describeFile 함수 호출과 utime, chmod가 격리 공간에서 끝나야 한다.\r
        resultCheck: record 딕셔너리의 size, modifiedAt, mode 세 값이 종합 조건을 모두 만족해야 한다.\r
    check:\r
      noError: describeFile 호출과 stat, datetime 변환이 한 흐름에서 끝나야 한다.\r
      resultCheck: record 딕셔너리가 path, size, modifiedAt, mode 네 키를 모두 채우고 본문 기대값과 같아야 한다.\r
`;export{e as default};