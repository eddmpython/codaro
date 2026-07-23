var e=`meta:\r
  id: resilience_02\r
  title: 재개 가능한 체크포인트\r
  order: 2\r
  category: resilience\r
  difficulty: easy\r
  audience: 대량·장시간 배치를 중간에 죽어도 이어서 돌리려는 Python 학습자\r
  packages: []\r
  tags:\r
    - checkpoint\r
    - 체크포인트\r
    - resume\r
    - 재개\r
    - json\r
intro:\r
  direction: 진행 위치를 디스크 체크포인트에 남겨, 작업이 중간에 죽어도 처음부터가 아니라 죽은 지점부터 이어서 처리하게 만든다.\r
  benefits:\r
    - 진행 상태를 암묵적 루프 인덱스가 아니라 명시적 체크포인트 파일로 외부화한다.\r
    - 중단된 작업을 처음부터 다시 돌리지 않고 다음 항목부터 재개한다.\r
    - 멱등성과 합쳐 "두 번 해도 안전 + 중간에 죽어도 이어서"를 완성한다.\r
  diagram:\r
    steps:\r
      - label: 체크포인트 저장\r
        detail: 마지막으로 처리한 인덱스를 JSON 파일에 기록한다.\r
      - label: 중단 모사\r
        detail: 처리 도중 예외가 나도 체크포인트는 마지막 성공 지점에 남는다.\r
      - label: 재개\r
        detail: 저장된 체크포인트를 로드해 그 다음 항목부터 이어서 처리한다.\r
    runtime:\r
      - label: 로컬 표준 라이브러리 실행\r
        detail: json, pathlib, tempfile만으로 로컬 Python에서 그대로 실행한다.\r
      - label: assert로 직접 확인\r
        detail: 재개가 남은 항목만, 전체를 중복·누락 없이 처리하는지 assert로 검증한다.\r
sections:\r
  - id: checkpoint-file\r
    title: 체크포인트 파일\r
    structuredPrimary: true\r
    subtitle: 진행 위치를 디스크에 남긴다\r
    goal: 마지막으로 처리한 인덱스를 JSON 파일에 저장했다가 다시 읽어 복원하는 흐름을 확인한다.\r
    why: 진행 상태를 메모리 변수에만 두면 프로세스가 죽을 때 사라진다. 디스크 체크포인트가 있어야 다음 실행이 어디까지 했는지 안다.\r
    explanation: |-\r
      체크포인트(checkpoint)는 "여기까지 했다"를 디스크에 적어 둔 표식이다. 가장 단순한 형태는 마지막으로 처리한 인덱스를 JSON 파일에 저장하는 것이다.\r
\r
      저장과 로드를 왕복해 보면, 프로세스가 죽었다 떠도 같은 진행 위치가 복원된다는 걸 확인할 수 있다. 이 작은 파일 하나가 "처음부터 다시"와 "이어서"를 가른다.\r
    tips:\r
      - 체크포인트는 dict로 두면 나중에 진행률·단계명 같은 필드를 함께 담기 쉽다.\r
      - 한 번에 하나의 키만 쓰더라도 JSON dict로 시작하면 확장이 편하다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          checkpointPath = Path(tmp) / "checkpoint.json"\r
          checkpointPath.write_text(json.dumps({"lastDone": 5}), encoding="utf-8")\r
          loaded = json.loads(checkpointPath.read_text(encoding="utf-8"))\r
\r
      assert loaded["lastDone"] == 5\r
      loaded\r
    exercise:\r
      prompt: 체크포인트에 lastDone을 8로 저장한 뒤 로드해도 8이 복원되는지 확인하세요.\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            checkpointPath = Path(tmp) / "checkpoint.json"\r
            checkpointPath.write_text(json.dumps({"lastDone": ___}), encoding="utf-8")\r
            loaded = json.loads(checkpointPath.read_text(encoding="utf-8"))\r
\r
        assert loaded["lastDone"] == 8\r
        loaded\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            checkpointPath = Path(tmp) / "checkpoint.json"\r
            checkpointPath.write_text(json.dumps({"lastDone": 8}), encoding="utf-8")\r
            loaded = json.loads(checkpointPath.read_text(encoding="utf-8"))\r
\r
        assert loaded["lastDone"] == 8\r
        loaded\r
      hints:\r
        - 저장할 값은 정수 8이다.\r
        - JSON dict의 lastDone 키에 8이 들어간다.\r
      check:\r
        type: noError\r
        noError: 저장·로드가 예외 없이 끝나야 한다.\r
        resultCheck: loaded["lastDone"]가 8이어야 한다.\r
    check:\r
      noError: 체크포인트 저장·로드가 끝나야 한다.\r
      resultCheck: loaded["lastDone"]가 5여야 한다.\r
  - id: crash-keeps-checkpoint\r
    title: 중간에 죽어도 위치는 남는다\r
    structuredPrimary: true\r
    subtitle: 마지막 성공 지점까지 기록\r
    goal: 처리 도중 예외가 나도 체크포인트가 마지막으로 성공한 인덱스에 남는지 확인한다.\r
    why: 무인 배치는 언제든 죽을 수 있다. 죽기 직전까지의 진행이 디스크에 남아야 재개가 가능하다.\r
    explanation: |-\r
      runUntilCrash는 항목을 돌며 매 성공마다 체크포인트를 갱신한다. crashAt 항목에 도달하면 RuntimeError로 중단을 모사한다. 이 예외는 좁힌 except로 잡아 메시지를 보존하고(삼키지 않는다), 함수는 마지막으로 성공한 인덱스를 돌려준다.\r
\r
      crashAt이 6이면 1~5는 성공해 체크포인트가 5까지 기록되고, 6에서 죽는다. 죽어도 "5까지 했다"는 사실이 디스크에 남는다.\r
    tips:\r
      - 예외를 잡되 메시지를 변수에 담아 두면 무엇 때문에 죽었는지 추적할 수 있다(삼키지 않기).\r
      - 체크포인트는 매 성공 직후에 써야 죽는 순간까지의 진행이 보존된다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def runUntilCrash(items, crashAt, checkpointPath):\r
          lastDone = 0\r
          crashed = ""\r
          try:\r
              for n in items:\r
                  if n == crashAt:\r
                      raise RuntimeError(f"crashed at {n}")\r
                  lastDone = n\r
                  checkpointPath.write_text(json.dumps({"lastDone": lastDone}), encoding="utf-8")\r
          except RuntimeError as exc:\r
              crashed = str(exc)\r
          return lastDone, crashed\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "checkpoint.json"\r
          lastDone, crashed = runUntilCrash(range(1, 11), 6, path)\r
\r
      assert lastDone == 5\r
      assert crashed == "crashed at 6"\r
      lastDone\r
    exercise:\r
      prompt: crashAt을 4로 바꾸면 체크포인트가 어디까지 남는지 확인하세요(3까지 성공 후 4에서 죽음).\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def runUntilCrash(items, crashAt, checkpointPath):\r
            lastDone = 0\r
            crashed = ""\r
            try:\r
                for n in items:\r
                    if n == crashAt:\r
                        raise RuntimeError(f"crashed at {n}")\r
                    lastDone = n\r
                    checkpointPath.write_text(json.dumps({"lastDone": lastDone}), encoding="utf-8")\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            return lastDone, crashed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "checkpoint.json"\r
            lastDone, crashed = runUntilCrash(range(1, 11), ___, path)\r
\r
        assert lastDone == 3\r
        assert crashed == "crashed at 4"\r
        lastDone\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def runUntilCrash(items, crashAt, checkpointPath):\r
            lastDone = 0\r
            crashed = ""\r
            try:\r
                for n in items:\r
                    if n == crashAt:\r
                        raise RuntimeError(f"crashed at {n}")\r
                    lastDone = n\r
                    checkpointPath.write_text(json.dumps({"lastDone": lastDone}), encoding="utf-8")\r
            except RuntimeError as exc:\r
                crashed = str(exc)\r
            return lastDone, crashed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "checkpoint.json"\r
            lastDone, crashed = runUntilCrash(range(1, 11), 4, path)\r
\r
        assert lastDone == 3\r
        assert crashed == "crashed at 4"\r
        lastDone\r
      hints:\r
        - crashAt이 4이면 1, 2, 3은 성공한다.\r
        - 4에서 죽으므로 체크포인트는 3에 남는다.\r
      check:\r
        type: noError\r
        noError: 중단 모사가 예외 없이(잡혀서) 끝나야 한다.\r
        resultCheck: lastDone이 3이어야 한다.\r
    check:\r
      noError: runUntilCrash가 끝나야 한다.\r
      resultCheck: lastDone이 5, crashed가 "crashed at 6"이어야 한다.\r
  - id: resume-from-checkpoint\r
    title: 죽은 지점부터 재개\r
    structuredPrimary: true\r
    subtitle: 남은 항목만, 중복·누락 없이\r
    goal: 저장된 체크포인트를 로드해 그 다음 항목부터 재개하고, 전체가 정확히 한 번씩 처리되는지 확인한다.\r
    why: 1000건 발송이 중간에 죽었을 때 처음부터 다시 돌면 이미 보낸 수백 건이 중복된다. 재개는 남은 것만 처리해 시간과 사고를 모두 막는다.\r
    explanation: |-\r
      resumeBatch는 체크포인트를 로드(없으면 0)해 lastDone 이하 항목은 건너뛰고 그 다음부터 처리하며, 매 항목마다 체크포인트를 갱신한다.\r
\r
      1차 실행이 5까지 하고 죽었다면 체크포인트는 5다. 2차 실행은 6부터 시작해 6~10만 처리한다. 1차에서 처리한 1~5와 2차의 6~10을 합치면 1~10이 정확히 한 번씩 - 중복도 누락도 없다.\r
    tips:\r
      - 재개의 핵심은 n <= lastDone이면 continue로 이미 처리한 항목을 건너뛰는 것이다.\r
      - 재개 결과(6~10)와 1차 결과(1~5)를 합쳐 전체 범위와 같은지 보면 무결성이 한눈에 보인다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def resumeBatch(items, checkpointPath):\r
          if checkpointPath.exists():\r
              lastDone = json.loads(checkpointPath.read_text(encoding="utf-8"))["lastDone"]\r
          else:\r
              lastDone = 0\r
          processed = []\r
          for n in items:\r
              if n <= lastDone:\r
                  continue\r
              processed.append(n)\r
              checkpointPath.write_text(json.dumps({"lastDone": n}), encoding="utf-8")\r
          return processed\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "checkpoint.json"\r
          path.write_text(json.dumps({"lastDone": 5}), encoding="utf-8")\r
          firstRun = [1, 2, 3, 4, 5]\r
          secondRun = resumeBatch(range(1, 11), path)\r
\r
      allProcessed = firstRun + secondRun\r
      assert secondRun == [6, 7, 8, 9, 10]\r
      assert sorted(allProcessed) == list(range(1, 11))\r
      processedCount = len(allProcessed)\r
      assert processedCount == 10\r
      processedCount\r
    exercise:\r
      prompt: 1차 실행이 7까지 하고 죽은 상태(체크포인트 7)에서 재개가 8, 9, 10만 처리하는지 확인하세요.\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def resumeBatch(items, checkpointPath):\r
            if checkpointPath.exists():\r
                lastDone = json.loads(checkpointPath.read_text(encoding="utf-8"))["lastDone"]\r
            else:\r
                lastDone = 0\r
            processed = []\r
            for n in items:\r
                if n <= lastDone:\r
                    continue\r
                processed.append(n)\r
                checkpointPath.write_text(json.dumps({"lastDone": n}), encoding="utf-8")\r
            return processed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "checkpoint.json"\r
            path.write_text(json.dumps({"lastDone": ___}), encoding="utf-8")\r
            firstRun = [1, 2, 3, 4, 5, 6, 7]\r
            secondRun = resumeBatch(range(1, 11), path)\r
\r
        allProcessed = firstRun + secondRun\r
        assert secondRun == [8, 9, 10]\r
        assert sorted(allProcessed) == list(range(1, 11))\r
        processedCount = len(allProcessed)\r
        assert processedCount == 10\r
        processedCount\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def resumeBatch(items, checkpointPath):\r
            if checkpointPath.exists():\r
                lastDone = json.loads(checkpointPath.read_text(encoding="utf-8"))["lastDone"]\r
            else:\r
                lastDone = 0\r
            processed = []\r
            for n in items:\r
                if n <= lastDone:\r
                    continue\r
                processed.append(n)\r
                checkpointPath.write_text(json.dumps({"lastDone": n}), encoding="utf-8")\r
            return processed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "checkpoint.json"\r
            path.write_text(json.dumps({"lastDone": 7}), encoding="utf-8")\r
            firstRun = [1, 2, 3, 4, 5, 6, 7]\r
            secondRun = resumeBatch(range(1, 11), path)\r
\r
        allProcessed = firstRun + secondRun\r
        assert secondRun == [8, 9, 10]\r
        assert sorted(allProcessed) == list(range(1, 11))\r
        processedCount = len(allProcessed)\r
        assert processedCount == 10\r
        processedCount\r
      hints:\r
        - 체크포인트 값은 7이다(7까지 처리하고 죽음).\r
        - 재개는 8부터 시작하므로 8, 9, 10만 처리한다.\r
      check:\r
        type: noError\r
        noError: 재개 처리가 예외 없이 끝나야 한다.\r
        resultCheck: processedCount가 10이고 전체가 1~10을 한 번씩 담아야 한다.\r
    check:\r
      noError: resumeBatch가 끝나야 한다.\r
      resultCheck: processedCount가 10, 전체가 1~10을 중복·누락 없이 담아야 한다.\r
  - id: practice-crash-resume\r
    title: '종합 실습: 죽고 다시 살아나는 배치'\r
    structuredPrimary: true\r
    subtitle: 중단 → 재개를 한 흐름으로\r
    goal: 같은 체크포인트로 1차에 중간에 죽고 2차에 재개하는 배치가, 전체를 정확히 한 번씩 처리하는지 종합 점검한다.\r
    why: 체크포인트 저장·중단 생존·재개를 한 흐름으로 묶어 장기 배치가 어떻게 무중단처럼 완주하는지 확인한다.\r
    explanation: |-\r
      processAll은 체크포인트(done 리스트)를 로드해 이미 처리한 항목은 건너뛰고, crashAt에 도달하면 멈춘다. 1차 실행은 6에서 죽어 1~5만 처리하고, 2차 실행은 체크포인트를 로드해 6부터 재개해 끝까지 간다.\r
\r
      두 번의 실행을 합치면 1~10이 정확히 한 번씩 처리된다. 죽었다 살아나도 처음부터 다시 돌지 않는다.\r
    tips:\r
      - done 집합을 매번 저장하면 어느 지점에서 죽어도 다음 실행이 이어받는다.\r
      - 최종 done이 전체 범위와 같으면 무중단 실행과 결과가 동일하다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def processAll(items, checkpointPath, crashAt=None):\r
          done = json.loads(checkpointPath.read_text(encoding="utf-8"))["done"] if checkpointPath.exists() else []\r
          doneSet = set(done)\r
          crashed = False\r
          for n in items:\r
              if n in doneSet:\r
                  continue\r
              if crashAt is not None and n == crashAt:\r
                  crashed = True\r
                  break\r
              doneSet.add(n)\r
              checkpointPath.write_text(json.dumps({"done": sorted(doneSet)}), encoding="utf-8")\r
          return sorted(doneSet), crashed\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "cp.json"\r
          firstDone, crashed1 = processAll(range(1, 11), path, crashAt=6)\r
          finalDone, crashed2 = processAll(range(1, 11), path)\r
\r
      assert firstDone == [1, 2, 3, 4, 5]\r
      assert crashed1 is True\r
      assert finalDone == list(range(1, 11))\r
      assert crashed2 is False\r
      finalDone\r
    exercise:\r
      prompt: 1차 실행이 4에서 죽도록 crashAt을 바꾸면 1차 done이 어디까지인지 확인하세요(재개 후 최종은 그대로 1~10).\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def processAll(items, checkpointPath, crashAt=None):\r
            done = json.loads(checkpointPath.read_text(encoding="utf-8"))["done"] if checkpointPath.exists() else []\r
            doneSet = set(done)\r
            crashed = False\r
            for n in items:\r
                if n in doneSet:\r
                    continue\r
                if crashAt is not None and n == crashAt:\r
                    crashed = True\r
                    break\r
                doneSet.add(n)\r
                checkpointPath.write_text(json.dumps({"done": sorted(doneSet)}), encoding="utf-8")\r
            return sorted(doneSet), crashed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "cp.json"\r
            firstDone, crashed1 = processAll(range(1, 11), path, crashAt=___)\r
            finalDone, crashed2 = processAll(range(1, 11), path)\r
\r
        assert firstDone == [1, 2, 3]\r
        assert finalDone == list(range(1, 11))\r
        finalDone\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def processAll(items, checkpointPath, crashAt=None):\r
            done = json.loads(checkpointPath.read_text(encoding="utf-8"))["done"] if checkpointPath.exists() else []\r
            doneSet = set(done)\r
            crashed = False\r
            for n in items:\r
                if n in doneSet:\r
                    continue\r
                if crashAt is not None and n == crashAt:\r
                    crashed = True\r
                    break\r
                doneSet.add(n)\r
                checkpointPath.write_text(json.dumps({"done": sorted(doneSet)}), encoding="utf-8")\r
            return sorted(doneSet), crashed\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "cp.json"\r
            firstDone, crashed1 = processAll(range(1, 11), path, crashAt=4)\r
            finalDone, crashed2 = processAll(range(1, 11), path)\r
\r
        assert firstDone == [1, 2, 3]\r
        assert finalDone == list(range(1, 11))\r
        finalDone\r
      hints:\r
        - crashAt이 4이면 1, 2, 3까지 처리하고 4에서 죽는다.\r
        - 재개가 4부터 이어받아 최종은 1~10이 된다.\r
      check:\r
        type: noError\r
        noError: 1차·2차 processAll이 예외 없이 끝나야 한다.\r
        resultCheck: 1차 done이 [1, 2, 3], 최종이 1~10이어야 한다.\r
    check:\r
      noError: 1차·2차 processAll이 끝나야 한다.\r
      resultCheck: 최종 done이 1~10을 한 번씩 담아야 한다.\r
`;export{e as default};