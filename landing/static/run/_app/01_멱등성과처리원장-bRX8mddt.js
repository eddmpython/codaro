var e=`meta:\r
  id: resilience_01\r
  title: 멱등성과 처리 원장\r
  order: 1\r
  category: resilience\r
  difficulty: easy\r
  audience: 자동화 스크립트를 새벽 배치·스케줄러로 돌리려는 Python 학습자\r
  packages: []\r
  tags:\r
    - idempotency\r
    - 멱등성\r
    - ledger\r
    - 재실행\r
    - json\r
intro:\r
  direction: 같은 입력을 두 번 실행해도 결과가 한 번 실행한 것과 같도록, 처리한 작업 키를 디스크 원장(ledger)에 남겨 재실행을 안전하게 만든다.\r
  benefits:\r
    - 멱등성이 "함수 속성"이 아니라 "외부 상태에 대한 효과"임을 안다.\r
    - 처리 키를 JSON 파일로 영속해 프로세스가 죽었다 떠도 이어 쓴다.\r
    - 재시도·중복 트리거가 중복 발송·이중 입력을 일으키지 않게 막는다.\r
  diagram:\r
    steps:\r
      - label: 처리 원장 만들기\r
        detail: 처리한 작업 키를 set으로 모으고 JSON 파일에 저장한다.\r
      - label: 한 번만 처리\r
        detail: 이미 원장에 있는 키는 건너뛰고 처음 보는 키만 처리한다.\r
      - label: 재실행 안전\r
        detail: 저장된 원장을 다시 로드해 두 번째 실행에서 중복을 흡수한다.\r
    runtime:\r
      - label: 로컬 표준 라이브러리 실행\r
        detail: json, pathlib, tempfile만으로 로컬 Python에서 그대로 실행한다.\r
      - label: assert로 직접 확인\r
        detail: 두 번째 실행이 신규 건만 처리하는지 assert로 눈에 보이게 검증한다.\r
sections:\r
  - id: persistent-ledger\r
    title: 영속 처리 원장\r
    structuredPrimary: true\r
    subtitle: 처리한 키를 디스크에 남긴다\r
    goal: 처리한 작업 키 집합을 JSON 파일에 저장했다가 다시 읽어도 같은 집합이 복원되는지 확인한다.\r
    why: 멱등성은 메모리 변수로는 못 만든다. 프로세스가 죽으면 메모리는 사라지므로, 처리 여부는 디스크에 남은 키로 판정해야 한다.\r
    explanation: |-\r
      멱등성(idempotency)은 "같은 작업을 여러 번 해도 결과가 한 번 한 것과 같다"는 성질이다. 자동화에서 이게 중요한 이유는 스케줄러·재시도가 같은 스크립트를 두 번 부를 수 있기 때문이다.\r
\r
      핵심은 "무엇을 이미 처리했는가"를 기억하는 것이다. 메모리 변수(set)는 프로세스가 죽으면 날아가므로, 처리한 키를 JSON 파일 같은 디스크 원장(ledger)에 남겨야 다음 실행이 이어서 판단할 수 있다.\r
    tips:\r
      - set은 JSON에 직접 못 담으므로 sorted(list)로 바꿔 저장하고, 읽을 때 다시 set으로 만든다.\r
      - tempfile.TemporaryDirectory를 쓰면 실습 파일이 작업 폴더를 더럽히지 않는다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      ledger = {"order-1", "order-2"}\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          ledgerPath = Path(tmp) / "ledger.json"\r
          ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
          loaded = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
\r
      assert loaded == ledger\r
      loaded\r
    exercise:\r
      prompt: ledger에 "order-3"을 추가한 뒤 저장→로드해도 세 키가 모두 남는지 확인하세요.\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        ledger = {"order-1", "order-2"}\r
        ledger.add(___)\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            ledgerPath = Path(tmp) / "ledger.json"\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            loaded = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
\r
        assert loaded == {"order-1", "order-2", "order-3"}\r
        loaded\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        ledger = {"order-1", "order-2"}\r
        ledger.add("order-3")\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            ledgerPath = Path(tmp) / "ledger.json"\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            loaded = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
\r
        assert loaded == {"order-1", "order-2", "order-3"}\r
        loaded\r
      hints:\r
        - 추가할 키는 문자열 "order-3"이다.\r
        - add 뒤 ledger는 세 개의 키를 가진다.\r
      check:\r
        type: noError\r
        noError: 저장·로드 round-trip이 예외 없이 끝나야 한다.\r
        resultCheck: loaded가 세 키 모두를 담아 assert가 통과해야 한다.\r
    check:\r
      noError: JSON 저장·로드가 끝나야 한다.\r
      resultCheck: loaded가 저장 전 ledger와 같아야 한다.\r
  - id: send-once\r
    title: 한 번만 처리하기\r
    structuredPrimary: true\r
    subtitle: 이미 처리한 키는 건너뛴다\r
    goal: 같은 작업 키를 두 번 넘겨도 실제 발송은 한 번만 일어나는 멱등 함수를 만든다.\r
    why: 부수효과(메일 발송·행 추가)는 비가역이다. 같은 키가 다시 와도 한 번만 실행되게 막는 게 멱등성의 핵심이다.\r
    explanation: |-\r
      sendOnce 함수는 처리 원장(ledger)과 결과 모음(sink), 그리고 작업 키를 받는다. 키가 이미 원장에 있으면 아무것도 하지 않고 False를 돌려준다. 처음 보는 키만 sink에 추가하고 원장에 기록한 뒤 True를 돌려준다.\r
\r
      이렇게 하면 같은 키를 두 번 호출해도 sink에는 한 번만 들어간다. "두 번 호출 = 한 번 효과"가 바로 멱등이다.\r
    tips:\r
      - 멱등성은 함수가 "무엇을 이미 했는지"를 기억할 때만 생긴다 - 기억이 곧 원장이다.\r
      - return False/True로 "건너뜀/처리함"을 구분하면 호출하는 쪽이 집계할 수 있다.\r
    snippet: |-\r
      def sendOnce(ledger, sink, key):\r
          if key in ledger:\r
              return False\r
          sink.append(key)\r
          ledger.add(key)\r
          return True\r
\r
      ledger = set()\r
      sent = []\r
\r
      sendOnce(ledger, sent, "order-1")\r
      sendOnce(ledger, sent, "order-1")\r
      sentCount = len(sent)\r
\r
      assert sentCount == 1\r
      sentCount\r
    exercise:\r
      prompt: "order-1, order-2, order-1을 차례로 처리하면 실제 발송이 몇 건인지 확인하세요(중복 order-1은 한 번만)."\r
      starterCode: |-\r
        def sendOnce(ledger, sink, key):\r
            if key in ledger:\r
                return False\r
            sink.append(key)\r
            ledger.add(key)\r
            return True\r
\r
        ledger = set()\r
        sent = []\r
\r
        for key in ["order-1", "order-2", "order-1"]:\r
            sendOnce(ledger, sent, ___)\r
        sentCount = len(sent)\r
\r
        assert sentCount == 2\r
        sentCount\r
      solution: |-\r
        def sendOnce(ledger, sink, key):\r
            if key in ledger:\r
                return False\r
            sink.append(key)\r
            ledger.add(key)\r
            return True\r
\r
        ledger = set()\r
        sent = []\r
\r
        for key in ["order-1", "order-2", "order-1"]:\r
            sendOnce(ledger, sent, key)\r
        sentCount = len(sent)\r
\r
        assert sentCount == 2\r
        sentCount\r
      hints:\r
        - 반복 변수 key를 그대로 sendOnce에 넘긴다.\r
        - 중복된 order-1은 두 번째 호출에서 건너뛰므로 발송은 2건이다.\r
      check:\r
        type: noError\r
        noError: 반복 처리가 예외 없이 끝나야 한다.\r
        resultCheck: sentCount가 2여야 한다(중복 1건 제외).\r
    check:\r
      noError: sendOnce 반복 호출이 끝나야 한다.\r
      resultCheck: sentCount가 1이어야 한다.\r
  - id: rerun-safe\r
    title: 재실행해도 안전하게\r
    structuredPrimary: true\r
    subtitle: 두 번째 실행은 신규 건만\r
    goal: 저장된 원장을 로드해 처리하는 배치가, 겹치는 입력으로 다시 돌아도 신규 건만 처리하는지 확인한다.\r
    why: 새벽 배치가 재시도·중복 트리거로 두 번 돌아도, 이미 보낸 주문은 원장에 있어 건너뛴다 - 고객에게 같은 메일이 두 번 가지 않는다.\r
    explanation: |-\r
      runBatch는 원장 파일을 로드(없으면 빈 set)한 뒤 주문 목록을 돈다. 이미 원장에 있는 키는 skipped로 세고, 처음 보는 키만 sent로 세며 원장에 기록한다. 마지막에 원장을 다시 저장한다.\r
\r
      1차 실행은 두 건을 모두 발송한다. 2차 실행에 같은 두 건과 신규 한 건을 넘기면, 앞의 두 건은 원장에 있어 건너뛰고 신규 한 건만 발송된다. 같은 코드를 두 번 돌려도 중복 발송이 없다.\r
    tips:\r
      - 파일이 없을 때 빈 set으로 시작하면 "첫 실행"과 "재실행"을 같은 코드로 다룰 수 있다.\r
      - sent/skipped 집계를 dict로 돌려주면 운영자가 한 줄로 결과를 본다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def runBatch(orders, ledgerPath):\r
          if ledgerPath.exists():\r
              ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
          else:\r
              ledger = set()\r
          sent = 0\r
          skipped = 0\r
          for key in orders:\r
              if key in ledger:\r
                  skipped += 1\r
                  continue\r
              sent += 1\r
              ledger.add(key)\r
          ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
          return {"sent": sent, "skipped": skipped}\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "ledger.json"\r
          first = runBatch(["order-1", "order-2"], path)\r
          summary = runBatch(["order-1", "order-2", "order-3"], path)\r
\r
      assert first == {"sent": 2, "skipped": 0}\r
      assert summary == {"sent": 1, "skipped": 2}\r
      summary\r
    exercise:\r
      prompt: 2차 실행 입력을 ["order-2", "order-4"]로 바꾸면 sent와 skipped가 각각 몇 건인지 확인하세요.\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def runBatch(orders, ledgerPath):\r
            if ledgerPath.exists():\r
                ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
            else:\r
                ledger = set()\r
            sent = 0\r
            skipped = 0\r
            for key in orders:\r
                if key in ledger:\r
                    skipped += 1\r
                    continue\r
                sent += 1\r
                ledger.add(key)\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            return {"sent": sent, "skipped": skipped}\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "ledger.json"\r
            first = runBatch(["order-1", "order-2"], path)\r
            summary = runBatch([___, ___], path)\r
\r
        assert summary == {"sent": 1, "skipped": 1}\r
        summary\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def runBatch(orders, ledgerPath):\r
            if ledgerPath.exists():\r
                ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8")))\r
            else:\r
                ledger = set()\r
            sent = 0\r
            skipped = 0\r
            for key in orders:\r
                if key in ledger:\r
                    skipped += 1\r
                    continue\r
                sent += 1\r
                ledger.add(key)\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            return {"sent": sent, "skipped": skipped}\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "ledger.json"\r
            first = runBatch(["order-1", "order-2"], path)\r
            summary = runBatch(["order-2", "order-4"], path)\r
\r
        assert summary == {"sent": 1, "skipped": 1}\r
        summary\r
      hints:\r
        - order-2는 1차에서 이미 발송돼 원장에 있으므로 skip된다.\r
        - order-4만 신규라 발송 1건, 건너뜀 1건이다.\r
      check:\r
        type: noError\r
        noError: 두 번의 runBatch 호출이 예외 없이 끝나야 한다.\r
        resultCheck: summary가 sent 1, skipped 1이어야 한다.\r
    check:\r
      noError: runBatch 두 번 호출이 끝나야 한다.\r
      resultCheck: summary가 sent 1, skipped 2여야 한다.\r
  - id: practice-daily-batch\r
    title: '종합 실습: 하루 두 번 도는 배치'\r
    structuredPrimary: true\r
    subtitle: 원장 + 멱등 처리를 한 흐름으로\r
    goal: 같은 원장 파일로 아침·저녁 두 번 도는 배치가 고유 주문만 발송하고 중복은 흡수하는지 종합 점검한다.\r
    why: 영속 원장·멱등 처리·재실행 안전을 한 번에 묶어 실제 업무 배치가 어떻게 안전해지는지 확인한다.\r
    explanation: |-\r
      dailyRun은 원장을 로드(없으면 빈 set)해 이미 처리한 주문은 건너뛰고 신규만 발송한 뒤 원장을 저장한다. 아침에 A·B·C 세 건이 들어오면 3건 발송, 저녁에 B·C·D·E가 들어오면 B·C는 원장에 있어 건너뛰고 D·E만 발송한다.\r
\r
      두 번의 실행을 합쳐도 발송은 고유 주문 5건뿐이다. 멱등성·원장·재실행 안전이 함께 작동한 결과다.\r
    tips:\r
      - 매 실행이 원장을 로드→처리→저장하므로 몇 번을 돌려도 누적 효과가 같다.\r
      - 발송 건수 합이 고유 주문 수와 같으면 중복이 없다는 신호다.\r
    snippet: |-\r
      import json\r
      import tempfile\r
      from pathlib import Path\r
\r
      def dailyRun(orders, ledgerPath):\r
          ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8"))) if ledgerPath.exists() else set()\r
          sent = 0\r
          for key in orders:\r
              if key in ledger:\r
                  continue\r
              sent += 1\r
              ledger.add(key)\r
          ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
          return sent\r
\r
      with tempfile.TemporaryDirectory() as tmp:\r
          path = Path(tmp) / "ledger.json"\r
          morning = dailyRun(["A", "B", "C"], path)\r
          evening = dailyRun(["B", "C", "D", "E"], path)\r
          totalSent = morning + evening\r
\r
      assert morning == 3\r
      assert evening == 2\r
      assert totalSent == 5\r
      totalSent\r
    exercise:\r
      prompt: 저녁 입력을 ["C", "D"]로 바꾸면 저녁 발송과 총 발송이 각각 몇 건인지 확인하세요.\r
      starterCode: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def dailyRun(orders, ledgerPath):\r
            ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8"))) if ledgerPath.exists() else set()\r
            sent = 0\r
            for key in orders:\r
                if key in ledger:\r
                    continue\r
                sent += 1\r
                ledger.add(key)\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            return sent\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "ledger.json"\r
            morning = dailyRun(["A", "B", "C"], path)\r
            evening = dailyRun([___, ___], path)\r
            totalSent = morning + evening\r
\r
        assert evening == 1\r
        assert totalSent == 4\r
        totalSent\r
      solution: |-\r
        import json\r
        import tempfile\r
        from pathlib import Path\r
\r
        def dailyRun(orders, ledgerPath):\r
            ledger = set(json.loads(ledgerPath.read_text(encoding="utf-8"))) if ledgerPath.exists() else set()\r
            sent = 0\r
            for key in orders:\r
                if key in ledger:\r
                    continue\r
                sent += 1\r
                ledger.add(key)\r
            ledgerPath.write_text(json.dumps(sorted(ledger)), encoding="utf-8")\r
            return sent\r
\r
        with tempfile.TemporaryDirectory() as tmp:\r
            path = Path(tmp) / "ledger.json"\r
            morning = dailyRun(["A", "B", "C"], path)\r
            evening = dailyRun(["C", "D"], path)\r
            totalSent = morning + evening\r
\r
        assert evening == 1\r
        assert totalSent == 4\r
        totalSent\r
      hints:\r
        - C는 아침에 이미 발송돼 원장에 있으므로 건너뛴다.\r
        - D만 신규라 저녁 발송 1건, 총 4건이다.\r
      check:\r
        type: noError\r
        noError: 두 번의 dailyRun이 예외 없이 끝나야 한다.\r
        resultCheck: 저녁 발송 1건, 총 발송 4건이어야 한다.\r
    check:\r
      noError: 아침·저녁 dailyRun이 끝나야 한다.\r
      resultCheck: 총 발송이 고유 주문 5건과 같아야 한다.\r
`;export{e as default};