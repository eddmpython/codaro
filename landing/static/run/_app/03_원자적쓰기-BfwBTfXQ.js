var e=`meta:\r
  id: resilience_03\r
  title: 원자적 쓰기\r
  order: 3\r
  category: resilience\r
  difficulty: easy\r
  audience: 리포트·상태 파일을 주기적으로 덮어쓰는 자동화를 만드는 Python 학습자\r
  packages: []\r
  tags:\r
    - atomic\r
    - 원자적\r
    - os.replace\r
    - 파일안전\r
    - tempfile\r
intro:\r
  direction: 임시 파일에 전량을 먼저 쓰고 os.replace로 한 번에 교체해, 쓰는 도중 죽어도 파일이 반쪽으로 남지 않게 만든다.\r
  benefits:\r
    - open('w')가 여는 즉시 기존 내용을 날린다는 위험을 직접 본다.\r
    - 임시 파일 + os.replace로 "옛 버전 또는 새 버전, 절대 반쪽 아님"을 보장한다.\r
    - 쓰다 죽어도 원본이 보존돼 다음 독자가 깨진 파일을 읽지 않는다.\r
  diagram:\r
    steps:\r
      - label: 직접 덮어쓰기의 위험\r
        detail: open('w')로 바로 쓰다 죽으면 원본도 신규본도 잃고 반쪽만 남는다.\r
      - label: 원자적 교체\r
        detail: 임시 파일에 전량 쓰고 os.replace로 한 번에 바꾼다.\r
      - label: 죽어도 보존\r
        detail: replace 전에 죽으면 원본이 그대로 남고 임시 파일만 남는다.\r
    runtime:\r
      - label: 로컬 표준 라이브러리 실행\r
        detail: os, pathlib, tempfile만으로 로컬 Python에서 그대로 실행한다.\r
      - label: assert로 직접 확인\r
        detail: 중단을 모사해 원본 보존 여부를 assert로 눈에 보이게 검증한다.\r
sections:\r
  - id: unsafe-overwrite\r
    title: 직접 덮어쓰기의 위험\r
    structuredPrimary: true\r
    subtitle: 쓰다 죽으면 반쪽만 남는다\r
    goal: open('w')로 직접 덮어쓰다 중간에 죽으면 원본이 사라지고 미완성 내용만 남는 것을 확인한다.\r
    why: 매시간 status.json을 통째로 덮어쓰는 자동화는, 쓰는 도중 죽으면 독자가 깨진 파일을 읽고 파이프라인 전체가 멈춘다.\r
    explanation: |-\r
      open(path, "w")는 파일을 여는 즉시 기존 내용을 0바이트로 날린다. 그 뒤 write로 새 내용을 조금씩 채우는데, 다 쓰기 전에 죽으면 원본은 이미 사라졌고 새 내용은 미완성 - 반쪽짜리 파일만 남는다.\r
\r
      아래는 세 조각을 쓰다 세 번째에서 죽는 상황이다. 원본 "OLD-DATA"는 사라지고 "AAABBB"만 남는다. 이게 직접 덮어쓰기의 근본 위험이다.\r
    tips:\r
      - "'w' 모드는 여는 순간 truncate(0바이트화)한다 - 한 글자도 안 썼는데 원본이 날아갈 수 있다."\r
      - 예외를 잡되 메시지를 보존해 무엇 때문에 죽었는지 남긴다(삼키지 않기).\r
    snippet: |-\r
      import tempfile\r
      from pathlib import Path\r
\r
      def unsafeWrite(path, chunks):\r
          with open(path, "w", encoding="utf-8") as handle:\r
              for i, chunk in enumerate(chunks):\r
                  if i == 2:\r
                      raise RuntimeError("crashed mid-write")\r
                  handle.write(chunk)\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "report.txt"\r
          path.write_text("OLD-DATA", encoding="utf-8")\r
          crashed = ""\r
          try:\r
              unsafeWrite(path, ["AAA", "BBB", "CCC"])\r
          except RuntimeError as exc:\r
              crashed = str(exc)\r
          after = path.read_text(encoding="utf-8")\r
\r
      assert crashed == "crashed mid-write"\r
      assert after != "OLD-DATA"\r
      assert after == "AAABBB"\r
      corruptedLen = len(after)\r
      assert corruptedLen == 6\r
      corruptedLen\r
    exercise:\r
      prompt: 두 번째 조각(i == 1)에서 죽도록 바꾸면 파일에 몇 글자가 남는지 확인하세요.\r
      starterCode: |-\r
        import tempfile\r
        from pathlib import Path\r
\r
        def unsafeWrite(path, chunks):\r
            with open(path, "w", encoding="utf-8") as handle:\r
                for i, chunk in enumerate(chunks):\r
                    if i == ___:\r
                        raise RuntimeError("crashed mid-write")\r
                    handle.write(chunk)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            path.write_text("OLD-DATA", encoding="utf-8")\r
            crashed = ""\r
            try:\r
                unsafeWrite(path, ["AAA", "BBB", "CCC"])\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            after = path.read_text(encoding="utf-8")\r
\r
        assert after == "AAA"\r
        corruptedLen = len(after)\r
        assert corruptedLen == 3\r
        corruptedLen\r
      solution: |-\r
        import tempfile\r
        from pathlib import Path\r
\r
        def unsafeWrite(path, chunks):\r
            with open(path, "w", encoding="utf-8") as handle:\r
                for i, chunk in enumerate(chunks):\r
                    if i == 1:\r
                        raise RuntimeError("crashed mid-write")\r
                    handle.write(chunk)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            path.write_text("OLD-DATA", encoding="utf-8")\r
            crashed = ""\r
            try:\r
                unsafeWrite(path, ["AAA", "BBB", "CCC"])\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            after = path.read_text(encoding="utf-8")\r
\r
        assert after == "AAA"\r
        corruptedLen = len(after)\r
        assert corruptedLen == 3\r
        corruptedLen\r
      hints:\r
        - i == 1이면 첫 조각 "AAA"만 쓰이고 죽는다.\r
        - 남는 글자 수는 3이다.\r
      check:\r
        type: noError\r
        noError: 중단 모사가 잡혀서 끝나야 한다.\r
        resultCheck: corruptedLen이 3이어야 한다.\r
    check:\r
      noError: unsafeWrite 중단이 잡혀서 끝나야 한다.\r
      resultCheck: corruptedLen이 6이고 원본이 사라져야 한다.\r
  - id: atomic-replace\r
    title: 원자적 교체\r
    structuredPrimary: true\r
    subtitle: 임시 파일 + os.replace\r
    goal: 임시 파일에 전량을 쓴 뒤 os.replace로 한 번에 교체해 최종 파일이 항상 완전한지 확인한다.\r
    why: os.replace는 교체를 원자적으로 수행한다 - 독자는 항상 옛 버전 아니면 새 버전을 보고, 반쪽을 보는 일이 없다.\r
    explanation: |-\r
      atomicWrite는 두 단계다. ① 임시 파일(path + ".tmp")에 데이터 전량을 먼저 쓴다. ② os.replace(tmp, path)로 임시 파일을 최종 경로로 한 번에 옮긴다.\r
\r
      os.replace는 운영체제 수준에서 원자적이라, 교체가 "완료" 또는 "미수행" 둘 중 하나다. 중간 상태가 독자에게 보이지 않는다. 참고로 Path.rename은 Windows에서 대상이 이미 있으면 FileExistsError를 내 교체용으로 부적합하지만, os.replace는 기존 파일을 원자적으로 덮어쓴다.\r
    tips:\r
      - 임시 파일은 같은 디렉터리에 두어야 os.replace가 같은 파일시스템 안에서 원자적으로 동작한다.\r
      - os.replace는 대상이 있어도 덮어쓴다 - rename과 달리 교체에 바로 쓸 수 있다.\r
    snippet: |-\r
      import os\r
      import tempfile\r
      from pathlib import Path\r
\r
      def atomicWrite(path, data):\r
          tmpPath = str(path) + ".tmp"\r
          Path(tmpPath).write_text(data, encoding="utf-8")\r
          os.replace(tmpPath, path)\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "report.txt"\r
          atomicWrite(path, "v2-complete")\r
          restored = path.read_text(encoding="utf-8")\r
\r
      assert restored == "v2-complete"\r
      restored\r
    exercise:\r
      prompt: atomicWrite로 "final-report"를 쓰면 읽어 온 내용이 정확히 그 문자열인지 확인하세요.\r
      starterCode: |-\r
        import os\r
        import tempfile\r
        from pathlib import Path\r
\r
        def atomicWrite(path, data):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(data, encoding="utf-8")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            atomicWrite(path, ___)\r
            restored = path.read_text(encoding="utf-8")\r
\r
        assert restored == "final-report"\r
        restored\r
      solution: |-\r
        import os\r
        import tempfile\r
        from pathlib import Path\r
\r
        def atomicWrite(path, data):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(data, encoding="utf-8")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            atomicWrite(path, "final-report")\r
            restored = path.read_text(encoding="utf-8")\r
\r
        assert restored == "final-report"\r
        restored\r
      hints:\r
        - 쓸 데이터는 문자열 "final-report"다.\r
        - os.replace 뒤 읽으면 같은 문자열이 그대로 나온다.\r
      check:\r
        type: noError\r
        noError: 임시 파일 쓰기와 os.replace가 예외 없이 끝나야 한다.\r
        resultCheck: restored가 "final-report"여야 한다.\r
    check:\r
      noError: atomicWrite가 끝나야 한다.\r
      resultCheck: restored가 "v2-complete"여야 한다.\r
  - id: crash-keeps-original\r
    title: 쓰다 죽어도 원본 보존\r
    structuredPrimary: true\r
    subtitle: replace 전에 죽으면 원본 그대로\r
    goal: 임시 파일을 쓴 뒤 os.replace 전에 죽으면 원본이 그대로 남고 임시 파일만 남는 것을 확인한다.\r
    why: 원자적 쓰기의 진짜 이득 - 쓰다 죽어도 독자는 항상 완전한 옛 버전을 본다. 깨진 파일이 절대 노출되지 않는다.\r
    explanation: |-\r
      atomicWriteWithCrash는 임시 파일에 새 데이터를 쓴 뒤, replace 직전에 죽는 상황을 모사한다. 이때 최종 경로의 파일은 손대지 않았으므로 원본 "v1"이 그대로 남는다. 새 데이터는 임시 파일에만 있어 독자에게 보이지 않는다.\r
\r
      즉 "v2로 바꾸다 죽음"의 결과가 "v1 그대로 + 임시 파일 잔존"이다. 반쪽짜리 v2는 어디에도 노출되지 않는다. 남은 임시 파일은 다음 실행이 정리하면 된다.\r
    tips:\r
      - 원자성의 핵심은 "최종 경로를 마지막 순간에 단 한 번 건드린다"는 것이다.\r
      - 남은 .tmp 파일은 사고의 흔적일 뿐, 원본을 오염시키지 않는다.\r
    snippet: |-\r
      import os\r
      import tempfile\r
      from pathlib import Path\r
\r
      def atomicWriteWithCrash(path, data, crash):\r
          tmpPath = str(path) + ".tmp"\r
          Path(tmpPath).write_text(data, encoding="utf-8")\r
          if crash:\r
              raise RuntimeError("crashed before replace")\r
          os.replace(tmpPath, path)\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "report.txt"\r
          path.write_text("v1", encoding="utf-8")\r
          crashed = ""\r
          try:\r
              atomicWriteWithCrash(path, "v2", crash=True)\r
          except RuntimeError as exc:\r
              crashed = str(exc)\r
          survived = path.read_text(encoding="utf-8")\r
          tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
      assert crashed == "crashed before replace"\r
      assert survived == "v1"\r
      assert len(tmpLeft) == 1\r
      survived\r
    exercise:\r
      prompt: crash=False로 바꾸면(정상 교체) 원본이 v2로 바뀌고 임시 파일이 안 남는지 확인하세요.\r
      starterCode: |-\r
        import os\r
        import tempfile\r
        from pathlib import Path\r
\r
        def atomicWriteWithCrash(path, data, crash):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(data, encoding="utf-8")\r
            if crash:\r
                raise RuntimeError("crashed before replace")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            path.write_text("v1", encoding="utf-8")\r
            crashed = ""\r
            try:\r
                atomicWriteWithCrash(path, "v2", crash=___)\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            survived = path.read_text(encoding="utf-8")\r
            tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
        assert survived == "v2"\r
        assert len(tmpLeft) == 0\r
        survived\r
      solution: |-\r
        import os\r
        import tempfile\r
        from pathlib import Path\r
\r
        def atomicWriteWithCrash(path, data, crash):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(data, encoding="utf-8")\r
            if crash:\r
                raise RuntimeError("crashed before replace")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "report.txt"\r
            path.write_text("v1", encoding="utf-8")\r
            crashed = ""\r
            try:\r
                atomicWriteWithCrash(path, "v2", crash=False)\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            survived = path.read_text(encoding="utf-8")\r
            tmpLeft = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
        assert survived == "v2"\r
        assert len(tmpLeft) == 0\r
        survived\r
      hints:\r
        - crash=False면 replace가 정상 수행된다.\r
        - 교체가 끝나면 임시 파일은 사라지고 원본은 v2가 된다.\r
      check:\r
        type: noError\r
        noError: 정상 교체가 예외 없이 끝나야 한다.\r
        resultCheck: survived가 "v2"이고 임시 파일이 안 남아야 한다.\r
    check:\r
      noError: atomicWriteWithCrash 중단이 잡혀서 끝나야 한다.\r
      resultCheck: survived가 "v1"으로 보존되고 임시 파일이 1개 남아야 한다.\r
  - id: practice-state-updater\r
    title: '종합 실습: 깨지지 않는 상태 파일'\r
    structuredPrimary: true\r
    subtitle: 원자적 쓰기로 반복 갱신\r
    goal: 상태 파일을 원자적 쓰기로 반복 갱신할 때 최종 내용이 정확하고 임시 파일이 남지 않는지 종합 점검한다.\r
    why: 주기적으로 status.json을 갱신하는 자동화가 임시 파일+os.replace로 어떻게 항상 완전한 상태를 유지하는지 확인한다.\r
    explanation: |-\r
      saveState는 임시 파일에 JSON을 전량 쓴 뒤 os.replace로 교체한다. 같은 경로를 두 번 갱신해도 매번 원자적으로 바뀌므로, 독자는 항상 step 1 또는 step 2의 완전한 상태만 본다.\r
\r
      성공적으로 교체되면 임시 파일은 남지 않는다. 최종 내용이 마지막으로 쓴 상태와 같고 .tmp가 0개면, 반복 갱신이 안전하게 동작한 것이다.\r
    tips:\r
      - 상태를 dict로 두고 JSON으로 직렬화하면 단계·플래그를 함께 담기 쉽다.\r
      - 정상 교체 뒤 .tmp가 0개인지 보면 누수 없이 끝났는지 확인된다.\r
    snippet: |-\r
      import os\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def saveState(path, state):\r
          tmpPath = str(path) + ".tmp"\r
          Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")\r
          os.replace(tmpPath, path)\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "status.json"\r
          saveState(path, {"step": 1, "ok": True})\r
          saveState(path, {"step": 2, "ok": True})\r
          loaded = json.loads(path.read_text(encoding="utf-8"))\r
          leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
      assert loaded == {"step": 2, "ok": True}\r
      assert leftover == []\r
      loaded["step"]\r
    exercise:\r
      prompt: 세 번째 갱신으로 step 3을 저장하면 최종 step과 남은 임시 파일 수가 각각 얼마인지 확인하세요.\r
      starterCode: |-\r
        import os\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def saveState(path, state):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "status.json"\r
            saveState(path, {"step": 1, "ok": True})\r
            saveState(path, {"step": 2, "ok": True})\r
            saveState(path, {"step": ___, "ok": True})\r
            loaded = json.loads(path.read_text(encoding="utf-8"))\r
            leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
        assert loaded["step"] == 3\r
        assert leftover == []\r
        loaded["step"]\r
      solution: |-\r
        import os\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def saveState(path, state):\r
            tmpPath = str(path) + ".tmp"\r
            Path(tmpPath).write_text(json.dumps(state), encoding="utf-8")\r
            os.replace(tmpPath, path)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "status.json"\r
            saveState(path, {"step": 1, "ok": True})\r
            saveState(path, {"step": 2, "ok": True})\r
            saveState(path, {"step": 3, "ok": True})\r
            loaded = json.loads(path.read_text(encoding="utf-8"))\r
            leftover = [name for name in os.listdir(tmp) if name.endswith(".tmp")]\r
\r
        assert loaded["step"] == 3\r
        assert leftover == []\r
        loaded["step"]\r
      hints:\r
        - 저장할 단계 값은 정수 3이다.\r
        - 매 갱신이 원자적이라 .tmp는 0개로 남는다.\r
      check:\r
        type: noError\r
        noError: 세 번의 saveState가 예외 없이 끝나야 한다.\r
        resultCheck: 최종 step이 3이고 임시 파일이 0개여야 한다.\r
    check:\r
      noError: 반복 saveState가 끝나야 한다.\r
      resultCheck: 최종 내용이 step 2이고 임시 파일이 0개여야 한다.\r
`;export{e as default};