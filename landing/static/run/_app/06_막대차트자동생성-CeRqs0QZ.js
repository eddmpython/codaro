var e=`meta:
  id: xlwings_06
  title: 음악 스트리밍 차트 자동 생성
  order: 6
  category: xlwings
  badge: 중급
  difficulty: medium
  audience: 수식과 서식까지 익히고, 이제 시각 차트를 코드로 자동 생성하고 싶은 학습자
  packages:
    - xlwings
    - pandas
  outcomes: ["automation.excel.charts"]
  prerequisites: ["automation.excel.workbook"]
  estimatedMinutes: 55
  tags:
    - xlwings
    - charts
    - 막대차트
    - 차트자동
    - 동적갱신
  seo:
    title: 음악 스트리밍 차트 자동 - xlwings sheet.charts.add
    description: 노래별 일일 스트리밍 수로 막대 차트를 코드로 자동 생성하고, 위치/크기/소스 영역까지 지정한 뒤 데이터가 바뀌면 자동 갱신한다.
    keywords:
      - xlwings
      - charts
      - 차트
      - bar
      - 스트리밍
intro:
  direction: 노래별 일일 스트리밍 수 데이터로 막대 차트를 코드로 자동 생성하고, 차트 종류·위치·크기를 지정한 뒤 데이터가 바뀌면 어떻게 갱신되는지 검증한다.
  benefits:
    - "sheet.charts.add()로 차트 객체를 만들고 set_source_data로 데이터 영역을 연결하는 패턴을 익힌다."
    - "차트 종류(bar_clustered, line, pie 등)와 위치/크기를 코드로 지정해 보고서 레이아웃을 자동화한다."
    - 스트리밍 수가 매일 바뀌어도 같은 차트가 새 값으로 갱신되는 방식을 확인한다.
    - 다음 레슨의 Excel 표(ListObject)와 차트의 결합으로 자연스럽게 이어진다.
  diagram:
    steps:
      - label: 1단계. 데이터 입력과 차트 생성
        detail: 노래별 일일 스트리밍 수를 시트에 쓰고 sheet.charts.add로 막대 차트를 추가한다.
      - label: 2단계. 차트 위치, 크기, 종류 지정
        detail: chart.set_source_data, chart.chart_type, chart.top/left/width/height를 설정한다.
      - label: 3단계. 데이터 변경 후 차트 갱신 확인
        detail: 노래 스트리밍 수를 바꾸고 차트가 자동으로 갱신되는지 read-back으로 확인한다.
      - label: 4단계. 실습
        detail: 일별 스트리밍 트렌드 라인 차트와 장르 점유율 파이 차트 두 시나리오를 만든다.
    runtime:
      - label: xlwings + pandas 확인
        detail: 두 패키지 모두 import 가능해야 한다.
      - label: 차트 종류 결정
        detail: 막대(bar_clustered), 선(line), 원형(pie) 중 시나리오에 맞는 것을 고른다.
      - label: 시각 검증
        detail: visible=True로 실행하면 차트가 실제 그려진 모양을 직접 본다.
sections:
  - id: add-chart
    title: 1단계. 차트 생성과 소스 데이터 연결
    structuredPrimary: true
    subtitle: sheet.charts.add + set_source_data
    goal: 노래별 스트리밍 데이터를 시트에 쓴 뒤 막대 차트를 추가하고 set_source_data로 데이터 영역을 연결한다.
    why: 자동화 차트의 핵심은 "데이터 영역을 코드가 정한다"는 점이다. 노래가 늘거나 줄어도 같은 코드가 동작한다.
    explanation: |-
      sheet.charts.add()는 빈 차트 객체를 시트에 추가합니다. 이 단계에서는 어떤 데이터를 그릴지 아직 모릅니다.
      chart.set_source_data(range)로 차트의 데이터 영역을 지정합니다. 보통 헤더를 포함한 전체 표 영역을 주면 Excel이 첫 행을 카테고리 라벨로, 첫 열을 X축 라벨로 자동 인식합니다.
      차트 객체에는 name, top, left, width, height 같은 속성이 있어서 위치와 크기를 코드로 제어할 수 있습니다.
    tips:
      - charts.add()는 기본 위치/크기로 차트를 만듭니다. 그 뒤에 위치/크기를 지정하는 게 안정적입니다.
      - set_source_data는 expand로 잡은 Range를 그대로 받습니다. 동적으로 표가 자라도 됩니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw

      streamDf = pd.DataFrame({
          "track": ["Dynamite", "Butter", "Permission to Dance", "My Universe", "Yet to Come"],
          "streams": [1240000, 1080000, 920000, 870000, 1150000],
      })

      with xw.App(visible=False) as cApp:
          cBook = cApp.books.add()
          cSheet = cBook.sheets.active
          cSheet.name = "streams"
          cSheet["A1"].options(index=False).value = streamDf

          sourceRange = cSheet["A1"].expand("table")
          chart = cSheet.charts.add()
          chart.set_source_data(sourceRange)
          chart.name = "trackBar"

          chartName = chart.name
          chartCount = len(cSheet.charts)

      assert chartName == "trackBar"
      assert chartCount == 1
      {"name": chartName, "count": chartCount}
    exercise:
      prompt: streamDf에 곡 한 개를 추가하고, 차트의 소스 범위가 expand로 자동 확장되어 6곡 데이터 모두 포함되는지 확인하세요.
      starterCode: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "track": ["Dynamite", "Butter", "Permission to Dance", "My Universe", "Yet to Come", "___"],
            "streams": [1240000, 1080000, 920000, 870000, 1150000, ___],
        })

        with xw.App(visible=False) as cApp:
            cBook = cApp.books.add()
            cSheet = cBook.sheets.active
            cSheet.name = "streams"
            cSheet["A1"].options(index=False).value = streamDf

            sourceRange = cSheet["A1"].expand("table")
            sourceRowCount = sourceRange.rows.count

            chart = cSheet.charts.add()
            chart.set_source_data(sourceRange)

        assert sourceRowCount == 7
        sourceRowCount
      solution: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "track": ["Dynamite", "Butter", "Permission to Dance", "My Universe", "Yet to Come", "Spring Day"],
            "streams": [1240000, 1080000, 920000, 870000, 1150000, 980000],
        })

        with xw.App(visible=False) as cApp:
            cBook = cApp.books.add()
            cSheet = cBook.sheets.active
            cSheet.name = "streams"
            cSheet["A1"].options(index=False).value = streamDf

            sourceRange = cSheet["A1"].expand("table")
            sourceRowCount = sourceRange.rows.count

            chart = cSheet.charts.add()
            chart.set_source_data(sourceRange)

        assert sourceRowCount == 7
        sourceRowCount
      hints:
        - 곡 추가 후 헤더 포함 7행이 됩니다.
        - expand("table")이 행 수를 자동 잡으므로 코드 수정 없이 차트가 새 곡을 포함합니다.
    check:
      noError: charts.add와 set_source_data가 AttributeError 없이 끝나야 합니다.
      resultCheck: 시트에 차트가 추가되었고 소스 영역의 행 수가 데이터 크기와 같아야 합니다.

  - id: chart-type-position
    title: 2단계. 차트 종류, 위치, 크기 지정
    structuredPrimary: true
    subtitle: chart_type, top/left/width/height
    goal: 차트 종류를 "column_clustered"(세로 막대)로 지정하고 위치와 크기를 코드로 정한다.
    why: 자동화 보고서의 시각 레이아웃은 차트 위치와 크기로 결정된다. 이를 코드로 잡으면 매번 같은 모양으로 산출된다.
    explanation: |-
      chart.chart_type은 차트 종류를 정합니다. "bar_clustered"(가로 막대), "line"(선), "pie"(원), "column_clustered"(세로 막대) 등이 자주 쓰입니다.
      위치는 chart.top(위에서 픽셀), chart.left(왼쪽에서 픽셀)로, 크기는 chart.width, chart.height로 정합니다. 단위는 픽셀입니다.
      이 값들을 잡지 않으면 Excel이 기본 위치와 크기로 차트를 만드는데, 자동화 보고서에서는 항상 명시적으로 정해야 결과가 일관됩니다.
    tips:
      - bar_clustered는 가로 막대, column_clustered는 세로 막대입니다. 한국어로는 둘 다 막대 그래프라고 부르니 헷갈리지 마세요.
      - top, left, width, height는 모두 픽셀 단위 숫자입니다. 100픽셀은 약 2.6cm입니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw

      streamDf = pd.DataFrame({
          "track": ["Dynamite", "Butter", "Permission to Dance", "My Universe", "Yet to Come"],
          "streams": [1240000, 1080000, 920000, 870000, 1150000],
      })

      with xw.App(visible=False) as tApp:
          tBook = tApp.books.add()
          tSheet = tBook.sheets.active
          tSheet.name = "streams"
          tSheet["A1"].options(index=False).value = streamDf

          chart = tSheet.charts.add(left=200, top=10, width=400, height=240)
          chart.set_source_data(tSheet["A1"].expand("table"))
          chart.chart_type = "column_clustered"
          chart.name = "trackBar"

          ctype = chart.chart_type
          dims = (chart.left, chart.top, chart.width, chart.height)

      assert ctype == "column_clustered"
      assert dims == (200, 10, 400, 240)
      {"type": ctype, "dims": dims}
    exercise:
      prompt: 차트 종류를 "line"(선 그래프)으로 바꾸고 크기를 (300, 180)으로 줄이세요. 일별 트렌드 라인을 보는 시나리오를 가정합니다.
      starterCode: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "day": ["월", "화", "수", "목", "금"],
            "streams": [1240000, 1080000, 1190000, 1320000, 1450000],
        })

        with xw.App(visible=False) as tApp:
            tBook = tApp.books.add()
            tSheet = tBook.sheets.active
            tSheet.name = "trend"
            tSheet["A1"].options(index=False).value = streamDf

            chart = tSheet.charts.add(left=200, top=10, width=___, height=___)
            chart.set_source_data(tSheet["A1"].expand("table"))
            chart.chart_type = "___"

            ctype = chart.chart_type
            size = (chart.width, chart.height)

        assert ctype == "line"
        assert size == (300, 180)
        {"type": ctype, "size": size}
      solution: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "day": ["월", "화", "수", "목", "금"],
            "streams": [1240000, 1080000, 1190000, 1320000, 1450000],
        })

        with xw.App(visible=False) as tApp:
            tBook = tApp.books.add()
            tSheet = tBook.sheets.active
            tSheet.name = "trend"
            tSheet["A1"].options(index=False).value = streamDf

            chart = tSheet.charts.add(left=200, top=10, width=300, height=180)
            chart.set_source_data(tSheet["A1"].expand("table"))
            chart.chart_type = "line"

            ctype = chart.chart_type
            size = (chart.width, chart.height)

        assert ctype == "line"
        assert size == (300, 180)
        {"type": ctype, "size": size}
      hints:
        - charts.add(left, top, width, height)로 처음부터 위치/크기를 줄 수 있습니다.
        - line은 선 그래프, pie는 원 그래프, column_clustered는 세로 막대 그래프입니다.
    check:
      noError: chart_type 대입과 dims 읽기가 ValueError 없이 끝나야 합니다.
      resultCheck: 차트의 type과 크기/위치가 지정한 값과 정확히 일치해야 합니다.

  - id: dynamic-update
    title: 3단계. 데이터 변경 후 차트 자동 갱신
    structuredPrimary: true
    subtitle: 셀 값을 바꾸면 차트가 따라온다
    goal: 시트의 노래 스트리밍 수를 변경하고 같은 차트가 새 값을 반영하는지 확인한다.
    why: 자동화 보고서는 매일 새 스트리밍 데이터로 갱신되어야 한다. 차트가 데이터 변경을 자동으로 따라오는 동작을 직접 확인해야 자신이 만든 자동화를 믿을 수 있다.
    explanation: |-
      Excel 차트는 set_source_data로 연결한 Range를 참조합니다. 그 Range 안의 셀 값을 바꾸면 차트가 즉시 새 값으로 다시 그려집니다.
      이 동작은 코드로 검증하기 어렵습니다. 차트 자체에는 "그려진 픽셀"이 노출되지 않기 때문입니다. 대신 시트의 셀 값을 바꾼 뒤 다시 읽어 의도한 대로 바뀌었는지 확인하고, 차트가 같은 Range를 참조하고 있다는 사실로 갱신을 보장합니다.
      더 엄격하게 검증하려면 visible=True로 띄워 직접 보거나 파일을 저장 후 열어 확인합니다.
    tips:
      - 자동화 코드에서는 차트가 갱신되었는지를 직접 검증하기보다 데이터 변경이 적용되었는지를 검증하면 충분합니다.
      - app.calculate()를 호출하면 수식과 차트 모두 명시적으로 다시 계산됩니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw

      streamDf = pd.DataFrame({
          "track": ["Dynamite", "Butter", "Permission to Dance"],
          "streams": [1240000, 1080000, 920000],
      })

      with xw.App(visible=False) as uApp:
          uBook = uApp.books.add()
          uSheet = uBook.sheets.active
          uSheet.name = "streams"
          uSheet["A1"].options(index=False).value = streamDf

          chart = uSheet.charts.add(left=200, top=10, width=320, height=200)
          chart.set_source_data(uSheet["A1"].expand("table"))
          chart.chart_type = "column_clustered"

          beforeValue = int(uSheet["B2"].value)
          uSheet["B2"].value = 2000000
          uApp.calculate()
          afterValue = int(uSheet["B2"].value)

      assert beforeValue == 1240000
      assert afterValue == 2000000
      {"before": beforeValue, "after": afterValue, "delta": afterValue - beforeValue}
    exercise:
      prompt: Dynamite와 Butter 두 곡의 스트리밍 수를 동시에 바꿔 두 번 갱신을 시뮬레이션하고, 각 변경 후 값을 확인하세요.
      starterCode: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "track": ["Dynamite", "Butter", "Permission to Dance"],
            "streams": [1240000, 1080000, 920000],
        })

        with xw.App(visible=False) as uApp:
            uBook = uApp.books.add()
            uSheet = uBook.sheets.active
            uSheet.name = "streams"
            uSheet["A1"].options(index=False).value = streamDf

            chart = uSheet.charts.add(left=200, top=10, width=320, height=200)
            chart.set_source_data(uSheet["A1"].expand("table"))
            chart.chart_type = "column_clustered"

            uSheet["B2"].value = ___
            uSheet["B3"].value = ___
            uApp.calculate()
            updatedValues = [int(uSheet[f"B{r}"].value) for r in range(2, 5)]

        assert updatedValues[0] == 2000000
        assert updatedValues[1] == 1800000
        updatedValues
      solution: |-
        import pandas as pd
        import xlwings as xw

        streamDf = pd.DataFrame({
            "track": ["Dynamite", "Butter", "Permission to Dance"],
            "streams": [1240000, 1080000, 920000],
        })

        with xw.App(visible=False) as uApp:
            uBook = uApp.books.add()
            uSheet = uBook.sheets.active
            uSheet.name = "streams"
            uSheet["A1"].options(index=False).value = streamDf

            chart = uSheet.charts.add(left=200, top=10, width=320, height=200)
            chart.set_source_data(uSheet["A1"].expand("table"))
            chart.chart_type = "column_clustered"

            uSheet["B2"].value = 2000000
            uSheet["B3"].value = 1800000
            uApp.calculate()
            updatedValues = [int(uSheet[f"B{r}"].value) for r in range(2, 5)]

        assert updatedValues[0] == 2000000
        assert updatedValues[1] == 1800000
        updatedValues
      hints:
        - 셀 값을 바꾸면 차트가 같은 Range를 참조하므로 자동으로 갱신됩니다.
        - app.calculate를 한 번 호출해 명시적으로 갱신 타이밍을 보장합니다.
    check:
      noError: 셀 값 변경과 calculate, 차트 접근이 AttributeError 없이 끝나야 합니다.
      resultCheck: 변경한 셀의 값이 새 숫자로 반영되어 있어야 합니다.

  - id: practice
    title: 4단계. 실습
    subtitle: 두 가지 시나리오 차트 자동 생성
    blocks:
      - type: text
        content: |-
          이번 두 미션은 차트 자동 생성을 두 가지 음악 시나리오에 적용합니다.
      - type: tip
        content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되어 있으므로 import문은 생략해도 됩니다.
      - type: expansion
        title: "미션1: 아티스트별 누적 청취 시간 가로 막대"
        blocks:
          - type: code
            title: 데이터 입력과 차트 추가
            content: |-
              import pandas as pd
              import xlwings as xw

              artistDf = pd.DataFrame({
                  "artist": ["BTS", "BLACKPINK", "TWICE", "IVE"],
                  "hoursListened": [482000, 396000, 318000, 274000],
              })

              with xw.App(visible=False) as aApp:
                  aBook = aApp.books.add()
                  aSheet = aBook.sheets.active
                  aSheet.name = "artist"
                  aSheet["A1"].options(index=False).value = artistDf

                  aChart = aSheet.charts.add(left=200, top=10, width=400, height=240)
                  aChart.set_source_data(aSheet["A1"].expand("table"))
                  aChart.chart_type = "bar_clustered"
                  aChart.name = "artistBar"

                  topArtist = artistDf.loc[artistDf["hoursListened"].idxmax(), "artist"]

              assert aChart.name == "artistBar"
              assert topArtist == "BTS"
              {"chart": aChart.name, "topArtist": topArtist}
      - type: expansion
        title: "미션2: 장르별 점유율 파이 차트"
        blocks:
          - type: code
            title: 데이터 입력과 파이 차트
            content: |-
              import pandas as pd
              import xlwings as xw

              genreDf = pd.DataFrame({
                  "genre": ["K-pop", "Hip-hop", "Ballad", "R&B", "Indie"],
                  "share": [38, 22, 18, 14, 8],
              })

              with xw.App(visible=False) as gApp:
                  gBook = gApp.books.add()
                  gSheet = gBook.sheets.active
                  gSheet.name = "share"
                  gSheet["A1"].options(index=False).value = genreDf

                  gChart = gSheet.charts.add(left=180, top=10, width=320, height=320)
                  gChart.set_source_data(gSheet["A1"].expand("table"))
                  gChart.chart_type = "pie"
                  gChart.name = "genreCake"

                  totalShare = sum(genreDf["share"])

              assert totalShare == 100
              {"chart": gChart.name, "totalShare": totalShare}

  - id: summary
    title: 정리
    subtitle: 차트 자동 생성과 갱신 감각
    blocks:
      - type: text
        content: |-
          이번 레슨에서 charts.add → set_source_data → chart_type/위치/크기 지정 → 데이터 변경 후 자동 갱신으로 이어지는 차트 자동화 패턴을 완성했습니다.
          다음 레슨에서는 Excel 표(ListObject)를 코드로 만들고, 표에 합계 행을 추가해 표 영역이 자라면 합계도 자동 따라오는 동적 합계 패턴을 다룹니다.
    goal: 차트 자동화 패턴을 한 번 완성한 채로 다음 레슨에 진입한다.
    why: 자동화 보고서의 시각 마감은 거의 항상 차트로 결정되므로 이 패턴이 자리잡아야 한다.
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
  - id: xlwings_06-chart-spec-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - add-chart
    - summary
    title: 막대차트의 데이터 범위와 시각 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 빈 범위·잘못된 축·읽히지 않는 제목을 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - chart source range가 실제 data range와 일치하는지 검사하세요.
    - 제목과 안정적인 pixel 크기를 artifact 계약에 넣으세요.
    exercise:
      prompt: audit_chart_spec(spec, available_ranges)를 완성하세요.
      starterCode: |-
        def audit_chart_spec(spec, available_ranges):
            raise NotImplementedError
      solution: |
        def audit_chart_spec(spec, available_ranges):
            failures = []
            if spec.get("sourceRange") not in available_ranges:
                failures.append("source")
            if spec.get("categoryColumn") == spec.get("valueColumn") or not spec.get("categoryColumn") or not spec.get("valueColumn"):
                failures.append("axes")
            if not str(spec.get("title", "")).strip():
                failures.append("title")
            width, height = spec.get("size", [0, 0])
            if width < 320 or height < 200:
                failures.append("size")
            return {"accepted": not failures, "failures": failures, "sourceRange": spec.get("sourceRange"), "size": [width, height]}
      hints: *id001
    check:
      id: python.xlwings.xlwings_06.chart-spec-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_06.chart-spec-audit.mastery.behavior.v1.fixture
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
        entry: audit_chart_spec
        cases:
        - id: accepts-readable-chart
          arguments:
          - value:
              sourceRange: A1:B5
              categoryColumn: A
              valueColumn: B
              title: 월별 매출
              size:
              - 640
              - 360
          - value:
            - A1:B5
          expectedReturn:
            accepted: true
            failures: []
            sourceRange: A1:B5
            size:
            - 640
            - 360
        - id: reports-source-and-axes
          arguments:
          - value:
              sourceRange: D1:E5
              categoryColumn: A
              valueColumn: A
              title: 차트
              size:
              - 640
              - 360
          - value:
            - A1:B5
          expectedReturn:
            accepted: false
            failures:
            - source
            - axes
            sourceRange: D1:E5
            size:
            - 640
            - 360
        - id: reports-title-and-size
          arguments:
          - value:
              sourceRange: A1:B5
              categoryColumn: A
              valueColumn: B
              title: ''
              size:
              - 200
              - 100
          - value:
            - A1:B5
          expectedReturn:
            accepted: false
            failures:
            - title
            - size
            sourceRange: A1:B5
            size:
            - 200
            - 100
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: xlwings_06-chart-render-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_06-chart-spec-audit-mastery
    title: 생성된 차트의 series와 범례 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 예상 series·category 수와 재개방 결과를 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - chart object 존재만 보지 말고 series 이름과 category 수를 검사하세요.
    - Local에서는 screenshot 또는 render evidence로 visibility를 확인하세요.
    exercise:
      prompt: reconcile_chart_render(expected, observed)를 완성하세요.
      starterCode: |-
        def reconcile_chart_render(expected, observed):
            raise NotImplementedError
      solution: |
        def reconcile_chart_render(expected, observed):
            failures = []
            missing_series = sorted(set(expected.get("series", [])) - set(observed.get("series", [])))
            extra_series = sorted(set(observed.get("series", [])) - set(expected.get("series", [])))
            if missing_series or extra_series:
                failures.append("series")
            if expected.get("categoryCount") != observed.get("categoryCount"):
                failures.append("categories")
            if not observed.get("visible", False):
                failures.append("visibility")
            return {"passed": not failures, "failures": failures, "missingSeries": missing_series, "extraSeries": extra_series, "expectedCategories": expected.get("categoryCount"), "observedCategories": observed.get("categoryCount")}
      hints: *id002
    check:
      id: python.xlwings.xlwings_06.chart-render-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_06.chart-render-reconciliation.transfer.behavior.v1.fixture
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
        entry: reconcile_chart_render
        cases:
        - id: accepts-visible-chart
          arguments:
          - value:
              series:
              - 매출
              categoryCount: 4
          - value:
              series:
              - 매출
              categoryCount: 4
              visible: true
          expectedReturn:
            passed: true
            failures: []
            missingSeries: []
            extraSeries: []
            expectedCategories: 4
            observedCategories: 4
        - id: reports-series
          arguments:
          - value:
              series:
              - 매출
              categoryCount: 4
          - value:
              series:
              - 비용
              categoryCount: 4
              visible: true
          expectedReturn:
            passed: false
            failures:
            - series
            missingSeries:
            - 매출
            extraSeries:
            - 비용
            expectedCategories: 4
            observedCategories: 4
        - id: reports-categories-and-visibility
          arguments:
          - value:
              series: []
              categoryCount: 4
          - value:
              series: []
              categoryCount: 3
              visible: false
          expectedReturn:
            passed: false
            failures:
            - categories
            - visibility
            missingSeries: []
            extraSeries: []
            expectedCategories: 4
            observedCategories: 3
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: xlwings_06-chart-automation-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_06-chart-render-reconciliation-transfer
    title: Excel 차트 자동화 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: source·semantic series·render 증거를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 Excel 자동화 판단을 작은 함수로 즉시 검증하세요.
    - Local에서는 실제 Excel 프로세스와 workbook artifact 증거를 별도로 남기세요.
    exercise:
      prompt: choose_chart_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_chart_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_chart_evidence(stage):
            table = {'source': {'action': 'pin source range and columns', 'evidence': 'chart spec', 'risk': 'wrong data'}, 'semantic': {'action': 'verify series and categories', 'evidence': 'reopened chart metadata', 'risk': 'misleading chart'}, 'render': {'action': 'inspect visible chart at stable size', 'evidence': 'render capture', 'risk': 'blank or clipped object'}}
            if stage not in table:
                raise ValueError('unknown stage')
            return table[stage]
      hints: *id003
    check:
      id: python.xlwings.xlwings_06.chart-automation-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_06.chart-automation-recall.retrieval.behavior.v1.fixture
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
        entry: choose_chart_evidence
        cases:
        - id: recalls-source
          arguments:
          - value: source
          expectedReturn:
            action: pin source range and columns
            evidence: chart spec
            risk: wrong data
        - id: recalls-semantic
          arguments:
          - value: semantic
          expectedReturn:
            action: verify series and categories
            evidence: reopened chart metadata
            risk: misleading chart
        - id: recalls-render
          arguments:
          - value: render
          expectedReturn:
            action: inspect visible chart at stable size
            evidence: render capture
            risk: blank or clipped object
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};