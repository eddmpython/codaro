var e=`meta:\r
  id: watchSched_03\r
  title: 디바운스와 안정화\r
  order: 3\r
  category: watchSched\r
  difficulty: easy\r
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자\r
  packages: []\r
  tags:\r
    - debounce\r
    - throttling\r
    - automation\r
intro:\r
  direction: watchdog이 같은 파일에 짧은 시간 안에 여러 modified 이벤트를 보내는 상황에서 디바운스 함수로 안정된 한 번의 처리만 수행한다.\r
  benefits:\r
    - 디바운스 함수의 시간 간격 판단을 구현한다.\r
    - 같은 키가 짧은 시간에 여러 번 들어와도 한 번만 처리한다.\r
    - 다른 키는 독립적으로 자체 시간 창을 가진다.\r
    - 종합 사이클에서 디바운스 결과를 표준 dict로 정리한다.\r
  diagram:\r
    steps:\r
      - label: 디바운스 함수 작성\r
        detail: 마지막 처리 시각을 dict에 저장해 일정 시간 안의 중복을 거른다.\r
      - label: 같은 키 여러 번 호출\r
        detail: 50밀리초 간격으로 같은 키를 세 번 호출하면 한 번만 처리되는지 확인한다.\r
      - label: 키별 시간 창\r
        detail: 두 키가 각자의 시간 창을 가져 서로 영향을 주지 않는다.\r
      - label: 종합 결과 정리\r
        detail: 처리된 키 목록을 dict로 묶어 자동화 보고에 사용한다.\r
    runtime:\r
      - label: 표준 라이브러리만\r
        detail: time과 기본 dict만 사용해 외부 패키지가 필요 없다.\r
      - label: assert 기반 검증\r
        detail: 처리된 키 수와 결과를 assert로 비교한다.\r
sections:\r
  - id: debounce-skeleton\r
    title: 디바운스 함수 골격\r
    structuredPrimary: true\r
    subtitle: 마지막 시각 기억\r
    goal: 같은 키가 일정 시간 안에 다시 들어오면 건너뛰는 가장 단순한 디바운스를 만든다.\r
    why: 디바운스는 자동화에서 중복 처리를 막는 가장 흔한 패턴이므로 단순한 구현부터 확실히 이해한다.\r
    explanation: 디바운스 함수는 마지막 처리 시각을 키별로 저장한다. 새 호출 시각이 마지막 시각 + 임계 시간보다 이전이면 건너뛴다. 그 외의 경우에는 시각을 갱신하고 처리 카운터를 늘린다.\r
    tips:\r
      - 시간 단위는 부동소수 초를 사용하면 짧은 간격도 표현된다.\r
      - 디바운스 dict는 함수 외부에 두어 호출 사이에 상태가 유지되게 한다.\r
    snippet: |-\r
      import time\r
\r
      lastSeen: dict[str, float] = {}\r
      processed: list[str] = []\r
\r
\r
      def debounce(key: str, windowSeconds: float) -> bool:\r
          now = time.monotonic()\r
          if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
              return False\r
          lastSeen[key] = now\r
          processed.append(key)\r
          return True\r
\r
\r
      first = debounce("note.txt", 0.2)\r
      second = debounce("note.txt", 0.2)\r
\r
      assert first is True\r
      assert second is False\r
      processed\r
    exercise:\r
      prompt: 같은 디바운스 함수에 daily.log 키를 두 번 빠르게 호출해 첫 호출만 True, 두 번째는 False가 되는지 검증하세요.\r
      starterCode: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
        processed: list[str] = []\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return ___\r
            lastSeen[key] = now\r
            processed.append(key)\r
            return True\r
\r
\r
        first = debounce("daily.log", 0.2)\r
        second = debounce("daily.log", 0.2)\r
\r
        assert first is True\r
        assert second is False\r
        processed\r
      solution: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
        processed: list[str] = []\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return False\r
            lastSeen[key] = now\r
            processed.append(key)\r
            return True\r
\r
\r
        first = debounce("daily.log", 0.2)\r
        second = debounce("daily.log", 0.2)\r
\r
        assert first is True\r
        assert second is False\r
        processed\r
      hints:\r
        - 짧은 간격으로 같은 키가 들어오면 함수는 False를 돌려준다.\r
        - 첫 호출은 lastSeen에 키가 없으므로 처리가 진행된다.\r
      check:\r
        type: noError\r
        noError: 디바운스 함수 두 번 호출이 정상적으로 끝나야 한다.\r
        resultCheck: first는 True, second는 False여야 한다.\r
    check:\r
      noError: 디바운스 함수 정의와 호출이 끝나야 한다.\r
      resultCheck: processed 리스트가 처음 키만 담아야 한다.\r
  - id: time-window\r
    title: 같은 키 여러 번 호출\r
    structuredPrimary: true\r
    subtitle: 시간 창을 넘기면 다시 처리\r
    goal: 같은 키를 시간 창보다 짧은 간격으로 여러 번 호출하면 처음만 처리되고, 시간 창이 지나면 다시 처리된다.\r
    why: 자동화는 동일 파일이 여러 번 갱신될 때 안정화 시점에서만 처리해야 결과가 깔끔하다.\r
    explanation: time.sleep으로 시간 창을 충분히 보낸 뒤 다시 호출하면 디바운스 함수가 True를 돌려준다. 시간 창이 지나기 전 두 번째 호출은 항상 False다. 같은 키의 처리 카운터는 시간 창마다 한 번씩 늘어난다.\r
    tips:\r
      - sleep 시간을 시간 창보다 약간 크게 두면 안정적이다.\r
      - time.monotonic은 단조 증가 시계이므로 시간 비교에 적합하다.\r
    snippet: |-\r
      import time\r
\r
      lastSeen: dict[str, float] = {}\r
\r
\r
      def debounce(key: str, windowSeconds: float) -> bool:\r
          now = time.monotonic()\r
          if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
              return False\r
          lastSeen[key] = now\r
          return True\r
\r
\r
      results = []\r
      results.append(debounce("k", 0.15))\r
      results.append(debounce("k", 0.15))\r
      time.sleep(0.2)\r
      results.append(debounce("k", 0.15))\r
\r
      assert results == [True, False, True]\r
      results\r
    exercise:\r
      prompt: 같은 함수를 키 "ticket"에 세 번 호출하되 첫 두 호출은 빠르게, 세 번째는 sleep 후로 두어 결과 리스트가 [True, False, True]가 되는지 검증하세요.\r
      starterCode: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return False\r
            lastSeen[key] = now\r
            return True\r
\r
\r
        results = []\r
        results.append(debounce("ticket", 0.15))\r
        results.append(debounce("ticket", 0.15))\r
        time.sleep(___)\r
        results.append(debounce("ticket", 0.15))\r
\r
        assert results == [True, False, True]\r
        results\r
      solution: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return False\r
            lastSeen[key] = now\r
            return True\r
\r
\r
        results = []\r
        results.append(debounce("ticket", 0.15))\r
        results.append(debounce("ticket", 0.15))\r
        time.sleep(0.2)\r
        results.append(debounce("ticket", 0.15))\r
\r
        assert results == [True, False, True]\r
        results\r
      hints:\r
        - sleep 시간이 시간 창인 0.15초보다 커야 세 번째 호출이 True가 된다.\r
        - 0.2초가 안정적인 sleep 값이다.\r
      check:\r
        type: noError\r
        noError: 세 번의 디바운스 호출과 sleep이 끝나야 한다.\r
        resultCheck: results가 [True, False, True]여야 한다.\r
    check:\r
      noError: sleep과 디바운스 호출이 시간 창 전후로 끝나야 한다.\r
      resultCheck: results가 [True, False, True]로 시간 창 안 중복이 거른 결과여야 한다.\r
  - id: per-key-window\r
    title: 키별 독립 시간 창\r
    structuredPrimary: true\r
    subtitle: 한 키가 다른 키에 영향 없음\r
    goal: 두 다른 키는 각자 시간 창을 갖고 서로의 디바운스를 방해하지 않는다.\r
    why: 자동화는 보통 여러 파일을 동시에 다루므로 키별 독립이 보장되어야 결과가 의도대로 나온다.\r
    explanation: lastSeen dict는 키별로 마지막 시각을 따로 저장한다. 같은 시간 창 안에 두 다른 키를 호출하면 둘 다 True를 돌려준다. 자동화 시스템에서 이 패턴은 파일 단위 처리에 자연스럽다.\r
    tips:\r
      - 키 이름은 파일 절대 경로처럼 고유한 식별자로 두는 편이 안전하다.\r
      - dict.get 으로 기본값을 줄 수도 있지만 in 비교가 명확하다.\r
    snippet: |-\r
      import time\r
\r
      lastSeen: dict[str, float] = {}\r
\r
\r
      def debounce(key: str, windowSeconds: float) -> bool:\r
          now = time.monotonic()\r
          if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
              return False\r
          lastSeen[key] = now\r
          return True\r
\r
\r
      results = [debounce("a.txt", 0.3), debounce("b.txt", 0.3)]\r
\r
      assert results == [True, True]\r
      assert set(lastSeen.keys()) == {"a.txt", "b.txt"}\r
      results\r
    exercise:\r
      prompt: 디바운스에 두 다른 키 alpha.csv와 beta.csv를 한 시간 창 안에 호출해 두 결과 모두 True가 되는지 검증하세요.\r
      starterCode: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if ___ in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return False\r
            lastSeen[key] = now\r
            return True\r
\r
\r
        results = [debounce("alpha.csv", 0.3), debounce("beta.csv", 0.3)]\r
\r
        assert results == [True, True]\r
        results\r
      solution: |-\r
        import time\r
\r
        lastSeen: dict[str, float] = {}\r
\r
\r
        def debounce(key: str, windowSeconds: float) -> bool:\r
            now = time.monotonic()\r
            if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                return False\r
            lastSeen[key] = now\r
            return True\r
\r
\r
        results = [debounce("alpha.csv", 0.3), debounce("beta.csv", 0.3)]\r
\r
        assert results == [True, True]\r
        results\r
      hints:\r
        - in 비교의 좌변에는 함수 인자 변수 key를 그대로 둔다.\r
        - 두 다른 키는 서로의 lastSeen 항목과 무관하다.\r
      check:\r
        type: noError\r
        noError: 두 키 디바운스 호출이 정상적으로 끝나야 한다.\r
        resultCheck: results가 [True, True]여야 한다.\r
    check:\r
      noError: 키별 독립 시간 창 호출이 끝나야 한다.\r
      resultCheck: 두 키 모두 True가 나오고 lastSeen에 두 키가 모두 등록되어야 한다.\r
  - id: debounce-summary\r
    title: 디바운스 사이클 종합 정리\r
    structuredPrimary: true\r
    subtitle: 처리 결과 dict로 묶기\r
    goal: 한 사이클 안의 디바운스 결과를 키별 처리 횟수 dict로 정리해 자동화 보고를 만든다.\r
    why: 종합 정리는 다음 단계가 같은 dict를 받아 처리할 수 있게 만들고 운영자에게 처리 통계를 단숨에 보여 준다.\r
    explanation: 마지막 섹션은 여러 호출을 한 함수로 묶어 키별 처리 횟수를 돌려준다. dict 키는 입력 키와 같고 값은 처리된 횟수다. 시간 창보다 짧은 호출은 카운트되지 않는다. 같은 함수를 두 번 호출하면 누적된 결과가 늘어난다.\r
    tips:\r
      - 처리 횟수가 0이면 입력 키가 모두 시간 창 안에 들어왔음을 의미한다.\r
      - 종합 결과 dict는 자동화 대시보드의 표준 입력이다.\r
    snippet: |-\r
      import time\r
\r
\r
      def summarizeDebounce(events: list[tuple[str, float]], windowSeconds: float) -> dict:\r
          lastSeen: dict[str, float] = {}\r
          counts: dict[str, int] = {}\r
          startedAt = time.monotonic()\r
          for key, offset in events:\r
              now = startedAt + offset\r
              if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                  counts.setdefault(key, 0)\r
                  continue\r
              lastSeen[key] = now\r
              counts[key] = counts.get(key, 0) + 1\r
          return counts\r
\r
\r
      summary = summarizeDebounce(\r
          [("a", 0.0), ("a", 0.05), ("a", 0.4), ("b", 0.1)],\r
          windowSeconds=0.2,\r
      )\r
\r
      assert summary == {"a": 2, "b": 1}\r
      summary\r
    exercise:\r
      prompt: 'summarizeDebounce에 "x"가 두 번, "y"가 한 번 들어오되 x의 두 호출이 시간 창 안에 있도록 두어 결과가 {"x": 1, "y": 1}이 되는지 검증하세요.'\r
      starterCode: |-\r
        import time\r
\r
\r
        def summarizeDebounce(events: list[tuple[str, float]], windowSeconds: float) -> dict:\r
            lastSeen: dict[str, float] = {}\r
            counts: dict[str, int] = {}\r
            startedAt = time.monotonic()\r
            for key, offset in events:\r
                now = startedAt + offset\r
                if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                    counts.setdefault(key, 0)\r
                    continue\r
                lastSeen[key] = now\r
                counts[key] = counts.get(key, 0) + ___\r
            return counts\r
\r
\r
        summary = summarizeDebounce(\r
            [("x", 0.0), ("x", 0.05), ("y", 0.1)],\r
            windowSeconds=0.2,\r
        )\r
\r
        assert summary == {"x": 1, "y": 1}\r
        summary\r
      solution: |-\r
        import time\r
\r
\r
        def summarizeDebounce(events: list[tuple[str, float]], windowSeconds: float) -> dict:\r
            lastSeen: dict[str, float] = {}\r
            counts: dict[str, int] = {}\r
            startedAt = time.monotonic()\r
            for key, offset in events:\r
                now = startedAt + offset\r
                if key in lastSeen and now - lastSeen[key] < windowSeconds:\r
                    counts.setdefault(key, 0)\r
                    continue\r
                lastSeen[key] = now\r
                counts[key] = counts.get(key, 0) + 1\r
            return counts\r
\r
\r
        summary = summarizeDebounce(\r
            [("x", 0.0), ("x", 0.05), ("y", 0.1)],\r
            windowSeconds=0.2,\r
        )\r
\r
        assert summary == {"x": 1, "y": 1}\r
        summary\r
      hints:\r
        - 카운터를 1만큼 더하면 처리 횟수가 정확히 늘어난다.\r
        - x의 두 번째 호출은 시간 창 안이라 처리되지 않는다.\r
      check:\r
        type: noError\r
        noError: 종합 함수 호출과 dict 반환이 끝나야 한다.\r
        resultCheck: 'summary가 {"x": 1, "y": 1}로 본문 기대값과 같아야 한다.'\r
    check:\r
      noError: 종합 디바운스 함수와 입력 이벤트 처리가 끝나야 한다.\r
      resultCheck: summary가 a 2회, b 1회로 종합 정리 결과를 정확히 보고해야 한다.\r
`;export{e as default};