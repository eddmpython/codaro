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
  - id: watchSched_07-cron-field-parse-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - cron-trigger
    - schedule-summary
    title: 제한된 cron minute·hour field를 값 집합으로 파싱하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: wildcard·목록·단일 숫자의 범위를 검사해 예정 조합을 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 지원하는 cron 문법 범위를 명시하고 모르는 표현을 추측하지 마세요.
    - 중복 값을 제거한 뒤 하루 예상 fire 수를 계산하세요.
    exercise:
      prompt: parse_cron_fields(minute_field, hour_field)를 완성하세요.
      starterCode: |-
        def parse_cron_fields(minute_field, hour_field):
            raise NotImplementedError
      solution: |
        def parse_cron_fields(minute_field, hour_field):
            def parse(field, minimum, maximum):
                if field == "*":
                    return list(range(minimum, maximum + 1))
                values = []
                for part in field.split(","):
                    if not part.isdigit():
                        raise ValueError("unsupported cron field")
                    value = int(part)
                    if not minimum <= value <= maximum:
                        raise ValueError("cron value out of range")
                    values.append(value)
                return sorted(set(values))
            minutes = parse(minute_field, 0, 59)
            hours = parse(hour_field, 0, 23)
            return {"minutes": minutes, "hours": hours, "dailyFireCount": len(minutes) * len(hours)}
      hints: *id001
    check:
      id: python.watchsched.watchSched_07.cron-field-parse.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_07.cron-field-parse.mastery.behavior.v1.fixture
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
        entry: parse_cron_fields
        cases:
        - id: parses-single-time
          arguments:
          - value: '30'
          - value: '9'
          expectedReturn:
            minutes:
            - 30
            hours:
            - 9
            dailyFireCount: 1
        - id: parses-deduplicated-lists
          arguments:
          - value: 0,30,0
          - value: 9,18
          expectedReturn:
            minutes:
            - 0
            - 30
            hours:
            - 9
            - 18
            dailyFireCount: 4
        - id: rejects-minute-out-of-range
          arguments:
          - value: '60'
          - value: '9'
          expectedException: ValueError
        - id: rejects-unsupported-step
          arguments:
          - value: '*/5'
          - value: '9'
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: watchSched_07-cron-fire-audit-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_07-cron-field-parse-mastery
    title: 새 cron schedule에 과도한 fire·업무시간 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 하루 fire 수와 허용 hour 범위를 정책과 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - cron 문자열이 유효해도 하루 실행 budget을 초과할 수 있습니다.
    - 허용 업무시간 밖 fire를 별도 실패로 표시하세요.
    exercise:
      prompt: audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours)를 완성하세요.
      starterCode: |-
        def audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours):
            raise NotImplementedError
      solution: |
        def audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours):
            fire_count = len(set(minutes)) * len(set(hours))
            outside = sorted(set(hours) - set(allowed_hours))
            failures = []
            if fire_count > maximum_daily_fires:
                failures.append("fire-budget")
            if outside:
                failures.append("hours")
            if not minutes or not hours:
                failures.append("empty")
            return {"accepted": not failures, "failures": failures, "dailyFireCount": fire_count, "outsideHours": outside}
      hints: *id002
    check:
      id: python.watchsched.watchSched_07.cron-fire-audit.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_07.cron-fire-audit.transfer.behavior.v1.fixture
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
        entry: audit_cron_schedule
        cases:
        - id: accepts-two-business-hour-fires
          arguments:
          - value:
            - 0
          - value:
            - 9
            - 18
          - value: 3
          - value:
            - 9
            - 10
            - 11
            - 12
            - 13
            - 14
            - 15
            - 16
            - 17
            - 18
          expectedReturn:
            accepted: true
            failures: []
            dailyFireCount: 2
            outsideHours: []
        - id: reports-budget-and-hours
          arguments:
          - value:
            - 0
            - 30
          - value:
            - 1
            - 2
          - value: 2
          - value:
            - 9
          expectedReturn:
            accepted: false
            failures:
            - fire-budget
            - hours
            dailyFireCount: 4
            outsideHours:
            - 1
            - 2
        - id: reports-empty-schedule
          arguments:
          - value: []
          - value:
            - 9
          - value: 1
          - value:
            - 9
          expectedReturn:
            accepted: false
            failures:
            - empty
            dailyFireCount: 0
            outsideHours: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: watchSched_07-cron-expression-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - watchSched_07-cron-fire-audit-transfer
    title: cron 표현식 검증 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 문법·timezone·fire budget 근거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - event나 시간이 발생했다는 사실보다 처리 identity와 결과 evidence를 검증하세요.
    - 중복·지연·재시작 상황에서 같은 업무 결과가 보존되는지 확인하세요.
    exercise:
      prompt: choose_cron_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_cron_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_cron_evidence(situation):
            table = {'syntax': {'action': 'parse supported fields strictly', 'evidence': 'normalized value sets', 'risk': 'unsupported syntax'}, 'timezone': {'action': 'bind schedule timezone', 'evidence': 'zone and DST fixtures', 'risk': 'shifted fire'}, 'budget': {'action': 'count daily fires and hours', 'evidence': 'fire count and outside hours', 'risk': 'runaway schedule'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.watchsched.watchSched_07.cron-expression-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.watchsched.watchSched_07.cron-expression-recall.retrieval.behavior.v1.fixture
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
        entry: choose_cron_evidence
        cases:
        - id: recalls-syntax
          arguments:
          - value: syntax
          expectedReturn:
            action: parse supported fields strictly
            evidence: normalized value sets
            risk: unsupported syntax
        - id: recalls-timezone
          arguments:
          - value: timezone
          expectedReturn:
            action: bind schedule timezone
            evidence: zone and DST fixtures
            risk: shifted fire
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};