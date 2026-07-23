var e=`meta:
  id: inputCtl_03
  title: 마우스 이동과 클릭
  order: 3
  category: inputCtl
  difficulty: easy
  audience: GUI 자동화에 입문하는 Python 학습자
  packages:
    - pyautogui
  tags:
    - pyautogui
    - mouse
    - automation
intro:
  direction: pyautogui.moveTo와 click을 실제 호출하면서 현재 좌표 복귀 패턴과 안전 래퍼를 만들어 마우스 자동화의 기본 동작을 익힌다.
  benefits:
    - pyautogui.moveTo로 마우스를 정해진 좌표로 옮기고 position()으로 확인한다.
    - 작업 전후 좌표를 기록해 마우스를 원위치로 복귀시킨다.
    - 안전 클릭 래퍼로 onScreen 검사를 통과한 좌표만 클릭한다.
    - 종합 시나리오 함수가 이동과 클릭 흐름을 한 번에 보고한다.
  diagram:
    steps:
      - label: 현재 좌표 보관
        detail: pyautogui.position()으로 시작 좌표를 받아 변수에 보관한다.
      - label: moveTo로 이동
        detail: pyautogui.moveTo(x, y, duration)로 마우스를 옮기고 position()으로 확인한다.
      - label: 원위치 복귀
        detail: 보관한 좌표로 다시 moveTo해 자동화가 사용자 상태를 어지럽히지 않게 한다.
      - label: 안전 클릭 래퍼
        detail: onScreen으로 검사한 좌표만 click 호출해 화면 밖 클릭을 막는다.
    runtime:
      - label: pyautogui 패키지 필요
        detail: meta.packages의 pyautogui가 로컬 환경에 준비돼야 한다.
      - label: 실제 마우스 움직임
        detail: snippet 실행 시 마우스가 잠시 움직이므로 다른 작업과 겹치지 않게 한다.
sections:
  - id: move-and-restore
    title: 이동과 원위치 복귀
    structuredPrimary: true
    subtitle: position 보관 패턴
    goal: 시작 좌표를 보관한 뒤 moveTo로 이동하고 다시 보관 좌표로 돌아가는 안전 패턴을 익힌다.
    why: 자동화가 마우스를 옮긴 뒤 사용자 작업을 방해하지 않으려면 시작 좌표로 복귀하는 패턴이 표준이다.
    explanation: pyautogui.moveTo(x, y, duration)는 마우스를 절대 좌표로 옮긴다. duration은 이동 시간이며 0이면 즉시 이동한다. position()을 호출하면 이동 결과를 확인할 수 있다.
    tips:
      - duration을 짧게 두면 자동화가 빠르고, 길게 두면 사용자가 흐름을 눈으로 따라가기 좋다.
      - 시작 좌표를 변수에 보관하는 습관이 사고 복구를 쉽게 만든다.
    snippet: |-
      import pyautogui

      origin = pyautogui.position()
      pyautogui.moveTo(origin.x, origin.y, duration=0.0)
      moved = pyautogui.position()
      pyautogui.moveTo(origin.x, origin.y, duration=0.0)

      assert moved.x == origin.x
      assert moved.y == origin.y
      (origin.x, origin.y)
    exercise:
      prompt: 시작 좌표를 보관한 뒤 같은 좌표로 moveTo해 position이 원래대로 유지되는지 검증하세요.
      starterCode: |-
        import pyautogui

        origin = pyautogui.position()
        pyautogui.___(origin.x, origin.y, duration=0.0)
        moved = pyautogui.position()

        assert moved.x == origin.x
        assert moved.y == origin.y
        (moved.x, moved.y)
      solution: |-
        import pyautogui

        origin = pyautogui.position()
        pyautogui.moveTo(origin.x, origin.y, duration=0.0)
        moved = pyautogui.position()

        assert moved.x == origin.x
        assert moved.y == origin.y
        (moved.x, moved.y)
      hints:
        - 절대 좌표 이동 함수 이름은 moveTo다.
        - duration=0이면 마우스가 즉시 이동한다.
      check:
        noError: moveTo와 position 호출이 끝나야 한다.
        resultCheck: moved의 좌표가 origin과 같아야 한다.
    check:
      noError: moveTo와 position 두 호출이 끝나야 한다.
      resultCheck: moved와 origin 좌표가 같아야 한다.
  - id: move-rel
    title: 상대 이동
    structuredPrimary: true
    subtitle: pyautogui.moveRel()
    goal: pyautogui.moveRel로 현재 좌표 기준 상대 이동을 수행하고 결과 좌표를 검증한다.
    why: 상대 이동은 화면 해상도에 의존하지 않는 자동화 패턴이라 다른 모니터에서도 안전하게 동작한다.
    explanation: pyautogui.moveRel(dx, dy, duration)은 현재 좌표에 (dx, dy)를 더한 위치로 이동한다. moveRel(0, 0)은 마우스를 움직이지 않으면서 호출 흐름을 검증할 수 있는 안전한 no-op이다. 이동 후 좌표는 position()으로 다시 확인할 수 있다.
    tips:
      - moveRel(0, 0)은 자동화 코드의 흐름 검증용으로 유용하다.
      - 상대 이동은 해상도가 바뀌어도 깨지지 않는다.
    snippet: |-
      import pyautogui

      before = pyautogui.position()
      pyautogui.moveRel(0, 0, duration=0.0)
      after = pyautogui.position()

      assert after.x == before.x
      assert after.y == before.y
      (before.x, after.x)
    exercise:
      prompt: moveRel(0, 0)을 호출한 뒤 좌표가 그대로 유지되는지 검증하세요.
      starterCode: |-
        import pyautogui

        before = pyautogui.position()
        pyautogui.___(0, 0, duration=0.0)
        after = pyautogui.position()

        assert after.x == before.x
        assert after.y == before.y
        (before.x, after.x)
      solution: |-
        import pyautogui

        before = pyautogui.position()
        pyautogui.moveRel(0, 0, duration=0.0)
        after = pyautogui.position()

        assert after.x == before.x
        assert after.y == before.y
        (before.x, after.x)
      hints:
        - 상대 이동 함수 이름은 moveRel이다.
        - (0, 0) 인자는 마우스를 움직이지 않는다.
      check:
        noError: moveRel 호출이 끝나야 한다.
        resultCheck: after와 before의 x 값이 같아야 한다.
    check:
      noError: moveRel 호출이 끝나야 한다.
      resultCheck: 이동 전후 좌표가 같아야 한다.
  - id: safe-click
    title: 안전 클릭 래퍼
    structuredPrimary: true
    subtitle: onScreen 검사 후 click
    goal: onScreen 검사를 통과한 좌표만 pyautogui.click을 호출하는 래퍼 함수를 만든다.
    why: 화면 밖 좌표 클릭은 무시되거나 FAILSAFE 모서리를 잘못 건드릴 수 있어 사전 검사가 안전한 자동화의 표준이다.
    explanation: safeClick 함수는 (x, y, button)을 받아 onScreen 검사 후에만 pyautogui.click을 호출한다. 검사를 통과하지 않으면 False를 돌려주고 클릭을 건너뛴다. button 인자는 "left", "right", "middle" 중 하나다.
    tips:
      - 래퍼 함수는 호출자가 화면 밖 좌표를 만들어도 사고가 나지 않게 보호한다.
      - 클릭 결과는 boolean으로 돌려줘 호출 측이 분기를 만들 수 있다.
    snippet: |-
      import pyautogui


      def safeClick(x: int, y: int, button: str = "left") -> bool:
          if not pyautogui.onScreen(x, y):
              return False
          pyautogui.click(x=x, y=y, button=button, _pause=False)
          return True


      blocked = safeClick(-100, -100)

      assert blocked is False
      assert callable(safeClick)
      blocked
    exercise:
      prompt: safeClick에 화면 밖 좌표 (-200, -200)을 넘기면 False가 돌아오고 click이 호출되지 않는지 검증하세요.
      starterCode: |-
        import pyautogui


        def safeClick(x: int, y: int, button: str = "left") -> bool:
            if not pyautogui.___(x, y):
                return False
            pyautogui.click(x=x, y=y, button=button, _pause=False)
            return True


        blocked = safeClick(-200, -200)

        assert blocked is False
        blocked
      solution: |-
        import pyautogui


        def safeClick(x: int, y: int, button: str = "left") -> bool:
            if not pyautogui.onScreen(x, y):
                return False
            pyautogui.click(x=x, y=y, button=button, _pause=False)
            return True


        blocked = safeClick(-200, -200)

        assert blocked is False
        blocked
      hints:
        - 화면 안 여부를 검사하는 함수 이름은 onScreen이다.
        - 화면 밖 좌표는 False를 돌려주고 클릭을 생략한다.
      check:
        noError: safeClick 호출이 끝나야 한다.
        resultCheck: blocked가 False여야 한다.
    check:
      noError: safeClick 함수 호출이 끝나야 한다.
      resultCheck: blocked가 False여야 한다.
  - id: trip-report
    title: 종합 이동 보고
    structuredPrimary: true
    subtitle: 이동과 복귀 한 함수로
    goal: 시작 좌표 저장, 이동, 복귀를 한 함수로 묶어 이동 거리와 복귀 성공 여부를 dict로 돌려준다.
    why: 종합 보고 함수는 자동화 사이클이 사용자 상태를 어지럽히지 않았다는 사실을 운영자가 검증하게 만든다.
    explanation: mouseTrip 함수는 (dx, dy)만큼 상대 이동한 뒤 원위치로 복귀하고 origin, destination, restored 세 좌표와 returnedHome boolean을 dict로 돌려준다. duration 인자로 이동 속도를 조절한다. 결과 dict는 자동화 로그에 그대로 기록된다.
    tips:
      - 이동 거리가 0이면 mouseTrip은 마우스를 건드리지 않으면서도 함수 구조를 검증한다.
      - returnedHome 값이 True여야 자동화가 사용자 상태를 보존했다고 본다.
    snippet: |-
      import pyautogui


      def mouseTrip(dx: int, dy: int, duration: float = 0.0) -> dict:
          origin = pyautogui.position()
          pyautogui.moveRel(dx, dy, duration=duration)
          destination = pyautogui.position()
          pyautogui.moveTo(origin.x, origin.y, duration=duration)
          restored = pyautogui.position()
          return {
              "origin": {"x": origin.x, "y": origin.y},
              "destination": {"x": destination.x, "y": destination.y},
              "restored": {"x": restored.x, "y": restored.y},
              "returnedHome": restored.x == origin.x and restored.y == origin.y,
          }


      report = mouseTrip(0, 0)

      assert report["returnedHome"] is True
      assert report["origin"] == report["restored"]
      report
    exercise:
      prompt: mouseTrip(0, 0)을 호출해 returnedHome이 True이고 origin과 restored 좌표가 동일한지 종합 검증하세요.
      starterCode: |-
        import pyautogui


        def mouseTrip(dx: int, dy: int, duration: float = 0.0) -> dict:
            origin = pyautogui.position()
            pyautogui.moveRel(dx, dy, duration=duration)
            destination = pyautogui.position()
            pyautogui.moveTo(origin.x, origin.y, duration=duration)
            restored = pyautogui.position()
            return {
                "origin": {"x": origin.x, "y": origin.y},
                "destination": {"x": destination.x, "y": destination.y},
                "restored": {"x": restored.x, "y": restored.y},
                "returnedHome": restored.x == origin.x and restored.y == ___.y,
            }


        report = mouseTrip(0, 0)

        assert report["returnedHome"] is True
        assert report["origin"] == report["restored"]
        report
      solution: |-
        import pyautogui


        def mouseTrip(dx: int, dy: int, duration: float = 0.0) -> dict:
            origin = pyautogui.position()
            pyautogui.moveRel(dx, dy, duration=duration)
            destination = pyautogui.position()
            pyautogui.moveTo(origin.x, origin.y, duration=duration)
            restored = pyautogui.position()
            return {
                "origin": {"x": origin.x, "y": origin.y},
                "destination": {"x": destination.x, "y": destination.y},
                "restored": {"x": restored.x, "y": restored.y},
                "returnedHome": restored.x == origin.x and restored.y == origin.y,
            }


        report = mouseTrip(0, 0)

        assert report["returnedHome"] is True
        assert report["origin"] == report["restored"]
        report
      hints:
        - 복귀 좌표는 origin 변수에 보관돼 있다.
        - returnedHome 비교 대상은 origin.y다.
      check:
        noError: mouseTrip 호출이 종합 결과를 돌려줘야 한다.
        resultCheck: report의 returnedHome이 True이고 origin과 restored가 같아야 한다.
    check:
      noError: mouseTrip 함수 호출이 끝나야 한다.
      resultCheck: report의 returnedHome이 True여야 한다.
`;export{e as default};