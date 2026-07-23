var e=`meta:
  id: watchSched_07
  title: cron 표현식과 트리거
  order: 7
  category: watchSched
  difficulty: easy
  audience: 폴더 이벤트와 스케줄 자동화에 입문하는 Python 학습자
  packages:
  - apscheduler
  tags:
    - apscheduler
    - cron
    - trigger
intro:
  direction: APScheduler의 CronTrigger와 IntervalTrigger를 직접 만들어 다음 실행 시각을 계산하고 자동화 스케줄을 설계한다.
  benefits:
    - CronTrigger의 인자 형식을 익힌다.
    - IntervalTrigger와 비교해 어느 경우에 어떤 트리거를 쓰는지 안다.
    - get_next_fire_time으로 다음 실행 시각을 미리 본다.
    - 종합 스케줄 dict로 자동화 표준 보고를 만든다.
  diagram:
    steps:
      - label: CronTrigger 만들기
        detail: hour와 minute 인자로 분 단위 트리거를 정의한다.
      - label: 다음 실행 시각 계산
        detail: get_next_fire_time에 기준 시각을 넘겨 다음 시각을 받는다.
      - label: IntervalTrigger 비교
        detail: minutes 인자로 간단한 인터벌 트리거를 만든다.
      - label: 종합 스케줄 dict
        detail: 두 트리거의 다음 실행 시각을 한 dict로 묶어 자동화 보고에 사용한다.
    runtime:
      - label: APScheduler 패키지 필요
        detail: meta.packages의 APScheduler가 로컬 가상환경에 준비되어야 한다.
      - label: assert 기반 검증
        detail: 트리거 다음 실행 시각을 datetime 비교로 확인한다.
sections:
  - id: cron-trigger
    title: CronTrigger 만들기
    structuredPrimary: true
    subtitle: hour, minute 인자
    goal: hour=12, minute=30 형태로 매일 12시 30분에 실행되는 cron 트리거를 만든다.
    why: 자동화는 특정 시각에 실행되는 작업이 자주 필요하므로 CronTrigger 인자 형식을 정확히 익혀야 한다.
    explanation: CronTrigger는 hour, minute, second, day_of_week 같은 cron 필드를 인자로 받는다. 모든 인자가 정수 또는 cron 문자열이며 생략하면 별표(모든 값)다. timezone은 기본적으로 시스템 timezone을 사용한다.
    tips:
      - day_of_week은 mon, tue 같은 짧은 영어 표기를 받는다.
      - 학습 셀에서는 일관된 비교를 위해 timezone을 UTC로 두면 결과가 안정적이다.
    snippet: |-
      from apscheduler.triggers.cron import CronTrigger

      trigger = CronTrigger(hour=12, minute=30, timezone="UTC")
      summary = {"type": type(trigger).__name__}

      assert summary == {"type": "CronTrigger"}
      summary
    exercise:
      prompt: 같은 형식으로 매일 9시 0분에 실행되는 CronTrigger를 만들고 타입 이름이 CronTrigger인지 검증하세요.
      starterCode: |-
        from apscheduler.triggers.cron import CronTrigger

        trigger = CronTrigger(hour=___, minute=0, timezone="UTC")
        summary = {"type": type(trigger).__name__}

        assert summary == {"type": "CronTrigger"}
        summary
      solution: |-
        from apscheduler.triggers.cron import CronTrigger

        trigger = CronTrigger(hour=9, minute=0, timezone="UTC")
        summary = {"type": type(trigger).__name__}

        assert summary == {"type": "CronTrigger"}
        summary
      hints:
        - 9시는 정수 9로 인자에 들어간다.
        - timezone 문자열은 UTC로 둔다.
      check:
        noError: CronTrigger 생성이 ValueError 없이 끝나야 한다.
        resultCheck: summary의 type 키가 "CronTrigger"여야 한다.
    check:
      noError: CronTrigger 생성과 type 확인이 끝나야 한다.
      resultCheck: summary가 CronTrigger 타입 이름을 정확히 담아야 한다.
  - id: next-fire-time
    title: 다음 실행 시각 계산
    structuredPrimary: true
    subtitle: get_next_fire_time
    goal: 기준 시각을 넘겨 cron 트리거의 다음 실행 시각을 계산한다.
    why: 자동화에서는 실제 실행 전에 다음 시각을 미리 알아야 안내 메시지나 대시보드에 표시할 수 있다.
    explanation: get_next_fire_time(previous_fire_time, now)는 cron 표현식에서 now 이후 첫 실행 시각을 돌려준다. 인자는 모두 timezone-aware datetime이어야 정확한 비교가 가능하다. 결과는 같은 timezone의 datetime이다.
    tips:
      - now가 트리거 시각과 정확히 같으면 다음 사이클로 넘어간다.
      - timezone-naive datetime을 넘기면 TypeError가 발생한다.
    snippet: |-
      from datetime import datetime
      from zoneinfo import ZoneInfo

      from apscheduler.triggers.cron import CronTrigger

      utc = ZoneInfo("UTC")
      trigger = CronTrigger(hour=12, minute=0, timezone=utc)
      base = datetime(2024, 9, 1, 11, 0, tzinfo=utc)
      nextFire = trigger.get_next_fire_time(None, base)

      assert nextFire == datetime(2024, 9, 1, 12, 0, tzinfo=utc)
      nextFire
    exercise:
      prompt: 매일 9시 30분 트리거의 base=2024-09-01 08:00 UTC 다음 실행 시각이 같은 날 9시 30분인지 검증하세요.
      starterCode: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.cron import CronTrigger

        utc = ZoneInfo("UTC")
        trigger = CronTrigger(hour=9, minute=30, timezone=utc)
        base = datetime(2024, 9, 1, 8, 0, tzinfo=___)
        nextFire = trigger.get_next_fire_time(None, base)

        assert nextFire == datetime(2024, 9, 1, 9, 30, tzinfo=utc)
        nextFire
      solution: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.cron import CronTrigger

        utc = ZoneInfo("UTC")
        trigger = CronTrigger(hour=9, minute=30, timezone=utc)
        base = datetime(2024, 9, 1, 8, 0, tzinfo=utc)
        nextFire = trigger.get_next_fire_time(None, base)

        assert nextFire == datetime(2024, 9, 1, 9, 30, tzinfo=utc)
        nextFire
      hints:
        - tzinfo 인자에는 utc 변수를 그대로 넘긴다.
        - 기준 시각이 8시이면 다음은 같은 날 9시 30분이다.
      check:
        noError: get_next_fire_time 호출이 TypeError 없이 끝나야 한다.
        resultCheck: nextFire가 정확히 2024-09-01 09:30 UTC여야 한다.
    check:
      noError: get_next_fire_time 호출이 정상적으로 끝나야 한다.
      resultCheck: nextFire가 정확히 2024-09-01 12:00 UTC여야 한다.
  - id: interval-trigger
    title: IntervalTrigger 비교
    structuredPrimary: true
    subtitle: minutes 인자 사용
    goal: 일정 간격으로 반복되는 IntervalTrigger를 만들고 다음 실행 시각을 계산한다.
    why: 자동화는 cron 표현 대신 N분마다 같은 간격으로 실행하는 흐름이 더 단순한 경우가 많다.
    explanation: IntervalTrigger(minutes=5)는 시작 시각을 기준으로 5분마다 트리거된다. start_date 인자를 명시하면 기준 시각을 정할 수 있다. 같은 get_next_fire_time API로 다음 시각을 받는다.
    tips:
      - minutes 외에 seconds, hours, weeks 같은 인자도 가능하다.
      - 매우 짧은 인터벌은 학습에서는 적합하지만 운영에서는 부하를 만들 수 있다.
    snippet: |-
      from datetime import datetime
      from zoneinfo import ZoneInfo

      from apscheduler.triggers.interval import IntervalTrigger

      utc = ZoneInfo("UTC")
      start = datetime(2024, 9, 1, 9, 0, tzinfo=utc)
      trigger = IntervalTrigger(minutes=15, start_date=start, timezone=utc)
      nextFire = trigger.get_next_fire_time(None, datetime(2024, 9, 1, 9, 10, tzinfo=utc))

      assert nextFire == datetime(2024, 9, 1, 9, 15, tzinfo=utc)
      nextFire
    exercise:
      prompt: 30분 간격 트리거에서 base=2024-09-01 10:05 UTC의 다음 실행 시각이 같은 날 10시 30분인지 검증하세요.
      starterCode: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.interval import IntervalTrigger

        utc = ZoneInfo("UTC")
        start = datetime(2024, 9, 1, 10, 0, tzinfo=utc)
        trigger = IntervalTrigger(minutes=___, start_date=start, timezone=utc)
        nextFire = trigger.get_next_fire_time(None, datetime(2024, 9, 1, 10, 5, tzinfo=utc))

        assert nextFire == datetime(2024, 9, 1, 10, 30, tzinfo=utc)
        nextFire
      solution: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.interval import IntervalTrigger

        utc = ZoneInfo("UTC")
        start = datetime(2024, 9, 1, 10, 0, tzinfo=utc)
        trigger = IntervalTrigger(minutes=30, start_date=start, timezone=utc)
        nextFire = trigger.get_next_fire_time(None, datetime(2024, 9, 1, 10, 5, tzinfo=utc))

        assert nextFire == datetime(2024, 9, 1, 10, 30, tzinfo=utc)
        nextFire
      hints:
        - 간격 인자는 정수 30이다.
        - start_date가 10시이면 30분 간격 다음 시각은 10시 30분이다.
      check:
        noError: IntervalTrigger 생성과 다음 시각 계산이 끝나야 한다.
        resultCheck: nextFire가 정확히 2024-09-01 10:30 UTC여야 한다.
    check:
      noError: IntervalTrigger 호출과 시각 비교가 끝나야 한다.
      resultCheck: nextFire가 정확히 2024-09-01 09:15 UTC여야 한다.
  - id: schedule-summary
    title: 종합 스케줄 보고
    structuredPrimary: true
    subtitle: 두 트리거 한 dict로
    goal: cron과 interval 두 트리거의 다음 실행 시각을 한 dict로 묶어 자동화 표준 보고를 만든다.
    why: 자동화 대시보드는 여러 트리거의 다음 시각을 동시에 보여 줘야 운영자가 흐름을 한눈에 파악할 수 있다.
    explanation: previewTriggers 함수는 cron과 interval 트리거 두 개를 만들고 기준 시각에서 다음 실행 시각을 받아 dict로 묶는다. 키 이름은 cron과 interval로 두어 후속 자동화 코드가 단순해진다. 같은 함수는 두 번 호출해도 같은 dict 구조를 유지한다.
    tips:
      - 결과 dict 키는 짧고 명확한 이름이 좋다.
      - 종합 보고는 timezone을 통일해 비교 오류를 막는다.
    snippet: |-
      from datetime import datetime
      from zoneinfo import ZoneInfo

      from apscheduler.triggers.cron import CronTrigger
      from apscheduler.triggers.interval import IntervalTrigger


      def previewTriggers(now: datetime) -> dict:
          cron = CronTrigger(hour=12, minute=0, timezone=now.tzinfo)
          interval = IntervalTrigger(minutes=10, start_date=now.replace(minute=0, second=0, microsecond=0), timezone=now.tzinfo)
          return {
              "cron": cron.get_next_fire_time(None, now),
              "interval": interval.get_next_fire_time(None, now),
          }


      utc = ZoneInfo("UTC")
      summary = previewTriggers(datetime(2024, 9, 1, 11, 5, tzinfo=utc))

      assert summary["cron"] == datetime(2024, 9, 1, 12, 0, tzinfo=utc)
      assert summary["interval"] == datetime(2024, 9, 1, 11, 10, tzinfo=utc)
      summary
    exercise:
      prompt: previewTriggers에 2024-09-01 09:05 UTC를 넘기면 cron이 12시, interval이 09시 10분이 되는지 종합 검증하세요.
      starterCode: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.cron import CronTrigger
        from apscheduler.triggers.interval import IntervalTrigger


        def previewTriggers(now: datetime) -> dict:
            cron = CronTrigger(hour=12, minute=0, timezone=now.tzinfo)
            interval = IntervalTrigger(minutes=10, start_date=now.replace(minute=0, second=0, microsecond=0), timezone=now.tzinfo)
            return {
                "cron": cron.get_next_fire_time(None, now),
                "interval": interval.get_next_fire_time(None, now),
            }


        utc = ZoneInfo("UTC")
        summary = previewTriggers(datetime(2024, 9, 1, ___, 5, tzinfo=utc))

        assert summary["cron"] == datetime(2024, 9, 1, 12, 0, tzinfo=utc)
        assert summary["interval"] == datetime(2024, 9, 1, 9, 10, tzinfo=utc)
        summary
      solution: |-
        from datetime import datetime
        from zoneinfo import ZoneInfo

        from apscheduler.triggers.cron import CronTrigger
        from apscheduler.triggers.interval import IntervalTrigger


        def previewTriggers(now: datetime) -> dict:
            cron = CronTrigger(hour=12, minute=0, timezone=now.tzinfo)
            interval = IntervalTrigger(minutes=10, start_date=now.replace(minute=0, second=0, microsecond=0), timezone=now.tzinfo)
            return {
                "cron": cron.get_next_fire_time(None, now),
                "interval": interval.get_next_fire_time(None, now),
            }


        utc = ZoneInfo("UTC")
        summary = previewTriggers(datetime(2024, 9, 1, 9, 5, tzinfo=utc))

        assert summary["cron"] == datetime(2024, 9, 1, 12, 0, tzinfo=utc)
        assert summary["interval"] == datetime(2024, 9, 1, 9, 10, tzinfo=utc)
        summary
      hints:
        - 시각 hour 인자는 정수 9다.
        - 9시 기준이면 cron 12시, interval 다음은 9시 10분이다.
      check:
        noError: previewTriggers 호출과 두 트리거 계산이 끝나야 한다.
        resultCheck: summary의 cron과 interval이 본문 기대값과 같아야 한다.
    check:
      noError: previewTriggers 호출이 종합 정리 흐름으로 끝나야 한다.
      resultCheck: summary가 cron 12시, interval 11시 10분을 정확히 담아야 한다.
`;export{e as default};